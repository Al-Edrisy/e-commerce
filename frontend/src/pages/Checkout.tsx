import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, Check, CreditCard, Truck, Package, Lock, Wallet } from 'lucide-react';

const shippingSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  zipCode: z.string().min(5, 'ZIP code must be at least 5 characters'),
  country: z.string().min(2, 'Country must be at least 2 characters'),
});

const paymentSchema = z.object({
  cardNumber: z.string().min(16, 'Card number must be 16 digits').max(19, 'Card number is too long'),
  cardName: z.string().min(3, 'Name must be at least 3 characters'),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Format: MM/YY'),
  cvv: z.string().min(3, 'CVV must be 3 digits').max(4, 'CVV must be 3-4 digits'),
  paymentMethod: z.enum(['card', 'paypal', 'apple-pay']),
});

type ShippingFormData = z.infer<typeof shippingSchema>;
type PaymentFormData = z.infer<typeof paymentSchema>;

const detectCardType = (number: string): string => {
  const cleanNumber = number.replace(/\s/g, '');
  if (/^4/.test(cleanNumber)) return 'visa';
  if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
  if (/^3[47]/.test(cleanNumber)) return 'amex';
  if (/^6(?:011|5)/.test(cleanNumber)) return 'discover';
  return 'card';
};

const formatCardNumber = (value: string): string => {
  const cleaned = value.replace(/\s/g, '');
  const chunks = cleaned.match(/.{1,4}/g);
  return chunks ? chunks.join(' ') : cleaned;
};

