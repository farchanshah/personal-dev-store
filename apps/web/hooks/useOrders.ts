import { useState, useEffect, useCallback } from 'react';
import { Order, PaginationParams } from '@devstore/types';

interface UseOrdersOptions {
  pagination?: PaginationParams;
  enabled?: boolean;
}

export function useOrders(options: UseOrdersOptions = {}) {
  const { pagination = {}, enabled = true } = options;
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<any>(null);

  const fetchOrders = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      
      const params = new URLSearchParams(pagination as any);
      const response = await fetch(`/api/orders?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data);
        setMeta(data.meta);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [pagination, enabled]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    meta,
    refetch: fetchOrders,
  };
}