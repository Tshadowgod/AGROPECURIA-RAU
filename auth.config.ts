import type { NextAuthConfig } from "next-auth";
import { UserRole } from "@prisma/client";

// Configuración Edge-compatible (sin bcrypt ni Prisma)
// Usada por el middleware proxy.ts
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = (auth?.user as { role?: UserRole })?.role;
      const path = nextUrl.pathname;

      const publicRoutes = ["/", "/login", "/register"];
      if (publicRoutes.includes(path)) return true;

      if (!isLoggedIn) return false;

      if (path.startsWith("/owner") && role !== "OWNER" && role !== "ADMIN") return false;
      if (path.startsWith("/accountant") && role !== "ACCOUNTANT" && role !== "ADMIN") return false;
      if (path.startsWith("/admin") && role !== "ADMIN") return false;

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: UserRole }).role;
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.role = token.role as UserRole;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [], // Los providers van en auth.ts
};
