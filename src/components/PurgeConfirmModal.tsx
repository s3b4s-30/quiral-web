import { AlertCircle, Trash2, X } from "lucide-react";
import { useInventory } from "../context/InventoryContext";

interface PurgeConfirmModalProps {
  onClose: () => void;
}

export default function PurgeConfirmModal({ onClose }: PurgeConfirmModalProps) {
  const { products, purgeOutOfStock } = useInventory();

  const outOfStockCount = products.filter(
    (p) => p.batches.reduce((sum, b) => sum + b.stock, 0) === 0
  ).length;

  const handleConfirm = () => {
    purgeOutOfStock();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-sm overflow-hidden rounded-[28px] border border-[var(--border-color)] bg-[var(--bg-elevated)] p-6 shadow-2xl transition-colors duration-75"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ff3b30]/15 text-[#ff3b30]">
          <Trash2 size={28} />
        </div>

        <h3 className="mt-4 text-center text-lg font-bold tracking-tight text-[var(--text-primary)]">
          Purgar Stock Agotado
        </h3>

        {outOfStockCount > 0 ? (
          <>
            <p className="mt-2 text-center text-sm text-[var(--text-secondary)]">
              Se encontraron{" "}
              <strong className="text-[var(--text-primary)]">{outOfStockCount} productos</strong> con
              0 existencias. ¿Deseas removerlos del catálogo activo?
            </p>
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-black/5 dark:bg-white/5 p-3 text-xs text-[var(--text-secondary)]">
              <AlertCircle size={16} className="text-[#ff9500] shrink-0 mt-0.5" />
              <span>
                Regla de integridad: Las transacciones y métricas en el Historial de ventas
                permanecerán completamente intactas.
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="flex min-h-11 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)] text-sm font-semibold text-[var(--text-primary)] transition-opacity hover:opacity-80"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex min-h-11 items-center justify-center rounded-xl bg-[#ff3b30] text-sm font-bold text-white shadow-md transition-opacity hover:opacity-90"
              >
                Purgar ({outOfStockCount})
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-2 text-center text-sm text-[var(--text-secondary)]">
              ¡Excelente! En este momento no hay productos agotados con 0 unidades en el catálogo.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 flex min-h-11 w-full items-center justify-center rounded-xl bg-[#007aff] text-sm font-semibold text-white shadow-md"
            >
              Entendido
            </button>
          </>
        )}
      </div>
    </div>
  );
}

