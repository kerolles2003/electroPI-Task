'use client';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { authApi } from '@/lib/api/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const t = useTranslations('Auth');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const router = useRouter();
  const qc = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const register = useMutation({
    mutationFn: (d: FormData) =>
      authApi.register({
        name: d.name,
        email: d.email,
        password: d.password,
        preferredLocale: locale === 'ar' ? 'AR' : 'EN',
      }),
    onSuccess: (res) => {
      qc.setQueryData(['auth', 'me'], res.user);
      toast.success('Account created! Please verify your email.');
      router.push(`/${locale}/auth/verify-email`);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Registration failed');
    },
  });

  return (
    <>
      <div className="mb-8">
        <h1
          className={`font-display text-3xl font-bold${isAr ? '' : ' italic'}`}
          style={isAr ? undefined : { fontVariationSettings: '"opsz" 72' }}
        >
          {t('register')}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isAr ? 'انضم إلى FoodHub اليوم.' : 'Join FoodHub today.'}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit((d) => register.mutate(d))} className="space-y-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('name')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('namePlaceholder')}
                    autoComplete="name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                <FormLabel>{t('password')}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={t('passwordPlaceholder')}
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="mt-2 w-full" disabled={register.isPending}>
            {register.isPending ? t('registering') : t('register')}
          </Button>
        </form>
      </Form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t('hasAccount')}{' '}
        <Link
          href={`/${locale}/auth/login`}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {t('loginHere')}
        </Link>
      </p>
    </>
  );
}
