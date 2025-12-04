import { Star, ThumbsUp } from 'lucide-react';
import { Review } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ReviewCardProps {
  review: Review;
}

export const ReviewCard = ({ review }: ReviewCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <Card className="p-6">
      <div className="flex gap-4">
        <Avatar>
          <AvatarFallback className="bg-primary text-primary-foreground">
            {review.user_name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-foreground">{review.user_name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating
                          ? 'fill-primary text-primary'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatDate(review.created_at)}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h5 className="font-medium text-foreground mb-1">{review.title}</h5>
            <p className="text-muted-foreground">{review.comment}</p>
          </div>
          
          <Button variant="ghost" size="sm" className="gap-2">
            <ThumbsUp className="h-4 w-4" />
            Helpful ({review.helpful_count})
          </Button>
        </div>
      </div>
    </Card>
  );
};
