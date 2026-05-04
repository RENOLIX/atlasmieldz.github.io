import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Pencil, Plus, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { deleteProduct, fetchAdminProducts, seedDefaultProducts } from "@/lib/supabase";
import { formatDzd } from "@/lib/utils";
import type { ProductRecord } from "@/types";
import { Button } from "@/components/ui/button";

export function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setProducts(await fetchAdminProducts());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر تحميل المنتجات.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[30px] bg-white p-6 shadow-[0_24px_70px_-54px_rgba(112,69,8,0.45)] md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-extrabold text-[#d18b11]">لوحة المنتجات</p>
          <h1 className="mt-2 text-3xl font-extrabold">إدارة منتجات أطلس ميل</h1>
          <p className="mt-2 text-sm text-[#7a644d]">{products.length} منتج</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              void seedDefaultProducts().then(() => {
                toast.success("تم استيراد المنتجات الافتراضية.");
                return load();
              }).catch((error: Error) => toast.error(error.message));
            }}
          >
            <UploadCloud size={16} />
            استيراد المنتجات
          </Button>
          <Link to="/admin/products/new">
            <Button>
              <Plus size={16} />
              منتج جديد
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="h-40 animate-pulse rounded-[30px] bg-[#f6ead0]" />
      ) : (
        <div className="overflow-hidden rounded-[30px] bg-white shadow-[0_24px_70px_-54px_rgba(112,69,8,0.45)]">
          <div className="hidden grid-cols-[1.3fr_0.8fr_0.55fr_0.55fr_0.8fr] gap-4 border-b border-[#f2e5c8] px-5 py-4 text-xs font-extrabold text-[#7a644d] md:grid">
            <div>المنتج</div>
            <div>السعر</div>
            <div>المخزون</div>
            <div>الحالة</div>
            <div className="text-left">إجراءات</div>
          </div>
          {products.map((product) => (
            <div key={product.id} className="grid gap-4 border-b border-[#f8efdd] px-5 py-4 md:grid-cols-[1.3fr_0.8fr_0.55fr_0.55fr_0.8fr] md:items-center">
              <div className="flex items-center gap-4">
                <img src={product.images[0]} alt={product.name} className="h-16 w-14 rounded-2xl object-cover" />
                <div>
                  <p className="font-extrabold">{product.name}</p>
                  {product.featured ? <p className="text-xs font-bold text-[#d18b11]">منتج مميز</p> : null}
                </div>
              </div>
              <div className="font-extrabold text-[#d18b11]">{formatDzd(product.weightOptions[0]?.price ?? 0)}</div>
              <div className="font-bold">{product.stock}</div>
              <div className={`text-sm font-extrabold ${product.active ? "text-green-700" : "text-[#7a644d]"}`}>
                {product.active ? "نشط" : "مخفي"}
              </div>
              <div className="flex items-center gap-2 md:justify-end">
                <Link to={`/produits/${product.id}`} className="rounded-full bg-[#fff4dc] p-3 text-[#d18b11]"><Eye size={16} /></Link>
                <Link to={`/admin/products/${product.id}`} className="rounded-full bg-[#fff4dc] p-3 text-[#d18b11]"><Pencil size={16} /></Link>
                <button
                  type="button"
                  className="rounded-full bg-[#fee2e2] p-3 text-[#b42318]"
                  onClick={() => {
                    if (!window.confirm(`حذف ${product.name}؟`)) return;
                    void deleteProduct(product.id).then(() => {
                      toast.success("تم حذف المنتج.");
                      return load();
                    }).catch((error: Error) => toast.error(error.message));
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
