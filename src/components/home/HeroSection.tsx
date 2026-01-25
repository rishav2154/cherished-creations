import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Crown, Diamond } from "lucide-react";
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
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);
  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Spline 3D Background with Skeleton Loader */}
      <div className="absolute inset-0">
        <AnimatePresence>
          {!isSplineLoaded && (
            <motion.div
              initial={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
              }}
              className="absolute inset-0 z-10"
            >
              <SplineLoader />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: isSplineLoaded ? 1 : 0,
          }}
          transition={{
            duration: 1,
            ease: "easeOut",
          }}
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

        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background/80 pointer-events-none" />
      </div>

      {/* Luxury Gold Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
            }}
            initial={{
              opacity: 0,
            }}
            animate={{
              y: [0, -50, 0],
              x: [0, Math.random() * 30 - 15, 0],
              opacity: [0.2, 0.7, 0.2],
              scale: [1, 1.5, 1],
              background: i % 3 === 0 ? "hsl(var(--gold))" : "hsl(var(--accent))",
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Animated Gold Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute w-[500px] h-[500px] md:w-[600px] md:h-[600px] rounded-full border border-gold/10"
        />
        <motion.div
          animate={{
            rotate: -360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute w-[700px] h-[700px] md:w-[800px] md:h-[800px] rounded-full border border-accent/10"
        />
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute w-[900px] h-[900px] md:w-[1000px] md:h-[1000px] rounded-full border border-gold/5"
        />
      </div>

      {/* Content */}
      <motion.div
        style={{
          opacity,
          scale,
        }}
        className="relative container mx-auto px-4 lg:px-8 text-center z-10 py-10"
      >
        {/* Premium Badge */}
        <motion.div
          initial={{
            opacity: 0,
            y: 30,
            scale: 0.9,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.8,
          }}
          className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gold/10 border border-gold/30 mb-6 backdrop-blur-sm"
        >
          <Crown className="w-4 h-4 text-gold" />
          <span className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-gold">
            Luxury Personalized Gifts
          </span>
          <Diamond className="w-3 h-3 text-gold" />
        </motion.div>

        <motion.p
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.8,
            delay: 0.2,
          }}
          className="text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-serif text-primary-foreground px-[30px] md:text-3xl py-0 my-[130px] text-center"
        >
          Transform Your Precious Moments Into Timeless Art.
        </motion.p>

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.8,
            delay: 0.3,
          }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
        >
          <Link to="/customize" className="group w-full sm:w-auto">
            <motion.span
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.98,
              }}
              className="relative inline-flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 rounded-2xl font-semibold text-base overflow-hidden bg-accent-gradient glow-accent"
            >
              <span className="relative z-10 text-accent-foreground">Begin Your Creation</span>
              <motion.span
                animate={{
                  x: [0, 8, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
                className="relative z-10"
              >
                <Sparkles className="w-5 h-5 text-accent-foreground" />
              </motion.span>
            </motion.span>
          </Link>
          <Link to="/shop" className="w-full sm:w-auto">
            <motion.span
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.98,
              }}
              className="inline-flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 rounded-2xl font-semibold text-base border-2 border-border hover:border-gold text-foreground hover:text-gold transition-all duration-300 backdrop-blur-sm"
            >
              Explore Collection
              <ArrowRight className="w-5 h-5" />
            </motion.span>
          </Link>
        </motion.div>

        {/* Premium Stats */}
        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.8,
            delay: 0.5,
          }}
          className="flex flex-wrap justify-center gap-8 md:gap-16 mt-16"
        >
          {[
            {
              value: "50K+",
              label: "Happy Customers",
              icon: "✨",
            },
            {
              value: "100K+",
              label: "Gifts Created",
              icon: "🎁",
            },
            {
              value: "4.9★",
              label: "Excellence Rating",
              icon: "👑",
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center group"
              whileHover={{
                scale: 1.05,
              }}
            >
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-gradient-accent mb-2">{stat.value}</div>
              <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <span>{stat.icon}</span>
                <span>{stat.label}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Premium Scroll Indicator */}
      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          delay: 1,
        }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{
            y: [0, 12, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className="w-7 h-12 rounded-full border-2 border-gold/40 flex items-start justify-center p-2.5 backdrop-blur-sm"
        >
          <motion.div
            className="w-1.5 h-2.5 rounded-full bg-accent-gradient"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
};
