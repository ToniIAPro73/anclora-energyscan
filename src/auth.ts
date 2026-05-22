import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/password';
import { getOAuthEnv } from '@/lib/auth-env';
import { isAdmin } from '@/lib/is-admin';

const oauth = getOAuthEnv();

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || (!process.env.VERCEL ? 'local-development-only-auth-secret' : undefined),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth',
  },
  providers: [
    oauth.google.enabled
      ? Google({
          clientId: oauth.google.clientId!,
          clientSecret: oauth.google.clientSecret!,
        })
      : null,
    oauth.github.enabled
      ? GitHub({
          clientId: oauth.github.clientId!,
          clientSecret: oauth.github.clientSecret!,
        })
      : null,
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === 'string' ? credentials.email.trim().toLowerCase() : '';
        const password = typeof credentials?.password === 'string' ? credentials.password : '';
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          select: { id: true, name: true, email: true, image: true, passwordHash: true },
        });

        if (!user || !(await verifyPassword(password, user.passwordHash))) return null;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ].filter(Boolean) as any[],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user?.id) token.sub = user.id;
      if (token.email) token.isAdmin = isAdmin(String(token.email));
      if (trigger === 'update' && token.sub) {
        const fresh = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { image: true, name: true },
        });
        if (fresh) {
          token.picture = fresh.image ?? undefined;
          token.name = fresh.name ?? undefined;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      if (session.user && token.picture !== undefined) session.user.image = token.picture as string | null;
      if (session.user) session.user.isAdmin = Boolean(token.isAdmin || isAdmin(session.user.email));
      return session;
    },
  },
});
