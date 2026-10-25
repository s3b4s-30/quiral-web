import { AlertTriangle, CheckCircle, KeyRound, Lock, ShieldCheck, User } from "lucide-react";
import React, { useState } from "react";
import { updateCredentials } from "../lib/authService";
import ModalSheet from "./ModalSheet";

interface ProfileSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartClose?: () => void;
  currentUsername: string;
  storeName: string;
  userEmail: string;
  role: string;
  isDemoUser?: boolean;
}

export default function ProfileSecurityModal({
  isOpen,
  onClose,
  onStartClose,
  currentUsername,
  storeName,
  userEmail,
  role,
  isDemoUser = false,
}: ProfileSecurityModalProps) {
  const [newUsername, setNewUsername] = useState(currentUsername);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (isDemoUser) {
      setError("La cuenta demo 30/30 está protegida contra modificaciones directas de credenciales.");
      return;
    }

    if (!currentPassword) {
      setError("Debes ingresar tu contraseña actual para confirmar los cambios.");
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError("La confirmación de la nueva contraseña no coincide.");
      return;
    }

    setLoading(true);
    try {
      await updateCredentials(
        currentPassword,
        newUsername !== currentUsername ? newUsername : undefined,
        newPassword || undefined
      );

      setSuccess("Tus credenciales se han actualizado correctamente.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("Error al actualizar credenciales:", err);
      setError(err?.message || "No se pudieron actualizar las credenciales.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalSheet
      title="Perfil y Seguridad"
      onClose={onClose}
      onStartClose={onStartClose}
      className="max-h-[92vh]"
      contentClassName="p-4 sm:p-5 space-y-4"
    >
      {/* Información del Tenant / Tienda con tokens OLED */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-elevated)] p-3.5 space-y-1.5 select-none shadow-sm">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--text-secondary)] font-medium">Tienda</span>
          <span className="font-bold text-[var(--text-primary)]">{storeName}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--text-secondary)] font-medium">Correo</span>
          <span className="font-semibold text-[var(--text-primary)]">{userEmail}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--text-secondary)] font-medium">Rol</span>
          <span className="rounded-full bg-[#007aff]/15 text-[#007aff] dark:text-[#0a84ff] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            {role === "owner" ? "Propietario" : "Colaborador"}
          </span>
        </div>
      </div>

      {isDemoUser && (
        <div className="flex items-center gap-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 p-3 text-xs font-semibold text-amber-600 dark:text-amber-400">
          <AlertTriangle size={16} className="shrink-0" />
          <span className="leading-tight">
            ⚠️ Cuenta de prueba activa (30 / 30). Las modificaciones de perfil están restringidas para mantener el entorno de prueba intacto.
          </span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-2xl bg-[#ff3b30]/10 border border-[#ff3b30]/20 p-3 text-xs font-semibold text-[#ff3b30] animate-in fade-in">
          <AlertTriangle size={16} className="shrink-0" />
          <span className="flex-1 leading-tight">{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-2xl bg-[#30d158]/10 border border-[#30d158]/20 p-3 text-xs font-semibold text-[#30d158] animate-in fade-in">
          <CheckCircle size={16} className="shrink-0" />
          <span className="flex-1 leading-tight">{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5 pb-4">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
            Nombre de Usuario
          </label>
          <div className="relative flex items-center">
            <User size={16} className="absolute left-3.5 text-[var(--text-secondary)] pointer-events-none" />
            <input
              type="text"
              autoCapitalize="none"
              disabled={isDemoUser}
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ""))}
              className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-elevated)] pl-10 pr-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] outline-none focus:border-[#007aff] transition-colors disabled:opacity-50"
            />
          </div>
        </div>

        <div className="border-t border-[var(--border-color)] pt-3">
          <p className="text-xs font-bold text-[var(--text-primary)] mb-2 flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-[#007aff]" />
            <span>Seguridad y Contraseña</span>
          </p>

          <div className="space-y-2.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                Contraseña Actual (Obligatoria para confirmar)
              </label>
              <div className="relative flex items-center">
                <KeyRound size={16} className="absolute left-3.5 text-[var(--text-secondary)] pointer-events-none" />
                <input
                  type="password"
                  disabled={isDemoUser}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-elevated)] pl-10 pr-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] outline-none focus:border-[#007aff] transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                Nueva Contraseña (Opcional)
              </label>
              <div className="relative flex items-center">
                <Lock size={16} className="absolute left-3.5 text-[var(--text-secondary)] pointer-events-none" />
                <input
                  type="password"
                  disabled={isDemoUser}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Dejar en blanco para mantener"
                  className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-elevated)] pl-10 pr-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] outline-none focus:border-[#007aff] transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            {newPassword && (
              <div className="animate-in fade-in">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative flex items-center">
                  <Lock size={16} className="absolute left-3.5 text-[var(--text-secondary)] pointer-events-none" />
                  <input
                    type="password"
                    disabled={isDemoUser}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la nueva contraseña"
                    className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-elevated)] pl-10 pr-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] outline-none focus:border-[#007aff] transition-colors disabled:opacity-50"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || isDemoUser}
          className="w-full mt-2 rounded-2xl bg-[#007aff] hover:bg-[#0062cc] py-3.5 text-sm font-bold text-white shadow-md active:scale-[0.99] transition-transform disabled:opacity-50 select-none"
        >
          {loading ? "Guardando cambios..." : "Actualizar Credenciales"}
        </button>
      </form>
    </ModalSheet>
  );
}
