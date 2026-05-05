import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/AuthProvider";
import { CatalogProvider } from "@/components/CatalogProvider";
import { Intro } from "@/components/layout/Intro";
import { ContactPage } from "@/pages/ContactPage";
import { HomePage } from "@/pages/HomePage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ProductPage } from "@/pages/ProductPage";
import { ProductsPage } from "@/pages/ProductsPage";
import { StoryPage } from "@/pages/StoryPage";
import { ThanksPage } from "@/pages/ThanksPage";
import { DashboardLayout } from "@/pages/admin/DashboardLayout";
import { LoginPage } from "@/pages/admin/LoginPage";
import { AdminOrdersPage } from "@/pages/admin/OrdersPage";
import { AdminOrderTrashPage } from "@/pages/admin/OrderTrashPage";
import { AdminPixelPage } from "@/pages/admin/PixelPage";
import { AdminProductEditorPage } from "@/pages/admin/ProductEditorPage";
import { AdminProductsPage } from "@/pages/admin/ProductsPage";
import { ResetPasswordPage } from "@/pages/admin/ResetPasswordPage";
import { AdminUsersPage } from "@/pages/admin/UsersPage";
import { AuthCallbackPage } from "@/pages/auth/AuthCallbackPage";

function LegacyProductRedirect() {
  const { id } = useParams();
  return <Navigate to={id ? `/produits/${id}` : "/produits"} replace />;
}

export default function App() {
  const [introDone, setIntroDone] = useState(false);
  const basename = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

  return (
    <AuthProvider>
      <CatalogProvider>
        {!introDone ? <Intro onDone={() => setIntroDone(true)} /> : null}

        <BrowserRouter basename={basename || undefined}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/produits" element={<ProductsPage />} />
            <Route path="/produits/:id" element={<ProductPage />} />
            <Route path="/histoire" element={<StoryPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/merci" element={<ThanksPage />} />

            <Route path="/shop" element={<Navigate to="/produits" replace />} />
            <Route path="/shop/product/:id" element={<LegacyProductRedirect />} />
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
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="orders/trash" element={<AdminOrderTrashPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="pixel" element={<AdminPixelPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>

        <Toaster position="top-center" richColors />
      </CatalogProvider>
    </AuthProvider>
  );
}
