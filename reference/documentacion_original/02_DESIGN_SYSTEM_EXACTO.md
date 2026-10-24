# Design system exacto observado

## Tokens centralizados

Origen: `src/theme.js`, objetos `DARK` y `LIGHT`.

| Semántica | Oscuro | Claro |
|---|---|---|
| Fondo | `#000000` | `#F2F2F7` |
| Tarjeta | `#1C1C1E` | `#FFFFFF` |
| Superficie 2 | `#2C2C2E` | `#E5E5EA` |
| Glass | `rgba(28,28,30,0.55)` | `rgba(255,255,255,0.6)` |
| Borde | `rgba(255,255,255,0.12)` | `rgba(0,0,0,0.10)` |
| Hairline | `rgba(255,255,255,0.08)` | `rgba(60,60,67,0.12)` |
| Texto | `#FFFFFF` | `#000000` |
| Texto 2 | `rgba(235,235,245,0.62)` | `rgba(60,60,67,0.68)` |
| Texto 3 | `rgba(235,235,245,0.32)` | `rgba(60,60,67,0.3)` |
| Azul | `#0A84FF` | `#007AFF` |
| Verde | `#30D158` | `#34C759` |
| Rojo | `#FF453A` | `#FF3B30` |
| Naranja | `#FF9F0A` | `#FF9500` |

`ThemeContext.js` usa `mode === 'system' ? systemScheme : mode`, y el repositorio carga `dark` como fallback. En web actualiza `meta[name="theme-color"]`. El tema claro no es una paleta aproximada: son los valores anteriores.

## Tipografía

No existe archivo de fuente propio. React Native usa la fuente de plataforma; el destino debe usar la pila del sistema (`-apple-system`, BlinkMacSystemFont, Segoe UI, sans-serif) y no introducir Inter sin evidencia. Pesos observados: 500 para texto normal, 600 para controles, 700–800 para títulos/cifras. `Txt` aplica `fontVariant: ['tabular-nums']` globalmente.

Medidas confirmadas:

- Título de `PageHeader`: 28 px, peso 800.
- Texto base de `Txt`: 15 px.
- Búsqueda: 16 px, mínimo 44 px.
- Etiquetas de campo: 12 px.
- Botón primario: mínimo 50 px, radio 16, texto 17 px/peso 700.
- `Card`: radio 20 y borde hairline.
- `Chip`: mínimo 36, radio 18, padding horizontal 14.
- FAB: 52 px; `TAB_BAR_HEIGHT`: 70 px.

## Aplicación por estado

- Stock `<= 0`: rojo; `<= 5` en `ProductList.stockColor`: naranja; superior: verde.
- Selección: fondo de superficie 2 o azul; texto/icono azul activo.
- Error: rojo y fondo `rgba(255,69,58,0.14)`; éxito: verde y `rgba(48,209,88,0.14)`.
- Proveedor: punto de color desde `getSupplierColor`/`SUPPLIER_COLORS`.
- Garantía: `getWarrantyStatus` determina etiqueta y color; no inventar etiquetas fuera de esa función.

## Superficies y movimiento

`Glass` usa borde hairline y, en web, `backdropFilter: blur(24px) saturate(190%)`; `Card` es sólida. `FadeIn` entra con opacity y translateY de 10 a 0. `Tap` comprime a escala 0.97 y puede emitir háptica. `Sheet` entra con spring y backdrop negro al 50%, radio superior 34 px, grabber 38×5.

## Iconografía

Librería: `@expo/vector-icons`, familia Ionicons. Navegación: `pie-chart`, `cart`, `cube`, `time`; estados outline cuando inactivo. Identidad sidebar: `storefront`; proveedores `people-outline`; tema `contrast-outline`, `sunny-outline`, `moon-outline`; acciones `pencil-outline`, `trash-outline`, `chevron-back`, `checkmark`, `bag-handle`. En web destino usa `src/components/layout/Icon.tsx`; debe mapearse a SVG/CSS, no emojis.

## Valores no centralizados

Hay colores locales en sheets (por ejemplo alerta de proveedor `rgba(255,149,0,0.6)` y estados de garantía). El implementador debe conservarlos donde la interacción los use y señalar cualquier nuevo token en vez de ocultarlo como valor arbitrario.
