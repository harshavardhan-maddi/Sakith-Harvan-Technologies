import React, { useState, useEffect } from 'react';
import { 
  Download, Smartphone, Monitor, CheckCircle2, Sparkles, Share2, 
  PlusSquare, Zap, Shield, WifiOff, ArrowRight, X, Layers, Check 
} from 'lucide-react';
import { Logo } from './Logo';

export const PWAInstallCard = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showDesktopGuide, setShowDesktopGuide] = useState(false);

  useEffect(() => {
    // 1. Check if running as standalone PWA
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      setIsInstalled(true);
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
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      setShowDesktopGuide(true);
    }
  };

  return (
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
    </div>
  );
};
