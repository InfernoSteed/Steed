
import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Clip, Track, DuckingSettings, ExportSettings, PreviewQuality, ProjectSettings, ClipFilters } from '../types';
import { getInterpolatedValue } from '../utils';
import { createEffectChain } from '../utils/audioEffects';
import { frameCache } from '../utils/cache';
import { Camera, Maximize } from 'lucide-react';
import { workerPool } from '../utils/workerPool';

interface VideoStageProps {
    currentTime: number;
    tracks: Track[];
    isPlaying: boolean;
    playbackSpeed?: number; // NEW: Shuttle speed (e.g. -2, 1, 4)
    isExporting: boolean; // Export Mode flag
    isExportPaused?: boolean; // NEW: Pause state for export
    exportSettings?: ExportSettings; // Export Settings
    previewQuality?: PreviewQuality;
    volume: number; // Master volume
    isMuted: boolean;
    duckingSettings: DuckingSettings;
    projectSettings: ProjectSettings; // NEW
    onDurationChange: (duration: number) => void;
    onTimeUpdate: (time: number) => void;
    onEnded: () => void;
    onCanvasMouseDown?: (clipId: string, startX: number, startY: number) => void;
    selectedClipId: string | null;
    onError?: (error: string) => void; // Error callback
    onExportFinished?: (blob: Blob) => void; // NEW: Callback when export blob is ready
    audioLevelRef?: React.MutableRefObject<{ l: number, r: number }>; // Shared ref for meter
    onSnapshot?: () => void; // NEW
}

export interface VideoStageHandle {
    analyzeFrame: () => Promise<Partial<ClipFilters> | null>;
}

// Internal component for handling individual audio clips using Web Audio API
const AudioPlayer: React.FC<{
    clip: Clip;
    trackVolume: number;
    currentTime: number;
    isPlaying: boolean;
    playbackSpeed: number;
    masterVolume: number;
    shouldMute: boolean;
    audioContext: AudioContext;
    outputNode: AudioNode;
}> = ({ clip, trackVolume, currentTime, isPlaying, playbackSpeed, masterVolume, shouldMute, audioContext, outputNode }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const gainRef = useRef<GainNode | null>(null);
    const pannerRef = useRef<StereoPannerNode | null>(null);

    useEffect(() => {
        // Initialize Audio Graph
        if (!audioRef.current || !audioContext) return;

        const audioEl = audioRef.current;

        // Prevent creating multiple sources for the same element
        if (!sourceRef.current) {
            try {
                // We attach the node to the element to avoid re-creation issues if component remounts quickly
                if ((audioEl as any)._sourceNode) {
                    sourceRef.current = (audioEl as any)._sourceNode;
                } else {
                    sourceRef.current = audioContext.createMediaElementSource(audioEl);
                    (audioEl as any)._sourceNode = sourceRef.current;
                }
            } catch (e) {
                console.warn("Audio Source creation failed", e);
            }
        }

        // Build Graph: Source -> Panner -> Gain -> Output
        if (sourceRef.current) {
            if (!pannerRef.current) {
                pannerRef.current = audioContext.createStereoPanner();
            }
            if (!gainRef.current) {
                gainRef.current = audioContext.createGain();
            }

            sourceRef.current.connect(pannerRef.current);
            pannerRef.current.connect(gainRef.current);
            gainRef.current.connect(outputNode);
        }

        return () => {
            if (gainRef.current) {
                gainRef.current.disconnect();
                // Do not nullify refs immediately as they might be reused if re-mounted quickly? 
                // Actually, disconnection is enough.
            }
            if (pannerRef.current) {
                pannerRef.current.disconnect();
            }
        };
    }, [audioContext, outputNode]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        // 1. Calculate Base Volume
        // Mixing Formula: Master * Track * Clip
        // Mute if shuttling (speed != 1) or explicitly muted
        const isShuttling = playbackSpeed !== 1;

        // Calculate Volume from Keyframes if available
        let clipVolume = clip.volume ?? 1;
        if (clip.keyframes && clip.keyframes.volume && clip.keyframes.volume.length > 0) {
            const timeInClip = currentTime - clip.startTime;
            clipVolume = getInterpolatedValue(clip.keyframes.volume, timeInClip, 1);
        }

        const effectiveVolume = (shouldMute || isShuttling) ? 0 : Math.max(0, Math.min(1, masterVolume * trackVolume * clipVolume));

        // 2. Calculate Fade
        let fadeMultiplier = 1;
        const fadeIn = clip.fadeIn || 0;
        const fadeOut = clip.fadeOut || 0;
        const timeInClip = currentTime - clip.startTime;
        const timeUntilEnd = (clip.startTime + clip.duration) - currentTime;

        if (timeInClip < fadeIn && fadeIn > 0) {
            fadeMultiplier = timeInClip / fadeIn;
        } else if (timeUntilEnd < fadeOut && fadeOut > 0) {
            fadeMultiplier = timeUntilEnd / fadeOut;
        }

        fadeMultiplier = Math.max(0, Math.min(1, fadeMultiplier));

        // 3. Apply Volume & Pan
        // 3. Apply Volume & Pan
        if (gainRef.current && pannerRef.current && sourceRef.current && audioContext) {
            audio.volume = 1;
            const targetGain = effectiveVolume * fadeMultiplier;

            // Volume
            if (audioContext.state === 'running') {
                gainRef.current.gain.setTargetAtTime(targetGain, audioContext.currentTime, 0.05);
                pannerRef.current.pan.setTargetAtTime(clip.pan || 0, audioContext.currentTime, 0.1);
            } else {
                gainRef.current.gain.value = targetGain;
                pannerRef.current.pan.value = clip.pan || 0;
            }

            // Re-build effect chain
            try {
                sourceRef.current.disconnect();
            } catch (e) {
                // Ignore
            }

            if (clip.audioEffects && clip.audioEffects.length > 0) {
                createEffectChain(audioContext, sourceRef.current, gainRef.current, clip.audioEffects);
            } else {
                sourceRef.current.connect(gainRef.current);
            }
        } else if (gainRef.current && pannerRef.current) {
            audio.volume = 1;
            const targetGain = effectiveVolume * fadeMultiplier;
            if (audioContext && audioContext.state === 'running') {
                gainRef.current.gain.setTargetAtTime(targetGain, audioContext.currentTime, 0.05);
                pannerRef.current.pan.setTargetAtTime(clip.pan || 0, audioContext.currentTime, 0.1);
            } else {
                gainRef.current.gain.value = targetGain;
                pannerRef.current.pan.value = clip.pan || 0;
            }
        } else {
            // Fallback
            audio.volume = effectiveVolume * fadeMultiplier;
        }

        // 4. Playback Rate & Pitch
        const speed = clip.speed || 1;
        if (audio.playbackRate !== speed) {
            audio.playbackRate = speed;
            if ('preservesPitch' in audio) (audio as any).preservesPitch = true;
        }

        // 5. Sync Time
        const timeElapsedInClip = currentTime - clip.startTime;
        const expectedAudioTime = clip.offset + (timeElapsedInClip * speed);

        if (Math.abs(audio.currentTime - expectedAudioTime) > 0.25) {
            audio.currentTime = expectedAudioTime;
        }

        // 6. Play/Pause
        // Only play if global is playing AND playbackSpeed is 1 (normal forward)
        // We mute/pause for shuttle to avoid audio artifacts
        if (isPlaying && !isShuttling && audio.paused) {
            // Only try to play if we have a valid source
            if (audio.readyState >= 2 || audio.src) {
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(e => {
                        // Ignore AbortError which happens when pausing rapidly after playing
                        if (e.name !== 'AbortError' && e.name !== 'NotAllowedError') {
                            console.error("Audio play failed", e);
                        }
                    });
                }
            }
        } else if ((!isPlaying || isShuttling) && !audio.paused) {
            audio.pause();
        }
    }, [clip, trackVolume, currentTime, isPlaying, playbackSpeed, masterVolume, shouldMute, audioContext]);

    return <audio ref={audioRef} src={clip.source} crossOrigin="anonymous" />;
};

