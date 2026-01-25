import { motion } from 'framer-motion';
import { Sparkles, Truck, Shield, Heart, Gift, Star } from 'lucide-react';

const messages = [
  { icon: Truck, text: 'Free Shipping on Orders $50+' },
  { icon: Sparkles, text: 'Premium Quality Guaranteed' },
  { icon: Shield, text: 'Secure Checkout' },
  { icon: Heart, text: 'Handcrafted with Love' },
  { icon: Gift, text: 'Perfect Personalized Gifts' },
  { icon: Star, text: '50,000+ Happy Customers' },
];

// Duplicate messages for seamless loop
const allMessages = [...messages, ...messages];

export const MarqueeBanner = () => {
  return (
    <div className="relative overflow-hidden bg-accent py-3 border-y border-accent/20">
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="flex whitespace-nowrap"
      >
        {allMessages.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 mx-8 text-accent-foreground"
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium tracking-wide">{item.text}</span>
            <span className="mx-4 text-accent-foreground/40">✦</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};
