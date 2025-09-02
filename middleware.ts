import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define protected routes that require authentication
  const protectedRoutes = ["/dashboard"];

  // Define auth routes that should redirect to dashboard if already authenticated
  const authRoutes = ["/signin", "/signup"];

  // Check if current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if current path is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Check authentication by calling backend profile endpoint
  const isAuthenticated = await checkAuthentication(request);

  // If accessing protected route without authentication, redirect to signin
  if (isProtectedRoute && !isAuthenticated) {
    const signinUrl = new URL("/signin", request.url);
    signinUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signinUrl);
  }

  // If accessing auth routes while authenticated, redirect to dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // For root path, redirect based on authentication status
  if (pathname === "/") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
  }

  return NextResponse.next();
}

async function checkAuthentication(request: NextRequest): Promise<boolean> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    // Get cookies from the request
    const cookieHeader = request.headers.get("cookie") || "";
    console.log("cookie", cookieHeader);
    // Check if authToken exists in cookies
    const hasAuthToken = cookieHeader.includes("authToken=");
    // if (!hasAuthToken) {
    //   return false;
    // }

    const response = await fetch(`${apiUrl}/auth/profile`, {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();
    console.log(data);

    // If token is expired or invalid, the backend will clear the cookie
    if (response.status === 401) {
      return false;
    }

    return response.ok && response.status === 200;
  } catch (error) {
    console.error("Auth check failed:", error);
    return false;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
