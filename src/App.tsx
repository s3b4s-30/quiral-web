import { useEffect, useState } from "react";
import Navbar, { type NavbarVariant, type Tab } from "./components/Navbar";
import NewProductModal from "./components/NewProductModal";
import ProductDetailModal from "./components/ProductDetailModal";
import PurgeConfirmModal from "./components/PurgeConfirmModal";
import SuppliersModal from "./components/SuppliersModal";
import TopHeader from "./components/TopHeader";
import { type Theme } from "./components/TopMenu";
import { InventoryProvider, useInventory } from "./context/InventoryContext";
import InventoryView from "./views/InventoryView";

function getInitialTheme(): Theme {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem("quiral-theme");
  } catch (error) {
    console.error("No se pudo leer la preferencia de tema.", error);
  }
  return stored === "light" || stored === "dark" || stored === "auto" ? stored : "auto";
}

function AppInner() {
  const [activeTab, setActiveTab] = useState<Tab>("inventory");
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [navbarVariant] = useState<NavbarVariant>("floating");
  const [isSuppliersModalOpen, setIsSuppliersModalOpen] = useState(false);

  const {
    selectedProduct,
    setSelectedProduct,
    showCosts,
    isNewProductModalOpen,
    setIsNewProductModalOpen,
    isPurgeModalOpen,
    setIsPurgeModalOpen,
  } = useInventory();

  // Ocultar Navbar cuando cualquier modal o vista secundaria esté activa
  const hasActiveModal = Boolean(
    selectedProduct || isNewProductModalOpen || isPurgeModalOpen || isSuppliersModalOpen
  );

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    if (tab === "inventory") {
      requestAnimationFrame(() => {
        document.getElementById("inventory-scroll")?.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const isDark = theme === "dark" || (theme === "auto" && prefersDark.matches);
      root.classList.toggle("dark", isDark);

      // Sincronizar theme-color meta tag para Safari / iOS PWA
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute("content", isDark ? "#000000" : "#f2f2f7");
      }
    };

    applyTheme();
    try {
      localStorage.setItem("quiral-theme", theme);
    } catch (error) {
      console.error("No se pudo guardar la preferencia de tema.", error);
    }

    if (theme === "auto") {
      prefersDark.addEventListener("change", applyTheme);
      return () => prefersDark.removeEventListener("change", applyTheme);
    }
  }, [theme]);

  return (
    <div className="h-full w-full overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] relative">
      {/* Cabecera Fija Nativa Superior (100% sólida, sin blur, estática) */}
      <TopHeader
        activeTab={activeTab}
        onTabChange={handleTabChange}
        theme={theme}
        onThemeChange={setTheme}
        onOpenSuppliers={() => setIsSuppliersModalOpen(true)}
        onLogout={() => window.alert("Sesión cerrada exitosamente")}
      />

      {/* Contenedor Principal: las vistas manejan su scroll con .quiral-scroll-container */}
      <main className="h-full w-full overflow-hidden relative">
        {activeTab === "inventory" ? (
          <InventoryView onOpenSuppliers={() => setIsSuppliersModalOpen(true)} />
        ) : (
          <div className="quiral-scroll-container px-4 text-center text-[var(--text-secondary)]">
            <p className="text-base font-semibold pt-12">Esta sección estará disponible próximamente.</p>
            <button
              type="button"
              onClick={() => setActiveTab("inventory")}
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-[#007aff] px-4 py-2 text-xs font-bold text-white shadow-sm"
            >
              Volver a Inventario
            </button>
          </div>
        )}
      </main>

      {/* 
        Barra de Navegación Inferior Flotante:
        Se oculta dinámicamente cuando un modal está abierto para evitar solapamientos.
      */}
      {!hasActiveModal && (
        <Navbar
          activeTab={activeTab}
          cartCount={0}
          onTabChange={handleTabChange}
          variant={navbarVariant}
        />
      )}

      {/* 
        Modales Globales a nivel raíz:
        Al montarse fuera de <main>, no quedan atrapados en contextos de apilamiento (stacking context)
      */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          showCosts={showCosts}
          onClose={() => setSelectedProduct(null)}
          onOpenSuppliers={() => setIsSuppliersModalOpen(true)}
        />
      )}

      {isNewProductModalOpen && (
        <NewProductModal
          onClose={() => setIsNewProductModalOpen(false)}
          onOpenSuppliers={() => setIsSuppliersModalOpen(true)}
        />
      )}

      {isPurgeModalOpen && (
        <PurgeConfirmModal onClose={() => setIsPurgeModalOpen(false)} />
      )}

      {isSuppliersModalOpen && (
        <SuppliersModal onClose={() => setIsSuppliersModalOpen(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <InventoryProvider>
      <AppInner />
    </InventoryProvider>
  );
}
