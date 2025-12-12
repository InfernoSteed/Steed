import React from 'react';
import { DuckingSettings } from '../types';
import { RangeSlider } from './RangeSlider';
import { X, Power, Activity } from 'lucide-react';

interface DuckingPanelProps {
    settings: DuckingSettings;
    onChange: (settings: DuckingSettings) => void;
    onClose: () => void;
}

export const DuckingPanel: React.FC<DuckingPanelProps> = ({ settings, onChange, onClose }) => {
    const handleChange = (key: keyof DuckingSettings, value: any) => {
        onChange({ ...settings, [key]: value });
    };

    return (
        <div className="bg-[#1e1e1e] border border-theme-border rounded-lg shadow-2xl flex flex-col w-80 overflow-hidden">
            {/* Header */}
            <div className="h-10 bg-theme-panel border-b border-theme-border flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <Activity size={16} className="text-theme-accent" />
                    Smart Ducking
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleChange('enabled', !settings.enabled)}
                        className={`p-1 rounded transition-colors ${settings.enabled ? 'text-theme-accent bg-theme-accent/10' : 'text-theme-text-muted hover:text-white'}`}
                        title={settings.enabled ? "Disable Ducking" : "Enable Ducking"}
                    >
                        <Power size={16} />
                    </button>
                    <button onClick={onClose} className="text-theme-text-muted hover:text-white">
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className={`p-4 space-y-4 ${!settings.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xs text-theme-text-muted uppercase">Threshold</label>
                        <span className="text-xs font-mono text-theme-accent">{settings.threshold} dB</span>
                    </div>
                    <RangeSlider
                        value={settings.threshold}
                        min={-60}
                        max={0}
                        step={1}
                        onChange={(e) => handleChange('threshold', parseFloat(e.target.value))}
                    />
                    <p className="text-[10px] text-theme-text-muted mt-1">Level at which ducking triggers</p>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xs text-theme-text-muted uppercase">Reduction</label>
                        <span className="text-xs font-mono text-theme-accent">{Math.round((1 - settings.reduction) * 100)}%</span>
                    </div>
                    <RangeSlider
                        value={settings.reduction}
                        min={0}
                        max={1}
                        step={0.01}
                        onChange={(e) => handleChange('reduction', parseFloat(e.target.value))}
                    />
                    <p className="text-[10px] text-theme-text-muted mt-1">Amount to lower background audio</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs text-theme-text-muted uppercase">Attack</label>
                            <span className="text-xs font-mono text-theme-accent">{settings.attack}s</span>
                        </div>
                        <RangeSlider
                            value={settings.attack}
                            min={0.01}
                            max={2}
                            step={0.01}
                            onChange={(e) => handleChange('attack', parseFloat(e.target.value))}
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs text-theme-text-muted uppercase">Release</label>
                            <span className="text-xs font-mono text-theme-accent">{settings.release}s</span>
                        </div>
                        <RangeSlider
                            value={settings.release}
                            min={0.1}
                            max={5}
                            step={0.1}
                            onChange={(e) => handleChange('release', parseFloat(e.target.value))}
                        />
                    </div>
                </div>

                <div className="pt-2 border-t border-theme-border">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.autoDetect}
                            onChange={(e) => handleChange('autoDetect', e.target.checked)}
                            className="rounded border-theme-border bg-theme-surface text-theme-accent focus:ring-theme-accent"
                        />
                        <span className="text-xs text-white">Auto-detect Voice Tracks</span>
                    </label>
                    <p className="text-[10px] text-theme-text-muted mt-1 ml-5">
                        Automatically identifies tracks with 'voice' role as triggers.
                    </p>
                </div>
            </div>
        </div>
    );
};
