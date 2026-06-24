'use client';

import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface Props {
  title: string;
  description?: string;
  /** 'start' = left-aligned editorial header (default); 'center' = centered closer */
  align?: 'start' | 'center';
  /** Optional right-aligned element, only rendered for the 'start' variant */
  action?: ReactNode;
  className?: string;
}

export function SectionHeading({
  title,
  description,
  align = 'start',
  action,
  className,
}: Props) {
  const heading = (
    <h2
      className="font-display text-3xl font-bold leading-[1.1] [text-wrap:balance] md:text-4xl"
      style={{ fontVariationSettings: '"opsz" 72' }}
    >
      {title}
    </h2>
  );

  if (align === 'center') {
    return (
      <div className={cn('mx-auto max-w-2xl text-center', className)}>
        {heading}
        {description && (
          <p className="mt-3 text-muted-foreground [text-wrap:pretty] md:text-lg">
            {description}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className="max-w-xl">
        {heading}
        {description && (
          <p className="mt-2.5 text-muted-foreground [text-wrap:pretty] md:text-lg">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
