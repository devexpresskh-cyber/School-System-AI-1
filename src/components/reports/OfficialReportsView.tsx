import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Logo } from '../common/Logo';
import { Printer, FileSpreadsheet, Download, Building, Table, Calendar, Clock, TrendingUp } from 'lucide-react';
import { DueReportsMatrix } from '../finance/DueReportsMatrix';
import * as XLSX from 'xlsx';
import { 
  getSemesterConfig, 
  classifyInvoiceSemester, 
  calculateSemesterFinancialPartition, 
  formatKhmerDate 
} from '../../utils/semesterUtils';

export const OfficialReportsView: React.FC = () => {
  const { 
    selectedBranch, 
    branches, 
    currentBranchId, 
    setCurrentBranchId, 
    settings, 
    branchPayments, 
    branchStudents 
  } = useSchool();

  const [activeReport, setActiveReport] = useState<
    'due-matrix' | 'arrears-summary' | 'semester-partition' | 'daily-settlement' | 'monthly-revenue'
  >('due-matrix');

  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>(settings.activeAcademicYear || '2025-2026');
  const [reportDate, setReportDate] = useState('2026-05-31');
  const [reportDateKhmer, setReportDateKhmer] = useState('៣១-ឧសភា-២០២៦');

  const handlePrint = () => {
    window.print();
  };

  // Grade groupings matching screenshot (image 10-48-16 & 10-49-49)
  const gradeSummaryRows = [
    { no: '01', level: 'K1', year: '2025-2026', students: 11, pastDue: 0, pastAdmin: 0, q1Tuition: 106.67, q1Admin: 0, q2Tuition: 992.00, q2Admin: 175.00, q3Tuition: 1523.25, q3Admin: 250.00, q4Tuition: 1523.25, q4Admin: 250.00, total: 4820.17 },
    { no: '02', level: 'K2', year: '2025-2026', students: 9, pastDue: 0, pastAdmin: 0, q1Tuition: 0, q1Admin: 0, q2Tuition: 696.00, q2Admin: 125.00, q3Tuition: 1296.00, q3Admin: 225.00, q4Tuition: 1296.00, q4Admin: 225.00, total: 3863.00 },
    { no: '03', level: 'K3', year: '2025-2026', students: 22, pastDue: 240.00, pastAdmin: 75.00, q1Tuition: 240.00, q1Admin: 75.00, q2Tuition: 2136.00, q2Admin: 400.00, q3Tuition: 3003.38, q3Admin: 475.00, q4Tuition: 3003.38, q4Admin: 475.00, total: 10122.75 },
    { no: '04', level: 'First step', year: '2025-2026', students: 17, pastDue: 0, pastAdmin: 0, q1Tuition: 160.00, q1Admin: 25.00, q2Tuition: 1648.00, q2Admin: 275.00, q3Tuition: 2395.25, q3Admin: 350.00, q4Tuition: 2395.25, q4Admin: 350.00, total: 7598.50 },
    { no: '05', level: 'Junior', year: '2025-2026', students: 11, pastDue: 0, pastAdmin: 0, q1Tuition: 0, q1Admin: 0, q2Tuition: 1636.25, q2Admin: 250.00, q3Tuition: 1761.88, q3Admin: 250.00, q4Tuition: 1761.88, q4Admin: 250.00, total: 5910.00 },
    { no: '06', level: 'Primary', year: '2025-2026', students: 13, pastDue: 0, pastAdmin: 0, q1Tuition: 0, q1Admin: 0, q2Tuition: 1566.25, q2Admin: 275.00, q3Tuition: 1916.25, q3Admin: 325.00, q4Tuition: 1916.25, q4Admin: 325.00, total: 6323.75 },
    { no: '07', level: 'ថ្នាក់ទី៧', year: '2025-2026', students: 8, pastDue: 0, pastAdmin: 0, q1Tuition: 0, q1Admin: 0, q2Tuition: 743.40, q2Admin: 0, q3Tuition: 1200.00, q3Admin: 150.00, q4Tuition: 1200.00, q4Admin: 150.00, total: 3293.40 },
    { no: '08', level: 'ថ្នាក់ទី៨', year: '2025-2026', students: 13, pastDue: 78.80, pastAdmin: 0, q1Tuition: 0, q1Admin: 0, q2Tuition: 3129.15, q2Admin: 400.00, q3Tuition: 2100.00, q3Admin: 300.00, q4Tuition: 2100.00, q4Admin: 300.00, total: 8107.95 },
    { no: '09', level: 'ថ្នាក់ទី១២', year: '2025-2026', students: 15, pastDue: 3217.30, pastAdmin: 0, q1Tuition: 1472.00, q1Admin: 0, q2Tuition: 5424.62, q2Admin: 600.00, q3Tuition: 3100.00, q3Admin: 400.00, q4Tuition: 3100.00, q4Admin: 400.00, total: 17313.92 }
  ];

  const totalStudents = gradeSummaryRows.reduce((sum, r) => sum + r.students, 0);
  const totalArrearsAll = gradeSummaryRows.reduce((sum, r) => sum + r.total, 0);

  const handleExportOfficialArrearsXLS = () => {
    const data = gradeSummaryRows.map(r => ({
      'No': r.no,
      'Grade Level': r.level,
      'Academic Year': r.year,
      'Student Count': r.students,
      'Past Due Tuition': r.pastDue,
      'Past Due Admin': r.pastAdmin,
      'Term 1 Tuition': r.q1Tuition,
      'Term 1 Admin': r.q1Admin,
      'Term 2 Tuition': r.q2Tuition,
      'Term 2 Admin': r.q2Admin,
      'Term 3 Tuition': r.q3Tuition,
      'Term 3 Admin': r.q3Admin,
      'Term 4 Tuition': r.q4Tuition,
      'Term 4 Admin': r.q4Admin,
      'Total Arrears ($)': r.total
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tuition Arrears');
    XLSX.writeFile(workbook, `FBIS_Official_Arrears_${selectedBranch.code}.xlsx`);
  };

  // Semester Partition Calculations for Official Report
  const semesterConfig = getSemesterConfig(settings, selectedAcademicYear);
  const targetYearPayments = branchPayments.filter(p => !selectedAcademicYear || p.academicYear === selectedAcademicYear || p.academicYear === selectedAcademicYear.slice(0, 4));
  const activePayments = targetYearPayments.length > 0 ? targetYearPayments : branchPayments;
  const semesterPartitionStats = calculateSemesterFinancialPartition(activePayments, semesterConfig);

  const semesterGradeRows = settings.gradeLevels.map((lvl, idx) => {
    const gradePayments = activePayments.filter(p => p.classGrade === lvl || p.classGrade?.includes(lvl));
    const gradeStats = calculateSemesterFinancialPartition(gradePayments, semesterConfig);
    const gradeStudents = branchStudents.filter(s => s.classGrade === lvl || s.classGrade?.includes(lvl)).length;
    return {
      no: String(idx + 1).padStart(2, '0'),
      level: lvl,
      students: gradeStudents,
      s1Income: gradeStats.semester1.incomeUSD,
      s1Debt: gradeStats.semester1.debtUSD,
      s2Income: gradeStats.semester2.incomeUSD,
      s2Debt: gradeStats.semester2.debtUSD,
      totalIncome: gradeStats.total.incomeUSD,
      totalDebt: gradeStats.total.debtUSD,
      totalPayable: gradeStats.total.incomeUSD + gradeStats.total.debtUSD,
      rate: (gradeStats.total.incomeUSD + gradeStats.total.debtUSD) > 0 
        ? Math.round((gradeStats.total.incomeUSD / (gradeStats.total.incomeUSD + gradeStats.total.debtUSD)) * 100) 
        : 100
    };
  }).filter(r => r.students > 0 || r.totalPayable > 0);

  const handleExportSemesterPartitionXLS = () => {
    const data = semesterGradeRows.map(r => ({
      'No': r.no,
      'Grade Level': r.level,
      'Student Count': r.students,
      'Semester 1 Income ($)': r.s1Income,
      'Semester 1 Debt ($)': r.s1Debt,
      'Semester 2 Income ($)': r.s2Income,
      'Semester 2 Debt ($)': r.s2Debt,
      'Annual Income ($)': r.totalIncome,
      'Annual Debt ($)': r.totalDebt,
      'Collection Rate (%)': `${r.rate}%`
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Semester Partition');
    XLSX.writeFile(workbook, `FBIS_Semester_Partition_${selectedAcademicYear}_${selectedBranch.code}.xlsx`);
  };

  return (
    <div className="space-y-4">
      {/* Top Selector Navigation - Hidden on Print */}
      <div className="no-print bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveReport('due-matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeReport === 'due-matrix'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>របាយការណ៍សិស្សជំពាក់ (Due Report: Khmer & English)</span>
          </button>

          <button
            onClick={() => setActiveReport('arrears-summary')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeReport === 'arrears-summary'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            សរុបជំពាក់តាមកម្រិតថ្នាក់ (Arrears by Grade)
          </button>

          <button
            onClick={() => setActiveReport('semester-partition')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeReport === 'semester-partition'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>បែងចែកចំណូល & បំណុលតាមឆមាស (Semester Partition)</span>
          </button>

          <button
            onClick={() => setActiveReport('daily-settlement')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeReport === 'daily-settlement'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            របាយការណ៍សាច់ប្រាក់ប្រចាំថ្ងៃ (Daily Cash & Bank)
          </button>

          <button
            onClick={() => setActiveReport('monthly-revenue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeReport === 'monthly-revenue'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ចំណូលប្រចាំខែ (Monthly Revenue Breakdown)
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={activeReport === 'semester-partition' ? handleExportSemesterPartitionXLS : handleExportOfficialArrearsXLS}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-slate-300 transition-colors shadow-2xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export XLS</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Document (បោះពុម្ព)</span>
          </button>
        </div>
      </div>

      {/* REPORT 0: DETAILED DUE REPORTS MATRIX (Khmer & English Programs matching screenshots) */}
      {activeReport === 'due-matrix' && (
        <DueReportsMatrix />
      )}

      {/* REPORT 1: OFFICIAL ARREARS SUMMARY (Matching Screenshots image 10-48-16 & 10-49-49) */}
      {activeReport === 'arrears-summary' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-8 print:p-0 print:border-none print:shadow-none text-slate-900 font-sans">
          {/* Official Kingdom Header */}
          <div className="text-center mb-6">
            <div className="text-sm font-bold font-khmer text-slate-800">ព្រះរាជាណាចក្រកម្ពុជា</div>
            <div className="text-sm font-bold font-khmer text-slate-800">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
            <div className="w-24 h-0.5 bg-amber-500 mx-auto my-2" />
          </div>

          {/* School Header */}
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-300">
            <div className="flex items-center gap-3">
              <Logo size="lg" branchNumber={selectedBranch.code.replace('FBIS ', '')} />
              <div>
                <div className="text-xs font-bold font-khmer text-blue-900">
                  {settings.schoolNameKhmer}
                </div>
                <div className="text-[10px] font-black text-red-600 tracking-wider">
                  {settings.schoolNameEnglish}
                </div>
              </div>
            </div>

            <div className="text-right text-xs">
              <span className="font-bold font-khmer text-slate-700">{selectedBranch.nameKhmer}</span>
              <div className="text-[11px] text-slate-500 font-mono">Campus Code: {selectedBranch.code}</div>
            </div>
          </div>

          {/* Report Title exactly matching screenshot (image 10-48-16) */}
          <div className="text-center mb-5">
            <h2 className="text-sm md:text-base font-bold font-khmer text-slate-900">
              របាយការណ៍សរុបថវិកាសិស្សជំពាក់ថ្លៃឈ្នួលសិក្សា សម្រាប់កម្មវិធីបណ្តុះបណ្តាលភាសាអង់គ្លេសទូទៅ {selectedBranch.nameKhmer} គិតត្រឹម {reportDateKhmer}
            </h2>
            <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
              SUMMARY REPORT OF OUTSTANDING TUITION ARREARS - GENERAL ENGLISH PROGRAM
            </div>
          </div>

          {/* Table matching screenshot table color (ochre/khaki header: #b59b58 or #a89456) */}
          <div className="overflow-x-auto border border-slate-400">
            <table className="w-full text-[11px] text-left border-collapse border border-slate-400 whitespace-nowrap">
              <thead>
                <tr className="bg-[#bfa76f] text-slate-900 font-bold font-khmer text-center">
                  <th rowSpan={3} className="border border-slate-500 px-2 py-2 w-8">ល.រ</th>
                  <th rowSpan={3} className="border border-slate-500 px-3 py-2">កម្រិត</th>
                  <th rowSpan={3} className="border border-slate-500 px-3 py-2">ឆ្នាំសិក្សា</th>
                  <th rowSpan={3} className="border border-slate-500 px-2 py-2">ចំនួនសិស្ស</th>
                  <th colSpan={2} rowSpan={2} className="border border-slate-500 px-2 py-1">ទឹកប្រាក់ជំពាក់ថ្នាក់សិក្សាចាស់</th>
                  <th colSpan={8} className="border border-slate-500 px-2 py-1">ទឹកប្រាក់ជំពាក់ថ្នាក់សិក្សាថ្មី</th>
                  <th rowSpan={3} className="border border-slate-500 px-3 py-2">ទឹកប្រាក់សរុប</th>
                  <th rowSpan={3} className="border border-slate-500 px-2 py-2">ផ្សេងៗ</th>
                </tr>
                <tr className="bg-[#bfa76f] text-slate-900 font-bold font-khmer text-center">
                  <th colSpan={2} className="border border-slate-500 px-2 py-1">ត្រីមាសទី១</th>
                  <th colSpan={2} className="border border-slate-500 px-2 py-1">ត្រីមាសទី២</th>
                  <th colSpan={2} className="border border-slate-500 px-2 py-1">ត្រីមាសទី៣</th>
                  <th colSpan={2} className="border border-slate-500 px-2 py-1">ត្រីមាសទី៤</th>
                </tr>
                <tr className="bg-[#d2bf8f] text-slate-900 font-semibold font-khmer text-center text-[10px]">
                  <th className="border border-slate-500 px-1 py-1">ថ្លៃឈ្នួលសិក្សា</th>
                  <th className="border border-slate-500 px-1 py-1">ថ្លៃសេវាអន្តរជាតិ</th>
                  <th className="border border-slate-500 px-1 py-1">ថ្លៃឈ្នួលសិក្សា</th>
                  <th className="border border-slate-500 px-1 py-1">ថ្លៃសេវាអន្តរជាតិ</th>
                  <th className="border border-slate-500 px-1 py-1">ថ្លៃឈ្នួលសិក្សា</th>
                  <th className="border border-slate-500 px-1 py-1">ថ្លៃសេវាអន្តរជាតិ</th>
                  <th className="border border-slate-500 px-1 py-1">ថ្លៃឈ្នួលសិក្សា</th>
                  <th className="border border-slate-500 px-1 py-1">ថ្លៃសេវាអន្តរជាតិ</th>
                  <th className="border border-slate-500 px-1 py-1">ថ្លៃឈ្នួលសិក្សា</th>
                  <th className="border border-slate-500 px-1 py-1">ថ្លៃសេវាអន្តរជាតិ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {gradeSummaryRows.map((r) => (
                  <tr key={r.no} className="hover:bg-slate-50">
                    <td className="border border-slate-400 px-2 py-1.5 text-center font-mono">{r.no}</td>
                    <td className="border border-slate-400 px-3 py-1.5 font-bold font-khmer">{r.level}</td>
                    <td className="border border-slate-400 px-3 py-1.5 font-mono text-center">{r.year}</td>
                    <td className="border border-slate-400 px-2 py-1.5 text-center font-mono font-bold">{r.students}</td>
                    <td className="border border-slate-400 px-2 py-1.5 text-right font-mono">{r.pastDue > 0 ? `$ ${r.pastDue.toFixed(2)}` : '$ -'}</td>
                    <td className="border border-slate-400 px-2 py-1.5 text-right font-mono">{r.pastAdmin > 0 ? `$ ${r.pastAdmin.toFixed(2)}` : '$ -'}</td>
                    <td className="border border-slate-400 px-2 py-1.5 text-right font-mono">{r.q1Tuition > 0 ? `$ ${r.q1Tuition.toFixed(2)}` : '$ -'}</td>
                    <td className="border border-slate-400 px-2 py-1.5 text-right font-mono">{r.q1Admin > 0 ? `$ ${r.q1Admin.toFixed(2)}` : '$ -'}</td>
                    <td className="border border-slate-400 px-2 py-1.5 text-right font-mono font-medium">{r.q2Tuition > 0 ? `$ ${r.q2Tuition.toFixed(2)}` : '$ -'}</td>
                    <td className="border border-slate-400 px-2 py-1.5 text-right font-mono">{r.q2Admin > 0 ? `$ ${r.q2Admin.toFixed(2)}` : '$ -'}</td>
                    <td className="border border-slate-400 px-2 py-1.5 text-right font-mono font-medium">{r.q3Tuition > 0 ? `$ ${r.q3Tuition.toFixed(2)}` : '$ -'}</td>
                    <td className="border border-slate-400 px-2 py-1.5 text-right font-mono">{r.q3Admin > 0 ? `$ ${r.q3Admin.toFixed(2)}` : '$ -'}</td>
                    <td className="border border-slate-400 px-2 py-1.5 text-right font-mono font-medium">{r.q4Tuition > 0 ? `$ ${r.q4Tuition.toFixed(2)}` : '$ -'}</td>
                    <td className="border border-slate-400 px-2 py-1.5 text-right font-mono">{r.q4Admin > 0 ? `$ ${r.q4Admin.toFixed(2)}` : '$ -'}</td>
                    <td className="border border-slate-400 px-3 py-1.5 text-right font-mono font-bold text-slate-900 bg-amber-50/50">
                      $ {r.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="border border-slate-400 px-2 py-1.5 text-center text-slate-400">-</td>
                  </tr>
                ))}
              </tbody>
              {/* Grand Total Row */}
              <tfoot className="bg-[#bfa76f] text-slate-950 font-bold border-t-2 border-slate-600">
                <tr>
                  <td colSpan={3} className="border border-slate-500 px-3 py-2 text-center font-khmer">
                    សរុបថវិកាសិស្សជំពាក់ (Grand Total)
                  </td>
                  <td className="border border-slate-500 px-2 py-2 text-center font-mono">{totalStudents}</td>
                  <td className="border border-slate-500 px-2 py-2 text-right font-mono">$ 240.00</td>
                  <td className="border border-slate-500 px-2 py-2 text-right font-mono">$ 75.00</td>
                  <td className="border border-slate-500 px-2 py-2 text-right font-mono">$ 506.67</td>
                  <td className="border border-slate-500 px-2 py-2 text-right font-mono">$ 100.00</td>
                  <td className="border border-slate-500 px-2 py-2 text-right font-mono">$ 8,674.50</td>
                  <td className="border border-slate-500 px-2 py-2 text-right font-mono">$ 1,500.00</td>
                  <td className="border border-slate-500 px-2 py-2 text-right font-mono">$ 11,896.00</td>
                  <td className="border border-slate-500 px-2 py-2 text-right font-mono">$ 1,875.00</td>
                  <td className="border border-slate-500 px-2 py-2 text-right font-mono">$ 11,896.00</td>
                  <td className="border border-slate-500 px-2 py-2 text-right font-mono">$ 1,875.00</td>
                  <td className="border border-slate-500 px-3 py-2 text-right font-mono text-xs font-black">
                    $ {totalArrearsAll.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="border border-slate-500"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Official Endorsement Signatures Grid matching Screenshot image 10-48-16 */}
          <div className="grid grid-cols-3 gap-8 mt-10 text-center text-xs">
            {/* Top row 3 signatures */}
            <div>
              <div className="font-khmer font-bold text-slate-800">បានឃើញ និងគោរពជូន</div>
              <div className="font-khmer text-slate-700 mt-0.5">ប្រធានការិ. គណនេយ្យ និងហិរញ្ញវត្ថុ</div>
              <div className="font-khmer text-slate-500 text-[11px]">ខេត្តសៀមរាប ថ្ងៃទី០១ ខែមិថុនា ឆ្នាំ២០២៦</div>
              <div className="font-khmer text-[11px] text-slate-600 mt-0.5">អនុប្រធានការិ. គណនេយ្យ និងហិរញ្ញវត្ថុ</div>
              <div className="h-16 flex items-end justify-center font-khmer font-bold text-slate-800">
                ចន សុភ័ក្រ
              </div>
            </div>

            <div>
              <div className="font-khmer font-bold text-slate-800">បានឃើញ និងបញ្ជូនមក</div>
              <div className="font-khmer text-slate-700 mt-0.5">អនុប្រធានការិ. គណនេយ្យ និងហិរញ្ញវត្ថុ</div>
              <div className="font-khmer text-slate-500 text-[11px]">ខេត្តសៀមរាប ថ្ងៃទី០១ ខែមិថុនា ឆ្នាំ២០២៦</div>
              <div className="font-khmer text-[11px] text-slate-600 mt-0.5">គណនេយ្យករ</div>
              <div className="h-16 flex items-end justify-center font-khmer font-bold text-slate-800">
                ស្រី ណុច
              </div>
            </div>

            <div>
              <div className="font-khmer text-slate-500 text-[11px]">ថ្ងៃចន្ទ ១រោច ខែជេស្ឋ ឆ្នាំម្សាញ់ ស័ក ព.ស ២៥៧០</div>
              <div className="font-khmer text-slate-500 text-[11px]">ខេត្តសៀមរាប ថ្ងៃទី០១ ខែមិថុនា ឆ្នាំ២០២៦</div>
              <div className="font-khmer font-bold text-slate-700 mt-0.5">បុគ្គលិកទទួលបន្ទុកបំណុល</div>
              <div className="h-16 flex items-end justify-center font-khmer font-bold text-slate-800">
                ជីក កាន
              </div>
            </div>

            {/* Bottom row 3 director signatures */}
            <div>
              <div className="font-khmer font-bold text-slate-800">បានឃើញ និងឯកភាព</div>
              <div className="font-khmer text-slate-500 text-[11px]">ខេត្តសៀមរាប ថ្ងៃទី០១ ខែមិថុនា ឆ្នាំ២០២៦</div>
              <div className="font-khmer font-bold text-slate-700 mt-0.5">ប្រធាននាយកដ្ឋាន</div>
              <div className="h-16 flex items-end justify-center font-khmer font-bold text-slate-800">
                ម៉ាន់ វុទ្ធី
              </div>
            </div>

            <div>
              <div className="font-khmer font-bold text-slate-800">បានឃើញ និងគោរពជូន</div>
              <div className="font-khmer text-slate-700 mt-0.5">ប្រធាននាយកដ្ឋាន</div>
              <div className="font-khmer text-slate-500 text-[11px]">ខេត្តសៀមរាប ថ្ងៃទី០១ ខែមិថុនា ឆ្នាំ២០២៦</div>
              <div className="font-khmer text-[11px] text-slate-600 mt-0.5">អនុប្រធាននាយកដ្ឋាន</div>
              <div className="h-16 flex items-end justify-center font-khmer font-bold text-slate-800">
                ប្រេង ចាន់សេដ្ធា
              </div>
            </div>

            <div>
              <div className="font-khmer font-bold text-slate-800">បានឃើញ និងគោរពជូន</div>
              <div className="font-khmer text-slate-700 mt-0.5">អនុប្រធាននាយកដ្ឋាន</div>
              <div className="font-khmer text-slate-500 text-[11px]">ខេត្តសៀមរាប ថ្ងៃទី០១ ខែមិថុនា ឆ្នាំ២០២៦</div>
              <div className="font-khmer text-[11px] text-slate-600 mt-0.5">ប្រធានការិ. គណនេយ្យ និងហិរញ្ញវត្ថុ</div>
              <div className="h-16 flex items-end justify-center font-khmer font-bold text-slate-800">
                សុំយន កក្កដា
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 2: DAILY CASH & BANK SETTLEMENT (Matching Screenshot image 10-46-04) */}
      {activeReport === 'daily-settlement' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-8 print:p-0 print:border-none print:shadow-none text-slate-900 font-sans">
          <div className="text-center mb-6">
            <div className="text-sm font-bold font-khmer text-slate-800">ព្រះរាជាណាចក្រកម្ពុជា</div>
            <div className="text-sm font-bold font-khmer text-slate-800">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
            <div className="w-20 h-0.5 bg-amber-500 mx-auto my-2" />
          </div>

          <div className="text-center mb-6">
            <Logo size="lg" className="justify-center mb-2" />
            <h1 className="text-sm font-bold font-khmer text-blue-900">{settings.schoolNameKhmer}</h1>
            <h2 className="text-xs font-black text-red-600">{settings.schoolNameEnglish}</h2>
            <div className="mt-3 text-base font-bold font-khmer text-slate-900">
              របាយការណ៍ទទួលសាច់ប្រាក់
            </div>
            <div className="text-xs text-slate-600 font-mono mt-0.5">
              សម្រាប់ថ្ងៃទី: 22/10/2026 ដល់ថ្ងៃទី: 22/10/2026 ({selectedBranch.nameKhmer})
            </div>
          </div>

          <table className="w-full border-collapse border border-slate-400 text-xs mb-8">
            <thead>
              <tr className="bg-slate-100 font-bold font-khmer text-center">
                <th rowSpan={2} className="border border-slate-400 px-3 py-2 w-10">ល.រ</th>
                <th rowSpan={2} className="border border-slate-400 px-4 py-2 text-left">ឈ្មោះបុគ្គលិក / Cashier</th>
                <th colSpan={2} className="border border-slate-400 px-3 py-1">សាច់ប្រាក់សុទ្ធ (Cash)</th>
                <th colSpan={4} className="border border-slate-400 px-3 py-1">សាច់ប្រាក់ក្នុងធនាគារ (Bank Deposit)</th>
                <th rowSpan={2} className="border border-slate-400 px-3 py-2">ផ្សេងៗ</th>
              </tr>
              <tr className="bg-slate-50 font-semibold font-khmer text-center text-[11px]">
                <th className="border border-slate-400 px-2 py-1">រៀល (KHR)</th>
                <th className="border border-slate-400 px-2 py-1">ដុល្លារ (USD)</th>
                <th className="border border-slate-400 px-2 py-1">ABA</th>
                <th className="border border-slate-400 px-2 py-1">ACLEDA</th>
                <th className="border border-slate-400 px-2 py-1">RHB</th>
                <th className="border border-slate-400 px-2 py-1">PUBLIC BANK</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 font-mono text-center">
              <tr>
                <td className="border border-slate-400 py-2">1</td>
                <td className="border border-slate-400 py-2 px-3 text-left font-khmer font-medium">ហាន់ ស្រីខួច</td>
                <td className="border border-slate-400 py-2">0.00</td>
                <td className="border border-slate-400 py-2">350.00</td>
                <td className="border border-slate-400 py-2">1,240.00</td>
                <td className="border border-slate-400 py-2">450.00</td>
                <td className="border border-slate-400 py-2">0.00</td>
                <td className="border border-slate-400 py-2">0.00</td>
                <td className="border border-slate-400 py-2 text-slate-400">-</td>
              </tr>
              <tr>
                <td className="border border-slate-400 py-2">2</td>
                <td className="border border-slate-400 py-2 px-3 text-left font-khmer font-medium">ចម សុភ័ណ្ឌ</td>
                <td className="border border-slate-400 py-2">123,000</td>
                <td className="border border-slate-400 py-2">200.00</td>
                <td className="border border-slate-400 py-2">860.00</td>
                <td className="border border-slate-400 py-2">173.00</td>
                <td className="border border-slate-400 py-2">472.80</td>
                <td className="border border-slate-400 py-2">255.50</td>
                <td className="border border-slate-400 py-2 text-slate-400">-</td>
              </tr>
              <tr>
                <td className="border border-slate-400 py-2">3</td>
                <td className="border border-slate-400 py-2 px-3 text-left font-khmer font-medium">ស្រី ណុច (Campus 02)</td>
                <td className="border border-slate-400 py-2">0.00</td>
                <td className="border border-slate-400 py-2">427.00</td>
                <td className="border border-slate-400 py-2">2,150.00</td>
                <td className="border border-slate-400 py-2">0.00</td>
                <td className="border border-slate-400 py-2">0.00</td>
                <td className="border border-slate-400 py-2">0.00</td>
                <td className="border border-slate-400 py-2 text-slate-400">-</td>
              </tr>
            </tbody>
            <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-500 font-mono text-center">
              <tr>
                <td colSpan={2} className="border border-slate-400 py-2 font-khmer text-left px-3">សរុប (Total)</td>
                <td className="border border-slate-400 py-2">123,000 ៛</td>
                <td className="border border-slate-400 py-2">$ 977.00</td>
                <td className="border border-slate-400 py-2">$ 4,250.00</td>
                <td className="border border-slate-400 py-2">$ 623.00</td>
                <td className="border border-slate-400 py-2">$ 472.80</td>
                <td className="border border-slate-400 py-2">$ 255.50</td>
                <td className="border border-slate-400"></td>
              </tr>
            </tfoot>
          </table>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-12 mt-12 text-center text-xs">
            <div>
              <div className="font-khmer text-slate-500">សៀមរាប ថ្ងៃទី ២២ ខែ តុលា ឆ្នាំ២០២៦</div>
              <div className="font-khmer font-bold text-slate-800 text-sm mt-1">គណនេយ្យករ</div>
              <div className="h-20 flex items-end justify-center font-khmer font-bold">
                ស្រី ណុច
              </div>
            </div>

            <div>
              <div className="font-khmer text-slate-500">សៀមរាប ថ្ងៃទី ២២ ខែ តុលា ឆ្នាំ២០២៦</div>
              <div className="font-khmer font-bold text-slate-800 text-sm mt-1">អ្នករៀបចំរបាយការណ៍</div>
              <div className="h-20 flex items-end justify-center font-khmer font-bold">
                ចម សុភ័ណ្ឌ
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 3: MONTHLY REVENUE (Matching Screenshot image 10-43-59) */}
      {activeReport === 'monthly-revenue' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-8 print:p-0 print:border-none print:shadow-none text-slate-900 font-sans">
          <div className="text-center mb-6">
            <Logo size="lg" className="justify-center mb-2" />
            <h1 className="text-sm font-bold font-khmer text-blue-900">{settings.schoolNameKhmer}</h1>
            <h2 className="text-xs font-black text-red-600">{settings.schoolNameEnglish}</h2>
            <div className="mt-3 text-base font-bold font-khmer text-slate-900">
              របាយការណ៍ចំណូលបំបែកតាមខែ (Monthly Revenue Breakdown)
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Jan 01, 2026 ~ Dec 31, 2026 · {selectedBranch.nameEnglish}
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-300">
            <table className="w-full text-xs text-left border-collapse border border-slate-300 whitespace-nowrap">
              <thead>
                <tr className="bg-slate-100 font-bold font-mono text-center text-[11px]">
                  <th className="border border-slate-300 px-3 py-2 text-left">INVNO</th>
                  <th className="border border-slate-300 px-3 py-2 text-right">AMOUNT</th>
                  <th className="border border-slate-300 px-3 py-2 text-right">DISCOUNT</th>
                  <th className="border border-slate-300 px-3 py-2 text-right">PAID</th>
                  <th className="border border-slate-300 px-3 py-2 text-right">DUE</th>
                  <th className="border border-slate-300 px-2 py-2">JAN</th>
                  <th className="border border-slate-300 px-2 py-2">FEB</th>
                  <th className="border border-slate-300 px-2 py-2">MAR</th>
                  <th className="border border-slate-300 px-2 py-2">APR</th>
                  <th className="border border-slate-300 px-2 py-2">MAY</th>
                  <th className="border border-slate-300 px-2 py-2">JUN</th>
                  <th className="border border-slate-300 px-2 py-2">JUL</th>
                  <th className="border border-slate-300 px-2 py-2">AUG</th>
                  <th className="border border-slate-300 px-2 py-2">SEP</th>
                  <th className="border border-slate-300 px-2 py-2">OCT</th>
                  <th className="border border-slate-300 px-2 py-2">NOV</th>
                  <th className="border border-slate-300 px-2 py-2">DEC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-right text-[11px]">
                {branchPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="border border-slate-300 px-3 py-2 text-left font-bold text-slate-900">
                      {p.invoiceNumber}
                    </td>
                    <td className="border border-slate-300 px-3 py-2">${p.fullAmount.toFixed(2)}</td>
                    <td className="border border-slate-300 px-3 py-2">{p.discountPercent}%</td>
                    <td className="border border-slate-300 px-3 py-2 text-emerald-700 font-bold">${p.paidUSD.toFixed(2)}</td>
                    <td className="border border-slate-300 px-3 py-2 text-red-600 font-bold">${p.owedRemain.toFixed(2)}</td>
                    <td className="border border-slate-300 px-2 py-2 text-center text-slate-400">-</td>
                    <td className="border border-slate-300 px-2 py-2 text-center text-slate-400">-</td>
                    <td className="border border-slate-300 px-2 py-2 text-center text-slate-400">-</td>
                    <td className="border border-slate-300 px-2 py-2 text-center text-slate-400">-</td>
                    <td className="border border-slate-300 px-2 py-2 text-center text-slate-400">-</td>
                    <td className="border border-slate-300 px-2 py-2 text-center text-slate-400">-</td>
                    <td className="border border-slate-300 px-2 py-2 text-center text-slate-400">-</td>
                    <td className="border border-slate-300 px-2 py-2 text-center text-slate-400">-</td>
                    <td className="border border-slate-300 px-2 py-2 text-center text-slate-400">-</td>
                    <td className="border border-slate-300 px-2 py-2 font-bold text-blue-800">${p.paidUSD.toFixed(2)}</td>
                    <td className="border border-slate-300 px-2 py-2 text-center text-slate-400">-</td>
                    <td className="border border-slate-300 px-2 py-2 text-center text-slate-400">-</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 5: SEMESTER PARTITION (INCOME & STUDENT DEBT) */}
      {activeReport === 'semester-partition' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-300 p-6 space-y-6 print:border-none print:shadow-none print:p-0">
          {/* Controls Bar (Hidden on print) */}
          <div className="no-print bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 font-khmer flex items-center gap-1">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>ជ្រើសរើសឆ្នាំសិក្សា:</span>
              </span>
              <div className="flex items-center gap-1.5">
                {settings.academicYears.map(yr => (
                  <button
                    key={yr}
                    onClick={() => setSelectedAcademicYear(yr)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      selectedAcademicYear === yr
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-600 font-khmer">
              ឆមាសទី១: <b>{formatKhmerDate(semesterConfig.semester1StartDate)} → {formatKhmerDate(semesterConfig.semester1EndDate)}</b> | ឆមាសទី២: <b>{formatKhmerDate(semesterConfig.semester2StartDate)} → {formatKhmerDate(semesterConfig.semester2EndDate)}</b>
            </div>
          </div>

          {/* Official Kingdom Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <Logo className="w-12 h-12" />
                <div>
                  <h1 className="text-base font-bold font-khmer text-slate-900 leading-tight">
                    {settings.schoolNameKhmer}
                  </h1>
                  <h2 className="text-xs font-bold tracking-wider text-slate-700">
                    {settings.schoolNameEnglish}
                  </h2>
                  <div className="text-[11px] text-slate-500 font-khmer">
                    {selectedBranch.nameKhmer} · {selectedBranch.city}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center font-khmer space-y-0.5">
              <div className="text-xs font-bold text-slate-900">{settings.kingdomHeaderKhmer}</div>
              <div className="text-xs font-bold text-slate-800">{settings.mottoKhmer}</div>
              <div className="text-xs text-amber-600">***</div>
            </div>
          </div>

          {/* Report Title */}
          <div className="text-center space-y-1">
            <h2 className="text-base sm:text-lg font-bold font-khmer text-slate-900">
              របាយការណ៍បែងចែកចំណូល និងបំណុលសិស្ស ឆមាសទី១ និងឆមាសទី២
            </h2>
            <h3 className="text-xs font-bold text-slate-600 font-mono tracking-wide">
              OFFICIAL SEMESTER INCOME & STUDENT DEBT PARTITION REPORT — ACADEMIC YEAR {selectedAcademicYear}
            </h3>
            <p className="text-xs font-khmer text-slate-600">
              កាលបរិច្ឆេទឆមាសទី១ ({formatKhmerDate(semesterConfig.semester1StartDate)} ដល់ {formatKhmerDate(semesterConfig.semester1EndDate)}) · កាលបរិច្ឆេទឆមាសទី២ ({formatKhmerDate(semesterConfig.semester2StartDate)} ដល់ {formatKhmerDate(semesterConfig.semester2EndDate)})
            </p>
          </div>

          {/* Financial Partition Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-900 font-khmer text-xs">ឆមាសទី១ (Semester 1)</span>
                <span className="text-[10px] font-mono text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                  {formatKhmerDate(semesterConfig.semester1StartDate)} - {formatKhmerDate(semesterConfig.semester1EndDate)}
                </span>
              </div>
              <div className="space-y-1 pt-1 border-t border-blue-100 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-khmer">ចំណូលបានប្រមូល:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    ${semesterPartitionStats.semester1.incomeUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-khmer">បំណុលសិស្សនៅសល់:</span>
                  <span className="font-mono font-bold text-rose-600">
                    ${semesterPartitionStats.semester1.debtUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-900 font-khmer text-xs">ឆមាសទី២ (Semester 2)</span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                  {formatKhmerDate(semesterConfig.semester2StartDate)} - {formatKhmerDate(semesterConfig.semester2EndDate)}
                </span>
              </div>
              <div className="space-y-1 pt-1 border-t border-emerald-100 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-khmer">ចំណូលបានប្រមូល:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    ${semesterPartitionStats.semester2.incomeUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-khmer">បំណុលសិស្សនៅសល់:</span>
                  <span className="font-mono font-bold text-rose-600">
                    ${semesterPartitionStats.semester2.debtUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-900 font-khmer text-xs">សរុបប្រចាំឆ្នាំ ({selectedAcademicYear})</span>
                <span className="text-[10px] font-mono text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                  Full Year
                </span>
              </div>
              <div className="space-y-1 pt-1 border-t border-purple-100 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-khmer">សរុបចំណូល (USD):</span>
                  <span className="font-mono font-bold text-slate-900">
                    ${semesterPartitionStats.total.incomeUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-khmer">សរុបបំណុល (USD):</span>
                  <span className="font-mono font-bold text-rose-600">
                    ${semesterPartitionStats.total.debtUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Master Table */}
          <div className="overflow-x-auto border border-slate-300">
            <table className="w-full text-xs text-left border-collapse border border-slate-300 whitespace-nowrap">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-khmer text-center">
                  <th rowSpan={2} className="border border-slate-300 px-3 py-2">ល.រ</th>
                  <th rowSpan={2} className="border border-slate-300 px-4 py-2 text-left">កម្រិតថ្នាក់ (Grade Level)</th>
                  <th rowSpan={2} className="border border-slate-300 px-2 py-2">សិស្ស</th>
                  <th colSpan={2} className="border border-slate-300 px-3 py-1 bg-blue-50 text-blue-900 font-bold">
                    ឆមាសទី១ ({formatKhmerDate(semesterConfig.semester1StartDate)} ដល់ {formatKhmerDate(semesterConfig.semester1EndDate)})
                  </th>
                  <th colSpan={2} className="border border-slate-300 px-3 py-1 bg-emerald-50 text-emerald-900 font-bold">
                    ឆមាសទី២ ({formatKhmerDate(semesterConfig.semester2StartDate)} ដល់ {formatKhmerDate(semesterConfig.semester2EndDate)})
                  </th>
                  <th colSpan={3} className="border border-slate-300 px-3 py-1 bg-slate-200 text-slate-900 font-bold">
                    សរុបប្រចាំឆ្នាំ ({selectedAcademicYear})
                  </th>
                </tr>
                <tr className="bg-slate-50 font-mono text-[11px] text-right">
                  <th className="border border-slate-300 px-3 py-1.5 text-emerald-700 bg-blue-50/30">ចំណូលបានបង់ ($)</th>
                  <th className="border border-slate-300 px-3 py-1.5 text-rose-600 bg-blue-50/30">នៅជំពាក់ ($)</th>
                  <th className="border border-slate-300 px-3 py-1.5 text-emerald-700 bg-emerald-50/30">ចំណូលបានបង់ ($)</th>
                  <th className="border border-slate-300 px-3 py-1.5 text-rose-600 bg-emerald-50/30">នៅជំពាក់ ($)</th>
                  <th className="border border-slate-300 px-3 py-1.5 text-slate-900 bg-slate-100">ចំណូលសរុប ($)</th>
                  <th className="border border-slate-300 px-3 py-1.5 text-rose-600 bg-slate-100">បំណុលសរុប ($)</th>
                  <th className="border border-slate-300 px-2 py-1.5 text-center bg-slate-100">អត្រា (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-[11px] text-right">
                {semesterGradeRows.map((r) => (
                  <tr key={r.level} className="hover:bg-slate-50">
                    <td className="border border-slate-300 px-3 py-2 text-center text-slate-500">{r.no}</td>
                    <td className="border border-slate-300 px-4 py-2 text-left font-khmer font-bold text-slate-900">{r.level}</td>
                    <td className="border border-slate-300 px-2 py-2 text-center">{r.students}</td>
                    <td className="border border-slate-300 px-3 py-2 text-emerald-700 font-semibold">${r.s1Income.toFixed(2)}</td>
                    <td className={`border border-slate-300 px-3 py-2 ${r.s1Debt > 0 ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>${r.s1Debt.toFixed(2)}</td>
                    <td className="border border-slate-300 px-3 py-2 text-emerald-700 font-semibold">${r.s2Income.toFixed(2)}</td>
                    <td className={`border border-slate-300 px-3 py-2 ${r.s2Debt > 0 ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>${r.s2Debt.toFixed(2)}</td>
                    <td className="border border-slate-300 px-3 py-2 font-bold text-slate-900">${r.totalIncome.toFixed(2)}</td>
                    <td className={`border border-slate-300 px-3 py-2 ${r.totalDebt > 0 ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>${r.totalDebt.toFixed(2)}</td>
                    <td className="border border-slate-300 px-2 py-2 text-center font-bold text-blue-700">{r.rate}%</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-200 font-bold font-mono text-right text-xs text-slate-900">
                  <td colSpan={2} className="border border-slate-400 px-4 py-2.5 text-center font-khmer">
                    សរុបរួម (GRAND TOTAL)
                  </td>
                  <td className="border border-slate-400 px-2 py-2.5 text-center">
                    {semesterGradeRows.reduce((sum, r) => sum + r.students, 0)}
                  </td>
                  <td className="border border-slate-400 px-3 py-2.5 text-emerald-700">
                    ${semesterPartitionStats.semester1.incomeUSD.toFixed(2)}
                  </td>
                  <td className="border border-slate-400 px-3 py-2.5 text-rose-700">
                    ${semesterPartitionStats.semester1.debtUSD.toFixed(2)}
                  </td>
                  <td className="border border-slate-400 px-3 py-2.5 text-emerald-700">
                    ${semesterPartitionStats.semester2.incomeUSD.toFixed(2)}
                  </td>
                  <td className="border border-slate-400 px-3 py-2.5 text-rose-700">
                    ${semesterPartitionStats.semester2.debtUSD.toFixed(2)}
                  </td>
                  <td className="border border-slate-400 px-3 py-2.5 text-slate-900">
                    ${semesterPartitionStats.total.incomeUSD.toFixed(2)}
                  </td>
                  <td className="border border-slate-400 px-3 py-2.5 text-rose-700">
                    ${semesterPartitionStats.total.debtUSD.toFixed(2)}
                  </td>
                  <td className="border border-slate-400 px-2 py-2.5 text-center text-blue-900">
                    {Math.round((semesterPartitionStats.total.incomeUSD / (semesterPartitionStats.total.incomeUSD + semesterPartitionStats.total.debtUSD || 1)) * 100)}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Official Signatures Footer */}
          <div className="pt-8 grid grid-cols-3 gap-6 text-center font-khmer text-xs">
            <div className="space-y-16">
              <div>
                <p className="font-bold">រៀបចំដោយ</p>
                <p className="text-[11px] text-slate-500 font-sans">Prepared by (Cashier / Accountant)</p>
              </div>
              <div className="border-t border-slate-400 w-36 mx-auto pt-1 font-bold">
                ស្រី ណុច
              </div>
            </div>

            <div className="space-y-16">
              <div>
                <p className="font-bold">ត្រួតពិនិត្យដោយ</p>
                <p className="text-[11px] text-slate-500 font-sans">Verified by (Head of Finance)</p>
              </div>
              <div className="border-t border-slate-400 w-36 mx-auto pt-1 font-bold">
                សុខ ចិន្តា
              </div>
            </div>

            <div className="space-y-16">
              <div>
                <p className="text-[11px] text-slate-500">សៀមរាប, ថ្ងៃទី....... ខែ....... ឆ្នាំ២០២៦</p>
                <p className="font-bold">នាយកសាខា / ប្រធានសាលា</p>
                <p className="text-[11px] text-slate-500 font-sans">Campus Director (Approved by)</p>
              </div>
              <div className="border-t border-slate-400 w-44 mx-auto pt-1 font-bold">
                {selectedBranch.directorName}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
