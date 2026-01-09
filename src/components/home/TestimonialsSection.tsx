import { motion } from 'framer-motion';
import { Star, Quote, Crown, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Mitchell',
    role: 'Loyal Customer',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    content: "I ordered a custom photo mug for my mom's birthday, and she was absolutely moved to tears! The print quality is museum-grade, and it arrived faster than expected. Giftoria has become my go-to for all special occasions.",
    rating: 5,
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Premium Member',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    content: "The t-shirt customization experience is phenomenal. I designed matching shirts for our family reunion, and everyone was impressed by the vibrant colors and luxurious fabric quality!",
    rating: 5,
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'VIP Customer',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    content: "I've been using Giftoria for all my gifting needs. The photo frames are masterfully crafted, and the concierge service is always exceptional. An absolute 10/10 experience!",
    rating: 5,
  },
  {
    id: 4,
    name: 'David Thompson',
    role: 'Anniversary Gift',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    content: "I created a custom phone case with our wedding photo for my wife. She tears up every time she looks at it. Giftoria transformed our anniversary into an unforgettable celebration.",
    rating: 5,
  },
];

export const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-32 relative overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
      
      {/* Gold Glow */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.08, 0.03] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gold rounded-full blur-3xl"
      />

      {/* Decorative Lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

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
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium text-gold tracking-wider uppercase">
              Customer Stories
            </span>
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-bold mt-4">
            <span className="text-foreground">Voices of </span>
            <span className="bg-gradient-to-r from-gold via-accent to-gold bg-clip-text text-transparent">
              Delight
            </span>
          </h2>
          <p className="text-muted-foreground mt-6 max-w-2xl mx-auto text-lg leading-relaxed">
            Join thousands of delighted customers who have transformed their memories into cherished keepsakes.
          </p>
        </motion.div>

        {/* Testimonials Carousel */}
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{
                  opacity: currentIndex === index ? 1 : 0,
                  x: currentIndex === index ? 0 : 50,
                  display: currentIndex === index ? 'block' : 'none',
                }}
                transition={{ duration: 0.6 }}
                className="relative p-10 md:p-14 rounded-3xl bg-gradient-to-b from-muted/50 to-muted/20 border border-gold/20"
              >
                {/* Premium Corner Accents */}
                <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-gold/30 rounded-tl-2xl" />
                <div className="absolute top-4 right-4 w-12 h-12 border-r-2 border-t-2 border-gold/30 rounded-tr-2xl" />
                <div className="absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-2 border-gold/30 rounded-bl-2xl" />
                <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-gold/30 rounded-br-2xl" />

                {/* Quote Icon */}
                <Quote className="w-16 h-16 text-gold/20 mb-8" />

                {/* Content */}
                <p className="text-xl md:text-2xl text-foreground/90 leading-relaxed mb-10 font-light italic">
                  "{testimonial.content}"
                </p>

                {/* Rating */}
                <div className="flex gap-1.5 mb-8">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Star className="w-6 h-6 fill-gold text-gold" />
                    </motion.div>
                  ))}
                </div>

                {/* Author */}
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="absolute inset-0 rounded-full border-2 border-gold/50" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gold flex items-center justify-center">
                      <Crown className="w-3 h-3 text-background" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-foreground">{testimonial.name}</h4>
                    <p className="text-gold font-medium">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Premium Dots Navigation */}
          <div className="flex justify-center gap-4 mt-10">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`relative h-3 rounded-full transition-all duration-500 ${
                  currentIndex === index
                    ? 'w-12 bg-gradient-to-r from-gold to-accent'
                    : 'w-3 bg-muted hover:bg-gold/50'
                }`}
              >
                {currentIndex === index && (
                  <motion.div
                    layoutId="activeDot"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-gold to-accent"
                    style={{ boxShadow: '0 0 20px hsl(43 74% 49% / 0.5)' }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-6 mt-20"
        >
          {[
            { label: '50K+ Happy Customers', icon: '👑' },
            { label: '4.9★ Excellence Rating', icon: '⭐' },
            { label: '99% Satisfaction', icon: '💎' },
          ].map((badge, index) => (
            <motion.span
              key={index}
              whileHover={{ scale: 1.05, y: -2 }}
              className="px-8 py-4 rounded-full bg-gold/10 border border-gold/20 text-sm font-semibold text-foreground flex items-center gap-3"
            >
              <span>{badge.icon}</span>
              <span>{badge.label}</span>
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
