import { createFileRoute } from '@tanstack/react-router';
import {
  cleanPrompt,
  listWrapGenerations,
  pollWrapGeneration,
  resolveWrapAi,
  startWrapGeneration,
} from '@/server/wrap/ai';

import { getAuth } from '@/core/auth';
import { getWrapVehicle, WRAP_AI_CREDITS } from '@/config/wrap';
import { getAllConfigs } from '@/modules/config/service';
import { getBalance } from '@/modules/credits/service';
import { enforceMinIntervalRateLimit } from '@/lib/rate-limit';
import { respData, respErr } from '@/lib/resp';

/**
 * POST: start an AI wrap generation (costs WRAP_AI_CREDITS).
 * GET ?id=: poll one generation. GET without id: the caller's recent ones.
 */
async function POST({ request }: { request: Request }) {
  const limited = enforceMinIntervalRateLimit(request, {
    intervalMs: 3000,
    keyPrefix: 'wrap-generate',
  });
  if (limited) return limited;

  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return respErr('Unauthorized');

    const userLimited = enforceMinIntervalRateLimit(request, {
      intervalMs: 3000,
      keyPrefix: 'wrap-generate',
      extraKey: session.user.id,
    });
    if (userLimited) return userLimited;

    const body = (await request.json().catch(() => ({}))) as {
      prompt?: unknown;
      vehicle?: unknown;
    };
    const prompt = cleanPrompt(body.prompt);
    if (prompt.length < 3) return respErr('Describe the wrap you want');
    const vehicle =
      typeof body.vehicle === 'string' ? getWrapVehicle(body.vehicle) : null;
    if (!vehicle?.editable) return respErr('Unknown vehicle');

    // Refuse before charging when nothing could run the job.
    const engine = resolveWrapAi(await getAllConfigs());
    if (!engine) return respErr('AI generation is not configured yet');

    const balance = await getBalance(session.user.id);
    if (balance < WRAP_AI_CREDITS) return respErr('Insufficient credits');

    const generation = await startWrapGeneration({
      userId: session.user.id,
      prompt,
      vehicle: vehicle.slug,
      engine,
    });
    return respData(generation);
  } catch (error) {
    const message = (error as Error).message;
    return respErr(
      message === 'Insufficient credits' ||
        message === 'The AI provider could not start this generation'
        ? message
        : 'Generation failed'
    );
  }
}

async function GET({ request }: { request: Request }) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return respErr('Unauthorized');

    const id = new URL(request.url).searchParams.get('id');
    if (!id) {
      return respData({ items: await listWrapGenerations(session.user.id) });
    }

    const generation = await pollWrapGeneration({
      userId: session.user.id,
      id,
      engine: resolveWrapAi(await getAllConfigs()),
    });
    if (!generation) return respErr('Not found');
    return respData(generation);
  } catch {
    return respErr('Failed to load generation');
  }
}

export const Route = createFileRoute('/api/wrap/generate')({
  server: { handlers: { GET, POST } },
});