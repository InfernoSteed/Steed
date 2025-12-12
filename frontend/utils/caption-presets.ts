import { CaptionPreset } from '../types';

/**
 * Default caption style presets
 */
export const DEFAULT_CAPTION_PRESETS: CaptionPreset[] = [
    {
        id: 'classic',
        name: 'Classic',
        fontFamily: 'Arial, sans-serif',
        fontSize: 32,
        color: '#ffffff',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backgroundPadding: 12,
        position: 'bottom',
        animation: {
            entranceType: 'fade',
            entranceDuration: 0.2,
            exitType: 'fade',
            exitDuration: 0.2
        }
    },
    {
        id: 'modern',
        name: 'Modern',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 36,
        color: '#ffffff',
        backgroundColor: 'rgba(139, 92, 246, 0.9)',
        backgroundPadding: 16,
        position: 'center',
        animation: {
            entranceType: 'slide-up',
            entranceDuration: 0.3,
            exitType: 'slide-out',
            exitDuration: 0.3
        }
    },
    {
        id: 'minimal',
        name: 'Minimal',
        fontFamily: 'Helvetica, Arial, sans-serif',
        fontSize: 24,
        color: '#ffffff',
        backgroundColor: 'transparent',
        backgroundPadding: 0,
        position: 'top',
        animation: {
            entranceType: 'fade',
            entranceDuration: 0.15,
            exitType: 'fade',
            exitDuration: 0.15
        }
    },
    {
        id: 'cinematic',
        name: 'Cinematic',
        fontFamily: 'Georgia, serif',
        fontSize: 28,
        color: '#f5f5f5',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backgroundPadding: 14,
        position: 'bottom',
        animation: {
            entranceType: 'fade',
            entranceDuration: 0.4,
            exitType: 'dissolve',
            exitDuration: 0.4
        }
    },
    {
        id: 'social',
        name: 'Social Media',
        fontFamily: 'Impact, sans-serif',
        fontSize: 42,
        color: '#ffff00',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        backgroundPadding: 18,
        position: 'center',
        animation: {
            entranceType: 'zoom',
            entranceDuration: 0.25,
            exitType: 'zoom-out',
            exitDuration: 0.25
        }
    }
];

/**
 * Get caption preset by ID
 */
export function getCaptionPreset(id: string): CaptionPreset | undefined {
    return DEFAULT_CAPTION_PRESETS.find(preset => preset.id === id);
}

/**
 * Save custom caption preset to storage
 */
export function saveCaptionPreset(preset: CaptionPreset): void {
    const customPresets = loadCustomCaptionPresets();
    const existingIndex = customPresets.findIndex(p => p.id === preset.id);

    if (existingIndex >= 0) {
        customPresets[existingIndex] = preset;
    } else {
        customPresets.push(preset);
    }

    localStorage.setItem('customCaptionPresets', JSON.stringify(customPresets));
}

/**
 * Load custom caption presets from storage
 */
export function loadCustomCaptionPresets(): CaptionPreset[] {
    const stored = localStorage.getItem('customCaptionPresets');
    return stored ? JSON.parse(stored) : [];
}

/**
 * Get all caption presets (default + custom)
 */
export function getAllCaptionPresets(): CaptionPreset[] {
    return [...DEFAULT_CAPTION_PRESETS, ...loadCustomCaptionPresets()];
}

/**
 * Delete custom caption preset
 */
export function deleteCaptionPreset(id: string): void {
    const customPresets = loadCustomCaptionPresets();
    const filtered = customPresets.filter(p => p.id !== id);
    localStorage.setItem('customCaptionPresets', JSON.stringify(filtered));
}
