export type ProductCategory = "Cargadores y Cables" | "Forros / Fundas" | "Audio / AirPods";

export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  color: string;
}

export interface Batch {
  id: string;
  supplierId: string;
  cost: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  subtitle?: string;
  price: number;
  warrantyDays: number;
  batches: Batch[];
  createdAt: string;
}

