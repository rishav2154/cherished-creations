import { ArrowRight, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CTASection = () => {
  return (
    <section className="py-4 sm:py-6 bg-background">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-accent via-accent/90 to-accent/70 p-6 sm:p-10 md:p-14">
          {/* Decorative */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-background/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-background/5 rounded-full translate-y-1/2 -translate-x-1/3" />
          <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-background/5 rounded-full hidden md:block" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-12">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-accent-foreground/10 flex items-center justify-center shrink-0">
              <Gift className="w-7 h-7 sm:w-8 sm:h-8 text-accent-foreground" />
            </div>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-accent-foreground mb-1 sm:mb-2">
                Create Your Custom Gift Today!
              </h2>
              <p className="text-accent-foreground/75 text-xs sm:text-sm max-w-xl">
                Upload photos, add your personal touch, and surprise loved ones with unique personalized gifts.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                to="/customize"
                className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-7 sm:py-3 bg-background text-foreground font-semibold text-xs sm:text-sm rounded-xl hover:opacity-90 transition-opacity shadow-lg"
              >
                Start Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-7 sm:py-3 border-2 border-accent-foreground/25 text-accent-foreground font-semibold text-xs sm:text-sm rounded-xl hover:bg-accent-foreground/10 transition-colors"
              >
                Browse
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
