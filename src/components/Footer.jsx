import React from 'react';
import { Logo } from './Logo';
import { Phone, Mail, Calendar, ExternalLink, ShieldCheck, ArrowUp, Shield } from 'lucide-react';
import { COMPANY_DETAILS } from '../data/defaultData';

export const Footer = ({ 
  setActiveTab, 
  onOpenConsultation, 
  onOpenRequirement, 
  onOpenAdmin 
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNav = (tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="contact" className="bg-slate-50 border-t border-slate-200 pt-16 pb-12 relative overflow-hidden">
      {/* Soft Blue Ambient Glow */}
      <div className="absolute top-0 left-1/3 w-[600px] h-[200px] bg-blue-500/5 blur-[120px] pointer-events-none" />

      <div className="container-custom relative z-10 space-y-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="lg:col-span-4 space-y-4">
            <Logo size="md" />
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
              {COMPANY_DETAILS.positioning}
            </p>

            <div className="pt-2 text-xs text-blue-700 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>{COMPANY_DETAILS.trustStatement}</span>
            </div>

          </div>

          {/* Direct Founders Contact Cards */}
          <div className="lg:col-span-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Direct Leadership Contacts</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {COMPANY_DETAILS.founders.map((founder) => (
                <div key={founder.id} className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-sm space-y-2 text-xs">
                  <div className="font-bold text-slate-900 text-sm">{founder.name}</div>
                  <div className="text-[11px] font-semibold text-blue-600">{founder.role}</div>

                  <div className="space-y-1 pt-1 text-slate-600 font-mono text-[11px]">
                    <a href={`tel:+${founder.phoneClean}`} className="flex items-center gap-1.5 hover:text-blue-700 transition-colors">
                      <Phone className="w-3 h-3 text-blue-600" />
                      <span>{founder.phone}</span>
                    </a>
                    <a href={`mailto:${founder.email}`} className="flex items-center gap-1.5 hover:text-blue-700 transition-colors truncate">
                      <Mail className="w-3 h-3 text-sky-600" />
                      <span className="truncate">{founder.email}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links matching Navbar: Home, Services, Solutions, About, FAQs */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <button onClick={() => handleNav('home')} className="text-slate-600 hover:text-blue-600 transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('internships')} className="text-slate-600 hover:text-blue-600 transition-colors">
                  Internships
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('coc')} className="text-slate-600 hover:text-blue-600 transition-colors">
                  Course of Career
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('services')} className="text-slate-600 hover:text-blue-600 transition-colors">
                  Services
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('solutions')} className="text-slate-600 hover:text-blue-600 transition-colors">
                  Solutions
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('about')} className="text-slate-600 hover:text-blue-600 transition-colors">
                  About
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('faqs')} className="text-slate-600 hover:text-blue-600 transition-colors">
                  FAQs
                </button>
              </li>
            </ul>

            <div className="pt-2">
              <button
                onClick={onOpenConsultation}
                className="btn-primary w-full text-xs py-2.5 justify-center font-semibold"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book Free Consultation</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Legal Line */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} <strong className="text-slate-800">Sakith Harvan Technologies</strong>. All rights reserved.
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-center">
            <button onClick={onOpenAdmin} className="hover:text-blue-600 font-semibold flex items-center gap-1 transition-colors text-slate-600">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Unified Access Portal</span>
            </button>
            <span>•</span>
            <button onClick={() => onOpenRequirement({})} className="hover:text-blue-600 transition-colors text-slate-600">
              Submit Requirement
            </button>
            <span>•</span>
            <button
              onClick={scrollToTop}
              className="p-1.5 rounded-lg bg-white text-slate-600 hover:text-blue-600 border border-slate-200 shadow-sm"
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
