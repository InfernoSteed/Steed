import React, { useState } from 'react';

interface SafeZonesOverlayProps {
    width: number;
    height: number;
    isVisible: boolean;
    onToggle: () => void;
}

export function SafeZonesOverlay({ width, height, isVisible, onToggle }: SafeZonesOverlayProps) {
    const [titleSafePercent, setTitleSafePercent] = useState(90);
    const [actionSafePercent, setActionSafePercent] = useState(93);
    const [opacity, setOpacity] = useState(0.6);

    if (!isVisible) return null;

    // Calculate safe zone dimensions
    const titleSafeWidth = (width * titleSafePercent) / 100;
    const titleSafeHeight = (height * titleSafePercent) / 100;
    const titleSafeX = (width - titleSafeWidth) / 2;
    const titleSafeY = (height - titleSafeHeight) / 2;

    const actionSafeWidth = (width * actionSafePercent) / 100;
    const actionSafeHeight = (height * actionSafePercent) / 100;
    const actionSafeX = (width - actionSafeWidth) / 2;
    const actionSafeY = (height - actionSafeHeight) / 2;

    return (
        <>
            <svg
                className="safe-zones-overlay"
                width={width}
                height={height}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    pointerEvents: 'none',
                    zIndex: 10
                }}
            >
                {/* Action Safe Zone (outer, blue) */}
                <rect
                    x={actionSafeX}
                    y={actionSafeY}
                    width={actionSafeWidth}
                    height={actionSafeHeight}
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    strokeDasharray="5,5"
                    opacity={opacity}
                />
                <text
                    x={actionSafeX + 10}
                    y={actionSafeY + 20}
                    fill="#3B82F6"
                    fontSize="12"
                    fontWeight="bold"
                    opacity={opacity}
                >
                    Action Safe ({actionSafePercent}%)
                </text>

                {/* Title Safe Zone (inner, yellow) */}
                <rect
                    x={titleSafeX}
                    y={titleSafeY}
                    width={titleSafeWidth}
                    height={titleSafeHeight}
                    fill="none"
                    stroke="#EAB308"
                    strokeWidth={2}
                    strokeDasharray="5,5"
                    opacity={opacity}
                />
                <text
                    x={titleSafeX + 10}
                    y={titleSafeY + 20}
                    fill="#EAB308"
                    fontSize="12"
                    fontWeight="bold"
                    opacity={opacity}
                >
                    Title Safe ({titleSafePercent}%)
                </text>
            </svg>

            {/* Controls */}
            <div className="safe-zones-controls">
                <div className="control-row">
                    <label>Title Safe</label>
                    <input
                        type="range"
                        min="80"
                        max="95"
                        value={titleSafePercent}
                        onChange={(e) => setTitleSafePercent(parseInt(e.target.value))}
                    />
                    <span>{titleSafePercent}%</span>
                </div>

                <div className="control-row">
                    <label>Action Safe</label>
                    <input
                        type="range"
                        min="85"
                        max="98"
                        value={actionSafePercent}
                        onChange={(e) => setActionSafePercent(parseInt(e.target.value))}
                    />
                    <span>{actionSafePercent}%</span>
                </div>

                <div className="control-row">
                    <label>Opacity</label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={opacity}
                        onChange={(e) => setOpacity(parseFloat(e.target.value))}
                    />
                </div>

                <button onClick={onToggle} className="close-btn" title="Hide Safe Zones (Shift+G)">
                    Hide
                </button>
            </div>

            <style>{`
        .safe-zones-controls {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          z-index: 20;
          min-width: 250px;
        }

        .control-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .control-row label {
          font-size: 12px;
          color: #fff;
          min-width: 80px;
        }

        .control-row input[type="range"] {
          flex: 1;
        }

        .control-row span {
          font-size: 12px;
          color: #fff;
          min-width: 40px;
          text-align: right;
        }

        .close-btn {
          padding: 8px 12px;
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.4);
          border-radius: 4px;
          color: #fff;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 4px;
        }

        .close-btn:hover {
          background: rgba(239, 68, 68, 0.3);
        }
      `}</style>
        </>
    );
}
