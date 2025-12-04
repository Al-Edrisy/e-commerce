import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Calendar, Shield, Package, Heart, Settings, RefreshCw, Trash2, Copy, Eye, EyeOff, Key, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';

const Profile = () => {
  const { user, toggleRole } = useUser();
  const { items: wishlistItems, removeFromWishlist, getWishlistCount } = useWishlist();
  const [accessToken, setAccessToken] = useState<string>('');
  const [showToken, setShowToken] = useState(false);
  const [isLoadingToken, setIsLoadingToken] = useState(false);
  const [tokenExpiry, setTokenExpiry] = useState<string>('');

  // Get Firebase ID token for API testing
  useEffect(() => {
    const getToken = async () => {
      if (auth.currentUser) {
        try {
          const token = await auth.currentUser.getIdToken();
          setAccessToken(token);
          
          // Get token expiration time
          const tokenResult = await auth.currentUser.getIdTokenResult();
          setTokenExpiry(new Date(tokenResult.expirationTime).toLocaleString());
        } catch (error) {
          console.error('Error getting token:', error);
        }
      }
    };
    getToken();
  }, [user]);

  const refreshAccessToken = async () => {
    setIsLoadingToken(true);
    try {
      if (auth.currentUser) {
        const token = await auth.currentUser.getIdToken(true); // Force refresh
        setAccessToken(token);
        
        const tokenResult = await auth.currentUser.getIdTokenResult();
        setTokenExpiry(new Date(tokenResult.expirationTime).toLocaleString());
        
        toast({
          title: "Token Refreshed",
          description: "Your access token has been refreshed successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh token. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingToken(false);
    }
  };

  const copyTokenToClipboard = () => {
    navigator.clipboard.writeText(accessToken);
    toast({
      title: "Copied!",
      description: "Access token copied to clipboard.",
    });
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Not Logged In</CardTitle>
            <CardDescription>Please log in to view your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/auth">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.photoURL} alt={user.displayName} />
                <AvatarFallback className="text-2xl">
                  {user.displayName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-3xl">{user.displayName}</CardTitle>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </CardDescription>
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Member since {joinDate}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Edit Profile
                </Button>
                <Button variant="outline" className="gap-2" onClick={toggleRole}>
                  <RefreshCw className="h-4 w-4" />
                  Toggle Role
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Total Orders
              </CardDescription>
              <CardTitle className="text-3xl">12</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Wishlist Items
              </CardDescription>
              <CardTitle className="text-3xl">{getWishlistCount()}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Account Status
              </CardDescription>
              <CardTitle className="text-lg">Active</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your latest purchases</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { id: '#ORD-2024-001', date: '2024-03-15', status: 'Delivered', total: 449.98 },
              { id: '#ORD-2024-002', date: '2024-03-10', status: 'Shipped', total: 149.99 },
              { id: '#ORD-2024-003', date: '2024-02-28', status: 'Delivered', total: 299.99 }
            ].map((order, idx) => (
              <div key={order.id}>
                {idx > 0 && <Separator className="my-4" />}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <p className="font-medium">{order.id}</p>
                    <p className="text-sm text-muted-foreground">{order.date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={order.status === 'Delivered' ? 'secondary' : 'default'}>
                      {order.status}
                    </Badge>
                    <p className="font-semibold">${order.total.toFixed(2)}</p>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Wishlist */}
        {wishlistItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>My Wishlist</CardTitle>
              <CardDescription>Items you want to purchase later</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {wishlistItems.map((product, idx) => (
                  <div key={product.id}>
                    {idx > 0 && <Separator className="my-4" />}
                    <div className="flex gap-4">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{product.name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1">{product.description}</p>
                        <p className="text-lg font-bold text-foreground mt-1">${product.price.toFixed(2)}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          removeFromWishlist(product.id);
                          toast({
                            title: "Removed from wishlist",
                            description: `${product.name} has been removed from your wishlist.`
                          });
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security & API Access */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Security & API Access</CardTitle>
            </div>
            <CardDescription>Manage your security settings and API access tokens</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Access Token Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Access Token
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Use this token to test API endpoints between services
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshAccessToken}
                  disabled={isLoadingToken}
                  className="gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoadingToken ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type={showToken ? 'text' : 'password'}
                    value={accessToken}
                    readOnly
                    className="pr-20 font-mono text-xs"
                    placeholder="Loading token..."
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setShowToken(!showToken)}
                    >
                      {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={copyTokenToClipboard}
                      disabled={!accessToken}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {tokenExpiry && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Expires: {tokenExpiry}
                  </p>
                )}
              </div>

              <div className="rounded-lg bg-muted p-4 space-y-2">
                <p className="text-sm font-medium">How to use this token:</p>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Copy the access token above</li>
                  <li>Add it to your API request headers:</li>
                </ol>
                <div className="bg-background rounded p-3 mt-2">
                  <code className="text-xs font-mono">
                    Authorization: Bearer YOUR_TOKEN_HERE
                  </code>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Example with curl:
                </p>
                <div className="bg-background rounded p-3 mt-1">
                  <code className="text-xs font-mono break-all">
                    curl -H "Authorization: Bearer YOUR_TOKEN" {import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:4000/api'}/products
                  </code>
                </div>
              </div>
            </div>

            <Separator />

            {/* Other Security Options */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Account Security</Label>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Shield className="h-4 w-4" />
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Mail className="h-4 w-4" />
                Update Email
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-2">
              <User className="h-4 w-4" />
              Personal Information
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Package className="h-4 w-4" />
              Order History
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Heart className="h-4 w-4" />
              Wishlist
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
