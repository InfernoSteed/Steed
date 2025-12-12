import React, { useState } from 'react';
import { Grid3x3, Grid2x2, X } from 'lucide-react';

interface GridOverlayProps {
    width: number;
    height: number;
    isVisible: boolean;
    onToggle: () => void;
}

export function GridOverlay({ width, height, isVisible, onToggle }: GridOverlayProps) {
    const [gridType, setGridType] = useState<'thirds' | 'quarters' | 'center'>('thirds');
    const [opacity, setOpacity] = useState(0.5);
    const [color, setColor] = useState('#FFFFFF');

    if (!isVisible) return null;

    const renderGrid = () => {
        const lines: React.JSX.Element[] = [];

        if (gridType === 'thirds') {
            // Vertical lines (rule of thirds)
            const vSpacing = width / 3;
            for (let i = 1; i <= 2; i++) {
                lines.push(
                    <line
                        key={`v${i}`}
                        x1={vSpacing * i}
                        y1={0}
                        x2={vSpacing * i}
                        y2={height}
                        stroke={color}
                        strokeWidth={1}
                        opacity={opacity}
                    />
                );
            }

            // Horizontal lines (rule of thirds)
            const hSpacing = height / 3;
            for (let i = 1; i <= 2; i++) {
                lines.push(
                    <line
                        key={`h${i}`}
                        x1={0}
                        y1={hSpacing * i}
                        x2={width}
                        y2={hSpacing * i}
                        stroke={color}
                        strokeWidth={1}
                        opacity={opacity}
                    />
                );
            }
        } else if (gridType === 'quarters') {
            // Vertical lines (quarters)
            const vSpacing = width / 4;
            for (let i = 1; i <= 3; i++) {
                lines.push(
                    <line
                        key={`v${i}`}
                        x1={vSpacing * i}
                        y1={0}
                        x2={vSpacing * i}
                        y2={height}
                        stroke={color}
                        strokeWidth={1}
                        opacity={opacity}
                    />
                );
            }

            // Horizontal lines (quarters)
            const hSpacing = height / 4;
            for (let i = 1; i <= 3; i++) {
                lines.push(
                    <line
                        key={`h${i}`}
                        x1={0}
                        y1={hSpacing * i}
                        x2={width}
                        y2={hSpacing * i}
                        stroke={color}
                        strokeWidth={1}
                        opacity={opacity}
                    />
                );
            }
        } else if (gridType === 'center') {
            // Center cross
            lines.push(
                <line
                    key="v-center"
                    x1={width / 2}
                    y1={0}
                    x2={width / 2}
                    y2={height}
                    stroke={color}
                    strokeWidth={2}
                    opacity={opacity}
                />,
                <line
                    key="h-center"
                    x1={0}
                    y1={height / 2}
                    x2={width}
                    y2={height / 2}
                    stroke={color}
                    strokeWidth={2}
                    opacity={opacity}
                />
            );
        }

        return lines;
    };

    return (
        <>
            <svg
                className="grid-overlay"
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
                {renderGrid()}
            </svg>

            {/* Controls */}
            <div className="grid-controls">
                <div className="control-group">
                    <button
                        onClick={() => setGridType('thirds')}
                        className={gridType === 'thirds' ? 'active' : ''}
                        title="Rule of Thirds"
                    >
                        <Grid3x3 size={16} />
                    </button>
                    <button
                        onClick={() => setGridType('quarters')}
                        className={gridType === 'quarters' ? 'active' : ''}
                        title="Quarters"
                    >
                        <Grid2x2 size={16} />
                    </button>
                    <button
                        onClick={() => setGridType('center')}
                        className={gridType === 'center' ? 'active' : ''}
                        title="Center Cross"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="control-group">
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

                <div className="control-group">
                    <label>Color</label>
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                    />
                </div>

                <button onClick={onToggle} className="close-btn" title="Hide Grid (G)">
                    Hide
                </button>
            </div>

            <style>{`
        .grid-controls {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 12px;
          display: flex;
          gap: 12px;
          align-items: center;
          z-index: 20;
        }

        .control-group {
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .control-group label {
          font-size: 12px;
          color: #fff;
          margin-right: 4px;
        }

        .control-group button {
          padding: 6px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          color: #fff;
          cursor: pointer;
          transition: all 0.2s;
        }

        .control-group button:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .control-group button.active {
          background: #FF6B35;
          border-color: #FF6B35;
        }

        .control-group input[type="range"] {
          width: 80px;
        }

        .control-group input[type="color"] {
          width: 40px;
          height: 28px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .close-btn {
          padding: 6px 12px;
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.4);
          border-radius: 4px;
          color: #fff;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: rgba(239, 68, 68, 0.3);
        }
      `}</style>
        </>
    );
}
