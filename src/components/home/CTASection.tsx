import { motion } from 'framer-motion';
import { ArrowRight, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-luxury-gradient" />
          <div className="absolute inset-0 bg-grid-pattern opacity-30" />

          {/* Glow Effects */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-warm/20 rounded-full blur-3xl" />

          {/* Content */}
          <div className="relative p-12 md:p-20 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-accent/20 flex items-center justify-center"
            >
              <Gift className="w-10 h-10 text-accent" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-bold mb-6"
            >
              Ready to Create Something{' '}
              <span className="text-gradient-accent">Special</span>?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-foreground/80 max-w-2xl mx-auto mb-10"
            >
              Start designing your personalized gift today. Upload your favorite photos, 
              add your personal touch, and create a gift that will be treasured forever.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/customize">
                <motion.span
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-luxury inline-flex items-center gap-2"
                >
                  Start Customizing
                  <ArrowRight className="w-5 h-5" />
                </motion.span>
              </Link>
              <Link to="/shop">
                <motion.span
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-outline-luxury inline-flex items-center gap-2"
                >
                  Browse All Products
                </motion.span>
              </Link>
            </motion.div>

            {/* Decorative Elements */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute top-10 right-10 w-20 h-20 border border-accent/20 rounded-full opacity-50 hidden md:block"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              className="absolute bottom-10 left-10 w-32 h-32 border border-accent/20 rounded-full opacity-50 hidden md:block"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};
