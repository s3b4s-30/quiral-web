/**
 * Repositorio de datos (Repository/Adapter). Contrato asíncrono:
 * AsyncStorage (iOS/Android/Web) hoy; Supabase mañana sin tocar la UI.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  INITIAL_SUPPLIERS,
  INITIAL_PRODUCTS,
  INITIAL_SALES,
  INITIAL_CLOSURES,
  getSupplierColor,
} from '../domain/formatters';

export const STORAGE_KEYS = {
  THEME: 'quiral_u_theme',
  SUPPLIERS: 'quiral_u_suppliers',
  LAST_SUPPLIER: 'quiral_u_last_supplier',
  PRODUCTS: 'quiral_u_products',
  CART: 'quiral_u_cart',
  SALES: 'quiral_u_sales',
  CLOSURES: 'quiral_u_closures',
  EMPTY: 'quiral_u_intentionally_empty',
};

const LEGACY_STORAGE_KEYS = {
  THEME: 'sebas_pos_u_theme',
  SUPPLIERS: 'sebas_pos_u_suppliers',
  LAST_SUPPLIER: 'sebas_pos_u_last_supplier',
  PRODUCTS: 'sebas_pos_u_products',
  CART: 'sebas_pos_u_cart',
  SALES: 'sebas_pos_u_sales',
  CLOSURES: 'sebas_pos_u_closures',
  EMPTY: 'sebas_pos_u_intentionally_empty',
};

const LEGACY = ['Carga Rápida', 'Cables', 'Carga y Cables', 'Cargadores'];

export const normalizeProductCategory = (p) =>
  p && LEGACY.includes(p.category) ? { ...p, category: 'Cargadores y Cables' } : p;

export const normalizeSupplier = (s, i = 0) => (s ? { ...s, color: getSupplierColor(s, i) } : s);

async function read(key, fallback, legacyKey) {
  try {
    let raw = await AsyncStorage.getItem(key);
    if (!raw && legacyKey) {
      raw = await AsyncStorage.getItem(legacyKey);
      if (raw) {
        AsyncStorage.setItem(key, raw).catch(() => {});
        AsyncStorage.removeItem(legacyKey).catch(() => {});
      }
    }
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

async function getItem(key, legacyKey) {
  try {
    let val = await AsyncStorage.getItem(key);
    if (val === null && legacyKey) {
      val = await AsyncStorage.getItem(legacyKey);
      if (val !== null) {
        AsyncStorage.setItem(key, val).catch(() => {});
        AsyncStorage.removeItem(legacyKey).catch(() => {});
      }
    }
    return val;
  } catch {
    return null;
  }
}

const write = (key, value) => AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});

export class AsyncStoragePOSRepository {
  /** Carga todo el estado inicial en una sola pasada (hidratación). */
  async loadAll() {
    const [theme, suppliers, lastSupplier, products, cart, sales, closures, empty] = await Promise.all([
      getItem(STORAGE_KEYS.THEME, LEGACY_STORAGE_KEYS.THEME),
      read(STORAGE_KEYS.SUPPLIERS, null, LEGACY_STORAGE_KEYS.SUPPLIERS),
      getItem(STORAGE_KEYS.LAST_SUPPLIER, LEGACY_STORAGE_KEYS.LAST_SUPPLIER),
      read(STORAGE_KEYS.PRODUCTS, null, LEGACY_STORAGE_KEYS.PRODUCTS),
      read(STORAGE_KEYS.CART, [], LEGACY_STORAGE_KEYS.CART),
      read(STORAGE_KEYS.SALES, null, LEGACY_STORAGE_KEYS.SALES),
      read(STORAGE_KEYS.CLOSURES, null, LEGACY_STORAGE_KEYS.CLOSURES),
      getItem(STORAGE_KEYS.EMPTY, LEGACY_STORAGE_KEYS.EMPTY),
    ]);
    const sup = Array.isArray(suppliers) && suppliers.length ? suppliers : INITIAL_SUPPLIERS;
    let prods = Array.isArray(products) ? products : INITIAL_PRODUCTS;
    if (prods.length === 0 && empty !== 'true') prods = INITIAL_PRODUCTS; // seed si no fue vaciado a propósito
    return {
      theme: theme || 'dark',
      suppliers: sup.map(normalizeSupplier),
      lastSupplierId: lastSupplier || sup[0]?.id || '',
      products: prods.map(normalizeProductCategory),
      cart: Array.isArray(cart) ? cart : [],
      sales: Array.isArray(sales) ? sales : INITIAL_SALES,
      closures: Array.isArray(closures) ? closures : INITIAL_CLOSURES,
    };
  }
  saveTheme = (v) => AsyncStorage.setItem(STORAGE_KEYS.THEME, v).catch(() => {});
  saveSuppliers = (v) => write(STORAGE_KEYS.SUPPLIERS, v);
  saveLastSupplierId = (v) => AsyncStorage.setItem(STORAGE_KEYS.LAST_SUPPLIER, v || '').catch(() => {});
  saveProducts = (v) => write(STORAGE_KEYS.PRODUCTS, v);
  saveCart = (v) => write(STORAGE_KEYS.CART, v);
  saveSales = (v) => write(STORAGE_KEYS.SALES, v);
  saveClosures = (v) => write(STORAGE_KEYS.CLOSURES, v);
  setIntentionallyEmpty = (b) =>
    (b
      ? AsyncStorage.setItem(STORAGE_KEYS.EMPTY, 'true')
      : AsyncStorage.removeItem(STORAGE_KEYS.EMPTY)
    ).catch(() => {});

  /** Limpia la caché del dispositivo (se usa al cerrar sesión para no mezclar tiendas). */
  clearLocal = () =>
    AsyncStorage.multiRemove([
      ...Object.values(STORAGE_KEYS).filter((k) => k !== STORAGE_KEYS.THEME),
      ...Object.values(LEGACY_STORAGE_KEYS).filter((k) => k !== LEGACY_STORAGE_KEYS.THEME),
    ]).catch(() => {});
}

export const defaultPOSRepository = new AsyncStoragePOSRepository();

