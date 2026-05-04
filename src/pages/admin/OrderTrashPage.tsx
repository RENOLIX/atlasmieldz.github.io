import { useEffect, useState } from "react";
import { toast } from "sonner";
import { deleteOrderFromTrash, fetchOrderTrash, restoreOrderFromTrash } from "@/lib/supabase";
import type { OrderRecord } from "@/types";
import { formatDzd } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function AdminOrderTrashPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setOrders(await fetchOrderTrash());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر تحميل السلة.");
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
        <p className="text-sm font-extrabold text-[#d18b11]">سلة المحذوفات</p>
        <h1 className="mt-2 text-3xl font-extrabold">الطلبات المحذوفة</h1>
      </div>

      {loading ? (
        <div className="h-40 animate-pulse rounded-[30px] bg-[#f6ead0]" />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article key={order.id} className="rounded-[30px] bg-white p-6 shadow-[0_24px_70px_-54px_rgba(112,69,8,0.45)]">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-extrabold">{order.customerName}</p>
                  <p className="text-sm text-[#7a644d]">{order.orderNumber}</p>
                  <p className="text-sm text-[#7a644d]">{formatDzd(order.total)}</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      void restoreOrderFromTrash(order).then(() => {
                        toast.success("تمت استعادة الطلب.");
                        return load();
                      }).catch((error: Error) => toast.error(error.message));
                    }}
                  >
                    استعادة
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      void deleteOrderFromTrash(order.id).then(() => {
                        toast.success("تم حذف الطلب نهائياً.");
                        return load();
                      }).catch((error: Error) => toast.error(error.message));
                    }}
                  >
                    حذف نهائي
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
