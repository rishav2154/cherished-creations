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
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
      >
        <Link to={`/product/${product.id}`}>
          <div className="group cursor-pointer bg-card rounded-xl border border-border/50 overflow-hidden hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300">
            {/* Image */}
            <div className="relative aspect-square overflow-hidden bg-muted/30">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Discount Badge */}
              {discount > 0 && (
                <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] sm:text-xs font-bold bg-destructive text-destructive-foreground rounded-md">
                  {discount}% OFF
                </span>
              )}

              {/* Customizable Badge */}
              {product.isCustomizable && !discount && (
                <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] sm:text-xs font-medium bg-accent text-accent-foreground rounded-md flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  Custom
                </span>
              )}

              {/* Wishlist */}
              <button
                onClick={handleToggleWishlist}
                className={`absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                  inWishlist
                    ? 'bg-accent text-accent-foreground shadow-md'
                    : 'bg-card/80 backdrop-blur-sm text-muted-foreground hover:text-accent hover:bg-card'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${inWishlist ? 'fill-current' : ''}`} />
              </button>

              {/* Add to Cart - shows on hover */}
              <button
                onClick={handleAddToCart}
                className="absolute bottom-0 left-0 right-0 py-2 bg-accent text-accent-foreground font-medium text-xs flex items-center justify-center gap-1.5 opacity-0 translate-y-full group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Add to Cart
              </button>
            </div>

            {/* Info */}
            <div className="p-2.5 sm:p-3">
              <h3 className="font-medium text-xs sm:text-sm text-foreground line-clamp-1 group-hover:text-accent transition-colors">
                {product.name}
              </h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {product.description}
              </p>

              <div className="flex items-center gap-1 mt-1.5">
                <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-accent/90 rounded text-accent-foreground text-[10px] font-bold">
                  {product.rating} ★
                </div>
                <span className="text-[10px] text-muted-foreground">
                  ({product.reviewCount})
                </span>
              </div>

              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-sm sm:text-base font-bold text-foreground">₹{product.price.toFixed(0)}</span>
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
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }
);

ProductCard.displayName = 'ProductCard';
