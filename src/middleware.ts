import { NextResponse } from 'next/server';
import { auth } from '@/auth';

function isAdmin(email?: string | null) {
  const allowlist = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return Boolean(email && allowlist.includes(email.toLowerCase()));
}

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
