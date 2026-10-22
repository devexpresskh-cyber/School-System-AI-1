import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { KhmerDueRecord, EnglishDueRecord } from '../../types/dueReport';
import { 
  Printer, 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Plus, 
  PhoneCall, 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  Download,
  Building,
  RefreshCw
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const DueReportsMatrix: React.FC = () => {
  const { 
    selectedBranch, 
    branches, 
    currentBranchId, 
    setCurrentBranchId, 
    branchKhmerDueRecords, 
    branchEnglishDueRecords,
    updateKhmerDueRecord,
    updateEnglishDueRecord,
    addKhmerDueRecord,
    addEnglishDueRecord,
    students,
    setSelectedStudentId,
    setActiveTab,
    settings
  } = useSchool();

  const [activeProgram, setActiveProgram] = useState<'khmer' | 'english'>('khmer');
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState('2025-2026');
  const [cutoffDateKhmer, setCutoffDateKhmer] = useState('៣១ ខែ ឧសភា ឆ្នាំ២០២៦');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [settleStudentTarget, setSettleStudentTarget] = useState<any>(null);

  // Filtered lists
  const filteredKhmer = branchKhmerDueRecords.filter(r => {
    const matchSearch = !search.trim() ||
      r.studentCode.toLowerCase().includes(search.toLowerCase()) ||
      r.nameKhmer.toLowerCase().includes(search.toLowerCase()) ||
      r.nameEnglish.toLowerCase().includes(search.toLowerCase());
    const matchYear = !selectedYear || r.academicYear === selectedYear;
    return matchSearch && matchYear;
  });

  const filteredEnglish = branchEnglishDueRecords.filter(r => {
    const matchSearch = !search.trim() ||
      r.studentCode.toLowerCase().includes(search.toLowerCase()) ||
      r.nameKhmer.toLowerCase().includes(search.toLowerCase()) ||
      r.nameEnglish.toLowerCase().includes(search.toLowerCase());
    const matchYear = !selectedYear || r.academicYear === selectedYear;
    return matchSearch && matchYear;
  });

  // Calculate Khmer Program Totals
  const khmerTotals = filteredKhmer.reduce((acc, r) => {
    acc.fullTuition += r.fullTuition;
    acc.amountPayable += r.amountPayable;
    acc.incentive += r.incentive;
    acc.transportPrev += r.previousMonthsDue.transport;
    acc.servicesPrev += r.previousMonthsDue.services;
    acc.totalPrev += r.previousMonthsDue.total;
    acc.received1 += r.installment1?.amountReceived || 0;
    acc.received2 += r.installment2?.amountReceived || 0;
    acc.received3 += r.installment3?.amountReceived || 0;
    acc.totalReceived += (r.installment1?.amountReceived || 0) + (r.installment2?.amountReceived || 0) + (r.installment3?.amountReceived || 0);
    acc.balTransport += r.balanceDue.transport;
    acc.balTransportPast += r.balanceDue.transportPastDue;
    acc.balTuition += r.balanceDue.tuition;
    acc.balTuitionPast += r.balanceDue.tuitionPastDue;
    acc.balServices += r.balanceDue.services;
    acc.balServicesPast += r.balanceDue.servicesPastDue;
    acc.balTotal += r.balanceDue.total;
    return acc;
  }, {
    fullTuition: 0,
    amountPayable: 0,
    incentive: 0,
    transportPrev: 0,
    servicesPrev: 0,
    totalPrev: 0,
    received1: 0,
    received2: 0,
    received3: 0,
    totalReceived: 0,
    balTransport: 0,
    balTransportPast: 0,
    balTuition: 0,
    balTuitionPast: 0,
    balServices: 0,
    balServicesPast: 0,
    balTotal: 0
  });

  // Calculate English Program Totals
  const englishTotals = filteredEnglish.reduce((acc, r) => {
    acc.fullTuition += r.fullTuition;
    acc.payTuition += r.amountPayable.tuition;
    acc.payServices += r.amountPayable.services;
    acc.prevTuition += r.previousMonthsDue.tuition;
    acc.prevServices += r.previousMonthsDue.services;
    acc.paidTuition1 += r.actualPayment.tuition.installment1?.amountReceived || 0;
    acc.paidTuition2 += r.actualPayment.tuition.installment2?.amountReceived || 0;
    acc.paidServices1 += r.actualPayment.services.installment1?.amountReceived || 0;
    acc.endTuition += r.endingBalance.tuition;
    acc.endServices += r.endingBalance.services;
    acc.remPrevTuition += r.remainingPreviousDue.tuition;
    acc.remPrevServices += r.remainingPreviousDue.services;
    acc.actTuition += r.actualArrears.tuition;
    acc.actServices += r.actualArrears.services;
    acc.totTuition += r.totalDue.tuition;
    acc.totServices += r.totalDue.services;
    acc.grandTotal += r.totalDue.total;
    return acc;
  }, {
    fullTuition: 0,
    payTuition: 0,
    payServices: 0,
    prevTuition: 0,
    prevServices: 0,
    paidTuition1: 0,
    paidTuition2: 0,
    paidServices1: 0,
    endTuition: 0,
    endServices: 0,
    remPrevTuition: 0,
    remPrevServices: 0,
    actTuition: 0,
    actServices: 0,
    totTuition: 0,
    totServices: 0,
    grandTotal: 0
  });

  // Export to Excel for Khmer Program
  const handleExportKhmerExcel = () => {
    const data = filteredKhmer.map(r => ({
      'ល.រ': r.no,
      'អត្តលេខសិស្ស': r.studentCode,
      'ឈ្មោះសិស្សជាភាសាខ្មែរ': r.nameKhmer,
      'ឈ្មោះជាអក្សរឡាតាំង': r.nameEnglish,
      'ភេទ': r.gender,
      'ថ្ងៃខែឆ្នាំកំណើត': r.dob,
      'ឆ្នាំសិក្សា': r.academicYear,
      'ស្ថានភាព': r.status,
      'ថ្លៃឈ្នួលសិក្សាពេញ ($)': r.fullTuition,
      'បញ្ចុះតម្លៃ (%)': r.discountPercent ? `${r.discountPercent}%` : '',
      'បញ្ចុះតម្លៃ ($)': r.discountAmount ? `$${r.discountAmount}` : '',
      'លើកទឹកចិត្ត ($)': r.incentive || 0,
      'ទឹកប្រាក់ត្រូវបង់ ($)': r.amountPayable,
      'ជំពាក់ខែមុន-ដឹកជញ្ជូន': r.previousMonthsDue.transport,
      'ជំពាក់ខែមុន-សេវាផ្សេងៗ': r.previousMonthsDue.services,
      'ជំពាក់ខែមុន-សរុប': r.previousMonthsDue.total,
      'លើកទី១-កាលបរិច្ឆេទ': r.installment1?.date || '',
      'លើកទី១-លេខវិក្កយបត្រ': r.installment1?.invoiceNo || '',
      'លើកទី១-ទឹកប្រាក់': r.installment1?.amountReceived || 0,
      'នៅខ្វះ-ដឹកជញ្ជូន': r.balanceDue.transport,
      'នៅខ្វះ-ថ្លៃសិក្សា': r.balanceDue.tuition,
      'នៅខ្វះ-សេវាផ្សេងៗ': r.balanceDue.services,
      'ទឹកប្រាក់នៅខ្វះសរុប ($)': r.balanceDue.total
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Khmer Due Report');
    XLSX.writeFile(workbook, `FBIS_Khmer_Program_Due_Report_${selectedBranch.code}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Export to Excel for English Program
  const handleExportEnglishExcel = () => {
    const data = filteredEnglish.map(r => ({
      'ល.រ': r.no,
      'អត្តលេខសិស្ស': r.studentCode,
      'ឈ្មោះសិស្សជាភាសាខ្មែរ': r.nameKhmer,
      'ឈ្មោះជាអក្សរឡាតាំង': r.nameEnglish,
      'ភេទ': r.gender,
      'ថ្ងៃខែឆ្នាំកំណើត': r.dob,
      'ឆ្នាំសិក្សា': r.academicYear,
      'ស្ថានភាព': r.status,
      'ថ្លៃឈ្នួលសិក្សាពេញ ($)': r.fullTuition,
      'បញ្ចុះតម្លៃ (%)': `${r.discountPercent}%`,
      'លើកទឹកចិត្ត ($)': r.incentive,
      'ត្រូវបង់-ថ្លៃសិក្សា ($)': r.amountPayable.tuition,
      'ត្រូវបង់-សេវាផ្សេងៗ ($)': r.amountPayable.services,
      'ជំពាក់ខែមុន-ថ្លៃសិក្សា': r.previousMonthsDue.tuition,
      'ជំពាក់ខែមុន-សេវាផ្សេងៗ': r.previousMonthsDue.services,
      'បង់ជាក់ស្តែង-ថ្លៃសិក្សា លើកទី១ (ថ្ងៃ)': r.actualPayment.tuition.installment1?.date || '',
      'បង់ជាក់ស្តែង-ថ្លៃសិក្សា លើកទី១ (វិក្កយបត្រ)': r.actualPayment.tuition.installment1?.invoiceNo || '',
      'បង់ជាក់ស្តែង-ថ្លៃសិក្សា លើកទី១ ($)': r.actualPayment.tuition.installment1?.amountReceived || 0,
      'បង់ជាក់ស្តែង-សេវា លើកទី១ (ថ្ងៃ)': r.actualPayment.services.installment1?.date || '',
      'បង់ជាក់ស្តែង-សេវា លើកទី១ (វិក្កយបត្រ)': r.actualPayment.services.installment1?.invoiceNo || '',
      'បង់ជាក់ស្តែង-សេវា លើកទី១ ($)': r.actualPayment.services.installment1?.amountReceived || 0,
      'សល់ចុងគ្រា-ថ្លៃសិក្សា': r.endingBalance.tuition,
      'សល់ចុងគ្រា-សេវា': r.endingBalance.services,
      'ជំពាក់ជាក់ស្តែង-ថ្លៃសិក្សា': r.actualArrears.tuition,
      'ជំពាក់ជាក់ស្តែង-សេវា': r.actualArrears.services,
      'ត្រូវបង់សរុប-ថ្លៃសិក្សា': r.totalDue.tuition,
      'ត្រូវបង់សរុប-សេវា': r.totalDue.services,
      'ទឹកប្រាក់ត្រូវបង់សរុប ($)': r.totalDue.total
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'English Due Report');
    XLSX.writeFile(workbook, `FBIS_English_Program_Due_Report_${selectedBranch.code}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Mode Switcher */}
      <div className="no-print bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Khmer Program Tab */}
          <button
            onClick={() => setActiveProgram('khmer')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeProgram === 'khmer'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span className="text-sm">🇰🇭</span>
            <div className="text-left">
              <div className="font-khmer font-bold">កម្មវិធីភាសាខ្មែរ (Khmer Program)</div>
              <div className="text-[10px] font-sans font-normal opacity-90">
                {branchKhmerDueRecords.length} សិស្សត្រូវបង់ថ្លៃដឹកជញ្ជូន & ថ្លៃសិក្សា
              </div>
            </div>
          </button>

          {/* English Program Tab */}
          <button
            onClick={() => setActiveProgram('english')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeProgram === 'english'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span className="text-sm">🇬🇧</span>
            <div className="text-left">
              <div className="font-khmer font-bold">កម្មវិធីភាសាអង់គ្លេស (English Program)</div>
              <div className="text-[10px] font-sans font-normal opacity-90">
                {branchEnglishDueRecords.length} សិស្សត្រូវបង់ប្រាក់រៀលប្រចាំឆមាស
              </div>
            </div>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={activeProgram === 'khmer' ? handleExportKhmerExcel : handleExportEnglishExcel}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel (.xlsx)</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Form</span>
          </button>
        </div>
      </div>

      {/* Filter and Configuration Bar */}
      <div className="no-print bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[260px]">
            <input
              type="text"
              placeholder="Search by Student ID (e.g. FBIS5478), name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 bg-white"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-khmer text-slate-600">ឆ្នាំសិក្សា:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="h-8 px-2.5 text-xs border border-slate-300 rounded-md bg-white font-mono"
            >
              <option value="2025-2026">2025-2026</option>
              <option value="2026-2027">2026-2027</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-khmer text-slate-600">សាខា:</span>
            <select
              value={currentBranchId}
              onChange={(e) => setCurrentBranchId(e.target.value)}
              className="h-8 px-2.5 text-xs border border-slate-300 rounded-md bg-white font-khmer"
            >
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.nameKhmer}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-khmer text-slate-600">គិតដល់ត្រឹមថ្ងៃទី:</span>
            <input
              type="text"
              value={cutoffDateKhmer}
              onChange={(e) => setCutoffDateKhmer(e.target.value)}
              className="h-8 px-2.5 text-xs border border-slate-300 rounded-md bg-white font-khmer min-w-[170px]"
            />
          </div>
        </div>

        <div className="text-[11px] text-slate-500 font-sans">
          Showing <span className="font-bold text-slate-900">{activeProgram === 'khmer' ? filteredKhmer.length : filteredEnglish.length}</span> students
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🇰🇭 KHMER PROGRAM DUE REPORT (REFERENCING SCREENSHOT 1)                    */}
      {/* ========================================================================= */}
      {activeProgram === 'khmer' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-300 p-4 overflow-hidden print:p-0 print:border-none print:shadow-none">
          {/* Official Report Header */}
          <div className="text-center mb-4">
            <h2 className="text-base sm:text-lg font-black font-khmer text-slate-900 tracking-wide">
              បញ្ជីឈ្មោះសិស្សត្រូវបង់ថ្លៃ ដឹកជញ្ជូន និង ថ្លៃសិក្សា ឆ្នាំសិក្សា{selectedYear} {selectedBranch.nameKhmer}
            </h2>
            <p className="text-xs font-khmer text-slate-700 mt-0.5">
              គិតដល់ត្រឹមថ្ងៃទី {cutoffDateKhmer}
            </p>
          </div>

          {/* Yellow Matrix Table */}
          <div className="overflow-x-auto border border-slate-400">
            <table className="w-full text-left text-[10.5px] border-collapse whitespace-nowrap">
              {/* Header Rows Matching Screenshot 1 with Yellow Theme */}
              <thead className="bg-[#fff3a8] text-slate-900 font-semibold font-khmer text-center border-b border-slate-400">
                <tr className="border-b border-slate-300">
                  <th rowSpan={2} className="py-2 px-1.5 border-r border-slate-300 w-8">ល.រ</th>
                  <th rowSpan={2} className="py-2 px-2 border-r border-slate-300">អត្តលេខសិស្ស</th>
                  <th rowSpan={2} className="py-2 px-3 border-r border-slate-300">ឈ្មោះសិស្សជាភាសាខ្មែរ</th>
                  <th rowSpan={2} className="py-2 px-3 border-r border-slate-300 font-sans">ឈ្មោះជាអក្សរឡាតាំង</th>
                  <th rowSpan={2} className="py-2 px-1.5 border-r border-slate-300">ភេទ</th>
                  <th rowSpan={2} className="py-2 px-2 border-r border-slate-300">ថ្ងៃខែឆ្នាំកំណើត</th>
                  <th rowSpan={2} className="py-2 px-2 border-r border-slate-300">ឆ្នាំសិក្សា</th>
                  <th rowSpan={2} className="py-2 px-2 border-r border-slate-300">ស្ថានភាព</th>
                  <th rowSpan={2} className="py-2 px-2 border-r border-slate-300">ថ្លៃឈ្នួល<br/>សិក្សាពេញ</th>
                  <th colSpan={2} className="py-1 px-2 border-r border-slate-300">បញ្ចុះតម្លៃសិស្ស</th>
                  <th rowSpan={2} className="py-2 px-2 border-r border-slate-300">លើកទឹកចិត្ត</th>
                  <th rowSpan={2} className="py-2 px-2 border-r border-slate-300 bg-amber-100">ទឹកប្រាក់ត្រូវបង់</th>
                  <th rowSpan={2} className="py-2 px-1.5 border-r border-slate-300">ទឹកប្រាក់ជំពាក់<br/>ឆ្នាំចាស់</th>
                  <th colSpan={3} className="py-1 px-2 border-r border-slate-300">ទឹកប្រាក់ជំពាក់ខែមុនៗ</th>
                  <th colSpan={3} className="py-1 px-2 border-r border-slate-300 bg-blue-100/50">លើកទី១</th>
                  <th colSpan={3} className="py-1 px-2 border-r border-slate-300">លើកទី២</th>
                  <th colSpan={3} className="py-1 px-2 border-r border-slate-300">លើកទី៣</th>
                  <th colSpan={7} className="py-1 px-2 bg-red-100/50 border-r border-slate-300">ទឹកប្រាក់នៅខ្វះ (Remaining Due)</th>
                  <th rowSpan={2} className="no-print py-2 px-2 text-center">សកម្មភាព</th>
                </tr>
                <tr className="text-[9.5px]">
                  {/* បញ្ចុះតម្លៃសិស្ស */}
                  <th className="py-1 px-1 border-r border-slate-300">%</th>
                  <th className="py-1 px-1 border-r border-slate-300">$</th>

                  {/* ទឹកប្រាក់ជំពាក់ខែមុនៗ */}
                  <th className="py-1 px-1.5 border-r border-slate-300">ដឹកជញ្ជូន</th>
                  <th className="py-1 px-1.5 border-r border-slate-300">សេវាផ្សេងៗ</th>
                  <th className="py-1 px-1.5 border-r border-slate-300">សរុប</th>

                  {/* លើកទី១ */}
                  <th className="py-1 px-1.5 border-r border-slate-300">កាលបរិច្ឆេទ</th>
                  <th className="py-1 px-2 border-r border-slate-300 font-sans">លេខវិក្កយបត្រ</th>
                  <th className="py-1 px-1.5 border-r border-slate-300">ទឹកប្រាក់</th>

                  {/* លើកទី២ */}
                  <th className="py-1 px-1.5 border-r border-slate-300">កាលបរិច្ឆេទ</th>
                  <th className="py-1 px-2 border-r border-slate-300 font-sans">លេខវិក្កយបត្រ</th>
                  <th className="py-1 px-1.5 border-r border-slate-300">ទឹកប្រាក់</th>

                  {/* លើកទី៣ */}
                  <th className="py-1 px-1.5 border-r border-slate-300">កាលបរិច្ឆេទ</th>
                  <th className="py-1 px-2 border-r border-slate-300 font-sans">លេខវិក្កយបត្រ</th>
                  <th className="py-1 px-1.5 border-r border-slate-300">ទឹកប្រាក់</th>

                  {/* ទឹកប្រាក់នៅខ្វះ */}
                  <th className="py-1 px-1.5 border-r border-slate-300">ដឹកជញ្ជូន</th>
                  <th className="py-1 px-1.5 border-r border-slate-300">ដឹកជញ្ជូនខែមុន</th>
                  <th className="py-1 px-1.5 border-r border-slate-300">ថ្លៃសិក្សា</th>
                  <th className="py-1 px-1.5 border-r border-slate-300">ថ្លៃសិក្សាខែមុន</th>
                  <th className="py-1 px-1.5 border-r border-slate-300">សេវាផ្សេងៗ</th>
                  <th className="py-1 px-1.5 border-r border-slate-300">ផ្សេងៗខែមុន</th>
                  <th className="py-1 px-2 border-r border-slate-300 font-bold bg-red-100 text-red-900">សរុប</th>
                </tr>
              </thead>

              {/* Body Rows */}
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {filteredKhmer.map((r, index) => {
                  const isOverdue = r.balanceDue.total > 0;
                  return (
                    <tr 
                      key={r.id} 
                      className={`hover:bg-amber-50/40 transition-colors ${
                        r.studentCode === 'FBIS5402' ? 'bg-red-50/40 font-medium' : ''
                      }`}
                    >
                      <td className="py-1.5 px-1.5 text-center font-mono border-r border-slate-200">{r.no}</td>
                      <td className="py-1.5 px-2 font-mono font-medium text-slate-900 border-r border-slate-200">
                        {r.studentCode}
                      </td>
                      <td className="py-1.5 px-3 font-khmer font-bold text-slate-900 border-r border-slate-200">
                        {r.nameKhmer}
                      </td>
                      <td className="py-1.5 px-3 font-sans text-slate-700 border-r border-slate-200">
                        {r.nameEnglish}
                      </td>
                      <td className="py-1.5 px-1.5 text-center font-khmer border-r border-slate-200">{r.gender}</td>
                      <td className="py-1.5 px-2 font-mono text-[10px] text-slate-600 border-r border-slate-200">{r.dob}</td>
                      <td className="py-1.5 px-2 font-mono text-[10px] text-center border-r border-slate-200">{r.academicYear}</td>
                      <td className="py-1.5 px-2 font-khmer text-center text-slate-600 border-r border-slate-200">{r.status}</td>
                      <td className="py-1.5 px-2 text-right font-mono font-medium border-r border-slate-200">
                        ${r.fullTuition.toFixed(2)}
                      </td>

                      {/* Discount % & $ */}
                      <td className="py-1.5 px-1 text-center font-mono text-slate-700 border-r border-slate-200">
                        {r.discountPercent ? `${r.discountPercent}%` : '-'}
                      </td>
                      <td className="py-1.5 px-1 text-right font-mono text-slate-700 border-r border-slate-200">
                        {r.discountAmount ? `$${r.discountAmount.toFixed(2)}` : '-'}
                      </td>

                      {/* Incentive */}
                      <td className="py-1.5 px-2 text-right font-mono text-slate-700 border-r border-slate-200">
                        {r.incentive ? `$${r.incentive.toFixed(2)}` : '-'}
                      </td>

                      {/* Amount Payable */}
                      <td className="py-1.5 px-2 text-right font-mono font-bold text-slate-900 bg-amber-50/60 border-r border-slate-200">
                        ${r.amountPayable.toFixed(2)}
                      </td>

                      {/* Past Year Due */}
                      <td className="py-1.5 px-1.5 text-right font-mono text-slate-500 border-r border-slate-200">
                        {r.pastYearDue ? `$${r.pastYearDue.toFixed(2)}` : '-'}
                      </td>

                      {/* Previous Months Due */}
                      <td className="py-1.5 px-1.5 text-right font-mono text-slate-700 border-r border-slate-200">
                        {r.previousMonthsDue.transport ? `$${r.previousMonthsDue.transport.toFixed(2)}` : '-'}
                      </td>
                      <td className="py-1.5 px-1.5 text-right font-mono text-slate-700 border-r border-slate-200">
                        {r.previousMonthsDue.services ? `$${r.previousMonthsDue.services.toFixed(2)}` : '-'}
                      </td>
                      <td className="py-1.5 px-1.5 text-right font-mono font-semibold text-slate-900 border-r border-slate-200">
                        {r.previousMonthsDue.total ? `$${r.previousMonthsDue.total.toFixed(2)}` : '-'}
                      </td>

                      {/* Installment 1 */}
                      <td className="py-1.5 px-1.5 font-mono text-[9.5px] text-slate-600 border-r border-slate-200">
                        {r.installment1?.date || '-'}
                      </td>
                      <td className="py-1.5 px-2 font-mono text-[9.5px] text-blue-700 border-r border-slate-200">
                        {r.installment1?.invoiceNo || '-'}
                      </td>
                      <td className="py-1.5 px-1.5 text-right font-mono font-medium text-emerald-700 border-r border-slate-200">
                        {r.installment1?.amountReceived ? `$${r.installment1.amountReceived.toFixed(2)}` : '-'}
                      </td>

                      {/* Installment 2 */}
                      <td className="py-1.5 px-1.5 font-mono text-[9.5px] text-slate-600 border-r border-slate-200">
                        {r.installment2?.date || '-'}
                      </td>
                      <td className="py-1.5 px-2 font-mono text-[9.5px] text-blue-700 border-r border-slate-200">
                        {r.installment2?.invoiceNo || '-'}
                      </td>
                      <td className="py-1.5 px-1.5 text-right font-mono font-medium text-emerald-700 border-r border-slate-200">
                        {r.installment2?.amountReceived ? `$${r.installment2.amountReceived.toFixed(2)}` : '-'}
                      </td>

                      {/* Installment 3 */}
                      <td className="py-1.5 px-1.5 font-mono text-[9.5px] text-slate-600 border-r border-slate-200">
                        {r.installment3?.date || '-'}
                      </td>
                      <td className="py-1.5 px-2 font-mono text-[9.5px] text-blue-700 border-r border-slate-200">
                        {r.installment3?.invoiceNo || '-'}
                      </td>
                      <td className="py-1.5 px-1.5 text-right font-mono font-medium text-emerald-700 border-r border-slate-200">
                        {r.installment3?.amountReceived ? `$${r.installment3.amountReceived.toFixed(2)}` : '-'}
                      </td>

                      {/* Remaining Balance Due Columns */}
                      <td className="py-1.5 px-1.5 text-right font-mono text-slate-600 border-r border-slate-200">
                        {r.balanceDue.transport ? `$${r.balanceDue.transport.toFixed(2)}` : '-'}
                      </td>
                      <td className="py-1.5 px-1.5 text-right font-mono text-slate-600 border-r border-slate-200">
                        {r.balanceDue.transportPastDue ? `$${r.balanceDue.transportPastDue.toFixed(2)}` : '-'}
                      </td>
                      <td className="py-1.5 px-1.5 text-right font-mono font-medium text-red-700 border-r border-slate-200">
                        {r.balanceDue.tuition ? `$${r.balanceDue.tuition.toFixed(2)}` : '-'}
                      </td>
                      <td className="py-1.5 px-1.5 text-right font-mono text-slate-600 border-r border-slate-200">
                        {r.balanceDue.tuitionPastDue ? `$${r.balanceDue.tuitionPastDue.toFixed(2)}` : '-'}
                      </td>
                      <td className="py-1.5 px-1.5 text-right font-mono text-slate-600 border-r border-slate-200">
                        {r.balanceDue.services ? `$${r.balanceDue.services.toFixed(2)}` : '-'}
                      </td>
                      <td className="py-1.5 px-1.5 text-right font-mono text-slate-600 border-r border-slate-200">
                        {r.balanceDue.servicesPastDue ? `$${r.balanceDue.servicesPastDue.toFixed(2)}` : '-'}
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono font-bold text-red-700 bg-red-50/70 border-r border-slate-200">
                        ${r.balanceDue.total.toFixed(2)}
                      </td>

                      {/* Actions */}
                      <td className="no-print py-1.5 px-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            title="Call Guardian / Note"
                            onClick={() => setActiveTab('due-payments')}
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded cursor-pointer"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Summary Total Row Matching Screenshot 1 */}
              <tfoot className="bg-[#fff3a8] font-bold font-khmer text-slate-900 border-t-2 border-slate-400">
                <tr>
                  <td colSpan={8} className="py-2.5 px-3 text-center border-r border-slate-300">
                    ទឹកប្រាក់សរុប (Grand Total)
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono border-r border-slate-300">
                    ${khmerTotals.fullTuition.toFixed(2)}
                  </td>
                  <td colSpan={2} className="py-2.5 px-1 border-r border-slate-300"></td>
                  <td className="py-2.5 px-2 text-right font-mono border-r border-slate-300">
                    ${khmerTotals.incentive.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono text-slate-950 bg-amber-200/60 border-r border-slate-300">
                    ${khmerTotals.amountPayable.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-1.5 border-r border-slate-300"></td>
                  <td className="py-2.5 px-1.5 text-right font-mono border-r border-slate-300">
                    ${khmerTotals.transportPrev.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-1.5 text-right font-mono border-r border-slate-300">
                    ${khmerTotals.servicesPrev.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-1.5 text-right font-mono border-r border-slate-300">
                    ${khmerTotals.totalPrev.toFixed(2)}
                  </td>
                  <td colSpan={2} className="py-2.5 px-1 border-r border-slate-300"></td>
                  <td className="py-2.5 px-1.5 text-right font-mono text-emerald-800 border-r border-slate-300">
                    ${khmerTotals.received1.toFixed(2)}
                  </td>
                  <td colSpan={2} className="py-2.5 px-1 border-r border-slate-300"></td>
                  <td className="py-2.5 px-1.5 text-right font-mono text-emerald-800 border-r border-slate-300">
                    ${khmerTotals.received2.toFixed(2)}
                  </td>
                  <td colSpan={2} className="py-2.5 px-1 border-r border-slate-300"></td>
                  <td className="py-2.5 px-1.5 text-right font-mono text-emerald-800 border-r border-slate-300">
                    ${khmerTotals.received3.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-1.5 text-right font-mono border-r border-slate-300">
                    ${khmerTotals.balTransport.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-1.5 text-right font-mono border-r border-slate-300">
                    ${khmerTotals.balTransportPast.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-1.5 text-right font-mono text-red-900 border-r border-slate-300">
                    ${khmerTotals.balTuition.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-1.5 text-right font-mono border-r border-slate-300">
                    ${khmerTotals.balTuitionPast.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-1.5 text-right font-mono border-r border-slate-300">
                    ${khmerTotals.balServices.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-1.5 text-right font-mono border-r border-slate-300">
                    ${khmerTotals.balServicesPast.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono text-red-900 bg-red-200/80 border-r border-slate-300">
                    ${khmerTotals.balTotal.toFixed(2)}
                  </td>
                  <td className="no-print"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer Signatures Matching Official Format */}
          <div className="mt-8 flex justify-between items-start text-xs font-khmer text-slate-800 px-8">
            <div className="text-center">
              <p className="font-semibold">បានឃើញ និងឯកភាព</p>
              <p className="font-bold text-slate-900 mt-0.5">នាយកសាលា</p>
              <div className="h-16"></div>
              <p className="font-semibold text-slate-900">លោក {selectedBranch.directorName}</p>
            </div>

            <div className="text-center">
              <p className="font-semibold">ពិនិត្យដោយ</p>
              <p className="font-bold text-slate-900 mt-0.5">ប្រធានគណនេយ្យ</p>
              <div className="h-16"></div>
              <p className="font-semibold text-slate-900">កែវ វិបុល</p>
            </div>

            <div className="text-center">
              <p className="text-slate-600">ធ្វើនៅសៀមរាប, ថ្ងៃទី {cutoffDateKhmer}</p>
              <p className="font-bold text-slate-900 mt-0.5">បេឡាករ / អ្នករៀបចំ</p>
              <div className="h-16"></div>
              <p className="font-semibold text-slate-900">ចាន់ សុផល</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🇬🇧 ENGLISH PROGRAM DUE REPORT (REFERENCING SCREENSHOT 2)                  */}
      {/* ========================================================================= */}
      {activeProgram === 'english' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-300 p-4 overflow-hidden print:p-0 print:border-none print:shadow-none">
          {/* Official Report Header */}
          <div className="text-center mb-4">
            <h2 className="text-base sm:text-lg font-black font-khmer text-slate-900 tracking-wide">
              បញ្ជីឈ្មោះសិស្សត្រូវបង់ប្រាក់រៀលប្រចាំឆមាសសម្រាប់កម្មវិធីភាសាអង់គ្លេស(Primary) ជំនាន់ថ្មី ឆ្នាំសិក្សា{selectedYear} {selectedBranch.nameKhmer}
            </h2>
            <p className="text-xs font-khmer text-slate-700 mt-0.5">
              គិតដល់ត្រឹមថ្ងៃទី {cutoffDateKhmer}
            </p>
          </div>

          {/* Yellow Matrix Table for English Program */}
          <div className="overflow-x-auto border border-slate-400">
            <table className="w-full text-left text-[10.5px] border-collapse whitespace-nowrap">
              {/* Header Rows Matching Screenshot 2 with Yellow Theme */}
              <thead className="bg-[#fff3a8] text-slate-900 font-semibold font-khmer text-center border-b border-slate-400">
                <tr className="border-b border-slate-300">
                  <th rowSpan={2} className="py-2 px-1.5 border-r border-slate-300 w-8">ល.រ</th>
                  <th rowSpan={2} className="py-2 px-2 border-r border-slate-300">អត្តលេខសិស្ស</th>
                  <th rowSpan={2} className="py-2 px-3 border-r border-slate-300">ឈ្មោះសិស្សជាភាសាខ្មែរ</th>
                  <th rowSpan={2} className="py-2 px-3 border-r border-slate-300 font-sans">ឈ្មោះជាអក្សរឡាតាំង</th>
                  <th rowSpan={2} className="py-2 px-1.5 border-r border-slate-300">ភេទ</th>
                  <th rowSpan={2} className="py-2 px-2 border-r border-slate-300">ថ្ងៃខែឆ្នាំកំណើត</th>
                  <th rowSpan={2} className="py-2 px-2 border-r border-slate-300">ឆ្នាំសិក្សា</th>
                  <th rowSpan={2} className="py-2 px-2 border-r border-slate-300">ស្ថានភាព</th>
                  <th rowSpan={2} className="py-2 px-2 border-r border-slate-300">ថ្លៃឈ្នួល<br/>សិក្សាពេញ</th>
                  <th rowSpan={2} className="py-2 px-1.5 border-r border-slate-300">បញ្ចុះតម្លៃ<br/>(%)</th>
                  <th rowSpan={2} className="py-2 px-1.5 border-r border-slate-300">លើកទឹកចិត្ត<br/>($)</th>
                  <th colSpan={2} className="py-1 px-2 border-r border-slate-300 bg-amber-100">ទឹកប្រាក់ត្រូវបង់</th>
                  <th colSpan={2} className="py-1 px-2 border-r border-slate-300">ទឹកប្រាក់ជំពាក់ខែមុនៗ</th>
                  <th colSpan={6} className="py-1 px-2 border-r border-slate-300 bg-blue-100/50">ព័ត៌មានការបង់ប្រាក់ជាក់ស្តែង (Actual Paid)</th>
                  <th colSpan={2} className="py-1 px-2 border-r border-slate-300">ទឹកប្រាក់សល់ចុងគ្រា</th>
                  <th colSpan={2} className="py-1 px-2 border-r border-slate-300">ទឹកប្រាក់ជំពាក់ខែមុននៅខ្វះ</th>
                  <th colSpan={2} className="py-1 px-2 border-r border-slate-300">ទឹកប្រាក់ជំពាក់ជាក់ស្តែង</th>
                  <th colSpan={3} className="py-1 px-2 bg-red-100/50 border-r border-slate-300">ទឹកប្រាក់ត្រូវបង់សរុប (Total Due)</th>
                  <th rowSpan={2} className="no-print py-2 px-2 text-center">សកម្មភាព</th>
                </tr>
                <tr className="text-[9.5px]">
                  {/* ទឹកប្រាក់ត្រូវបង់ */}
                  <th className="py-1 px-1.5 border-r border-slate-300">ថ្លៃឈ្នួលសិក្សា</th>
                  <th className="py-1 px-1.5 border-r border-slate-300">ថ្លៃសេវាផ្សេងៗ</th>

                  {/* ទឹកប្រាក់ជំពាក់ខែមុនៗ */}
                  <th className="py-1 px-1.5 border-r border-slate-300">ថ្លៃឈ្នួលសិក្សា</th>
                  <th className="py-1 px-1.5 border-r border-slate-300">ថ្លៃសេវាផ្សេងៗ</th>

                  {/* ព័ត៌មានការបង់ប្រាក់ជាក់ស្តែង */}
                  <th className="py-1 px-1.5 border-r border-slate-300">កាលបរិច្ឆេទ</th>
                  <th className="py-1 px-2 border-r border-slate-300 font-sans">លេខវិក្កយបត្រ</th>
                  <th className="py-1 px-1.5 border-r border-slate-300">ទឹកប្រាក់(សិក្សា)</th>
                  <th className="py-1 px-1.5 border-r border-slate-300">កាលបរិច្ឆេទ</th>
                  <th className="py-1 px-2 border-r border-slate-300 font-sans">លេខវិក្កយបត្រ</th>
                  <th className="py-1 px-1.5 border-r border-slate-300">ទឹកប្រាក់(សេវា)</th>

                  {/* ទឹកប្រាក់សល់ចុងគ្រា */}
                  <th className="py-1 px-1.5 border-r border-slate-300">ថ្លៃឈ្នួលសិក្សា</th>
                  <th className="py-1 px-1.5 border-r border-slate-300">ថ្លៃសេវាផ្សេងៗ</th>

                  {/* ទឹកប្រាក់ជំពាក់ខែមុននៅខ្វះ */}
                  <th className="py-1 px-1.5 border-r border-slate-300">ថ្លៃឈ្នួលសិក្សា</th>
                  <th className="py-1 px-1.5 border-r border-slate-300">ថ្លៃសេវាផ្សេងៗ</th>

                  {/* ទឹកប្រាក់ជំពាក់ជាក់ស្តែង */}
                  <th className="py-1 px-1.5 border-r border-slate-300">ថ្លៃឈ្នួលសិក្សា</th>
                  <th className="py-1 px-1.5 border-r border-slate-300">ថ្លៃសេវាផ្សេងៗ</th>

                  {/* ទឹកប្រាក់ត្រូវបង់សរុប */}
                  <th className="py-1 px-1.5 border-r border-slate-300">ថ្លៃឈ្នួលសិក្សា</th>
                  <th className="py-1 px-1.5 border-r border-slate-300">ថ្លៃសេវាផ្សេងៗ</th>
                  <th className="py-1 px-2 border-r border-slate-300 font-bold bg-red-100 text-red-900">សរុប</th>
                </tr>
              </thead>

              {/* Body Rows */}
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {filteredEnglish.map((r, index) => {
                  return (
                    <tr key={r.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="py-1.5 px-1.5 text-center font-mono border-r border-slate-200">{r.no}</td>
                      <td className="py-1.5 px-2 font-mono font-medium text-slate-900 border-r border-slate-200">
                        {r.studentCode}
                      </td>
                      <td className="py-1.5 px-3 font-khmer font-bold text-slate-900 border-r border-slate-200">
                        {r.nameKhmer}
                      </td>
                      <td className="py-1.5 px-3 font-sans text-slate-700 border-r border-slate-200">
                        {r.nameEnglish}
                      </td>
                      <td className="py-1.5 px-1.5 text-center font-mono border-r border-slate-200">{r.gender}</td>
                      <td className="py-1.5 px-2 font-mono text-[10px] text-slate-600 border-r border-slate-200">{r.dob}</td>
                      <td className="py-1.5 px-2 font-mono text-[10px] text-center border-r border-slate-200">{r.academicYear}</td>
                      <td className="py-1.5 px-2 font-khmer text-center text-slate-600 border-r border-slate-200">{r.status}</td>
                      <td className="py-1.5 px-2 text-right font-mono font-medium border-r border-slate-200">
                        ${r.fullTuition.toFixed(2)}
                      </td>
                      <td className="py-1.5 px-1.5 text-center font-mono text-slate-700 border-r border-slate-200">
                        {r.discountPercent ? `${r.discountPercent}%` : '-'}
                      </td>
                      <td className="py-1.5 px-1.5 text-right font-mono text-slate-700 border-r border-slate-200">
                        {r.incentive ? `$${r.incentive.toFixed(2)}` : '-'}
                      </td>

                      {/* ទឹកប្រាក់ត្រូវបង់ */}
                      <td className="py-1.5 px-1.5 text-right font-mono font-bold text-slate-900 bg-amber-50/50 border-r border-slate-200">
                        ${r.amountPayable.tuition.toFixed(2)}
                      </td>
                      <td className="py-1.5 px-1.5 text-right font-mono font-medium text-slate-800 bg-amber-50/30 border-r border-slate-200">
                        ${r.amountPayable.services.toFixed(2)}
                      </td>

                      {/* ទឹកប្រាក់ជំពាក់ខែមុនៗ */}
                      <td className="py-1.5 px-1.5 text-right font-mono text-slate-700 border-r border-slate-200">
                        {r.previousMonthsDue.tuition ? `$${r.previousMonthsDue.tuition.toFixed(2)}` : '-'}
                      </td>
                      <td className="py-1.5 px-1.5 text-right font-mono text-slate-700 border-r border-slate-200">
                        {r.previousMonthsDue.services ? `$${r.previousMonthsDue.services.toFixed(2)}` : '-'}
                      </td>

                      {/* Actual Payment - Tuition */}
                      <td className="py-1.5 px-1.5 font-mono text-[9.5px] text-slate-600 border-r border-slate-200">
                        {r.actualPayment.tuition.installment1?.date || '-'}
                      </td>
                      <td className="py-1.5 px-2 font-mono text-[9.5px] text-blue-700 border-r border-slate-200">
                        {r.actualPayment.tuition.installment1?.invoiceNo || '-'}
                      </td>
                      <td className="py-1.5 px-1.5 text-right font-mono font-medium text-emerald-700 border-r border-slate-200">
                        {r.actualPayment.tuition.installment1?.amountReceived ? `$${r.actualPayment.tuition.installment1.amountReceived.toFixed(2)}` : '-'}
                      </td>

                      {/* Actual Payment - Services */}
                      <td className="py-1.5 px-1.5 font-mono text-[9.5px] text-slate-600 border-r border-slate-200">
                        {r.actualPayment.services.installment1?.date || '-'}
                      </td>
                      <td className="py-1.5 px-2 font-mono text-[9.5px] text-blue-700 border-r border-slate-200">
                        {r.actualPayment.services.installment1?.invoiceNo || '-'}
                      </td>
                      <td className="py-1.5 px-1.5 text-right font-mono font-medium text-emerald-700 border-r border-slate-200">
                        {r.actualPayment.services.installment1?.amountReceived ? `$${r.actualPayment.services.installment1.amountReceived.toFixed(2)}` : '-'}
                      </td>

                      {/* ទឹកប្រាក់សល់ចុងគ្រា */}
                      <td className="py-1.5 px-1.5 text-right font-mono text-slate-700 border-r border-slate-200">
                        {r.endingBalance.tuition ? `$${r.endingBalance.tuition.toFixed(2)}` : '-'}
                      </td>
                      <td className="py-1.5 px-1.5 text-right font-mono text-slate-700 border-r border-slate-200">
                        {r.endingBalance.services ? `$${r.endingBalance.services.toFixed(2)}` : '-'}
                      </td>

                      {/* ទឹកប្រាក់ជំពាក់ខែមុននៅខ្វះ */}
                      <td className="py-1.5 px-1.5 text-right font-mono text-slate-700 border-r border-slate-200">
                        {r.remainingPreviousDue.tuition ? `$${r.remainingPreviousDue.tuition.toFixed(2)}` : '-'}
                      </td>
                      <td className="py-1.5 px-1.5 text-right font-mono text-slate-700 border-r border-slate-200">
                        {r.remainingPreviousDue.services ? `$${r.remainingPreviousDue.services.toFixed(2)}` : '-'}
                      </td>

                      {/* ទឹកប្រាក់ជំពាក់ជាក់ស្តែង */}
                      <td className="py-1.5 px-1.5 text-right font-mono text-slate-700 border-r border-slate-200">
                        {r.actualArrears.tuition ? `$${r.actualArrears.tuition.toFixed(2)}` : '-'}
                      </td>
                      <td className="py-1.5 px-1.5 text-right font-mono text-slate-700 border-r border-slate-200">
                        {r.actualArrears.services ? `$${r.actualArrears.services.toFixed(2)}` : '-'}
                      </td>

                      {/* ទឹកប្រាក់ត្រូវបង់សរុប */}
                      <td className="py-1.5 px-1.5 text-right font-mono text-red-700 border-r border-slate-200">
                        ${r.totalDue.tuition.toFixed(2)}
                      </td>
                      <td className="py-1.5 px-1.5 text-right font-mono text-red-700 border-r border-slate-200">
                        ${r.totalDue.services.toFixed(2)}
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono font-bold text-red-700 bg-red-50/70 border-r border-slate-200">
                        ${r.totalDue.total.toFixed(2)}
                      </td>

                      {/* Actions */}
                      <td className="no-print py-1.5 px-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            title="Call Guardian / Note"
                            onClick={() => setActiveTab('due-payments')}
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded cursor-pointer"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Summary Total Row Matching Screenshot 2 */}
              <tfoot className="bg-[#fff3a8] font-bold font-khmer text-slate-900 border-t-2 border-slate-400">
                <tr>
                  <td colSpan={8} className="py-2.5 px-3 text-center border-r border-slate-300">
                    ទឹកប្រាក់សរុប (Grand Total)
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono border-r border-slate-300">
                    ${englishTotals.fullTuition.toFixed(2)}
                  </td>
                  <td colSpan={2} className="py-2.5 px-1.5 border-r border-slate-300"></td>
                  <td className="py-2.5 px-1.5 text-right font-mono text-slate-950 bg-amber-200/60 border-r border-slate-300">
                    ${englishTotals.payTuition.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-1.5 text-right font-mono text-slate-950 bg-amber-200/40 border-r border-slate-300">
                    ${englishTotals.payServices.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-1.5 text-right font-mono border-r border-slate-300">
                    ${englishTotals.prevTuition.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-1.5 text-right font-mono border-r border-slate-300">
                    ${englishTotals.prevServices.toFixed(2)}
                  </td>
                  <td colSpan={2} className="py-2.5 px-1 border-r border-slate-300"></td>
                  <td className="py-2.5 px-1.5 text-right font-mono text-emerald-800 border-r border-slate-300">
                    ${englishTotals.paidTuition1.toFixed(2)}
                  </td>
                  <td colSpan={2} className="py-2.5 px-1 border-r border-slate-300"></td>
                  <td className="py-2.5 px-1.5 text-right font-mono text-emerald-800 border-r border-slate-300">
                    ${englishTotals.paidServices1.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-1.5 text-right font-mono border-r border-slate-300">
                    ${englishTotals.endTuition.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-1.5 text-right font-mono border-r border-slate-300">
                    ${englishTotals.endServices.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-1.5 text-right font-mono border-r border-slate-300">
                    ${englishTotals.remPrevTuition.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-1.5 text-right font-mono border-r border-slate-300">
                    ${englishTotals.remPrevServices.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-1.5 text-right font-mono border-r border-slate-300">
                    ${englishTotals.actTuition.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-1.5 text-right font-mono border-r border-slate-300">
                    ${englishTotals.actServices.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-1.5 text-right font-mono text-red-900 border-r border-slate-300">
                    ${englishTotals.totTuition.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-1.5 text-right font-mono text-red-900 border-r border-slate-300">
                    ${englishTotals.totServices.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono text-red-900 bg-red-200/80 border-r border-slate-300">
                    ${englishTotals.grandTotal.toFixed(2)}
                  </td>
                  <td className="no-print"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer Signatures Matching Screenshot 2 Format */}
          <div className="mt-8 flex justify-end text-xs font-khmer text-slate-800 px-8">
            <div className="text-center">
              <p className="text-slate-600">អនុម័តដោយ ថ្ងៃទី {cutoffDateKhmer}</p>
              <p className="font-bold text-slate-900 mt-1">(ប្រធានផ្នែកគណនេយ្យ)</p>
              <div className="h-16"></div>
              <p className="font-semibold text-slate-900">កែវ វិបុល</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
