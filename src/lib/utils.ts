export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function formatDzd(value: number) {
  return `${new Intl.NumberFormat("ar-DZ").format(value)} د.ج`;
}

export function clampText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

export function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("تعذر قراءة الصورة."));
    reader.readAsDataURL(file);
  });
}

export function decodeSafeId(value: string | undefined) {
  if (!value) return "";
  return decodeURIComponent(value).split(/[?&]/)[0];
}
