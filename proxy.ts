import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicRoutes = ["/login", "/register", "/"];

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isPublic = publicRoutes.includes(nextUrl.pathname);

  if (!session && !isPublic) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (session && (nextUrl.pathname === "/login" || nextUrl.pathname === "/register")) {
    const role = session.user.role;
    if (role === "OWNER") return NextResponse.redirect(new URL("/owner", nextUrl));
    if (role === "ACCOUNTANT") return NextResponse.redirect(new URL("/accountant", nextUrl));
    if (role === "ADMIN") return NextResponse.redirect(new URL("/admin", nextUrl));
  }

  // Role-based protection
  if (session) {
    const role = session.user.role;
    if (nextUrl.pathname.startsWith("/owner") && role !== "OWNER" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (nextUrl.pathname.startsWith("/accountant") && role !== "ACCOUNTANT" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (nextUrl.pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
