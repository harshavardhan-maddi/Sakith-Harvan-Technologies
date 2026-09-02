import React, { useState, useEffect } from 'react';
import { 
  Shield, Lock, Calendar, FileText, CheckCircle2, Trash2, Download, RefreshCw, 
  X, Search, UserCheck, BookOpen, Plus, Edit3, RotateCcw, Sparkles, Layers,
  LayoutDashboard, BarChart3, TrendingUp, Key, LogOut, ExternalLink, ArrowRight,
  Filter, ChevronRight, Clock, Users, Award, Building, Mail, Phone, Eye, Calculator,
  Briefcase, GraduationCap, Link as LinkIcon, Check, Crown, AlertCircle, CheckSquare,
  KeyRound, ShieldCheck
} from 'lucide-react';
import { 
  INITIAL_WORKSHOPS, 
  INITIAL_TEAM_MEMBERS, 
  INITIAL_ASSIGNED_TASKS,
  INITIAL_BATCHES,
  INITIAL_ASSESSMENTS,
  INITIAL_SUBMISSIONS
} from '../data/defaultData';
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
  // Authentication & Unified Role State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authenticatedRole, setAuthenticatedRole] = useState(null); // 'admin' | 'founder' | 'employee' | 'intern'
  const [authenticatedUser, setAuthenticatedUser] = useState(null); // { id, name, role, type, isExecutive, ... }
  
  // Single Input state for unified login
  const [authInput, setAuthInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // For Admin dashboard tabs: 'overview', 'quotation_maker', 'consultations', 'requirements', 'team_work', 'workshops', 'settings'

  // Founder Dashboard Sub-Tabs: 'manage_staff', 'all_tasks', 'my_tasks', 'quotation_maker', 'admin_leads'
  const [founderTab, setFounderTab] = useState('manage_staff');
  const [founderStaffFilter, setFounderStaffFilter] = useState('all'); // 'all', 'employees', 'interns'

  // Staff (Employee & Intern) Dashboard State
  const [staffTaskFilter, setStaffTaskFilter] = useState('All'); // 'All', 'In Progress', 'Completed'
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [workUpdateForm, setWorkUpdateForm] = useState({
    status: 'In Progress',
    progress: 0,
    completedWorkNotes: '',
    completedDate: '',
    deliverableUrl: ''
  });
  const [updateSuccessMsg, setUpdateSuccessMsg] = useState('');

  // Main Data States
  const [consultations, setConsultations] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [batches, setBatches] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  // Batch Management Modals & Selection
  const [isAddingBatch, setIsAddingBatch] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batchFormData, setBatchFormData] = useState({
    id: '',
    name: '',
    focus: '',
    mentor: 'Maddi Harshavardhan',
    startDate: new Date().toISOString().split('T')[0],
    description: ''
  });

  // Deep-dive Member Analytics Modal (for Intern or Employee)
  const [analyzingMember, setAnalyzingMember] = useState(null);

  // Add Member Modal State (Add Emp / Add Intern)
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

  // Filter & Search states for Team & Work tab in Admin
  const [teamTabSubFilter, setTeamTabSubFilter] = useState('tasks'); // 'tasks', 'interns', 'employees', 'batches', 'members'
  const [adminTaskSearch, setAdminTaskSearch] = useState('');
  const [adminTaskStatusFilter, setAdminTaskStatusFilter] = useState('All');
  const [adminTaskMemberFilter, setAdminTaskMemberFilter] = useState('');

  // Search & Filter state for Leads
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

  // Load storage & cloud data when modal opens
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

  // Real-time Event Listeners & Supabase Subscriptions
  useEffect(() => {
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

    // Supabase Realtime & Global Broadcast channel
    let channel = null;
    try {
      const channelId = `admin_portal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      channel = supabase
        .channel(channelId)
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
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'assigned_tasks' },
          () => {
            fetchTasksFromSupabase().then((dbTasks) => {
              if (dbTasks && dbTasks.length > 0) {
                setAssignedTasks(dbTasks);
                localStorage.setItem('sh_assigned_tasks', JSON.stringify(dbTasks));
              }
            });
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'team_members' },
          () => {
            fetchTeamMembersFromSupabase().then((dbMembers) => {
              if (dbMembers && dbMembers.length > 0) {
                const deletedIds = JSON.parse(localStorage.getItem('sh_deleted_members') || '[]');
                const filtered = dbMembers.filter((m) => !deletedIds.includes(m.id));
                setTeamMembers(filtered);
                localStorage.setItem('sh_team_members', JSON.stringify(filtered));
              }
            });
          }
        )
        .subscribe();
    } catch (e) {
      console.warn('Realtime subscription error:', e);
    }

    return () => {
      window.removeEventListener('sh_requirements_updated', handleReqUpdate);
      window.removeEventListener('sh_consultations_updated', handleConsultUpdate);
      window.removeEventListener('sh_team_updated', handleTeamUpdate);
      window.removeEventListener('sh_tasks_updated', handleTaskUpdate);
      if (channel) {
        try { supabase.removeChannel(channel); } catch (e) {}
      }
    };
  }, []);

  const loadStorageData = () => {
    const rawConsultations = localStorage.getItem('sh_consultations');
    const rawRequirements = localStorage.getItem('sh_requirements');
    const rawWorkshops = localStorage.getItem('sh_workshops');

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

    // Team Members
    const deletedIds = JSON.parse(localStorage.getItem('sh_deleted_members') || '[]');
    const rawTeam = localStorage.getItem('sh_team_members');
    let finalTeam;
    if (rawTeam === null) {
      finalTeam = INITIAL_TEAM_MEMBERS.filter((m) => !deletedIds.includes(m.id));
      localStorage.setItem('sh_team_members', JSON.stringify(finalTeam));
    } else {
      try {
        finalTeam = JSON.parse(rawTeam).filter((m) => !deletedIds.includes(m.id));
      } catch (e) {
        finalTeam = INITIAL_TEAM_MEMBERS.filter((m) => !deletedIds.includes(m.id));
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

    // Batches
    const rawBatches = localStorage.getItem('sh_intern_batches');
    let finalBatches;
    if (rawBatches === null) {
      finalBatches = INITIAL_BATCHES;
      localStorage.setItem('sh_intern_batches', JSON.stringify(INITIAL_BATCHES));
    } else {
      try {
        finalBatches = JSON.parse(rawBatches);
      } catch (e) {
        finalBatches = INITIAL_BATCHES;
      }
    }

    // Assessments
    const rawAssessments = localStorage.getItem('sh_intern_assessments');
    let finalAssessments;
    if (rawAssessments === null) {
      finalAssessments = INITIAL_ASSESSMENTS;
      localStorage.setItem('sh_intern_assessments', JSON.stringify(INITIAL_ASSESSMENTS));
    } else {
      try {
        finalAssessments = JSON.parse(rawAssessments);
      } catch (e) {
        finalAssessments = INITIAL_ASSESSMENTS;
      }
    }

    // Submissions
    const rawSubmissions = localStorage.getItem('sh_intern_submissions');
    let finalSubmissions;
    if (rawSubmissions === null) {
      finalSubmissions = INITIAL_SUBMISSIONS;
      localStorage.setItem('sh_intern_submissions', JSON.stringify(INITIAL_SUBMISSIONS));
    } else {
      try {
        finalSubmissions = JSON.parse(rawSubmissions);
      } catch (e) {
        finalSubmissions = INITIAL_SUBMISSIONS;
      }
    }

    setConsultations(finalConsultations);
    setRequirements(finalRequirements);
    setWorkshops(finalWorkshops);
    setTeamMembers(finalTeam);
    setAssignedTasks(finalTasks);
    setBatches(finalBatches);
    setAssessments(finalAssessments);
    setSubmissions(finalSubmissions);

    // Cloud fetch
    fetchConsultationsFromSupabase().then((dbData) => {
      if (dbData && dbData.length > 0) {
        setConsultations(dbData);
        localStorage.setItem('sh_consultations', JSON.stringify(dbData));
      }
    });

    fetchRequirementsFromSupabase().then((dbData) => {
      if (dbData && dbData.length > 0) {
        setRequirements(dbData);
        localStorage.setItem('sh_requirements', JSON.stringify(dbData));
      }
    });

    fetchWorkshopsFromSupabase().then((dbData) => {
      if (dbData && dbData.length > 0) {
        setWorkshops(dbData);
        localStorage.setItem('sh_workshops', JSON.stringify(dbData));
      }
    });

    fetchTeamMembersFromSupabase().then((dbData) => {
      if (dbData && dbData.length > 0) {
        setTeamMembers(dbData);
        localStorage.setItem('sh_team_members', JSON.stringify(dbData));
      }
    });

    fetchTasksFromSupabase().then((dbData) => {
      if (dbData && dbData.length > 0) {
        setAssignedTasks(dbData);
        localStorage.setItem('sh_assigned_tasks', JSON.stringify(dbData));
      }
    });
  };

  // =========================================================================
  // UNIFIED SINGLE-INPUT AUTHENTICATION ENGINE
  // Automatically detects role from entered ID: Admin, Founder/CEO, Employee, Intern
  // =========================================================================
  const handleLogin = (e, explicitId = null) => {
    if (e && e.preventDefault) e.preventDefault();
    setAuthError('');
    const raw = explicitId !== null ? explicitId : authInput;
    const cleanId = (raw || '').trim().toUpperCase();

    if (!cleanId) {
      setAuthError('Please enter your ID or Access PIN.');
      return;
    }

    const storedPin = (localStorage.getItem('sh_admin_pin') || '2526').trim().toUpperCase();

    // 1. Check Executive Admin PIN or Admin ID
    if (
      cleanId === storedPin || 
      cleanId === '2526' || 
      cleanId === 'SAKITH2026' || 
      cleanId === 'ADMIN' || 
      cleanId === 'ADM-01' || 
      cleanId === 'ADMIN-01'
    ) {
      const adminUser = {
        id: 'ADMIN',
        name: 'Executive Admin',
        role: 'System Administrator & Leads Manager',
        type: 'Executive Admin',
        isExecutive: true
      };
      setAuthenticatedUser(adminUser);
      setAuthenticatedRole('admin');
      setIsAuthenticated(true);
      setAuthError('');
      return;
    }

    // 2. Check Founder / CEO generic shortcuts
    if (cleanId === 'CEO' || cleanId === 'FOUNDER' || cleanId === 'MH' || cleanId === 'SK') {
      const targetId = cleanId === 'SK' ? 'FOUNDER-02' : 'CEO-01';
      const currentMembers = teamMembers.length > 0 ? teamMembers : INITIAL_TEAM_MEMBERS;
      const founderUser = currentMembers.find(m => (m.id || '').toUpperCase() === targetId) || {
        id: 'CEO-01',
        name: 'Maddi Harshavardhan',
        role: 'Co-Founder & CEO / Technical Lead',
        type: 'Founder & CEO',
        isExecutive: true
      };
      setAuthenticatedUser(founderUser);
      setAuthenticatedRole('founder');
      setIsAuthenticated(true);
      setAuthError('');
      return;
    }

    // 3. Match against Team Members Directory (Employees, Interns, Founders)
    const currentMembers = teamMembers.length > 0 ? teamMembers : INITIAL_TEAM_MEMBERS;
    const found = currentMembers.find(m => (m.id || '').trim().toUpperCase() === cleanId);

    if (found) {
      setAuthenticatedUser(found);
      if (found.isExecutive || (found.type && (found.type.includes('Founder') || found.type.includes('CEO')))) {
        setAuthenticatedRole('founder');
        setIsAuthenticated(true);
        setAuthError('');
      } else if (found.type && found.type.toLowerCase() === 'intern') {
        onOpenInternLogin(found);
      } else {
        onOpenEmpLogin(found);
      }
      return;
    }

    // 4. Not recognized
    setAuthError(`ID or PIN "${cleanId}" not recognized. Please check your assigned ID or Access PIN.`);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthenticatedRole(null);
    setAuthenticatedUser(null);
    setAuthInput('');
    setAuthError('');
    setEditingTaskId(null);
    setUpdateSuccessMsg('');
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

  // Team Member CRUD Handlers
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
    if (teamMembers.some(m => (m.id || '').toUpperCase() === cleanId)) {
      updatedTeam = teamMembers.map(m => (m.id || '').toUpperCase() === cleanId ? newMember : m);
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
      title: taskFormData.title,
      description: taskFormData.description,
      assignedDate: taskFormData.assignedDate || new Date().toISOString().split('T')[0],
      dueDate: taskFormData.dueDate || '',
      priority: taskFormData.priority || 'High',
      status: 'Assigned',
      progress: 0,
      completedDate: '',
      deliverableUrl: '',
      completedWorkNotes: ''
    };

    let updatedTasks = [];
    if (assignedTasks.some(t => t.id === newTask.id)) {
      updatedTasks = assignedTasks.map(t => t.id === newTask.id ? newTask : t);
    } else {
      updatedTasks = [newTask, ...assignedTasks];
    }

    setAssignedTasks(updatedTasks);
    localStorage.setItem('sh_assigned_tasks', JSON.stringify(updatedTasks));
    saveTaskToSupabase(newTask);
    window.dispatchEvent(new Event('sh_tasks_updated'));
    setIsAssigningTask(false);
  };

  const handleDeleteTask = (id) => {
    if (window.confirm(`Are you sure you want to delete task ${id}?`)) {
      const updated = assignedTasks.filter(t => t.id !== id);
      setAssignedTasks(updated);
      localStorage.setItem('sh_assigned_tasks', JSON.stringify(updated));
      deleteTaskFromSupabase(id);
      window.dispatchEvent(new Event('sh_tasks_updated'));
    }
  };

  // Staff: Work Update Handlers (for Employee, Intern & Founder inline review)
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

  const handleSaveWorkUpdate = (taskId) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const finalCompletedDate = workUpdateForm.status === 'Completed' 
      ? (workUpdateForm.completedDate || todayStr) 
      : workUpdateForm.completedDate;

    const updatedTasks = assignedTasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          status: workUpdateForm.status,
          progress: Number(workUpdateForm.progress),
          completedWorkNotes: workUpdateForm.completedWorkNotes,
          completedDate: finalCompletedDate,
          deliverableUrl: workUpdateForm.deliverableUrl
        };
      }
      return t;
    });

    setAssignedTasks(updatedTasks);
    localStorage.setItem('sh_assigned_tasks', JSON.stringify(updatedTasks));

    updateTaskInSupabase(taskId, {
      status: workUpdateForm.status,
      progress: Number(workUpdateForm.progress),
      completedWorkNotes: workUpdateForm.completedWorkNotes,
      completedDate: finalCompletedDate,
      deliverableUrl: workUpdateForm.deliverableUrl
    });

    window.dispatchEvent(new Event('sh_tasks_updated'));
    setEditingTaskId(null);
    setUpdateSuccessMsg(`Task ${taskId} deliverable successfully updated and synced!`);
    setTimeout(() => setUpdateSuccessMsg(''), 4000);
  };

  const handleFounderUpdateTaskStatus = (id, newStatus) => {
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
      id: 'ws-custom-' + Date.now(),
      title: '',
      category: 'Agentic AI & LLMs',
      description: '',
      learn: '',
      whoShouldAttend: 'B.Tech, M.Tech, MCA students & tech faculties',
      minDays: '3 Days',
      mode: 'Offline / Hands-on',
      upcomingDates: 'Available for Custom Institutional Scheduling',
      seats: 'Custom Slot Capacity'
    });
    setIsEditingWorkshop(true);
  };

  const handleOpenEditWorkshop = (ws) => {
    setWorkshopFormData({
      ...ws,
      learn: Array.isArray(ws.learn) ? ws.learn.join('\n') : ws.learn || ''
    });
    setIsEditingWorkshop(true);
  };

  const handleSaveWorkshop = (e) => {
    e.preventDefault();
    const formattedWorkshop = {
      ...workshopFormData,
      learn: typeof workshopFormData.learn === 'string' 
        ? workshopFormData.learn.split('\n').map(s => s.trim()).filter(Boolean)
        : workshopFormData.learn
    };

    let updatedList;
    const exists = workshops.some(w => w.id === formattedWorkshop.id);
    if (exists) {
      updatedList = workshops.map(w => w.id === formattedWorkshop.id ? formattedWorkshop : w);
    } else {
      updatedList = [formattedWorkshop, ...workshops];
    }

    setWorkshops(updatedList);
    localStorage.setItem('sh_workshops', JSON.stringify(updatedList));
    saveWorkshopToSupabase(formattedWorkshop);
    window.dispatchEvent(new Event('sh_workshops_updated'));
    setIsEditingWorkshop(false);
  };

  const handleDeleteWorkshop = (id) => {
    if (window.confirm('Are you sure you want to remove this workshop entry?')) {
      const updated = workshops.filter(w => w.id !== id);
      setWorkshops(updated);
      localStorage.setItem('sh_workshops', JSON.stringify(updated));
      deleteWorkshopFromSupabase(id);
      window.dispatchEvent(new Event('sh_workshops_updated'));
    }
  };

  const exportData = () => {
    const data = {
      consultations,
      requirements,
      workshops,
      teamMembers,
      assignedTasks,
      exportDate: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `sakith_harvan_portal_export_${new Date().toISOString().split('T')[0]}.json`);
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

  const newConsultationsCount = consultations.filter(c => c.status === 'New').length;
  const newRequirementsCount = requirements.filter(r => r.status === 'New' || r.status === 'In Review').length;
  const totalCategories = new Set(workshops.map(w => w.category)).size;

  // Filter tasks for standard member view
  const memberTasks = authenticatedUser
    ? assignedTasks.filter(
        (t) => (t.memberId || '').toUpperCase() === (authenticatedUser.id || '').toUpperCase()
      )
    : [];

  const filteredMemberTasks = memberTasks.filter((t) => {
    if (staffTaskFilter === 'In Progress') return t.status === 'In Progress' || t.status === 'Assigned';
    if (staffTaskFilter === 'Completed') return t.status === 'Completed';
    return true;
  });

  const completedCount = memberTasks.filter((t) => t.status === 'Completed').length;
  const inProgressCount = memberTasks.filter((t) => t.status === 'In Progress' || t.status === 'Assigned').length;

  // Helper to determine member type for staff tracking
  const getStaffMemberType = (memberId) => {
    const member = teamMembers.find(m => (m.id || '').toUpperCase() === (memberId || '').toUpperCase());
    if (member) return member.type || 'Employee';
    if ((memberId || '').toUpperCase().startsWith('INT')) return 'Intern';
    return 'Employee';
  };

  // Filtered tasks for Admin Work Progress Center
  const filteredAdminTasks = assignedTasks.filter((t) => {
    const memType = getStaffMemberType(t.memberId);
    
    // Sub-tab filter
    if (teamTabSubFilter === 'intern_tasks' && memType !== 'Intern') return false;
    if (teamTabSubFilter === 'emp_tasks' && memType !== 'Employee') return false;
    
    // Specific member filter
    if (adminTaskMemberFilter && (t.memberId || '').toUpperCase() !== adminTaskMemberFilter.toUpperCase()) {
      return false;
    }
    
    // Status filter
    if (adminTaskStatusFilter !== 'All' && t.status !== adminTaskStatusFilter) {
      return false;
    }
    
    // Search query
    if (adminTaskSearch) {
      const q = adminTaskSearch.toLowerCase();
      const matchTitle = (t.title || '').toLowerCase().includes(q);
      const matchDesc = (t.description || '').toLowerCase().includes(q);
      const matchMember = (t.memberName || '').toLowerCase().includes(q) || (t.memberId || '').toLowerCase().includes(q);
      const matchNotes = (t.completedWorkNotes || '').toLowerCase().includes(q);
      const matchDeliverable = (t.deliverableUrl || '').toLowerCase().includes(q);
      const matchId = (t.id || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchMember && !matchNotes && !matchDeliverable && !matchId) return false;
    }
    
    return true;
  });

  const adminInternTasksCount = assignedTasks.filter(t => getStaffMemberType(t.memberId) === 'Intern').length;
  const adminEmpTasksCount = assignedTasks.filter(t => getStaffMemberType(t.memberId) === 'Employee').length;
  const adminInProgressTasksCount = assignedTasks.filter(t => t.status === 'In Progress' || t.status === 'Assigned').length;
  const adminCompletedTasksCount = assignedTasks.filter(t => t.status === 'Completed').length;
  const adminAvgProgressRate = assignedTasks.length > 0
    ? Math.round(assignedTasks.reduce((acc, t) => acc + (Number(t.progress) || (t.status === 'Completed' ? 100 : 0)), 0) / assignedTasks.length)
    : 0;

  // Batch Management Handlers
  const handleOpenAddBatch = () => {
    const nextNum = batches.length + 1;
    setBatchFormData({
      id: `BATCH-0${nextNum}`,
      name: `Batch 2026-Cohort-${String.fromCharCode(64 + nextNum)} (AI & Cloud)`,
      focus: 'Agentic AI, Full Stack & Cloud Architecture',
      mentor: 'Maddi Harshavardhan',
      startDate: new Date().toISOString().split('T')[0],
      description: 'Intensive sprint cohort for interns with hands-on technical deliverables and mentor evaluations.'
    });
    setIsAddingBatch(true);
  };

  const handleSaveBatch = (e) => {
    e.preventDefault();
    if (!batchFormData.name) {
      alert('Please enter a batch name.');
      return;
    }

    const newBatch = {
      ...batchFormData,
      id: batchFormData.id || (`BATCH-${Date.now()}`),
      memberIds: batchFormData.memberIds || []
    };

    const updated = [newBatch, ...batches.filter(b => b.id !== newBatch.id)];
    setBatches(updated);
    localStorage.setItem('sh_intern_batches', JSON.stringify(updated));
    window.dispatchEvent(new Event('sh_batches_updated'));
    setIsAddingBatch(false);
    setUpdateSuccessMsg(`Batch "${newBatch.name}" created successfully!`);
    setTimeout(() => setUpdateSuccessMsg(''), 4000);
  };

  const handleDeleteBatch = (id) => {
    if (window.confirm('Are you sure you want to delete this batch?')) {
      const updated = batches.filter(b => b.id !== id);
      setBatches(updated);
      localStorage.setItem('sh_intern_batches', JSON.stringify(updated));
      window.dispatchEvent(new Event('sh_batches_updated'));
      if (selectedBatch?.id === id) setSelectedBatch(null);
    }
  };

  const handleOpenBatchDetails = (batch) => {
    setSelectedBatch(batch);
  };

  const handleOpenMemberAnalysis = (member) => {
    setAnalyzingMember(member);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col min-h-screen w-full overflow-hidden text-slate-100 font-sans animate-in fade-in duration-300">
      {!isAuthenticated ? (
        /* =================================================================== */
        /* UNIFIED SINGLE-INPUT LOGIN VIEW (ADMIN, FOUNDER, EMP, INTERN)       */
        /* =================================================================== */
        <div className="min-h-screen w-full flex flex-col justify-between p-6 sm:p-12 relative overflow-y-auto bg-grid-pattern">
          {/* Background Ambient Glows */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-red-600/15 blur-[140px] rounded-full pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

          {/* Top Header Row */}
          <div className="flex items-center justify-between z-10 w-full max-w-5xl mx-auto">
            <div className="flex items-center gap-3">
              <Logo size="md" />
            </div>

            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X className="w-4 h-4" />
              <span>Return to Website</span>
            </button>
          </div>

          {/* Center Full-Screen Unified Login Card */}
          <div className="max-w-xl w-full mx-auto my-auto z-10 py-6">
            <div className="glass-card p-6 sm:p-10 rounded-3xl border border-red-500/30 shadow-2xl shadow-red-950/40 space-y-6 text-center glow-blue">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-red-950 via-slate-900 to-red-900 border border-red-500/40 flex items-center justify-center mx-auto text-rose-400 shadow-lg shadow-red-500/20">
                <ShieldCheck className="w-10 h-10 animate-pulse text-rose-400" />
              </div>

              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/30 text-rose-300 text-[11px] font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Single Input Entry • Automatic Role Detection</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Unified Access Portal
                </h2>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Enter your assigned ID or Security PIN to authorize login as <strong>Executive Admin</strong>, <strong>CEO &amp; Founder</strong>, <strong>Employee</strong>, or <strong>Intern</strong>.
                </p>
              </div>

              {/* SINGLE UNIFIED INPUT FORM */}
              <form onSubmit={handleLogin} className="space-y-4 pt-2">
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-bold text-slate-200">
                    Employee / Intern / Founder ID or Admin Access PIN *
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={authInput}
                      onChange={(e) => {
                        setAuthInput(e.target.value);
                        setAuthError('');
                      }}
                      placeholder="Enter ID or Access PIN"
                      className="form-input pl-10 uppercase font-mono text-center tracking-wider text-sm sm:text-base font-bold border-red-500/40 focus:border-cyan-400 bg-slate-950/80"
                      autoFocus
                    />
                  </div>
                  {authError && (
                    <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs flex items-center gap-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                      <span>{authError}</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full py-3.5 text-sm font-bold glow-blue shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-98"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Authorize &amp; Open Portal</span>
                </button>
              </form>

              <div className="pt-2 border-t border-white/10 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Protected Enterprise System • Automatic Role Identification • Active Audit Logging</span>
              </div>
            </div>
          </div>

          {/* Footer Branding */}
          <div className="text-center text-xs text-slate-400 z-10 max-w-5xl mx-auto w-full">
            © {new Date().getFullYear()} Sakith Harvan Technologies. All Executive &amp; Management Rights Reserved.
          </div>
        </div>
      ) : (
        /* =================================================================== */
        /* AUTHENTICATED DASHBOARD (ADMIN / FOUNDER / EMPLOYEE / INTERN)        */
        /* =================================================================== */
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-950">
          {/* UNIVERSAL TOP HEADER BAR ACROSS ALL LOGGED-IN ROLES */}
          <header className="px-4 sm:px-6 py-3 bg-slate-900/90 border-b border-white/10 flex items-center justify-between gap-4 sticky top-0 z-30 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <Logo size="sm" />
              <div className="h-5 w-[1px] bg-white/20 hidden sm:block" />

              {/* User Identity Chip */}
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm ${
                  authenticatedRole === 'admin'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : authenticatedRole === 'founder'
                      ? 'bg-gradient-to-r from-red-600/30 to-amber-600/30 text-amber-300 border border-red-500/40'
                      : authenticatedRole === 'intern'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                }`}>
                  {authenticatedRole === 'admin' ? (
                    <Shield className="w-3.5 h-3.5 text-rose-400" />
                  ) : authenticatedRole === 'founder' ? (
                    <Crown className="w-3.5 h-3.5 text-amber-300" />
                  ) : authenticatedRole === 'intern' ? (
                    <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                  )}
                  <span>
                    {authenticatedUser?.name || 'Authorized User'} ({authenticatedUser?.id || 'AUTH'})
                  </span>
                  <span className="opacity-70 hidden md:inline">
                    • {authenticatedRole === 'admin' ? 'Executive Admin' : authenticatedUser?.type || authenticatedRole}
                  </span>
                </span>
              </div>
            </div>

            {/* Top Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Quick Switch for Founders & Admin */}
              {(authenticatedRole === 'admin' || authenticatedRole === 'founder') && (
                <button
                  onClick={() => {
                    if (authenticatedRole === 'admin') {
                      setActiveTab(activeTab === 'team_work' ? 'overview' : 'team_work');
                    } else {
                      setFounderTab(founderTab === 'quotation_maker' ? 'manage_staff' : 'quotation_maker');
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 border border-white/10 hidden sm:flex items-center gap-1.5 transition-all"
                >
                  <Calculator className="w-3.5 h-3.5 text-rose-400" />
                  <span>
                    {authenticatedRole === 'admin'
                      ? (activeTab === 'team_work' ? 'Switch to Overview' : 'Staff Tasks')
                      : (founderTab === 'quotation_maker' ? 'Staff Tracker' : 'Quotation Engine')}
                  </span>
                </button>
              )}

              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-red-950/60 text-slate-300 hover:text-rose-400 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all"
                title="Log Out of this session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Log Out</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-1"
                title="Exit to Public Website"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Close</span>
              </button>
            </div>
          </header>

          {/* DASHBOARD BODY PER ROLE */}
          {authenticatedRole === 'admin' ? (
            /* =============================================================== */
            /* 1. EXECUTIVE ADMIN DASHBOARD                                    */
            /* =============================================================== */
            <div className="flex-1 flex overflow-hidden bg-slate-950">
              {/* Sidebar */}
              <aside className="w-64 bg-slate-900/90 border-r border-white/10 flex flex-col justify-between shrink-0 hidden md:flex">
                <div className="p-6 space-y-6">
                  <div className="px-3 pb-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                    Admin Navigation Menu
                  </div>

                  <nav className="space-y-1">
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
                        <span>Intern &amp; Emp Work Progress</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-bold">
                        {assignedTasks.length}
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
                    <span>Export Data JSON</span>
                  </button>
                </div>
              </aside>

              {/* Main Tab Content */}
              <main className="flex-1 flex flex-col overflow-y-auto bg-slate-950">
                {/* Mobile Tab Selector */}
                <div className="p-4 md:hidden border-b border-white/10 bg-slate-900/60">
                  <select
                    value={activeTab}
                    onChange={(e) => setActiveTab(e.target.value)}
                    className="w-full bg-slate-900 border border-white/20 rounded-lg text-xs py-2 px-3 font-semibold text-cyan-400"
                  >
                    <option value="overview">Dashboard Overview</option>
                    <option value="quotation_maker">Quotation Maker Engine</option>
                    <option value="consultations">Consultations ({consultations.length})</option>
                    <option value="requirements">Requirements ({requirements.length})</option>
                    <option value="team_work">Intern &amp; Emp Work Progress ({assignedTasks.length} Tasks)</option>
                    <option value="workshops">Workshops &amp; Tech ({workshops.length})</option>
                    <option value="settings">Security &amp; PIN</option>
                  </select>
                </div>

                <div className="p-6 space-y-8 flex-1">
                  {/* TAB: OVERVIEW */}
                  {activeTab === 'overview' && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
                              <TrendingUp className="w-3.5 h-3.5" /> Live
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">{newConsultationsCount} pending new actions</p>
                        </div>

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
                          <p className="text-[11px] text-slate-400">{newRequirementsCount} under review</p>
                        </div>

                        <div className="glass-card p-5 rounded-2xl border border-rose-500/30 bg-slate-900/90 space-y-3">
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>Active Workshops</span>
                            <div className="p-2 rounded-lg bg-rose-950 text-rose-400 border border-rose-500/30">
                              <BookOpen className="w-4 h-4" />
                            </div>
                          </div>
                          <div className="flex items-baseline justify-between">
                            <div className="text-3xl font-extrabold text-white">{workshops.length}</div>
                            <span className="text-xs text-rose-400 font-semibold">{totalCategories} Domains</span>
                          </div>
                          <p className="text-[11px] text-slate-400">Live on public catalog</p>
                        </div>

                        <div className="glass-card p-5 rounded-2xl border border-emerald-500/30 bg-slate-900/90 space-y-3">
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>Team Members</span>
                            <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                              <Users className="w-4 h-4" />
                            </div>
                          </div>
                          <div className="flex items-baseline justify-between">
                            <div className="text-3xl font-extrabold text-white">{teamMembers.length}</div>
                            <span className="text-xs text-emerald-400 font-semibold">{assignedTasks.length} Tasks</span>
                          </div>
                          <p className="text-[11px] text-slate-400">Employees, Interns &amp; Founders</p>
                        </div>
                      </div>

                      {/* Recent Inquiries Quick Table */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-white text-sm flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-cyan-400" />
                              <span>Recent Consultations</span>
                            </h4>
                            <button onClick={() => setActiveTab('consultations')} className="text-xs text-cyan-400 hover:underline">
                              View All
                            </button>
                          </div>
                          <div className="space-y-2">
                            {consultations.slice(0, 4).map((c) => (
                              <div key={c.id} className="p-3 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between text-xs">
                                <div>
                                  <div className="font-bold text-white">{c.name}</div>
                                  <div className="text-[11px] text-slate-400">{c.organization || 'Individual'} • {c.type}</div>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  c.status === 'New' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {c.status || 'New'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-white text-sm flex items-center gap-2">
                              <FileText className="w-4 h-4 text-blue-400" />
                              <span>Recent Requirements</span>
                            </h4>
                            <button onClick={() => setActiveTab('requirements')} className="text-xs text-blue-400 hover:underline">
                              View All
                            </button>
                          </div>
                          <div className="space-y-2">
                            {requirements.slice(0, 4).map((r) => (
                              <div key={r.id} className="p-3 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between text-xs">
                                <div>
                                  <div className="font-bold text-white">{r.name}</div>
                                  <div className="text-[11px] text-slate-400">{r.category} • Budget: {r.budget || 'Custom'}</div>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  r.status === 'New' || r.status === 'In Review' ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {r.status || 'In Review'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB: QUOTATION MAKER */}
                  {activeTab === 'quotation_maker' && (
                    <div className="animate-in fade-in duration-300">
                      <QuotationMaker />
                    </div>
                  )}

                  {/* TAB: CONSULTATIONS */}
                  {activeTab === 'consultations' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md w-full">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search consultations by client, org, phone..."
                            className="form-input pl-10 text-xs w-full"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 font-semibold">Filter:</span>
                          <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="form-input text-xs py-1.5 px-3"
                          >
                            <option value="All">All Statuses ({consultations.length})</option>
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Scheduled">Scheduled</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {filteredConsultations.length === 0 ? (
                          <div className="glass-card p-12 text-center text-slate-400 text-xs">
                            No consultation bookings matched your search filter.
                          </div>
                        ) : (
                          filteredConsultations.map((c) => (
                            <div key={c.id} className="glass-card p-5 rounded-2xl border border-white/10 space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-white text-base">{c.name}</h4>
                                    <span className="text-xs font-mono text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-white/10">
                                      {c.id}
                                    </span>
                                  </div>
                                  <div className="text-xs text-slate-400">{c.organization || 'Individual Booking'} • Preferred: {c.preferredDate || 'Flexible'} ({c.preferredTime || 'Anytime'})</div>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                  <select
                                    value={c.status || 'New'}
                                    onChange={(e) => updateStatus(c.id, e.target.value, 'consultation')}
                                    className="form-input text-xs py-1 px-2.5 bg-slate-900 text-cyan-400 border-white/20"
                                  >
                                    <option value="New">New</option>
                                    <option value="Contacted">Contacted</option>
                                    <option value="Scheduled">Scheduled</option>
                                    <option value="Completed">Completed</option>
                                  </select>

                                  <button
                                    onClick={() => deleteItem(c.id, 'consultation')}
                                    className="p-1.5 rounded-lg bg-red-950/60 text-red-400 hover:text-white hover:bg-red-900 transition-all border border-red-500/30"
                                    title="Delete Record"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                                <div><strong className="text-slate-400">Phone:</strong> {c.phone}</div>
                                <div><strong className="text-slate-400">Email:</strong> {c.email}</div>
                                <div><strong className="text-slate-400">Category:</strong> {c.type}</div>
                                <div><strong className="text-slate-400">Submitted:</strong> {c.timestamp ? new Date(c.timestamp).toLocaleString() : 'Recent'}</div>
                              </div>

                              {c.message && (
                                <div className="p-3 rounded-xl bg-slate-950 border border-white/5 text-xs text-slate-300">
                                  <strong className="text-slate-400 block mb-1">Message / Requirements Scope:</strong>
                                  {c.message}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB: REQUIREMENTS */}
                  {activeTab === 'requirements' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md w-full">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search requirements by name, org, category..."
                            className="form-input pl-10 text-xs w-full"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 font-semibold">Filter:</span>
                          <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="form-input text-xs py-1.5 px-3"
                          >
                            <option value="All">All Statuses ({requirements.length})</option>
                            <option value="New">New</option>
                            <option value="In Review">In Review</option>
                            <option value="Proposal Sent">Proposal Sent</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {filteredRequirements.length === 0 ? (
                          <div className="glass-card p-12 text-center text-slate-400 text-xs">
                            No project requirements matched your search filter.
                          </div>
                        ) : (
                          filteredRequirements.map((r) => (
                            <div key={r.id} className="glass-card p-5 rounded-2xl border border-white/10 space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-white text-base">{r.name}</h4>
                                    <span className="text-xs font-mono text-blue-400 bg-slate-900 px-2 py-0.5 rounded border border-white/10">
                                      {r.id}
                                    </span>
                                  </div>
                                  <div className="text-xs text-slate-400">{r.organization || 'Independent Enterprise'} • Category: <strong className="text-cyan-400">{r.category}</strong></div>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                  <select
                                    value={r.status || 'In Review'}
                                    onChange={(e) => updateStatus(r.id, e.target.value, 'requirement')}
                                    className="form-input text-xs py-1 px-2.5 bg-slate-900 text-blue-400 border-white/20"
                                  >
                                    <option value="New">New</option>
                                    <option value="In Review">In Review</option>
                                    <option value="Proposal Sent">Proposal Sent</option>
                                    <option value="Closed">Closed</option>
                                  </select>

                                  <button
                                    onClick={() => deleteItem(r.id, 'requirement')}
                                    className="p-1.5 rounded-lg bg-red-950/60 text-red-400 hover:text-white hover:bg-red-900 transition-all border border-red-500/30"
                                    title="Delete Record"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-300">
                                <div><strong className="text-slate-400">Phone:</strong> {r.phone}</div>
                                <div><strong className="text-slate-400">Email:</strong> {r.email}</div>
                                <div><strong className="text-slate-400">Budget Range:</strong> {r.budget || 'Custom'}</div>
                              </div>

                              {r.scope && (
                                <div className="p-3 rounded-xl bg-slate-950 border border-white/5 text-xs text-slate-300">
                                  <strong className="text-slate-400 block mb-1">Detailed Technical Scope:</strong>
                                  {r.scope}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB: INTERN & EMP WORK PROGRESS CENTER */}
                  {activeTab === 'team_work' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      {/* Top Header Row & Work Progress Metrics */}
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <h3 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
                              <Users className="w-6 h-6 text-cyan-400" />
                              <span>Intern &amp; Employee Work Progress Center</span>
                            </h3>
                            <p className="text-xs text-slate-300">
                              Track real-time progress, review completed tasks, inspect submitted deliverables, and manage staff work assignments.
                            </p>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => handleOpenAssignTask('')}
                              className="btn-cyan text-xs py-2 px-3.5 flex items-center gap-1.5 font-bold shadow-lg shadow-cyan-600/20"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Assign Work</span>
                            </button>
                            <button
                              onClick={() => handleOpenAddMember('Employee')}
                              className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5 font-bold"
                            >
                              <Briefcase className="w-3.5 h-3.5" />
                              <span>Add Employee</span>
                            </button>
                            <button
                              onClick={() => handleOpenAddMember('Intern')}
                              className="px-3 py-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                            >
                              <GraduationCap className="w-3.5 h-3.5" />
                              <span>Add Intern</span>
                            </button>
                          </div>
                        </div>

                        {/* 4 KPI Summary Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                          <div className="glass-card p-4 rounded-2xl border border-blue-500/30 bg-slate-900/90 space-y-2">
                            <div className="flex items-center justify-between text-xs text-slate-400">
                              <span>Total Company Tasks</span>
                              <div className="p-1.5 rounded-lg bg-blue-950 text-blue-400 border border-blue-500/30">
                                <CheckSquare className="w-4 h-4" />
                              </div>
                            </div>
                            <div className="text-2xl font-extrabold text-white">{assignedTasks.length}</div>
                            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${adminAvgProgressRate}%` }} />
                            </div>
                            <p className="text-[10px] text-slate-400">{adminAvgProgressRate}% Overall Completion Rate</p>
                          </div>

                          <div className="glass-card p-4 rounded-2xl border border-amber-500/30 bg-slate-900/90 space-y-2">
                            <div className="flex items-center justify-between text-xs text-slate-400">
                              <span>Intern Work Progress</span>
                              <div className="p-1.5 rounded-lg bg-amber-950 text-amber-400 border border-amber-500/30">
                                <GraduationCap className="w-4 h-4" />
                              </div>
                            </div>
                            <div className="text-2xl font-extrabold text-amber-300">{adminInternTasksCount} <span className="text-xs text-slate-400 font-normal">Tasks</span></div>
                            <p className="text-[10px] text-amber-400/90 font-medium">
                              {teamMembers.filter(m => m.type === 'Intern').length} Active Interns
                            </p>
                          </div>

                          <div className="glass-card p-4 rounded-2xl border border-cyan-500/30 bg-slate-900/90 space-y-2">
                            <div className="flex items-center justify-between text-xs text-slate-400">
                              <span>Employee Work Progress</span>
                              <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                                <Briefcase className="w-4 h-4" />
                              </div>
                            </div>
                            <div className="text-2xl font-extrabold text-cyan-300">{adminEmpTasksCount} <span className="text-xs text-slate-400 font-normal">Tasks</span></div>
                            <p className="text-[10px] text-cyan-400/90 font-medium">
                              {teamMembers.filter(m => m.type === 'Employee').length} Full-Time Engineers
                            </p>
                          </div>

                          <div className="glass-card p-4 rounded-2xl border border-emerald-500/30 bg-slate-900/90 space-y-2">
                            <div className="flex items-center justify-between text-xs text-slate-400">
                              <span>Completed Deliverables</span>
                              <div className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                            </div>
                            <div className="text-2xl font-extrabold text-emerald-400">{adminCompletedTasksCount} <span className="text-xs text-slate-400 font-normal">Done</span></div>
                            <p className="text-[10px] text-emerald-300/80 font-medium">
                              {adminInProgressTasksCount} active tasks in progress
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Sub-Tabs Selector */}
                      <div className="flex items-center gap-2 border-b border-white/10 pb-3 flex-wrap">
                        {[
                          { id: 'tasks', label: `📋 All Tasks (${assignedTasks.length})` },
                          { id: 'interns', label: `🎓 Interns (${teamMembers.filter(m => m.type === 'Intern').length})` },
                          { id: 'employees', label: `💼 Employees (${teamMembers.filter(m => m.type === 'Employee').length})` },
                          { id: 'batches', label: `📦 Batches (${batches.length})` },
                          { id: 'intern_tasks', label: `🎯 Intern Tasks (${adminInternTasksCount})` },
                          { id: 'emp_tasks', label: `⚡ Emp Tasks (${adminEmpTasksCount})` },
                          { id: 'members', label: `👥 Directory (${teamMembers.length})` }
                        ].map((subTab) => (
                          <button
                            key={subTab.id}
                            onClick={() => {
                              setTeamTabSubFilter(subTab.id);
                              setAdminTaskMemberFilter('');
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                              teamTabSubFilter === subTab.id
                                ? subTab.id === 'interns' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                                : subTab.id === 'employees' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                                : subTab.id === 'batches' ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                                : 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                          >
                            {subTab.label}
                          </button>
                        ))}
                      </div>

                      {/* 1. VIEW: TASKS LIST WITH PROGRESS & REVIEWS (for 'tasks', 'intern_tasks', 'emp_tasks') */}
                      {(teamTabSubFilter === 'tasks' || teamTabSubFilter === 'intern_tasks' || teamTabSubFilter === 'emp_tasks') && (
                        <div className="space-y-4">
                          {/* Search, Member Select & Status Filter Controls */}
                          <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-3 bg-slate-900/60">
                            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                              <div className="sm:col-span-2 lg:col-span-2 relative">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                                <input
                                  type="text"
                                  value={adminTaskSearch}
                                  onChange={(e) => setAdminTaskSearch(e.target.value)}
                                  placeholder="Search by task title, member name, ID, or deliverable..."
                                  className="form-input pl-10 text-xs"
                                />
                                {adminTaskSearch && (
                                  <button
                                    onClick={() => setAdminTaskSearch('')}
                                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>

                              <div>
                                <select
                                  value={adminTaskStatusFilter}
                                  onChange={(e) => setAdminTaskStatusFilter(e.target.value)}
                                  className="form-input text-xs"
                                >
                                  <option value="All">All Statuses</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Assigned">Assigned</option>
                                  <option value="Completed">Completed</option>
                                </select>
                              </div>

                              <div>
                                <select
                                  value={adminTaskMemberFilter}
                                  onChange={(e) => setAdminTaskMemberFilter(e.target.value)}
                                  className="form-input text-xs"
                                >
                                  <option value="">Filter by Staff Member (All)</option>
                                  {teamMembers.map((m) => (
                                    <option key={m.id} value={m.id}>
                                      {m.name} ({m.id} - {m.type})
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>

                          {filteredAdminTasks.length === 0 ? (
                            <div className="glass-card p-12 text-center text-slate-400 space-y-3 rounded-2xl border border-white/10">
                              <CheckCircle2 className="w-12 h-12 text-slate-500 mx-auto" />
                              <div className="font-bold text-white text-base">No Matching Tasks Found</div>
                              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                No tasks match the current search or status filter. Try clearing filters or assign a new task.
                              </p>
                              <button
                                onClick={() => {
                                  setAdminTaskSearch('');
                                  setAdminTaskStatusFilter('All');
                                  setAdminTaskMemberFilter('');
                                }}
                                className="btn-secondary py-2 px-4 text-xs mx-auto"
                              >
                                Clear All Filters
                              </button>
                            </div>
                          ) : (
                            filteredAdminTasks.map((t) => {
                              const memType = getStaffMemberType(t.memberId);
                              const progressVal = Number(t.progress) || (t.status === 'Completed' ? 100 : t.status === 'In Progress' ? 50 : 0);
                              const isEditingThis = editingTaskId === t.id;

                              return (
                                <div
                                  key={t.id}
                                  className={`glass-card p-5 sm:p-6 rounded-2xl border transition-all space-y-4 ${
                                    t.status === 'Completed'
                                      ? 'border-emerald-500/40 bg-slate-900/90'
                                      : t.status === 'In Progress'
                                      ? 'border-cyan-500/30 bg-slate-900/80 glow-blue'
                                      : 'border-white/10 bg-slate-900/60'
                                  }`}
                                >
                                  {/* Top Header Line */}
                                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-3.5">
                                    <div className="space-y-1.5">
                                      <div className="flex items-center gap-2.5 flex-wrap">
                                        <h4 className="font-extrabold text-white text-base sm:text-lg tracking-tight">
                                          {t.title}
                                        </h4>
                                        <span className="text-xs font-mono text-cyan-400 bg-slate-950 px-2.5 py-0.5 rounded-full border border-white/10 font-bold">
                                          {t.id}
                                        </span>
                                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                          t.priority === 'High'
                                            ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                                            : t.priority === 'Medium'
                                            ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                                            : 'bg-slate-800 text-slate-300 border border-white/10'
                                        }`}>
                                          {t.priority || 'High'} Priority
                                        </span>
                                      </div>

                                      {/* Assignee Badge */}
                                      <div className="flex items-center gap-2 text-xs flex-wrap">
                                        <span className="text-slate-400">Assigned to:</span>
                                        <span className="inline-flex items-center gap-1.5 font-bold text-white bg-slate-800/90 px-2.5 py-1 rounded-lg border border-white/10">
                                          {memType === 'Intern' ? (
                                            <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                                          ) : (
                                            <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                                          )}
                                          <span>{t.memberName || t.memberId}</span>
                                          <span className="text-[10px] font-mono text-slate-400">({t.memberId})</span>
                                        </span>

                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                          memType === 'Intern'
                                            ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                                            : 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                                        }`}>
                                          {memType}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Status Controls & Actions */}
                                    <div className="flex items-center gap-2 shrink-0">
                                      <select
                                        value={t.status || 'In Progress'}
                                        onChange={(e) => handleFounderUpdateTaskStatus(t.id, e.target.value)}
                                        className={`form-input text-xs py-1.5 px-3 font-bold rounded-xl border ${
                                          t.status === 'Completed'
                                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                                            : t.status === 'In Progress'
                                            ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
                                            : 'bg-blue-950 text-blue-300 border-blue-500/40'
                                        }`}
                                      >
                                        <option value="Assigned">Assigned</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                      </select>

                                      <button
                                        onClick={() => isEditingThis ? setEditingTaskId(null) : handleStartUpdate(t)}
                                        className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-cyan-400 hover:bg-slate-700 transition-colors border border-white/10 text-xs font-semibold flex items-center gap-1"
                                        title="Review / Edit Work Progress"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">{isEditingThis ? 'Close Review' : 'Review Work'}</span>
                                      </button>

                                      <button
                                        onClick={() => handleDeleteTask(t.id)}
                                        className="p-2 rounded-xl bg-red-950/60 text-red-400 hover:text-white hover:bg-red-900/80 transition-colors border border-red-500/30"
                                        title="Delete Task"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* LIVE WORK PROGRESS BAR */}
                                  <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-950/70 border border-white/10">
                                    <div className="flex items-center justify-between text-xs">
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-300">Live Progress:</span>
                                        <span className={`font-mono font-extrabold ${
                                          progressVal === 100
                                            ? 'text-emerald-400'
                                            : progressVal > 50
                                            ? 'text-cyan-300'
                                            : 'text-amber-300'
                                        }`}>
                                          {progressVal}%
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                          t.status === 'Completed'
                                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                            : t.status === 'In Progress'
                                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                        }`}>
                                          <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                                          <span>{t.status || 'In Progress'}</span>
                                        </span>
                                      </div>
                                    </div>

                                    <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-white/10">
                                      <div
                                        className={`h-full rounded-full transition-all duration-500 ${
                                          progressVal === 100
                                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                                            : progressVal >= 50
                                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                                            : 'bg-gradient-to-r from-amber-500 to-orange-500'
                                        }`}
                                        style={{ width: `${progressVal}%` }}
                                      />
                                    </div>
                                  </div>

                                  {/* Task Description & Dates */}
                                  <div className="space-y-2">
                                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                                      {t.description}
                                    </p>

                                    <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap pt-1">
                                      <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-blue-400" />
                                        <span>Assigned: <strong className="text-slate-300">{t.assignedDate || 'N/A'}</strong></span>
                                      </div>

                                      {t.dueDate && (
                                        <div className="flex items-center gap-1.5">
                                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                                          <span>Due Date: <strong className="text-slate-300">{t.dueDate}</strong></span>
                                        </div>
                                      )}

                                      {t.completedDate && (
                                        <div className="flex items-center gap-1.5">
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                          <span>Completed on: <strong className="text-emerald-300">{t.completedDate}</strong></span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* STAFF WORK NOTES & DELIVERABLES */}
                                  {(t.completedWorkNotes || t.deliverableUrl) && (
                                    <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/20 space-y-2.5">
                                      {t.completedWorkNotes && (
                                        <div className="space-y-1 text-xs">
                                          <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                                            <FileText className="w-3.5 h-3.5 text-cyan-400" />
                                            <span>Staff Submitted Work Notes:</span>
                                          </div>
                                          <p className="text-slate-300 bg-slate-900/90 p-3 rounded-lg border border-white/5 whitespace-pre-wrap leading-relaxed">
                                            {t.completedWorkNotes}
                                          </p>
                                        </div>
                                      )}

                                      {t.deliverableUrl && (
                                        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-white/5">
                                          <div className="text-xs text-slate-300 font-bold flex items-center gap-1.5">
                                            <LinkIcon className="w-3.5 h-3.5 text-rose-400" />
                                            <span>Deliverable Link:</span>
                                          </div>
                                          <a
                                            href={t.deliverableUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="btn-cyan py-1.5 px-3 text-xs font-bold flex items-center gap-1.5 glow-blue shadow-md"
                                          >
                                            <span>Open Deliverable</span>
                                            <ExternalLink className="w-3.5 h-3.5" />
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* INLINE ADMIN WORK REVIEW & UPDATE DRAWER */}
                                  {isEditingThis && (
                                    <div className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-4 animate-in slide-in-from-top-4 duration-200">
                                      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                                        <div className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                                          <Edit3 className="w-4 h-4 text-cyan-400" />
                                          <span>Executive Admin Review &amp; Progress Override for {t.id}</span>
                                        </div>
                                        <button
                                          onClick={() => setEditingTaskId(null)}
                                          className="text-slate-400 hover:text-white"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>

                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                        <div>
                                          <label className="block font-semibold text-slate-300 mb-1">Status</label>
                                          <select
                                            value={workUpdateForm.status}
                                            onChange={(e) => {
                                              const newSt = e.target.value;
                                              setWorkUpdateForm({
                                                ...workUpdateForm,
                                                status: newSt,
                                                progress: newSt === 'Completed' ? 100 : workUpdateForm.progress
                                              });
                                            }}
                                            className="form-input text-xs"
                                          >
                                            <option value="Assigned">Assigned</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Completed">Completed</option>
                                          </select>
                                        </div>

                                        <div>
                                          <div className="flex items-center justify-between mb-1">
                                            <label className="font-semibold text-slate-300">Progress Percentage</label>
                                            <span className="font-mono font-bold text-cyan-400">{workUpdateForm.progress}%</span>
                                          </div>
                                          <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            step="5"
                                            value={workUpdateForm.progress}
                                            onChange={(e) => setWorkUpdateForm({
                                              ...workUpdateForm,
                                              progress: Number(e.target.value),
                                              status: Number(e.target.value) === 100 ? 'Completed' : 'In Progress'
                                            })}
                                            className="w-full accent-cyan-400 cursor-pointer"
                                          />
                                        </div>

                                        <div className="sm:col-span-2">
                                          <label className="block font-semibold text-slate-300 mb-1">
                                            Deliverable URL (GitHub / Google Drive / Figma / Live Demo)
                                          </label>
                                          <input
                                            type="url"
                                            value={workUpdateForm.deliverableUrl}
                                            onChange={(e) => setWorkUpdateForm({ ...workUpdateForm, deliverableUrl: e.target.value })}
                                            placeholder="https://github.com/..."
                                            className="form-input text-xs"
                                          />
                                        </div>

                                        <div className="sm:col-span-2">
                                          <label className="block font-semibold text-slate-300 mb-1">
                                            Completed Work Notes &amp; Summary
                                          </label>
                                          <textarea
                                            rows="3"
                                            value={workUpdateForm.completedWorkNotes}
                                            onChange={(e) => setWorkUpdateForm({ ...workUpdateForm, completedWorkNotes: e.target.value })}
                                            placeholder="Add review notes, deliverables checklist, or verification comments..."
                                            className="form-input text-xs"
                                          />
                                        </div>
                                      </div>

                                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                                        <button
                                          type="button"
                                          onClick={() => setEditingTaskId(null)}
                                          className="btn-secondary py-2 px-3.5 text-xs"
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleSaveWorkUpdate(t.id)}
                                          className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5"
                                        >
                                          <Check className="w-3.5 h-3.5" />
                                          <span>Save &amp; Sync Review</span>
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}

                      {/* 2. VIEW: INTERNS DIRECTORY & ANALYTICS */}
                      {teamTabSubFilter === 'interns' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                              <h4 className="text-base font-bold text-white flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-amber-400" />
                                <span>Interns Directory, Performance &amp; Completion Analytics</span>
                              </h4>
                              <p className="text-xs text-slate-400">
                                Real-time completion rates (% of completed tasks by given tasks), performance scores, and cohort batches.
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={handleOpenAddBatch}
                                className="px-3 py-1.5 rounded-xl bg-violet-950/80 hover:bg-violet-900 text-violet-300 border border-violet-500/40 text-xs font-bold flex items-center gap-1.5"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Create Batch</span>
                              </button>
                              <button
                                onClick={() => handleOpenAddMember('Intern')}
                                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-600/30"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Register Intern</span>
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {teamMembers
                              .filter((m) => m.type === 'Intern')
                              .map((intern) => {
                                const intTasks = assignedTasks.filter(
                                  (t) => (t.memberId || '').toUpperCase() === intern.id.toUpperCase()
                                );
                                const intCompleted = intTasks.filter((t) => t.status === 'Completed').length;
                                const completionPct = intTasks.length > 0 ? Math.round((intCompleted / intTasks.length) * 100) : 0;
                                const score = intern.performanceScore || 92;

                                return (
                                  <div
                                    key={intern.id}
                                    className="glass-card p-5 rounded-2xl border border-amber-500/20 bg-slate-900/80 space-y-4 flex flex-col justify-between hover:border-amber-500/50 transition-all shadow-lg"
                                  >
                                    <div className="space-y-3">
                                      {/* Header */}
                                      <div className="flex items-start justify-between">
                                        <div>
                                          <div className="font-extrabold text-white text-base flex items-center gap-2">
                                            <span>{intern.name}</span>
                                            <span className="text-[10px] font-mono text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/30">
                                              {intern.id}
                                            </span>
                                          </div>
                                          <div className="text-xs text-slate-300 font-medium">{intern.role}</div>
                                          <div className="text-[11px] text-amber-300/90 font-semibold mt-1 flex items-center gap-1">
                                            <Award className="w-3.5 h-3.5 text-amber-400" />
                                            <span>{intern.batch || 'Batch 2026-Alpha (AI & ML)'}</span>
                                          </div>
                                        </div>

                                        <button
                                          onClick={() => handleDeleteMember(intern.id)}
                                          className="text-slate-500 hover:text-rose-400 p-1"
                                          title="Remove Intern"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>

                                      {/* Metrics Grid */}
                                      <div className="grid grid-cols-2 gap-2 pt-1">
                                        {/* Completion Percentage */}
                                        <div className="p-3 rounded-xl bg-slate-950 border border-white/10 space-y-1">
                                          <div className="text-[10px] text-slate-400">Task Completion</div>
                                          <div className="text-xl font-extrabold text-cyan-400 font-mono">
                                            {completionPct}%
                                          </div>
                                          <div className="text-[10px] text-slate-400">
                                            {intCompleted} of {intTasks.length} done
                                          </div>
                                        </div>

                                        {/* Performance Score */}
                                        <div className="p-3 rounded-xl bg-slate-950 border border-white/10 space-y-1">
                                          <div className="text-[10px] text-slate-400">Performance</div>
                                          <div className="text-xl font-extrabold text-amber-300 font-mono">
                                            {score}/100
                                          </div>
                                          <div className="text-[10px] text-emerald-400 font-semibold">
                                            {score >= 90 ? '★ Top Tier' : score >= 80 ? 'Good Standing' : 'Needs Review'}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Progress Bar */}
                                      <div className="space-y-1">
                                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                                          <div
                                            className={`h-full rounded-full ${
                                              completionPct === 100 ? 'bg-emerald-400' : completionPct >= 50 ? 'bg-cyan-400' : 'bg-amber-400'
                                            }`}
                                            style={{ width: `${completionPct}%` }}
                                          />
                                        </div>
                                      </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                                      <button
                                        onClick={() => handleOpenMemberAnalysis(intern)}
                                        className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold flex items-center gap-1.5 border border-amber-500/30"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>Full Analysis</span>
                                      </button>

                                      <button
                                        onClick={() => handleOpenAssignTask(intern.id)}
                                        className="btn-cyan py-1.5 px-3 text-xs font-bold flex items-center gap-1"
                                      >
                                        <Plus className="w-3 h-3" />
                                        <span>Assign Task</span>
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}

                      {/* 3. VIEW: EMPLOYEES DIRECTORY & ANALYTICS */}
                      {teamTabSubFilter === 'employees' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                              <h4 className="text-base font-bold text-white flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-cyan-400" />
                                <span>Full-Time Employees &amp; Engineering Workload Analytics</span>
                              </h4>
                              <p className="text-xs text-slate-400">
                                Engineering staff tasks completion rate, performance ratings, and work assignments.
                              </p>
                            </div>
                            <button
                              onClick={() => handleOpenAddMember('Employee')}
                              className="btn-primary py-1.5 px-3.5 text-xs font-bold flex items-center gap-1.5"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Register Employee</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {teamMembers
                              .filter((m) => m.type === 'Employee')
                              .map((emp) => {
                                const empTasks = assignedTasks.filter(
                                  (t) => (t.memberId || '').toUpperCase() === emp.id.toUpperCase()
                                );
                                const empCompleted = empTasks.filter((t) => t.status === 'Completed').length;
                                const completionPct = empTasks.length > 0 ? Math.round((empCompleted / empTasks.length) * 100) : 0;
                                const score = emp.performanceScore || 95;

                                return (
                                  <div
                                    key={emp.id}
                                    className="glass-card p-5 rounded-2xl border border-cyan-500/20 bg-slate-900/80 space-y-4 flex flex-col justify-between hover:border-cyan-500/50 transition-all shadow-lg"
                                  >
                                    <div className="space-y-3">
                                      <div className="flex items-start justify-between">
                                        <div>
                                          <div className="font-extrabold text-white text-base flex items-center gap-2">
                                            {emp.isExecutive && <Crown className="w-4 h-4 text-amber-300" />}
                                            <span>{emp.name}</span>
                                            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30">
                                              {emp.id}
                                            </span>
                                          </div>
                                          <div className="text-xs text-slate-300 font-medium">{emp.role}</div>
                                          {emp.email && <div className="text-[11px] text-slate-400 mt-0.5">{emp.email}</div>}
                                        </div>

                                        {!emp.isExecutive && (
                                          <button
                                            onClick={() => handleDeleteMember(emp.id)}
                                            className="text-slate-500 hover:text-rose-400 p-1"
                                            title="Remove Employee"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        )}
                                      </div>

                                      {/* Metrics Grid */}
                                      <div className="grid grid-cols-2 gap-2 pt-1">
                                        <div className="p-3 rounded-xl bg-slate-950 border border-white/10 space-y-1">
                                          <div className="text-[10px] text-slate-400">Task Completion</div>
                                          <div className="text-xl font-extrabold text-cyan-400 font-mono">
                                            {completionPct}%
                                          </div>
                                          <div className="text-[10px] text-slate-400">
                                            {empCompleted} of {empTasks.length} done
                                          </div>
                                        </div>

                                        <div className="p-3 rounded-xl bg-slate-950 border border-white/10 space-y-1">
                                          <div className="text-[10px] text-slate-400">Performance Score</div>
                                          <div className="text-xl font-extrabold text-emerald-400 font-mono">
                                            {score}/100
                                          </div>
                                          <div className="text-[10px] text-emerald-400 font-semibold">
                                            {score >= 90 ? '★ Exceptional' : 'Active'}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Progress Bar */}
                                      <div className="space-y-1">
                                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                                          <div
                                            className={`h-full rounded-full ${
                                              completionPct === 100 ? 'bg-emerald-400' : completionPct >= 50 ? 'bg-cyan-400' : 'bg-amber-400'
                                            }`}
                                            style={{ width: `${completionPct}%` }}
                                          />
                                        </div>
                                      </div>
                                    </div>

                                    <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                                      <button
                                        onClick={() => handleOpenMemberAnalysis(emp)}
                                        className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold flex items-center gap-1.5 border border-cyan-500/30"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>Full Analysis</span>
                                      </button>

                                      <button
                                        onClick={() => handleOpenAssignTask(emp.id)}
                                        className="btn-cyan py-1.5 px-3 text-xs font-bold flex items-center gap-1"
                                      >
                                        <Plus className="w-3 h-3" />
                                        <span>Assign Task</span>
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}

                      {/* 4. VIEW: INTERN BATCHES MANAGEMENT */}
                      {teamTabSubFilter === 'batches' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                              <h4 className="text-base font-bold text-white flex items-center gap-2">
                                <Layers className="w-5 h-5 text-violet-400" />
                                <span>Intern Batches &amp; Cohort Analytics Engine</span>
                              </h4>
                              <p className="text-xs text-slate-400">
                                Create named intern batches, track batch-level task completion %, and inspect top performers in each cohort.
                              </p>
                            </div>
                            <button
                              onClick={handleOpenAddBatch}
                              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-violet-600/30"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Create Named Batch</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {batches.map((batch) => {
                              // Find interns belonging to this batch
                              const batchInterns = teamMembers.filter(
                                (m) => m.type === 'Intern' && (m.batch === batch.name || batch.memberIds?.includes(m.id))
                              );

                              // Calculate batch tasks and completion
                              const batchInternIds = batchInterns.map((i) => i.id.toUpperCase());
                              const batchTasks = assignedTasks.filter((t) =>
                                batchInternIds.includes((t.memberId || '').toUpperCase())
                              );
                              const batchCompletedTasks = batchTasks.filter((t) => t.status === 'Completed').length;
                              const batchCompletionRate =
                                batchTasks.length > 0 ? Math.round((batchCompletedTasks / batchTasks.length) * 100) : 0;

                              const batchAvgScore =
                                batchInterns.length > 0
                                  ? Math.round(
                                      batchInterns.reduce((acc, curr) => acc + (curr.performanceScore || 90), 0) /
                                        batchInterns.length
                                    )
                                  : 90;

                              // Calculate Top Intern Performer in this batch
                              let topIntern = null;
                              if (batchInterns.length > 0) {
                                topIntern = [...batchInterns].sort((a, b) => {
                                  const aTasks = assignedTasks.filter((t) => (t.memberId || '').toUpperCase() === a.id.toUpperCase());
                                  const aComp = aTasks.length > 0 ? aTasks.filter(t => t.status === 'Completed').length / aTasks.length : 0;
                                  const bTasks = assignedTasks.filter((t) => (t.memberId || '').toUpperCase() === b.id.toUpperCase());
                                  const bComp = bTasks.length > 0 ? bTasks.filter(t => t.status === 'Completed').length / bTasks.length : 0;
                                  
                                  const aScore = (a.performanceScore || 90) + aComp * 10;
                                  const bScore = (b.performanceScore || 90) + bComp * 10;
                                  return bScore - aScore;
                                })[0];
                              }

                              return (
                                <div
                                  key={batch.id}
                                  className="glass-card p-6 rounded-3xl border border-violet-500/30 bg-slate-900/90 space-y-4 flex flex-col justify-between hover:border-violet-500/60 transition-all shadow-xl"
                                >
                                  <div className="space-y-3">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-[10px] font-mono text-violet-300 bg-violet-950 px-2.5 py-0.5 rounded-full border border-violet-500/30 font-bold">
                                            {batch.id}
                                          </span>
                                          <span className="text-xs text-slate-400">Started: {batch.startDate || '2026-06-01'}</span>
                                        </div>
                                        <h4 className="font-extrabold text-white text-lg mt-1">{batch.name}</h4>
                                        <p className="text-xs text-cyan-300 font-medium">{batch.focus}</p>
                                      </div>

                                      <button
                                        onClick={() => handleDeleteBatch(batch.id)}
                                        className="text-slate-500 hover:text-rose-400 p-1"
                                        title="Delete Batch"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>

                                    {/* Batch Completion & Metrics */}
                                    <div className="grid grid-cols-3 gap-2">
                                      <div className="p-3 rounded-xl bg-slate-950 border border-white/10 text-center space-y-0.5">
                                        <div className="text-[10px] text-slate-400">Interns</div>
                                        <div className="text-lg font-bold text-white">{batchInterns.length}</div>
                                      </div>
                                      <div className="p-3 rounded-xl bg-slate-950 border border-white/10 text-center space-y-0.5">
                                        <div className="text-[10px] text-slate-400">Batch % Done</div>
                                        <div className="text-lg font-bold text-violet-400 font-mono">
                                          {batchCompletionRate}%
                                        </div>
                                      </div>
                                      <div className="p-3 rounded-xl bg-slate-950 border border-white/10 text-center space-y-0.5">
                                        <div className="text-[10px] text-slate-400">Avg Score</div>
                                        <div className="text-lg font-bold text-amber-300 font-mono">
                                          {batchAvgScore}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Batch Task Completion Progress Bar */}
                                    <div className="space-y-1">
                                      <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-slate-400">Batch Task Completion Rate:</span>
                                        <span className="font-mono font-bold text-violet-300">{batchCompletionRate}%</span>
                                      </div>
                                      <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                                        <div
                                          className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-full rounded-full"
                                          style={{ width: `${batchCompletionRate}%` }}
                                        />
                                      </div>
                                    </div>

                                    {/* Top Intern Performer Highlight */}
                                    {topIntern && (
                                      <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2.5">
                                          <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-extrabold shadow-md">
                                            <Crown className="w-4 h-4" />
                                          </div>
                                          <div>
                                            <div className="text-[10px] uppercase tracking-wider font-extrabold text-amber-400">
                                              Top Batch Performer
                                            </div>
                                            <div className="text-xs font-bold text-white">{topIntern.name} ({topIntern.id})</div>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <div className="text-xs font-bold font-mono text-amber-300">
                                            {topIntern.performanceScore || 95}/100
                                          </div>
                                          <div className="text-[10px] text-slate-400">Score Rating</div>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                                    <span className="text-xs text-slate-400">Mentor: <strong className="text-slate-200">{batch.mentor || 'Maddi Harshavardhan'}</strong></span>
                                    <button
                                      onClick={() => handleOpenBatchDetails(batch)}
                                      className="py-1.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-violet-600/30"
                                    >
                                      <span>Inspect Batch</span>
                                      <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* 5. VIEW: ALL STAFF DIRECTORY */}
                      {teamTabSubFilter === 'members' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {teamMembers.map((member) => {
                            const memTasks = assignedTasks.filter(
                              (t) => (t.memberId || '').toUpperCase() === member.id.toUpperCase()
                            );
                            const memCompleted = memTasks.filter((t) => t.status === 'Completed').length;
                            const memInProgress = memTasks.filter((t) => t.status === 'In Progress' || t.status === 'Assigned').length;
                            const memAvgProg = memTasks.length > 0
                              ? Math.round(memTasks.reduce((acc, t) => acc + (Number(t.progress) || (t.status === 'Completed' ? 100 : 0)), 0) / memTasks.length)
                              : 0;

                            return (
                              <div key={member.id} className="glass-card p-5 rounded-2xl border border-white/10 space-y-4 flex flex-col justify-between">
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                      <div className="font-bold text-white text-base flex items-center gap-1.5">
                                        {member.isExecutive ? (
                                          <Crown className="w-4 h-4 text-amber-300" />
                                        ) : member.type === 'Intern' ? (
                                          <GraduationCap className="w-4 h-4 text-amber-400" />
                                        ) : (
                                          <Briefcase className="w-4 h-4 text-cyan-400" />
                                        )}
                                        <span>{member.name}</span>
                                      </div>
                                      <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
                                        <span>{member.id}</span>
                                        <span>•</span>
                                        <span className={`font-bold ${
                                          member.type === 'Intern' ? 'text-amber-400' : 'text-cyan-400'
                                        }`}>
                                          {member.type}
                                        </span>
                                      </div>
                                      <div className="text-xs text-slate-300 font-medium">{member.role}</div>
                                    </div>

                                    {!member.isExecutive && (
                                      <button
                                        onClick={() => handleDeleteMember(member.id)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"
                                        title="Remove Member"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>

                                  {/* Workload Stats Card */}
                                  <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 space-y-2 text-xs">
                                    <div className="flex items-center justify-between">
                                      <span className="text-slate-400">Workload &amp; Progress:</span>
                                      <span className="font-mono font-bold text-cyan-300">{memAvgProg}% Avg</span>
                                    </div>
                                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                                      <div
                                        className={`h-full rounded-full ${
                                          memAvgProg === 100 ? 'bg-emerald-400' : memAvgProg >= 50 ? 'bg-cyan-400' : 'bg-amber-400'
                                        }`}
                                        style={{ width: `${memAvgProg}%` }}
                                      />
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                                      <span><strong>{memTasks.length}</strong> Total Tasks</span>
                                      <span><strong className="text-emerald-400">{memCompleted}</strong> Done</span>
                                      <span><strong className="text-amber-400">{memInProgress}</strong> Active</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs gap-2">
                                  <button
                                    onClick={() => handleOpenMemberAnalysis(member)}
                                    className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold flex items-center gap-1.5 border border-cyan-500/30"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Analysis</span>
                                  </button>

                                  <button
                                    onClick={() => handleOpenAssignTask(member.id)}
                                    className="btn-cyan py-1.5 px-3 text-xs flex items-center gap-1 font-bold"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Assign Work</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB: WORKSHOPS */}
                  {activeTab === 'workshops' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-base font-bold text-white">Workshops &amp; Bootcamps Catalog ({workshops.length})</h4>
                          <p className="text-xs text-slate-400">Manage all training programs displayed on the website.</p>
                        </div>
                        <button
                          onClick={handleOpenAddWorkshop}
                          className="btn-cyan text-xs py-2 px-4 flex items-center gap-1.5 font-bold"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add New Workshop</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {workshops.map((ws) => (
                          <div key={ws.id} className="glass-card p-5 rounded-2xl border border-white/10 space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                  {ws.category}
                                </span>
                                <h4 className="font-bold text-white text-base pt-1">{ws.title}</h4>
                                <div className="text-xs text-slate-400">{ws.minDays} • {ws.mode}</div>
                              </div>

                              <div className="flex items-center gap-1">
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
                            <p className="text-xs text-slate-300">{ws.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB: SETTINGS */}
                  {activeTab === 'settings' && (
                    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-300">
                      <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
                        <h4 className="text-base font-bold text-white flex items-center gap-2">
                          <Key className="w-4 h-4 text-cyan-400" />
                          <span>Change Executive Admin PIN</span>
                        </h4>

                        <form onSubmit={handleUpdatePin} className="space-y-4 text-xs">
                          <div>
                            <label className="block font-semibold text-slate-300 mb-1">New Security PIN *</label>
                            <input
                              type="password"
                              required
                              value={newPin}
                              onChange={(e) => setNewPin(e.target.value)}
                              placeholder="Enter at least 4 digits/characters"
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

                          {pinChangeSuccess && (
                            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span>{pinChangeSuccess}</span>
                            </div>
                          )}

                          <button type="submit" className="btn-primary w-full py-2.5 text-xs font-bold">
                            Update Security PIN
                          </button>
                        </form>
                      </div>

                      <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-3">
                        <h4 className="text-base font-bold text-white flex items-center gap-2">
                          <Download className="w-4 h-4 text-cyan-400" />
                          <span>Data Backup &amp; Export</span>
                        </h4>
                        <p className="text-xs text-slate-400">Export all client leads, consultations, requirements, team members, tasks, and workshop data as a secure JSON backup file.</p>
                        <button onClick={exportData} className="btn-cyan py-2.5 px-4 text-xs font-bold flex items-center gap-2">
                          <Download className="w-4 h-4" />
                          <span>Download Complete JSON Backup</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </main>
            </div>
          ) : authenticatedRole === 'founder' ? (
            /* =============================================================== */
            /* 2. FOUNDER & CEO MANAGEMENT DASHBOARD                           */
            /* =============================================================== */
            <div className="flex-1 overflow-y-auto bg-slate-950 p-4 sm:p-8 space-y-6">
              {updateSuccessMsg && (
                <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xl animate-in slide-in-from-top duration-300 max-w-6xl mx-auto">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>{updateSuccessMsg}</span>
                  </div>
                  <button onClick={() => setUpdateSuccessMsg('')} className="text-emerald-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Founder Header Banner */}
              <div className="max-w-6xl mx-auto glass-card p-6 sm:p-8 rounded-3xl border border-red-500/40 bg-gradient-to-r from-slate-900 via-red-950/40 to-slate-900 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 glow-blue">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl border bg-gradient-to-br from-red-950 via-slate-900 to-red-900 border-red-500/50 text-amber-300 flex items-center justify-center text-2xl font-bold shadow-lg shadow-red-500/20">
                    <Crown className="w-8 h-8 text-amber-300 animate-pulse" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                        {authenticatedUser.name}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full font-mono text-xs font-bold bg-slate-800 border border-white/20 text-cyan-400">
                        {authenticatedUser.id}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white shadow-md shadow-red-600/30 flex items-center gap-1">
                        <Crown className="w-3 h-3 text-amber-300" />
                        <span>{authenticatedUser.type || 'Founder & CEO'}</span>
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 font-medium">
                      {authenticatedUser.role} • Sakith Harvan Technologies Executive Board
                    </p>
                  </div>
                </div>

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

              {/* Founder Navigation Sub-Tabs */}
              <div className="max-w-6xl mx-auto flex items-center gap-2 border-b border-white/10 pb-3 flex-wrap">
                {[
                  { id: 'manage_staff', label: `👥 Manage Staff (${teamMembers.length})` },
                  { id: 'all_tasks', label: `📊 Work Tracker & Deliverables (${assignedTasks.length})` },
                  { id: 'quotation_maker', label: `🧮 Quotation Maker` },
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

              {/* TAB 1: MANAGE STAFF */}
              {founderTab === 'manage_staff' && (
                <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teamMembers
                      .filter((m) => {
                        if (founderStaffFilter === 'employees') return m.type === 'Employee';
                        if (founderStaffFilter === 'interns') return m.type === 'Intern';
                        return true;
                      })
                      .map((member) => (
                        <div key={member.id} className="glass-card p-5 rounded-2xl border border-white/10 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-bold text-white text-sm flex items-center gap-1.5">
                                {member.isExecutive && <Crown className="w-3.5 h-3.5 text-amber-300" />}
                                <span>{member.name}</span>
                              </div>
                              <div className="text-xs text-slate-400 font-mono">{member.id} • {member.type}</div>
                              <div className="text-xs text-cyan-400 font-semibold pt-1">{member.role}</div>
                            </div>

                            {!member.isExecutive && (
                              <button
                                onClick={() => handleDeleteMember(member.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"
                                title="Remove Member"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                            <button
                              onClick={() => handleOpenAssignTask(member.id)}
                              className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Assign Work</span>
                            </button>
                            <span className="text-slate-400 font-mono">
                              {assignedTasks.filter(t => (t.memberId || '').toUpperCase() === member.id.toUpperCase()).length} Tasks
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* TAB 2: ALL TASKS & DELIVERABLES */}
              {founderTab === 'all_tasks' && (
                <div className="max-w-6xl mx-auto space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-white">Company Task Directory &amp; Deliverables ({assignedTasks.length})</h4>
                    <button onClick={() => handleOpenAssignTask('')} className="btn-cyan text-xs py-2 px-3.5 flex items-center gap-1 font-bold">
                      <Plus className="w-3.5 h-3.5" />
                      <span>Assign New Task</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {assignedTasks.map((t) => (
                      <div key={t.id} className="glass-card p-5 rounded-2xl border border-white/10 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-white text-base">{t.title}</h4>
                              <span className="text-xs font-mono text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-white/10">
                                {t.id}
                              </span>
                            </div>
                            <div className="text-xs text-slate-400">Assigned to: <strong className="text-white">{t.memberName || t.memberId}</strong> ({t.memberId})</div>
                          </div>

                          <div className="flex items-center gap-2">
                            <select
                              value={t.status || 'In Progress'}
                              onChange={(e) => handleFounderUpdateTaskStatus(t.id, e.target.value)}
                              className="form-input text-xs py-1 px-2.5 bg-slate-900 text-cyan-400 border-white/20"
                            >
                              <option value="Assigned">Assigned</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                            </select>

                            <button
                              onClick={() => handleDeleteTask(t.id)}
                              className="p-1.5 rounded-lg bg-red-950/60 text-red-400 hover:text-white"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300">{t.description}</p>

                        {t.completedWorkNotes && (
                          <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-slate-300">
                            <strong className="text-emerald-400 block mb-1">Staff Completed Work Notes:</strong>
                            {t.completedWorkNotes}
                          </div>
                        )}

                        {t.deliverableUrl && (
                          <div className="text-xs text-cyan-400">
                            <strong>Deliverable Link:</strong> <a href={t.deliverableUrl} target="_blank" rel="noreferrer" className="underline">{t.deliverableUrl}</a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: QUOTATION MAKER */}
              {founderTab === 'quotation_maker' && (
                <div className="max-w-6xl mx-auto animate-in fade-in duration-200">
                  <QuotationMaker />
                </div>
              )}

              {/* TAB 4: MY DIRECTIVES */}
              {founderTab === 'my_tasks' && (
                <div className="max-w-6xl mx-auto space-y-4 animate-in fade-in duration-200">
                  <h4 className="text-base font-bold text-white">Directives Assigned to {authenticatedUser.name} ({memberTasks.length})</h4>
                  {memberTasks.length === 0 ? (
                    <div className="glass-card p-12 text-center text-slate-400 text-xs">
                      No personal directives assigned. Use "Assign Work" to assign tasks to other employees/interns.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {memberTasks.map((t) => (
                        <div key={t.id} className="glass-card p-6 rounded-2xl border border-blue-500/30 space-y-3">
                          <h5 className="font-bold text-white text-base">{t.title}</h5>
                          <p className="text-xs text-slate-300">{t.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* =============================================================== */
            /* 3. EMPLOYEE & INTERN WORK DASHBOARD                             */
            /* =============================================================== */
            <div className="flex-1 overflow-y-auto bg-slate-950 p-4 sm:p-8 space-y-6">
              {updateSuccessMsg && (
                <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xl animate-in slide-in-from-top duration-300 max-w-6xl mx-auto">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>{updateSuccessMsg}</span>
                  </div>
                  <button onClick={() => setUpdateSuccessMsg('')} className="text-emerald-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Member Profile Banner */}
              <div className="max-w-6xl mx-auto glass-card p-6 sm:p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center text-2xl font-bold shadow-lg ${
                    authenticatedUser.type === 'Intern'
                      ? 'bg-amber-950/70 border-amber-500/50 text-amber-400 shadow-amber-500/20'
                      : 'bg-blue-950/70 border-blue-500/50 text-cyan-400 shadow-blue-500/20'
                  }`}>
                    {authenticatedUser.name ? authenticatedUser.name.charAt(0) : 'U'}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                        {authenticatedUser.name}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full font-mono text-xs font-bold bg-slate-800 border border-white/20 text-cyan-400">
                        {authenticatedUser.id}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        authenticatedUser.type === 'Intern'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}>
                        {authenticatedUser.type}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 font-medium">
                      {authenticatedUser.role}
                    </p>
                  </div>
                </div>

                {/* Progress Summary */}
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

              {/* Task Controls & Filter */}
              <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                      onClick={() => setStaffTaskFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        staffTaskFilter === f
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
              <div className="max-w-6xl mx-auto space-y-4">
                {filteredMemberTasks.length === 0 ? (
                  <div className="glass-card p-12 rounded-3xl border border-white/10 text-center space-y-3">
                    <CheckCircle2 className="w-8 h-8 text-slate-500 mx-auto" />
                    <h4 className="text-base font-bold text-white">No tasks currently under "{staffTaskFilter}"</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      New tasks assigned by Founder &amp; CEO will appear here automatically.
                    </p>
                  </div>
                ) : (
                  filteredMemberTasks.map((t) => (
                    <div key={t.id} className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-base">{t.title}</h4>
                            <span className="text-xs font-mono text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-white/10">
                              {t.id}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              t.priority === 'High' ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'
                            }`}>
                              {t.priority || 'Normal'} Priority
                            </span>
                          </div>
                          <div className="text-xs text-slate-400">Assigned: {t.assignedDate} • Deadline: {t.dueDate || 'Flexible'}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            t.status === 'Completed'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}>
                            {t.status} ({t.progress || 0}%)
                          </span>

                          <button
                            onClick={() => handleStartUpdate(t)}
                            className="btn-cyan text-xs py-1.5 px-3 font-bold flex items-center gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Update Progress</span>
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">{t.description}</p>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                          <span>Completion Progress</span>
                          <span>{t.progress || 0}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              t.status === 'Completed' ? 'bg-emerald-500' : 'bg-cyan-500'
                            }`}
                            style={{ width: `${t.progress || 0}%` }}
                          />
                        </div>
                      </div>

                      {t.completedWorkNotes && (
                        <div className="p-3.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-300 space-y-1">
                          <strong className="text-cyan-400 block">Submitted Notes &amp; Status:</strong>
                          <p>{t.completedWorkNotes}</p>
                          {t.completedDate && <span className="text-[10px] text-slate-400 block pt-1">Completed Date: {t.completedDate}</span>}
                        </div>
                      )}

                      {t.deliverableUrl && (
                        <div className="text-xs text-cyan-400 flex items-center gap-1.5">
                          <LinkIcon className="w-3.5 h-3.5" />
                          <strong>Deliverable:</strong>
                          <a href={t.deliverableUrl} target="_blank" rel="noreferrer" className="underline hover:text-white">
                            {t.deliverableUrl}
                          </a>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* MODALS & FORMS                                                      */}
      {/* =================================================================== */}

      {/* 1. Task Work Update Modal (Staff) */}
      {editingTaskId && (
        <div className="fixed inset-0 z-[120] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-6 rounded-3xl border border-cyan-500/40 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-cyan-400" />
                <span>Update Work Deliverable &amp; Status</span>
              </h3>
              <button onClick={() => setEditingTaskId(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Status *</label>
                <select
                  value={workUpdateForm.status}
                  onChange={(e) => setWorkUpdateForm({
                    ...workUpdateForm,
                    status: e.target.value,
                    progress: e.target.value === 'Completed' ? 100 : workUpdateForm.progress
                  })}
                  className="form-input text-xs"
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-300 mb-1">
                  <span>Progress Percentage</span>
                  <span className="font-mono text-cyan-400">{workUpdateForm.progress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={workUpdateForm.progress}
                  onChange={(e) => setWorkUpdateForm({
                    ...workUpdateForm,
                    progress: Number(e.target.value),
                    status: Number(e.target.value) === 100 ? 'Completed' : 'In Progress'
                  })}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Deliverable / Git Repo / Demo URL</label>
                <input
                  type="url"
                  value={workUpdateForm.deliverableUrl}
                  onChange={(e) => setWorkUpdateForm({ ...workUpdateForm, deliverableUrl: e.target.value })}
                  placeholder="https://github.com/sakithharvan/... or demo link"
                  className="form-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Work Description / Deliverable Notes *</label>
                <textarea
                  rows="3"
                  value={workUpdateForm.completedWorkNotes}
                  onChange={(e) => setWorkUpdateForm({ ...workUpdateForm, completedWorkNotes: e.target.value })}
                  placeholder="Describe your progress, technical modules completed, PR link, or status updates for the Founder..."
                  className="form-input text-xs font-sans"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
                <button onClick={() => setEditingTaskId(null)} className="btn-secondary py-2 px-4 text-xs">
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveWorkUpdate(editingTaskId)}
                  className="btn-cyan py-2 px-5 text-xs font-bold shadow-md shadow-cyan-500/30"
                >
                  Save &amp; Sync Work Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Add Team Member Modal */}
      {isAddingMember && (
        <div className="fixed inset-0 z-[120] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 rounded-3xl border border-blue-500/40 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">Add New {memberFormData.type}</h3>
              <button onClick={() => setIsAddingMember(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Member ID *</label>
                <input
                  type="text"
                  required
                  value={memberFormData.id}
                  onChange={(e) => setMemberFormData({ ...memberFormData, id: e.target.value })}
                  className="form-input text-xs uppercase font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={memberFormData.name}
                  onChange={(e) => setMemberFormData({ ...memberFormData, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Role / Designation *</label>
                <input
                  type="text"
                  required
                  value={memberFormData.role}
                  onChange={(e) => setMemberFormData({ ...memberFormData, role: e.target.value })}
                  placeholder="e.g. Senior Full Stack Engineer"
                  className="form-input text-xs"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
                <button type="button" onClick={() => setIsAddingMember(false)} className="btn-secondary py-2 px-4 text-xs">
                  Cancel
                </button>
                <button type="submit" className="btn-primary py-2 px-5 text-xs font-bold">
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Assign Task Modal */}
      {isAssigningTask && (
        <div className="fixed inset-0 z-[120] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-6 rounded-3xl border border-cyan-500/40 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">Assign Task / Work Directive</h3>
              <button onClick={() => setIsAssigningTask(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAssignedTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Select Member *</label>
                <select
                  value={taskFormData.memberId}
                  onChange={(e) => setTaskFormData({ ...taskFormData, memberId: e.target.value })}
                  className="form-input text-xs"
                >
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      [{m.id}] {m.name} — {m.role} ({m.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={taskFormData.title}
                  onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                  placeholder="e.g. Implement Attendance Module API Endpoints"
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Description &amp; Deliverables *</label>
                <textarea
                  rows="3"
                  required
                  value={taskFormData.description}
                  onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                  placeholder="Specify task scope, modules, tech stack, testing criteria, and deliverables expected..."
                  className="form-input text-xs font-sans"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
                <button type="button" onClick={() => setIsAssigningTask(false)} className="btn-secondary py-2 px-4 text-xs">
                  Cancel
                </button>
                <button type="submit" className="btn-cyan py-2 px-5 text-xs font-bold">
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Add/Edit Workshop Modal */}
      {isEditingWorkshop && (
        <div className="fixed inset-0 z-[120] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-6 rounded-3xl border border-rose-500/40 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">Workshop Catalog Details</h3>
              <button onClick={() => setIsEditingWorkshop(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWorkshop} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Workshop Title *</label>
                <input
                  type="text"
                  required
                  value={workshopFormData.title}
                  onChange={(e) => setWorkshopFormData({ ...workshopFormData, title: e.target.value })}
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Category / Domain *</label>
                <input
                  type="text"
                  required
                  value={workshopFormData.category}
                  onChange={(e) => setWorkshopFormData({ ...workshopFormData, category: e.target.value })}
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Overview Description *</label>
                <textarea
                  rows="3"
                  required
                  value={workshopFormData.description}
                  onChange={(e) => setWorkshopFormData({ ...workshopFormData, description: e.target.value })}
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Key Curriculum Topics (1 per line)</label>
                <textarea
                  rows="4"
                  value={workshopFormData.learn}
                  onChange={(e) => setWorkshopFormData({ ...workshopFormData, learn: e.target.value })}
                  className="form-input text-xs font-mono"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
                <button type="button" onClick={() => setIsEditingWorkshop(false)} className="btn-secondary py-2 px-4 text-xs">
                  Cancel
                </button>
                <button type="submit" className="btn-cyan py-2 px-5 text-xs font-bold">
                  Save Workshop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Create Batch Modal */}
      {isAddingBatch && (
        <div className="fixed inset-0 z-[120] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="glass-card max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-violet-500/50 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-violet-400" />
                <h3 className="text-base sm:text-lg font-bold text-white">Create New Intern Batch</h3>
              </div>
              <button onClick={() => setIsAddingBatch(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBatch} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Batch Code / ID *</label>
                  <input
                    type="text"
                    required
                    value={batchFormData.id}
                    onChange={(e) => setBatchFormData({ ...batchFormData, id: e.target.value.toUpperCase() })}
                    placeholder="BATCH-03"
                    className="form-input text-xs uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={batchFormData.startDate}
                    onChange={(e) => setBatchFormData({ ...batchFormData, startDate: e.target.value })}
                    className="form-input text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Batch Name *</label>
                <input
                  type="text"
                  required
                  value={batchFormData.name}
                  onChange={(e) => setBatchFormData({ ...batchFormData, name: e.target.value })}
                  placeholder="e.g. Batch 2026-Gamma (Cybersecurity & DevOps)"
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Technical Focus / Domain *</label>
                <input
                  type="text"
                  required
                  value={batchFormData.focus}
                  onChange={(e) => setBatchFormData({ ...batchFormData, focus: e.target.value })}
                  placeholder="e.g. AI Agents, LLM Fine-Tuning & Kubernetes"
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Assigned Mentor</label>
                <input
                  type="text"
                  value={batchFormData.mentor}
                  onChange={(e) => setBatchFormData({ ...batchFormData, mentor: e.target.value })}
                  placeholder="Maddi Harshavardhan"
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Batch Description &amp; Objectives</label>
                <textarea
                  rows="3"
                  value={batchFormData.description}
                  onChange={(e) => setBatchFormData({ ...batchFormData, description: e.target.value })}
                  placeholder="Goals for this cohort, expected project deliverables, and weekly milestones..."
                  className="form-input text-xs"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
                <button type="button" onClick={() => setIsAddingBatch(false)} className="btn-secondary py-2 px-4 text-xs">
                  Cancel
                </button>
                <button type="submit" className="py-2 px-5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-lg shadow-violet-600/30">
                  Create Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Batch Details & Top Performer Spotlight Modal */}
      {selectedBatch && (
        <div className="fixed inset-0 z-[125] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="glass-card max-w-2xl w-full p-6 sm:p-8 rounded-3xl border border-violet-500/50 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-violet-300 bg-violet-950 px-2.5 py-0.5 rounded-full border border-violet-500/30 font-bold">
                    {selectedBatch.id}
                  </span>
                  <span className="text-xs text-slate-400">Mentor: {selectedBatch.mentor || 'Maddi Harshavardhan'}</span>
                </div>
                <h3 className="text-xl font-extrabold text-white mt-1">{selectedBatch.name}</h3>
                <p className="text-xs text-cyan-300 font-medium">{selectedBatch.focus}</p>
              </div>
              <button onClick={() => setSelectedBatch(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Batch Aggregates */}
            {(() => {
              const batchInterns = teamMembers.filter(
                (m) => m.type === 'Intern' && (m.batch === selectedBatch.name || selectedBatch.memberIds?.includes(m.id))
              );
              const batchInternIds = batchInterns.map((i) => i.id.toUpperCase());
              const batchTasks = assignedTasks.filter((t) =>
                batchInternIds.includes((t.memberId || '').toUpperCase())
              );
              const batchCompletedTasks = batchTasks.filter((t) => t.status === 'Completed').length;
              const batchCompletionRate =
                batchTasks.length > 0 ? Math.round((batchCompletedTasks / batchTasks.length) * 100) : 0;

              // Compute Top Intern Performer
              let topIntern = null;
              if (batchInterns.length > 0) {
                topIntern = [...batchInterns].sort((a, b) => {
                  const aTasks = assignedTasks.filter((t) => (t.memberId || '').toUpperCase() === a.id.toUpperCase());
                  const aComp = aTasks.length > 0 ? aTasks.filter(t => t.status === 'Completed').length / aTasks.length : 0;
                  const bTasks = assignedTasks.filter((t) => (t.memberId || '').toUpperCase() === b.id.toUpperCase());
                  const bComp = bTasks.length > 0 ? bTasks.filter(t => t.status === 'Completed').length / bTasks.length : 0;
                  return ((b.performanceScore || 90) + bComp * 10) - ((a.performanceScore || 90) + aComp * 10);
                })[0];
              }

              return (
                <div className="space-y-4">
                  {/* KPI Bar */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 text-center">
                      <div className="text-[11px] text-slate-400">Total Interns</div>
                      <div className="text-xl font-extrabold text-white">{batchInterns.length}</div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 text-center">
                      <div className="text-[11px] text-slate-400">Batch % Done</div>
                      <div className="text-xl font-extrabold text-violet-400 font-mono">{batchCompletionRate}%</div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 text-center">
                      <div className="text-[11px] text-slate-400">Total Tasks</div>
                      <div className="text-xl font-extrabold text-cyan-400">{batchTasks.length} ({batchCompletedTasks} Done)</div>
                    </div>
                  </div>

                  {/* Top Intern Performer Award Card */}
                  {topIntern && (
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border border-amber-500/50 shadow-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-black">
                            <Crown className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-[11px] font-black uppercase tracking-wider text-amber-400">
                              🏆 Top Performer in {selectedBatch.name}
                            </div>
                            <h4 className="text-base font-extrabold text-white">{topIntern.name} ({topIntern.id})</h4>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xl font-extrabold text-amber-300 font-mono">{topIntern.performanceScore || 95}/100</div>
                          <div className="text-[10px] text-slate-400 font-semibold">Evaluation Rating</div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300">
                        {topIntern.name} has demonstrated the highest task completion velocity and technical evaluation score across the cohort.
                      </p>
                    </div>
                  )}

                  {/* Batch Interns List */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Interns in this Batch ({batchInterns.length})
                      </h4>
                      <button
                        onClick={() => {
                          setSelectedBatch(null);
                          handleOpenAddMember('Intern');
                        }}
                        className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Intern to Batch</span>
                      </button>
                    </div>

                    {batchInterns.length === 0 ? (
                      <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 text-center text-xs text-slate-400">
                        No interns currently assigned to this batch. Click "Add Intern to Batch" to assign members.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {batchInterns.map((intern) => {
                          const iTasks = assignedTasks.filter((t) => (t.memberId || '').toUpperCase() === intern.id.toUpperCase());
                          const iDone = iTasks.filter((t) => t.status === 'Completed').length;
                          const iRate = iTasks.length > 0 ? Math.round((iDone / iTasks.length) * 100) : 0;

                          return (
                            <div
                              key={intern.id}
                              className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="space-y-0.5">
                                <div className="font-bold text-white flex items-center gap-2">
                                  <span>{intern.name}</span>
                                  <span className="text-[10px] font-mono text-slate-400">({intern.id})</span>
                                </div>
                                <div className="text-slate-400 text-[11px]">{intern.role}</div>
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="font-mono font-bold text-cyan-400">{iRate}% Completed</div>
                                  <div className="text-[10px] text-slate-400">{iDone} of {iTasks.length} tasks</div>
                                </div>

                                <div className="text-right">
                                  <div className="font-mono font-bold text-amber-300">{intern.performanceScore || 90}/100</div>
                                  <div className="text-[10px] text-slate-400">Score</div>
                                </div>

                                <button
                                  onClick={() => {
                                    setSelectedBatch(null);
                                    handleOpenMemberAnalysis(intern);
                                  }}
                                  className="btn-secondary py-1 px-2.5 text-[11px]"
                                >
                                  Inspect
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 7. Deep-Dive Member Analytics Modal (for Intern or Employee) */}
      {analyzingMember && (
        <div className="fixed inset-0 z-[130] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="glass-card max-w-3xl w-full p-6 sm:p-8 rounded-3xl border border-cyan-500/50 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center font-extrabold text-white text-lg shadow-lg">
                  {analyzingMember.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-extrabold text-white">{analyzingMember.name}</h3>
                    <span className="text-xs font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-500/30">
                      {analyzingMember.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      analyzingMember.type === 'Intern'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                        : 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                    }`}>
                      {analyzingMember.type}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300">{analyzingMember.role}</div>
                  {analyzingMember.batch && (
                    <div className="text-[11px] text-amber-300/90 font-semibold mt-0.5 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      <span>{analyzingMember.batch}</span>
                    </div>
                  )}
                </div>
              </div>

              <button onClick={() => setAnalyzingMember(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Compute Member Stats */}
            {(() => {
              const memTasks = assignedTasks.filter(
                (t) => (t.memberId || '').toUpperCase() === analyzingMember.id.toUpperCase()
              );
              const memCompleted = memTasks.filter((t) => t.status === 'Completed').length;
              const memInProgress = memTasks.filter((t) => t.status === 'In Progress' || t.status === 'Assigned').length;
              const completionPct = memTasks.length > 0 ? Math.round((memCompleted / memTasks.length) * 100) : 0;
              const memAssessments = assessments.filter(
                (a) => (a.memberId || '').toUpperCase() === analyzingMember.id.toUpperCase()
              );
              const memSubmissions = submissions.filter(
                (s) => (s.memberId || '').toUpperCase() === analyzingMember.id.toUpperCase()
              );

              return (
                <div className="space-y-5 text-xs">
                  {/* Top Analytics Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-1">
                      <div className="text-slate-400 text-[11px]">Completion Rate</div>
                      <div className="text-2xl font-extrabold text-cyan-400 font-mono">{completionPct}%</div>
                      <div className="text-[10px] text-slate-400">{memCompleted}/{memTasks.length} Done</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-1">
                      <div className="text-slate-400 text-[11px]">Performance Score</div>
                      <div className="text-2xl font-extrabold text-amber-300 font-mono">
                        {analyzingMember.performanceScore || 92}/100
                      </div>
                      <div className="text-[10px] text-emerald-400">★ High Performing</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-1">
                      <div className="text-slate-400 text-[11px]">Active Tasks</div>
                      <div className="text-2xl font-extrabold text-white">{memInProgress}</div>
                      <div className="text-[10px] text-slate-400">In Sprint</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-1">
                      <div className="text-slate-400 text-[11px]">Deliverables</div>
                      <div className="text-2xl font-extrabold text-fuchsia-400">{memSubmissions.length}</div>
                      <div className="text-[10px] text-slate-400">PRs &amp; Work Notes</div>
                    </div>
                  </div>

                  {/* Task Completion Progress Gauge */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Overall Task Completion Percentage:</span>
                      <span className="font-mono font-extrabold text-cyan-400 text-sm">{completionPct}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          completionPct === 100 ? 'bg-emerald-400' : completionPct >= 50 ? 'bg-cyan-400' : 'bg-amber-400'
                        }`}
                        style={{ width: `${completionPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Assigned Tasks History */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
                        Assigned Tasks &amp; Milestones ({memTasks.length})
                      </h4>
                      <button
                        onClick={() => handleOpenAssignTask(analyzingMember.id)}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Assign New Task</span>
                      </button>
                    </div>

                    {memTasks.length === 0 ? (
                      <p className="text-slate-400 italic">No tasks currently assigned to this member.</p>
                    ) : (
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {memTasks.map((t) => (
                          <div
                            key={t.id}
                            className="p-3 rounded-xl bg-slate-900/90 border border-white/10 flex items-center justify-between gap-3"
                          >
                            <div className="space-y-0.5">
                              <div className="font-bold text-white flex items-center gap-2">
                                <span>{t.title}</span>
                                <span className="text-[10px] font-mono text-slate-400">({t.id})</span>
                              </div>
                              <div className="text-[11px] text-slate-300">{t.description.slice(0, 70)}...</div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                t.status === 'Completed'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              }`}>
                                {t.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submissions & Deliverables */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
                      Submitted Code Deliverables &amp; PRs ({memSubmissions.length})
                    </h4>
                    {memSubmissions.length === 0 ? (
                      <p className="text-slate-400 italic">No deliverable URLs submitted yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {memSubmissions.map((s) => (
                          <div
                            key={s.id}
                            className="p-3 rounded-xl bg-slate-900/90 border border-white/10 flex items-center justify-between gap-3"
                          >
                            <div>
                              <div className="font-bold text-white">{s.title}</div>
                              <div className="text-[11px] text-slate-400">Type: {s.type}</div>
                            </div>
                            <a
                              href={s.deliverableUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-cyan py-1 px-3 text-xs font-bold flex items-center gap-1"
                            >
                              <span>View Code</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
