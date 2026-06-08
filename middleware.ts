import { NextResponse, NextRequest } from "next/server";

interface SessionData {
  userId: string;
  email: string;
  role: string;
  nome: string;
}

// Public routes that don't require authentication
const publicRoutes = ["/", "/login"];
const publicApiPrefixes = ["/api/auth/", "/api/usuarios/me", "/api/health", "/api/seed"];

function isPublicRoute(pathname: string): boolean {
  if (publicRoutes.includes(pathname)) return true;
  return publicApiPrefixes.some((prefix) => pathname.startsWith(prefix));
}

function isDashboardRoute(pathname: string): boolean {
  return pathname.startsWith("/dashboard");
}

function getDashboardForRole(role: string): string {
  switch (role) {
    case "professor":
      return "/dashboard/professor";
    case "coordenador":
      return "/dashboard/coordenador";
    case "aluno":
      return "/dashboard/aluno";
    default:
      return "/login";
  }
}

function getSessionFromCookie(request: NextRequest): SessionData | null {
  const sessionCookie = request.cookies.get("orkestrando_session");
  if (!sessionCookie?.value) return null;

  try {
    const session = JSON.parse(sessionCookie.value) as SessionData;
    if (!session.userId || !session.role) return null;
    return session;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = getSessionFromCookie(request);

  // Allow public routes without authentication
  if (isPublicRoute(pathname)) {
    // If user is authenticated and visits / or /login, redirect to their dashboard
    if (session && (pathname === "/" || pathname === "/login")) {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = getDashboardForRole(session.role);
      return NextResponse.redirect(dashboardUrl);
    }
    return NextResponse.next();
  }

  // Protect dashboard routes
  if (isDashboardRoute(pathname)) {
    if (!session) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }

    // Role-based access: redirect to correct dashboard if accessing wrong one
    const expectedDashboard = getDashboardForRole(session.role);
    if (pathname !== expectedDashboard && !pathname.startsWith(expectedDashboard + "/")) {
      const correctUrl = request.nextUrl.clone();
      correctUrl.pathname = expectedDashboard;
      return NextResponse.redirect(correctUrl);
    }

    return NextResponse.next();
  }

  // For all other routes, check if authenticated
  if (!session) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (icons, etc.)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|icons/|logo\\.svg|robots\\.txt|manifest\\.json).*)",
  ],
};
