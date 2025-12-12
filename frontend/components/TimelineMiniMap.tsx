import React, { useState, useRef, useEffect } from 'react';
import { Track, Clip } from '../types';

interface TimelineMiniMapProps {
    tracks: Track[];
    duration: number;
    currentTime: number;
    viewportStart: number;
    viewportEnd: number;
    onSeek: (time: number) => void;
    onViewportChange: (start: number, end: number) => void;
}

export function TimelineMiniMap({
    tracks,
    duration,
    currentTime,
    viewportStart,
    viewportEnd,
    onSeek,
    onViewportChange
}: TimelineMiniMapProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [dragType, setDragType] = useState<'viewport' | 'playhead' | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent, type: 'viewport' | 'playhead') => {
        e.preventDefault();
        setIsDragging(true);
        setDragType(type);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        const time = percentage * duration;

        if (dragType === 'playhead') {
            onSeek(time);
        } else if (dragType === 'viewport') {
            const viewportDuration = viewportEnd - viewportStart;
            const newStart = Math.max(0, time - viewportDuration / 2);
            const newEnd = Math.min(duration, newStart + viewportDuration);
            onViewportChange(newStart, newEnd);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setDragType(null);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, dragType]);

    const handleClick = (e: React.MouseEvent) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        const time = percentage * duration;

        onSeek(time);
    };

    const pixelsPerSecond = containerRef.current ? containerRef.current.offsetWidth / duration : 100;

    return (
        <div ref={containerRef} className="timeline-minimap" onClick={handleClick}>
            {/* Tracks and clips */}
            <div className="minimap-tracks">
                {tracks.map((track, trackIndex) => (
                    <div key={track.id} className="minimap-track" style={{ top: `${trackIndex * 12}px` }}>
                        {track.clips.map(clip => {
                            const left = (clip.startTime / duration) * 100;
                            const width = (clip.duration / duration) * 100;

                            return (
                                <div
                                    key={clip.id}
                                    className="minimap-clip"
                                    style={{
                                        left: `${left}%`,
                                        width: `${width}%`,
                                        backgroundColor: clip.labelColor || getClipColor(clip.type)
                                    }}
                                    title={clip.name}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Viewport indicator */}
            <div
                className="minimap-viewport"
                style={{
                    left: `${(viewportStart / duration) * 100}%`,
                    width: `${((viewportEnd - viewportStart) / duration) * 100}%`
                }}
                onMouseDown={(e) => handleMouseDown(e, 'viewport')}
            />

            {/* Playhead */}
            <div
                className="minimap-playhead"
                style={{
                    left: `${(currentTime / duration) * 100}%`
                }}
                onMouseDown={(e) => handleMouseDown(e, 'playhead')}
            />

            <style>{`
        .timeline-minimap {
          position: relative;
          width: 100%;
          height: 60px;
          background: linear-gradient(180deg, #1D1D1D 0%, #2D2D2D 100%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          cursor: pointer;
          overflow: hidden;
          margin-bottom: 12px;
        }

        .minimap-tracks {
          position: relative;
          width: 100%;
          height: 100%;
          padding: 8px 4px;
        }

        .minimap-track {
          position: absolute;
          left: 4px;
          right: 4px;
          height: 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 2px;
        }

        .minimap-clip {
          position: absolute;
          height: 100%;
          border-radius: 2px;
          opacity: 0.7;
          transition: opacity 0.2s;
        }

        .minimap-clip:hover {
          opacity: 1;
        }

        .minimap-viewport {
          position: absolute;
          top: 0;
          height: 100%;
          background: rgba(255, 220, 115, 0.15);
          border: 2px solid #ffdc73;
          border-radius: 4px;
          cursor: move;
          pointer-events: all;
          z-index: 2;
        }

        .minimap-viewport:hover {
          background: rgba(255, 220, 115, 0.25);
        }

        .minimap-playhead {
          position: absolute;
          top: 0;
          width: 2px;
          height: 100%;
          background: #ffdc73;
          box-shadow: 0 0 8px rgba(255, 220, 115, 0.8);
          cursor: ew-resize;
          pointer-events: all;
          z-index: 3;
        }

        .minimap-playhead::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid #ffdc73;
        }

        .minimap-playhead::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-bottom: 8px solid #ffdc73;
        }
      `}</style>
        </div>
    );
}

function getClipColor(type: string): string {
    switch (type) {
        case 'video':
            return '#3B82F6';
        case 'audio':
            return '#10B981';
        case 'text':
            return '#ffdc73';
        case 'image':
            return '#8B5CF6';
        default:
            return '#6B7280';
    }
}
