import { CartDrawer } from '@/components/layout/CartDrawer';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { Providers } from '@/components/providers/Providers';
import { locales, type AppLocale } from '@/i18n';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Cairo, DM_Sans, Fraunces } from 'next/font/google';
import { notFound } from 'next/navigation';
import '../globals.css';

/* Latin display — dramatic optical-size serif */
const displayFont = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  axes: ['opsz'],
});

/* Latin body — geometric, warm, legible */
const bodyFont = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

/* Arabic display + body — geometric structure matches DM Sans.
   Covers both Arabic and Latin glyphs for bilingual mixed text. */
const arabicFont = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-arabic',
  display: 'swap',
  weight: ['400', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'FoodHub — Fresh Food Delivered',
  description: 'Order your favourite meals and get them delivered fast.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as AppLocale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body
        className={`${displayFont.variable} ${bodyFont.variable} ${arabicFont.variable} min-h-screen bg-background font-sans antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <Navbar />
            <CartDrawer />
            <main className="flex min-h-[calc(100vh-3.5rem)] flex-col">
              {children}
            </main>
            <Footer />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
