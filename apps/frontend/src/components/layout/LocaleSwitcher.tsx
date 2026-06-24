'use client';

import { Button } from '@/components/ui/button';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function switchLocale() {
    const next = locale === 'en' ? 'ar' : 'en';
    const segments = pathname.split('/');
    segments[1] = next;
    startTransition(() => {
      router.replace(segments.join('/'));
    });
  }

  return (
    <Button variant="ghost" size="sm" onClick={switchLocale} disabled={isPending}>
      {locale === 'en' ? 'عربي' : 'EN'}
    </Button>
  );
}
