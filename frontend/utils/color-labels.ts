/**
 * Color Labels for Clips
 * Predefined colors for visual organization
 */

export const LABEL_COLORS = {
    red: '#EF4444',
    orange: '#F97316',
    yellow: '#EAB308',
    green: '#22C55E',
    blue: '#3B82F6',
    purple: '#A855F7',
    pink: '#EC4899',
    gray: '#6B7280'
};

export type LabelColor = keyof typeof LABEL_COLORS;

/**
 * Get all label colors
 */
export function getAllLabelColors(): Array<{ name: LabelColor; hex: string }> {
    return Object.entries(LABEL_COLORS).map(([name, hex]) => ({
        name: name as LabelColor,
        hex
    }));
}

/**
 * Get label color hex
 */
export function getLabelColorHex(color: LabelColor): string {
    return LABEL_COLORS[color];
}

/**
 * Get label color name from hex
 */
export function getLabelColorName(hex: string): LabelColor | null {
    const entry = Object.entries(LABEL_COLORS).find(([_, h]) => h === hex);
    return entry ? (entry[0] as LabelColor) : null;
}
