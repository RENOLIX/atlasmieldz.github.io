import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { ASSETS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const links = [
  { label: "الرئيسية", href: "/" },
  { label: "المنتجات", href: "/produits" },
  { label: "من نحن", href: "/histoire" },
  { label: "اتصل بنا", href: "/contact" },
];

export function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const transparent = isHome && !scrolled && !open;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-200",
          transparent
            ? "bg-transparent"
            : "border-b border-[#ead7af]/70 bg-[#fffaf0]/95 shadow-sm backdrop-blur",
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link to="/" className="shrink-0">
            <img src={ASSETS.logo} alt="ATLAS" className="h-12 w-28 object-contain" />
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {links.map((link) => {
              const active =
                location.pathname === link.href ||
                (link.href !== "/" && location.pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "text-sm font-bold transition",
                    transparent
                      ? "text-white/90 hover:text-white"
                      : active
                        ? "text-[#d18b11]"
                        : "text-[#24160b] hover:text-[#d18b11]",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}

            <Link to="/produits">
              <Button className="px-6">اطلب الآن</Button>
            </Link>
          </nav>

          <button
            type="button"
            className={cn("md:hidden", transparent ? "text-white" : "text-[#24160b]")}
            onClick={() => setOpen((value) => !value)}
            aria-label="القائمة"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-x-0 top-[76px] z-40 border-b border-[#ead7af] bg-[#fffaf0] px-5 py-5 shadow-lg md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setOpen(false)}
                className="text-base font-bold text-[#24160b]"
              >
                {link.label}
              </Link>
            ))}
            <Link to="/produits" onClick={() => setOpen(false)}>
              <Button className="w-full">اطلب الآن</Button>
            </Link>
          </div>
        </div>
      ) : null}
    </>
  );
}
