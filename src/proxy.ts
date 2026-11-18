import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { buildContentSecurityPolicy, readCspMode } from "@/lib/security/csp";

function responseWithCsp(request: Request, response: NextResponse) {
  const mode = readCspMode();
  if (mode === "off") return response;
  const nonce = btoa(crypto.randomUUID());
  const policy = buildContentSecurityPolicy(nonce, {
    development: process.env.NODE_ENV === "development",
  });
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", policy);
  if (response.headers.get("location") === null) {
    response = NextResponse.next({ request: { headers: requestHeaders } });
  }
  response.headers.set(
    mode === "enforce" ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only",
    policy,
  );
  return response;
}

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const user = request.auth?.user;
  const isAdminRoute = pathname.startsWith("/admin");
  const isAccountRoute = pathname.startsWith("/account");

  if (
    user?.forcePasswordChange &&
    (isAdminRoute || isAccountRoute) &&
    pathname !== "/account/security"
  ) {
    return responseWithCsp(
      request,
      NextResponse.redirect(new URL("/account/security", request.nextUrl)),
    );
  }

  if ((isAdminRoute || isAccountRoute) && !user) {
    const loginUrl = new URL("/login", request.nextUrl);
    loginUrl.searchParams.set("redirectTo", pathname);
    return responseWithCsp(request, NextResponse.redirect(loginUrl));
  }

  if (isAdminRoute && user?.role !== "ADMIN" && user?.role !== "STAFF") {
    return responseWithCsp(
      request,
      NextResponse.redirect(new URL("/unauthorized", request.nextUrl)),
    );
  }

  if ((pathname === "/login" || pathname === "/register") && user) {
    return responseWithCsp(request, NextResponse.redirect(new URL("/account", request.nextUrl)));
  }

  return responseWithCsp(request, NextResponse.next());
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
