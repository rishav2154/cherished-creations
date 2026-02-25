import { motion } from 'framer-motion';
import { ArrowRight, Gift, Crown, Sparkles, Diamond } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CTASection = () => {
  return (
    <section className="py-16 sm:py-32 relative overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[2.5rem] overflow-hidden"
        >
          {/* Premium Multi-layer Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-luxury-deep-1 via-luxury-deep-2 to-luxury-deep-3" />
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          
          {/* Animated Gold Orbs */}
          <motion.div
            animate={{ 
              scale: [1, 1.3, 1], 
              opacity: [0.2, 0.4, 0.2],
              x: [0, 30, 0],
              y: [0, -20, 0]
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-1/4 right-1/4 w-64 h-64 bg-gold rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1], 
              opacity: [0.15, 0.3, 0.15],
              x: [0, -20, 0],
              y: [0, 30, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, delay: 2 }}
            className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-accent rounded-full blur-3xl"
          />

          {/* Premium Border */}
          <div className="absolute inset-0 rounded-[2.5rem] border-2 border-gold/20" />

          {/* Content */}
          <div className="relative p-8 sm:p-12 md:p-24 text-center">
            {/* Premium Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="relative w-28 h-28 mx-auto mb-10"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border-2 border-dashed border-gold/30"
              />
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-gold/20 to-accent/20 backdrop-blur-sm flex items-center justify-center">
                <Gift className="w-12 h-12 text-gold" />
              </div>
              {/* Floating Diamonds */}
              <motion.div
                animate={{ y: [0, -8, 0], rotate: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-2 -right-2"
              >
                <Diamond className="w-6 h-6 text-gold" />
              </motion.div>
              <motion.div
                animate={{ y: [0, -6, 0], rotate: [0, -10, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                className="absolute -bottom-1 -left-1"
              >
                <Sparkles className="w-5 h-5 text-accent" />
              </motion.div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl md:text-6xl font-bold mb-6 sm:mb-8"
            >
              <span className="text-foreground">Ready to Create </span>
              <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-gold via-accent to-accent-warm bg-clip-text text-transparent">
                Something Extraordinary
              </span>
              <span className="text-foreground">?</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-base sm:text-xl text-foreground/70 max-w-3xl mx-auto mb-8 sm:mb-12 leading-relaxed"
            >
              Begin crafting your personalized masterpiece today. Upload your cherished photos, 
              add your unique touch, and create a gift that will be treasured for generations.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <Link to="/customize">
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative inline-flex items-center gap-2 sm:gap-3 px-8 py-4 sm:px-12 sm:py-5 rounded-2xl font-semibold text-base sm:text-lg overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, hsl(43 74% 49%) 0%, hsl(339 78% 53%) 50%, hsl(14 100% 59%) 100%)',
                    boxShadow: '0 20px 60px hsl(43 74% 49% / 0.4), 0 0 80px hsl(339 78% 53% / 0.2)',
                  }}
                >
                  <Crown className="w-5 h-5 text-white" />
                  <span className="text-white">Begin Your Masterpiece</span>
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5 text-white" />
                  </motion.span>
                </motion.span>
              </Link>
              <Link to="/shop">
                <motion.span
                  whileHover={{ scale: 1.05, borderColor: 'hsl(43 74% 49%)' }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 sm:gap-3 px-8 py-4 sm:px-12 sm:py-5 rounded-2xl font-semibold text-base sm:text-lg border-2 border-gold/30 text-foreground hover:text-gold hover:border-gold transition-all duration-300"
                >
                  Explore Collection
                </motion.span>
              </Link>
            </motion.div>

            {/* Decorative Rotating Elements */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              className="absolute top-12 right-12 w-24 h-24 border border-gold/20 rounded-full hidden md:block"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              className="absolute bottom-12 left-12 w-40 h-40 border border-gold/15 rounded-full hidden md:block"
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute top-1/2 left-8 w-16 h-16 border border-accent/20 rounded-full hidden lg:block"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};
