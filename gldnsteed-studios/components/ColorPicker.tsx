
import React, { useState, useEffect, useRef } from 'react';
import { Pipette, ChevronDown, Check, X } from 'lucide-react';
import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb, isValidHex } from '../utils/color';
import { getRecentColors, addRecentColor } from '../utils/storage';
import { RangeSlider } from './RangeSlider';
import { Button } from './Button';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ 
    color, onChange, label, onInteractionStart, onInteractionEnd 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'rgb' | 'hsl'>('rgb');
  const [localHex, setLocalHex] = useState(color);
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const popoverRef = useRef<HTMLDivElement>(null);

  // RGB State
  const rgb = hexToRgb(color);
  // HSL State
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  useEffect(() => {
      setLocalHex(color);
  }, [color]);

  useEffect(() => {
      if (isOpen) {
          setRecentColors(getRecentColors());
          if (onInteractionStart) onInteractionStart();
      } else {
          if (onInteractionEnd) onInteractionEnd();
      }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleColorChange = (newColor: string) => {
      setLocalHex(newColor);
      onChange(newColor);
  };

  const handleCommit = () => {
      addRecentColor(localHex);
      setIsOpen(false);
  };

  const handleEyeDropper = async () => {
      if (!(window as any).EyeDropper) {
          alert("Eyedropper not supported in this browser.");
          return;
      }
      try {
          const eyeDropper = new (window as any).EyeDropper();
          const result = await eyeDropper.open();
          handleColorChange(result.sRGBHex);
      } catch (e) {
          // Cancelled
      }
  };

  const updateRgb = (key: 'r' | 'g' | 'b', val: number) => {
      const newRgb = { ...rgb, [key]: val };
      const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
      handleColorChange(newHex);
  };

  const updateHsl = (key: 'h' | 's' | 'l', val: number) => {
      const newHsl = { ...hsl, [key]: val / (key === 'h' ? 1 : 100) }; // normalize back to 0-1 range for calc if needed? No helper handles degrees/percent
      // Actually my helper expects: h (0-360), s (0-1), l (0-1) -> NO, helper returns 0-100 for S/L. 
      // Let's check utility... rgbToHsl returns rounded 0-100 for S/L. hslToRgb expects h (0-360), s (0-1), l (0-1) for calc.
      // Wait, let's fix the call.
      
      const sNorm = key === 's' ? val / 100 : hsl.s / 100;
      const lNorm = key === 'l' ? val / 100 : hsl.l / 100;
      const hVal = key === 'h' ? val : hsl.h;
      
      const newRgb = hslToRgb(hVal, sNorm, lNorm);
      const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
      handleColorChange(newHex);
  };

  return (
    <div className="relative" ref={popoverRef}>
      <div className="flex justify-between items-center">
          {label && <label className="text-xs text-theme-text-muted font-medium">{label}</label>}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 bg-theme-bg border border-theme-border rounded px-2 py-1 hover:border-theme-accent transition-colors"
          >
              <div 
                className="w-4 h-4 rounded-sm shadow-sm border border-white/10" 
                style={{ backgroundColor: color }}
              ></div>
              <span className="text-xs font-mono text-theme-text uppercase">{color}</span>
          </button>
      </div>

      {isOpen && (
          <div className="absolute top-full right-0 mt-2 z-50 w-64 bg-theme-panel border border-theme-border rounded-lg shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-100">
              
              {/* Preview & Hex */}
              <div className="flex gap-3 mb-4">
                  <div 
                    className="w-12 h-12 rounded-lg shadow-inner border border-theme-border shrink-0"
                    style={{ backgroundColor: localHex }}
                  ></div>
                  <div className="flex-1">
                      <div className="flex items-center gap-1 bg-theme-surface rounded border border-theme-border px-2 py-1 mb-2">
                          <span className="text-xs text-theme-text-muted">#</span>
                          <input 
                            type="text" 
                            value={localHex.replace('#', '')}
                            onChange={(e) => {
                                const val = '#' + e.target.value;
                                setLocalHex(val);
                                if (isValidHex(val)) onChange(val);
                            }}
                            className="w-full bg-transparent text-xs font-mono text-theme-text focus:outline-none uppercase"
                          />
                      </div>
                      <button 
                        onClick={handleEyeDropper}
                        className="w-full flex items-center justify-center gap-2 bg-theme-surface hover:bg-theme-border text-theme-text text-xs py-1 rounded transition-colors"
                        title="Eyedropper"
                      >
                          <Pipette size={12} /> Pick Color
                      </button>
                  </div>
              </div>

              {/* Sliders */}
              <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                      <div className="flex bg-theme-surface rounded p-0.5">
                          <button 
                            onClick={() => setMode('rgb')}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded ${mode === 'rgb' ? 'bg-theme-panel text-theme-accent shadow-sm' : 'text-theme-text-muted hover:text-theme-text'}`}
                          >RGB</button>
                          <button 
                            onClick={() => setMode('hsl')}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded ${mode === 'hsl' ? 'bg-theme-panel text-theme-accent shadow-sm' : 'text-theme-text-muted hover:text-theme-text'}`}
                          >HSL</button>
                      </div>
                  </div>

                  {mode === 'rgb' && (
                      <div className="space-y-2">
                          <div className="flex items-center gap-2">
                              <span className="text-[10px] text-theme-text-muted w-3">R</span>
                              <RangeSlider min={0} max={255} value={rgb.r} onChange={(e) => updateRgb('r', Number(e.target.value))} className="flex-1" />
                              <input type="number" value={rgb.r} onChange={(e) => updateRgb('r', Number(e.target.value))} className="w-8 bg-theme-bg border border-theme-border rounded text-[10px] text-center focus:border-theme-accent outline-none" />
                          </div>
                          <div className="flex items-center gap-2">
                              <span className="text-[10px] text-theme-text-muted w-3">G</span>
                              <RangeSlider min={0} max={255} value={rgb.g} onChange={(e) => updateRgb('g', Number(e.target.value))} className="flex-1" />
                              <input type="number" value={rgb.g} onChange={(e) => updateRgb('g', Number(e.target.value))} className="w-8 bg-theme-bg border border-theme-border rounded text-[10px] text-center focus:border-theme-accent outline-none" />
                          </div>
                          <div className="flex items-center gap-2">
                              <span className="text-[10px] text-theme-text-muted w-3">B</span>
                              <RangeSlider min={0} max={255} value={rgb.b} onChange={(e) => updateRgb('b', Number(e.target.value))} className="flex-1" />
                              <input type="number" value={rgb.b} onChange={(e) => updateRgb('b', Number(e.target.value))} className="w-8 bg-theme-bg border border-theme-border rounded text-[10px] text-center focus:border-theme-accent outline-none" />
                          </div>
                      </div>
                  )}

                  {mode === 'hsl' && (
                      <div className="space-y-2">
                          <div className="flex items-center gap-2">
                              <span className="text-[10px] text-theme-text-muted w-3">H</span>
                              <div className="flex-1 relative h-4 rounded-full overflow-hidden">
                                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)' }}></div>
                                  <input type="range" min={0} max={360} value={hsl.h} onChange={(e) => updateHsl('h', Number(e.target.value))} className="absolute inset-0 w-full opacity-0 cursor-pointer" />
                                  <div className="absolute top-0 bottom-0 w-1 bg-white border border-black shadow pointer-events-none" style={{ left: `${(hsl.h/360)*100}%` }}></div>
                              </div>
                              <input type="number" value={hsl.h} onChange={(e) => updateHsl('h', Number(e.target.value))} className="w-8 bg-theme-bg border border-theme-border rounded text-[10px] text-center focus:border-theme-accent outline-none" />
                          </div>
                          <div className="flex items-center gap-2">
                              <span className="text-[10px] text-theme-text-muted w-3">S</span>
                              <RangeSlider min={0} max={100} value={hsl.s} onChange={(e) => updateHsl('s', Number(e.target.value))} className="flex-1" />
                              <input type="number" value={hsl.s} onChange={(e) => updateHsl('s', Number(e.target.value))} className="w-8 bg-theme-bg border border-theme-border rounded text-[10px] text-center focus:border-theme-accent outline-none" />
                          </div>
                          <div className="flex items-center gap-2">
                              <span className="text-[10px] text-theme-text-muted w-3">L</span>
                              <RangeSlider min={0} max={100} value={hsl.l} onChange={(e) => updateHsl('l', Number(e.target.value))} className="flex-1" />
                              <input type="number" value={hsl.l} onChange={(e) => updateHsl('l', Number(e.target.value))} className="w-8 bg-theme-bg border border-theme-border rounded text-[10px] text-center focus:border-theme-accent outline-none" />
                          </div>
                      </div>
                  )}
              </div>

              {/* Recents */}
              <div className="mb-4">
                  <label className="text-[10px] font-bold text-theme-text-muted uppercase mb-1 block">Recently Used</label>
                  <div className="grid grid-cols-8 gap-1">
                      {recentColors.map((c, i) => (
                          <button 
                            key={i}
                            onClick={() => handleColorChange(c)}
                            className="w-5 h-5 rounded-sm border border-theme-border hover:scale-110 transition-transform shadow-sm"
                            style={{ backgroundColor: c }}
                            title={c}
                          />
                      ))}
                  </div>
              </div>

              <Button variant="primary" onClick={handleCommit} className="w-full h-8 text-xs">Close</Button>
          </div>
      )}
    </div>
  );
};
