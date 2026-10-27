import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  Database, 
  Upload, 
  FileCode, 
  CheckCircle2, 
  AlertCircle, 
  Building, 
  Users, 
  DollarSign, 
  TrendingUp, 
  ArrowRight, 
  RefreshCw, 
  FileSpreadsheet, 
  Filter, 
  Layers, 
  Search, 
  Check, 
  Sparkles,
  BarChart3,
  AlertTriangle,
  Play
} from 'lucide-react';
import * as XLSX from 'xlsx';

// Sample SQL Dumps by Branch for 1-click testing
const SAMPLE_SQL_BRANCH_01 = `-- =========================================================
-- FBIS CAMPUS 01 (Central Sivatha) - Students & Financial Dump
-- =========================================================
CREATE TABLE IF NOT EXISTS students (
  student_code VARCHAR(20) PRIMARY KEY,
  name_khmer VARCHAR(100),
  name_english VARCHAR(100),
  gender VARCHAR(10),
  class_grade VARCHAR(50),
  branch_id VARCHAR(20),
  curriculum VARCHAR(20),
  tuition_fee DECIMAL(10,2),
  discount_percent DECIMAL(5,2),
  past_year_due DECIMAL(10,2) -- Last Year Owed
);

INSERT INTO students (student_code, name_khmer, name_english, gender, class_grade, branch_id, curriculum, tuition_fee, discount_percent, past_year_due) VALUES
('FBIS01-5001', 'ចាន់ សុផល', 'Chan Sophal', 'Female', 'ថ្នាក់ទី ៧', 'fbis-01', 'khmer', 981.00, 10.0, 185.00),
('FBIS01-5002', 'សេង វិបុល', 'Seng Vibul', 'Male', 'ថ្នាក់ទី ៧', 'fbis-01', 'khmer', 981.00, 0.0, 240.50),
('FBIS01-5003', 'លី ស្រីម៉ៅ', 'Ly Sreymao', 'Female', 'ថ្នាក់ទី ៧', 'fbis-01', 'khmer', 981.00, 15.0, 0.00),
('FBIS01-5004', 'ម៉ៅ វឌ្ឍនា', 'Mao Vathana', 'Male', 'ថ្នាក់ K1', 'fbis-01', 'english', 640.00, 0.0, 120.00),
('FBIS01-5005', 'គឹម សុធារី', 'Kim Sotheary', 'Female', 'ថ្នាក់ K1', 'fbis-01', 'english', 640.00, 20.0, 0.00);

-- Payments Recorded for Campus 01
INSERT INTO payments (invoice_number, student_code, student_name, branch_id, amount_usd, payment_date, payment_method) VALUES
('INV-01-2026-001', 'FBIS01-5001', 'Chan Sophal', 'fbis-01', 350.00, '2025-11-10', 'ABA Pay'),
('INV-01-2026-002', 'FBIS01-5002', 'Seng Vibul', 'fbis-01', 200.00, '2025-11-15', 'Cash'),
('INV-01-2026-003', 'FBIS01-5004', 'Mao Vathana', 'fbis-01', 160.00, '2025-12-01', 'Wing');
`;

const SAMPLE_SQL_BRANCH_02 = `-- =========================================================
-- FBIS CAMPUS 02 (Wat Bo Campus) - Students & Financial Dump
-- =========================================================
INSERT INTO students (student_code, name_khmer, name_english, gender, class_grade, branch_id, curriculum, tuition_fee, discount_percent, past_year_due) VALUES
('FBIS02-6001', 'រស់ ពិសី', 'Ros Pisey', 'Female', 'ថ្នាក់ទី ៧', 'fbis-02', 'khmer', 981.00, 0.0, 310.00),
('FBIS02-6002', 'ហួត រតនា', 'Huot Rathana', 'Male', 'ថ្នាក់ទី ៧', 'fbis-02', 'khmer', 981.00, 5.0, 176.00),
('FBIS02-6003', 'ប៉ែន សុជាតា', 'Pen Socheata', 'Female', 'ថ្នាក់ទី ៨', 'fbis-02', 'khmer', 981.00, 0.0, 95.00),
('FBIS02-6004', 'អ៊ឹង បូរី', 'Eang Borey', 'Male', 'ថ្នាក់ K2', 'fbis-02', 'english', 680.00, 10.0, 0.00);

INSERT INTO payments (invoice_number, student_code, student_name, branch_id, amount_usd, payment_date, payment_method) VALUES
('INV-02-2026-101', 'FBIS02-6001', 'Ros Pisey', 'fbis-02', 400.00, '2025-11-20', 'ABA Pay'),
('INV-02-2026-102', 'FBIS02-6002', 'Huot Rathana', 'fbis-02', 300.00, '2025-11-25', 'Cash');
`;

