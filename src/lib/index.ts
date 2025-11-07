/**
 * Data layer barrel export
 * Provides centralized access to all impact-related types and utilities
 */

export {
    DEFAULT_IMPACT_CONFIG, KEYBOARD_SHORTCUTS, TRANSITION_DURATION
} from './constants';
export {
    fetchImpactById, fetchImpacts, fetchImpactsByEntity,
    getImpactStats, getNextImpact, getRandomImpact, isValidImpact
} from './data/impacts';
export type { Impact, ImpactDisplayConfig, ImpactStats } from './types/impact';

