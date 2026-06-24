import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('Common');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2">
      <h1 className="text-3xl font-semibold">{t('appName')}</h1>
      <p className="text-muted-foreground">{t('tagline')}</p>
    </main>
  );
}
