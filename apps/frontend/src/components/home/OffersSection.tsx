'use client';

import { useTranslations } from 'next-intl';
import { Bike, Percent, UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';

const OFFERS = [
  {
    titleKey: 'offer1Title' as const,
    descKey: 'offer1Desc' as const,
    icon: Percent,
    /** The headline promo — gently emphasised with a warm amber tint */
    primary: true,
  },
  {
    titleKey: 'offer2Title' as const,
    descKey: 'offer2Desc' as const,
    icon: Bike,
    primary: false,
  },
  {
    titleKey: 'offer3Title' as const,
    descKey: 'offer3Desc' as const,
    icon: UtensilsCrossed,
    primary: false,
  },
];

export function OffersSection() {
  const t = useTranslations('Home');

  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal duration={650} y={14}>
          <SectionHeading
            align="center"
            title={t('specialOffers')}
            className="mb-10"
          />
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-3">
          {OFFERS.map(({ titleKey, descKey, icon: Icon, primary }, i) => (
            <Reveal
              key={titleKey}
              delay={i * 90}
              duration={650}
              y={18}
              className={cn(
                'flex flex-col gap-3 rounded-2xl p-7',
                primary
                  ? 'bg-accent'
                  : 'border border-border bg-card',
              )}
            >
              <Icon className="h-6 w-6 text-accent-foreground" strokeWidth={1.75} />
              <h3
                className="font-display text-xl font-bold text-foreground"
                style={{ fontVariationSettings: '"opsz" 36' }}
              >
                {t(titleKey)}
              </h3>
              <p className="text-sm leading-relaxed text-foreground/70">
                {t(descKey)}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
