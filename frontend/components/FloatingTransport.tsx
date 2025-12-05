import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Volume2, VolumeX } from 'lucide-react';

interface FloatingTransportProps {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    onTogglePlay: () => void;
    onSeek: (time: number) => void;
    isLooping: boolean;
    onToggleLoop: () => void;
    volume: number;
    onVolumeChange: (volume: number) => void;
    isMuted: boolean;
    onToggleMute: () => void;
}

export const FloatingTransport: React.FC<FloatingTransportProps> = ({
    isPlaying,
    currentTime,
    duration,
    onTogglePlay,
    onSeek,
    isLooping,
    onToggleLoop,
    volume,
    onVolumeChange,
    isMuted,
    onToggleMute
}) => {
    const formatTimecode = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        const frames = Math.floor((time % 1) * 30); // Assuming 30fps
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
    };

    return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-3 rounded-full glass-panel animate-in slide-in-from-bottom-4 duration-500 shadow-2xl">
            {/* Timecode */}
            <div className="font-mono text-xl font-bold text-theme-accent tracking-widest tabular-nums select-none">
                {formatTimecode(currentTime)}
            </div>

            <div className="w-px h-8 bg-white/10" />

            {/* Transport Controls */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onSeek(0)}
                    className="p-2 text-theme-text-muted hover:text-white transition-colors rounded-full hover:bg-white/5"
                    title="Go to Start"
                >
                    <SkipBack size={18} />
                </button>

                <button
                    onClick={onTogglePlay}
                    className="w-12 h-12 rounded-full bg-theme-accent text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,220,115,0.3)] hover:shadow-[0_0_30px_rgba(255,220,115,0.5)]"
                >
                    {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                </button>

                <button
                    onClick={() => onSeek(duration)}
                    className="p-2 text-theme-text-muted hover:text-white transition-colors rounded-full hover:bg-white/5"
                    title="Go to End"
                >
                    <SkipForward size={18} />
                </button>
            </div>

            <div className="w-px h-8 bg-white/10" />

            {/* Secondary Controls */}
            <div className="flex items-center gap-2">
                <button
                    onClick={onToggleLoop}
                    className={`p-2 transition-colors rounded-full hover:bg-white/5 ${isLooping ? 'text-theme-accent' : 'text-theme-text-muted hover:text-white'}`}
                    title="Toggle Loop"
                >
                    <Repeat size={18} />
                </button>

                <div className="flex items-center gap-2 relative">
                    <button
                        onClick={onToggleMute}
                        className={`peer p-2 transition-colors rounded-full hover:bg-white/5 ${isMuted ? 'text-theme-danger' : 'text-theme-text-muted hover:text-white'}`}
                    >
                        {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>

                    {/* Volume Slider Popup */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-8 h-24 bg-[#18181b] rounded-full border border-theme-border flex items-center justify-center opacity-0 peer-hover:opacity-100 peer-hover:pointer-events-auto hover:opacity-100 hover:pointer-events-auto pointer-events-none transition-all shadow-xl">
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={isMuted ? 0 : volume}
                            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                            className="w-20 h-1 -rotate-90 bg-theme-surface rounded-lg appearance-none cursor-pointer accent-theme-accent"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
