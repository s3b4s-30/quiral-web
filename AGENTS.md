# AGENTS.md — Protocolo Permanente para Asistentes y Desarrolladores

Bienvenido al repositorio de **Quiral POS**. Este documento establece las directivas técnicas, protocolos de gobernanza y estándares operativos obligatorios para cualquier asistente de inteligencia artificial, agente autónomo o desarrollador que inspeccione o modifique esta base de código.

---

## 1. Documentos de Referencia Obligatoria (Fuentes de Verdad)

Antes de planificar, sugerir o ejecutar cualquier modificación en el proyecto, **es imperativo consultar los documentos rectores**:

| Documento | Alcance y Contenido Técnico | Cuándo Consultar |
| :--- | :--- | :--- |
| [`DESIGN_GUIDELINES.md`](./DESIGN_GUIDELINES.md) | **Arquitectura Visual y Sistema de Diseño:** Estándares Apple HIG, temas duales OLED, Bottom Sheets, navegación responsiva (Móvil vs Desktop), safe-areas, márgenes anti-colisión y el **Historial de Descarte**. | Antes de intervenir vistas, componentes, estilos Tailwind, modales, tipografía o flujos táctiles. |
| [`QUIRAL_V1.0.1_DOCS.md`](./QUIRAL_V1.0.1_DOCS.md) | **Arquitectura Técnica y Datos:** Modelado PostgreSQL en Supabase, políticas RLS multi-tenant, RPC atómico `complete_sale`, sincronización Realtime, lógica multi-lote, tipos de dominio TypeScript y pipeline de build en Vite. | Antes de modificar lógica de estado (`InventoryContext`), consultas Supabase, cálculos comerciales, formateadores o configuración de empaquetado. |

### Habilidades Especializadas (.agents/skills/)
El ecosistema completo de habilidades operativas reside en [`.agents/SKILLS_INDEX.md`](./.agents/SKILLS_INDEX.md):
- **Núcleo Quiral (Tier 1):** [`quiral-ui-hig`](./.agents/skills/quiral-ui-hig/SKILL.md) (UI/Apple HIG), [`quiral-pos-engine`](./.agents/skills/quiral-pos-engine/SKILL.md) (Inventario y Supabase), [`google-stitch`](./.agents/skills/google-stitch/SKILL.md) (MCP Stitch), [`stitch-design`](./.agents/skills/stitch-design/SKILL.md) (Diseño Stitch).
- **Inteligencia Transversal (Tier 2):** [`ui-ux-pro-max`](./.agents/skills/ui-ux-pro-max/SKILL.md), [`ui-styling`](./.agents/skills/ui-styling/SKILL.md), [`security-audit`](./.agents/skills/security-audit/SKILL.md), [`design-system`](./.agents/skills/design-system/SKILL.md), [`design`](./.agents/skills/design/SKILL.md), [`brand`](./.agents/skills/brand/SKILL.md), [`banner-design`](./.agents/skills/banner-design/SKILL.md), [`slides`](./.agents/skills/slides/SKILL.md).

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
