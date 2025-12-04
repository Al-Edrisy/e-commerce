import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, User, Mail, Calendar, Package, DollarSign } from 'lucide-react';
import { Order } from '@/types';
import { toast } from 'sonner';

// Mock orders data (should match AdminOrders)
const mockOrders: Order[] = [
  {
    id: 'ORD-2024-001',
    user_uid: '1',
    items: [
      {
        product: {
          id: '1',
          name: 'Premium Wireless Headphones',
          description: 'Experience crystal-clear audio',
          price: 299.99,
          stock: 45,
          category_id: '1',
          image_url: '/placeholder.svg',
          is_featured: true,
          tags: ['audio', 'wireless'],
          rating: 4.8,
          slug: 'premium-wireless-headphones'
        },
        quantity: 1
      },
      {
        product: {
          id: '2',
          name: 'Smart Watch Pro',
          description: 'Track your fitness goals',
          price: 149.99,
          stock: 30,
          category_id: '1',
          image_url: '/placeholder.svg',
          is_featured: true,
          tags: ['wearable', 'fitness'],
          rating: 4.6,
          slug: 'smart-watch-pro'
        },
        quantity: 1
      }
    ],
    total_amount: 449.98,
    status: 'delivered',
    payment_status: 'completed',
    createdAt: new Date(2024, 2, 15).toISOString(),
  },
  {
    id: 'ORD-2024-002',
    user_uid: '1',
    items: [
      {
        product: {
          id: '3',
          name: 'Designer Denim Jacket',
          description: 'Classic style meets modern comfort',
          price: 149.99,
          stock: 60,
          category_id: '2',
          image_url: '/placeholder.svg',
          is_featured: true,
          tags: ['clothing', 'denim'],
          rating: 4.5,
          slug: 'designer-denim-jacket'
        },
        quantity: 1
      }
    ],
    total_amount: 149.99,
    status: 'shipped',
    payment_status: 'completed',
    createdAt: new Date(2024, 2, 10).toISOString(),
  },
  {
    id: 'ORD-2024-003',
    user_uid: '2',
    items: [
      {
        product: {
          id: '1',
          name: 'Premium Wireless Headphones',
          description: 'Experience crystal-clear audio',
          price: 299.99,
          stock: 45,
          category_id: '1',
          image_url: '/placeholder.svg',
          is_featured: true,
          tags: ['audio', 'wireless'],
          rating: 4.8,
          slug: 'premium-wireless-headphones'
        },
        quantity: 1
      }
    ],
    total_amount: 299.99,
    status: 'processing',
    payment_status: 'completed',
    createdAt: new Date(2024, 2, 8).toISOString(),
  },
  {
    id: 'ORD-2024-004',
    user_uid: '3',
    items: [
      {
        product: {
          id: '4',
          name: 'Minimalist Desk Lamp',
          description: 'Illuminate your workspace',
          price: 79.99,
          stock: 100,
          category_id: '3',
          image_url: '/placeholder.svg',
          is_featured: false,
          tags: ['lighting', 'decor'],
          rating: 4.7,
          slug: 'minimalist-desk-lamp'
        },
        quantity: 1
      }
    ],
    total_amount: 79.99,
    status: 'pending',
    payment_status: 'pending',
    createdAt: new Date(2024, 2, 5).toISOString(),
  },
];

// Mock customer data
const mockCustomers: Record<string, { name: string; email: string; phone?: string }> = {
  '1': { name: 'John Doe', email: 'john.doe@example.com', phone: '+1 (555) 123-4567' },
  '2': { name: 'Jane Smith', email: 'jane.smith@example.com', phone: '+1 (555) 234-5678' },
  '3': { name: 'Bob Johnson', email: 'bob.johnson@example.com' },
};

const AdminOrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const order = mockOrders.find(o => o.id === orderId);
  const [currentStatus, setCurrentStatus] = useState(order?.status || 'pending');
  const [currentPaymentStatus, setCurrentPaymentStatus] = useState(order?.payment_status || 'pending');

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Card>
            <CardHeader>
              <CardTitle>Order Not Found</CardTitle>
              <CardDescription>The order you're looking for doesn't exist.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link to="/admin/orders">Back to Orders</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const customer = mockCustomers[order.user_uid];

  const getStatusColor = (status: Order['status']) => {
    const colors = {
      pending: 'secondary',
      processing: 'default',
      shipped: 'default',
      delivered: 'default',
      cancelled: 'destructive',
    } as const;
    return colors[status] || 'secondary';
  };

  const getPaymentStatusColor = (status: Order['payment_status']) => {
    const colors = {
      pending: 'secondary',
      completed: 'default',
      failed: 'destructive',
    } as const;
    return colors[status] || 'secondary';
  };

  const handleStatusUpdate = (newStatus: Order['status']) => {
    setCurrentStatus(newStatus);
    toast.success(`Order status updated to ${newStatus}`);
  };

  const handlePaymentStatusUpdate = (newStatus: Order['payment_status']) => {
    setCurrentPaymentStatus(newStatus);
    toast.success(`Payment status updated to ${newStatus}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Order Details</h1>
            <p className="text-muted-foreground">Order {order.id}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
                <CardDescription>{order.items.length} item(s) in this order</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index}>
                      <div className="flex gap-4">
                        <div className="h-20 w-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground truncate">
                            {item.product.name}
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.product.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm text-muted-foreground">
                              Qty: {item.quantity}
                            </span>
                            <span className="text-sm font-medium">
                              ${item.product.price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      {index < order.items.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </div>

                <Separator className="my-6" />

                {/* Order Total */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${order.total_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>$0.00</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${order.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{customer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </p>
                  <p className="font-medium">{customer.email}</p>
                </div>
                {customer.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{customer.phone}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Order ID
                  </p>
                  <p className="font-medium">{order.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Order Date
                  </p>
                  <p className="font-medium">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Total Amount
                  </p>
                  <p className="font-semibold text-lg">${order.total_amount.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Status Management */}
            <Card>
              <CardHeader>
                <CardTitle>Status Management</CardTitle>
                <CardDescription>Update order and payment status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Order Status</label>
                  <Select value={currentStatus} onValueChange={(value) => handleStatusUpdate(value as Order['status'])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge variant={getStatusColor(currentStatus)} className="mt-2">
                    {currentStatus}
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment Status</label>
                  <Select value={currentPaymentStatus} onValueChange={(value) => handlePaymentStatusUpdate(value as Order['payment_status'])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge variant={getPaymentStatusColor(currentPaymentStatus)} className="mt-2">
                    {currentPaymentStatus}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;
