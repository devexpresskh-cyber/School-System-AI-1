import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { AcademicRecord, Student } from '../../types';
import { ReportCardPrintModal } from './ReportCardPrintModal';
import { 
  Award, 
  Printer, 
  Search, 
  Plus, 
  GraduationCap, 
  TrendingUp, 
  Users, 
  CheckCircle2,
  X,
  FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const AcademicPerformanceView: React.FC = () => {
  const { 
    branchAcademicRecords, 
    branchStudents, 
    addAcademicRecord, 
    selectedBranch, 
    settings,
    setSelectedStudentId,
    setActiveTab 
  } = useSchool();

  const [selectedGrade, setSelectedGrade] = useState('ថ្នាក់ទី ១២');
  const [selectedTerm, setSelectedTerm] = useState('Semester 1');
  const [searchStudent, setSearchStudent] = useState('');

  // Modals
  const [selectedRecordForPrint, setSelectedRecordForPrint] = useState<AcademicRecord | null>(null);
  const [isAddRecordModalOpen, setIsAddRecordModalOpen] = useState(false);

  // Form state for adding marks
  const [selectedStudentForMarks, setSelectedStudentForMarks] = useState<Student | null>(branchStudents[0] || null);
  const [newTerm, setNewTerm] = useState<'Semester 1' | 'Semester 2' | 'Annual'>('Semester 1');
  const [scoreKhmer, setScoreKhmer] = useState(88);
  const [scoreMath, setScoreMath] = useState(90);
  const [scoreEnglish, setScoreEnglish] = useState(92);
  const [scorePhysics, setScorePhysics] = useState(85);
  const [scoreChemistry, setScoreChemistry] = useState(86);
  const [scoreBiology, setScoreBiology] = useState(89);
  const [scoreICT, setScoreICT] = useState(95);
  const [scoreHistory, setScoreHistory] = useState(88);
  const [scoreMoral, setScoreMoral] = useState(94);
  const [feedback, setFeedback] = useState('Outstanding academic progress.');

  // Filtered records
  const filteredRecords = branchAcademicRecords.filter(r => {
    const matchGrade = !selectedGrade || r.classGrade === selectedGrade;
    const matchTerm = !selectedTerm || r.term === selectedTerm;
    const matchSearch = !searchStudent.trim() ||
      r.studentNameKhmer.toLowerCase().includes(searchStudent.toLowerCase()) ||
      r.studentName.toLowerCase().includes(searchStudent.toLowerCase()) ||
      r.studentCode.toLowerCase().includes(searchStudent.toLowerCase());

    return matchGrade && matchTerm && matchSearch;
  });

  // Sort by Rank / Average descending
  const sortedRecords = [...filteredRecords].sort((a, b) => b.average - a.average);

  // Overall Statistics
  const classAvg = sortedRecords.length > 0 
    ? (sortedRecords.reduce((acc, r) => acc + r.average, 0) / sortedRecords.length).toFixed(1)
    : '0';

  const avgGPA = sortedRecords.length > 0
    ? (sortedRecords.reduce((acc, r) => acc + r.gpa, 0) / sortedRecords.length).toFixed(2)
    : '0';

  const passRate = sortedRecords.length > 0
    ? ((sortedRecords.filter(r => r.average >= 50).length / sortedRecords.length) * 100).toFixed(0)
    : '100';

  // Export to Excel
  const handleExportGradesXLS = () => {
    const data = sortedRecords.map((r, i) => ({
      'Rank': i + 1,
      'Student Code': r.studentCode,
      'Student Name (Khmer)': r.studentNameKhmer,
      'Student Name (English)': r.studentName,
      'Class': r.classGrade,
      'Term': r.term,
      'Khmer Literature': r.subjects.find(s => s.subjectId === 'khm')?.score || 0,
      'Mathematics': r.subjects.find(s => s.subjectId === 'mat')?.score || 0,
      'English': r.subjects.find(s => s.subjectId === 'eng')?.score || 0,
      'Physics': r.subjects.find(s => s.subjectId === 'phy')?.score || 0,
      'Chemistry': r.subjects.find(s => s.subjectId === 'che')?.score || 0,
      'Biology': r.subjects.find(s => s.subjectId === 'bio')?.score || 0,
      'ICT': r.subjects.find(s => s.subjectId === 'ict')?.score || 0,
      'Total Score': r.totalScore,
      'Average (%)': r.average,
      'GPA': r.gpa,
      'Conduct': r.behaviorGrade,
      'Attendance (%)': r.attendanceRate
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Grade Sheet');
    XLSX.writeFile(workbook, `FBIS_${selectedGrade}_Grades_${selectedTerm}.xlsx`);
  };

  const handleSaveMarks = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForMarks) return;

    const subjects = [
      { subjectId: 'khm', subjectName: 'Khmer Literature', subjectNameKhmer: 'អក្សរសាស្ត្រខ្មែរ', score: scoreKhmer, maxScore: 100, grade: scoreKhmer >= 90 ? 'A' : scoreKhmer >= 80 ? 'B' : 'C' as any },
      { subjectId: 'mat', subjectName: 'Mathematics', subjectNameKhmer: 'គណិតវិទ្យា', score: scoreMath, maxScore: 100, grade: scoreMath >= 90 ? 'A' : scoreMath >= 80 ? 'B' : 'C' as any },
      { subjectId: 'eng', subjectName: 'English Communication', subjectNameKhmer: 'ភាសាអង់គ្លេស', score: scoreEnglish, maxScore: 100, grade: scoreEnglish >= 90 ? 'A' : scoreEnglish >= 80 ? 'B' : 'C' as any },
      { subjectId: 'phy', subjectName: 'Physics', subjectNameKhmer: 'រូបវិទ្យា', score: scorePhysics, maxScore: 100, grade: scorePhysics >= 90 ? 'A' : scorePhysics >= 80 ? 'B' : 'C' as any },
      { subjectId: 'che', subjectName: 'Chemistry', subjectNameKhmer: 'គីមីវិទ្យា', score: scoreChemistry, maxScore: 100, grade: scoreChemistry >= 90 ? 'A' : scoreChemistry >= 80 ? 'B' : 'C' as any },
      { subjectId: 'bio', subjectName: 'Biology', subjectNameKhmer: 'ជីវវិទ្យា', score: scoreBiology, maxScore: 100, grade: scoreBiology >= 90 ? 'A' : scoreBiology >= 80 ? 'B' : 'C' as any },
      { subjectId: 'ict', subjectName: 'ICT & Coding', subjectNameKhmer: 'ព័ត៌មានវិទ្យា', score: scoreICT, maxScore: 100, grade: scoreICT >= 90 ? 'A' : scoreICT >= 80 ? 'B' : 'C' as any },
      { subjectId: 'his', subjectName: 'History & Geography', subjectNameKhmer: 'ប្រវត្តិវិទ្យា-ភូមិវិទ្យា', score: scoreHistory, maxScore: 100, grade: scoreHistory >= 90 ? 'A' : scoreHistory >= 80 ? 'B' : 'C' as any },
      { subjectId: 'mor', subjectName: 'Moral & Civics', subjectNameKhmer: 'សីលធម៌-ពលរដ្ឋ', score: scoreMoral, maxScore: 100, grade: scoreMoral >= 90 ? 'A' : scoreMoral >= 80 ? 'B' : 'C' as any },
    ];

    const totalScore = subjects.reduce((sum, s) => sum + s.score, 0);
    const average = Number((totalScore / subjects.length).toFixed(2));
    const gpa = Number((average / 25).toFixed(2));

    addAcademicRecord({
      studentId: selectedStudentForMarks.id,
      studentCode: selectedStudentForMarks.studentCode,
      studentName: selectedStudentForMarks.nameEnglish,
      studentNameKhmer: selectedStudentForMarks.nameKhmer,
      classGrade: selectedStudentForMarks.classGrade,
      academicYear: '2025-2026',
      term: newTerm,
      branchId: selectedBranch.id,
      subjects,
      totalScore,
      average,
      gpa,
      rank: sortedRecords.length + 1,
      totalStudentsInClass: 35,
      behaviorGrade: 'A',
      attendanceRate: 98.5,
      teacherFeedback: feedback,
      dateRecorded: new Date().toISOString().split('T')[0]
    });

    setIsAddRecordModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Actions Bar */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Grade Level</label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="h-9 px-3 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 font-khmer bg-white"
            >
              {settings.gradeLevels.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Academic Term</label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="h-9 px-3 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="Semester 1">Semester 1 (ឆមាសទី១)</option>
              <option value="Semester 2">Semester 2 (ឆមាសទី២)</option>
              <option value="Quarter 1">Quarter 1 (ត្រីមាសទី១)</option>
              <option value="Quarter 2">Quarter 2 (ត្រីមាសទី២)</option>
              <option value="Annual">Annual (ប្រចាំឆ្នាំ)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Filter Student</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search student name..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                className="h-9 pl-8 pr-3 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 w-48"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-4 sm:pt-0">
          <button
            onClick={handleExportGradesXLS}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-slate-300 transition-colors shadow-2xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Rank Sheet (.xlsx)</span>
          </button>

          <button
            onClick={() => setIsAddRecordModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Enter Marks</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Class Size</span>
            <div className="text-xl font-black text-slate-900 font-mono">
              {sortedRecords.length} <span className="text-xs font-normal text-slate-500 font-khmer">សិស្ស</span>
            </div>
            <div className="text-[11px] text-blue-700 font-khmer">{selectedGrade} · {selectedBranch.code}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Class Average</span>
            <div className="text-xl font-black text-emerald-700 font-mono">{classAvg}%</div>
            <div className="text-[11px] text-emerald-600 font-khmer">មធ្យមភាគទូទាំងថ្នាក់</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Top Performer (Rank #1)</span>
            <div className="text-sm font-bold text-slate-900 font-khmer truncate max-w-[140px]">
              {sortedRecords[0]?.studentNameKhmer || 'N/A'}
            </div>
            <div className="text-[11px] text-amber-600 font-mono">
              {sortedRecords[0] ? `${sortedRecords[0].average}% (GPA ${sortedRecords[0].gpa})` : '-'}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Passing Rate</span>
            <div className="text-xl font-black text-purple-900 font-mono">{passRate}%</div>
            <div className="text-[11px] text-purple-700 font-mono">Avg GPA: {avgGPA}</div>
          </div>
        </div>
      </div>

      {/* Main Ranking Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Academic Ranking & Mark Sheet ({selectedGrade} - {selectedTerm})
            </h3>
            <p className="text-[11px] text-slate-400 font-khmer">
              តារាងចំណាត់ថ្នាក់ និងពិន្ទុប្រឡងលម្អិតផ្លូវការ
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
            {sortedRecords.length} Students Ranked
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-semibold font-khmer border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 text-center w-14">ចំណាត់ថ្នាក់</th>
                <th className="py-3 px-3">អត្តលេខ</th>
                <th className="py-3 px-3">ឈ្មោះសិស្ស</th>
                <th className="py-3 px-2 text-center">ភាសាខ្មែរ</th>
                <th className="py-3 px-2 text-center">គណិត</th>
                <th className="py-3 px-2 text-center">អង់គ្លេស</th>
                <th className="py-3 px-2 text-center">រូប</th>
                <th className="py-3 px-2 text-center">គីមី</th>
                <th className="py-3 px-2 text-center">ជីវ</th>
                <th className="py-3 px-2 text-center">ICT</th>
                <th className="py-3 px-3 text-center">ពិន្ទុសរុប</th>
                <th className="py-3 px-3 text-center">មធ្យមភាគ</th>
                <th className="py-3 px-2 text-center">GPA</th>
                <th className="py-3 px-2 text-center">សីលធម៌</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedRecords.length === 0 ? (
                <tr>
                  <td colSpan={15} className="py-12 text-center text-slate-400">
                    No academic records available for {selectedGrade}. Click "Enter Marks" to add student scores.
                  </td>
                </tr>
              ) : (
                sortedRecords.map((r, index) => {
                  const rank = index + 1;
                  const isTop3 = rank <= 3;
                  return (
                    <tr 
                      key={r.id}
                      className={`hover:bg-blue-50/40 transition-colors ${
                        rank === 1 ? 'bg-amber-50/30' : rank === 2 ? 'bg-slate-50/50' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center">
                        {rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 text-white font-black text-xs shadow-xs">
                            🥇 1
                          </span>
                        ) : rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300 text-slate-800 font-black text-xs shadow-xs">
                            🥈 2
                          </span>
                        ) : rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-600 text-white font-black text-xs shadow-xs">
                            🥉 3
                          </span>
                        ) : (
                          <span className="font-mono text-slate-600 font-semibold">
                            #{rank}
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 font-mono font-medium text-slate-600">{r.studentCode}</td>
                      <td className="py-2.5 px-3">
                        <button
                          onClick={() => {
                            setSelectedStudentId(r.studentId);
                            setActiveTab('student-profile');
                          }}
                          className="font-khmer font-bold text-slate-900 hover:text-blue-600 hover:underline cursor-pointer block text-left"
                        >
                          {r.studentNameKhmer}
                        </button>
                        <span className="text-[11px] text-slate-500 font-sans block">{r.studentName}</span>
                      </td>

                      {/* Subject Marks */}
                      <td className="py-2.5 px-2 text-center font-mono">
                        {r.subjects.find(s => s.subjectId === 'khm')?.score || '-'}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono">
                        {r.subjects.find(s => s.subjectId === 'mat')?.score || '-'}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono">
                        {r.subjects.find(s => s.subjectId === 'eng')?.score || '-'}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono">
                        {r.subjects.find(s => s.subjectId === 'phy')?.score || '-'}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono">
                        {r.subjects.find(s => s.subjectId === 'che')?.score || '-'}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono">
                        {r.subjects.find(s => s.subjectId === 'bio')?.score || '-'}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono">
                        {r.subjects.find(s => s.subjectId === 'ict')?.score || '-'}
                      </td>

                      {/* Total & Average */}
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-900">
                        {r.totalScore}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-700 text-sm">
                        {r.average}%
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono font-semibold text-purple-900">
                        {r.gpa}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-xs">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {r.behaviorGrade}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => setSelectedRecordForPrint(r)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                          title="Print Official Report Card"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Report Card</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Record / Mark Entry Modal */}
      {isAddRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden border border-slate-200 my-6">
            <div className="bg-blue-800 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-200" />
                <span>Enter Academic Exam Marks (បញ្ចូលពិន្ទុប្រឡង)</span>
              </h3>
              <button
                onClick={() => setIsAddRecordModalOpen(false)}
                className="text-blue-200 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMarks} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Student / សិស្ស</label>
                  <select
                    value={selectedStudentForMarks?.id}
                    onChange={(e) => {
                      const found = branchStudents.find(s => s.id === e.target.value);
                      if (found) setSelectedStudentForMarks(found);
                    }}
                    className="w-full h-9 px-3 border border-slate-300 rounded-md font-khmer focus:ring-1 focus:ring-blue-500"
                  >
                    {branchStudents.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.nameKhmer} ({s.classGrade} - {s.roll})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Examination Term / វគ្គប្រឡង</label>
                  <select
                    value={newTerm}
                    onChange={(e) => setNewTerm(e.target.value as any)}
                    className="w-full h-9 px-3 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Semester 1">Semester 1 (ឆមាសទី១)</option>
                    <option value="Semester 2">Semester 2 (ឆមាសទី២)</option>
                    <option value="Annual">Annual (ប្រចាំឆ្នាំ)</option>
                  </select>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                <h4 className="font-bold text-slate-700 mb-2 font-khmer">ពិន្ទុមុខវិជ្ជា (Scores out of 100)</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1 font-khmer">អក្សរសាស្ត្រខ្មែរ</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={scoreKhmer}
                      onChange={(e) => setScoreKhmer(parseInt(e.target.value, 10) || 0)}
                      className="w-full h-8 px-2 border rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-khmer">គណិតវិទ្យា</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={scoreMath}
                      onChange={(e) => setScoreMath(parseInt(e.target.value, 10) || 0)}
                      className="w-full h-8 px-2 border rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-khmer">ភាសាអង់គ្លេស</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={scoreEnglish}
                      onChange={(e) => setScoreEnglish(parseInt(e.target.value, 10) || 0)}
                      className="w-full h-8 px-2 border rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-khmer">រូបវិទ្យា</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={scorePhysics}
                      onChange={(e) => setScorePhysics(parseInt(e.target.value, 10) || 0)}
                      className="w-full h-8 px-2 border rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-khmer">គីមីវិទ្យា</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={scoreChemistry}
                      onChange={(e) => setScoreChemistry(parseInt(e.target.value, 10) || 0)}
                      className="w-full h-8 px-2 border rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-khmer">ជីវវិទ្យា</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={scoreBiology}
                      onChange={(e) => setScoreBiology(parseInt(e.target.value, 10) || 0)}
                      className="w-full h-8 px-2 border rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-khmer">ព័ត៌មានវិទ្យា (ICT)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={scoreICT}
                      onChange={(e) => setScoreICT(parseInt(e.target.value, 10) || 0)}
                      className="w-full h-8 px-2 border rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-khmer">ប្រវត្តិវិទ្យា</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={scoreHistory}
                      onChange={(e) => setScoreHistory(parseInt(e.target.value, 10) || 0)}
                      className="w-full h-8 px-2 border rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-khmer">សីលធម៌-ពលរដ្ឋ</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={scoreMoral}
                      onChange={(e) => setScoreMoral(parseInt(e.target.value, 10) || 0)}
                      className="w-full h-8 px-2 border rounded font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 font-khmer">មតិគ្រូបន្ទុកថ្នាក់ (Teacher Feedback)</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md font-khmer"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddRecordModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  Save Marks & Compute Rank
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Report Card Modal */}
      <ReportCardPrintModal
        record={selectedRecordForPrint}
        branch={selectedBranch}
        settings={settings}
        onClose={() => setSelectedRecordForPrint(null)}
      />
    </div>
  );
};
