import type { CategoryResponse } from '@/types/api';
import { del, get, patch, post } from './client';

export interface CreateCategoryInput {
  nameEn: string;
  nameAr: string;
  slug: string;
  isActive?: boolean;
  sortOrder?: number;
}

export const categoriesApi = {
  list: () => get<CategoryResponse[]>('/categories'),

  bySlug: (slug: string) => get<CategoryResponse>(`/categories/${slug}`),

  create: (data: CreateCategoryInput) => post<CategoryResponse>('/categories', data),

  update: (id: string, data: Partial<CreateCategoryInput>) =>
    patch<CategoryResponse>(`/categories/${id}`, data),

  delete: (id: string) => del<void>(`/categories/${id}`),
};
