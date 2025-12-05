

export interface ClipFilters {
  // CSS Filters
  brightness: number; // 0-200, default 100
  contrast: number; // 0-200, default 100
  saturation: number; // 0-200, default 100
  grayscale: number; // 0-100, default 0
  sepia: number; // 0-100, default 0
  blur: number; // 0-20px, default 0
  hueRotate: number; // 0-360deg, default 0
  invert: number; // 0-100, default 0

  // Canvas Effects
  pixelate: number; // 0-50 (block size), default 0 (off)
  vignette: number; // 0-100 (intensity), default 0
  chromaticAberration: number; // 0-50 (pixel offset), default 0
  edgeDetection: number; // 0 or 1 (boolean), default 0
  tint: string; // Hex color code, default #ffffff (no tint)
}

export type TransitionType = 'none' | 'fade' | 'dissolve' | 'slide' | 'wipe' | 'zoom';

export interface Transition {
  type: TransitionType;
  duration: number; // in seconds
}

export type TextEntranceType = 'none' | 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'zoom' | 'typewriter';
export type TextExitType = 'none' | 'fade' | 'slide-out' | 'zoom-out' | 'dissolve';

export interface TextAnimation {
  entranceType: TextEntranceType;
  entranceDuration: number;
  exitType: TextExitType;
  exitDuration: number;
}

export interface Keyframe {
  id: string;
  time: number; // Seconds relative to clip start (0 to clip.duration)
  value: number;
}

export interface ChromaKeySettings {
  enabled: boolean;
  color: string; // Hex color to remove
  similarity: number; // 0-1 (Tolerance)
  smoothness: number; // 0-1 (Feathering)
  spill: number; // 0-1 (Despill green/blue reflection)
}

export interface ClipBorder {
  color: string;
  width: number; // px
  radius: number; // px
}

export type AnimatableProperty = 'x' | 'y' | 'scale' | 'rotation' | 'opacity' | 'volume';

export interface Clip {
  id: string;
  assetId: string; // Link to the original Asset for full duration access
  name: string;
  source: string; // URL to the video blob or image
  startTime: number; // In seconds relative to timeline start
  duration: number; // Duration of the clip in seconds (on the timeline)
  offset: number; // Start point within the source video (0 for images)
  speed: number; // Playback rate multiplier
  volume: number; // Audio volume 0.0 to 1.0
  pan: number; // -1 (Left) to 1 (Right), default 0
  type: 'video' | 'audio' | 'image' | 'text';

  // Transform Properties
  position: { x: number; y: number }; // Offset from center in pixels
  scale: number; // 1.0 = 100%
  rotation: number; // Degrees
  opacity: number; // 0.0 to 1.0
  border?: ClipBorder;
  blendMode?: GlobalCompositeOperation; // 'source-over', 'screen', etc.

  // Fade Properties (Audio Volume or Video Opacity)
  fadeIn: number; // seconds
  fadeOut: number; // seconds

  // Animation Data
  keyframes?: {
    [key in AnimatableProperty]?: Keyframe[];
  };

  // Text Properties
  content?: string;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  fontWeight?: string; // 'normal' | 'bold'
  fontStyle?: string; // 'normal' | 'italic'
  textDecoration?: string; // 'none' | 'underline'
  textAlign?: 'left' | 'center' | 'right';
  backgroundColor?: string; // Hex/RGBA
  backgroundPadding?: number;
  textAnimation?: TextAnimation;
  transcript?: string; // Captured text from audio

  // Chroma Key
  chromaKey?: ChromaKeySettings;

  filters?: ClipFilters;
  transition?: Transition;

  // AI Analysis Metadata
  aiMetadata?: {
    hasVoice?: boolean;
    sceneChanges?: number[];
    stabilizationData?: any;
    colorAnalysis?: {
      avgBrightness: number;
      avgContrast: number;
      avgSaturation: number;
    };
  };

  // Clip Markers (color-coded with keyboard shortcuts 1-9)
  clipMarkers?: {
    id: string;
    time: number; // Relative to clip start
    color: string;
    label?: string;
  }[];

  // Timeline Visuals
  labelColor?: string; // Custom color for the timeline block

  // Audio Effects
  audioEffects?: AudioEffect[];
}

export type AudioEffectType = 'eq3' | 'compressor' | 'reverb' | 'gain';

export interface AudioEffect {
  id: string;
  type: AudioEffectType;
  enabled: boolean;
  params: EQ3Params | CompressorParams | ReverbParams | GainParams;
}

export interface EQ3Params {
  low: number; // -24 to 24 dB
  mid: number;
  high: number;
  lowFreq?: number; // default 400Hz
  highFreq?: number; // default 2500Hz
}

