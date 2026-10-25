# DESIGN_GUIDELINES.md — Quiral POS (iOS HIG & PWA Architecture)

Este documento define el sistema de diseño, la arquitectura de interfaz de usuario y el protocolo de gobernanza técnica para **Quiral POS**. Es de cumplimiento obligatorio para cualquier intervención en el código frontend.

---

## 1. Principios de diseño móvil e iOS (Reglas de UI/UX)

### A. Botones de acción y márgenes inferiores
- **Posición fija cercana al borde inferior:** En vistas modales y hojas de acción (*Nuevo producto*, *Detalle de producto*, *Checkout*), los botones de acción principal (como «Guardar producto» o «Listo») deben residir en un contenedor fijo (*footer persistente*), fuera del área desplazable.
- **Respeto estricto de Safe Areas:** Se debe utilizar `env(safe-area-inset-bottom)` de forma adaptativa (`pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] sm:pb-3`) para que el botón descanse ergonómicamente sobre el indicador de inicio de iOS sin flotar demasiado arriba ni quedar cortado.
- **Acciones Destructivas:** Las acciones de peligro (como «Eliminar producto») deben mantenerse al final del flujo de contenido desplazable y requerir confirmación modal obligatoria, previniendo pulsaciones accidentales sobre el borde inferior.

### B. Encabezados y modales (*Bottom Sheets*)
- **Estructura Arquitectónica:** Encabezado persistente, contenido central con scroll independiente y footer persistente cuando corresponda.
- **Píldora de Arrastre (*Handle*):** Píldora horizontal centrada en la parte superior (`w-9 h-1 rounded-full bg-neutral-300 dark:bg-neutral-600`), ubicada a `10px` del borde superior (`pt-2.5 pb-1`).
- **Encabezados Fijos y Proporciones:**
  - Fondo opaco sólido `bg-[var(--bg-elevated)]` o `.quiral-top-header` para evitar que el texto en scroll pase visiblemente por detrás.
  - La proporción respecto al borde superior utiliza exclusivamente `calc(env(safe-area-inset-top, 0px) + 0.625rem)`, garantizando que en modo navegador Safari no se genere un vacío artificial y que en PWA standalone descanse exactamente bajo la barra de estado/notch.
  - El título principal usa `flex-1 min-w-0 truncate` para nunca empujar o invadir los controles de acción.
  - Uso de `sticky top-0 z-30` o `shrink-0` únicamente cuando la estructura del DOM lo requiera.
- **Swipe-to-Dismiss:**
  - Deslizamiento hacia abajo habilitado desde el área de la cabecera/handle con retorno suave (`cubic-bezier(0.32, 0.72, 0, 1)`).
  - Los gestos excluyen elementos interactivos (`button`, `input`, `select`, `a`), permitiendo pulsaciones inmediatas sin bloqueos.

### C. Scroll y áreas seguras
- **Scroll Independiente:** Cada vista o modal maneja su propio desplazamiento vertical con `overflow-y-auto overscroll-contain` e inercia táctil `-webkit-overflow-scrolling: touch`.
- **Compensación de Cabecera:** `.quiral-scroll-container` inicia limpiamente bajo la barra superior mediante `padding-top: calc(env(safe-area-inset-top, 0px) + 4.25rem)`, erradicando dobles contabilizaciones de safe area.
- **Aislamiento y Bloqueo:** Al abrir un modal, se bloquea temporalmente el scroll de `document.body` (`overflow: hidden; touch-action: none;`) y se restaura limpiamente al desmontar el componente.
- **Viewport Dinámico:** Integración con `100dvh` y `viewport-fit=cover` para compatibilidad nativa en Safari iOS y modo PWA standalone.

