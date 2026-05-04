import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-2xl border border-[#e7d2a6] bg-white px-4 py-3 text-sm text-[#24160b] outline-none transition focus:border-[#f0a429] focus:ring-4 focus:ring-[#f0a429]/15",
        className,
      )}
      {...props}
    />
  );
}
