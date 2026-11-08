import React, { useState, useEffect } from 'react';
import { 
  FileText, HelpCircle, CheckCircle2, Clock, Send, 
  ExternalLink, MessageSquare, AlertCircle, Sparkles, Filter 
} from 'lucide-react';
import { 
  getStoredDailyStatus, 
  getStoredHelpRequests, 
  saveHelpRequests 
} from '../../lib/enterprisePortalStore';

export const DailyStatusHelpAdmin = () => {
  const [activeTab, setActiveTab] = useState('daily_status'); // 'daily_status' | 'help_requests'
  const [dailyStatuses, setDailyStatuses] = useState(getStoredDailyStatus());
  const [helpRequests, setHelpRequests] = useState(getStoredHelpRequests());

  const [respondingHelpId, setRespondingHelpId] = useState(null);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    const handleStatusUpdate = () => setDailyStatuses(getStoredDailyStatus());
    const handleHelpUpdate = () => setHelpRequests(getStoredHelpRequests());
    window.addEventListener('sh_daily_status_updated', handleStatusUpdate);
    window.addEventListener('sh_help_updated', handleHelpUpdate);
    return () => {
      window.removeEventListener('sh_daily_status_updated', handleStatusUpdate);
      window.removeEventListener('sh_help_updated', handleHelpUpdate);
    };
  }, []);

  const handleResolveHelp = (id) => {
    const updated = helpRequests.map(h => {
      if (h.id === id) {
        return {
          ...h,
          status: 'Resolved',
          adminResponse: responseText || 'Acknowledged and addressed by technical management.'
        };
      }
      return h;
    });
    setHelpRequests(updated);
    saveHelpRequests(updated);
    setRespondingHelpId(null);
    setResponseText('');
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher - Clean Website Light UI */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 max-w-md shadow-xs">
        <button
          onClick={() => setActiveTab('daily_status')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'daily_status'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Staff Daily Updates ({dailyStatuses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('help_requests')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'help_requests'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Help Requests ({helpRequests.length})</span>
        </button>
      </div>

      {/* 1. DAILY STATUS TAB */}
      {activeTab === 'daily_status' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500 font-medium">
            Real-time feed of daily progress logs, deliverables, and blockers submitted by employees and interns.
          </div>

          <div className="space-y-4">
            {dailyStatuses.length === 0 ? (
              <div className="bg-white p-12 text-center text-slate-500 text-xs rounded-2xl border border-slate-200/90 shadow-xs">
                No daily work updates submitted yet.
              </div>
            ) : (
              dailyStatuses.map((item) => (
                <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4 text-slate-900">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-sm">{item.userName}</span>
                          <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-semibold">
                            {item.userId}
                          </span>
                          <span className="text-xs text-slate-500">• {item.userRole}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          Date: <strong className="text-slate-700">{item.date}</strong> {item.timestamp && `• ${item.timestamp}`}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content grid */}
                  <div className="space-y-2.5 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <span className="text-[10px] uppercase font-mono text-blue-700 font-bold block">Tasks Completed &amp; Progress</span>
                      <p className="text-slate-800 leading-relaxed font-medium">{item.tasksDone}</p>
                    </div>

                    {item.deliverablesUrl && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                        <span className="text-slate-600 text-[11px] font-semibold">Deliverable URL / Pull Request:</span>
                        <a 
                          href={item.deliverablesUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-mono font-semibold underline flex items-center gap-1"
                        >
                          <span className="truncate max-w-xs">{item.deliverablesUrl}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    {item.blockers && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                        <span className="text-[10px] uppercase font-mono text-amber-700 font-bold block">Obstacles / Blockers</span>
                        <p className="font-medium">{item.blockers}</p>
                      </div>
                    )}

                    {(item.tomorrowGoals || item.nextPlan) && (
                      <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-200/70 text-slate-800 space-y-1">
                        <span className="text-[10px] uppercase font-mono text-blue-700 font-bold block">Tomorrow Goals &amp; Next Objectives</span>
                        <p className="font-medium">{item.tomorrowGoals || item.nextPlan}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 2. HELP & NEED REQUESTS TAB */}
      {activeTab === 'help_requests' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500 font-medium">
            Support tickets and help requests submitted by staff members seeking technical advice, hardware access, or guidance.
          </div>

          <div className="space-y-4">
            {helpRequests.length === 0 ? (
              <div className="bg-white p-12 text-center text-slate-500 text-xs rounded-2xl border border-slate-200/90 shadow-xs">
                No active help requests submitted.
              </div>
            ) : (
              helpRequests.map((req) => {
                const isResolved = req.status === 'Resolved';

                return (
                  <div key={req.id} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4 text-slate-900">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center font-bold">
                          <HelpCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-sm">{req.userName}</span>
                            <span className="text-[11px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 font-semibold">
                              {req.userId}
                            </span>
                            <span className="text-xs text-slate-500">• {req.userRole}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                            Category: <strong className="text-slate-700">{req.category}</strong> • Urgency: <strong className="text-amber-600 font-bold">{req.urgency}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                          isResolved
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {isResolved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5 text-amber-600" />}
                          <span>{req.status || 'Open'}</span>
                        </span>

                        {!isResolved && (
                          <button
                            onClick={() => setRespondingHelpId(respondingHelpId === req.id ? null : req.id)}
                            className="btn-primary py-1.5 px-3 text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Respond / Resolve</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800 leading-relaxed">
                      <strong className="text-purple-700 block mb-1 font-bold">Help / Need Description:</strong>
                      {req.description}
                    </div>

                    {req.adminResponse && (
                      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                        <strong className="text-emerald-700 block font-bold">Leadership / Management Resolution:</strong>
                        <p>{req.adminResponse}</p>
                      </div>
                    )}

                    {/* Responding Inline Form */}
                    {respondingHelpId === req.id && (
                      <div className="p-4 rounded-xl bg-slate-50 border border-blue-200 space-y-3 animate-in fade-in">
                        <label className="block text-xs font-bold text-slate-800">Write Official Response / Guidance:</label>
                        <textarea
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          placeholder="Provide resolution details, schedule a mentoring call, or supply required access credentials..."
                          rows={3}
                          className="form-input text-xs bg-white text-slate-900 border-slate-300 focus:border-blue-600"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setRespondingHelpId(null)}
                            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleResolveHelp(req.id)}
                            className="btn-primary text-xs py-1.5 px-4 font-bold flex items-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Mark Resolved &amp; Send</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
