import { ArrowRight, Loader2, Zap, TrendingUp, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFeaturedProducts, useProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/products/ProductCard';

interface ProductRowProps {
  title: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  products: any[];
  isLoading: boolean;
}

const ProductRow = ({ title, icon, badge, badgeColor = "bg-accent", products, isLoading }: ProductRowProps) => (
  <section className="py-3 sm:py-5 bg-card border-b border-border/30">
    <div className="container mx-auto px-2 sm:px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-sm sm:text-lg font-bold text-foreground">{title}</h2>
          {badge && (
            <span className={`${badgeColor} text-accent-foreground text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded`}>
              {badge}
            </span>
          )}
        </div>
        <Link
          to="/shop"
          className="flex items-center gap-1 text-accent text-xs sm:text-sm font-medium hover:underline"
        >
          View All <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
        </Link>
      </div>

      {/* Products */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
        </div>
      ) : products.length === 0 ? (
        <p className="text-center text-muted-foreground py-6 text-sm">No products available.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
          {products.slice(0, 5).map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      )}
    </div>
  </section>
);

// Offer banners between product rows
const OfferBanner = () => (
  <section className="py-2 sm:py-3">
    <div className="container mx-auto px-2 sm:px-4">
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <Link to="/shop?category=combos" className="relative rounded-lg overflow-hidden aspect-[2/1] group">
          <img
            src="https://images.unsplash.com/photo-1549465220-1a8b9238f37e?w=600&q=80"
            alt="Gift Combos"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent flex items-center p-3 sm:p-5">
            <div>
              <p className="text-[10px] sm:text-xs text-accent font-semibold">COMBO DEALS</p>
              <p className="text-xs sm:text-lg font-bold text-foreground">Up to 40% Off</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Gift Combos</p>
            </div>
          </div>
        </Link>
        <Link to="/shop?category=frames" className="relative rounded-lg overflow-hidden aspect-[2/1] group">
          <img
            src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=80"
            alt="Photo Frames"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent flex items-center p-3 sm:p-5">
            <div>
              <p className="text-[10px] sm:text-xs text-accent font-semibold">NEW ARRIVALS</p>
              <p className="text-xs sm:text-lg font-bold text-foreground">Photo Frames</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Starting ₹449</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  </section>
);

export const FeaturedProducts = () => {
  const { data: featuredProducts = [], isLoading: featuredLoading } = useFeaturedProducts();
  const { data: allProducts = [], isLoading: allLoading } = useProducts();

  return (
    <>
      <ProductRow
        title="Deals of the Day"
        icon={<Zap className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />}
        badge="SALE"
        products={featuredProducts}
        isLoading={featuredLoading}
      />

      <OfferBanner />

      <ProductRow
        title="Trending Now"
        icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />}
        badge="HOT"
        badgeColor="bg-destructive"
        products={allProducts}
        isLoading={allLoading}
      />

      <ProductRow
        title="Top Rated"
        icon={<Star className="w-4 h-4 sm:w-5 sm:h-5 text-accent fill-accent" />}
        products={allProducts.slice().reverse()}
        isLoading={allLoading}
      />
    </>
  );
};
