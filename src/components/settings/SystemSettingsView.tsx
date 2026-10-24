import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Branch, User, UserPermissions, UserRole } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';
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
  UserX,
  Send,
  Bell,
  RefreshCw,
  ExternalLink,
  Lock,
  Eye,
  EyeOff,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Database
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
    currentUser,
    testTelegramConnection,
    sendTelegramBackupNow
  } = useSchool();

  const [activeTab, setActiveTab] = useState<'branches' | 'users' | 'general' | 'financial' | 'academic' | 'telegram'>(() => {
    const saved = localStorage.getItem('fbis_settings_tab');
    if (saved === 'academic' || saved === 'branches' || saved === 'users' || saved === 'general' || saved === 'financial' || saved === 'telegram') {
      localStorage.removeItem('fbis_settings_tab');
      return saved as any;
    }
    return 'branches';
  });
  
  // General form state
  const [schoolNameKhmer, setSchoolNameKhmer] = useState(settings.schoolNameKhmer);
  const [schoolNameEnglish, setSchoolNameEnglish] = useState(settings.schoolNameEnglish);
  const [exchangeRate, setExchangeRate] = useState(settings.defaultExchangeRate);
  const [activeAcademicYear, setActiveAcademicYear] = useState(settings.activeAcademicYear);
  const [newClassName, setNewClassName] = useState('');
  const [saveToast, setSaveToast] = useState(false);
  const [userToast, setUserToast] = useState<string | null>(null);

  // Telegram Configuration Form State
  const [telegramBotToken, setTelegramBotToken] = useState(settings.telegramConfig?.botToken || '');
  const [telegramChatId, setTelegramChatId] = useState(settings.telegramConfig?.chatId || '');
  const [telegramChannelName, setTelegramChannelName] = useState(settings.telegramConfig?.channelName || '');
  const [telegramEnabled, setTelegramEnabled] = useState(settings.telegramConfig?.enabled ?? false);
  const [telegramPaymentAlerts, setTelegramPaymentAlerts] = useState(settings.telegramConfig?.paymentAlerts ?? true);
  const [telegramAutoBackup, setTelegramAutoBackup] = useState(settings.telegramConfig?.autoDailyBackup ?? true);
  const [telegramBackupTime, setTelegramBackupTime] = useState(settings.telegramConfig?.dailyBackupTime || '18:00');
  const [showBotToken, setShowBotToken] = useState(false);

  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [telegramTestResult, setTelegramTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [isBackingUpTelegram, setIsBackingUpTelegram] = useState(false);
  const [telegramBackupResult, setTelegramBackupResult] = useState<{ success: boolean; message: string } | null>(null);

  // In-app Confirmation Modal
  const [confirmModalData, setConfirmModalData] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    itemName?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

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

  // Edit Grade Level / Class state
  const [editingGradeLevel, setEditingGradeLevel] = useState<{ original: string; current: string } | null>(null);

  const handleSaveEditGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGradeLevel) return;
    const trimmed = editingGradeLevel.current.trim();
    if (!trimmed) return;
    if (trimmed !== editingGradeLevel.original) {
      if (settings.gradeLevels.includes(trimmed)) {
        setUserToast(`ឈ្មោះថ្នាក់ "${trimmed}" មានរួចហើយក្នុងប្រព័ន្ធ!`);
        setTimeout(() => setUserToast(null), 3000);
        return;
      }
      updateSettings({
        gradeLevels: settings.gradeLevels.map(g => g === editingGradeLevel.original ? trimmed : g)
      });
      setUserToast(`បានប្តូរឈ្មោះថ្នាក់ "${editingGradeLevel.original}" ទៅជា "${trimmed}" ដោយជោគជ័យ!`);
      setTimeout(() => setUserToast(null), 3000);
    }
    setEditingGradeLevel(null);
  };

  const handleDeleteGradeLevel = (gl: string) => {
    setConfirmModalData({
      isOpen: true,
      title: 'លុបកម្រិត/ថ្នាក់ (Delete Grade Level / Class)',
      message: `តើលោកអ្នកពិតជាចង់លុបកម្រិត/ថ្នាក់ "${gl}" ចេញពីបញ្ជីថ្នាក់រៀនមែនទេ? សិស្សដែលស្ថិតក្នុងថ្នាក់នេះនឹងមិនត្រូវបានលុបឡើយ។`,
      itemName: `Class / Grade: ${gl}`,
      onConfirm: () => {
        updateSettings({
          gradeLevels: settings.gradeLevels.filter(item => item !== gl)
        });
        setUserToast(`បានលុបថ្នាក់ "${gl}" ចេញពីបញ្ជី`);
        setTimeout(() => setUserToast(null), 3000);
      }
    });
  };

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

  const handleSaveTelegramSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      telegramConfig: {
        ...settings.telegramConfig,
        botToken: telegramBotToken.trim(),
        chatId: telegramChatId.trim(),
        channelName: telegramChannelName.trim(),
        enabled: telegramEnabled,
        paymentAlerts: telegramPaymentAlerts,
        autoDailyBackup: telegramAutoBackup,
        dailyBackupTime: telegramBackupTime,
      }
    });
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleTestTelegram = async () => {
    setIsTestingTelegram(true);
    setTelegramTestResult(null);
    try {
      const res = await testTelegramConnection(telegramBotToken.trim(), telegramChatId.trim());
      if (res.success) {
        setTelegramTestResult({ success: true, message: 'បានផ្ញើសារសាកល្បងទៅ Telegram ដោយជោគជ័យ! (Test message sent successfully)' });
      } else {
        setTelegramTestResult({ success: false, message: res.error || 'ការតភ្ជាប់បរាជ័យ សូមពិនិត្យ Bot Token និង Chat ID ម្តងទៀត' });
      }
    } catch (err: any) {
      setTelegramTestResult({ success: false, message: err?.message || 'កំហុសបច្ចេកទេសក្នុងការតភ្ជាប់' });
    } finally {
      setIsTestingTelegram(false);
    }
  };

  const handleManualTelegramBackup = async () => {
    setIsBackingUpTelegram(true);
    setTelegramBackupResult(null);
    try {
      updateSettings({
        telegramConfig: {
          ...settings.telegramConfig,
          botToken: telegramBotToken.trim(),
          chatId: telegramChatId.trim(),
          channelName: telegramChannelName.trim(),
          enabled: telegramEnabled,
          paymentAlerts: telegramPaymentAlerts,
          autoDailyBackup: telegramAutoBackup,
          dailyBackupTime: telegramBackupTime,
        }
      });
      const res = await sendTelegramBackupNow();
      if (res.success) {
        setTelegramBackupResult({ success: true, message: 'បានផ្ញើឯកសារ Backup មូលដ្ឋានទិន្នន័យទៅ Telegram ដោយជោគជ័យ!' });
      } else {
        setTelegramBackupResult({ success: false, message: res.error || 'បរាជ័យក្នុងការផ្ញើ Backup' });
      }
    } catch (err: any) {
      setTelegramBackupResult({ success: false, message: err?.message || 'កំហុសបច្ចេកទេសក្នុងការផ្ញើ Backup' });
    } finally {
      setIsBackingUpTelegram(false);
    }
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
    if (branches.length <= 1) {
      setUserToast('សាលាត្រូវមានសាខាដំណើរការយ៉ាងហោចណាស់ ១។ មិនអាចលុបសាខាចុងក្រោយបានទេ។ (Must keep at least 1 branch).');
      setTimeout(() => setUserToast(null), 3500);
      return;
    }

    setConfirmModalData({
      isOpen: true,
      title: 'លុបសាខាសាលា (Delete Branch Campus)',
      message: b.isHeadquarters
        ? `តើលោកអ្នកពិតជាចង់លុបសាខា "${b.nameKhmer}" (${b.code}) មែនទេ? ដោយសារសាខានេះជាទីស្នាក់ការកណ្តាល (Headquarters) តួនាទីនេះនឹងត្រូវផ្ទេរទៅសាខាបន្ទាប់ដោយស្វ័យប្រវត្តិ។`
        : `តើលោកអ្នកពិតជាចង់លុបសាខាសាលា "${b.nameKhmer} (${b.code})"? រាល់ទិន្នន័យប្រវត្តិសាស្ត្រត្រូវបានរក្សាទុក។`,
      itemName: `${b.code} - ${b.nameKhmer} (${b.city})`,
      onConfirm: () => {
        const ok = deleteBranch(b.id);
        if (ok) {
          setUserToast(`បានលុបសាខា ${b.code} ដោយជោគជ័យ (Branch ${b.code} deleted successfully)`);
          setTimeout(() => setUserToast(null), 3000);
        }
      }
    });
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
      setUserToast('មិនអាចលុបគណនីដែលកំពុងចូលប្រើប្រាស់បានទេ (Cannot delete your own active account).');
      setTimeout(() => setUserToast(null), 3000);
      return;
    }
    setConfirmModalData({
      isOpen: true,
      title: 'លុបគណនីបុគ្គលិក (Delete User Account)',
      message: `តើលោកអ្នកពិតជាចង់លុបគណនី "${u.name}" (@${u.username}) នេះមែនទេ?`,
      itemName: `${u.name} (@${u.username}) - ${u.email}`,
      onConfirm: () => {
        deleteUser(u.id);
        setUserToast(`User ${u.name} deleted.`);
        setTimeout(() => setUserToast(null), 3000);
      }
    });
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
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span>Classes & Academic (ថ្នាក់រៀន & ឆ្នាំសិក្សា) ({settings.gradeLevels.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('telegram')}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'telegram'
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Send className="w-4 h-4 text-sky-500" />
            <span className="flex items-center gap-1.5">
              <span>Telegram Alerts & Backup (តេឡេក្រាម)</span>
              {settings.telegramConfig?.enabled && (
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              )}
            </span>
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

                    {branches.length > 1 && (
                      <button
                        onClick={() => handleDeleteBranch(b)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 cursor-pointer transition-colors"
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

          {/* Registered Classes & Grade Levels Management */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 font-khmer">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>បញ្ជីថ្នាក់ & កម្រិតសិក្សាដែលបានចុះឈ្មោះ (Registered Class & Grade List - {settings.gradeLevels.length} Classes)</span>
                </h4>
                <p className="text-[11px] text-slate-500 font-khmer">
                  ថ្នាក់ទាំងនេះនឹងបង្ហាញក្នុងបញ្ជីជ្រើសរើស (Dropdown) សម្រាប់ពាក្យសុំចូលរៀន ការបង់ប្រាក់ និងការគ្រប់គ្រងសិស្ស។
                </p>
              </div>

              {/* Add New Class inline form */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="ឈ្មោះថ្នាក់ថ្មី (e.g. ថ្នាក់ទី ៧A)"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const trimmed = newClassName.trim();
                      if (trimmed && !settings.gradeLevels.includes(trimmed)) {
                        updateSettings({
                          gradeLevels: [...settings.gradeLevels, trimmed]
                        });
                        setNewClassName('');
                        setUserToast(`បានបន្ថែមថ្នាក់ "${trimmed}" ដោយជោគជ័យ!`);
                        setTimeout(() => setUserToast(null), 3000);
                      }
                    }
                  }}
                  className="h-8 px-2.5 text-xs border border-slate-300 rounded-md font-khmer focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    const trimmed = newClassName.trim();
                    if (trimmed && !settings.gradeLevels.includes(trimmed)) {
                      updateSettings({
                        gradeLevels: [...settings.gradeLevels, trimmed]
                      });
                      setNewClassName('');
                      setUserToast(`បានបន្ថែមថ្នាក់ "${trimmed}" ដោយជោគជ័យ!`);
                      setTimeout(() => setUserToast(null), 3000);
                    }
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-md shadow-xs flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ បន្ថែមថ្នាក់</span>
                </button>
              </div>
            </div>

            {/* Class Chips List */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-wrap gap-2 max-h-56 overflow-y-auto">
              {settings.gradeLevels.map((gl) => (
                <div
                  key={gl}
                  className="bg-white border border-slate-300 hover:border-blue-400 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 flex items-center gap-2 shadow-2xs font-khmer group transition-all"
                >
                  <span>{gl}</span>
                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => setEditingGradeLevel({ original: gl, current: gl })}
                      className="text-slate-400 hover:text-blue-600 p-0.5 rounded transition-colors cursor-pointer"
                      title="Edit grade level name (កែប្រែឈ្មោះថ្នាក់)"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    {settings.gradeLevels.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteGradeLevel(gl)}
                        className="text-slate-400 hover:text-red-600 p-0.5 rounded transition-colors cursor-pointer"
                        title="Delete grade level (លុបថ្នាក់)"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
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

      {/* Telegram Alerts & Backup Settings Tab */}
      {activeTab === 'telegram' && (
        <div className="space-y-4">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-blue-800 rounded-xl p-5 text-white shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/20">
                  <Send className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold font-khmer">ការតភ្ជាប់ Telegram Bot (Telegram Alerts & Cloud Backup)</h2>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      telegramEnabled && telegramBotToken && telegramChatId 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-white/20 text-sky-100'
                    }`}>
                      {telegramEnabled && telegramBotToken && telegramChatId ? '● សកម្ម (Active)' : '○ មិនទាន់បើក (Inactive)'}
                    </span>
                  </div>
                  <p className="text-xs text-sky-100 mt-1 leading-relaxed">
                    កំណត់រចនាសម្ព័ន្ធ Telegram Bot សម្រាប់ផ្ញើសារជូនដំណឹងវិក្កយបត្របង់ប្រាក់សិស្ស (Payment Alerts) ដោយស្វ័យប្រវត្តិ 
                    និងបម្រុងទុកមូលដ្ឋានទិន្នន័យ (Auto Daily Database Backup) ចូលទៅក្នុង Telegram Group/Channel របស់អ្នក។
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleTestTelegram}
                  disabled={isTestingTelegram || !telegramBotToken || !telegramChatId}
                  className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold rounded-lg border border-white/20 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  title="ផ្ញើសារសាកល្បងទៅកាន់ Telegram"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingTelegram ? 'animate-spin' : ''}`} />
                  <span>{isTestingTelegram ? 'កំពុងផ្ញើ...' : 'ផ្ញើសារសាកល្បង (Test)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleManualTelegramBackup}
                  disabled={isBackingUpTelegram || !telegramBotToken || !telegramChatId}
                  className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  title="ផ្ញើឯកសារ Backup ទៅ Telegram ឥឡូវនេះ"
                >
                  <Database className={`w-3.5 h-3.5 ${isBackingUpTelegram ? 'animate-bounce' : ''}`} />
                  <span>{isBackingUpTelegram ? 'កំពុងផ្ញើ Backup...' : 'Backup ទៅ Telegram ឥឡូវនេះ'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Test & Backup Results Banner */}
          {telegramTestResult && (
            <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
              telegramTestResult.success 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              {telegramTestResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 font-khmer">
                <div className="font-bold">{telegramTestResult.success ? 'ជោគជ័យ (Success)' : 'បរាជ័យ (Failed)'}</div>
                <div>{telegramTestResult.message}</div>
              </div>
              <button 
                type="button" 
                onClick={() => setTelegramTestResult(null)} 
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {telegramBackupResult && (
            <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
              telegramBackupResult.success 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              {telegramBackupResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 font-khmer">
                <div className="font-bold">{telegramBackupResult.success ? 'ជោគជ័យ (Success)' : 'បរាជ័យ (Failed)'}</div>
                <div>{telegramBackupResult.message}</div>
              </div>
              <button 
                type="button" 
                onClick={() => setTelegramBackupResult(null)} 
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Setup Guide Info Box */}
          <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-4 text-xs">
            <h3 className="font-bold text-sky-900 flex items-center gap-1.5 mb-2 font-khmer">
              <HelpCircle className="w-4 h-4 text-sky-600" />
              <span>ការណែនាំអំពីរបៀបបង្កើត Telegram Bot និងយក Chat ID (Step-by-step Setup Guide)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sky-950 font-sans text-[11px] leading-relaxed">
              <div className="bg-white p-3 rounded-lg border border-sky-100 shadow-2xs">
                <span className="inline-block px-1.5 py-0.5 bg-sky-100 text-sky-800 font-bold rounded text-[10px] mb-1">
                  ជំហានទី ១: បង្កើត Bot
                </span>
                <p>
                  បើកកម្មវិធី Telegram ហើយស្វែងរក <b>@BotFather</b> រួចផ្ញើពាក្យ <code>/newbot</code>។ ដាក់ឈ្មោះ Bot និង Username រួចចម្លង <b>API Token</b> (ឧទាហរណ៍: <code>7123456789:AAHxyz...</code>)។
                </p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-sky-100 shadow-2xs">
                <span className="inline-block px-1.5 py-0.5 bg-sky-100 text-sky-800 font-bold rounded text-[10px] mb-1">
                  ជំហានទី ២: បង្កើត Group/Channel
                </span>
                <p>
                  បង្កើត Telegram Group ឬ Channel ថ្មីសម្រាប់ថ្នាក់គ្រប់គ្រងសាលា (ឧទាហរណ៍: FBIS Finance Alerts) រួចបន្ថែម Bot ដែលបានបង្កើតខាងលើជា <b>Administrator</b>។
                </p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-sky-100 shadow-2xs">
                <span className="inline-block px-1.5 py-0.5 bg-sky-100 text-sky-800 font-bold rounded text-[10px] mb-1">
                  ជំហានទី ៣: យក Chat ID
                </span>
                <p>
                  បន្ថែម <b>@userinfobot</b> ឬ <b>@RawDataBot</b> ទៅក្នុង Group ដើម្បីមើលលេខសម្គាល់ <b>Chat ID</b> (ឧ. <code>-100234567890</code>) ឬអាចប្រើ Channel Username (ឧ. <code>@fbis_finance</code>)។
                </p>
              </div>
            </div>
          </div>

          {/* Configuration Form */}
          <form onSubmit={handleSaveTelegramSettings} className="space-y-4">
            <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm font-khmer">ព័ត៌មានសម្ងាត់ Bot (Bot API Credentials)</h3>
                  <p className="text-slate-500 text-[11px]">បញ្ចូល Telegram Bot Token និង Chat ID សម្រាប់ធ្វើការបញ្ជូនទិន្នន័យ</p>
                </div>

                {/* Master Enable Switch */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="font-semibold text-slate-700 font-khmer">បើកដំណើរការ Telegram:</span>
                  <input
                    type="checkbox"
                    checked={telegramEnabled}
                    onChange={(e) => setTelegramEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600 relative"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bot Token */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Telegram Bot Token <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showBotToken ? 'text' : 'password'}
                      required
                      value={telegramBotToken}
                      onChange={(e) => setTelegramBotToken(e.target.value)}
                      placeholder="e.g. 7123456789:AAHk1_wXYZ..."
                      className="w-full h-9 pl-3 pr-10 border border-slate-300 rounded-md font-mono text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowBotToken(!showBotToken)}
                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      title={showBotToken ? 'Hide Bot Token' : 'Show Bot Token'}
                    >
                      {showBotToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    ទទួលបានពី @BotFather ក្នុង Telegram
                  </span>
                </div>

                {/* Chat ID / Channel ID */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Telegram Chat ID ឬ Channel Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                    placeholder="e.g. -1001234567890 ឬ @fbis_finance_channel"
                    className="w-full h-9 px-3 border border-slate-300 rounded-md font-mono text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    លេខសម្គាល់ក្រុម ឬ Channel (លេខអវិជ្ជមានសម្រាប់ក្រុម ឧ. -100...)
                  </span>
                </div>
              </div>

              {/* Channel Friendly Name */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ឈ្មោះសម្គាល់ Channel / Group (Friendly Channel Name)
                </label>
                <input
                  type="text"
                  value={telegramChannelName}
                  onChange={(e) => setTelegramChannelName(e.target.value)}
                  placeholder="e.g. FBIS Siem Reap Campus 02 - Finance & Alerts Group"
                  className="w-full h-9 px-3 border border-slate-300 rounded-md font-khmer text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Notification Services & Automation Triggers */}
            <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 space-y-4 text-xs">
              <h3 className="font-bold text-slate-800 text-sm font-khmer pb-2 border-b border-slate-100 flex items-center gap-2">
                <Bell className="w-4 h-4 text-sky-600" />
                <span>មុខងារផ្ញើសារជូនដំណឹងស្វ័យប្រវត្តិ (Automated Notifications & Backup Tasks)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Real-time Payment Alerts */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white transition-all space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 font-khmer">សារជូនដំណឹងវិក្កយបត្រភ្លាមៗ</h4>
                        <span className="text-[11px] text-slate-500 font-sans">Real-time Payment Alert</span>
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={telegramPaymentAlerts}
                      onChange={(e) => setTelegramPaymentAlerts(e.target.checked)}
                      className="w-4 h-4 text-sky-600 rounded cursor-pointer"
                    />
                  </div>

                  <p className="text-[11px] text-slate-600 font-khmer leading-relaxed">
                    ផ្ញើសារបង្កាន់ដៃទទួលប្រាក់ផ្លូវការ (Payment Receipt) ភ្លាមៗរាល់ពេលបេឡាធិការកត់ត្រាការបង់ប្រាក់សិស្សក្នុងប្រព័ន្ធ។ 
                    សារមានបង្ហាញឈ្មោះសិស្ស អត្តលេខ ថ្នាក់ តម្លៃពេញ បញ្ចុះតម្លៃ ទឹកប្រាក់បានបង់ (USD & KHR) និងទឹកប្រាក់នៅសល់ជំពាក់។
                  </p>
                </div>

                {/* Auto Daily Backup to Telegram */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white transition-all space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <Database className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 font-khmer">ស្វ័យប្រវត្តិបម្រុងទុកទិន្នន័យប្រចាំថ្ងៃ</h4>
                        <span className="text-[11px] text-slate-500 font-sans">Auto Daily Database Backup</span>
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={telegramAutoBackup}
                      onChange={(e) => setTelegramAutoBackup(e.target.checked)}
                      className="w-4 h-4 text-sky-600 rounded cursor-pointer"
                    />
                  </div>

                  <p className="text-[11px] text-slate-600 font-khmer leading-relaxed">
                    ផ្ញើឯកសារ JSON Backup មូលដ្ឋានទិន្នន័យពេញលេញ និងរបាយការណ៍សង្ខេបប្រចាំថ្ងៃចូលទៅ Telegram Channel ជាស្វ័យប្រវត្តិតាមពេលវេលាកំណត់។
                  </p>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                    <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1 font-khmer">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>ម៉ោងបម្រុងទុកប្រចាំថ្ងៃ:</span>
                    </label>
                    <input
                      type="time"
                      value={telegramBackupTime}
                      onChange={(e) => setTelegramBackupTime(e.target.value)}
                      className="h-8 px-2.5 border border-slate-300 rounded-md font-mono text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>

                  {settings.telegramConfig?.lastBackupDate && (
                    <div className="text-[10px] text-slate-500 pt-1">
                      កាលបរិច្ឆេទ Backup ចុងក្រោយ: <span className="font-mono text-slate-700 font-semibold">{new Date(settings.telegramConfig.lastBackupDate).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Save Buttons Bar */}
            <div className="pt-2 flex items-center justify-between">
              <div className="text-[11px] text-slate-500">
                {telegramEnabled 
                  ? '✨ ប្រព័ន្ធ Telegram ត្រូវបានបើកដំណើរការសម្រាប់ការផ្ញើសារស្វ័យប្រវត្តិ។'
                  : 'ℹ️ សូមបើកកុងតាក់ "បើកដំណើរការ Telegram" ខាងលើដើម្បីចាប់ផ្តើមទទួលសារជូនដំណឹង។'
                }
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>រក្សាទុកការកំណត់ Telegram (Save Telegram Settings)</span>
                </button>
              </div>
            </div>
          </form>
        </div>
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

      {/* Edit Grade Level Modal */}
      {editingGradeLevel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-blue-800 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-200" />
                <span>កែសម្រួលឈ្មោះកម្រិត/ថ្នាក់ (Edit Grade Level / Class)</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingGradeLevel(null)}
                className="text-blue-200 hover:text-white p-1 rounded hover:bg-blue-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditGrade} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ឈ្មោះកម្រិត/ថ្នាក់ (Grade Level / Class Name)
                </label>
                <input
                  type="text"
                  value={editingGradeLevel.current}
                  onChange={(e) => setEditingGradeLevel(prev => prev ? { ...prev, current: e.target.value } : null)}
                  className="w-full h-9 px-3 border border-slate-300 rounded-md font-khmer font-bold text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  required
                  autoFocus
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  ឈ្មោះដើម: <span className="font-semibold text-slate-700 font-khmer">{editingGradeLevel.original}</span>
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingGradeLevel(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>រក្សាទុក (Save Class Name)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-app Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModalData.isOpen}
        title={confirmModalData.title}
        message={confirmModalData.message}
        itemName={confirmModalData.itemName}
        onConfirm={confirmModalData.onConfirm}
        onClose={() => setConfirmModalData(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
