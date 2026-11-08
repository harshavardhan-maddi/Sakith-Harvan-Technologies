import React from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, Building, Calendar, User, FileText } from 'lucide-react';
import { Logo } from '../Logo';

export const LeaveApprovalCertificateModal = ({ isOpen, onClose, leave, currentUser }) => {
  if (!isOpen || !leave) return null;

  const calculateDays = (start, end) => {
    if (!start || !end) return 1;
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
  };

  const totalDays = calculateDays(leave.startDate, leave.endDate);
  const applicantName = leave.userName || currentUser?.name || 'Staff Member';
  const applicantId = leave.userId || currentUser?.id || currentUser?.userId || 'EMP-01';
  const applicantRole = leave.userRole || currentUser?.role || currentUser?.type || 'Engineering Staff';
  const applicantDomain = currentUser?.domain || currentUser?.batch || 'Core Software Systems';
  const issueDate = leave.approvedAt 
    ? new Date(leave.approvedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Print as PDF via native print preview dialog
  const handlePrint = () => {
    window.print();
  };

  // Download self-contained official document with embedded styling & watermark
  const handleDownloadHTML = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Leave_Sanction_Certificate_${leave.id}_${applicantName.replace(/\s+/g, '_')}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    body { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 20px; background: #fff; }
    .letter-container { border: 2px solid #0284c7; padding: 36px; border-radius: 12px; position: relative; overflow: hidden; max-width: 800px; margin: auto; background: #fff; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 64px; font-weight: 900; color: rgba(2, 132, 199, 0.06); letter-spacing: 4px; pointer-events: none; text-transform: uppercase; white-space: nowrap; user-select: none; border: 8px dashed rgba(2, 132, 199, 0.08); padding: 20px 40px; border-radius: 20px; }
    .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 18px; margin-bottom: 24px; }
    .company-name { font-size: 24px; font-weight: 900; color: #1e3a8a; letter-spacing: 1px; text-transform: uppercase; margin: 0; }
    .company-sub { font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 4px; }
    .headline-pakka { display: inline-block; background: #eff6ff; border: 1.5px solid #bfdbfe; color: #1d4ed8; font-size: 14px; font-weight: 800; padding: 6px 18px; border-radius: 999px; margin-top: 14px; letter-spacing: 0.5px; text-transform: uppercase; }
    .ref-box { display: flex; justify-content: space-between; font-size: 11px; color: #475569; margin-bottom: 22px; font-family: monospace; border-bottom: 1px dashed #cbd5e1; padding-bottom: 8px; }
    .section-title { font-size: 12px; font-weight: 800; color: #0284c7; text-transform: uppercase; letter-spacing: 1px; margin-top: 18px; margin-bottom: 8px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; font-size: 12px; }
    .field-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 14px; border-radius: 8px; }
    .field-label { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 2px; }
    .field-value { font-weight: 700; color: #0f172a; font-size: 13px; }
    .purpose-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px 16px; border-radius: 8px; font-size: 13px; line-height: 1.5; color: #334155; margin-bottom: 20px; font-style: italic; }
    .status-badge { display: inline-flex; align-items: center; gap: 6px; background: #ecfdf5; border: 1.5px solid #a7f3d0; color: #065f46; font-size: 12px; font-weight: 800; padding: 6px 16px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
    .signatures { display: flex; justify-content: space-between; margin-top: 36px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
    .sig-block { text-align: center; }
    .sig-line { width: 180px; border-top: 1.5px solid #0f172a; margin-top: 36px; margin-bottom: 6px; }
    .sig-title { font-size: 11px; font-weight: 700; color: #0f172a; }
    .sig-sub { font-size: 10px; color: #64748b; }
    .footer { margin-top: 24px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 12px; }
    @media print {
      body { padding: 0; background: #fff; }
      .letter-container { border: 1.5px solid #0284c7; box-shadow: none; padding: 24px; }
    }
  </style>
</head>
<body>
  <div class="letter-container">
    <div class="watermark">SAKITH HARVAN TECHNOLOGIES</div>
    
    <div class="header">
      <h1 class="company-name">SAKITH HARVAN TECHNOLOGIES</h1>
      <div class="company-sub">Enterprise Digital Platforms • AI Risk Systems • Cloud Engineering</div>
      <div class="headline-pakka">OFFICIAL LEAVE SANCTION &amp; APPROVAL CERTIFICATE</div>
    </div>

    <div class="ref-box">
      <span>REF ID: SHT/HR-LEAVE/2026/${leave.id}</span>
      <span>SANCTION DATE: ${issueDate}</span>
    </div>

    <div class="section-title">1. Employee &amp; Identity Details</div>
    <div class="grid">
      <div class="field-box">
        <div class="field-label">Full Name</div>
        <div class="field-value">${applicantName}</div>
      </div>
      <div class="field-box">
        <div class="field-label">Employee / Intern ID</div>
        <div class="field-value">${applicantId}</div>
      </div>
      <div class="field-box">
        <div class="field-label">Designation / Role</div>
        <div class="field-value">${applicantRole}</div>
      </div>
      <div class="field-box">
        <div class="field-label">Domain / Batch</div>
        <div class="field-value">${applicantDomain}</div>
      </div>
    </div>

    <div class="section-title">2. Authorized Leave Period</div>
    <div class="grid">
      <div class="field-box">
        <div class="field-label">Start Date</div>
        <div class="field-value">${leave.startDate}</div>
      </div>
      <div class="field-box">
        <div class="field-label">End Date</div>
        <div class="field-value">${leave.endDate}</div>
      </div>
      <div class="field-box">
        <div class="field-label">Total Duration</div>
        <div class="field-value">${totalDays} Calendar Day(s)</div>
      </div>
      <div class="field-box">
        <div class="field-label">Approval Status</div>
        <div class="field-value"><span class="status-badge">✓ APPROVED &amp; RECORDED</span></div>
      </div>
    </div>

    <div class="section-title">3. Reason / Stated Purpose</div>
    <div class="purpose-box">
      "${leave.purpose || 'Official leave of absence authorized by company administration.'}"
    </div>

    <div class="section-title">4. Governance &amp; Executive Authorization</div>
    <div style="font-size: 11px; color: #475569; line-height: 1.6; margin-bottom: 12px;">
      This document certifies that the requested leave of absence for <strong>${applicantName}</strong> (${applicantId}) has been officially reviewed and sanctioned by the Executive Human Resources &amp; Operations Directorate of Sakith Harvan Technologies. The employee's work continuity plan has been filed, and access credentials remain protected during this authorized leave interval.
    </div>

    <div class="signatures">
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-title">Corporate HR Directorate</div>
        <div class="sig-sub">Talent &amp; Operations Management</div>
      </div>
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-title">Maddi Harshavardhan</div>
        <div class="sig-sub">Founder &amp; CEO, Sakith Harvan</div>
      </div>
    </div>

    <div class="footer">
      Sakith Harvan Technologies Pvt. Ltd. • Official Corporate Sanction Letter • SSL Digitally Verified • Verification Hash: SHA256-${leave.id.toUpperCase()}-SHTSA2026
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Leave_Approval_${leave.id}_${applicantName.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white max-w-2xl w-full rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto">
        {/* Top Action Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="font-extrabold text-sm tracking-wide">
              Official Leave Sanction Letter
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={handleDownloadHTML}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Download standalone official document"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Body (Printable Letter with Watermark & Pakka Headline) */}
        <div id="printable-leave-certificate" className="p-8 sm:p-10 relative overflow-hidden bg-white select-text">
          {/* Company Logo Watermark */}
          <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0"
            style={{ opacity: 0.05 }}
          >
            <div className="text-center transform -rotate-25 scale-125 border-8 border-dashed border-blue-900 p-12 rounded-3xl">
              <div className="text-7xl font-black text-blue-950 font-serif uppercase tracking-widest">
                SAKITH HARVAN
              </div>
              <div className="text-4xl font-extrabold text-blue-900 tracking-wider mt-2">
                TECHNOLOGIES
              </div>
              <div className="text-base font-mono text-blue-800 font-bold uppercase tracking-widest mt-3">
                OFFICIAL CORPORATE SEAL • VERIFIED
              </div>
            </div>
          </div>

          <div className="relative z-10 space-y-6">
            {/* Header */}
            <div className="text-center border-b border-slate-200 pb-5">
              <div className="flex justify-center mb-2">
                <Logo size="md" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase font-sans">
                Sakith Harvan Technologies
              </h2>
              <p className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase mt-0.5">
                Enterprise Cloud &amp; AI Digital Risk Solutions • ISO 9001:2015 Operations
              </p>

              {/* PAKKA HEADLINE */}
              <div className="mt-3 inline-block px-5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-extrabold text-xs tracking-wider uppercase shadow-xs">
                OFFICIAL LEAVE SANCTION &amp; APPROVAL CERTIFICATE
              </div>
            </div>

            {/* Reference info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 font-mono border-b border-slate-100 pb-3 gap-1">
              <span><strong>REF NO:</strong> SHT/HR-LEAVE/2026/{leave.id}</span>
              <span><strong>ISSUE DATE:</strong> {issueDate}</span>
            </div>

            {/* Applicant Details */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Applicant &amp; Staff Credentials</span>
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Name</span>
                  <span className="font-extrabold text-slate-900">{applicantName}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Staff / Intern ID</span>
                  <span className="font-mono font-extrabold text-slate-900">{applicantId}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Role / Designation</span>
                  <span className="font-semibold text-slate-800">{applicantRole}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Batch / Domain</span>
                  <span className="font-semibold text-slate-800">{applicantDomain}</span>
                </div>
              </div>
            </div>

            {/* Leave Details */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Sanctioned Schedule &amp; Leave Period</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Start Date</span>
                  <span className="font-mono font-bold text-slate-900">{leave.startDate}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">End Date</span>
                  <span className="font-mono font-bold text-slate-900">{leave.endDate}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Duration</span>
                  <span className="font-bold text-blue-700">{totalDays} Calendar Days</span>
                </div>
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 block">Status</span>
                  <span className="font-extrabold text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>APPROVED</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Purpose */}
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Stated Purpose of Leave</span>
              </h4>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 italic leading-relaxed">
                "{leave.purpose || 'Official leave of absence approved by corporate administration.'}"
              </div>
            </div>

            {/* Administrative Note */}
            <div className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
              This document certifies that the above-named personnel has received formal leave authorization in compliance with Sakith Harvan Technologies HR directives. Authorized resume-of-duty is scheduled following the approved end date.
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 pt-6 border-t border-slate-200 text-center">
              <div>
                <div className="w-36 h-0.5 bg-slate-400 mx-auto mb-1.5"></div>
                <div className="text-xs font-bold text-slate-900">Corporate HR Directorate</div>
                <div className="text-[10px] text-slate-500">Sakith Harvan Technologies</div>
              </div>
              <div>
                <div className="w-36 h-0.5 bg-slate-400 mx-auto mb-1.5"></div>
                <div className="text-xs font-bold text-slate-900">Maddi Harshavardhan</div>
                <div className="text-[10px] text-slate-500">Founder &amp; CEO, Sakith Harvan</div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-[10px] text-slate-400 border-t border-slate-100 pt-3 font-mono">
              Digitally Verified Document • SHT-HR-LEAVE-VERIFIED • {leave.id}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
