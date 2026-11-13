import { createFileRoute } from '@tanstack/react-router';
import { getAIManager } from '@/server/ai';

import { AIMediaType, AITaskStatus } from '@/core/ai/types';
import { getAuth } from '@/core/auth';
import {
  createTask,
  AITaskStatus as ModuleTaskStatus,
  updateTask,
} from '@/modules/ai-tasks/service';
import { enforceMinIntervalRateLimit } from '@/lib/rate-limit';
import { respData, respErr } from '@/lib/resp';

async function POST({ request }: { request: Request }) {
  const ipLimited = enforceMinIntervalRateLimit(request, {
    keyPrefix: 'ai-generate',
    intervalMs: 2000,
  });
  if (ipLimited) return ipLimited;

  const auth = getAuth();
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return respErr('Unauthorized');

  const userLimited = enforceMinIntervalRateLimit(request, {
    keyPrefix: 'ai-generate-user',
    intervalMs: 3000,
    extraKey: session.user.id,
  });
  if (userLimited) return userLimited;

  let body: { prompt?: string; mode?: 'image' | 'video' };
  try {
    body = await request.json();
  } catch {
    return respErr('Invalid JSON');
  }

  const prompt = body.prompt?.trim();
  if (!prompt) return respErr('Prompt is required');
  if (prompt.length > 3500) return respErr('Prompt too long');

  const mode = body.mode === 'video' ? 'video' : 'image';
  const mediaType = mode === 'video' ? AIMediaType.VIDEO : AIMediaType.IMAGE;

  const manager = await getAIManager();
  const provider = manager?.getDefaultProvider();
  if (!manager || !provider) {
    // Clear missing-key state — never fake a successful generation.
    return respData({
      taskId: null,
      status: 'unavailable',
      missingProvider: true,
      message:
        'No AI video/image provider is configured. Add a Replicate, Fal, or Kie API key in Admin → Settings.',
    });
  }

  const model = mode === 'video' ? 'seedance-video' : 'seedance-image';

  let task;
  try {
    task = await createTask({
      userId: session.user.id,
      mediaType: mode,
      provider: provider.name,
      model,
      prompt,
      costCredits: mode === 'video' ? 10 : 1,
    });
  } catch (e: any) {
    return respErr(e?.message || 'Failed to create task');
  }

  try {
    const result = await provider.generate({
      params: {
        mediaType,
        prompt,
        async: true,
      },
    });

    const status =
      result.taskStatus === AITaskStatus.SUCCESS
        ? ModuleTaskStatus.SUCCESS
        : result.taskStatus === AITaskStatus.FAILED
          ? ModuleTaskStatus.FAILED
          : result.taskStatus === AITaskStatus.PROCESSING
            ? ModuleTaskStatus.PROCESSING
            : ModuleTaskStatus.PENDING;

    await updateTask({
      taskId: task.id,
      status,
      taskResult: {
        providerTaskId: result.taskId,
        taskInfo: result.taskInfo,
        raw: result.taskResult,
      },
    });

    return respData({
      taskId: task.id,
      status,
      missingProvider: false,
      message: 'Generation started',
    });
  } catch (e: any) {
    await updateTask({
      taskId: task.id,
      status: ModuleTaskStatus.FAILED,
      taskResult: { errorMessage: e?.message || 'Generation failed' },
    }).catch(() => undefined);
    return respErr(e?.message || 'Generation failed');
  }
}

export const Route = createFileRoute('/api/ai/generate')({
  server: { handlers: { POST } },
});
