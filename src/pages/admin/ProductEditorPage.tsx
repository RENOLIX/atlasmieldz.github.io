import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createProduct, fetchAdminProducts, updateProduct } from "@/lib/supabase";
import { fileToDataUrl } from "@/lib/utils";
import type { ProductInput, ProductWeightOption } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function emptyForm(): ProductInput {
  return {
    name: "",
    description: "",
    images: [],
    stock: 0,
    featured: false,
    active: true,
    weightOptions: [
      { label: "500غ", price: 0 },
      { label: "1كغ", price: 0 },
    ],
  };
}

export function AdminProductEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === "new";
  const [form, setForm] = useState<ProductInput>(emptyForm());
  const [pendingImageUrl, setPendingImageUrl] = useState("");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew || !id) return;
    void fetchAdminProducts().then((products) => {
      const found = products.find((entry) => entry.id === id);
      if (!found) {
        toast.error("المنتج غير موجود.");
        navigate("/admin", { replace: true });
        return;
      }
      setForm({
        name: found.name,
        description: found.description,
        images: found.images,
        stock: found.stock,
        featured: found.featured,
        active: found.active,
        weightOptions: found.weightOptions.length ? found.weightOptions : emptyForm().weightOptions,
      });
      setLoading(false);
    }).catch((error: Error) => {
      toast.error(error.message);
      setLoading(false);
    });
  }, [id, isNew, navigate]);

  const validWeightOptions = useMemo(
    () => form.weightOptions.filter((option) => option.label.trim()),
    [form.weightOptions],
  );

  const updateWeight = (index: number, next: Partial<ProductWeightOption>) => {
    setForm((current) => ({
      ...current,
      weightOptions: current.weightOptions.map((option, optionIndex) =>
        optionIndex === index ? { ...option, ...next } : option,
      ),
    }));
  };

  if (loading) {
    return <div className="h-40 animate-pulse rounded-[30px] bg-[#f6ead0]" />;
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[30px] bg-white p-6 shadow-[0_24px_70px_-54px_rgba(112,69,8,0.45)]">
        <p className="text-sm font-extrabold text-[#d18b11]">{isNew ? "إضافة منتج" : "تعديل المنتج"}</p>
        <h1 className="mt-2 text-3xl font-extrabold">{isNew ? "منتج جديد" : form.name}</h1>
      </div>

      <form
        className="space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          if (!form.name.trim() || !form.description.trim() || !validWeightOptions.length) {
            toast.error("املأ اسم المنتج، الوصف، وأوزانه.");
            return;
          }
          setSaving(true);
          const action = isNew ? createProduct(form) : updateProduct(id as string, form);
          void action.then(() => {
            toast.success(isNew ? "تم إنشاء المنتج." : "تم تحديث المنتج.");
            navigate("/admin", { replace: true });
          }).catch((error: Error) => toast.error(error.message)).finally(() => setSaving(false));
        }}
      >
        <div className="rounded-[30px] bg-white p-6 shadow-[0_24px_70px_-54px_rgba(112,69,8,0.45)]">
          <div className="grid gap-5 md:grid-cols-2">
            <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="اسم المنتج" />
            <Input
              type="number"
              min={0}
              value={form.stock}
              onChange={(event) => setForm((current) => ({ ...current, stock: Number(event.target.value || 0) }))}
              placeholder="المخزون"
            />
          </div>
          <Textarea
            className="mt-5"
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            placeholder="وصف المنتج"
          />

          <div className="mt-5 flex flex-wrap gap-5 text-sm font-bold">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.featured} onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))} />
              منتج مميز
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.active} onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))} />
              ظاهر في الموقع
            </label>
          </div>
        </div>

        <div className="rounded-[30px] bg-white p-6 shadow-[0_24px_70px_-54px_rgba(112,69,8,0.45)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-extrabold">الأوزان والأسعار</h2>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setForm((current) => ({
                ...current,
                weightOptions: [...current.weightOptions, { label: "", price: 0 }],
              }))}
            >
              <Plus size={16} />
              وزن جديد
            </Button>
          </div>

          <div className="space-y-4">
            {form.weightOptions.map((option, index) => (
              <div key={index} className="grid gap-4 rounded-[24px] border border-[#f2e5c8] p-4 md:grid-cols-[1fr_1fr_1fr_auto]">
                <Input value={option.label} onChange={(event) => updateWeight(index, { label: event.target.value })} placeholder="مثال: 500غ" />
                <Input type="number" min={0} value={option.price} onChange={(event) => updateWeight(index, { price: Number(event.target.value || 0) })} placeholder="السعر" />
                <Input type="number" min={0} value={option.comparePrice ?? ""} onChange={(event) => updateWeight(index, { comparePrice: Number(event.target.value || 0) || undefined })} placeholder="السعر المشطوب (اختياري)" />
                <button
                  type="button"
                  className="rounded-full bg-[#fee2e2] p-3 text-[#b42318]"
                  onClick={() => setForm((current) => ({
                    ...current,
                    weightOptions: current.weightOptions.filter((_, optionIndex) => optionIndex !== index),
                  }))}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] bg-white p-6 shadow-[0_24px_70px_-54px_rgba(112,69,8,0.45)]">
          <h2 className="text-xl font-extrabold">صور المنتج</h2>
          <div className="mt-4 flex flex-wrap gap-4">
            {form.images.map((image, index) => (
              <div key={`${image}-${index}`} className="relative">
                <img src={image} alt="" className="h-28 w-24 rounded-[18px] object-cover" />
                <button
                  type="button"
                  className="absolute -left-2 -top-2 rounded-full bg-[#fee2e2] p-2 text-[#b42318]"
                  onClick={() => setForm((current) => ({
                    ...current,
                    images: current.images.filter((_, imageIndex) => imageIndex !== index),
                  }))}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-4 md:flex-row">
            <Input value={pendingImageUrl} onChange={(event) => setPendingImageUrl(event.target.value)} placeholder="أضف رابط صورة" />
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                if (!pendingImageUrl.trim()) return;
                setForm((current) => ({ ...current, images: [...current.images, pendingImageUrl.trim()] }));
                setPendingImageUrl("");
              }}
            >
              إضافة الرابط
            </Button>
          </div>

          <label className="mt-4 block rounded-[24px] border border-dashed border-[#d7b97c] bg-[#fff9eb] px-5 py-6 text-center text-sm font-bold text-[#7a644d]">
            ارفع صورة أو أكثر
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []);
                void Promise.all(files.map((file) => fileToDataUrl(file))).then((images) => {
                  setForm((current) => ({ ...current, images: [...current.images, ...images] }));
                }).catch((error: Error) => toast.error(error.message));
              }}
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={saving}>{saving ? "جارٍ الحفظ..." : "حفظ المنتج"}</Button>
          <Link to="/admin">
            <Button type="button" variant="secondary">إلغاء</Button>
          </Link>
        </div>
      </form>
    </section>
  );
}
