import React, { useState, useEffect } from 'react';
import { 
  X, Lock, Unlock, Rocket, Send, CheckCircle2, AlertCircle, 
  ExternalLink, Github, Key, FileText, Clock, Users, Shield, Copy, Check, Maximize2
} from 'lucide-react';
import { 
  authenticateHackathonTeam, 
  updateTeamSubmission, 
  markDeploymentStarted,
  lockTeamProblemStatement,
  getStoredHackathons 
} from '../../lib/hackathonStore';

export const HackathonTeamWorkspaceModal = ({ 
  isOpen, 
  onClose, 
  initialTeam = null 
}) => {
  const [teamIdInput, setTeamIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [currentTeam, setCurrentTeam] = useState(initialTeam);
  const [isSelectingStatement, setIsSelectingStatement] = useState(false);
  const [lockingToast, setLockingToast] = useState('');
  
  // Submission Form State
  const [liveUrl, setLiveUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [testLogin, setTestLogin] = useState('');
  const [testPassword, setTestPassword] = useState('');
  const [testApiKeys, setTestApiKeys] = useState('');
  const [workingNotes, setWorkingNotes] = useState('');
  const [remarks, setRemarks] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialTeam) {
      setCurrentTeam(initialTeam);
      populateSubmission(initialTeam.submission);
    }
  }, [initialTeam]);

  const populateSubmission = (sub) => {
    if (!sub) return;
    setLiveUrl(sub.liveUrl || '');
    setGithubUrl(sub.githubUrl || '');
    setTestLogin(sub.testCredentials?.login || '');
    setTestPassword(sub.testCredentials?.password || '');
    setTestApiKeys(sub.testCredentials?.apiKeys || '');
    setWorkingNotes(sub.workingNotes || '');
    setRemarks(sub.remarks || '');
  };

  if (!isOpen) return null;

  // Handle Login
  const handleLogin = (e) => {
    e.preventDefault();
    setAuthError('');
    const authenticated = authenticateHackathonTeam(teamIdInput, passwordInput);
    if (!authenticated) {
      setAuthError('Invalid Team ID or Password. Please check your squad registration credentials.');
      return;
    }
    setCurrentTeam(authenticated);
    populateSubmission(authenticated.submission);
  };

  const handleLogout = () => {
    setCurrentTeam(null);
    setTeamIdInput('');
    setPasswordInput('');
    setAuthError('');
    setSaveSuccess(false);
  };

  // Find associated hackathon
  const hackathons = getStoredHackathons();
  const hackathon = currentTeam ? hackathons.find(h => h.id === currentTeam.hackathonId) : null;
  const problemStatement = hackathon?.problemStatements?.find(ps => ps.id === currentTeam?.problemStatementId);

  // Check if deadline crossed
  const isSubmissionClosed = hackathon?.submissionsClosed || (
    hackathon?.submissionDeadline && new Date() > new Date(hackathon.submissionDeadline)
  );

  // Check if problem statement locking deadline crossed (Fixed by Admin)
  const isStatementLockClosed = hackathon?.statementsLocked || (
    hackathon?.statementLockDeadline && new Date() > new Date(hackathon.statementLockDeadline)
  );

  // Handle Locking / Selecting Problem Statement
  const handleLockStatement = (psId) => {
    if (!currentTeam) return;
    if (isStatementLockClosed) {
      alert('The deadline for selecting or locking problem statements has passed (Fixed by Admin).');
      return;
    }
    const updated = lockTeamProblemStatement(currentTeam.id, psId);
    setCurrentTeam(updated);
    setIsSelectingStatement(false);
    setLockingToast('Problem statement successfully locked for your squad!');
    setTimeout(() => setLockingToast(''), 3500);
  };

  // Handle Deployment Start
  const handleStartDeployment = () => {
    if (!currentTeam) return;
    const updated = markDeploymentStarted(currentTeam.id);
    setCurrentTeam(updated);
  };

  // Handle Submit Project
  const handleSubmitProject = (e) => {
    e.preventDefault();
    if (!currentTeam) return;
    if (isSubmissionClosed) {
      alert('The submission deadline has passed. Modifications are currently locked.');
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const submissionData = {
        liveUrl: liveUrl.trim(),
        githubUrl: githubUrl.trim(),
        testCredentials: {
          login: testLogin.trim(),
          password: testPassword.trim(),
          apiKeys: testApiKeys.trim()
        },
        workingNotes: workingNotes.trim(),
        remarks: remarks.trim()
      };

      const updated = updateTeamSubmission(currentTeam.id, submissionData);
      setCurrentTeam(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to save submission:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 w-full max-w-full h-screen min-h-screen bg-[#090A0F] text-slate-100 flex flex-col overflow-x-hidden overflow-y-auto animate-in fade-in duration-200 selection:bg-amber-500 selection:text-slate-950">
      
      {/* FULL-SCREEN STICKY TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 w-full px-6 py-4 bg-slate-950/95 backdrop-blur-md border-b border-white/10 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-4">
          {hackathon?.logoUrl ? (
            <div className="w-10 h-10 rounded-xl bg-black/60 border border-white/15 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-md">
              <img
                src={hackathon.logoUrl}
                alt={hackathon.title}
                className="w-full h-full object-contain"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 font-bold">
              <Rocket className="w-5 h-5 text-slate-950" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                NEXARVA • Squad Command Center
              </span>
              {currentTeam && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-mono font-bold border border-amber-500/30">
                  TEAM ID: {currentTeam.id}
                </span>
              )}
            </div>
            <h1 className="text-base sm:text-xl font-extrabold text-white">
              {currentTeam ? `${currentTeam.teamName} • Sprint Workspace` : 'Squad Workspace Portal'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentTeam && (
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          )}
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
            title="Exit Full Screen Workspace"
          >
            <span>Exit Full Screen</span>
            <X className="w-4 h-4 ml-1" />
          </button>
        </div>
      </header>

      {/* FULL-SCREEN MAIN BODY CONTENT */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-8">
        
        {/* ======================================================== */}
        {/* 1. LOGIN VIEW (IF NOT SIGNED IN)                         */}
        {/* ======================================================== */}
        {!currentTeam ? (
          <div className="min-h-[75vh] flex items-center justify-center">
            <div className="w-full max-w-lg p-8 sm:p-10 rounded-3xl bg-[#11131C] border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="text-center space-y-3 relative z-10 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/30 shadow-lg">
                  <Key className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-extrabold text-white">
                  Squad Portal Authentication
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
                  Enter your unique Team ID and custom secret password issued during squad registration.
                </p>
              </div>

              {authError && (
                <div className="mb-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4 relative z-10">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                    Team Login ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SHTNXR1025"
                    value={teamIdInput}
                    onChange={(e) => setTeamIdInput(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm font-mono font-bold text-white placeholder-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                    Team Secret Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="e.g. NEXSHT3SHTNXR1025"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm font-mono font-bold text-white placeholder-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none"
                  />
                  <p className="text-[11px] font-mono text-slate-400 mt-1">
                    Formula: TeamName + SHT + Size + ID
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-sm py-3.5 rounded-xl font-black shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all mt-2"
                >
                  <Lock className="w-4 h-4 text-slate-950" />
                  <span>Unlock Squad Workspace</span>
                </button>
              </form>

              {/* Demo Credentials Filler */}
              <div className="mt-6 pt-5 border-t border-white/10 text-center relative z-10">
                <span className="text-xs text-slate-400">Want to test right away? </span>
                <button
                  type="button"
                  onClick={() => {
                    setTeamIdInput('SHTNXR1025');
                    setPasswordInput('NEXSHT3SHTNXR1025');
                  }}
                  className="text-xs font-bold text-amber-400 hover:underline cursor-pointer ml-1 font-mono"
                >
                  Autofill Demo Squad (SHTNXR1025)
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* 2. AUTHENTICATED FULL-SCREEN SQUAD WORKSPACE             */
          /* ======================================================== */
          <div className="space-y-8 animate-in fade-in">
            
            {/* Squad Overview Hero Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#11131C] via-[#161928] to-[#0D0F17] border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-xs font-mono text-amber-300 font-extrabold px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30">
                      SQUAD ID: {currentTeam.id}
                    </span>
                    <span className="text-xs font-semibold text-slate-300 font-mono">
                      {currentTeam.teamSize} Member Squad
                    </span>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20 font-bold">
                      Registration Confirmed
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                    Team {currentTeam.teamName}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1">
                    Enrolled Challenge: <strong className="text-white">{hackathon?.title || 'Active Hackathon'}</strong>
                  </p>
                </div>

                {/* Deployment Status & Action */}
                <div className="flex flex-col sm:items-end gap-2">
                  <span className="text-xs font-mono text-slate-400">Sprint Lifecycle Status</span>
                  {currentTeam.deploymentStarted ? (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-extrabold">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>Active Deployment in Progress</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleStartDeployment}
                      disabled={!hackathon?.statementsReleased}
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold shadow-lg transition-all cursor-pointer ${
                        hackathon?.statementsReleased 
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black shadow-amber-500/25' 
                          : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/10'
                      }`}
                    >
                      <Rocket className="w-4 h-4 text-slate-950" />
                      <span>{hackathon?.statementsReleased ? 'Start Deployment & Active Sprint' : 'Awaiting Admin Kickoff'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Squad Members Roster */}
              <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap gap-2.5 relative z-10">
                {currentTeam.members?.map((m, i) => (
                  <span 
                    key={i}
                    className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-slate-200 text-xs font-medium flex items-center gap-1.5"
                  >
                    <span className="text-amber-400 font-bold">{i === 0 ? '👑' : '•'}</span>
                    <span className="text-white font-semibold">{m.name} {i === 0 ? '(Leader)' : ''}</span>
                    <span className="text-slate-400 font-mono text-[11px]">({m.college})</span>
                  </span>
                ))}
              </div>
            </div>

            {/* TWO-COLUMN EXPANSIVE WORKSPACE GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* LEFT COLUMN: PROBLEM STATEMENT & RULES */}
              <div className="space-y-6">
                
                {lockingToast && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{lockingToast}</span>
                  </div>
                )}

                {/* CASE A: TEAM HAS NOT SELECTED OR IS CHANGING STATEMENT */}
                {(!currentTeam.problemStatementId || isSelectingStatement) ? (
                  <div className="p-6 sm:p-7 rounded-3xl bg-[#11131C] border border-white/10 shadow-xl space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                      <div>
                        <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                          Squad Challenge Track Selection
                        </span>
                        <h3 className="text-lg font-bold text-white mt-0.5">
                          Select &amp; Lock Your Problem Statement
                        </h3>
                      </div>
                      
                      {isSelectingStatement && currentTeam.problemStatementId && (
                        <button
                          type="button"
                          onClick={() => setIsSelectingStatement(false)}
                          className="text-xs font-bold text-slate-300 hover:text-white px-3 py-1 rounded-lg bg-white/10 cursor-pointer self-start sm:self-auto border border-white/10"
                        >
                          Cancel Change
                        </button>
                      )}
                    </div>

                    {/* Locking Deadline Banner */}
                    <div className={`p-4 rounded-2xl border text-xs space-y-1 ${
                      isStatementLockClosed 
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' 
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                    }`}>
                      <div className="flex items-center gap-2 font-bold font-mono">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span>
                          {isStatementLockClosed 
                            ? 'STATEMENT SELECTION WINDOW CLOSED BY ADMIN' 
                            : 'ADMIN STATEMENT LOCKING DEADLINE ACTIVE'}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        {isStatementLockClosed 
                          ? 'The deadline fixed by the administrator for choosing and locking problem statements has expired. Contact admin to assign a challenge.'
                          : `Your squad can choose and lock your problem statement until: ${hackathon?.statementLockDeadline ? new Date(hackathon.statementLockDeadline).toLocaleString('en-IN') : 'Admin Kickoff'}. Once locked or when deadline expires, selection is permanently fixed.`
                        }
                      </p>
                    </div>

                    {/* Available Statements to Select */}
                    {!isStatementLockClosed && (
                      <div className="space-y-3 pt-1">
                        {hackathon?.problemStatements?.map((ps) => (
                          <div
                            key={ps.id}
                            className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3 hover:border-amber-500/50 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="font-mono text-xs font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                                  {ps.id} • {ps.track}
                                </span>
                                <h4 className="text-sm font-bold text-white mt-1.5">{ps.title}</h4>
                              </div>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed font-normal">
                              {ps.summary}
                            </p>

                            <div className="pt-2 flex items-center justify-between border-t border-white/10">
                              <span className="text-[11px] font-mono text-slate-400">
                                NEXARVA Challenge Spec
                              </span>
                              <button
                                type="button"
                                onClick={() => handleLockStatement(ps.id)}
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer transition-all"
                              >
                                <Lock className="w-3.5 h-3.5 text-slate-950" />
                                <span>Lock This Statement for Squad</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* CASE B: TEAM HAS LOCKED A STATEMENT */
                  <div className="p-6 sm:p-7 rounded-3xl bg-[#11131C] border border-white/10 shadow-xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold text-amber-400 uppercase">
                            Locked Problem Statement
                          </span>
                          {!isStatementLockClosed ? (
                            <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Locked (Editable before cutoff)
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                              🔒 Permanently Locked by Admin
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-white mt-0.5">
                          {problemStatement?.title || currentTeam.problemStatementTitle}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          {problemStatement?.track || 'Engineering Track'}
                        </span>

                        {!isStatementLockClosed && (
                          <button
                            type="button"
                            onClick={() => setIsSelectingStatement(true)}
                            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer border border-white/10"
                          >
                            Change
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Problem Statement Status Condition */}
                    {!hackathon?.statementsReleased ? (
                      <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 space-y-2 text-center my-4">
                        <Lock className="w-8 h-8 text-amber-400 mx-auto" />
                        <h4 className="text-sm font-bold text-amber-200">
                          Problem Statement Release Pending Admin Kickoff
                        </h4>
                        <p className="text-xs text-amber-400/90 max-w-md mx-auto leading-relaxed">
                          Full problem statement details, evaluation rubrics, test datasets, and starter code will automatically unlock here once the administrator triggers the official kickoff.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4 pt-1">
                        <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-400 font-mono">
                          <Unlock className="w-4 h-4" />
                          <span>STATEMENT UNLOCKED &amp; READY FOR DEPLOYMENT</span>
                        </div>

                        <div className="space-y-1.5">
                          <h4 className="text-xs font-bold text-slate-400 uppercase font-mono">
                            Complete Problem Scope
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                            {problemStatement?.fullDetails || problemStatement?.summary}
                          </p>
                        </div>

                        {problemStatement?.rules && (
                          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                            <h4 className="text-xs font-bold text-slate-400 uppercase font-mono">
                              Technical Rules &amp; Evaluation Constraints
                            </h4>
                            <p className="text-xs text-slate-300 whitespace-pre-line font-mono leading-relaxed">
                              {problemStatement.rules}
                            </p>
                          </div>
                        )}

                        {problemStatement?.evaluationCriteria && (
                          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-400/20 text-xs text-slate-300">
                            <strong className="text-cyan-300 font-mono">Evaluation Rubric:</strong> {problemStatement.evaluationCriteria}
                          </div>
                        )}

                        {problemStatement?.starterRepoUrl && (
                          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-300 flex items-center gap-2">
                              <Github className="w-4 h-4 text-white" />
                              <span>Starter Codebase:</span>
                            </span>
                            <a 
                              href={problemStatement.starterRepoUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-cyan-400 hover:underline flex items-center gap-1 font-mono"
                            >
                              <span>Open Repository</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: PROJECT DELIVERABLES SUBMISSION FORM */}
              <div className="space-y-6">
                <div className="p-6 sm:p-7 rounded-3xl bg-slate-900 border border-white/10 shadow-xl space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Send className="w-4 h-4 text-cyan-400" />
                        <span>Project Submission Deliverables</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Submit live deployed links, GitHub, credentials, and notes for founder evaluation.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-mono font-bold text-slate-300">
                        {isSubmissionClosed ? (
                          <span className="text-rose-400">Locked by Admin</span>
                        ) : (
                          <span>Submission Open</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {saveSuccess && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Submission recorded successfully! Updated in live jury roster.</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmitProject} className="space-y-4">
                    {/* Live URL */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Completed / Deployed Live Link *</span>
                      </label>
                      <input
                        type="url"
                        required
                        disabled={isSubmissionClosed}
                        placeholder="https://nexus-sprint.vercel.app"
                        value={liveUrl}
                        onChange={(e) => setLiveUrl(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
                      />
                    </div>

                    {/* GitHub Repo */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                        <Github className="w-3.5 h-3.5 text-white" />
                        <span>Public GitHub Repository URL *</span>
                      </label>
                      <input
                        type="url"
                        required
                        disabled={isSubmissionClosed}
                        placeholder="https://github.com/team-nexus/sprint-project"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
                      />
                    </div>

                    {/* Evaluator Testing Details */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 font-mono">
                        <Key className="w-3.5 h-3.5" />
                        <span>TESTING CREDENTIALS FOR EVALUATION</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Demo Login ID</label>
                          <input
                            type="text"
                            disabled={isSubmissionClosed}
                            placeholder="admin@demo.com"
                            value={testLogin}
                            onChange={(e) => setTestLogin(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none disabled:opacity-50"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Demo Password</label>
                          <input
                            type="text"
                            disabled={isSubmissionClosed}
                            placeholder="Demo@Pass2026"
                            value={testPassword}
                            onChange={(e) => setTestPassword(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none disabled:opacity-50"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Test API Key</label>
                          <input
                            type="text"
                            disabled={isSubmissionClosed}
                            placeholder="sk-test-..."
                            value={testApiKeys}
                            onChange={(e) => setTestApiKeys(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none disabled:opacity-50"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Working Notes */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>Operational Notes: How to Test &amp; Run *</span>
                      </label>
                      <textarea
                        rows={3}
                        required
                        disabled={isSubmissionClosed}
                        placeholder="Instructions for judges: 1. Visit live link, 2. Log in with demo credentials, 3. Upload test data..."
                        value={workingNotes}
                        onChange={(e) => setWorkingNotes(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
                      />
                    </div>

                    {/* Remarks */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Architecture Remarks / Future Scope
                      </label>
                      <input
                        type="text"
                        disabled={isSubmissionClosed}
                        placeholder="e.g. Distributed token bucket with Redis; zero-loss failover."
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
                      />
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <span className="text-xs text-slate-400 font-mono">
                        {currentTeam.submission?.submittedAt ? (
                          <span>Submitted: {new Date(currentTeam.submission.submittedAt).toLocaleString('en-IN')}</span>
                        ) : (
                          <span>Status: Draft pending submission</span>
                        )}
                      </span>

                      <button
                        type="submit"
                        disabled={isSubmissionClosed || isSaving}
                        className={`btn-primary text-xs px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 cursor-pointer ${
                          isSubmissionClosed ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <Send className="w-4 h-4" />
                        <span>{isSaving ? 'Submitting Deliverables...' : 'Save & Submit Project Deliverables'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

    </div>
  );
};
