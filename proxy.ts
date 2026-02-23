import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Only /dashboard and /admin require auth. The home page (/), /developers,
 * /auth/signin, and all (public) routes must remain accessible without login.
 */
const PUBLIC_PATHS = ["/", "/developers", "/auth/signin"];

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Explicit allowlist: never redirect these to sign-in, even if matcher changes.
  if (path === "/" || PUBLIC_PATHS.some((p) => p !== "/" && path.startsWith(p))) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  if (path.startsWith("/dashboard")) {
    if (!token) {
      const signIn = new URL("/auth/signin", request.url);
      signIn.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(signIn);
    }
    return NextResponse.next();
  }

  if (path.startsWith("/admin")) {
    if (!token) {
      const signIn = new URL("/auth/signin", request.url);
      signIn.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(signIn);
    }
    const role = (token as { role?: string }).role;
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
