import { DefaultSession, DefaultUser } from "next-auth";
import "next-auth/jwt";
import { UserLevel } from "@prisma/client";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    level: UserLevel;
  }

  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      level: UserLevel;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    level: UserLevel;
  }
}
