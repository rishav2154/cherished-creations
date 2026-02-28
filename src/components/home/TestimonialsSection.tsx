import { Star } from 'lucide-react';
import { useState, useEffect } from 'react';

const testimonials = [
  {
    id: 1,
    name: 'Sarah M.',
    content: "Amazing quality! The mug I ordered for my mom's birthday was perfect. She loved it!",
    rating: 5,
  },
  {
    id: 2,
    name: 'Michael C.',
    content: "Great t-shirt quality and the print is vibrant. Family reunion shirts were a hit!",
    rating: 5,
  },
  {
    id: 3,
    name: 'Emily R.',
    content: "The photo frames are beautifully crafted. Fast delivery too. Will order again!",
    rating: 5,
  },
  {
    id: 4,
    name: 'David T.',
    content: "Custom phone case looks exactly like the preview. Excellent quality and fit.",
    rating: 5,
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="py-4 sm:py-6 bg-background">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm sm:text-lg font-bold text-foreground">Customer Reviews</h2>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-accent text-accent" />
            <span className="text-sm font-bold text-foreground">4.9</span>
            <span className="text-xs text-muted-foreground">(2.5K+ reviews)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="p-3 sm:p-4 rounded-lg bg-card border border-border/50"
            >
              <div className="flex gap-0.5 mb-2">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-foreground/80 mb-2 line-clamp-3">"{t.content}"</p>
              <p className="text-xs font-medium text-muted-foreground">— {t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
