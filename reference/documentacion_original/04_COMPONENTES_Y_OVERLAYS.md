# Componentes compartidos y overlays

## Kit UI (`src/ui/kit.js`)

| Componente | Apariencia y comportamiento |
|---|---|
| `Tap` | `Pressable` + Animated scale 0.97; hitSlop 6; háptica opcional. |
| `Glass` | borde hairline, radio configurable; BlurView nativo o blur web. |
| `Card` | fondo `t.card`, radio 20, borde hairline. |
| `Txt` | color del tema, 15 px y tabular nums. |
| `Chip` | 36 px, radio 18, superficie 2; activo usa azul/proveedor. |
| `ChipRow` | ScrollView horizontal, padding x16/y8, sin indicador. |
| `Field` | etiqueta 12 px y input superficie 2, radio 14, mínimo 48, texto 16. |
| `PriceInput` | number-pad y formato monetario en vivo. |
| `PrimaryButton` | mínimo 50, radio 16, color azul y texto blanco 17/700. |
| `BackButton` | círculo 32, chevron Ionicons azul. |
| `FadeIn` | spring de opacity y desplazamiento vertical. |

## Headers, navegación y layout

`PageHeader` suma inset superior +10, padding inferior 12, título 28 y controles a la derecha. `SearchHeader` añade buscador 44 y `ChipRow`. `TabBar` mide 70 más inset inferior, borde superior, cuatro tabs, iconos 22 y badge rojo de carrito. `DesktopSidebar` mide 250, usa tarjeta como fondo, navegación vertical con radio 14 y footer para proveedores/tema/logout.

## Sheet

`Sheet` calcula ancho `min(windowWidth, 640)` y alto `round(windowHeight * height)`. Backdrop `rgba(0,0,0,.5)`. Panel al fondo con fondo `t.card`, radio superior 34, borde hairline y grabber 38×5. Header de 48 px con back button centrado. Padding inferior `insets.bottom + 10`.

Alturas reales: `CheckoutSheet` depende del formulario; `CreateSheet` 0.94; `ProductSheet` 0.92; `SuppliersSheet` 0.90; `TopSellersSheet` 0.92; `ClosureSheet` 0.88. Soporta cierre por backdrop, botón, `onRequestClose`, arrastre vertical hacia abajo (>120 px o velocidad) y swipe horizontal hacia la derecha (>85 px o velocidad). El scroll interno debe permanecer inmune al gesto de cierre.

## Overlays y formularios

- `CheckoutForm`: cliente, líneas con stepper, precio unitario, lote/proveedor, métodos de pago, subtotal/descuento/total y botón de confirmar.
- `CreateSheet`: taxonomía dinámica de cargadores/cables, forros y audio; chips, proveedor obligatorio, precios, costo, stock y garantía.
- `ProductSheet`: stock total +/-; precio; lotes por proveedor; nuevo lote; steppers por lote.
- `SuppliersSheet`: listado editable/eliminable, formulario, 14 colores Apple HIG.
- `TopMenu`: menú de tema, proveedores y cierre de sesión en móvil.
- `ClosureSheet`: fechas, hora, métricas, efectivo real, nota.

El destino debe usar overlays HTML con `role=dialog`, foco accesible, scroll interno y bloqueo del fondo solo mientras el overlay está abierto; no copiar `Modal` nativo literalmente.
