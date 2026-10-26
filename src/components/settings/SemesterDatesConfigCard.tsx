import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { SemesterDateConfig } from '../../types';
import { DEFAULT_SEMESTER_CONFIGS } from '../../data/seedData';
import { 
  getSemesterConfig, 
  calculateSemesterFinancialPartition, 
  getCurrentSemesterStatus,
  calculateWeeksBetween,
  formatKhmerDate 
} from '../../utils/semesterUtils';
import { 
  Calendar, 
  Check, 
  Save, 
  RotateCcw, 
  Clock, 
  DollarSign, 
  AlertCircle, 
  ArrowRight,
  TrendingUp,
  CreditCard,
  FileText
} from 'lucide-react';

export const SemesterDatesConfigCard: React.FC = () => {
  const { settings, updateSemesterConfig, branchPayments } = useSchool();

  // Selected academic year for configuration
  const [selectedYear, setSelectedYear] = useState<string>(settings.activeAcademicYear || '2025-2026');

  // Form states for the selected year
  const [s1Start, setS1Start] = useState('');
  const [s1End, setS1End] = useState('');
  const [s2Start, setS2Start] = useState('');
  const [s2End, setS2End] = useState('');
  const [notes, setNotes] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Sync state when selectedYear or settings change
  useEffect(() => {
    const config = getSemesterConfig(settings, selectedYear);
    setS1Start(config.semester1StartDate);
    setS1End(config.semester1EndDate);
    setS2Start(config.semester2StartDate);
    setS2End(config.semester2EndDate);
    setNotes(config.notes || '');
  }, [selectedYear, settings]);

  const currentConfig: SemesterDateConfig = {
    academicYear: selectedYear,
    semester1StartDate: s1Start,
    semester1EndDate: s1End,
    semester2StartDate: s2Start,
    semester2EndDate: s2End,
    notes
  };

  const statusInfo = getCurrentSemesterStatus(currentConfig);
  const s1Weeks = calculateWeeksBetween(s1Start, s1End);
  const s2Weeks = calculateWeeksBetween(s2Start, s2End);

  // Financial partition stats based on current dates
  const partitionStats = calculateSemesterFinancialPartition(branchPayments, currentConfig);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (s1Start > s1End) {
      alert('កាលបរិច្ឆេទចាប់ផ្ដើមឆមាសទី១ មិនអាចក្រោយកាលបរិច្ឆេទបញ្ចប់បានទេ!');
      return;
    }
    if (s2Start > s2End) {
      alert('កាលបរិច្ឆេទចាប់ផ្ដើមឆមាសទី២ មិនអាចក្រោយកាលបរិច្ឆេទបញ្ចប់បានទេ!');
      return;
    }
    if (s2Start < s1End) {
      alert('កាលបរិច្ឆេទចាប់ផ្ដើមឆមាសទី២ គួរតែបន្ទាប់ពីកាលបរិច្ឆេទបញ្ចប់ឆមាសទី១!');
    }

    updateSemesterConfig(selectedYear, currentConfig);
    setToastMessage(`បានរក្សាទុកកាលបរិច្ឆេទឆមាសសម្រាប់ឆ្នាំ ${selectedYear} ដោយជោគជ័យ!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleResetDefault = () => {
    const def = DEFAULT_SEMESTER_CONFIGS[selectedYear];
    if (def) {
      setS1Start(def.semester1StartDate);
      setS1End(def.semester1EndDate);
      setS2Start(def.semester2StartDate);
      setS2End(def.semester2EndDate);
      setNotes(def.notes || '');
      updateSemesterConfig(selectedYear, def);
      setToastMessage(`បានកំណត់ឡើងវិញតាមស្ដង់ដារក្រសួងអប់រំសម្រាប់ឆ្នាំ ${selectedYear}`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 font-khmer">
                កំណត់កាលបរិច្ឆេទឆមាសទី១ & ឆមាសទី២ ប្រចាំឆ្នាំ (Semester Date Configuration)
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-khmer mt-0.5">
              កំណត់កាលបរិច្ឆេទចាប់ផ្ដើម និងបញ្ចប់ឆមាសនីមួយៗ ដើម្បីបែងចែករបាយការណ៍ចំណូល (Revenue) និងបំណុលសិស្ស (Student Debt)
            </p>
          </div>
        </div>

        {/* Current Semester Status Badge */}
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1.5 rounded-lg border text-xs font-khmer flex items-center gap-1.5 ${
            statusInfo.status === 'semester1' 
              ? 'bg-blue-50 border-blue-200 text-blue-800' 
              : statusInfo.status === 'semester2'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
            <span className="font-bold">{statusInfo.labelKhmer}</span>
            <span className="text-[11px] opacity-75 font-mono">({statusInfo.activeConfigDate})</span>
          </div>
        </div>
      </div>

      {showToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-2 font-khmer animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Year Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 font-khmer">ជ្រើសរើសឆ្នាំសិក្សា:</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {settings.academicYears.map(yr => (
              <button
                key={yr}
                type="button"
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  selectedYear === yr
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {yr}
                {settings.activeAcademicYear === yr && (
                  <span className={`ml-1.5 text-[9px] px-1 py-0.2 rounded uppercase ${
                    selectedYear === yr ? 'bg-blue-800 text-white' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    Active
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetDefault}
          className="text-xs text-slate-500 hover:text-blue-600 font-khmer flex items-center gap-1 cursor-pointer"
          title="កំណត់ឡើងវិញតាមស្ដង់ដារ"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>កំណត់ឡើងវិញតាមក្រសួង (MoEYS Default)</span>
        </button>
      </div>

      {/* Date Pickers Form */}
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Semester 1 Box */}
          <div className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50/30 space-y-3">
            <div className="flex items-center justify-between border-b border-blue-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center font-mono">
                  1
                </span>
                <span className="font-bold text-slate-900 text-sm font-khmer">
                  ឆមាសទី១ (Semester 1)
                </span>
              </div>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md font-khmer">
                ~ {s1Weeks} សប្តាហ៍
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 font-khmer">
                  កាលបរិច្ឆេទចាប់ផ្ដើម (Start Date) <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={s1Start}
                  onChange={(e) => setS1Start(e.target.value)}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg bg-white font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 font-khmer">
                  កាលបរិច្ឆេទទទួលបញ្ចប់ (End Date) <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={s1End}
                  onChange={(e) => setS1End(e.target.value)}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg bg-white font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="text-[11px] text-blue-900/80 font-khmer bg-white/70 p-2 rounded-lg border border-blue-100 flex items-center justify-between">
              <span>ចន្លោះពេល: <b>{formatKhmerDate(s1Start)}</b> ដល់ <b>{formatKhmerDate(s1End)}</b></span>
              <span className="text-blue-600 font-mono font-bold">Sem 1</span>
            </div>
          </div>

          {/* Semester 2 Box */}
          <div className="p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50/30 space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center font-mono">
                  2
                </span>
                <span className="font-bold text-slate-900 text-sm font-khmer">
                  ឆមាសទី២ (Semester 2)
                </span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md font-khmer">
                ~ {s2Weeks} សប្តាហ៍
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 font-khmer">
                  កាលបរិច្ឆេទចាប់ផ្ដើម (Start Date) <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={s2Start}
                  onChange={(e) => setS2Start(e.target.value)}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg bg-white font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 font-khmer">
                  កាលបរិច្ឆេទទទួលបញ្ចប់ (End Date) <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={s2End}
                  onChange={(e) => setS2End(e.target.value)}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg bg-white font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="text-[11px] text-emerald-900/80 font-khmer bg-white/70 p-2 rounded-lg border border-emerald-100 flex items-center justify-between">
              <span>ចន្លោះពេល: <b>{formatKhmerDate(s2Start)}</b> ដល់ <b>{formatKhmerDate(s2End)}</b></span>
              <span className="text-emerald-600 font-mono font-bold">Sem 2</span>
            </div>
          </div>
        </div>

        {/* Notes input */}
        <div className="text-xs">
          <label className="block font-semibold text-slate-700 mb-1 font-khmer">
            កំណត់សម្គាល់ប្រតិទិនសិក្សា (Academic Calendar Notes)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="ឧទាហរណ៍៖ ប្រតិទិនសិក្សាស្របតាមក្រសួងអប់រំ យុវជន និងកីឡា..."
            className="w-full h-9 px-3 border border-slate-300 rounded-lg font-khmer text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Save className="w-4 h-4" />
            <span className="font-khmer">រក្សាទុកកាលបរិច្ឆេទឆមាស ({selectedYear})</span>
          </button>
        </div>
      </form>

      {/* Live Financial Partition Preview for this academic year */}
      <div className="pt-2 border-t border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 font-khmer flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>ការបែងចែកចំណូល & បំណុលសិស្សតាមកាលបរិច្ឆេទឆមាស (Financial Partition Preview - {selectedYear})</span>
          </h4>
          <span className="text-[11px] text-slate-500 font-khmer">
            គណនាដោយស្វ័យប្រវត្តិតាមវិក្កយបត្រជាក់ស្តែង
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Semester 1 Partition Card */}
          <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-900 font-khmer">ឆមាសទី១ (Semester 1)</span>
              <span className="text-[10px] font-mono text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                {formatKhmerDate(s1Start)} - {formatKhmerDate(s1End)}
              </span>
            </div>
            <div className="space-y-1 pt-1 border-t border-blue-100">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-khmer">ចំណូលបានប្រមូល:</span>
                <span className="font-mono font-bold text-emerald-600">
                  ${partitionStats.semester1.incomeUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-khmer">បំណុលសិស្សនៅសល់:</span>
                <span className="font-mono font-bold text-rose-600">
                  ${partitionStats.semester1.debtUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500">
                <span className="font-khmer">ចំនួនប្រតិបត្តិការ:</span>
                <span className="font-mono">{partitionStats.semester1.invoicesCount} វិក្កយបត្រ</span>
              </div>
            </div>
          </div>

          {/* Semester 2 Partition Card */}
          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-900 font-khmer">ឆមាសទី២ (Semester 2)</span>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                {formatKhmerDate(s2Start)} - {formatKhmerDate(s2End)}
              </span>
            </div>
            <div className="space-y-1 pt-1 border-t border-emerald-100">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-khmer">ចំណូលបានប្រមូល:</span>
                <span className="font-mono font-bold text-emerald-600">
                  ${partitionStats.semester2.incomeUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-khmer">បំណុលសិស្សនៅសល់:</span>
                <span className="font-mono font-bold text-rose-600">
                  ${partitionStats.semester2.debtUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500">
                <span className="font-khmer">ចំនួនប្រតិបត្តិការ:</span>
                <span className="font-mono">{partitionStats.semester2.invoicesCount} វិក្កយបត្រ</span>
              </div>
            </div>
          </div>

          {/* Whole Year Partition Card */}
          <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-900 font-khmer">សរុបពេញមួយឆ្នាំ (Annual)</span>
              <span className="text-[10px] font-mono text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                {selectedYear}
              </span>
            </div>
            <div className="space-y-1 pt-1 border-t border-purple-100">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-khmer">ចំណូលសរុប (USD):</span>
                <span className="font-mono font-bold text-slate-900">
                  ${partitionStats.total.incomeUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-khmer">បំណុលសរុប (USD):</span>
                <span className="font-mono font-bold text-rose-600">
                  ${partitionStats.total.debtUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500">
                <span className="font-khmer">ប្រាក់រៀល (KHR):</span>
                <span className="font-mono">{(partitionStats.total.incomeKHR).toLocaleString()} ៛</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Table of All Configured Academic Years */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        <h4 className="text-xs font-bold text-slate-700 font-khmer">
          តារាងកាលបរិច្ឆេទឆមាសតាមឆ្នាំសិក្សាទាំងអស់ (All Academic Years Master Schedule)
        </h4>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2">ឆ្នាំសិក្សា (Academic Year)</th>
                <th className="px-3 py-2">ឆមាសទី១ (Semester 1)</th>
                <th className="px-3 py-2">ឆមាសទី២ (Semester 2)</th>
                <th className="px-3 py-2">កំណត់សម្គាល់</th>
                <th className="px-3 py-2 text-right">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {settings.academicYears.map(yr => {
                const cfg = getSemesterConfig(settings, yr);
                const isActive = settings.activeAcademicYear === yr;
                return (
                  <tr key={yr} className={`hover:bg-slate-50/80 ${selectedYear === yr ? 'bg-blue-50/30' : ''}`}>
                    <td className="px-3 py-2 font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span>{yr}</span>
                        {isActive && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-100 text-emerald-700 font-sans font-bold">
                            Active
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-blue-700">
                      {cfg.semester1StartDate} <span className="text-slate-400">→</span> {cfg.semester1EndDate}
                    </td>
                    <td className="px-3 py-2 text-emerald-700">
                      {cfg.semester2StartDate} <span className="text-slate-400">→</span> {cfg.semester2EndDate}
                    </td>
                    <td className="px-3 py-2 font-khmer text-slate-500 font-normal">
                      {cfg.notes || '-'}
                    </td>
                    <td className="px-3 py-2 text-right font-sans">
                      <button
                        type="button"
                        onClick={() => setSelectedYear(yr)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                      >
                        កែប្រែ (Edit)
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
