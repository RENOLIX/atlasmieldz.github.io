import { Link } from "react-router-dom";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#fffaf0] text-[#24160b]">
      <Navbar />
      <main className="mx-auto flex max-w-3xl flex-1 flex-col items-center justify-center px-6 pt-36 pb-24 text-center">
        <p className="text-sm font-extrabold text-[#d18b11]">404</p>
        <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">الرابط غير موجود</h1>
        <p className="mt-4 text-base leading-8 text-[#6b5640]">
          قد يكون الرابط قديماً أو غير صحيح. يمكنك الرجوع إلى الصفحة الرئيسية أو تصفح المنتجات مباشرة.
        </p>
        <div className="mt-8 flex gap-4">
          <Link to="/" className="rounded-full bg-[#f0a429] px-7 py-4 text-sm font-extrabold text-[#24160b]">الرئيسية</Link>
          <Link to="/produits" className="rounded-full border border-[#e7d2a6] bg-white px-7 py-4 text-sm font-extrabold text-[#24160b]">المنتجات</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
