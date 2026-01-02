import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { useState, useEffect } from 'react';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Mitchell',
    role: 'Happy Customer',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    content: "I ordered a custom photo mug for my mom's birthday, and she absolutely loved it! The print quality is amazing, and it arrived faster than expected. Will definitely order again!",
    rating: 5,
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Verified Buyer',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    content: "The t-shirt customization tool is incredibly intuitive. I created matching shirts for our family reunion, and everyone was impressed. Great quality fabric too!",
    rating: 5,
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'Repeat Customer',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    content: "I've been using Giftoria for all my gift needs. The photo frames are beautifully crafted, and the customer service team is always helpful. 10/10 recommend!",
    rating: 5,
  },
  {
    id: 4,
    name: 'David Thompson',
    role: 'Anniversary Gift',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    content: "Created a custom phone case with our wedding photo for my wife. She tears up every time she looks at it. Giftoria made our anniversary truly special.",
    rating: 5,
  },
];

export const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-accent font-medium text-sm tracking-wider uppercase">
            Customer Stories
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mt-4">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Join thousands of happy customers who have turned their memories into beautiful gifts.
          </p>
        </motion.div>

        {/* Testimonials Carousel */}
        <div className="max-w-4xl mx-auto">
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
                transition={{ duration: 0.5 }}
                className="glass-card p-8 md:p-12"
              >
                {/* Quote Icon */}
                <Quote className="w-12 h-12 text-accent/30 mb-6" />

                {/* Content */}
                <p className="text-lg md:text-xl text-foreground/90 leading-relaxed mb-8">
                  "{testimonial.content}"
                </p>

                {/* Rating */}
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                  ))}
                </div>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-accent/30"
                  />
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Dots Navigation */}
          <div className="flex justify-center gap-3 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentIndex === index
                    ? 'bg-accent w-8'
                    : 'bg-muted hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-8 mt-16"
        >
          {['Trusted by 50K+ customers', '4.9★ Average Rating', '99% Satisfaction Rate'].map(
            (badge, index) => (
              <span
                key={index}
                className="px-6 py-3 rounded-full bg-muted/50 text-sm font-medium text-muted-foreground"
              >
                {badge}
              </span>
            )
          )}
        </motion.div>
      </div>
    </section>
  );
};
