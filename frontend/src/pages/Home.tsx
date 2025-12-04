import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/ProductCard';
import { categories } from '@/data/mockData';
import { useProducts } from '@/contexts/ProductsContext';
import { Card, CardContent } from '@/components/ui/card';
import heroBanner from '@/assets/hero-banner.jpg';

const Home = () => {
  const { products } = useProducts();
  const featuredProducts = products.filter(p => p.is_featured);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-background z-10" />
        <div className="absolute inset-0 opacity-10">
          <img
            src={heroBanner}
            alt="Hero banner"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-20 container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 animate-fade-in">
              Discover Amazing Products
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Shop the latest trends and timeless classics. Quality products, exceptional service, delivered to your door.
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Link to="/products">
                <Button size="lg" className="gap-2">
                  Shop Now
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/categories">
                <Button size="lg" variant="outline">
                  Browse Categories
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Featured Products</h2>
            <p className="text-muted-foreground">Handpicked favorites just for you</p>
          </div>
          <Link to="/products">
            <Button variant="ghost" className="gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-16 bg-muted/30">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Shop by Category</h2>
          <p className="text-muted-foreground">Explore our diverse product collections</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map(category => (
            <Link key={category.id} to={`/products?category=${category.slug}`}>
              <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="aspect-square overflow-hidden bg-muted">
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-xl text-foreground group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-primary text-primary-foreground rounded-2xl p-12 md:p-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Get 20% Off Your First Order
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Sign up for our newsletter and get exclusive access to new arrivals, special offers, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-4 py-3 rounded-lg text-foreground flex-1"
            />
            <Button size="lg" variant="secondary">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
