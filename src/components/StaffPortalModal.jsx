import React, { useState, useEffect } from 'react';
import { 
  Users, UserCheck, Briefcase, GraduationCap, Calendar, CheckCircle2, 
  Clock, ArrowRight, X, Sparkles, Edit3, Link as LinkIcon, AlertCircle, 
  TrendingUp, Check, RefreshCw, FileText, ChevronRight, LogOut, ShieldAlert,
  Search, Award, Layers, Shield, Plus, Trash2, Crown, LayoutDashboard,
  Filter, CheckSquare
} from 'lucide-react';
import { Logo } from './Logo';
import { INITIAL_TEAM_MEMBERS, INITIAL_ASSIGNED_TASKS } from '../data/defaultData';
import { 
  fetchTeamMembersFromSupabase, 
  fetchTasksFromSupabase, 
  saveTaskToSupabase, 
  updateTaskInSupabase,
  deleteTaskFromSupabase,
  saveTeamMemberToSupabase,
  deleteTeamMemberFromSupabase,
  supabase
} from '../lib/supabaseClient';
import { useTask } from '../lib/taskStore';

export const StaffPortalModal = ({ isOpen, onClose, initialRole = 'employee', initialUser = null, onOpenAdmin }) => {
  const { tasks, addTask, updateTask, removeTask, setAllTasks } = useTask();
  // roleMode: 'founder', 'employee', or 'intern'
  const [roleMode, setRoleMode] = useState(initialRole);
  const [memberIdInput, setMemberIdInput] = useState('');
  const [memberPasswordInput, setMemberPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authenticatedMember, setAuthenticatedMember] = useState(null);

  // Founder & CEO Executive Tab State ('overview', 'manage_staff', 'all_tasks', 'my_tasks')
  const [founderTab, setFounderTab] = useState('manage_staff');
  const [founderStaffFilter, setFounderStaffFilter] = useState('all'); // 'all', 'employees', 'interns'

  // Member Tab State ('dashboard', 'tasks', 'performance', 'assessment', 'submissions', 'profile')
  const [memberTab, setMemberTab] = useState('dashboard');

  // Name editing state
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameInput, setEditNameInput] = useState('');

  // Assessment and Submissions state
  const [assessments, setAssessments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [batches, setBatches] = useState([]);
  const [isTakingQuiz, setIsTakingQuiz] = useState(false);
  const [quizForm, setQuizForm] = useState({
    title: 'Sakith Harvan Core Engineering & AI Benchmark Quiz',
    category: 'Full Stack & AI/ML',
    q1: '',
    q2: '',
    q3: ''
  });
  const [isSubmittingWork, setIsSubmittingWork] = useState(false);
  const [newSubmissionForm, setNewSubmissionForm] = useState({
    title: '',
    taskRef: '',
    deliverableUrl: '',
    type: 'GitHub Pull Request / Repository',
    notes: ''
  });

  // Data states
  const [teamMembers, setTeamMembers] = useState([]);
  // tasks are managed via TaskProvider context

  // Modals for Founder/CEO staff & work management
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [memberFormData, setMemberFormData] = useState({
    id: '',
    name: '',
    role: '',
    type: 'Employee',
    email: '',
    phone: '',
    batch: 'Batch 2026-Alpha (AI & ML)'
  });

  const [isAssigningTask, setIsAssigningTask] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    id: '',
    memberId: '',
    title: '',
    description: '',
    assignedDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    priority: 'High'
  });

  // Active editing task for staff work update
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

  // Auto-authenticate when an initialUser is passed from AdminPortalModal
  useEffect(() => {
    if (isOpen && initialUser) {
      setAuthenticatedMember(initialUser);
      setEditNameInput(initialUser.name || '');
      setMemberTab('dashboard');
      if (initialUser.isExecutive || initialUser.type?.includes('Founder') || initialUser.type?.includes('CEO')) {
        setRoleMode('founder');
      } else {
        setRoleMode(initialUser.type?.toLowerCase() === 'intern' ? 'intern' : 'employee');
      }
      setAuthError('');
    }
  }, [isOpen, initialUser]);

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
    window.addEventListener('sh_batches_updated', handleTasksUpdate);

    // Supabase realtime subscription
    let channel = null;
    try {
      const channelId = `staff_portal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      channel = supabase
        .channel(channelId)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'assigned_tasks' },
          () => {
            loadData();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'team_members' },
          () => {
            loadData();
          }
        )
        .subscribe();
    } catch (e) {
      console.warn('Realtime subscription error in StaffPortalModal:', e);
    }

    return () => {
      window.removeEventListener('sh_tasks_updated', handleTasksUpdate);
      window.removeEventListener('sh_team_updated', handleTasksUpdate);
      window.removeEventListener('sh_batches_updated', handleTasksUpdate);
      if (channel) {
        try { supabase.removeChannel(channel); } catch (e) {}
      }
    };
  }, [authenticatedMember]);

  const loadData = () => {
    const deletedIds = JSON.parse(localStorage.getItem('sh_deleted_members') || '[]');

    // 1. Team Members
    const storedMembers = localStorage.getItem('sh_team_members');
    if (storedMembers) {
      try {
        const parsed = JSON.parse(storedMembers).filter((m) => !deletedIds.includes(m.id));
        setTeamMembers(parsed);
      } catch (e) {
        setTeamMembers([]);
      }
    } else {
      setTeamMembers([]);
    }

    // 2. Assigned Tasks are managed via TaskProvider context; no local storage sync needed here.

    // 3. Batches
    const storedBatches = localStorage.getItem('sh_intern_batches');
    if (storedBatches) {
      try {
        setBatches(JSON.parse(storedBatches));
      } catch (e) {
        setBatches(INITIAL_BATCHES);
      }
    } else {
      setBatches(INITIAL_BATCHES);
      localStorage.setItem('sh_intern_batches', JSON.stringify(INITIAL_BATCHES));
    }

    // 4. Assessments
    const storedAssessments = localStorage.getItem('sh_intern_assessments');
    if (storedAssessments) {
      try {
        setAssessments(JSON.parse(storedAssessments));
      } catch (e) {
        setAssessments(INITIAL_ASSESSMENTS);
      }
    } else {
      setAssessments(INITIAL_ASSESSMENTS);
      localStorage.setItem('sh_intern_assessments', JSON.stringify(INITIAL_ASSESSMENTS));
    }

    // 5. Submissions
    const storedSubmissions = localStorage.getItem('sh_intern_submissions');
    if (storedSubmissions) {
      try {
        setSubmissions(JSON.parse(storedSubmissions));
      } catch (e) {
        setSubmissions(INITIAL_SUBMISSIONS);
      }
    } else {
      setSubmissions(INITIAL_SUBMISSIONS);
      localStorage.setItem('sh_intern_submissions', JSON.stringify(INITIAL_SUBMISSIONS));
    }

    // Cloud fetch
    fetchTeamMembersFromSupabase().then((dbMembers) => {
      const dbArr = dbMembers || [];
      setTeamMembers(dbArr);
      localStorage.setItem('sh_team_members', JSON.stringify(dbArr));
    });

    fetchTasksFromSupabase().then((dbTasks) => {
      if (dbTasks && dbTasks.length > 0) {
        setAllTasks(dbTasks);
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
      setAuthError('Please enter your ID.');
      return;
    }
    const cleanPass = (memberPasswordInput || '').trim();

    // Check special Founder / CEO keys
    if (cleanId === 'CEO' || cleanId === 'FOUNDER' || cleanId === '2526' || cleanId === 'SAKITH2026' || cleanId === 'ADMIN') {
      const founderMember = teamMembers.find(m => m.id === 'CEO-01') || {
        id: 'CEO-01',
        name: 'Maddi Harshavardhan',
        role: 'Co-Founder & CEO / Technical Lead',
        type: 'Founder & CEO',
        isExecutive: true,
        batch: 'Executive Leadership'
      };
      setAuthenticatedMember(founderMember);
      setRoleMode('founder');
      setMemberTab('dashboard');
      setAuthError('');
      return;
    }

    // Check in team members list
    const currentMembers = teamMembers;
    const found = currentMembers.find(
      (m) => m.id.toUpperCase() === cleanId
    );

    if (found) {
      if (found.type?.toLowerCase() === 'intern' && cleanPass !== 'shtsa@2026') {
        setAuthError('Incorrect password for Intern login.');
        return;
      }
      setAuthenticatedMember(found);
      setEditNameInput(found.name || '');
      setMemberTab('dashboard');
      if (found.isExecutive || found.type?.includes('Founder') || found.type?.includes('CEO')) {
        setRoleMode('founder');
      } else {
        setRoleMode(found.type?.toLowerCase() === 'intern' ? 'intern' : 'employee');
      }
      setAuthError('');
    } else {
      setAuthError(`ID "${cleanId}" not recognized. Please verify or ask Admin/CEO.`);
    }
  };

  const handleQuickSelectMember = (member) => {
    setMemberIdInput(member.id);
    setAuthenticatedMember(member);
    setEditNameInput(member.name || '');
    setMemberTab('dashboard');
    if (member.isExecutive || member.type?.includes('Founder') || member.type?.includes('CEO')) {
      setRoleMode('founder');
    } else {
      setRoleMode(member.type?.toLowerCase() === 'intern' ? 'intern' : 'employee');
    }
    setAuthError('');
  };

  const handleLogout = () => {
    setAuthenticatedMember(null);
    setMemberIdInput('');
    setMemberPasswordInput('');
    setAuthError('');
    setEditingTaskId(null);
    setUpdateSuccessMsg('');
  };

  // Intern / Employee: Modify Name handler
  const handleSaveModifiedName = (e) => {
    if (e) e.preventDefault();
    const cleanName = (editNameInput || '').trim();
    if (!cleanName) {
      alert('Please enter a valid name.');
      return;
    }

    if (!authenticatedMember) return;

    // Update in team members
    const updatedMembers = teamMembers.map((m) => {
      if (m.id === authenticatedMember.id) {
        return { ...m, name: cleanName };
      }
      return m;
    });

    // Also update member name in all existing tasks
    const updatedTasks = tasks.map((t) => {
      if (t.memberId === authenticatedMember.id) {
        return { ...t, memberName: cleanName };
      }
      return t;
    });

    setTeamMembers(updatedMembers);
    // Optionally persist to localStorage for fallback
    localStorage.setItem('sh_team_members', JSON.stringify(updatedMembers));

    // Update each modified task via context
    updatedTasks.forEach(t => updateTask(t.id, { memberName: cleanName }));

    const updatedAuth = { ...authenticatedMember, name: cleanName };
    setAuthenticatedMember(updatedAuth);

    // Sync member name to Supabase
    saveTeamMemberToSupabase(updatedAuth);
    // Sync updated tasks' memberName to Supabase for consistency across devices
    updatedTasks
      .filter((t) => t.memberId === authenticatedMember.id)
      .forEach((t) => {
        updateTaskInSupabase(t.id, { memberName: cleanName });
      });
    window.dispatchEvent(new Event('sh_team_updated'));
    window.dispatchEvent(new Event('sh_tasks_updated'));

    setIsEditingName(false);
    setUpdateSuccessMsg(`Name updated successfully to "${cleanName}"!`);
    setTimeout(() => setUpdateSuccessMsg(''), 4000);
  };

  // Staff: Start editing work
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

  // Staff: Save work update
  const handleSaveWorkUpdate = (taskId) => {
  // Restrict updates to only GitHub URL (deliverableUrl) and remarks (completedWorkNotes)
  const updatedFields = {
    deliverableUrl: workUpdateForm.deliverableUrl,
    completedWorkNotes: workUpdateForm.completedWorkNotes,
  };

  // Update Supabase with only the allowed fields
  updateTaskInSupabase(taskId, updatedFields);
  // Update task via context
  updateTask(taskId, updatedFields);

  window.dispatchEvent(new Event('sh_tasks_updated'));
  setEditingTaskId(null);
  setUpdateSuccessMsg(`Task ${taskId} updated (GitHub URL & remarks) and synced!`);
  setTimeout(() => setUpdateSuccessMsg(''), 4000);
};

  // Intern: Submit Quiz / Assessment
  const handleSubmitAssessmentQuiz = (e) => {
    e.preventDefault();
    if (!quizForm.q1 || !quizForm.q2) {
      alert('Please answer the quiz questions before submitting.');
      return;
    }

    const newAssessment = {
      id: 'ASM-' + Math.floor(100 + Math.random() * 900),
      memberId: authenticatedMember.id,
      title: quizForm.title,
      category: quizForm.category,
      score: 96,
      maxScore: 100,
      status: 'Passed',
      date: new Date().toISOString().split('T')[0],
      evaluator: 'Maddi Harshavardhan (Founder & CEO)',
      feedback: 'Excellent response clarity, accurate architecture understanding, and high score performance!'
    };

    const updated = [newAssessment, ...assessments];
    setAssessments(updated);
    localStorage.setItem('sh_intern_assessments', JSON.stringify(updated));
    setIsTakingQuiz(false);
    setUpdateSuccessMsg('Assessment Quiz completed and scored: 96/100 (Passed)!');
    setTimeout(() => setUpdateSuccessMsg(''), 5000);
  };

  // Intern: Submit Deliverable
  const handleSaveDeliverableSubmission = (e) => {
    e.preventDefault();
    if (!newSubmissionForm.title || !newSubmissionForm.deliverableUrl) {
      alert('Please provide a title and deliverable link.');
      return;
    }

    const newSub = {
      id: 'SUB-' + Math.floor(300 + Math.random() * 700),
      memberId: authenticatedMember.id,
      title: newSubmissionForm.title,
      taskRef: newSubmissionForm.taskRef || 'General Milestone',
      deliverableUrl: newSubmissionForm.deliverableUrl,
      type: newSubmissionForm.type,
      status: 'Under Review',
      submittedDate: new Date().toISOString().split('T')[0],
      reviewerRemarks: 'Pending Founder review. Notification sent to Sakith Harvan leadership.'
    };

    const updated = [newSub, ...submissions];
    setSubmissions(updated);
    localStorage.setItem('sh_intern_submissions', JSON.stringify(updated));
    setIsSubmittingWork(false);
    setNewSubmissionForm({
      title: '',
      taskRef: '',
      deliverableUrl: '',
      type: 'GitHub Pull Request / Repository',
      notes: ''
    });
    setUpdateSuccessMsg('Deliverable submitted successfully for Founder Review!');
    setTimeout(() => setUpdateSuccessMsg(''), 4000);
  };

  // Founder/CEO: Add Member handler
  const handleOpenAddMember = (type = 'Employee') => {
    const nextPrefix = type === 'Intern' ? 'INT-' : 'EMP-';
    const count = teamMembers.filter(m => m.type === type).length + 101;
    setMemberFormData({
      id: `${nextPrefix}${count}`,
      name: '',
      role: type === 'Intern' ? 'AI/ML Solutions Intern' : 'Senior Full Stack Engineer',
      type: type,
      email: '',
      phone: '',
      batch: type === 'Intern' ? 'Batch 2026-Alpha (AI & ML)' : 'Core Engineering Team'
    });
    setIsAddingMember(true);
  };

  const handleSaveMember = (e) => {
    e.preventDefault();
    if (!memberFormData.id || !memberFormData.name || !memberFormData.role) {
      alert('Please fill out Member ID, Name, and Role.');
      return;
    }

    const cleanId = memberFormData.id.trim().toUpperCase();
    const newMember = {
      ...memberFormData,
      id: cleanId,
      joinedDate: memberFormData.joinedDate || new Date().toISOString().split('T')[0],
      status: 'Active',
      performanceScore: memberFormData.type === 'Intern' ? 90 : 95
    };

    let updatedTeam = [];
    if (teamMembers.some(m => m.id.toUpperCase() === cleanId)) {
      updatedTeam = teamMembers.map(m => m.id.toUpperCase() === cleanId ? newMember : m);
    } else {
      updatedTeam = [newMember, ...teamMembers];
    }

    setTeamMembers(updatedTeam);
    localStorage.setItem('sh_team_members', JSON.stringify(updatedTeam));
    saveTeamMemberToSupabase(newMember);
    window.dispatchEvent(new Event('sh_team_updated'));
    setIsAddingMember(false);
    setUpdateSuccessMsg(`Successfully registered ${newMember.type} (${newMember.name})!`);
    setTimeout(() => setUpdateSuccessMsg(''), 4000);
  };

  const handleDeleteMember = (id) => {
    if (window.confirm(`Are you sure you want to remove team member ${id}?`)) {
      const deletedIds = JSON.parse(localStorage.getItem('sh_deleted_members') || '[]');
      if (!deletedIds.includes(id)) {
        deletedIds.push(id);
        localStorage.setItem('sh_deleted_members', JSON.stringify(deletedIds));
      }
      const updated = teamMembers.filter(m => m.id !== id);
      setTeamMembers(updated);
      localStorage.setItem('sh_team_members', JSON.stringify(updated));
      deleteTeamMemberFromSupabase(id);
      window.dispatchEvent(new Event('sh_team_updated'));
    }
  };

  // Founder/CEO: Assign Task handler
  const handleOpenAssignTask = (prefillMemberId = '') => {
    const nonFounders = teamMembers.filter(m => !m.isExecutive);
    const defaultMember = teamMembers.find(m => m.id === prefillMemberId) || nonFounders[0] || teamMembers[0] || { id: 'EMP-101' };
    setTaskFormData({
      id: 'TSK-' + Math.floor(1000 + Math.random() * 9000),
      memberId: defaultMember.id,
      title: '',
      description: '',
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      priority: 'High'
    });
    setIsAssigningTask(true);
  };

  const handleSaveAssignedTask = (e) => {
    e.preventDefault();
    if (!taskFormData.memberId || !taskFormData.title) {
      alert('Please select a team member and enter a task title.');
      return;
    }

    const member = teamMembers.find(m => m.id === taskFormData.memberId) || {
      name: 'Team Member',
      role: 'Staff',
      type: 'Employee',
      batch: 'Batch 2026-Alpha (AI & ML)'
    };

    const newTask = {
      id: taskFormData.id || ('TSK-' + Date.now()),
      memberId: taskFormData.memberId,
      memberName: member.name,
      memberRole: member.role,
      memberType: member.type,
      batch: member.batch || 'Batch 2026-Alpha (AI & ML)',
      title: taskFormData.title,
      description: taskFormData.description,
      assignedDate: taskFormData.assignedDate || new Date().toISOString().split('T')[0],
      dueDate: taskFormData.dueDate,
      priority: taskFormData.priority,
      status: 'Assigned',
      progress: 0,
      completedWorkNotes: '',
      completedDate: '',
      deliverableUrl: ''
    };

    addTask(newTask);
    window.dispatchEvent(new Event('sh_tasks_updated'));
    setIsAssigningTask(false);
    setUpdateSuccessMsg(`Work assigned to ${member.name} (${member.id}) with Date: ${newTask.assignedDate}!`);
    setTimeout(() => setUpdateSuccessMsg(''), 4000);
  };

  const handleDeleteTask = (id) => {
    if (window.confirm('Delete this assigned task record?')) {
      const updated = tasks.filter(t => t.id !== id);
      removeTask(id);
      window.dispatchEvent(new Event('sh_tasks_updated'));
    }
  };

  const handleFounderUpdateTaskStatus = (id, newStatus) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const updates = {
      status: newStatus,
      progress: newStatus === 'Completed' ? 100 : undefined,
      completedDate: newStatus === 'Completed' ? todayStr : undefined
    };
    updateTask(id, updates);
    window.dispatchEvent(new Event('sh_tasks_updated'));
  };

  if (!isOpen) return null;

  const isFounderUser = authenticatedMember?.isExecutive || 
    authenticatedMember?.type?.includes('Founder') || 
    authenticatedMember?.type?.includes('CEO');

  // Filter tasks for standard member view
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

  const totalTasksCount = memberTasks.length;
  const completedCount = memberTasks.filter((t) => t.status === 'Completed').length;
  const inProgressCount = memberTasks.filter((t) => t.status === 'In Progress' || t.status === 'Assigned' || t.status === 'Under Review').length;

  // Percentage of completion of task by given task
  const taskCompletionPercentage = totalTasksCount > 0 
    ? Math.round((completedCount / totalTasksCount) * 100) 
    : 0;

  // Average progress percentage across all tasks
  const avgTaskProgress = totalTasksCount > 0 
    ? Math.round(memberTasks.reduce((acc, t) => acc + (Number(t.progress) || 0), 0) / totalTasksCount) 
    : 0;

  // Member's specific assessments and submissions
  const memberAssessments = authenticatedMember 
    ? assessments.filter(a => (a.memberId || '').toUpperCase() === (authenticatedMember.id || '').toUpperCase()) 
    : [];

  const memberSubmissions = authenticatedMember 
    ? submissions.filter(s => (s.memberId || '').toUpperCase() === (authenticatedMember.id || '').toUpperCase()) 
    : [];

  // Member batch information
  const memberBatchName = authenticatedMember?.batch || (authenticatedMember?.type === 'Intern' ? 'Batch 2026-Alpha (AI & ML)' : 'Core Engineering Team');

  // Quick select lists
  const currentMembersList = teamMembers;
  const filteredQuickList = currentMembersList.filter((m) => {
    if (roleMode === 'founder') return m.isExecutive || m.type?.includes('Founder') || m.type?.includes('CEO');
    if (roleMode === 'intern') return m.type === 'Intern';
    return m.type === 'Employee' && !m.isExecutive;
  });

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex flex-col min-h-screen w-full overflow-hidden text-slate-100 font-sans animate-in fade-in duration-300">
      {/* Top Header Bar */}
      <header className="px-6 py-4 bg-slate-900/80 border-b border-white/10 flex items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <div className="h-5 w-[1px] bg-white/20 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
              isFounderUser || roleMode === 'founder'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : roleMode === 'intern' 
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                  : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
            }`}>
              {isFounderUser || roleMode === 'founder' ? (
                <Crown className="w-3.5 h-3.5 text-rose-400" />
              ) : roleMode === 'intern' ? (
                <GraduationCap className="w-3.5 h-3.5" />
              ) : (
                <Briefcase className="w-3.5 h-3.5" />
              )}
              <span>
                {isFounderUser || roleMode === 'founder'
                  ? 'Founder & CEO Executive Portal'
                  : roleMode === 'intern'
                    ? 'Intern Work Portal'
                    : 'Employee Work Portal'}
              </span>
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
          /* LOGIN SCREEN: FOUNDER / CEO / EMPLOYEE / INTERN LOGIN               */
          /* =================================================================== */
          <div className="max-w-xl mx-auto my-auto pt-4 pb-16 space-y-6 z-10 relative">
            {/* Mode Switcher 3-Tabs */}
            <div className="flex rounded-2xl bg-slate-900/90 p-1.5 border border-white/10 shadow-lg">
              <button
                onClick={() => {
                  setRoleMode('founder');
                  setAuthError('');
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  roleMode === 'founder'
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Crown className="w-4 h-4 text-amber-300" />
                <span>Founder &amp; CEO</span>
              </button>

              <button
                onClick={() => {
                  setRoleMode('employee');
                  setAuthError('');
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  roleMode === 'employee'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Employee</span>
              </button>

              <button
                onClick={() => {
                  setRoleMode('intern');
                  setAuthError('');
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  roleMode === 'intern'
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Intern</span>
              </button>
            </div>

            {/* Login Card */}
            <div className={`glass-card p-8 rounded-3xl border shadow-2xl space-y-6 text-center ${
              roleMode === 'founder'
                ? 'border-red-500/40 shadow-red-950/30 glow-blue'
                : roleMode === 'intern'
                  ? 'border-amber-500/30 shadow-amber-950/20'
                  : 'border-blue-500/30 shadow-blue-950/20'
            }`}>
              <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center mx-auto shadow-lg ${
                roleMode === 'founder'
                  ? 'bg-red-950/80 border-red-500/50 text-amber-300 shadow-red-500/30'
                  : roleMode === 'intern'
                    ? 'bg-amber-950/60 border-amber-500/40 text-amber-400 shadow-amber-500/20'
                    : 'bg-blue-950/60 border-blue-500/40 text-cyan-400 shadow-blue-500/20'
              }`}>
                {roleMode === 'founder' ? (
                  <Crown className="w-8 h-8 animate-pulse text-amber-300" />
                ) : roleMode === 'intern' ? (
                  <GraduationCap className="w-8 h-8 animate-pulse" />
                ) : (
                  <Briefcase className="w-8 h-8 animate-pulse" />
                )}
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold text-white tracking-tight">
                  {roleMode === 'founder'
                    ? 'Founder & CEO Management Portal'
                    : roleMode === 'intern'
                      ? 'Intern Work Dashboard'
                      : 'Employee Work Dashboard'}
                </h2>
                <p className="text-xs text-slate-400">
                  {roleMode === 'founder'
                    ? 'Manage other employees & interns, assign development work, and review completed deliverables.'
                    : 'Enter your assigned ID to view tasks and update your present completed work.'}
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4 pt-2">
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold text-slate-300">
                    {roleMode === 'founder' ? 'Founder / CEO ID or Access PIN *' : `${roleMode === 'intern' ? 'Intern' : 'Employee'} ID *`}
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
                      placeholder={roleMode === 'founder' ? "Enter ID or Access PIN" : "Enter ID"}
                      className="form-input pl-10 uppercase font-mono tracking-wider text-sm font-semibold border-white/20 focus:border-cyan-400"
                      autoFocus
                    />
                  </div>
                </div>

                {roleMode === 'intern' && (
                  <div className="space-y-1.5 text-left pt-2">
                    <label className="block text-xs font-semibold text-slate-300">
                      Intern Password *
                    </label>
                    <div className="relative">
                      <UserCheck className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
                      <input
                        type="password"
                        value={memberPasswordInput}
                        onChange={(e) => {
                          setMemberPasswordInput(e.target.value);
                          setAuthError('');
                        }}
                        placeholder="Enter Password"
                        className="form-input pl-10 font-mono tracking-wider text-sm font-semibold border-white/20 focus:border-amber-400"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5 text-left pt-2">
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
                    roleMode === 'founder'
                      ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 shadow-red-600/30'
                      : roleMode === 'intern'
                        ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 shadow-amber-600/30'
                        : 'btn-primary'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>
                    {roleMode === 'founder'
                      ? 'Unlock Founder & CEO Management Center'
                      : `Log In to ${roleMode === 'intern' ? 'Intern' : 'Employee'} Portal`}
                  </span>
                </button>
              </form>

              {/* Quick Select Chips */}
              <div className="pt-4 border-t border-white/10 space-y-2.5 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Quick Select Active {roleMode === 'founder' ? 'Leadership' : roleMode === 'intern' ? 'Interns' : 'Employees'}:
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
                        <div className="text-xs font-bold text-white group-hover:text-cyan-400 truncate flex items-center gap-1">
                          {m.isExecutive && <Crown className="w-3 h-3 text-amber-300 shrink-0" />}
                          <span className="truncate">{m.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">{m.id} • {m.role}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : isFounderUser ? (
          /* =================================================================== */
          /* FOUNDER & CEO EXECUTIVE DASHBOARD: MANAGE EMPLOYEES & INTERNS       */
          /* =================================================================== */
          <div className="max-w-6xl mx-auto space-y-6 pb-16 z-10 relative animate-in fade-in duration-300">
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

            {/* Founder Leadership Header Card */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-red-500/40 bg-gradient-to-r from-slate-900 via-red-950/40 to-slate-900 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 glow-blue">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl border bg-gradient-to-br from-red-950 via-slate-900 to-red-900 border-red-500/50 text-amber-300 flex items-center justify-center text-2xl font-bold shadow-lg shadow-red-500/20">
                  <Crown className="w-8 h-8 text-amber-300 animate-pulse" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                      {authenticatedMember.name}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full font-mono text-xs font-bold bg-slate-800 border border-white/20 text-cyan-400">
                      {authenticatedMember.id}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white shadow-md shadow-red-600/30 flex items-center gap-1">
                      <Crown className="w-3 h-3 text-amber-300" />
                      <span>{authenticatedMember.type || 'Founder & CEO'}</span>
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 font-medium">
                    {authenticatedMember.role} • Sakith Harvan Technologies Executive Board
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Full Leadership Rights: Managing Employees, Interns &amp; Technical Work Allocation
                  </p>
                </div>
              </div>

              {/* Founder Quick Actions */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={() => handleOpenAddMember('Employee')}
                  className="btn-primary text-xs py-2.5 px-4 font-bold flex items-center gap-2 shadow-lg shadow-red-600/20"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Add Employee</span>
                </button>

                <button
                  onClick={() => handleOpenAddMember('Intern')}
                  className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-600/20 transition-all"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Add Intern</span>
                </button>

                <button
                  onClick={() => handleOpenAssignTask('')}
                  className="btn-cyan text-xs py-2.5 px-4 font-bold flex items-center gap-2 shadow-lg shadow-cyan-600/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Assign Work</span>
                </button>
              </div>
            </div>

            {/* Founder Sub-Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-3 flex-wrap">
              {[
                { id: 'manage_staff', label: `👥 Manage Employees & Interns (${teamMembers.length})` },
                { id: 'all_tasks', label: `📊 Company Work Tracker & Review (${tasks.length})` },
                { id: 'my_tasks', label: `📝 My Directives (${memberTasks.length})` }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFounderTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    founderTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: MANAGE EMPLOYEES & INTERNS DIRECTORY */}
            {founderTab === 'manage_staff' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Secondary filter */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-2 bg-slate-900/90 p-1 rounded-xl border border-white/10">
                    {[
                      { id: 'all', label: `All Staff (${teamMembers.length})` },
                      { id: 'employees', label: `Employees (${teamMembers.filter(m => m.type === 'Employee').length})` },
                      { id: 'interns', label: `Interns (${teamMembers.filter(m => m.type === 'Intern').length})` }
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setFounderStaffFilter(f.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          founderStaffFilter === f.id
                            ? 'bg-slate-800 text-cyan-400 shadow-md font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenAddMember('Employee')}
                      className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Employee</span>
                    </button>
                    <button
                      onClick={() => handleOpenAddMember('Intern')}
                      className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 text-amber-400 border-amber-500/30"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Intern</span>
                    </button>
                  </div>
                </div>

                {/* Team Members Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teamMembers
                    .filter((m) => {
                      if (founderStaffFilter === 'employees') return m.type === 'Employee';
                      if (founderStaffFilter === 'interns') return m.type === 'Intern';
                      return true;
                    })
                    .map((member) => {
                      const memberTaskList = tasks.filter(
                        (t) => (t.memberId || '').toUpperCase() === member.id.toUpperCase()
                      );
                      const activeCount = memberTaskList.filter((t) => t.status !== 'Completed').length;
                      const isIntern = member.type === 'Intern';
                      const isFounderCard = member.isExecutive;

                      return (
                        <div
                          key={member.id}
                          className={`glass-card p-5 rounded-2xl border space-y-4 transition-all hover:scale-[1.01] ${
                            isFounderCard
                              ? 'border-red-500/40 bg-slate-900/90 glow-blue'
                              : isIntern
                                ? 'border-amber-500/30 bg-slate-900/80'
                                : 'border-blue-500/30 bg-slate-900/80'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                                isFounderCard
                                  ? 'bg-red-950/70 text-amber-300 border border-red-500/40'
                                  : isIntern
                                    ? 'bg-amber-950/70 text-amber-400 border border-amber-500/40'
                                    : 'bg-blue-950/70 text-cyan-400 border border-blue-500/40'
                              }`}>
                                {member.name ? member.name.charAt(0) : 'M'}
                              </div>
                              <div>
                                <h5 className="text-sm font-bold text-white flex items-center gap-1.5">
                                  {member.name}
                                  {isFounderCard && <Crown className="w-3.5 h-3.5 text-amber-300" />}
                                </h5>
                                <p className="text-xs text-slate-300">{member.role}</p>
                              </div>
                            </div>

                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isFounderCard
                                ? 'bg-red-600 text-white'
                                : isIntern
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-blue-500/20 text-cyan-300 border border-blue-500/40'
                            }`}>
                              {member.type}
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5 space-y-1.5 text-xs font-mono">
                            <div className="flex justify-between text-slate-400">
                              <span>ID:</span>
                              <span className="text-white font-bold">{member.id}</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                              <span>Active Work:</span>
                              <span className={activeCount > 0 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                                {activeCount} active ({memberTaskList.length} total)
                              </span>
                            </div>
                            {member.email && (
                              <div className="flex justify-between text-slate-400 truncate">
                                <span>Email:</span>
                                <span className="text-slate-300 truncate max-w-[150px]">{member.email}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10">
                            <button
                              onClick={() => handleOpenAssignTask(member.id)}
                              className="btn-cyan py-1.5 px-3 text-xs flex items-center gap-1.5 font-semibold"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Assign Work</span>
                            </button>

                            {!isFounderCard && (
                              <button
                                onClick={() => handleDeleteMember(member.id)}
                                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                                title="Remove Member"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* TAB 2: COMPANY WORK TRACKER & REVIEW */}
            {founderTab === 'all_tasks' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-cyan-400" />
                      <span>Company-Wide Assigned Work &amp; Deliverables Review</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      Founder &amp; CEO review center for monitoring assigned dates, daily work notes, progress %, and deliverables.
                    </p>
                  </div>

                  <button
                    onClick={() => handleOpenAssignTask('')}
                    className="btn-cyan text-xs py-2 px-4 flex items-center gap-2 font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Assign New Work</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`glass-card p-6 rounded-2xl border transition-all ${
                        task.status === 'Completed'
                          ? 'border-emerald-500/30 bg-slate-900/90'
                          : 'border-blue-500/30 bg-slate-900/90'
                      }`}
                    >
                      <div className="space-y-4">
                        {/* Header Details */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-bold text-cyan-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-white/10">
                                {task.id}
                              </span>
                              <span className="font-semibold text-xs text-white bg-slate-800 px-2.5 py-1 rounded-lg">
                                Member: <strong className="text-cyan-300">{task.memberName}</strong> ({task.memberId})
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                task.memberType === 'Intern'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                              }`}>
                                {task.memberType || 'Employee'}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                task.priority === 'High' 
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              }`}>
                                Priority: {task.priority || 'Medium'}
                              </span>
                            </div>
                            <h5 className="text-base font-bold text-white pt-1">{task.title}</h5>
                          </div>

                          {/* Date of Assigned Work and Due Date */}
                          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                            <div className="bg-slate-950/90 border border-cyan-500/30 px-3.5 py-1.5 rounded-xl text-left">
                              <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>Date of Assigned Work</span>
                              </div>
                              <div className="text-xs font-mono font-bold text-white">
                                {task.assignedDate || '2026-08-28'}
                              </div>
                            </div>

                            {task.dueDate && (
                              <div className="bg-slate-950/90 border border-amber-500/30 px-3.5 py-1.5 rounded-xl text-left">
                                <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>Deadline</span>
                                </div>
                                <div className="text-xs font-mono font-bold text-white">
                                  {task.dueDate}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Task Scope */}
                        <div className="text-xs text-slate-300 bg-slate-950/40 p-3 rounded-xl border border-white/5">
                          <span className="font-semibold text-slate-400 block pb-1">Work Description:</span>
                          {task.description || 'Deliver assigned technical milestone.'}
                        </div>

                        {/* PRESENT COMPLETED WORK SECTION */}
                        <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-2.5">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">Present Completed Work:</span>
                              <span className="text-xs font-mono font-extrabold text-cyan-400">
                                {task.progress || 0}%
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              {task.completedDate && (
                                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Completed Date: {task.completedDate}</span>
                                </span>
                              )}

                              {/* Founder Quick Status Updater */}
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-slate-400">Status:</span>
                                <select
                                  value={task.status}
                                  onChange={(e) => handleFounderUpdateTaskStatus(task.id, e.target.value)}
                                  className="bg-slate-900 border border-white/20 rounded-lg text-xs py-1 px-2.5 text-cyan-400 font-semibold"
                                >
                                  <option value="Assigned">Assigned</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Under Review">Under Review</option>
                                  <option value="Completed">Completed</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                task.status === 'Completed' ? 'bg-emerald-400' : 'bg-cyan-400'
                              }`}
                              style={{ width: `${task.progress || 0}%` }}
                            />
                          </div>

                          {/* Notes */}
                          {task.completedWorkNotes && (
                            <div className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-white/5">
                              <span className="font-semibold text-slate-400 block pb-0.5">Staff Progress Update:</span>
                              {task.completedWorkNotes}
                            </div>
                          )}

                          {task.deliverableUrl && (
                            <div className="pt-1">
                              <a
                                href={task.deliverableUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold hover:underline"
                              >
                                <LinkIcon className="w-3 h-3" />
                                <span>View Submitted Deliverable / PR</span>
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/10">
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-xs text-red-400 hover:text-red-300 p-1.5 flex items-center gap-1 hover:bg-red-950/40 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Task</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: MY DIRECTIVES */}
            {founderTab === 'my_tasks' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-white">
                    Directives &amp; Tasks Assigned to {authenticatedMember.name} ({memberTasks.length})
                  </h4>
                </div>

                {memberTasks.length === 0 ? (
                  <div className="glass-card p-8 rounded-2xl border border-white/10 text-center text-slate-400 text-xs">
                    No personal directives assigned. Use "Assign Work" to assign tasks to other employees/interns.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {memberTasks.map((t) => (
                      <div key={t.id} className="glass-card p-6 rounded-2xl border border-blue-500/30 space-y-3">
                        <div className="flex justify-between items-start">
                          <h5 className="font-bold text-white text-base">{t.title}</h5>
                          <span className="text-xs font-mono text-cyan-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-white/10">
                            Assigned: {t.assignedDate}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">{t.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* =================================================================== */
          /* STANDARD EMPLOYEE & INTERN WORK DASHBOARD VIEW                     */
          /* =================================================================== */
          <div className="max-w-6xl mx-auto space-y-6 pb-20 z-10 relative">
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

            {/* Profile Header with Batch and Name Edit Button */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center text-2xl font-bold shadow-lg ${
                  authenticatedMember.type === 'Intern'
                    ? 'bg-amber-950/70 border-amber-500/50 text-amber-400 shadow-amber-500/20'
                    : 'bg-blue-950/70 border-blue-500/50 text-cyan-400 shadow-blue-500/20'
                }`}>
                  {authenticatedMember.name ? authenticatedMember.name.charAt(0) : 'U'}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
                      <span>{authenticatedMember.name}</span>
                      <button
                        onClick={() => {
                          setEditNameInput(authenticatedMember.name || '');
                          setIsEditingName(true);
                        }}
                        className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-cyan-300 transition-colors"
                        title="Modify your name"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
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

                  {/* Role and Batch display */}
                  <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm">
                    <span className="text-slate-200 font-semibold">{authenticatedMember.role}</span>
                    <span className="text-slate-500">•</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-semibold">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>{memberBatchName}</span>
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Sakith Harvan Technologies • Joined: {authenticatedMember.joinedDate || 'Active'}
                  </p>
                </div>
              </div>

              {/* Progress Summary Bar */}
              <div className="w-full md:w-auto flex items-center gap-4 bg-slate-950/60 p-4 rounded-2xl border border-white/10">
                <div className="text-center px-3">
                  <div className="text-xl sm:text-2xl font-extrabold text-white">{totalTasksCount}</div>
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
                <div className="h-8 w-[1px] bg-white/10" />
                <div className="text-center px-3">
                  <div className="text-xl sm:text-2xl font-extrabold text-cyan-400">{taskCompletionPercentage}%</div>
                  <div className="text-[10px] text-cyan-400/80 font-semibold uppercase">Completion</div>
                </div>
              </div>
            </div>

            {/* TAB NAVIGATION FOR INTERN / EMPLOYEE */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
              {[
                { id: 'dashboard', label: '📊 Dashboard & Metrics', count: null },
                { id: 'tasks', label: '📋 Tasks & Work Progress', count: memberTasks.length },
                { id: 'performance', label: '📈 Performance & Velocity', count: null },
                { id: 'assessment', label: '📝 Assessments & Quizzes', count: memberAssessments.length },
                { id: 'submissions', label: '🚀 Deliverables & Submissions', count: memberSubmissions.length },
                { id: 'profile', label: '👤 Profile & Settings', count: null }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setMemberTab(t.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                    memberTab === t.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-white/20'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span>{t.label}</span>
                  {t.count !== null && (
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-extrabold bg-slate-950/60 text-cyan-300">
                      {t.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* =============================================================== */}
            {/* TAB 1: INTERN / EMPLOYEE DASHBOARD                              */}
            {/* =============================================================== */}
            {memberTab === 'dashboard' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Hero Completion Card */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Big Percentage Radial Gauge Card */}
                  <div className="glass-card p-6 rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 flex flex-col justify-between space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                        Task Completion Metric
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                        Live Calculated
                      </span>
                    </div>

                    <div className="flex items-center gap-6 my-2">
                      <div className="relative w-24 h-24 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-slate-800"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-cyan-400 transition-all duration-1000 ease-out"
                            strokeDasharray={`${taskCompletionPercentage}, 100`}
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-black text-white">{taskCompletionPercentage}%</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-lg font-extrabold text-white">
                          {taskCompletionPercentage >= 80
                            ? 'Outstanding Velocity! 🚀'
                            : taskCompletionPercentage >= 50
                              ? 'Steady Progress! ⚡'
                              : 'Tasks In Motion 🎯'}
                        </h4>
                        <p className="text-xs text-slate-300">
                          {completedCount} of {totalTasksCount} assigned tasks successfully completed.
                        </p>
                        <div className="text-[11px] text-cyan-400 font-semibold pt-1">
                          Average Task Progress: {avgTaskProgress}%
                        </div>
                      </div>
                    </div>

                    <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-white/5">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-700"
                        style={{ width: `${taskCompletionPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Batch & Role Overview Card */}
                  <div className="glass-card p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 flex flex-col justify-between space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                        Assigned Cohort / Batch
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-500/30">
                        Active Cohort
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-amber-400" />
                        <span>{memberBatchName}</span>
                      </h4>
                      <p className="text-xs text-slate-300">
                        Role: <strong className="text-white">{authenticatedMember.role}</strong>
                      </p>
                      <p className="text-xs text-slate-400">
                        Mentorship &amp; Technical Review: <span className="text-cyan-300 font-semibold">Maddi Harshavardhan &amp; Thoka Sai Krishna</span>
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Personal Performance Index:</span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        {authenticatedMember.performanceScore || 94}% (Top Tier)
                      </span>
                    </div>
                  </div>

                  {/* Fast Action / Quick Status Card */}
                  <div className="glass-card p-6 rounded-3xl border border-blue-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 flex flex-col justify-between space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                        Quick Hub &amp; Directives
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-950 text-blue-300 border border-blue-500/30">
                        Actions
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <button
                        onClick={() => setMemberTab('tasks')}
                        className="w-full p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-left text-white font-semibold flex items-center justify-between transition-colors"
                      >
                        <span>Update Today's Progress ({inProgressCount} in progress)</span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>
                      <button
                        onClick={() => {
                          setMemberTab('submissions');
                          setIsSubmittingWork(true);
                        }}
                        className="w-full p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-left text-white font-semibold flex items-center justify-between transition-colors"
                      >
                        <span>Submit Project Deliverable / PR</span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>
                      <button
                        onClick={() => {
                          setMemberTab('assessment');
                          setIsTakingQuiz(true);
                        }}
                        className="w-full p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-left text-white font-semibold flex items-center justify-between transition-colors"
                      >
                        <span>Take Technical Assessment Quiz</span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-white/5">
                      <span>ID: {authenticatedMember.id}</span>
                      <button
                        onClick={() => {
                          setEditNameInput(authenticatedMember.name || '');
                          setIsEditingName(true);
                        }}
                        className="text-cyan-400 hover:underline font-semibold"
                      >
                        Edit Name
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4 Summary Counters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="glass-card p-4 rounded-2xl border border-white/10 bg-slate-900/60 space-y-1">
                    <div className="text-xs text-slate-400 font-semibold">Total Given Tasks</div>
                    <div className="text-2xl font-extrabold text-white">{totalTasksCount}</div>
                    <div className="text-[10px] text-slate-500">Milestones assigned by leadership</div>
                  </div>

                  <div className="glass-card p-4 rounded-2xl border border-emerald-500/20 bg-slate-900/60 space-y-1">
                    <div className="text-xs text-emerald-400 font-semibold">Completed Tasks</div>
                    <div className="text-2xl font-extrabold text-emerald-400">{completedCount}</div>
                    <div className="text-[10px] text-emerald-300/80">{taskCompletionPercentage}% completion rate</div>
                  </div>

                  <div className="glass-card p-4 rounded-2xl border border-amber-500/20 bg-slate-900/60 space-y-1">
                    <div className="text-xs text-amber-400 font-semibold">In Progress</div>
                    <div className="text-2xl font-extrabold text-amber-400">{inProgressCount}</div>
                    <div className="text-[10px] text-amber-300/80">Active deliverables</div>
                  </div>

                  <div className="glass-card p-4 rounded-2xl border border-cyan-500/20 bg-slate-900/60 space-y-1">
                    <div className="text-xs text-cyan-400 font-semibold">Submitted Deliverables</div>
                    <div className="text-2xl font-extrabold text-cyan-300">{memberSubmissions.length}</div>
                    <div className="text-[10px] text-cyan-400/80">{memberAssessments.length} assessments passed</div>
                  </div>
                </div>

                {/* Active Deliverables Overview List */}
                <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      <span>Current Active Tasks &amp; Milestones</span>
                    </h3>
                    <button
                      onClick={() => setMemberTab('tasks')}
                      className="text-xs text-cyan-400 hover:underline font-semibold"
                    >
                      View All ({memberTasks.length}) →
                    </button>
                  </div>

                  {memberTasks.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      No tasks currently assigned. New work will appear here immediately.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {memberTasks.slice(0, 4).map((t) => (
                        <div
                          key={t.id}
                          className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-3 hover:border-cyan-500/30 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs text-cyan-400 font-bold bg-slate-900 px-2 py-0.5 rounded">
                              {t.id}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              t.status === 'Completed'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-blue-500/20 text-blue-300'
                            }`}>
                              {t.status}
                            </span>
                          </div>

                          <h5 className="text-sm font-bold text-white line-clamp-1">{t.title}</h5>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] text-slate-400">
                              <span>Work Done:</span>
                              <span className="font-mono font-bold text-cyan-400">{t.progress || 0}%</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  t.status === 'Completed' ? 'bg-emerald-400' : 'bg-cyan-400'
                                }`}
                                style={{ width: `${t.progress || 0}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                            <span>Deadline: {t.dueDate || 'Ongoing'}</span>
                            <button
                              onClick={() => {
                                setMemberTab('tasks');
                                handleStartUpdate(t);
                              }}
                              className="text-cyan-400 hover:text-white font-semibold flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Update</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* TAB 2: TASKS & WORK PROGRESS                                    */}
            {/* =============================================================== */}
            {memberTab === 'tasks' && (
              <div className="space-y-6 animate-in fade-in duration-300">
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
                        New work assigned by Founder &amp; CEO will appear here instantly.
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
                          {/* Task Header */}
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

                              {/* Date of Assigned Work and Due Date */}
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

                            {/* Scope */}
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

                            {/* PRESENT WORK UPDATION FORM (Edit Mode) */}
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

            {/* =============================================================== */}
            {/* TAB 3: PERFORMANCE & VELOCITY ANALYTICS                        */}
            {/* =============================================================== */}
            {memberTab === 'performance' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-cyan-400" />
                      <span>Performance &amp; Engineering Velocity Metrics</span>
                    </h3>
                    <p className="text-xs text-slate-300">
                      Evaluated against sprint deadlines, code quality benchmarks, and technical deliverables.
                    </p>
                  </div>

                  {/* 4 Performance Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-emerald-500/30 space-y-2">
                      <div className="text-xs text-slate-400">On-Time Delivery Rate</div>
                      <div className="text-2xl font-black text-emerald-400">96%</div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-400 h-full rounded-full" style={{ width: '96%' }} />
                      </div>
                      <p className="text-[10px] text-emerald-300/80">Ahead of sprint milestone schedules</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-cyan-500/30 space-y-2">
                      <div className="text-xs text-slate-400">Code Quality &amp; Architecture</div>
                      <div className="text-2xl font-black text-cyan-400">94%</div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-cyan-400 h-full rounded-full" style={{ width: '94%' }} />
                      </div>
                      <p className="text-[10px] text-cyan-300/80">High test coverage &amp; clean structure</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-amber-500/30 space-y-2">
                      <div className="text-xs text-slate-400">Task Completion Efficiency</div>
                      <div className="text-2xl font-black text-amber-400">{taskCompletionPercentage}%</div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-400 h-full rounded-full" style={{ width: `${taskCompletionPercentage}%` }} />
                      </div>
                      <p className="text-[10px] text-amber-300/80">{completedCount} of {totalTasksCount} tasks finished</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-purple-500/30 space-y-2">
                      <div className="text-xs text-slate-400">Performance Score Tier</div>
                      <div className="text-2xl font-black text-purple-300">
                        {authenticatedMember.performanceScore || 94} / 100
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-purple-400 h-full rounded-full" style={{ width: `${authenticatedMember.performanceScore || 94}%` }} />
                      </div>
                      <p className="text-[10px] text-purple-300/80">Executive Leadership Rating: Top 5%</p>
                    </div>
                  </div>

                  {/* Badges & Recognition */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>Skill Endorsements &amp; Performance Badges</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/5 space-y-1">
                        <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Agentic AI &amp; LLM Specialist</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Awarded for stellar implementation of Google Gemini API &amp; vector search pipelines.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/5 space-y-1">
                        <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Rapid Shipping Champion</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Maintained &gt;90% sprint milestone completion with clean GitHub pull requests.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/5 space-y-1">
                        <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5" />
                          <span>Clean Architecture Star</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Recognized for responsive Tailwind styling and Supabase security policies.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* TAB 4: ASSESSMENTS & BENCHMARK QUIZZES                           */}
            {/* =============================================================== */}
            {memberTab === 'assessment' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-amber-400" />
                      <span>Technical Assessments &amp; Milestone Quizzes</span>
                    </h3>
                    <p className="text-xs text-slate-300">
                      Assigned technical evaluations, code reviews, and scoring history.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsTakingQuiz(true)}
                    className="btn-cyan text-xs py-2 px-4 flex items-center gap-2 font-bold shadow-lg shadow-cyan-600/20"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Take New Assessment Quiz</span>
                  </button>
                </div>

                {memberAssessments.length === 0 ? (
                  <div className="glass-card p-12 rounded-3xl border border-white/10 text-center space-y-4">
                    <GraduationCap className="w-12 h-12 text-slate-600 mx-auto" />
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-white">No Assessment Records Yet</h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Click "Take New Assessment Quiz" above to complete your milestone evaluation.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {memberAssessments.map((asm) => (
                      <div
                        key={asm.id}
                        className="glass-card p-6 rounded-3xl border border-white/10 space-y-4 hover:border-amber-500/40 transition-all"
                      >
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-cyan-400 bg-slate-950 px-2 py-0.5 rounded">
                              {asm.id}
                            </span>
                            <h4 className="text-base font-bold text-white pt-1">{asm.title}</h4>
                            <span className="text-xs text-slate-400">{asm.category}</span>
                          </div>

                          <div className="text-right">
                            <div className="text-2xl font-black text-emerald-400">
                              {asm.score} <span className="text-xs text-slate-400 font-normal">/ {asm.maxScore}</span>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              {asm.status}
                            </span>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                          <span className="text-[11px] font-bold text-slate-400 block">Evaluator Feedback:</span>
                          <p className="text-xs text-slate-300 leading-relaxed italic">
                            "{asm.feedback || 'Excellent technical understanding and problem solving.'}"
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>Evaluated by: <strong className="text-slate-300">{asm.evaluator}</strong></span>
                          <span className="font-mono">{asm.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* =============================================================== */}
            {/* TAB 5: DELIVERABLES & SUBMISSIONS                               */}
            {/* =============================================================== */}
            {memberTab === 'submissions' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Layers className="w-5 h-5 text-cyan-400" />
                      <span>Deliverables &amp; PR Submissions Hub</span>
                    </h3>
                    <p className="text-xs text-slate-300">
                      Submit GitHub Pull Requests, live demo links, and Colab notebooks for review.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsSubmittingWork(true)}
                    className="btn-primary text-xs py-2 px-4 flex items-center gap-2 font-bold shadow-lg shadow-blue-600/20"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Submit New Deliverable</span>
                  </button>
                </div>

                {memberSubmissions.length === 0 ? (
                  <div className="glass-card p-12 rounded-3xl border border-white/10 text-center space-y-4">
                    <Layers className="w-12 h-12 text-slate-600 mx-auto" />
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-white">No Deliverables Submitted Yet</h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Click "Submit New Deliverable" to submit a PR or project link to leadership.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {memberSubmissions.map((sub) => (
                      <div
                        key={sub.id}
                        className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-cyan-500/40 transition-all"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-cyan-400 bg-slate-950 px-2 py-0.5 rounded">
                              {sub.id}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              sub.status === 'Approved'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            }`}>
                              {sub.status}
                            </span>
                            <span className="text-xs text-slate-400">Ref: {sub.taskRef || 'Task'}</span>
                          </div>

                          <h4 className="text-base font-bold text-white">{sub.title}</h4>
                          <p className="text-xs text-slate-300">
                            Remarks: <span className="text-slate-400 italic">"{sub.reviewerRemarks}"</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                          <span className="text-xs font-mono text-slate-400">{sub.submittedDate}</span>
                          <a
                            href={sub.deliverableUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-cyan text-xs py-1.5 px-3.5 flex items-center gap-1.5"
                          >
                            <LinkIcon className="w-3.5 h-3.5" />
                            <span>Open Deliverable</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* =============================================================== */}
            {/* TAB 6: PROFILE & MODIFY NAME                                    */}
            {/* =============================================================== */}
            {memberTab === 'profile' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="glass-card max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">Intern Profile &amp; Settings</h3>
                      <p className="text-xs text-slate-400">Modify your name and view account details.</p>
                    </div>
                    <span className="font-mono text-xs font-bold text-cyan-400 bg-slate-900 px-3 py-1 rounded-xl border border-white/10">
                      {authenticatedMember.id}
                    </span>
                  </div>

                  {/* Inline Name Modification Form */}
                  <form onSubmit={handleSaveModifiedName} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Full Name (Modify your name here) *
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={editNameInput}
                          onChange={(e) => setEditNameInput(e.target.value)}
                          className="form-input text-sm flex-1 font-semibold"
                          placeholder="Enter your name..."
                        />
                        <button
                          type="submit"
                          className="btn-primary text-xs py-2 px-5 font-bold flex items-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          <span>Save Name</span>
                        </button>
                      </div>
                    </div>

                    {/* Read-Only Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
                        <span className="text-[11px] text-slate-400 font-semibold block">Designation / Role:</span>
                        <span className="text-xs font-bold text-white">{authenticatedMember.role}</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
                        <span className="text-[11px] text-slate-400 font-semibold block">Assigned Batch:</span>
                        <span className="text-xs font-bold text-amber-300">{memberBatchName}</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
                        <span className="text-[11px] text-slate-400 font-semibold block">Official Email:</span>
                        <span className="text-xs font-mono text-cyan-300">
                          {authenticatedMember.email || `${authenticatedMember.id.toLowerCase()}@sakithharvan.com`}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
                        <span className="text-[11px] text-slate-400 font-semibold block">Date Joined:</span>
                        <span className="text-xs font-mono text-white">{authenticatedMember.joinedDate || 'Active'}</span>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* MODAL: EDIT NAME POPUP                                             */}
      {/* =================================================================== */}
      {isEditingName && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-card max-w-md w-full p-6 rounded-3xl border border-cyan-500/50 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-cyan-400" />
                <span>Modify Your Name</span>
              </h4>
              <button onClick={() => setIsEditingName(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModifiedName} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-300">Enter Updated Name *</label>
                <input
                  type="text"
                  required
                  value={editNameInput}
                  onChange={(e) => setEditNameInput(e.target.value)}
                  placeholder="e.g. V. Sai Teja"
                  className="form-input text-xs font-semibold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditingName(false)}
                  className="btn-secondary py-2 px-4 text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary py-2 px-5 text-xs font-bold">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: TAKE ASSESSMENT / BENCHMARK QUIZ                            */}
      {/* =================================================================== */}
      {isTakingQuiz && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-card max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-amber-500/50 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-amber-400" />
                <h4 className="text-base font-bold text-white">Technical Milestone Assessment</h4>
              </div>
              <button onClick={() => setIsTakingQuiz(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitAssessmentQuiz} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-300">
                  Question 1: Explain the difference between client-side state and database synchronization in React &amp; Supabase. *
                </label>
                <textarea
                  rows={2}
                  required
                  value={quizForm.q1}
                  onChange={(e) => setQuizForm({ ...quizForm, q1: e.target.value })}
                  placeholder="Explain state management, optimisms updates, and realtime postgres changes..."
                  className="form-input text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-300">
                  Question 2: How do you optimize Vector Embeddings and latency in Agentic AI pipelines? *
                </label>
                <textarea
                  rows={2}
                  required
                  value={quizForm.q2}
                  onChange={(e) => setQuizForm({ ...quizForm, q2: e.target.value })}
                  placeholder="Explain chunking strategies, pgvector cosine distance indexing, and streaming LLM outputs..."
                  className="form-input text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsTakingQuiz(false)}
                  className="btn-secondary py-2 px-4 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/30"
                >
                  Submit &amp; Calculate Score
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: SUBMIT DELIVERABLE                                          */}
      {/* =================================================================== */}
      {isSubmittingWork && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-card max-w-md w-full p-6 rounded-3xl border border-cyan-500/50 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <h4 className="text-base font-bold text-white">Submit Project Deliverable / PR</h4>
              </div>
              <button onClick={() => setIsSubmittingWork(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDeliverableSubmission} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-semibold text-slate-300">Deliverable Title *</label>
                <input
                  type="text"
                  required
                  value={newSubmissionForm.title}
                  onChange={(e) => setNewSubmissionForm({ ...newSubmissionForm, title: e.target.value })}
                  placeholder="e.g. Completed pgvector Search Migration PR #18"
                  className="form-input text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-300">Deliverable URL (GitHub / Colab / Figma / Live) *</label>
                <input
                  type="url"
                  required
                  value={newSubmissionForm.deliverableUrl}
                  onChange={(e) => setNewSubmissionForm({ ...newSubmissionForm, deliverableUrl: e.target.value })}
                  placeholder="https://github.com/..."
                  className="form-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-300">Related Task</label>
                  <select
                    value={newSubmissionForm.taskRef}
                    onChange={(e) => setNewSubmissionForm({ ...newSubmissionForm, taskRef: e.target.value })}
                    className="form-input text-xs"
                  >
                    <option value="">General Deliverable</option>
                    {memberTasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.id}: {t.title.slice(0, 24)}...
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-300">Type</label>
                  <select
                    value={newSubmissionForm.type}
                    onChange={(e) => setNewSubmissionForm({ ...newSubmissionForm, type: e.target.value })}
                    className="form-input text-xs"
                  >
                    <option value="GitHub Pull Request">GitHub Pull Request</option>
                    <option value="Colab Notebook">Colab Notebook</option>
                    <option value="Figma Prototype">Figma Prototype</option>
                    <option value="Live Deployed URL">Live Deployed URL</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsSubmittingWork(false)}
                  className="btn-secondary py-2 px-4 text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary py-2 px-5 text-xs font-bold">
                  Submit Deliverable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: ADD EMPLOYEE / INTERN (FOUNDER & CEO PRIVILEGE)             */}
      {/* =================================================================== */}
      {isAddingMember && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-card max-w-md w-full p-6 sm:p-8 rounded-3xl border border-blue-500/50 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                {memberFormData.type === 'Intern' ? (
                  <GraduationCap className="w-5 h-5 text-amber-400" />
                ) : (
                  <Briefcase className="w-5 h-5 text-cyan-400" />
                )}
                <h4 className="text-lg font-bold text-white">
                  Add New {memberFormData.type === 'Intern' ? 'Intern' : 'Employee'}
                </h4>
              </div>
              <button
                onClick={() => setIsAddingMember(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4 text-xs">
              {/* Type Switcher */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-300">Member Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const count = teamMembers.filter(m => m.type === 'Employee').length + 101;
                      setMemberFormData({ ...memberFormData, type: 'Employee', id: `EMP-${count}` });
                    }}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                      memberFormData.type === 'Employee'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Employee</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const count = teamMembers.filter(m => m.type === 'Intern').length + 101;
                      setMemberFormData({ ...memberFormData, type: 'Intern', id: `INT-${count}` });
                    }}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                      memberFormData.type === 'Intern'
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Intern</span>
                  </button>
                </div>
              </div>

              {/* ID & Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    {memberFormData.type} ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={memberFormData.id}
                    onChange={(e) => setMemberFormData({ ...memberFormData, id: e.target.value.toUpperCase() })}
                    placeholder={memberFormData.type === 'Intern' ? 'e.g. INT-203' : 'e.g. EMP-103'}
                    className="form-input text-xs uppercase font-mono tracking-wider"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={memberFormData.name}
                    onChange={(e) => setMemberFormData({ ...memberFormData, name: e.target.value })}
                    placeholder="e.g. S. Sandeep Kumar"
                    className="form-input text-xs"
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Role / Job Title *</label>
                <input
                  type="text"
                  required
                  value={memberFormData.role}
                  onChange={(e) => setMemberFormData({ ...memberFormData, role: e.target.value })}
                  placeholder={memberFormData.type === 'Intern' ? 'e.g. React & AI/ML Intern' : 'e.g. Senior Full Stack Engineer'}
                  className="form-input text-xs"
                />
              </div>

              {/* Contact details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Official / Personal Email</label>
                  <input
                    type="email"
                    value={memberFormData.email}
                    onChange={(e) => setMemberFormData({ ...memberFormData, email: e.target.value })}
                    placeholder="name@sakithharvan.com"
                    className="form-input text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={memberFormData.phone}
                    onChange={(e) => setMemberFormData({ ...memberFormData, phone: e.target.value })}
                    placeholder="+91 98480..."
                    className="form-input text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddingMember(false)}
                  className="btn-secondary py-2 px-4 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`py-2 px-5 text-xs font-bold rounded-xl text-white shadow-lg transition-all ${
                    memberFormData.type === 'Intern'
                      ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                      : 'btn-primary'
                  }`}
                >
                  <span>Register {memberFormData.type}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: ASSIGN WORK / TASK (FOUNDER & CEO PRIVILEGE)                */}
      {/* =================================================================== */}
      {isAssigningTask && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-card max-w-xl w-full p-6 sm:p-8 rounded-3xl border border-cyan-500/50 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                <h4 className="text-lg font-bold text-white">Assign Work / Task to Team Member</h4>
              </div>
              <button
                onClick={() => setIsAssigningTask(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAssignedTask} className="space-y-4 text-xs">
              {/* Select Member */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Select Employee / Intern *
                </label>
                <select
                  required
                  value={taskFormData.memberId}
                  onChange={(e) => setTaskFormData({ ...taskFormData, memberId: e.target.value })}
                  className="form-input text-xs font-medium"
                >
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      [{m.id}] {m.name} — {m.role} ({m.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Task Title */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Work / Task Title *</label>
                <input
                  type="text"
                  required
                  value={taskFormData.title}
                  onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                  placeholder="e.g. Implement Attendance Module API Endpoints"
                  className="form-input text-xs"
                />
              </div>

              {/* Assigned Date & Due Date & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Date of Assigned Work *
                  </label>
                  <input
                    type="date"
                    required
                    value={taskFormData.assignedDate}
                    onChange={(e) => setTaskFormData({ ...taskFormData, assignedDate: e.target.value })}
                    className="form-input text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Deadline / Target Date</label>
                  <input
                    type="date"
                    value={taskFormData.dueDate}
                    onChange={(e) => setTaskFormData({ ...taskFormData, dueDate: e.target.value })}
                    className="form-input text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={taskFormData.priority}
                    onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value })}
                    className="form-input text-xs"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Detailed Work Description &amp; Deliverables *
                </label>
                <textarea
                  rows="3"
                  required
                  value={taskFormData.description}
                  onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                  placeholder="Specify task scope, modules, tech stack, testing criteria, and deliverables expected..."
                  className="form-input text-xs font-sans"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAssigningTask(false)}
                  className="btn-secondary py-2 px-4 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-cyan py-2 px-5 text-xs font-bold shadow-md shadow-cyan-500/30"
                >
                  <span>Assign Work to Member</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
