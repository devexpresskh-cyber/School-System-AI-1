export type UserRole = 'super_admin' | 'campus_admin' | 'accountant' | 'teacher';

export interface UserPermissions {
  manageStudents: boolean;
  managePayments: boolean;
  viewReports: boolean;
  manageStock: boolean;
  manageGrades: boolean;
  manageSettings: boolean;
  canDeleteRecords: boolean;
  accessAllBranches: boolean;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  branchId: string;
  phone: string;
  avatar?: string;
  permissions: UserPermissions;
  status?: 'active' | 'inactive';
  createdAt?: string;
}

export interface Branch {
  id: string;
  code: string; // e.g. "FBIS 01", "FBIS 02"
  nameKhmer: string;
  nameEnglish: string;
  city: string;
  addressKhmer: string;
  addressEnglish: string;
  phone: string;
  email: string;
  directorName: string;
  isHeadquarters: boolean;
  totalStudents?: number;
}

export interface SubjectScore {
  subjectId: string;
  subjectName: string;
  subjectNameKhmer: string;
  score: number;
  maxScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  teacherComment?: string;
}

export interface AcademicRecord {
  id: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  studentNameKhmer: string;
  classGrade: string;
  academicYear: string;
  term: 'Quarter 1' | 'Quarter 2' | 'Quarter 3' | 'Quarter 4' | 'Semester 1' | 'Semester 2' | 'Annual';
  branchId: string;
  subjects: SubjectScore[];
  totalScore: number;
  average: number;
  gpa: number;
  rank: number;
  totalStudentsInClass: number;
  behaviorGrade: 'A' | 'B' | 'C' | 'D';
  attendanceRate: number; // e.g. 98%
  teacherFeedback: string;
  dateRecorded: string;
}

export interface Student {
  id: string;
  studentCode: string;
  nameKhmer: string;
  nameEnglish: string;
  username: string;
  roll: string;
  classGrade: string;
  gender: 'Female' | 'Male';
  birthday: string;
  phone: string;
  guardianPhone: string;
  address: string;
  parentName: string;
  avatar: string;
  coverImage?: string;
  branchId: string;
  status: 'active' | 'suspended' | 'graduated';
  registrationDate: string;
  bloodType?: string;
  allergies?: string;
  emergencyContact?: string;
  nationalId?: string;

  // Official FBIS Admission Form Fields (matching PDF /assets/aistudio/admission_6a3a176e.pdf)
  programCategory?: 'english' | 'kindergarten' | 'elementary' | 'middle' | 'high';
  nationality?: string;
  race?: string;
  placeOfBirth?: string;
  academicOldResult?: 'pass' | 'fail' | string;
  academicOldDetail?: string;
  fatherName?: string;
  fatherOccupation?: string;
  fatherPhone?: string;
  motherName?: string;
  motherOccupation?: string;
  motherPhone?: string;
  contactPerson?: string;
  contactPersonOccupation?: string;
  contactPersonPhone?: string;
  lastEnglishLevel?: string;
  lastEnglishSchool?: string;
  transferredFromSchool?: string;
  transferredSchoolAddress?: string;
  howKnewFBIS?: 'tv' | 'parents' | 'walkin' | 'referrer' | string;
  referrerName?: string;
  referrerPhone?: string;
  sponsorName?: string;
  sponsorOccupation?: string;
  sponsorPhone?: string;
  academicYear?: string;
  studyShift?: 'morning' | 'afternoon' | string;
  admissionCheckedBy?: string;
  applicationDate?: string;
}

export type CallPurpose = 
  | 'payment_reminder' 
  | 'absence_inquiry' 
  | 'academic_consult' 
  | 'discipline' 
  | 'health_check' 
  | 'general';

export type CallOutcome = 
  | 'answered_promised_pay' 
  | 'answered_inquired' 
  | 'left_voicemail' 
  | 'no_answer' 
  | 'line_busy' 
  | 'wrong_number';

