# Interacciones visibles y estados

## Comprobadas en código

- Tabs/sidebar cambian sección y activan icono, fondo y color.
- Tema permite Auto, Claro y Oscuro; actualiza tokens y `theme-color`.
- POS filtra por texto/categoría, incrementa hasta stock, abre checkout y confirma venta.
- Inventario alterna costos, confirma quitar agotados/vaciar, crea y edita productos y lotes.
- Historial expande ventas y alterna estado de garantía por ítem.
- Resumen calcula rendimiento por ciclo y cierre con fecha, hora, efectivo y nota.
- Sheets pueden cerrarse por backdrop, botón o gesto vertical/horizontal según el origen.

## Estados no inventados

Splash muestra indicador azul sobre negro. Hay mensajes específicos para listas vacías y
errores de autenticación. El repositorio contempla caché local de solo lectura. No se confirmó
un sistema global de toast, por lo que no debe añadirse como comportamiento del original.

## Seguridad funcional relevante

La shell comercial espera sesión confirmada; el repositorio trabaja por `store_id` y limpia
estado local antes de cerrar sesión. El MVP puede no tener login, pero no debe documentarse
como si esas protecciones siguieran activas si se eliminan.
