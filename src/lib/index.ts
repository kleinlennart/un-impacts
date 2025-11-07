/**
 * Data layer barrel export
 * Provides centralized access to all impact-related types and utilities
 */

export type { Impact, ImpactDisplayConfig, ImpactStats } from './types/impact';
export {
  fetchImpacts,
  fetchImpactById,
  fetchImpactsByEntity,
  getImpactStats,
  isValidImpact,
  getRandomImpact,
  getNextImpact,
} from './data/impacts';
export {
  DEFAULT_IMPACT_CONFIG,
  TRANSITION_DURATION,
  KEYBOARD_SHORTCUTS,
} from './constants';
