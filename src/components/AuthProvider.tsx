import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { SITE } from "@/lib/constants";
import { createSecondarySupabaseClient, fetchAdminUsers, supabase } from "@/lib/supabase";
import type { AdminRole, AdminUserRecord } from "@/types";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  role: AdminRole | null;
  loading: boolean;
  adminUsers: AdminUserRecord[];
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  sendReset: (email: string) => Promise<string | null>;
  updatePassword: (password: string) => Promise<string | null>;
  refreshAdminUsers: () => Promise<void>;
}

const RECOVERY_KEY = "__atlas_recovery_payload";
const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchRole(userId: string) {
  const { data, error } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data?.role) return null;
  return String(data.role) as AdminRole;
}

async function resolveRoleWithRetry(userId: string, attempts = 12) {
  for (let index = 0; index < attempts; index += 1) {
    const role = await fetchRole(userId);
    if (role) return role;
    await new Promise((resolve) => window.setTimeout(resolve, 300));
  }
  return null;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AdminRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminUsers, setAdminUsers] = useState<AdminUserRecord[]>([]);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const recoveryPayload = window.sessionStorage.getItem(RECOVERY_KEY);
      if (recoveryPayload) {
        const params = new URLSearchParams(recoveryPayload);
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        if (accessToken && refreshToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        }
        window.sessionStorage.removeItem(RECOVERY_KEY);
      }

      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setRole(data.session?.user ? await resolveRoleWithRetry(data.session.user.id) : null);
      setLoading(false);
    };

    void bootstrap();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void (async () => {
        if (!mounted) return;
        setSession(nextSession ?? null);
        setUser(nextSession?.user ?? null);
        setRole(nextSession?.user ? await resolveRoleWithRetry(nextSession.user.id) : null);
        setLoading(false);
      })();
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      return error.message;
    }

    const nextSession = data.session ?? null;
    const nextUser = nextSession?.user ?? data.user ?? null;
    const nextRole = nextUser ? await resolveRoleWithRetry(nextUser.id) : null;

    setSession(nextSession);
    setUser(nextUser);
    setRole(nextRole);
    setLoading(false);

    if (!nextRole) {
      await supabase.auth.signOut();
      return "تم تسجيل الدخول لكن لم يتم العثور على صلاحية الإدارة لهذا الحساب. تأكد أن نفس البريد موجود في auth.users و admin_users داخل نفس مشروع Supabase.";
    }

    return null;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setAdminUsers([]);
  };

  const sendReset = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${SITE.domain}/admin/reset-password`,
    });
    return error?.message ?? null;
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return error?.message ?? null;
  };

  const refreshAdminUsers = async () => {
    if (role !== "admin") {
      setAdminUsers([]);
      return;
    }

    const users = await fetchAdminUsers();
    setAdminUsers(users);
  };

  const value = useMemo<AuthContextValue>(() => ({
    user,
    session,
    role,
    loading,
    adminUsers,
    signIn,
    signOut,
    sendReset,
    updatePassword,
    refreshAdminUsers,
  }), [adminUsers, loading, role, session, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}

export function saveRecoveryPayload(payload: string) {
  window.sessionStorage.setItem(RECOVERY_KEY, payload);
}

export function getSecondaryAuthClient() {
  return createSecondarySupabaseClient();
}
