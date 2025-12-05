/**
 * Batch Operations Utility
 * Apply effects, transforms, and properties to multiple clips at once
 */

import { Clip, ClipFilters, Transition } from '../types';

export interface BatchOperation {
    type: 'filters' | 'transform' | 'transition' | 'audio' | 'text';
    data: any;
}

export interface BatchProgress {
    current: number;
    total: number;
    operation: string;
}

/**
 * Apply filters to multiple clips
 */
export function batchApplyFilters(
    clips: Clip[],
    filters: Partial<ClipFilters>,
    onProgress?: (progress: BatchProgress) => void
): Clip[] {
    return clips.map((clip, index) => {
        if (onProgress) {
            onProgress({
                current: index + 1,
                total: clips.length,
                operation: `Applying filters to ${clip.name}`
            });
        }

        return {
            ...clip,
            filters: {
                ...clip.filters,
                ...filters
            }
        };
    });
}

/**
 * Apply transform to multiple clips
 */
export function batchApplyTransform(
    clips: Clip[],
    transform: {
        position?: { x: number; y: number };
        scale?: number;
        rotation?: number;
        opacity?: number;
    },
    onProgress?: (progress: BatchProgress) => void
): Clip[] {
    return clips.map((clip, index) => {
        if (onProgress) {
            onProgress({
                current: index + 1,
                total: clips.length,
                operation: `Applying transform to ${clip.name}`
            });
        }

        const updated = { ...clip };

        if (transform.position) updated.position = transform.position;
        if (transform.scale !== undefined) updated.scale = transform.scale;
        if (transform.rotation !== undefined) updated.rotation = transform.rotation;
        if (transform.opacity !== undefined) updated.opacity = transform.opacity;

        return updated;
    });
}

/**
 * Apply transition to multiple clips
 */
export function batchApplyTransition(
    clips: Clip[],
    transition: Transition,
    onProgress?: (progress: BatchProgress) => void
): Clip[] {
    return clips.map((clip, index) => {
        if (onProgress) {
            onProgress({
                current: index + 1,
                total: clips.length,
                operation: `Applying transition to ${clip.name}`
            });
        }

        return {
            ...clip,
            transition
        };
    });
}

/**
 * Apply audio properties to multiple clips
 */
export function batchApplyAudio(
    clips: Clip[],
    audio: {
        volume?: number;
        pan?: number;
        fadeIn?: number;
        fadeOut?: number;
    },
    onProgress?: (progress: BatchProgress) => void
): Clip[] {
    return clips.map((clip, index) => {
        if (onProgress) {
            onProgress({
                current: index + 1,
                total: clips.length,
                operation: `Applying audio to ${clip.name}`
            });
        }

        const updated = { ...clip };

        if (audio.volume !== undefined) updated.volume = audio.volume;
        if (audio.pan !== undefined) updated.pan = audio.pan;
        if (audio.fadeIn !== undefined) updated.fadeIn = audio.fadeIn;
        if (audio.fadeOut !== undefined) updated.fadeOut = audio.fadeOut;

        return updated;
    });
}

/**
 * Apply text properties to multiple text clips
 */
export function batchApplyText(
    clips: Clip[],
    text: {
        fontFamily?: string;
        fontSize?: number;
        color?: string;
        fontWeight?: string;
        fontStyle?: string;
        textAlign?: 'left' | 'center' | 'right';
        backgroundColor?: string;
        backgroundPadding?: number;
    },
    onProgress?: (progress: BatchProgress) => void
): Clip[] {
    return clips.map((clip, index) => {
        if (clip.type !== 'text') return clip;

        if (onProgress) {
            onProgress({
                current: index + 1,
                total: clips.length,
                operation: `Applying text properties to ${clip.name}`
            });
        }

        return {
            ...clip,
            ...text
        };
    });
}

/**
 * Reset properties on multiple clips
 */
export function batchReset(
    clips: Clip[],
    properties: ('filters' | 'transform' | 'audio' | 'text')[],
    defaultFilters: ClipFilters,
    onProgress?: (progress: BatchProgress) => void
): Clip[] {
    return clips.map((clip, index) => {
        if (onProgress) {
            onProgress({
                current: index + 1,
                total: clips.length,
                operation: `Resetting ${clip.name}`
            });
        }

        const updated = { ...clip };

        if (properties.includes('filters')) {
            updated.filters = { ...defaultFilters };
        }

        if (properties.includes('transform')) {
            updated.position = { x: 0, y: 0 };
            updated.scale = 1;
            updated.rotation = 0;
            updated.opacity = 1;
        }

        if (properties.includes('audio')) {
            updated.volume = 1;
            updated.pan = 0;
            updated.fadeIn = 0;
            updated.fadeOut = 0;
        }

        if (properties.includes('text') && clip.type === 'text') {
            updated.fontSize = 60;
            updated.fontFamily = 'Arial';
            updated.color = '#ffffff';
            updated.fontWeight = 'bold';
            updated.textAlign = 'center';
        }

        return updated;
    });
}
