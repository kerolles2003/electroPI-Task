'use client';

import { useTranslations } from 'next-intl';
import { Award, Leaf, Truck } from 'lucide-react';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';

const FEATURES = [
  {
    icon: Truck,
    titleKey: 'fastDelivery' as const,
    descKey: 'fastDeliveryDesc' as const,
    /* Amber — matches brand */
    iconColor: 'text-primary',
    iconBg: 'bg-accent',
  },
  {
    icon: Leaf,
    titleKey: 'freshIngredients' as const,
    descKey: 'freshIngredientsDesc' as const,
    /* Forest green for freshness */
    iconColor: 'text-emerald-700 dark:text-emerald-400',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
  },
  {
    icon: Award,
    titleKey: 'bestQuality' as const,
    descKey: 'bestQualityDesc' as const,
    /* Warm amber again — consistency */
    iconColor: 'text-primary',
    iconBg: 'bg-accent',
  },
];

export function WhyChooseUs() {
  const t = useTranslations('Home');

  return (
    <section className="bg-muted/40 py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal duration={700} y={14}>
          <SectionHeading
            align="center"
            title={t('whyChooseUs')}
            description={t('whyDesc')}
            className="mb-12"
          />
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, titleKey, descKey, iconColor, iconBg }, i) => (
            <Reveal key={titleKey} delay={i * 110} duration={700} y={18} className="h-full">
              <div className="flex h-full flex-col items-center rounded-2xl border border-border bg-card p-8 text-center shadow-sm transition-shadow duration-300 hover:shadow-md">
                <div className={`mb-5 inline-flex rounded-2xl p-4 ${iconBg}`}>
                  <Icon className={`h-7 w-7 ${iconColor}`} />
                </div>
                <h3
                  className="font-display mb-3 text-xl font-bold"
                  style={{ fontVariationSettings: '"opsz" 36' }}
                >
                  {t(titleKey)}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{t(descKey)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
