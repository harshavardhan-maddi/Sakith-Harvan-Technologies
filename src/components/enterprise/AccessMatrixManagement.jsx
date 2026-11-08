import React, { useState, useEffect } from 'react';
import { 
  Shield, UserCheck, Key, Plus, Trash2, Edit3, CheckCircle2, 
  X, AlertCircle, Lock, Users, ShieldCheck, CheckSquare, Square
} from 'lucide-react';
import { 
  getStoredUsers, 
  saveUsersDirectory, 
  DEFAULT_PERMISSIONS, 
  SUPER_ADMIN_CREDENTIALS 
} from '../../lib/enterprisePortalStore';

export const AccessMatrixManagement = ({ currentUser }) => {
  const [users, setUsers] = useState(getStoredUsers());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    type: 'Employee',
    role: '',
    password: '',
    email: '',
    phone: '',
    permissions: { ...DEFAULT_PERMISSIONS.employee }
  });

  useEffect(() => {
    const handleUpdate = () => setUsers(getStoredUsers());
    window.addEventListener('sh_users_updated', handleUpdate);
    return () => window.removeEventListener('sh_users_updated', handleUpdate);
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleOpenAdd = () => {
    setEditingUserId(null);
    setFormData({
      id: `EMP-${String(users.length + 1).padStart(2, '0')}`,
      name: '',
      type: 'Employee',
      role: 'Software Engineer',
      password: 'shtsa@2026',
      email: '',
      phone: '',
      permissions: { ...DEFAULT_PERMISSIONS.employee }
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    if (user.id === SUPER_ADMIN_CREDENTIALS.id) {
      alert('Super Admin credentials and access matrix are fixed for enterprise security.');
      return;
    }
    setEditingUserId(user.id);
    setFormData({
      id: user.id,
      name: user.name,
      type: user.type || 'Employee',
      role: user.role || '',
      password: user.password || 'shtsa@2026',
      email: user.email || '',
      phone: user.phone || '',
      permissions: { ...(user.permissions || DEFAULT_PERMISSIONS[user.type?.toLowerCase()] || {}) }
    });
    setIsModalOpen(true);
  };

  const handleDeleteUser = (userId) => {
    if (userId === SUPER_ADMIN_CREDENTIALS.id) {
      alert('Cannot delete the root Super Administrator account.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete login for "${userId}"?`)) {
      const updated = users.filter(u => u.id !== userId);
      setUsers(updated);
      saveUsersDirectory(updated);
      showToast(`User ${userId} deleted.`);
    }
  };

  const handleTogglePermission = (permKey) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permKey]: !prev.permissions[permKey]
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.id || !formData.name) {
      alert('User ID and Name are required.');
      return;
    }

    let updatedUsers;
    if (editingUserId) {
      updatedUsers = users.map(u => u.id === editingUserId ? { ...u, ...formData } : u);
      showToast(`User ${formData.id} permissions matrix updated!`);
    } else {
      if (users.some(u => u.id.toUpperCase() === formData.id.toUpperCase())) {
        alert(`User with ID ${formData.id} already exists. Please choose a different ID.`);
        return;
      }
      updatedUsers = [...users, formData];
      showToast(`New user ${formData.id} successfully created!`);
    }

    setUsers(updatedUsers);
    saveUsersDirectory(updatedUsers);

    // Sync to sh_team_members so staff workspace and portal immediately reflect permissions
    try {
      const rawTeam = localStorage.getItem('sh_team_members');
      let team = rawTeam ? JSON.parse(rawTeam) : [];
      const cleanId = formData.id.toUpperCase();
      const existingIdx = team.findIndex(m => (m.id || m.userId || '').toUpperCase() === cleanId);
      const teamObj = {
        ...formData,
        id: formData.id,
        userId: formData.id,
        permissions: formData.permissions
      };
      if (existingIdx >= 0) {
        team[existingIdx] = { ...team[existingIdx], ...teamObj };
      } else {
        team.push(teamObj);
      }
      localStorage.setItem('sh_team_members', JSON.stringify(team));
      window.dispatchEvent(new Event('sh_team_updated'));
    } catch (err) {
      console.error(err);
    }

    setIsModalOpen(false);
  };

  const permissionMatrixItems = [
    { key: 'view_overview', label: 'Dashboard Overview & Metrics', desc: 'Can inspect high-level revenue, bookings, and active system stats' },
    { key: 'manage_leads', label: 'Consultations & Client Requirements', desc: 'Can view, update, and manage incoming client project leads' },
    { key: 'quotation_maker', label: 'Quotation Engine & Pricing', desc: 'Can generate and export official client project quotations' },
    { key: 'manage_tasks', label: 'Task Assignment & Tracking', desc: 'Can create, assign, and review employee & intern deliverables' },
    { key: 'manage_workshops', label: 'Workshops & Bootcamps', desc: 'Can schedule and manage institutional technology workshops' },
    { key: 'manage_attendance', label: 'Staff Attendance & Punch Timings', desc: 'Can inspect all employees and interns punch-in & punch-out records' },
    { key: 'manage_leaves', label: 'Leave Requests & Approvals', desc: 'Can review and approve or reject staff leave applications' },
    { key: 'view_work_status', label: 'Daily Work Updates & Help Desk', desc: 'Can review staff daily standup logs and respond to support needs' },
    { key: 'manage_access_matrix', label: 'Access Matrix & User Provisioning', desc: 'Can create new logins and modify authorization matrix (Super Admin feature)' }
  ];

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg('')} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Banner - Clean Website Light UI */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Super Administrator Control Matrix</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">
            User Logins &amp; Access Authorization Matrix
          </h3>
          <p className="text-xs text-slate-600 max-w-2xl leading-relaxed font-medium">
            Provision user logins for Admins, Employees, and Interns. Configure granular permission matrices defining exactly what features each user can view and execute.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn-primary text-xs py-2.5 px-4 font-bold flex items-center gap-2 shadow-sm shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New User Login</span>
        </button>
      </div>

      {/* Super Admin Notice Card */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <Lock className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Fixed Root Super Admin: <strong className="text-slate-900 font-mono">ID: SASHT</strong> • Password: <strong className="text-slate-900 font-mono">Shtsa@2026</strong>
          </span>
        </div>
        <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-bold">
          Root Access • Unrestricted
        </span>
      </div>

      {/* User Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span>Authorized Enterprise Directory ({users.length} Users)</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">User ID &amp; Name</th>
                <th className="py-3 px-4">Role / Type</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Access Matrix Authorizations</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {users.map((u) => {
                const isSuper = u.id === SUPER_ADMIN_CREDENTIALS.id;
                const perms = u.permissions || {};

                return (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>{u.name}</span>
                        {isSuper && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-50 text-amber-700 border border-amber-300 font-bold">
                            ROOT
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-blue-600 font-semibold">{u.id}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        u.type === 'Super Admin'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : u.type === 'Admin'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : u.type?.toLowerCase().includes('founder')
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : u.type?.toLowerCase() === 'intern'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {u.type || 'Employee'}
                      </span>
                      <div className="text-[11px] text-slate-500 mt-1">{u.role}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{u.email || '—'}</div>
                      <div className="text-[11px] font-mono text-slate-500">{u.phone || '—'}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      {isSuper ? (
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-mono border border-blue-200 font-semibold">
                          All Permissions Granted
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1 max-w-sm">
                          {Object.entries(perms)
                            .filter(([_, enabled]) => enabled)
                            .slice(0, 4)
                            .map(([k]) => (
                              <span key={k} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono border border-slate-200">
                                {k.replace('manage_', '').replace('view_', '')}
                              </span>
                            ))}
                          {Object.values(perms).filter(Boolean).length > 4 && (
                            <span className="text-[10px] text-slate-500 self-center">
                              +{Object.values(perms).filter(Boolean).length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          disabled={isSuper}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 cursor-pointer"
                          title="Edit User & Permissions Matrix"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          disabled={isSuper}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-rose-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT USER MODAL WITH GRANULAR ACCESS MATRIX */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white max-w-2xl w-full p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingUserId ? `Configure Matrix for ${formData.id}` : 'Create New User Login'}
                </h3>
                <p className="text-xs text-slate-500">
                  Set user identity and configure authorization access matrix.
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Basic Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">User ID *</label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase() })}
                    placeholder="e.g. EMP-03, ADM-02"
                    className="form-input text-xs font-mono bg-white text-slate-900 border-slate-300 focus:border-blue-600"
                    required
                    disabled={!!editingUserId}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="form-input text-xs bg-white text-slate-900 border-slate-300 focus:border-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role / Account Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => {
                      const newType = e.target.value;
                      setFormData({
                        ...formData,
                        type: newType,
                        permissions: { ...(DEFAULT_PERMISSIONS[newType.toLowerCase()] || DEFAULT_PERMISSIONS.employee) }
                      });
                    }}
                    className="form-input text-xs bg-white text-slate-900 border-slate-300 focus:border-blue-600"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Employee">Employee</option>
                    <option value="Intern">Intern</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Password *</label>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter login password"
                    className="form-input text-xs font-mono bg-white text-slate-900 border-slate-300 focus:border-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Designation / Title</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. Cloud Engineer, Frontend Intern"
                    className="form-input text-xs bg-white text-slate-900 border-slate-300 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@sakithharvan.com"
                    className="form-input text-xs bg-white text-slate-900 border-slate-300 focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Granular Access Matrix Checkboxes */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-blue-600" />
                      <span>Authorization Access Matrix</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Toggle specific modules this user can access upon logging in.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const allEnabled = Object.fromEntries(permissionMatrixItems.map(item => [item.key, true]));
                      setFormData(prev => ({ ...prev, permissions: allEnabled }));
                    }}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-bold"
                  >
                    Select All
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {permissionMatrixItems.map(item => {
                    const isChecked = !!formData.permissions[item.key];
                    return (
                      <div
                        key={item.key}
                        onClick={() => handleTogglePermission(item.key)}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                          isChecked 
                            ? 'bg-blue-50/80 border-blue-200 text-slate-900' 
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100/70'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className={`text-xs font-bold ${isChecked ? 'text-blue-700' : 'text-slate-800'}`}>{item.label}</div>
                          <div className="text-[11px] text-slate-500">{item.desc}</div>
                        </div>

                        <div className="shrink-0 text-blue-600">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs py-2 px-5 font-bold cursor-pointer"
                >
                  {editingUserId ? 'Save Changes' : 'Create User Login'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
