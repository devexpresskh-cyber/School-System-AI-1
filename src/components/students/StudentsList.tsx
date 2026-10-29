import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Student } from '../../types';
import { AddPaymentModal } from '../finance/AddPaymentModal';
import { CallNotesModal } from './CallNotesModal';
import { AdmissionFormModal } from './AdmissionFormModal';
import { SinglePromoteModal } from './SinglePromoteModal';
import { ExcelCopyPasteModal } from '../excel/ExcelCopyPasteModal';
import { MoEYSClassRosterModal } from '../reports/MoEYSClassRosterModal';
import { 
  Search, 
  Plus, 
  GraduationCap, 
  Package, 
  Phone, 
  MapPin, 
  UserPlus, 
  X, 
  Filter, 
  PhoneCall, 
  FileText, 
  Printer, 
  TrendingUp,
  Clipboard,
  FileSpreadsheet,
  Users
} from 'lucide-react';

export const StudentsList: React.FC = () => {
  const { 
    branchStudents, 
    setSelectedStudentId, 
    setActiveTab, 
    addStudent,
    currentBranchId, 
    selectedBranch,
    settings 
  } = useSchool();

  const [searchFilter, setSearchFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [targetStudentForPayment, setTargetStudentForPayment] = useState<Student | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [targetStudentForCallNote, setTargetStudentForCallNote] = useState<Student | null>(null);
  const [isCallNotesModalOpen, setIsCallNotesModalOpen] = useState(false);
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);
  const [admissionModalStudent, setAdmissionModalStudent] = useState<Student | null>(null);
  const [targetStudentForPromote, setTargetStudentForPromote] = useState<Student | null>(null);
  const [isCopyPasteModalOpen, setIsCopyPasteModalOpen] = useState(false);
  const [isMoEYSModalOpen, setIsMoEYSModalOpen] = useState(false);

  // New Student Form
  const [newNameKhmer, setNewNameKhmer] = useState('');
  const [newNameEnglish, setNewNameEnglish] = useState('');
  const [newRoll, setNewRoll] = useState('');
  const [newClass, setNewClass] = useState('ថ្នាក់ទី ១០');
  const [newGender, setNewGender] = useState<'Female' | 'Male'>('Female');
  const [newPhone, setNewPhone] = useState('');
  const [newBirthday, setNewBirthday] = useState('2008-05-15');
  const [newAddress, setNewAddress] = useState('ក្រុងសៀមរាប ខេត្តសៀមរាប');
  const [newParentName, setNewParentName] = useState('');

  const filteredStudents = branchStudents.filter(s => {
    const matchSearch = !searchFilter.trim() ||
      s.nameKhmer.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.nameEnglish.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.roll.includes(searchFilter) ||
      s.studentCode.toLowerCase().includes(searchFilter.toLowerCase());

    const matchGrade = !gradeFilter || s.classGrade === gradeFilter;
    return matchSearch && matchGrade;
  });

  const handleOpenStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    setActiveTab('student-profile');
  };

  const handleOpenPayment = (e: React.MouseEvent, s: Student) => {
    e.stopPropagation();
    setTargetStudentForPayment(s);
    setIsPaymentModalOpen(true);
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const roll = newRoll || String(Math.floor(2000 + Math.random() * 8000));
    const created = addStudent({
      studentCode: `FBIS02-00${roll}`,
      nameKhmer: newNameKhmer,
      nameEnglish: newNameEnglish || newNameKhmer,
      username: (newNameEnglish || newNameKhmer).replace(/\s+/g, '').toUpperCase(),
      roll,
      classGrade: newClass,
      gender: newGender,
      birthday: newBirthday,
      phone: newPhone,
      guardianPhone: newPhone,
      address: newAddress,
      parentName: newParentName || 'អាណាព្យាបាល',
      avatar: newGender === 'Female'
        ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      branchId: currentBranchId === 'all' ? 'fbis-02' : currentBranchId,
      status: 'active',
      registrationDate: new Date().toISOString().split('T')[0]
    });

    setIsAddStudentOpen(false);
    setSelectedStudentId(created.id);
    setActiveTab('student-profile');
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[240px]">
            <input
              type="text"
              placeholder="Search by student name, roll, code..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full h-9 pl-8 pr-3 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="h-9 px-3 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none font-khmer bg-white"
            >
              <option value="">All Grades (Select)</option>
              {settings.gradeLevels.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                localStorage.setItem('fbis_settings_tab', 'academic');
                setActiveTab('settings');
              }}
              className="h-9 px-2.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
              title="Add, edit, or delete classes in System Settings (គ្រប់គ្រងថ្នាក់រៀន)"
            >
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
              <span>គ្រប់គ្រងថ្នាក់</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsCopyPasteModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Copy and paste students directly from Excel or Google Sheets (Ctrl+C / Ctrl+V)"
          >
            <Clipboard className="w-4 h-4" />
            <span>Paste from Excel (បិទភ្ជាប់ Excel)</span>
          </button>

          <button
            onClick={() => setIsMoEYSModalOpen(true)}
            className="px-3.5 py-2 bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Open official MoEYS class roster for print (បញ្ជីរាយនាមសិស្សតាមថ្នាក់ទម្រង់ក្រសួង)"
          >
            <Printer className="w-4 h-4" />
            <span>MoEYS Roster (បញ្ជីក្រសួង)</span>
          </button>

          <button
            onClick={() => setActiveTab('all-fields-students')}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            title="View all 25+ student fields with custom columns and Excel export"
          >
            <Users className="w-4 h-4" />
            <span>All Fields Directory & Export</span>
          </button>

          <button
            onClick={() => setActiveTab('student-promote')}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            title="ឡើងថ្នាក់សិស្សជាថ្នាក់ ឬជាក្រុម (Class Promotion & Advancement)"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Promote (ឡើងថ្នាក់)</span>
          </button>

          <button
            onClick={() => {
              setAdmissionModalStudent(null);
              setIsAdmissionModalOpen(true);
            }}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Open official 2-page FBIS Admission Form (ពាក្យសុំចូលរៀន)"
          >
            <FileText className="w-4 h-4" />
            <span>ពាក្យសុំចូលរៀន</span>
          </button>

          <button
            onClick={() => setIsAddStudentOpen(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Quick Add</span>
          </button>
        </div>
      </div>

      {/* Search Results list matching Screenshot 111418 */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">
            Search Results ({filteredStudents.length} Students in {selectedBranch.code})
          </h3>
          <span className="text-xs text-slate-400 font-khmer">
            បញ្ជីសិស្សសាខា {selectedBranch.nameKhmer}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <GraduationCap className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p>No students found matching your criteria.</p>
            </div>
          ) : (
            filteredStudents.map((std) => (
              <div
                key={std.id}
                onClick={() => handleOpenStudent(std.id)}
                className="p-4 hover:bg-blue-50/50 transition-colors flex flex-wrap items-center justify-between gap-4 cursor-pointer group"
              >
                {/* Left: Avatar + Names + Grade */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 group-hover:border-blue-500 transition-colors shrink-0">
                    <img
                      src={std.avatar}
                      alt={std.nameEnglish}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 font-khmer group-hover:text-blue-700 transition-colors">
                        {std.nameKhmer}.
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        ({std.nameEnglish})
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      {/* Green class badge matching Screenshot 111418 */}
                      <span className="bg-[#84cc16] text-white text-[11px] font-bold px-2 py-0.5 rounded font-khmer shadow-2xs">
                        {std.classGrade}
                      </span>
                      <span className="font-mono text-[11px]">Roll: {std.roll}</span>
                      <span className="font-mono text-[11px]">Code: {std.studentCode}</span>
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {std.phone}
                      </span>
                      <span className="flex items-center gap-1 font-khmer">
                        <MapPin className="w-3 h-3" /> {std.address}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Amber buttons matching Screenshot 111418 "$ Add" and "Box", plus Call Note */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTargetStudentForCallNote(std);
                      setIsCallNotesModalOpen(true);
                    }}
                    className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                    title="Log Call Note with parent"
                  >
                    <PhoneCall className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => handleOpenPayment(e, std)}
                    className="px-4 py-2 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                    title="Add Payment for this student"
                  >
                    <span>$ Add</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTargetStudentForPromote(std);
                    }}
                    className="p-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
                    title="ឡើងថ្នាក់សិស្សនេះ (Promote Student)"
                  >
                    <TrendingUp className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setAdmissionModalStudent(std);
                      setIsAdmissionModalOpen(true);
                    }}
                    className="p-2 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
                    title="View & Print Official Admission Form (ពាក្យសុំចូលរៀន)"
                  >
                    <FileText className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenStudent(std.id);
                    }}
                    className="p-2 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                    title="View Student Profile & Inventory Items"
                  >
                    <Package className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Student Modal */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl overflow-hidden border border-slate-200 my-8">
            <div className="bg-blue-800 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-200" />
                <span>New Student Admission Form (ចុះឈ្មោះសិស្សថ្មី)</span>
              </h3>
              <button
                onClick={() => setIsAddStudentOpen(false)}
                className="text-blue-200 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ឈ្មោះជាភាសាខ្មែរ (Khmer Name)</label>
                  <input
                    type="text"
                    required
                    value={newNameKhmer}
                    onChange={(e) => setNewNameKhmer(e.target.value)}
                    placeholder="ឧ. គឹមថៃ សួនីន"
                    className="w-full h-9 px-3 text-xs border border-slate-300 rounded-md font-khmer focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">English Name</label>
                  <input
                    type="text"
                    required
                    value={newNameEnglish}
                    onChange={(e) => setNewNameEnglish(e.target.value)}
                    placeholder="e.g. Kimthai Sonine"
                    className="w-full h-9 px-3 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Roll / អត្តលេខ</label>
                  <input
                    type="text"
                    value={newRoll}
                    onChange={(e) => setNewRoll(e.target.value)}
                    placeholder="Auto or 3805"
                    className="w-full h-9 px-3 text-xs border border-slate-300 rounded-md font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Class / ថ្នាក់ទី</label>
                  <select
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value)}
                    className="w-full h-9 px-3 text-xs border border-slate-300 rounded-md font-khmer focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    {settings.gradeLevels.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender / ភេទ</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as any)}
                    className="w-full h-9 px-3 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Female">Female (ស្រី)</option>
                    <option value="Male">Male (ប្រុស)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="077 473 545"
                    className="w-full h-9 px-3 text-xs border border-slate-300 rounded-md font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Birthday</label>
                  <input
                    type="date"
                    value={newBirthday}
                    onChange={(e) => setNewBirthday(e.target.value)}
                    className="w-full h-9 px-3 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Parent / Guardian Name</label>
                <input
                  type="text"
                  value={newParentName}
                  onChange={(e) => setNewParentName(e.target.value)}
                  placeholder="ឈ្មោះឪពុក ឬ ម្តាយ"
                  className="w-full h-9 px-3 text-xs border border-slate-300 rounded-md font-khmer focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Address / អាសយដ្ឋាន</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full h-9 px-3 text-xs border border-slate-300 rounded-md font-khmer focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer"
                >
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Payment Modal */}
      <AddPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        preselectedStudent={targetStudentForPayment}
      />

      {/* Call Notes Modal */}
      <CallNotesModal
        isOpen={isCallNotesModalOpen}
        student={targetStudentForCallNote}
        onClose={() => {
          setIsCallNotesModalOpen(false);
          setTargetStudentForCallNote(null);
        }}
      />

      {/* Official FBIS Admission Form Modal (Matching PDF) */}
      <AdmissionFormModal
        isOpen={isAdmissionModalOpen}
        initialStudent={admissionModalStudent}
        onClose={() => {
          setIsAdmissionModalOpen(false);
          setAdmissionModalStudent(null);
        }}
        onStudentEnrolled={(std) => {
          setSelectedStudentId(std.id);
          setActiveTab('student-profile');
        }}
      />

      {/* Single Student Promote Modal */}
      {targetStudentForPromote && (
        <SinglePromoteModal
          isOpen={!!targetStudentForPromote}
          student={targetStudentForPromote}
          onClose={() => setTargetStudentForPromote(null)}
        />
      )}

      {/* Copy & Paste from Excel Modal */}
      {isCopyPasteModalOpen && (
        <ExcelCopyPasteModal
          isOpen={isCopyPasteModalOpen}
          onClose={() => setIsCopyPasteModalOpen(false)}
          defaultType="students"
        />
      )}

      {/* Official MoEYS Class Roster Document Format Modal */}
      {isMoEYSModalOpen && (
        <MoEYSClassRosterModal
          isOpen={isMoEYSModalOpen}
          onClose={() => setIsMoEYSModalOpen(false)}
          initialClassGrade={gradeFilter || undefined}
        />
      )}
    </div>
  );
};
