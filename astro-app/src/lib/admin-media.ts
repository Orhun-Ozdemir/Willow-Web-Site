/** Resolve product/solution/news image paths for admin previews. */
import { resolveAsset } from "./cms";

export function resolveAdminImageSrc(image: unknown): string {
  if (!image) return "";
  if (typeof image === "string") {
    if (/^(https?:)?\/\//i.test(image) || image.startsWith("data:")) return image;
    return resolveAsset(image);
  }
  if (typeof image === "object" && image !== null) {
    const obj = image as Record<string, string>;
    return resolveAsset(obj.webp || obj.png || obj.src || "");
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
