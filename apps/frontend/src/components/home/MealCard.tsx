'use client';

import { Button } from '@/components/ui/button';
import { ImagePlaceholder } from '@/components/ui/image-placeholder';
import { useCart } from '@/hooks/useCart';
import { useCartStore } from '@/stores/cart';
import type { ProductResponse } from '@/types/api';
import { Loader2, Plus, Star } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const RATINGS = [4.5, 4.7, 4.8, 4.6, 4.9];
const REVIEW_COUNTS = [98, 156, 243, 87, 312];

interface Props {
  product: ProductResponse;
  index?: number;
}

export function MealCard({ product, index = 0 }: Props) {
  const t = useTranslations('Product');
  const locale = useLocale();
  const { addItem } = useCart();
  const openCart = useCartStore((s) => s.open);
  const [imgError, setImgError] = useState(false);

  const name = locale === 'ar' ? product.nameAr : product.nameEn;
  const description = locale === 'ar' ? product.descriptionAr : product.descriptionEn;
  const categoryName = locale === 'ar' ? product.category.nameAr : product.category.nameEn;
  const rating = RATINGS[index % RATINGS.length];
  const reviewCount = REVIEW_COUNTS[index % REVIEW_COUNTS.length];

  function handleAddToCart() {
    addItem.mutate(
      { productId: product.id, quantity: 1 },
      { onSuccess: openCart },
    );
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow duration-300 ease-out hover:shadow-md hover:shadow-primary/10">
      {/* Image */}
      <Link href={`/${locale}/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {product.imageUrl && !imgError ? (
            <Image
              src={product.imageUrl}
              alt={name}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              onError={() => setImgError(true)}
            />
          ) : (
            <ImagePlaceholder className="h-full w-full" />
          )}

          {/* Dark semi-transparent category badge */}
          <div className="absolute start-2.5 top-2.5">
            <span className="rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {categoryName}
            </span>
          </div>

          {!product.isAvailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/55 backdrop-blur-[1px]">
              <span className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-foreground shadow-sm">
                {t('outOfStock')}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1.5 p-4 pb-0">
        <Link href={`/${locale}/products/${product.slug}`}>
          <h3 className="line-clamp-1 font-semibold leading-snug hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>

      {/* Footer — price+rating left, round add button right */}
      <div className="flex items-center justify-between p-4">
        <div>
          <p className="origin-left text-lg font-bold text-primary transition-transform duration-300 ease-out rtl:origin-right group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100">
            ${product.price.toFixed(2)}
          </p>
          <div className="mt-0.5 flex items-center gap-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium">{rating}</span>
            <span className="text-xs text-muted-foreground">({reviewCount})</span>
          </div>
        </div>

        <Button
          size="icon"
          onClick={handleAddToCart}
          disabled={!product.isAvailable || addItem.isPending}
          className="h-10 w-10 shrink-0 rounded-full shadow-md shadow-primary/25 duration-300 ease-out group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/35 active:scale-95 motion-reduce:group-hover:scale-100"
          aria-label={t('addToCart')}
        >
          {addItem.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
