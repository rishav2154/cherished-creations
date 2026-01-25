import { motion } from 'framer-motion';
import { Truck, ShieldCheck, Heart, Gem } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Express Delivery',
    description: 'Free premium shipping on orders over $50. Your treasures arrive in 3-5 business days.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Payments',
    description: 'Bank-level encryption protects every transaction. Multiple payment options available.',
  },
  {
    icon: Gem,
    title: 'Artisan Quality',
    description: 'Premium materials and cutting-edge printing technology ensure museum-quality results.',
  },
  {
    icon: Heart,
    title: 'Crafted With Love',
    description: 'Each piece receives meticulous attention because your memories deserve perfection.',
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-card">
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      
      {/* Top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs font-medium tracking-[0.2em] uppercase text-accent mb-4 block">
            Why Choose Us
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            The Giftoria Promise
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            We're committed to delivering extraordinary personalized gifts that exceed expectations.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.div
                whileHover={{ y: -8 }}
                className="group relative h-full p-8 rounded-2xl bg-background border border-border hover:border-accent/30 transition-all duration-300"
              >
                {/* Icon */}
                <div className="w-14 h-14 mb-6 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-accent" />
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
