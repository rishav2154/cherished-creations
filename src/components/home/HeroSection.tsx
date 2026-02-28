import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

const heroSlides = [
  {
    id: "slide1",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1920&q=80",
    title: "Up to 60% Off",
    subtitle: "Premium Custom T-Shirts",
    cta: "Shop Now",
    link: "/shop?category=tshirts",
    bg: "from-blue-900/80 to-blue-700/60",
  },
  {
    id: "slide2",
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=1920&q=80",
    title: "Starting ₹299",
    subtitle: "Designer Photo Mugs",
    cta: "Order Now",
    link: "/shop?category=mugs",
    bg: "from-amber-900/80 to-amber-700/60",
  },
  {
    id: "slide3",
    image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=1920&q=80",
    title: "New Arrivals",
    subtitle: "Custom Phone Covers",
    cta: "Explore",
    link: "/shop?category=phone-covers",
    bg: "from-purple-900/80 to-purple-700/60",
  },
  {
    id: "slide4",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1920&q=80",
    title: "Flat 40% Off",
    subtitle: "Elegant Photo Frames",
    cta: "Buy Now",
    link: "/shop?category=frames",
    bg: "from-emerald-900/80 to-emerald-700/60",
  },
  {
    id: "slide5",
    image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=1920&q=80",
    title: "Best Value Deals",
    subtitle: "Gift Combos from ₹799",
    cta: "Shop Combos",
    link: "/shop?category=combos",
    bg: "from-rose-900/80 to-rose-700/60",
  },
];

export const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const goToPrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 8000);
  }, []);

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 8000);
  }, []);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (info.offset.x > 50) goToPrev();
      else if (info.offset.x < -50) goToNext();
    },
    [goToPrev, goToNext]
  );

  const slide = heroSlides[currentSlide];

  return (
    <section className="relative w-full pt-14 sm:pt-16 md:pt-20">
      {/* Main Banner */}
      <motion.div
        className="relative w-full h-[180px] sm:h-[280px] md:h-[360px] lg:h-[420px] overflow-hidden"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            <img
              src={slide.image}
              alt={slide.subtitle}
              className="w-full h-full object-cover"
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.bg}`} />
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-4 sm:px-8 lg:px-16">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <p className="text-white/80 text-xs sm:text-sm font-medium mb-1">{slide.subtitle}</p>
                  <h2 className="text-white text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">
                    {slide.title}
                  </h2>
                  <Link
                    to={slide.link}
                    className="inline-block px-5 py-2 sm:px-8 sm:py-3 bg-accent text-accent-foreground font-semibold text-xs sm:text-sm rounded-lg hover:opacity-90 transition-opacity"
                  >
                    {slide.cta}
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Arrows */}
        <button
          onClick={goToPrev}
          className="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-card/70 hover:bg-card/90 border border-border/50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-card/70 hover:bg-card/90 border border-border/50 transition-colors"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentSlide(i);
                setIsPaused(true);
                setTimeout(() => setIsPaused(false), 8000);
              }}
              className={`h-1.5 rounded-full transition-all ${
                i === currentSlide ? "w-6 bg-accent" : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
};
