


import React, { useRef, useState, useEffect, useMemo, useLayoutEffect } from 'react';
import { Track, Clip, Asset, Keyframe, Marker } from '../types';
import { formatTime } from '../utils';
import { RangeSlider } from './RangeSlider';
import { Waveform } from './Waveform';
import { TimelineSection } from './TimelineSection';
import { NavigationBar, NavItem } from './NavigationBar';
import {
    Volume2, VolumeX, Eye, EyeOff, Plus, Type, Music, Image as ImageIcon, Video,
    Scissors, Hand, MousePointer2, Flag, Lock, Unlock, Magnet,
    Sparkles, Mic, FileAudio, Music2, Type as TypeIcon, PenTool, Palette, Wand2
} from 'lucide-react';

const AUDIO_NAV_ITEMS: NavItem[] = [
    { id: 'extract', label: 'Extract', icon: Scissors, action: () => console.log('Extract Audio') },
    { id: 'sounds', label: 'Sounds', icon: FileAudio, action: () => console.log('Open Sounds') },
    { id: 'sfx', label: 'Sound FX', icon: Sparkles, action: () => console.log('Sound FX') },
    { id: 'record', label: 'Record', icon: Mic, action: () => console.log('Record Voice') },
    { id: 'ai_voice', label: 'AI Voiceover', icon: Mic, action: () => console.log('AI Voice') },
    { id: 'text_to_audio', label: 'Text to Audio', icon: TypeIcon, action: () => console.log('Text to Audio') },
    { id: 'ai_music', label: 'AI Music', icon: Wand2, action: () => console.log('AI Music') },
    { id: 'brand', label: 'Brand Music', icon: Music2, action: () => console.log('Brand Kit') },
    { id: 'custom', label: 'Custom Voices', icon: Mic, action: () => console.log('Custom Voices') },
    { id: 'copyright', label: 'Copyright', icon: Lock, action: () => console.log('Copyright Check') },
];

const TEXT_NAV_ITEMS: NavItem[] = [
    { id: 'add_text', label: 'Add Text', icon: TypeIcon, action: () => console.log('Add Basic Text') },
    { id: 'captions', label: 'Auto Captions', icon: Sparkles, action: () => console.log('Auto Captions') },
    { id: 'stickers', label: 'Stickers', icon: Sparkles, action: () => console.log('Stickers') },
    { id: 'draw', label: 'Draw', icon: PenTool, action: () => console.log('Draw Tool') },
    { id: 'template', label: 'Templates', icon: Palette, action: () => console.log('Text Templates') },
    { id: 'lyrics', label: 'Auto Lyrics', icon: Music2, action: () => console.log('Auto Lyrics') },
    { id: 'ai_writer', label: 'AI Writer', icon: Wand2, action: () => console.log('AI Writer') },
];

interface TimelineProps {
    tracks: Track[];
    assets: Asset[];
    currentTime: number;
    duration: number;
    zoom: number;
    activeTool: 'select' | 'razor' | 'hand' | 'slip';
    onSeek: (time: number) => void;
    selectedClipId: string | null;
    onClipSelect: (clipId: string | null) => void;
    onClipMove: (clipId: string, newStartTime: number, newTrackId: string) => void;
    onClipResize: (clipId: string, newStartTime: number, newDuration: number, newOffset: number) => void;
    onClipSlip: (clipId: string, newOffset: number, newStartTime: number) => void;
    onTrackVolumeChange: (trackId: string, volume: number) => void;
    onTrackMuteToggle: (trackId: string) => void;
    onTrackSoloToggle: (trackId: string) => void;
    onTrackVisibilityToggle: (trackId: string) => void;
    onTrackLockToggle?: (trackId: string) => void;
    onTrackRename?: (trackId: string, newName: string) => void;
    onAddTrack: () => void;
    onClipContextMenu?: (e: React.MouseEvent, clipId: string) => void;
    onTrackContextMenu?: (e: React.MouseEvent, trackId: string, time: number) => void;
    onSplitClip?: (clipId: string, time: number) => void;
    isMobile?: boolean;
    markers?: Marker[];
    onMarkerDelete?: (markerId: string) => void;
    isMagnetEnabled?: boolean;
    onZoomChange: (zoom: number) => void;
    onInteractionStart?: () => void;
    onInteractionEnd?: () => void;
    onClipFade?: (clipId: string, fadeIn: number, fadeOut: number) => void;

    // New Props for Clips Section features
    clipsGlobalMute?: boolean;
    onToggleClipsMute?: () => void;
    onAIClipperClick?: () => void;
    onAudioOptionClick?: (optionId: string) => void;
    onTextOptionClick?: (optionId: string) => void;
}

interface DragState {
    clipId: string;
    startX: number;
    startY: number;
    originalStartTime: number;
    originalTrackId: string;
    currentX: number;
    currentY: number;
    trackHeight: number;
    headerHeight: number;
    clipDuration: number;
}

interface ResizeState {
    clipId: string;
    edge: 'start' | 'end';
    startX: number;
    originalStartTime: number;
    originalDuration: number;
}

interface SlipState {
    clipId: string;
    startX: number;
    originalOffset: number;
    maxOffset: number;
}

interface FadeState {
    clipId: string;
    type: 'in' | 'out';
    startX: number;
    initialValue: number;
    clipDuration: number;
}

const TRACK_HEIGHT = 80;
const HEADER_HEIGHT = 40;
const SNAP_THRESHOLD_PX = 15;
const GRID_SNAP_INTERVAL = 0.5;

