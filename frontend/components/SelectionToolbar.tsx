import React from 'react';
import { Copy, Layers, Filter, Clock, FileVideo, RotateCcw, Maximize2 } from 'lucide-react';

interface SelectionToolbarProps {
    selectedCount: number;
    onSelectSimilar: () => void;
    onSelectByTrack: () => void;
    onSelectByEffect: () => void;
    onSelectByDuration: () => void;
    onSelectByType: () => void;
    onInvertSelection: () => void;
    onClearSelection: () => void;
}

export function SelectionToolbar({
    selectedCount,
    onSelectSimilar,
    onSelectByTrack,
    onSelectByEffect,
    onSelectByDuration,
    onSelectByType,
    onInvertSelection,
    onClearSelection
}: SelectionToolbarProps) {
    if (selectedCount === 0) return null;

    return (
        <div className="selection-toolbar">
            <div className="selection-info">
                <span className="count">{selectedCount}</span>
                <span className="label">clip{selectedCount !== 1 ? 's' : ''} selected</span>
            </div>

            <div className="selection-actions">
                <button onClick={onSelectSimilar} className="tool-btn" title="Select Similar Clips">
                    <Copy size={16} />
                    <span>Similar</span>
                </button>

                <button onClick={onSelectByTrack} className="tool-btn" title="Select All on Track">
                    <Layers size={16} />
                    <span>Track</span>
                </button>

                <button onClick={onSelectByEffect} className="tool-btn" title="Select by Effect">
                    <Filter size={16} />
                    <span>Effect</span>
                </button>

                <button onClick={onSelectByDuration} className="tool-btn" title="Select by Duration">
                    <Clock size={16} />
                    <span>Duration</span>
                </button>

                <button onClick={onSelectByType} className="tool-btn" title="Select by Type">
                    <FileVideo size={16} />
                    <span>Type</span>
                </button>

                <div className="divider" />

                <button onClick={onInvertSelection} className="tool-btn" title="Invert Selection">
                    <RotateCcw size={16} />
                    <span>Invert</span>
                </button>

                <button onClick={onClearSelection} className="tool-btn clear" title="Clear Selection">
                    <Maximize2 size={16} />
                    <span>Clear</span>
                </button>
            </div>

            <style>{`
        .selection-toolbar {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #2D2D2D 0%, #3D3D3D 100%);
          border: 1px solid #FF6B35;
          border-radius: 12px;
          padding: 12px 20px;
          display: flex;
          align-items: center;
          gap: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 107, 53, 0.3);
          z-index: 100;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            transform: translateX(-50%) translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }

        .selection-info {
          display: flex;
          align-items: center;
          gap: 8px;
          padding-right: 20px;
          border-right: 1px solid rgba(255, 255, 255, 0.1);
        }

        .selection-info .count {
          font-size: 24px;
          font-weight: bold;
          color: #FF6B35;
          line-height: 1;
        }

        .selection-info .label {
          font-size: 12px;
          color: #B8B8B8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .selection-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .tool-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          color: #fff;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tool-btn:hover {
          background: rgba(255, 107, 53, 0.2);
          border-color: #FF6B35;
          transform: translateY(-2px);
        }

        .tool-btn.clear {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.3);
        }

        .tool-btn.clear:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: #EF4444;
        }

        .divider {
          width: 1px;
          height: 24px;
          background: rgba(255, 255, 255, 0.1);
          margin: 0 4px;
        }
      `}</style>
        </div>
    );
}
