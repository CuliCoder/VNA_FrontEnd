import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ONLY_ROUTES = ["/login", "/register", "/forgot-password"];

const PRIVATE_ROUTES = ["/dashboard/profile", "/settings"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("access_token")?.value;
  const isAuthenticated = Boolean(accessToken);

  const isPublicOnly = PUBLIC_ONLY_ROUTES.some((r) => pathname.startsWith(r));
  const isPrivate = PRIVATE_ROUTES.some((r) => pathname.startsWith(r));
  // const isPrivate =
  //   pathname === "/" || PRIVATE_ROUTES.some((r) => pathname.startsWith(r));
  // if (pathname === "/") {
  //   if (isAuthenticated) {
  //     return NextResponse.redirect(new URL("/dashboard/profile", request.url));
  //   } else {
  //     return NextResponse.redirect(new URL("/login", request.url));
  //   }
  // }
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
