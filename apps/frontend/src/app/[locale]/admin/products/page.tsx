'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { productsApi } from '@/lib/api/products';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Package, PencilLine, Plus, Trash2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

export default function AdminProductsPage() {
  const t = useTranslations('Admin');
  const locale = useLocale();
  const qc = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => productsApi.list({ limit: 100 }),
  });

  const deleteProduct = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted');
      setDeleteId(null);
    },
    onError: () => toast.error('Failed to delete product'),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('products')}</h1>
        <Button asChild size="sm">
          <Link href={`/${locale}/admin/products/create`}>
            <Plus className="me-2 h-4 w-4" />
            {t('createProduct')}
          </Link>
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <ErrorState message="Failed to load products." onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && (!data || data.items.length === 0) && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 text-muted-foreground">{t('noProducts')}</p>
          <Button asChild className="mt-4">
            <Link href={`/${locale}/admin/products/create`}>{t('createProduct')}</Link>
          </Button>
        </div>
      )}

      {!isLoading && !isError && data && data.items.length > 0 && (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>{t('nameEn')}</TableHead>
                <TableHead>{t('price')}</TableHead>
                <TableHead>{t('category')}</TableHead>
                <TableHead>{t('available')}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.imageUrl ? (
                      <div className="relative h-10 w-10 overflow-hidden rounded-md bg-muted">
                        <Image
                          src={product.imageUrl}
                          alt={product.nameEn}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-md bg-muted" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{product.nameEn}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {product.category.nameEn}
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs font-medium ${product.isAvailable ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {product.isAvailable ? 'Yes' : 'No'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button asChild size="icon" variant="ghost" className="h-8 w-8">
                        <Link href={`/${locale}/admin/products/${product.id}/edit`}>
                          <PencilLine className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteProduct')}</DialogTitle>
            <DialogDescription>{t('confirmDelete')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && deleteProduct.mutate(deleteId)}
              disabled={deleteProduct.isPending}
            >
              {t('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
