import { Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { ASSETS, SITE } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="bg-[#d6a15a] text-[#24160b]">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-14 md:grid-cols-[1.2fr_1fr_1fr]">
        <div className="text-center md:text-right">
          <img src={ASSETS.logo} alt="ATLAS" className="mx-auto mb-4 h-20 w-40 object-contain md:mr-0" />
          <p className="mx-auto max-w-sm text-sm leading-7 opacity-85 md:mx-0">
            أطلس ميل يقدم عسلاً طبيعياً ومنتجات خلية مختارة بعناية، بجودة واضحة وتجربة طلب مريحة إلى مختلف ولايات الجزائر.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-extrabold uppercase tracking-[0.25em]">الصفحات</h3>
          <div className="flex flex-col gap-3 text-sm">
            <Link to="/">الصفحة الرئيسية</Link>
            <Link to="/produits">المتجر</Link>
            <Link to="/histoire">من نحن</Link>
            <Link to="/contact">اتصل بنا</Link>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-extrabold uppercase tracking-[0.25em]">بيانات التواصل</h3>
          <div className="space-y-3 text-sm">
            <p className="flex items-center gap-3"><MapPin size={16} /> {SITE.city}</p>
            <p className="flex items-center gap-3"><Phone size={16} /> {SITE.phone}</p>
            <p className="flex items-center gap-3"><Mail size={16} /> {SITE.email}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-[#24160b]/10 py-5 text-center text-xs font-semibold">
        © Atlas Miel DZ 2026 جميع الحقوق محفوظة
      </div>
    </footer>
  );
}
