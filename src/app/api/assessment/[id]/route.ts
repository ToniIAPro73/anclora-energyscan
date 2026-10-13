import { NextResponse } from 'next/server';
import { deleteAssessmentData } from '@/lib/assessment-data-deletion';
import { getAuthenticatedUserId } from '@/lib/assessment-authorization';
import { logSafeError } from '@/lib/safe-logger';

export const dynamic = 'force-dynamic';

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });

  try {
    const deleted = await deleteAssessmentData(params.id, userId);
    if (!deleted) return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    logSafeError('assessment_delete_failed');
    return NextResponse.json({ error: 'Assessment could not be deleted' }, { status: 503 });
  }
}
