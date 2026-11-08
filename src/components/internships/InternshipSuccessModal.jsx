import React, { useState } from 'react';
import { Lottie } from 'lottie-react';
import { 
  Check, Copy, CheckCircle2, ShieldCheck, ArrowRight, X, Sparkles, ExternalLink 
} from 'lucide-react';
import securityAnimationData from '../../assets/internship-success-lottie.json';

export const InternshipSuccessModal = ({ application, onClose, onTrack }) => {
  const [copied, setCopied] = useState(false);

  if (!application) return null;

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(application.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for clipboard
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      {/* Modal Container */}
      <div className="relative max-w-lg w-full rounded-3xl overflow-hidden bg-slate-950 border border-cyan-500/40 shadow-2xl shadow-cyan-950/60 p-6 sm:p-8 text-center text-white">
        
        {/* ======================================================== */}
        {/* BACKGROUND: 40% OPACITY LOTTIE ANIMATION                 */}
        {/* ======================================================== */}
        <div 
          className="pointer-events-none absolute inset-0 overflow-hidden flex items-center justify-center select-none"
          style={{ opacity: 0.4 }}
          aria-hidden="true"
        >
          <Lottie
            animationData={securityAnimationData}
            loop={true}
            autoplay={true}
            className="w-full h-full object-cover scale-110 sm:scale-125 filter contrast-125"
          />
        </div>

        {/* Ambient Dark Gradient Vignette for Razor-Sharp Text Contrast */}
        <div 
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/50 to-slate-950/85" 
          aria-hidden="true"
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close modal"
          className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border border-white/10 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ======================================================== */}
        {/* FOREGROUND CONTENT: HIGH CONTRAST OPPOSITE-COLOR TEXT    */}
        {/* ======================================================== */}
        <div className="relative z-10 space-y-5">
          
          {/* Top Pill / Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[11px] font-bold text-emerald-300 shadow-lg shadow-emerald-950/50">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Application Successfully Submitted</span>
          </div>

          {/* Heading */}
          <div className="space-y-1.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">
              You're Officially Registered!
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 max-w-sm mx-auto leading-relaxed">
              Your application for <span className="font-semibold text-cyan-300">{application.internshipTitle}</span> has been securely recorded in the portal.
            </p>
          </div>

          {/* ======================================================== */}
          {/* CENTER: APPLICATION ID GENERATED UPON THE LOTTIE BG      */}
          {/* ======================================================== */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 backdrop-blur-md border-2 border-cyan-400/50 shadow-2xl shadow-cyan-950/80 space-y-3">
            <div className="flex items-center justify-center gap-1.5 text-cyan-300 text-[11px] font-bold uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Official Application Reference ID</span>
            </div>

            {/* Generated Application ID Box */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              <span className="text-xl sm:text-2xl md:text-3xl font-mono font-black text-amber-300 tracking-wider px-3 py-1.5 rounded-xl bg-black/60 border border-amber-400/30 selection:bg-amber-400 selection:text-slate-950 drop-shadow-[0_2px_12px_rgba(251,191,36,0.35)]">
                {application.id}
              </span>

              <button
                type="button"
                onClick={handleCopyId}
                title="Copy Application ID"
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 text-white transition-all cursor-pointer shadow-md"
              >
                {copied ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-300 font-bold">
                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                    <span>Copied</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-slate-200 font-medium">
                    <Copy className="w-4 h-4" />
                    <span className="hidden sm:inline">Copy</span>
                  </span>
                )}
              </button>
            </div>

            {copied && (
              <p className="text-[11px] text-emerald-400 font-semibold animate-in fade-in">
                ✓ Application ID copied to clipboard!
              </p>
            )}

            <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
              Save this reference ID. You can use it to track your application review progress, technical screening, and interview invitations.
            </p>

            {/* Quick Candidate Summary Pill */}
            {application.candidateName && (
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
                <span>Applicant: <strong className="text-white">{application.candidateName}</strong></span>
                <span className="text-cyan-300 font-mono text-[10px]">Status: Under Review</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {onTrack && (
              <button
                type="button"
                onClick={() => onTrack(application.id)}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-cyan-500/35 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Track Application Status</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="py-3 px-5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 hover:text-white transition-all cursor-pointer"
            >
              Done &amp; Return
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

