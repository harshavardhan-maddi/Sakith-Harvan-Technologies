import React, { useState, useEffect } from 'react';
import logoImg from '../assets/logo.png';

export const IntroSplash = ({ onFinish }) => {
  const [isVisible, setIsVisible] = useState(() => {
    // If already seen in this session, don't block
    return !sessionStorage.getItem('sh_intro_seen');
  });
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      if (onFinish) onFinish();
      return;
    }

    sessionStorage.setItem('sh_intro_seen', 'true');

    // Ultra-snappy 250ms reveal then fade out
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 250);

    // Unmount at 400ms total
    const dismissTimer = setTimeout(() => {
      setIsVisible(false);
      if (onFinish) onFinish();
    }, 400);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(dismissTimer);
    };
  }, [isVisible, onFinish]);

  const handleSkip = () => {
    sessionStorage.setItem('sh_intro_seen', 'true');
    setIsVisible(false);
    if (onFinish) onFinish();
  };


  if (!isVisible) return null;

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-[100] bg-slate-50/95 backdrop-blur-md flex flex-col items-center justify-center p-6 transition-all duration-300 overflow-hidden select-none cursor-pointer ${
        isFading ? 'opacity-0 scale-102 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Soft Ambient Radial Blue Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[320px] bg-blue-500/10 blur-[90px] rounded-full pointer-events-none" />

      {/* Centered Minimal Brand Plaque */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-4 max-w-md animate-in zoom-in-95 duration-300">
        {/* Official Logo Image */}
        <div className="relative py-2">
          <img
            src={logoImg}
            alt="Sakith Harvan Technologies"
            className="h-24 sm:h-32 md:h-36 w-auto object-contain filter drop-shadow-[0_8px_24px_rgba(37,99,235,0.2)] transition-transform duration-500"
            onError={(e) => {
              e.target.src = '/SAKITH_HARVAN.png';
            }}
          />
        </div>

        {/* Minimal Slogan */}
        <div className="space-y-1">
          <p className="text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase text-slate-700">
            Innovate • Integrate • Elevate
          </p>
        </div>

        {/* Minimal Soft Blue Progress Bar */}
        <div className="w-28 h-1 bg-slate-200/80 rounded-full overflow-hidden border border-blue-100 mt-2">
          <div className="h-full bg-gradient-to-r from-blue-600 to-sky-400 rounded-full animate-pulse w-full duration-700" />
        </div>
      </div>

      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute bottom-6 right-6 z-20 text-xs font-semibold tracking-wider text-slate-600 hover:text-blue-600 bg-white/90 hover:bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-sm transition-all"
      >
        Skip
      </button>
    </div>
  );
};
