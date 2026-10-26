import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { ConfirmModal } from '../common/ConfirmModal';
import { 
  GraduationCap, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  ArrowUp, 
  ArrowDown, 
  Users, 
  CheckCircle2, 
  Layers, 
  Sparkles, 
  X, 
  Filter,
  Check,
  BookOpen,
  Globe2
} from 'lucide-react';

interface ClassInfo {
  name: string;
  program: 'khmer' | 'english';
  cycle: string;
  studentCount: number;
  originalIndex: number;
}

export const RegisteredClassesTableView: React.FC = () => {
  const { settings, updateSettings, students, branchStudents } = useSchool();

  const [activeTab, setActiveTab] = useState<'khmer' | 'english' | 'all'>('khmer');
  const [searchQuery, setSearchQuery] = useState('');
  const [cycleFilter, setCycleFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add Class Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProgram, setNewProgram] = useState<'khmer' | 'english'>('khmer');
  const [newClassName, setNewClassName] = useState('');
  const [newCycleCategory, setNewCycleCategory] = useState<string>('');

  // Edit Class Modal State
  const [editingGrade, setEditingGrade] = useState<{ original: string; current: string } | null>(null);

  // Confirm Modal State
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper to classify program
  const classifyProgram = (name: string): 'khmer' | 'english' => {
    const lower = name.toLowerCase().trim();
    if (
      lower.includes('english') ||
      lower.includes('level') ||
      lower.includes('gep') ||
      lower.includes('starter') ||
      lower.includes('elementary') ||
      lower.includes('intermediate') ||
      lower.includes('advanced') ||
      lower.startsWith('grade') ||
      lower.includes('nursery') ||
      lower.includes('pre-k')
    ) {
      return 'english';
    }
    // If it starts with K1/K2/K3 without English or has Khmer text
    return 'khmer';
  };

  // Helper to determine educational cycle
  const determineCycle = (name: string, program: 'khmer' | 'english'): string => {
    const lower = name.toLowerCase();

    if (program === 'khmer') {
      if (lower.includes('k1') || lower.includes('k2') || lower.includes('k3') || lower.includes('មត្តេយ្យ')) {
        return 'មត្តេយ្យសិក្សា (Kindergarten)';
      }
      if (
        lower.includes('ថ្នាក់ទី ១') || lower.includes('ថ្នាក់ទី ២') || 
        lower.includes('ថ្នាក់ទី ៣') || lower.includes('ថ្នាក់ទី ៤') || 
        lower.includes('ថ្នាក់ទី ៥') || lower.includes('ថ្នាក់ទី ៦')
      ) {
        return 'បឋមសិក្សា (Primary: G1-6)';
      }
      if (
        lower.includes('ថ្នាក់ទី ៧') || lower.includes('ថ្នាក់ទី ៨') || 
        lower.includes('ថ្នាក់ទី ៩')
      ) {
        return 'អនុវិទ្យាល័យ (Lower Sec: G7-9)';
      }
      if (
        lower.includes('ថ្នាក់ទី ១០') || lower.includes('ថ្នាក់ទី ១១') || 
        lower.includes('ថ្នាក់ទី ១២')
      ) {
        return 'វិទ្យាល័យ (Upper Sec: G10-12)';
      }
      return 'ចំណេះទូទៅ (General)';
    } else {
      if (lower.includes('nursery') || lower.includes('pre-k') || lower.includes('kindergarten')) {
        return 'Early Years / Preschool';
      }
      if (
        lower.includes('level 1') || lower.includes('level 2') || 
        lower.includes('level 3') || lower.includes('level 4') || 
        lower.includes('starter') || lower.includes('elementary')
      ) {
        return 'Primary English (Starter - Elem)';
      }
      if (
        lower.includes('level 5') || lower.includes('level 6') || 
        lower.includes('intermediate') || lower.includes('advanced')
      ) {
        return 'Upper-Intermediate / Advanced';
      }
      if (
        lower.includes('level 7') || lower.includes('level 8') || 
        lower.includes('level 9') || lower.includes('level 10') || 
        lower.includes('level 11') || lower.includes('level 12')
      ) {
        return 'Secondary & Adult English (L7-12)';
      }
      return 'General English Program';
    }
  };

  // Calculate enrolled students per class
  const getStudentCount = (className: string) => {
    const norm = className.trim().toLowerCase();
    return students.filter(s => {
      if (!s.classGrade) return false;
      const sNorm = s.classGrade.trim().toLowerCase();
      return sNorm === norm || sNorm.includes(norm) || norm.includes(sNorm);
    }).length;
  };

  // Structured list of classes with metadata
  const classList: ClassInfo[] = useMemo(() => {
    return settings.gradeLevels.map((gl, index) => {
      const prog = classifyProgram(gl);
      return {
        name: gl,
        program: prog,
        cycle: determineCycle(gl, prog),
        studentCount: getStudentCount(gl),
        originalIndex: index
      };
    });
  }, [settings.gradeLevels, students]);

  // Split lists
  const khmerClasses = useMemo(() => classList.filter(c => c.program === 'khmer'), [classList]);
  const englishClasses = useMemo(() => classList.filter(c => c.program === 'english'), [classList]);

  // Total enrolled counts
  const totalKhmerStudents = useMemo(() => {
    return khmerClasses.reduce((acc, c) => acc + c.studentCount, 0);
  }, [khmerClasses]);

  const totalEnglishStudents = useMemo(() => {
    return englishClasses.reduce((acc, c) => acc + c.studentCount, 0);
  }, [englishClasses]);

  // Filtered list according to tab, search and cycle
  const displayList = useMemo(() => {
    let list: ClassInfo[] = [];
    if (activeTab === 'khmer') list = khmerClasses;
    else if (activeTab === 'english') list = englishClasses;
    else list = classList;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.cycle.toLowerCase().includes(q)
      );
    }

    if (cycleFilter !== 'all') {
      list = list.filter(c => c.cycle === cycleFilter);
    }

    return list;
  }, [activeTab, khmerClasses, englishClasses, classList, searchQuery, cycleFilter]);

  // Unique cycles for filter dropdown
  const availableCycles = useMemo(() => {
    const set = new Set<string>();
    const targetList = activeTab === 'khmer' ? khmerClasses : activeTab === 'english' ? englishClasses : classList;
    targetList.forEach(c => set.add(c.cycle));
    return Array.from(set);
  }, [activeTab, khmerClasses, englishClasses, classList]);

  // Reorder actions
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= settings.gradeLevels.length) return;

    const copy = [...settings.gradeLevels];
    const temp = copy[index];
    copy[index] = copy[newIdx];
    copy[newIdx] = temp;

    updateSettings({ gradeLevels: copy });
    showToast(`បានផ្លាស់ប្តូរលំដាប់ថ្នាក់ដោយជោគជ័យ`);
  };

  // Add new class handler
  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newClassName.trim();
    if (!trimmed) return;

    if (settings.gradeLevels.includes(trimmed)) {
      showToast(`ឈ្មោះថ្នាក់ "${trimmed}" មានរួចហើយក្នុងប្រព័ន្ធ!`);
      return;
    }

    // Determine insertion position based on program
    let updatedLevels: string[];
    if (newProgram === 'khmer') {
      // Find the last khmer class index and insert after it
      let lastKhmerIdx = -1;
      settings.gradeLevels.forEach((gl, idx) => {
        if (classifyProgram(gl) === 'khmer') lastKhmerIdx = idx;
      });
      if (lastKhmerIdx !== -1) {
        updatedLevels = [
          ...settings.gradeLevels.slice(0, lastKhmerIdx + 1),
          trimmed,
          ...settings.gradeLevels.slice(lastKhmerIdx + 1)
        ];
      } else {
        updatedLevels = [trimmed, ...settings.gradeLevels];
      }
    } else {
      updatedLevels = [...settings.gradeLevels, trimmed];
    }

    updateSettings({ gradeLevels: updatedLevels });
    showToast(`បានបន្ថែមថ្នាក់ថ្មី "${trimmed}" ក្នុងកម្មវិធី ${newProgram === 'khmer' ? 'ភាសាខ្មែរ' : 'ភាសាអង់គ្លេស'}`);
    setNewClassName('');
    setIsAddModalOpen(false);
  };

  // Save edit grade handler
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGrade) return;
    const trimmed = editingGrade.current.trim();
    if (!trimmed) return;

    if (trimmed !== editingGrade.original) {
      if (settings.gradeLevels.includes(trimmed)) {
        showToast(`ឈ្មោះថ្នាក់ "${trimmed}" មានរួចហើយក្នុងប្រព័ន្ធ!`);
        return;
      }
      updateSettings({
        gradeLevels: settings.gradeLevels.map(g => g === editingGrade.original ? trimmed : g)
      });
      showToast(`បានប្តូរឈ្មោះថ្នាក់ "${editingGrade.original}" ទៅជា "${trimmed}"`);
    }
    setEditingGrade(null);
  };

  // Delete grade level handler
  const handleDeleteGrade = (className: string, studentCount: number) => {
    setConfirmModalData({
      isOpen: true,
      title: 'លុបកម្រិត/ថ្នាក់ (Delete Grade Level / Class)',
      message: studentCount > 0 
        ? `ការព្រមាន៖ មានសិស្សចំនួន ${studentCount} នាក់កំពុងរៀនក្នុងថ្នាក់ "${className}"។ តើលោកអ្នកពិតជាចង់លុបថ្នាក់នេះចេញពីបញ្ជីមែនទេ? (ទិន្នន័យសិស្សនឹងមិនបាត់បង់ទេ ប៉ុន្តែថ្នាក់នេះនឹងលែងបង្ហាញក្នុងបញ្ជីជ្រើសរើស)`
        : `តើលោកអ្នកពិតជាចង់លុបថ្នាក់ "${className}" ចេញពីបញ្ជីថ្នាក់រៀនមែនទេ?`,
      itemName: `Class: ${className} (${studentCount} Students)`,
      onConfirm: () => {
        updateSettings({
          gradeLevels: settings.gradeLevels.filter(item => item !== className)
        });
        showToast(`បានលុបថ្នាក់ "${className}" ចេញពីប្រព័ន្ធ`);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setToastMessage(null)}
            className="text-blue-400 hover:text-blue-700 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Program Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Khmer Program Card */}
        <div 
          onClick={() => { setActiveTab('khmer'); setCycleFilter('all'); }}
          className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
            activeTab === 'khmer'
              ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🇰🇭</span>
                <span className="font-bold text-xs text-blue-950 font-khmer">
                  កម្មវិធីចំណេះទូទៅភាសាខ្មែរ
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Khmer General Education Program</p>
            </div>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">
              {khmerClasses.length} ថ្នាក់
            </span>
          </div>
          
          <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-blue-100/60">
            <span className="text-slate-500 font-khmer flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>សិស្សកំពុងរៀនសរុប:</span>
            </span>
            <span className="font-mono font-bold text-blue-900">{totalKhmerStudents} នាក់</span>
          </div>
        </div>

        {/* English Program Card */}
        <div 
          onClick={() => { setActiveTab('english'); setCycleFilter('all'); }}
          className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
            activeTab === 'english'
              ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 ring-2 ring-amber-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🇬🇧</span>
                <span className="font-bold text-xs text-amber-950 font-khmer">
                  កម្មវិធីភាសាអង់គ្លេស
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">English Language Program (GEP)</p>
            </div>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full">
              {englishClasses.length} កម្រិត
            </span>
          </div>
          
          <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-amber-100/60">
            <span className="text-slate-500 font-khmer flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-600" />
              <span>សិស្សកំពុងរៀនសរុប:</span>
            </span>
            <span className="font-mono font-bold text-amber-900">{totalEnglishStudents} នាក់</span>
          </div>
        </div>

        {/* Total Overall Card */}
        <div 
          onClick={() => { setActiveTab('all'); setCycleFilter('all'); }}
          className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
            activeTab === 'all'
              ? 'bg-gradient-to-br from-slate-50 to-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">📚</span>
                <span className="font-bold text-xs text-slate-900 font-khmer">
                  ថ្នាក់រៀនសរុបទាំងពីរកម្មវិធី
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Total Registered Classes Across System</p>
            </div>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-800 text-[10px] font-bold rounded-full">
              {settings.gradeLevels.length} Classes
            </span>
          </div>
          
          <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span className="text-slate-500 font-khmer flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
              <span>ឆ្នាំសិក្សាសកម្ម:</span>
            </span>
            <span className="font-mono font-bold text-slate-800">{settings.activeAcademicYear}</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {/* Table Header & Controls Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 font-khmer">
                <GraduationCap className="w-5 h-5 text-blue-700" />
                <span>
                  {activeTab === 'khmer' && 'បញ្ជីថ្នាក់រៀន - កម្មវិធីចំណេះទូទៅភាសាខ្មែរ (Khmer General Education)'}
                  {activeTab === 'english' && 'បញ្ជីកម្រិតសិក្សា - កម្មវិធីភាសាអង់គ្លេស (English Program / GEP)'}
                  {activeTab === 'all' && 'បញ្ជីថ្នាក់រៀន & កម្រិតសិក្សាទាំងអស់ (All Registered Classes & Grades)'}
                </span>
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 font-mono font-bold rounded-full">
                  {displayList.length}
                </span>
              </h4>
              <p className="text-[11px] text-slate-500 font-khmer mt-0.5">
                តារាងថ្នាក់រៀនត្រូវបានបែងចែកដាច់ដោយឡែករវាងកម្មវិធីខ្មែរ និងអង់គ្លេស សម្រាប់ប្រើប្រាស់ក្នុងទម្រង់ចុះឈ្មោះ ការបង់ប្រាក់ និងការគ្រប់គ្រងសិស្ស។
              </p>
            </div>

            {/* Add Class Button */}
            <button
              type="button"
              onClick={() => {
                setNewProgram(activeTab === 'english' ? 'english' : 'khmer');
                setIsAddModalOpen(true);
              }}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ បន្ថែមថ្នាក់ថ្មី (Add Class)</span>
            </button>
          </div>

          {/* Program Tabs & Filters */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-200/80">
            {/* View Mode Segmented Tabs */}
            <div className="inline-flex p-1 bg-slate-200/70 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setActiveTab('khmer'); setCycleFilter('all'); }}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'khmer'
                    ? 'bg-white text-blue-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🇰🇭 កម្មវិធីភាសាខ្មែរ</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 font-mono">
                  {khmerClasses.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('english'); setCycleFilter('all'); }}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'english'
                    ? 'bg-white text-amber-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🇬🇧 កម្មវិធីភាសាអង់គ្លេស</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-mono">
                  {englishClasses.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('all'); setCycleFilter('all'); }}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>📋 បង្ហាញទាំងអស់</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 font-mono">
                  {classList.length}
                </span>
              </button>
            </div>

            {/* Search & Cycle Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              {availableCycles.length > 1 && (
                <div className="relative">
                  <select
                    value={cycleFilter}
                    onChange={(e) => setCycleFilter(e.target.value)}
                    className="h-8 pl-2.5 pr-7 text-xs border border-slate-300 rounded-md bg-white font-khmer text-slate-700 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="all">កម្រិតទាំងអស់ (All Cycles)</option>
                    {availableCycles.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="ស្វែងរកឈ្មោះថ្នាក់..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 pr-2.5 text-xs border border-slate-300 rounded-md bg-white font-khmer text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none w-44"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200 font-khmer text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3 font-bold text-center w-12">#</th>
                <th className="py-2.5 px-3 font-bold">ឈ្មោះថ្នាក់ / កម្រិត (Class & Grade Name)</th>
                <th className="py-2.5 px-3 font-bold w-44">កម្មវិធីសិក្សា (Program)</th>
                <th className="py-2.5 px-3 font-bold w-52">វដ្តសិក្សា (Education Cycle)</th>
                <th className="py-2.5 px-3 font-bold text-center w-36">សិស្សកំពុងរៀន (Enrolled)</th>
                <th className="py-2.5 px-3 font-bold text-center w-24">លំដាប់ (Sort)</th>
                <th className="py-2.5 px-3 font-bold text-center w-28">សកម្មភាព (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              {displayList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-khmer">
                    <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">មិនមានថ្នាក់ត្រូវនឹងការស្វែងរកឡើយ</p>
                    <p className="text-[11px] text-slate-400 mt-1">សូមសាកល្បងបញ្ចូលពាក្យគន្លឹះផ្សេង ឬចុចបន្ថែមថ្នាក់ថ្មី</p>
                  </td>
                </tr>
              ) : (
                displayList.map((item, idx) => {
                  const isKhmer = item.program === 'khmer';
                  const cycleBg = isKhmer 
                    ? item.cycle.includes('មត្តេយ្យ') 
                      ? 'bg-pink-50 text-pink-700 border-pink-200'
                      : item.cycle.includes('បឋម')
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : item.cycle.includes('អនុវិទ្យាល័យ')
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : 'bg-purple-50 text-purple-800 border-purple-200'
                    : item.cycle.includes('Early')
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : item.cycle.includes('Primary')
                    ? 'bg-sky-50 text-sky-800 border-sky-200'
                    : item.cycle.includes('Upper')
                    ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                    : 'bg-slate-100 text-slate-800 border-slate-200';

                  return (
                    <tr 
                      key={item.name} 
                      className="hover:bg-blue-50/40 transition-colors group"
                    >
                      {/* Row Index */}
                      <td className="py-2.5 px-3 text-center font-mono text-slate-400 text-[11px]">
                        {idx + 1}
                      </td>

                      {/* Class Name */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${isKhmer ? 'bg-blue-600' : 'bg-amber-500'}`} />
                          <span className="font-bold text-slate-900 font-khmer text-xs">
                            {item.name}
                          </span>
                        </div>
                      </td>

                      {/* Program Badge */}
                      <td className="py-2.5 px-3">
                        {isKhmer ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200 font-khmer">
                            <span>🇰🇭</span>
                            <span>កម្មវិធីភាសាខ្មែរ</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 font-khmer">
                            <span>🇬🇧</span>
                            <span>កម្មវិធីភាសាអង់គ្លេស</span>
                          </span>
                        )}
                      </td>

                      {/* Educational Cycle Badge */}
                      <td className="py-2.5 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold border ${cycleBg} font-khmer`}>
                          {item.cycle}
                        </span>
                      </td>

                      {/* Enrolled Students Count */}
                      <td className="py-2.5 px-3 text-center">
                        {item.studentCount > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold font-mono text-[11px]">
                            <Users className="w-3 h-3 text-emerald-600" />
                            <span>{item.studentCount} នាក់</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-khmer">
                            0 នាក់
                          </span>
                        )}
                      </td>

                      {/* Sort Order Buttons */}
                      <td className="py-2.5 px-3 text-center">
                        <div className="inline-flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            disabled={item.originalIndex === 0}
                            onClick={() => handleMove(item.originalIndex, 'up')}
                            className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Move Up (រំកិលឡើងលើ)"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={item.originalIndex === settings.gradeLevels.length - 1}
                            onClick={() => handleMove(item.originalIndex, 'down')}
                            className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Move Down (រំកិលចុះក្រោម)"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-2.5 px-3 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingGrade({ original: item.name, current: item.name })}
                            className="p-1 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                            title="កែសម្រួលឈ្មោះថ្នាក់ (Edit Class Name)"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {settings.gradeLevels.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteGrade(item.name, item.studentCount)}
                              className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                              title="លុបថ្នាក់នេះ (Delete Class)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Summary */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 font-khmer">
          <div className="flex items-center gap-4">
            <span>
              បង្ហាញ <strong className="text-slate-800">{displayList.length}</strong> ក្នុងចំណោមសរុប <strong className="text-slate-800">{settings.gradeLevels.length}</strong> ថ្នាក់
            </span>
            <span className="text-slate-300">|</span>
            <span>
              🇰🇭 ខ្មែរ: <strong className="text-blue-700">{khmerClasses.length} ថ្នាក់</strong> ({totalKhmerStudents} សិស្ស)
            </span>
            <span className="text-slate-300">|</span>
            <span>
              🇬🇧 អង់គ្លេស: <strong className="text-amber-700">{englishClasses.length} កម្រិត</strong> ({totalEnglishStudents} សិស្ស)
            </span>
          </div>

          <div className="text-[11px] text-slate-400">
            ចុចសញ្ញា ⬆ ⬇ ដើម្បីតម្រៀបលំដាប់ថ្នាក់ក្នុង Dropdown តាមការចង់បាន
          </div>
        </div>
      </div>

      {/* Add New Class Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-blue-800 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2 font-khmer">
                <GraduationCap className="w-4 h-4 text-blue-200" />
                <span>បន្ថែមថ្នាក់ & កម្រិតសិក្សាថ្មី (Register New Class / Grade)</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-blue-200 hover:text-white p-1 rounded hover:bg-blue-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddClass} className="p-5 space-y-4 text-xs">
              {/* Program Selection */}
              <div>
                <label className="block font-semibold text-slate-700 mb-2 font-khmer">
                  ជ្រើសរើសកម្មវិធីសិក្សា (Educational Program) *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setNewProgram('khmer')}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex items-center gap-2.5 ${
                      newProgram === 'khmer'
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-bold'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <span className="text-2xl">🇰🇭</span>
                    <div>
                      <div className="text-xs font-khmer">កម្មវិធីភាសាខ្មែរ</div>
                      <div className="text-[10px] text-slate-500 font-normal">Khmer General Ed</div>
                    </div>
                  </div>

                  <div
                    onClick={() => setNewProgram('english')}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex items-center gap-2.5 ${
                      newProgram === 'english'
                        ? 'border-amber-600 bg-amber-50/70 text-amber-900 font-bold'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <span className="text-2xl">🇬🇧</span>
                    <div>
                      <div className="text-xs font-khmer">កម្មវិធីភាសាអង់គ្លេស</div>
                      <div className="text-[10px] text-slate-500 font-normal">English Language (GEP)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Class Name Input */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1 font-khmer">
                  ឈ្មោះថ្នាក់ / កម្រិត (Class / Grade Name) *
                </label>
                <input
                  type="text"
                  placeholder={newProgram === 'khmer' ? "e.g. ថ្នាក់ទី ៧A ឬ K1-A" : "e.g. English Level 1 (Starter) ឬ Nursery"}
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full h-9 px-3 border border-slate-300 rounded-md font-khmer font-bold text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  required
                  autoFocus
                />
                <p className="text-[11px] text-slate-500 mt-1 font-khmer">
                  ឈ្មោះនេះនឹងបង្ហាញក្នុងបញ្ជីជ្រើសរើស (Dropdowns) គ្រប់ទម្រង់ក្នុងប្រព័ន្ធ។
                </p>
              </div>

              {/* Quick suggestions presets */}
              <div>
                <label className="block font-semibold text-slate-600 mb-1 text-[11px] font-khmer">
                  គំរូឈ្មោះពេញនិយម (Quick Suggestions):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(newProgram === 'khmer' ? [
                    'ថ្នាក់ទី ៧A', 'ថ្នាក់ទី ៧B', 'ថ្នាក់ទី ៨A', 'ថ្នាក់ទី ៩A', 'ថ្នាក់ទី ១០A', 'K1-A', 'K2-A', 'K3-A'
                  ] : [
                    'Nursery', 'Pre-K', 'English K1', 'English K2', 'English Level 13', 'GEP Level 1', 'GEP Level 2'
                  ]).map(sug => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setNewClassName(sug)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-blue-100 hover:text-blue-800 text-slate-700 text-[10px] font-medium rounded border border-slate-200 transition-colors cursor-pointer"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium cursor-pointer"
                >
                  បោះបង់ (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={!newClassName.trim()}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>រក្សាទុកថ្នាក់ថ្មី (Add Class)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Class Name Modal */}
      {editingGrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-blue-800 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2 font-khmer">
                <Edit2 className="w-4 h-4 text-blue-200" />
                <span>កែសម្រួលឈ្មោះកម្រិត/ថ្នាក់ (Edit Grade Level / Class)</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingGrade(null)}
                className="text-blue-200 hover:text-white p-1 rounded hover:bg-blue-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 font-khmer">
                  ឈ្មោះកម្រិត/ថ្នាក់ (Grade Level / Class Name) *
                </label>
                <input
                  type="text"
                  value={editingGrade.current}
                  onChange={(e) => setEditingGrade(prev => prev ? { ...prev, current: e.target.value } : null)}
                  className="w-full h-9 px-3 border border-slate-300 rounded-md font-khmer font-bold text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  required
                  autoFocus
                />
                <span className="text-[11px] text-slate-500 mt-1 block font-khmer">
                  ឈ្មោះដើម: <span className="font-semibold text-slate-700 font-mono">{editingGrade.original}</span>
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingGrade(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!editingGrade.current.trim()}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
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
