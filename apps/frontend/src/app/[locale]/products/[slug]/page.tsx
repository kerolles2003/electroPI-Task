'use client';

import { MealCard } from '@/components/home/MealCard';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';
import { ImagePlaceholder } from '@/components/ui/image-placeholder';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/hooks/useCart';
import { useCartStore } from '@/stores/cart';
import { productsApi } from '@/lib/api/products';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Minus, Plus, ShoppingCart, Star } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

export default function ProductPage() {
  const t = useTranslations('Product');
  const th = useTranslations('Home');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const openCart = useCartStore((s) => s.open);
  const [quantity, setQuantity] = useState(1);
  const [imgError, setImgError] = useState(false);

  const { data: product, isLoading, isError, refetch } = useQuery({
    queryKey: ['products', slug],
    queryFn: () => productsApi.bySlug(slug),
    enabled: !!slug,
  });

  const { data: relatedData } = useQuery({
    queryKey: ['products', { category: product?.category?.slug, limit: 4 }],
    queryFn: () => productsApi.list({ category: product!.category.slug, limit: 8 }),
    enabled: !!product?.category?.slug,
  });

  const relatedProducts = relatedData?.items.filter((p) => p.slug !== slug).slice(0, 4) ?? [];

  function handleAddToCart() {
    if (!product) return;
    addItem.mutate({ productId: product.id, quantity }, { onSuccess: openCart });
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Skeleton className="mb-6 h-6 w-24" />
        <div className="grid gap-10 md:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="space-y-5">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="mt-6 h-14 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <ErrorState message="Failed to load product." onRetry={() => refetch()} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <p className="text-muted-foreground">Product not found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href={`/${locale}`}>Back to Menu</Link>
        </Button>
      </div>
    );
  }

  const name = isAr ? product.nameAr : product.nameEn;
  const description = isAr ? product.descriptionAr : product.descriptionEn;
  const categoryName = isAr ? product.category.nameAr : product.category.nameEn;
  const total = (product.price * quantity).toFixed(2);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Button variant="ghost" size="sm" asChild className="mb-6 -ms-2">
        <Link href={`/${locale}`}>
          <ArrowLeft className="me-2 h-4 w-4 rtl:rotate-180" />
          Back to Menu
        </Link>
      </Button>

      <div className="grid gap-10 md:grid-cols-2">
        {/* Product image */}
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
          {product.imageUrl && !imgError ? (
            <Image
              src={product.imageUrl}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              onError={() => setImgError(true)}
            />
          ) : (
            <ImagePlaceholder className="h-full w-full" />
          )}
          {/* Warm vignette at bottom */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#1C1410]/30 to-transparent" />
        </div>

        {/* Product info */}
        <div className="flex flex-col gap-5">
          {/* Category + availability */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
              {categoryName}
            </span>
            {product.isAvailable ? (
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                ✓ {t('available')}
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                {t('unavailable')}
              </span>
            )}
          </div>

          {/* Name */}
          <h1
            className={cn(
              'font-display text-3xl font-bold leading-tight md:text-4xl',
              !isAr && 'italic',
            )}
            style={isAr ? undefined : { fontVariationSettings: '"opsz" 72' }}
          >
            {name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < 4 ? 'fill-primary text-primary' : 'fill-muted text-muted-foreground/30'}`}
                />
              ))}
            </div>
            <span className="text-sm font-semibold">4.8</span>
            <span className="text-sm text-muted-foreground">(243 {th('reviews')})</span>
          </div>

          {/* Price */}
          <p
            className="font-display text-4xl font-bold text-primary"
            style={{ fontVariationSettings: '"opsz" 72' }}
          >
            ${product.price.toFixed(2)}
          </p>

          {/* Description */}
          {description && (
            <div>
              <h2 className="mb-1.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t('description')}
              </h2>
              <p className="leading-relaxed text-foreground/80">{description}</p>
            </div>
          )}

          {product.isAvailable && (
            <>
              {/* Quantity selector */}
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Quantity
                </p>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-10 text-center text-lg font-bold">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full"
                    onClick={() => setQuantity((q) => q + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={addItem.isPending}
                className="mt-2 h-14 gap-3 rounded-full text-base font-semibold shadow-lg shadow-primary/30"
              >
                {addItem.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <ShoppingCart className="h-5 w-5" />
                )}
                {addItem.isPending ? 'Adding…' : `${t('addToCart')} — $${total}`}
              </Button>
            </>
          )}

          {!product.isAvailable && (
            <Button size="lg" disabled className="h-14 rounded-full text-base">
              {t('outOfStock')}
            </Button>
          )}
        </div>
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2
            className={cn(
              'font-display mb-6 text-2xl font-bold',
              !isAr && 'italic',
            )}
            style={isAr ? undefined : { fontVariationSettings: '"opsz" 72' }}
          >
            {th('relatedProducts')}
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((p, i) => (
              <MealCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
