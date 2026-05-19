import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request): Promise<NextResponse> {
  if (!process.env.BLOB_PUBLIC_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'Blob storage not configured' }, { status: 503 });
  }

  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rawContentType = request.headers.get('content-type') || '';
  // Strip any parameters (e.g. "image/jpeg; charset=utf-8" → "image/jpeg")
  const contentType = rawContentType.split(';')[0].trim();

  if (!ALLOWED_TYPES.includes(contentType)) {
    return NextResponse.json({ error: 'Tipo de imagen no permitido' }, { status: 400 });
  }

  let buffer: ArrayBuffer;
  try {
    buffer = await request.arrayBuffer();
  } catch {
    return NextResponse.json({ error: 'No se pudo leer el archivo.' }, { status: 400 });
  }

  if (buffer.byteLength === 0) {
    return NextResponse.json({ error: 'El archivo está vacío.' }, { status: 400 });
  }
  if (buffer.byteLength > MAX_SIZE) {
    return NextResponse.json({ error: 'La imagen supera el tamaño máximo de 5 MB.' }, { status: 400 });
  }

  const ext = contentType === 'image/jpeg' ? 'jpg' : contentType.split('/')[1] || 'jpg';
  const pathname = `avatars/${session.user.id}.${ext}`;

  try {
    const blob = await put(pathname, Buffer.from(buffer), {
      access: 'public',
      contentType,
      allowOverwrite: true,
      token: process.env.BLOB_PUBLIC_READ_WRITE_TOKEN,
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: blob.url },
    });

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error('[avatar upload]', err);
    const message = err instanceof Error ? err.message : 'Error desconocido';
    return NextResponse.json({ error: `No se pudo subir el avatar: ${message}` }, { status: 500 });
  }
}
