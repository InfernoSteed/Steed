
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ClipFilters, Transition, TransitionType, Clip, TextEntranceType, TextExitType, AnimatableProperty, ChromaKeySettings, ClipBorder, Keyframe, Asset } from '../types';
import { Button } from './Button';
import { RangeSlider } from './RangeSlider';
import { ColorPicker } from './ColorPicker';
import { MiniKeyframeTimeline } from './MiniKeyframeTimeline';
import { AudioEffectsList } from './AudioEffectsList';
import { RotateCcw, Timer, Diamond, Plus, LayoutTemplate, Grid3X3, ArrowDownLeft, ArrowDownRight, ArrowUpLeft, ArrowUpRight, Spline, Mic, ChevronDown, Wand2, ZoomIn, ZoomOut, ArrowLeft, ArrowRight, RotateCw, Save, Trash2, X, Link2, Unlink2, Copy, ClipboardPaste, Activity, AlertTriangle, Info, Search, History as HistoryIcon, Clock, Undo2, Redo2, Loader2, Check, FolderPlus, Folder, Lightbulb, Grid, Circle, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, PaintBucket } from 'lucide-react';
import { getSavedMotionPresets, saveMotionPreset, deleteMotionPreset, SavedMotionPreset, RecentProperty, getRecentProperties, addRecentProperty, CustomPropertyGroup, getCustomPropertyGroups, saveCustomPropertyGroup, deleteCustomPropertyGroup } from '../utils/storage';
import { generateId, EasingType, EasingFunctions, formatTime } from '../utils';

const FONT_FAMILIES = [
    'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS', 'Trebuchet MS', 'Arial Black', 'Impact'
];

interface FilterPanelProps {
    clip: Clip;
    asset?: Asset;
    currentTime: number;
    onChange: (key: keyof ClipFilters | string, value: number | string) => void;
    onTransformChange: (key: AnimatableProperty | Partial<Record<AnimatableProperty, number>>, value?: number, applyToAll?: boolean) => void;
    onTransitionChange: (type: TransitionType, duration: number) => void;
    onTextAnimationChange: (key: 'entranceType' | 'entranceDuration' | 'exitType' | 'exitDuration', value: string | number) => void;
    onAudioFadeChange?: (key: 'fadeIn' | 'fadeOut', value: number) => void;
    onChromaKeyChange: (key: keyof ChromaKeySettings, value: string | number | boolean) => void;
    onReset: () => void;
    onKeyframeToggle: (property: AnimatableProperty) => void;
    onKeyframeAction: (property: AnimatableProperty, action: 'add' | 'remove') => void;
    onKeyframeMove: (property: AnimatableProperty, id: string, newTime: number) => void;
    onSeek: (time: number) => void;
    onApplyMotionPreset: (preset: 'ken-burns' | 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right' | 'rotate-cw' | 'rotate-ccw', intensity: number, easing: EasingType) => void;
    onClearMotion: () => void;
    onApplyLayout: (type: 'full' | 'split-v' | 'split-h' | 'pip') => void;
    onBorderChange: (key: keyof ClipBorder, value: string | number) => void;
    onTranscribe: (clipId: string) => void;
    onApplyCustomMotionPreset: (preset: SavedMotionPreset) => void;
    onCopyProperties: () => void;
    onPasteProperties: () => void;
    canPaste: boolean;
    onInteractionStart: () => void;
    onInteractionEnd: () => void;
    getPropertyHistoryStatus?: (path: string) => { canUndo: boolean, canRedo: boolean };
    onPropertyHistoryAction?: (path: string, action: 'undo' | 'redo') => void;
    width?: number;
    isTranscribing?: boolean;
    onAutoColor?: () => Promise<void>; // NEW
}

const NumericInput: React.FC<{ value: number; onChange: (val: number) => void; onInteractionStart: () => void; onInteractionEnd: () => void; className?: string; id?: string; min?: number; max?: number; label?: string }> = ({ value, onChange, onInteractionStart, onInteractionEnd, className, id, min, max, label }) => {
    const [localValue, setLocalValue] = useState(String(Math.round(value * 100) / 100));
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => { if (!isEditing) setLocalValue(String(Math.round(value * 100) / 100)); }, [value, isEditing]);

