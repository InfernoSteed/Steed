

import { Template, Track, Clip, ClipFilters } from '../types';
import { generateId } from '../utils';

const DEFAULT_FILTERS: ClipFilters = {
    brightness: 100, contrast: 100, saturation: 100, grayscale: 0,
    sepia: 0, blur: 0, hueRotate: 0, invert: 0, pixelate: 0,
    vignette: 0, chromaticAberration: 0, edgeDetection: 0, tint: '#ffffff'
};

const createPlaceholderClip = (type: 'video' | 'text', name: string, start: number, duration: number, trackId: string, extraProps: Partial<Clip> = {}): Clip => {
    const id = generateId();
    return {
        id: `clip-${id}`,
        assetId: type === 'text' ? `asset-${id}` : 'placeholder',
        name,
        source: '',
        startTime: start,
        duration,
        offset: 0,
        speed: 1,
        volume: 1,
        pan: 0,
        fadeIn: 0,
        fadeOut: 0,
        type,
        position: { x: 0, y: 0 },
        scale: 1,
        rotation: 0,
        opacity: 1,
        filters: { ...DEFAULT_FILTERS },
        border: { color: '#ffffff', width: 0, radius: 0 },
        content: type === 'text' ? name : undefined,
        fontFamily: 'Arial',
        fontSize: 60,
        color: '#ffffff',
        ...extraProps
    };
};

const EMPTY_TRACKS: Track[] = [
    { id: 't1', name: 'Video 1', type: 'video', role: 'video', isMuted: false, isSolo: false, isHidden: false, isLocked: false, volume: 1, clips: [] },
    { id: 't2', name: 'Video 2', type: 'video', role: 'video', isMuted: false, isSolo: false, isHidden: false, isLocked: false, volume: 1, clips: [] },
    { id: 't3', name: 'Overlay', type: 'video', role: 'video', isMuted: false, isSolo: false, isHidden: false, isLocked: false, volume: 1, clips: [] },
    { id: 'a1', name: 'Audio 1 (Music)', type: 'audio', role: 'music', isMuted: false, isSolo: false, isHidden: false, isLocked: false, volume: 0.8, clips: [] },
    { id: 'a2', name: 'Audio 2 (Voice)', type: 'audio', role: 'voice', isMuted: false, isSolo: false, isHidden: false, isLocked: false, volume: 1, clips: [] },
    { id: 'a3', name: 'Audio 3 (SFX)', type: 'audio', role: 'sfx', isMuted: false, isSolo: false, isHidden: false, isLocked: false, volume: 1, clips: [] },
];

