import React, { createContext, useContext, useEffect, useState } from "react";
import { Batch, CartItem, Closure, PaymentMethod, Product, Sale, SaleItem, Supplier } from "../types/domain";

export const SUPPLIER_PALETTE = [
  "#007AFF", // Azul
  "#AF52DE", // Morado
  "#28CD41", // Verde
  "#FF9500", // Naranja
  "#5AC8FA", // Azul Cielo
  "#FF3B30", // Rojo
  "#00A3BF", // Turquesa
  "#0051D5", // Azul Rey
  "#FFCC00", // Amarillo Ámbar
  "#FF6B22", // Naranja Rojizo
  "#FF2D55", // Rojo Coral
  "#8E8E93", // Gris
  "#5856D6", // Índigo
];

const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: "sup-yetcell",
    name: "Yetcell",
    phone: "+57 310 123 4567",
    color: "#FF2D55", // Rojo Coral
  },
  {
    id: "sup-mymobile",
    name: "Mymobile",
    phone: "+57 320 987 6543",
    color: "#30D158", // Verde
  },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-anker-30w",
    name: "Cubo Anker 30W",
    category: "Cargadores y Cables",
    subtitle: "Cubo · Anker",
    price: 50000,
    warrantyDays: 30,
    batches: [
      { id: "b1", supplierId: "sup-yetcell", cost: 20000, stock: 12 },
      { id: "b2", supplierId: "sup-mymobile", cost: 25000, stock: 7 },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "prod-iphone-20w",
    name: "Cubo iPhone 20W",
    category: "Cargadores y Cables",
    subtitle: "Cubo · iPhone",
    price: 25000,
    warrantyDays: 15,
    batches: [
      { id: "b3", supplierId: "sup-yetcell", cost: 12000, stock: 14 },
      { id: "b4", supplierId: "sup-mymobile", cost: 11000, stock: 9 },
    ],
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_SALES: Sale[] = [
  {
    id: "sale-93",
    saleNumber: 93,
    customerName: "Santiago Restrepo",
    note: "Combo carga rápida con descuento de $5.000",
    paymentMethod: "Nequi",
    createdAt: "2026-10-18T16:30:00-05:00",
    totalAmount: 75000,
    items: [
      {
        id: "item-93-1",
        productId: "prod-anker-30w",
        productName: "Cubo Anker 30W",
        qty: 1,
        unitPrice: 50000,
        warrantyDays: 30,
        warrantyClaimed: false,
      },
      {
        id: "item-93-2",
        productId: "prod-iphone-20w",
        productName: "Cubo iPhone 20W",
        qty: 1,
        unitPrice: 25000,
        warrantyDays: 15,
        warrantyClaimed: false,
      },
    ],
  },
  {
    id: "sale-92",
    saleNumber: 92,
    customerName: "Cliente General",
    paymentMethod: "Efectivo",
    createdAt: "2026-10-15T11:20:00-05:00",
    totalAmount: 100000,
    items: [
      {
        id: "item-92-1",
        productId: "prod-anker-30w",
        productName: "Cubo Anker 30W",
        qty: 2,
        unitPrice: 50000,
        warrantyDays: 30,
        warrantyClaimed: false,
      },
    ],
  },
];

const INITIAL_CLOSURES: Closure[] = [
  {
    id: "closure-1",
    periodLabel: "8 de oct. – 22 de oct. 2026",
    closedAt: "2026-10-22T20:30:00-05:00",
    startDate: "2026-10-08T00:00:00-05:00",
    endDate: "2026-10-22T23:59:59-05:00",
    totalSold: 250000,
    netProfit: 136000,
    recoveredInvestment: 114000,
    remainingStockInvestment: 548000,
    expectedCash: 250000,
    realCashReported: 250000,
    topSellers: [
      {
        id: "prod-anker-30w",
        name: "Cubo Anker 30W",
        qty: 3,
        revenue: 150000,
        profit: 85000,
        tx: [
          {
            id: "tx-1",
            date: "2026-10-18T16:30:00-05:00",
            customer: "Santiago Restrepo",
            qty: 1,
            price: 50000,
          },
          {
            id: "tx-2",
            date: "2026-10-15T11:20:00-05:00",
            customer: "Cliente General",
            qty: 2,
            price: 50000,
          },
        ],
      },
      {
        id: "prod-iphone-20w",
        name: "Cubo iPhone 20W",
        qty: 4,
        revenue: 100000,
        profit: 51000,
        tx: [
          {
            id: "tx-3",
            date: "2026-10-14T10:15:00-05:00",
            customer: "Ana Morales",
            qty: 2,
            price: 25000,
          },
          {
            id: "tx-4",
            date: "2026-10-12T17:40:00-05:00",
            customer: "Carlos Gómez",
            qty: 2,
            price: 25000,
          },
        ],
      },
    ],
    topReturned: [],
  },
];

interface InventoryContextType {
  suppliers: Supplier[];
  products: Product[];
  sales: Sale[];
  closures: Closure[];
  showCosts: boolean;
  setShowCosts: React.Dispatch<React.SetStateAction<boolean>>;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  isNewProductModalOpen: boolean;
  setIsNewProductModalOpen: (open: boolean) => void;
  isPurgeModalOpen: boolean;
  setIsPurgeModalOpen: (open: boolean) => void;
  lastSelectedSupplierId: string | null;
  setLastSelectedSupplierId: (id: string | null) => void;
  cart: CartItem[];
  cartUnits: number;
  addToCart: (productId: string) => boolean;
  updateCartQuantity: (productId: string, quantity: number) => void;
  updateCartItemPrice: (productId: string, unitPrice: number) => void;
  updateCartItemBatch: (productId: string, batchId: string) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  completeSale: (paymentMethod: PaymentMethod, total: number, customerName?: string) => boolean;
  createClosure: (closureData: Omit<Closure, "id" | "closedAt"> & { id?: string; closedAt?: string }) => void;
  toggleItemWarranty: (saleId: string, itemId: string, note?: string) => void;
  addSupplier: (supplier: Omit<Supplier, "id">) => Supplier;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (id: string) => void;
  getSupplier: (id: string) => Supplier | undefined;
  addProduct: (product: Omit<Product, "id" | "createdAt">) => Product;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  adjustBatchStock: (productId: string, batchId: string, delta: number) => void;
  adjustMasterStock: (productId: string, delta: number) => void;
  addBatchToProduct: (productId: string, batch: Omit<Batch, "id">) => void;
  updateProductPrice: (productId: string, newPrice: number) => void;
  purgeOutOfStock: () => number;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

function readStored<T>(key: string, fallback: T, isValid: (value: unknown) => value is T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    return isValid(parsed) ? parsed : fallback;
  } catch (error) {
    console.error(`No se pudo leer ${key} desde el almacenamiento local.`, error);
    return fallback;
  }
}

function isSupplierList(value: unknown): value is Supplier[] {
  return Array.isArray(value) && value.every(
    (supplier) =>
      typeof supplier === "object" &&
      supplier !== null &&
      typeof supplier.id === "string" &&
      typeof supplier.name === "string" &&
      typeof supplier.color === "string" &&
      (supplier.phone === undefined || typeof supplier.phone === "string"),
  );
}

function isBatch(value: unknown): value is Batch {
  if (typeof value !== "object" || value === null) return false;
  const batch = value as Record<string, unknown>;
  return (
    typeof batch.id === "string" &&
    typeof batch.supplierId === "string" &&
    typeof batch.cost === "number" &&
    Number.isFinite(batch.cost) &&
    typeof batch.stock === "number" &&
    Number.isFinite(batch.stock) &&
    batch.stock >= 0
  );
}

function isProductList(value: unknown): value is Product[] {
  return Array.isArray(value) && value.every((item): item is Product => {
    if (typeof item !== "object" || item === null) return false;
    const product = item as Record<string, unknown>;
    return (
      typeof product.id === "string" &&
      typeof product.name === "string" &&
      typeof product.category === "string" &&
      typeof product.createdAt === "string" &&
      typeof product.price === "number" &&
      Number.isFinite(product.price) &&
      typeof product.warrantyDays === "number" &&
      Number.isFinite(product.warrantyDays) &&
      Array.isArray(product.batches) &&
      product.batches.every(isBatch)
    );
  });
}

function isSale(value: unknown): value is Sale {
  if (typeof value !== "object" || value === null) return false;
  const s = value as Record<string, unknown>;
  return (
    typeof s.id === "string" &&
    typeof s.saleNumber === "number" &&
    typeof s.customerName === "string" &&
    typeof s.totalAmount === "number" &&
    typeof s.createdAt === "string" &&
    Array.isArray(s.items)
  );
}

function isSaleList(value: unknown): value is Sale[] {
  return Array.isArray(value) && value.every(isSale);
}

function isClosure(value: unknown): value is Closure {
  if (typeof value !== "object" || value === null) return false;
  const c = value as Record<string, unknown>;
  return (
    typeof c.id === "string" &&
    typeof c.periodLabel === "string" &&
    typeof c.closedAt === "string" &&
    typeof c.totalSold === "number" &&
    typeof c.netProfit === "number"
  );
}

function isClosureList(value: unknown): value is Closure[] {
  return Array.isArray(value) && value.every(isClosure);
}

function writeStored(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`No se pudo guardar ${key} en el almacenamiento local.`, error);
  }
}

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>(() =>
    readStored("quiral_suppliers", INITIAL_SUPPLIERS, isSupplierList)
  );

  const [products, setProducts] = useState<Product[]>(() =>
    readStored("quiral_products", INITIAL_PRODUCTS, isProductList)
  );

  const [sales, setSales] = useState<Sale[]>(() =>
    readStored("quiral_sales", INITIAL_SALES, isSaleList)
  );

  const [closures, setClosures] = useState<Closure[]>(() =>
    readStored("quiral_closures", INITIAL_CLOSURES, isClosureList)
  );

  // Modo Mostrador vs Costos
  const [showCosts, setShowCosts] = useState(false);

  // Estados de Modales
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [lastSelectedSupplierId, setLastSelectedSupplierId] = useState<string | null>(() => {
    try {
      return localStorage.getItem("quiral-last-supplier-id");
    } catch {
      return null;
    }
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const cartUnits = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    writeStored("quiral_suppliers", suppliers);
  }, [suppliers]);

  useEffect(() => {
    writeStored("quiral_products", products);
  }, [products]);

  useEffect(() => {
    writeStored("quiral_sales", sales);
  }, [sales]);

  useEffect(() => {
    writeStored("quiral_closures", closures);
  }, [closures]);

  const addSupplier = (supData: Omit<Supplier, "id">): Supplier => {
    const newSup: Supplier = {
      ...supData,
      id: "sup-" + Date.now(),
    };
    setSuppliers((prev) => [...prev, newSup]);
    return newSup;
  };

  const updateSupplier = (updated: Supplier) => {
    setSuppliers((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  const getSupplier = (id: string) => {
    return suppliers.find((s) => s.id === id);
  };

  const addProduct = (pData: Omit<Product, "id" | "createdAt">): Product => {
    const batches = pData.batches.map((batch) => ({
      ...batch,
      cost: Math.max(0, Math.round(batch.cost)),
      stock: Math.max(0, Math.floor(batch.stock)),
    }));
    const newProd: Product = {
      ...pData,
      price: Math.max(0, Math.round(pData.price)),
      warrantyDays: Math.max(0, Math.floor(pData.warrantyDays)),
      batches,
      id: "prod-" + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProd, ...prev]);
    return newProd;
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const adjustBatchStock = (productId: string, batchId: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const updatedBatches = p.batches.map((b) => {
          if (b.id !== batchId) return b;
          const nextStock = Math.max(0, b.stock + delta);
          return { ...b, stock: nextStock };
        });
        return { ...p, batches: updatedBatches };
      })
    );
  };

  const adjustMasterStock = (productId: string, delta: number) => {
    if (delta === 0) return;

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        if (!p.batches || p.batches.length === 0) return p;

        const updatedBatches = p.batches.map((b) => ({ ...b }));
        const steps = Math.abs(delta);

        for (let i = 0; i < steps; i++) {
          if (delta > 0) {
            // Incrementar: añadir 1 unidad al lote con mayor cantidad (desempate determinista: primer índice)
            let maxIdx = 0;
            let maxStock = updatedBatches[0].stock;
            for (let j = 1; j < updatedBatches.length; j++) {
              if (updatedBatches[j].stock > maxStock) {
                maxStock = updatedBatches[j].stock;
                maxIdx = j;
              }
            }
            updatedBatches[maxIdx].stock += 1;
          } else {
            // Decrementar: restar 1 unidad del lote con mayor cantidad disponible (> 0)
            let maxIdx = -1;
            let maxStock = 0;
            for (let j = 0; j < updatedBatches.length; j++) {
              if (updatedBatches[j].stock > maxStock) {
                maxStock = updatedBatches[j].stock;
                maxIdx = j;
              }
            }
            // Si ningún lote tiene stock disponible, se interrumpe el decremento (no permite negativos)
            if (maxIdx === -1 || maxStock <= 0) {
              break;
            }
            updatedBatches[maxIdx].stock = Math.max(0, updatedBatches[maxIdx].stock - 1);
          }
        }

        return { ...p, batches: updatedBatches };
      })
    );
  };

  const addBatchToProduct = (productId: string, batchData: Omit<Batch, "id">) => {
    const newBatch: Batch = {
      ...batchData,
      cost: Math.max(0, Math.round(batchData.cost)),
      stock: Math.max(0, Math.floor(batchData.stock)),
      id: "batch-" + Date.now(),
    };
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        return { ...p, batches: [...p.batches, newBatch] };
      })
    );
  };

  const updateProductPrice = (productId: string, newPrice: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        return { ...p, price: newPrice };
      })
    );
  };

  const purgeOutOfStock = (): number => {
    let purgedCount = 0;
    setProducts((prev) => {
      const remaining: Product[] = [];
      for (const p of prev) {
        const totalStock = p.batches.reduce((sum, b) => sum + b.stock, 0);
        if (totalStock === 0) {
          purgedCount++;
        } else {
          remaining.push(p);
        }
      }
      return remaining;
    });
    return purgedCount;
  };

  const addToCart = (productId: string): boolean => {
    const product = products.find((item) => item.id === productId);
    if (!product) return false;
    const existing = cart.find((item) => item.productId === productId);
    const availableBatches = product.batches.filter((item) => item.stock > 0);
    if (availableBatches.length === 0) return false;

    // Priorizar lote del último proveedor seleccionado si tiene stock
    const preferredBatch = lastSelectedSupplierId
      ? availableBatches.find((item) => item.supplierId === lastSelectedSupplierId)
      : undefined;

    const batch = preferredBatch || [...availableBatches].sort((a, b) => b.stock - a.stock)[0];
    if (!batch) return false;
    if (existing) {
      const activeBatch = product.batches.find((item) => item.id === existing.batchId);
      if (!activeBatch || existing.quantity >= activeBatch.stock) return false;
      setCart((current) =>
        current.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
      return true;
    }
    setCart((current) => [
      ...current,
      { productId, batchId: batch.id, quantity: 1, unitPrice: product.price },
    ]);
    return true;
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    const item = cart.find((entry) => entry.productId === productId);
    const product = products.find((entry) => entry.id === productId);
    if (!item || !product) return;
    const batch = product.batches.find((entry) => entry.id === item.batchId);
    const nextQuantity = Math.min(Math.max(0, Math.floor(quantity)), batch?.stock ?? 0);
    if (nextQuantity === 0) {
      setCart((current) => current.filter((entry) => entry.productId !== productId));
      return;
    }
    setCart((current) =>
      current.map((entry) =>
        entry.productId === productId ? { ...entry, quantity: nextQuantity } : entry
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((current) => current.filter((item) => item.productId !== productId));
  };

  const updateCartItemPrice = (productId: string, unitPrice: number) => {
    if (!Number.isFinite(unitPrice) || unitPrice < 0) return;
    setCart((current) =>
      current.map((item) =>
        item.productId === productId
          ? { ...item, unitPrice: Math.round(unitPrice) }
          : item
      )
    );
  };

  const updateCartItemBatch = (productId: string, batchId: string) => {
    const product = products.find((entry) => entry.id === productId);
    const item = cart.find((entry) => entry.productId === productId);
    const batch = product?.batches.find((entry) => entry.id === batchId);
    if (!product || !item || !batch || batch.stock <= 0) return;

    // Persistir el proveedor seleccionado para futuros agregados
    setLastSelectedSupplierId(batch.supplierId);
    try {
      localStorage.setItem("quiral-last-supplier-id", batch.supplierId);
    } catch {
      // Ignorar error de cuota o modo privado
    }

    setCart((current) =>
      current.map((entry) =>
        entry.productId === productId
          ? { ...entry, batchId, quantity: Math.min(entry.quantity, batch.stock) }
          : entry
      )
    );
  };

  const clearCart = () => setCart([]);

  const completeSale = (
    paymentMethod: PaymentMethod,
    total: number,
    customerName?: string
  ): boolean => {
    const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    if (!cart.length || !Number.isFinite(total) || total < 0 || total > subtotal) return false;
    const updatedProducts = products.map((product) => {
      const item = cart.find((entry) => entry.productId === product.id);
      if (!item) return product;
      const batch = product.batches.find((entry) => entry.id === item.batchId);
      if (!batch || batch.stock < item.quantity) return null;
      return {
        ...product,
        batches: product.batches.map((entry) =>
          entry.id === item.batchId ? { ...entry, stock: entry.stock - item.quantity } : entry
        ),
      };
    });
    if (updatedProducts.some((product) => product === null)) return false;
    const productsToSave = updatedProducts.filter(
      (product): product is Product => product !== null,
    );

    // Registrar venta en historial
    const newSaleItems: SaleItem[] = cart.map((cartItem) => {
      const prod = products.find((p) => p.id === cartItem.productId);
      const batch = prod?.batches.find((b) => b.id === cartItem.batchId);
      return {
        id: "item-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
        productId: cartItem.productId,
        productName: prod?.name || "Producto",
        qty: cartItem.quantity,
        unitPrice: cartItem.unitPrice,
        unitCostSnapshot: batch?.cost || prod?.batches[0]?.cost || 0,
        batchId: cartItem.batchId,
        warrantyDays: prod?.warrantyDays || 15,
        warrantyClaimed: false,
      };
    });

    const nextSaleNumber = (sales[0]?.saleNumber || 90) + 1;
    const newSale: Sale = {
      id: "sale-" + Date.now(),
      saleNumber: nextSaleNumber,
      customerName: customerName?.trim() || "Cliente General",
      paymentMethod,
      totalAmount: total,
      createdAt: new Date().toISOString(),
      items: newSaleItems,
    };

    setSales((prev) => [newSale, ...prev]);
    setProducts(productsToSave);
    setCart([]);
    console.info(`Venta #${nextSaleNumber} completada con método ${paymentMethod}.`);
    return true;
  };

  const toggleItemWarranty = (saleId: string, itemId: string, note?: string) => {
    setSales((prev) =>
      prev.map((sale) => {
        if (sale.id !== saleId) return sale;
        return {
          ...sale,
          items: sale.items.map((item) => {
            if (item.id !== itemId) return item;
            return {
              ...item,
              warrantyClaimed: !item.warrantyClaimed,
              warrantyClaimNote: note !== undefined ? note : item.warrantyClaimNote,
            };
          }),
        };
      })
    );
  };

  const createClosure = (
    closureData: Omit<Closure, "id" | "closedAt"> & { id?: string; closedAt?: string }
  ) => {
    const newClosure: Closure = {
      ...closureData,
      id: closureData.id || "cycle-" + Date.now(),
      closedAt: closureData.closedAt || new Date().toISOString(),
    };
    setClosures((prev) => [newClosure, ...prev]);
  };

  return (
    <InventoryContext.Provider
      value={{
        suppliers,
        products,
        sales,
        closures,
        createClosure,
        toggleItemWarranty,
        showCosts,
        setShowCosts,
        selectedProduct,
        setSelectedProduct,
        isNewProductModalOpen,
        setIsNewProductModalOpen,
        isPurgeModalOpen,
        setIsPurgeModalOpen,
        lastSelectedSupplierId,
        setLastSelectedSupplierId,
        cart,
        cartUnits,
        addToCart,
        updateCartQuantity,
        updateCartItemPrice,
        updateCartItemBatch,
        removeFromCart,
        clearCart,
        completeSale,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        getSupplier,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustBatchStock,
        adjustMasterStock,
        addBatchToProduct,
        updateProductPrice,
        purgeOutOfStock,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
}
