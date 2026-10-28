import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Branch, 
  User, 
  Student, 
  PaymentInvoice, 
  ProductItem, 
  ServiceItem,
  AcademicRecord, 
  SystemSettings, 
  ExpenseRecord,
  NavigationTab,
  UserRole,
  CallNote,
  FeeCategory,
  StockMovement,
  UserPermissions,
  PromotionRecord,
  SemesterDateConfig,
  PaymentPeriodConfig
} from '../types';
import { KhmerDueRecord, EnglishDueRecord } from '../types/dueReport';
import { 
  INITIAL_BRANCHES, 
  INITIAL_USERS, 
  INITIAL_STUDENTS, 
  INITIAL_PRODUCTS, 
  INITIAL_SERVICES,
  INITIAL_PAYMENTS, 
  INITIAL_ACADEMIC_RECORDS, 
  INITIAL_SETTINGS, 
  DEFAULT_SEMESTER_CONFIGS,
  DEFAULT_PAYMENT_PERIODS,
  INITIAL_EXPENSES,
  INITIAL_CALL_NOTES,
  INITIAL_FEE_CATEGORIES,
  INITIAL_STOCK_MOVEMENTS
} from '../data/seedData';
import {
  INITIAL_KHMER_DUE_RECORDS,
  INITIAL_ENGLISH_DUE_RECORDS
} from '../data/dueReportsData';
import {
  sendTelegramMessage,
  sendTelegramDocument,
  formatPaymentAlertMessage,
  formatDailyBackupCaption
} from '../services/telegramService';

interface SchoolContextType {
  branches: Branch[];
  currentBranchId: string;
  selectedBranch: Branch;
  setCurrentBranchId: (id: string) => void;
  currentUser: User;
  setCurrentUser: (u: User) => void;
  isLoggedIn: boolean;
  login: (emailOrUser: string, role?: UserRole, branchId?: string) => boolean;
  logout: () => void;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string | null) => void;
  
  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;

  // Language: 'km' | 'en'
  language: 'km' | 'en';
  setLanguage: (lang: 'km' | 'en') => void;

  // Modals
  isAddPaymentOpen: boolean;
  setIsAddPaymentOpen: (open: boolean) => void;
  targetPaymentStudent: Student | null;
  setTargetPaymentStudent: (s: Student | null) => void;

  // Data sets
  students: Student[];
  branchStudents: Student[];
  addStudent: (s: Omit<Student, 'id'>) => Student;
  updateStudent: (id: string, s: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  getStudentById: (id: string) => Student | undefined;

  // Student Promotion
  promotions: PromotionRecord[];
  branchPromotions: PromotionRecord[];
  promoteStudents: (options: {
    studentPromotions: Array<{
      studentId: string;
      targetClass: string;
      status?: 'active' | 'graduated' | 'suspended';
    }>;
    sourceClass: string;
    targetClass: string;
    sourceYear: string;
    targetYear: string;
    notes?: string;
  }) => { success: boolean; count: number };
  promoteSingleStudent: (
    studentId: string,
    targetClass: string,
    targetYear: string,
    status?: 'active' | 'graduated' | 'suspended'
  ) => boolean;

  // Users management
  users: User[];
  addUser: (u: Omit<User, 'id' | 'createdAt'>) => User;
  updateUser: (id: string, u: Partial<User>) => void;
  deleteUser: (id: string) => boolean;
  updateUserPermissions: (id: string, perms: UserPermissions) => void;

  // Call Notes
  callNotes: CallNote[];
  branchCallNotes: CallNote[];
  addCallNote: (cn: Omit<CallNote, 'id'>) => CallNote;
  deleteCallNote: (id: string) => void;

  // Fee Categories (ប្រភេទចំណូល / Account Setting)
  feeCategories: FeeCategory[];
  addFeeCategory: (fc: Omit<FeeCategory, 'id'>) => FeeCategory;
  updateFeeCategory: (id: string, fc: Partial<FeeCategory>) => void;
  deleteFeeCategory: (id: string) => void;

  // Stock Movements & Reports
  stockMovements: StockMovement[];
  branchStockMovements: StockMovement[];
  addStockMovement: (sm: Omit<StockMovement, 'id'>) => StockMovement;

  payments: PaymentInvoice[];
  branchPayments: PaymentInvoice[];
  addPayment: (p: Omit<PaymentInvoice, 'id' | 'createdAt'>) => PaymentInvoice;
  updatePayment: (id: string, p: Partial<PaymentInvoice>) => void;
  deletePayment: (id: string) => void;

  products: ProductItem[];
  branchProducts: ProductItem[];
  addProduct: (item: Omit<ProductItem, 'id'>) => ProductItem;
  updateProduct: (id: string, item: Partial<ProductItem>) => void;
  deleteProduct: (id: string) => void;

  services: ServiceItem[];
  branchServices: ServiceItem[];
  addService: (item: Omit<ServiceItem, 'id'>) => ServiceItem;
  updateService: (id: string, item: Partial<ServiceItem>) => void;
  deleteService: (id: string) => void;

  academicRecords: AcademicRecord[];
  branchAcademicRecords: AcademicRecord[];
  addAcademicRecord: (rec: Omit<AcademicRecord, 'id'>) => AcademicRecord;
  updateAcademicRecord: (id: string, rec: Partial<AcademicRecord>) => void;
  deleteAcademicRecord: (id: string) => void;

  expenses: ExpenseRecord[];
  branchExpenses: ExpenseRecord[];
  addExpense: (exp: Omit<ExpenseRecord, 'id'>) => ExpenseRecord;

  // Due Reports (Khmer & English Programs matching screenshot)
  khmerDueRecords: KhmerDueRecord[];
  branchKhmerDueRecords: KhmerDueRecord[];
  addKhmerDueRecord: (rec: Omit<KhmerDueRecord, 'id' | 'no'>) => KhmerDueRecord;
  updateKhmerDueRecord: (id: string, rec: Partial<KhmerDueRecord>) => void;
  deleteKhmerDueRecord: (id: string) => void;

  englishDueRecords: EnglishDueRecord[];
  branchEnglishDueRecords: EnglishDueRecord[];
  addEnglishDueRecord: (rec: Omit<EnglishDueRecord, 'id' | 'no'>) => EnglishDueRecord;
  updateEnglishDueRecord: (id: string, rec: Partial<EnglishDueRecord>) => void;
  deleteEnglishDueRecord: (id: string) => void;

  // Due Reports Synchronization & Branch Management
  syncDueReportWithStudents: () => {
    syncedCount: number;
    newAddedKhmer: number;
    newAddedEnglish: number;
    newAddedToStudents: number;
  };
  updateDueRecordBranch: (recordId: string, program: 'khmer' | 'english', targetBranchId: string) => boolean;

  settings: SystemSettings;
  updateSettings: (s: Partial<SystemSettings>) => void;
  updateSemesterConfig: (academicYear: string, config: SemesterDateConfig) => void;
  addBranch: (b: Omit<Branch, 'id'>) => Branch;
  updateBranch: (id: string, b: Partial<Branch>) => void;
  deleteBranch: (id: string) => boolean;
  // Payment Period Configuration
  paymentPeriods: PaymentPeriodConfig[];
  updatePaymentPeriods: (periods: PaymentPeriodConfig[]) => void;
  updatePaymentPeriod: (id: string, period: Partial<PaymentPeriodConfig>) => void;

  // Invoice Number Generator
  getNextInvoiceNumber: (yearParam?: string | number) => string;

  // Backup, Restore & Data Reset
  createBackupJson: () => string;
  restoreFromBackupJson: (jsonString: string) => boolean;
  resetToDefaults: () => void;
  clearAllDataKeepSettings: () => void;

  // Telegram Integration
  sendTelegramPaymentReceipt: (paymentId: string) => Promise<{ success: boolean; error?: string }>;
  sendTelegramBackupNow: () => Promise<{ success: boolean; error?: string }>;
  testTelegramConnection: (token?: string, chatId?: string) => Promise<{ success: boolean; error?: string }>;

  // Excel / CSV Importers
  importStudentsFromExcel: (rows: any[]) => { successCount: number; errors: string[] };
  importPaymentsFromExcel: (rows: any[]) => { successCount: number; errors: string[] };
  importGradesFromExcel: (rows: any[]) => { successCount: number; errors: string[] };
}

