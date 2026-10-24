import { Check, ChevronLeft, Edit2, Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { SUPPLIER_PALETTE, useInventory } from "../context/InventoryContext";
import { Supplier } from "../types/domain";

interface SuppliersModalProps {
  onClose: () => void;
}

export default function SuppliersModal({ onClose }: SuppliersModalProps) {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useInventory();

  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedColor, setSelectedColor] = useState(SUPPLIER_PALETTE[0]);
  const [error, setError] = useState<string | null>(null);

  const startEdit = (sup: Supplier) => {
    setEditingSupplier(sup);
    setName(sup.name);
    setPhone(sup.phone || "");
    setSelectedColor(sup.color);
    setError(null);
  };

  const cancelEdit = () => {
    setEditingSupplier(null);
    setName("");
    setPhone("");
    setSelectedColor(SUPPLIER_PALETTE[0]);
    setError(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("El nombre del proveedor es obligatorio.");
      return;
    }

    if (editingSupplier) {
      updateSupplier({
        ...editingSupplier,
        name: name.trim(),
        phone: phone.trim() || undefined,
        color: selectedColor,
      });
      cancelEdit();
    } else {
      addSupplier({
        name: name.trim(),
        phone: phone.trim() || undefined,
        color: selectedColor,
      });
      setName("");
      setPhone("");
      setSelectedColor(SUPPLIER_PALETTE[0]);
    }
  };

  const handleDelete = (id: string, supName: string) => {
    if (confirm(`¿Eliminar proveedor "${supName}"? Los productos con este proveedor mantendrán sus lotes.`)) {
      if (editingSupplier?.id === id) {
        cancelEdit();
      }
      deleteSupplier(id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm sm:items-center sm:justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[32px] sm:rounded-[32px] border border-[var(--border-color)] bg-[var(--bg-elevated)] shadow-2xl transition-colors duration-75"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <header className="relative flex items-center justify-between border-b border-[var(--border-color)] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-[#007aff] transition-colors hover:bg-black/10 dark:bg-white/10 dark:text-[#0a84ff]"
            aria-label="Cerrar modal"
          >
            <ChevronLeft size={22} />
          </button>
          <h2 className="text-lg font-bold tracking-tight">Gestión de Proveedores</h2>
          <div className="w-10" />
        </header>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {/* Listado de Proveedores Registrados */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Proveedores Registrados ({suppliers.length})
              </span>
              {editingSupplier && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex items-center gap-1 text-xs font-semibold text-[#007aff] dark:text-[#0a84ff]"
                >
                  <Plus size={14} /> Nuevo proveedor
                </button>
              )}
            </div>

            {suppliers.length === 0 ? (
              <p className="py-6 text-center text-sm text-[var(--text-secondary)]">
                No hay proveedores registrados aún.
              </p>
            ) : (
              <div className="space-y-2">
                {suppliers.map((sup) => {
                  const isEditing = editingSupplier?.id === sup.id;
                  return (
                    <div
                      key={sup.id}
                      className={`flex items-center justify-between rounded-2xl border px-3.5 py-2.5 transition-colors duration-75 ${
                        isEditing
                          ? "border-[#007aff] bg-[#007aff]/5 dark:bg-[#007aff]/10"
                          : "border-[var(--border-color)] bg-[var(--bg-primary)]/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="h-4 w-4 rounded-full ring-2 ring-white/20 shadow-sm shrink-0"
                          style={{ backgroundColor: sup.color }}
                        />
                        <div>
                          <p className="font-semibold leading-tight text-sm flex items-center gap-2">
                            {sup.name}
                            {isEditing && (
                              <span className="rounded-full bg-[#007aff] px-2 py-0.5 text-[10px] font-bold text-white">
                                Editando
                              </span>
                            )}
                          </p>
                          {sup.phone && (
                            <p className="text-xs text-[var(--text-secondary)]">{sup.phone}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => startEdit(sup)}
                          title="Editar proveedor"
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#007aff]/15 text-[#007aff] transition-colors hover:bg-[#007aff]/25 dark:text-[#0a84ff]"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(sup.id, sup.name)}
                          title="Eliminar proveedor"
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ff3b30]/15 text-[#ff3b30] transition-colors hover:bg-[#ff3b30]/25"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Formulario Agregar / Editar */}
          <form onSubmit={handleSave} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)]/40 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                {editingSupplier
                  ? `Editar Proveedor: ${editingSupplier.name}`
                  : "Agregar Nuevo Proveedor"}
              </h3>
              {editingSupplier && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="text-xs font-semibold text-[#ff9500] hover:underline"
                >
                  Cancelar edición
                </button>
              )}
            </div>

            {error && (
              <p className="rounded-xl bg-[#ff3b30]/15 p-2.5 text-xs font-medium text-[#ff3b30]">
                {error}
              </p>
            )}

            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                Nombre del proveedor *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                placeholder="Ej. Mayorista Monterrey"
                className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[#007aff]"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                Contacto / Teléfono
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+57 300 000 0000"
                className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[#007aff]"
              />
            </div>

            {/* Grilla de 13 Colores */}
            <div>
              <label className="mb-2 block text-xs font-medium text-[var(--text-secondary)]">
                Color de identificación
              </label>
              <div className="grid grid-cols-6 sm:grid-cols-7 gap-2.5">
                {SUPPLIER_PALETTE.map((color) => {
                  const isSelected = selectedColor === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      aria-label={`Seleccionar color ${color}`}
                      className="relative flex h-10 w-10 items-center justify-center rounded-full transition-transform active:scale-95 shadow-sm"
                      style={{ backgroundColor: color }}
                    >
                      {isSelected && (
                        <Check size={20} strokeWidth={3} className="text-white drop-shadow-md" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="pt-2">
              {editingSupplier ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="flex min-h-11 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)] text-sm font-semibold text-[var(--text-primary)] transition-opacity hover:opacity-80"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex min-h-11 items-center justify-center rounded-xl bg-[#007aff] text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90"
                  >
                    Guardar Cambios
                  </button>
                </div>
              ) : (
                <button
                  type="submit"
                  className="flex min-h-11 w-full items-center justify-center rounded-xl bg-[#007aff] text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90"
                >
                  Guardar Proveedor
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

