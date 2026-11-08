import React, { useState } from 'react';
import { 
  X, Calendar, Users, IndianRupee, Clock, ShieldCheck, Sparkles, 
  ExternalLink, ArrowRight, HelpCircle, Trophy, Code2, CheckCircle2, ChevronRight, Rocket, Maximize2
} from 'lucide-react';
import { HackathonHelpProcess } from './HackathonHelpProcess';

export const HackathonDetailsModal = ({
  isOpen,
  onClose,
  hackathon,
  registeredCount = 0,
  onRegisterClick,
  onWorkspaceClick
}) => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'statements' | 'process'

  if (!isOpen || !hackathon) return null;

  const isClosed = hackathon.status === 'completed' || (
    hackathon.registrationDeadline && new Date() > new Date(hackathon.registrationDeadline)
  );

  return (
    <div className="fixed inset-0 z-50 w-full max-w-full h-screen min-h-screen bg-slate-50 text-slate-900 flex flex-col overflow-x-hidden overflow-y-auto animate-in fade-in duration-200">
      
      {/* FULL-SCREEN STICKY TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 w-full px-6 py-4 bg-slate-900/95 backdrop-blur-md border-b border-white/10 flex items-center justify-between shadow-xl text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md">
            <Trophy className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                Sakith Harvan Technologies • Hackathon Inspector
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 font-mono">
                {hackathon.theme}
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-extrabold text-white line-clamp-1">
              {hackathon.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              onClose();
              if (onWorkspaceClick) onWorkspaceClick();
            }}
            className="hidden sm:inline-flex px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
          >
            Squad Workspace Login
          </button>

          {!isClosed && (
            <button
              onClick={() => {
                onClose();
                if (onRegisterClick) onRegisterClick(hackathon);
              }}
              className="btn-primary text-xs px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/25 cursor-pointer"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>Register Squad</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
            title="Exit Full Screen View"
          >
            <span>Exit Full Screen</span>
            <X className="w-4 h-4 ml-1" />
          </button>
        </div>
      </header>

      {/* EXPANSIVE TOP HERO BANNER */}
      <div className="w-full bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white px-6 sm:px-12 py-10 relative overflow-hidden border-b border-white/10">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-400/30">
              {hackathon.theme}
            </span>
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 font-mono text-xs font-bold">
              ID: {hackathon.id}
            </span>
            {hackathon.status === 'completed' && (
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-bold">
                ★ Grand Finale Completed
              </span>
            )}
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight max-w-4xl">
            {hackathon.title}
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed font-normal">
            {hackathon.tagline}
          </p>

          {/* Sub Navigation Tabs */}
          <div className="flex flex-wrap gap-2 pt-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white/10 text-slate-300 hover:text-white hover:bg-white/15'
              }`}
            >
              Overview &amp; Bento Chunks
            </button>
            <button
              onClick={() => setActiveTab('statements')}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'statements'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white/10 text-slate-300 hover:text-white hover:bg-white/15'
              }`}
            >
              Problem Statements ({hackathon.problemStatements?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('process')}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'process'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white/10 text-slate-300 hover:text-white hover:bg-white/15'
              }`}
            >
              Process Flowchart &amp; Blueprint
            </button>
          </div>
        </div>
      </div>

      {/* FULL-SCREEN MAIN BODY CONTENT */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        
        {/* TAB 1: OVERVIEW & BENTO CHUNKS */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in">
            
            {/* Bento Grid Chunks */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Chunk 1: Live Registered Squads */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-xs font-mono uppercase font-bold text-slate-700">Squads Enrolled</span>
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-3xl font-extrabold text-slate-900 font-mono">
                  {registeredCount} <span className="text-xs font-bold text-emerald-700 font-mono">Live</span>
                </div>
                <p className="text-xs text-slate-700 font-medium">Real-time registered squads</p>
              </div>

              {/* Chunk 2: Squad Size Limits */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-xs font-mono uppercase font-bold text-slate-700">Team Size Limits</span>
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="text-3xl font-extrabold text-slate-900">
                  {hackathon.minTeamSize}-{hackathon.maxTeamSize} <span className="text-sm font-bold text-slate-700">Devs</span>
                </div>
                <p className="text-xs text-slate-700 font-medium">Engineers allowed per squad</p>
              </div>

              {/* Chunk 3: Fixed Entry Fee */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-xs font-mono uppercase font-bold text-slate-700">Fixed Entry Fee</span>
                  <IndianRupee className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-3xl font-extrabold text-emerald-700 font-mono">
                  {hackathon.entryFee > 0 ? `₹${hackathon.entryFee}` : 'FREE ENTRY'}
                </div>
                <p className="text-xs text-slate-700 font-medium">Fixed per squad registration</p>
              </div>

              {/* Chunk 4: Application Deadline */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-xs font-mono uppercase font-bold text-slate-700">Registration Closes</span>
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900 line-clamp-1">
                  {hackathon.registrationDeadline ? new Date(hackathon.registrationDeadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Ongoing'}
                </div>
                <p className="text-xs text-slate-700 font-medium">
                  {isClosed ? 'Registrations closed' : 'Enrolling now'}
                </p>
              </div>
            </div>

            {/* Detailed Description Card */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <span>Executive Challenge Scope &amp; Engineering Mission</span>
              </h3>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                {hackathon.description}
              </p>
            </div>

            {/* Problem Statements Preview Grid */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Industry Problem Statement Tracks</h3>
                  <p className="text-xs sm:text-sm text-slate-500">Pick your track and register your squad to lock roadmap.</p>
                </div>
                <button
                  onClick={() => setActiveTab('statements')}
                  className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>View Full Details ({hackathon.problemStatements?.length})</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {hackathon.problemStatements?.map((ps) => (
                  <div key={ps.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded">
                        {ps.id} • {ps.track}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-2 line-clamp-2">{ps.title}</h4>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-3 leading-relaxed">{ps.summary}</p>
                    </div>
                    <div className="pt-3 border-t border-slate-200/60 text-[11px] font-mono text-slate-400">
                      Evaluated on architecture &amp; deployment
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: PROBLEM STATEMENTS DETAILED */}
        {activeTab === 'statements' && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Available Problem Statements &amp; Evaluation Rubrics</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Teams select one statement during registration. When the administrator releases the sprint kickoff, participants unlock full secret test cases and can click Start Deployment.
              </p>
            </div>

            <div className="space-y-6">
              {hackathon.problemStatements?.map((ps) => (
                <div key={ps.id} className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold bg-blue-600 text-white px-3 py-1 rounded-lg">
                        {ps.id}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-slate-600 font-mono">
                        Track: {ps.track}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-slate-400">
                      Sakith Harvan Verified Challenge
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                    {ps.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                    {ps.summary}
                  </p>

                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700 space-y-2">
                    <div className="font-bold text-slate-800 uppercase tracking-wider text-xs font-mono">
                      Scope &amp; Technical Execution Guidelines
                    </div>
                    <p className="leading-relaxed font-normal">
                      {ps.fullDetails || ps.summary}
                    </p>
                    {ps.evaluationCriteria && (
                      <div className="pt-3 border-t border-slate-200 text-xs text-slate-600">
                        <strong className="text-slate-800 font-mono">Evaluation Rubric:</strong> {ps.evaluationCriteria}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PROCESS FLOWCHART & BLUEPRINT */}
        {activeTab === 'process' && (
          <div className="space-y-6 animate-in fade-in">
            <HackathonHelpProcess />
          </div>
        )}

      </main>

      {/* FULL-SCREEN STICKY FOOTER ACTIONS */}
      <footer className="sticky bottom-0 z-30 w-full px-6 py-4 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Sakith Harvan Official: Verified Industrial Certification, PPO Tracks &amp; Prize Pool</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                onClose();
                if (onWorkspaceClick) onWorkspaceClick();
              }}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Squad Workspace Login
            </button>

            {!isClosed && (
              <button
                onClick={() => {
                  onClose();
                  if (onRegisterClick) onRegisterClick(hackathon);
                }}
                className="flex-1 sm:flex-initial btn-primary text-xs sm:text-sm px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 cursor-pointer"
              >
                <Rocket className="w-4 h-4" />
                <span>Register Squad ({hackathon.entryFee > 0 ? `₹${hackathon.entryFee}` : 'Free'})</span>
              </button>
            )}
          </div>
        </div>
      </footer>

    </div>
  );
};
