// One-time seed script: creates products, prices, and stock across
// Product Service (8081), Pricing Service (8083), and Inventory Service (8082).
//
// Run with: node seed.mjs
// Requires Node 18+ (built-in fetch). All 3 services must be running first.

const PRODUCT_API = "http://localhost:8081";
const PRICING_API = "http://localhost:8083";
const INVENTORY_API = "http://localhost:8082";

// Each imageUrl points to a local file under /public/images/products/ in the
// frontend project. These files don't exist yet - that's expected. Until you
// add them, the product card/detail will just show "No image" - the rest of
// the app works fine regardless.
const products = [
  // MOUSE
  { name: "G502 X Plus", brand: "Logitech", category: "MOUSE", description: "Wireless gaming mouse with LIGHTFORCE hybrid switches.", imageUrl: "/images/products/logitech-g502-x-plus.png", basePrice: 8999, discountPercent: 15, stock: 40 },
  { name: "Viper V3 Pro", brand: "Razer", category: "MOUSE", description: "Ultra-lightweight esports wireless mouse.", imageUrl: "/images/products/razer-viper-v3-pro.png", basePrice: 10499, discountPercent: 0, stock: 25 },
  { name: "Dark Core RGB Pro", brand: "Corsair", category: "MOUSE", description: "Wireless gaming mouse with Qi charging support.", imageUrl: "/images/products/corsair-dark-core-rgb-pro.png", basePrice: 6499, discountPercent: 10, stock: 35 },
  { name: "Rival 5", brand: "SteelSeries", category: "MOUSE", description: "9-button gaming mouse with TrueMove Air sensor.", imageUrl: "/images/products/steelseries-rival-5.png", basePrice: 4299, discountPercent: 0, stock: 50 },
  { name: "Chakram X", brand: "ASUS ROG", category: "MOUSE", description: "Wireless gaming mouse with swappable joystick.", imageUrl: "/images/products/asus-rog-chakram-x.png", basePrice: 7999, discountPercent: 5, stock: 20 },

  // KEYBOARD
  { name: "G915 TKL", brand: "Logitech", category: "KEYBOARD", description: "Low-profile wireless mechanical keyboard.", imageUrl: "/images/products/logitech-g915-tkl.png", basePrice: 12999, discountPercent: 12, stock: 18 },
  { name: "BlackWidow V4", brand: "Razer", category: "KEYBOARD", description: "Full-size mechanical gaming keyboard with command dial.", imageUrl: "/images/products/razer-blackwidow-v4.png", basePrice: 9999, discountPercent: 0, stock: 22 },
  { name: "K70 RGB Pro", brand: "Corsair", category: "KEYBOARD", description: "Mechanical gaming keyboard with PBT keycaps.", imageUrl: "/images/products/corsair-k70-rgb-pro.png", basePrice: 8499, discountPercent: 8, stock: 30 },
  { name: "Apex Pro TKL", brand: "SteelSeries", category: "KEYBOARD", description: "Adjustable actuation mechanical keyboard.", imageUrl: "/images/products/steelseries-apex-pro-tkl.png", basePrice: 11499, discountPercent: 0, stock: 15 },
  { name: "Alloy Origins", brand: "HyperX", category: "KEYBOARD", description: "Compact mechanical gaming keyboard.", imageUrl: "/images/products/hyperx-alloy-origins.png", basePrice: 5999, discountPercent: 10, stock: 40 },

  // HEADSET
  { name: "G535 Wireless", brand: "Logitech", category: "HEADSET", description: "Lightweight wireless gaming headset.", imageUrl: "/images/products/logitech-g535.png", basePrice: 5499, discountPercent: 0, stock: 45 },
  { name: "Kraken V3", brand: "Razer", category: "HEADSET", description: "Gaming headset with HyperClear cardioid mic.", imageUrl: "/images/products/razer-kraken-v3.png", basePrice: 4999, discountPercent: 15, stock: 38 },
  { name: "Virtuoso RGB Wireless", brand: "Corsair", category: "HEADSET", description: "High-fidelity wireless gaming headset.", imageUrl: "/images/products/corsair-virtuoso-rgb.png", basePrice: 10999, discountPercent: 0, stock: 12 },
  { name: "Arctis Nova Pro", brand: "SteelSeries", category: "HEADSET", description: "Wireless headset with active noise cancellation.", imageUrl: "/images/products/steelseries-arctis-nova-pro.png", basePrice: 15999, discountPercent: 5, stock: 10 },
  { name: "Cloud III", brand: "HyperX", category: "HEADSET", description: "Comfort-focused gaming headset with DTS spatial audio.", imageUrl: "/images/products/hyperx-cloud-iii.png", basePrice: 4499, discountPercent: 0, stock: 50 },

  // MONITOR
  { name: "Swift PG27AQN", brand: "ASUS ROG", category: "MONITOR", description: "27-inch 360Hz esports gaming monitor.", imageUrl: "/images/products/asus-rog-swift-pg27aqn.png", basePrice: 42999, discountPercent: 0, stock: 8 },
  { name: "Zowie XL2546K", brand: "BenQ", category: "MONITOR", description: "24.5-inch 240Hz competitive gaming monitor.", imageUrl: "/images/products/benq-zowie-xl2546k.png", basePrice: 28999, discountPercent: 8, stock: 10 },

  // CONTROLLER
  { name: "DualSense Edge", brand: "Sony", category: "CONTROLLER", description: "Customizable pro controller for PlayStation 5.", imageUrl: "/images/products/sony-dualsense-edge.png", basePrice: 10999, discountPercent: 0, stock: 20 },
  { name: "Elite Series 2", brand: "Xbox", category: "CONTROLLER", description: "Premium controller with adjustable-tension thumbsticks.", imageUrl: "/images/products/xbox-elite-series-2.png", basePrice: 9499, discountPercent: 10, stock: 18 },

  // MOUSEPAD
  { name: "MM300 Pro", brand: "Corsair", category: "MOUSEPAD", description: "Extended cloth gaming mousepad.", imageUrl: "/images/products/corsair-mm300-pro.png", basePrice: 1299, discountPercent: 0, stock: 80 },

  // MICROPHONE
  { name: "Wave:3", brand: "Elgato", category: "MICROPHONE", description: "Premium USB condenser mic for streaming.", imageUrl: "/images/products/elgato-wave-3.png", basePrice: 6999, discountPercent: 0, stock: 25 },
  { name: "Yeti X", brand: "Blue", category: "MICROPHONE", description: "Professional USB mic with LED metering.", imageUrl: "/images/products/blue-yeti-x.png", basePrice: 8499, discountPercent: 5, stock: 20 },

  // WEBCAM
  { name: "Brio 500", brand: "Logitech", category: "WEBCAM", description: "Full HD webcam with auto light correction.", imageUrl: "/images/products/logitech-brio-500.png", basePrice: 5999, discountPercent: 0, stock: 30 },
  { name: "Kiyo Pro", brand: "Razer", category: "WEBCAM", description: "Full HD webcam with adaptive light sensor.", imageUrl: "/images/products/razer-kiyo-pro.png", basePrice: 7499, discountPercent: 0, stock: 22 },

  // CHAIR
  { name: "Titan Evo", brand: "Secretlab", category: "CHAIR", description: "Ergonomic gaming chair with 4-way lumbar support.", imageUrl: "/images/products/secretlab-titan-evo.png", basePrice: 21999, discountPercent: 10, stock: 10 },
  { name: "TC100 Relaxed", brand: "Corsair", category: "CHAIR", description: "Fabric gaming chair with breathable design.", imageUrl: "/images/products/corsair-tc100.png", basePrice: 13999, discountPercent: 0, stock: 14 },
];

async function post(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(data)}`);
  return data;
}

async function main() {
  console.log(`Seeding ${products.length} products...\n`);
  let ok = 0, failed = 0;

  for (const p of products) {
    try {
      const product = await post(`${PRODUCT_API}/api/products`, {
        name: p.name,
        description: p.description,
        brand: p.brand,
        category: p.category,
        imageUrl: p.imageUrl,
      });
      const id = product.id;

      await post(`${PRICING_API}/api/pricing`, {
        productId: id,
        basePrice: p.basePrice,
        discountPercent: p.discountPercent,
      });

      await post(`${INVENTORY_API}/api/inventory`, {
        productId: id,
        quantity: p.stock,
      });

      console.log(`OK  [${id}] ${p.brand} ${p.name}`);
      ok++;
    } catch (err) {
      console.error(`FAIL ${p.brand} ${p.name}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone. ${ok} succeeded, ${failed} failed.`);
}

main();
