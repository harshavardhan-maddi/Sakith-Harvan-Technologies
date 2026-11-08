import React, { useState, useEffect } from 'react';
import { 
  Trophy, Sparkles, Rocket, Clock, Users, IndianRupee, Key, 
  HelpCircle, ChevronRight, ShieldCheck, CheckCircle2, ArrowRight, 
  Search, Filter, ExternalLink, Github, Award, Zap, Lock
} from 'lucide-react';
import { 
  getStoredHackathons, 
  getStoredHackathonRegistrations,
  syncHackathonsFromSupabase,
  syncHackathonRegistrationsFromSupabase
} from '../../lib/hackathonStore';
import { supabase } from '../../lib/supabaseClient';
import { HackathonEmptyStateCard } from './HackathonEmptyStateCard';
import { HackathonDetailsModal } from './HackathonDetailsModal';
import { HackathonRegistrationModal } from './HackathonRegistrationModal';
import { HackathonTeamWorkspaceModal } from './HackathonTeamWorkspaceModal';
import { HackathonHelpProcess } from './HackathonHelpProcess';
import nexarvaBanner from '../../assets/nexarva-banner.jpg';

export const HackathonsPage = ({ onOpenRequirement, onOpenConsultation }) => {
  const [hackathons, setHackathons] = useState(() => getStoredHackathons());
  const [registrations, setRegistrations] = useState(() => getStoredHackathonRegistrations());
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'past' | 'blueprint'
  
  // Modals state
  const [selectedHackathonForDetails, setSelectedHackathonForDetails] = useState(null);
  const [selectedHackathonForReg, setSelectedHackathonForReg] = useState(null);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [workspaceInitialTeam, setWorkspaceInitialTeam] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Multi-device sync: local listeners + Supabase PostgreSQL Realtime channel
  useEffect(() => {
    // 1. Initial background fetch from Supabase
    syncHackathonsFromSupabase().then((hList) => {
      if (hList && Array.isArray(hList)) setHackathons(hList);
    });
    syncHackathonRegistrationsFromSupabase().then((rList) => {
      if (rList && Array.isArray(rList)) setRegistrations(rList);
    });

    // 2. Local storage event sync
    const handleSync = () => {
      setHackathons(getStoredHackathons());
      setRegistrations(getStoredHackathonRegistrations());
    };
    window.addEventListener('sh_hackathons_updated', handleSync);
    window.addEventListener('sh_hackathon_registrations_updated', handleSync);

    // 3. Supabase Realtime multi-device subscription
    let channel = null;
    try {
      const channelId = `hackathons_public_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      channel = supabase
        .channel(channelId)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'hackathons' },
          () => {
            syncHackathonsFromSupabase().then((hList) => {
              if (hList && Array.isArray(hList)) setHackathons(hList);
            });
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'hackathon_registrations' },
          () => {
            syncHackathonRegistrationsFromSupabase().then((rList) => {
              if (rList && Array.isArray(rList)) setRegistrations(rList);
            });
          }
        )
        .subscribe();
    } catch (e) {
      console.warn('Realtime subscription error on hackathons:', e);
    }

    return () => {
      window.removeEventListener('sh_hackathons_updated', handleSync);
      window.removeEventListener('sh_hackathon_registrations_updated', handleSync);
      if (channel) {
        try { supabase.removeChannel(channel); } catch (e) {}
      }
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Filter Active vs Completed
  const activeHackathons = hackathons.filter(h => h.status === 'active' || h.status === 'upcoming');
  const pastHackathons = hackathons.filter(h => h.status === 'completed');

  // Count teams registered for a given hackathon
  const getTeamCountForHackathon = (hackathonId) => {
    return registrations.filter(r => r.hackathonId === hackathonId).length;
  };

  return (
    <div className="pt-20 pb-20 bg-[#090A0F] text-slate-100 min-h-screen selection:bg-amber-500 selection:text-slate-950 w-full max-w-full overflow-x-hidden">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 p-4 rounded-xl bg-slate-900 text-white border border-amber-400 shadow-2xl flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold text-white">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Header - Nexarva Flagship Presentation */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#050507] via-[#090A0F] to-[#0D0F17] text-white py-12 px-4 sm:px-6 border-b border-white/5">
        {/* Glow Halo behind the central X */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container-custom relative z-10 max-w-5xl mx-auto text-center space-y-4">
          
          {/* Sakith Harvan Technologies Presents Pill (Matches Image 4) */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-400 text-xs sm:text-sm font-semibold tracking-wide shadow-lg shadow-amber-500/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Sakith Harvan Technologies Presents</span>
            </div>
          </div>

          {/* Official NEXARVA Brand Banner (Matches Image 5) */}
          <div className="relative max-w-3xl mx-auto flex flex-col items-center justify-center pt-1 pb-1">
            <div className="relative group w-full flex items-center justify-center">
              {/* Golden Ambient Glow matching the glowing X */}
              <div className="absolute inset-0 max-w-xl mx-auto bg-gradient-to-r from-amber-500/0 via-amber-500/25 to-amber-500/0 blur-3xl rounded-3xl pointer-events-none" />
              <img
                src={nexarvaBanner}
                alt="NEXARVA - THINK BOLD. BUILD BEYOND."
                className="relative z-10 w-full max-w-2xl h-auto object-contain rounded-2xl shadow-2xl border border-white/10"
              />
            </div>
          </div>

          <p className="text-slate-300 text-xs sm:text-sm font-medium tracking-wide max-w-2xl mx-auto">
            Where bold ideas meet relentless execution. Think Bold. Build Beyond.
          </p>

          {/* Tab Navigation & Squad Workspace Login CTA */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex p-1.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'active'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold shadow-lg shadow-amber-500/25'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Live Hackathons ({activeHackathons.length})
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'past'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold shadow-lg shadow-amber-500/25'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Past Events &amp; Hall of Fame ({pastHackathons.length})
              </button>
              <button
                onClick={() => setActiveTab('blueprint')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'blueprint'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold shadow-lg shadow-amber-500/25'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Process Blueprint &amp; Help
              </button>
            </div>

            <button
              onClick={() => setIsWorkspaceOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-2 shadow-lg backdrop-blur-md cursor-pointer transition-all"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Participant Squad Login</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <div className="container-custom max-w-6xl mx-auto px-4 sm:px-6 py-12">
        
        {/* ======================================================== */}
        {/* VIEW 1: ACTIVE HACKATHONS (WITH BENTO GRID & 3D EMPTY)    */}
        {/* ======================================================== */}
        {activeTab === 'active' && (
          <div>
            {/* CONDITIONAL RENDERING: 
                If active events array is empty, replace with minimalist 3D empty state card */}
            {activeHackathons.length === 0 ? (
              <HackathonEmptyStateCard
                onViewPastEvents={() => setActiveTab('past')}
                onExploreRoadmaps={onOpenRequirement}
              />
            ) : (
              <div className="space-y-8">
                
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/10">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                      Live Challenges &amp; Open Registrations
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                      Explore hackathon challenges presented by NEXARVA. Click any card to inspect statements, timelines, and squad registration rules.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 self-start sm:self-auto">
                    {activeHackathons.length} Live Challenge{activeHackathons.length > 1 ? 's' : ''}
                  </span>
                </div>

                {/* BENTO GRID OF ACTIVE HACKATHONS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeHackathons.map((hck) => {
                    const teamCount = getTeamCountForHackathon(hck.id);
                    const isClosed = hck.registrationDeadline && new Date() > new Date(hck.registrationDeadline);

                    return (
                      <div
                        key={hck.id}
                        onClick={() => setSelectedHackathonForDetails(hck)}
                        className="group relative rounded-2xl bg-[#11131C] border border-white/10 hover:border-amber-500/50 p-6 sm:p-7 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col justify-between cursor-pointer overflow-hidden"
                      >
                        {/* Ambient Card Corner Glow */}
                        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/15 transition-colors pointer-events-none" />

                        <div className="space-y-4">
                          {/* Bento Top Header Chunks */}
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono font-bold flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3 text-amber-400" />
                              <span>Presented by NEXARVA • {hck.theme}</span>
                            </span>
                            
                            {/* Real-time Registered Teams Pill */}
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              <span>{teamCount} Teams Registered (Live)</span>
                            </span>
                          </div>

                          {/* Title & Tagline with optional Hackathon Custom Logo */}
                          <div className="flex items-start gap-3">
                            {hck.logoUrl && (
                              <div className="w-12 h-12 rounded-xl bg-black/50 border border-white/10 p-1.5 flex items-center justify-center shrink-0 overflow-hidden shadow-md">
                                <img
                                  src={hck.logoUrl}
                                  alt={hck.title}
                                  className="w-full h-full object-contain"
                                  onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <h3 className="text-lg sm:text-xl font-extrabold text-white group-hover:text-amber-400 transition-colors line-clamp-2">
                                {hck.title}
                              </h3>
                              <p className="text-xs sm:text-sm text-slate-300 mt-1 line-clamp-2 leading-relaxed font-normal">
                                {hck.tagline}
                              </p>
                            </div>
                          </div>

                          {/* Bento Micro-Chunks Grid */}
                          <div className="grid grid-cols-3 gap-2.5 pt-2">
                            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
                              <span className="block text-[10px] font-mono text-slate-400 uppercase font-bold">Squad Size</span>
                              <span className="text-xs font-extrabold text-white">{hck.minTeamSize}-{hck.maxTeamSize} Devs</span>
                            </div>

                            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
                              <span className="block text-[10px] font-mono text-slate-400 uppercase font-bold">Entry Fee</span>
                              <span className="text-xs font-extrabold text-amber-400 font-mono">
                                {hck.entryFee > 0 ? `₹${hck.entryFee}` : 'FREE'}
                              </span>
                            </div>

                            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
                              <span className="block text-[10px] font-mono text-slate-400 uppercase font-bold">Statements</span>
                              <span className="text-xs font-extrabold text-cyan-300 font-mono">
                                {hck.problemStatements?.length || 0} Tracks
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Bento Card Footer Action */}
                        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-slate-300">
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>
                              {isClosed ? 'Registration closed' : `Closes: ${new Date(hck.registrationDeadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`}
                            </span>
                          </div>

                          <span className="inline-flex items-center gap-1 text-amber-400 font-bold group-hover:text-amber-300 group-hover:translate-x-1 transition-transform">
                            <span>Inspect &amp; Register</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Embedded Process Help Preview */}
                <div className="pt-6">
                  <HackathonHelpProcess />
                </div>

              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: PAST EVENTS & HALL OF FAME                       */}
        {/* ======================================================== */}
        {activeTab === 'past' && (
          <div className="space-y-8">
            <div className="pb-4 border-b border-white/10">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
                <Trophy className="w-6 h-6 text-amber-400" />
                <span>Past Hackathons &amp; Hall of Fame Winners</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Explore previous completed hackathons presented by NEXARVA, winning engineering squads, their chosen problem statements, and deployed projects.
              </p>
            </div>

            {pastHackathons.length === 0 ? (
              <div className="p-12 rounded-2xl bg-[#11131C] border border-white/10 text-center space-y-2">
                <Trophy className="w-10 h-10 text-slate-500 mx-auto" />
                <h3 className="text-base font-bold text-white">No completed hackathons archived yet</h3>
                <p className="text-xs text-slate-400">
                  Winners will be officially published here once the active sprint season concludes.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {pastHackathons.map((ph) => (
                  <div key={ph.id} className="rounded-2xl bg-[#11131C] border border-white/10 overflow-hidden shadow-xl space-y-6 p-6 sm:p-8 text-white">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded">
                            {ph.id}
                          </span>
                          <span className="text-xs text-slate-400">Presented by NEXARVA • {ph.theme}</span>
                        </div>
                        <h3 className="text-xl font-extrabold text-white mt-1">{ph.title}</h3>
                        <p className="text-xs sm:text-sm text-slate-300 mt-0.5">{ph.tagline}</p>
                      </div>

                      <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-xs font-bold self-start sm:self-auto">
                        Grand Finale Completed
                      </span>
                    </div>

                    {/* Winners Podium Cards */}
                    {ph.winners && (
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                          <Award className="w-4 h-4 text-amber-400" />
                          <span>Hall of Fame Podium Squads</span>
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* 1st Place */}
                          {ph.winners.first && (
                            <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-950/60 via-slate-900 to-[#12141F] border border-amber-500/50 shadow-lg space-y-3 relative overflow-hidden text-white">
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-xs font-extrabold text-amber-300 bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 rounded-full">
                                  {ph.winners.first.badge || '🏆 Champion'}
                                </span>
                                <span className="text-[11px] font-mono text-amber-400 font-bold">{ph.winners.first.teamId}</span>
                              </div>

                              <div>
                                <h5 className="text-base font-extrabold text-white">
                                  Team {ph.winners.first.teamName}
                                </h5>
                                <p className="text-xs text-slate-300 mt-0.5">
                                  Leader: <strong className="text-white">{ph.winners.first.teamLeader}</strong> • {ph.winners.first.college}
                                </p>
                              </div>

                              <div className="p-3 rounded-xl bg-black/50 border border-amber-500/20 text-xs space-y-1">
                                <span className="font-bold text-slate-400 text-[11px] block">Problem Statement Solved:</span>
                                <p className="text-slate-200 font-semibold line-clamp-2">{ph.winners.first.problemStatementTitle}</p>
                              </div>

                              <div className="pt-1 text-xs font-bold text-amber-300">
                                {ph.winners.first.prize}
                              </div>
                            </div>
                          )}

                          {/* 2nd Place */}
                          {ph.winners.second && (
                            <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-[#12141F] border border-slate-700/60 shadow-lg space-y-3 text-white">
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-xs font-extrabold text-slate-200 bg-slate-800 border border-slate-600 px-2.5 py-0.5 rounded-full">
                                  {ph.winners.second.badge || '🥈 Runner Up'}
                                </span>
                                <span className="text-[11px] font-mono text-slate-400 font-bold">{ph.winners.second.teamId}</span>
                              </div>

                              <div>
                                <h5 className="text-base font-extrabold text-white">
                                  Team {ph.winners.second.teamName}
                                </h5>
                                <p className="text-xs text-slate-300 mt-0.5">
                                  Leader: <strong className="text-white">{ph.winners.second.teamLeader}</strong> • {ph.winners.second.college}
                                </p>
                              </div>

                              <div className="p-3 rounded-xl bg-black/50 border border-white/10 text-xs space-y-1">
                                <span className="font-bold text-slate-400 text-[11px] block">Problem Statement Solved:</span>
                                <p className="text-slate-200 font-semibold line-clamp-2">{ph.winners.second.problemStatementTitle}</p>
                              </div>

                              <div className="pt-1 text-xs font-bold text-cyan-300">
                                {ph.winners.second.prize}
                              </div>
                            </div>
                          )}

                          {/* 3rd Place */}
                          {ph.winners.third && (
                            <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-950/30 via-slate-900 to-[#12141F] border border-amber-800/40 shadow-lg space-y-3 text-white">
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-xs font-extrabold text-amber-400 bg-amber-950/80 border border-amber-700/60 px-2.5 py-0.5 rounded-full">
                                  {ph.winners.third.badge || '🥉 2nd Runner Up'}
                                </span>
                                <span className="text-[11px] font-mono text-amber-500 font-bold">{ph.winners.third.teamId}</span>
                              </div>

                              <div>
                                <h5 className="text-base font-extrabold text-white">
                                  Team {ph.winners.third.teamName}
                                </h5>
                                <p className="text-xs text-slate-300 mt-0.5">
                                  Leader: <strong className="text-white">{ph.winners.third.teamLeader}</strong> • {ph.winners.third.college}
                                </p>
                              </div>

                              <div className="p-3 rounded-xl bg-black/50 border border-white/10 text-xs space-y-1">
                                <span className="font-bold text-slate-400 text-[11px] block">Problem Statement Solved:</span>
                                <p className="text-slate-200 font-semibold line-clamp-2">{ph.winners.third.problemStatementTitle}</p>
                              </div>

                              <div className="pt-1 text-xs font-bold text-amber-400">
                                {ph.winners.third.prize}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 3: PROCESS BLUEPRINT & BLOOM'S TAXONOMY             */}
        {/* ======================================================== */}
        {activeTab === 'blueprint' && (
          <div className="space-y-6">
            <HackathonHelpProcess />
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* MODALS INTEGRATION                                       */}
      {/* ======================================================== */}
      {/* 1. Hackathon Details & Problem Statement Modal */}
      {selectedHackathonForDetails && (
        <HackathonDetailsModal
          isOpen={!!selectedHackathonForDetails}
          hackathon={selectedHackathonForDetails}
          registeredCount={getTeamCountForHackathon(selectedHackathonForDetails.id)}
          onClose={() => setSelectedHackathonForDetails(null)}
          onRegisterClick={(hck) => {
            setSelectedHackathonForReg(hck);
          }}
          onWorkspaceClick={() => {
            setIsWorkspaceOpen(true);
          }}
        />
      )}

      {/* 2. Squad Registration Modal */}
      {selectedHackathonForReg && (
        <HackathonRegistrationModal
          isOpen={!!selectedHackathonForReg}
          hackathon={selectedHackathonForReg}
          onClose={() => setSelectedHackathonForReg(null)}
          onRegistrationSuccess={(teamCreds) => {
            showToast(`Squad registered! Team ID: ${teamCreds.id} saved.`);
          }}
          onOpenWorkspace={(teamCreds) => {
            setWorkspaceInitialTeam(teamCreds);
            setIsWorkspaceOpen(true);
          }}
        />
      )}

      {/* 3. Squad Workspace & Participant Submission Portal */}
      {isWorkspaceOpen && (
        <HackathonTeamWorkspaceModal
          isOpen={isWorkspaceOpen}
          initialTeam={workspaceInitialTeam}
          onClose={() => {
            setIsWorkspaceOpen(false);
            setWorkspaceInitialTeam(null);
          }}
        />
      )}

    </div>
  );
};

