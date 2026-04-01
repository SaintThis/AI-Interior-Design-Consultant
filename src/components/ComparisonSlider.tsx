import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface ComparisonSliderProps {
  original: string;
  generated: string;
  className?: string;
}

export const ComparisonSlider: React.FC<ComparisonSliderProps> = ({ original, generated, className }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (event: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in event ? event.touches[0].clientX : (event as React.MouseEvent).clientX;
    const position = ((x - rect.left) / rect.width) * 100;
    
    setSliderPosition(Math.max(0, Math.min(100, position)));
  };

  return (
    <div 
      ref={containerRef}
      className={cn("relative w-full aspect-square overflow-hidden rounded-2xl cursor-ew-resize select-none shadow-xl", className)}
      onMouseMove={(e) => e.buttons === 1 && handleMove(e)}
      onTouchMove={handleMove}
      onMouseDown={handleMove}
    >
      {/* Generated Image (Bottom) */}
      <img 
        src={generated} 
        alt="Reimagined" 
        className="absolute inset-0 w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />

      {/* Original Image (Top, Clipped) */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <img 
          src={original} 
          alt="Original" 
          className="absolute inset-0 w-full h-full object-cover"
          style={{ width: `${100 / (sliderPosition / 100)}%` }}
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Slider Handle */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
          <div className="flex gap-1">
            <div className="w-0.5 h-3 bg-slate-400 rounded-full" />
            <div className="w-0.5 h-3 bg-slate-400 rounded-full" />
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium pointer-events-none">
        Original
      </div>
      <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium pointer-events-none">
        Reimagined
      </div>
    </div>
  );
};
