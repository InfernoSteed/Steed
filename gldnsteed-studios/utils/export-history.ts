/**
 * Export History Management
 * Track all exports with ability to re-export
 */

import { ExportRecord, ExportSettings } from '../types';

const STORAGE_KEY = 'gldnsteed_export_history';
const MAX_HISTORY = 50;

/**
 * Load export history
 */
export function loadExportHistory(): ExportRecord[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

/**
 * Save export history
 */
export function saveExportHistory(history: ExportRecord[]): void {
    // Keep only last MAX_HISTORY records
    const trimmed = history.slice(0, MAX_HISTORY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

/**
 * Add export to history
 */
export function addExportRecord(
    projectName: string,
    settings: ExportSettings,
    duration: number,
    fileSize: string
): ExportRecord[] {
    const history = loadExportHistory();

    const record: ExportRecord = {
        id: `record-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        projectName,
        settings,
        duration,
        fileSize
    };

    const updated = [record, ...history];
    saveExportHistory(updated);

    return updated;
}

/**
 * Delete export record
 */
export function deleteExportRecord(recordId: string): ExportRecord[] {
    const history = loadExportHistory();
    const updated = history.filter(r => r.id !== recordId);
    saveExportHistory(updated);
    return updated;
}

/**
 * Clear all history
 */
export function clearExportHistory(): void {
    localStorage.removeItem(STORAGE_KEY);
}

/**
 * Search history
 */
export function searchExportHistory(query: string): ExportRecord[] {
    const history = loadExportHistory();
    const lowerQuery = query.toLowerCase();

    return history.filter(record =>
        record.projectName.toLowerCase().includes(lowerQuery) ||
        record.settings.format.toLowerCase().includes(lowerQuery)
    );
}

/**
 * Get recent exports (last N)
 */
export function getRecentExports(count: number = 10): ExportRecord[] {
    const history = loadExportHistory();
    return history.slice(0, count);
}

/**
 * Format timestamp
 */
export function formatExportDate(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    // Less than 1 hour
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }

    // Less than 24 hours
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }

    // Less than 7 days
    if (diff < 604800000) {
        const days = Math.floor(diff / 86400000);
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    }

    // Format as date
    return date.toLocaleDateString();
}
