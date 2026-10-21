import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { CartProvider } from "@/context/cart-context";
import { ToastProvider } from "@/components/ui/toast";
import { ProductModalProvider } from "@/components/product-modal-provider";
import { Navbar } from "@/components/navbar";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Actuate — Gaming Gear",
  description: "Precision peripherals for players who notice the difference.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body>
        <CartProvider>
          <ToastProvider>
            <ProductModalProvider>
              <Navbar />
              <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
            </ProductModalProvider>
          </ToastProvider>
        </CartProvider>
      </body>
    </html>
  );
}
