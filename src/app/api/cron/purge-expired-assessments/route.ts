import { timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import { purgeExpiredAssessmentData } from '@/lib/assessment-data-deletion';
import { logSafeError } from '@/lib/safe-logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function isAuthorizedCronRequest(request: Request, secret: string | undefined): boolean {
  if (!secret) return false;
  const authorization = request.headers.get('authorization') || '';
  const provided = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  const providedBuffer = Buffer.from(provided);
  const secretBuffer = Buffer.from(secret);
  return providedBuffer.length === secretBuffer.length && timingSafeEqual(providedBuffer, secretBuffer);
}

export async function POST(request: Request) {
  if (!isAuthorizedCronRequest(request, process.env.CRON_SECRET)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await purgeExpiredAssessmentData();
    if (result.failed) return NextResponse.json(result, { status: 503 });
    return NextResponse.json(result);
  } catch {
    logSafeError('assessment_purge_failed');
    return NextResponse.json({ error: 'Purge failed' }, { status: 500 });
  }
}

