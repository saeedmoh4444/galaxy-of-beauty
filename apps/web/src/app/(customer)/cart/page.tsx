'use client';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button, formatCurrency } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function CartPage(): JSX.Element {
  const { data, isLoading } = api.marketplace.cart.useQuery() as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean; isError: boolean; refetch: () => void };
  const removeMut = api.marketplace.removeFromCart.useMutation();
  const cartItems = data ?? [];
  const total = cartItems.reduce((sum: number, item: Record<string,unknown>) => {
    const product = item.product as Record<string,unknown>;
    return sum + (Number(product?.price ?? 0) * (item.quantity as number));
  }, 0);

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold">🛒 سلة التسوق</h1><p className="mt-1 text-sm text-text-secondary">منتجات التجميل في سلتكِ</p></div>
          {cartItems.length > 0 && <span className="rounded-full bg-brand-100 px-3 py-1 text-sm font-bold text-brand-700">{cartItems.length}</span>}
        </div>

        {isLoading ? <div className="space-y-3">{Array.from({length:3},(_,i)=><CardSkeleton key={i}/>)}</div> :
          cartItems.length === 0 ? <Card padding="lg" className="text-center py-8"><p className="text-4xl mb-2">🛒</p><p className="text-text-secondary">سلتكِ فاضية — تصفحي المنتجات وأضيفي اللي يعجبكِ</p></Card> :
          <>
            <div className="space-y-3">{cartItems.map((item: Record<string,unknown>) => {
              const product = item.product as Record<string,unknown>;
              const nameJson = product?.nameJson as Record<string,string> | undefined;
              return (
                <Card key={item.id as number} padding="md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🧴</span>
                      <div>
                        <p className="font-bold">{nameJson?.ar ?? `منتج #${product?.id}`}</p>
                        <p className="text-xs text-text-secondary">الكمية: {item.quantity as number} · {formatCurrency(Number(product?.price ?? 0))}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-brand-600">{formatCurrency(Number(product?.price ?? 0) * (item.quantity as number))}</span>
                      <Button size="sm" variant="ghost" onClick={() => removeMut.mutate({ productId: product?.id as number })} loading={removeMut.isPending} className="text-red-500">❌</Button>
                    </div>
                  </div>
                </Card>
              );
            })}</div>

            <Card padding="lg"><div className="flex justify-between items-center">
              <div><p className="text-sm text-text-secondary">الإجمالي</p><p className="text-2xl font-extrabold">{formatCurrency(total)}</p></div>
              <Button size="lg" className="px-8">💳 إتمام الشراء</Button>
            </div></Card>
          </>
        }
      </div>
    </DashboardLayout>
  );
}
