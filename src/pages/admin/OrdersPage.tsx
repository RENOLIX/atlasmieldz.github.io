import { useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchOrders, moveOrderToTrash, updateOrderStatus } from "@/lib/supabase";
import type { OrderRecord, OrderStatus } from "@/types";
import { formatDzd } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const statuses: Array<{ value: OrderStatus; label: string }> = [
  { value: "pending", label: "جديد" },
  { value: "processing", label: "قيد المعالجة" },
  { value: "shipped", label: "تم الشحن" },
  { value: "delivered", label: "تم التسليم" },
  { value: "cancelled", label: "ملغي" },
];

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setOrders(await fetchOrders());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر تحميل الطلبات.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <section className="space-y-6">
      <div className="rounded-[30px] bg-white p-6 shadow-[0_24px_70px_-54px_rgba(112,69,8,0.45)]">
        <p className="text-sm font-extrabold text-[#d18b11]">الطلبات</p>
        <h1 className="mt-2 text-3xl font-extrabold">إدارة الطلبات</h1>
      </div>

      {loading ? (
        <div className="h-40 animate-pulse rounded-[30px] bg-[#f6ead0]" />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article key={order.id} className="rounded-[30px] bg-white p-6 shadow-[0_24px_70px_-54px_rgba(112,69,8,0.45)]">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <p className="text-lg font-extrabold">{order.customerName}</p>
                  <p className="text-sm text-[#7a644d]">{order.customerPhone}</p>
                  <p className="text-sm text-[#7a644d]">رقم الطلب: {order.orderNumber}</p>
                  <p className="text-sm text-[#7a644d]">الولاية: {order.shippingAddress.wilaya}</p>
                  <p className="text-sm text-[#7a644d]">العنوان: {order.shippingAddress.address}</p>
                </div>

                <div className="min-w-[240px] space-y-3">
                  <select
                    value={order.status}
                    onChange={(event) => {
                      const value = event.target.value as OrderStatus;
                      void updateOrderStatus(order.id, value).then(() => {
                        toast.success("تم تحديث الحالة.");
                        return load();
                      }).catch((error: Error) => toast.error(error.message));
                    }}
                    className="h-12 w-full rounded-2xl border border-[#e7d2a6] px-4 text-sm font-bold"
                  >
                    {statuses.map((status) => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                  <Button
                    variant="danger"
                    className="w-full"
                    onClick={() => {
                      void moveOrderToTrash(order).then(() => {
                        toast.success("تم نقل الطلب إلى سلة المحذوفات.");
                        return load();
                      }).catch((error: Error) => toast.error(error.message));
                    }}
                  >
                    نقل إلى السلة
                  </Button>
                </div>
              </div>

              <div className="mt-4 border-t border-[#f2e5c8] pt-4">
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={`${item.productId}-${item.weight}`} className="flex items-center gap-4">
                      <img src={item.image} alt={item.productName} className="h-14 w-12 rounded-2xl object-cover" />
                      <div className="flex-1">
                        <p className="font-extrabold">{item.productName}</p>
                        <p className="text-sm text-[#7a644d]">{item.weight} × {item.quantity}</p>
                      </div>
                      <p className="font-extrabold text-[#d18b11]">{formatDzd(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-left text-lg font-extrabold text-[#d18b11]">الإجمالي: {formatDzd(order.total)}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
