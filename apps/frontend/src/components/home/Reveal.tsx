'use client';

import { cn } from '@/lib/utils';
import { useEffect, useRef, useState, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  /** Stagger delay in ms */
  delay?: number;
  /** Translate distance in px before reveal */
  y?: number;
  /** Transition duration in ms */
  duration?: number;
}

/**
 * Scroll-reveal wrapper. Content is fully visible by default (SSR, no-JS,
 * headless, reduced-motion all render it shown). The hidden→revealed
 * transition is applied only after client mount when IntersectionObserver
 * and motion are both available, so a section can never ship blank.
 */
export function Reveal({ children, className, delay = 0, y = 16, duration = 700 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) {
      setShown(true);
      return;
    }

    setArmed(true);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const hidden = armed && !shown;

  return (
    <div
      ref={ref}
      className={cn(hidden && 'will-change-[opacity,transform]', className)}
      style={{
        opacity: hidden ? 0 : 1,
        transform: hidden ? `translateY(${y}px)` : 'none',
        transition: armed
          ? `opacity ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`
          : undefined,
      }}
    >
      {children}
    </div>
  );
}
