'use client';

import { ProductForm, type ProductFormData } from '@/components/admin/ProductForm';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { productsApi } from '@/lib/api/products';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function EditProductPage() {
  const t = useTranslations('Admin');
  const locale = useLocale();
  const router = useRouter();
  const qc = useQueryClient();
  const { id } = useParams<{ id: string }>();

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => productsApi.list({ limit: 100 }),
  });

  const product = productsData?.items.find((p) => p.id === id);

  const update = useMutation({
    mutationFn: (data: ProductFormData) => {
      const fd = new FormData();
      fd.append('nameEn', data.nameEn);
      fd.append('nameAr', data.nameAr);
      fd.append('descriptionEn', data.descriptionEn);
      fd.append('descriptionAr', data.descriptionAr);
      fd.append('slug', data.slug);
      fd.append('price', String(data.price));
      fd.append('categoryId', data.categoryId);
      fd.append('isAvailable', String(data.isAvailable));
      if (data.image) fd.append('image', data.image);
      return productsApi.update(id, fd);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success('Product updated');
      router.push(`/${locale}/admin/products`);
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update product'),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        Product not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/${locale}/admin/products`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{t('editProduct')}</h1>
      </div>

      <div className="rounded-lg border p-6">
        <ProductForm
          defaultValues={{
            nameEn: product.nameEn,
            nameAr: product.nameAr,
            descriptionEn: product.descriptionEn,
            descriptionAr: product.descriptionAr,
            slug: product.slug,
            price: product.price,
            categoryId: product.categoryId,
            isAvailable: product.isAvailable,
          }}
          imageUrl={product.imageUrl ?? undefined}
          onSubmit={(d) => update.mutate(d)}
          isSubmitting={update.isPending}
          submitLabel={t('editProduct')}
        />
      </div>
    </div>
  );
}
