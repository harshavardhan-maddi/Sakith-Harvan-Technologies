import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { TrustIntro } from './components/TrustIntro';
import { ServicesGrid } from './components/ServicesGrid';
import { SaaSShowcase } from './components/SaaSShowcase';
import { WorkshopsSection } from './components/WorkshopsSection';
import { SolutionsSection } from './components/SolutionsSection';
import { FoundersSection } from './components/FoundersSection';
import { FAQSection } from './components/FAQSection';
import { ConsultationBooking } from './components/ConsultationBooking';
import { IntroSplash } from './components/IntroSplash';
import { PWAInstallCard } from './components/PWAInstallCard';
import { Footer } from './components/Footer';
import { Calendar, X, CheckCircle2, PhoneCall } from 'lucide-react';
import { InternshipsPage } from './components/internships/InternshipsPage';
import { CourseOfCareerPage } from './components/coc/CourseOfCareerPage';
import { HackathonsPage } from './components/hackathons/HackathonsPage';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy load large modals for instant page loading
const RequirementFormModal = React.lazy(() =>
  import('./components/RequirementFormModal').then((m) => ({ default: m.RequirementFormModal }))
);
const WorkshopBookingModal = React.lazy(() =>
  import('./components/WorkshopBookingModal').then((m) => ({ default: m.WorkshopBookingModal }))
);
const AdminPortalModal = React.lazy(() =>
  import('./components/AdminPortalModal').then((m) => ({ default: m.AdminPortalModal }))
);
const StaffPortalModal = React.lazy(() =>
  import('./components/StaffPortalModal').then((m) => ({ default: m.StaffPortalModal }))
);

