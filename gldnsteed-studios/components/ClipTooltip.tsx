import React from 'react';
import { Film, Music, FileText, Image, Clock, Maximize2, Sparkles } from 'lucide-react';
import { Clip } from '../types';

interface ClipTooltipProps {
    clip: Clip;
    x: number;
    y: number;
}

export function ClipTooltip({ clip, x, y }: ClipTooltipProps) {
    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 100);
        return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    };

    const formatFileSize = (bytes?: number): string => {
        if (!bytes) return 'Unknown';
        const mb = bytes / (1024 * 1024);
        if (mb < 1) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${mb.toFixed(1)} MB`;
    };

    const getFileFormat = (source: string): string => {
        const ext = source.split('.').pop()?.toUpperCase();
        return ext || 'Unknown';
    };

    const getIcon = () => {
        switch (clip.type) {
            case 'video':
                return <Film size={16} />;
            case 'audio':
                return <Music size={16} />;
            case 'text':
                return <FileText size={16} />;
            case 'image':
                return <Image size={16} />;
            default:
                return <Film size={16} />;
        }
    };

    const effectsCount = Object.keys(clip.filters || {}).filter(key => {
        const value = clip.filters?.[key as keyof typeof clip.filters];
        return value !== undefined && value !== 0 && value !== 100 && value !== '#ffffff';
    }).length;

    const hasKeyframes = clip.keyframes && Object.keys(clip.keyframes).length > 0;
    const hasTransition = clip.transition && clip.transition.type !== 'none';

    return (
        <div
            className="clip-tooltip"
            style={{
                left: x,
                top: y - 10,
                transform: 'translate(-50%, -100%)'
            }}
        >
            <div className="tooltip-header">
                <div className="icon">{getIcon()}</div>
                <div className="name">{clip.name}</div>
            </div>

            <div className="tooltip-content">
                <div className="info-row">
                    <Clock size={14} />
                    <span className="label">Duration:</span>
                    <span className="value">{formatDuration(clip.duration)}</span>
                </div>

                {clip.type !== 'text' && (
                    <>
                        <div className="info-row">
                            <FileText size={14} />
                            <span className="label">Format:</span>
                            <span className="value">{getFileFormat(clip.source)}</span>
                        </div>

                        {clip.type === 'video' && (
                            <div className="info-row">
                                <Maximize2 size={14} />
                                <span className="label">Resolution:</span>
                                <span className="value">1920x1080</span>
                            </div>
                        )}
                    </>
                )}

                {effectsCount > 0 && (
                    <div className="info-row highlight">
                        <Sparkles size={14} />
                        <span className="label">Effects:</span>
                        <span className="value">{effectsCount} applied</span>
                    </div>
                )}

                {hasKeyframes && (
                    <div className="info-row highlight">
                        <span className="badge">Animated</span>
                    </div>
                )}

                {hasTransition && (
                    <div className="info-row highlight">
                        <span className="badge">{clip.transition?.type}</span>
                    </div>
                )}
            </div>

            <style>{`
        .clip-tooltip {
          position: absolute;
          background: linear-gradient(135deg, #2D2D2D 0%, #1D1D1D 100%);
          border: 1px solid #FF6B35;
          border-radius: 8px;
          padding: 0;
          min-width: 220px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 107, 53, 0.3);
          z-index: 1000;
          pointer-events: none;
          animation: tooltipFadeIn 0.2s ease-out;
        }

        @keyframes tooltipFadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, calc(-100% - 10px));
          }
          to {
            opacity: 1;
            transform: translate(-50%, -100%);
          }
        }

        .tooltip-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: rgba(255, 107, 53, 0.1);
          border-bottom: 1px solid rgba(255, 107, 53, 0.3);
          border-radius: 8px 8px 0 0;
        }

        .tooltip-header .icon {
          color: #FF6B35;
          display: flex;
          align-items: center;
        }

        .tooltip-header .name {
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .tooltip-content {
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .info-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #B8B8B8;
        }

        .info-row svg {
          color: #888;
          flex-shrink: 0;
        }

        .info-row .label {
          color: #888;
          min-width: 70px;
        }

        .info-row .value {
          color: #fff;
          font-weight: 500;
        }

        .info-row.highlight {
          color: #FF6B35;
        }

        .info-row.highlight .label,
        .info-row.highlight .value {
          color: #FF6B35;
        }

        .badge {
          background: rgba(255, 107, 53, 0.2);
          border: 1px solid rgba(255, 107, 53, 0.4);
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          color: #FF6B35;
          text-transform: capitalize;
        }

        .clip-tooltip::after {
          content: '';
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid #FF6B35;
        }
      `}</style>
        </div>
    );
}