const SAMPLE_SQL_BRANCH_03 = `-- =========================================================
-- FBIS CAMPUS 03 (Angkor Campus) - Students & Financial Dump
-- =========================================================
INSERT INTO students (student_code, name_khmer, name_english, gender, class_grade, branch_id, curriculum, tuition_fee, discount_percent, past_year_due) VALUES
('FBIS03-7001', 'គង់ វណ្ណៈ', 'Kong Vannak', 'Male', 'ថ្នាក់ទី ៧', 'fbis-03', 'khmer', 981.00, 0.0, 260.00),
('FBIS03-7002', 'ញ៉ែម សុខា', 'Nhem Sokha', 'Female', 'ថ្នាក់ទី ៧', 'fbis-03', 'khmer', 981.00, 20.0, 0.00),
('FBIS03-7003', 'អ៊ុក ដារ៉ា', 'Ouk Dara', 'Male', 'ថ្នាក់ K1', 'fbis-03', 'english', 640.00, 0.0, 145.00);

INSERT INTO payments (invoice_number, student_code, student_name, branch_id, amount_usd, payment_date, payment_method) VALUES
('INV-03-2026-201', 'FBIS03-7001', 'Kong Vannak', 'fbis-03', 250.00, '2025-10-30', 'Canadia Bank'),
('INV-03-2026-202', 'FBIS03-7003', 'Ouk Dara', 'fbis-03', 200.00, '2025-11-05', 'ABA Pay');
`;

export interface ParsedStudentRow {
  studentCode: string;
  nameKhmer: string;
  nameEnglish: string;
  gender: string;
  classGrade: string;
  branchId: string;
  curriculum: string;
  tuitionFee: number;
  discountPercent: number;
  pastYearDue: number; // Last Year Owed
  rawValues?: Record<string, any>;
}

export interface ParsedPaymentRow {
  invoiceNumber: string;
  studentCode: string;
  studentName: string;
  branchId: string;
  amountUSD: number;
  paymentDate: string;
  paymentMethod: string;
}

