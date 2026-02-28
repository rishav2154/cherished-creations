import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, MapPin } from 'lucide-react';

const names = [
  'Priya', 'Rahul', 'Sneha', 'Amit', 'Ananya', 'Vikram', 'Riya', 'Karan',
  'Neha', 'Rohit', 'Pooja', 'Arjun', 'Divya', 'Siddharth', 'Meera'
];

const cities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata',
  'Jaipur', 'Ahmedabad', 'Lucknow', 'Chandigarh', 'Kochi'
];

const products = [
  'Custom T-Shirt', 'Photo Mug', 'Phone Cover', 'Photo Frame', 'Gift Combo', 'Poster'
];

const timeAgo = ['2 min', '5 min', '8 min', '12 min', '15 min', '20 min', '25 min'];

const getRandomItem = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

export const SocialProofToast = () => {
  const [visible, setVisible] = useState(false);
  const [notification, setNotification] = useState({ name: '', city: '', product: '', time: '' });

  useEffect(() => {
    const showNotification = () => {
      setNotification({
        name: getRandomItem(names),
        city: getRandomItem(cities),
        product: getRandomItem(products),
        time: getRandomItem(timeAgo),
      });
      setVisible(true);
      setTimeout(() => setVisible(false), 4000);
    };

    // First one after 8s
    const firstTimeout = setTimeout(showNotification, 8000);
    // Then every 15-25s
    const interval = setInterval(showNotification, 15000 + Math.random() * 10000);

    return () => {
      clearTimeout(firstTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: -100, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed bottom-20 md:bottom-6 left-3 md:left-6 z-50 max-w-[280px] md:max-w-xs"
        >
          <div className="bg-card/95 backdrop-blur-xl border border-border/60 rounded-xl p-3 shadow-2xl">
            <div className="flex items-start gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="w-4 h-4 text-accent" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground leading-tight">
                  {notification.name} purchased
                </p>
                <p className="text-[11px] text-accent font-medium truncate">{notification.product}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <MapPin className="w-2.5 h-2.5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{notification.city} · {notification.time} ago</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
