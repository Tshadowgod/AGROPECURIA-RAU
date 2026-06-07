import type { NextAuthConfig } from "next-auth";

// Edge-compatible: sin imports de @prisma/client, bcryptjs ni Prisma
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "OWNER";
        token.id = user.id ?? "";
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).role = token.role;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  providers: [],
};
