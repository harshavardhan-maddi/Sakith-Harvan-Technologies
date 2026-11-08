import React, { useState } from 'react';
import { 
  X, Check, AlertCircle, Copy, CheckCircle2, Shield, Users, 
  CreditCard, Sparkles, ArrowRight, ArrowLeft, Key, Lock, School, MapPin, Mail, Phone, User, Rocket, Clock
} from 'lucide-react';
import { registerHackathonTeam } from '../../lib/hackathonStore';

export const HackathonRegistrationModal = ({ 
  isOpen, 
  onClose, 
  hackathon, 
  onRegistrationSuccess, 
  onOpenWorkspace 
}) => {
  const [step, setStep] = useState(1); // 1: Statement, 2: Squad Details, 3: Fee Payment, 4: Credentials
  const [selectedStatementId, setSelectedStatementId] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamSize, setTeamSize] = useState(3);
  const [members, setMembers] = useState([
    { name: '', mobile: '', email: '', college: '', location: '' },
    { name: '', mobile: '', email: '', college: '', location: '' },
    { name: '', mobile: '', email: '', college: '', location: '' }
  ]);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  if (!isOpen || !hackathon) return null;

  // Handle Team Size Change
  const handleTeamSizeChange = (newSize) => {
    setTeamSize(newSize);
    const updated = [...members];
    while (updated.length < newSize) {
      updated.push({ name: '', mobile: '', email: '', college: '', location: '' });
    }
    setMembers(updated.slice(0, newSize));
  };

  const updateMember = (index, field, value) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  // Validate Squad details
  const handleProceedToPayment = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!teamName.trim()) {
      setErrorMsg('Please enter a valid Team Name.');
      return;
    }

    // Check member details
    for (let i = 0; i < teamSize; i++) {
      const m = members[i];
      if (!m.name.trim() || !m.mobile.trim() || !m.email.trim() || !m.college.trim()) {
        setErrorMsg(`Please complete all required fields for Member ${i + 1} (${i === 0 ? 'Leader' : `Member ${i + 1}`}).`);
        return;
      }
      if (!m.email.includes('@') || !m.email.includes('.')) {
        setErrorMsg(`Please enter a valid email address for Member ${i + 1}.`);
        return;
      }
    }

    setStep(3); // Proceed to Payment
  };

  // Confirm Registration & Pay Fee
  const handleConfirmRegistration = () => {
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const registered = registerHackathonTeam({
        hackathonId: hackathon.id,
        teamName,
        teamSize,
        problemStatementId: selectedStatementId,
        members: members.slice(0, teamSize),
        entryFee: hackathon.entryFee || 0
      });

      setCreatedCredentials(registered);
      setStep(4); // Show Credentials Screen
      if (onRegistrationSuccess) {
        onRegistrationSuccess(registered);
      }
    } catch (err) {
      console.error('Registration failed:', err);
      setErrorMsg('Failed to process squad registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'id') {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    }
  };

  const handleLaunchWorkspace = () => {
    if (onOpenWorkspace && createdCredentials) {
      onOpenWorkspace(createdCredentials);
    }
    onClose();
  };

  const chosenStatement = hackathon.problemStatements?.find(ps => ps.id === selectedStatementId);

  return (
    <div className="fixed inset-0 z-50 w-full max-w-full h-screen min-h-screen bg-[#090A0F] text-slate-100 flex flex-col overflow-x-hidden overflow-y-auto animate-in fade-in duration-200 selection:bg-amber-500 selection:text-slate-950">
      
      {/* FULL-SCREEN STICKY TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 w-full px-6 py-4 bg-slate-950/95 backdrop-blur-md border-b border-white/10 flex items-center justify-between shadow-xl text-white">
        <div className="flex items-center gap-3">
          {hackathon.logoUrl ? (
            <div className="w-10 h-10 rounded-xl bg-black/60 border border-white/15 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-md">
              <img
                src={hackathon.logoUrl}
                alt={hackathon.title}
                className="w-full h-full object-contain"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
              <Rocket className="w-5 h-5 text-slate-950" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                NEXARVA • Squad Registration Engine
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-mono border border-amber-500/20">
                {hackathon.theme}
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-extrabold text-white line-clamp-1">
              {hackathon.title}
            </h1>
          </div>
        </div>

        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
        >
          <span>Exit Full Screen</span>
          <X className="w-4 h-4 ml-1" />
        </button>
      </header>

      {/* STEP PROGRESS TRACKER */}
      <div className="w-full bg-[#0D0F17] border-b border-white/10 py-3 px-6 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs font-bold text-slate-400">
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${step >= 1 ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-sm' : 'bg-white/10 text-slate-400'}`}>1</span>
            <span className={step === 1 ? 'text-amber-400 font-extrabold' : ''}>Problem Statement</span>
          </div>
          <span className="text-slate-300">———</span>
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${step >= 2 ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold' : 'bg-white/10 text-slate-400'}`}>2</span>
            <span className={step === 2 ? 'text-amber-400 font-extrabold' : ''}>Squad Roster</span>
          </div>
          <span className="text-slate-300">———</span>
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${step >= 3 ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold' : 'bg-white/10 text-slate-400'}`}>3</span>
            <span className={step === 3 ? 'text-amber-400 font-extrabold' : ''}>Fixed Entry Fee</span>
          </div>
          <span className="text-slate-300">———</span>
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${step === 4 ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold' : 'bg-white/10 text-slate-400'}`}>4</span>
            <span className={step === 4 ? 'text-emerald-400 font-extrabold' : ''}>Credentials Issued</span>
          </div>
        </div>
      </div>

      {/* FULL-SCREEN MAIN BODY */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-8">
        
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center gap-3 shadow-md">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: SELECT PROBLEM STATEMENT */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-2">
                <span>Optional Pre-Selection</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white">Choose Problem Statement (Optional)</h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
                You can select your challenge now, OR register your squad first and lock your statement later inside the team workspace within the admin deadline.
              </p>
            </div>

            {/* Option to Decide Later Card */}
            <div
              onClick={() => setSelectedStatementId('')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedStatementId === ''
                  ? 'border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/40 text-white'
                  : 'border-white/10 bg-[#12141F] hover:border-white/20 text-white'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold shrink-0 border border-amber-500/30">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded">
                      FLEXIBLE TRACK
                    </span>
                    <span className="text-xs font-bold text-emerald-400">Decide Later Enabled</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white mt-1">
                    Decide &amp; Lock Problem Statement Later in Squad Workspace
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Register squad details first. You can collaborate with your teammates and lock your statement before the admin cutoff.
                  </p>
                </div>
              </div>

              <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-3 ${selectedStatementId === '' ? 'border-amber-400 bg-amber-500 text-slate-950 font-black' : 'border-white/20'}`}>
                {selectedStatementId === '' && <Check className="w-3.5 h-3.5" />}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hackathon.problemStatements?.map((ps) => {
                const isSelected = selectedStatementId === ps.id;
                return (
                  <div
                    key={ps.id}
                    onClick={() => setSelectedStatementId(ps.id)}
                    className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/40 text-white'
                        : 'border-white/10 bg-[#12141F] hover:border-amber-500/30 text-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded">
                            {ps.id}
                          </span>
                          <span className="text-xs font-bold text-slate-300">
                            {ps.track}
                          </span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-amber-400 bg-amber-500 text-slate-950 font-black' : 'border-white/20'}`}>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-white mt-3">{ps.title}</h3>
                      <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed font-normal">{ps.summary}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400 font-mono text-[11px] font-bold">NEXARVA Verified Track</span>
                      <span className={isSelected ? 'text-amber-300 font-bold' : 'text-slate-400'}>
                        {isSelected ? 'Statement Selected' : 'Click to Select Now'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedStatementId('');
                  setErrorMsg('');
                  setStep(2);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-white/15 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer"
              >
                Skip Statement (Decide Later)
              </button>

              <button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setStep(2);
                }}
                className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs sm:text-sm px-7 py-3 rounded-xl font-black flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 cursor-pointer transition-all"
              >
                <span>
                  {selectedStatementId ? 'Proceed with Selected Statement' : 'Proceed to Squad Profile (Choose Later)'}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: SQUAD PROFILE & MEMBERS */}
        {step === 2 && (
          <form onSubmit={handleProceedToPayment} className="space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Squad Profile &amp; Member Roster</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Enter your squad name and member profiles. Member 1 is designated as the Team Leader for communication.
              </p>
            </div>

            {/* Team Name & Size Selector */}
            <div className="p-6 rounded-2xl bg-[#12141F] border border-white/10 shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Team / Squad Name *
                </label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Nexus, CyberKnights, AlgoTitans"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Squad Size (Members) *
                </label>
                <div className="flex gap-2">
                  {[2, 3, 4, 5].map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => handleTeamSizeChange(sz)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        teamSize === sz
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/20'
                          : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Dynamic Member Cards */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span>Squad Members Information ({teamSize} Members)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: teamSize }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl border shadow-md ${idx === 0 ? 'border-amber-500/40 bg-amber-500/5' : 'border-white/10 bg-[#12141F]'}`}
                  >
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                      <span className="text-xs font-bold text-white flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[11px] font-mono flex items-center justify-center font-black">
                          {idx + 1}
                        </span>
                        <span>{idx === 0 ? 'Member 1 (Team Leader & POC)' : `Member ${idx + 1}`}</span>
                      </span>
                      {idx === 0 && (
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Lead Contact
                        </span>
                      )}
                    </div>

                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-0.5">Full Name *</label>
                        <div className="relative">
                          <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            required
                            placeholder="Full name"
                            value={members[idx]?.name || ''}
                            onChange={(e) => updateMember(idx, 'name', e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-white/15 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none bg-black/50"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-300 mb-0.5">WhatsApp Mobile *</label>
                          <div className="relative">
                            <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                            <input
                              type="tel"
                              required
                              placeholder="+91 9876543210"
                              value={members[idx]?.mobile || ''}
                              onChange={(e) => updateMember(idx, 'mobile', e.target.value)}
                              className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-white/15 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none bg-black/50"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-300 mb-0.5">Email *</label>
                          <div className="relative">
                            <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                            <input
                              type="email"
                              required
                              placeholder="dev@college.edu"
                              value={members[idx]?.email || ''}
                              onChange={(e) => updateMember(idx, 'email', e.target.value)}
                              className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-white/15 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none bg-black/50"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-300 mb-0.5">College / Univ *</label>
                          <div className="relative">
                            <School className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                            <input
                              type="text"
                              required
                              placeholder="e.g. VIT, IIT, SRM"
                              value={members[idx]?.college || ''}
                              onChange={(e) => updateMember(idx, 'college', e.target.value)}
                              className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-white/15 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none bg-black/50"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-300 mb-0.5">City / Location</label>
                          <div className="relative">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                            <input
                              type="text"
                              placeholder="e.g. Chennai, Pune"
                              value={members[idx]?.location || ''}
                              onChange={(e) => updateMember(idx, 'location', e.target.value)}
                              className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-white/15 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none bg-black/50"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 flex items-center justify-between border-t border-white/10">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 border border-white/15 flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Statements</span>
              </button>
              <button
                type="submit"
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs sm:text-sm px-7 py-3 rounded-xl font-black flex items-center gap-2 shadow-lg shadow-amber-500/25 cursor-pointer transition-all"
              >
                <span>Continue to Entry Fee</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: FIXED ENTRY FEE CONFIRMATION */}
        {step === 3 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-white text-center">Fixed Squad Entry Fee Confirmation</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 text-center">
                Confirm your squad registration to instantly issue your Team ID and Secret Password.
              </p>
            </div>

            {/* Order Summary Card */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-[#12141F] via-[#161928] to-[#0D0F17] text-white border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider">Official Registration Order</span>
                  <h3 className="text-lg font-bold text-white mt-0.5">{hackathon.title}</h3>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono text-xs font-bold">
                  Squad of {teamSize} Devs
                </span>
              </div>

              <div className="py-5 space-y-2.5 text-xs sm:text-sm text-slate-300">
                <div className="flex justify-between">
                  <span>Squad Name:</span>
                  <span className="font-bold text-white">{teamName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Problem Statement:</span>
                  <span className="font-semibold text-amber-200 line-clamp-1">
                    {chosenStatement ? chosenStatement.title : '⏱️ Pending (Can choose & lock inside Squad Workspace before deadline)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Team Leader:</span>
                  <span className="font-semibold text-white">{members[0]?.name}</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-white/10 text-base sm:text-lg font-extrabold text-white">
                  <span>Fixed Entry Fee (Total Squad):</span>
                  <span className="text-amber-400 font-mono text-2xl font-black">
                    {hackathon.entryFee > 0 ? `₹${hackathon.entryFee}` : 'FREE ENTRY'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-3">
              <Shield className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                NEXARVA Instant Confirmation: Secure algorithm immediately generates your unique Squad Credentials upon clicking below.
              </span>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 border border-white/15 flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Squad Profile</span>
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmRegistration}
                className="px-7 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/30 flex items-center gap-2 cursor-pointer transition-all"
              >
                {isSubmitting ? (
                  <span>Registering Squad...</span>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 text-slate-950" />
                    <span>Confirm &amp; Generate Credentials</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: SQUAD CREDENTIALS GENERATED */}
        {step === 4 && createdCredentials && (
          <div className="max-w-2xl mx-auto space-y-8 text-center py-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/40 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/20">
              <CheckCircle2 className="w-10 h-10 text-amber-400" />
            </div>

            <div>
              <h2 className="text-3xl font-extrabold text-white">
                Squad Registration Confirmed!
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mt-2">
                Your squad has been enrolled in {hackathon.title}. Save your login credentials below to access your full-screen squad workspace.
              </p>
            </div>

            {/* Credentials Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#12141F] text-white border border-amber-500/30 shadow-2xl space-y-5 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono text-amber-400">
                <span>SQUAD ACCESS CREDENTIALS</span>
                <span className="text-[10px] bg-amber-500/15 text-amber-300 px-2.5 py-0.5 rounded border border-amber-500/30 font-bold">
                  OFFICIAL NEXARVA PASS
                </span>
              </div>

              {/* Team ID */}
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase">Team Login ID</label>
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/60 border border-white/15 mt-1">
                  <span className="font-mono text-lg font-extrabold text-white tracking-wider">
                    {createdCredentials.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(createdCredentials.id, 'id')}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-amber-300 border border-amber-500/30 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-300" />}
                    <span>{copiedId ? 'Copied' : 'Copy ID'}</span>
                  </button>
                </div>
              </div>

              {/* Team Password */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono text-slate-400 uppercase">Team Secret Password</label>
                  <span className="text-[10px] font-mono text-slate-400">Formula: Name+SHT+Size+ID</span>
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/60 border border-white/15 mt-1">
                  <span className="font-mono text-base sm:text-lg font-extrabold text-amber-300 tracking-wider">
                    {createdCredentials.password}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(createdCredentials.password, 'pass')}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-amber-300 border border-amber-500/30 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    {copiedPass ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-300" />}
                    <span>{copiedPass ? 'Copied' : 'Copy Password'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Launch Workspace CTA */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleLaunchWorkspace}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Launch Full Screen Squad Workspace</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white font-bold text-xs sm:text-sm border border-white/15 cursor-pointer transition-colors"
              >
                <span>Close Window</span>
              </button>
            </div>
          </div>
        )}

      </main>

    </div>
  );
};
