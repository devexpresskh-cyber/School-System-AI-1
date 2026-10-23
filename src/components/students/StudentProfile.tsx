import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Logo } from '../common/Logo';
import { AddPaymentModal } from '../finance/AddPaymentModal';
import { InvoicePrintModal } from '../finance/InvoicePrintModal';
import { ReportCardPrintModal } from '../academic/ReportCardPrintModal';
import { CallNotesModal } from './CallNotesModal';
import { AdmissionFormModal } from './AdmissionFormModal';
import { 
  ArrowLeft, 
  User, 
  Edit3, 
  HeartPulse, 
  Receipt, 
  Award, 
  CalendarCheck, 
  ShieldAlert, 
  Plus, 
  Printer, 
  Phone, 
  MapPin, 
  Calendar,
  Save,
  Check,
  PhoneCall,
  Clock,
  Trash2,
  FileText
} from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const { 
    selectedStudentId, 
    getStudentById, 
    setActiveTab, 
    payments, 
    academicRecords,
    updateStudent,
    selectedBranch,
    settings,
    callNotes,
    deleteCallNote
  } = useSchool();

  const [activeSection, setActiveSection] = useState<
    'personal' | 'update' | 'medical' | 'payments' | 'marks' | 'attendance' | 'behavior' | 'call-notes'
  >('personal');

  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
  const [isCallNotesModalOpen, setIsCallNotesModalOpen] = useState(false);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<any>(null);
  const [selectedAcademicRecordForPrint, setSelectedAcademicRecordForPrint] = useState<any>(null);
  const [isAdmissionFormOpen, setIsAdmissionFormOpen] = useState(false);

  const student = selectedStudentId ? getStudentById(selectedStudentId) : null;

  // Edit form state
  const [editNameKhmer, setEditNameKhmer] = useState(student?.nameKhmer || '');
  const [editNameEnglish, setEditNameEnglish] = useState(student?.nameEnglish || '');
  const [editPhone, setEditPhone] = useState(student?.phone || '');
  const [editGuardianPhone, setEditGuardianPhone] = useState(student?.guardianPhone || '');
  const [editAddress, setEditAddress] = useState(student?.address || '');
  const [editParentName, setEditParentName] = useState(student?.parentName || '');
  const [editClass, setEditClass] = useState(student?.classGrade || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!student) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <p className="text-slate-500 mb-4">No student selected.</p>
        <button
          onClick={() => setActiveTab('students')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
        >
          Back to Students Directory
        </button>
      </div>
    );
  }

  // Payments for this student
  const studentPayments = payments.filter(p => p.studentId === student.id || p.studentNameKhmer === student.nameKhmer);
  
  // Total stats for payments table
  const totalAmountToBePaid = studentPayments.reduce((acc, p) => acc + p.amountToBePaid, 0);
  const totalPaidUSD = studentPayments.reduce((acc, p) => acc + p.paidUSD, 0);
  const totalPaidKHR = studentPayments.reduce((acc, p) => acc + p.paidKHR, 0);
  const totalOwedRemain = studentPayments.reduce((acc, p) => acc + p.owedRemain, 0);

  // Academic records for this student
  const studentAcademic = academicRecords.find(a => a.studentId === student.id || a.studentCode === student.studentCode) || academicRecords[0];

  const handleUpdateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudent(student.id, {
      nameKhmer: editNameKhmer,
      nameEnglish: editNameEnglish,
      phone: editPhone,
      guardianPhone: editGuardianPhone,
      address: editAddress,
      parentName: editParentName,
      classGrade: editClass
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Top navigation back button matching Screenshot 111500 */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab('students')}
          className="p-1.5 bg-white text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Students List</span>
        </button>
      </div>

      {/* Main Container Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (3 cols): FBIS Logo Card + Quick Links matching screenshot */}
        <div className="lg:col-span-3 space-y-4">
          {/* FBIS School Seal Card */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs text-center flex flex-col items-center">
            <Logo size="xl" branchNumber={selectedBranch.code.replace('FBIS ', '')} />
            
            <div className="mt-3 text-xs font-bold text-blue-900 font-khmer">
              {settings.schoolNameKhmer}
            </div>
            <div className="text-[10px] font-extrabold text-red-600 uppercase tracking-wider mt-0.5">
              {settings.schoolNameEnglish}
            </div>

            {/* Social Icons row matching screenshot */}
            <div className="flex items-center justify-center gap-3 mt-4 text-slate-400">
              <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs hover:text-blue-600 hover:bg-blue-50 cursor-pointer">
                f
              </span>
              <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs hover:text-sky-500 hover:bg-sky-50 cursor-pointer">
                t
              </span>
              <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs hover:text-red-600 hover:bg-red-50 cursor-pointer">
                yt
              </span>
              <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs hover:text-pink-600 hover:bg-pink-50 cursor-pointer">
                ig
              </span>
            </div>
          </div>

          {/* Quick Links Card matching Screenshot 111336 & 111500 */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-800 mb-3 px-1">Quick Links</h3>
            <div className="space-y-1">
              {[
                { id: 'personal', label: 'Personal Information', icon: <User className="w-4 h-4" /> },
                { id: 'call-notes', label: 'Call Notes & Follow-ups', icon: <PhoneCall className="w-4 h-4 text-emerald-600" /> },
                { id: 'update', label: 'Update Information', icon: <Edit3 className="w-4 h-4" /> },
                { id: 'medical', label: 'Student Medical', icon: <HeartPulse className="w-4 h-4" /> },
                { id: 'payments', label: 'Payments History', icon: <Receipt className="w-4 h-4" /> },
                { id: 'marks', label: 'Marks & Academic', icon: <Award className="w-4 h-4" /> },
                { id: 'attendance', label: 'Attendance', icon: <CalendarCheck className="w-4 h-4" /> },
                { id: 'behavior', label: 'Behavior', icon: <ShieldAlert className="w-4 h-4" /> },
              ].map((link) => {
                const isActive = activeSection === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => setActiveSection(link.id as any)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-bold border-l-3 border-blue-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className={`${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                      {link.icon}
                    </span>
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (9 cols): Banner + Dynamic Section Content */}
        <div className="lg:col-span-9 space-y-4">
          {/* Student Banner matching Screenshot 111336 / 111500 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Landscape Cover Header */}
            <div className="h-44 md:h-52 bg-gradient-to-r from-amber-200 via-amber-300 to-emerald-200 relative overflow-hidden">
              <img
                src={student.coverImage || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&auto=format&fit=crop&q=80"}
                alt="School Banner"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/25" />

              {/* Student Avatar + Name Lockup inside Banner */}
              <div className="absolute bottom-4 left-6 flex items-end gap-4 text-white">
                <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-100 shrink-0">
                  <img
                    src={student.avatar}
                    alt={student.nameEnglish}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="pb-1 drop-shadow-md">
                  <h2 className="text-xl md:text-2xl font-bold font-khmer leading-tight text-white">
                    {student.nameKhmer}
                  </h2>
                  <div className="text-xs font-mono font-medium text-amber-200 tracking-wide">
                    @{student.username} · {student.nameEnglish}
                  </div>
                </div>
              </div>
            </div>

            {/* Metas row matching screenshot */}
            <div className="px-6 py-3 bg-white border-b border-slate-100 flex flex-wrap items-center gap-6 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">Account Type:</span>
                <span className="inline-block bg-blue-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider mt-0.5">
                  {student.status.toUpperCase()}
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] block">Member Since:</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{student.registrationDate}</span>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] block">Roll:</span>
                <span className="font-mono font-bold text-slate-800 mt-0.5 block">{student.roll}</span>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] block">Student Code:</span>
                <span className="font-mono font-bold text-blue-700 mt-0.5 block">{student.studentCode}</span>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => setIsAdmissionFormOpen(true)}
                  className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="View and print official FBIS Application for Admission (ពាក្យសុំចូលរៀន)"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>ពាក្យសុំចូលរៀន (Admission Form)</span>
                </button>

                <button
                  onClick={() => setIsCallNotesModalOpen(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Record phone call with parent"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Note</span>
                </button>

                <button
                  onClick={() => setIsAddPaymentModalOpen(true)}
                  className="px-3.5 py-1.5 bg-[#84cc16] hover:bg-[#65a30d] text-white text-xs font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Payment for Student</span>
                </button>
              </div>
            </div>

            {/* Dynamic Content Panel */}
            <div className="p-6">
              {/* SECTION: PERSONAL INFORMATION (Screenshot 111500) */}
              {activeSection === 'personal' && (
                <div className="space-y-6 animate-in fade-in duration-100">
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="text-sm font-bold text-slate-800">Personal Information</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-xs">
                    <div>
                      <span className="text-slate-400 block mb-0.5">Name (Khmer / English):</span>
                      <span className="text-slate-900 font-bold font-khmer text-sm">
                        {student.nameKhmer} <span className="font-normal font-sans text-xs text-slate-600">({student.nameEnglish})</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-0.5">Parent / Guardian:</span>
                      <span className="text-slate-800 font-khmer font-medium">
                        {student.parentName}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-0.5">Email / Student ID:</span>
                      <span className="text-slate-800 font-mono">
                        {student.username.toLowerCase()}@fbis.edu.kh
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-0.5">Guardian Phone Number:</span>
                      <span className="text-slate-800 font-mono font-medium flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {student.guardianPhone}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-0.5">Username:</span>
                      <span className="text-slate-800 font-mono font-bold uppercase">
                        {student.username}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-0.5">Birthday:</span>
                      <span className="text-slate-800 font-mono flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {student.birthday}
                      </span>
                    </div>

                    <div className="md:col-span-2">
                      <span className="text-slate-400 block mb-0.5">Address:</span>
                      <span className="text-slate-800 font-khmer flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {student.address}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-0.5">Gender:</span>
                      <span className="text-slate-800 font-medium">{student.gender}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-0.5">Class / Grade:</span>
                      <span className="text-blue-700 font-bold font-khmer text-sm">{student.classGrade}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-0.5">Branch Campus:</span>
                      <span className="text-slate-800 font-medium">{selectedBranch.nameEnglish}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-0.5">National ID / Citizen Card:</span>
                      <span className="text-slate-800 font-mono">{student.nationalId || '040820060012'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: PAYMENTS & INVOICES (Screenshot 111336) */}
              {activeSection === 'payments' && (
                <div className="space-y-4 animate-in fade-in duration-100">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="text-sm font-bold text-slate-800">Payments And Invoices</h3>
                    <button
                      onClick={() => setIsAddPaymentModalOpen(true)}
                      className="text-xs font-semibold text-lime-700 hover:text-lime-800 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Invoice
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-xs text-left whitespace-nowrap">
                      <thead className="bg-slate-50 text-slate-600 font-semibold font-khmer border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-2 text-center">ល.រ</th>
                          <th className="py-2.5 px-3">ថ្នាក់ទី</th>
                          <th className="py-2.5 px-3">ឆ្នាំសិក្សា</th>
                          <th className="py-2.5 px-3">លេខវិក្កយបត្រ</th>
                          <th className="py-2.5 px-3">បរិយាយ</th>
                          <th className="py-2.5 px-2 text-center">ប្រភេទបង់</th>
                          <th className="py-2.5 px-3">ថ្ងៃបង់ប្រាក់</th>
                          <th className="py-2.5 px-3">ថ្ងៃចាប់ផ្ដើម</th>
                          <th className="py-2.5 px-3">ថ្ងៃបញ្ចប់</th>
                          <th className="py-2.5 px-3 text-right">តម្លៃពេញ</th>
                          <th className="py-2.5 px-2 text-right">បញ្ចុះតម្លៃ</th>
                          <th className="py-2.5 px-3 text-right">តម្លៃត្រូវបង់</th>
                          <th className="py-2.5 px-3 text-right">ប្រាក់បង់($)</th>
                          <th className="py-2.5 px-3 text-right">ប្រាក់បង់(៛)</th>
                          <th className="py-2.5 px-3 text-right">ប្រាក់បង់សរុប</th>
                          <th className="py-2.5 px-3 text-right">ជំពាក់</th>
                          <th className="py-2.5 px-3 text-center">Options</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {studentPayments.length === 0 ? (
                          <tr>
                            <td colSpan={17} className="py-8 text-center text-slate-400">
                              No payment records found for this student.
                            </td>
                          </tr>
                        ) : (
                          studentPayments.map((p, idx) => (
                            <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                              <td className="py-2 px-2 text-center font-mono">{idx + 1}</td>
                              <td className="py-2 px-3 font-khmer">{p.classGrade}</td>
                              <td className="py-2 px-3 font-mono">{p.academicYear}</td>
                              <td className="py-2 px-3 font-mono font-bold text-blue-600">
                                {p.invoiceNumber}
                              </td>
                              <td className="py-2 px-3 font-khmer">{p.title}</td>
                              <td className="py-2 px-2 text-center font-mono">
                                {p.paymentType === 'ត្រីមាសទី១' ? '1' : 
                                 p.paymentType === 'ត្រីមាសទី២' ? '2' : '0'}
                              </td>
                              <td className="py-2 px-3 font-mono text-slate-500">{p.issuedDate}</td>
                              <td className="py-2 px-3 font-mono text-slate-500">{p.startDate}</td>
                              <td className="py-2 px-3 font-mono text-slate-500">{p.endDate}</td>
                              <td className="py-2 px-3 text-right font-mono">${p.fullAmount.toFixed(2)}</td>
                              <td className="py-2 px-2 text-right font-mono">{p.discountPercent > 0 ? `${p.discountPercent}%` : '0.00 %'}</td>
                              <td className="py-2 px-3 text-right font-mono font-medium">${p.amountToBePaid.toFixed(2)}</td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">${p.paidUSD.toFixed(2)}</td>
                              <td className="py-2 px-3 text-right font-mono">{p.paidKHR.toLocaleString()}</td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-slate-800">
                                ${(p.paidUSD + p.paidKHR / 4100).toFixed(2)}
                              </td>
                              <td className={`py-2 px-3 text-right font-mono font-bold ${p.owedRemain > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                                ${p.owedRemain.toFixed(2)}
                              </td>
                              <td className="py-2 px-3 text-center">
                                <button
                                  onClick={() => setSelectedInvoiceForPrint(p)}
                                  className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded cursor-pointer"
                                  title="Print Invoice"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                      {/* Total row matching screenshot */}
                      <tfoot className="bg-slate-100/80 font-bold border-t border-slate-300">
                        <tr>
                          <td colSpan={11} className="py-2.5 px-3 text-left font-khmer">Total / សរុប</td>
                          <td className="py-2.5 px-3 text-right font-mono">${totalAmountToBePaid.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-emerald-700">${totalPaidUSD.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right font-mono">{totalPaidKHR.toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-900">${(totalPaidUSD + totalPaidKHR / 4100).toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-red-600">${totalOwedRemain.toFixed(2)}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {/* SECTION: MARKS & ACADEMIC PERFORMANCE TRACKING */}
              {activeSection === 'marks' && studentAcademic && (
                <div className="space-y-5 animate-in fade-in duration-100">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Academic Marks & Term Performance</h3>
                      <p className="text-xs text-slate-500 font-khmer">
                        លទ្ធផលប្រឡងប្រចាំឆមាសទី១ ឆ្នាំសិក្សា {studentAcademic.academicYear}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedAcademicRecordForPrint(studentAcademic)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Official Report Card (ព្រឹត្តិបត្រពិន្ទុ)</span>
                    </button>
                  </div>

                  {/* Summary Metric Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                      <div className="text-[11px] font-semibold text-blue-600 uppercase">Class Rank</div>
                      <div className="text-2xl font-black text-blue-900 font-mono mt-0.5">
                        {studentAcademic.rank} <span className="text-xs font-normal text-slate-500">/ {studentAcademic.totalStudentsInClass}</span>
                      </div>
                      <div className="text-[10px] text-blue-700 font-khmer mt-0.5">ចំណាត់ថ្នាក់លេខ {studentAcademic.rank}</div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                      <div className="text-[11px] font-semibold text-emerald-600 uppercase">Average Score</div>
                      <div className="text-2xl font-black text-emerald-900 font-mono mt-0.5">
                        {studentAcademic.average}%
                      </div>
                      <div className="text-[10px] text-emerald-700 font-khmer mt-0.5">មធ្យមភាគសរុប</div>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
                      <div className="text-[11px] font-semibold text-purple-600 uppercase">GPA</div>
                      <div className="text-2xl font-black text-purple-900 font-mono mt-0.5">
                        {studentAcademic.gpa} <span className="text-xs font-normal text-slate-500">/ 4.00</span>
                      </div>
                      <div className="text-[10px] text-purple-700 font-khmer mt-0.5">កម្រិតពិន្ទុឆ្នើម</div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                      <div className="text-[11px] font-semibold text-amber-600 uppercase">Attendance</div>
                      <div className="text-2xl font-black text-amber-900 font-mono mt-0.5">
                        {studentAcademic.attendanceRate}%
                      </div>
                      <div className="text-[10px] text-amber-700 font-khmer mt-0.5">វត្តមានសិក្សាទៀងទាត់</div>
                    </div>
                  </div>

                  {/* Subject Breakdown Table */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-600 font-semibold font-khmer border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">មុខវិជ្ជា / Subject</th>
                          <th className="py-2.5 px-3 text-right">Max Score</th>
                          <th className="py-2.5 px-3 text-right">Score (ពិន្ទុ)</th>
                          <th className="py-2.5 px-3 text-center">Grade</th>
                          <th className="py-2.5 px-3">Teacher Assessment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {studentAcademic.subjects.map((sub) => (
                          <tr key={sub.subjectId} className="hover:bg-slate-50/80">
                            <td className="py-2.5 px-3">
                              <span className="font-bold text-slate-900 font-khmer">{sub.subjectNameKhmer}</span>
                              <span className="text-[11px] text-slate-500 ml-1.5">({sub.subjectName})</span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-500">{sub.maxScore}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-900 text-sm">
                              {sub.score}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className={`inline-block w-6 h-6 rounded-full font-bold text-xs leading-6 ${
                                sub.grade === 'A' ? 'bg-emerald-100 text-emerald-800' :
                                sub.grade === 'B' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                              }`}>
                                {sub.grade}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 italic">
                              {sub.teacherComment || 'Satisfactory progress demonstrated.'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Teacher Feedback Box */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-700 block mb-1">
                      Homeroom Teacher's Official Evaluation / មតិគ្រូបន្ទុកថ្នាក់:
                    </span>
                    <p className="text-xs text-slate-700 font-khmer leading-relaxed">
                      {studentAcademic.teacherFeedback}
                    </p>
                  </div>
                </div>
              )}

              {/* SECTION: UPDATE INFORMATION */}
              {activeSection === 'update' && (
                <form onSubmit={handleUpdateStudent} className="space-y-4 animate-in fade-in duration-100">
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="text-sm font-bold text-slate-800">Update Student Information</h3>
                  </div>

                  {saveSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Student information saved successfully!</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Name in Khmer</label>
                      <input
                        type="text"
                        value={editNameKhmer}
                        onChange={(e) => setEditNameKhmer(e.target.value)}
                        className="w-full h-9 px-3 text-xs border border-slate-300 rounded-md font-khmer focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Name in English</label>
                      <input
                        type="text"
                        value={editNameEnglish}
                        onChange={(e) => setEditNameEnglish(e.target.value)}
                        className="w-full h-9 px-3 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Student Phone Number</label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full h-9 px-3 text-xs border border-slate-300 rounded-md font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Guardian Phone Number</label>
                      <input
                        type="text"
                        value={editGuardianPhone}
                        onChange={(e) => setEditGuardianPhone(e.target.value)}
                        className="w-full h-9 px-3 text-xs border border-slate-300 rounded-md font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Parent Name</label>
                      <input
                        type="text"
                        value={editParentName}
                        onChange={(e) => setEditParentName(e.target.value)}
                        className="w-full h-9 px-3 text-xs border border-slate-300 rounded-md font-khmer focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        កម្រិត/ថ្នាក់ (Class / Grade)
                      </label>
                      <select
                        value={editClass}
                        onChange={(e) => setEditClass(e.target.value)}
                        className="w-full h-9 px-3 text-xs border border-slate-300 rounded-md font-khmer bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      >
                        {settings.gradeLevels.map((gl, idx) => (
                          <option key={idx} value={gl}>
                            {gl}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-600 mb-1">Address</label>
                      <textarea
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-khmer focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              )}

              {/* SECTION: MEDICAL */}
              {activeSection === 'medical' && (
                <div className="space-y-4 animate-in fade-in duration-100 text-xs">
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="text-sm font-bold text-slate-800">Student Medical & Health Records</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-red-50/60 border border-red-200 rounded-xl p-4">
                      <span className="text-red-700 font-semibold block mb-1">Blood Group</span>
                      <span className="text-2xl font-black text-red-900 font-mono">{student.bloodType || 'O+'}</span>
                    </div>

                    <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4">
                      <span className="text-amber-700 font-semibold block mb-1">Known Allergies</span>
                      <span className="text-sm font-bold text-amber-900">{student.allergies || 'None Reported'}</span>
                    </div>

                    <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4">
                      <span className="text-blue-700 font-semibold block mb-1">Emergency Contact</span>
                      <span className="text-sm font-mono font-bold text-blue-900">{student.emergencyContact || '012 889 900'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: ATTENDANCE */}
              {activeSection === 'attendance' && (
                <div className="space-y-4 animate-in fade-in duration-100 text-xs">
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="text-sm font-bold text-slate-800">Attendance Log & Summary</h3>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block">Total School Days</span>
                      <span className="text-xl font-bold font-mono text-slate-900">120 Days</span>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                      <span className="text-emerald-700 block">Present Days</span>
                      <span className="text-xl font-bold font-mono text-emerald-900">119 Days</span>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                      <span className="text-amber-700 block">Excused Absences</span>
                      <span className="text-xl font-bold font-mono text-amber-900">1 Day</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: BEHAVIOR */}
              {activeSection === 'behavior' && (
                <div className="space-y-4 animate-in fade-in duration-100 text-xs">
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="text-sm font-bold text-slate-800">Discipline & Behavior Conduct</h3>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
                        Semester Conduct Grade
                      </span>
                      <div className="text-3xl font-black text-emerald-900 font-mono mt-1">Grade A (ល្អប្រសើរ)</div>
                    </div>
                    <div className="text-right text-emerald-700 font-khmer">
                      គ្មានកំណត់ត្រាល្មើសវិន័យ (0 Demerits)
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: CALL NOTES & PARENT COMMUNICATION */}
              {activeSection === 'call-notes' && (
                <div className="space-y-4 animate-in fade-in duration-100 text-xs">
                  <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <PhoneCall className="w-4 h-4 text-emerald-600" />
                        <span>កំណត់ត្រាទំនាក់ទំនងតាមទូរស័ព្ទ / Call Notes & Follow-ups</span>
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Log calls with parents/guardians, fee payment promises, and follow-up dates.
                      </p>
                    </div>

                    <button
                      onClick={() => setIsCallNotesModalOpen(true)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ New Call Note</span>
                    </button>
                  </div>

                  {callNotes.filter(cn => cn.studentId === student.id).length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                      <PhoneCall className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-500 font-medium">No call notes recorded for this student yet.</p>
                      <button
                        onClick={() => setIsCallNotesModalOpen(true)}
                        className="mt-3 px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-md text-xs cursor-pointer inline-flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Record First Call Note
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {callNotes
                        .filter(cn => cn.studentId === student.id)
                        .map(note => (
                          <div
                            key={note.id}
                            className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-slate-300 transition-colors"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-slate-500 text-[11px] flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {note.dateTime}
                                </span>
                                <span className="font-semibold text-slate-800">
                                  Recipient: <span className="font-khmer">{note.recipientName}</span> ({note.recipientPhone})
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">
                                  Staff: {note.staffName}
                                </span>
                                <button
                                  onClick={() => deleteCallNote(note.id)}
                                  className="text-slate-300 hover:text-red-600 p-1 transition-colors cursor-pointer"
                                  title="Delete Note"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded text-[10px]">
                                {note.purpose.replace(/_/g, ' ').toUpperCase()}
                              </span>

                              <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                                {note.outcome.replace(/_/g, ' ')}
                              </span>

                              {note.promisedDate && (
                                <span className="bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded text-[10px] flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-amber-700" />
                                  <span>សន្យាបង់ប្រាក់ (Promised): {note.promisedDate}</span>
                                </span>
                              )}

                              {note.followUpDate && (
                                <span className="bg-purple-100 text-purple-900 font-bold px-2 py-0.5 rounded text-[10px]">
                                  Follow-up: {note.followUpDate}
                                </span>
                              )}
                            </div>

                            <p className="text-slate-700 font-khmer bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                              {note.notes}
                            </p>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Payment Modal */}
      <AddPaymentModal
        isOpen={isAddPaymentModalOpen}
        onClose={() => setIsAddPaymentModalOpen(false)}
        preselectedStudent={student}
      />

      {/* Call Notes Modal */}
      <CallNotesModal
        isOpen={isCallNotesModalOpen}
        student={student}
        onClose={() => setIsCallNotesModalOpen(false)}
      />

      {/* Printable Invoice Modal */}
      <InvoicePrintModal
        invoice={selectedInvoiceForPrint}
        branch={selectedBranch}
        settings={settings}
        onClose={() => setSelectedInvoiceForPrint(null)}
      />

      {/* Printable Academic Report Card Modal */}
      <ReportCardPrintModal
        record={selectedAcademicRecordForPrint}
        student={student}
        branch={selectedBranch}
        settings={settings}
        onClose={() => setSelectedAcademicRecordForPrint(null)}
      />

      {/* Official FBIS Application for Admission Modal (Matching PDF) */}
      <AdmissionFormModal
        isOpen={isAdmissionFormOpen}
        initialStudent={student}
        onClose={() => setIsAdmissionFormOpen(false)}
      />
    </div>
  );
};
