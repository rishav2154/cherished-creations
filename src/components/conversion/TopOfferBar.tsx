import { useState, useEffect } from 'react';
import { X, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TopOfferBar = () => {
  const [visible, setVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ h: 2, m: 45, s: 30 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { h, m, s } = prev;
        s -= 1;
        if (s < 0) { s = 59; m -= 1; }
        if (m < 0) { m = 59; h -= 1; }
        if (h < 0) return { h: 0, m: 0, s: 0 };
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!visible) return null;

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-accent text-accent-foreground">
      <div className="container mx-auto px-3 flex items-center justify-center gap-2 sm:gap-4 py-1.5 sm:py-2 text-[10px] sm:text-xs relative">
        <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-pulse" />
        <span className="font-semibold">
          Flash Sale! Extra 15% OFF
        </span>
        <div className="flex items-center gap-1 font-mono font-bold">
          <span className="bg-accent-foreground/20 px-1.5 py-0.5 rounded">{pad(timeLeft.h)}</span>
          <span>:</span>
          <span className="bg-accent-foreground/20 px-1.5 py-0.5 rounded">{pad(timeLeft.m)}</span>
          <span>:</span>
          <span className="bg-accent-foreground/20 px-1.5 py-0.5 rounded">{pad(timeLeft.s)}</span>
        </div>
        <Link to="/shop" className="hidden sm:inline-flex px-3 py-1 bg-accent-foreground/20 rounded-full font-semibold hover:bg-accent-foreground/30 transition-colors">
          Shop Now
        </Link>
        <button onClick={() => setVisible(false)} className="absolute right-2 p-1 hover:bg-accent-foreground/20 rounded-full transition-colors">
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
