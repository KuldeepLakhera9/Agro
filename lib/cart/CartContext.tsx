"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface CartItem {
  productId: string;
  sku: string;
  slug: string;
  name: string;
  image: string;
  size: string;
  price: number;
  qty: number;
  maxStock: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (sku: string) => void;
  updateQty: (sku: string, qty: number) => void;
  clear: () => void;
  subtotal: number;
  totalCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "aisaheb-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // One-time hydration from localStorage after mount, so server and
    // first-client-render markup match (localStorage doesn't exist on the
    // server) and the cart contents fill in right after.
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem: CartContextValue["addItem"] = (item, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.sku === item.sku);
      if (existing) {
        const nextQty = Math.min(existing.qty + qty, existing.maxStock);
        return prev.map((i) =>
          i.sku === item.sku ? { ...i, qty: nextQty } : i,
        );
      }
      return [...prev, { ...item, qty: Math.min(qty, item.maxStock) }];
    });
  };

  const removeItem = (sku: string) => {
    setItems((prev) => prev.filter((i) => i.sku !== sku));
  };

  const updateQty = (sku: string, qty: number) => {
    setItems((prev) => {
      if (qty <= 0) return prev.filter((i) => i.sku !== sku);
      return prev.map((i) =>
        i.sku === sku ? { ...i, qty: Math.min(qty, i.maxStock) } : i,
      );
    });
  };

  const clear = () => setItems([]);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.qty, 0),
    [items],
  );
  const totalCount = useMemo(
    () => items.reduce((sum, i) => sum + i.qty, 0),
    [items],
  );

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQty, clear, subtotal, totalCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
