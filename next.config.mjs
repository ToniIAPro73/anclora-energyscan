/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@napi-rs/canvas'],
  },
  images: {
    remotePatterns: [
      // Vercel Blob (avatars and attachments)
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
      // Google OAuth profile pictures
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      // GitHub OAuth profile pictures
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
};

export default nextConfig;
