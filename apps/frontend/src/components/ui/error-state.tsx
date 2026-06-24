'use client';

import { AlertCircle } from 'lucide-react';
import { Button } from './button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  retryLabel?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'Something went wrong.',
  retryLabel = 'Try again',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-5 py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/8 ring-1 ring-destructive/20">
        <AlertCircle className="h-9 w-9 text-destructive" />
      </div>
      <div>
        <p
          className="font-display text-2xl font-bold text-foreground"
          style={{ fontVariationSettings: '"opsz" 36' }}
        >
          {title}
        </p>
        <p className="mt-1.5 text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} className="rounded-full px-8">
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
