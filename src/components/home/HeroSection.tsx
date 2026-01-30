import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { HeroCarousel } from "./HeroCarousel";
import { AutoTypeSearch } from "@/components/search/AutoTypeSearch";
import { SearchDialog } from "@/components/search/SearchDialog";

export const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <section ref={containerRef} className="relative min-h-screen flex flex-col overflow-hidden pt-20">
      {/* Luxury Gold Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`
            }}
            initial={{ opacity: 0 }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.2, 0.5, 0.2],
              background: i % 2 === 0 ? "hsl(var(--gold))" : "hsl(var(--accent))"
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      {/* Content */}
      <motion.div
        style={{ opacity, scale }}
        className="relative container mx-auto px-4 lg:px-8 z-10 flex-1 flex flex-col"
      >
        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center py-8 md:py-12"
        >
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold font-serif mb-4 bg-gradient-to-r from-foreground via-accent to-foreground bg-clip-text text-transparent">
            Transform Your Precious Moments
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Into Timeless Art
          </p>
        </motion.div>

        {/* Auto-Type Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8 md:mb-12 px-4"
        >
          <AutoTypeSearch onClick={() => setSearchOpen(true)} />
        </motion.div>

        {/* Hero Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex-1 pb-8"
        >
          <HeroCarousel />
        </motion.div>

        {/* Premium Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-8 md:gap-16 py-8 border-t border-border/50"
        >
          {[
            { value: "50K+", label: "Happy Customers", icon: "✨" },
            { value: "100K+", label: "Gifts Created", icon: "🎁" },
            { value: "4.9★", label: "Excellence Rating", icon: "👑" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center group"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent mb-1">
                {stat.value}
              </div>
              <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <span>{stat.icon}</span>
                <span>{stat.label}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Search Dialog */}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </section>
  );
};
