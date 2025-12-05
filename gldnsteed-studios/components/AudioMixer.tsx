import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Mic, Sliders, Activity, Music, Video, Headphones } from 'lucide-react';
import { Track } from '../types';
import { AudioMeter } from './AudioMeter';

interface AudioMixerProps {
    tracks: Track[];
    onVolumeChange: (trackId: string, volume: number) => void;
    onPanChange: (trackId: string, pan: number) => void;
    onMuteToggle: (trackId: string) => void;
    onSoloToggle: (trackId: string) => void;
    audioLevelRef?: React.MutableRefObject<{ l: number, r: number }>; // For Master Meter
}

export function AudioMixer({ tracks, onVolumeChange, onPanChange, onMuteToggle, onSoloToggle, audioLevelRef }: AudioMixerProps) {
    const [masterVolume, setMasterVolume] = useState(1);
    const audioTracks = tracks.filter(t => t.type === 'audio' || (t.type === 'video' && !t.isMuted));

    // Master Meter State
    const [masterLevels, setMasterLevels] = useState({ l: 0, r: 0 });
    const animationRef = useRef<number>();

    useEffect(() => {
        const updateMasterMeter = () => {
            if (audioLevelRef && audioLevelRef.current) {
                setMasterLevels({
                    l: Math.min(1, audioLevelRef.current.l),
                    r: Math.min(1, audioLevelRef.current.r)
                });
            }
            animationRef.current = requestAnimationFrame(updateMasterMeter);
        };
        updateMasterMeter();
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [audioLevelRef]);

    const getTrackIcon = (role: string) => {
        switch (role) {
            case 'music': return <Music size={16} />;
            case 'voice': return <Mic size={16} />;
            case 'sfx': return <Headphones size={16} />;
            default: return <Video size={16} />;
        }
    };

    return (
        <div className="bg-[#1e1e1e] border border-theme-border rounded-lg shadow-2xl flex flex-col h-full w-[800px] overflow-hidden">
            {/* Header */}
            <div className="h-10 bg-theme-panel border-b border-theme-border flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <Sliders size={16} className="text-theme-accent" />
                    Audio Mixer
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-theme-text-muted">48kHz / 24-bit</span>
                </div>
            </div>

            {/* Mixer Channels */}
            <div className="flex-1 overflow-x-auto p-4 flex gap-2">
                {audioTracks.map(track => (
                    <div key={track.id} className="w-24 bg-[#252525] border border-theme-border rounded flex flex-col relative group">
                        {/* Track Name */}
                        <div className="h-8 border-b border-theme-border flex items-center justify-center px-2 bg-[#2a2a2a]">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${track.isMuted ? 'bg-red-500/20 text-red-500' : 'bg-theme-accent/20 text-theme-accent'}`}>
                                {getTrackIcon(track.role)}
                            </div>
                            <span className="text-xs text-white font-medium truncate w-full" title={track.name}>
                                {track.name}
                            </span>
                        </div>

                        {/* Pan Control */}
                        <div className="h-12 border-b border-theme-border flex flex-col items-center justify-center p-1 gap-1">
                            <span className="text-[9px] text-theme-text-muted uppercase">Pan</span>
                            <input
                                type="range"
                                min="-1"
                                max="1"
                                step="0.1"
                                value={track.pan || 0}
                                onChange={(e) => onPanChange(track.id, parseFloat(e.target.value))}
                                className="w-16 h-1 bg-theme-surface rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-theme-accent"
                            />
                        </div>

                        {/* Meter & Fader Section */}
                        <div className="flex-1 flex justify-center p-2 gap-2 relative min-h-[150px]">
                            {/* Meter (Simulated for now) */}
                            <div className="w-2 bg-[#111] rounded-full overflow-hidden relative flex flex-col justify-end h-full">
                                <div
                                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-500 via-yellow-500 to-red-500 transition-all duration-75"
                                    style={{ height: `${track.isMuted ? 0 : track.volume * 60}%` }}
                                ></div>
                            </div>

                            {/* Fader Track */}
                            <div className="h-full relative w-8 flex justify-center">
                                <input
                                    type="range"
                                    min="0"
                                    max="1.2"
                                    step="0.01"
                                    value={track.volume}
                                    onChange={(e) => onVolumeChange(track.id, parseFloat(e.target.value))}
                                    className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-1 bg-transparent appearance-none cursor-pointer z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-theme-text [&::-webkit-slider-thumb]:rounded [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-runnable-track]:w-1 [&::-webkit-slider-runnable-track]:bg-[#111]"
                                    style={{
                                        WebkitAppearance: 'slider-vertical',
                                        writingMode: 'bt-lr' as any
                                    }}
                                />
                                {/* Fader Cap Visual */}
                                <div className="absolute w-1 h-full bg-[#111] rounded-full pointer-events-none"></div>
                            </div>
                        </div>

                        {/* Mute/Solo/Rec */}
                        <div className="h-20 border-t border-theme-border p-2 flex flex-col gap-1 bg-[#2a2a2a]">
                            <div className="flex gap-1">
                                <button
                                    onClick={() => onMuteToggle(track.id)}
                                    className={`flex-1 h-6 rounded text-[10px] font-bold border ${track.isMuted ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-theme-surface border-transparent text-theme-text-muted hover:text-white'}`}
                                >
                                    M
                                </button>
                                <button
                                    onClick={() => onSoloToggle(track.id)}
                                    className={`flex-1 h-6 rounded text-[10px] font-bold border ${track.isSolo ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' : 'bg-theme-surface border-transparent text-theme-text-muted hover:text-white'}`}
                                >
                                    S
                                </button>
                            </div>
                            <div className="text-center text-[10px] font-mono text-theme-accent mt-1">
                                {(track.volume * 100).toFixed(0)}%
                            </div>
                        </div>
                    </div>
                ))}

                {/* Master Channel */}
                <div className="w-28 bg-[#1a1a1a] border-l border-theme-border flex flex-col ml-2">
                    <div className="h-8 border-b border-theme-border flex items-center justify-center px-2 bg-[#222]">
                        <span className="text-xs text-theme-accent font-bold uppercase tracking-wider">Master</span>
                    </div>
                    <div className="flex-1 flex justify-center p-4 gap-3 min-h-[150px]">
                        {/* Master Meters (L/R) - Real Data */}
                        <div className="flex gap-1 h-full pt-4 pb-4">
                            <div className="w-3 bg-[#111] rounded-full overflow-hidden relative flex flex-col justify-end">
                                <div
                                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-500 via-yellow-500 to-red-500 transition-all duration-75"
                                    style={{ height: `${masterLevels.l * 100}%` }}
                                ></div>
                            </div>
                            <div className="w-3 bg-[#111] rounded-full overflow-hidden relative flex flex-col justify-end">
                                <div
                                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-500 via-yellow-500 to-red-500 transition-all duration-75"
                                    style={{ height: `${masterLevels.r * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="h-full relative w-8 flex justify-center">
                            <input
                                type="range"
                                min="0"
                                max="1.2"
                                step="0.01"
                                value={masterVolume}
                                onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                                className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-1 bg-transparent appearance-none cursor-pointer z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-10 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-theme-accent [&::-webkit-slider-thumb]:rounded [&::-webkit-slider-thumb]:shadow-lg"
                                style={{
                                    WebkitAppearance: 'slider-vertical',
                                    writingMode: 'bt-lr' as any
                                }}
                            />
                            <div className="absolute w-1.5 h-full bg-[#111] rounded-full pointer-events-none"></div>
                        </div>
                    </div>
                    <div className="h-12 border-t border-theme-border p-2 flex items-center justify-center bg-[#222]">
                        <div className="text-lg font-mono font-bold text-white">
                            {(masterVolume * 100).toFixed(0)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
