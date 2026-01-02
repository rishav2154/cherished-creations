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
  colors?: string[];
  tags: string[];
  inStock: boolean;
}

export const categories = [
  { id: 'tshirts', name: 'Custom T-Shirts', icon: '👕', description: 'Express yourself with personalized tees' },
  { id: 'mugs', name: 'Mugs & Cups', icon: '☕', description: 'Start every day with a custom cup' },
  { id: 'frames', name: 'Photo Frames', icon: '🖼️', description: 'Preserve memories beautifully' },
  { id: 'phone-covers', name: 'Phone Covers', icon: '📱', description: 'Protect your device in style' },
  { id: 'posters', name: 'Posters', icon: '🎨', description: 'Art that speaks to you' },
  { id: 'combos', name: 'Gift Combos', icon: '🎁', description: 'Perfect curated gift sets' },
];

export const products: Product[] = [
  // T-Shirts
  {
    id: 'tshirt-1',
    name: 'Premium Cotton Custom Tee',
    description: 'Ultra-soft 100% organic cotton t-shirt with your custom design. Perfect for everyday wear or special occasions.',
    price: 29.99,
    originalPrice: 39.99,
    category: 'tshirts',
    images: ['/placeholder.svg'],
    rating: 4.8,
    reviewCount: 256,
    isCustomizable: true,
    colors: ['#ffffff', '#000000', '#1e3a5f', '#8b0000', '#2d5016'],
    tags: ['bestseller', 'eco-friendly'],
    inStock: true,
  },
  {
    id: 'tshirt-2',
    name: 'Vintage Photo Print Tee',
    description: 'Classic fit t-shirt perfect for printing your favorite photos with a vintage filter effect.',
    price: 34.99,
    category: 'tshirts',
    images: ['/placeholder.svg'],
    rating: 4.6,
    reviewCount: 128,
    isCustomizable: true,
    colors: ['#ffffff', '#f5f5dc', '#d3d3d3'],
    tags: ['vintage', 'photo-print'],
    inStock: true,
  },
  // Mugs
  {
    id: 'mug-1',
    name: 'Magic Color-Changing Mug',
    description: 'Watch your design appear as you pour hot liquid! A magical gift experience.',
    price: 24.99,
    originalPrice: 32.99,
    category: 'mugs',
    images: ['/placeholder.svg'],
    rating: 4.9,
    reviewCount: 412,
    isCustomizable: true,
    colors: ['#000000'],
    tags: ['bestseller', 'magic'],
    inStock: true,
  },
  {
    id: 'mug-2',
    name: 'Premium Ceramic Photo Mug',
    description: 'High-quality ceramic mug with vibrant, dishwasher-safe custom prints.',
    price: 19.99,
    category: 'mugs',
    images: ['/placeholder.svg'],
    rating: 4.7,
    reviewCount: 289,
    isCustomizable: true,
    colors: ['#ffffff', '#000000'],
    tags: ['classic', 'photo-print'],
    inStock: true,
  },
  // Photo Frames
  {
    id: 'frame-1',
    name: 'Elegant Wooden Photo Frame',
    description: 'Handcrafted wooden frame with custom engraving option. Available in multiple sizes.',
    price: 44.99,
    originalPrice: 54.99,
    category: 'frames',
    images: ['/placeholder.svg'],
    rating: 4.8,
    reviewCount: 178,
    isCustomizable: true,
    colors: ['#8b4513', '#2f1810', '#d4a574'],
    tags: ['premium', 'handcrafted'],
    inStock: true,
  },
  {
    id: 'frame-2',
    name: 'LED Light-Up Frame',
    description: 'Modern acrylic frame with ambient LED lighting. Perfect for night displays.',
    price: 59.99,
    category: 'frames',
    images: ['/placeholder.svg'],
    rating: 4.9,
    reviewCount: 156,
    isCustomizable: true,
    tags: ['modern', 'led'],
    inStock: true,
  },
  // Phone Covers
  {
    id: 'phone-1',
    name: 'Slim Photo Case',
    description: 'Ultra-thin protective case with your custom photo. Available for all major phone models.',
    price: 22.99,
    category: 'phone-covers',
    images: ['/placeholder.svg'],
    rating: 4.5,
    reviewCount: 534,
    isCustomizable: true,
    tags: ['slim', 'protective'],
    inStock: true,
  },
  {
    id: 'phone-2',
    name: 'Rugged Custom Case',
    description: 'Heavy-duty protection meets personal style. Military-grade drop protection.',
    price: 34.99,
    originalPrice: 44.99,
    category: 'phone-covers',
    images: ['/placeholder.svg'],
    rating: 4.7,
    reviewCount: 267,
    isCustomizable: true,
    tags: ['rugged', 'protective'],
    inStock: true,
  },
  // Posters
  {
    id: 'poster-1',
    name: 'Gallery Canvas Print',
    description: 'Museum-quality canvas print stretched on wooden frame. Transform any space.',
    price: 49.99,
    category: 'posters',
    images: ['/placeholder.svg'],
    rating: 4.9,
    reviewCount: 198,
    isCustomizable: true,
    tags: ['premium', 'canvas'],
    inStock: true,
  },
  {
    id: 'poster-2',
    name: 'Metallic Photo Print',
    description: 'Stunning metallic finish that makes colors pop. A conversation starter.',
    price: 64.99,
    originalPrice: 79.99,
    category: 'posters',
    images: ['/placeholder.svg'],
    rating: 4.8,
    reviewCount: 145,
    isCustomizable: true,
    tags: ['metallic', 'vibrant'],
    inStock: true,
  },
  // Gift Combos
  {
    id: 'combo-1',
    name: 'Love Bundle',
    description: 'Perfect for couples! Includes 2 custom mugs, a photo frame, and matching phone cases.',
    price: 89.99,
    originalPrice: 119.99,
    category: 'combos',
    images: ['/placeholder.svg'],
    rating: 4.9,
    reviewCount: 312,
    isCustomizable: true,
    tags: ['bestseller', 'couples', 'value'],
    inStock: true,
  },
  {
    id: 'combo-2',
    name: 'Family Memories Pack',
    description: 'Celebrate family! Contains a canvas print, 3 photo frames, and a custom blanket.',
    price: 129.99,
    originalPrice: 169.99,
    category: 'combos',
    images: ['/placeholder.svg'],
    rating: 4.8,
    reviewCount: 178,
    isCustomizable: true,
    tags: ['family', 'value', 'premium'],
    inStock: true,
  },
];

export const getProductsByCategory = (categoryId: string) => {
  return products.filter((product) => product.category === categoryId);
};

export const getProductById = (id: string) => {
  return products.find((product) => product.id === id);
};

export const getFeaturedProducts = () => {
  return products.filter((product) => product.tags.includes('bestseller')).slice(0, 4);
};
