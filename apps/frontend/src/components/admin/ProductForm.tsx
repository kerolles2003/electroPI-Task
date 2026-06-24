'use client';

import { ImagePlaceholder } from '@/components/ui/image-placeholder';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { categoriesApi } from '@/lib/api/categories';
import type { ProductResponse } from '@/types/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  nameEn: z.string().min(1).max(100),
  nameAr: z.string().min(1).max(100),
  descriptionEn: z.string().min(10).max(1000),
  descriptionAr: z.string().min(10).max(1000),
  slug: z.string().min(1).max(100),
  price: z.number().min(0.01).max(999999.99),
  categoryId: z.string().min(1, 'Category is required'),
  isAvailable: z.boolean(),
  image: z.instanceof(File).optional(),
});

export type ProductFormData = z.infer<typeof schema>;

interface Props {
  defaultValues?: Partial<ProductFormData>;
  imageUrl?: string;
  onSubmit: (data: ProductFormData) => void;
  isSubmitting: boolean;
  submitLabel: string;
}

export function ProductForm({ defaultValues, imageUrl, onSubmit, isSubmitting, submitLabel }: Props) {
  const t = useTranslations('Admin');
  const [preview, setPreview] = useState<string | null>(null);
  const prevPreview = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (prevPreview.current) URL.revokeObjectURL(prevPreview.current);
    };
  }, []);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.list,
  });

  const form = useForm<ProductFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nameEn: '',
      nameAr: '',
      descriptionEn: '',
      descriptionAr: '',
      slug: '',
      price: 0,
      categoryId: '',
      isAvailable: true,
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="nameEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('nameEn')}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nameAr"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('nameAr')}</FormLabel>
                <FormControl>
                  <Input dir="rtl" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="descriptionEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('descriptionEn')}</FormLabel>
                <FormControl>
                  <Textarea rows={4} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="descriptionAr"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('descriptionAr')}</FormLabel>
                <FormControl>
                  <Textarea dir="rtl" rows={4} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('slug')}</FormLabel>
                <FormControl>
                  <Input placeholder="product-name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('price')} ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('category')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.nameEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="image"
            render={({ field: { onChange } }) => (
              <FormItem>
                <FormLabel>{t('image')}</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      onChange(file);
                      if (prevPreview.current) URL.revokeObjectURL(prevPreview.current);
                      if (file) {
                        const url = URL.createObjectURL(file);
                        prevPreview.current = url;
                        setPreview(url);
                      } else {
                        prevPreview.current = null;
                        setPreview(null);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
                {(preview ?? imageUrl) && (
                  <div className="mt-2 h-32 w-32 overflow-hidden rounded-lg border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview ?? imageUrl}
                      alt="preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isAvailable"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t('available')}</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(v) => field.onChange(v === 'true')}
                    defaultValue={String(field.value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </form>
    </Form>
  );
}
