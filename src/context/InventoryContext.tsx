import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getStoreMembership, printSecurityWarning, signOutUser } from "../lib/authService";
import { DEMO_STORE_ID, generateDemoSeed } from "../lib/demoSeed";
import { supabase } from "../lib/supabase";
import { Batch, CartItem, Closure, PaymentMethod, Product, Sale, SaleItem, Supplier, UserProfile } from "../types/domain";

export const SUPPLIER_PALETTE = [
  "#007AFF", "#AF52DE", "#28CD41", "#FF9500", "#5AC8FA", "#FF3B30",
  "#00A3BF", "#0051D5", "#FFCC00", "#FF6B22", "#FF2D55", "#8E8E93", "#5856D6"
];

interface InventoryContextType {
  suppliers: Supplier[];
  products: Product[];
  sales: Sale[];
  closures: Closure[];
  loading: boolean;
  error: string | null;
  userProfile: UserProfile | null;
  isDemoUser: boolean;
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
  createClosure: (data: Omit<Closure, "id" | "closedAt"> & { id?: string; closedAt?: string }) => void;
  toggleItemWarranty: (saleId: string, itemId: string, note?: string) => void;
  addSupplier: (data: Omit<Supplier, "id">) => Supplier;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (id: string) => void;
  getSupplier: (id: string) => Supplier | undefined;
  addProduct: (data: Omit<Product, "id" | "createdAt">) => Product;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  adjustBatchStock: (productId: string, batchId: string, delta: number) => void;
  adjustMasterStock: (productId: string, delta: number) => void;
  addBatchToProduct: (productId: string, batch: Omit<Batch, "id">) => void;
  updateProductPrice: (productId: string, price: number) => void;
  purgeOutOfStock: () => number;
  signOut: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);
const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