// Helper to ensure EVERY student present in Due Reports (all 62 Grade 7 & 14 K1 students) is registered in the central student database
export const getInitialUnifiedStudents = (): Student[] => {
  const unified: Student[] = [...INITIAL_STUDENTS];

  const hasStudent = (code: string, nameKh: string) => {
    return unified.some(s => 
      (s.studentCode && s.studentCode.toLowerCase() === code.toLowerCase()) || 
      (s.roll && s.roll === code) ||
      (s.nameKhmer && s.nameKhmer.trim() === nameKh.trim())
    );
  };

  // Merge all Khmer Due Records (e.g. 62 Grade 7 students)
  INITIAL_KHMER_DUE_RECORDS.forEach((k) => {
    if (!hasStudent(k.studentCode, k.nameKhmer)) {
      unified.push({
        id: `std-kdue-${k.studentCode}`,
        studentCode: k.studentCode,
        nameKhmer: k.nameKhmer,
        nameEnglish: k.nameEnglish,
        username: k.studentCode.toLowerCase(),
        roll: k.studentCode.replace(/\D/g, '') || k.studentCode,
        classGrade: k.className || 'ថ្នាក់ទី ៧',
        gender: (k.gender === 'ស្រី' || (k.gender as any) === 'F') ? 'Female' : 'Male',
        birthday: k.dob || '2013-01-01',
        phone: '077 473 545',
        guardianPhone: '077 473 545',
        address: 'ខេត្តសៀមរាប',
        parentName: 'អាណាព្យាបាលសិស្ស',
        avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
        branchId: k.branchId || 'fbis-02',
        status: 'active',
        registrationDate: '2024-10-01',
        curriculum: 'khmer',
        academicYear: k.academicYear || '2025-2026',
        tuitionFee: k.fullTuition || 981,
        discountPercentage: k.discountPercent || 0,
        pastYearDue: k.pastYearDue || 0, // Last Year Owed
        pastYearTuition: k.pastYearDue || 0,
        pastYearAdmin: 0
      });
    }
  });

  // Merge all English Due Records (e.g. 14 K1 students)
  INITIAL_ENGLISH_DUE_RECORDS.forEach((e) => {
    if (!hasStudent(e.studentCode, e.nameKhmer)) {
      const pastDue = (e.pastYearDue?.tuition || 0) + (e.pastYearDue?.adminFee || 0);
      unified.push({
        id: `std-edue-${e.studentCode}`,
        studentCode: e.studentCode,
        nameKhmer: e.nameKhmer,
        nameEnglish: e.nameEnglish,
        username: e.studentCode.toLowerCase(),
        roll: e.studentCode.replace(/\D/g, '') || e.studentCode,
        classGrade: e.className || 'ថ្នាក់ K1',
        gender: (e.gender === 'F' || e.gender === 'ស្រី' || (e.gender as any) === 'ស') ? 'Female' : 'Male',
        birthday: e.dob || '2020-01-01',
        phone: '077 473 545',
        guardianPhone: '077 473 545',
        address: 'ខេត្តសៀមរាប',
        parentName: 'អាណាព្យាបាលសិស្ស',
        avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
        branchId: e.branchId || 'fbis-02',
        status: 'active',
        registrationDate: '2024-10-01',
        curriculum: 'english',
        academicYear: e.academicYear || '2025-2026',
        tuitionFee: e.fullTuition || 640,
        discountPercentage: e.discountPercent || 0,
        pastYearDue: pastDue, // Last Year Owed
        pastYearTuition: e.pastYearDue?.tuition || 0,
        pastYearAdmin: e.pastYearDue?.adminFee || 0
      });
    }
  });

  return unified;
};

