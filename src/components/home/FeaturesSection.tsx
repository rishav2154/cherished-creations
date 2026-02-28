import { Truck, ShieldCheck, Heart, Gem } from 'lucide-react';

const features = [
  { icon: Truck, title: 'Free Shipping', desc: 'Orders above ₹999' },
  { icon: ShieldCheck, title: 'Secure Payment', desc: '100% protected' },
  { icon: Gem, title: 'Premium Quality', desc: 'Best materials used' },
  { icon: Heart, title: 'Made with Love', desc: 'Handcrafted with care' },
];

export const FeaturesSection = () => {
  return (
    <section className="py-4 sm:py-6 bg-background">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-card border border-border/50 hover:border-accent/20 transition-colors"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <feature.icon className="w-5 h-5 text-accent" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{feature.title}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