const normalizedProduct = (p: Product): Product => ({
  ...p,
  price: Math.max(0, Math.round(p.price)),
  warrantyDays: Math.max(0, Math.floor(p.warrantyDays)),
  batches: p.batches.map((b) => ({
    ...b,
    cost: Math.max(0, Math.round(b.cost)),
    stock: Math.max(0, Math.floor(b.stock)),
  })),
});

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [storeId, setStoreId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isDemoUser, setIsDemoUser] = useState<boolean>(() => {
    return localStorage.getItem("quiral_demo_bypass") === "true";
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [closures, setClosures] = useState<Closure[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCosts, setShowCosts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [lastSelectedSupplierId, setLastSelectedSupplierId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  const report = useCallback((message: string) => {
    console.error(message);
    setError(message);
  }, []);

  // Carga de datos de la tienda desde Supabase con respaldo local si es demo
  const loadData = useCallback(async (activeStore: string, isDemo = false) => {
    setLoading(true);

    if (isDemo) {
      printSecurityWarning();
      try {
        // Intentar invocar seed_demo_store en Supabase
        await supabase.rpc("seed_demo_store", { p_store_id: activeStore });
      } catch (err) {
        console.warn("Aviso al sembrar demo en backend:", err);
      }
    }

    try {
      const [supRes, prodRes, salesRes, closuresRes] = await Promise.all([
        supabase.from("suppliers").select("data").eq("store_id", activeStore),
        supabase.from("products").select("data").eq("store_id", activeStore),
        supabase.from("sales").select("data").eq("store_id", activeStore).order("created_at", { ascending: false }),
        supabase.from("cycle_closings").select("data").eq("store_id", activeStore).order("closed_at", { ascending: false }),
      ]);

      const loadedSuppliers = supRes.data?.map((r) => r.data as Supplier) ?? [];
      const loadedProducts = prodRes.data?.map((r) => r.data as Product) ?? [];
      const loadedSales = salesRes.data?.map((r) => r.data as Sale) ?? [];
      const loadedClosures = closuresRes.data?.map((r) => r.data as Closure) ?? [];

      // Si es demo y el servidor está vacío o sin tablas, usar el generador de prueba completo (4 meses)
      if (isDemo && loadedProducts.length === 0) {
        const demoData = generateDemoSeed();
        setSuppliers(demoData.suppliers);
        setProducts(demoData.products);
        setSales(demoData.sales);
        setClosures(demoData.closures);
      } else {
        setSuppliers(loadedSuppliers);
        setProducts(loadedProducts);
        setSales(loadedSales);
        setClosures(loadedClosures);
      }

      setError(null);
    } catch (fetchErr: any) {
      console.warn("Fallo al conectar con Supabase, usando respaldo:", fetchErr);
      if (isDemo) {
        const demoData = generateDemoSeed();
        setSuppliers(demoData.suppliers);
        setProducts(demoData.products);
        setSales(demoData.sales);
        setClosures(demoData.closures);
      } else {
        report(`Error de conexión: ${fetchErr?.message || "Sin red"}`);
      }
    } finally {
      setLoading(false);
    }
  }, [report]);

  // Manejo de sesión y suscripción en tiempo real
  useEffect(() => {
    let activeChannel: ReturnType<typeof supabase.channel> | null = null;

    const setupAuthAndStore = async () => {
      const hasDemoBypass = localStorage.getItem("quiral_demo_bypass") === "true";

      if (hasDemoBypass) {
        printSecurityWarning();
        setIsDemoUser(true);
        const demoProfile: UserProfile = {
          id: "demo-user-30",
          email: "demo30@quiral.xyz",
          username: "30",
          storeId: DEMO_STORE_ID,
          storeName: "Quiral Demo 30",
          role: "owner",
          isDemoUser: true,
        };
        setUserProfile(demoProfile);
        setStoreId(DEMO_STORE_ID);
        await loadData(DEMO_STORE_ID, true);
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        const membership = await getStoreMembership(sessionData.session.user.id);
        if (membership) {
          const profile: UserProfile = {
            id: sessionData.session.user.id,
            email: sessionData.session.user.email || "",
            username: membership.username,
            storeId: membership.storeId,
            storeName: membership.storeName,
            role: membership.role,
            isDemoUser: false,
          };
          setUserProfile(profile);
          setStoreId(membership.storeId);
          setIsDemoUser(false);
          await loadData(membership.storeId, false);
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setUserProfile(null);
        setStoreId(null);
      }
    };

    void setupAuthAndStore();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setUserProfile(null);
        setStoreId(null);
        setSuppliers([]);
        setProducts([]);
        setSales([]);
        setClosures([]);
        setLoading(false);
        localStorage.removeItem("quiral_demo_bypass");
        setIsDemoUser(false);
        return;
      }

      if (session?.user) {
        const hasDemo = localStorage.getItem("quiral_demo_bypass") === "true";
        if (hasDemo) {
          printSecurityWarning();
          setIsDemoUser(true);
          const demoProfile: UserProfile = {
            id: session.user.id,
            email: session.user.email || "demo30@quiral.xyz",
            username: "30",
            storeId: DEMO_STORE_ID,
            storeName: "Quiral Demo 30",
            role: "owner",
            isDemoUser: true,
          };
          setUserProfile(demoProfile);
          setStoreId(DEMO_STORE_ID);
          void loadData(DEMO_STORE_ID, true);
        } else {
          const membership = await getStoreMembership(session.user.id);
          if (membership) {
            setUserProfile({
              id: session.user.id,
              email: session.user.email || "",
              username: membership.username,
              storeId: membership.storeId,
              storeName: membership.storeName,
              role: membership.role,
              isDemoUser: false,
            });
            setStoreId(membership.storeId);
            setIsDemoUser(false);
            void loadData(membership.storeId, false);
          }
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
      if (activeChannel) {
        supabase.removeChannel(activeChannel);
      }
    };
  }, [loadData]);

  // Suscripción Realtime a cambios concurrentes de la tienda activa
  useEffect(() => {
    if (!storeId || isDemoUser) return;

    const channel = supabase
      .channel(`realtime:store:${storeId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products", filter: `store_id=eq.${storeId}` },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const rowData = payload.new?.data as Product;
            if (rowData) {
              setProducts((prev) => [rowData, ...prev.filter((p) => p.id !== rowData.id)]);
            }
          } else if (payload.eventType === "DELETE") {
            const oldId = payload.old?.id as string;
            if (oldId) {
              setProducts((prev) => prev.filter((p) => p.id !== oldId));
            }
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sales", filter: `store_id=eq.${storeId}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const rowData = payload.new?.data as Sale;
            if (rowData) {
              setSales((prev) => [rowData, ...prev.filter((s) => s.id !== rowData.id)]);
            }
          } else if (payload.eventType === "UPDATE") {
            const rowData = payload.new?.data as Sale;
            if (rowData) {
              setSales((prev) => prev.map((s) => (s.id === rowData.id ? rowData : s)));
            }
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cycle_closings", filter: `store_id=eq.${storeId}` },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const rowData = payload.new?.data as Closure;
            if (rowData) {
              setClosures((prev) => [rowData, ...prev.filter((c) => c.id !== rowData.id)]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [storeId, isDemoUser]);

  // Persistencia segura en Supabase
  const persist = useCallback(
    async (table: string, entity: { id: string }) => {
      if (!storeId) return;
      if (isDemoUser) return; // En demo local no bloqueamos con errores de BD
      const { error: err } = await supabase.from(table).upsert({
        store_id: storeId,
        id: entity.id,
        data: entity,
        updated_at: new Date().toISOString(),
      });
      if (err) throw err;
    },
    [storeId, isDemoUser]
  );

  const cartUnits = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  // Proveedores
  const addSupplier = (data: Omit<Supplier, "id">) => {
    const value: Supplier = { ...data, id: makeId("sup") };
    setSuppliers((prev) => [value, ...prev]);
    void persist("suppliers", value).catch((err) => report(err.message));
    return value;
  };

  const updateSupplier = (value: Supplier) => {
    setSuppliers((prev) => prev.map((s) => (s.id === value.id ? value : s)));
    void persist("suppliers", value).catch((err) => report(err.message));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    if (storeId && !isDemoUser) {
      void supabase.from("suppliers").delete().eq("store_id", storeId).eq("id", id);
    }
  };

  const getSupplier = (id: string) => suppliers.find((s) => s.id === id);

  // Productos
  const addProduct = (data: Omit<Product, "id" | "createdAt">) => {
    const value = normalizedProduct({
      ...data,
      id: makeId("prod"),
      createdAt: new Date().toISOString(),
    });
    setProducts((prev) => [value, ...prev]);
    void persist("products", value).catch((err) => report(err.message));
    return value;
  };

  const updateProduct = (value: Product) => {
    const norm = normalizedProduct(value);
    setProducts((prev) => prev.map((p) => (p.id === norm.id ? norm : p)));
    void persist("products", norm).catch((err) => report(err.message));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (storeId && !isDemoUser) {
      void supabase.from("products").delete().eq("store_id", storeId).eq("id", id);
    }
  };

  const mutateProduct = (productId: string, mutator: (p: Product) => Product) => {
    const current = products.find((p) => p.id === productId);
    if (current) {
      updateProduct(mutator(current));
    }
  };

  const adjustBatchStock = (productId: string, batchId: string, delta: number) => {
    mutateProduct(productId, (p) => ({
      ...p,
      batches: p.batches.map((b) =>
        b.id === batchId ? { ...b, stock: Math.max(0, b.stock + Math.trunc(delta)) } : b
      ),
    }));
  };

  const adjustMasterStock = (productId: string, delta: number) => {
    mutateProduct(productId, (p) => {
      const batches = p.batches.map((b) => ({ ...b }));
      const steps = Math.abs(Math.trunc(delta));
      for (let i = 0; i < steps; i++) {
        const candidates = batches
          .map((b, index) => ({ b, index }))
          .filter((x) => delta > 0 || x.b.stock > 0);

        const target = candidates.sort(
          (a, b) => b.b.stock - a.b.stock || a.index - b.index
        )[0];

        if (!target) break;
        target.b.stock += delta > 0 ? 1 : -1;
      }
      return { ...p, batches };
    });
  };

  const addBatchToProduct = (productId: string, data: Omit<Batch, "id">) => {
    mutateProduct(productId, (p) => ({
      ...p,
      batches: [
        ...p.batches,
        {
          ...data,
          id: makeId("batch"),
          cost: Math.max(0, Math.round(data.cost)),
          stock: Math.max(0, Math.floor(data.stock)),
        },
      ],
    }));
  };

  const updateProductPrice = (productId: string, price: number) => {
    mutateProduct(productId, (p) => ({
      ...p,
      price: Math.max(0, Math.round(price)),
    }));
  };

  const purgeOutOfStock = () => {
    const removed = products.filter((p) => p.batches.every((b) => b.stock === 0));
    setProducts((prev) => prev.filter((p) => !removed.some((r) => r.id === p.id)));
    if (storeId && !isDemoUser) {
      void Promise.all(
        removed.map((p) =>
          supabase.from("products").delete().eq("store_id", storeId).eq("id", p.id)
        )
      );
    }
    return removed.length;
  };

  // Carrito de compras
  const addToCart = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return false;
    const existing = cart.find((i) => i.productId === productId);
    const batch = product.batches.filter((b) => b.stock > 0).sort((a, b) => b.stock - a.stock)[0];
    if (!batch) return false;

    if (existing) {
      const active = product.batches.find((b) => b.id === existing.batchId);
      if (!active || existing.quantity >= active.stock) return false;
      setCart((prev) =>
        prev.map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i))
      );
    } else {
      setCart((prev) => [
        ...prev,
        { productId, batchId: batch.id, quantity: 1, unitPrice: product.price },
      ]);
    }
    return true;
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    const item = cart.find((i) => i.productId === productId);
    const product = products.find((p) => p.id === productId);
    const stock = product?.batches.find((b) => b.id === item?.batchId)?.stock ?? 0;
    const next = Math.min(Math.max(0, Math.floor(quantity)), stock);
    setCart((prev) =>
      next === 0
        ? prev.filter((i) => i.productId !== productId)
        : prev.map((i) => (i.productId === productId ? { ...i, quantity: next } : i))
    );
  };

  const updateCartItemPrice = (productId: string, unitPrice: number) => {
    if (Number.isFinite(unitPrice) && unitPrice >= 0) {
      setCart((prev) =>
        prev.map((i) => (i.productId === productId ? { ...i, unitPrice: Math.round(unitPrice) } : i))
      );
    }
  };

  const updateCartItemBatch = (productId: string, batchId: string) => {
    const product = products.find((p) => p.id === productId);
    const batch = product?.batches.find((b) => b.id === batchId);
    if (!batch || batch.stock <= 0) return;
    setLastSelectedSupplierId(batch.supplierId);
    setCart((prev) =>
      prev.map((i) =>
        i.productId === productId
          ? { ...i, batchId, quantity: Math.min(i.quantity, batch.stock) }
          : i
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const clearCart = () => setCart([]);

  // Ventas: Concurrencia y RPC Atómico
  const completeSale = (paymentMethod: PaymentMethod, total: number, customerName?: string) => {
    const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    if (!cart.length || !Number.isFinite(total) || total < 0 || total > subtotal) return false;

    const nextNumber = (sales[0]?.saleNumber ?? 1000) + 1;
    const saleItems: SaleItem[] = cart.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      const batch = product?.batches.find((b) => b.id === item.batchId);
      return {
        id: makeId("item"),
        productId: item.productId,
        productName: product?.name ?? "Producto",
        qty: item.quantity,
        unitPrice: item.unitPrice,
        unitCostSnapshot: batch?.cost ?? 0,
        batchId: item.batchId,
        warrantyDays: product?.warrantyDays ?? 30,
        warrantyClaimed: false,
      };
    });

    const newSale: Sale = {
      id: makeId("sale"),
      saleNumber: nextNumber,
      customerName: customerName?.trim() || "Cliente General",
      paymentMethod,
      totalAmount: Math.round(total),
      createdAt: new Date().toISOString(),
      items: saleItems,
    };

    // Actualización optimista local inmediata
    setSales((prev) => [newSale, ...prev]);
    setProducts((prev) =>
      prev.map((p) => {
        const item = cart.find((i) => i.productId === p.id);
        if (!item) return p;
        return {
          ...p,
          batches: p.batches.map((b) =>
            b.id === item.batchId ? { ...b, stock: Math.max(0, b.stock - item.quantity) } : b
          ),
        };
      })
    );
    setCart([]);

    // Transacción atómica en Supabase si está conectado
    if (storeId && !isDemoUser) {
      void supabase
        .rpc("complete_sale", {
          target_store: storeId,
          sale_id: newSale.id,
          sale_number: newSale.saleNumber,
          sale_created_at: newSale.createdAt,
          sale_data: newSale,
          lines: cart,
        })
        .then(({ error: rpcErr }) => {
          if (rpcErr) {
            report(`Aviso de sincronización en venta: ${rpcErr.message}`);
          }
        });
    }

    return true;
  };

  const toggleItemWarranty = (saleId: string, itemId: string, note?: string) => {
    const sale = sales.find((s) => s.id === saleId);
    if (!sale) return;

    const updatedSale: Sale = {
      ...sale,
      items: sale.items.map((i) =>
        i.id === itemId
          ? {
              ...i,
              warrantyClaimed: !i.warrantyClaimed,
              warrantyClaimNote: note !== undefined ? note : i.warrantyClaimNote,
            }
          : i
      ),
    };

    setSales((prev) => prev.map((s) => (s.id === saleId ? updatedSale : s)));
    void persist("sales", updatedSale).catch((err) => report(err.message));
  };

  const createClosure = (
    data: Omit<Closure, "id" | "closedAt"> & { id?: string; closedAt?: string }
  ) => {
    const value: Closure = {
      ...data,
      id: data.id ?? makeId("cycle"),
      closedAt: data.closedAt ?? new Date().toISOString(),
    };
    setClosures((prev) => [value, ...prev]);
    void persist("cycle_closings", value).catch((err) => report(err.message));
  };

  const signOut = async () => {
    await signOutUser();
    setUserProfile(null);
    setStoreId(null);
    setIsDemoUser(false);
    setSuppliers([]);
    setProducts([]);
    setSales([]);
    setClosures([]);
  };

  const refreshData = async () => {
    if (storeId) {
      await loadData(storeId, isDemoUser);
    }
  };

  return (
    <InventoryContext.Provider
      value={{
        suppliers,
        products,
        sales,
        closures,
        loading,
        error,
        userProfile,
        isDemoUser,
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
        createClosure,
        toggleItemWarranty,
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
        signOut,
        refreshData,
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
