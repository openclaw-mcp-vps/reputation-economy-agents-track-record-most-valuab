import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ACCESS_COOKIE_NAME, hasAccessCookie } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const cookieValue = request.cookies.get(ACCESS_COOKIE_NAME)?.value;

  if (hasAccessCookie(cookieValue)) {
    return NextResponse.next();
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/unlock";
  redirectUrl.searchParams.set("next", request.nextUrl.pathname);

  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/agents/:path*"]
};
