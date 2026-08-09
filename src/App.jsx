import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { TrustIntro } from './components/TrustIntro';
import { ServicesGrid } from './components/ServicesGrid';
import { SaaSShowcase } from './components/SaaSShowcase';
import { WorkshopsSection } from './components/WorkshopsSection';
import { SolutionsSection } from './components/SolutionsSection';
import { FoundersSection } from './components/FoundersSection';
import { ConsultationBooking } from './components/ConsultationBooking';
import { RequirementFormModal } from './components/RequirementFormModal';
import { WorkshopBookingModal } from './components/WorkshopBookingModal';
import { AdminPortalModal } from './components/AdminPortalModal';
import { IntroSplash } from './components/IntroSplash';
import { Footer } from './components/Footer';
import { Sparkles, Calendar, X, CheckCircle2, PhoneCall, Layers, BookOpen, ArrowRight, ShieldCheck, Users } from 'lucide-react';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [isRequirementModalOpen, setIsRequirementModalOpen] = useState(false);
  const [requirementInitialProduct, setRequirementInitialProduct] = useState('');

  // Website Color Theme Toggle State (Red Present <-> Blue Cyber)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('sh_theme') || 'red';
  });

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sh_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'red' ? 'blue' : 'red'));
  };

  // Dedicated Workshop Scheduling Modal State
  const [isWorkshopModalOpen, setIsWorkshopModalOpen] = useState(false);
  const [selectedWorkshopTitle, setSelectedWorkshopTitle] = useState('');

  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleOpenRequirement = (options = {}) => {
    if (options.prefillCategory) {
      setRequirementInitialProduct(options.prefillCategory);
    } else if (options.productName) {
      setRequirementInitialProduct(options.productName);
    } else {
      setRequirementInitialProduct('');
    }
    setIsRequirementModalOpen(true);
  };

  const handleBookWorkshop = (workshop) => {
    const title = typeof workshop === 'string' ? workshop : (workshop?.title || 'Technology Session');
    setSelectedWorkshopTitle(title);
    setIsWorkshopModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white flex flex-col font-sans">
      {/* Brand Intro Splash Animation */}
      {showSplash && <IntroSplash onFinish={() => setShowSplash(false)} />}

      {/* Fixed Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenConsultation={() => setIsConsultationModalOpen(true)}
        onOpenRequirement={() => handleOpenRequirement({})}
        onOpenAdmin={() => setIsAdminPortalOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Page Layout Sections */}
      <main className="flex-1">
        {/* Hero Banner Section */}
        <HeroSection
          onOpenConsultation={() => setIsConsultationModalOpen(true)}
          onNavigateServices={() => {
            setActiveTab('saas');
            document.getElementById('saas-space')?.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenRequirement={handleOpenRequirement}
        />

        {/* Enterprise Trust & Vision Banner */}
        <TrustIntro
          onOpenRequirement={handleOpenRequirement}
          onOpenConsultation={() => setIsConsultationModalOpen(true)}
        />

        {/* =================================================================== */}
        {/* PRIMARY SPACE 1: ENTERPRISE SAAS & CUSTOM SOFTWARE SOLUTIONS SPACE  */}
        {/* =================================================================== */}
        <section id="saas-space" className="py-12 bg-slate-950 relative space-y-12">
          {/* Visual Divider Card for Primary SaaS Space */}
          <div className="container-custom">
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-red-500/40 bg-gradient-to-r from-slate-900 via-red-950/60 to-slate-900 glow-blue flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-600 text-white text-xs font-bold tracking-wide shadow-lg shadow-red-600/30">
                  <Layers className="w-4 h-4 text-rose-300" />
                  <span>PRIMARY BUSINESS FOCUS — SPACE 1</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Enterprise SaaS Platforms &amp; Custom Digital Products
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Our core operations focus on engineering high-grade cloud SaaS products (Campus ERP, SIS, Attendance, HRMS, Workflow Automation) and bespoke software solutions.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                <button
                  onClick={() => handleOpenRequirement({ prefillCategory: 'Enterprise SaaS Solution' })}
                  className="btn-primary text-xs py-3.5 px-6 glow-blue"
                >
                  <span>Build Custom SaaS Product</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 1. Enterprise SaaS Products Showcase */}
          <SaaSShowcase
            onRequestDemo={(name) => handleOpenRequirement({ productName: name })}
            onTalkTeam={() => setIsConsultationModalOpen(true)}
            onOpenRequirement={handleOpenRequirement}
            onOpenConsultation={() => setIsConsultationModalOpen(true)}
          />

          {/* 2. Custom Services & Engineering Capabilities */}
          <ServicesGrid
            onOpenRequirement={handleOpenRequirement}
            onOpenConsultation={() => setIsConsultationModalOpen(true)}
          />

          {/* 3. Technology Stack & Solutions Architecture */}
          <SolutionsSection
            onOpenRequirement={handleOpenRequirement}
          />
        </section>

        {/* =================================================================== */}
        {/* SPACE 2: INSTITUTIONAL TECHNOLOGY WORKSHOPS & BOOTCAMPS SPACE      */}
        {/* =================================================================== */}
        <section id="workshop-space" className="py-16 bg-slate-950/90 relative space-y-12 border-t border-white/10">
          {/* Visual Divider Card for Workshops Space */}
          <div className="container-custom">
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-rose-500/40 bg-gradient-to-r from-slate-900 via-rose-950/60 to-slate-900 glow-cyan flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500 text-slate-950 text-xs font-extrabold tracking-wide shadow-lg shadow-rose-500/30">
                  <BookOpen className="w-4 h-4" />
                  <span>TRAINING &amp; EDUCATION — SPACE 2</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Institutional Technology Workshops &amp; Bootcamps
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Specialized hands-on technology bootcamps, practical coding labs, and institutional training programs covering Cloud Azure, Agentic AI, MERN, Java Full Stack, Voice AI, and more.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                <button
                  onClick={() => handleBookWorkshop('Custom Campus Bootcamp')}
                  className="btn-cyan text-xs py-3.5 px-6 glow-cyan"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule Campus Workshop</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4. Technology Workshops & Bootcamps Section */}
          <WorkshopsSection
            onOpenRequirement={handleOpenRequirement}
            onBookWorkshop={handleBookWorkshop}
          />
        </section>

        {/* =================================================================== */}
        {/* PRIMARY SPACE 3: COMPANY LEADERSHIP & FOUNDERS SPACE                */}
        {/* =================================================================== */}
        <section id="founders-space" className="py-16 bg-slate-950 relative space-y-12 border-t border-white/10">
          {/* Visual Divider Card for Primary Space 3 */}
          <div className="container-custom">
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-cyan-500/40 bg-gradient-to-r from-slate-900 via-cyan-950/60 to-slate-900 glow-blue flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500 text-slate-950 text-xs font-extrabold tracking-wide shadow-lg shadow-cyan-500/30">
                  <Users className="w-4 h-4" />
                  <span>LEADERSHIP &amp; FOUNDERS — SPACE 3</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Meet the Founders &amp; Engineering Leadership
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Founded and driven by Maddi Harshavardhan and Thoka Sai Krishna — leading Sakith Harvan Technologies to architect enterprise SaaS platforms, AI solutions, and institutional tech bootcamps.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                <button
                  onClick={() => setIsConsultationModalOpen(true)}
                  className="btn-primary text-xs py-3.5 px-6 glow-blue font-bold"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Talk to Founders</span>
                </button>
              </div>
            </div>
          </div>

          {/* Company Overview & Leadership Team */}
          <FoundersSection
            onOpenConsultation={() => setIsConsultationModalOpen(true)}
            onOpenRequirement={handleOpenRequirement}
          />
        </section>

        {/* Consultation Section Container */}
        <section id="consultation-section" className="py-20 bg-slate-900/60 relative border-t border-b border-white/10">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto text-center space-y-4 mb-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950 border border-blue-500/30 text-blue-400 text-xs font-semibold">
                <Calendar className="w-3.5 h-3.5" />
                <span>Direct Executive Consultation</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                Book a Free <span className="text-gradient">30-Minute Technical Session</span>
              </h2>
              <p className="text-slate-300 text-sm max-w-2xl mx-auto">
                Discuss your software scope, technical requirements, cloud deployment options, or campus software directly with Maddi Harshavardhan or Thoka Sai Krishna.
              </p>
            </div>

            <ConsultationBooking
              onBookingComplete={(details) => {
                showToast(`Consultation successfully booked! Reference: ${details.id}`);
              }}
            />
          </div>
        </section>
      </main>

      {/* Floating Requirement Button */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
        <button
          onClick={() => handleOpenRequirement({})}
          className="btn-primary text-xs py-3 px-5 rounded-full shadow-2xl shadow-blue-600/50 glow-blue border border-white/20 flex items-center gap-2"
        >
          <PhoneCall className="w-4 h-4 text-cyan-300 animate-pulse" />
          <span className="hidden sm:inline font-bold">Submit Requirement</span>
        </button>
      </div>

      {/* MODALS */}
      {/* 1. Modal Consultation Booking */}
      {isConsultationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-card max-w-3xl w-full p-6 sm:p-8 rounded-2xl border border-blue-500/40 relative space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Schedule Technical Consultation</h3>
                <p className="text-xs text-slate-400">Direct booking session with engineering leadership.</p>
              </div>
              <button
                onClick={() => setIsConsultationModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ConsultationBooking
              onBookingComplete={(details) => {
                setIsConsultationModalOpen(false);
                showToast(`Consultation confirmed! Reference: ${details.id}`);
              }}
            />
          </div>
        </div>
      )}

      {/* 2. Modal Workshop Scheduling (Dedicated Clean Form) */}
      <WorkshopBookingModal
        isOpen={isWorkshopModalOpen}
        onClose={() => setIsWorkshopModalOpen(false)}
        workshopTitle={selectedWorkshopTitle}
        onSubmitSuccess={(data) => {
          showToast(`Workshop booking submitted! Reference Number: ${data.id}`);
        }}
      />

      {/* 3. Modal General Requirement Form */}
      <RequirementFormModal
        isOpen={isRequirementModalOpen}
        onClose={() => setIsRequirementModalOpen(false)}
        initialProduct={requirementInitialProduct}
        onSubmitSuccess={(data) => {
          setIsRequirementModalOpen(false);
          showToast(`Requirement successfully submitted! Reference: ${data.id}`);
        }}
      />

      {/* 4. Modal Admin Lead Portal */}
      <AdminPortalModal
        isOpen={isAdminPortalOpen}
        onClose={() => setIsAdminPortalOpen(false)}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 border border-cyan-500/50 text-white text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Site Footer */}
      <Footer
        setActiveTab={setActiveTab}
        onOpenConsultation={() => setIsConsultationModalOpen(true)}
        onOpenRequirement={handleOpenRequirement}
        onOpenAdmin={() => setIsAdminPortalOpen(true)}
      />
    </div>
  );
}
