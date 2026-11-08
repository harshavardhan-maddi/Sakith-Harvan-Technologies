import React from 'react';
import logoImg from '../assets/logo.png';
import { Calendar, ArrowRight, ShieldCheck, Sparkles, Cpu, Code2, Zap } from 'lucide-react';

export const HeroSection = ({ onOpenConsultation, onNavigateServices, onOpenRequirement }) => {
  return (
    <section id="hero" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-grid-pattern">
      {/* Animated Soft Blue Ambient Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none animate-pulse-glow" />
      <div className="absolute top-1/3 right-10 w-[320px] h-[320px] bg-sky-400/10 blur-[85px] rounded-full pointer-events-none animate-float-slow" />
      <div className="absolute bottom-10 left-10 w-[280px] h-[280px] bg-indigo-500/10 blur-[90px] rounded-full pointer-events-none animate-float-delayed" />

      {/* Floating Animated Ambient Tech Elements (Desktop) */}
      <div className="hidden lg:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/90 border border-slate-200/90 shadow-md backdrop-blur-md absolute top-28 left-6 xl:left-14 animate-hero-floating pointer-events-none z-20">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-bold text-slate-800">99.9% Uptime Cloud Infra</span>
      </div>

      <div className="hidden lg:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/90 border border-slate-200/90 shadow-md backdrop-blur-md absolute top-36 right-6 xl:right-14 animate-hero-floating pointer-events-none z-20">
        <span className="p-1 rounded-lg bg-blue-50 text-blue-600">
          <Cpu className="w-3.5 h-3.5" />
        </span>
        <span className="text-xs font-bold text-slate-800">AI &amp; Automation Systems</span>
      </div>

      <div className="hidden xl:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/90 border border-slate-200/90 shadow-md backdrop-blur-md absolute bottom-16 left-16 animate-hero-floating pointer-events-none z-20">
        <span className="p-1 rounded-lg bg-indigo-50 text-indigo-600">
          <Code2 className="w-3.5 h-3.5" />
        </span>
        <span className="text-xs font-bold text-slate-800">Zero-Bloat Architecture</span>
      </div>

      <div className="hidden xl:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/90 border border-slate-200/90 shadow-md backdrop-blur-md absolute bottom-20 right-16 animate-hero-floating pointer-events-none z-20">
        <span className="p-1 rounded-lg bg-sky-50 text-sky-600">
          <Zap className="w-3.5 h-3.5" />
        </span>
        <span className="text-xs font-bold text-slate-800">&lt; 100ms API Latency</span>
      </div>

      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Animated Company Brand Logo Image with smooth entrance */}
          <div className="flex justify-center pb-2 relative animate-hero-logo">
            <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-full scale-75 animate-pulse-glow pointer-events-none" />
            <img
              src={logoImg}
              alt="Sakith Harvan Technologies"
              className="relative h-24 sm:h-32 md:h-36 w-auto max-w-[90vw] object-contain filter drop-shadow-[0_8px_24px_rgba(37,99,235,0.18)] hover:scale-103 transition-transform duration-300"
              onError={(e) => {
                e.target.src = '/SAKITH_HARVAN.png';
              }}
            />
          </div>

          {/* Animated Badge */}
          <div className="animate-hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold tracking-wide shadow-sm hover:border-blue-300 transition-colors">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span>Digital Transformation &amp; Enterprise SaaS Company</span>
          </div>

          {/* Animated Main Headline */}
          <h1 className="animate-hero-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            Building Digital Solutions <br className="hidden sm:inline" />
            <span className="text-gradient">That Move Businesses Forward</span>
          </h1>

          {/* Animated Supporting Headline */}
          <p className="animate-hero-desc text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto font-normal leading-relaxed">
            From powerful SaaS platforms to custom websites, mobile apps, AI solutions and enterprise software — we turn ideas into scalable digital products.
          </p>

          {/* Animated CTAs */}
          <div className="animate-hero-cta flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onOpenConsultation}
              className="btn-primary w-full sm:w-auto px-8 py-4 text-sm sm:text-base font-semibold glow-blue cursor-pointer hover:scale-102 active:scale-98 transition-transform"
            >
              <Calendar className="w-5 h-5" />
              <span>Book a Consultation</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onNavigateServices}
              className="btn-secondary w-full sm:w-auto px-8 py-4 text-sm sm:text-base font-semibold cursor-pointer hover:scale-102 active:scale-98 transition-transform"
            >
              <span>Explore Our Services</span>
            </button>
          </div>

          {/* Animated Live Elements Metric Strip */}
          <div className="animate-hero-metrics pt-6 flex flex-wrap items-center justify-center gap-2.5 max-w-3xl mx-auto">
            <div className="px-3.5 py-1.5 rounded-xl bg-white/90 border border-slate-200 shadow-2xs hover:shadow-sm hover:border-blue-300 transition-all flex items-center gap-2 text-xs font-medium text-slate-700">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span>Enterprise Cloud (Azure &amp; AWS)</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-white/90 border border-slate-200 shadow-2xs hover:shadow-sm hover:border-blue-300 transition-all flex items-center gap-2 text-xs font-medium text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Direct Founder Review</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-white/90 border border-slate-200 shadow-2xs hover:shadow-sm hover:border-blue-300 transition-all flex items-center gap-2 text-xs font-medium text-slate-700">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
              <span>Agile Milestone Sprints</span>
            </div>
          </div>

          {/* Animated Trust Statement */}
          <div className="animate-hero-metrics pt-2 flex items-center justify-center gap-2 text-xs sm:text-sm text-blue-700 font-medium tracking-wide">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>From Idea to Deployment — We Build, Integrate and Support.</span>
          </div>
        </div>
      </div>
    </section>
  );
};
