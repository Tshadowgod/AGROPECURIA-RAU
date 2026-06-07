import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Middleware Edge-compatible: solo usa authConfig (sin bcrypt ni Prisma)
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session?.user;
  const role = (session?.user as { role?: string })?.role;
  const path = nextUrl.pathname;

  const publicRoutes = ["/", "/login", "/register"];
  if (publicRoutes.includes(path)) {
    // Redirigir al dashboard si ya está logueado
    if (isLoggedIn && (path === "/login" || path === "/register")) {
      if (role === "OWNER") return Response.redirect(new URL("/owner", nextUrl));
      if (role === "ACCOUNTANT") return Response.redirect(new URL("/accountant", nextUrl));
      if (role === "ADMIN") return Response.redirect(new URL("/admin", nextUrl));
    }
    return;
  }

  if (!isLoggedIn) {
    return Response.redirect(new URL("/login", nextUrl));
  }

  if (path.startsWith("/owner") && role !== "OWNER" && role !== "ADMIN") {
    return Response.redirect(new URL("/login", nextUrl));
  }
  if (path.startsWith("/accountant") && role !== "ACCOUNTANT" && role !== "ADMIN") {
    return Response.redirect(new URL("/login", nextUrl));
  }
  if (path.startsWith("/admin") && role !== "ADMIN") {
    return Response.redirect(new URL("/login", nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
