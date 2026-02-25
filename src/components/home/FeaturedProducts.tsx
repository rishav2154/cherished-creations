import { motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFeaturedProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/products/ProductCard';

export const FeaturedProducts = () => {
  const { data: featuredProducts = [], isLoading } = useFeaturedProducts();

  return (
    <section className="py-16 sm:py-24 bg-card relative overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12"
        >
          <div>
            <span className="text-accent font-medium text-sm tracking-wider uppercase">
              Best Sellers
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mt-4">
              Featured Products
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl">
              Discover our most loved personalized gifts, chosen by thousands of happy customers.
            </p>
          </div>
          <Link to="/shop">
            <motion.span
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 text-accent font-medium hover:gap-3 transition-all"
            >
              View All Products
              <ArrowRight className="w-5 h-5" />
            </motion.span>
          </Link>
        </motion.div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No featured products available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {featuredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
