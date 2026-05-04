import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { EmailOtpType } from "@supabase/supabase-js";
import { saveRecoveryPayload } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

export function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash;
      const search = window.location.search.startsWith("?") ? window.location.search.slice(1) : window.location.search;
      const params = new URLSearchParams(hash || search);
      const code = params.get("code");
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const tokenHash = params.get("token_hash");
      const type = params.get("type");

      try {
        if (type === "recovery" && accessToken && refreshToken) {
          saveRecoveryPayload(params.toString());
          if (!cancelled) navigate("/admin/reset-password", { replace: true });
          return;
        }

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
        } else if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else if (tokenHash && type) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as EmailOtpType,
          });
          if (error) throw error;
        }

        if (!cancelled) navigate("/admin", { replace: true });
      } catch {
        if (!cancelled) navigate("/admin/login", { replace: true });
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return <div className="flex min-h-screen items-center justify-center bg-[#fffaf0] text-lg font-bold">جارٍ التحقق...</div>;
}
