import { Truck, ShieldCheck, Heart, Gem } from 'lucide-react';

const features = [
  { icon: Truck, title: 'Free Shipping', desc: 'On orders ₹999+' },
  { icon: ShieldCheck, title: 'Secure Payment', desc: '100% protected' },
  { icon: Gem, title: 'Premium Quality', desc: 'Best materials' },
  { icon: Heart, title: 'Made with Love', desc: 'Handcrafted care' },
];

export const FeaturesSection = () => {
  return (
    <section className="py-4 sm:py-6 bg-card border-y border-border/50">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex items-center gap-2.5 p-3 rounded-lg bg-muted/40"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
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
