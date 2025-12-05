import React, { useState, useRef, useMemo } from 'react';
import { Keyframe } from '../types';
import { formatTime } from '../utils';

interface MiniKeyframeTimelineProps {
  keyframes: Keyframe[];
  duration: number; // Clip duration in seconds
  currentTime: number; // Relative to clip start
  min: number;
  max: number;
  onKeyframeMove: (id: string, newTime: number) => void;
  onSeek: (time: number) => void; // Relative time
}

export const MiniKeyframeTimeline: React.FC<MiniKeyframeTimelineProps> = ({
  keyframes,
  duration,
  currentTime,
  min,
  max,
  onKeyframeMove,
  onSeek
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragState, setDragState] = useState<{ id: string, startX: number, startTime: number } | null>(null);
  const [hoveredKeyframe, setHoveredKeyframe] = useState<string | null>(null);

  const width = 100;
  const height = 40;
  const paddingX = 2;
  const paddingY = 4;

  const timeToX = (t: number) => { return paddingX + (t / duration) * (width - 2 * paddingX); };
  const xToTime = (x: number) => { const px = Math.max(paddingX, Math.min(width - paddingX, x)); return ((px - paddingX) / (width - 2 * paddingX)) * duration; };
  const valueToY = (v: number) => { const range = max - min; const normalized = (v - min) / (range || 1); return (height - paddingY) - (normalized * (height - 2 * paddingY)); };

  const sortedKeyframes = useMemo(() => [...keyframes].sort((a, b) => a.time - b.time), [keyframes]);

  const pathD = useMemo(() => {
      if (sortedKeyframes.length === 0) return '';
      let d = '';
      if (sortedKeyframes[0].time > 0) {
          d += `M ${timeToX(0)} ${valueToY(sortedKeyframes[0].value)} `;
          d += `L ${timeToX(sortedKeyframes[0].time)} ${valueToY(sortedKeyframes[0].value)} `;
      } else {
          d += `M ${timeToX(sortedKeyframes[0].time)} ${valueToY(sortedKeyframes[0].value)} `;
      }
      for (let i = 0; i < sortedKeyframes.length - 1; i++) {
          const k1 = sortedKeyframes[i];
          const k2 = sortedKeyframes[i+1];
          d += `L ${timeToX(k2.time)} ${valueToY(k2.value)} `;
      }
      const last = sortedKeyframes[sortedKeyframes.length - 1];
      if (last.time < duration) {
          d += `L ${timeToX(duration)} ${valueToY(last.value)}`;
      }
      return d;
  }, [sortedKeyframes, duration, min, max]);

  const handlePointerDown = (e: React.PointerEvent, kf: Keyframe) => { e.stopPropagation(); e.preventDefault(); if (e.button !== 0) return; setDragState({ id: kf.id, startX: e.clientX, startTime: kf.time }); (e.target as Element).setPointerCapture(e.pointerId); };
  const handlePointerMove = (e: React.PointerEvent) => { if (!dragState || !svgRef.current) return; const rect = svgRef.current.getBoundingClientRect(); const scaleX = width / rect.width; const deltaScreen = e.clientX - dragState.startX; const deltaSvg = deltaScreen * scaleX; const startX = timeToX(dragState.startTime); const newX = startX + deltaSvg; const newTime = xToTime(newX); onKeyframeMove(dragState.id, newTime); onSeek(newTime); };
  const handlePointerUp = (e: React.PointerEvent) => { if (dragState) { setDragState(null); (e.target as Element).releasePointerCapture(e.pointerId); } };
  const handleTimelineClick = (e: React.MouseEvent) => { if (dragState) return; if (!svgRef.current) return; const rect = svgRef.current.getBoundingClientRect(); const x = (e.clientX - rect.left) / rect.width * width; const t = xToTime(x); onSeek(t); };

  return (
    <div className="w-full h-12 bg-[#2D2D2D] rounded border border-[#6B6B6B] mt-2 relative overflow-hidden select-none">
        <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} className="w-full h-full cursor-pointer" preserveAspectRatio="none" onClick={handleTimelineClick} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
            <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="#444" strokeWidth="0.5" strokeDasharray="2" />
            <path d={pathD} stroke="#FF6B35" strokeWidth="1" fill="none" opacity="0.8" />
            <line x1={timeToX(currentTime)} y1="0" x2={timeToX(currentTime)} y2={height} stroke="#ef4444" strokeWidth="0.5" />
            {sortedKeyframes.map(kf => {
                const isHovered = hoveredKeyframe === kf.id;
                const isDraggingKf = dragState?.id === kf.id;
                return (
                    <g key={kf.id}>
                        <circle cx={timeToX(kf.time)} cy={valueToY(kf.value)} r={isHovered || isDraggingKf ? 3 : 2} fill={isHovered || isDraggingKf ? "#fff" : "#FF6B35"} stroke={isHovered || isDraggingKf ? "#FF6B35" : "none"} strokeWidth="1" className="cursor-ew-resize transition-all duration-100" onPointerDown={(e) => handlePointerDown(e, kf)} onPointerEnter={() => setHoveredKeyframe(kf.id)} onPointerLeave={() => setHoveredKeyframe(null)} />
                        {(isHovered || isDraggingKf) && (
                            <foreignObject x={timeToX(kf.time) - 20} y={valueToY(kf.value) - 18} width="40" height="20" style={{ overflow: 'visible' }}>
                                <div className="bg-black/90 text-white text-[8px] px-1.5 py-0.5 rounded border border-white/20 whitespace-nowrap text-center transform -translate-x-1/2 flex flex-col items-center z-50">
                                    <span>{kf.value.toFixed(1)}</span>
                                    <span className="text-[7px] text-gray-400">{formatTime(kf.time)}</span>
                                </div>
                            </foreignObject>
                        )}
                    </g>
                );
            })}
        </svg>
    </div>
  );
};