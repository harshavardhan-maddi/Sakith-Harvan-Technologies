import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutGrid, FolderKanban, BookOpen, Activity, CalendarCheck, 
  PartyPopper, Umbrella, Bell, Bug, Compass, Flame, Eye,
  Clock, Calendar as CalendarIcon, CheckCircle2, AlertCircle, 
  Send, HelpCircle, FileText, ChevronLeft, ChevronRight, 
  ArrowRight, Sparkles, AlertTriangle, ExternalLink, UserCheck,
  Target, Award, Timer, Play, CheckSquare, X, Briefcase, GraduationCap,
  KeyRound, ShieldCheck, Lock, Settings, Search, MessageSquare,
  ArrowUpRight, Users, Check, RefreshCw, Sun, Shield, Info, LogOut,
  CornerDownRight, Calculator, Plus
} from 'lucide-react';
import { ThreeDLogoCanvas } from '../ThreeDLogoCanvas';
import { ThreeDPunchInEmblem } from '../ThreeDPunchInEmblem';
import { LeaveApprovalCertificateModal } from './LeaveApprovalCertificateModal';
import { QuotationMaker } from '../QuotationMaker';
import { AttendanceManagement } from './AttendanceManagement';
import { LeaveManagement } from './LeaveManagement';
import { DailyStatusHelpAdmin } from './DailyStatusHelpAdmin';
import { AccessMatrixManagement } from './AccessMatrixManagement';
import { 
  recordPunchIn, 
  recordPunchOut, 
  getStoredAttendance, 
  getEmployeeCalendarDays,
  getStoredLeaves,
  saveLeaveApplications,
  getStoredDailyStatus,
  saveDailyWorkStatus,
  getStoredHelpRequests,
  saveHelpRequests,
  getStoredUsers,
  saveUsersDirectory,
  getLocalDateString,
  DEFAULT_PERMISSIONS
} from '../../lib/enterprisePortalStore';

/**
 * 2026 Company Holiday Calendar
 */
const COMPANY_HOLIDAYS_2026 = [
  { id: 'h1', name: 'New Year\'s Day', date: '2026-01-01', day: 'Thursday', type: 'Mandatory', daysLeft: 0 },
  { id: 'h2', name: 'Republic Day', date: '2026-01-26', day: 'Monday', type: 'National', daysLeft: 0 },
  { id: 'h3', name: 'Eid-ul-Fitr', date: '2026-03-20', day: 'Friday', type: 'Gazetted', daysLeft: 0 },
  { id: 'h4', name: 'Independence Day', date: '2026-08-15', day: 'Saturday', type: 'National', daysLeft: 0 },
  { id: 'h5', name: 'Gandhi Jayanti', date: '2026-10-02', day: 'Friday', type: 'National', daysLeft: 0 },
  { id: 'h6', name: 'Dussehra (Vijayadashami)', date: '2026-10-20', day: 'Tuesday', type: 'Festive', daysLeft: 4 },
  { id: 'h7', name: 'Diwali (Deepavali)', date: '2026-11-08', day: 'Sunday', type: 'Festive', daysLeft: 23 },
  { id: 'h8', name: 'Christmas Day', date: '2026-12-25', day: 'Friday', type: 'Gazetted', daysLeft: 70 }
];

/**
 * Dynamic Dashboard Wallpapers (Rotates every 10 seconds)
 */
const DASHBOARD_WALLPAPERS = [
  {
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80',
    title: 'Alpine Emerald Dawn',
    location: 'Emerald Ridge'
  },
  {
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=80',
    title: 'Modern Architecture & Glass',
    location: 'Silicon Valley Innovation Hub'
  },
  {
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80',
    title: 'High Sierra Misty Mountains',
    location: 'Alpine Horizon'
  },
  {
    url: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1400&q=80',
    title: 'Nordic Aurora Borealis',
    location: 'Polar Skies'
  },
  {
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80',
    title: 'Golden Sunset & Pacific Coast',
    location: 'Malibu Shore'
  },
  {
    url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1400&q=80',
    title: 'Metropolitan Twilight Horizon',
    location: 'Tech City Skyline'
  }
];

const formatSelectedDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = String(dateStr).split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    return new Date(y, m, d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }
  return dateStr;
};

