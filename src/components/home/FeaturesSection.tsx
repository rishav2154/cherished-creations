import { motion } from 'framer-motion';
import { Truck, ShieldCheck, Sparkles, Heart, Crown, Gift, Star, Gem } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Express Delivery',
    description: 'Complimentary premium shipping on orders over $50. Your treasures arrive in 3-5 business days.',
    gradient: 'from-blue-500 to-cyan-400',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Payments',
    description: 'Bank-level encryption protects every transaction. Multiple payment options for your convenience.',
    gradient: 'from-emerald-500 to-teal-400',
  },
  {
    icon: Gem,
    title: 'Artisan Quality',
    description: 'Premium materials and cutting-edge printing technology ensure museum-quality results.',
    gradient: 'from-violet-500 to-purple-400',
  },
  {
    icon: Heart,
    title: 'Crafted With Love',
    description: 'Each piece receives meticulous attention to detail because your memories deserve perfection.',
    gradient: 'from-rose-500 to-pink-400',
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 bg-card" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/50" />
      
      {/* Decorative Elements */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-1/4 -left-48 w-96 h-96 bg-gold rounded-full blur-3xl"
      />
      <motion.div 
        animate={{ scale: [1, 1.3, 1], opacity: [0.05, 0.08, 0.05] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        className="absolute bottom-1/4 -right-48 w-96 h-96 bg-accent rounded-full blur-3xl"
      />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gold/10 border border-gold/20 mb-6"
          >
            <Crown className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium text-gold tracking-wider uppercase">
              The Giftoria Promise
            </span>
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-bold mt-4">
            <span className="text-foreground">Why Choose </span>
            <span className="bg-gradient-to-r from-gold via-accent to-gold bg-clip-text text-transparent">
              Excellence
            </span>
          </h2>
          <p className="text-muted-foreground mt-6 max-w-2xl mx-auto text-lg leading-relaxed">
            We're committed to delivering extraordinary personalized gifts that exceed your highest expectations.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.div
                whileHover={{ y: -12, scale: 1.02 }}
                className="relative h-full p-8 rounded-3xl bg-gradient-to-b from-muted/50 to-muted/20 border border-border/50 group overflow-hidden"
              >
                {/* Hover Glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent" />
                </div>
                
                {/* Gold Border on Hover */}
                <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-gold/30 transition-colors duration-500" />

                {/* Icon */}
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className={`w-20 h-20 mb-8 rounded-2xl bg-gradient-to-br ${feature.gradient} p-0.5`}
                >
                  <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center">
                    <feature.icon className="w-10 h-10 text-foreground group-hover:text-gold transition-colors duration-300" />
                  </div>
                </motion.div>

                <h3 className="text-xl font-bold mb-4 group-hover:text-gold transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>

                {/* Decorative Star */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="absolute top-6 right-6"
                >
                  <Star className="w-5 h-5 text-gold/30 group-hover:text-gold/60 transition-colors duration-300" />
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
