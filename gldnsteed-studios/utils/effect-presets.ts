import { ClipFilters, Transition } from '../types';

/**
 * Effect Preset System
 * Allows users to save and reuse effect combinations
 */

export interface EffectPreset {
    id: string;
    name: string;
    category: 'default' | 'user' | 'favorite';
    filters?: Partial<ClipFilters>;
    transform?: {
        position?: { x: number; y: number };
        scale?: number;
        rotation?: number;
        opacity?: number;
    };
    transition?: Transition;
    thumbnail?: string;
    isFavorite: boolean;
    createdAt: number;
}

const STORAGE_KEY = 'gldnsteed_effect_presets';
const FAVORITES_KEY = 'gldnsteed_favorite_effects';

/**
 * Save an effect preset
 */
export function saveEffectPreset(preset: Omit<EffectPreset, 'id' | 'createdAt'>): EffectPreset {
    const presets = loadEffectPresets();

    const newPreset: EffectPreset = {
        ...preset,
        id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: Date.now()
    };

    presets.push(newPreset);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));

    return newPreset;
}

/**
 * Load all effect presets
 */
export function loadEffectPresets(): EffectPreset[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

/**
 * Delete an effect preset
 */
export function deleteEffectPreset(id: string): void {
    const presets = loadEffectPresets();
    const filtered = presets.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Update an effect preset
 */
export function updateEffectPreset(id: string, updates: Partial<EffectPreset>): void {
    const presets = loadEffectPresets();
    const index = presets.findIndex(p => p.id === id);

    if (index >= 0) {
        presets[index] = { ...presets[index], ...updates };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
    }
}

/**
 * Toggle favorite status
 */
export function toggleFavorite(effectName: string): void {
    const favorites = getFavorites();
    const index = favorites.indexOf(effectName);

    if (index >= 0) {
        favorites.splice(index, 1);
    } else {
        favorites.push(effectName);
    }

    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

/**
 * Get favorite effect names
 */
export function getFavorites(): string[] {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
}

/**
 * Check if effect is favorited
 */
export function isFavorite(effectName: string): boolean {
    return getFavorites().includes(effectName);
}

/**
 * Sort effects with favorites first
 */
export function sortEffectsWithFavorites<T extends { name: string }>(
    effects: T[]
): T[] {
    const favorites = getFavorites();

    return [...effects].sort((a, b) => {
        const aFav = favorites.includes(a.name);
        const bFav = favorites.includes(b.name);

        if (aFav && !bFav) return -1;
        if (!aFav && bFav) return 1;
        return 0;
    });
}
