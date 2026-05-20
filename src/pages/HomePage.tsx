import { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowLeft, BadgeCheck, Sparkles, Truck } from "lucide-react";
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

type ShowcaseScene = {
  step: string;
  title: string;
  text: string;
  left: string;
  right: string;
};

function StickyStoryPanel({ item, index }: { item: ShowcaseScene; index: number }) {
  return (
    <section className="sticky top-0 flex h-[82svh] items-center overflow-hidden rounded-t-[36px] bg-[#f6f0e6] md:h-screen">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(209,139,17,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(209,139,17,0.08)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative mx-auto grid w-full max-w-7xl grid-cols-2 items-center gap-x-3 gap-y-5 px-4 md:grid-cols-[1fr_auto_1fr] md:gap-8 md:px-6">
        <motion.div
          initial={{ opacity: 0, x: -160, rotate: -14, scale: 0.92 }}
          whileInView={{ opacity: 1, x: 0, rotate: index === 0 ? -8 : index === 1 ? -5 : -10, scale: 1 }}
          viewport={{ once: true, amount: 0.55 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-[145px] justify-self-end md:max-w-[360px]"
        >
          <div className="absolute -left-2 top-2 h-full w-full rounded-[18px] border border-[#deceb5] bg-white/70 md:-left-4 md:top-4 md:rounded-[28px]" />
          <div className="relative overflow-hidden rounded-[18px] border border-[#dbc9a8] bg-white p-2 shadow-[0_28px_90px_-58px_rgba(112,69,8,0.38)] md:rounded-[28px] md:p-3">
            <img
              src={item.left}
              alt={item.title}
              loading="lazy"
              decoding="async"
              width={720}
              height={940}
              className="h-[190px] w-full rounded-[14px] object-cover md:h-[470px] md:rounded-[22px]"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 160, rotate: 14, scale: 0.92 }}
          whileInView={{ opacity: 1, x: 0, rotate: index === 0 ? 8 : index === 1 ? 5 : 10, scale: 1 }}
          viewport={{ once: true, amount: 0.55 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-[145px] justify-self-start md:order-3 md:max-w-[360px]"
        >
          <div className="absolute -right-2 top-2 h-full w-full rounded-[18px] border border-[#deceb5] bg-white/70 md:-right-4 md:top-4 md:rounded-[28px]" />
          <div className="relative overflow-hidden rounded-[18px] border border-[#dbc9a8] bg-white p-2 shadow-[0_28px_90px_-58px_rgba(112,69,8,0.38)] md:rounded-[28px] md:p-3">
            <img
              src={item.right}
              alt={item.title}
              loading="lazy"
              decoding="async"
              width={720}
              height={940}
              className="h-[190px] w-full rounded-[14px] object-cover md:h-[470px] md:rounded-[22px]"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 120 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.55 }}
          transition={{ duration: 0.75, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="order-3 col-span-2 mx-auto max-w-sm px-2 text-center md:order-2 md:col-span-1"
        >
          <div className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#24160b] text-sm font-extrabold text-white shadow-[0_20px_38px_-20px_rgba(0,0,0,0.45)] md:h-14 md:w-14 md:text-lg">
            {item.step}
          </div>
          <h3 className="mt-4 text-2xl font-extrabold text-[#24160b] md:mt-5 md:text-5xl">{item.title}</h3>
          <p className="mt-3 text-xs font-bold leading-7 text-[#6a533a] md:mt-4 md:text-base md:leading-8">
            {item.text}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

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

  const featuredProducts = useMemo(() => {
    const activeProducts = products.filter((product) => product.active);
    const featured = activeProducts.filter((product) => product.featured);
    return (featured.length ? featured : activeProducts).slice(0, 3);
  }, [products]);

  const showcasePairs = useMemo<ShowcaseScene[]>(() => {
    const fallbackPairs: Array<[string, string]> = [
      [ASSETS.ctaHoneycomb, ASSETS.honeyLiquid],
      [ASSETS.honeyLiquid, ASSETS.arabicHoneyShowcase],
      [ASSETS.arabicHoneyShowcase, ASSETS.ctaHoneycomb],
    ];

    const imagePairs = featuredProducts.map((product, index) => {
      const firstImage = product.images.find(Boolean) ?? fallbackPairs[index]?.[0] ?? ASSETS.ctaHoneycomb;
      const secondImage = product.images[1] ?? product.images[0] ?? fallbackPairs[index]?.[1] ?? firstImage;
      return [firstImage, secondImage] as [string, string];
    });

    while (imagePairs.length < 3) {
      imagePairs.push(fallbackPairs[imagePairs.length]);
    }

    return [
      {
        step: "1",
        title: "اختيار دقيق",
        text: "نبدأ بانتقاء الأنواع التي تستحق أن تحمل اسم أطلس ميل، حتى لا يصل إليكم إلا العسل الذي يحقق معاييرنا في الطعم والجودة.",
        left: imagePairs[0][0],
        right: imagePairs[0][1],
      },
      {
        step: "2",
        title: "نقاء طبيعي",
        text: "نحافظ على طبيعة المنتج كما هي، بلا إضافات أو خلط، ليبقى المذاق الأصيل والفوائد الطبيعية حاضرين في كل ملعقة.",
        left: imagePairs[1][0],
        right: imagePairs[1][1],
      },
      {
        step: "3",
        title: "ثقة عند الاستلام",
        text: "نهتم بالتفاصيل من العرض إلى التعبئة، حتى تصلكم الطلبات بصورة تليق بثقتكم وتمنحكم تجربة شراء مطمئنة وواضحة.",
        left: imagePairs[2][0],
        right: imagePairs[2][1],
      },
    ];
  }, [featuredProducts]);

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
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={ASSETS.heroVideo} type="video/mp4" />
        </motion.video>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.58),rgba(0,0,0,0.28),rgba(0,0,0,0.8))]" />

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-24 md:-translate-y-10"
        >
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
              مذاق أصيل
              <br />
              <span className="text-[#ffbf43]">من قلب الطبيعة الجزائرية</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.2 }}
              className="mx-auto mt-6 max-w-3xl text-base leading-8 text-white/80 md:text-lg"
            >
              نقدّم لكم عسلاً طبيعياً ومنتجات خلية مختارة بعناية، بطعم نقي وجودة ثابتة وتجربة طلب سهلة وواضحة من أول زيارة.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.35 }}
              className="mt-8 flex flex-col justify-center gap-4 sm:flex-row md:mt-9"
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
                className="inline-flex items-center justify-center rounded-full border border-white/50 px-8 py-4 text-sm font-extrabold text-white hover:text-white"
                style={{ color: "#ffffff" }}
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
              <p className="text-sm font-extrabold tracking-[0.28em] text-[#f0c067]">أصالة موثوقة</p>
              <h2 className="mt-4 text-4xl font-extrabold leading-tight md:text-5xl">
                نختار لكم
                <span className="text-[#ffbf43]"> العسل الطبيعي </span>
                بعناية تليق بثقتكم
              </h2>
              <p className="mt-6 max-w-2xl text-sm leading-8 text-white/75 md:text-base">
                أطلس ميل علامة متخصصة في تقديم العسل الطبيعي الأصيل ومنتجات الخلية المختارة من مصادر موثوقة، لنمنحكم طعماً نقياً وجودة ثابتة وتجربة شراء مريحة وواضحة.
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

            <motion.div {...revealUp} transition={{ duration: 0.75, delay: 0.08 }} className="relative">
              <div className="absolute -left-6 top-10 hidden h-32 w-32 rounded-full bg-[#f0a429]/15 blur-3xl md:block" />
              <div className="absolute -bottom-10 -right-6 hidden h-40 w-40 rounded-full bg-[#24160b]/10 blur-3xl md:block" />
              <div className="overflow-hidden rounded-[38px] border border-[#ead7af] bg-white p-3 shadow-[0_30px_90px_-58px_rgba(112,69,8,0.55)]">
                <img
                  src={ASSETS.arabicHoneyShowcase}
                  alt="العسل ومنتجات الخلية"
                  loading="lazy"
                  decoding="async"
                  width={900}
                  height={900}
                  className="w-full rounded-[30px] object-cover"
                />
              </div>
            </motion.div>
          </div>
        </section>

        <section className="bg-[#f6f0e6] pt-20 md:pt-24">
          <motion.div {...revealUp} className="mx-auto mb-8 max-w-4xl px-6 text-center">
            <p className="text-sm font-extrabold tracking-[0.28em] text-[#d18b11]">لماذا أطلس ميل؟</p>
            <h2 className="mt-3 text-4xl font-extrabold md:text-5xl">ثلاث مراحل تصنع الفرق</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm font-bold leading-8 text-[#6a533a] md:text-base">
              من الانتقاء الأولي إلى التعبئة النهائية، نحافظ على نفس الوعد: عسل طبيعي، نقي، مختار بعناية ليصل إليكم بأفضل صورة.
            </p>
          </motion.div>

          <div className="relative">
            {showcasePairs.map((item, index) => (
              <StickyStoryPanel key={item.step} item={item} index={index} />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20">
          <motion.div
            {...revealUp}
            className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
          >
            <div>
              <p className="text-sm font-extrabold tracking-[0.28em] text-[#d18b11]">أنواع العسل المميزة</p>
              <h2 className="mt-3 text-4xl font-extrabold md:text-5xl">تشكيلة مختارة لعشاق الجودة والطعم الأصيل</h2>
            </div>
            <Link to="/produits" className="text-sm font-extrabold text-[#d18b11]">
              اكتشف المتجر
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
                      loading="lazy"
                      decoding="async"
                      width={1080}
                      height={1350}
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
            <motion.div {...revealUp} className="mb-12 text-center">
              <p className="text-sm font-extrabold tracking-[0.28em] text-[#ffbf43]">قيمتنا</p>
              <h2 className="mt-3 text-4xl font-extrabold md:text-5xl">ما الذي يجعل تجربتكم معنا أكثر ثقة وراحة</h2>
            </motion.div>

            <div className="grid gap-6 lg:grid-cols-3">
              {[
                {
                  icon: Sparkles,
                  title: "اختيار موثوق",
                  text: "ننتقي منتجاتنا من مصادر معروفة ونراجع جودتها بعناية قبل عرضها لكم.",
                },
                {
                  icon: BadgeCheck,
                  title: "جودة واضحة",
                  text: "نعرض كل منتج بصور وتفاصيل دقيقة حتى تكون قرارات الشراء مبنية على وضوح وثقة.",
                },
                {
                  icon: Truck,
                  title: "توصيل مريح",
                  text: "من التصفح إلى تأكيد الطلب، التجربة مبسطة لتصل منتجاتكم بسرعة إلى مختلف الولايات.",
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
          <img
            src={ASSETS.ctaHoneycomb}
            alt=""
            loading="lazy"
            decoding="async"
            width={1600}
            height={900}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(36,22,11,0.82),rgba(36,22,11,0.58))]" />
          <div className="relative z-10 mx-auto max-w-5xl px-6 text-center text-white">
            <p className="text-sm font-extrabold tracking-[0.28em] text-[#ffbf43]">تذوق الأصالة</p>
            <h2 className="mt-4 text-4xl font-extrabold md:text-6xl">اطلب عسلاً طبيعياً يليق بثقتك ومائدتك</h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/80">
              نضع بين أيديكم عسلاً طبيعياً ومنتجات خلية مختارة بعناية، مع تجربة طلب سهلة وتوصيل يغطي مختلف ولايات الجزائر.
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
          <motion.div {...revealUp} className="mb-12 text-center">
            <p className="text-sm font-extrabold tracking-[0.28em] text-[#d18b11]">آراء عملائنا</p>
            <h2 className="mt-3 text-4xl font-extrabold md:text-5xl">كلمات حقيقية من زبائن وثقوا في جودة أطلس ميل</h2>
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
