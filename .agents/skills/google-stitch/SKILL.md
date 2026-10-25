---
name: google-stitch
description: >-
  Puente de traducción, integración y adaptación de diseños e interfaces creadas en Google Stitch
  hacia el código de producción de Quiral PWA. Úsalo al recibir especificaciones, pantallas,
  componentes o tokens de diseño desde Google Stitch o su servidor MCP, para convertirlos a
  React 18, Tailwind CSS y TypeScript estricto respetando Apple HIG, Dual OLED y la Trinidad Documental.
---

# Google Stitch to Quiral POS Integration Skill

Esta Skill establece el puente operativo oficial para traducir especificaciones visuales, prototipos, pantallas y componentes generados en **Google Stitch** (mediante el servidor Stitch MCP o exportaciones de código/diseño) al código de producción de **Quiral POS**.

Garantiza que cualquier vista o componente inspirado o exportado desde Stitch se adapte determinísticamente a la **Trinidad Documental** ([`AGENTS.md`](file:///c:/Users/Sebas/Desktop/elytras/quiral-pwa/AGENTS.md), [`DESIGN_GUIDELINES.md`](file:///c:/Users/Sebas/Desktop/elytras/quiral-pwa/DESIGN_GUIDELINES.md) y [`QUIRAL_V1.0.1_DOCS.md`](file:///c:/Users/Sebas/Desktop/elytras/quiral-pwa/QUIRAL_V1.0.1_DOCS.md)) sin introducir patrones descartados ni romper la arquitectura dual OLED o la ergonomía táctil de mostrador.

---

## 1. Conexión del Servidor MCP (`stitch-mcp`)

El agente se comunica con los proyectos de Stitch mediante el protocolo MCP (Model Context Protocol). La configuración reside en `~/.gemini/config/mcp_config.json`:

```json
{
  "mcpServers": {
    "stitch": {
      "command": "npx",
      "args": ["-y", "@_davideast/stitch-mcp", "proxy"],
      "env": {
        "GOOGLE_CLOUD_PROJECT": "TU_PROYECTO_GCP",
        "STITCH_API_KEY": "TU_STITCH_API_KEY"
      }
    }
  }
}
```

### Herramientas MCP Habituales de Stitch
- `list_projects`: Lista los proyectos de diseño disponibles en Stitch.
- `list_screens`: Obtiene la lista de pantallas, vistas y componentes diseñados para un proyecto.
- `get_screen`: Devuelve las especificaciones de layout, jerarquía visual y tokens de una pantalla específica.
- `get_screen_code`: Extrae la plantilla HTML/Tailwind o React generada por Stitch.

---

## 2. Motor de Traducción de Tokens (Stitch $\rightarrow$ Quiral Dual OLED)

Cualquier fragmento de código o estilo proveniente de Stitch debe ser transformado siguiendo esta tabla de equivalencias estricta:

| Propiedad / Estilo en Stitch | Clase Reemplazo en Quiral POS | Justificación Arquitectónica |
| :--- | :--- | :--- |
| `bg-white` / `bg-slate-50` / `bg-gray-50` | `bg-[var(--bg-elevated)]` | Adapta la tarjeta a modo dual: `#ffffff` en claro y `#141416` en OLED oscuro. |
| `bg-gray-100` / `bg-slate-100` / `bg-zinc-100` | `bg-[var(--bg-primary)]` | Fondo base unificado de la app: `#f2f2f7` en claro y `#000000` (negro puro OLED). |
| `text-slate-900` / `text-gray-900` / `text-black` | `text-[var(--text-primary)]` | `#000000` en claro y `#ffffff` en oscuro. |
| `text-slate-500` / `text-gray-500` / `text-zinc-400` | `text-[var(--text-secondary)]` | Gris de sistema Apple `#8e8e93`. |
| `border-gray-200` / `border-slate-200` | `border-[var(--border-color)]` | Borde de sistema `#e5e5ea` en claro y `#262629` en oscuro. |
| `bg-blue-600` / botones primarios genéricos | `bg-[#007aff]` o `bg-blue-500` | Azul nativo de sistema iOS. |
| `bg-green-500` / alertas de éxito | `bg-[#30d158]` o `text-[#30d158]` | Verde de éxito Apple HIG. |
| `transition-colors duration-200` | *(Eliminar o anular)* | `.transition-colors` se anula a nivel CSS para evitar parpadeos blanco/negro en OLED. |
| `backdrop-blur-md` en cabeceras de scroll | *(Eliminar blur)* `bg-[var(--bg-elevated)]` | **Prohibido:** WebKit Safari genera parpadeo y cortes gráficos con blur en cabeceras. |
| `min-h-screen` / `h-screen overflow-auto` | `.quiral-scroll-container` | Quiral bloquea el body (`overflow: hidden`) y usa contenedores táctiles desacoplados. |

---

## 3. Reglas de Protección Numérica para Moneda COP

Los diseños de Stitch suelen asumir números cortos (ej. `$45` o `$1.200`). En el mercado colombiano, las cifras alcanzan frecuentemente 8 a 11 caracteres (`$150.000.000 COP`).

Al traducir una tarjeta o métrica de Stitch a Quiral:

1. **Clase Tabular Obligatoria:** Agrega siempre `.tabular-nums` para que los dígitos mantengan un ancho constante y legible.
2. **Formateador Universal:** Reemplaza cadenas estáticas por llamadas a `formatCOP(valor)`.
3. **Escala Elástica en Bloques de Métricas:**
   ```tsx
   {/* Stitch original: <h2 className="text-3xl font-bold">$150,000,000</h2> */}
   {/* Traducción Quiral POS: */}
   <p className="text-lg sm:text-xl md:text-2xl font-bold tabular-nums tracking-tight truncate text-[var(--text-primary)] mt-1">
     {formatCOP(metrica.total)}
   </p>
   ```
4. **Contención en Filas de Listado y Catálogo:**
   ```tsx
   {/* Contenedor flexible con shrink-0 en el precio y truncate en el título */}
   <div className="flex items-center justify-between min-w-0 gap-2">
     <h4 className="line-clamp-2 text-sm sm:text-[15px] font-semibold text-[var(--text-primary)] min-w-0 flex-1">
       {producto.nombre}
     </h4>
     <div className="text-right shrink-0 max-w-[55%]">
       <span className="tabular-nums text-sm sm:text-base md:text-lg font-extrabold text-[var(--text-primary)] leading-tight whitespace-nowrap">
         {formatCOP(producto.precio)}
       </span>
     </div>
   </div>
   ```
5. **Envoltura en Desgloses Multi-Métrica:**
   Si Stitch presenta una fila con varios valores (Costo, Margen, Unidades), convierte el contenedor en `flex flex-wrap items-center justify-between gap-2` con tipografía compacta `text-[11px] sm:text-xs`.

---

## 4. Arquitectura de Layout y Márgenes Anti-Colisión (`pb-32`)

Cualquier vista, pantalla o dashboard adaptado desde Stitch debe insertarse dentro del esquema de navegación de Quiral:

1. **Móvil (< 768px):**
   - El contenido se desplaza dentro de `.quiral-scroll-container`.
   - **Padding inferior obligatorio:** Debe llevar `pb-32` (8rem) para garantizar que los últimos elementos no queden ocultos bajo la `Navbar` flotante ni el botón `FloatingCartFAB`.
   - En vistas de punto de venta con carrito activo, usa `${cartUnits > 0 ? "pb-44 sm:pb-36" : "pb-32"}` para despejar el `CartSummaryBar`.
2. **Escritorio (>= 768px):**
   - La `Navbar` móvil se oculta automáticamente.
   - El layout convive con [`DesktopSidebar.tsx`](file:///c:/Users/Sebas/Desktop/elytras/quiral-pwa/src/components/DesktopSidebar.tsx) (`w-64`).
   - El padding inferior se reduce fluidamente a `md:pb-12`.
3. **Modales y Hojas Flotantes:**
   - Si Stitch propone un diálogo o drawer, tradúcelo utilizando `ModalSheet`.
   - Los botones de acción principal (como «Confirmar», «Guardar», «Pagar») **nunca** se colocan al final del scroll; deben ir en la prop `footer={<button className="flex min-h-12 w-full ...">...</button>}` respetando `env(safe-area-inset-bottom)`.

---

## 5. Checklist de Verificación al Importar Diseños de Stitch

Antes de dar por concluida la integración de un diseño de Stitch:

- [ ] **Fondo y Superficies:** ¿Se reemplazaron `bg-white`/`bg-gray-100` por `var(--bg-elevated)` y `var(--bg-primary)`?
- [ ] **Modo Oscuro OLED:** ¿Se verificó que el fondo oscuro sea `#000000` y no un gris azulado `bg-slate-900`?
- [ ] **Cabeceras:** ¿Se eliminaron todos los `backdrop-blur` en cabeceras de scroll?
- [ ] **Montos y Moneda:** ¿Tienen `.tabular-nums`, escala responsive y pasan por `formatCOP`?
- [ ] **Protección de Ancho:** ¿Los precios en listas tienen `shrink-0 max-w-[55%]` y los textos adyacentes `truncate`?
- [ ] **Margen Inferior:** ¿El contenedor de scroll principal tiene `pb-32` (o `pb-44` en POS con carrito)?
- [ ] **Botones Principales en Modales:** ¿Residen en el footer persistente de `ModalSheet`?
- [ ] **Compilación Limpia:** Ejecutar `npm run build` y `npx tsc --noEmit` comprobando código de salida `0`.
