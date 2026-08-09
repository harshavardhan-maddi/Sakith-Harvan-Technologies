import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Clock, Users, Award, ChevronRight, CheckCircle2, Sparkles, Filter } from 'lucide-react';
import { INITIAL_WORKSHOPS } from '../data/defaultData';

export const WorkshopsSection = ({ onOpenRequirement, onBookWorkshop }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeWorkshopModal, setActiveWorkshopModal] = useState(null);
  const [workshops, setWorkshops] = useState([]);

  useEffect(() => {
    const loadWorkshopsData = () => {
      try {
        const stored = localStorage.getItem('sh_workshops');
        if (stored) {
          setWorkshops(JSON.parse(stored));
        } else {
          setWorkshops(INITIAL_WORKSHOPS);
          localStorage.setItem('sh_workshops', JSON.stringify(INITIAL_WORKSHOPS));
        }
      } catch (err) {
        setWorkshops(INITIAL_WORKSHOPS);
      }
    };

    loadWorkshopsData();

    const handleUpdate = () => {
      loadWorkshopsData();
    };

    window.addEventListener('sh_workshops_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('sh_workshops_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Dynamically extract categories from the loaded workshops
  const dynamicCategories = ['All', ...Array.from(new Set(workshops.map(w => w.category).filter(Boolean)))];

  const activeCategory = dynamicCategories.includes(selectedCategory) ? selectedCategory : 'All';

  const filteredWorkshops = activeCategory === 'All'
    ? workshops
    : workshops.filter(w => w.category === activeCategory);

  return (
    <section id="workshops" className="py-20 md:py-28 relative bg-slate-950/80 overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-cyan-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Technology Workshops & Bootcamps</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Empowering Talent with <span className="text-gradient-blue">Industry-Ready Skills</span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            We conduct specialized hands-on technology workshops, intensive bootcamps, and institutional training sessions for colleges, universities, corporate teams, and engineering departments.
          </p>
        </div>

        {/* Filter Categories */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
          {dynamicCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25 font-bold'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Workshop Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkshops.map((workshop) => (
            <div
              key={workshop.id}
              className="glass-card p-6 flex flex-col justify-between hover:border-cyan-500/40 group transition-all duration-300"
            >
              <div className="space-y-4">
                {/* Badge & Mode */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-md bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 text-[11px] font-mono font-semibold">
                    {workshop.category}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {workshop.minDays}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors leading-snug">
                  {workshop.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                  {workshop.description}
                </p>

                {/* Key Takeaway */}
                <div className="p-3 rounded-lg bg-slate-900/90 border border-white/5 space-y-1">
                  <div className="text-[11px] font-semibold text-cyan-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    What You'll Master:
                  </div>
                  <p className="text-[11px] text-slate-300 line-clamp-2">
                    {workshop.learn}
                  </p>
                </div>

                {/* Target Audience */}
                <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
                  <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">For: {workshop.whoShouldAttend}</span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between gap-3">
                <button
                  onClick={() => setActiveWorkshopModal(workshop)}
                  className="text-xs text-slate-300 hover:text-white font-medium flex items-center gap-1"
                >
                  <span>Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onBookWorkshop(workshop)}
                  className="btn-cyan text-xs py-2 px-4 shadow-sm"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Schedule Workshop</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Institution Custom Booking Callout */}
        <div className="mt-14 glass-card p-6 sm:p-8 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
              <Award className="w-4 h-4 text-cyan-400" />
              <span>For Colleges, Engineering Institutes & Corporate Teams</span>
            </div>
            <h4 className="text-xl sm:text-2xl font-bold text-white">
              Want a Customized BootCamp or Workshop for Your Campus?
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              We design specialized hands-on technology curriculum, live project building sessions, and industry certification bootcamps tailored for your academic schedule or team needs.
            </p>
          </div>

          <button
            onClick={() => onOpenRequirement({ prefillCategory: 'Workshop / Training', note: 'Requesting custom institutional workshop' })}
            className="btn-cyan text-sm py-3 px-6 whitespace-nowrap glow-cyan shrink-0"
          >
            <span>Request Institutional Session</span>
          </button>
        </div>
      </div>

      {/* Workshop Details Drawer Modal */}
      {activeWorkshopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-card max-w-xl w-full p-6 sm:p-8 rounded-2xl border border-cyan-500/40 relative space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-md bg-cyan-950 text-cyan-400 text-xs font-mono">
                  {activeWorkshopModal.category}
                </span>
                <h3 className="text-2xl font-bold text-white mt-2">{activeWorkshopModal.title}</h3>
              </div>
              <button
                onClick={() => setActiveWorkshopModal(null)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed">{activeWorkshopModal.description}</p>

            <div className="space-y-3 p-4 rounded-xl bg-slate-900 border border-white/10 text-xs">
              <div className="flex justify-between text-slate-300 border-b border-white/5 pb-2">
                <span className="font-semibold text-slate-400">Duration / Schedule:</span>
                <span className="text-cyan-400 font-mono">{activeWorkshopModal.minDays} ({activeWorkshopModal.mode})</span>
              </div>
              <div className="flex justify-between text-slate-300 border-b border-white/5 pb-2">
                <span className="font-semibold text-slate-400">Target Audience:</span>
                <span>{activeWorkshopModal.whoShouldAttend}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="font-semibold text-slate-400">Availability:</span>
                <span className="text-green-400">{activeWorkshopModal.upcomingDates}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Curriculum Highlights</h4>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-slate-300 text-xs leading-relaxed">
                {activeWorkshopModal.learn}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  const ws = activeWorkshopModal;
                  setActiveWorkshopModal(null);
                  onBookWorkshop(ws);
                }}
                className="btn-cyan w-full text-xs py-3"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule This Workshop</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
