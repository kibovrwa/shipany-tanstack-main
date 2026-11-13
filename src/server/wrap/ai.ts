import {
  AIMediaType,
  AITaskStatus as ProviderStatus,
  FalProvider,
  ReplicateProvider,
  type AIProvider,
} from '@/core/ai';
import { WRAP_AI_CREDITS } from '@/config/wrap';
import {
  AITaskStatus,
  createTask,
  findTask,
  getTasks,
  updateTask,
} from '@/modules/ai-tasks/service';

export const WRAP_AI_SCENE = 'wrap';
export const WRAP_PROMPT_MAX = 600;

const DEFAULT_MODELS: Record<string, string> = {
  replicate: 'black-forest-labs/flux-schnell',
  fal: 'fal-ai/flux/schnell',
};

/** Hosts a provider serves results from. The image proxy fetches nothing else. */
const RESULT_HOSTS = [
  'replicate.delivery',
  'replicate.com',
  'fal.media',
  'fal.run',
  'fal.ai',
];

export interface WrapAiEngine {
  provider: AIProvider;
  model: string;
}

export interface WrapGeneration {
  id: string;
  status: string;
  prompt: string;
  createdAt: number;
  /** Set once the image is ready; served through the same-origin proxy. */
  imageUrl?: string;
}

/**
 * The image provider to use, from the keys saved in admin Settings → AI
 * (Replicate first, then Fal). `wrap_ai_provider` / `wrap_ai_model` override
 * the choice. Null when no key is configured.
 */
export function resolveWrapAi(
  configs: Record<string, string>
): WrapAiEngine | null {
  const preferred = configs.wrap_ai_provider;
  const order = preferred ? [preferred] : ['replicate', 'fal'];
  for (const name of order) {
    if (name === 'replicate' && configs.replicate_api_token) {
      return {
        provider: new ReplicateProvider({
          apiToken: configs.replicate_api_token,
        }),
        model: configs.wrap_ai_model || DEFAULT_MODELS.replicate,
      };
    }
    if (name === 'fal' && configs.fal_api_key) {
      return {
        provider: new FalProvider({ apiKey: configs.fal_api_key }),
        model: configs.wrap_ai_model || DEFAULT_MODELS.fal,
      };
    }
  }
  return null;
}

export function cleanPrompt(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[\u0000-\u001f\u007f]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, WRAP_PROMPT_MAX);
}

function buildPrompt(prompt: string): string {
  return [
    'Flat 2D vehicle wrap livery artwork, seamless edge-to-edge graphic design',
    'viewed straight on, filling the whole square canvas, vivid colours, crisp',
    'vector-like detail. No car, no vehicle, no perspective, no mockup, no text,',
    'no watermark, no border.',
    `Theme: ${prompt}`,
  ].join(' ');
}

function providerOptions(engine: WrapAiEngine): Record<string, unknown> {
  return engine.provider.name === 'fal'
    ? { image_size: 'square_hd', num_images: 1 }
    : { aspect_ratio: '1:1', output_format: 'png', num_outputs: 1 };
}

function resultImage(task: { taskResult?: string | null }): string | undefined {
  if (!task.taskResult) return undefined;
  try {
    const parsed = JSON.parse(task.taskResult) as { image?: string };
    return typeof parsed.image === 'string' ? parsed.image : undefined;
  } catch {
    return undefined;
  }
}

function toGeneration(task: {
  id: string;
  status: string;
  prompt: string;
  createdAt: Date | number;
  taskResult?: string | null;
}): WrapGeneration {
  return {
    id: task.id,
    status: task.status,
    prompt: task.prompt,
    createdAt: new Date(task.createdAt).getTime(),
    imageUrl:
      task.status === AITaskStatus.SUCCESS && resultImage(task)
        ? `/api/wrap/image?id=${encodeURIComponent(task.id)}`
        : undefined,
  };
}

/**
 * Charges the credits and starts the job. The charge and the task row are one
 * atomic write (`createTask`); if the provider refuses the job the task is
 * failed, which gives the credits back.
 */
