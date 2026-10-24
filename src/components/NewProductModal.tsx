import React, { useEffect, useState } from "react";
import ModalSheet from "./ModalSheet";
import { useInventory } from "../context/InventoryContext";
import { ProductCategory } from "../types/domain";
import { formatCOP, parseCOPInput } from "../utils/formatters";

interface NewProductModalProps {
  onClose: () => void;
  onStartClose?: () => void;
  onOpenSuppliers: () => void;
}

const CATEGORIES: ProductCategory[] = [
  "Cargadores y Cables",
  "Forros / Fundas",
  "Audio / AirPods",
];

// Chips para Cargadores y Cables (actualizado "Cubo" en vez de "Cubito Cargador")
const CHARGER_SUBTYPES = ["Cubo", "Cable", "Completo [Cubo + Cable]"];
const CHARGER_BRANDS = ["iPhone", "1Hora", "Anker", "Belkin", "Tipo C"];
const CHARGER_POWERS = ["20W", "25W", "30W", "35W", "45W", "60W"];

// Chips para Forros / Fundas
const CASE_MATERIALS = [
  "Silicona Líquida",
  "Transparente Anti-amarilleo",
  "Lujo / MagSafe",
  "Uso Rudo",
];
const CASE_MODELS = [
  "iPhone 11",
  "iPhone 12 / 12 Pro",
  "iPhone 12 Pro Max",
  "iPhone 13 / 14",
  "iPhone 13 Pro Max",
  "iPhone 15",
  "iPhone 15 Pro",
  "iPhone 15 Pro Max",
];

// Chips para Audio / AirPods
const AUDIO_MODELS = [
  "AirPods Serie 4",
  "AirPods Pro 2da Generación",
  "AirPods Pro 3ra Generación",
];
const AUDIO_CONNECTIONS = ["USB-C", "Lightning", "MagSafe"];

/**
 * NewProductModal — Vista / Hoja de Creación de Producto
 * 
 * Estándares Apple HIG aplicados:
 * 1. Cabecera fija con handle superior táctil y soporte swipe-to-dismiss (vía ModalSheet).
 * 2. Botón de acción principal ("Guardar producto") fijado en el footer persistente inferior
 *    con conexión nativa form="new-product-form" y padding adaptado a safe area.
 * 3. Scroll vertical independiente con overscroll-contain e inercia táctil nativa.
 * 4. Nomenclatura concisa y limpia ("Cubo") sin contenedores de autocompletado vacíos.
 */
