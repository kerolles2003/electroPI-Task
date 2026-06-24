'use client';

import { cn } from '@/lib/utils';
import { LayoutDashboard, Package, ShoppingBag } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Props {
  locale: string;
}

export function AdminSidebar({ locale }: Props) {
  const t = useTranslations('Admin');
  const pathname = usePathname();

  const items = [
    { href: `/${locale}/admin`, label: t('dashboard'), icon: LayoutDashboard },
    { href: `/${locale}/admin/products`, label: t('products'), icon: Package },
    { href: `/${locale}/admin/orders`, label: t('orders'), icon: ShoppingBag },
  ];

  function isActive(href: string) {
    return href === `/${locale}/admin` ? pathname === href : pathname.startsWith(href);
  }

  return (
    <>
      {/* Mobile: horizontal tab bar, hidden on md+ */}
      <nav className="flex border-b md:hidden">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 border-b-2 py-3 text-xs font-medium transition-colors',
              isActive(href)
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Desktop: vertical sidebar, hidden on mobile */}
      <aside className="hidden w-52 shrink-0 flex-col gap-1 border-e py-4 pe-4 md:flex">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Admin
        </p>
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive(href)
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent hover:text-accent-foreground',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </aside>
    </>
  );
}
