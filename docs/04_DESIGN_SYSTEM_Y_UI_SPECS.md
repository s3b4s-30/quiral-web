# 04_DESIGN_SYSTEM_Y_UI_SPECS.md

## 1. Filosofía Visual y Paleta de Tokens (Apple HIG / Temas Duales)
El diseño visual de Quiral replica fielmente los lineamientos de **Apple Human Interface Guidelines**, soportando de manera nativa dos temas de apariencia gestionados por variables CSS:

### A. Modo Oscuro (OLED Black)
* **Fondo Principal (`--bg-primary`):** `#000000` (Negro OLED absoluto).
* **Tarjetas y Contenedores (`--bg-elevated`):** `#141416` / `#1C1C1E` con borde sutil de `1px` en `#262629` (`rgba(255,255,255,0.08)`).
* **Barra de Navegación Inferior:** `#0A0A0C` con borde superior `1px solid #1C1C1E`.
* **Píldora de Pestaña Activa:** Fondo `#1C1C1E` con icono y texto en azul iOS (`#0A84FF`).

### B. Modo Claro (iOS System Light)
* **Fondo Principal (`--bg-primary`):** `#F2F2F7` (Gris sistema iOS).
* **Tarjetas y Contenedores (`--bg-elevated`):** `#FFFFFF` (Blanco puro) con borde sutil `1px solid #E5E5EA` y sombra ligera.
* **Barra de Navegación Inferior:** `#FFFFFF` con borde superior `1px solid #E5E5EA`.
* **Píldora de Pestaña Activa:** Fondo `#E8F2FF` con icono y texto en azul (`#007AFF`).

### C. Colores Semánticos Globales
* **Azul Primario (Acción / Selección):** `#007AFF` (Claro) / `#0A84FF` (Oscuro).
* **Verde Éxito (Utilidad / Stock / Cobro):** `#30D158` / `#28CD41`.
* **Naranja Advertencia (Inventario / Garantías):** `#FF9500` / `#FF9F0A`.
* **Rojo Peligro (Eliminar / Cerrar sesión / Badges):** `#FF3B30` / `#FF453A`.

---

## 2. Tipografía y Estándares Numéricos
* **Pila Tipográfica:** Tipografía sans-serif del sistema (`-apple-system`, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif).
* **Números Tabulares:** Uso obligatorio de la clase `.tabular-nums` de Tailwind CSS en precios, cantidades de stock y contadores de carrito para evitar saltos visuales en las interfaces financieras.
* **Formato de Moneda:** Pesos Colombianos (`COP`) con símbolo `$` y separador de miles por punto (`.`) en visualizaciones, y coma (`,`) en inputs editables.

---

## 3. Ergonomía Táctil y Normas de Adaptabilidad Responsiva (PWA)
* **Viewport y Safe Areas:** Configuración con `viewport-fit=cover` y `padding-bottom: env(safe-area-inset-bottom)` en la barra de navegación inferior para evitar desbordamientos y franjas muertas en dispositivos móviles.
* **Áreas Táctiles Mínimas:** Todos los elementos interactivos deben poseer un tamaño táctil útil de al menos **44x44px**.
* **Gestión de Proveedores y Colores:** Componente de selección con grilla de **13 círculos de color** (`40x40px`) provistos de indicador de selección (`✓`), sincronizados en tiempo real en todo el sistema.

## 4. Capas Liquid Glass y navegación de inventario
* La `Navbar` utiliza una capa translúcida con `backdrop-filter`, saturación y sombra interior para reforzar la jerarquía de la navegación flotante. Incluye un fondo opaco alternativo cuando el navegador no soporta desenfoque.
* El buscador y los filtros de `InventoryView` usan `.inventory-sticky-controls` y se mantienen bajo la cabecera sólida durante el scroll. El contenedor desplazable reserva `--quiral-header-offset` y el sticky usa `top: 0`, evitando una segunda compensación de safe-area.
* La selección de `Inventario` en la Navbar o del título superior reinicia el scroll de la vista al inicio; el comportamiento usa `scrollTo` y no depende de un gesto táctil.

## 5. POS móvil y checkout
* `PosView` reutiliza `.quiral-scroll-container` e `.inventory-sticky-controls` para que la búsqueda y las categorías permanezcan alineadas bajo `TopHeader`.
* `CartSummaryBar` se sitúa sobre la Navbar y respeta la safe-area inferior. `CheckoutModal` usa el footer persistente de `ModalSheet` para mantener la acción de cobro accesible con una mano.
* La tarjeta completa añade el producto al carrito y muestra únicamente un contador circular cuando existe selección. Las tarjetas muestran puntos de color por proveedor/lote.
* `TopMenu` usa un scrim opaco translúcido a pantalla completa para mantener la jerarquía modal y cerrar al tocar fuera de la tarjeta, sin mostrar simultáneamente la Navbar como superficie interactiva.
* `CheckoutModal` expone cliente, precio unitario editable, lote/proveedor, método de pago, descuento global y `Vaciar carrito`; el estado de negocio continúa centralizado en `InventoryContext`.
* Las cantidades del carrito nunca superan el stock del lote seleccionado. La confirmación de cobro valida de nuevo el inventario antes de descontarlo.
* Las tarjetas POS usan `p-3.5` y `gap-2`, truncamiento de texto y un único control de tarjeta para agregar al carrito; el contador/CTA es visual y no se anidan botones interactivos. El total editable acepta únicamente dígitos y se limita al subtotal.
* El precio de tarjeta usa una sola línea con formato COP; al seleccionar unidades aparece un contador circular. El total editable conserva dígitos internamente y presenta el formato monetario en tiempo real.
* El resumen financiero no repite la cifra final: contiene el subtotal y un único input de ajuste; el botón del footer persistente es el único elemento que muestra el total final.