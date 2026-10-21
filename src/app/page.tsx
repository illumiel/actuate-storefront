import { getProductsWithPrices } from "@/lib/api";
import { Storefront } from "@/components/storefront";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await getProductsWithPrices();

  return <Storefront products={products} />;
}
