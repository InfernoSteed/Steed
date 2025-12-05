/**
 * Keyboard Shortcut System
 * Centralized management of all keyboard shortcuts
 */

export type ShortcutCategory = 'playback' | 'editing' | 'navigation' | 'tools' | 'markers' | 'effects';

export interface Shortcut {
    id: string;
    key: string;
    modifiers?: ('ctrl' | 'shift' | 'alt' | 'meta')[];
    description: string;
    category: ShortcutCategory;
    action?: () => void;
}

export interface ShortcutScheme {
    name: string;
    shortcuts: Shortcut[];
}

const STORAGE_KEY = 'gldnsteed_shortcuts';

/**
 * Default keyboard shortcuts
 */
export const DEFAULT_SHORTCUTS: Shortcut[] = [
    // Playback
    { id: 'play-pause', key: 'Space', description: 'Play/Pause', category: 'playback' },
    { id: 'stop', key: 'Escape', description: 'Stop', category: 'playback' },
    { id: 'pause-reset', key: 'k', description: 'Pause/Reset Speed', category: 'playback' },
    { id: 'forward', key: 'l', description: 'Play Forward (Rate)', category: 'playback' },
    { id: 'rewind', key: 'j', description: 'Play Reverse (Rate)', category: 'playback' },
    { id: 'step-forward', key: 'ArrowRight', description: 'Step Forward 1 Frame', category: 'playback' },
    { id: 'step-backward', key: 'ArrowLeft', description: 'Step Backward 1 Frame', category: 'playback' },

    // Editing
    { id: 'undo', key: 'z', modifiers: ['ctrl'], description: 'Undo', category: 'editing' },
    { id: 'redo', key: 'y', modifiers: ['ctrl'], description: 'Redo', category: 'editing' },
    { id: 'split', key: 's', description: 'Split Clip', category: 'editing' },
    { id: 'delete', key: 'Delete', description: 'Delete Clip', category: 'editing' },
    { id: 'ripple-delete', key: 'Delete', modifiers: ['shift'], description: 'Ripple Delete', category: 'editing' },
    { id: 'duplicate', key: 'd', modifiers: ['ctrl'], description: 'Duplicate Clip', category: 'editing' },
    { id: 'copy-props', key: 'c', modifiers: ['ctrl', 'shift'], description: 'Copy Properties', category: 'editing' },
    { id: 'paste-props', key: 'v', modifiers: ['ctrl', 'shift'], description: 'Paste Properties', category: 'editing' },

    // Navigation
    { id: 'add-marker', key: 'm', description: 'Add Marker', category: 'navigation' },
    { id: 'next-marker', key: 'n', modifiers: ['shift'], description: 'Next Marker', category: 'navigation' },
    { id: 'prev-marker', key: 'p', modifiers: ['shift'], description: 'Previous Marker', category: 'navigation' },

    // Tools
    { id: 'select-tool', key: 'v', description: 'Select Tool', category: 'tools' },
    { id: 'razor-tool', key: 'c', description: 'Razor Tool', category: 'tools' },
    { id: 'hand-tool', key: 'h', description: 'Hand Tool', category: 'tools' },
    { id: 'zoom-tool', key: 'z', description: 'Zoom Tool', category: 'tools' },

    // Clip Markers (1-9)
    { id: 'marker-1', key: '1', description: 'Add Red Marker', category: 'markers' },
    { id: 'marker-2', key: '2', description: 'Add Orange Marker', category: 'markers' },
    { id: 'marker-3', key: '3', description: 'Add Yellow Marker', category: 'markers' },
    { id: 'marker-4', key: '4', description: 'Add Green Marker', category: 'markers' },
    { id: 'marker-5', key: '5', description: 'Add Blue Marker', category: 'markers' },
    { id: 'marker-6', key: '6', description: 'Add Purple Marker', category: 'markers' },
    { id: 'marker-7', key: '7', description: 'Add Pink Marker', category: 'markers' },
    { id: 'marker-8', key: '8', description: 'Add Gray Marker', category: 'markers' },
    { id: 'marker-9', key: '9', description: 'Add White Marker', category: 'markers' },

    // Effects
    { id: 'toggle-effects', key: 'e', modifiers: ['ctrl'], description: 'Toggle Effects Panel', category: 'effects' },
    { id: 'reset-effects', key: 'r', modifiers: ['ctrl'], description: 'Reset Effects', category: 'effects' },

    // Help
    { id: 'show-shortcuts', key: '?', description: 'Show Keyboard Shortcuts', category: 'navigation' },
];

/**
 * Marker colors for keyboard shortcuts 1-9
 */
export const MARKER_COLORS = [
    '#EF4444', // 1 - Red
    '#F97316', // 2 - Orange
    '#EAB308', // 3 - Yellow
    '#22C55E', // 4 - Green
    '#3B82F6', // 5 - Blue
    '#A855F7', // 6 - Purple
    '#EC4899', // 7 - Pink
    '#6B7280', // 8 - Gray
    '#F3F4F6', // 9 - White
];

/**
 * Get marker color by number (1-9)
 */
export function getMarkerColor(num: number): string {
    if (num < 1 || num > 9) return MARKER_COLORS[0];
    return MARKER_COLORS[num - 1];
}

/**
 * Load custom shortcuts
 */
export function loadShortcuts(): Shortcut[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_SHORTCUTS;
}

/**
 * Save custom shortcuts
 */
export function saveShortcuts(shortcuts: Shortcut[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shortcuts));
}

/**
 * Reset to default shortcuts
 */
export function resetShortcuts(): void {
    localStorage.removeItem(STORAGE_KEY);
}

/**
 * Check if shortcut conflicts with existing
 */
export function hasConflict(
    shortcut: Shortcut,
    existing: Shortcut[]
): Shortcut | null {
    return existing.find(s =>
        s.id !== shortcut.id &&
        s.key.toLowerCase() === shortcut.key.toLowerCase() &&
        JSON.stringify(s.modifiers?.sort()) === JSON.stringify(shortcut.modifiers?.sort())
    ) || null;
}

/**
 * Format shortcut for display
 */
export function formatShortcut(shortcut: Shortcut): string {
    const parts: string[] = [];

    if (shortcut.modifiers) {
        shortcut.modifiers.forEach(mod => {
            switch (mod) {
                case 'ctrl':
                case 'meta':
                    parts.push('Ctrl');
                    break;
                case 'shift':
                    parts.push('Shift');
                    break;
                case 'alt':
                    parts.push('Alt');
                    break;
            }
        });
    }

    parts.push(shortcut.key);

    return parts.join('+');
}

/**
 * Check if event matches shortcut
 */
export function matchesShortcut(event: KeyboardEvent, shortcut: Shortcut): boolean {
    const key = event.key.toLowerCase();
    const shortcutKey = shortcut.key.toLowerCase();

    if (key !== shortcutKey && event.code.toLowerCase() !== shortcutKey.toLowerCase()) {
        return false;
    }

    const modifiers = shortcut.modifiers || [];
    const hasCtrl = event.ctrlKey || event.metaKey;
    const hasShift = event.shiftKey;
    const hasAlt = event.altKey;

    const needsCtrl = modifiers.includes('ctrl') || modifiers.includes('meta');
    const needsShift = modifiers.includes('shift');
    const needsAlt = modifiers.includes('alt');

    return hasCtrl === needsCtrl && hasShift === needsShift && hasAlt === needsAlt;
}
