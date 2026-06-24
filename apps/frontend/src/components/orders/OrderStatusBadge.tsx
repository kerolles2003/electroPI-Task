import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/types/api';
import { useTranslations } from 'next-intl';

const STATUS_CLASS: Record<OrderStatus, string> = {
  PENDING:          'bg-muted text-muted-foreground',
  CONFIRMED:        'bg-accent text-accent-foreground',
  PREPARING:        'bg-primary/10 text-primary',
  OUT_FOR_DELIVERY: 'bg-primary text-primary-foreground',
  DELIVERED:        'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/25 dark:text-emerald-400',
  CANCELLED:        'bg-destructive/10 text-destructive',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const t = useTranslations('OrderStatus');
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        STATUS_CLASS[status],
      )}
    >
      {t(status)}
    </span>
  );
}
