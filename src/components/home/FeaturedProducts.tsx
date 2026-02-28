import { ArrowRight, Loader2, Zap, TrendingUp, Star, Timer } from 'lucide-react';
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
  bgClass?: string;
}

const ProductRow = ({ title, icon, badge, badgeColor = "bg-accent", products, isLoading, bgClass = "bg-card" }: ProductRowProps) => (
  <section className={`py-4 sm:py-6 ${bgClass}`}>
    <div className="container mx-auto px-2 sm:px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-5">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-accent/10 flex items-center justify-center">
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-xl font-bold text-foreground">{title}</h2>
              {badge && (
                <span className={`${badgeColor} text-accent-foreground text-[9px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide`}>
                  {badge}
                </span>
              )}
            </div>
          </div>
        </div>
        <Link
          to="/shop"
          className="flex items-center gap-1 text-accent text-xs sm:text-sm font-medium hover:underline underline-offset-4"
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Products */}
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
        </div>
      ) : products.length === 0 ? (
        <p className="text-center text-muted-foreground py-8 text-sm">No products available.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4">
          {products.slice(0, 5).map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      )}
    </div>
  </section>
);

// Enhanced offer banners
const OfferBanner = () => (
  <section className="py-3 sm:py-4 bg-background">
    <div className="container mx-auto px-2 sm:px-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {[
          { img: "https://images.unsplash.com/photo-1549465220-1a8b9238f37e?w=400&q=80", label: "COMBO DEALS", title: "Up to 40% Off", sub: "Gift Combos", link: "/shop?category=combos", color: "from-accent/90" },
          { img: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&q=80", label: "NEW ARRIVALS", title: "Photo Frames", sub: "Starting ₹449", link: "/shop?category=frames", color: "from-primary/90" },
          { img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80", label: "TRENDING", title: "Custom Tees", sub: "From ₹299", link: "/shop?category=tshirts", color: "from-destructive/80" },
          { img: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&q=80", label: "BEST SELLER", title: "Phone Covers", sub: "From ₹199", link: "/shop?category=phone-covers", color: "from-secondary/90" },
        ].map((item, i) => (
          <Link key={i} to={item.link} className="relative rounded-xl overflow-hidden aspect-[3/2] group">
            <img
              src={item.img}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${item.color} to-transparent opacity-80`} />
            <div className="absolute inset-0 flex flex-col justify-end p-3 sm:p-4">
              <span className="text-[9px] sm:text-[10px] font-bold text-accent-foreground/80 tracking-wider uppercase">{item.label}</span>
              <p className="text-sm sm:text-base font-bold text-accent-foreground">{item.title}</p>
              <p className="text-[10px] sm:text-xs text-accent-foreground/70">{item.sub}</p>
            </div>
          </Link>
        ))}
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
        badge="LIVE"
        badgeColor="bg-destructive"
        products={featuredProducts}
        isLoading={featuredLoading}
        bgClass="bg-card"
      />

      <OfferBanner />

      <ProductRow
        title="Trending Now"
        icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />}
        badge="HOT"
        badgeColor="bg-accent"
        products={allProducts}
        isLoading={allLoading}
        bgClass="bg-card"
      />

      <ProductRow
        title="Top Rated"
        icon={<Star className="w-4 h-4 sm:w-5 sm:h-5 text-accent fill-accent" />}
        products={allProducts.slice().reverse()}
        isLoading={allLoading}
        bgClass="bg-card"
      />
    </>
  );
};
