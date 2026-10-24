# Responsive, iOS y escritorio

## Breakpoints observados

El original usa `width >= 768` para cambiar a escritorio. POS: móvil una columna; desktop 2 columnas si `<1200`, 3 si `>=1200`; panel derecho 380/420. Historial usa 2 columnas desktop desde 1100. La shell móvil tiene `maxWidth: 600`.

## Safe areas y viewport

`useSafeInsets.js` usa insets de `react-native-safe-area-context`; en PWA standalone aplica fallback superior 47 e inferior 34 si el navegador no entrega valores. `App.js` y `universal/app.json` usan `viewport-fit=cover`, `100dvh`, `overflow:hidden` en la shell y barra inferior acoplada. El contenido añade `getContentBottomPadding`: desktop 40; móvil `max(96, bottomInset+96)+52+24`.

Para HTML/CSS del destino: conservar `viewport-fit=cover`, `100dvh` con fallback, `env(safe-area-inset-*)`, `min-width:0` en flex y `padding-bottom` equivalente. El destino `MASTER_SPEC.md` recomienda barras sólidas sin blur; eso es una decisión del destino, no una descripción exacta del `Glass` original.

## Teclado y scroll

Auth y sheets usan `KeyboardAvoidingView` iOS y ScrollView con `keyboardShouldPersistTaps="handled"`. Un equivalente web debe usar una hoja con `max-height`, overflow interno y `visualViewport`/scroll al foco; inputs de 16 px para evitar zoom Safari. No bloquear el scroll del documento fuera del overlay.

## Desktop

Sidebar fija visualmente a la izquierda, contenido flexible. POS muestra checkout persistente; no requiere FAB. La app se limita visualmente a la columna/área disponible y no debe crear scroll horizontal.

## Matriz de prueba solicitada

| Viewport | Qué verificar |
|---|---|
| 390×844 | auth, tabs, FAB/carrito, último elemento libre |
| 320×700 | truncamiento, chips horizontales intencionales, inputs |
| 375×812 | misma composición sin solapamientos |
| 768×1024 | transición exacta sidebar/shell |
| 1440×900 | sidebar, POS split, sheets centrados máx. 640 |

No se ejecutó Safari físico ni PWA instalada; estos son criterios de aceptación, no resultados.
