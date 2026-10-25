import { BarChart2, ChevronRight, Lock } from "lucide-react";
import React, { useMemo, useState } from "react";
import CycleClosingModal from "../components/CycleClosingModal";
import SalesPerformanceModal from "../components/SalesPerformanceModal";
import { useInventory } from "../context/InventoryContext";
import { formatCOP } from "../utils/formatters";

interface SummaryViewProps {
  onModalStateChange?: (open: boolean) => void;
}

export default function SummaryView({ onModalStateChange }: SummaryViewProps) {
  const { sales, products, closures, createClosure, showCosts } = useInventory();

  const [isPerformanceOpen, setIsPerformanceOpen] = useState(false);
  const [isClosingCycleOpen, setIsClosingCycleOpen] = useState(false);

  const handleOpenPerformance = () => {
    setIsPerformanceOpen(true);
    onModalStateChange?.(true);
  };

  const handleClosePerformance = () => {
    setIsPerformanceOpen(false);
    onModalStateChange?.(false);
  };

  const handleOpenCycleClose = () => {
    setIsClosingCycleOpen(true);
    onModalStateChange?.(true);
  };

  const handleCloseCycleClose = () => {
    setIsClosingCycleOpen(false);
    onModalStateChange?.(false);
  };

  // Cálculo financiero dinámico de métricas (Ingresos, Utilidad, Inventario)
  const totals = useMemo(() => {
    const revenue = sales.reduce((acc, s) => acc + s.totalAmount, 0);

    const cost = sales.reduce((acc, s) => {
      const saleCost = s.items.reduce((sAcc, item) => {
        let itemCost = item.unitCostSnapshot;
        if (itemCost === undefined) {
          const prod = products.find((p) => p.id === item.productId);
          const totalStock = prod?.batches.reduce((sum, b) => sum + b.stock, 0) || 0;
          const totalBatchCost = prod?.batches.reduce((sum, b) => sum + b.cost * b.stock, 0) || 0;
          itemCost = totalStock > 0 ? Math.round(totalBatchCost / totalStock) : prod?.batches[0]?.cost || 0;
        }
        return sAcc + item.qty * itemCost;
      }, 0);
      return acc + saleCost;
    }, 0);

    const stockValue = products.reduce((acc, p) => {
      return acc + p.batches.reduce((bAcc, b) => bAcc + b.cost * b.stock, 0);
    }, 0);

    return {
      revenue,
      profit: revenue - cost,
      stockValue,
    };
  }, [sales, products]);

  return (
    <div
      id="summary-scroll"
      className="quiral-scroll-container transition-colors duration-75"
    >
      <div className="mx-auto max-w-xl px-4 pb-28">
        {/* 1. Dashboard Principal de Métricas (KPI Cards - Referencia image_28.png) */}
        <section className="space-y-3">
          {/* Fila Superior: Ingresos y Utilidad */}
          <div className="grid grid-cols-2 gap-3">
            {/* Tarjeta Ingresos */}
            <div className="rounded-2xl p-4 bg-zinc-50/80 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/5 shadow-sm transition-colors duration-75">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Ingresos
              </span>
              <p className="tabular-nums text-2xl font-bold tracking-tight text-[var(--text-primary)] mt-1">
                {formatCOP(totals.revenue)}
              </p>
            </div>

            {/* Tarjeta Utilidad (Con modo privacidad ojito) */}
            <div className="rounded-2xl p-4 bg-zinc-50/80 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/5 shadow-sm transition-colors duration-75">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Utilidad
              </span>
              <p className="tabular-nums text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-1">
                {!showCosts ? "••••••" : formatCOP(totals.profit)}
              </p>
            </div>
          </div>

          {/* Tarjeta Ancho Completo: Inventario (Valor total valorizado en ámbar) */}
          <div className="rounded-2xl p-4 bg-zinc-50/80 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/5 shadow-sm transition-colors duration-75">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Inventario
            </span>
            <p className="tabular-nums text-2xl font-bold tracking-tight text-amber-500 mt-1">
              {!showCosts ? "••••••" : formatCOP(totals.stockValue)}
            </p>
          </div>
        </section>

        {/* 2. Tarjetas de Acción / Navegación (Estilo iOS Settings Row) */}
        <section className="mt-4 space-y-2.5">
          {/* Botón 1: Más Vendidos y Devueltos */}
          <button
            type="button"
            onClick={handleOpenPerformance}
            className="w-full rounded-2xl p-4 bg-[var(--bg-elevated)] border border-zinc-200/80 dark:border-white/5 shadow-sm flex items-center justify-between active:scale-[0.99] transition-transform text-left cursor-pointer select-none"
          >
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                <BarChart2 size={20} />
              </div>
              <div className="min-w-0">
                <h4 className="text-[15px] font-bold text-[var(--text-primary)] leading-snug truncate">
                  Más Vendidos y Devueltos
                </h4>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5 truncate">
                  Filtrar por ciclo actual o históricos
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-zinc-400 shrink-0" />
          </button>

          {/* Botón 2: Cerrar Ciclo */}
          <button
            type="button"
            onClick={handleOpenCycleClose}
            className="w-full rounded-2xl p-4 bg-[var(--bg-elevated)] border border-zinc-200/80 dark:border-white/5 shadow-sm flex items-center justify-between active:scale-[0.99] transition-transform text-left cursor-pointer select-none"
          >
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                <Lock size={19} />
              </div>
              <div className="min-w-0">
                <h4 className="text-[15px] font-bold text-[var(--text-primary)] leading-snug truncate">
                  Cerrar Ciclo
                </h4>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5 truncate">
                  Arqueo de caja y congelación de métricas
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-zinc-400 shrink-0" />
          </button>
        </section>

        {/* 3. Sección HISTORIAL DE CIERRES (X) */}
        <section className="mt-5">
          <h3 className="text-xs font-semibold tracking-wider text-zinc-400 uppercase mb-2.5">
            HISTORIAL DE CIERRES ({closures.length})
          </h3>

          <div className="space-y-3">
            {closures.length === 0 ? (
              <div className="rounded-2xl border border-zinc-200/80 dark:border-white/5 bg-[var(--bg-elevated)] p-8 text-center shadow-sm">
                <p className="text-sm font-medium text-[var(--text-secondary)]">
                  Aún no se han registrado cierres de ciclo.
                </p>
              </div>
            ) : (
              closures.map((closure) => (
                <article
                  key={closure.id}
                  className="rounded-2xl border border-zinc-200/80 dark:border-white/5 bg-[var(--bg-elevated)] p-4 shadow-sm transition-colors duration-75 space-y-2"
                >
                  {/* Encabezado: Rango de fechas en negrita y badge de fecha de ejecución */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[15px] font-bold text-[var(--text-primary)] leading-snug truncate">
                      {closure.periodLabel}
                    </span>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-white/10 text-zinc-400 font-medium whitespace-nowrap shrink-0">
                      {new Date(closure.closedAt).toLocaleDateString("es-CO", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Fila Inferior: Vendido y Utilidad en verde */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-100 dark:border-white/5">
                    <span className="text-[var(--text-secondary)] font-medium">
                      Vendido:{" "}
                      <strong className="text-[var(--text-primary)] font-bold tabular-nums">
                        {formatCOP(closure.totalSold)}
                      </strong>
                    </span>
                    <span className="text-emerald-500 font-semibold tabular-nums">
                      Utilidad: {!showCosts ? "••••••" : `+${formatCOP(closure.netProfit)}`}
                    </span>
                  </div>

                  {/* Nota opcional de arqueo */}
                  {closure.differenceNote && (
                    <p className="text-xs text-[var(--text-secondary)] pt-1 italic border-t border-zinc-100 dark:border-white/5">
                      Nota: {closure.differenceNote}
                    </p>
                  )}
                </article>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Modal 1: Rendimiento de Ventas */}
      <SalesPerformanceModal
        isOpen={isPerformanceOpen}
        onClose={handleClosePerformance}
        closures={closures}
        sales={sales}
        products={products}
        showCosts={showCosts}
      />

      {/* Modal 2: Cierre de Ciclo */}
      <CycleClosingModal
        isOpen={isClosingCycleOpen}
        onClose={handleCloseCycleClose}
        sales={sales}
        products={products}
        showCosts={showCosts}
        onConfirmClose={createClosure}
      />
    </div>
  );
}

