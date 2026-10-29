import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  Printer, 
  X, 
  GraduationCap, 
  FileText, 
  Filter, 
  Users, 
  Download,
  Building2,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface MoEYSClassRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialClassGrade?: string;
}

export const MoEYSClassRosterModal: React.FC<MoEYSClassRosterModalProps> = ({
  isOpen,
  onClose,
  initialClassGrade
}) => {
  const { 
    branchStudents, 
    settings, 
    selectedBranch 
  } = useSchool();

  const [selectedClass, setSelectedClass] = useState<string>(
    initialClassGrade || settings.gradeLevels[0] || 'ថ្នាក់ទី ១០'
  );
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>(
    settings.activeAcademicYear || '2025-2026'
  );
  const [selectedShift, setSelectedShift] = useState<'ទាំងអស់' | 'ព្រឹក' | 'រសៀល' | 'ពេញមួយថ្ងៃ'>('ពេញមួយថ្ងៃ');
  const [roomNumber, setRoomNumber] = useState<string>('B-201');
  const [homeroomTeacher, setHomeroomTeacher] = useState<string>('លោកគ្រូ ឈិន សុខា');
  const [issueLocation, setIssueLocation] = useState<string>('សៀមរាប');

  if (!isOpen) return null;

  // Filter students by chosen class
  const classStudents = useMemo(() => {
    return branchStudents
      .filter(s => s.classGrade === selectedClass)
      .sort((a, b) => a.nameKhmer.localeCompare(b.nameKhmer, 'km'));
  }, [branchStudents, selectedClass]);

  const femaleCount = classStudents.filter(s => s.gender === 'Female').length;
  const maleCount = classStudents.length - femaleCount;

  const handlePrint = () => {
    window.print();
  };

  const handleExportXLS = () => {
    const exportData = classStudents.map((s, idx) => ({
      'ល.រ': idx + 1,
      'អត្តលេខសិស្ស': s.studentCode || s.roll,
      'គោត្តនាម និងនាម': s.nameKhmer,
      'អក្សរឡាតាំង': s.nameEnglish,
      'ភេទ': s.gender === 'Female' ? 'ស្រី' : 'ប្រុស',
      'ថ្ងៃខែឆ្នាំកំណើត': s.birthday || '—',
      'ទីកន្លែងកំណើត': s.address || 'សៀមរាប',
      'ឈ្មោះឪពុក ឬម្តាយ/អាណាព្យាបាល': s.parentName || '—',
      'មុខរបរ': 'អាជីវករ / មន្ត្រីរាជការ',
      'អាសយដ្ឋានបច្ចុប្បន្ន': s.address || 'សៀមរាប',
      'លេខទូរស័ព្ទ': s.guardianPhone || s.phone || '—',
      'សម្គាល់': s.status === 'active' ? 'កំពុងសិក្សា' : s.status
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'MoEYS Roster');
    XLSX.writeFile(wb, `MoEYS_Class_Roster_${selectedClass.replace(/\s+/g, '_')}_${selectedAcademicYear}.xlsx`);
  };

  const currentDateKhmer = () => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `ថ្ងៃទី ${day} ខែ ${month} ឆ្នាំ ${year}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[96vh]">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 rounded-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold flex items-center gap-2 font-khmer">
                <span>បញ្ជីរាយនាមសិស្សតាមថ្នាក់ ទម្រង់ផ្លូវការក្រសួងអប់រំ (MoEYS Official Roster)</span>
                <span className="bg-blue-500/30 text-blue-200 text-[10px] font-mono px-2 py-0.5 rounded-full border border-blue-400/30">
                  MoEYS Format
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 font-khmer">
                សម្រាប់បោះពុម្ពបញ្ជូនទៅក្រសួងអប់រំ យុវជន និងកីឡា ឬមន្ទីរអប់រំខេត្តសៀមរាប
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportXLS}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Excel</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print (បោះពុម្ព)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-lg text-slate-300 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Configuration Bar (Hidden when printing) */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex flex-wrap items-center gap-4 text-xs font-khmer shrink-0 print:hidden">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">ជ្រើសរើសថ្នាក់:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="h-8 px-2.5 bg-white border border-slate-300 rounded-md font-bold text-slate-800"
            >
              {settings.gradeLevels.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">ឆ្នាំសិក្សា:</span>
            <select
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              className="h-8 px-2.5 bg-white border border-slate-300 rounded-md font-semibold font-mono text-slate-800"
            >
              {settings.academicYears.map(yr => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">វេនសិក្សា:</span>
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value as any)}
              className="h-8 px-2.5 bg-white border border-slate-300 rounded-md text-slate-800"
            >
              <option value="ពេញមួយថ្ងៃ">ពេញមួយថ្ងៃ (Full-Day)</option>
              <option value="ព្រឹក">វេនព្រឹក (Morning)</option>
              <option value="រសៀល">វេនរសៀល (Afternoon)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">បន្ទប់:</span>
            <input
              type="text"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              className="h-8 w-20 px-2 bg-white border border-slate-300 rounded-md font-mono text-slate-800"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">គ្រូបន្ទុកថ្នាក់:</span>
            <input
              type="text"
              value={homeroomTeacher}
              onChange={(e) => setHomeroomTeacher(e.target.value)}
              className="h-8 w-36 px-2 bg-white border border-slate-300 rounded-md text-slate-800"
            />
          </div>
        </div>

        {/* ================= Printable MoEYS Document Sheet ================= */}
        <div className="p-6 md:p-10 overflow-y-auto flex-1 bg-white print:p-0 print:overflow-visible text-slate-900 font-khmer">
          <div className="max-w-[1050px] mx-auto bg-white p-4 print:p-0 space-y-4">
            
            {/* Top MoEYS Official National Header */}
            <div className="flex justify-between items-start leading-relaxed text-xs">
              {/* Left Ministry & School Section */}
              <div className="text-center space-y-0.5 w-[38%]">
                <div className="font-bold text-slate-900 text-sm">ក្រសួងអប់រំ យុវជន និងកីឡា</div>
                <div className="text-slate-800 font-medium text-xs">មន្ទីរអប់រំ យុវជន និងកីឡា ខេត្តសៀមរាប</div>
                <div className="font-bold text-blue-900 text-xs pt-1">
                  {selectedBranch.nameKhmer.toUpperCase()}
                </div>
                <div className="text-[11px] font-sans font-semibold text-slate-600">
                  {selectedBranch.nameEnglish.toUpperCase()}
                </div>
              </div>

              {/* Center National Motto */}
              <div className="text-center space-y-1 w-[45%]">
                <div className="font-bold text-slate-900 text-base tracking-wide">ព្រះរាជាណាចក្រកម្ពុជា</div>
                <div className="font-bold text-slate-900 text-sm">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
                {/* Traditional Decorative Tilde / Curl underline */}
                <div className="flex justify-center items-center gap-1 text-slate-700 text-xs font-serif select-none">
                  <span>~*~</span>
                  <span className="w-16 h-0.5 bg-slate-800 inline-block"></span>
                  <span>~*~</span>
                </div>
              </div>
            </div>

            {/* Document Title Banner */}
            <div className="text-center space-y-1 pt-2">
              <h1 className="text-lg md:text-xl font-black text-slate-900 tracking-wider">
                បញ្ជីរាយនាមសិស្សតាមថ្នាក់
              </h1>
              <div className="text-xs font-sans font-bold uppercase tracking-widest text-slate-600">
                OFFICIAL STUDENT CLASS ROSTER
              </div>
            </div>

            {/* Meta Information Grid Bar */}
            <div className="border border-slate-400 bg-slate-50/60 p-2.5 rounded text-xs grid grid-cols-2 sm:grid-cols-4 gap-2 leading-tight">
              <div>
                <span className="text-slate-600">ថ្នាក់ទី: </span>
                <span className="font-bold text-slate-900">{selectedClass}</span>
              </div>
              <div>
                <span className="text-slate-600">បន្ទប់: </span>
                <span className="font-bold text-slate-900 font-mono">{roomNumber}</span>
              </div>
              <div>
                <span className="text-slate-600">វេនសិក្សា: </span>
                <span className="font-bold text-slate-900">{selectedShift}</span>
              </div>
              <div>
                <span className="text-slate-600">ឆ្នាំសិក្សា: </span>
                <span className="font-bold text-slate-900 font-mono">{selectedAcademicYear}</span>
              </div>

              <div>
                <span className="text-slate-600">គ្រូបន្ទុកថ្នាក់: </span>
                <span className="font-bold text-slate-900">{homeroomTeacher}</span>
              </div>
              <div>
                <span className="text-slate-600">សិស្សសរុប: </span>
                <span className="font-bold text-blue-900">{classStudents.length} នាក់</span>
              </div>
              <div>
                <span className="text-slate-600">សិស្សស្រី: </span>
                <span className="font-bold text-rose-700">{femaleCount} នាក់</span>
              </div>
              <div>
                <span className="text-slate-600">សិស្សប្រុស: </span>
                <span className="font-bold text-emerald-800">{maleCount} នាក់</span>
              </div>
            </div>

            {/* Official 12-Column Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-700 text-[11px] leading-tight">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 text-center font-bold">
                    <th className="border border-slate-700 py-2 px-1 w-8">ល.រ</th>
                    <th className="border border-slate-700 py-2 px-1.5 w-20">អត្តលេខ</th>
                    <th className="border border-slate-700 py-2 px-2 text-left">គោត្តនាម និងនាម</th>
                    <th className="border border-slate-700 py-2 px-2 text-left font-sans">អក្សរឡាតាំង</th>
                    <th className="border border-slate-700 py-2 px-1 w-10">ភេទ</th>
                    <th className="border border-slate-700 py-2 px-1.5 w-24">ថ្ងៃខែឆ្នាំកំណើត</th>
                    <th className="border border-slate-700 py-2 px-2 text-left">ទីកន្លែងកំណើត</th>
                    <th className="border border-slate-700 py-2 px-2 text-left">ឈ្មោះអាណាព្យាបាល</th>
                    <th className="border border-slate-700 py-2 px-1.5">មុខរបរ</th>
                    <th className="border border-slate-700 py-2 px-2 text-left">អាសយដ្ឋានបច្ចុប្បន្ន</th>
                    <th className="border border-slate-700 py-2 px-1.5 w-24">លេខទូរស័ព្ទ</th>
                    <th className="border border-slate-700 py-2 px-1.5 w-16">ផ្សេងៗ</th>
                  </tr>
                  <tr className="bg-slate-50 text-slate-600 text-[9px] text-center font-mono">
                    <td className="border border-slate-700 py-0.5">1</td>
                    <td className="border border-slate-700 py-0.5">2</td>
                    <td className="border border-slate-700 py-0.5">3</td>
                    <td className="border border-slate-700 py-0.5">4</td>
                    <td className="border border-slate-700 py-0.5">5</td>
                    <td className="border border-slate-700 py-0.5">6</td>
                    <td className="border border-slate-700 py-0.5">7</td>
                    <td className="border border-slate-700 py-0.5">8</td>
                    <td className="border border-slate-700 py-0.5">9</td>
                    <td className="border border-slate-700 py-0.5">10</td>
                    <td className="border border-slate-700 py-0.5">11</td>
                    <td className="border border-slate-700 py-0.5">12</td>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {classStudents.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-8 text-center text-slate-500 italic">
                        ពុំមានទិន្នន័យសិស្សនៅក្នុងថ្នាក់ {selectedClass} នេះឡើយ។
                      </td>
                    </tr>
                  ) : (
                    classStudents.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-slate-50/50">
                        <td className="border border-slate-700 py-1.5 px-1 text-center font-mono font-medium">
                          {idx + 1}
                        </td>
                        <td className="border border-slate-700 py-1.5 px-1.5 text-center font-mono font-bold text-blue-900">
                          {s.studentCode || s.roll}
                        </td>
                        <td className="border border-slate-700 py-1.5 px-2 font-bold text-slate-900">
                          {s.nameKhmer}
                        </td>
                        <td className="border border-slate-700 py-1.5 px-2 font-sans font-medium text-slate-800">
                          {s.nameEnglish}
                        </td>
                        <td className="border border-slate-700 py-1.5 px-1 text-center font-semibold">
                          {s.gender === 'Female' ? 'ស្រី' : 'ប្រុស'}
                        </td>
                        <td className="border border-slate-700 py-1.5 px-1 text-center font-mono text-[10px]">
                          {s.birthday || '—'}
                        </td>
                        <td className="border border-slate-700 py-1.5 px-2 text-slate-700 text-[10px]">
                          {s.address ? s.address.split(',')[0] : 'សៀមរាប'}
                        </td>
                        <td className="border border-slate-700 py-1.5 px-2 font-medium text-slate-800">
                          {s.parentName || '—'}
                        </td>
                        <td className="border border-slate-700 py-1.5 px-1.5 text-slate-600 text-[10px]">
                          អាជីវករ
                        </td>
                        <td className="border border-slate-700 py-1.5 px-2 text-slate-700 text-[10px]">
                          {s.address || 'ក្រុងសៀមរាប'}
                        </td>
                        <td className="border border-slate-700 py-1.5 px-1.5 text-center font-mono text-[10px]">
                          {s.guardianPhone || s.phone || '—'}
                        </td>
                        <td className="border border-slate-700 py-1.5 px-1 text-center text-[10px]">
                          {s.status === 'active' ? '' : s.status}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Official Signature and Stamp Blocks */}
            <div className="pt-8 flex justify-between items-start text-xs leading-relaxed page-break-inside-avoid">
              {/* Left: School Director Approval */}
              <div className="text-center w-[40%] space-y-1">
                <div className="font-bold text-slate-800">បានឃើញ និងឯកភាព</div>
                <div className="font-bold text-slate-900">នាយកសាលា</div>
                <div className="h-20 flex items-center justify-center text-slate-300 italic text-[10px]">
                  (ហត្ថលេខា និងត្រា)
                </div>
                <div className="font-bold text-slate-900 pt-2 border-t border-dotted border-slate-400 inline-block px-8">
                  {selectedBranch.directorName || 'លោក ង៉ែត វណ្ណឌី'}
                </div>
              </div>

              {/* Right: Homeroom Teacher Date and Signature */}
              <div className="text-center w-[45%] space-y-1">
                <div className="text-slate-700">
                  {issueLocation}, {currentDateKhmer()}
                </div>
                <div className="font-bold text-slate-900">គ្រូបន្ទុកថ្នាក់</div>
                <div className="h-20 flex items-center justify-center text-slate-300 italic text-[10px]">
                  (ហត្ថលេខា)
                </div>
                <div className="font-bold text-slate-900 pt-2 border-t border-dotted border-slate-400 inline-block px-8">
                  {homeroomTeacher}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
