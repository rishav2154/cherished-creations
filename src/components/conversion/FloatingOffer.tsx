import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Copy, Check } from 'lucide-react';

export const FloatingOffer = () => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    // Show after user has scrolled 40% of page
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent > 35 && !dismissed) {
        setVisible(true);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dismissed]);

  const handleCopy = () => {
    navigator.clipboard.writeText('FIRST10');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDismiss = () => {
    setDismissed(true);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 80, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed bottom-20 md:bottom-6 right-3 md:right-6 z-50 max-w-[260px]"
        >
          <div className="relative bg-card border border-accent/20 rounded-2xl p-4 shadow-2xl shadow-accent/10 overflow-hidden">
            {/* Glow */}
            <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-accent/20 blur-2xl" />
            
            <button onClick={handleDismiss} className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors">
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>

            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
                <Gift className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">First Order?</p>
                <p className="text-[10px] text-muted-foreground">Get 10% off!</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 bg-muted/50 rounded-lg border border-dashed border-accent/30">
                <span className="text-sm font-bold tracking-widest text-accent">FIRST10</span>
              </div>
              <button
                onClick={handleCopy}
                className="px-3 py-2 bg-accent text-accent-foreground rounded-lg text-xs font-semibold flex items-center gap-1 hover:brightness-110 transition-all"
              >
                {copied ? <><Check className="w-3 h-3" /> Done</> : <><Copy className="w-3 h-3" /> Copy</>}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
