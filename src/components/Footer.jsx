import React from 'react';
import { Logo } from './Logo';
import { Phone, Mail, MapPin, Calendar, ExternalLink, ShieldCheck, ArrowUp } from 'lucide-react';
import { COMPANY_DETAILS } from '../data/defaultData';

export const Footer = ({ setActiveTab, onOpenConsultation, onOpenRequirement, onOpenAdmin }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNav = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'home') {
      scrollToTop();
    } else {
      const el = document.getElementById(tabId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        scrollToTop();
      }
    }
  };

  return (
    <footer id="contact" className="bg-slate-950 border-t border-white/10 pt-16 pb-12 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/3 w-[600px] h-[200px] bg-blue-600/10 blur-[140px] pointer-events-none" />

      <div className="container-custom relative z-10 space-y-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="lg:col-span-4 space-y-4">
            <Logo size="md" />
            <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
              {COMPANY_DETAILS.positioning}
            </p>

            <div className="pt-2 text-xs text-cyan-400 font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>{COMPANY_DETAILS.trustStatement}</span>
            </div>

            <div className="pt-3 text-xs text-slate-400">
              Established <strong className="text-white">{COMPANY_DETAILS.established}</strong> — Born out of <strong className="text-white">{COMPANY_DETAILS.origin}</strong>
            </div>
          </div>

          {/* Direct Founders Contact Cards */}
          <div className="lg:col-span-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Direct Leadership Contacts</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {COMPANY_DETAILS.founders.map((founder) => (
                <div key={founder.id} className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 space-y-2 text-xs">
                  <div className="font-bold text-white text-sm">{founder.name}</div>
                  <div className="text-[11px] font-semibold text-blue-400">{founder.role}</div>

                  <div className="space-y-1 pt-1 text-slate-300 font-mono text-[11px]">
                    <a href={`tel:+${founder.phoneClean}`} className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors">
                      <Phone className="w-3 h-3 text-cyan-400" />
                      <span>{founder.phone}</span>
                    </a>
                    <a href={`mailto:${founder.email}`} className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors truncate">
                      <Mail className="w-3 h-3 text-blue-400" />
                      <span className="truncate">{founder.email}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Navigation Links</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => handleNav('home')} className="text-slate-300 hover:text-cyan-400 transition-colors">
                  Home Overview
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('about')} className="text-slate-300 hover:text-cyan-400 transition-colors">
                  About Sakith Harvan
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('services')} className="text-slate-300 hover:text-cyan-400 transition-colors">
                  Services & Digital Solutions
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('saas')} className="text-slate-300 hover:text-cyan-400 transition-colors">
                  Enterprise SaaS Products
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('workshops')} className="text-slate-300 hover:text-cyan-400 transition-colors">
                  Technology Workshops & Bootcamps
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('solutions')} className="text-slate-300 hover:text-cyan-400 transition-colors">
                  Custom Solutions & Tech Stack
                </button>
              </li>
            </ul>

            <div className="pt-2">
              <button
                onClick={onOpenConsultation}
                className="btn-primary w-full text-xs py-2.5 justify-center"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book Free Consultation</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Legal Line */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} <strong className="text-slate-200">Sakith Harvan Technologies</strong>. All rights reserved.
          </div>

          <div className="flex items-center gap-4">
            <button onClick={onOpenAdmin} className="hover:text-cyan-400 flex items-center gap-1">
              <span>Admin Portal</span>
            </button>
            <span>•</span>
            <button onClick={() => onOpenRequirement({})} className="hover:text-cyan-400">
              Submit Requirement
            </button>
            <span>•</span>
            <button
              onClick={scrollToTop}
              className="p-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-white/10"
              title="Back to Top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
