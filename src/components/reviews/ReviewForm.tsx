import { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiPost } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted: () => void;
}

export const ReviewForm = ({ productId, onReviewSubmitted }: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { toast.error('Please select a rating'); return; }
    if (content.trim().length < 10) { toast.error('Review must be at least 10 characters'); return; }
    if (!user) { toast.error('Please sign in'); return; }

    setIsSubmitting(true);
    try {
      await apiPost(`/api/products/${productId}/reviews`, { rating, comment: content.trim() }, true);
      toast.success('Review submitted!');
      setRating(0); setTitle(''); setContent('');
      onReviewSubmitted();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 glass-card rounded-2xl space-y-4">
      <h3 className="text-lg font-semibold">Write a Review</h3>
      <div>
        <label className="text-sm text-muted-foreground mb-2 block">Your Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} type="button" onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(star)} className="p-1 transition-transform hover:scale-110">
              <Star className={`w-6 h-6 ${star <= (hoverRating || rating) ? 'fill-accent text-accent' : 'text-muted'}`} />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm text-muted-foreground mb-2 block">Your Review</label>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Share your experience..." rows={4} className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-accent focus:outline-none transition-colors resize-none" maxLength={1000} />
        <span className="text-xs text-muted-foreground">{content.length}/1000</span>
      </div>
      <motion.button type="submit" disabled={isSubmitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full btn-luxury flex items-center justify-center gap-2 disabled:opacity-50">
        <Send className="w-4 h-4" />{isSubmitting ? 'Submitting...' : 'Submit Review'}
      </motion.button>
    </form>
  );
};
