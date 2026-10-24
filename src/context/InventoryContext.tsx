import React, { createContext, useContext, useEffect, useState } from "react";
import { Batch, Product, Supplier } from "../types/domain";

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

interface InventoryContextType {
  suppliers: Supplier[];
  products: Product[];
  showCosts: boolean;
  setShowCosts: React.Dispatch<React.SetStateAction<boolean>>;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  isNewProductModalOpen: boolean;
  setIsNewProductModalOpen: (open: boolean) => void;
  isPurgeModalOpen: boolean;
  setIsPurgeModalOpen: (open: boolean) => void;
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

  // Modo Mostrador vs Costos
  const [showCosts, setShowCosts] = useState(false);

  // Estados de Modales
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);

  useEffect(() => {
    writeStored("quiral_suppliers", suppliers);
  }, [suppliers]);

  useEffect(() => {
    writeStored("quiral_products", products);
  }, [products]);

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

  return (
    <InventoryContext.Provider
      value={{
        suppliers,
        products,
        showCosts,
        setShowCosts,
        selectedProduct,
        setSelectedProduct,
        isNewProductModalOpen,
        setIsNewProductModalOpen,
        isPurgeModalOpen,
        setIsPurgeModalOpen,
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
