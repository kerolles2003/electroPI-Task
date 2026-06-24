'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';

interface Props {
  locale: string;
}

/* useLayoutEffect on the client (so the hidden pre-animation state paints
   before the first frame, no flash), useEffect on the server. */
const useIsoEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

export function HeroSection({ locale }: Props) {
  const t = useTranslations('Home');
  const isAr = locale === 'ar';
  const imgRef = useRef<HTMLDivElement>(null);

  /* Entrance choreography.
     - armed=false (default): everything renders fully visible. This is the SSR,
       no-JS and reduced-motion state — the hero can never ship blank.
     - armed=true + motion: the from-state is painted, then `play` flips on the
       next frame to transition each element in on a staggered delay. */
  const [armed, setArmed] = useState(false);
  const [play, setPlay] = useState(false);
  const [motion, setMotion] = useState(false);

  useIsoEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setMotion(true);
    setArmed(true);
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setPlay(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, []);

  /* Extremely restrained parallax: the hero image drifts down a few px as the
     page scrolls, giving depth without motion-sickness. Disabled for reduced
     motion, throttled to one rAF per frame, transform-only (no layout cost). */
  useEffect(() => {
    const el = imgRef.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const y = Math.min(window.scrollY * 0.12, 60);
      el.style.transform = `translate3d(0, ${y}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const hidden = armed && !play;

  /* Fade-and-rise reveal for a block element on a given delay. */
  const reveal = (delay: number, dist = 18): React.CSSProperties => ({
    opacity: hidden ? 0 : 1,
    transform: hidden ? `translateY(${dist}px)` : 'none',
    transition: armed
      ? `opacity 720ms ${EASE} ${delay}ms, transform 720ms ${EASE} ${delay}ms`
      : undefined,
  });

  const words = t('heroTitle').split(' ');
  const HEAD_BASE = 240;
  const HEAD_STEP = 80;
  const afterHead = HEAD_BASE + words.length * HEAD_STEP;

  return (
    <section className="relative flex min-h-[640px] items-center overflow-hidden md:min-h-[780px]">
      {/* Oversized wrapper absorbs the parallax translate with no edge gap.
          Inner layer carries the slow Ken Burns drift — the two transforms are
          kept on separate elements so they never fight. */}
      <div
        ref={imgRef}
        className="absolute inset-x-0 -top-16 h-[calc(100%+8rem)] will-change-transform"
      >
        <div className="hero-kenburns relative h-full w-full will-change-transform">
          <Image
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1920&q=80"
            alt="A table of dishes fresh from the kitchen"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>
      </div>

      {/* Warm espresso overlay — not cold black. Follows reading direction so the
          headline sits on the dark side in both LTR and RTL. */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1C1410]/96 via-[#1C1410]/72 to-[#1C1410]/20 rtl:bg-gradient-to-l" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#1C1410]/65 via-transparent to-transparent" />

      {/* Ember glow — soft amber warmth behind the headline, like light off the
          pass. Static (no pulse) and fades in with the entrance. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 start-[-6rem] h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle_at_center,hsl(29_91%_44%/0.5),transparent_68%)] blur-2xl"
        style={{
          opacity: hidden ? 0 : 0.85,
          transition: armed ? `opacity 1400ms ease 200ms` : undefined,
        }}
      />

      {/* Bottom fade so the hero melts into the page background below. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-28 bg-gradient-to-t from-background to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-20">
        <div className="max-w-2xl">

          {/* Live status pill — the late-night-brasserie signal. */}
          <div
            className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 backdrop-blur-md"
            style={reveal(80, 12)}
          >
            <span className="relative flex h-2 w-2">
              {motion && (
                <span className="hero-ping absolute inset-0 rounded-full bg-primary" />
              )}
              <span className="relative h-2 w-2 rounded-full bg-primary" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
              {isAr ? 'مفتوح الآن · حتى الثانية صباحًا' : 'Open now · until 2 AM'}
            </span>
          </div>

          {/* Headline — the page's thesis.
              Each word rises from behind its own baseline (mask reveal).
              In Arabic: Cairo Bold, no italic, no opsz. In English: Fraunces
              opsz=144 italic for magazine drama. */}
          <h1
            className={`font-display mb-8 text-5xl font-bold leading-[1.1] tracking-tight text-white md:text-6xl lg:text-7xl${isAr ? '' : ' italic'}`}
          >
            {words.map((word, i) => (
              <Fragment key={i}>
                {i > 0 && ' '}
                <span
                  className="inline-block overflow-hidden align-bottom"
                  style={{ paddingBottom: '0.12em', marginBottom: '-0.12em' }}
                >
                  <span
                    className="inline-block"
                    style={{
                      ...(isAr ? {} : { fontVariationSettings: '"opsz" 144' }),
                      opacity: hidden ? 0 : 1,
                      transform: hidden ? 'translateY(115%)' : 'translateY(0)',
                      transition: armed
                        ? `opacity 820ms ${EASE} ${HEAD_BASE + i * HEAD_STEP}ms, transform 820ms ${EASE} ${HEAD_BASE + i * HEAD_STEP}ms`
                        : undefined,
                    }}
                  >
                    {word}
                  </span>
                </span>
              </Fragment>
            ))}
          </h1>

          {/* Subtitle */}
          <p
            className="mb-10 max-w-md text-base leading-relaxed text-white/70 md:text-lg"
            style={reveal(afterHead + 40)}
          >
            {t('heroSubtitle')}
          </p>

          {/* CTA hierarchy — one amber pill, one text link. */}
          <div
            className="flex flex-wrap items-center gap-5"
            style={reveal(afterHead + 180)}
          >
            <Button
              size="lg"
              asChild
              className="h-12 rounded-full px-9 text-base font-semibold shadow-lg shadow-primary/40 transition-transform hover:scale-[1.02]"
            >
              <a href="#popular-meals">{t('orderNow')}</a>
            </Button>
            <a
              href="#popular-meals"
              className="group flex items-center gap-1.5 text-sm font-medium text-white/75 transition-colors hover:text-white"
            >
              {t('exploreMenu')}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
            </a>
          </div>

          {/* Stats — count up once on reveal. */}
          <div className="mt-14 flex gap-0">
            {[
              { target: 42, decimals: 0, suffix: '+', label: isAr ? 'على القائمة' : 'On the menu' },
              { target: 15, decimals: 0, suffix: isAr ? ' دقيقة' : ' min', label: isAr ? 'إلى بابك' : 'To your door' },
              { target: 4.9, decimals: 1, suffix: '★', label: isAr ? 'تقييم ضيوفنا' : 'Guest rating' },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`pe-8 ${i > 0 ? 'border-s border-white/15 ps-8' : ''}`}
                style={reveal(afterHead + 320 + i * 90)}
              >
                <p
                  className="font-display text-2xl font-bold text-white"
                  style={isAr ? undefined : { fontVariationSettings: '"opsz" 36' }}
                >
                  <CountUp
                    target={stat.target}
                    decimals={stat.decimals}
                    suffix={stat.suffix}
                    run={play && motion}
                  />
                </p>
                <p className="mt-0.5 text-xs uppercase tracking-wider text-white/50">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll cue toward the menu — desktop only, where there's room below the stats. */}
      <a
        href="#popular-meals"
        aria-label={isAr ? 'انتقل إلى القائمة' : 'Scroll to the menu'}
        className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/55 transition-colors hover:text-white md:flex"
        style={reveal(afterHead + 620)}
      >
        <span className="text-[0.625rem] font-semibold uppercase tracking-[0.25em]">
          {isAr ? 'القائمة' : 'Menu'}
        </span>
        <ChevronDown className="hero-bob h-4 w-4" aria-hidden />
      </a>
    </section>
  );
}

/* Animated number that eases up to its target once `run` is true. When `run`
   is false (reduced motion / SSR) it simply renders the final value. */
function CountUp({
  target,
  decimals,
  suffix,
  run,
}: {
  target: number;
  decimals: number;
  suffix: string;
  run: boolean;
}) {
  const [value, setValue] = useState(run ? 0 : target);

  useEffect(() => {
    if (!run) {
      setValue(target);
      return;
    }
    let raf = 0;
    let startT: number | null = null;
    const duration = 1200;
    const timeout = setTimeout(() => {
      const tick = (now: number) => {
        if (startT === null) startT = now;
        const p = Math.min((now - startT) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setValue(target * eased);
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, 150);
    return () => {
      clearTimeout(timeout);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [run, target]);

  return (
    <>
      {value.toFixed(decimals)}
      {suffix}
    </>
  );
}
