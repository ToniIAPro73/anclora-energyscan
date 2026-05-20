import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';

// Lightweight config — no Prisma, no heavy providers.
// Used by both middleware and admin server components so they share
// the same JWT decoding path without any database dependency.
export const authConfig = {
  pages: { signIn: '/auth' },
  providers: [],
  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      if (session.user && token.picture !== undefined) session.user.image = token.picture as string | null;
      return session;
    },
  },
} satisfies NextAuthConfig;

// Shared lightweight auth — safe for middleware and server components.
export const { auth: lightAuth } = NextAuth(authConfig);
