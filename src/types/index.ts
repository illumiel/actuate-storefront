export type ProductCategory =
  | "MOUSE" | "KEYBOARD" | "HEADSET" | "MONITOR" | "CONTROLLER"
  | "MOUSEPAD" | "MICROPHONE" | "WEBCAM" | "CHAIR" | "OTHER";

export interface Product {
  id: number;
  name: string;
  description: string;
  brand: string;
  category: ProductCategory;
  imageUrl: string;
  active: boolean;
}

export interface Price {
  productId: number;
  basePrice: number;
  discountPercent: number;
  finalPrice: number;
  currency: string;
}

/** A product merged with its current price - what the UI actually renders. */
export interface ProductWithPrice extends Product {
  price: Price | null;
}

export interface InventoryItem {
  productId: number;
  quantityOnHand: number;
  reservedQuantity: number;
  availableQuantity: number;
}

export interface CartLine {
  productId: number;
  name: string;
  imageUrl: string;
  unitPrice: number;
  /** Base (pre-discount) price at the time of adding, used to show savings. */
  originalPrice?: number;
  quantity: number;
}

export interface OrderItemResponse {
  productId: number;
  productName: string;
  quantity: number;
  priceAtOrder: number;
  subtotal: number;
}

export interface OrderResponse {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail?: string | null;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  totalAmount: number;
  items: OrderItemResponse[];
  createdAt: string;
}
