import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ className, variant = "primary", ...props }: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "bg-[#f0a429] text-[#24160b] hover:bg-[#ffbd4a]",
        variant === "secondary" && "bg-white text-[#24160b] border border-[#e7d2a6] hover:bg-[#fff9eb]",
        variant === "ghost" && "bg-transparent text-white/90 hover:text-white",
        variant === "danger" && "bg-[#fee2e2] text-[#b42318] hover:bg-[#fecaca]",
        className,
      )}
      {...props}
    />
  );
}
