import { ArrowRight, Gift, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CTASection = () => {
  return (
    <section className="py-5 sm:py-8 pb-20 sm:pb-8 bg-background">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-accent via-accent/85 to-accent/70 p-6 sm:p-10 md:p-16 shimmer-border">
          {/* Decorative */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-accent-foreground/5 rounded-full -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-accent-foreground/5 rounded-full translate-y-1/3 -translate-x-1/3" />
          <div className="absolute top-1/3 right-1/3 w-24 h-24 bg-accent-foreground/5 rounded-full hidden md:block" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-14">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-accent-foreground/10 backdrop-blur-sm flex items-center justify-center shrink-0 border border-accent-foreground/10">
              <Gift className="w-8 h-8 sm:w-10 sm:h-10 text-accent-foreground" />
            </div>
            <div className="text-center md:text-left flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-3 text-[10px] sm:text-xs font-semibold bg-accent-foreground/10 text-accent-foreground/80 rounded-full">
                <Sparkles className="w-3 h-3" />
                Personalized Gifts
              </div>
              <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-accent-foreground mb-2 sm:mb-3 leading-tight">
                Create Your Custom Gift Today!
              </h2>
              <p className="text-accent-foreground/70 text-xs sm:text-sm max-w-xl leading-relaxed">
                Upload photos, add your personal touch, and surprise loved ones with unique personalized gifts they'll cherish forever.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                to="/customize"
                className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-3.5 bg-background text-foreground font-semibold text-xs sm:text-sm rounded-xl hover:opacity-90 transition-all shadow-xl hover:-translate-y-0.5"
              >
                Start Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-3.5 border-2 border-accent-foreground/20 text-accent-foreground font-semibold text-xs sm:text-sm rounded-xl hover:bg-accent-foreground/10 transition-colors"
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
