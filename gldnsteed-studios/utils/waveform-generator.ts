/**
 * Waveform Generator
 * Generates visual waveform data from audio sources
 */

export interface WaveformData {
    peaks: Float32Array;
    duration: number;
    sampleRate: number;
}

/**
 * Generate waveform data from audio URL
 */
export async function generateWaveform(
    audioUrl: string,
    samples: number = 200
): Promise<WaveformData> {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    try {
        // Fetch audio file
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();

        // Decode audio data
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Get channel data (use first channel or mix down to mono)
        const channelData = audioBuffer.getChannelData(0);
        const duration = audioBuffer.duration;
        const sampleRate = audioBuffer.sampleRate;

        // Calculate samples per block
        const blockSize = Math.floor(channelData.length / samples);
        const peaks = new Float32Array(samples);

        // Calculate peak values for each block
        for (let i = 0; i < samples; i++) {
            const start = i * blockSize;
            const end = start + blockSize;
            let max = 0;

            for (let j = start; j < end && j < channelData.length; j++) {
                const abs = Math.abs(channelData[j]);
                if (abs > max) max = abs;
            }

            peaks[i] = max;
        }

        return {
            peaks,
            duration,
            sampleRate
        };
    } finally {
        audioContext.close();
    }
}

/**
 * Generate waveform from HTML audio/video element
 */
export async function generateWaveformFromElement(
    element: HTMLAudioElement | HTMLVideoElement,
    samples: number = 200
): Promise<WaveformData> {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    try {
        // Create media element source
        const source = audioContext.createMediaElementSource(element);
        const analyser = audioContext.createAnalyser();

        source.connect(analyser);
        analyser.connect(audioContext.destination);

        analyser.fftSize = 2048;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const peaks = new Float32Array(samples);
        const duration = element.duration;

        // Sample at intervals
        const interval = duration / samples;

        for (let i = 0; i < samples; i++) {
            element.currentTime = i * interval;
            await new Promise(resolve => setTimeout(resolve, 10));

            analyser.getByteTimeDomainData(dataArray);

            let max = 0;
            for (let j = 0; j < bufferLength; j++) {
                const normalized = Math.abs((dataArray[j] - 128) / 128);
                if (normalized > max) max = normalized;
            }

            peaks[i] = max;
        }

        element.currentTime = 0;

        return {
            peaks,
            duration,
            sampleRate: audioContext.sampleRate
        };
    } finally {
        audioContext.close();
    }
}

/**
 * Render waveform as SVG path
 */
export function renderWaveformSVG(
    data: WaveformData,
    width: number,
    height: number,
    color: string = '#FF6B35',
    volumeIntensity: boolean = true
): string {
    const peaks = data.peaks;
    const barWidth = width / peaks.length;
    const centerY = height / 2;

    let path = '';

    for (let i = 0; i < peaks.length; i++) {
        const x = i * barWidth;
        const barHeight = peaks[i] * centerY;

        // Create vertical bar
        path += `M ${x},${centerY - barHeight} L ${x},${centerY + barHeight} `;
    }

    return path;
}

/**
 * Render waveform as Canvas
 */
export function renderWaveformCanvas(
    canvas: HTMLCanvasElement,
    data: WaveformData,
    baseColor: string = '#FF6B35',
    volumeIntensity: boolean = true
): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const peaks = data.peaks;
    const barWidth = width / peaks.length;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < peaks.length; i++) {
        const x = i * barWidth;
        const barHeight = peaks[i] * centerY;

        if (volumeIntensity) {
            // Color intensity based on volume
            const intensity = peaks[i];
            const alpha = Math.max(0.3, intensity);
            ctx.fillStyle = baseColor + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        } else {
            ctx.fillStyle = baseColor;
        }

        // Draw bar from center
        ctx.fillRect(x, centerY - barHeight, Math.max(1, barWidth - 1), barHeight * 2);
    }
}

/**
 * Get color with intensity
 */
export function getColorWithIntensity(
    baseColor: string,
    intensity: number
): string {
    // Parse hex color
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);

    // Apply intensity
    const alpha = Math.max(0.3, Math.min(1, intensity));

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Cache waveform data in IndexedDB
 */
export async function cacheWaveform(
    audioUrl: string,
    data: WaveformData
): Promise<void> {
    const db = await openWaveformDB();
    const transaction = db.transaction(['waveforms'], 'readwrite');
    const store = transaction.objectStore('waveforms');

    await store.put({
        url: audioUrl,
        data: {
            peaks: Array.from(data.peaks),
            duration: data.duration,
            sampleRate: data.sampleRate
        },
        timestamp: Date.now()
    });
}

/**
 * Get cached waveform data
 */
export async function getCachedWaveform(
    audioUrl: string
): Promise<WaveformData | null> {
    const db = await openWaveformDB();
    const transaction = db.transaction(['waveforms'], 'readonly');
    const store = transaction.objectStore('waveforms');

    return new Promise((resolve, reject) => {
        const request = store.get(audioUrl);
        request.onsuccess = () => {
            const result = request.result;
            if (result && result.data) {
                resolve({
                    peaks: new Float32Array(result.data.peaks),
                    duration: result.data.duration,
                    sampleRate: result.data.sampleRate
                });
            } else {
                resolve(null);
            }
        };
        request.onerror = () => reject(request.error);
    });
}

/**
 * Open IndexedDB for waveform caching
 */
function openWaveformDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('WaveformCache', 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains('waveforms')) {
                db.createObjectStore('waveforms', { keyPath: 'url' });
            }
        };
    });
}