export const SqlImportAndAnalyticsView: React.FC = () => {
  const { 
    branches, 
    currentBranchId, 
    setCurrentBranchId, 
    addStudent, 
    updateStudent,
    addPayment,
    students,
    syncDueReportWithStudents
  } = useSchool();

  const [sqlContent, setSqlContent] = useState<string>(SAMPLE_SQL_BRANCH_01);
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'analytics' | 'students' | 'payments' | 'raw'>('analytics');
  const [importStatusMessage, setImportStatusMessage] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Robust SQL INSERT statements parser
  const parsedData = useMemo(() => {
    const studentRows: ParsedStudentRow[] = [];
    const paymentRows: ParsedPaymentRow[] = [];
    const errors: string[] = [];

    if (!sqlContent || !sqlContent.trim()) {
      return { studentRows, paymentRows, errors };
    }

    // Split SQL by statements
    const statements = sqlContent.split(/;\s*[\r\n]+/);

    statements.forEach((stmt) => {
      const cleanStmt = stmt.trim();
      if (!cleanStmt || cleanStmt.startsWith('--')) return;

      // 1. Detect INSERT INTO students
      const studentMatch = cleanStmt.match(/INSERT\s+INTO\s+students\s*\(([^)]+)\)\s*VALUES\s*([\s\S]+)/i);
      if (studentMatch) {
        const columns = studentMatch[1].split(',').map(c => c.trim().toLowerCase().replace(/[`"']/g, ''));
        const valuesBlock = studentMatch[2];

        // Match individual row tuples: (val1, val2, ...)
        const rowRegex = /\(([^)]+)\)/g;
        let rowMatch;
        while ((rowMatch = rowRegex.exec(valuesBlock)) !== null) {
          const rawValues = rowMatch[1].split(',').map(v => {
            const trimmed = v.trim();
            if ((trimmed.startsWith("'") && trimmed.endsWith("'")) || (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
              return trimmed.slice(1, -1);
            }
            if (trimmed.toUpperCase() === 'NULL') return '';
            const num = parseFloat(trimmed);
            return isNaN(num) ? trimmed : num;
          });

          const rowObj: Record<string, any> = {};
          columns.forEach((col, idx) => {
            rowObj[col] = rawValues[idx];
          });

          // Branch resolution: detect branch_id, branch, or default from studentCode prefix / current branch
          let bId = (rowObj.branch_id || rowObj.branch || rowObj.campus || '').toString().toLowerCase();
          if (bId.includes('01') || bId.includes('fbis01') || bId.includes('campus 01')) bId = 'fbis-01';
          else if (bId.includes('02') || bId.includes('fbis02') || bId.includes('campus 02')) bId = 'fbis-02';
          else if (bId.includes('03') || bId.includes('fbis03') || bId.includes('campus 03')) bId = 'fbis-03';
          else if (bId.includes('04') || bId.includes('fbis04') || bId.includes('campus 04')) bId = 'fbis-04';
          else {
            const sCode = (rowObj.student_code || '').toString();
            if (sCode.includes('FBIS01') || sCode.startsWith('01-')) bId = 'fbis-01';
            else if (sCode.includes('FBIS02') || sCode.startsWith('02-')) bId = 'fbis-02';
            else if (sCode.includes('FBIS03') || sCode.startsWith('03-')) bId = 'fbis-03';
            else if (sCode.includes('FBIS04') || sCode.startsWith('04-')) bId = 'fbis-04';
            else bId = currentBranchId || 'fbis-02';
          }

          const sCode = (rowObj.student_code || rowObj.studentcode || rowObj.code || `STD-${Date.now()}`).toString().trim();
          const nameKh = (rowObj.name_khmer || rowObj.namekhmer || rowObj.name || sCode).toString().trim();
          const nameEn = (rowObj.name_english || rowObj.nameenglish || nameKh).toString().trim();
          const gender = (rowObj.gender || 'Female').toString().trim();
          const classGrade = (rowObj.class_grade || rowObj.class || rowObj.grade || 'ថ្នាក់ទី ៧').toString().trim();
          const curriculum = (rowObj.curriculum || (classGrade.includes('K') ? 'english' : 'khmer')).toString().toLowerCase();
          const tuitionFee = typeof rowObj.tuition_fee === 'number' ? rowObj.tuition_fee : parseFloat(rowObj.tuition_fee) || 981;
          const discountPercent = typeof rowObj.discount_percent === 'number' ? rowObj.discount_percent : parseFloat(rowObj.discount_percent) || 0;
          
          // Last Year Owed / Past Year Due extraction
          const pastYearDue = typeof rowObj.past_year_due === 'number' 
            ? rowObj.past_year_due 
            : typeof rowObj.last_year_owed === 'number'
            ? rowObj.last_year_owed
            : parseFloat(rowObj.past_year_due || rowObj.last_year_owed || rowObj.past_due || '0') || 0;

          studentRows.push({
            studentCode: sCode,
            nameKhmer: nameKh,
            nameEnglish: nameEn,
            gender,
            classGrade,
            branchId: bId,
            curriculum,
            tuitionFee,
            discountPercent,
            pastYearDue,
            rawValues: rowObj
          });
        }
      }

      // 2. Detect INSERT INTO payments
      const paymentMatch = cleanStmt.match(/INSERT\s+INTO\s+payments\s*\(([^)]+)\)\s*VALUES\s*([\s\S]+)/i);
      if (paymentMatch) {
        const columns = paymentMatch[1].split(',').map(c => c.trim().toLowerCase().replace(/[`"']/g, ''));
        const valuesBlock = paymentMatch[2];

        const rowRegex = /\(([^)]+)\)/g;
        let rowMatch;
        while ((rowMatch = rowRegex.exec(valuesBlock)) !== null) {
          const rawValues = rowMatch[1].split(',').map(v => {
            const trimmed = v.trim();
            if ((trimmed.startsWith("'") && trimmed.endsWith("'")) || (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
              return trimmed.slice(1, -1);
            }
            if (trimmed.toUpperCase() === 'NULL') return '';
            const num = parseFloat(trimmed);
            return isNaN(num) ? trimmed : num;
          });

          const rowObj: Record<string, any> = {};
          columns.forEach((col, idx) => {
            rowObj[col] = rawValues[idx];
          });

          let bId = (rowObj.branch_id || rowObj.branch || '').toString().toLowerCase();
          if (bId.includes('01')) bId = 'fbis-01';
          else if (bId.includes('02')) bId = 'fbis-02';
          else if (bId.includes('03')) bId = 'fbis-03';
          else if (bId.includes('04')) bId = 'fbis-04';
          else bId = currentBranchId || 'fbis-02';

          paymentRows.push({
            invoiceNumber: (rowObj.invoice_number || rowObj.invoiceno || `INV-${Date.now()}`).toString(),
            studentCode: (rowObj.student_code || rowObj.studentcode || '').toString(),
            studentName: (rowObj.student_name || rowObj.name || '').toString(),
            branchId: bId,
            amountUSD: typeof rowObj.amount_usd === 'number' ? rowObj.amount_usd : parseFloat(rowObj.amount_usd || rowObj.amount || '0') || 0,
            paymentDate: (rowObj.payment_date || rowObj.date || new Date().toISOString().split('T')[0]).toString(),
            paymentMethod: (rowObj.payment_method || rowObj.method || 'ABA Pay').toString()
          });
        }
      }
    });

    return { studentRows, paymentRows, errors };
  }, [sqlContent, currentBranchId]);

  // Filter parsed rows by selected branch
  const filteredStudents = useMemo(() => {
    return parsedData.studentRows.filter(s => {
      const matchBranch = selectedBranchFilter === 'all' || s.branchId === selectedBranchFilter;
      const matchSearch = !searchFilter.trim() || 
        s.studentCode.toLowerCase().includes(searchFilter.toLowerCase()) ||
        s.nameKhmer.toLowerCase().includes(searchFilter.toLowerCase()) ||
        s.nameEnglish.toLowerCase().includes(searchFilter.toLowerCase());
      return matchBranch && matchSearch;
    });
  }, [parsedData.studentRows, selectedBranchFilter, searchFilter]);

  const filteredPayments = useMemo(() => {
    return parsedData.paymentRows.filter(p => {
      const matchBranch = selectedBranchFilter === 'all' || p.branchId === selectedBranchFilter;
      const matchSearch = !searchFilter.trim() || 
        p.invoiceNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.studentCode.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.studentName.toLowerCase().includes(searchFilter.toLowerCase());
      return matchBranch && matchSearch;
    });
  }, [parsedData.paymentRows, selectedBranchFilter, searchFilter]);

  // Automated Analysis Grouped by Branch
  const branchAnalytics = useMemo(() => {
    const branchMap = new Map<string, {
      branchId: string;
      branchNameKhmer: string;
      branchCode: string;
      totalStudents: number;
      totalTuitionBilled: number;
      totalDiscountGiven: number;
      netTuitionPayable: number;
      totalPastYearDue: number; // Last Year Owed
      totalOpeningDebt: number; // Past Year Due + Net Tuition
      totalPaymentsReceived: number;
      totalEndingDebt: number;
      collectionRate: number;
      classes: Set<string>;
    }>();

    // Initialize all existing school branches
    branches.forEach(b => {
      branchMap.set(b.id, {
        branchId: b.id,
        branchNameKhmer: b.nameKhmer,
        branchCode: b.code,
        totalStudents: 0,
        totalTuitionBilled: 0,
        totalDiscountGiven: 0,
        netTuitionPayable: 0,
        totalPastYearDue: 0,
        totalOpeningDebt: 0,
        totalPaymentsReceived: 0,
        totalEndingDebt: 0,
        collectionRate: 0,
        classes: new Set()
      });
    });

    // Populate students & charges by branch
    parsedData.studentRows.forEach(s => {
      let b = branchMap.get(s.branchId);
      if (!b) {
        b = {
          branchId: s.branchId,
          branchNameKhmer: `សាខា ${s.branchId.toUpperCase()}`,
          branchCode: s.branchId.toUpperCase(),
          totalStudents: 0,
          totalTuitionBilled: 0,
          totalDiscountGiven: 0,
          netTuitionPayable: 0,
          totalPastYearDue: 0,
          totalOpeningDebt: 0,
          totalPaymentsReceived: 0,
          totalEndingDebt: 0,
          collectionRate: 0,
          classes: new Set()
        };
        branchMap.set(s.branchId, b);
      }

      b.totalStudents++;
      b.totalTuitionBilled += s.tuitionFee;
      const discount = s.tuitionFee * (s.discountPercent / 100);
      b.totalDiscountGiven += discount;
      const netPayable = s.tuitionFee - discount;
      b.netTuitionPayable += netPayable;
      b.totalPastYearDue += (s.pastYearDue || 0);
      b.classes.add(s.classGrade);
    });

    // Populate payments by branch
    parsedData.paymentRows.forEach(p => {
      let b = branchMap.get(p.branchId);
      if (b) {
        b.totalPaymentsReceived += p.amountUSD;
      }
    });

    // Calculate final indicators for each branch
    const list = Array.from(branchMap.values()).map(b => {
      b.totalOpeningDebt = b.totalPastYearDue + b.netTuitionPayable;
      b.totalEndingDebt = Math.max(0, b.totalOpeningDebt - b.totalPaymentsReceived);
      b.collectionRate = b.totalOpeningDebt > 0 
        ? Math.min(100, Math.round((b.totalPaymentsReceived / b.totalOpeningDebt) * 100)) 
        : 0;
      return b;
    });

    // Filter by branch if selected
    if (selectedBranchFilter === 'all') {
      return list.filter(b => b.totalStudents > 0 || b.totalPaymentsReceived > 0);
    }
    return list.filter(b => b.branchId === selectedBranchFilter);
  }, [parsedData, branches, selectedBranchFilter]);

  // Grand Totals across all branches
  const grandTotals = useMemo(() => {
    return branchAnalytics.reduce((acc, b) => {
      acc.totalStudents += b.totalStudents;
      acc.totalTuitionBilled += b.totalTuitionBilled;
      acc.netTuitionPayable += b.netTuitionPayable;
      acc.totalPastYearDue += b.totalPastYearDue;
      acc.totalOpeningDebt += b.totalOpeningDebt;
      acc.totalPaymentsReceived += b.totalPaymentsReceived;
      acc.totalEndingDebt += b.totalEndingDebt;
      return acc;
    }, {
      totalStudents: 0,
      totalTuitionBilled: 0,
      netTuitionPayable: 0,
      totalPastYearDue: 0,
      totalOpeningDebt: 0,
      totalPaymentsReceived: 0,
      totalEndingDebt: 0
    });
  }, [branchAnalytics]);

  // Handle file drop / upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setSqlContent(text);
        setImportStatusMessage(`បានផ្ទុកឯកសារ ${file.name} ដោយជោគជ័យ (${(file.size / 1024).toFixed(1)} KB)`);
        setTimeout(() => setImportStatusMessage(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  // 1-Click Import & Apply to System (Persist into Context and Sync Due Reports)
  const handleApplyToSystem = () => {
    setIsApplying(true);
    setTimeout(() => {
      let addedStudents = 0;
      let updatedStudentsCount = 0;
      let addedPayments = 0;

      // 1. Process Students & Sync Last Year Owed
      parsedData.studentRows.forEach(sr => {
        const existing = students.find(s => s.studentCode === sr.studentCode || s.roll === sr.studentCode);
        if (existing) {
          updateStudent(existing.id, {
            nameKhmer: sr.nameKhmer,
            nameEnglish: sr.nameEnglish,
            classGrade: sr.classGrade,
            branchId: sr.branchId,
            curriculum: sr.curriculum,
            tuitionFee: sr.tuitionFee,
            discountPercentage: sr.discountPercent,
            pastYearDue: sr.pastYearDue, // Last Year Owed
            pastYearTuition: sr.curriculum === 'english' ? sr.pastYearDue : undefined
          });
          updatedStudentsCount++;
        } else {
          addStudent({
            studentCode: sr.studentCode,
            nameKhmer: sr.nameKhmer,
            nameEnglish: sr.nameEnglish,
            username: sr.studentCode.toLowerCase(),
            roll: sr.studentCode.replace(/\D/g, '') || sr.studentCode,
            classGrade: sr.classGrade,
            gender: sr.gender === 'Female' ? 'Female' : 'Male',
            birthday: '2012-05-15',
            phone: '077 473 545',
            guardianPhone: '077 473 545',
            address: 'ខេត្តសៀមរាប',
            parentName: 'អាណាព្យាបាលសិស្ស',
            avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
            branchId: sr.branchId,
            status: 'active',
            registrationDate: new Date().toISOString().split('T')[0],
            curriculum: sr.curriculum,
            tuitionFee: sr.tuitionFee,
            discountPercentage: sr.discountPercent,
            pastYearDue: sr.pastYearDue, // Last Year Owed
            pastYearTuition: sr.curriculum === 'english' ? sr.pastYearDue : undefined
          });
          addedStudents++;
        }
      });

      // 2. Process Payments
      parsedData.paymentRows.forEach(pr => {
        addPayment({
          invoiceNumber: pr.invoiceNumber,
          studentId: pr.studentCode,
          studentName: pr.studentName,
          studentCode: pr.studentCode,
          branchId: pr.branchId,
          title: `បង់ថ្លៃសិក្សា (SQL Import)`,
          category: 'Tuition',
          totalUSD: pr.amountUSD,
          paidUSD: pr.amountUSD,
          balanceUSD: 0,
          paymentMethod: (pr.paymentMethod as any) || 'ABA Pay',
          status: 'Paid',
          issuedDate: pr.paymentDate,
          dueDate: pr.paymentDate
        });
        addedPayments++;
      });

      // 3. Bidirectional Sync with Due Reports to ensure Last Year Owed is immediately reflected
      syncDueReportWithStudents();

      setIsApplying(false);
      setImportStatusMessage(
        `អនុវត្តទិន្នន័យ SQL ជោគជ័យ៖ សិស្សថ្មី +${addedStudents}, ធ្វើបច្ចុប្បន្នភាព ${updatedStudentsCount}, វិក្កយបត្រ +${addedPayments} ព្រមទាំង Sync បំណុលឆ្នាំចាស់ (Last Year Owed) ទៅកាន់តារាង Due Report រួចរាល់!`
      );
      setTimeout(() => setImportStatusMessage(null), 6000);
    }, 400);
  };

  // Export Analysis to Excel
  const handleExportAnalyticsExcel = () => {
    const data = branchAnalytics.map(b => ({
      'សាខា (Branch Code)': b.branchCode,
      'ឈ្មោះសាខា (Branch Name)': b.branchNameKhmer,
      'ចំនួនសិស្សសរុប (Total Students)': b.totalStudents,
      'ថ្លៃសិក្សាដើមសរុប (Total Tuition Billed)': b.totalTuitionBilled,
      'បញ្ចុះតម្លៃសរុប (Total Discount)': b.totalDiscountGiven,
      'ថ្លៃសិក្សាត្រូវបង់សុទ្ធ (Net Payable)': b.netTuitionPayable,
      'បំណុលឆ្នាំចាស់ (Last Year Owed)': b.totalPastYearDue,
      'បំណុលដើមគ្រាសរុប (Opening Debt)': b.totalOpeningDebt,
      'បានបង់សរុប (Total Payments Received)': b.totalPaymentsReceived,
      'បំណុលចុងគ្រាសរុប (Closing Debt)': b.totalEndingDebt,
      'អត្រាប្រមូលប្រាក់ (%) (Collection Rate)': `${b.collectionRate}%`
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Branch_SQL_Analytics');
    XLSX.writeFile(wb, `FBIS_Branch_SQL_Analytics_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header & Overview */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 font-khmer flex items-center gap-2">
                <span>នាំចូល និងវិភាគទិន្នន័យ SQL តាមសាខា</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 font-mono">
                  Auto-Analysis by Branch
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-khmer">
                វិភាគទិន្នន័យសិស្ស ការបង់ប្រាក់ និងបំណុលជំពាក់ឆ្នាំចាស់ (Last Year Owed) តាមសាខានីមួយៗដោយស្វ័យប្រវត្តិតាមរយៈ SQL Script
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Branch Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Building className="w-3.5 h-3.5 text-amber-600" />
            <span className="font-khmer text-slate-600">សាខា:</span>
            <select
              value={selectedBranchFilter}
              onChange={(e) => setSelectedBranchFilter(e.target.value)}
              className="bg-transparent font-bold font-khmer text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">🏢 គ្រប់សាខាទាំងអស់ ({branches.length})</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.code} - {b.nameKhmer}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportAnalyticsExcel}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={handleApplyToSystem}
            disabled={isApplying || parsedData.studentRows.length === 0}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xs"
          >
            <Play className={`w-4 h-4 ${isApplying ? 'animate-spin' : ''}`} />
            <span className="font-khmer">អនុវត្តទិន្នន័យចូលប្រព័ន្ធ</span>
          </button>
        </div>
      </div>

      {/* Status Alert Notification */}
      {importStatusMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs flex items-center justify-between shadow-xs animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-khmer font-bold">{importStatusMessage}</span>
          </div>
          <button 
            onClick={() => setImportStatusMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer font-bold px-2 py-0.5 rounded"
          >
            ✕
          </button>
        </div>
      )}

      {/* SQL Editor & Sample Loaders */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-slate-800 font-khmer">
              បញ្ចូល SQL Query / Script ឬជ្រើសរើសទិន្នន័យគំរូតាមសាខា៖
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSqlContent(SAMPLE_SQL_BRANCH_01)}
              className="px-2.5 py-1 text-xs rounded-lg font-mono bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 cursor-pointer transition-colors"
            >
              🏢 FBIS Campus 01 SQL
            </button>
            <button
              onClick={() => setSqlContent(SAMPLE_SQL_BRANCH_02)}
              className="px-2.5 py-1 text-xs rounded-lg font-mono bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 cursor-pointer transition-colors"
            >
              🏢 FBIS Campus 02 SQL
            </button>
            <button
              onClick={() => setSqlContent(SAMPLE_SQL_BRANCH_03)}
              className="px-2.5 py-1 text-xs rounded-lg font-mono bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 cursor-pointer transition-colors"
            >
              🏢 FBIS Campus 03 SQL
            </button>
            <button
              onClick={() => setSqlContent(`${SAMPLE_SQL_BRANCH_01}\n\n${SAMPLE_SQL_BRANCH_02}\n\n${SAMPLE_SQL_BRANCH_03}`)}
              className="px-2.5 py-1 text-xs rounded-lg font-mono bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 cursor-pointer hover:bg-indigo-100 transition-colors"
            >
              ⚡ Consolidated All Branches SQL
            </button>

            <label className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-mono cursor-pointer flex items-center gap-1.5 transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload .sql</span>
              <input type="file" accept=".sql,.txt" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Text Area */}
        <textarea
          rows={6}
          value={sqlContent}
          onChange={(e) => setSqlContent(e.target.value)}
          placeholder="PASTE YOUR SQL HERE: INSERT INTO students (student_code, name_khmer, branch_id, past_year_due...) VALUES (...)"
          className="w-full p-3 font-mono text-xs bg-slate-950 text-emerald-400 border border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-inner resize-y"
        />

        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 font-khmer">
          <span>
            រកឃើញក្នុង SQL៖ សិស្ស <b className="font-mono text-indigo-700">{parsedData.studentRows.length}</b> នាក់, វិក្កយបត្រ <b className="font-mono text-emerald-700">{parsedData.paymentRows.length}</b>, សាខា <b className="font-mono text-amber-700">{branchAnalytics.length}</b>
          </span>
          <span className="font-sans italic">
            * គាំទ្រការទាញយកកូដសិស្ស ថ្នាក់ សាខា និងបំណុលឆ្នាំចាស់ (past_year_due / last_year_owed) ដោយស្វ័យប្រវត្តិ។
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-khmer flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>ការវិភាគតាមសាខា (Branch Analytics)</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-khmer flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'students'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>តារាងសិស្សបានវិភាគ ({filteredStudents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-khmer flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'payments'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>តារាងការបង់ប្រាក់ ({filteredPayments.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: BRANCH ANALYTICS DASHBOARD */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-khmer block">សិស្សសរុប (Total Students)</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black font-mono text-slate-900">{grandTotals.totalStudents}</span>
                <span className="text-xs text-slate-400 font-khmer">គ្រប់សាខា</span>
              </div>
            </div>

            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 shadow-2xs">
              <span className="text-xs text-amber-800 font-khmer font-bold block">
                បំណុលឆ្នាំចាស់សរុប (Last Year Owed)
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black font-mono text-amber-900">
                  ${grandTotals.totalPastYearDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-amber-700 font-khmer font-bold">Sync ទៅ Due Report</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 shadow-2xs">
              <span className="text-xs text-emerald-800 font-khmer font-bold block">
                បានបង់សរុប (Total Collected)
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black font-mono text-emerald-900">
                  ${grandTotals.totalPaymentsReceived.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-emerald-700 font-mono font-bold">
                  {grandTotals.totalOpeningDebt > 0 
                    ? `${Math.round((grandTotals.totalPaymentsReceived / grandTotals.totalOpeningDebt) * 100)}%` 
                    : '0%'}
                </span>
              </div>
            </div>

            <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-200 shadow-2xs">
              <span className="text-xs text-rose-800 font-khmer font-bold block">
                បំណុលនៅជំពាក់សរុប (Ending Debt)
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black font-mono text-rose-900">
                  ${grandTotals.totalEndingDebt.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-rose-700 font-khmer">ចាំបាច់ទារប្រាក់</span>
              </div>
            </div>
          </div>

          {/* Branch-by-Branch Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {branchAnalytics.map(b => (
              <div key={b.branchId} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                      {b.branchCode}
                    </span>
                    <h3 className="text-sm font-black text-slate-900 font-khmer mt-1">
                      {b.branchNameKhmer}
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-1 bg-slate-100 rounded-lg text-slate-700">
                    {b.totalStudents} សិស្ស
                  </span>
                </div>

                {/* Progress bar of Collection */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-khmer">
                    <span className="text-slate-500">អត្រាប្រមូលប្រាក់៖</span>
                    <span className="font-mono font-bold text-slate-800">{b.collectionRate}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        b.collectionRate >= 80 ? 'bg-emerald-500' : b.collectionRate >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, b.collectionRate)}%` }}
                    />
                  </div>
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100 font-mono">
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <span className="text-[10px] text-slate-500 font-khmer block">ថ្លៃសិក្សាត្រូវបង់</span>
                    <b className="text-slate-900">${b.netTuitionPayable.toFixed(2)}</b>
                  </div>
                  <div className="p-2 bg-amber-50 rounded-xl">
                    <span className="text-[10px] text-amber-700 font-khmer block font-bold">បំណុលឆ្នាំចាស់</span>
                    <b className="text-amber-900 font-bold">${b.totalPastYearDue.toFixed(2)}</b>
                  </div>
                  <div className="p-2 bg-emerald-50 rounded-xl">
                    <span className="text-[10px] text-emerald-700 font-khmer block">បានបង់សរុប</span>
                    <b className="text-emerald-900 font-bold">${b.totalPaymentsReceived.toFixed(2)}</b>
                  </div>
                  <div className="p-2 bg-rose-50 rounded-xl">
                    <span className="text-[10px] text-rose-700 font-khmer block">នៅជំពាក់សរុប</span>
                    <b className="text-rose-900 font-bold">${b.totalEndingDebt.toFixed(2)}</b>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-khmer pt-1 border-t border-slate-100">
                  <span>ថ្នាក់៖ {Array.from(b.classes).join(', ') || '-'}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Consolidated Cross-Branch Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 font-khmer flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>តារាងប្រៀបធៀបហិរញ្ញវត្ថុ និងបំណុលតាមសាខា (Consolidated Branch Matrix)</span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-khmer text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">កូដសាខា</th>
                    <th className="p-2.5">ឈ្មោះសាខា</th>
                    <th className="p-2.5 text-center">សិស្ស</th>
                    <th className="p-2.5 text-right">ថ្លៃសិក្សាដើម</th>
                    <th className="p-2.5 text-right">បញ្ចុះតម្លៃ</th>
                    <th className="p-2.5 text-right font-bold text-slate-900">ថ្លៃសិក្សាត្រូវបង់</th>
                    <th className="p-2.5 text-right bg-amber-100/70 text-amber-950 font-bold">បំណុលឆ្នាំចាស់</th>
                    <th className="p-2.5 text-right text-emerald-800 font-bold">បានបង់សរុប</th>
                    <th className="p-2.5 text-right bg-rose-100/70 text-rose-950 font-bold">នៅជំពាក់សរុប</th>
                    <th className="p-2.5 text-center">អត្រាប្រមូល</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-xs">
                  {branchAnalytics.map(b => (
                    <tr key={b.branchId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-2.5 font-bold text-indigo-700">{b.branchCode}</td>
                      <td className="p-2.5 font-khmer font-bold text-slate-900">{b.branchNameKhmer}</td>
                      <td className="p-2.5 text-center">{b.totalStudents}</td>
                      <td className="p-2.5 text-right">${b.totalTuitionBilled.toFixed(2)}</td>
                      <td className="p-2.5 text-right text-slate-500">${b.totalDiscountGiven.toFixed(2)}</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">${b.netTuitionPayable.toFixed(2)}</td>
                      <td className="p-2.5 text-right font-bold bg-amber-50 text-amber-900">${b.totalPastYearDue.toFixed(2)}</td>
                      <td className="p-2.5 text-right font-bold text-emerald-700">${b.totalPaymentsReceived.toFixed(2)}</td>
                      <td className="p-2.5 text-right font-bold bg-rose-50 text-rose-800">${b.totalEndingDebt.toFixed(2)}</td>
                      <td className="p-2.5 text-center font-bold">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                          b.collectionRate >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {b.collectionRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-900 text-white font-mono font-bold text-xs border-t-2 border-slate-700">
                  <tr>
                    <td colSpan={2} className="p-2.5 font-khmer text-center">សរុបរួមគ្រប់សាខា</td>
                    <td className="p-2.5 text-center">{grandTotals.totalStudents}</td>
                    <td className="p-2.5 text-right">${grandTotals.totalTuitionBilled.toFixed(2)}</td>
                    <td className="p-2.5 text-right text-slate-400">-</td>
                    <td className="p-2.5 text-right text-amber-300">${grandTotals.netTuitionPayable.toFixed(2)}</td>
                    <td className="p-2.5 text-right text-amber-400 font-black">${grandTotals.totalPastYearDue.toFixed(2)}</td>
                    <td className="p-2.5 text-right text-emerald-300">${grandTotals.totalPaymentsReceived.toFixed(2)}</td>
                    <td className="p-2.5 text-right text-rose-300 font-black">${grandTotals.totalEndingDebt.toFixed(2)}</td>
                    <td className="p-2.5 text-center font-khmer text-[11px]">-</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DETAILED STUDENTS LIST */}
      {/* ========================================================================= */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative min-w-[260px]">
              <input
                type="text"
                placeholder="ស្វែងរកតាម ID, ឈ្មោះ..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            <span className="text-xs text-slate-500 font-khmer">
              សិស្សសរុប៖ <b className="font-mono text-slate-900">{filteredStudents.length}</b> នាក់
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-khmer text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-2">#</th>
                  <th className="p-2">អត្តលេខ</th>
                  <th className="p-2">ឈ្មោះខ្មែរ</th>
                  <th className="p-2">ឈ្មោះអង់គ្លេស</th>
                  <th className="p-2 text-center">ភេទ</th>
                  <th className="p-2">ថ្នាក់</th>
                  <th className="p-2">សាខា</th>
                  <th className="p-2 text-right">ថ្លៃសិក្សាដើម</th>
                  <th className="p-2 text-center">% ចុះ</th>
                  <th className="p-2 text-right bg-amber-50 text-amber-900 font-bold">បំណុលឆ្នាំចាស់ (Last Year Owed)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-xs">
                {filteredStudents.map((s, idx) => (
                  <tr key={s.studentCode || idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-2 text-slate-400">{idx + 1}</td>
                    <td className="p-2 font-bold text-indigo-700">{s.studentCode}</td>
                    <td className="p-2 font-khmer font-bold text-slate-900">{s.nameKhmer}</td>
                    <td className="p-2 font-sans text-slate-700">{s.nameEnglish}</td>
                    <td className="p-2 text-center">{s.gender}</td>
                    <td className="p-2 font-khmer">{s.classGrade}</td>
                    <td className="p-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                        {s.branchId.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-2 text-right">${s.tuitionFee.toFixed(2)}</td>
                    <td className="p-2 text-center">{s.discountPercent ? `${s.discountPercent}%` : '-'}</td>
                    <td className="p-2 text-right font-bold bg-amber-50 text-amber-900">
                      ${s.pastYearDue.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PAYMENTS LIST */}
      {/* ========================================================================= */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-3 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-khmer">
              វិក្កយបត្រសរុប៖ <b className="font-mono text-slate-900">{filteredPayments.length}</b>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-khmer text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-2">#</th>
                  <th className="p-2">លេខវិក្កយបត្រ</th>
                  <th className="p-2">អត្តលេខសិស្ស</th>
                  <th className="p-2">ឈ្មោះសិស្ស</th>
                  <th className="p-2">សាខា</th>
                  <th className="p-2 text-right">ទឹកប្រាក់បានបង់</th>
                  <th className="p-2">កាលបរិច្ឆេទ</th>
                  <th className="p-2">វិធីសាស្ត្របង់ប្រាក់</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-xs">
                {filteredPayments.map((p, idx) => (
                  <tr key={p.invoiceNumber || idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-2 text-slate-400">{idx + 1}</td>
                    <td className="p-2 font-bold text-blue-700">{p.invoiceNumber}</td>
                    <td className="p-2 font-bold text-slate-800">{p.studentCode}</td>
                    <td className="p-2 font-sans">{p.studentName}</td>
                    <td className="p-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                        {p.branchId.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-2 text-right font-bold text-emerald-700">${p.amountUSD.toFixed(2)}</td>
                    <td className="p-2 text-slate-600">{p.paymentDate}</td>
                    <td className="p-2 text-slate-600">{p.paymentMethod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
