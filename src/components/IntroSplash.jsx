import React, { useState, useEffect } from 'react';
import logoImg from '../assets/logo.png';

export const IntroSplash = ({ onFinish }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Elegant quick fade out after 1.5 seconds
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 1500);

    // Completely unmount after 1.9 seconds
    const dismissTimer = setTimeout(() => {
      setIsVisible(false);
      if (onFinish) onFinish();
    }, 1900);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(dismissTimer);
    };
  }, [onFinish]);

  const handleSkip = () => {
    setIsFading(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onFinish) onFinish();
    }, 200);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-6 transition-all duration-500 overflow-hidden select-none ${
        isFading ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Subtle Ambient Radial Red Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-red-600/15 blur-[140px] rounded-full pointer-events-none" />

      {/* Centered Minimal Brand Plaque */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-md animate-in zoom-in-95 duration-500">
        
        {/* Official Logo Image */}
        <div className="relative py-2">
          <img
            src={logoImg}
            alt="Sakith Harvan Technologies"
            className="h-28 sm:h-36 md:h-44 w-auto object-contain filter drop-shadow-[0_0_30px_rgba(239,68,68,0.45)] transition-transform duration-700"
            onError={(e) => {
              e.target.src = '/SAKITH_HARVAN.png';
            }}
          />
        </div>

        {/* Minimal Slogan */}
        <div className="space-y-1">
          <p className="text-xs sm:text-sm font-medium tracking-[0.3em] uppercase text-slate-300">
            Innovate • Integrate • Elevate
          </p>
        </div>

        {/* Ultra-Minimal Progress Indicator */}
        <div className="w-24 h-0.5 bg-slate-900 rounded-full overflow-hidden border border-white/10 mt-4">
          <div className="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-full animate-pulse w-full duration-1000" />
        </div>
      </div>

      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute bottom-6 right-6 z-20 text-[11px] font-medium tracking-wider text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 px-4 py-2 rounded-full border border-white/10 transition-all"
      >
        Skip
      </button>
    </div>
  );
};
