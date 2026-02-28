import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  rating: number;
  reviewCount: number;
  isCustomizable: boolean;
  tags: string[];
  stock: number;
  colors?: string[];
  customizationOptions?: {
    allowText?: boolean;
    allowImage?: boolean;
    canAddText?: boolean;
    canAddImage?: boolean;
    maxTextLength?: number;
  };
}

const mapApiProduct = (p: any): Product => {
  const co = p.customization_options || p.customizationOptions || {};
  return {
    id: p.id,
    name: p.name,
    description: p.description || '',
    price: Number(p.price),
    originalPrice: p.original_price ? Number(p.original_price) : undefined,
    category: p.category,
    images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [p.image_url || '/placeholder.svg'],
    rating: 4.5,
    reviewCount: 0,
    isCustomizable: co.allowText || co.allowImage || co.canAddText || co.canAddImage || false,
    tags: Array.isArray(p.tags) ? p.tags : [],
    stock: p.stock || 0,
    customizationOptions: co,
  };
};

export const useProducts = (category?: string) => {
  return useQuery({
    queryKey: ['products', category],
    queryFn: async () => {
      const data = await apiGet<any[]>('/api/products');
      let products = (data || []).map(mapApiProduct);
      if (category) {
        products = products.filter(p => p.category === category);
      }
      return products;
    },
  });
};

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const data = await apiGet<any[]>('/api/products');
      const products = (data || []).map(mapApiProduct);
      const bestsellers = products.filter(p => p.tags.includes('bestseller')).slice(0, 4);
      return bestsellers.length > 0 ? bestsellers : products.slice(0, 4);
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const data = await apiGet<any>(`/api/products/${id}`);
      if (!data) return null;
      return mapApiProduct(data);
    },
    enabled: !!id,
  });
};

// Categories for filtering
export const categories = [
  { id: 'mugs', name: 'Mugs', icon: '☕', description: 'Custom printed mugs' },
  { id: 'frames', name: 'Photo Frames', icon: '🖼️', description: 'Personalized frames' },
  { id: 'keychains', name: 'Keychains', icon: '🔑', description: 'Custom keychains' },
  { id: 'phone-covers', name: 'Phone Covers', icon: '📱', description: 'Customized phone cases' },
  { id: 'lamps', name: 'Lamps', icon: '💡', description: 'LED night lamps' },
  { id: 'tshirts', name: 'T-Shirts', icon: '👕', description: 'Custom printed tees' },
  { id: 'posters', name: 'Posters', icon: '🎨', description: 'Wall art & posters' },
  { id: 'combos', name: 'Gift Combos', icon: '🎁', description: 'Gift bundles' },
];
