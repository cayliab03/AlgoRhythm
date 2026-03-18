import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

// 1. Updated the type definition to include 'color' as a string
const Waveform = forwardRef(({ audioUrl, energy, color }: { audioUrl: string, energy: number, color: string }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);

  useImperativeHandle(ref, () => ({
    playPause: () => {
      if (waveSurferRef.current) {
        waveSurferRef.current.playPause();
      }
    }
  }));

  useEffect(() => {
    if (!containerRef.current) return;
    let isCancelled = false;

    // 2. We use the 'color' variable directly from the props above
    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: color || '#3b82f6', 
      progressColor: color || '#3b82f6',
      cursorColor: '#ffffff',
      cursorWidth: 1,
      barWidth: 2,
      barGap: 3,
      height: 60,
    });

    wavesurfer.load(audioUrl).catch((err) => {
      if (err.name === 'AbortError' || isCancelled) return;
      console.error("Waveform error:", err);
    });

    waveSurferRef.current = wavesurfer;

    return () => {
      isCancelled = true;
      wavesurfer.destroy();
    };
    // 3. Dependency array now tracks 'color' so it re-renders if the color changes
  }, [audioUrl, color]); 

  return (
    <div 
      ref={containerRef} 
      className="w-full transition-all duration-700 ease-in-out opacity-80 group-hover:opacity-100"
      style={{ filter: `drop-shadow(0 0 8px ${color}33)` }} // Subtle glow matching the energy
    />
  );
});

Waveform.displayName = 'Waveform';
export default Waveform;