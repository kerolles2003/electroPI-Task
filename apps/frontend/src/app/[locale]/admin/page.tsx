'use client';

import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { cn } from '@/lib/utils';
import { dashboardApi } from '@/lib/api/orders';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, Package, ShoppingBag, Users } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const t = useTranslations('Admin');
  const locale = useLocale();

  const {
    data: overview,
    isLoading: overviewLoading,
    isError: overviewError,
    refetch: refetchOverview,
  } = useQuery({
    queryKey: ['admin', 'dashboard', 'overview'],
    queryFn: dashboardApi.overview,
  });

  const {
    data: recentOrders,
    isLoading: ordersLoading,
    isError: ordersError,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ['admin', 'dashboard', 'recent-orders'],
    queryFn: () => dashboardApi.recentOrders({ limit: 5 }),
  });

  const stats = [
    {
      label: t('totalUsers'),
      value: overview?.totalUsers,
      icon: Users,
      accent: false,
    },
    {
      label: t('totalOrders'),
      value: overview?.totalOrders,
      icon: ShoppingBag,
      accent: false,
    },
    {
      label: t('totalRevenue'),
      value: overview ? `$${overview.totalRevenue.toFixed(2)}` : undefined,
      icon: DollarSign,
      accent: true,
    },
    {
      label: t('pendingOrders'),
      value: overview?.pendingOrders,
      icon: Package,
      accent: true,
    },
  ];

  return (
    <div className="space-y-6">
      <h1
        className="font-display text-2xl font-bold italic"
        style={{ fontVariationSettings: '"opsz" 72' }}
      >
        {t('dashboard')}
      </h1>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, accent }) => (
          <Card
            key={label}
            className={cn(accent && 'ring-1 ring-primary/20')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg',
                  accent ? 'bg-primary/10' : 'bg-muted',
                )}
              >
                <Icon
                  className={cn('h-4 w-4', accent ? 'text-primary' : 'text-muted-foreground')}
                />
              </div>
            </CardHeader>
            <CardContent>
              {overviewLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : overviewError ? (
                <p className="text-sm text-destructive">Error</p>
              ) : (
                <p
                  className={cn(
                    'font-display text-2xl font-bold',
                    accent ? 'text-primary' : 'text-foreground',
                  )}
                  style={{ fontVariationSettings: '"opsz" 36' }}
                >
                  {value ?? '—'}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent orders */}
      <Card>
        <CardHeader>
          <CardTitle
            className="font-display text-base font-bold italic"
            style={{ fontVariationSettings: '"opsz" 36' }}
          >
            {t('recentOrders')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : ordersError ? (
            <ErrorState message="Failed to load orders." onRetry={() => refetchOrders()} />
          ) : !recentOrders || recentOrders.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('noOrders')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.items.map((order) => (
                  <TableRow key={order.orderNumber}>
                    <TableCell>
                      <Link
                        href={`/${locale}/admin/orders/${order.orderNumber}`}
                        className="font-display font-bold hover:text-primary hover:underline"
                        style={{ fontVariationSettings: '"opsz" 36' }}
                      >
                        {order.orderNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.orderStatus} />
                    </TableCell>
                    <TableCell className="font-medium text-primary">
                      ${order.totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
