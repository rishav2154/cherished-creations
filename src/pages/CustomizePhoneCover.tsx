import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { PhoneCoverCustomizer } from '@/components/phone-cover-editor/PhoneCoverCustomizer';

const CustomizePhoneCover = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />

      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Back Link */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Link
              to="/shop?category=phone-covers"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Phone Covers
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8 md:py-12"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full mb-4"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Phone Cover Studio</span>
            </motion.div>
            <h1 className="text-3xl md:text-5xl font-bold">
              Design Your <span className="text-gradient-accent">Phone Cover</span>
            </h1>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Choose your phone model, select cover type, and upload your photo to create a unique protective case
            </p>
          </motion.div>

          {/* Customizer */}
          <PhoneCoverCustomizer />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CustomizePhoneCover;
