/**
 * Audio Analysis Utility
 * Provides AI-powered audio analysis features including:
 * - Silence detection
 * - Beat detection
 * - Voice activity detection
 * - Audio level analysis for ducking
 */

export interface SilenceSegment {
    startTime: number;
    endTime: number;
    duration: number;
}

export interface BeatDetection {
    time: number;
    confidence: number;
    energy: number;
}

export interface VoiceSegment {
    startTime: number;
    endTime: number;
    confidence: number;
}

export interface AudioLevelData {
    time: number;
    rms: number;
    peak: number;
}

/**
 * Detect silent segments in audio
 * @param audioBuffer - Web Audio API AudioBuffer
 * @param thresholdDb - Silence threshold in decibels (-60 to -20)
 * @param minDuration - Minimum silence duration in seconds
 * @returns Array of silence segments
 */
export async function detectSilence(
    audioBuffer: AudioBuffer,
    thresholdDb: number = -40,
    minDuration: number = 0.5
): Promise<SilenceSegment[]> {
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const threshold = Math.pow(10, thresholdDb / 20); // Convert dB to linear

    const segments: SilenceSegment[] = [];
    let silenceStart: number | null = null;

    // Analyze in chunks of 0.1 seconds
    const chunkSize = Math.floor(sampleRate * 0.1);

    for (let i = 0; i < channelData.length; i += chunkSize) {
        const chunk = channelData.slice(i, Math.min(i + chunkSize, channelData.length));

        // Calculate RMS (Root Mean Square) for this chunk
        const rms = Math.sqrt(
            chunk.reduce((sum, sample) => sum + sample * sample, 0) / chunk.length
        );

        const currentTime = i / sampleRate;
        const isSilent = rms < threshold;

        if (isSilent && silenceStart === null) {
            // Start of silence
            silenceStart = currentTime;
        } else if (!isSilent && silenceStart !== null) {
            // End of silence
            const duration = currentTime - silenceStart;
            if (duration >= minDuration) {
                segments.push({
                    startTime: silenceStart,
                    endTime: currentTime,
                    duration
                });
            }
            silenceStart = null;
        }
    }

    // Handle silence at the end
    if (silenceStart !== null) {
        const endTime = audioBuffer.duration;
        const duration = endTime - silenceStart;
        if (duration >= minDuration) {
            segments.push({
                startTime: silenceStart,
                endTime,
                duration
            });
        }
    }

    return segments;
}

/**
 * Detect beats in audio using onset detection
 * @param audioBuffer - Web Audio API AudioBuffer
 * @param sensitivity - Detection sensitivity (0.1 to 1.0)
 * @returns Array of beat detections
 */
export async function detectBeats(
    audioBuffer: AudioBuffer,
    sensitivity: number = 0.5
): Promise<BeatDetection[]> {
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;

    // Calculate energy envelope
    const hopSize = 512;
    const energyValues: number[] = [];

    for (let i = 0; i < channelData.length; i += hopSize) {
        const chunk = channelData.slice(i, Math.min(i + hopSize, channelData.length));
        const energy = chunk.reduce((sum, sample) => sum + Math.abs(sample), 0) / chunk.length;
        energyValues.push(energy);
    }

    // Detect peaks in energy (onset detection)
    const beats: BeatDetection[] = [];
    const windowSize = 10; // Look at surrounding values

    // Calculate adaptive threshold
    const avgEnergy = energyValues.reduce((a, b) => a + b, 0) / energyValues.length;
    const threshold = avgEnergy * (1 + sensitivity);

    for (let i = windowSize; i < energyValues.length - windowSize; i++) {
        const current = energyValues[i];

        // Check if this is a local maximum
        const isLocalMax = energyValues
            .slice(i - windowSize, i + windowSize)
            .every((val, idx) => idx === windowSize || val <= current);

        if (isLocalMax && current > threshold) {
            const time = (i * hopSize) / sampleRate;
            const confidence = Math.min(current / (threshold * 2), 1.0);

            beats.push({
                time,
                confidence,
                energy: current
            });
        }
    }

    // Filter out beats that are too close together (< 0.1s)
    const filteredBeats: BeatDetection[] = [];
    let lastBeatTime = -1;

    for (const beat of beats) {
        if (beat.time - lastBeatTime >= 0.1) {
            filteredBeats.push(beat);
            lastBeatTime = beat.time;
        }
    }

    return filteredBeats;
}

/**
 * Detect voice activity in audio
 * @param audioBuffer - Web Audio API AudioBuffer
 * @returns Array of voice segments
 */
