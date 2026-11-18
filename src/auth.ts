import "server-only";

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { Role } from "@prisma/client";

import { loginSchema } from "@/features/auth/schemas/auth.schema";
import { verifyCredentials } from "@/features/auth/services/auth.service";
import { env } from "@/env";
import { prisma } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: env.AUTH_SECRET,
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30,
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token"
          : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const parsed = loginSchema.safeParse({
          email: credentials?.email,
          password: credentials?.password,
        });

        if (!parsed.success) return null;

        const ip =
          request.headers.get("x-real-ip") ??
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          "unknown";
        return verifyCredentials(parsed.data, ip);
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.sessionVersion = user.sessionVersion;
        token.forcePasswordChange = user.forcePasswordChange;
        token.authenticatedAt = Math.floor(Date.now() / 1000);
      } else if (token.sub) {
        const current = await prisma.user.findFirst({
          where: { id: token.sub, isActive: true, deletedAt: null },
          select: { sessionVersion: true, forcePasswordChange: true, role: true },
        });
        if (
          !current ||
          current.sessionVersion !== token.sessionVersion ||
          ((token.role === "ADMIN" || token.role === "STAFF") &&
            Math.floor(Date.now() / 1000) -
              (typeof token.authenticatedAt === "number"
                ? token.authenticatedAt
                : typeof token.iat === "number"
                  ? token.iat
                  : 0) >
              8 * 60 * 60)
        ) {
          return {};
        }
        token.role = current.role;
        token.forcePasswordChange = current.forcePasswordChange;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as Role | undefined) ?? "CUSTOMER";
        session.user.sessionVersion =
          typeof token.sessionVersion === "number" ? token.sessionVersion : 0;
        session.user.forcePasswordChange =
          typeof token.forcePasswordChange === "boolean" ? token.forcePasswordChange : false;
      }
      return session;
    },
  },
});
