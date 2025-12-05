import React, { useState } from 'react';

interface RangeSliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: number;
  min: number;
  max: number;
  unit?: string;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({ 
  value, 
  min, 
  max, 
  unit = '',
  className = '', 
  style, 
  onPointerDown,
  onPointerUp,
  ...props 
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const val = Number(value);
  const minVal = Number(min);
  const maxVal = Number(max);
  
  const percent = Math.min(100, Math.max(0, ((val - minVal) / (maxVal - minVal)) * 100));

  const handlePointerDown = (e: React.PointerEvent<HTMLInputElement>) => { setIsDragging(true); setShowTooltip(true); if (onPointerDown) onPointerDown(e); };
  const handlePointerUp = (e: React.PointerEvent<HTMLInputElement>) => { setIsDragging(false); setShowTooltip(false); if (onPointerUp) onPointerUp(e); };
  const handleMouseEnter = () => { if (!isDragging) setShowTooltip(true); };
  const handleMouseLeave = () => { if (!isDragging) setShowTooltip(false); };
  const handleTouchStart = () => { setIsDragging(true); setShowTooltip(true); };
  const handleTouchEnd = () => { setIsDragging(false); setShowTooltip(false); };

  return (
    <div className={`relative flex items-center group ${className}`} style={style}>
        <div className={`absolute -top-[30px] left-0 transform -translate-x-1/2 bg-[#1a1a1a] text-white text-[10px] font-medium font-mono px-2 py-1 rounded border border-[#333] shadow-lg z-50 pointer-events-none transition-all duration-200 ease-out whitespace-nowrap ${showTooltip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`} style={{ left: `${percent}%` }}> {val}{unit} <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1a1a1a] border-r border-b border-[#333] rotate-45"></div> </div>
        <input type="range" value={val} min={minVal} max={maxVal} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}
            className={`
                appearance-none bg-transparent cursor-pointer focus:outline-none h-4 w-full block
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FF6B35] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-[0_2px_4px_rgba(0,0,0,0.3)] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:mt-[0px] 
                [&::-webkit-slider-runnable-track]:h-full [&::-webkit-slider-runnable-track]:bg-transparent 
                [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#FF6B35] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-[0_2px_4px_rgba(0,0,0,0.3)] [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:hover:scale-110
                [&::-moz-range-track]:h-full [&::-moz-range-track]:bg-transparent
            `}
            style={{ backgroundImage: `linear-gradient(to right, #FF6B35 ${percent}%, #404040 ${percent}%)`, backgroundSize: '100% 4px', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', borderRadius: '999px' }}
            {...props}
        />
    </div>
  );
};