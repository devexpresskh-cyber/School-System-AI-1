import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Student } from '../../types';
import { TrendingUp, X, Check, GraduationCap, ArrowRight } from 'lucide-react';

interface SinglePromoteModalProps {
  isOpen: boolean;
  student: Student;
  onClose: () => void;
  onPromoted?: (newClass: string, newYear: string) => void;
}

export const SinglePromoteModal: React.FC<SinglePromoteModalProps> = ({
  isOpen,
  student,
  onClose,
  onPromoted
}) => {
  const { settings, promoteSingleStudent } = useSchool();

  const gradeLevels = settings.gradeLevels && settings.gradeLevels.length > 0
    ? settings.gradeLevels
    : [
        'K1', 'K2', 'K3',
        'ថ្នាក់ទី ១', 'ថ្នាក់ទី ២', 'ថ្នាក់ទី ៣', 'ថ្នាក់ទី ៤', 'ថ្នាក់ទី ៥', 'ថ្នាក់ទី ៦',
        'ថ្នាក់ទី ៧', 'ថ្នាក់ទី ៨', 'ថ្នាក់ទី ៩', 'ថ្នាក់ទី ១០', 'ថ្នាក់ទី ១១', 'ថ្នាក់ទី ១២'
      ];

  // Default next grade
  const currentIdx = gradeLevels.findIndex(g => g.trim().toLowerCase() === student.classGrade.trim().toLowerCase());
  const initialTargetClass = currentIdx !== -1 && currentIdx < gradeLevels.length - 1
    ? gradeLevels[currentIdx + 1]
    : student.classGrade;

  const [targetClass, setTargetClass] = useState(initialTargetClass);
  const [targetYear, setTargetYear] = useState('2026-2027');
  const [status, setStatus] = useState<'active' | 'graduated'>('active');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    promoteSingleStudent(student.id, targetClass, targetYear, status);
    if (onPromoted) {
      onPromoted(targetClass, targetYear);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="bg-blue-800 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-300" />
            <h3 className="text-sm font-bold font-khmer">ឡើងថ្នាក់សិស្ស (Promote Student)</h3>
          </div>
          <button onClick={onClose} className="text-blue-200 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Student mini card */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
            <img
              src={student.avatar}
              alt={student.nameEnglish}
              className="w-10 h-10 rounded-full object-cover border border-slate-200"
            />
            <div>
              <div className="font-bold font-khmer text-slate-900">{student.nameKhmer}</div>
              <div className="text-[11px] text-slate-500 font-mono">
                {student.studentCode} · {student.nameEnglish}
              </div>
              <div className="text-[11px] font-semibold text-blue-700 mt-0.5">
                ថ្នាក់បច្ចុប្បន្ន: {student.classGrade} ({student.academicYear || '2025-2026'})
              </div>
            </div>
          </div>

          {/* Promotion Path Visualization */}
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-center gap-3 font-khmer text-xs">
            <span className="font-bold text-slate-700 px-2.5 py-1 bg-white rounded-md border border-slate-200 shadow-2xs">
              {student.classGrade}
            </span>
            <ArrowRight className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-bold text-emerald-700 px-2.5 py-1 bg-emerald-50 rounded-md border border-emerald-300 shadow-2xs">
              {status === 'graduated' ? 'បញ្ចប់ការសិក្សា' : targetClass}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 font-khmer">
                ថ្នាក់គោលដៅថ្មី (Target Class Grade):
              </label>
              <select
                value={status === 'graduated' ? 'GRADUATED' : targetClass}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'GRADUATED') {
                    setStatus('graduated');
                  } else {
                    setStatus('active');
                    setTargetClass(val);
                  }
                }}
                className="w-full h-9 px-3 border border-slate-300 rounded-lg bg-white font-khmer focus:ring-1 focus:ring-blue-500"
              >
                {gradeLevels.map(gl => (
                  <option key={gl} value={gl}>
                    {gl} {gl === student.classGrade ? '(ត្រួតថ្នាក់ដដែល)' : ''}
                  </option>
                ))}
                <option value="GRADUATED">បញ្ចប់ការសិក្សា (Graduated / Alumni)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 font-khmer">
                ឆ្នាំសិក្សាថ្មី (Target Academic Year):
              </label>
              <select
                value={targetYear}
                onChange={(e) => setTargetYear(e.target.value)}
                className="w-full h-9 px-3 border border-slate-300 rounded-lg bg-white font-mono focus:ring-1 focus:ring-blue-500"
              >
                <option value="2026-2027">2026-2027 (ឆ្នាំសិក្សាថ្មី)</option>
                <option value="2027-2028">2027-2028</option>
                <option value="2025-2026">2025-2026</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              បោះបង់ (Cancel)
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>រក្សាទុក & ឡើងថ្នាក់ (Promote)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
