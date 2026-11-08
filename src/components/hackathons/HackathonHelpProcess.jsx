import React, { useState } from 'react';
import { 
  GitBranch, Compass, Users, Key, Rocket, Send, Trophy, 
  HelpCircle, ChevronRight, CheckCircle2, ShieldCheck, Clock, BookOpen, Layers
} from 'lucide-react';

/**
 * HackathonHelpProcess Component
 * Interactive visual sprint guide presented as:
 * 1. Mind Map / Sprint Roadmap Flowchart
 * 2. Bloom's Taxonomy Engineering Cognitive Stages
 */
export const HackathonHelpProcess = () => {
  const [viewMode, setViewMode] = useState('mindmap'); // 'mindmap' | 'blooms'
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 1,
      tag: 'Step 01',
      title: 'Analyze & Select Problem Statement',
      category: 'Understand & Brainstorm',
      icon: Compass,
      color: 'blue',
      summary: 'Review live problem statement domains, architectural requirements, and evaluation rubrics.',
      details: 'Read through the public summaries of each track (Agentic AI, FinTech, Cyber Security, Cloud SaaS). Choose the problem statement that best matches your squad’s technical stack and innovation vision.',
      badge: 'Publicly Accessible'
    },
    {
      id: 2,
      tag: 'Step 02',
      title: 'Form Squad & Register Details',
      category: 'Collaborate & Register',
      icon: Users,
      color: 'indigo',
      summary: 'Team leader inputs team name, selects team size (2 to 5 members), and captures member profiles.',
      details: 'Provide full names, active WhatsApp mobile numbers, academic email addresses, college, and city locations for all members. Member 1 is automatically designated as Team Leader for official notices.',
      badge: 'Leader Action'
    },
    {
      id: 3,
      tag: 'Step 03',
      title: 'Pay Entry Fee & Receive Secret Credentials',
      category: 'Verify & Authenticate',
      icon: Key,
      color: 'cyan',
      summary: 'Confirm registration with fixed entry fee to instantly generate your Team ID & Secret Password.',
      details: 'Instant credential generation algorithm generates your unique Team ID (e.g. SA125) and customized team password (e.g. NEXSHT5SA125 formula: Team Prefix + SHT + Size + ID). Save these securely to access your workspace.',
      badge: 'Instant Generation'
    },
    {
      id: 4,
      tag: 'Step 04',
      title: 'Statement Release & Start Deployment',
      category: 'Architect & Sprint',
      icon: Rocket,
      color: 'emerald',
      summary: 'Once admin unlocks the sprint, reveal complete secret test cases, rules, and launch deployment.',
      details: 'When the official hackathon timer triggers or admin enables the release toggle, access the full problem statement, secret test datasets, and starter repos. Hit "Start Deployment" to initiate the active build countdown.',
      badge: 'Admin Regulated'
    },
    {
      id: 5,
      tag: 'Step 05',
      title: 'Submit Deployed Links, GitHub & Credentials',
      category: 'Deploy & Deliver',
      icon: Send,
      color: 'amber',
      summary: 'Submit your live URL, GitHub repository, demo login credentials, and test notes before the hard deadline.',
      details: 'Your team workspace lets you provide: 1) Live Deployed URL (Vercel/Render/Cloud), 2) Public GitHub repository with clean commits, 3) Demo login ID & test password for evaluators, 4) Operational notes on how to run.',
      badge: 'Strict Deadline'
    },
    {
      id: 6,
      tag: 'Step 06',
      title: 'Judge Evaluation & Hall of Fame Podium',
      category: 'Evaluate & Celebrate',
      icon: Trophy,
      color: 'rose',
      summary: 'Founders and tech leads evaluate live projects; 1st, 2nd, and 3rd place winners announced.',
      details: 'Submissions are benchmarked on architecture, accuracy, and deployment reliability. Winners receive cash prizes, verified industrial internship vouchers, and direct Pre-Placement Offers (PPO).',
      badge: 'Grand Finale'
    }
  ];

  const bloomsStages = [
    {
      level: 'Level 1: Remember & Recognize',
      domain: 'Foundations & System Taxonomy',
      desc: 'Understand the problem statement scope, architectural constraints, and API specifications.',
      color: 'border-blue-500 bg-blue-50/50'
    },
    {
      level: 'Level 2: Understand & Synthesize',
      domain: 'Domain Ingestion',
      desc: 'Map edge cases: handling noisy datasets, unauthenticated requests, latency limits, and concurrency.',
      color: 'border-indigo-500 bg-indigo-50/50'
    },
    {
      level: 'Level 3: Apply & Build',
      domain: 'Active Development Sprint',
      desc: 'Code the core logic, containerize microservices, integrate ML models, and construct reactive UI components.',
      color: 'border-cyan-500 bg-cyan-50/50'
    },
    {
      level: 'Level 4: Analyze & Benchmark',
      domain: 'Testing & Hardening',
      desc: 'Execute unit tests, simulate burst traffic, verify zero-knowledge proofs, and calibrate agent responses.',
      color: 'border-amber-500 bg-amber-50/50'
    },
    {
      level: 'Level 5: Evaluate & Document',
      domain: 'Audit & Demo Credentials',
      desc: 'Deploy to cloud, create test user roles with sample credentials, and formulate reproducible running notes.',
      color: 'border-emerald-500 bg-emerald-50/50'
    },
    {
      level: 'Level 6: Create & Elevate',
      domain: 'Production Deployment & Pitch',
      desc: 'Ship production URL, submit before strict admin deadline, and defend architecture before executive leadership.',
      color: 'border-rose-500 bg-rose-50/50'
    }
  ];

  return (
    <div className="rounded-2xl bg-[#12141F] border border-white/10 p-6 sm:p-8 shadow-xl text-slate-100">
      {/* Header with Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>NEXARVA Protocol Guide</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">
            Sprint Blueprint &amp; Process Architecture
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            End-to-end operational roadmap from squad registration to final deployment submission.
          </p>
        </div>

        {/* View Switcher: Mind Map vs Bloom's Taxonomy */}
        <div className="inline-flex p-1 rounded-xl bg-white/5 border border-white/10 self-stretch sm:self-auto">
          <button
            onClick={() => setViewMode('mindmap')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              viewMode === 'mindmap'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Process Flowchart</span>
          </button>
          <button
            onClick={() => setViewMode('blooms')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              viewMode === 'blooms'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Bloom’s Taxonomy</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: PROCESS FLOWCHART / MIND MAP */}
      {viewMode === 'mindmap' && (
        <div className="pt-6">
          {/* Timeline node rail */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {steps.map((st, idx) => {
              const IconComp = st.icon;
              const isSelected = activeStep === idx;

              return (
                <div
                  key={st.id}
                  onClick={() => setActiveStep(idx)}
                  className={`relative p-5 rounded-xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/10 shadow-lg ring-2 ring-amber-400/25'
                      : 'border-white/10 bg-white/5 hover:border-amber-400/40 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/10 text-amber-300">
                      {st.tag}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
                      {st.badge}
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-500 text-slate-950 font-bold shadow-xs shrink-0">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white line-clamp-1">{st.title}</h4>
                      <p className="text-[11px] text-slate-400 font-medium">{st.category}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-3 line-clamp-2 leading-relaxed font-normal">
                    {st.summary}
                  </p>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-semibold text-amber-400">
                    <span>Read Protocol</span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Expanded Step Details Box */}
          <div className="mt-6 p-5 rounded-xl bg-black/60 text-white border border-amber-500/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="font-mono text-xs font-bold text-amber-400">
                  {steps[activeStep].tag} PROTOCOL DEEP DIVE
                </span>
              </div>
              <span className="text-xs text-slate-400">
                Stage {activeStep + 1} of {steps.length}
              </span>
            </div>
            <div className="pt-3">
              <h4 className="text-base font-bold text-white mb-1">
                {steps[activeStep].title}
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                {steps[activeStep].details}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: BLOOM'S TAXONOMY FRAMEWORK */}
      {viewMode === 'blooms' && (
        <div className="pt-6 space-y-3">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Bloom&apos;s Revised Taxonomy for Engineering Hackathons models the cognitive climb from problem statement ingestion to final deployment defense.
            </span>
          </div>

          <div className="space-y-2.5 pt-2">
            {bloomsStages.map((stage, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border-l-4 border-amber-500 border border-white/10 bg-white/5 shadow-md transition-all hover:translate-x-1"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-bold text-white">{stage.level}</span>
                  <span className="text-[11px] font-mono text-amber-400 font-semibold">{stage.domain}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  {stage.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

