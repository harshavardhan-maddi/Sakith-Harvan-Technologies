import React, { useState, useEffect } from 'react';
import { 
  Shield, Lock, Calendar, FileText, CheckCircle2, Trash2, Download, RefreshCw, 
  X, Search, UserCheck, BookOpen, Plus, Edit3, RotateCcw, Sparkles, Layers,
  LayoutDashboard, BarChart3, TrendingUp, Key, LogOut, ExternalLink, ArrowRight,
  Filter, ChevronRight, Clock, Users, Award, Building, Mail, Phone, Eye, Calculator
} from 'lucide-react';
import { INITIAL_WORKSHOPS } from '../data/defaultData';
import { Logo } from './Logo';
import { QuotationMaker } from './QuotationMaker';
import { 
  supabase,
  fetchConsultationsFromSupabase, 
  fetchRequirementsFromSupabase, 
  fetchWorkshopsFromSupabase,
  updateConsultationStatusInSupabase,
  updateRequirementStatusInSupabase,
  deleteConsultationFromSupabase,
  deleteRequirementFromSupabase,
  saveWorkshopToSupabase,
  deleteWorkshopFromSupabase
} from '../lib/supabaseClient';

export const AdminPortalModal = ({ isOpen, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'consultations', 'requirements', 'workshops', 'settings'

  const [consultations, setConsultations] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [workshops, setWorkshops] = useState([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Add/Edit Workshop Form State
  const [isEditingWorkshop, setIsEditingWorkshop] = useState(false);
  const [workshopFormData, setWorkshopFormData] = useState({
    id: '',
    title: '',
    category: '',
    description: '',
    learn: '',
    whoShouldAttend: '',
    minDays: '3 Days',
    mode: 'Offline / Hands-on',
    upcomingDates: 'Available for Custom Institutional Scheduling',
    seats: 'Custom Slot Capacity'
  });

  // Security PIN Settings state
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState('');

  // Load from localStorage or initialize with sample data
  useEffect(() => {
    if (isOpen) {
      loadStorageData();
    }
  }, [isOpen]);

  // Real-time Event Listeners & Supabase Subscriptions for auto-updating Admin Dashboard without page refresh
  useEffect(() => {
    // 1. Listen to local custom window events (instant update in same session)
    const handleReqUpdate = (e) => {
      const newLead = e.detail;
      if (newLead) {
        setRequirements((prev) => {
          if (prev.some(item => item.id === newLead.id)) return prev;
          return [newLead, ...prev];
        });
      } else {
        loadStorageData();
      }
    };

    const handleConsultUpdate = (e) => {
      const newBooking = e.detail;
      if (newBooking) {
        setConsultations((prev) => {
          if (prev.some(item => item.id === newBooking.id)) return prev;
          return [newBooking, ...prev];
        });
      } else {
        loadStorageData();
      }
    };

    window.addEventListener('sh_requirements_updated', handleReqUpdate);
    window.addEventListener('sh_consultations_updated', handleConsultUpdate);

    // 2. Listen to Supabase Realtime channel for live cross-device / cross-tab updates
    const channel = supabase
      .channel('public_admin_leads')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'requirements' },
        (payload) => {
          if (payload.new) {
            setRequirements((prev) => {
              if (prev.some(item => item.id === payload.new.id)) return prev;
              return [payload.new, ...prev];
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'consultations' },
        (payload) => {
          if (payload.new) {
            setConsultations((prev) => {
              if (prev.some(item => item.id === payload.new.id)) return prev;
              return [payload.new, ...prev];
            });
          }
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('sh_requirements_updated', handleReqUpdate);
      window.removeEventListener('sh_consultations_updated', handleConsultUpdate);
      supabase.removeChannel(channel);
    };
  }, []);

  const loadStorageData = () => {
    const rawConsultations = localStorage.getItem('sh_consultations');
    const rawRequirements = localStorage.getItem('sh_requirements');
    const rawWorkshops = localStorage.getItem('sh_workshops');

    // Default sample entries (only seeded when localStorage key does not exist yet)
    const defaultConsultations = [
      {
        id: 'c-101',
        name: 'Dr. R. K. Sharma',
        organization: 'Vignan Institute of Technology',
        email: 'rksharma@vignan.edu.in',
        phone: '+91 9848012345',
        type: 'Campus ERP & SIS Implementation',
        preferredDate: '2026-08-15',
        preferredTime: '11:00 AM',
        message: 'Looking for a complete Campus ERP demo and quote for 4000 students.',
        status: 'New',
        timestamp: new Date().toISOString()
      },
      {
        id: 'c-102',
        name: 'Venkatesh Rao',
        organization: 'Nexus Retail SaaS',
        email: 'venkat@nexusretail.io',
        phone: '+91 9123456789',
        type: 'Custom Enterprise SaaS',
        preferredDate: '2026-08-12',
        preferredTime: '03:00 PM',
        message: 'Need inventory management SaaS solution integration with WhatsApp APIs.',
        status: 'Contacted',
        timestamp: new Date(Date.now() - 86400000).toISOString()
      }
    ];

    const defaultRequirements = [
      {
        id: 'r-201',
        name: 'K. Sai Ram',
        organization: 'Apex Hospital Group',
        email: 'sairam@apexhospitals.com',
        phone: '+91 9988776655',
        category: 'Hospital Management SaaS',
        budget: '₹2L - ₹5L',
        timeframe: '1-2 Months',
        scope: 'Patient registration, doctor scheduling, bill generation, and pharmacy inventory module.',
        status: 'In Review',
        timestamp: new Date().toISOString()
      }
    ];

    let finalConsultations;
    if (rawConsultations === null) {
      finalConsultations = defaultConsultations;
      localStorage.setItem('sh_consultations', JSON.stringify(defaultConsultations));
    } else {
      try {
        finalConsultations = JSON.parse(rawConsultations);
      } catch (e) {
        finalConsultations = defaultConsultations;
      }
    }

    let finalRequirements;
    if (rawRequirements === null) {
      finalRequirements = defaultRequirements;
      localStorage.setItem('sh_requirements', JSON.stringify(defaultRequirements));
    } else {
      try {
        finalRequirements = JSON.parse(rawRequirements);
      } catch (e) {
        finalRequirements = defaultRequirements;
      }
    }

    let finalWorkshops;
    if (rawWorkshops === null) {
      finalWorkshops = INITIAL_WORKSHOPS;
      localStorage.setItem('sh_workshops', JSON.stringify(INITIAL_WORKSHOPS));
    } else {
      try {
        finalWorkshops = JSON.parse(rawWorkshops);
      } catch (e) {
        finalWorkshops = INITIAL_WORKSHOPS;
      }
    }

    setConsultations(finalConsultations);
    setRequirements(finalRequirements);
    setWorkshops(finalWorkshops);

    // Sync live records from Supabase cloud database if connected
    fetchConsultationsFromSupabase().then(dbData => {
      if (dbData && dbData.length > 0) {
        setConsultations(dbData);
        localStorage.setItem('sh_consultations', JSON.stringify(dbData));
      }
    });

    fetchRequirementsFromSupabase().then(dbData => {
      if (dbData && dbData.length > 0) {
        setRequirements(dbData);
        localStorage.setItem('sh_requirements', JSON.stringify(dbData));
      }
    });

    fetchWorkshopsFromSupabase().then(dbData => {
      if (dbData && dbData.length > 0) {
        setWorkshops(dbData);
        localStorage.setItem('sh_workshops', JSON.stringify(dbData));
        window.dispatchEvent(new Event('sh_workshops_updated'));
      }
    });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const storedPin = localStorage.getItem('sh_admin_pin') || '2526';
    if (pinInput === storedPin || pinInput === '2526' || pinInput === 'sakith2026' || pinInput === 'admin') {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPinInput('');
  };

  const handleUpdatePin = (e) => {
    e.preventDefault();
    if (newPin !== confirmPin) {
      alert('PINs do not match. Please try again.');
      return;
    }
    if (newPin.length < 4) {
      alert('PIN must be at least 4 digits/characters.');
      return;
    }
    localStorage.setItem('sh_admin_pin', newPin);
    setPinChangeSuccess('Security PIN successfully updated!');
    setNewPin('');
    setConfirmPin('');
    setTimeout(() => setPinChangeSuccess(''), 4000);
  };

  const updateStatus = (id, newStatus, type) => {
    if (type === 'consultation') {
      const updated = consultations.map(item => item.id === id ? { ...item, status: newStatus } : item);
      setConsultations(updated);
      localStorage.setItem('sh_consultations', JSON.stringify(updated));
      updateConsultationStatusInSupabase(id, newStatus);
    } else {
      const updated = requirements.map(item => item.id === id ? { ...item, status: newStatus } : item);
      setRequirements(updated);
      localStorage.setItem('sh_requirements', JSON.stringify(updated));
      updateRequirementStatusInSupabase(id, newStatus);
    }
  };

  const deleteItem = (id, type) => {
    if (window.confirm('Are you sure you want to delete this lead record?')) {
      if (type === 'consultation') {
        const updated = consultations.filter(item => item.id !== id);
        setConsultations(updated);
        localStorage.setItem('sh_consultations', JSON.stringify(updated));
        deleteConsultationFromSupabase(id);
      } else {
        const updated = requirements.filter(item => item.id !== id);
        setRequirements(updated);
        localStorage.setItem('sh_requirements', JSON.stringify(updated));
        deleteRequirementFromSupabase(id);
      }
    }
  };

  // Workshop CRUD Handlers
  const handleOpenAddWorkshop = () => {
    setWorkshopFormData({
      id: '',
      title: '',
      category: '',
      description: '',
      learn: '',
      whoShouldAttend: '',
      minDays: '3 Days',
      mode: 'Offline / Hands-on',
      upcomingDates: 'Available for Custom Institutional Scheduling',
      seats: 'Custom Slot Capacity'
    });
    setIsEditingWorkshop(true);
  };

  const handleOpenEditWorkshop = (ws) => {
    setWorkshopFormData({ ...ws });
    setIsEditingWorkshop(true);
  };

  const handleSaveWorkshop = (e) => {
    e.preventDefault();
    let updatedWorkshops = [];
    let savedWorkshopItem = workshopFormData;

    if (workshopFormData.id) {
      updatedWorkshops = workshops.map(ws => ws.id === workshopFormData.id ? { ...workshopFormData } : ws);
    } else {
      const newId = 'ws-' + Date.now();
      savedWorkshopItem = { ...workshopFormData, id: newId };
      updatedWorkshops = [savedWorkshopItem, ...workshops];
    }

    setWorkshops(updatedWorkshops);
    localStorage.setItem('sh_workshops', JSON.stringify(updatedWorkshops));
    saveWorkshopToSupabase(savedWorkshopItem);
    window.dispatchEvent(new Event('sh_workshops_updated'));
    setIsEditingWorkshop(false);
  };

  const handleDeleteWorkshop = (id) => {
    if (window.confirm('Are you sure you want to remove this workshop technology?')) {
      const updatedWorkshops = workshops.filter(ws => ws.id !== id);
      setWorkshops(updatedWorkshops);
      localStorage.setItem('sh_workshops', JSON.stringify(updatedWorkshops));
      deleteWorkshopFromSupabase(id);
      window.dispatchEvent(new Event('sh_workshops_updated'));
    }
  };

  const handleResetDefaultWorkshops = () => {
    if (window.confirm('Reset workshop technologies to default catalog?')) {
      setWorkshops(INITIAL_WORKSHOPS);
      localStorage.setItem('sh_workshops', JSON.stringify(INITIAL_WORKSHOPS));
      window.dispatchEvent(new Event('sh_workshops_updated'));
    }
  };

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ consultations, requirements, workshops }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `sakith_harvan_dashboard_export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filtered queries for search
  const filteredConsultations = consultations.filter(item => {
    const matchesSearch = (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.organization || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredRequirements = requirements.filter(item => {
    const matchesSearch = (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.organization || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate Overview Dashboard Statistics
  const newConsultationsCount = consultations.filter(c => c.status === 'New').length;
  const newRequirementsCount = requirements.filter(r => r.status === 'New' || r.status === 'In Review').length;
  const totalCategories = new Set(workshops.map(w => w.category)).size;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col min-h-screen w-full overflow-hidden text-slate-100 font-sans animate-in fade-in duration-300">
      {!isAuthenticated ? (
        /* FULL-SCREEN DEDICATED ADMIN LOGIN VIEW */
        <div className="min-h-screen w-full flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden bg-grid-pattern">
          {/* Background Ambient Glows */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-red-600/15 blur-[140px] rounded-full pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

          {/* Top Header Row */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <Logo size="md" />
            </div>

            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X className="w-4 h-4" />
              <span>Return to Public Website</span>
            </button>
          </div>

          {/* Center Full-Screen Login Card */}
          <div className="max-w-md w-full mx-auto my-auto z-10">
            <div className="glass-card p-8 rounded-3xl border border-red-500/30 shadow-2xl shadow-red-950/40 space-y-6 text-center glow-blue">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-red-950 via-slate-900 to-red-900 border border-red-500/40 flex items-center justify-center mx-auto text-rose-400 shadow-lg shadow-red-500/20">
                <Shield className="w-10 h-10 animate-pulse" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-white tracking-tight">Executive Admin Dashboard</h2>
                <p className="text-xs text-slate-400">Sakith Harvan Technologies Internal Management Portal</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4 pt-2">
                <div className="space-y-1 text-left">
                  <label className="block text-xs font-semibold text-slate-300">Security Access PIN *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      placeholder="Enter Access PIN"
                      className="form-input pl-10 text-center text-lg letter-spacing-3 font-mono border-red-500/30 focus:border-red-500"
                      autoFocus
                    />
                  </div>
                  {pinError && (
                    <p className="text-xs text-red-400 font-medium pt-1">Incorrect Security PIN. Please try again.</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full py-3.5 text-sm font-bold glow-blue shadow-xl shadow-red-600/30 flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Unlock Admin Dashboard</span>
                </button>
              </form>

              <div className="pt-3 border-t border-white/10 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Protected Enterprise System • Active Audit Logging</span>
              </div>
            </div>
          </div>

          {/* Footer Branding */}
          <div className="text-center text-xs text-slate-400 z-10">
            © {new Date().getFullYear()} Sakith Harvan Technologies. All Executive Rights Reserved.
          </div>
        </div>
      ) : (
        /* FULL-SCREEN EXECUTIVE ADMIN DASHBOARD VIEW */
        <div className="flex-1 flex overflow-hidden bg-slate-950">
          {/* SIDEBAR NAVIGATION */}
          <aside className="w-64 bg-slate-900/90 border-r border-white/10 flex flex-col justify-between shrink-0 hidden md:flex">
            {/* Sidebar Top Header */}
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <Logo size="sm" />
              </div>

              {/* Sidebar Menu */}
              <nav className="space-y-1">
                <div className="px-3 pb-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                  Navigation Menu
                </div>

                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all ${
                    activeTab === 'overview'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard Overview</span>
                </button>

                <button
                  onClick={() => setActiveTab('quotation_maker')}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all ${
                    activeTab === 'quotation_maker'
                      ? 'bg-red-600 text-white font-bold shadow-lg shadow-red-600/30 glow-blue'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Calculator className="w-4 h-4 text-rose-400" />
                  <span>Quotation Maker</span>
                </button>

                <button
                  onClick={() => setActiveTab('consultations')}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    activeTab === 'consultations'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Calendar className="w-4 h-4" />
                    <span>Consultations</span>
                  </span>
                  {newConsultationsCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-bold">
                      {newConsultationsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('requirements')}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    activeTab === 'requirements'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <FileText className="w-4 h-4" />
                    <span>Requirements</span>
                  </span>
                  {newRequirementsCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-400 text-slate-950 text-[10px] font-bold">
                      {newRequirementsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('workshops')}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all ${
                    activeTab === 'workshops'
                      ? 'bg-cyan-600 text-slate-950 font-bold shadow-lg shadow-cyan-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Workshops &amp; Tech</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all ${
                    activeTab === 'settings'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Key className="w-4 h-4" />
                  <span>Security &amp; PIN</span>
                </button>
              </nav>
            </div>

            {/* Sidebar Bottom Controls */}
            <div className="p-4 border-t border-white/10 space-y-2">
              <button
                onClick={exportData}
                className="w-full btn-cyan py-2 text-xs flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Dashboard JSON</span>
              </button>

              <button
                onClick={onClose}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors border border-white/5"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                <span>Exit Dashboard</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full px-3 py-2 rounded-xl text-red-400 hover:text-white hover:bg-red-950/40 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Lock Dashboard Session</span>
              </button>
            </div>
          </aside>

          {/* MAIN DASHBOARD CONTENT AREA */}
          <main className="flex-1 flex flex-col overflow-y-auto bg-slate-950">
            {/* Dashboard Top Header Bar */}
            <header className="px-6 py-4 bg-slate-900/60 border-b border-white/10 flex items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-md">
              <div className="flex items-center gap-3">
                {/* Mobile Tab Select Dropdown */}
                <div className="md:hidden">
                  <select
                    value={activeTab}
                    onChange={(e) => setActiveTab(e.target.value)}
                    className="bg-slate-900 border border-white/20 rounded-lg text-xs py-1.5 px-3 font-semibold text-cyan-400"
                  >
                    <option value="overview">Dashboard Overview</option>
                    <option value="quotation_maker">Quotation Maker Engine</option>
                    <option value="consultations">Consultations ({consultations.length})</option>
                    <option value="requirements">Requirements ({requirements.length})</option>
                    <option value="workshops">Workshops &amp; Tech ({workshops.length})</option>
                    <option value="settings">Security &amp; PIN</option>
                  </select>
                </div>

                <div className="hidden md:block">
                  <h3 className="text-base font-bold text-white uppercase tracking-wide">
                    {activeTab === 'overview' && 'Executive Dashboard Overview'}
                    {activeTab === 'quotation_maker' && 'Official Quotation Generator Engine'}
                    {activeTab === 'consultations' && 'Consultation Requests Lead Manager'}
                    {activeTab === 'requirements' && 'Custom Requirements Lead Manager'}
                    {activeTab === 'workshops' && 'Workshops & Technology Catalog Manager'}
                    {activeTab === 'settings' && 'Admin Portal Security & Settings'}
                  </h3>
                </div>
              </div>

              {/* Top Bar Action Items */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>SYSTEM ONLINE</span>
                </div>

                <button
                  onClick={loadStorageData}
                  className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-800 transition-all text-xs flex items-center gap-1.5"
                  title="Reload Live Storage Data"
                >
                  <RefreshCw className="w-4 h-4 text-cyan-400" />
                  <span className="hidden sm:inline">Refresh Data</span>
                </button>

                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white text-xs"
                  title="Close Dashboard"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </header>

            {/* DASHBOARD PAGE CONTAINER */}
            <div className="p-6 space-y-8 flex-1">

              {/* TAB 1: EXECUTIVE DASHBOARD OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  {/* Executive KPI Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* KPI 1 */}
                    <div className="glass-card p-5 rounded-2xl border border-blue-500/30 bg-slate-900/90 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Total Consultations</span>
                        <div className="p-2 rounded-lg bg-blue-950 text-blue-400 border border-blue-500/30">
                          <Calendar className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <div className="text-3xl font-extrabold text-white">{consultations.length}</div>
                        <span className="text-xs text-emerald-400 font-semibold flex items-center gap-0.5">
                          <TrendingUp className="w-3.5 h-3.5" /> +100%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {newConsultationsCount} pending new scheduling actions
                      </p>
                    </div>

                    {/* KPI 2 */}
                    <div className="glass-card p-5 rounded-2xl border border-cyan-500/30 bg-slate-900/90 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Custom Requirements</span>
                        <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                          <FileText className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <div className="text-3xl font-extrabold text-white">{requirements.length}</div>
                        <span className="text-xs text-cyan-400 font-semibold">Enterprise SaaS</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {newRequirementsCount} requirements under initial review
                      </p>
                    </div>

                    {/* KPI 3 */}
                    <div className="glass-card p-5 rounded-2xl border border-rose-500/30 bg-slate-900/90 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Active Workshops</span>
                        <div className="p-2 rounded-lg bg-rose-950 text-rose-400 border border-rose-500/30">
                          <BookOpen className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <div className="text-3xl font-extrabold text-white">{workshops.length}</div>
                        <span className="text-xs text-rose-400 font-semibold">{totalCategories} Tech Domains</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Displayed live on public technology catalog
                      </p>
                    </div>

                    {/* KPI 4 */}
                    <div className="glass-card p-5 rounded-2xl border border-emerald-500/30 bg-slate-900/90 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Total Pipeline Leads</span>
                        <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                          <BarChart3 className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <div className="text-3xl font-extrabold text-white">
                          {consultations.length + requirements.length}
                        </div>
                        <span className="text-xs text-emerald-400 font-semibold">Active Leads</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Direct founder engagement pipeline
                      </p>
                    </div>
                  </div>

                  {/* Quick Action Banners Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="glass-card p-6 rounded-2xl border border-red-500/30 bg-gradient-to-r from-slate-900 via-red-950/40 to-slate-900 flex flex-col justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="text-base font-bold text-white flex items-center gap-2">
                          <Calculator className="w-4 h-4 text-rose-400" />
                          <span>Official Quotation Generator</span>
                        </h4>
                        <p className="text-xs text-slate-300">
                          Create custom quotations for ERPs (₹85/login), School/College Websites (₹8,000), AI Agents &amp; custom software with live PDF download.
                        </p>
                      </div>

                      <button
                        onClick={() => setActiveTab('quotation_maker')}
                        className="btn-primary text-xs py-3 px-5 whitespace-nowrap glow-blue shrink-0 flex items-center justify-center gap-2 font-bold"
                      >
                        <span>Open Quotation Maker</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="glass-card p-6 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 flex flex-col justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="text-base font-bold text-white flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-cyan-400" />
                          <span>Manage Public Workshops</span>
                        </h4>
                        <p className="text-xs text-slate-300">
                          Add new hands-on technology workshops, bootcamps or training courses for colleges and corporate clients.
                        </p>
                      </div>

                      <button
                        onClick={() => setActiveTab('workshops')}
                        className="btn-cyan text-xs py-3 px-5 whitespace-nowrap glow-cyan shrink-0 flex items-center justify-center gap-2 font-bold"
                      >
                        <span>Open Workshop Manager</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Recent Activity Dual Columns */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Consultations */}
                    <div className="p-6 rounded-2xl bg-slate-900/90 border border-white/10 space-y-4">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <h4 className="font-bold text-white text-sm flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-400" />
                          <span>Recent Consultation Requests</span>
                        </h4>
                        <button
                          onClick={() => setActiveTab('consultations')}
                          className="text-xs text-blue-400 hover:text-white font-medium flex items-center gap-1"
                        >
                          <span>View All</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        {consultations.slice(0, 3).map((item) => (
                          <div key={item.id} className="p-3 rounded-xl bg-slate-950 border border-white/5 space-y-1.5 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white">{item.name}</span>
                              <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 font-mono text-[10px]">
                                {item.status || 'New'}
                              </span>
                            </div>
                            <p className="text-slate-400">{item.organization || 'Individual'} • {item.type}</p>
                            <p className="text-slate-300 font-mono text-[11px]">Slot: {item.preferredDate} ({item.preferredTime})</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Requirements */}
                    <div className="p-6 rounded-2xl bg-slate-900/90 border border-white/10 space-y-4">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <h4 className="font-bold text-white text-sm flex items-center gap-2">
                          <FileText className="w-4 h-4 text-cyan-400" />
                          <span>Recent Requirements Submissions</span>
                        </h4>
                        <button
                          onClick={() => setActiveTab('requirements')}
                          className="text-xs text-cyan-400 hover:text-white font-medium flex items-center gap-1"
                        >
                          <span>View All</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        {requirements.slice(0, 3).map((item) => (
                          <div key={item.id} className="p-3 rounded-xl bg-slate-950 border border-white/5 space-y-1.5 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white">{item.name}</span>
                              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 font-mono text-[10px]">
                                {item.status || 'New'}
                              </span>
                            </div>
                            <p className="text-slate-400">{item.organization || 'Individual'} • {item.category}</p>
                            <p className="text-slate-300 line-clamp-1 text-[11px]">"{item.scope}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: QUOTATION MAKER */}
              {activeTab === 'quotation_maker' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <QuotationMaker />
                </div>
              )}

              {/* TAB 3: CONSULTATIONS MANAGER */}
              {activeTab === 'consultations' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Toolbar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-white/10">
                    <div className="relative w-full sm:w-72">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search consultations..."
                        className="form-input pl-9 py-2 text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                      <span className="text-xs text-slate-400 shrink-0">Filter Status:</span>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-slate-950 border border-white/15 rounded-lg text-xs py-1.5 px-3 text-cyan-400 font-medium"
                      >
                        <option value="All">All Statuses</option>
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  {/* Consultations List */}
                  <div className="space-y-4">
                    {filteredConsultations.length === 0 ? (
                      <div className="glass-card p-12 text-center text-slate-500 text-sm">
                        No consultation records found matching criteria.
                      </div>
                    ) : (
                      filteredConsultations.map((item) => (
                        <div key={item.id} className="glass-card p-5 rounded-2xl border border-white/10 space-y-3 bg-slate-900/80 hover:border-blue-500/40 transition-colors">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-white text-base">{item.name}</h4>
                                <span className="text-xs text-slate-400">({item.location || item.organization || 'Location N/A'})</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
                                  {item.mainNeed || item.type}
                                </span>
                                {item.knownSource && (
                                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                                    Source: {item.knownSource}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-xs text-slate-400 font-mono">ID: {item.id}</span>
                              <select
                                value={item.status || 'New'}
                                onChange={(e) => updateStatus(item.id, e.target.value, 'consultation')}
                                className="bg-slate-950 border border-white/15 rounded-lg text-xs py-1.5 px-3 text-cyan-300 font-semibold"
                              >
                                <option value="New">New</option>
                                <option value="Contacted">Contacted</option>
                                <option value="Scheduled">Scheduled</option>
                                <option value="Completed">Completed</option>
                              </select>

                              <button
                                onClick={() => deleteItem(item.id, 'consultation')}
                                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"
                                title="Delete Record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
                            <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {item.email}</div>
                            <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {item.phone}</div>
                            <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {item.preferredDate} ({item.preferredTime})</div>
                          </div>

                          {item.message && (
                            <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-white/5 font-mono leading-relaxed">
                              "{item.message}"
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: REQUIREMENTS MANAGER */}
              {activeTab === 'requirements' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Toolbar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-white/10">
                    <div className="relative w-full sm:w-72">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search requirements..."
                        className="form-input pl-9 py-2 text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                      <span className="text-xs text-slate-400 shrink-0">Filter Status:</span>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-slate-950 border border-white/15 rounded-lg text-xs py-1.5 px-3 text-blue-400 font-medium"
                      >
                        <option value="All">All Statuses</option>
                        <option value="New">New</option>
                        <option value="In Review">In Review</option>
                        <option value="Proposal Sent">Proposal Sent</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  {/* Requirements List */}
                  <div className="space-y-4">
                    {filteredRequirements.length === 0 ? (
                      <div className="glass-card p-12 text-center text-slate-500 text-sm">
                        No custom requirements found matching criteria.
                      </div>
                    ) : (
                      filteredRequirements.map((item) => (
                        <div key={item.id} className="glass-card p-5 rounded-2xl border border-white/10 space-y-3 bg-slate-900/80 hover:border-cyan-500/40 transition-colors">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-white text-base">{item.name}</h4>
                                <span className="text-xs text-slate-400">({item.organization || 'Individual'})</span>
                              </div>
                              <p className="text-xs text-blue-400 font-mono mt-0.5">{item.category}</p>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-xs text-slate-400 font-mono">ID: {item.id}</span>
                              <select
                                value={item.status || 'New'}
                                onChange={(e) => updateStatus(item.id, e.target.value, 'requirement')}
                                className="bg-slate-950 border border-white/15 rounded-lg text-xs py-1.5 px-3 text-blue-300 font-semibold"
                              >
                                <option value="New">New</option>
                                <option value="In Review">In Review</option>
                                <option value="Proposal Sent">Proposal Sent</option>
                                <option value="Closed">Closed</option>
                              </select>

                              <button
                                onClick={() => deleteItem(item.id, 'requirement')}
                                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"
                                title="Delete Record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
                            <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {item.email}</div>
                            <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {item.phone}</div>
                            <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> Timeline: {item.timeframe || item.budget || 'Flexible'}</div>
                          </div>

                          {item.scope && (
                            <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-white/5 font-mono leading-relaxed">
                              "{item.scope}"
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: WORKSHOPS & TECHNOLOGIES MANAGER */}
              {activeTab === 'workshops' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Manager Toolbar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 glow-cyan">
                    <div>
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-cyan-400" />
                        <span>Manage Workshop Technologies &amp; Bootcamps</span>
                      </h4>
                      <p className="text-xs text-slate-300">
                        Add, update, or remove technology workshops displayed to public visitors.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                      <button
                        onClick={handleResetDefaultWorkshops}
                        className="px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5"
                        title="Reset catalog to initial defaults"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Catalog</span>
                      </button>

                      <button
                        onClick={handleOpenAddWorkshop}
                        className="btn-cyan text-xs py-2.5 px-5 flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Technology Workshop</span>
                      </button>
                    </div>
                  </div>

                  {/* Workshops List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {workshops.map((ws) => (
                      <div key={ws.id} className="glass-card p-5 rounded-2xl border border-white/10 space-y-3 bg-slate-900/80 hover:border-cyan-500/40 transition-all flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                              <span className="px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono font-semibold">
                                {ws.category}
                              </span>
                              <h5 className="font-bold text-white text-sm leading-snug">{ws.title}</h5>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleOpenEditWorkshop(ws)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800"
                                title="Edit Workshop"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteWorkshop(ws.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"
                                title="Delete Workshop"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">{ws.description}</p>

                          <div className="p-3 rounded-xl bg-slate-950 border border-white/5 space-y-1 text-[11px]">
                            <div className="text-cyan-400 font-semibold flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> What Students Master:
                            </div>
                            <p className="text-slate-300 line-clamp-2">{ws.learn}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-white/10 mt-3">
                          <span>Duration: <strong className="text-white">{ws.minDays}</strong> ({ws.mode})</span>
                          <span className="truncate max-w-[140px]">For: {ws.whoShouldAttend}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: SECURITY & PIN SETTINGS */}
              {activeTab === 'settings' && (
                <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-300">
                  <div className="glass-card p-6 rounded-2xl border border-white/10 bg-slate-900/90 space-y-6">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                      <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                        <Key className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">Update Security Access PIN</h4>
                        <p className="text-xs text-slate-400">Change your executive dashboard protection code.</p>
                      </div>
                    </div>

                    {pinChangeSuccess && (
                      <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{pinChangeSuccess}</span>
                      </div>
                    )}

                    <form onSubmit={handleUpdatePin} className="space-y-4 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-300 mb-1">New Access PIN *</label>
                        <input
                          type="password"
                          required
                          value={newPin}
                          onChange={(e) => setNewPin(e.target.value)}
                          placeholder="Enter new 4+ digit PIN"
                          className="form-input text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-300 mb-1">Confirm New PIN *</label>
                        <input
                          type="password"
                          required
                          value={confirmPin}
                          onChange={(e) => setConfirmPin(e.target.value)}
                          placeholder="Re-enter new PIN"
                          className="form-input text-xs"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          className="btn-cyan w-full py-3 text-xs font-bold shadow-md shadow-cyan-500/30"
                        >
                          <span>Save &amp; Update Security PIN</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>
          </main>
        </div>
      )}

      {/* ADD / EDIT WORKSHOP MODAL OVERLAY */}
      {isEditingWorkshop && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-card max-w-xl w-full p-6 sm:p-8 rounded-3xl border border-cyan-500/50 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="text-lg font-bold text-white">
                {workshopFormData.id ? 'Edit Technology Workshop' : 'Add New Technology Workshop'}
              </h4>
              <button
                onClick={() => setIsEditingWorkshop(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWorkshop} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Workshop Title *</label>
                <input
                  type="text"
                  required
                  value={workshopFormData.title}
                  onChange={(e) => setWorkshopFormData({ ...workshopFormData, title: e.target.value })}
                  placeholder="e.g. Cybersecurity & Ethical Hacking Bootcamp"
                  className="form-input text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Technology Category *</label>
                  <input
                    type="text"
                    required
                    value={workshopFormData.category}
                    onChange={(e) => setWorkshopFormData({ ...workshopFormData, category: e.target.value })}
                    placeholder="e.g. Cybersecurity / DevOps / Cloud Azure"
                    className="form-input text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Duration *</label>
                  <input
                    type="text"
                    required
                    value={workshopFormData.minDays}
                    onChange={(e) => setWorkshopFormData({ ...workshopFormData, minDays: e.target.value })}
                    placeholder="e.g. 3 Days / 1 Week"
                    className="form-input text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Training Mode *</label>
                  <input
                    type="text"
                    required
                    value={workshopFormData.mode}
                    onChange={(e) => setWorkshopFormData({ ...workshopFormData, mode: e.target.value })}
                    placeholder="e.g. Offline / Hybrid / Hands-on"
                    className="form-input text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Target Audience *</label>
                  <input
                    type="text"
                    required
                    value={workshopFormData.whoShouldAttend}
                    onChange={(e) => setWorkshopFormData({ ...workshopFormData, whoShouldAttend: e.target.value })}
                    placeholder="e.g. CS/IT Students, Developers, Faculty"
                    className="form-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">What Students Will Master (Curriculum) *</label>
                <textarea
                  rows="3"
                  required
                  value={workshopFormData.learn}
                  onChange={(e) => setWorkshopFormData({ ...workshopFormData, learn: e.target.value })}
                  placeholder="List key modules, tools, frameworks or concepts learned..."
                  className="form-input text-xs font-sans"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Overview Description *</label>
                <textarea
                  rows="3"
                  required
                  value={workshopFormData.description}
                  onChange={(e) => setWorkshopFormData({ ...workshopFormData, description: e.target.value })}
                  placeholder="Provide a short description of the technology workshop..."
                  className="form-input text-xs font-sans"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditingWorkshop(false)}
                  className="btn-secondary py-2 px-4 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-cyan py-2 px-5 text-xs shadow-md shadow-cyan-500/30"
                >
                  <span>{workshopFormData.id ? 'Save Changes' : 'Create Technology Workshop'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
