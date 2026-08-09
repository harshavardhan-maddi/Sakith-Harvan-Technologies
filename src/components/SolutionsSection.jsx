import React, { useState } from 'react';
import { Layers, Globe, Smartphone, Bot, Cpu, ArrowRight, Sparkles, CheckCircle2, Sliders, ShieldCheck } from 'lucide-react';

export const SolutionsSection = ({ onOpenRequirement }) => {
  const [activeTab, setActiveTab] = useState('web');

  const solutionTypes = [
    {
      id: 'web',
      name: 'Custom Web Apps',
      icon: Globe,
      tagline: 'If You Can Imagine It, We Can Build It',
      description: 'High-speed, responsive, ultra-secure web applications, business portals, and custom e-commerce applications built with React, Next.js, and Node.',
      features: [
        'Custom Corporate & Business Portals',
        'Higher Education & College Websites',
        'Headless E-Commerce & Marketplaces',
        'Real-Time Dashboards & PWAs'
      ],
      tech: ['React.js', 'Vite', 'Node.js', 'TailwindCSS', 'PostgreSQL', 'Vercel / Netlify']
    },
    {
      id: 'mobile',
      name: 'Mobile Apps (iOS & Android)',
      icon: Smartphone,
      tagline: 'Native Performance Across All Devices',
      description: 'Cross-platform mobile applications for enterprise employees, students, customers, and field agents featuring push notifications and offline sync.',
      features: [
        'Android & iOS Cross-Platform Applications',
        'Biometric & Geolocation Check-Ins',
        'Offline Sync & Real-time Push Alerts',
        'Play Store & App Store Deployment'
      ],
      tech: ['React Native', 'Flutter', 'Firebase', 'REST APIs', 'GraphQL']
    },
    {
      id: 'ai',
      name: 'Agentic AI & Automation',
      icon: Bot,
      tagline: 'Autonomous AI Workflows & Intelligent Agents',
      description: 'Custom AI chatbots, document extraction pipelines, voice assistants, and RAG knowledge bases tailored for your organization.',
      features: [
        'Agentic Workflow Automation',
        'AI Customer Support & Voice Agents',
        'RAG Knowledge Base & Vector Search',
        'Automated Document & Invoice Parsing'
      ],
      tech: ['Python', 'Claude 3.5 APIs', 'LangChain / LangGraph', 'OpenAI', 'Pinecone']
    },
    {
      id: 'enterprise',
      name: 'Enterprise Cloud & DevOps',
      icon: Cpu,
      tagline: '99.9% Uptime Cloud Infrastructure',
      description: 'Scalable cloud server architectures, database management, automated backup routines, and 24/7 security monitoring on Azure and AWS.',
      features: [
        'Azure & AWS Infrastructure Setup',
        'Database Optimization & Auto-Scaling',
        'CI/CD Pipelines & Docker Containers',
        'Security Audits & Disaster Recovery'
      ],
      tech: ['Microsoft Azure', 'AWS', 'Docker', 'Kubernetes', 'Nginx', 'GitHub Actions']
    }
  ];

  const currentSolution = solutionTypes.find(s => s.id === activeTab);

  return (
    <section id="solutions" className="py-20 md:py-28 relative bg-slate-950/90 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/3 left-1/4 w-[450px] h-[450px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="container-custom relative z-10 space-y-16">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/80 border border-blue-500/30 text-blue-400 text-xs font-semibold">
            <Sliders className="w-3.5 h-3.5" />
            <span>Tailored Digital Engineering</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Comprehensive Digital <span className="text-gradient">Solutions Architecture</span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Whether you need a custom web platform, a mobile application, an AI-powered agent, or full cloud deployment — we engineer robust solutions engineered for your business model.
          </p>
        </div>

        {/* Interactive Tabbed Architecture Showcase */}
        <div className="glass-card max-w-5xl mx-auto p-6 sm:p-8 rounded-2xl border border-white/10 glow-blue">
          {/* Solution Selector Tabs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {solutionTypes.map((sol) => {
              const Icon = sol.icon;
              const isActive = activeTab === sol.id;
              return (
                <button
                  key={sol.id}
                  onClick={() => setActiveTab(sol.id)}
                  className={`p-4 rounded-xl flex flex-col items-center text-center gap-3 transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-blue-400'
                      : 'bg-slate-900/70 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs font-bold">{sol.name}</span>
                </button>
              );
            })}
          </div>

          {/* Active Solution Content Panel */}
          {currentSolution && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-900/80 p-6 rounded-xl border border-white/5">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{currentSolution.tagline}</span>
                </div>

                <h3 className="text-2xl font-bold text-white">{currentSolution.name}</h3>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {currentSolution.description}
                </p>

                <div className="space-y-2 pt-2">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Key Capabilities</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentSolution.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tech Badges */}
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <div className="text-[11px] font-mono text-slate-400">TECHNOLOGY STACK:</div>
                  <div className="flex flex-wrap gap-2">
                    {currentSolution.tech.map((t, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-md bg-slate-950 text-cyan-400 text-[11px] font-mono border border-cyan-500/20">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Column */}
              <div className="lg:col-span-5 flex flex-col justify-between h-full p-6 rounded-xl bg-slate-950/80 border border-white/10 space-y-6">
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Got a Specific Requirement?</div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Submit your scope, wireframes, or idea to get a fast technical assessment, architecture blueprint, and cost estimation from our engineering lead.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-500/20 text-xs text-blue-300 space-y-1">
                  <div className="font-semibold text-white flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    Guaranteed Delivery SLAs
                  </div>
                  <p className="text-[11px] text-slate-400">Direct technical leadership involvement from start to finish.</p>
                </div>

                <button
                  onClick={() => onOpenRequirement({ prefillCategory: currentSolution.name })}
                  className="btn-primary w-full text-xs py-3.5 glow-blue justify-center"
                >
                  <span>Submit Requirement for {currentSolution.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
