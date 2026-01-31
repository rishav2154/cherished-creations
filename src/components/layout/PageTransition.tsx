import { motion } from 'framer-motion';
import { ReactNode, useEffect, useState } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

export const PageTransition = ({ children }: PageTransitionProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Ensure content is visible immediately
    setIsVisible(true);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      style={{ 
        minHeight: '100vh',
        visibility: isVisible ? 'visible' : 'hidden'
      }}
    >
      {children}
    </motion.div>
  );
};
