
import { AnimatableProperty } from '../types';

export interface SavedMotionPreset {
  id: string;
  name: string;
  data: {
      [key in AnimatableProperty]?: { timeRatio: number, value: number }[];
  };
}

const KEY = 'vf_custom_motion_presets';

export const getSavedMotionPresets = (): SavedMotionPreset[] => {
    try {
        const data = localStorage.getItem(KEY);
        return data ? JSON.parse(data) : [];
    } catch { 
        return []; 
    }
};

export const saveMotionPreset = (preset: SavedMotionPreset) => {
    const current = getSavedMotionPresets();
    localStorage.setItem(KEY, JSON.stringify([...current, preset]));
};

export const deleteMotionPreset = (id: string) => {
    const current = getSavedMotionPresets();
    localStorage.setItem(KEY, JSON.stringify(current.filter(p => p.id !== id)));
};

// Recent Properties Logic
export interface RecentProperty {
    id: string; // Unique key mostly derived from label slug
    label: string;
    value: string;
    timestamp: number;
    sectionTitle: string;
    elementId: string;
}

const RECENT_KEY = 'vf_recent_properties';

export const getRecentProperties = (): RecentProperty[] => {
    try {
        const data = localStorage.getItem(RECENT_KEY);
        return data ? JSON.parse(data) : [];
    } catch { return []; }
};

export const addRecentProperty = (prop: Omit<RecentProperty, 'timestamp'>): RecentProperty[] => {
    const current = getRecentProperties();
    // Remove if exists to bubble to top
    const filtered = current.filter(p => p.id !== prop.id);
    
    const newProp: RecentProperty = { ...prop, timestamp: Date.now() };
    const updated = [newProp, ...filtered].slice(0, 5);
    
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    return updated;
};

// Recent Colors
const COLORS_KEY = 'vf_recent_colors';
export const getRecentColors = (): string[] => {
    try {
        const data = localStorage.getItem(COLORS_KEY);
        return data ? JSON.parse(data) : ['#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff'];
    } catch { return []; }
};

export const addRecentColor = (color: string) => {
    const current = getRecentColors();
    const filtered = current.filter(c => c.toLowerCase() !== color.toLowerCase());
    const updated = [color, ...filtered].slice(0, 8);
    localStorage.setItem(COLORS_KEY, JSON.stringify(updated));
    return updated;
};

// Custom Property Groups
export interface CustomPropertyGroup {
    id: string;
    name: string;
    properties: string[]; // List of property IDs (e.g., 'transform-scale')
}

const GROUPS_KEY = 'vf_custom_property_groups';

export const getCustomPropertyGroups = (): CustomPropertyGroup[] => {
    try {
        const data = localStorage.getItem(GROUPS_KEY);
        return data ? JSON.parse(data) : [];
    } catch { return []; }
};

export const saveCustomPropertyGroup = (group: CustomPropertyGroup) => {
    const current = getCustomPropertyGroups();
    localStorage.setItem(GROUPS_KEY, JSON.stringify([...current, group]));
};

export const deleteCustomPropertyGroup = (id: string) => {
    const current = getCustomPropertyGroups();
    localStorage.setItem(GROUPS_KEY, JSON.stringify(current.filter(g => g.id !== id)));
};
