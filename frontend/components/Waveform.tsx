
import React, { useRef, useEffect } from 'react';

interface WaveformProps {
    data: number[];
    color: string;
    className?: string;
}

export const Waveform: React.FC<WaveformProps> = ({ data, color, className }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Handle high DPI
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        
        // Only update dimensions if they changed to avoid flicker
        if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
        }
        
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, rect.width, rect.height);
        
        ctx.fillStyle = color;

        // Draw waveform
        // Data is array of 0-1 values.
        const barWidth = rect.width / data.length;
        const gap = Math.max(0.5, barWidth * 0.1);
        const effectiveBarWidth = Math.max(0.5, barWidth - gap);

        data.forEach((val, i) => {
            const barHeight = Math.max(1, val * rect.height * 0.8); // 80% height scaling
            const x = i * barWidth;
            const y = (rect.height - barHeight) / 2; // Center vertically
            
            ctx.beginPath();
            // Fallback for roundRect in older browsers if needed, though most support it now
            if (ctx.roundRect) {
                ctx.roundRect(x, y, effectiveBarWidth, barHeight, [2]);
            } else {
                ctx.rect(x, y, effectiveBarWidth, barHeight);
            }
            ctx.fill();
        });

    }, [data, color]);

    return <canvas ref={canvasRef} className={`w-full h-full ${className}`} />;
};
