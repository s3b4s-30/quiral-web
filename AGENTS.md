# AGENTS.md — Protocolo Permanente para Asistentes y Desarrolladores

Bienvenido al repositorio de **Quiral POS**. Este documento establece las directivas técnicas, protocolos de gobernanza y estándares operativos obligatorios para cualquier asistente de inteligencia artificial, agente autónomo o desarrollador que inspeccione o modifique esta base de código.

---

## 1. Documentos de Referencia Obligatoria (Fuentes de Verdad)

Antes de planificar, sugerir o ejecutar cualquier modificación en el proyecto, **es imperativo consultar los documentos rectores**:

| Documento | Alcance y Contenido Técnico | Cuándo Consultar |
| :--- | :--- | :--- |
| [`DESIGN_GUIDELINES.md`](./DESIGN_GUIDELINES.md) | **Arquitectura Visual y Sistema de Diseño:** Estándares Apple HIG, temas duales OLED, Bottom Sheets, navegación responsiva (Móvil vs Desktop), safe-areas, márgenes anti-colisión y el **Historial de Descarte**. | Antes de intervenir vistas, componentes, estilos Tailwind, modales, tipografía o flujos táctiles. |
| [`QUIRAL_V1.0.1_DOCS.md`](./QUIRAL_V1.0.1_DOCS.md) | **Arquitectura Técnica y Datos:** Modelado PostgreSQL en Supabase, políticas RLS multi-tenant, RPC atómico `complete_sale`, sincronización Realtime, lógica multi-lote, tipos de dominio TypeScript y pipeline de build en Vite. | Antes de modificar lógica de estado (`InventoryContext`), consultas Supabase, cálculos comerciales, formateadores o configuración de empaquetado. |
| [`PRODUCT.md`](./PRODUCT.md) | **Verdad del Producto y Contexto Impeccable:** Definición de usuarios, casos de uso de mostrador, posicionamiento de mercado, capacidades y principios estratégicos. | Al inicializar contexto de diseño, flujos `/impeccable init` o auditorías de propuesta de valor. |
| [`DESIGN.md`](./DESIGN.md) | **Tokens y Especificación Formal Impeccable/Stitch:** Rampa tipográfica Apple HIG, paleta Dual OLED, escala de espaciados anti-colisión (`pb-32`/`pb-44`) y reglas Do's/Don'ts. | Durante revisiones de detector Impeccable (`detect`), traducción de pantallas o creación de componentes. |

### Habilidades Especializadas (.agents/skills/)
El ecosistema completo de habilidades operativas reside en [`.agents/SKILLS_INDEX.md`](./.agents/SKILLS_INDEX.md):
- **Núcleo Quiral (Tier 1):** [`quiral-ui-hig`](./.agents/skills/quiral-ui-hig/SKILL.md) (UI/Apple HIG), [`quiral-pos-engine`](./.agents/skills/quiral-pos-engine/SKILL.md) (Inventario y Supabase), [`google-stitch`](./.agents/skills/google-stitch/SKILL.md) (MCP Stitch), [`stitch-design`](./.agents/skills/stitch-design/SKILL.md) (Diseño Stitch).
- **Inteligencia Transversal y Craft (Tier 2):** [`impeccable`](./.agents/skills/impeccable/SKILL.md) (Craft UI/UX y Hooks), [`ui-ux-pro-max`](./.agents/skills/ui-ux-pro-max/SKILL.md), [`ui-styling`](./.agents/skills/ui-styling/SKILL.md), [`security-audit`](./.agents/skills/security-audit/SKILL.md), [`design-system`](./.agents/skills/design-system/SKILL.md), [`design`](./.agents/skills/design/SKILL.md), [`brand`](./.agents/skills/brand/SKILL.md), [`banner-design`](./.agents/skills/banner-design/SKILL.md), [`slides`](./.agents/skills/slides/SKILL.md).

---

## 2. Principio de Inviolabilidad del Historial de Descarte

La sección `[Historial de Descarte]` en [`DESIGN_GUIDELINES.md`](./DESIGN_GUIDELINES.md) registra formalmente decisiones tomadas para subsanar defectos en WebKit iOS, PWA standalone y ergonomía de mostrador.

