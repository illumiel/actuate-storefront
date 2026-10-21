import { API } from "./config";
import type {
  Product, Price, ProductWithPrice, InventoryItem, OrderResponse, PaymentMethod,
} from "@/types";

async function safeFetch<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, { ...options, cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getAllProducts(): Promise<Product[]> {
  const products = await safeFetch<Product[]>(`${API.product}/api/products`);
  return products ?? [];
}

export async function getProduct(id: number): Promise<Product | null> {
  return safeFetch<Product>(`${API.product}/api/products/${id}`);
}

export async function getPrice(productId: number): Promise<Price | null> {
  return safeFetch<Price>(`${API.pricing}/api/pricing/${productId}`);
}

export async function getInventory(productId: number): Promise<InventoryItem | null> {
  return safeFetch<InventoryItem>(`${API.inventory}/api/inventory/${productId}`);
}

/**
 * Fetches every inventory record in one request for the collection filters.
 * Returns null (not an empty array) when the Inventory Service is unreachable,
 * so callers can hide availability filtering instead of showing everything as
 * out of stock.
 */
export async function getAllInventory(): Promise<InventoryItem[] | null> {
  try {
    const res = await fetch(`${API.inventory}/api/inventory`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? (data as InventoryItem[]) : null;
  } catch {
    return null;
  }
}

/**
 * Fetches the product catalog and merges in each product's current price.
 * Product Service and Pricing Service are separate databases, so this
 * merge has to happen on the client (or a BFF layer, if we add one later).
 */
export async function getProductsWithPrices(): Promise<ProductWithPrice[]> {
  const products = await getAllProducts();
  const withPrices = await Promise.all(
    products.map(async (p) => ({ ...p, price: await getPrice(p.id) }))
  );
  return withPrices;
}

export async function getProductWithPrice(id: number): Promise<ProductWithPrice | null> {
  const product = await getProduct(id);
  if (!product) return null;
  const price = await getPrice(id);
  return { ...product, price };
}

export interface PlaceOrderPayload {
  customerName: string;
  /** Omitted entirely when the customer doesn't provide an email. */
  customerEmail?: string;
  /** Digits only: 09XXXXXXXXX or +639XXXXXXXXX. */
  customerPhone: string;
  addressLine: string;
  barangay: string;
  city: string;
  province: string;
  /** Omitted entirely when blank; exactly 4 digits when present. */
  postalCode?: string;
  /** Omitted entirely when blank. */
  deliveryNotes?: string;
  paymentMethod: PaymentMethod;
  items: { productId: number; quantity: number }[];
}

export interface PlaceOrderResult {
  ok: boolean;
  order?: OrderResponse;
  error?: string;
  /** Field-level messages from a 400 response, keyed by API field name. */
  fieldErrors?: Record<string, string>;
}

export async function placeOrder(payload: PlaceOrderPayload): Promise<PlaceOrderResult> {
  try {
    const res = await fetch(`${API.order}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = (await res.json().catch(() => null)) as
      | { message?: string; validationErrors?: Record<string, string> }
      | null;

    if (!res.ok) {
      return {
        ok: false,
        error: data?.message ?? "Failed to place order",
        fieldErrors: data?.validationErrors,
      };
    }

    return { ok: true, order: data as unknown as OrderResponse };
  } catch {
    return { ok: false, error: "Could not reach Order Service. Is it running?" };
  }
}
