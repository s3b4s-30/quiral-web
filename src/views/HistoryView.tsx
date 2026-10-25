import { Search, X } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useInventory } from "../context/InventoryContext";
import { formatCOP, formatShortDate, getWarrantyStatus } from "../utils/formatters";

interface HistoryViewProps {
  onGoToPOS?: () => void;
}

export default function HistoryView({ onGoToPOS }: HistoryViewProps) {
  const { sales, toggleItemWarranty } = useInventory();
  const [openSaleId, setOpenSaleId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filteredSales = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sales;
    return sales.filter((sale) => {
      const matchCustomer = sale.customerName.toLowerCase().includes(q);
      const matchNumber = String(sale.saleNumber).includes(q);
      const matchItem = sale.items.some((it) =>
        it.productName.toLowerCase().includes(q)
      );
      return matchCustomer || matchNumber || matchItem;
    });
  }, [sales, query]);

  return (
    <div id="history-scroll" className="quiral-scroll-container transition-colors duration-75">
      <div className="mx-auto max-w-xl md:max-w-4xl lg:max-w-5xl px-4">
        {/* Header sticky con fondo sólido opaco nativo (Apple HIG) */}
        <div className="sticky top-0 z-20 -mx-4 px-4 pt-1 pb-2.5 mb-4 bg-[var(--bg-primary)] border-b border-[var(--border-color)] transition-colors duration-75">
          <div className="relative">
            <div className="flex min-h-12 items-center gap-2.5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-elevated)] px-3.5 shadow-sm transition-colors duration-75 focus-within:border-[#007aff]">
              <Search size={18} className="text-[var(--text-secondary)] shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar venta por cliente o #..."
                className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)] transition-colors duration-75"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-black/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:bg-white/10 transition-colors duration-75"
                  aria-label="Limpiar búsqueda"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Listado de Ventas en Historial */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-24">
          {filteredSales.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-[var(--border-color)] bg-[var(--bg-elevated)] p-10 text-center shadow-sm">
              <p className="text-sm font-medium text-[var(--text-secondary)]">
                {query
                  ? "No se encontraron ventas que coincidan con la búsqueda."
                  : "Sin ventas registradas en el historial."}
              </p>
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="mt-4 inline-flex items-center justify-center rounded-xl bg-[#007aff] px-4 py-2 text-xs font-bold text-white shadow-sm"
                >
                  Restablecer búsqueda
                </button>
              )}
            </div>
          ) : (
            filteredSales.map((sale) => {
              const isOpen = openSaleId === sale.id;

              return (
                <article
                  key={sale.id}
                  onClick={() => setOpenSaleId(isOpen ? null : sale.id)}
                  className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-elevated)] p-3.5 shadow-sm transition-colors duration-75 cursor-pointer select-none active:scale-[0.99] hover:border-blue-500/40"
                >
                  {/* Fila principal: Número de venta + Cliente | Total a la derecha */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="line-clamp-1 text-[15px] font-bold text-[var(--text-primary)]">
                        #{sale.saleNumber} · {sale.customerName}
                      </h3>
                      <p className="mt-0.5 truncate text-xs text-[var(--text-secondary)]">
                        {formatShortDate(sale.createdAt)}{" "}
                        · {sale.paymentMethod}
                        {sale.items.length > 0 && ` · ${sale.items.reduce((s, it) => s + it.qty, 0)} uds`}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="tabular-nums whitespace-nowrap text-base sm:text-lg font-extrabold text-[var(--text-primary)]">
                        {formatCOP(sale.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Detalle desplegable de productos y garantías */}
                  {isOpen && (
                    <div className="mt-3 pt-3 border-t border-[var(--border-color)] space-y-2.5 animate-in fade-in duration-150">
                      {sale.items.map((item) => {
                        const w = getWarrantyStatus(
                          sale.createdAt,
                          item.warrantyDays,
                          item.warrantyClaimed
                        );

                        return (
                          <div
                            key={item.id}
                            className="rounded-xl bg-black/[0.02] dark:bg-white/[0.03] p-3 border border-[var(--border-color)] space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-sm font-semibold text-[var(--text-primary)]">
                                {item.qty}× {item.productName}
                              </span>
                              <span className="tabular-nums text-xs font-semibold text-[var(--text-secondary)]">
                                {formatCOP(item.unitPrice * item.qty)}
                              </span>
                            </div>

                            {/* Fila de Cobertura de Garantía */}
                            <div className="flex items-center justify-between gap-2 pt-0.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  w.status === "claimed"
                                    ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                                    : w.status === "expired"
                                    ? "bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-400"
                                    : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                }`}
                              >
                                {w.label}
                              </span>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleItemWarranty(sale.id, item.id);
                                }}
                                className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline active:scale-95 transition-transform"
                              >
                                {item.warrantyClaimed
                                  ? "Revertir garantía"
                                  : "Reclamar garantía"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </article>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}
