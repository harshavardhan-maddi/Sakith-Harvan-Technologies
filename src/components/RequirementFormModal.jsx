import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, ArrowRight, ArrowLeft, Send, Sparkles, Building, Mail, Phone, User, FileText, Clock, Video, BookOpen } from 'lucide-react';
import { saveRequirementToSupabase } from '../lib/supabaseClient';

export const RequirementFormModal = ({ isOpen, onClose, initialProduct = '', onSubmitSuccess }) => {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    email: '',
    phone: '',
    requirementType: initialProduct || 'Website',
    details: '',
    timeline: 'Within 1 month',
    preferredMethod: 'Video Meeting'
  });

  const [submitted, setSubmitted] = useState(false);
  const [leadId, setLeadId] = useState('');

  // Sync initialProduct whenever modal opens or initialProduct changes
  useEffect(() => {
    if (isOpen) {
      const selectedType = initialProduct || 'Website';
      setFormData(prev => ({
        ...prev,
        requirementType: selectedType
      }));
    }
  }, [isOpen, initialProduct]);

  if (!isOpen) return null;

  const requirementOptions = [
    'Website',
    'Web Application',
    'Mobile Application',
    'SaaS Product',
    'ERP System',
    'AI Solution',
    'Automation',
    'UI/UX Design',
    'Cloud / Deployment',
    'Custom Software',
    'Other'
  ];

  const timelineOptions = [
    'Urgent',
    'Within 1 month',
    '1–3 months',
    '3–6 months',
    'Flexible'
  ];

  const methodOptions = [
    'Phone Call',
    'WhatsApp',
    'Video Meeting',
    'In-person Meeting'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 1 && (!formData.name || !formData.email || !formData.phone)) {
      alert('Please fill out all contact fields before proceeding.');
      return;
    }
    if (step < 5) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const generatedId = 'LEAD-' + Math.floor(100000 + Math.random() * 900000);
    setLeadId(generatedId);

    const newLead = {
      id: generatedId,
      name: formData.name,
      organization: formData.organization || 'Individual',
      email: formData.email,
      phone: formData.phone,
      category: formData.requirementType || 'Custom Solution',
      budget: 'Under Review',
      timeframe: formData.timeline || 'Within 1 month',
      scope: formData.details || 'Submitted requirement details',
      status: 'New',
      assignedMember: Math.random() > 0.5 ? 'Maddi Harshavardhan' : 'Thoka Sai Krishna',
      timestamp: new Date().toISOString()
    };

    // Save directly to localStorage for Admin Portal display and sync to Supabase cloud
    try {
      const existing = JSON.parse(localStorage.getItem('sh_requirements') || '[]');
      const updated = [newLead, ...existing];
      localStorage.setItem('sh_requirements', JSON.stringify(updated));
    } catch (err) {
      console.error('Error saving requirement submission:', err);
    }

    // Sync to Supabase cloud database
    saveRequirementToSupabase(newLead);

    if (onSubmitSuccess) {
      onSubmitSuccess(newLead);
    }

    setSubmitted(true);
  };

  const handleCloseModal = () => {
    setSubmitted(false);
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-white/15 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative glow-blue">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-extrabold text-white">
              {submitted ? 'Requirement Submitted' : 'Submit Project Requirement'}
            </h3>
          </div>
          <button
            onClick={handleCloseModal}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          {!submitted ? (
            <div>
              {/* Step Progress Tracker */}
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div key={s} className="flex items-center gap-1.5">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        step === s
                          ? 'bg-blue-600 text-white ring-4 ring-blue-500/20'
                          : step > s
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                    </div>
                    <span className="hidden sm:inline text-[11px] font-medium text-slate-400">
                      {s === 1 && 'Contact'}
                      {s === 2 && 'Category'}
                      {s === 3 && 'Details'}
                      {s === 4 && 'Timeline'}
                      {s === 5 && 'Method'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Selected Workshop / Item Locked Banner */}
              {formData.requirementType && formData.requirementType !== 'Website' && (
                <div className="p-3.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center justify-between gap-2 mb-4 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Target Session: <strong className="text-white font-bold">{formData.requirementType}</strong></span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-cyan-900/80 text-[10px] uppercase font-mono text-cyan-200 shrink-0">Selected</span>
                </div>
              )}

              {/* STEP 1: Contact Info */}
              {step === 1 && (
                <form onSubmit={handleNext} className="space-y-4">
                  <h4 className="text-base font-bold text-white mb-2">Step 1: Your Contact Information</h4>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="form-input pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Company / Institution Name</label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        name="organization"
                        value={formData.organization}
                        onChange={handleChange}
                        className="form-input pl-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Email Address *</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="form-input pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Phone / WhatsApp *</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          className="form-input pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end">
                    <button type="submit" className="btn-primary px-6 py-3 text-xs">
                      <span>Next: Select Category</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: Requirement Category */}
              {step === 2 && (
                <div className="space-y-4">
                  <h4 className="text-base font-bold text-white mb-2">Step 2: What are you looking for?</h4>
                  <p className="text-xs text-slate-400">Select the solution category that matches your goal.</p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    {requirementOptions.map((opt) => {
                      const isSelected = formData.requirementType === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setFormData({ ...formData, requirementType: opt })}
                          className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/30'
                              : 'bg-slate-950 text-slate-300 border-white/10 hover:border-blue-500/40'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-6 flex items-center justify-between">
                    <button type="button" onClick={handlePrev} className="btn-secondary px-4 py-2.5 text-xs">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button type="button" onClick={() => setStep(3)} className="btn-primary px-6 py-3 text-xs">
                      <span>Next: Describe Requirement</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Requirement Details */}
              {step === 3 && (
                <div className="space-y-4">
                  <h4 className="text-base font-bold text-white mb-2">Step 3: Tell us about your requirement</h4>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Describe your feature expectations, target audience, or current software challenges *
                    </label>
                    <textarea
                      name="details"
                      rows="5"
                      required
                      value={formData.details}
                      onChange={handleChange}
                      className="form-input font-sans text-sm"
                    />
                  </div>

                  <div className="pt-6 flex items-center justify-between">
                    <button type="button" onClick={handlePrev} className="btn-secondary px-4 py-2.5 text-xs">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button type="button" onClick={() => setStep(4)} className="btn-primary px-6 py-3 text-xs">
                      <span>Next: Expected Timeline</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Expected Timeline */}
              {step === 4 && (
                <div className="space-y-4">
                  <h4 className="text-base font-bold text-white mb-2">Step 4: What is your expected project timeline?</h4>

                  <div className="space-y-2.5 pt-2">
                    {timelineOptions.map((time) => {
                      const isSelected = formData.timeline === time;
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setFormData({ ...formData, timeline: time })}
                          className={`w-full p-4 rounded-xl border text-left text-sm font-semibold flex items-center justify-between transition-all ${
                            isSelected
                              ? 'bg-blue-600/20 text-blue-400 border-blue-500'
                              : 'bg-slate-950 text-slate-300 border-white/10 hover:bg-slate-800'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-cyan-400" />
                            {time}
                          </span>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-400" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-6 flex items-center justify-between">
                    <button type="button" onClick={handlePrev} className="btn-secondary px-4 py-2.5 text-xs">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button type="button" onClick={() => setStep(5)} className="btn-primary px-6 py-3 text-xs">
                      <span>Next: Consultation Method</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: Consultation Method & Submit */}
              {step === 5 && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h4 className="text-base font-bold text-white mb-2">Step 5: Preferred Consultation Method</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {methodOptions.map((m) => {
                      const isSelected = formData.preferredMethod === m;
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setFormData({ ...formData, preferredMethod: m })}
                          className={`p-4 rounded-xl border text-left text-sm font-semibold flex items-center gap-3 transition-all ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/30'
                              : 'bg-slate-950 text-slate-300 border-white/10 hover:border-blue-500/40'
                          }`}
                        >
                          <Video className="w-4 h-4 text-cyan-400" />
                          <span>{m}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="p-4 bg-slate-950 rounded-xl border border-white/10 text-xs text-slate-400 space-y-1">
                    <p className="font-semibold text-slate-300">Target Assignment:</p>
                    <p>Your requirement will be assigned directly to founders <strong>Maddi Harshavardhan</strong> or <strong>Thoka Sai Krishna</strong> for confidential review.</p>
                  </div>

                  <div className="pt-6 flex items-center justify-between">
                    <button type="button" onClick={handlePrev} className="btn-secondary px-4 py-2.5 text-xs">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button type="submit" className="btn-primary px-8 py-3.5 text-sm glow-blue">
                      <Send className="w-4 h-4" />
                      <span>Submit Requirement</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* SUCCESS CONFIRMATION SCREEN */
            <div className="text-center py-8 space-y-6 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto glow-cyan">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 bg-slate-800 text-cyan-400 rounded-full text-xs font-mono">
                  REF ID: {leadId}
                </span>
                <h3 className="text-2xl font-extrabold text-white">Enquiry Received!</h3>
                <p className="text-slate-300 text-sm max-w-md mx-auto">
                  Thank you. Our founding engineering team will review your requirement and get back to you shortly via {formData.preferredMethod}.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-white/10 text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex justify-between">
                  <span className="text-slate-400">Client Name:</span>
                  <span className="font-semibold text-white">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Category:</span>
                  <span className="font-semibold text-cyan-400">{formData.requirementType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Timeline:</span>
                  <span className="font-semibold text-white">{formData.timeline}</span>
                </div>
              </div>

              <button
                onClick={handleCloseModal}
                className="btn-primary px-8 py-3 text-xs"
              >
                <span>Return to Website</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
