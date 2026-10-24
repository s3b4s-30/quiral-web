# Prompt maestro para reconstruir Quiral en web

Trabaja en `C:\Users\Sebas\Desktop\elytras\web prueba\`. El origen de referencia, solo lectura, es `C:\Users\Sebas\Desktop\elytras-quiral\universal\`. No modifiques ni ejecutes migraciones en el origen. Conserva React, TypeScript, Vite, Tailwind CSS 4 y `vite-plugin-pwa`; no migres a Expo.

Lee antes de editar, en este orden relativo a `C:\Users\Sebas\Desktop\QUIRAL_TRANSFERENCIA_VISUAL\`: `01_ARQUITECTURA_VISUAL_ORIGEN.md`, `02_DESIGN_SYSTEM_EXACTO.md`, `03_ESPECIFICACION_PANTALLAS.md`, `04_COMPONENTES_Y_OVERLAYS.md`, `05_RESPONSIVE_IOS_Y_ESCRITORIO.md`, `06_INTERACCIONES_VISIBLES.md`, `07_MAPA_ORIGEN_DESTINO.md`, `08_PLAN_PRIORIZADO_DE_RECONSTRUCCION.md` y `09_LIMITACIONES_Y_VERIFICACION.md`.

## Objetivo

Reconstruye la interfaz activa universal de Quiral, no una aproximación genérica: Auth, Resumen, Vender, Inventario e Historial, con el mismo orden visual, colores, densidad, iconos Ionicon-equivalentes, estados, carrito, lotes, garantías, cierres y sheets. Usa `02` como fuente exacta de tokens y `03`/`04` como contrato de pantallas.

## Seguridad y datos

No uses `src/utils/mocks.ts` ni `store-demo` en runtime autenticado. Implementa Auth/guardia antes de montar vistas. Crea un repositorio en `src/lib/supabase/` con variables públicas `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` únicamente. Cada lectura/mutación de datos de tienda exige `store_id` y RLS; la caché debe estar aislada por tenant y limpiarse al cerrar sesión. Errores deben tener estado visible, nunca fallback de éxito.

## Implementación visual

Usa variables CSS para `#000000/#F2F2F7`, tarjetas `#1C1C1E/#FFFFFF`, secundaria `#2C2C2E/#E5E5EA`, azul `#0A84FF/#007AFF`, verde, naranja y rojo de `02`. Aplica `tabular-nums` a precios, cantidades y números. Mantén `100dvh`, `viewport-fit=cover`, safe areas, inputs de 16 px y controles táctiles ≥44 px. Móvil es `<768` con TabBar y FAB/carrito; desktop es `>=768` con sidebar y POS dividido. No introduzcas scroll horizontal accidental.

Implementa primero `App.tsx`, `types/domain.ts`, `contexts/POSStoreContext.tsx`, `contexts/ThemeContext.tsx`, `lib/supabase/*` y `index.css`; después `PosView.tsx`, `InventoryView.tsx`, `HistoryView.tsx`, `SummaryView.tsx`; finalmente sheets, overlays y pulido. Reutiliza `AppShell`, `TopBar`, `MobileTabBar`, `DesktopSidebar`, `SplitPosLayout` solo si sus props y estados pueden alinearse sin romperlos.

## Comportamiento obligatorio

- POS filtra, añade hasta stock, selecciona lote/proveedor, permite precio unitario y descuento global acotado, y completa venta.
- Completar venta descuenta stock y lotes, conserva costo snapshot, vacía carrito y crea historial.
- Inventario permite costos, ajustes, lotes, creación, detalle, limpieza y proveedores.
- Historial expande ventas y reclama/revierte garantía por ítem.
- Resumen calcula métricas y ciclos desde datos, sin fechas/cifras hardcodeadas.
- Sheets deben tener backdrop, cierre, `role=dialog`, focus/keyboard, max-height, scroll interno y safe-area.

## Verificación

Ejecuta `npm run build` y `npm run lint`. Comprueba Auth sin sesión, dos tenants aislados, venta→stock→historial→garantía→cierre, estados vacíos/error/loading y tema claro/oscuro. Captura destino en 390×844, 320×700, 375×812, 768×1024 y 1440×900; compara con los valores de `02` y las capturas existentes de Auth. Prueba Safari iOS/PWA, teclado, orientación y final del scroll. No declares equivalencia sin evidencia.

Al finalizar reporta archivos modificados, pruebas ejecutadas, capturas, diferencias restantes y cualquier limitación. No modifiques el origen.
