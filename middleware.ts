import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/auth");

    // Redirect logged-in users away from auth pages (login/signup)
    if (isAuthPage && token) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAuthPage = req.nextUrl.pathname.startsWith("/auth");
        // Always allow access to auth pages so users can log in
        if (isAuthPage) return true;
        // Require a token for all other matched routes (/library, /read)
        return !!token;
      },
    },
    pages: {
      signIn: "/auth/signin",
    },
  }
);

export const config = { 
  matcher: ["/library/:path*", "/read/:path*", "/auth/:path*"] 
};
