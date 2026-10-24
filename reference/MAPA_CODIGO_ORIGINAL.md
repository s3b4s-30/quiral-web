# Mapa de código original

Origen de lectura: `C:\Users\Sebas\Desktop\elytras-quiral\universal\`.
Copias de consulta: [mapa_codigo_original/fuentes/](./mapa_codigo_original/fuentes/).

| Área | Archivo original | Función |
|---|---|---|
| Entrada y shell | `App.js`, `index.js`, `layout.js` | sesión, viewport, navegación y safe-area |
| Tema | `src/theme.js`, `src/ThemeContext.js` | tokens, preferencia y `theme-color` |
| UI | `src/ui/kit.js`, `src/ui/ProductList.js`, `src/ui/DateField.js` | kit, tarjetas, headers y fechas |
| Navegación | `src/components/DesktopSidebar.js`, `src/sheets/TopMenu.js` | sidebar y menú móvil |
| Pantallas | `src/screens/AuthScreen.js`, `ResumenScreen.js`, `POSScreen.js`, `InventarioScreen.js`, `HistorialScreen.js` | vistas principales |
| Sheets | `src/sheets/CheckoutSheet.js`, `CreateSheet.js`, `ProductSheet.js`, `TopMenu.js` | checkout, productos y proveedores |
| Estado | `src/data/usePOSStore.js` | carrito, productos, ventas, cierres y tema |
| Persistencia | `src/data/authService.js`, `SupabasePOSRepository.js`, `posRepository.js`, `supabaseClient.js` | sesión, tienda y datos |
| Dominio | `src/domain/formatters.js`, `productTaxonomy.js` | formato, garantías y categorías |
| PWA | `public/manifest.json`, `public/index.html`, `public/sw.js` | manifest, viewport y service worker |
| Datos | `supabase/schema.sql`, `patch_v2_3_login_por_tienda.sql` | esquema y cambios SQL |

`universal/` se toma como activo porque contiene el flujo completo Auth → tenant → repositorio →
Shell. Las fuentes copiadas excluyen `.env`, `node_modules`, `dist` y dependencias completas.
