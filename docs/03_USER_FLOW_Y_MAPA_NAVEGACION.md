# 03_USER_FLOW_Y_MAPA_NAVEGACION.md

## 1. Mapa de Navegación General (SPA y Guardia de Autenticación)
La aplicación funciona como una Single Page Application (SPA). El componente raíz (`App.tsx`) evalúa de forma síncrona y reactiva el estado de la sesión, dividiendo el flujo en dos grandes ramas:

1. **Sin Sesión Activa:** Se renderiza exclusivamente la vista de autenticación (`AuthView.tsx`), bloqueando el acceso a las pantallas comerciales.
2. **Con Sesión Activa:** Se monta el contenedor maestro de la aplicación (`AppShell.tsx`), el cual fija en la parte inferior la barra de navegación (`Navbar`) con 4 accesos directos:
   - **Resumen:** KPIs financieros, accesos directos a rendimiento, arqueos de cierre de ciclo y listado histórico de cierres.
   - **Vender (POS):** Buscador de artículos, filtros por categorías (*chips*), listado de productos con botón rápido de adición, barra flotante de carrito y modal de cobro/checkout.
   - **Inventario:** Listado general de productos, alternador de Modo Mostrador / Modo Costos (icono de ojo), purga de agotados, acceso a creación de productos y detalle de lotes por proveedor.
   - **Historial:** Listado de transacciones cerradas, expansión de detalles por venta y gestión independiente de garantías por ítem.

---

## 2. Flujos de Interacción por Módulo

### A. Flujo de Autenticación y Menú de Configuración (`AuthView.tsx` y Popover `...`)
* **Acceso:** Si no hay sesión activa, se presenta la pantalla de acceso con opciones de inicio de sesión y registro.
* **Configuración y Tema:** Desde el botón de tres puntos (`...`) ubicado en la esquina superior derecha de las vistas principales, se despliega un popover que permite alternar el tema visual de la aplicación (`Auto`, `Claro`, `Oscuro`), consultar el estado de la tienda, acceder a la gestión de **Proveedores** o ejecutar el **Cierre de sesión**.

### B. Flujo de Venta y Cobro en Mostrador (`PosView.tsx`)
* **Selección y Carrito:** `PosView` filtra artículos por texto y categoría, muestra stock disponible y permite añadir productos desde la superficie completa de cada tarjeta (excepto controles secundarios) al carrito global. La pestaña `"Vender"` refleja las unidades en el badge de `Navbar` y muestra `CartSummaryBar` sobre la navegación inferior.
* **Checkout:** `CheckoutModal` reutiliza `ModalSheet`, permite indicar cliente, ajustar cantidades dentro del stock real, retirar productos, editar el precio unitario, cambiar lote/proveedor, escoger `Efectivo`, `Nequi`, `Bancolombia` o `Tarjeta`, aplicar un descuento global y confirmar la venta. La confirmación vuelve a validar lotes y descuenta stock sin actualizaciones parciales.

### C. Flujo de Control de Inventario y Alta Inteligente (`InventoryView.tsx`)
* **Modo Mostrador vs. Costos:** Al pulsar el icono de ojo en la cabecera, se alternan la visibilidad de los costos de compra y márgenes. Al pulsar sobre cualquier producto, se abre su detalle para ajustar existencias directamente por lote (`+`/`-`).
* **Nuevo Producto con Chips:** Al pulsar el botón `+`, se despliega el modal inteligente con selectores en cascada que autogeneran los nombres y especificaciones técnicas según la categoría elegida, requiriendo la asignación obligatoria de un proveedor.

### D. Flujo de Auditoría, Historial y Garantías (`HistoryView.tsx`)
* **Auditoría de Ventas:** Muestra las transacciones recientes. Al expandir una venta, cada ítem muestra su estado de cobertura de garantía mediante badges dinámicos, permitiendo ejecutar acciones aisladas de reclamación o reversión con notas de incidencia.