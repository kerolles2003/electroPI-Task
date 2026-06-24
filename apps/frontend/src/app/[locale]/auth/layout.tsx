import Image from 'next/image';

export default async function AuthLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const isAr = locale === 'ar';

  return (
    <div className="flex flex-1">
      {/* ── Atmospheric left panel ─────────────────────────────────────
          Late-night brasserie invitation: dark, warm, intimate.
          Desktop-only — on mobile the form is the entire focus.       */}
      <div className="relative hidden flex-col justify-between overflow-hidden lg:flex lg:w-[42%]">
        <Image
          src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1C1410]/97 via-[#1C1410]/82 to-[#1C1410]/50" />

        {/* Wordmark */}
        <div className="relative z-10 p-10">
          <span
            className={`font-display text-2xl font-bold text-white${isAr ? '' : ' italic'}`}
            style={isAr ? undefined : { fontVariationSettings: '"opsz" 72' }}
          >
            FoodHub
          </span>
        </div>

        {/* Quote + hours + mini stats */}
        <div className="relative z-10 p-10 pb-14">
          <p
            className={`font-display text-[1.75rem] font-bold leading-snug text-white${isAr ? '' : ' italic'}`}
            style={isAr ? undefined : { fontVariationSettings: '"opsz" 72' }}
          >
            {isAr
              ? 'كل طبق يغادر مطبخنا صُنع بأيدينا.'
              : 'Every plate leaves our kitchen made by hand.'}
          </p>

          <div className="mt-5 flex items-center gap-3">
            <div className="h-px w-8 bg-primary" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {isAr ? 'مفتوح يومياً · 11:00 – 23:00' : 'Open daily · 11:00 – 23:00'}
            </span>
          </div>

          <div className="mt-8 flex gap-8">
            {[
              { value: '42+', label: isAr ? 'طبق' : 'dishes' },
              { value: '4.9★', label: isAr ? 'تقييم' : 'rating' },
              { value: '15 min', label: isAr ? 'توصيل' : 'delivery' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p
                  className="font-display text-xl font-bold text-white"
                  style={isAr ? undefined : { fontVariationSettings: '"opsz" 36' }}
                >
                  {value}
                </p>
                <p className="mt-0.5 text-[0.6rem] uppercase tracking-wider text-white/45">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Form panel ─────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-14 lg:px-16">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
