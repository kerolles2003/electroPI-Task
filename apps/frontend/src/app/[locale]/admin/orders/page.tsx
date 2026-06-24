'use client';

import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { adminOrdersApi } from '@/lib/api/orders';
import type { OrderStatus } from '@/types/api';
import { useQuery } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';

const ORDER_STATUSES: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
];

export default function AdminOrdersPage() {
  const t = useTranslations('Admin');
  const ts = useTranslations('OrderStatus');
  const locale = useLocale();
  const [status, setStatus] = useState<OrderStatus | ''>('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'orders', status],
    queryFn: () => adminOrdersApi.list({ limit: 50, status: status || undefined }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('orders')}</h1>
        <Select value={status} onValueChange={(v) => setStatus(v === 'all' ? '' : v as OrderStatus)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {ts(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <ErrorState message="Failed to load orders." onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && (!data || data.items.length === 0) && (
        <div className="py-16 text-center text-muted-foreground">{t('noOrders')}</div>
      )}

      {!isLoading && !isError && data && data.items.length > 0 && (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>{order.items.length}</TableCell>
                  <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/${locale}/admin/orders/${order.orderNumber}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
