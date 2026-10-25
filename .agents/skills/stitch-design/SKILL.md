---
name: stitch-design
description: >-
  Protocolo de integración, traducción y adaptación de componentes visuales de Google Stitch
  hacia Quiral PWA. Aplica obligatoriamente para mapear pantallas, tarjetas de métricas, controles táctiles
  y dashboards de Stitch a Tailwind CSS, temas duales OLED, contención tipográfica numérica (.tabular-nums)
  y padding inferior anti-colisión (pb-32).
---

# Google Stitch Design Integration Skill (Quiral POS)

Esta Skill define el estándar oficial de ingeniería y diseño para importar, consultar y traducir especificaciones visuales, plantillas o componentes generados en **Google Stitch** hacia la base de código de **Quiral POS (v1.0.1)**.

Su aplicación es obligatoria para garantizar la coherencia con la **Trinidad Documental**:
- [`AGENTS.md`](file:///c:/Users/Sebas/Desktop/elytras/quiral-pwa/AGENTS.md): Gobernanza y control de calidad.
- [`DESIGN_GUIDELINES.md`](file:///c:/Users/Sebas/Desktop/elytras/quiral-pwa/DESIGN_GUIDELINES.md): Sistema de diseño Apple HIG, Dual OLED y el *Historial de Descarte*.
- [`QUIRAL_V1.0.1_DOCS.md`](file:///c:/Users/Sebas/Desktop/elytras/quiral-pwa/QUIRAL_V1.0.1_DOCS.md): Arquitectura de software y flujo de datos.

---

## 1. Credenciales y Contexto de Entorno

La integración con la API de Google Stitch se realiza mediante la variable de entorno protegida:
- `VITE_STITCH_API_KEY`: Alojada de forma segura en `.env` (nunca hardcodear credenciales en componentes ni subirlas al repositorio).
- Cliente / Servicios: Al interactuar con endpoints de diseño de Stitch, consumir exclusivamente la clave desde `import.meta.env.VITE_STITCH_API_KEY`.

---

## 2. Traducción de Componentes Visuales (Stitch a Tailwind & Dual OLED)

Cualquier pantalla, card, tabla o dashboard proveniente de Stitch debe mapear sus colores genéricos a los **tokens semánticos de Quiral**:

### A. Tabla de Mapeo de Tokens
| Elemento en Stitch | Clase Tailwind en Quiral POS | Comportamiento Dual OLED |
| :--- | :--- | :--- |
| Fondo general de vista (`bg-gray-100`, `bg-slate-50`) | `bg-[var(--bg-primary)]` | `#f2f2f7` (Claro) / `#000000` (Negro Puro OLED). |
| Tarjeta / Superficie (`bg-white`, `bg-slate-100`) | `bg-[var(--bg-elevated)]` | `#ffffff` (Claro) / `#141416` (Gris Oscuro OLED). |
| Texto de títulos (`text-slate-900`, `text-black`) | `text-[var(--text-primary)]` | `#000000` (Claro) / `#ffffff` (Oscuro). |
| Texto secundario / leyendas (`text-gray-500`) | `text-[var(--text-secondary)]` | `#8e8e93` (Gris de sistema Apple). |
| Bordes de tarjetas y divisores (`border-gray-200`) | `border-[var(--border-color)]` | `#e5e5ea` (Claro) / `#262629` (Oscuro). |
| Botón de acción principal (`bg-blue-600`) | `bg-[#007aff]` o `bg-blue-500` | Azul nativo de sistema iOS. |
| Estados de éxito / ganancias | `text-[#30d158]`, `bg-[#30d158]` | Verde de éxito Apple HIG. |

### B. Regla Anti-Blur en Cabeceras
- **Prohibido:** No utilizar `backdrop-blur` en cabeceras de vistas con scroll generadas en Stitch.
- **Solución Obligatoria:** Las cabeceras fijas deben ser 100% sólidas opacas (`bg-[var(--bg-elevated)]` o `.quiral-top-header`) para erradicar artefactos de renderizado en WebKit iOS Safari.

### C. Anulación de Transición de Color
- Stitch suele exportar `transition-colors duration-200`. En Quiral, `.transition-colors` se anula a nivel global para que el cambio de tema entre modo Claro y modo Oscuro OLED sea instantáneo y sin parpadeos.

---

## 3. Contención Tipográfica Numérica Obligatoria

Los montos en pesos colombianos (COP) alcanzan cifras de 8 a 11 caracteres (`$150.000.000 COP`). Los componentes de Stitch deben protegerse contra desbordamientos:

### A. Clase Tabular y Formateo
- Todo monto monetario, stock, costo o utilidad debe lucir obligatoriamente la clase `.tabular-nums`.
- Las cadenas monetarias se procesan con `formatCOP(valor)` desde [`src/utils/formatters.ts`](file:///c:/Users/Sebas/Desktop/elytras/quiral-pwa/src/utils/formatters.ts).

### B. Escala Elástica para Cifras en Tarjetas de Métricas
En bloques de KPIs, resúmenes y dashboards:
```tsx
{/* Escala fluida y truncamiento preventivo */}
<p className="text-lg sm:text-xl md:text-2xl font-bold tabular-nums tracking-tight truncate text-[var(--text-primary)] mt-1">
  {formatCOP(metrica.total)}
</p>
```

### C. Contenedor Flexible con Protección de Ancho en Catálogos
En tarjetas de producto o filas donde el precio se ubica a la derecha:
```tsx
<div className="flex items-center justify-between min-w-0 gap-2">
  {/* Título contenido que trunca */}
  <h4 className="line-clamp-2 text-sm sm:text-[15px] font-semibold text-[var(--text-primary)] min-w-0 flex-1">
    {producto.name}
  </h4>

  {/* Precio rígido que no se achica ni rompe */}
  <div className="text-right shrink-0 max-w-[55%]">
    <span className="tabular-nums text-sm sm:text-base md:text-lg font-extrabold text-[var(--text-primary)] leading-tight whitespace-nowrap">
      {formatCOP(producto.price)}
    </span>
  </div>
</div>
```

### D. Envoltura en Filas de Múltiples Valores
Cuando una tarjeta de Stitch desglose varias cifras (ej. Costo, Margen, Unidades), aplicar `flex flex-wrap items-center justify-between gap-2` con tipografía compacta `text-[11px] sm:text-xs` para evitar que la tarjeta reviente los bordes en pantallas menores a 360px.

---

## 4. Seguridad contra Colisiones de UI (Padding Inferior `pb-32`)

Para garantizar que ningún botón, tarjeta o texto quede oculto tras la barra de navegación flotante (`Navbar`) o el botón flotante de punto de venta (`FloatingCartFAB`):

1. **Vistas Estándar de Scroll (`SummaryView`, `InventoryView`, `HistoryView`):**
   - El contenedor desplazable principal debe incluir obligatoriamente la clase `pb-32` (8rem / 128px de padding inferior).
   - En pantallas de escritorio (`md:`), el padding se reduce a `md:pb-12`.
2. **Punto de Venta (`PosView`):**
   - Padding dinámico: `${cartUnits > 0 ? "pb-44 sm:pb-36" : "pb-32"}` para respetar adicionalmente la barra de checkout (`CartSummaryBar`).
3. **Modales y Bottom Sheets (`ModalSheet`):**
   - Si Stitch propone un modal, diálogo o drawer, adaptarlo dentro de `ModalSheet`.
   - El botón de acción principal **nunca** debe alojarse al final del scroll; debe ubicarse en el slot persistente `footer` con `env(safe-area-inset-bottom)`.

---

## 5. Checklist de Verificación para Diseños Stitch

Antes de integrar código o estilos adaptados desde Stitch:

- [ ] ¿Los colores usan variables de Quiral (`var(--bg-primary)`, `var(--bg-elevated)`, `var(--border-color)`)?
- [ ] ¿El fondo oscuro es `#000000` (negro puro OLED)?
- [ ] ¿Se eliminaron los `backdrop-blur` en cabeceras de scroll?
- [ ] ¿Todo número monetario tiene `.tabular-nums` y pasa por `formatCOP`?
- [ ] ¿Las cifras grandes usan la escala elástica `text-lg sm:text-xl md:text-2xl font-bold tracking-tight truncate`?
- [ ] ¿Las tarjetas de catálogo usan `flex items-center justify-between min-w-0 gap-2` con `shrink-0` en el precio?
- [ ] ¿El contenedor principal de scroll tiene la clase `pb-32`?
- [ ] ¿Se ejecutó `npm run build` con código de salida `0` y cero errores?
