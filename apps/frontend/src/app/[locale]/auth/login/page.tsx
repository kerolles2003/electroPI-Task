'use client';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { authApi } from '@/lib/api/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

function LoginForm() {
  const t = useTranslations('Auth');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const router = useRouter();
  const qc = useQueryClient();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '';

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const login = useMutation({
    mutationFn: authApi.login,
    onSuccess: (user) => {
      qc.setQueryData(['auth', 'me'], user);
      toast.success(`Welcome back, ${user.name}!`);
      router.push(redirect || `/${locale}`);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Login failed');
    },
  });

  return (
    <>
      <div className="mb-8">
        <h1
          className={`font-display text-3xl font-bold${isAr ? '' : ' italic'}`}
          style={isAr ? undefined : { fontVariationSettings: '"opsz" 72' }}
        >
          {t('login')}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isAr ? 'مرحباً بعودتك إلى FoodHub.' : 'Welcome back to FoodHub.'}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit((d) => login.mutate(d))} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('email')}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>{t('password')}</FormLabel>
                  <Link
                    href={`/${locale}/auth/forgot-password`}
                    className="text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
                    tabIndex={-1}
                  >
                    {t('forgotPassword')}
                  </Link>
                </div>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={t('passwordPlaceholder')}
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="mt-2 w-full" disabled={login.isPending}>
            {login.isPending ? t('loggingIn') : t('login')}
          </Button>
        </form>
      </Form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t('noAccount')}{' '}
        <Link
          href={`/${locale}/auth/register`}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {t('registerHere')}
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
