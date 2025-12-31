import { useState, useEffect, useCallback } from 'react';
import { Product, ProductFilters, PaginationParams } from '@devstore/types';

interface UseProductsOptions {
  filters?: ProductFilters;
  pagination?: PaginationParams;
  enabled?: boolean;
}

export function useProducts(options: UseProductsOptions = {}) {
  const { filters = {}, pagination = {}, enabled = true } = options;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<any>(null);

  const fetchProducts = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        ...filters,
        ...pagination,
      } as any);

      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data);
        setMeta(data.meta);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination, enabled]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    meta,
    refetch: fetchProducts,
  };
}