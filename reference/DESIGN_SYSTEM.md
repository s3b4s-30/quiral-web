# Design system verificado

Fuente principal: `universal/src/theme.js`, `ThemeContext.js`, `ui/kit.js` y `ui/ProductList.js`.

## Tokens

| Token | Oscuro | Claro |
|---|---|---|
| Fondo | `#000000` | `#F2F2F7` |
| Tarjeta | `#1C1C1E` | `#FFFFFF` |
| Superficie 2 | `#2C2C2E` | `#E5E5EA` |
| Glass | `rgba(28,28,30,0.55)` | `rgba(255,255,255,0.6)` |
| Borde | `rgba(255,255,255,0.12)` | `rgba(0,0,0,0.10)` |
| Hairline | `rgba(255,255,255,0.08)` | `rgba(60,60,67,0.12)` |
| Texto | `#FFFFFF` | `#000000` |
| Texto secundario | `rgba(235,235,245,0.62)` | `rgba(60,60,67,0.68)` |
| Azul | `#0A84FF` | `#007AFF` |
| Verde | `#30D158` | `#34C759` |
| Rojo | `#FF453A` | `#FF3B30` |
| Naranja | `#FF9F0A` | `#FF9500` |

## Medidas y tipografía

La fuente es la pila del sistema (`-apple-system`, BlinkMacSystemFont, Segoe UI, sans-serif).
No hay fuente propia ni evidencia para introducir Inter. Título de página: 28 px/800;
texto base: 15 px; búsqueda: 16 px y mínimo 44 px; etiquetas: 12 px; botón primario:
mínimo 50 px, radio 16, texto 17 px/700; tarjeta: radio 20; chip: mínimo 36 y radio 18;
FAB: 52 px; barra inferior: 70 px.

## Estados y superficies

Stock `<= 0` es rojo, `<= 5` naranja y superior verde. Selección usa azul y superficie 2.
Errores usan rojo con fondo `rgba(255,69,58,0.14)`; éxito usa verde con fondo
`rgba(48,209,88,0.14)`. `Glass` usa blur web de 24 px y saturación 190%; `Card` es sólida.
Los detalles completos y valores locales están en [documentacion_original/02_DESIGN_SYSTEM_EXACTO.md](./documentacion_original/02_DESIGN_SYSTEM_EXACTO.md).
