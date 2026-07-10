import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth, { NextAuthConfig } from "next-auth";
import { prisma } from "./db/prisma";
import AuthConfig from "./auth.config";
import { compareSync } from "bcrypt-ts-edge";

export const config = {
  ...AuthConfig,
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

        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string,
          },
        });

        if (user === null) {
          throw new Error("Email does not exist");
        }

        if (user.password) {
          if (!compareSync(credentials.password as string, user.password)) {
            throw new Error("Incorrect password");
          }
        }

        if (!user.emailVerified) {
          throw new Error("Please verify your email");
        }

        return user;
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 dasys
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.level = user.level;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.level = token.level;
      }

      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
