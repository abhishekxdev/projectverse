import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get user data from cookies
  const token = request.cookies.get("token")?.value;
  const userCookie = request.cookies.get("user")?.value;

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/signup"];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // If no token and trying to access protected route
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If has token and trying to access public route
  if (token && userCookie && isPublicRoute) {
    const userObj = JSON.parse(userCookie);
    const user = {
      ...userObj.data,
      ...userObj.data.profile,
    };
    return redirectBasedOnStatus(user, request);
  }

  // Protected route logic
  if (token && userCookie) {
    const userObj = JSON.parse(userCookie);
    const user = {
      ...userObj.data,
      ...userObj.data.profile,
    };
    console.log(
      "Middleware - User:",
      user.profileCompleted,
      user.status,
      user.role
    );

    if (!user.profileCompleted) {
      const onboardingPath =
        user.role === "school_teacher"
          ? "/onboarding/teacher"
          : "/onboarding/school-admin";

      if (!pathname.startsWith(onboardingPath)) {
        return NextResponse.redirect(new URL(onboardingPath, request.url));
      }
      return NextResponse.next();
    }

    // // Handle school_admin-admin pending users
    // if (user.status === "pending" && user.role === "school_admin") {
    //   const pendingPath = "/school-admin/dashboard/profile";

    //   if (pathname !== pendingPath) {
    //     return NextResponse.redirect(new URL(pendingPath, request.url));
    //   }
    //   return NextResponse.next();
    // }

    // Only restrict rejected teachers
    if (user.role === "school_teacher" && user.status === "rejected") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Handle rejected users
    if (user.role === "school_teacher" && user.status === "rejected") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Handle completed profiles - ensure users are on correct dashboard
    if (
      user.status === "active" &&
      user.profileCompleted &&
      user.status === "pending"
    ) {
      const allowedPaths: Record<string, string[]> = {
        teacher: ["/teacher"],
        school_admin: ["/school-admin"],
        admin: ["/admin"],
        platform_admin: ["/admin"],
      };

      const userPaths = allowedPaths[user.role] || [];
      const isOnAllowedPath = userPaths.some((path) =>
        pathname.startsWith(path)
      );

      if (!isOnAllowedPath) {
        const dashboardPath = getDashboardPath(user.role);
        return NextResponse.redirect(new URL(dashboardPath, request.url));
      }
    }
  }

  return NextResponse.next();
}

function redirectBasedOnStatus(user: any, request: NextRequest) {
  if (!user.profileCompleted) {
    const onboardingPath =
      user.role === "school_teacher"
        ? "/onboarding/teacher"
        : "/onboarding/school-admin";
    return NextResponse.redirect(new URL(onboardingPath, request.url));
  }

  if (user.status === "pending" && user.role === "school_admin") {
    return NextResponse.redirect(
      new URL("/school_admin-admin/pending", request.url)
    );
  }

  if (user.status === "rejected") {
    return NextResponse.next(); // Allow to stay on login
  }

  const dashboardPath = getDashboardPath(user.role);
  return NextResponse.redirect(new URL(dashboardPath, request.url));
}

function getDashboardPath(role: string): string {
  switch (role) {
    case "school_teacher":
      return "/teacher/dashboard";
    case "school_admin":
      return "/school-admin/dashboard/profile";
    case "platform_admin":
      return "/admin/dashboard";
    default:
      return "/login";
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
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
