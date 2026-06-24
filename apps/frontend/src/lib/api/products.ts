import type { ProductListResponse, ProductResponse } from '@/types/api';
import { del, get, patchFormData, postFormData } from './client';

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  available?: boolean;
}

export const productsApi = {
  list: (params?: ProductQueryParams) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.search) query.set('search', params.search);
    if (params?.category) query.set('category', params.category);
    if (params?.available !== undefined) query.set('available', String(params.available));
    const qs = query.toString();
    return get<ProductListResponse>(`/products${qs ? `?${qs}` : ''}`);
  },

  bySlug: (slug: string) => get<ProductResponse>(`/products/${slug}`),

  create: (formData: FormData) => postFormData<ProductResponse>('/products', formData),

  update: (id: string, formData: FormData) =>
    patchFormData<ProductResponse>(`/products/${id}`, formData),

  delete: (id: string) => del<void>(`/products/${id}`),
};
