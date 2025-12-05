import React, { useEffect, useRef, useState } from 'react';

interface AudioMeterProps {
  audioContext?: AudioContext;
  sourceNode?: AudioNode;
  isActive: boolean;
  width?: number;
  height?: number;
  orientation?: 'vertical' | 'horizontal';
  value?: number; // External level control (0-1)
}

export function AudioMeter({ audioContext, sourceNode, isActive, width = 8, height = 100, orientation = 'vertical', value }: AudioMeterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>();
  const [internalLevel, setInternalLevel] = useState(0);
  const [peak, setPeak] = useState(0);
  const [isClipping, setIsClipping] = useState(false);

  // Use external value if provided, otherwise internal level
  const currentLevel = value !== undefined ? value : internalLevel;

  useEffect(() => {
    if (value !== undefined) {
      if (value > peak) {
        setPeak(value);
        setTimeout(() => setPeak(p => Math.max(0, p - 0.01)), 500);
      }
      if (value > 0.95) {
        setIsClipping(true);
        setTimeout(() => setIsClipping(false), 1000);
      }
      return;
    }

    if (!isActive || !audioContext || !sourceNode) {
      setInternalLevel(0);
      return;
    }

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    sourceNode.connect(analyser);
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const draw = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);

      // Calculate RMS
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i] * dataArray[i];
      }
      const rms = Math.sqrt(sum / dataArray.length);
      const normalizedLevel = Math.min(1, rms / 128);

      setInternalLevel(normalizedLevel);

      if (normalizedLevel > peak) {
        setPeak(normalizedLevel);
        // Decay peak slowly
        setTimeout(() => setPeak(p => Math.max(0, p - 0.01)), 500);
      }

      if (normalizedLevel > 0.95) {
        setIsClipping(true);
        setTimeout(() => setIsClipping(false), 1000);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (analyserRef.current) {
        analyserRef.current.disconnect();
        sourceNode.disconnect(analyserRef.current);
      }
    };
  }, [isActive, audioContext, sourceNode, value, peak]);

  // Render logic
  const getGradientColor = (val: number) => {
    if (val > 0.9) return '#ef4444'; // Red
    if (val > 0.7) return '#ffdc73'; // Gold
    return '#22c55e'; // Green
  };

  return (
    <div className={`relative bg-black/50 rounded overflow-hidden border border-white/10 ${orientation === 'vertical' ? 'flex-col' : 'flex-row'}`} style={{ width, height }}>
      {/* Background Track */}
      <div className="absolute inset-0 bg-[#111]"></div>

      {/* Level Bar */}
      <div
        className="absolute bottom-0 left-0 right-0 transition-all duration-75 ease-out"
        style={{
          height: `${currentLevel * 100}%`,
          backgroundColor: getGradientColor(currentLevel),
          boxShadow: isClipping ? '0 0 10px #ef4444' : 'none'
        }}
      ></div>

      {/* Peak Indicator */}
      <div
        className="absolute left-0 right-0 h-px bg-white/80 transition-all duration-300"
        style={{ bottom: `${peak * 100}%` }}
      ></div>

      {/* Clip Indicator */}
      {isClipping && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-red-500 animate-pulse"></div>
      )}
    </div>
  );
}