### D. Consistencia visual y datos
- **Pila Tipográfica y Números:** Fuente sans-serif nativa de Apple. Uso obligatorio de `.tabular-nums` en precios, stock y cifras monetarias (formato COP con separador de miles por punto).
- **Control Maestro de Unidades y Lotes:** Los botones `+` y `-` del total de stock operan determinísticamente sobre los lotes por proveedor (añadiendo al lote con mayor cantidad, o sustrayendo del lote con mayor stock disponible sin permitir valores negativos). El total siempre coincide con la suma exacta de sus lotes.
- **Modo Administrador Único:** Implementado a través del componente unificado `AdminCompactButton` en la cabecera superior: botón circular compacto de icono en pantallas estrechas (`< 420px`), expandiéndose a píldora completa en pantallas mayores. Se prohíbe duplicar este texto o badge en el cuerpo de las vistas.
- **Barra de Navegación Global:** La `Navbar` se desmonta dinámicamente (`!hasActiveModal`) ante cualquier modal activo para erradicar solapamientos de *stacking context*.
- **Movimiento accesible:** Las transiciones de estado se limitan a propiedades específicas y cuentan con una reducción global mediante `prefers-reduced-motion`; los efectos de profundidad mantienen una alternativa opaca cuando el desenfoque no está disponible.
- **Menú de tema inmediato:** `.theme-menu` centraliza la desactivación de transiciones en el botón y el popover de configuración. Todos sus textos y controles cambian de color inmediatamente al alternar tema, evitando interpolaciones blanco/negro y correcciones aisladas por etiqueta.
- **Tema instantáneo global:** La utilidad `.transition-colors` se anula centralmente para toda la interfaz. Los cambios de color, fondo y borde entre temas son inmediatos; las animaciones de `transform` y `opacity` siguen disponibles para interacción y navegación.
- **Liquid Glass selectivo:** La `Navbar` flotante utiliza una superficie ultra translúcida (10% en claro, 14% en oscuro), saturación `1.8` y desenfoque `42px` porque no es una cabecera sobre contenido desplazable; las cabeceras de vistas permanecen sólidas para evitar artefactos de WebKit. Incluye fallback opaco cuando el navegador no soporta `backdrop-filter`.
- **Controles de inventario persistentes:** El buscador y los filtros de categoría permanecen fijos bajo la cabecera durante el desplazamiento. `.quiral-scroll-container` reserva el espacio de la cabecera con `--quiral-header-offset`; `.inventory-sticky-controls` se adhiere a `top: 0` dentro de ese scrollport para no duplicar el offset.
- **Retorno al inicio:** Seleccionar `Inventario` desde la Navbar inferior o pulsar su título en la cabecera devuelve el scroll de la vista al inicio con una transición breve.
- **POS modular:** `PosView`, `CartSummaryBar` y `CheckoutModal` separan catálogo, resumen y cobro, mientras `InventoryContext` mantiene el carrito y la validación de stock como fuente única de verdad.
- **Checkout POS:** El cobro permite editar el cliente, el precio unitario, la cantidad y el lote/proveedor desde `CheckoutModal`. Las mutaciones pasan por `InventoryContext`, que rechaza precios negativos y limita la cantidad al stock del lote seleccionado.
- **Interacción rápida POS:** Las tarjetas con stock disponible son el único control interactivo de su superficie; el contador es un indicador visual no anidado. El total opcional se normaliza a dígitos antes de calcular el descuento y nunca puede superar el subtotal.
- **Precios y selección POS:** El precio de cada tarjeta se muestra una sola vez en una línea sin salto. La tarjeta completa añade unidades y solo muestra un círculo contador cuando ya existe una selección. Los campos de total muestran siempre el formato COP visible (`$35.000`) aunque conserven un valor numérico interno.
- **Resumen financiero compacto:** El bloque de checkout muestra únicamente el subtotal y un input para ajustar el total; la cifra final se presenta exclusivamente en el botón persistente `Completar venta`.
- **Scrim de menús:** `TopMenu` renderiza un scrim fijo (`z-index` inferior a la tarjeta) que cubre la pantalla completa, incluida la Navbar. Tocar el scrim es la única acción fuera de la tarjeta necesaria para cerrar el menú.

---

## 2. Historial de Descarte

Se registran los elementos, patrones y comportamientos eliminados o rechazados formalmente, cuya reintroducción en el código queda estrictamente prohibida.

