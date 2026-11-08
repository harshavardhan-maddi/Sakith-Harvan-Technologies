// Enterprise Management Store: Super Admin, Access Matrix, Attendance (Punch In/Out), Leaves, Daily Work Status & Help Requests

export const SUPER_ADMIN_CREDENTIALS = {
  id: 'SASHT',
  password: 'Shtsa@2026'
};

export const SUPER_ADMIN_PROFILE = {
  id: 'SASHT',
  name: 'Super Administrator',
  role: 'Super Administrator & System Controller',
  type: 'Super Admin',
  isExecutive: true,
  email: 'superadmin@sakithharvan.com',
  permissions: {
    all: true,
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
};

export const DEFAULT_PERMISSIONS = {
  admin: {
    view_overview: true,
    manage_leads: true,
    quotation_maker: true,
    manage_tasks: true,
    manage_workshops: true,
    manage_attendance: true,
    manage_leaves: true,
    view_work_status: true,
    manage_access_matrix: false
  },
  founder: {
    all: true,
    view_overview: true,
    manage_leads: true,
    quotation_maker: true,
    manage_tasks: true,
    manage_workshops: true,
    manage_attendance: true,
    manage_leaves: true,
    view_work_status: true,
    manage_access_matrix: true
  },
  employee: {
    my_workspace: true,
    punch_clock: true,
    my_calendar: true,
    apply_leave: true,
    daily_status: true,
    ask_help: true,
    my_tasks: true,
    view_overview: false,
    manage_leads: false,
    quotation_maker: false,
    manage_tasks: false,
    manage_workshops: false,
    manage_attendance: false,
    manage_leaves: false,
    view_work_status: false,
    manage_access_matrix: false
  },
  intern: {
    my_workspace: true,
    punch_clock: true,
    my_calendar: true,
    apply_leave: true,
    daily_status: true,
    ask_help: true,
    my_tasks: true,
    view_overview: false,
    manage_leads: false,
    quotation_maker: false,
    manage_tasks: false,
    manage_workshops: false,
    manage_attendance: false,
    manage_leaves: false,
    view_work_status: false,
    manage_access_matrix: false
  }
};

// Initial Sample Users Directory with Employee & Intern Profiles
export const INITIAL_USERS_DIRECTORY = [
  SUPER_ADMIN_PROFILE,
  {
    id: 'ADMIN-01',
    userId: 'ADMIN-01',
    name: 'Executive Admin',
    role: 'Operations & Leads Administrator',
    type: 'Admin',
    password: '2526@shstsa',
    email: 'admin@sakithharvan.com',
    phone: '+91 9014340739',
    empId: 'ADM-01',
    dob: '1995-04-12',
    joiningDate: '2026-06-01',
    workHours: 8,
    permissions: { ...DEFAULT_PERMISSIONS.admin }
  },
  {
    id: 'CEO-01',
    userId: 'CEO-01',
    name: 'Maddi Harshavardhan',
    role: 'CEO & Co-Founder',
    type: 'Founder & CEO',
    password: 'shtsa@2026',
    email: 'mharshavardhan048@gmail.com',
    phone: '+91 7981847745',
    empId: 'CEO-01',
    dob: '2001-08-15',
    joiningDate: '2026-07-01',
    workHours: 8,
    permissions: { ...DEFAULT_PERMISSIONS.founder }
  },
  {
    id: 'FOUNDER-02',
    userId: 'FOUNDER-02',
    name: 'Thoka Sai Krishna',
    role: 'Founder & MD',
    type: 'Founder & MD',
    password: 'shtsa@2026',
    email: 'saikrishnathoka2526@gmail.com',
    phone: '+91 9014340739',
    empId: 'FND-02',
    dob: '2000-11-20',
    joiningDate: '2026-07-01',
    workHours: 8,
    permissions: { ...DEFAULT_PERMISSIONS.founder }
  },
  {
    id: 'EMP-01',
    userId: 'EMP-01',
    empId: 'EMP-01',
    name: 'K. Rajesh Kumar',
    role: 'Lead Cloud & Backend Architect',
    type: 'Employee',
    password: 'shtsa@2026',
    email: 'rajesh.k@sakithharvan.com',
    phone: '+91 9848011223',
    dob: '1998-05-14',
    joiningDate: '2026-07-10',
    workHours: 5,
    permissions: { ...DEFAULT_PERMISSIONS.employee }
  },
  {
    id: 'EMP-02',
    userId: 'EMP-02',
    empId: 'EMP-02',
    name: 'P. Sneha Latha',
    role: 'Senior UI/UX & Frontend Engineer',
    type: 'Employee',
    password: 'shtsa@2026',
    email: 'sneha.p@sakithharvan.com',
    phone: '+91 9848022334',
    dob: '1999-09-22',
    joiningDate: '2026-07-15',
    workHours: 5,
    permissions: { ...DEFAULT_PERMISSIONS.employee }
  },
  {
    id: 'INT-01',
    userId: 'INT-01',
    internId: 'INT-01',
    name: 'V. Sai Teja',
    role: 'Full Stack & AI Intern',
    domain: 'Full Stack & AI',
    type: 'Intern',
    password: 'shtsa@2026',
    email: 'saiteja.v@intern.sakithharvan.com',
    phone: '+91 9100123456',
    batch: 'Batch 2026-Alpha (AI & ML)',
    dob: '2003-02-18',
    joiningDate: '2026-08-01',
    internshipStartDate: '2026-08-01',
    internshipEndDate: '2026-11-30',
    adminOverride: false,
    workHours: 5,
    assignedProject: {
      title: 'Scammind AI Digital Risk Analyzer',
      description: 'Implement real-time domain threat intelligence webhook pipeline and risk scoring engine.',
      deadline: '2026-10-31'
    },
    permissions: { ...DEFAULT_PERMISSIONS.intern }
  },
  {
    id: 'INT-02',
    userId: 'INT-02',
    internId: 'INT-02',
    name: 'B. Anusha',
    role: 'Generative AI & Agentic Workflows Intern',
    domain: 'Generative AI',
    type: 'Intern',
    password: 'shtsa@2026',
    email: 'anusha.b@intern.sakithharvan.com',
    phone: '+91 9100234567',
    batch: 'Batch 2026-Alpha (AI & ML)',
    dob: '2003-06-25',
    joiningDate: '2026-08-10',
    internshipStartDate: '2026-08-10',
    internshipEndDate: '2026-10-10', // Sample expired internship
    adminOverride: false,
    workHours: 5,
    assignedProject: {
      title: 'CampX Multi-Tenant AI Student Advisor',
      description: 'Build RAG document vectorization pipeline with hybrid BM25 and semantic search.',
      deadline: '2026-10-25'
    },
    permissions: { ...DEFAULT_PERMISSIONS.intern }
  }
];

// Seed Sample Attendance Records for realistic demonstration
const generateSeedAttendance = () => {
  const records = [];
  const today = new Date();
  
  // Seed past 7 days for EMP-01 and INT-01
  for (let i = 6; i >= 1; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const isWeekend = d.getDay() === 0; // Sunday

    if (!isWeekend) {
      if (i === 4) {
        // Yellow: Partial work hours (punched in and punched out, but worked less than target 5 hrs e.g. 3.2 hrs)
        records.push({
          id: `EMP-01_${dateStr}`,
          userId: 'EMP-01',
          userName: 'K. Rajesh Kumar',
          userRole: 'Employee',
          date: dateStr,
          punchInTime: '09:15 AM',
          punchInTimestamp: new Date(`${dateStr}T09:15:00`).getTime(),
          punchOutTime: '12:30 PM',
          punchOutTimestamp: new Date(`${dateStr}T12:30:00`).getTime(),
          totalHours: 3.25,
          targetHours: 5,
          status: 'Partial Work Hours (3.25h / 5h)',
          colorStatus: 'yellow',
          notes: 'Partial shift completed (less than 5 target hours)'
        });
      } else if (i === 3) {
        // Red: Absent day (no punch in for the full day)
        records.push({
          id: `EMP-01_${dateStr}`,
          userId: 'EMP-01',
          userName: 'K. Rajesh Kumar',
          userRole: 'Employee',
          date: dateStr,
          punchInTime: null,
          punchInTimestamp: null,
          punchOutTime: null,
          punchOutTimestamp: null,
          totalHours: 0,
          targetHours: 5,
          status: 'Absent (No Punch-In)',
          colorStatus: 'red',
          notes: 'Full day punch-in missing'
        });
      } else {
        // Green: Completed full target work time (punched in and after 5+ hrs punched out)
        records.push({
          id: `EMP-01_${dateStr}`,
          userId: 'EMP-01',
          userName: 'K. Rajesh Kumar',
          userRole: 'Employee',
          date: dateStr,
          punchInTime: '09:05 AM',
          punchInTimestamp: new Date(`${dateStr}T09:05:00`).getTime(),
          punchOutTime: '02:35 PM',
          punchOutTimestamp: new Date(`${dateStr}T14:35:00`).getTime(),
          totalHours: 5.5,
          targetHours: 5,
          status: 'Completed Target Shift (5.5h / 5h)',
          colorStatus: 'green',
          notes: 'Target 5 hours completed successfully'
        });
      }

      // Also seed for INT-01
      if (i === 2) {
        // Yellow for INT-01
        records.push({
          id: `INT-01_${dateStr}`,
          userId: 'INT-01',
          userName: 'V. Sai Teja',
          userRole: 'Intern',
          date: dateStr,
          punchInTime: '09:30 AM',
          punchInTimestamp: new Date(`${dateStr}T09:30:00`).getTime(),
          punchOutTime: '01:00 PM',
          punchOutTimestamp: new Date(`${dateStr}T13:00:00`).getTime(),
          totalHours: 3.5,
          targetHours: 5,
          status: 'Partial Work Hours (3.5h / 5h)',
          colorStatus: 'yellow',
          notes: 'Worked 3.5 hrs (Target 5 hrs)'
        });
      } else if (i === 5) {
        // Green for INT-01
        records.push({
          id: `INT-01_${dateStr}`,
          userId: 'INT-01',
          userName: 'V. Sai Teja',
          userRole: 'Intern',
          date: dateStr,
          punchInTime: '09:10 AM',
          punchInTimestamp: new Date(`${dateStr}T09:10:00`).getTime(),
          punchOutTime: '02:40 PM',
          punchOutTimestamp: new Date(`${dateStr}T14:40:00`).getTime(),
          totalHours: 5.5,
          targetHours: 5,
          status: 'Completed Target Shift (5.5h / 5h)',
          colorStatus: 'green',
          notes: 'Target 5 hours completed'
        });
      }
    }
  }

  return records;
};

// Seed Sample Leaves
const INITIAL_LEAVES = [
  {
    id: 'LV-101',
    userId: 'EMP-02',
    userName: 'P. Sneha Latha',
    userRole: 'Employee',
    appliedDate: '2026-10-07',
    startDate: '2026-10-14',
    endDate: '2026-10-15',
    purpose: 'Attending IEEE AI System Architecture Conference in Hyderabad',
    status: 'Approved',
    adminNotes: 'Approved by Founders. Good academic presentation.'
  },
  {
    id: 'LV-102',
    userId: 'INT-01',
    userName: 'V. Sai Teja',
    userRole: 'Intern',
    appliedDate: '2026-10-08',
    startDate: '2026-10-12',
    endDate: '2026-10-12',
    purpose: 'University Semester Lab Examination',
    status: 'Pending',
    adminNotes: ''
  }
];

// Seed Sample Daily Work Statuses
const INITIAL_DAILY_STATUSES = [
  {
    id: 'DWS-1',
    userId: 'EMP-01',
    userName: 'K. Rajesh Kumar',
    userRole: 'Employee',
    date: new Date().toISOString().split('T')[0],
    tasksDone: 'Refactored CampX multi-tenant PostgreSQL database migrations and integrated Redis session store.',
    deliverablesUrl: 'https://github.com/sakith-harvan/campx-core/pull/42',
    blockers: 'None. Azure container registry webhook is tested.',
    nextPlan: 'Implement biometric hardware webhook endpoint for AttendEase.',
    timestamp: new Date().toLocaleTimeString()
  },
  {
    id: 'DWS-2',
    userId: 'INT-01',
    userName: 'V. Sai Teja',
    userRole: 'Intern',
    date: new Date().toISOString().split('T')[0],
    tasksDone: 'Built prompt chaining pipeline with Anthropic Claude 3.5 Sonnet for automated quotation calculation.',
    deliverablesUrl: 'https://github.com/sakith-harvan/agentic-pipeline',
    blockers: 'Awaiting API quota increase for high-throughput stress testing.',
    nextPlan: 'Benchmarking latency against local Ollama models.',
    timestamp: new Date().toLocaleTimeString()
  }
];

// Seed Sample Help Requests
const INITIAL_HELP_REQUESTS = [
  {
    id: 'HLP-1',
    userId: 'INT-02',
    userName: 'B. Anusha',
    userRole: 'Intern',
    category: 'Technical Help & Code Review',
    description: 'Need architectural guidance on vector embeddings chunking strategy for large PDF transcripts in CampX SIS module.',
    urgency: 'Medium',
    status: 'In Review',
    date: new Date().toISOString().split('T')[0],
    adminResponse: 'Founder Maddi Harshavardhan scheduled technical mentoring session at 4:30 PM.'
  }
];

// -----------------------------------------------------------------------------
// LOCAL STORAGE STORE MANAGEMENT
// -----------------------------------------------------------------------------

export const getStoredUsers = () => {
  try {
    const raw = localStorage.getItem('sh_users_directory');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_USERS_DIRECTORY;
};

export const saveUsersDirectory = (users) => {
  localStorage.setItem('sh_users_directory', JSON.stringify(users));
  window.dispatchEvent(new Event('sh_users_updated'));
};

export const getStoredAttendance = () => {
  try {
    const raw = localStorage.getItem('sh_attendance_logs');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return generateSeedAttendance();
};

export const saveAttendanceLogs = (logs) => {
  localStorage.setItem('sh_attendance_logs', JSON.stringify(logs));
  window.dispatchEvent(new Event('sh_attendance_updated'));
};

export const getStoredLeaves = () => {
  try {
    const raw = localStorage.getItem('sh_leave_applications');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_LEAVES;
};

export const saveLeaveApplications = (leaves) => {
  localStorage.setItem('sh_leave_applications', JSON.stringify(leaves));
  window.dispatchEvent(new Event('sh_leaves_updated'));
};

export const getStoredDailyStatus = () => {
  try {
    const raw = localStorage.getItem('sh_daily_work_status');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_DAILY_STATUSES;
};

export const saveDailyWorkStatus = (statuses) => {
  localStorage.setItem('sh_daily_work_status', JSON.stringify(statuses));
  window.dispatchEvent(new Event('sh_daily_status_updated'));
};

export const getStoredHelpRequests = () => {
  try {
    const raw = localStorage.getItem('sh_help_requests');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_HELP_REQUESTS;
};

export const saveHelpRequests = (requests) => {
  localStorage.setItem('sh_help_requests', JSON.stringify(requests));
  window.dispatchEvent(new Event('sh_help_updated'));
};

// -----------------------------------------------------------------------------
// INTERN TENURE VALIDATION & ADMIN OVERRIDE ENGINE
// -----------------------------------------------------------------------------
/**
 * Rule: "interns can be added with internship period (by selecting dates)
 * if the date crosses no login works. But login remains, if also wanted then admin only can override it."
 */
export const checkInternAccess = (user) => {
  if (!user || (user.type || '').toLowerCase() !== 'intern') {
    return { allowed: true, isExpired: false, isOverridden: false };
  }

  const endDate = user.internshipEndDate || user.endDate;
  if (!endDate) {
    return { allowed: true, isExpired: false, isOverridden: false };
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const isExpired = todayStr > endDate;

  if (isExpired && !user.adminOverride) {
    return {
      allowed: false,
      isExpired: true,
      isOverridden: false,
      reason: `Internship tenure ended on ${endDate}. Login access is paused by company policy. Your login account remains saved in the system. Please contact Admin to override or extend your internship.`
    };
  }

  return {
    allowed: true,
    isExpired: isExpired,
    isOverridden: isExpired && !!user.adminOverride,
    message: isExpired ? `Active via Admin Override (Tenure ended on ${endDate})` : null
  };
};

export const toggleInternOverride = (userId, forcedState = null) => {
  // Update in sh_users_directory
  const users = getStoredUsers();
  const updatedUsers = users.map(u => {
    if (u.id === userId || u.userId === userId || u.internId === userId) {
      const nextOverride = forcedState !== null ? forcedState : !u.adminOverride;
      return { ...u, adminOverride: nextOverride };
    }
    return u;
  });
  saveUsersDirectory(updatedUsers);

  // Update in sh_team_members
  try {
    const rawTeam = localStorage.getItem('sh_team_members');
    if (rawTeam) {
      const team = JSON.parse(rawTeam);
      const updatedTeam = team.map(m => {
        if (m.id === userId || m.userId === userId || m.internId === userId) {
          const nextOverride = forcedState !== null ? forcedState : !m.adminOverride;
          return { ...m, adminOverride: nextOverride };
        }
        return m;
      });
      localStorage.setItem('sh_team_members', JSON.stringify(updatedTeam));
      window.dispatchEvent(new Event('sh_team_updated'));
    }
  } catch (e) {
    console.error(e);
  }
};

/**
 * Allows admin to modify daily target work hours after onboarding an employee or intern
 * Updates in sh_users_directory and sh_team_members, and dispatches real-time update events.
 */
export const updateCandidateWorkHours = (userId, newHours) => {
  const hours = Math.max(1, Math.min(16, parseFloat(newHours) || 5));
  const uidUpper = (userId || '').trim().toUpperCase();

  // 1. Update in sh_users_directory
  const users = getStoredUsers();
  const updatedUsers = users.map(u => {
    const uId = (u.id || u.userId || u.empId || u.internId || '').toUpperCase();
    if (uId === uidUpper) {
      return { ...u, workHours: hours };
    }
    return u;
  });
  saveUsersDirectory(updatedUsers);

  // 2. Update in sh_team_members
  try {
    const rawTeam = localStorage.getItem('sh_team_members');
    if (rawTeam) {
      const team = JSON.parse(rawTeam);
      const updatedTeam = team.map(m => {
        const mId = (m.id || m.userId || m.empId || m.internId || '').toUpperCase();
        if (mId === uidUpper) {
          return { ...m, workHours: hours };
        }
        return m;
      });
      localStorage.setItem('sh_team_members', JSON.stringify(updatedTeam));
      window.dispatchEvent(new Event('sh_team_updated'));
    }
  } catch (e) {
    console.error(e);
  }

  // 3. Dispatch global events
  window.dispatchEvent(new Event('sh_users_updated'));
  window.dispatchEvent(new Event('sh_attendance_updated'));

  return hours;
};

/**
 * Synchronizes user permissions across both sh_users_directory and sh_team_members
 */
export const syncUserPermissions = (userId, permissions) => {
  const uidUpper = (userId || '').trim().toUpperCase();

  // 1. Update in sh_users_directory
  const users = getStoredUsers();
  const updatedUsers = users.map(u => {
    const uId = (u.id || u.userId || u.empId || u.internId || '').toUpperCase();
    if (uId === uidUpper) {
      return { ...u, permissions: { ...(u.permissions || {}), ...permissions } };
    }
    return u;
  });
  saveUsersDirectory(updatedUsers);

  // 2. Update in sh_team_members
  try {
    const rawTeam = localStorage.getItem('sh_team_members');
    if (rawTeam) {
      const team = JSON.parse(rawTeam);
      const updatedTeam = team.map(m => {
        const mId = (m.id || m.userId || m.empId || m.internId || '').toUpperCase();
        if (mId === uidUpper) {
          return { ...m, permissions: { ...(m.permissions || {}), ...permissions } };
        }
        return m;
      });
      localStorage.setItem('sh_team_members', JSON.stringify(updatedTeam));
      window.dispatchEvent(new Event('sh_team_updated'));
    }
  } catch (e) {
    console.error(e);
  }

  window.dispatchEvent(new Event('sh_users_updated'));
};

// Helper to format local date string strictly without UTC offset drift
export const getLocalDateString = (d = new Date()) => {
  const dateObj = d instanceof Date ? d : new Date(d);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// -----------------------------------------------------------------------------
// PUNCH IN & PUNCH OUT LOGIC WITH EXACT USER RULES
// -----------------------------------------------------------------------------
/**
 * Rule 1: Every one (emp or intern) should punch in every day and punch out too.
 * Rule 2: If work time is 5hrs (or assigned workHours) and they complete the time:
 *         punch in and then after 5hr punch out -> GREEN color on that date.
 * Rule 3: If not completes (punched in and punched out, but < workHours) -> YELLOW color.
 * Rule 4: If not punched in for the full day -> RED color.
 * Rule 5: After punch out, update daily work status: completed tasks & tomorrow goals.
 */
export const recordPunchIn = (user) => {
  const logs = getStoredAttendance();
  const today = new Date();
  const dateStr = getLocalDateString(today);
  const timeStr = today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const targetWorkHours = parseFloat(user.workHours) || (user.type === 'Intern' ? 5 : 8);

  // Check if already punched in today
  const existingIndex = logs.findIndex(r => (r.userId === user.id || r.userId === user.userId) && r.date === dateStr);
  if (existingIndex >= 0 && logs[existingIndex].punchInTime) {
    return { success: false, message: 'You have already punched in today at ' + logs[existingIndex].punchInTime };
  }

  // Check 9 AM advisory rule
  const currentHour = today.getHours();
  const isBefore9AM = currentHour < 9;
  const earlyNote = isBefore9AM ? 'Punched in before 9:00 AM (Early Shift)' : 'Standard Shift Punch-In';

  const newRecord = {
    id: `${user.id || user.userId}_${dateStr}`,
    userId: user.id || user.userId,
    userName: user.name,
    userRole: user.type || 'Employee',
    targetHours: targetWorkHours,
    date: dateStr,
    punchInTime: timeStr,
    punchInTimestamp: today.getTime(),
    punchOutTime: null,
    punchOutTimestamp: null,
    totalHours: 0,
    status: 'In Progress (Start Your Work)',
    colorStatus: 'blue', // currently active session
    notes: earlyNote
  };

  const updatedLogs = [newRecord, ...logs.filter(r => r.id !== newRecord.id)];
  saveAttendanceLogs(updatedLogs);

  return { 
    success: true, 
    record: newRecord,
    targetWorkHours,
    warning: isBefore9AM ? 'Notice: Standard office working hours commence after 9:00 AM.' : null 
  };
};

export const recordPunchOut = (user, dailyWorkStatus = null) => {
  const logs = getStoredAttendance();
  const today = new Date();
  const dateStr = getLocalDateString(today);
  const timeStr = today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const uid = user.id || user.userId;

  const recordIndex = logs.findIndex(r => (r.userId === uid || r.userId === user.id) && r.date === dateStr);
  if (recordIndex < 0 || !logs[recordIndex].punchInTimestamp) {
    return { success: false, message: 'You have not punched in today yet. Please punch in first.' };
  }

  const record = logs[recordIndex];
  if (record.punchOutTime) {
    return { success: false, message: 'You have already punched out today at ' + record.punchOutTime };
  }

  const outTimestamp = today.getTime();
  const diffMs = outTimestamp - record.punchInTimestamp;
  const hoursWorked = Math.max(0.05, parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2)));
  const targetHours = parseFloat(record.targetHours || user.workHours) || (user.type === 'Intern' ? 5 : 8);

  // Exact rule evaluation:
  // If completes work time (hoursWorked >= targetHours) -> GREEN
  // If not completes (< targetHours) -> YELLOW
  let colorStatus = 'green';
  let statusText = `Completed Target (${hoursWorked}h / ${targetHours}h)`;

  if (hoursWorked >= targetHours) {
    colorStatus = 'green';
    statusText = `Completed Target Shift (${hoursWorked}h / ${targetHours}h)`;
  } else {
    colorStatus = 'yellow';
    statusText = `Partial Work Hours (${hoursWorked}h / ${targetHours}h)`;
  }

  const updatedRecord = {
    ...record,
    punchOutTime: timeStr,
    punchOutTimestamp: outTimestamp,
    totalHours: hoursWorked,
    targetHours: targetHours,
    status: statusText,
    colorStatus: colorStatus,
    notes: `Worked ${hoursWorked} hrs of ${targetHours} hrs target. Punched out at ${timeStr}.`
  };

  logs[recordIndex] = updatedRecord;
  saveAttendanceLogs(logs);

  // If daily work status update passed, record it automatically
  if (dailyWorkStatus) {
    const allStatuses = getStoredDailyStatus();
    const newStatusEntry = {
      id: `DWS-${Date.now()}`,
      userId: uid,
      userName: user.name,
      userRole: user.type || 'Employee',
      date: dateStr,
      tasksDone: dailyWorkStatus.tasksDone || '',
      tomorrowGoals: dailyWorkStatus.tomorrowGoals || '',
      deliverablesUrl: dailyWorkStatus.deliverablesUrl || '',
      blockers: dailyWorkStatus.blockers || '',
      hoursWorked: hoursWorked,
      timestamp: timeStr
    };
    saveDailyWorkStatus([newStatusEntry, ...allStatuses]);
  }

  return { 
    success: true, 
    record: updatedRecord,
    hoursWorked,
    targetHours,
    colorStatus
  };
};

// -----------------------------------------------------------------------------
// CALENDAR & MONTHLY STATS EVALUATION HELPER FOR EMPLOYEE / INTERN DASHBOARD
// -----------------------------------------------------------------------------
/**
 * Generates monthly grid box days with exact color status:
 * - GREEN: Completed target work time (>= targetHours)
 * - YELLOW: Partial work hours (< targetHours)
 * - RED: Absent (no punch-in on past working day)
 * - BLUE: Active session today (currently punched in)
 * - GRAY: Weekend or upcoming date
 *
 * Also computes Monthly Statistics:
 * - How many days they are absent
 * - Partial work hours they done
 * - How many hours they worked in that month
 */
export const getEmployeeCalendarDays = (userId, year, month, userTargetHours = null) => {
  const logs = getStoredAttendance();
  const allDailyStatuses = getStoredDailyStatus();
  
  const userLogs = logs.filter(r => r.userId === userId);
  const userStatuses = allDailyStatuses.filter(s => s.userId === userId);

  const logMap = {};
  userLogs.forEach(l => {
    logMap[l.date] = l;
  });

  const statusMap = {};
  userStatuses.forEach(s => {
    statusMap[s.date] = s;
  });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const todayStr = getLocalDateString(today);

  const calendarDays = [];

  const approvedLeaves = getStoredLeaves().filter(l => 
    ((l.userId || '').toUpperCase() === (userId || '').toUpperCase()) && 
    l.status === 'Approved'
  );

  let absentDaysCount = 0;
  let partialDaysCount = 0;
  let partialHoursSum = 0;
  let totalHoursWorkedSum = 0;
  let completedDaysCount = 0;
  let leaveDaysCount = 0;

  const fallbackTarget = parseFloat(userTargetHours) || 5;

  for (let day = 1; day <= daysInMonth; day++) {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${monthStr}-${dayStr}`;
    const d = new Date(year, month, day);
    const dayOfWeek = d.getDay(); // 0 is Sunday
    const isPast = d < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const isToday = dateStr === todayStr;
    const isWeekend = dayOfWeek === 0; // Sunday holiday

    const record = logMap[dateStr];
    const dailyStatus = statusMap[dateStr] || null;

    // Check if user is on approved leave on this date
    const isOnLeave = approvedLeaves.some(l => dateStr >= l.startDate && dateStr <= l.endDate);

    let color = 'gray'; // future or weekend
    let status = isWeekend ? 'Weekend Off' : 'Upcoming';

    if (isOnLeave) {
      color = 'leave';
      status = 'On Approved Leave';
      leaveDaysCount++;
    } else if (record) {
      const target = parseFloat(record.targetHours || fallbackTarget);
      if (record.punchInTime && !record.punchOutTime) {
        // Punched in today, session active
        color = 'blue';
        status = 'In Progress (Active Shift)';
      } else if (record.punchOutTime) {
        totalHoursWorkedSum += (record.totalHours || 0);

        if (record.totalHours >= target) {
          color = 'green';
          status = `Completed Target (${record.totalHours}h / ${target}h)`;
          completedDaysCount++;
        } else {
          color = 'yellow';
          status = `Partial Work Hours (${record.totalHours}h / ${target}h)`;
          partialDaysCount++;
          partialHoursSum += (record.totalHours || 0);
        }
      } else if (record.colorStatus === 'red') {
        color = 'red';
        status = 'Absent (No Punch-In)';
        absentDaysCount++;
      }
    } else if (isPast && !isWeekend) {
      // Past working day with no punch-in -> RED absent
      color = 'red';
      status = 'Absent (No Punch-In)';
      absentDaysCount++;
    } else if (isToday) {
      color = 'gray';
      status = 'Pending Punch-In Today';
    }

    const DOW_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    calendarDays.push({
      day,
      dow: DOW_NAMES[dayOfWeek],
      date: dateStr,
      dayOfWeek,
      isWeekend,
      isToday,
      isPast,
      color,
      status,
      record: record || null,
      dailyStatus: dailyStatus
    });
  }

  return {
    calendarDays,
    summaryStats: {
      absentDays: absentDaysCount,
      partialDays: partialDaysCount,
      partialHoursWorked: parseFloat(partialHoursSum.toFixed(2)),
      totalHoursWorked: parseFloat(totalHoursWorkedSum.toFixed(2)),
      completedDays: completedDaysCount,
      leaveDays: leaveDaysCount,
      targetHours: fallbackTarget
    }
  };
};
