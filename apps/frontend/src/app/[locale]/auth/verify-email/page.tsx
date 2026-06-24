'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/lib/api/auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Mail } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  type ClipboardEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { toast } from 'sonner';

export default function VerifyEmailPage() {
  const t = useTranslations('Auth');
  const locale = useLocale();
  const router = useRouter();
  const qc = useQueryClient();
  const { user, isLoading } = useAuth();
  const [digits, setDigits] = useState(['', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // If email already verified, redirect home
  useEffect(() => {
    if (!isLoading && user?.emailVerified) {
      router.replace(`/${locale}`);
    }
  }, [isLoading, user, locale, router]);

  // If not logged in at all, redirect to login
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(`/${locale}/auth/login`);
    }
  }, [isLoading, user, locale, router]);

  const verify = useMutation({
    mutationFn: (otp: string) => authApi.verifyEmail(otp),
    onSuccess: () => {
      // Update cached user so emailVerified = true
      qc.setQueryData(['auth', 'me'], (prev: typeof user) =>
        prev ? { ...prev, emailVerified: true } : prev,
      );
      toast.success('Email verified! Welcome aboard 🎉');
      router.push(`/${locale}`);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Invalid or expired code');
      setDigits(['', '', '', '']);
      inputRefs.current[0]?.focus();
    },
  });

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const next = [...digits];
    next[index] = value.slice(-1);
    setDigits(next);
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
    if (next.every((d) => d !== '')) {
      verify.mutate(next.join(''));
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (!pasted) return;
    const next = ['', '', '', ''];
    pasted.split('').forEach((char, i) => { next[i] = char; });
    setDigits(next);
    const focusIdx = Math.min(pasted.length, 3);
    inputRefs.current[focusIdx]?.focus();
    if (pasted.length === 4) {
      verify.mutate(pasted);
    }
  }

  // Hold spinner until we know the user is authenticated AND unverified.
  // Without this guard the form renders for one paint before useEffect redirects fire.
  if (isLoading || !user || user.emailVerified) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
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
          <CardTitle className="text-xl">{t('verifyEmailTitle')}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>{t('verifyEmailDesc')}</p>
            {user?.email && (
              <p className="mt-1 font-semibold text-foreground">{user.email}</p>
            )}
            <p className="mt-2">{t('verifyEmailHint')}</p>
          </div>

          {/* 4-digit OTP boxes */}
          <div className="flex justify-center gap-3" onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                disabled={verify.isPending}
                className="h-14 w-14 rounded-xl border-2 bg-background text-center text-2xl font-bold tracking-widest transition-colors focus:border-primary focus:outline-none disabled:opacity-50"
                style={{
                  borderColor: digit ? 'hsl(var(--primary))' : undefined,
                }}
              />
            ))}
          </div>

          <Button
            className="w-full"
            onClick={() => verify.mutate(digits.join(''))}
            disabled={digits.some((d) => !d) || verify.isPending}
          >
            {verify.isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {t('verifying')}
              </span>
            ) : (
              <>
                <CheckCircle2 className="me-2 h-4 w-4" />
                {t('verifyCode')}
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">{t('codeExpiry')}</p>

          <p className="text-center text-sm text-muted-foreground">
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
