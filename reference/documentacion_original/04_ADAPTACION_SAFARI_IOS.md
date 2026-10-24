# Quiral — Adaptación verificable para Safari iOS/PWA

## Reglas ya presentes en el original

`universal/App.js` y `universal/src/layout.js` usan `100dvh`, `SafeAreaProvider`, overflow controlado, barra inferior no flotante y padding inferior calculado: `getFloatingBottom(insets)` y `getContentBottomPadding`. El destino ya declara `viewport-fit=cover`, `apple-mobile-web-app-capable`, `black-translucent`, `100dvh` y safe-area variables en `src/index.css`/`index.html`.

## Requisitos de implementación

- Mantener `env(safe-area-inset-top/right/bottom/left)` en la shell y reservar espacio inferior igual o superior a barra + FAB.
- No usar un `position: fixed` inferior sin padding equivalente en el scroll; comprobar el último elemento en 390 × 844.
- Mantener `min-width: 320px`, `min-width: 0` en columnas flex y filtros horizontales con overflow intencional únicamente.
- Preferir `100dvh`, con fallback `-webkit-fill-available` si se necesita compatibilidad con Safari antiguo; no usar `100vh` como única altura.
- Inputs de 44 px o más, `font-size` mínimo 16 px para evitar zoom automático, `inputmode`/`autocomplete` adecuados y scroll al enfocar dentro de sheets.
- Para teclado: `visualViewport` o un contenedor scrollable; no fijar la hoja al `bottom` sin reaccionar a la altura visible.
- Sheets deben tener `max-height`, `overflow-y:auto`, cierre por backdrop/escape y `overscroll-behavior:contain`; respetar `padding-bottom: env(safe-area-inset-bottom)`.
- Probar standalone y Safari en orientación vertical/horizontal, cambio de barra del navegador, teclado abierto, contenido largo y rotación.

## Matriz de verificación

| Caso | Resultado exigido |
|---|---|
| iPhone 12, 390×844 | no hay scroll horizontal; barra y FAB no tapan tarjetas |
| 320 px de ancho | texto y controles no se cortan |
| teclado en checkout | campo visible; hoja desplazable; no se pierde botón |
| standalone | fondo llega a indicador inferior sin franja; theme-color negro |
| landscape | navegación y panel siguen utilizables |
| escritorio ≥768 px | sidebar y POS dividido, sin aplicar layout móvil |

No se ejecutó Safari real ni Playwright durante esta auditoría; estos puntos son criterios de aceptación, no resultados de prueba.
