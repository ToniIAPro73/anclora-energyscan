import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';

// Lightweight config — no Prisma, no heavy providers.
// Used by both middleware and admin server components so they share
// the same JWT decoding path without any database dependency.
export const authConfig = {
  pages: { signIn: '/auth' },
  providers: [],
} satisfies NextAuthConfig;

// Shared lightweight auth — safe for middleware and server components.
export const { auth: lightAuth } = NextAuth(authConfig);
