import { ExportSettings } from '../types';

/**
 * Platform-specific export presets
 */

export interface PlatformPreset {
    id: string;
    name: string;
    icon: string;
    width: number;
    height: number;
    fps: 24 | 30 | 60;
    quality: 'low' | 'medium' | 'high';
    format: 'webm' | 'mp4';
    description: string;
    aspectRatio: string;
}

export const PLATFORM_PRESETS: Record<string, PlatformPreset> = {
    youtube: {
        id: 'youtube',
        name: 'YouTube',
        icon: '▶️',
        width: 1920,
        height: 1080,
        fps: 30,
        quality: 'high',
        format: 'mp4',
        description: 'Full HD 1080p for YouTube',
        aspectRatio: '16:9'
    },
    youtube4k: {
        id: 'youtube4k',
        name: 'YouTube 4K',
        icon: '🎬',
        width: 3840,
        height: 2160,
        fps: 60,
        quality: 'high',
        format: 'mp4',
        description: 'Ultra HD 4K 60fps for YouTube',
        aspectRatio: '16:9'
    },
    instagram: {
        id: 'instagram',
        name: 'Instagram Post',
        icon: '📷',
        width: 1080,
        height: 1080,
        fps: 30,
        quality: 'high',
        format: 'mp4',
        description: 'Square format for Instagram feed',
        aspectRatio: '1:1'
    },
    instagramStory: {
        id: 'instagramStory',
        name: 'Instagram Story',
        icon: '📱',
        width: 1080,
        height: 1920,
        fps: 30,
        quality: 'high',
        format: 'mp4',
        description: 'Vertical format for Instagram Stories',
        aspectRatio: '9:16'
    },
    tiktok: {
        id: 'tiktok',
        name: 'TikTok',
        icon: '🎵',
        width: 1080,
        height: 1920,
        fps: 30,
        quality: 'high',
        format: 'mp4',
        description: 'Vertical format for TikTok',
        aspectRatio: '9:16'
    },
    twitter: {
        id: 'twitter',
        name: 'X (Twitter)',
        icon: '🐦',
        width: 1280,
        height: 720,
        fps: 30,
        quality: 'medium',
        format: 'mp4',
        description: 'HD 720p for Twitter/X',
        aspectRatio: '16:9'
    },
    facebook: {
        id: 'facebook',
        name: 'Facebook',
        icon: '👍',
        width: 1280,
        height: 720,
        fps: 30,
        quality: 'medium',
        format: 'mp4',
        description: 'HD 720p for Facebook',
        aspectRatio: '16:9'
    },
    linkedin: {
        id: 'linkedin',
        name: 'LinkedIn',
        icon: '💼',
        width: 1920,
        height: 1080,
        fps: 30,
        quality: 'high',
        format: 'mp4',
        description: 'Full HD for LinkedIn',
        aspectRatio: '16:9'
    }
};

/**
 * Get export settings for a platform
 */
export function getPlatformPreset(platformId: string): ExportSettings | null {
    const preset = PLATFORM_PRESETS[platformId];
    if (!preset) return null;

    return {
        width: preset.width,
        height: preset.height,
        fps: preset.fps,
        quality: preset.quality,
        format: preset.format
    };
}

/**
 * Get all platform presets as array
 */
export function getAllPlatformPresets(): PlatformPreset[] {
    return Object.values(PLATFORM_PRESETS);
}

/**
 * Get recommended preset based on project dimensions
 */
export function getRecommendedPreset(width: number, height: number): PlatformPreset {
    const aspectRatio = width / height;

    // 16:9 (landscape)
    if (aspectRatio > 1.7) {
        return PLATFORM_PRESETS.youtube;
    }

    // 9:16 (portrait)
    if (aspectRatio < 0.6) {
        return PLATFORM_PRESETS.tiktok;
    }

    // 1:1 (square)
    return PLATFORM_PRESETS.instagram;
}

// Export job and record types
export interface ExportJob {
    id: string;
    name: string;
    settings: ExportSettings;
    status: 'queued' | 'processing' | 'paused' | 'completed' | 'failed';
    progress: number;
    startTime?: number;
    endTime?: number;
    error?: string;
    outputBlob?: Blob;
    outputSize?: string;
}

export interface ExportRecord {
    id: string;
    timestamp: number;
    projectName: string;
    settings: ExportSettings;
    duration: number;
    fileSize: string;
}
