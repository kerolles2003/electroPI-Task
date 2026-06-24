'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/hooks/useCart';
import { useCartStore } from '@/stores/cart';
import { ImagePlaceholder } from '@/components/ui/image-placeholder';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';

export function CartDrawer() {
  const t = useTranslations('Cart');
  const locale = useLocale();
  const { isOpen, close } = useCartStore();
  const { cart, isLoading, updateItem, removeItem } = useCart();
  const isRtl = locale === 'ar';

  return (
    <Sheet open={isOpen} onOpenChange={(o) => !o && close()}>
      <SheetContent side={isRtl ? 'left' : 'right'} className="flex w-full flex-col sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>{t('title')}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {isLoading && (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          )}

          {!isLoading && (!cart || cart.items.length === 0) && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <p className="text-muted-foreground">{t('empty')}</p>
              <p className="text-sm text-muted-foreground">{t('emptyHint')}</p>
              <Button asChild variant="outline" onClick={close}>
                <Link href={`/${locale}`}>{t('browseMenu')}</Link>
              </Button>
            </div>
          )}

          {!isLoading && cart && cart.items.length > 0 && (
            <div className="space-y-4">
              {cart.items.map((item) => {
                const name = locale === 'ar' ? item.product.nameAr : item.product.nameEn;
                return (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                      {item.product.imageUrl ? (
                        <Image
                          src={item.product.imageUrl}
                          alt={name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <ImagePlaceholder className="h-full w-full" />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <p className="text-sm font-medium leading-tight">{name}</p>
                      <p className="text-sm text-muted-foreground">
                        ${item.unitPrice.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateItem.mutate({ itemId: item.id, quantity: item.quantity - 1 })}
                          disabled={item.quantity <= 1 || updateItem.isPending}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateItem.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                          disabled={updateItem.isPending}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <span className="ms-auto text-sm font-medium">
                          ${item.lineTotal.toFixed(2)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={() => removeItem.mutate(item.id)}
                          disabled={removeItem.isPending}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {cart && cart.items.length > 0 && (
          <SheetFooter className="flex-col gap-3">
            <Separator />
            <div className="flex items-center justify-between text-sm font-medium">
              <span>{t('subtotal')}</span>
              <span>${cart.subtotal.toFixed(2)}</span>
            </div>
            <Button asChild className="w-full" onClick={close}>
              <Link href={`/${locale}/checkout`}>{t('checkout')}</Link>
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