> [!CAUTION]
> **Queda estrictamente prohibido reintroducir patrones, textos o estilos previamente descartados**, tales como:
> - Cabeceras translúcidas con `backdrop-blur` en vistas con scroll.
> - Barra inferior (`Navbar`) visible simultáneamente con modales activos.
> - Botones de acción principal alojados al final de contenedores desplazables.
> - Padding insuficiente (`pb-24`) que provoque colisiones visuales con la `Navbar`, `FloatingCartFAB` o `CartSummaryBar`.
> - Tipografías fijas sobredimensionadas (`text-3xl`, `text-2xl` estático) en tarjetas de métricas monetarias.
> - Términos informales o desaprobados (ej. "Cubito Cargador" $\rightarrow$ debe ser siempre "Cubo").
> - Controles duplicados o desbordados de «Modo administrador».

---

## 3. Protocolo de Resolución de Conflictos

Si una instrucción del usuario o un nuevo requerimiento entra en conflicto con una regla de [`DESIGN_GUIDELINES.md`](./DESIGN_GUIDELINES.md) o [`QUIRAL_V1.0.1_DOCS.md`](./QUIRAL_V1.0.1_DOCS.md):
1. **Detención inmediata:** Detén la ejecución de la parte afectada.
2. **Explicación técnica:** Notifica al usuario detallando la regla confirmada y la contradicción detectada.
3. **Presentación de alternativas:** Expón las opciones viables y su impacto en el sistema.
4. **Decisión del usuario:** Espera la instrucción expresa del usuario antes de proceder.
5. **Actualización de documentación:** Si el usuario decide cambiar la regla, actualiza [`DESIGN_GUIDELINES.md`](./DESIGN_GUIDELINES.md) o [`QUIRAL_V1.0.1_DOCS.md`](./QUIRAL_V1.0.1_DOCS.md) inmediatamente y elimina la opción anterior del código.

---

## 4. Estándares Operativos y Control de Calidad

### A. Tipado TypeScript Estricto
- Queda prohibido el uso de `@ts-ignore`, `@ts-nocheck` o el escape deliberado con `any`.
- Los tipos del dominio residen centralizados en `src/types/domain.ts`. Cualquier nueva entidad debe tiparse formalmente allí.

### B. Seguridad Multi-Tenant
- Toda mutación o consulta a Supabase debe aislarse mediante el identificador de tienda (`store_id`) y someterse a las políticas RLS (`is_store_member`).
- No exponer Service Role Keys en el cliente; el frontend opera exclusivamente con la Anon Key pública.

### C. Lógica de Inventario y Formateo
- Las existencias totales de un producto deben reflejar determinísticamente la suma exacta de sus lotes individuales.
- El ajuste de stock maestro en `InventoryContext` debe añadir al lote con mayor cantidad y sustraer del lote con mayor stock disponible, sin permitir saldos negativos.
- Todos los precios y fechas deben procesarse mediante los formateadores universales de `src/utils/formatters.ts` (`formatCOP`, `formatUnits`, `formatShortDate`, etc.) y lucir la clase CSS `.tabular-nums`.

### D. Verificación Obligatoria de Compilación
Antes de dar por concluida cualquier tarea, es obligatorio ejecutar la suite de compilación y validar salida limpia:
```bash
npx tsc --noEmit
npm run build
```
Ambos comandos deben finalizar con código de salida `0`, cero errores de TypeScript y cero advertencias de exceso de tamaño de chunk en Vite.

---

## 5. Directivas Maestras e Invarianza de Arquitectura para Nuevas IAs Sucesoras

Este compendio es el testamento técnico y la guía de navegación para cualquier modelo de lenguaje o agente autónomo que continúe el desarrollo de Quiral POS. Todo agente que herede esta base de código debe interiorizar los siguientes axiomas inviolables:

