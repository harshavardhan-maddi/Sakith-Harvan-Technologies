import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Plus, Edit3, Trash2, CheckCircle2, Clock, Users, Search, 
  Filter, X, Download, Eye, ExternalLink, Calendar, MapPin, Award, 
  FileText, Check, AlertCircle, Save, Megaphone, Timer, Bell, Sparkles, RefreshCw
} from 'lucide-react';
import { 
  getStoredInternships, 
  saveStoredInternships, 
  addInternship, 
  updateInternship, 
  deleteInternship,
  deleteDomain,
  getStoredDomains,
  syncInternshipsFromSupabase,
  syncDomainsFromSupabase,
  syncApplicationsFromSupabase,
  getStoredApplications,
  updateApplicationStatus,
  exportCandidatesToExcel,
  getStoredMarqueeSettings,
  saveStoredMarqueeSettings,
  getStoredTimelineSettings,
  saveStoredTimelineSettings,
  isApplicationDeadlineCrossed
} from '../../lib/internshipStore';
import { supabase } from '../../lib/supabaseClient';

export const AdminInternshipsManagement = () => {
  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [domains, setDomains] = useState(() => getStoredDomains());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');
  const [customDomainInput, setCustomDomainInput] = useState('');
  const [isAddingNewDomain, setIsAddingNewDomain] = useState(false);
  const [adminSubTab, setAdminSubTab] = useState('listings'); // 'listings' | 'applications' | 'timeline' | 'marquee'

  // Marquee Announcement State
  const [marqueeSettings, setMarqueeSettings] = useState(() => getStoredMarqueeSettings());
  const [marqueeSavedMsg, setMarqueeSavedMsg] = useState('');

  // Application Timeline & Deadline State
  const [timelineSettings, setTimelineSettings] = useState(() => getStoredTimelineSettings());
  const [timelineSavedMsg, setTimelineSavedMsg] = useState('');

  // Listings State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingInternship, setEditingInternship] = useState(null);
  const [listingSearch, setListingSearch] = useState('');

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    title: '',
    domain: 'AI & Machine Learning',
    timeline: '3 Months / Flexible',
    durationWeeks: 12,
    mode: 'Hybrid / Remote',
    openings: 5,
    stipend: '₹10,000 / month + Performance Bonus',
    badge: 'New Opening',
    status: 'Open',
    department: 'Emerging Technologies',
    overview: '',
    prerequisitesText: '',
    deliverablesText: '',
    toolsText: ''
  });

  // Applications State
  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('All');
  const [viewingApp, setViewingApp] = useState(null);
  const [statusUpdateMsg, setStatusUpdateMsg] = useState('');

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      setInternships(getStoredInternships());
      setApplications(getStoredApplications());
      setDomains(getStoredDomains());
    };

    window.addEventListener('sh_internships_updated', handleUpdate);
    window.addEventListener('sh_applications_updated', handleUpdate);

    // Supabase Realtime multi-device subscription
    let channel = null;
    try {
      const channelId = `admin_internships_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      channel = supabase
        .channel(channelId)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'internships' },
          () => {
            loadData();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'internship_domains' },
          () => {
            loadData();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'internship_applications' },
          () => {
            loadData();
          }
        )
        .subscribe();
    } catch (e) {
      console.warn('Realtime subscription error:', e);
    }

    return () => {
      window.removeEventListener('sh_internships_updated', handleUpdate);
      window.removeEventListener('sh_applications_updated', handleUpdate);
      if (channel) {
        try { supabase.removeChannel(channel); } catch (e) {}
      }
    };
  }, []);

  const loadData = async () => {
    // 1. Instant cache load
    setInternships(getStoredInternships());
    setApplications(getStoredApplications());
    setDomains(getStoredDomains());

    // 2. Background sync from Supabase PostgreSQL database
    setIsSyncing(true);
    try {
      const [cloudInternships, cloudDomains, cloudApps] = await Promise.all([
        syncInternshipsFromSupabase(),
        syncDomainsFromSupabase(),
        syncApplicationsFromSupabase()
      ]);
      if (cloudInternships && Array.isArray(cloudInternships)) setInternships(cloudInternships);
      if (cloudDomains && Array.isArray(cloudDomains)) setDomains(cloudDomains);
      if (cloudApps && Array.isArray(cloudApps)) setApplications(cloudApps);
    } catch (err) {
      console.warn('Supabase sync warning:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const openAddModal = () => {
    setEditingInternship(null);
    setIsAddingNewDomain(false);
    setCustomDomainInput('');
    const activeDomains = getStoredDomains();
    const defaultDomain = activeDomains[0] || 'AI & Machine Learning';

    setFormData({
      title: '',
      domain: defaultDomain,
      timeline: '3 Months / Flexible',
      durationWeeks: 12,
      mode: 'Hybrid / Remote',
      openings: 5,
      stipend: '₹10,000 / month + Performance Bonus',
      badge: 'New Opening',
      status: 'Open',
      department: 'Emerging Technologies',
      overview: '',
      prerequisitesText: 'Knowledge of programming fundamentals\nFamiliarity with Git and GitHub\nStrong problem-solving attitude',
      deliverablesText: 'Production-ready software project\nTechnical documentation\nInternship Certificate & LOR',
      toolsText: 'Python, Git, Docker, Cloud'
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingInternship(item);
    setIsAddingNewDomain(false);
    setCustomDomainInput('');
    setFormData({
      title: item.title || '',
      domain: item.domain || 'AI & Machine Learning',
      timeline: item.timeline || '3 Months',
      durationWeeks: item.durationWeeks || 12,
      mode: item.mode || 'Remote',
      openings: item.openings || 5,
      stipend: item.stipend || '',
      badge: item.badge || 'Open',
      status: item.status || 'Open',
      department: item.department || '',
      overview: item.overview || '',
      prerequisitesText: (item.prerequisites || []).join('\n'),
      deliverablesText: (item.deliverables || []).join('\n'),
      toolsText: (item.tools || []).join(', ')
    });
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const finalDomain = (isAddingNewDomain ? customDomainInput : formData.domain || '').trim();
    if (!formData.title || !finalDomain || !formData.timeline) {
      alert('Please fill in title, domain, and timeline.');
      return;
    }

    const payload = {
      title: formData.title,
      domain: finalDomain,
      timeline: formData.timeline,
      durationWeeks: Number(formData.durationWeeks) || 12,
      mode: formData.mode,
      openings: Number(formData.openings) || 1,
      stipend: formData.stipend,
      badge: formData.badge,
      status: formData.status,
      department: formData.department,
      overview: formData.overview,
      prerequisites: formData.prerequisitesText.split('\n').map(s => s.trim()).filter(Boolean),
      deliverables: formData.deliverablesText.split('\n').map(s => s.trim()).filter(Boolean),
      tools: formData.toolsText.split(',').map(s => s.trim()).filter(Boolean)
    };

    setSyncStatusMsg('Saving internship to Supabase database...');
    if (editingInternship) {
      await updateInternship(editingInternship.id, payload);
    } else {
      await addInternship(payload);
    }

    setIsAddModalOpen(false);
    setEditingInternship(null);
    setIsAddingNewDomain(false);
    setCustomDomainInput('');
    await loadData();
    setSyncStatusMsg('Internship saved and synced with Supabase successfully.');
    setTimeout(() => setSyncStatusMsg(''), 3500);
  };

  const handleDeleteInternship = async (id) => {
    const item = internships.find(i => i.id === id);
    if (!item) return;

    const domain = item.domain;
    const remainingInDomain = internships.filter(i => i.id !== id && i.domain === domain);
    const willDomainBeDeleted = remainingInDomain.length === 0;

    const confirmMsg = willDomainBeDeleted
      ? `Are you sure you want to delete "${item.title}"?\n\nNOTE: Since this is the last remaining posting in domain "${domain}", the domain itself will also be deleted from Supabase and the website.`
      : `Are you sure you want to delete "${item.title}" from Supabase database and the portal?`;

    if (window.confirm(confirmMsg)) {
      setSyncStatusMsg(`Deleting "${item.title}" from Supabase database...`);
      await deleteInternship(id);
      await loadData();
      setSyncStatusMsg(
        willDomainBeDeleted
          ? `Deleted internship and removed empty domain "${domain}" from Supabase.`
          : `Internship successfully deleted from Supabase database.`
      );
      setTimeout(() => setSyncStatusMsg(''), 4500);
    }
  };

  const handleDeleteDomain = async (domainName) => {
    const count = internships.filter(i => i.domain === domainName).length;
    if (window.confirm(`Are you sure you want to delete the entire domain "${domainName}" and all ${count} associated internship postings from Supabase and the portal?`)) {
      setSyncStatusMsg(`Deleting domain "${domainName}" and associated postings from Supabase...`);
      await deleteDomain(domainName);
      await loadData();
      setSyncStatusMsg(`Domain "${domainName}" and all its postings have been deleted from Supabase.`);
      setTimeout(() => setSyncStatusMsg(''), 4500);
    }
  };

  const handleToggleStatus = (item) => {
    const newStatus = item.status === 'Open' ? 'Closed' : 'Open';
    updateInternship(item.id, { status: newStatus });
    loadData();
  };

  const handleStatusChange = (appId, newStatus) => {
    const updated = updateApplicationStatus(appId, newStatus);
    setApplications(updated);
    setStatusUpdateMsg(`Status updated to ${newStatus}`);
    setTimeout(() => setStatusUpdateMsg(''), 3000);
    if (viewingApp && viewingApp.id === appId) {
      setViewingApp(prev => ({ ...prev, status: newStatus }));
    }
  };

  // ONE-CLICK EXCEL SPREADSHEET DOWNLOAD
  const handleDownloadExcel = () => {
    if (applications.length === 0) {
      alert('No candidate applications found to download.');
      return;
    }
    const success = exportCandidatesToExcel(applications);
    if (success) {
      setStatusUpdateMsg(`Excel sheet with ${applications.length} candidate details downloaded successfully!`);
      setTimeout(() => setStatusUpdateMsg(''), 4000);
    }
  };

  const handleExportCSV = () => {
    if (applications.length === 0) {
      alert('No applications to export.');
      return;
    }
    const headers = ['Application ID', 'Candidate Name', 'Email', 'Phone', 'College', 'Branch', 'Year', 'Degree', 'Role Applied', 'Status', 'Submitted Date', 'Resume Link'];
    const rows = applications.map(app => [
      `"${app.id}"`,
      `"${app.candidateName}"`,
      `"${app.email}"`,
      `"${app.phone}"`,
      `"${app.college}"`,
      `"${app.branch}"`,
      `"${app.year}"`,
      `"${app.degree}"`,
      `"${app.internshipTitle}"`,
      `"${app.status}"`,
      `"${app.submittedAt}"`,
      `"${app.resumeUrl || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SHT_Internship_Applications_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Marquee announcement handler
  const handleSaveMarquee = (e) => {
    if (e) e.preventDefault();
    saveStoredMarqueeSettings(marqueeSettings);
    setMarqueeSavedMsg('Marquee slide announcement updated and synchronized successfully!');
    setTimeout(() => setMarqueeSavedMsg(''), 3500);
  };

  // Timeline & deadline handlers
  const handleSaveTimeline = (e) => {
    if (e) e.preventDefault();
    saveStoredTimelineSettings(timelineSettings);
    setTimelineSavedMsg('Application deadline and timeline rules updated successfully!');
    setTimeout(() => setTimelineSavedMsg(''), 3500);
  };

  const handleQuickDeadline = (days) => {
    const target = new Date();
    target.setDate(target.getDate() + days);
    target.setHours(23, 59, 59, 0);
    const isoString = new Date(target.getTime() - target.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    const updated = {
      ...timelineSettings,
      enabled: true,
      isManuallyClosed: false,
      deadline: isoString
    };
    setTimelineSettings(updated);
    saveStoredTimelineSettings(updated);
    setTimelineSavedMsg(`Application deadline extended by ${days} days until ${new Date(target).toLocaleDateString()}!`);
    setTimeout(() => setTimelineSavedMsg(''), 3500);
  };

  const handleToggleManualClose = () => {
    const nextState = !timelineSettings.isManuallyClosed;
    const updated = {
      ...timelineSettings,
      isManuallyClosed: nextState
    };
    setTimelineSettings(updated);
    saveStoredTimelineSettings(updated);
    setTimelineSavedMsg(nextState ? 'Applications closed immediately. Candidate view is now showing the closed screen.' : 'Applications re-opened for candidates!');
    setTimeout(() => setTimelineSavedMsg(''), 3500);
  };

  const filteredInternships = internships.filter(item => {
    return listingSearch === '' || 
      item.title.toLowerCase().includes(listingSearch.toLowerCase()) ||
      item.domain.toLowerCase().includes(listingSearch.toLowerCase());
  });

  const filteredApplications = applications.filter(app => {
    const matchStatus = appStatusFilter === 'All' || app.status === appStatusFilter;
    const matchSearch = appSearch === '' ||
      app.candidateName.toLowerCase().includes(appSearch.toLowerCase()) ||
      app.email.toLowerCase().includes(appSearch.toLowerCase()) ||
      app.college.toLowerCase().includes(appSearch.toLowerCase()) ||
      app.id.toLowerCase().includes(appSearch.toLowerCase()) ||
      app.internshipTitle.toLowerCase().includes(appSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Internships Management</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              Admin Only
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Publish, edit, and control internship openings, timelines, domains, and candidate review pipelines.
          </p>
        </div>

        {/* Sub-Tabs: Listings, Applications, Timeline, Marquee */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setAdminSubTab('listings')}
              className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
                adminSubTab === 'listings'
                  ? 'bg-white text-blue-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Listings ({internships.length})
            </button>
            <button
              onClick={() => setAdminSubTab('applications')}
              className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                adminSubTab === 'applications'
                  ? 'bg-white text-blue-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Applications ({applications.length})</span>
              {applications.filter(a => a.status === 'Under Review').length > 0 && (
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              )}
            </button>
            <button
              onClick={() => setAdminSubTab('timeline')}
              className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                adminSubTab === 'timeline'
                  ? 'bg-white text-blue-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Timer className="w-3.5 h-3.5" />
              <span>Timeline / Deadline</span>
              {isApplicationDeadlineCrossed() && (
                <span className="w-2 h-2 rounded-full bg-amber-500" title="Deadline Crossed" />
              )}
            </button>
            <button
              onClick={() => setAdminSubTab('marquee')}
              className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                adminSubTab === 'marquee'
                  ? 'bg-white text-blue-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Marquee Slide</span>
              {marqueeSettings.enabled && (
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active" />
              )}
            </button>
          </div>

          {/* ONE-CLICK EXCEL DOWNLOAD FOR ADMIN */}
          <button
            onClick={handleDownloadExcel}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-600/30 transition-all cursor-pointer"
            title="Download complete candidates list as an Excel sheet with all filled details in one click"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download Excel Sheet</span>
            <span className="sm:hidden">Excel</span>
          </button>

          {adminSubTab === 'listings' && (
            <button
              onClick={openAddModal}
              className="btn-primary text-xs py-2 px-3.5 font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Internship</span>
            </button>
          )}

          {adminSubTab === 'applications' && (
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Export as CSV"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {statusUpdateMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{statusUpdateMsg}</span>
        </div>
      )}

      {syncStatusMsg && (
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
          <span className="font-medium">{syncStatusMsg}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 1: INTERNSHIP LISTINGS                           */}
      {/* ======================================================== */}
      {adminSubTab === 'listings' && (
        <div className="space-y-4">
          {/* Supabase Status & Active Domains Control Bar */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-800">
                  Supabase Database Connected
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 font-semibold">
                  PostgreSQL Realtime Sync
                </span>
              </div>

              <button
                type="button"
                onClick={loadData}
                disabled={isSyncing}
                className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Refresh and sync data with Supabase"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Supabase'}</span>
              </button>
            </div>

            {/* Active Domains with Postings Count & Delete Domain capability */}
            <div className="pt-2 border-t border-blue-100 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Active Domains ({domains.length}):
              </span>
              {domains.map((dom) => {
                const count = internships.filter(i => i.domain === dom).length;
                return (
                  <span
                    key={dom}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 shadow-2xs group"
                  >
                    <span>{dom}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-600 font-bold">
                      {count}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteDomain(dom)}
                      title={`Delete domain "${dom}" and all its postings from Supabase and website`}
                      className="p-0.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
          {/* Search bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={listingSearch}
                onChange={(e) => setListingSearch(e.target.value)}
                placeholder="Search internships..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-600"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
              Showing {filteredInternships.length} of {internships.length} postings
            </span>
          </div>

          {/* Table / Cards */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Internship Title &amp; Domain</th>
                  <th className="py-3 px-4">Timeline / Duration</th>
                  <th className="py-3 px-4">Mode / Openings</th>
                  <th className="py-3 px-4">Stipend Details</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredInternships.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{item.title}</div>
                      <div className="text-[11px] text-blue-600 font-semibold">{item.domain}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{item.timeline}</div>
                      <div className="text-[10px] text-slate-400">{item.durationWeeks || 12} Weeks Agenda</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium">{item.mode}</div>
                      <div className="text-[10px] text-slate-500">{item.openings} Seats Available</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 max-w-xs truncate">
                      {item.stipend || 'Performance-based'}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                          item.status === 'Open'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                        title="Click to toggle Open / Closed"
                      >
                        {item.status}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Edit Internship"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteInternship(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Internship"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 2: CANDIDATE APPLICATIONS PIPELINE               */}
      {/* ======================================================== */}
      {adminSubTab === 'applications' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={appSearch}
                onChange={(e) => setAppSearch(e.target.value)}
                placeholder="Search candidates, college, email..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-semibold">Status:</span>
              {['All', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Accepted', 'Rejected'].map(status => (
                <button
                  key={status}
                  onClick={() => setAppStatusFilter(status)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    appStatusFilter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Applicant &amp; Reference</th>
                  <th className="py-3 px-4">Role Applied</th>
                  <th className="py-3 px-4">College, Branch &amp; Year</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Review Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredApplications.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{app.candidateName}</div>
                      <div className="font-mono text-[10px] text-blue-600 font-semibold">{app.id}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(app.submittedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{app.internshipTitle}</div>
                      <div className="text-[11px] text-slate-500">{app.preferredTimeline}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{app.college}</div>
                      <div className="text-[10px] text-slate-500">{app.branch} • {app.year} ({app.degree})</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div>{app.email}</div>
                      <div className="text-slate-400 text-[10px]">{app.phone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                          app.status === 'Accepted' || app.status === 'Shortlisted'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : app.status === 'Interview Scheduled'
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : app.status === 'Rejected'
                            ? 'bg-red-50 text-red-800 border-red-200'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}
                      >
                        <option value="Under Review">Under Review</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Interview Scheduled">Interview Scheduled</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setViewingApp(app)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredApplications.length === 0 && (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
              No applications match your search criteria.
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 3: APPLICATION TIMELINE & DEADLINE CONTROL       */}
      {/* ======================================================== */}
      {adminSubTab === 'timeline' && (
        <div className="space-y-6">
          {/* Status Alert Banner */}
          {timelineSavedMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{timelineSavedMsg}</span>
            </div>
          )}

          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Timer className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-slate-900">Application Timeline &amp; Deadline Control</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Set candidate submission deadlines. When the deadline crosses, all internship listings vanish and candidates see the closed notice.
                </p>
              </div>

              {/* Current Status Pill */}
              <div className="shrink-0">
                {isApplicationDeadlineCrossed() ? (
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1.5 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    <span>Applications Window: CLOSED</span>
                  </span>
                ) : (
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Applications Window: ACTIVE &amp; OPEN</span>
                  </span>
                )}
              </div>
            </div>

            {/* Timeline Form Controls */}
            <form onSubmit={handleSaveTimeline} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Deadline Setting */}
                <div className="space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>Application Deadline Date &amp; Time</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={timelineSettings.enabled}
                        onChange={(e) => setTimelineSettings({ ...timelineSettings, enabled: e.target.checked })}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>Enforce Deadline</span>
                    </label>
                  </div>

                  <input
                    type="datetime-local"
                    value={timelineSettings.deadline ? timelineSettings.deadline.slice(0, 16) : ''}
                    onChange={(e) => setTimelineSettings({ ...timelineSettings, deadline: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 bg-white font-mono"
                  />

                  {/* Quick Preset Buttons */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-slate-500">Quick Deadline Extensions:</span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuickDeadline(7)}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600 cursor-pointer"
                      >
                        +7 Days
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickDeadline(14)}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600 cursor-pointer"
                      >
                        +14 Days
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickDeadline(30)}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600 cursor-pointer"
                      >
                        +30 Days (1 Month)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Instant Emergency Actions */}
                <div className="space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>Immediate Overrides</span>
                    </label>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Manually shut down or re-open applications immediately without changing the scheduled deadline timer.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleToggleManualClose}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        timelineSettings.isManuallyClosed
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                          : 'bg-red-600 hover:bg-red-500 text-white shadow-md'
                      }`}
                    >
                      {timelineSettings.isManuallyClosed ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Re-Open Applications Now</span>
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4" />
                          <span>Close Applications Immediately (Vanish Listings)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Message to display when closed */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  Closed Screen Message Text (Displayed to Candidates)
                </label>
                <input
                  type="text"
                  value={timelineSettings.closedMessage || 'Applications are closed and wait for next batch.'}
                  onChange={(e) => setTimelineSettings({ ...timelineSettings, closedMessage: e.target.value })}
                  placeholder="e.g. Applications are closed and wait for next batch."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 bg-white"
                />
                <p className="text-[11px] text-slate-400">
                  Displayed in bold font alongside the official Sakith Harvan logo and clean exclamation mark badge when applications have concluded.
                </p>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="btn-primary py-2.5 px-6 text-xs font-bold flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Timeline &amp; Deadline Settings</span>
                </button>
              </div>
            </form>
          </div>

          {/* Live Preview of Candidate Closed Screen */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Candidate Closed Screen Preview (Rendered when deadline passes)
              </span>
              <span className="text-[11px] text-slate-400">Without cringe emojis • Minimalist enterprise style</span>
            </div>

            <div className="p-10 rounded-2xl bg-slate-50 border border-slate-200 text-center max-w-xl mx-auto space-y-4">
              <img
                src="/logo.png"
                alt="Sakith Harvan Technologies"
                className="w-16 h-16 object-contain mx-auto"
                onError={(e) => { e.target.style.display = 'none'; }}
              />

              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
                <span className="text-2xl font-black font-mono">!</span>
              </div>

              <h4 className="text-xl font-extrabold text-slate-900 leading-snug">
                {timelineSettings.closedMessage || 'Applications are closed and wait for next batch.'}
              </h4>

              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                The application deadline for this cohort has passed. All existing submissions are currently undergoing technical evaluation. Next batch registration dates will be announced here.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 4: MARQUEE SLIDE & ANNOUNCEMENT CONTROL          */}
      {/* ======================================================== */}
      {adminSubTab === 'marquee' && (
        <div className="space-y-6">
          {/* Status Alert Banner */}
          {marqueeSavedMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{marqueeSavedMsg}</span>
            </div>
          )}

          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-slate-900">Marquee Slide Announcement Bar</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Publish scrolling marquee announcements across the website. Can be updated or disabled by admin at any time.
                </p>
              </div>

              {/* Toggle Enable / Disable */}
              <button
                type="button"
                onClick={() => {
                  const updated = { ...marqueeSettings, enabled: !marqueeSettings.enabled };
                  setMarqueeSettings(updated);
                  saveStoredMarqueeSettings(updated);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                  marqueeSettings.enabled
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                    : 'bg-slate-100 text-slate-600 border-slate-300'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${marqueeSettings.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                <span>{marqueeSettings.enabled ? 'Marquee: ACTIVE' : 'Marquee: DISABLED'}</span>
              </button>
            </div>

            {/* Marquee Form */}
            <form onSubmit={handleSaveMarquee} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Announcement Slide Text (Admin only)</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {marqueeSettings.text.length} characters
                  </span>
                </label>
                <textarea
                  rows={3}
                  value={marqueeSettings.text}
                  onChange={(e) => setMarqueeSettings({ ...marqueeSettings, text: e.target.value })}
                  placeholder="Enter the announcement text to display on the continuous marquee slide..."
                  className="w-full p-3.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 bg-slate-50/50 leading-relaxed"
                  required
                />
              </div>

              {/* Display Target Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={marqueeSettings.showOnInternships}
                      onChange={(e) => setMarqueeSettings({ ...marqueeSettings, showOnInternships: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Show on Internships Page</span>
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Displays continuous slide above internship openings.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={marqueeSettings.showOnCOC}
                      onChange={(e) => setMarqueeSettings({ ...marqueeSettings, showOnCOC: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Show on Course of Career</span>
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Displays continuous slide on Course of Career module.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <label className="text-xs font-bold text-slate-800 block">
                    Scroll Cycle Speed: {marqueeSettings.speed || 30}s
                  </label>
                  <input
                    type="range"
                    min="15"
                    max="60"
                    step="5"
                    value={marqueeSettings.speed || 30}
                    onChange={(e) => setMarqueeSettings({ ...marqueeSettings, speed: Number(e.target.value) })}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Fast (15s)</span>
                    <span>Normal (30s)</span>
                    <span>Slow (60s)</span>
                  </div>
                </div>
              </div>

              {/* Live Preview */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-700 block">
                  Live Marquee Banner Preview
                </span>
                <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-1">
                  <div className="flex items-center">
                    <div className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-700 to-indigo-800 text-white font-mono text-[10px] font-extrabold uppercase rounded-lg">
                      <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
                      <span>ANNOUNCEMENT</span>
                    </div>
                    <div className="flex-1 overflow-hidden px-4 py-2">
                      <div className="text-xs font-medium text-cyan-200 truncate">
                        {marqueeSettings.enabled ? marqueeSettings.text : '(Marquee slide is currently disabled)'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const disabled = { ...marqueeSettings, enabled: false };
                    setMarqueeSettings(disabled);
                    saveStoredMarqueeSettings(disabled);
                    setMarqueeSavedMsg('Marquee slide has been disabled.');
                    setTimeout(() => setMarqueeSavedMsg(''), 3000);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-red-600 transition-colors cursor-pointer"
                >
                  Disable Marquee Slide
                </button>

                <button
                  type="submit"
                  className="btn-primary py-2.5 px-6 text-xs font-bold flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Marquee Announcement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT INTERNSHIP                             */}
      {/* ======================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 relative space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {editingInternship ? 'Edit Internship Posting' : 'Add New Internship'}
                </h3>
                <p className="text-xs text-slate-500">Configure domain, timeline, description, and applicant criteria.</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Title & Domain */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Internship Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. AI & Machine Learning Engineering Intern"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 bg-slate-50/50"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">Domain *</label>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewDomain(!isAddingNewDomain)}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                    >
                      {isAddingNewDomain ? '← Select existing' : '+ Add custom domain'}
                    </button>
                  </div>

                  {isAddingNewDomain ? (
                    <input
                      type="text"
                      required
                      value={customDomainInput}
                      onChange={(e) => {
                        setCustomDomainInput(e.target.value);
                        setFormData({ ...formData, domain: e.target.value });
                      }}
                      placeholder="e.g. Blockchain & Web3 or Robotics"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                  ) : (
                    <select
                      value={formData.domain}
                      onChange={(e) => {
                        if (e.target.value === '__NEW__') {
                          setIsAddingNewDomain(true);
                        } else {
                          setFormData({ ...formData, domain: e.target.value });
                        }
                      }}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50"
                    >
                      {domains.map((dom) => (
                        <option key={dom} value={dom}>{dom}</option>
                      ))}
                      <option value="__NEW__">+ Add Custom Domain...</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Timeline & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Timeline Description *</label>
                  <input
                    type="text"
                    required
                    value={formData.timeline}
                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                    placeholder="e.g. 3 Months / Summer Track"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (Weeks)</label>
                  <input
                    type="number"
                    value={formData.durationWeeks}
                    onChange={(e) => setFormData({ ...formData, durationWeeks: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Work Mode</label>
                  <select
                    value={formData.mode}
                    onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50"
                  >
                    <option value="Hybrid / Remote">Hybrid / Remote</option>
                    <option value="Remote">Remote</option>
                    <option value="On-Site (Hyderabad)">On-Site (Hyderabad)</option>
                  </select>
                </div>
              </div>

              {/* Stipend, Openings, Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Stipend &amp; Perks</label>
                  <input
                    type="text"
                    value={formData.stipend}
                    onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                    placeholder="e.g. ₹10,000 / month + PPO"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Seats / Openings</label>
                  <input
                    type="number"
                    value={formData.openings}
                    onChange={(e) => setFormData({ ...formData, openings: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50"
                  >
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* Description / Overview */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Role Description / Scope</label>
                <textarea
                  rows="3"
                  value={formData.overview}
                  onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                  placeholder="Describe the candidate responsibilities and learning objectives..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 bg-slate-50/50"
                />
              </div>

              {/* Prerequisites & Deliverables */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Prerequisites (One per line)</label>
                  <textarea
                    rows="3"
                    value={formData.prerequisitesText}
                    onChange={(e) => setFormData({ ...formData, prerequisitesText: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Key Deliverables (One per line)</label>
                  <textarea
                    rows="3"
                    value={formData.deliverablesText}
                    onChange={(e) => setFormData({ ...formData, deliverablesText: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Tools */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Technologies / Tools (Comma separated)</label>
                <input
                  type="text"
                  value={formData.toolsText}
                  onChange={(e) => setFormData({ ...formData, toolsText: e.target.value })}
                  placeholder="e.g. Python, PyTorch, Docker, Git, AWS"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 font-mono text-[11px]"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs py-2 px-5 font-bold flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingInternship ? 'Save Changes' : 'Create Internship'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: VIEW CANDIDATE APPLICATION                        */}
      {/* ======================================================== */}
      {viewingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 relative space-y-6">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-blue-600">{viewingApp.id}</span>
                <h3 className="text-xl font-bold text-slate-900">{viewingApp.candidateName}</h3>
                <p className="text-xs text-slate-500">Applied for: {viewingApp.internshipTitle}</p>
              </div>
              <button
                onClick={() => setViewingApp(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Candidate Details */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Email</span>
                <span className="font-semibold text-slate-800">{viewingApp.email}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Phone</span>
                <span className="font-semibold text-slate-800">{viewingApp.phone}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">College</span>
                <span className="font-semibold text-slate-800">{viewingApp.college}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Degree / Branch / Year</span>
                <span className="font-semibold text-slate-800">{viewingApp.degree} • {viewingApp.branch} • {viewingApp.year}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Skills</span>
                <span className="font-semibold text-slate-800">{viewingApp.skills || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Submitted</span>
                <span className="font-semibold text-slate-800">{new Date(viewingApp.submittedAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-2 pt-1">
              {viewingApp.portfolioUrl && (
                <a
                  href={viewingApp.portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-semibold text-xs flex items-center gap-1.5 hover:bg-blue-100"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>GitHub / Portfolio</span>
                </a>
              )}
              {viewingApp.resumeUrl && (
                <a
                  href={viewingApp.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 font-semibold text-xs flex items-center gap-1.5 hover:bg-slate-200"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>View Resume</span>
                </a>
              )}
            </div>

            {/* Statement of Intent */}
            {viewingApp.whyJoin && (
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Why Join Sakith Harvan</span>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                  {viewingApp.whyJoin}
                </p>
              </div>
            )}

            {/* Update Status */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Set Review Status:</span>
                <select
                  value={viewingApp.status}
                  onChange={(e) => handleStatusChange(viewingApp.id, e.target.value)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-white"
                >
                  <option value="Under Review">Under Review</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <button
                onClick={() => setViewingApp(null)}
                className="btn-primary text-xs py-2 px-5 font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
