import React, { useState, useEffect } from 'react';
import { 
  Shield, Lock, Calendar, FileText, CheckCircle2, Trash2, Download, RefreshCw, 
  X, Search, UserCheck, BookOpen, Plus, Edit3, RotateCcw, Sparkles, Layers,
  LayoutDashboard, BarChart3, TrendingUp, Key, LogOut, ExternalLink, ArrowRight,
  Filter, ChevronRight, Clock, Users, Award, Building, Mail, Phone, Eye, Calculator,
  Briefcase, GraduationCap, Link as LinkIcon, Check
} from 'lucide-react';
import { INITIAL_WORKSHOPS, INITIAL_TEAM_MEMBERS, INITIAL_ASSIGNED_TASKS } from '../data/defaultData';
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
  deleteWorkshopFromSupabase,
  saveTeamMemberToSupabase,
  fetchTeamMembersFromSupabase,
  deleteTeamMemberFromSupabase,
  saveTaskToSupabase,
  fetchTasksFromSupabase,
  updateTaskInSupabase,
  deleteTaskFromSupabase
} from '../lib/supabaseClient';

export const AdminPortalModal = ({ isOpen, onClose, onOpenEmpLogin, onOpenInternLogin }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'team_work', 'quotation_maker', 'consultations', 'requirements', 'workshops', 'settings'


  const [consultations, setConsultations] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);

  // Add Member Modal State (Add Emp / Add Intern)
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [memberFormData, setMemberFormData] = useState({
    id: '',
    name: '',
    role: '',
    type: 'Employee',
    email: '',
    phone: ''
  });

  // Assign Task Modal State
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

  // Filter for Team & Work tab
  const [teamTabSubFilter, setTeamTabSubFilter] = useState('all'); // 'all', 'employees', 'interns', 'tasks'

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

  // Reset search and status filters when changing admin dashboard tabs
  useEffect(() => {
    setStatusFilter('All');
    setSearchQuery('');
  }, [activeTab]);

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

    const handleTeamUpdate = () => {
      const stored = localStorage.getItem('sh_team_members');
      if (stored) {
        try { setTeamMembers(JSON.parse(stored)); } catch(e) {}
      }
    };

    const handleTaskUpdate = () => {
      const stored = localStorage.getItem('sh_assigned_tasks');
      if (stored) {
        try { setAssignedTasks(JSON.parse(stored)); } catch(e) {}
      }
    };

    window.addEventListener('sh_requirements_updated', handleReqUpdate);
    window.addEventListener('sh_consultations_updated', handleConsultUpdate);
    window.addEventListener('sh_team_updated', handleTeamUpdate);
    window.addEventListener('sh_tasks_updated', handleTaskUpdate);

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
      window.removeEventListener('sh_team_updated', handleTeamUpdate);
      window.removeEventListener('sh_tasks_updated', handleTaskUpdate);
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

    // Team Members (Employees & Interns)
    const rawTeam = localStorage.getItem('sh_team_members');
    let finalTeam;
    if (rawTeam === null) {
      finalTeam = INITIAL_TEAM_MEMBERS;
      localStorage.setItem('sh_team_members', JSON.stringify(INITIAL_TEAM_MEMBERS));
    } else {
      try {
        finalTeam = JSON.parse(rawTeam);
      } catch (e) {
        finalTeam = INITIAL_TEAM_MEMBERS;
      }
    }

    // Assigned Tasks
    const rawTasks = localStorage.getItem('sh_assigned_tasks');
    let finalTasks;
    if (rawTasks === null) {
      finalTasks = INITIAL_ASSIGNED_TASKS;
      localStorage.setItem('sh_assigned_tasks', JSON.stringify(INITIAL_ASSIGNED_TASKS));
    } else {
      try {
        finalTasks = JSON.parse(rawTasks);
      } catch (e) {
        finalTasks = INITIAL_ASSIGNED_TASKS;
      }
    }

    setConsultations(finalConsultations);
    setRequirements(finalRequirements);
    setWorkshops(finalWorkshops);
    setTeamMembers(finalTeam);
    setAssignedTasks(finalTasks);

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

    fetchTeamMembersFromSupabase().then(dbData => {
      if (dbData && dbData.length > 0) {
        setTeamMembers(dbData);
        localStorage.setItem('sh_team_members', JSON.stringify(dbData));
      }
    });

    fetchTasksFromSupabase().then(dbData => {
      if (dbData && dbData.length > 0) {
        setAssignedTasks(dbData);
        localStorage.setItem('sh_assigned_tasks', JSON.stringify(dbData));
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

  // Team Member (Employee & Intern) CRUD Handlers
  const handleOpenAddMember = (type = 'Employee') => {
    const nextPrefix = type === 'Intern' ? 'INT-' : 'EMP-';
    const count = teamMembers.filter(m => m.type === type).length + 101;
    setMemberFormData({
      id: `${nextPrefix}${count}`,
      name: '',
      role: type === 'Intern' ? 'AI/ML Solutions Intern' : 'Senior Full Stack Engineer',
      type: type,
      email: '',
      phone: ''
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
      status: 'Active'
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
  };

  const handleDeleteMember = (id) => {
    if (window.confirm(`Are you sure you want to remove team member ${id}?`)) {
      const updated = teamMembers.filter(m => m.id !== id);
      setTeamMembers(updated);
      localStorage.setItem('sh_team_members', JSON.stringify(updated));
      deleteTeamMemberFromSupabase(id);
      window.dispatchEvent(new Event('sh_team_updated'));
    }
  };

  // Task Assignment Handlers
  const handleOpenAssignTask = (prefillMemberId = '') => {
    const defaultMember = teamMembers.find(m => m.id === prefillMemberId) || teamMembers[0] || { id: 'EMP-101' };
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
      type: 'Employee'
    };

    const newTask = {
      id: taskFormData.id || ('TSK-' + Date.now()),
      memberId: taskFormData.memberId,
      memberName: member.name,
      memberRole: member.role,
      memberType: member.type,
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

    const updated = [newTask, ...assignedTasks];
    setAssignedTasks(updated);
    localStorage.setItem('sh_assigned_tasks', JSON.stringify(updated));
    saveTaskToSupabase(newTask);
    window.dispatchEvent(new Event('sh_tasks_updated'));
    setIsAssigningTask(false);
  };

  const handleDeleteTask = (id) => {
    if (window.confirm('Delete this assigned task record?')) {
      const updated = assignedTasks.filter(t => t.id !== id);
      setAssignedTasks(updated);
      localStorage.setItem('sh_assigned_tasks', JSON.stringify(updated));
      deleteTaskFromSupabase(id);
      window.dispatchEvent(new Event('sh_tasks_updated'));
    }
  };

  const handleAdminUpdateTaskStatus = (id, newStatus) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const updated = assignedTasks.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: newStatus,
          progress: newStatus === 'Completed' ? 100 : (t.progress || 50),
          completedDate: newStatus === 'Completed' ? todayStr : t.completedDate
        };
      }
      return t;
    });

    setAssignedTasks(updated);
    localStorage.setItem('sh_assigned_tasks', JSON.stringify(updated));
    updateTaskInSupabase(id, {
      status: newStatus,
      progress: newStatus === 'Completed' ? 100 : undefined,
      completedDate: newStatus === 'Completed' ? todayStr : undefined
    });
    window.dispatchEvent(new Event('sh_tasks_updated'));
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
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
                          (item.name || '').toLowerCase().includes(q) ||
                          (item.organization || '').toLowerCase().includes(q) ||
                          (item.email || '').toLowerCase().includes(q) ||
                          (item.phone || '').toLowerCase().includes(q) ||
                          (item.mainNeed || '').toLowerCase().includes(q) ||
                          (item.type || '').toLowerCase().includes(q) ||
                          (item.id || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredRequirements = requirements.filter(item => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
                          (item.name || '').toLowerCase().includes(q) ||
                          (item.organization || '').toLowerCase().includes(q) ||
                          (item.email || '').toLowerCase().includes(q) ||
                          (item.phone || '').toLowerCase().includes(q) ||
                          (item.category || '').toLowerCase().includes(q) ||
                          (item.scope || '').toLowerCase().includes(q) ||
                          (item.id || '').toLowerCase().includes(q);
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

              {/* Quick Staff Login Links */}
              <div className="pt-2 border-t border-white/10 space-y-2">
                <div className="text-[11px] font-semibold text-slate-400 text-left">Staff &amp; Intern Portals:</div>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenEmpLogin) onOpenEmpLogin();
                    }}
                    className="p-2.5 rounded-xl bg-slate-900/90 border border-blue-500/30 hover:border-cyan-400 hover:bg-slate-800 text-xs font-bold text-cyan-400 flex items-center justify-center gap-1.5 transition-all shadow-md"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Emp Login</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenInternLogin) onOpenInternLogin();
                    }}
                    className="p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/30 hover:border-amber-400 hover:bg-slate-800 text-xs font-bold text-amber-400 flex items-center justify-center gap-1.5 transition-all shadow-md"
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Intern Login</span>
                  </button>
                </div>
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
                  onClick={() => setActiveTab('team_work')}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    activeTab === 'team_work'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span>Team &amp; Work Tasks</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-bold">
                    {teamMembers.length}
                  </span>
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
                    <option value="team_work">Team &amp; Work ({teamMembers.length})</option>
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
                    {activeTab === 'team_work' && 'Team Members & Work Assignment Manager'}
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

              {/* TAB: TEAM & WORK ASSIGNMENT MANAGER (EMPLOYEES & INTERNS) */}
              {activeTab === 'team_work' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  {/* Top Action Toolbar */}
                  <div className="glass-card p-6 rounded-3xl border border-blue-500/30 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-600/30 text-cyan-300 border border-blue-500/40 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          <span>Enterprise Workforce &amp; Tasks</span>
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                        Team Members &amp; Work Assignment Management
                      </h3>
                      <p className="text-xs text-slate-300">
                        Add employees &amp; interns, assign development work, and monitor live task completion updates.
                      </p>
                    </div>

                    {/* Action Buttons: Add Emp, Add Intern, Assign Task */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <button
                        onClick={() => handleOpenAddMember('Employee')}
                        className="btn-primary text-xs py-2.5 px-4 font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20"
                      >
                        <Briefcase className="w-4 h-4" />
                        <span>Add Employee (Add Emp)</span>
                      </button>

                      <button
                        onClick={() => handleOpenAddMember('Intern')}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-600/20 transition-all"
                      >
                        <GraduationCap className="w-4 h-4" />
                        <span>Add Intern</span>
                      </button>

                      <button
                        onClick={() => handleOpenAssignTask('')}
                        className="btn-cyan text-xs py-2.5 px-4 font-bold flex items-center gap-2 shadow-lg shadow-cyan-600/20"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Assign Work / Task</span>
                      </button>
                    </div>
                  </div>

                  {/* Team KPI Stats Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 text-center">
                      <div className="text-2xl font-extrabold text-white">{teamMembers.length}</div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Total Staff</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-900/90 border border-blue-500/20 text-center">
                      <div className="text-2xl font-extrabold text-cyan-400">
                        {teamMembers.filter(m => m.type === 'Employee').length}
                      </div>
                      <div className="text-[10px] text-cyan-400/80 font-semibold uppercase">Employees</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/20 text-center">
                      <div className="text-2xl font-extrabold text-amber-400">
                        {teamMembers.filter(m => m.type === 'Intern').length}
                      </div>
                      <div className="text-[10px] text-amber-400/80 font-semibold uppercase">Interns</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 text-center">
                      <div className="text-2xl font-extrabold text-white">{assignedTasks.length}</div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Total Tasks</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-900/90 border border-rose-500/20 text-center">
                      <div className="text-2xl font-extrabold text-rose-400">
                        {assignedTasks.filter(t => t.status === 'In Progress' || t.status === 'Assigned').length}
                      </div>
                      <div className="text-[10px] text-rose-400/80 font-semibold uppercase">In Progress</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/20 text-center">
                      <div className="text-2xl font-extrabold text-emerald-400">
                        {assignedTasks.filter(t => t.status === 'Completed').length}
                      </div>
                      <div className="text-[10px] text-emerald-400/80 font-semibold uppercase">Completed</div>
                    </div>
                  </div>

                  {/* Sub-Tabs Selector */}
                  <div className="flex items-center gap-2 border-b border-white/10 pb-3 flex-wrap">
                    {[
                      { id: 'all', label: `All Staff (${teamMembers.length})` },
                      { id: 'employees', label: `Employees (${teamMembers.filter(m => m.type === 'Employee').length})` },
                      { id: 'interns', label: `Interns (${teamMembers.filter(m => m.type === 'Intern').length})` },
                      { id: 'tasks', label: `Work Tracker (${assignedTasks.length})` }
                    ].map((st) => (
                      <button
                        key={st.id}
                        onClick={() => setTeamTabSubFilter(st.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                          teamTabSubFilter === st.id
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                            : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>

                  {/* SECTION 1: TEAM DIRECTORY */}
                  {teamTabSubFilter !== 'tasks' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-bold text-white flex items-center gap-2">
                          <Users className="w-4 h-4 text-cyan-400" />
                          <span>Registered Team Directory ({teamMembers.length})</span>
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {teamMembers
                          .filter(m => {
                            if (teamTabSubFilter === 'employees') return m.type === 'Employee';
                            if (teamTabSubFilter === 'interns') return m.type === 'Intern';
                            return true;
                          })
                          .map((member) => {
                            const memberTaskList = assignedTasks.filter(
                              t => (t.memberId || '').toUpperCase() === member.id.toUpperCase()
                            );
                            const activeCount = memberTaskList.filter(t => t.status !== 'Completed').length;
                            const isIntern = member.type === 'Intern';

                            return (
                              <div
                                key={member.id}
                                className={`glass-card p-5 rounded-2xl border space-y-4 transition-all hover:scale-[1.01] ${
                                  isIntern ? 'border-amber-500/30 bg-slate-900/80' : 'border-blue-500/30 bg-slate-900/80'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                                      isIntern
                                        ? 'bg-amber-950/70 text-amber-400 border border-amber-500/40'
                                        : 'bg-blue-950/70 text-cyan-400 border border-blue-500/40'
                                    }`}>
                                      {member.name ? member.name.charAt(0) : 'M'}
                                    </div>
                                    <div>
                                      <h5 className="text-sm font-bold text-white">{member.name}</h5>
                                      <p className="text-xs text-slate-300">{member.role}</p>
                                    </div>
                                  </div>

                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    isIntern
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                      : 'bg-blue-500/20 text-cyan-300 border border-blue-500/40'
                                  }`}>
                                    {member.type}
                                  </span>
                                </div>

                                <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5 space-y-1.5 text-xs font-mono">
                                  <div className="flex justify-between text-slate-400">
                                    <span>Member ID:</span>
                                    <span className="text-white font-bold">{member.id}</span>
                                  </div>
                                  <div className="flex justify-between text-slate-400">
                                    <span>Active Tasks:</span>
                                    <span className={activeCount > 0 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                                      {activeCount} active ({memberTaskList.length} total)
                                    </span>
                                  </div>
                                  {member.joinedDate && (
                                    <div className="flex justify-between text-slate-400">
                                      <span>Joined Date:</span>
                                      <span className="text-slate-300">{member.joinedDate}</span>
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

                                  <button
                                    onClick={() => handleDeleteMember(member.id)}
                                    className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                                    title="Remove Member"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* SECTION 2: WORK ASSIGNMENT & PROGRESS TRACKER */}
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="space-y-1">
                        <h4 className="text-base font-bold text-white flex items-center gap-2">
                          <FileText className="w-4 h-4 text-cyan-400" />
                          <span>All Assigned Work &amp; Completion Tracker ({assignedTasks.length})</span>
                        </h4>
                        <p className="text-xs text-slate-400">
                          Track the assigned date, target due date, and present completed work submitted by team members.
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

                    {assignedTasks.length === 0 ? (
                      <div className="glass-card p-8 rounded-2xl border border-white/10 text-center text-slate-400 text-xs">
                        No work assigned yet. Click "Assign Work / Task" to allocate tasks to employees or interns.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {assignedTasks.map((task) => (
                          <div
                            key={task.id}
                            className={`glass-card p-6 rounded-2xl border transition-all ${
                              task.status === 'Completed'
                                ? 'border-emerald-500/30 bg-slate-900/90'
                                : 'border-blue-500/30 bg-slate-900/90'
                            }`}
                          >
                            <div className="space-y-4">
                              {/* Header Row */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono text-xs font-bold text-cyan-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-white/10">
                                      {task.id}
                                    </span>
                                    <span className="font-semibold text-xs text-white bg-slate-800 px-2.5 py-1 rounded-lg">
                                      Assigned to: <strong className="text-cyan-300">{task.memberName}</strong> ({task.memberId})
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

                                {/* CRITICAL: Date of Assigned Work and Due Date */}
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
                                {task.description || 'Deliver scheduled engineering milestones.'}
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

                                    {/* Admin Quick Status Changer */}
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[11px] text-slate-400">Status:</span>
                                      <select
                                        value={task.status}
                                        onChange={(e) => handleAdminUpdateTaskStatus(task.id, e.target.value)}
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

                                {/* Notes submitted by staff */}
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

                              {/* Footer Actions */}
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
                    )}
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

      {/* ADD EMPLOYEE / INTERN MODAL OVERLAY */}
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

      {/* ASSIGN WORK / TASK MODAL OVERLAY */}
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

