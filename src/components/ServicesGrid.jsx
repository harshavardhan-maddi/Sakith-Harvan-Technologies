import React, { useState } from 'react';
import { SERVICES_DATA } from '../data/defaultData';
import { Layers, Globe, Smartphone, Bot, Palette, Cloud, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

export const ServicesGrid = ({ onOpenRequirement, onOpenConsultation }) => {
  const [activeCategory, setActiveCategory] = useState('all');

  const categoryIcons = {
    saas: Layers,
    web: Globe,
    mobile: Smartphone,
    ai: Bot,
    uiux: Palette,
    cloud: Cloud
  };

  const filteredServices = activeCategory === 'all'
    ? SERVICES_DATA
    : SERVICES_DATA.filter(s => s.id === activeCategory);

  return (
    <section id="services" className="py-24 relative bg-grid-pattern">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/70 border border-blue-500/30 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Comprehensive Digital Engineering Capabilities</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">
            Enterprise Services & <span className="text-gradient">Custom Solutions</span>
          </h2>

          <p className="text-slate-300 text-base sm:text-lg">
            We architect, design, develop, deploy, and maintain high-grade software systems tailored to your unique requirements.
          </p>

          {/* Filter Pills */}
          <div className="flex items-center justify-center gap-2 flex-wrap pt-4">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                activeCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              All Services
            </button>

            {SERVICES_DATA.map((service) => (
              <button
                key={service.id}
                onClick={() => setActiveCategory(service.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  activeCategory === service.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                {service.title.split(' ')[0]} {service.title.split(' ')[1] || ''}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredServices.map((service) => {
            const Icon = categoryIcons[service.id] || Layers;
            const isWeb = service.id === 'web';

            return (
              <div
                key={service.id}
                className="glass-card p-6 sm:p-8 rounded-2xl border border-white/10 flex flex-col justify-between relative overflow-hidden group"
              >
                {/* Accent Corner Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-2xl group-hover:bg-blue-600/20 transition-colors pointer-events-none" />

                <div>
                  {/* Category Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 text-cyan-400 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {service.title}
                        </h3>
                        <span className="text-xs text-slate-400">{service.subtitle}</span>
                      </div>
                    </div>

                    <span className="px-3 py-1 bg-slate-900 text-cyan-400 rounded-full text-[11px] font-semibold border border-cyan-500/30 whitespace-nowrap">
                      {service.badge}
                    </span>
                  </div>

                  <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Special Highlight for Custom Web Development */}
                  {isWeb && service.marketingStatement && (
                    <div className="p-4 mb-6 rounded-xl bg-gradient-to-r from-blue-950/80 to-cyan-950/80 border border-cyan-500/40 text-center space-y-1">
                      <p className="text-sm font-bold text-cyan-300">
                        "{service.marketingStatement}"
                      </p>
                      <p className="text-xs text-slate-400">
                        Bespoke web architectures tailored specifically for your business model.
                      </p>
                    </div>
                  )}

                  {/* Service Items Grid */}
                  <div className="space-y-2 mb-8">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Included Capabilities & Stacks:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {service.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-white/5"
                        >
                          <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                  <button
                    onClick={onOpenRequirement}
                    className="btn-primary text-xs py-2.5 px-5"
                  >
                    <span>Request Requirement Quote</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={onOpenConsultation}
                    className="text-xs text-cyan-400 font-semibold hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <span>Book Consultation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
