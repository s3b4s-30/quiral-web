# Quiral — Arquitectura original verificada

## Alcance y fuente de verdad

La implementación activa inspeccionada es `elytras-quiral/universal/`. El árbol raíz también conserva una aplicación web histórica en `src/`, pero el arranque universal (`universal/App.js`) es el que integra autenticación, navegación, repositorio Supabase y las cuatro áreas operativas. El documento existente `ESPECIFICACION_REVERSE_ENGINEERING.md` se utilizó como índice, pero las afirmaciones de este informe se contrastaron con los archivos fuente.

## Stack y entradas

- Expo SDK 58, React Native 0.88, React 19, `react-native-web`, `@supabase/supabase-js`, AsyncStorage, safe-area-context, Expo Haptics y DateTimePicker: `universal/package.json`.
- Entrada nativa/web: `universal/index.js` → `universal/App.js`.
- `App.js` envuelve la aplicación en `SafeAreaProvider` y `Root`.
- `Root` verifica `supabase.auth.getSession()`, escucha `onAuthStateChange`, resuelve `store_id` con `getMyStoreId`, muestra splash mientras carga, `AuthScreen` sin sesión, `ResetPasswordScreen` durante recuperación y `POSApp` con repositorio Supabase con sesión.
- En web se inyectan reglas para `html`, `body` y `#root` con `100dvh`, overflow controlado y fondo OLED. La shell móvil limita el ancho a 600 px; escritorio se activa desde 768 px y usa sidebar.

## Navegación y composición

`Shell` en `universal/App.js` mantiene la pestaña (`resumen`, `vender`, `inventario`, `historial`) y el estado de overlays:

| Área | Componente | Acciones conectadas |
|---|---|---|
| Resumen | `universal/src/screens/ResumenScreen.js` | métricas, ventas/ciclos, detalle de rendimiento, cierre |
| Vender | `universal/src/screens/POSScreen.js` | búsqueda, categorías, carrito, checkout |
| Inventario | `universal/src/screens/InventarioScreen.js` | búsqueda, costos, limpieza, detalle, alta |
| Historial | `universal/src/screens/HistorialScreen.js` | expansión de venta y garantía |

Móvil usa `TabBar` inferior dentro de `App.js`; escritorio usa `universal/src/components/DesktopSidebar.js`. `TopMenu` abre proveedores, tema y cierre de sesión. Hojas compartidas: `CheckoutSheet`, `ProductSheet`, `CreateSheet` y `SuppliersSheet`.

## Estado, persistencia y repositorio

- `universal/src/data/usePOSStore.js` hidrata asincrónicamente el repositorio, expone `ready`, tema, proveedores, productos, carrito, ventas y cierres, y persiste cambios reactivos.
- Operaciones de negocio verificadas: añadir/limitar carrito, escoger lote, cambiar proveedor/precio, completar venta, consumir lotes, ajustar stock, crear/eliminar producto, limpiar/restaurar inventario, reclamar/revertir garantía y crear cierre.
- `universal/src/data/posRepository.js` implementa caché AsyncStorage con migración de claves antiguas y limpieza al cerrar sesión.
- `universal/src/data/SupabasePOSRepository.js` sustituye la fuente por Supabase: consulta `suppliers`, `products`, `sales`, `closures` y `store_settings`; filtra por `store_id`; sincroniza por `upsert` con debounce y borra faltantes del mismo tenant. Si falla la carga usa caché local en solo lectura.
- `universal/src/data/supabaseClient.js` crea el cliente con variables públicas de Expo. `universal/src/data/authService.js` encapsula login por correo o tienda, registro, recuperación, sesión y resolución del tenant.

## Datos y seguridad arquitectónica

`universal/supabase/schema.sql` define `stores`, `store_members`, `suppliers`, `products`, `sales`, `closures` y `store_settings`, todas las entidades de negocio con `store_id`, políticas RLS y `is_store_member(auth.uid())`. `handle_new_user` crea tienda, miembro y settings. `patch_v2_3_login_por_tienda.sql` añade RPC de disponibilidad/resolución de tienda.

La defensa esperada es doble: el repositorio filtra explícitamente por `store_id` y PostgreSQL aplica RLS. El cliente no debe copiar el patrón de fallback `return userId` de `getMyStoreId` a una reconstrucción sin evaluar el riesgo: el tenant debe resolverse y validarse antes de cargar datos.

## Código histórico

La raíz `src/` contiene una versión Vite web anterior (`src/App.jsx`, `src/views/*`, `src/services/posRepository.js`). No es la entrada de `universal/`; debe tratarse como referencia histórica salvo que una importación real del destino requiera un detalle concreto. `quiral-pos/` es otro paquete legado separado.
