import type { ImpactDisplayConfig } from './types/impact';

/**
 * Default configuration for impact display
 * 
 * Modify these values to change the behavior of the impact carousel:
 * - sequentialMode: false = random impacts, true = sequential order
 * - autoAdvanceInterval: Time in milliseconds between auto-advancing impacts
 * - overwriteId: Set to a specific impact ID to show only that impact (useful for debugging)
 */
export const DEFAULT_IMPACT_CONFIG: ImpactDisplayConfig = {
    sequentialMode: true,
    autoAdvanceInterval: 10000, // 10 seconds
    overwriteId: null,
};

/**
 * Transition duration for impact changes (in milliseconds)
 */
export const TRANSITION_DURATION = 300;

/**
 * Keyboard shortcuts
 */
export const KEYBOARD_SHORTCUTS = {
    NEXT_IMPACT: ['ArrowRight'] as const,
    PREV_IMPACT: ['ArrowLeft'] as const,
    JUMP_TO_INDEX: ['j', 'J'] as const,
} as const;
