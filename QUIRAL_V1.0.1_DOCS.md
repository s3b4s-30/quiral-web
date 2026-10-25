# QUIRAL POS v1.0.1 — Documentación Técnica de Arquitectura y Producción

**Versión:** 1.0.1 — Producción / Release Candidate  
**Stack Principal:** React 18 · TypeScript Estricto · Vite 6 · Tailwind CSS 3 · Supabase (PostgreSQL 15+)  
**Filosofía Visual:** Apple Human Interface Guidelines (HIG) & Dual OLED Nativo  
**Documentos Complementarios:** [`AGENTS.md`](./AGENTS.md) (Gobernanza) · [`DESIGN_GUIDELINES.md`](./DESIGN_GUIDELINES.md) (Sistema de Diseño) · [`SKILLS_INDEX.md`](./.agents/SKILLS_INDEX.md) (Ecosistema de Habilidades)

---

## 1. Visión General de la Arquitectura

Quiral POS es una Progressive Web App (PWA) de alto rendimiento diseñada para la administración de inventario multi-lote, facturación en punto de venta (POS) y arqueo de caja con soporte multi-tienda (multi-tenant) sobre Supabase.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        QUIRAL POS CLIENT (PWA)                         │
├───────────────────────────────────┬────────────────────────────────────┤
│         Vistas Móviles (<768px)   │     Entorno Escritorio (>=768px)   │
│  - Barra Flotante Liquid Glass    │  - DesktopSidebar (macOS HIG)      │
│  - Catálogo 1 Columna Ergonómico  │  - Catálogo 2 Columnas Expandido   │
│  - Bottom Sheets con Gestos Touch │  - Modales Centrados con Teclado   │
├───────────────────────────────────┴────────────────────────────────────┤
│                       ESTADO GLOBAL & DOMINIO                          │
│     InventoryContext (useInventory) + Formatters + Domain Types        │
├───────────────────────────────────┬────────────────────────────────────┤
│         Caché & Optimismo         │      Sincronización en Vivo        │
│  - LocalStorage Sesión & Demo     │  - Canales Realtime postgres_changes│
│  - Transacciones Atómicas RPC     │  - Resync Automático en Re-auth   │
└───────────────────────────────────┴────────────────────────────────────┘
                                     │ (HTTPS / WSS)
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    SUPABASE / POSTGRESQL BACKEND                       │
│  - Row Level Security (RLS) basado en `store_id`                       │
│  - Tablas: stores, store_members, suppliers, products, sales, closings  │
│  - RPC Atómico: complete_sale(), seed_demo_store()                     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Jerarquía de Componentes y Estrategia Adaptativa

La interfaz utiliza una estrategia adaptativa limpia gobernada en `App.tsx` que no duplica lógica de negocio ni genera montajes redundantes:

1. **Orquestador Raíz (`AppInner` en `src/App.tsx`)**:
   - Coordina la autenticación mediante `AuthScreen` y el perfil del usuario.
   - Aplica el tema visual dual OLED (`dark` / `light` / `auto`) y sincroniza el meta tag `theme-color` de iOS Safari y standalone PWA.
   - Gobierna la navegación entre pestañas: `inventory`, `sell`, `history` y `summary`.
   - Controla el desmontaje dinámico de la `Navbar` y `FloatingCartFAB` cuando existen modales activos (`!hasActiveModal`) para evitar colisiones de contexto de apilamiento (*stacking context*).

2. **Navegación Desktop (`DesktopSidebar.tsx`)**:
   - En pantallas `>= 768px` (`md:flex`), el sidebar vertical se despliega en el lateral izquierdo (`w-64`).
   - Muestra identidad de tienda, navegación entre las 4 vistas con badges reactivos de carrito, alternador rápido de tema, switch de *Modo Administrador*, y accesos a proveedores y seguridad.
   - En pantallas móviles (`< 768px`), permanece oculto (`hidden md:flex`).

3. **Navegación Móvil (`Navbar.tsx` & `FloatingCartFAB.tsx`)**:
   - En pantallas móviles, se utiliza la barra de navegación flotante inferior con superficie ultratranslúcida (*Liquid Glass*) respetando `env(safe-area-inset-bottom)`.
   - Permanece oculta en pantallas de escritorio (`md:hidden`).

4. **Cabecera Fija Nativa (`TopHeader.tsx`)**:
   - 100% sólida (sin blur), anclada en `fixed top-0`, respetando `env(safe-area-inset-top)` mediante `.quiral-top-header`.
   - En escritorio (`md:left-64`), ajusta su offset lateral para convivir fluidamente con el `DesktopSidebar`.
   - En móvil, se expande a lo ancho de la pantalla (`left-0 right-0`).

5. **Modales y Hojas Flotantes (`ModalSheet.tsx`)**:
   - Todos los modales secundarios (`NewProductModal`, `ProductDetailModal`, `CheckoutSheet`, `ProfileSecurityModal`, `CycleClosingModal`, `SalesPerformanceModal` y `SuppliersModal`) estandarizan su comportamiento sobre `ModalSheet`.
   - Soporte nativo de arrastre hacia abajo (*swipe-to-dismiss*) con inercia elástica, bloqueo y restauración de scroll en `document.body`, cierre con tecla Escape y footer persistente pegado a la safe-area inferior.

