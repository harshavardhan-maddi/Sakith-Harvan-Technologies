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

    setBookingDetails(bookingObject);
    if (onBookingComplete) {
      onBookingComplete(bookingObject);
    }
    setConfirmed(true);
  };

  return (
    <div className="glass-card max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl border border-white/10 glow-blue">
      {!confirmed ? (
        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-cyan-400 border-b border-white/10 pb-3">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Connect with Sakith Harvan Engineering Team</span>
          </div>

          {/* STEP 1: USER INFORMATION */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-900/90 border border-white/10">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider text-slate-300">
              1. Your Contact Information
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Your Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    name="clientName"
                    required
                    value={formData.clientName}
                    onChange={handleChange}
                    className="form-input pl-9 text-xs"
                  />
                </div>
              </div>

              {/* 2. Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input pl-9 text-xs"
                  />
                </div>
              </div>

              {/* 3. Mobile */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile / Phone Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input pl-9 text-xs"
                  />
                </div>
              </div>

              {/* 4. Location */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Your City / Location *</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    className="form-input pl-9 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2: HOW KNOWN ABOUT COMPANY */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-900/90 border border-white/10">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider text-slate-300">
              2. How did you hear about Sakith Harvan Technologies? *
            </h5>

            <div className="relative">
              <HelpCircle className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <select
                name="knownSource"
                value={formData.knownSource}
                onChange={handleChange}
                className="form-select pl-9 text-xs bg-slate-950 font-medium text-cyan-300"
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
                  placeholder="Specify how you found us..."
                  className="form-input text-xs border-cyan-500/50"
                />
              </div>
            )}
          </div>

          {/* STEP 3: MAIN NEED OF TALKING (SOFTWARE OR WORKSHOP) */}
          <div className="space-y-4 p-4 rounded-2xl bg-slate-900/90 border border-blue-500/30">
            <h5 className="font-bold text-blue-400 text-xs uppercase tracking-wider">
              3. Main Need of Talking — Select Category *
            </h5>

            {/* Main Need Option Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, mainNeed: 'Software Project' })}
                className={`p-4 rounded-xl border text-left space-y-1.5 transition-all cursor-pointer ${
                  formData.mainNeed === 'Software Project'
                    ? 'bg-blue-950/80 border-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Monitor className={`w-5 h-5 ${formData.mainNeed === 'Software Project' ? 'text-blue-400' : 'text-slate-400'}`} />
                  <input
                    type="radio"
                    name="mainNeed"
                    checked={formData.mainNeed === 'Software Project'}
                    onChange={() => {}}
                    className="accent-blue-500"
                  />
                </div>
                <div className="font-bold text-xs text-white">Software Project</div>
                <p className="text-[11px] text-slate-400 leading-tight">ERP, SaaS, Portals, Websites, AI Bot / Agent</p>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, mainNeed: 'Technology Workshop' })}
                className={`p-4 rounded-xl border text-left space-y-1.5 transition-all cursor-pointer ${
                  formData.mainNeed === 'Technology Workshop'
                    ? 'bg-cyan-950/80 border-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                    : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <BookOpen className={`w-5 h-5 ${formData.mainNeed === 'Technology Workshop' ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <input
                    type="radio"
                    name="mainNeed"
                    checked={formData.mainNeed === 'Technology Workshop'}
                    onChange={() => {}}
                    className="accent-cyan-500"
                  />
                </div>
                <div className="font-bold text-xs text-white">Technology Workshop</div>
                <p className="text-[11px] text-slate-400 leading-tight">College Bootcamps, Institutional Hands-on Training</p>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, mainNeed: 'Both Software & Workshop' })}
                className={`p-4 rounded-xl border text-left space-y-1.5 transition-all cursor-pointer ${
                  formData.mainNeed === 'Both Software & Workshop'
                    ? 'bg-purple-950/80 border-purple-500 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Layers className={`w-5 h-5 ${formData.mainNeed === 'Both Software & Workshop' ? 'text-purple-400' : 'text-slate-400'}`} />
                  <input
                    type="radio"
                    name="mainNeed"
                    checked={formData.mainNeed === 'Both Software & Workshop'}
                    onChange={() => {}}
                    className="accent-purple-500"
                  />
                </div>
                <div className="font-bold text-xs text-white">Both Solutions</div>
                <p className="text-[11px] text-slate-400 leading-tight">Software Development + Campus Training</p>
              </button>
            </div>

            {/* Description Textarea */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Describe Your Main Need / What You Wish to Discuss *
              </label>
              <textarea
                name="message"
                required
                rows="3"
                value={formData.message}
                onChange={handleChange}
                placeholder="Mention specific requirements, feature needs, college strength, or questions..."
                className="form-input text-xs font-sans"
              />
            </div>

            {/* Preferred Call Schedule */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Preferred Call Date</label>
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
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Preferred Time Slot</label>
                <select
                  name="timeSlot"
                  value={formData.timeSlot}
                  onChange={handleChange}
                  className="form-select text-xs bg-slate-950"
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
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
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
          <div className="w-16 h-16 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/40 flex items-center justify-center mx-auto glow-blue">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h4 className="text-xl font-bold text-white">Consultation Request Confirmed!</h4>
            <p className="text-xs text-slate-400">Our engineering leadership will reach out shortly. Reference ID:</p>
            <div className="text-2xl font-extrabold text-blue-400 font-mono tracking-wider pt-1">
              {bookingDetails?.id}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 max-w-md mx-auto text-xs space-y-2 text-left text-slate-300">
            <div><strong className="text-white">Client:</strong> {bookingDetails?.name} ({bookingDetails?.location})</div>
            <div><strong className="text-white">Contact:</strong> {bookingDetails?.email} | {bookingDetails?.phone}</div>
            <div><strong className="text-cyan-400">Main Need:</strong> {bookingDetails?.mainNeed}</div>
            <div><strong className="text-slate-400">Discovered Via:</strong> {bookingDetails?.knownSource}</div>
            <div><strong className="text-slate-400">Preferred Slot:</strong> {bookingDetails?.preferredDate} at {bookingDetails?.preferredTime}</div>
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
