-- =====================================================================
-- QUIRAL POS — ESQUEMA MULTI-TENANT CON RLS, CONCURRENCIA Y POBLADO 30/30
-- =====================================================================

create extension if not exists "pgcrypto";

-- 1. TABLA TIENDAS (ORGANIZACIONES / TENANTS)
create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Mi tienda',
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- 2. TABLA MIEMBROS DE TIENDA (COLABORACIÓN MULTIUSUARIO Y USERNAMES ÚNICOS)
create table if not exists public.store_members (
  store_id uuid not null references public.stores(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  username text not null,
  role text not null default 'owner' check (role in ('owner', 'staff')),
  primary key (store_id, user_id),
  unique (username),
  unique (store_id, username)
);

-- Migración segura si la tabla ya existía
alter table public.store_members add column if not exists username text;
update public.store_members set username = lower(split_part((select email from auth.users where id = store_members.user_id), '@', 1))
where username is null;
alter table public.store_members alter column username set not null;

-- 3. TABLA PROVEEDORES
create table if not exists public.suppliers (
  store_id uuid not null references public.stores(id) on delete cascade,
  id text not null,
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  updated_at timestamptz not null default now(),
  primary key (store_id, id)
);

-- 4. TABLA PRODUCTOS E INVENTARIO CON LOTES (BATCHES)
create table if not exists public.products (
  store_id uuid not null references public.stores(id) on delete cascade,
  id text not null,
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  updated_at timestamptz not null default now(),
  primary key (store_id, id)
);

-- 5. TABLA VENTAS CON SNAPSHOTS DE COSTO Y GARANTÍAS
create table if not exists public.sales (
  store_id uuid not null references public.stores(id) on delete cascade,
  id text not null,
  sale_number bigint not null,
  created_at timestamptz not null,
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  updated_at timestamptz not null default now(),
  primary key (store_id, id),
  unique (store_id, sale_number)
);

-- 6. TABLA CIERRES DE CICLO (ARQUEOS Y MÉTRICAS CONGELADAS)
create table if not exists public.cycle_closings (
  store_id uuid not null references public.stores(id) on delete cascade,
  id text not null,
  closed_at timestamptz not null,
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  updated_at timestamptz not null default now(),
  primary key (store_id, id)
);

-- =====================================================================
-- ÍNDICES ANTI-LAGUEO Y DE ACCESO RÁPIDO
-- =====================================================================
create index if not exists store_members_username_user_idx on public.store_members(username, user_id);
create index if not exists products_store_idx on public.products(store_id);
create index if not exists products_data_gin_idx on public.products using gin(data);
create index if not exists sales_store_created_idx on public.sales(store_id, created_at desc);
create index if not exists sales_data_gin_idx on public.sales using gin(data);
create index if not exists cycle_closings_store_created_idx on public.cycle_closings(store_id, closed_at desc);
create index if not exists cycle_closings_data_gin_idx on public.cycle_closings using gin(data);

-- =====================================================================
-- RLS (ROW LEVEL SECURITY) Y FUNCIONES DE ACCESO
-- =====================================================================
create or replace function public.is_store_member(target_store uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.store_members
    where store_id = target_store and user_id = auth.uid()
  );
$$;

revoke all on function public.is_store_member(uuid) from public;
grant execute on function public.is_store_member(uuid) to authenticated;

-- Resolución segura de email por username para el Login Dual
create or replace function public.get_email_by_username(input_username text)
returns text language sql stable security definer set search_path = public, auth as $$
  select u.email from auth.users u
  join public.store_members m on m.user_id = u.id
  where lower(m.username) = lower(trim(input_username))
  limit 1;
$$;

revoke all on function public.get_email_by_username(text) from public;
grant execute on function public.get_email_by_username(text) to anon, authenticated;

alter table public.stores enable row level security;
alter table public.store_members enable row level security;
alter table public.suppliers enable row level security;
alter table public.products enable row level security;
alter table public.sales enable row level security;
alter table public.cycle_closings enable row level security;

drop policy if exists "members can read their stores" on public.stores;
create policy "members can read their stores" on public.stores for select using (public.is_store_member(id));

drop policy if exists "members can read membership" on public.store_members;
create policy "members can read membership" on public.store_members for select using (user_id = auth.uid());

do $$
declare
  table_name text;
  tables text[] := array['suppliers', 'products', 'sales', 'cycle_closings'];
begin
  foreach table_name in array tables loop
    execute format('drop policy if exists "store members manage %1$s" on public.%1$s', table_name);
    execute format('create policy "store members manage %1$s" on public.%1$s for all using (public.is_store_member(store_id)) with check (public.is_store_member(store_id))', table_name);
  end loop;
end $$;

-- Trigger para registrar automáticamente la tienda y membresía tras registrar un usuario
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  new_store uuid;
  requested_store uuid;
  requested_username text;
begin
  requested_username := lower(trim(coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))));
  begin
    requested_store := (new.raw_user_meta_data->>'store_id')::uuid;
  exception when others then
    requested_store := null;
  end;

  if requested_store is not null and exists (select 1 from public.stores where id = requested_store) then
    insert into public.store_members(store_id, user_id, username, role)
    values (requested_store, new.id, requested_username, 'staff');
  else
    insert into public.stores(name, owner_id)
    values (coalesce(new.raw_user_meta_data->>'store_name', 'Mi tienda'), new.id)
    returning id into new_store;

    insert into public.store_members(store_id, user_id, username, role)
    values (new_store, new.id, requested_username, 'owner');
  end if;
  return new;
