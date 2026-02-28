import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ExitIntentPopup = () => {
  const [visible, setVisible] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (shown) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 5 && !shown) {
        setVisible(true);
        setShown(true);
      }
    };

    // For mobile: show after 45s of inactivity
    let mobileTimer: ReturnType<typeof setTimeout>;
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      mobileTimer = setTimeout(() => {
        if (!shown) {
          setVisible(true);
          setShown(true);
        }
      }, 45000);
    }

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(mobileTimer);
    };
  }, [shown]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm"
          onClick={() => setVisible(false)}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="relative w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setVisible(false)} className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Emoji burst */}
            <div className="text-5xl mb-3">🎁</div>

            <h3 className="text-xl font-bold mb-1 text-foreground">Wait! Don't go empty-handed</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Here's an exclusive <span className="text-accent font-bold">20% OFF</span> just for you!
            </p>

            {/* Coupon code */}
            <div className="flex items-center justify-center gap-2 mb-5 p-3 bg-muted/50 rounded-xl border border-dashed border-accent/30">
              <Tag className="w-4 h-4 text-accent" />
              <span className="text-lg font-bold tracking-[0.2em] text-accent">STAY20</span>
            </div>

            <Link
              to="/shop"
              onClick={() => setVisible(false)}
              className="inline-flex items-center gap-2 w-full justify-center btn-luxury !py-3 !rounded-xl text-sm"
            >
              Claim & Shop Now <ArrowRight className="w-4 h-4" />
            </Link>

            <p className="text-[10px] text-muted-foreground mt-3">*Valid for the next 30 minutes only</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
