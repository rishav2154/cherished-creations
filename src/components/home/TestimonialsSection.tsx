import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Sarah M.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
    content: "Amazing quality! The mug I ordered for my mom's birthday was perfect. She loved it!",
    rating: 5,
    product: 'Photo Mug',
  },
  {
    id: 2,
    name: 'Michael C.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    content: "Great t-shirt quality and the print is vibrant. Family reunion shirts were a hit!",
    rating: 5,
    product: 'Custom Tee',
  },
  {
    id: 3,
    name: 'Emily R.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
    content: "The photo frames are beautifully crafted. Fast delivery too. Will order again!",
    rating: 5,
    product: 'Photo Frame',
  },
  {
    id: 4,
    name: 'David T.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face',
    content: "Custom phone case looks exactly like the preview. Excellent quality and fit.",
    rating: 5,
    product: 'Phone Cover',
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="py-5 sm:py-8 bg-card">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-accent/10 flex items-center justify-center">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-accent fill-accent" />
            </div>
            <div>
              <h2 className="text-sm sm:text-xl font-bold text-foreground">Customer Reviews</h2>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent rounded-md">
            <span className="text-sm font-bold text-accent-foreground">4.9</span>
            <Star className="w-3.5 h-3.5 fill-accent-foreground text-accent-foreground" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="p-3 sm:p-4 rounded-xl bg-background border border-border/50 hover:border-accent/20 transition-colors"
            >
              <div className="flex items-center gap-2.5 mb-2.5">
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-border"
                />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground">{t.product}</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-accent text-accent" />
                  ))}
                </div>
              </div>
              <p className="text-xs sm:text-sm text-foreground/75 line-clamp-2 leading-relaxed">"{t.content}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
