# Especificación de pantallas

## Resumen

`ResumenScreen.js` muestra estadísticas, análisis de más vendidos/devueltos, ciclo actual,
actividad y cierre de ciclo. `TopSellersSheet` cambia entre métricas y períodos; `ClosureSheet`
calcula fechas, hora, efectivo y nota. Las cifras provienen del estado, no son textos fijos.

## Vender / POS

`POSScreen.js` muestra título, búsqueda, chips y catálogo. Una tarjeta contiene nombre,
especificaciones, stock, proveedores, precio y acción `+ Agregar`; al agregar muestra cantidad.
En móvil aparece un carrito flotante con unidades, total y `Cobrar`. En escritorio el catálogo
convive con un panel `Venta Actual` persistente.

## Inventario

`InventarioScreen.js` comparte búsqueda y tarjetas con POS. Incluye ver costos, limpiar y nuevo
producto. El estado vacío ofrece `Restaurar catálogo base`; el FAB móvil vuelve a Vender.
El detalle permite stock, precio, lotes y proveedores.

## Historial

`HistorialScreen.js` lista ventas expandibles con número, cliente, fecha, método y total.
Cada ítem muestra garantía y permite reclamar o revertirla. El vacío muestra `time-outline` y
`Sin ventas registradas en el historial`.

## Auth y estados globales

Auth tiene capturas reales en [capturas/auth/](./capturas/auth/), en oscuro y claro a 390×844.
Splash, errores, vacíos, carga y recuperación están descritos en [INTERACCIONES_VISIBLES.md](./INTERACCIONES_VISIBLES.md).
Las pantallas comerciales no se pudieron observar con una sesión real.
