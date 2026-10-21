"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { ProductModal } from "@/components/product-modal";
import { useToast } from "@/components/ui/toast";
import { getProductWithPrice } from "@/lib/api";
import type { ProductWithPrice } from "@/types";

interface ProductModalContextValue {
  openProduct: (product: ProductWithPrice | number) => void;
  closeProduct: () => void;
}

const ProductModalContext = React.createContext<ProductModalContextValue | null>(null);

const EXIT_DURATION = 200;

export function ProductModalProvider({ children }: { children: React.ReactNode }) {
  const [product, setProduct] = React.useState<ProductWithPrice | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const { showToast } = useToast();

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  const openProduct = React.useCallback((productOrId: ProductWithPrice | number) => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }

    // Remember where focus came from so we can restore it on close.
    const active = document.activeElement;
    previousFocusRef.current =
      active instanceof HTMLElement && active !== document.body ? active : null;

    setIsOpen(true);

    if (typeof productOrId === "number") {
      setProduct(null);
      setIsLoading(true);
      getProductWithPrice(productOrId)
        .then((fetched) => {
          setProduct(fetched);
          setIsLoading(false);
        })
        .catch(() => {
          setProduct(null);
          setIsLoading(false);
        });
    } else {
      setProduct(productOrId);
      setIsLoading(false);
    }
  }, []);

  const closeProduct = React.useCallback(() => {
    setIsOpen(false);
    // Keep the product around until the exit animation has finished.
    closeTimer.current = setTimeout(() => {
      setProduct(null);
      setIsLoading(false);
    }, EXIT_DURATION);
  }, []);

  // Restore focus to the element that opened the modal once it has closed.
  React.useEffect(() => {
    if (isOpen) return;
    const trigger = previousFocusRef.current;
    previousFocusRef.current = null;
    if (!trigger) return;
    const timer = setTimeout(() => {
      if (trigger.isConnected) trigger.focus();
    }, 0);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleAdded = React.useCallback(() => {
    closeProduct();
    setTimeout(() => {
      showToast({ message: "Added to cart", actionLabel: "View cart", actionHref: "/cart" });
    }, EXIT_DURATION);
  }, [closeProduct, showToast]);

  const value = React.useMemo(
    () => ({ openProduct, closeProduct }),
    [openProduct, closeProduct]
  );

  return (
    <ProductModalContext.Provider value={value}>
      {children}
      {mounted &&
        createPortal(
          <ProductModal
            product={product}
            isOpen={isOpen}
            isLoading={isLoading}
            onClose={closeProduct}
            onAdded={handleAdded}
          />,
          document.body
        )}
    </ProductModalContext.Provider>
  );
}

export function useProductModal() {
  const ctx = React.useContext(ProductModalContext);
  if (!ctx) throw new Error("useProductModal must be used within a ProductModalProvider");
  return ctx;
}