// Helper for chroma key calculation
const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 255, b: 0 };
};

export const VideoStage = forwardRef<VideoStageHandle, VideoStageProps>(({
    currentTime,
    tracks,
    isPlaying,
    playbackSpeed = 1,
    isExporting,
    isExportPaused = false,
    exportSettings,
    previewQuality = 'half',
    volume,
    isMuted,
    duckingSettings,
    projectSettings,
    onDurationChange,
    onTimeUpdate,
    onEnded,
    onCanvasMouseDown,
    selectedClipId,
    onError,
    onExportFinished,
    audioLevelRef,
    onSnapshot
}, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const snapshotCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const chromaCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const requestRef = useRef<number>(0);
    const lastMainClipIdRef = useRef<string | null>(null);
    const transitionSnapshotRef = useRef<boolean>(false);

    // Recording State
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const streamDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);

    // Shared Audio Context
    const [audioContext] = useState(() => new (window.AudioContext || (window as any).webkitAudioContext)());

    // Audio Buses
    const masterGainRef = useRef<GainNode | null>(null); // Master Gain before Destination
    const musicBusRef = useRef<GainNode | null>(null);
    const voiceBusRef = useRef<GainNode | null>(null);
    const sfxBusRef = useRef<GainNode | null>(null);
    const voiceAnalyserRef = useRef<AnalyserNode | null>(null);
    const compressorRef = useRef<DynamicsCompressorNode | null>(null);

    // Stereo Metering
    const splitterRef = useRef<ChannelSplitterNode | null>(null);
    const analyserLRef = useRef<AnalyserNode | null>(null);
    const analyserRRef = useRef<AnalyserNode | null>(null);

    // Cache for images
    const imageCacheRef = useRef<Record<string, HTMLImageElement>>({});

    // Expose methods to parent via Ref
    useImperativeHandle(ref, () => ({
        analyzeFrame: async () => {
            // Capture current state of the main video or image
            if (!tempCanvasRef.current) return null;

            let source: HTMLVideoElement | HTMLImageElement | null = null;

            // Identify main clip
            const active = getActiveClips().find(ac => ['video', 'image'].includes(ac.clip.type));
            if (!active) return null;

            if (active.clip.type === 'video' && videoRef.current) {
                source = videoRef.current;
            } else if (active.clip.type === 'image') {
                source = imageCacheRef.current[active.clip.source];
            }

            if (!source) return null;

            // Draw to temp canvas
            const ctx = tempCanvasRef.current.getContext('2d');
            if (!ctx) return null;

            const w = tempCanvasRef.current.width;
            const h = tempCanvasRef.current.height;
            ctx.drawImage(source, 0, 0, w, h);

            // Get Image Data
            const imageData = ctx.getImageData(0, 0, w, h);

            // Send to Worker
            try {
                const result = await workerPool.run<Partial<ClipFilters>>('ANALYZE_COLOR', {
                    data: imageData.data,
                    width: w,
                    height: h
                });
                return result;
            } catch (e) {
                console.error("Analysis Failed", e);
                return null;
            }
        }
    }));

    // Garbage Collection for Image Cache
    useEffect(() => {
        const interval = setInterval(() => {
            if (!tracks || tracks.length === 0) return;

            const activeSources = new Set<string>();
            tracks.forEach(track => {
                track.clips.forEach(clip => {
                    if (clip.type === 'image') {
                        activeSources.add(clip.source);
                    }
                });
            });

            // Check cache for unused images
            Object.keys(imageCacheRef.current).forEach(source => {
                if (!activeSources.has(source)) {
                    // Remove reference so GC can collect the element
                    delete imageCacheRef.current[source];
                }
            });

        }, 10000); // Run every 10 seconds

        return () => clearInterval(interval);
    }, [tracks]);

    useEffect(() => {
        // Setup Audio Buses
        if (!masterGainRef.current) {
            const masterGain = audioContext.createGain();

            // Stereo Analysis Setup
            const splitter = audioContext.createChannelSplitter(2);
            const analyserL = audioContext.createAnalyser();
            const analyserR = audioContext.createAnalyser();
            analyserL.fftSize = 256;
            analyserR.fftSize = 256;

            masterGain.connect(splitter);
            splitter.connect(analyserL, 0);
            splitter.connect(analyserR, 1);

            splitterRef.current = splitter;
            analyserLRef.current = analyserL;
            analyserRRef.current = analyserR;

            masterGain.connect(audioContext.destination);
            masterGainRef.current = masterGain;

            const compressor = audioContext.createDynamicsCompressor();
            compressor.connect(masterGain);
            compressorRef.current = compressor;

            const musicBus = audioContext.createGain();
            musicBus.connect(compressor);
            musicBusRef.current = musicBus;

            const voiceBus = audioContext.createGain();
            voiceBus.connect(compressor);
            voiceBusRef.current = voiceBus;

            const sfxBus = audioContext.createGain();
            sfxBus.connect(compressor);
            sfxBusRef.current = sfxBus;

            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.5;
            voiceBus.connect(analyser); // Monitor voice bus
            voiceAnalyserRef.current = analyser;
        }
    }, [audioContext]);

    // -- Export Logic --

    // 1. Start Recording when isExporting becomes true
    useEffect(() => {
        if (isExporting && canvasRef.current && masterGainRef.current && exportSettings) {
            console.log("Starting Export...", exportSettings);
            recordedChunksRef.current = [];

            try {
                // Audio Capture
                const streamDest = audioContext.createMediaStreamDestination();
                streamDestinationRef.current = streamDest;
                masterGainRef.current.connect(streamDest); // Connect output to stream

                // Video Capture
                const fps = exportSettings.fps;
                const canvasStream = canvasRef.current.captureStream(fps);

                // Combine Tracks
                const combinedStream = new MediaStream([
                    ...canvasStream.getVideoTracks(),
                    ...streamDest.stream.getAudioTracks()
                ]);

                // Setup Recorder - Try to find supported mime type
                let mimeType = 'video/webm'; // fallback

                if (exportSettings.format === 'mp4') {
                    if (MediaRecorder.isTypeSupported("video/mp4;codecs=avc1.42E01E,mp4a.40.2")) {
                        mimeType = "video/mp4;codecs=avc1.42E01E,mp4a.40.2";
                    } else if (MediaRecorder.isTypeSupported("video/mp4")) {
                        mimeType = "video/mp4";
                    } else {
                        console.warn("MP4 not supported, falling back to WebM");
                    }
                } else {
                    if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
                        mimeType = "video/webm;codecs=vp9";
                    }
                }

                // Calculate bitrate
                let bitsPerSecond = 5000000; // Medium
                if (exportSettings.quality === 'low') bitsPerSecond = 2500000;
                if (exportSettings.quality === 'high') bitsPerSecond = 8000000;

                const options: MediaRecorderOptions = { mimeType, videoBitsPerSecond: bitsPerSecond };

                const recorder = new MediaRecorder(combinedStream, options);

                recorder.ondataavailable = (e) => {
                    if (e.data.size > 0) {
                        recordedChunksRef.current.push(e.data);
                    }
                };

                recorder.onerror = (e) => {
                    console.error("Recorder Error", e);
                    if (onError) onError("Recording failed: " + (e as any).error?.message);
                };

                recorder.start();
                mediaRecorderRef.current = recorder;

            } catch (e: any) {
                console.error("MediaRecorder setup failed", e);
                if (onError) onError("Failed to start recording: " + e.message);
            }
        }

        return () => {
            // Cleanup usually happens on stop logic
        };
    }, [isExporting, audioContext, exportSettings, onError]);

    // 2. Handle Pause/Resume during Export
    useEffect(() => {
        if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return;

        if (isExportPaused) {
            if (mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.pause();
                // Suspend audio context to stop processing
                if (audioContext.state === 'running') audioContext.suspend();
            }
        } else {
            if (mediaRecorderRef.current.state === 'paused') {
                mediaRecorderRef.current.resume();
                // Resume audio context
                if (audioContext.state === 'suspended') audioContext.resume();
            }
        }
    }, [isExportPaused, audioContext]);

    // 3. Stop Recording & Download when isExporting becomes false
    useEffect(() => {
        if (!isExporting && mediaRecorderRef.current) {
            console.log("Stopping Export...");
            const recorder = mediaRecorderRef.current;

            if (recorder.state !== 'inactive') {
                recorder.stop();
            }

            recorder.onstop = () => {
                const mimeType = recorder.mimeType;
                const blob = new Blob(recordedChunksRef.current, { type: mimeType });

                // If blob size is 0, something failed
                if (blob.size === 0) {
                    if (onError) onError("Export failed: Output file is empty.");
                    return;
                }

                // Cleanup Audio Node
                if (streamDestinationRef.current && masterGainRef.current) {
                    masterGainRef.current.disconnect(streamDestinationRef.current);
                    streamDestinationRef.current = null;
                }

                // Call callback with blob
                if (onExportFinished) {
                    onExportFinished(blob);
                }

                // Reset State
                mediaRecorderRef.current = null;
                recordedChunksRef.current = [];
            };
        }
    }, [isExporting, onError, onExportFinished]);


    // Ducking & Metering Logic Loop
    useEffect(() => {
        let animationFrameId: number;
        const bufferLength = 128;
        const dataArrayVoice = new Uint8Array(bufferLength);
        const dataArrayL = new Uint8Array(bufferLength);
        const dataArrayR = new Uint8Array(bufferLength);

        const processAudio = () => {
            // Metering
            if (analyserLRef.current && analyserRRef.current && audioLevelRef) {
                analyserLRef.current.getByteTimeDomainData(dataArrayL);
                analyserRRef.current.getByteTimeDomainData(dataArrayR);

                let sumL = 0, sumR = 0;
                for (let i = 0; i < bufferLength; i++) {
                    const xL = (dataArrayL[i] - 128) / 128.0;
                    const xR = (dataArrayR[i] - 128) / 128.0;
                    sumL += xL * xL;
                    sumR += xR * xR;
                }
                const rmsL = Math.sqrt(sumL / bufferLength);
                const rmsR = Math.sqrt(sumR / bufferLength);

                // Apply smoothing?
                audioLevelRef.current = { l: rmsL * 5, r: rmsR * 5 }; // Boost for visibility
            }

            // Ducking
            if (duckingSettings.enabled && musicBusRef.current && voiceAnalyserRef.current) {
                voiceAnalyserRef.current.getByteTimeDomainData(dataArrayVoice);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    const x = (dataArrayVoice[i] - 128) / 128.0;
                    sum += x * x;
                }
                const rms = Math.sqrt(sum / bufferLength);
                const db = 20 * Math.log10(rms || 0.00001);

                const musicBus = musicBusRef.current;
                const now = audioContext.currentTime;

                if (db > duckingSettings.threshold) {
                    const target = 1 * (1 - duckingSettings.reduction);
                    musicBus.gain.setTargetAtTime(target, now, duckingSettings.attack);
                } else {
                    musicBus.gain.setTargetAtTime(1, now, duckingSettings.release);
                }
            }

            animationFrameId = requestAnimationFrame(processAudio);
        };

        if (isPlaying) {
            processAudio();
        } else {
            // Reset gain if stopped or disabled
            if (musicBusRef.current) {
                musicBusRef.current.gain.cancelScheduledValues(audioContext.currentTime);
                musicBusRef.current.gain.value = 1;
            }
            // Zero out meter
            if (audioLevelRef) audioLevelRef.current = { l: 0, r: 0 };
        }

        return () => cancelAnimationFrame(animationFrameId);
    }, [isPlaying, duckingSettings, audioContext, audioLevelRef]);


    // Resume AudioContext on interaction/play
    useEffect(() => {
        if (isPlaying && audioContext.state === 'suspended' && !isExportPaused) {
            audioContext.resume();
        }
    }, [isPlaying, audioContext, isExportPaused]);

    // Initialize temp canvases
    useEffect(() => {
        if (!tempCanvasRef.current) tempCanvasRef.current = document.createElement('canvas');
        if (!snapshotCanvasRef.current) snapshotCanvasRef.current = document.createElement('canvas');
        if (!chromaCanvasRef.current) chromaCanvasRef.current = document.createElement('canvas');
    }, []);

    // Determine if any track is soloed
    const isAnySolo = tracks.some(t => t.isSolo);

    // Calculate duration based on the furthest clip end time across all tracks
    useEffect(() => {
        let maxEndTime = 0;
        tracks.forEach(track => {
            track.clips.forEach(clip => {
                const clipEndTime = clip.startTime + clip.duration;
                if (clipEndTime > maxEndTime) {
                    maxEndTime = clipEndTime;
                }
            });
        });

        // Add a small buffer and set minimum duration
        const calculatedDuration = Math.max(10, maxEndTime + 2);
        onDurationChange(calculatedDuration);
    }, [tracks, onDurationChange]);

    // Helper: Find all active clips at current time
    const getActiveClips = () => {
        const active: { clip: Clip; track: Track }[] = [];
        tracks.forEach((track) => {
            if (track.isHidden) return;
            const clip = track.clips.find(c => currentTime >= c.startTime && currentTime < c.startTime + c.duration);
            if (clip) active.push({ clip, track });
        });
        return active;
    };

    const activeClips = getActiveClips();

    // Identify "Main" video clip (first active video type clip) for sync driving
    const mainVideoData = activeClips.find(ac => ac.clip.type === 'video');
    const mainVideoClip = mainVideoData?.clip || null;
    const mainVideoTrack = mainVideoData?.track || null;

    // Sync volume for Main Video Element
    useEffect(() => {
        if (videoRef.current) {
            if (mainVideoClip && mainVideoTrack) {
                const clipVol = mainVideoClip.volume ?? 1;
                const trackVol = mainVideoTrack.volume ?? 1;

                let shouldMute = isMuted;
                if (mainVideoTrack.isMuted) shouldMute = true;
                if (isAnySolo && !mainVideoTrack.isSolo) shouldMute = true;
                if (playbackSpeed !== 1) shouldMute = true; // Mute during shuttle

                const effectiveVolume = Math.max(0, Math.min(1, volume * trackVol * clipVol));
                videoRef.current.volume = shouldMute ? 0 : effectiveVolume;
                videoRef.current.muted = false;
            } else {
                videoRef.current.volume = 0;
            }
        }
    }, [volume, isMuted, isAnySolo, mainVideoClip?.volume, mainVideoTrack?.volume, mainVideoTrack?.isMuted, mainVideoTrack?.isSolo, playbackSpeed]);

    // Sync video element (Main Video)
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (mainVideoClip) {
            const clip = mainVideoClip;
            const speed = clip.speed || 1;

            // Update Rate
            if (video.playbackRate !== speed) {
                video.playbackRate = speed;
                if ('preservesPitch' in video) (video as any).preservesPitch = true;
            }

            const timeElapsedInClip = currentTime - clip.startTime;
            const expectedVideoTime = clip.offset + (timeElapsedInClip * speed);

            // Only update src if changed to avoid reloading
            if (video.src !== clip.source) {
                video.src = clip.source;
                video.currentTime = expectedVideoTime;
            }

            // If Shuttling (playbackSpeed != 1), we manually drive position via render loop logic updating `currentTime`.
            // We must sync the video element to this position and PAUSE it so its own clock doesn't fight us.
            if (isPlaying && playbackSpeed !== 1) {
                if (!video.paused) video.pause();
                if (Math.abs(video.currentTime - expectedVideoTime) > 0.1) {
                    video.currentTime = expectedVideoTime;
                }
            } else if (isPlaying && playbackSpeed === 1 && !isExportPaused) {
                // Standard Playback
                const diff = video.currentTime - expectedVideoTime;
                // Allow video to be ahead (due to React state lag) but enforce sync if behind or way off
                if (diff < -0.25 || diff > 1.0) {
                    video.currentTime = expectedVideoTime;
                }
                if (video.paused && video.readyState >= 2) {
                    const p = video.play();
                    if (p !== undefined) {
                        p.catch(e => {
                            if (e.name !== 'AbortError' && e.name !== 'NotAllowedError') console.error("Play failed", e);
                        });
                    }
                }
            } else {
                // Paused
                if (!video.paused) video.pause();
            }

        } else {
            if (!video.paused) video.pause();
            if (video.src) {
                video.removeAttribute('src'); // Clear source to stop buffering
                video.load();
            }
        }
    }, [currentTime, isPlaying, mainVideoClip, isExportPaused, playbackSpeed]);

    // Handle Image Caching
    useEffect(() => {
        activeClips.forEach(({ clip }) => {
            if (clip.type === 'image' && !imageCacheRef.current[clip.source]) {
                const img = new Image();
                img.src = clip.source;
                imageCacheRef.current[clip.source] = img;
            }
        });
    }, [activeClips]);

    // Handle Mouse Down for Dragging on Canvas
    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!onCanvasMouseDown || !canvasRef.current || isExporting) return;

        // Hit testing
        for (let i = activeClips.length - 1; i >= 0; i--) {
            const { clip } = activeClips[i];
            if (['text', 'image', 'video'].includes(clip.type)) {
                // Simple top-down selection without precise bounding box calculation for now
                onCanvasMouseDown(clip.id, e.clientX, e.clientY);
                return;
            }
        }
    };


    // Main Render Loop with Optimized Timing
    useEffect(() => {
        let animationId: number;
        let lastUpdateTime = performance.now();
        let internalTime = currentTime; // Track time internally

        const render = async (timestamp: number) => {
            // Don't render if export is paused
            if (isExporting && isExportPaused) {
                animationId = requestAnimationFrame(render);
                return;
            }

            const video = videoRef.current;
            const canvas = canvasRef.current;
            const tempCanvas = tempCanvasRef.current;
            const snapshotCanvas = snapshotCanvasRef.current;
            const chromaCanvas = chromaCanvasRef.current;
            const ctx = canvas?.getContext('2d', { willReadFrequently: true });

            if (canvas && ctx && tempCanvas && snapshotCanvas && chromaCanvas) {

                // Dynamic Resolution from Project Settings
                const baseW = projectSettings.width || 1920;
                const baseH = projectSettings.height || 1080;
                const fps = projectSettings.fps || 30;
                const frameDuration = 1 / fps; // in seconds

                // Update internal time for smooth playback
                if (isPlaying) {
                    const deltaTime = (timestamp - lastUpdateTime) / 1000; // Convert to seconds
                    lastUpdateTime = timestamp;

                    if (playbackSpeed !== 1) {
                        // Shuttle mode
                        internalTime += deltaTime * playbackSpeed;
                    } else if (mainVideoClip && video && video.readyState >= 2) {
                        // Sync to video element for smooth playback
                        const speed = mainVideoClip.speed || 1;
                        const relativeVideoTime = video.currentTime - mainVideoClip.offset;
                        const timeInClipOnTimeline = relativeVideoTime / speed;
                        const videoTime = mainVideoClip.startTime + timeInClipOnTimeline;

                        // Use video time directly for smoothest playback
                        internalTime = videoTime;
                    } else {
                        // No video, increment by delta
                        internalTime += deltaTime;
                    }

                    // Only update React state every few frames to reduce overhead
                    const timeDiff = Math.abs(internalTime - currentTime);
                    if (timeDiff > frameDuration * 0.5) { // Update if difference is more than half a frame
                        onTimeUpdate(internalTime);
                    }
                } else {
                    // Reset when not playing
                    internalTime = currentTime;
                    lastUpdateTime = timestamp;
                }


                // Adjust canvas resolution based on preview quality
                let renderW = baseW, renderH = baseH;
                if (!isExporting) {
                    if (previewQuality === 'half') { renderW = baseW / 2; renderH = baseH / 2; }
                    if (previewQuality === 'quarter') { renderW = baseW / 4; renderH = baseH / 4; }
                }

                // Set Canvas Size if Changed
                if (canvas.width !== renderW || canvas.height !== renderH) {
                    canvas.width = renderW; canvas.height = renderH;
                    tempCanvas.width = renderW; tempCanvas.height = renderH;
                    snapshotCanvas.width = renderW; snapshotCanvas.height = renderH;
                    chromaCanvas.width = renderW; chromaCanvas.height = renderH;
                }

                // Ensure buffers match base resolution
                if (tempCanvas.width !== baseW) tempCanvas.width = baseW;
                if (tempCanvas.height !== baseH) tempCanvas.height = baseH;
                if (snapshotCanvas.width !== baseW) snapshotCanvas.width = baseW;
                if (snapshotCanvas.height !== baseH) snapshotCanvas.height = baseH;
                if (chromaCanvas.width !== baseW) chromaCanvas.width = baseW;
                if (chromaCanvas.height !== baseH) chromaCanvas.height = baseH;

                // -- Snapshot Logic for Transitions --
                if (isPlaying && mainVideoClip && mainVideoClip.id !== lastMainClipIdRef.current) {
                    if (mainVideoClip.transition && mainVideoClip.transition.type !== 'none') {
                        const snapCtx = snapshotCanvas.getContext('2d');
                        if (snapCtx) {
                            snapCtx.clearRect(0, 0, baseW, baseH);
                            snapCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, baseW, baseH);
                            transitionSnapshotRef.current = true;
                        }
                    } else {
                        transitionSnapshotRef.current = false;
                    }
                    lastMainClipIdRef.current = mainVideoClip.id;
                }

                // -- Aspect Ratio Handling --
                const timelineAspect = baseW / baseH;
                const canvasAspect = renderW / renderH;
                let scaleFactor = 1;
                let offsetX = 0; let offsetY = 0;

                if (canvasAspect > timelineAspect) {
                    scaleFactor = renderH / baseH;
                    offsetX = (renderW - (baseW * scaleFactor)) / 2;
                } else {
                    scaleFactor = renderW / baseW;
                    offsetY = (renderH - (baseH * scaleFactor)) / 2;
                }

                ctx.save();
                ctx.fillStyle = '#000'; // Pure Black background for canvas
                ctx.fillRect(0, 0, renderW, renderH);

                // Apply Transform to center the "Timeline Canvas"
                ctx.translate(offsetX, offsetY);
                ctx.scale(scaleFactor, scaleFactor);

                ctx.beginPath();
                ctx.rect(0, 0, baseW, baseH);
                ctx.clip();

                // -- Draw Content --

                for (const { clip } of activeClips) {
                    if (clip.type === 'audio') continue;

                    // CACHE CHECK
                    let cachedBitmap: ImageBitmap | null = null;
                    const useCache = !isExporting && clip.type === 'video' && clip.chromaKey?.enabled;
                    const qualityStr = previewQuality || 'half';

                    if (useCache) {
                        const key = frameCache.generateKey(clip, currentTime, qualityStr);
                        const memoryHit = frameCache.getMemory(key);
                        if (memoryHit) {
                            cachedBitmap = memoryHit;
                        }
                    }

                    // ... Interpolation Logic ...
                    const timeInClip = currentTime - clip.startTime;
                    const renderX = clip.keyframes?.x ? getInterpolatedValue(clip.keyframes.x, timeInClip, clip.position.x) : clip.position.x;
                    const renderY = clip.keyframes?.y ? getInterpolatedValue(clip.keyframes.y, timeInClip, clip.position.y) : clip.position.y;
                    const renderScale = clip.keyframes?.scale ? getInterpolatedValue(clip.keyframes.scale, timeInClip, clip.scale) : clip.scale;
                    const renderRotation = clip.keyframes?.rotation ? getInterpolatedValue(clip.keyframes.rotation, timeInClip, clip.rotation) : clip.rotation;
                    let renderOpacity = clip.keyframes?.opacity ? getInterpolatedValue(clip.keyframes.opacity, timeInClip, clip.opacity) : clip.opacity;

                    // Apply Fade (Video Only, Audio handled in AudioPlayer)
                    if (clip.type === 'video' || clip.type === 'image' || clip.type === 'text') {
                        const fadeIn = clip.fadeIn || 0;
                        const fadeOut = clip.fadeOut || 0;
                        if (timeInClip < fadeIn && fadeIn > 0) {
                            renderOpacity *= (timeInClip / fadeIn);
                        }
                        const timeRem = (clip.duration) - timeInClip;
                        if (timeRem < fadeOut && fadeOut > 0) {
                            renderOpacity *= (timeRem / fadeOut);
                        }
                    }

                    const f = clip.filters || { brightness: 100, contrast: 100, saturation: 100, grayscale: 0, sepia: 0, blur: 0, hueRotate: 0, invert: 0, pixelate: 0, vignette: 0, chromaticAberration: 0, edgeDetection: 0, tint: '#ffffff' };

                    let renderCtx = ctx;

                    // Transition Rendering Logic
                    let transitionAlpha = 1;

                    if (clip.type === 'video' && clip.transition && clip.transition.type !== 'none' && transitionSnapshotRef.current) {
                        if (timeInClip < clip.transition.duration) {
                            const progress = timeInClip / clip.transition.duration;

                            // Draw Snapshot Layer first (behind)
                            renderCtx.save();
                            renderCtx.globalAlpha = 1;
                            renderCtx.drawImage(snapshotCanvas, 0, 0, baseW, baseH);
                            renderCtx.restore();

                            // Adjust Incoming Clip based on transition
                            if (clip.transition.type === 'fade' || clip.transition.type === 'dissolve') {
                                transitionAlpha = progress;
                            } else if (clip.transition.type === 'slide') {
                                const offset = (1 - progress) * baseW;
                                renderCtx.translate(offset, 0);
                            } else if (clip.transition.type === 'wipe') {
                                renderCtx.beginPath();
                                renderCtx.rect(0, 0, baseW * progress, baseH);
                                renderCtx.clip();
                            } else if (clip.transition.type === 'zoom') {
                                const s = progress;
                                renderCtx.translate(baseW / 2, baseH / 2);
                                renderCtx.scale(s, s);
                                renderCtx.translate(-baseW / 2, -baseH / 2);
                                transitionAlpha = progress;
                            }
                        }
                    }

                    // Draw CACHED BITMAP if available
                    if (cachedBitmap) {
                        renderCtx.save();
                        renderCtx.globalAlpha = renderOpacity * transitionAlpha;
                        renderCtx.drawImage(cachedBitmap, 0, 0, baseW, baseH);
                        renderCtx.restore();
                        continue;
                    }

                    // Standard Rendering
                    let sourceElement: HTMLVideoElement | HTMLImageElement | null = null;
                    let isText = false;
                    let sw = 0, sh = 0;

                    if (clip.type === 'video' && video && video.readyState >= 2) {
                        sourceElement = video; sw = video.videoWidth; sh = video.videoHeight;
                    } else if (clip.type === 'image') {
                        sourceElement = imageCacheRef.current[clip.source];
                        if (sourceElement) { sw = sourceElement.width; sh = sourceElement.height; }
                    } else if (clip.type === 'text') {
                        isText = true;
                    }

                    if (sourceElement || isText) {
                        renderCtx.save();

                        // Blend Mode
                        if (clip.blendMode) {
                            renderCtx.globalCompositeOperation = clip.blendMode;
                        }

                        const cx = baseW / 2; const cy = baseH / 2;
                        let drawW = 0; let drawH = 0;

                        if (!isText) {
                            const scaleFactor = Math.min(baseW / sw, baseH / sh);
                            drawW = sw * scaleFactor; drawH = sh * scaleFactor;
                        }

                        renderCtx.translate(cx, cy);
                        renderCtx.translate(renderX, renderY);
                        renderCtx.rotate((renderRotation * Math.PI) / 180);
                        renderCtx.scale(renderScale, renderScale);
                        renderCtx.globalAlpha = Math.max(0, Math.min(1, renderOpacity * transitionAlpha));

                        if (isText) {
                            // ... Text Rendering ...
                            let textContent = clip.content || 'Text';
                            if (clip.textAnimation) {
                                const anim = clip.textAnimation;
                                if (anim.entranceType !== 'none' && timeInClip < anim.entranceDuration) {
                                    const p = timeInClip / anim.entranceDuration;
                                    const animProgress = 1 - Math.pow(1 - p, 3);

                                    if (anim.entranceType === 'fade') renderCtx.globalAlpha *= animProgress;
                                    if (anim.entranceType === 'zoom') renderCtx.scale(animProgress, animProgress);
                                    if (anim.entranceType === 'slide-up') renderCtx.translate(0, (1 - animProgress) * 100);
                                    if (anim.entranceType === 'slide-down') renderCtx.translate(0, -(1 - animProgress) * 100);
                                    if (anim.entranceType === 'slide-left') renderCtx.translate((1 - animProgress) * 100, 0);
                                    if (anim.entranceType === 'slide-right') renderCtx.translate(-(1 - animProgress) * 100, 0);
                                    if (anim.entranceType === 'typewriter') {
                                        const len = Math.floor(textContent.length * p);
                                        textContent = textContent.substring(0, len);
                                    }
                                }
                            }

                            const weight = clip.fontWeight || 'normal';
                            const style = clip.fontStyle || 'normal';
                            renderCtx.font = `${style} ${weight} ${clip.fontSize || 40}px ${clip.fontFamily || 'Arial'}`;
                            renderCtx.textBaseline = 'middle';

                            const metrics = renderCtx.measureText(textContent);
                            const textWidth = metrics.width;
                            const textHeight = clip.fontSize || 40;

                            if (clip.backgroundColor) {
                                const pad = clip.backgroundPadding || 0;
                                renderCtx.fillStyle = clip.backgroundColor;
                                renderCtx.fillRect(-textWidth / 2 - pad, -textHeight / 2 - pad, textWidth + pad * 2, textHeight + pad * 2);
                            }

                            renderCtx.fillStyle = clip.color || '#ffffff';

                            let drawX = 0;
                            if (clip.textAlign === 'left') drawX = -textWidth / 2;
                            if (clip.textAlign === 'right') drawX = textWidth / 2;

                            renderCtx.fillText(textContent, drawX, 0);

                            if (clip.textDecoration === 'underline') {
                                renderCtx.beginPath();
                                renderCtx.lineWidth = Math.max(2, (clip.fontSize || 40) / 15);
                                renderCtx.strokeStyle = clip.color || '#ffffff';
                                renderCtx.moveTo(drawX - textWidth / 2, textHeight / 2);
                                renderCtx.lineTo(drawX + textWidth / 2, textHeight / 2);
                                renderCtx.stroke();
                            }

                        } else if (sourceElement) {
                            renderCtx.translate(-drawW / 2, -drawH / 2);

                            if (clip.chromaKey && clip.chromaKey.enabled) {
                                const cCtx = chromaCanvas.getContext('2d', { willReadFrequently: true });
                                if (cCtx) {
                                    chromaCanvas.width = drawW;
                                    chromaCanvas.height = drawH;
                                    cCtx.drawImage(sourceElement, 0, 0, drawW, drawH);
                                    const imageData = cCtx.getImageData(0, 0, drawW, drawH);
                                    const data = imageData.data;
                                    const target = hexToRgb(clip.chromaKey.color);
                                    const threshold = clip.chromaKey.similarity * 441;
                                    const feather = clip.chromaKey.smoothness * 100;

                                    for (let i = 0; i < data.length; i += 4) {
                                        const r = data[i]; const g = data[i + 1]; const b = data[i + 2];
                                        const dist = Math.sqrt(Math.pow(r - target.r, 2) + Math.pow(g - target.g, 2) + Math.pow(b - target.b, 2));
                                        if (dist < threshold) { data[i + 3] = 0; }
                                        else if (dist < threshold + feather) { const alpha = (dist - threshold) / feather; data[i + 3] = alpha * 255; }
                                    }
                                    cCtx.putImageData(imageData, 0, 0);
                                    renderCtx.drawImage(chromaCanvas, 0, 0, drawW, drawH);

                                    if (useCache && !isPlaying) {
                                        const key = frameCache.generateKey(clip, currentTime, qualityStr);
                                        frameCache.save(key, chromaCanvas);
                                    }
                                }
                            } else {
                                renderCtx.filter = `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturation}%) blur(${f.blur}px)`;
                                renderCtx.drawImage(sourceElement, 0, 0, drawW, drawH);
                                renderCtx.filter = 'none';
                            }

                            if (clip.border && clip.border.width > 0) {
                                renderCtx.strokeStyle = clip.border.color;
                                renderCtx.lineWidth = clip.border.width;
                                if (clip.border.radius > 0 && renderCtx.roundRect) {
                                    renderCtx.beginPath();
                                    renderCtx.roundRect(0, 0, drawW, drawH, clip.border.radius);
                                    renderCtx.stroke();
                                } else {
                                    renderCtx.strokeRect(0, 0, drawW, drawH);
                                }
                            }
                        }
                        renderCtx.restore();
                    }
                }

                // -- Safe Margins Overlay --
                if (projectSettings.safeMargins && !isExporting) {
                    ctx.save();
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
                    ctx.setLineDash([5, 5]);

                    // Action Safe (90%)
                    const actionW = baseW * 0.9;
                    const actionH = baseH * 0.9;
                    const actionX = (baseW - actionW) / 2;
                    const actionY = (baseH - actionH) / 2;
                    ctx.strokeRect(actionX, actionY, actionW, actionH);

                    // Title Safe (80%)
                    ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
                    const titleW = baseW * 0.8;
                    const titleH = baseH * 0.8;
                    const titleX = (baseW - titleW) / 2;
                    const titleY = (baseH - titleH) / 2;
                    ctx.strokeRect(titleX, titleY, titleW, titleH);

                    ctx.restore();
                }

                ctx.restore();
            }
            requestRef.current = requestAnimationFrame(render);
        };

        requestRef.current = requestAnimationFrame(render);
        return () => cancelAnimationFrame(requestRef.current);
    }, [activeClips, isPlaying, onTimeUpdate, onEnded, isExporting, isExportPaused, exportSettings, selectedClipId, previewQuality, projectSettings, playbackSpeed]);

    return (
        <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden shadow-2xl rounded-lg border-2 border-[#FF6B35]">
            <canvas
                ref={canvasRef}
                className="w-full h-full object-contain max-h-[70vh] cursor-pointer"
                onMouseDown={handleMouseDown}
            />
            {!isExporting && (
                <>
                    <div className="absolute top-2 right-2 flex gap-2">
                        {onSnapshot && (
                            <button onClick={onSnapshot} className="px-2 py-1 bg-black/60 backdrop-blur text-[10px] text-white/70 rounded border border-white/10 hover:text-theme-accent hover:border-theme-accent transition-colors flex items-center gap-1" title="Take Snapshot">
                                <Camera size={12} />
                            </button>
                        )}
                        <div className="px-2 py-1 bg-black/60 backdrop-blur text-[10px] text-white/70 rounded border border-white/10 pointer-events-none flex items-center gap-2">
                            <span>{projectSettings.width}x{projectSettings.height} @ {projectSettings.fps}</span>
                        </div>
                    </div>
                </>
            )}
            <video ref={videoRef} className="hidden" crossOrigin="anonymous" muted={isMuted} />
            {activeClips.filter(c => c.clip.type === 'audio').map(({ clip, track }) => {
                let shouldMute = isMuted;
                if (track.isMuted) shouldMute = true;
                if (isAnySolo && !track.isSolo) shouldMute = true;

                let outputNode: AudioNode = sfxBusRef.current || audioContext.destination;
                if (track.role === 'music' && musicBusRef.current) outputNode = musicBusRef.current;
                else if (track.role === 'voice' && voiceBusRef.current) outputNode = voiceBusRef.current;
                else if (sfxBusRef.current) outputNode = sfxBusRef.current;

                return (
                    <AudioPlayer
                        key={clip.id}
                        clip={clip}
                        trackVolume={track.volume ?? 1}
                        currentTime={currentTime}
                        isPlaying={isPlaying && !isExportPaused}
                        playbackSpeed={playbackSpeed}
                        masterVolume={volume}
                        shouldMute={shouldMute}
                        audioContext={audioContext}
                        outputNode={outputNode}
                    />
                );
            })}
        </div>
    );
});
