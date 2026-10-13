import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import {
  ALLOWED_ATTACHMENT_MIME_TYPES,
  MAX_ATTACHMENT_SIZE,
  sanitizeFilename,
} from '@/lib/attachments';
import { lightAuth as auth } from '@/auth.config';
import { isOwnedDraftPath } from '@/lib/assessment-authorization';

export const dynamic = 'force-dynamic';

function parseUploadPayload(clientPayload: string | null) {
  if (!clientPayload) return {};
  try {
    return JSON.parse(clientPayload) as { name?: string; type?: string; size?: number };
  } catch {
    return {};
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: 'Solicitud de subida no válida' }, { status: 400 });
  }
  if (!body || typeof body !== 'object' || typeof body.type !== 'string') {
    return NextResponse.json({ error: 'Solicitud de subida no válida' }, { status: 400 });
  }

  if (body.type === 'blob.generate-client-token') {
    if (!body.payload || typeof body.payload.pathname !== 'string') {
      return NextResponse.json({ error: 'Solicitud de subida no válida' }, { status: 400 });
    }
    let session;
    try {
      session = await auth();
    } catch {
      return NextResponse.json({ error: 'Inicia sesión para adjuntar archivos' }, { status: 401 });
    }
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Inicia sesión para adjuntar archivos' }, { status: 401 });
    }
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: 'Blob storage is not configured' }, { status: 503 });
    }
    if (!isOwnedDraftPath(body.payload.pathname, session.user.id)) {
      return NextResponse.json({ error: 'Ruta de adjunto no permitida' }, { status: 403 });
    }
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const session = await auth();
        if (!session?.user?.id || !isOwnedDraftPath(pathname, session.user.id)) {
          throw new Error('No autorizado para subir este adjunto');
        }
        const payload = parseUploadPayload(clientPayload);
        const safeName = sanitizeFilename(payload.name || pathname.split('/').pop() || 'attachment');

        if (payload.size !== undefined && (!Number.isSafeInteger(payload.size) || payload.size <= 0 || payload.size > MAX_ATTACHMENT_SIZE)) {
          throw new Error('El archivo supera el tamaño máximo permitido');
        }

        return {
          allowedContentTypes: [...ALLOWED_ATTACHMENT_MIME_TYPES],
          maximumSizeInBytes: MAX_ATTACHMENT_SIZE,
          validUntil: Date.now() + 30 * 60 * 1000,
          addRandomSuffix: true,
          allowOverwrite: false,
          tokenPayload: JSON.stringify({
            name: safeName,
            type: payload.type,
            size: payload.size,
            userId: session.user.id,
          }),
        };
      },
      onUploadCompleted: async () => {
        // Vercel verifies the callback signature before invoking this hook. Avoid
        // logging paths, which may contain user identifiers or document names.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No se pudo preparar la subida del adjunto' },
      { status: 400 }
    );
  }
}
