import React, { useState } from 'react';
import logoImg from '../assets/logo.png';
import { Calendar, ArrowRight, LayoutDashboard, Globe, Smartphone, Bot, Cloud, CheckCircle, ShieldCheck, Sparkles } from 'lucide-react';

export const HeroSection = ({ onOpenConsultation, onNavigateServices, onOpenRequirement }) => {
  const [activeVisualTab, setActiveVisualTab] = useState('saas');

  const visualTabs = [
    { id: 'saas', label: 'SaaS Dashboard', icon: LayoutDashboard },
    { id: 'website', label: 'Website Interface', icon: Globe },
    { id: 'mobile', label: 'Mobile Application', icon: Smartphone },
    { id: 'ai', label: 'AI Agent Interface', icon: Bot },
    { id: 'cloud', label: 'Cloud Infrastructure', icon: Cloud }
  ];

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-grid-pattern">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-red-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-rose-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Company Brand Logo Image Display (Larger Size) */}
          <div className="flex justify-center pb-4">
            <img
              src={logoImg}
              alt="Sakith Harvan Technologies"
              className="h-24 sm:h-32 md:h-40 w-auto max-w-[90vw] object-contain filter drop-shadow-[0_0_30px_rgba(239,68,68,0.55)] hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.src = '/SAKITH_HARVAN.png';
              }}
            />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/80 border border-red-500/30 text-red-400 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>Digital Transformation & Enterprise SaaS Company</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Building Digital Solutions <br className="hidden sm:inline" />
            <span className="text-gradient">That Move Businesses Forward</span>
          </h1>

          {/* Supporting Headline */}
          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            From powerful SaaS platforms to custom websites, mobile apps, AI solutions and enterprise software — we turn ideas into scalable digital products.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onOpenConsultation}
              className="btn-primary w-full sm:w-auto px-8 py-4 text-sm sm:text-base font-semibold glow-blue"
            >
              <Calendar className="w-5 h-5" />
              <span>Book a Consultation</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onNavigateServices}
              className="btn-secondary w-full sm:w-auto px-8 py-4 text-sm sm:text-base font-semibold"
            >
              <span>Explore Our Services</span>
            </button>
          </div>

          {/* Trust Statement */}
          <div className="pt-3 flex items-center justify-center gap-2 text-xs sm:text-sm text-rose-400 font-medium tracking-wide">
            <ShieldCheck className="w-4 h-4 text-rose-400" />
            <span>From Idea to Deployment — We Build, Integrate and Support.</span>
          </div>
        </div>

        {/* Interactive Technology Visual Showcase */}
        <div className="mt-14 max-w-5xl mx-auto glass-card p-4 sm:p-6 rounded-2xl border border-white/10 glow-blue">
          {/* Tab Selection */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 border-b border-white/10 no-scrollbar">
            {visualTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeVisualTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveVisualTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Visual Display Content */}
          <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-white/10 p-6 min-h-[320px] sm:min-h-[380px] flex flex-col justify-between">
            {/* Top Bar Mockup */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-2 text-xs font-mono text-slate-500">https://sakithharvan.com/engine</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>ENTERPRISE PLATFORM ACTIVE</span>
              </div>
            </div>

            {/* Content Mockups Based On Tab */}
            {activeVisualTab === 'saas' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">Campus ERP & Enterprise SaaS Platform</h3>
                    <p className="text-xs text-slate-400">Real-time attendance ledger, SIS records & fee gateway</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-semibold border border-blue-500/30">
                    Live Production UI
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-900/90 p-4 rounded-xl border border-white/5 space-y-2">
                    <div className="text-xs text-slate-400">Active Students & Faculty</div>
                    <div className="text-2xl font-extrabold text-white">4,850+</div>
                    <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Real-time Automated Sync
                    </div>
                  </div>

                  <div className="bg-slate-900/90 p-4 rounded-xl border border-white/5 space-y-2">
                    <div className="text-xs text-slate-400">Attendance Rate</div>
                    <div className="text-2xl font-extrabold text-cyan-400">96.4%</div>
                    <div className="text-[11px] text-slate-400">Biometric & QR Verified</div>
                  </div>

                  <div className="bg-slate-900/90 p-4 rounded-xl border border-white/5 space-y-2">
                    <div className="text-xs text-slate-400">Fee Reconciliation</div>
                    <div className="text-2xl font-extrabold text-emerald-400">Instant Ledger</div>
                    <div className="text-[11px] text-emerald-400">Automated SMS Receipts</div>
                  </div>
                </div>

                <div className="p-4 bg-blue-950/30 border border-blue-500/20 rounded-xl flex items-center justify-between">
                  <div className="text-xs text-slate-300">
                    Need a custom ERP, SIS, or Faculty Management System for your institution?
                  </div>
                  <button onClick={onOpenRequirement} className="btn-primary py-1.5 px-4 text-xs">
                    Request ERP Quote
                  </button>
                </div>
              </div>
            )}

            {activeVisualTab === 'website' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">High-Performance Custom Web Applications</h3>
                    <p className="text-xs text-slate-400">Bespoke design system, sub-second load times & conversion design</p>
                  </div>
                  <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full text-xs font-semibold border border-cyan-500/30">
                    Jamstack & SSR
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-900/90 rounded-xl border border-white/5 space-y-2">
                    <div className="text-xs font-semibold text-blue-400">Corporate & Institution Portals</div>
                    <p className="text-xs text-slate-300">Custom web engineering tailored specifically to your organization model.</p>
                  </div>
                  <div className="p-4 bg-slate-900/90 rounded-xl border border-white/5 space-y-2">
                    <div className="text-xs font-semibold text-cyan-400">E-Commerce & Marketplaces</div>
                    <p className="text-xs text-slate-300">Multi-tenant marketplaces, payment gateway integrations & inventory engines.</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-900 border border-cyan-500/30 rounded-xl text-center">
                  <p className="text-sm font-semibold text-white">"If you can imagine it, we can build it."</p>
                  <p className="text-xs text-slate-400 mt-1">25+ Web platform architecture types supported.</p>
                </div>
              </div>
            )}

            {activeVisualTab === 'mobile' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">Cross-Platform iOS & Android Mobile Apps</h3>
                    <p className="text-xs text-slate-400">Native performance, push notifications & smooth animations</p>
                  </div>
                  <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-semibold border border-indigo-500/30">
                    iOS / Android
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 items-center justify-around py-4 bg-slate-900/80 rounded-xl border border-white/5">
                  <div className="text-center space-y-1">
                    <div className="w-10 h-10 mx-auto rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-bold text-white">Student & Employee Apps</div>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="w-10 h-10 mx-auto rounded-full bg-cyan-600/20 flex items-center justify-center text-cyan-400">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-bold text-white">Push Notifications</div>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="w-10 h-10 mx-auto rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-bold text-white">Offline Sync</div>
                  </div>
                </div>
              </div>
            )}

            {activeVisualTab === 'ai' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">Agentic AI & Voice Automation Systems</h3>
                    <p className="text-xs text-slate-400">Multi-agent orchestrators, RAG systems, & real-time voice agents</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-semibold border border-emerald-500/30">
                    LangGraph & Pipecat
                  </span>
                </div>

                <div className="p-4 bg-slate-900/90 rounded-xl border border-white/5 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>AGENT_ORCHESTRATOR :: STATUS</span>
                    <span className="text-emerald-400">ONLINE</span>
                  </div>
                  <div className="text-cyan-300">
                    &gt; Executing workflow: Automated Lead Processing &amp; Document AI
                  </div>
                  <div className="text-slate-400">
                    &gt; RAG Knowledge Base Queried: 1,420 enterprise records indexed.
                  </div>
                </div>
              </div>
            )}

            {activeVisualTab === 'cloud' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">Cloud Infrastructure & Azure Provisioning</h3>
                    <p className="text-xs text-slate-400">High availability, SSL encryption, database replication & SLAs</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-semibold border border-blue-500/30">
                    Microsoft Azure / AWS
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-slate-900 rounded-xl border border-white/5">
                    <div className="text-xs text-slate-400">Cloud Uptime</div>
                    <div className="text-lg font-extrabold text-emerald-400">99.99%</div>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-white/5">
                    <div className="text-xs text-slate-400">Security</div>
                    <div className="text-lg font-extrabold text-cyan-400">AES-256</div>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-white/5">
                    <div className="text-xs text-slate-400">Backups</div>
                    <div className="text-lg font-extrabold text-blue-400">Automated</div>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-white/5">
                    <div className="text-xs text-slate-400">DevOps Pipeline</div>
                    <div className="text-lg font-extrabold text-indigo-400">CI / CD</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
