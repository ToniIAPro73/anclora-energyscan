import { NextRequest, NextResponse } from 'next/server';
import { CatastroStreetServiceError, resolveByCoordinates } from '@/lib/catastro/client';
import { CatastroCoordinatesInputSchema, type CatastroResolveResponse } from '@/lib/catastro/types';
import { logSafeError } from '@/lib/safe-logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = CatastroCoordinatesInputSchema.safeParse({
    lat: searchParams.get('lat'),
    lng: searchParams.get('lng'),
  });

  if (!parsed.success) {
    return NextResponse.json({
      ok: false,
      error: {
        code: 'INVALID_COORDINATES',
        message: 'Coordenadas no válidas',
      },
    }, { status: 400 });
  }

  try {
    const matches = await resolveByCoordinates(parsed.data.lat, parsed.data.lng);
    const response: CatastroResolveResponse = {
      ok: true,
      data: {
        matches,
        source: {
          system: 'catastro',
          mode: 'coords',
          retrievedAt: new Date().toISOString(),
          confidence: matches.length === 1 ? 1 : 0.8,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    const isRateLimited = error instanceof CatastroStreetServiceError && (error.status === 403 || error.status === 429);
    logSafeError('catastro_lookup_failed');

    return NextResponse.json({
      ok: false,
      error: {
        code: isRateLimited ? 'CATASTRO_RATE_LIMITED' : 'CATASTRO_SERVICE_ERROR',
        message: isRateLimited
          ? 'El servicio de Catastro ha limitado temporalmente las consultas. Inténtalo más tarde.'
          : 'El servicio de Catastro no está disponible temporalmente.',
      },
    }, { status: 503 });
  }
}
