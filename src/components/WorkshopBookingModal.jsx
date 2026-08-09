import React, { useState } from 'react';
import { X, CheckCircle2, Calendar, User, Building, Mail, Phone, Users, ShieldCheck, Sparkles } from 'lucide-react';

export const WorkshopBookingModal = ({ isOpen, onClose, workshopTitle = '', onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    institution: '',
    email: '',
    phone: '',
    minCandidates: '30'
  });

  const [submitted, setSubmitted] = useState(false);
  const [submissionNumber, setSubmissionNumber] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const generatedId = 'WS-' + Math.floor(10000 + Math.random() * 90000);
    setSubmissionNumber(generatedId);

    const bookingPayload = {
      id: generatedId,
      name: formData.name,
      organization: formData.institution,
      email: formData.email,
      phone: formData.phone,
      category: `Workshop: ${workshopTitle || 'General Session'}`,
      scope: `Minimum Candidates Attending: ${formData.minCandidates}`,
      status: 'New',
      timestamp: new Date().toISOString()
    };

    // Save directly to localStorage for Admin Portal display
    try {
      const existing = JSON.parse(localStorage.getItem('sh_requirements') || '[]');
      const updated = [bookingPayload, ...existing];
      localStorage.setItem('sh_requirements', JSON.stringify(updated));
    } catch (err) {
      console.error('Error saving workshop booking:', err);
    }

    if (onSubmitSuccess) {
      onSubmitSuccess(bookingPayload);
    }

    setSubmitted(true);
  };

  const handleClose = () => {
    setSubmitted(false);
    setFormData({
      name: '',
      institution: '',
      email: '',
      phone: '',
      minCandidates: '30'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-card max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-cyan-500/40 relative space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-950 text-cyan-400 text-[11px] font-mono font-semibold">
              <Calendar className="w-3.5 h-3.5" />
              <span>Schedule Workshop</span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">
              {workshopTitle ? workshopTitle : 'Institutional Workshop'}
            </h3>
          </div>

          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!submitted ? (
          /* Workshop Booking Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Booking User Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input pl-10 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Institute / Company Name *</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="institution"
                  required
                  value={formData.institution}
                  onChange={handleChange}
                  className="form-input pl-10 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mail ID *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input pl-10 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input pl-10 text-xs"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Minimum Candidates Attending *</label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <select
                  name="minCandidates"
                  value={formData.minCandidates}
                  onChange={handleChange}
                  className="form-select pl-10 text-xs"
                >
                  <option value="15–30 Candidates">15–30 Candidates</option>
                  <option value="30–50 Candidates">30–50 Candidates</option>
                  <option value="50–100 Candidates">50–100 Candidates</option>
                  <option value="100+ Candidates (Batch Session)">100+ Candidates (Batch Session)</option>
                  <option value="Custom Department Size">Custom Department Size</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-white/10">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Instant Confirmation</span>
              </div>

              <button type="submit" className="btn-cyan text-xs py-3 px-6 glow-cyan">
                <span>Submit Workshop Schedule</span>
              </button>
            </div>
          </form>
        ) : (
          /* Submission Number Screen */
          <div className="text-center py-8 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-cyan-600/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center mx-auto glow-cyan">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h4 className="text-xl font-bold text-white">Workshop Booking Submitted!</h4>
              <p className="text-xs text-slate-400">Your schedule request has been registered under reference number:</p>
              <div className="text-2xl font-extrabold text-cyan-400 font-mono tracking-wider pt-2">
                {submissionNumber}
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-900/90 p-4 rounded-xl border border-white/10 max-w-sm mx-auto">
              Our engineering leadership will get in touch with you shortly to finalize the dates and logistics.
            </p>

            <button onClick={handleClose} className="btn-secondary w-full text-xs py-3">
              <span>Close Window</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
