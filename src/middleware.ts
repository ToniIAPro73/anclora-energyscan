import { NextResponse } from 'next/server';
import { lightAuth } from './auth.config';
import { isAdmin } from './lib/is-admin';

export default lightAuth((req) => {
  const { pathname } = req.nextUrl;
  const email = req.auth?.user?.email;

  if (pathname === '/') {
    if (email && isAdmin(email)) {
      return NextResponse.redirect(new URL('/admin', req.nextUrl));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin')) {
    if (!email) {
      const signInUrl = new URL('/auth', req.nextUrl);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }
    if (!isAdmin(email)) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }
    return NextResponse.next();
  }

  if ((pathname.startsWith('/provider/dashboard') || pathname.startsWith('/provider/leads') || pathname.startsWith('/provider/billing') || pathname.startsWith('/profesional/dashboard')) && !email) {
    const signInUrl = new URL('/auth', req.nextUrl);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (pathname === '/dashboard' && isAdmin(email)) {
    return NextResponse.redirect(new URL('/admin', req.nextUrl));
  }

  if (!email && pathname === '/dashboard') {
    const signInUrl = new URL('/auth', req.nextUrl);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (!email) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  return NextResponse.next();
});

export const config = {
  matcher: ['/', '/admin/:path*', '/dashboard', '/provider/dashboard', '/provider/leads', '/provider/billing', '/profesional/dashboard'],
};