export async function detectVoiceActivity(
    audioBuffer: AudioBuffer
): Promise<VoiceSegment[]> {
    // Create offline audio context for analysis
    const offlineContext = new OfflineAudioContext(
        1,
        audioBuffer.length,
        audioBuffer.sampleRate
    );

    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;

    // Create analyzer for frequency analysis
    const analyzer = offlineContext.createAnalyser();
    analyzer.fftSize = 2048;

    source.connect(analyzer);
    analyzer.connect(offlineContext.destination);

    const segments: VoiceSegment[] = [];
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;

    // Analyze in chunks
    const chunkDuration = 0.2; // 200ms chunks
    const chunkSize = Math.floor(sampleRate * chunkDuration);

    let voiceStart: number | null = null;

    for (let i = 0; i < channelData.length; i += chunkSize) {
        const chunk = channelData.slice(i, Math.min(i + chunkSize, channelData.length));
        const currentTime = i / sampleRate;

        // Simple voice detection based on energy and zero-crossing rate
        const energy = chunk.reduce((sum, sample) => sum + sample * sample, 0) / chunk.length;

        // Count zero crossings (voice has more zero crossings than music)
        let zeroCrossings = 0;
        for (let j = 1; j < chunk.length; j++) {
            if ((chunk[j] >= 0 && chunk[j - 1] < 0) || (chunk[j] < 0 && chunk[j - 1] >= 0)) {
                zeroCrossings++;
            }
        }
        const zcr = zeroCrossings / chunk.length;

        // Voice typically has energy > 0.01 and ZCR between 0.05 and 0.15
        const isVoice = energy > 0.01 && zcr > 0.05 && zcr < 0.15;
        const confidence = isVoice ? Math.min(energy * 10, 1.0) : 0;

        if (isVoice && voiceStart === null) {
            voiceStart = currentTime;
        } else if (!isVoice && voiceStart !== null) {
            segments.push({
                startTime: voiceStart,
                endTime: currentTime,
                confidence: 0.7 // Simplified confidence
            });
            voiceStart = null;
        }
    }

    // Handle voice at the end
    if (voiceStart !== null) {
        segments.push({
            startTime: voiceStart,
            endTime: audioBuffer.duration,
            confidence: 0.7
        });
    }

    return segments;
}

/**
 * Analyze audio levels for visualization and ducking
 * @param audioBuffer - Web Audio API AudioBuffer
 * @param resolution - Time resolution in seconds
 * @returns Array of audio level data points
 */
export async function analyzeAudioLevels(
    audioBuffer: AudioBuffer,
    resolution: number = 0.05
): Promise<AudioLevelData[]> {
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const chunkSize = Math.floor(sampleRate * resolution);

    const levels: AudioLevelData[] = [];

    for (let i = 0; i < channelData.length; i += chunkSize) {
        const chunk = channelData.slice(i, Math.min(i + chunkSize, channelData.length));

        // Calculate RMS
        const rms = Math.sqrt(
            chunk.reduce((sum, sample) => sum + sample * sample, 0) / chunk.length
        );

        // Calculate peak
        const peak = Math.max(...chunk.map(Math.abs));

        levels.push({
            time: i / sampleRate,
            rms,
            peak
        });
    }

    return levels;
}

/**
 * Load audio from a video or audio element
 * @param element - HTMLMediaElement (video or audio)
 * @returns AudioBuffer
 */
export async function loadAudioFromElement(
    element: HTMLMediaElement
): Promise<AudioBuffer> {
    const audioContext = new AudioContext();

    // Create a MediaElementSource
    const source = audioContext.createMediaElementSource(element);

    // Create a destination for capturing
    const destination = audioContext.createMediaStreamDestination();
    source.connect(destination);

    // Record the audio
    const mediaRecorder = new MediaRecorder(destination.stream);
    const chunks: Blob[] = [];

    return new Promise((resolve, reject) => {
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

        mediaRecorder.onstop = async () => {
            const blob = new Blob(chunks, { type: 'audio/webm' });
            const arrayBuffer = await blob.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            resolve(audioBuffer);
        };

        mediaRecorder.onerror = reject;

        // Start recording
        element.currentTime = 0;
        mediaRecorder.start();
        element.play();

        // Stop when ended
        element.onended = () => {
            mediaRecorder.stop();
            element.pause();
            element.currentTime = 0;
        };
    });
}

/**
 * Load audio from a URL
 * @param url - Audio file URL
 * @returns AudioBuffer
 */
export async function loadAudioFromUrl(url: string): Promise<AudioBuffer> {
    const audioContext = new AudioContext();
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await audioContext.decodeAudioData(arrayBuffer);
}
