'use client';

import { cartApi } from '@/lib/api/cart';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useCart() {
  const qc = useQueryClient();

  const { data: cart, isLoading, isError, refetch } = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.get,
    staleTime: 1000 * 30,
    retry: 1,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['cart'] });

  const addItem = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      cartApi.addItem(productId, quantity),
    onSuccess: () => {
      invalidate();
      toast.success('Added to cart');
    },
    onError: () => toast.error('Failed to add item to cart'),
  });

  const updateItem = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartApi.updateItem(itemId, quantity),
    onSuccess: invalidate,
    onError: () => toast.error('Failed to update cart'),
  });

  const removeItem = useMutation({
    mutationFn: (itemId: string) => cartApi.removeItem(itemId),
    onSuccess: invalidate,
    onError: () => toast.error('Failed to remove item'),
  });

  const clearCart = useMutation({
    mutationFn: cartApi.clear,
    onSuccess: invalidate,
  });

  return {
    cart,
    isLoading,
    isError,
    refetch,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    totalItems: cart?.totalItems ?? 0,
  };
}
