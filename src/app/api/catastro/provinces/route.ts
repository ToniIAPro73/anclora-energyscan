import { NextResponse } from 'next/server';
import { getProvinces } from '@/lib/catastro/client';
import { logSafeError } from '@/lib/safe-logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const provinces = await getProvinces();
    return NextResponse.json(provinces);
  } catch {
    logSafeError('catastro_data_unavailable');
    return NextResponse.json({ error: 'Failed to fetch provinces' }, { status: 500 });
  }
}