export default function App() {
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('sh_intro_seen');
  });
  const [activeTab, setActiveTab] = useState('home');
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [isRequirementModalOpen, setIsRequirementModalOpen] = useState(false);
  const [requirementInitialProduct, setRequirementInitialProduct] = useState('');

  // Staff Portal (Employee & Intern Login) State
  const [isStaffPortalOpen, setIsStaffPortalOpen] = useState(false);
  const [staffPortalRole, setStaffPortalRole] = useState('employee'); // 'employee' or 'intern'
  const [staffInitialUser, setStaffInitialUser] = useState(null);

  const handleOpenEmpLogin = (user) => {
    setIsAdminPortalOpen(false);
    setStaffPortalRole('employee');
    setStaffInitialUser(user);
    setIsStaffPortalOpen(true);
  };

  const handleOpenInternLogin = (user) => {
    setIsAdminPortalOpen(false);
    setStaffPortalRole('intern');
    setStaffInitialUser(user);
    setIsStaffPortalOpen(true);
  };

  // Website Color Theme (Default Soft Blue)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('sh_theme') || 'blue';
  });

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sh_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'blue' ? 'red' : 'blue'));
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
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-blue-600 selection:text-white flex flex-col font-sans">
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
        {/* VIEW: HOME (Landing Page - strictly Home page only without services, solutions, or about) */}
        {activeTab === 'home' && (
          <>
            {/* Hero Banner Section */}
            <HeroSection
              onOpenConsultation={() => setIsConsultationModalOpen(true)}
              onNavigateServices={() => {
                setActiveTab('services');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenRequirement={handleOpenRequirement}
            />


            {/* Direct Consultation Section */}
            <section id="consultation-section" className="py-20 bg-white/80 relative border-t border-b border-slate-200/80">
              <div className="container-custom">
                <div className="max-w-4xl mx-auto text-center space-y-4 mb-10">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Direct Executive Consultation</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                    Book a Free <span className="text-gradient">30-Minute Technical Session</span>
                  </h2>
                  <p className="text-slate-600 text-sm max-w-2xl mx-auto">
                    Discuss your software scope, technical requirements, cloud deployment options, or campus software directly with Thoka Sai Krishna (Founder &amp; MD) or Maddi Harshavardhan (CEO &amp; Co-Founder).
                  </p>
                </div>

                <ConsultationBooking
                  onBookingComplete={(details) => {
                    showToast(`Consultation successfully booked! Reference: ${details.id}`);
                  }}
                />
              </div>
            </section>
          </>
        )}

        {/* VIEW: SERVICES */}
        {activeTab === 'services' && (
          <div className="pt-24 pb-16">
            <ServicesGrid
              onOpenRequirement={handleOpenRequirement}
              onOpenConsultation={() => setIsConsultationModalOpen(true)}
              onBookWorkshop={handleBookWorkshop}
              onNavigateSolutions={() => {
                setActiveTab('solutions');
                setTimeout(() => {
                  const el = document.getElementById('saas-platforms');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  }
                }, 100);
              }}
            />
          </div>
        )}

        {/* VIEW: SOLUTIONS */}
        {activeTab === 'solutions' && (
          <div className="pt-24 pb-16">
            <SolutionsSection
              onOpenRequirement={handleOpenRequirement}
              onOpenConsultation={() => setIsConsultationModalOpen(true)}
            />
          </div>
        )}

        {/* VIEW: ABOUT */}
        {activeTab === 'about' && (
          <div className="pt-24 pb-16">
            <FoundersSection
              onOpenConsultation={() => setIsConsultationModalOpen(true)}
              onOpenRequirement={handleOpenRequirement}
            />
          </div>
        )}

        {/* VIEW: FAQS */}
        {activeTab === 'faqs' && (
          <div className="pt-24 pb-16">
            <FAQSection
              onOpenConsultation={() => setIsConsultationModalOpen(true)}
              onOpenRequirement={handleOpenRequirement}
            />
          </div>
        )}

        {/* VIEW: INTERNSHIPS */}
        {activeTab === 'internships' && (
          <InternshipsPage
            onOpenRequirement={handleOpenRequirement}
            onOpenConsultation={() => setIsConsultationModalOpen(true)}
          />
        )}

        {/* VIEW: COURSE OF CAREER (COC) */}
        {activeTab === 'coc' && (
          <ErrorBoundary>
            <CourseOfCareerPage
              onOpenRequirement={handleOpenRequirement}
              onOpenConsultation={() => setIsConsultationModalOpen(true)}
            />
          </ErrorBoundary>
        )}

        {/* VIEW: HACKATHONS */}
        {activeTab === 'hackathons' && (
          <ErrorBoundary>
            <HackathonsPage
              onOpenRequirement={handleOpenRequirement}
              onOpenConsultation={() => setIsConsultationModalOpen(true)}
            />
          </ErrorBoundary>
        )}
      </main>

      {/* Floating Requirement Button */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
        <button
          onClick={() => handleOpenRequirement({})}
          className="btn-primary text-xs py-3 px-5 rounded-full shadow-xl shadow-blue-600/30 glow-blue border border-white/40 flex items-center gap-2"
        >
          <PhoneCall className="w-4 h-4 text-white animate-pulse" />
          <span className="hidden sm:inline font-bold">Submit Requirement</span>
        </button>
      </div>

      {/* MODALS */}
      {/* 1. Modal Consultation Booking */}
      {isConsultationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card max-w-3xl w-full p-6 sm:p-8 rounded-2xl border border-blue-200 relative space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Schedule Technical Consultation</h3>
                <p className="text-xs text-slate-500">Direct booking session with engineering leadership.</p>
              </div>
              <button
                onClick={() => setIsConsultationModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
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

      {/* 2. Modal Workshop Scheduling (Dedicated Clean Form) - Lazy loaded */}
      {isWorkshopModalOpen && (
        <React.Suspense fallback={null}>
          <WorkshopBookingModal
            isOpen={isWorkshopModalOpen}
            onClose={() => setIsWorkshopModalOpen(false)}
            workshopTitle={selectedWorkshopTitle}
            onSubmitSuccess={(data) => {
              showToast(`Workshop booking submitted! Reference Number: ${data.id}`);
            }}
          />
        </React.Suspense>
      )}

      {/* 3. Modal General Requirement Form - Lazy loaded */}
      {isRequirementModalOpen && (
        <React.Suspense fallback={null}>
          <RequirementFormModal
            isOpen={isRequirementModalOpen}
            onClose={() => setIsRequirementModalOpen(false)}
            initialProduct={requirementInitialProduct}
            onSubmitSuccess={(data) => {
              setIsRequirementModalOpen(false);
              showToast(`Requirement successfully submitted! Reference: ${data.id}`);
            }}
          />
        </React.Suspense>
      )}

      {/* 4. Modal Admin Lead Portal - Lazy loaded */}
      {isAdminPortalOpen && (
        <React.Suspense
          fallback={
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <AdminPortalModal
            isOpen={isAdminPortalOpen}
            onClose={() => setIsAdminPortalOpen(false)}
            onOpenEmpLogin={handleOpenEmpLogin}
            onOpenInternLogin={handleOpenInternLogin}
          />
        </React.Suspense>
      )}

      {/* 5. Modal Employee & Intern Work Portal - Lazy loaded */}
      {isStaffPortalOpen && (
        <React.Suspense
          fallback={
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <StaffPortalModal
            isOpen={isStaffPortalOpen}
            onClose={() => {
              setIsStaffPortalOpen(false);
              setStaffInitialUser(null);
            }}
            initialRole={staffPortalRole}
            initialUser={staffInitialUser}
            onOpenAdmin={() => setIsAdminPortalOpen(true)}
          />
        </React.Suspense>
      )}

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-white border border-blue-200 text-slate-800 text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in slide-in-from-right duration-300">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-700 ml-2">
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
