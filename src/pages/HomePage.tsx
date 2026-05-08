import { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "motion/react";
import {
  ArrowLeft,
  BadgeCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { useCatalog } from "@/components/CatalogProvider";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ASSETS, TESTIMONIALS } from "@/lib/constants";
import { trackPixel } from "@/lib/pixel";
import { formatDzd } from "@/lib/utils";

const revealUp = {
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.7 },
};

export function HomePage() {
  const { products } = useCatalog();
  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.18]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  useEffect(() => {
    void trackPixel("PageView", undefined, {
      source: "src/pages/HomePage.tsx",
    });
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    void video.play().catch(() => undefined);
  }, []);

  const featuredProducts = useMemo(
    () => products.filter((product) => product.active).slice(0, 3),
    [products],
  );

  const showcasePairs = useMemo(() => {
    const images = products
      .filter((product) => product.active)
      .flatMap((product) => product.images)
      .slice(0, 6);

    const fallback = [
      ASSETS.ctaHoneycomb,
      ASSETS.honeyLiquid,
      ASSETS.arabicHoneyShowcase,
      ASSETS.ctaHoneycomb,
      ASSETS.honeyLiquid,
      ASSETS.arabicHoneyShowcase,
    ];

    const pool = images.length === 6 ? images : fallback;

    return [
      {
        step: "1",
        title: "حصاد يدوي",
        text: "يتم جمع العسل بعناية كبيرة للحفاظ على قوامه ونقائه منذ أول مرحلة.",
        left: pool[0],
        right: pool[1],
      },
      {
        step: "2",
        title: "بدون إضافات",
        text: "نقدمه بطبيعته الكاملة، بلا خلط أو إضافات، حتى يصل بطعمه الحقيقي كما هو.",
        left: pool[2],
        right: pool[3],
      },
      {
        step: "3",
        title: "جودة مختبرة",
        text: "كل دفعة تُراجع بعناية حتى نقدم لكم تجربة ثابتة تليق بثقتكم في العلامة.",
        left: pool[4],
        right: pool[5],
      },
    ];
  }, [products]);

  return (
    <div className="overflow-x-hidden bg-[#fffaf0] text-[#24160b]">
      <Navbar />

      <section ref={heroRef} className="relative flex min-h-screen items-center overflow-hidden">
        <motion.video
          ref={videoRef}
          style={{ scale: heroScale }}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster={ASSETS.ctaHoneycomb}
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={ASSETS.heroVideo} type="video/mp4" />
        </motion.video>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.56),rgba(0,0,0,0.26),rgba(0,0,0,0.78))]" />

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-24">
          <div className="mx-auto max-w-4xl text-center">
            <motion.span
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="inline-flex rounded-full border border-[#f5d086]/70 bg-white/10 px-5 py-2 text-xs font-extrabold tracking-[0.32em] text-[#f5d086]"
            >
              ATLAS MIEL DZ
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.1 }}
              className="mt-6 text-5xl font-extrabold leading-[1.05] text-white md:text-7xl lg:text-[5.5rem]"
            >
              تجربة عسل
              <br />
              <span className="text-[#ffbf43]">أكثر فخامة وحداثة</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.2 }}
              className="mx-auto mt-6 max-w-3xl text-base leading-8 text-white/80 md:text-lg"
            >
              عسل طبيعي موثوق، عرض بصري أنيق، طلب سريع، وتجربة عربية راقية صُممت لتترك الانطباع من أول ثانية.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.35 }}
              className="mt-10 flex flex-col justify-center gap-4 sm:flex-row"
            >
              <Link
                to="/produits"
                className="inline-flex items-center justify-center gap-3 rounded-full bg-[#f0a429] px-8 py-4 text-sm font-extrabold text-[#24160b] shadow-[0_20px_50px_rgba(240,164,41,0.35)]"
              >
                عرض منتجاتنا
                <ArrowLeft size={18} />
              </Link>
              <Link
                to="/histoire"
                className="inline-flex items-center justify-center rounded-full border border-white/50 px-8 py-4 text-sm font-extrabold text-white"
              >
                اكتشف قصتنا
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <main>
        <section className="relative mx-auto max-w-7xl px-6 py-20 md:py-24">
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <motion.div
              {...revealUp}
              className="relative overflow-hidden rounded-[36px] bg-[#24160b] p-8 text-white shadow-[0_30px_90px_-55px_rgba(36,22,11,0.8)] md:p-10"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#f0a429] via-[#ffcf71] to-[#f0a429]" />
              <p className="text-sm font-extrabold tracking-[0.28em] text-[#f0c067]">رؤية جديدة</p>
              <h2 className="mt-4 text-4xl font-extrabold leading-tight md:text-5xl">
                واجهة حديثة تضع
                <span className="text-[#ffbf43]"> المنتج </span>
                في مركز التجربة
              </h2>
              <p className="mt-6 max-w-2xl text-sm leading-8 text-white/75 md:text-base">
                لم نعد نعرض العسل كمنتج فقط، بل كتجربة بصرية راقية: صور أقوى، إيقاع أوضح، وثقة محسوسة في كل قسم من الصفحة.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {[
                  { value: "100%", label: "نقاء طبيعي" },
                  { value: "69", label: "ولاية توصيل" },
                  { value: "24/7", label: "جاهزية للطلب" },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.55, delay: 0.15 + index * 0.08 }}
                    className="rounded-[24px] border border-white/10 bg-white/5 p-5 backdrop-blur"
                  >
                    <div className="text-3xl font-extrabold text-[#ffbf43]">{item.value}</div>
                    <div className="mt-2 text-xs font-bold text-white/70">{item.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              {...revealUp}
              transition={{ duration: 0.75, delay: 0.08 }}
              className="relative"
            >
              <div className="absolute -left-6 top-10 hidden h-32 w-32 rounded-full bg-[#f0a429]/15 blur-3xl md:block" />
              <div className="absolute -bottom-10 -right-6 hidden h-40 w-40 rounded-full bg-[#24160b]/10 blur-3xl md:block" />
              <div className="overflow-hidden rounded-[38px] border border-[#ead7af] bg-white p-3 shadow-[0_30px_90px_-58px_rgba(112,69,8,0.55)]">
                <img
                  src={ASSETS.arabicHoneyShowcase}
                  alt="العسل ومنتجات الخلية"
                  className="w-full rounded-[30px] object-cover"
                />
              </div>
            </motion.div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#f6f0e6] py-20">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(209,139,17,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(209,139,17,0.08)_1px,transparent_1px)] bg-[size:64px_64px]" />
          <div className="mx-auto max-w-7xl px-6">
            <motion.div
              {...revealUp}
              className="relative z-10 mb-16 text-center"
            >
              <p className="text-sm font-extrabold tracking-[0.28em] text-[#d18b11]">لماذا نختار عسلنا؟</p>
              <h2 className="mt-3 text-4xl font-extrabold md:text-5xl">6 صور تتحرك مع السّكرول وتحكي 3 أسباب واضحة للثقة</h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm font-bold leading-8 text-[#6a533a] md:text-base">
                كل مرحلتين من الصور تدخلان من الجانبين، وفي الوسط يظهر العنوان من الأسفل ليشرح قيمة حقيقية في المنتج.
              </p>
            </motion.div>

            <div className="relative z-10 space-y-12 md:space-y-20">
              {showcasePairs.map((item) => (
                <div
                  key={item.step}
                  className="grid min-h-[72vh] items-center gap-6 md:grid-cols-[1fr_auto_1fr]"
                >
                  <motion.div
                    initial={{ opacity: 0, x: -90, rotate: -12 }}
                    whileInView={{ opacity: 1, x: 0, rotate: -7 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 0.8, delay: 0.05 }}
                    className="relative mx-auto w-full max-w-[320px] md:max-w-[360px]"
                  >
                    <div className="absolute -top-5 left-4 h-full w-full rounded-[28px] border border-[#dbcdb8] bg-white/60" />
                    <div className="overflow-hidden rounded-[28px] border border-[#d9ccb8] bg-white p-3 shadow-[0_28px_90px_-55px_rgba(112,69,8,0.35)]">
                      <img src={item.left} alt={item.title} className="h-[380px] w-full rounded-[22px] object-cover md:h-[470px]" />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 80 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.45 }}
                    transition={{ duration: 0.75, delay: 0.12 }}
                    className="mx-auto max-w-sm text-center"
                  >
                    <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#24160b] text-lg font-extrabold text-white shadow-[0_18px_40px_-20px_rgba(0,0,0,0.5)]">
                      {item.step}
                    </div>
                    <h3 className="mt-5 text-3xl font-extrabold text-[#24160b] md:text-5xl">{item.title}</h3>
                    <p className="mt-4 text-sm font-bold leading-8 text-[#6a533a] md:text-base">
                      {item.text}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 90, rotate: 12 }}
                    whileInView={{ opacity: 1, x: 0, rotate: 7 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 0.8, delay: 0.05 }}
                    className="relative mx-auto w-full max-w-[320px] md:max-w-[360px]"
                  >
                    <div className="absolute -top-5 right-4 h-full w-full rounded-[28px] border border-[#dbcdb8] bg-white/60" />
                    <div className="overflow-hidden rounded-[28px] border border-[#d9ccb8] bg-white p-3 shadow-[0_28px_90px_-55px_rgba(112,69,8,0.35)]">
                      <img src={item.right} alt={item.title} className="h-[380px] w-full rounded-[22px] object-cover md:h-[470px]" />
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20">
          <motion.div
            {...revealUp}
            className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
          >
            <div>
              <p className="text-sm font-extrabold tracking-[0.28em] text-[#d18b11]">منتجات مختارة</p>
              <h2 className="mt-3 text-4xl font-extrabold md:text-5xl">تشكيلة مصممة لتُبهر من أول نظرة</h2>
            </div>
            <Link to="/produits" className="text-sm font-extrabold text-[#d18b11]">
              مشاهدة الكل
            </Link>
          </motion.div>

          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr_0.9fr]">
            {featuredProducts.map((product, index) => (
              <motion.article
                key={product.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.7, delay: index * 0.08 }}
                className={`group overflow-hidden rounded-[34px] border border-[#ead7af] bg-white shadow-[0_30px_90px_-58px_rgba(112,69,8,0.5)] ${index === 1 ? "xl:-translate-y-6" : ""}`}
              >
                <Link to={`/produits/${product.id}`} className="block">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-6">
                      <div className="inline-flex rounded-full bg-[#f0a429] px-3 py-1 text-xs font-extrabold text-[#24160b]">
                        جديد
                      </div>
                      <h3 className="mt-4 text-3xl font-extrabold text-white">{product.name}</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="line-clamp-3 text-sm leading-8 text-[#6a533a]">{product.description}</p>
                    <div className="mt-6 flex items-center justify-between border-t border-[#f1e0bc] pt-4">
                      <span className="text-2xl font-extrabold text-[#d18b11]">
                        {formatDzd(product.weightOptions[0]?.price ?? 0)}
                      </span>
                      <span className="text-sm font-extrabold text-[#24160b]">اطلب الآن</span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="bg-[#24160b] py-20 text-white">
          <div className="mx-auto max-w-7xl px-6">
            <motion.div
              {...revealUp}
              className="mb-12 text-center"
            >
              <p className="text-sm font-extrabold tracking-[0.28em] text-[#ffbf43]">رحلة الطلب</p>
              <h2 className="mt-3 text-4xl font-extrabold md:text-5xl">واجهة أكثر ذكاءً في عرض المزايا الأساسية</h2>
            </motion.div>

            <div className="grid gap-6 lg:grid-cols-3">
              {[
                {
                  icon: Sparkles,
                  title: "اختيار مدروس",
                  text: "كل منتج معروض بصورة أوضح وتفاصيل أقرب، لتعرف بسرعة ما الذي يناسبك.",
                },
                {
                  icon: BadgeCheck,
                  title: "ثقة فورية",
                  text: "هيكلة الصفحة صارت تشرح الجودة والتوصيل والموثوقية بدون تشويش أو تكرار ممل.",
                },
                {
                  icon: Truck,
                  title: "طلب أسرع",
                  text: "من التصفح إلى الطلب، المسار صار أبسط وأسرع ويخدم تحويل الزائر إلى عميل فعلي.",
                },
              ].map((item, index) => (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 34 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.65, delay: index * 0.08 }}
                  className="rounded-[30px] border border-white/10 bg-white/5 p-7 backdrop-blur"
                >
                  <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ffbf43]/10 text-[#ffbf43]">
                    <item.icon size={24} />
                  </div>
                  <h3 className="text-2xl font-extrabold">{item.title}</h3>
                  <p className="mt-4 text-sm leading-8 text-white/70">{item.text}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.75 }}
          className="relative overflow-hidden py-24"
        >
          <img src={ASSETS.ctaHoneycomb} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(36,22,11,0.82),rgba(36,22,11,0.58))]" />
          <div className="relative z-10 mx-auto max-w-5xl px-6 text-center text-white">
            <p className="text-sm font-extrabold tracking-[0.28em] text-[#ffbf43]">تذوق الأصالة</p>
            <h2 className="mt-4 text-4xl font-extrabold md:text-6xl">واجهة حديثة، قصة أقوى، وعسل يليق بهذه الصورة</h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/80">
              هذه النسخة الجديدة تركز على الإحساس، الوضوح، وسهولة الطلب حتى يشعر العميل أن العلامة احترافية من أول لحظة.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/produits" className="rounded-full bg-[#f0a429] px-8 py-4 text-sm font-extrabold text-[#24160b]">
                ابدأ الطلب
              </Link>
              <div className="flex items-center gap-3 rounded-full border border-white/25 px-6 py-4 text-sm font-bold text-white/90">
                <Truck size={18} />
                توصيل إلى مختلف ولايات الجزائر
              </div>
            </div>
          </div>
        </motion.section>

        <section className="mx-auto max-w-7xl px-6 py-20">
          <motion.div
            {...revealUp}
            className="mb-12 text-center"
          >
            <p className="text-sm font-extrabold tracking-[0.28em] text-[#d18b11]">آراء عملائنا</p>
            <h2 className="mt-3 text-4xl font-extrabold md:text-5xl">انطباعات حقيقية داخل عرض أكثر أناقة</h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((testimonial, index) => (
              <motion.article
                key={testimonial.author}
                initial={{ opacity: 0, y: 34, rotate: index === 1 ? 0 : index === 0 ? -1 : 1 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.65, delay: index * 0.08 }}
                className="rounded-[28px] border border-[#ecd6a8] bg-white p-7 shadow-[0_24px_70px_-56px_rgba(112,69,8,0.45)]"
              >
                <div className="mb-5 text-4xl font-extrabold text-[#f0a429]">“</div>
                <p className="text-sm leading-8 text-[#5b4630]">{testimonial.quote}</p>
                <p className="mt-6 text-lg font-extrabold text-[#d18b11]">{testimonial.author}</p>
              </motion.article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
