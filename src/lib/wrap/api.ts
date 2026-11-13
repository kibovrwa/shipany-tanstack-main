import { apiGet, apiPost } from '@/lib/api-client';

export interface WrapGeneration {
  id: string;
  prompt: string;
  status: string;
  imageUrl?: string;
  vehicle?: string;
}

/** Start an AI wrap generation for the signed-in user. */
export function startWrapGeneration(input: {
  prompt: string;
  vehicle: string;
}) {
  return apiPost<WrapGeneration>('/api/wrap/generate', input);
}

/** Poll one generation, or list recent ones when `id` is omitted. */
export function fetchWrapGeneration(id: string) {
  return apiGet<WrapGeneration>(
    `/api/wrap/generate?id=${encodeURIComponent(id)}`
  );
}

export function listWrapGenerations() {
  return apiGet<{ items: WrapGeneration[] }>('/api/wrap/generate');
}

export function fetchWrapBalance() {
  return apiGet<{ balance: number }>('/api/credits');
}

/** Download a finished generation image (auth cookie is sent automatically). */
export async function fetchWrapImageBlob(url: string): Promise<Blob> {
  const res = await fetch(url, { credentials: 'same-origin' });
  if (!res.ok) throw new Error('Failed to download generation');
  return res.blob();
}

/**
 * Poll until the generation finishes or fails.
 * Resolves with the final record (caller checks `status` / `imageUrl`).
 */
export async function waitForWrapGeneration(
  id: string,
  options: { timeoutMs?: number; intervalMs?: number } = {}
): Promise<WrapGeneration> {
  const timeoutMs = options.timeoutMs ?? 90_000;
  const intervalMs = options.intervalMs ?? 1_500;
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const generation = await fetchWrapGeneration(id);
    if (
      generation.status === 'succeeded' ||
      generation.status === 'failed' ||
      generation.status === 'expired'
    ) {
      return generation;
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error('timeout');
}
