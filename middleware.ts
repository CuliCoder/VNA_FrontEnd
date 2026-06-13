import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ONLY_ROUTES = ["/login", "/register", "/ForgotPassword"];


export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;
  const isAuthenticated = Boolean(accessToken) || Boolean(refreshToken);

  const isPublicOnly = PUBLIC_ONLY_ROUTES.some((r) => pathname.startsWith(r));
  const isPrivate = !isPublicOnly;

  if (pathname === "/") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard/profile", request.url));
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }
  if (isAuthenticated && isPublicOnly) {
    return NextResponse.redirect(new URL("/dashboard/profile", request.url));
  }

  if (!isAuthenticated && isPrivate) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};