import React from 'react';
import { Layers, ShieldCheck, Cpu, Code2, Users, ArrowRight, Sparkles } from 'lucide-react';

export const TrustIntro = ({ onOpenRequirement, onOpenConsultation }) => {
  return (
    <section className="py-20 bg-slate-50/70 border-y border-slate-200/80 relative overflow-hidden">
      {/* Soft Ambient Floating Orbs */}
      <div className="absolute top-1/2 left-10 w-[380px] h-[380px] bg-blue-500/5 blur-[110px] rounded-full pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-sky-400/5 blur-[90px] rounded-full pointer-events-none animate-float-slow" />

      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heading & Core Message */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold shadow-sm">
              <Layers className="w-3.5 h-3.5 animate-pulse" />
              <span>Tailored Digital Engineering</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">
              Technology Built Around <br />
              <span className="text-gradient">Your Vision</span>
            </h2>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              At <strong className="text-slate-900">Sakith Harvan Technologies</strong>, we work with businesses, educational institutions, startups, and enterprises to build customized digital products that solve real challenges.
            </p>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4 hover:shadow-md transition-all duration-300">
              <p className="text-sm sm:text-base font-semibold text-blue-700 italic">
                "We don't believe every organization needs the same off-the-shelf software."
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                We take the time to understand your exact operational requirement, design the architecture, develop the software product, deploy it to high-reliability cloud infrastructure, and provide dedicated ongoing technical support.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={onOpenRequirement}
                className="btn-primary text-sm px-6 py-3 cursor-pointer hover:scale-102 active:scale-98 transition-transform"
              >
                <span>Talk to Our Team</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenConsultation}
                className="btn-secondary text-sm px-6 py-3 cursor-pointer hover:scale-102 active:scale-98 transition-transform"
              >
                <span>Book Consultation</span>
              </button>
            </div>
          </div>

          {/* Right Column: Key Philosophy Cards with Animated Hover Interactivity */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            <div className="glass-card p-5 flex gap-4 items-start shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group cursor-default">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 border border-blue-200 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">Direct Founder Engagement</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  You work directly with founding leadership — guaranteeing transparent communication, rapid turnarounds, and executive accountability.
                </p>
              </div>
            </div>

            <div className="glass-card p-5 flex gap-4 items-start shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group cursor-default">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0 border border-sky-200 group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white transition-all duration-300">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-sky-700 transition-colors">Bespoke Software Architecture</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Every line of code, database schema, and mobile interface is engineered from the ground up specifically for your revenue model.
                </p>
              </div>
            </div>

            <div className="glass-card p-5 flex gap-4 items-start shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group cursor-default">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 border border-emerald-200 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">End-to-End SLA Reliability</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  From initial requirement discovery through cloud deployment and post-launch maintenance, we remain your long-term technical partner.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
