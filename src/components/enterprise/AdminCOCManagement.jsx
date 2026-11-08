import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Plus, Edit3, Trash2, CheckCircle2, DollarSign, Users, 
  Search, Filter, X, Download, Eye, Calendar, Sparkles, BookOpen, 
  ShieldCheck, ArrowUpRight, Check, Save, Clock
} from 'lucide-react';
import { 
  getStoredCOCCourses, 
  saveStoredCOCCourses, 
  updateCOCCoursePrice, 
  updateCOCCourseDetails,
  getStoredEnrollments,
  saveStoredEnrollments
} from '../../lib/cocStore';

export const AdminCOCManagement = () => {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [subTab, setSubTab] = useState('courses'); // 'courses' | 'enrollments'

  // Course Edit Modal
  const [editingCourse, setEditingCourse] = useState(null);
  const [priceForm, setPriceForm] = useState({
    price: 6999,
    originalPrice: 15999,
    trialDays: 3,
    duration: '',
    hoursPerWeek: ''
  });
  const [successMsg, setSuccessMsg] = useState('');

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setCourses(getStoredCOCCourses());
    setEnrollments(getStoredEnrollments());
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setPriceForm({
      price: course.price,
      originalPrice: course.originalPrice,
      trialDays: course.trialDays || 3,
      duration: course.duration,
      hoursPerWeek: course.hoursPerWeek
    });
  };

  const handlePriceSave = (e) => {
    e.preventDefault();
    if (!editingCourse) return;

    updateCOCCoursePrice(editingCourse.id, priceForm.price, priceForm.originalPrice);
    updateCOCCourseDetails(editingCourse.id, {
      trialDays: Number(priceForm.trialDays) || 3,
      duration: priceForm.duration,
      hoursPerWeek: priceForm.hoursPerWeek
    });

    setEditingCourse(null);
    setSuccessMsg(`Pricing & details updated for ${editingCourse.shortTitle}`);
    setTimeout(() => setSuccessMsg(''), 3500);
    loadData();
  };

  const handleToggleEnrollmentStatus = (enrId) => {
    const updated = enrollments.map(enr => {
      if (enr.id === enrId) {
        const nextStatus = enr.status === 'Paid & Enrolled' ? 'Active Trial' : 'Paid & Enrolled';
        return {
          ...enr,
          status: nextStatus,
          amountPaid: nextStatus === 'Paid & Enrolled' ? enr.courseFee : 0,
          paidAt: nextStatus === 'Paid & Enrolled' ? new Date().toISOString() : null
        };
      }
      return enr;
    });
    saveStoredEnrollments(updated);
    setEnrollments(updated);
  };

  const filteredCourses = courses.filter(c => {
    return searchQuery === '' || 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.shortTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredEnrollments = enrollments.filter(e => {
    return searchQuery === '' ||
      e.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.college.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Course of Career Control</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              Admin Decided Pricing
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Set and modify official program fees, manage 3-day trial access rules, and monitor student career enrollments.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setSubTab('courses')}
            className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
              subTab === 'courses'
                ? 'bg-white text-blue-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Course Offerings &amp; Pricing ({courses.length})
          </button>
          <button
            onClick={() => setSubTab('enrollments')}
            className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
              subTab === 'enrollments'
                ? 'bg-white text-blue-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Student Enrollments &amp; Trials ({enrollments.length})
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 1: COURSES & ADMIN PRICING                       */}
      {/* ======================================================== */}
      {subTab === 'courses' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map(course => (
              <div
                key={course.id}
                className="rounded-2xl bg-white border border-slate-200/90 shadow-sm p-5 flex flex-col justify-between space-y-4 hover:border-blue-300 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {course.category}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      Code: {course.code}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">{course.shortTitle}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{course.tagline}</p>
                </div>

                {/* Price Display */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Admin Decided Fee</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-extrabold text-blue-700">₹{course.price.toLocaleString('en-IN')}</span>
                    {course.originalPrice && (
                      <span className="text-xs text-slate-400 line-through">₹{course.originalPrice.toLocaleString('en-IN')}</span>
                    )}
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Save {Math.round((1 - course.price / course.originalPrice) * 100)}%
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>{course.trialDays || 3}-Day Free Trial Included</span>
                  </div>
                </div>

                {/* Edit CTA */}
                <button
                  onClick={() => openEditModal(course)}
                  className="w-full py-2 px-4 rounded-xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Fee &amp; Trial Settings</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 2: STUDENT ENROLLMENTS & 3-DAY TRIALS            */}
      {/* ======================================================== */}
      {subTab === 'enrollments' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Student &amp; ID</th>
                  <th className="py-3 px-4">Enrolled Course</th>
                  <th className="py-3 px-4">College &amp; Year</th>
                  <th className="py-3 px-4">Trial &amp; Expiry</th>
                  <th className="py-3 px-4">Payment &amp; Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredEnrollments.map(enr => (
                  <tr key={enr.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{enr.studentName}</div>
                      <div className="font-mono text-[10px] text-blue-600 font-semibold">{enr.id}</div>
                      <div className="text-[10px] text-slate-400">{enr.studentEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 max-w-xs">
                      {enr.courseTitle}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{enr.college}</div>
                      <div className="text-[10px] text-slate-500">{enr.branch} • {enr.academicYear}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-medium">
                        Started: {new Date(enr.trialStartDate).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-amber-600 font-semibold">
                        Expires: {new Date(enr.trialExpiresDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          enr.status === 'Paid & Enrolled'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {enr.status}
                        </span>
                      </div>
                      <div className="font-mono text-[11px] text-slate-900 font-bold mt-1">
                        Fee: ₹{(enr.amountPaid || enr.courseFee).toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleEnrollmentStatus(enr.id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                        title="Toggle between Paid and Trial"
                      >
                        {enr.status === 'Paid & Enrolled' ? 'Revert to Trial' : 'Mark as Paid'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT COURSE PRICING & TRIAL SETTINGS              */}
      {/* ======================================================== */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Admin Pricing Controller</span>
                <h3 className="text-xl font-bold text-slate-900">{editingCourse.shortTitle}</h3>
              </div>
              <button
                onClick={() => setEditingCourse(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePriceSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Effective Course Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={priceForm.price}
                    onChange={(e) => setPriceForm({ ...priceForm, price: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-bold text-blue-700 bg-slate-50/50"
                  />
                  <span className="text-[10px] text-slate-400">Student pays this after 3-day trial</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Original Strike-through Price (₹)
                  </label>
                  <input
                    type="number"
                    value={priceForm.originalPrice}
                    onChange={(e) => setPriceForm({ ...priceForm, originalPrice: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50"
                  />
                  <span className="text-[10px] text-slate-400">Displayed crossed-out for discount</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Free Trial Duration (Days)
                  </label>
                  <input
                    type="number"
                    value={priceForm.trialDays}
                    onChange={(e) => setPriceForm({ ...priceForm, trialDays: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50"
                  />
                  <span className="text-[10px] text-slate-400">Default: 3 Days Free Trial</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Program Duration
                  </label>
                  <input
                    type="text"
                    value={priceForm.duration}
                    onChange={(e) => setPriceForm({ ...priceForm, duration: e.target.value })}
                    placeholder="e.g. 6 Months (Flexible)"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Time Commitment / Week
                </label>
                <input
                  type="text"
                  value={priceForm.hoursPerWeek}
                  onChange={(e) => setPriceForm({ ...priceForm, hoursPerWeek: e.target.value })}
                  placeholder="e.g. 6-8 Hours"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs py-2 px-5 font-bold flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Pricing</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
