import { useEffect } from "react";
import { Link, NavLink, Navigate, Outlet } from "react-router-dom";
import { Boxes, ChartNoAxesCombined, LogOut, ShoppingBag, Trash2, Users } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { ASSETS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "المنتجات", icon: Boxes, end: true },
  { href: "/admin/orders", label: "الطلبات", icon: ShoppingBag },
  { href: "/admin/orders/trash", label: "سلة المحذوفات", icon: Trash2 },
  { href: "/admin/users", label: "المستخدمون", icon: Users },
  { href: "/admin/pixel", label: "Meta Pixel", icon: ChartNoAxesCombined },
];

export function DashboardLayout() {
  const { role, loading, signOut, refreshAdminUsers } = useAuth();

  useEffect(() => {
    if (role === "admin") {
      void refreshAdminUsers();
    }
  }, [refreshAdminUsers, role]);

  if (!loading && !role) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#fffaf0] text-[#24160b]">
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[290px_minmax(0,1fr)]">
        <aside className="border-b border-[#ead7af] bg-white px-6 py-8 lg:border-b-0 lg:border-l">
          <Link to="/" className="block">
            <img src={ASSETS.logo} alt="ATLAS" className="h-16 w-36 object-contain" />
          </Link>
          <div className="mt-8 flex flex-col gap-2">
            {links.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                end={link.end}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition",
                  isActive ? "bg-[#fff2d4] text-[#d18b11]" : "text-[#24160b] hover:bg-[#fff9eb]",
                )}
              >
                <link.icon size={18} />
                {link.label}
              </NavLink>
            ))}
          </div>
          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-10 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-[#9a3412]"
          >
            <LogOut size={18} />
            تسجيل الخروج
          </button>
        </aside>

        <div className="min-w-0 p-4 md:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
