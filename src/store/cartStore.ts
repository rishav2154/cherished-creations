import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  customization?: {
    text?: string;
    imageUrl?: string;
    color?: string;
    variant?: string;
    designUrl?: string;
    brand?: string;
    model?: string;
    coverType?: string;
    specialInstructions?: string;
  };
}

export interface AppliedCoupon {
  code: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number;
  maxDiscount?: number;
  description?: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  appliedCoupon: AppliedCoupon | null;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;
  getDiscount: () => number;
  getFinalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      appliedCoupon: null,

      addItem: (item) => {
        const id = `${item.productId}-${Date.now()}`;
        set((state) => ({
          items: [...state.items, { ...item, id }],
        }));
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ items: [], appliedCoupon: null }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      applyCoupon: (coupon) => set({ appliedCoupon: coupon }),
      removeCoupon: () => set({ appliedCoupon: null }),

      getDiscount: () => {
        const { appliedCoupon, getTotalPrice } = get();
        if (!appliedCoupon) return 0;

        const subtotal = getTotalPrice();

        if (appliedCoupon.discountType === 'percentage') {
          const discount = (subtotal * appliedCoupon.discountValue) / 100;
          return appliedCoupon.maxDiscount
            ? Math.min(discount, appliedCoupon.maxDiscount)
            : discount;
        }

        if (appliedCoupon.discountType === 'fixed') {
          return Math.min(appliedCoupon.discountValue, subtotal);
        }

        return 0; // free_shipping doesn't affect product price
      },

      getFinalPrice: () => {
        const { getTotalPrice, getDiscount } = get();
        return getTotalPrice() - getDiscount();
      },
    }),
    {
      name: 'giftoria-cart',
    }
  )
);
