import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  Users, 
  CreditCard, 
  Clock, 
  Award, 
  TrendingUp, 
  ArrowUpRight, 
  Plus, 
  FileSpreadsheet, 
  Building2, 
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import { 
  getSemesterConfig, 
  calculateSemesterFinancialPartition, 
  formatKhmerDate,
  getCurrentSemesterStatus 
} from '../../utils/semesterUtils';

export const DashboardOverview: React.FC = () => {
  const { 
    selectedBranch, 
    branches, 
    branchStudents, 
    branchPayments, 
    branchAcademicRecords, 
    branchExpenses,
    setActiveTab, 
    setSelectedStudentId,
    currentUser,
    settings 
  } = useSchool();

  // Semester Date Partition Stats
  const semesterConfig = getSemesterConfig(settings, settings.activeAcademicYear);
  const semesterStats = calculateSemesterFinancialPartition(branchPayments, semesterConfig);
  const semesterStatus = getCurrentSemesterStatus(semesterConfig);

  // Financial aggregates
  const totalCollectedUSD = branchPayments.reduce((sum, p) => sum + p.paidUSD, 0);
  const totalArrearsUSD = branchPayments.reduce((sum, p) => sum + p.owedRemain, 0);
  const totalExpensesUSD = branchExpenses.reduce((sum, e) => sum + e.amountUSD, 0);
  const netOperatingIncome = totalCollectedUSD - totalExpensesUSD;

  // Academic top performers
  const sortedAcademic = [...branchAcademicRecords].sort((a, b) => b.average - a.average).slice(0, 4);

  // Recent payment transactions
  const recentPayments = [...branchPayments].slice(0, 6);

  return (
    <div className="space-y-5">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-blue-700/60 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-semibold text-amber-300 mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>{selectedBranch.nameEnglish} ({selectedBranch.code})</span>
          </div>

          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white font-khmer">
            សូមស្វាគមន៍, {currentUser.name}!
          </h1>
          <p className="text-xs text-blue-200 mt-1 leading-relaxed">
            FBIS School Operations Dashboard · Track multi-branch student enrollments, fee collections, academic rankings, and official reporting from a centralized console.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveTab('payments')}
              className="px-4 py-2 bg-[#84cc16] hover:bg-[#65a30d] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record Student Payment</span>
            </button>

            <button
              onClick={() => setActiveTab('excel-import')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg border border-white/20 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Bulk Excel Import</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg border border-white/20 transition-colors cursor-pointer"
            >
              <span>Official Arrears Report &gt;</span>
            </button>
          </div>
        </div>

        {/* Decorative circle glow */}
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-radial from-amber-400/10 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Enrollment</span>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {branchStudents.length} <span className="text-xs font-normal text-slate-500 font-khmer">សិស្ស</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Full Capacity ({selectedBranch.code})</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Collected USD</span>
            <CreditCard className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            ${totalCollectedUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-mono">
            ≈ {(totalCollectedUSD * 4100).toLocaleString()} ៛ (សាច់ប្រាក់សរុប)
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Tuition Arrears</span>
            <Clock className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-2xl font-black text-red-600 font-mono">
            ${totalArrearsUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span className="text-red-600 font-mono">Pending Follow-up</span>
            <button 
              onClick={() => setActiveTab('due-payments')}
              className="text-blue-600 font-semibold hover:underline"
            >
              View List
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Academic Pass Rate</span>
            <Award className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-900 font-mono">
            97.8%
          </div>
          <div className="mt-1 text-[11px] text-purple-700 font-khmer">
            មធ្យមភាគនិទ្ទេសល្អប្រសើរ
          </div>
        </div>
      </div>

      {/* Semester Financial Partition Strip (ឆមាសទី១ និង ឆមាសទី២) */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900 font-khmer">
              ការបែងចែកចំណូល & បំណុលសិស្សតាមឆមាស · ឆ្នាំសិក្សា {settings.activeAcademicYear}
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-khmer border border-blue-200">
              {semesterStatus.labelKhmer}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('payments')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 font-khmer cursor-pointer"
            >
              មើលការបង់ប្រាក់តាមឆមាស &gt;
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Semester 1 Card */}
          <div className="p-3.5 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/60 to-white space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center font-mono">
                  1
                </span>
                <span className="font-bold text-blue-950 font-khmer text-xs">
                  ឆមាសទី១ (Semester 1)
                </span>
              </div>
              <span className="text-[11px] font-mono text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md font-semibold">
                {formatKhmerDate(semesterConfig.semester1StartDate)} → {formatKhmerDate(semesterConfig.semester1EndDate)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-blue-100/70">
              <div>
                <span className="text-[11px] text-slate-500 font-khmer block">ចំណូលបានប្រមូល</span>
                <span className="text-base font-bold font-mono text-emerald-600">
                  ${semesterStats.semester1.incomeUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-khmer block">បំណុលសិស្សនៅសល់</span>
                <span className="text-base font-bold font-mono text-rose-600">
                  ${semesterStats.semester1.debtUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Semester 2 Card */}
          <div className="p-3.5 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-white space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center font-mono">
                  2
                </span>
                <span className="font-bold text-emerald-950 font-khmer text-xs">
                  ឆមាសទី២ (Semester 2)
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md font-semibold">
                {formatKhmerDate(semesterConfig.semester2StartDate)} → {formatKhmerDate(semesterConfig.semester2EndDate)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-emerald-100/70">
              <div>
                <span className="text-[11px] text-slate-500 font-khmer block">ចំណូលបានប្រមូល</span>
                <span className="text-base font-bold font-mono text-emerald-600">
                  ${semesterStats.semester2.incomeUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-khmer block">បំណុលសិស្សនៅសល់</span>
                <span className="text-base font-bold font-mono text-rose-600">
                  ${semesterStats.semester2.debtUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Recent Payments & Academic Stars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (7 cols): Recent Payments Table */}
        <div className="lg:col-span-7 bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Payment Collections</h3>
              <p className="text-[11px] text-slate-500 font-khmer">ប្រតិបត្តិការបង់ប្រាក់ចុងក្រោយ</p>
            </div>
            <button
              onClick={() => setActiveTab('payments')}
              className="text-xs text-blue-600 font-bold hover:underline"
            >
              View All Invoices &gt;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 font-khmer">
                <tr>
                  <th className="py-2.5 px-3">លេខវិក្កយបត្រ</th>
                  <th className="py-2.5 px-3">ឈ្មោះសិស្ស</th>
                  <th className="py-2.5 px-3">ថ្នាក់</th>
                  <th className="py-2.5 px-3 text-right">បានបង់ ($)</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-900">{p.invoiceNumber}</td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => {
                          setSelectedStudentId(p.studentId);
                          setActiveTab('student-profile');
                        }}
                        className="font-khmer font-bold text-slate-900 hover:text-blue-600 text-left block"
                      >
                        {p.studentNameKhmer}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 font-khmer text-slate-600">{p.classGrade}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                      ${p.paidUSD.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        p.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (5 cols): Academic Top Performers & Campus Branches */}
        <div className="lg:col-span-5 space-y-4">
          {/* Top Academic Students */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Academic Top Performers</h3>
                <p className="text-[11px] text-slate-500 font-khmer">សិស្សពូកែឆ្នើមប្រចាំឆមាស</p>
              </div>
              <button
                onClick={() => setActiveTab('academic-performance')}
                className="text-xs text-blue-600 font-bold hover:underline"
              >
                Rank Sheet &gt;
              </button>
            </div>

            <div className="space-y-2.5">
              {sortedAcademic.map((r, i) => (
                <div 
                  key={r.id} 
                  onClick={() => {
                    setSelectedStudentId(r.studentId);
                    setActiveTab('student-profile');
                  }}
                  className="p-2.5 bg-slate-50 hover:bg-blue-50/60 rounded-xl border border-slate-200/80 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-amber-400 text-white font-black text-xs flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <div>
                      <div className="text-xs font-bold font-khmer text-slate-900">{r.studentNameKhmer}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{r.classGrade} · Code: {r.studentCode}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-black font-mono text-emerald-700">{r.average}%</div>
                    <div className="text-[10px] font-mono text-purple-700">GPA {r.gpa}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Multi-Branch Network Status */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Multi-Branch Campus Network</h3>
            <div className="space-y-2">
              {branches.map((b) => (
                <div key={b.id} className="p-2.5 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-800">{b.nameEnglish}</div>
                    <div className="text-[11px] text-slate-500 font-khmer">{b.city} · {b.phone}</div>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                    {b.code}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
