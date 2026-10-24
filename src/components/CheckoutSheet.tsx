import { useMemo, useState } from "react";
import ModalSheet from "./ModalSheet";
import { useInventory } from "../context/InventoryContext";
import { PaymentMethod } from "../types/domain";
import { formatCOP, parseCOPInput } from "../utils/formatters";

const PAYMENT_METHODS: PaymentMethod[] = ["Efectivo", "Nequi", "Bancolombia", "Tarjeta"];

export interface CheckoutSheetProps {
  onClose: () => void;
  onStartClose?: () => void;
}

export default function CheckoutSheet({ onClose, onStartClose }: CheckoutSheetProps) {
  const {
    cart,
    products,
    suppliers,
    updateCartQuantity,
    updateCartItemPrice,
    updateCartItemBatch,
    removeFromCart,
    clearCart,
    completeSale,
  } = useInventory();

  const [payment, setPayment] = useState<PaymentMethod>("Efectivo");
  const [customTotalInput, setCustomTotalInput] = useState<string>("");
  const [customerName, setCustomerName] = useState("");

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [cart],
  );

  const parsedCustom = customTotalInput ? parseCOPInput(customTotalInput) : null;
  const effectiveTotal = parsedCustom !== null ? Math.min(subtotal, parsedCustom) : subtotal;

  const handleSubmit = () => {
    if (!cart.length) return;
    if (completeSale(payment, effectiveTotal, customerName)) {
      onClose();
    }
  };

  return (
    <ModalSheet
      title="Cobro"
      onClose={onClose}
      onStartClose={onStartClose}
      footer={
        <button
          type="button"
          onClick={handleSubmit}
          disabled={cart.length === 0}
          className={`flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#30d158] text-base font-bold text-white shadow-lg active:scale-[0.98] transition-transform duration-75 ${
            cart.length === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-[#28cd41]"
          }`}
        >
          Completar venta · {formatCOP(effectiveTotal)}
        </button>
      }
    >
      <div className="space-y-4">
        {/* Input de cliente */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Cliente
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="Cliente general (opcional)"
            className="mt-1.5 w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-elevated)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] outline-none focus:border-[#007aff]"
          />
        </div>

        {/* Tarjetas de productos seleccionados */}
        <section className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Productos ({cart.length})
          </h3>

          {cart.length === 0 ? (
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)]/40 py-8 text-center text-sm font-medium text-[var(--text-secondary)]">
              El carrito está vacío
            </div>
          ) : (
            cart.map((item) => {
              const product = products.find((entry) => entry.id === item.productId);
              if (!product) return null;
              const activeBatch = product.batches.find((entry) => entry.id === item.batchId);
              const maxStock = activeBatch?.stock ?? 0;

              return (
                <div
                  key={item.productId}
                  className="rounded-2xl border border-[var(--border-color)] dark:border-white/5 bg-[var(--bg-primary)]/50 p-2.5 space-y-2"
                >
                  {/* Encabezado del producto + ajuste de cantidad */}
                  <div className="flex items-start justify-between gap-3">
                    <p className="line-clamp-2 text-sm font-bold leading-snug text-[var(--text-primary)] min-w-0 flex-1">
                      {product.name}
                    </p>

                    {/* Controles - / + */}
                    <div className="flex items-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)] shrink-0">
                      <button
                        type="button"
                        aria-label={`Quitar unidad de ${product.name}`}
                        onClick={() => updateCartQuantity(product.id, item.quantity - 1)}
                        className="flex h-8 w-8 items-center justify-center text-base font-bold text-[#007aff] dark:text-[#0a84ff] active:scale-95 transition-transform duration-75"
                      >
                        −
                      </button>
                      <span className="tabular-nums min-w-6 text-center text-sm font-extrabold text-[var(--text-primary)]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={`Agregar unidad de ${product.name}`}
                        disabled={item.quantity >= maxStock}
                        onClick={() => updateCartQuantity(product.id, item.quantity + 1)}
                        className={`flex h-8 w-8 items-center justify-center text-base font-bold text-[#007aff] dark:text-[#0a84ff] active:scale-95 transition-transform duration-75 ${
                          item.quantity >= maxStock ? "opacity-30 cursor-not-allowed" : ""
                        }`}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Precio unitario editable con autoformato COP */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--text-secondary)]">
                      Precio unitario a cobrar
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatCOP(item.unitPrice)}
                      onChange={(event) =>
                        updateCartItemPrice(product.id, parseCOPInput(event.target.value))
                      }
                      className="tabular-nums mt-1 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)] px-2.5 py-1.5 text-sm font-bold text-[var(--text-primary)] outline-none focus:border-[#007aff]"
                    />
                  </div>

                  {/* Selector de lote / proveedor */}
                  <div>
                    <p className="text-[11px] font-semibold text-[var(--text-secondary)]">
                      Lote / Proveedor:
                    </p>
                    <div className="mt-1 flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
                      {product.batches
                        .filter((batch) => batch.stock > 0)
                        .map((batch) => {
                          const supplier = suppliers.find((entry) => entry.id === batch.supplierId);
                          const active = batch.id === item.batchId;
                          return (
                            <button
                              key={batch.id}
                              type="button"
                              onClick={() => updateCartItemBatch(product.id, batch.id)}
                              className={`whitespace-nowrap rounded-xl px-2.5 py-1 text-xs font-semibold transition-colors duration-75 active:scale-95 ${
                                active
                                  ? "text-white shadow-sm"
                                  : "border border-[var(--border-color)] bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5"
                              }`}
                              style={active ? { backgroundColor: supplier?.color ?? "#007aff" } : undefined}
                            >
                              {supplier?.name ?? "Proveedor"} ({batch.stock} uds)
                            </button>
                          );
                        })}
                    </div>
                  </div>

                  {/* Opción de eliminar */}
                  <div className="flex justify-end pt-0.5">
                    <button
                      type="button"
                      onClick={() => removeFromCart(product.id)}
                      className="text-xs font-semibold text-[#ff3b30] hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </section>

        {/* Chips de método de pago */}
        <section>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Método de pago
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((method) => {
              const active = payment === method;
              return (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPayment(method)}
                  className={`min-h-11 rounded-xl border text-sm font-semibold transition-colors duration-75 active:scale-95 ${
                    active
                      ? "border-[#007aff] bg-[#007aff] text-white shadow-sm"
                      : "border-[var(--border-color)] bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  {method}
                </button>
              );
            })}
          </div>
        </section>

        {/* Totales limpios (Subtotal + Input editable con autoformato COP) */}
        <section className="rounded-2xl border border-[var(--border-color)] dark:border-white/5 bg-[var(--bg-primary)]/50 p-3.5 space-y-3">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>Subtotal</span>
            <span className="tabular-nums font-bold text-sm text-[var(--text-primary)]">
              {formatCOP(subtotal)}
            </span>
          </div>

          <div>
            <label
              htmlFor="checkout-amount-input"
              className="block text-xs font-semibold text-[var(--text-secondary)]"
            >
              Valor a cobrar
            </label>
            <input
              id="checkout-amount-input"
              type="text"
              inputMode="numeric"
              value={customTotalInput ? formatCOP(parseCOPInput(customTotalInput)) : ""}
              onChange={(event) => {
                const raw = event.target.value.replace(/\D/g, "");
                if (!raw) {
                  setCustomTotalInput("");
                } else {
                  const num = parseInt(raw, 10);
                  setCustomTotalInput(String(Math.min(subtotal, num)));
                }
              }}
              placeholder={formatCOP(subtotal)}
              aria-label="Ajustar valor a cobrar"
              className="tabular-nums mt-1.5 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)] px-3.5 py-2.5 text-base font-extrabold text-[var(--text-primary)] outline-none focus:border-[#007aff]"
            />
          </div>
        </section>

        {/* Enlace Vaciar carrito */}
        {cart.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="block mx-auto text-sm font-semibold text-[#ff3b30] hover:underline pt-1 pb-2"
          >
            Vaciar carrito
          </button>
        )}
      </div>
    </ModalSheet>
  );
}

