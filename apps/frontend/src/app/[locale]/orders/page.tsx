'use client';

import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/types/api';
import { ordersApi } from '@/lib/api/orders';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, PackageSearch } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';

const STATUS_DOT: Record<OrderStatus, string> = {
  PENDING:          'bg-muted-foreground/30',
  CONFIRMED:        'bg-accent-foreground/60',
  PREPARING:        'bg-primary/70',
  OUT_FOR_DELIVERY: 'bg-primary animate-pulse',
  DELIVERED:        'bg-emerald-500',
  CANCELLED:        'bg-destructive',
};

export default function OrdersPage() {
  const t = useTranslations('Orders');
  const locale = useLocale();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.list({ limit: 20 }),
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Skeleton className="mb-6 h-8 w-40" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <ErrorState message="Failed to load orders." onRetry={() => refetch()} />
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent">
          <PackageSearch className="h-9 w-9 text-accent-foreground/60" />
        </div>
        <h1
          className="font-display mb-2 text-2xl font-bold italic"
          style={{ fontVariationSettings: '"opsz" 72' }}
        >
          {t('empty')}
        </h1>
        <p className="mb-8 text-muted-foreground">{t('emptyHint')}</p>
        <Button asChild size="lg" className="rounded-full px-8">
          <Link href={`/${locale}`}>Browse Menu</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1
        className="font-display mb-6 text-2xl font-bold italic"
        style={{ fontVariationSettings: '"opsz" 72' }}
      >
        {t('title')}
      </h1>

      <div className="space-y-3">
        {data.items.map((order) => (
          <Link key={order.id} href={`/${locale}/orders/${order.orderNumber}`}>
            <div className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/25 hover:shadow-sm">
              {/* Status dot */}
              <span
                className={cn(
                  'h-2 w-2 flex-shrink-0 rounded-full',
                  STATUS_DOT[order.status],
                )}
              />

              {/* Info */}
              <div className="flex flex-1 items-center justify-between gap-3">
                <div className="min-w-0">
                  <p
                    className="font-display text-base font-bold leading-tight"
                    style={{ fontVariationSettings: '"opsz" 36' }}
                  >
                    {order.orderNumber}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'} ·{' '}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <OrderStatusBadge status={order.status} />
                  <p className="hidden font-bold text-primary sm:block">
                    ${order.totalAmount.toFixed(2)}
                  </p>
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
