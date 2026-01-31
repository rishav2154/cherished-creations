import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useRef, Suspense, useState, lazy, useEffect, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load Spline to prevent blocking page transitions
const Spline = lazy(() => import("@splinetool/react-spline"));

// Auto-typing keywords for search bar
const searchKeywords = [
  "Custom T-Shirts",
  "Photo Mugs",
  "Phone Covers",
  "Gift Combos",
  "Photo Frames",
  "Personalized Posters",
];

// Hero slides data
const heroSlides = [
  {
    id: "default",
    type: "spline" as const,
    title: "Transform Your Precious Moments Into Timeless Art.",
  },
  {
    id: "slide1",
    type: "image" as const,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1920&q=80",
    title: "Premium Custom T-Shirts",
    subtitle: "Express yourself with personalized designs",
  },
  {
    id: "slide2",
    type: "image" as const,
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=1920&q=80",
    title: "Designer Photo Mugs",
    subtitle: "Start every morning with memories",
  },
  {
    id: "slide3",
    type: "image" as const,
    image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=1920&q=80",
    title: "Custom Phone Covers",
    subtitle: "Protect your phone in style",
  },
  {
    id: "slide4",
    type: "image" as const,
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1920&q=80",
    title: "Elegant Photo Frames",
    subtitle: "Frame your cherished moments",
  },
  {
    id: "slide5",
    type: "image" as const,
    image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=1920&q=80",
    title: "Perfect Gift Combos",
    subtitle: "Curated gifts for every occasion",
  },
  {
    id: "slide6",
    type: "image" as const,
    image: "https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=1920&q=80",
    title: "Stunning Wall Posters",
    subtitle: "Transform your space with art",
  },
];

// Skeleton loader component for Spline background
const SplineLoader = () => (
  <div className="absolute inset-0 bg-background">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-primary/5 to-gold/10 animate-pulse" />
        <div className="absolute top-1/4 left-1/4 w-32 h-32 md:w-48 md:h-48">
          <Skeleton className="w-full h-full rounded-full opacity-30" />
        </div>
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 md:w-36 md:h-36">
          <Skeleton className="w-full h-full rounded-full opacity-20" />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 md:w-64 md:h-64">
          <Skeleton className="w-full h-full rounded-full opacity-40" />
        </div>
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

// Auto-typing search bar component
const AutoTypingSearchBar = () => {
  const [currentKeywordIndex, setCurrentKeywordIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const currentKeyword = searchKeywords[currentKeywordIndex];
    const typingSpeed = isDeleting ? 50 : 100;
    const pauseTime = isDeleting ? 200 : 2000;

    if (!isDeleting && displayText === currentKeyword) {
      setTimeout(() => setIsDeleting(true), pauseTime);
      return;
    }

    if (isDeleting && displayText === "") {
      setIsDeleting(false);
      setCurrentKeywordIndex((prev) => (prev + 1) % searchKeywords.length);
      return;
    }

    const timeout = setTimeout(() => {
      if (isDeleting) {
        setDisplayText(currentKeyword.slice(0, displayText.length - 1));
      } else {
        setDisplayText(currentKeyword.slice(0, displayText.length + 1));
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentKeywordIndex]);

  const handleSearchClick = () => {
    navigate(`/shop?search=${encodeURIComponent(displayText || searchKeywords[currentKeywordIndex])}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="w-full max-w-3xl mx-auto px-4"
    >
      <div
        onClick={handleSearchClick}
        className="relative flex items-center bg-card/90 backdrop-blur-xl border-2 border-accent/30 rounded-2xl shadow-2xl shadow-accent/10 cursor-pointer group hover:border-accent/50 transition-all duration-300"
      >
        <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20">
          <Search className="w-6 h-6 md:w-8 md:h-8 text-accent" />
        </div>
        <div className="flex-1 py-5 md:py-6 pr-6">
          <span className="text-lg md:text-2xl text-muted-foreground">
            Search for{" "}
            <span className="text-foreground font-medium">
              {displayText}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-block w-0.5 h-6 md:h-7 bg-accent ml-1 align-middle"
              />
            </span>
          </span>
        </div>
        <div className="pr-4">
          <div className="px-4 py-2 md:px-6 md:py-3 bg-accent text-accent-foreground rounded-xl font-medium text-sm md:text-base group-hover:bg-accent/90 transition-colors">
            Search
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSplineLoaded, setIsSplineLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  // Auto-slide functionality
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  }, []);

  const goToPrevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  }, []);

  const goToNextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  }, []);

  const currentSlideData = heroSlides[currentSlide];

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Slides Background */}
      <AnimatePresence mode="wait">
        {currentSlideData.type === "spline" ? (
          <motion.div
            key="spline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
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

            <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background/80 pointer-events-none" />
          </motion.div>
        ) : (
          <motion.div
            key={currentSlideData.id}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <img
              src={currentSlideData.image}
              alt={currentSlideData.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/90" />
          </motion.div>
        )}
      </AnimatePresence>

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
            initial={{ opacity: 0 }}
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

      {/* Animated Gold Rings (only on spline slide) */}
      {currentSlideData.type === "spline" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.05, 1] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute w-[500px] h-[500px] md:w-[600px] md:h-[600px] rounded-full border border-gold/10"
          />
          <motion.div
            animate={{ rotate: -360, scale: [1, 1.1, 1] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute w-[700px] h-[700px] md:w-[800px] md:h-[800px] rounded-full border border-accent/10"
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute w-[900px] h-[900px] md:w-[1000px] md:h-[1000px] rounded-full border border-gold/5"
          />
        </div>
      )}

      {/* Content */}
      <motion.div
        style={{ opacity, scale }}
        className="relative container mx-auto px-4 lg:px-8 text-center z-10 py-10"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <motion.h1
              className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold max-w-4xl mx-auto mb-4 leading-tight"
            >
              {currentSlideData.title}
            </motion.h1>
            {currentSlideData.type === "image" && currentSlideData.subtitle && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
              >
                {currentSlideData.subtitle}
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Auto-typing Search Bar */}
        <AutoTypingSearchBar />

        {/* Slide Navigation Arrows */}
        <div className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={goToPrevSlide}
            className="p-3 md:p-4 rounded-full bg-card/80 backdrop-blur-sm border border-border hover:bg-card transition-colors"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </motion.button>
        </div>
        <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={goToNextSlide}
            className="p-3 md:p-4 rounded-full bg-card/80 backdrop-blur-sm border border-border hover:bg-card transition-colors"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </motion.button>
        </div>

        {/* Slide Indicators */}
        <div className="flex items-center justify-center gap-2 mt-12">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(index)}
              className={`relative h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "w-8 bg-accent"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            >
              {index === currentSlide && !isPaused && (
                <motion.div
                  className="absolute inset-0 bg-accent/50 rounded-full"
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 5, ease: "linear" }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Premium Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-8 md:gap-16 mt-12"
        >
          {[
            { value: "50K+", label: "Happy Customers", icon: "✨" },
            { value: "100K+", label: "Gifts Created", icon: "🎁" },
            { value: "4.9★", label: "Excellence Rating", icon: "👑" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center group"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-gradient-accent mb-2">
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

      {/* Premium Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-7 h-12 rounded-full border-2 border-gold/40 flex items-start justify-center p-2.5 backdrop-blur-sm"
        >
          <motion.div
            className="w-1.5 h-2.5 rounded-full bg-accent-gradient"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
};
