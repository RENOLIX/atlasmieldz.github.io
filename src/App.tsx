import { Suspense, lazy, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/AuthProvider";
import { CatalogProvider } from "@/components/CatalogProvider";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Intro } from "@/components/layout/Intro";
import { HomePage } from "@/pages/HomePage";
import { decodeSafeId } from "@/lib/utils";

const ProductsPage = lazy(() => import("@/pages/ProductsPage").then((module) => ({ default: module.ProductsPage })));
const ProductPage = lazy(() => import("@/pages/ProductPage").then((module) => ({ default: module.ProductPage })));
const PacksPage = lazy(() => import("@/pages/PacksPage").then((module) => ({ default: module.PacksPage })));
const StoryPage = lazy(() => import("@/pages/StoryPage").then((module) => ({ default: module.StoryPage })));
const ContactPage = lazy(() => import("@/pages/ContactPage").then((module) => ({ default: module.ContactPage })));
const ThanksPage = lazy(() => import("@/pages/ThanksPage").then((module) => ({ default: module.ThanksPage })));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage").then((module) => ({ default: module.NotFoundPage })));
const DashboardLayout = lazy(() =>
  import("@/pages/admin/DashboardLayout").then((module) => ({ default: module.DashboardLayout })),
);
const LoginPage = lazy(() => import("@/pages/admin/LoginPage").then((module) => ({ default: module.LoginPage })));
const ResetPasswordPage = lazy(() =>
  import("@/pages/admin/ResetPasswordPage").then((module) => ({ default: module.ResetPasswordPage })),
);
const AdminProductsPage = lazy(() =>
  import("@/pages/admin/ProductsPage").then((module) => ({ default: module.AdminProductsPage })),
);
const AdminProductEditorPage = lazy(() =>
  import("@/pages/admin/ProductEditorPage").then((module) => ({ default: module.AdminProductEditorPage })),
);
const AdminOrdersPage = lazy(() =>
  import("@/pages/admin/OrdersPage").then((module) => ({ default: module.AdminOrdersPage })),
);
const AdminOrderTrashPage = lazy(() =>
  import("@/pages/admin/OrderTrashPage").then((module) => ({ default: module.AdminOrderTrashPage })),
);
const AdminUsersPage = lazy(() =>
  import("@/pages/admin/UsersPage").then((module) => ({ default: module.AdminUsersPage })),
);
const AdminPixelPage = lazy(() =>
  import("@/pages/admin/PixelPage").then((module) => ({ default: module.AdminPixelPage })),
);
const AuthCallbackPage = lazy(() =>
  import("@/pages/auth/AuthCallbackPage").then((module) => ({ default: module.AuthCallbackPage })),
);

function LegacyProductRedirect() {
  const { id } = useParams();
  const safeId = decodeSafeId(id);
  return <Navigate to={safeId ? `/produits/${safeId}` : "/produits"} replace />;
}

function AppShell({ introDone, setIntroDone }: { introDone: boolean; setIntroDone: (value: boolean) => void }) {
  const location = useLocation();
  const showIntro = location.pathname === "/" && !introDone;

  return (
    <>
      {showIntro ? <Intro onDone={() => setIntroDone(true)} /> : null}

      <ScrollToTop />
      <Suspense fallback={<div className="min-h-screen bg-[#fffaf0]" />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/produits" element={<ProductsPage />} />
          <Route path="/produits/:id" element={<ProductPage />} />
          <Route path="/produits/:id/*" element={<ProductPage />} />
          <Route path="/packs" element={<PacksPage />} />
          <Route path="/packs/:id" element={<ProductPage />} />
          <Route path="/packs/:id/*" element={<ProductPage />} />
          <Route path="/histoire" element={<StoryPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/merci" element={<ThanksPage />} />

          <Route path="/shop" element={<Navigate to="/produits" replace />} />
          <Route path="/shop/product/:id" element={<LegacyProductRedirect />} />
          <Route path="/shop/product/:id/*" element={<LegacyProductRedirect />} />
          <Route path="/about" element={<Navigate to="/histoire" replace />} />
          <Route path="/cart" element={<Navigate to="/produits" replace />} />
          <Route path="/checkout" element={<Navigate to="/produits" replace />} />
          <Route path="/checkout/success" element={<Navigate to="/merci" replace />} />

          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin/reset-password" element={<ResetPasswordPage />} />

          <Route path="/admin" element={<DashboardLayout />}>
            <Route index element={<AdminProductsPage />} />
            <Route path="products/new" element={<AdminProductEditorPage />} />
            <Route path="products/:id" element={<AdminProductEditorPage />} />
            <Route path="packs" element={<AdminProductsPage />} />
            <Route path="packs/new" element={<AdminProductEditorPage />} />
            <Route path="packs/:id" element={<AdminProductEditorPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="orders/trash" element={<AdminOrderTrashPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="pixel" element={<AdminPixelPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default function App() {
  const [introDone, setIntroDone] = useState(false);
  const basename = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

  return (
    <AuthProvider>
      <CatalogProvider>
        <BrowserRouter basename={basename || undefined}>
          <AppShell introDone={introDone} setIntroDone={setIntroDone} />
        </BrowserRouter>

        <Toaster position="top-center" richColors />
      </CatalogProvider>
    </AuthProvider>
  );
}