export async function startWrapGeneration(params: {
  userId: string;
  prompt: string;
  vehicle: string;
  engine: WrapAiEngine;
}): Promise<WrapGeneration> {
  const { userId, prompt, vehicle, engine } = params;
  const task = await createTask({
    userId,
    mediaType: AIMediaType.IMAGE,
    provider: engine.provider.name,
    model: engine.model,
    prompt,
    costCredits: WRAP_AI_CREDITS,
    scene: WRAP_AI_SCENE,
    options: { vehicle },
  });

  try {
    const result = await engine.provider.generate({
      params: {
        mediaType: AIMediaType.IMAGE,
        model: engine.model,
        prompt: buildPrompt(prompt),
        options: providerOptions(engine),
        async: true,
      },
    });
    await updateTask({
      taskId: task.id,
      status: AITaskStatus.PROCESSING,
      providerTaskId: result.taskId,
    });
  } catch (error) {
    await updateTask({ taskId: task.id, status: AITaskStatus.FAILED });
    console.error('wrap generation failed to start:', (error as Error).message);
    throw new Error('The AI provider could not start this generation');
  }

  return toGeneration({ ...task, status: AITaskStatus.PROCESSING });
}

/**
 * Current state of a generation, asking the provider while it is still
 * running. A failed job is refunded exactly once (`revoke` claims the
 * consumption record).
 */
export async function pollWrapGeneration(params: {
  userId: string;
  id: string;
  engine: WrapAiEngine | null;
}): Promise<WrapGeneration | null> {
  const task = await findTask(params.id);
  if (!task || task.userId !== params.userId || task.scene !== WRAP_AI_SCENE) {
    return null;
  }
  const running =
    task.status === AITaskStatus.PENDING ||
    task.status === AITaskStatus.PROCESSING;
  if (!running) return toGeneration(task);

  const { engine } = params;
  if (!engine || engine.provider.name !== task.provider || !task.taskId) {
    // The key was removed or changed mid-job: nothing can finish it.
    await updateTask({ taskId: task.id, status: AITaskStatus.FAILED });
    return toGeneration({ ...task, status: AITaskStatus.FAILED });
  }
  if (!engine.provider.query) return toGeneration(task);

  const result = await engine.provider.query({
    taskId: task.taskId,
    mediaType: AIMediaType.IMAGE,
    model: task.model,
  });

  if (result.taskStatus === ProviderStatus.SUCCESS) {
    const image = result.taskInfo?.images?.[0]?.imageUrl;
    if (!image || !isResultUrl(image)) {
      await updateTask({ taskId: task.id, status: AITaskStatus.FAILED });
      return toGeneration({ ...task, status: AITaskStatus.FAILED });
    }
    const taskResult = JSON.stringify({ image });
    await updateTask({
      taskId: task.id,
      status: AITaskStatus.SUCCESS,
      taskResult: { image },
    });
    return toGeneration({ ...task, status: AITaskStatus.SUCCESS, taskResult });
  }
  if (
    result.taskStatus === ProviderStatus.FAILED ||
    result.taskStatus === ProviderStatus.CANCELED
  ) {
    await updateTask({ taskId: task.id, status: AITaskStatus.FAILED });
    return toGeneration({ ...task, status: AITaskStatus.FAILED });
  }
  return toGeneration(task);
}

export async function listWrapGenerations(
  userId: string
): Promise<WrapGeneration[]> {
  const tasks = await getTasks({
    userId,
    mediaType: AIMediaType.IMAGE,
    scene: WRAP_AI_SCENE,
    limit: 24,
  });
  return tasks.map(toGeneration);
}

export function isResultUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      RESULT_HOSTS.some(
        (host) => url.hostname === host || url.hostname.endsWith(`.${host}`)
      )
    );
  } catch {
    return false;
  }
}

/** The provider's URL for a finished generation owned by `userId`. */
export async function wrapGenerationImage(
  userId: string,
  id: string
): Promise<string | null> {
  const task = await findTask(id);
  if (
    !task ||
    task.userId !== userId ||
    task.scene !== WRAP_AI_SCENE ||
    task.status !== AITaskStatus.SUCCESS
  ) {
    return null;
  }
  const image = resultImage(task);
  return image && isResultUrl(image) ? image : null;
}