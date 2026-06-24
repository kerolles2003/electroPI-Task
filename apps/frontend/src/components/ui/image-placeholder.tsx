import { Package } from 'lucide-react';

export function ImagePlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center bg-muted text-muted-foreground/30 ${className ?? ''}`}
    >
      <Package className="h-10 w-10" />
    </div>
  );
}
