/**
 * Phase 3 sprint 3 — wellness-hub tab model.
 * Pure data/helpers — no JSX, no server imports. Tested from the api suite.
 */

import type { TranslationKey } from './i18n';

export const WELLNESS_TABS = ['cycle', 'pamper', 'postpartum', 'menopause', 'mind'] as const;
export type WellnessTabKey = (typeof WELLNESS_TABS)[number];

export interface WellnessTabInput {
  /** Resolved life stage (lifeStage.get). */
  stage?: string | null;
  /** isPamperWindow active right now. */
  pamperActive?: boolean;
  /** Menopause mode has been enabled by the user. */
  menopauseEnabled?: boolean;
  /** Last-picked tab from localStorage. */
  savedTab?: string | null;
  /** ?tab= deep-link param. */
  param?: string | null;
}

export function isWellnessTabKey(value: unknown): value is WellnessTabKey {
  return typeof value === 'string' && (WELLNESS_TABS as readonly string[]).includes(value);
}

/**
 * Resolve the tab to show on the wellness hub.
 * Precedence: ?tab= param → pamper window → menopause mode → saved tab →
 * stage mapping (new_mom → postpartum) → cycle.
 */
export function defaultTabFor(input: WellnessTabInput): WellnessTabKey {
  if (isWellnessTabKey(input.param)) return input.param;
  if (input.pamperActive) return 'pamper';
  if (input.menopauseEnabled) return 'menopause';
  if (isWellnessTabKey(input.savedTab)) return input.savedTab;
  if (input.stage === 'new_mom') return 'postpartum';
  return 'cycle';
}

/** Tab key → i18n translation key. */
export const WELLNESS_TAB_I18N: Record<WellnessTabKey, TranslationKey> = {
  cycle: 'wellnessHub.tab.cycle',
  pamper: 'wellnessHub.tab.pamper',
  postpartum: 'wellnessHub.tab.postpartum',
  menopause: 'wellnessHub.tab.menopause',
  mind: 'wellnessHub.tab.mind',
};
