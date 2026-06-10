import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["en", "tr", "de", "fr", "es", "it", "ar", "ja"];
const defaultLocale = "en";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Exclude static assets, API, and admin routes
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/admin") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check if pathname already starts with a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return NextResponse.next();

  // Redirect to default locale prefix
  const locale = defaultLocale;
  request.nextUrl.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    // Match all request paths except next static files, favicon, etc.
    "/((?!_next|api|admin|favicon.ico|assets|pdf-assets).*)",
  ],
};