exception when unique_violation then
  raise exception 'El nombre de usuario ya está registrado';
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Actualización de credenciales con verificación
create or replace function public.update_my_credentials(current_password text, new_username text, new_password text default null)
returns void language plpgsql security definer set search_path = public, auth as $$
declare
  current_email text;
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Sesión requerida';
  end if;

  select email into current_email from auth.users where id = current_user_id;

  if not exists (select 1 from public.store_members where user_id = current_user_id) then
    raise exception 'Perfil de usuario no encontrado';
  end if;

  if new_username is not null and length(trim(new_username)) > 0 then
    update public.store_members
    set username = lower(trim(new_username))
    where user_id = current_user_id;
  end if;

  if new_password is not null and length(new_password) < 6 then
    raise exception 'La contraseña debe tener al menos 6 caracteres';
  end if;
end;
$$;

revoke all on function public.update_my_credentials(text, text, text) from public;
grant execute on function public.update_my_credentials(text, text, text) to authenticated;

-- =====================================================================
-- TRANSACCIÓN ATÓMICA DE VENTA CONCURRENTE (FOR UPDATE)
-- =====================================================================
create or replace function public.complete_sale(
  target_store uuid,
  sale_id text,
  sale_number bigint,
  sale_created_at timestamptz,
  sale_data jsonb,
  lines jsonb
) returns jsonb language plpgsql security invoker set search_path = public as $$
declare
  line jsonb;
  product_row jsonb;
  batch jsonb;
  product_id text;
  batch_id text;
  quantity integer;
begin
  if not public.is_store_member(target_store) then
    raise exception 'No autorizado en esta tienda';
  end if;

  for line in select * from jsonb_array_elements(lines) loop
    product_id := line->>'productId';
    batch_id := line->>'batchId';
    quantity := (line->>'quantity')::integer;

    if quantity is null or quantity <= 0 then
      raise exception 'Cantidad inválida para venta';
    end if;

    -- Bloqueo pesimista para evitar carreras en ventas concurrentes
    select data into product_row
    from public.products
    where store_id = target_store and id = product_id
    for update;

    if product_row is null then
      raise exception 'Producto no encontrado: %', product_id;
    end if;

    batch := (select value from jsonb_array_elements(product_row->'batches') value where value->>'id' = batch_id);

    if batch is null or coalesce((batch->>'stock')::integer, 0) < quantity then
      raise exception 'Stock insuficiente en el lote seleccionado de %', coalesce(product_row->>'name', product_id);
    end if;

    -- Descontar stock del lote de manera atómica
    product_row := jsonb_set(product_row, '{batches}', (
      select jsonb_agg(
        case when value->>'id' = batch_id
          then jsonb_set(value, '{stock}', to_jsonb((value->>'stock')::integer - quantity))
          else value
        end
      )
      from jsonb_array_elements(product_row->'batches') value
    ));

    update public.products
    set data = product_row, updated_at = now()
    where store_id = target_store and id = product_id;
  end loop;

  insert into public.sales(store_id, id, sale_number, created_at, data)
  values (target_store, sale_id, sale_number, sale_created_at, sale_data);

  return sale_data;
