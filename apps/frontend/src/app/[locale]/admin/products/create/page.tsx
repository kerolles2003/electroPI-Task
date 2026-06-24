'use client';

import { ProductForm, type ProductFormData } from '@/components/admin/ProductForm';
import { Button } from '@/components/ui/button';
import { productsApi } from '@/lib/api/products';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function CreateProductPage() {
  const t = useTranslations('Admin');
  const locale = useLocale();
  const router = useRouter();
  const qc = useQueryClient();

  const create = useMutation({
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
      return productsApi.create(fd);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success('Product created');
      router.push(`/${locale}/admin/products`);
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create product'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/${locale}/admin/products`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{t('createProduct')}</h1>
      </div>

      <div className="rounded-lg border p-6">
        <ProductForm
          onSubmit={(d) => create.mutate(d)}
          isSubmitting={create.isPending}
          submitLabel={t('createProduct')}
        />
      </div>
    </div>
  );
}
