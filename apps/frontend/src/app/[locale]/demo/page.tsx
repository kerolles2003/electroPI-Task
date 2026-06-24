'use client';

import { Button } from '@/components/ui/button';
import { authApi } from '@/lib/api/auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LayoutDashboard, Loader2, Lock, ShoppingBag, User } from 'lucide-react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

const ADMIN_EMAIL = 'admin@electro-pi.com';
const ADMIN_PASS  = 'Admin@123456';

export default function DemoPage() {
  const locale = useLocale();
  const router = useRouter();
  const qc = useQueryClient();
  const [copied, setCopied] = useState<'email' | 'pass' | null>(null);

  const loginAs = useMutation({
    mutationFn: authApi.login,
    onSuccess: (user) => {
      qc.setQueryData(['auth', 'me'], user);
      router.push(`/${locale}/admin`);
    },
    onError: () => toast.error('Login failed — is the backend running?'),
  });

  function copy(text: string, field: 'email' | 'pass') {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(field);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
      {/* Badge */}
      <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-primary">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        Portfolio Demo
      </span>

      {/* Heading */}
      <h1
        className="font-display mb-3 text-4xl font-bold italic leading-tight"
        style={{ fontVariationSettings: '"opsz" 144' }}
      >
        FoodHub
      </h1>
      <p className="mb-10 max-w-sm text-muted-foreground">
        A bilingual food-delivery platform — React, Next.js, NestJS, Prisma. Click below to enter the admin dashboard instantly.
      </p>

      {/* One-click admin entry */}
      <Button
        size="lg"
        className="mb-4 h-14 w-full rounded-full gap-3 text-base font-semibold shadow-lg shadow-primary/30"
        onClick={() => loginAs.mutate({ email: ADMIN_EMAIL, password: ADMIN_PASS })}
        disabled={loginAs.isPending}
      >
        {loginAs.isPending ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <LayoutDashboard className="h-5 w-5" />
        )}
        {loginAs.isPending ? 'Logging in…' : 'Open Admin Dashboard'}
      </Button>

      {/* Browse storefront link */}
      <Button asChild variant="outline" size="lg" className="mb-10 h-12 w-full rounded-full gap-2">
        <Link href={`/${locale}`}>
          <ShoppingBag className="h-4 w-4" />
          Browse the storefront
        </Link>
      </Button>

      {/* Credentials card */}
      <div className="w-full rounded-2xl border border-border bg-card p-5 text-start">
        <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          <Lock className="h-3.5 w-3.5" />
          Admin credentials
        </p>
        <div className="space-y-3">
          {[
            { label: 'Email', value: ADMIN_EMAIL, field: 'email' as const },
            { label: 'Password', value: ADMIN_PASS, field: 'pass' as const },
          ].map(({ label, value, field }) => (
            <div key={field} className="flex items-center justify-between gap-3 rounded-lg bg-muted px-3 py-2.5">
              <div className="min-w-0">
                <p className="mb-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                  {label}
                </p>
                <p className="truncate font-mono text-sm font-medium">{value}</p>
              </div>
              <button
                onClick={() => copy(value, field)}
                className="shrink-0 rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
              >
                {copied === field ? 'Copied' : 'Copy'}
              </button>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Or{' '}
          <Link href={`/${locale}/auth/login`} className="text-primary underline-offset-2 hover:underline">
            log in manually
          </Link>{' '}
          with the credentials above.
        </p>
      </div>

      {/* Customer preview note */}
      <div className="mt-6 w-full rounded-2xl border border-border bg-card p-5 text-start">
        <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          <User className="h-3.5 w-3.5" />
          Customer view
        </p>
        <p className="text-sm text-muted-foreground">
          Register a new account or use any email to explore the customer flow — cart, checkout, order tracking, and bilingual EN/AR switching.
        </p>
        <Button asChild variant="ghost" size="sm" className="mt-3 -ms-2 text-primary">
          <Link href={`/${locale}/auth/register`}>Create a customer account →</Link>
        </Button>
      </div>
    </div>
  );
}
