import React from 'react';
import { Layers, ShieldCheck, Cpu, Code2, Users, ArrowRight } from 'lucide-react';

export const TrustIntro = ({ onOpenRequirement, onOpenConsultation }) => {
  return (
    <section className="py-20 bg-slate-950/60 border-y border-white/5 relative">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heading & Core Message */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
              <Layers className="w-3.5 h-3.5" />
              <span>Tailored Digital Engineering</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
              Technology Built Around <br />
              <span className="text-gradient">Your Vision</span>
            </h2>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              At <strong className="text-white">Sakith Harvan Technologies</strong>, we work with businesses, educational institutions, startups, and enterprises to build customized digital products that solve real challenges.
            </p>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 space-y-4">
              <p className="text-sm sm:text-base font-semibold text-cyan-300 italic">
                "We don't believe every organization needs the same off-the-shelf software."
              </p>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                We take the time to understand your exact operational requirement, design the architecture, develop the software product, deploy it to high-reliability cloud infrastructure, and provide dedicated ongoing technical support.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={onOpenRequirement}
                className="btn-primary text-sm px-6 py-3"
              >
                <span>Talk to Our Team</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenConsultation}
                className="btn-secondary text-sm px-6 py-3"
              >
                <span>Book Consultation</span>
              </button>
            </div>
          </div>

          {/* Right Column: Key Philosophy Cards */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            <div className="glass-card p-5 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Direct Founder Engagement</h4>
                <p className="text-xs text-slate-400 mt-1">
                  You work directly with founding leadership — guaranteeing transparent communication, rapid turnarounds, and executive accountability.
                </p>
              </div>
            </div>

            <div className="glass-card p-5 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center flex-shrink-0 border border-cyan-500/30">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Bespoke Software Architecture</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Every line of code, database schema, and mobile interface is engineered from the ground up specifically for your revenue model.
                </p>
              </div>
            </div>

            <div className="glass-card p-5 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">End-to-End SLA Reliability</h4>
                <p className="text-xs text-slate-400 mt-1">
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
