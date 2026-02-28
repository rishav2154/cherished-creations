const BASE_URL = "https://api.thedesignhive.tech";

interface ApiOptions extends RequestInit {
  token?: string;
}

export const apiFetch = async <T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "API Error");
  }

  return res.json();
};

/* ================= AUTH HELPERS ================= */

export const apiAuth = {
  login: (email: string, password: string) =>
    apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (data: any) =>
    apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMe: () => apiFetch("/auth/me"),

  logout: () => {
    localStorage.removeItem("token");
  },
};

/* ================= ADMIN HELPERS ================= */

export const apiAdmin = {
  getOrders: () => apiFetch("/admin/orders"),
  updateOrderStatus: (id: string, status: string) =>
    apiFetch(`/admin/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  getCoupons: () => apiFetch("/admin/coupons"),
  createCoupon: (data: any) =>
    apiFetch("/admin/coupons", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateCoupon: (id: string, data: any) =>
    apiFetch(`/admin/coupons/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteCoupon: (id: string) =>
    apiFetch(`/admin/coupons/${id}`, { method: "DELETE" }),

  getUsers: () => apiFetch("/admin/users"),
  toggleAdmin: (userId: string) =>
    apiFetch(`/admin/users/${userId}/toggle-admin`, {
      method: "PATCH",
    }),
};

/* ================= SHOP HELPERS ================= */

export const apiShop = {
  getProducts: () => apiFetch("/products"),
  getProduct: (id: string) => apiFetch(`/products/${id}`),

  applyCoupon: (code: string, subtotal: number) =>
    apiFetch("/coupons/apply", {
      method: "POST",
      body: JSON.stringify({ code, subtotal }),
    }),

  createOrder: (data: any) =>
    apiFetch("/orders", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Keep legacy exports for backward compatibility
export const getToken = (): string | null => localStorage.getItem("token");
export const setToken = (token: string) => localStorage.setItem("token", token);
export const removeToken = () => localStorage.removeItem("token");
export const api = apiFetch;
export const apiGet = <T = unknown>(endpoint: string, auth = false) =>
  apiFetch<T>(endpoint);
export const apiPost = <T = unknown>(endpoint: string, body: unknown, auth = false) =>
  apiFetch<T>(endpoint, { method: 'POST', body: JSON.stringify(body) });
export const apiPut = <T = unknown>(endpoint: string, body: unknown, auth = false) =>
  apiFetch<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) });
export const apiPatch = <T = unknown>(endpoint: string, body: unknown, auth = false) =>
  apiFetch<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) });
export const apiDelete = <T = unknown>(endpoint: string, auth = false) =>
  apiFetch<T>(endpoint, { method: 'DELETE' });
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}
