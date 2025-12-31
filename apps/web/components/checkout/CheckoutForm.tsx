'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  CreditCard, 
  Truck, 
  Shield,
  Lock,
  CheckCircle
} from 'lucide-react';
import { formatPrice } from '@devstore/utils/formatters';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Card, CardContent } from '../ui/Card';
import { useCart } from '@/hooks/useCart';

const checkoutSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  country: z.string().min(2, 'Country is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  cardNumber: z.string().min(16, 'Card number is required'),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, 'Invalid expiry date'),
  cvc: z.string().min(3, 'CVC is required'),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export function CheckoutForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { cart } = useCart();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  const subtotal = cart?.items?.reduce(
    (sum, item) => sum + (item.product.priceCents * item.quantity),
    0
  ) || 0;

  const shipping = subtotal > 5000 ? 0 : 500; // Free shipping over $50
  const tax = Math.round(subtotal * 0.1); // 10% tax
  const total = subtotal + shipping + tax;

  const onSubmit = async (data: CheckoutFormData) => {
    setLoading(true);
    try {
      // Create checkout session
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart?.items?.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          customerEmail: data.email,
          successUrl: `${window.location.origin}/checkout/success`,
          cancelUrl: `${window.location.origin}/checkout`,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Redirect to Stripe Checkout
        window.location.href = result.data.url;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Form */}
        <div className="lg:col-span-2">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">Checkout</h1>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Step {step} of 3</span>
                <div className="flex gap-1">
                  {[1, 2, 3].map(i => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i <= step ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <button
                onClick={() => setStep(1)}
                className={`text-center p-4 rounded-lg border-2 transition-all ${
                  step >= 1
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}>
                    1
                  </div>
                </div>
                <span className="font-medium">Shipping</span>
              </button>

              <button
                onClick={() => step >= 2 && setStep(2)}
                className={`text-center p-4 rounded-lg border-2 transition-all ${
                  step >= 2
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}>
                    2
                  </div>
                </div>
                <span className="font-medium">Payment</span>
              </button>

              <button
                onClick={() => step >= 3 && setStep(3)}
                className={`text-center p-4 rounded-lg border-2 transition-all ${
                  step >= 3
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}>
                    3
                  </div>
                </div>
                <span className="font-medium">Confirmation</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            {step === 1 && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Truck className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-semibold">Shipping Information</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        {...register('firstName')}
                        error={errors.firstName?.message}
                      />
                    </div>

                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        {...register('lastName')}
                        error={errors.lastName?.message}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register('email')}
                        error={errors.email?.message}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        {...register('address')}
                        error={errors.address?.message}
                      />
                    </div>

                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        {...register('city')}
                        error={errors.city?.message}
                      />
                    </div>

                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        {...register('country')}
                        error={errors.country?.message}
                      />
                    </div>

                    <div>
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        {...register('postalCode')}
                        error={errors.postalCode?.message}
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button
                      type="button"
                      onClick={() => setStep(2)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Continue to Payment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-semibold">Payment Details</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        {...register('cardNumber')}
                        error={errors.cardNumber?.message}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          {...register('expiry')}
                          error={errors.expiry?.message}
                        />
                      </div>

                      <div>
                        <Label htmlFor="cvc">CVC</Label>
                        <Input
                          id="cvc"
                          placeholder="123"
                          {...register('cvc')}
                          error={errors.cvc?.message}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Lock className="w-4 h-4" />
                      <span>Your payment is secure and encrypted</span>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </Button>
                    
                    <Button
                      type="button"
                      onClick={() => setStep(3)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Review Order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <h2 className="text-xl font-semibold">Order Review</h2>
                  </div>

                  <div className="space-y-6">
                    {/* Order Summary */}
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-4">Order Summary</h3>
                      <div className="space-y-3">
                        {cart?.items?.map(item => (
                          <div key={item.id} className="flex justify-between">
                            <div>
                              <span className="font-medium">{item.product.title}</span>
                              <span className="text-gray-500 text-sm ml-2">
                                ×{item.quantity}
                              </span>
                            </div>
                            <span className="font-medium">
                              {formatPrice(item.product.priceCents * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t mt-4 pt-4 space-y-2">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>{formatPrice(subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipping</span>
                          <span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax</span>
                          <span>{formatPrice(tax)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg pt-2 border-t">
                          <span>Total</span>
                          <span>{formatPrice(total)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Security Badge */}
                    <div className="flex items-center justify-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <Shield className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="font-medium">Secure Checkout</p>
                        <p className="text-sm text-gray-600">
                          256-bit SSL encryption. Your information is safe.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(2)}
                    >
                      Back
                    </Button>
                    
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Complete Order'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </form>
        </div>

        {/* Right Column - Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
              
              <div className="space-y-3">
                {cart?.items?.slice(0, 3).map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                      {item.product.images[0] && (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-1">
                        {item.product.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.quantity} × {formatPrice(item.product.priceCents)}
                      </p>
                    </div>
                  </div>
                ))}
                
                {cart?.items && cart.items.length > 3 && (
                  <p className="text-sm text-gray-500 text-center">
                    +{cart.items.length - 3} more items
                  </p>
                )}
              </div>

              <div className="border-t mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trust Badges */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">Secure Payment</p>
                    <p className="text-sm text-gray-600">256-bit encryption</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Free Shipping</p>
                    <p className="text-sm text-gray-600">On orders over $50</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium">30-Day Returns</p>
                    <p className="text-sm text-gray-600">No questions asked</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}