import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/leads", "/contacts", "/activities", "/campaigns", "/analytics", "/reports", "/automation", "/settings"];

// Routes that require admin role
const adminRoutes = ["/admin"];

// Routes that should redirect authenticated users
const authRoutes = ["/login", "/register", "/forgot-password"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware entirely for static files and Supabase auth callbacks
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // API routes handle their own auth via supabase.auth.getUser() which
  // supports both cookies and Bearer tokens. However, mutation requests
  // (POST/PUT/DELETE/PATCH) still need CSRF Origin validation to prevent
  // cross-site request forgery — except for GET (read-only) and webhook
  // routes (which verify signatures instead).
  if (pathname.startsWith("/api/")) {
    // GET requests are safe — skip CSRF
    if (request.method === "GET" || request.method === "HEAD" || request.method === "OPTIONS") {
      return NextResponse.next();
    }

    // Webhook routes use signature verification — skip CSRF
    const webhookRoutes = [
      "/api/webhooks/stripe",
      "/api/webhooks/email-inbound",
      "/api/webhooks/n8n",
    ];
    if (webhookRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    // Validate Origin header for all other mutation requests
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");

    if (origin && host) {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        return NextResponse.json(
          { success: false, error: { code: "CSRF_FAILED", message: "CSRF validation failed" } },
          { status: 403 }
        );
      }
    } else if (!origin && host) {
      const referer = request.headers.get("referer");
      if (referer) {
        const refererHost = new URL(referer).host;
        if (refererHost !== host) {
          return NextResponse.json(
            { success: false, error: { code: "CSRF_FAILED", message: "CSRF validation failed" } },
            { status: 403 }
          );
        }
      }
      // If neither Origin nor Referer, allow (non-browser clients like curl/Postman)
    }

    // API routes skip session auth — they call supabase.auth.getUser() internally
    return NextResponse.next();
  }

  // CSRF Protection for non-API mutation requests (form submissions, etc.)
  if (["POST", "PUT", "DELETE", "PATCH"].includes(request.method)) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");

    if (origin && host) {
      // Validate Origin matches Host
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        return NextResponse.json(
          { error: "CSRF validation failed" },
          { status: 403 }
        );
      }
    } else if (!origin && host) {
      // Origin missing — fall back to Referer header
      const referer = request.headers.get("referer");
      if (referer) {
        const refererHost = new URL(referer).host;
        if (refererHost !== host) {
          return NextResponse.json(
            { error: "CSRF validation failed" },
            { status: 403 }
          );
        }
      }
      // If neither Origin nor Referer, allow (non-browser clients like curl)
    }
  }

  // Update Supabase session
  const { response, user, supabase } = await updateSession(request);

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users to login
  if ((isProtectedRoute || isAdminRoute) && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check admin access
  if (isAdminRoute && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!["super_admin", "org_admin", "admin"].includes(profile?.role ?? "")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Add security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  // CSP: unsafe-inline is required for Next.js inline scripts and Tailwind styles.
  // unsafe-eval is required in dev mode for React Fast Refresh but excluded in production.
  // frame-ancestors 'none' replaces X-Frame-Options for modern browsers.
  const isDev = process.env.NODE_ENV === "development";
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://js.stripe.com`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://*.ingest.sentry.io",
      "frame-src https://js.stripe.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      ...(isDev ? [] : ["upgrade-insecure-requests"]),
    ].join("; ")
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
