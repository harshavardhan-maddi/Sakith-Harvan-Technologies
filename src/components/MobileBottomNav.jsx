import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Briefcase, 
  Compass, 
  Trophy, 
  LayoutGrid, 
  X, 
  Calendar, 
  PhoneCall, 
  Shield, 
  Layers, 
  Globe, 
  Users, 
  HelpCircle, 
  Sun, 
  ChevronRight,
  Sparkles,
  Download
} from 'lucide-react';
import { Logo } from './Logo';

/**
 * MobileBottomNav
 * Native mobile app-style bottom navigation bar for Sakith Harvan Technologies.
 * Active when viewed on mobile screens (< 1024px) or installed as PWA.
 * Features:
 * - 5 native app bottom tabs: Home, Internships, Career (COC), Hackathons, and More
 * - Native bottom sheet drawer for "More" with quick access to Services, Solutions, About, FAQs & Actions
 * - Safe area inset padding for bezel-less devices (iOS notch/home bar, Android gesture nav)
 * - Zero horizontal overflow
 */
export const MobileBottomNav = ({
  activeTab,
  setActiveTab,
  onOpenConsultation,
  onOpenRequirement,
  onOpenAdmin,
  theme = 'blue',
  onToggleTheme
}) => {
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const checkStandalone = () => {
      const standalone = 
        window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(standalone);
    };

    checkStandalone();
    window.addEventListener('resize', checkStandalone);
    return () => window.removeEventListener('resize', checkStandalone);
  }, []);

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    setIsMoreSheetOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navTabs = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      badge: null
    },
    {
      id: 'internships',
      label: 'Internships',
      icon: Briefcase,
      badge: 'Live'
    },
    {
      id: 'coc',
      label: 'Career',
      icon: Compass,
      badge: 'New'
    },
    {
      id: 'hackathons',
      label: 'Hackathons',
      icon: Trophy,
      badge: null
    },
    {
      id: 'more',
      label: 'More',
      icon: LayoutGrid,
      badge: null
    }
  ];

  const secondaryModules = [
    {
      id: 'services',
      title: 'Our Services',
      desc: 'Campus bootcamps, workshops, custom engineering & AI labs',
      icon: Layers,
      color: 'bg-blue-50 text-blue-600 border-blue-200'
    },
    {
      id: 'solutions',
      title: 'SaaS & Solutions',
      desc: 'Campus ERP, HRMS, Biometrics & enterprise software',
      icon: Globe,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200'
    },
    {
      id: 'about',
      title: 'About & Founders',
      desc: 'Meet Founding MD Thoka Sai Krishna & CEO Maddi Harshavardhan',
      icon: Users,
      color: 'bg-sky-50 text-sky-600 border-sky-200'
    },
    {
      id: 'faqs',
      title: 'FAQs',
      desc: 'Frequently asked questions, security & support',
      icon: HelpCircle,
      color: 'bg-amber-50 text-amber-600 border-amber-200'
    }
  ];

  return (
    <>
      {/* ======================================================== */}
      {/* 1. NATIVE MOBILE APP BOTTOM NAVIGATION BAR               */}
      {/* ======================================================== */}
      <nav
        aria-label="Mobile app navigation"
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] select-none"
        style={{
          paddingBottom: 'max(0.35rem, env(safe-area-inset-bottom, 0px))'
        }}
      >
        <div className="w-full max-w-lg mx-auto px-2 py-1 flex items-center justify-around">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isMoreActive = tab.id === 'more' && (isMoreSheetOpen || ['services', 'solutions', 'about', 'faqs'].includes(activeTab));
            const isActive = tab.id === 'more' ? isMoreActive : activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'more') {
                    setIsMoreSheetOpen((prev) => !prev);
                  } else {
                    handleSelectTab(tab.id);
                  }
                }}
                className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-2xl transition-all duration-200 active:scale-90 cursor-pointer ${
                  isActive
                    ? 'text-blue-600 font-bold'
                    : 'text-slate-500 hover:text-slate-800 font-medium'
                }`}
              >
                {/* Active Indicator Top Pill */}
                {isActive && (
                  <span className="absolute -top-1 w-6 h-1 bg-blue-600 rounded-full shadow-sm shadow-blue-500/50 animate-in fade-in zoom-in duration-200" />
                )}

                {/* Tab Icon with container */}
                <div className={`relative p-1 rounded-xl transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 shadow-xs'
                    : 'text-slate-500'
                }`}>
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />

                  {/* Optional small dot badge */}
                  {tab.badge && !isActive && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
                  )}
                </div>

                {/* Tab Label */}
                <span className={`text-[10px] leading-tight mt-0.5 tracking-tight ${
                  isActive ? 'font-bold text-blue-600' : 'text-slate-500'
                }`}>
                  {tab.label}
                </span>

                {/* Optional mini pill badge if active */}
                {tab.badge && isActive && (
                  <span className="absolute -top-1.5 right-2 px-1 py-0.2 rounded-full text-[8px] font-extrabold uppercase bg-blue-600 text-white shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ======================================================== */}
      {/* 2. "MORE" BOTTOM ACTION SHEET (NATIVE MOBILE APP DRAWER) */}
      {/* ======================================================== */}
      {isMoreSheetOpen && (
        <div 
          className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsMoreSheetOpen(false)}
        >
          {/* Bottom Sheet Container */}
          <div
            className="w-full bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl p-5 space-y-5 animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{
              paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 0px))'
            }}
          >
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto -mt-1" />

            {/* Header: Brand & Close */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Logo size="sm" />
                <div>
                  <span className="text-xs font-extrabold text-slate-900 block leading-none">
                    Sakith Harvan
                  </span>
                  <span className="text-[10px] text-slate-500 block leading-tight">
                    Enterprise Software &amp; Solutions
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onToggleTheme}
                  type="button"
                  className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 text-xs flex items-center gap-1 font-semibold"
                  title="Toggle Theme Color"
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span className="text-[11px]">{theme === 'blue' ? 'Blue' : 'Red'}</span>
                </button>

                <button
                  onClick={() => setIsMoreSheetOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Secondary Modules Grid */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                Explore Modules
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {secondaryModules.map((item) => {
                  const Icon = item.icon;
                  const isCurrent = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full p-3 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-blue-50 border-blue-300 shadow-sm'
                          : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl border shrink-0 ${item.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${isCurrent ? 'text-blue-700' : 'text-slate-900'}`}>
                            {item.title}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight line-clamp-1 mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Primary Mobile Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                Executive &amp; Quick Actions
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => {
                    setIsMoreSheetOpen(false);
                    onOpenConsultation();
                  }}
                  className="btn-primary py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Consultation</span>
                </button>

                <button
                  onClick={() => {
                    setIsMoreSheetOpen(false);
                    onOpenRequirement();
                  }}
                  className="py-2.5 px-3 rounded-xl text-xs font-bold bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                  <span>Submit Scope</span>
                </button>
              </div>

              {/* Login / Portal Access */}
              <button
                onClick={() => {
                  setIsMoreSheetOpen(false);
                  onOpenAdmin();
                }}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <Shield className="w-4 h-4 text-blue-400" />
                <span>Unified Login (Admin • Staff • Candidate Portal)</span>
              </button>
            </div>

            {/* App Info Footer */}
            <div className="pt-2 text-center text-[10px] text-slate-400 flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              <span>Sakith Harvan Technologies {isStandalone ? '• PWA Active' : '• Mobile Web'}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};