import React from "react";
import { Product } from "../types/domain";
import { formatCOP } from "../utils/formatters";

export interface ProductCardProps {
  product: Product;
  mode?: "pos" | "inventory";
  inCart?: number;
  onAddToCart?: (productId: string) => void;
  onSelectProduct?: (product: Product) => void;
  supplierColors?: Map<string, string>;
  showCosts?: boolean;
  avgCost?: number;
  profitPerUnit?: number;
  className?: string;
}

export const ProductCard = React.memo(function ProductCard({
  product,
  mode = "pos",
  inCart = 0,
  onAddToCart,
  onSelectProduct,
  supplierColors,
  showCosts = false,
  avgCost = 0,
  profitPerUnit = 0,
  className = "",
}: ProductCardProps) {
  const stock = product.batches.reduce((sum, batch) => sum + batch.stock, 0);
  const isAvailable = stock > 0;

  const handleClick = () => {
    if (mode === "pos") {
      if (isAvailable && onAddToCart) {
        onAddToCart(product.id);
      }
    } else if (onSelectProduct) {
      onSelectProduct(product);
    }
  };

  return (
    <article
      role="button"
      tabIndex={isAvailable || mode === "inventory" ? 0 : -1}
      aria-label={
        mode === "pos"
          ? `Agregar ${product.name} al carrito`
          : `Ver detalle de ${product.name}`
      }
      onClick={handleClick}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleClick();
        }
      }}
      className={`rounded-2xl border border-zinc-100 dark:border-white/5 bg-[var(--bg-elevated)] p-3.5 shadow-sm outline-none transition-colors duration-75 select-none focus-visible:ring-2 focus-visible:ring-[#007aff] ${
        isAvailable || mode === "inventory"
          ? "cursor-pointer active:scale-[0.99] hover:border-blue-500/40"
          : "opacity-50 cursor-not-allowed"
      } ${className}`}
    >
      {/* 1. Fila Superior: Título completo (hasta 2 líneas) + subtítulo a la izquierda, Precio a la derecha */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0 pr-2">
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-[var(--text-primary)]">
            {product.name}
          </h3>
          {product.subtitle && (
            <p className="mt-0.5 truncate text-xs text-[var(--text-secondary)]">
              {product.subtitle}
            </p>
          )}
        </div>

        <div className="shrink-0 text-right">
          <span className="tabular-nums whitespace-nowrap text-base sm:text-lg font-extrabold text-[var(--text-primary)]">
            {formatCOP(product.price)}
          </span>
        </div>
      </div>

      {/* 2. Separador horizontal sutil y disimulado */}
      <div className="mt-3 flex items-center justify-between border-t border-zinc-100 dark:border-white/5 pt-2.5">
        {/* Footer Izquierda: Unidades y puntos de lote */}
        <div className="flex items-center gap-2">
          <span
            className={`tabular-nums text-xs font-bold ${
              stock > 0 ? "text-[#30d158]" : "text-[#ff3b30]"
            }`}
          >
            {stock} uds
          </span>
          <div className="flex items-center gap-1">
            {product.batches
              .filter((batch) => batch.stock > 0)
              .map((batch) => {
                const color = supplierColors?.get(batch.supplierId) ?? "#007aff";
                return (
                  <span
                    key={batch.id}
                    className="h-2 w-2 rounded-full ring-1 ring-black/5 dark:ring-white/10"
                    style={{ backgroundColor: color }}
                  />
                );
              })}
          </div>
        </div>

        {/* Footer Derecha: Acción o métricas */}
        {mode === "pos" ? (
          <div className="shrink-0">
            {inCart > 0 ? (
              <span
                aria-label={`${inCart} unidades seleccionadas`}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-xs font-bold leading-none text-white shadow-sm"
              >
                {inCart}
              </span>
            ) : isAvailable ? (
              <span className="pointer-events-none rounded-full bg-zinc-100 dark:bg-white/10 px-3 py-1 text-xs font-semibold text-blue-500 transition-colors duration-75">
                + Agregar
              </span>
            ) : (
              <span className="pointer-events-none rounded-full bg-black/5 dark:bg-white/10 px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)]">
                Agotado
              </span>
            )}
          </div>
        ) : showCosts ? (
          <div className="text-right text-xs shrink-0">
            <span className="text-[var(--text-secondary)]">Costo: </span>
            <span className="tabular-nums font-semibold text-[var(--text-primary)]">
              {formatCOP(avgCost)}
            </span>
            <span className="tabular-nums ml-2 font-bold text-[#30d158]">
              +{formatCOP(profitPerUnit)}
            </span>
          </div>
        ) : null}
      </div>
    </article>
  );
});

export default ProductCard;