### 1. Invarianza de Inventario Multi-Lote y Transacciones Atómicas
- **Derivación Determinística de Stock:** El stock total de un producto nunca se almacena como un valor independiente mutable; es siempre y exclusivamente la suma aritmética de sus lotes individuales (`product.batches.reduce((sum, b) => sum + b.stock, 0)`). Modificar el stock maestro sin impactar un lote específico rompe la integridad contable.
- **Transacción Atómica `complete_sale`:** Las ventas se procesan mediante el RPC `complete_sale` en PostgreSQL. Toda venta congela de forma inmutable el costo unitario del lote seleccionado en el momento de la transacción (`unitCostSnapshot: batch.cost`). Esto garantiza que los informes de utilidad neta en `SummaryView` sean históricamente exactos aun si los costos del catálogo cambian en el futuro.
- **Aislamiento del Modo Demo (`30` / `30`):** El bypass demo está diseñado para pruebas operativas y evaluación en mostrador. Cuando `isDemoUser === true`, las mutaciones no persisten en las tablas de producción de Supabase para evitar contaminación entre tenants.

### 2. Ergonomía Apple HIG y Renderizado Dual OLED
- **Prohibición de Filtros Translúcidos en Movimiento (`backdrop-blur`):** iOS Safari y WebKit sufren fallas severas de recomposición visual (*rasterization thrashing*) al desplazar vistas sobre capas con `backdrop-blur`. Todas las cabeceras fijas (`TopHeader`), tarjetas y modales deben utilizar fondos sólidos OLED nativos con variables CSS semánticas (`var(--bg-elevated)`, `var(--bg-card)` y `var(--bg-main)`).
- **Escala de Espaciado Anti-Colisión:** Toda vista desplazable (`PosView`, `InventoryView`, `HistoryView`, `SummaryView`) debe terminar con una clase de padding inferior de salvaguarda:
  - `pb-32` (`8rem` / 128px) como margen base para no quedar oculta bajo la `Navbar` flotante.
  - `pb-44` (`11rem` / 176px) dinámico cuando la barra o botón flotante del carrito (`FloatingCartFAB` / `CartSummaryBar`) esté visible.
- **Formateo Monetario Universal y Tipografía Tabular:**
  - El 100% de las cifras numéricas y precios en pesos colombianos deben pasar por `formatCOP(amount)` de `src/utils/formatters.ts`.
  - Es obligatorio aplicar la clase CSS `.tabular-nums` a cualquier elemento que contenga dígitos o métricas financieras para impedir el salto de anchura horizontal en renderizado dinámico.
- **Estandarización de Estados Vacíos (Empty States):** Ninguna lista vacía debe mostrar un contenedor en blanco o un texto plano sin diseño. Debe implementar la tríada Apple HIG:
  1. Contenedor de ícono estilizado (`w-14 h-14 rounded-2xl` con borde y fondo elevado).
  2. Título semántico directo (`text-base font-semibold`).
  3. Párrafo explicativo contextual (`text-sm text-[var(--text-secondary)]`) y botón de acción para restablecer filtros o crear el primer elemento.

### 3. Aislamiento Multi-Tenant Estricto y Seguridad
- **Condición Ineludible de Tenant (`store_id`):** Ninguna consulta o mutación (`select`, `upsert`, `delete`) puede ejecutarse contra Supabase sin el calificador `.eq("store_id", storeId)`. Todas las tablas en la base de datos están protegidas por RLS con la función `is_store_member(target_store)`.
- **Canales Realtime Aislados:** Cada suscripción WebSockets en `InventoryContext` debe filtrar eventos por tienda (`filter: "store_id=eq." + storeId`).
- **Anon Key Exclusiva:** El cliente web jamás debe recibir ni manipular Service Role Keys. Toda lógica con privilegios elevados debe residir en funciones RPC `SECURITY DEFINER` auditadas en PostgreSQL.

### 4. Orquestación Limpia de la Interfaz
- **Desmontaje Preventivo de Navegación Flotante (`!hasActiveModal`):** `App.tsx` evalúa reactivamente si existe algún modal abierto (`NewProductModal`, `ProductDetailModal`, `CheckoutSheet`, `ProfileSecurityModal`, `StoreProfileModal`, `AdvancedFiltersModal`, etc.). Si hay un modal activo, la `Navbar` y el botón del carrito (`FloatingCartFAB`) se desmontan completamente del DOM para eliminar cualquier conflicto de `z-index`, superposición o captura accidental de eventos táctiles.
- **Componente Universal `ModalSheet`:** Todo modal secundario debe implementarse como hijo de `ModalSheet.tsx` para garantizar soporte táctil unificado (*swipe down to dismiss*), bloqueo de scroll de fondo y alineación en escritorio.
