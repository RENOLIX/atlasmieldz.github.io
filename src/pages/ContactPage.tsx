import { useState } from "react";
import { motion } from "motion/react";
import { Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { SITE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ContactPage() {
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="min-h-screen bg-[#fffaf0] text-[#24160b]">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 pt-32 pb-20">
        <div className="mb-12 text-center">
          <p className="text-sm font-extrabold text-[#d18b11]">اتصل بنا</p>
          <h1 className="mt-3 text-4xl font-extrabold md:text-6xl">نحن هنا لأي استفسار أو طلب خاص</h1>
        </div>

        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.section
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-[32px] bg-white p-8 shadow-[0_24px_70px_-56px_rgba(112,69,8,0.55)]"
          >
            <h2 className="text-3xl font-extrabold">معلومات التواصل</h2>
            <div className="mt-8 space-y-5 text-sm">
              <p className="flex items-center gap-3"><MapPin size={18} /> {SITE.city}</p>
              <p className="flex items-center gap-3"><Phone size={18} /> {SITE.phone}</p>
              <p className="flex items-center gap-3"><Mail size={18} /> {SITE.email}</p>
            </div>
          </motion.section>

          <motion.form
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-[32px] bg-white p-8 shadow-[0_24px_70px_-56px_rgba(112,69,8,0.55)]"
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitting(true);
              window.setTimeout(() => {
                setSubmitting(false);
                toast.success("تم إرسال رسالتك بنجاح.");
              }, 700);
            }}
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Input placeholder="الاسم الكامل" required />
              <Input placeholder="رقم الهاتف" required />
            </div>
            <Input className="mt-5" placeholder="البريد الإلكتروني" type="email" />
            <Textarea className="mt-5" placeholder="اكتب رسالتك هنا..." required />
            <Button className="mt-6 w-full" disabled={submitting}>
              {submitting ? "جارٍ الإرسال..." : "إرسال الرسالة"}
            </Button>
          </motion.form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
