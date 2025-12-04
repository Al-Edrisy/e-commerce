import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, Grid3x3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import { Product } from '@/types';

const Wishlist = () => {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleRemove = (product: Product) => {
    removeFromWishlist(product.id);
    toast({
      title: "Removed from wishlist",
      description: `${product.name} has been removed from your wishlist.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">My Wishlist</h1>
            <p className="text-muted-foreground">
              {items.length === 0 
                ? 'Your wishlist is empty' 
                : `${items.length} ${items.length === 1 ? 'item' : 'items'} saved for later`}
            </p>
          </div>
          
          {items.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <Card className="p-12 text-center">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-2xl font-semibold text-foreground mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-muted-foreground mb-6">
              Start adding products you love to your wishlist
            </p>
            <Button asChild>
              <Link to="/products">
                Browse Products
              </Link>
            </Button>
          </Card>
        ) : (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'flex flex-col gap-4'
          }>
            {items.map(product => (
              viewMode === 'grid' ? (
                <Card key={product.id} className="overflow-hidden group">
                  <Link to={`/product/${product.slug}`} className="block">
                    <div className="aspect-square overflow-hidden bg-muted">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  </Link>
                  <div className="p-4 space-y-3">
                    <Link to={`/product/${product.slug}`}>
                      <h3 className="font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-foreground">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.stock > 0 ? (
                        <Badge variant="secondary" className="text-xs">In Stock</Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1"
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemove(product)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card key={product.id} className="p-4">
                  <div className="flex gap-4">
                    <Link to={`/product/${product.slug}`} className="shrink-0">
                      <div className="w-32 h-32 overflow-hidden rounded-lg bg-muted">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0 space-y-2">
                      <Link to={`/product/${product.slug}`}>
                        <h3 className="text-lg font-semibold text-foreground hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <div className="space-y-1">
                          <p className="text-2xl font-bold text-foreground">
                            ${product.price.toFixed(2)}
                          </p>
                          {product.stock > 0 ? (
                            <p className="text-sm text-primary">
                              In Stock ({product.stock} available)
                            </p>
                          ) : (
                            <p className="text-sm text-destructive">Out of Stock</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleAddToCart(product)}
                            disabled={product.stock === 0}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add to Cart
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleRemove(product)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
