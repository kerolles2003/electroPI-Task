'use client';

import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { BrasserieBand } from './BrasserieBand';
import { CategoriesSection } from './CategoriesSection';
import { HeroSection } from './HeroSection';
import { MealsSection } from './MealsSection';
import { OffersSection } from './OffersSection';
import { WhyChooseUs } from './WhyChooseUs';

interface Props {
  initialSearch: string;
  initialCategory: string;
}

export function HomeContent({ initialSearch, initialCategory }: Props) {
  const locale = useLocale();
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  function handleCategorySelect(slug: string) {
    setSelectedCategory(slug);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams();
      if (slug) params.set('cat', slug);
      if (initialSearch) params.set('q', initialSearch);
      const qs = params.toString();
      window.history.replaceState(null, '', `/${locale}${qs ? `?${qs}` : ''}`);
      document.getElementById('popular-meals')?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <>
      <HeroSection locale={locale} />
      <CategoriesSection
        selectedCategory={selectedCategory}
        onSelect={handleCategorySelect}
      />
      <OffersSection />
      <BrasserieBand />
      <MealsSection
        sectionId="popular-meals"
        titleKey="popularMeals"
        descKey="popularMealsDesc"
        category={selectedCategory || undefined}
        limit={12}
        onResetCategory={() => handleCategorySelect('')}
      />
      <WhyChooseUs />
    </>
  );
}
