import { motion } from "framer-motion";
import { Truck, Gift, Shield, Sparkles, Heart, Clock } from "lucide-react";

const messages = [
  { icon: Truck, text: "Free Shipping on Orders ₹999+" },
  { icon: Gift, text: "Handcrafted with Love" },
  { icon: Shield, text: "100% Quality Guaranteed" },
  { icon: Sparkles, text: "Premium Personalization" },
  { icon: Heart, text: "Made Just for You" },
  { icon: Clock, text: "Fast 3-5 Day Delivery" },
];

export const MarqueeBanner = () => {
  // Double the messages for seamless loop
  const duplicatedMessages = [...messages, ...messages];

  return (
    <div className="relative overflow-hidden bg-accent/10 border-y border-accent/20 py-3 backdrop-blur-sm">
      {/* Gradient overlays for smooth fade effect */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{
          x: ["-50%", "0%"],
        }}
        transition={{
          x: {
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          },
        }}
      >
        {duplicatedMessages.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 text-sm font-medium text-foreground/80"
          >
            <item.icon className="w-4 h-4 text-accent shrink-0" />
            <span>{item.text}</span>
            <span className="text-accent/50 mx-4">✦</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};
