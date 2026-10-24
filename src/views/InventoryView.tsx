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
    <div id="inventory-scroll" className="quiral-scroll-container transition-colors duration-75">
      <div className="mx-auto max-w-xl px-4">
        {/* 1. Buscador de Ancho Completo con efecto liquid glass */}
        <div className="sticky top-0 z-20 -mx-4 px-4 pt-1 pb-2 mb-4 bg-white/85 dark:bg-black/85 backdrop-blur-md border-b border-zinc-100 dark:border-white/5 transition-colors duration-75">
          <div className="relative mb-3">
            <div className="flex min-h-12 items-center gap-2.5 rounded-2xl border border-zinc-100 dark:border-white/5 bg-[var(--bg-elevated)] px-3.5 shadow-sm transition-colors duration-75 focus-within:border-[#007aff]">
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
                      : "border border-zinc-100 dark:border-white/5 bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/10"
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
            <div className="mt-2.5 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-[var(--bg-elevated)] p-2 border border-zinc-100 dark:border-white/5">
                <p className="text-[10px] font-medium text-[var(--text-secondary)]">Stock Total</p>
                <p className="tabular-nums text-sm font-bold text-[var(--text-primary)] mt-0.5">
                  {inventoryStats.totalStock} uds
                </p>
              </div>
              <div className="rounded-xl bg-[var(--bg-elevated)] p-2 border border-zinc-100 dark:border-white/5">
                <p className="text-[10px] font-medium text-[var(--text-secondary)]">Inversión Costo</p>
                <p className="tabular-nums text-sm font-bold text-[#ff9500] mt-0.5">
                  {formatCOP(inventoryStats.totalCost)}
                </p>
              </div>
              <div className="rounded-xl bg-[var(--bg-elevated)] p-2 border border-zinc-100 dark:border-white/5">
                <p className="text-[10px] font-medium text-[var(--text-secondary)]">Utilidad Potencial</p>
                <p className="tabular-nums text-sm font-bold text-[#30d158] mt-0.5">
                  +{formatCOP(inventoryStats.potentialProfit)}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* 4. Listado de Tarjetas de Productos */}
        <section className="space-y-3 pb-24">
          {filteredProducts.length === 0 ? (
            <div className="rounded-3xl border border-zinc-100 dark:border-white/5 bg-[var(--bg-elevated)] p-10 text-center shadow-sm">
              <p className="text-sm font-medium text-[var(--text-secondary)]">
                No se encontraron productos que coincidan con la búsqueda o categoría.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSelectedCategory("Todos");
                }}
                className="mt-4 inline-flex items-center justify-center rounded-xl bg-[#007aff] px-4 py-2 text-xs font-bold text-white shadow-sm"
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
                  product={product}
                  mode="inventory"
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
