import { Plus, Trash2 } from "lucide-react";
import AdminCompactButton from "./AdminCompactButton";
import { useInventory } from "../context/InventoryContext";
import { Tab } from "./Navbar";
import TopMenu, { Theme } from "./TopMenu";

interface TopHeaderProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  onOpenSuppliers: () => void;
  onLogout: () => void;
}

const TAB_TITLES: Record<Tab, string> = {
  inventory: "Inventario",
  sell: "Vender",
  summary: "Resumen",
  history: "Historial",
};

/**
 * TopHeader — Cabecera Fija Nativa Superior (Apple HIG)
 * 
 * Correcciones aplicadas:
 * 1. Espaciado superior estricto: sin márgenes redundantes ni artificios de padding fijo.
 * 2. Título «Inventario» en flexbox con flex-1 y truncate para nunca colisionar con acciones.
 * 3. Modo Administrador unificado mediante AdminCompactButton: adaptable a cualquier ancho.
 * 4. Distribución predecible con gap consistente y controles de tamaño táctil accesible.
 */
export default function TopHeader({
  activeTab,
  onTabChange,
  theme,
  onThemeChange,
  onOpenSuppliers,
  onLogout,
}: TopHeaderProps) {
  const { setIsNewProductModalOpen, setIsPurgeModalOpen } = useInventory();

  const title = TAB_TITLES[activeTab] || "Quiral";

  return (
    <header className="quiral-top-header select-none transition-colors duration-75">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
        {/* Título: flexible con truncamiento para nunca empujar los controles */}
        <button
          type="button"
          onClick={() => onTabChange(activeTab)}
          className="min-w-0 flex-1 text-left"
          aria-label={`Volver al inicio de ${title}`}
        >
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)] truncate transition-colors duration-75">
            {title}
          </h1>
        </button>

        {/* Controles de Acción: Flexbox unificado, sin posiciones absolutas */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {activeTab === "inventory" && (
            <>
              {/* Control único y compacto de Modo Administrador */}
              <AdminCompactButton />

              {/* Botón: Purgar productos agotados */}
              <button
                type="button"
                onClick={() => setIsPurgeModalOpen(true)}
                title="Purgar productos agotados"
                aria-label="Purgar stock agotado"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ff3b30]/25 bg-[#ff3b30]/10 text-[#ff3b30] shadow-sm transition-colors duration-75 hover:bg-[#ff3b30]/20 active:scale-95"
              >
                <Trash2 size={16} />
              </button>

              {/* Botón: Crear nuevo producto */}
              <button
                type="button"
                onClick={() => setIsNewProductModalOpen(true)}
                title="Crear nuevo producto"
                aria-label="Nuevo producto"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-elevated)] text-[#007aff] shadow-sm transition-colors duration-75 hover:opacity-80 active:scale-95 dark:text-[#0a84ff]"
              >
                <Plus size={19} strokeWidth={2.5} />
              </button>
            </>
          )}

          {/* Menú de configuración persistente */}
          <TopMenu
            theme={theme}
            onThemeChange={onThemeChange}
            onOpenSuppliers={onOpenSuppliers}
            onLogout={onLogout}
          />
        </div>
      </div>
    </header>
  );
}
