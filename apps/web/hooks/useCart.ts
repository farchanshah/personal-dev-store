import { useState, useEffect, useCallback } from 'react';
import { Cart as CartType } from '@devstore/types';

export function useCart() {
  const [cart, setCart] = useState<CartType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cart');
      const data = await response.json();
      
      if (data.success) {
        setCart(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = useCallback(async (productId: string, quantity: number = 1, options?: any) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity, options }),
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchCart();
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: 'Failed to add to cart' };
    }
  }, [fetchCart]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchCart();
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: 'Failed to update quantity' };
    }
  }, [fetchCart]);

  const removeItem = useCallback(async (itemId: string) => {
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchCart();
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: 'Failed to remove item' };
    }
  }, [fetchCart]);

  const clearCart = useCallback(async () => {
    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        setCart(null);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: 'Failed to clear cart' };
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return {
    cart,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart: fetchCart,
  };
}