export const EmployeeWorkspace = ({ currentUser }) => {
  // Navigation active tab: 'dashboard', 'projects', 'notebooks', 'daily_status', 'attendance', 'holidays', 'leave', 'reminders', 'bug_tracker', 'settings'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Real-time clock state
  const [currentTime, setCurrentTime] = useState(new Date());

  // Attendance state
  const [attendanceLogs, setAttendanceLogs] = useState(getStoredAttendance());
  const [punchFeedback, setPunchFeedback] = useState({ type: '', message: '' });

  // Reactive User Profile & Rights Matrix Synchronization
  const [userProfile, setUserProfile] = useState(currentUser);

  useEffect(() => {
    setUserProfile(currentUser);
  }, [currentUser]);

  useEffect(() => {
    const handleSyncProfile = () => {
      const users = getStoredUsers();
      const cleanId = (currentUser?.id || currentUser?.userId || '').toUpperCase();
      const match = users.find(u => 
        (u.id || '').toUpperCase() === cleanId || 
        (u.userId || '').toUpperCase() === cleanId || 
        (u.email || '').toUpperCase() === cleanId
      );
      if (match) {
        setUserProfile(prev => ({
          ...prev,
          ...match,
          permissions: {
            ...(prev?.permissions || {}),
            ...(match.permissions || {})
          }
        }));
      }
    };
    handleSyncProfile();
    window.addEventListener('sh_users_updated', handleSyncProfile);
    window.addEventListener('sh_team_updated', handleSyncProfile);
    return () => {
      window.removeEventListener('sh_users_updated', handleSyncProfile);
      window.removeEventListener('sh_team_updated', handleSyncProfile);
    };
  }, [currentUser]);

  const effectivePermissions = useMemo(() => {
    const roleKey = (userProfile?.type || currentUser?.type || 'employee').toLowerCase();
    const defaults = DEFAULT_PERMISSIONS[roleKey] || DEFAULT_PERMISSIONS.employee;
    return {
      ...defaults,
      ...(currentUser?.permissions || {}),
      ...(userProfile?.permissions || {})
    };
  }, [userProfile, currentUser]);

  const hasAnyMatrixRight = useMemo(() => {
    return !!(
      effectivePermissions.quotation_maker ||
      effectivePermissions.manage_attendance ||
      effectivePermissions.manage_leaves ||
      effectivePermissions.view_work_status ||
      effectivePermissions.manage_access_matrix ||
      effectivePermissions.manage_leads ||
      effectivePermissions.manage_tasks ||
      effectivePermissions.manage_workshops ||
      effectivePermissions.view_overview
    );
  }, [effectivePermissions]);

  // Target Work Hours strictly retrieved from user profile (default 5 for Intern, 8 for Employee)
  const targetWorkHours = parseFloat(userProfile?.workHours) || parseFloat(currentUser?.workHours) || ((currentUser?.type || '').toLowerCase() === 'intern' ? 5 : 8);

  // Punch In Animated 3D Modal State
  const [showPunchInModal, setShowPunchInModal] = useState(false);
  const [lastPunchInTimestamp, setLastPunchInTimestamp] = useState(null);

  // Punch Out Work Status Modal State
  const [showPostPunchOutModal, setShowPostPunchOutModal] = useState(false);
  const [showPunchOutReverseModal, setShowPunchOutReverseModal] = useState(false);
  const [punchOutRedirectSec, setPunchOutRedirectSec] = useState(3);
  const [lastPunchOutDetails, setLastPunchOutDetails] = useState(null);
  const [postPunchOutForm, setPostPunchOutForm] = useState({
    tasksDone: '',
    tomorrowGoals: '',
    deliverablesUrl: '',
    blockers: ''
  });

  // Automatic redirect timer when Punch Out reverse modal is visible
  useEffect(() => {
    let timer = null;
    if (showPunchOutReverseModal) {
      setPunchOutRedirectSec(3);
      timer = setInterval(() => {
        setPunchOutRedirectSec((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setShowPunchOutReverseModal(false);
            setActiveTab('daily_status');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showPunchOutReverseModal]);

  const handleDirectRedirectToDailyStatus = () => {
    setShowPunchOutReverseModal(false);
    setActiveTab('daily_status');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calendar state (current year and month)
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [selectedDayInfo, setSelectedDayInfo] = useState(null);
  const [showPastHolidays, setShowPastHolidays] = useState(false);

  // Search input in header
  const [searchQuery, setSearchQuery] = useState('');

  // Eye rest timer state (20-20-20 rule)
  const [eyeRestSeconds, setEyeRestSeconds] = useState(1200); // 20 mins = 1200s
  const [isEyeRestActive, setIsEyeRestActive] = useState(true);

  // Dynamic Rotating Wallpaper State (rotates every 10 seconds)
  const [heroWallpaperIndex, setHeroWallpaperIndex] = useState(0);

  // Leave Form & Official Certificate Modal State
  const [showLeaveCertModal, setShowLeaveCertModal] = useState(false);
  const [selectedLeaveForCert, setSelectedLeaveForCert] = useState(null);
  const [myLeaves, setMyLeaves] = useState(() => {
    return getStoredLeaves().filter(l => l.userId === currentUser?.id || l.userId === currentUser?.userId);
  });
  const [leaveForm, setLeaveForm] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    purpose: ''
  });
  const [leaveSuccessMsg, setLeaveSuccessMsg] = useState('');

  // Daily Work Status State (only for currentUser)
  const [myStatuses, setMyStatuses] = useState(() => {
    return getStoredDailyStatus().filter(s => s.userId === currentUser?.id || s.userId === currentUser?.userId);
  });
  const [statusSuccessMsg, setStatusSuccessMsg] = useState('');

  // Reminders State
  const [myReminders, setMyReminders] = useState(() => {
    const saved = localStorage.getItem('sh_user_reminders');
    return saved ? JSON.parse(saved) : [
      { id: 'rem-1', text: 'Daily standup & sprint review with technical lead', time: '11:00 AM', done: true, priority: 'Normal' },
      { id: 'rem-2', text: 'Complete morning code review & merge pull request #14', time: '02:30 PM', done: false, priority: 'High' },
      { id: 'rem-3', text: 'Hydration break & 20-20-20 vision rest', time: '04:00 PM', done: false, priority: 'Normal' }
    ];
  });
  const [newReminderText, setNewReminderText] = useState('');

  // Bug Tracker State
  const [myBugs, setMyBugs] = useState(() => {
    const saved = localStorage.getItem('sh_user_bugs');
    return saved ? JSON.parse(saved) : [
      { id: 'BUG-101', title: 'OAuth token refresh retry limit on idle tab', severity: 'Critical', module: 'Auth Service', status: 'In Progress', reportedBy: 'M. Harshavardhan' },
      { id: 'BUG-102', title: 'Dark mode contrast on attendance calendar badge', severity: 'Major', module: 'Enterprise UI', status: 'Open', reportedBy: 'T. Sai Krishna' },
      { id: 'BUG-103', title: 'Export CSV attendance timezone offset for UTC+05:30', severity: 'Minor', module: 'Reports', status: 'Resolved', reportedBy: 'DevOps' }
    ];
  });
  const [bugForm, setBugForm] = useState({
    title: '',
    severity: 'Major',
    module: 'Enterprise Portal',
    description: ''
  });

  // Notebooks State
  const [myNotebooks, setMyNotebooks] = useState(() => {
    const saved = localStorage.getItem('sh_user_notebooks');
    return saved ? JSON.parse(saved) : [
      { id: 'nb-1', title: 'Engineering Guidelines & Coding Conventions', updated: 'Today, 2:15 PM', tags: ['Backend', 'Standard', 'Architecture'], content: 'All microservices must enforce JWT token authorization. Ensure zero-trust validation on every HTTP route. Database queries must use parameterized indices.' },
      { id: 'nb-2', title: 'Sprint Directives & AI Automation Pipeline', updated: 'Yesterday', tags: ['AI', 'Deployment', 'Vite'], content: 'Next-generation AI risk detection models run client-side with WebAssembly acceleration. Three.js models should be optimized under 1MB.' },
      { id: 'nb-3', title: 'Personal Work Scratchpad & Architecture Notes', updated: '3 days ago', tags: ['Personal', 'Scratchpad'], content: 'Features to build: Dynamic countdown timer, 60% blur modal backdrop, and unified White + Blue + Red + Yellow color schema.' }
    ];
  });
  const [activeNotebook, setActiveNotebook] = useState(myNotebooks[0]);

  // Projects State
  const [myProjects] = useState([
    { id: 'PRJ-01', title: 'Sakith Harvan AI Digital Risk Engine', progress: 85, dueDate: '2026-10-30', priority: 'High', status: 'In Progress', client: 'Enterprise Core', tasksCount: 12 },
    { id: 'PRJ-02', title: 'Unified Enterprise Work Portal v2.0', progress: 92, dueDate: '2026-10-22', priority: 'Critical', status: 'Testing & QA', client: 'Internal Ops', tasksCount: 8 },
    { id: 'PRJ-03', title: 'Supabase Realtime Attendance & Leaves Matrix', progress: 100, dueDate: '2026-10-14', priority: 'Normal', status: 'Completed', client: 'HR & Management', tasksCount: 15 }
  ]);

  // Weather state
  const [weatherData] = useState({
    city: 'Hyderabad / Bangalore',
    temp: '28°C',
    condition: 'Pleasant & Sunny',
    humidity: '34%'
  });

  // Tech News slider index
  const [newsIndex, setNewsIndex] = useState(0);
  const TECH_NEWS = [
    'Sakith Harvan deploys next-gen AI enterprise automation suite with real-time risk intelligence.',
    'Vite 5.4 & Three.js WebGL pipeline delivers sub-millisecond client renders.',
    'Unified White, Blue, Red and Yellow design system implemented across enterprise workspaces.',
    'Automated daily standup sync delivers instant reporting to executive stakeholders.'
  ];

  // Settings: Password Management State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordFeedback, setPasswordFeedback] = useState({ type: '', message: '' });

  // Live timer tick & eye rest countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setEyeRestSeconds((prev) => (prev > 0 ? prev - 1 : 1200));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // News ticker interval
  useEffect(() => {
    const newsTimer = setInterval(() => {
      setNewsIndex((prev) => (prev + 1) % TECH_NEWS.length);
    }, 6000);
    return () => clearInterval(newsTimer);
  }, []);

  // Dashboard grid hero wallpaper rotation interval (Rotates every 10 seconds)
  useEffect(() => {
    const wpTimer = setInterval(() => {
      setHeroWallpaperIndex((prev) => (prev + 1) % DASHBOARD_WALLPAPERS.length);
    }, 10000);
    return () => clearInterval(wpTimer);
  }, []);

  // Listen for storage updates
  useEffect(() => {
    const uid = currentUser?.id || currentUser?.userId;
    const handleAttUpdate = () => setAttendanceLogs(getStoredAttendance());
    const handleLeaveUpdate = () => setMyLeaves(getStoredLeaves().filter(l => l.userId === uid || l.userId === currentUser?.id));
    const handleStatusUpdate = () => setMyStatuses(getStoredDailyStatus().filter(s => s.userId === uid || s.userId === currentUser?.id));
    const handleHelpUpdate = () => setAttendanceLogs(getStoredAttendance());

    window.addEventListener('sh_attendance_updated', handleAttUpdate);
    window.addEventListener('sh_leaves_updated', handleLeaveUpdate);
    window.addEventListener('sh_daily_status_updated', handleStatusUpdate);
    window.addEventListener('sh_help_updated', handleHelpUpdate);

    return () => {
      window.removeEventListener('sh_attendance_updated', handleAttUpdate);
      window.removeEventListener('sh_leaves_updated', handleLeaveUpdate);
      window.removeEventListener('sh_daily_status_updated', handleStatusUpdate);
      window.removeEventListener('sh_help_updated', handleHelpUpdate);
    };
  }, [currentUser?.id, currentUser?.userId]);

  const todayStr = getLocalDateString(new Date());
  const uid = currentUser?.id || currentUser?.userId || 'USER';
  const todayRecord = attendanceLogs.find(r => (r.userId === uid || r.userId === currentUser?.id) && r.date === todayStr);

  const hasPunchedInToday = Boolean(todayRecord && todayRecord.punchInTime);
  const hasPunchedOutToday = Boolean(todayRecord && todayRecord.punchOutTime);

  // Compute live elapsed session timer
  const computeElapsedTime = () => {
    if (!todayRecord || !todayRecord.punchInTimestamp || todayRecord.punchOutTimestamp) {
      return { hours: 0, minutes: 0, seconds: 0, formatted: '00:00:00', shortFormatted: '0h 00m', totalSeconds: 0 };
    }
    const diffMs = Math.max(0, currentTime.getTime() - todayRecord.punchInTimestamp);
    const totalSec = Math.floor(diffMs / 1000);
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return {
      hours: hrs,
      minutes: mins,
      seconds: secs,
      formatted: `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`,
      shortFormatted: `${hrs}h ${String(mins).padStart(2, '0')}m`,
      totalSeconds: totalSec,
      totalHoursDecimal: parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2))
    };
  };

  const liveElapsed = computeElapsedTime();

  // Punch In Handler
  const handlePunchIn = () => {
    const res = recordPunchIn(currentUser);
    if (!res.success) {
      setPunchFeedback({ type: 'error', message: res.message });
    } else {
      setLastPunchInTimestamp(res.record.punchInTimestamp);
      setPunchFeedback({ 
        type: 'success', 
        message: `Punched in successfully at ${res.record.punchInTime}! Target work time: ${targetWorkHours} hrs.` 
      });
      setShowPunchInModal(true);
    }
    setTimeout(() => setPunchFeedback({ type: '', message: '' }), 6000);
  };

  // Punch Out Handler: Logo moves back in reverse and automatically redirects to update day's work status
  const handlePunchOut = () => {
    const res = recordPunchOut(currentUser);
    if (!res.success) {
      setPunchFeedback({ type: 'error', message: res.message });
    } else {
      setLastPunchOutDetails(res);
      setPunchFeedback({ 
        type: 'success', 
        message: `Punched out at ${res.record.punchOutTime}. Duration: ${res.hoursWorked} hrs. Shift status: ${res.colorStatus.toUpperCase()}.` 
      });
      setShowPunchOutReverseModal(true);
      setPostPunchOutForm(prev => ({
        ...prev,
        hoursWorked: res.hoursWorked
      }));
    }
    setTimeout(() => setPunchFeedback({ type: '', message: '' }), 8000);
  };

  // ---------------------------------------------------------------------------
  // TEAM PULSE: DYNAMIC REAL-TIME STATUS FOR CURRENT USER'S ASSIGNED TEAM
  // ---------------------------------------------------------------------------
  const teamPulseData = useMemo(() => {
    const allUsers = getStoredUsers();
    let storedTeam = [];
    try {
      const raw = localStorage.getItem('sh_team_members');
      if (raw) storedTeam = JSON.parse(raw);
    } catch (e) {}

    // Combine and deduplicate by uppercase ID
    const memberMap = new Map();
    [...allUsers, ...storedTeam].forEach(m => {
      const idKey = (m.id || m.userId || m.internId || m.empId || '').toUpperCase();
      if (idKey && !memberMap.has(idKey)) {
        memberMap.set(idKey, m);
      }
    });

    const allMembers = Array.from(memberMap.values());

    // Determine currentUser's team / batch
    const userBatch = (currentUser?.batch || currentUser?.team || currentUser?.department || currentUser?.domain || '').trim();
    const userType = (currentUser?.type || 'Intern').trim();

    // Filter members belonging to the same team/batch
    let teamMembers = [];
    if (userBatch) {
      teamMembers = allMembers.filter(m => {
        const mBatch = (m.batch || m.team || m.department || m.domain || '').trim();
        return mBatch && mBatch.toLowerCase() === userBatch.toLowerCase();
      });
    }

    // If no specific batch match or only 1 person: group by peer type (all Interns or all Employees)
    if (teamMembers.length <= 1) {
      teamMembers = allMembers.filter(m => (m.type || '').toLowerCase() === userType.toLowerCase());
    }

    // Ensure currentUser is included in the team list
    const currentUid = (currentUser?.id || currentUser?.userId || '').toUpperCase();
    if (!teamMembers.some(m => (m.id || m.userId || '').toUpperCase() === currentUid)) {
      teamMembers.push(currentUser);
    }

    // Calculate real-time attendance status for today
    const leaves = getStoredLeaves();
    let inCount = 0;
    let onLeaveCount = 0;
    let notInCount = 0;

    const categorizedMembers = teamMembers.map(m => {
      const mId = (m.id || m.userId || m.internId || m.empId || '').toUpperCase();
      
      // Check if punched in today
      const attRecord = attendanceLogs.find(r => 
        (r.userId || '').toUpperCase() === mId && r.date === todayStr
      );
      const isPunchedIn = Boolean(attRecord && attRecord.punchInTime);

      // Check if on approved leave today
      const isOnLeave = leaves.some(l => 
        (l.userId || '').toUpperCase() === mId && 
        l.status === 'Approved' && 
        todayStr >= l.startDate && 
        todayStr <= l.endDate
      );

      let status = 'not_in';
      if (isPunchedIn) {
        status = 'in';
        inCount++;
      } else if (isOnLeave) {
        status = 'on_leave';
        onLeaveCount++;
      } else {
        status = 'not_in';
        notInCount++;
      }

      return {
        ...m,
        todayStatus: status,
        punchInTime: attRecord?.punchInTime || null,
        punchOutTime: attRecord?.punchOutTime || null
      };
    });

    const total = teamMembers.length;
    const inPct = total > 0 ? Math.round((inCount / total) * 100) : 0;
    const leavePct = total > 0 ? Math.round((onLeaveCount / total) * 100) : 0;
    const notInPct = total > 0 ? Math.max(0, 100 - inPct - leavePct) : 0;

    return {
      teamName: userBatch || `${userType} Team`,
      total,
      inCount,
      onLeaveCount,
      notInCount,
      inPct,
      leavePct,
      notInPct,
      members: categorizedMembers,
      notInMembers: categorizedMembers.filter(m => m.todayStatus === 'not_in'),
      onLeaveMembers: categorizedMembers.filter(m => m.todayStatus === 'on_leave'),
      inMembers: categorizedMembers.filter(m => m.todayStatus === 'in')
    };
  }, [currentUser, attendanceLogs, todayStr]);

  // Submit Post Punch-Out Daily Work Status
  const handleSavePostPunchOutStatus = (e) => {
    e.preventDefault();
    if (!postPunchOutForm.tasksDone || !postPunchOutForm.tomorrowGoals) {
      alert('Please fill in both what you completed today and what are your tomorrow goals.');
      return;
    }

    const newStatus = {
      id: `DWS-${Date.now()}`,
      userId: uid,
      userName: currentUser?.name || 'Staff',
      userRole: currentUser?.type || 'Employee',
      date: todayStr,
      tasksDone: postPunchOutForm.tasksDone,
      tomorrowGoals: postPunchOutForm.tomorrowGoals,
      deliverablesUrl: postPunchOutForm.deliverablesUrl,
      blockers: postPunchOutForm.blockers,
      hoursWorked: lastPunchOutDetails?.hoursWorked || todayRecord?.totalHours || targetWorkHours,
      timestamp: new Date().toLocaleTimeString()
    };

    const existingStatuses = getStoredDailyStatus();
    const allStatuses = [newStatus, ...existingStatuses.filter(s => !(s.userId === uid && s.date === todayStr))];
    saveDailyWorkStatus(allStatuses);
    setShowPostPunchOutModal(false);
    setPostPunchOutForm({
      tasksDone: '',
      tomorrowGoals: '',
      deliverablesUrl: '',
      blockers: ''
    });
    setPunchFeedback({
      type: 'success',
      message: 'Day\'s work status submitted and synchronized successfully!'
    });
    setTimeout(() => setPunchFeedback({ type: '', message: '' }), 5000);
  };

  // Apply Leave Handler
  const handleApplyLeave = (e) => {
    e.preventDefault();
    if (!leaveForm.purpose) {
      alert('Please state the purpose of your leave request.');
      return;
    }
    const newLeave = {
      id: `LV-${Date.now().toString().slice(-4)}`,
      userId: uid,
      userName: currentUser?.name || 'Staff',
      userRole: currentUser?.type || 'Employee',
      appliedDate: todayStr,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      purpose: leaveForm.purpose,
      status: 'Pending',
      adminNotes: ''
    };

    const allLeaves = [newLeave, ...getStoredLeaves()];
    saveLeaveApplications(allLeaves);
    setLeaveSuccessMsg('Leave application successfully submitted for administrative review!');
    setLeaveForm({
      startDate: todayStr,
      endDate: todayStr,
      purpose: ''
    });
    setTimeout(() => setLeaveSuccessMsg(''), 5000);
  };

  // Add Reminder Handler
  const handleAddReminder = (e) => {
    e.preventDefault();
    if (!newReminderText.trim()) return;
    const newRem = {
      id: `rem-${Date.now()}`,
      text: newReminderText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      done: false,
      priority: 'Normal'
    };
    const updated = [newRem, ...myReminders];
    setMyReminders(updated);
    localStorage.setItem('sh_user_reminders', JSON.stringify(updated));
    setNewReminderText('');
  };

  const handleToggleReminder = (id) => {
    const updated = myReminders.map(r => r.id === id ? { ...r, done: !r.done } : r);
    setMyReminders(updated);
    localStorage.setItem('sh_user_reminders', JSON.stringify(updated));
  };

  // Submit Bug Handler
  const handleReportBug = (e) => {
    e.preventDefault();
    if (!bugForm.title) return;
    const newBug = {
      id: `BUG-${Date.now().toString().slice(-4)}`,
      title: bugForm.title,
      severity: bugForm.severity,
      module: bugForm.module,
      description: bugForm.description,
      status: 'Open',
      reportedBy: currentUser?.name || 'Staff'
    };
    const updated = [newBug, ...myBugs];
    setMyBugs(updated);
    localStorage.setItem('sh_user_bugs', JSON.stringify(updated));
    setBugForm({ title: '', severity: 'Major', module: 'Enterprise Portal', description: '' });
  };

  // Password Management Handler: Change Password
  const handleChangePassword = (e) => {
    e.preventDefault();
    setPasswordFeedback({ type: '', message: '' });

    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      setPasswordFeedback({ type: 'error', message: 'New password must be at least 6 characters.' });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordFeedback({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }

    // Verify current password against stored user or default Shtsa@2026
    const users = getStoredUsers();
    const matchedUserIndex = users.findIndex(u => (u.id || '').toUpperCase() === uid.toUpperCase() || (u.userId || '').toUpperCase() === uid.toUpperCase());
    
    const existingPassword = matchedUserIndex >= 0 ? (users[matchedUserIndex].password || 'Shtsa@2026') : (currentUser?.password || 'Shtsa@2026');

    if (passwordForm.currentPassword !== existingPassword && passwordForm.currentPassword !== 'Shtsa@2026') {
      setPasswordFeedback({ type: 'error', message: 'Current password is incorrect. Default is "Shtsa@2026".' });
      return;
    }

    // Update in users directory
    if (matchedUserIndex >= 0) {
      users[matchedUserIndex].password = passwordForm.newPassword;
      saveUsersDirectory(users);
    }

    // Update in team members
    const storedMembers = JSON.parse(localStorage.getItem('sh_team_members') || '[]');
    const updatedMembers = storedMembers.map(m => {
      if ((m.id || '').toUpperCase() === uid.toUpperCase() || (m.userId || '').toUpperCase() === uid.toUpperCase()) {
        return { ...m, password: passwordForm.newPassword };
      }
      return m;
    });
    localStorage.setItem('sh_team_members', JSON.stringify(updatedMembers));

    window.dispatchEvent(new Event('sh_users_updated'));
    window.dispatchEvent(new Event('sh_team_updated'));

    setPasswordFeedback({
      type: 'success',
      message: 'Password changed successfully! Please use your new password for future logins.'
    });
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  // Get Calendar days with green/yellow/red color flags
  const { calendarDays, summaryStats } = getEmployeeCalendarDays(uid, calendarYear, calendarMonth, targetWorkHours);

  // User display name
  const rawName = currentUser?.name || 'Harshavardhan';
  const firstName = rawName.split(' ')[0] + '.';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col antialiased">
      {/* ===================================================================== */}
      {/* 3D LOGO PUNCH IN OVERLAY (Direct Floating Emblem, 60% Blur, No Card)  */}
      {/* ===================================================================== */}
      {showPunchInModal && (
        <div 
          onClick={() => setShowPunchInModal(false)}
          className="fixed inset-0 z-[150] flex flex-col items-center justify-center p-4 cursor-pointer select-none animate-in fade-in duration-300 overflow-hidden"
          style={{
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(15, 23, 42, 0.38)', // 60% blur of the actual previous page
          }}
        >
          {/* Top Right Floating Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowPunchInModal(false);
            }}
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all cursor-pointer z-30 shadow-lg"
            title="Close and return to workspace"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Central floating content - No Card, No Box, Just the Single Logo PNG & Text */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative flex flex-col items-center justify-center text-center space-y-4 max-w-xl w-full pointer-events-auto cursor-default"
          >
            {/* Single Transparent 3D Emblem Logo PNG coming up / scaling up */}
            <ThreeDPunchInEmblem 
              targetHours={targetWorkHours} 
              punchInTimestamp={lastPunchInTimestamp || todayRecord?.punchInTimestamp || Date.now()}
            />

            {/* Floating modern typography (direct on blur, no card) */}
            <div className="space-y-1.5 pt-1">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold tracking-wider backdrop-blur-md shadow-lg shadow-cyan-500/10">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Official Punch-In Recorded • Shift Active</span>
              </div>

              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight lowercase font-sans drop-shadow-[0_4px_16px_rgba(0,0,0,0.7)]">
                start your work
              </h2>

              <p className="text-slate-200 text-xs sm:text-sm font-medium drop-shadow-md">
                Welcome <strong className="text-cyan-300">{currentUser?.name}</strong> ({currentUser?.type || 'Staff'}) • Target: <span className="font-mono font-bold text-white">{targetWorkHours} hrs</span>
              </p>
            </div>

            {/* Subtle action button & dismiss prompt */}
            <div className="pt-2 flex flex-col items-center gap-2">
              <button
                onClick={() => setShowPunchInModal(false)}
                className="px-7 py-3 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer border border-cyan-300/40 glow-blue"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Continue to Workspace</span>
              </button>
              <span className="text-[11px] text-slate-300/80 font-medium">
                (click anywhere on the blurred background to return)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3D LOGO PUNCH OUT OVERLAY (Reverse Animation + Actual Time + Redirect)*/}
      {/* ===================================================================== */}
      {showPunchOutReverseModal && (
        <div 
          onClick={handleDirectRedirectToDailyStatus}
          className="fixed inset-0 z-[150] flex flex-col items-center justify-center p-4 cursor-pointer select-none animate-in fade-in duration-300 overflow-hidden"
          style={{
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
          }}
        >
          {/* Top Right Floating Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDirectRedirectToDailyStatus();
            }}
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all cursor-pointer z-30 shadow-lg"
            title="Go to Daily Status"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Central floating content */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative flex flex-col items-center justify-center text-center space-y-4 max-w-xl w-full pointer-events-auto cursor-default"
          >
            {/* Single Transparent 3D Emblem with mode="out" for reverse animation */}
            <ThreeDPunchInEmblem 
              mode="out"
              targetHours={targetWorkHours}
              punchInTimestamp={lastPunchOutDetails?.record?.punchInTimestamp || todayRecord?.punchInTimestamp}
              punchOutTimestamp={lastPunchOutDetails?.record?.punchOutTimestamp || todayRecord?.punchOutTimestamp || Date.now()}
              actualWorkedSeconds={Math.round((lastPunchOutDetails?.hoursWorked || todayRecord?.totalHours || liveElapsed.totalHoursDecimal || 0) * 3600)}
            />

            {/* Floating modern typography */}
            <div className="space-y-1.5 pt-1">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-amber-400/50 text-amber-300 text-xs font-mono font-bold tracking-wider backdrop-blur-md shadow-lg shadow-amber-500/10">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Shift Concluded • Punch-Out Recorded</span>
              </div>

              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight lowercase font-sans drop-shadow-[0_4px_16px_rgba(0,0,0,0.7)]">
                shift completed
              </h2>

              <p className="text-slate-200 text-xs sm:text-sm font-medium drop-shadow-md">
                Great job <strong className="text-amber-300">{currentUser?.name}</strong>! Total actual time worked:{' '}
                <span className="font-mono font-bold text-white text-base">
                  {lastPunchOutDetails?.hoursWorked ? `${lastPunchOutDetails.hoursWorked} hrs` : liveElapsed.shortFormatted}
                </span>
              </p>

              <div className="text-[11px] text-slate-300 font-mono">
                Punched in: <span className="text-white font-bold">{lastPunchOutDetails?.record?.punchInTime || todayRecord?.punchInTime || '—'}</span> • Punched out: <span className="text-white font-bold">{lastPunchOutDetails?.record?.punchOutTime || todayRecord?.punchOutTime || '—'}</span>
              </div>
            </div>

            {/* Direct button & automatic redirect countdown */}
            <div className="pt-2 flex flex-col items-center gap-2.5">
              <button
                onClick={handleDirectRedirectToDailyStatus}
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer border border-teal-300/40 glow-blue"
              >
                <span>Update Daily Work Status</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <span className="text-[11px] text-amber-200/90 font-mono font-semibold">
                Redirecting to Daily Work Status page in {punchOutRedirectSec}s...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* PUNCH OUT WORK STATUS MODAL ("UPDATE YOUR DAY'S WORK STATUS")          */}
      {/* ===================================================================== */}
      {showPostPunchOutModal && (
        <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-5 text-left shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-mono font-bold mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Shift Completed</span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  Update Your Day's Work Status
                </h3>
                <p className="text-xs text-slate-600">
                  Please submit your daily standup achievements and tomorrow's goals.
                </p>
              </div>

              <button 
                onClick={() => setShowPostPunchOutModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Shift Summary Banner */}
            <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
              lastPunchOutDetails?.colorStatus === 'green'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <div>
                <div className="font-bold text-sm text-slate-900">
                  Worked {lastPunchOutDetails?.hoursWorked || todayRecord?.totalHours || 0} Hours of {targetWorkHours} Hours Target
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Shift Result: <strong className="uppercase font-mono">{lastPunchOutDetails?.colorStatus === 'green' ? 'Green (Target Completed)' : 'Yellow (Partial Shift)'}</strong>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold uppercase ${
                lastPunchOutDetails?.colorStatus === 'green'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-500 text-white'
              }`}>
                {lastPunchOutDetails?.colorStatus === 'green' ? '★ Green' : '● Yellow'}
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSavePostPunchOutStatus} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  1. What have you completed today? *
                </label>
                <textarea
                  required
                  rows={3}
                  value={postPunchOutForm.tasksDone}
                  onChange={(e) => setPostPunchOutForm({ ...postPunchOutForm, tasksDone: e.target.value })}
                  placeholder="Detail modules engineered, tickets solved, features deployed, research or UI designs built today..."
                  className="form-input text-xs text-slate-900 bg-white border border-slate-300 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  2. What are the tomorrow goals? *
                </label>
                <textarea
                  required
                  rows={2}
                  value={postPunchOutForm.tomorrowGoals}
                  onChange={(e) => setPostPunchOutForm({ ...postPunchOutForm, tomorrowGoals: e.target.value })}
                  placeholder="State your primary deliverables, milestone targets, or sprint focus for tomorrow..."
                  className="form-input text-xs text-slate-900 bg-white border border-slate-300 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Deliverable URL / Pull Request (Optional)
                </label>
                <input
                  type="url"
                  value={postPunchOutForm.deliverablesUrl}
                  onChange={(e) => setPostPunchOutForm({ ...postPunchOutForm, deliverablesUrl: e.target.value })}
                  placeholder="https://github.com/sakith-harvan/... or Figma link"
                  className="form-input text-xs font-mono text-slate-900 bg-white border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Blockers or Hurdles (Optional)
                </label>
                <input
                  type="text"
                  value={postPunchOutForm.blockers}
                  onChange={(e) => setPostPunchOutForm({ ...postPunchOutForm, blockers: e.target.value })}
                  placeholder="Any dependencies or access requirements needed from management..."
                  className="form-input text-xs text-slate-900 bg-white border border-slate-300"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPostPunchOutModal(false)}
                  className="btn-secondary py-2 px-4 text-xs font-semibold"
                >
                  Skip for Now
                </button>
                <button
                  type="submit"
                  className="btn-primary py-2 px-5 text-xs font-bold glow-blue"
                >
                  Submit Daily Work Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MAIN TWO-COLUMN APPLICATION WORKSPACE: SIDEBAR + DASHBOARD            */}
      {/* ===================================================================== */}
      <div className="flex-1 flex flex-col lg:flex-row w-full min-h-screen">
        
        {/* =================================================================== */}
        {/* 1. LEFT SIDEBAR NAVIGATION (Exact modules from Image 1 in White UI) */}
        {/* =================================================================== */}
        <aside className="w-full lg:w-64 bg-white border-r border-slate-200/90 shrink-0 flex flex-col justify-between shadow-xs z-20">
          <div className="p-4 space-y-4">
            
            {/* Sidebar Brand Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/30">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-extrabold text-sm text-slate-900 tracking-tight block">
                    Sakith Harvan
                  </span>
                  <span className="text-[10px] font-mono text-blue-600 font-bold block uppercase tracking-wider">
                    Enterprise Portal
                  </span>
                </div>
              </div>
            </div>

            {/* Sidebar Navigation Menu Items */}
            <nav className="space-y-1 text-xs">
              
              {/* ⊞ Dashboard */}
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutGrid className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-white' : 'text-blue-600'}`} />
                  <span>Dashboard</span>
                </div>
              </button>

              {/* 🗂 Projects */}
              <button
                onClick={() => setActiveTab('projects')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
                  activeTab === 'projects'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 font-bold'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FolderKanban className={`w-4 h-4 ${activeTab === 'projects' ? 'text-white' : 'text-blue-600'}`} />
                  <span>Projects</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              {/* 📖 Notebooks */}
              <button
                onClick={() => setActiveTab('notebooks')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
                  activeTab === 'notebooks'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 font-bold'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className={`w-4 h-4 ${activeTab === 'notebooks' ? 'text-white' : 'text-blue-600'}`} />
                  <span>Notebooks</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              {/* TOOLS SECTION HEADER */}
              <div className="pt-3 pb-1 px-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  TOOLS
                </span>
              </div>

              {/* 📈 Daily Status */}
              <button
                onClick={() => setActiveTab('daily_status')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
                  activeTab === 'daily_status'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 font-bold'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Activity className={`w-4 h-4 ${activeTab === 'daily_status' ? 'text-white' : 'text-blue-600'}`} />
                  <span>Daily Status</span>
                </div>
                {myStatuses.length > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${activeTab === 'daily_status' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700 font-bold'}`}>
                    {myStatuses.length}
                  </span>
                )}
              </button>

              {/* 📅 Attendance */}
              <button
                onClick={() => setActiveTab('attendance')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
                  activeTab === 'attendance'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 font-bold'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CalendarCheck className={`w-4 h-4 ${activeTab === 'attendance' ? 'text-white' : 'text-blue-600'}`} />
                  <span>Attendance</span>
                </div>
                {hasPunchedInToday && !hasPunchedOutToday && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </button>

              {/* 🎉 Holidays */}
              <button
                onClick={() => setActiveTab('holidays')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
                  activeTab === 'holidays'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 font-bold'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <PartyPopper className={`w-4 h-4 ${activeTab === 'holidays' ? 'text-white' : 'text-amber-500'}`} />
                  <span>Holidays</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono font-bold ${activeTab === 'holidays' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'}`}>
                  5d
                </span>
              </button>

              {/* ☂️ Leave */}
              <button
                onClick={() => setActiveTab('leave')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
                  activeTab === 'leave'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 font-bold'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Umbrella className={`w-4 h-4 ${activeTab === 'leave' ? 'text-white' : 'text-blue-600'}`} />
                  <span>Leave</span>
                </div>
                {myLeaves.length > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${activeTab === 'leave' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
                    {myLeaves.length}
                  </span>
                )}
              </button>

              {/* 🔔 Reminders */}
              <button
                onClick={() => setActiveTab('reminders')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
                  activeTab === 'reminders'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 font-bold'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Bell className={`w-4 h-4 ${activeTab === 'reminders' ? 'text-white' : 'text-amber-500'}`} />
                  <span>Reminders</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono font-bold ${activeTab === 'reminders' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'}`}>
                  {myReminders.filter(r => !r.done).length}
                </span>
              </button>

              {/* 🪲 Bug Tracker (Red Accent) */}
              <button
                onClick={() => setActiveTab('bug_tracker')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
                  activeTab === 'bug_tracker'
                    ? 'bg-red-600 text-white shadow-md shadow-red-500/25 font-bold'
                    : 'text-slate-700 hover:text-red-600 hover:bg-red-50/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Bug className={`w-4 h-4 ${activeTab === 'bug_tracker' ? 'text-white' : 'text-red-500'}`} />
                  <span>Bug Tracker</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono font-bold ${activeTab === 'bug_tracker' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-700'}`}>
                  {myBugs.filter(b => b.status !== 'Resolved').length}
                </span>
              </button>

              {/* AUTHORIZED MATRIX RIGHTS (ADMIN DELEGATED MODULES) */}
              {hasAnyMatrixRight && (
                <>
                  <div className="pt-4 pb-1 px-3 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                      <span>Matrix Rights</span>
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-700">
                      Delegated
                    </span>
                  </div>

                  {effectivePermissions.quotation_maker && (
                    <button
                      onClick={() => setActiveTab('matrix_quotation')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
                        activeTab === 'matrix_quotation'
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25 font-bold'
                          : 'text-slate-700 hover:text-purple-600 hover:bg-purple-50/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Calculator className={`w-4 h-4 ${activeTab === 'matrix_quotation' ? 'text-white' : 'text-purple-600'}`} />
                        <span>Quotation Engine</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </button>
                  )}

                  {effectivePermissions.manage_attendance && (
                    <button
                      onClick={() => setActiveTab('matrix_attendance')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
                        activeTab === 'matrix_attendance'
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25 font-bold'
                          : 'text-slate-700 hover:text-purple-600 hover:bg-purple-50/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Users className={`w-4 h-4 ${activeTab === 'matrix_attendance' ? 'text-white' : 'text-purple-600'}`} />
                        <span>Staff Attendance Admin</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </button>
                  )}

                  {effectivePermissions.manage_leaves && (
                    <button
                      onClick={() => setActiveTab('matrix_leaves')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
                        activeTab === 'matrix_leaves'
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25 font-bold'
                          : 'text-slate-700 hover:text-purple-600 hover:bg-purple-50/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckSquare className={`w-4 h-4 ${activeTab === 'matrix_leaves' ? 'text-white' : 'text-purple-600'}`} />
                        <span>Leave Approvals Admin</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </button>
                  )}

                  {effectivePermissions.view_work_status && (
                    <button
                      onClick={() => setActiveTab('matrix_work_status')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
                        activeTab === 'matrix_work_status'
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25 font-bold'
                          : 'text-slate-700 hover:text-purple-600 hover:bg-purple-50/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Activity className={`w-4 h-4 ${activeTab === 'matrix_work_status' ? 'text-white' : 'text-purple-600'}`} />
                        <span>Daily Updates &amp; Help Desk</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </button>
                  )}

                  {effectivePermissions.manage_leads && (
                    <button
                      onClick={() => setActiveTab('matrix_leads')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
                        activeTab === 'matrix_leads'
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25 font-bold'
                          : 'text-slate-700 hover:text-purple-600 hover:bg-purple-50/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className={`w-4 h-4 ${activeTab === 'matrix_leads' ? 'text-white' : 'text-purple-600'}`} />
                        <span>Client Leads &amp; CRM</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </button>
                  )}

                  {effectivePermissions.manage_tasks && (
                    <button
                      onClick={() => setActiveTab('matrix_tasks')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
                        activeTab === 'matrix_tasks'
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25 font-bold'
                          : 'text-slate-700 hover:text-purple-600 hover:bg-purple-50/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Target className={`w-4 h-4 ${activeTab === 'matrix_tasks' ? 'text-white' : 'text-purple-600'}`} />
                        <span>Team Tasks Delegation</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </button>
                  )}

                  {effectivePermissions.manage_workshops && (
                    <button
                      onClick={() => setActiveTab('matrix_workshops')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
                        activeTab === 'matrix_workshops'
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25 font-bold'
                          : 'text-slate-700 hover:text-purple-600 hover:bg-purple-50/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <GraduationCap className={`w-4 h-4 ${activeTab === 'matrix_workshops' ? 'text-white' : 'text-purple-600'}`} />
                        <span>Workshops &amp; Bootcamps</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </button>
                  )}

                  {effectivePermissions.manage_access_matrix && (
                    <button
                      onClick={() => setActiveTab('matrix_access')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
                        activeTab === 'matrix_access'
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25 font-bold'
                          : 'text-slate-700 hover:text-purple-600 hover:bg-purple-50/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <KeyRound className={`w-4 h-4 ${activeTab === 'matrix_access' ? 'text-white' : 'text-purple-600'}`} />
                        <span>Access Matrix Admin</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </button>
                  )}

                  {effectivePermissions.view_overview && (
                    <button
                      onClick={() => setActiveTab('matrix_overview')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
                        activeTab === 'matrix_overview'
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25 font-bold'
                          : 'text-slate-700 hover:text-purple-600 hover:bg-purple-50/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Flame className={`w-4 h-4 ${activeTab === 'matrix_overview' ? 'text-white' : 'text-purple-600'}`} />
                        <span>Executive Metrics</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </button>
                  )}
                </>
              )}
            </nav>
          </div>

          {/* User Profile Card at Sidebar Bottom */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/60">
            <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-xs">
                  {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
                </div>
                <div className="overflow-hidden">
                  <span className="font-bold text-xs text-slate-900 block truncate">
                    {currentUser?.name || 'Staff Member'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 block truncate">
                    {uid} • {currentUser?.type || 'Staff'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('settings')}
                title="Settings & Password"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* =================================================================== */}
        {/* 2. RIGHT CONTENT AREA (Exact Dashboard from Image 2 in White UI)    */}
        {/* =================================================================== */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-50">
          
          {/* Punch feedback notification banner */}
          {punchFeedback.message && (
            <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-3 animate-in fade-in ${
              punchFeedback.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
              {punchFeedback.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span>{punchFeedback.message}</span>
            </div>
          )}

          {/* ================================================================= */}
          {/* MODULE 1: THE COMPLETE DASHBOARD (from Image 2)                   */}
          {/* ================================================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Top Header Bar: Title, Streak Pill, Eye Rest Pill, Search, Status */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
                    Dashboard
                  </h1>

                  {/* 8 days streak pill (Yellow Accent) */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-xs font-mono font-bold shadow-xs">
                    <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>8 days streak</span>
                  </span>

                  {/* 20-20-20 Eye Rest pill (Blue Accent) */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-bold shadow-xs">
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    <span>20-20-20 Eye Rest: {Math.floor(eyeRestSeconds / 60)}m</span>
                  </span>
                </div>

                {/* Right actions: Search, Bell, Connected Badge */}
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  {/* Search Bar */}
                  <div className="relative flex-1 sm:w-56">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search Ctrl+K"
                      className="w-full bg-white border border-slate-200 pl-8 pr-3 py-1.5 rounded-full text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-xs"
                    />
                  </div>

                  {/* Notification Bell */}
                  <button 
                    onClick={() => setActiveTab('reminders')}
                    className="p-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 shadow-xs relative transition-colors"
                  >
                    <Bell className="w-4 h-4" />
                    <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-1 right-1" />
                  </button>

                  {/* Connected Indicator */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold font-mono">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                    <span>Connected</span>
                  </span>
                </div>
              </div>

              {/* 4-Metric Strip Card (White background, Yellow + Blue + Red colors) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                
                {/* 1. Days Streak (Yellow) */}
                <div className="pt-2 sm:pt-0 sm:px-4 text-left">
                  <div className="text-3xl font-black text-amber-500 font-mono tracking-tight">
                    8
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                    DAYS STREAK
                  </span>
                </div>

                {/* 2. Tasks Assigned (Blue) */}
                <div className="pt-2 sm:pt-0 sm:px-4 text-left">
                  <div className="text-3xl font-black text-blue-600 font-mono tracking-tight">
                    {myProjects.length}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                    TASKS ASSIGNED
                  </span>
                </div>

                {/* 3. Tasks Overdue (Red) */}
                <div className="pt-2 sm:pt-0 sm:px-4 text-left">
                  <div className="text-3xl font-black text-red-600 font-mono tracking-tight">
                    0
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                    TASKS OVERDUE
                  </span>
                </div>

                {/* 4. Urgent Reminders (Red / Amber) */}
                <div className="pt-2 sm:pt-0 sm:px-4 text-left">
                  <div className="text-3xl font-black text-red-500 font-mono tracking-tight">
                    {myReminders.filter(r => r.priority === 'High' && !r.done).length}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                    URGENT REMINDERS
                  </span>
                </div>
              </div>

              {/* ============================================================= */}
              {/* MAIN DASHBOARD WIDGETS GRID (Matching Image 2 Layout)         */}
              {/* ============================================================= */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
                
                {/* 1. HERO SCENIC GREETING CARD (Rotates Wallpaper every 10 seconds) */}
                <div 
                  className="lg:col-span-6 relative rounded-3xl overflow-hidden shadow-md flex flex-col justify-between p-6 sm:p-8 min-h-[340px] text-white transition-all duration-1000 ease-in-out group"
                  style={{
                    backgroundImage: `linear-gradient(to top, rgba(15, 23, 42, 0.82) 0%, rgba(15, 23, 42, 0.35) 50%, rgba(15, 23, 42, 0.5) 100%), url('${DASHBOARD_WALLPAPERS[heroWallpaperIndex].url}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {/* Top Greeting */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-black/40 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                        🎉 Happy Navratri!
                      </span>
                      {/* Wallpaper 10s rotation timer pill */}
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-white/90 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-md border border-white/10">
                        <RefreshCw className="w-2.5 h-2.5 animate-spin" style={{ animationDuration: '10s' }} />
                        <span>Rotates 10s • {DASHBOARD_WALLPAPERS[heroWallpaperIndex].title}</span>
                      </span>
                    </div>

                    <h2 className="text-3xl sm:text-5xl font-black tracking-tight font-serif drop-shadow-md pt-2">
                      {firstName}
                    </h2>
                  </div>

                  {/* Bottom Time, Date, and Caption + Wallpaper navigation dots */}
                  <div className="space-y-2.5">
                    <div className="text-3xl sm:text-4xl font-black font-mono tracking-wider drop-shadow-md">
                      {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-200 drop-shadow-sm">
                      {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                    <div className="pt-1 flex items-center justify-between flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-slate-300 hover:text-white bg-black/40 px-2.5 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                        {DASHBOARD_WALLPAPERS[heroWallpaperIndex].location} <ArrowUpRight className="w-3 h-3" />
                      </span>

                      {/* 10s Wallpaper Dots */}
                      <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/10">
                        {DASHBOARD_WALLPAPERS.map((wp, idx) => (
                          <button
                            key={idx}
                            onClick={() => setHeroWallpaperIndex(idx)}
                            className={`h-1.5 rounded-full transition-all cursor-pointer ${
                              heroWallpaperIndex === idx ? 'w-5 bg-amber-400' : 'w-1.5 bg-white/40 hover:bg-white/80'
                            }`}
                            title={`Switch to ${wp.title}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. WEATHER & QUICK ACTIONS COLUMN (Spans 3 cols on LG) */}
                <div className="lg:col-span-3 space-y-5 flex flex-col justify-between">
                  
                  {/* WEATHER WIDGET (Blue Accent) */}
                  <div className="bg-blue-50/80 border border-blue-200/80 p-5 rounded-2xl shadow-xs space-y-3">
                    <div className="flex items-center justify-between text-blue-900">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700">
                        WEATHER
                      </span>
                      <Sun className="w-4 h-4 text-amber-500" />
                    </div>

                    <div className="space-y-1">
                      <div className="text-2xl font-black text-blue-950 font-mono">
                        {weatherData.temp}
                      </div>
                      <div className="text-xs font-bold text-blue-800">
                        {weatherData.condition}
                      </div>
                      <p className="text-[11px] text-blue-600/90 font-medium">
                        {weatherData.city} • {weatherData.humidity} Humidity
                      </p>
                    </div>

                    <button 
                      onClick={() => alert(`Location: ${weatherData.city}\nConditions: ${weatherData.condition}\nTemperature: ${weatherData.temp}`)}
                      className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-blue-700 hover:text-blue-900 underline"
                    >
                      <Compass className="w-3 h-3" />
                      <span>Show local weather</span>
                    </button>
                  </div>

                  {/* QUICK ACTIONS WIDGET (2x2 Grid) */}
                  <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-3">
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      QUICK ACTIONS
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                      <button
                        onClick={() => setActiveTab('daily_status')}
                        className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-800 hover:text-blue-600 border border-slate-200 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
                      >
                        <Activity className="w-4 h-4 text-blue-600" />
                        <span>Status</span>
                      </button>

                      <button
                        onClick={hasPunchedInToday && !hasPunchedOutToday ? handlePunchOut : handlePunchIn}
                        className={`p-3 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                          hasPunchedInToday && !hasPunchedOutToday
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-400/40 shadow-xs'
                            : hasPunchedOutToday
                              ? 'bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-300'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300'
                        }`}
                      >
                        <CalendarCheck className="w-4 h-4 text-emerald-600" />
                        {hasPunchedInToday && !hasPunchedOutToday ? (
                          <>
                            <span className="font-mono text-[11px] font-black text-amber-800 animate-pulse">
                              {liveElapsed.formatted}
                            </span>
                            <span className="text-[10px] text-amber-700 font-bold">Punch Out</span>
                          </>
                        ) : hasPunchedOutToday ? (
                          <>
                            <span className="font-mono text-[11px] font-bold text-blue-800">
                              {todayRecord?.totalHours || 0}h Done
                            </span>
                            <span className="text-[10px] text-blue-700">Shift Ended</span>
                          </>
                        ) : (
                          <span>Punch In</span>
                        )}
                      </button>

                      <button
                        onClick={() => setActiveTab('leave')}
                        className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-800 hover:text-blue-600 border border-slate-200 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
                      >
                        <Umbrella className="w-4 h-4 text-amber-600" />
                        <span>Leave</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('reminders')}
                        className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-800 hover:text-blue-600 border border-slate-200 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
                      >
                        <Bell className="w-4 h-4 text-blue-600" />
                        <span>Remind</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. TECH NEWS & ATTENDANCE COLUMN (Spans 3 cols on LG) */}
                <div className="lg:col-span-3 space-y-5 flex flex-col justify-between">
                  
                  {/* TECH NEWS WIDGET */}
                  <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      <span>TECH NEWS</span>
                      <span className="text-blue-600">{newsIndex + 1}/{TECH_NEWS.length}</span>
                    </div>

                    <p className="text-xs font-semibold text-slate-800 line-clamp-3 min-h-[48px]">
                      {TECH_NEWS[newsIndex]}
                    </p>

                    <div className="flex items-center gap-1.5 pt-1">
                      {TECH_NEWS.map((_, i) => (
                        <span 
                          key={i} 
                          onClick={() => setNewsIndex(i)}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${i === newsIndex ? 'w-5 bg-blue-600' : 'w-1.5 bg-slate-200'}`} 
                        />
                      ))}
                    </div>
                  </div>

                  {/* ATTENDANCE CLOCKED-IN WIDGET (Rich Blue Gradient Card) */}
                  <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white p-5 rounded-2xl shadow-md shadow-blue-500/25 space-y-3 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-200">
                        ATTENDANCE
                      </span>
                      <CalendarIcon className="w-4 h-4 text-blue-200" />
                    </div>

                    <div>
                      <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight flex items-center gap-2">
                        {hasPunchedInToday && !hasPunchedOutToday ? (
                          <>
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block shrink-0" />
                            <span>{liveElapsed.formatted}</span>
                          </>
                        ) : hasPunchedOutToday ? (
                          `${todayRecord?.totalHours || 0}h 00m`
                        ) : (
                          '00:00:00'
                        )}
                      </div>
                      <div className="text-xs text-blue-100 font-semibold mt-1">
                        {hasPunchedInToday && !hasPunchedOutToday
                          ? `Clocked In at ${todayRecord?.punchInTime} • Counting Live Time`
                          : hasPunchedOutToday
                            ? `Shift Ended at ${todayRecord?.punchOutTime} • Total: ${todayRecord?.totalHours} hrs`
                            : 'Not Clocked In Today'}
                      </div>
                    </div>

                    {/* Punch Out / Punch In Button */}
                    <div className="pt-1">
                      {hasPunchedInToday && !hasPunchedOutToday ? (
                        <button
                          onClick={handlePunchOut}
                          className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                          <span>Punch Out (Worked: {liveElapsed.shortFormatted})</span>
                        </button>
                      ) : hasPunchedOutToday ? (
                        <button
                          onClick={() => setActiveTab('daily_status')}
                          className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Update Daily Work Status →</span>
                        </button>
                      ) : (
                        <button
                          onClick={handlePunchIn}
                          className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-blue-50 text-blue-700 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Punch In ({targetWorkHours}h Shift)</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* =========================================================== */}
                {/* ROW 2: TEAM PULSE + NEXT HOLIDAY + REMINDER CALENDAR        */}
                {/* =========================================================== */}

                {/* 4. TEAM PULSE WIDGET (Spans 4 cols on LG) */}
                <div className="lg:col-span-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                        TEAM PULSE
                      </span>
                      <span className="text-xs font-bold text-slate-800 truncate max-w-[200px] block">
                        {teamPulseData.teamName}
                      </span>
                    </div>
                    <Users className="w-4 h-4 text-blue-600 shrink-0" />
                  </div>

                  {/* 3 Metric Numbers */}
                  <div className="grid grid-cols-3 gap-2 text-left">
                    <div>
                      <div className="text-2xl font-black text-blue-600 font-mono">{teamPulseData.inCount}</div>
                      <span className="text-[11px] text-slate-500 font-medium">in</span>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-amber-500 font-mono">{teamPulseData.onLeaveCount}</div>
                      <span className="text-[11px] text-slate-500 font-medium">on leave</span>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-red-600 font-mono">{teamPulseData.notInCount}</div>
                      <span className="text-[11px] text-slate-500 font-medium">not in</span>
                    </div>
                  </div>

                  {/* Segmented Color Bar: Blue, Yellow, Red */}
                  <div className="w-full h-2 rounded-full overflow-hidden flex bg-slate-100">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-500" 
                      style={{ width: `${teamPulseData.inPct}%` }} 
                      title={`${teamPulseData.inCount} in`} 
                    />
                    <div 
                      className="h-full bg-amber-400 transition-all duration-500" 
                      style={{ width: `${teamPulseData.leavePct}%` }} 
                      title={`${teamPulseData.onLeaveCount} on leave`} 
                    />
                    <div 
                      className="h-full bg-red-500 transition-all duration-500" 
                      style={{ width: `${teamPulseData.notInPct}%` }} 
                      title={`${teamPulseData.notInCount} not in`} 
                    />
                  </div>

                  {/* Dynamic Member Status List: shows members not in today or on leave */}
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {teamPulseData.notInMembers.map((m) => (
                      <div key={m.id || m.userId} className="p-2.5 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 truncate pr-2">
                          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 animate-pulse" />
                          <span className="font-bold text-red-900 truncate">{m.name}</span>
                        </div>
                        <span className="text-[11px] font-mono text-red-700 font-semibold shrink-0">Not in today</span>
                      </div>
                    ))}

                    {teamPulseData.onLeaveMembers.map((m) => (
                      <div key={m.id || m.userId} className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 truncate pr-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                          <span className="font-bold text-amber-900 truncate">{m.name}</span>
                        </div>
                        <span className="text-[11px] font-mono text-amber-700 font-semibold shrink-0">On leave today</span>
                      </div>
                    ))}

                    {teamPulseData.notInMembers.length === 0 && teamPulseData.onLeaveMembers.length === 0 && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          <span className="font-bold text-emerald-900">All team members are present today!</span>
                        </div>
                        <span className="text-[11px] font-mono text-emerald-700 font-semibold shrink-0">100% In</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. NEXT HOLIDAY WIDGET (Spans 3 cols on LG, Yellow Accent) */}
                <div className="lg:col-span-3 bg-amber-50/80 border border-amber-200 p-5 rounded-2xl shadow-xs space-y-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-amber-900">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700">
                      NEXT HOLIDAY
                    </span>
                    <PartyPopper className="w-4 h-4 text-amber-600" />
                  </div>

                  <div>
                    <div className="text-3xl font-black text-amber-700 font-mono">
                      5 <span className="text-sm font-sans font-bold text-amber-900">days</span>
                    </div>
                    <div className="text-sm font-bold text-amber-950 mt-1">
                      Dussehra (Vijayadashami)
                    </div>
                    <div className="text-xs text-amber-700 font-medium font-mono">
                      Tue, Oct 20
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('holidays')}
                    className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline self-start cursor-pointer"
                  >
                    View 2026 Holiday Calendar →
                  </button>
                </div>

                {/* 6. REMINDER CALENDAR WIDGET (Spans 5 cols on LG) */}
                <div className="lg:col-span-5 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                        REMINDER CALENDAR
                      </span>
                      <h4 className="text-sm font-extrabold text-slate-900">
                        October 2026
                      </h4>
                    </div>
                    <CalendarIcon className="w-4 h-4 text-blue-600" />
                  </div>

                  {/* Calendar Matrix (S M T W T F S) */}
                  <div className="space-y-1.5 text-center text-xs">
                    <div className="grid grid-cols-7 gap-1 font-mono font-bold text-slate-400 text-[10px]">
                      <span>S</span>
                      <span>M</span>
                      <span>T</span>
                      <span>W</span>
                      <span>T</span>
                      <span>F</span>
                      <span>S</span>
                    </div>

                    <div className="grid grid-cols-7 gap-1 font-mono text-xs">
                      {/* Blank placeholders before Thursday Oct 1 (Sun, Mon, Tue, Wed) */}
                      <span className="p-1 text-slate-200">27</span>
                      <span className="p-1 text-slate-200">28</span>
                      <span className="p-1 text-slate-200">29</span>
                      <span className="p-1 text-slate-200">30</span>
                      <span className="p-1 text-slate-600">1</span>
                      <span className="p-1 text-slate-600">2</span>
                      <span className="p-1 text-slate-600">3</span>

                      <span className="p-1 text-slate-600">4</span>
                      <span className="p-1 text-slate-600">5</span>
                      <span className="p-1 text-slate-600">6</span>
                      <span className="p-1 text-slate-600">7</span>
                      <span className="p-1 text-slate-600">8</span>
                      <span className="p-1 text-slate-600">9</span>
                      <span className="p-1 text-slate-600">10</span>

                      <span className="p-1 text-slate-600">11</span>
                      <span className="p-1 text-slate-600">12</span>
                      <span className="p-1 text-slate-600">13</span>
                      <span className="p-1 text-slate-600">14</span>
                      {/* Current Active Date 15 Highlighted in prominent Blue Pill */}
                      <span className="p-1 rounded-xl bg-blue-600 text-white font-bold shadow-md shadow-blue-500/25">
                        15
                      </span>
                      <span className="p-1 text-slate-600">16</span>
                      <span className="p-1 text-slate-600">17</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 font-medium">
                    <span>0 this month</span>
                    <span className="text-slate-400">No upcoming reminders</span>
                  </div>
                </div>

                {/* =========================================================== */}
                {/* ROW 3: RECENT MENTIONS + STATUS BACKLOG WARNING             */}
                {/* =========================================================== */}

                {/* 7. RECENT MENTIONS WIDGET (Spans 5 cols on LG) */}
                <div className="lg:col-span-5 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      RECENT MENTIONS
                    </span>
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold font-mono">
                      @
                    </span>
                  </div>

                  <div className="text-center py-4 space-y-1">
                    <MessageSquare className="w-6 h-6 text-slate-300 mx-auto" />
                    <div className="text-xs font-bold text-slate-700">No mentions yet</div>
                    <div className="text-[11px] text-slate-400">You're all caught up.</div>
                  </div>
                </div>

                {/* 8. STATUS BACKLOG WARNING CARD (Spans 7 cols on LG, Yellow Accent) */}
                <div className="lg:col-span-7 bg-amber-50 border border-amber-300 p-5 rounded-2xl shadow-xs space-y-2 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-amber-600" />
                      <span>STATUS BACKLOG</span>
                    </span>
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm sm:text-base font-bold text-amber-950">
                      You haven't logged 3 working days
                    </h4>
                    <p className="text-xs text-amber-800">
                      Earliest missing day: <strong>Mon, Oct 12</strong>. Catch up in two lines — the team is waiting on the hand-off.
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTab('daily_status')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 hover:text-amber-950 underline self-start pt-1 cursor-pointer"
                  >
                    <span>Catch up now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* ============================================================= */}
              {/* BOTTOM QUICK NAVIGATION DOCK (from Image 2)                   */}
              {/* ============================================================= */}
              <div className="flex items-center justify-center pt-4">
                <div className="inline-flex items-center gap-2 p-1.5 bg-white rounded-full border border-slate-200 shadow-md">
                  <button
                    onClick={() => setActiveTab('projects')}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-1.5"
                  >
                    <FolderKanban className="w-3.5 h-3.5 text-blue-600" />
                    <span>Tasks</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('leave')}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-1.5"
                  >
                    <Umbrella className="w-3.5 h-3.5 text-amber-500" />
                    <span>Leave</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('notebooks')}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    <span>Notes</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('reminders')}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-1.5"
                  >
                    <Bell className="w-3.5 h-3.5 text-amber-500" />
                    <span>Reminders</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('attendance')}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-1.5"
                  >
                    <CalendarCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Attendance</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('daily_status')}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-1.5"
                  >
                    <Activity className="w-3.5 h-3.5 text-blue-600" />
                    <span>Status</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* MODULE 2: PROJECTS & TASKS                                        */}
          {/* ================================================================= */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Assigned Projects & Directives</h2>
                  <p className="text-xs text-slate-500">Track active enterprise deliverables, milestones, and deadlines</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-bold">
                  {myProjects.length} Projects Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {myProjects.map((p) => (
                  <div key={p.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 font-bold">{p.id} • {p.client}</span>
                        <h4 className="font-extrabold text-sm text-slate-900 mt-0.5">{p.title}</h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                        p.priority === 'Critical' ? 'bg-red-50 text-red-700 border border-red-200' :
                        p.priority === 'High' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {p.priority}
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                        <span>Milestone Progress</span>
                        <span>{p.progress}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-blue-600 transition-all duration-500" 
                          style={{ width: `${p.progress}%` }} 
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <span>Due: <strong className="text-slate-800 font-mono">{p.dueDate}</strong></span>
                      <span className="font-semibold text-blue-600">{p.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* MODULE 3: NOTEBOOKS & ENGINEERING SPECS                           */}
          {/* ================================================================= */}
          {activeTab === 'notebooks' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Engineering Notebooks</h2>
                  <p className="text-xs text-slate-500">Technical documentation, architecture blueprints & personal scratchpad</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                <div className="md:col-span-4 space-y-3">
                  {myNotebooks.map((nb) => (
                    <div 
                      key={nb.id}
                      onClick={() => setActiveNotebook(nb)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        activeNotebook.id === nb.id
                          ? 'bg-blue-50/80 border-blue-300 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <h4 className="font-extrabold text-sm text-slate-900">{nb.title}</h4>
                      <div className="text-[11px] text-slate-500 mt-1">Updated: {nb.updated}</div>
                      <div className="flex gap-1.5 flex-wrap mt-2">
                        {nb.tags.map(t => (
                          <span key={t} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono text-blue-600 font-semibold">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="md:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">{activeNotebook.title}</h3>
                      <span className="text-xs text-slate-400">Last edited: {activeNotebook.updated}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-sans text-slate-800 leading-relaxed min-h-[220px] whitespace-pre-wrap">
                    {activeNotebook.content}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* MODULE 4: DAILY WORK STATUS                                       */}
          {/* ================================================================= */}
          {activeTab === 'daily_status' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Daily Standup & Work Status</h2>
                  <p className="text-xs text-slate-500">Record your daily completed tasks, tomorrow targets, and blockers</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-bold">
                  {myStatuses.length} Standups Logged
                </span>
              </div>

              {/* Status form */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h4 className="font-extrabold text-sm text-slate-900">Log Today's Work Status ({todayStr})</h4>
                <form onSubmit={handleSavePostPunchOutStatus} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      1. What have you completed today? *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={postPunchOutForm.tasksDone}
                      onChange={(e) => setPostPunchOutForm({ ...postPunchOutForm, tasksDone: e.target.value })}
                      placeholder="Detail features coded, tickets resolved, PRs created, architecture designs..."
                      className="form-input text-xs text-slate-900 bg-white border border-slate-300 focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      2. What are the tomorrow goals? *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={postPunchOutForm.tomorrowGoals}
                      onChange={(e) => setPostPunchOutForm({ ...postPunchOutForm, tomorrowGoals: e.target.value })}
                      placeholder="State deliverables, sprint focus, or milestone deliverables for tomorrow..."
                      className="form-input text-xs text-slate-900 bg-white border border-slate-300 focus:border-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Deliverable URL / Pull Request (Optional)
                      </label>
                      <input
                        type="url"
                        value={postPunchOutForm.deliverablesUrl}
                        onChange={(e) => setPostPunchOutForm({ ...postPunchOutForm, deliverablesUrl: e.target.value })}
                        placeholder="https://github.com/... or Figma link"
                        className="form-input text-xs font-mono text-slate-900 bg-white border border-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Blockers or Hurdles (Optional)
                      </label>
                      <input
                        type="text"
                        value={postPunchOutForm.blockers}
                        onChange={(e) => setPostPunchOutForm({ ...postPunchOutForm, blockers: e.target.value })}
                        placeholder="Any access, hardware, or review blockers..."
                        className="form-input text-xs text-slate-900 bg-white border border-slate-300"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary py-2.5 px-6 text-xs font-bold glow-blue cursor-pointer"
                  >
                    Submit Work Status
                  </button>
                </form>
              </div>

              {/* Status History Cards */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900">Previous Submissions</h4>
                {myStatuses.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                    No daily standups submitted yet.
                  </div>
                ) : (
                  myStatuses.map((s) => (
                    <div key={s.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-xs text-blue-700">{s.date}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Logged at {s.timestamp}</span>
                      </div>
                      <div className="text-xs text-slate-800">
                        <strong className="text-slate-900 block font-bold">Done Today:</strong>
                        {s.tasksDone}
                      </div>
                      <div className="text-xs text-slate-700">
                        <strong className="text-slate-900 block font-bold">Tomorrow Goals:</strong>
                        {s.tomorrowGoals}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* MODULE 5: MY ATTENDANCE (Matches Reference Design)                */}
          {/* ================================================================= */}
          {activeTab === 'attendance' && (
            <div className="max-w-4xl mx-auto space-y-6 pb-12">
              {/* Header */}
              <div>
                <h2 className="font-serif text-3xl font-bold text-slate-800 tracking-tight">
                  My Attendance
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Track your daily punch-in/out and view your monthly history.
                </p>
              </div>

              {/* CARD 1: Shift Status (Real-time for Today or Selected Day) */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    {selectedDayInfo ? (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-blue-600 font-bold block">Inspecting Selected Date</span>
                          <button 
                            onClick={() => setSelectedDayInfo(null)}
                            className="text-[10px] font-bold text-slate-500 hover:text-blue-600 underline cursor-pointer"
                          >
                            Reset to Today
                          </button>
                        </div>
                        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                          {formatSelectedDisplayDate(selectedDayInfo.date)}
                        </h3>
                      </div>
                    ) : (
                      <div>
                        <span className="text-xs text-slate-400 font-medium block mb-1">Today</span>
                        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                          {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </h3>
                      </div>
                    )}
                  </div>

                  <span className={`inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold shadow-2xs ${
                    selectedDayInfo
                      ? (selectedDayInfo.color === 'green' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                         selectedDayInfo.color === 'yellow' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                         selectedDayInfo.color === 'leave' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                         selectedDayInfo.color === 'red' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                         'bg-slate-100 text-slate-600 border border-slate-200')
                      : (hasPunchedInToday && !hasPunchedOutToday 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 animate-pulse' 
                          : (hasPunchedOutToday 
                              ? (todayRecord?.totalHours >= targetWorkHours ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200')
                              : 'bg-slate-100 text-slate-600 border border-slate-200'))
                  }`}>
                    {selectedDayInfo 
                      ? selectedDayInfo.status 
                      : (hasPunchedInToday && !hasPunchedOutToday 
                          ? 'Partially In (Active Shift)' 
                          : (hasPunchedOutToday 
                              ? (todayRecord?.totalHours >= targetWorkHours ? 'Target Completed (Green)' : 'Partial Day (Yellow)') 
                              : 'Shift Not Started'))}
                  </span>
                </div>

                {/* 4 Real-Time Metric Columns */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-2">
                  <div>
                    <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-1.5">
                      PUNCH IN
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-slate-900 font-sans">
                      {selectedDayInfo 
                        ? (selectedDayInfo.record?.punchInTime || '—') 
                        : (todayRecord?.punchInTime || '—')}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-1.5">
                      PUNCH OUT
                    </div>
                    <div className="text-xl sm:text-2xl font-normal text-slate-400 font-sans">
                      {selectedDayInfo 
                        ? (selectedDayInfo.record?.punchOutTime || '—') 
                        : (todayRecord?.punchOutTime || '—')}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-1.5">
                      TIME WORKED
                    </div>
                    <div className="text-xl sm:text-2xl font-semibold text-indigo-600 font-sans">
                      {selectedDayInfo 
                        ? (selectedDayInfo.record?.totalHours ? `${selectedDayInfo.record.totalHours}h 00m` : '0h 00m')
                        : (hasPunchedInToday && !hasPunchedOutToday 
                            ? liveElapsed.formatted 
                            : (todayRecord?.punchOutTime ? `${todayRecord.totalHours || 0}h 00m` : '0h 00m'))}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-1.5">
                      TARGET (INCL. LUNCH)
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-slate-900 font-sans">
                      {targetWorkHours || 5}h
                    </div>
                  </div>
                </div>

                {/* Punch Action Buttons (Real-time Shift Control) */}
                <div className="pt-2 flex items-center gap-3">
                  {hasPunchedInToday && !hasPunchedOutToday ? (
                    <button
                      onClick={handlePunchOut}
                      className="border border-rose-300 text-rose-600 hover:bg-rose-50 bg-white font-medium text-xs px-4 py-2 rounded-lg inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                    >
                      <span className="text-sm font-bold">↳</span>
                      <span>Punch Out &amp; Update Status</span>
                    </button>
                  ) : hasPunchedOutToday ? (
                    <div className="flex items-center gap-3 flex-wrap">
                      <button
                        disabled
                        className="border border-emerald-300 text-emerald-700 bg-emerald-50 font-medium text-xs px-4 py-2 rounded-lg inline-flex items-center gap-1.5 shadow-2xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Shift Ended ({todayRecord?.punchOutTime}) • Total: {todayRecord?.totalHours}h</span>
                      </button>
                      <button
                        onClick={handlePunchIn}
                        className="border border-blue-300 text-blue-600 hover:bg-blue-50 bg-white font-medium text-xs px-3.5 py-2 rounded-lg inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                      >
                        <span className="text-sm font-bold">↳</span>
                        <span>Re-Punch In / Extend Shift</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handlePunchIn}
                        className="border border-emerald-400 text-emerald-700 hover:bg-emerald-50 bg-white font-medium text-xs px-4 py-2 rounded-lg inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                      >
                        <span className="text-sm font-bold">↳</span>
                        <span>Punch In ({targetWorkHours}h Shift)</span>
                      </button>
                    </div>
                  )}

                  {selectedDayInfo && (
                    <button
                      onClick={() => setSelectedDayInfo(null)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer"
                    >
                      Back to Real-Time Today
                    </button>
                  )}
                </div>
              </div>

              {/* CARD 2: Monthly Overview (Dynamic Real-Time Calendar) */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <h3 className="text-slate-800 font-bold text-base">Monthly Overview</h3>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700 text-xs sm:text-sm font-semibold select-none">
                    <button 
                      onClick={() => setCalendarMonth(prev => (prev === 0 ? 11 : prev - 1))}
                      className="w-6 h-6 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
                      title="Previous month"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-bold">
                      {new Date(calendarYear, calendarMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <button 
                      onClick={() => setCalendarMonth(prev => (prev === 11 ? 0 : prev + 1))}
                      className="w-6 h-6 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
                      title="Next month"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Summary counters (Real-time computed from store) */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                  <div>
                    <span className="font-bold text-emerald-600 mr-1">{summaryStats.completedDays || 0}</span>
                    <span>Present</span>
                  </div>
                  <div>
                    <span className="font-bold text-amber-500 mr-1">{summaryStats.partialDays || 0}</span>
                    <span>Partial</span>
                  </div>
                  <div>
                    <span className="font-bold text-rose-500 mr-1">{summaryStats.absentDays || 0}</span>
                    <span>Absent</span>
                  </div>
                  <div>
                    <span className="font-bold text-blue-500 mr-1">{summaryStats.leaveDays || 0}</span>
                    <span>Leave</span>
                  </div>
                  <div>
                    <span className="font-bold text-indigo-600 mr-1">
                      {Math.floor(summaryStats.totalHoursWorked || 0)}h {Math.round(((summaryStats.totalHoursWorked || 0) % 1) * 60)}m
                    </span>
                    <span>Worked</span>
                  </div>
                </div>

                {/* Day pills grid (Real-Time days for this specific month) */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {calendarDays.map((d) => {
                    let pillClass = 'bg-slate-100 text-slate-400';
                    if (d.color === 'green') pillClass = 'bg-[#10b981] text-white';
                    else if (d.color === 'yellow') pillClass = 'bg-[#f59e0b] text-white';
                    else if (d.color === 'red') pillClass = 'bg-[#f43f5e] text-white';
                    else if (d.color === 'leave') pillClass = 'bg-[#3b82f6] text-white';
                    else if (d.color === 'blue') pillClass = 'bg-blue-600 text-white animate-pulse';
                    else if (d.isWeekend) pillClass = 'bg-[#e0f2fe] text-[#0369a1]';
                    
                    if (d.isToday) {
                      pillClass += ' ring-2 ring-blue-500 ring-offset-2 ring-offset-white font-bold shadow-xs';
                      if (d.color === 'gray') pillClass = 'bg-[#f59e0b] text-white ring-2 ring-blue-500 ring-offset-2 ring-offset-white font-bold shadow-xs';
                    }

                    const isSelected = selectedDayInfo?.date === d.date;

                    return (
                      <div
                        key={d.date}
                        onClick={() => setSelectedDayInfo(d)}
                        className={`w-9 sm:w-10 py-1.5 px-0.5 rounded-xl flex flex-col items-center justify-center text-center transition-transform hover:scale-110 select-none cursor-pointer ${pillClass} ${
                          isSelected ? 'scale-110 ring-2 ring-black shadow-md' : ''
                        }`}
                        title={`${d.dow}, ${d.date} - ${d.status}`}
                      >
                        <span className="text-[10px] font-medium leading-none opacity-90">{d.dow}</span>
                        <span className="text-xs font-bold leading-none mt-1">{d.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CARD 3: Holidays */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <h3 className="text-slate-800 font-bold text-base">Holidays</h3>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">2 upcoming · 4 past</span>
                </div>

                {/* Holidays Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
                        <th className="pb-2.5 font-semibold">DATE</th>
                        <th className="pb-2.5 font-semibold">FESTIVAL</th>
                        <th className="pb-2.5 font-semibold">NOTES</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      <tr>
                        <td className="py-3 font-semibold text-slate-900">Tue, Oct 20, 2026</td>
                        <td className="py-3">Dussehra</td>
                        <td className="py-3 text-slate-400">—</td>
                      </tr>
                      <tr>
                        <td className="py-3 font-semibold text-slate-900">Fri, Dec 25, 2026</td>
                        <td className="py-3">Christmas</td>
                        <td className="py-3 text-slate-400">—</td>
                      </tr>
                      {showPastHolidays && (
                        <>
                          <tr className="bg-slate-50/60">
                            <td className="py-3 font-semibold text-slate-600">Wed, Jan 1, 2026</td>
                            <td className="py-3 text-slate-600">New Year's Day</td>
                            <td className="py-3 text-slate-400">—</td>
                          </tr>
                          <tr className="bg-slate-50/60">
                            <td className="py-3 font-semibold text-slate-600">Mon, Jan 26, 2026</td>
                            <td className="py-3 text-slate-600">Republic Day</td>
                            <td className="py-3 text-slate-400">—</td>
                          </tr>
                          <tr className="bg-slate-50/60">
                            <td className="py-3 font-semibold text-slate-600">Fri, Aug 15, 2026</td>
                            <td className="py-3 text-slate-600">Independence Day</td>
                            <td className="py-3 text-slate-400">—</td>
                          </tr>
                          <tr className="bg-slate-50/60">
                            <td className="py-3 font-semibold text-slate-600">Fri, Oct 2, 2026</td>
                            <td className="py-3 text-slate-600">Gandhi Jayanti</td>
                            <td className="py-3 text-slate-400">—</td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>

                <button 
                  onClick={() => setShowPastHolidays(!showPastHolidays)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors inline-block cursor-pointer"
                >
                  {showPastHolidays ? 'Hide past holidays' : 'Show 4 past holidays'}
                </button>

                {/* Team Notice Callout Box */}
                <div className="bg-[#fbf9f4] border border-[#f0ebe1] rounded-2xl p-5 text-xs text-slate-700 leading-relaxed mt-4">
                  <div className="flex items-start gap-3">
                    <div className="w-4 h-4 rounded-full border border-slate-400 text-slate-500 flex items-center justify-center text-[10px] font-serif shrink-0 mt-0.5">
                      i
                    </div>
                    <div className="space-y-2.5 text-slate-600">
                      <p className="font-semibold text-slate-800">Hi Team,</p>
                      <p className="leading-relaxed">
                        We have 12 holidays in total this year. The list shows 10 official holidays.<br />
                        Maha Shivaratri and Diwali fall on Sundays, so they're not included separately.<br />
                        Additionally, each of you can take 2 optional holidays based on your regional or religious preferences.
                      </p>
                      <p>Let me know if you have any questions!</p>
                      <p className="font-semibold text-slate-800 pt-1">Thank You</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 4: LEGEND */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                <h4 className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-3.5">
                  LEGEND
                </h4>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-[#10b981] shrink-0" />
                    <span>Present</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-[#f59e0b] shrink-0" />
                    <span>Partial day</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-[#f43f5e] shrink-0" />
                    <span>Absent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-[#cbd5e1] shrink-0" />
                    <span>No record</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-[#fef08a] border border-amber-300 shrink-0" />
                    <span>Holiday</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-[#e0f2fe] shrink-0" />
                    <span>Week off</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-[#3b82f6] shrink-0" />
                    <span>On leave</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-[#8b5cf6] shrink-0" />
                    <span>Comp off (working)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-[#d8b4fe] shrink-0" />
                    <span>Comp off (taken)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-[#fef9c3] shrink-0" />
                    <span>Not joined yet</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-[#94a3b8] shrink-0" />
                    <span>Left the organisation</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* MODULE 6: 2026 COMPANY HOLIDAYS                                   */}
          {/* ================================================================= */}
          {activeTab === 'holidays' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">2026 Company Holiday Calendar</h2>
                  <p className="text-xs text-slate-500">Official observed holidays & festival leaves for Sakith Harvan Technologies</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-xs font-mono font-bold">
                  8 Holidays in 2026
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {COMPANY_HOLIDAYS_2026.map((h) => (
                  <div key={h.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold border border-amber-200">
                        {h.type}
                      </span>
                      {h.daysLeft > 0 && (
                        <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                          in {h.daysLeft} days
                        </span>
                      )}
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900 pt-1">{h.name}</h4>
                    <div className="text-xs font-mono font-semibold text-slate-700">{h.date} • {h.day}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* MODULE 7: APPLY LEAVE                                             */}
          {/* ================================================================= */}
          {activeTab === 'leave' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Apply Leave & Absences</h2>
                  <p className="text-xs text-slate-500">Submit planned leaves for administrative and leadership approval</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-bold">
                  {myLeaves.length} Applications
                </span>
              </div>

              {leaveSuccessMsg && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  {leaveSuccessMsg}
                </div>
              )}

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <form onSubmit={handleApplyLeave} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Start Date *</label>
                      <input
                        type="date"
                        required
                        value={leaveForm.startDate}
                        onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                        className="form-input text-xs text-slate-900 bg-white border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">End Date *</label>
                      <input
                        type="date"
                        required
                        value={leaveForm.endDate}
                        onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                        className="form-input text-xs text-slate-900 bg-white border border-slate-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Reason / Purpose of Leave *</label>
                    <textarea
                      required
                      rows={3}
                      value={leaveForm.purpose}
                      onChange={(e) => setLeaveForm({ ...leaveForm, purpose: e.target.value })}
                      placeholder="Specify reason for leave (Academic exams, Health, Family event)..."
                      className="form-input text-xs text-slate-900 bg-white border border-slate-300"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary py-2.5 px-6 text-xs font-bold glow-blue cursor-pointer"
                  >
                    Submit Leave Application
                  </button>
                </form>
              </div>

              {/* Leave Applications History */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900">Your Leave Applications</h4>
                {myLeaves.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                    No leave applications recorded.
                  </div>
                ) : (
                  myLeaves.map((l) => (
                    <div key={l.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-bold text-slate-900">{l.purpose}</h5>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            Ref: {l.id}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          Period: <strong>{l.startDate}</strong> to <strong>{l.endDate}</strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                          l.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          l.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {l.status}
                        </span>

                        {l.status === 'Approved' && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLeaveForCert(l);
                              setShowLeaveCertModal(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                            title="Download official sanctioned leave letter with watermark & headline"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Download PDF Letter</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* MODULE 8: REMINDERS & EYE REST                                    */}
          {/* ================================================================= */}
          {activeTab === 'reminders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Workplace Reminders & Eye Rest</h2>
                  <p className="text-xs text-slate-500">20-20-20 Vision timer, hydration breaks & daily milestone reminders</p>
                </div>
              </div>

              {/* 20-20-20 Rule Card (Blue / Yellow Accent) */}
              <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-600" />
                    <h4 className="font-extrabold text-sm text-blue-950">20-20-20 Eye Rest & Wellness Rule</h4>
                  </div>
                  <p className="text-xs text-blue-800">
                    Every 20 minutes, gaze at an object 20 feet away for 20 seconds to prevent digital eye strain.
                  </p>
                </div>

                <div className="text-right font-mono">
                  <div className="text-2xl font-black text-blue-700">
                    {Math.floor(eyeRestSeconds / 60)}:{String(eyeRestSeconds % 60).padStart(2, '0')}
                  </div>
                  <button
                    onClick={() => setEyeRestSeconds(1200)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-900 underline"
                  >
                    Reset Timer
                  </button>
                </div>
              </div>

              {/* Add reminder input */}
              <form onSubmit={handleAddReminder} className="flex gap-2">
                <input
                  type="text"
                  value={newReminderText}
                  onChange={(e) => setNewReminderText(e.target.value)}
                  placeholder="Add a new reminder (e.g. Sprint review with team at 4 PM)..."
                  className="flex-1 bg-white border border-slate-300 px-4 py-2.5 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                />
                <button
                  type="submit"
                  className="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold"
                >
                  Add Reminder
                </button>
              </form>

              {/* Reminders list */}
              <div className="space-y-2.5">
                {myReminders.map((r) => (
                  <div 
                    key={r.id}
                    onClick={() => handleToggleReminder(r.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      r.done
                        ? 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                        : 'bg-white border-slate-200 text-slate-800 shadow-xs hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${r.done ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'}`}>
                        {r.done && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-xs font-semibold">{r.text}</span>
                    </div>

                    <span className="text-[11px] font-mono text-slate-400">{r.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* MODULE 9: BUG TRACKER (Red Accent)                                */}
          {/* ================================================================= */}
          {activeTab === 'bug_tracker' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Bug Tracker & Incident Log</h2>
                  <p className="text-xs text-slate-500">Report software bugs, track resolution status & assign hotfixes</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-red-50 border border-red-300 text-red-700 text-xs font-mono font-bold">
                  {myBugs.filter(b => b.status !== 'Resolved').length} Active Issues
                </span>
              </div>

              {/* Bug report form */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h4 className="font-extrabold text-sm text-slate-900">Report New Bug or Technical Glitch</h4>
                <form onSubmit={handleReportBug} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">Issue Title *</label>
                      <input
                        type="text"
                        required
                        value={bugForm.title}
                        onChange={(e) => setBugForm({ ...bugForm, title: e.target.value })}
                        placeholder="Brief summary of the defect or error..."
                        className="form-input text-xs text-slate-900 bg-white border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Severity *</label>
                      <select
                        value={bugForm.severity}
                        onChange={(e) => setBugForm({ ...bugForm, severity: e.target.value })}
                        className="form-input text-xs text-slate-900 bg-white border border-slate-300"
                      >
                        <option value="Critical">Critical (Red)</option>
                        <option value="Major">Major (Yellow)</option>
                        <option value="Minor">Minor (Blue)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Description & Steps to Reproduce</label>
                    <textarea
                      rows={2}
                      value={bugForm.description}
                      onChange={(e) => setBugForm({ ...bugForm, description: e.target.value })}
                      placeholder="Explain how to trigger the bug, expected vs actual behavior..."
                      className="form-input text-xs text-slate-900 bg-white border border-slate-300"
                    />
                  </div>

                  <button
                    type="submit"
                    className="py-2.5 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/25 cursor-pointer"
                  >
                    Submit Bug Ticket
                  </button>
                </form>
              </div>

              {/* Bug Tickets List */}
              <div className="space-y-3">
                {myBugs.map((b) => (
                  <div key={b.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-400">{b.id}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                          b.severity === 'Critical' ? 'bg-red-50 text-red-700 border border-red-300' :
                          b.severity === 'Major' ? 'bg-amber-50 text-amber-700 border border-amber-300' :
                          'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {b.severity}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{b.title}</span>
                      </div>
                      <p className="text-xs text-slate-500">Module: {b.module} • Reported by: {b.reportedBy}</p>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
                      b.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      b.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* MODULE 10: SETTINGS & PASSWORD MANAGEMENT                         */}
          {/* ================================================================= */}
          {activeTab === 'settings' && (
            <div className="max-w-xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5 text-left">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-mono text-blue-600 font-bold uppercase tracking-wider block">
                  Security & Profile
                </span>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Password Management
                </h3>
                <p className="text-xs text-slate-500">
                  Update your default password (Shtsa@2026) to your private confidential password.
                </p>
              </div>

              {passwordFeedback.message && (
                <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-3 ${
                  passwordFeedback.type === 'error'
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}>
                  {passwordFeedback.type === 'error' ? (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  <span>{passwordFeedback.message}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Current Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="Enter current password (default: Shtsa@2026)"
                    className="form-input text-xs text-slate-900 bg-white border border-slate-300 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    New Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Enter new secure password (min 6 chars)"
                    className="form-input text-xs text-slate-900 bg-white border border-slate-300 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Re-enter new password"
                    className="form-input text-xs text-slate-900 bg-white border border-slate-300 focus:border-blue-600"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="btn-primary w-full py-3 rounded-xl text-xs font-bold cursor-pointer glow-blue"
                  >
                    Change Password
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================================================================= */}
          {/* DELEGATED MATRIX MODULES                                         */}
          {/* ================================================================= */}
          {activeTab === 'matrix_quotation' && effectivePermissions.quotation_maker && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <QuotationMaker />
            </div>
          )}

          {activeTab === 'matrix_attendance' && effectivePermissions.manage_attendance && (
            <div className="space-y-4">
              <AttendanceManagement />
            </div>
          )}

          {activeTab === 'matrix_leaves' && effectivePermissions.manage_leaves && (
            <div className="space-y-4">
              <LeaveManagement />
            </div>
          )}

          {activeTab === 'matrix_work_status' && effectivePermissions.view_work_status && (
            <div className="space-y-4">
              <DailyStatusHelpAdmin />
            </div>
          )}

          {activeTab === 'matrix_access' && effectivePermissions.manage_access_matrix && (
            <div className="space-y-4">
              <AccessMatrixManagement currentUser={userProfile} />
            </div>
          )}

          {activeTab === 'matrix_leads' && effectivePermissions.manage_leads && (
            <MatrixLeadsView />
          )}

          {activeTab === 'matrix_tasks' && effectivePermissions.manage_tasks && (
            <MatrixTasksView currentUser={userProfile} />
          )}

          {activeTab === 'matrix_workshops' && effectivePermissions.manage_workshops && (
            <MatrixWorkshopsView />
          )}

          {activeTab === 'matrix_overview' && effectivePermissions.view_overview && (
            <MatrixOverviewView />
          )}
        </main>
      </div>

      {/* Official Leave Approval Certificate Modal (With Watermark & Pakka Headline) */}
      <LeaveApprovalCertificateModal
        isOpen={showLeaveCertModal}
        onClose={() => setShowLeaveCertModal(false)}
        leave={selectedLeaveForCert}
        currentUser={currentUser}
      />
    </div>
  );
};

/**
 * Delegated Sub-Views for Matrix-Authorized Staff
 */
const MatrixLeadsView = () => {
  const [consultations, setConsultations] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sh_consultations') || '[]'); } catch (e) { return []; }
  });
  const [requirements, setRequirements] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sh_requirements') || '[]'); } catch (e) { return []; }
  });
  const [subTab, setSubTab] = useState('consultations');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCons = consultations.filter(c => 
    !searchTerm || (c.fullName || c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.service || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReqs = requirements.filter(r => 
    !searchTerm || (r.fullName || r.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.projectType || r.service || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>Authorized CRM &amp; Leads Management</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">
            Client Consultations &amp; Custom Requirements
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Manage incoming inquiries, schedule calls, and monitor project specifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('consultations')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'consultations' ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Consultations ({consultations.length})
          </button>
          <button
            onClick={() => setSubTab('requirements')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'requirements' ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Requirements ({requirements.length})
          </button>
        </div>
      </div>

      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by client name, email, or domain..."
          className="form-input text-xs text-slate-900 bg-slate-50 border border-slate-200 w-full"
        />
      </div>

      {subTab === 'consultations' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCons.length === 0 ? (
            <div className="col-span-full p-12 text-center text-slate-400 font-medium text-xs bg-white rounded-3xl border border-dashed border-slate-200">
              No consultations found matching criteria.
            </div>
          ) : (
            filteredCons.map(c => (
              <div key={c.id || Math.random()} className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{c.fullName || c.name || 'Client Lead'}</h4>
                    <span className="text-xs text-purple-700 font-semibold">{c.service || 'Technology Consultation'}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    {c.status || 'Pending'}
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div><strong>Email:</strong> {c.email || 'N/A'}</div>
                  <div><strong>Phone:</strong> {c.phone || 'N/A'}</div>
                  <div><strong>Preferred Date:</strong> {c.preferredDate || 'Flexible'} • {c.preferredTime || 'Anytime'}</div>
                  {c.notes && <div className="text-slate-500 italic mt-1 text-[11px] bg-slate-50 p-2 rounded-lg">"{c.notes}"</div>}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReqs.length === 0 ? (
            <div className="col-span-full p-12 text-center text-slate-400 font-medium text-xs bg-white rounded-3xl border border-dashed border-slate-200">
              No custom requirements found matching criteria.
            </div>
          ) : (
            filteredReqs.map(r => (
              <div key={r.id || Math.random()} className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{r.fullName || r.clientName || 'Project Lead'}</h4>
                    <span className="text-xs text-blue-700 font-semibold">{r.projectType || r.service || 'Custom Build'}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {r.status || 'Received'}
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div><strong>Budget:</strong> {r.budget || 'Custom Quote'}</div>
                  <div><strong>Timeline:</strong> {r.timeline || 'Immediate'}</div>
                  <div><strong>Contact:</strong> {r.email || r.phone || 'N/A'}</div>
                  {r.description && <div className="text-slate-500 italic mt-1 text-[11px] bg-slate-50 p-2 rounded-lg">"{r.description}"</div>}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const MatrixTasksView = ({ currentUser }) => {
  const [tasksList, setTasksList] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sh_assigned_tasks') || '[]'); } catch (e) { return []; }
  });
  const [team, setTeam] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sh_team_members') || '[]'); } catch (e) { return []; }
  });
  const [isAssigning, setIsAssigning] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    memberId: '',
    deadline: '',
    priority: 'High',
    description: ''
  });

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.memberId) return;
    const taskItem = {
      id: `TASK-${Date.now()}`,
      title: newTask.title,
      memberId: newTask.memberId,
      assignedBy: currentUser?.name || 'Authorized Lead',
      deadline: newTask.deadline || new Date().toISOString().split('T')[0],
      priority: newTask.priority,
      status: 'In Progress',
      description: newTask.description,
      createdAt: new Date().toISOString()
    };
    const updated = [taskItem, ...tasksList];
    setTasksList(updated);
    localStorage.setItem('sh_assigned_tasks', JSON.stringify(updated));
    window.dispatchEvent(new Event('sh_tasks_updated'));
    setIsAssigning(false);
    setNewTask({ title: '', memberId: '', deadline: '', priority: 'High', description: '' });
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 mb-2">
            <Target className="w-3.5 h-3.5 text-blue-600" />
            <span>Authorized Team Tasks &amp; Delegation</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">
            Work Directives &amp; Sprint Deliverables
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Assign deliverables to staff members and review ongoing progress across squads.
          </p>
        </div>

        <button
          onClick={() => setIsAssigning(true)}
          className="btn-primary py-2.5 px-4 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Assign New Task</span>
        </button>
      </div>

      {isAssigning && (
        <form onSubmit={handleCreateTask} className="p-5 bg-white rounded-2xl border border-blue-200 shadow-md space-y-3 text-xs">
          <div className="font-bold text-slate-900 text-sm">Assign New Directive</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Task Title *</label>
              <input
                type="text"
                required
                value={newTask.title}
                onChange={e => setNewTask({...newTask, title: e.target.value})}
                placeholder="e.g. Implement Payment Gateway Integration"
                className="form-input text-xs w-full bg-white border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assign To *</label>
              <select
                required
                value={newTask.memberId}
                onChange={e => setNewTask({...newTask, memberId: e.target.value})}
                className="form-input text-xs w-full bg-white border border-slate-300"
              >
                <option value="">Select Team Member</option>
                {team.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.id} - {m.type})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Deadline *</label>
              <input
                type="date"
                required
                value={newTask.deadline}
                onChange={e => setNewTask({...newTask, deadline: e.target.value})}
                className="form-input text-xs w-full bg-white border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={newTask.priority}
                onChange={e => setNewTask({...newTask, priority: e.target.value})}
                className="form-input text-xs w-full bg-white border border-slate-300"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Detailed Instructions</label>
            <textarea
              rows={2}
              value={newTask.description}
              onChange={e => setNewTask({...newTask, description: e.target.value})}
              placeholder="Provide repository link, acceptance criteria, or branch specifications..."
              className="form-input text-xs w-full bg-white border border-slate-300"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setIsAssigning(false)} className="btn-secondary py-1.5 px-3">Cancel</button>
            <button type="submit" className="btn-primary py-1.5 px-4 font-bold">Assign Task</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasksList.map(t => {
          const assignee = team.find(m => (m.id || '').toUpperCase() === (t.memberId || '').toUpperCase());
          return (
            <div key={t.id || Math.random()} className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    t.priority === 'Critical' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                    t.priority === 'High' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}>
                    {t.priority}
                  </span>
                  <span className={`text-[11px] font-bold ${t.status === 'Completed' ? 'text-emerald-600' : 'text-blue-600'}`}>
                    {t.status}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{t.title}</h4>
                {t.description && <p className="text-xs text-slate-500 line-clamp-2">{t.description}</p>}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                <div>
                  <span className="block text-[10px] text-slate-400">Assigned To</span>
                  <span className="font-bold text-slate-800">{assignee?.name || t.memberId}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] text-slate-400">Deadline</span>
                  <span className="font-mono text-slate-800 font-semibold">{t.deadline || 'Pending'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MatrixWorkshopsView = () => {
  const [workshops] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sh_workshops') || '[]'); } catch (e) { return []; }
  });

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200 mb-2">
          <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
          <span>Authorized Workshops &amp; Training</span>
        </div>
        <h3 className="text-xl font-extrabold text-slate-900">
          Institutional Bootcamps &amp; Industry Workshops
        </h3>
        <p className="text-xs text-slate-500 font-medium">
          Manage corporate training schedules, university hackathons, and certified curriculum cohorts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workshops.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400 font-medium text-xs bg-white rounded-3xl border border-dashed border-slate-200">
            No institutional workshops recorded.
          </div>
        ) : (
          workshops.map(w => (
            <div key={w.id || Math.random()} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{w.title || w.collegeName}</h4>
                  <span className="text-xs text-purple-700 font-semibold">{w.collegeName || w.topic}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  {w.status || 'Active'}
                </span>
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <div><strong>Date:</strong> {w.date || 'Upcoming'}</div>
                <div><strong>Participants:</strong> {w.participantsCount || w.expectedStudents || '100+'}</div>
                <div><strong>Lead Instructor:</strong> {w.instructor || 'Sakith Harvan Core AI Team'}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const MatrixOverviewView = () => {
  const team = JSON.parse(localStorage.getItem('sh_team_members') || '[]');
  const attLogs = getStoredAttendance();
  const todayStr = getLocalDateString(new Date());
  const todayIn = attLogs.filter(l => l.date === todayStr && l.punchIn);
  const leads = JSON.parse(localStorage.getItem('sh_consultations') || '[]');
  const tasks = JSON.parse(localStorage.getItem('sh_assigned_tasks') || '[]');
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const taskPct = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200 mb-2">
          <Flame className="w-3.5 h-3.5 text-purple-600" />
          <span>Delegated Executive Metrics</span>
        </div>
        <h3 className="text-xl font-extrabold text-slate-900">
          Enterprise Operations &amp; Performance Overview
        </h3>
        <p className="text-xs text-slate-500 font-medium">
          Real-time high-level organizational analytics, attendance ratios, and operational health.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Team Headcount</span>
          <div className="text-2xl font-black text-slate-900 font-mono">{team.length}</div>
          <span className="text-[11px] text-blue-600 font-semibold">{team.filter(m => m.type === 'Employee').length} Full-time • {team.filter(m => m.type === 'Intern').length} Interns</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Punched In Today</span>
          <div className="text-2xl font-black text-emerald-600 font-mono">{todayIn.length}</div>
          <span className="text-[11px] text-emerald-700 font-semibold">{team.length > 0 ? Math.round((todayIn.length / team.length) * 100) : 0}% Attendance Rate</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Inbound Leads</span>
          <div className="text-2xl font-black text-purple-600 font-mono">{leads.length}</div>
          <span className="text-[11px] text-purple-700 font-semibold">Active Client Consultations</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Deliverables Done</span>
          <div className="text-2xl font-black text-blue-600 font-mono">{taskPct}%</div>
          <span className="text-[11px] text-slate-500 font-semibold">{completedTasks} of {tasks.length} closed</span>
        </div>
      </div>
    </div>
  );
};
