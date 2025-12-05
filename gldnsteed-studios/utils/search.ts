/**
 * Search Utility
 * Search clips by various criteria
 */

import { Track, Clip } from '../types';

export interface SearchFilters {
    text?: string;
    type?: 'video' | 'audio' | 'image' | 'text';
    minDuration?: number;
    maxDuration?: number;
    labelColor?: string;
    hasEffects?: boolean;
    hasKeyframes?: boolean;
    hasTransition?: boolean;
}

/**
 * Search clips across all tracks
 */
export function searchClips(tracks: Track[], filters: SearchFilters): Clip[] {
    let results: Clip[] = [];

    // Collect all clips
    tracks.forEach(track => {
        track.clips.forEach(clip => {
            results.push(clip);
        });
    });

    // Apply filters
    if (filters.text) {
        const lowerText = filters.text.toLowerCase();
        results = results.filter(clip =>
            clip.name.toLowerCase().includes(lowerText) ||
            (clip.content && clip.content.toLowerCase().includes(lowerText))
        );
    }

    if (filters.type) {
        results = results.filter(clip => clip.type === filters.type);
    }

    if (filters.minDuration !== undefined) {
        results = results.filter(clip => clip.duration >= filters.minDuration!);
    }

    if (filters.maxDuration !== undefined) {
        results = results.filter(clip => clip.duration <= filters.maxDuration!);
    }

    if (filters.labelColor) {
        results = results.filter(clip => clip.labelColor === filters.labelColor);
    }

    if (filters.hasEffects) {
        results = results.filter(clip => clip.filters && Object.keys(clip.filters).length > 0);
    }

    if (filters.hasKeyframes) {
        results = results.filter(clip => clip.keyframes && Object.keys(clip.keyframes).length > 0);
    }

    if (filters.hasTransition) {
        results = results.filter(clip => clip.transition !== undefined);
    }

    return results;
}

/**
 * Get clip IDs from search results
 */
export function getClipIds(clips: Clip[]): string[] {
    return clips.map(clip => clip.id);
}

/**
 * Highlight clips on timeline
 */
export function highlightClips(clipIds: string[]): void {
    // This would be implemented in the Timeline component
    // For now, just return the IDs
}

/**
 * Parse duration query (e.g., "5-10" or ">5" or "<10")
 */
export function parseDurationQuery(query: string): { min?: number; max?: number } | null {
    // Range: "5-10"
    const rangeMatch = query.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) {
        return {
            min: parseInt(rangeMatch[1]),
            max: parseInt(rangeMatch[2])
        };
    }

    // Greater than: ">5"
    const gtMatch = query.match(/^>(\d+)$/);
    if (gtMatch) {
        return { min: parseInt(gtMatch[1]) };
    }

    // Less than: "<10"
    const ltMatch = query.match(/^<(\d+)$/);
    if (ltMatch) {
        return { max: parseInt(ltMatch[1]) };
    }

    // Exact: "5"
    const exactMatch = query.match(/^(\d+)$/);
    if (exactMatch) {
        const value = parseInt(exactMatch[1]);
        return { min: value, max: value };
    }

    return null;
}

/**
 * Get search suggestions
 */
export function getSearchSuggestions(tracks: Track[], query: string): string[] {
    const suggestions: Set<string> = new Set();

    tracks.forEach(track => {
        track.clips.forEach(clip => {
            if (clip.name.toLowerCase().includes(query.toLowerCase())) {
                suggestions.add(clip.name);
            }
        });
    });

    return Array.from(suggestions).slice(0, 5);
}
