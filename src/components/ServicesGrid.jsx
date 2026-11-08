import React, { useState } from 'react';
import { 
  BookOpen, Calendar, Sparkles, Search, ArrowRight, Layers
} from 'lucide-react';

export const ServicesGrid = ({ 
  onOpenRequirement, 
  onOpenConsultation, 
  onBookWorkshop,
  onNavigateSolutions 
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const campusWorkshopsList = [
    { id: 'cw-1', name: 'Cloud Azure Enterprise Architecture', category: 'Cloud & Infrastructure' },
    { id: 'cw-2', name: 'Artificial Intelligence Foundations & Neural Networks', category: 'Artificial Intelligence' },
    { id: 'cw-3', name: 'Agentic AI & Autonomous Agent Systems', category: 'Agentic AI' },
    { id: 'cw-4', name: 'Claude Architecture & LLM Engineering', category: 'Generative AI' },
    { id: 'cw-5', name: 'AI Voice Agent Building with Pipecat Framework', category: 'Voice AI' },
    { id: 'cw-6', name: 'Generative AI & RAG Application Development', category: 'Generative AI' },
    { id: 'cw-7', name: 'Java Full Stack Enterprise Engineering (Spring Boot & React)', category: 'Full Stack Development' },
    { id: 'cw-8', name: 'MERN Stack Application Development (MongoDB, Express, React, Node)', category: 'Full Stack Development' },
    { id: 'cw-9', name: 'Python for Data Science (NumPy, Pandas)', category: 'Data Science' },
    { id: 'cw-10', name: 'Git & GitHub Production Version Control & CI/CD', category: 'DevOps & Tools' },
    { id: 'cw-11', name: 'N8N Workflow Automation & Low-Code Pipelines', category: 'Automation' },
    { id: 'cw-12', name: 'UI/UX Design Systems & High-Fidelity Figma Prototyping', category: 'Design & UX' },
    { id: 'cw-13', name: 'Modern Web Development & Responsive UI Engineering', category: 'Web Development' },
    { id: 'cw-14', name: 'Vibe Coding & AI-Assisted Rapid Development', category: 'AI Prototyping' },
    { id: 'cw-15', name: 'Cross-Platform Mobile App Development (Flutter & React Native)', category: 'Mobile Development' },
    { id: 'cw-16', name: 'Microservices, Docker & Containerized Cloud Deployment', category: 'Cloud & DevOps' }
  ];

  const filteredTechnologies = campusWorkshopsList.filter(tech =>
    tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tech.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBookSlotClick = (techName) => {
    const fullTitle = `Campus Workshop: ${techName}`;
    
    if (onBookWorkshop) {
      onBookWorkshop(fullTitle);
    } else if (onOpenRequirement) {
      onOpenRequirement({ 
        productName: fullTitle,
        prefillCategory: 'Campus Workshop'
      });
    } else if (onOpenConsultation) {
      onOpenConsultation();
    }
  };

  return (
    <section id="services" className="py-12 md:py-16 relative bg-slate-50 overflow-hidden">
      {/* Soft Blue Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Educational &amp; Enterprise Offerings</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Our <span className="text-gradient">Services</span>
          </h2>
        </div>

        {/* Switcher: Campus Workshops & SaaS Platforms & Products (Redirects to Solutions) */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-sm">
            {/* Tab 1: Campus Workshops */}
            <button
              className="p-4 rounded-xl flex items-center justify-center gap-2.5 font-bold text-sm bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-1 ring-blue-500 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>Campus Workshops</span>
            </button>

            {/* Tab 2: SaaS Platforms & Products (Redirects to Solutions) */}
            <button
              onClick={() => {
                if (onNavigateSolutions) {
                  onNavigateSolutions();
                }
              }}
              className="p-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all cursor-pointer bg-white/80 hover:bg-white text-slate-700 hover:text-blue-600 hover:shadow-sm group"
              title="Redirect to SaaS Platforms & Products (ERP, CRM & Integrated Suites)"
            >
              <Layers className="w-4 h-4 shrink-0 text-blue-600" />
              <span>SaaS Platforms &amp; Products</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-blue-600 transition-all shrink-0" />
            </button>
          </div>
        </div>

        {/* Current Active Type Info & Search */}
        <div className="max-w-5xl mx-auto mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Campus Workshops
              </h3>
              <p className="text-xs text-slate-500">
                Comprehensive multi-day institutional bootcamps &amp; practical coding labs
              </p>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder=""
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-9 text-xs"
            />
          </div>
        </div>

        {/* Technologies List Grid with Book a Slot on each */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTechnologies.map((tech) => (
            <div
              key={tech.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-blue-400/80 hover:shadow-md transition-all flex items-center justify-between gap-4 group"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 inline-block mb-1">
                  {tech.category}
                </span>
                <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                  {tech.name}
                </h4>
              </div>

              {/* Book a Slot Button */}
              <div className="shrink-0">
                <button
                  onClick={() => handleBookSlotClick(tech.name)}
                  className="btn-primary text-xs py-2.5 px-4 font-bold shadow-md shadow-blue-500/15 flex items-center gap-1.5 whitespace-nowrap cursor-pointer hover:scale-102 transition-transform"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book a Slot</span>
                </button>
              </div>
            </div>
          ))}

          {filteredTechnologies.length === 0 && (
            <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-slate-200">
              <p className="text-sm text-slate-500">No technologies found matching "{searchQuery}".</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
