import React, { useState, useEffect, useRef } from 'react';
import emblemPng from '../assets/punch-in-emblem.png';

/**
 * ThreeDPunchInEmblem
 * Single floating 3D logo PNG with transparent background.
 * Requirements:
 * - Direct floating emblem without any surrounding card, box, or dialog frame
 * - Dramatic "Come Up / Scale Up" entrance animation on mount
 * - Embedded cyan glowing HUD rings with rotating tick marks in central circular portal
 * - Real-time countdown timer counting down from target work hours to 00:00:00
 * - Interactive 3D mouse parallax tilt
 * - Electric blue floor reflection glow
 */
export const ThreeDPunchInEmblem = ({ 
  targetHours = 5, 
  punchInTimestamp = null,
  punchOutTimestamp = null,
  mode = 'in', // 'in' or 'out'
  actualWorkedSeconds = null,
  className = '' 
}) => {
  const containerRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Format into HH:MM:SS
  const formatTime = (totalSec) => {
    const s = Math.max(0, Math.floor(totalSec || 0));
    const hrs = String(Math.floor(s / 3600)).padStart(2, '0');
    const mins = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const secs = String(s % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  // Calculate remaining seconds counting down to 00:00:00 for Punch In
  const computeRemaining = () => {
    const totalTargetSec = Math.round((parseFloat(targetHours) || 5) * 3600);
    if (!punchInTimestamp) {
      return totalTargetSec;
    }
    const elapsedSec = Math.max(0, Math.floor((Date.now() - punchInTimestamp) / 1000));
    return Math.max(0, totalTargetSec - elapsedSec);
  };

  // Calculate actual worked seconds for Punch Out
  const computeActualWorked = () => {
    if (actualWorkedSeconds !== null && actualWorkedSeconds !== undefined) {
      return actualWorkedSeconds;
    }
    if (punchInTimestamp) {
      const endTs = punchOutTimestamp || Date.now();
      return Math.max(0, Math.floor((endTs - punchInTimestamp) / 1000));
    }
    return 0;
  };

  const [remainingSeconds, setRemainingSeconds] = useState(computeRemaining);

  // Tick timer every second
  useEffect(() => {
    if (mode === 'in') {
      setRemainingSeconds(computeRemaining());
      const interval = setInterval(() => {
        setRemainingSeconds(computeRemaining());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [punchInTimestamp, targetHours, mode]);

  const displayTimeText = mode === 'out' 
    ? formatTime(computeActualWorked()) 
    : formatTime(remainingSeconds);

  // 3D Parallax Mouse Move Handler
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = -((y - centerY) / centerY) * 14;
    const rotY = ((x - centerX) / centerX) * 16;

    setTilt({ x: rotX, y: rotY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div 
      className={`relative flex flex-col items-center justify-center select-none ${className}`}
      style={{ perspective: '1200px' }}
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <style>{`
        @keyframes punchInComeUpAndScale {
          0% {
            opacity: 0;
            transform: translateY(180px) scale(0.48);
          }
          65% {
            opacity: 1;
            transform: translateY(-12px) scale(1.04);
          }
          100% {
            opacity: 1;
            transform: translateY(0px) scale(1);
          }
        }
        @keyframes punchOutReverseScale {
          0% {
            opacity: 1;
            transform: translateY(0px) scale(1);
          }
          25% {
            opacity: 1;
            transform: translateY(-16px) scale(1.05);
          }
          60% {
            opacity: 0.85;
            transform: translateY(80px) scale(0.72);
          }
          100% {
            opacity: 0.2;
            transform: translateY(180px) scale(0.45);
          }
        }
        @keyframes gentleFloatBob {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .animate-punch-in-surge {
          animation: punchInComeUpAndScale 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-punch-out-reverse {
          animation: punchOutReverseScale 1.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-gentle-float {
          animation: gentleFloatBob 4s ease-in-out infinite;
        }
      `}</style>

      {/* 3D Floating & Surge-Up / Scale-Up or Reverse Scale-Down Container */}
      <div
        className={`relative flex items-center justify-center pointer-events-auto ${
          mode === 'out' ? 'animate-punch-out-reverse' : 'animate-punch-in-surge'
        }`}
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: isHovered ? 'transform 0.12s ease-out' : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Ground Electric Blue Ambient Spotlight Glow */}
        <div 
          className={`absolute -bottom-10 left-1/2 -translate-x-1/2 w-80 h-16 rounded-full blur-2xl pointer-events-none ${
            mode === 'out' ? 'bg-amber-500/30' : 'bg-blue-500/40'
          }`}
        />

        {/* Central Core Ambient Glow */}
        <div 
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none ${
            mode === 'out' ? 'bg-amber-400/25' : 'bg-cyan-400/30'
          }`}
        />

        {/* Single Transparent 3D Emblem PNG Image (no card, no frame) */}
        <div className="relative w-72 sm:w-88 md:w-[420px] lg:w-[460px] h-auto flex items-center justify-center animate-gentle-float">
          <img
            src={emblemPng}
            alt="Sakith Harvan 3D Logo"
            className="w-full h-auto object-contain filter drop-shadow-[0_25px_50px_rgba(37,99,235,0.45)] pointer-events-none"
          />

          {/* DYNAMIC CENTRAL HUD PORTAL OVERLAY */}
          {/* Positioned precisely at the center circle of the emblem (X: 51.8%, Y: 48.8%) */}
          <div
            className="absolute flex items-center justify-center pointer-events-auto"
            style={{
              top: '48.8%',
              left: '51.8%',
              width: '43%',
              height: '43%',
              transform: 'translate(-50%, -50%)',
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Outer Rotating Sci-Fi HUD Ring (Clockwise) */}
            <div 
              className={`absolute inset-0 rounded-full border border-dashed animate-spin pointer-events-none ${
                mode === 'out' ? 'border-amber-400/50' : 'border-cyan-400/40'
              }`}
              style={{ animationDuration: '22s' }}
            />

            {/* Inner Pulsing Neon Cyan/Amber Glow Ring */}
            <div 
              className={`absolute inset-1.5 sm:inset-2 rounded-full border pointer-events-none ${
                mode === 'out' 
                  ? 'border-amber-400/90 shadow-[0_0_15px_rgba(251,191,36,0.6)]' 
                  : 'border-cyan-400/80 shadow-[0_0_15px_rgba(34,211,238,0.6)]'
              }`}
            />

            {/* Counter-Rotating Tick Marks Ring */}
            <div 
              className={`absolute inset-3 sm:inset-4 rounded-full border-t-2 border-b-2 animate-spin pointer-events-none ${
                mode === 'out' ? 'border-amber-300/70' : 'border-cyan-300/70'
              }`}
              style={{ animationDuration: '14s', animationDirection: 'reverse' }}
            />

            {/* Top & Bottom Arrow HUD Markers */}
            <div className={`absolute top-1.5 sm:top-2 left-1/2 -translate-x-1/2 text-[9px] sm:text-[10px] leading-none pointer-events-none animate-pulse ${
              mode === 'out' ? 'text-amber-300' : 'text-cyan-300'
            }`}>
              ▲
            </div>
            <div className={`absolute bottom-1.5 sm:bottom-2 left-1/2 -translate-x-1/2 text-[9px] sm:text-[10px] leading-none pointer-events-none animate-pulse ${
              mode === 'out' ? 'text-amber-300' : 'text-cyan-300'
            }`}>
              ▼
            </div>

            {/* Digital Timer Capsule Pill */}
            <div 
              className={`relative z-10 px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-slate-950/95 border backdrop-blur-md flex items-center justify-center gap-1.5 sm:gap-2 transform hover:scale-105 transition-transform ${
                mode === 'out'
                  ? 'border-amber-400/90 shadow-[0_0_20px_rgba(251,191,36,0.7)]'
                  : 'border-cyan-400/90 shadow-[0_0_20px_rgba(34,211,238,0.7)]'
              }`}
            >
              {/* Left / Right Accent Bars */}
              <span className={`w-1 sm:w-1.5 h-2.5 sm:h-3 rounded-xs animate-pulse ${
                mode === 'out' ? 'bg-amber-400' : 'bg-cyan-400'
              }`} />
              
              {/* Digital Monospace Timer */}
              <span className={`font-mono text-xs sm:text-base md:text-lg font-black text-white tracking-widest ${
                mode === 'out' 
                  ? 'drop-shadow-[0_0_10px_rgba(251,191,36,0.9)]' 
                  : 'drop-shadow-[0_0_10px_rgba(34,211,238,0.9)]'
              }`}>
                {displayTimeText}
              </span>

              <span className={`w-1 sm:w-1.5 h-2.5 sm:h-3 rounded-xs animate-pulse ${
                mode === 'out' ? 'bg-amber-400' : 'bg-cyan-400'
              }`} />
            </div>

            {/* Sub-badge */}
            <div className={`absolute -bottom-3 sm:bottom-2 text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-wider bg-slate-950/90 px-2 py-0.5 rounded-full border shadow-sm pointer-events-none whitespace-nowrap ${
              mode === 'out'
                ? 'text-amber-200 border-amber-400/50'
                : 'text-cyan-200 border-cyan-400/50'
            }`}>
              {mode === 'out' ? 'Actual Time Worked' : 'Countdown to 00:00:00'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
