# Quiral — Especificación visual basada en evidencia

## Tokens confirmados

Fuente: `universal/src/theme.js`, `universal/src/ui/kit.js`, `universal/src/ui/ProductList.js` y `universal/src/layout.js`.

### Oscuro (predeterminado del repositorio)

`bg #000000`, tarjeta `#1C1C1E`, secundaria `#2C2C2E`, glass `rgba(28,28,30,.55)`, borde `rgba(255,255,255,.12)`, hairline `.08`, texto `#FFFFFF`, texto secundario `rgba(235,235,245,.62)`, terciario `.32`, azul `#0A84FF`, verde `#30D158`, rojo `#FF453A`, naranja `#FF9F0A`.

### Claro

`bg #F2F2F7`, tarjeta `#FFFFFF`, secundaria `#E5E5EA`, glass `rgba(255,255,255,.6)`, borde `rgba(0,0,0,.10)`, hairline `rgba(60,60,67,.12)`, texto `#000000`, secundario `.68`, terciario `.3`, azul `#007AFF`, verde `#34C759`, rojo `#FF3B30`, naranja `#FF9500`.

### Dimensiones y tipografía observadas

- Sistema sans del dispositivo; pesos 600–800 para títulos y cifras.
- `PageHeader` título 28 px/peso 800, padding horizontal 20, alto mínimo 48.
- Campo de búsqueda mínimo 44 px, radio 14, margen horizontal 16, texto 16.
- Tarjetas de producto: padding 14, margen horizontal 16 y margen inferior 10, radio definido por `Card` (verificar si se cambia el kit antes de implementar).
- Tab bar: `TAB_BAR_HEIGHT = 70`; FAB 52; FAB bottom base 96; contenido añade FAB + 24.
- Glass web usa blur 24 px y saturación 190% mediante `webGlass`.

## Áreas

- **Resumen:** tarjetas de métricas, análisis de más vendidos/devueltos por ciclo, cierre con efectivo reportado y diferencia, y hojas de detalle. Los cálculos están en `ResumenScreen.js`; no sustituir por valores estáticos.
- **Vender:** header con búsqueda y chips horizontales; lista de productos en una columna móvil; escritorio catálogo más panel derecho de 380/420 px. Carrito flotante móvil con unidades y total; checkout es bottom sheet.
- **Inventario:** mismo patrón de búsqueda/chips; muestra/oculta costos; acciones de limpiar y nuevo producto; detalle de producto en sheet; FAB móvil para volver a vender.
- **Historial:** cards expandibles; venta, cliente, fecha, forma de pago, total; cada ítem muestra estado de garantía y permite reclamar/revertir.

## Estados visuales confirmados

Existe estado vacío para catálogo, inventario, carrito e historial; splash con ActivityIndicator azul; avisos de autenticación de error/éxito; chips activos; stock agotado/bajo/normal; badge de carrito; confirmación web con `window.confirm` para limpieza. Los modales y sheets deben conservar cierre por backdrop/acción de cierre y no montarse cuando no son visibles.

## Tema

En el original universal el tema persistido es `dark` por defecto y `ThemeProvider` acepta `dark`, `light` o `system`; `system` usa el esquema detectado. El meta `theme-color` se actualiza en web. La reconstrucción web actualmente usa `auto` por defecto en `web prueba`, por lo que no se debe afirmar equivalencia sin una decisión de producto.

## Pendientes visuales

No se encontraron capturas de referencia verificables en el código fuente inspeccionado. Quedan por medir con captura en iPhone real: fuente exacta renderizada, sombra nativa, radios efectivos de `Card`/`Sheet`, alturas de teclado y comportamiento de orientación. Deben registrarse después de una prueba visual, no inferirse.
