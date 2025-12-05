/**
 * Advanced Selection Tools
 * Smart clip selection based on various criteria
 */

import { Clip, Track, ClipFilters } from '../types';

export type SelectionMode = 'similar' | 'track' | 'effect' | 'duration' | 'type';

/**
 * Select clips from the same asset
 */
export function selectSimilar(
    clipId: string,
    tracks: Track[]
): string[] {
    const sourceClip = findClip(clipId, tracks);
    if (!sourceClip) return [];

    const allClips = tracks.flatMap(t => t.clips);
    return allClips
        .filter(c => c.assetId === sourceClip.assetId)
        .map(c => c.id);
}

/**
 * Select all clips on a specific track
 */
export function selectByTrack(
    trackId: string,
    tracks: Track[]
): string[] {
    const track = tracks.find(t => t.id === trackId);
    return track ? track.clips.map(c => c.id) : [];
}

/**
 * Select clips with a specific effect applied
 */
export function selectByEffect(
    filterKey: keyof ClipFilters,
    defaultValue: number | string,
    tracks: Track[]
): string[] {
    const allClips = tracks.flatMap(t => t.clips);

    return allClips
        .filter(c => {
            if (!c.filters) return false;
            const value = c.filters[filterKey];
            return value !== undefined && value !== defaultValue;
        })
        .map(c => c.id);
}

/**
 * Select clips within a duration range
 */
export function selectByDuration(
    minDuration: number,
    maxDuration: number,
    tracks: Track[]
): string[] {
    const allClips = tracks.flatMap(t => t.clips);

    return allClips
        .filter(c => c.duration >= minDuration && c.duration <= maxDuration)
        .map(c => c.id);
}

/**
 * Select clips of a specific type
 */
export function selectByType(
    type: 'video' | 'audio' | 'image' | 'text',
    tracks: Track[]
): string[] {
    const allClips = tracks.flatMap(t => t.clips);
    return allClips
        .filter(c => c.type === type)
        .map(c => c.id);
}

/**
 * Invert current selection
 */
export function invertSelection(
    currentSelection: string[],
    tracks: Track[]
): string[] {
    const allClipIds = tracks.flatMap(t => t.clips.map(c => c.id));
    return allClipIds.filter(id => !currentSelection.includes(id));
}

/**
 * Select clips in a time range
 */
export function selectInTimeRange(
    startTime: number,
    endTime: number,
    tracks: Track[]
): string[] {
    const allClips = tracks.flatMap(t => t.clips);

    return allClips
        .filter(c => {
            const clipEnd = c.startTime + c.duration;
            // Clip overlaps with time range
            return c.startTime < endTime && clipEnd > startTime;
        })
        .map(c => c.id);
}

/**
 * Select clips with keyframes
 */
export function selectWithKeyframes(tracks: Track[]): string[] {
    const allClips = tracks.flatMap(t => t.clips);

    return allClips
        .filter(c => c.keyframes && Object.keys(c.keyframes).length > 0)
        .map(c => c.id);
}

/**
 * Select clips with transitions
 */
export function selectWithTransitions(tracks: Track[]): string[] {
    const allClips = tracks.flatMap(t => t.clips);

    return allClips
        .filter(c => c.transition && c.transition.type !== 'none')
        .map(c => c.id);
}

/**
 * Helper: Find a clip by ID
 */
function findClip(clipId: string, tracks: Track[]): Clip | null {
    for (const track of tracks) {
        const clip = track.clips.find(c => c.id === clipId);
        if (clip) return clip;
    }
    return null;
}

/**
 * Add clips to selection (union)
 */
export function addToSelection(
    current: string[],
    toAdd: string[]
): string[] {
    const set = new Set([...current, ...toAdd]);
    return Array.from(set);
}

/**
 * Remove clips from selection
 */
export function removeFromSelection(
    current: string[],
    toRemove: string[]
): string[] {
    return current.filter(id => !toRemove.includes(id));
}

/**
 * Toggle clip in selection
 */
export function toggleInSelection(
    current: string[],
    clipId: string
): string[] {
    if (current.includes(clipId)) {
        return current.filter(id => id !== clipId);
    } else {
        return [...current, clipId];
    }
}

/**
 * Select range between two clips
 */
export function selectRange(
    startClipId: string,
    endClipId: string,
    tracks: Track[]
): string[] {
    const allClips = tracks.flatMap(t => t.clips);

    const startClip = allClips.find(c => c.id === startClipId);
    const endClip = allClips.find(c => c.id === endClipId);

    if (!startClip || !endClip) return [];

    const minTime = Math.min(startClip.startTime, endClip.startTime);
    const maxTime = Math.max(
        startClip.startTime + startClip.duration,
        endClip.startTime + endClip.duration
    );

    return selectInTimeRange(minTime, maxTime, tracks);
}
