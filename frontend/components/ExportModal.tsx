import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { ExportSettings } from '../types';
import { Download, X, Smartphone, Monitor, Instagram } from 'lucide-react';
import { formatTime } from '../utils';

interface ExportModalProps {
  duration: number;
  thumbnailUrl?: string;
  onClose: () => void;
  onExport: (settings: ExportSettings) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ duration, thumbnailUrl, onClose, onExport }) => {
  const [resolution, setResolution] = useState<{w: number, h: number, label: string}>({ w: 1920, h: 1080, label: 'YouTube (16:9)' });
  const [fps, setFps] = useState<24 | 30 | 60>(30);
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [format, setFormat] = useState<'webm' | 'mp4'>('webm');
  const [estimatedSize, setEstimatedSize] = useState<string>('0 MB');

  useEffect(() => {
    // Calculate estimated size
    // Bitrates: Low: 2.5 Mbps, Med: 5 Mbps, High: 8 Mbps
    let bitrate = 5000000;
    if (quality === 'low') bitrate = 2500000;
    if (quality === 'high') bitrate = 8000000;

    const sizeBits = bitrate * duration;
    const sizeBytes = sizeBits / 8;
    const sizeMB = sizeBytes / (1024 * 1024);
    setEstimatedSize(`${sizeMB.toFixed(1)} MB`);
  }, [duration, quality]);

  // Check MP4 support
  const mp4Supported = MediaRecorder.isTypeSupported('video/mp4') || MediaRecorder.isTypeSupported('video/mp4;codecs=avc1.42E01E,mp4a.40.2');

  const handlePreset = (preset: 'youtube' | 'tiktok' | 'instagram') => {
      switch (preset) {
          case 'youtube':
              setResolution({ w: 1920, h: 1080, label: 'YouTube (16:9)' });
              break;
          case 'tiktok':
              setResolution({ w: 1080, h: 1920, label: 'TikTok (9:16)' });
              break;
          case 'instagram':
              setResolution({ w: 1080, h: 1080, label: 'Instagram (1:1)' });
              break;
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-theme-panel border border-theme-border rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Preview Side */}
        <div className="w-full md:w-1/3 bg-theme-bg p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-theme-border">
             <h3 className="type-h3 mb-4">Preview</h3>
             <div 
                className="relative shadow-lg bg-black flex items-center justify-center overflow-hidden border border-theme-border"
                style={{ 
                    aspectRatio: `${resolution.w}/${resolution.h}`,
                    width: resolution.w > resolution.h ? '100%' : 'auto',
                    height: resolution.w > resolution.h ? 'auto' : '200px',
                    maxHeight: '200px'
                }}
             >
                 {thumbnailUrl ? (
                     <img src={thumbnailUrl} className="w-full h-full object-contain" alt="Thumbnail" />
                 ) : (
                     <div className="text-theme-text-muted text-xs">No Preview</div>
                 )}
                 
                 {/* Overlay Aspect Ratio Guide */}
                 <div className="absolute inset-0 border-2 border-white/20 pointer-events-none"></div>
             </div>
             <p className="mt-4 type-timecode">
                 {resolution.w} x {resolution.h}
             </p>
        </div>

        {/* Settings Side */}
        <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-theme-border bg-theme-panel">
            <h3 className="text-lg font-bold text-theme-text-highlight flex items-center gap-2">
                <Download size={20} className="text-theme-accent" />
                Export Video
            </h3>
            <button onClick={onClose} className="text-theme-text-muted hover:text-theme-text transition-colors">
                <X size={20} />
            </button>
            </div>

            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            
            {/* Presets */}
            <div>
                <label className="type-h3 block mb-3 text-[10px]">Presets</label>
                <div className="grid grid-cols-3 gap-3">
                    <button 
                        onClick={() => handlePreset('youtube')}
                        className={`flex flex-col items-center justify-center gap-2 py-3 px-2 rounded-lg border transition-all ${resolution.label.includes('YouTube') ? 'bg-theme-accent border-theme-accent text-white' : 'bg-theme-surface border-theme-border text-theme-text-muted hover:border-theme-text-muted hover:bg-theme-panel'}`}
                    >
                        <Monitor size={20} />
                        <span className="text-xs font-medium">YouTube</span>
                        <span className="text-[10px] opacity-70">16:9</span>
                    </button>
                    <button 
                        onClick={() => handlePreset('tiktok')}
                        className={`flex flex-col items-center justify-center gap-2 py-3 px-2 rounded-lg border transition-all ${resolution.label.includes('TikTok') ? 'bg-theme-accent border-theme-accent text-white' : 'bg-theme-surface border-theme-border text-theme-text-muted hover:border-theme-text-muted hover:bg-theme-panel'}`}
                    >
                        <Smartphone size={20} />
                        <span className="text-xs font-medium">TikTok</span>
                        <span className="text-[10px] opacity-70">9:16</span>
                    </button>
                    <button 
                        onClick={() => handlePreset('instagram')}
                        className={`flex flex-col items-center justify-center gap-2 py-3 px-2 rounded-lg border transition-all ${resolution.label.includes('Instagram') ? 'bg-theme-accent border-theme-accent text-white' : 'bg-theme-surface border-theme-border text-theme-text-muted hover:border-theme-text-muted hover:bg-theme-panel'}`}
                    >
                        <Instagram size={20} />
                        <span className="text-xs font-medium">Instagram</span>
                        <span className="text-[10px] opacity-70">1:1</span>
                    </button>
                </div>
            </div>

            {/* Format & FPS */}
            <div className="grid grid-cols-2 gap-6">
                 <div>
                    <label className="type-h3 block mb-2 text-[10px]">Format</label>
                    <div className="flex bg-theme-surface rounded-lg p-1 border border-theme-border">
                        <button 
                            onClick={() => setFormat('webm')}
                            className={`flex-1 py-1.5 text-xs font-medium rounded ${format === 'webm' ? 'bg-theme-panel text-theme-text-highlight shadow-sm' : 'text-theme-text-muted hover:text-theme-text'}`}
                        >
                            WebM
                        </button>
                        <button 
                            onClick={() => setFormat('mp4')}
                            disabled={!mp4Supported}
                            className={`flex-1 py-1.5 text-xs font-medium rounded ${format === 'mp4' ? 'bg-theme-panel text-theme-text-highlight shadow-sm' : 'text-theme-text-muted hover:text-theme-text'} ${!mp4Supported ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={!mp4Supported ? "MP4 export not supported in this browser" : ""}
                        >
                            MP4
                        </button>
                    </div>
                 </div>
                 <div>
                    <label className="type-h3 block mb-2 text-[10px]">Frame Rate</label>
                    <div className="flex bg-theme-surface rounded-lg p-1 border border-theme-border">
                        {[24, 30, 60].map((r) => (
                            <button 
                                key={r}
                                onClick={() => setFps(r as any)}
                                className={`flex-1 py-1.5 text-xs font-medium rounded ${fps === r ? 'bg-theme-panel text-theme-text-highlight shadow-sm' : 'text-theme-text-muted hover:text-theme-text'}`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                 </div>
            </div>

            {/* Quality */}
            <div>
                <label className="type-h3 block mb-2 text-[10px]">Quality</label>
                <div className="grid grid-cols-3 gap-3">
                    {['low', 'medium', 'high'].map((q) => (
                        <button 
                            key={q}
                            onClick={() => setQuality(q as any)}
                            className={`py-2 px-3 rounded-lg border text-sm font-medium capitalize transition-all ${quality === q ? 'bg-theme-accent border-theme-accent text-white' : 'bg-theme-surface border-theme-border text-theme-text hover:border-theme-text-muted'}`}
                        >
                            {q}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="flex gap-4">
                <div className="flex-1 bg-theme-surface rounded-lg p-3 border border-theme-border flex justify-between items-center text-xs">
                    <span className="text-theme-text-muted">Est. Size</span>
                    <span className="font-mono text-theme-text-highlight">{estimatedSize}</span>
                </div>
                <div className="flex-1 bg-theme-surface rounded-lg p-3 border border-theme-border flex justify-between items-center text-xs">
                    <span className="text-theme-text-muted">Duration</span>
                    <span className="font-mono text-theme-text-highlight">{formatTime(duration).split('.')[0]}</span>
                </div>
            </div>

            </div>

            <div className="p-4 border-t border-theme-border bg-theme-panel flex justify-end gap-3">
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button 
                    variant="primary" 
                    onClick={() => onExport({ width: resolution.w, height: resolution.h, fps, quality, format })}
                    className="px-6"
                >
                    Start Export
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
};