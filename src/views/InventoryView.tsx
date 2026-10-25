import { Search, X } from "lucide-react";
import React, { useMemo, useState } from "react";
import ProductCard from "../components/ProductCard";
import { useInventory } from "../context/InventoryContext";
import { ProductCategory } from "../types/domain";
import { formatCOP } from "../utils/formatters";

interface InventoryViewProps {
  onOpenSuppliers: () => void;
}

const CATEGORY_CHIPS: Array<"Todos" | ProductCategory> = [
  "Todos",
  "Cargadores y Cables",
  "Forros / Fundas",
  "Audio / AirPods",
];

export default function InventoryView({ onOpenSuppliers: _onOpenSuppliers }: InventoryViewProps) {
  const {
    products,
    getSupplier,
    showCosts,
    setSelectedProduct,
    loading,
  } = useInventory();

  // Filtros
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"Todos" | ProductCategory>("Todos");

  // Listado filtrado de productos
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === "Todos" || p.category === selectedCategory;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.subtitle && p.subtitle.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [products, selectedCategory, query]);

  // Métricas financieras del inventario cuando Modo Costos está activo
  const inventoryStats = useMemo(() => {
    let totalStock = 0;
    let totalInventoryCost = 0;
    let totalPotentialRevenue = 0;

    for (const p of products) {
      for (const b of p.batches) {
        totalStock += b.stock;
        totalInventoryCost += b.cost * b.stock;
        totalPotentialRevenue += p.price * b.stock;
      }
    }

    return {
      totalStock,
      totalCost: totalInventoryCost,
      potentialRevenue: totalPotentialRevenue,
      potentialProfit: totalPotentialRevenue - totalInventoryCost,
    };
  }, [products]);

  return (
    /* Contenedor Principal: Único elemento responsable del scroll vertical en la vista */
    <div id="inventory-scroll" className="quiral-scroll-container pt-16 transition-colors duration-75">
      <div className="mx-auto max-w-xl md:max-w-4xl lg:max-w-5xl px-4">
        {/* 1. Buscador y Filtros Fijos con Fondo Sólido Opaco Nativo (Apple HIG) */}
        <div className="sticky top-0 z-20 -mx-4 px-4 pt-1 pb-2.5 mb-4 bg-[var(--bg-primary)] border-b border-[var(--border-color)] transition-colors duration-75">
          <div className="relative mb-3">
            <div className="flex min-h-12 items-center gap-2.5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-elevated)] px-3.5 shadow-sm transition-colors duration-75 focus-within:border-[#007aff]">
              <Search size={18} className="text-[var(--text-secondary)] shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar en catálogo..."
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

          {/* 2. Chips Horizontales de Selección de Categoría */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORY_CHIPS.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-colors duration-75 select-none ${
                    isActive
                      ? "bg-[#007aff] text-white shadow-sm"
                      : "border border-[var(--border-color)] bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/10"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Resumen de Costos y Valor cuando Modo Costos está Activo */}
        {showCosts && (
          <section className="mb-4 overflow-hidden rounded-2xl border border-[#007aff]/30 bg-[#007aff]/5 p-3.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#007aff] dark:text-[#0a84ff]">
              <span>Auditoría de Costos y Valorización</span>
              <span className="rounded-full bg-[#007aff]/15 px-2 py-0.5 text-[10px] font-bold text-[#007aff] dark:text-[#0a84ff]">
                Activo
              </span>
            </div>
            <div className="mt-2.5 grid grid-cols-1 min-[360px]:grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-[var(--bg-elevated)] p-2 border border-[var(--border-color)] min-w-0">
                <p className="text-[10px] font-medium text-[var(--text-secondary)]">Stock Total</p>
                {loading ? (
                  <div className="mx-auto h-4 w-12 rounded bg-black/5 dark:bg-white/10 animate-pulse mt-1" />
                ) : (
                  <p className="text-xs min-[400px]:text-sm sm:text-base font-bold tabular-nums tracking-tight text-[var(--text-primary)] mt-0.5 truncate">
                    {inventoryStats.totalStock} uds
                  </p>
                )}
              </div>
              <div className="rounded-xl bg-[var(--bg-elevated)] p-2 border border-[var(--border-color)] min-w-0">
                <p className="text-[10px] font-medium text-[var(--text-secondary)]">Inversión Costo</p>
                {loading ? (
                  <div className="mx-auto h-4 w-16 rounded bg-black/5 dark:bg-white/10 animate-pulse mt-1" />
                ) : (
                  <p className="text-xs min-[400px]:text-sm sm:text-base font-bold tabular-nums tracking-tight text-[#ff9500] mt-0.5 truncate">
                    {formatCOP(inventoryStats.totalCost)}
                  </p>
                )}
              </div>
              <div className="rounded-xl bg-[var(--bg-elevated)] p-2 border border-[var(--border-color)] min-w-0">
                <p className="text-[10px] font-medium text-[var(--text-secondary)]">Utilidad Potencial</p>
                {loading ? (
                  <div className="mx-auto h-4 w-16 rounded bg-black/5 dark:bg-white/10 animate-pulse mt-1" />
                ) : (
                  <p className="text-xs min-[400px]:text-sm sm:text-base font-bold tabular-nums tracking-tight text-[#30d158] mt-0.5 truncate">
                    +{formatCOP(inventoryStats.potentialProfit)}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* 4. Listado de Tarjetas de Productos con Grilla Responsiva y Espaciado Seguro */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-32">
          {loading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={`inv-skeleton-${idx}`}
                className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-elevated)] p-4 shadow-sm animate-pulse flex flex-col justify-between h-40"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-24 rounded-full bg-black/5 dark:bg-white/10" />
                    <div className="h-5 w-16 rounded-full bg-black/5 dark:bg-white/10" />
                  </div>
                  <div className="h-5 w-4/5 rounded-lg bg-black/5 dark:bg-white/10" />
                  <div className="h-3 w-1/3 rounded bg-black/5 dark:bg-white/10" />
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)]">
                  <div className="h-6 w-28 rounded-lg bg-black/5 dark:bg-white/10" />
                  <div className="h-7 w-20 rounded-xl bg-black/5 dark:bg-white/10" />
                </div>
              </div>
            ))
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-[var(--border-color)] bg-[var(--bg-elevated)] p-8 sm:p-10 text-center shadow-sm select-none animate-in fade-in duration-150">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#007aff]/10 text-[#007aff] dark:text-[#0a84ff] mb-3">
                <Search size={26} />
              </div>
              <h4 className="text-base font-bold text-[var(--text-primary)]">
                Catálogo sin resultados
              </h4>
              <p className="mt-1 text-xs sm:text-sm font-medium text-[var(--text-secondary)] max-w-sm mx-auto">
                No se encontraron productos que coincidan con la búsqueda o la categoría activa.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSelectedCategory("Todos");
                }}
                className="mt-4 inline-flex items-center justify-center rounded-xl bg-[#007aff] px-4 py-2 text-xs font-bold text-white shadow-sm active:scale-95 transition-transform"
              >
                Restablecer filtros
              </button>
            </div>
          ) : (
            filteredProducts.map((product) => {
              const totalStock = product.batches.reduce((sum, b) => sum + b.stock, 0);

              const supplierColors = new Map(
                product.batches.map((b) => [b.supplierId, getSupplier(b.supplierId)?.color ?? "#007aff"])
              );

              const totalBatchCost = product.batches.reduce(
                (sum, b) => sum + b.cost * b.stock,
                0
              );
              const avgCost = totalStock > 0 ? Math.round(totalBatchCost / totalStock) : 0;
              const profitPerUnit = product.price - avgCost;

              return (
                <ProductCard
                  key={product.id}
                  mode="inventory"
                  product={product}
                  onSelectProduct={setSelectedProduct}
                  supplierColors={supplierColors}
                  showCosts={showCosts}
                  avgCost={avgCost}
                  profitPerUnit={profitPerUnit}
                />
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}
