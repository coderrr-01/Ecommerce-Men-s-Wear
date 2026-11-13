import { NextResponse } from "next/server";

import { auth } from "@/auth";

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const user = request.auth?.user;
  const isAdminRoute = pathname.startsWith("/admin");
  const isAccountRoute = pathname.startsWith("/account");

  if ((isAdminRoute || isAccountRoute) && !user) {
    const loginUrl = new URL("/login", request.nextUrl);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && user?.role !== "ADMIN" && user?.role !== "STAFF") {
    return NextResponse.redirect(new URL("/unauthorized", request.nextUrl));
  }

  if ((pathname === "/login" || pathname === "/register") && user) {
    return NextResponse.redirect(new URL("/account", request.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/account/:path*", "/admin/:path*", "/login", "/register"],
};