end;
$$;

revoke all on function public.complete_sale(uuid, text, bigint, timestamptz, jsonb, jsonb) from public;
grant execute on function public.complete_sale(uuid, text, bigint, timestamptz, jsonb, jsonb) to authenticated;

-- =====================================================================
-- POBLADO MASIVO DE 4 MESES DE OPERACIÓN REAL (DEMO 30 / 30)
-- =====================================================================
create or replace function public.seed_demo_store(p_store_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  supplier_names text[] := array[
    'Distribuidora Apple Miami',
    'Importadora Shenzhen Direct',
    'Mayorista Audio & Cases Cartagena',
    'Perfumería Árabe & Diseñador',
    'Anker Oficial Colombia',
    'Proveedora Digital Streaming'
  ];
  supplier_colors text[] := array[
    '#007AFF', '#AF52DE', '#28CD41', '#FF9500', '#5AC8FA', '#FF3B30'
  ];
  product_names text[] := array[
    'iPhone 15 Pro Max 256GB', 'iPhone 15 Pro 128GB', 'iPhone 14 Pro Max 256GB', 'iPhone 14 128GB',
    'iPhone 13 128GB', 'iPhone 12 64GB', 'iPhone 11 64GB', 'Samsung Galaxy S24 Ultra',
    'Cubo Cargador iPhone 20W Original', 'Cubo Anker 30W GaN', 'Cargador Doble USB-C 35W',
    'Cable USB-C a Lightning MFi 1m', 'Cable USB-C Trenzado 60W 2m', 'Batería MagSafe Apple', 'Cargador Inalámbrico MagSafe 15W',
    'AirPods Pro 2da Gen USB-C', 'AirPods 3ra Gen', 'EarPods Lightning', 'EarPods USB-C',
    'AirTag Individual', 'Pack x4 AirTags', 'Apple Pencil USB-C',
    'Vidrio Cerámico Privacidad iPhone 13/14/15/16 Pro Max', 'Case Silicona MagSafe Con Logo iPhone 15',
    'Case Silicona MagSafe Con Logo iPhone 14', 'Case Transparente MagSafe Anti-Amarilleo', 'Protector de Lentes Cámara Zafiro',
    'Sauvage Dior 100ml EDP', 'Bleu de Chanel 100ml', 'Lattafa Khamrah 100ml', 'Al Haramain Amber Oud', 'YSL Y EDP 100ml',
    'Cuenta Netflix 4K (Perfil 1 Mes)', 'Spotify Premium 3 Meses', 'Disney+ Estándar'
  ];
  customer_names text[] := array[
    'Santiago Restrepo', 'Cliente General', 'Ana Morales', 'Carlos Gómez', 'Laura Pérez',
    'Andrés Rodríguez', 'Valentina Ríos', 'Mateo Henao', 'Camila Ortiz', 'Felipe Castro',
    'Sofía Jaramillo', 'Daniela Ospina', 'Alejandro Quintero', 'Mariana Londoño', 'Sebastián Mejía'
  ];
  closure_labels text[] := array[
    '1 de jul. – 15 de jul. 2026', '16 de jul. – 31 de jul. 2026',
    '1 de ago. – 15 de ago. 2026', '16 de ago. – 31 de ago. 2026',
    '1 de sep. – 15 de sep. 2026', '16 de sep. – 30 de sep. 2026',
    '1 de oct. – 10 de oct. 2026', '11 de oct. – 20 de oct. 2026'
  ];
  closure_dates timestamptz[] := array[
    '2026-07-15 20:00:00-05'::timestamptz, '2026-07-31 20:00:00-05'::timestamptz,
    '2026-08-15 20:00:00-05'::timestamptz, '2026-08-31 20:00:00-05'::timestamptz,
    '2026-09-15 20:00:00-05'::timestamptz, '2026-09-30 20:00:00-05'::timestamptz,
    '2026-10-10 20:00:00-05'::timestamptz, '2026-10-20 20:00:00-05'::timestamptz
  ];
  supplier_ids text[] := array[]::text[];
  product_ids text[] := array[]::text[];
  p jsonb; s jsonb; i integer; sale_items jsonb; sale_data jsonb; sale_date timestamptz;
  price numeric; cost numeric; category text; subtitle text; is_warranty boolean;
  warranty_note text; p_idx integer; s_idx integer; is_recent boolean;
begin
  -- Idempotencia: Si ya hay productos, no duplicar
  if exists (select 1 from public.products where store_id = p_store_id) then
    return jsonb_build_object('seeded', false, 'reason', 'store_not_empty');
  end if;

  -- 1. Insertar 6 Proveedores Reales
  for i in 1..array_length(supplier_names, 1) loop
    supplier_ids := array_append(supplier_ids, 'demo-sup-' || i);
    s := jsonb_build_object(
      'id', 'demo-sup-' || i,
      'name', supplier_names[i],
      'phone', '+57 3' || (10 + i) || ' 555 ' || lpad((i * 123)::text, 4, '0'),
      'color', supplier_colors[i]
    );
    insert into public.suppliers(store_id, id, data) values (p_store_id, 'demo-sup-' || i, s);
  end loop;

  -- 2. Insertar Catálogo Extenso (35+ Productos con lotes y costos)
  for i in 1..array_length(product_names, 1) loop
    product_ids := array_append(product_ids, 'demo-prod-' || i);
    if i <= 8 then
      category := 'Celulares';
      price := 1800000 + i * 220000;
      cost := round(price * 0.72);
      subtitle := 'Equipo homologado libre';
    elsif i <= 15 then
      category := 'Cargadores y Cables';
      price := 45000 + (i - 8) * 12000;
      cost := round(price * 0.48);
      subtitle := 'Carga rápida certificada';
    elsif i <= 22 then
      category := 'Audio / AirPods';
      price := 65000 + (i - 15) * 55000;
      cost := round(price * 0.55);
      subtitle := 'Sonido de alta definición';
    elsif i <= 27 then
      category := 'Forros / Fundas';
      price := 25000 + (i - 22) * 8000;
      cost := round(price * 0.40);
      subtitle := 'Protección grado militar';
    elsif i <= 32 then
      category := 'Perfumes';
      price := 180000 + (i - 27) * 45000;
      cost := round(price * 0.60);
      subtitle := 'Fragancia original sellada';
    else
      category := 'Streaming';
      price := 28000 + (i - 32) * 11000;
      cost := round(price * 0.35);
      subtitle := 'Activación inmediata';
    end if;

    p := jsonb_build_object(
      'id', 'demo-prod-' || i,
      'name', product_names[i],
      'category', category,
      'subtitle', subtitle,
      'price', price,
      'warrantyDays', case when i <= 8 then 90 when i > 32 then 30 else 60 end,
      'createdAt', '2026-07-01T08:00:00Z',
      'batches', jsonb_build_array(
        jsonb_build_object(
          'id', 'demo-batch-' || i || '-a',
          'supplierId', supplier_ids[((i - 1) % 6) + 1],
          'cost', cost,
          'stock', case when i in (6, 19, 27) then 0 when i in (4, 8, 22) then 2 else 16 + (i % 9) end
        ),
        jsonb_build_object(
          'id', 'demo-batch-' || i || '-b',
          'supplierId', supplier_ids[(i % 6) + 1],
          'cost', round(cost * 1.05),
          'stock', case when i in (6, 19, 27) then 0 else 7 + (i % 6) end
        )
      )
    );
    insert into public.products(store_id, id, data) values (p_store_id, 'demo-prod-' || i, p);
  end loop;

  -- 3. Insertar 118 Ventas a lo largo de 4 meses (julio a octubre 2026)
  for i in 1..118 loop
    is_recent := (i >= 96); -- 23 ventas en el Ciclo Actual reciente (oct 20 a oct 24)

    if is_recent then
      -- Ventas recientes en Ciclo Actual
      sale_date := timestamptz '2026-10-21 09:15:00-05' + ((i - 96) * interval '3.5 hours') + ((i % 5) * interval '17 minutes');
    else
      -- Ventas distribuidas en los primeros meses
      sale_date := timestamptz '2026-07-01 10:00:00-05' + ((i - 1) * interval '28 hours') + ((i % 7) * interval '23 minutes');
    end if;

    p_idx := ((i - 1) % array_length(product_names, 1)) + 1;
    s_idx := ((i - 1) % array_length(customer_names, 1)) + 1;

    -- Casos de garantías reclamadas (10 casos en total)
    is_warranty := (i in (9, 21, 35, 48, 62, 77, 89, 102, 110, 115));
    warranty_note := case
      when is_warranty and i % 3 = 0 then 'Falla en conector de carga verificado en taller.'
      when is_warranty and i % 3 = 1 then 'Defecto de audio en auricular izquierdo.'
      when is_warranty then 'Botón lateral con respuesta intermitente.'
      else null
    end;

    sale_items := jsonb_build_array(
      jsonb_build_object(
        'id', 'demo-item-' || i || '-1',
        'productId', product_ids[p_idx],
        'productName', product_names[p_idx],
        'qty', 1 + (i % 2),
        'unitPrice', case when p_idx <= 8 then 2100000 else 55000 + (p_idx % 8) * 15000 end,
        'unitCostSnapshot', case when p_idx <= 8 then 1550000 else 32000 + (p_idx % 8) * 9000 end,
        'batchId', 'demo-batch-' || p_idx || '-a',
        'warrantyDays', case when p_idx <= 8 then 90 else 30 end,
        'warrantyClaimed', is_warranty,
        'warrantyClaimNote', warranty_note
      )
    );

    sale_data := jsonb_build_object(
      'id', 'demo-sale-' || i,
      'saleNumber', 1000 + i,
      'customerName', customer_names[s_idx],
      'note', case when i % 7 = 0 then 'Descuento cliente frecuente aplicado.' else null end,
      'paymentMethod', case when i % 3 = 0 then 'Nequi' when i % 3 = 1 then 'Efectivo' else 'Bancolombia' end,
      'totalAmount', (1 + (i % 2)) * (case when p_idx <= 8 then 2100000 else 55000 + (p_idx % 8) * 15000 end),
      'createdAt', sale_date,
      'items', sale_items
    );

    insert into public.sales(store_id, id, sale_number, created_at, data)
    values (p_store_id, 'demo-sale-' || i, 1000 + i, sale_date, sale_data);
  end loop;

  -- 4. Insertar 8 Cierres de Ciclo Históricos (julio a octubre 2026)
  for i in 1..8 loop
    insert into public.cycle_closings(store_id, id, closed_at, data)
    values (
      p_store_id,
      'demo-cycle-' || i,
      closure_dates[i],
      jsonb_build_object(
        'id', 'demo-cycle-' || i,
        'periodLabel', closure_labels[i],
        'closedAt', closure_dates[i],
        'totalSold', 2400000 + (i * 210000),
        'netProfit', 980000 + (i * 95000),
        'recoveredInvestment', 1420000 + (i * 115000),
        'remainingStockInvestment', 4850000 + (i * 40000),
        'expectedCash', 2400000 + (i * 210000),
        'realCashReported', 2400000 + (i * 210000) - ((i % 3) * 10000),
        'differenceNote', case when i % 2 = 0 then 'Arqueo exacto sin descuadre reportado.' else 'Diferencia menor de $10.000 por cambio en efectivo.' end,
        'topSellers', jsonb_build_array(
          jsonb_build_object('id', product_ids[((i - 1) % 15) + 1], 'name', product_names[((i - 1) % 15) + 1], 'qty', 10 + i, 'revenue', 650000 + i * 25000, 'profit', 280000 + i * 14000),
          jsonb_build_object('id', product_ids[((i + 3) % 15) + 1], 'name', product_names[((i + 3) % 15) + 1], 'qty', 7 + i, 'revenue', 480000 + i * 18000, 'profit', 190000 + i * 11000)
        ),
        'topReturned', case when i % 2 = 0 then jsonb_build_array(
          jsonb_build_object('id', product_ids[9], 'name', product_names[9], 'qty', 1, 'notes', jsonb_build_array('Cambio inmediato de cable por garantía.'))
        ) else jsonb_build_array() end
      )
    );
  end loop;

  return jsonb_build_object(
    'seeded', true,
    'suppliers', array_length(supplier_names, 1),
    'products', array_length(product_names, 1),
    'sales', 118,
    'closures', 8
  );
end;
$$;

revoke all on function public.seed_demo_store(uuid) from public;
grant execute on function public.seed_demo_store(uuid) to authenticated;

-- =====================================================================
-- PUBLICACIÓN DE REALTIME PARA SINCRONIZACIÓN MULTIDISPOSITIVO
-- =====================================================================
do $$
begin
  alter publication supabase_realtime add table public.suppliers;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.products;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.sales;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.cycle_closings;
exception when duplicate_object then null;
end $$;
