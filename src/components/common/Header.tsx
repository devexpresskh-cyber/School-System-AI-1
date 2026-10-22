import React, { useState, useRef, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Logo } from './Logo';
import { 
  Search, 
  MessageSquare, 
  Globe, 
  Building2, 
  ChevronDown, 
  LogOut, 
  Shield, 
  Settings as SettingsIcon,
  Menu,
  UserCheck,
  Check
} from 'lucide-react';
import { UserRole } from '../../types';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const {
    branches,
    currentBranchId,
    setCurrentBranchId,
    selectedBranch,
    currentUser,
    login,
    logout,
    students,
    setSelectedStudentId,
    setActiveTab,
    language,
    setLanguage
  } = useSchool();

  const [isBranchMenuOpen, setIsBranchMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState<typeof students>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const branchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (branchRef.current && !branchRef.current.contains(e.target as Node)) {
        setIsBranchMenuOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }
    const q = val.toLowerCase();
    const hits = students.filter(s => 
      s.nameKhmer.toLowerCase().includes(q) ||
      s.nameEnglish.toLowerCase().includes(q) ||
      s.studentCode.toLowerCase().includes(q) ||
      s.roll.includes(q) ||
      s.classGrade.toLowerCase().includes(q)
    );
    setSearchResults(hits.slice(0, 8));
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    setActiveTab('student-profile');
    setSearchInput('');
    setIsSearchFocused(false);
  };

  const handleQuickRoleSwitch = (role: UserRole) => {
    login(currentUser.username, role, currentBranchId);
    setIsProfileMenuOpen(false);
  };

  return (
    <header className="h-14 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 text-white flex items-center justify-between px-3 md:px-5 shadow-xs sticky top-0 z-40 select-none">
      {/* Left zone: Sidebar toggle + Brand Logo + Multi-Branch switcher */}
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div 
          onClick={() => setActiveTab('dashboard')} 
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-95 transition-opacity"
        >
          <Logo size="sm" branchNumber={selectedBranch?.code?.replace('FBIS ', '') || '2'} />
          <div className="hidden lg:flex flex-col">
            <span className="text-xs font-bold tracking-tight text-white font-khmer leading-none">
              សាលា អន្តរជាតិ ភ្លឺរស្មីក្រោយ
            </span>
            <span className="text-[10px] font-semibold text-blue-200 tracking-wider uppercase mt-0.5 leading-none">
              Future Bright Int'l School
            </span>
          </div>
        </div>

        {/* Multi-Branch Selector Dropdown */}
        <div className="relative ml-1 md:ml-3" ref={branchRef}>
          <button
            onClick={() => setIsBranchMenuOpen(!isBranchMenuOpen)}
            className="flex items-center gap-2 bg-blue-800/80 hover:bg-blue-800 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium border border-blue-500/40 transition-colors shadow-inner cursor-pointer"
            title="Switch Branch Campus"
          >
            <Building2 className="w-3.5 h-3.5 text-amber-300" />
            <span className="max-w-[130px] md:max-w-[180px] truncate">
              {currentBranchId === 'all' ? 'All Branches (Consolidated)' : selectedBranch?.nameEnglish?.replace('Future Bright International School - ', '') || 'Campus'}
            </span>
            <ChevronDown className="w-3 h-3 text-blue-200" />
          </button>

          {isBranchMenuOpen && (
            <div className="absolute left-0 mt-1.5 w-72 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Select School Branch
              </div>
              
              <button
                onClick={() => {
                  setCurrentBranchId('all');
                  setIsBranchMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between text-xs hover:bg-blue-50 transition-colors ${currentBranchId === 'all' ? 'bg-blue-50/80 font-bold text-blue-700' : 'text-slate-700'}`}
              >
                <div>
                  <div className="font-semibold">🏢 Consolidated All Branches</div>
                  <div className="text-[11px] text-slate-500 font-khmer">សាខាទាំងអស់រួមបញ្ចូលគ្នា</div>
                </div>
                {currentBranchId === 'all' && <Check className="w-4 h-4 text-blue-600" />}
              </button>

              <div className="my-1 border-t border-slate-100" />

              {branches.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    setCurrentBranchId(b.id);
                    setIsBranchMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 flex items-start justify-between text-xs hover:bg-blue-50 transition-colors ${currentBranchId === b.id ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-700'}`}
                >
                  <div className="pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded text-[10px] font-bold">
                        {b.code}
                      </span>
                      <span className="font-medium text-slate-900 truncate max-w-[170px]">{b.city}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-khmer mt-0.5 truncate max-w-[200px]">
                      {b.nameKhmer}
                    </div>
                  </div>
                  {currentBranchId === b.id && <Check className="w-4 h-4 text-blue-600 shrink-0 mt-1" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Middle zone: Instant Student Search Bar matching screenshot */}
      <div className="flex-1 max-w-md mx-3 relative" ref={searchRef}>
        <div className="relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            placeholder={language === 'km' ? 'ស្វែងរកសិស្ស (ឈ្មោះ, អត្តលេខ, ថ្នាក់)...' : 'Search Students (Name, Roll, Class)...'}
            className="w-full h-8.5 bg-white text-slate-800 pl-3 pr-8 rounded-md text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-inner"
          />
          <button 
            type="button" 
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Search Results Dropdown */}
        {isSearchFocused && searchResults.length > 0 && (
          <div className="absolute left-0 right-0 mt-1.5 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 max-h-80 overflow-y-auto">
            <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Student Results ({searchResults.length})
            </div>
            {searchResults.map((std) => (
              <div
                key={std.id}
                onClick={() => handleSelectStudent(std.id)}
                className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center justify-between border-b border-slate-50 last:border-none"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={std.avatar}
                    alt={std.nameEnglish}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900 font-khmer">
                      {std.nameKhmer} <span className="text-[11px] font-normal text-slate-500">({std.nameEnglish})</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Roll: {std.roll} · Code: {std.studentCode}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    {std.classGrade}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right zone: Notifications, Language, Profile Pill */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {/* Messages icon */}
        <button 
          onClick={() => setActiveTab('students')}
          className="p-1.5 text-blue-100 hover:text-white hover:bg-white/10 rounded-full transition-colors relative cursor-pointer"
          title="Student Messages & Announcements"
        >
          <MessageSquare className="w-4.5 h-4.5" />
          <span className="absolute 0 top-0.5 right-0.5 w-2 h-2 bg-amber-400 rounded-full" />
        </button>

        {/* Language switch */}
        <button
          onClick={() => setLanguage(language === 'km' ? 'en' : 'km')}
          className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded hover:bg-white/10 text-blue-100 hover:text-white transition-colors cursor-pointer"
          title="Toggle Khmer / English"
        >
          <Globe className="w-4 h-4 text-amber-300" />
          <span className="text-[11px] uppercase">{language === 'km' ? 'ខ្មែរ' : 'EN'}</span>
        </button>

        {/* Profile Pill matching screenshot "FBIS02 admin / Admin" */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-white/20"
          >
            <div className="relative w-7 h-7 rounded-full overflow-hidden border border-white/60 bg-blue-900">
              <img
                src={currentUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 rounded-full border border-blue-900" />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold leading-tight truncate max-w-[110px] text-white">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-blue-200 capitalize leading-tight">
                {currentUser.role.replace('_', ' ')}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-blue-200" />
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-900">{currentUser.name}</div>
                <div className="text-[11px] text-slate-500 font-mono truncate">{currentUser.email}</div>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-blue-700 font-medium">
                  <Shield className="w-3 h-3" />
                  <span>Campus: {selectedBranch.code} ({selectedBranch.city})</span>
                </div>
              </div>

              {/* Role Switcher for easy testing */}
              <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/70">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <UserCheck className="w-3 h-3" /> Quick Switch Role
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <button
                    onClick={() => handleQuickRoleSwitch('campus_admin')}
                    className={`px-2 py-1 rounded text-left transition-colors ${currentUser.role === 'campus_admin' ? 'bg-blue-600 text-white font-semibold' : 'bg-white hover:bg-slate-200 text-slate-700'}`}
                  >
                    Admin
                  </button>
                  <button
                    onClick={() => handleQuickRoleSwitch('accountant')}
                    className={`px-2 py-1 rounded text-left transition-colors ${currentUser.role === 'accountant' ? 'bg-blue-600 text-white font-semibold' : 'bg-white hover:bg-slate-200 text-slate-700'}`}
                  >
                    Finance / Cashier
                  </button>
                  <button
                    onClick={() => handleQuickRoleSwitch('teacher')}
                    className={`px-2 py-1 rounded text-left transition-colors ${currentUser.role === 'teacher' ? 'bg-blue-600 text-white font-semibold' : 'bg-white hover:bg-slate-200 text-slate-700'}`}
                  >
                    Teacher / Grades
                  </button>
                  <button
                    onClick={() => handleQuickRoleSwitch('super_admin')}
                    className={`px-2 py-1 rounded text-left transition-colors ${currentUser.role === 'super_admin' ? 'bg-blue-600 text-white font-semibold' : 'bg-white hover:bg-slate-200 text-slate-700'}`}
                  >
                    Super Director
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  setActiveTab('settings');
                  setIsProfileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <SettingsIcon className="w-4 h-4 text-slate-400" />
                <span>System Settings</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('backup-restore');
                  setIsProfileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Shield className="w-4 h-4 text-slate-400" />
                <span>Backup & Restore System</span>
              </button>

              <div className="my-1 border-t border-slate-100" />

              <button
                onClick={() => {
                  logout();
                  setIsProfileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer font-medium"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
