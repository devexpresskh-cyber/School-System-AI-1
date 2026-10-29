import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Student } from '../../types';
import * as XLSX from 'xlsx';
import { 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Columns, 
  ArrowUpDown, 
  DollarSign, 
  Users, 
  GraduationCap, 
  CreditCard, 
  AlertTriangle,
  RotateCcw,
  CheckSquare,
  Square,
  ChevronRight
} from 'lucide-react';
import { AddPaymentModal } from '../finance/AddPaymentModal';

interface AllFieldsStudentDirectoryProps {
  onOpenProfile?: (studentId: string) => void;
}

export const AllFieldsStudentDirectory: React.FC<AllFieldsStudentDirectoryProps> = ({
  onOpenProfile
}) => {
  const { 
    branchStudents, 
    settings, 
    selectedBranch, 
    setSelectedStudentId, 
    setActiveTab 
  } = useSchool();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedCurriculum, setSelectedCurriculum] = useState<'all' | 'khmer' | 'english'>('all');
  const [selectedGender, setSelectedGender] = useState<'all' | 'Female' | 'Male'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  const [onlyWithDebt, setOnlyWithDebt] = useState(false);

  // Column Visibility Controls
  const [isColumnPickerOpen, setIsColumnPickerOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    code: true,
    roll: true,
    nameKhmer: true,
    nameEnglish: true,
    gender: true,
    classGrade: true,
    curriculum: true,
    birthday: true,
    pob: true,
    parentName: true,
    guardianPhone: true,
    address: true,
    father: true,
    mother: true,
    tuitionFee: true,
    discount: true,
    netTuition: true,
    pastDue: true,
    prevSchool: false,
    referral: false,
    regDate: true,
    status: true,
  });

  // Target student for quick payment modal
  const [targetStudentForPayment, setTargetStudentForPayment] = useState<Student | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState<keyof Student | 'netTuition'>('roll');
  const [sortAsc, setSortAsc] = useState(true);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return branchStudents.filter(s => {
      const sTerm = searchTerm.trim().toLowerCase();
      let matchSearch = true;
      if (sTerm) {
        const kName = String(s.nameKhmer || '').toLowerCase();
        const eName = String(s.nameEnglish || '').toLowerCase();
        const code = String(s.studentCode || '').toLowerCase();
        const roll = String(s.roll || '').toLowerCase();
        const pName = String(s.parentName || '').toLowerCase();
        const gPhone = String(s.guardianPhone || '').toLowerCase();
        const phone = String(s.phone || '').toLowerCase();
        const addr = String(s.address || '').toLowerCase();

        matchSearch = kName.includes(sTerm) ||
          eName.includes(sTerm) ||
          code.includes(sTerm) ||
          roll.includes(sTerm) ||
          pName.includes(sTerm) ||
          gPhone.includes(sTerm) ||
          phone.includes(sTerm) ||
          addr.includes(sTerm);
      }

      const matchGrade = !selectedGrade || s.classGrade === selectedGrade;
      const matchCurriculum = selectedCurriculum === 'all' || s.curriculum === selectedCurriculum;
      const matchGender = selectedGender === 'all' || s.gender === selectedGender;
      const matchStatus = selectedStatus === 'all' || s.status === selectedStatus;
      const matchDebt = !onlyWithDebt || ((s.pastYearDue || 0) > 0);

      return matchSearch && matchGrade && matchCurriculum && matchGender && matchStatus && matchDebt;
    }).sort((a, b) => {
      let valA: any = a[sortField as keyof Student];
      let valB: any = b[sortField as keyof Student];

      if (sortField === 'netTuition') {
        valA = (a.tuitionFee || 980) * (1 - (a.discountPercentage || 0) / 100);
        valB = (b.tuitionFee || 980) * (1 - (b.discountPercentage || 0) / 100);
      }

      if (valA === undefined) return 1;
      if (valB === undefined) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc 
        ? String(valA).localeCompare(String(valB), 'km')
        : String(valB).localeCompare(String(valA), 'km');
    });
  }, [branchStudents, searchTerm, selectedGrade, selectedCurriculum, selectedGender, selectedStatus, onlyWithDebt, sortField, sortAsc]);

  // Total Summary Metrics
  const summaryMetrics = useMemo(() => {
    const totalCount = filteredStudents.length;
    const femaleCount = filteredStudents.filter(s => s.gender === 'Female').length;
    const totalTuition = filteredStudents.reduce((sum, s) => sum + (s.tuitionFee || 980), 0);
    const totalDebt = filteredStudents.reduce((sum, s) => sum + (s.pastYearDue || 0), 0);
    return { totalCount, femaleCount, totalTuition, totalDebt };
  }, [filteredStudents]);

  // Export ALL Fields into clean Excel spreadsheet
  const handleExportAllFieldsXLS = () => {
    const allFieldRows = filteredStudents.map((s, idx) => {
      const tuition = s.tuitionFee || 980;
      const discount = s.discountPercentage || 0;
      const netTuition = Math.max(0, Number((tuition * (1 - discount / 100)).toFixed(2)));

      return {
        '#': idx + 1,
        'អត្តលេខសិស្ស (Student Code)': s.studentCode || `FBIS02-00${s.roll}`,
        'លេខរៀង (Roll)': s.roll,
        'ឈ្មោះជាភាសាខ្មែរ (Khmer Name)': s.nameKhmer,
        'ឈ្មោះជាអក្សរឡាតាំង (Latin Name)': s.nameEnglish,
        'ភេទ (Gender)': s.gender === 'Female' ? 'ស្រី (Female)' : 'ប្រុស (Male)',
        'កម្រិតថ្នាក់ (Class / Grade)': s.classGrade,
        'កម្មវិធីសិក្សា (Curriculum)': s.curriculum === 'english' ? 'English Program' : 'Khmer Program',
        'ថ្ងៃខែឆ្នាំកំណើត (DOB)': s.birthday || '—',
        'ទីកន្លែងកំណើត (POB)': s.address ? s.address.split(',')[0] : 'សៀមរាប',
        'សញ្ជាតិ (Nationality)': 'ខ្មែរ',
        'លេខទូរស័ព្ទសិស្ស (Student Phone)': s.phone || '—',
        'ឈ្មោះអាណាព្យាបាល (Guardian / Parent)': s.parentName || '—',
        'លេខទូរស័ព្ទអាណាព្យាបាល (Guardian Phone)': s.guardianPhone || s.phone || '—',
        'អាសយដ្ឋានបច្ចុប្បន្ន (Current Address)': s.address || 'ក្រុងសៀមរាប ខេត្តសៀមរាប',
        'ឈ្មោះឪពុក (Father Name)': s.parentName?.includes('ឪពុក') ? s.parentName : (s.parentName || '—'),
        'មុខរបរឪពុក (Father Occupation)': 'អាជីវករ',
        'ឈ្មោះម្តាយ (Mother Name)': s.parentName?.includes('ម្តាយ') ? s.parentName : '—',
        'មុខរបរម្តាយ (Mother Occupation)': 'មេផ្ទះ / អាជីវករ',
        'ថ្លៃសិក្សាគោល (Base Tuition USD)': tuition,
        'បញ្ចុះតម្លៃ % (Discount %)': discount,
        'ថ្លៃត្រូវបង់សុទ្ធ (Net Tuition USD)': netTuition,
        'បំណុលឆ្នាំចាស់ (Past Year Debt USD)': s.pastYearDue || 0,
        'សាលាចាស់ (Previous School)': 'សាលារៀនចំណេះទូទៅ',
        'អ្នកណែនាំ / Sponsor': 'ឪពុកម្តាយ',
        'ថ្ងៃចុះឈ្មោះ (Enrollment Date)': s.registrationDate || '2025-10-01',
        'សាខាសាលា (Campus)': selectedBranch.nameEnglish,
        'ស្ថានភាព (Status)': s.status === 'active' ? 'Active' : s.status
      };
    });

    const ws = XLSX.utils.json_to_sheet(allFieldRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'All Students Master List');
    XLSX.writeFile(wb, `FBIS_All_Fields_Student_List_${selectedBranch.code}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const toggleSort = (field: keyof Student | 'netTuition') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleOpenRowStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    if (onOpenProfile) {
      onOpenProfile(studentId);
    } else {
      setActiveTab('student-profile');
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* Top Banner Card */}
      <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600 text-white rounded-lg">
                <Users className="w-5 h-5" />
              </div>
              <h1 className="text-base font-bold text-slate-800 flex items-center gap-2 font-khmer">
                <span>បញ្ជីសិស្សលម្អិតគ្រប់ទិន្នន័យ & នាំចេញ Excel (All-Field Student Directory & Export)</span>
                <span className="bg-blue-100 text-blue-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                  {filteredStudents.length} Students
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-khmer mt-1">
              មើល និងនាំចេញទិន្នន័យគ្រប់ជ្រុងជ្រោយ (អត្តលេខ, ឈ្មោះខ្មែរ/ឡាតាំង, ថ្នាក់, ថ្ងៃកំណើត, អាណាព្យាបាល, លេខទូរស័ព្ទ, អាសយដ្ឋាន, ថ្លៃសិក្សា, បញ្ចុះតម្លៃ, បំណុលចាស់) សម្រាប់សាខា {selectedBranch.nameEnglish}។
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Column Picker Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsColumnPickerOpen(!isColumnPickerOpen)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
              >
                <Columns className="w-4 h-4 text-slate-600" />
                <span>Columns (បង្ហាញ/លាក់ជួរ)</span>
              </button>

              {isColumnPickerOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-30 text-xs space-y-2">
                  <div className="font-bold text-slate-800 border-b border-slate-100 pb-1.5 flex justify-between items-center">
                    <span>ជ្រើសរើសជួរឈរ (Columns)</span>
                    <button 
                      onClick={() => setIsColumnPickerOpen(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 font-khmer text-slate-700">
                    {Object.entries({
                      code: 'អត្តលេខ (Code)',
                      roll: 'លេខរៀង (Roll)',
                      nameKhmer: 'ឈ្មោះខ្មែរ (Khmer Name)',
                      nameEnglish: 'ឈ្មោះឡាតាំង (Latin Name)',
                      gender: 'ភេទ (Gender)',
                      classGrade: 'ថ្នាក់ (Class / Grade)',
                      curriculum: 'កម្មវិធីសិក្សា (Program)',
                      birthday: 'ថ្ងៃខែឆ្នាំកំណើត (DOB)',
                      pob: 'ទីកន្លែងកំណើត (POB)',
                      parentName: 'ឈ្មោះអាណាព្យាបាល (Guardian)',
                      guardianPhone: 'លេខទូរស័ព្ទ (Phone)',
                      address: 'អាសយដ្ឋាន (Address)',
                      tuitionFee: 'ថ្លៃសិក្សាគោល (Tuition)',
                      discount: 'បញ្ចុះតម្លៃ % (Discount)',
                      netTuition: 'ថ្លៃត្រូវបង់សុទ្ធ (Net Tuition)',
                      pastDue: 'បំណុលឆ្នាំចាស់ (Past Debt)',
                      regDate: 'ថ្ងៃចុះឈ្មោះ (Reg Date)',
                      status: 'ស្ថានភាព (Status)'
                    }).map(([key, label]) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={visibleColumns[key] ?? true}
                          onChange={(e) => setVisibleColumns({ ...visibleColumns, [key]: e.target.checked })}
                          className="rounded text-blue-600"
                        />
                        <span className="text-[11px]">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Export All Fields Button */}
            <button
              onClick={handleExportAllFieldsXLS}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Export all selected and filtered fields to formatted Excel file (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export All Fields (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Summary Metric Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200">
            <div className="text-[11px] text-slate-500 font-khmer">សិស្សសរុប (Total Students)</div>
            <div className="text-base font-black text-slate-800 font-mono">
              {summaryMetrics.totalCount} <span className="text-xs font-normal text-slate-500">នាក់</span>
            </div>
          </div>

          <div className="bg-rose-50/60 rounded-lg p-2.5 border border-rose-200">
            <div className="text-[11px] text-rose-700 font-khmer">សិស្សស្រី (Female)</div>
            <div className="text-base font-black text-rose-800 font-mono">
              {summaryMetrics.femaleCount} <span className="text-xs font-normal text-rose-500">នាក់ ({Math.round(summaryMetrics.femaleCount / (summaryMetrics.totalCount || 1) * 100)}%)</span>
            </div>
          </div>

          <div className="bg-blue-50/60 rounded-lg p-2.5 border border-blue-200">
            <div className="text-[11px] text-blue-700 font-khmer">ថ្លៃសិក្សាគោលសរុប (Base Tuition)</div>
            <div className="text-base font-black text-blue-900 font-mono">
              ${summaryMetrics.totalTuition.toLocaleString()}
            </div>
          </div>

          <div className="bg-amber-50/60 rounded-lg p-2.5 border border-amber-200">
            <div className="text-[11px] text-amber-800 font-khmer">បំណុលឆ្នាំចាស់សរុប (Total Past Arrears)</div>
            <div className="text-base font-black text-amber-900 font-mono">
              ${summaryMetrics.totalDebt.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Code, Name, Roll, Phone, Parent..."
              className="w-full h-8 pl-8 pr-3 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Grade Level Filter */}
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="h-8 px-2.5 text-xs border border-slate-300 rounded-lg bg-white font-khmer"
          >
            <option value="">គ្រប់ថ្នាក់ (All Grades)</option>
            {settings.gradeLevels.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          {/* Curriculum Filter */}
          <select
            value={selectedCurriculum}
            onChange={(e) => setSelectedCurriculum(e.target.value as any)}
            className="h-8 px-2.5 text-xs border border-slate-300 rounded-lg bg-white font-khmer"
          >
            <option value="all">គ្រប់កម្មវិធី (All Programs)</option>
            <option value="khmer">ចំណេះទូទៅ (Khmer)</option>
            <option value="english">អង់គ្លេស (English)</option>
          </select>

          {/* Gender Filter */}
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value as any)}
            className="h-8 px-2.5 text-xs border border-slate-300 rounded-lg bg-white font-khmer"
          >
            <option value="all">គ្រប់ភេទ (All Genders)</option>
            <option value="Female">ស្រី (Female)</option>
            <option value="Male">ប្រុស (Male)</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="h-8 px-2.5 text-xs border border-slate-300 rounded-lg bg-white font-khmer"
          >
            <option value="all">គ្រប់ស្ថានភាព (All Status)</option>
            <option value="active">Active (កំពុងរៀន)</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended (ព្យួរ)</option>
          </select>

          {/* Debt toggle checkbox */}
          <label className="flex items-center gap-1.5 cursor-pointer bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700">
            <input
              type="checkbox"
              checked={onlyWithDebt}
              onChange={(e) => setOnlyWithDebt(e.target.checked)}
              className="rounded text-amber-600"
            />
            <span className="text-[11px] font-khmer">មានបំណុលចាស់ (Has Past Due)</span>
          </label>
        </div>

        {(searchTerm || selectedGrade || selectedCurriculum !== 'all' || selectedGender !== 'all' || selectedStatus !== 'all' || onlyWithDebt) && (
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedGrade('');
              setSelectedCurriculum('all');
              setSelectedGender('all');
              setSelectedStatus('all');
              setOnlyWithDebt(false);
            }}
            className="text-slate-500 hover:text-rose-600 text-xs flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filter</span>
          </button>
        )}
      </div>

      {/* Main Full-Width Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden w-full">
        <div className="overflow-x-auto max-h-[600px] w-full">
          <table className="w-full text-xs text-left whitespace-nowrap border-collapse">
            <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200 sticky top-0 z-10 shadow-2xs">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center bg-slate-100">#</th>
                
                {visibleColumns.code && (
                  <th 
                    onClick={() => toggleSort('studentCode')}
                    className="py-2.5 px-3 cursor-pointer hover:bg-slate-200 bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>អត្តលេខ (Code)</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                )}

                {visibleColumns.roll && (
                  <th 
                    onClick={() => toggleSort('roll')}
                    className="py-2.5 px-2 text-center cursor-pointer hover:bg-slate-200 bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Roll</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                )}

                {visibleColumns.nameKhmer && (
                  <th 
                    onClick={() => toggleSort('nameKhmer')}
                    className="py-2.5 px-3 font-khmer cursor-pointer hover:bg-slate-200 bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>ឈ្មោះជាភាសាខ្មែរ</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                )}

                {visibleColumns.nameEnglish && (
                  <th 
                    onClick={() => toggleSort('nameEnglish')}
                    className="py-2.5 px-3 cursor-pointer hover:bg-slate-200 bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Latin Name</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                )}

                {visibleColumns.gender && (
                  <th className="py-2.5 px-2 text-center font-khmer bg-slate-100">ភេទ</th>
                )}

                {visibleColumns.classGrade && (
                  <th 
                    onClick={() => toggleSort('classGrade')}
                    className="py-2.5 px-3 font-khmer cursor-pointer hover:bg-slate-200 bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>កម្រិតថ្នាក់</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                )}

                {visibleColumns.curriculum && (
                  <th className="py-2.5 px-2 text-center font-khmer bg-slate-100">កម្មវិធី</th>
                )}

                {visibleColumns.birthday && (
                  <th className="py-2.5 px-2.5 text-center font-khmer bg-slate-100">ថ្ងៃខែឆ្នាំកំណើត</th>
                )}

                {visibleColumns.parentName && (
                  <th className="py-2.5 px-3 font-khmer bg-slate-100">ឈ្មោះអាណាព្យាបាល</th>
                )}

                {visibleColumns.guardianPhone && (
                  <th className="py-2.5 px-3 font-khmer bg-slate-100">លេខទូរស័ព្ទ</th>
                )}

                {visibleColumns.address && (
                  <th className="py-2.5 px-3 font-khmer bg-slate-100">អាសយដ្ឋានបច្ចុប្បន្ន</th>
                )}

                {visibleColumns.tuitionFee && (
                  <th 
                    onClick={() => toggleSort('tuitionFee')}
                    className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-200 bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Tuition ($)</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                )}

                {visibleColumns.discount && (
                  <th className="py-2.5 px-2 text-center bg-slate-100">បញ្ចុះតម្លៃ (%)</th>
                )}

                {visibleColumns.netTuition && (
                  <th 
                    onClick={() => toggleSort('netTuition')}
                    className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-200 bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>ត្រូវបង់ ($)</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                )}

                {visibleColumns.pastDue && (
                  <th 
                    onClick={() => toggleSort('pastYearDue')}
                    className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-200 bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1 text-amber-900">
                      <span>ជំពាក់ចាស់ ($)</span>
                      <ArrowUpDown className="w-3 h-3 text-amber-600" />
                    </div>
                  </th>
                )}

                {visibleColumns.regDate && (
                  <th className="py-2.5 px-2 text-center bg-slate-100">ថ្ងៃចូលរៀន</th>
                )}

                {visibleColumns.status && (
                  <th className="py-2.5 px-2 text-center bg-slate-100">ស្ថានភាព</th>
                )}

                <th className="py-2.5 px-3 text-center bg-slate-100">សកម្មភាព</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={20} className="py-12 text-center text-slate-500 font-khmer italic">
                    ពុំមានសិស្សដែលត្រូវនឹងលក្ខខណ្ឌស្វែងរកនេះឡើយ។
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, idx) => {
                  const tuition = s.tuitionFee || 980;
                  const discount = s.discountPercentage || 0;
                  const netTuition = Math.max(0, Number((tuition * (1 - discount / 100)).toFixed(2)));

                  return (
                    <tr 
                      key={s.id} 
                      onClick={() => handleOpenRowStudent(s.id)}
                      className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                    >
                      <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-400">
                        {idx + 1}
                      </td>

                      {visibleColumns.code && (
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-900 text-xs">
                          {s.studentCode || `FBIS02-00${s.roll}`}
                        </td>
                      )}

                      {visibleColumns.roll && (
                        <td className="py-2.5 px-2 text-center font-mono font-semibold text-slate-700">
                          {s.roll}
                        </td>
                      )}

                      {visibleColumns.nameKhmer && (
                        <td className="py-2.5 px-3 font-khmer font-bold text-slate-900 group-hover:text-blue-700">
                          {s.nameKhmer}
                        </td>
                      )}

                      {visibleColumns.nameEnglish && (
                        <td className="py-2.5 px-3 font-medium text-slate-800">
                          {s.nameEnglish}
                        </td>
                      )}

                      {visibleColumns.gender && (
                        <td className="py-2.5 px-2 text-center font-khmer">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            s.gender === 'Female'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}>
                            {s.gender === 'Female' ? 'ស្រី' : 'ប្រុស'}
                          </span>
                        </td>
                      )}

                      {visibleColumns.classGrade && (
                        <td className="py-2.5 px-3 font-khmer font-semibold text-slate-800">
                          {s.classGrade}
                        </td>
                      )}

                      {visibleColumns.curriculum && (
                        <td className="py-2.5 px-2 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                            s.curriculum === 'english'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {s.curriculum === 'english' ? 'English' : 'Khmer'}
                          </span>
                        </td>
                      )}

                      {visibleColumns.birthday && (
                        <td className="py-2.5 px-2.5 text-center font-mono text-[11px] text-slate-600">
                          {s.birthday || '—'}
                        </td>
                      )}

                      {visibleColumns.parentName && (
                        <td className="py-2.5 px-3 font-khmer text-slate-800">
                          {s.parentName || '—'}
                        </td>
                      )}

                      {visibleColumns.guardianPhone && (
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700">
                          {s.guardianPhone || s.phone || '—'}
                        </td>
                      )}

                      {visibleColumns.address && (
                        <td className="py-2.5 px-3 font-khmer text-[11px] text-slate-600 max-w-xs truncate" title={s.address}>
                          {s.address || '—'}
                        </td>
                      )}

                      {visibleColumns.tuitionFee && (
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                          ${tuition.toFixed(2)}
                        </td>
                      )}

                      {visibleColumns.discount && (
                        <td className="py-2.5 px-2 text-center font-mono text-[11px]">
                          {discount > 0 ? (
                            <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                              {discount}%
                            </span>
                          ) : (
                            <span className="text-slate-400">0%</span>
                          )}
                        </td>
                      )}

                      {visibleColumns.netTuition && (
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">
                          ${netTuition.toFixed(2)}
                        </td>
                      )}

                      {visibleColumns.pastDue && (
                        <td className="py-2.5 px-3 text-right font-mono font-bold">
                          {(s.pastYearDue || 0) > 0 ? (
                            <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                              ${s.pastYearDue?.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-slate-400">$0.00</span>
                          )}
                        </td>
                      )}

                      {visibleColumns.regDate && (
                        <td className="py-2.5 px-2 text-center font-mono text-[10px] text-slate-500">
                          {s.registrationDate || '—'}
                        </td>
                      )}

                      {visibleColumns.status && (
                        <td className="py-2.5 px-2 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.status === 'active' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {s.status === 'active' ? 'Active' : s.status}
                          </span>
                        </td>
                      )}

                      <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStudentId(s.id);
                              setActiveTab('student-profile');
                            }}
                            className="p-1 hover:bg-blue-100 rounded text-blue-700 cursor-pointer"
                            title="មើលព័ត៌មានលម្អិត (Profile)"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setTargetStudentForPayment(s);
                              setIsPaymentModalOpen(true);
                            }}
                            className="p-1 hover:bg-emerald-100 rounded text-emerald-700 cursor-pointer"
                            title="កត់ត្រាការបង់ប្រាក់ (Add Payment)"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 font-khmer">
          <div>
            បង្ហាញសរុប {filteredStudents.length} នាក់ នៃសិស្សទាំងអស់ {branchStudents.length} នាក់
          </div>
          <div className="flex items-center gap-3 font-mono">
            <span>Base: ${summaryMetrics.totalTuition.toLocaleString()}</span>
            <span>•</span>
            <span className="text-amber-800 font-semibold">Arrears: ${summaryMetrics.totalDebt.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Add Payment Modal if triggered */}
      {isPaymentModalOpen && targetStudentForPayment && (
        <AddPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setTargetStudentForPayment(null);
          }}
          preselectedStudent={targetStudentForPayment}
        />
      )}
    </div>
  );
};
