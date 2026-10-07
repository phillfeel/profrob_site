import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const handleI18n = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  if (request.headers.get("x-profrobot-default-locale") === "1") {
    return NextResponse.next();
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