| Elemento / Patrón Descartado | Componente / Vista Afectada | Motivo de la Eliminación | Solución Definitiva Adoptada |
| :--- | :--- | :--- | :--- |
| **Cabecera translúcida con `backdrop-blur` en vistas con scroll** | `TopHeader.tsx`, `InventoryView.tsx` | WebKit en iOS Safari y modo PWA standalone genera artefactos visuales graves (texto cortado/borroso a la mitad y parpadeo al hacer scroll). | Cabeceras con fondo sólido opaco (`bg-[var(--bg-elevated)]` / `.quiral-top-header`) y scroll desacoplado. |
| **Navbar global visible simultáneamente con modales abiertos** | `App.tsx`, `Navbar.tsx` | La Navbar con `fixed z-40` colisionaba físicamente con los modales abiertos en `<main>`, solapando botones inferiores y controles de lotes. | Modales montados al nivel raíz y desmontaje dinámico de la Navbar (`!hasActiveModal`). |
| **Botón de acción principal al final del formulario desplazable** | `NewProductModal.tsx` | En pantallas de 4.7" a 6.1", obligaba al usuario a deslizar formularios largos para poder guardar, y el botón quedaba cortado. | Botón de acción principal fijado en el footer persistente inferior (`footer` de `ModalSheet`) con `env(safe-area-inset-bottom)`. |
| **Padding inferior inflado en el footer de modales** | `ModalSheet.tsx` (`pb-[calc(1.25rem+...)]`) | Dejaba el botón «Listo» demasiado separado del borde inferior, luciendo flotante y desproporcionado respecto a las guías HIG. | Padding optimizado `pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] sm:pb-3`. |
| **Safe-area con `max(..., 44px)` forzado en cabecera** | `src/index.css` (`.quiral-top-header`) | En Safari browser (sin notch en web view) agregaba 44px artificiales de espacio vacío sobre "Inventario", y duplicaba el desfase en el scroll container. | Cálculo dinámico puro `calc(env(safe-area-inset-top, 0px) + 0.625rem)`. |
| **Duplicación del control/texto «Modo Administrador»** | `InventoryView.tsx`, `TopHeader.tsx` | Existía como botón desbordado en cabecera y a la vez como etiqueta redundante dentro de la tarjeta de auditoría. | Centralizado en el componente único `AdminCompactButton` en cabecera; etiqueta de auditoría simplificada a «Activo». |
| **Texto de "Modo administrador" desbordado y sin responsive** | `TopHeader.tsx` | En pantallas de 375-390px, el texto completo colisionaba con los 3 botones de acción superior forzando saltos de línea. | `AdminCompactButton` colapsa a botón táctil de icono en `<420px` y muestra texto completo en pantallas mayores. |
| **Incremento arbitrario de lote sin balanceo de stock** | `InventoryContext.tsx` (`adjustMasterStock`) | Incrementar el total sumaba siempre al lote 0 y decrementar vaciaba secuencialmente, generando inconsistencias con la distribución de inventario. | Incremento al lote con mayor cantidad y decremento al lote con mayor stock disponible (desempate determinista, sin negativos). |
| **Bloque decorativo de "Autocompletado con Chips"** | `NewProductModal.tsx` | Elemento redundante que generaba espacio muerto y confusión visual. | Eliminado por completo; reemplazado por selectores directos de categoría y subtipo. |
| **Término informal "Cubito Cargador"** | Catálogo general | Jerga comercial inconsistente con la nomenclatura técnica. | Estandarizado a **"Cubo"** en toda la interfaz y datos. |
| **Pestaña activa en negro sólido en modo claro** | `Navbar.tsx` | Rompía la jerarquía visual de iOS HIG, generando bajo contraste. | Fondo activo en azul de sistema `#007AFF` con texto e icono en blanco. |
| **Animaciones declaradas sin implementación CSS** | `InventoryView.tsx`, `TopMenu.tsx`, `ModalSheet.tsx` | Las clases de animación no producían una transición consistente y no existía una alternativa global para usuarios con movimiento reducido. | Utilidades CSS locales de entrada y regla `prefers-reduced-motion` con fallback inmediato. |
| **Variaciones de fondo por vista (`bg-zinc-50`, `dark:bg-zinc-950`) e índigo** | `InventoryView.tsx`, `App.tsx`, `Navbar.tsx` | Fragmentaba la identidad visual global y rompía la consistencia nativa dual OLED. | Unificación total del fondo nativo (`bg-[var(--bg-primary)]`) y acento azul (`blue-500`). Diferenciación concentrada exclusivamente en `TopHeader` mediante props. |
| **Botón flotante de venta localizado en vistas hijas (`HistoryView.tsx`)** | `HistoryView.tsx` | `z-index` inferior al Navbar provocaba corte visual con la barra y falta de acceso rápido desde Inventario y Resumen. | Centralizado en layout raíz (`App.tsx`) con `FloatingCartFAB` (`z-40`, `bottom-[calc(5.75rem+env(safe-area-inset-bottom,0px))]`) activo en todas las vistas excepto Vender y oculto en modales. |

