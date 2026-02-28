import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
    maxTextLength?: number;
  };
}

const mapDbProductToProduct = (dbProduct: any): Product => {
  const customizationOptions = dbProduct.customization_options || {};
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description || '',
    price: dbProduct.price,
    originalPrice: dbProduct.original_price || undefined,
    category: dbProduct.category,
    images: dbProduct.images?.length > 0 ? dbProduct.images : [dbProduct.image_url || '/placeholder.svg'],
    rating: 4.5, // Default rating, can be calculated from reviews later
    reviewCount: 0, // Default, can be fetched from reviews table
    isCustomizable: customizationOptions.allowText || customizationOptions.allowImage || false,
    tags: dbProduct.tags || [],
    stock: dbProduct.stock || 0,
    customizationOptions,
  };
};

export const useProducts = (category?: string) => {
  return useQuery({
    queryKey: ['products', category],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(mapDbProductToProduct);
    },
  });
};

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .contains('tags', ['bestseller'])
        .limit(4);

      if (error) throw error;

      // If no bestsellers, get any 4 products
      if (!data || data.length === 0) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .limit(4);

        if (fallbackError) throw fallbackError;
        return (fallbackData || []).map(mapDbProductToProduct);
      }

      return data.map(mapDbProductToProduct);
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return mapDbProductToProduct(data);
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
