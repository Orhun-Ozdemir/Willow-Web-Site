/**
 * Browser-side upload helper for the admin panel (POSTs to /api/upload).
 *
 * Vercel rejects function request bodies above ~4.5 MB before /api/upload even runs,
 * answering with a plain-text 413 — so a typical phone photo (5–12 MB) used to fail
 * with a misleading "ağ hatası". Large raster images are now shrunk in the browser
 * first (the server still produces the final WebP variants); anything else over the
 * limit gets a clear size message instead.
 */

// Vercel's 4.5 MB limit covers the whole multipart body; leave room for the form fields.
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

const SHRINKABLE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

function formatMb(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

async function shrinkImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  try {
    for (const [maxSide, quality] of [[3000, 0.9], [2400, 0.82], [1800, 0.75]] as const) {
      const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      let blob = await canvasToBlob(canvas, "image/webp", quality);
      if (blob && blob.type !== "image/webp") {
        // Browser cannot encode WebP. JPEG would flatten PNG transparency (product
        // cutouts), so only fall back to it for non-PNG sources.
        if (file.type === "image/png") return file;
        blob = await canvasToBlob(canvas, "image/jpeg", quality);
      }
      if (blob && blob.size <= MAX_UPLOAD_BYTES) {
        const extension = blob.type === "image/webp" ? ".webp" : ".jpg";
        return new File([blob], file.name.replace(/\.[^.]+$/, "") + extension, { type: blob.type });
      }
    }
  } finally {
    bitmap.close();
  }
  return file;
}

/** Uploads a file to the assets bucket and returns the /api/upload JSON ({ ok, url, path, ... }). */
export async function uploadAdminFile(file: File, folder: string): Promise<any> {
  let toSend = file;
  if (toSend.size > MAX_UPLOAD_BYTES && SHRINKABLE_TYPES.has(toSend.type)) {
    try {
      toSend = await shrinkImage(toSend);
    } catch {
      // Decoding failed; the size check below reports it.
    }
  }
  if (toSend.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      `Dosya çok büyük (${formatMb(file.size)}). En fazla ${formatMb(MAX_UPLOAD_BYTES)} yüklenebilir; dosyayı küçültüp tekrar deneyin.`,
    );
  }

  const formData = new FormData();
  formData.append("file", toSend);
  formData.append("folder", folder);

  let res: Response;
  try {
    res = await fetch("/api/upload", { method: "POST", body: formData });
  } catch {
    throw new Error("Yükleme sırasında ağ hatası oluştu.");
  }

  // Vercel's own 413 / gateway errors are plain text, not JSON.
  const data = await res.json().catch(() => null);
  if (res.status === 413) {
    throw new Error(`Dosya sunucu sınırını aşıyor (${formatMb(toSend.size)}). Daha küçük bir dosya deneyin.`);
  }
  if (res.status === 401) {
    throw new Error("Oturumunuzun süresi dolmuş. Lütfen tekrar giriş yapıp yeniden deneyin.");
  }
  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || `Dosya yüklenemedi (HTTP ${res.status}).`);
  }
  return data;
}
