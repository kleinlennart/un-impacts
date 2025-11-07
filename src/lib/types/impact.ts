/**
 * Represents a single UN impact record
 */
export interface Impact {
    /** Unique identifier for the impact */
    id: number;
    /** UN entity responsible for the impact (e.g., "UNICEF", "WHO", "UNDP") */
    entity: string;
    /** Text to highlight in the impact description (typically the entity name or specific program) */
    highlight: string;
    /** Description of the impact achieved */
    impact: string;
}

/**
 * Configuration for impact display and navigation
 */
export interface ImpactDisplayConfig {
    /** Whether to show impacts sequentially (true) or randomly (false) */
    sequentialMode: boolean;
    /** Interval in milliseconds for auto-advancing to next impact */
    autoAdvanceInterval: number;
    /** If set, only show the impact with this specific ID */
    overwriteId: number | null;
}

/**
 * Statistics about the impacts data
 */
export interface ImpactStats {
    /** Total number of impacts */
    total: number;
    /** Number of unique UN entities */
    uniqueEntities: number;
    /** List of all unique entity names */
    entities: string[];
}
