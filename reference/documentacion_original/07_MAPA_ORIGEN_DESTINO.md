# Mapa origen-destino

| Prioridad | Origen | Destino actual | Diferencia verificada | Cambio |
|---|---|---|---|---|
| P0 | `App.js` Root/Auth | `src/App.tsx` | destino monta app sin sesión | crear Auth/guardia y estado de carga |
| P0 | `SupabasePOSRepository.js` | `src/lib/supabase/.gitkeep` | no cliente/repositorio | integrar cliente público y filtros tenant |
| P0 | `usePOSStore.js` | `POSStoreContext.tsx` | mocks + localStorage global | adaptar estado, cache y limpieza por tenant |
| P0 | `theme.js` | `index.css` | destino aproxima tokens | centralizar variables exactas por tema |
| P0 | `Shell`/`TabBar`/Sidebar | `AppShell`, tabs/sidebar | concepto similar, modelos distintos | conservar shell y alinear estados/medidas |
| P1 | `POSScreen`/`CheckoutSheet` | `PosView` | checkout local; transferencia extra | reproducir lotes, métodos y descuento |
| P1 | `InventarioScreen` + sheets | `InventoryView` | edición/alta incompleta | construir sheets y operaciones reales |
| P1 | `HistorialScreen` | `HistoryView` | reclamo por venta en localStorage | estado por ítem y repositorio |
| P1 | `ResumenScreen` | `SummaryView` | cifras estáticas/turno local | cálculos por ventas/ciclos |
| P2 | `ProductList.js` | `PosView`/`InventoryView` | iconos y campos HTML propios | mapear SVG a Ionicon-equivalentes |
| P2 | `Sheet` | `modal-backdrop`/cart sheet | no reproduce gesto/altura original | overlay tipado, focus, safe area |
| P3 | `FadeIn`/`Tap` | CSS actual | animación distinta/no confirmada | añadir solo tras validar rendimiento |

## Archivos del destino candidatos

`src/App.tsx`, `src/index.css`, `src/contexts/POSStoreContext.tsx`, `src/contexts/ThemeContext.tsx`, `src/types/domain.ts`, `src/views/SummaryView.tsx`, `PosView.tsx`, `InventoryView.tsx`, `HistoryView.tsx`, `src/components/layout/AppShell.tsx`, `TopBar.tsx`, `MobileTabBar.tsx`, `DesktopSidebar.tsx`, `SplitPosLayout.tsx`, `src/lib/supabase/` y nuevos componentes de diálogo/sheet.

## Nota sobre documentación del destino

`MASTER_SPEC.md` y `docs/QUIRAL_UI_UX_SPECIFICATION.md` son especificaciones del prototipo web, no pruebas de que el original se vea así. En particular, recomiendan barra sólida sin blur, mientras el kit original sí define `Glass`; la implementación debe decidir con captura/criterio explícito.
