import { Star, ThumbsUp, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ReviewCardProps {
  review: {
    id: string;
    user_name: string;
    rating: number;
    title: string | null;
    content: string;
    verified_purchase: boolean;
    helpful_count: number;
    created_at: string;
  };
  onHelpful?: (reviewId: string) => void;
}

export const ReviewCard = ({ review, onHelpful }: ReviewCardProps) => {
  return (
    <div className="p-6 glass-card rounded-2xl">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
            <User className="w-5 h-5 text-accent" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{review.user_name}</span>
              {review.verified_purchase && (
                <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">
                  Verified Purchase
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < review.rating ? 'fill-accent text-accent' : 'text-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {review.title && (
        <h4 className="font-semibold mb-2">{review.title}</h4>
      )}
      
      <p className="text-muted-foreground mb-4">{review.content}</p>

      {onHelpful && (
        <button
          onClick={() => onHelpful(review.id)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ThumbsUp className="w-4 h-4" />
          Helpful ({review.helpful_count})
        </button>
      )}
    </div>
  );
};