---

## 3. Registro de Decisiones

| Decisión Arquitectónica / Visual | Estado | Fecha de Registro | Impacto en el Proyecto |
| :--- | :---: | :---: | :--- |
| **Fijación de botones de acción en footer inferior persistente** | **Confirmada** | 2026-10-24 | Obligatorio en `ModalSheet`, `NewProductModal` y `ProductDetailModal`. |
| **Ocultamiento de Navbar durante modales activos** | **Confirmada** | 2026-10-24 | Implementado en `App.tsx` con `!hasActiveModal`. |
| **Cabecera sólida sin blur en vistas móviles** | **Confirmada** | 2026-10-24 | Implementado en `index.css` y `TopHeader.tsx`. |
| **Componente unificado `AdminCompactButton`** | **Confirmada** | 2026-10-24 | Reemplaza todas las apariciones dispersas; responsive (<420px icon, >=420px pill). |
| **Cálculo dinámico puro de Safe Area sin mínimos forzados** | **Confirmada** | 2026-10-24 | Eliminado `max(..., 44px)` en `index.css` para erradicar espacios vacíos. |
| **Balanceo de unidades por lote con criterio determinista** | **Confirmada** | 2026-10-24 | Implementado en `InventoryContext.tsx` (`adjustMasterStock`). |
| **Padding reducido en footer de modales (`0.5rem` + safe-area)** | **Confirmada** | 2026-10-24 | Ajustado en `ModalSheet.tsx` para acercar el botón «Listo» al borde. |
| **Diferenciación de vistas concentrada en `TopHeader` por props** | **Confirmada** | 2026-10-24 | Fondo nativo y acento azul unificados en toda la app; `TopHeader` recibe `variant="accent"` para modularidad escalable. |
| **Migración de gestos a Framer Motion** | **Descartada** | 2026-10-24 | Descartada para evitar dependencias pesadas innecesarias; resuelto con eventos táctiles nativos. |
| **Navegación Desktop mediante Sidebar persistente (>= 768px)** | **Confirmada** | 2026-10-25 | Implementado en `DesktopSidebar.tsx` y `App.tsx`; oculta Navbar móvil y expande catálogo a grilla responsiva de 2 columnas. |

---

## 4. Protocolo Obligatorio para Resolver Conflictos

Antes de cualquier modificación, consulta las directrices de este documento y el **Historial de Descarte**.

Si una solicitud contradice una decisión confirmada o intenta reintroducir un elemento descartado:
1. **Detención:** Detén inmediatamente la parte conflictiva.
2. **Explicación:** Explica la regla existente y la contradicción técnica.
3. **Alternativas:** Presenta las opciones disponibles de forma clara y concreta.
4. **Validación:** Espera la confirmación del usuario antes de modificar esa parte del código.
5. **Actualización:** Tras la decisión, actualiza este documento, elimina la opción descartada tanto del código como de la documentación, y registra el cambio en el `[Historial de Descarte]`.
