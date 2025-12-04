import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProducts } from '@/contexts/ProductsContext';
import { useCart } from '@/contexts/CartContext';
import { Package, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const AdminDashboard = () => {
  const { products } = useProducts();
  const { items } = useCart();

  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const lowStockProducts = products.filter(p => p.stock < 20).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your e-commerce store</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Total Products
              </CardDescription>
              <CardTitle className="text-3xl">{totalProducts}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Total Stock
              </CardDescription>
              <CardTitle className="text-3xl">{totalStock}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Inventory Value
              </CardDescription>
              <CardTitle className="text-3xl">${totalValue.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Low Stock Items
              </CardDescription>
              <CardTitle className="text-3xl text-destructive">{lowStockProducts}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button asChild size="lg">
              <Link to="/admin/products">Manage Products</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/admin/orders">View Orders</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        {lowStockProducts > 0 && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Low Stock Alert</CardTitle>
              <CardDescription>These products need restocking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {products
                  .filter(p => p.stock < 20)
                  .map(product => (
                    <div key={product.id} className="flex justify-between items-center py-2 border-b last:border-0">
                      <span className="font-medium">{product.name}</span>
                      <span className="text-sm text-destructive">{product.stock} units left</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
