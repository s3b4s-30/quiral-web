import { AlertTriangle, CheckCircle, KeyRound, Lock, LogIn, Mail, Store, User, UserPlus } from "lucide-react";
import React, { useState } from "react";
import { DEMO_BYPASS_PASS, DEMO_BYPASS_USER, requestPasswordReset, signIn, signUpUser } from "../lib/authService";

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

type AuthMode = "login" | "register" | "forgot";

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeIdToJoin, setStoreIdToJoin] = useState("");
  const [isJoiningStore, setIsJoiningStore] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!identifier.trim() || !password) {
      setError("Ingresa tu usuario/correo y contraseña.");
      return;
    }

    setLoading(true);
    try {
      await signIn(identifier, password);
      onAuthSuccess();
    } catch (err: any) {
      console.error("Error en login:", err);
      setError(err?.message || "Credenciales incorrectas o problema de conexión.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim() || !username.trim() || !password) {
      setError("Completa todos los campos obligatorios.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      await signUpUser(
        email,
        username,
        password,
        isJoiningStore ? "" : storeName || "Mi tienda",
        isJoiningStore ? storeIdToJoin : undefined
      );
      setSuccessMessage("¡Cuenta creada exitosamente! Iniciando sesión...");
      setTimeout(async () => {
        try {
          await signIn(username, password);
          onAuthSuccess();
        } catch {
          setMode("login");
          setIdentifier(username);
        }
      }, 1000);
    } catch (err: any) {
      console.error("Error en registro:", err);
      setError(err?.message || "No se pudo registrar la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setError("Ingresa el correo electrónico asociado a tu cuenta.");
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSuccessMessage("Se ha enviado un enlace de recuperación a tu correo.");
    } catch (err: any) {
      console.error("Error en recuperación:", err);
      setError(err?.message || "No se pudo enviar el correo de recuperación.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoFill = () => {
    setIdentifier(DEMO_BYPASS_USER);
    setPassword(DEMO_BYPASS_PASS);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 dark:bg-black/85 p-4 sm:p-6 transition-all duration-200">
      <div className="w-full max-w-md rounded-3xl border border-[var(--border-color)] bg-[var(--bg-elevated)] p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Cabecera / Marca Quiral */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#007aff] text-white shadow-lg shadow-blue-500/30">
            <Store size={28} />
          </div>
          <h1 className="mt-3 text-2xl font-black tracking-tight text-[var(--text-primary)]">
            Quiral POS
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium">
            {mode === "login" && "Acceso para propietarios y colaboradores"}
            {mode === "register" && "Crea tu tienda o únete como colaborador"}
            {mode === "forgot" && "Recuperación de contraseña segura"}
          </p>
        </div>

        {/* Notificaciones de Error / Éxito */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl bg-red-500/10 border border-red-500/20 p-3 text-xs font-semibold text-red-600 dark:text-red-400 animate-in fade-in">
            <AlertTriangle size={16} className="shrink-0" />
            <span className="flex-1 leading-tight">{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
            <CheckCircle size={16} className="shrink-0" />
            <span className="flex-1 leading-tight">{successMessage}</span>
          </div>
        )}

        {/* Formulario de Login */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                Usuario o Correo
              </label>
              <div className="relative flex items-center">
                <User size={16} className="absolute left-3.5 text-[var(--text-secondary)] pointer-events-none" />
                <input
                  type="text"
                  autoCapitalize="none"
                  autoCorrect="false"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="ej. demo o correo@tienda.com"
                  className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] pl-10 pr-4 py-3 text-sm font-semibold text-[var(--text-primary)] outline-none focus:border-[#007aff] transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSuccessMessage(null);
                    setMode("forgot");
                  }}
                  className="text-xs font-semibold text-[#007aff] dark:text-[#0a84ff] hover:underline"
                >
                  ¿Olvidaste tu clave?
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock size={16} className="absolute left-3.5 text-[var(--text-secondary)] pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] pl-10 pr-4 py-3 text-sm font-semibold text-[var(--text-primary)] outline-none focus:border-[#007aff] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-2xl bg-[#007aff] hover:bg-[#006ee6] py-3.5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(0,122,255,0.4)] active:scale-[0.99] transition-transform disabled:opacity-50"
            >
              <LogIn size={18} />
              <span>{loading ? "Iniciando sesión..." : "Iniciar Sesión"}</span>
            </button>

            {/* Acceso Rápido de Prueba 30 / 30 con Alerta de Seguridad */}
            <div className="mt-4 pt-3 border-t border-[var(--border-color)]">
              <button
                type="button"
                onClick={handleQuickDemoFill}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold hover:bg-amber-500/15 active:scale-95 transition-all"
              >
                <KeyRound size={14} />
                <span>Rellenar Acceso Rápido de Prueba (30 / 30)</span>
              </button>
              <p className="mt-1.5 text-[10px] text-center text-amber-500/80 font-medium leading-tight">
                ⚠️ Acceso exclusivo para pruebas de desarrollo. Se eliminará antes del lanzamiento en quiral.xyz.
              </p>
            </div>

            <div className="text-center pt-2">
              <span className="text-xs text-[var(--text-secondary)]">¿No tienes cuenta? </span>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setSuccessMessage(null);
                  setMode("register");
                }}
                className="text-xs font-bold text-[#007aff] dark:text-[#0a84ff] hover:underline"
              >
                Crear tienda
              </button>
            </div>
          </form>
        )}

        {/* Formulario de Registro */}
        {mode === "register" && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                Correo Electrónico
              </label>
              <div className="relative flex items-center">
                <Mail size={16} className="absolute left-3.5 text-[var(--text-secondary)] pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="propietario@tienda.com"
                  className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] pl-10 pr-4 py-3 text-sm font-semibold text-[var(--text-primary)] outline-none focus:border-[#007aff] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                Nombre de Usuario Único
              </label>
              <div className="relative flex items-center">
                <User size={16} className="absolute left-3.5 text-[var(--text-secondary)] pointer-events-none" />
                <input
                  type="text"
                  autoCapitalize="none"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ""))}
                  placeholder="ej. juan_pos"
                  className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] pl-10 pr-4 py-3 text-sm font-semibold text-[var(--text-primary)] outline-none focus:border-[#007aff] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                Contraseña (mínimo 6 caracteres)
              </label>
              <div className="relative flex items-center">
                <Lock size={16} className="absolute left-3.5 text-[var(--text-secondary)] pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] pl-10 pr-4 py-3 text-sm font-semibold text-[var(--text-primary)] outline-none focus:border-[#007aff] transition-colors"
                />
              </div>
            </div>

            {/* Alternar Crear Tienda vs Unirse a Tienda */}
            <div className="pt-1">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  {isJoiningStore ? "ID de Tienda a Unirse" : "Nombre de tu Tienda"}
                </label>
                <button
                  type="button"
                  onClick={() => setIsJoiningStore(!isJoiningStore)}
                  className="text-xs font-semibold text-[#007aff] dark:text-[#0a84ff] hover:underline"
                >
                  {isJoiningStore ? "Crear nueva tienda" : "Unirse a tienda existente"}
                </button>
              </div>

              {isJoiningStore ? (
                <input
                  type="text"
                  value={storeIdToJoin}
                  onChange={(e) => setStoreIdToJoin(e.target.value)}
                  placeholder="Pega el UUID de la tienda"
                  className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)] outline-none focus:border-[#007aff] transition-colors"
                />
              ) : (
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="ej. Apple Store Medellín"
                  className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)] outline-none focus:border-[#007aff] transition-colors"
                />
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-2xl bg-[#007aff] hover:bg-[#006ee6] py-3.5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(0,122,255,0.4)] active:scale-[0.99] transition-transform disabled:opacity-50"
            >
              <UserPlus size={18} />
              <span>{loading ? "Creando cuenta..." : "Registrar Tienda"}</span>
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-[var(--text-secondary)]">¿Ya tienes cuenta? </span>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setSuccessMessage(null);
                  setMode("login");
                }}
                className="text-xs font-bold text-[#007aff] dark:text-[#0a84ff] hover:underline"
              >
                Iniciar sesión
              </button>
            </div>
          </form>
        )}

        {/* Formulario de Recuperación de Contraseña */}
        {mode === "forgot" && (
          <form onSubmit={handleForgotPassword} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                Correo Electrónico
              </label>
              <div className="relative flex items-center">
                <Mail size={16} className="absolute left-3.5 text-[var(--text-secondary)] pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@tienda.com"
                  className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] pl-10 pr-4 py-3 text-sm font-semibold text-[var(--text-primary)] outline-none focus:border-[#007aff] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-2xl bg-[#007aff] hover:bg-[#006ee6] py-3.5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(0,122,255,0.4)] active:scale-[0.99] transition-transform disabled:opacity-50"
            >
              <span>{loading ? "Enviando..." : "Enviar Enlace de Recuperación"}</span>
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setSuccessMessage(null);
                  setMode("login");
                }}
                className="text-xs font-bold text-[#007aff] dark:text-[#0a84ff] hover:underline"
              >
                Volver a Iniciar sesión
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
