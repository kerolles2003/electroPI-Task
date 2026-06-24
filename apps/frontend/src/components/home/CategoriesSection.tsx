'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { categoriesApi } from '@/lib/api/categories';
import { useQuery } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';

const CATEGORY_EMOJIS: Record<string, string> = {
  burgers: '🍔',
  pizza: '🍕',
  chicken: '🍗',
  pasta: '🍝',
  drinks: '🥤',
  salads: '🥗',
};

interface Props {
  selectedCategory: string;
  onSelect: (slug: string) => void;
}

export function CategoriesSection({ selectedCategory, onSelect }: Props) {
  const t = useTranslations('Home');
  const locale = useLocale();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.list,
    staleTime: 5 * 60 * 1000,
  });

  const activeCategories = categories?.filter((c) => c.isActive) ?? [];

  return (
    <section className="border-b bg-background py-12 md:py-14">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal duration={600} y={12}>
          <SectionHeading
            align="start"
            title={t('browseCategories')}
            className="mb-7"
          />
        </Reveal>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => onSelect('')}
            className={cn(
              'flex items-center gap-2 rounded-full border-2 px-5 py-2.5 text-sm font-semibold transition-all duration-150',
              selectedCategory === ''
                ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20'
                : 'border-border bg-card text-foreground hover:border-primary/60 hover:text-primary',
            )}
          >
            <span>🍽️</span>
            {t('allCategories')}
          </button>

          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-11 w-28 rounded-full" />
              ))
            : activeCategories.map((cat) => {
                const name = locale === 'ar' ? cat.nameAr : cat.nameEn;
                const emoji = CATEGORY_EMOJIS[cat.slug] ?? '🍴';
                const isActive = selectedCategory === cat.slug;
                return (
                  <button
                    key={cat.id}
                    onClick={() => onSelect(cat.slug)}
                    className={cn(
                      'flex items-center gap-2 rounded-full border-2 px-5 py-2.5 text-sm font-semibold transition-all duration-150',
                      isActive
                        ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20'
                        : 'border-border bg-card text-foreground hover:border-primary/60 hover:text-primary',
                    )}
                  >
                    <span>{emoji}</span>
                    {name}
                  </button>
                );
              })}
        </div>
      </div>
    </section>
  );
}