export interface CompressorParams {
  threshold: number; // -100 to 0 dB
  ratio: number; // 1 to 20
  attack: number; // 0 to 1 sec
  release: number; // 0 to 1 sec
  knee?: number; // 0 to 40
}

export interface ReverbParams {
  mix: number; // 0 to 1 (Dry/Wet)
  decay: number; // 0.1 to 10 sec
  preDelay?: number; // 0 to 1 sec
}

export interface GainParams {
  gain: number; // -60 to 24 dB
}

// Subset of Clip properties used for Copy/Paste
export interface CopiedClipProperties {
  volume?: number;
  pan?: number;
  speed?: number;
  position?: { x: number; y: number };
  scale?: number;
  rotation?: number;
  opacity?: number;
  filters?: ClipFilters;
  border?: ClipBorder;
  chromaKey?: ChromaKeySettings;
  textAnimation?: TextAnimation;
  fadeIn?: number;
  fadeOut?: number;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  textAlign?: 'left' | 'center' | 'right';
  backgroundColor?: string;
  backgroundPadding?: number;
  transition?: Transition;
  blendMode?: GlobalCompositeOperation;
  labelColor?: string;
}

export interface Track {
  id: string;
  name: string;
  customName?: string; // User-defined name
  color?: string; // Hex color for visual coding
  icon?: string; // Icon identifier
  type: 'video' | 'audio' | 'text';
  role: 'video' | 'music' | 'voice' | 'sfx' | 'image' | 'text';
  isMuted: boolean;
  isSolo: boolean;
  isHidden: boolean;
  isLocked: boolean; // Prevent edits
  volume: number; // Track-level volume 0-1
  pan?: number; // -1 (Left) to 1 (Right), default 0
  clips: Clip[];
}

export interface Asset {
  id: string;
  name: string;
  source: string;
  duration: number;
  width: number;
  height: number;
  format: string;
  type: 'video' | 'audio' | 'image' | 'text';
  waveform?: number[]; // Array of normalized peaks (0-1) for audio visualization
  thumbnail?: string; // Thumbnail URL for preview (videos and images)
}

export type MarkerType = 'manual' | 'silence' | 'beat' | 'scene' | 'jump-cut' | 'voice';

export interface Marker {
  id: string;
  time: number;
  label: string;
  color: string;
  type: MarkerType;
  confidence?: number; // AI detection confidence 0-1
  metadata?: Record<string, any>; // Additional data
}

export interface EditorState {
  tracks: Track[];
  currentTime: number; // Current playhead position in seconds
  duration: number; // Total timeline duration in seconds
  isPlaying: boolean;
  zoom: number; // Pixels per second
  selectedClipId: string | null;
}

export interface DuckingSettings {
  enabled: boolean;
  threshold: number; // -60 to 0 dB
  reduction: number; // 0 to 1 (scale factor, e.g. 0.2 means reduce to 20% volume)
  attack: number; // seconds
  release: number; // seconds
  autoDetect: boolean; // Auto-detect voice and apply ducking
  targetTracks: string[]; // Which tracks to duck
}

export interface ProjectSettings {
  width: number;
  height: number;
  fps: number;
  safeMargins: boolean;
}

export interface ExportSettings {
  width: number;
  height: number;
  fps: 24 | 30 | 60;
  quality: 'low' | 'medium' | 'high'; // low: 2Mbps, medium: 5Mbps, high: 8Mbps
  format: 'webm' | 'mp4';
}

export type PreviewQuality = 'full' | 'half' | 'quarter';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'preset' | 'custom' | 'blank';
  duration: number;
  tracks: Track[];
  thumbnail?: string; // Optional CSS color or image URL
}

export interface CaptionPreset {
  id: string;
  name: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  backgroundColor: string;
  backgroundPadding: number;
  position: 'top' | 'center' | 'bottom';
  animation: TextAnimation;
}

export interface ProjectData {
  version: string;
  id: string;
  name: string;
  lastModified: number;
  duration: number;
  tracks: Track[];
  assets: Asset[];
  duckingSettings: DuckingSettings;
  projectSettings?: ProjectSettings;
  markers?: Marker[]; // AI-generated and manual markers
  captionPresets?: CaptionPreset[]; // Caption style presets
  aiAnalysisCache?: Record<string, any>; // Cache analysis results
}

export interface ExportJob {
  id: string;
  name: string;
  settings: ExportSettings;
  status: 'queued' | 'processing' | 'paused' | 'completed' | 'failed';
  progress: number;
  startTime?: number;
  endTime?: number;
  outputBlob?: Blob;
  outputSize?: string;
  error?: string;
}

export interface ExportRecord {
  id: string;
  timestamp: number;
  projectName: string;
  settings: ExportSettings;
  duration: number;
  fileSize: string;
}