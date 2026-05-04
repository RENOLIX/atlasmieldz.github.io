import { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowLeft, ShieldCheck, Sparkles, Truck, Wheat } from "lucide-react";
import { useCatalog } from "@/components/CatalogProvider";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ASSETS, HONEY_PILLARS, TESTIMONIALS } from "@/lib/constants";
import { trackPixel } from "@/lib/pixel";
import { formatDzd } from "@/lib/utils";

export function HomePage() {
  const { products } = useCatalog();
  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0.2]);

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

  return (
    <div className="bg-[#fffaf0] text-[#24160b]">
      <Navbar />

      <section ref={heroRef} className="relative flex min-h-screen items-center overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster={ASSETS.ctaHoneycomb}
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={ASSETS.heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.55),rgba(0,0,0,0.38),rgba(0,0,0,0.72))]" />

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 mx-auto max-w-6xl px-6 pt-24 text-center">
          <motion.span
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex rounded-full border border-[#f5d086]/70 bg-black/10 px-5 py-2 text-xs font-extrabold text-[#f5d086]"
          >
            عسل طبيعي جزائري أصيل
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mt-6 text-5xl font-extrabold leading-[1.1] text-white md:text-7xl lg:text-8xl"
          >
            ذوق فاخر
            <br />
            <span className="text-[#ffbf43]">من قلب الخلية إلى بيتك</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.2 }}
            className="mx-auto mt-6 max-w-3xl text-base leading-8 text-white/80 md:text-lg"
          >
            نعيد تقديم أطلس ميل بشكل أكثر قوة وأناقة: تجربة عربية صافية، عسل طبيعي موثق، طلب مباشر، وتوصيل إلى مختلف ولايات الجزائر.
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
        </motion.div>
      </section>

      <main>
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-7xl px-6 py-20"
        >
          <div className="overflow-hidden rounded-[36px] bg-[#fff4dc] p-4 shadow-[0_28px_80px_-55px_rgba(112,69,8,0.45)] md:p-10">
            <img
              src={ASSETS.arabicHoneyShowcase}
              alt="العسل ومنتجات الخلية"
              className="w-full object-cover"
            />
          </div>
        </motion.section>

        <section className="mx-auto max-w-7xl px-6 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.65 }}
            className="mb-10 text-center"
          >
            <p className="text-sm font-extrabold text-[#d18b11]">أساس الثقة</p>
            <h2 className="mt-3 text-4xl font-extrabold md:text-5xl">نكتب تجربة مختلفة من أول لقطة إلى آخر طلب</h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {HONEY_PILLARS.map((pillar, index) => (
              <motion.article
                key={pillar.title}
                initial={{ opacity: 0, y: 34 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                className="rounded-[28px] border border-[#ecd6a8] bg-white p-7 shadow-[0_24px_70px_-56px_rgba(112,69,8,0.55)]"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff2d4] text-[#d18b11]">
                  {index === 0 ? <Sparkles /> : index === 1 ? <Wheat /> : <ShieldCheck />}
                </div>
                <h3 className="mb-3 text-2xl font-extrabold text-[#d18b11]">{pillar.title}</h3>
                <p className="text-sm leading-8 text-[#5b4630]">{pillar.text}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="bg-[#24160b] py-14 text-white">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="mx-auto grid max-w-5xl gap-8 px-6 md:grid-cols-3"
          >
            <div className="text-center">
              <p className="text-3xl font-extrabold text-[#ffbf43]">100% طبيعي</p>
            </div>
            <div className="flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#ffbf43]/40 bg-white/5 text-[#ffbf43]">
                <ShieldCheck size={28} />
              </div>
            </div>
            <div className="text-center">
              <p className="text-3xl font-extrabold text-[#ffbf43]">توصيل 69 ولاية</p>
            </div>
          </motion.div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.65 }}
            className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
          >
            <div>
              <p className="text-sm font-extrabold text-[#d18b11]">المنتجات المميزة</p>
              <h2 className="mt-3 text-4xl font-extrabold md:text-5xl">منتجاتنا المتاحة الآن</h2>
            </div>
            <Link to="/produits" className="text-sm font-extrabold text-[#d18b11]">
              مشاهدة الكل
            </Link>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-3">
            {featuredProducts.map((product, index) => (
              <motion.article
                key={product.id}
                initial={{ opacity: 0, y: 34 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                className="group overflow-hidden rounded-[30px] border border-[#ecd6a8] bg-white shadow-[0_24px_70px_-56px_rgba(112,69,8,0.55)]"
              >
                <Link to={`/produits/${product.id}`}>
                  <div className="aspect-[4/5] overflow-hidden">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <p className="mb-2 text-xs font-extrabold text-[#d18b11]">جديد</p>
                    <h3 className="text-2xl font-extrabold">{product.name}</h3>
                    <p className="mt-3 line-clamp-2 text-sm leading-7 text-[#6b5640]">{product.description}</p>
                    <div className="mt-5 flex items-center justify-between border-t border-[#f2e5c8] pt-4">
                      <span className="text-xl font-extrabold text-[#d18b11]">
                        {formatDzd(product.weightOptions[0]?.price ?? 0)}
                      </span>
                      <span className="text-sm font-extrabold">اطلب الآن</span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
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
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(36,22,11,0.78),rgba(36,22,11,0.62))]" />
          <div className="relative z-10 mx-auto max-w-4xl px-6 text-center text-white">
            <p className="text-sm font-extrabold text-[#ffbf43]">تذوق الأصالة</p>
            <h2 className="mt-4 text-4xl font-extrabold md:text-6xl">اطلب عسلك الطبيعي بثقة واستلمه بسرعة</h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/80">
              ندمج بين صورة قوية، تجربة مريحة، ومنتج واضح التفاصيل. كل هذا لتشعر أن العلامة احترافية من أول ثانية.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link to="/produits" className="rounded-full bg-[#f0a429] px-8 py-4 text-sm font-extrabold text-[#24160b]">
                ابدأ الطلب
              </Link>
              <div className="flex items-center gap-2 rounded-full border border-white/25 px-6 py-4 text-sm font-bold text-white/90">
                <Truck size={18} />
                توصيل إلى مختلف ولايات الجزائر
              </div>
            </div>
          </div>
        </motion.section>

        <section className="mx-auto max-w-7xl px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.65 }}
            className="mb-10 text-center"
          >
            <p className="text-sm font-extrabold text-[#d18b11]">آراء عملائنا</p>
            <h2 className="mt-3 text-4xl font-extrabold md:text-5xl">الثقة تُبنى من التجربة</h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((testimonial, index) => (
              <motion.article
                key={testimonial.author}
                initial={{ opacity: 0, y: 34 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                className="rounded-[28px] border border-[#ecd6a8] bg-white p-7 shadow-[0_24px_70px_-56px_rgba(112,69,8,0.55)]"
              >
                <p className="text-sm leading-8 text-[#5b4630]">“{testimonial.quote}”</p>
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