export const PRESET_TEMPLATES: Template[] = [
    {
        id: 'social-15',
        name: 'Social Media Post',
        description: 'Fast-paced 15s sequence with text overlays, perfect for Stories or Reels.',
        category: 'preset',
        duration: 15,
        tracks: [
            {
                ...EMPTY_TRACKS[0], clips: [
                    createPlaceholderClip('video', 'Hook Shot', 0, 4, 't1', { transition: { type: 'slide', duration: 0.5 } }),
                    createPlaceholderClip('video', 'Main Action', 4, 6, 't1', { transition: { type: 'slide', duration: 0.5 } }),
                    createPlaceholderClip('video', 'Details', 10, 5, 't1')
                ]
            },
            {
                ...EMPTY_TRACKS[2], clips: [
                    createPlaceholderClip('text', 'HEADLINE', 0.5, 3, 't3', { position: { x: 0, y: -300 }, fontSize: 80, textAnimation: { entranceType: 'slide-down', entranceDuration: 0.5, exitType: 'fade', exitDuration: 0.5 } }),
                    createPlaceholderClip('text', 'Link in Bio', 12, 3, 't3', { position: { x: 0, y: 0 }, fontSize: 60, color: '#3b82f6', textAnimation: { entranceType: 'zoom', entranceDuration: 0.5, exitType: 'none', exitDuration: 0 } })
                ]
            },
            ...EMPTY_TRACKS.slice(3) // Audios
        ]
    },
    {
        id: 'product-30',
        name: 'Product Showcase',
        description: 'Cinematic 30s template with smooth fades and elegant text.',
        category: 'preset',
        duration: 30,
        tracks: [
            {
                ...EMPTY_TRACKS[0], clips: [
                    createPlaceholderClip('video', 'Product Reveal', 0, 8, 't1', { transition: { type: 'dissolve', duration: 1 } }),
                    createPlaceholderClip('video', 'Feature 1', 8, 7, 't1', { transition: { type: 'dissolve', duration: 1 } }),
                    createPlaceholderClip('video', 'Feature 2', 15, 7, 't1', { transition: { type: 'dissolve', duration: 1 } }),
                    createPlaceholderClip('video', 'Call to Action', 22, 8, 't1')
                ]
            },
            {
                ...EMPTY_TRACKS[2], clips: [
                    createPlaceholderClip('text', 'The Future', 1, 5, 't3', { position: { x: -300, y: 200 }, textAnimation: { entranceType: 'fade', entranceDuration: 2, exitType: 'fade', exitDuration: 1 } }),
                    createPlaceholderClip('text', 'Is Here', 23, 5, 't3', { position: { x: 0, y: 0 }, fontSize: 100 })
                ]
            },
            ...EMPTY_TRACKS.slice(3)
        ]
    },
    {
        id: 'tutorial-10',
        name: 'Tutorial Intro',
        description: 'Quick 10s intro with a lower-third title card.',
        category: 'preset',
        duration: 10,
        tracks: [
            {
                ...EMPTY_TRACKS[0], clips: [
                    createPlaceholderClip('video', 'Host Intro', 0, 10, 't1')
                ]
            },
            {
                ...EMPTY_TRACKS[2], clips: [
                    createPlaceholderClip('text', 'EPISODE 1', 1, 4, 't3', { position: { x: -400, y: 300 }, fontSize: 40, color: '#fbbf24', textAnimation: { entranceType: 'slide-left', entranceDuration: 0.5, exitType: 'slide-out', exitDuration: 0.5 } }),
                    createPlaceholderClip('text', 'Getting Started', 1.5, 4, 't3', { position: { x: -400, y: 360 }, fontSize: 60, textAnimation: { entranceType: 'slide-left', entranceDuration: 0.6, exitType: 'slide-out', exitDuration: 0.4 } })
                ]
            },
            ...EMPTY_TRACKS.slice(3)
        ]
    },
    {
        id: 'slideshow-60',
        name: 'Photo Slideshow',
        description: '60s smooth memory maker with automatic Ken Burns motion.',
        category: 'preset',
        duration: 60,
        tracks: [
            {
                ...EMPTY_TRACKS[0], clips: Array.from({ length: 12 }).map((_, i) =>
                    createPlaceholderClip('video', `Photo ${i + 1}`, i * 5, 5, 't1', {
                        type: 'image',
                        transition: { type: 'dissolve', duration: 1 },
                        // Mock Keyframes for Ken Burns
                        keyframes: {
                            scale: [{ id: 'k1', time: 0, value: 1.1 }, { id: 'k2', time: 5, value: 1.25 }],
                            x: [{ id: 'k3', time: 0, value: 0 }, { id: 'k4', time: 5, value: i % 2 === 0 ? 50 : -50 }]
                        }
                    })
                )
            },
            ...EMPTY_TRACKS.slice(1)
        ]
    },
    {
        id: 'promo-45',
        name: 'Promo Video',
        description: 'High energy 45s promo with aggressive zoom transitions.',
        category: 'preset',
        duration: 45,
        tracks: [
            {
                ...EMPTY_TRACKS[0], clips: [
                    createPlaceholderClip('video', 'Opener', 0, 5, 't1', { transition: { type: 'zoom', duration: 0.5 } }),
                    createPlaceholderClip('video', 'Shot 1', 5, 4, 't1', { transition: { type: 'zoom', duration: 0.5 } }),
                    createPlaceholderClip('video', 'Shot 2', 9, 4, 't1', { transition: { type: 'zoom', duration: 0.5 } }),
                    createPlaceholderClip('video', 'Shot 3', 13, 4, 't1', { transition: { type: 'zoom', duration: 0.5 } })
                ]
            },
            {
                ...EMPTY_TRACKS[2], clips: [
                    createPlaceholderClip('text', 'DONT MISS OUT', 2, 2, 't3', { fontSize: 120, color: '#ef4444', rotation: -5, textAnimation: { entranceType: 'zoom', entranceDuration: 0.2, exitType: 'zoom-out', exitDuration: 0.2 } }),
                    createPlaceholderClip('text', '50% OFF', 10, 2, 't3', { fontSize: 120, color: '#22c55e', rotation: 5, textAnimation: { entranceType: 'zoom', entranceDuration: 0.2, exitType: 'zoom-out', exitDuration: 0.2 } })
                ]
            },
            ...EMPTY_TRACKS.slice(3)
        ]
    },
    // NEW: Blank Platform Templates
    {
        id: 'youtube-blank',
        name: 'YouTube Standard',
        description: 'Blank 16:9 template optimized for YouTube with intro/outro structure',
        category: 'blank',
        duration: 60,
        tracks: [
            { ...EMPTY_TRACKS[0], name: 'Main Video', clips: [] },
            { ...EMPTY_TRACKS[1], name: 'B-Roll', clips: [] },
            { ...EMPTY_TRACKS[2], name: 'Lower Thirds', clips: [] },
            { id: 'a1', name: 'Background Music', type: 'audio', role: 'music', isMuted: false, isSolo: false, isHidden: false, isLocked: false, volume: 0.6, clips: [] },
            { id: 'a2', name: 'Voiceover', type: 'audio', role: 'voice', isMuted: false, isSolo: false, isHidden: false, isLocked: false, volume: 1, clips: [] },
            { id: 'a3', name: 'Sound Effects', type: 'audio', role: 'sfx', isMuted: false, isSolo: false, isHidden: false, isLocked: false, volume: 0.8, clips: [] },
        ]
    },
    {
        id: 'instagram-story-blank',
        name: 'Instagram Story',
        description: 'Blank 9:16 vertical template for Instagram Stories',
        category: 'blank',
        duration: 15,
        tracks: [
            { ...EMPTY_TRACKS[0], name: 'Main Content', clips: [] },
            { ...EMPTY_TRACKS[2], name: 'Text Overlays', clips: [] },
            { id: 't4', name: 'Stickers/Emojis', type: 'video', role: 'video', isMuted: false, isSolo: false, isHidden: false, isLocked: false, volume: 1, clips: [] },
            { id: 'a1', name: 'Music', type: 'audio', role: 'music', isMuted: false, isSolo: false, isHidden: false, isLocked: false, volume: 0.7, clips: [] },
        ]
    },
    {
        id: 'tiktok-blank',
        name: 'TikTok Trending',
        description: 'Blank 9:16 template for TikTok with hook/main/CTA structure',
        category: 'blank',
        duration: 30,
        tracks: [
            { ...EMPTY_TRACKS[0], name: 'Hook (0-3s)', clips: [] },
            { ...EMPTY_TRACKS[1], name: 'Main Content', clips: [] },
            { ...EMPTY_TRACKS[2], name: 'Captions', clips: [] },
            { id: 't4', name: 'CTA Overlay', type: 'video', role: 'video', isMuted: false, isSolo: false, isHidden: false, isLocked: false, volume: 1, clips: [] },
            { id: 'a1', name: 'Trending Audio', type: 'audio', role: 'music', isMuted: false, isSolo: false, isHidden: false, isLocked: false, volume: 1, clips: [] },
            { id: 'a2', name: 'Voiceover', type: 'audio', role: 'voice', isMuted: false, isSolo: false, isHidden: false, isLocked: false, volume: 1, clips: [] },
        ]
    },
    {
        id: 'podcast-blank',
        name: 'Podcast Episode',
        description: 'Blank audio-focused template for podcast episodes with visual elements',
        category: 'blank',
        duration: 1800, // 30 minutes
        tracks: [
            { ...EMPTY_TRACKS[0], name: 'Host Camera', clips: [] },
            { ...EMPTY_TRACKS[1], name: 'Guest Camera', clips: [] },
            { ...EMPTY_TRACKS[2], name: 'Lower Thirds', clips: [] },
            { id: 't4', name: 'B-Roll/Graphics', type: 'video', role: 'video', isMuted: false, isSolo: false, isHidden: false, isLocked: false, volume: 1, clips: [] },
            { id: 'a1', name: 'Intro/Outro Music', type: 'audio', role: 'music', isMuted: false, isSolo: false, isHidden: false, isLocked: false, volume: 0.5, clips: [] },
            { id: 'a2', name: 'Host Audio', type: 'audio', role: 'voice', isMuted: false, isSolo: false, isHidden: false, isLocked: false, volume: 1, clips: [] },
            { id: 'a3', name: 'Guest Audio', type: 'audio', role: 'voice', isMuted: false, isSolo: false, isHidden: false, isLocked: false, volume: 1, clips: [] },
        ]
    },
    {
        id: 'product-review-blank',
        name: 'Product Review',
        description: 'Blank template for product reviews with showcase and detail tracks',
        category: 'blank',
        duration: 120, // 2 minutes
        tracks: [
            { ...EMPTY_TRACKS[0], name: 'Product Showcase', clips: [] },
            { ...EMPTY_TRACKS[1], name: 'Detail Shots', clips: [] },
            { ...EMPTY_TRACKS[2], name: 'Price/Specs Overlay', clips: [] },
            { id: 't4', name: 'Comparison Graphics', type: 'video', role: 'video', isMuted: false, isSolo: false, isHidden: false, isLocked: false, volume: 1, clips: [] },
            { id: 'a1', name: 'Background Music', type: 'audio', role: 'music', isMuted: false, isSolo: false, isHidden: false, isLocked: false, volume: 0.4, clips: [] },
            { id: 'a2', name: 'Voiceover', type: 'audio', role: 'voice', isMuted: false, isSolo: false, isHidden: false, isLocked: false, volume: 1, clips: [] },
        ]
    }
];

// Helper to clone a template and regenerate IDs so they don't conflict
export const instantiateTemplate = (template: Template): Track[] => {
    return template.tracks.map(track => ({
        ...track,
        clips: track.clips.map(clip => {
            const newId = generateId();
            return {
                ...clip,
                id: `clip-${newId}`,
                // If it's a text clip, we need a unique asset ID too if we were tracking assets strictly
                // For this demo, text clips carry their content in the clip object, so it's fine.
                // We reset assetId for placeholders to ensure they don't link to real files yet
                assetId: clip.type === 'text' ? `asset-${newId}` : 'placeholder'
            };
        })
    }));
};

// Local Storage Helpers
const STORAGE_KEY = 'video_forge_custom_templates';

export const saveCustomTemplate = (template: Template) => {
    const existing = getCustomTemplates();
    const updated = [...existing, template];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const getCustomTemplates = (): Template[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error("Failed to load templates", e);
        return [];
    }
};

export const deleteCustomTemplate = (id: string) => {
    const existing = getCustomTemplates();
    const updated = existing.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};