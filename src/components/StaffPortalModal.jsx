import React, { useState, useEffect } from 'react';
import { 
  Users, UserCheck, Briefcase, GraduationCap, Calendar, CheckCircle2, 
  Clock, ArrowRight, X, Sparkles, Edit3, Link as LinkIcon, AlertCircle, 
  TrendingUp, Check, RefreshCw, FileText, ChevronRight, LogOut, ShieldAlert,
  Search, Award, Layers, Shield
} from 'lucide-react';
import { Logo } from './Logo';
import { INITIAL_TEAM_MEMBERS, INITIAL_ASSIGNED_TASKS } from '../data/defaultData';
import { 
  fetchTeamMembersFromSupabase, 
  fetchTasksFromSupabase, 
  saveTaskToSupabase, 
  updateTaskInSupabase,
  supabase
} from '../lib/supabaseClient';

export const StaffPortalModal = ({ isOpen, onClose, initialRole = 'employee', onOpenAdmin }) => {
  // roleMode: 'employee' or 'intern'
  const [roleMode, setRoleMode] = useState(initialRole);
  const [memberIdInput, setMemberIdInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authenticatedMember, setAuthenticatedMember] = useState(null);

  // Data states
  const [teamMembers, setTeamMembers] = useState([]);
  const [tasks, setTasks] = useState([]);

  // Active editing task for work update
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [workUpdateForm, setWorkUpdateForm] = useState({
    status: 'In Progress',
    progress: 0,
    completedWorkNotes: '',
    completedDate: '',
    deliverableUrl: ''
  });
  const [updateSuccessMsg, setUpdateSuccessMsg] = useState('');
  const [taskFilter, setTaskFilter] = useState('All'); // 'All', 'In Progress', 'Completed'

  // Sync roleMode when initialRole prop changes
  useEffect(() => {
    if (initialRole) {
      setRoleMode(initialRole);
    }
  }, [initialRole]);

  // Load storage & database data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Listen to cross-window and real-time updates
  useEffect(() => {
    const handleTasksUpdate = () => {
      loadData();
    };
    window.addEventListener('sh_tasks_updated', handleTasksUpdate);
    window.addEventListener('sh_team_updated', handleTasksUpdate);

    // Supabase realtime subscription
    const channel = supabase
      .channel('public_staff_tasks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'assigned_tasks' },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('sh_tasks_updated', handleTasksUpdate);
      window.removeEventListener('sh_team_updated', handleTasksUpdate);
      supabase.removeChannel(channel);
    };
  }, []);

  const loadData = () => {
    // 1. Team Members
    const storedMembers = localStorage.getItem('sh_team_members');
    if (storedMembers) {
      try {
        setTeamMembers(JSON.parse(storedMembers));
      } catch (e) {
        setTeamMembers(INITIAL_TEAM_MEMBERS);
      }
    } else {
      setTeamMembers(INITIAL_TEAM_MEMBERS);
      localStorage.setItem('sh_team_members', JSON.stringify(INITIAL_TEAM_MEMBERS));
    }

    // 2. Assigned Tasks
    const storedTasks = localStorage.getItem('sh_assigned_tasks');
    if (storedTasks) {
      try {
        setTasks(JSON.parse(storedTasks));
      } catch (e) {
        setTasks(INITIAL_ASSIGNED_TASKS);
      }
    } else {
      setTasks(INITIAL_ASSIGNED_TASKS);
      localStorage.setItem('sh_assigned_tasks', JSON.stringify(INITIAL_ASSIGNED_TASKS));
    }

    // Cloud fetch
    fetchTeamMembersFromSupabase().then((dbMembers) => {
      if (dbMembers && dbMembers.length > 0) {
        setTeamMembers(dbMembers);
        localStorage.setItem('sh_team_members', JSON.stringify(dbMembers));
      }
    });

    fetchTasksFromSupabase().then((dbTasks) => {
      if (dbTasks && dbTasks.length > 0) {
        setTasks(dbTasks);
        localStorage.setItem('sh_assigned_tasks', JSON.stringify(dbTasks));
      }
    });
  };

  // Login handler
  const handleLogin = (e) => {
    if (e) e.preventDefault();
    setAuthError('');
    const cleanId = (memberIdInput || '').trim().toUpperCase();

    if (!cleanId) {
      setAuthError('Please enter your Member ID.');
      return;
    }

    // Check in team members list
    const currentMembers = teamMembers.length > 0 ? teamMembers : INITIAL_TEAM_MEMBERS;
    const found = currentMembers.find(
      (m) => m.id.toUpperCase() === cleanId
    );

    if (found) {
      // Check if type matches or allow login seamlessly
      setAuthenticatedMember(found);
      setRoleMode(found.type?.toLowerCase() === 'intern' ? 'intern' : 'employee');
      setAuthError('');
    } else {
      setAuthError(`Member ID "${cleanId}" not found. Please verify your ID or ask Admin to register you.`);
    }
  };

  const handleQuickSelectMember = (member) => {
    setMemberIdInput(member.id);
    setAuthenticatedMember(member);
    setRoleMode(member.type?.toLowerCase() === 'intern' ? 'intern' : 'employee');
    setAuthError('');
  };

  const handleLogout = () => {
    setAuthenticatedMember(null);
    setMemberIdInput('');
    setEditingTaskId(null);
    setAuthError('');
  };

  // Start editing a task
  const handleStartUpdate = (task) => {
    setEditingTaskId(task.id);
    setWorkUpdateForm({
      status: task.status || 'In Progress',
      progress: task.progress || 0,
      completedWorkNotes: task.completedWorkNotes || '',
      completedDate: task.completedDate || (task.status === 'Completed' ? new Date().toISOString().split('T')[0] : ''),
      deliverableUrl: task.deliverableUrl || ''
    });
  };

  // Save work update
  const handleSaveWorkUpdate = (taskId) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const finalCompletedDate = workUpdateForm.status === 'Completed' 
      ? (workUpdateForm.completedDate || todayStr) 
      : workUpdateForm.completedDate;

    const updatedTasks = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          status: workUpdateForm.status,
          progress: Number(workUpdateForm.progress),
          completedWorkNotes: workUpdateForm.completedWorkNotes,
          completedDate: finalCompletedDate,
          deliverableUrl: workUpdateForm.deliverableUrl,
          lastUpdated: new Date().toISOString()
        };
      }
      return t;
    });

    setTasks(updatedTasks);
    localStorage.setItem('sh_assigned_tasks', JSON.stringify(updatedTasks));
    window.dispatchEvent(new Event('sh_tasks_updated'));

    // Sync to Supabase
    updateTaskInSupabase(taskId, {
      status: workUpdateForm.status,
      progress: Number(workUpdateForm.progress),
      completedWorkNotes: workUpdateForm.completedWorkNotes,
      completedDate: finalCompletedDate,
      deliverableUrl: workUpdateForm.deliverableUrl
    });

    setEditingTaskId(null);
    setUpdateSuccessMsg('Work progress successfully updated and recorded!');
    setTimeout(() => setUpdateSuccessMsg(''), 4000);
  };

  if (!isOpen) return null;

  // Filter tasks for the logged in member
  const memberTasks = authenticatedMember
    ? tasks.filter(
        (t) => (t.memberId || '').toUpperCase() === (authenticatedMember.id || '').toUpperCase()
      )
    : [];

  const filteredMemberTasks = memberTasks.filter((t) => {
    if (taskFilter === 'In Progress') return t.status === 'In Progress' || t.status === 'Assigned';
    if (taskFilter === 'Completed') return t.status === 'Completed';
    return true;
  });

  const completedCount = memberTasks.filter((t) => t.status === 'Completed').length;
  const inProgressCount = memberTasks.filter((t) => t.status === 'In Progress' || t.status === 'Assigned').length;
  const overallAvgProgress = memberTasks.length > 0 
    ? Math.round(memberTasks.reduce((acc, curr) => acc + (Number(curr.progress) || 0), 0) / memberTasks.length)
    : 0;

  // Available sample members for role mode
  const currentMembersList = teamMembers.length > 0 ? teamMembers : INITIAL_TEAM_MEMBERS;
  const filteredQuickList = currentMembersList.filter(
    (m) => (roleMode === 'intern' ? m.type === 'Intern' : m.type === 'Employee')
  );

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex flex-col min-h-screen w-full overflow-hidden text-slate-100 font-sans animate-in fade-in duration-300">
      {/* Top Header Bar */}
      <header className="px-6 py-4 bg-slate-900/80 border-b border-white/10 flex items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <div className="h-5 w-[1px] bg-white/20 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
              roleMode === 'intern' 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
            }`}>
              {roleMode === 'intern' ? <GraduationCap className="w-3.5 h-3.5" /> : <Briefcase className="w-3.5 h-3.5" />}
              <span>{roleMode === 'intern' ? 'Intern Work Portal' : 'Employee Work Portal'}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {authenticatedMember && (
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-red-950/60 text-slate-300 hover:text-rose-400 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out ({authenticatedMember.id})</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-slate-950 p-4 sm:p-8 relative">
        {/* Background Ambience */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />

        {!authenticatedMember ? (
          /* =================================================================== */
          /* LOGIN SCREEN: EMPLOYEE / INTERN ID LOGIN                            */
          /* =================================================================== */
          <div className="max-w-lg mx-auto my-auto pt-8 pb-16 space-y-8 z-10 relative">
            {/* Mode Switcher Tabs */}
            <div className="flex rounded-2xl bg-slate-900/90 p-1.5 border border-white/10 shadow-lg">
              <button
                onClick={() => {
                  setRoleMode('employee');
                  setAuthError('');
                }}
                className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  roleMode === 'employee'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Employee Login</span>
              </button>

              <button
                onClick={() => {
                  setRoleMode('intern');
                  setAuthError('');
                }}
                className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  roleMode === 'intern'
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Intern Login</span>
              </button>
            </div>

            {/* Login Card */}
            <div className={`glass-card p-8 rounded-3xl border shadow-2xl space-y-6 text-center ${
              roleMode === 'intern' ? 'border-amber-500/30 shadow-amber-950/20' : 'border-blue-500/30 shadow-blue-950/20'
            }`}>
              <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center mx-auto shadow-lg ${
                roleMode === 'intern'
                  ? 'bg-amber-950/60 border-amber-500/40 text-amber-400 shadow-amber-500/20'
                  : 'bg-blue-950/60 border-blue-500/40 text-cyan-400 shadow-blue-500/20'
              }`}>
                {roleMode === 'intern' ? (
                  <GraduationCap className="w-8 h-8 animate-pulse" />
                ) : (
                  <Briefcase className="w-8 h-8 animate-pulse" />
                )}
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold text-white tracking-tight">
                  {roleMode === 'intern' ? 'Intern Work Dashboard' : 'Employee Work Dashboard'}
                </h2>
                <p className="text-xs text-slate-400">
                  Enter your registered ID to view assigned tasks and update work progress.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4 pt-2">
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold text-slate-300">
                    {roleMode === 'intern' ? 'Intern ID *' : 'Employee ID *'}
                  </label>
                  <div className="relative">
                    <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={memberIdInput}
                      onChange={(e) => {
                        setMemberIdInput(e.target.value);
                        setAuthError('');
                      }}
                      placeholder={roleMode === 'intern' ? 'e.g. INT-201' : 'e.g. EMP-101'}
                      className="form-input pl-10 uppercase font-mono tracking-wider text-sm font-semibold border-white/20 focus:border-cyan-400"
                      autoFocus
                    />
                  </div>
                  {authError && (
                    <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                      <span>{authError}</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className={`w-full py-3.5 rounded-xl text-sm font-bold text-white shadow-xl flex items-center justify-center gap-2 transition-all transform active:scale-98 ${
                    roleMode === 'intern'
                      ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 shadow-amber-600/30'
                      : 'btn-primary'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Log In to {roleMode === 'intern' ? 'Intern' : 'Employee'} Portal</span>
                </button>
              </form>

              {/* Quick Select Chips for Faster Testing */}
              <div className="pt-4 border-t border-white/10 space-y-2.5 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Quick Select Active {roleMode === 'intern' ? 'Interns' : 'Employees'}:
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono">1-Click Auto Login</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredQuickList.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleQuickSelectMember(m)}
                      className="p-2.5 rounded-xl bg-slate-900/90 border border-white/10 hover:border-cyan-400/60 hover:bg-slate-800 text-left transition-all flex items-center justify-between group"
                    >
                      <div className="truncate pr-2">
                        <div className="text-xs font-bold text-white group-hover:text-cyan-400 truncate">
                          {m.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">{m.id} • {m.role}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Admin note */}
              <div className="pt-2 text-center text-xs text-slate-400">
                <span>Not added yet? Contact the main admin or </span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenAdmin) onOpenAdmin();
                  }}
                  className="text-cyan-400 hover:underline font-semibold"
                >
                  Open Admin Portal
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* =================================================================== */
          /* LOGGED IN WORK DASHBOARD VIEW                                      */
          /* =================================================================== */
          <div className="max-w-6xl mx-auto space-y-6 pb-16 z-10 relative">
            {/* Success Toast */}
            {updateSuccessMsg && (
              <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xl animate-in slide-in-from-top duration-300">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>{updateSuccessMsg}</span>
                </div>
                <button onClick={() => setUpdateSuccessMsg('')} className="text-emerald-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Profile & Performance Header Card */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center text-2xl font-bold shadow-lg ${
                  authenticatedMember.type === 'Intern'
                    ? 'bg-amber-950/70 border-amber-500/50 text-amber-400 shadow-amber-500/20'
                    : 'bg-blue-950/70 border-blue-500/50 text-cyan-400 shadow-blue-500/20'
                }`}>
                  {authenticatedMember.name ? authenticatedMember.name.charAt(0) : 'U'}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                      {authenticatedMember.name}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full font-mono text-xs font-bold bg-slate-800 border border-white/20 text-cyan-400">
                      {authenticatedMember.id}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      authenticatedMember.type === 'Intern'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    }`}>
                      {authenticatedMember.type}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium">
                    {authenticatedMember.role}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Registered with Sakith Harvan Technologies • Joined: {authenticatedMember.joinedDate || 'Active'}
                  </p>
                </div>
              </div>

              {/* Progress Summary Bar */}
              <div className="w-full md:w-auto flex items-center gap-4 bg-slate-950/60 p-4 rounded-2xl border border-white/10">
                <div className="text-center px-3">
                  <div className="text-xl sm:text-2xl font-extrabold text-white">{memberTasks.length}</div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Total Tasks</div>
                </div>
                <div className="h-8 w-[1px] bg-white/10" />
                <div className="text-center px-3">
                  <div className="text-xl sm:text-2xl font-extrabold text-amber-400">{inProgressCount}</div>
                  <div className="text-[10px] text-amber-400/80 font-semibold uppercase">In Progress</div>
                </div>
                <div className="h-8 w-[1px] bg-white/10" />
                <div className="text-center px-3">
                  <div className="text-xl sm:text-2xl font-extrabold text-emerald-400">{completedCount}</div>
                  <div className="text-[10px] text-emerald-400/80 font-semibold uppercase">Completed</div>
                </div>
              </div>
            </div>

            {/* Task Controls & Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <span>My Assigned Work &amp; Deliverables</span>
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 text-xs font-mono font-bold">
                  {memberTasks.length}
                </span>
              </div>

              <div className="flex items-center gap-2 bg-slate-900/90 p-1 rounded-xl border border-white/10">
                {['All', 'In Progress', 'Completed'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setTaskFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      taskFilter === f
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Tasks List */}
            {filteredMemberTasks.length === 0 ? (
              <div className="glass-card p-12 rounded-3xl border border-white/10 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center mx-auto text-slate-500">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">No tasks currently under "{taskFilter}"</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    New work assigned by the Main Admin will appear here instantly.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMemberTasks.map((task) => {
                  const isEditing = editingTaskId === task.id;

                  return (
                    <div
                      key={task.id}
                      className={`glass-card rounded-3xl border transition-all duration-300 overflow-hidden ${
                        task.status === 'Completed'
                          ? 'border-emerald-500/30 bg-gradient-to-br from-slate-900 via-emerald-950/10 to-slate-900'
                          : 'border-blue-500/30 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950'
                      }`}
                    >
                      {/* Task Header Details */}
                      <div className="p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-bold text-cyan-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-white/10">
                                {task.id}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                task.priority === 'High' 
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              }`}>
                                Priority: {task.priority || 'Medium'}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                                task.status === 'Completed'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                              }`}>
                                {task.status === 'Completed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                <span>{task.status}</span>
                              </span>
                            </div>
                            <h4 className="text-lg font-bold text-white pt-1">{task.title}</h4>
                          </div>

                          {/* KEY REQUIREMENT: Show Date of Assigned Work & Due Date */}
                          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                            <div className="bg-slate-950/80 border border-cyan-500/30 px-3.5 py-1.5 rounded-xl text-left">
                              <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>Date of Assigned Work</span>
                              </div>
                              <div className="text-xs font-mono font-bold text-white">
                                {task.assignedDate || '2026-08-28'}
                              </div>
                            </div>

                            {task.dueDate && (
                              <div className="bg-slate-950/80 border border-amber-500/30 px-3.5 py-1.5 rounded-xl text-left">
                                <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>Deadline / Due Date</span>
                                </div>
                                <div className="text-xs font-mono font-bold text-white">
                                  {task.dueDate}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Task Description */}
                        <div className="space-y-1.5">
                          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Work Description &amp; Requirements:
                          </div>
                          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950/40 p-3.5 rounded-xl border border-white/5">
                            {task.description || 'Complete the assigned technical deliverables and update progress here.'}
                          </p>
                        </div>

                        {/* Present Completed Work Summary (Read Mode) */}
                        {!isEditing && (
                          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-3">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white">Present Completed Work:</span>
                                <span className="text-xs font-mono font-extrabold text-cyan-400">
                                  {task.progress || 0}% Done
                                </span>
                              </div>

                              {task.completedDate && (
                                <div className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Present Completed Date: {task.completedDate}</span>
                                </div>
                              )}
                            </div>

                            {/* Progress Visual Bar */}
                            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-white/10">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  task.status === 'Completed'
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                                    : 'bg-gradient-to-r from-blue-600 to-cyan-400'
                                }`}
                                style={{ width: `${task.progress || 0}%` }}
                              />
                            </div>

                            {/* Completed Work Notes */}
                            {task.completedWorkNotes ? (
                              <div className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-white/5">
                                <span className="font-semibold text-slate-400 block pb-1">Work Update Notes:</span>
                                {task.completedWorkNotes}
                              </div>
                            ) : (
                              <div className="text-xs text-slate-500 italic">
                                No work progress notes submitted yet. Click "Update Work" below.
                              </div>
                            )}

                            {/* Deliverable URL */}
                            {task.deliverableUrl && (
                              <div className="pt-1">
                                <a
                                  href={task.deliverableUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold hover:underline bg-cyan-950/40 border border-cyan-500/30 px-3 py-1.5 rounded-lg"
                                >
                                  <LinkIcon className="w-3.5 h-3.5" />
                                  <span>View Submitted Deliverable / Link</span>
                                </a>
                              </div>
                            )}

                            {/* Action Button */}
                            <div className="pt-2 flex justify-end">
                              <button
                                onClick={() => handleStartUpdate(task)}
                                className="btn-primary text-xs py-2 px-4 flex items-center gap-2"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Update My Work Progress</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* =================================================================== */}
                        {/* PRESENT WORK UPDATION FORM (Edit Mode)                              */}
                        {/* =================================================================== */}
                        {isEditing && (
                          <div className="p-5 rounded-2xl bg-slate-900 border border-cyan-500/40 space-y-4 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between border-b border-white/10 pb-3">
                              <h5 className="text-sm font-bold text-white flex items-center gap-2">
                                <Edit3 className="w-4 h-4 text-cyan-400" />
                                <span>Update Assigned Work &amp; Present Status</span>
                              </h5>
                              <button
                                onClick={() => setEditingTaskId(null)}
                                className="text-slate-400 hover:text-white text-xs"
                              >
                                Cancel
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {/* Status */}
                              <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-slate-300">
                                  Present Work Status *
                                </label>
                                <select
                                  value={workUpdateForm.status}
                                  onChange={(e) => {
                                    const nextStatus = e.target.value;
                                    setWorkUpdateForm({
                                      ...workUpdateForm,
                                      status: nextStatus,
                                      progress: nextStatus === 'Completed' ? 100 : workUpdateForm.progress,
                                      completedDate: nextStatus === 'Completed' ? new Date().toISOString().split('T')[0] : workUpdateForm.completedDate
                                    });
                                  }}
                                  className="form-input text-xs"
                                >
                                  <option value="In Progress">In Progress (Ongoing)</option>
                                  <option value="Under Review">Under Review (Ready for review)</option>
                                  <option value="Completed">Completed (100% Finished)</option>
                                </select>
                              </div>

                              {/* Progress Slider */}
                              <div className="space-y-1.5">
                                <div className="flex justify-between items-center text-xs">
                                  <label className="font-semibold text-slate-300">Completed Work %</label>
                                  <span className="font-mono font-bold text-cyan-400">{workUpdateForm.progress}%</span>
                                </div>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  step="5"
                                  value={workUpdateForm.progress}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setWorkUpdateForm({
                                      ...workUpdateForm,
                                      progress: val,
                                      status: val === 100 ? 'Completed' : (val > 0 ? 'In Progress' : 'Assigned'),
                                      completedDate: val === 100 ? new Date().toISOString().split('T')[0] : workUpdateForm.completedDate
                                    });
                                  }}
                                  className="w-full accent-cyan-400 cursor-pointer"
                                />
                              </div>
                            </div>

                            {/* Completed Date */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-slate-300">
                                  Present Completed Date (or Update Date) *
                                </label>
                                <input
                                  type="date"
                                  value={workUpdateForm.completedDate}
                                  onChange={(e) => setWorkUpdateForm({ ...workUpdateForm, completedDate: e.target.value })}
                                  className="form-input text-xs font-mono"
                                />
                              </div>

                              {/* Deliverable Link */}
                              <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-slate-300">
                                  Deliverable Link / GitHub / PR / Demo (Optional)
                                </label>
                                <input
                                  type="url"
                                  value={workUpdateForm.deliverableUrl}
                                  onChange={(e) => setWorkUpdateForm({ ...workUpdateForm, deliverableUrl: e.target.value })}
                                  placeholder="https://github.com/... or https://figma.com/..."
                                  className="form-input text-xs"
                                />
                              </div>
                            </div>

                            {/* Detailed Work Notes */}
                            <div className="space-y-1.5">
                              <label className="block text-xs font-semibold text-slate-300">
                                Present Completed Work Summary &amp; Notes *
                              </label>
                              <textarea
                                rows={3}
                                value={workUpdateForm.completedWorkNotes}
                                onChange={(e) => setWorkUpdateForm({ ...workUpdateForm, completedWorkNotes: e.target.value })}
                                placeholder="Describe what you completed today, what is remaining, tests run, or staging details..."
                                className="form-input text-xs"
                              />
                            </div>

                            {/* Save Actions */}
                            <div className="flex items-center justify-end gap-3 pt-2">
                              <button
                                type="button"
                                onClick={() => setEditingTaskId(null)}
                                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
                              >
                                Cancel
                              </button>

                              <button
                                type="button"
                                onClick={() => handleSaveWorkUpdate(task.id)}
                                className="btn-primary text-xs py-2 px-5 font-bold flex items-center gap-2"
                              >
                                <Check className="w-4 h-4" />
                                <span>Save &amp; Submit Work Update</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