const STORAGE_KEY = 'fbis_school_management_v2';

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [branches, setBranches] = useState<Branch[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_branches`);
    return saved ? JSON.parse(saved) : INITIAL_BRANCHES;
  });

  const [currentBranchId, setCurrentBranchId] = useState<string>(() => {
    return localStorage.getItem(`${STORAGE_KEY}_currentBranchId`) || 'fbis-02';
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_currentUser`);
    return saved ? JSON.parse(saved) : INITIAL_USERS[0];
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_isLoggedIn`);
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [activeTab, setActiveTab] = useState<NavigationTab>('payments');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>('std-3804');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [language, setLanguage] = useState<'km' | 'en'>('km');

  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState<boolean>(false);
  const [targetPaymentStudent, setTargetPaymentStudent] = useState<Student | null>(null);

  const [students, setStudents] = useState<Student[]>(() => {
    const isCleared = localStorage.getItem('fbis_data_cleared') === 'true';
    const saved = localStorage.getItem(`${STORAGE_KEY}_students`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Student[];
        if (isCleared && parsed.length === 0) return [];
        if (parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse saved students:', e);
      }
    }
    if (isCleared) return [];
    return getInitialUnifiedStudents();
  });

  const [callNotes, setCallNotes] = useState<CallNote[]>(() => {
    const isCleared = localStorage.getItem('fbis_data_cleared') === 'true';
    const saved = localStorage.getItem(`${STORAGE_KEY}_callNotes`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (isCleared && parsed.length === 0) return [];
        return parsed;
      } catch (e) {}
    }
    if (isCleared) return [];
    return INITIAL_CALL_NOTES;
  });

  const [feeCategories, setFeeCategories] = useState<FeeCategory[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_feeCategories`);
    return saved ? JSON.parse(saved) : INITIAL_FEE_CATEGORIES;
  });

  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    const isCleared = localStorage.getItem('fbis_data_cleared') === 'true';
    const saved = localStorage.getItem(`${STORAGE_KEY}_stockMovements`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (isCleared && parsed.length === 0) return [];
        return parsed;
      } catch (e) {}
    }
    if (isCleared) return [];
    return INITIAL_STOCK_MOVEMENTS;
  });

  const [payments, setPayments] = useState<PaymentInvoice[]>(() => {
    const isCleared = localStorage.getItem('fbis_data_cleared') === 'true';
    const saved = localStorage.getItem(`${STORAGE_KEY}_payments`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (isCleared && parsed.length === 0) return [];
        return parsed;
      } catch (e) {}
    }
    if (isCleared) return [];
    return INITIAL_PAYMENTS;
  });

  const [products, setProducts] = useState<ProductItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_products`);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [services, setServices] = useState<ServiceItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_services`);
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [academicRecords, setAcademicRecords] = useState<AcademicRecord[]>(() => {
    const isCleared = localStorage.getItem('fbis_data_cleared') === 'true';
    const saved = localStorage.getItem(`${STORAGE_KEY}_academicRecords`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (isCleared && parsed.length === 0) return [];
        return parsed;
      } catch (e) {}
    }
    if (isCleared) return [];
    return INITIAL_ACADEMIC_RECORDS;
  });

  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    const isCleared = localStorage.getItem('fbis_data_cleared') === 'true';
    const saved = localStorage.getItem(`${STORAGE_KEY}_expenses`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (isCleared && parsed.length === 0) return [];
        return parsed;
      } catch (e) {}
    }
    if (isCleared) return [];
    return INITIAL_EXPENSES;
  });

  const [khmerDueRecords, setKhmerDueRecords] = useState<KhmerDueRecord[]>(() => {
    const isCleared = localStorage.getItem('fbis_data_cleared') === 'true';
    const saved = localStorage.getItem(`${STORAGE_KEY}_khmer_due`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (isCleared && parsed.length === 0) return [];
        return parsed;
      } catch (e) {}
    }
    if (isCleared) return [];
    return INITIAL_KHMER_DUE_RECORDS;
  });

  const [englishDueRecords, setEnglishDueRecords] = useState<EnglishDueRecord[]>(() => {
    const isCleared = localStorage.getItem('fbis_data_cleared') === 'true';
    const saved = localStorage.getItem(`${STORAGE_KEY}_english_due`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (isCleared && parsed.length === 0) return [];
        return parsed;
      } catch (e) {}
    }
    if (isCleared) return [];
    return INITIAL_ENGLISH_DUE_RECORDS;
  });

  const [promotions, setPromotions] = useState<PromotionRecord[]>(() => {
    const isCleared = localStorage.getItem('fbis_data_cleared') === 'true';
    const saved = localStorage.getItem(`${STORAGE_KEY}_promotions`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (isCleared && parsed.length === 0) return [];
        return parsed;
      } catch (e) {
        console.error('Failed to parse promotions:', e);
      }
    }
    if (isCleared) return [];
    return [
      {
        id: 'promo-1',
        date: '2025-08-25T08:30:00.000Z',
        sourceAcademicYear: '2024-2025',
        targetAcademicYear: '2025-2026',
        sourceClass: 'ថ្នាក់ទី ៦',
        targetClass: 'ថ្នាក់ទី ៧',
        promotedCount: 28,
        retainedCount: 2,
        graduatedCount: 0,
        promotedStudentIds: [],
        performedBy: 'Super Admin',
        branchId: 'fbis-02',
        notes: 'ការឡើងថ្នាក់បញ្ចប់បឋមសិក្សាចូលអនុវិទ្យាល័យ'
      }
    ];
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_SETTINGS,
          ...parsed,
          paymentPeriods: parsed.paymentPeriods && parsed.paymentPeriods.length > 0
            ? parsed.paymentPeriods
            : DEFAULT_PAYMENT_PERIODS,
          semesterConfigs: {
            ...DEFAULT_SEMESTER_CONFIGS,
            ...(parsed.semesterConfigs || {})
          },
          telegramConfig: {
            ...INITIAL_SETTINGS.telegramConfig,
            ...(parsed.telegramConfig || {})
          }
        };
      } catch (e) {
        console.error('Failed to parse settings from storage:', e);
      }
    }
    return INITIAL_SETTINGS;
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_branches`, JSON.stringify(branches));
  }, [branches]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_currentBranchId`, currentBranchId);
  }, [currentBranchId]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_currentUser`, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_isLoggedIn`, JSON.stringify(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_students`, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_callNotes`, JSON.stringify(callNotes));
  }, [callNotes]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_feeCategories`, JSON.stringify(feeCategories));
  }, [feeCategories]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_stockMovements`, JSON.stringify(stockMovements));
  }, [stockMovements]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_payments`, JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_products`, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_services`, JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_academicRecords`, JSON.stringify(academicRecords));
  }, [academicRecords]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_expenses`, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_khmer_due`, JSON.stringify(khmerDueRecords));
  }, [khmerDueRecords]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_english_due`, JSON.stringify(englishDueRecords));
  }, [englishDueRecords]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_promotions`, JSON.stringify(promotions));
  }, [promotions]);

  const selectedBranch = branches.find(b => b.id === currentBranchId) || branches[0] || INITIAL_BRANCHES[0];

  const branchStudents = currentBranchId === 'all' 
    ? students 
    : students.filter(s => s.branchId === currentBranchId);

  const branchPayments = currentBranchId === 'all'
    ? payments
    : payments.filter(p => p.branchId === currentBranchId);

  const branchProducts = currentBranchId === 'all'
    ? products
    : products.filter(p => p.branchId === currentBranchId);

  const branchServices = currentBranchId === 'all'
    ? services
    : services.filter(s => s.branchId === currentBranchId || s.branchId === 'all');

  const branchAcademicRecords = currentBranchId === 'all'
    ? academicRecords
    : academicRecords.filter(a => a.branchId === currentBranchId);

  const branchExpenses = currentBranchId === 'all'
    ? expenses
    : expenses.filter(e => e.branchId === currentBranchId);

  const branchKhmerDueRecords = currentBranchId === 'all'
    ? khmerDueRecords
    : khmerDueRecords.filter(r => r.branchId === currentBranchId || (!r.branchId && currentBranchId === 'fbis-02'));

  const branchEnglishDueRecords = currentBranchId === 'all'
    ? englishDueRecords
    : englishDueRecords.filter(r => r.branchId === currentBranchId || (!r.branchId && currentBranchId === 'fbis-02'));

  const branchCallNotes = currentBranchId === 'all'
    ? callNotes
    : callNotes.filter(cn => cn.branchId === currentBranchId);

  const branchStockMovements = currentBranchId === 'all'
    ? stockMovements
    : stockMovements.filter(sm => sm.branchId === currentBranchId);

  const branchPromotions = currentBranchId === 'all'
    ? promotions
    : promotions.filter(p => p.branchId === currentBranchId);

  // Authentication
  const login = (emailOrUser: string, role?: UserRole, branchId?: string) => {
    const matched = users.find(
      u => u.username.toLowerCase() === emailOrUser.toLowerCase() || u.email.toLowerCase() === emailOrUser.toLowerCase()
    );
    if (matched) {
      setCurrentUser(matched);
      if (branchId) setCurrentBranchId(branchId);
      else setCurrentBranchId(matched.branchId);
      setIsLoggedIn(true);
      return true;
    }
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: emailOrUser.includes('@') ? emailOrUser.split('@')[0] : emailOrUser,
      username: emailOrUser,
      email: emailOrUser.includes('@') ? emailOrUser : `${emailOrUser}@fbis.edu.kh`,
      role: role || 'campus_admin',
      branchId: branchId || currentBranchId,
      phone: '077 473 545',
      status: 'active',
      permissions: {
        manageStudents: true,
        managePayments: true,
        viewReports: true,
        manageStock: true,
        manageGrades: true,
        manageSettings: role === 'super_admin',
        canDeleteRecords: role === 'super_admin' || role === 'campus_admin',
        accessAllBranches: role === 'super_admin'
      }
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    if (branchId) setCurrentBranchId(branchId);
    setIsLoggedIn(true);
    return true;
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  // User Management
  const addUser = (u: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...u,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setUsers(prev => [newUser, ...prev]);
    return newUser;
  };

  const updateUser = (id: string, u: Partial<User>) => {
    setUsers(prev => prev.map(user => user.id === id ? { ...user, ...u } : user));
    if (currentUser.id === id) {
      setCurrentUser(prev => ({ ...prev, ...u }));
    }
  };

  const deleteUser = (id: string): boolean => {
    if (currentUser.id === id) {
      alert('Cannot delete the currently logged in user.');
      return false;
    }
    setUsers(prev => prev.filter(user => user.id !== id));
    return true;
  };

  const updateUserPermissions = (id: string, perms: UserPermissions) => {
    setUsers(prev => prev.map(user => user.id === id ? { ...user, permissions: perms } : user));
    if (currentUser.id === id) {
      setCurrentUser(prev => ({ ...prev, permissions: perms }));
    }
  };

  // Call Notes
  const addCallNote = (cn: Omit<CallNote, 'id'>) => {
    const newNote: CallNote = {
      ...cn,
      id: `cn-${Date.now()}`
    };
    setCallNotes(prev => [newNote, ...prev]);
    return newNote;
  };

  const deleteCallNote = (id: string) => {
    setCallNotes(prev => prev.filter(c => c.id !== id));
  };

  // Fee Categories (ប្រភេទចំណូល)
  const addFeeCategory = (fc: Omit<FeeCategory, 'id'>) => {
    const newFee: FeeCategory = {
      ...fc,
      id: `fee-${Date.now()}`
    };
    setFeeCategories(prev => [...prev, newFee]);
    return newFee;
  };

  const updateFeeCategory = (id: string, fc: Partial<FeeCategory>) => {
    setFeeCategories(prev => prev.map(item => item.id === id ? { ...item, ...fc } : item));
  };

  const deleteFeeCategory = (id: string) => {
    setFeeCategories(prev => prev.filter(item => item.id !== id));
  };

  // Stock Movements
  const addStockMovement = (sm: Omit<StockMovement, 'id'>) => {
    const newMovement: StockMovement = {
      ...sm,
      id: `sm-${Date.now()}`
    };
    setStockMovements(prev => [newMovement, ...prev]);

    // Update product stock balance automatically
    setProducts(prev => prev.map(p => {
      if (p.id === sm.productId || p.code === sm.productCode) {
        if (sm.type === 'IN') {
          const totalIn = p.totalIn + sm.quantity;
          return { ...p, totalIn, balance: totalIn - p.totalOut };
        } else if (sm.type === 'OUT') {
          const totalOut = p.totalOut + sm.quantity;
          return { ...p, totalOut, balance: p.totalIn - totalOut };
        } else {
          return { ...p, balance: sm.quantity };
        }
      }
      return p;
    }));

    return newMovement;
  };

  // Student CRUD - automatically kept in 100% parity with Due Reports and syncing Last Year Owed
  const addStudent = (s: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...s,
      id: `std-${Date.now()}`
    };
    setStudents(prev => [newStudent, ...prev]);

    // Automatically register into corresponding Due Report
    const isEnglish = 
      s.curriculum === 'english' || 
      (s.classGrade && (s.classGrade.toLowerCase().includes('k1') || s.classGrade.toLowerCase().includes('k2') || s.classGrade.toLowerCase().includes('english')));

    const pastDue = s.pastYearDue || 0;

    if (isEnglish) {
      setEnglishDueRecords(prev => {
        const tuition = s.tuitionFee || 640;
        const disc = s.discountPercentage || 0;
        const qTuition = Number(((tuition * (1 - disc / 100)) / 4).toFixed(2));
        const qAdmin = 25;
        const pastTuition = s.pastYearTuition ?? pastDue;
        const pastAdmin = s.pastYearAdmin ?? 0;
        const newRec: EnglishDueRecord = {
          id: `edue-${newStudent.id}-${Date.now()}`,
          no: prev.length + 1,
          studentCode: s.studentCode,
          nameKhmer: s.nameKhmer,
          nameEnglish: s.nameEnglish,
          className: s.classGrade || 'ថ្នាក់ K1',
          gender: s.gender === 'Female' ? 'F' : 'M',
          dob: s.birthday || '2020-01-01',
          academicYear: s.academicYear || '2025-2026',
          status: 'កំពុងសិក្សា',
          fullTuition: tuition,
          discountPercent: disc,
          annualIncentive: 0,
          incentive: 0,
          amountPayableTuition: Number((tuition * (1 - disc / 100)).toFixed(2)),
          amountPayableAdminFee: 100,
          pastYearDue: { tuition: pastTuition, adminFee: pastAdmin },
          beginningQuarterDue: {
            q1: { tuition: 0, adminFee: 0 },
            q2: { tuition: qTuition, adminFee: qAdmin },
            q3: { tuition: qTuition, adminFee: qAdmin },
            q4: { tuition: qTuition, adminFee: qAdmin },
            newYearTotal: { tuition: Number((qTuition * 3).toFixed(2)), adminFee: qAdmin * 3 }
          },
          totalPaid: { tuition: 0, adminFee: 0 },
          paymentCount: 1,
          endingQuarterDue: {
            q1: { tuition: 0, adminFee: 0 },
            q2: { tuition: qTuition, adminFee: qAdmin },
            q3: { tuition: qTuition, adminFee: qAdmin },
            q4: { tuition: qTuition, adminFee: qAdmin }
          },
          branchId: s.branchId || 'fbis-02'
        };
        return [...prev, newRec];
      });
    } else {
      setKhmerDueRecords(prev => {
        const tuition = s.tuitionFee || 981;
        const disc = s.discountPercentage || 0;
        const semTuition = Number(((tuition * (1 - disc / 100)) / 4).toFixed(2));
        const newRec: KhmerDueRecord = {
          id: `kdue-${newStudent.id}-${Date.now()}`,
          no: prev.length + 1,
          studentCode: s.studentCode,
          nameKhmer: s.nameKhmer,
          nameEnglish: s.nameEnglish,
          className: s.classGrade || 'ថ្នាក់ទី ៧',
          gender: s.gender === 'Female' ? 'ស្រី' : 'ប្រុស',
          dob: s.birthday || '2013-01-01',
          academicYear: s.academicYear || '2025-2026',
          status: 'កំពុងសិក្សា',
          fullTuition: tuition,
          discountPercent: disc,
          discountAmount: 0,
          incentive: 0,
          amountPayable: Number((tuition * (1 - disc / 100)).toFixed(2)),
          pastYearDue: pastDue,
          newYearSem1: 0,
          newYearSem2: semTuition,
          beginningBalanceDue: pastDue + semTuition,
          endingDue: { semester1: 0, semester2: semTuition, pastYear: pastDue, total: pastDue + semTuition },
          branchId: s.branchId || 'fbis-02'
        };
        return [...prev, newRec];
      });
    }

    return newStudent;
  };

  const updateStudent = (id: string, s: Partial<Student>) => {
    setStudents(prev => prev.map(item => item.id === id ? { ...item, ...s } : item));

    // Also sync updates (including Last Year Owed!) to due reports
    setKhmerDueRecords(prev => prev.map(kr => {
      const isMatch = kr.id === id || (s.studentCode && kr.studentCode === s.studentCode) || (kr.studentCode && kr.studentCode === id);
      if (isMatch) {
        return {
          ...kr,
          ...(s.nameKhmer ? { nameKhmer: s.nameKhmer } : {}),
          ...(s.nameEnglish ? { nameEnglish: s.nameEnglish } : {}),
          ...(s.classGrade ? { className: s.classGrade } : {}),
          ...(s.branchId ? { branchId: s.branchId } : {}),
          ...(s.tuitionFee ? { fullTuition: s.tuitionFee } : {}),
          ...(s.discountPercentage !== undefined ? { discountPercent: s.discountPercentage } : {}),
          ...(s.pastYearDue !== undefined ? { pastYearDue: s.pastYearDue } : {})
        };
      }
      return kr;
    }));

    setEnglishDueRecords(prev => prev.map(er => {
      const isMatch = er.id === id || (s.studentCode && er.studentCode === s.studentCode) || (er.studentCode && er.studentCode === id);
      if (isMatch) {
        return {
          ...er,
          ...(s.nameKhmer ? { nameKhmer: s.nameKhmer } : {}),
          ...(s.nameEnglish ? { nameEnglish: s.nameEnglish } : {}),
          ...(s.classGrade ? { className: s.classGrade } : {}),
          ...(s.branchId ? { branchId: s.branchId } : {}),
          ...(s.tuitionFee ? { fullTuition: s.tuitionFee } : {}),
          ...(s.discountPercentage !== undefined ? { discountPercent: s.discountPercentage } : {}),
          ...(s.pastYearDue !== undefined || s.pastYearTuition !== undefined ? {
            pastYearDue: {
              tuition: s.pastYearTuition ?? (s.pastYearDue !== undefined ? s.pastYearDue : er.pastYearDue?.tuition || 0),
              adminFee: s.pastYearAdmin ?? (er.pastYearDue?.adminFee || 0)
            }
          } : {})
        };
      }
      return er;
    }));
  };

  const deleteStudent = (id: string) => {
    const studentToDelete = students.find(s => s.id === id);
    setStudents(prev => prev.filter(item => item.id !== id));

    if (studentToDelete) {
      setKhmerDueRecords(prev => prev.filter(kr => 
        kr.id !== id && kr.studentCode !== studentToDelete.studentCode && kr.nameKhmer !== studentToDelete.nameKhmer
      ));
      setEnglishDueRecords(prev => prev.filter(er => 
        er.id !== id && er.studentCode !== studentToDelete.studentCode && er.nameKhmer !== studentToDelete.nameKhmer
      ));
    }
  };

  const getStudentById = (id: string) => {
    return students.find(s => s.id === id);
  };

  // Student Promotion Handlers
  const promoteStudents = (options: {
    studentPromotions: Array<{
      studentId: string;
      targetClass: string;
      status?: 'active' | 'graduated' | 'suspended';
    }>;
    sourceClass: string;
    targetClass: string;
    sourceYear: string;
    targetYear: string;
    notes?: string;
  }) => {
    const studentMap = new Map(options.studentPromotions.map(sp => [sp.studentId, sp]));
    
    let promotedCount = 0;
    let retainedCount = 0;
    let graduatedCount = 0;
    const promotedIds: string[] = [];

    options.studentPromotions.forEach(sp => {
      if (sp.status === 'graduated') {
        graduatedCount++;
      } else if (sp.targetClass === options.sourceClass) {
        retainedCount++;
      } else {
        promotedCount++;
      }
      promotedIds.push(sp.studentId);
    });

    setStudents(prev => prev.map(std => {
      const sp = studentMap.get(std.id);
      if (!sp) return std;

      return {
        ...std,
        classGrade: sp.targetClass,
        academicYear: options.targetYear,
        status: sp.status || std.status
      };
    }));

    // Record promotion history
    const newPromo: PromotionRecord = {
      id: `promo-${Date.now()}`,
      date: new Date().toISOString(),
      sourceAcademicYear: options.sourceYear,
      targetAcademicYear: options.targetYear,
      sourceClass: options.sourceClass,
      targetClass: options.targetClass,
      promotedCount,
      retainedCount,
      graduatedCount,
      promotedStudentIds: promotedIds,
      performedBy: currentUser?.name || 'Super Admin',
      branchId: currentBranchId === 'all' ? 'fbis-02' : currentBranchId,
      notes: options.notes
    };

    setPromotions(prev => [newPromo, ...prev]);

    return { success: true, count: options.studentPromotions.length };
  };

  const promoteSingleStudent = (
    studentId: string,
    targetClass: string,
    targetYear: string,
    status?: 'active' | 'graduated' | 'suspended'
  ) => {
    setStudents(prev => prev.map(std => {
      if (std.id !== studentId) return std;
      return {
        ...std,
        classGrade: targetClass,
        academicYear: targetYear,
        status: status || std.status
      };
    }));

    const std = students.find(s => s.id === studentId);
    if (std) {
      const isGraduated = status === 'graduated';
      const isRetained = targetClass === std.classGrade;
      const newPromo: PromotionRecord = {
        id: `promo-${Date.now()}`,
        date: new Date().toISOString(),
        sourceAcademicYear: std.academicYear || '2025-2026',
        targetAcademicYear: targetYear,
        sourceClass: std.classGrade,
        targetClass: targetClass,
        promotedCount: !isGraduated && !isRetained ? 1 : 0,
        retainedCount: isRetained ? 1 : 0,
        graduatedCount: isGraduated ? 1 : 0,
        promotedStudentIds: [studentId],
        performedBy: currentUser?.name || 'Academic Staff',
        branchId: std.branchId || (currentBranchId === 'all' ? 'fbis-02' : currentBranchId),
        notes: `បានឡើងថ្នាក់សិស្សទោល ${std.nameKhmer} (${std.studentCode})`
      };
      setPromotions(prev => [newPromo, ...prev]);
    }

    return true;
  };

  // Payments CRUD
  const addPayment = (p: Omit<PaymentInvoice, 'id' | 'createdAt'>) => {
    const newPayment: PaymentInvoice = {
      ...p,
      id: `inv-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setPayments(prev => [newPayment, ...prev]);

    // Automatically sync payment into Khmer Due Records if student matches
    setKhmerDueRecords(prev => prev.map(kr => {
      const isMatch = (p.studentCode && kr.studentCode.toLowerCase() === p.studentCode.toLowerCase()) ||
        (p.studentNameKhmer && kr.nameKhmer === p.studentNameKhmer) ||
        (p.studentName && kr.nameEnglish.toLowerCase() === p.studentName.toLowerCase());
      if (isMatch) {
        let inst1 = kr.installment1;
        let inst2 = kr.installment2;
        let inst3 = kr.installment3;

        if (!inst1 || !inst1.amountReceived) {
          inst1 = {
            date: p.issuedDate || new Date().toISOString().split('T')[0],
            invoiceNo: p.invoiceNumber,
            amountReceived: p.paidUSD
          };
        } else if (!inst2 || !inst2.amountReceived) {
          inst2 = {
            date: p.issuedDate || new Date().toISOString().split('T')[0],
            invoiceNo: p.invoiceNumber,
            amountReceived: p.paidUSD
          };
        } else {
          inst3 = {
            date: p.issuedDate || new Date().toISOString().split('T')[0],
            invoiceNo: p.invoiceNumber,
            amountReceived: (kr.installment3?.amountReceived || 0) + p.paidUSD
          };
        }
        const totalPaid = (inst1?.amountReceived || 0) + (inst2?.amountReceived || 0) + (inst3?.amountReceived || 0);
        return {
          ...kr,
          installment1: inst1,
          installment2: inst2,
          installment3: inst3,
          totalPaid
        };
      }
      return kr;
    }));

    // Automatically sync payment into English Due Records if student matches
    setEnglishDueRecords(prev => prev.map(er => {
      const isMatch = (p.studentCode && er.studentCode.toLowerCase() === p.studentCode.toLowerCase()) ||
        (p.studentNameKhmer && er.nameKhmer === p.studentNameKhmer) ||
        (p.studentName && er.nameEnglish.toLowerCase() === p.studentName.toLowerCase());
      if (isMatch) {
        const titleLower = (p.title || '').toLowerCase();
        const isAdmin = titleLower.includes('admin') || titleLower.includes('រដ្ឋបាល');
        let inst1 = er.installment1;
        let inst2 = er.installment2;

        if (isAdmin) {
          inst2 = {
            date: p.issuedDate || new Date().toISOString().split('T')[0],
            invoiceNo: p.invoiceNumber,
            amountPaid: p.paidUSD,
            amountAdmin: p.paidUSD
          };
        } else {
          inst1 = {
            date: p.issuedDate || new Date().toISOString().split('T')[0],
            invoiceNo: p.invoiceNumber,
            amountPaid: p.paidUSD,
            amountTuition: p.paidUSD
          };
        }
        const totT = (inst1?.amountTuition ?? (inst1?.amountPaid || 0));
        const totA = (inst2?.amountAdmin ?? (inst2?.amountPaid || 0));
        return {
          ...er,
          installment1: inst1,
          installment2: inst2,
          totalPaid: {
            tuition: totT,
            adminFee: totA
          }
        };
      }
      return er;
    }));

    // Send real-time Telegram alert if enabled
    if (
      settings.telegramConfig?.enabled &&
      settings.telegramConfig?.paymentAlerts &&
      settings.telegramConfig?.botToken &&
      settings.telegramConfig?.chatId
    ) {
      const targetBranch = branches.find(b => b.id === newPayment.branchId);
      const branchDisplay = targetBranch 
        ? `${targetBranch.nameKhmer} (${targetBranch.nameEnglish})` 
        : newPayment.branchId;
      const alertMsg = formatPaymentAlertMessage(newPayment, branchDisplay);
      sendTelegramMessage(
        settings.telegramConfig.botToken,
        settings.telegramConfig.chatId,
        alertMsg
      ).catch(err => {
        console.warn('[FBIS] Failed to send payment alert to Telegram:', err);
      });
    }

    return newPayment;
  };

  const updatePayment = (id: string, p: Partial<PaymentInvoice>) => {
    setPayments(prev => prev.map(item => item.id === id ? { ...item, ...p } : item));
  };

  const deletePayment = (id: string) => {
    setPayments(prev => prev.filter(item => item.id !== id));
  };

  // Products CRUD
  const addProduct = (item: Omit<ProductItem, 'id'>) => {
    const newProduct: ProductItem = {
      ...item,
      id: `prod-${Date.now()}`
    };
    setProducts(prev => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (id: string, item: Partial<ProductItem>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...item } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Services CRUD
  const addService = (item: Omit<ServiceItem, 'id'>) => {
    const newService: ServiceItem = {
      ...item,
      id: `srv-${Date.now()}`
    };
    setServices(prev => [newService, ...prev]);
    return newService;
  };

  const updateService = (id: string, item: Partial<ServiceItem>) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...item } : s));
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  // Academic Records CRUD
  const addAcademicRecord = (rec: Omit<AcademicRecord, 'id'>) => {
    const newRec: AcademicRecord = {
      ...rec,
      id: `acad-${Date.now()}`
    };
    setAcademicRecords(prev => [newRec, ...prev]);
    return newRec;
  };

  const updateAcademicRecord = (id: string, rec: Partial<AcademicRecord>) => {
    setAcademicRecords(prev => prev.map(r => r.id === id ? { ...r, ...rec } : r));
  };

  const deleteAcademicRecord = (id: string) => {
    setAcademicRecords(prev => prev.filter(r => r.id !== id));
  };

  // Expenses CRUD
  const addExpense = (exp: Omit<ExpenseRecord, 'id'>) => {
    const newExp: ExpenseRecord = {
      ...exp,
      id: `exp-${Date.now()}`
    };
    setExpenses(prev => [newExp, ...prev]);
    return newExp;
  };

  // Due Records CRUD (Khmer & English)
  const addKhmerDueRecord = (rec: Omit<KhmerDueRecord, 'id' | 'no'>) => {
    const newRec: KhmerDueRecord = {
      ...rec,
      id: `kdue-${Date.now()}`,
      no: khmerDueRecords.length + 1
    };
    setKhmerDueRecords(prev => [...prev, newRec]);
    return newRec;
  };

  const updateKhmerDueRecord = (id: string, rec: Partial<KhmerDueRecord>) => {
    setKhmerDueRecords(prev => prev.map(r => r.id === id ? { ...r, ...rec } : r));
  };

  const deleteKhmerDueRecord = (id: string) => {
    setKhmerDueRecords(prev => prev.filter(r => r.id !== id));
  };

  const addEnglishDueRecord = (rec: Omit<EnglishDueRecord, 'id' | 'no'>) => {
    const newRec: EnglishDueRecord = {
      ...rec,
      id: `edue-${Date.now()}`,
      no: englishDueRecords.length + 1
    };
    setEnglishDueRecords(prev => [...prev, newRec]);
    return newRec;
  };

  const updateEnglishDueRecord = (id: string, rec: Partial<EnglishDueRecord>) => {
    setEnglishDueRecords(prev => prev.map(r => r.id === id ? { ...r, ...rec } : r));
  };

  const deleteEnglishDueRecord = (id: string) => {
    setEnglishDueRecords(prev => prev.filter(r => r.id !== id));
  };

  // Synchronization between Central Student Directory and Due Reports
  // 1. Prunes dummy/sample students not in the student database
  // 2. Automatically collects old year payments & past debt into Due Reports
  // 3. Syncs updated records with clean sequential numbering
  const syncDueReportWithStudents = () => {
    let syncedCount = 0;
    let newAddedKhmer = 0;
    let newAddedEnglish = 0;
    let removedSampleCount = 0;

    if (students.length === 0) {
      setKhmerDueRecords([]);
      setEnglishDueRecords([]);
      return {
        syncedCount: 0,
        newAddedKhmer: 0,
        newAddedEnglish: 0,
        newAddedToStudents: 0
      };
    }

    // Helper to check if a student code or name matches any real student in DB
    const findRealStudent = (code: string, nameKh: string) => {
      return students.find(s => 
        (s.studentCode && s.studentCode.toLowerCase() === (code || '').toLowerCase()) ||
        (s.roll && s.roll.toLowerCase() === (code || '').toLowerCase()) ||
        (s.nameKhmer && s.nameKhmer.trim() === (nameKh || '').trim())
      );
    };

    // Filter out dummy/sample records that have no counterpart in the student registry
    const validKhmer = khmerDueRecords.filter(k => {
      const match = findRealStudent(k.studentCode, k.nameKhmer);
      if (!match) removedSampleCount++;
      return !!match;
    });

    const validEnglish = englishDueRecords.filter(e => {
      const match = findRealStudent(e.studentCode, e.nameKhmer);
      if (!match) removedSampleCount++;
      return !!match;
    });

    const updatedKhmer: KhmerDueRecord[] = [...validKhmer];
    const updatedEnglish: EnglishDueRecord[] = [...validEnglish];

    // For each registered student, sync or insert their due report and collect old year payment
    students.forEach(s => {
      syncedCount++;
      const isEnglish = 
        s.curriculum === 'english' || 
        s.classGrade.toLowerCase().includes('k1') || 
        s.classGrade.toLowerCase().includes('k2') || 
        s.classGrade.toLowerCase().includes('kindergarten') ||
        s.classGrade.toLowerCase().includes('preschool') ||
        s.classGrade.toLowerCase().includes('english');

      const sCode = s.studentCode || s.roll || s.id;
      const khmerGender = (s.gender === 'Female' || (s.gender as any) === 'F') ? 'ស្រី' : 'ប្រុស';

      // Auto-collect old year payment / debt for this student
      // Sum student pastYearDue plus any unpaid balances from prior year payments (runningYear < 2026 or past debt)
      const studentPayments = payments.filter(p => 
        p.studentId === s.id || 
        (p.studentCode && p.studentCode.toLowerCase() === sCode.toLowerCase())
      );
      
      const priorYearPayments = studentPayments.filter(p => 
        (p.runningYear && p.runningYear < 2026) || 
        (p.academicYear && p.academicYear !== settings.activeAcademicYear && !p.academicYear.includes('2026')) ||
        (p.title && (p.title.includes('ឆ្នាំចាស់') || p.title.toLowerCase().includes('past') || p.title.toLowerCase().includes('debt')))
      );
      
      const priorUnpaidSum = priorYearPayments.reduce((acc, p) => acc + (p.owedRemain || 0), 0);
      const collectedOldYearDebt = Math.max(s.pastYearDue || 0, priorUnpaidSum > 0 ? priorUnpaidSum : (s.pastYearDue || 0));

      if (isEnglish) {
        const existingIdx = updatedEnglish.findIndex(e => 
          e.studentCode.toLowerCase() === sCode.toLowerCase() || 
          (s.studentCode && e.studentCode.toLowerCase() === s.studentCode.toLowerCase()) || 
          (s.roll && e.studentCode.toLowerCase() === s.roll.toLowerCase()) ||
          e.nameKhmer.trim() === s.nameKhmer.trim()
        );

        const pTuition = s.pastYearTuition ?? collectedOldYearDebt;
        const pAdmin = s.pastYearAdmin ?? 0;

        if (existingIdx >= 0) {
          updatedEnglish[existingIdx] = {
            ...updatedEnglish[existingIdx],
            nameKhmer: s.nameKhmer || updatedEnglish[existingIdx].nameKhmer,
            nameEnglish: s.nameEnglish || updatedEnglish[existingIdx].nameEnglish,
            gender: s.gender === 'Female' ? 'F' : 'M',
            dob: s.birthday || updatedEnglish[existingIdx].dob,
            branchId: s.branchId || updatedEnglish[existingIdx].branchId || 'fbis-02',
            className: s.classGrade || updatedEnglish[existingIdx].className,
            status: s.status === 'active' ? 'កំពុងសិក្សា' : updatedEnglish[existingIdx].status,
            pastYearDue: { tuition: pTuition, adminFee: pAdmin }
          };
        } else {
          newAddedEnglish++;
          const tuition = s.tuitionFee || 640;
          const disc = s.discountPercentage || 0;
          const qTuition = Number(((tuition * (1 - disc / 100)) / 4).toFixed(2));
          const qAdmin = 25;
          const newRec: EnglishDueRecord = {
            id: `edue-sync-${s.id}-${Date.now()}`,
            no: updatedEnglish.length + 1,
            studentCode: sCode,
            nameKhmer: s.nameKhmer,
            nameEnglish: s.nameEnglish,
            className: s.classGrade || 'ថ្នាក់ K1',
            gender: s.gender === 'Female' ? 'F' : 'M',
            dob: s.birthday || '2020-01-01',
            academicYear: s.academicYear || settings.activeAcademicYear || '2025-2026',
            status: 'កំពុងសិក្សា',
            fullTuition: tuition,
            discountPercent: disc,
            annualIncentive: 0,
            incentive: 0,
            amountPayableTuition: Number((tuition * (1 - disc / 100)).toFixed(2)),
            amountPayableAdminFee: 100,
            pastYearDue: { tuition: pTuition, adminFee: pAdmin },
            beginningQuarterDue: {
              q1: { tuition: 0, adminFee: 0 },
              q2: { tuition: qTuition, adminFee: qAdmin },
              q3: { tuition: qTuition, adminFee: qAdmin },
              q4: { tuition: qTuition, adminFee: qAdmin },
              newYearTotal: { tuition: Number((qTuition * 3).toFixed(2)), adminFee: qAdmin * 3 }
            },
            totalPaid: { tuition: 0, adminFee: 0 },
            paymentCount: 1,
            endingQuarterDue: {
              q1: { tuition: 0, adminFee: 0 },
              q2: { tuition: qTuition, adminFee: qAdmin },
              q3: { tuition: qTuition, adminFee: qAdmin },
              q4: { tuition: qTuition, adminFee: qAdmin }
            },
            branchId: s.branchId || 'fbis-02'
          };
          updatedEnglish.push(newRec);
        }
      } else {
        // Khmer Program
        const existingIdx = updatedKhmer.findIndex(k => 
          k.studentCode.toLowerCase() === sCode.toLowerCase() || 
          (s.studentCode && k.studentCode.toLowerCase() === s.studentCode.toLowerCase()) || 
          (s.roll && k.studentCode.toLowerCase() === s.roll.toLowerCase()) ||
          k.nameKhmer.trim() === s.nameKhmer.trim()
        );

        if (existingIdx >= 0) {
          updatedKhmer[existingIdx] = {
            ...updatedKhmer[existingIdx],
            nameKhmer: s.nameKhmer || updatedKhmer[existingIdx].nameKhmer,
            nameEnglish: s.nameEnglish || updatedKhmer[existingIdx].nameEnglish,
            gender: khmerGender,
            dob: s.birthday || updatedKhmer[existingIdx].dob,
            branchId: s.branchId || updatedKhmer[existingIdx].branchId || 'fbis-02',
            className: s.classGrade || updatedKhmer[existingIdx].className,
            status: s.status === 'active' ? 'កំពុងសិក្សា' : updatedKhmer[existingIdx].status,
            pastYearDue: collectedOldYearDebt
          };
        } else {
          newAddedKhmer++;
          const tuition = s.tuitionFee || 981;
          const disc = s.discountPercentage || 0;
          const semTuition = Number(((tuition * (1 - disc / 100)) / 4).toFixed(2));
          const newRec: KhmerDueRecord = {
            id: `kdue-sync-${s.id}-${Date.now()}`,
            no: updatedKhmer.length + 1,
            studentCode: sCode,
            nameKhmer: s.nameKhmer,
            nameEnglish: s.nameEnglish,
            className: s.classGrade || 'ថ្នាក់ទី ៧',
            gender: khmerGender,
            dob: s.birthday || '2013-01-01',
            academicYear: s.academicYear || settings.activeAcademicYear || '2025-2026',
            status: 'កំពុងសិក្សា',
            fullTuition: tuition,
            discountPercent: disc,
            discountAmount: 0,
            incentive: 0,
            amountPayable: Number((tuition * (1 - disc / 100)).toFixed(2)),
            pastYearDue: collectedOldYearDebt,
            newYearSem1: 0,
            newYearSem2: semTuition,
            beginningBalanceDue: collectedOldYearDebt + semTuition,
            endingDue: { semester1: 0, semester2: semTuition, pastYear: collectedOldYearDebt, total: collectedOldYearDebt + semTuition },
            branchId: s.branchId || 'fbis-02'
          };
          updatedKhmer.push(newRec);
        }
      }
    });

    // Re-number sequentially
    const renumberedKhmer = updatedKhmer.map((item, idx) => ({ ...item, no: idx + 1 }));
    const renumberedEnglish = updatedEnglish.map((item, idx) => ({ ...item, no: idx + 1 }));

    setKhmerDueRecords(renumberedKhmer);
    setEnglishDueRecords(renumberedEnglish);

    return {
      syncedCount,
      newAddedKhmer,
      newAddedEnglish,
      newAddedToStudents: 0
    };
  };

  const updateDueRecordBranch = (recordId: string, program: 'khmer' | 'english', targetBranchId: string): boolean => {
    if (program === 'khmer') {
      const rec = khmerDueRecords.find(r => r.id === recordId);
      if (!rec) return false;
      setKhmerDueRecords(prev => prev.map(r => r.id === recordId ? { ...r, branchId: targetBranchId } : r));
      setStudents(prev => prev.map(s => (s.studentCode === rec.studentCode || s.roll === rec.studentCode) ? { ...s, branchId: targetBranchId } : s));
      return true;
    } else {
      const rec = englishDueRecords.find(r => r.id === recordId);
      if (!rec) return false;
      setEnglishDueRecords(prev => prev.map(r => r.id === recordId ? { ...r, branchId: targetBranchId } : r));
      setStudents(prev => prev.map(s => (s.studentCode === rec.studentCode || s.roll === rec.studentCode) ? { ...s, branchId: targetBranchId } : s));
      return true;
    }
  };

  // Settings
  const updateSettings = (s: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...s }));
  };

  const updateSemesterConfig = (academicYear: string, config: SemesterDateConfig) => {
    setSettings(prev => ({
      ...prev,
      semesterConfigs: {
        ...(prev.semesterConfigs || {}),
        [academicYear]: config
      }
    }));
  };

  const addBranch = (b: Omit<Branch, 'id'>) => {
    const newBranch: Branch = {
      ...b,
      id: `fbis-${Date.now()}`
    };
    setBranches(prev => [...prev, newBranch]);
    return newBranch;
  };

  const updateBranch = (id: string, b: Partial<Branch>) => {
    setBranches(prev => prev.map(br => br.id === id ? { ...br, ...b } : br));
  };

  const deleteBranch = (id: string): boolean => {
    if (branches.length <= 1) {
      return false;
    }
    const targetBranch = branches.find(br => br.id === id);
    let remaining = branches.filter(br => br.id !== id);

    // If deleting headquarters, transfer headquarters status to first remaining branch
    if (targetBranch?.isHeadquarters && remaining.length > 0) {
      remaining = remaining.map((br, idx) => idx === 0 ? { ...br, isHeadquarters: true } : br);
    }
    setBranches(remaining);

    // If currently on deleted branch, switch to the first remaining branch
    if (currentBranchId === id && remaining.length > 0) {
      setCurrentBranchId(remaining[0].id);
    }
    return true;
  };

  // Generate next sequential invoice number starting from 1 each year (e.g. 2026-00001, 2026-00002...)
  const getNextInvoiceNumber = (yearParam?: string | number): string => {
    const yr = yearParam 
      ? String(yearParam).slice(0, 4) 
      : (settings?.activeAcademicYear ? settings.activeAcademicYear.slice(0, 4) : '2026');

    let maxSeq = 0;
    payments.forEach(p => {
      const inv = p.invoiceNumber || '';
      if (inv.startsWith(yr)) {
        const parts = inv.split('-');
        if (parts.length >= 2) {
          const numPart = parseInt(parts[1], 10);
          if (!isNaN(numPart) && numPart > maxSeq) {
            maxSeq = numPart;
          }
        }
      } else if (String(p.runningYear) === yr || (p.academicYear && p.academicYear.startsWith(yr))) {
        const match = inv.match(/\d+$/);
        if (match) {
          const numPart = parseInt(match[0], 10);
          if (!isNaN(numPart) && numPart < 90000 && numPart > maxSeq) {
            maxSeq = numPart;
          }
        }
      }
    });

    const nextSeq = maxSeq + 1;
    return `${yr}-${String(nextSeq).padStart(5, '0')}`;
  };

  // Backup & Restore
  const createBackupJson = () => {
    const backupData = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      schoolName: settings.schoolNameEnglish,
      branches,
      users,
      students,
      callNotes,
      feeCategories,
      stockMovements,
      payments,
      products,
      services,
      academicRecords,
      expenses,
      khmerDueRecords,
      englishDueRecords,
      settings
    };

    const historyItem = {
      id: `bk-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      recordCount: students.length + payments.length + products.length + services.length + academicRecords.length + khmerDueRecords.length + englishDueRecords.length,
      size: `${(JSON.stringify(backupData).length / 1024).toFixed(2)} KB`,
      description: 'Full database snapshot v2.0'
    };
    updateSettings({
      backupHistory: [historyItem, ...settings.backupHistory]
    });

    return JSON.stringify(backupData, null, 2);
  };

  const restoreFromBackupJson = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.branches) setBranches(data.branches);
      if (data.users) setUsers(data.users);
      if (data.students) setStudents(data.students);
      if (data.callNotes) setCallNotes(data.callNotes);
      if (data.feeCategories) setFeeCategories(data.feeCategories);
      if (data.stockMovements) setStockMovements(data.stockMovements);
      if (data.payments) setPayments(data.payments);
      if (data.products) setProducts(data.products);
      if (data.services) setServices(data.services);
      if (data.academicRecords) setAcademicRecords(data.academicRecords);
      if (data.expenses) setExpenses(data.expenses);
      if (data.khmerDueRecords) setKhmerDueRecords(data.khmerDueRecords);
      if (data.englishDueRecords) setEnglishDueRecords(data.englishDueRecords);
      if (data.settings) setSettings(data.settings);
      return true;
    } catch (e) {
      console.error('Failed to parse backup JSON:', e);
      return false;
    }
  };

  const resetToDefaults = () => {
    localStorage.removeItem('fbis_data_cleared');
    setBranches(INITIAL_BRANCHES);
    setCurrentBranchId('fbis-02');
    setUsers(INITIAL_USERS);
    setStudents(getInitialUnifiedStudents());
    setCallNotes(INITIAL_CALL_NOTES);
    setFeeCategories(INITIAL_FEE_CATEGORIES);
    setStockMovements(INITIAL_STOCK_MOVEMENTS);
    setPayments(INITIAL_PAYMENTS);
    setProducts(INITIAL_PRODUCTS);
    setServices(INITIAL_SERVICES);
    setAcademicRecords(INITIAL_ACADEMIC_RECORDS);
    setExpenses(INITIAL_EXPENSES);
    setKhmerDueRecords(INITIAL_KHMER_DUE_RECORDS);
    setEnglishDueRecords(INITIAL_ENGLISH_DUE_RECORDS);
    setSettings(INITIAL_SETTINGS);
  };

  // Clear all transaction & student data while strictly keeping system settings and configurations
  const clearAllDataKeepSettings = () => {
    localStorage.setItem('fbis_data_cleared', 'true');
    setStudents([]);
    setPayments([]);
    setKhmerDueRecords([]);
    setEnglishDueRecords([]);
    setExpenses([]);
    setAcademicRecords([]);
    setCallNotes([]);
    setStockMovements([]);
    setPromotions([]);

    localStorage.setItem(`${STORAGE_KEY}_students`, JSON.stringify([]));
    localStorage.setItem(`${STORAGE_KEY}_payments`, JSON.stringify([]));
    localStorage.setItem(`${STORAGE_KEY}_khmer_due`, JSON.stringify([]));
    localStorage.setItem(`${STORAGE_KEY}_english_due`, JSON.stringify([]));
    localStorage.setItem(`${STORAGE_KEY}_expenses`, JSON.stringify([]));
    localStorage.setItem(`${STORAGE_KEY}_academicRecords`, JSON.stringify([]));
    localStorage.setItem(`${STORAGE_KEY}_callNotes`, JSON.stringify([]));
    localStorage.setItem(`${STORAGE_KEY}_stockMovements`, JSON.stringify([]));
    localStorage.setItem(`${STORAGE_KEY}_promotions`, JSON.stringify([]));
  };

  // Payment Period Configuration helpers
  const paymentPeriods = settings.paymentPeriods && settings.paymentPeriods.length > 0
    ? settings.paymentPeriods 
    : DEFAULT_PAYMENT_PERIODS;

  const updatePaymentPeriods = (periods: PaymentPeriodConfig[]) => {
    setSettings(prev => ({ ...prev, paymentPeriods: periods }));
  };

  const updatePaymentPeriod = (id: string, periodUpdate: Partial<PaymentPeriodConfig>) => {
    setSettings(prev => ({
      ...prev,
      paymentPeriods: (prev.paymentPeriods || DEFAULT_PAYMENT_PERIODS).map(p => 
        p.id === id ? { ...p, ...periodUpdate } : p
      )
    }));
  };

  // Telegram Integration Actions
  const sendTelegramPaymentReceipt = async (paymentId: string): Promise<{ success: boolean; error?: string }> => {
    const cfg = settings.telegramConfig;
    if (!cfg?.botToken || !cfg?.chatId) {
      return { success: false, error: 'Telegram Bot Token និង Chat ID មិនទាន់បានកំណត់ទេ (Bot Token & Chat ID not configured).' };
    }
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) {
      return { success: false, error: 'រកមិនឃើញវិក្កយបត្រនេះទេ (Payment invoice not found).' };
    }
    const targetBranch = branches.find(b => b.id === payment.branchId);
    const branchDisplay = targetBranch 
      ? `${targetBranch.nameKhmer} (${targetBranch.nameEnglish})` 
      : payment.branchId;
    const msg = formatPaymentAlertMessage(payment, branchDisplay);
    return await sendTelegramMessage(cfg.botToken, cfg.chatId, msg);
  };

  const sendTelegramBackupNow = async (): Promise<{ success: boolean; error?: string }> => {
    const cfg = settings.telegramConfig;
    if (!cfg?.botToken || !cfg?.chatId) {
      return { success: false, error: 'Telegram Bot Token និង Chat ID មិនទាន់បានកំណត់ទេ (Bot Token & Chat ID not configured).' };
    }
    const backupJson = createBackupJson();
    const todayStr = new Date().toISOString().split('T')[0];
    const totalIncome = payments.reduce((sum, p) => sum + p.paidUSD, 0);
    const caption = formatDailyBackupCaption({
      totalStudents: students.length,
      totalPayments: payments.length,
      totalBranches: branches.length,
      totalIncomeUSD: totalIncome,
      dateStr: new Date().toLocaleDateString('km-KH', { dateStyle: 'full' }) + ` (${new Date().toLocaleTimeString()})`
    });
    const fileName = `FBIS_Database_Backup_${todayStr}_${Date.now()}.json`;
    const res = await sendTelegramDocument(cfg.botToken, cfg.chatId, backupJson, fileName, caption);
    if (res.success) {
      const nowIso = new Date().toISOString();
      updateSettings({
        telegramConfig: {
          ...cfg,
          lastBackupDate: nowIso
        }
      });
    }
    return res;
  };

  const testTelegramConnection = async (token?: string, chatId?: string): Promise<{ success: boolean; error?: string }> => {
    const activeToken = (token ?? settings.telegramConfig?.botToken ?? '').trim();
    const activeChatId = (chatId ?? settings.telegramConfig?.chatId ?? '').trim();

    if (!activeToken || !activeChatId) {
      return { success: false, error: 'សូមបញ្ចូល Telegram Bot Token និង Chat ID ជាមុនសិន (Please enter Bot Token & Chat ID).' };
    }

    const testMsg = `<b>🔔 ការតភ្ជាប់ Telegram ទទួលបានជោគជ័យ! / TELEGRAM CONNECTION TEST</b>
<b>━━━━━━━━━━━━━━━━━━━━</b>
🏫 <b>សាលា អន្តរជាតិ ហ្វូឈ័រប្រាយ (FBIS)</b>
✅ ការកំណត់ Bot Token និង Chat ID បានត្រឹមត្រូវ។
📅 កាលបរិច្ឆេទ: ${new Date().toLocaleString()}
<i>ប្រព័ន្ធរួចរាល់សម្រាប់ការផ្ញើសារជូនដំណឹងវិក្កយបត្រ (Payment Alerts) និងស្វ័យប្រវត្តិបម្រុងទុកទិន្នន័យ (Daily Backup)!</i>`;

    return await sendTelegramMessage(activeToken, activeChatId, testMsg);
  };

  // Auto Daily Telegram Backup Scheduler (Checks every 60 seconds)
  useEffect(() => {
    const cfg = settings.telegramConfig;
    if (!cfg || !cfg.enabled || !cfg.autoDailyBackup || !cfg.botToken || !cfg.chatId) {
      return;
    }

    const checkDailyBackup = () => {
      const currentCfg = settings.telegramConfig;
      if (!currentCfg || !currentCfg.enabled || !currentCfg.autoDailyBackup || !currentCfg.botToken || !currentCfg.chatId) {
        return;
      }

      const now = new Date();
      const todayDateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const lastBackupDateOnly = currentCfg.lastBackupDate ? currentCfg.lastBackupDate.split('T')[0] : '';

      // Skip if already backed up today
      if (lastBackupDateOnly === todayDateStr) {
        return;
      }

      const targetTime = currentCfg.dailyBackupTime || '18:00';
      const [targetHours, targetMinutes] = targetTime.split(':').map(Number);
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();

      // Trigger if current time is equal or past scheduled time
      if (currentHours > targetHours || (currentHours === targetHours && currentMinutes >= targetMinutes)) {
        console.log('[FBIS] Triggering automatic daily backup to Telegram...');
        sendTelegramBackupNow().catch(err => {
          console.error('[FBIS] Automatic Telegram backup error:', err);
        });
      }
    };

    checkDailyBackup();
    const timer = setInterval(checkDailyBackup, 60000);
    return () => clearInterval(timer);
  }, [settings.telegramConfig]);

  // Excel / CSV Importers
  const importStudentsFromExcel = (rows: any[]) => {
    const errors: string[] = [];
    let count = 0;
    const newStudents: Student[] = [];

    rows.forEach((row, idx) => {
      try {
        const nameKhmer = row['ឈ្មោះជាភាសាខ្មែរ'] || row['Name Khmer'] || row['nameKhmer'] || row['Name'] || '';
        const nameEnglish = row['ឈ្មោះជាអក្សរឡាតាំង'] || row['Name English'] || row['nameEnglish'] || row['English Name'] || '';
        const roll = String(row['អត្តលេខ'] || row['Roll'] || row['roll'] || 4000 + idx);
        const classGrade = row['ថ្នាក់ទី'] || row['Class'] || row['Grade'] || 'ថ្នាក់ទី ១០';
        const gender = (row['ភេទ'] === 'ស្រី' || row['Gender'] === 'Female' || row['gender'] === 'F') ? 'Female' : 'Male';
        const phone = String(row['លេខទូរស័ព្ទ'] || row['Phone'] || row['phone'] || '012 345 678');
        const birthday = row['ថ្ងៃខែឆ្នាំកំណើត'] || row['Birthday'] || row['birthday'] || '2008-01-01';

        if (!nameKhmer && !nameEnglish) {
          errors.push(`Row ${idx + 1}: Missing student name.`);
          return;
        }

        const studentCode = row['លេខកូដសិស្ស'] || row['Student Code'] || `FBIS02-00${roll}`;

        newStudents.push({
          id: `std-import-${Date.now()}-${idx}`,
          studentCode,
          nameKhmer: nameKhmer || nameEnglish,
          nameEnglish: nameEnglish || nameKhmer,
          username: (nameEnglish || nameKhmer).replace(/\s+/g, '').toUpperCase(),
          roll,
          classGrade,
          gender,
          birthday,
          phone,
          guardianPhone: phone,
          address: row['អាសយដ្ឋាន'] || row['Address'] || 'ក្រុងសៀមរាប',
          parentName: row['ឈ្មោះអាណាព្យាបាល'] || row['Parent Name'] || 'អាណាព្យាបាល',
          avatar: gender === 'Female' 
            ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
          branchId: currentBranchId === 'all' ? 'fbis-02' : currentBranchId,
          status: 'active',
          registrationDate: new Date().toISOString().split('T')[0]
        });
        count++;
      } catch (err: any) {
        errors.push(`Row ${idx + 1}: ${err.message}`);
      }
    });

    if (newStudents.length > 0) {
      setStudents(prev => [...newStudents, ...prev]);
    }

    return { successCount: count, errors };
  };

  const importPaymentsFromExcel = (rows: any[]) => {
    const errors: string[] = [];
    let count = 0;
    const newPayments: PaymentInvoice[] = [];

    rows.forEach((row, idx) => {
      try {
        const studentName = row['ឈ្មោះសិស្ស'] || row['Student Name'] || row['studentName'] || '';
        const invoiceNumber = row['លេខវិក្កយបត្រ'] || row['Invoice No'] || `2026-${String(2400 + idx).padStart(6, '0')}`;
        const fullAmount = Number(row['តម្លៃពេញ'] || row['Full Amount'] || 0);
        const paidUSD = Number(row['ប្រាក់បង់($)'] || row['Paid USD'] || 0);
        const paidKHR = Number(row['ប្រាក់បង់(៛)'] || row['Paid KHR'] || 0);
        const discountPercent = Number(row['បញ្ចុះតម្លៃ(%)'] || row['Discount %'] || 0);
        const amountToBePaid = Number(row['តម្លៃត្រូវបង់'] || row['Payable'] || (fullAmount * (1 - discountPercent / 100)));
        const owedRemain = Math.max(0, amountToBePaid - paidUSD - (paidKHR / 4100));

        const matchedStudent = students.find(s => 
          s.nameKhmer.includes(studentName) || 
          s.nameEnglish.toLowerCase().includes(studentName.toLowerCase())
        );

        newPayments.push({
          id: `inv-import-${Date.now()}-${idx}`,
          invoiceNumber,
          studentId: matchedStudent?.id || `std-imported-${idx}`,
          studentName: matchedStudent?.nameEnglish || studentName,
          studentNameKhmer: matchedStudent?.nameKhmer || studentName,
          studentCode: matchedStudent?.studentCode || `FBIS02-${invoiceNumber}`,
          classGrade: row['ថ្នាក់ទី'] || matchedStudent?.classGrade || 'ថ្នាក់ទី ១០',
          academicYear: String(row['ឆ្នាំសិក្សា'] || '2026'),
          runningYear: 2026,
          title: row['ប្រភេទចំណូល'] || row['Description'] || 'ថ្លៃឈ្នួលសិក្សា',
          description: row['បរិយាយ'] || 'Excel Imported Tuition Fee',
          paymentType: row['ប្រភេទបង់'] || 'ត្រីមាស',
          issuedDate: row['កាលបរិច្ឆេទ'] || new Date().toISOString().split('T')[0],
          startDate: row['ថ្ងៃចាប់ផ្ដើម'] || '2026-09-21',
          endDate: row['ថ្ងៃបញ្ចប់'] || '2026-12-25',
          fullAmount,
          discountPercent,
          promotionAmount: 0,
          amountToBePaid,
          paidUSD,
          paidKHR,
          owedRemain,
          exchangeRate: 4100,
          method: (row['វិធីសាស្ត្រ'] as any) || 'ABA Bank',
          status: owedRemain <= 0 ? 'Paid' : (paidUSD > 0 || paidKHR > 0 ? 'Partial' : 'Due'),
          branchId: currentBranchId === 'all' ? 'fbis-02' : currentBranchId,
          cashierName: currentUser.name,
          createdAt: new Date().toISOString()
        });
        count++;
      } catch (err: any) {
        errors.push(`Row ${idx + 1}: ${err.message}`);
      }
    });

    if (newPayments.length > 0) {
      setPayments(prev => [...newPayments, ...prev]);
    }

    return { successCount: count, errors };
  };

  const importGradesFromExcel = (rows: any[]) => {
    const errors: string[] = [];
    let count = 0;
    const newRecords: AcademicRecord[] = [];

    rows.forEach((row, idx) => {
      try {
        const studentCode = row['អត្តលេខ'] || row['Student Code'] || '';
        const studentName = row['ឈ្មោះសិស្ស'] || row['Student Name'] || '';
        const classGrade = row['ថ្នាក់ទី'] || row['Grade'] || 'ថ្នាក់ទី ១២';
        
        const matched = students.find(s => s.studentCode === studentCode || s.nameKhmer === studentName || s.nameEnglish === studentName);

        const khmScore = Number(row['ភាសាខ្មែរ'] || row['Khmer'] || 80);
        const matScore = Number(row['គណិតវិទ្យា'] || row['Math'] || 85);
        const engScore = Number(row['ភាសាអង់គ្លេស'] || row['English'] || 90);
        const phyScore = Number(row['រូបវិទ្យា'] || row['Physics'] || 75);
        const cheScore = Number(row['គីមីវិទ្យា'] || row['Chemistry'] || 80);
        const bioScore = Number(row['ជីវវិទ្យា'] || row['Biology'] || 85);

        const subjects: any[] = [
          { subjectId: 'khm', subjectName: 'Khmer Literature', subjectNameKhmer: 'អក្សរសាស្ត្រខ្មែរ', score: khmScore, maxScore: 100, grade: khmScore >= 90 ? 'A' : khmScore >= 80 ? 'B' : 'C' },
          { subjectId: 'mat', subjectName: 'Mathematics', subjectNameKhmer: 'គណិតវិទ្យា', score: matScore, maxScore: 100, grade: matScore >= 90 ? 'A' : matScore >= 80 ? 'B' : 'C' },
          { subjectId: 'eng', subjectName: 'English Communication', subjectNameKhmer: 'ភាសាអង់គ្លេស', score: engScore, maxScore: 100, grade: engScore >= 90 ? 'A' : engScore >= 80 ? 'B' : 'C' },
          { subjectId: 'phy', subjectName: 'Physics', subjectNameKhmer: 'រូបវិទ្យា', score: phyScore, maxScore: 100, grade: phyScore >= 90 ? 'A' : phyScore >= 80 ? 'B' : 'C' },
          { subjectId: 'che', subjectName: 'Chemistry', subjectNameKhmer: 'គីមីវិទ្យា', score: cheScore, maxScore: 100, grade: cheScore >= 90 ? 'A' : cheScore >= 80 ? 'B' : 'C' },
          { subjectId: 'bio', subjectName: 'Biology', subjectNameKhmer: 'ជីវវិទ្យា', score: bioScore, maxScore: 100, grade: bioScore >= 90 ? 'A' : bioScore >= 80 ? 'B' : 'C' },
        ];

        const totalScore = subjects.reduce((sum, s) => sum + s.score, 0);
        const average = Number((totalScore / subjects.length).toFixed(2));
        const gpa = Number((average / 25).toFixed(2));

        newRecords.push({
          id: `acad-import-${Date.now()}-${idx}`,
          studentId: matched?.id || `std-${idx}`,
          studentCode: matched?.studentCode || studentCode || `FBIS-${idx}`,
          studentName: matched?.nameEnglish || studentName,
          studentNameKhmer: matched?.nameKhmer || studentName,
          classGrade,
          academicYear: '2025-2026',
          term: 'Semester 1',
          branchId: currentBranchId === 'all' ? 'fbis-02' : currentBranchId,
          subjects,
          totalScore,
          average,
          gpa,
          rank: idx + 1,
          totalStudentsInClass: rows.length,
          behaviorGrade: 'A',
          attendanceRate: 98,
          teacherFeedback: row['យោបល់គ្រូ'] || row['Teacher Comment'] || 'Imported academic record.',
          dateRecorded: new Date().toISOString().split('T')[0]
        });
        count++;
      } catch (err: any) {
        errors.push(`Row ${idx + 1}: ${err.message}`);
      }
    });

    if (newRecords.length > 0) {
      setAcademicRecords(prev => [...newRecords, ...prev]);
    }

    return { successCount: count, errors };
  };

  return (
    <SchoolContext.Provider
      value={{
        branches,
        currentBranchId,
        selectedBranch,
        setCurrentBranchId,
        users,
        addUser,
        updateUser,
        deleteUser,
        updateUserPermissions,
        currentUser,
        setCurrentUser,
        isLoggedIn,
        login,
        logout,
        activeTab,
        setActiveTab,
        selectedStudentId,
        setSelectedStudentId,
        searchQuery,
        setSearchQuery,
        isSearchModalOpen,
        setIsSearchModalOpen,
        language,
        setLanguage,
        isAddPaymentOpen,
        setIsAddPaymentOpen,
        targetPaymentStudent,
        setTargetPaymentStudent,
        students,
        branchStudents,
        addStudent,
        updateStudent,
        deleteStudent,
        getStudentById,
        promotions,
        branchPromotions,
        promoteStudents,
        promoteSingleStudent,
        callNotes,
        branchCallNotes,
        addCallNote,
        deleteCallNote,
        feeCategories,
        addFeeCategory,
        updateFeeCategory,
        deleteFeeCategory,
        stockMovements,
        branchStockMovements,
        addStockMovement,
        payments,
        branchPayments,
        addPayment,
        updatePayment,
        deletePayment,
        products,
        branchProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        services,
        branchServices,
        addService,
        updateService,
        deleteService,
        academicRecords,
        branchAcademicRecords,
        addAcademicRecord,
        updateAcademicRecord,
        deleteAcademicRecord,
        expenses,
        branchExpenses,
        addExpense,
        khmerDueRecords,
        branchKhmerDueRecords,
        addKhmerDueRecord,
        updateKhmerDueRecord,
        deleteKhmerDueRecord,
        englishDueRecords,
        branchEnglishDueRecords,
        addEnglishDueRecord,
        updateEnglishDueRecord,
        deleteEnglishDueRecord,
        syncDueReportWithStudents,
        updateDueRecordBranch,
        settings,
        updateSettings,
        updateSemesterConfig,
        paymentPeriods,
        updatePaymentPeriods,
        updatePaymentPeriod,
        addBranch,
        updateBranch,
        deleteBranch,
        getNextInvoiceNumber,
        createBackupJson,
        restoreFromBackupJson,
        resetToDefaults,
        clearAllDataKeepSettings,
        sendTelegramPaymentReceipt,
        sendTelegramBackupNow,
        testTelegramConnection,
        importStudentsFromExcel,
        importPaymentsFromExcel,
        importGradesFromExcel,
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};
