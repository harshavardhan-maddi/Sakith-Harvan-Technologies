import React from 'react';
import { Phone, Mail, ExternalLink, ShieldCheck, Target, Eye, Building2, MapPin, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import { COMPANY_DETAILS } from '../data/defaultData';
import maddiImg from '../assets/maddi_harshavardhan.png';
import saikrishnaImg from '../assets/thoka_sai_krishna.jpeg';

export const FoundersSection = ({ onOpenConsultation, onOpenRequirement }) => {
  const getFounderPhoto = (founderName) => {
    if (founderName.toLowerCase().includes('harshavardhan')) {
      return maddiImg;
    }
    if (founderName.toLowerCase().includes('krishna') || founderName.toLowerCase().includes('thoka')) {
      return saikrishnaImg;
    }
    return null;
  };

  const getPublicFallback = (founderName) => {
    if (founderName.toLowerCase().includes('harshavardhan')) {
      return '/maddi_harshavardhan.png';
    }
    return '/thoka_sai_krishna.jpeg';
  };

  return (
    <section id="about" className="py-20 md:py-28 relative bg-slate-950 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-red-600/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-rose-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="container-custom relative z-10 space-y-16">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/80 border border-red-500/30 text-rose-400 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            <span>About Sakith Harvan Technologies</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Driven by Innovation &amp; <span className="text-gradient">Technical Integrity</span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {COMPANY_DETAILS.positioning}
          </p>
        </div>

        {/* Mission & Vision Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Mission */}
          <div className="glass-card p-6 sm:p-8 rounded-2xl border border-white/10 space-y-4 relative overflow-hidden group hover:border-red-500/40">
            <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Our Mission</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              "{COMPANY_DETAILS.mission}"
            </p>
            <ul className="space-y-2 pt-2 border-t border-white/10 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Zero-bloat, production-ready codebases built to scale</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Transparent timelines and robust maintenance SLAs</span>
              </li>
            </ul>
          </div>

          {/* Vision */}
          <div className="glass-card p-6 sm:p-8 rounded-2xl border border-white/10 space-y-4 relative overflow-hidden group hover:border-rose-500/40">
            <div className="w-12 h-12 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Our Vision</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              "{COMPANY_DETAILS.vision}"
            </p>
            <ul className="space-y-2 pt-2 border-t border-white/10 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-400 shrink-0" />
                <span>Creating high-impact enterprise SaaS platforms</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-400 shrink-0" />
                <span>Nurturing technical excellence across institutions</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Founding Origin Badge Banner */}
        <div className="max-w-4xl mx-auto glass-card p-4 sm:p-6 rounded-2xl border border-white/10 bg-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-red-950/80 text-rose-400 border border-red-500/30">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Company Origin &amp; Establishment</div>
              <div className="text-sm font-bold text-white">
                Established {COMPANY_DETAILS.established} — Born out of {COMPANY_DETAILS.origin}
              </div>
            </div>
          </div>
          <span className="text-xs text-rose-400 font-mono bg-red-950/60 px-3 py-1.5 rounded-lg border border-red-500/30">
            Official Tech Partner
          </span>
        </div>

        {/* Leadership & Co-Founders Cards with Official Photos */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Leadership Team</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Meet the Founders</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {COMPANY_DETAILS.founders.map((founder) => {
              const photo = getFounderPhoto(founder.name);
              const fallback = getPublicFallback(founder.name);

              return (
                <div
                  key={founder.id}
                  className="glass-card p-6 sm:p-8 rounded-2xl border border-white/10 flex flex-col justify-between hover:border-red-500/40 transition-all duration-300 relative group"
                >
                  <div className="space-y-4">
                    {/* Top Header with Real Founder Photo */}
                    <div className="flex items-center gap-4">
                      <div className="relative shrink-0">
                        <img
                          src={photo}
                          alt={founder.name}
                          className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover object-top border-2 border-red-500/50 shadow-lg shadow-red-600/30 transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.target.src = fallback;
                          }}
                        />
                        <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-red-600 text-white text-[10px]">
                          <Award className="w-3 h-3" />
                        </span>
                      </div>

                      <div>
                        <h4 className="text-lg font-bold text-white group-hover:text-rose-400 transition-colors">
                          {founder.name}
                        </h4>
                        <p className="text-xs font-semibold text-red-400">
                          {founder.role}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          Co-Founder &amp; Engineering Architect
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed pt-2">
                      {founder.bio}
                    </p>

                    {/* Direct Contacts */}
                    <div className="space-y-2 pt-3 border-t border-white/10 text-xs">
                      <a
                        href={`tel:+${founder.phoneClean}`}
                        className="flex items-center gap-2 text-slate-300 hover:text-rose-400 transition-colors p-2 rounded-lg bg-slate-900/60 border border-white/5"
                      >
                        <Phone className="w-3.5 h-3.5 text-rose-400" />
                        <span>{founder.phone}</span>
                      </a>

                      <a
                        href={`mailto:${founder.email}`}
                        className="flex items-center gap-2 text-slate-300 hover:text-rose-400 transition-colors p-2 rounded-lg bg-slate-900/60 border border-white/5"
                      >
                        <Mail className="w-3.5 h-3.5 text-red-400" />
                        <span className="truncate">{founder.email}</span>
                      </a>

                      {founder.portfolio && (
                        <a
                          href={founder.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-rose-400 hover:text-rose-300 transition-colors p-2 rounded-lg bg-red-950/40 border border-red-500/30"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span className="truncate">View Founder Portfolio</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 mt-4">
                    <button
                      onClick={onOpenConsultation}
                      className="btn-secondary w-full text-xs py-2.5 justify-center"
                    >
                      <span>Connect with {founder.name.split(' ')[0]}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Commitment Statement */}
        <div className="max-w-3xl mx-auto text-center space-y-4 pt-6">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-red-500/20 text-xs sm:text-sm text-slate-300 flex items-center justify-center gap-2">
            <ShieldCheck className="w-5 h-5 text-rose-400 shrink-0" />
            <span>"{COMPANY_DETAILS.trustStatement}"</span>
          </div>
        </div>
      </div>
    </section>
  );
};
