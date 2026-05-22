import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import { isAdmin } from '@/lib/is-admin';

// Lightweight config — no Prisma, no heavy providers.
// Used by both middleware and admin server components so they share
// the same JWT decoding path without any database dependency.
export const authConfig = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || (!process.env.VERCEL ? 'local-development-only-auth-secret' : undefined),
  pages: { signIn: '/auth' },
  providers: [],
  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      if (session.user && token.picture !== undefined) session.user.image = token.picture as string | null;
      if (session.user) session.user.isAdmin = Boolean(token.isAdmin || isAdmin(session.user.email));
      return session;
    },
  },
} satisfies NextAuthConfig;

// Shared lightweight auth — safe for middleware and server components.
export const { auth: lightAuth } = NextAuth(authConfig);
