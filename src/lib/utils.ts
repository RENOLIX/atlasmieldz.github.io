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
    if (!file.type.startsWith("image/")) {
      reject(new Error("يرجى اختيار صورة صالحة."));
      return;
    }

    if (file.type === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(new Error("تعذر قراءة الصورة."));
      reader.readAsDataURL(file);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      const maxSide = 1600;
      const longestSide = Math.max(image.width, image.height);
      const scale = longestSide > maxSide ? maxSide / longestSide : 1;
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("تعذر تجهيز الصورة."));
        return;
      }

      context.drawImage(image, 0, 0, width, height);

      try {
        const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
        const quality = outputType === "image/png" ? undefined : 0.82;
        const result = canvas.toDataURL(outputType, quality);
        URL.revokeObjectURL(objectUrl);
        resolve(result);
      } catch {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("تعذر ضغط الصورة قبل رفعها."));
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("تعذر تحميل الصورة المختارة."));
    };

    image.src = objectUrl;
  });
}

export function decodeSafeId(value: string | undefined) {
  if (!value) return "";
  return decodeURIComponent(value).replace(/\/+$/g, "").split(/[?#&]/)[0].trim();
}
