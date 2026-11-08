import React, { useState, useEffect } from 'react';
import { Sparkles, Megaphone, Bell } from 'lucide-react';
import { getStoredMarqueeSettings } from '../../lib/internshipStore';

/**
 * MarqueeAnnouncement Component
 * Displays a continuous smooth marquee announcement slide.
 * Text and active state are strictly controlled by Admin.
 * Can be shown on InternshipsPage and CourseOfCareerPage.
 */
export const MarqueeAnnouncement = ({ page = 'all', className = '' }) => {
  const [settings, setSettings] = useState(() => getStoredMarqueeSettings());

  useEffect(() => {
    const handleUpdate = (e) => {
      if (e.detail) {
        setSettings(e.detail);
      } else {
        setSettings(getStoredMarqueeSettings());
      }
    };

    window.addEventListener('sh_marquee_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('sh_marquee_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  if (!settings || !settings.enabled || !settings.text || !settings.text.trim()) {
    return null;
  }

  // Filter by target page
  if (page === 'internships' && settings.showOnInternships === false) {
    return null;
  }
  if (page === 'coc' && settings.showOnCOC === false) {
    return null;
  }

  const speedSeconds = Number(settings.speed) || 30;

  return (
    <div className={`w-full overflow-hidden bg-slate-950/95 border-y border-white/10 backdrop-blur-md text-white select-none relative z-30 shadow-lg ${className}`}>
      <div className="flex items-center">
        {/* Fixed Announcement Tag on the left */}
        <div className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-800 text-white font-mono text-[11px] font-extrabold uppercase tracking-wider z-10 shadow-md">
          <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
          <span className="hidden sm:inline">ANNOUNCEMENT</span>
          <span className="sm:hidden">NOTICE</span>
        </div>

        {/* Sliding Marquee Track */}
        <div className="relative flex-1 overflow-hidden py-2.5">
          <div 
            className="whitespace-nowrap flex items-center hover:[animation-play-state:paused]"
            style={{
              animation: `shtMarquee ${speedSeconds}s linear infinite`
            }}
          >
            {/* Repeated text blocks to ensure seamless infinite scroll */}
            <div className="flex items-center gap-12 pr-12 text-xs font-medium text-cyan-200">
              <span className="flex items-center gap-2">
                <span>{settings.text}</span>
              </span>
              <span className="text-slate-500 font-bold">•</span>
              <span className="text-slate-300 font-mono text-[11px] tracking-wide">
                Sakith Harvan Technologies Official Notice
              </span>
              <span className="text-slate-500 font-bold">•</span>
            </div>

            <div className="flex items-center gap-12 pr-12 text-xs font-medium text-cyan-200" aria-hidden="true">
              <span className="flex items-center gap-2">
                <span>{settings.text}</span>
              </span>
              <span className="text-slate-500 font-bold">•</span>
              <span className="text-slate-300 font-mono text-[11px] tracking-wide">
                Sakith Harvan Technologies Official Notice
              </span>
              <span className="text-slate-500 font-bold">•</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shtMarquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
};

