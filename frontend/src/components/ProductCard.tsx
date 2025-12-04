import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addToCart(product, 1);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link to={`/product/${product.slug}`}>
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>
      <CardContent className="p-4">
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mt-2">
          <Star className="h-4 w-4 fill-primary text-primary" />
          <span className="text-sm text-muted-foreground">{product.rating}</span>
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-2xl font-bold text-foreground">
            ${product.price.toFixed(2)}
          </span>
        </div>
        {product.stock < 10 && product.stock > 0 && (
          <p className="text-xs text-destructive mt-2">Only {product.stock} left in stock</p>
        )}
        {product.stock === 0 && (
          <p className="text-xs text-destructive mt-2">Out of stock</p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          disabled={product.stock === 0}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};
