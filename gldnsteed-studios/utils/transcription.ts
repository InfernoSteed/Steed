import { Clip, CaptionPreset } from '../types';

export interface TranscriptWord {
  word: string;
  startTime: number;
  endTime: number;
  confidence: number;
}

export class TranscriptionService {
  private recognition: any;
  private isListening: boolean = false;

  constructor() {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = false; // We only want final results for captions
      this.recognition.lang = 'en-US';
    } else {
      console.warn('Speech Recognition API not supported in this browser.');
    }
  }

  start(onResult: (text: string) => void, onEnd?: () => void) {
    if (!this.recognition) return;
    if (this.isListening) return;

    this.recognition.onresult = (event: any) => {
      const results = event.results;
      for (let i = event.resultIndex; i < results.length; i++) {
        if (results[i].isFinal) {
          const transcript = results[i][0].transcript;
          if (transcript.trim()) {
            onResult(transcript.trim());
          }
        }
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      this.stop();
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (e) {
      console.error("Failed to start recognition", e);
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Transcribe with word-level timestamps
   * Note: Browser Speech Recognition API doesn't provide word-level timestamps,
   * so we estimate them based on speech rate
   */
  async transcribeWithTimestamps(
    onResult: (words: TranscriptWord[]) => void,
    onEnd?: () => void
  ): Promise<void> {
    if (!this.recognition) return;
    if (this.isListening) return;

    let currentTime = 0;

    this.recognition.onresult = (event: any) => {
      const results = event.results;
      for (let i = event.resultIndex; i < results.length; i++) {
        if (results[i].isFinal) {
          const transcript = results[i][0].transcript.trim();
          const confidence = results[i][0].confidence || 0.9;

          if (transcript) {
            // Estimate word timings (average 0.3s per word)
            const words = transcript.split(' ');
            const wordDuration = 0.3;
            const transcriptWords: TranscriptWord[] = words.map((word, idx) => ({
              word,
              startTime: currentTime + (idx * wordDuration),
              endTime: currentTime + ((idx + 1) * wordDuration),
              confidence
            }));

            currentTime += words.length * wordDuration;
            onResult(transcriptWords);
          }
        }
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      this.stop();
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (e) {
      console.error('Failed to start recognition', e);
    }
  }

  /**
   * Generate caption clips from transcript
   */
  generateCaptionClips(
    transcript: TranscriptWord[],
    preset: CaptionPreset,
    trackId: string,
    startOffset: number = 0
  ): Clip[] {
    const clips: Clip[] = [];
    const wordsPerCaption = 5; // Group words into captions

    for (let i = 0; i < transcript.length; i += wordsPerCaption) {
      const captionWords = transcript.slice(i, i + wordsPerCaption);
      const content = captionWords.map(w => w.word).join(' ');
      const startTime = captionWords[0].startTime + startOffset;
      const endTime = captionWords[captionWords.length - 1].endTime + startOffset;

      // Calculate position based on preset
      let yPosition = 0;
      if (preset.position === 'top') yPosition = -150;
      else if (preset.position === 'bottom') yPosition = 150;

      clips.push({
        id: `caption-${Date.now()}-${i}`,
        assetId: '',
        name: `Caption ${i / wordsPerCaption + 1}`,
        source: '',
        startTime,
        duration: endTime - startTime,
        offset: 0,
        speed: 1,
        volume: 1,
        pan: 0,
        type: 'text',
        position: { x: 0, y: yPosition },
        scale: 1,
        rotation: 0,
        opacity: 1,
        fadeIn: 0.1,
        fadeOut: 0.1,
        content,
        fontFamily: preset.fontFamily,
        fontSize: preset.fontSize,
        color: preset.color,
        fontWeight: 'bold',
        fontStyle: 'normal',
        textDecoration: 'none',
        textAlign: 'center',
        backgroundColor: preset.backgroundColor,
        backgroundPadding: preset.backgroundPadding,
        textAnimation: preset.animation
      });
    }

    return clips;
  }

  /**
   * Batch transcribe multiple clips
   */
  async batchTranscribe(
    clips: Clip[],
    onProgress: (current: number, total: number) => void
  ): Promise<Map<string, string>> {
    const results = new Map<string, string>();

    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];

      // Simulate transcription (in real app, would process audio)
      await new Promise(resolve => setTimeout(resolve, 1000));

      results.set(clip.id, `Transcribed content for ${clip.name}`);
      onProgress(i + 1, clips.length);
    }

    return results;
  }
}
