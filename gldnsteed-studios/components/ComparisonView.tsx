import React, { useState, useRef } from 'react';
import { Clip, ClipFilters } from '../types';

interface ComparisonViewProps {
    clip: Clip;
    width: number;
    height: number;
    isVisible: boolean;
    onToggle: () => void;
    defaultFilters: ClipFilters;
}

export function ComparisonView({
    clip,
    width,
    height,
    isVisible,
    onToggle,
    defaultFilters
}: ComparisonViewProps) {
    const [sliderPosition, setSliderPosition] = useState(50); // Percentage
    const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('vertical');
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    if (!isVisible) return null;

    const handleMouseDown = () => {
        setIsDragging(true);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();

        if (orientation === 'vertical') {
            const x = e.clientX - rect.left;
            const percentage = (x / rect.width) * 100;
            setSliderPosition(Math.max(0, Math.min(100, percentage)));
        } else {
            const y = e.clientY - rect.top;
            const percentage = (y / rect.height) * 100;
            setSliderPosition(Math.max(0, Math.min(100, percentage)));
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const buildFilterString = (filters: ClipFilters): string => {
        return `
      brightness(${filters.brightness}%)
      contrast(${filters.contrast}%)
      saturate(${filters.saturation}%)
      grayscale(${filters.grayscale}%)
      sepia(${filters.sepia}%)
      blur(${filters.blur}px)
      hue-rotate(${filters.hueRotate}deg)
      invert(${filters.invert}%)
    `.trim();
    };

    return (
        <div
            ref={containerRef}
            className="comparison-view"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
                width,
                height,
                position: 'relative',
                overflow: 'hidden',
                cursor: orientation === 'vertical' ? 'ew-resize' : 'ns-resize'
            }}
        >
            {/* Original (no effects) */}
            <div
                className="comparison-original"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${clip.source})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: buildFilterString(defaultFilters)
                }}
            >
                <div className="label label-original">Original</div>
            </div>

            {/* Edited (with effects) */}
            <div
                className="comparison-edited"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${clip.source})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: clip.filters ? buildFilterString(clip.filters) : 'none',
                    clipPath: orientation === 'vertical'
                        ? `inset(0 ${100 - sliderPosition}% 0 0)`
                        : `inset(0 0 ${100 - sliderPosition}% 0)`
                }}
            >
                <div className="label label-edited">With Effects</div>
            </div>

            {/* Slider */}
            <div
                className="comparison-slider"
                style={{
                    position: 'absolute',
                    [orientation === 'vertical' ? 'left' : 'top']: `${sliderPosition}%`,
                    [orientation === 'vertical' ? 'top' : 'left']: 0,
                    [orientation === 'vertical' ? 'width' : 'height']: '4px',
                    [orientation === 'vertical' ? 'height' : 'width']: '100%',
                    background: '#FF6B35',
                    cursor: orientation === 'vertical' ? 'ew-resize' : 'ns-resize',
                    boxShadow: '0 0 10px rgba(255, 107, 53, 0.8)',
                    zIndex: 10
                }}
                onMouseDown={handleMouseDown}
            >
                <div
                    className="slider-handle"
                    style={{
                        position: 'absolute',
                        [orientation === 'vertical' ? 'left' : 'top']: '50%',
                        [orientation === 'vertical' ? 'top' : 'left']: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '40px',
                        height: '40px',
                        background: '#FF6B35',
                        border: '3px solid #fff',
                        borderRadius: '50%',
                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '20px',
                        fontWeight: 'bold'
                    }}
                >
                    {orientation === 'vertical' ? '⟷' : '⟱'}
                </div>
            </div>

            {/* Controls */}
            <div className="comparison-controls">
                <button
                    onClick={() => setOrientation(orientation === 'vertical' ? 'horizontal' : 'vertical')}
                    className="control-btn"
                >
                    {orientation === 'vertical' ? 'Horizontal' : 'Vertical'} Split
                </button>
                <button onClick={onToggle} className="control-btn close">
                    Close (C)
                </button>
            </div>

            <style>{`
        .comparison-view {
          user-select: none;
        }

        .label {
          position: absolute;
          padding: 6px 12px;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(10px);
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          color: #fff;
          z-index: 5;
        }

        .label-original {
          top: 10px;
          left: 10px;
        }

        .label-edited {
          top: 10px;
          right: 10px;
          background: rgba(255, 107, 53, 0.8);
        }

        .comparison-controls {
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          z-index: 20;
        }

        .control-btn {
          padding: 8px 16px;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          color: #fff;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .control-btn:hover {
          background: rgba(255, 107, 53, 0.3);
          border-color: #FF6B35;
        }

        .control-btn.close {
          background: rgba(239, 68, 68, 0.3);
          border-color: rgba(239, 68, 68, 0.5);
        }

        .control-btn.close:hover {
          background: rgba(239, 68, 68, 0.5);
        }
      `}</style>
        </div>
    );
}
