import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { useCatalog } from "@/components/CatalogProvider";
import { formatDzd } from "@/lib/utils";

export function ProductsPage() {
  const { products, loading } = useCatalog();
  const visibleProducts = products.filter((product) => product.active);

  return (
    <div className="min-h-screen bg-[#fffaf0] text-[#24160b]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 pb-20 pt-32">
        <div className="mb-10 text-center">
          <p className="text-sm font-extrabold text-[#d18b11]">منتجات أطلس ميل</p>
          <h1 className="mt-3 text-4xl font-extrabold md:text-6xl">اختر المنتج المناسب لك</h1>
        </div>

        {loading && visibleProducts.length === 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-[420px] animate-pulse rounded-[28px] bg-[#f6ead0]" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleProducts.map((product, index) => (
              <motion.article
                key={product.id}
                initial={{ opacity: 0, y: 34 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.55, delay: index * 0.06 }}
                className="overflow-hidden rounded-[30px] border border-[#ecd6a8] bg-white shadow-[0_24px_70px_-56px_rgba(112,69,8,0.55)]"
              >
                <Link to={`/produits/${product.id}`}>
                  <div className="aspect-[4/5] overflow-hidden">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      width={1080}
                      height={1350}
                      className="h-full w-full object-cover transition duration-700 hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
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
        )}
      </main>
      <Footer />
    </div>
  );
}
