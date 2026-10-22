import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Logo } from '../common/Logo';
import { UserRole } from '../../types';
import { Lock, User, Building2, LogIn, CheckCircle } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { isLoggedIn, login, branches, currentBranchId, settings } = useSchool();

  const [username, setUsername] = useState('fbis02_admin');
  const [password, setPassword] = useState('password123');
  const [selectedBranch, setSelectedBranch] = useState(currentBranchId);
  const [role, setRole] = useState<UserRole>('campus_admin');
  const [error, setError] = useState('');

  if (isLoggedIn) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter your username or email address.');
      return;
    }
    const success = login(username, role, selectedBranch);
    if (!success) {
      setError('Invalid credentials.');
    }
  };

  const handleSelectDemo = (u: string, r: UserRole, b: string) => {
    setUsername(u);
    setRole(r);
    setSelectedBranch(b);
    login(u, r, b);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Blue Header Banner */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-700 text-white p-6 text-center">
          <Logo size="xl" className="justify-center mb-2" />
          <h1 className="text-sm font-bold font-khmer text-amber-300">
            {settings.schoolNameKhmer}
          </h1>
          <h2 className="text-xs font-black tracking-wider text-white uppercase mt-0.5">
            {settings.schoolNameEnglish}
          </h2>
          <p className="text-[11px] text-blue-200 font-khmer mt-1">
            ប្រព័ន្ធគ្រប់គ្រងសាលារៀនពហុសាខា · Multi-Branch School Management System
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select Campus Branch (សាខាសាលា)
            </label>
            <div className="relative">
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 border border-slate-300 rounded-lg font-khmer bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.code} - {b.nameKhmer} ({b.city})
                  </option>
                ))}
              </select>
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Username or Email
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="fbis02_admin or your email"
                className="w-full h-9 pl-9 pr-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-9 pl-9 pr-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-600">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-blue-600" />
              <span>Remember me</span>
            </label>
            <span className="text-blue-600 hover:underline cursor-pointer">
              Forgot password?
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to School Portal</span>
          </button>

          {/* Quick Demo Accounts */}
          <div className="pt-3 border-t border-slate-200">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2 text-center">
              Quick 1-Click Demo Profiles
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSelectDemo('fbis02_admin', 'campus_admin', 'fbis-02')}
                className="p-2 border border-slate-200 hover:border-blue-500 hover:bg-blue-50 rounded-lg text-left transition-colors"
              >
                <div className="font-bold text-slate-800 text-[11px]">FBIS02 Admin</div>
                <div className="text-[10px] text-slate-500">Wat Bo Campus</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDemo('accountant_sr', 'accountant', 'fbis-02')}
                className="p-2 border border-slate-200 hover:border-blue-500 hover:bg-blue-50 rounded-lg text-left transition-colors"
              >
                <div className="font-bold text-slate-800 text-[11px]">Finance / Cashier</div>
                <div className="text-[10px] text-slate-500">Fee collections</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDemo('teacher_menghour', 'teacher', 'fbis-02')}
                className="p-2 border border-slate-200 hover:border-blue-500 hover:bg-blue-50 rounded-lg text-left transition-colors"
              >
                <div className="font-bold text-slate-800 text-[11px]">High School Teacher</div>
                <div className="text-[10px] text-slate-500">Grade & Marks entry</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDemo('superadmin', 'super_admin', 'fbis-01')}
                className="p-2 border border-slate-200 hover:border-blue-500 hover:bg-blue-50 rounded-lg text-left transition-colors"
              >
                <div className="font-bold text-slate-800 text-[11px]">Executive Super Admin</div>
                <div className="text-[10px] text-slate-500">All Campuses</div>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
