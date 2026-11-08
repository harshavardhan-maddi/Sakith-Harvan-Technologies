import React from 'react';
import { Phone, Mail, ExternalLink, ShieldCheck, Target, Eye, Building2, Award, Sparkles, CheckCircle2 } from 'lucide-react';
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
    <section id="about" className="py-12 relative bg-slate-50 overflow-hidden">
      {/* Background Soft Blue Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="container-custom relative z-10 space-y-16">
        {/* Section Header - Centered */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold tracking-wide shadow-sm">
            <Building2 className="w-3.5 h-3.5" />
            <span>EXECUTIVE LEADERSHIP &amp; FOUNDING DIRECTORS</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Driven by Innovation &amp; <span className="text-gradient">Technical Excellence</span>
          </h2>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {COMPANY_DETAILS.positioning}
          </p>
        </div>

        {/* Leadership & Co-Founders Cards with Centered Official Photos & Details */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-sky-500" />
              <span>Sakith Harvan Engineering Leadership</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Meet Our Founders</h3>
          </div>

          {/* Centered Grid for Co-Founders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {COMPANY_DETAILS.founders.map((founder) => {
              const photo = getFounderPhoto(founder.name);
              const fallback = getPublicFallback(founder.name);

              return (
                <div
                  key={founder.id}
                  className="glass-card p-8 sm:p-10 rounded-3xl border border-slate-200/80 flex flex-col items-center text-center justify-between hover:border-blue-400/80 transition-all duration-300 relative group shadow-sm hover:shadow-md"
                >
                  <div className="space-y-5 w-full flex flex-col items-center">
                    {/* Centered High-Res Founder Photo with Soft Blue Glow Ring */}
                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-sky-400 to-indigo-500 rounded-3xl blur opacity-60 group-hover:opacity-100 transition duration-300" />
                      <img
                        src={photo}
                        alt={founder.name}
                        className="relative h-28 w-28 sm:h-36 sm:w-36 rounded-2xl object-cover object-top border-2 border-white shadow-xl transition-transform duration-300 group-hover:scale-102"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = fallback;
                        }}
                      />
                      <span className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-blue-600 text-white text-xs shadow-md">
                        <Award className="w-4 h-4" />
                      </span>
                    </div>

                    {/* Founder Name & Role - Centered */}
                    <div className="space-y-1.5 flex flex-col items-center">
                      <h4 className="text-xl sm:text-2xl font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {founder.name}
                      </h4>
                      <div className="inline-block px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700 tracking-wide uppercase shadow-2xs">
                        {founder.role}
                      </div>
                      <p className="text-xs text-slate-500 font-medium pt-0.5">
                        {founder.id === 'sk' || founder.name.toLowerCase().includes('sai krishna')
                          ? 'Founder & Managing Director'
                          : 'Chief Executive Officer & Co-Founder'}
                      </p>
                    </div>

                    {/* Bio Paragraph */}
                    <p className="text-xs text-slate-600 leading-relaxed max-w-md pt-1">
                      {founder.bio}
                    </p>

                    {/* Centered Direct Contact Buttons */}
                    <div className="w-full space-y-2 pt-4 border-t border-slate-200 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <a
                          href={`tel:+${founder.phoneClean}`}
                          className="flex items-center justify-center gap-2 text-slate-700 hover:text-blue-700 transition-colors p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 font-medium"
                        >
                          <Phone className="w-3.5 h-3.5 text-blue-600" />
                          <span>{founder.phone}</span>
                        </a>

                        <a
                          href={`mailto:${founder.email}`}
                          className="flex items-center justify-center gap-2 text-slate-700 hover:text-blue-700 transition-colors p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 font-medium truncate"
                        >
                          <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="truncate">{founder.email}</span>
                        </a>
                      </div>

                      {founder.portfolio && !founder.name.toLowerCase().includes('harshavardhan') && (
                        <a
                          href={founder.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 text-blue-700 hover:text-blue-800 transition-colors p-2.5 rounded-xl bg-blue-50 border border-blue-200 font-bold"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                          <span>View Official Founder Portfolio</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 w-full">
                    <button
                      onClick={onOpenConsultation}
                      className="btn-primary w-full text-xs py-3 justify-center font-bold glow-blue"
                    >
                      <span>Book Direct Session with {founder.name.split(' ')[0]}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mission & Vision Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto pt-6">
          {/* Mission */}
          <div className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-200/80 space-y-4 relative overflow-hidden group hover:border-blue-400 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Our Mission</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              "{COMPANY_DETAILS.mission}"
            </p>
            <ul className="space-y-2 pt-2 border-t border-slate-200 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Zero-bloat, production-ready codebases built to scale</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Transparent timelines and robust maintenance SLAs</span>
              </li>
            </ul>
          </div>

          {/* Vision */}
          <div className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-200/80 space-y-4 relative overflow-hidden group hover:border-sky-400 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Our Vision</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              "{COMPANY_DETAILS.vision}"
            </p>
            <ul className="space-y-2 pt-2 border-t border-slate-200 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Creating high-impact enterprise SaaS platforms</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Nurturing technical excellence across institutions</span>
              </li>
            </ul>
          </div>
        </div>


        {/* Commitment Statement */}
        <div className="max-w-3xl mx-auto text-center space-y-4 pt-2">
          <div className="p-4 rounded-xl bg-white border border-blue-200 text-xs sm:text-sm text-slate-700 flex items-center justify-center gap-2 shadow-sm">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
            <span>"{COMPANY_DETAILS.trustStatement}"</span>
          </div>
        </div>
      </div>
    </section>
  );
};
