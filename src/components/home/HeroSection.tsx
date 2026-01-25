import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { useRef, Suspense, useState, lazy } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load Spline to prevent blocking page transitions
const Spline = lazy(() => import("@splinetool/react-spline"));

// Skeleton loader component for Spline background
const SplineLoader = () => (
  <div className="absolute inset-0 bg-background">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative w-full h-full">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-primary/5 to-gold/10 animate-pulse" />

        {/* Decorative skeleton elements */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 md:w-48 md:h-48">
          <Skeleton className="w-full h-full rounded-full opacity-30" />
        </div>
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 md:w-36 md:h-36">
          <Skeleton className="w-full h-full rounded-full opacity-20" />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 md:w-64 md:h-64">
          <Skeleton className="w-full h-full rounded-full opacity-40" />
        </div>

        {/* Loading text */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-accent"
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">Loading 3D Experience...</span>
        </div>
      </div>
    </div>
  </div>
);

export const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSplineLoaded, setIsSplineLoaded] = useState(false);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Spline 3D Background with Skeleton Loader */}
      <div className="absolute inset-0">
        <AnimatePresence>
          {!isSplineLoaded && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute inset-0 z-10"
            >
              <SplineLoader />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isSplineLoaded ? 1 : 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="w-full h-full"
        >
          <Suspense fallback={null}>
            <Spline
              scene="https://prod.spline.design/M4lt5v1zkLC9BNwq/scene.splinecode"
              className="w-full h-full"
              onLoad={() => setIsSplineLoaded(true)}
            />
          </Suspense>
        </motion.div>

        {/* Gradient overlay for content readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-background/50 pointer-events-none" />
      </div>

      {/* Content */}
      <motion.div
        style={{ opacity, y }}
        className="relative container mx-auto px-4 lg:px-8 text-center z-10 pt-20"
      >
        {/* Eyebrow Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-accent">
            <span className="w-8 h-px bg-accent" />
            Personalized Luxury Gifts
            <span className="w-8 h-px bg-accent" />
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight mb-8"
        >
          <span className="block text-foreground">Transform Your</span>
          <span className="block mt-2 bg-gradient-to-r from-accent via-gold to-accent bg-clip-text text-transparent">
            Precious Moments
          </span>
          <span className="block text-foreground mt-2">Into Timeless Art</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Create museum-quality personalized gifts that capture your most cherished memories. 
          Each piece crafted with love and precision.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/customize">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative px-8 py-4 rounded-full bg-accent text-accent-foreground font-semibold text-base overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_hsl(var(--accent)/0.4)]"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Creating
                <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              </span>
            </motion.button>
          </Link>
          <Link to="/shop">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group px-8 py-4 rounded-full border border-border text-foreground font-medium text-base hover:border-foreground transition-all duration-300 flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Explore Shop
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-8 sm:gap-16 mt-20 pt-12 border-t border-border/30"
        >
          {[
            { value: "50K+", label: "Happy Customers" },
            { value: "100K+", label: "Gifts Created" },
            { value: "4.9", label: "Star Rating" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              whileHover={{ y: -2 }}
            >
              <div className="text-3xl sm:text-4xl font-bold text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground tracking-wide uppercase">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs text-muted-foreground tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-muted-foreground to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  );
};
