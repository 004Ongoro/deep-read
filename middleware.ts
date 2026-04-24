import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;
  
  // LOGGING: Only in development or for critical debugging
  // console.log(`Middleware: ${pathname} - Token: ${token ? "Yes" : "No"}`);

  // Only protect internal routes. 
  // Do NOT redirect logged-in users away from auth pages to prevent loops.
  if (!token && (pathname.startsWith("/library") || pathname.startsWith("/read"))) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export default middleware;

export const config = { 
  matcher: ["/library/:path*", "/read/:path*"] 
};
