import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Middleware usa el mismo NextAuth/authConfig que el handler → mismo cifrado JWT
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const isLoggedIn = !!session?.user;
  const role = (session?.user as { role?: string } | undefined)?.role;
  const path = nextUrl.pathname;

  const publicPaths = ["/", "/login", "/register"];

  if (publicPaths.includes(path)) {
    if (isLoggedIn && (path === "/login" || path === "/register")) {
      const dest = role === "OWNER" ? "/owner" : role === "ACCOUNTANT" ? "/accountant" : "/admin";
      return Response.redirect(new URL(dest, nextUrl));
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
