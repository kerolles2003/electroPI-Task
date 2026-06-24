'use client';

import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useCartStore } from '@/stores/cart';
import { ShoppingCart } from 'lucide-react';

export function CartButton() {
  const { totalItems } = useCart();
  const toggle = useCartStore((s) => s.toggle);

  return (
    <Button variant="ghost" size="icon" onClick={toggle} className="relative" aria-label="Cart">
      <ShoppingCart className="h-5 w-5" />
      {totalItems > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </Button>
  );
}
