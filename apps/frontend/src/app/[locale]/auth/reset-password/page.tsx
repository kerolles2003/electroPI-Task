'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { authApi } from '@/lib/api/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { KeyRound, Loader2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const schema = z
  .object({
    password: z.string().min(8).max(72),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

function ResetPasswordForm() {
  const t = useTranslations('Auth');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const reset = useMutation({
    mutationFn: (data: FormData) => authApi.resetPassword(token, data.password),
    onSuccess: () => {
      toast.success(t('resetSuccess'));
      router.push(`/${locale}/auth/login`);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to reset password');
    },
  });

  if (!token) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-sm flex-col items-center justify-center px-4 py-12">
        <Card className="w-full">
          <CardContent className="pt-8 pb-6 text-center space-y-4">
            <p className="text-sm text-muted-foreground">{t('invalidResetToken')}</p>
            <Link
              href={`/${locale}/auth/forgot-password`}
              className="inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              {t('sendResetLink')}
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-sm flex-col items-center justify-center px-4 py-12">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <KeyRound className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-xl">{t('resetPasswordTitle')}</CardTitle>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((d) => reset.mutate(d))}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('newPassword')}</FormLabel>
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
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('confirmPassword')}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t('confirmPasswordPlaceholder')}
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={reset.isPending}>
                {reset.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('resetting')}
                  </span>
                ) : (
                  t('resetPassword')
                )}
              </Button>
            </form>
          </Form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link
              href={`/${locale}/auth/login`}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {t('backToLogin')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
