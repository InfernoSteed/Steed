
import React, { useState } from 'react';
import { Button } from './Button';
import { ProjectSettings } from '../types';
import { Settings, X, Monitor, Smartphone, Layout } from 'lucide-react';

interface ProjectSettingsModalProps {
    settings: ProjectSettings;
    onClose: () => void;
    onSave: (settings: ProjectSettings) => void;
}

export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({ settings, onClose, onSave }) => {
    const [width, setWidth] = useState(settings.width);
    const [height, setHeight] = useState(settings.height);
    const [fps, setFps] = useState(settings.fps);
    const [safeMargins, setSafeMargins] = useState(settings.safeMargins);

    const presets = [
        { label: 'YouTube (16:9)', w: 1920, h: 1080, icon: <Monitor size={20} /> },
        { label: 'TikTok / Shorts (9:16)', w: 1080, h: 1920, icon: <Smartphone size={20} /> },
        { label: 'Instagram (1:1)', w: 1080, h: 1080, icon: <Layout size={20} /> },
        { label: 'Instagram (4:5)', w: 1080, h: 1350, icon: <Layout size={20} /> },
        { label: '4K UHD (16:9)', w: 3840, h: 2160, icon: <Monitor size={20} /> },
    ];

    const handleApply = () => {
        onSave({ width, height, fps, safeMargins });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95">
            <div className="bg-theme-panel border border-theme-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">

                <div className="flex items-center justify-between p-4 border-b border-theme-border bg-theme-surface">
                    <h2 className="text-lg font-bold text-theme-text-highlight flex items-center gap-2">
                        <Settings className="text-theme-accent" size={20} />
                        Project Settings
                    </h2>
                    <Button variant="ghost" onClick={onClose}><X size={20} /></Button>
                </div>

                <div className="p-6 space-y-6">

                    {/* Presets */}
                    <div>
                        <label className="type-h3 text-[10px] mb-2 block">Resolution Presets</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {presets.map(p => (
                                <button
                                    key={p.label}
                                    onClick={() => { setWidth(p.w); setHeight(p.h); }}
                                    className={`flex flex-col items-center justify-center p-3 rounded border transition-all text-xs gap-1 ${width === p.w && height === p.h ? 'bg-theme-accent border-theme-accent text-white' : 'bg-theme-bg border-theme-border text-theme-text-muted hover:border-theme-text'}`}
                                >
                                    {p.icon}
                                    <span>{p.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Dimensions */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="type-h3 text-[10px] mb-1 block">Width</label>
                            <div className="relative">
                                <input type="number" value={width} onChange={(e) => setWidth(parseInt(e.target.value))} className="w-full bg-theme-bg border border-theme-border rounded px-3 py-2 text-sm text-white focus:border-theme-accent outline-none" />
                                <span className="absolute right-3 top-2 text-xs text-theme-text-muted">px</span>
                            </div>
                        </div>
                        <div>
                            <label className="type-h3 text-[10px] mb-1 block">Height</label>
                            <div className="relative">
                                <input type="number" value={height} onChange={(e) => setHeight(parseInt(e.target.value))} className="w-full bg-theme-bg border border-theme-border rounded px-3 py-2 text-sm text-white focus:border-theme-accent outline-none" />
                                <span className="absolute right-3 top-2 text-xs text-theme-text-muted">px</span>
                            </div>
                        </div>
                    </div>

                    {/* FPS & Margins */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="type-h3 text-[10px] mb-1 block">Frame Rate</label>
                            <select value={fps} onChange={(e) => setFps(parseInt(e.target.value))} className="w-full bg-theme-bg border border-theme-border rounded px-3 py-2 text-sm text-white focus:border-theme-accent outline-none appearance-none">
                                <option value="24">24 fps</option>
                                <option value="30">30 fps</option>
                                <option value="60">60 fps</option>
                            </select>
                        </div>
                        <div className="flex items-center">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${safeMargins ? 'bg-theme-accent border-theme-accent' : 'bg-theme-bg border-theme-border group-hover:border-theme-text'}`}>
                                    {safeMargins && <X size={14} className="text-white" />}
                                </div>
                                <span className="text-sm font-medium text-theme-text group-hover:text-white transition-colors">Show Safe Margins</span>
                                <input type="checkbox" className="hidden" checked={safeMargins} onChange={(e) => setSafeMargins(e.target.checked)} />
                            </label>
                        </div>
                    </div>

                </div>

                <div className="p-4 border-t border-theme-border bg-theme-panel flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" onClick={handleApply}>Apply Changes</Button>
                </div>

            </div>
        </div>
    );
};
