import NextAuth from "next-auth";
import authConfig from "@/auth.config";

// Initialize NextAuth with ONLY the edge-compatible config
const { auth } = NextAuth(authConfig);

const publicRoutes = ["/sign-in", "/sign-up"];
const protectedRoutes = [
  "/",
  "/words",
  "/review",
  "/quiz",
  "/profile",
  "/onboarding",
];

export default auth((req) => {
  // Your custom logic is preserved here
  if (publicRoutes.includes(req.nextUrl.pathname) && req.auth) {
    return Response.redirect(new URL("/", req.url));
  }
  if (protectedRoutes.includes(req.nextUrl.pathname) && !req.auth) {
    return Response.redirect(new URL("/sign-in", req.url));
  }
});
// Optionally, don't invoke Middleware on some paths
// Read more: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets (for images, fonts, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|assets).*)",
  ],
};
