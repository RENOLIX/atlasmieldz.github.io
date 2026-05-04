import { useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { trackPixel } from "@/lib/pixel";
import { formatDzd } from "@/lib/utils";

function readOrderSnapshot() {
  try {
    return JSON.parse(window.sessionStorage.getItem("atlas-last-order") ?? "{}") as {
      orderNumber?: string;
      productId?: string;
      productName?: string;
      quantity?: number;
      value?: number;
      currency?: string;
      pixelSent?: boolean;
    };
  } catch {
    return {};
  }
}

export function ThanksPage() {
  const [params] = useSearchParams();
  const snapshot = useMemo(() => readOrderSnapshot(), []);
  const orderNumber = params.get("order") ?? snapshot.orderNumber ?? "";
  const validPurchase = snapshot.orderNumber && orderNumber === snapshot.orderNumber;

  useEffect(() => {
    if (!validPurchase || snapshot.pixelSent || !snapshot.value || snapshot.value <= 0) return;

    void trackPixel("Purchase", {
      content_ids: snapshot.productId ? [snapshot.productId] : [],
      content_name: snapshot.productName,
      content_type: "product",
      value: snapshot.value,
      currency: snapshot.currency ?? "DZD",
      num_items: snapshot.quantity ?? 1,
    }, {
      source: "src/pages/ThanksPage.tsx",
      orderId: snapshot.orderNumber,
      productId: snapshot.productId,
    }).then((sent) => {
      if (!sent) return;
      window.sessionStorage.setItem("atlas-last-order", JSON.stringify({
        ...snapshot,
        pixelSent: true,
      }));
    });
  }, [snapshot, validPurchase]);

  return (
    <div className="min-h-screen bg-[#fffaf0] text-[#24160b]">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 pt-36 pb-24 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-700">
          <CheckCircle2 size={42} />
        </div>
        <h1 className="mt-6 text-4xl font-extrabold md:text-5xl">شكراً على طلبك</h1>
        <p className="mt-4 text-base leading-8 text-[#6b5640]">
          تم تسجيل الطلب بنجاح، وسيتواصل معك فريق أطلس ميل لتأكيد التوصيل في أقرب وقت.
        </p>

        <div className="mt-10 rounded-[30px] bg-white p-6 text-right shadow-[0_24px_70px_-56px_rgba(112,69,8,0.55)]">
          {orderNumber ? <p className="border-b border-[#f2e5c8] py-4 text-sm font-extrabold">رقم الطلب: {orderNumber}</p> : null}
          {snapshot.productName ? <p className="border-b border-[#f2e5c8] py-4 text-sm font-extrabold">المنتج: {snapshot.productName}</p> : null}
          {snapshot.value ? <p className="py-4 text-sm font-extrabold">المجموع: {formatDzd(snapshot.value)}</p> : null}
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <Link to="/" className="rounded-full bg-[#f0a429] px-7 py-4 text-sm font-extrabold text-[#24160b]">العودة للرئيسية</Link>
          <Link to="/produits" className="rounded-full border border-[#ead7af] bg-white px-7 py-4 text-sm font-extrabold text-[#24160b]">تصفح المنتجات</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
