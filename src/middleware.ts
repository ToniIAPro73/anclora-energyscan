import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from './auth.config';

function isAdmin(email?: string | null): boolean {
  const allowlist = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return Boolean(email && allowlist.includes(email.toLowerCase()));
}

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const email = req.auth?.user?.email;
  if (!isAdmin(email)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  return NextResponse.next();
});

export const config = {
  matcher: ['/admin/:path*'],
};
