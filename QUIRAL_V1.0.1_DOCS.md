# QUIRAL POS v1.0.1 — Documentación Técnica de Arquitectura y Producción

**Versión:** 1.0.1 — Release Candidate  
**Estado:** Producción Validada  
**Fecha de corte:** Octubre 2026  

---

## 1. Visión General de la Arquitectura

Quiral POS es una Progressive Web App (PWA) de alto rendimiento para gestión comercial, inventario multi-lote y facturación en punto de venta. Su diseño combina los principios de **Apple Human Interface Guidelines (HIG)** con una arquitectura desacoplada y reactiva impulsada por **Supabase (PostgreSQL 15+)** y **React 18 con TypeScript estricto**.

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

La interfaz utiliza una estrategia adaptativa limpia gobernada en `App.tsx` que no duplica la lógica de negocio ni genera montajes redundantes:

1. **`AppInner` (`src/App.tsx`)**:
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

## 3. Flujo de Datos, Estado y Concurrencia

### Fuente de Verdad
La base de datos PostgreSQL en Supabase es la **única fuente de verdad** persistente. El estado de React en `InventoryContext` sirve como espejo reactivo sincronizado.

### Transacciones Comerciales Atómicas
Al completar una venta en `completeSale`:
1. Se valida que el carrito contenga unidades, que el total sea coherente ($0 \le \text{total} \le \text{subtotal}$) y que ningún lote supere el stock disponible.
2. Se genera el registro de la venta con snapshots de costo por lote y políticas de garantía.
3. Se aplica actualización reactiva inmediata en la interfaz.
4. Si la sesión está conectada a Supabase, se invoca la función RPC atómica `complete_sale(target_store, sale_id, sale_number, sale_created_at, sale_data, lines)` que descuenta el stock de los lotes en una transacción PostgreSQL `SERIALIZABLE` con reversión ante fallos.

### Sincronización Realtime
El canal `realtime:store:${storeId}` se suscribe a eventos `postgres_changes` filtrados por `store_id=eq.${storeId}` en 4 tablas:
- `products`: Los eventos `UPDATE` actualizan la entidad *in-place* sin desplazar el producto al inicio de la lista. `INSERT` prepende y `DELETE` remueve.
- `sales`: `INSERT` prepende la nueva venta en el historial y `UPDATE` refresca garantías o notas.
- `cycle_closings`: `INSERT` registra el nuevo arqueo y `UPDATE` sincroniza métricas.
- `suppliers`: `INSERT`, `UPDATE` y `DELETE` actualizan inmediatamente la paleta y catálogo sin exigir recarga manual.

---

## 4. Seguridad y Aislamiento Multi-Tenant

1. **Row Level Security (RLS)**:
   - Todo acceso en Supabase está condicionado a la función de seguridad `is_store_member(target_store)`, que valida que `auth.uid()` pertenezca a la tienda activa en `store_members`.
2. **Consultas filtradas por Tenant**:
   - Cada operación cliente incluye `.eq("store_id", storeId)`.
3. **Credenciales en Cliente**:
   - La aplicación utiliza exclusivamente la anon key pública de Supabase (`VITE_SUPABASE_ANON_KEY`) sujeta a RLS. No existen service role keys en el frontend.
4. **Modo Demo 30/30 Aislado**:
   - Cuenta de prueba pública con bypass de credenciales y sembrado de 4 meses de historial. Protegida con advertencias en consola y bloqueos de seguridad en edición de credenciales de usuario.

---

## 5. Sistema de Diseño y Tokens Apple HIG

- **Tipografía:** Pila nativa de Apple (`-apple-system, BlinkMacSystemFont, Segoe UI, Roboto...`).
- **Números tabulares:** `.tabular-nums` obligatorio en precios, stock y cifras monetarias.
- **Tokens Dual OLED:**
  - Modo Claro: Fondo primario `#f2f2f7`, Superficies elevadas `#ffffff`, Bordes `#e5e5ea`.
  - Modo Oscuro: Fondo primario `#000000` (OLED absoluto), Superficies `#141416`, Bordes `#262629`.
  - Acento: Azul de sistema iOS `#007aff` / `#0a84ff`.
  - Estados: Éxito `#30d158` / `#28cd41`, Alerta `#ff9500`, Peligro `#ff3b30`.
- **Transición de color instantánea:** `.transition-colors` anulada centralmente para evitar parpadeos blanco/negro en cambios de tema OLED.
- **Cabeceras sólidas:** Ausencia de `backdrop-blur` en vistas con scroll para prevenir artefactos gráficos de renderizado en WebKit Safari.

---

## 6. Convenciones de Formateo (`src/utils/formatters.ts`)

Todas las operaciones visuales de cifras y fechas pasan por formateadores centralizados:
- `formatCOP(value)`: Moneda colombiana con separador de miles por punto (`$35.000`).
- `parseCOPInput(raw)`: Extracción segura de dígitos enteros para cálculos financieros.
- `formatUnits(units)`: Representación compacta de existencias (`10 uds`).
- `formatProductCount(count)`: Cardinalidad en español (`1 producto`, `3 productos`).
- `formatShortDate(date)`: Fecha abreviada (`24 oct`).
- `formatFullDate(date)`: Fecha completa con año (`24 oct 2026`).
- `formatDateWithTime(date)`: Fecha con hora exacta de transacción.
- `getWarrantyStatus(date, days, claimed)`: Estado dinámico de garantía (`active`, `expired`, `claimed`).

---

## 7. Instrucciones Operativas

### Instalación de dependencias
```bash
npm install
```

### Ejecución en desarrollo
```bash
npm run dev
```

### Verificación de tipos TypeScript
```bash
npx tsc --noEmit
```

### Compilación para producción (Build)
```bash
npm run build
```
Genera los artefactos minificados en `dist/` divididos en chunks optimizados:
- `vendor-react` (~134 kB)
- `vendor-supabase` (~227 kB)
- `vendor-icons` (~23 kB)
- `index` (~141 kB)
Zero warnings de tamaño de chunk y código de salida `0`.

---

## 8. Limitaciones Técnicas Conocidas

1. **Modo Demo Público:** La cuenta `30/30` utiliza un bypass local intencional para auditoría comercial; debe desactivarse en despliegues cerrados de producción de un solo tenant.
2. **Validación en Hardware Físico iOS Standalone:** Las pruebas de `safe-area-inset` y gestos touch se validaron exhaustivamente en emuladores y navegadores basados en WebKit/Chromium; se recomienda prueba de campo final sobre dispositivo físico con Face ID (notch/isla dinámica).

