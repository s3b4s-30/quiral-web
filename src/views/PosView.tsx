import { Search, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import CartSummaryBar from "../components/CartSummaryBar";
import CheckoutSheet from "../components/CheckoutSheet";
import PosProductCard from "../components/PosProductCard";
import { useInventory } from "../context/InventoryContext";
import { ProductCategory } from "../types/domain";

interface PosViewProps {
  onCheckoutStateChange: (open: boolean) => void;
}

export default function PosView({ onCheckoutStateChange }: PosViewProps) {
  const { products, suppliers, cart, cartUnits, addToCart } = useInventory();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"Todos" | ProductCategory>("Todos");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCheckoutClosing, setIsCheckoutClosing] = useState(false);

  const categories = useMemo(
    () => ["Todos", ...new Set(products.map((product) => product.category))],
    [products],
  );

  const supplierColors = useMemo(
    () => new Map(suppliers.map((supplier) => [supplier.id, supplier.color])),
    [suppliers],
  );

  const cartQuantities = useMemo(
    () => new Map(cart.map((item) => [item.productId, item.quantity])),
    [cart],
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return products.filter(
      (product) =>
        (category === "Todos" || product.category === category) &&
        (!normalizedQuery ||
          product.name.toLowerCase().includes(normalizedQuery) ||
          product.subtitle?.toLowerCase().includes(normalizedQuery)),
    );
  }, [products, query, category]);

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [cart],
  );

  const handleAddToCart = useCallback(
    (productId: string) => {
      addToCart(productId);
    },
    [addToCart],
  );

  const openCheckout = () => {
    setIsCheckoutClosing(false);
    setIsCheckoutOpen(true);
    onCheckoutStateChange(true);
  };

  const handleStartCloseCheckout = () => {
    setIsCheckoutClosing(true);
    onCheckoutStateChange(false);
  };

  const closeCheckout = () => {
    setIsCheckoutOpen(false);
    setIsCheckoutClosing(false);
    onCheckoutStateChange(false);
  };

  return (
    <>
      <div className="quiral-scroll-container" id="pos-scroll">
        <div className="mx-auto max-w-xl px-4">
          {/* Header sticky con búsqueda y chips de categorías con efecto liquid glass */}
          <div className="sticky top-0 z-20 -mx-4 px-4 pt-1 pb-2 mb-4 bg-white/85 dark:bg-black/85 backdrop-blur-md border-b border-zinc-100 dark:border-white/5 transition-colors duration-75">
            <div className="relative">
              <div className="flex min-h-12 items-center gap-2.5 rounded-2xl border border-zinc-100 dark:border-white/5 bg-[var(--bg-elevated)] px-3.5 shadow-sm focus-within:border-[#007aff] transition-colors duration-75">
                <Search size={18} className="shrink-0 text-[var(--text-secondary)]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar productos para vender..."
                  className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-[var(--text-secondary)] text-[var(--text-primary)]"
                />
                {query && (
                  <button
                    type="button"
                    aria-label="Limpiar búsqueda"
                    onClick={() => setQuery("")}
                    className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {categories.map((item) => {
                const isActive = category === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item as "Todos" | ProductCategory)}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-colors duration-75 active:scale-95 ${
                      isActive
                        ? "bg-[#007aff] text-white shadow-sm"
                        : "border border-zinc-100 dark:border-white/5 bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Listado de tarjetas atómicas compactas de productos */}
          <div className={`space-y-3 ${cartUnits > 0 ? "pb-28" : "pb-24"}`}>
            {filteredProducts.map((product) => (
              <PosProductCard
                key={product.id}
                product={product}
                inCart={cartQuantities.get(product.id) ?? 0}
                onAddToCart={handleAddToCart}
                supplierColors={supplierColors}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Barra flotante sobre la barra inferior con resumen */}
      {(!isCheckoutOpen || isCheckoutClosing) && cartUnits > 0 && (
        <CartSummaryBar units={cartUnits} total={cartTotal} onCheckout={openCheckout} />
      )}

      {/* Modal CheckoutSheet de cobro limpio */}
      {isCheckoutOpen && (
        <CheckoutSheet
          onClose={closeCheckout}
          onStartClose={handleStartCloseCheckout}
        />
      )}
    </>
  );
}
