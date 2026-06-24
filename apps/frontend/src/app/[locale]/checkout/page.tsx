'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { cn } from '@/lib/utils';
import { ordersApi } from '@/lib/api/orders';
import type { PaymentMethod } from '@/types/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Banknote, Lock, MapPin, MessageSquare, ShieldCheck } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const schema = z.object({
  deliveryAddress: z.string().min(1, 'Delivery address is required'),
  paymentMethod: z.enum(['ONLINE', 'CASH_ON_DELIVERY'] as const),
  notes: z.string().max(1000).optional(),
});

type FormData = z.infer<typeof schema>;

/* Icon + label section header — honest wayfinding, no numbered steps.
   (All three sections are visible at once; they are not a wizard.) */
function SectionLabel({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary" />
      <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        {title}
      </span>
    </div>
  );
}

export default function CheckoutPage() {
  const t = useTranslations('Checkout');
  const locale = useLocale();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { cart, isLoading: cartLoading, isError: cartError, refetch: refetchCart } = useCart();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/${locale}/auth/login?redirect=/${locale}/checkout`);
    }
  }, [authLoading, user, locale, router]);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { deliveryAddress: '', paymentMethod: 'CASH_ON_DELIVERY', notes: '' },
  });

  const paymentMethod = form.watch('paymentMethod');

  const checkout = useMutation({
    mutationFn: (data: FormData) =>
      ordersApi.checkout({
        deliveryAddress: data.deliveryAddress,
        paymentMethod: data.paymentMethod as PaymentMethod,
        notes: data.notes || undefined,
      }),
    onSuccess: (res) => {
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      } else {
        toast.success('Order placed successfully!');
        router.push(`/${locale}/orders/${res.order.orderNumber}`);
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to place order');
    },
  });

  if (authLoading || cartLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Skeleton className="mb-6 h-8 w-40" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (cartError) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <ErrorState message="Failed to load cart." onRetry={() => refetchCart()} />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Button asChild className="mt-4 rounded-full">
          <Link href={`/${locale}`}>Browse Menu</Link>
        </Button>
      </div>
    );
  }

  const deliveryFee = cart.subtotal >= 20 ? 0 : 2.99;
  const total = cart.subtotal + deliveryFee;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1
        className="font-display mb-8 text-2xl font-bold italic"
        style={{ fontVariationSettings: '"opsz" 72' }}
      >
        {t('title')}
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit((d) => checkout.mutate(d))}>
          <div className="grid gap-5 lg:grid-cols-3">
            {/* Left: form sections */}
            <div className="space-y-5 lg:col-span-2">
              {/* Delivery address */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>
                    <SectionLabel icon={MapPin} title={t('address')} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="deliveryAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="sr-only">{t('address')}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t('addressPlaceholder')}
                            rows={3}
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Payment method */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>
                    <SectionLabel icon={ShieldCheck} title={t('paymentMethod')} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                          >
                            {[
                              {
                                value: 'CASH_ON_DELIVERY',
                                label: t('cod'),
                                desc: 'Pay when your food arrives',
                                icon: Banknote,
                              },
                              {
                                value: 'ONLINE',
                                label: t('online'),
                                desc: 'Secure card payment',
                                icon: ShieldCheck,
                              },
                            ].map(({ value, label, desc, icon: Icon }) => (
                              <label
                                key={value}
                                htmlFor={value}
                                className={cn(
                                  'flex cursor-pointer flex-col gap-1.5 rounded-xl border-2 p-4 transition-all',
                                  paymentMethod === value
                                    ? 'border-primary bg-accent/60'
                                    : 'border-border hover:border-primary/30',
                                )}
                              >
                                <RadioGroupItem value={value} id={value} className="sr-only" />
                                <div className="flex items-center justify-between">
                                  <Icon
                                    className={cn(
                                      'h-5 w-5',
                                      paymentMethod === value ? 'text-primary' : 'text-muted-foreground',
                                    )}
                                  />
                                  {paymentMethod === value && (
                                    <span className="h-2 w-2 rounded-full bg-primary" />
                                  )}
                                </div>
                                <span className="font-semibold">{label}</span>
                                <span className="text-xs text-muted-foreground">{desc}</span>
                              </label>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Notes */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>
                    <SectionLabel icon={MessageSquare} title={t('notes')} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder={t('notesPlaceholder')}
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right: order summary */}
            <div>
              <Card className="lg:sticky lg:top-20">
                <CardHeader>
                  <CardTitle className="text-base">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {cart.items.map((item) => {
                    const name = locale === 'ar' ? item.product.nameAr : item.product.nameEn;
                    return (
                      <div key={item.id} className="flex justify-between gap-2 text-sm">
                        <span className="line-clamp-1 flex-1 text-muted-foreground">
                          {name} × {item.quantity}
                        </span>
                        <span className="shrink-0 font-medium">${item.lineTotal.toFixed(2)}</span>
                      </div>
                    );
                  })}
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${cart.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className={deliveryFee === 0 ? 'font-medium text-primary' : ''}>
                      {deliveryFee === 0 ? 'Free' : `$${deliveryFee.toFixed(2)}`}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-base font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </CardContent>

                <div className="px-6 pb-6">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full rounded-full gap-2"
                    disabled={checkout.isPending}
                  >
                    {checkout.isPending ? (
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    ) : (
                      <Lock className="h-3.5 w-3.5" />
                    )}
                    {checkout.isPending ? t('placing') : t('placeOrder')}
                  </Button>
                  <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    Your order is secured
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
