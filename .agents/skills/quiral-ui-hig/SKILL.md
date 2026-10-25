---
name: quiral-ui-hig
description: >-
  Protocolo de desarrollo y auditoría UI/UX bajo Apple Human Interface Guidelines (HIG) y Tailwind CSS para Quiral POS.
  Úsalo obligatoriamente al crear o modificar vistas, componentes, modales (Bottom Sheets), botones en footer persistente,
  cálculo de safe-areas, espaciado anti-colisión (pb-32/pb-44), control de overflow numérico y temas duales OLED.
---

# Quiral UI/UX & Apple HIG Standards Skill

Esta Skill guía a los agentes de IA y desarrolladores en la implementación y auditoría de la interfaz de usuario de **Quiral POS**. Asegura el cumplimiento riguroso de Apple HIG, ergonomía móvil de mostrador, navegación dual adaptativa y prevención de defectos visuales en WebKit iOS.

---

## 1. Verificación Previa Obligatoria (Checklist de Descarte)

Antes de generar o modificar cualquier componente o vista, verifica que tu código **NO** reintroduzca ninguno de los patrones descartados en [`DESIGN_GUIDELINES.md`](file:///c:/Users/Sebas/Desktop/elytras/quiral-pwa/DESIGN_GUIDELINES.md):

- [ ] **Sin cabeceras con blur en scroll:** Las cabeceras de vistas con scroll deben ser 100% sólidas opacas (`.quiral-top-header` o `bg-[var(--bg-elevated)]`). Nunca uses `backdrop-blur` en cabeceras de scroll.
- [ ] **Desmontaje de Navbar en modales:** La `Navbar` debe desmontarse a nivel raíz con `!hasActiveModal` para evitar colisiones de *stacking context*.
- [ ] **Botones en footer persistente:** Los botones de acción principal en modales («Guardar», «Listo», «Completar venta») deben residir en el slot `footer` de `ModalSheet`, anclados a `env(safe-area-inset-bottom)`.
- [ ] **Sin padding insuficiente:** Los contenedores principales de scroll deben tener `pb-32` (o `pb-44` en POS con carrito activo) para no quedar tapados por componentes flotantes.
- [ ] **Sin tipografías fijas sobredimensionadas:** Cifras monetarias de métricas deben usar escala fluida `text-lg sm:text-xl md:text-2xl font-bold tabular-nums tracking-tight truncate`.
- [ ] **Nomenclatura formal:** Usar siempre "Cubo" en lugar de "Cubito Cargador".
- [ ] **Modo Administrador único:** No duplicar textos ni botones de modo administrador; usar únicamente `AdminCompactButton`.

---

## 2. Patrones de Componentes Estándar

### A. Estructura de Modal / Bottom Sheet (`ModalSheet`)
```tsx
import ModalSheet from "./ModalSheet";

export default function MiModal({ isOpen, onClose }: Props) {
  return (
    <ModalSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Título del Modal"
      footer={
        <button
          type="button"
          onClick={handleSubmit}
          className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#007aff] text-sm sm:text-base font-bold text-white shadow-lg active:scale-[0.98] transition-transform duration-75"
        >
          Guardar cambios
        </button>
      }
    >
      <div className="space-y-4">
        {/* Contenido desplazable independiente */}
      </div>
    </ModalSheet>
  );
}
```

### B. Precios en Tarjetas de Catálogo (`ProductCard`)
```tsx
<div className="flex items-center justify-between min-w-0 gap-2">
  <div className="flex-1 min-w-0 pr-1">
    <h3 className="line-clamp-2 text-sm sm:text-[15px] font-semibold leading-snug text-[var(--text-primary)]">
      {product.name}
    </h3>
  </div>

  <div className="text-right shrink-0 max-w-[55%]">
    <span className="tabular-nums text-sm sm:text-base md:text-lg font-extrabold text-[var(--text-primary)] leading-tight whitespace-nowrap">
      {formatCOP(product.price)}
    </span>
  </div>
</div>
```

### C. Fila de Costos / Márgenes con Envoltura Elástica
```tsx
<div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border-color)] pt-2 text-[11px] sm:text-xs">
  <span className="text-[var(--text-secondary)]">Costo:</span>
  <span className="tabular-nums font-semibold text-[var(--text-primary)]">{formatCOP(avgCost)}</span>
  <span className="tabular-nums font-bold text-[#30d158]">+{formatCOP(profit)}</span>
</div>
```

---

## 3. Protocolo de Espaciado Anti-Colisión

Aplica las siguientes clases en los contenedores de scroll:

| Vista | Clase de Padding Móvil | Clase Desktop (`md:`) | Justificación |
| :--- | :--- | :--- | :--- |
| `SummaryView` | `pb-32` | `md:pb-12` | Despeja `Navbar` (60px) + margen de seguridad. |
| `InventoryView` | `pb-32` | `md:pb-12` | Despeja `Navbar` y `FloatingCartFAB`. |
| `PosView` | `${cartUnits > 0 ? "pb-44 sm:pb-36" : "pb-32"}` | `md:pb-12` | Despeja `CartSummaryBar` (~64px) cuando hay unidades en carrito. |
| `HistoryView` | `pb-32` | `md:pb-12` | Despeja `Navbar` y botón flotante de venta. |

---

## 4. Control de Calidad al Concluir Cambios de UI

Siempre que termines de editar la interfaz:
1. Comprueba que no existan errores de TypeScript:
   ```bash
   npx tsc --noEmit
   ```
2. Ejecuta la compilación de producción:
   ```bash
   npm run build
   ```
3. Verifica que no haya advertencias de chunks ni desbordamientos en resoluciones de 320px, 375px y 768px.
