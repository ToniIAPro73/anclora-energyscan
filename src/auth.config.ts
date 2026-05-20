import type { NextAuthConfig } from 'next-auth';

// Lightweight config used only by middleware (no Prisma, no heavy providers).
// The full config with adapter and providers lives in auth.ts.
export const authConfig = {
  pages: { signIn: '/auth' },
  providers: [],
} satisfies NextAuthConfig;
