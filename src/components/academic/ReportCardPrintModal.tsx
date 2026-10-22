import React from 'react';
import { AcademicRecord, Student, Branch, SystemSettings } from '../../types';
import { Logo } from '../common/Logo';
import { Printer, X } from 'lucide-react';

interface ReportCardPrintModalProps {
  record: AcademicRecord | null;
  student?: Student | null;
  branch: Branch;
  settings: SystemSettings;
  onClose: () => void;
}

export const ReportCardPrintModal: React.FC<ReportCardPrintModalProps> = ({
  record,
  student,
  branch,
  settings,
  onClose
}) => {
  if (!record) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden border border-slate-200 my-6">
        {/* Controls - Hidden during print */}
        <div className="no-print bg-slate-800 text-white px-5 py-3 flex items-center justify-between">
          <span className="text-xs font-semibold flex items-center gap-2">
            Academic Performance Report Card Preview ({record.studentNameKhmer})
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report Card (បោះពុម្ពព្រឹត្តិបត្រពិន្ទុ)</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document */}
        <div className="p-8 bg-white text-slate-800 text-xs font-sans print:p-4">
          {/* Official Kingdom Header */}
          <div className="text-center mb-5">
            <div className="text-sm font-bold text-slate-800 font-khmer">ព្រះរាជាណាចក្រកម្ពុជា</div>
            <div className="text-sm font-bold text-slate-800 font-khmer">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
            <div className="w-20 h-0.5 bg-amber-500 mx-auto my-2" />
          </div>

          {/* School Header */}
          <div className="flex items-center justify-between border-b-2 border-blue-900 pb-3 mb-4">
            <div className="flex items-center gap-3">
              <Logo size="lg" branchNumber={branch.code.replace('FBIS ', '')} />
              <div>
                <h1 className="text-sm font-bold text-blue-900 font-khmer leading-tight">
                  {settings.schoolNameKhmer}
                </h1>
                <p className="text-xs font-black text-red-600 tracking-wider">
                  {settings.schoolNameEnglish}
                </p>
                <p className="text-[11px] text-slate-600 font-khmer">
                  {branch.nameKhmer} · {branch.city}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-base font-extrabold text-blue-950 font-khmer">
                ព្រឹត្តិបត្រពិន្ទុ និងចំណាត់ថ្នាក់
              </div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                OFFICIAL ACADEMIC REPORT CARD
              </div>
              <div className="text-xs font-mono font-bold text-blue-700 mt-1">
                Term: {record.term} · {record.academicYear}
              </div>
            </div>
          </div>

          {/* Student Bio Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4 text-xs">
            <div>
              <span className="text-[11px] text-slate-500 block">Student Name / ឈ្មោះសិស្ស:</span>
              <span className="font-bold font-khmer text-slate-900 text-sm">{record.studentNameKhmer}</span>
              <span className="text-[11px] text-slate-600 block">({record.studentName})</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 block">Student ID / អត្តលេខ:</span>
              <span className="font-mono font-bold text-slate-900">{record.studentCode}</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 block">Grade & Class / ថ្នាក់ទី:</span>
              <span className="font-bold font-khmer text-blue-900">{record.classGrade}</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 block">Gender / ភេទ:</span>
              <span className="font-medium text-slate-900">{student?.gender || 'Female'}</span>
            </div>
          </div>

          {/* Marks Table */}
          <table className="w-full border-collapse border border-slate-300 text-xs mb-4">
            <thead>
              <tr className="bg-blue-900 text-white font-semibold font-khmer">
                <th className="border border-slate-300 px-3 py-2 text-center w-10">ល.រ</th>
                <th className="border border-slate-300 px-3 py-2 text-left">មុខវិជ្ជា / Subjects</th>
                <th className="border border-slate-300 px-3 py-2 text-center w-20">Max Score</th>
                <th className="border border-slate-300 px-3 py-2 text-center w-20">Score</th>
                <th className="border border-slate-300 px-3 py-2 text-center w-16">Grade</th>
                <th className="border border-slate-300 px-3 py-2 text-left">Teacher's Assessment / មតិគ្រូ</th>
              </tr>
            </thead>
            <tbody>
              {record.subjects.map((sub, idx) => (
                <tr key={sub.subjectId} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                  <td className="border border-slate-300 px-3 py-2 text-center font-mono">{idx + 1}</td>
                  <td className="border border-slate-300 px-3 py-2">
                    <span className="font-bold font-khmer text-slate-900">{sub.subjectNameKhmer}</span>
                    <span className="text-[11px] text-slate-500 ml-1.5">({sub.subjectName})</span>
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-center font-mono text-slate-500">{sub.maxScore}</td>
                  <td className="border border-slate-300 px-3 py-2 text-center font-mono font-bold text-slate-900 text-sm">
                    {sub.score}
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-center font-bold">
                    <span className={`px-1.5 py-0.5 rounded text-[11px] ${
                      sub.grade === 'A' ? 'bg-emerald-100 text-emerald-800' :
                      sub.grade === 'B' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {sub.grade}
                    </span>
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-slate-600 italic">
                    {sub.teacherComment || 'Good effort and comprehension.'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* KPI Outcome Box */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-slate-100/80 p-3 rounded-lg border border-slate-300 mb-4 text-center">
            <div>
              <div className="text-[11px] text-slate-500">Total Score / ពិន្ទុសរុប</div>
              <div className="text-base font-black font-mono text-blue-900">{record.totalScore}</div>
            </div>

            <div>
              <div className="text-[11px] text-slate-500">Average / មធ្យមភាគ</div>
              <div className="text-base font-black font-mono text-emerald-800">{record.average}%</div>
            </div>

            <div>
              <div className="text-[11px] text-slate-500">GPA Score</div>
              <div className="text-base font-black font-mono text-purple-900">{record.gpa} / 4.00</div>
            </div>

            <div>
              <div className="text-[11px] text-slate-500">Class Rank / ចំណាត់ថ្នាក់</div>
              <div className="text-base font-black font-mono text-red-600">
                Rank #{record.rank} <span className="text-xs font-normal text-slate-600">/ {record.totalStudentsInClass}</span>
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-500">Conduct / សីលធម៌</div>
              <div className="text-base font-black font-mono text-emerald-700">Grade {record.behaviorGrade} (ល្អ)</div>
            </div>
          </div>

          {/* Teacher Comment Box */}
          <div className="p-3 bg-white border border-slate-300 rounded-lg mb-6">
            <span className="font-bold text-slate-800 font-khmer block mb-1">
              មតិវាយតម្លៃរបស់គ្រូបន្ទុកថ្នាក់ / Teacher's Recommendation:
            </span>
            <p className="text-slate-700 font-khmer italic">
              "{record.teacherFeedback}"
            </p>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-6 text-center text-xs pt-2">
            <div>
              <div className="font-bold font-khmer text-slate-800">គ្រូបន្ទុកថ្នាក់</div>
              <div className="text-[11px] text-slate-500">Homeroom Teacher</div>
              <div className="h-16 flex items-end justify-center font-khmer text-slate-700 font-medium">
                គ្រូ ម៉េង ហួរ
              </div>
            </div>

            <div>
              <div className="font-bold font-khmer text-slate-800">ប្រធានការិយាល័យសិក្សា</div>
              <div className="text-[11px] text-slate-500">Academic Director</div>
              <div className="h-16 flex items-end justify-center font-khmer text-slate-700 font-medium">
                លោក ជា គន្ធា
              </div>
            </div>

            <div>
              <div className="font-bold font-khmer text-slate-800">នាយកសាខាសាលា (ត្រា)</div>
              <div className="text-[11px] text-slate-500">Campus Director & Seal</div>
              <div className="h-16 flex items-end justify-center font-khmer font-bold text-blue-900">
                {branch.directorName}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
