import React, { useState } from 'react';
import { 
  Layers, Users, Sparkles, Globe, ArrowRight, ShieldCheck, 
  Smartphone, Laptop, HardDrive, Cpu, Sliders, Calendar
} from 'lucide-react';

export const SolutionsSection = ({ 
  onOpenRequirement,
  onOpenConsultation 
}) => {
  // State for Custom Solutions
  const [activeCustomTab, setActiveCustomTab] = useState('custom');

  // State for SaaS Solutions
  const [activeSaasTab, setActiveSaasTab] = useState('erp');

  // 1. Custom Engineering, Apps, Websites, iOS, Offline, Native, etc.
  const customSolutions = [
    {
      id: 'custom',
      name: 'Custom Software',
      shortLabel: 'Custom',
      badge: 'Tailored Architecture',
      icon: Sliders,
      tagline: 'Bespoke Software Architecture for Unique Enterprise Workflows',
      description: 'Tailored enterprise software systems engineered from scratch to match proprietary business logic, specialized workflows, and secure institutional data structures with zero unnecessary agency bloat.',
      features: ['Custom', 'Modular', 'Scalable', 'Automated', 'Secure', 'Audit-Ready', 'Cloud-Native', 'Zero-Bloat'],
      tech: ['React.js', 'Node.js', 'PostgreSQL', 'Docker', 'Microsoft Azure']
    },
    {
      id: 'app',
      name: 'App (Web & Mobile)',
      shortLabel: 'App',
      badge: 'Cross-Platform',
      icon: Smartphone,
      tagline: 'High-Performance Cross-Platform Mobile & Web Apps',
      description: 'Modern multi-platform applications engineered with fluid 120 FPS animations, reactive state synchronization, push notifications, and offline caching for Android, iOS, and Web.',
      features: ['App', 'Fast', 'Responsive', 'Cross-Platform', 'Real-Time', 'Sync', 'Push-Alerts', 'Interactive'],
      tech: ['Flutter', 'React Native', 'React.js', 'Node.js', 'Firebase']
    },
    {
      id: 'website',
      name: 'Website & Web Portals',
      shortLabel: 'Website',
      badge: 'Ultra-Fast Web',
      icon: Globe,
      tagline: 'Ultra-Fast Responsive Web Portals & Institutional Sites',
      description: 'High-speed, SEO-optimized web applications with sub-second page loads, responsive layouts, accessible UI/UX, and robust CMS backend integrations.',
      features: ['Website', 'Responsive', 'Fast', 'SEO', 'Modern', 'Accessible', 'Secure', 'Dynamic'],
      tech: ['Next.js', 'React.js', 'TailwindCSS', 'Vercel', 'TypeScript']
    },
    {
      id: 'ios',
      name: 'iOS Applications',
      shortLabel: 'iOS App',
      badge: 'Apple Ecosystem',
      icon: Smartphone,
      tagline: 'Dedicated Apple iOS Applications for iPhone & iPad',
      description: 'High-grade iOS mobile applications engineered with Swift and Flutter, leveraging Apple biometric authentication (Face ID/Touch ID), Apple Pay, and strict App Store compliance.',
      features: ['iOS', 'Native', 'Swift', 'Fluid', 'Biometrics', 'AppStore', 'Encrypted', 'Haptics'],
      tech: ['Swift', 'SwiftUI', 'Flutter', 'Apple Developer', 'TestFlight']
    },
    {
      id: 'offline',
      name: 'Offline Applications',
      shortLabel: 'Offline',
      badge: 'Zero-Latency Edge',
      icon: HardDrive,
      tagline: 'Mission-Critical Software That Runs Flawlessly Without Internet',
      description: 'Standalone desktop and edge software with local SQLite/IndexedDB storage, automated background sync when connectivity resumes, and zero network latency.',
      features: ['Offline', 'Local-Sync', 'Standalone', 'Encrypted', 'SQLite', 'Reliable', 'Zero-Latency', 'Edge'],
      tech: ['Electron', 'SQLite', 'IndexedDB', 'Tauri', 'C# / .NET']
    },
    {
      id: 'native',
      name: 'Native Applications',
      shortLabel: 'Native',
      badge: 'Hardware Accelerated',
      icon: Cpu,
      tagline: 'Direct Hardware-Accelerated Native Software',
      description: 'High-throughput native software engineered for direct OS integration, maximum memory efficiency, multi-threading, and hardware-accelerated processing.',
      features: ['Native', 'Optimized', 'Low-Latency', 'Hardware-Accelerated', 'Secure', 'Multi-Threaded', 'Robust'],
      tech: ['C++', 'Rust', 'Swift', 'Kotlin', 'Qt']
    },
    {
      id: 'android',
      name: 'Android Applications',
      shortLabel: 'Android App',
      badge: 'Google Play',
      icon: Smartphone,
      tagline: 'Scalable Android Mobile Applications for Global Reach',
      description: 'Optimized Android applications with modern Material design, background services, Google Play services, biometric verification, and deep device hardware integration.',
      features: ['Android', 'Material-UI', 'Google-Play', 'Biometrics', 'Push-Alerts', 'Responsive', 'Scalable'],
      tech: ['Kotlin', 'Flutter', 'Android SDK', 'Firebase', 'Jetpack Compose']
    },
    {
      id: 'pwa',
      name: 'Progressive Web Apps (PWA)',
      shortLabel: 'PWA',
      badge: 'Installable Web',
      icon: Laptop,
      tagline: 'Installable Lightweight Web Applications with Instant Caching',
      description: 'App-like web experiences installable directly on home screens without app store downloads, featuring background cache workers and ultra-fast performance.',
      features: ['PWA', 'Installable', 'Cached', 'Lightweight', 'Push-Alerts', 'Responsive', 'Offline-Ready'],
      tech: ['Service Workers', 'Workbox', 'Web Manifest', 'React.js']
    }
  ];

  // 2. SaaS Platforms & Products
  const saasSolutions = [
    {
      id: 'erp',
      name: 'ERP (Enterprise Resource Planning)',
      shortLabel: 'Campus ERP',
      badge: 'Institutional Ledger',
      icon: Layers,
      tagline: 'Complete Operational & Institutional Management Ledger',
      description: 'Enterprise ERP systems engineered for institutions, hospitals, and corporations with biometric attendance, SIS, fees, HRMS, and multi-tenant ledger control.',
      features: ['Modular', 'Automated', 'Ledger', 'Inventory', 'Payroll', 'Invoicing', 'Multi-Branch', 'Secure', 'Cloud', 'Audit-Ready'],
      tech: ['React.js', 'Node.js', 'PostgreSQL', 'Docker', 'Microsoft Azure']
    },
    {
      id: 'crm',
      name: 'CRM (Customer Relationship Management)',
      shortLabel: 'CRM',
      badge: 'Client Engine',
      icon: Users,
      tagline: 'High-Conversion Sales & Client Relationship Engine',
      description: 'Intelligent CRM platform unifying incoming leads, omnichannel communications, sales pipelines, task assignments, and automated follow-ups.',
      features: ['Leads', 'Pipeline', 'Omnichannel', 'Ticketing', 'Analytics', 'Follow-ups', 'Conversion', 'Automated', 'Integrations', 'Real-Time'],
      tech: ['React.js', 'Express.js', 'MongoDB', 'Redis', 'WebSockets']
    },
    {
      id: 'integrated',
      name: 'All-in-One / Integrated Suites',
      shortLabel: 'All-in-One Suites',
      badge: 'Unified Ecosystem',
      icon: Sparkles,
      tagline: 'Unified End-to-End Enterprise Software Suite',
      description: 'Integrated digital ecosystem connecting ERP, CRM, mobile apps, employee portals, and payment gateways into one cohesive centralized system.',
      features: ['Unified', 'End-to-End', 'Multi-Tenant', 'Centralized', 'SSO', 'Cross-Platform', 'Scalable', 'Automated', 'Real-Time', 'Customizable'],
      tech: ['Microservices', 'GraphQL', 'Next.js', 'PostgreSQL', 'AWS / Azure']
    }
  ];

  const currentCustomSolution = customSolutions.find(s => s.id === activeCustomTab) || customSolutions[0];
  const currentSaasSolution = saasSolutions.find(s => s.id === activeSaasTab) || saasSolutions[0];

  return (
    <section id="solutions" className="py-12 md:py-16 relative bg-slate-50 overflow-hidden">
      {/* Soft Blue Ambient Glow */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-blue-500/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="container-custom relative z-10 space-y-20">
        
        {/* ========================================================================= */}
        {/* BLOCK 1: CUSTOM, APP, WEBSITE, IOS APP, OFFLINE, NATIVE, ANDROID, PWA     */}
        {/* ========================================================================= */}
        <div className="space-y-10">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold shadow-sm">
              <Globe className="w-3.5 h-3.5" />
              <span>Custom Applications &amp; Engineering</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              Custom <span className="text-gradient">Digital Solutions</span>
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Bespoke web applications, cross-platform mobile apps, native software, and offline-first systems engineered to your exact specifications.
            </p>
          </div>

          {/* Interactive Card Container */}
          <div className="glass-card max-w-5xl mx-auto p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-md">
            {/* Custom Solution Selector Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-8">
              {customSolutions.map((sol) => {
                const Icon = sol.icon;
                const isActive = activeCustomTab === sol.id;
                return (
                  <button
                    key={sol.id}
                    onClick={() => setActiveCustomTab(sol.id)}
                    className={`p-3.5 rounded-xl flex flex-col items-center text-center gap-2 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-400'
                        : 'bg-white text-slate-600 hover:text-blue-600 hover:bg-slate-50 border border-slate-200'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="text-xs font-bold leading-tight">{sol.shortLabel}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Custom Solution Detail Panel */}
            {currentCustomSolution && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-50/80 p-6 sm:p-8 rounded-xl border border-slate-200/80">
                <div className="lg:col-span-7 space-y-5">
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{currentCustomSolution.tagline}</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{currentCustomSolution.name}</h3>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {currentCustomSolution.description}
                  </p>

                  {/* Feature Badges */}
                  <div className="pt-2 border-t border-slate-200">
                    <div className="flex flex-wrap gap-2">
                      {currentCustomSolution.features.map((feat, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/90 shadow-2xs hover:bg-blue-600 hover:text-white transition-colors cursor-default"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tech Stack Badges */}
                  <div className="pt-3 border-t border-slate-200 space-y-2">
                    <div className="text-[11px] font-mono text-slate-500 font-semibold">TECHNOLOGY STACK:</div>
                    <div className="flex flex-wrap gap-2">
                      {currentCustomSolution.tech.map((t, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-md bg-white text-blue-700 text-[11px] font-mono font-medium border border-blue-200 shadow-sm">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Column */}
                <div className="lg:col-span-5 flex flex-col justify-between h-full p-6 rounded-xl bg-white border border-slate-200/80 space-y-6 shadow-sm">
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">Build This Solution</div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Custom-engineered to match your exact institutional or business workflow with high availability and ongoing enterprise support.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-blue-50/80 border border-blue-200 text-xs text-blue-800 space-y-1">
                    <div className="font-semibold text-slate-900 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Direct Executive Architecture</span>
                    </div>
                    <p className="text-[11px] text-slate-600">Architected and overseen directly by founding leadership.</p>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => onOpenRequirement && onOpenRequirement({ prefillCategory: currentCustomSolution.name, productName: currentCustomSolution.name })}
                      className="btn-primary w-full text-xs py-3.5 glow-blue justify-center font-semibold cursor-pointer"
                    >
                      <span>Build {currentCustomSolution.shortLabel}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    {onOpenConsultation && (
                      <button
                        onClick={onOpenConsultation}
                        className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        <span>Book 30-Min Technical Call</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BLOCK 2: SAAS PLATFORMS & PRODUCTS (KEPT BELOW BLOCK 1)                    */}
        {/* ========================================================================= */}
        <div id="saas-platforms" className="space-y-10 pt-8 border-t border-slate-200/80">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold shadow-sm">
              <Layers className="w-3.5 h-3.5" />
              <span>Enterprise Platforms</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              SaaS Platforms &amp; <span className="text-gradient">Products</span>
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Purpose-built institutional and operational software suites engineered for automated workflows, ledger reliability, and seamless multi-branch scalability.
            </p>
          </div>

          {/* Interactive Card Container */}
          <div className="glass-card max-w-5xl mx-auto p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-md">
            {/* SaaS Solution Selector Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              {saasSolutions.map((sol) => {
                const Icon = sol.icon;
                const isActive = activeSaasTab === sol.id;
                return (
                  <button
                    key={sol.id}
                    onClick={() => setActiveSaasTab(sol.id)}
                    className={`p-4 rounded-xl flex flex-col items-center text-center gap-2 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-400'
                        : 'bg-white text-slate-600 hover:text-blue-600 hover:bg-slate-50 border border-slate-200'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="text-xs font-bold leading-tight">{sol.shortLabel}</span>
                  </button>
                );
              })}
            </div>

            {/* Active SaaS Solution Detail Panel */}
            {currentSaasSolution && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-50/80 p-6 sm:p-8 rounded-xl border border-slate-200/80">
                <div className="lg:col-span-7 space-y-5">
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{currentSaasSolution.tagline}</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{currentSaasSolution.name}</h3>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {currentSaasSolution.description}
                  </p>

                  {/* Feature Badges */}
                  <div className="pt-2 border-t border-slate-200">
                    <div className="flex flex-wrap gap-2">
                      {currentSaasSolution.features.map((feat, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/90 shadow-2xs hover:bg-blue-600 hover:text-white transition-colors cursor-default"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tech Stack Badges */}
                  <div className="pt-3 border-t border-slate-200 space-y-2">
                    <div className="text-[11px] font-mono text-slate-500 font-semibold">TECHNOLOGY STACK:</div>
                    <div className="flex flex-wrap gap-2">
                      {currentSaasSolution.tech.map((t, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-md bg-white text-blue-700 text-[11px] font-mono font-medium border border-blue-200 shadow-sm">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Column */}
                <div className="lg:col-span-5 flex flex-col justify-between h-full p-6 rounded-xl bg-white border border-slate-200/80 space-y-6 shadow-sm">
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">Deploy This Platform</div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Custom-deployed to match your organizational structure with continuous database backups, high-availability SLA, and dedicated founder involvement.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-blue-50/80 border border-blue-200 text-xs text-blue-800 space-y-1">
                    <div className="font-semibold text-slate-900 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Enterprise SLA &amp; Support</span>
                    </div>
                    <p className="text-[11px] text-slate-600">Production monitoring and zero-downtime upgrades.</p>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => onOpenRequirement && onOpenRequirement({ prefillCategory: currentSaasSolution.name, productName: currentSaasSolution.name })}
                      className="btn-primary w-full text-xs py-3.5 glow-blue justify-center font-semibold cursor-pointer"
                    >
                      <span>Deploy {currentSaasSolution.shortLabel}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    {onOpenConsultation && (
                      <button
                        onClick={onOpenConsultation}
                        className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        <span>Book 30-Min Technical Call</span>
                      </button>
                    )}
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
