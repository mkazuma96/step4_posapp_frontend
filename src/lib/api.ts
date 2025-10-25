export type ProductOut = {
  janCode: string;
  name: string;
  priceExclTax: number;
  taxRate: number;
  priceInclTax: number;
};

export type SessionOut = {
  id: string;
  clerkCode: string;
  storeCode: string;
  isActive: boolean;
  startedAt: string;
  endedAt?: string | null;
};

export type CartItemOut = {
  id: string;
  janCode: string;
  name: string;
  priceExclTax: number;
  taxRate: number;
  priceInclTax: number;
  quantity: number;
  subTotalExclTax: number;
  subTotalInclTax: number;
};

export type CartOut = {
  id: string;
  items: CartItemOut[];
  totalExclTax: number;
  totalInclTax: number;
};

export type PurchaseOut = {
  id: string;
  totalExclTax: number;
  totalInclTax: number;
  createdAt: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

export const api = {
  startSession: (clerkCode: string, storeCode = "30") =>
    request<SessionOut>("/api/session:start", {
      method: "POST",
      body: JSON.stringify({ clerkCode, storeCode }),
    }),
  getSession: () => request<SessionOut>("/api/session"),
  endSession: () =>
    request<SessionOut>("/api/session:end", { method: "POST" }),
  getProductByJan: (jan: string) => request<ProductOut>(`/api/products/${jan}`),
  listProducts: (q?: string) =>
    request<ProductOut[]>(`/api/products${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  getCart: () => request<CartOut>("/api/cart"),
  addCartItem: (janCode: string, quantity = 1) =>
    request<CartOut>("/api/cart/items", {
      method: "POST",
      body: JSON.stringify({ janCode, quantity }),
    }),
  removeCartItem: (itemId: string) =>
    request<CartOut>(`/api/cart/items/${itemId}`, { method: "DELETE" }),
  clearCart: () => request<CartOut>("/api/cart:clear", { method: "POST" }),
  createPurchase: () => request<PurchaseOut>("/api/purchase", { method: "POST" }),
};


