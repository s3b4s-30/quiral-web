# SKILLS_INDEX.md — Registro Oficial del Ecosistema de Habilidades (.agents/skills/)

**Proyecto:** Quiral POS (PWA v1.0.1)  
**Entorno de Agentes:** Google Antigravity (AGY)  
**Ubicación:** `.agents/skills/`  
**Documentos Rectores:** [`AGENTS.md`](../AGENTS.md) · [`DESIGN_GUIDELINES.md`](../DESIGN_GUIDELINES.md) · [`QUIRAL_V1.0.1_DOCS.md`](../QUIRAL_V1.0.1_DOCS.md) · [`PRODUCT.md`](../PRODUCT.md) · [`DESIGN.md`](../DESIGN.md)

---

## 1. Visión General del Ecosistema

El directorio `.agents/skills/` aloja las capacidades modulares que extienden el comportamiento de los agentes de IA dentro de Quiral POS. Cada habilidad está empaquetada bajo el estándar oficial de Antigravity (`SKILL.md` con metadatos YAML frontmatter) y opera bajo el principio de **divulgación progresiva** (*progressive disclosure*), cargándose en contexto únicamente cuando la tarea lo requiere.

El ecosistema se organiza en **dos niveles arquitectónicos**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   ECOSISTEMA DE SKILLS — QUIRAL POS                    │
├────────────────────────────────────────────────────────────────────────┤
│ TIER 1: NÚCLEO ARQUITECTÓNICO QUIRAL (Específico del Proyecto)         │
│  1. quiral-ui-hig       -> Apple HIG, Dual OLED, Safe Areas, pb-32     │
│  2. quiral-pos-engine   -> Inventario Multi-Lote, RPC Supabase, COP   │
│  3. google-stitch       -> Conexión MCP y Pipeline Google Stitch       │
│  4. stitch-design       -> Traducción Visual Stitch -> Tailwind OLED   │
├────────────────────────────────────────────────────────────────────────┤
│ TIER 2: INTELIGENCIA TRANSVERSAL Y CRAFT (Diseño, Hooks y Seguridad)   │
│  5. impeccable          -> Craft UI/UX, Auditoría Automática y Hooks   │
│  6. ui-ux-pro-max       -> Inteligencia de Diseño UI/UX Multidisciplina│
│  7. ui-styling          -> shadcn/ui, Radix UI & Primitivas Tailwind   │
│  8. security-audit      -> Auditoría de Vulnerabilidades y RLS Supabase│
│  9. design-system       -> Arquitectura de Tokens en 3 Capas           │
│ 10. design              -> Hub Integral de Diseño, CIP, Logo e Iconos  │
│ 11. brand               -> Identidad de Marca, Voz y Directrices       │
│ 12. banner-design       -> Banners y Creativos Multiformato            │
│ 13. slides              -> Presentaciones HTML Estratégicas (Chart.js) │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Matriz de Habilidades Instaladas

