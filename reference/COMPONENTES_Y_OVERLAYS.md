# Componentes y overlays

## Componentes compartidos

`ui/kit.js` contiene `Tap`, `Glass`, `Card`, `Txt`, `Chip`, `ChipRow`, `Field`, `PriceInput`,
`PrimaryButton`, `BackButton`, `FadeIn`, `Sheet` y utilidades de formato. `ui/ProductList.js`
contiene `PageHeader`, `SearchHeader` y `ProductCard`. `DateField.js` contiene el selector
de fecha usado en resumen y cierre.

## Navegación y overlays

`DesktopSidebar` reemplaza `TabBar` desde 768 px. `TopMenu` concentra tema, proveedores y
cierre de sesión en móvil. `CheckoutSheet`, `ProductSheet`, `CreateSheet`, `SuppliersSheet`,
`TopSellersSheet` y `ClosureSheet` son hojas inferiores con backdrop, grabber, scroll y cierre.

## Reproducción web

En la PWA deben ser diálogos accesibles (`role=dialog`), con foco, scroll interno, bloqueo del
fondo solo mientras estén abiertos y soporte de safe-area. No copiar literalmente el `Modal`
nativo. Las alturas comprobadas son aproximadamente checkout dinámico, creación 0.94, producto
0.92, proveedores 0.90, rendimiento 0.92 y cierre 0.88 del viewport.
