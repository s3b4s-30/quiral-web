import { Check, LogOut, Moon, MoreHorizontal, Sun, SunMoon, Users, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useInventory } from "../context/InventoryContext";

export type Theme = "auto" | "light" | "dark";

interface TopMenuProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  onOpenSuppliers?: () => void;
  onLogout: () => void;
}

export default function TopMenu({
  theme,
  onThemeChange,
  onOpenSuppliers,
  onLogout,
}: TopMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { suppliers } = useInventory();

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  return (
    <div className="theme-menu relative" ref={menuRef}>
      <button
        type="button"
        aria-label="Abrir configuración y menú"
        title="Configuración"
        aria-expanded={open}
        aria-controls="top-menu-popover"
        onClick={() => setOpen((isOpen) => !isOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-elevated)] text-[#007aff] shadow-sm transition-colors duration-75 hover:opacity-80 active:scale-95 dark:text-[#0a84ff]"
      >
        {open ? <X size={20} /> : <MoreHorizontal size={20} />}
      </button>

      {open && (
        <div id="top-menu-popover" role="menu" className="absolute right-0 top-12 z-50 w-72 origin-top-right rounded-3xl border border-[var(--border-color)] bg-[var(--bg-elevated)] p-4 shadow-2xl shadow-black/25 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
          <div className="mb-3">
            <h3 className="text-base font-bold text-[var(--text-primary)] transition-colors duration-75">Configuración</h3>
            <div className="mt-1 flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <span className="inline-block h-2 w-2 rounded-full bg-[#30d158]" />
              <span className="transition-colors duration-75">Sesión activa en tienda</span>
            </div>
          </div>

          <div className="my-2 border-t border-[var(--border-color)]" />

          {/* Selector de Apariencia */}
          <div className="mb-3">
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] transition-colors duration-75">
              Apariencia
            </p>
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-black/5 p-1 dark:bg-white/5">
              <button
                type="button"
                onClick={() => onThemeChange("auto")}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-colors duration-75 ${
                  theme === "auto"
                    ? "bg-[#007aff] text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <SunMoon size={14} /> Auto
              </button>
              <button
                type="button"
                onClick={() => onThemeChange("light")}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-colors duration-75 ${
                  theme === "light"
                    ? "bg-[#007aff] text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Sun size={14} /> Claro
              </button>
              <button
                type="button"
                onClick={() => onThemeChange("dark")}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-colors duration-75 ${
                  theme === "dark"
                    ? "bg-[#007aff] text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Moon size={14} /> Oscuro
              </button>
            </div>
          </div>

          {/* Fila Proveedores */}
          {onOpenSuppliers && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onOpenSuppliers();
              }}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-none hover:bg-black/5 dark:hover:bg-white/5"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#007aff]/15 text-[#007aff] dark:text-[#0a84ff]">
                  <Users size={16} />
                </div>
                <span className="transition-none">Proveedores</span>
              </div>
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-black/10 px-1.5 text-xs font-bold text-[var(--text-secondary)] dark:bg-white/10 transition-colors duration-75">
                {suppliers.length}
              </span>
            </button>
          )}

          {/* Fila Cerrar sesión */}
          <div className="mt-2 pt-2 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="flex w-full items-center gap-2.5 rounded-xl bg-[#ff3b30]/10 px-3 py-2.5 text-left text-sm font-semibold text-[#ff3b30] transition-colors duration-75 hover:bg-[#ff3b30]/15"
            >
              <LogOut size={16} />
              <span>Cerrar sesión</span>
            </button>
          </div>

          <p className="mt-3 text-center text-[11px] font-medium text-[var(--text-secondary)]/70 transition-none">
            Quiral · by Elytra
          </p>
        </div>
      )}
    </div>
  );
}
