import React, { useState, useRef } from 'react';
import { Lottie } from 'lottie-react';
import careerAnimationData from '../../assets/career-hero.json';
import { Play, Pause, RotateCcw, Sparkles } from 'lucide-react';

export const CareerHeroLottie = ({ className = '' }) => {
  const lottieRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hasError, setHasError] = useState(false);

  const togglePlay = () => {
    if (!lottieRef.current) return;
    if (isPlaying) {
      lottieRef.current.pause();
      setIsPlaying(false);
    } else {
      lottieRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleRestart = () => {
    if (!lottieRef.current) return;
    lottieRef.current.goToAndPlay(0, true);
    setIsPlaying(true);
  };

  if (hasError) {
    return (
      <div className={`w-full p-8 rounded-3xl bg-slate-900/90 border border-amber-500/30 text-center text-white ${className}`}>
        <p className="font-bold text-amber-400">CAREER</p>
        <p className="text-xs text-slate-300">Opportunities don’t happen, you create them.</p>
      </div>
    );
  }

  return (
    <div className={`relative w-full rounded-3xl overflow-hidden bg-gradient-to-b from-black via-slate-950 to-slate-900 border border-amber-500/30 shadow-2xl shadow-amber-500/10 group ${className}`}>
      {/* Ambient background glow matching orange/gold lottie tones */}
      <div className="absolute -top-20 left-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-20 right-1/4 w-96 h-96 bg-orange-600/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Floating Badge */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-amber-500/40 text-[11px] font-mono text-amber-300 font-semibold shadow-lg">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span>Course of Career • Primary Vision</span>
      </div>

      {/* Interactive Controls Overlay (Pill in top-right) */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-1.5 p-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 opacity-80 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={togglePlay}
          title={isPlaying ? 'Pause animation' : 'Play animation'}
          className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
          aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-300" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
        </button>
        <button
          type="button"
          onClick={handleRestart}
          title="Replay animation"
          className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
          aria-label="Replay animation"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-300 hover:text-white" />
        </button>
      </div>

      {/* Main Lottie Player Container */}
      <div className="relative w-full aspect-[2160/1080] max-h-[460px] sm:max-h-[520px] flex items-center justify-center overflow-hidden">
        <Lottie
          lottieRef={lottieRef}
          animationData={careerAnimationData}
          loop={true}
          autoplay={true}
          rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }}
          style={{ width: '100%', height: '100%' }}
          onError={() => setHasError(true)}
        />
      </div>

      {/* Bottom Subtitle Bar */}
      <div className="relative z-10 px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-amber-500/10 via-slate-900/80 to-amber-500/10 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-amber-200 font-semibold tracking-wide">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>“Opportunities don’t happen, you create them.”</span>
        </div>
        <div className="text-[11px] text-slate-400 font-mono">
          Connect Degree → Skills → High Impact Placements
        </div>
      </div>
    </div>
  );
};

