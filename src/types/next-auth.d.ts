import type { DefaultSession } from "next-auth";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      sessionVersion: number;
      forcePasswordChange: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    sessionVersion: number;
    forcePasswordChange: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    sessionVersion?: number;
    forcePasswordChange?: boolean;
    authenticatedAt?: number;
  }
}
