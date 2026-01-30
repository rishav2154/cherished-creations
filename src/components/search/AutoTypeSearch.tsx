import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

interface AutoTypeSearchProps {
  onClick: () => void;
}

const searchKeywords = [
  "Custom T-Shirts",
  "Photo Mugs",
  "Personalized Gifts",
  "Phone Covers",
  "Photo Frames",
  "Gift Combos",
  "Premium Posters",
  "Birthday Gifts"
];

export const AutoTypeSearch = ({ onClick }: AutoTypeSearchProps) => {
  const [currentKeywordIndex, setCurrentKeywordIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentKeyword = searchKeywords[currentKeywordIndex];
    let timeout: NodeJS.Timeout;

    if (isDeleting) {
      if (displayedText === '') {
        setIsDeleting(false);
        setCurrentKeywordIndex((prev) => (prev + 1) % searchKeywords.length);
      } else {
        timeout = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, 30);
      }
    } else {
      if (displayedText === currentKeyword) {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 2000);
      } else {
        timeout = setTimeout(() => {
          setDisplayedText(currentKeyword.slice(0, displayedText.length + 1));
        }, 80);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, currentKeywordIndex]);

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full max-w-2xl mx-auto flex items-center gap-4 px-6 py-4 rounded-2xl bg-card border border-border shadow-lg hover:border-accent/50 transition-all cursor-pointer group"
    >
      <Search className="w-6 h-6 text-muted-foreground group-hover:text-accent transition-colors flex-shrink-0" />
      <div className="flex-1 text-left">
        <span className="text-muted-foreground">Search for </span>
        <span className="text-foreground font-medium">
          {displayedText}
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
            className="inline-block w-0.5 h-5 bg-accent ml-0.5 align-middle"
          />
        </span>
      </div>
      <kbd className="hidden sm:inline-flex h-8 items-center gap-1 rounded-md border border-border bg-muted px-2 text-xs text-muted-foreground">
        <span className="text-lg">⌘</span>K
      </kbd>
    </motion.button>
  );
};