export default function NewProductModal({
  onClose,
  onStartClose,
  onOpenSuppliers,
}: NewProductModalProps) {
  const { suppliers, addProduct } = useInventory();

  const [category, setCategory] = useState<ProductCategory>("Cargadores y Cables");

  // Chips states
  const [chargerSubtype, setChargerSubtype] = useState(CHARGER_SUBTYPES[0]);
  const [chargerBrand, setChargerBrand] = useState(CHARGER_BRANDS[0]);
  const [chargerPower, setChargerPower] = useState(CHARGER_POWERS[0]);

  const [caseMaterial, setCaseMaterial] = useState(CASE_MATERIALS[0]);
  const [caseModel, setCaseModel] = useState(CASE_MODELS[3]); // iPhone 13 / 14

  const [audioModel, setAudioModel] = useState(AUDIO_MODELS[1]);
  const [audioConnection, setAudioConnection] = useState(AUDIO_CONNECTIONS[0]);

  // Form fields
  const [name, setName] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [costInput, setCostInput] = useState("");
  const [stockInput, setStockInput] = useState("10");
  const [warrantyDays, setWarrantyDays] = useState("15");
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || "");
  const [error, setError] = useState<string | null>(null);

  // Auto-generate name when category or chips change
  useEffect(() => {
    let generated = "";
    if (category === "Cargadores y Cables") {
      generated = `${chargerSubtype} ${chargerBrand} ${chargerPower}`;
    } else if (category === "Forros / Fundas") {
      generated = `Forro ${caseMaterial} (${caseModel})`;
    } else if (category === "Audio / AirPods") {
      generated = `${audioModel} (${audioConnection})`;
    }
    setName(generated);
  }, [
    category,
    chargerSubtype,
    chargerBrand,
    chargerPower,
    caseMaterial,
    caseModel,
    audioModel,
    audioConnection,
  ]);

  // Ensure default supplier is selected
  useEffect(() => {
    if (!selectedSupplierId && suppliers.length > 0) {
      setSelectedSupplierId(suppliers[0].id);
    }
  }, [suppliers, selectedSupplierId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("El nombre del producto es obligatorio.");
      return;
    }
    const price = parseCOPInput(priceInput);
    if (price <= 0) {
      setError("Debes indicar un precio de venta válido.");
      return;
    }
    if (!selectedSupplierId) {
      setError("Debes asignar un proveedor obligatorio.");
      return;
    }

    const cost = parseCOPInput(costInput);
    const initialStock = Math.max(0, parseInt(stockInput, 10) || 0);
    const warranty = Math.max(0, parseInt(warrantyDays, 10) || 15);

    let subtitle = "";
    if (category === "Cargadores y Cables") {
      subtitle = `${chargerSubtype} · ${chargerBrand}`;
    } else if (category === "Forros / Fundas") {
      subtitle = `Forro · ${caseModel}`;
    } else {
      subtitle = `Audio · ${audioConnection}`;
    }

    addProduct({
      name: name.trim(),
      category,
      subtitle,
      price,
      warrantyDays: warranty,
      batches: [
        {
          id: "batch-" + Date.now(),
          supplierId: selectedSupplierId,
          cost,
          stock: initialStock,
        },
      ],
    });

    onClose();
  };

  return (
    <ModalSheet
      onClose={onClose}
      onStartClose={onStartClose}
      title="Nuevo producto"
      footer={
        <button
          type="submit"
          form="new-product-form"
          className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#007aff] text-base font-bold text-white shadow-lg transition-transform active:scale-[0.98] hover:opacity-95"
        >
          Guardar producto
        </button>
      }
    >
      <form id="new-product-form" onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <p className="rounded-xl bg-[#ff3b30]/15 p-3 text-xs font-semibold text-[#ff3b30]">
            {error}
          </p>
        )}

        {/* Categoría Selector con espaciado mejorado respecto a la cabecera */}
        <div className="mt-1">
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Categoría
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((cat) => {
              const isActive = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-colors duration-75 ${
                    isActive
                      ? "bg-[#007aff] text-white shadow-sm"
                      : "border border-[var(--border-color)] bg-[var(--bg-primary)]/70 text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/10"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Opciones y Especificaciones según Categoría */}
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)]/40 p-3.5 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Especificaciones
          </p>

          {category === "Cargadores y Cables" && (
            <>
              <div>
                <p className="mb-1.5 text-[11px] font-medium text-[var(--text-secondary)]">Subtipo:</p>
                <div className="flex flex-wrap gap-1.5">
                  {CHARGER_SUBTYPES.map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setChargerSubtype(sub)}
                      className={`rounded-xl px-2.5 py-1 text-xs font-medium transition-colors duration-75 ${
                        chargerSubtype === sub
                          ? "bg-[#007aff] text-white font-semibold shadow-sm"
                          : "border border-[var(--border-color)] bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-[11px] font-medium text-[var(--text-secondary)]">Marca:</p>
                <div className="flex flex-wrap gap-1.5">
                  {CHARGER_BRANDS.map((brand) => (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => setChargerBrand(brand)}
                      className={`rounded-xl px-2.5 py-1 text-xs font-medium transition-colors duration-75 ${
                        chargerBrand === brand
                          ? "bg-[#007aff] text-white font-semibold shadow-sm"
                          : "border border-[var(--border-color)] bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-[11px] font-medium text-[var(--text-secondary)]">Potencia:</p>
                <div className="flex flex-wrap gap-1.5">
                  {CHARGER_POWERS.map((pow) => (
                    <button
                      key={pow}
                      type="button"
                      onClick={() => setChargerPower(pow)}
                      className={`rounded-xl px-2.5 py-1 text-xs font-medium transition-colors duration-75 ${
                        chargerPower === pow
                          ? "bg-[#007aff] text-white font-semibold shadow-sm"
                          : "border border-[var(--border-color)] bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                      }`}
                    >
                      {pow}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {category === "Forros / Fundas" && (
            <>
              <div>
                <p className="mb-1.5 text-[11px] font-medium text-[var(--text-secondary)]">Material:</p>
                <div className="flex flex-wrap gap-1.5">
                  {CASE_MATERIALS.map((mat) => (
                    <button
                      key={mat}
                      type="button"
                      onClick={() => setCaseMaterial(mat)}
                      className={`rounded-xl px-2.5 py-1 text-xs font-medium transition-colors duration-75 ${
                        caseMaterial === mat
                          ? "bg-[#007aff] text-white font-semibold shadow-sm"
                          : "border border-[var(--border-color)] bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                      }`}
                    >
                      {mat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-[11px] font-medium text-[var(--text-secondary)]">Modelos:</p>
                <div className="flex flex-wrap gap-1.5">
                  {CASE_MODELS.map((mod) => (
                    <button
                      key={mod}
                      type="button"
                      onClick={() => setCaseModel(mod)}
                      className={`rounded-xl px-2.5 py-1 text-xs font-medium transition-colors duration-75 ${
                        caseModel === mod
                          ? "bg-[#007aff] text-white font-semibold shadow-sm"
                          : "border border-[var(--border-color)] bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                      }`}
                    >
                      {mod}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {category === "Audio / AirPods" && (
            <>
              <div>
                <p className="mb-1.5 text-[11px] font-medium text-[var(--text-secondary)]">Modelo:</p>
                <div className="flex flex-wrap gap-1.5">
                  {AUDIO_MODELS.map((mod) => (
                    <button
                      key={mod}
                      type="button"
                      onClick={() => setAudioModel(mod)}
                      className={`rounded-xl px-2.5 py-1 text-xs font-medium transition-colors duration-75 ${
                        audioModel === mod
                          ? "bg-[#007aff] text-white font-semibold shadow-sm"
                          : "border border-[var(--border-color)] bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                      }`}
                    >
                      {mod}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-[11px] font-medium text-[var(--text-secondary)]">Conexión:</p>
                <div className="flex flex-wrap gap-1.5">
                  {AUDIO_CONNECTIONS.map((con) => (
                    <button
                      key={con}
                      type="button"
                      onClick={() => setAudioConnection(con)}
                      className={`rounded-xl px-2.5 py-1 text-xs font-medium transition-colors duration-75 ${
                        audioConnection === con
                          ? "bg-[#007aff] text-white font-semibold shadow-sm"
                          : "border border-[var(--border-color)] bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                      }`}
                    >
                      {con}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Nombre autocompletado / editable */}
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
            Nombre comercial del producto *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Cubo iPhone 20W"
            className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)] px-3.5 py-2.5 text-sm font-semibold text-[var(--text-primary)] outline-none focus:border-[#007aff]"
          />
        </div>

        {/* Precios (Venta y Costo) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
              Precio de venta *
            </label>
            <input
              type="text"
              value={priceInput}
              onChange={(e) => {
                const num = parseCOPInput(e.target.value);
                setPriceInput(num > 0 ? formatCOP(num) : "");
              }}
              placeholder="$0"
              className="tabular-nums w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm font-bold text-[var(--text-primary)] outline-none focus:border-[#007aff]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
              Costo de compra
            </label>
            <input
              type="text"
              value={costInput}
              onChange={(e) => {
                const num = parseCOPInput(e.target.value);
                setCostInput(num > 0 ? formatCOP(num) : "");
              }}
              placeholder="$0"
              className="tabular-nums w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] outline-none focus:border-[#007aff]"
            />
          </div>
        </div>

        {/* Cantidad y Garantía */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
              Cantidad inicial
            </label>
            <input
              type="number"
              min="0"
              value={stockInput}
              onChange={(e) => setStockInput(e.target.value)}
              placeholder="0"
              className="tabular-nums w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm font-semibold text-[var(--text-primary)] outline-none focus:border-[#007aff]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
              Garantía (días)
            </label>
            <input
              type="number"
              min="0"
              value={warrantyDays}
              onChange={(e) => setWarrantyDays(e.target.value)}
              placeholder="15"
              className="tabular-nums w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm font-semibold text-[var(--text-primary)] outline-none focus:border-[#007aff]"
            />
          </div>
        </div>

        {/* Proveedor selector */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              Proveedor (Obligatorio) *
            </label>
            <button
              type="button"
              onClick={onOpenSuppliers}
              className="text-xs font-semibold text-[#007aff] hover:underline dark:text-[#0a84ff]"
            >
              + Gestionar proveedores
            </button>
          </div>

          {suppliers.length === 0 ? (
            <div className="rounded-xl border border-[#ff9500]/30 bg-[#ff9500]/10 p-3 text-xs text-[#ff9500]">
              Debes registrar al menos un proveedor antes de crear productos.
            </div>
          ) : (
            <div className="relative">
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full appearance-none rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm font-semibold text-[var(--text-primary)] outline-none focus:border-[#007aff]"
              >
                {suppliers.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-3 flex items-center gap-1.5">
                {suppliers.find((s) => s.id === selectedSupplierId) && (
                  <span
                    className="h-3.5 w-3.5 rounded-full shadow-sm"
                    style={{
                      backgroundColor: suppliers.find((s) => s.id === selectedSupplierId)?.color,
                    }}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </form>
    </ModalSheet>
  );
}
