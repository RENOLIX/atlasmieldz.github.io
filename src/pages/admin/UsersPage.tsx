import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { createAdminUser, deleteAdminUser, updateAdminUserRole } from "@/lib/supabase";
import type { AdminRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminUsersPage() {
  const { role, user, adminUsers, refreshAdminUsers } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nextRole, setNextRole] = useState<AdminRole>("employee");

  useEffect(() => {
    if (role === "admin") {
      void refreshAdminUsers();
    }
  }, [refreshAdminUsers, role]);

  if (role !== "admin") {
    return (
      <section className="rounded-[30px] bg-white p-6 shadow-[0_24px_70px_-54px_rgba(112,69,8,0.45)]">
        <h1 className="text-2xl font-extrabold">غير مصرح</h1>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[30px] bg-white p-6 shadow-[0_24px_70px_-54px_rgba(112,69,8,0.45)]">
        <p className="text-sm font-extrabold text-[#d18b11]">المستخدمون</p>
        <h1 className="mt-2 text-3xl font-extrabold">إدارة حسابات الإدارة</h1>
      </div>

      <div className="rounded-[30px] bg-white p-6 shadow-[0_24px_70px_-54px_rgba(112,69,8,0.45)]">
        <h2 className="text-xl font-extrabold">إضافة مستخدم جديد</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="البريد الإلكتروني" />
          <Input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="كلمة المرور" type="password" />
          <select value={nextRole} onChange={(event) => setNextRole(event.target.value as AdminRole)} className="h-12 rounded-2xl border border-[#e7d2a6] px-4 text-sm font-bold">
            <option value="employee">موظف</option>
            <option value="admin">مدير</option>
          </select>
          <Button
            onClick={() => {
              if (!email.trim() || !password.trim()) {
                toast.error("املأ البريد وكلمة المرور.");
                return;
              }
              void createAdminUser(email, password, nextRole).then(() => {
                toast.success("تم إنشاء المستخدم.");
                setEmail("");
                setPassword("");
                return refreshAdminUsers();
              }).catch((error: Error) => toast.error(error.message));
            }}
          >
            إضافة
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {adminUsers.map((entry) => (
          <article key={entry.userId} className="rounded-[30px] bg-white p-6 shadow-[0_24px_70px_-54px_rgba(112,69,8,0.45)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-extrabold">{entry.email}</p>
                <p className="text-sm text-[#7a644d]">{entry.role === "admin" ? "مدير" : "موظف"}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <select
                  value={entry.role}
                  onChange={(event) => {
                    void updateAdminUserRole(entry.userId, event.target.value as AdminRole).then(() => {
                      toast.success("تم تحديث الصلاحية.");
                      return refreshAdminUsers();
                    }).catch((error: Error) => toast.error(error.message));
                  }}
                  className="h-12 rounded-2xl border border-[#e7d2a6] px-4 text-sm font-bold"
                >
                  <option value="employee">موظف</option>
                  <option value="admin">مدير</option>
                </select>
                <Button
                  variant="danger"
                  disabled={entry.userId === user?.id}
                  onClick={() => {
                    void deleteAdminUser(entry.userId).then(() => {
                      toast.success("تم حذف المستخدم.");
                      return refreshAdminUsers();
                    }).catch((error: Error) => toast.error(error.message));
                  }}
                >
                  حذف
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
