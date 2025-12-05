
import { Keyframe } from './types';
import { workerPool } from './utils/workerPool';

export const formatTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);

  const hDisplay = h > 0 ? `${h.toString().padStart(2, '0')}:` : '';
  const mDisplay = `${m.toString().padStart(2, '0')}:`;
  const sDisplay = `${s.toString().padStart(2, '0')}`;
  const msDisplay = `.${ms.toString().padStart(2, '0')}`;

  return `${hDisplay}${mDisplay}${sDisplay}${msDisplay}`;
};

export const formatDuration = (seconds: number): string => {
    if (!isFinite(seconds) || seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

export const extractWaveform = async (url: string): Promise<number[]> => {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // Offload heavy processing to worker
    // We need to pass the raw data (Float32Array)
    const rawData = audioBuffer.getChannelData(0); // Left channel
    const samples = 100;
    
    // Use worker pool
    const result = await workerPool.run<number[]>('AUDIO_WAVEFORM', { 
        channelData: rawData, 
        samples 
    }, [rawData.buffer]); // Transfer buffer ownership for zero-copy

    return result;
  } catch (e) {
    console.error("Error generating waveform", e);
    return new Array(100).fill(0.1);
  }
};

export const getInterpolatedValue = (keyframes: Keyframe[], time: number, defaultValue: number): number => {
    if (!keyframes || keyframes.length === 0) return defaultValue;
    
    // Sort keys by time
    const sorted = [...keyframes].sort((a, b) => a.time - b.time);
    
    // Before first keyframe
    if (time <= sorted[0].time) return sorted[0].value;
    
    // After last keyframe
    if (time >= sorted[sorted.length - 1].time) return sorted[sorted.length - 1].value;
    
    // Interpolate between keyframes
    for (let i = 0; i < sorted.length - 1; i++) {
        const k1 = sorted[i];
        const k2 = sorted[i+1];
        if (time >= k1.time && time < k2.time) {
            const t = (time - k1.time) / (k2.time - k1.time);
            return k1.value + (k2.value - k1.value) * t;
        }
    }
    
    return defaultValue;
}

export const revokeObjectURL = (url: string) => {
    if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
    }
};

// Easing Functions
export type EasingType = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce' | 'elastic';

export const EasingFunctions = {
  linear: (t: number) => t,
  easeIn: (t: number) => t * t,
  easeOut: (t: number) => t * (2 - t),
  easeInOut: (t: number) => t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  bounce: (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },
  elastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  }
};
