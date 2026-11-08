import React, { useState, useEffect } from 'react';
import { 
  Calendar, CheckCircle2, XCircle, Clock, AlertCircle, 
  User, Check, X, Search, FileText 
} from 'lucide-react';
import { getStoredLeaves, saveLeaveApplications } from '../../lib/enterprisePortalStore';
import { LeaveApprovalCertificateModal } from './LeaveApprovalCertificateModal';

export const LeaveManagement = () => {
  const [leaves, setLeaves] = useState(getStoredLeaves());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Pending', 'Approved', 'Rejected'
  const [adminNoteModal, setAdminNoteModal] = useState({ open: false, leaveId: null, action: null });
  const [noteInput, setNoteInput] = useState('');
  const [showCertModal, setShowCertModal] = useState(false);
  const [selectedCertLeave, setSelectedCertLeave] = useState(null);

  useEffect(() => {
    const handleUpdate = () => setLeaves(getStoredLeaves());
    window.addEventListener('sh_leaves_updated', handleUpdate);
    return () => window.removeEventListener('sh_leaves_updated', handleUpdate);
  }, []);

  const handleUpdateStatus = (id, newStatus, note = '') => {
    const updated = leaves.map(l => {
      if (l.id === id) {
        return {
          ...l,
          status: newStatus,
          approvedBy: newStatus === 'Approved' ? 'Corporate HR Directorate' : l.approvedBy,
          approvedAt: newStatus === 'Approved' ? new Date().toISOString() : l.approvedAt,
          adminNotes: note || (newStatus === 'Approved' ? 'Approved by Administration' : 'Rejected by Administration')
        };
      }
      return l;
    });

    setLeaves(updated);
    saveLeaveApplications(updated);
    setAdminNoteModal({ open: false, leaveId: null, action: null });
    setNoteInput('');
  };

  const filteredLeaves = leaves.filter(l => {
    const matchQuery = (l.userName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                       (l.userId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                       (l.purpose || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'All' || l.status === statusFilter;
    return matchQuery && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs space-y-1">
          <div className="text-[11px] font-mono text-amber-700 uppercase font-bold">Pending Review</div>
          <div className="text-3xl font-black text-amber-600 font-mono">
            {leaves.filter(l => l.status === 'Pending').length}
          </div>
          <div className="text-[11px] text-amber-600">Awaiting leadership authorization</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs space-y-1">
          <div className="text-[11px] font-mono text-emerald-700 uppercase font-bold">Approved Leaves</div>
          <div className="text-3xl font-black text-emerald-600 font-mono">
            {leaves.filter(l => l.status === 'Approved').length}
          </div>
          <div className="text-[11px] text-emerald-600">Authorized time-off periods</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-xs space-y-1">
          <div className="text-[11px] font-mono text-rose-700 uppercase font-bold">Rejected Requests</div>
          <div className="text-3xl font-black text-rose-600 font-mono">
            {leaves.filter(l => l.status === 'Rejected').length}
          </div>
          <div className="text-[11px] text-rose-600">Declined due to deadlines/workload</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employee or purpose..."
            className="form-input pl-9 text-xs bg-white border border-slate-300 text-slate-900 focus:border-blue-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-input text-xs bg-white border border-slate-300 text-slate-900 focus:border-blue-600"
          >
            <option value="All">All Leave Statuses</option>
            <option value="Pending">Pending Only</option>
            <option value="Approved">Approved Only</option>
            <option value="Rejected">Rejected Only</option>
          </select>
        </div>
      </div>

      {/* Leaves List Grid */}
      <div className="space-y-3">
        {filteredLeaves.map((leave) => {
          const isPending = leave.status === 'Pending';
          const isApproved = leave.status === 'Approved';

          return (
            <div key={leave.id} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-base">{leave.userName}</h4>
                      <span className="text-[11px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-bold">
                        {leave.userId}
                      </span>
                      <span className="text-xs text-slate-500">• {leave.userRole}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Applied on: <span className="font-mono text-slate-700 font-semibold">{leave.appliedDate}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                    isPending
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : isApproved
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {isPending ? <Clock className="w-3.5 h-3.5" /> : isApproved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>{leave.status}</span>
                  </span>

                  {isApproved && (
                    <button
                      onClick={() => {
                        setSelectedCertLeave(leave);
                        setShowCertModal(true);
                      }}
                      className="py-1.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                      title="Download or preview official leave sanction letter"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Official PDF Letter</span>
                    </button>
                  )}

                  {isPending && (
                    <div className="flex items-center gap-1.5 ml-1">
                      <button
                        onClick={() => handleUpdateStatus(leave.id, 'Approved')}
                        className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(leave.id, 'Rejected')}
                        className="py-1.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1 border border-rose-200 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Leave Timing & Purpose */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                <div className="md:col-span-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 font-mono">
                  <div className="text-[10px] text-slate-400 uppercase font-sans font-bold">Leave Period</div>
                  <div className="text-slate-900 font-bold">
                    {leave.startDate} {leave.endDate && leave.endDate !== leave.startDate ? `→ ${leave.endDate}` : '(Single Day)'}
                  </div>
                </div>

                <div className="md:col-span-8 p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Reason / Stated Purpose</div>
                  <div className="text-slate-700">{leave.purpose}</div>
                </div>
              </div>

              {leave.adminNotes && (
                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900">
                  <strong className="text-blue-950">Admin Remarks:</strong> {leave.adminNotes}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Official Leave Certificate Modal */}
      <LeaveApprovalCertificateModal
        isOpen={showCertModal}
        onClose={() => setShowCertModal(false)}
        leave={selectedCertLeave}
      />
    </div>
  );
};
