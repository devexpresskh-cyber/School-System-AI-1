import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Student, PromotionRecord } from '../../types';
import { 
  TrendingUp, 
  GraduationCap, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  FileSpreadsheet, 
  RefreshCw, 
  Award, 
  Clock, 
  Check, 
  X,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Layers,
  History
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const StudentPromoteView: React.FC = () => {
  const { 
    branchStudents, 
    settings, 
    selectedBranch, 
    promoteStudents, 
    promotions, 
    branchPromotions,
    academicRecords,
    setSelectedStudentId,
    setActiveTab,
    currentUser
  } = useSchool();

  const [activeTabMode, setActiveTabMode] = useState<'batch' | 'history'>('batch');
  const [sourceYear, setSourceYear] = useState('2025-2026');
  const [targetYear, setTargetYear] = useState('2026-2027');
  
  // Available classes
  const gradeLevels = useMemo(() => {
    return settings.gradeLevels && settings.gradeLevels.length > 0
      ? settings.gradeLevels
      : [
          'K1', 'K2', 'K3',
          'ថ្នាក់ទី ១', 'ថ្នាក់ទី ២', 'ថ្នាក់ទី ៣', 'ថ្នាក់ទី ៤', 'ថ្នាក់ទី ៥', 'ថ្នាក់ទី ៦',
          'ថ្នាក់ទី ៧', 'ថ្នាក់ទី ៨', 'ថ្នាក់ទី ៩', 'ថ្នាក់ទី ១០', 'ថ្នាក់ទី ១១', 'ថ្នាក់ទី ១២'
        ];
  }, [settings.gradeLevels]);

  const [sourceClass, setSourceClass] = useState<string>(gradeLevels[6] || gradeLevels[0] || 'ថ្នាក់ទី ៧');
  
  // Compute smart target class based on sourceClass index
  const defaultTargetClass = useMemo(() => {
    const idx = gradeLevels.findIndex(g => g.trim().toLowerCase() === sourceClass.trim().toLowerCase());
    if (idx !== -1 && idx < gradeLevels.length - 1) {
      return gradeLevels[idx + 1];
    }
    return 'បញ្ចប់ការសិក្សា (Graduated)';
  }, [sourceClass, gradeLevels]);

  const [targetClass, setTargetClass] = useState<string>(defaultTargetClass);

  // Update targetClass when sourceClass changes
  React.useEffect(() => {
    setTargetClass(defaultTargetClass);
  }, [defaultTargetClass]);

  const [search, setSearch] = useState('');
  const [promotionNotes, setPromotionNotes] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Get students matching source class and branch
  const classStudents = useMemo(() => {
    return branchStudents.filter(s => {
      const matchClass = s.classGrade.trim().toLowerCase() === sourceClass.trim().toLowerCase();
      const matchYear = !s.academicYear || s.academicYear === sourceYear;
      return matchClass && s.status !== 'suspended';
    });
  }, [branchStudents, sourceClass, sourceYear]);

  // Individual student targets state: Map<studentId, { targetClass: string, status: 'active' | 'graduated' | 'suspended' }>
  const [studentTargets, setStudentTargets] = useState<{ [id: string]: { targetClass: string; status: 'active' | 'graduated' } }>({});
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Reset targets and selection when class changes
  React.useEffect(() => {
    const initialTargets: { [id: string]: { targetClass: string; status: 'active' | 'graduated' } } = {};
    const allIds: string[] = [];

    classStudents.forEach(s => {
      allIds.push(s.id);
      const isGraduating = defaultTargetClass === 'បញ្ចប់ការសិក្សា (Graduated)';
      initialTargets[s.id] = {
        targetClass: isGraduating ? s.classGrade : defaultTargetClass,
        status: isGraduating ? 'graduated' : 'active'
      };
    });

    setStudentTargets(initialTargets);
    setSelectedStudentIds(allIds);
  }, [classStudents, defaultTargetClass]);

  // Filtered by search
  const displayedStudents = useMemo(() => {
    if (!search.trim()) return classStudents;
    const q = search.toLowerCase();
    return classStudents.filter(s => 
      s.studentCode.toLowerCase().includes(q) ||
      s.nameKhmer.toLowerCase().includes(q) ||
      s.nameEnglish.toLowerCase().includes(q)
    );
  }, [classStudents, search]);

  // Academic score helper for each student
  const getStudentAcademicInfo = (studentId: string, studentCode: string) => {
    const record = academicRecords.find(a => a.studentId === studentId || a.studentCode === studentCode);
    if (!record) return null;
    return {
      average: record.average,
      gpa: record.gpa,
      rank: record.rank,
      total: record.totalStudentsInClass,
      passed: record.average >= 50
    };
  };

  // Toggle selection
  const handleToggleSelect = (id: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedStudentIds(displayedStudents.map(s => s.id));
  };

  const handleDeselectAll = () => {
    setSelectedStudentIds([]);
  };

  // Bulk set target for selected students
  const handleApplyBulkTarget = (newClass: string, status: 'active' | 'graduated' = 'active') => {
    setStudentTargets(prev => {
      const next = { ...prev };
      selectedStudentIds.forEach(id => {
        next[id] = { targetClass: newClass, status };
      });
      return next;
    });
  };

  // Change individual student target
  const handleSetIndividualTarget = (studentId: string, newClass: string, status: 'active' | 'graduated' = 'active') => {
    setStudentTargets(prev => ({
      ...prev,
      [studentId]: { targetClass: newClass, status }
    }));
  };

  // Calculation stats for promotion preview
  const previewStats = useMemo(() => {
    let promoted = 0;
    let retained = 0;
    let graduated = 0;

    selectedStudentIds.forEach(id => {
      const target = studentTargets[id];
      if (!target) return;
      if (target.status === 'graduated') {
        graduated++;
      } else if (target.targetClass === sourceClass) {
        retained++;
      } else {
        promoted++;
      }
    });

    return { promoted, retained, graduated, total: selectedStudentIds.length };
  }, [selectedStudentIds, studentTargets, sourceClass]);

  // Execute promotion
  const handleExecutePromotion = () => {
    if (selectedStudentIds.length === 0) return;

    const payload = selectedStudentIds.map(id => {
      const target = studentTargets[id];
      return {
        studentId: id,
        targetClass: target?.targetClass || targetClass,
        status: target?.status || 'active'
      };
    });

    const res = promoteStudents({
      studentPromotions: payload,
      sourceClass,
      targetClass,
      sourceYear,
      targetYear,
      notes: promotionNotes.trim() || `ឡើងថ្នាក់ប្រចាំឆ្នាំពី ${sourceClass} ទៅ ${targetClass}`
    });

    setIsConfirmModalOpen(false);
    setPromotionNotes('');
    setSuccessToast(`ជោគជ័យ! បានឡើងថ្នាក់សិស្សចំនួន ${res.count} នាក់ ទៅកាន់ ${targetClass} (ឆ្នាំសិក្សា ${targetYear})`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Export promotion list to Excel
  const handleExportPromotionExcel = () => {
    const data = displayedStudents.map((s, idx) => {
      const target = studentTargets[s.id];
      const acad = getStudentAcademicInfo(s.id, s.studentCode);
      const isSelected = selectedStudentIds.includes(s.id);

      return {
        'ល.រ': idx + 1,
        'អត្តលេខសិស្ស': s.studentCode,
        'ឈ្មោះជាភាសាខ្មែរ': s.nameKhmer,
        'ឈ្មោះជាភាសាឡាតាំង': s.nameEnglish,
        'ភេទ': s.gender === 'Female' ? 'ស្រី' : 'ប្រុស',
        'ថ្នាក់បច្ចុប្បន្ន': s.classGrade,
        'ឆ្នាំសិក្សាចាស់': sourceYear,
        'មធ្យមភាគពិន្ទុ': acad ? acad.average.toFixed(1) : '-',
        'ចំណាត់ថ្នាក់': acad ? `${acad.rank}/${acad.total}` : '-',
        'ស្ថានភាពឡើងថ្នាក់': isSelected ? (target?.status === 'graduated' ? 'បញ្ចប់ការសិក្សា' : target?.targetClass === sourceClass ? 'ត្រួតថ្នាក់' : 'ឡើងថ្នាក់') : 'មិនទាន់អនុវត្ត',
        'ថ្នាក់ថ្មី': target?.targetClass || targetClass,
        'ឆ្នាំសិក្សាថ្មី': targetYear
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Promotion List');
    XLSX.writeFile(workbook, `FBIS_Promotion_${sourceClass}_to_${targetClass}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-bold font-khmer text-slate-900">
                  ការឡើងថ្នាក់សិស្ស (Student Promotion & Advancement)
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                  {selectedBranch.code}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-khmer">
                ផ្ទេរនិងតម្លើងកម្រិតថ្នាក់សិស្សពីឆ្នាំសិក្សាចាស់ទៅឆ្នាំសិក្សាថ្មីដោយស្វ័យប្រវត្តិ (Batch Promotion per Class)
              </p>
            </div>
          </div>

          {/* Tab Switcher & Export */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTabMode('batch')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTabMode === 'batch'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>ឡើងថ្នាក់ជាថ្នាក់ (Batch Promote)</span>
            </button>

            <button
              onClick={() => setActiveTabMode('history')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTabMode === 'history'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <History className="w-4 h-4" />
              <span>ប្រវត្តិឡើងថ្នាក់ ({branchPromotions.length})</span>
            </button>

            <button
              onClick={handleExportPromotionExcel}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="នាំចេញបញ្ជីឡើងថ្នាក់ជា Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-500 text-white text-xs font-bold flex items-center justify-between shadow-md animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-100" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="p-1 hover:bg-emerald-600 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: BATCH CLASS PROMOTION                                              */}
      {/* ========================================================================= */}
      {activeTabMode === 'batch' && (
        <div className="space-y-4">
          {/* Promotion Configuration Controls */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>ជំហានកំណត់ប្រព័ន្ធឡើងថ្នាក់ (Promotion Setup & Target Parameters)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Source Academic Year */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <label className="block font-semibold text-slate-700 font-khmer">
                  ១. ឆ្នាំសិក្សាចាស់ (Source Year):
                </label>
                <select
                  value={sourceYear}
                  onChange={(e) => setSourceYear(e.target.value)}
                  className="w-full h-9 px-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-blue-500"
                >
                  <option value="2025-2026">២០២៥-២០២៦ (2025-2026)</option>
                  <option value="2024-2025">២០២៤-២០២៥ (2024-2025)</option>
                  <option value="2023-2024">២០២៣-២០២៤ (2023-2024)</option>
                </select>
              </div>

              {/* Source Class */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <label className="block font-semibold text-slate-700 font-khmer">
                  ២. ថ្នាក់ដើមបច្ចុប្បន្ន (Source Class):
                </label>
                <select
                  value={sourceClass}
                  onChange={(e) => setSourceClass(e.target.value)}
                  className="w-full h-9 px-2.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-blue-700 focus:ring-1 focus:ring-blue-500"
                >
                  {gradeLevels.map(gl => (
                    <option key={gl} value={gl}>{gl}</option>
                  ))}
                </select>
              </div>

              {/* Target Academic Year */}
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 space-y-1">
                <label className="block font-semibold text-blue-900 font-khmer flex items-center justify-between">
                  <span>៣. ឆ្នាំសិក្សាថ្មី (Target Year):</span>
                  <span className="text-[10px] text-blue-600 bg-blue-100 px-1.5 py-0.2 rounded font-bold">New Year</span>
                </label>
                <select
                  value={targetYear}
                  onChange={(e) => setTargetYear(e.target.value)}
                  className="w-full h-9 px-2.5 bg-white border border-blue-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-blue-500"
                >
                  <option value="2026-2027">២០២៦-២០២៧ (2026-2027)</option>
                  <option value="2027-2028">២០២៧-២០២៨ (2027-2028)</option>
                  <option value="2025-2026">២០២៥-២០២៦ (2025-2026)</option>
                </select>
              </div>

              {/* Target Class */}
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 space-y-1">
                <label className="block font-semibold text-blue-900 font-khmer flex items-center justify-between">
                  <span>៤. ថ្នាក់គោលដៅ (Target Class):</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-bold">Auto-Next</span>
                </label>
                <select
                  value={targetClass}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTargetClass(val);
                    handleApplyBulkTarget(val, val === 'បញ្ចប់ការសិក្សា (Graduated)' ? 'graduated' : 'active');
                  }}
                  className="w-full h-9 px-2.5 bg-white border border-blue-300 rounded-lg text-xs font-bold text-emerald-700 focus:ring-1 focus:ring-blue-500"
                >
                  {gradeLevels.map(gl => (
                    <option key={gl} value={gl}>{gl}</option>
                  ))}
                  <option value="បញ្ចប់ការសិក្សា (Graduated)">បញ្ចប់ការសិក្សា (Graduated / Alumni)</option>
                </select>
              </div>
            </div>

            {/* Quick Bulk Action Helpers */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-600 font-khmer">សកម្មភាពរហ័សសម្រាប់សិស្សបានជ្រើស:</span>
                <button
                  type="button"
                  onClick={() => handleApplyBulkTarget(targetClass, targetClass === 'បញ្ចប់ការសិក្សា (Graduated)' ? 'graduated' : 'active')}
                  className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md font-semibold text-[11px] cursor-pointer transition-colors"
                >
                  ឡើងទៅ {targetClass}
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyBulkTarget(sourceClass, 'active')}
                  className="px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-md font-semibold text-[11px] cursor-pointer transition-colors"
                >
                  ត្រួតថ្នាក់ដដែល ({sourceClass})
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyBulkTarget(sourceClass, 'graduated')}
                  className="px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-md font-semibold text-[11px] cursor-pointer transition-colors"
                >
                  បញ្ចប់ការសិក្សា (Graduate)
                </button>
              </div>

              {/* Search in Class */}
              <div className="relative min-w-[220px]">
                <input
                  type="text"
                  placeholder="ស្វែងរកតាមឈ្មោះ ឬអត្តលេខ..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 bg-white"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          {/* Promotion Preview Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-slate-500 block text-[11px] font-khmer">សិស្សសរុបក្នុងថ្នាក់</span>
              <div className="text-lg font-bold text-slate-900 mt-0.5">{classStudents.length} នាក់</div>
            </div>

            <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 shadow-2xs">
              <span className="text-emerald-700 block text-[11px] font-khmer">បានជ្រើសឡើងថ្នាក់ (Promote)</span>
              <div className="text-lg font-bold text-emerald-800 mt-0.5">{previewStats.promoted} នាក់</div>
            </div>

            <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 shadow-2xs">
              <span className="text-amber-700 block text-[11px] font-khmer">ត្រួតថ្នាក់ដដែល (Retain)</span>
              <div className="text-lg font-bold text-amber-800 mt-0.5">{previewStats.retained} នាក់</div>
            </div>

            <div className="bg-purple-50 p-3.5 rounded-xl border border-purple-200 shadow-2xs">
              <span className="text-purple-700 block text-[11px] font-khmer">បញ្ចប់ការសិក្សា (Graduated)</span>
              <div className="text-lg font-bold text-purple-800 mt-0.5">{previewStats.graduated} នាក់</div>
            </div>
          </div>

          {/* Student Advancement Table */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={displayedStudents.length > 0 && selectedStudentIds.length === displayedStudents.length}
                    onChange={(e) => e.target.checked ? handleSelectAll() : handleDeselectAll()}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                  <span>ជ្រើសរើសទាំងអស់ ({selectedStudentIds.length}/{displayedStudents.length})</span>
                </label>
              </div>

              {/* Execution Action Button */}
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(true)}
                disabled={selectedStudentIds.length === 0}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <TrendingUp className="w-4 h-4" />
                <span>អនុវត្តការឡើងថ្នាក់ ({selectedStudentIds.length} នាក់)</span>
              </button>
            </div>

            {displayedStudents.length === 0 ? (
              <div className="p-12 text-center text-slate-500 font-khmer text-xs">
                មិនមានសិស្សក្នុងថ្នាក់ "{sourceClass}" សម្រាប់ឆ្នាំសិក្សា {sourceYear} ឡើយ។
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-semibold font-khmer border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">
                        <span className="sr-only">Select</span>
                      </th>
                      <th className="py-2.5 px-3">ល.រ</th>
                      <th className="py-2.5 px-3">អត្តលេខ</th>
                      <th className="py-2.5 px-4">ឈ្មោះសិស្ស (ខ្មែរ / English)</th>
                      <th className="py-2.5 px-3 text-center">ភេទ</th>
                      <th className="py-2.5 px-3">ថ្នាក់បច្ចុប្បន្ន</th>
                      <th className="py-2.5 px-3">លទ្ធផលសិក្សា (GPA / Rank)</th>
                      <th className="py-2.5 px-3 text-center">ស្ថានភាព</th>
                      <th className="py-2.5 px-4">ថ្នាក់គោលដៅឡើងបន្ទាប់ (Target Class)</th>
                      <th className="py-2.5 px-3 text-center">ព័ត៌មាន</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedStudents.map((s, idx) => {
                      const isSelected = selectedStudentIds.includes(s.id);
                      const target = studentTargets[s.id] || { targetClass, status: 'active' };
                      const acad = getStudentAcademicInfo(s.id, s.studentCode);
                      const isRetained = target.targetClass === sourceClass && target.status !== 'graduated';
                      const isGraduated = target.status === 'graduated';

                      return (
                        <tr 
                          key={s.id} 
                          className={`hover:bg-blue-50/40 transition-colors ${
                            isSelected ? 'bg-blue-50/20' : 'opacity-70'
                          }`}
                        >
                          <td className="py-2 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelect(s.id)}
                              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                            />
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-500">{idx + 1}</td>
                          <td className="py-2 px-3 font-mono font-bold text-blue-700">
                            {s.studentCode}
                          </td>
                          <td className="py-2 px-4">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={s.avatar}
                                alt={s.nameEnglish}
                                className="w-8 h-8 rounded-full object-cover border border-slate-200"
                              />
                              <div>
                                <div className="font-khmer font-bold text-slate-900 leading-tight">
                                  {s.nameKhmer}
                                </div>
                                <div className="text-[11px] text-slate-500 font-sans">
                                  {s.nameEnglish}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-2 px-3 text-center font-khmer text-slate-700">
                            {s.gender === 'Female' ? 'ស្រី' : 'ប្រុស'}
                          </td>
                          <td className="py-2 px-3 font-semibold text-slate-800">
                            {s.classGrade}
                          </td>
                          <td className="py-2 px-3">
                            {acad ? (
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  acad.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  Avg: {acad.average.toFixed(1)}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  ចំណាត់ថ្នាក់: {acad.rank}/{acad.total}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-khmer">មិនទាន់មានពិន្ទុ</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {isGraduated ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                                បញ្ចប់ការសិក្សា
                              </span>
                            ) : isRetained ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                                ត្រួតថ្នាក់
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                                ឡើងថ្នាក់
                              </span>
                            )}
                          </td>

                          {/* Individual Target Selector */}
                          <td className="py-2 px-4">
                            <div className="flex items-center gap-1.5">
                              <select
                                value={target.status === 'graduated' ? 'GRADUATED' : target.targetClass}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === 'GRADUATED') {
                                    handleSetIndividualTarget(s.id, s.classGrade, 'graduated');
                                  } else {
                                    handleSetIndividualTarget(s.id, val, 'active');
                                  }
                                }}
                                className="h-8 px-2 bg-white border border-slate-300 rounded-md text-xs font-semibold focus:ring-1 focus:ring-blue-500 min-w-[150px]"
                              >
                                {gradeLevels.map(gl => (
                                  <option key={gl} value={gl}>
                                    {gl} {gl === sourceClass ? '(ត្រួតថ្នាក់ដដែល)' : ''}
                                  </option>
                                ))}
                                <option value="GRADUATED">បញ្ចប់ការសិក្សា (Graduated)</option>
                              </select>
                            </div>
                          </td>

                          {/* View Profile */}
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedStudentId(s.id);
                                setActiveTab('student-profile');
                              }}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold cursor-pointer transition-colors"
                            >
                              Profile
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PROMOTION HISTORY & AUDIT LOG                                      */}
      {/* ========================================================================= */}
      {activeTabMode === 'history' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 font-khmer flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              <span>ប្រវត្តិការឡើងថ្នាក់សិស្ស (Promotion Batch Audit History)</span>
            </h2>
            <span className="text-xs text-slate-500 font-sans">
              សរុប {branchPromotions.length} លើក
            </span>
          </div>

          {branchPromotions.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-khmer text-xs">
              មិនទាន់មានប្រវត្តិនៃការឡើងថ្នាក់នៅឡើយទេ។
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-semibold font-khmer border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">កាលបរិច្ឆេទ & ម៉ោង</th>
                    <th className="py-2.5 px-3">ថ្នាក់ដើម</th>
                    <th className="py-2.5 px-3">ថ្នាក់ថ្មីគោលដៅ</th>
                    <th className="py-2.5 px-3">ឆ្នាំសិក្សា</th>
                    <th className="py-2.5 px-3 text-center">ឡើងថ្នាក់</th>
                    <th className="py-2.5 px-3 text-center">ត្រួតថ្នាក់</th>
                    <th className="py-2.5 px-3 text-center">បញ្ចប់ការសិក្សា</th>
                    <th className="py-2.5 px-3">អនុវត្តដោយ</th>
                    <th className="py-2.5 px-4">កំណត់សម្គាល់</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {branchPromotions.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                        {new Date(p.date).toLocaleString('km-KH', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">
                        {p.sourceClass}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-emerald-700">
                        {p.targetClass}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {p.sourceAcademicYear} → {p.targetAcademicYear}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                          {p.promotedCount} នាក់
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
                          {p.retainedCount} នាក់
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-[11px]">
                          {p.graduatedCount} នាក់
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-700">
                        {p.performedBy}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 font-khmer text-[11px]">
                        {p.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-khmer">
                    បញ្ជាក់ការឡើងថ្នាក់សិស្ស (Confirm Student Promotion)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-khmer leading-relaxed">
                    តើលោកអ្នកពិតជាចង់អនុវត្តការឡើងថ្នាក់សិស្សចំនួន <b>{selectedStudentIds.length} នាក់</b> ពីថ្នាក់ <b>{sourceClass}</b> ទៅ <b>{targetClass}</b> សម្រាប់ឆ្នាំសិក្សា <b>{targetYear}</b> មែនទេ?
                  </p>
                </div>
              </div>

              {/* Breakdown Summary */}
              <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between font-khmer">
                  <span className="text-slate-600">ឡើងទៅថ្នាក់ថ្មី ({targetClass}):</span>
                  <span className="font-bold text-emerald-700">{previewStats.promoted} នាក់</span>
                </div>
                <div className="flex items-center justify-between font-khmer">
                  <span className="text-slate-600">ត្រួតថ្នាក់ដដែល ({sourceClass}):</span>
                  <span className="font-bold text-amber-700">{previewStats.retained} នាក់</span>
                </div>
                <div className="flex items-center justify-between font-khmer">
                  <span className="text-slate-600">បញ្ចប់ការសិក្សា:</span>
                  <span className="font-bold text-purple-700">{previewStats.graduated} នាក់</span>
                </div>
              </div>

              {/* Note input */}
              <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1 font-khmer">
                  កំណត់សម្គាល់បន្ថែម (Optional Note):
                </label>
                <input
                  type="text"
                  value={promotionNotes}
                  onChange={(e) => setPromotionNotes(e.target.value)}
                  placeholder="ឧទាហរណ៍: ការឡើងថ្នាក់ប្រចាំឆ្នាំសិក្សា ២០២៦-២០២៧..."
                  className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Actions */}
              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                >
                  បោះបង់ (Cancel)
                </button>
                <button
                  type="button"
                  onClick={handleExecutePromotion}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>យល់ព្រមអនុវត្ត (Proceed)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
