import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPixelCache } from "@/lib/pixel";
import { fetchMetaPixelSettings, saveMetaPixelSettings } from "@/lib/supabase";

export function AdminPixelPage() {
  const [pixelId, setPixelId] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void fetchMetaPixelSettings()
      .then((settings) => {
        setPixelId(settings.pixelId);
        setEnabled(settings.enabled);
      })
      .catch((error: Error) => {
        toast.error(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <section className="space-y-6">
      <div className="rounded-[30px] bg-white p-6 shadow-[0_24px_70px_-54px_rgba(112,69,8,0.45)]">
        <p className="text-sm font-extrabold text-[#d18b11]">التسويق</p>
        <h1 className="mt-2 text-3xl font-extrabold">Meta Pixel</h1>
        <p className="mt-3 text-sm leading-7 text-[#7a644d]">
          إدارة التتبع من لوحة التحكم: تفعيل، تعطيل، وتغيير رقم البكسل بدون تعديل يدوي في الملفات.
        </p>
      </div>

      <div className="rounded-[30px] bg-white p-6 shadow-[0_24px_70px_-54px_rgba(112,69,8,0.45)]">
        {loading ? (
          <div className="h-36 animate-pulse rounded-[24px] bg-[#f6ead0]" />
        ) : (
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              setSaving(true);
              void saveMetaPixelSettings({ pixelId: pixelId.trim(), enabled })
                .then(() => {
                  resetPixelCache();
                  toast.success("تم حفظ إعدادات Meta Pixel.");
                })
                .catch((error: Error) => {
                  toast.error(error.message);
                })
                .finally(() => {
                  setSaving(false);
                });
            }}
          >
            <div className="rounded-[24px] border border-[#f2e5c8] bg-[#fff9eb] p-4">
              <p className={`text-sm font-extrabold ${enabled ? "text-green-700" : "text-[#7a644d]"}`}>
                {enabled ? "البكسل مفعل" : "البكسل غير مفعل"}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-extrabold">Meta Pixel ID</label>
              <Input
                value={pixelId}
                onChange={(event) => setPixelId(event.target.value)}
                placeholder="801705945953894"
                inputMode="numeric"
              />
              <p className="text-xs leading-6 text-[#7a644d]">
                ضع المعرف الرقمي فقط من Meta Events Manager.
              </p>
            </div>

            <label className="flex items-center gap-3 rounded-[22px] border border-[#f2e5c8] px-4 py-4 text-sm font-bold">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(event) => setEnabled(event.target.checked)}
              />
              تفعيل Meta Pixel
            </label>

            <div className="grid gap-3 md:grid-cols-2">
              <Button type="submit" disabled={saving}>
                {saving ? "جارٍ الحفظ..." : "حفظ الإعدادات"}
              </Button>

              <a
                href="https://business.facebook.com/events_manager2/list/pixel/"
                target="_blank"
                rel="noreferrer"
              >
                <Button type="button" variant="secondary" className="w-full">
                  <ExternalLink size={16} />
                  فتح Events Manager
                </Button>
              </a>
            </div>

            <div className="rounded-[24px] bg-[#f6f1e8] p-5 text-sm leading-7 text-[#5b4630]">
              <p className="font-extrabold text-[#24160b]">الأحداث الحالية</p>
              <ul className="mt-2 space-y-2">
                <li>PageView في الصفحة الرئيسية فقط.</li>
                <li>ViewContent في صفحة المنتج فقط.</li>
                <li>Purchase في صفحة الشكر بعد طلب ناجح فقط.</li>
              </ul>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
