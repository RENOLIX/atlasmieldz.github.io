import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { ASSETS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginPage() {
  const { role, loading, signIn, sendReset } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && role) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-[#fffaf0] px-4 py-10">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center">
        <div className="w-full rounded-[36px] bg-white p-8 shadow-[0_24px_70px_-54px_rgba(112,69,8,0.45)]">
          <img src={ASSETS.logo} alt="ATLAS" className="mx-auto mb-6 h-16 w-36 object-contain" />
          <h1 className="text-center text-3xl font-extrabold text-[#24160b]">تسجيل دخول الإدارة</h1>
          <p className="mt-2 text-center text-sm text-[#7a644d]">لوحة تحكم أطلس ميل</p>

          <form
            className="mt-8 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitting(true);
              void signIn(email.trim(), password).then((error) => {
                if (error) {
                  toast.error(error);
                }
              }).finally(() => setSubmitting(false));
            }}
          >
            <Input type="email" placeholder="البريد الإلكتروني" value={email} onChange={(event) => setEmail(event.target.value)} />
            <Input type="password" placeholder="كلمة المرور" value={password} onChange={(event) => setPassword(event.target.value)} />
            <Button className="w-full" disabled={submitting}>
              {submitting ? "جارٍ الدخول..." : "دخول"}
            </Button>
          </form>

          <button
            type="button"
            className="mt-4 w-full text-sm font-bold text-[#d18b11]"
            onClick={() => {
              if (!email.trim()) {
                toast.error("اكتب البريد الإلكتروني أولاً.");
                return;
              }
              void sendReset(email.trim()).then((error) => {
                if (error) toast.error(error);
                else toast.success("تم إرسال رابط إعادة التعيين.");
              });
            }}
          >
            نسيت كلمة المرور؟
          </button>

          <p className="mt-4 text-center text-xs text-[#7a644d]">
            <Link to="/" className="underline">العودة إلى الموقع</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
