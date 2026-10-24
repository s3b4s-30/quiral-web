# Especificación de pantallas activas

## AuthScreen

**Archivo:** `src/screens/AuthScreen.js`; hijos `AuthFrame`, `Notice`, `LinkButton`, `Field`, `Card`, `PrimaryButton`.

**Composición:** fondo del tema; columna centrada con padding 20, máximo 420; icono azul 72×72, radio 20, Ionicon `bag-handle` 36 blanco; marca Quiral 30/800; tarjeta de formulario con padding 18; pie “Desarrollado por Elytra” 12. `KeyboardAvoidingView` iOS y `ScrollView` centrado.

**Estados:** login muestra correo/tienda y contraseña; registro agrega tienda, correo, contraseña y confirmación; recuperación muestra correo; error/éxito aparece como notice; botón queda deshabilitado mientras faltan datos o hay petición. Validación de confirmación pinta borde rojo. Evidencia real: `capturas/auth/dark/390x844.png`, `capturas/auth/light/390x844.png`.

## ResumenScreen

**Archivo:** `src/screens/ResumenScreen.js`; overlays internos `TopSellersSheet` y `ClosureSheet`.

**Composición:** `PageHeader`; estadísticas en cards; sección de análisis de más vendidos/devueltos; cierre de ciclo; lista de actividad/atajos. La implementación usa `ScrollView`, `Card`, `Stat`, `Chip`, `DateField`, `PriceInput`, `Switch` y `PrimaryButton`.

**Reglas visibles:** ciclo actual parte después del último cierre; tarjetas de top sellers muestran ranking, unidades, ingresos, utilidad y transacciones desplegables; garantías muestran reclamos en naranja. Cierre selecciona desde/hasta, puede incluir hora, calcula total vendido/utilidad, permite efectivo real y nota. No sustituir cálculos por valores fijos.

## POSScreen

**Archivo:** `src/screens/POSScreen.js`; `ProductCard`, `SearchHeader`, `CheckoutForm`, `CheckoutSheet`.

**Móvil:** header “Vender”, buscador y chips; catálogo de una columna; tarjeta con nombre, specs, stock, puntos de proveedor, precio y `+ Agregar`/badge; carrito flotante con unidades, texto “Toca para cobrar o ajustar precios”, total verde y “Cobrar →”.

**Escritorio:** desde 768 px, catálogo y panel persistente; 2 columnas hasta 1199 y 3 desde 1200; panel derecho 380 px o 420 px. Panel “Venta Actual” y checkout visible aunque esté vacío.

## InventarioScreen

**Archivo:** `src/screens/InventarioScreen.js`; `ProductSheet`, `CreateSheet`, `SuppliersSheet`.

Header con búsqueda/chips y acciones de costos, limpiar y nuevo producto. Tarjetas iguales a POS pero abren detalle. Vacío muestra icono `cube-outline`, texto y “Restaurar catálogo base”. Limpieza ofrece cancelar, quitar agotados o vaciar todo. FAB móvil con carrito vuelve a Vender.

## HistorialScreen

**Archivo:** `src/screens/HistorialScreen.js`. `PageHeader` y lista de cards. Cada venta muestra `#saleNumber · customerName`, fecha corta, método y total. Tap expande ítems; cada ítem muestra cantidad/producto, badge de estado de garantía, nota y acción “Reclamar garantía”/“Revertir garantía”. Vacío usa `time-outline`.

## Variantes por tamaño

`isDesktop` se determina en `App.js`, no por CSS solamente. DesktopSidebar reemplaza TabBar. POS cambia a split y grids; inventario/historial usan 2–3/2–1 columnas según ancho. Móvil reserva safe area y padding para barra/FAB.
