import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import type { Product } from '@/hooks/useProducts';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(
  ({ product, index = 0 }, ref) => {
    const { isInWishlist, toggleItem } = useWishlistStore();
    const addItem = useCartStore((state) => state.addItem);
    const openCart = useCartStore((state) => state.openCart);
    const inWishlist = isInWishlist(product.id);

    const discount = product.originalPrice
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

    const handleAddToCart = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.images[0],
      });
      openCart();
    };

    const handleToggleWishlist = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      toggleItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        category: product.category,
      });
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.04, duration: 0.3 }}
      >
        <Link to={`/product/${product.id}`}>
          <div className="group cursor-pointer bg-card rounded-2xl border border-border overflow-hidden hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5 transition-all duration-300 hover:-translate-y-1 shadow-sm">
            {/* Image */}
            <div className="relative aspect-square overflow-hidden bg-muted/20">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
              />

              {/* Top badges row */}
              <div className="absolute top-2 left-2 right-2 flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  {discount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] sm:text-xs font-bold bg-destructive text-destructive-foreground rounded-lg shadow-sm">
                      {discount}% OFF
                    </span>
                  )}
                  {product.isCustomizable && (
                    <span className="px-2 py-0.5 text-[10px] sm:text-xs font-medium bg-accent/90 text-accent-foreground rounded-lg flex items-center gap-0.5 shadow-sm">
                      <Sparkles className="w-2.5 h-2.5" />
                      Custom
                    </span>
                  )}
                </div>

                {/* Wishlist */}
                <button
                  onClick={handleToggleWishlist}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md ${
                    inWishlist
                      ? 'bg-accent text-accent-foreground scale-110'
                      : 'bg-card/80 backdrop-blur-sm text-muted-foreground hover:text-accent hover:bg-card hover:scale-110'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Add to Cart overlay */}
              <div className="absolute bottom-0 left-0 right-0 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                <button
                  onClick={handleAddToCart}
                  className="w-full py-2.5 bg-accent/95 backdrop-blur-sm text-accent-foreground font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-accent transition-colors"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Add to Cart
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="p-3 sm:p-3.5">
              <h3 className="font-semibold text-xs sm:text-sm text-foreground line-clamp-1 group-hover:text-accent transition-colors">
                {product.name}
              </h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {product.description}
              </p>

              <div className="flex items-center gap-1.5 mt-2">
                <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-accent/15 rounded-md text-accent text-[10px] font-bold border border-accent/20">
                  {product.rating} ★
                </div>
                <span className="text-[10px] text-muted-foreground">
                  ({product.reviewCount})
                </span>
              </div>

              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-base sm:text-lg font-bold text-foreground">₹{product.price.toFixed(0)}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-[10px] sm:text-xs text-muted-foreground line-through">
                      ₹{product.originalPrice.toFixed(0)}
                    </span>
                    <span className="text-[10px] sm:text-xs font-semibold text-accent">
                      {discount}% off
                    </span>
                  </>
                )}
              </div>

              {/* Free delivery tag */}
              {product.price >= 499 && (
                <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-accent" />
                  Free Delivery
                </p>
              )}
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }
);

ProductCard.displayName = 'ProductCard';
