import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { ASSETS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { session, loading, updatePassword, signOut } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && !session) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#fffaf0] px-4 py-10">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center">
        <div className="w-full rounded-[36px] bg-white p-8 shadow-[0_24px_70px_-54px_rgba(112,69,8,0.45)]">
          <img src={ASSETS.logo} alt="ATLAS" className="mx-auto mb-6 h-16 w-36 object-contain" />
          <h1 className="text-center text-3xl font-extrabold text-[#24160b]">تعيين كلمة مرور جديدة</h1>
          <form
            className="mt-8 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (password.length < 6) {
                toast.error("كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل.");
                return;
              }
              if (password !== confirmPassword) {
                toast.error("كلمتا المرور غير متطابقتين.");
                return;
              }

              setSubmitting(true);
              void updatePassword(password).then(async (error) => {
                if (error) {
                  toast.error(error);
                  return;
                }
                await signOut();
                toast.success("تم تحديث كلمة المرور.");
                navigate("/admin/login", { replace: true });
              }).finally(() => setSubmitting(false));
            }}
          >
            <Input type="password" placeholder="كلمة المرور الجديدة" value={password} onChange={(event) => setPassword(event.target.value)} />
            <Input type="password" placeholder="تأكيد كلمة المرور" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
            <Button className="w-full" disabled={submitting}>
              {submitting ? "جارٍ الحفظ..." : "حفظ كلمة المرور"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
