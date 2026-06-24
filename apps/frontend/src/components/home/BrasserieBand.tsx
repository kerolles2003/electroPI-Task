'use client';

import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { Reveal } from './Reveal';

export function BrasserieBand() {
  const t = useTranslations('Home');
  const locale = useLocale();
  const isAr = locale === 'ar';

  return (
    <section className="relative isolate flex min-h-[300px] items-center overflow-hidden md:min-h-[380px]">
      <Image
        src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1920&q=80"
        alt={
          isAr
            ? 'مائدة عامرة بأطباق طازجة مصوّرة من الأعلى'
            : 'A laden table of fresh dishes, shot from above'
        }
        fill
        className="object-cover"
        sizes="100vw"
      />
      {/* Warm espresso wash — the same brand language as the hero, not cold black.
          Gradient follows reading direction so text always sits on the dark side. */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1C1410]/92 via-[#1C1410]/68 to-[#1C1410]/30 rtl:bg-gradient-to-l" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-16">
        <Reveal duration={800} y={20}>
          {/* opsz 96 sits between the hero (144) and section headers (72) — its own rung */}
          <p
            className={`font-display max-w-2xl text-3xl font-bold leading-[1.12] [text-wrap:balance] text-white md:text-4xl lg:text-5xl${isAr ? '' : ' italic'}`}
            style={isAr ? undefined : { fontVariationSettings: '"opsz" 96' }}
          >
            {t('bandQuote')}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
