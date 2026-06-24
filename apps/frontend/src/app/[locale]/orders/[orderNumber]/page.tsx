'use client';

import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ordersApi } from '@/lib/api/orders';
import type { OrderStatus } from '@/types/api';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Check } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const JOURNEY: { key: string; label: string }[] = [
  { key: 'PENDING',          label: 'Placed' },
  { key: 'CONFIRMED',        label: 'Confirmed' },
  { key: 'PREPARING',        label: 'Preparing' },
  { key: 'OUT_FOR_DELIVERY', label: 'On its way' },
  { key: 'DELIVERED',        label: 'Delivered' },
];

function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === 'CANCELLED') {
    return (
      <p className="rounded-lg bg-destructive/8 px-4 py-2.5 text-sm font-medium text-destructive">
        This order was cancelled.
      </p>
    );
  }

  const currentIdx = JOURNEY.findIndex((s) => s.key === status);
  const progressPct = (currentIdx / (JOURNEY.length - 1)) * 100;
  const progressRem = (currentIdx / (JOURNEY.length - 1)) * 2;

  return (
    <div className="relative pt-1 pb-2">
      {/* Background rail — spans between centers of first and last circles */}
      <div className="absolute inset-x-4 top-4 h-px translate-y-0.5 bg-border" />
      {/* Filled portion */}
      <div
        className="absolute top-4 h-px translate-y-0.5 bg-primary transition-all duration-700"
        style={{
          left: '1rem',
          width: progressPct === 0
            ? '0px'
            : `calc(${progressPct}% - ${progressRem}rem)`,
        }}
      />
      {/* Step circles */}
      <div className="relative flex justify-between">
        {JOURNEY.map(({ key, label }, i) => {
          const isPast = i < currentIdx;
          const isCurrent = i === currentIdx;
          return (
            <div key={key} className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all',
                  isPast
                    ? 'border-primary bg-primary text-primary-foreground'
                    : isCurrent
                    ? 'border-primary bg-background text-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.15)]'
                    : 'border-border bg-background text-muted-foreground/40',
                )}
              >
                {isPast ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span
                className={cn(
                  'hidden text-center text-[0.6rem] font-semibold uppercase tracking-wide sm:block',
                  isPast
                    ? 'text-muted-foreground'
                    : isCurrent
                    ? 'text-primary'
                    : 'text-muted-foreground/35',
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const t = useTranslations('Orders');
  const tp = useTranslations('PaymentStatus');
  const locale = useLocale();
  const { orderNumber } = useParams<{ orderNumber: string }>();

  const { data: order, isLoading, isError, refetch } = useQuery({
    queryKey: ['orders', orderNumber],
    queryFn: () => ordersApi.byNumber(orderNumber),
    enabled: !!orderNumber,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Skeleton className="mb-6 h-6 w-24" />
        <Skeleton className="mb-4 h-8 w-56" />
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <ErrorState message="Failed to load order." onRetry={() => refetch()} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-muted-foreground">Order not found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href={`/${locale}/orders`}>Back to Orders</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Button variant="ghost" size="sm" asChild className="mb-4 -ms-2">
        <Link href={`/${locale}/orders`}>
          <ArrowLeft className="me-2 h-4 w-4 rtl:rotate-180" />
          {t('title')}
        </Link>
      </Button>

      {/* Order header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1
            className="font-display text-2xl font-bold italic"
            style={{ fontVariationSettings: '"opsz" 72' }}
          >
            {order.orderNumber}
          </h1>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {new Date(order.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="space-y-4">
        {/* Status timeline */}
        <Card>
          <CardContent className="pt-6">
            <OrderTimeline status={order.status} />
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('items')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.items.map((item) => {
              const name = locale === 'ar' ? item.productNameAr : item.productNameEn;
              return (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {name}{' '}
                    <span className="text-muted-foreground">× {item.quantity}</span>
                  </span>
                  <span className="font-medium">${item.lineTotal.toFixed(2)}</span>
                </div>
              );
            })}
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${order.subtotalAmount.toFixed(2)}</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span>${order.deliveryFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold">
              <span>{t('total')}</span>
              <span className="text-primary">${order.totalAmount.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment */}
        {order.payment && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('paymentMethod')}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-sm capitalize">
                {order.payment.method.replace(/_/g, ' ')}
              </span>
              <Badge variant={order.payment.status === 'PAID' ? 'default' : 'secondary'}>
                {tp(order.payment.status)}
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {order.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{order.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
