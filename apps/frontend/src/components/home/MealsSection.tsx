'use client';

import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';
import { productsApi } from '@/lib/api/products';
import { useQuery } from '@tanstack/react-query';
import { UtensilsCrossed } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { MealCard } from './MealCard';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';

interface Props {
  sectionId?: string;
  titleKey: 'popularMeals';
  descKey: 'popularMealsDesc';
  category?: string;
  limit?: number;
  onResetCategory?: () => void;
}

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="animate-shimmer aspect-[4/3] w-full" />
      <div className="space-y-2.5 p-4">
        <div className="animate-shimmer h-4 w-3/4 rounded-full" />
        <div className="animate-shimmer h-3 w-full rounded-full" />
        <div className="animate-shimmer h-3 w-4/5 rounded-full" />
      </div>
      <div className="flex items-center justify-between px-4 pb-4">
        <div className="space-y-1">
          <div className="animate-shimmer h-5 w-16 rounded-full" />
          <div className="animate-shimmer h-3 w-20 rounded-full" />
        </div>
        <div className="animate-shimmer h-10 w-10 rounded-full" />
      </div>
    </div>
  );
}

function EmptyState({ onReset }: { onReset?: () => void }) {
  const t = useTranslations('Home');
  return (
    <div className="flex flex-col items-center gap-5 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
        <UtensilsCrossed className="h-7 w-7 text-accent-foreground" strokeWidth={1.75} />
      </div>
      <div className="max-w-sm">
        <p
          className="font-display text-2xl font-bold text-foreground"
          style={{ fontVariationSettings: '"opsz" 36' }}
        >
          {t('emptyTitle')}
        </p>
        <p className="mt-1.5 text-sm text-muted-foreground [text-wrap:pretty]">
          {t('noProductsInCategory')}
        </p>
      </div>
      {onReset && (
        <Button variant="outline" onClick={onReset} className="rounded-full px-6">
          {t('emptyAction')}
        </Button>
      )}
    </div>
  );
}

export function MealsSection({
  sectionId,
  titleKey,
  descKey,
  category,
  limit = 8,
  onResetCategory,
}: Props) {
  const t = useTranslations('Home');
  const tc = useTranslations('Common');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['products', { category, limit }],
    queryFn: () => productsApi.list({ category: category || undefined, limit }),
    staleTime: 60 * 1000,
  });

  const products = data?.items ?? [];
  const skeletonCount = limit > 6 ? 8 : 6;

  return (
    <section id={sectionId} className="scroll-mt-24 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal duration={650} y={14}>
          <SectionHeading
            align="start"
            title={t(titleKey)}
            description={t(descKey)}
            className="mb-10"
          />
        </Reveal>

        {isLoading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}

        {!isLoading && isError && (
          <ErrorState
            title={tc('error')}
            message={t('loadError')}
            retryLabel={tc('retry')}
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && products.length === 0 && (
          <EmptyState onReset={category ? onResetCategory : undefined} />
        )}

        {!isLoading && !isError && products.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product, i) => (
              <Reveal key={product.id} delay={(i % 4) * 70} duration={600} y={16}>
                <MealCard product={product} index={i} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
