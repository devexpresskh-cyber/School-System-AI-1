import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Branch, User, UserPermissions, UserRole } from '../../types';
import { 
  Building2, 
  Settings, 
  DollarSign, 
  GraduationCap, 
  Plus, 
  Check, 
  Edit2, 
  Save, 
  X, 
  Shield, 
  Users, 
  Trash2, 
  Key, 
  AlertTriangle,
  UserCheck,
  UserX
} from 'lucide-react';

export const SystemSettingsView: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    branches, 
    addBranch, 
    updateBranch, 
    deleteBranch,
    currentBranchId, 
    setCurrentBranchId,
    users,
    addUser,
    updateUser,
    deleteUser,
    updateUserPermissions,
    currentUser
  } = useSchool();

  const [activeTab, setActiveTab] = useState<'branches' | 'users' | 'general' | 'financial' | 'academic'>('branches');
  
  // General form state
  const [schoolNameKhmer, setSchoolNameKhmer] = useState(settings.schoolNameKhmer);
  const [schoolNameEnglish, setSchoolNameEnglish] = useState(settings.schoolNameEnglish);
  const [exchangeRate, setExchangeRate] = useState(settings.defaultExchangeRate);
  const [activeAcademicYear, setActiveAcademicYear] = useState(settings.activeAcademicYear);
  const [saveToast, setSaveToast] = useState(false);
  const [userToast, setUserToast] = useState<string | null>(null);

  // Branch modal state
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [branchCode, setBranchCode] = useState('');
  const [branchNameKhmer, setBranchNameKhmer] = useState('');
  const [branchNameEnglish, setBranchNameEnglish] = useState('');
  const [branchCity, setBranchCity] = useState('');
  const [branchAddressKhmer, setBranchAddressKhmer] = useState('');
  const [branchPhone, setBranchPhone] = useState('');
  const [branchEmail, setBranchEmail] = useState('');
  const [branchDirector, setBranchDirector] = useState('');

  // User modal state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userName, setUserName] = useState('');
  const [userUsername, setUserUsername] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('accountant');
  const [userBranchId, setUserBranchId] = useState(branches[0]?.id || 'fbis-02');
  const [userStatus, setUserStatus] = useState<'active' | 'inactive'>('active');

  // User Permissions Modal State
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [selectedUserForPerms, setSelectedUserForPerms] = useState<User | null>(null);
  const [permsState, setPermsState] = useState<UserPermissions>({
    manageStudents: true,
    managePayments: true,
    viewReports: true,
    manageStock: true,
    manageGrades: false,
    manageSettings: false,
    canDeleteRecords: false,
    accessAllBranches: false
  });

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      schoolNameKhmer,
      schoolNameEnglish,
      defaultExchangeRate: exchangeRate,
      activeAcademicYear
    });
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleOpenAddBranch = () => {
    setEditingBranch(null);
    setBranchCode(`FBIS 0${branches.length + 1}`);
    setBranchNameKhmer('');
    setBranchNameEnglish('');
    setBranchCity('Siem Reap');
    setBranchAddressKhmer('');
    setBranchPhone('063 963 000');
    setBranchEmail('');
    setBranchDirector('');
    setIsBranchModalOpen(true);
  };

  const handleOpenEditBranch = (b: Branch) => {
    setEditingBranch(b);
    setBranchCode(b.code);
    setBranchNameKhmer(b.nameKhmer);
    setBranchNameEnglish(b.nameEnglish);
    setBranchCity(b.city);
    setBranchAddressKhmer(b.addressKhmer);
    setBranchPhone(b.phone);
    setBranchEmail(b.email);
    setBranchDirector(b.directorName);
    setIsBranchModalOpen(true);
  };

  const handleDeleteBranch = (b: Branch) => {
    if (b.isHeadquarters) {
      alert('The Headquarters campus cannot be deleted.');
      return;
    }
    if (branches.length <= 1) {
      alert('The school system must contain at least one branch campus.');
      return;
    }
    if (confirm(`Are you sure you want to delete branch campus "${b.nameKhmer} (${b.code})"? All historical transactions and data will remain preserved.`)) {
      const ok = deleteBranch(b.id);
      if (ok) {
        setUserToast(`Branch ${b.code} deleted successfully.`);
        setTimeout(() => setUserToast(null), 3000);
      }
    }
  };

  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBranch) {
      updateBranch(editingBranch.id, {
        code: branchCode,
        nameKhmer: branchNameKhmer,
        nameEnglish: branchNameEnglish,
        city: branchCity,
        addressKhmer: branchAddressKhmer,
        phone: branchPhone,
        email: branchEmail,
        directorName: branchDirector
      });
    } else {
      addBranch({
        code: branchCode,
        nameKhmer: branchNameKhmer,
        nameEnglish: branchNameEnglish,
        city: branchCity,
        addressKhmer: branchAddressKhmer,
        addressEnglish: branchCity,
        phone: branchPhone,
        email: branchEmail,
        directorName: branchDirector,
        isHeadquarters: false,
        totalStudents: 0
      });
    }
    setIsBranchModalOpen(false);
  };

  // User Management Handlers
  const handleOpenAddUser = () => {
    setEditingUser(null);
    setUserName('');
    setUserUsername('');
    setUserEmail('');
    setUserPhone('');
    setUserRole('accountant');
    setUserBranchId(currentBranchId === 'all' ? branches[0].id : currentBranchId);
    setUserStatus('active');
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (u: User) => {
    setEditingUser(u);
    setUserName(u.name);
    setUserUsername(u.username);
    setUserEmail(u.email);
    setUserPhone(u.phone);
    setUserRole(u.role);
    setUserBranchId(u.branchId);
    setUserStatus(u.status || 'active');
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUser(editingUser.id, {
        name: userName,
        username: userUsername,
        email: userEmail,
        phone: userPhone,
        role: userRole,
        branchId: userBranchId,
        status: userStatus
      });
      setUserToast(`User ${userName} updated successfully.`);
    } else {
      const defaultPerms: UserPermissions = {
        manageStudents: true,
        managePayments: userRole !== 'teacher',
        viewReports: userRole !== 'teacher',
        manageStock: userRole === 'super_admin' || userRole === 'campus_admin',
        manageGrades: userRole === 'teacher' || userRole === 'super_admin',
        manageSettings: userRole === 'super_admin',
        canDeleteRecords: userRole === 'super_admin',
        accessAllBranches: userRole === 'super_admin'
      };

      addUser({
        name: userName,
        username: userUsername || userName.toLowerCase().replace(/\s+/g, '.'),
        email: userEmail,
        phone: userPhone,
        role: userRole,
        branchId: userBranchId,
        status: userStatus,
        permissions: defaultPerms,
        avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 50)}?w=100&auto=format&fit=crop&q=80`
      });
      setUserToast(`User ${userName} added successfully.`);
    }
    setIsUserModalOpen(false);
    setTimeout(() => setUserToast(null), 3000);
  };

  const handleDeleteUser = (u: User) => {
    if (u.id === currentUser.id) {
      alert('You cannot delete your own active account.');
      return;
    }
    if (confirm(`Delete user "${u.name} (@${u.username})"?`)) {
      deleteUser(u.id);
      setUserToast(`User ${u.name} deleted.`);
      setTimeout(() => setUserToast(null), 3000);
    }
  };

  const handleOpenPermissions = (u: User) => {
    setSelectedUserForPerms(u);
    setPermsState({ ...u.permissions });
    setIsPermissionsModalOpen(true);
  };

  const handleSavePermissions = () => {
    if (selectedUserForPerms) {
      updateUserPermissions(selectedUserForPerms.id, permsState);
      setUserToast(`Permissions updated for ${selectedUserForPerms.name}.`);
      setIsPermissionsModalOpen(false);
      setTimeout(() => setUserToast(null), 3000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Settings Navigation Tabs */}
      <div className="bg-white px-5 pt-3 border-b border-slate-200 rounded-t-xl flex items-center justify-between overflow-x-auto">
        <div className="flex items-center gap-6 min-w-max">
          <button
            onClick={() => setActiveTab('branches')}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'branches'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Branch Campus Management ({branches.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'users'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Staff & User Permissions ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('general')}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'general'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>General School Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('financial')}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'financial'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Currency & Financial Rates</span>
          </button>

          <button
            onClick={() => setActiveTab('academic')}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'academic'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Academic Years & Terms</span>
          </button>
        </div>
      </div>

      {saveToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>System settings updated successfully!</span>
        </div>
      )}

      {userToast && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-blue-600" />
          <span>{userToast}</span>
        </div>
      )}

      {/* TAB 1: BRANCH CAMPUS MANAGEMENT */}
      {activeTab === 'branches' && (
        <div className="bg-white rounded-b-xl shadow-xs border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Multi-Campus Branch Network</h3>
              <p className="text-xs text-slate-500">
                Configure physical campuses, directors, locations, and contact details.
              </p>
            </div>

            <button
              onClick={handleOpenAddBranch}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Campus Branch</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {branches.map((b) => (
              <div 
                key={b.id} 
                className={`p-4 rounded-xl border transition-all ${
                  currentBranchId === b.id 
                    ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-500' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded font-mono">
                      {b.code}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{b.city}</span>
                    {b.isHeadquarters && (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                        Headquarters
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditBranch(b)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100 cursor-pointer"
                      title="Edit Branch"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {!b.isHeadquarters && (
                      <button
                        onClick={() => handleDeleteBranch(b)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 cursor-pointer"
                        title="Delete Branch Campus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-xs font-khmer font-bold text-slate-800 mb-1">
                  {b.nameKhmer}
                </div>
                <div className="text-[11px] text-slate-500 mb-3">
                  {b.nameEnglish}
                </div>

                <div className="space-y-1 text-xs text-slate-600 border-t border-slate-100 pt-2 font-khmer">
                  <div><span className="text-slate-400">អាសយដ្ឋាន:</span> {b.addressKhmer}</div>
                  <div><span className="text-slate-400">នាយកសាខា:</span> <span className="font-bold text-slate-800">{b.directorName}</span></div>
                  <div><span className="text-slate-400">ទូរស័ព្ទ:</span> <span className="font-mono">{b.phone}</span></div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  {currentBranchId === b.id ? (
                    <span className="text-xs font-bold text-blue-700 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Active Current Branch
                    </span>
                  ) : (
                    <button
                      onClick={() => setCurrentBranchId(b.id)}
                      className="text-xs font-semibold text-slate-600 hover:text-blue-600 cursor-pointer"
                    >
                      Switch to this campus &gt;
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: STAFF & USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-b-xl shadow-xs border border-slate-200 p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">User Accounts & Role-Based Permissions</h3>
              <p className="text-xs text-slate-500">
                Manage staff profiles, assign campus branches, and set granular access permissions.
              </p>
            </div>

            <button
              onClick={handleOpenAddUser}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Staff / User</span>
            </button>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Campus Branch</th>
                  <th className="py-3 px-3">Contact</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-center">Permissions</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const branchObj = branches.find(b => b.id === u.branchId);
                  const activePermsCount = Object.values(u.permissions || {}).filter(Boolean).length;
                  const isCurrent = u.id === currentUser.id;

                  const rolePills: Record<UserRole, { label: string; color: string }> = {
                    super_admin: { label: 'Super Admin', color: 'bg-purple-100 text-purple-800 border-purple-200' },
                    campus_admin: { label: 'Campus Admin', color: 'bg-blue-100 text-blue-800 border-blue-200' },
                    accountant: { label: 'Accountant', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
                    teacher: { label: 'Teacher', color: 'bg-amber-100 text-amber-800 border-amber-200' }
                  };

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isCurrent && (
                                <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-slate-500">@{u.username}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${rolePills[u.role]?.color || 'bg-slate-100 text-slate-700'}`}>
                          {rolePills[u.role]?.label || u.role}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-medium text-slate-700">
                        {u.permissions?.accessAllBranches ? (
                          <span className="text-purple-700 font-bold">All Campuses (FBIS)</span>
                        ) : (
                          <span>{branchObj?.nameKhmer || branchObj?.code || 'Assigned Branch'}</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <div className="text-slate-800 font-mono text-[11px]">{u.phone || '012 345 678'}</div>
                        <div className="text-slate-500 text-[10px]">{u.email}</div>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.status === 'inactive' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'inactive' ? 'bg-slate-400' : 'bg-emerald-500'}`} />
                          {u.status === 'inactive' ? 'Inactive' : 'Active'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleOpenPermissions(u)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-md font-semibold text-[11px] border border-slate-200 transition-colors cursor-pointer"
                          title="Set Granular Permissions"
                        >
                          <Key className="w-3 h-3 text-amber-600" />
                          <span>{activePermsCount}/8 Perms</span>
                        </button>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEditUser(u)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100 cursor-pointer"
                            title="Edit User"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteUser(u)}
                            disabled={isCurrent}
                            className={`p-1.5 rounded transition-colors ${
                              isCurrent 
                                ? 'text-slate-200 cursor-not-allowed' 
                                : 'text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer'
                            }`}
                            title={isCurrent ? 'Cannot delete current logged-in account' : 'Delete User'}
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
      )}

      {/* TAB 2: GENERAL SCHOOL PROFILE */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveGeneral} className="bg-white rounded-b-xl shadow-xs border border-slate-200 p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            School Identity & Official Header
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">School Name (Khmer)</label>
              <input
                type="text"
                value={schoolNameKhmer}
                onChange={(e) => setSchoolNameKhmer(e.target.value)}
                className="w-full h-9 px-3 border border-slate-300 rounded-md font-khmer font-bold text-sm focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">School Name (English)</label>
              <input
                type="text"
                value={schoolNameEnglish}
                onChange={(e) => setSchoolNameEnglish(e.target.value)}
                className="w-full h-9 px-3 border border-slate-300 rounded-md font-bold focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save System Profile</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: FINANCIAL SETTINGS */}
      {activeTab === 'financial' && (
        <form onSubmit={handleSaveGeneral} className="bg-white rounded-b-xl shadow-xs border border-slate-200 p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Exchange Rates & Currency Configurations
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Default Exchange Rate (1 USD = KHR)</label>
              <input
                type="number"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(parseInt(e.target.value, 10) || 4100)}
                className="w-full h-9 px-3 border border-slate-300 rounded-md font-mono text-base font-bold text-blue-900"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Standard NBC / Market conversion rate used across all cashier collection entries.
              </span>
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Update Exchange Rates</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: ACADEMIC YEARS */}
      {activeTab === 'academic' && (
        <form onSubmit={handleSaveGeneral} className="bg-white rounded-b-xl shadow-xs border border-slate-200 p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Academic Calendar & Grade Levels
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Active Running Academic Year</label>
              <select
                value={activeAcademicYear}
                onChange={(e) => setActiveAcademicYear(e.target.value)}
                className="w-full h-9 px-3 border border-slate-300 rounded-md font-mono font-bold"
              >
                {settings.academicYears.map(yr => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Academic Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* Add / Edit Branch Modal */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-blue-800 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-200" />
                <span>{editingBranch ? 'Edit Campus Branch' : 'Add New FBIS Campus Branch'}</span>
              </h3>
              <button
                onClick={() => setIsBranchModalOpen(false)}
                className="text-blue-200 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBranch} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Branch Code</label>
                  <input
                    type="text"
                    required
                    value={branchCode}
                    onChange={(e) => setBranchCode(e.target.value)}
                    placeholder="e.g. FBIS 05"
                    className="w-full h-9 px-3 border border-slate-300 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City / Province</label>
                  <input
                    type="text"
                    required
                    value={branchCity}
                    onChange={(e) => setBranchCity(e.target.value)}
                    placeholder="e.g. Battambang"
                    className="w-full h-9 px-3 border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ឈ្មោះសាខាជាភាសាខ្មែរ</label>
                <input
                  type="text"
                  required
                  value={branchNameKhmer}
                  onChange={(e) => setBranchNameKhmer(e.target.value)}
                  placeholder="ឧ. សាលា អន្តរជាតិ ភ្លឺរស្មីក្រោយ សាខាបាត់ដំបង"
                  className="w-full h-9 px-3 border border-slate-300 rounded-md font-khmer"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Branch Name (English)</label>
                <input
                  type="text"
                  required
                  value={branchNameEnglish}
                  onChange={(e) => setBranchNameEnglish(e.target.value)}
                  placeholder="e.g. Future Bright International School - Battambang Campus"
                  className="w-full h-9 px-3 border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Campus Director Name (នាយកសាខា)</label>
                <input
                  type="text"
                  required
                  value={branchDirector}
                  onChange={(e) => setBranchDirector(e.target.value)}
                  placeholder="e.g. លោក ហេង វុទ្ធី"
                  className="w-full h-9 px-3 border border-slate-300 rounded-md font-khmer"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address / អាសយដ្ឋាន</label>
                <input
                  type="text"
                  required
                  value={branchAddressKhmer}
                  onChange={(e) => setBranchAddressKhmer(e.target.value)}
                  className="w-full h-9 px-3 border border-slate-300 rounded-md font-khmer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={branchPhone}
                    onChange={(e) => setBranchPhone(e.target.value)}
                    className="w-full h-9 px-3 border border-slate-300 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={branchEmail}
                    onChange={(e) => setBranchEmail(e.target.value)}
                    placeholder="branch@fbis.edu.kh"
                    className="w-full h-9 px-3 border border-slate-300 rounded-md font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBranchModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  Save Campus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Add / Edit Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-slate-200 my-8">
            <div className="bg-blue-800 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-200" />
                <span>{editingUser ? 'Edit Staff Profile' : 'Add New Staff / User Account'}</span>
              </h3>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="text-blue-200 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name (ឈ្មោះបុគ្គលិក)</label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Sok Chenda (សុខ ចិន្តា)"
                  className="w-full h-9 px-3 border border-slate-300 rounded-md font-khmer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Username (Login ID)</label>
                  <input
                    type="text"
                    required
                    value={userUsername}
                    onChange={(e) => setUserUsername(e.target.value)}
                    placeholder="chenda.sok"
                    className="w-full h-9 px-3 border border-slate-300 rounded-md font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role</label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as UserRole)}
                    className="w-full h-9 px-2.5 border border-slate-300 rounded-md bg-white font-semibold"
                  >
                    <option value="accountant">Accountant (គណនេយ្យករ)</option>
                    <option value="campus_admin">Campus Admin (ប្រធានសាខា)</option>
                    <option value="teacher">Teacher (គ្រូបង្រៀន)</option>
                    <option value="super_admin">Super Admin (អ្នកគ្រប់គ្រងជាន់ខ្ពស់)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Campus</label>
                  <select
                    value={userBranchId}
                    onChange={(e) => setUserBranchId(e.target.value)}
                    className="w-full h-9 px-2.5 border border-slate-300 rounded-md bg-white font-khmer"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.code} - {b.city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Account Status</label>
                  <select
                    value={userStatus}
                    onChange={(e) => setUserStatus(e.target.value as 'active' | 'inactive')}
                    className="w-full h-9 px-2.5 border border-slate-300 rounded-md bg-white font-semibold"
                  >
                    <option value="active">Active (សកម្ម)</option>
                    <option value="inactive">Inactive (អសកម្ម)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    placeholder="012 345 678"
                    className="w-full h-9 px-3 border border-slate-300 rounded-md font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="staff@fbis.edu.kh"
                    className="w-full h-9 px-3 border border-slate-300 rounded-md font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  Save User Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Granular Permissions Modal */}
      {isPermissionsModalOpen && selectedUserForPerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden border border-slate-200 my-8">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold font-khmer">
                  កំណត់សិទ្ធិប្រើប្រាស់ / Set Permissions ({selectedUserForPerms.name})
                </h3>
              </div>
              <button
                onClick={() => setIsPermissionsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center gap-3">
                <img
                  src={selectedUserForPerms.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"}
                  alt={selectedUserForPerms.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                />
                <div>
                  <div className="font-bold text-slate-900 text-sm">{selectedUserForPerms.name}</div>
                  <div className="text-slate-500 font-mono text-[11px]">
                    @{selectedUserForPerms.username} · Role: <span className="font-semibold text-blue-700">{selectedUserForPerms.role}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    key: 'managePayments' as keyof UserPermissions,
                    titleKm: 'ប្រមូលប្រាក់ & ចេញវិក្កយបត្រ',
                    titleEn: 'Collect Payments & Issue Invoices',
                    desc: 'Record student tuition, print receipts, and manage payment installments.'
                  },
                  {
                    key: 'manageStudents' as keyof UserPermissions,
                    titleKm: 'គ្រប់គ្រងព័ត៌មានសិស្ស & ចុះឈ្មោះ',
                    titleEn: 'Manage Students & Admissions',
                    desc: 'Enroll new admissions, edit student profiles, and update contact records.'
                  },
                  {
                    key: 'viewReports' as keyof UserPermissions,
                    titleKm: 'មើលរបាយការណ៍ហិរញ្ញវត្ថុ & ជំពាក់',
                    titleEn: 'View Financial & Arrears Reports',
                    desc: 'Access official 6-signature tuition collection and daily settlement reports.'
                  },
                  {
                    key: 'manageStock' as keyof UserPermissions,
                    titleKm: 'គ្រប់គ្រងស្តុក & ផលិតផល',
                    titleEn: 'Manage Stock & Inventory',
                    desc: 'Record batch stock-in, adjust physical balances, and review valuation.'
                  },
                  {
                    key: 'manageGrades' as keyof UserPermissions,
                    titleKm: 'បញ្ចូលពិន្ទុ & លទ្ធផលសិក្សា',
                    titleEn: 'Manage Academic Grades & Reports',
                    desc: 'Input monthly exam scores, calculate GPA, and generate report cards.'
                  },
                  {
                    key: 'manageSettings' as keyof UserPermissions,
                    titleKm: 'កំណត់ប្រព័ន្ធ & តារាងថ្លៃសិក្សា',
                    titleEn: 'System Settings & Fee Configurations',
                    desc: 'Configure exchange rates, academic years, and revenue categories.'
                  },
                  {
                    key: 'canDeleteRecords' as keyof UserPermissions,
                    titleKm: 'សិទ្ធិលុបទិន្នន័យ (Delete Authorization)',
                    titleEn: 'Authorize Record Deletion',
                    desc: 'Permit deleting student profiles, branch campuses, and ledger items.'
                  },
                  {
                    key: 'accessAllBranches' as keyof UserPermissions,
                    titleKm: 'សិទ្ធិមើលគ្រប់សាខាសាលាទាំងអស់',
                    titleEn: 'Multi-Campus Cross Access',
                    desc: 'Allow switching between all FBIS physical branches without restriction.'
                  }
                ].map((item) => {
                  const isChecked = permsState[item.key];
                  return (
                    <label
                      key={item.key}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isChecked ? 'bg-blue-50/70 border-blue-300' : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => setPermsState(prev => ({
                          ...prev,
                          [item.key]: e.target.checked
                        }))}
                        className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-slate-800 flex items-center gap-2">
                          <span className="font-khmer">{item.titleKm}</span>
                          <span className="text-[11px] font-normal text-slate-500 font-sans">({item.titleEn})</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPermissionsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePermissions}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Permissions</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