export interface CallNote {
  id: string;
  studentId: string;
  studentName: string;
  studentNameKhmer: string;
  studentCode: string;
  branchId: string;
  dateTime: string;
  staffId: string;
  staffName: string;
  recipientName: string;
  recipientPhone: string;
  purpose: CallPurpose;
  outcome: CallOutcome;
  promisedDate?: string;
  notes: string;
  followUpDate?: string;
}

export type PaymentStatus = 'Paid' | 'Partial' | 'Due';
export type PaymentMethod = 'Cash' | 'ABA Bank' | 'ACLEDA' | 'RHB' | 'Public Bank' | 'Canadia';

export interface PaymentInvoice {
  id: string;
  invoiceNumber: string;
  studentId: string;
  studentName: string;
  studentNameKhmer: string;
  studentCode: string;
  classGrade: string;
  academicYear: string;
  runningYear: number;
  title: string;
  description: string;
  paymentType: string;
  issuedDate: string;
  startDate: string;
  endDate: string;
  fullAmount: number;
  discountPercent: number;
  promotionAmount: number;
  amountToBePaid: number;
  paidUSD: number;
  paidKHR: number;
  owedRemain: number;
  exchangeRate: number;
  method: PaymentMethod;
  status: PaymentStatus;
  branchId: string;
  cashierName: string;
  createdAt: string;
}

export interface ProductItem {
  id: string;
  code: string;
  nameKhmer: string;
  nameEnglish: string;
  unitPrice: number;
  totalIn: number;
  totalOut: number;
  balance: number;
  status: 'active' | 'inactive';
  branchId: string;
  category: 'Uniform' | 'Book' | 'Material' | 'Equipment';
}

export interface ServiceItem {
  id: string;
  code: string; // e.g. "SRV-001"
  nameKhmer: string;
  nameEnglish: string;
  category: 'Tuition' | 'Transport' | 'Cafeteria' | 'Registration' | 'Activity' | 'Exam' | 'Other';
  feeUSD: number;
  billingCycle: 'Monthly' | 'Term' | 'Semester' | 'Annual' | 'One-Time';
  applicableGrades: string[];
  description?: string;
  status: 'active' | 'inactive';
  branchId: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productCode: string;
  productNameKhmer: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  unitPrice: number;
  date: string;
  referenceNumber: string; // e.g. PO-001 or INV-002310
  notes: string;
  recordedBy: string;
  branchId: string;
}

export interface FeeCategory {
  id: string;
  code: string; // e.g. REV-01, REV-02
  nameKhmer: string;
  nameEnglish: string;
  categoryType: 'tuition' | 'administration' | 'uniform' | 'book' | 'service' | 'transport';
  defaultAmount: number;
  termOptions: string[];
  applicableGrades: string[];
  allowDiscount: boolean;
  status: 'active' | 'inactive';
  descriptionKhmer?: string;
}

export interface ExpenseRecord {
  id: string;
  branchId: string;
  voucherNumber: string;
  category: string;
  description: string;
  amountUSD: number;
  amountKHR: number;
  payee: string;
  date: string;
  approvedBy: string;
  paymentMethod: PaymentMethod;
}

export interface SystemSettings {
  schoolNameKhmer: string;
  schoolNameEnglish: string;
  taglineKhmer: string;
  kingdomHeaderKhmer: string;
  mottoKhmer: string;
  defaultExchangeRate: number; // 4100
  academicYears: string[];
  activeAcademicYear: string;
  gradeLevels: string[];
  terms: string[];
  currencySymbolUSD: string;
  currencySymbolKHR: string;
  autoBackupEnabled: boolean;
  backupHistory: Array<{
    id: string;
    timestamp: string;
    recordCount: number;
    size: string;
    description: string;
  }>;
}

export type NavigationTab = 
  | 'dashboard'
  | 'students'
  | 'student-profile'
  | 'payments'
  | 'due-payments'
  | 'expenses'
  | 'inventory'
  | 'academic-performance'
  | 'reports'
  | 'stock-report'
  | 'excel-import'
  | 'settings'
  | 'backup-restore';
