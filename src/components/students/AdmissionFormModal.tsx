import React, { useState, useEffect } from 'react';
import { Student } from '../../types';
import { useSchool } from '../../context/SchoolContext';
import { Logo } from '../common/Logo';
import { 
  X, 
  Printer, 
  Save, 
  FileText, 
  UserCheck, 
  RotateCcw, 
  Upload, 
  CheckSquare, 
  Square,
  Eye,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface AdmissionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStudent?: Student | null;
  onStudentEnrolled?: (student: Student) => void;
}

export const AdmissionFormModal: React.FC<AdmissionFormModalProps> = ({
  isOpen,
  onClose,
  initialStudent = null,
  onStudentEnrolled
}) => {
  const { currentBranchId, selectedBranch, settings, addStudent, updateStudent } = useSchool();

  // Mode: 'preview' (ready for print), 'edit' (filling in details), 'original-pdf' (view PDF)
  const [activeView, setActiveView] = useState<'form' | 'original-pdf'>('form');

  // Form Fields matching PDF
  const [programCategory, setProgramCategory] = useState<'english' | 'kindergarten' | 'elementary' | 'middle' | 'high'>('english');
  const [levelGradeSpecify, setLevelGradeSpecify] = useState(initialStudent?.classGrade || 'Grade 10');

  // 01. Applicant's name
  const [nameKhmer, setNameKhmer] = useState(initialStudent?.nameKhmer || '');
  const [nameLatin, setNameLatin] = useState(initialStudent?.nameEnglish || '');
  const [sex, setSex] = useState<'Male' | 'Female'>(initialStudent?.gender || 'Female');
  const [nationality, setNationality] = useState(initialStudent?.nationality || 'ខ្មែរ (Cambodian)');
  const [race, setRace] = useState(initialStudent?.race || 'ខ្មែរ (Khmer)');

  // 02. Old Academic Result
  const [academicOldDetail, setAcademicOldDetail] = useState(initialStudent?.academicOldDetail || 'និទ្ទេសល្អ (Good Standing)');
  const [academicOldResult, setAcademicOldResult] = useState<'pass' | 'fail'>(
    (initialStudent?.academicOldResult === 'fail' ? 'fail' : 'pass')
  );

  // 03. Date of Birth & Place of Birth
  const [dob, setDob] = useState(initialStudent?.birthday || '2008-05-15');
  const [pob, setPob] = useState(initialStudent?.placeOfBirth || 'ក្រុងសៀមរាប ខេត្តសៀមរាប');

  // 04. Permanent Address
  const [address, setAddress] = useState(initialStudent?.address || 'ភូមិវត្តបូព៌ ឃុំសាលាកំរើក ក្រុងសៀមរាប ខេត្តសៀមរាប');

  // 05. Father's info
  const [fatherName, setFatherName] = useState(initialStudent?.fatherName || initialStudent?.parentName || 'ស៊ិន វណ្ណា');
  const [fatherOccupation, setFatherOccupation] = useState(initialStudent?.fatherOccupation || 'អាជីវករ');
  const [fatherPhone, setFatherPhone] = useState(initialStudent?.fatherPhone || initialStudent?.guardianPhone || '012 889 900');

  // 06. Mother's info
  const [motherName, setMotherName] = useState(initialStudent?.motherName || 'ម៉ៅ សុខុម');
  const [motherOccupation, setMotherOccupation] = useState(initialStudent?.motherOccupation || 'មេផ្ទះ');
  const [motherPhone, setMotherPhone] = useState(initialStudent?.motherPhone || '098 765 432');

  // 07. Contact Person
  const [contactPerson, setContactPerson] = useState(initialStudent?.contactPerson || initialStudent?.parentName || 'ស៊ិន វណ្ណា');
  const [contactOccupation, setContactOccupation] = useState(initialStudent?.contactPersonOccupation || 'អាជីវករ');
  const [contactPhone, setContactPhone] = useState(initialStudent?.contactPersonPhone || initialStudent?.guardianPhone || '012 889 900');

  // 08. Last level of English attended & School
  const [lastEnglishLevel, setLastEnglishLevel] = useState(initialStudent?.lastEnglishLevel || 'Level 8 (Pre-Intermediate)');
  const [lastEnglishSchool, setLastEnglishSchool] = useState(initialStudent?.lastEnglishSchool || 'សាលា អន្តរជាតិហ្វូឈ័រប្រាយ (FBIS)');

  // 09. Previous school & address
  const [previousSchool, setPreviousSchool] = useState(initialStudent?.transferredFromSchool || 'សាលាបឋមសិក្សា វត្តបូព៌');
  const [previousSchoolAddress, setPreviousSchoolAddress] = useState(initialStudent?.transferredSchoolAddress || 'សង្កាត់សាលាកំរើក ក្រុងសៀមរាប');

  // 10. How did you know about FBIS?
  const [howKnewFBIS, setHowKnewFBIS] = useState<'tv' | 'parents' | 'walkin' | 'referrer'>(
    (initialStudent?.howKnewFBIS as any) || 'parents'
  );
  const [referrerName, setReferrerName] = useState(initialStudent?.referrerName || '');
  const [referrerPhone, setReferrerPhone] = useState(initialStudent?.referrerPhone || '');

  // 11. Sponsor info
  const [sponsorName, setSponsorName] = useState(initialStudent?.sponsorName || '');
  const [sponsorOccupation, setSponsorOccupation] = useState(initialStudent?.sponsorOccupation || '');
  const [sponsorPhone, setSponsorPhone] = useState(initialStudent?.sponsorPhone || '');

  // 12. Academic Year & Shift
  const [academicYear, setAcademicYear] = useState(initialStudent?.academicYear || '2024 - 2025');
  const [studyShift, setStudyShift] = useState<'morning' | 'afternoon'>(
    (initialStudent?.studyShift as any) || 'morning'
  );

  // Photo
  const [photoUrl, setPhotoUrl] = useState(initialStudent?.avatar || '');

  // Signoff & Date
  const [applicationDate, setApplicationDate] = useState(
    initialStudent?.applicationDate || new Date().toISOString().split('T')[0]
  );
  const [admissionCheckedBy, setAdmissionCheckedBy] = useState(
    initialStudent?.admissionCheckedBy || 'កែវ សុខា (Keo Sokha)'
  );

  // Checklist states for Page 2
  const [checkIdCard, setCheckIdCard] = useState(true);
  const [checkBirthCert, setCheckBirthCert] = useState(true);
  const [checkPhoto3x4, setCheckPhoto3x4] = useState(true);
  const [checkPhoto4x6, setCheckPhoto4x6] = useState(true);
  const [checkTestResult, setCheckTestResult] = useState(true);
  const [checkCertificate, setCheckCertificate] = useState(true);
  const [checkRecordBook, setCheckRecordBook] = useState(true);

  // Reset/sync when initialStudent changes
  useEffect(() => {
    if (initialStudent) {
      setNameKhmer(initialStudent.nameKhmer || '');
      setNameLatin(initialStudent.nameEnglish || '');
      setSex(initialStudent.gender || 'Female');
      setDob(initialStudent.birthday || '2008-05-15');
      setAddress(initialStudent.address || '');
      setLevelGradeSpecify(initialStudent.classGrade || 'Grade 10');
      setFatherName(initialStudent.fatherName || initialStudent.parentName || '');
      setFatherPhone(initialStudent.fatherPhone || initialStudent.guardianPhone || '');
      setMotherName(initialStudent.motherName || '');
      setMotherPhone(initialStudent.motherPhone || '');
      setContactPerson(initialStudent.contactPerson || initialStudent.parentName || '');
      setContactPhone(initialStudent.contactPersonPhone || initialStudent.guardianPhone || '');
      setPhotoUrl(initialStudent.avatar || '');
    }
  }, [initialStudent]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleClearBlank = () => {
    setNameKhmer('');
    setNameLatin('');
    setSex('Female');
    setNationality('');
    setRace('');
    setAcademicOldDetail('');
    setDob('');
    setPob('');
    setAddress('');
    setFatherName('');
    setFatherOccupation('');
    setFatherPhone('');
    setMotherName('');
    setMotherOccupation('');
    setMotherPhone('');
    setContactPerson('');
    setContactOccupation('');
    setContactPhone('');
    setLastEnglishLevel('');
    setLastEnglishSchool('');
    setPreviousSchool('');
    setPreviousSchoolAddress('');
    setReferrerName('');
    setReferrerPhone('');
    setSponsorName('');
    setSponsorOccupation('');
    setSponsorPhone('');
    setPhotoUrl('');
  };

  const handleSaveStudent = () => {
    if (!nameKhmer.trim()) {
      alert('សូមបញ្ចូលឈ្មោះជាភាសាខ្មែរ (Please enter student name in Khmer)');
      return;
    }

    const rollNumber = initialStudent ? initialStudent.roll : String(Math.floor(2000 + Math.random() * 8000));
    const studentData: Omit<Student, 'id'> = {
      studentCode: initialStudent ? initialStudent.studentCode : `FBIS02-00${rollNumber}`,
      nameKhmer,
      nameEnglish: nameLatin || nameKhmer,
      username: (nameLatin || nameKhmer).replace(/\s+/g, '').toUpperCase(),
      roll: rollNumber,
      classGrade: levelGradeSpecify || 'Grade 10',
      gender: sex,
      birthday: dob || '2008-05-15',
      phone: fatherPhone || motherPhone || contactPhone || '012 000 000',
      guardianPhone: contactPhone || fatherPhone || motherPhone || '012 000 000',
      address: address || 'សៀមរាប',
      parentName: fatherName || motherName || contactPerson || 'អាណាព្យាបាល',
      avatar: photoUrl || (sex === 'Female'
        ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'),
      branchId: currentBranchId === 'all' ? 'fbis-02' : currentBranchId,
      status: 'active',
      registrationDate: applicationDate || new Date().toISOString().split('T')[0],
      
      // Extended FBIS official fields
      programCategory,
      nationality,
      race,
      placeOfBirth: pob,
      academicOldResult,
      academicOldDetail,
      fatherName,
      fatherOccupation,
      fatherPhone,
      motherName,
      motherOccupation,
      motherPhone,
      contactPerson,
      contactPersonOccupation: contactOccupation,
      contactPersonPhone: contactPhone,
      lastEnglishLevel,
      lastEnglishSchool,
      transferredFromSchool: previousSchool,
      transferredSchoolAddress: previousSchoolAddress,
      howKnewFBIS,
      referrerName,
      referrerPhone,
      sponsorName,
      sponsorOccupation,
      sponsorPhone,
      academicYear,
      studyShift,
      admissionCheckedBy,
      applicationDate
    };

    let savedStudent: Student;
    if (initialStudent) {
      updateStudent(initialStudent.id, studentData);
      savedStudent = { ...initialStudent, ...studentData };
    } else {
      savedStudent = addStudent(studentData);
    }

    if (onStudentEnrolled) {
      onStudentEnrolled(savedStudent);
    }

    alert(initialStudent ? 'បានកែសម្រួលពាក្យសុំចូលរៀនដោយជោគជ័យ!' : 'បានចុះឈ្មោះសិស្សថ្មីដោយជោគជ័យ!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-2 md:p-4 overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      {/* Container Dialog */}
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto print:shadow-none print:border-none print:max-w-none print:w-full print:rounded-none">
        
        {/* Modal Top Control Bar (Screen Only - Hidden in Print) */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-400 flex items-center justify-center text-blue-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm md:text-base font-bold font-khmer text-white">
                  ពាក្យសុំចូលរៀន (Application for Admission)
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono font-medium border border-blue-500/30">
                  FBIS Form Official
                </span>
              </div>
              <p className="text-xs text-slate-400">
                ឯកសារផ្លូវការ ២ ទំព័រ សាលា អន្តរជាតិហ្វូឈ័រប្រាយ (FBIS 2-Page Official Form)
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView(activeView === 'form' ? 'original-pdf' : 'form')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeView === 'original-pdf'
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{activeView === 'original-pdf' ? 'ត្រឡប់មកពាក្យសុំ' : 'មើលឯកសារ PDF ដើម'}</span>
            </button>

            <button
              onClick={handleClearBlank}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              title="សំអាតទិន្នន័យដើម្បីបោះពុម្ពទម្រង់ទទេ"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ទម្រង់ទទេ (Blank Form)</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>បោះពុម្ពពាក្យសុំ (Print / Export PDF)</span>
            </button>

            <button
              onClick={handleSaveStudent}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{initialStudent ? 'កែប្រែទិន្នន័យ' : 'ចុះឈ្មោះសិស្សថ្មី'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View switcher: Original PDF preview or Interactive 2-Page Form */}
        {activeView === 'original-pdf' ? (
          <div className="p-4 bg-slate-100 min-h-[600px] flex flex-col items-center">
            <div className="w-full max-w-4xl bg-white p-3 rounded-xl border border-slate-300 shadow-xs mb-3 flex items-center justify-between">
              <span className="text-xs text-slate-600 font-medium">
                ឯកសារដើម៖ /public/assets/aistudio/admission_6a3a176e.pdf
              </span>
              <a 
                href="/assets/aistudio/admission_6a3a176e.pdf" 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
              >
                <span>បើកក្នុងផ្ទាំងថ្មី (Open in New Tab)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <iframe
              src="/assets/aistudio/admission_6a3a176e.pdf#toolbar=1"
              title="Official FBIS Admission PDF"
              className="w-full max-w-4xl h-[750px] rounded-xl border border-slate-300 bg-white shadow-md"
            />
          </div>
        ) : (
          /* Interactive & Printable 2-Page Form matching PDF */
          <div className="max-h-[82vh] overflow-y-auto p-4 md:p-8 bg-slate-100 print:max-h-none print:overflow-visible print:p-0 print:bg-white">
            
            {/* Print Stylesheet injection for exact 2-page pagination */}
            <style>{`
              @media print {
                @page {
                  size: A4 portrait;
                  margin: 10mm 12mm 10mm 12mm;
                }
                body {
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                  background: white !important;
                }
                .page-break {
                  page-break-after: always;
                  break-after: page;
                  clear: both;
                }
                .no-print {
                  display: none !important;
                }
                .fbis-page {
                  box-shadow: none !important;
                  border: none !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  width: 100% !important;
                  max-width: 100% !important;
                }
              }
            `}</style>

            {/* ========================================================= */}
            {/* PAGE 1: APPLICATION FOR ADMISSION (ពាក្យសុំចូលរៀន) */}
            {/* ========================================================= */}
            <div className="fbis-page max-w-[210mm] mx-auto bg-white p-7 md:p-10 rounded-xl shadow-lg border border-slate-300 mb-8 font-khmer text-slate-900 leading-normal">
              
              {/* Header: School Logo + Names + Photo Box */}
              <div className="relative flex items-start justify-between pb-3 border-b-2 border-slate-800">
                {/* Logo and school names */}
                <div className="flex items-center gap-4">
                  <Logo size="lg" branchNumber={selectedBranch.code.replace('FBIS ', '')} />
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold text-[#004085] tracking-tight">
                      សាលា អន្តរជាតិហ្វូឈ័រប្រាយ
                    </h1>
                    <h2 className="text-sm md:text-base font-extrabold text-[#d32f2f] uppercase tracking-wider font-sans mt-0.5">
                      FUTURE BRIGHT INTERNATIONAL SCHOOL
                    </h2>
                    <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                      {selectedBranch.addressKhmer} · Tel: {selectedBranch.phone}
                    </p>
                  </div>
                </div>

                {/* 4x6 Photo Box matching PDF top-right */}
                <div className="w-24 h-32 md:w-28 md:h-36 border-2 border-dashed border-slate-400 bg-slate-50 rounded flex flex-col items-center justify-center text-center p-1 relative overflow-hidden shrink-0 group">
                  {photoUrl ? (
                    <img 
                      src={photoUrl} 
                      alt="Student Photo" 
                      className="w-full h-full object-cover rounded-xs" 
                    />
                  ) : (
                    <div className="text-[11px] text-slate-400 font-sans flex flex-col items-center justify-center space-y-1">
                      <span className="font-bold text-slate-600 font-khmer text-[10px]">រូបថត ៤ x ៦</span>
                      <span className="text-[9px] leading-tight">Affix Your<br/>Photo here<br/>4 x 6</span>
                    </div>
                  )}

                  {/* Photo upload / URL input screen only */}
                  <div className="no-print absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-white">
                    <button
                      type="button"
                      onClick={() => {
                        const url = prompt('បញ្ចូលតំណភ្ជាប់រូបថត (Image URL):', photoUrl);
                        if (url !== null) setPhotoUrl(url);
                      }}
                      className="px-2 py-1 bg-blue-600 rounded text-[10px] font-sans font-semibold cursor-pointer"
                    >
                      ប្តូររូបថត
                    </button>
                    {photoUrl && (
                      <button
                        type="button"
                        onClick={() => setPhotoUrl('')}
                        className="mt-1 text-[9px] text-red-300 underline cursor-pointer"
                      >
                        លុបរូប
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Document Title Banner */}
              <div className="text-center my-4">
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-wide font-khmer">
                  ពាក្យសុំចូលរៀន
                </h2>
                <h3 className="text-xs md:text-sm font-black text-slate-800 tracking-widest font-sans uppercase mt-0.5">
                  APPLICATION FOR ADMISSION
                </h3>
              </div>

              {/* Program Level Checkboxes Header matching PDF */}
              <div className="bg-slate-50 border border-slate-300 rounded-lg p-2.5 mb-4 text-xs font-medium">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-2 items-center">
                  {/* English */}
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="program"
                      checked={programCategory === 'english'}
                      onChange={() => setProgramCategory('english')}
                      className="w-3.5 h-3.5 text-blue-600 focus:ring-0"
                    />
                    <div>
                      <span className="font-bold block text-slate-800">អង់គ្លេស</span>
                      <span className="text-[10px] text-slate-500 font-sans block">English</span>
                    </div>
                  </label>

                  {/* Kindergarten */}
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="program"
                      checked={programCategory === 'kindergarten'}
                      onChange={() => setProgramCategory('kindergarten')}
                      className="w-3.5 h-3.5 text-blue-600 focus:ring-0"
                    />
                    <div>
                      <span className="font-bold block text-slate-800">មត្តេយ្យសិក្សា</span>
                      <span className="text-[10px] text-slate-500 font-sans block">Kindergarten</span>
                    </div>
                  </label>

                  {/* Elementary */}
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="program"
                      checked={programCategory === 'elementary'}
                      onChange={() => setProgramCategory('elementary')}
                      className="w-3.5 h-3.5 text-blue-600 focus:ring-0"
                    />
                    <div>
                      <span className="font-bold block text-slate-800">បឋមសិក្សា</span>
                      <span className="text-[10px] text-slate-500 font-sans block">Elementary</span>
                    </div>
                  </label>

                  {/* Middle School */}
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="program"
                      checked={programCategory === 'middle'}
                      onChange={() => setProgramCategory('middle')}
                      className="w-3.5 h-3.5 text-blue-600 focus:ring-0"
                    />
                    <div>
                      <span className="font-bold block text-slate-800">ថ្នាក់អនុវិទ្យាល័យ</span>
                      <span className="text-[10px] text-slate-500 font-sans block">Middle School</span>
                    </div>
                  </label>

                  {/* High School */}
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="program"
                      checked={programCategory === 'high'}
                      onChange={() => setProgramCategory('high')}
                      className="w-3.5 h-3.5 text-blue-600 focus:ring-0"
                    />
                    <div>
                      <span className="font-bold block text-slate-800">ថ្នាក់វិទ្យាល័យ</span>
                      <span className="text-[10px] text-slate-500 font-sans block">High School</span>
                    </div>
                  </label>

                  {/* Level / Grade specify */}
                  <div className="col-span-2 md:col-span-1">
                    <span className="font-bold block text-[11px] text-slate-800">កម្រិត/ថ្នាក់</span>
                    <span className="text-[9px] text-slate-500 font-sans block">Level/Grade (Please Specify)</span>
                    <input
                      type="text"
                      value={levelGradeSpecify}
                      onChange={(e) => setLevelGradeSpecify(e.target.value)}
                      placeholder="e.g. Grade 10"
                      className="w-full mt-1 px-1.5 py-0.5 text-xs border-b border-slate-400 bg-transparent focus:outline-none focus:border-blue-600 font-sans font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Numbered Fields 01 - 12 */}
              <div className="space-y-3.5 text-xs">
                
                {/* 01. Applicant's name, Sex, Nationality, Race */}
                <div className="p-2 border border-slate-200 rounded-lg bg-white">
                  <div className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[11px] shrink-0">01</span>
                    <span>ឈ្មោះសិស្ស / Applicant’s name</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pl-8">
                    <div className="md:col-span-4">
                      <label className="text-[11px] text-slate-500 block mb-0.5">ជាអក្សរខ្មែរ (in Khmer):</label>
                      <input
                        type="text"
                        value={nameKhmer}
                        onChange={(e) => setNameKhmer(e.target.value)}
                        placeholder="ឧ. ស៊ិន ពិសី"
                        className="w-full pb-0.5 border-b border-slate-300 font-bold font-khmer text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div className="md:col-span-4">
                      <label className="text-[11px] text-slate-500 block mb-0.5 font-sans">អក្សរឡាតាំង (in Latin):</label>
                      <input
                        type="text"
                        value={nameLatin}
                        onChange={(e) => setNameLatin(e.target.value)}
                        placeholder="e.g. SIN PISEY"
                        className="w-full pb-0.5 border-b border-slate-300 font-bold font-sans text-sm text-slate-900 uppercase focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-[11px] text-slate-500 block mb-0.5">ភេទ / Sex:</label>
                      <div className="flex items-center gap-3 mt-1">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="sex"
                            checked={sex === 'Female'}
                            onChange={() => setSex('Female')}
                            className="text-blue-600"
                          />
                          <span>ស្រី (F)</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="sex"
                            checked={sex === 'Male'}
                            onChange={() => setSex('Male')}
                            className="text-blue-600"
                          />
                          <span>ប្រុស (M)</span>
                        </label>
                      </div>
                    </div>

                    <div className="md:col-span-1">
                      <label className="text-[10px] text-slate-500 block mb-0.5">សញ្ជាតិ</label>
                      <input
                        type="text"
                        value={nationality}
                        onChange={(e) => setNationality(e.target.value)}
                        placeholder="ខ្មែរ"
                        className="w-full pb-0.5 border-b border-slate-300 text-xs focus:outline-none"
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="text-[10px] text-slate-500 block mb-0.5">ជនជាតិ</label>
                      <input
                        type="text"
                        value={race}
                        onChange={(e) => setRace(e.target.value)}
                        placeholder="ខ្មែរ"
                        className="w-full pb-0.5 border-b border-slate-300 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 02. Academic result of previous school year */}
                <div className="p-2 border border-slate-200 rounded-lg bg-white">
                  <div className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[11px] shrink-0">02</span>
                    <span>លទ្ធផលសិក្សាប្រចាំឆ្នាំសិក្សាចាស់ (Academic result of previous school year)</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 pl-8">
                    <input
                      type="text"
                      value={academicOldDetail}
                      onChange={(e) => setAcademicOldDetail(e.target.value)}
                      placeholder="ពិន្ទុ ឬនិទ្ទេសចាស់ (Details / Grade / Marks)..."
                      className="flex-1 min-w-[200px] pb-0.5 border-b border-slate-300 text-xs focus:outline-none"
                    />
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="oldResult"
                          checked={academicOldResult === 'pass'}
                          onChange={() => setAcademicOldResult('pass')}
                          className="text-blue-600"
                        />
                        <span className="font-semibold text-emerald-700">ជាប់មធ្យមភាគ (Passed)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="oldResult"
                          checked={academicOldResult === 'fail'}
                          onChange={() => setAcademicOldResult('fail')}
                          className="text-blue-600"
                        />
                        <span className="font-semibold text-red-600">ធ្លាក់មធ្យមភាគ (Failed)</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* 03. Date of Birth & Place of Birth */}
                <div className="p-2 border border-slate-200 rounded-lg bg-white">
                  <div className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[11px] shrink-0">03</span>
                    <span>ថ្ងៃ-ខែ-ឆ្នាំកំណើត (Date of Birth) &amp; ទីកន្លែងកំណើត (Place of Birth)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pl-8">
                    <div className="md:col-span-4">
                      <label className="text-[11px] text-slate-500 block mb-0.5">ថ្ងៃ-ខែ-ឆ្នាំកំណើត (DOB):</label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full pb-0.5 border-b border-slate-300 text-xs font-mono font-bold focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-8">
                      <label className="text-[11px] text-slate-500 block mb-0.5">ទីកន្លែងកំណើត (Place of Birth):</label>
                      <input
                        type="text"
                        value={pob}
                        onChange={(e) => setPob(e.target.value)}
                        placeholder="ភូមិ ឃុំ/សង្កាត់ ស្រុក/ខណ្ឌ ខេត្ត/រាជធានី"
                        className="w-full pb-0.5 border-b border-slate-300 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 04. Permanent Address */}
                <div className="p-2 border border-slate-200 rounded-lg bg-white">
                  <div className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[11px] shrink-0">04</span>
                    <span>អាសយដ្ឋានអចិន្ត្រៃយ៍ (Permanent Address)</span>
                  </div>
                  <div className="pl-8">
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="ផ្ទះលេខ ផ្លូវ ភូមិ សង្កាត់ ក្រុង ខេត្ត"
                      className="w-full pb-0.5 border-b border-slate-300 text-xs focus:outline-none font-medium"
                    />
                  </div>
                </div>

                {/* 05. Father's Info */}
                <div className="p-2 border border-slate-200 rounded-lg bg-white">
                  <div className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[11px] shrink-0">05</span>
                    <span>ព័ត៌មានឪពុក (Father’s Information)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pl-8">
                    <div className="md:col-span-5">
                      <label className="text-[11px] text-slate-500 block mb-0.5">ឈ្មោះឪពុក (Father’s name):</label>
                      <input
                        type="text"
                        value={fatherName}
                        onChange={(e) => setFatherName(e.target.value)}
                        placeholder="ឈ្មោះឪពុក"
                        className="w-full pb-0.5 border-b border-slate-300 text-xs font-bold focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-4">
                      <label className="text-[11px] text-slate-500 block mb-0.5">មុខរបរ (Occupation):</label>
                      <input
                        type="text"
                        value={fatherOccupation}
                        onChange={(e) => setFatherOccupation(e.target.value)}
                        placeholder="មុខរបរ"
                        className="w-full pb-0.5 border-b border-slate-300 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="text-[11px] text-slate-500 block mb-0.5">ទូរស័ព្ទ (Phone):</label>
                      <input
                        type="text"
                        value={fatherPhone}
                        onChange={(e) => setFatherPhone(e.target.value)}
                        placeholder="012 xxx xxx"
                        className="w-full pb-0.5 border-b border-slate-300 text-xs font-mono font-bold focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 06. Mother's Info */}
                <div className="p-2 border border-slate-200 rounded-lg bg-white">
                  <div className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[11px] shrink-0">06</span>
                    <span>ព័ត៌មានម្តាយ (Mother’s Information)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pl-8">
                    <div className="md:col-span-5">
                      <label className="text-[11px] text-slate-500 block mb-0.5">ឈ្មោះម្តាយ (Mother’s name):</label>
                      <input
                        type="text"
                        value={motherName}
                        onChange={(e) => setMotherName(e.target.value)}
                        placeholder="ឈ្មោះម្តាយ"
                        className="w-full pb-0.5 border-b border-slate-300 text-xs font-bold focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-4">
                      <label className="text-[11px] text-slate-500 block mb-0.5">មុខរបរ (Occupation):</label>
                      <input
                        type="text"
                        value={motherOccupation}
                        onChange={(e) => setMotherOccupation(e.target.value)}
                        placeholder="មុខរបរ"
                        className="w-full pb-0.5 border-b border-slate-300 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="text-[11px] text-slate-500 block mb-0.5">ទូរស័ព្ទ (Phone):</label>
                      <input
                        type="text"
                        value={motherPhone}
                        onChange={(e) => setMotherPhone(e.target.value)}
                        placeholder="098 xxx xxx"
                        className="w-full pb-0.5 border-b border-slate-300 text-xs font-mono font-bold focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 07. Contact Person in emergency */}
                <div className="p-2 border border-slate-200 rounded-lg bg-white">
                  <div className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[11px] shrink-0">07</span>
                    <span>ឈ្មោះទំនាក់ទំនងបន្ទាន់ (Contact Person in Emergency)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pl-8">
                    <div className="md:col-span-5">
                      <label className="text-[11px] text-slate-500 block mb-0.5">ឈ្មោះ (Name):</label>
                      <input
                        type="text"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        placeholder="ឈ្មោះអ្នកទំនាក់ទំនង"
                        className="w-full pb-0.5 border-b border-slate-300 text-xs font-bold focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-4">
                      <label className="text-[11px] text-slate-500 block mb-0.5">មុខរបរ (Occupation):</label>
                      <input
                        type="text"
                        value={contactOccupation}
                        onChange={(e) => setContactOccupation(e.target.value)}
                        placeholder="មុខរបរ"
                        className="w-full pb-0.5 border-b border-slate-300 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="text-[11px] text-slate-500 block mb-0.5">ទូរស័ព្ទ (Phone):</label>
                      <input
                        type="text"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="012 xxx xxx"
                        className="w-full pb-0.5 border-b border-slate-300 text-xs font-mono font-bold focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 08. Last level of English attended & School */}
                <div className="p-2 border border-slate-200 rounded-lg bg-white">
                  <div className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[11px] shrink-0">08</span>
                    <span>កម្រិតវប្បធម៌ភាសាអង់គ្លេស &amp; ឈ្មោះសាលា (Last level of English attended &amp; School)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pl-8">
                    <div className="md:col-span-6">
                      <label className="text-[11px] text-slate-500 block mb-0.5">កម្រិតវប្បធម៌ភាសាអង់គ្លេស (Last level of English attended):</label>
                      <input
                        type="text"
                        value={lastEnglishLevel}
                        onChange={(e) => setLastEnglishLevel(e.target.value)}
                        placeholder="e.g. Level 8"
                        className="w-full pb-0.5 border-b border-slate-300 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-6">
                      <label className="text-[11px] text-slate-500 block mb-0.5">ឈ្មោះសាលា (Name of School):</label>
                      <input
                        type="text"
                        value={lastEnglishSchool}
                        onChange={(e) => setLastEnglishSchool(e.target.value)}
                        placeholder="ឈ្មោះសាលាដែលធ្លាប់រៀន"
                        className="w-full pb-0.5 border-b border-slate-300 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 09. Previous school & address */}
                <div className="p-2 border border-slate-200 rounded-lg bg-white">
                  <div className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[11px] shrink-0">09</span>
                    <span>ផ្ទេរមកពីសាលា &amp; អាសយដ្ឋាន (Previous school &amp; Address)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pl-8">
                    <div className="md:col-span-6">
                      <label className="text-[11px] text-slate-500 block mb-0.5">ផ្ទេរមកពីសាលា (Previous school):</label>
                      <input
                        type="text"
                        value={previousSchool}
                        onChange={(e) => setPreviousSchool(e.target.value)}
                        placeholder="ឈ្មោះសាលាចាស់"
                        className="w-full pb-0.5 border-b border-slate-300 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-6">
                      <label className="text-[11px] text-slate-500 block mb-0.5">អាសយដ្ឋាន (Address):</label>
                      <input
                        type="text"
                        value={previousSchoolAddress}
                        onChange={(e) => setPreviousSchoolAddress(e.target.value)}
                        placeholder="អាសយដ្ឋានសាលាចាស់"
                        className="w-full pb-0.5 border-b border-slate-300 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 10. How did you know about FBIS? */}
                <div className="p-2 border border-slate-200 rounded-lg bg-white">
                  <div className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[11px] shrink-0">10</span>
                    <span>តើអ្នកស្គាល់ FBIS តាមរយៈអ្នកណា? (How did you know about FBIS?)</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 pl-8">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="howKnew"
                        checked={howKnewFBIS === 'tv'}
                        onChange={() => setHowKnewFBIS('tv')}
                        className="text-blue-600"
                      />
                      <span>តាមរយៈ TV (By TV)</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="howKnew"
                        checked={howKnewFBIS === 'parents'}
                        onChange={() => setHowKnewFBIS('parents')}
                        className="text-blue-600"
                      />
                      <span>តាមរយៈឪពុកម្តាយ (By parents)</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="howKnew"
                        checked={howKnewFBIS === 'walkin'}
                        onChange={() => setHowKnewFBIS('walkin')}
                        className="text-blue-600"
                      />
                      <span>មកផ្ទាល់ (Just walk in)</span>
                    </label>

                    <div className="flex items-center gap-2 flex-1 min-w-[260px]">
                      <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                        <input
                          type="radio"
                          name="howKnew"
                          checked={howKnewFBIS === 'referrer'}
                          onChange={() => setHowKnewFBIS('referrer')}
                          className="text-blue-600"
                        />
                        <span>តាមរយៈឈ្មោះ (Through by):</span>
                      </label>
                      <input
                        type="text"
                        value={referrerName}
                        onChange={(e) => {
                          setReferrerName(e.target.value);
                          setHowKnewFBIS('referrer');
                        }}
                        placeholder="ឈ្មោះអ្នកណែនាំ..."
                        className="flex-1 pb-0.5 border-b border-slate-300 text-xs focus:outline-none"
                      />
                      <span className="shrink-0 text-slate-500">ទូរស័ព្ទ:</span>
                      <input
                        type="text"
                        value={referrerPhone}
                        onChange={(e) => {
                          setReferrerPhone(e.target.value);
                          setHowKnewFBIS('referrer');
                        }}
                        placeholder="012 xxx xxx"
                        className="w-28 pb-0.5 border-b border-slate-300 text-xs font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 11. Sponsor info */}
                <div className="p-2 border border-slate-200 rounded-lg bg-white">
                  <div className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[11px] shrink-0">11</span>
                    <span>ឈ្មោះ និងមុខងារអ្នកឧបត្ថម្ភ (Name and occupation of your sponsor if any)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pl-8">
                    <div className="md:col-span-5">
                      <label className="text-[11px] text-slate-500 block mb-0.5">ឈ្មោះអ្នកឧបត្ថម្ភ (Sponsor's name):</label>
                      <input
                        type="text"
                        value={sponsorName}
                        onChange={(e) => setSponsorName(e.target.value)}
                        placeholder="បើមាន..."
                        className="w-full pb-0.5 border-b border-slate-300 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-4">
                      <label className="text-[11px] text-slate-500 block mb-0.5">មុខងារ (Occupation):</label>
                      <input
                        type="text"
                        value={sponsorOccupation}
                        onChange={(e) => setSponsorOccupation(e.target.value)}
                        placeholder="មុខងារ..."
                        className="w-full pb-0.5 border-b border-slate-300 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="text-[11px] text-slate-500 block mb-0.5">ទូរស័ព្ទ (Phone):</label>
                      <input
                        type="text"
                        value={sponsorPhone}
                        onChange={(e) => setSponsorPhone(e.target.value)}
                        placeholder="012 xxx xxx"
                        className="w-full pb-0.5 border-b border-slate-300 text-xs font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 12. Academic Year & Shift Selection */}
                <div className="p-2 border border-slate-200 rounded-lg bg-white">
                  <div className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[11px] shrink-0">12</span>
                    <span>ឆ្នាំសិក្សា &amp; ជ្រើសរើសពេលសិក្សា (Academic Year &amp; Shift Choice)</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-4 pl-8">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700">ឆ្នាំសិក្សា (Academic Year):</span>
                      <input
                        type="text"
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                        className="w-32 pb-0.5 border-b border-slate-300 font-bold font-mono text-center text-xs focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div className="flex items-center gap-6">
                      <span className="font-bold text-slate-700">ជ្រើសរើសពេលសិក្សា (Shift):</span>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="shift"
                          checked={studyShift === 'morning'}
                          onChange={() => setStudyShift('morning')}
                          className="text-blue-600"
                        />
                        <span className="font-medium">ពេលព្រឹក (Morning)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="shift"
                          checked={studyShift === 'afternoon'}
                          onChange={() => setStudyShift('afternoon')}
                          className="text-blue-600"
                        />
                        <span className="font-medium">ពេលរសៀល (Afternoon)</span>
                      </label>
                    </div>
                  </div>
                </div>

              </div>

              {/* Page 1 Footer matching PDF */}
              <div className="mt-6 pt-3 border-t border-slate-200 text-center text-[11px] font-mono text-slate-400">
                -- 1 of 2 --
              </div>
            </div>

            {/* Print Page Break strictly separating Page 1 and Page 2 */}
            <div className="page-break" />

            {/* ========================================================= */}
            {/* PAGE 2: POLICIES, CHECKLISTS, PENALTIES, PLEDGE & SIGNATURES */}
            {/* ========================================================= */}
            <div className="fbis-page max-w-[210mm] mx-auto bg-white p-7 md:p-10 rounded-xl shadow-lg border border-slate-300 font-khmer text-slate-900 leading-normal">
              
              {/* Top Title: Tuition Fee Payment Policy matching PDF */}
              <div className="border-b-2 border-slate-800 pb-2 mb-4">
                <h3 className="text-sm md:text-base font-bold text-center text-[#004085]">
                  គោលនយោបាយបង់ថ្លៃសិក្សារបស់សាលា អន្តរជាតិហ្វូឈ័រប្រាយ មានដូចខាងក្រោម៖
                </h3>
                <p className="text-[11px] text-center text-slate-500 font-sans">
                  Tuition Fee Payment Policy of Future Bright International School
                </p>
              </div>

              {/* SECTION: English Program Checklist */}
              <div className="mb-4 bg-slate-50/70 p-3.5 rounded-lg border border-slate-200 text-xs">
                <h4 className="font-bold text-blue-900 mb-1.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  <span>សិស្សសិក្សាកម្មវិធីភាសាអង់គ្លេស៖ (English Program Students)</span>
                </h4>
                <ul className="space-y-1.5 pl-4 text-slate-700 text-[11.5px]">
                  <li className="flex items-start gap-1.5">
                    <span className="text-slate-400">-</span>
                    <span>ត្រូវឆ្លងកាត់ការធ្វើតេស្តសរសេរ និងសម្ភាសផ្ទាល់មាត់ ដើម្បីកំណត់កម្រិតចំណេះដឹងជាមុន</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-slate-400">-</span>
                    <span>មាតាបិតា ឬអាណាព្យាបាល ឬសិស្ស ត្រូវបំពេញពាក្យសុំចូលរៀន និងសំណុំឯកសារផ្សេងៗ នឹងត្រូវភ្ជាប់មកជាមួយដូចជា៖</span>
                  </li>
                </ul>

                {/* English checklist items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 pl-6 text-[11px]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkIdCard}
                      onChange={(e) => setCheckIdCard(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>ប័ណ្ណសម្គាល់ខ្លួន (ឯកសារបញ្ជាក់ជាសិស្ស បុគ្គលិក មន្ត្រី...) ចំនួន ០១ ច្បាប់</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkBirthCert}
                      onChange={(e) => setCheckBirthCert(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>សំបុត្រកំណើត ឬប័ណ្ណគ្រួសារ ចំនួន ០១ ច្បាប់</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkPhoto3x4}
                      onChange={(e) => setCheckPhoto3x4(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>រូបថតទំហំ ៣ x ៤ ចំនួន ០៣ សន្លឹក</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkPhoto4x6}
                      onChange={(e) => setCheckPhoto4x6(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>រូបថតទំហំ ៤ x ៦ ចំនួន ០៣ សន្លឹក</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer md:col-span-2">
                    <input
                      type="checkbox"
                      checked={checkTestResult}
                      onChange={(e) => setCheckTestResult(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>លទ្ធផលធ្វើតេស្តកំណត់កម្រិតសិក្សា</span>
                  </label>
                </div>

                <p className="mt-2 text-[11.5px] text-slate-700 pl-4 flex items-start gap-1.5">
                  <span className="text-slate-400">-</span>
                  <span>មាតាបិតា ឬអាណាព្យាបាល ឬសិស្ស ត្រូវបង់ប្រាក់ថ្លៃសិក្សា និងរដ្ឋបាលនៅពេលដាក់ពាក្យចូលរៀន។</span>
                </p>
              </div>

              {/* SECTION: General Khmer Program Checklist */}
              <div className="mb-4 bg-slate-50/70 p-3.5 rounded-lg border border-slate-200 text-xs">
                <h4 className="font-bold text-blue-900 mb-1.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  <span>សិស្សានុសិស្សសិក្សាកម្មវិធីចំណេះទូទៅ៖ (General Khmer Program Students)</span>
                </h4>
                <ul className="space-y-1.5 pl-4 text-slate-700 text-[11.5px]">
                  <li className="flex items-start gap-1.5">
                    <span className="text-slate-400">-</span>
                    <span>ត្រូវមានសៀវភៅសិក្ខាគារិក ឬសៀវភៅតាមដានការសិក្សា ឬលិខិតដែលមានតម្លៃស្មើ</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-slate-400">-</span>
                    <span>សិស្សត្រូវឆ្លងកាត់ការធ្វើតេស្តភាសាអង់គ្លេសបែងចែកកម្រិតសិក្សា ដើម្បីងាយស្រួលបង្រៀន និងរៀនដែលធានាបានគុណភាពសិក្សាខ្ពស់</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-slate-400">-</span>
                    <span>មាតាបិតា ឬអាណាព្យាបាល ឬសិស្ស ត្រូវបំពេញពាក្យសុំចូលរៀន និងសំណុំឯកសារផ្សេងៗ នឹងត្រូវភ្ជាប់មកជាមួយដូចជា៖</span>
                  </li>
                </ul>

                {/* Khmer checklist items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 pl-6 text-[11px]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkCertificate}
                      onChange={(e) => setCheckCertificate(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>សញ្ញាបត្រ ឬលិខិតបញ្ជាក់មានតម្លៃស្មើ (Certificate or equivalent) ចំនួន ០១ ច្បាប់</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkRecordBook}
                      onChange={(e) => setCheckRecordBook(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>សៀវភៅសិក្ខាគារិក ឬសៀវភៅតាមដានការសិក្សាមានពិន្ទុត្រឹមត្រូវ (Record or Observation Book) ចំនួន ០១ ច្បាប់</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkBirthCert}
                      onChange={(e) => setCheckBirthCert(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>សំបុត្រកំណើត ឬប័ណ្ណគ្រួសារ (អាចថតចម្លង) (Birth certificate or family book) ចំនួន ០១ ច្បាប់</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkPhoto4x6}
                      onChange={(e) => setCheckPhoto4x6(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>រូបថតទំហំ ៤ x ៦ (Four recent photographs 4 x 6) ចំនួន ០៤ សន្លឹក</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkPhoto3x4}
                      onChange={(e) => setCheckPhoto3x4(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>រូបថតទំហំ ៣ x ៤ (Three recent photographs 3 x 4) ចំនួន ០៣ សន្លឹក</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkTestResult}
                      onChange={(e) => setCheckTestResult(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>លទ្ធផលធ្វើតេស្តភាសាអង់គ្លេស មុខវិជ្ជា៖ គណិតវិទ្យា និងមុខវិជ្ជា៖ ភាសាខ្មែរ</span>
                  </label>
                </div>

                <p className="mt-2 text-[11.5px] text-slate-700 pl-4 flex items-start gap-1.5">
                  <span className="text-slate-400">-</span>
                  <span>មាតាបិតា ឬអាណាព្យាបាល ឬសិស្ស ត្រូវបង់ប្រាក់ថ្លៃសិក្សា និងរដ្ឋបាលនៅពេលដាក់ពាក្យចូលរៀន។</span>
                </p>
              </div>

              {/* SECTION: Late Payment Penalties matching PDF */}
              <div className="mb-4 bg-amber-50/60 p-3.5 rounded-lg border border-amber-200 text-xs">
                <h4 className="font-bold text-amber-900 mb-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                  <span>ការពិន័យ (Penalties):</span>
                </h4>
                <p className="text-[11.5px] text-slate-800 leading-relaxed mb-2 pl-4">
                  សិស្សទាំងឡាយណាដែលបង់ប្រាក់យឺតផុតថ្ងៃកំណត់ដោយមិនបានជូនដំណឹងជាលាយលក្ខណ៍អក្សរមកសាលាត្រូវទទួលការពិន័យដូចខាងក្រោម៖
                </p>
                <div className="space-y-1 pl-6 text-[11px] font-medium text-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-700 font-bold">•</span>
                    <span>ករណីយឺតចាប់ពី <strong>១៥ ថ្ងៃ ដល់ ២១ ថ្ងៃ</strong> ត្រូវពិន័យជាទឹកប្រាក់ ចំនួន <strong>៨,០០០ (ប្រាំបីពាន់) រៀល</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-700 font-bold">•</span>
                    <span>ករណីយឺតចាប់ពី <strong>២២ ថ្ងៃ ដល់ ៣០ ថ្ងៃ</strong> ត្រូវពិន័យជាទឹកប្រាក់ ចំនួន <strong>១០,០០០ (មួយម៉ឺន) រៀល</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span className="text-red-700">ករណីយឺតលើសពី <strong>៣០ ថ្ងៃ</strong> សាលា អន្តរជាតិហ្វូឈ័រប្រាយ សូមអនុញ្ញាតលុបឈ្មោះចេញពីបញ្ជីសិស្សរបស់សាលាដោយស្វ័យប្រវត្តិ។</span>
                  </div>
                </div>
              </div>

              {/* SECTION: Solemn Pledge */}
              <div className="mb-5 p-3 rounded-lg border border-slate-200 bg-white text-xs leading-relaxed text-slate-800">
                <p className="indent-6 text-justify">
                  ខ្ញុំបាទ / នាងខ្ញុំសូមសន្យាជាឱឡារិកថានឹងគោរពបទបញ្ជាផ្ទៃក្នុង គោលនយោបាយបង់ថ្លៃសិក្សា និងបទបញ្ញត្តិរបស់សាលាអន្តរជាតិហ្វូឈ័រប្រាយ ឱ្យបានត្រឹមត្រូវ ។
                </p>
                <p className="indent-6 text-justify mt-1.5">
                  អាស្រ័យហេតុនេះ សូមលោកនាយកមេត្តាទទួលនូវសេចក្តីគោរពដ៏ខ្ពង់ខ្ពស់អំពីខ្ញុំបាទ / នាងខ្ញុំ ។
                </p>
              </div>

              {/* SECTION: Date and Signature Box matching PDF */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4 text-xs">
                {/* Emergency contact box matching bottom of PDF */}
                <div className="border border-slate-300 rounded-lg p-3 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <h5 className="font-bold text-slate-800 border-b border-slate-200 pb-1 mb-2">
                      អាសយដ្ឋានទំនាក់ទំនងពេលមានកិច្ចការបន្ទាន់<br/>
                      <span className="text-[10px] font-sans font-normal text-slate-500">Contact address in case of emergency</span>
                    </h5>
                    <div className="space-y-2 text-[11.5px]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold shrink-0">ឈ្មោះ (Name):</span>
                        <span className="font-bold text-blue-900 border-b border-dotted border-slate-400 flex-1 pb-0.5">
                          {contactPerson || fatherName || motherName || '...................................................'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold shrink-0">ទូរស័ព្ទ (Phone):</span>
                        <span className="font-mono font-bold text-slate-900 border-b border-dotted border-slate-400 flex-1 pb-0.5">
                          {contactPhone || fatherPhone || motherPhone || '...................................................'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold shrink-0">អាសយដ្ឋាន:</span>
                        <span className="text-slate-800 border-b border-dotted border-slate-400 flex-1 pb-0.5 truncate">
                          {address || '...................................................'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Applicant Signature */}
                <div className="text-center flex flex-col justify-between p-2">
                  <div className="text-right">
                    <p className="text-[11px] text-slate-700">
                      ថ្ងៃទី <span className="font-mono font-bold px-1">{applicationDate ? new Date(applicationDate).getDate() : '..........'}</span> 
                      ខែ <span className="font-mono font-bold px-1">{applicationDate ? new Date(applicationDate).getMonth() + 1 : '...............'}</span> 
                      ឆ្នាំ ២០<span className="font-mono font-bold">{applicationDate ? String(new Date(applicationDate).getFullYear()).slice(-2) : '.......'}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 font-sans">
                      Date: {applicationDate || '....... / ....... / 20.......'}
                    </p>
                  </div>

                  <div className="my-3">
                    <h5 className="font-bold text-slate-800 text-xs">
                      ហត្ថលេខា និងឈ្មោះសាមីខ្លួន
                    </h5>
                    <p className="text-[10px] text-slate-500 font-sans">
                      Applicant’s signature and name
                    </p>
                    <div className="h-14 flex items-end justify-center">
                      <span className="text-xs font-bold text-blue-950 font-khmer">
                        {nameKhmer || '...................................................'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Office Sign-off matching PDF */}
              <div className="pt-4 border-t-2 border-slate-300 grid grid-cols-2 gap-6 text-xs text-center mt-6">
                <div>
                  <h5 className="font-bold text-slate-800 text-xs">
                    ការិយាល័យសិក្សា
                  </h5>
                  <p className="text-[10px] text-slate-500 font-sans">
                    Academic Office
                  </p>
                  <div className="h-16 flex items-center justify-center text-slate-300 text-[10px]">
                    (ហត្ថលេខា និងត្រា / Stamp &amp; Sign)
                  </div>
                </div>

                <div>
                  <h5 className="font-bold text-slate-800 text-xs">
                    ពិនិត្យពាក្យចូលរៀនដោយ
                  </h5>
                  <p className="text-[10px] text-slate-500 font-sans">
                    Admission Checked by
                  </p>
                  <div className="h-16 flex flex-col items-center justify-end">
                    <span className="text-xs font-bold font-khmer text-slate-800">
                      {admissionCheckedBy}
                    </span>
                    <span className="text-[10px] text-slate-400 font-sans">
                      Registrar / Academic Staff
                    </span>
                  </div>
                </div>
              </div>

              {/* Page 2 Footer matching PDF */}
              <div className="mt-6 pt-3 border-t border-slate-200 text-center text-[11px] font-mono text-slate-400">
                -- 2 of 2 --
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
