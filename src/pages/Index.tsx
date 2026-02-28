import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { HeroSection } from '@/components/home/HeroSection';
import { MarqueeBanner } from '@/components/home/MarqueeBanner';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { CTASection } from '@/components/home/CTASection';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />
      <main>
        <HeroSection />
        <CategoriesSection />
        <MarqueeBanner />
        <FeaturedProducts />
        <FeaturesSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