---

## 3. Modelo de Datos y Esquema Supabase (PostgreSQL 15+)

### Tablas Principales
- **`stores`**: Entidad tenant (`id UUID`, `name TEXT`, `slug TEXT`, `owner_id UUID`, `created_at TIMESTAMPTZ`).
- **`store_members`**: Relación usuario-tienda (`store_id UUID`, `user_id UUID`, `role TEXT`).
- **`suppliers`**: Proveedores (`id UUID`, `store_id UUID`, `name TEXT`, `color TEXT`).
- **`products`**: Catálogo de productos (`id UUID`, `store_id UUID`, `name TEXT`, `category TEXT`, `price NUMERIC`, `warranty_days INT`, `batches JSONB[]`, `created_at TIMESTAMPTZ`).
- **`sales`**: Historial de transacciones comerciales (`id UUID`, `store_id UUID`, `sale_number INT`, `customer_name TEXT`, `payment_method TEXT`, `total_amount NUMERIC`, `items JSONB`, `created_at TIMESTAMPTZ`).
- **`cycle_closings`**: Arqueos de caja y congelación de métricas de ciclo (`id UUID`, `store_id UUID`, `period_label TEXT`, `total_sold NUMERIC`, `net_profit NUMERIC`, `difference_note TEXT`, `closed_at TIMESTAMPTZ`).

### Políticas de Seguridad (Row Level Security - RLS)
Todo acceso en Supabase está condicionado a la función de seguridad:
```sql
CREATE OR REPLACE FUNCTION is_store_member(target_store UUID)
RETURNS BOOLEAN SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM store_members
    WHERE store_id = target_store AND user_id = auth.uid()
  );
$$ LANGUAGE sql;
```
Cada operación en el cliente incluye `.eq("store_id", storeId)`, garantizando un aislamiento estricto entre tiendas.

### Procedimientos Almacenados (RPC)
- **`complete_sale(target_store, sale_id, sale_number, sale_created_at, sale_data, lines)`**:
  Ejecuta una transacción comercial atómica con nivel de aislamiento `SERIALIZABLE`. Descuenta el stock de cada lote específico en `products.batches`, inserta el registro en `sales` y revierte la operación por completo si algún lote carece de inventario suficiente.
- **`seed_demo_store(target_store, target_user)`**:
  Puebla de forma idempotente una tienda con catálogo base de tecnología, lotes por proveedor y 4 meses de historial para el modo demostración.

---

## 4. Estado Global, Sincronización Realtime y Mutaciones

### Fuente Única de Verdad
La base de datos PostgreSQL en Supabase es la **única fuente de verdad** persistente. El estado de React en `InventoryContext` actúa como espejo reactivo optimista.

### Sincronización Realtime Multicanal
El canal `realtime:store:${storeId}` se suscribe a eventos `postgres_changes` filtrados por `store_id=eq.${storeId}` en 4 tablas:
- **`products`**: Eventos `UPDATE` actualizan el producto *in-place* conservando el orden de la lista. `INSERT` añade al inicio y `DELETE` remueve.
- **`sales`**: `INSERT` prepende la nueva venta en el historial y `UPDATE` refresca estados de garantía o notas.
- **`cycle_closings`**: `INSERT` registra el nuevo arqueo y `UPDATE` sincroniza métricas.
- **`suppliers`**: `INSERT`, `UPDATE` y `DELETE` actualizan inmediatamente la paleta y catálogo sin requerir recarga manual.

### Modo Demo Público (30/30)
Para pruebas inmediatas sin credenciales, existe un modo demo con credenciales públicas y persistencia local protegida que no interfiere con tenants de producción.

---

## 5. Lógica de Negocio Multi-Lote y Control de Stock

1. **Regla de Existencias Totales:**
   Las existencias totales de un producto (`product.stock`) son el resultado determinista de la suma de sus lotes activos (`product.batches.reduce((sum, b) => sum + b.stock, 0)`). Queda prohibido desfasar el stock maestro de sus lotes.
2. **Balanceo de Ajuste Maestro (`adjustMasterStock`):**
   - **Incremento (+1):** Suma la unidad al lote con mayor cantidad de existencias.
   - **Decremento (-1):** Resta la unidad del lote con mayor inventario disponible, impidiendo saldos negativos.
3. **Validación Comercial del Carrito:**
   - La cantidad seleccionada por producto no puede exceder el stock del lote asignado.
   - El valor total a cobrar debe cumplir: $0 \le \text{total} \le \text{subtotal}$.
   - Cada producto en venta preserva un snapshot del costo unitario (`unitCostSnapshot`) y días de garantía para cálculos históricos inmutables.

---

## 6. Convenciones de Formateo Centralizadas (`src/utils/formatters.ts`)

