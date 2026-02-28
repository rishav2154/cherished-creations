import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CTASection = () => {
  return (
    <section className="py-4 sm:py-6">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-accent to-accent/80 p-5 sm:p-8 md:p-12">
          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-accent-foreground mb-2 sm:mb-3">
              Create Your Custom Gift Today!
            </h2>
            <p className="text-accent-foreground/80 text-xs sm:text-sm mb-4 sm:mb-6">
              Upload photos, add your personal touch, and surprise your loved ones with unique personalized gifts.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
              <Link
                to="/customize"
                className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-8 sm:py-3 bg-background text-foreground font-semibold text-xs sm:text-sm rounded-lg hover:opacity-90 transition-opacity"
              >
                Start Customizing <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-8 sm:py-3 border-2 border-accent-foreground/30 text-accent-foreground font-semibold text-xs sm:text-sm rounded-lg hover:bg-accent-foreground/10 transition-colors"
              >
                Browse Shop
              </Link>
            </div>
          </div>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-background/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-background/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
      </div>
    </section>
  );
};
