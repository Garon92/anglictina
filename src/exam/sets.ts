import type { ExamSet } from './types';
import { SET_A } from '../data/exam/setA';
import { SET_B } from '../data/exam/setB';
import { SET_C } from '../data/exam/setC';
import { SET_D } from '../data/exam/setD';
import { SET_E } from '../data/exam/setE';

/** All original practice tests, in display order. */
export const EXAM_SETS: ExamSet[] = [SET_A, SET_B, SET_C, SET_D, SET_E];

export function getSet(id: string): ExamSet | undefined {
  return EXAM_SETS.find((s) => s.id === id);
}
