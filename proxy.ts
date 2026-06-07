import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const publicPaths = ["/", "/login", "/register"];
  const isPublic = publicPaths.includes(path);

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isLoggedIn = !!token;
  const role = token?.role as string | undefined;

  if (isPublic) {
    if (isLoggedIn && (path === "/login" || path === "/register")) {
      const dest = role === "OWNER" ? "/owner" : role === "ACCOUNTANT" ? "/accountant" : "/admin";
      return NextResponse.redirect(new URL(dest, req.url));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (path.startsWith("/owner") && role !== "OWNER" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (path.startsWith("/accountant") && role !== "ACCOUNTANT" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (path.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
