'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/lib/api/auth';
import { useQueryClient } from '@tanstack/react-query';
import { LayoutDashboard, LogOut, PackageSearch, Search, User, UserPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { CartButton } from './CartButton';
import { LocaleSwitcher } from './LocaleSwitcher';
import { ThemeSwitcher } from './ThemeSwitcher';

export function Navbar() {
  const t = useTranslations('Nav');
  const tc = useTranslations('Common');
  const th = useTranslations('Home');
  const { user, isAuthenticated, isAdmin } = useAuth();
  const qc = useQueryClient();
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();
  const [search, setSearch] = useState('');

  async function handleLogout() {
    try {
      await authApi.logout();
      qc.clear();
      toast.success('Logged out');
      router.push(`/${locale}`);
    } catch {
      toast.error('Logout failed');
    }
  }

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const q = search.trim();
    router.push(`/${locale}${q ? `?q=${encodeURIComponent(q)}` : ''}`);
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        {/* Logo */}
        <Link
          href={`/${locale}`}
          className={`font-display shrink-0 text-xl font-bold text-primary${locale !== 'ar' ? ' italic' : ''}`}
          style={locale !== 'ar' ? { fontVariationSettings: '"opsz" 36' } : undefined}
        >
          {tc('appName')}
        </Link>

        {/* Desktop search — centered */}
        <form
          onSubmit={handleSearch}
          className="relative hidden flex-1 max-w-sm md:flex"
        >
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="ps-9 pe-4 h-9 rounded-full"
            placeholder={th('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div className="ms-auto flex items-center gap-1">
          <ThemeSwitcher />
          <LocaleSwitcher />
          <Button
            asChild
            size="sm"
            variant="outline"
            className="hidden gap-1.5 rounded-full border-primary/40 text-primary hover:border-primary hover:bg-accent sm:flex"
          >
            <Link href={`/${locale}/demo`}>
              <LayoutDashboard className="h-3.5 w-3.5" />
              Admin Demo
            </Link>
          </Button>
          <CartButton />

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={t('account')}>
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-sm font-medium">{user?.name}</div>
                <div className="truncate px-2 pb-1.5 text-xs text-muted-foreground">
                  {user?.email}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/orders`}>
                    <PackageSearch className="me-2 h-4 w-4" />
                    {t('orders')}
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href={`/${locale}/admin`}>
                      <LayoutDashboard className="me-2 h-4 w-4" />
                      {t('admin')}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="me-2 h-4 w-4" />
                  {t('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <div className="flex sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Account">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/${locale}/auth/login`}>
                        <User className="me-2 h-4 w-4" />
                        {t('login')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/${locale}/auth/register`}>
                        <UserPlus className="me-2 h-4 w-4" />
                        {t('register')}
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="hidden items-center gap-1 sm:flex">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/${locale}/auth/login`}>{t('login')}</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href={`/${locale}/auth/register`}>{t('register')}</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </nav>

      {/* Mobile search row */}
      <div className="border-t px-4 py-2 md:hidden">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="ps-9 h-9 rounded-full"
            placeholder={th('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
      </div>
    </header>
  );
}
