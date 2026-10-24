# Arquitectura visual del origen

## Aplicación activa

Entrada: `index.js` → `App.js`. `App.js` monta `SafeAreaProvider` y `Root`. `Root` llama `supabase.auth.getSession()`, escucha `onAuthStateChange`, resuelve el tenant y decide entre splash, `AuthScreen`, `ResetPasswordScreen` o `POSApp`. La pantalla comercial nunca se monta sin sesión confirmada.

`POSApp` hidrata `usePOSStore(repository)`, aplica `ThemeProvider` y monta `Shell`. `Shell` decide escritorio con `useWindowDimensions().width >= 768`; el contenido móvil usa una columna de ancho máximo 600 y `TabBar`, mientras escritorio usa `DesktopSidebar`.

## Mapa activo

| Responsabilidad | Archivos |
|---|---|
| Shell, tabs, safe layout | `App.js`, `layout.js`, `hooks/useSafeInsets.js` |
| Tema | `theme.js`, `ThemeContext.js` |
| Kit UI | `ui/kit.js`, `ui/ProductList.js`, `ui/DateField.js` |
| Resumen | `screens/ResumenScreen.js`, `resumen/` no existe en universal; los overlays están dentro de la pantalla |
| POS | `screens/POSScreen.js`, `sheets/CheckoutSheet.js` |
| Inventario | `screens/InventarioScreen.js`, `sheets/ProductSheet.js`, `sheets/CreateSheet.js` |
| Historial | `screens/HistorialScreen.js` |
| Proveedores, tema, menú | `sheets/TopMenu.js`, `components/DesktopSidebar.js` |
| Estado | `data/usePOSStore.js` |
| Datos y tenant | `data/authService.js`, `data/SupabasePOSRepository.js`, `data/posRepository.js`, `data/supabaseClient.js` |
| Dominio | `domain/formatters.js`, `domain/productTaxonomy.js` |

## Dependencias que afectan la apariencia

`@expo/vector-icons` aporta Ionicons; los nombres exactos se encuentran en JSX (`cart`, `cube`, `time`, `pie-chart`, `storefront`, `people-outline`, etc.). `expo-blur` implementa `BlurView` nativo y el kit traduce a `backdropFilter` en web. `react-native-safe-area-context` alimenta insets. `expo-haptics` solo afecta respuesta táctil, no el layout. `Animated`/`PanResponder` controlan entrada, escala y arrastre de sheets.

## Recursos

`assets/icon.png`, `favicon.png`, `splash-icon.png`, iconos Android y `public/icon-192.png`/`icon-512.png` son recursos de app/PWA. Las pantallas no usan fotografías de productos ni ilustraciones; la identidad visual se compone con color, Ionicons y texto. No se copiaron binarios a Markdown.

## Código heredado

La raíz `src/` y `quiral-pos/` son implementaciones anteriores. `universal/` es la referencia activa porque contiene el flujo Auth → tenant → repositorio → Shell. `DOCUMENTOS/` y `ESPECIFICACION_REVERSE_ENGINEERING.md` son documentación, no componentes renderizados.

## Persistencia que afecta a la vista

Tema, carrito, productos, proveedores, ventas y cierres se hidratan desde el repositorio. Cuando Supabase falla, `SupabasePOSRepository.loadAll` usa caché local de solo lectura. `clearLocal` se llama antes de cerrar sesión para no mostrar el tenant anterior.
