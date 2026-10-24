# Alcance MVP PWA

## Se conserva del origen

La apariencia: tokens oscuro/claro, tipografía del sistema, cuatro secciones, shell móvil y
escritorio, búsqueda/chips, tarjetas, carrito, sheets, estados vacíos, colores de stock,
radios, bordes, safe-area y jerarquía visual.

## Se simplifica inicialmente

- Persistencia local en lugar de Supabase.
- Sin inicio de sesión obligatorio.
- Productos de prueba y ventas locales.
- Resumen básico derivado de ventas locales.
- Checkout limitado a los campos justificados por el origen y el alcance acordado.

## Se pospone

Tenant multi-tienda, RLS, sincronización offline/online, proveedores remotos, cierres persistidos
en backend, recuperación de contraseña y cualquier integración de pago. No se agregan métodos,
campos o funcionalidades que no estén presentes en el origen o aprobados para el MVP.

La simplificación funcional no autoriza rediseñar la interfaz. Toda diferencia visual debe quedar
registrada y compararse con [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) y
[ESPECIFICACION_PANTALLAS.md](./ESPECIFICACION_PANTALLAS.md).