export const Timeline: React.FC<TimelineProps> = ({
    tracks,
    assets,
    currentTime,
    duration,
    zoom,
    activeTool = 'select',
    onSeek,
    selectedClipId,
    onClipSelect,
    onClipMove,
    onClipResize,
    onClipSlip,
    onSplitClip,
    onTrackVolumeChange,
    onTrackMuteToggle,
    onTrackSoloToggle,
    onTrackVisibilityToggle,
    onTrackLockToggle,
    onTrackRename,
    onAddTrack,
    onClipContextMenu,
    onTrackContextMenu,
    isMobile = false,
    markers = [],
    onMarkerDelete,
    isMagnetEnabled = true,
    onZoomChange,
    onInteractionStart,
    onInteractionEnd,
    onClipFade,
    clipsGlobalMute,
    onToggleClipsMute,
    onAIClipperClick,
    onAudioOptionClick,
    onTextOptionClick
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const audioNavItems: NavItem[] = useMemo(() => [
        { id: 'extract', label: 'Extract', icon: <Scissors size={18} />, action: () => onAudioOptionClick?.('extract') },
        { id: 'sounds', label: 'Sounds', icon: <Music size={18} />, action: () => onAudioOptionClick?.('sounds') },
        { id: 'sfx', label: 'Sound FX', icon: <Volume2 size={18} />, action: () => onAudioOptionClick?.('sfx') },
        { id: 'record', label: 'Record', icon: <Mic size={18} />, action: () => onAudioOptionClick?.('record') },
        { id: 'ai_voice', label: 'AI Voiceover', icon: <Activity size={18} />, action: () => onAudioOptionClick?.('ai_voice') },
        { id: 'text_to_audio', label: 'Text to Audio', icon: <Speaker size={18} />, action: () => onAudioOptionClick?.('text_to_audio') },
        { id: 'ai_music', label: 'AI Music', icon: <Disc size={18} />, action: () => onAudioOptionClick?.('ai_music') },
        { id: 'brand', label: 'Brand Music', icon: <Tags size={18} />, action: () => onAudioOptionClick?.('brand') },
        { id: 'custom', label: 'Custom Voices', icon: <Mic2 size={18} />, action: () => onAudioOptionClick?.('custom') },
        { id: 'copyright', label: 'Copyright', icon: <ShieldCheck size={18} />, action: () => onAudioOptionClick?.('copyright') },
    ], [onAudioOptionClick]);

    const textNavItems: NavItem[] = useMemo(() => [
        { id: 'add_text', label: 'New Text', icon: <Type size={18} />, action: () => onTextOptionClick?.('add_text') },
        { id: 'captions', label: 'Auto Captions', icon: <Subtitles size={18} />, action: () => onTextOptionClick?.('captions') },
        { id: 'stickers', label: 'Stickers', icon: <Smile size={18} />, action: () => onTextOptionClick?.('stickers') },
        { id: 'draw', label: 'Draw', icon: <PenTool size={18} />, action: () => onTextOptionClick?.('draw') },
        { id: 'templates', label: 'Templates', icon: <LayoutTemplate size={18} />, action: () => onTextOptionClick?.('templates') },
        { id: 'text_audio', label: 'Text to Audio', icon: <Speaker size={18} />, action: () => onTextOptionClick?.('text_audio') },
        { id: 'lyrics', label: 'Auto Lyrics', icon: <Music size={18} />, action: () => onTextOptionClick?.('lyrics') },
        { id: 'ai_writer', label: 'AI Writer', icon: <Sparkles size={18} />, action: () => onTextOptionClick?.('ai_writer') },
        { id: 'ai_packaging', label: 'AI Packaging', icon: <Box size={18} />, action: () => onTextOptionClick?.('ai_packaging') },
    ], [onTextOptionClick]);

    const scrollContainerRef = useRef<HTMLDivElement>(null); // Ref for the scrollable area
    const tracksContainerRef = useRef<HTMLDivElement>(null);

    const [dragState, setDragState] = useState<DragState | null>(null);
    const [resizeState, setResizeState] = useState<ResizeState | null>(null);
    const [slipState, setSlipState] = useState<SlipState | null>(null);
    const [fadeState, setFadeState] = useState<FadeState | null>(null);
    const [isScrubbing, setIsScrubbing] = useState(false);
    const [isPanning, setIsPanning] = useState(false);
    const [panStartX, setPanStartX] = useState(0);
    const [panScrollLeft, setPanScrollLeft] = useState(0);
    const [snapLineX, setSnapLineX] = useState<number | null>(null);
    const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState<'none' | 'audio' | 'text'>('none');

    const prevZoomRef = useRef(zoom);

    // Responsive Header Width
    const trackHeaderWidth = isMobile ? 80 : 120;

    const timelineWidth = Math.max(duration * zoom, window.innerWidth - trackHeaderWidth - 50);
    const isAnySolo = tracks.some(t => t.isSolo);
    const isEmpty = tracks.every(t => t.clips.length === 0);

    // Center on playhead when zoom changes significantly
    useLayoutEffect(() => {
        if (Math.abs(zoom - prevZoomRef.current) > 0.01 && scrollContainerRef.current) {
            const containerWidth = scrollContainerRef.current.clientWidth;
            const playheadX = currentTime * zoom;
            // Center the playhead
            const targetScroll = playheadX - (containerWidth / 2);
            scrollContainerRef.current.scrollLeft = Math.max(0, targetScroll);

            // Sync ruler
            if (containerRef.current) {
                containerRef.current.scrollLeft = Math.max(0, targetScroll);
            }
        }
        prevZoomRef.current = zoom;
    }, [zoom]); // Intentionally exclude currentTime to avoid auto-scroll on playback

    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (onZoomChange) {
                const delta = -e.deltaY;
                const factor = 1 + (delta * 0.001);
                const newZoom = Math.max(10, Math.min(500, zoom * factor));
                onZoomChange(newZoom);
            }
        }
    };

    // Calculate Snap Points (Memoized)
    const snapPoints = useMemo(() => {
        if (!isMagnetEnabled) return [];
        const points = new Set<number>();
        points.add(0);
        points.add(currentTime);
        markers.forEach(m => points.add(m.time));

        tracks.forEach(t => {
            t.clips.forEach(c => {
                if (dragState && c.id === dragState.clipId) return;
                if (resizeState && c.id === resizeState.clipId) return;
                points.add(c.startTime);
                points.add(c.startTime + c.duration);
            });
        });
        return Array.from(points);
    }, [tracks, currentTime, dragState?.clipId, resizeState?.clipId, markers, isMagnetEnabled]);

    const handleTimelineMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        if (!containerRef.current) return;

        if (activeTool === 'hand') {
            setIsPanning(true);
            setPanStartX(e.clientX);
            setPanScrollLeft(containerRef.current.scrollLeft);
            return;
        }

        setIsScrubbing(true);
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left + containerRef.current.scrollLeft;
        onSeek(Math.max(0, x / zoom));
    };

    const handleClipMouseDown = (e: React.MouseEvent, clip: Clip, trackId: string, isLocked: boolean) => {
        e.stopPropagation();
        e.preventDefault();
        if (isLocked) return;

        if (!tracksContainerRef.current) return;
        if (e.button === 2) return;

        if (activeTool === 'razor') {
            if (onSplitClip) {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const timeInClip = clickX / zoom;
                const absoluteTime = clip.startTime + timeInClip;
                onSplitClip(clip.id, absoluteTime);
            }
            return;
        }

        if (activeTool === 'hand') {
            setIsPanning(true);
            setPanStartX(e.clientX);
            if (containerRef.current) {
                setPanScrollLeft(containerRef.current.scrollLeft);
            }
            return;
        }

        if (activeTool === 'slip') {
            const asset = assets.find(a => a.id === clip.assetId);
            if (asset && onClipSlip) {
                if (onInteractionStart) onInteractionStart();
                setSlipState({
                    clipId: clip.id,
                    startX: e.clientX,
                    originalOffset: clip.offset,
                    maxOffset: asset.duration - clip.duration * (clip.speed || 1)
                });
            }
            return;
        }

        onClipSelect(clip.id);

        setDragState({
            clipId: clip.id,
            startX: e.clientX,
            startY: e.clientY,
            originalStartTime: clip.startTime,
            originalTrackId: trackId,
            currentX: e.clientX,
            currentY: e.clientY,
            trackHeight: TRACK_HEIGHT,
            headerHeight: HEADER_HEIGHT,
            clipDuration: clip.duration
        });
    };

    const handleResizeMouseDown = (e: React.MouseEvent, clip: Clip, edge: 'start' | 'end') => {
        e.stopPropagation();
        e.preventDefault();
        if (activeTool !== 'select') return;

        if (onInteractionStart) onInteractionStart();
        setResizeState({
            clipId: clip.id,
            edge,
            startX: e.clientX,
            originalStartTime: clip.startTime,
            originalDuration: clip.duration
        });
    };

    const handleFadeMouseDown = (e: React.MouseEvent, clip: Clip, type: 'in' | 'out') => {
        e.stopPropagation();
        e.preventDefault();
        if (onInteractionStart) onInteractionStart();
        setFadeState({
            clipId: clip.id,
            type,
            startX: e.clientX,
            initialValue: type === 'in' ? (clip.fadeIn || 0) : (clip.fadeOut || 0),
            clipDuration: clip.duration
        });
    };

    useEffect(() => {
        const handleWindowMouseMove = (e: MouseEvent) => {
            if (isPanning && containerRef.current && scrollContainerRef.current) {
                const deltaX = e.clientX - panStartX;
                containerRef.current.scrollLeft = panScrollLeft - deltaX;
                scrollContainerRef.current.scrollLeft = panScrollLeft - deltaX;
                return;
            }

            if (isScrubbing && containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const x = e.clientX - rect.left + containerRef.current.scrollLeft;
                onSeek(Math.max(0, x / zoom));
            }

            if (fadeState && onClipFade) {
                const deltaX = e.clientX - fadeState.startX;
                const deltaSeconds = deltaX / zoom;
                let newValue = 0;

                if (fadeState.type === 'in') {
                    newValue = Math.max(0, Math.min(fadeState.clipDuration, fadeState.initialValue + deltaSeconds));
                    // Ensure we don't cross fadeOut?? Actually standard behavior allows cross, or limits it.
                    // Let's grab current clip to check fadeOut limit if needed, but simplistic is fine.
                    onClipFade(fadeState.clipId, newValue, -1); // -1 means ignore
                } else {
                    // Dragging LEFT increases fadeOut (since handle starts at right edge)
                    newValue = Math.max(0, Math.min(fadeState.clipDuration, fadeState.initialValue - deltaSeconds));
                    onClipFade(fadeState.clipId, -1, newValue);
                }
                return;
            }

            if (slipState && onClipSlip) {
                const deltaX = e.clientX - slipState.startX;
                const deltaTime = deltaX / zoom;
                // Dragging Right -> Shift content earlier -> Offset decreases
                let newOffset = slipState.originalOffset - deltaTime;
                newOffset = Math.max(0, Math.min(newOffset, slipState.maxOffset));
                onClipSlip(slipState.clipId, newOffset);
                return;
            }

            if (dragState && tracksContainerRef.current) {
                let deltaX = e.clientX - dragState.startX;
                let newStartTime = Math.max(0, dragState.originalStartTime + (deltaX / zoom));
                let snapped = false;
                let currentSnapLineX = null;

                let bestSnapDist = SNAP_THRESHOLD_PX / zoom;
                let bestSnapTime = -1;

                // 1. Snap to Points
                for (const point of snapPoints) {
                    const dist = Math.abs(newStartTime - point);
                    if (dist < bestSnapDist) {
                        bestSnapDist = dist;
                        bestSnapTime = point;
                        snapped = true;
                        currentSnapLineX = point * zoom;
                    }
                }

                const newEndTime = newStartTime + dragState.clipDuration;
                for (const point of snapPoints) {
                    const dist = Math.abs(newEndTime - point);
                    if (dist < bestSnapDist) {
                        bestSnapDist = dist;
                        bestSnapTime = point - dragState.clipDuration;
                        snapped = true;
                        currentSnapLineX = point * zoom;
                    }
                }

                // 2. Snap to Grid
                if (isMagnetEnabled) {
                    const nearestGridStart = Math.round(newStartTime / GRID_SNAP_INTERVAL) * GRID_SNAP_INTERVAL;
                    const distGridStart = Math.abs(newStartTime - nearestGridStart);
                    if (distGridStart < bestSnapDist) {
                        bestSnapDist = distGridStart;
                        bestSnapTime = nearestGridStart;
                        snapped = true;
                        currentSnapLineX = nearestGridStart * zoom;
                    }

                    const nearestGridEnd = Math.round(newEndTime / GRID_SNAP_INTERVAL) * GRID_SNAP_INTERVAL;
                    const distGridEnd = Math.abs(newEndTime - nearestGridEnd);
                    if (distGridEnd < bestSnapDist) {
                        bestSnapDist = distGridEnd;
                        bestSnapTime = nearestGridEnd - dragState.clipDuration;
                        snapped = true;
                        currentSnapLineX = nearestGridEnd * zoom;
                    }
                }

                if (snapped) {
                    if (navigator.vibrate && Math.abs(newStartTime - bestSnapTime) > 0.001) navigator.vibrate(5);
                    newStartTime = bestSnapTime;
                    setSnapLineX(currentSnapLineX);
                } else {
                    setSnapLineX(null);
                }

                const snappedDeltaX = (newStartTime - dragState.originalStartTime) * zoom;
                setDragState(prev => prev ? ({ ...prev, currentX: dragState.startX + snappedDeltaX, currentY: e.clientY }) : null);
            }

            if (resizeState) {
                const deltaX = e.clientX - resizeState.startX;
                const deltaTime = deltaX / zoom;
                let newStartTime = resizeState.originalStartTime;
                let newDuration = resizeState.originalDuration;
                let snapX = null;
                let bestDist = SNAP_THRESHOLD_PX / zoom;

                if (resizeState.edge === 'end') {
                    newDuration = Math.max(0.1, resizeState.originalDuration + deltaTime);
                    const newEndTime = newStartTime + newDuration;

                    for (const point of snapPoints) {
                        const dist = Math.abs(newEndTime - point);
                        if (dist < bestDist) {
                            newDuration = point - newStartTime;
                            snapX = point * zoom;
                            bestDist = dist;
                        }
                    }

                    if (isMagnetEnabled) {
                        const nearestGridEnd = Math.round(newEndTime / GRID_SNAP_INTERVAL) * GRID_SNAP_INTERVAL;
                        const distGrid = Math.abs(newEndTime - nearestGridEnd);
                        if (distGrid < bestDist) {
                            newDuration = nearestGridEnd - newStartTime;
                            snapX = nearestGridEnd * zoom;
                            bestDist = distGrid;
                        }
                    }

                    if (snapX !== null && navigator.vibrate) navigator.vibrate(5);
                    onClipResize(resizeState.clipId, newStartTime, newDuration);
                } else {
                    newStartTime = resizeState.originalStartTime + deltaTime;
                    newDuration = resizeState.originalDuration - deltaTime;

                    for (const point of snapPoints) {
                        const dist = Math.abs(newStartTime - point);
                        if (dist < bestDist) {
                            newStartTime = point;
                            newDuration = (resizeState.originalStartTime + resizeState.originalDuration) - point;
                            snapX = point * zoom;
                            bestDist = dist;
                        }
                    }

                    if (isMagnetEnabled) {
                        const nearestGridStart = Math.round(newStartTime / GRID_SNAP_INTERVAL) * GRID_SNAP_INTERVAL;
                        const distGrid = Math.abs(newStartTime - nearestGridStart);
                        if (distGrid < bestDist) {
                            newStartTime = nearestGridStart;
                            newDuration = (resizeState.originalStartTime + resizeState.originalDuration) - nearestGridStart;
                            snapX = nearestGridStart * zoom;
                            bestDist = distGrid;
                        }
                    }

                    if (newDuration < 0.1) {
                        newStartTime = resizeState.originalStartTime + resizeState.originalDuration - 0.1;
                        newDuration = 0.1;
                    }
                    if (snapX !== null && navigator.vibrate) navigator.vibrate(5);
                    onClipResize(resizeState.clipId, Math.max(0, newStartTime), newDuration);
                }
                setSnapLineX(snapX);
            }
        };

        const handleWindowMouseUp = (e: MouseEvent) => {
            if (isScrubbing) setIsScrubbing(false);
            if (isPanning) setIsPanning(false);
            setSnapLineX(null);

            if (slipState) {
                setSlipState(null);
                if (onInteractionEnd) onInteractionEnd();
            }

            if (fadeState) {
                setFadeState(null);
                if (onInteractionEnd) onInteractionEnd();
            }

            if (dragState) {
                const deltaX = dragState.currentX - dragState.startX;
                const newStartTime = Math.max(0, dragState.originalStartTime + (deltaX / zoom));

                let targetTrackId = dragState.originalTrackId;

                // Robust Track Detection using DOM
                // We user elementsFromPoint to pierce through the ghost element/cursor
                const elements = document.elementsFromPoint(e.clientX, e.clientY);
                // Look for the track row which has data-track-id
                const trackElement = elements.find(el => el.getAttribute('data-track-id'));

                if (trackElement) {
                    const foundId = trackElement.getAttribute('data-track-id');
                    const track = tracks.find(t => t.id === foundId);
                    if (track && !track.isLocked) {
                        targetTrackId = track.id;
                    }
                }

                if (Math.abs(deltaX) > 2 || targetTrackId !== dragState.originalTrackId) {
                    onClipMove(dragState.clipId, newStartTime, targetTrackId);
                }
                setDragState(null);
            }
            if (resizeState) {
                setResizeState(null);
                if (onInteractionEnd) onInteractionEnd();
            }
        };

        if (isScrubbing || dragState || resizeState || slipState || isPanning || fadeState) {
            window.addEventListener('mousemove', handleWindowMouseMove);
            window.addEventListener('mouseup', handleWindowMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleWindowMouseMove);
            window.removeEventListener('mouseup', handleWindowMouseUp);
        };
    }, [isScrubbing, dragState, resizeState, slipState, isPanning, zoom, onSeek, tracks, onClipMove, onClipResize, onClipSlip, panStartX, panScrollLeft, snapPoints, isMagnetEnabled, onInteractionStart, onInteractionEnd, fadeState, onClipFade]);

    const rulerMarkers = useMemo(() => {
        const markers = [];
        let step = 1; let majorStep = 5;
        if (zoom > 150) { step = 0.1; majorStep = 0.5; } else if (zoom > 80) { step = 0.5; majorStep = 1; } else if (zoom > 40) { step = 1; majorStep = 5; } else if (zoom > 20) { step = 2; majorStep = 10; } else if (zoom > 10) { step = 5; majorStep = 15; } else { step = 10; majorStep = 30; }

        const maxTime = Math.max(duration + (300 / zoom), 60);
        for (let i = 0; i <= maxTime; i += step) {
            const isMajor = Math.abs(i % majorStep) < 0.001;
            const pixelPos = i * zoom;
            markers.push(
                <div key={i.toFixed(1)} className={`absolute top-auto bottom-0 border-l select-none flex flex-col justify-end ${isMajor ? 'h-3 border-white/50' : 'h-1.5 border-white/20'}`} style={{ left: `${pixelPos}px` }}>
                    {isMajor && (
                        <span className="type-timecode text-[10px] absolute bottom-4 -translate-x-1/2 text-theme-text font-medium bg-[#1F1F1F]/80 px-1 rounded">
                            {formatTime(i).split('.')[0]}
                        </span>
                    )}
                </div>
            );
        }
        return markers;
    }, [duration, zoom]);

    const getGhostStyle = () => {
        if (!dragState || !tracksContainerRef.current) return {};
        const deltaX = dragState.currentX - dragState.startX;
        const projectedTime = Math.max(0, dragState.originalStartTime + (deltaX / zoom));
        const rect = tracksContainerRef.current.getBoundingClientRect();
        const relativeY = dragState.currentY - rect.top;
        const trackIndex = Math.max(0, Math.min(tracks.length - 1, Math.floor(relativeY / TRACK_HEIGHT)));
        const topOffset = trackIndex * TRACK_HEIGHT;
        const track = tracks.find(t => t.id === dragState.originalTrackId);
        const clip = track?.clips.find(c => c.id === dragState.clipId);
        const width = clip ? clip.duration * zoom : 100;
        return { left: `${projectedTime * zoom + trackHeaderWidth}px`, top: `${topOffset + 8}px`, width: `${width}px`, height: `${TRACK_HEIGHT - 16}px` };
    };

    const getClipColorClasses = (clip: Clip, isSelected: boolean) => {
        let base = "shadow-sm transition-all duration-200 ease-pro border border-white/10";
        if (isSelected) { base += " ring-2 ring-[#FF6B35] z-30 shadow-[0_0_12px_rgba(255,107,53,0.5)] scale-[1.01]"; }
        else { base += " hover:shadow-[0_0_10px_rgba(255,107,53,0.3)] hover:border-[#FF6B35]/60 hover:-translate-y-[1px] hover:scale-[1.005] z-10"; }
        if (clip.labelColor) { return `${base} bg-[${clip.labelColor}]`; }
        switch (clip.type) {
            case 'video': return `${base} bg-gradient-to-r from-[#FF6B35] to-[#E55934]`;
            case 'audio': return `${base} bg-[#3A3A3A]`;
            case 'text': return `${base} bg-[#5A7A8A]`;
            case 'image': return `${base} bg-[#9B59B6]`;
            default: return `${base} bg-gray-600`;
        }
    };

    const gridStyle = {
        backgroundImage: `
        linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
      `,
        backgroundSize: `${zoom}px 100%, ${zoom / 5}px 100%`,
        backgroundPosition: '0 0'
    };

    const cursorClass = activeTool === 'razor' ? 'cursor-crosshair' : activeTool === 'hand' ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : activeTool === 'slip' ? 'cursor-ew-resize' : 'cursor-default';

    const renderTrack = (track: Track, index: number, heightOverride: number = TRACK_HEIGHT) => {
        const isTrackDimmed = (isAnySolo && !track.isSolo) || track.isMuted || track.isHidden;
        const TrackIcon = track.type === 'audio' ? Music : track.role === 'voice' ? Music : track.clips.some(c => c.type === 'text') ? Type : track.clips.some(c => c.type === 'image') ? ImageIcon : Video;

        // Clips Global Mute logic for visual feedback (dimming or icon overlay)
        // If track is video type and global mute is on, effectively muted
        const effectiveMuted = track.type === 'video' ? (track.isMuted || clipsGlobalMute) : track.isMuted;

        return (
            <div key={track.id} className={`border-b border-[rgba(255,107,53,0.15)] relative group flex transition-colors ${index % 2 === 0 ? 'bg-[#252525]' : 'bg-[#2A2A2A]'} ${track.isLocked ? 'bg-[url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjMmEyYTJhIi8+CjxwYXRoIGQ9Ik0wIDhMOCAwTTEgOUw5IDFNMCA4TDggMCIgc3Ryb2tlPSIjM2EzYTNhIiBzdHJva2Utd2lkdGg9IjEiLz4KPC9zdmc+")]' : ''}`} style={{ height: `${heightOverride}px` }} data-track-id={track.id} role="row" aria-label={track.name} onContextMenu={(e) => { e.preventDefault(); if (onTrackContextMenu && !track.isLocked) { const rect = e.currentTarget.getBoundingClientRect(); const x = e.clientX - rect.left + containerRef.current!.scrollLeft - trackHeaderWidth; const time = Math.max(0, x / zoom); onTrackContextMenu(e, track.id, time); } }}>
                <div className="shrink-0 sticky left-0 z-40 bg-[#2D2D2D] border-r border-[rgba(255,107,53,0.15)] flex flex-col p-2 gap-1 shadow-lg focus-within:ring-2 focus-within:ring-inset focus-within:ring-theme-accent" style={{ width: trackHeaderWidth }} role="rowheader" tabIndex={0} onClick={(e) => e.stopPropagation()} onContextMenu={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1 md:gap-2 mb-1 overflow-hidden" onDoubleClick={() => !track.isLocked && setEditingTrackId(track.id)}>
                        <TrackIcon size={12} className={track.clips.length > 0 ? "text-[#FF6B35] shrink-0" : "text-[#6B6B6B] shrink-0"} aria-hidden="true" />
                        {editingTrackId === track.id ? (<input autoFocus className="bg-black text-white text-[10px] w-full border border-theme-accent rounded px-1 outline-none" defaultValue={track.name} onBlur={(e) => { setEditingTrackId(null); if (onTrackRename) onTrackRename(track.id, e.target.value); }} onKeyDown={(e) => { if (e.key === 'Enter') { e.currentTarget.blur(); } }} />) : (<span className="type-body text-[10px] md:text-[11px] font-medium truncate text-[#B8B8B8] group-hover:text-white group-hover:font-bold transition-all cursor-text" title={track.name}> {isMobile && track.name.startsWith('Video') ? `V${track.name.split(' ')[1]}` : track.name} </span>)}
                    </div>
                    <div className="flex items-center justify-between gap-0.5 mt-auto">
                        <button onClick={() => onTrackVisibilityToggle(track.id)} className={`p-1 rounded transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-theme-accent ${track.isHidden ? 'text-[#6B6B6B]' : 'text-[#FF6B35] hover:text-[#E55934]'}`} title="Toggle Visibility"> {track.isHidden ? <EyeOff size={10} /> : <Eye size={10} />} </button>
                        <button onClick={() => onTrackLockToggle && onTrackLockToggle(track.id)} className={`p-1 rounded transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-theme-accent ${track.isLocked ? 'text-[#FF6B35]' : 'text-[#6B6B6B] hover:text-white'}`} title="Lock Track"> {track.isLocked ? <Lock size={10} /> : <Unlock size={10} />} </button>
                        <button onClick={() => onTrackMuteToggle(track.id)} className={`p-1 rounded transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-theme-accent ${effectiveMuted ? 'text-[#EF5350] bg-[#EF5350]/10' : 'text-[#6B6B6B] hover:text-white'}`} title="Mute"> {effectiveMuted ? <VolumeX size={10} /> : <Volume2 size={10} />} </button>
                        <button onClick={() => onTrackSoloToggle(track.id)} className={`p-1 rounded transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-theme-accent ${track.isSolo ? 'text-[#FFA726] bg-[#FFA726]/10 font-bold' : 'text-[#6B6B6B] hover:text-white'}`} title="Solo"> <span className="text-[9px] w-2.5 inline-block text-center">S</span> </button>
                    </div>
                    {!track.isLocked && (<div className="mt-1 h-1 w-full bg-[#404040] rounded-full overflow-hidden relative group/vol"> <div className="absolute top-0 left-0 h-full bg-[#6B6B6B] group-hover/vol:bg-[#FF6B35] transition-colors" style={{ width: `${(track.volume ?? 1) * 100}%` }}></div> <input type="range" min={0} max={1} step={0.1} value={track.volume ?? 1} onChange={(e) => onTrackVolumeChange(track.id, parseFloat(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" aria-label={`Volume for ${track.name}`} /> </div>)}
                </div>
                <div className="relative flex-1 opacity-100 transition-opacity" style={{ opacity: isTrackDimmed ? 0.3 : 1, pointerEvents: (track.isHidden || track.isLocked) ? 'none' : 'auto' }}>
                    {track.clips.map((clip) => {
                        const isSelected = clip.id === selectedClipId;
                        const isDragging = dragState?.clipId === clip.id;
                        const asset = assets.find(a => a.id === clip.assetId);
                        const allKeyframes: Keyframe[] = [];
                        if (clip.keyframes) { Object.values(clip.keyframes).forEach((val) => { const kArr = val as Keyframe[] | undefined; if (kArr) allKeyframes.push(...kArr); }); }
                        const keyframeTimes = Array.from(new Set(allKeyframes.map(k => k.time))).sort((a, b) => a - b);
                        const relativeCurrentTime = currentTime - clip.startTime;
                        const customStyle = clip.labelColor ? { backgroundColor: clip.labelColor } : {};
                        return (
                            <div key={clip.id} role="button" tabIndex={0} aria-label={`${clip.name} on ${track.name}`} aria-selected={isSelected} className={`absolute top-2 bottom-2 rounded-[3px] overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-white group ${!clip.labelColor ? getClipColorClasses(clip, isSelected) : (isSelected ? 'ring-2 ring-white scale-[1.01] shadow-lg' : 'hover:brightness-110')} ${isDragging ? 'opacity-30' : 'opacity-100'} ${activeTool === 'razor' ? 'cursor-crosshair hover:after:content-[""] hover:after:absolute hover:after:inset-0 hover:after:border-l-2 hover:after:border-red-500 hover:after:pointer-events-none' : activeTool === 'hand' ? 'cursor-grab active:cursor-grabbing' : activeTool === 'slip' ? 'cursor-ew-resize hover:brightness-110' : 'cursor-pointer active:cursor-grabbing'}`} style={{ left: `${clip.startTime * zoom}px`, width: `${(clip.duration / (clip.speed || 1)) * zoom}px`, ...customStyle }} onMouseDown={(e) => handleClipMouseDown(e, clip, track.id, track.isLocked)} onClick={(e) => e.stopPropagation()} onContextMenu={(e) => { e.stopPropagation(); e.preventDefault(); if (onClipContextMenu) onClipContextMenu(e, clip.id); }} onKeyDown={(e) => { if (e.key === 'Enter') onClipSelect(clip.id); }} title={activeTool === 'razor' ? "Click to Split" : activeTool === 'slip' ? "Slip Edit" : clip.name}>
                                {!dragState && activeTool === 'select' && !track.isLocked && (
                                    <>
                                        <div className={`absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/50 to-transparent cursor-w-resize z-30 transition-opacity duration-200 flex items-center justify-start pl-0.5 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} onMouseDown={(e) => handleResizeMouseDown(e, clip, 'start')} role="slider"> <div className="h-6 w-1 bg-white/80 rounded-full shadow-[0_0_4px_rgba(0,0,0,0.5)]"></div> </div>
                                        <div className={`absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-black/50 to-transparent cursor-e-resize z-30 transition-opacity duration-200 flex items-center justify-end pr-0.5 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} onMouseDown={(e) => handleResizeMouseDown(e, clip, 'end')} role="slider"> <div className="h-6 w-1 bg-white/80 rounded-full shadow-[0_0_4px_rgba(0,0,0,0.5)]"></div> </div>
                                        <div className="absolute top-0 left-0 w-3 h-3 -ml-1.5 -mt-1.5 bg-white border border-black rounded-full cursor-ew-resize opacity-0 group-hover:opacity-100 z-50 transition-opacity hover:scale-125" style={{ left: `${(clip.fadeIn || 0) * zoom}px` }} onMouseDown={(e) => handleFadeMouseDown(e, clip, 'in')} title={`Fade In: ${formatTime(clip.fadeIn || 0)}`}></div>
                                        <div className="absolute top-0 right-0 w-3 h-3 -mr-1.5 -mt-1.5 bg-white border border-black rounded-full cursor-ew-resize opacity-0 group-hover:opacity-100 z-50 transition-opacity hover:scale-125" style={{ right: `${(clip.fadeOut || 0) * zoom}px` }} onMouseDown={(e) => handleFadeMouseDown(e, clip, 'out')} title={`Fade Out: ${formatTime(clip.fadeOut || 0)}`}></div>
                                    </>
                                )}
                                <div className="h-full w-full flex flex-col justify-between p-1.5 pointer-events-none relative">
                                    {(clip.type === 'video' || clip.type === 'image') && asset?.thumbnail && (<div className="absolute inset-0 opacity-20 bg-cover bg-center z-0" style={{ backgroundImage: `url(${asset.thumbnail})` }} />)}
                                    <span className="text-[10px] truncate w-full block font-medium text-white drop-shadow-md z-20"> {clip.name} </span>

                                    {/* Muted Icon Overlay for Global Clips Mute */}
                                    {(track.type === 'video' && effectiveMuted) && (
                                        <div className="absolute bottom-1 right-1 z-20 text-red-500 drop-shadow-md">
                                            <VolumeX size={12} />
                                        </div>
                                    )}

                                    {(clip.fadeIn > 0 || clip.fadeOut > 0) && (<svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30 z-10" preserveAspectRatio="none"> <path d={`M 0 ${heightOverride} L ${(clip.fadeIn || 0) * zoom} 0 H ${(clip.duration - (clip.fadeOut || 0)) * zoom} L ${clip.duration * zoom} ${heightOverride} Z`} fill="rgba(255,255,255,0.3)" /> </svg>)}
                                    {activeTool === 'slip' && slipState?.clipId === clip.id && (<div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-mono text-xs z-30"> {formatTime(clip.offset)} </div>)}
                                    {keyframeTimes.length > 0 && !isMobile && (<div className="absolute bottom-1 w-full h-2 z-20"> {keyframeTimes.map(t => { const isCurrent = Math.abs(t - relativeCurrentTime) < 0.1; return (<div key={t} className={`absolute w-1.5 h-1.5 rotate-45 border border-black shadow-sm transition-all ${isCurrent ? 'bg-[#ffdc73] z-50 scale-125' : 'bg-white/80 z-10'}`} style={{ left: `${(t / clip.duration) * 100}%`, transform: 'translateX(-50%) rotate(45deg)' }}></div>); })} </div>)}
                                    {clip.type === 'audio' && asset?.waveform && (<div className="absolute inset-0 top-4 opacity-90 px-1 z-0"> <Waveform data={asset.waveform} color={clip.labelColor || "#ffdc73"} /> </div>)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const clipsTracks = tracks.filter(t => t.type === 'video'); // Includes Image tracks
    const audioTracks = tracks.filter(t => t.type === 'audio');
    const textTracks = tracks.filter(t => t.type === 'text');

    return (
        <div
            className={`flex flex-col h-full bg-[#1F1F1F] border-t border-theme-border select-none ${cursorClass}`}
            onClick={() => { if (activeTool === 'select') onClipSelect(null); }}
            onWheel={handleWheel}
        >
            {/* Ruler Header */}
            <div className="h-[40px] bg-gradient-to-b from-[#2D2D2D] to-[#1F1F1F] border-b border-theme-border relative overflow-hidden flex-shrink-0 z-20 flex" onClick={(e) => e.stopPropagation()} role="row">
                <div className="shrink-0 border-r border-[rgba(255,107,53,0.15)] bg-[#2D2D2D] z-30 flex items-center justify-between px-2 md:px-3" style={{ width: trackHeaderWidth }} role="columnheader">
                    <span className="text-[9px] md:text-[10px] font-bold text-theme-text-muted tracking-wider uppercase"> {isMobile ? 'TRKS' : 'TRACKS'} </span>
                    <button onClick={onAddTrack} className="p-1 rounded hover:bg-theme-surface text-theme-accent transition-colors focus-visible:ring-2 focus-visible:ring-theme-accent focus:outline-none" title="Add Track" aria-label="Add Track"> <Plus size={14} strokeWidth={3} aria-hidden="true" /> </button>
                </div>
                <div className="h-full relative cursor-pointer group" style={{ width: `${timelineWidth}px` }} onMouseDown={handleTimelineMouseDown} ref={containerRef} role="slider" aria-label="Time Scrubber" aria-valuemin={0} aria-valuemax={duration} aria-valuenow={currentTime} tabIndex={0}>
                    {rulerMarkers}
                    {markers.map(m => (
                        <div key={m.id} className="absolute top-0 w-3 h-3 -ml-1.5 cursor-pointer z-50 group/marker" style={{ left: `${m.time * zoom}px` }} onClick={(e) => { e.stopPropagation(); onSeek(m.time); }} onDoubleClick={(e) => { e.stopPropagation(); if (onMarkerDelete) onMarkerDelete(m.id); }} title={m.label}>
                            <Flag size={12} fill={m.color} color={m.color} />
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 text-[9px] text-white px-1 rounded opacity-0 group-hover/marker:opacity-100 whitespace-nowrap pointer-events-none transition-opacity"> {m.label} </div>
                            <div className="absolute top-3 bottom-[-100vh] w-px border-l border-dashed border-white/20 pointer-events-none h-[500px]"></div>
                        </div>
                    ))}
                    <div className="absolute bottom-0 w-px h-full bg-[#FF6B35] z-40 pointer-events-none transition-none" style={{ left: `${currentTime * zoom}px` }}>
                        <div className="absolute top-0 -translate-x-1/2 -mt-1 text-[#FF6B35] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"> <svg width="13" height="14" viewBox="0 0 11 12" fill="currentColor"> <path d="M0.5 0H10.5V6L5.5 11L0.5 6V0Z" /> </svg> </div>
                    </div>
                </div>
            </div>

            <div
                className={`flex-1 overflow-auto relative custom-scrollbar bg-[#252525] ${cursorClass}`}
                ref={scrollContainerRef}
                onScroll={(e) => { if (containerRef.current) { containerRef.current.scrollLeft = e.currentTarget.scrollLeft; } }}
            >
                <div className="relative min-h-full flex flex-col" style={{ width: `${timelineWidth + trackHeaderWidth}px`, ...gridStyle }} ref={tracksContainerRef}>
                    {snapLineX !== null && (<div className="absolute top-0 bottom-0 w-[1px] bg-cyan-400 z-50 pointer-events-none shadow-[0_0_8px_cyan]" style={{ left: `${snapLineX + trackHeaderWidth}px` }}></div>)}
                    <div className="absolute top-0 bottom-0 w-[2px] bg-[#FF6B35] z-30 pointer-events-none shadow-[0_0_8px_rgba(255,107,53,0.6)]" style={{ left: `${currentTime * zoom + trackHeaderWidth}px` }}></div>

                    {/* Section 1: CLIPS */}
                    <TimelineSection
                        title="CLIPS"
                        icon={<Video size={14} className="text-[#FF6B35]" />}
                        className="bg-[#1e1e1e]"
                        headerContent={
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={onToggleClipsMute}
                                    className={`p-1 rounded hover:bg-white/10 ${clipsGlobalMute ? 'text-red-500' : 'text-theme-text-muted hover:text-white'}`}
                                    title={clipsGlobalMute ? "Unmute Clips" : "Mute All Clips"}
                                >
                                    {clipsGlobalMute ? <VolumeX size={14} /> : <Volume2 size={14} />}
                                </button>
                                <button
                                    onClick={onAIClipperClick}
                                    className="p-1 rounded hover:bg-white/10 text-theme-accent hover:text-white"
                                    title="AI Clipper"
                                >
                                    <Sparkles size={14} />
                                </button>
                            </div>
                        }
                    >
                        {clipsTracks.map((track, index) => {
                            // Custom height logic: Video (t1) = 120px, Images (t2+) = 60px
                            // Assuming t1 is always the Main Video, or we check type/role
                            const isMainVideo = track.role === 'video';
                            const trackHeight = isMainVideo ? 120 : 60;

                            return renderTrack(track, index, trackHeight);
                        })}
                    </TimelineSection>

                    {/* Section 2: AUDIO */}
                    <TimelineSection
                        title="AUDIO"
                        icon={<Music size={14} className="text-blue-400" />}
                        onAdd={() => setActiveSection(activeSection === 'audio' ? 'none' : 'audio')}
                        headerContent={activeSection === 'audio' ? <NavigationBar title="AUDIO TOOLS" items={audioNavItems} onClose={() => setActiveSection('none')} onOptionClick={onAudioOptionClick} /> : undefined}
                    >
                        {audioTracks.map((track, index) => renderTrack(track, index))}
                    </TimelineSection>

                    {/* Section 3: TEXT */}
                    <TimelineSection
                        title="TEXT"
                        icon={<TypeIcon size={14} className="text-green-400" />}
                        onAdd={() => setActiveSection(activeSection === 'text' ? 'none' : 'text')}
                        headerContent={activeSection === 'text' ? <NavigationBar title="TEXT TOOLS" items={textNavItems} onClose={() => setActiveSection('none')} onOptionClick={onTextOptionClick} /> : undefined}
                    >
                        {textTracks.map((track, index) => renderTrack(track, index))}
                    </TimelineSection>

                    {dragState && (<div className="absolute z-50 rounded-md border border-[#FF6B35] bg-[#FF6B35]/80 pointer-events-none shadow-xl backdrop-blur-sm" style={getGhostStyle()}> <div className="p-1.5 text-xs font-bold text-white truncate"> {tracks.find(t => t.clips.find(c => c.id === dragState.clipId))?.clips.find(c => c.id === dragState.clipId)?.name} </div> </div>)}
                    <div className="h-20"></div>
                </div>
            </div>
        </div>
    );
};