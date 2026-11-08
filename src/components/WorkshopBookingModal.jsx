import React, { useState } from 'react';
import { X, CheckCircle2, Calendar, User, Building, Mail, Phone, ShieldCheck } from 'lucide-react';

export const WorkshopBookingModal = ({ isOpen, onClose, workshopTitle = '', onSubmitSuccess }) => {
  const isTechnicalSession = (workshopTitle || '').toLowerCase().includes('technical session') || (workshopTitle || '').toLowerCase().includes('1 day');

  const [formData, setFormData] = useState({
    name: '',
    institution: '',
    email: '',
    phone: '',
    daysNeeded: isTechnicalSession ? '1 Day' : '3 Days'
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
      scope: `Days of Workshop Needed: ${formData.daysNeeded}`,
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
      daysNeeded: isTechnicalSession ? '1 Day' : '3 Days'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-card max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-blue-200 relative space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-[11px] font-mono font-semibold">
              <Calendar className="w-3.5 h-3.5" />
              <span>Schedule Session</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-1">
              {workshopTitle ? workshopTitle : 'Institutional Workshop'}
            </h3>
          </div>

          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!submitted ? (
          /* Workshop Booking Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Booking User Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input pl-10 text-xs"
                  placeholder=""
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Institute / Company Name *</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="institution"
                  required
                  value={formData.institution}
                  onChange={handleChange}
                  className="form-input pl-10 text-xs"
                  placeholder=""
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mail ID *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input pl-10 text-xs"
                    placeholder=""
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input pl-10 text-xs"
                    placeholder=""
                  />
                </div>
              </div>
            </div>

            {/* Days of Workshop Needed (No Clock icon/logo) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Days of Workshop Needed *
              </label>
              <select
                name="daysNeeded"
                value={formData.daysNeeded}
                onChange={handleChange}
                className="form-select text-xs"
              >
                <option value="1 Day">1 Day</option>
                <option value="2 Days">2 Days</option>
                <option value="3 Days">3 Days</option>
                <option value="4 Days">4 Days</option>
                <option value="5 Days">5 Days (Full Week Bootcamp)</option>
                <option value="Custom Duration">Custom Duration</option>
              </select>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-slate-200">
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Instant Confirmation</span>
              </div>

              <button type="submit" className="btn-cyan text-xs py-3 px-6 font-semibold cursor-pointer">
                <span>Submit Workshop Schedule</span>
              </button>
            </div>
          </form>
        ) : (
          /* Submission Number Screen */
          <div className="text-center py-8 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h4 className="text-xl font-bold text-slate-900">Workshop Booking Submitted!</h4>
              <p className="text-xs text-slate-500">Your schedule request has been registered under reference number:</p>
              <div className="text-2xl font-extrabold text-blue-600 font-mono tracking-wider pt-2">
                {submissionNumber}
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200 max-w-sm mx-auto shadow-sm">
              Our engineering leadership will get in touch with you shortly to finalize the dates and logistics.
            </p>

            <button onClick={handleClose} className="btn-secondary w-full text-xs py-3 cursor-pointer">
              <span>Close Window</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
