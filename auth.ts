import NextAuth, { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { compareSync } from "bcrypt-ts-edge";

export const config = {
  pages: {
    signIn: "sign-in",
    signOut: "sign-out",
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (credentials === null) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        });

        if (user && user.password) {
          if (!compareSync(credentials.password as string, user.password)) {
            return null;
          }
        }

        if (user === null) {
          return null;
        }

        return user;
      },
    }),
  ],
  callbacks: {
    async session({ session, user, trigger, token }) {
      session.user.id = user.id;

      if (trigger === "update") {
        session.user.name = token.name;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
