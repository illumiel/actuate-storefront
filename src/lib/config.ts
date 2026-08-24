/** Base URLs for the four backend microservices. Override via .env.local if needed. */
export const API = {
  product: process.env.NEXT_PUBLIC_PRODUCT_API ?? "http://localhost:8081",
  pricing: process.env.NEXT_PUBLIC_PRICING_API ?? "http://localhost:8083",
  inventory: process.env.NEXT_PUBLIC_INVENTORY_API ?? "http://localhost:8082",
  order: process.env.NEXT_PUBLIC_ORDER_API ?? "http://localhost:8084",
};
