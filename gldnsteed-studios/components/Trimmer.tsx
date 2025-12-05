import React, { useState, useRef, useEffect } from 'react';
import { Asset, Clip } from '../types';
import { formatTime } from '../utils';
import { Button } from './Button';
import { Check, X, RotateCcw } from 'lucide-react';

interface TrimmerProps {
  clip: Clip;
  asset: Asset;
  onApply: (startOffset: number, newDuration: number) => void;
  onCancel: () => void;
  onPreviewTime: (time: number) => void;
}

export const Trimmer: React.FC<TrimmerProps> = ({
  clip,
  asset,
  onApply,
  onCancel,
  onPreviewTime,
}) => {
  // Local state for the trim operation
  const [startOffset, setStartOffset] = useState(clip.offset);
  const [duration, setDuration] = useState(clip.duration);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);

  const endOffset = startOffset + duration;
  const totalDuration = asset.duration;

  // Handle Dragging
  const handleMouseMove = (e: MouseEvent) => {
    if (!containerRef.current || !isDragging) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    const timeAtCursor = percentage * totalDuration;

    if (isDragging === 'start') {
      // Adjust Start (Left Handle)
      // Max start is current end - min duration (e.g. 0.5s)
      const newStart = Math.min(timeAtCursor, endOffset - 0.5);
      const newDuration = endOffset - newStart;
      setStartOffset(newStart);
      setDuration(newDuration);
      onPreviewTime(newStart);
    } else if (isDragging === 'end') {
      // Adjust End (Right Handle)
      // Min end is start + min duration
      const newEnd = Math.max(timeAtCursor, startOffset + 0.5);
      const newDuration = newEnd - startOffset;
      setDuration(newDuration);
      onPreviewTime(newEnd);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startOffset, duration, totalDuration]);

  // Calculate percentages for UI rendering
  const leftPercent = (startOffset / totalDuration) * 100;
  const widthPercent = (duration / totalDuration) * 100;

  return (
    <div className="h-full bg-theme-bg flex flex-col border-t border-theme-border">
      {/* Header */}
      <div className="h-12 border-b border-theme-border flex items-center justify-between px-4 bg-theme-panel/50">
        <div className="flex items-center gap-4">
            <h3 className="font-semibold text-yellow-500 flex items-center gap-2">
                Trim Clip: <span className="text-theme-text">{clip.name}</span>
            </h3>
            <span className="text-xs text-theme-text-muted">
                Original: {formatTime(totalDuration)}
            </span>
        </div>
        <div className="flex items-center gap-2">
            <Button 
                variant="ghost" 
                onClick={() => {
                    setStartOffset(0);
                    setDuration(totalDuration);
                    onPreviewTime(0);
                }}
                className="text-xs"
                icon={<RotateCcw size={14} />}
            >
                Reset Full
            </Button>
            <div className="h-4 w-px bg-theme-border mx-1"></div>
            <Button variant="ghost" onClick={onCancel} icon={<X size={16} />}>Cancel</Button>
            <Button 
                variant="primary" 
                onClick={() => onApply(startOffset, duration)} 
                className="bg-yellow-600 hover:bg-yellow-700 border-transparent"
                icon={<Check size={16} />}
            >
                Apply Trim
            </Button>
        </div>
      </div>

      {/* Trimmer Area */}
      <div className="flex-1 flex flex-col justify-center px-8 relative select-none">
        
        {/* Time Labels */}
        <div className="flex justify-between text-xs text-theme-text-muted mb-2 font-mono">
            <span>{formatTime(startOffset)}</span>
            <span>Duration: {formatTime(duration)}</span>
            <span>{formatTime(endOffset)}</span>
        </div>

        {/* Track Bar */}
        <div 
            ref={containerRef}
            className="h-16 bg-theme-panel rounded-lg relative overflow-visible cursor-pointer border border-theme-border"
        >
            {/* Background (Inactive parts) */}
            <div className="absolute inset-0 bg-theme-panel rounded-lg"></div>

            {/* Active Region */}
            <div 
                className="absolute top-0 bottom-0 bg-yellow-500/20 border-t-2 border-b-2 border-yellow-500 z-10"
                style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
            >
                {/* Drag Handle Left */}
                <div 
                    className="absolute left-0 top-0 bottom-0 w-4 -ml-2 bg-yellow-600 rounded-l cursor-ew-resize flex items-center justify-center hover:bg-yellow-500 transition-colors z-20 shadow-lg"
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsDragging('start');
                        onPreviewTime(startOffset);
                    }}
                >
                    <div className="h-4 w-0.5 bg-theme-bg/50"></div>
                </div>

                {/* Drag Handle Right */}
                <div 
                    className="absolute right-0 top-0 bottom-0 w-4 -mr-2 bg-yellow-600 rounded-r cursor-ew-resize flex items-center justify-center hover:bg-yellow-500 transition-colors z-20 shadow-lg"
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsDragging('end');
                        onPreviewTime(endOffset);
                    }}
                >
                    <div className="h-4 w-0.5 bg-theme-bg/50"></div>
                </div>
            </div>

            {/* Waveform Mock (Visual Sugar) */}
            <div className="absolute inset-0 flex items-center gap-0.5 opacity-20 pointer-events-none px-2">
                 {Array.from({ length: 100 }).map((_, i) => (
                     <div key={i} className="flex-1 bg-theme-text" style={{ height: `${20 + Math.random() * 60}%` }}></div>
                 ))}
            </div>
        </div>
        
        <p className="text-center text-xs text-theme-text-muted mt-4">
            Drag handles to set In/Out points. The original file is preserved.
        </p>

      </div>
    </div>
  );
};