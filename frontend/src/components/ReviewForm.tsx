import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface ReviewFormProps {
  productId: string;
  productName: string;
}

export const ReviewForm = ({ productId, productName }: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating.",
        variant: "destructive"
      });
      return;
    }

    if (!title.trim() || !comment.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    // Mock submission
    toast({
      title: "Review submitted!",
      description: "Thank you for your feedback.",
    });

    // Reset form
    setRating(0);
    setTitle('');
    setComment('');
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold text-foreground mb-4">Write a Review</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="rating" className="mb-2 block">Your Rating</Label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-primary text-primary'
                      : 'text-muted-foreground'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="title">Review Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience"
            maxLength={100}
          />
        </div>

        <div>
          <Label htmlFor="comment">Your Review</Label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={`Share your thoughts about ${productName}`}
            rows={5}
            maxLength={1000}
          />
          <p className="text-sm text-muted-foreground mt-1">
            {comment.length}/1000 characters
          </p>
        </div>

        <Button type="submit" className="w-full">
          Submit Review
        </Button>
      </form>
    </Card>
  );
};
