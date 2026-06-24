'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { authApi } from '@/lib/api/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, Mail } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const t = useTranslations('Auth');
  const locale = useLocale();
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const send = useMutation({
    mutationFn: (data: FormData) => authApi.forgotPassword(data.email),
    onSuccess: (_, vars) => {
      setSentEmail(vars.email);
      setSent(true);
    },
    onError: () => {
      // Backend always returns 200 — treat any error as success to avoid enumeration
      setSentEmail(form.getValues('email'));
      setSent(true);
    },
  });

  if (sent) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-sm flex-col items-center justify-center px-4 py-12">
        <Card className="w-full">
          <CardContent className="pt-8 pb-6 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{t('resetLinkSentTitle')}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{t('resetLinkSentDesc')}</p>
              {sentEmail && (
                <p className="mt-1 text-sm font-semibold">{sentEmail}</p>
              )}
            </div>
            <Link
              href={`/${locale}/auth/login`}
              className="inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              {t('backToLogin')}
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
            <Mail className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-xl">{t('forgotPasswordTitle')}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{t('forgotPasswordDesc')}</p>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((d) => send.mutate(d))} className="space-y-4">
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
              <Button type="submit" className="w-full" disabled={send.isPending}>
                {send.isPending ? t('sending') : t('sendResetLink')}
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
