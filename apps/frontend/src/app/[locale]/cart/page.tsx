'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { ImagePlaceholder } from '@/components/ui/image-placeholder';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/hooks/useCart';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';

export default function CartPage() {
  const t = useTranslations('Cart');
  const locale = useLocale();
  const { cart, isLoading, isError, refetch, updateItem, removeItem, clearCart } = useCart();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Skeleton className="mb-6 h-8 w-32" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <ErrorState message="Failed to load cart." onRetry={() => refetch()} />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent">
          <ShoppingBag className="h-9 w-9 text-accent-foreground/60" />
        </div>
        <h1 className="font-display mb-2 text-2xl font-bold italic" style={{ fontVariationSettings: '"opsz" 72' }}>
          {t('empty')}
        </h1>
        <p className="mb-8 text-muted-foreground">{t('emptyHint')}</p>
        <Button asChild size="lg" className="rounded-full px-8">
          <Link href={`/${locale}`}>{t('browseMenu')}</Link>
        </Button>
      </div>
    );
  }

  const deliveryFee = cart.subtotal >= 20 ? 0 : 2.99;
  const total = cart.subtotal + deliveryFee;
  const remaining = Math.max(0, 20 - cart.subtotal);
  const progressPct = Math.min(100, (cart.subtotal / 20) * 100);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold italic" style={{ fontVariationSettings: '"opsz" 72' }}>
          {t('title')}
          <span className="ms-2 font-sans text-lg font-normal not-italic text-muted-foreground">
            ({cart.items.length})
          </span>
        </h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => clearCart.mutate()}
          disabled={clearCart.isPending}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="me-2 h-4 w-4" />
          {t('clear')}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cart items */}
        <div className="space-y-4 lg:col-span-2">
          {cart.items.map((item) => {
            const name = locale === 'ar' ? item.product.nameAr : item.product.nameEn;
            return (
              <div
                key={item.id}
                className="flex gap-4 rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-sm"
              >
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
                  {item.product.imageUrl ? (
                    <Image
                      src={item.product.imageUrl}
                      alt={name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <ImagePlaceholder className="h-full w-full" />
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold leading-tight">{name}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        ${item.unitPrice.toFixed(2)} each
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeItem.mutate(item.id)}
                      disabled={removeItem.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() =>
                          updateItem.mutate({ itemId: item.id, quantity: item.quantity - 1 })
                        }
                        disabled={item.quantity <= 1 || updateItem.isPending}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() =>
                          updateItem.mutate({ itemId: item.id, quantity: item.quantity + 1 })
                        }
                        disabled={updateItem.isPending}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="font-bold">${item.lineTotal.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order summary */}
        <div>
          <Card className="lg:sticky lg:top-20">
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cart.items.map((item) => {
                const name = locale === 'ar' ? item.product.nameAr : item.product.nameEn;
                return (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="line-clamp-1 flex-1 text-muted-foreground">
                      {name} × {item.quantity}
                    </span>
                    <span className="shrink-0 font-medium">${item.lineTotal.toFixed(2)}</span>
                  </div>
                );
              })}

              <Separator />

              {/* Delivery progress */}
              {deliveryFee > 0 ? (
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Add ${remaining.toFixed(2)} for free delivery
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-xs font-medium text-primary">✓ Free delivery on this order</p>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('subtotal')}</span>
                <span>${cart.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span className={deliveryFee === 0 ? 'font-medium text-primary' : ''}>
                  {deliveryFee === 0 ? 'Free' : `$${deliveryFee.toFixed(2)}`}
                </span>
              </div>

              <Separator />

              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild size="lg" className="w-full gap-2 rounded-full">
                <Link href={`/${locale}/checkout`}>
                  {t('checkout')}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
