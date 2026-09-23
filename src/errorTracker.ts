/**
 * Legacy facade kept for older call sites. Mistakes now live in IndexedDB (see progress.ts);
 * the old localStorage log ("anglictina_errors") is migrated on the DB v2 upgrade.
 */
import { recordAnswer } from './progress';
import { moduleTitle } from './modules';

export function trackError(
  module: string,
  category: string,
  question: string,
  userAnswer: string,
  correctAnswer: string,
  extra: { itemId?: string; options?: string[]; explanation?: string; accept?: string[]; context?: string } = {},
) {
  void recordAnswer({
    module,
    category,
    prompt: question,
    userAnswer,
    answer: correctAnswer,
    correct: false,
    kind: extra.options?.length ? 'mcq' : 'text',
    ...extra,
  });
}

export function getModuleLabel(module: string): string {
  return moduleTitle(module);
}
