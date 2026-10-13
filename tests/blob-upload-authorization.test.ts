jest.mock('@/auth.config', () => ({ lightAuth: jest.fn() }));
jest.mock('@/lib/prisma', () => ({ prisma: { assessment: { findFirst: jest.fn() } } }));
jest.mock('@vercel/blob/client', () => ({ handleUpload: jest.fn() }));

import { POST } from '@/app/api/blob/upload/route';
import { lightAuth } from '@/auth.config';
import { handleUpload } from '@vercel/blob/client';

function tokenRequest(pathname: string) {
  return new Request('http://localhost/api/blob/upload', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      type: 'blob.generate-client-token',
      payload: { pathname, multipart: false, clientPayload: JSON.stringify({ name: 'fixture.png', type: 'image/png', size: 10 }) },
    }),
  });
}

function callbackRequest() {
  return new Request('http://localhost/api/blob/upload', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      type: 'blob.upload-completed',
      payload: {
        blob: { pathname: 'assessment-drafts/owner_fixture/batch/fixture.png' },
        tokenPayload: JSON.stringify({ userId: 'owner_fixture' }),
      },
    }),
  });
}

describe('Blob upload authorization', () => {
  const originalToken = process.env.BLOB_READ_WRITE_TOKEN;
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BLOB_READ_WRITE_TOKEN = 'synthetic-test-token';
    (handleUpload as jest.Mock).mockResolvedValue({ type: 'blob.generate-client-token', clientToken: 'synthetic-token' });
  });
  afterAll(() => {
    if (originalToken === undefined) delete process.env.BLOB_READ_WRITE_TOKEN;
    else process.env.BLOB_READ_WRITE_TOKEN = originalToken;
  });

  it('denies anonymous uploads before creating upload credentials', async () => {
    (lightAuth as jest.Mock).mockResolvedValue(null);
    const response = await POST(tokenRequest('assessment-drafts/owner_fixture/batch/fixture.png'));
    expect(response.status).toBe(401);
    expect(handleUpload).not.toHaveBeenCalled();
  });

  it('denies failed sessions before creating upload credentials', async () => {
    (lightAuth as jest.Mock).mockRejectedValue(new Error('session unavailable'));
    const response = await POST(tokenRequest('assessment-drafts/owner_fixture/batch/fixture.png'));
    expect(response.status).toBe(401);
    expect(handleUpload).not.toHaveBeenCalled();
  });

  it('denies a client selected path outside its authenticated namespace', async () => {
    (lightAuth as jest.Mock).mockResolvedValue({ user: { id: 'owner_fixture' } });
    const response = await POST(tokenRequest('assessment-drafts/other_fixture/batch/fixture.png'));
    expect(response.status).toBe(403);
    expect(handleUpload).not.toHaveBeenCalled();
  });

  it('allows token generation only inside the authenticated namespace', async () => {
    (lightAuth as jest.Mock).mockResolvedValue({ user: { id: 'owner_fixture' } });
    (handleUpload as jest.Mock).mockImplementation(async ({ onBeforeGenerateToken }) => ({
      type: 'blob.generate-client-token',
      tokenOptions: await onBeforeGenerateToken(
        'assessment-drafts/owner_fixture/batch/fixture.png',
        JSON.stringify({ name: 'fixture.png', type: 'image/png', size: 10 }),
        false,
      ),
    }));
    const response = await POST(tokenRequest('assessment-drafts/owner_fixture/batch/fixture.png'));
    expect(response.status).toBe(200);
    expect(handleUpload).toHaveBeenCalledTimes(1);
    const tokenOptions = (await response.json()).tokenOptions;
    expect(tokenOptions.allowedContentTypes).toContain('image/png');
    expect(tokenOptions.maximumSizeInBytes).toBe(10 * 1024 * 1024);
  });

  it('passes upload-completed callbacks to the SDK handler without a browser session', async () => {
    (lightAuth as jest.Mock).mockRejectedValue(new Error('no browser session on server callback'));
    const response = await POST(callbackRequest());
    expect(response.status).toBe(200);
    expect(handleUpload).toHaveBeenCalledWith(expect.objectContaining({
      body: expect.objectContaining({ type: 'blob.upload-completed' }),
      onUploadCompleted: expect.any(Function),
    }));
  });
});
