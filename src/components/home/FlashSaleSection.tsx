import { useState, useEffect } from 'react';
import { Zap, ChevronRight, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/products/ProductCard';
import { Loader2 } from 'lucide-react';

const FlashCountdown = () => {
  const [time, setTime] = useState({ hours: 5, minutes: 23, seconds: 47 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; minutes = 59; seconds = 59; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="flex items-center gap-1.5">
      {[
        { label: 'HRS', val: pad(time.hours) },
        { label: 'MIN', val: pad(time.minutes) },
        { label: 'SEC', val: pad(time.seconds) },
      ].map((unit, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <div className="flex flex-col items-center">
            <span className="bg-foreground text-background text-sm sm:text-lg font-mono font-black px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg min-w-[36px] sm:min-w-[44px] text-center shadow-lg">
              {unit.val}
            </span>
            <span className="text-[8px] sm:text-[9px] text-muted-foreground mt-0.5 font-semibold tracking-wider">{unit.label}</span>
          </div>
          {i < 2 && <span className="text-foreground text-lg font-bold mb-3">:</span>}
        </span>
      ))}
    </div>
  );
};

export const FlashSaleSection = () => {
  const { data: allProducts = [], isLoading } = useProducts();

  // Get products with discounts (originalPrice exists)
  const flashProducts = allProducts
    .filter((p) => p.originalPrice && p.originalPrice > p.price)
    .slice(0, 6);

  // Fallback to first 6 if no discounted products
  const displayProducts = flashProducts.length > 0 ? flashProducts : allProducts.slice(0, 6);

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-destructive/10 via-card to-accent/10 border-b-2 border-destructive/20">
      {/* Animated background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-32 h-32 bg-destructive/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Flash icon */}
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-destructive flex items-center justify-center shadow-lg shadow-destructive/30 animate-pulse">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-destructive-foreground fill-destructive-foreground" />
              </div>
              <Flame className="absolute -top-1 -right-1 w-4 h-4 text-accent fill-accent animate-bounce" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-2xl font-black text-foreground tracking-tight">
                  ⚡ FLASH SALE
                </h2>
                <span className="bg-destructive text-destructive-foreground text-[9px] sm:text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest animate-pulse shadow-sm">
                  LIVE NOW
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                Grab before it's gone! Limited stock available.
              </p>
            </div>
          </div>

          {/* Timer + View All */}
          <div className="flex flex-col items-end gap-1.5">
            <FlashCountdown />
            <Link
              to="/shop"
              className="flex items-center gap-1 text-accent text-[10px] sm:text-xs font-semibold hover:gap-2 transition-all"
            >
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">🔥 68% Sold</span>
            <span className="text-[10px] sm:text-xs text-destructive font-semibold">Hurry! Few left</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full w-[68%] bg-gradient-to-r from-destructive via-accent to-destructive rounded-full animate-pulse" />
          </div>
        </div>

        {/* Products */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-7 h-7 animate-spin text-accent" />
          </div>
        ) : displayProducts.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">No flash sale products right now.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2.5 sm:gap-3">
            {displayProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
