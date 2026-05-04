export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type AdminRole = "admin" | "employee";

export interface ProductWeightOption {
  label: string;
  price: number;
  comparePrice?: number;
}

export interface ProductRecord {
  id: string;
  name: string;
  description: string;
  images: string[];
  stock: number;
  featured: boolean;
  active: boolean;
  weightOptions: ProductWeightOption[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductInput {
  name: string;
  description: string;
  images: string[];
  stock: number;
  featured: boolean;
  active: boolean;
  weightOptions: ProductWeightOption[];
}

export interface OrderItem {
  productId: string;
  productName: string;
  image: string;
  weight: string;
  price: number;
  quantity: number;
}

export interface ShippingAddress {
  wilaya: string;
  address: string;
  deliveryMethod: "domicile" | "bureau";
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OrderInput {
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
}

export interface AdminUserRecord {
  userId: string;
  email: string;
  role: AdminRole;
  createdAt: string;
}

export interface MetaPixelSettings {
  enabled: boolean;
  pixelId: string;
}
