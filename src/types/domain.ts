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

export interface CartItem {
  productId: string;
  batchId: string;
  quantity: number;
  unitPrice: number;
}

export type PaymentMethod = "Efectivo" | "Nequi" | "Bancolombia" | "Tarjeta";

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  qty: number;
  unitPrice: number;
  batchId?: string;
  warrantyDays: number;
  warrantyClaimed?: boolean;
  warrantyClaimNote?: string;
}

export interface Sale {
  id: string;
  saleNumber: number;
  customerName: string;
  note?: string;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  createdAt: string;
  items: SaleItem[];
}
