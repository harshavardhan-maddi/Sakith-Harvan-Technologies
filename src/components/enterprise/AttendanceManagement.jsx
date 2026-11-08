import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, Calendar, Users, CheckCircle2, AlertTriangle, 
  Search, Filter, RefreshCw, Eye, ArrowUpRight, Timer, AlertCircle,
  ChevronLeft, ChevronRight, Download, UserCheck, UserX, FileText, 
  Sparkles, LogIn, LogOut, X, ShieldAlert, Award, CalendarDays
} from 'lucide-react';
import { 
  getStoredAttendance, 
  saveAttendanceLogs, 
  getStoredUsers, 
  getStoredLeaves, 
  getStoredDailyStatus, 
  getLocalDateString,
  updateCandidateWorkHours
} from '../../lib/enterprisePortalStore';
import { INITIAL_TEAM_MEMBERS } from '../../data/defaultData';

export const AttendanceManagement = () => {
  const todayStr = getLocalDateString(new Date());
  
  // Primary State: Default to Current Day
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [logs, setLogs] = useState(getStoredAttendance());
  const [leaves, setLeaves] = useState(getStoredLeaves());
  const [users, setUsers] = useState(getStoredUsers());
  const [dailyStatuses, setDailyStatuses] = useState(getStoredDailyStatus());

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('All'); // 'All', 'Employee', 'Intern'
  const [filterStatus, setFilterStatus] = useState('All'); // 'All', 'unpunched', 'active', 'green', 'yellow', 'leave'
  const [viewMode, setViewMode] = useState('daily'); // 'daily' (primary day view) | 'all_history' (audit log)
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isEditingWorkHours, setIsEditingWorkHours] = useState(false);
  const [editWorkHoursInput, setEditWorkHoursInput] = useState(5);

  // Sync listener on storage changes
  useEffect(() => {
    const handleAttendanceUpdate = () => setLogs(getStoredAttendance());
    const handleLeavesUpdate = () => setLeaves(getStoredLeaves());
    const handleUsersUpdate = () => setUsers(getStoredUsers());
    const handleStatusUpdate = () => setDailyStatuses(getStoredDailyStatus());

    window.addEventListener('sh_attendance_updated', handleAttendanceUpdate);
    window.addEventListener('sh_leaves_updated', handleLeavesUpdate);
    window.addEventListener('sh_users_updated', handleUsersUpdate);
    window.addEventListener('sh_daily_status_updated', handleStatusUpdate);

    return () => {
      window.removeEventListener('sh_attendance_updated', handleAttendanceUpdate);
      window.removeEventListener('sh_leaves_updated', handleLeavesUpdate);
      window.removeEventListener('sh_users_updated', handleUsersUpdate);
      window.removeEventListener('sh_daily_status_updated', handleStatusUpdate);
    };
  }, []);

  // Aggregate all unique active candidates across directory, stored team & defaults
  const allCandidates = useMemo(() => {
    let storedTeam = [];
    try {
      const raw = localStorage.getItem('sh_team_members');
      if (raw) storedTeam = JSON.parse(raw);
    } catch (e) {}

    const candidateMap = new Map();

    const registerCandidate = (c) => {
      if (!c) return;
      const uid = (c.id || c.userId || c.empId || c.internId || '').trim();
      if (!uid) return;
      const upperId = uid.toUpperCase();

      // Exclude Super Administrator system controller from standard punching roster
      if (upperId === 'SASHT') return;

      const normalizedRole = c.role || (c.type === 'Intern' ? 'Intern' : 'Employee');
      const normalizedType = c.type || (upperId.startsWith('INT') ? 'Intern' : 'Employee');
      const workHours = parseFloat(c.workHours) || (normalizedType.toLowerCase() === 'intern' ? 5 : 8);

      if (!candidateMap.has(upperId)) {
        candidateMap.set(upperId, {
          id: uid,
          userId: uid,
          name: c.name || 'Staff Member',
          role: normalizedRole,
          type: normalizedType,
          batch: c.batch || c.team || c.department || c.domain || 'Engineering & Operations',
          workHours: workHours,
          email: c.email || '',
          phone: c.phone || '',
          joinedDate: c.joiningDate || c.joinedDate || '2026-07-01'
        });
      } else {
        const existing = candidateMap.get(upperId);
        candidateMap.set(upperId, {
          ...existing,
          name: existing.name || c.name,
          role: existing.role || normalizedRole,
          batch: existing.batch || c.batch || c.team || c.department,
          workHours: existing.workHours || workHours
        });
      }
    };

    users.forEach(registerCandidate);
    storedTeam.forEach(registerCandidate);
    INITIAL_TEAM_MEMBERS.forEach(registerCandidate);

    return Array.from(candidateMap.values());
  }, [users]);

  // Date helper navigation
  const isToday = selectedDate === todayStr;
  const isPast = selectedDate < todayStr;
  const isFuture = selectedDate > todayStr;

  const handleStepDay = (delta) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + delta);
    setSelectedDate(getLocalDateString(dateObj));
  };

  const formattedSelectedDate = useMemo(() => {
    try {
      const [y, m, d] = selectedDate.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  // Compute Selected Date Roster with strict sorting:
  // TOP: Not punched in yet (Priority 0)
  // MIDDLE: On approved leave (Priority 1)
  // BOTTOM: Punched in (Priority 2)
  const rosterForDate = useMemo(() => {
    return allCandidates.map((candidate) => {
      const candIdUpper = candidate.id.toUpperCase();

      // Find attendance log for this candidate on selectedDate
      const log = logs.find((r) => {
        const rDate = r.date;
        const rUid = (r.userId || r.id || '').toUpperCase();
        return rDate === selectedDate && (rUid === candIdUpper || rUid.startsWith(candIdUpper + '_') || r.id === `${candidate.id}_${selectedDate}`);
      });

      // Find approved leave on selectedDate
      const leave = leaves.find((l) => {
        const lUid = (l.userId || '').toUpperCase();
        return lUid === candIdUpper && l.status === 'Approved' && l.startDate <= selectedDate && l.endDate >= selectedDate;
      });

      // Find daily work status on selectedDate
      const dailyStatus = dailyStatuses.find((s) => {
        const sUid = (s.userId || '').toUpperCase();
        return sUid === candIdUpper && s.date === selectedDate;
      });

      const hasPunchedIn = Boolean(log && log.punchInTime);
      const isOnLeave = Boolean(leave);

      let statusKey = 'unpunched';
      let statusLabel = isToday ? 'Not Punched In Yet' : isPast ? 'Absent (No Punch-In)' : 'Scheduled';
      let colorStatus = isToday ? 'red' : isPast ? 'red' : 'slate';
      let sortPriority = 0; // 0 = TOP (Not Punched In)

      if (isOnLeave) {
        statusKey = 'leave';
        statusLabel = `On Leave (${leave.purpose?.slice(0, 26) || 'Approved'}...)`;
        colorStatus = 'purple';
        sortPriority = 1; // Middle
      } else if (hasPunchedIn) {
        sortPriority = 2; // BOTTOM (Punched in)
        if (log.punchOutTime) {
          const hours = Number(log.totalHours) || 0;
          const target = Number(candidate.workHours) || 5;
          if (hours >= target || log.colorStatus === 'green') {
            statusKey = 'green';
            statusLabel = `Target Completed (${hours}h / ${target}h)`;
            colorStatus = 'green';
          } else {
            statusKey = 'yellow';
            statusLabel = `Partial Shift (${hours}h / ${target}h)`;
            colorStatus = 'yellow';
          }
        } else {
          statusKey = 'active';
          statusLabel = 'Active On Duty (Punched In)';
          colorStatus = 'blue';
        }
      }

      return {
        ...candidate,
        attendanceLog: log || null,
        leaveRecord: leave || null,
        dailyStatus: dailyStatus || null,
        hasPunchedIn,
        isOnLeave,
        statusKey,
        statusLabel,
        colorStatus,
        sortPriority,
        punchInTime: log?.punchInTime || null,
        punchOutTime: log?.punchOutTime || null,
        totalHours: log?.totalHours || 0
      };
    }).sort((a, b) => {
      // 1. Unpunched on top (sortPriority 0), Leave in middle (1), Punched in bottom (2)
      if (a.sortPriority !== b.sortPriority) {
        return a.sortPriority - b.sortPriority;
      }
      // 2. If both are punched in, show active sessions first
      if (a.hasPunchedIn && b.hasPunchedIn) {
        if (!a.punchOutTime && b.punchOutTime) return -1;
        if (a.punchOutTime && !b.punchOutTime) return 1;
      }
      // 3. Alphabetical by candidate name
      return a.name.localeCompare(b.name);
    });
  }, [allCandidates, logs, leaves, dailyStatuses, selectedDate, isToday, isPast]);

  // Filtered Roster according to user inputs
  const filteredRoster = useMemo(() => {
    return rosterForDate.filter((cand) => {
      // Search Match
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        cand.name.toLowerCase().includes(q) ||
        cand.id.toLowerCase().includes(q) ||
        (cand.role || '').toLowerCase().includes(q) ||
        (cand.batch || '').toLowerCase().includes(q);

      // Role Filter
      const matchRole = filterRole === 'All' || 
        cand.type?.toLowerCase() === filterRole.toLowerCase() ||
        (filterRole === 'Intern' && (cand.id.startsWith('INT') || (cand.role || '').toLowerCase().includes('intern'))) ||
        (filterRole === 'Employee' && (cand.id.startsWith('EMP') || (cand.role || '').toLowerCase().includes('employee')));

      // Status Filter
      let matchStatus = filterStatus === 'All';
      if (!matchStatus) {
        if (filterStatus === 'unpunched') matchStatus = !cand.hasPunchedIn && !cand.isOnLeave;
        else if (filterStatus === 'punched') matchStatus = cand.hasPunchedIn;
        else if (filterStatus === 'active') matchStatus = cand.hasPunchedIn && !cand.punchOutTime;
        else if (filterStatus === 'green') matchStatus = cand.colorStatus === 'green';
        else if (filterStatus === 'yellow') matchStatus = cand.colorStatus === 'yellow';
        else if (filterStatus === 'leave') matchStatus = cand.isOnLeave;
      }

      return matchSearch && matchRole && matchStatus;
    });
  }, [rosterForDate, searchQuery, filterRole, filterStatus]);

  // Aggregate Metrics for Selected Date
  const metrics = useMemo(() => {
    const total = rosterForDate.length;
    const notPunched = rosterForDate.filter(c => !c.hasPunchedIn && !c.isOnLeave).length;
    const punched = rosterForDate.filter(c => c.hasPunchedIn).length;
    const active = rosterForDate.filter(c => c.hasPunchedIn && !c.punchOutTime).length;
    const green = rosterForDate.filter(c => c.colorStatus === 'green').length;
    const yellow = rosterForDate.filter(c => c.colorStatus === 'yellow').length;
    const onLeave = rosterForDate.filter(c => c.isOnLeave).length;

    return { total, notPunched, punched, active, green, yellow, onLeave };
  }, [rosterForDate]);

  // Admin Quick Action: Punch In for candidate
  const handleAdminQuickPunchIn = (candidate) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newRecord = {
      id: `${candidate.id}_${selectedDate}`,
      userId: candidate.id,
      userName: candidate.name,
      userRole: candidate.type || candidate.role,
      date: selectedDate,
      punchInTime: timeStr,
      punchInTimestamp: now.getTime(),
      punchOutTime: null,
      punchOutTimestamp: null,
      totalHours: 0,
      targetHours: candidate.workHours || 5,
      status: 'Active Session (Admin Punched)',
      colorStatus: 'blue',
      notes: 'Punched in directly by Admin'
    };

    const existingIdx = logs.findIndex(r => 
      r.date === selectedDate && (r.userId?.toUpperCase() === candidate.id.toUpperCase() || r.id === newRecord.id)
    );

    let updated = [...logs];
    if (existingIdx >= 0) {
      updated[existingIdx] = { ...updated[existingIdx], ...newRecord };
    } else {
      updated.unshift(newRecord);
    }

    saveAttendanceLogs(updated);
    setLogs(updated);
  };

  // Admin Quick Action: Punch Out for candidate
  const handleAdminQuickPunchOut = (candidate) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const existingLog = candidate.attendanceLog;
    
    const punchInTs = existingLog?.punchInTimestamp || (existingLog?.punchInTime ? new Date(`${selectedDate} ${existingLog.punchInTime}`).getTime() : now.getTime() - 5 * 3600000);
    const durationHours = Math.max(0.2, Number(((now.getTime() - punchInTs) / (1000 * 60 * 60)).toFixed(2)));
    const target = candidate.workHours || 5;
    const isCompleted = durationHours >= target;

    const updatedLog = {
      ...existingLog,
      punchOutTime: timeStr,
      punchOutTimestamp: now.getTime(),
      totalHours: durationHours,
      status: isCompleted ? `Completed Target (${durationHours}h / ${target}h)` : `Partial Work Hours (${durationHours}h / ${target}h)`,
      colorStatus: isCompleted ? 'green' : 'yellow',
      notes: (existingLog?.notes || '') + ' • Punched out by Admin'
    };

    const updated = logs.map(r => r.id === existingLog.id ? updatedLog : r);
    saveAttendanceLogs(updated);
    setLogs(updated);
  };

  // CSV Export for Selected Date
  const handleExportCSV = () => {
    const headers = ['Date', 'Candidate ID', 'Staff Name', 'Role', 'Batch/Domain', 'Punch In Time', 'Punch Out Time', 'Duration (hrs)', 'Target (hrs)', 'Attendance Status'];
    const rows = filteredRoster.map(c => [
      selectedDate,
      c.id,
      `"${c.name}"`,
      c.type || c.role,
      `"${c.batch || ''}"`,
      c.punchInTime || 'Not Punched',
      c.punchOutTime || '—',
      c.totalHours || 0,
      c.workHours || 5,
      `"${c.statusLabel}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Harvan_Attendance_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          PRIMARY DATE SELECTOR & VIEW BAR
         ========================================================================= */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Left: Current View Indicator */}
        <div className="flex items-center gap-3.5 w-full lg:w-auto">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 shadow-xs">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Daily Attendance Roster
              </h2>
              {isToday ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500 text-white shadow-xs animate-pulse">
                  Today (Primary)
                </span>
              ) : isPast ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  Past Record
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Future Schedule
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {formattedSelectedDate} • Showing {filteredRoster.length} candidates
            </p>
          </div>
        </div>

        {/* Center: Interactive Date Selector Controls */}
        <div className="flex items-center flex-wrap gap-2 w-full lg:w-auto justify-center">
          <button
            onClick={() => handleStepDay(-1)}
            title="Previous Day"
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="py-2 px-3 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all shadow-xs"
            />
          </div>

          <button
            onClick={() => handleStepDay(1)}
            title="Next Day"
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setSelectedDate(todayStr)}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all shadow-xs ${
              isToday 
                ? 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700' 
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Today
          </button>
        </div>

        {/* Right: Export & Toggle Actions */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold inline-flex items-center gap-1.5 transition-colors border border-slate-200"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setViewMode(viewMode === 'daily' ? 'all_history' : 'daily')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all border ${
              viewMode === 'all_history'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{viewMode === 'daily' ? 'Audit All History' : 'Back to Day View'}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          METRICS BANNER FOR SELECTED DATE
         ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* 1. NOT PUNCHED IN YET (PRIORITY ALERT) */}
        <div className="bg-gradient-to-br from-rose-50 to-white p-4 rounded-2xl border-2 border-rose-200/90 shadow-xs space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-rose-700 uppercase tracking-wider">
              Not Punched In
            </span>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-rose-600 text-white">
              TOP PRIORITY
            </span>
          </div>
          <div className="text-3xl font-black text-rose-600 font-mono flex items-baseline gap-2">
            {metrics.notPunched}
            <span className="text-xs font-normal text-rose-500 font-sans">/ {metrics.total} candidates</span>
          </div>
          <div className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
            <span>Pending arrivals at top of list</span>
          </div>
        </div>

        {/* 2. PUNCHED IN / PRESENT */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
          <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
            Punched In Today
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">
            {metrics.punched}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{metrics.active} active on duty now</span>
          </div>
        </div>

        {/* 3. TARGET COMPLETED (GREEN) */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs space-y-1">
          <div className="text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-wider">
            Completed Target
          </div>
          <div className="text-3xl font-black text-emerald-600 font-mono">
            {metrics.green}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium">
            Full shift completed (&gt;= target hrs)
          </div>
        </div>

        {/* 4. PARTIAL WORK HOURS (YELLOW) */}
        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs space-y-1">
          <div className="text-[10px] font-mono font-bold text-amber-700 uppercase tracking-wider">
            Partial Work Hours
          </div>
          <div className="text-3xl font-black text-amber-500 font-mono">
            {metrics.yellow}
          </div>
          <div className="text-[11px] text-amber-600 font-medium">
            Punched out early (&lt; target hrs)
          </div>
        </div>

        {/* 5. ON APPROVED LEAVE */}
        <div className="bg-white p-4 rounded-2xl border border-purple-200 shadow-xs space-y-1 col-span-2 sm:col-span-1">
          <div className="text-[10px] font-mono font-bold text-purple-700 uppercase tracking-wider">
            On Approved Leave
          </div>
          <div className="text-3xl font-black text-purple-600 font-mono">
            {metrics.onLeave}
          </div>
          <div className="text-[11px] text-purple-600 font-medium">
            Official approved leaves
          </div>
        </div>
      </div>

      {/* =========================================================================
          SEARCH & FILTER TOOLBAR
         ========================================================================= */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate name, ID, domain..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:border-blue-600 focus:bg-white transition-colors"
          >
            <option value="All">All Roles</option>
            <option value="Employee">Employees Only</option>
            <option value="Intern">Interns Only</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:border-blue-600 focus:bg-white transition-colors"
          >
            <option value="All">All Statuses</option>
            <option value="unpunched">🔴 Not Punched In Yet (Top Priority)</option>
            <option value="punched">🟢 Punched In (All)</option>
            <option value="active">🔵 Active On Duty</option>
            <option value="green">✅ Target Completed</option>
            <option value="yellow">⚠️ Partial Work Hours</option>
            <option value="leave">🟣 On Approved Leave</option>
          </select>

          {(searchQuery || filterRole !== 'All' || filterStatus !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterRole('All');
                setFilterStatus('All');
              }}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold px-2 py-1"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          VIEW MODE 1: PRIMARY DAILY CANDIDATE ROSTER (UNPUNCHED TOP, PUNCHED BOTTOM)
         ========================================================================= */}
      {viewMode === 'daily' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
          {/* Header bar */}
          <div className="bg-slate-50/80 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">
                Staff &amp; Intern Attendance for {selectedDate}
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                ({filteredRoster.length} candidates)
              </span>
            </div>
            <div className="text-[11px] font-semibold text-slate-500 hidden sm:flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
              <span>Unpunched prioritized at top</span>
              <span className="text-slate-300">•</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              <span>Punched at bottom</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-bold">
                <tr>
                  <th className="py-3 px-4">Priority / Status</th>
                  <th className="py-3 px-4">Staff Name &amp; ID</th>
                  <th className="py-3 px-4">Role / Domain</th>
                  <th className="py-3 px-4">Punch In Time</th>
                  <th className="py-3 px-4">Punch Out Time</th>
                  <th className="py-3 px-4">Duration / Target</th>
                  <th className="py-3 px-4">Attendance Color Flag</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRoster.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="font-semibold text-slate-600">No candidates found</p>
                      <p className="text-xs text-slate-400">Try adjusting your search query or filters.</p>
                    </td>
                  </tr>
                ) : (
                  filteredRoster.map((candidate) => {
                    const isUnpunched = !candidate.hasPunchedIn && !candidate.isOnLeave;
                    const isOnLeave = candidate.isOnLeave;
                    const isGreen = candidate.colorStatus === 'green';
                    const isYellow = candidate.colorStatus === 'yellow';
                    const isActive = candidate.colorStatus === 'blue';

                    return (
                      <tr
                        key={candidate.id}
                        className={`transition-colors ${
                          isUnpunched 
                            ? 'bg-rose-50/30 hover:bg-rose-50/60' 
                            : isOnLeave
                            ? 'bg-purple-50/20 hover:bg-purple-50/40'
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        {/* Priority / Status Column */}
                        <td className="py-3.5 px-4 font-mono font-medium">
                          {isUnpunched ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300/80 shadow-xs">
                              <AlertCircle className="w-3 h-3 text-rose-600" />
                              <span>PENDING PUNCH</span>
                            </span>
                          ) : isOnLeave ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
                              <Calendar className="w-3 h-3 text-purple-600" />
                              <span>ON LEAVE</span>
                            </span>
                          ) : isActive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                              <span>ON DUTY</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>PUNCHED IN</span>
                            </span>
                          )}
                        </td>

                        {/* Candidate Name & ID */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            {candidate.name}
                            {isUnpunched && isToday && (
                              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" title="Unpunched today" />
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-blue-600 font-bold">
                            {candidate.id}
                          </div>
                        </td>

                        {/* Role & Batch */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block ${
                              candidate.type?.toLowerCase() === 'intern'
                                ? 'bg-amber-50 border border-amber-200 text-amber-800'
                                : 'bg-blue-50 border border-blue-200 text-blue-700'
                            }`}
                          >
                            {candidate.type || candidate.role}
                          </span>
                          <div className="text-[11px] text-slate-500 truncate max-w-[160px]">
                            {candidate.batch}
                          </div>
                        </td>

                        {/* Punch In Time */}
                        <td className="py-3.5 px-4 font-mono font-medium">
                          {candidate.punchInTime ? (
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {candidate.punchInTime}
                            </span>
                          ) : isOnLeave ? (
                            <span className="text-purple-600 font-semibold">— Approved Leave —</span>
                          ) : (
                            <span className="text-rose-600 font-bold bg-rose-100/70 px-2 py-0.5 rounded border border-rose-200">
                              — Not Punched —
                            </span>
                          )}
                        </td>

                        {/* Punch Out Time */}
                        <td className="py-3.5 px-4 font-mono font-medium">
                          {candidate.punchOutTime ? (
                            <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              {candidate.punchOutTime}
                            </span>
                          ) : candidate.punchInTime ? (
                            <span className="text-blue-600 font-bold flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                              Active Shift
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* Duration & Target */}
                        <td className="py-3.5 px-4 font-mono">
                          <span className="font-bold text-slate-900">
                            {candidate.totalHours || 0} hrs
                          </span>
                          <span className="text-[11px] text-slate-500 block font-sans">
                            Target: {candidate.workHours || 5}h
                          </span>
                        </td>

                        {/* Color Flag & Status */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 ${
                              isGreen
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : isYellow
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : isActive
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : isOnLeave
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isGreen
                                  ? 'bg-emerald-500'
                                  : isYellow
                                  ? 'bg-amber-500'
                                  : isActive
                                  ? 'bg-blue-500'
                                  : isOnLeave
                                  ? 'bg-purple-500'
                                  : 'bg-rose-500'
                              }`}
                            />
                            <span>{candidate.statusLabel}</span>
                          </span>
                        </td>

                        {/* Quick Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Quick Punch In / Out buttons for Admin override */}
                            {isUnpunched && (
                              <button
                                onClick={() => handleAdminQuickPunchIn(candidate)}
                                title="Admin: Mark Punch In for Candidate"
                                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                              >
                                <LogIn className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {isActive && (
                              <button
                                onClick={() => handleAdminQuickPunchOut(candidate)}
                                title="Admin: Mark Punch Out for Candidate"
                                className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors"
                              >
                                <LogOut className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedCandidate(candidate)}
                              title="View Details & Profile"
                              className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW MODE 2: AUDIT ALL HISTORICAL RECORDS (ALL DATES TABLE)
         ========================================================================= */}
      {viewMode === 'all_history' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs space-y-3">
          <div className="bg-indigo-50/70 px-5 py-3.5 border-b border-indigo-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-indigo-900">
                Complete Historical Attendance Audit Log
              </span>
              <span className="text-[11px] font-mono text-indigo-600">
                ({logs.length} total logged sessions)
              </span>
            </div>
            <button
              onClick={() => setViewMode('daily')}
              className="text-xs font-bold text-indigo-700 hover:text-indigo-900 underline"
            >
              Return to Current Day Roster
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-bold">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Staff Name &amp; ID</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Punch In Time</th>
                  <th className="py-3 px-4">Punch Out Time</th>
                  <th className="py-3 px-4">Duration / Target</th>
                  <th className="py-3 px-4">Color Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {logs
                  .filter((r) => {
                    const q = searchQuery.toLowerCase().trim();
                    return !q || 
                      (r.userName || '').toLowerCase().includes(q) ||
                      (r.userId || '').toLowerCase().includes(q) ||
                      (r.date || '').includes(q);
                  })
                  .map((log) => {
                    const isGreen = log.colorStatus === 'green';
                    const isYellow = log.colorStatus === 'yellow' || log.colorStatus === 'orange';
                    const isRed = log.colorStatus === 'red';

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-600">
                          {log.date}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{log.userName}</div>
                          <div className="text-[11px] font-mono text-blue-600 font-bold">{log.userId}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {log.userRole || 'Staff'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                          {log.punchInTime || '—'}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-amber-700">
                          {log.punchOutTime || (log.punchInTime ? 'Active Session' : '—')}
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          {log.totalHours || 0} hrs (Target: {log.targetHours || 5}h)
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 ${
                              isGreen
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : isYellow
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : isRed
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isGreen
                                  ? 'bg-emerald-500'
                                  : isYellow
                                  ? 'bg-amber-500'
                                  : isRed
                                  ? 'bg-rose-500'
                                  : 'bg-blue-500'
                              }`}
                            />
                            <span>
                              {isGreen
                                ? 'Green: Completed Target'
                                : isYellow
                                ? 'Yellow: Partial Shift'
                                : isRed
                                ? 'Red: Absent'
                                : 'Blue: Active'}
                            </span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          CANDIDATE AUDIT & SHIFT DETAILS MODAL
         ========================================================================= */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-blue-400 font-bold font-mono">
                  {selectedCandidate.id.slice(0, 3)}
                </div>
                <div>
                  <h3 className="font-extrabold text-base">{selectedCandidate.name}</h3>
                  <p className="text-xs text-slate-300 font-mono">
                    {selectedCandidate.id} • {selectedCandidate.type || selectedCandidate.role}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-200 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 text-xs text-slate-700 max-h-[75vh] overflow-y-auto">
              {/* Date & Shift Status Alert */}
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between ${
                  selectedCandidate.colorStatus === 'green'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : selectedCandidate.colorStatus === 'yellow'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : selectedCandidate.colorStatus === 'blue'
                    ? 'bg-blue-50 border-blue-200 text-blue-900'
                    : selectedCandidate.isOnLeave
                    ? 'bg-purple-50 border-purple-200 text-purple-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    Shift Status on {selectedDate}
                  </div>
                  <div className="font-extrabold text-sm mt-0.5">
                    {selectedCandidate.statusLabel}
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                    selectedCandidate.colorStatus === 'green'
                      ? 'bg-emerald-500 text-white'
                      : selectedCandidate.colorStatus === 'yellow'
                      ? 'bg-amber-500 text-white'
                      : selectedCandidate.colorStatus === 'blue'
                      ? 'bg-blue-500 text-white'
                      : selectedCandidate.isOnLeave
                      ? 'bg-purple-500 text-white'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {selectedCandidate.colorStatus}
                </span>
              </div>

              {/* Timing Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Punch In Time</div>
                  <div className="text-sm font-black font-mono text-emerald-600">
                    {selectedCandidate.punchInTime || '— Not Recorded —'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Punch Out Time</div>
                  <div className="text-sm font-black font-mono text-amber-600">
                    {selectedCandidate.punchOutTime || (selectedCandidate.punchInTime ? 'Active' : '—')}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Total Work Duration</div>
                  <div className="text-sm font-black font-mono text-slate-900">
                    {selectedCandidate.totalHours || 0} Hours
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Target Work Hours</div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!isEditingWorkHours) {
                          setEditWorkHoursInput(selectedCandidate.workHours || 5);
                          setIsEditingWorkHours(true);
                        } else {
                          setIsEditingWorkHours(false);
                        }
                      }}
                      className="text-[10px] text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
                    >
                      {isEditingWorkHours ? 'Cancel' : 'Modify'}
                    </button>
                  </div>
                  {isEditingWorkHours ? (
                    <div className="flex items-center gap-1.5 pt-1">
                      <input
                        type="number"
                        min="1"
                        max="16"
                        step="0.5"
                        value={editWorkHoursInput}
                        onChange={(e) => setEditWorkHoursInput(e.target.value)}
                        className="w-16 py-1 px-2 text-xs font-mono font-bold border border-blue-400 rounded-lg bg-white text-slate-900 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const validHours = Math.max(1, Math.min(16, parseFloat(editWorkHoursInput) || 5));
                          updateCandidateWorkHours(selectedCandidate.id, validHours);
                          setSelectedCandidate((prev) => ({ ...prev, workHours: validHours }));
                          setIsEditingWorkHours(false);
                        }}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="text-sm font-black font-mono text-blue-600">
                      {selectedCandidate.workHours || 5} Hours
                    </div>
                  )}
                </div>
              </div>

              {/* Department & Contact Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-[10px] font-mono uppercase text-slate-500 font-bold">Profile Details</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Department / Batch:</span>
                    <p className="font-semibold text-slate-800">{selectedCandidate.batch}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Email:</span>
                    <p className="font-semibold text-slate-800 truncate">{selectedCandidate.email || '—'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Phone:</span>
                    <p className="font-semibold text-slate-800">{selectedCandidate.phone || '—'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Joined:</span>
                    <p className="font-semibold text-slate-800">{selectedCandidate.joinedDate}</p>
                  </div>
                </div>
              </div>

              {/* Daily Work Status (if candidate submitted for this day) */}
              {selectedCandidate.dailyStatus ? (
                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Submitted Daily Work Status</span>
                  </div>
                  <div className="space-y-1.5 text-slate-700">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Tasks Accomplished:</span>
                      <p className="font-medium bg-white p-2 rounded border border-emerald-100 mt-0.5">
                        {selectedCandidate.dailyStatus.tasksDone}
                      </p>
                    </div>
                    {selectedCandidate.dailyStatus.deliverablesUrl && (
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold">Deliverables Link:</span>
                        <a
                          href={selectedCandidate.dailyStatus.deliverablesUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="block text-blue-600 underline font-mono text-[11px] truncate mt-0.5"
                        >
                          {selectedCandidate.dailyStatus.deliverablesUrl}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ) : selectedCandidate.hasPunchedIn ? (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-[11px] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>No daily work status report submitted yet for {selectedDate}.</span>
                </div>
              ) : null}

              {/* Leave application info if on leave */}
              {selectedCandidate.leaveRecord && (
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 space-y-1.5">
                  <div className="text-purple-900 font-bold text-xs flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-purple-600" />
                    <span>Approved Leave Details</span>
                  </div>
                  <p className="text-purple-950 font-medium">{selectedCandidate.leaveRecord.purpose}</p>
                  <p className="text-[11px] text-purple-700 font-mono">
                    Period: {selectedCandidate.leaveRecord.startDate} to {selectedCandidate.leaveRecord.endDate}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer with Quick Override Actions */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {!selectedCandidate.hasPunchedIn && (
                  <button
                    onClick={() => {
                      handleAdminQuickPunchIn(selectedCandidate);
                      setSelectedCandidate(null);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Admin Punch In</span>
                  </button>
                )}

                {selectedCandidate.colorStatus === 'blue' && (
                  <button
                    onClick={() => {
                      handleAdminQuickPunchOut(selectedCandidate);
                      setSelectedCandidate(null);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Admin Punch Out</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
