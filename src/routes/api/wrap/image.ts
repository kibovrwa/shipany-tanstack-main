import { createFileRoute } from '@tanstack/react-router';
import { wrapGenerationImage } from '@/server/wrap/ai';

import { getAuth } from '@/core/auth';
import { enforceMinIntervalRateLimit } from '@/lib/rate-limit';
import { respErr } from '@/lib/resp';

const MAX_BYTES = 12 * 1024 * 1024;
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

/**
 * Same-origin copy of a finished generation, so the editor can draw it on a
 * canvas and export it (provider URLs are cross-origin and short-lived).
 * Only the owner can read it, and only from the provider's own hosts.
 */
async function GET({ request }: { request: Request }) {
  const limited = enforceMinIntervalRateLimit(request, {
    intervalMs: 200,
    keyPrefix: 'wrap-image',
  });
  if (limited) return limited;

  const auth = getAuth();
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return respErr('Unauthorized');

  const id = new URL(request.url).searchParams.get('id') || '';
  const source = await wrapGenerationImage(session.user.id, id);
  if (!source) return new Response('Not found', { status: 404 });

  const upstream = await fetch(source, { redirect: 'error' }).catch(() => null);
  if (!upstream?.ok) return new Response('Image expired', { status: 410 });

  const type = (upstream.headers.get('content-type') || '').split(';')[0];
  if (!IMAGE_TYPES.includes(type)) {
    return new Response('Unsupported image', { status: 415 });
  }
  const bytes = await upstream.arrayBuffer();
  if (bytes.byteLength > MAX_BYTES) {
    return new Response('Image too large', { status: 413 });
  }
  return new Response(bytes, {
    headers: {
      'Content-Type': type,
      'Cache-Control': 'private, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

export const Route = createFileRoute('/api/wrap/image')({
  server: { handlers: { GET } },
});