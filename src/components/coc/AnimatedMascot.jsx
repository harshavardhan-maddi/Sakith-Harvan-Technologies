import React from 'react';
import logoImg from '../../assets/logo.png';

/**
 * AnimatedMascot Component
 * Sakith Harvan Technologies mascot with animated eye states:
 * - 'normal' / 'idle': Excited, looking around, wide glowing eyes, gentle floating.
 * - 'typing': Curious, looking down at input field.
 * - 'password': Hands float up and cover eyes (closed eyes / no peeking).
 * - 'peeking': One eye peeks out when password visibility is revealed!
 * - 'success': Cheering hands, victory bounce!
 */
export const AnimatedMascot = ({ state = 'normal', isPeeking = false, size = 'md' }) => {
  const isPassword = state === 'password' && !isPeeking;
  const isPeekState = state === 'password' && isPeeking;
  const isSuccess = state === 'success';
  const isTyping = state === 'typing';

  const containerSizes = {
    sm: 'w-24 h-24',
    md: 'w-36 h-36',
    lg: 'w-48 h-48'
  };

  return (
    <div className={`relative flex flex-col items-center justify-center ${containerSizes[size] || containerSizes.md} mx-auto select-none`}>
      {/* Soft Ambient Background Glow */}
      <div 
        className={`absolute inset-0 rounded-full blur-xl transition-all duration-500 pointer-events-none ${
          isPassword 
            ? 'bg-indigo-500/20 scale-95' 
            : isSuccess 
            ? 'bg-emerald-500/30 scale-110' 
            : 'bg-blue-500/25 scale-100 animate-pulse'
        }`} 
      />

      {/* SVG Robot / Cyber Mascot */}
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full relative z-10 transition-transform duration-300 transform"
        style={{
          transform: isSuccess 
            ? 'translateY(-6px) scale(1.05)' 
            : isTyping 
            ? 'translateY(2px) rotate(1deg)' 
            : 'translateY(0px)'
        }}
      >
        <defs>
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="50%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          <linearGradient id="visorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0B1329" />
            <stop offset="100%" stopColor="#030712" />
          </linearGradient>

          <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#60A5FA" />
          </linearGradient>

          <linearGradient id="cheekBlush" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FB7185" stopOpacity="0.1" />
          </linearGradient>

          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Floating Aura Rings */}
        <ellipse cx="100" cy="180" rx="45" ry="8" fill="rgba(37, 99, 235, 0.2)" className="animate-pulse" />

        {/* Head Antenna */}
        <line x1="100" y1="36" x2="100" y2="18" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round" />
        <circle cx="100" cy="16" r="7" fill={isSuccess ? '#10B981' : isPassword ? '#F59E0B' : '#38BDF8'} filter="url(#neonGlow)" />

        {/* Ears / Side Thrusters */}
        <rect x="24" y="80" width="12" height="30" rx="5" fill="#3B82F6" />
        <rect x="164" y="80" width="12" height="30" rx="5" fill="#3B82F6" />
        <circle cx="30" cy="95" r="3" fill="#60A5FA" />
        <circle cx="170" cy="95" r="3" fill="#60A5FA" />

        {/* Main Mascot Helmet / Head */}
        <rect
          x="34"
          y="36"
          width="132"
          height="115"
          rx="44"
          fill="url(#bodyGrad)"
          stroke="#60A5FA"
          strokeWidth="3.5"
          className="shadow-2xl"
        />

        {/* Brand Accent Crown Plate */}
        <path
          d="M 68 40 Q 100 34 132 40"
          stroke="#93C5FD"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />

        {/* Digital Glass Visor Screen */}
        <rect
          x="46"
          y="54"
          width="108"
          height="82"
          rx="32"
          fill="url(#visorGrad)"
          stroke="#1E3A8A"
          strokeWidth="2"
        />

        {/* Subtle Screen Reflection Highlight */}
        <path
          d="M 52 64 C 70 58, 120 58, 142 66"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Blushing Cheeks in Password / Shy State */}
        {(isPassword || isPeekState) && (
          <>
            <circle cx="62" cy="106" r="8" fill="url(#cheekBlush)" />
            <circle cx="138" cy="106" r="8" fill="url(#cheekBlush)" />
          </>
        )}

        {/* ======================================================== */}
        {/* EYES LAYER - DYNAMIC ANIMATIONS BASED ON STATE            */}
        {/* ======================================================== */}

        {/* STATE 1: NORMAL / IDLE (Wide excited glowing cyan eyes with reflection) */}
        {!isPassword && !isPeekState && !isSuccess && !isTyping && (
          <g>
            {/* Left Eye */}
            <circle cx="76" cy="88" r="14" fill="#38BDF8" filter="url(#neonGlow)" />
            <circle cx="76" cy="88" r="9" fill="#0284C7" />
            <circle cx="73" cy="84" r="4" fill="#FFFFFF" />
            <circle cx="79" cy="91" r="2" fill="#FFFFFF" />

            {/* Right Eye */}
            <circle cx="124" cy="88" r="14" fill="#38BDF8" filter="url(#neonGlow)" />
            <circle cx="124" cy="88" r="9" fill="#0284C7" />
            <circle cx="121" cy="84" r="4" fill="#FFFFFF" />
            <circle cx="127" cy="91" r="2" fill="#FFFFFF" />

            {/* Excited Smile */}
            <path
              d="M 88 110 Q 100 120 112 110"
              stroke="#38BDF8"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
              filter="url(#neonGlow)"
            />
          </g>
        )}

        {/* STATE 2: TYPING (Eyes focused downwards on input field) */}
        {isTyping && (
          <g>
            {/* Left Eye looking down */}
            <circle cx="76" cy="92" r="13" fill="#38BDF8" filter="url(#neonGlow)" />
            <circle cx="76" cy="95" r="7" fill="#0284C7" />
            <circle cx="74" cy="92" r="3" fill="#FFFFFF" />

            {/* Right Eye looking down */}
            <circle cx="124" cy="92" r="13" fill="#38BDF8" filter="url(#neonGlow)" />
            <circle cx="124" cy="95" r="7" fill="#0284C7" />
            <circle cx="122" cy="92" r="3" fill="#FFFFFF" />

            {/* Inquisitive Smile */}
            <path
              d="M 90 112 Q 100 118 110 112"
              stroke="#38BDF8"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )}

        {/* STATE 3: PASSWORD ENTERING - EYES SHUT TIGHT (Hands covering) */}
        {isPassword && (
          <g>
            {/* Closed left eyelid arc */}
            <path
              d="M 66 90 Q 76 98 86 90"
              stroke="#F59E0B"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              filter="url(#neonGlow)"
            />
            {/* Closed right eyelid arc */}
            <path
              d="M 114 90 Q 124 98 134 90"
              stroke="#F59E0B"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              filter="url(#neonGlow)"
            />

            {/* Shy "No Peeking" Cute Mouth */}
            <ellipse cx="100" cy="112" rx="4" ry="3" fill="#F59E0B" />
          </g>
        )}

        {/* STATE 4: PASSWORD PEEKING - One eye closed, one eye winking open! */}
        {isPeekState && (
          <g>
            {/* Left eye closed */}
            <path
              d="M 66 90 Q 76 98 86 90"
              stroke="#38BDF8"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />

            {/* Right eye curiously peeking open */}
            <circle cx="124" cy="88" r="13" fill="#38BDF8" filter="url(#neonGlow)" />
            <circle cx="124" cy="88" r="8" fill="#0284C7" />
            <circle cx="121" cy="84" r="4" fill="#FFFFFF" />

            {/* Mischievous half-smirk */}
            <path
              d="M 94 112 Q 102 118 112 110"
              stroke="#38BDF8"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )}

        {/* STATE 5: SUCCESS / CELEBRATION */}
        {isSuccess && (
          <g>
            {/* Joyful Star / Happy Arc Eyes */}
            <path
              d="M 66 92 Q 76 80 86 92"
              stroke="#10B981"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
              filter="url(#neonGlow)"
            />
            <path
              d="M 114 92 Q 124 80 134 92"
              stroke="#10B981"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
              filter="url(#neonGlow)"
            />

            {/* Big Open Happy Mouth */}
            <path
              d="M 88 108 Q 100 124 112 108 Z"
              fill="#10B981"
              filter="url(#neonGlow)"
            />
          </g>
        )}

        {/* ======================================================== */}
        {/* ROBOTIC FLOATING HANDS LAYER                             */}
        {/* Covers eyes in password state, chews/rests in normal     */}
        {/* ======================================================== */}
        {isPassword && (
          <g className="animate-in fade-in duration-300">
            {/* Left Hand Covering Left Eye */}
            <g transform="translate(62, 74)">
              <rect x="0" y="0" width="28" height="24" rx="8" fill="#2563EB" stroke="#93C5FD" strokeWidth="2.5" />
              <line x1="7" y1="5" x2="7" y2="18" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
              <line x1="14" y1="5" x2="14" y2="18" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
              <line x1="21" y1="5" x2="21" y2="18" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* Right Hand Covering Right Eye */}
            <g transform="translate(110, 74)">
              <rect x="0" y="0" width="28" height="24" rx="8" fill="#2563EB" stroke="#93C5FD" strokeWidth="2.5" />
              <line x1="7" y1="5" x2="7" y2="18" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
              <line x1="14" y1="5" x2="14" y2="18" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
              <line x1="21" y1="5" x2="21" y2="18" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
            </g>
          </g>
        )}

        {isPeekState && (
          <g className="animate-in fade-in duration-200">
            {/* Left Hand still covers left eye */}
            <g transform="translate(62, 74)">
              <rect x="0" y="0" width="28" height="24" rx="8" fill="#2563EB" stroke="#93C5FD" strokeWidth="2.5" />
            </g>
            {/* Right Hand pulled down slightly peeking */}
            <g transform="translate(114, 102)">
              <rect x="0" y="0" width="28" height="22" rx="8" fill="#2563EB" stroke="#93C5FD" strokeWidth="2.5" />
            </g>
          </g>
        )}

        {!isPassword && !isPeekState && (
          <g>
            {/* Floating Left Paws / Hands */}
            <ellipse
              cx={isSuccess ? "40" : "44"}
              cy={isSuccess ? "40" : "142"}
              rx="12"
              ry="10"
              fill="#2563EB"
              stroke="#60A5FA"
              strokeWidth="2"
              className="transition-all duration-300"
            />
            {/* Floating Right Paws / Hands */}
            <ellipse
              cx={isSuccess ? "160" : "156"}
              cy={isSuccess ? "40" : "142"}
              rx="12"
              ry="10"
              fill="#2563EB"
              stroke="#60A5FA"
              strokeWidth="2"
              className="transition-all duration-300"
            />
          </g>
        )}
      </svg>

      {/* Interactive Status Speech Pill */}
      <div className="mt-2 text-center">
        {isPassword && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold shadow-sm animate-bounce">
            🙈 Shh! I'm closing my eyes!
          </span>
        )}
        {isPeekState && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold shadow-sm">
            👀 Just peeking one eye!
          </span>
        )}
        {isTyping && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-[11px] font-medium shadow-sm">
            ✨ Looking good, keep going...
          </span>
        )}
        {isSuccess && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold shadow-sm animate-pulse">
            🎉 Awesome! Welcome to Sakith Harvan!
          </span>
        )}
        {!isPassword && !isPeekState && !isTyping && !isSuccess && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium">
            ⚡ Ready to elevate your career
          </span>
        )}
      </div>
    </div>
  );
};
