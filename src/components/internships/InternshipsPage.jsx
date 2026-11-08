import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Search, Filter, Calendar, Clock, MapPin, Award, CheckCircle2, 
  ArrowRight, Sparkles, Building, ChevronRight, X, User, Mail, Phone, 
  GraduationCap, Globe, FileText, Send, Check, ExternalLink, ShieldCheck,
  Code, Cpu, Shield, Database, Cloud, Palette, Terminal, BookOpen
} from 'lucide-react';
import { 
  getStoredInternships, 
  syncInternshipsFromSupabase,
  submitApplication, 
  getStoredApplications,
  isApplicationDeadlineCrossed,
  getStoredTimelineSettings
} from '../../lib/internshipStore';
import { MarqueeAnnouncement } from '../common/MarqueeAnnouncement';
import { InternshipSuccessModal } from './InternshipSuccessModal';

export const InternshipsPage = ({ onOpenRequirement, onOpenConsultation }) => {
  const [internships, setInternships] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedTimeline, setSelectedTimeline] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Deadline & Closed Status
  const [isClosed, setIsClosed] = useState(() => isApplicationDeadlineCrossed());
  const [timelineSettings, setTimelineSettings] = useState(() => getStoredTimelineSettings());

  // Modals state
  const [exploringInternship, setExploringInternship] = useState(null);
  const [applyingInternship, setApplyingInternship] = useState(null);
  const [applicationSuccess, setApplicationSuccess] = useState(null);

  // Track Application Tab State
  const [activeTab, setActiveTab] = useState('explore'); // 'explore' | 'track'
  const [trackQuery, setTrackQuery] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [trackSearched, setTrackSearched] = useState(false);

  // Candidate Application Form Data
  const [applicationForm, setApplicationForm] = useState({
    candidateName: '',
    email: '',
    phone: '',
    college: '',
    branch: 'CSE',
    year: '3rd Year',
    degree: 'B.Tech',
    skills: '',
    portfolioUrl: '',
    resumeUrl: '',
    whyJoin: '',
    preferredTimeline: '3 Months (Immediate Start)'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // 1. Instant local load
    setInternships(getStoredInternships());
    setIsClosed(isApplicationDeadlineCrossed());
    setTimelineSettings(getStoredTimelineSettings());

    // 2. Background sync from Supabase database
    syncInternshipsFromSupabase().then((cloudData) => {
      if (cloudData && Array.isArray(cloudData)) {
        setInternships(cloudData);
      }
    });

    const handleTimelineUpdate = () => {
      setIsClosed(isApplicationDeadlineCrossed());
      setTimelineSettings(getStoredTimelineSettings());
    };

    const handleInternshipsUpdate = () => {
      setInternships(getStoredInternships());
    };

    window.addEventListener('sh_internship_timeline_updated', handleTimelineUpdate);
    window.addEventListener('sh_internships_updated', handleInternshipsUpdate);
    window.addEventListener('storage', handleTimelineUpdate);
    window.addEventListener('storage', handleInternshipsUpdate);
    return () => {
      window.removeEventListener('sh_internship_timeline_updated', handleTimelineUpdate);
      window.removeEventListener('sh_internships_updated', handleInternshipsUpdate);
      window.removeEventListener('storage', handleTimelineUpdate);
      window.removeEventListener('storage', handleInternshipsUpdate);
    };
  }, []);

  // Dynamically derive active domains from available internships
  const availableDomains = Array.from(new Set(internships.map(item => item.domain).filter(Boolean)));
  const domains = ['All', ...availableDomains];

  // Auto reset domain to 'All' if the selected domain was deleted
  useEffect(() => {
    if (selectedDomain !== 'All' && !availableDomains.includes(selectedDomain)) {
      setSelectedDomain('All');
    }
  }, [internships, selectedDomain, availableDomains]);

  const timelines = ['All', '2 Months', '3 Months', '6 Months'];

  const filteredInternships = internships.filter(item => {
    const matchDomain = selectedDomain === 'All' || item.domain === selectedDomain;
    const matchTimeline = selectedTimeline === 'All' || item.timeline.toLowerCase().includes(selectedTimeline.toLowerCase());
    const matchSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.overview.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tools && item.tools.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchDomain && matchTimeline && matchSearch;
  });

  const handleApplyClick = (internship) => {
    if (isApplicationDeadlineCrossed()) {
      alert(timelineSettings?.closedMessage || 'Applications are closed and wait for next batch.');
      return;
    }
    setApplyingInternship(internship);
    setExploringInternship(null);
    setApplicationForm(prev => ({
      ...prev,
      preferredTimeline: internship.timeline
    }));
  };

  const handleApplicationSubmit = (e) => {
    e.preventDefault();
    if (isApplicationDeadlineCrossed()) {
      alert(timelineSettings?.closedMessage || 'Applications are closed and wait for next batch.');
      setApplyingInternship(null);
      return;
    }
    if (!applicationForm.candidateName || !applicationForm.email || !applicationForm.phone || !applicationForm.college) {
      alert('Please fill in all required fields (Name, Email, Phone, College).');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      const newApp = submitApplication({
        internshipId: applyingInternship.id,
        internshipTitle: applyingInternship.title,
        ...applicationForm
      });
      setSubmitting(false);
      setApplicationSuccess(newApp);
      setApplyingInternship(null);
      // Reset form
      setApplicationForm({
        candidateName: '',
        email: '',
        phone: '',
        college: '',
        branch: 'CSE',
        year: '3rd Year',
        degree: 'B.Tech',
        skills: '',
        portfolioUrl: '',
        resumeUrl: '',
        whyJoin: '',
        preferredTimeline: '3 Months (Immediate Start)'
      });
    }, 800);
  };

  const handleTrackSearch = (e) => {
    e.preventDefault();
    if (!trackQuery.trim()) return;
    const allApps = getStoredApplications();
    const query = trackQuery.trim().toLowerCase();
    const found = allApps.find(app => 
      app.id.toLowerCase() === query || 
      app.email.toLowerCase() === query || 
      (app.phone && app.phone.includes(query))
    );
    setTrackResult(found || null);
    setTrackSearched(true);
  };

  const handleTrackFromSuccess = (appId) => {
    setApplicationSuccess(null);
    setActiveTab('track');
    setTrackQuery(appId);
    const allApps = getStoredApplications();
    const query = (appId || '').trim().toLowerCase();
    const found = allApps.find(app => 
      app.id.toLowerCase() === query || 
      app.email.toLowerCase() === query
    );
    setTrackResult(found || null);
    setTrackSearched(true);
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  const getDomainIcon = (domain) => {
    switch (domain) {
      case 'AI & Machine Learning':
        return <Cpu className="w-5 h-5 text-purple-600" />;
      case 'Full Stack Development':
        return <Code className="w-5 h-5 text-blue-600" />;
      case 'Cyber Security':
        return <Shield className="w-5 h-5 text-emerald-600" />;
      case 'DevOps & Cloud':
        return <Cloud className="w-5 h-5 text-amber-600" />;
      case 'UI/UX Design':
        return <Palette className="w-5 h-5 text-pink-600" />;
      default:
        return <Terminal className="w-5 h-5 text-indigo-600" />;
    }
  };

  return (
    <div className="pt-20 pb-20 bg-slate-50 min-h-screen w-full max-w-full overflow-x-hidden">
      {/* Admin Controlled Marquee Slide Announcement */}
      <MarqueeAnnouncement page="internships" />

      {/* Top Banner & Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-slate-900 to-slate-950 text-white py-16 px-4 sm:px-6">
        {/* Glow Spheres */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="container-custom relative z-10 max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>Sakith Harvan Technologies • Career Acceleration</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Launch Your Tech Career with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-200">Real Industry Internships</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed">
            Move beyond textbook theory. Work on real enterprise SaaS software, train neural nets, containerize cloud microservices, and build high-impact production code with direct mentorship from leadership.
          </p>

          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 text-left">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-2xl font-extrabold text-blue-400">100%</div>
              <div className="text-xs text-slate-300 font-medium">Real-World Enterprise Projects</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-2xl font-extrabold text-cyan-400">1-on-1</div>
              <div className="text-xs text-slate-300 font-medium">Founders &amp; Tech Lead Mentorship</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-2xl font-extrabold text-indigo-400">PPO Track</div>
              <div className="text-xs text-slate-300 font-medium">Pre-Placement Full-Time Opportunity</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-2xl font-extrabold text-emerald-400">Verified</div>
              <div className="text-xs text-slate-300 font-medium">Industrial Certificate &amp; LOR</div>
            </div>
          </div>

          {/* Tab Navigation: Explore Openings vs Track Application */}
          <div className="pt-6 flex justify-center">
            <div className="inline-flex p-1.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
              <button
                onClick={() => setActiveTab('explore')}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'explore'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {isClosed ? 'Openings (Closed)' : `Explore Active Openings (${internships.length})`}
              </button>
              <button
                onClick={() => setActiveTab('track')}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'track'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Track Your Application Status
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="container-custom max-w-6xl mx-auto px-4 sm:px-6 pt-10">
        
        {/* VIEW 1: EXPLORE INTERNSHIPS */}
        {activeTab === 'explore' && (
          isClosed ? (
            /* ======================================================== */
            /* APPLICATIONS ARE CLOSED SCREEN                           */
            /* Vanishes all internships and shows the centered screen   */
            /* With ! and logo, without cringe emojis                   */
            /* ======================================================== */
            <div className="py-16 px-4 text-center max-w-2xl mx-auto space-y-7 animate-in fade-in zoom-in duration-300">
              {/* Logo */}
              <div className="flex justify-center">
                <img
                  src="/logo.png"
                  alt="Sakith Harvan Technologies"
                  className="w-20 h-20 sm:w-24 sm:h-24 object-contain filter drop-shadow-md"
                  onError={(e) => {
                    e.target.src = '/favicon.png';
                  }}
                />
              </div>

              {/* Clean Exclamation Mark Badge (!) */}
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
                <span className="text-3xl font-black font-mono">!</span>
              </div>

              {/* Text: Applications are closed and wait for next batch. */}
              <div className="space-y-3">
                <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  {timelineSettings?.closedMessage || 'Applications are closed and wait for next batch.'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
                  The application window for this cohort has passed. All existing submissions are undergoing technical evaluation. Next batch registration dates will be announced here.
                </p>
              </div>

              {/* Track Existing Applications option */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => setActiveTab('track')}
                  className="btn-primary py-3 px-6 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-blue-500/20"
                >
                  <FileText className="w-4 h-4" />
                  <span>Track Your Submitted Application</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
            {/* Search & Filter Bar */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search input */}
                <div className="relative w-full md:w-96">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by role, domain, tools (Python, React)..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-slate-50/50"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Timeline dropdown filter */}
                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                  <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Timeline:</span>
                  <div className="flex gap-1.5">
                    {timelines.map(time => (
                      <button
                        key={time}
                        onClick={() => setSelectedTimeline(time)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          selectedTimeline === time
                            ? 'bg-slate-900 text-white font-bold'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Domain Pills */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-xs text-slate-500 font-semibold shrink-0">Domain:</span>
                {domains.map(d => (
                  <button
                    key={d}
                    onClick={() => setSelectedDomain(d)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedDomain === d
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Internships Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInternships.map(item => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-white border border-slate-200/90 hover:border-blue-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                >
                  <div className="p-6 space-y-4">
                    {/* Header: Domain icon + Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-100 group-hover:bg-blue-50 transition-colors">
                        {getDomainIcon(item.domain)}
                      </div>
                      <div className="flex items-center gap-2">
                        {item.badge && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            {item.badge}
                          </span>
                        )}
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {item.status}
                        </span>
                      </div>
                    </div>

                    {/* Title & Domain */}
                    <div>
                      <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">{item.domain}</span>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors mt-0.5">
                        {item.title}
                      </h3>
                    </div>

                    {/* Meta info pills */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                      <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate">{item.timeline}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{item.mode}</span>
                      </div>
                    </div>

                    {/* Overview snippet */}
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {item.overview}
                    </p>

                    {/* Tools / Tech Stack Tags */}
                    {item.tools && item.tools.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {item.tools.slice(0, 4).map(tool => (
                          <span key={tool} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium font-mono">
                            {tool}
                          </span>
                        ))}
                        {item.tools.length > 4 && (
                          <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-medium">
                            +{item.tools.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Stipend + CTAs */}
                  <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3">
                    <button
                      onClick={() => setExploringInternship(item)}
                      className="text-xs text-slate-700 hover:text-blue-600 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Explore Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleApplyClick(item)}
                      className="btn-primary text-xs py-2 px-4 font-bold shadow-md shadow-blue-500/20"
                    >
                      <span>Apply Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredInternships.length === 0 && (
              <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 space-y-3">
                <Briefcase className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">No internships matched your filters</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting the domain or search term, or view all opportunities.
                </p>
                <button
                  onClick={() => { setSelectedDomain('All'); setSelectedTimeline('All'); setSearchQuery(''); }}
                  className="btn-primary text-xs py-2 px-4"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        )
      )}

        {/* VIEW 2: TRACK APPLICATION */}
        {activeTab === 'track' && (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
                <FileText className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900">Track Your Application</h2>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Enter your Application Reference ID (e.g. <span className="font-mono text-blue-600 font-semibold">SHT-INT-2026-9041</span>) or registered Email to see your current review status.
                </p>
              </div>

              <form onSubmit={handleTrackSearch} className="flex gap-2 max-w-md mx-auto">
                <input
                  type="text"
                  value={trackQuery}
                  onChange={(e) => setTrackQuery(e.target.value)}
                  placeholder="Enter Reference ID or Email..."
                  className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 bg-slate-50"
                />
                <button
                  type="submit"
                  className="btn-primary text-xs py-2.5 px-5 font-bold shrink-0"
                >
                  Check Status
                </button>
              </form>
            </div>

            {/* Track Results Card */}
            {trackSearched && (
              <div className="animate-in fade-in duration-300">
                {trackResult ? (
                  <div className="p-6 sm:p-8 rounded-2xl bg-white border border-blue-200 shadow-xl space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                      <div>
                        <div className="text-xs font-mono font-bold text-blue-600">{trackResult.id}</div>
                        <h3 className="text-lg font-bold text-slate-900">{trackResult.internshipTitle}</h3>
                        <div className="text-xs text-slate-500">{trackResult.candidateName} • {trackResult.college}</div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          trackResult.status === 'Shortlisted' || trackResult.status === 'Accepted'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : trackResult.status === 'Interview Scheduled'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : trackResult.status === 'Rejected'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {trackResult.status}
                        </span>
                      </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-700">Application Review Progress</div>
                      <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-semibold">
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                          1. Submitted
                        </div>
                        <div className={`p-2 rounded-lg border ${
                          ['Under Review', 'Shortlisted', 'Interview Scheduled', 'Accepted'].includes(trackResult.status)
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}>
                          2. Profile Review
                        </div>
                        <div className={`p-2 rounded-lg border ${
                          ['Interview Scheduled', 'Accepted'].includes(trackResult.status)
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}>
                          3. Technical Discussion
                        </div>
                        <div className={`p-2 rounded-lg border ${
                          trackResult.status === 'Accepted'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold'
                            : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}>
                          4. Offer &amp; Onboarding
                        </div>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Email</span>
                        <span className="font-semibold text-slate-800">{trackResult.email}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Preferred Timeline</span>
                        <span className="font-semibold text-slate-800">{trackResult.preferredTimeline}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Submitted Date</span>
                        <span className="font-semibold text-slate-800">
                          {new Date(trackResult.submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Notes from Review Team</span>
                        <span className="font-medium text-slate-700">{trackResult.notes || 'Profile is currently under evaluation by the technical lead.'}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-2xl bg-white border border-slate-200 space-y-2">
                    <p className="text-sm font-bold text-slate-800">No application found matching "{trackQuery}"</p>
                    <p className="text-xs text-slate-500">
                      Please double-check your application reference ID or email, or submit a new application.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: EXPLORE DETAILS MODAL                           */}
      {/* ======================================================== */}
      {exploringInternship && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 relative space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {exploringInternship.domain}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {exploringInternship.mode}
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900">{exploringInternship.title}</h2>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Department: {exploringInternship.department || 'Sakith Harvan Engineering'} • {exploringInternship.timeline}
                </p>
              </div>

              <button
                onClick={() => setExploringInternship(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Overview */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Role Overview</h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                {exploringInternship.overview}
              </p>
            </div>

            {/* Timeline Breakdown / Agenda */}
            {exploringInternship.timelineDetails && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Timeline &amp; Learning Roadmap</h4>
                <div className="space-y-2.5">
                  {exploringInternship.timelineDetails.map((t, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-blue-300 transition-colors space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                        <span className="text-blue-600">{t.week}</span>
                        <span>{t.title}</span>
                      </div>
                      <p className="text-xs text-slate-600">{t.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prerequisites & Deliverables */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Prerequisites</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
                  {exploringInternship.prerequisites?.map((prereq, idx) => (
                    <li key={idx} className="leading-snug">{prereq}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/80 space-y-2">
                <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-blue-600" />
                  <span>Outcomes &amp; Deliverables</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside">
                  {exploringInternship.deliverables?.map((deliv, idx) => (
                    <li key={idx} className="leading-snug">{deliv}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Stipend & Openings Banner */}
            <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-slate-200 block text-[10px] uppercase font-bold tracking-wider">Stipend &amp; Perks</span>
                <span className="font-bold text-cyan-300">{exploringInternship.stipend}</span>
              </div>
              <div>
                <span className="text-slate-200 block text-[10px] uppercase font-bold tracking-wider">Available Seats</span>
                <span className="font-bold text-white">{exploringInternship.openings} Openings</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                onClick={() => setExploringInternship(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                onClick={() => handleApplyClick(exploringInternship)}
                className="btn-primary text-xs py-2.5 px-6 font-bold shadow-md shadow-blue-500/25"
              >
                Proceed to Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: APPLY FOR INTERNSHIP MODAL                      */}
      {/* ======================================================== */}
      {applyingInternship && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Candidate Application</span>
                <h3 className="text-xl font-bold text-slate-900">{applyingInternship.title}</h3>
                <p className="text-xs text-slate-500">Domain: {applyingInternship.domain} • Timeline: {applyingInternship.timeline}</p>
              </div>
              <button
                onClick={() => setApplyingInternship(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplicationSubmit} className="space-y-4">
              {/* Row 1: Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={applicationForm.candidateName}
                    onChange={(e) => setApplicationForm({ ...applicationForm, candidateName: e.target.value })}
                    placeholder="e.g. Rahul Varma"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={applicationForm.email}
                    onChange={(e) => setApplicationForm({ ...applicationForm, email: e.target.value })}
                    placeholder="e.g. rahul@example.com"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Row 2: Phone & College */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={applicationForm.phone}
                    onChange={(e) => setApplicationForm({ ...applicationForm, phone: e.target.value })}
                    placeholder="e.g. +91 9848022338"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">College / University *</label>
                  <input
                    type="text"
                    required
                    value={applicationForm.college}
                    onChange={(e) => setApplicationForm({ ...applicationForm, college: e.target.value })}
                    placeholder="e.g. JNTU / Osmania / CBIT"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Row 3: Branch, Degree, Year */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Degree</label>
                  <select
                    value={applicationForm.degree}
                    onChange={(e) => setApplicationForm({ ...applicationForm, degree: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50"
                  >
                    <option value="B.Tech">B.Tech</option>
                    <option value="B.E">B.E</option>
                    <option value="B.Sc">B.Sc</option>
                    <option value="BCA">BCA</option>
                    <option value="MCA">MCA</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Branch</label>
                  <select
                    value={applicationForm.branch}
                    onChange={(e) => setApplicationForm({ ...applicationForm, branch: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50"
                  >
                    <option value="CSE">CSE</option>
                    <option value="AIML">AIML</option>
                    <option value="Data Science">Data Science</option>
                    <option value="AI&DS">AI&amp;DS</option>
                    <option value="Cyber Security">Cyber Security</option>
                    <option value="IOT">IOT</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Year</label>
                  <select
                    value={applicationForm.year}
                    onChange={(e) => setApplicationForm({ ...applicationForm, year: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Graduated">Graduated</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Skills & Preferred Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Known Skills / Tools</label>
                  <input
                    type="text"
                    value={applicationForm.skills}
                    onChange={(e) => setApplicationForm({ ...applicationForm, skills: e.target.value })}
                    placeholder="e.g. Python, Git, React, C++, SQL"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Timeline</label>
                  <select
                    value={applicationForm.preferredTimeline}
                    onChange={(e) => setApplicationForm({ ...applicationForm, preferredTimeline: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50"
                  >
                    <option value="2 Months (Fast-Track)">2 Months (Fast-Track)</option>
                    <option value="3 Months (Summer / Standard)">3 Months (Summer / Standard)</option>
                    <option value="6 Months (Comprehensive)">6 Months (Comprehensive)</option>
                    <option value="Flexible with College Schedule">Flexible with College Schedule</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Portfolio / GitHub & Resume Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">GitHub / Portfolio URL</label>
                  <input
                    type="url"
                    value={applicationForm.portfolioUrl}
                    onChange={(e) => setApplicationForm({ ...applicationForm, portfolioUrl: e.target.value })}
                    placeholder="https://github.com/yourhandle"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Resume Link (Google Drive / Notion)</label>
                  <input
                    type="url"
                    value={applicationForm.resumeUrl}
                    onChange={(e) => setApplicationForm({ ...applicationForm, resumeUrl: e.target.value })}
                    placeholder="https://drive.google.com/your-resume-link"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Row 6: Why Join */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Why do you want to join Sakith Harvan Technologies?
                </label>
                <textarea
                  rows="3"
                  value={applicationForm.whyJoin}
                  onChange={(e) => setApplicationForm({ ...applicationForm, whyJoin: e.target.value })}
                  placeholder="Tell us what you hope to learn, projects you're proud of, or why this domain excites you..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 bg-slate-50/50"
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setApplyingInternship(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary text-xs py-2.5 px-6 font-bold shadow-md shadow-blue-500/25 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Application</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: APPLICATION SUCCESS CONFIRMATION                */}
      {/* ======================================================== */}
      {applicationSuccess && (
        <InternshipSuccessModal
          application={applicationSuccess}
          onClose={() => setApplicationSuccess(null)}
          onTrack={handleTrackFromSuccess}
        />
      )}
    </div>
  );
};
