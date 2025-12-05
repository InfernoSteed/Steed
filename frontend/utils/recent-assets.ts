/**
 * Recently Used Items Tracker
 * Track recently used assets for quick access
 */

import { Asset } from '../types';

const STORAGE_KEY = 'gldnsteed_recent_assets';
const MAX_RECENT = 10;

/**
 * Load recent assets
 */
export function loadRecentAssets(): Asset[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

/**
 * Save recent assets
 */
export function saveRecentAssets(assets: Asset[]): void {
    const trimmed = assets.slice(0, MAX_RECENT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

/**
 * Add asset to recent list
 */
export function addRecentAsset(asset: Asset): Asset[] {
    const recent = loadRecentAssets();

    // Remove if already exists
    const filtered = recent.filter(a => a.id !== asset.id);

    // Add to front
    const updated = [asset, ...filtered].slice(0, MAX_RECENT);

    saveRecentAssets(updated);
    return updated;
}

/**
 * Clear recent assets
 */
export function clearRecentAssets(): void {
    localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get recent assets by type
 */
export function getRecentAssetsByType(type: Asset['type']): Asset[] {
    const recent = loadRecentAssets();
    return recent.filter(a => a.type === type);
}