    const validate = (val: number) => { if (min !== undefined && val < min) return `Min: ${min}`; if (max !== undefined && val > max) return `Max: ${max}`; return null; };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { const newVal = e.target.value; setLocalValue(newVal); if (!newVal || newVal === '-') return; const val = parseFloat(newVal); if (isNaN(val)) setError('Invalid'); else { const err = validate(val); setError(err); if (!err) onChange(val); } };
    const handleBlur = () => { setIsEditing(false); const final = parseFloat(localValue); if (isNaN(final) || validate(final)) { onChange(value); setLocalValue(String(Math.round(value * 100) / 100)); } else onChange(final); setError(null); onInteractionEnd(); };

    return (
        <div className="relative">
            <input type="text" id={id} aria-label={label} value={localValue} onChange={handleChange} onFocus={() => { setIsEditing(true); onInteractionStart(); }} onBlur={handleBlur} className={`bg-[#333] text-[#e0e0e0] border border-transparent focus:border-[#FF6B35] rounded px-2 py-1 text-xs font-mono text-right w-16 outline-none transition-colors ${className} ${error ? 'border-red-500' : ''}`} />
        </div>
    );
};

const Section: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-[#333]">
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                className="w-full h-10 px-4 bg-[#2D2D2D] hover:bg-[#333] flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-theme-accent justify-between"
            >
                <span className="text-[12px] uppercase font-semibold text-[#B8B8B8] tracking-wider">{title}</span>
                <ChevronDown size={14} className={`text-[#6B6B6B] transition-transform ${isOpen ? 'rotate-180 text-[#FF6B35]' : ''}`} aria-hidden="true" />
            </button>
            {isOpen && <div className="p-4 bg-[#2A2A2A] space-y-4 animate-in slide-in-from-top-2 duration-200">{children}</div>}
        </div>
    );
};

const RotationDial: React.FC<{ value: number; onChange: (val: number) => void }> = ({ value, onChange }) => {
    const handleMouseDown = (e: React.MouseEvent) => {
        const startX = e.clientX;
        const startVal = value;
        const handleMove = (ev: MouseEvent) => {
            const dx = ev.clientX - startX;
            onChange((startVal + dx) % 360);
        };
        const handleUp = () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp); };
        window.addEventListener('mousemove', handleMove); window.addEventListener('mouseup', handleUp);
    };
    return (
        <div className="relative w-12 h-12 cursor-ew-resize group" onMouseDown={handleMouseDown} role="slider" aria-label="Rotation" aria-valuenow={value} aria-valuemin={0} aria-valuemax={360} tabIndex={0} onKeyDown={(e) => { if (e.key === 'ArrowRight') onChange((value + 1) % 360); if (e.key === 'ArrowLeft') onChange((value - 1) % 360); }}>
            <svg width="48" height="48" className="bg-[#333] rounded-full border border-[#444] group-hover:border-[#FF6B35] transition-colors focus:ring-2 focus:ring-theme-accent">
                <circle cx="24" cy="24" r="2" fill="#666" />
                <line x1="24" y1="24" x2={24 + Math.cos((value - 90) * Math.PI / 180) * 16} y2={24 + Math.sin((value - 90) * Math.PI / 180) * 16} stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" />
            </svg>
        </div>
    );
};

const AnchorGrid: React.FC = () => {
    return (
        <div className="grid grid-cols-3 gap-1 w-12 h-12" role="radiogroup" aria-label="Anchor Point">
            {[...Array(9)].map((_, i) => (
                <div key={i} className={`w-full h-full rounded-sm bg-[#333] border border-[#444] hover:bg-[#FF6B35] cursor-pointer ${i === 4 ? 'bg-[#FF6B35]' : ''}`} role="radio" aria-checked={i === 4} tabIndex={0}></div>
            ))}
        </div>
    );
};

const PanSlider: React.FC<{ value: number; onChange: (val: number) => void }> = ({ value, onChange }) => {
    return (
        <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#6B6B6B]">L</span>
            <RangeSlider value={value} min={-1} max={1} step={0.01} onChange={(e) => onChange(parseFloat(e.target.value))} className="flex-1" aria-label="Audio Pan" />
            <span className="text-[10px] text-[#6B6B6B]">R</span>
        </div>
    );
};

