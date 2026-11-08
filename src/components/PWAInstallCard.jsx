import React, { useState, useEffect } from 'react';
import { 
  Download, Smartphone, Monitor, CheckCircle2, Sparkles, Share2, 
  PlusSquare, Zap, Shield, WifiOff, ArrowRight, X 
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
      const dismissed = sessionStorage.getItem('sh_pwa_drop_dismissed');
      if (!dismissed && !isStandalone) {
        setShowDropCard(true);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setShowDropCard(false);
      sessionStorage.setItem('sh_pwa_drop_dismissed', 'true');
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
      {/* 1. AUTO DROP-IN APP INSTALLATION CARD (ON PAGE LOAD) */}
      {showDropCard && !isInstalled && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm sm:max-w-md w-[calc(100%-2rem)] animate-in slide-in-from-top-8 fade-in duration-300">
          <div className="glass-card p-5 sm:p-6 rounded-3xl border border-blue-200 bg-white shadow-2xl space-y-4 relative overflow-hidden">
            {/* Background Soft Glow */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none" />

            {/* Header with Close Button */}
            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 p-2 flex items-center justify-center shadow-sm shrink-0">
                  <Logo size="sm" />
                </div>

                <div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold tracking-wide shadow-sm mb-0.5">
                    <Download className="w-2.5 h-2.5 animate-bounce" />
                    <span>INSTALL PWA APP</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                    Sakith Harvan Technologies
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Official Progressive Web App
                  </p>
                </div>
              </div>

              <button
                onClick={handleDismissDropCard}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Value Proposition bullets */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 relative z-10 pt-1">
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>1-Tap Launch</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Unified Portal</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                <WifiOff className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>Offline Support</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>No Store Clutter</span>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex items-center gap-2 pt-1 relative z-10">
              <button
                onClick={handleInstallClick}
                className="btn-primary flex-1 py-2.5 px-4 text-xs font-bold shadow-md flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5 animate-pulse" />
                <span>Install App Now</span>
              </button>

              <button
                onClick={handleDismissDropCard}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold transition-colors border border-slate-200"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. LANDING PAGE INLINE EMBEDDED INSTALL APP CARD */}
      <div id="install-app-card" className="container-custom py-10">
        <div className="relative overflow-hidden rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50/80 via-white to-sky-50/80 p-6 sm:p-10 shadow-md">
          {/* Background Ambient Glows */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-sky-400/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            {/* Left Column: Information & Brand Badge */}
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 text-white text-xs font-bold tracking-wide shadow-sm">
                  <Download className="w-3.5 h-3.5 animate-bounce" />
                  <span>OFFICIAL WEB APP • PWA</span>
                </span>

                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-slate-200 text-blue-700 text-xs font-semibold shadow-sm">
                  <Monitor className="w-3 h-3" />
                  <span>Desktop &amp; Mobile Ready</span>
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Install Sakith Harvan <span className="text-gradient">App on Your Device</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Enjoy instant 1-click access from your phone home screen or PC taskbar, ultra-fast native loading, offline caching, and direct gateway access to our <strong>Executive &amp; Staff Unified Portal</strong> without needing app stores.
                </p>
              </div>

              {/* 4 Feature Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Instant 1-Click Launch</div>
                    <div className="text-[11px] text-slate-500">Home screen &amp; Windows/Mac taskbar</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                  <div className="p-2 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Unified Portal Access</div>
                    <div className="text-[11px] text-slate-500">Admin, Leadership &amp; Staff Dashboards</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                    <WifiOff className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Offline &amp; Fast Cache</div>
                    <div className="text-[11px] text-slate-500">Instant page loads even on low network</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Zero App Store Clutter</div>
                    <div className="text-[11px] text-slate-500">&lt;2MB size with automatic background updates</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Action Box */}
            <div className="w-full lg:w-auto shrink-0 flex flex-col items-center lg:items-end gap-3">
              {isInstalled ? (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2 max-w-xs shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm">App Already Installed!</div>
                  <p className="text-[11px] text-emerald-700 font-medium">
                    Sakith Harvan Technologies is running in native app mode on your device.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto">
                  <button
                    onClick={handleInstallClick}
                    className="btn-primary py-4 px-8 text-sm sm:text-base font-extrabold shadow-lg flex items-center justify-center gap-2.5 transform hover:scale-102 active:scale-98 transition-all"
                  >
                    <Download className="w-5 h-5 animate-pulse" />
                    <span>Install App Now</span>
                    <ArrowRight className="w-4 h-4 opacity-80" />
                  </button>

                  <div className="flex items-center justify-center gap-3 text-xs text-slate-500">
                    {isIOS ? (
                      <button
                        onClick={() => setShowIOSGuide(true)}
                        className="hover:text-blue-600 underline flex items-center gap-1 font-medium"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>iOS Safari Install Steps</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowDesktopGuide(true)}
                        className="hover:text-blue-600 underline flex items-center gap-1 font-medium"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card max-w-md w-full p-6 sm:p-8 rounded-3xl border border-blue-200 space-y-5 relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Install on iOS (iPhone / iPad)</h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700">
              <p className="text-slate-600">
                Apple iOS supports Progressive Web Apps via Safari in 2 simple steps:
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-bold shrink-0">
                    1
                  </div>
                  <div>
                    <strong className="text-slate-900 block">Tap the Safari "Share" Icon</strong>
                    <span className="text-slate-500 text-xs">
                      At the bottom of your Safari screen, tap the Share icon <Share2 className="w-3.5 h-3.5 inline text-blue-600" />.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="p-2 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 font-bold shrink-0">
                    2
                  </div>
                  <div>
                    <strong className="text-slate-900 block">Select "Add to Home Screen"</strong>
                    <span className="text-slate-500 text-xs">
                      Scroll down in the share menu and tap <strong>Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline text-sky-600" />.
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card max-w-md w-full p-6 sm:p-8 rounded-3xl border border-blue-200 space-y-5 relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Desktop &amp; Browser Install</h3>
              </div>
              <button
                onClick={() => setShowDesktopGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-600">
              <p>
                You can install <strong className="text-slate-900">Sakith Harvan Technologies</strong> directly as an app in Chrome, Edge, Brave, or Android:
              </p>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-blue-600" />
                  <span>Address Bar Install Icon</span>
                </div>
                <p className="text-xs text-slate-500">
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
