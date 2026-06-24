import type { CartResponse } from '@/types/api';
import { del, get, patch, post } from './client';

export const cartApi = {
  get: () => get<CartResponse>('/cart'),

  addItem: (productId: string, quantity: number) =>
    post<CartResponse>('/cart/items', { productId, quantity }),

  updateItem: (itemId: string, quantity: number) =>
    patch<CartResponse>(`/cart/items/${itemId}`, { quantity }),

  removeItem: (itemId: string) => del<CartResponse>(`/cart/items/${itemId}`),

  clear: () => del<CartResponse>('/cart'),
};
