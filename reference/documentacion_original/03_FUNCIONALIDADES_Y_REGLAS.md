# Quiral — Funcionalidades, datos y reglas verificadas

## Autenticación

`universal/src/screens/AuthScreen.js` ofrece entrar con correo o nombre de tienda, crear cuenta, recuperación y nueva contraseña. Valida correo, mínimo de 6 caracteres y coincidencia estricta. `authService.js` usa Supabase Auth y RPC `email_for_store`/`store_name_available`. Sin sesión, `Root` no monta ninguna vista comercial.

## Venta y cobro

`usePOSStore.js` impide añadir productos sin stock, limita cantidad al stock, selecciona lote preferido o el lote disponible con mayor cantidad, y conserva proveedor/costo snapshot en la línea. `CheckoutSheet.js`:

1. calcula subtotal como suma de `qty * unitPriceCharged`;
2. permite editar precio por unidad y aplicar total final;
3. calcula descuento como subtotal menos total;
4. registra cliente (vacío → `Cliente General`) y método (`Efectivo`, `Nequi`, `Bancolombia`, `Tarjeta`);
5. crea venta e ítems con costo, lote/proveedor y garantía;
6. descuenta stock y consume primero lote seleccionado, después proveedor y finalmente lotes con mayor existencia;
7. limpia carrito.

El número siguiente es máximo número existente + 1. La versión web destino añade `Transferencia`, por lo que es una divergencia que requiere decisión explícita.

## Inventario, lotes y proveedores

Los productos tienen nombre, categoría, especificaciones, precio, costo, stock, garantía, proveedor y lotes. `InventarioScreen.js` filtra por nombre/especificaciones, alterna costos, crea productos, muestra detalle, limpia agotados o todo, y restaura catálogo inicial. `addStockBatch` aumenta stock, actualiza costo/proveedor, antepone lote y memoriza proveedor. Proveedores se gestionan desde `TopMenu`/`SuppliersSheet`; el último proveedor se persiste.

## Historial y garantías

`HistorialScreen.js` expande cada venta y usa `getWarrantyStatus` para mostrar estado. `toggleItemWarranty` cambia la garantía por ítem y genera nota con fecha al reclamar; revertir elimina la nota. No debe modelarse como estado global por venta.

## Resumen y cierres

`ResumenScreen.js` calcula costo, ingresos, utilidad, ventas y ciclos desde ventas/cierres. El ciclo actual excluye ventas anteriores al último cierre; ciclos históricos pueden usar `topSellers`/`topReturned` guardados o reconciliar ventas. El cierre registra periodo, efectivo reportado, total contable, diferencia, nota y rankings.

## Persistencia y errores

AsyncStorage conserva tema, carrito, productos, proveedores, ventas, cierres y flags de inventario vacío. Al cerrar sesión se eliminan datos locales de negocio, conservando tema. Supabase es la fuente remota; la caché solo sirve lectura sin red. Los errores de red deben permanecer visibles/logueados y no convertirse en éxito silencioso.

## Seguridad multi-tenant

Toda lectura/escritura remota del repositorio debe incluir el tenant y estar respaldada por RLS de `universal/supabase/schema.sql`. No trasladar el `store_id: 'store-demo'` de los mocks del destino a producción. No usar datos mock como fallback de una sesión real.
