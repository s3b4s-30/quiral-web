# Auditoría completa de Quiral — documento consolidado para IA

Este documento consolida los siete informes de auditoría en el orden recomendado de lectura. Cada sección conserva el contenido del archivo original y su nombre de origen.

## Índice
1. [01_ARQUITECTURA_ORIGINAL](#01-arquitectura-original)
2. [02_ESPECIFICACION_VISUAL](#02-especificacion-visual)
3. [03_FUNCIONALIDADES_Y_REGLAS](#03-funcionalidades-y-reglas)
4. [04_ADAPTACION_SAFARI_IOS](#04-adaptacion-safari-ios)
5. [05_DIFERENCIAS_DESTINO](#05-diferencias-destino)
6. [06_PLAN_RECONSTRUCCION](#06-plan-reconstruccion)
7. [07_PROMPT_IMPLEMENTACION](#07-prompt-implementacion)

---

## 01_ARQUITECTURA_ORIGINAL

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

---

## 02_ESPECIFICACION_VISUAL

## Tokens confirmados

Fuente: `universal/src/theme.js`, `universal/src/ui/kit.js`, `universal/src/ui/ProductList.js` y `universal/src/layout.js`.

### Oscuro (predeterminado del repositorio)

`bg #000000`, tarjeta `#1C1C1E`, secundaria `#2C2C2E`, glass `rgba(28,28,30,.55)`, borde `rgba(255,255,255,.12)`, hairline `.08`, texto `#FFFFFF`, texto secundario `rgba(235,235,245,.62)`, terciario `.32`, azul `#0A84FF`, verde `#30D158`, rojo `#FF453A`, naranja `#FF9F0A`.

### Claro

`bg #F2F2F7`, tarjeta `#FFFFFF`, secundaria `#E5E5EA`, glass `rgba(255,255,255,.6)`, borde `rgba(0,0,0,.10)`, hairline `rgba(60,60,67,.12)`, texto `#000000`, secundario `.68`, terciario `.3`, azul `#007AFF`, verde `#34C759`, rojo `#FF3B30`, naranja `#FF9500`.

### Dimensiones y tipografía observadas

- Sistema sans del dispositivo; pesos 600–800 para títulos y cifras.
- `PageHeader` título 28 px/peso 800, padding horizontal 20, alto mínimo 48.
- Campo de búsqueda mínimo 44 px, radio 14, margen horizontal 16, texto 16.
- Tarjetas de producto: padding 14, margen horizontal 16 y margen inferior 10, radio definido por `Card` (verificar si se cambia el kit antes de implementar).
- Tab bar: `TAB_BAR_HEIGHT = 70`; FAB 52; FAB bottom base 96; contenido añade FAB + 24.
- Glass web usa blur 24 px y saturación 190% mediante `webGlass`.

## Áreas

- **Resumen:** tarjetas de métricas, análisis de más vendidos/devueltos por ciclo, cierre con efectivo reportado y diferencia, y hojas de detalle. Los cálculos están en `ResumenScreen.js`; no sustituir por valores estáticos.
- **Vender:** header con búsqueda y chips horizontales; lista de productos en una columna móvil; escritorio catálogo más panel derecho de 380/420 px. Carrito flotante móvil con unidades y total; checkout es bottom sheet.
- **Inventario:** mismo patrón de búsqueda/chips; muestra/oculta costos; acciones de limpiar y nuevo producto; detalle de producto en sheet; FAB móvil para volver a vender.
- **Historial:** cards expandibles; venta, cliente, fecha, forma de pago, total; cada ítem muestra estado de garantía y permite reclamar/revertir.

## Estados visuales confirmados

Existe estado vacío para catálogo, inventario, carrito e historial; splash con ActivityIndicator azul; avisos de autenticación de error/éxito; chips activos; stock agotado/bajo/normal; badge de carrito; confirmación web con `window.confirm` para limpieza. Los modales y sheets deben conservar cierre por backdrop/acción de cierre y no montarse cuando no son visibles.

## Tema

En el original universal el tema persistido es `dark` por defecto y `ThemeProvider` acepta `dark`, `light` o `system`; `system` usa el esquema detectado. El meta `theme-color` se actualiza en web. La reconstrucción web actualmente usa `auto` por defecto en `web prueba`, por lo que no se debe afirmar equivalencia sin una decisión de producto.

## Pendientes visuales

No se encontraron capturas de referencia verificables en el código fuente inspeccionado. Quedan por medir con captura en iPhone real: fuente exacta renderizada, sombra nativa, radios efectivos de `Card`/`Sheet`, alturas de teclado y comportamiento de orientación. Deben registrarse después de una prueba visual, no inferirse.

---

## 03_FUNCIONALIDADES_Y_REGLAS

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

---

## 04_ADAPTACION_SAFARI_IOS

## Reglas ya presentes en el original

`universal/App.js` y `universal/src/layout.js` usan `100dvh`, `SafeAreaProvider`, overflow controlado, barra inferior no flotante y padding inferior calculado: `getFloatingBottom(insets)` y `getContentBottomPadding`. El destino ya declara `viewport-fit=cover`, `apple-mobile-web-app-capable`, `black-translucent`, `100dvh` y safe-area variables en `src/index.css`/`index.html`.

## Requisitos de implementación

- Mantener `env(safe-area-inset-top/right/bottom/left)` en la shell y reservar espacio inferior igual o superior a barra + FAB.
- No usar un `position: fixed` inferior sin padding equivalente en el scroll; comprobar el último elemento en 390 × 844.
- Mantener `min-width: 320px`, `min-width: 0` en columnas flex y filtros horizontales con overflow intencional únicamente.
- Preferir `100dvh`, con fallback `-webkit-fill-available` si se necesita compatibilidad con Safari antiguo; no usar `100vh` como única altura.
- Inputs de 44 px o más, `font-size` mínimo 16 px para evitar zoom automático, `inputmode`/`autocomplete` adecuados y scroll al enfocar dentro de sheets.
- Para teclado: `visualViewport` o un contenedor scrollable; no fijar la hoja al `bottom` sin reaccionar a la altura visible.
- Sheets deben tener `max-height`, `overflow-y:auto`, cierre por backdrop/escape y `overscroll-behavior:contain`; respetar `padding-bottom: env(safe-area-inset-bottom)`.
- Probar standalone y Safari en orientación vertical/horizontal, cambio de barra del navegador, teclado abierto, contenido largo y rotación.

## Matriz de verificación

| Caso | Resultado exigido |
|---|---|
| iPhone 12, 390×844 | no hay scroll horizontal; barra y FAB no tapan tarjetas |
| 320 px de ancho | texto y controles no se cortan |
| teclado en checkout | campo visible; hoja desplazable; no se pierde botón |
| standalone | fondo llega a indicador inferior sin franja; theme-color negro |
| landscape | navegación y panel siguen utilizables |
| escritorio ≥768 px | sidebar y POS dividido, sin aplicar layout móvil |

No se ejecutó Safari real ni Playwright durante esta auditoría; estos puntos son criterios de aceptación, no resultados de prueba.

---

## 05_DIFERENCIAS_DESTINO

## Tecnología y arranque

Destino: `C:\Users\Sebas\Desktop\elytras\web prueba`. Usa React 19 + TypeScript + Vite 8 + Tailwind 4 + vite-plugin-pwa (`package.json`, `vite.config.ts`). El original activo usa Expo/React Native universal y Supabase (`universal/package.json`). El destino no contiene cliente Supabase implementado: `src/lib/supabase/` solo tiene `.gitkeep`.

## Diferencias funcionales críticas

1. `src/App.tsx` monta directamente `AppShell`/vistas; no hay `AuthScreen`, `getSession`, listener de auth ni guardia de sesión.
2. `src/contexts/POSStoreContext.tsx` hidrata mocks desde `src/utils/mocks.ts` y persiste todo en `localStorage` con clave única. No hay `store_id` efectivo por usuario ni repositorio remoto.
3. Las ventas se completan localmente y usan `store_id: 'store-demo'`; el original crea payloads con lotes, garantías y tenant real.
4. El destino calcula/reduce stock en estado local, pero no descuenta lotes con la estrategia original ni persiste cierres/garantías en Supabase.
5. El destino usa `localStorage` directo para turno cerrado, reclamos y tema (`SummaryView`, `HistoryView`, `ThemeContext`). Esto no es aislamiento por tienda.
6. Hay funciones visuales sin conexión real: exportar cierre, ver detalle de turno, acciones rápidas, proveedor y edición/alta de producto no completan el flujo de dominio.
7. `SummaryView` contiene cifras estáticas (`23 OCT 2026`, `24.850.000`, `+12,8%`) que no proceden del store; deben eliminarse o conectarse al cálculo original.
8. El destino ofrece `Transferencia` además de los cuatro métodos presentes en `CheckoutSheet.js`.

## Diferencias visuales y estructurales

- El destino tiene layout de escritorio/sidebar y POS dividido, que sí coincide conceptualmente, pero sus componentes son HTML/CSS propios (`src/components/layout/*`) y no reutilizan `TabBar`, `PageHeader`, `ProductCard`, `Sheet` ni tokens del universal.
- El destino usa `auto` por defecto para tema; el universal carga `dark` por defecto desde repositorio.
- Los nombres de modelos difieren (`quantity`, `unit_price`, `created_at` en destino frente a `qty`, `unitPriceCharged`, `createdAt` en universal). Requiere un adaptador explícito, no renombrado parcial.
- Existe documentación previa en `web prueba/docs/` y `MASTER_SPEC.md`, pero no sustituye la implementación: se contrastó contra el código y se marcaron las divergencias anteriores.

## Riesgos a corregir antes de producción

La combinación de mocks, `store-demo` y localStorage puede exponer o mezclar datos al cambiar de usuario/dispositivo. No conectar la UI a producción hasta implementar Auth, resolución de tenant, RLS, filtros explícitos y limpieza de caché al cerrar sesión.

---

## 06_PLAN_RECONSTRUCCION

## Orden recomendado

### 1. Contrato y seguridad

Modificar en destino `src/types/domain.ts`, crear `src/lib/supabase/client.ts` y repositorios/servicios bajo `src/lib/supabase/`. Migrar las entidades al contrato universal y exigir `store_id` en cada consulta/mutación. Añadir Auth y guardia en `src/App.tsx`; solo después montar `POSStoreContext`.

### 2. Estado compartido

Rehacer `src/contexts/POSStoreContext.tsx`/`src/hooks/usePOSStore.ts` para hidratación, loading/error, caché cuidadosamente separada por tenant, sincronización y limpieza al sign out. Reutilizar `src/utils/format.ts` solo como formateador; no reutilizar `src/utils/mocks.ts` en runtime autenticado.

### 3. POS

Corregir `src/views/PosView.tsx` y `src/components/layout/SplitPosLayout.tsx`: selección de lote, proveedor, precio unitario, descuento acotado, métodos originales, creación de venta y consumo de lotes. Mantener el panel desktop y sheet móvil, pero conectar ambos al mismo estado.

### 4. Inventario y proveedores

Completar `src/views/InventoryView.tsx` con crear/editar/eliminar, lotes, recepción, ajuste/merma, limpieza y proveedor. Crear componentes reutilizables en `src/components/` para modal/sheet, campos y confirmación accesible.

### 5. Historial y resumen

Completar `HistoryView.tsx` con garantías por ítem y persistencia; reescribir `SummaryView.tsx` para métricas dinámicas, ciclos, cierres, arqueo y detalle. Eliminar números hardcodeados y localStorage global.

### 6. Tema y PWA

Alinear `ThemeContext.tsx`, `src/index.css`, `index.html` y `vite.config.ts` con tokens verificables, safe areas, sheets de teclado y `100dvh`. Mantener Tailwind/Vite/PWA actuales salvo incompatibilidad demostrada.

### 7. Verificación

Ejecutar `npm run build` y `npm run lint` en destino; probar flujos con datos Supabase de dos tiendas; validar RLS; después usar Safari iPhone 12 390×844 y las dimensiones de la matriz de `04_ADAPTACION_SAFARI_IOS.md`.

## Reutilizar / corregir / reconstruir / integrar

- **Reutilizar:** Vite, React, TypeScript, Tailwind, PWA plugin, layout responsive, tipos base y formato monetario.
- **Corregir:** mocks, localStorage, fechas/cifras estáticas, nombres de campos, acciones incompletas y tema.
- **Reconstruir:** Auth, repositorio, persistencia, ventas atómicas, lotes, cierres, garantías y sheets de dominio.
- **Integrar:** Supabase Auth, tablas/RLS del `universal/supabase/schema.sql`, RPC públicas documentadas y cliente con variables públicas.
- **Verificar:** aislamiento tenant, errores de red, offline solo lectura, teclado, safe areas, orientación y standalone.

---

## 07_PROMPT_IMPLEMENTACION

Trabaja exclusivamente en `C:\Users\Sebas\Desktop\elytras\web prueba`. No modifiques `C:\Users\Sebas\Desktop\elytras-quiral`. Usa como fuente de verdad los siete documentos de `C:\Users\Sebas\Desktop\QUIRAL_AUDITORIA`, especialmente `01`–`06`, y el código universal original solo en lectura.

Implementa una PWA React + TypeScript + Vite + Tailwind que reproduzca las cuatro áreas del original: Resumen, Vender, Inventario e Historial. Conserva la arquitectura existente cuando sea compatible, pero sustituye mocks y localStorage global por Auth Supabase, repositorio multi-tenant y estado compartido real. Toda consulta o mutación de `products`, `sales`, `sale_items`, `batches`, `suppliers` e `inventory_adjustments` debe exigir `store_id` y quedar protegida por RLS; nunca uses `store-demo` en runtime.

Reproduce el comportamiento de `usePOSStore.js`, `CheckoutSheet.js`, `InventarioScreen.js`, `HistorialScreen.js` y `ResumenScreen.js`: selección/consumo de lotes, límites de stock, precios y descuentos, métodos de pago originales, garantías por ítem, ciclos/cierres y errores explícitos. Mantén el estado de carga, error, vacío y offline solo lectura. Al cerrar sesión limpia caché y estado en memoria del tenant anterior.

Mantén el diseño OLED claro/oscuro con los tokens confirmados; no inventes sombras, radios o cifras. Decide y documenta explícitamente si el tema inicial es oscuro como el original o `auto` como el prototipo, y no mezcles ambos silenciosamente. Implementa sheets accesibles, safe areas, `100dvh`, teclado iOS y barra/FAB sin cubrir contenido según `04_ADAPTACION_SAFARI_IOS.md`.

No declares terminado por compilar solamente. Ejecuta build/lint, valida dos tenants con RLS, prueba venta → stock → historial → garantía → cierre, y comprueba 390×844 en Safari iPhone/standalone además de escritorio ≥768 px. Reporta archivos modificados, pruebas ejecutadas, limitaciones y cualquier discrepancia pendiente.
