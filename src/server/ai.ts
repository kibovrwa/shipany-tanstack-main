import {
  AIManager,
  FalProvider,
  KieProvider,
  ReplicateProvider,
} from '@/core/ai';
import { getAllConfigs } from '@/modules/config/service';

let manager: AIManager | null = null;
let managerHash = '';

/**
 * Build an AIManager from admin/env configs.
 * Returns null when no provider key is available — callers must surface
 * a clear missing-key state and must never fake success.
 */
export async function getAIManager(): Promise<AIManager | null> {
  const configs = await getAllConfigs();
  const c = (key: string) => configs[key] || '';

  const hash = JSON.stringify([
    c('replicate_api_token'),
    c('fal_api_key'),
    c('kie_api_key'),
    c('default_ai_provider'),
  ]);
  if (manager && hash === managerHash) return manager;

  const next = new AIManager();
  let added = 0;

  if (c('replicate_api_token')) {
    next.addProvider(
      new ReplicateProvider({ apiToken: c('replicate_api_token') }),
      !c('default_ai_provider') || c('default_ai_provider') === 'replicate'
    );
    added++;
  }
  if (c('fal_api_key')) {
    next.addProvider(
      new FalProvider({ apiKey: c('fal_api_key') }),
      c('default_ai_provider') === 'fal'
    );
    added++;
  }
  if (c('kie_api_key')) {
    next.addProvider(
      new KieProvider({ apiKey: c('kie_api_key') }),
      c('default_ai_provider') === 'kie'
    );
    added++;
  }

  if (!added) {
    manager = null;
    managerHash = hash;
    return null;
  }

  manager = next;
  managerHash = hash;
  return manager;
}
