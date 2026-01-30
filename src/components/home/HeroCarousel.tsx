import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  image: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: "Custom Photo Mugs",
    subtitle: "Start your morning with memories",
    buttonText: "Shop Mugs",
    buttonLink: "/shop?category=mugs",
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=1920&q=80"
  },
  {
    id: 2,
    title: "Personalized T-Shirts",
    subtitle: "Wear your creativity with pride",
    buttonText: "Design Now",
    buttonLink: "/customize",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1920&q=80"
  },
  {
    id: 3,
    title: "Photo Frames",
    subtitle: "Preserve your precious moments",
    buttonText: "Explore Frames",
    buttonLink: "/shop?category=frames",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=1920&q=80"
  },
  {
    id: 4,
    title: "Phone Covers",
    subtitle: "Protect with personal style",
    buttonText: "Create Cover",
    buttonLink: "/customize-phone-cover",
    image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=1920&q=80"
  },
  {
    id: 5,
    title: "Gift Combos",
    subtitle: "Perfect presents for loved ones",
    buttonText: "View Combos",
    buttonLink: "/shop?category=combos",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1920&q=80"
  },
  {
    id: 6,
    title: "Premium Posters",
    subtitle: "Art that speaks your story",
    buttonText: "Shop Posters",
    buttonLink: "/shop?category=posters",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1920&q=80"
  }
];

export const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 5 seconds
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  return (
    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden rounded-3xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
          >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative h-full flex items-center px-8 md:px-16">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="max-w-lg"
            >
              <motion.h2 
                className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                {slides[currentSlide].title}
              </motion.h2>
              <motion.p 
                className="text-lg md:text-xl text-muted-foreground mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                {slides[currentSlide].subtitle}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <Link to={slides[currentSlide].buttonLink}>
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    {slides[currentSlide].buttonText}
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={() => { prevSlide(); setIsAutoPlaying(false); setTimeout(() => setIsAutoPlaying(true), 5000); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-background/50 backdrop-blur-sm border border-border hover:bg-background/80 transition-all z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={() => { nextSlide(); setIsAutoPlaying(false); setTimeout(() => setIsAutoPlaying(true), 5000); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-background/50 backdrop-blur-sm border border-border hover:bg-background/80 transition-all z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'w-8 bg-accent' 
                : 'w-2 bg-foreground/30 hover:bg-foreground/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-foreground/10">
        <motion.div
          key={currentSlide}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 4, ease: "linear" }}
          className="h-full bg-accent"
        />
      </div>
    </div>
  );
};