export default function Checkout() {
  const navigate = useNavigate();
  const { items, getCartTotal, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [shippingData, setShippingData] = useState<ShippingFormData | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentFormData | null>(null);
  const [cardType, setCardType] = useState<string>('card');

  const shippingForm = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
  });

  const paymentForm = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardNumber: '',
      cardName: '',
      expiryDate: '',
      cvv: '',
      paymentMethod: 'card',
    },
  });

  const subtotal = getCartTotal();
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  if (items.length === 0 && currentStep === 1) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Package className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Add some products to proceed to checkout</p>
        <Button onClick={() => navigate('/products')}>Continue Shopping</Button>
      </div>
    );
  }

  const onShippingSubmit = (data: ShippingFormData) => {
    setShippingData(data);
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onPaymentSubmit = (data: PaymentFormData) => {
    setPaymentData(data);
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = () => {
    toast({
      title: 'Order placed successfully!',
      description: `Your order of $${total.toFixed(2)} has been confirmed.`,
    });
    clearCart();
    setTimeout(() => {
      navigate('/profile');
    }, 2000);
  };

  const steps = [
    { number: 1, title: 'Shipping', icon: Truck },
    { number: 2, title: 'Payment', icon: CreditCard },
    { number: 3, title: 'Review', icon: Check },
  ];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${isCompleted
                          ? 'bg-primary border-primary text-primary-foreground'
                          : isActive
                            ? 'border-primary text-primary'
                            : 'border-muted text-muted-foreground'
                        }`}
                    >
                      {isCompleted ? <Check className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                    </div>
                    <span className={`mt-2 text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-4 transition-colors ${isCompleted ? 'bg-primary' : 'bg-muted'
                        }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping Address */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                  <CardDescription>Enter your shipping details</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...shippingForm}>
                    <form onSubmit={shippingForm.handleSubmit(onShippingSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={shippingForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={shippingForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={shippingForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={shippingForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+1 (555) 123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={shippingForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Address</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Main Street" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={shippingForm.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="New York" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={shippingForm.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <FormControl>
                                <Input placeholder="NY" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={shippingForm.control}
                          name="zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ZIP Code</FormLabel>
                              <FormControl>
                                <Input placeholder="10001" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={shippingForm.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <FormControl>
                                <Input placeholder="United States" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button type="submit" size="lg">
                          Continue to Payment
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Payment Details */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Secure Payment
                  </CardTitle>
                  <CardDescription>Your payment information is encrypted and secure</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...paymentForm}>
                    <form onSubmit={paymentForm.handleSubmit(onPaymentSubmit)} className="space-y-6">
                      {/* Payment Method Selection */}
                      <FormField
                        control={paymentForm.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Payment Method</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="grid grid-cols-3 gap-4"
                              >
                                <Label
                                  htmlFor="card"
                                  className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-card p-4 hover:border-primary cursor-pointer transition-all [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5"
                                >
                                  <RadioGroupItem value="card" id="card" className="sr-only" />
                                  <CreditCard className="mb-2 h-6 w-6" />
                                  <span className="text-sm font-medium">Card</span>
                                </Label>
                                <Label
                                  htmlFor="paypal"
                                  className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-card p-4 hover:border-primary cursor-pointer transition-all [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5"
                                >
                                  <RadioGroupItem value="paypal" id="paypal" className="sr-only" />
                                  <Wallet className="mb-2 h-6 w-6" />
                                  <span className="text-sm font-medium">PayPal</span>
                                </Label>
                                <Label
                                  htmlFor="apple-pay"
                                  className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-card p-4 hover:border-primary cursor-pointer transition-all [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5"
                                >
                                  <RadioGroupItem value="apple-pay" id="apple-pay" className="sr-only" />
                                  <CreditCard className="mb-2 h-6 w-6" />
                                  <span className="text-sm font-medium">Apple Pay</span>
                                </Label>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Separator />

                      {/* Card Details Section */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Lock className="h-4 w-4" />
                          <span>Card details are secured with 256-bit SSL encryption</span>
                        </div>

                        <FormField
                          control={paymentForm.control}
                          name="cardNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Card Number</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    placeholder="1234 5678 9012 3456"
                                    maxLength={19}
                                    className="pr-12 font-mono"
                                    {...field}
                                    onChange={(e) => {
                                      const formatted = formatCardNumber(e.target.value);
                                      field.onChange(formatted);
                                      setCardType(detectCardType(formatted));
                                    }}
                                  />
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={paymentForm.control}
                          name="cardName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cardholder Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="JOHN DOE"
                                  className="uppercase"
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={paymentForm.control}
                            name="expiryDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Expiry Date</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="MM/YY"
                                    maxLength={5}
                                    className="font-mono"
                                    {...field}
                                    onChange={(e) => {
                                      let value = e.target.value.replace(/\D/g, '');
                                      if (value.length >= 2) {
                                        value = value.slice(0, 2) + '/' + value.slice(2, 4);
                                      }
                                      field.onChange(value);
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={paymentForm.control}
                            name="cvv"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CVV</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="123"
                                    type="password"
                                    maxLength={4}
                                    className="font-mono"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Accepted Cards */}
                      <div className="rounded-lg bg-muted/50 p-4">
                        <p className="text-sm text-muted-foreground mb-2">We accept:</p>
                        <div className="flex gap-3 items-center">
                          <div className="px-3 py-2 bg-background rounded border text-xs font-semibold">VISA</div>
                          <div className="px-3 py-2 bg-background rounded border text-xs font-semibold">MASTERCARD</div>
                          <div className="px-3 py-2 bg-background rounded border text-xs font-semibold">AMEX</div>
                          <div className="px-3 py-2 bg-background rounded border text-xs font-semibold">DISCOVER</div>
                        </div>
                      </div>

                      {/* Backend Integration Note */}
                      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                        <div className="flex gap-3">
                          <Lock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Ready for Backend Integration</p>
                            <p className="text-xs text-muted-foreground">
                              This payment form is designed to connect with your Java order service.
                              Payment data will be securely transmitted to your backend API for processing.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          onClick={() => setCurrentStep(1)}
                        >
                          <ChevronLeft className="mr-2 h-4 w-4" />
                          Back
                        </Button>
                        <Button type="submit" size="lg">
                          Review Order
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Order Review */}
            {currentStep === 3 && shippingData && paymentData && (
              <Card>
                <CardHeader>
                  <CardTitle>Review Your Order</CardTitle>
                  <CardDescription>Please verify all details before placing your order</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Shipping Address Review */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold">Shipping Address</h3>
                      <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>
                        Edit
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>{shippingData.firstName} {shippingData.lastName}</p>
                      <p>{shippingData.address}</p>
                      <p>{shippingData.city}, {shippingData.state} {shippingData.zipCode}</p>
                      <p>{shippingData.country}</p>
                      <p className="pt-2">{shippingData.email}</p>
                      <p>{shippingData.phone}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Payment Method Review */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold">Payment Method</h3>
                      <Button variant="ghost" size="sm" onClick={() => setCurrentStep(2)}>
                        Edit
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p className="capitalize">{paymentData.paymentMethod.replace('-', ' ')}</p>
                      <p>Card ending in {paymentData.cardNumber.slice(-4)}</p>
                      <p>{paymentData.cardName}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Order Items */}
                  <div>
                    <h3 className="font-semibold mb-3">Order Items</h3>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.product.id} className="flex gap-4">
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.product.name}</p>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => setCurrentStep(2)}
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button size="lg" onClick={handlePlaceOrder}>
                      <Check className="mr-2 h-4 w-4" />
                      Place Order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {shipping === 0 && (
                  <div className="bg-muted p-3 rounded-md text-sm text-center">
                    🎉 You're eligible for free shipping!
                  </div>
                )}

                <div className="pt-4 space-y-2 text-xs text-muted-foreground">
                  <p className="flex items-start gap-2">
                    <Check className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>Secure checkout with SSL encryption</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Check className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>30-day money-back guarantee</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Check className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>Free returns on all orders</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
