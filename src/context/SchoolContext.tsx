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
  UserPermissions
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
  INITIAL_EXPENSES,
  INITIAL_CALL_NOTES,
  INITIAL_FEE_CATEGORIES,
  INITIAL_STOCK_MOVEMENTS
} from '../data/seedData';
import {
  INITIAL_KHMER_DUE_RECORDS,
  INITIAL_ENGLISH_DUE_RECORDS
} from '../data/dueReportsData';

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

  settings: SystemSettings;
  updateSettings: (s: Partial<SystemSettings>) => void;
  addBranch: (b: Omit<Branch, 'id'>) => Branch;
  updateBranch: (id: string, b: Partial<Branch>) => void;
  deleteBranch: (id: string) => boolean;

  // Backup & Restore
  createBackupJson: () => string;
  restoreFromBackupJson: (jsonString: string) => boolean;
  resetToDefaults: () => void;

  // Excel / CSV Importers
  importStudentsFromExcel: (rows: any[]) => { successCount: number; errors: string[] };
  importPaymentsFromExcel: (rows: any[]) => { successCount: number; errors: string[] };
  importGradesFromExcel: (rows: any[]) => { successCount: number; errors: string[] };
}

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
    const saved = localStorage.getItem(`${STORAGE_KEY}_students`);
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [callNotes, setCallNotes] = useState<CallNote[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_callNotes`);
    return saved ? JSON.parse(saved) : INITIAL_CALL_NOTES;
  });

  const [feeCategories, setFeeCategories] = useState<FeeCategory[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_feeCategories`);
    return saved ? JSON.parse(saved) : INITIAL_FEE_CATEGORIES;
  });

  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_stockMovements`);
    return saved ? JSON.parse(saved) : INITIAL_STOCK_MOVEMENTS;
  });

  const [payments, setPayments] = useState<PaymentInvoice[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_payments`);
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
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
    const saved = localStorage.getItem(`${STORAGE_KEY}_academicRecords`);
    return saved ? JSON.parse(saved) : INITIAL_ACADEMIC_RECORDS;
  });

  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_expenses`);
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [khmerDueRecords, setKhmerDueRecords] = useState<KhmerDueRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_khmer_due`);
    return saved ? JSON.parse(saved) : INITIAL_KHMER_DUE_RECORDS;
  });

  const [englishDueRecords, setEnglishDueRecords] = useState<EnglishDueRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_english_due`);
    return saved ? JSON.parse(saved) : INITIAL_ENGLISH_DUE_RECORDS;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
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
    : khmerDueRecords.filter(r => r.branchId === currentBranchId || r.branchId === 'fbis-02');

  const branchEnglishDueRecords = currentBranchId === 'all'
    ? englishDueRecords
    : englishDueRecords.filter(r => r.branchId === currentBranchId || r.branchId === 'fbis-02');

  const branchCallNotes = currentBranchId === 'all'
    ? callNotes
    : callNotes.filter(cn => cn.branchId === currentBranchId);

  const branchStockMovements = currentBranchId === 'all'
    ? stockMovements
    : stockMovements.filter(sm => sm.branchId === currentBranchId);

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

  // Student CRUD
  const addStudent = (s: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...s,
      id: `std-${Date.now()}`
    };
    setStudents(prev => [newStudent, ...prev]);
    return newStudent;
  };

  const updateStudent = (id: string, s: Partial<Student>) => {
    setStudents(prev => prev.map(item => item.id === id ? { ...item, ...s } : item));
  };

  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(item => item.id !== id));
  };

  const getStudentById = (id: string) => {
    return students.find(s => s.id === id);
  };

  // Payments CRUD
  const addPayment = (p: Omit<PaymentInvoice, 'id' | 'createdAt'>) => {
    const newPayment: PaymentInvoice = {
      ...p,
      id: `inv-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setPayments(prev => [newPayment, ...prev]);
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

  // Settings
  const updateSettings = (s: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...s }));
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
      alert('Cannot delete the only remaining campus branch.');
      return false;
    }
    const remaining = branches.filter(br => br.id !== id);
    setBranches(remaining);

    // If currently on deleted branch, switch to the first remaining branch
    if (currentBranchId === id) {
      setCurrentBranchId(remaining[0].id);
    }
    return true;
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
    setBranches(INITIAL_BRANCHES);
    setCurrentBranchId('fbis-02');
    setUsers(INITIAL_USERS);
    setStudents(INITIAL_STUDENTS);
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
        settings,
        updateSettings,
        addBranch,
        updateBranch,
        deleteBranch,
        createBackupJson,
        restoreFromBackupJson,
        resetToDefaults,
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
