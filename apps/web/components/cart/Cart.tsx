'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';
import { formatPrice } from '@devstore/utils/formatters';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useCart } from '@/hooks/useCart';

export function Cart() {
  const [isOpen, setIsOpen] = useState(false);
  const { cart, loading, updateQuantity, removeItem, clearCart } = useCart();
  
  const total = cart?.items?.reduce(
    (sum, item) => sum + (item.product.priceCents * item.quantity),
    0
  ) || 0;

  return (
    <>
      {/* Cart Button */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(true)}
      >
        <ShoppingCart className="w-5 h-5" />
        {cart?.items?.length > 0 && (
          <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0">
            {cart.items.length}
          </Badge>
        )}
      </Button>

      {/* Cart Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Drawer */}
          <div className="absolute inset-y-0 right-0 flex max-w-full">
            <div className="relative w-screen max-w-md">
              <div className="flex h-full flex-col bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-6 border-b">
                  <h2 className="text-lg font-semibold">Shopping Cart</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto px-4 py-6">
                  {loading ? (
                    <div className="text-center py-12">Loading...</div>
                  ) : cart?.items?.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Your cart is empty</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart?.items?.map(item => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 p-4 border rounded-lg"
                        >
                          {/* Product Image */}
                          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                            {item.product.images[0] && (
                              <img
                                src={item.product.images[0]}
                                alt={item.product.title}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1">
                            <h3 className="font-medium text-sm">
                              {item.product.title}
                            </h3>
                            <p className="text-gray-500 text-sm">
                              {formatPrice(item.product.priceCents)}
                            </p>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              className="w-8 h-8"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            
                            <span className="w-8 text-center">
                              {item.quantity}
                            </span>
                            
                            <Button
                              size="icon"
                              variant="outline"
                              className="w-8 h-8"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>

                          {/* Remove Button */}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {cart?.items?.length > 0 && (
                  <div className="border-t p-4">
                    <div className="flex justify-between mb-4">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-lg">
                        {formatPrice(total)}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <Button
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
                        onClick={() => {
                          setIsOpen(false);
                          window.location.href = '/checkout';
                        }}
                      >
                        Proceed to Checkout
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={clearCart}
                      >
                        Clear Cart
                      </Button>
                    </div>
                    
                    <p className="text-xs text-gray-500 text-center mt-4">
                      Free shipping on orders over $50
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}