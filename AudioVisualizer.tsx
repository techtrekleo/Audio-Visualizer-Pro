import React, { useRef, useEffect, forwardRef } from 'react';
import { VisualizationType } from '../types';

interface AudioVisualizerProps {
    analyser: AnalyserNode | null;
    visualizationType: VisualizationType;
    isPlaying: boolean;
    customText: string;
}

const drawTechWave = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number, frame: number) => {
    ctx.save();
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.15;
    const bars = 128;
    
    ctx.strokeStyle = `hsl(${frame / 2}, 80%, 60%)`;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 15;
    ctx.shadowColor = `hsl(${frame / 2}, 80%, 60%)`;

    for (let i = 0; i < bars; i++) {
        const barHeight = dataArray[i] * 0.5;
        const angle = (i / bars) * Math.PI * 2;
        
        const x1 = centerX + Math.cos(angle) * radius;
        const y1 = centerY + Math.sin(angle) * radius;
        const x2 = centerX + Math.cos(angle) * (radius + barHeight);
        const y2 = centerY + Math.sin(angle) * (radius + barHeight);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
    ctx.restore();
};

const drawMagicCircle = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number, frame: number) => {
    ctx.save();
    const centerX = width / 2;
    const centerY = height / 2;
    const baseRadius = Math.min(width, height) * 0.2;
    const points = 180;
    
    ctx.lineWidth = 3;
    ctx.shadowBlur = 20;
    
    for (let j = 1; j <= 3; j++) {
        const radius = baseRadius * j * 0.7;
        const colorVal = (frame + j * 60) % 360;
        ctx.strokeStyle = `hsl(${colorVal}, 90%, 65%)`;
        ctx.shadowColor = `hsl(${colorVal}, 90%, 65%)`;

        ctx.beginPath();
        for (let i = 0; i <= points; i++) {
            const index = Math.floor((i / points) * dataArray.length * 0.7);
            const amplitude = dataArray[index] / 10;
            const angle = (i / points) * Math.PI * 2 + (frame / 100) * (j % 2 === 0 ? -1 : 1);
            
            const currentRadius = radius + amplitude;
            const x = centerX + Math.cos(angle) * currentRadius;
            const y = centerY + Math.sin(angle) * currentRadius;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.stroke();
    }
    ctx.restore();
};

const drawRadialBars = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number, frame: number) => {
    ctx.save();
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.1;
    const bars = 256;
    const maxBarHeight = Math.min(width, height) * 0.35;
    
    for (let i = 0; i < bars; i++) {
        const barHeight = (dataArray[i] / 255) * maxBarHeight;
        const angle = (i / bars) * Math.PI * 2 - Math.PI / 2;
        const hue = (i / bars) * 360 + frame;

        ctx.strokeStyle = `hsl(${hue}, 100%, 70%)`;
        ctx.lineWidth = (width / bars) * 0.8;
        ctx.shadowBlur = 5;
        ctx.shadowColor = `hsl(${hue}, 100%, 70%)`;

        const x1 = centerX + Math.cos(angle) * radius;
        const y1 = centerY + Math.sin(angle) * radius;
        const x2 = centerX + Math.cos(angle) * (radius + barHeight);
        const y2 = centerY + Math.sin(angle) * (radius + barHeight);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
    ctx.restore();
};

const drawPulsingText = (ctx: CanvasRenderingContext2D, text: string, dataArray: Uint8Array, width: number, height: number) => {
    if (!text) return;

    ctx.save();

    const centerX = width / 2;
    const centerY = height / 2;

    // Calculate an average bass value for the pulse effect
    const bass = dataArray.slice(0, 32).reduce((a, b) => a + b, 0) / 32;
    const normalizedBass = bass / 255;
    
    // Calculate dynamic font size
    const baseFontSize = Math.min(width, height) * 0.1;
    const pulseAmount = Math.min(width, height) * 0.05;
    const fontSize = baseFontSize + (normalizedBass * pulseAmount);

    // Styling
    ctx.font = `bold ${fontSize}px Poppins, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Create a subtle glow effect
    ctx.shadowColor = 'rgba(100, 255, 255, 0.7)';
    ctx.shadowBlur = 20;

    // Create a gradient for the text fill
    const gradient = ctx.createLinearGradient(0, centerY - fontSize / 2, 0, centerY + fontSize / 2);
    gradient.addColorStop(0, '#FFFFFF');
    gradient.addColorStop(0.6, '#A7F3F3'); // Light cyan
    gradient.addColorStop(1, '#0891B2'); // Darker cyan

    ctx.fillStyle = gradient;
    ctx.fillText(text, centerX, centerY);

    ctx.restore();
};


const VISUALIZATION_MAP = {
    [VisualizationType.TECH_WAVE]: drawTechWave,
    [VisualizationType.MAGIC_CIRCLE]: drawMagicCircle,
    [VisualizationType.RADIAL_BARS]: drawRadialBars,
};

const AudioVisualizer = forwardRef<HTMLCanvasElement, AudioVisualizerProps>(({ analyser, visualizationType, isPlaying, customText }, ref) => {
    const animationFrameId = useRef<number>(0);
    const frame = useRef<number>(0);

    useEffect(() => {
        const canvas = (ref as React.RefObject<HTMLCanvasElement>).current;
        if (!canvas || !analyser) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const renderFrame = () => {
            frame.current++;
            analyser.getByteFrequencyData(dataArray);
            
            const rect = canvas.getBoundingClientRect();
            const { width, height } = rect;

            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, width, height);
            
            const drawFunction = VISUALIZATION_MAP[visualizationType];
            drawFunction(ctx, dataArray, width, height, frame.current);

            if (customText) {
                drawPulsingText(ctx, customText, dataArray, width, height);
            }
            
            if (isPlaying) {
                animationFrameId.current = requestAnimationFrame(renderFrame);
            }
        };

        if (isPlaying) {
            renderFrame();
        } else {
             cancelAnimationFrame(animationFrameId.current);
        }

        return () => {
            cancelAnimationFrame(animationFrameId.current);
        };
    }, [isPlaying, analyser, visualizationType, ref, customText]);

    useEffect(() => {
        const canvas = (ref as React.RefObject<HTMLCanvasElement>)?.current;
        if (!canvas) return;
        
        const handleResize = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            
            if (rect.width > 0 && rect.height > 0) {
                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.scale(dpr, dpr);
                }
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [ref]);


    return <canvas ref={ref} className="w-full h-full" />;
});

AudioVisualizer.displayName = 'AudioVisualizer';

export default AudioVisualizer;