# Interacciones que cambian la presentación

## Navegación y tema

Tap en tab/sidebar cambia pantalla y activa icono relleno, fondo `card2` y azul. El tab Vender muestra badge rojo con unidades. Tema ofrece Auto/Claro/Oscuro; al cambiar, cambian todos los tokens y `theme-color`.

## POS

Buscar filtra por nombre/specs; chips filtran categoría. Tap de tarjeta añade o incrementa hasta stock; la tarjeta cambia `+ Agregar` por cantidad. El carrito flotante aparece solo con unidades. Checkout permite stepper, precio unitario, lote/proveedor y método. Total cambia en vivo; completar vacía carrito, actualiza stock y hace aparecer venta en historial.

## Inventario

“Ver costos” alterna costo en tarjetas. “Limpiar” abre confirmación con tres opciones. “Nuevo producto” abre sheet dinámico; el proveedor sin selección se marca naranja. Tap de producto abre detalle; +/- actualiza stock y lotes. “+ Nuevo lote” expande formulario. Proveedores permiten editar, eliminar tras confirmación y seleccionar color.

## Resumen

El sheet de rendimiento cambia entre “Más vendidos” y “Más devueltos”, y entre ciclo actual/ciclos previos. Las transacciones de un top seller se expanden. Cierre de ciclo recalcula al cambiar fechas/hora, efectivo y nota; guardar genera nuevo ciclo.

## Historial

Tap de venta expande/colapsa. Reclamar garantía cambia etiqueta, color y nota; revertir restaura estado.

## Estados no visualmente inventados

`Splash` muestra ActivityIndicator azul sobre negro. Listas vacías muestran icono + copy específico. Fallos Auth usan `Notice`. Caché offline se carga como solo lectura según repositorio. No existe un sistema confirmado de toast global en universal; no añadirlo como comportamiento original.
