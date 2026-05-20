import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { CheckCircle2, Gift, ShieldCheck, Truck } from "lucide-react";
import { toast } from "sonner";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_PRICES, WILAYAS } from "@/lib/constants";
import { trackPixel } from "@/lib/pixel";
import { createOrder, fetchPublicProductById } from "@/lib/supabase";
import type { ProductRecord } from "@/types";
import { decodeSafeId, formatDzd } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProductPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isPackPage = location.pathname.startsWith("/packs");
  const productId = decodeSafeId(id);
  const [product, setProduct] = useState<ProductRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedWeight, setSelectedWeight] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [wilaya, setWilaya] = useState("");
  const [address, setAddress] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [deliveryMethod, setDeliveryMethod] = useState<"domicile" | "bureau">("domicile");
  const [submitting, setSubmitting] = useState(false);
  const mobileOrderFormRef = useRef<HTMLElement | null>(null);
  const desktopOrderFormRef = useRef<HTMLElement | null>(null);

  const scrollToOrderForm = () => {
    const form =
      typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches
        ? mobileOrderFormRef.current
        : desktopOrderFormRef.current;

    if (!form) return;
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      setProduct(null);
      return;
    }

    setLoading(true);
    void fetchPublicProductById(productId, isPackPage ? "pack" : "product")
      .then((item) => setProduct(item))
      .catch((error: Error) => {
        toast.error(error.message);
        setProduct(null);
      })
      .finally(() => setLoading(false));
  }, [isPackPage, productId]);

  useEffect(() => {
    if (product?.weightOptions[0]) {
      setSelectedWeight(product.weightOptions[0].label);
      setActiveImage(0);
    }
  }, [product]);

  const weightOption = useMemo(
    () => product?.weightOptions.find((option) => option.label === selectedWeight) ?? product?.weightOptions[0],
    [product, selectedWeight],
  );

  const descriptionParagraphs = useMemo(
    () =>
      product?.description
        .split(/(?<=[.!؟])\s+/u)
        .map((chunk) => chunk.trim())
        .filter(Boolean) ?? [],
    [product?.description],
  );

  const subtotal = (weightOption?.price ?? 0) * quantity;
  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shipping = wilaya ? (freeShipping ? 0 : SHIPPING_PRICES[wilaya]?.[deliveryMethod] ?? 0) : 0;
  const total = subtotal + shipping;
  const pageLoading = loading;
  const backToListing = isPackPage ? "/packs" : "/produits";

  useEffect(() => {
    if (!product || !weightOption) return;

    void trackPixel(
      "ViewContent",
      {
        content_ids: [product.id],
        content_name: product.name,
        content_type: "product",
        value: weightOption.price,
        currency: "DZD",
      },
      {
        source: "src/pages/ProductPage.tsx",
        productId: product.id,
      },
    );
  }, [product, weightOption]);

  const handleOrderSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!product || !weightOption) return;

    if (!name.trim() || !/^\d{10}$/.test(phone) || !wilaya || !address.trim()) {
      toast.error("يرجى ملء جميع الحقول بشكل صحيح.");
      return;
    }

    setSubmitting(true);

    void createOrder({
      customerName: name.trim(),
      customerPhone: phone.trim(),
      items: [
        {
          productId: product.id,
          productName: product.name,
          image: product.images[0],
          weight: weightOption.label,
          price: weightOption.price,
          quantity,
        },
      ],
      subtotal,
      shipping,
      total,
      shippingAddress: {
        wilaya,
        address: address.trim(),
        deliveryMethod,
      },
      paymentMethod: "الدفع عند الاستلام",
    })
      .then((order) => {
        window.sessionStorage.setItem(
          "atlas-last-order",
          JSON.stringify({
            orderNumber: order.orderNumber,
            productId: product.id,
            productName: product.name,
            quantity,
            value: total,
            currency: "DZD",
            pixelSent: false,
          }),
        );

        navigate(`/merci?order=${encodeURIComponent(order.orderNumber)}`, { replace: true });
      })
      .catch((error: Error) => {
        toast.error(error.message);
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const renderOrderForm = (mode: "mobile" | "desktop") => (
    <motion.section
      ref={mode === "mobile" ? mobileOrderFormRef : desktopOrderFormRef}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
      className={
        mode === "mobile"
          ? "mt-8 rounded-[32px] bg-white p-5 shadow-[0_28px_80px_-58px_rgba(112,69,8,0.55)] md:hidden"
          : "mx-auto mt-20 hidden max-w-4xl rounded-[36px] bg-white p-6 shadow-[0_28px_80px_-58px_rgba(112,69,8,0.55)] md:block md:p-8"
      }
    >
      <h2 className="text-center text-3xl font-extrabold text-[#d18b11]">تأكيد الطلب</h2>

      <form className="mt-8 space-y-5" onSubmit={handleOrderSubmit}>
        <div className="space-y-3">
          <p className="text-right text-sm font-extrabold text-[#7a5a27]">اختر الوزن</p>
          <div className="grid grid-cols-2 gap-3">
            {product?.weightOptions.map((option) => (
              <button
                key={`form-${mode}-${option.label}`}
                type="button"
                onClick={() => setSelectedWeight(option.label)}
                className={`rounded-[24px] border p-4 text-right transition-colors ${
                  selectedWeight === option.label ? "border-[#f0a429] bg-[#fff2d4]" : "border-[#ead7af] bg-white"
                }`}
              >
                <p className="text-base font-extrabold">{option.label}</p>
                <p className="mt-2 text-lg font-extrabold text-[#d18b11]">{formatDzd(option.price)}</p>
                {option.comparePrice && option.comparePrice > option.price ? (
                  <p className="text-sm font-bold text-[#8e7a66] line-through">{formatDzd(option.comparePrice)}</p>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="الاسم واللقب" />
          <Input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            inputMode="numeric"
            maxLength={10}
            placeholder="رقم الهاتف"
          />
        </div>

        <select
          value={wilaya}
          onChange={(event) => setWilaya(event.target.value)}
          className="h-12 w-full rounded-2xl border border-[#e7d2a6] bg-white px-4 text-sm outline-none focus:border-[#f0a429]"
        >
          <option value="">اختر الولاية</option>
          {WILAYAS.map((entry, index) => (
            <option key={entry} value={entry}>
              {String(index + 1).padStart(2, "0")} - {entry}
            </option>
          ))}
        </select>

        <Input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="العنوان الدقيق" />

        <div className="space-y-2">
          <p className="text-right text-sm font-extrabold text-[#7a5a27]">الكمية</p>
          <Input
            type="number"
            min={1}
            value={quantity}
            onChange={(event) => setQuantity(Math.max(1, Number(event.target.value || 1)))}
            className="h-12 rounded-2xl border-[#e7d2a6] text-center text-sm font-extrabold focus-visible:ring-[#f0a429]"
          />
        </div>

        <div>
          <p className="mb-3 text-sm font-extrabold">طريقة التوصيل</p>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 rounded-full border border-[#ead7af] px-4 py-3">
              <input type="radio" checked={deliveryMethod === "domicile"} onChange={() => setDeliveryMethod("domicile")} />
              منزل
            </label>
            <label className="flex items-center gap-2 rounded-full border border-[#ead7af] px-4 py-3">
              <input type="radio" checked={deliveryMethod === "bureau"} onChange={() => setDeliveryMethod("bureau")} />
              مكتب
            </label>
          </div>
        </div>

        {freeShipping ? (
          <div className="flex items-center gap-2 text-sm font-extrabold text-green-700">
            <Gift size={18} />
            مبروك، حصلت على توصيل مجاني.
          </div>
        ) : null}

        <div className="rounded-2xl bg-[#f6f1e8] px-4 py-4 text-sm font-bold text-[#6b5640]">
          {wilaya ? `سعر التوصيل: ${freeShipping ? "مجاني" : formatDzd(shipping)}` : "يرجى اختيار الولاية لحساب التوصيل"}
        </div>
        <div className="rounded-2xl bg-black px-4 py-4 text-lg font-extrabold text-white">
          المجموع الإجمالي: {formatDzd(total)}
        </div>

        <Button className="w-full" disabled={submitting}>
          {submitting ? "جار تأكيد الطلب..." : "تأكيد الشراء الآن"}
        </Button>
      </form>
    </motion.section>
  );

  if (!pageLoading && !product) {
    return (
      <div className="min-h-screen bg-[#fffaf0] text-[#24160b]">
        <Navbar />
        <main className="mx-auto flex max-w-4xl flex-col items-center justify-center px-6 pb-24 pt-36 text-center">
          <h1 className="text-4xl font-extrabold">المنتج غير متوفر</h1>
          <p className="mt-4 text-base text-[#6b5640]">هذا الرابط غير صالح أو أن المنتج لم يعد موجوداً.</p>
          <Link to={backToListing} className="mt-8 rounded-full bg-[#f0a429] px-7 py-4 text-sm font-extrabold text-[#24160b]">
            {isPackPage ? "العودة إلى الباقات" : "العودة إلى المنتجات"}
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  if (pageLoading && !product) {
    return (
      <div className="min-h-screen bg-[#fffaf0] text-[#24160b]">
        <Navbar />
        <main className="mx-auto max-w-7xl px-6 pb-20 pt-32">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-4">
              <div className="aspect-[4/5] animate-pulse rounded-[32px] bg-[#f6ead0]" />
              <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="aspect-square animate-pulse rounded-2xl bg-[#f6ead0]" />
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <div className="h-4 w-40 animate-pulse rounded-full bg-[#f6ead0]" />
              <div className="h-12 w-72 animate-pulse rounded-full bg-[#f6ead0]" />
              <div className="h-8 w-36 animate-pulse rounded-full bg-[#f6ead0]" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-6 animate-pulse rounded-full bg-[#f6ead0]" />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="h-24 animate-pulse rounded-[24px] bg-[#f6ead0]" />
                ))}
              </div>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-14 animate-pulse rounded-2xl bg-[#f6ead0]" />
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product || !weightOption) {
    return (
      <div className="min-h-screen bg-[#fffaf0]">
        <Navbar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffaf0] text-[#24160b]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 pb-32 pt-32 md:pb-20">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <section>
            <div className="overflow-hidden rounded-[32px] bg-white shadow-[0_28px_80px_-58px_rgba(112,69,8,0.55)]">
              <img
                src={product.images[activeImage]}
                alt={product.name}
                fetchPriority="high"
                decoding="async"
                width={1080}
                height={1350}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {product.images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`overflow-hidden rounded-2xl border ${
                    activeImage === index ? "border-[#f0a429]" : "border-[#ead7af]"
                  }`}
                >
                  <img
                    src={image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    width={240}
                    height={240}
                    className="aspect-square h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </section>

          <section>
            <Link to={backToListing} className="text-sm font-extrabold text-[#d18b11]">
              {isPackPage ? "العودة إلى الباقات" : "العودة إلى المنتجات"}
            </Link>
            <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">{product.name}</h1>
            <div className="mt-4 flex items-end gap-3">
              <span className="text-3xl font-extrabold text-[#d18b11]">{formatDzd(weightOption.price)}</span>
              {weightOption.comparePrice && weightOption.comparePrice > weightOption.price ? (
                <span className="text-lg font-bold text-[#8e7a66] line-through">{formatDzd(weightOption.comparePrice)}</span>
              ) : null}
            </div>

            <div className="mt-8 hidden md:block">
              <p className="mb-3 text-sm font-extrabold">اختر الوزن</p>
              <div className="grid grid-cols-2 gap-3">
                {product.weightOptions.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => setSelectedWeight(option.label)}
                    className={`rounded-[24px] border p-4 text-right ${
                      selectedWeight === option.label ? "border-[#f0a429] bg-[#fff2d4]" : "border-[#ead7af] bg-white"
                    }`}
                  >
                    <p className="text-base font-extrabold">{option.label}</p>
                    <p className="mt-2 text-lg font-extrabold text-[#d18b11]">{formatDzd(option.price)}</p>
                    {option.comparePrice && option.comparePrice > option.price ? (
                      <p className="text-sm font-bold text-[#8e7a66] line-through">{formatDzd(option.comparePrice)}</p>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            {renderOrderForm("mobile")}

            <div className="mt-8 grid gap-3">
              {["منتج طبيعي مختار بعناية", "تغليف محترف وآمن", "الدفع عند الاستلام"].map((item) => (
                <div key={item} className="relative rounded-2xl bg-white px-4 py-3 pr-12 shadow-sm">
                  <CheckCircle2 size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#d18b11]" />
                  <p className="text-right text-sm leading-7 text-[#5b4630]">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-2">
              <div className="rounded-[24px] border border-[#ead7af] bg-white p-4">
                <Truck size={20} className="text-[#d18b11]" />
                <p className="mt-2 text-sm font-extrabold">توصيل سريع</p>
              </div>
              <div className="rounded-[24px] border border-[#ead7af] bg-white p-4">
                <ShieldCheck size={20} className="text-[#d18b11]" />
                <p className="mt-2 text-sm font-extrabold">الدفع عند الاستلام</p>
              </div>
            </div>
          </section>
        </div>

        {renderOrderForm("desktop")}

        <section className="mx-auto mt-10 max-w-4xl rounded-[32px] border border-[#ead7af] bg-white p-6 shadow-[0_24px_70px_-54px_rgba(112,69,8,0.28)] md:p-8">
          <p className="text-sm font-extrabold text-[#d18b11]">تفاصيل المنتج</p>
          <h3 className="mt-2 text-2xl font-extrabold text-[#24160b]">وصف المنتج</h3>
          <div className="mt-5 space-y-4">
            {(descriptionParagraphs.length ? descriptionParagraphs : [product.description]).map((paragraph, index) => (
              <p key={`${index}-${paragraph.slice(0, 20)}`} className="text-justify text-base leading-8 text-[#5b4630]">
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      </main>
      <div className="fixed inset-x-4 bottom-4 z-40 md:hidden">
        <Button className="w-full py-4 shadow-[0_18px_45px_rgba(36,22,11,0.22)]" onClick={scrollToOrderForm}>
          اطلب الان
        </Button>
      </div>
      <Footer />
    </div>
  );
}
