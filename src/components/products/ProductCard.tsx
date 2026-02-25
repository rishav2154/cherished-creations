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
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
      >
        <Link to={`/product/${product.id}`}>
          <motion.div
            whileHover={{ y: -8 }}
            className="glass-card-hover group cursor-pointer overflow-hidden"
          >
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden">
              <motion.img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Badges */}
              <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex flex-col gap-1 sm:gap-2">
                {product.isCustomizable && (
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium bg-accent-gradient text-accent-foreground rounded-full flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    Customizable
                  </span>
                )}
                {product.originalPrice && (
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium bg-destructive text-destructive-foreground rounded-full">
                    Sale
                  </span>
                )}
              </div>

              {/* Wishlist Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleToggleWishlist}
                className={`absolute top-2 sm:top-4 right-2 sm:right-4 w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  inWishlist
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-background/50 backdrop-blur-sm text-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${inWishlist ? 'fill-current' : ''}`} />
              </motion.button>

              {/* Quick Add Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className="absolute bottom-4 left-4 right-4 py-3 rounded-xl bg-background/90 backdrop-blur-sm text-foreground font-medium text-sm flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-accent hover:text-accent-foreground"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Cart
              </motion.button>
            </div>

            {/* Content */}
            <div className="p-3 sm:p-5">
              <div className="flex items-start justify-between gap-1 sm:gap-2">
                <div className="min-w-0">
                  <h3 className="font-medium text-xs sm:text-sm line-clamp-1 group-hover:text-accent transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 line-clamp-1">
                    {product.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2 sm:mt-4">
                <div className="flex items-baseline gap-1 sm:gap-2">
                  <span className="text-sm sm:text-lg font-bold">₹{product.price.toFixed(2)}</span>
                  {product.originalPrice && (
                    <span className="text-[10px] sm:text-sm text-muted-foreground line-through">
                      ₹{product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <span className="text-accent text-xs sm:text-base">★</span>
                  <span className="text-[10px] sm:text-sm font-medium">{product.rating}</span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:inline">
                    ({product.reviewCount})
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </Link>
      </motion.div>
    );
  }
);

ProductCard.displayName = 'ProductCard';
