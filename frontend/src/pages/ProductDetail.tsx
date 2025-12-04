import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Truck, Shield, ArrowLeft, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { reviews } from '@/data/mockData';
import { useProducts } from '@/contexts/ProductsContext';
import { ProductCard } from '@/components/ProductCard';
import { ReviewCard } from '@/components/ReviewCard';
import { ReviewForm } from '@/components/ReviewForm';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from '@/hooks/use-toast';

const ProductDetail = () => {
  const { slug } = useParams();
  const { products } = useProducts();
  const product = products.find(p => p.slug === slug);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Product not found</h2>
          <Link to="/products">
            <Button className="mt-4">Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const relatedProducts = products
    .filter(p => p.category_id === product.category_id && p.id !== product.id)
    .slice(0, 4);

  const productReviews = reviews.filter(r => r.product_id === product.id);
  const averageRating = productReviews.length > 0
    ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
    : product.rating;

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      toast({
        title: "Added to cart",
        description: `${quantity} × ${product.name} added to your cart.`,
      });
    }
  };

  const handleWishlist = () => {
    if (!product) return;

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast({
        title: "Removed from wishlist",
        description: `${product.name} removed from your wishlist.`,
      });
    } else {
      addToWishlist(product);
      toast({
        title: "Added to wishlist",
        description: `${product.name} added to your wishlist.`,
      });
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary transition-colors">
            Products
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        {/* Product Details */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[0, 1, 2, 3].map(i => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`aspect-square overflow-hidden rounded-lg bg-muted cursor-pointer transition-all ${selectedImage === i
                      ? 'ring-2 ring-primary'
                      : 'hover:opacity-75'
                    }`}
                >
                  <img
                    src={product.image_url}
                    alt={`${product.name} view ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-4">{product.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < Math.floor(product.rating)
                          ? 'fill-primary text-primary'
                          : 'text-muted'
                        }`}
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">
                    {averageRating.toFixed(1)} ({productReviews.length} reviews)
                  </span>
                </div>
                {product.is_featured && (
                  <Badge variant="secondary">Featured</Badge>
                )}
              </div>
              <p className="text-3xl font-bold text-foreground mb-2">
                ${product.price.toFixed(2)}
              </p>
              {product.stock > 0 ? (
                <p className="text-sm text-primary">In Stock ({product.stock} available)</p>
              ) : (
                <p className="text-sm text-destructive">Out of Stock</p>
              )}
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-foreground mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {product.tags.map(tag => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>

            <Separator />

            {/* Quantity Selector */}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-foreground">Quantity:</span>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium text-foreground">{quantity}</span>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={increaseQuantity}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full"
                disabled={product.stock === 0}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full"
                onClick={handleWishlist}
              >
                <Heart className={`mr-2 h-5 w-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                {isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </Button>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Truck className="h-5 w-5" />
                <span>Free shipping on orders over $50</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Shield className="h-5 w-5" />
                <span>2-year warranty included</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <ArrowLeft className="h-5 w-5" />
                <span>30-day return policy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="my-16">
          <Tabs defaultValue="reviews" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="reviews">Reviews ({productReviews.length})</TabsTrigger>
              <TabsTrigger value="write">Write a Review</TabsTrigger>
            </TabsList>

            <TabsContent value="reviews" className="mt-8">
              <div className="space-y-6">
                {productReviews.length > 0 ? (
                  <>
                    <div className="flex items-center gap-6 mb-8">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-foreground">{averageRating.toFixed(1)}</div>
                        <div className="flex gap-0.5 mt-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${i < Math.floor(averageRating)
                                  ? 'fill-primary text-primary'
                                  : 'text-muted-foreground'
                                }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Based on {productReviews.length} reviews
                        </p>
                      </div>
                      <Separator orientation="vertical" className="h-20" />
                      <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map(star => {
                          const count = productReviews.filter(r => Math.floor(r.rating) === star).length;
                          const percentage = (count / productReviews.length) * 100;
                          return (
                            <div key={star} className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground w-12">{star} star</span>
                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground w-12">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {productReviews.map(review => (
                        <ReviewCard key={review.id} review={review} />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="write" className="mt-8">
              <ReviewForm productId={product.id} productName={product.name} />
            </TabsContent>
          </Tabs>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold text-foreground mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
