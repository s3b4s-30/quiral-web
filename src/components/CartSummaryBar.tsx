import { ArrowRight, ShoppingCart } from "lucide-react";
import { formatCOP } from "../utils/formatters";

export interface CartSummaryBarProps {
  units: number;
  total: number;
  onCheckout: () => void;
}

export default function CartSummaryBar({ units, total, onCheckout }: CartSummaryBarProps) {
  if (units <= 0) return null;

  return (
    <div
      role="region"
      aria-label="Resumen de compra actual"
      className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] left-4 right-4 z-30 mx-auto max-w-sm pointer-events-auto select-none animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      <button
        type="button"
        onClick={onCheckout}
        aria-label={`Ver carrito: ${units} ${units === 1 ? "producto" : "productos"}, total ${formatCOP(total)}. Toca para cobrar.`}
        className="w-full flex items-center justify-between gap-3 rounded-full border border-blue-500/15 dark:border-blue-500/25 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl p-2.5 sm:p-3 text-zinc-900 dark:text-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] active:scale-[0.98] transition-transform duration-100 outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        {/* Contenido Izquierdo: Ícono circular azul con resplandor + Textos */}
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]"
            aria-hidden="true"
          >
            <ShoppingCart size={19} />
          </span>
          <div className="min-w-0 text-left">
            <p className="truncate text-sm font-bold leading-tight">
              {units} {units === 1 ? "producto" : "productos"}
            </p>
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5">
              Toca para revisar o cobrar
            </p>
          </div>
        </div>

        {/* Contenido Derecho: Botón píldora azul con resplandor, monto y flecha en círculo blanco */}
        <span
          className="tabular-nums flex shrink-0 items-center gap-2 rounded-full bg-blue-500 pl-3.5 pr-2 py-1.5 text-sm font-extrabold text-white shadow-[0_4px_14px_rgba(59,130,246,0.4)]"
          aria-hidden="true"
        >
          {formatCOP(total)}
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-blue-500 shadow-sm">
            <ArrowRight size={12} className="stroke-[3]" />
          </span>
        </span>
      </button>
    </div>
  );
}
