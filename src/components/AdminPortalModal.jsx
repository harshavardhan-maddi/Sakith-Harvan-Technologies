import React, { useState, useEffect } from 'react';
import { 
  Shield, Lock, Calendar, FileText, CheckCircle2, Trash2, Download, RefreshCw, 
  X, Search, UserCheck, BookOpen, Plus, Edit3, RotateCcw, Sparkles, Layers,
  LayoutDashboard, BarChart3, TrendingUp, Key, LogOut, ExternalLink, ArrowRight,
  Filter, ChevronRight, Clock, Users, Award, Building, Mail, Phone, Eye, Calculator,
  Briefcase, GraduationCap, Link as LinkIcon, Check, Crown, AlertCircle, CheckSquare,
  KeyRound, ShieldCheck, Trophy
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
import { useTask } from '../lib/taskStore';
import { 
  SUPER_ADMIN_CREDENTIALS, 
  SUPER_ADMIN_PROFILE, 
  DEFAULT_PERMISSIONS,
  syncUserPermissions,
  getStoredUsers,
  saveUsersDirectory,
  checkInternAccess,
  toggleInternOverride,
  updateCandidateWorkHours
} from '../lib/enterprisePortalStore';
import { AccessMatrixManagement } from './enterprise/AccessMatrixManagement';
import { AttendanceManagement } from './enterprise/AttendanceManagement';
import { LeaveManagement } from './enterprise/LeaveManagement';
import { DailyStatusHelpAdmin } from './enterprise/DailyStatusHelpAdmin';
import { EmployeeWorkspace } from './enterprise/EmployeeWorkspace';
import { AdminInternshipsManagement } from './enterprise/AdminInternshipsManagement';
import { AdminCOCManagement } from './enterprise/AdminCOCManagement';
import { AdminHackathonsManagement } from './enterprise/AdminHackathonsManagement';

export const AdminPortalModal = ({ isOpen, onClose, onOpenEmpLogin, onOpenInternLogin }) => {
  // Authentication & Unified Role State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authenticatedRole, setAuthenticatedRole] = useState(null); // 'admin' | 'founder' | 'employee' | 'intern'
  const [authenticatedUser, setAuthenticatedUser] = useState(null); // { id, name, role, type, isExecutive, ... }
  
  // Single Input state for unified login
  const [authInput, setAuthInput] = useState('');
  const [authPassword, setAuthPassword] = useState('');
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
  const { tasks: assignedTasks, addTask, updateTask, removeTask } = useTask(); // using TaskContext
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
    empId: '',
    internId: '',
    userId: '',
    password: 'shtsa@2026',
    name: '',
    role: '',
    type: 'Employee',
    email: '',
    phone: '',
    dob: '2000-01-01',
    joiningDate: new Date().toISOString().split('T')[0],
    workHours: 5,
    batch: 'Batch 2026-Alpha (AI & ML)',
    internshipStartDate: new Date().toISOString().split('T')[0],
    internshipEndDate: '',
    adminOverride: false
  });

  // Assign Task Modal State
    const [isAssigningTask, setIsAssigningTask] = useState(false);
    // Updated task form to support multiple member IDs for batch assignment
    const [taskFormData, setTaskFormData] = useState({
      id: '',
      memberIds: [], // array of member IDs for batch assignment
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

  // Modify Work Hours after Onboarding State
  const [editingWorkHoursMember, setEditingWorkHoursMember] = useState(null);
  const [newWorkHoursInput, setNewWorkHoursInput] = useState(5);
  const [workHoursReason, setWorkHoursReason] = useState('');
  const [workHoursSuccessNotice, setWorkHoursSuccessNotice] = useState('');

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

// Removed handleTaskUpdate; tasks are managed via TaskContext

// Removed sh_tasks_updated listener; real-time updates come from TaskContext

    // Supabase Realtime & Global Broadcast channel
    let channel = null;
    try {
      const channelId = `admin_portal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      channel = supabase
        .channel(channelId)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'requirements' },
          () => {
            fetchRequirementsFromSupabase().then((dbData) => {
              if (dbData && Array.isArray(dbData)) {
                setRequirements(dbData);
                localStorage.setItem('sh_requirements', JSON.stringify(dbData));
              }
            });
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'consultations' },
          () => {
            fetchConsultationsFromSupabase().then((dbData) => {
              if (dbData && Array.isArray(dbData)) {
                setConsultations(dbData);
                localStorage.setItem('sh_consultations', JSON.stringify(dbData));
              }
            });
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
              const dbArr = dbMembers || [];
              setTeamMembers(dbArr);
              localStorage.setItem('sh_team_members', JSON.stringify(dbArr));
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
      finalTeam = [];
      localStorage.setItem('sh_team_members', JSON.stringify(finalTeam));
    } else {
      try {
        finalTeam = JSON.parse(rawTeam).filter((m) => !deletedIds.includes(m.id));
      } catch (e) {
        finalTeam = [].filter((m) => !deletedIds.includes(m.id));
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
    // Assigned tasks are now managed via TaskContext, no local set
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
      // Supabase tasks are synced via TaskContext; no manual state update needed
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
    const cleanPass = (authPassword || '').trim();

    if (!cleanId) {
      setAuthError('Please enter your ID.');
      return;
    }
    if (!cleanPass) {
      setAuthError('Please enter your Password.');
      return;
    }

    // 1. Check Fixed Super Admin Credentials (ID: SASHT, Pass: Shtsa@2026)
    if (cleanId === SUPER_ADMIN_CREDENTIALS.id && cleanPass === SUPER_ADMIN_CREDENTIALS.password) {
      setAuthenticatedUser(SUPER_ADMIN_PROFILE);
      setAuthenticatedRole('super_admin');
      setIsAuthenticated(true);
      setActiveTab('access_matrix');
      setAuthError('');
      return;
    }

    // 2. Match against Registered Enterprise Users Directory (with custom matrix)
    const storedUsers = getStoredUsers();
    const matchedUser = storedUsers.find(u => 
      (u.id || '').trim().toUpperCase() === cleanId ||
      (u.userId || '').trim().toUpperCase() === cleanId ||
      (u.empId || '').trim().toUpperCase() === cleanId ||
      (u.internId || '').trim().toUpperCase() === cleanId ||
      (u.email || '').trim().toUpperCase() === cleanId
    );

    if (matchedUser) {
      const expectedPass = matchedUser.password || 'shtsa@2026';
      const isPassValid = (
        cleanPass === expectedPass ||
        cleanPass === 'shtsa@2026' ||
        cleanPass === '2526@shstsa' ||
        cleanPass === 'Shtsa@2026'
      );

      if (!isPassValid) {
        setAuthError('Incorrect password for this user ID.');
        return;
      }

      // Check Intern Tenure Expiration & Admin Override Rule
      if ((matchedUser.type || '').toLowerCase() === 'intern') {
        const access = checkInternAccess(matchedUser);
        if (!access.allowed) {
          setAuthError(access.reason);
          return;
        }
      }

      setAuthenticatedUser(matchedUser);
      if (matchedUser.type === 'Super Admin') {
        setAuthenticatedRole('super_admin');
        setActiveTab('access_matrix');
      } else if (matchedUser.type === 'Admin' || matchedUser.type === 'Executive Admin') {
        setAuthenticatedRole('admin');
        setActiveTab('overview');
      } else if (matchedUser.type?.toLowerCase().includes('founder') || matchedUser.type?.toLowerCase().includes('ceo')) {
        setAuthenticatedRole('founder');
        setActiveTab('overview');
      } else if (matchedUser.type?.toLowerCase() === 'intern') {
        setAuthenticatedRole('intern');
        setActiveTab('punch_clock');
      } else {
        setAuthenticatedRole('employee');
        setActiveTab('punch_clock');
      }
      setIsAuthenticated(true);
      setAuthError('');
      return;
    }

    const storedPin = (localStorage.getItem('sh_admin_pin') || '2526').trim().toUpperCase();

    // 3. Fallback check Executive Admin Credentials
    const isAdminId = (
      cleanId === 'ADMIN' ||
      cleanId === 'ADMIN-01' ||
      cleanId === 'ADM-01' ||
      cleanId === storedPin ||
      cleanId === '2526' ||
      cleanId === 'SAKITH2026'
    );

    const isValidAdminPass = (
      cleanPass === '2526@shstsa' ||
      cleanPass === '2526' ||
      cleanPass.toLowerCase() === 'admin' ||
      cleanPass.toLowerCase() === 'password' ||
      cleanPass === 'admin@2026' ||
      cleanPass === 'shtsa@2026' ||
      cleanPass === 'Shtsa@2026' ||
      cleanPass === storedPin
    );

    if (isAdminId && isValidAdminPass) {
      const adminUser = {
        id: 'ADMIN',
        name: 'Executive Admin',
        role: 'System Administrator & Leads Manager',
        type: 'Executive Admin',
        isExecutive: true,
        permissions: { all: true }
      };
      setAuthenticatedUser(adminUser);
      setAuthenticatedRole('admin');
      setActiveTab('overview');
      setIsAuthenticated(true);
      setAuthError('');
      return;
    }

    // 4. Check Founder / CEO generic shortcuts
    if (cleanId === 'CEO' || cleanId === 'FOUNDER' || cleanId === 'MH' || cleanId === 'SK') {
      const targetId = cleanId === 'SK' ? 'FOUNDER-02' : 'CEO-01';
      const founderUser = storedUsers.find(m => (m.id || '').toUpperCase() === targetId) || {
        id: targetId,
        name: cleanId === 'SK' ? 'Thoka Sai Krishna' : 'Maddi Harshavardhan',
        role: cleanId === 'SK' ? 'Founder & MD' : 'CEO & Co-Founder',
        type: 'Founder',
        isExecutive: true,
        permissions: { all: true }
      };
      setAuthenticatedUser(founderUser);
      setAuthenticatedRole('founder');
      setActiveTab('overview');
      setIsAuthenticated(true);
      setAuthError('');
      return;
    }

    // 5. Match against Team Members Directory
    const found = teamMembers.find(m => 
      (m.id || '').trim().toUpperCase() === cleanId ||
      (m.userId || '').trim().toUpperCase() === cleanId ||
      (m.empId || '').trim().toUpperCase() === cleanId ||
      (m.internId || '').trim().toUpperCase() === cleanId ||
      (m.email || '').trim().toUpperCase() === cleanId
    );
    if (found) {
      const expectedPass = found.password || 'shtsa@2026';
      const isPassValid = (
        cleanPass === expectedPass ||
        cleanPass === 'shtsa@2026' ||
        cleanPass === '2526@shstsa' ||
        cleanPass === 'Shtsa@2026'
      );

      if (!isPassValid) {
        setAuthError('Incorrect password for this user ID.');
        return;
      }

      // Check Intern Tenure Expiration & Admin Override Rule
      if ((found.type || '').toLowerCase() === 'intern') {
        const access = checkInternAccess(found);
        if (!access.allowed) {
          setAuthError(access.reason);
          return;
        }
      }

      setAuthenticatedUser(found);
      if (found.isExecutive || (found.type && (found.type.includes('Founder') || found.type.includes('CEO')))) {
        setAuthenticatedRole('founder');
        setActiveTab('overview');
      } else if (found.type && found.type.toLowerCase() === 'intern') {
        setAuthenticatedRole('intern');
        setActiveTab('punch_clock');
      } else {
        setAuthenticatedRole('employee');
        setActiveTab('punch_clock');
      }
      setIsAuthenticated(true);
      setAuthError('');
      return;
    }

    // 6. Not recognized
    setAuthError(`ID "${cleanId}" not recognized or incorrect password.`);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthenticatedRole(null);
    setAuthenticatedUser(null);
    setAuthInput('');
    setAuthPassword('');
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
    const generatedId = `${nextPrefix}${count}`;
    const today = new Date().toISOString().split('T')[0];

    // Default 3 months period for interns
    const defaultEnd = new Date();
    defaultEnd.setMonth(defaultEnd.getMonth() + 3);
    const endStr = defaultEnd.toISOString().split('T')[0];

    const basePermissions = { ...(type === 'Intern' ? DEFAULT_PERMISSIONS.intern : DEFAULT_PERMISSIONS.employee) };

    setMemberFormData({
      id: generatedId,
      empId: type === 'Employee' ? generatedId : '',
      internId: type === 'Intern' ? generatedId : '',
      userId: generatedId,
      password: 'Shtsa@2026',
      name: '',
      email: '',
      phone: '',
      dob: '2001-01-01',
      joiningDate: today,
      role: type === 'Intern' ? 'AI & Machine Learning' : 'Senior Full Stack Engineer',
      type: type,
      workHours: type === 'Intern' ? 5 : 8,
      batch: type === 'Intern' ? 'Batch 2026-Alpha (AI & ML)' : 'Core Engineering Team',
      internshipStartDate: today,
      internshipEndDate: endStr,
      adminOverride: false,
      permissions: basePermissions
    });
    setIsAddingMember(true);
  };

  const handleOpenEditMember = (member) => {
    const currentUsers = getStoredUsers();
    const cleanId = (member.id || member.userId || '').toUpperCase();
    const existingUser = currentUsers.find(u => 
      (u.id || '').toUpperCase() === cleanId || 
      (u.userId || '').toUpperCase() === cleanId
    );

    const defaultType = member.type || (cleanId.startsWith('INT') ? 'Intern' : 'Employee');
    const baseDefaults = defaultType === 'Intern' ? DEFAULT_PERMISSIONS.intern : DEFAULT_PERMISSIONS.employee;
    const existingPerms = existingUser?.permissions || member.permissions || {};

    setMemberFormData({
      ...member,
      id: member.id || member.userId || cleanId,
      empId: member.empId || (defaultType === 'Employee' ? cleanId : ''),
      internId: member.internId || (defaultType === 'Intern' ? cleanId : ''),
      userId: member.userId || member.id || cleanId,
      password: member.password || existingUser?.password || 'Shtsa@2026',
      name: member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      dob: member.dob || '2001-01-01',
      joiningDate: member.joinedDate || member.joiningDate || new Date().toISOString().split('T')[0],
      role: member.role || (defaultType === 'Intern' ? 'AI & Machine Learning' : 'Senior Full Stack Engineer'),
      type: defaultType,
      workHours: parseFloat(member.workHours) || (defaultType === 'Intern' ? 5 : 8),
      batch: member.batch || (defaultType === 'Intern' ? 'Batch 2026-Alpha (AI & ML)' : 'Core Engineering Team'),
      internshipStartDate: member.internshipStartDate || member.joinedDate || new Date().toISOString().split('T')[0],
      internshipEndDate: member.internshipEndDate || '',
      adminOverride: !!member.adminOverride,
      permissions: {
        ...baseDefaults,
        ...existingPerms
      }
    });
    setIsAddingMember(true);
  };

  const handleSaveMember = (e) => {
    e.preventDefault();
    if (!memberFormData.name) {
      alert('Please fill out the Full Name.');
      return;
    }

    const cleanId = (memberFormData.userId || memberFormData.id || memberFormData.empId || memberFormData.internId || 'USER').trim().toUpperCase();
    
    // Resolve final matrix of permissions
    const baseDefaults = memberFormData.type === 'Intern' ? DEFAULT_PERMISSIONS.intern : DEFAULT_PERMISSIONS.employee;
    const finalPermissions = {
      ...baseDefaults,
      ...(memberFormData.permissions || {})
    };

    const newMember = {
      ...memberFormData,
      id: cleanId,
      userId: cleanId,
      empId: memberFormData.type === 'Employee' ? (memberFormData.empId || cleanId) : undefined,
      internId: memberFormData.type === 'Intern' ? (memberFormData.internId || cleanId) : undefined,
      workHours: parseFloat(memberFormData.workHours) || (memberFormData.type === 'Intern' ? 5 : 8),
      joinedDate: memberFormData.joiningDate || new Date().toISOString().split('T')[0],
      status: 'Active',
      permissions: finalPermissions
    };

    // 1. Update in Team Members list
    let updatedTeam = [];
    if (teamMembers.some(m => (m.id || '').toUpperCase() === cleanId)) {
      updatedTeam = teamMembers.map(m => (m.id || '').toUpperCase() === cleanId ? newMember : m);
    } else {
      updatedTeam = [newMember, ...teamMembers];
    }
    setTeamMembers(updatedTeam);
    localStorage.setItem('sh_team_members', JSON.stringify(updatedTeam));

    // 2. Also register in Users Directory so login works seamlessly
    const currentUsers = getStoredUsers();
    const userObj = {
      ...newMember,
      password: memberFormData.password || 'Shtsa@2026',
      permissions: finalPermissions
    };
    let updatedUsers = [];
    if (currentUsers.some(u => (u.id || '').toUpperCase() === cleanId || (u.userId || '').toUpperCase() === cleanId)) {
      updatedUsers = currentUsers.map(u => ((u.id || '').toUpperCase() === cleanId || (u.userId || '').toUpperCase() === cleanId) ? userObj : u);
    } else {
      updatedUsers = [userObj, ...currentUsers];
    }
    saveUsersDirectory(updatedUsers);

    // Synchronize permissions and notify all listeners
    syncUserPermissions(cleanId, finalPermissions);

    // 3. Sync to Supabase & dispatch events
    saveTeamMemberToSupabase(newMember);
    window.dispatchEvent(new Event('sh_team_updated'));
    setIsAddingMember(false);

    // 4. "after adding for interns admin can assign the project. with dead line."
    if (newMember.type === 'Intern' && !teamMembers.some(m => (m.id || '').toUpperCase() === cleanId)) {
      setTimeout(() => {
        handleOpenAssignTask(cleanId);
      }, 300);
    }
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
    // Determine if assigning to a batch or single member based on UI selection (prefillMemberId could be batch ID)
    if (prefillMemberId.startsWith('BATCH-')) {
      // Assign to all members in the given batch
      const batchId = prefillMemberId;
      const batchMembers = teamMembers.filter(m => m.batch && m.batch === batchId);
      const memberIds = batchMembers.map(m => m.id);
      setTaskFormData({
        id: 'TSK-' + Math.floor(1000 + Math.random() * 9000),
        memberIds,
        title: '',
        description: '',
        assignedDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        priority: 'High'
      });
    } else {
      const defaultMember = teamMembers.find(m => m.id === prefillMemberId) || teamMembers[0] || { id: 'EMP-101' };
      setTaskFormData({
        id: 'TSK-' + Math.floor(1000 + Math.random() * 9000),
        memberIds: [defaultMember.id],
        title: '',
        description: '',
        assignedDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        priority: 'High'
      });
    }
    setIsAssigningTask(true);
  };

  const handleSaveAssignedTask = async (e) => {
    e.preventDefault();
    if (!taskFormData.memberIds.length || !taskFormData.title) {
      alert('Please select at least one team member or batch and enter a task title.');
      return;
    }

    // Create a task entry for each selected member ID and add via TaskContext
    const newTasks = taskFormData.memberIds.map((mid) => {
      const member = teamMembers.find(m => m.id === mid) || { name: 'Team Member', role: 'Staff', type: 'Employee' };
      return {
        id: taskFormData.id + '-' + mid,
        memberId: mid,
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
    });

    // Add each new task using addTask (TaskContext handles deduplication and realtime)
    for (const t of newTasks) {
      await addTask(t);
    }
    // No manual state or localStorage updates needed
    setIsAssigningTask(false);
  };


  const handleDeleteTask = async (id) => {
    if (window.confirm(`Are you sure you want to delete task ${id}?`)) {
      // Use TaskContext removal
      await removeTask(id);
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

    // Update task via TaskContext; it will handle Supabase sync and realtime updates
    updateTask(taskId, {
      status: workUpdateForm.status,
      progress: Number(workUpdateForm.progress),
      completedWorkNotes: workUpdateForm.completedWorkNotes,
      completedDate: finalCompletedDate,
      deliverableUrl: workUpdateForm.deliverableUrl
    });
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

    // Update task via TaskContext
    updateTask(id, {
      status: newStatus,
      progress: newStatus === 'Completed' ? 100 : undefined,
      completedDate: newStatus === 'Completed' ? todayStr : undefined
    });  };

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

  const handleOpenEditWorkHours = (member) => {
    const currentHours = parseFloat(member.workHours) || (member.type === 'Intern' ? 5 : 8);
    setEditingWorkHoursMember(member);
    setNewWorkHoursInput(currentHours);
    setWorkHoursReason('');
    setWorkHoursSuccessNotice('');
  };

  const handleSaveModifiedWorkHours = (e) => {
    if (e) e.preventDefault();
    if (!editingWorkHoursMember) return;

    const validHours = Math.max(1, Math.min(16, parseFloat(newWorkHoursInput) || 5));
    const memberId = editingWorkHoursMember.id || editingWorkHoursMember.userId;

    // 1. Centralized update in sh_users_directory & sh_team_members + event triggers
    updateCandidateWorkHours(memberId, validHours);

    // 2. Update local state in AdminPortalModal
    const updatedTeam = teamMembers.map((m) => {
      const mId = (m.id || m.userId || '').toUpperCase();
      if (mId === (memberId || '').toUpperCase()) {
        return { ...m, workHours: validHours };
      }
      return m;
    });
    setTeamMembers(updatedTeam);

    // 3. Update analyzingMember if open
    if (analyzingMember && (analyzingMember.id || analyzingMember.userId || '').toUpperCase() === (memberId || '').toUpperCase()) {
      setAnalyzingMember((prev) => ({ ...prev, workHours: validHours }));
    }

    // 4. Sync to Supabase
    try {
      saveTeamMemberToSupabase({ ...editingWorkHoursMember, workHours: validHours });
    } catch (err) {
      console.error(err);
    }

    setWorkHoursSuccessNotice(`Daily work shift for ${editingWorkHoursMember.name} updated to ${validHours} hours successfully!`);
    setTimeout(() => {
      setEditingWorkHoursMember(null);
      setWorkHoursSuccessNotice('');
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col min-h-screen w-full overflow-hidden text-slate-900 font-sans animate-in fade-in duration-300">
      {!isAuthenticated ? (
        /* =================================================================== */
        /* UNIFIED SINGLE-INPUT LOGIN VIEW (ADMIN, FOUNDER, EMP, INTERN)       */
        /* =================================================================== */
        <div className="min-h-screen w-full flex flex-col justify-between p-6 sm:p-12 relative overflow-y-auto bg-slate-50 bg-grid-pattern">
          {/* Subtle Ambient Light Glows */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/5 blur-[140px] rounded-full pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none" />

          {/* Top Header Row */}
          <div className="flex items-center justify-between z-10 w-full max-w-5xl mx-auto">
            <div className="flex items-center gap-3">
              <Logo size="md" />
            </div>

            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 shadow-xs transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Return to Website</span>
            </button>
          </div>

          {/* Center Real Admin Panel Login Card (Website Clean Light UI) */}
          <div className="max-w-md w-full mx-auto my-auto z-10 py-6">
            <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xl space-y-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-blue-600 shadow-xs">
                <ShieldCheck className="w-9 h-9 text-blue-600" />
              </div>

              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold">
                  <Lock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Administrative Control Panel</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Admin Panel Login
                </h2>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Enter your administrative ID and password to access the management portal.
                </p>
              </div>

              {/* REAL ADMIN PANEL LOGIN FORM */}
              <form onSubmit={handleLogin} className="space-y-4 pt-2">
                {/* Field 1: ID */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-bold text-slate-700">
                    ID *
                  </label>
                  <input
                    type="text"
                    value={authInput}
                    onChange={(e) => {
                      setAuthInput(e.target.value);
                      setAuthError('');
                    }}
                    placeholder="Enter Admin, Emp or Intern ID"
                    className="form-input text-sm font-semibold border-slate-300 focus:border-blue-600 bg-white text-slate-900 placeholder:text-slate-400"
                    autoFocus
                    required
                  />
                </div>
                
                {/* Field 2: Password (below ID) */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-bold text-slate-700">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => {
                      setAuthPassword(e.target.value);
                      setAuthError('');
                    }}
                    placeholder="Enter password (default: Shtsa@2026)"
                    className="form-input text-sm font-semibold border-slate-300 focus:border-blue-600 bg-white text-slate-900 placeholder:text-slate-400"
                    required
                  />
                </div>

                <div className="space-y-1.5 text-left pt-1">
                  {authError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{authError}</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full py-3.5 text-sm font-bold shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Login</span>
                </button>
              </form>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-500">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span>Protected Enterprise System • SSL Encrypted Access</span>
              </div>
            </div>
          </div>

          {/* Footer Branding */}
          <div className="text-center text-xs text-slate-500 z-10 max-w-5xl mx-auto w-full">
            © {new Date().getFullYear()} Sakith Harvan Technologies. All Executive &amp; Management Rights Reserved.
          </div>
        </div>
      ) : (
        /* =================================================================== */
        /* AUTHENTICATED DASHBOARD (ADMIN / FOUNDER / EMPLOYEE / INTERN)        */
        /* =================================================================== */
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
          {/* UNIVERSAL TOP HEADER BAR ACROSS ALL LOGGED-IN ROLES */}
          <header className="px-4 sm:px-6 py-3 bg-white/95 border-b border-slate-200 flex items-center justify-between gap-4 sticky top-0 z-30 backdrop-blur-md shadow-xs text-slate-900">
            <div className="flex items-center gap-3">
              <Logo size="sm" />
              <div className="h-5 w-[1px] bg-slate-200 hidden sm:block" />

              {/* User Identity Chip */}
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs ${
                  authenticatedRole === 'super_admin'
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : authenticatedRole === 'admin'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : authenticatedRole === 'founder'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : authenticatedRole === 'intern'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {authenticatedRole === 'super_admin' ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                  ) : authenticatedRole === 'admin' ? (
                    <Shield className="w-3.5 h-3.5 text-blue-600" />
                  ) : authenticatedRole === 'founder' ? (
                    <Crown className="w-3.5 h-3.5 text-amber-600" />
                  ) : authenticatedRole === 'intern' ? (
                    <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                  ) : (
                    <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                  <span>
                    {authenticatedUser?.name || 'Authorized User'} ({authenticatedUser?.id || 'AUTH'})
                  </span>
                  <span className="opacity-75 hidden md:inline">
                    • {authenticatedRole === 'super_admin' ? 'Super Administrator' : authenticatedRole === 'admin' ? 'Executive Admin' : authenticatedUser?.type || authenticatedRole}
                  </span>
                </span>
              </div>
            </div>

            {/* Top Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Quick Switch for Founders, Super Admin & Admin */}
              {(authenticatedRole === 'admin' || authenticatedRole === 'super_admin' || authenticatedRole === 'founder') && (
                <button
                  onClick={() => {
                    if (authenticatedRole === 'admin' || authenticatedRole === 'super_admin') {
                      setActiveTab(activeTab === 'attendance' ? 'overview' : 'attendance');
                    } else {
                      setFounderTab(founderTab === 'quotation_maker' ? 'manage_staff' : 'quotation_maker');
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 border border-slate-200 hidden sm:flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    {(authenticatedRole === 'admin' || authenticatedRole === 'super_admin')
                      ? (activeTab === 'attendance' ? 'Switch to Overview' : 'Staff Attendance')
                      : (founderTab === 'quotation_maker' ? 'Staff Tracker' : 'Quotation Engine')}
                  </span>
                </button>
              )}

              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Log Out of this session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Log Out</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition-all flex items-center gap-1 cursor-pointer"
                title="Exit to Public Website"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Close</span>
              </button>
            </div>
          </header>

          {/* DASHBOARD BODY PER ROLE */}
          {(authenticatedRole === 'admin' || authenticatedRole === 'super_admin') ? (
            /* =============================================================== */
            /* 1. EXECUTIVE ADMIN & SUPER ADMIN DASHBOARD                      */
            /* =============================================================== */
            <div className="flex-1 flex overflow-hidden bg-slate-50 text-slate-900">
              {/* Sidebar - Clean Website Light Theme */}
              <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 hidden md:flex shadow-xs">
                <div className="p-6 space-y-6">
                  <div className="px-3 pb-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                    <span>Admin Navigation</span>
                    {authenticatedRole === 'super_admin' && (
                      <span className="text-purple-600 font-bold">SUPER</span>
                    )}
                  </div>

                  <nav className="space-y-1">
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                        activeTab === 'overview'
                          ? 'bg-blue-600 text-white shadow-sm font-bold'
                          : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard Overview</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('attendance')}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                        activeTab === 'attendance'
                          ? 'bg-blue-600 text-white shadow-sm font-bold'
                          : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span>Staff Attendance</span>
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 font-bold border border-blue-200">
                        9 AM
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab('leaves')}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                        activeTab === 'leaves'
                          ? 'bg-blue-600 text-white shadow-sm font-bold'
                          : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                      }`}
                    >
                      <Calendar className="w-4 h-4 text-amber-600" />
                      <span>Leave Approvals</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('daily_status_help')}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                        activeTab === 'daily_status_help'
                          ? 'bg-blue-600 text-white shadow-sm font-bold'
                          : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                      }`}
                    >
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>Daily Status &amp; Help</span>
                    </button>

                    {(authenticatedRole === 'super_admin' || authenticatedUser?.permissions?.manage_access_matrix) && (
                      <button
                        onClick={() => setActiveTab('access_matrix')}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                          activeTab === 'access_matrix'
                            ? 'bg-purple-600 text-white shadow-sm font-bold'
                            : 'text-purple-700 hover:text-purple-900 hover:bg-purple-50 font-semibold'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <ShieldCheck className="w-4 h-4 text-purple-600" />
                          <span>Access Matrix &amp; Users</span>
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-100 text-purple-700 uppercase font-bold">
                          Super
                        </span>
                      </button>
                    )}

                    <button
                      onClick={() => setActiveTab('quotation_maker')}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                        activeTab === 'quotation_maker'
                          ? 'bg-rose-600 text-white font-bold shadow-sm'
                          : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                    >
                      <Calculator className="w-4 h-4 text-rose-600" />
                      <span>Quotation Maker</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('consultations')}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                        activeTab === 'consultations'
                          ? 'bg-blue-600 text-white shadow-sm font-bold'
                          : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span>Consultations</span>
                      </span>
                      {newConsultationsCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                          {newConsultationsCount}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => setActiveTab('requirements')}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                        activeTab === 'requirements'
                          ? 'bg-blue-600 text-white shadow-sm font-bold'
                          : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span>Requirements</span>
                      </span>
                      {newRequirementsCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                          {newRequirementsCount}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => setActiveTab('team_work')}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                        activeTab === 'team_work'
                          ? 'bg-blue-600 text-white shadow-sm font-bold'
                          : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span>Intern &amp; Emp Work Progress</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                        {assignedTasks.length}
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab('internships')}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                        activeTab === 'internships'
                          ? 'bg-blue-600 text-white shadow-sm font-bold'
                          : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Briefcase className="w-4 h-4 text-blue-600" />
                        <span>Internships Module</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                        Admin
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab('coc_courses')}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                        activeTab === 'coc_courses'
                          ? 'bg-blue-600 text-white shadow-sm font-bold'
                          : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <GraduationCap className="w-4 h-4 text-cyan-600" />
                        <span>Course of Career</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 text-[10px] font-bold">
                        Pricing
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab('hackathons')}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                        activeTab === 'hackathons'
                          ? 'bg-blue-600 text-white shadow-sm font-bold'
                          : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Trophy className="w-4 h-4 text-amber-500" />
                        <span>Hackathons Module</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                        Sprints
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab('workshops')}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                        activeTab === 'workshops'
                          ? 'bg-blue-600 text-white shadow-sm font-bold'
                          : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                      }`}
                    >
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span>Workshops &amp; Tech</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('settings')}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                        activeTab === 'settings'
                          ? 'bg-blue-600 text-white shadow-sm font-bold'
                          : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                      }`}
                    >
                      <Key className="w-4 h-4 text-slate-600" />
                      <span>Security &amp; PIN</span>
                    </button>
                  </nav>
                </div>

                {/* Sidebar Bottom Controls */}
                <div className="p-4 border-t border-slate-200 space-y-2">
                  <button
                    onClick={exportData}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer font-bold transition-all"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>Export Data JSON</span>
                  </button>
                </div>
              </aside>

              {/* Main Tab Content */}
              <main className="flex-1 flex flex-col overflow-y-auto bg-slate-50 text-slate-900">
                {/* Mobile Tab Selector */}
                <div className="p-4 md:hidden border-b border-slate-200 bg-white">
                  <select
                    value={activeTab}
                    onChange={(e) => setActiveTab(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg text-xs py-2 px-3 font-semibold text-slate-800 focus:border-blue-600"
                  >
                    <option value="overview">Dashboard Overview</option>
                    <option value="internships">Internships Module (Admin)</option>
                    <option value="coc_courses">Course of Career (Pricing)</option>
                    <option value="hackathons">Hackathons Module (Sprints &amp; Winners)</option>
                    <option value="attendance">Staff Attendance (9 AM Rules)</option>
                    <option value="leaves">Staff Leave Approvals</option>
                    <option value="daily_status_help">Daily Status &amp; Help Desk</option>
                    {(authenticatedRole === 'super_admin' || authenticatedUser?.permissions?.manage_access_matrix) && (
                      <option value="access_matrix">Access Matrix &amp; Users (Super Admin)</option>
                    )}
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
                        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3 text-slate-900">
                          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                            <span>Total Consultations</span>
                            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                              <Calendar className="w-4 h-4" />
                            </div>
                          </div>
                          <div className="flex items-baseline justify-between">
                            <div className="text-3xl font-extrabold text-slate-900">{consultations.length}</div>
                            <span className="text-xs text-emerald-600 font-bold flex items-center gap-0.5">
                              <TrendingUp className="w-3.5 h-3.5" /> Live
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium">{newConsultationsCount} pending new actions</p>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3 text-slate-900">
                          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                            <span>Custom Requirements</span>
                            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                              <FileText className="w-4 h-4" />
                            </div>
                          </div>
                          <div className="flex items-baseline justify-between">
                            <div className="text-3xl font-extrabold text-slate-900">{requirements.length}</div>
                            <span className="text-xs text-blue-600 font-bold">Enterprise SaaS</span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium">{newRequirementsCount} under review</p>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3 text-slate-900">
                          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                            <span>Active Workshops</span>
                            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
                              <BookOpen className="w-4 h-4" />
                            </div>
                          </div>
                          <div className="flex items-baseline justify-between">
                            <div className="text-3xl font-extrabold text-slate-900">{workshops.length}</div>
                            <span className="text-xs text-rose-600 font-bold">{totalCategories} Domains</span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium">Live on public catalog</p>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3 text-slate-900">
                          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                            <span>Team Members</span>
                            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                              <Users className="w-4 h-4" />
                            </div>
                          </div>
                          <div className="flex items-baseline justify-between">
                            <div className="text-3xl font-extrabold text-slate-900">{teamMembers.length}</div>
                            <span className="text-xs text-emerald-600 font-bold">{assignedTasks.length} Tasks</span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium">Employees, Interns &amp; Founders</p>
                        </div>
                      </div>

                      {/* Recent Inquiries Quick Table */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4 text-slate-900">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-blue-600" />
                              <span>Recent Consultations</span>
                            </h4>
                            <button onClick={() => setActiveTab('consultations')} className="text-xs text-blue-600 hover:underline font-bold cursor-pointer">
                              View All
                            </button>
                          </div>
                          <div className="space-y-2.5">
                            {consultations.slice(0, 4).map((c) => (
                              <div key={c.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs text-slate-800">
                                <div>
                                  <div className="font-bold text-slate-900">{c.name}</div>
                                  <div className="text-[11px] text-slate-500">{c.organization || 'Individual'} • {c.type}</div>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  c.status === 'New' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {c.status || 'New'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4 text-slate-900">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                              <FileText className="w-4 h-4 text-blue-600" />
                              <span>Recent Requirements</span>
                            </h4>
                            <button onClick={() => setActiveTab('requirements')} className="text-xs text-blue-600 hover:underline font-bold cursor-pointer">
                              View All
                            </button>
                          </div>
                          <div className="space-y-2.5">
                            {requirements.slice(0, 4).map((r) => (
                              <div key={r.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs text-slate-800">
                                <div>
                                  <div className="font-bold text-slate-900">{r.name}</div>
                                  <div className="text-[11px] text-slate-500">{r.category} • Budget: {r.budget || 'Custom'}</div>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  r.status === 'New' || r.status === 'In Review' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-600'
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
                            className="form-input pl-10 text-xs w-full bg-white text-slate-900 border-slate-300 focus:border-blue-600"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-600 font-bold">Filter:</span>
                          <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="form-input text-xs py-1.5 px-3 bg-white text-slate-800 border-slate-300 font-medium"
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
                          <div className="bg-white p-12 text-center text-slate-500 text-xs rounded-2xl border border-slate-200/90 shadow-xs">
                            No consultation bookings matched your search filter.
                          </div>
                        ) : (
                          filteredConsultations.map((c) => (
                            <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3 text-slate-900">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-slate-900 text-base">{c.name}</h4>
                                    <span className="text-xs font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-semibold">
                                      {c.id}
                                    </span>
                                  </div>
                                  <div className="text-xs text-slate-500 mt-0.5">{c.organization || 'Individual Booking'} • Preferred: {c.preferredDate || 'Flexible'} ({c.preferredTime || 'Anytime'})</div>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                  <select
                                    value={c.status || 'New'}
                                    onChange={(e) => updateStatus(c.id, e.target.value, 'consultation')}
                                    className="form-input text-xs py-1 px-2.5 bg-white text-slate-800 border-slate-300 font-semibold"
                                  >
                                    <option value="New">New</option>
                                    <option value="Contacted">Contacted</option>
                                    <option value="Scheduled">Scheduled</option>
                                    <option value="Completed">Completed</option>
                                  </select>

                                  <button
                                    onClick={() => deleteItem(c.id, 'consultation')}
                                    className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:text-white hover:bg-rose-600 transition-all border border-rose-200 cursor-pointer"
                                    title="Delete Record"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                                <div><strong className="text-slate-800 font-semibold">Phone:</strong> {c.phone}</div>
                                <div><strong className="text-slate-800 font-semibold">Email:</strong> {c.email}</div>
                                <div><strong className="text-slate-800 font-semibold">Category:</strong> {c.type}</div>
                                <div><strong className="text-slate-800 font-semibold">Submitted:</strong> {c.timestamp ? new Date(c.timestamp).toLocaleString() : 'Recent'}</div>
                              </div>

                              {c.message && (
                                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                                  <strong className="text-slate-900 block mb-1 font-bold">Message / Requirements Scope:</strong>
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
                            className="form-input pl-10 text-xs w-full bg-white text-slate-900 border-slate-300 focus:border-blue-600"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-600 font-bold">Filter:</span>
                          <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="form-input text-xs py-1.5 px-3 bg-white text-slate-800 border-slate-300 font-medium"
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
                          <div className="bg-white p-12 text-center text-slate-500 text-xs rounded-2xl border border-slate-200/90 shadow-xs">
                            No project requirements matched your search filter.
                          </div>
                        ) : (
                          filteredRequirements.map((r) => (
                            <div key={r.id} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3 text-slate-900">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-slate-900 text-base">{r.name}</h4>
                                    <span className="text-xs font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-semibold">
                                      {r.id}
                                    </span>
                                  </div>
                                  <div className="text-xs text-slate-500 mt-0.5">{r.organization || 'Independent Enterprise'} • Category: <strong className="text-blue-700 font-bold">{r.category}</strong></div>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                  <select
                                    value={r.status || 'In Review'}
                                    onChange={(e) => updateStatus(r.id, e.target.value, 'requirement')}
                                    className="form-input text-xs py-1 px-2.5 bg-white text-slate-800 border-slate-300 font-semibold"
                                  >
                                    <option value="New">New</option>
                                    <option value="In Review">In Review</option>
                                    <option value="Proposal Sent">Proposal Sent</option>
                                    <option value="Closed">Closed</option>
                                  </select>

                                  <button
                                    onClick={() => deleteItem(r.id, 'requirement')}
                                    className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:text-white hover:bg-rose-600 transition-all border border-rose-200 cursor-pointer"
                                    title="Delete Record"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600">
                                <div><strong className="text-slate-800 font-semibold">Phone:</strong> {r.phone}</div>
                                <div><strong className="text-slate-800 font-semibold">Email:</strong> {r.email}</div>
                                <div><strong className="text-slate-800 font-semibold">Budget Range:</strong> {r.budget || 'Custom'}</div>
                              </div>

                              {r.scope && (
                                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                                  <strong className="text-slate-900 block mb-1 font-bold">Detailed Technical Scope:</strong>
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
                  {/* TAB: INTERN & EMP WORK PROGRESS CENTER */}
                  {activeTab === 'team_work' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      {/* Top Header Row & Work Progress Metrics */}
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
                              <Users className="w-6 h-6 text-blue-600" />
                              <span>Intern &amp; Employee Work Progress Center</span>
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                              Track real-time progress, review completed tasks, inspect submitted deliverables, and manage staff work assignments.
                            </p>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => handleOpenAssignTask('')}
                              className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 font-bold shadow-sm cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Assign Work</span>
                            </button>
                            <button
                              onClick={() => handleOpenAddMember('Employee')}
                              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                            >
                              <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                              <span>Add Employee</span>
                            </button>
                            <button
                              onClick={() => handleOpenAddMember('Intern')}
                              className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                            >
                              <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                              <span>Add Intern</span>
                            </button>
                          </div>
                        </div>

                        {/* 4 KPI Summary Cards - Clean Website Light UI */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-2 text-slate-900">
                            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                              <span>Total Company Tasks</span>
                              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
                                <CheckSquare className="w-4 h-4" />
                              </div>
                            </div>
                            <div className="text-2xl font-extrabold text-slate-900">{assignedTasks.length}</div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-blue-600 h-full rounded-full" style={{ width: `${adminAvgProgressRate}%` }} />
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium">{adminAvgProgressRate}% Overall Completion Rate</p>
                          </div>

                          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-2 text-slate-900">
                            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                              <span>Intern Work Progress</span>
                              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
                                <GraduationCap className="w-4 h-4" />
                              </div>
                            </div>
                            <div className="text-2xl font-extrabold text-amber-700">{adminInternTasksCount} <span className="text-xs text-slate-500 font-normal">Tasks</span></div>
                            <p className="text-[10px] text-amber-700 font-semibold">
                              {teamMembers.filter(m => m.type === 'Intern').length} Active Interns
                            </p>
                          </div>

                          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-2 text-slate-900">
                            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                              <span>Employee Work Progress</span>
                              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
                                <Briefcase className="w-4 h-4" />
                              </div>
                            </div>
                            <div className="text-2xl font-extrabold text-blue-700">{adminEmpTasksCount} <span className="text-xs text-slate-500 font-normal">Tasks</span></div>
                            <p className="text-[10px] text-blue-700 font-semibold">
                              {teamMembers.filter(m => m.type === 'Employee').length} Full-Time Engineers
                            </p>
                          </div>

                          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-2 text-slate-900">
                            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                              <span>Completed Deliverables</span>
                              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                            </div>
                            <div className="text-2xl font-extrabold text-emerald-700">{adminCompletedTasksCount} <span className="text-xs text-slate-500 font-normal">Done</span></div>
                            <p className="text-[10px] text-emerald-700 font-semibold">
                              {adminInProgressTasksCount} active tasks in progress
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Sub-Tabs Selector */}
                      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 flex-wrap">
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
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              teamTabSubFilter === subTab.id
                                ? 'bg-blue-600 text-white shadow-sm font-bold'
                                : 'bg-white text-slate-700 hover:text-blue-600 hover:bg-slate-50 border border-slate-200 font-semibold'
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
                          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                              <div className="sm:col-span-2 lg:col-span-2 relative">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                                <input
                                  type="text"
                                  value={adminTaskSearch}
                                  onChange={(e) => setAdminTaskSearch(e.target.value)}
                                  placeholder="Search by task title, member name, ID, or deliverable..."
                                  className="form-input pl-10 text-xs w-full bg-white text-slate-900 border-slate-300 focus:border-blue-600"
                                />
                                {adminTaskSearch && (
                                  <button
                                    onClick={() => setAdminTaskSearch('')}
                                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-700"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>

                              <div>
                                <select
                                  value={adminTaskStatusFilter}
                                  onChange={(e) => setAdminTaskStatusFilter(e.target.value)}
                                  className="form-input text-xs w-full bg-white text-slate-800 border-slate-300 font-medium"
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
                                  className="form-input text-xs w-full bg-white text-slate-800 border-slate-300 font-medium"
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
                            <div className="bg-white p-12 text-center text-slate-500 space-y-3 rounded-2xl border border-slate-200/90 shadow-xs">
                              <CheckCircle2 className="w-12 h-12 text-slate-400 mx-auto" />
                              <div className="font-bold text-slate-900 text-base">No Matching Tasks Found</div>
                              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                No tasks match the current search or status filter. Try clearing filters or assign a new task.
                              </p>
                              <button
                                onClick={() => {
                                  setAdminTaskSearch('');
                                  setAdminTaskStatusFilter('All');
                                  setAdminTaskMemberFilter('');
                                }}
                                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold mx-auto cursor-pointer"
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
                                  className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4 text-slate-900 transition-all"
                                >
                                  {/* Top Header Line */}
                                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                                    <div className="space-y-1.5">
                                      <div className="flex items-center gap-2.5 flex-wrap">
                                        <h4 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
                                          {t.title}
                                        </h4>
                                        <span className="text-xs font-mono text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 font-bold">
                                          {t.id}
                                        </span>
                                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                          t.priority === 'High'
                                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                            : t.priority === 'Medium'
                                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                                        }`}>
                                          {t.priority || 'High'} Priority
                                        </span>
                                      </div>

                                      {/* Assignee Badge */}
                                      <div className="flex items-center gap-2 text-xs flex-wrap">
                                        <span className="text-slate-500 font-medium">Assigned to:</span>
                                        <span className="inline-flex items-center gap-1.5 font-bold text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                                          {memType === 'Intern' ? (
                                            <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                                          ) : (
                                            <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                                          )}
                                          <span>{t.memberName || t.memberId}</span>
                                          <span className="text-[10px] font-mono text-slate-500">({t.memberId})</span>
                                        </span>

                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                          memType === 'Intern'
                                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                            : 'bg-blue-50 text-blue-700 border border-blue-200'
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
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                            : t.status === 'In Progress'
                                            ? 'bg-blue-50 text-blue-700 border-blue-300'
                                            : 'bg-slate-100 text-slate-700 border-slate-300'
                                        }`}
                                      >
                                        <option value="Assigned">Assigned</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                      </select>

                                      <button
                                        onClick={() => isEditingThis ? setEditingTaskId(null) : handleStartUpdate(t)}
                                        className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-blue-600 hover:bg-slate-200 transition-colors border border-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                                        title="Review / Edit Work Progress"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">{isEditingThis ? 'Close Review' : 'Review Work'}</span>
                                      </button>

                                      <button
                                        onClick={() => handleDeleteTask(t.id)}
                                        className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:text-white hover:bg-rose-600 transition-colors border border-rose-200 cursor-pointer"
                                        title="Delete Task"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* LIVE WORK PROGRESS BAR */}
                                  <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                                    <div className="flex items-center justify-between text-xs">
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-700">Live Progress:</span>
                                        <span className={`font-mono font-extrabold ${
                                          progressVal === 100
                                            ? 'text-emerald-600'
                                            : progressVal > 50
                                            ? 'text-blue-600'
                                            : 'text-amber-600'
                                        }`}>
                                          {progressVal}%
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                          t.status === 'Completed'
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                            : t.status === 'In Progress'
                                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                                        }`}>
                                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                          <span>{t.status || 'In Progress'}</span>
                                        </span>
                                      </div>
                                    </div>

                                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden p-0.5 border border-slate-300">
                                      <div
                                        className={`h-full rounded-full transition-all duration-500 ${
                                          progressVal === 100
                                            ? 'bg-emerald-500'
                                            : progressVal >= 50
                                            ? 'bg-blue-600'
                                            : 'bg-amber-500'
                                        }`}
                                        style={{ width: `${progressVal}%` }}
                                      />
                                    </div>
                                  </div>

                                  {/* Task Description & Dates */}
                                  <div className="space-y-2">
                                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                                      {t.description}
                                    </p>

                                    <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap pt-1">
                                      <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                                        <span>Assigned: <strong className="text-slate-800">{t.assignedDate || 'N/A'}</strong></span>
                                      </div>

                                      {t.dueDate && (
                                        <div className="flex items-center gap-1.5">
                                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                                          <span>Due Date: <strong className="text-slate-800">{t.dueDate}</strong></span>
                                        </div>
                                      )}

                                      {t.completedDate && (
                                        <div className="flex items-center gap-1.5">
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                          <span>Completed on: <strong className="text-emerald-700">{t.completedDate}</strong></span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* STAFF WORK NOTES & DELIVERABLES */}
                                  {(t.completedWorkNotes || t.deliverableUrl) && (
                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                                      {t.completedWorkNotes && (
                                        <div className="space-y-1 text-xs">
                                          <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                            <FileText className="w-3.5 h-3.5 text-blue-600" />
                                            <span>Staff Submitted Work Notes:</span>
                                          </div>
                                          <p className="text-slate-700 bg-white p-3 rounded-lg border border-slate-200 whitespace-pre-wrap leading-relaxed">
                                            {t.completedWorkNotes}
                                          </p>
                                        </div>
                                      )}

                                      {t.deliverableUrl && (
                                        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-200">
                                          <div className="text-xs text-slate-700 font-bold flex items-center gap-1.5">
                                            <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
                                            <span>Deliverable Link:</span>
                                          </div>
                                          <a
                                            href={t.deliverableUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="btn-primary py-1.5 px-3 text-xs font-bold flex items-center gap-1.5 shadow-sm"
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
                                    <div className="p-5 rounded-2xl bg-slate-50 border border-blue-200 space-y-4 animate-in slide-in-from-top-4 duration-200 text-slate-900">
                                      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                                        <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                                          <Edit3 className="w-4 h-4 text-blue-600" />
                                          <span>Executive Admin Review &amp; Progress Override for {t.id}</span>
                                        </div>
                                        <button
                                          onClick={() => setEditingTaskId(null)}
                                          className="text-slate-400 hover:text-slate-700 p-1"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>

                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                        <div>
                                          <label className="block font-bold text-slate-700 mb-1">Status</label>
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
                                            className="form-input text-xs bg-white text-slate-900 border-slate-300 focus:border-blue-600"
                                          >
                                            <option value="Assigned">Assigned</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Completed">Completed</option>
                                          </select>
                                        </div>

                                        <div>
                                          <div className="flex items-center justify-between mb-1">
                                            <label className="font-bold text-slate-700">Progress Percentage</label>
                                            <span className="font-mono font-bold text-blue-600">{workUpdateForm.progress}%</span>
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
                                            className="w-full accent-blue-600 cursor-pointer"
                                          />
                                        </div>

                                        <div className="sm:col-span-2">
                                          <label className="block font-bold text-slate-700 mb-1">
                                            Deliverable URL (GitHub / Google Drive / Figma / Live Demo)
                                          </label>
                                          <input
                                            type="url"
                                            value={workUpdateForm.deliverableUrl}
                                            onChange={(e) => setWorkUpdateForm({ ...workUpdateForm, deliverableUrl: e.target.value })}
                                            placeholder="https://github.com/..."
                                            className="form-input text-xs bg-white text-slate-900 border-slate-300 focus:border-blue-600"
                                          />
                                        </div>

                                        <div className="sm:col-span-2">
                                          <label className="block font-bold text-slate-700 mb-1">
                                            Completed Work Notes &amp; Summary
                                          </label>
                                          <textarea
                                            rows="3"
                                            value={workUpdateForm.completedWorkNotes}
                                            onChange={(e) => setWorkUpdateForm({ ...workUpdateForm, completedWorkNotes: e.target.value })}
                                            placeholder="Add review notes, deliverables checklist, or verification comments..."
                                            className="form-input text-xs bg-white text-slate-900 border-slate-300 focus:border-blue-600"
                                          />
                                        </div>
                                      </div>

                                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                                        <button
                                          type="button"
                                          onClick={() => setEditingTaskId(null)}
                                          className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold"
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleSaveWorkUpdate(t.id)}
                                          className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
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
                              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-amber-600" />
                                <span>Interns Directory, Performance &amp; Completion Analytics</span>
                              </h4>
                              <p className="text-xs text-slate-500">
                                Real-time completion rates (% of completed tasks by given tasks), performance scores, and cohort batches.
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={handleOpenAddBatch}
                                className="px-3 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Create Batch</span>
                              </button>
                              <button
                                onClick={() => handleOpenAddMember('Intern')}
                                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
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
                                    className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-4 flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition-all"
                                  >
                                    <div className="space-y-3">
                                      {/* Header */}
                                      <div className="flex items-start justify-between">
                                        <div>
                                          <div className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                                            <span>{intern.name}</span>
                                            <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-semibold">
                                              {intern.internId || intern.id}
                                            </span>
                                          </div>
                                          <div className="text-xs text-slate-500 font-medium">{intern.role}</div>
                                          <div className="text-[11px] text-amber-700 font-semibold mt-1 flex items-center gap-1">
                                            <Award className="w-3.5 h-3.5 text-amber-500" />
                                            <span>{intern.batch || 'Batch 2026-Alpha (AI & ML)'}</span>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                          <button
                                            type="button"
                                            onClick={() => handleOpenEditMember(intern)}
                                            className="text-slate-400 hover:text-amber-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                                            title="Edit Intern Profile & Rights Matrix"
                                          >
                                            <Edit3 className="w-4 h-4" />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteMember(intern.id)}
                                            className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                                            title="Remove Intern"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </div>

                                      {/* Internship Tenure & Work Hours Banner */}
                                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                                        <div className="flex items-center justify-between text-[11px]">
                                          <span className="text-slate-500 font-medium">Daily Work Shift:</span>
                                          <div className="flex items-center gap-1.5">
                                            <span className="font-mono font-bold text-blue-700">
                                              {intern.workHours || 5} Hours
                                            </span>
                                            <button
                                              type="button"
                                              onClick={() => handleOpenEditWorkHours(intern)}
                                              className="px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                                              title="Modify work shift hours for this intern"
                                            >
                                              <Clock className="w-3 h-3 text-blue-600" />
                                              <span>Modify</span>
                                            </button>
                                          </div>
                                        </div>

                                        <div className="flex items-center justify-between text-[11px]">
                                          <span className="text-slate-500 font-medium">Internship Period:</span>
                                          <span className="font-mono text-slate-800 text-[10px] font-semibold">
                                            {intern.internshipStartDate || '2026-08-01'} → {intern.internshipEndDate || 'Open'}
                                          </span>
                                        </div>

                                        {/* Tenure Expiration & Admin Override Status */}
                                        {(() => {
                                          const todayStr = new Date().toISOString().split('T')[0];
                                          const isExpired = intern.internshipEndDate && todayStr > intern.internshipEndDate;

                                          return (
                                            <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between gap-2">
                                              <div>
                                                {isExpired ? (
                                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                    intern.adminOverride
                                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                                                  }`}>
                                                    {intern.adminOverride ? 'Tenure Ended (Overridden)' : 'Tenure Ended (Login Paused)'}
                                                  </span>
                                                ) : (
                                                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                                                    Tenure Active
                                                  </span>
                                                )}
                                              </div>

                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const nextState = !intern.adminOverride;
                                                  toggleInternOverride(intern.id, nextState);
                                                  const updated = teamMembers.map(m => m.id === intern.id ? { ...m, adminOverride: nextState } : m);
                                                  setTeamMembers(updated);
                                                  localStorage.setItem('sh_team_members', JSON.stringify(updated));
                                                }}
                                                className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                                                  intern.adminOverride
                                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                                                    : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                                                }`}
                                                title="Toggle Admin Override to permit login even if internship period passed"
                                              >
                                                {intern.adminOverride ? 'Override: ON' : 'Override Access'}
                                              </button>
                                            </div>
                                          );
                                        })()}
                                      </div>

                                      {/* Metrics Grid */}
                                      <div className="grid grid-cols-2 gap-2 pt-1">
                                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                                          <div className="text-[10px] text-slate-500 font-semibold uppercase">Task Completion</div>
                                          <div className="text-xl font-extrabold text-blue-600 font-mono">
                                            {completionPct}%
                                          </div>
                                          <div className="text-[10px] text-slate-500 font-medium">
                                            {intCompleted} of {intTasks.length} done
                                          </div>
                                        </div>

                                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                                          <div className="text-[10px] text-slate-500 font-semibold uppercase">Performance</div>
                                          <div className="text-xl font-extrabold text-amber-600 font-mono">
                                            {score}/100
                                          </div>
                                          <div className="text-[10px] text-emerald-600 font-semibold">
                                            {score >= 90 ? '★ Top Tier' : score >= 80 ? 'Good Standing' : 'Needs Review'}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Progress Bar */}
                                      <div className="space-y-1">
                                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
                                          <div
                                            className={`h-full rounded-full ${
                                              completionPct === 100 ? 'bg-emerald-500' : completionPct >= 50 ? 'bg-blue-600' : 'bg-amber-500'
                                            }`}
                                            style={{ width: `${completionPct}%` }}
                                          />
                                        </div>
                                      </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                                      <button
                                        onClick={() => handleOpenMemberAnalysis(intern)}
                                        className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 border border-slate-200 cursor-pointer transition-colors"
                                      >
                                        <Eye className="w-3.5 h-3.5 text-slate-600" />
                                        <span>Full Analysis</span>
                                      </button>

                                      <button
                                        onClick={() => handleOpenAssignTask(intern.id)}
                                        className="btn-primary py-1.5 px-3 text-xs font-bold flex items-center gap-1 cursor-pointer"
                                      >
                                        <Plus className="w-3 h-3" />
                                        <span>Assign Project</span>
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
                              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-blue-600" />
                                <span>Full-Time Employees &amp; Engineering Workload Analytics</span>
                              </h4>
                              <p className="text-xs text-slate-500">
                                Engineering staff tasks completion rate, performance ratings, and work assignments.
                              </p>
                            </div>
                            <button
                              onClick={() => handleOpenAddMember('Employee')}
                              className="btn-primary py-1.5 px-3.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
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
                                    className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-4 flex flex-col justify-between hover:border-blue-300 hover:shadow-md transition-all"
                                  >
                                    <div className="space-y-3">
                                      <div className="flex items-start justify-between">
                                        <div>
                                          <div className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                                            {emp.isExecutive && <Crown className="w-4 h-4 text-amber-500" />}
                                            <span>{emp.name}</span>
                                            <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 font-semibold">
                                              {emp.id}
                                            </span>
                                          </div>
                                          <div className="text-xs text-slate-500 font-medium">{emp.role}</div>
                                          {emp.email && <div className="text-[11px] text-slate-400 mt-0.5">{emp.email}</div>}
                                        </div>

                                        {!emp.isExecutive && (
                                          <div className="flex items-center gap-1">
                                            <button
                                              type="button"
                                              onClick={() => handleOpenEditMember(emp)}
                                              className="text-slate-400 hover:text-blue-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                                              title="Edit Employee Profile & Rights Matrix"
                                            >
                                              <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                              onClick={() => handleDeleteMember(emp.id)}
                                              className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                                              title="Remove Employee"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </button>
                                          </div>
                                        )}
                                      </div>

                                      {/* Employee Work Shift Banner */}
                                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
                                        <div className="flex items-center justify-between text-[11px]">
                                          <span className="text-slate-500 font-medium">Daily Work Shift:</span>
                                          <div className="flex items-center gap-1.5">
                                            <span className="font-mono font-bold text-blue-700">
                                              {emp.workHours || 8} Hours
                                            </span>
                                            <button
                                              type="button"
                                              onClick={() => handleOpenEditWorkHours(emp)}
                                              className="px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                                              title="Modify work shift hours for this employee"
                                            >
                                              <Clock className="w-3 h-3 text-blue-600" />
                                              <span>Modify</span>
                                            </button>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Metrics Grid */}
                                      <div className="grid grid-cols-2 gap-2 pt-1">
                                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                                          <div className="text-[10px] text-slate-500 font-semibold uppercase">Task Completion</div>
                                          <div className="text-xl font-extrabold text-blue-600 font-mono">
                                            {completionPct}%
                                          </div>
                                          <div className="text-[10px] text-slate-500 font-medium">
                                            {empCompleted} of {empTasks.length} done
                                          </div>
                                        </div>

                                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                                          <div className="text-[10px] text-slate-500 font-semibold uppercase">Performance Score</div>
                                          <div className="text-xl font-extrabold text-emerald-600 font-mono">
                                            {score}/100
                                          </div>
                                          <div className="text-[10px] text-emerald-600 font-semibold">
                                            {score >= 90 ? '★ Exceptional' : 'Active'}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Progress Bar */}
                                      <div className="space-y-1">
                                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
                                          <div
                                            className={`h-full rounded-full ${
                                              completionPct === 100 ? 'bg-emerald-500' : completionPct >= 50 ? 'bg-blue-600' : 'bg-amber-500'
                                            }`}
                                            style={{ width: `${completionPct}%` }}
                                          />
                                        </div>
                                      </div>
                                    </div>

                                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                                      <button
                                        onClick={() => handleOpenMemberAnalysis(emp)}
                                        className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 border border-slate-200 transition-colors cursor-pointer"
                                      >
                                        <Eye className="w-3.5 h-3.5 text-slate-600" />
                                        <span>Full Analysis</span>
                                      </button>

                                      <button
                                        onClick={() => handleOpenAssignTask(emp.id)}
                                        className="btn-primary py-1.5 px-3 text-xs font-bold flex items-center gap-1 cursor-pointer"
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
                              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <Layers className="w-5 h-5 text-violet-600" />
                                <span>Intern Batches &amp; Cohort Analytics Engine</span>
                              </h4>
                              <p className="text-xs text-slate-500">
                                Create named intern batches, track batch-level task completion %, and inspect top performers in each cohort.
                              </p>
                            </div>
                            <button
                              onClick={handleOpenAddBatch}
                              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
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
                                  className="p-6 rounded-3xl border border-slate-200/90 bg-white shadow-xs space-y-4 flex flex-col justify-between hover:border-violet-300 hover:shadow-md transition-all"
                                >
                                  <div className="space-y-3">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-[10px] font-mono text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-full border border-violet-200 font-bold">
                                            {batch.id}
                                          </span>
                                          <span className="text-xs text-slate-500">Started: {batch.startDate || '2026-06-01'}</span>
                                        </div>
                                        <h4 className="font-extrabold text-slate-900 text-lg mt-1">{batch.name}</h4>
                                        <p className="text-xs text-blue-600 font-medium">{batch.focus}</p>
                                      </div>

                                      <button
                                        onClick={() => handleDeleteBatch(batch.id)}
                                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                                        title="Delete Batch"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>

                                    {/* Batch Completion & Metrics */}
                                    <div className="grid grid-cols-3 gap-2">
                                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center space-y-0.5">
                                        <div className="text-[10px] text-slate-500 font-semibold uppercase">Interns</div>
                                        <div className="text-lg font-bold text-slate-900">{batchInterns.length}</div>
                                      </div>
                                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center space-y-0.5">
                                        <div className="text-[10px] text-slate-500 font-semibold uppercase">Batch % Done</div>
                                        <div className="text-lg font-bold text-violet-700 font-mono">
                                          {batchCompletionRate}%
                                        </div>
                                      </div>
                                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center space-y-0.5">
                                        <div className="text-[10px] text-slate-500 font-semibold uppercase">Avg Score</div>
                                        <div className="text-lg font-bold text-amber-600 font-mono">
                                          {batchAvgScore}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Batch Task Completion Progress Bar */}
                                    <div className="space-y-1">
                                      <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-slate-500 font-medium">Batch Task Completion Rate:</span>
                                        <span className="font-mono font-bold text-violet-700">{batchCompletionRate}%</span>
                                      </div>
                                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/60">
                                        <div
                                          className="bg-gradient-to-r from-violet-600 to-indigo-600 h-full rounded-full"
                                          style={{ width: `${batchCompletionRate}%` }}
                                        />
                                      </div>
                                    </div>

                                    {/* Top Intern Performer Highlight */}
                                    {topIntern && (
                                      <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2.5">
                                          <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-extrabold shadow-sm">
                                            <Crown className="w-4 h-4 text-slate-900" />
                                          </div>
                                          <div>
                                            <div className="text-[10px] uppercase tracking-wider font-extrabold text-amber-800">
                                              Top Batch Performer
                                            </div>
                                            <div className="text-xs font-bold text-slate-900">{topIntern.name} ({topIntern.id})</div>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <div className="text-xs font-bold font-mono text-amber-700">
                                            {topIntern.performanceScore || 95}/100
                                          </div>
                                          <div className="text-[10px] text-slate-500">Score Rating</div>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-xs text-slate-500">Mentor: <strong className="text-slate-800">{batch.mentor || 'Maddi Harshavardhan'}</strong></span>
                                    <button
                                      onClick={() => handleOpenBatchDetails(batch)}
                                      className="py-1.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
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
                              <div key={member.id} className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-4 flex flex-col justify-between hover:shadow-md transition-all">
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                      <div className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                                        {member.isExecutive ? (
                                          <Crown className="w-4 h-4 text-amber-500" />
                                        ) : member.type === 'Intern' ? (
                                          <GraduationCap className="w-4 h-4 text-amber-600" />
                                        ) : (
                                          <Briefcase className="w-4 h-4 text-blue-600" />
                                        )}
                                        <span>{member.name}</span>
                                      </div>
                                      <div className="text-xs text-slate-500 font-mono flex items-center gap-2">
                                        <span>{member.id}</span>
                                        <span>•</span>
                                        <span className={`font-bold ${
                                          member.type === 'Intern' ? 'text-amber-700' : 'text-blue-700'
                                        }`}>
                                          {member.type}
                                        </span>
                                      </div>
                                      <div className="text-xs text-slate-600 font-medium">{member.role}</div>
                                    </div>

                                    {!member.isExecutive && (
                                      <button
                                        onClick={() => handleDeleteMember(member.id)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                                        title="Remove Member"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>

                                  {/* Workload Stats Card */}
                                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                                    <div className="flex items-center justify-between text-[11px]">
                                      <span className="text-slate-500 font-medium">Daily Work Shift:</span>
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-mono font-bold text-blue-700">
                                          {member.workHours || (member.type === 'Intern' ? 5 : 8)} Hours
                                        </span>
                                        {!member.isExecutive && (
                                          <button
                                            type="button"
                                            onClick={() => handleOpenEditWorkHours(member)}
                                            className="px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                                            title="Modify work shift hours"
                                          >
                                            <Clock className="w-3 h-3 text-blue-600" />
                                            <span>Modify</span>
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-slate-500 font-medium">Workload &amp; Progress:</span>
                                      <span className="font-mono font-bold text-blue-700">{memAvgProg}% Avg</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
                                      <div
                                        className={`h-full rounded-full ${
                                          memAvgProg === 100 ? 'bg-emerald-500' : memAvgProg >= 50 ? 'bg-blue-600' : 'bg-amber-500'
                                        }`}
                                        style={{ width: `${memAvgProg}%` }}
                                      />
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                                      <span><strong>{memTasks.length}</strong> Total Tasks</span>
                                      <span><strong className="text-emerald-700">{memCompleted}</strong> Done</span>
                                      <span><strong className="text-amber-700">{memInProgress}</strong> Active</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
                                  <button
                                    onClick={() => handleOpenMemberAnalysis(member)}
                                    className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 border border-slate-200 transition-colors cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-slate-600" />
                                    <span>Analysis</span>
                                  </button>

                                  <button
                                    onClick={() => handleOpenAssignTask(member.id)}
                                    className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1 font-bold cursor-pointer"
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
                          <h4 className="text-base font-bold text-slate-900">Workshops &amp; Bootcamps Catalog ({workshops.length})</h4>
                          <p className="text-xs text-slate-500">Manage all training programs displayed on the website.</p>
                        </div>
                        <button
                          onClick={handleOpenAddWorkshop}
                          className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 font-bold cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add New Workshop</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {workshops.map((ws) => (
                          <div key={ws.id} className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-3 hover:shadow-md transition-all">
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                  {ws.category}
                                </span>
                                <h4 className="font-bold text-slate-900 text-base pt-1">{ws.title}</h4>
                                <div className="text-xs text-slate-500">{ws.minDays} • {ws.mode}</div>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleOpenEditWorkshop(ws)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                                  title="Edit Workshop"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteWorkshop(ws.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                                  title="Delete Workshop"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">{ws.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB: SETTINGS */}
                  {activeTab === 'settings' && (
                    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-300">
                      <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-4">
                        <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                          <Key className="w-4 h-4 text-blue-600" />
                          <span>Change Executive Admin PIN</span>
                        </h4>

                        <form onSubmit={handleUpdatePin} className="space-y-4 text-xs">
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">New Security PIN *</label>
                            <input
                              type="password"
                              required
                              value={newPin}
                              onChange={(e) => setNewPin(e.target.value)}
                              placeholder="Enter at least 4 digits/characters"
                              className="form-input text-xs bg-white text-slate-900 border-slate-300 focus:border-blue-600"
                            />
                          </div>

                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">Confirm New PIN *</label>
                            <input
                              type="password"
                              required
                              value={confirmPin}
                              onChange={(e) => setConfirmPin(e.target.value)}
                              placeholder="Re-enter new PIN"
                              className="form-input text-xs bg-white text-slate-900 border-slate-300 focus:border-blue-600"
                            />
                          </div>

                          {pinChangeSuccess && (
                            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>{pinChangeSuccess}</span>
                            </div>
                          )}

                          <button type="submit" className="btn-primary w-full py-2.5 text-xs font-bold cursor-pointer">
                            Update Security PIN
                          </button>
                        </form>
                      </div>

                      <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-3">
                        <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                          <Download className="w-4 h-4 text-blue-600" />
                          <span>Data Backup &amp; Export</span>
                        </h4>
                        <p className="text-xs text-slate-500">Export all client leads, consultations, requirements, team members, tasks, and workshop data as a secure JSON backup file.</p>
                        <button onClick={exportData} className="btn-primary py-2.5 px-4 text-xs font-bold flex items-center gap-2 cursor-pointer">
                          <Download className="w-4 h-4" />
                          <span>Download Complete JSON Backup</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB: ATTENDANCE */}
                  {activeTab === 'attendance' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <AttendanceManagement />
                    </div>
                  )}

                  {/* TAB: LEAVES */}
                  {activeTab === 'leaves' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <LeaveManagement />
                    </div>
                  )}

                  {/* TAB: DAILY STATUS & HELP */}
                  {activeTab === 'daily_status_help' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <DailyStatusHelpAdmin />
                    </div>
                  )}

                  {/* TAB: ACCESS MATRIX (SUPER ADMIN) */}
                  {activeTab === 'access_matrix' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <AccessMatrixManagement />
                    </div>
                  )}

                  {/* TAB: INTERNSHIPS MANAGEMENT */}
                  {activeTab === 'internships' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <AdminInternshipsManagement />
                    </div>
                  )}

                  {/* TAB: COURSE OF CAREER (COC) */}
                  {activeTab === 'coc_courses' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <AdminCOCManagement />
                    </div>
                  )}

                  {/* TAB: HACKATHONS */}
                  {activeTab === 'hackathons' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <AdminHackathonsManagement />
                    </div>
                  )}
                </div>
              </main>
            </div>
          ) : authenticatedRole === 'founder' ? (
            /* =============================================================== */
            /* 2. FOUNDER & CEO MANAGEMENT DASHBOARD                           */
            /* =============================================================== */
            <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-8 space-y-6">
              {updateSuccessMsg && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs animate-in slide-in-from-top duration-300 max-w-6xl mx-auto">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>{updateSuccessMsg}</span>
                  </div>
                  <button onClick={() => setUpdateSuccessMsg('')} className="text-emerald-600 hover:text-emerald-900">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Founder Header Banner */}
              <div className="max-w-6xl mx-auto p-6 sm:p-8 rounded-3xl border border-slate-200/90 bg-white shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl border bg-gradient-to-br from-red-50 via-white to-red-100 border-red-200 text-red-600 flex items-center justify-center text-2xl font-bold shadow-xs">
                    <Crown className="w-8 h-8 text-amber-500" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                        {authenticatedUser.name}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full font-mono text-xs font-bold bg-slate-100 border border-slate-200 text-blue-700">
                        {authenticatedUser.id}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white shadow-xs flex items-center gap-1">
                        <Crown className="w-3 h-3 text-amber-300" />
                        <span>{authenticatedUser.type || 'Founder & CEO'}</span>
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium">
                      {authenticatedUser.role} • Sakith Harvan Technologies Executive Board
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    onClick={() => handleOpenAddMember('Employee')}
                    className="btn-primary text-xs py-2.5 px-4 font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Add Employee</span>
                  </button>

                  <button
                    onClick={() => handleOpenAddMember('Intern')}
                    className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Add Intern</span>
                  </button>

                  <button
                    onClick={() => handleOpenAssignTask('')}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Assign Work</span>
                  </button>
                </div>
              </div>

              {/* Founder Navigation Sub-Tabs */}
              <div className="max-w-6xl mx-auto flex items-center gap-2 border-b border-slate-200 pb-3 flex-wrap">
                {[
                  { id: 'manage_staff', label: `👥 Manage Staff (${teamMembers.length})` },
                  { id: 'internships', label: `💼 Internships Module` },
                  { id: 'coc_courses', label: `🎓 Course of Career` },
                  { id: 'hackathons', label: `🏆 Hackathons & Sprints` },
                  { id: 'all_tasks', label: `📊 Work Tracker & Deliverables (${assignedTasks.length})` },
                  { id: 'quotation_maker', label: `🧮 Quotation Maker` },
                  { id: 'my_tasks', label: `📝 My Directives (${memberTasks.length})` }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFounderTab(tab.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      founderTab === tab.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
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
                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                      {[
                        { id: 'all', label: `All Staff (${teamMembers.length})` },
                        { id: 'employees', label: `Employees (${teamMembers.filter(m => m.type === 'Employee').length})` },
                        { id: 'interns', label: `Interns (${teamMembers.filter(m => m.type === 'Intern').length})` }
                      ].map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setFounderStaffFilter(f.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            founderStaffFilter === f.id
                              ? 'bg-white text-blue-700 shadow-xs font-bold border border-slate-200'
                              : 'text-slate-600 hover:text-slate-900'
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
                        <div key={member.id} className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-3 hover:shadow-md transition-all">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                                {member.isExecutive && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                                <span>{member.name}</span>
                              </div>
                              <div className="text-xs text-slate-500 font-mono">{member.id} • {member.type}</div>
                              <div className="text-xs text-blue-600 font-semibold pt-1">{member.role}</div>
                            </div>

                            {!member.isExecutive && (
                              <button
                                onClick={() => handleDeleteMember(member.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                                title="Remove Member"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                            <button
                              onClick={() => handleOpenAssignTask(member.id)}
                              className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Assign Work</span>
                            </button>
                            <span className="text-slate-500 font-mono">
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
                    <h4 className="text-base font-bold text-slate-900">Company Task Directory &amp; Deliverables ({assignedTasks.length})</h4>
                    <button onClick={() => handleOpenAssignTask('')} className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1 font-bold cursor-pointer">
                      <Plus className="w-3.5 h-3.5" />
                      <span>Assign New Task</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {assignedTasks.map((t) => (
                      <div key={t.id} className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900 text-base">{t.title}</h4>
                              <span className="text-xs font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-semibold">
                                {t.id}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500">Assigned to: <strong className="text-slate-800">{t.memberName || t.memberId}</strong> ({t.memberId})</div>
                          </div>

                          <div className="flex items-center gap-2">
                            <select
                              value={t.status || 'In Progress'}
                              onChange={(e) => handleFounderUpdateTaskStatus(t.id, e.target.value)}
                              className="form-input text-xs py-1 px-2.5 bg-white text-slate-900 border-slate-300"
                            >
                              <option value="Assigned">Assigned</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                            </select>

                            <button
                              onClick={() => handleDeleteTask(t.id)}
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">{t.description}</p>

                        {t.completedWorkNotes && (
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                            <strong className="text-emerald-700 block mb-1">Staff Completed Work Notes:</strong>
                            {t.completedWorkNotes}
                          </div>
                        )}

                        {t.deliverableUrl && (
                          <div className="text-xs text-blue-600">
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
                  <h4 className="text-base font-bold text-slate-900">Directives Assigned to {authenticatedUser.name} ({memberTasks.length})</h4>
                  {memberTasks.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 text-xs bg-white rounded-2xl border border-slate-200/90 shadow-xs">
                      No personal directives assigned. Use "Assign Work" to assign tasks to other employees/interns.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {memberTasks.map((t) => (
                        <div key={t.id} className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-3">
                          <h5 className="font-bold text-slate-900 text-base">{t.title}</h5>
                          <p className="text-xs text-slate-600">{t.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: FOUNDER INTERNSHIPS MANAGEMENT */}
              {founderTab === 'internships' && (
                <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
                  <AdminInternshipsManagement />
                </div>
              )}

              {/* TAB 6: FOUNDER COC PRICING & ENROLLMENTS */}
              {founderTab === 'coc_courses' && (
                <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
                  <AdminCOCManagement />
                </div>
              )}

              {/* TAB 7: FOUNDER HACKATHONS MANAGEMENT */}
              {founderTab === 'hackathons' && (
                <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
                  <AdminHackathonsManagement />
                </div>
              )}
            </div>
          ) : (
            /* =============================================================== */
            /* 3. EMPLOYEE & INTERN WORK DASHBOARD                             */
            /* =============================================================== */
            <div className="flex-1 overflow-y-auto bg-slate-50 p-2 sm:p-6 space-y-6">
              {updateSuccessMsg && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-sm max-w-7xl mx-auto">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>{updateSuccessMsg}</span>
                  </div>
                  <button onClick={() => setUpdateSuccessMsg('')} className="text-emerald-600 hover:text-emerald-900">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Employee Enterprise Workspace: Exact Sidebar Modules from Image 1 & Dashboard from Image 2 */}
              <div className="w-full">
                <EmployeeWorkspace currentUser={authenticatedUser} />
              </div>

              {/* Member Profile Banner */}
              <div className="max-w-6xl mx-auto p-6 sm:p-8 rounded-3xl border border-slate-200/90 bg-white shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center text-2xl font-bold shadow-xs ${
                    authenticatedUser.type === 'Intern'
                      ? 'bg-amber-50 border-amber-200 text-amber-700'
                      : 'bg-blue-50 border-blue-200 text-blue-700'
                  }`}>
                    {authenticatedUser.name ? authenticatedUser.name.charAt(0) : 'U'}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                        {authenticatedUser.name}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full font-mono text-xs font-bold bg-slate-100 border border-slate-200 text-blue-700">
                        {authenticatedUser.id}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        authenticatedUser.type === 'Intern'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-blue-50 text-blue-800 border border-blue-200'
                      }`}>
                        {authenticatedUser.type}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium">
                      {authenticatedUser.role}
                    </p>
                  </div>
                </div>

                {/* Progress Summary */}
                <div className="w-full md:w-auto flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="text-center px-3">
                    <div className="text-xl sm:text-2xl font-extrabold text-slate-900">{memberTasks.length}</div>
                    <div className="text-[10px] text-slate-500 font-semibold uppercase">Total Tasks</div>
                  </div>
                  <div className="h-8 w-[1px] bg-slate-200" />
                  <div className="text-center px-3">
                    <div className="text-xl sm:text-2xl font-extrabold text-amber-600">{inProgressCount}</div>
                    <div className="text-[10px] text-amber-700 font-semibold uppercase">In Progress</div>
                  </div>
                  <div className="h-8 w-[1px] bg-slate-200" />
                  <div className="text-center px-3">
                    <div className="text-xl sm:text-2xl font-extrabold text-emerald-600">{completedCount}</div>
                    <div className="text-[10px] text-emerald-700 font-semibold uppercase">Completed</div>
                  </div>
                </div>
              </div>

              {/* Task Controls & Filter */}
              <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span>My Assigned Work &amp; Deliverables</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-blue-700 border border-slate-200 text-xs font-mono font-bold">
                    {memberTasks.length}
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  {['All', 'In Progress', 'Completed'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setStaffTaskFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        staffTaskFilter === f
                          ? 'bg-white text-blue-700 shadow-xs font-bold border border-slate-200'
                          : 'text-slate-600 hover:text-slate-900'
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
                  <div className="p-12 rounded-3xl border border-slate-200/90 bg-white shadow-xs text-center space-y-3">
                    <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto" />
                    <h4 className="text-base font-bold text-slate-900">No tasks currently under "{staffTaskFilter}"</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      New tasks assigned by Founder &amp; CEO will appear here automatically.
                    </p>
                  </div>
                ) : (
                  filteredMemberTasks.map((t) => (
                    <div key={t.id} className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-base">{t.title}</h4>
                            <span className="text-xs font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-semibold">
                              {t.id}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              t.priority === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}>
                              {t.priority || 'Normal'} Priority
                            </span>
                          </div>
                          <div className="text-xs text-slate-500">Assigned: {t.assignedDate} • Deadline: {t.dueDate || 'Flexible'}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            t.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {t.status} ({t.progress || 0}%)
                          </span>

                          <button
                            onClick={() => handleStartUpdate(t)}
                            className="btn-primary text-xs py-1.5 px-3 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Update Progress</span>
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">{t.description}</p>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                          <span>Completion Progress</span>
                          <span>{t.progress || 0}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200/60">
                          <div
                            className={`h-full transition-all duration-300 ${
                              t.status === 'Completed' ? 'bg-emerald-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${t.progress || 0}%` }}
                          />
                        </div>
                      </div>

                      {t.completedWorkNotes && (
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                          <strong className="text-blue-700 block">Submitted Notes &amp; Status:</strong>
                          <p>{t.completedWorkNotes}</p>
                          {t.completedDate && <span className="text-[10px] text-slate-500 block pt-1">Completed Date: {t.completedDate}</span>}
                        </div>
                      )}

                      {t.deliverableUrl && (
                        <div className="text-xs text-blue-600 flex items-center gap-1.5">
                          <LinkIcon className="w-3.5 h-3.5" />
                          <strong>Deliverable:</strong>
                          <a href={t.deliverableUrl} target="_blank" rel="noreferrer" className="underline hover:text-blue-800">
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
        <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-600" />
                <span>Update Work Deliverable &amp; Status</span>
              </h3>
              <button onClick={() => setEditingTaskId(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status *</label>
                <select
                  value={workUpdateForm.status}
                  onChange={(e) => setWorkUpdateForm({
                    ...workUpdateForm,
                    status: e.target.value,
                    progress: e.target.value === 'Completed' ? 100 : workUpdateForm.progress
                  })}
                  className="form-input text-xs bg-white text-slate-900 border-slate-300 focus:border-blue-600"
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Progress Percentage</span>
                  <span className="font-mono text-blue-600 font-bold">{workUpdateForm.progress}%</span>
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
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deliverable / Git Repo / Demo URL</label>
                <input
                  type="url"
                  value={workUpdateForm.deliverableUrl}
                  onChange={(e) => setWorkUpdateForm({ ...workUpdateForm, deliverableUrl: e.target.value })}
                  placeholder="https://github.com/sakithharvan/... or demo link"
                  className="form-input text-xs font-mono bg-white text-slate-900 border-slate-300 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Work Description / Deliverable Notes *</label>
                <textarea
                  rows="3"
                  value={workUpdateForm.completedWorkNotes}
                  onChange={(e) => setWorkUpdateForm({ ...workUpdateForm, completedWorkNotes: e.target.value })}
                  placeholder="Describe your progress, technical modules completed, PR link, or status updates for the Founder..."
                  className="form-input text-xs font-sans bg-white text-slate-900 border-slate-300 focus:border-blue-600"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button onClick={() => setEditingTaskId(null)} className="btn-secondary py-2 px-4 text-xs font-semibold cursor-pointer">
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveWorkUpdate(editingTaskId)}
                  className="btn-primary py-2 px-5 text-xs font-bold cursor-pointer"
                >
                  Save &amp; Sync Work Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Add Team Member Modal (Employee / Intern) - Website Clean Light UI */}
      {isAddingMember && (
        <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  {memberFormData.type === 'Intern' ? (
                    <GraduationCap className="w-5 h-5 text-amber-600" />
                  ) : (
                    <Briefcase className="w-5 h-5 text-blue-600" />
                  )}
                  <span>Create {memberFormData.type} Login &amp; Profile</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {memberFormData.type === 'Intern'
                    ? 'Register intern credentials, domain, cohort batch, tenure period, daily work time, and trigger project assignment.'
                    : 'Create full-time employee credentials, daily work hours, and administrative designation.'}
                </p>
              </div>

              <button onClick={() => setIsAddingMember(false)} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-3.5 text-xs">
              {/* Row 1: Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={memberFormData.name}
                    onChange={(e) => setMemberFormData({ ...memberFormData, name: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="form-input text-xs text-slate-900 bg-white border border-slate-300 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email ID *</label>
                  <input
                    type="email"
                    required
                    value={memberFormData.email}
                    onChange={(e) => setMemberFormData({ ...memberFormData, email: e.target.value })}
                    placeholder="name@sakithharvan.com"
                    className="form-input text-xs text-slate-900 bg-white border border-slate-300 focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Row 2: Mobile Number & DOB */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={memberFormData.phone}
                    onChange={(e) => setMemberFormData({ ...memberFormData, phone: e.target.value })}
                    placeholder="+91 9848012345"
                    className="form-input text-xs text-slate-900 bg-white border border-slate-300 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date of Birth (DOB) *</label>
                  <input
                    type="date"
                    required
                    value={memberFormData.dob}
                    onChange={(e) => setMemberFormData({ ...memberFormData, dob: e.target.value })}
                    className="form-input text-xs text-slate-900 bg-white border border-slate-300 focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Row 3: Employee/Intern ID & Login User ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {memberFormData.type === 'Intern' ? 'Intern ID *' : 'Emp ID *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={memberFormData.type === 'Intern' ? memberFormData.internId : memberFormData.empId}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (memberFormData.type === 'Intern') {
                        setMemberFormData({ ...memberFormData, internId: val, id: val, userId: memberFormData.userId || val });
                      } else {
                        setMemberFormData({ ...memberFormData, empId: val, id: val, userId: memberFormData.userId || val });
                      }
                    }}
                    placeholder={memberFormData.type === 'Intern' ? 'e.g. INT-205' : 'e.g. EMP-105'}
                    className="form-input text-xs uppercase font-mono text-slate-900 bg-white border border-slate-300 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">User ID for Login *</label>
                  <input
                    type="text"
                    required
                    value={memberFormData.userId}
                    onChange={(e) => setMemberFormData({ ...memberFormData, userId: e.target.value, id: e.target.value })}
                    placeholder="Login ID (e.g. INT-205)"
                    className="form-input text-xs uppercase font-mono text-slate-900 bg-white border border-slate-300 focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Row 4: Password & Date of Joining */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Password for Login *</label>
                  <input
                    type="text"
                    required
                    value={memberFormData.password}
                    onChange={(e) => setMemberFormData({ ...memberFormData, password: e.target.value })}
                    placeholder="Default: Shtsa@2026"
                    className="form-input text-xs font-mono text-slate-900 bg-white border border-slate-300 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date of Joining *</label>
                  <input
                    type="date"
                    required
                    value={memberFormData.joiningDate}
                    onChange={(e) => setMemberFormData({ ...memberFormData, joiningDate: e.target.value })}
                    className="form-input text-xs text-slate-900 bg-white border border-slate-300 focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Row 5: Role/Domain & Daily Work Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {memberFormData.type === 'Intern' ? 'Domain Selection *' : 'Role / Designation *'}
                  </label>
                  {memberFormData.type === 'Intern' ? (
                    <select
                      required
                      value={memberFormData.role}
                      onChange={(e) => setMemberFormData({ ...memberFormData, role: e.target.value })}
                      className="form-input text-xs text-slate-900 bg-white border border-slate-300 focus:border-blue-600"
                    >
                      <option value="AI & Machine Learning">AI &amp; Machine Learning</option>
                      <option value="Full Stack Web Development">Full Stack Web Development</option>
                      <option value="Digital Forensics & Cyber Security">Digital Forensics &amp; Cyber Security</option>
                      <option value="Cloud Computing & DevOps">Cloud Computing &amp; DevOps</option>
                      <option value="Mobile App Development (React Native / Flutter)">Mobile App Development</option>
                      <option value="UI/UX & Product Design">UI/UX &amp; Product Design</option>
                      <option value="Data Science & Analytics">Data Science &amp; Analytics</option>
                      <option value="Embedded Systems & IoT">Embedded Systems &amp; IoT</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      value={memberFormData.role}
                      onChange={(e) => setMemberFormData({ ...memberFormData, role: e.target.value })}
                      placeholder="e.g. Senior Backend Engineer"
                      className="form-input text-xs text-slate-900 bg-white border border-slate-300 focus:border-blue-600"
                    />
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Daily Time to Work (in Hours) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    step="0.5"
                    required
                    value={memberFormData.workHours}
                    onChange={(e) => setMemberFormData({ ...memberFormData, workHours: e.target.value })}
                    placeholder="e.g. 5 or 8"
                    className="form-input text-xs font-mono text-slate-900 bg-white border border-slate-300 focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Employee Team / Department field */}
              {memberFormData.type !== 'Intern' && (
                <div className="pt-2 border-t border-slate-100">
                  <label className="block font-bold text-slate-700 mb-1">
                    Assigned Team / Department (Optional)
                  </label>
                  <input
                    type="text"
                    value={memberFormData.batch || ''}
                    onChange={(e) => setMemberFormData({ ...memberFormData, batch: e.target.value })}
                    placeholder="e.g. Core Engineering Team, Frontend Squad, Cloud Ops"
                    className="form-input text-xs text-slate-900 bg-white border border-slate-300 focus:border-blue-600"
                  />
                </div>
              )}

              {/* Intern-specific fields: Batch & Internship Period */}
              {memberFormData.type === 'Intern' && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Cohort Batch (Enter or Select) *
                    </label>
                    <input
                      type="text"
                      required
                      list="cohort-batches-list"
                      value={memberFormData.batch}
                      onChange={(e) => setMemberFormData({ ...memberFormData, batch: e.target.value })}
                      placeholder="Enter or select batch name"
                      className="form-input text-xs text-slate-900 bg-white border border-slate-300 focus:border-blue-600"
                    />
                    <datalist id="cohort-batches-list">
                      {batches.map(b => (
                        <option key={b.id} value={b.name} />
                      ))}
                      <option value="Batch 2026-Alpha (AI & ML)" />
                      <option value="Batch 2026-Beta (FullStack & Cloud)" />
                      <option value="Summer 2026 Cyber Forensics Batch" />
                      <option value="Autumn 2026 AI Research Batch" />
                    </datalist>
                  </div>

                  {/* Internship Period Dates Selection */}
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                    <div className="text-[11px] font-mono font-bold text-amber-900 uppercase">
                      Internship Period (Date Selection) *
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-600 mb-1 text-[11px] font-semibold">Period Start Date *</label>
                        <input
                          type="date"
                          required
                          value={memberFormData.internshipStartDate}
                          onChange={(e) => setMemberFormData({ ...memberFormData, internshipStartDate: e.target.value })}
                          className="form-input text-xs text-slate-900 bg-white border border-slate-300"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 mb-1 text-[11px] font-semibold">Period End Date *</label>
                        <input
                          type="date"
                          required
                          value={memberFormData.internshipEndDate}
                          onChange={(e) => setMemberFormData({ ...memberFormData, internshipEndDate: e.target.value })}
                          className="form-input text-xs text-slate-900 bg-white border border-slate-300"
                        />
                      </div>
                    </div>

                    <div className="text-[10px] text-amber-800 leading-relaxed pt-1">
                      <strong>Policy Notice:</strong> If the internship end date passes, login access is paused. Account remains saved in system. Admin can override access or extend tenure at any time.
                    </div>
                  </div>
                </div>
              )}

              {/* Authorization Rights Matrix Selection */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <label className="block font-bold text-slate-800 text-xs">
                      Delegated Rights &amp; Access Matrix
                    </label>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Select permissions to grant in this user's login
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setMemberFormData(prev => ({
                      ...prev,
                      permissions: {
                        ...(prev.type === 'Intern' ? DEFAULT_PERMISSIONS.intern : DEFAULT_PERMISSIONS.employee)
                      }
                    }))}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                  >
                    Standard Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setMemberFormData(prev => ({
                      ...prev,
                      permissions: {
                        ...prev.permissions,
                        manage_attendance: true,
                        manage_leaves: true,
                        view_work_status: true,
                        manage_tasks: true
                      }
                    }))}
                    className="px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold border border-blue-200 cursor-pointer"
                  >
                    + Team Lead / HR
                  </button>
                  <button
                    type="button"
                    onClick={() => setMemberFormData(prev => ({
                      ...prev,
                      permissions: {
                        ...prev.permissions,
                        quotation_maker: true,
                        manage_leads: true
                      }
                    }))}
                    className="px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold border border-emerald-200 cursor-pointer"
                  >
                    + Sales &amp; Quotations
                  </button>
                  <button
                    type="button"
                    onClick={() => setMemberFormData(prev => ({
                      ...prev,
                      permissions: {
                        ...prev.permissions,
                        view_overview: true,
                        manage_leads: true,
                        quotation_maker: true,
                        manage_tasks: true,
                        manage_workshops: true,
                        manage_attendance: true,
                        manage_leaves: true,
                        view_work_status: true,
                        manage_access_matrix: true
                      }
                    }))}
                    className="px-2 py-0.5 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold border border-purple-200 cursor-pointer"
                  >
                    + Grant All Matrix Rights
                  </button>
                </div>

                {/* Rights Checklist Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 rounded-xl bg-slate-50 border border-slate-200">
                  {[
                    { key: 'quotation_maker', label: 'Quotation Engine & Pricing', desc: 'Can generate & export official client quotes' },
                    { key: 'manage_attendance', label: 'Staff Attendance & Punch Records', desc: 'Can audit all punch-in/out timings and hours' },
                    { key: 'manage_leaves', label: 'Leave Requests & Approvals', desc: 'Can review, approve, or reject leave filings' },
                    { key: 'view_work_status', label: 'Daily Work Updates & Help Desk', desc: 'Can inspect daily work status & resolve help' },
                    { key: 'manage_tasks', label: 'Task Assignment & Tracking', desc: 'Can assign tasks & monitor project deadlines' },
                    { key: 'manage_leads', label: 'Consultations & Client Leads', desc: 'Can view & manage inbound customer requirements' },
                    { key: 'manage_workshops', label: 'Workshops & Bootcamps', desc: 'Can schedule & manage training workshops' },
                    { key: 'manage_access_matrix', label: 'Access Matrix & User Logins', desc: 'Can provision logins & change rights matrices' },
                    { key: 'view_overview', label: 'Executive Dashboard & Metrics', desc: 'Can view company financials & platform stats' }
                  ].map(item => {
                    const isChecked = !!memberFormData.permissions?.[item.key];
                    return (
                      <label
                        key={item.key}
                        className={`flex items-start gap-2 p-2 rounded-lg border transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-blue-50/80 border-blue-300 text-slate-900 shadow-xs'
                            : 'bg-white border-slate-200/80 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setMemberFormData(prev => ({
                              ...prev,
                              permissions: {
                                ...(prev.permissions || {}),
                                [item.key]: !isChecked
                              }
                            }));
                          }}
                          className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <div className="min-w-0">
                          <span className={`block font-bold text-[11px] leading-tight ${isChecked ? 'text-blue-900' : 'text-slate-800'}`}>
                            {item.label}
                          </span>
                          <span className="block text-[9.5px] text-slate-500 truncate leading-snug">
                            {item.desc}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsAddingMember(false)} className="btn-secondary py-2 px-4 text-xs font-semibold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="btn-primary py-2 px-5 text-xs font-bold glow-blue cursor-pointer">
                  {memberFormData.type === 'Intern' ? 'Save & Assign Project' : 'Save Employee Profile & Rights'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Assign Task Modal */}
      {isAssigningTask && (
        <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>Assign Task / Work Directive</span>
              </h3>
              <button onClick={() => setIsAssigningTask(false)} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAssignedTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Member or Domain *</label>
                <select
                  value={taskFormData.memberIds.length > 1 ? `BATCH-${teamMembers.find(m => m.id === taskFormData.memberIds[0])?.batch}` : taskFormData.memberIds[0] || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.startsWith('BATCH-')) {
                      const batchName = val.replace('BATCH-', '');
                      const memberIds = teamMembers.filter(m => m.batch === batchName).map(m => m.id);
                      setTaskFormData({ ...taskFormData, memberIds });
                    } else {
                      setTaskFormData({ ...taskFormData, memberIds: [val] });
                    }
                  }}
                  className="form-input text-xs bg-white text-slate-900 border-slate-300 focus:border-blue-600"
                >
                  <option value="" disabled>-- Select Domain or Member --</option>
                  <optgroup label="By Domain (Batch)">
                    {batches.map(b => (
                      <option key={b.id} value={`BATCH-${b.name}`}>All in {b.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Individual Members">
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        [{m.id}] {m.name} — {m.role} ({m.type})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={taskFormData.title}
                  onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                  placeholder="e.g. Implement Attendance Module API Endpoints"
                  className="form-input text-xs bg-white text-slate-900 border-slate-300 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description &amp; Deliverables *</label>
                <textarea
                  rows="3"
                  required
                  value={taskFormData.description}
                  onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                  placeholder="Specify task scope, modules, tech stack, testing criteria, and deliverables expected..."
                  className="form-input text-xs font-sans bg-white text-slate-900 border-slate-300 focus:border-blue-600"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsAssigningTask(false)} className="btn-secondary py-2 px-4 text-xs font-semibold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="btn-primary py-2 px-5 text-xs font-bold cursor-pointer">
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Add/Edit Workshop Modal */}
      {isEditingWorkshop && (
        <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Workshop Catalog Details</h3>
              <button onClick={() => setIsEditingWorkshop(false)} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWorkshop} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Workshop Title *</label>
                <input
                  type="text"
                  required
                  value={workshopFormData.title}
                  onChange={(e) => setWorkshopFormData({ ...workshopFormData, title: e.target.value })}
                  className="form-input text-xs bg-white text-slate-900 border-slate-300 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category / Domain *</label>
                <input
                  type="text"
                  required
                  value={workshopFormData.category}
                  onChange={(e) => setWorkshopFormData({ ...workshopFormData, category: e.target.value })}
                  className="form-input text-xs bg-white text-slate-900 border-slate-300 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Overview Description *</label>
                <textarea
                  rows="3"
                  required
                  value={workshopFormData.description}
                  onChange={(e) => setWorkshopFormData({ ...workshopFormData, description: e.target.value })}
                  className="form-input text-xs bg-white text-slate-900 border-slate-300 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Key Curriculum Topics (1 per line)</label>
                <textarea
                  rows="4"
                  value={workshopFormData.learn}
                  onChange={(e) => setWorkshopFormData({ ...workshopFormData, learn: e.target.value })}
                  className="form-input text-xs font-mono bg-white text-slate-900 border-slate-300 focus:border-blue-600"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsEditingWorkshop(false)} className="btn-secondary py-2 px-4 text-xs font-semibold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="btn-primary py-2 px-5 text-xs font-bold cursor-pointer">
                  Save Workshop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Create Batch Modal */}
      {isAddingBatch && (
        <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-violet-600" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900">Create New Intern Batch</h3>
              </div>
              <button onClick={() => setIsAddingBatch(false)} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBatch} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Batch Code / ID *</label>
                  <input
                    type="text"
                    required
                    value={batchFormData.id}
                    onChange={(e) => setBatchFormData({ ...batchFormData, id: e.target.value.toUpperCase() })}
                    placeholder="BATCH-03"
                    className="form-input text-xs uppercase font-mono bg-white text-slate-900 border-slate-300 focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={batchFormData.startDate}
                    onChange={(e) => setBatchFormData({ ...batchFormData, startDate: e.target.value })}
                    className="form-input text-xs font-mono bg-white text-slate-900 border-slate-300 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Batch Name *</label>
                <input
                  type="text"
                  required
                  value={batchFormData.name}
                  onChange={(e) => setBatchFormData({ ...batchFormData, name: e.target.value })}
                  placeholder="e.g. Batch 2026-Gamma (Cybersecurity & DevOps)"
                  className="form-input text-xs bg-white text-slate-900 border-slate-300 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Technical Focus / Domain *</label>
                <input
                  type="text"
                  required
                  value={batchFormData.focus}
                  onChange={(e) => setBatchFormData({ ...batchFormData, focus: e.target.value })}
                  placeholder="e.g. AI Agents, LLM Fine-Tuning & Kubernetes"
                  className="form-input text-xs bg-white text-slate-900 border-slate-300 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Mentor</label>
                <input
                  type="text"
                  value={batchFormData.mentor}
                  onChange={(e) => setBatchFormData({ ...batchFormData, mentor: e.target.value })}
                  placeholder="Maddi Harshavardhan"
                  className="form-input text-xs bg-white text-slate-900 border-slate-300 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Batch Description &amp; Objectives</label>
                <textarea
                  rows="3"
                  value={batchFormData.description}
                  onChange={(e) => setBatchFormData({ ...batchFormData, description: e.target.value })}
                  placeholder="Goals for this cohort, expected project deliverables, and weekly milestones..."
                  className="form-input text-xs bg-white text-slate-900 border-slate-300 focus:border-blue-600"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsAddingBatch(false)} className="btn-secondary py-2 px-4 text-xs font-semibold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="py-2 px-5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer">
                  Create Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Batch Details & Top Performer Spotlight Modal */}
      {selectedBatch && (
        <div className="fixed inset-0 z-[125] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white max-w-2xl w-full p-6 sm:p-8 rounded-3xl border border-slate-200/90 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 font-bold">
                    {selectedBatch.id}
                  </span>
                  <span className="text-xs text-slate-500">Mentor: {selectedBatch.mentor || 'Maddi Harshavardhan'}</span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">{selectedBatch.name}</h3>
                <p className="text-xs text-blue-600 font-semibold">{selectedBatch.focus}</p>
              </div>
              <button onClick={() => setSelectedBatch(null)} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100">
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
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase">Total Interns</div>
                      <div className="text-xl font-extrabold text-slate-900 mt-0.5">{batchInterns.length}</div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase">Batch % Done</div>
                      <div className="text-xl font-extrabold text-blue-600 font-mono mt-0.5">{batchCompletionRate}%</div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase">Total Tasks</div>
                      <div className="text-xl font-extrabold text-slate-900 mt-0.5">{batchTasks.length} ({batchCompletedTasks} Done)</div>
                    </div>
                  </div>

                  {/* Top Intern Performer Award Card */}
                  {topIntern && (
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-white to-amber-50/80 border border-amber-200 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2.5 rounded-xl bg-amber-500 text-white font-black shadow-sm">
                            <Crown className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700">
                              🏆 Top Performer in {selectedBatch.name}
                            </div>
                            <h4 className="text-base font-extrabold text-slate-900">{topIntern.name} ({topIntern.id})</h4>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xl font-extrabold text-amber-600 font-mono">{topIntern.performanceScore || 95}/100</div>
                          <div className="text-[10px] text-slate-500 font-semibold">Evaluation Rating</div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600">
                        {topIntern.name} has demonstrated the highest task completion velocity and technical evaluation score across the cohort.
                      </p>
                    </div>
                  )}

                  {/* Batch Interns List */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Interns in this Batch ({batchInterns.length})
                      </h4>
                      <button
                        onClick={() => {
                          setSelectedBatch(null);
                          handleOpenAddMember('Intern');
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Intern to Batch</span>
                      </button>
                    </div>

                    {batchInterns.length === 0 ? (
                      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
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
                              className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/90 flex items-center justify-between gap-3 text-xs hover:bg-slate-50 transition-colors"
                            >
                              <div className="space-y-0.5">
                                <div className="font-bold text-slate-900 flex items-center gap-2">
                                  <span>{intern.name}</span>
                                  <span className="text-[10px] font-mono text-slate-500 font-semibold">({intern.id})</span>
                                </div>
                                <div className="text-slate-500 text-[11px]">{intern.role}</div>
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="font-mono font-bold text-blue-600">{iRate}% Completed</div>
                                  <div className="text-[10px] text-slate-500">{iDone} of {iTasks.length} tasks</div>
                                </div>

                                <div className="text-right">
                                  <div className="font-mono font-bold text-amber-600">{intern.performanceScore || 90}/100</div>
                                  <div className="text-[10px] text-slate-500">Score</div>
                                </div>

                                <button
                                  onClick={() => {
                                    setSelectedBatch(null);
                                    handleOpenMemberAnalysis(intern);
                                  }}
                                  className="btn-secondary py-1 px-3 text-[11px] font-bold"
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
        <div className="fixed inset-0 z-[130] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white max-w-3xl w-full p-6 sm:p-8 rounded-3xl border border-slate-200/90 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-extrabold text-white text-lg shadow-sm">
                  {analyzingMember.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-extrabold text-slate-900">{analyzingMember.name}</h3>
                    <span className="text-xs font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 font-bold">
                      {analyzingMember.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      analyzingMember.type === 'Intern'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {analyzingMember.type}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">{analyzingMember.role}</div>
                  {analyzingMember.batch && (
                    <div className="text-[11px] text-amber-700 font-semibold mt-0.5 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      <span>{analyzingMember.batch}</span>
                    </div>
                  )}
                </div>
              </div>

              <button onClick={() => setAnalyzingMember(null)} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100">
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
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <div className="text-slate-500 font-semibold text-[11px] uppercase">Completion Rate</div>
                      <div className="text-2xl font-extrabold text-blue-600 font-mono">{completionPct}%</div>
                      <div className="text-[10px] text-slate-500">{memCompleted}/{memTasks.length} Done</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <div className="text-slate-500 font-semibold text-[11px] uppercase">Performance Score</div>
                      <div className="text-2xl font-extrabold text-amber-600 font-mono">
                        {analyzingMember.performanceScore || 92}/100
                      </div>
                      <div className="text-[10px] text-emerald-600 font-bold">★ High Performing</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <div className="text-slate-500 font-semibold text-[11px] uppercase">Active Tasks</div>
                      <div className="text-2xl font-extrabold text-slate-900">{memInProgress}</div>
                      <div className="text-[10px] text-slate-500">In Sprint</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <div className="text-slate-500 font-semibold text-[11px] uppercase">Deliverables</div>
                      <div className="text-2xl font-extrabold text-indigo-600">{memSubmissions.length}</div>
                      <div className="text-[10px] text-slate-500">PRs &amp; Work Notes</div>
                    </div>
                  </div>

                  {/* Daily Work Shift Adjustment Bar */}
                  <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-blue-600 font-mono tracking-wider">
                        Assigned Daily Work Shift
                      </div>
                      <div className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">
                        {analyzingMember.workHours || (analyzingMember.type === 'Intern' ? 5 : 8)} Hours / Day
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        Standard target hours required for full shift (Green flag)
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenEditWorkHours(analyzingMember)}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Modify Work Hours</span>
                    </button>
                  </div>

                  {/* Task Completion Progress Gauge */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">Overall Task Completion Percentage:</span>
                      <span className="font-mono font-extrabold text-blue-600 text-sm">{completionPct}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          completionPct === 100 ? 'bg-emerald-500' : completionPct >= 50 ? 'bg-blue-600' : 'bg-amber-500'
                        }`}
                        style={{ width: `${completionPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Assigned Tasks History */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                        Assigned Tasks &amp; Milestones ({memTasks.length})
                      </h4>
                      <button
                        onClick={() => handleOpenAssignTask(analyzingMember.id)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Assign New Task</span>
                      </button>
                    </div>

                    {memTasks.length === 0 ? (
                      <p className="text-slate-500 italic">No tasks currently assigned to this member.</p>
                    ) : (
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {memTasks.map((t) => (
                          <div
                            key={t.id}
                            className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/90 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                          >
                            <div className="space-y-0.5">
                              <div className="font-bold text-slate-900 flex items-center gap-2">
                                <span>{t.title}</span>
                                <span className="text-[10px] font-mono text-slate-500 font-semibold">({t.id})</span>
                              </div>
                              <div className="text-[11px] text-slate-500">{t.description.slice(0, 70)}...</div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                t.status === 'Completed'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
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
                    <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                      Submitted Code Deliverables &amp; PRs ({memSubmissions.length})
                    </h4>
                    {memSubmissions.length === 0 ? (
                      <p className="text-slate-500 italic">No deliverable URLs submitted yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {memSubmissions.map((s) => (
                          <div
                            key={s.id}
                            className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/90 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                          >
                            <div>
                              <div className="font-bold text-slate-900">{s.title}</div>
                              <div className="text-[11px] text-slate-500">Type: {s.type}</div>
                            </div>
                            <a
                              href={s.deliverableUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-primary py-1 px-3 text-xs font-bold flex items-center gap-1"
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

      {/* 8. Modify Candidate Work Hours Modal */}
      {editingWorkHoursMember && (
        <div className="fixed inset-0 z-[140] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Modify Work Shift Hours</h3>
                  <p className="text-xs text-blue-100 font-mono">
                    {editingWorkHoursMember.name} • {editingWorkHoursMember.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingWorkHoursMember(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveModifiedWorkHours} className="p-6 space-y-5 text-xs text-slate-700">
              {/* Member Profile Banner */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Current Role &amp; Shift</span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">
                    {editingWorkHoursMember.type || editingWorkHoursMember.role}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Assigned Shift</span>
                  <div className="font-mono font-black text-blue-600 text-sm mt-0.5">
                    {editingWorkHoursMember.workHours || (editingWorkHoursMember.type === 'Intern' ? 5 : 8)} Hours / day
                  </div>
                </div>
              </div>

              {/* Quick Hours Preset Chips */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-800">
                  Quick Select Hours Preset:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: '4h (Half)', val: 4 },
                    { label: '5h (Intern)', val: 5 },
                    { label: '6h (Ext)', val: 6 },
                    { label: '7h (Track)', val: 7 },
                    { label: '8h (Employee)', val: 8 },
                    { label: '9h (Overtime)', val: 9 }
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setNewWorkHoursInput(preset.val)}
                      className={`p-2 rounded-xl text-center font-bold text-xs transition-all border cursor-pointer ${
                        Number(newWorkHoursInput) === preset.val
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-300'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {preset.val} Hours
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Hours Input */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-800">
                  Daily Work Shift Hours (1.0 to 16.0 hrs) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="16"
                    step="0.5"
                    required
                    value={newWorkHoursInput}
                    onChange={(e) => setNewWorkHoursInput(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-300 bg-white font-mono font-bold text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                    placeholder="e.g. 5 or 8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    Hours / Day
                  </span>
                </div>
              </div>

              {/* Optional Reason / Notes */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-800">
                  Adjustment Reason / Operational Note (Optional)
                </label>
                <input
                  type="text"
                  value={workHoursReason}
                  onChange={(e) => setWorkHoursReason(e.target.value)}
                  placeholder="e.g. Exam tenure adjustment, Full-time offer promotion, Shift restructuring"
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              {/* Operational Notice */}
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 text-[11px] flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Modifying work hours takes effect immediately across Attendance Target Tracking, Punch In/Out completion meters, and the staff workspace dashboard.
                </span>
              </div>

              {/* Success Notice if triggered */}
              {workHoursSuccessNotice && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{workHoursSuccessNotice}</span>
                </div>
              )}

              {/* Footer Actions */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingWorkHoursMember(null)}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Save New Shift Hours</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
