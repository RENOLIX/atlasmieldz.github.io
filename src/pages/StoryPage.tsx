import { motion } from "motion/react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ASSETS, HONEY_PILLARS } from "@/lib/constants";

export function StoryPage() {
  return (
    <div className="min-h-screen bg-[#fffaf0] text-[#24160b]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 pt-32 pb-20">
        <div className="mb-12 text-center">
          <p className="text-sm font-extrabold text-[#d18b11]">من نحن</p>
          <h1 className="mt-3 text-4xl font-extrabold md:text-6xl">أطلس هي علامة متخصصة في العسل الطبيعي الأصيل</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {HONEY_PILLARS.map((pillar, index) => (
            <motion.article
              key={pillar.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              className="rounded-[28px] bg-white p-7 shadow-[0_24px_70px_-56px_rgba(112,69,8,0.55)]"
            >
              <h2 className="text-2xl font-extrabold text-[#d18b11]">{pillar.title}</h2>
              <p className="mt-4 text-sm leading-8 text-[#5b4630]">{pillar.text}</p>
            </motion.article>
          ))}
        </div>

        <motion.section
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-14 grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]"
        >
          <div className="space-y-6 text-base leading-9 text-[#4c3928]">
            <p>نحرص على اختيار أجود أنواع العسل بعناية من مصادر موثوقة، لنقدم لعملائنا منتجًا نقيًا، لذيذًا، وغنيًا بالفوائد الصحية.</p>
            <p>نؤمن بأن العسل ليس مجرد منتج غذائي، بل هو كنز طبيعي يحمل في طياته فوائد عديدة للجسم والصحة، لذلك نلتزم بتقديم منتج واضح المصدر ومريح في الطلب.</p>
            <p>هدفنا أن نكون خياركم الأول في العسل الطبيعي، وأن نمنح العلامة تجربة بصرية وميدانية تليق بثقة العميل من أول زيارة إلى لحظة الاستلام.</p>
          </div>
          <div className="overflow-hidden rounded-[34px] shadow-[0_30px_85px_-60px_rgba(112,69,8,0.65)]">
            <img src={ASSETS.ctaHoneycomb} alt="عسل أطلس" className="h-full w-full object-cover" />
          </div>
        </motion.section>
      </main>
      <Footer />
    </div>
  );
}
