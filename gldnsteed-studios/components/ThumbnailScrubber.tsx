import React, { useState, useEffect } from 'react';
import { Clip } from '../types';
import { ThumbnailData, getThumbnailAtTime } from '../utils/thumbnail-generator';

interface ThumbnailScrubberProps {
    clip: Clip;
    thumbnailData: ThumbnailData | null;
    mouseX: number;
    mouseY: number;
    clipWidth: number;
    clipStartX: number;
}

export function ThumbnailScrubber({
    clip,
    thumbnailData,
    mouseX,
    mouseY,
    clipWidth,
    clipStartX
}: ThumbnailScrubberProps) {
    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const [timeAtCursor, setTimeAtCursor] = useState(0);

    useEffect(() => {
        if (!thumbnailData) return;

        // Calculate time based on mouse position
        const relativeX = mouseX - clipStartX;
        const percentage = relativeX / clipWidth;
        const time = clip.offset + (percentage * clip.duration);

        setTimeAtCursor(time);

        // Get thumbnail for this time
        const thumb = getThumbnailAtTime(thumbnailData, time);
        setThumbnail(thumb);
    }, [mouseX, clipStartX, clipWidth, clip, thumbnailData]);

    if (!thumbnail || !thumbnailData) return null;

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 100);
        return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    };

    return (
        <div
            className="thumbnail-scrubber"
            style={{
                left: mouseX,
                top: mouseY - 120,
                transform: 'translateX(-50%)'
            }}
        >
            <div className="thumbnail-image">
                <img src={thumbnail} alt="Preview" />
            </div>
            <div className="thumbnail-timecode">
                {formatTime(timeAtCursor)}
            </div>

            <style>{`
        .thumbnail-scrubber {
          position: fixed;
          z-index: 1000;
          pointer-events: none;
          animation: thumbnailFadeIn 0.15s ease-out;
        }

        @keyframes thumbnailFadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        .thumbnail-image {
          width: 160px;
          height: 90px;
          border-radius: 6px;
          overflow: hidden;
          border: 2px solid #FF6B35;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 107, 53, 0.4);
          background: #000;
        }

        .thumbnail-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .thumbnail-timecode {
          margin-top: 6px;
          padding: 4px 8px;
          background: rgba(0, 0, 0, 0.9);
          border: 1px solid #FF6B35;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          color: #FF6B35;
          text-align: center;
          font-family: 'Courier New', monospace;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
        }

        .thumbnail-scrubber::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid #FF6B35;
        }
      `}</style>
        </div>
    );
}