export const FilterPanel: React.FC<FilterPanelProps & { width?: number }> = ({ clip, asset, currentTime, onChange, onTransformChange, onTransitionChange, onTextAnimationChange, onAudioFadeChange, onChromaKeyChange, onReset, onKeyframeToggle, onKeyframeAction, onKeyframeMove, onSeek, onApplyMotionPreset, onClearMotion, onApplyLayout, onBorderChange, onTranscribe, onApplyCustomMotionPreset, onCopyProperties, onPasteProperties, canPaste, onInteractionStart, onInteractionEnd, getPropertyHistoryStatus, onPropertyHistoryAction, width = 256, isTranscribing = false, onAutoColor }) => {
    const clipTime = currentTime - clip.startTime;
    const isAudio = clip.type === 'audio';
    const isVideo = clip.type === 'video';
    const isImage = clip.type === 'image';
    const isText = clip.type === 'text';
    const [isAutoColorLoading, setIsAutoColorLoading] = useState(false);

    const formatSeconds = (s: number) => {
        const pad = (n: number) => n < 10 ? `0${n}` : n;
        const m = Math.floor(s / 60);
        const sc = Math.floor(s % 60);
        const ms = Math.floor((s % 1) * 100);
        return `${pad(m)}:${pad(sc)}:${pad(ms)}`;
    };

    const handleAutoEnhance = async () => {
        if (onAutoColor) {
            setIsAutoColorLoading(true);
            await onAutoColor();
            setIsAutoColorLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#2A2A2A] border-l border-[#333] noise-texture">
            {/* Header */}
            <div className="h-12 flex items-center justify-between px-4 bg-gradient-to-r from-[#2D2D2D] to-[#252525] border-b border-[#333]">
                <span className="font-bold text-sm text-[#E0E0E0] truncate">{clip.name} Properties</span>
                <button className="text-[#6B6B6B] hover:text-[#FF6B35] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent rounded"><X size={16} aria-hidden="true" /></button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">

                {/* TEXT SECTION */}
                {isText && (
                    <Section title="Text & Style">
                        <textarea
                            value={clip.content || ''}
                            onChange={(e) => onChange('content', e.target.value)}
                            className="w-full bg-[#333] border border-[#444] rounded p-2 text-xs text-[#e0e0e0] focus:border-[#FF6B35] outline-none min-h-[80px] mb-4"
                            placeholder="Enter text..."
                        />

                        <div className="mb-4">
                            <label className="block text-[10px] uppercase text-[#6B6B6B] mb-2">Typography</label>
                            <select value={clip.fontFamily || 'Arial'} onChange={(e) => onChange('fontFamily', e.target.value)} className="w-full bg-[#333] border border-[#444] rounded p-1.5 text-xs text-[#e0e0e0] outline-none mb-2">
                                {FONT_FAMILIES.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>

                            <div className="flex gap-1 mb-2">
                                <Button variant="secondary" className={`flex-1 h-8 ${clip.fontWeight === 'bold' ? 'bg-theme-accent text-white' : ''}`} onClick={() => onChange('fontWeight', clip.fontWeight === 'bold' ? 'normal' : 'bold')} title="Bold"><Bold size={14} /></Button>
                                <Button variant="secondary" className={`flex-1 h-8 ${clip.fontStyle === 'italic' ? 'bg-theme-accent text-white' : ''}`} onClick={() => onChange('fontStyle', clip.fontStyle === 'italic' ? 'normal' : 'italic')} title="Italic"><Italic size={14} /></Button>
                                <Button variant="secondary" className={`flex-1 h-8 ${clip.textDecoration === 'underline' ? 'bg-theme-accent text-white' : ''}`} onClick={() => onChange('textDecoration', clip.textDecoration === 'underline' ? 'none' : 'underline')} title="Underline"><Underline size={14} /></Button>
                            </div>

                            <div className="flex gap-1 mb-4">
                                <Button variant="secondary" className={`flex-1 h-8 ${clip.textAlign === 'left' ? 'bg-theme-accent text-white' : ''}`} onClick={() => onChange('textAlign', 'left')} title="Align Left"><AlignLeft size={14} /></Button>
                                <Button variant="secondary" className={`flex-1 h-8 ${!clip.textAlign || clip.textAlign === 'center' ? 'bg-theme-accent text-white' : ''}`} onClick={() => onChange('textAlign', 'center')} title="Align Center"><AlignCenter size={14} /></Button>
                                <Button variant="secondary" className={`flex-1 h-8 ${clip.textAlign === 'right' ? 'bg-theme-accent text-white' : ''}`} onClick={() => onChange('textAlign', 'right')} title="Align Right"><AlignRight size={14} /></Button>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-[10px] uppercase text-[#6B6B6B] mb-2">Colors</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-[10px] text-[#888] block mb-1">Text Color</span>
                                    <ColorPicker color={clip.color || '#ffffff'} onChange={(c) => onChange('color', c)} />
                                </div>
                                <div>
                                    <span className="text-[10px] text-[#888] block mb-1">Background</span>
                                    <ColorPicker color={clip.backgroundColor || 'transparent'} onChange={(c) => onChange('backgroundColor', c)} label="Bg Color" />
                                </div>
                            </div>
                        </div>

                        {clip.backgroundColor && clip.backgroundColor !== 'transparent' && (
                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] text-[#888]">Bg Padding</span>
                                    <NumericInput value={clip.backgroundPadding || 0} onChange={(v) => onChange('backgroundPadding', v)} onInteractionStart={onInteractionStart} onInteractionEnd={onInteractionEnd} />
                                </div>
                                <RangeSlider value={clip.backgroundPadding || 0} min={0} max={50} onChange={(e) => onChange('backgroundPadding', parseFloat(e.target.value))} />
                            </div>
                        )}

                        <div className="mb-4 border-t border-[#333] pt-4">
                            <label className="block text-[10px] uppercase text-[#6B6B6B] mb-2">Size & Opacity</label>
                            <div className="mb-2 flex items-center gap-2">
                                <span className="text-xs w-12 text-[#888]">Size</span>
                                <RangeSlider value={clip.fontSize || 40} min={10} max={200} onChange={(e) => onChange('fontSize', parseFloat(e.target.value))} className="flex-1" />
                                <span className="text-xs font-mono w-8 text-right">{Math.round(clip.fontSize || 40)}</span>
                            </div>
                        </div>
                    </Section>
                )}

                {/* TRANSFORM SECTION */}
                {!isAudio && (
                    <Section title="Transform">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-[10px] uppercase text-[#6B6B6B] mb-2" id="lbl-pos">Position</label>
                                <div className="space-y-2" aria-labelledby="lbl-pos">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-[#888]">X</span>
                                        <NumericInput value={clip.position.x} onChange={(v) => onTransformChange('x', v)} onInteractionStart={onInteractionStart} onInteractionEnd={onInteractionEnd} label="Position X" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-[#888]">Y</span>
                                        <NumericInput value={clip.position.y} onChange={(v) => onTransformChange('y', v)} onInteractionStart={onInteractionStart} onInteractionEnd={onInteractionEnd} label="Position Y" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase text-[#6B6B6B] mb-2">Anchor</label>
                                <AnchorGrid />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-[10px] uppercase text-[#6B6B6B] mb-2 flex justify-between">
                                <span>Scale</span>
                                <button className="text-[#FF6B35] focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent rounded" aria-label="Toggle Link Scale"><Link2 size={12} /></button>
                            </label>
                            <div className="flex items-center gap-2">
                                <RangeSlider value={clip.scale} min={0.1} max={3} step={0.01} onChange={(e) => onTransformChange('scale', parseFloat(e.target.value))} className="flex-1" aria-label="Scale Slider" />
                                <NumericInput value={clip.scale} onChange={(v) => onTransformChange('scale', v)} onInteractionStart={onInteractionStart} onInteractionEnd={onInteractionEnd} step={0.01} label="Scale Input" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <label className="block text-[10px] uppercase text-[#6B6B6B] mb-2">Rotation</label>
                                <NumericInput value={clip.rotation} onChange={(v) => onTransformChange('rotation', v)} onInteractionStart={onInteractionStart} onInteractionEnd={onInteractionEnd} label="Rotation Input" />
                            </div>
                            <RotationDial value={clip.rotation} onChange={(v) => onTransformChange('rotation', v)} />
                        </div>
                    </Section>
                )}

                {/* APPEARANCE SECTION */}
                {!isAudio && (
                    <Section title="Appearance">
                        <div className="mb-4">
                            <label className="block text-[10px] uppercase text-[#6B6B6B] mb-2">Opacity</label>
                            <div className="flex items-center gap-2">
                                <RangeSlider value={clip.opacity} min={0} max={1} step={0.01} onChange={(e) => onTransformChange('opacity', parseFloat(e.target.value))} className="flex-1" aria-label="Opacity Slider" />
                                <NumericInput value={clip.opacity * 100} max={100} min={0} onChange={(v) => onTransformChange('opacity', v / 100)} onInteractionStart={onInteractionStart} onInteractionEnd={onInteractionEnd} label="Opacity Percentage" />
                                <span className="text-xs text-[#6B6B6B]">%</span>
                            </div>
                        </div>

                        {/* VIDEO FADE (Mapped to same property as Audio) */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-[10px] uppercase text-[#6B6B6B] mb-2">Fade In</label>
                                <NumericInput value={clip.fadeIn || 0} onChange={(v) => onChange('fadeIn', v)} onInteractionStart={onInteractionStart} onInteractionEnd={onInteractionEnd} label="Video Fade In" />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase text-[#6B6B6B] mb-2">Fade Out</label>
                                <NumericInput value={clip.fadeOut || 0} onChange={(v) => onChange('fadeOut', v)} onInteractionStart={onInteractionStart} onInteractionEnd={onInteractionEnd} label="Video Fade Out" />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-[10px] uppercase text-[#6B6B6B] mb-2" htmlFor="blend-mode">Blend Mode</label>
                            <select
                                id="blend-mode"
                                value={clip.blendMode || 'source-over'}
                                onChange={(e) => onChange('blendMode', e.target.value)}
                                className="w-full bg-[#333] text-[#e0e0e0] text-xs border border-transparent focus:border-[#FF6B35] rounded px-2 py-2 outline-none appearance-none cursor-pointer focus-visible:ring-2 focus-visible:ring-theme-accent"
                            >
                                <option value="source-over">Normal</option>
                                <option value="screen">Screen</option>
                                <option value="multiply">Multiply</option>
                                <option value="overlay">Overlay</option>
                                <option value="darken">Darken</option>
                                <option value="lighten">Lighten</option>
                                <option value="difference">Difference</option>
                                <option value="exclusion">Exclusion</option>
                                <option value="luminosity">Luminosity</option>
                            </select>
                        </div>

                        {/* Filters could be a nested list here */}
                        {(isVideo || isImage) && (
                            <div className="border-t border-[#333] pt-4 mt-2">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-[10px] uppercase text-[#6B6B6B]">Effects</label>
                                    {onAutoColor && (
                                        <Button
                                            variant="secondary"
                                            onClick={handleAutoEnhance}
                                            disabled={isAutoColorLoading}
                                            className="h-6 text-[10px] px-2 flex items-center gap-1 border border-theme-accent text-theme-accent hover:bg-theme-accent hover:text-white"
                                            title="Auto-enhance color balance"
                                        >
                                            {isAutoColorLoading ? <Loader2 size={10} className="animate-spin" /> : <Wand2 size={10} />}
                                            Auto Enhance
                                        </Button>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center"><span className="text-xs text-[#BBB]">Saturation</span> <NumericInput value={clip.filters?.saturation || 100} onChange={(v) => onChange('saturation', v)} onInteractionStart={onInteractionStart} onInteractionEnd={onInteractionEnd} className="w-12" label="Saturation" /></div>
                                    <div className="flex justify-between items-center"><span className="text-xs text-[#BBB]">Contrast</span> <NumericInput value={clip.filters?.contrast || 100} onChange={(v) => onChange('contrast', v)} onInteractionStart={onInteractionStart} onInteractionEnd={onInteractionEnd} className="w-12" label="Contrast" /></div>
                                    <div className="flex justify-between items-center"><span className="text-xs text-[#BBB]">Brightness</span> <NumericInput value={clip.filters?.brightness || 100} onChange={(v) => onChange('brightness', v)} onInteractionStart={onInteractionStart} onInteractionEnd={onInteractionEnd} className="w-12" label="Brightness" /></div>
                                    <div className="flex justify-between items-center"><span className="text-xs text-[#BBB]">Blur</span> <NumericInput value={clip.filters?.blur || 0} onChange={(v) => onChange('blur', v)} onInteractionStart={onInteractionStart} onInteractionEnd={onInteractionEnd} className="w-12" label="Blur" /></div>
                                </div>
                            </div>
                        )}
                    </Section>
                )}

                {/* TIMING SECTION */}
                <Section title="Timing">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-[10px] uppercase text-[#6B6B6B] mb-2">In Point</label>
                            <div className="bg-[#333] text-[#e0e0e0] text-xs font-mono py-1.5 px-2 rounded text-center border border-transparent focus-within:border-[#FF6B35]">
                                {formatSeconds(clip.offset)}
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase text-[#6B6B6B] mb-2">Out Point</label>
                            <div className="bg-[#333] text-[#e0e0e0] text-xs font-mono py-1.5 px-2 rounded text-center">
                                {formatSeconds(clip.offset + clip.duration * (clip.speed || 1))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-4 bg-[#333] p-2 rounded">
                        <span className="text-xs text-[#BBB]">Duration</span>
                        <span className="text-xs font-mono text-[#FF6B35] font-bold">{formatSeconds(clip.duration)}</span>
                    </div>

                    <div className="mb-4">
                        <label className="block text-[10px] uppercase text-[#6B6B6B] mb-2">Speed</label>
                        <div className="flex items-center gap-2">
                            <RangeSlider value={clip.speed || 1} min={0.25} max={4} step={0.25} onChange={(e) => onChange('speed', parseFloat(e.target.value))} className="flex-1" aria-label="Playback Speed" />
                            <span className="text-xs font-mono w-8 text-right">{clip.speed}x</span>
                        </div>
                    </div>
                </Section>

                {/* AUDIO SECTION */}
                {(isAudio || isVideo) && (
                    <Section title="Audio">
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-[10px] uppercase text-[#6B6B6B]">Volume</label>
                                <div className="flex items-center gap-2">
                                    <span className="text-[#FF6B35] font-mono text-[10px]">{Math.round(20 * Math.log10(clip.volume || 0.0001))} dB</span>
                                    <button
                                        onClick={() => onKeyframeToggle('volume')}
                                        className={`p-1 rounded hover:bg-[#333] transition-colors ${clip.keyframes?.volume ? 'text-theme-accent' : 'text-[#6B6B6B]'}`}
                                        title="Toggle Volume Automation"
                                    >
                                        <Diamond size={12} fill={clip.keyframes?.volume ? "currentColor" : "none"} />
                                    </button>
                                </div>
                            </div>
                            <RangeSlider value={clip.volume ?? 1} min={0} max={2} step={0.01} onChange={(e) => onChange('volume', parseFloat(e.target.value))} aria-label="Clip Volume" />

                            {/* Volume Keyframe Timeline */}
                            {clip.keyframes?.volume && (
                                <div className="mt-2">
                                    <MiniKeyframeTimeline
                                        keyframes={clip.keyframes.volume}
                                        duration={clip.duration}
                                        currentTime={clipTime}
                                        onKeyframeAction={(action) => onKeyframeAction('volume', action)}
                                        onKeyframeMove={(id, time) => onKeyframeMove('volume', id, time)}
                                        onSeek={(t) => onSeek(clip.startTime + t)}
                                        height={24}
                                        color="#FF6B35"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="mb-6">
                            <label className="block text-[10px] uppercase text-[#6B6B6B] mb-2">Pan</label>
                            <PanSlider value={clip.pan || 0} onChange={(v) => onChange('pan', v)} />
                        </div>

                        <div className="mb-6 border-t border-[#333] pt-4">
                            <AudioEffectsList
                                effects={clip.audioEffects || []}
                                onChange={(effects) => onChange('audioEffects', effects as any)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] uppercase text-[#6B6B6B] mb-2">Fade In</label>
                                <NumericInput value={clip.fadeIn || 0} onChange={(v) => onAudioFadeChange && onAudioFadeChange('fadeIn', v)} onInteractionStart={onInteractionStart} onInteractionEnd={onInteractionEnd} label="Fade In Duration" />
                                <div className="h-1 bg-[#333] mt-1 rounded overflow-hidden"><div className="h-full bg-[#666] origin-left" style={{ width: `${Math.min(100, (clip.fadeIn || 0) * 20)}%` }}></div></div>
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase text-[#6B6B6B] mb-2">Fade Out</label>
                                <NumericInput value={clip.fadeOut || 0} onChange={(v) => onAudioFadeChange && onAudioFadeChange('fadeOut', v)} onInteractionStart={onInteractionStart} onInteractionEnd={onInteractionEnd} label="Fade Out Duration" />
                                <div className="h-1 bg-[#333] mt-1 rounded overflow-hidden"><div className="h-full bg-[#666] origin-right ml-auto" style={{ width: `${Math.min(100, (clip.fadeOut || 0) * 20)}%` }}></div></div>
                            </div>
                        </div>
                    </Section>
                )}

            </div>
        </div >
    );
};
