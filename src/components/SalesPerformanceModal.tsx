import { CheckCircle2, ChevronLeft, Flame, Repeat, ShoppingBag } from "lucide-react";
import React, { useMemo, useState } from "react";
import { Closure, ClosureTopSellerTx, Product, Sale } from "../types/domain";
import { formatCOP, formatShortDate } from "../utils/formatters";
import ModalSheet from "./ModalSheet";

interface SalesPerformanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartClose?: () => void;
  closures: Closure[];
  sales: Sale[];
  products: Product[];
  showCosts?: boolean;
}

interface ProductSellerStat {
  id: string;
  name: string;
  qty: number;
  revenue: number;
  profit: number;
  tx: ClosureTopSellerTx[];
}

interface ProductReturnedStat {
  id: string;
  name: string;
  qty: number;
  notes: string[];
}

export default function SalesPerformanceModal({
  isOpen,
  onClose,
  onStartClose,
  closures,
  sales,
  products,
  showCosts = false,
}: SalesPerformanceModalProps) {
  const [selectedCycleId, setSelectedCycleId] = useState<string>("actual");
  const [metricTab, setMetricTab] = useState<"sellers" | "returned">("sellers");
  const [openTxId, setOpenTxId] = useState<string | null>(null);

  // Helper para obtener costo promedio del producto
  const getProductAvgCost = useMemo(() => {
    const costMap = new Map<string, number>();
    for (const p of products) {
      const totalStock = p.batches.reduce((sum, b) => sum + b.stock, 0);
      const totalCost = p.batches.reduce((sum, b) => sum + b.cost * b.stock, 0);
      costMap.set(p.id, totalStock > 0 ? Math.round(totalCost / totalStock) : p.batches[0]?.cost || 0);
    }
    return (productId: string) => costMap.get(productId) || 0;
  }, [products]);

  // Último cierre para delimitar el ciclo actual
  const latestClosure = closures[0];

  const currentSales = useMemo(() => {
    if (!latestClosure) return sales;
    const closureDate = new Date(latestClosure.closedAt);
    return sales.filter((s) => new Date(s.createdAt) > closureDate);
  }, [sales, latestClosure]);

  const activeClosure = useMemo(() => {
    if (selectedCycleId === "actual") return null;
    return closures.find((c) => c.id === selectedCycleId) || null;
  }, [selectedCycleId, closures]);

  // Lista calculada de Más Vendidos
  const sellersList = useMemo<ProductSellerStat[]>(() => {
    if (activeClosure) {
      if (activeClosure.topSellers && activeClosure.topSellers.length > 0) {
        return activeClosure.topSellers.map((ts) => ({
          ...ts,
          tx: ts.tx || [],
        }));
      }
      // Reconciliación si no tenía pre-guardado
      const map: Record<string, ProductSellerStat> = {};
      const closureDate = new Date(activeClosure.closedAt);
      const cycleSales = sales.filter((s) => new Date(s.createdAt) <= closureDate);

      cycleSales.forEach((s) => {
        s.items.forEach((item) => {
          const cost = item.unitCostSnapshot ?? getProductAvgCost(item.productId);
          const r = (map[item.productId] ||= {
            id: item.productId,
            name: item.productName,
            qty: 0,
            revenue: 0,
            profit: 0,
            tx: [],
          });
          r.qty += item.qty;
          r.revenue += item.qty * item.unitPrice;
          r.profit += item.qty * (item.unitPrice - cost);
          r.tx.push({
            id: `${s.id}-${item.id}`,
            date: s.createdAt,
            customer: s.customerName,
            qty: item.qty,
            price: item.unitPrice,
          });
        });
      });
      return Object.values(map).sort((a, b) => b.qty - a.qty);
    }

    // Ciclo actual
    const map: Record<string, ProductSellerStat> = {};
    currentSales.forEach((s) => {
      s.items.forEach((item) => {
        const cost = item.unitCostSnapshot ?? getProductAvgCost(item.productId);
        const r = (map[item.productId] ||= {
          id: item.productId,
          name: item.productName,
          qty: 0,
          revenue: 0,
          profit: 0,
          tx: [],
        });
        r.qty += item.qty;
        r.revenue += item.qty * item.unitPrice;
        r.profit += item.qty * (item.unitPrice - cost);
        r.tx.push({
          id: `${s.id}-${item.id}`,
          date: s.createdAt,
          customer: s.customerName,
          qty: item.qty,
          price: item.unitPrice,
        });
      });
    });
    return Object.values(map).sort((a, b) => b.qty - a.qty);
  }, [activeClosure, currentSales, sales, getProductAvgCost]);

  // Lista calculada de Más Devueltos
  const returnedList = useMemo<ProductReturnedStat[]>(() => {
    if (activeClosure) {
      if (activeClosure.topReturned && activeClosure.topReturned.length > 0) {
        return activeClosure.topReturned.map((tr) => ({
          ...tr,
          notes: tr.notes || [],
        }));
      }
      return [];
    }

    // Ciclo actual
    const map: Record<string, ProductReturnedStat> = {};
    currentSales.forEach((s) => {
      s.items
        .filter((item) => item.warrantyClaimed)
        .forEach((item) => {
          const r = (map[item.productId] ||= {
            id: item.productId,
            name: item.productName,
            qty: 0,
            notes: [],
          });
          r.qty += item.qty;
          if (item.warrantyClaimNote) {
            r.notes.push(item.warrantyClaimNote);
          }
        });
    });
    return Object.values(map).sort((a, b) => b.qty - a.qty);
  }, [activeClosure, currentSales]);

  if (!isOpen) return null;

  return (
    <ModalSheet
      title="Rendimiento de Ventas"
      onClose={onClose}
      onStartClose={onStartClose}
      headerLeft={
        <button
          type="button"
          onClick={onClose}
          aria-label="Volver"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-[var(--text-primary)] hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 active:scale-95 transition-transform"
        >
          <ChevronLeft size={20} />
        </button>
      }
      className="max-h-[92vh]"
      contentClassName="p-4 space-y-4"
    >
      {/* 1. Selector de Período Consultado */}
      <section>
        <p className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase mb-2">
          PERÍODO CONSULTADO
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCycleId("actual")}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-colors duration-75 select-none ${
              selectedCycleId === "actual"
                ? "bg-blue-500 text-white shadow-sm"
                : "border border-zinc-200/80 dark:border-white/5 bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/10"
            }`}
          >
            Ciclo Actual
          </button>
          {closures.map((c) => {
            const isActive = selectedCycleId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCycleId(c.id)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-colors duration-75 select-none ${
                  isActive
                    ? "bg-blue-500 text-white shadow-sm"
                    : "border border-zinc-200/80 dark:border-white/5 bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/10"
                }`}
              >
                {c.periodLabel}
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Segmented Control de Métricas (2 Pestañas) */}
      <div className="rounded-2xl bg-zinc-100 dark:bg-zinc-900 p-1 grid grid-cols-2 gap-1 select-none">
        <button
          type="button"
          onClick={() => setMetricTab("sellers")}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 active:scale-95 ${
            metricTab === "sellers"
              ? "bg-blue-500 text-white shadow-sm"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Flame size={15} />
          <span>Más Vendidos</span>
        </button>

        <button
          type="button"
          onClick={() => setMetricTab("returned")}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 active:scale-95 ${
            metricTab === "returned"
              ? "bg-amber-500 text-white shadow-sm"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Repeat size={15} />
          <span>Más Devueltos</span>
        </button>
      </div>

      {/* 3. Listado de Datos según la Pestaña Activa */}
      <div className="space-y-3 pb-8">
        {metricTab === "sellers" ? (
          sellersList.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200/80 dark:border-white/5 bg-[var(--bg-elevated)] p-10 text-center shadow-sm">
              <ShoppingBag size={40} className="text-zinc-300 dark:text-zinc-600 mb-2" />
              <p className="text-sm font-medium text-[var(--text-secondary)]">
                No hay ventas registradas en este período.
              </p>
            </div>
          ) : (
            sellersList.map((item, idx) => {
              const isTxOpen = openTxId === item.id;

              return (
                <article
                  key={item.id}
                  className="rounded-2xl border border-zinc-200/80 dark:border-white/5 bg-[var(--bg-elevated)] p-4 shadow-sm space-y-2 transition-colors duration-75"
                >
                  {/* Encabezado: Posición, Nombre y Badge de unidades */}
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 text-sm font-extrabold text-zinc-400 shrink-0 pt-0.5">
                      {idx + 1}
                    </span>
                    <h4 className="flex-1 min-w-0 text-[15px] font-semibold text-[var(--text-primary)] leading-snug line-clamp-2">
                      {item.name}
                    </h4>
                    <span className="tabular-nums px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/15 text-blue-500 dark:text-blue-400 shrink-0">
                      {item.qty} uds
                    </span>
                  </div>

                  {/* Fila de Ingresos y Utilidad */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-100 dark:border-white/5">
                    <span className="text-[var(--text-secondary)] font-medium">
                      Ingresos: <strong className="text-[var(--text-primary)] font-bold tabular-nums">{formatCOP(item.revenue)}</strong>
                    </span>
                    <span className="text-emerald-500 font-bold tabular-nums">
                      {!showCosts ? "••••••" : `+${formatCOP(item.profit)}`}
                    </span>
                  </div>

                  {/* Transacciones desplegables */}
                  {item.tx.length > 0 && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setOpenTxId(isTxOpen ? null : item.id)}
                        className="text-xs font-medium text-blue-500 dark:text-blue-400 hover:underline active:scale-95 transition-transform"
                      >
                        {isTxOpen ? "Ocultar transacciones" : "Ver transacciones"}
                      </button>

                      {isTxOpen && (
                        <div className="mt-2.5 space-y-1.5 border-t border-zinc-100 dark:border-white/5 pt-2 animate-in fade-in duration-150">
                          {item.tx.map((t) => (
                            <div
                              key={t.id}
                              className="flex items-center justify-between text-xs text-[var(--text-secondary)] py-0.5"
                            >
                              <span className="truncate pr-2">
                                {formatShortDate(t.date)}{" "}
                                · {t.customer}
                              </span>
                              <span className="tabular-nums font-semibold text-[var(--text-primary)] shrink-0">
                                {t.qty}× {formatCOP(t.price)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })
          )
        ) : (
          returnedList.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200/80 dark:border-white/5 bg-[var(--bg-elevated)] p-10 text-center shadow-sm">
              <CheckCircle2 size={40} className="text-emerald-500 mb-2" />
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                Sin incidencias de garantía en este período
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Todos los productos se mantienen conformes y sin devoluciones.
              </p>
            </div>
          ) : (
            returnedList.map((item, idx) => (
              <article
                key={item.id}
                className="rounded-2xl border border-zinc-200/80 dark:border-white/5 bg-[var(--bg-elevated)] p-4 shadow-sm space-y-2 transition-colors duration-75"
              >
                <div className="flex items-start gap-2.5">
                  <span className="w-5 text-sm font-extrabold text-zinc-400 shrink-0 pt-0.5">
                    {idx + 1}
                  </span>
                  <h4 className="flex-1 min-w-0 text-[15px] font-semibold text-[var(--text-primary)] leading-snug line-clamp-2">
                    {item.name}
                  </h4>
                  <span className="tabular-nums px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
                    {item.qty} reclamos
                  </span>
                </div>

                {item.notes.length > 0 && (
                  <div className="border-t border-zinc-100 dark:border-white/5 pt-2 text-xs space-y-1 text-[var(--text-secondary)]">
                    {item.notes.map((note, nIdx) => (
                      <p key={nIdx} className="italic">
                        • {note}
                      </p>
                    ))}
                  </div>
                )}
              </article>
            ))
          )
        )}
      </div>
    </ModalSheet>
  );
}

