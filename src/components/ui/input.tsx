import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-2xl border border-[#e7d2a6] bg-white px-4 text-sm text-[#24160b] outline-none transition focus:border-[#f0a429] focus:ring-4 focus:ring-[#f0a429]/15",
        className,
      )}
      {...props}
    />
  );
}
