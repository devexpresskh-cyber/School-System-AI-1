import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { KhmerDueRecord, EnglishDueRecord } from '../../types/dueReport';
import { 
  Printer, 
  FileSpreadsheet, 
  Search, 
  Filter, 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Download,
  Building,
  RefreshCw,
  Edit2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { getSemesterConfig, formatKhmerDate } from '../../utils/semesterUtils';

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
    students,
    setSelectedStudentId,
    setActiveTab,
    settings
  } = useSchool();

  const [activeProgram, setActiveProgram] = useState<'khmer' | 'english'>('khmer');
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState('2025-2026');
  const [cutoffDateKhmer, setCutoffDateKhmer] = useState('៣១-ឧសភា-២០២៦');
  const [selectedClassKhmer, setSelectedClassKhmer] = useState('ថ្នាក់ទី៧');
  const [selectedClassEnglish, setSelectedClassEnglish] = useState('ថ្នាក់K1');

  // Semester Date Configuration for the selected year
  const semConfig = getSemesterConfig(settings, selectedYear);

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
    const full = r.fullTuition || 0;
    const payable = r.amountPayable || 0;
    const pastYear = r.pastYearDue || 0;
    const newYear = r.newYearDue || 0;
    const beg = r.beginningBalanceDue || 0;
    const paid1 = r.installment1?.amountReceived || 0;
    const paid2 = r.installment2?.amountReceived || 0;
    const paid3 = r.installment3?.amountReceived || 0;
    const paidSem2 = r.semester2Payment?.amountReceived || 0;
    const totPaid = r.totalPaid ?? (paid1 + paid2 + paid3 + paidSem2);
    const endSem1 = r.endingDue?.semester1 || 0;
    const endSem2 = r.endingDue?.semester2 || 0;
    const endPastYear = r.endingDue?.pastYear || 0;
    const endTot = r.endingDue?.total || (endSem1 + endSem2 + endPastYear);

    acc.fullTuition += full;
    acc.amountPayable += payable;
    acc.pastYearDue += pastYear;
    acc.newYearDue += newYear;
    acc.beginningBalanceDue += beg;
    acc.installment1 += paid1;
    acc.installment2 += paid2;
    acc.installment3 += paid3;
    acc.semester2 += paidSem2;
    acc.totalPaid += totPaid;
    acc.endingSem1 += endSem1;
    acc.endingSem2 += endSem2;
    acc.endingPastYear += endPastYear;
    acc.endingTotal += endTot;
    return acc;
  }, {
    fullTuition: 0,
    amountPayable: 0,
    pastYearDue: 0,
    newYearDue: 0,
    beginningBalanceDue: 0,
    installment1: 0,
    installment2: 0,
    installment3: 0,
    semester2: 0,
    totalPaid: 0,
    endingSem1: 0,
    endingSem2: 0,
    endingPastYear: 0,
    endingTotal: 0
  });

  // Calculate English Program Totals
  const englishTotals = filteredEnglish.reduce((acc, r) => {
    acc.fullTuition += r.fullTuition || 0;
    acc.annualIncentive += r.annualIncentive || 0;
    acc.incentive += r.incentive || 0;
    acc.amountPayableTuition += r.amountPayableTuition || 0;
    
    // Past Year
    acc.pastYearTuition += r.pastYearDue?.tuition || 0;
    acc.pastYearAdmin += r.pastYearDue?.adminFee || 0;

    // Beginning Quarters
    acc.begQ1Tuition += r.beginningQuarterDue?.q1?.tuition || 0;
    acc.begQ1Admin += r.beginningQuarterDue?.q1?.adminFee || 0;
    acc.begQ2Tuition += r.beginningQuarterDue?.q2?.tuition || 0;
    acc.begQ2Admin += r.beginningQuarterDue?.q2?.adminFee || 0;
    acc.begQ3Tuition += r.beginningQuarterDue?.q3?.tuition || 0;
    acc.begQ3Admin += r.beginningQuarterDue?.q3?.adminFee || 0;
    acc.begQ4Tuition += r.beginningQuarterDue?.q4?.tuition || 0;
    acc.begQ4Admin += r.beginningQuarterDue?.q4?.adminFee || 0;
    acc.begNewYearTuition += r.beginningQuarterDue?.newYearTotal?.tuition || 0;
    acc.begNewYearAdmin += r.beginningQuarterDue?.newYearTotal?.adminFee || 0;

    // Payments
    acc.inst1Tuition += r.installment1?.amountTuition || 0;
    acc.inst1Admin += r.installment1?.amountAdmin || 0;
    acc.inst2Tuition += r.installment2?.amountTuition || 0;
    acc.inst2Admin += r.installment2?.amountAdmin || 0;
    acc.totPaidTuition += r.totalPaid?.tuition || (r.installment1?.amountTuition || 0) + (r.installment2?.amountTuition || 0);
    acc.totPaidAdmin += r.totalPaid?.adminFee || (r.installment1?.amountAdmin || 0) + (r.installment2?.amountAdmin || 0);
    acc.paymentCount += r.paymentCount || 0;

    // Ending Quarters
    acc.endPastYearTuition += r.endingQuarterDue?.pastYear?.tuition || 0;
    acc.endPastYearAdmin += r.endingQuarterDue?.pastYear?.adminFee || 0;
    acc.endQ1Tuition += r.endingQuarterDue?.q1?.tuition || 0;
    acc.endQ1Admin += r.endingQuarterDue?.q1?.adminFee || 0;
    acc.endQ2Tuition += r.endingQuarterDue?.q2?.tuition || 0;
    acc.endQ2Admin += r.endingQuarterDue?.q2?.adminFee || 0;
    acc.endQ3Tuition += r.endingQuarterDue?.q3?.tuition || 0;
    acc.endQ3Admin += r.endingQuarterDue?.q3?.adminFee || 0;
    acc.endQ4Tuition += r.endingQuarterDue?.q4?.tuition || 0;
    acc.endQ4Admin += r.endingQuarterDue?.q4?.adminFee || 0;
    acc.endTotalTuition += r.endingQuarterDue?.total?.tuition || 0;
    acc.endTotalAdmin += r.endingQuarterDue?.total?.adminFee || 0;

    return acc;
  }, {
    fullTuition: 0,
    annualIncentive: 0,
    incentive: 0,
    amountPayableTuition: 0,
    pastYearTuition: 0,
    pastYearAdmin: 0,
    begQ1Tuition: 0,
    begQ1Admin: 0,
    begQ2Tuition: 0,
    begQ2Admin: 0,
    begQ3Tuition: 0,
    begQ3Admin: 0,
    begQ4Tuition: 0,
    begQ4Admin: 0,
    begNewYearTuition: 0,
    begNewYearAdmin: 0,
    inst1Tuition: 0,
    inst1Admin: 0,
    inst2Tuition: 0,
    inst2Admin: 0,
    totPaidTuition: 0,
    totPaidAdmin: 0,
    paymentCount: 0,
    endPastYearTuition: 0,
    endPastYearAdmin: 0,
    endQ1Tuition: 0,
    endQ1Admin: 0,
    endQ2Tuition: 0,
    endQ2Admin: 0,
    endQ3Tuition: 0,
    endQ3Admin: 0,
    endQ4Tuition: 0,
    endQ4Admin: 0,
    endTotalTuition: 0,
    endTotalAdmin: 0
  });

  // Export to Excel for Khmer Program
  const handleExportKhmerExcel = () => {
    const data = filteredKhmer.map(r => ({
      'ល-រ': r.no,
      'អត្តលេខសិស្ស': r.studentCode,
      'ឈ្មោះជាភាសាខ្មែរ': r.nameKhmer,
      'ឈ្មោះជាភាសាឡាតាំង': r.nameEnglish,
      'ភេទ': r.gender,
      'ថ្ងៃខែឆ្នាំកំណើត': r.dob,
      'ឆ្នាំសិក្សា': r.academicYear,
      'ស្ថានភាព': r.status,
      'ថ្លៃឈ្នួលសិក្សា១ឆ្នាំ': r.fullTuition,
      'បញ្ចុះតម្លៃ (%)': r.discountPercent ? `${r.discountPercent}%` : '',
      'បញ្ចុះតម្លៃ ($)': r.incentive ? `$${r.incentive}` : '',
      'ទឹកប្រាក់ត្រូវបង់': r.amountPayable,
      'ទឹកប្រាក់ជំពាក់ឆ្នាំសិក្សាចាស់': r.pastYearDue || 0,
      'ទឹកប្រាក់ជំពាក់ឆ្នាំថ្មី': r.newYearDue || 0,
      'ទឹកប្រាក់ជំពាក់ដើមត្រា': r.beginningBalanceDue || 0,
      'ឆមាស១-លើកទី១-កាលបរិច្ឆេទ': r.installment1?.date || '',
      'ឆមាស១-លើកទី១-វិក្កយបត្រ': r.installment1?.invoiceNo || '',
      'ឆមាស១-លើកទី១-ទឹកប្រាក់': r.installment1?.amountReceived || 0,
      'ឆមាស១-លើកទី២-កាលបរិច្ឆេទ': r.installment2?.date || '',
      'ឆមាស១-លើកទី២-វិក្កយបត្រ': r.installment2?.invoiceNo || '',
      'ឆមាស១-លើកទី២-ទឹកប្រាក់': r.installment2?.amountReceived || 0,
      'ឆមាស១-លើកទី៣-កាលបរិច្ឆេទ': r.installment3?.date || '',
      'ឆមាស១-លើកទី៣-វិក្កយបត្រ': r.installment3?.invoiceNo || '',
      'ឆមាស១-លើកទី៣-ទឹកប្រាក់': r.installment3?.amountReceived || 0,
      'ឆមាស២-កាលបរិច្ឆេទ': r.semester2Payment?.date || '',
      'ឆមាស២-វិក្កយបត្រ': r.semester2Payment?.invoiceNo || '',
      'ឆមាស២-ទឹកប្រាក់': r.semester2Payment?.amountReceived || 0,
      'ទឹកប្រាក់បានបង់សរុប': r.totalPaid ?? ((r.installment1?.amountReceived || 0) + (r.installment2?.amountReceived || 0) + (r.installment3?.amountReceived || 0) + (r.semester2Payment?.amountReceived || 0)),
      'ជំពាក់ចុងត្រា-ឆមាស១': r.endingDue?.semester1 || 0,
      'ជំពាក់ចុងត្រា-ឆមាស២': r.endingDue?.semester2 || 0,
      'ជំពាក់ចុងត្រា-ឆ្នាំចាស់': r.endingDue?.pastYear || 0,
      'ទឹកប្រាក់ជំពាក់ចុងត្រាសរុប': r.endingDue?.total || 0
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Khmer Due Report');
    XLSX.writeFile(workbook, `FBIS_Khmer_Program_Grade7_Due_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Export to Excel for English Program
  const handleExportEnglishExcel = () => {
    const data = filteredEnglish.map(r => ({
      'ល-រ': r.no,
      'អត្តលេខសិស្ស': r.studentCode,
      'ឈ្មោះ ជាភាសាខ្មែរ': r.nameKhmer,
      'ឈ្មោះ ជាភាសាឡាតាំង': r.nameEnglish,
      'ភេទ': r.gender,
      'ថ្ងៃ ខែ ឆ្នាំកំណើត': r.dob,
      'ឆ្នាំសិក្សា': r.academicYear,
      'ស្ថានភាព': r.status,
      'ថ្លៃឈ្នួលសិក្សា១ឆ្នាំ': r.fullTuition,
      'បញ្ចុះតម្លៃ ក្នុង១ឆ្នាំ (%)': `${r.discountPercent}%`,
      'បញ្ចុះតម្លៃ ការលើកទឹកចិត្ត ($)': r.annualIncentive || 0,
      'ការលើកទឹកចិត្ត ($)': r.incentive || 0,
      'ទឹកប្រាក់ត្រូវបង់': r.amountPayableTuition,
      'ជំពាក់ឆ្នាំចាស់-ថ្លៃឈ្នួលសិក្សា': r.pastYearDue?.tuition || 0,
      'ជំពាក់ឆ្នាំចាស់-សេវារដ្ឋបាល': r.pastYearDue?.adminFee || 0,
      'ជំពាក់ដើមត្រីមាស-Q1-ថ្លៃសិក្សា': r.beginningQuarterDue?.q1?.tuition || 0,
      'ជំពាក់ដើមត្រីមាស-Q1-សេវា': r.beginningQuarterDue?.q1?.adminFee || 0,
      'ជំពាក់ដើមត្រីមាស-Q2-ថ្លៃសិក្សា': r.beginningQuarterDue?.q2?.tuition || 0,
      'ជំពាក់ដើមត្រីមាស-Q2-សេវា': r.beginningQuarterDue?.q2?.adminFee || 0,
      'ជំពាក់ដើមត្រីមាស-Q3-ថ្លៃសិក្សា': r.beginningQuarterDue?.q3?.tuition || 0,
      'ជំពាក់ដើមត្រីមាស-Q3-សេវា': r.beginningQuarterDue?.q3?.adminFee || 0,
      'ជំពាក់ដើមត្រីមាស-Q4-ថ្លៃសិក្សា': r.beginningQuarterDue?.q4?.tuition || 0,
      'ជំពាក់ដើមត្រីមាស-Q4-សេវា': r.beginningQuarterDue?.q4?.adminFee || 0,
      'ជំពាក់ឆ្នាំថ្មី-សរុបថ្លៃសិក្សា': r.beginningQuarterDue?.newYearTotal?.tuition || 0,
      'ជំពាក់ឆ្នាំថ្មី-សរុបសេវា': r.beginningQuarterDue?.newYearTotal?.adminFee || 0,
      'លើកទី១-កាលបរិច្ឆេទ': r.installment1?.date || '',
      'លើកទី១-វិក្កយបត្រសិក្សា': r.installment1?.invoiceNoTuition || r.installment1?.invoiceNo || '',
      'លើកទី១-ទឹកប្រាក់សិក្សា': r.installment1?.amountTuition || 0,
      'លើកទី១-វិក្កយបត្រសេវា': r.installment1?.invoiceNoAdmin || '',
      'លើកទី១-ទឹកប្រាក់សេវា': r.installment1?.amountAdmin || 0,
      'ទឹកប្រាក់បានបង់សរុប-ថ្លៃសិក្សា': r.totalPaid?.tuition || 0,
      'ទឹកប្រាក់បានបង់សរុប-សេវា': r.totalPaid?.adminFee || 0,
      'ចំនួនដង': r.paymentCount || 0,
      'ជំពាក់ចុងត្រីមាស-Q1-ថ្លៃសិក្សា': r.endingQuarterDue?.q1?.tuition || 0,
      'ជំពាក់ចុងត្រីមាស-Q2-ថ្លៃសិក្សា': r.endingQuarterDue?.q2?.tuition || 0,
      'ជំពាក់ចុងត្រីមាស-Q2-សេវា': r.endingQuarterDue?.q2?.adminFee || 0,
      'ជំពាក់ចុងត្រីមាស-Q3-ថ្លៃសិក្សា': r.endingQuarterDue?.q3?.tuition || 0,
      'ជំពាក់ចុងត្រីមាស-Q3-សេវា': r.endingQuarterDue?.q3?.adminFee || 0,
      'ជំពាក់ចុងត្រីមាស-Q4-ថ្លៃសិក្សា': r.endingQuarterDue?.q4?.tuition || 0,
      'ជំពាក់ចុងត្រីមាស-Q4-សេវា': r.endingQuarterDue?.q4?.adminFee || 0,
      'ជំពាក់ចុងត្រីមាសសរុប-ថ្លៃសិក្សា': r.endingQuarterDue?.total?.tuition || 0,
      'ជំពាក់ចុងត្រីមាសសរុប-សេវា': r.endingQuarterDue?.total?.adminFee || 0
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'English Due Report');
    XLSX.writeFile(workbook, `FBIS_English_Program_K1_Due_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
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
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span className="text-sm">🇰🇭</span>
            <div className="text-left">
              <div className="font-khmer font-bold">កម្មវិធីភាសាខ្មែរ (Khmer Program - Grade 7)</div>
              <div className="text-[10px] font-sans font-normal opacity-90">
                {branchKhmerDueRecords.length} សិស្សជំពាក់ថ្លៃឈ្នួលសិក្សា តាមឆមាស & លើកបង់ប្រាក់
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
              <div className="font-khmer font-bold">កម្មវិធីភាសាអង់គ្លេស (English Program - K1)</div>
              <div className="text-[10px] font-sans font-normal opacity-90">
                {branchEnglishDueRecords.length} សិស្សជំពាក់ថ្លៃឈ្នួលសិក្សា & សេវារដ្ឋបាល តាមត្រីមាស
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
              className="h-8 px-2 text-xs border border-slate-300 rounded-md bg-white font-khmer"
            >
              <option value="2025-2026">២០២៥-២០២៦ (2025-2026)</option>
              <option value="2026-2027">២០២៦-២០២៧ (2026-2027)</option>
              <option value="2024-2025">២០២៤-២០២៥ (2024-2025)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-khmer text-slate-600">គិតដល់ត្រឹមថ្ងៃទី:</span>
            <input
              type="text"
              value={cutoffDateKhmer}
              onChange={(e) => setCutoffDateKhmer(e.target.value)}
              className="h-8 px-2.5 text-xs border border-slate-300 rounded-md bg-white font-khmer min-w-[150px]"
            />
          </div>
        </div>

        <div className="text-[11px] text-slate-500 font-sans">
          Showing <span className="font-bold text-slate-900">{activeProgram === 'khmer' ? filteredKhmer.length : filteredEnglish.length}</span> students
        </div>
      </div>

      {/* Semester Configuration Date Timeline Banner */}
      <div className="no-print bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="font-bold text-slate-800 font-khmer">
            កាលបរិច្ឆេទឆមាស ({selectedYear})៖
          </span>
          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-khmer border border-blue-200">
            ឆមាសទី១: <b>{formatKhmerDate(semConfig.semester1StartDate)}</b> ដល់ <b>{formatKhmerDate(semConfig.semester1EndDate)}</b>
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-khmer border border-emerald-200">
            ឆមាសទី២: <b>{formatKhmerDate(semConfig.semester2StartDate)}</b> ដល់ <b>{formatKhmerDate(semConfig.semester2EndDate)}</b>
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono font-bold">
          <span className="text-blue-800 font-khmer">
            ជំពាក់ឆមាស១: <span className="font-mono text-rose-600">${khmerTotals.endingSem1.toFixed(2)}</span>
          </span>
          <span className="text-emerald-800 font-khmer">
            ជំពាក់ឆមាស២: <span className="font-mono text-rose-600">${khmerTotals.endingSem2.toFixed(2)}</span>
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🇰🇭 KHMER PROGRAM DUE REPORT (CORRECTED REFERRING TO ORIGINAL PDF 2)        */}
      {/* ========================================================================= */}
      {activeProgram === 'khmer' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-300 p-4 overflow-hidden print:p-0 print:border-none print:shadow-none">
          {/* Official Report Header */}
          <div className="text-center mb-4">
            <h2 className="text-base sm:text-lg font-black font-khmer text-slate-900 tracking-wide">
              បញ្ជីឈ្មោះសិស្ស{selectedClassKhmer} ជំពាក់ថ្លៃឈ្នួលសិក្សា ឆ្នាំសិក្សា{selectedYear} {selectedBranch.nameKhmer}
            </h2>
            <p className="text-xs font-khmer text-slate-700 mt-0.5">
              គិតដល់ត្រឹម ថ្ងៃទី{cutoffDateKhmer}
            </p>
          </div>

          {/* Yellow Matrix Table Matching Original PDF 2 */}
          <div className="overflow-x-auto border border-slate-400">
            <table className="w-full text-left text-[10px] border-collapse whitespace-nowrap">
              {/* Header Rows Matching Original Khmer PDF 2 with Yellow Theme */}
              <thead className="bg-[#fff3a8] text-slate-900 font-semibold font-khmer text-center border-b border-slate-400">
                <tr className="border-b border-slate-400">
                  <th rowSpan={2} className="py-2 px-1 border-r border-slate-400 w-7">ល-រ</th>
                  <th rowSpan={2} className="py-2 px-1.5 border-r border-slate-400">អត្តលេខសិស្ស</th>
                  <th rowSpan={2} className="py-2 px-2.5 border-r border-slate-400">ឈ្មោះជាភាសាខ្មែរ</th>
                  <th rowSpan={2} className="py-2 px-2.5 border-r border-slate-400 font-sans">ឈ្មោះជាភាសាឡាតាំង</th>
                  <th rowSpan={2} className="py-2 px-1 border-r border-slate-400">ភេទ</th>
                  <th rowSpan={2} className="py-2 px-1.5 border-r border-slate-400">ថ្ងៃខែឆ្នាំកំណើត</th>
                  <th rowSpan={2} className="py-2 px-1.5 border-r border-slate-400">ឆ្នាំសិក្សា</th>
                  <th rowSpan={2} className="py-2 px-1.5 border-r border-slate-400">ស្ថានភាព</th>
                  <th rowSpan={2} className="py-2 px-1.5 border-r border-slate-400">ថ្លៃឈ្នួល<br/>សិក្សា១ឆ្នាំ</th>
                  <th colSpan={2} className="py-1 px-1 border-r border-slate-400">បញ្ចុះតម្លៃក្នុង១ឆ្នាំ</th>
                  <th rowSpan={2} className="py-2 px-2 border-r border-slate-400 bg-amber-100/70 font-bold">ទឹកប្រាក់ត្រូវបង់</th>
                  <th rowSpan={2} className="py-2 px-1 border-r border-slate-400">ទឹកប្រាក់ជំពាក់<br/>ឆ្នាំសិក្សាចាស់</th>
                  <th rowSpan={2} className="py-2 px-1 border-r border-slate-400">ទឹកប្រាក់ជំពាក់<br/>ឆ្នាំថ្មី</th>
                  <th rowSpan={2} className="py-2 px-1.5 border-r border-slate-400 font-bold">ទឹកប្រាក់ជំពាក់<br/>ដើមត្រា</th>
                  <th colSpan={9} className="py-1 px-2 border-r border-slate-400 bg-sky-100/50">ឆមាសទី១</th>
                  <th colSpan={3} className="py-1 px-2 border-r border-slate-400 bg-indigo-100/50">ឆមាសទី២</th>
                  <th rowSpan={2} className="py-2 px-2 border-r border-slate-400 font-bold bg-emerald-100/60">ទឹកប្រាក់<br/>បានបង់សរុប</th>
                  <th colSpan={4} className="py-1 px-2 border-r border-slate-400 bg-rose-100/50">ទឹកប្រាក់ជំពាក់ចុងត្រា</th>
                  <th rowSpan={2} className="no-print py-2 px-1.5 text-center">សកម្មភាព</th>
                </tr>
                <tr className="text-[9px] border-b border-slate-400">
                  {/* បញ្ចុះតម្លៃក្នុង១ឆ្នាំ */}
                  <th className="py-1 px-1 border-r border-slate-400">%</th>
                  <th className="py-1 px-1 border-r border-slate-400">លើកទឹកចិត្ត ($)</th>

                  {/* ឆមាសទី១ - លើកទី១ */}
                  <th className="py-1 px-1 border-r border-slate-400">កាលបរិច្ឆេទបង់ប្រាក់</th>
                  <th className="py-1 px-1.5 border-r border-slate-400 font-sans">លេខវិក្កយបត្រ</th>
                  <th className="py-1 px-1 border-r border-slate-400 font-bold">ទឹកប្រាក់បានបង់</th>

                  {/* ឆមាសទី១ - លើកទី២ */}
                  <th className="py-1 px-1 border-r border-slate-400">កាលបរិច្ឆេទបង់ប្រាក់</th>
                  <th className="py-1 px-1.5 border-r border-slate-400 font-sans">លេខវិក្កយបត្រ</th>
                  <th className="py-1 px-1 border-r border-slate-400 font-bold">ទឹកប្រាក់បានបង់</th>

                  {/* ឆមាសទី១ - លើកទី៣ */}
                  <th className="py-1 px-1 border-r border-slate-400">កាលបរិច្ឆេទបង់ប្រាក់</th>
                  <th className="py-1 px-1.5 border-r border-slate-400 font-sans">លេខវិក្កយបត្រ</th>
                  <th className="py-1 px-1 border-r border-slate-400 font-bold">ទឹកប្រាក់បានបង់</th>

                  {/* ឆមាសទី២ */}
                  <th className="py-1 px-1 border-r border-slate-400">កាលបរិច្ឆេទបង់ប្រាក់</th>
                  <th className="py-1 px-1.5 border-r border-slate-400 font-sans">លេខវិក្កយបត្រ</th>
                  <th className="py-1 px-1 border-r border-slate-400 font-bold">ទឹកប្រាក់បានបង់</th>

                  {/* ទឹកប្រាក់ជំពាក់ចុងត្រា */}
                  <th className="py-1 px-1 border-r border-slate-400">ឆមាស១</th>
                  <th className="py-1 px-1 border-r border-slate-400">ឆមាស២</th>
                  <th className="py-1 px-1 border-r border-slate-400">ឆ្នាំចាស់</th>
                  <th className="py-1 px-1.5 border-r border-slate-400 font-bold text-red-900 bg-rose-100">សរុប</th>
                </tr>
              </thead>

              {/* Body Rows */}
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {filteredKhmer.map((r) => {
                  const isPaid = (r.totalPaid || 0) > 0;
                  const hasEndingDue = (r.endingDue?.total || 0) > 0;
                  return (
                    <tr 
                      key={r.id} 
                      className={`hover:bg-amber-50/50 transition-colors ${
                        hasEndingDue ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      <td className="py-1 px-1 text-center font-mono border-r border-slate-300">{r.no}</td>
                      <td className="py-1 px-1.5 font-mono font-medium text-slate-900 border-r border-slate-300">
                        {r.studentCode}
                      </td>
                      <td className="py-1 px-2 font-khmer font-bold text-slate-900 border-r border-slate-300">
                        {r.nameKhmer}
                      </td>
                      <td className="py-1 px-2 font-sans text-slate-700 border-r border-slate-300">
                        {r.nameEnglish}
                      </td>
                      <td className="py-1 px-1 text-center font-khmer border-r border-slate-300">{r.gender}</td>
                      <td className="py-1 px-1.5 font-mono text-[9px] text-slate-600 border-r border-slate-300">{r.dob}</td>
                      <td className="py-1 px-1 font-mono text-[9px] text-center border-r border-slate-300">{r.academicYear}</td>
                      <td className="py-1 px-1.5 font-khmer text-center text-slate-600 border-r border-slate-300">{r.status}</td>
                      <td className="py-1 px-1.5 text-right font-mono font-medium border-r border-slate-300">
                        ${r.fullTuition.toFixed(2)}
                      </td>

                      {/* បញ្ចុះតម្លៃ % & លើកទឹកចិត្ត $ */}
                      <td className="py-1 px-1 text-center font-mono text-slate-700 border-r border-slate-300">
                        {r.discountPercent ? `${r.discountPercent}%` : '-'}
                      </td>
                      <td className="py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300">
                        {r.incentive ? `$ ${r.incentive.toFixed(2)}` : '-'}
                      </td>

                      {/* ទឹកប្រាក់ត្រូវបង់ */}
                      <td className="py-1 px-2 text-right font-mono font-bold text-slate-900 bg-amber-50/60 border-r border-slate-300">
                        {r.amountPayable ? `$ ${r.amountPayable.toFixed(2)}` : '$ -'}
                      </td>

                      {/* ទឹកប្រាក់ជំពាក់ឆ្នាំចាស់ & ឆ្នាំថ្មី */}
                      <td className="py-1 px-1 text-right font-mono text-slate-500 border-r border-slate-300">
                        {r.pastYearDue ? `$ ${r.pastYearDue.toFixed(2)}` : '$ -'}
                      </td>
                      <td className="py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300">
                        {r.newYearDue ? `$ ${r.newYearDue.toFixed(2)}` : '$ -'}
                      </td>

                      {/* ទឹកប្រាក់ជំពាក់ដើមត្រា */}
                      <td className="py-1 px-1.5 text-right font-mono font-semibold text-slate-900 border-r border-slate-300">
                        {r.beginningBalanceDue ? `$ ${r.beginningBalanceDue.toFixed(2)}` : '$ -'}
                      </td>

                      {/* ឆមាសទី១ - លើកទី១ */}
                      <td className="py-1 px-1 font-mono text-[9px] text-slate-600 border-r border-slate-300">
                        {r.installment1?.date || '-'}
                      </td>
                      <td className="py-1 px-1.5 font-mono text-[9px] text-blue-700 border-r border-slate-300">
                        {r.installment1?.invoiceNo || '-'}
                      </td>
                      <td className="py-1 px-1 text-right font-mono font-medium text-emerald-700 border-r border-slate-300">
                        {r.installment1?.amountReceived ? `$ ${r.installment1.amountReceived.toFixed(2)}` : '$ -'}
                      </td>

                      {/* ឆមាសទី១ - លើកទី២ */}
                      <td className="py-1 px-1 font-mono text-[9px] text-slate-600 border-r border-slate-300">
                        {r.installment2?.date || '-'}
                      </td>
                      <td className="py-1 px-1.5 font-mono text-[9px] text-blue-700 border-r border-slate-300">
                        {r.installment2?.invoiceNo || '-'}
                      </td>
                      <td className="py-1 px-1 text-right font-mono font-medium text-emerald-700 border-r border-slate-300">
                        {r.installment2?.amountReceived ? `$ ${r.installment2.amountReceived.toFixed(2)}` : '$ -'}
                      </td>

                      {/* ឆមាសទី១ - លើកទី៣ */}
                      <td className="py-1 px-1 font-mono text-[9px] text-slate-600 border-r border-slate-300">
                        {r.installment3?.date || '-'}
                      </td>
                      <td className="py-1 px-1.5 font-mono text-[9px] text-blue-700 border-r border-slate-300">
                        {r.installment3?.invoiceNo || '-'}
                      </td>
                      <td className="py-1 px-1 text-right font-mono font-medium text-emerald-700 border-r border-slate-300">
                        {r.installment3?.amountReceived ? `$ ${r.installment3.amountReceived.toFixed(2)}` : '$ -'}
                      </td>

                      {/* ឆមាសទី២ */}
                      <td className="py-1 px-1 font-mono text-[9px] text-slate-600 border-r border-slate-300">
                        {r.semester2Payment?.date || '-'}
                      </td>
                      <td className="py-1 px-1.5 font-mono text-[9px] text-blue-700 border-r border-slate-300">
                        {r.semester2Payment?.invoiceNo || '-'}
                      </td>
                      <td className="py-1 px-1 text-right font-mono font-medium text-emerald-700 border-r border-slate-300">
                        {r.semester2Payment?.amountReceived ? `$ ${r.semester2Payment.amountReceived.toFixed(2)}` : '$ -'}
                      </td>

                      {/* ទឹកប្រាក់បានបង់សរុប */}
                      <td className="py-1 px-2 text-right font-mono font-bold text-emerald-800 bg-emerald-50/50 border-r border-slate-300">
                        {r.totalPaid ? `$ ${r.totalPaid.toFixed(2)}` : '$ -'}
                      </td>

                      {/* ទឹកប្រាក់ជំពាក់ចុងត្រា (ឆមាស១, ឆមាស២, ឆ្នាំចាស់, សរុប) */}
                      <td className="py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300">
                        {r.endingDue?.semester1 ? `$ ${r.endingDue.semester1.toFixed(2)}` : '$ -'}
                      </td>
                      <td className="py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300">
                        {r.endingDue?.semester2 ? `$ ${r.endingDue.semester2.toFixed(2)}` : '$ -'}
                      </td>
                      <td className="py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300">
                        {r.endingDue?.pastYear ? `$ ${r.endingDue.pastYear.toFixed(2)}` : '$ -'}
                      </td>
                      <td className={`py-1 px-1.5 text-right font-mono font-bold border-r border-slate-300 ${
                        (r.endingDue?.total || 0) > 0 ? 'text-red-700 bg-rose-50' : 'text-slate-400'
                      }`}>
                        {r.endingDue?.total ? `$ ${r.endingDue.total.toFixed(2)}` : '$ -'}
                      </td>

                      {/* Actions */}
                      <td className="no-print py-1 px-1.5 text-center">
                        <button
                          onClick={() => {
                            const found = students.find(s => s.studentCode === r.studentCode);
                            if (found) {
                              setSelectedStudentId(found.id);
                              setActiveTab('student-profile');
                            }
                          }}
                          className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[9px] font-semibold rounded cursor-pointer transition-colors"
                          title="មើលប្រវត្តិរូបសិស្ស"
                        >
                          Profile
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Totals Footer Matching Screenshot & PDF 2 */}
              <tfoot className="bg-[#fff3a8] font-bold text-slate-900 border-t-2 border-slate-400 font-khmer text-[9.5px]">
                <tr>
                  <td colSpan={8} className="py-2.5 px-3 text-center border-r border-slate-400 text-xs">
                    ទឹកប្រាក់សរុប (Grand Total) ({filteredKhmer.length} សិស្ស)
                  </td>
                  <td className="py-2.5 px-1.5 text-right font-mono border-r border-slate-400">
                    ${khmerTotals.fullTuition.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td colSpan={2} className="py-2.5 px-1 text-center font-mono border-r border-slate-400">
                    -
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono bg-amber-200/70 border-r border-slate-400">
                    ${khmerTotals.amountPayable.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-1 text-right font-mono border-r border-slate-400">
                    ${khmerTotals.pastYearDue.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-1 text-right font-mono border-r border-slate-400">
                    ${khmerTotals.newYearDue.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-1.5 text-right font-mono border-r border-slate-400">
                    ${khmerTotals.beginningBalanceDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>

                  {/* ឆមាស១ */}
                  <td colSpan={2} className="border-r border-slate-400"></td>
                  <td className="py-2.5 px-1 text-right font-mono border-r border-slate-400">
                    ${khmerTotals.installment1.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td colSpan={2} className="border-r border-slate-400"></td>
                  <td className="py-2.5 px-1 text-right font-mono border-r border-slate-400">
                    ${khmerTotals.installment2.toFixed(2)}
                  </td>
                  <td colSpan={2} className="border-r border-slate-400"></td>
                  <td className="py-2.5 px-1 text-right font-mono border-r border-slate-400">
                    ${khmerTotals.installment3.toFixed(2)}
                  </td>

                  {/* ឆមាស២ */}
                  <td colSpan={2} className="border-r border-slate-400"></td>
                  <td className="py-2.5 px-1 text-right font-mono border-r border-slate-400">
                    ${khmerTotals.semester2.toFixed(2)}
                  </td>

                  {/* ទឹកប្រាក់បានបង់សរុប */}
                  <td className="py-2.5 px-2 text-right font-mono text-emerald-900 bg-emerald-200/80 border-r border-slate-400">
                    ${khmerTotals.totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>

                  {/* ទឹកប្រាក់ជំពាក់ចុងត្រា */}
                  <td className="py-2.5 px-1 text-right font-mono border-r border-slate-400">
                    ${khmerTotals.endingSem1.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-1 text-right font-mono border-r border-slate-400">
                    ${khmerTotals.endingSem2.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-1 text-right font-mono border-r border-slate-400">
                    ${khmerTotals.endingPastYear.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-1.5 text-right font-mono text-red-900 bg-rose-200/80 border-r border-slate-400">
                    ${khmerTotals.endingTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="no-print"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer Signatures Matching Original PDF 2 */}
          <div className="mt-8 flex justify-between items-start text-xs font-khmer text-slate-800 px-8">
            <div className="text-center">
              <p className="font-semibold">បានឃើញ និងពិនិត្យត្រឹមត្រូវ</p>
              <p className="font-bold text-slate-900 mt-0.5">នាយកសាលា (School Director)</p>
              <div className="h-16 flex items-center justify-center italic text-slate-400 text-[11px]">[ហត្ថលេខា]</div>
              <p className="font-semibold text-slate-900">{selectedBranch.directorName}</p>
            </div>

            <div className="text-center">
              <p className="text-slate-600">ខេត្តសៀមរាប ថ្ងៃទី០១ ខែមិថុនា ឆ្នាំ២០២៦</p>
              <p className="font-bold text-slate-900 mt-0.5">បុគ្គលិកទទួលបន្ទុកបំណុល (Billing Officer)</p>
              <div className="h-16 flex items-center justify-center italic text-slate-400 text-[11px]">[ហត្ថលេខា]</div>
              <p className="font-semibold text-slate-900">ខុង សួស្តី</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🇬🇧 ENGLISH PROGRAM DUE REPORT (CORRECTED REFERRING TO ORIGINAL PDF 1)      */}
      {/* ========================================================================= */}
      {activeProgram === 'english' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-300 p-4 overflow-hidden print:p-0 print:border-none print:shadow-none">
          {/* Official Report Header */}
          <div className="text-center mb-4">
            <h2 className="text-base sm:text-lg font-black font-khmer text-slate-900 tracking-wide">
              បញ្ជីឈ្មោះសិស្សកម្មវិធីបណ្តុះបណ្តាលភាសាអង់គ្លេស កម្រិត {selectedClassEnglish} ជំពាក់ថ្លៃឈ្នួលសិក្សា ឆ្នាំសិក្សា{selectedYear}
            </h2>
            <p className="text-xs font-khmer text-slate-700 mt-0.5">
              គិតដល់ត្រឹម ថ្ងៃទី{cutoffDateKhmer}
            </p>
          </div>

          {/* Yellow Matrix Table for English Program Matching PDF 1 */}
          <div className="overflow-x-auto border border-slate-400">
            <table className="w-full text-left text-[9.5px] border-collapse whitespace-nowrap">
              {/* 3-Row Header Matching Original English PDF 1 */}
              <thead className="bg-[#fff3a8] text-slate-900 font-semibold font-khmer text-center border-b border-slate-400">
                {/* Header Row 1 */}
                <tr className="border-b border-slate-400">
                  <th rowSpan={3} className="py-2 px-1 border-r border-slate-400 w-7">ល-រ</th>
                  <th rowSpan={3} className="py-2 px-1.5 border-r border-slate-400">អត្តលេខសិស្ស</th>
                  <th rowSpan={3} className="py-2 px-2.5 border-r border-slate-400">ឈ្មោះ ជាភាសាខ្មែរ</th>
                  <th rowSpan={3} className="py-2 px-2.5 border-r border-slate-400 font-sans">ឈ្មោះ ជាភាសាឡាតាំង</th>
                  <th rowSpan={3} className="py-2 px-1 border-r border-slate-400">ភេទ</th>
                  <th rowSpan={3} className="py-2 px-1.5 border-r border-slate-400">ថ្ងៃ ខែ ឆ្នាំកំណើត</th>
                  <th rowSpan={3} className="py-2 px-1.5 border-r border-slate-400">ឆ្នាំសិក្សា</th>
                  <th rowSpan={3} className="py-2 px-1.5 border-r border-slate-400">ស្ថានភាព</th>
                  <th rowSpan={3} className="py-2 px-1.5 border-r border-slate-400">ថ្លៃឈ្នួលសិក្សា<br/>១ឆ្នាំ</th>
                  <th colSpan={2} rowSpan={2} className="py-1 px-1 border-r border-slate-400">បញ្ចុះតម្លៃ ក្នុង១ឆ្នាំ</th>
                  <th rowSpan={3} className="py-2 px-1.5 border-r border-slate-400">ការលើកទឹកចិត្ត</th>
                  <th rowSpan={3} className="py-2 px-2 border-r border-slate-400 bg-amber-100/70 font-bold">ទឹកប្រាក់ត្រូវបង់</th>
                  <th colSpan={2} className="py-1 px-1.5 border-r border-slate-400">ទឹកប្រាក់ជំពាក់ឆ្នាំសិក្សាចាស់</th>
                  <th colSpan={10} className="py-1 px-2 border-r border-slate-400 bg-amber-50/50">ទឹកប្រាក់ជំពាក់ដើមត្រីមាសរុបរួម</th>
                  <th colSpan={4} className="py-1 px-2 border-r border-slate-400 bg-sky-100/50">ព័ត៌មានការបង់ប្រាក់លើកទី១</th>
                  <th colSpan={4} className="py-1 px-2 border-r border-slate-400 bg-indigo-100/50">ព័ត៌មានការបង់ប្រាក់លើកទី២</th>
                  <th colSpan={2} className="py-1 px-1.5 border-r border-slate-400 bg-emerald-100/60 font-bold">ទឹកប្រាក់បានបង់សរុប</th>
                  <th rowSpan={3} className="py-2 px-1 border-r border-slate-400">ចំនួនដង</th>
                  <th colSpan={10} className="py-1 px-2 border-r border-slate-400 bg-rose-100/50">ទឹកប្រាក់ជំពាក់ចុងត្រីមាសរុបរួម</th>
                  <th rowSpan={3} className="no-print py-2 px-1.5 text-center">សកម្មភាព</th>
                </tr>

                {/* Header Row 2 */}
                <tr className="border-b border-slate-400 text-[8.5px]">
                  {/* ទឹកប្រាក់ជំពាក់ឆ្នាំសិក្សាចាស់ */}
                  <th rowSpan={2} className="py-1 px-1 border-r border-slate-400">ថ្លៃឈ្នួលសិក្សា</th>
                  <th rowSpan={2} className="py-1 px-1 border-r border-slate-400">ថ្លៃសេវារដ្ឋបាល</th>

                  {/* ទឹកប្រាក់ជំពាក់ដើមត្រីមាសរុបរួម */}
                  <th colSpan={2} className="py-0.5 px-1 border-r border-slate-400">ត្រីមាសទី១</th>
                  <th colSpan={2} className="py-0.5 px-1 border-r border-slate-400">ត្រីមាសទី២</th>
                  <th colSpan={2} className="py-0.5 px-1 border-r border-slate-400">ត្រីមាសទី៣</th>
                  <th colSpan={2} className="py-0.5 px-1 border-r border-slate-400">ត្រីមាសទី៤</th>
                  <th colSpan={2} className="py-0.5 px-1.5 border-r border-slate-400 font-bold">ទឹកប្រាក់ជំពាក់ឆ្នាំថ្មី</th>

                  {/* ព័ត៌មានការបង់ប្រាក់លើកទី១ */}
                  <th rowSpan={2} className="py-1 px-1 border-r border-slate-400">កាលបរិច្ឆេទ<br/>បង់ប្រាក់</th>
                  <th rowSpan={2} className="py-1 px-1.5 border-r border-slate-400 font-sans">លេខវិក្កយបត្រ</th>
                  <th colSpan={2} className="py-0.5 px-1 border-r border-slate-400">ទឹកប្រាក់បានបង់</th>

                  {/* ព័ត៌មានការបង់ប្រាក់លើកទី២ */}
                  <th rowSpan={2} className="py-1 px-1 border-r border-slate-400">កាលបរិច្ឆេទ<br/>បង់ប្រាក់</th>
                  <th rowSpan={2} className="py-1 px-1.5 border-r border-slate-400 font-sans">លេខវិក្កយបត្រ</th>
                  <th colSpan={2} className="py-0.5 px-1 border-r border-slate-400">ទឹកប្រាក់បានបង់</th>

                  {/* ទឹកប្រាក់បានបង់សរុប */}
                  <th rowSpan={2} className="py-1 px-1 border-r border-slate-400">ថ្លៃឈ្នួលសិក្សា</th>
                  <th rowSpan={2} className="py-1 px-1 border-r border-slate-400">ថ្លៃសេវារដ្ឋបាល</th>

                  {/* ទឹកប្រាក់ជំពាក់ចុងត្រីមាសរុបរួម */}
                  <th colSpan={2} className="py-0.5 px-1 border-r border-slate-400">ទឹកប្រាក់ជំពាក់ចុងត្រា<br/>ឆ្នាំសិក្សាចាស់</th>
                  <th colSpan={8} className="py-0.5 px-1 border-r border-slate-400">ទឹកប្រាក់ជំពាក់ចុងត្រាឆ្នាំថ្មី</th>
                </tr>

                {/* Header Row 3 */}
                <tr className="text-[8px] border-b border-slate-400">
                  {/* បញ្ចុះតម្លៃ ក្នុង១ឆ្នាំ */}
                  <th className="py-0.5 px-1 border-r border-slate-400">%</th>
                  <th className="py-0.5 px-1 border-r border-slate-400">ការលើកទឹកចិត្ត</th>

                  {/* ដើមត្រីមាស - Q1 */}
                  <th className="py-0.5 px-1 border-r border-slate-400">ថ្លៃឈ្នួលសិក្សា</th>
                  <th className="py-0.5 px-1 border-r border-slate-400">ថ្លៃសេវារដ្ឋបាល</th>
                  {/* ដើមត្រីមាស - Q2 */}
                  <th className="py-0.5 px-1 border-r border-slate-400">ថ្លៃឈ្នួលសិក្សា</th>
                  <th className="py-0.5 px-1 border-r border-slate-400">ថ្លៃសេវារដ្ឋបាល</th>
                  {/* ដើមត្រីមាស - Q3 */}
                  <th className="py-0.5 px-1 border-r border-slate-400">ថ្លៃឈ្នួលសិក្សា</th>
                  <th className="py-0.5 px-1 border-r border-slate-400">ថ្លៃសេវារដ្ឋបាល</th>
                  {/* ដើមត្រីមាស - Q4 */}
                  <th className="py-0.5 px-1 border-r border-slate-400">ថ្លៃឈ្នួលសិក្សា</th>
                  <th className="py-0.5 px-1 border-r border-slate-400">ថ្លៃសេវារដ្ឋបាល</th>
                  {/* ដើមត្រីមាស - ឆ្នាំថ្មីសរុប */}
                  <th className="py-0.5 px-1 border-r border-slate-400 font-bold">ថ្លៃឈ្នួលសិក្សា</th>
                  <th className="py-0.5 px-1 border-r border-slate-400 font-bold">ថ្លៃសេវារដ្ឋបាល</th>

                  {/* លើកទី១ ទឹកប្រាក់ */}
                  <th className="py-0.5 px-1 border-r border-slate-400">ថ្លៃឈ្នួលសិក្សា</th>
                  <th className="py-0.5 px-1 border-r border-slate-400">ថ្លៃសេវារដ្ឋបាល</th>

                  {/* លើកទី២ ទឹកប្រាក់ */}
                  <th className="py-0.5 px-1 border-r border-slate-400">ថ្លៃឈ្នួលសិក្សា</th>
                  <th className="py-0.5 px-1 border-r border-slate-400">ថ្លៃសេវារដ្ឋបាល</th>

                  {/* ចុងត្រីមាស - ឆ្នាំចាស់ */}
                  <th className="py-0.5 px-1 border-r border-slate-400">ថ្លៃឈ្នួលសិក្សា</th>
                  <th className="py-0.5 px-1 border-r border-slate-400">ថ្លៃសេវារដ្ឋបាល</th>

                  {/* ចុងត្រីមាស - Q1..Q4 */}
                  <th className="py-0.5 px-1 border-r border-slate-400">ត្រីមាសទី១ (សិក្សា)</th>
                  <th className="py-0.5 px-1 border-r border-slate-400">ត្រីមាសទី១ (សេវា)</th>
                  <th className="py-0.5 px-1 border-r border-slate-400">ត្រីមាសទី២ (សិក្សា)</th>
                  <th className="py-0.5 px-1 border-r border-slate-400">ត្រីមាសទី២ (សេវា)</th>
                  <th className="py-0.5 px-1 border-r border-slate-400">ត្រីមាសទី៣ (សិក្សា)</th>
                  <th className="py-0.5 px-1 border-r border-slate-400">ត្រីមាសទី៣ (សេវា)</th>
                  <th className="py-0.5 px-1 border-r border-slate-400">ត្រីមាសទី៤ (សិក្សា)</th>
                  <th className="py-0.5 px-1 border-r border-slate-400">ត្រីមាសទី៤ (សេវា)</th>
                </tr>
              </thead>

              {/* Body Rows */}
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {filteredEnglish.map((r) => {
                  const hasPaid = (r.totalPaid?.tuition || 0) > 0;
                  return (
                    <tr 
                      key={r.id} 
                      className={`hover:bg-amber-50/50 transition-colors ${
                        hasPaid ? 'bg-emerald-50/20' : ''
                      }`}
                    >
                      <td className="py-1 px-1 text-center font-mono border-r border-slate-300">{r.no}</td>
                      <td className="py-1 px-1.5 font-mono font-medium text-slate-900 border-r border-slate-300">
                        {r.studentCode}
                      </td>
                      <td className="py-1 px-2 font-khmer font-bold text-slate-900 border-r border-slate-300">
                        {r.nameKhmer}
                      </td>
                      <td className="py-1 px-2 font-sans text-slate-700 border-r border-slate-300">
                        {r.nameEnglish}
                      </td>
                      <td className="py-1 px-1 text-center font-mono border-r border-slate-300">{r.gender}</td>
                      <td className="py-1 px-1.5 font-mono text-[9px] text-slate-600 border-r border-slate-300">{r.dob}</td>
                      <td className="py-1 px-1 font-mono text-[9px] text-center border-r border-slate-300">{r.academicYear}</td>
                      <td className="py-1 px-1.5 font-khmer text-center text-slate-600 border-r border-slate-300">{r.status}</td>
                      <td className="py-1 px-1.5 text-right font-mono font-medium border-r border-slate-300">
                        $ {r.fullTuition.toFixed(2)}
                      </td>

                      {/* បញ្ចុះតម្លៃ ក្នុង១ឆ្នាំ (% & ការលើកទឹកចិត្ត) */}
                      <td className="py-1 px-1 text-center font-mono text-slate-700 border-r border-slate-300">
                        {r.discountPercent ? `${r.discountPercent}%` : '-'}
                      </td>
                      <td className="py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300">
                        {r.annualIncentive ? `$ ${r.annualIncentive.toFixed(2)}` : '$ -'}
                      </td>

                      {/* ការលើកទឹកចិត្ត */}
                      <td className="py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300">
                        {r.incentive ? `$ ${r.incentive.toFixed(2)}` : '$ -'}
                      </td>

                      {/* ទឹកប្រាក់ត្រូវបង់ */}
                      <td className="py-1 px-1.5 text-right font-mono font-bold text-slate-900 bg-amber-50/60 border-r border-slate-300">
                        $ {r.amountPayableTuition.toFixed(2)}
                      </td>

                      {/* ទឹកប្រាក់ជំពាក់ឆ្នាំសិក្សាចាស់ (ថ្លៃឈ្នួលសិក្សា & ថ្លៃសេវារដ្ឋបាល) */}
                      <td className="py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300">
                        {r.pastYearDue?.tuition ? `$ ${r.pastYearDue.tuition.toFixed(2)}` : '$ -'}
                      </td>
                      <td className="py-1 px-1 text-right font-mono text-slate-500 border-r border-slate-300">
                        {r.pastYearDue?.adminFee ? `$ ${r.pastYearDue.adminFee.toFixed(2)}` : '$ -'}
                      </td>

                      {/* ទឹកប្រាក់ជំពាក់ដើមត្រីមាស (Q1, Q2, Q3, Q4, NewYearTotal) */}
                      <td className="py-1 px-1 text-right font-mono text-slate-600 border-r border-slate-300">
                        {r.beginningQuarterDue?.q1?.tuition ? `$ ${r.beginningQuarterDue.q1.tuition.toFixed(2)}` : '$ -'}
                      </td>
                      <td className="py-1 px-1 text-right font-mono text-slate-500 border-r border-slate-300">
                        {r.beginningQuarterDue?.q1?.adminFee ? `$ ${r.beginningQuarterDue.q1.adminFee.toFixed(2)}` : '$ -'}
                      </td>
                      <td className="py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300">
                        {r.beginningQuarterDue?.q2?.tuition ? `$ ${r.beginningQuarterDue.q2.tuition.toFixed(2)}` : '$ -'}
                      </td>
                      <td className="py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300">
                        {r.beginningQuarterDue?.q2?.adminFee ? `$ ${r.beginningQuarterDue.q2.adminFee.toFixed(2)}` : '$ -'}
                      </td>
                      <td className="py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300">
                        {r.beginningQuarterDue?.q3?.tuition ? `$ ${r.beginningQuarterDue.q3.tuition.toFixed(2)}` : '$ -'}
                      </td>
                      <td className="py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300">
                        {r.beginningQuarterDue?.q3?.adminFee ? `$ ${r.beginningQuarterDue.q3.adminFee.toFixed(2)}` : '$ -'}
                      </td>
                      <td className="py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300">
                        {r.beginningQuarterDue?.q4?.tuition ? `$ ${r.beginningQuarterDue.q4.tuition.toFixed(2)}` : '$ -'}
                      </td>
                      <td className="py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300">
                        {r.beginningQuarterDue?.q4?.adminFee ? `$ ${r.beginningQuarterDue.q4.adminFee.toFixed(2)}` : '$ -'}
                      </td>
                      <td className="py-1 px-1 text-right font-mono font-bold text-slate-900 border-r border-slate-300">
                        {r.beginningQuarterDue?.newYearTotal?.tuition ? `$ ${r.beginningQuarterDue.newYearTotal.tuition.toFixed(2)}` : '$ -'}
                      </td>
                      <td className="py-1 px-1 text-right font-mono font-bold text-slate-900 border-r border-slate-300">
                        {r.beginningQuarterDue?.newYearTotal?.adminFee ? `$ ${r.beginningQuarterDue.newYearTotal.adminFee.toFixed(2)}` : '$ -'}
                      </td>

                      {/* ព័ត៌មានការបង់ប្រាក់លើកទី១ */}
                      <td className="py-1 px-1 font-mono text-[9px] text-slate-600 border-r border-slate-300">
                        {r.installment1?.date || '$ -'}
                      </td>
                      <td className="py-1 px-1.5 font-mono text-[9px] text-blue-700 border-r border-slate-300">
                        {r.installment1?.invoiceNoTuition || r.installment1?.invoiceNo || '$ -'}
                      </td>
                      <td className="py-1 px-1 text-right font-mono font-medium text-emerald-700 border-r border-slate-300">
                        {r.installment1?.amountTuition ? `$ ${r.installment1.amountTuition.toFixed(2)}` : '$ -'}
                      </td>
                      <td className="py-1 px-1 text-right font-mono font-medium text-emerald-700 border-r border-slate-300">
                        {r.installment1?.amountAdmin ? `$ ${r.installment1.amountAdmin.toFixed(2)}` : '$ -'}
                      </td>

                      {/* ព័ត៌មានការបង់ប្រាក់លើកទី២ */}
                      <td className="py-1 px-1 font-mono text-[9px] text-slate-600 border-r border-slate-300">
                        {r.installment2?.date || '$ -'}
                      </td>
                      <td className="py-1 px-1.5 font-mono text-[9px] text-blue-700 border-r border-slate-300">
                        {r.installment2?.invoiceNoTuition || r.installment2?.invoiceNo || '$ -'}
                      </td>
                      <td className="py-1 px-1 text-right font-mono font-medium text-emerald-700 border-r border-slate-300">
                        {r.installment2?.amountTuition ? `$ ${r.installment2.amountTuition.toFixed(2)}` : '$ -'}
                      </td>
                      <td className="py-1 px-1 text-right font-mono font-medium text-emerald-700 border-r border-slate-300">
                        {r.installment2?.amountAdmin ? `$ ${r.installment2.amountAdmin.toFixed(2)}` : '$ -'}
                      </td>

                      {/* ទឹកប្រាក់បានបង់សរុប (ថ្លៃឈ្នួលសិក្សា & ថ្លៃសេវារដ្ឋបាល) */}
                      <td className="py-1 px-1.5 text-right font-mono font-bold text-emerald-800 bg-emerald-50/50 border-r border-slate-300">
                        {r.totalPaid?.tuition ? `$ ${r.totalPaid.tuition.toFixed(2)}` : '$ -'}
                      </td>
                      <td className="py-1 px-1.5 text-right font-mono font-bold text-emerald-800 bg-emerald-50/50 border-r border-slate-300">
                        {r.totalPaid?.adminFee ? `$ ${r.totalPaid.adminFee.toFixed(2)}` : '$ -'}
                      </td>

                      {/* ចំនួនដង */}
                      <td className="py-1 px-1 text-center font-mono border-r border-slate-300">
                        {r.paymentCount ?? 0}
                      </td>

                      {/* ទឹកប្រាក់ជំពាក់ចុងត្រា (ឆ្នាំចាស់ & Q1..Q4) */}
                      <td className="py-1 px-1 text-right font-mono text-slate-500 border-r border-slate-300">
                        {r.endingQuarterDue?.pastYear?.tuition ? `$ ${r.endingQuarterDue.pastYear.tuition.toFixed(2)}` : '$ -'}
                      </td>
                      <td className="py-1 px-1 text-right font-mono text-slate-500 border-r border-slate-300">
                        {r.endingQuarterDue?.pastYear?.adminFee ? `$ ${r.endingQuarterDue.pastYear.adminFee.toFixed(2)}` : '$ -'}
                      </td>
                      <td className="py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300">
                        {r.endingQuarterDue?.q1?.tuition ? `$ ${r.endingQuarterDue.q1.tuition.toFixed(2)}` : '$ -'}
                      </td>
                      <td className="py-1 px-1 text-right font-mono text-slate-500 border-r border-slate-300">
                        {r.endingQuarterDue?.q1?.adminFee ? `$ ${r.endingQuarterDue.q1.adminFee.toFixed(2)}` : '$ -'}
                      </td>
                      <td className="py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300">
                        {r.endingQuarterDue?.q2?.tuition ? `$ ${r.endingQuarterDue.q2.tuition.toFixed(2)}` : '$ -'}
                      </td>
                      <td className="py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300">
                        {r.endingQuarterDue?.q2?.adminFee ? `$ ${r.endingQuarterDue.q2.adminFee.toFixed(2)}` : '$ -'}
                      </td>
                      <td className="py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300">
                        {r.endingQuarterDue?.q3?.tuition ? `$ ${r.endingQuarterDue.q3.tuition.toFixed(2)}` : '$ -'}
                      </td>
                      <td className="py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300">
                        {r.endingQuarterDue?.q3?.adminFee ? `$ ${r.endingQuarterDue.q3.adminFee.toFixed(2)}` : '$ -'}
                      </td>
                      <td className="py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300">
                        {r.endingQuarterDue?.q4?.tuition ? `$ ${r.endingQuarterDue.q4.tuition.toFixed(2)}` : '$ -'}
                      </td>
                      <td className="py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300">
                        {r.endingQuarterDue?.q4?.adminFee ? `$ ${r.endingQuarterDue.q4.adminFee.toFixed(2)}` : '$ -'}
                      </td>

                      {/* Actions */}
                      <td className="no-print py-1 px-1.5 text-center">
                        <button
                          onClick={() => {
                            const found = students.find(s => s.studentCode === r.studentCode);
                            if (found) {
                              setSelectedStudentId(found.id);
                              setActiveTab('student-profile');
                            }
                          }}
                          className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[9px] font-semibold rounded cursor-pointer transition-colors"
                          title="មើលប្រវត្តិរូបសិស្ស"
                        >
                          Profile
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Totals Footer Matching Screenshot & PDF 1 */}
              <tfoot className="bg-[#fff3a8] font-bold text-slate-900 border-t-2 border-slate-400 font-khmer text-[8.5px]">
                <tr>
                  <td colSpan={8} className="py-2 px-2 text-center border-r border-slate-400 text-xs">
                    ទឹកប្រាក់សរុប ({filteredEnglish.length} សិស្ស)
                  </td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    ${englishTotals.fullTuition.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="border-r border-slate-400"></td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    ${englishTotals.annualIncentive ? englishTotals.annualIncentive.toFixed(2) : '-'}
                  </td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    ${englishTotals.incentive ? englishTotals.incentive.toFixed(2) : '-'}
                  </td>
                  <td className="py-2 px-1.5 text-right font-mono bg-amber-200/70 border-r border-slate-400">
                    ${englishTotals.amountPayableTuition.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>

                  {/* ជំពាក់ឆ្នាំចាស់ */}
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    ${englishTotals.pastYearTuition.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    ${englishTotals.pastYearAdmin.toFixed(2)}
                  </td>

                  {/* ដើមត្រីមាស */}
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    ${englishTotals.begQ1Tuition.toFixed(2)}
                  </td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    ${englishTotals.begQ1Admin.toFixed(2)}
                  </td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    ${englishTotals.begQ2Tuition.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    ${englishTotals.begQ2Admin.toFixed(2)}
                  </td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    ${englishTotals.begQ3Tuition.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    ${englishTotals.begQ3Admin.toFixed(2)}
                  </td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    ${englishTotals.begQ4Tuition.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    ${englishTotals.begQ4Admin.toFixed(2)}
                  </td>
                  <td className="py-2 px-1 text-right font-mono font-bold border-r border-slate-400">
                    ${englishTotals.begNewYearTuition.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-1 text-right font-mono font-bold border-r border-slate-400">
                    ${englishTotals.begNewYearAdmin.toFixed(2)}
                  </td>

                  {/* លើកទី១ */}
                  <td colSpan={2} className="border-r border-slate-400"></td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    ${englishTotals.inst1Tuition.toFixed(2)}
                  </td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    ${englishTotals.inst1Admin.toFixed(2)}
                  </td>

                  {/* លើកទី២ */}
                  <td colSpan={2} className="border-r border-slate-400"></td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    ${englishTotals.inst2Tuition.toFixed(2)}
                  </td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    ${englishTotals.inst2Admin.toFixed(2)}
                  </td>

                  {/* ទឹកប្រាក់បានបង់សរុប */}
                  <td className="py-2 px-1.5 text-right font-mono text-emerald-900 bg-emerald-200/80 border-r border-slate-400">
                    ${englishTotals.totPaidTuition.toFixed(2)}
                  </td>
                  <td className="py-2 px-1.5 text-right font-mono text-emerald-900 bg-emerald-200/80 border-r border-slate-400">
                    ${englishTotals.totPaidAdmin.toFixed(2)}
                  </td>

                  {/* ចំនួនដង */}
                  <td className="py-2 px-1 text-center font-mono border-r border-slate-400">
                    {englishTotals.paymentCount}
                  </td>

                  {/* ជំពាក់ចុងត្រីមាស */}
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    ${englishTotals.endPastYearTuition.toFixed(2)}
                  </td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    ${englishTotals.endPastYearAdmin.toFixed(2)}
                  </td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    ${englishTotals.endQ1Tuition.toFixed(2)}
                  </td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    ${englishTotals.endQ1Admin.toFixed(2)}
                  </td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    ${englishTotals.endQ2Tuition.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    ${englishTotals.endQ2Admin.toFixed(2)}
                  </td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    ${englishTotals.endQ3Tuition.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    ${englishTotals.endQ3Admin.toFixed(2)}
                  </td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    ${englishTotals.endQ4Tuition.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    ${englishTotals.endQ4Admin.toFixed(2)}
                  </td>
                  <td className="no-print"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer Signatures Matching Original PDF 1 */}
          <div className="mt-8 flex justify-between items-start text-xs font-khmer text-slate-800 px-8">
            <div className="text-center">
              <p className="font-semibold">បានឃើញ និងពិនិត្យត្រឹមត្រូវ</p>
              <p className="font-bold text-slate-900 mt-0.5">នាយកសាលា (School Director)</p>
              <div className="h-16 flex items-center justify-center italic text-slate-400 text-[11px]">[ហត្ថលេខា]</div>
              <p className="font-semibold text-slate-900">{selectedBranch.directorName}</p>
            </div>

            <div className="text-center">
              <p className="text-slate-600">ខេត្តសៀមរាប ថ្ងៃទី០១ ខែមិថុនា ឆ្នាំ២០២៦</p>
              <p className="font-bold text-slate-900 mt-0.5">បុគ្គលិកទទួលបន្ទុកបំណុល (Billing Officer)</p>
              <div className="h-16 flex items-center justify-center italic text-slate-400 text-[11px]">[ហត្ថលេខា]</div>
              <p className="font-semibold text-slate-900">ឌីក ស្រី</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
