import React, { useState, useEffect } from 'react';
import { 
  Trophy, Plus, Edit3, Trash2, Calendar, Clock, Users, Shield, 
  CheckCircle2, AlertCircle, Download, ExternalLink, Github, Key, 
  Send, Lock, Unlock, Eye, Sparkles, Search, ChevronRight, ArrowRight, Layers,
  Copy, Image
} from 'lucide-react';
import { 
  getStoredHackathons, 
  saveStoredHackathons, 
  getStoredHackathonRegistrations, 
  saveStoredHackathonRegistrations,
  exportHackathonTeamsToExcel,
  formatHackathonLogoUrl,
  syncHackathonsFromSupabase,
  syncHackathonRegistrationsFromSupabase,
  deleteHackathon
} from '../../lib/hackathonStore';
import { supabase } from '../../lib/supabaseClient';

export const AdminHackathonsManagement = () => {
  const [hackathons, setHackathons] = useState(() => getStoredHackathons());
  const [registrations, setRegistrations] = useState(() => getStoredHackathonRegistrations());
  const [selectedHackathonId, setSelectedHackathonId] = useState(
    () => getStoredHackathons()[0]?.id || null
  );
  const [activeStepTab, setActiveStepTab] = useState('statements'); // 'statements' | 'timeline' | 'teams' | 'winners'

  // Modal / Form state for creating hackathon
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    tagline: '',
    description: '',
    theme: 'Enterprise AI & Autonomous Agents',
    logoUrl: '',
    logoInputMode: 'link', // 'link' | 'upload'
    entryFee: 299,
    minTeamSize: 2,
    maxTeamSize: 4,
    registrationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    statementLockDeadline: new Date(Date.now() + 7.5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    kickoffTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    submissionDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  });

  const handleLogoFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setCreateForm((prev) => ({ ...prev, logoUrl: event.target?.result }));
    };
    reader.readAsDataURL(file);
  };

  // Problem statement form state
  const [isAddStatementModalOpen, setIsAddStatementModalOpen] = useState(false);
  const [statementForm, setStatementForm] = useState({
    title: '',
    track: 'Agentic AI / FinTech',
    summary: '',
    fullDetails: '',
    rules: '',
    evaluationCriteria: '',
    starterRepoUrl: ''
  });

  // Winner Announcement Selection State
  const [winner1stTeamId, setWinner1stTeamId] = useState('');
  const [winner2ndTeamId, setWinner2ndTeamId] = useState('');
  const [winner3rdTeamId, setWinner3rdTeamId] = useState('');
  const [winner1stPrize, setWinner1stPrize] = useState('₹25,000 Cash + Direct PPO Fast-Track');
  const [winner2ndPrize, setWinner2ndPrize] = useState('₹15,000 Cash + Industrial Internship Voucher');
  const [winner3rdPrize, setWinner3rdPrize] = useState('₹10,000 Cash + Cloud Credits');

  // Search filter for teams
  const [teamSearchQuery, setTeamSearchQuery] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Multi-device sync: local listeners + Supabase PostgreSQL Realtime channel
  useEffect(() => {
    // 1. Initial background fetch from Supabase
    syncHackathonsFromSupabase().then((hList) => {
      if (hList && Array.isArray(hList)) setHackathons(hList);
    });
    syncHackathonRegistrationsFromSupabase().then((rList) => {
      if (rList && Array.isArray(rList)) setRegistrations(rList);
    });

    // 2. Local storage event sync
    const handleUpdate = () => {
      setHackathons(getStoredHackathons());
      setRegistrations(getStoredHackathonRegistrations());
    };
    window.addEventListener('sh_hackathons_updated', handleUpdate);
    window.addEventListener('sh_hackathon_registrations_updated', handleUpdate);

    // 3. Supabase Realtime multi-device subscription
    let channel = null;
    try {
      const channelId = `admin_hackathons_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      channel = supabase
        .channel(channelId)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'hackathons' },
          () => {
            syncHackathonsFromSupabase().then((hList) => {
              if (hList && Array.isArray(hList)) setHackathons(hList);
            });
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'hackathon_registrations' },
          () => {
            syncHackathonRegistrationsFromSupabase().then((rList) => {
              if (rList && Array.isArray(rList)) setRegistrations(rList);
            });
          }
        )
        .subscribe();
    } catch (e) {
      console.warn('Realtime subscription error on admin hackathons:', e);
    }

    return () => {
      window.removeEventListener('sh_hackathons_updated', handleUpdate);
      window.removeEventListener('sh_hackathon_registrations_updated', handleUpdate);
      if (channel) {
        try { supabase.removeChannel(channel); } catch (e) {}
      }
    };
  }, []);

  const triggerToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const currentHackathon = hackathons.find(h => h.id === selectedHackathonId) || hackathons[0];
  const currentTeams = registrations.filter(r => r.hackathonId === currentHackathon?.id);

  // Filtered teams
  const filteredTeams = currentTeams.filter(t => {
    const q = teamSearchQuery.toLowerCase();
    return (
      t.id.toLowerCase().includes(q) ||
      t.teamName.toLowerCase().includes(q) ||
      (t.members && t.members.some(m => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.college.toLowerCase().includes(q)))
    );
  });

  // 1. Create New Hackathon
  const handleCreateHackathon = (e) => {
    e.preventDefault();
    const newId = `HCK-${Date.now().toString().slice(-6)}`;
    const newHackathon = {
      id: newId,
      title: createForm.title.trim(),
      tagline: createForm.tagline.trim(),
      description: createForm.description.trim(),
      theme: createForm.theme,
      logoUrl: formatHackathonLogoUrl(createForm.logoUrl) || '',
      entryFee: Number(createForm.entryFee) || 0,
      minTeamSize: Number(createForm.minTeamSize) || 2,
      maxTeamSize: Number(createForm.maxTeamSize) || 4,
      status: 'active',
      registrationDeadline: new Date(createForm.registrationDeadline).toISOString(),
      statementLockDeadline: new Date(createForm.statementLockDeadline).toISOString(),
      statementsLocked: false,
      kickoffTime: new Date(createForm.kickoffTime).toISOString(),
      submissionDeadline: new Date(createForm.submissionDeadline).toISOString(),
      statementsReleased: false,
      submissionsClosed: false,
      problemStatements: [],
      winners: null,
      createdAt: new Date().toISOString()
    };

    const updated = [newHackathon, ...hackathons];
    saveStoredHackathons(updated);
    setHackathons(updated);
    setSelectedHackathonId(newId);
    setActiveStepTab('statements'); // Focus on adding problem statements next
    setIsCreateModalOpen(false);
    triggerToast(`Hackathon "${newHackathon.title}" created successfully! Now proceed to next steps.`);
  };

  // 2. Add Problem Statement
  const handleAddStatement = (e) => {
    e.preventDefault();
    if (!currentHackathon) return;

    const newStatement = {
      id: `PS-${String((currentHackathon.problemStatements?.length || 0) + 1).padStart(2, '0')}`,
      title: statementForm.title.trim(),
      track: statementForm.track.trim(),
      summary: statementForm.summary.trim(),
      fullDetails: statementForm.fullDetails.trim(),
      rules: statementForm.rules.trim(),
      evaluationCriteria: statementForm.evaluationCriteria.trim(),
      starterRepoUrl: statementForm.starterRepoUrl.trim()
    };

    const updatedHackathons = hackathons.map(h => {
      if (h.id === currentHackathon.id) {
        return {
          ...h,
          problemStatements: [...(h.problemStatements || []), newStatement]
        };
      }
      return h;
    });

    saveStoredHackathons(updatedHackathons);
    setHackathons(updatedHackathons);
    setIsAddStatementModalOpen(false);
    setStatementForm({
      title: '',
      track: 'Agentic AI / FinTech',
      summary: '',
      fullDetails: '',
      rules: '',
      evaluationCriteria: '',
      starterRepoUrl: ''
    });
    triggerToast(`Problem statement "${newStatement.title}" added to ${currentHackathon.title}!`);
  };

  // 3. Delete Problem Statement
  const handleDeleteStatement = (psId) => {
    if (!confirm('Are you sure you want to remove this problem statement?')) return;
    const updatedHackathons = hackathons.map(h => {
      if (h.id === currentHackathon.id) {
        return {
          ...h,
          problemStatements: (h.problemStatements || []).filter(ps => ps.id !== psId)
        };
      }
      return h;
    });
    saveStoredHackathons(updatedHackathons);
    setHackathons(updatedHackathons);
    triggerToast('Problem statement removed.');
  };

  // 3b. Delete Hackathon Permanently
  const handleDeleteHackathon = (hckId) => {
    const toDelete = hackathons.find(h => h.id === hckId);
    if (!toDelete) return;
    if (!confirm(`Are you sure you want to permanently delete the hackathon "${toDelete.title}"? This will also remove its problem statements and squad registrations.`)) {
      return;
    }

    const updatedHackathons = hackathons.filter(h => h.id !== hckId);
    saveStoredHackathons(updatedHackathons);
    deleteHackathon(hckId);
    setHackathons(updatedHackathons);

    // Also remove registrations associated with this hackathon
    const updatedRegistrations = registrations.filter(r => r.hackathonId !== hckId);
    saveStoredHackathonRegistrations(updatedRegistrations);
    setRegistrations(updatedRegistrations);

    // Select another hackathon or null if none remain
    const nextSelected = updatedHackathons.length > 0 ? updatedHackathons[0].id : null;
    setSelectedHackathonId(nextSelected);

    triggerToast(`Hackathon "${toDelete.title}" has been deleted.`);
  };

  // 4. Update Hackathon Toggles (Release Statements, Close Submissions, Deadlines)
  const handleUpdateToggle = (field, value) => {
    if (!currentHackathon) return;
    const updatedHackathons = hackathons.map(h => {
      if (h.id === currentHackathon.id) {
        return { ...h, [field]: value };
      }
      return h;
    });
    saveStoredHackathons(updatedHackathons);
    setHackathons(updatedHackathons);
    triggerToast(`Setting updated: ${field} is now ${value ? 'ACTIVE / RELEASED' : 'DISABLED'}`);
  };

  // 5. Announce Winners & Complete Hackathon
  const handleAnnounceWinners = (e) => {
    e.preventDefault();
    if (!winner1stTeamId) {
      alert('Please select at least the 1st Place Winner team.');
      return;
    }

    const t1 = currentTeams.find(t => t.id === winner1stTeamId);
    const t2 = currentTeams.find(t => t.id === winner2ndTeamId);
    const t3 = currentTeams.find(t => t.id === winner3rdTeamId);

    const winnersPayload = {
      first: t1 ? {
        place: '1st Place Winner',
        badge: '🏆 Champion',
        teamId: t1.id,
        teamName: t1.teamName,
        teamLeader: t1.members?.[0]?.name || 'Leader',
        college: t1.members?.[0]?.college || '-',
        problemStatementId: t1.problemStatementId || 'General',
        problemStatementTitle: t1.problemStatementTitle || 'Open Innovation Track',
        deployedUrl: t1.submission?.liveUrl || '',
        githubUrl: t1.submission?.githubUrl || '',
        prize: winner1stPrize,
        remarks: t1.submission?.workingNotes || 'Outstanding technical execution'
      } : null,
      second: t2 ? {
        place: '2nd Place (1st Runner Up)',
        badge: '🥈 Runner Up',
        teamId: t2.id,
        teamName: t2.teamName,
        teamLeader: t2.members?.[0]?.name || 'Leader',
        college: t2.members?.[0]?.college || '-',
        problemStatementId: t2.problemStatementId || 'General',
        problemStatementTitle: t2.problemStatementTitle || 'Open Innovation Track',
        deployedUrl: t2.submission?.liveUrl || '',
        githubUrl: t2.submission?.githubUrl || '',
        prize: winner2ndPrize,
        remarks: t2.submission?.workingNotes || 'High performance architecture'
      } : null,
      third: t3 ? {
        place: '3rd Place (2nd Runner Up)',
        badge: '🥉 2nd Runner Up',
        teamId: t3.id,
        teamName: t3.teamName,
        teamLeader: t3.members?.[0]?.name || 'Leader',
        college: t3.members?.[0]?.college || '-',
        problemStatementId: t3.problemStatementId || 'General',
        problemStatementTitle: t3.problemStatementTitle || 'Open Innovation Track',
        deployedUrl: t3.submission?.liveUrl || '',
        githubUrl: t3.submission?.githubUrl || '',
        prize: winner3rdPrize,
        remarks: t3.submission?.workingNotes || 'Innovative implementation'
      } : null
    };

    const updatedHackathons = hackathons.map(h => {
      if (h.id === currentHackathon.id) {
        return {
          ...h,
          status: 'completed',
          submissionsClosed: true,
          winners: winnersPayload
        };
      }
      return h;
    });

    saveStoredHackathons(updatedHackathons);
    setHackathons(updatedHackathons);
    triggerToast(`Grand finale winners announced! "${currentHackathon.title}" is now marked as Completed.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-24 right-6 z-50 p-4 rounded-xl bg-slate-900 text-white border border-cyan-400 shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{successToast}</span>
        </div>
      )}

      {/* Top Banner & Quick Controls */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white border border-white/10 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
                Enterprise Hackathons Command Engine
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-white mt-1">
              Hackathons &amp; Squad Sprint Management
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Create and regulate engineering hackathons, formulate problem statements, manage candidate squads, toggle release times, and announce Grand Finale podium winners.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-primary text-xs px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/25 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Hackathon</span>
            </button>
          </div>
        </div>

        {/* Hackathon Selector Pills */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-slate-400 uppercase mr-1">Select Event:</span>
          {hackathons.map((h) => {
            const isSelected = selectedHackathonId === h.id;
            const teamsCount = registrations.filter(r => r.hackathonId === h.id).length;
            return (
              <button
                key={h.id}
                onClick={() => setSelectedHackathonId(h.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400/30'
                    : 'bg-white/10 text-slate-300 hover:text-white hover:bg-white/15'
                }`}
              >
                <span>{h.title}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-blue-900 text-cyan-200' : 'bg-black/30 text-slate-400'}`}>
                  {teamsCount} Squads
                </span>
                {h.status === 'completed' && (
                  <span className="text-[10px] font-bold text-amber-300">★ Completed</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Hackathon Controls & Step Workflow */}
      {currentHackathon && (
        <div className="space-y-6">
          
          {/* Active Hackathon Info & Step Navigation Bar */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                  {currentHackathon.id}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600 font-semibold">{currentHackathon.theme}</span>
                <span className="text-slate-400">•</span>
                <span className="font-bold text-emerald-600">
                  {currentHackathon.entryFee > 0 ? `₹${currentHackathon.entryFee} Entry Fee` : 'Free Entry'}
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                {currentHackathon.title}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Stepper Tabs: Only show next steps when hackathon exists */}
              <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200">
                <button
                  onClick={() => setActiveStepTab('statements')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeStepTab === 'statements' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  1. Problem Statements ({currentHackathon.problemStatements?.length || 0})
                </button>
                <button
                  onClick={() => setActiveStepTab('timeline')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeStepTab === 'timeline' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  2. Sprint Controls &amp; Release
                </button>
                <button
                  onClick={() => setActiveStepTab('teams')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeStepTab === 'teams' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>3. Candidate Squads</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[10px]">
                    {currentTeams.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveStepTab('winners')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeStepTab === 'winners' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  4. Grand Finale &amp; Winners
                </button>
              </div>

              {/* Delete Hackathon Button */}
              <button
                type="button"
                onClick={() => handleDeleteHackathon(currentHackathon.id)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                title="Permanently delete this hackathon"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Hackathon</span>
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* STEP 1: PROBLEM STATEMENTS MANAGEMENT                     */}
          {/* ======================================================== */}
          {activeStepTab === 'statements' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    Formulate Problem Statements for {currentHackathon.title}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Squads select from these statements during registration. Secret rules and full specifications unlock when you initiate sprint kickoff.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddStatementModalOpen(true)}
                  className="btn-primary text-xs px-4 py-2 rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Problem Statement</span>
                </button>
              </div>

              {(!currentHackathon.problemStatements || currentHackathon.problemStatements.length === 0) ? (
                <div className="p-8 rounded-2xl bg-white border border-dashed border-slate-300 text-center space-y-3">
                  <Shield className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-sm font-semibold text-slate-700">No problem statements configured yet.</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Click &quot;Add Problem Statement&quot; above to add your first technical challenge and unlock participant choices.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentHackathon.problemStatements.map((ps) => (
                    <div
                      key={ps.id}
                      className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                            {ps.id}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">
                            {ps.track}
                          </span>
                        </div>
                        <h5 className="text-sm font-bold text-slate-900 line-clamp-2">
                          {ps.title}
                        </h5>
                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                          {ps.summary}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-mono text-[11px]">
                          Criteria: {ps.evaluationCriteria ? 'Set' : 'Standard'}
                        </span>
                        <button
                          onClick={() => handleDeleteStatement(ps.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                          title="Remove Statement"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 2: SPRINT TIMELINES & RELEASE CONTROLS              */}
          {/* ======================================================== */}
          {activeStepTab === 'timeline' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Sprint Timelines &amp; Statement Release Switches
                </h4>
                <p className="text-xs text-slate-500">
                  Control when participants can register, when complete problem statement details unlock, and when final submissions are locked.
                </p>
              </div>

              {/* Master Switches Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Switch 1: Problem Statement & Kickoff Release */}
                <div className={`p-5 rounded-2xl border transition-all ${
                  currentHackathon.statementsReleased 
                    ? 'border-emerald-300 bg-emerald-50/40' 
                    : 'border-slate-200 bg-white'
                }`}>
                  <div className="flex flex-col justify-between h-full space-y-3">
                    <div>
                      <div className="flex items-center gap-2">
                        {currentHackathon.statementsReleased ? (
                          <Unlock className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Lock className="w-5 h-5 text-slate-400" />
                        )}
                        <h5 className="text-sm font-bold text-slate-900">
                          Release Problem Statements
                        </h5>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        When enabled, squad participants unlock full problem scope, test datasets, and rules.
                      </p>
                    </div>

                    <button
                      onClick={() => handleUpdateToggle('statementsReleased', !currentHackathon.statementsReleased)}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        currentHackathon.statementsReleased
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {currentHackathon.statementsReleased ? 'Statements Released (ON)' : 'Locked (OFF)'}
                    </button>
                  </div>
                </div>

                {/* Switch 2: Statement Selection Lock (Fixed by Admin) */}
                <div className={`p-5 rounded-2xl border transition-all ${
                  currentHackathon.statementsLocked 
                    ? 'border-indigo-300 bg-indigo-50/40' 
                    : 'border-slate-200 bg-white'
                }`}>
                  <div className="flex flex-col justify-between h-full space-y-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Lock className="w-5 h-5 text-indigo-600" />
                        <h5 className="text-sm font-bold text-slate-900">
                          Lock Statement Selection
                        </h5>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Freezes statement choices. When locked, teams cannot change their chosen statement.
                      </p>
                    </div>

                    <button
                      onClick={() => handleUpdateToggle('statementsLocked', !currentHackathon.statementsLocked)}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        currentHackathon.statementsLocked
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {currentHackathon.statementsLocked ? 'Selection Frozen (Locked)' : 'Open for Selection'}
                    </button>
                  </div>
                </div>

                {/* Switch 3: Submission Lock */}
                <div className={`p-5 rounded-2xl border transition-all ${
                  currentHackathon.submissionsClosed 
                    ? 'border-rose-300 bg-rose-50/40' 
                    : 'border-slate-200 bg-white'
                }`}>
                  <div className="flex flex-col justify-between h-full space-y-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-amber-600" />
                        <h5 className="text-sm font-bold text-slate-900">
                          Lock Project Submissions
                        </h5>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Strictly prevents candidates from modifying URLs, GitHub links, or test credentials.
                      </p>
                    </div>

                    <button
                      onClick={() => handleUpdateToggle('submissionsClosed', !currentHackathon.submissionsClosed)}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        currentHackathon.submissionsClosed
                          ? 'bg-rose-600 text-white shadow-md'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {currentHackathon.submissionsClosed ? 'Submissions Locked' : 'Accepting Submissions'}
                    </button>
                  </div>
                </div>

              </div>

              {/* Deadlines Details Box */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Configured Event Milestones &amp; Timelines (Admin Regulated)
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-semibold text-slate-700 block mb-1">Registration Closes:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {new Date(currentHackathon.registrationDeadline).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200">
                    <span className="font-bold text-indigo-900 block mb-1">Statement Locking Cutoff:</span>
                    <span className="font-mono font-bold text-indigo-800">
                      {currentHackathon.statementLockDeadline ? new Date(currentHackathon.statementLockDeadline).toLocaleString('en-IN') : 'At Kickoff'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-semibold text-slate-700 block mb-1">Kickoff &amp; Sprint Start:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {new Date(currentHackathon.kickoffTime).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-semibold text-slate-700 block mb-1">Final Submission Deadline:</span>
                    <span className="font-mono font-bold text-rose-600">
                      {new Date(currentHackathon.submissionDeadline).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 3: CANDIDATE SQUADS & SUBMISSIONS ROSTER             */}
          {/* ======================================================== */}
          {activeStepTab === 'teams' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>Registered Candidate Squads ({currentTeams.length})</span>
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Live Roster
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Full visibility into team leaders, members, problem statement choices, passwords, and project submissions.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportHackathonTeamsToExcel(currentHackathon.id, currentHackathon.title)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Excel Sheet (.xls)</span>
                  </button>
                </div>
              </div>

              {/* Participant Team IDs Directory - Quick Look & Filter */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Participant Team IDs Directory ({currentTeams.length} Registered)
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Click any ID chip to filter roster instantly
                  </span>
                </div>

                {currentTeams.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No participant teams registered yet for this hackathon.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {currentTeams.map((t) => {
                      const isSelected = teamSearchQuery.toUpperCase() === t.id.toUpperCase();
                      return (
                        <div
                          key={t.id}
                          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 border ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md ring-2 ring-amber-300'
                              : 'bg-white/10 hover:bg-white/15 text-white border-white/10'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => setTeamSearchQuery(isSelected ? '' : t.id)}
                            className="flex items-center gap-1.5 cursor-pointer text-left"
                          >
                            <span className={isSelected ? 'text-slate-950 font-black' : 'text-amber-300'}>{t.id}</span>
                            <span className={`text-[10px] font-normal ${isSelected ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                              ({t.teamName})
                            </span>
                          </button>

                          <button
                            type="button"
                            title="Copy Team ID"
                            onClick={() => {
                              navigator.clipboard?.writeText(t.id);
                              triggerToast(`Copied Team ID: ${t.id}`);
                            }}
                            className={`cursor-pointer ml-0.5 ${isSelected ? 'text-slate-950 hover:text-black' : 'text-slate-400 hover:text-white'}`}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by Team ID (e.g. SHTNXR1025), Team Name, Leader Name, or College..."
                  value={teamSearchQuery}
                  onChange={(e) => setTeamSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                />
              </div>

              {filteredTeams.length === 0 ? (
                <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-2">
                  <Users className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-sm font-semibold text-slate-700">No teams registered matching search.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTeams.map((team) => {
                    const leader = team.members?.[0] || {};
                    const hasSubmitted = !!team.submission?.liveUrl;

                    return (
                      <div
                        key={team.id}
                        className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4"
                      >
                        {/* Team Meta Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded bg-blue-600 text-white flex items-center gap-1.5 shadow-xs">
                              <span>{team.id}</span>
                              <button
                                type="button"
                                title="Copy Team ID"
                                onClick={() => {
                                  navigator.clipboard?.writeText(team.id);
                                  triggerToast(`Copied Team ID: ${team.id}`);
                                }}
                                className="text-blue-200 hover:text-white cursor-pointer ml-0.5"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </span>
                            <div>
                              <h5 className="text-sm font-bold text-slate-900">
                                Team {team.teamName} ({team.teamSize} Members)
                              </h5>
                              <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
                                <span>Password: <code className="font-bold text-blue-700">{team.password}</code></span>
                                <button
                                  type="button"
                                  title="Copy Password"
                                  onClick={() => {
                                    navigator.clipboard?.writeText(team.password);
                                    triggerToast(`Copied Password for Team ${team.teamName}`);
                                  }}
                                  className="text-slate-400 hover:text-blue-700 cursor-pointer"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {team.problemStatementId ? (
                              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-blue-100 text-blue-900 font-bold border border-blue-200">
                                Locked: {team.problemStatementId}
                              </span>
                            ) : (
                              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">
                                ⏱️ Statement Pending Selection
                              </span>
                            )}
                            {hasSubmitted ? (
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Project Submitted</span>
                              </span>
                            ) : (
                              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                                Pending Submission
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Leader & Members Roster */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="font-bold text-slate-700 block mb-1">
                              Team Leader: {leader.name || 'Not provided'}
                            </span>
                            <div className="text-slate-500 space-y-0.5 text-[11px]">
                              <div>Phone: {leader.mobile || '-'}</div>
                              <div>Email: {leader.email || '-'}</div>
                              <div>College: {leader.college || '-'}, {leader.location || '-'}</div>
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="font-bold text-slate-700 block mb-1">
                              Other Squad Members:
                            </span>
                            <div className="text-slate-500 space-y-0.5 text-[11px]">
                              {team.members?.slice(1).map((m, idx) => (
                                <div key={idx}>
                                  • {m.name} ({m.college}) - {m.mobile}
                                </div>
                              ))}
                              {team.members?.length <= 1 && <div>Solo leader entry</div>}
                            </div>
                          </div>
                        </div>

                        {/* Submission Deliverables (If submitted) */}
                        {hasSubmitted && (
                          <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/80 text-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                                <Send className="w-3.5 h-3.5 text-emerald-700" />
                                <span>Candidate Project Deliverables:</span>
                              </span>
                              <span className="text-[10px] text-emerald-700 font-mono">
                                Submitted on {new Date(team.submission.submittedAt).toLocaleString('en-IN')}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-3">
                              {team.submission.liveUrl && (
                                <a 
                                  href={team.submission.liveUrl} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="text-blue-600 hover:underline flex items-center gap-1 font-mono text-[11px]"
                                >
                                  <span>Deployed Live URL</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                              {team.submission.githubUrl && (
                                <a 
                                  href={team.submission.githubUrl} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="text-slate-800 hover:underline flex items-center gap-1 font-mono text-[11px]"
                                >
                                  <Github className="w-3 h-3" />
                                  <span>GitHub Repository</span>
                                </a>
                              )}
                            </div>

                            {team.submission.testCredentials && (
                              <div className="text-[11px] text-slate-700 font-mono pt-1">
                                <strong>Testing Credentials:</strong> ID: {team.submission.testCredentials.login || '-'} | Pass: {team.submission.testCredentials.password || '-'}
                              </div>
                            )}

                            {team.submission.workingNotes && (
                              <div className="text-[11px] text-slate-600 pt-1">
                                <strong>Working Notes:</strong> {team.submission.workingNotes}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 4: GRAND FINALE WINNER ANNOUNCEMENT                  */}
          {/* ======================================================== */}
          {activeStepTab === 'winners' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Announce Grand Finale Winners &amp; Hall of Fame
                </h4>
                <p className="text-xs text-slate-500">
                  Select the 1st, 2nd, and 3rd place winning teams from the registered squads. Their chosen problem statement and project links will be automatically extracted and published.
                </p>
              </div>

              {/* Already Completed Winners Showcase */}
              {currentHackathon.winners && (
                <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 text-white border border-amber-500/30 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-6 h-6 text-amber-400" />
                      <h5 className="text-base font-extrabold text-amber-300">
                        Official Grand Finale Podium Winners
                      </h5>
                    </div>
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                      Event Completed
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 1st Place */}
                    {currentHackathon.winners.first && (
                      <div className="p-4 rounded-xl bg-white/5 border border-amber-400/30 space-y-2">
                        <span className="text-xs font-bold text-amber-400 font-mono">🏆 1st Place Champion</span>
                        <h6 className="text-sm font-extrabold text-white">Team {currentHackathon.winners.first.teamName}</h6>
                        <p className="text-xs text-slate-300">Statement: {currentHackathon.winners.first.problemStatementTitle}</p>
                        <p className="text-xs text-cyan-300 font-bold">{currentHackathon.winners.first.prize}</p>
                      </div>
                    )}

                    {/* 2nd Place */}
                    {currentHackathon.winners.second && (
                      <div className="p-4 rounded-xl bg-white/5 border border-slate-400/30 space-y-2">
                        <span className="text-xs font-bold text-slate-300 font-mono">🥈 2nd Place Runner Up</span>
                        <h6 className="text-sm font-extrabold text-white">Team {currentHackathon.winners.second.teamName}</h6>
                        <p className="text-xs text-slate-300">Statement: {currentHackathon.winners.second.problemStatementTitle}</p>
                        <p className="text-xs text-cyan-300 font-bold">{currentHackathon.winners.second.prize}</p>
                      </div>
                    )}

                    {/* 3rd Place */}
                    {currentHackathon.winners.third && (
                      <div className="p-4 rounded-xl bg-white/5 border border-amber-600/30 space-y-2">
                        <span className="text-xs font-bold text-amber-500 font-mono">🥉 3rd Place Runner Up</span>
                        <h6 className="text-sm font-extrabold text-white">Team {currentHackathon.winners.third.teamName}</h6>
                        <p className="text-xs text-slate-300">Statement: {currentHackathon.winners.third.problemStatementTitle}</p>
                        <p className="text-xs text-cyan-300 font-bold">{currentHackathon.winners.third.prize}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Form to Announce / Update Winners */}
              <form onSubmit={handleAnnounceWinners} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
                <h5 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Select Winning Squads from Roster
                </h5>

                {/* 1st Place Selector */}
                <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <Trophy className="w-4 h-4 text-amber-600" />
                    <span>1st Place Winner (Champion)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Select Squad *</label>
                      <select
                        value={winner1stTeamId}
                        onChange={(e) => setWinner1stTeamId(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none"
                      >
                        <option value="">-- Choose 1st Place Team --</option>
                        {currentTeams.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.teamName} ({t.id}) - Statement: {t.problemStatementId}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Prize &amp; Offer</label>
                      <input
                        type="text"
                        value={winner1stPrize}
                        onChange={(e) => setWinner1stPrize(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* 2nd Place Selector */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Trophy className="w-4 h-4 text-slate-500" />
                    <span>2nd Place Winner (1st Runner Up)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Select Squad</label>
                      <select
                        value={winner2ndTeamId}
                        onChange={(e) => setWinner2ndTeamId(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none"
                      >
                        <option value="">-- Choose 2nd Place Team --</option>
                        {currentTeams.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.teamName} ({t.id}) - Statement: {t.problemStatementId}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Prize &amp; Offer</label>
                      <input
                        type="text"
                        value={winner2ndPrize}
                        onChange={(e) => setWinner2ndPrize(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* 3rd Place Selector */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                    <Trophy className="w-4 h-4 text-amber-700" />
                    <span>3rd Place Winner (2nd Runner Up)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Select Squad</label>
                      <select
                        value={winner3rdTeamId}
                        onChange={(e) => setWinner3rdTeamId(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none"
                      >
                        <option value="">-- Choose 3rd Place Team --</option>
                        {currentTeams.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.teamName} ({t.id}) - Statement: {t.problemStatementId}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Prize &amp; Offer</label>
                      <input
                        type="text"
                        value={winner3rdPrize}
                        onChange={(e) => setWinner3rdPrize(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/30 flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Trophy className="w-4 h-4" />
                    <span>Publish Winners &amp; Mark Hackathon as Completed</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      )}

      {/* Empty State when no hackathons exist */}
      {hackathons.length === 0 && (
        <div className="p-12 sm:p-16 rounded-3xl bg-white border border-dashed border-slate-300 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center shadow-xs">
            <Trophy className="w-8 h-8" />
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">No Hackathons Configured</h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            All hackathon events have been deleted. You can formulate a new sprint challenge at any time with problem statements and squad limits.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-primary text-xs px-6 py-3 rounded-xl font-bold inline-flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Hackathon</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CREATE NEW HACKATHON                              */}
      {/* ======================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">Create New Hackathon Event</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateHackathon} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hackathon Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CodeSprint 2026: Enterprise AI & Agentic Systems"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Short Tagline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Build autonomous agents & cloud systems."
                  value={createForm.tagline}
                  onChange={(e) => setCreateForm({ ...createForm, tagline: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Technical Theme</label>
                  <input
                    type="text"
                    value={createForm.theme}
                    onChange={(e) => setCreateForm({ ...createForm, theme: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fixed Entry Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={createForm.entryFee}
                    onChange={(e) => setCreateForm({ ...createForm, entryFee: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              {/* Hackathon Logo Input (URL, Google Drive, or File Upload) */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Image className="w-3.5 h-3.5 text-blue-600" />
                    <span>Hackathon Custom Logo</span>
                  </label>
                  <div className="flex items-center gap-1 p-0.5 bg-slate-200 rounded-lg text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setCreateForm({ ...createForm, logoInputMode: 'link' })}
                      className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                        createForm.logoInputMode === 'link' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Link / Google Drive
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreateForm({ ...createForm, logoInputMode: 'upload' })}
                      className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                        createForm.logoInputMode === 'upload' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Upload File
                    </button>
                  </div>
                </div>

                {createForm.logoInputMode === 'link' ? (
                  <div>
                    <input
                      type="url"
                      placeholder="Paste direct image URL or Google Drive share link (e.g. drive.google.com/file/d/...)"
                      value={createForm.logoUrl}
                      onChange={(e) => setCreateForm({ ...createForm, logoUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Google Drive links (public/anyone with link) are automatically converted into direct embeddable images.
                    </p>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileUpload}
                      className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                    />
                  </div>
                )}

                {/* Logo Live Preview */}
                {createForm.logoUrl && (
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-300 p-1 flex items-center justify-center overflow-hidden shrink-0">
                      <img
                        src={formatHackathonLogoUrl(createForm.logoUrl)}
                        alt="Logo Preview"
                        className="w-full h-full object-contain"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-slate-700 block">Logo Ready &amp; Verified</span>
                      <button
                        type="button"
                        onClick={() => setCreateForm({ ...createForm, logoUrl: '' })}
                        className="text-[11px] text-red-600 hover:underline font-semibold cursor-pointer"
                      >
                        Remove Logo
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Description</label>
                <textarea
                  rows={3}
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">Registration Deadline</label>
                  <input
                    type="datetime-local"
                    value={createForm.registrationDeadline}
                    onChange={(e) => setCreateForm({ ...createForm, registrationDeadline: e.target.value })}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">Statement Locking Cutoff</label>
                  <input
                    type="datetime-local"
                    value={createForm.statementLockDeadline}
                    onChange={(e) => setCreateForm({ ...createForm, statementLockDeadline: e.target.value })}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">Kickoff Start Time</label>
                  <input
                    type="datetime-local"
                    value={createForm.kickoffTime}
                    onChange={(e) => setCreateForm({ ...createForm, kickoffTime: e.target.value })}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">Submission Deadline</label>
                  <input
                    type="datetime-local"
                    value={createForm.submissionDeadline}
                    onChange={(e) => setCreateForm({ ...createForm, submissionDeadline: e.target.value })}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-[11px]"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs px-5 py-2 rounded-xl font-bold cursor-pointer"
                >
                  Create &amp; Proceed to Next Steps
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD PROBLEM STATEMENT                             */}
      {/* ======================================================== */}
      {isAddStatementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">Add Problem Statement</h3>
              <button onClick={() => setIsAddStatementModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddStatement} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Statement Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Autonomous Multi-Agent ERP Reconciliation Engine"
                  value={statementForm.title}
                  onChange={(e) => setStatementForm({ ...statementForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Track / Domain *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Agentic AI, Cyber Security, Distributed Systems"
                  value={statementForm.track}
                  onChange={(e) => setStatementForm({ ...statementForm, track: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Public Summary (Visible on Registration)</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Short briefing for teams choosing their topic..."
                  value={statementForm.summary}
                  onChange={(e) => setStatementForm({ ...statementForm, summary: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Complete Problem Statement Details (Unlocks on Kickoff)</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detailed architecture guidelines, expected JSON output, data structures..."
                  value={statementForm.fullDetails}
                  onChange={(e) => setStatementForm({ ...statementForm, fullDetails: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Evaluation Criteria &amp; Rules</label>
                <input
                  type="text"
                  placeholder="e.g. Architecture (30%), Inference Speed (40%), UI (30%)"
                  value={statementForm.evaluationCriteria}
                  onChange={(e) => setStatementForm({ ...statementForm, evaluationCriteria: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Starter GitHub Repo URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://github.com/sakith-harvan/starter-repo"
                  value={statementForm.starterRepoUrl}
                  onChange={(e) => setStatementForm({ ...statementForm, starterRepoUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddStatementModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs px-5 py-2 rounded-xl font-bold cursor-pointer"
                >
                  Save Problem Statement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

