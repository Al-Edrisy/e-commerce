import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, Grid3x3, List, Star, X, Search, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductCard } from '@/components/ProductCard';
import { ProductQuickView } from '@/components/ProductQuickView';
import { categories } from '@/data/mockData';
import { useProducts } from '@/contexts/ProductsContext';
import { Product } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const Products = () => {
  const { products } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRanges, setPriceRanges] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('featured');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const itemsPerPage = 9;

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  // Update search query when URL params change
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
  }, [searchParams]);

  // Filter products based on search query
  const filterProducts = () => {
    return products.filter(product => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesDescription = product.description.toLowerCase().includes(query);
        const matchesTags = product.tags.some(tag => tag.toLowerCase().includes(query));

        // Match category name
        const productCategory = categories.find(c => c.id === product.category_id);
        const matchesCategory = productCategory?.name.toLowerCase().includes(query);

        if (!matchesName && !matchesDescription && !matchesTags && !matchesCategory) {
          return false;
        }
      }

      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(product.category_id)) {
        return false;
      }

      // Price range filter
      if (priceRanges.length > 0) {
        const matchesPrice = priceRanges.some(range => {
          if (range === 'under-50') return product.price < 50;
          if (range === '50-100') return product.price >= 50 && product.price <= 100;
          if (range === '100-200') return product.price >= 100 && product.price <= 200;
          if (range === 'over-200') return product.price > 200;
          return false;
        });
        if (!matchesPrice) return false;
      }

      return true;
    });
  };

  // Sort filtered products
  const sortProducts = (filtered: typeof products) => {
    const sorted = [...filtered];

    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'featured':
      default:
        return sorted.sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
    }
  };

  const filteredProducts = filterProducts();
  const sortedProducts = sortProducts(filteredProducts);

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategories, priceRanges, sortBy]);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handlePriceRangeToggle = (range: string) => {
    setPriceRanges(prev =>
      prev.includes(range)
        ? prev.filter(r => r !== range)
        : [...prev, range]
    );
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchParams({});
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setPriceRanges([]);
    setSortBy('featured');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">All Products</h1>
          <p className="text-muted-foreground">
            {searchQuery
              ? `Search results for "${searchQuery}" - ${filteredProducts.length} ${filteredProducts.length === 1 ? 'product' : 'products'} found`
              : 'Browse our complete collection'}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products by name, description, tags, or category..."
              className="pl-10 pr-10"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value) {
                  setSearchParams({ search: e.target.value });
                } else {
                  setSearchParams({});
                }
              }}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Active Filters */}
        {(searchQuery || selectedCategories.length > 0 || priceRanges.length > 0) && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {searchQuery && (
              <Badge variant="secondary" className="gap-2">
                Search: {searchQuery}
                <button onClick={clearSearch} className="hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedCategories.map(catId => {
              const cat = categories.find(c => c.id === catId);
              return cat ? (
                <Badge key={catId} variant="secondary" className="gap-2">
                  {cat.name}
                  <button onClick={() => handleCategoryToggle(catId)} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ) : null;
            })}
            {priceRanges.map(range => (
              <Badge key={range} variant="secondary" className="gap-2">
                {range === 'under-50' && 'Under $50'}
                {range === '50-100' && '$50-$100'}
                {range === '100-200' && '$100-$200'}
                {range === 'over-200' && 'Over $200'}
                <button onClick={() => handlePriceRangeToggle(range)} className="hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear all
            </Button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className={`lg:w-64 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden"
                >
                  Close
                </Button>
              </div>

              {/* Category Filter */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-foreground">Categories</h4>
                {categories.map(category => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={category.slug}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={() => handleCategoryToggle(category.id)}
                    />
                    <Label
                      htmlFor={category.slug}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>

              {/* Price Filter */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-foreground">Price Range</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="under-50"
                      checked={priceRanges.includes('under-50')}
                      onCheckedChange={() => handlePriceRangeToggle('under-50')}
                    />
                    <Label htmlFor="under-50" className="text-sm font-normal cursor-pointer">
                      Under $50
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="50-100"
                      checked={priceRanges.includes('50-100')}
                      onCheckedChange={() => handlePriceRangeToggle('50-100')}
                    />
                    <Label htmlFor="50-100" className="text-sm font-normal cursor-pointer">
                      $50 - $100
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="100-200"
                      checked={priceRanges.includes('100-200')}
                      onCheckedChange={() => handlePriceRangeToggle('100-200')}
                    />
                    <Label htmlFor="100-200" className="text-sm font-normal cursor-pointer">
                      $100 - $200
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="over-200"
                      checked={priceRanges.includes('over-200')}
                      onCheckedChange={() => handlePriceRangeToggle('over-200')}
                    />
                    <Label htmlFor="over-200" className="text-sm font-normal cursor-pointer">
                      Over $200
                    </Label>
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-foreground">Rating</h4>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map(rating => (
                    <div key={rating} className="flex items-center space-x-2">
                      <Checkbox id={`rating-${rating}`} />
                      <Label
                        htmlFor={`rating-${rating}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {rating}+ Stars
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <p className="text-sm text-muted-foreground">
                Showing {paginatedProducts.length} of {sortedProducts.length} products
              </p>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <div className="flex items-center gap-1 border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                    className="h-9 w-9 rounded-r-none"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                    className="h-9 w-9 rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* No Results Message */}
            {paginatedProducts.length === 0 && (
              <Card className="p-12 text-center">
                <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-2xl font-semibold text-foreground mb-2">
                  No products found
                </h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search or filters to find what you're looking for
                </p>
                <Button onClick={clearAllFilters}>
                  Clear all filters
                </Button>
              </Card>
            )}

            {/* Products Display */}
            {paginatedProducts.length > 0 && (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedProducts.map(product => (
                      <div key={product.id} className="relative group">
                        <ProductCard product={product} />
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.preventDefault();
                            handleQuickView(product);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Quick View
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paginatedProducts.map((product) => (
                      <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-0">
                          <div className="flex flex-col sm:flex-row">
                            <div className="w-full sm:w-48 h-48 relative overflow-hidden">
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="object-cover w-full h-full"
                              />
                            </div>
                            <div className="flex-1 p-6 flex flex-col justify-between">
                              <div className="space-y-2">
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
                                    <div className="flex items-center gap-1 mt-1">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`h-4 w-4 ${i < Math.floor(product.rating)
                                              ? 'fill-primary text-primary'
                                              : 'text-muted-foreground'
                                            }`}
                                        />
                                      ))}
                                      <span className="text-sm text-muted-foreground ml-1">
                                        ({product.rating})
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-2xl font-bold">${product.price.toFixed(2)}</p>
                                </div>
                                <p className="text-muted-foreground text-sm line-clamp-2">
                                  {product.description}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {product.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center justify-between mt-4 gap-2">
                                <div>
                                  {product.stock > 0 ? (
                                    <span className="text-sm text-green-600">In Stock ({product.stock})</span>
                                  ) : (
                                    <span className="text-sm text-destructive">Out of Stock</span>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleQuickView(product)}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Quick View
                                  </Button>
                                  <Button disabled={product.stock === 0}>Add to Cart</Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Pagination */}
            {totalPages > 1 && paginatedProducts.length > 0 && (
              <div className="mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>

        {/* Quick View Modal */}
        <ProductQuickView
          product={quickViewProduct}
          open={isQuickViewOpen}
          onOpenChange={setIsQuickViewOpen}
        />
      </div>
    </div>
  );
};

export default Products;
