'use client';

import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useAuth } from '@/hooks/useAuth';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAdmin } = useAuth();
  const locale = useLocale();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      router.replace(`/${locale}/auth/login`);
    }
  }, [isLoading, user, isAdmin, locale, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* AdminSidebar renders mobile tab-bar (md:hidden) AND desktop sidebar (hidden md:flex) */}
      <div className="flex flex-col md:flex-row md:gap-6">
        <AdminSidebar locale={locale} />
        <div className="min-w-0 flex-1 py-6">{children}</div>
      </div>
    </div>
  );
}
