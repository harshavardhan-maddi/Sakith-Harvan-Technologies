import React, { useState, useEffect } from 'react';
import { 
  Download, Smartphone, Monitor, CheckCircle2, Sparkles, Share2, 
  PlusSquare, Zap, Shield, WifiOff, ArrowRight, X, Layers, Check,
  ExternalLink, BellRing, ArrowDownCircle
} from 'lucide-react';
import { Logo } from './Logo';

export const PWAInstallCard = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showDesktopGuide, setShowDesktopGuide] = useState(false);

  // Auto Drop-In Card State on page load
  const [showDropCard, setShowDropCard] = useState(false);

  useEffect(() => {
    // 1. Check if running as standalone PWA
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      setIsInstalled(true);
      setShowDropCard(false);
    } else {
      // Check if user dismissed it in this browser session
      const dismissed = sessionStorage.getItem('sh_pwa_drop_dismissed');
      if (!dismissed) {
        // Automatically drop the installation card 1.5 seconds after website loads
        const timer = setTimeout(() => {
          setShowDropCard(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }

    // 2. Check if iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 3. Listen for native browser install prompt (Chrome, Edge, Android, etc.)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      // Ensure the drop card is visible when the browser detects installability
      const dismissed = sessionStorage.getItem('sh_pwa_drop_dismissed');
      if (!dismissed && !isStandalone) {
        setShowDropCard(true);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setShowDropCard(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleDismissDropCard = () => {
    setShowDropCard(false);
    sessionStorage.setItem('sh_pwa_drop_dismissed', 'true');
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
        setShowDropCard(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      setShowDesktopGuide(true);
    }
  };

  return (
    <>
      {/* =================================================================== */}
      {/* 1. AUTO DROP-IN APP INSTALLATION CARD (ON PAGE LOAD)                */}
      {/* =================================================================== */}
      {showDropCard && !isInstalled && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm sm:max-w-md w-[calc(100%-2rem)] animate-in slide-in-from-top-8 fade-in duration-500">
          <div className="glass-card p-5 sm:p-6 rounded-3xl border-2 border-red-500/60 bg-gradient-to-br from-slate-900 via-slate-950 to-red-950/90 shadow-2xl shadow-red-950/60 glow-blue space-y-4 relative overflow-hidden backdrop-blur-xl">
            {/* Background Glow */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-red-600/30 rounded-full blur-[60px] pointer-events-none" />

            {/* Header with Close Button */}
            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-red-500/50 p-2 flex items-center justify-center shadow-lg shadow-red-600/20 shrink-0">
                  <Logo size="sm" />
                </div>

                <div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold tracking-wide shadow-md shadow-red-600/30 mb-0.5">
                    <Download className="w-2.5 h-2.5 animate-bounce" />
                    <span>INSTALL PWA APP</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white leading-tight">
                    Sakith Harvan Technologies
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Official Progressive Web App
                  </p>
                </div>
              </div>

              <button
                onClick={handleDismissDropCard}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Value Proposition bullets */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 relative z-10 pt-1">
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900/80 border border-white/5">
                <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>1-Tap Launch</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900/80 border border-white/5">
                <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Unified Portal</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900/80 border border-white/5">
                <WifiOff className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Offline Support</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900/80 border border-white/5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>No Store Clutter</span>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex items-center gap-2 pt-1 relative z-10">
              <button
                onClick={handleInstallClick}
                className="btn-primary flex-1 py-2.5 px-4 text-xs font-bold glow-blue shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5 animate-pulse" />
                <span>Install App Now</span>
              </button>

              <button
                onClick={handleDismissDropCard}
                className="py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-medium transition-colors border border-white/10"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 2. LANDING PAGE INLINE EMBEDDED INSTALL APP CARD                    */}
      {/* =================================================================== */}
      <div id="install-app-card" className="container-custom py-10">
        <div className="relative overflow-hidden rounded-3xl border border-red-500/40 bg-gradient-to-br from-slate-900 via-slate-950 to-red-950/40 p-6 sm:p-10 shadow-2xl glow-blue">
          {/* Background Ambient Glows */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-red-600/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            {/* Left Column: Information & Brand Badge */}
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-bold tracking-wide shadow-md shadow-red-600/30">
                  <Download className="w-3.5 h-3.5 animate-bounce" />
                  <span>OFFICIAL WEB APP • PWA</span>
                </span>

                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800/80 border border-white/10 text-cyan-300 text-xs font-semibold">
                  <Monitor className="w-3 h-3" />
                  <span>Desktop &amp; Mobile Ready</span>
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                  Install Sakith Harvan <span className="text-gradient">App on Your Device</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Enjoy instant 1-click access from your phone home screen or PC taskbar, ultra-fast native loading, offline caching, and direct gateway access to our <strong>Executive &amp; Staff Unified Portal</strong> without needing app stores.
                </p>
              </div>

              {/* 4 Feature Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-900/80 border border-white/5">
                  <div className="p-2 rounded-xl bg-red-950/80 text-rose-400 border border-red-500/30 shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Instant 1-Click Launch</div>
                    <div className="text-[11px] text-slate-400">Home screen &amp; Windows/Mac taskbar</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-900/80 border border-white/5">
                  <div className="p-2 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Unified Portal Access</div>
                    <div className="text-[11px] text-slate-400">Admin, Leadership &amp; Staff Dashboards</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-900/80 border border-white/5">
                  <div className="p-2 rounded-xl bg-amber-950/80 text-amber-400 border border-amber-500/30 shrink-0">
                    <WifiOff className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Offline &amp; Fast Cache</div>
                    <div className="text-[11px] text-slate-400">Instant page loads even on low network</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-900/80 border border-white/5">
                  <div className="p-2 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Zero App Store Clutter</div>
                    <div className="text-[11px] text-slate-400">&lt;2MB size with automatic background updates</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Action Box */}
            <div className="w-full lg:w-auto shrink-0 flex flex-col items-center lg:items-end gap-3">
              {isInstalled ? (
                <div className="p-5 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-center space-y-2 max-w-xs shadow-xl">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="font-extrabold text-white text-sm">App Already Installed!</div>
                  <p className="text-[11px] text-emerald-300/80">
                    Sakith Harvan Technologies is running in native app mode on your device.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto">
                  <button
                    onClick={handleInstallClick}
                    className="btn-primary py-4 px-8 text-sm sm:text-base font-extrabold glow-blue shadow-2xl shadow-red-600/30 flex items-center justify-center gap-2.5 transform hover:scale-105 active:scale-95 transition-all"
                  >
                    <Download className="w-5 h-5 animate-pulse" />
                    <span>Install App Now</span>
                    <ArrowRight className="w-4 h-4 opacity-80" />
                  </button>

                  <div className="flex items-center justify-center gap-3 text-xs text-slate-400">
                    {isIOS ? (
                      <button
                        onClick={() => setShowIOSGuide(true)}
                        className="hover:text-cyan-400 underline flex items-center gap-1"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>iOS Safari Install Steps</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowDesktopGuide(true)}
                        className="hover:text-cyan-400 underline flex items-center gap-1"
                      >
                        <Monitor className="w-3.5 h-3.5" />
                        <span>Desktop / Browser Guide</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* iOS Installation Instruction Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-card max-w-md w-full p-6 sm:p-8 rounded-3xl border border-cyan-500/40 space-y-5 relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">Install on iOS (iPhone / iPad)</h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-200">
              <p className="text-slate-300">
                Apple iOS supports Progressive Web Apps via Safari in 2 simple steps:
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900 border border-white/10">
                  <div className="p-2 rounded-xl bg-blue-950 text-cyan-400 border border-blue-500/30 font-bold shrink-0">
                    1
                  </div>
                  <div>
                    <strong className="text-white block">Tap the Safari "Share" Icon</strong>
                    <span className="text-slate-400 text-xs">
                      At the bottom of your Safari screen, tap the Share icon <Share2 className="w-3.5 h-3.5 inline text-cyan-400" />.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900 border border-white/10">
                  <div className="p-2 rounded-xl bg-red-950 text-rose-400 border border-red-500/30 font-bold shrink-0">
                    2
                  </div>
                  <div>
                    <strong className="text-white block">Select "Add to Home Screen"</strong>
                    <span className="text-slate-400 text-xs">
                      Scroll down in the share menu and tap <strong>Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline text-rose-400" />.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="btn-primary w-full py-3 text-xs font-bold"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* Desktop / Manual Browser Guide Modal */}
      {showDesktopGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-card max-w-md w-full p-6 sm:p-8 rounded-3xl border border-red-500/40 space-y-5 relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-white text-base">Desktop &amp; Browser Install</h3>
              </div>
              <button
                onClick={() => setShowDesktopGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300">
              <p>
                You can install <strong>Sakith Harvan Technologies</strong> directly as an app in Chrome, Edge, Brave, or Android:
              </p>
              <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-2">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Address Bar Install Icon</span>
                </div>
                <p className="text-xs text-slate-400">
                  Look for the <strong>Install icon (⊕ or computer with download arrow)</strong> on the right side of your browser's URL address bar, and click <strong>Install</strong>.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowDesktopGuide(false)}
              className="btn-primary w-full py-3 text-xs font-bold"
            >
              Close Guide
            </button>
          </div>
        </div>
      )}
    </>
  );
};
