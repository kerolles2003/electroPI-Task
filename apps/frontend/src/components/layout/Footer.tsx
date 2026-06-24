'use client';

import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  const tc = useTranslations('Common');
  const tn = useTranslations('Nav');
  const locale = useLocale();

  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link
              href={`/${locale}`}
              className={`font-display text-2xl font-bold text-primary${locale !== 'ar' ? ' italic' : ''}`}
              style={locale !== 'ar' ? { fontVariationSettings: '"opsz" 36' } : undefined}
            >
              {tc('appName')}
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {tc('tagline')}
            </p>
            <p className="mt-5 text-sm font-medium text-foreground">{tc('openHours')}</p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {tc('menu')}
            </h4>
            <nav className="flex flex-col gap-2.5">
              {[
                { label: tn('home'), href: `/${locale}` },
                { label: tn('orders'), href: `/${locale}/orders` },
                { label: tn('cart'), href: `/${locale}/cart` },
              ].map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="w-fit text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {tc('contact')}
            </h4>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <a
                href="mailto:hello@foodhub.com"
                className="flex w-fit items-center gap-2.5 transition-colors hover:text-foreground"
              >
                <Mail className="h-4 w-4 shrink-0 text-primary/70" />
                hello@foodhub.com
              </a>
              <a
                href="tel:+18001234567"
                className="flex w-fit items-center gap-2.5 transition-colors hover:text-foreground"
              >
                <Phone className="h-4 w-4 shrink-0 text-primary/70" />
                +1 (800) 123-4567
              </a>
              <span className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-primary/70" />
                123 Food Street, NY
              </span>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {tc('appName')}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Made with Kerolles Sobhy
          </p>
        </div>
      </div>
    </footer>
  );
}
