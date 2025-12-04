import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { UserProvider } from "./contexts/UserContext";
import { ProductsProvider } from "./contexts/ProductsContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminLayout } from "@/layouts/AdminLayout";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import Categories from "./pages/Categories";
import Checkout from "./pages/Checkout";
import Wishlist from "./pages/Wishlist";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { TermsOfService } from "./pages/TermsOfService";
import { ShippingPolicy } from "./pages/ShippingPolicy";
import { ReturnPolicy } from "./pages/ReturnPolicy";
import { FAQ } from "./pages/FAQ";
import { Contact } from "./pages/Contact";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminOrderDetail from "./pages/admin/AdminOrderDetail";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminCustomers from "./pages/admin/AdminCustomers";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <UserProvider>
        <ProductsProvider>
          <WishlistProvider>
            <CartProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <div className="flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/product/:slug" element={<ProductDetail />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/wishlist" element={<Wishlist />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                        <Route path="/terms-of-service" element={<TermsOfService />} />
                        <Route path="/shipping-policy" element={<ShippingPolicy />} />
                        <Route path="/return-policy" element={<ReturnPolicy />} />
                        <Route path="/faq" element={<FAQ />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
                        <Route path="/admin/products" element={<ProtectedRoute requireAdmin><AdminLayout><AdminProducts /></AdminLayout></ProtectedRoute>} />
                        <Route path="/admin/orders" element={<ProtectedRoute requireAdmin><AdminLayout><AdminOrders /></AdminLayout></ProtectedRoute>} />
                        <Route path="/admin/orders/:orderId" element={<ProtectedRoute requireAdmin><AdminLayout><AdminOrderDetail /></AdminLayout></ProtectedRoute>} />
                        <Route path="/admin/categories" element={<ProtectedRoute requireAdmin><AdminLayout><AdminCategories /></AdminLayout></ProtectedRoute>} />
                        <Route path="/admin/customers" element={<ProtectedRoute requireAdmin><AdminLayout><AdminCustomers /></AdminLayout></ProtectedRoute>} />
                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                    <Footer />
                  </div>
                </BrowserRouter>
              </TooltipProvider>
            </CartProvider>
          </WishlistProvider>
        </ProductsProvider>
      </UserProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
