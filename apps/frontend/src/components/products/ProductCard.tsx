'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ImagePlaceholder } from '@/components/ui/image-placeholder';
import { useCart } from '@/hooks/useCart';
import { useCartStore } from '@/stores/cart';
import type { ProductResponse } from '@/types/api';
import { Loader2, ShoppingCart } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';

interface Props {
  product: ProductResponse;
  locale: string;
}

export function ProductCard({ product, locale }: Props) {
  const t = useTranslations('Product');
  const { addItem } = useCart();
  const openCart = useCartStore((s) => s.open);
  const name = locale === 'ar' ? product.nameAr : product.nameEn;

  function handleAddToCart() {
    addItem.mutate(
      { productId: product.id, quantity: 1 },
      { onSuccess: openCart },
    );
  }

  return (
    <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      <Link href={`/${locale}/products/${product.slug}`} className="block">
        <div className="relative aspect-video bg-muted">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <ImagePlaceholder className="h-full w-full" />
          )}
        </div>
      </Link>
      <CardContent className="flex-1 p-4">
        <Link href={`/${locale}/products/${product.slug}`}>
          <h3 className="line-clamp-2 font-medium hover:underline">{name}</h3>
        </Link>
        <p className="mt-1 text-lg font-semibold">${product.price.toFixed(2)}</p>
        {!product.isAvailable && (
          <Badge variant="secondary" className="mt-1 text-xs">
            {t('outOfStock')}
          </Badge>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          size="sm"
          onClick={handleAddToCart}
          disabled={!product.isAvailable || addItem.isPending}
        >
          {addItem.isPending ? (
            <Loader2 className="me-2 h-4 w-4 animate-spin" />
          ) : (
            <ShoppingCart className="me-2 h-4 w-4" />
          )}
          {product.isAvailable ? t('addToCart') : t('outOfStock')}
        </Button>
      </CardFooter>
    </Card>
  );
}
