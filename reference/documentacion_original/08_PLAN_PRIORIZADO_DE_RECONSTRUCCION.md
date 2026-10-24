# Plan priorizado

## P0 — estructura y seguridad visual

1. Crear Auth y splash en `App.tsx`; no montar POS sin sesión.
2. Crear tipos/adaptadores que traduzcan camelCase del universal a nombres TypeScript del destino.
3. Crear `src/lib/supabase/` con cliente usando solo variables públicas; resolver tenant y filtrar cada tabla por `store_id`.
4. Rehacer store con estados `loading`, `ready`, `error`, cache separada y clear-on-signout.
5. Centralizar tokens exactos y layout `100dvh`/safe-area.

**Aceptación:** una sesión falsa/no existente nunca ve catálogo; dos tenants no comparten datos; build/lint pasan.

## P1 — pantallas principales

1. POS: catálogo, búsqueda/chips, tarjeta, carrito, checkout, lotes, descuento y venta.
2. Inventario: productos, costos, stock, lotes, crear/editar/eliminar, proveedores.
3. Historial: expansión, garantía por ítem y estados.
4. Resumen: métricas, rendimiento, cierres y hojas.

**Aceptación:** flujo venta → descuento → stock/lotes → historial funciona con datos reales del store.

## P2 — overlays y comportamiento

Implementar sheets con altura, backdrop, cierre, foco, scroll interno, teclado, safe-area y animación discreta. Añadir confirmaciones accesibles y estados vacíos/error/loading iguales al copy original.

## P3 — pulido

Iconos equivalentes, tabular nums, radios/bordes, microanimación, colores de proveedor, truncamiento y comparación visual.

## Orden de validación

`npm run build`; `npm run lint`; pruebas de store; pruebas de Auth/RLS; screenshots en 390×844, 320×700, 375×812, 768×1024 y 1440×900; revisión de teclado, orientación y standalone Safari. No marcar una diferencia como resuelta sin captura o medición.
