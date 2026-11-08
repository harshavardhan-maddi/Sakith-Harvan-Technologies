import React, { useState } from 'react';
import { 
  Calendar, Clock, CheckCircle2, User, Mail, Phone, MapPin, 
  HelpCircle, MessageSquare, Sparkles, ShieldCheck, Monitor, BookOpen, Layers 
} from 'lucide-react';
import { saveConsultationToSupabase } from '../lib/supabaseClient';

export const ConsultationBooking = ({ onBookingComplete }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    email: '',
    phone: '',
    location: '',
    knownSource: 'Google / Search Engine',
    customKnownSource: '',
    mainNeed: 'Software Project', // 'Software Project', 'Technology Workshop', 'Both Software & Workshop'
    message: '',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    timeSlot: '11:00 AM'
  });

  const [confirmed, setConfirmed] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  const knownSourceOptions = [
    'Google / Search Engine',
    'LinkedIn / Professional Network',
    'Instagram / Social Media',
    'College / Campus Referral',
    'Friend / Colleague Recommendation',
    'Workshop / Tech Event',
    'Other Source'
  ];

  const availableSlots = [
    '10:00 AM',
    '11:30 AM',
    '02:30 PM',
    '04:00 PM',
    '06:00 PM'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const generatedBookingId = 'CNS-' + Math.floor(10000 + Math.random() * 90000);
    const assignedMember = Math.random() > 0.5 ? 'Maddi Harshavardhan' : 'Thoka Sai Krishna';

    const sourceText = formData.knownSource === 'Other Source' ? (formData.customKnownSource || 'Other') : formData.knownSource;

    const bookingObject = {
      id: generatedBookingId,
      name: formData.clientName,
      email: formData.email,
      phone: formData.phone,
      location: formData.location || 'Not Specified',
      knownSource: sourceText,
      mainNeed: formData.mainNeed,
      type: `Consultation (${formData.mainNeed})`,
      preferredDate: formData.date,
      preferredTime: formData.timeSlot,
      message: formData.message || `Interested in ${formData.mainNeed}`,
      assignedMember,
      status: 'New',
      timestamp: new Date().toISOString()
    };

    // Save directly to localStorage for Admin Portal display and sync to Supabase database
    try {
      const existing = JSON.parse(localStorage.getItem('sh_consultations') || '[]');
      const updated = [bookingObject, ...existing];
      localStorage.setItem('sh_consultations', JSON.stringify(updated));
    } catch (err) {
      console.error('Error saving consultation booking:', err);
    }

    // Sync to Supabase cloud database
    saveConsultationToSupabase(bookingObject);

    // Dispatch real-time event for instant live update in Admin Portal without page refresh
    window.dispatchEvent(new CustomEvent('sh_consultations_updated', { detail: bookingObject }));

    setBookingDetails(bookingObject);
    if (onBookingComplete) {
      onBookingComplete(bookingObject);
    }
    setConfirmed(true);
  };

  return (
    <div className="glass-card max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-md">
      {!confirmed ? (
        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-blue-700 border-b border-slate-200 pb-3">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Connect with Sakith Harvan Engineering Team</span>
          </div>

          {/* STEP 1: USER INFORMATION */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              1. Your Contact Information
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    name="clientName"
                    required
                    value={formData.clientName}
                    onChange={handleChange}
                    className="form-input pl-9 text-xs"
                    placeholder=""
                  />
                </div>
              </div>

              {/* 2. Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input pl-9 text-xs"
                    placeholder=""
                  />
                </div>
              </div>

              {/* 3. Mobile */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile / Phone Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input pl-9 text-xs"
                    placeholder=""
                  />
                </div>
              </div>

              {/* 4. Location */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your City / Location *</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    className="form-input pl-9 text-xs"
                    placeholder=""
                  />
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2: HOW KNOWN ABOUT COMPANY */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              2. How did you hear about Sakith Harvan Technologies? *
            </h5>

            <div className="relative">
              <HelpCircle className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <select
                name="knownSource"
                value={formData.knownSource}
                onChange={handleChange}
                className="form-select pl-9 text-xs font-medium text-slate-800"
              >
                {knownSourceOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {formData.knownSource === 'Other Source' && (
              <div className="pt-2">
                <input
                  type="text"
                  name="customKnownSource"
                  required
                  value={formData.customKnownSource}
                  onChange={handleChange}
                  placeholder=""
                  className="form-input text-xs border-blue-400"
                />
              </div>
            )}
          </div>

          {/* STEP 3: MAIN NEED OF TALKING (SOFTWARE OR WORKSHOP) */}
          <div className="space-y-4 p-4 rounded-2xl bg-slate-50 border border-blue-200">
            <h5 className="font-bold text-blue-700 text-xs uppercase tracking-wider">
              3. Main Need of Talking — Select Category *
            </h5>

            {/* Main Need Option Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, mainNeed: 'Software Project' })}
                className={`p-4 rounded-xl border text-left space-y-1.5 transition-all cursor-pointer ${
                  formData.mainNeed === 'Software Project'
                    ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Monitor className={`w-5 h-5 ${formData.mainNeed === 'Software Project' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <input
                    type="radio"
                    name="mainNeed"
                    checked={formData.mainNeed === 'Software Project'}
                    onChange={() => {}}
                    className="accent-blue-600"
                  />
                </div>
                <div className="font-bold text-xs text-slate-900">Software Project</div>
                <p className="text-[11px] text-slate-500 leading-tight">ERP, SaaS, Portals, Websites, AI Bot / Agent</p>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, mainNeed: 'Technology Workshop' })}
                className={`p-4 rounded-xl border text-left space-y-1.5 transition-all cursor-pointer ${
                  formData.mainNeed === 'Technology Workshop'
                    ? 'bg-sky-50 border-sky-600 text-sky-900 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <BookOpen className={`w-5 h-5 ${formData.mainNeed === 'Technology Workshop' ? 'text-sky-600' : 'text-slate-400'}`} />
                  <input
                    type="radio"
                    name="mainNeed"
                    checked={formData.mainNeed === 'Technology Workshop'}
                    onChange={() => {}}
                    className="accent-sky-600"
                  />
                </div>
                <div className="font-bold text-xs text-slate-900">Technology Workshop</div>
                <p className="text-[11px] text-slate-500 leading-tight">College Bootcamps, Institutional Hands-on Training</p>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, mainNeed: 'Both Software & Workshop' })}
                className={`p-4 rounded-xl border text-left space-y-1.5 transition-all cursor-pointer ${
                  formData.mainNeed === 'Both Software & Workshop'
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-900 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Layers className={`w-5 h-5 ${formData.mainNeed === 'Both Software & Workshop' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <input
                    type="radio"
                    name="mainNeed"
                    checked={formData.mainNeed === 'Both Software & Workshop'}
                    onChange={() => {}}
                    className="accent-indigo-600"
                  />
                </div>
                <div className="font-bold text-xs text-slate-900">Both Solutions</div>
                <p className="text-[11px] text-slate-500 leading-tight">Software Development + Campus Training</p>
              </button>
            </div>

            {/* Description Textarea */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Describe Your Main Need / What You Wish to Discuss *
              </label>
              <textarea
                name="message"
                required
                rows="3"
                value={formData.message}
                onChange={handleChange}
                placeholder=""
                className="form-input text-xs font-sans"
              />
            </div>

            {/* Preferred Call Schedule */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Preferred Call Date</label>
                <input
                  type="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Preferred Time Slot</label>
                <select
                  name="timeSlot"
                  value={formData.timeSlot}
                  onChange={handleChange}
                  className="form-select text-xs font-medium text-slate-800"
                >
                  {availableSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-between">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Direct Founder Session Assigned</span>
            </div>

            <button type="submit" className="btn-primary text-xs py-3.5 px-8 glow-blue font-bold">
              <Calendar className="w-4 h-4" />
              <span>Submit &amp; Schedule Call</span>
            </button>
          </div>
        </form>
      ) : (
        /* Confirmation Screen */
        <div className="text-center py-8 space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h4 className="text-xl font-bold text-slate-900">Consultation Request Confirmed!</h4>
            <p className="text-xs text-slate-500">Our engineering leadership will reach out shortly. Reference ID:</p>
            <div className="text-2xl font-extrabold text-blue-600 font-mono tracking-wider pt-1">
              {bookingDetails?.id}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto text-xs space-y-2 text-left text-slate-700 shadow-sm">
            <div><strong className="text-slate-900">Client:</strong> {bookingDetails?.name} ({bookingDetails?.location})</div>
            <div><strong className="text-slate-900">Contact:</strong> {bookingDetails?.email} | {bookingDetails?.phone}</div>
            <div><strong className="text-blue-700">Main Need:</strong> {bookingDetails?.mainNeed}</div>
            <div><strong className="text-slate-600">Discovered Via:</strong> {bookingDetails?.knownSource}</div>
            <div><strong className="text-slate-600">Preferred Slot:</strong> {bookingDetails?.preferredDate} at {bookingDetails?.preferredTime}</div>
          </div>

          <button
            onClick={() => setConfirmed(false)}
            className="btn-secondary text-xs py-2.5 px-6"
          >
            <span>Submit Another Request</span>
          </button>
        </div>
      )}
    </div>
  );
};
