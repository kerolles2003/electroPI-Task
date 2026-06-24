'use client';

import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { adminOrdersApi } from '@/lib/api/orders';
import type { OrderStatus } from '@/types/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

const UPDATABLE_STATUSES: OrderStatus[] = [
  'CONFIRMED',
  'PREPARING',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
];

export default function AdminOrderDetailPage() {
  const t = useTranslations('Admin');
  const ts = useTranslations('OrderStatus');
  const tp = useTranslations('PaymentStatus');
  const locale = useLocale();
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const qc = useQueryClient();
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');

  const { data: order, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'orders', orderNumber],
    queryFn: () => adminOrdersApi.byNumber(orderNumber),
    enabled: !!orderNumber,
  });

  const updateStatus = useMutation({
    mutationFn: (status: OrderStatus) => adminOrdersApi.updateStatus(orderNumber, status),
    onSuccess: (updated) => {
      qc.setQueryData(['admin', 'orders', orderNumber], updated);
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] });
      toast.success('Status updated');
      setNewStatus('');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update status'),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError) {
    return <ErrorState message="Failed to load order." onRetry={() => refetch()} />;
  }

  if (!order) {
    return (
      <div className="py-16 text-center text-muted-foreground">Order not found.</div>
    );
  }

  const isTerminal = order.status === 'DELIVERED' || order.status === 'CANCELLED';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/${locale}/admin/orders`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.productNameEn}{' '}
                    <span className="text-muted-foreground">× {item.quantity}</span>
                  </span>
                  <span className="font-medium">${item.lineTotal.toFixed(2)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${order.subtotalAmount.toFixed(2)}</span>
              </div>
              {order.deliveryFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Delivery</span>
                  <span>${order.deliveryFee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

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

        <div className="space-y-4">
          {order.payment && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method</span>
                  <span>{order.payment.method.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={order.payment.status === 'PAID' ? 'default' : 'secondary'}>
                    {tp(order.payment.status)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span>${order.payment.amount.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {!isTerminal && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('updateStatus')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select value={newStatus} onValueChange={(v) => setNewStatus(v as OrderStatus)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectStatus')} />
                  </SelectTrigger>
                  <SelectContent>
                    {UPDATABLE_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {ts(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  className="w-full"
                  onClick={() => newStatus && updateStatus.mutate(newStatus)}
                  disabled={!newStatus || updateStatus.isPending}
                >
                  {t('updateStatus')}
                </Button>
              </CardContent>
            </Card>
          )}

          <p className="text-right text-xs text-muted-foreground">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
