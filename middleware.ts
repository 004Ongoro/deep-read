import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  const { pathname } = req.nextUrl;

  // Protect internal app routes
  if (!token && (pathname.startsWith("/library") || pathname.startsWith("/read"))) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/signin";
    // Optional: save the callback URL
    url.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(url);
  }

  // Prevent logged in users from seeing auth pages
  if (token && pathname.startsWith("/auth/")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = { 
  matcher: ["/library/:path*", "/read/:path*", "/auth/:path*"] 
};