Todas las salidas numéricas y temporales pasan por los formateadores globales:
- `formatCOP(value)`: Moneda colombiana con separador de miles por punto (`$35.000 COP`).
- `parseCOPInput(raw)`: Extracción segura de dígitos enteros para cálculos financieros.
- `formatUnits(units)`: Formateo abreviado de existencias (`10 uds`).
- `formatProductCount(count)`: Cardinalidad en español (`1 producto`, `3 productos`).
- `formatShortDate(date)`: Fecha abreviada (`24 oct`).
- `formatFullDate(date)`: Fecha completa con año (`24 oct 2026`).
- `formatDateWithTime(date)`: Fecha con hora exacta de transacción.
- `getWarrantyStatus(date, days, claimed)`: Estado reactivo de garantía (`active`, `expired`, `claimed`).

---

## 7. Arquitectura Responsive, Control de Overflow y Sistema Anti-Colisión Flotante

### 7.1. Escala Tipográfica Fluida para Cifras de 9–10 Dígitos
Para evitar desbordamientos horizontales de cifras de millones de pesos colombianos (`$100.000.000` a `$1.500.000.000`) en pantallas estrechas (320px–375px):
- **Tarjetas de Producto (`ProductCard.tsx` / `PosProductCard.tsx`)**: Precio unitario con escala `text-sm sm:text-base md:text-lg font-extrabold whitespace-nowrap`, reservando `max-w-[55%]` y forzando `min-w-0 flex-1 truncate` en el nombre del producto. La fila inferior de costos y utilidades adopta `flex-wrap items-center justify-between gap-2` con `text-[11px] sm:text-xs`, evitando el ensanchamiento no controlado de las tarjetas.
- **Tarjetas de Resumen Financiero (`SummaryView.tsx`)**: Grilla adaptada a `grid-cols-1 min-[360px]:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3` con tipografía `text-lg sm:text-xl md:text-2xl font-bold tabular-nums tracking-tight truncate`.
- **Historial de Ventas (`HistoryView.tsx`)**: Cifras de venta principal en `text-sm sm:text-base md:text-lg font-extrabold tabular-nums` y fila de reclamo de garantía con `flex-wrap gap-2`.
- **Modales de Cierre y Desempeño (`CycleClosingModal.tsx`, `SalesPerformanceModal.tsx`, `CheckoutSheet.tsx`)**: Cifras y comparativas de margen con `flex-wrap gap-1.5` y escala responsive que impide el solapamiento o desborde en hojas flotantes.

### 7.2. Margen Inferior Anti-Colisión y Contenedores de Scroll
La presencia simultánea de la barra de navegación flotante (`Navbar`), el botón de carrito flotante (`FloatingCartFAB`), y la barra de checkout (`CartSummaryBar`) requería un protocolo de espaciado estricto:
- **`PosView`**: Espaciado dinámico `${cartUnits > 0 ? "pb-44 sm:pb-36" : "pb-32"}` (evitando que `CartSummaryBar` tape las últimas tarjetas de venta cuando hay unidades, y despejando el FAB y la Navbar cuando está vacío).
- **`InventoryView` & `HistoryView` & `SummaryView`**: Espaciado inferior de lista estandarizado en `pb-32` (8rem).
- **`FloatingCartFAB`**: Ubicación en `right-3 min-[380px]:right-4 bottom-[calc(5.75rem+env(safe-area-inset-bottom,0px))]`, adaptándose a dispositivos móviles de cualquier ancho.
- **`.quiral-scroll-container` (`src/index.css`)**: Regla adaptativa en `@media (min-width: 768px)` que define `padding-bottom: 2rem`, eliminando el vacío innecesario en pantallas de escritorio sin barra inferior.

---

## 8. Pipeline de Compilación y Optimización de Paquetes

La compilación utiliza Vite 6 con Rollup optimizado mediante particionamiento manual de módulos (`manualChunks`) en `vite.config.js` y `vite.config.ts`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-icons': ['lucide-react']
        }
      }
    }
  }
})
```

### Distribución de Chunks en Producción
- `vendor-supabase`: ~227 kB (librería de base de datos y realtime).
- `vendor-react`: ~134 kB (núcleo de React y ReactDOM).
- `vendor-icons`: ~23 kB (paquete de iconografía Lucide).
- `index`: ~143 kB (código fuente de la aplicación empaquetado).
- **Resultado:** Cero advertencias de tamaño de chunk y tiempo de carga sub-segundo en conexiones móviles 4G.

---

## 9. Runbooks Operativos

### Desarrollo Local
```bash
npm install
npm run dev
```

### Verificación de Tipos TypeScript Estricto
```bash
npx tsc --noEmit
```

### Compilación para Producción (Build)
```bash
npm run build
```

---

## 10. Limitaciones Técnicas y Recomendaciones de Despliegue

1. **Modo Demo Público:** El bypass de credenciales `30/30` es para evaluación comercial rápida; debe deshabilitarse en despliegues monotienda de producción cerrada mediante variable de entorno.
2. **Validación en Dispositivos iOS Físicos:** Se recomienda verificar visualmente la distancia con la barra de inicio (*Home Indicator*) en modelos con Dynamic Island o Notch para validar que la safe area coincida exactamente con las directrices HIG.
