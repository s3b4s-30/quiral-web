import {
  AlertTriangle,
  LogOut,
  Moon,
  MoreHorizontal,
  ShieldCheck,
  Sun,
  SunMoon,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useInventory } from "../context/InventoryContext";

export type Theme = "auto" | "light" | "dark";

interface TopMenuProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  onOpenSuppliers?: () => void;
  onOpenProfileSecurity?: () => void;
  onLogout: () => void;
}

export default function TopMenu({
  theme,
  onThemeChange,
  onOpenSuppliers,
  onOpenProfileSecurity,
  onLogout,
}: TopMenuProps) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { suppliers, userProfile, isDemoUser } = useInventory();

  const handleDismissBackdrop = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        event.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
    };
  }, [open]);

  return (
    <div className="theme-menu relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label="Abrir configuración y menú"
        title="Configuración"
        aria-expanded={open}
        aria-controls="top-menu-popover"
        onClick={() => setOpen((isOpen) => !isOpen)}
        className="relative z-50 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-elevated)] text-[#007aff] shadow-sm transition-colors duration-75 hover:opacity-80 active:scale-95 dark:text-[#0a84ff]"
      >
        {open ? <X size={20} /> : <MoreHorizontal size={20} />}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Cerrar menú de configuración"
            className="fixed inset-0 z-40 h-full w-full cursor-default bg-black/50 touch-none"
            onClick={handleDismissBackdrop}
            onTouchEnd={handleDismissBackdrop}
            onMouseDown={handleDismissBackdrop}
          />
          <div
            ref={popoverRef}
            id="top-menu-popover"
            role="menu"
            className="absolute right-0 top-12 z-50 w-72 origin-top-right rounded-3xl border border-[var(--border-color)] bg-[var(--bg-elevated)] p-4 shadow-2xl shadow-black/30 animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Información de Tienda y Usuario */}
            <div className="mb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-[var(--text-primary)] truncate transition-colors duration-75">
                    {userProfile?.storeName || "Quiral POS"}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] truncate">
                    {userProfile?.username ? `@${userProfile.username}` : "Usuario activo"}
                  </p>
                </div>
                <span className="shrink-0 rounded-md bg-[#007aff]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#007aff] dark:text-[#0a84ff]">
                  {userProfile?.role === "owner" ? "Dueño" : "Vendedor"}
                </span>
              </div>

              {/* Alerta de Modo Demo 30/30 Permanente */}
              {isDemoUser && (
                <div className="mt-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-300">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Modo Demo 30/30 (Inseguro)</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed opacity-90">
                    Entorno de prueba pública sin contraseña cifrada personal. No uses datos reales.
                  </p>
                </div>
              )}
            </div>

            <div className="my-2 border-t border-[var(--border-color)]" />

            {/* Acceso a Perfil y Seguridad */}
            {onOpenProfileSecurity && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onOpenProfileSecurity();
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-none hover:bg-black/5 dark:hover:bg-white/5"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck size={16} />
                  </div>
                  <span className="transition-none">Perfil y Seguridad</span>
                </div>
              </button>
            )}

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

            {/* Fila Cerrar sesión / Cambiar cuenta */}
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
        </>
      )}
    </div>
  );
}
