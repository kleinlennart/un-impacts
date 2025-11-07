import type { Impact, ImpactStats } from '@/lib/types/impact';

/**
 * Base path for data files - adjusts based on environment
 */
const getBasePath = (): string => {
    if (typeof window === 'undefined') {
        // Server-side: use relative path during build
        return '';
    }
    // Client-side: use basePath if in production
    return process.env.NODE_ENV === 'production' ? '/un-impacts' : '';
};

/**
 * Fetches all impacts from the static JSON file
 * @returns Promise resolving to array of Impact objects
 * @throws Error if fetch fails or JSON is invalid
 */
export async function fetchImpacts(): Promise<Impact[]> {
    const basePath = getBasePath();
    const response = await fetch(`${basePath}/data/impacts.json`, {
        cache: 'no-store',
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch impacts: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Validate that we received an array
    if (!Array.isArray(data)) {
        throw new Error('Invalid impacts data: expected an array');
    }

    return data as Impact[];
}

/**
 * Fetches a single impact by ID
 * @param id - The impact ID to fetch
 * @returns Promise resolving to Impact object or null if not found
 */
export async function fetchImpactById(id: number): Promise<Impact | null> {
    const impacts = await fetchImpacts();
    return impacts.find(impact => impact.id === id) || null;
}

/**
 * Filters impacts by entity name
 * @param entity - The entity name to filter by
 * @returns Promise resolving to array of matching Impact objects
 */
export async function fetchImpactsByEntity(entity: string): Promise<Impact[]> {
    const impacts = await fetchImpacts();
    return impacts.filter(impact => impact.entity === entity);
}

/**
 * Gets statistics about the impacts data
 * @returns Promise resolving to ImpactStats object
 */
export async function getImpactStats(): Promise<ImpactStats> {
    const impacts = await fetchImpacts();
    const entities = [...new Set(impacts.map(impact => impact.entity))];

    return {
        total: impacts.length,
        uniqueEntities: entities.length,
        entities: entities.sort(),
    };
}

/**
 * Validates an impact object has all required fields
 * @param impact - Object to validate
 * @returns true if valid, false otherwise
 */
export function isValidImpact(impact: unknown): impact is Impact {
    if (typeof impact !== 'object' || impact === null) {
        return false;
    }

    const i = impact as Partial<Impact>;

    return (
        typeof i.id === 'number' &&
        typeof i.entity === 'string' &&
        typeof i.highlight === 'string' &&
        typeof i.impact === 'string'
    );
}

/**
 * Gets a random impact from the list, optionally excluding certain impacts
 * @param impacts - Array of impacts to choose from
 * @param exclude - Optional impact to exclude (e.g., current impact)
 * @returns Random impact or null if no impacts available
 */
export function getRandomImpact(
    impacts: Impact[],
    exclude?: Impact
): Impact | null {
    if (impacts.length === 0) {
        return null;
    }

    if (impacts.length === 1) {
        return impacts[0];
    }

    // Filter out impacts with same sentence or entity as excluded impact
    let availableImpacts = impacts;
    if (exclude) {
        availableImpacts = impacts.filter(
            impact =>
                impact.impact !== exclude.impact &&
                impact.entity !== exclude.entity
        );
    }

    // Fallback to all impacts if filtering left us with none
    if (availableImpacts.length === 0) {
        availableImpacts = impacts.filter(impact => impact.id !== exclude?.id);
    }

    // Final fallback
    if (availableImpacts.length === 0) {
        availableImpacts = impacts;
    }

    const randomIndex = Math.floor(Math.random() * availableImpacts.length);
    return availableImpacts[randomIndex];
}

/**
 * Gets the next impact in sequential order
 * @param impacts - Array of all impacts
 * @param currentIndex - Current impact index
 * @returns Next impact and its index
 */
export function getNextImpact(
    impacts: Impact[],
    currentIndex: number
): { impact: Impact; index: number } {
    if (impacts.length === 0) {
        throw new Error('No impacts available');
    }

    const nextIndex = (currentIndex + 1) % impacts.length;
    return {
        impact: impacts[nextIndex],
        index: nextIndex,
    };
}
