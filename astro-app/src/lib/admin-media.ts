/** Resolve product/solution/news image paths for admin previews. */
export function resolveAdminImageSrc(image: unknown): string {
  if (!image) return "";
  if (typeof image === "string") {
    if (/^(https?:)?\/\//i.test(image) || image.startsWith("data:")) return image;
    const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");
    return `${base}/${image.replace(/^\/+/, "")}`;
  }
  if (typeof image === "object" && image !== null) {
    const obj = image as Record<string, string>;
    return obj.webp || obj.png || obj.src || "";
  }
  return "";
}

export function imageInputValue(image: unknown): string {
  if (!image) return "";
  if (typeof image === "string") return image;
  if (typeof image === "object" && image !== null) {
    const obj = image as Record<string, string>;
    return obj.png || obj.webp || obj.src || "";
  }
  return "";
}
