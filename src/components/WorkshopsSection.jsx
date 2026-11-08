import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Clock, Users, Award, ChevronRight, CheckCircle2, Sparkles, Filter, X } from 'lucide-react';
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
    <section id="workshops" className="py-20 md:py-28 relative bg-slate-50 overflow-hidden">
      {/* Soft Blue Ambient Glows */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-sky-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold shadow-sm">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Technology Workshops &amp; Bootcamps</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Empowering Talent with <span className="text-gradient">Industry-Ready Skills</span>
          </h2>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
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
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 font-bold'
                  : 'bg-white text-slate-600 hover:text-blue-600 border border-slate-200 shadow-sm'
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
              className="glass-card p-6 flex flex-col justify-between hover:border-blue-300 group transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <div className="space-y-4">
                {/* Badge & Mode */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-mono font-semibold">
                    {workshop.category}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {workshop.minDays}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                  {workshop.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {workshop.description}
                </p>

                {/* Key Takeaway */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="text-[11px] font-semibold text-blue-700 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    What You'll Master:
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2">
                    {workshop.learn}
                  </p>
                </div>

                {/* Target Audience */}
                <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                  <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">For: {workshop.whoShouldAttend}</span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-6 mt-6 border-t border-slate-200 flex items-center justify-between gap-3">
                <button
                  onClick={() => setActiveWorkshopModal(workshop)}
                  className="text-xs text-slate-600 hover:text-blue-600 font-semibold flex items-center gap-1"
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
        <div className="mt-14 glass-card p-6 sm:p-8 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50/90 via-white to-sky-50/90 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700">
              <Award className="w-4 h-4 text-blue-600" />
              <span>For Colleges, Engineering Institutes &amp; Corporate Teams</span>
            </div>
            <h4 className="text-xl sm:text-2xl font-bold text-slate-900">
              Want a Customized BootCamp or Workshop for Your Campus?
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We design specialized hands-on technology curriculum, live project building sessions, and industry certification bootcamps tailored for your academic schedule or team needs.
            </p>
          </div>

          <button
            onClick={() => onOpenRequirement({ prefillCategory: 'Workshop / Training', note: 'Requesting custom institutional workshop' })}
            className="btn-cyan text-sm py-3 px-6 whitespace-nowrap shrink-0"
          >
            <span>Request Institutional Session</span>
          </button>
        </div>
      </div>

      {/* Workshop Details Drawer Modal */}
      {activeWorkshopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card max-w-xl w-full p-6 sm:p-8 rounded-2xl border border-blue-200 relative space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-mono font-semibold">
                  {activeWorkshopModal.category}
                </span>
                <h3 className="text-2xl font-bold text-slate-900 mt-2">{activeWorkshopModal.title}</h3>
              </div>
              <button
                onClick={() => setActiveWorkshopModal(null)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed">{activeWorkshopModal.description}</p>

            <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex justify-between text-slate-700 border-b border-slate-200 pb-2">
                <span className="font-semibold text-slate-500">Duration / Schedule:</span>
                <span className="text-blue-700 font-mono font-bold">{activeWorkshopModal.minDays} ({activeWorkshopModal.mode})</span>
              </div>
              <div className="flex justify-between text-slate-700 border-b border-slate-200 pb-2">
                <span className="font-semibold text-slate-500">Target Audience:</span>
                <span>{activeWorkshopModal.whoShouldAttend}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span className="font-semibold text-slate-500">Availability:</span>
                <span className="text-emerald-600 font-semibold">{activeWorkshopModal.upcomingDates}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Curriculum Highlights</h4>
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs leading-relaxed shadow-sm">
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
                className="btn-cyan w-full text-xs py-3 font-semibold"
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
