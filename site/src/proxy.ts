import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import pages from "./content/legacy-pages.json";

const handleI18n = createMiddleware(routing);
const knownRoutes = new Set(["", ...Object.keys(pages)]);
const NOT_FOUND_ROUTE = "not-found-page";

/** Route key as in legacy-pages.json ("" is home): locale prefix and slashes at both ends removed. */
function routeKey(pathname: string): string {
  return pathname.replace(/^\/(ru|en)(?=\/|$)/, "").replace(/^\/+|\/+$/g, "");
}

export default function proxy(request: NextRequest) {
  if (request.headers.get("x-profrobot-default-locale") === "1") {
    return NextResponse.next();
  }
  // Unknown address: Next cannot server-render a 404 page for a root layout in a dynamic [locale] segment
  // (notFound() ends in a client-rendered shell without <html lang>/<title>), so the proxy serves the
  // prerendered 404 page of the right language with status 404.
  if (!knownRoutes.has(routeKey(request.nextUrl.pathname))) {
    const locale = /^\/en(\/|$)/.test(request.nextUrl.pathname) ? "en" : "ru";
    const headers = new Headers(request.headers);
    headers.set("x-profrobot-default-locale", "1");
    return NextResponse.rewrite(new URL(`/${locale}/${NOT_FOUND_ROUTE}/`, request.url), {
      status: 404,
      request: { headers },
    });
  }
  if (request.nextUrl.pathname === "/") {
    const headers = new Headers(request.headers);
    headers.set("x-profrobot-default-locale", "1");
    return NextResponse.rewrite(new URL("/ru", request.url), {
      request: { headers },
    });
  }
  return handleI18n(request);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
