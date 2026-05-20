import { NextResponse } from 'next/server';
import { lightAuth } from './auth.config';

function isAdmin(email?: string | null): boolean {
  const allowlist = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return Boolean(email && allowlist.includes(email.toLowerCase()));
}

export default lightAuth((req) => {
  const email = req.auth?.user?.email;
  if (!isAdmin(email)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  return NextResponse.next();
});

export const config = {
  matcher: ['/admin/:path*'],
};
