import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;
  
  console.log(`Middleware: ${pathname} - Token: ${token ? "Yes" : "No"}`);

  // Protect library and read routes
  if (!token && (pathname.startsWith("/library") || pathname.startsWith("/read"))) {
    console.log("Middleware: Redirecting to signin");
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect logged-in users away from auth pages
  if (token && pathname.startsWith("/auth")) {
    console.log("Middleware: Redirecting logged-in user to home");
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export default middleware;

export const config = { 
  matcher: ["/library/:path*", "/read/:path*", "/auth/:path*"] 
};
