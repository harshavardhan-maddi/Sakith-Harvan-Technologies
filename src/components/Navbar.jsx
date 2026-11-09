import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { 
  Calendar, Menu, X, Shield, PhoneCall, ChevronRight, Sun, Moon 
} from 'lucide-react';

export const Navbar = ({
  activeTab,
  setActiveTab,
  onOpenConsultation,
  onOpenRequirement,
  onOpenAdmin,
  theme = 'light',
  onToggleTheme
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'internships', label: 'Internships' },
    { id: 'coc', label: 'Course of Career' },
    { id: 'hackathons', label: 'Hackathons' },
    { id: 'services', label: 'Services' },
    { id: 'solutions', label: 'Solutions' },
    { id: 'about', label: 'About' },
    { id: 'faqs', label: 'FAQs' }
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full max-w-full overflow-x-hidden ${isScrolled ? 'glass-nav py-3 shadow-sm' : 'bg-white/90 py-4 backdrop-blur-md border-b border-slate-200/80 shadow-xs'}`}
      style={{
        paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0px))'
      }}
    >
      <div className="container-custom flex items-center justify-between">
        {/* Top Left: Brand Logo & Sun Icon Theme Toggle Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNavClick('home')}
            className="text-left focus:outline-none"
          >
            <Logo size="md" />
          </button>

          {/* Top-Left Theme Toggle Button (Light / Dark Mode) */}
          <button
            onClick={onToggleTheme}
            type="button"
            className="p-2 rounded-full border transition-all duration-300 transform hover:scale-105 flex items-center justify-center cursor-pointer bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-amber-400 shadow-sm"
            title={`Toggle Theme (Current: ${theme === 'dark' ? 'Dark Mode' : 'Light Mode'})`}
            aria-label="Toggle Dark or Light Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>
        </div>

        {/* Desktop Nav Links: Home, Internships, COC, Services, Solutions, About, FAQs */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/90 p-1.5 rounded-full border border-slate-200/80 shadow-sm">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 font-bold'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-white'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold uppercase ${
                    isActive ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Action CTAs (Desktop) */}
        <div className="hidden lg:flex items-center gap-2.5">
          <button
            onClick={onOpenConsultation}
            className="btn-primary text-xs py-2 px-4 font-semibold"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Consultation</span>
          </button>

          {/* Main Website Login Button */}
          <button
            onClick={onOpenAdmin}
            className="px-4 py-2 rounded-full border border-slate-300 hover:border-blue-600 bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-700 font-bold text-xs transition-all shadow-xs cursor-pointer"
          >
            Login
          </button>
        </div>

        {/* Mobile Header Controls */}
        <div className="flex lg:hidden items-center gap-2">
          {/* Main Website Login Button for Mobile Header */}
          <button
            onClick={onOpenAdmin}
            className="px-3 py-1.5 rounded-lg border border-slate-300 hover:border-blue-600 bg-white text-slate-800 hover:text-blue-700 text-xs font-bold shadow-xs cursor-pointer"
            aria-label="Login"
          >
            Login
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-white text-slate-700 hover:text-blue-600 border border-slate-200 shadow-sm"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/98 border-b border-slate-200 px-4 py-6 backdrop-blur-xl shadow-xl animate-in slide-in-from-top duration-300">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center justify-between text-left px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-blue-100 text-blue-700">
                      {item.badge}
                    </span>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            ))}

            {/* Portal Action Buttons in Mobile Drawer */}
            <div className="pt-4 border-t border-slate-200 flex flex-col gap-2.5 mt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenConsultation();
                }}
                className="btn-primary w-full py-3 text-sm justify-center font-semibold"
              >
                <Calendar className="w-4 h-4" />
                <span>Book a Consultation</span>
              </button>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="text-xs text-slate-800 hover:text-blue-600 flex items-center justify-center font-bold py-2.5 px-4 rounded-xl bg-slate-50 border border-slate-200 w-full"
                >
                  Login
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenRequirement();
                  }}
                  className="text-xs text-blue-600 font-semibold flex items-center gap-1.5 py-2 px-3"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Submit Requirement</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