| Skill ID | Nivel | Propósito Principal | Cuándo Activar (Triggers) | Invocación |
| :--- | :---: | :--- | :--- | :--- |
| [`quiral-ui-hig`](./skills/quiral-ui-hig/SKILL.md) | **Tier 1** | Auditoría y creación de UI bajo Apple HIG, Dual OLED y prevención de descarte. | Modificaciones de vistas, Bottom Sheets, botones en footer, safe-areas o padding anti-colisión. | Automática en tareas de frontend / Lectura directa. |
| [`quiral-pos-engine`](./skills/quiral-pos-engine/SKILL.md) | **Tier 1** | Estado global (`InventoryContext`), stock multi-lote determinista y RPCs de venta en Supabase. | Modificación de lógica comercial, balanceo de stock maestro, transacciones `complete_sale` o formatos COP. | Automática en lógica de negocio / Lectura directa. |
| [`google-stitch`](./skills/google-stitch/SKILL.md) | **Tier 1** | Conexión con Stitch MCP Server y pipeline de conversión de prototipos Stitch. | Trabajo con herramientas MCP de Stitch, consulta de proyectos o importación de pantallas exportadas. | Por demanda ante flujos con Google Stitch / MCP. |
| [`stitch-design`](./skills/stitch-design/SKILL.md) | **Tier 1** | Mapeo visual de componentes Stitch a Tailwind Dual OLED, contención de cifras y `pb-32`. | Adaptación visual de tarjetas, métricas, dashboards o controles exportados desde Stitch a Quiral. | Por demanda al diseñar o traducir componentes de Stitch. |
| [`impeccable`](./skills/impeccable/SKILL.md) | **Tier 2** | Motor de craft UI/UX, auditoría en tiempo real con hooks post-escritura y contexto en `PRODUCT.md` / `DESIGN.md`. | Auditoría continua de interfaz, verificación de anti-patrones, `detect`, `/impeccable init`, `/impeccable hooks on`. | Automática vía hooks y manual con `/impeccable`. |
| [`ui-ux-pro-max`](./skills/ui-ux-pro-max/SKILL.md) | **Tier 2** | Base de conocimiento local UI/UX: 79 estilos, 192 paletas, 74 tipografías, 119 guías UX. | Auditorías profundas de UX, rediseño de flujos, problemas de accesibilidad (a11y) o dirección visual. | Por demanda mediante scripts Python o guías de referencia. |
| [`ui-styling`](./skills/ui-styling/SKILL.md) | **Tier 2** | Implementación de componentes accesibles tipo shadcn/ui con Radix UI y Tailwind CSS. | Creación de componentes atómicos complejos (dialogs, dropdowns, popovers, command palettes). | Por demanda durante la maquetación de componentes atómicos. |
| [`security-audit`](./skills/security-audit/SKILL.md) | **Tier 2** | Auditoría defensiva de vulnerabilidades en código, APIs, RLS de PostgreSQL y secretos. | Revisión de políticas RLS en Supabase, verificación de anon keys vs service keys o pentesting. | Modo *Guidance* o *Full Audit* ante petición explícita. |
| [`design-system`](./skills/design-system/SKILL.md) | **Tier 2** | Arquitectura de tokens en 3 capas (Primitive $\rightarrow$ Semantic $\rightarrow$ Component) y CSS variables. | Creación o refactorización de tokens de diseño, temas visuales o especificación de componentes. | Por demanda ante cambios en el sistema de diseño. |
| [`design`](./skills/design/SKILL.md) | **Tier 2** | Hub integral de diseño: identidad, generación de logotipos (Gemini), CIP, banners e iconos SVG. | Solicitudes de identidad visual, rediseño de logos, material promocional o iconografía corporativa. | On-demand con enrutamiento hacia sub-habilidades. |
| [`brand`](./skills/brand/SKILL.md) | **Tier 2** | Gobernanza de voz de marca, directrices de tono, marcos de mensajes y validación de activos. | Redacción de copys, alineación de tono de marca o sincronización de directrices con tokens. | On-demand mediante scripts Node.js. |
| [`banner-design`](./skills/banner-design/SKILL.md) | **Tier 2** | Creación de banners creativos multiformato (redes sociales, display ads, hero sections, print). | Requerimientos de piezas publicitarias, banners de producto o campañas visuales. | On-demand con cuestionario guiado de requerimientos. |
| [`slides`](./skills/slides/SKILL.md) | **Tier 2** | Presentaciones estratégicas en HTML con Chart.js, diseño por componentes y fórmulas copywriting. | Creación de pitch decks para inversores, presentaciones comerciales o reportes ejecutivos. | On-demand mediante subcomando `create`. |

---

## 3. Protocolos de Invocación y Uso para Agentes

### Protocolo 1: Modificación de Vistas o Componentes de UI
1. **Activar:** [`quiral-ui-hig`](./skills/quiral-ui-hig/SKILL.md) e [`impeccable`](./skills/impeccable/SKILL.md).
2. **Consultar:** [`DESIGN_GUIDELINES.md`](../DESIGN_GUIDELINES.md) y [`DESIGN.md`](../DESIGN.md) para verificar el *Historial de Descarte* y la rampa de tokens.
3. **Aplicar Estándares:**
   - Cabeceras 100% sólidas sin blur.
   - Botón de acción en el `footer` de `ModalSheet` con safe-areas.
   - Contención numérica `.tabular-nums` y padding inferior `pb-32`.
4. **Validar:** `npm run build` y `npx tsc --noEmit`.

### Protocolo 2: Modificación de Inventario, Carrito o Supabase
1. **Activar:** [`quiral-pos-engine`](./skills/quiral-pos-engine/SKILL.md).
2. **Consultar:** [`QUIRAL_V1.0.1_DOCS.md`](../QUIRAL_V1.0.1_DOCS.md) y [`PRODUCT.md`](../PRODUCT.md) para verificar RLS y el RPC `complete_sale`.
3. **Aplicar Estándares:**
   - Distribución determinista de lotes en `adjustMasterStock` (sin saldos negativos).
   - Validaciones previas de carrito ($0 \le \text{total} \le \text{subtotal}$).
   - Formateo estricto con `formatCOP`.
4. **Validar:** `npm run build` y `npx tsc --noEmit`.

### Protocolo 3: Importación de Diseños desde Google Stitch
1. **Activar:** [`google-stitch`](./skills/google-stitch/SKILL.md) y [`stitch-design`](./skills/stitch-design/SKILL.md).
2. **Conectar:** Verificar credenciales en `.env` (`VITE_STITCH_API_KEY`) y servidor MCP en `~/.gemini/config/mcp_config.json`.
3. **Traducir:** Mapear tokens a variables Dual OLED (`var(--bg-primary)`, `var(--bg-elevated)`), aplicar contención elástica en cifras grandes y asegurar `pb-32`.
4. **Validar:** `npm run build` y `npx tsc --noEmit`.

### Protocolo 4: Auditoría de Seguridad o Integridad de Datos
1. **Activar:** [`security-audit`](./skills/security-audit/SKILL.md).
2. **Ejecutar:** Inspección de políticas RLS `is_store_member`, exclusión de service role keys en frontend y validación de sanitización de inputs.
