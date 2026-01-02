import { motion } from 'framer-motion';
import { Truck, ShieldCheck, Sparkles, Heart } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Free express shipping on orders over $50. Get your personalized gifts in 3-5 business days.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Payments',
    description: 'Shop with confidence using our encrypted payment system. Multiple payment options available.',
  },
  {
    icon: Sparkles,
    title: 'Premium Quality',
    description: 'We use only the finest materials and state-of-the-art printing technology for lasting results.',
  },
  {
    icon: Heart,
    title: 'Made With Love',
    description: 'Every product is carefully crafted with attention to detail, because your memories deserve the best.',
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-24 bg-card relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-accent font-medium text-sm tracking-wider uppercase">
            Why Choose Us
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mt-4">
            The Giftoria Promise
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            We're committed to delivering exceptional personalized gifts that exceed your expectations.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                className="glass-card p-8 h-full text-center group"
              >
                {/* Icon */}
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:bg-accent-gradient transition-colors duration-300"
                >
                  <feature.icon className="w-8 h-8 text-accent group-hover:text-accent-foreground transition-colors" />
                </motion.div>

                <h3 className="text-lg font-semibold mb-3 group-hover:text-accent transition-colors">
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
