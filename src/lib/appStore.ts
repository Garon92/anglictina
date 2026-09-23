import { createStore } from '../kit';

/** Small per-device preferences for this app (localStorage `g92:anglictina:*`). */
export const appStore = createStore('anglictina', {
  version: 1,
  defaults: {
    /** Old in-app theme/sound preferences were copied into the global g92 settings. */
    appearanceMigrated: false,
    /** Vocabulary session direction. */
    vocabDirection: 'en-cs' as 'en-cs' | 'cs-en' | 'mix',
    /** Collapsed state of practice hub groups. */
    collapsedGroups: [] as string[],
    /** Last help dialog version seen. */
    helpSeen: 0,
    /** Name used only in this app (the family-wide g92 name belongs to the kids' apps). */
    name: '',
    /** Exam: allow unlimited replays of recordings in practice mode. */
    examPracticeReplays: true,
  },
});
