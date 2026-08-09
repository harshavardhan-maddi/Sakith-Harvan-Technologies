import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { Calendar, BookOpen, Menu, X, Shield, PhoneCall, ChevronRight, Sun } from 'lucide-react';

export const Navbar = ({
  activeTab,
  setActiveTab,
  onOpenConsultation,
  onOpenRequirement,
  onOpenAdmin,
  theme = 'red',
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
    { id: 'saas', label: '🚀 SaaS Space (Primary)' },
    { id: 'services', label: 'Services' },
    { id: 'workshops', label: '🎓 Workshops Space' },
    { id: 'solutions', label: 'Solutions' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' }
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'glass-nav py-3' : 'bg-navy-dark/70 py-4 backdrop-blur-md'}`}>
      <div className="container-custom flex items-center justify-between">
        {/* Top Left: Brand Logo & Single Sun Icon Theme Toggle Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNavClick('home')}
            className="text-left focus:outline-none"
          >
            <Logo size="md" />
          </button>

          {/* Top-Left Sun Icon Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            type="button"
            className={`p-2 rounded-full border transition-all duration-300 transform hover:scale-110 flex items-center justify-center cursor-pointer ${
              theme === 'blue'
                ? 'bg-blue-600/20 border-blue-400/60 text-cyan-400 shadow-md shadow-blue-500/30'
                : 'bg-red-600/20 border-rose-400/60 text-amber-400 shadow-md shadow-red-500/30'
            }`}
            title={`Toggle Theme Color (Current: ${theme === 'blue' ? 'Blue' : 'Red'})`}
            aria-label="Toggle Color Theme"
          >
            <Sun className="w-4 h-4" />
          </button>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-full border border-white/10">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Action CTAs */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={() => handleNavClick('workshops')}
            className="btn-secondary text-xs py-2.5 px-4"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Explore Workshops</span>
          </button>

          <button
            onClick={onOpenConsultation}
            className="btn-primary text-xs py-2.5 px-4"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book a Consultation</span>
          </button>

          {/* Admin Lock Button */}
          <button
            onClick={onOpenAdmin}
            title="Admin Portal"
            className="p-2 rounded-lg bg-slate-800/80 text-slate-400 hover:text-cyan-400 hover:bg-slate-700 transition-colors border border-white/10"
          >
            <Shield className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Header Controls */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={onOpenConsultation}
            className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Book</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-white/10"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950/95 border-b border-white/10 px-4 py-6 backdrop-blur-xl animate-in slide-in-from-top duration-300">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center justify-between text-left px-4 py-3 rounded-xl font-medium text-sm ${
                  activeTab === item.id
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <span>{item.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            ))}

            <div className="pt-4 border-t border-white/10 flex flex-col gap-3 mt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenConsultation();
                }}
                className="btn-primary w-full py-3 text-sm justify-center"
              >
                <Calendar className="w-4 h-4" />
                <span>Book a Consultation</span>
              </button>

              <button
                onClick={() => handleNavClick('workshops')}
                className="btn-secondary w-full py-3 text-sm justify-center"
              >
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Explore Workshops</span>
              </button>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Team Admin Portal</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenRequirement();
                  }}
                  className="text-xs text-blue-400 font-semibold flex items-center gap-1"
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
