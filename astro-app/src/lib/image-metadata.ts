export interface ImageDimensions {
  width: number;
  height: number;
}

const PRODUCT_CUTOUT_DIMENSIONS: Record<string, ImageDimensions> = {
  anemometer: { width: 429, height: 375 },
  "barometric-pressure": { width: 390, height: 358 },
  "battery-level-monitoring": { width: 468, height: 525 },
  "co2-sensor": { width: 344, height: 369 },
  "door-sensor": { width: 263, height: 420 },
  "indoor-tilt": { width: 491, height: 362 },
  "ip67-outdoor-temperature": { width: 491, height: 362 },
  "modbus-bridge": { width: 819, height: 1024 },
  "panic-button": { width: 326, height: 400 },
  "soil-moisture": { width: 373, height: 375 },
  "soil-temperature-moisture-sensor": { width: 819, height: 1024 },
  "temperature-humidity-sensor": { width: 375, height: 350 },
  "tilt-sensor": { width: 275, height: 370 },
  "ultrasonic-level": { width: 266, height: 408 },
  willowane: { width: 819, height: 1024 },
  "willowbee-lorawan-module": { width: 444, height: 375 },
  willowbee: { width: 819, height: 1024 },
  willowgps: { width: 819, height: 1024 },
  willowpre: { width: 819, height: 1024 },
  willowsens: { width: 819, height: 1024 },
  willowsonic: { width: 819, height: 1024 },
  willowtemp: { width: 819, height: 1024 },
  willowtilt: { width: 819, height: 1024 },
};

const CLIENT_LOGO_DIMENSIONS: Record<string, ImageDimensions> = {
  "aero.png": { width: 295, height: 143 },
  "beko.png": { width: 298, height: 174 },
  "cocacola.png": { width: 298, height: 133 },
  "honeywell.png": { width: 298, height: 70 },
  "slb.png": { width: 228, height: 161 },
};

const fileName = (src: string) => src.split("?")[0].split("/").pop() || "";

export function productCutoutDimensions(src: string): ImageDimensions | undefined {
  const base = fileName(src).replace(/\.320\.webp$/i, "").replace(/\.(?:png|webp)$/i, "");
  return PRODUCT_CUTOUT_DIMENSIONS[base];
}

export function clientLogoDimensions(src: string): ImageDimensions | undefined {
  return CLIENT_LOGO_DIMENSIONS[fileName(src).toLowerCase()];
}

export function clientLogoWebpSrc(src: string): string {
  return /\/assets\/client-logos\/[^/?]+\.png(?:\?.*)?$/i.test(src)
    ? src.replace(/\.png(?=\?|$)/i, ".webp")
    : src;
}

export function productCutoutSrcSet(src: string): string | undefined {
  if (!/\/assets\/product-cutouts\/[^/?]+\.(?:png|webp)(?:\?.*)?$/i.test(src)) return undefined;
  const clean = src.split("?")[0].replace(/\.png$/i, ".webp");
  const dimensions = productCutoutDimensions(clean);
  if (!dimensions) return undefined;
  const small = clean.replace(/\.webp$/i, ".320.webp");
  return `${small} ${Math.min(320, dimensions.width)}w, ${clean} ${dimensions.width}w`;
}
