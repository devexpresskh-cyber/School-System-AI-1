import React, { useState, useMemo, useEffect } from 'react';
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
  ArrowLeft,
  RefreshCw, 
  FileSpreadsheet, 
  Filter, 
  Layers, 
  Search, 
  Check, 
  Sparkles,
  BarChart3,
  AlertTriangle,
  Play,
  Wand2,
  Trash2,
  ShieldCheck,
  CheckSquare
} from 'lucide-react';
import * as XLSX from 'xlsx';

// Target system schema definition for student records
export interface SchemaFieldDefinition {
  key: string;
  labelKhmer: string;
  labelEnglish: string;
  type: 'string' | 'number' | 'gender' | 'curriculum' | 'date';
  required?: boolean;
  synonyms: string[];
  description: string;
}

export const TARGET_STUDENT_SCHEMA: SchemaFieldDefinition[] = [
  {
    key: 'studentCode',
    labelKhmer: 'អត្តលេខសិស្ស',
    labelEnglish: 'Student Code',
    type: 'string',
    required: true,
    synonyms: ['student_code', 'studentcode', 'scode', 's_code', 'std_id', 'stdid', 'roll_no', 'id_code', 'code', 'roll', 'id'],
    description: 'Unique identifier for the student (e.g. FBIS01-5001)'
  },
  {
    key: 'nameKhmer',
    labelKhmer: 'ឈ្មោះជាភាសាខ្មែរ',
    labelEnglish: 'Khmer Name',
    type: 'string',
    required: true,
    synonyms: ['name_khmer', 'namekhmer', 'kh_name', 'khmer_name', 'nom_kh', 'student_name_kh', 'name_kh', 'fullname_kh'],
    description: 'Full name in Khmer script'
  },
  {
    key: 'nameEnglish',
    labelKhmer: 'ឈ្មោះជាឡាតាំង',
    labelEnglish: 'English Name',
    type: 'string',
    required: false,
    synonyms: ['name_english', 'nameenglish', 'en_name', 'english_name', 'nom_en', 'student_name_en', 'latin_name', 'en_fullname', 'fullname_en'],
    description: 'Full name in Latin/English characters'
  },
  {
    key: 'gender',
    labelKhmer: 'ភេទ',
    labelEnglish: 'Gender',
    type: 'gender',
    required: false,
    synonyms: ['gender', 'sex', 'gen', 'gender_kh', 'gender_en'],
    description: 'Female / Male (ស្រី / ប្រុស)'
  },
  {
    key: 'classGrade',
    labelKhmer: 'កម្រិតថ្នាក់',
    labelEnglish: 'Class / Grade',
    type: 'string',
    required: true,
    synonyms: ['class_grade', 'classgrade', 'grade', 'class', 'room', 'grade_level', 'classroom', 'grade_kh', 'academic_level'],
    description: 'Grade level (e.g. ថ្នាក់ទី ៧, ថ្នាក់ K1)'
  },
  {
    key: 'branchId',
    labelKhmer: 'សាខាសិក្សា',
    labelEnglish: 'Branch / Campus',
    type: 'string',
    required: false,
    synonyms: ['branch_id', 'branchid', 'branch', 'campus', 'branch_code', 'campus_code', 'location_id', 'school_branch'],
    description: 'Campus ID (fbis-01, fbis-02, fbis-03, etc.)'
  },
  {
    key: 'curriculum',
    labelKhmer: 'កម្មវិធីសិក្សា',
    labelEnglish: 'Curriculum',
    type: 'curriculum',
    required: false,
    synonyms: ['curriculum', 'program', 'academic_program', 'curriculum_type', 'lang_track', 'section'],
    description: 'Khmer or English academic track'
  },
  {
    key: 'tuitionFee',
    labelKhmer: 'ថ្លៃសិក្សាប្រចាំឆ្នាំ ($)',
    labelEnglish: 'Tuition Fee ($)',
    type: 'number',
    required: false,
    synonyms: ['tuition_fee', 'tuitionfee', 'tuition', 'fee_usd', 'fee', 'school_fee', 'price', 'annual_fee', 'amount'],
    description: 'Standard tuition fee in USD'
  },
  {
    key: 'discountPercentage',
    labelKhmer: 'បញ្ចុះតម្លៃ (%)',
    labelEnglish: 'Discount (%)',
    type: 'number',
    required: false,
    synonyms: ['discount_percent', 'discountpercent', 'discount_percentage', 'disc', 'discount', 'discount_rate', 'scholarship_pct'],
    description: 'Percentage discount (0-100)'
  },
  {
    key: 'pastYearDue',
    labelKhmer: 'បំណុលឆ្នាំចាស់ ($)',
    labelEnglish: 'Last Year Owed ($)',
    type: 'number',
    required: false,
    synonyms: ['past_year_due', 'pastyeardue', 'old_debt', 'last_year_owed', 'arrears', 'due_2024', 'old_balance', 'past_due', 'previous_due', 'prior_debt'],
    description: 'Arrears / old year balance automatically mapped into Due Report'
  },
  {
    key: 'phone',
    labelKhmer: 'លេខទូរស័ព្ទ',
    labelEnglish: 'Phone Number',
    type: 'string',
    required: false,
    synonyms: ['phone', 'tel', 'phone_number', 'mobile', 'contact_no', 'guardian_phone', 'parent_phone'],
    description: 'Contact number for student or parent'
  },
  {
    key: 'birthday',
    labelKhmer: 'ថ្ងៃខែឆ្នាំកំណើត',
    labelEnglish: 'Date of Birth',
    type: 'date',
    required: false,
    synonyms: ['birthday', 'dob', 'birth_date', 'date_of_birth', 'bday'],
    description: 'Date of birth (YYYY-MM-DD)'
  }
];

// Presets
const PRESET_STANDARD_SQL = `-- =========================================================
-- PRESET 1: STANDARD FBIS DATABASE SCHEMA DUMP
-- Column names exactly match modern FBIS standards
-- =========================================================
INSERT INTO students (student_code, name_khmer, name_english, gender, class_grade, branch_id, curriculum, tuition_fee, discount_percent, past_year_due) VALUES
('FBIS01-5001', 'ចាន់ សុផល', 'Chan Sophal', 'Female', 'ថ្នាក់ទី ៧', 'fbis-01', 'khmer', 981.00, 10.0, 185.00),
('FBIS01-5002', 'សេង វិបុល', 'Seng Vibul', 'Male', 'ថ្នាក់ទី ៧', 'fbis-01', 'khmer', 981.00, 0.0, 240.50),
('FBIS01-5003', 'លី ស្រីម៉ៅ', 'Ly Sreymao', 'Female', 'ថ្នាក់ទី ៧', 'fbis-01', 'khmer', 981.00, 15.0, 0.00),
('FBIS01-5004', 'ម៉ៅ វឌ្ឍនា', 'Mao Vathana', 'Male', 'ថ្នាក់ K1', 'fbis-01', 'english', 640.00, 0.0, 120.00),
('FBIS02-6001', 'រស់ ពិសី', 'Ros Pisey', 'Female', 'ថ្នាក់ទី ៧', 'fbis-02', 'khmer', 981.00, 0.0, 310.00),
('FBIS02-6002', 'ហួត រតនា', 'Huot Rathana', 'Male', 'ថ្នាក់ទី ៨', 'fbis-02', 'khmer', 981.00, 5.0, 176.00),
('FBIS03-7001', 'គង់ វណ្ណៈ', 'Kong Vannak', 'Male', 'ថ្នាក់ទី ៧', 'fbis-03', 'khmer', 981.00, 0.0, 260.00);

INSERT INTO payments (invoice_number, student_code, student_name, branch_id, amount_usd, payment_date, payment_method) VALUES
('INV-01-2026-001', 'FBIS01-5001', 'Chan Sophal', 'fbis-01', 350.00, '2025-11-10', 'ABA Pay'),
('INV-01-2026-002', 'FBIS01-5002', 'Seng Vibul', 'fbis-01', 200.00, '2025-11-15', 'Cash'),
('INV-02-2026-101', 'FBIS02-6001', 'Ros Pisey', 'fbis-02', 400.00, '2025-11-20', 'ABA Pay');
`;

const PRESET_LEGACY_2024_SQL = `-- =========================================================
-- PRESET 2: LEGACY 2024 SYSTEM DUMP (COLUMN MISMATCHES PRESENT)
-- Non-standard columns: s_code, kh_name, en_name, sex, room, campus, tuition, disc, old_debt
-- The 'Mapping Step' will auto-detect and resolve these mismatches!
-- =========================================================
INSERT INTO students (s_code, kh_name, en_name, sex, room, campus, tuition, disc, old_debt) VALUES
('FBIS01-5010', 'ទៀង ពិសិដ្ឋ', 'Tieng Piseth', 'M', 'ថ្នាក់ទី ៧', '01-Sivatha', 981.00, 0.0, 150.00),
('FBIS01-5011', 'កែវ មុនីរ័ត្ន', 'Keo Moniroth', 'F', 'ថ្នាក់ទី ៧', '01-Sivatha', 981.00, 10.0, 85.00),
('FBIS02-6020', 'ស៊ូ រតនៈ', 'Sou Ratanak', 'M', 'ថ្នាក់ទី ៨', '02-WatBo', 981.00, 0.0, 220.00),
('FBIS02-6021', 'ឡុង ស្រីពៅ', 'Long Sreypov', 'F', 'ថ្នាក់ K1', '02-WatBo', 640.00, 20.0, 310.00),
('FBIS03-7030', 'ប៉ុក សម្បត្តិ', 'Pok Sambath', 'M', 'ថ្នាក់ទី ៩', '03-Angkor', 1050.00, 5.0, 450.00);

INSERT INTO payments (invoice_number, student_code, student_name, branch_id, amount_usd, payment_date, payment_method) VALUES
('INV-LEG-01', 'FBIS01-5010', 'Tieng Piseth', 'fbis-01', 250.00, '2025-10-15', 'Cash'),
('INV-LEG-02', 'FBIS02-6020', 'Sou Ratanak', 'fbis-02', 300.00, '2025-10-22', 'ABA Pay');
`;

const PRESET_LEGACY_2023_SQL = `-- =========================================================
-- PRESET 3: OLDER 2023 ARREARS ARCHIVE (ABBREVIATED COLUMNS)
-- Non-standard columns: std_id, student_name_kh, latin_name, gen, grade_level, branch_code, fee_usd, discount_rate, arrears
-- =========================================================
INSERT INTO students (std_id, student_name_kh, latin_name, gen, grade_level, branch_code, fee_usd, discount_rate, arrears) VALUES
('FBIS01-5088', 'អ៊ុក សុវណ្ណារ៉ា', 'Ouk Sovannara', 'Male', 'ថ្នាក់ទី ៧', 'CAMPUS-01', 981.00, 0.0, 520.00),
('FBIS02-6088', 'ពេជ្រ ចរិយា', 'Pech Chariya', 'Female', 'ថ្នាក់ទី ៨', 'CAMPUS-02', 981.00, 15.0, 190.00),
('FBIS03-7088', 'ជុំ សម្ភារ', 'Chum Samphar', 'Male', 'ថ្នាក់ K2', 'CAMPUS-03', 680.00, 0.0, 340.00);
`;

export interface ColumnMappingItem {
  sourceColumn: string;
  targetKey: string;
  isExactMatch: boolean;
  isSuggestedMismatch: boolean;
  sampleValues: any[];
  confidence: number; // 0 to 1
}

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
  phone?: string;
  birthday?: string;
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
    addStudent, 
    updateStudent,
    addPayment, 
    students, 
    syncDueReportWithStudents,
    clearAllDataKeepSettings
  } = useSchool();

  // Wizard state (Step 1: SQL Input, Step 2: Mapping, Step 3: Preview, Step 4: Analytics & Execution)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [sqlContent, setSqlContent] = useState<string>(PRESET_LEGACY_2024_SQL);
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');
  
  // Execution options
  const [importMode, setImportMode] = useState<'merge' | 'clearFirst'>('merge');
  const [autoSyncDueReport, setAutoSyncDueReport] = useState<boolean>(true);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Column Mappings state: maps sourceColumn -> targetKey
  const [columnMappings, setColumnMappings] = useState<Record<string, string>>({});

  // 1. Extract raw column headers and sample records from SQL statements
  const rawSqlAnalysis = useMemo(() => {
    const rawStudentCols: string[] = [];
    const rawStudentRows: Record<string, any>[] = [];
    const paymentRows: ParsedPaymentRow[] = [];
    const errors: string[] = [];

    if (!sqlContent || !sqlContent.trim()) {
      return { rawStudentCols, rawStudentRows, paymentRows, errors };
    }

    const statements = sqlContent.split(/;\s*[\r\n]+/);

    statements.forEach((stmt) => {
      const cleanStmt = stmt.trim();
      if (!cleanStmt || cleanStmt.startsWith('--')) return;

      // Detect students INSERT
      const studentMatch = cleanStmt.match(/INSERT\s+INTO\s+students\s*\(([^)]+)\)\s*VALUES\s*([\s\S]+)/i);
      if (studentMatch) {
        const columns = studentMatch[1].split(',').map(c => c.trim().toLowerCase().replace(/[`"']/g, ''));
        columns.forEach(col => {
          if (!rawStudentCols.includes(col)) rawStudentCols.push(col);
        });

        const valuesBlock = studentMatch[2];
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
          rawStudentRows.push(rowObj);
        }
      }

      // Detect payments INSERT
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

          let bId = (rowObj.branch_id || rowObj.branch || rowObj.campus || '').toString().toLowerCase();
          if (bId.includes('01') || bId.includes('sivatha')) bId = 'fbis-01';
          else if (bId.includes('02') || bId.includes('watbo')) bId = 'fbis-02';
          else if (bId.includes('03') || bId.includes('angkor')) bId = 'fbis-03';
          else if (bId.includes('04')) bId = 'fbis-04';
          else bId = currentBranchId || 'fbis-02';

          paymentRows.push({
            invoiceNumber: (rowObj.invoice_number || rowObj.invoiceno || `INV-${Date.now()}`).toString(),
            studentCode: (rowObj.student_code || rowObj.studentcode || rowObj.s_code || rowObj.std_id || '').toString(),
            studentName: (rowObj.student_name || rowObj.name || rowObj.kh_name || '').toString(),
            branchId: bId,
            amountUSD: typeof rowObj.amount_usd === 'number' ? rowObj.amount_usd : parseFloat(rowObj.amount_usd || rowObj.amount || '0') || 0,
            paymentDate: (rowObj.payment_date || rowObj.date || new Date().toISOString().split('T')[0]).toString(),
            paymentMethod: (rowObj.payment_method || rowObj.method || 'ABA Pay').toString()
          });
        }
      }
    });

    return { rawStudentCols, rawStudentRows, paymentRows, errors };
  }, [sqlContent, currentBranchId]);

  // 2. Intelligent Auto-Detection of Column Mismatches & Suggestions
  const detectedMappings = useMemo<ColumnMappingItem[]>(() => {
    const list: ColumnMappingItem[] = [];

    rawSqlAnalysis.rawStudentCols.forEach(col => {
      const normalizedCol = col.toLowerCase().replace(/[-_\s]/g, '');
      const sampleVals = rawSqlAnalysis.rawStudentRows.slice(0, 3).map(r => r[col]);

      let bestTarget = '';
      let isExact = false;
      let isMismatchResolved = false;
      let confidence = 0;

      // Check each field in TARGET_STUDENT_SCHEMA
      for (const field of TARGET_STUDENT_SCHEMA) {
        // Exact match
        if (field.key.toLowerCase() === normalizedCol || field.key.toLowerCase() === col) {
          bestTarget = field.key;
          isExact = true;
          confidence = 1.0;
          break;
        }

        // Synonym match
        const hasSynonym = field.synonyms.some(s => {
          const normSyn = s.toLowerCase().replace(/[-_\s]/g, '');
          return normSyn === normalizedCol || col.includes(s) || s.includes(col);
        });

        if (hasSynonym) {
          bestTarget = field.key;
          isMismatchResolved = true;
          confidence = 0.9;
          break;
        }
      }

      list.push({
        sourceColumn: col,
        targetKey: bestTarget || 'IGNORE',
        isExactMatch: isExact,
        isSuggestedMismatch: isMismatchResolved,
        sampleValues: sampleVals,
        confidence
      });
    });

    return list;
  }, [rawSqlAnalysis.rawStudentCols, rawSqlAnalysis.rawStudentRows]);

  // Synchronize initial mappings state whenever detectedMappings changes
  useEffect(() => {
    const initialMap: Record<string, string> = {};
    detectedMappings.forEach(item => {
      initialMap[item.sourceColumn] = item.targetKey;
    });
    setColumnMappings(initialMap);
  }, [detectedMappings]);

  // Helper to update individual mapping
  const handleMappingChange = (sourceCol: string, targetKey: string) => {
    setColumnMappings(prev => ({
      ...prev,
      [sourceCol]: targetKey
    }));
  };

  // Helper to re-apply all smart suggestions
  const handleAutoApplyAllSuggestions = () => {
    const updated: Record<string, string> = {};
    detectedMappings.forEach(item => {
      updated[item.sourceColumn] = item.targetKey;
    });
    setColumnMappings(updated);
    setStatusMessage({
      type: 'info',
      text: 'បានផ្គូផ្គង និងកែតម្រូវជួរឈរដោយស្វ័យប្រវត្តិរួចរាល់ (All smart suggestions applied)'
    });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // 3. Transform Raw Rows into Standardized Domain Student Rows
  const transformedStudents = useMemo<ParsedStudentRow[]>(() => {
    if (rawSqlAnalysis.rawStudentRows.length === 0) return [];

    return rawSqlAnalysis.rawStudentRows.map((rawRow, idx) => {
      // Build reverse lookup from mapped targets
      const mappedValues: Record<string, any> = {};

      Object.entries(columnMappings).forEach(([sourceCol, targetKey]) => {
        if (targetKey && targetKey !== 'IGNORE') {
          mappedValues[targetKey] = rawRow[sourceCol];
        }
      });

      // 1. Student Code
      const studentCode = (
        mappedValues.studentCode || 
        rawRow.student_code || 
        rawRow.s_code || 
        rawRow.std_id || 
        `FBIS-${idx + 1001}`
      ).toString().trim();

      // 2. Khmer Name
      const nameKhmer = (
        mappedValues.nameKhmer || 
        rawRow.name_khmer || 
        rawRow.kh_name || 
        rawRow.student_name_kh || 
        studentCode
      ).toString().trim();

      // 3. English Name
      const nameEnglish = (
        mappedValues.nameEnglish || 
        rawRow.name_english || 
        rawRow.en_name || 
        rawRow.latin_name || 
        nameKhmer
      ).toString().trim();

      // 4. Gender Normalization
      let genderRaw = (mappedValues.gender || rawRow.gender || rawRow.sex || rawRow.gen || 'Female').toString().toLowerCase();
      let gender = 'Female';
      if (genderRaw === 'm' || genderRaw === 'male' || genderRaw === 'ប្រុស' || genderRaw === 'b') {
        gender = 'Male';
      } else {
        gender = 'Female';
      }

      // 5. Class / Grade
      const classGrade = (
        mappedValues.classGrade || 
        rawRow.class_grade || 
        rawRow.room || 
        rawRow.grade_level || 
        'ថ្នាក់ទី ៧'
      ).toString().trim();

      // 6. Branch ID Normalization
      let branchRaw = (
        mappedValues.branchId || 
        rawRow.branch_id || 
        rawRow.campus || 
        rawRow.branch_code || 
        ''
      ).toString().toLowerCase();

      let branchId = currentBranchId || 'fbis-02';
      if (branchRaw.includes('01') || branchRaw.includes('sivatha') || studentCode.includes('FBIS01')) branchId = 'fbis-01';
      else if (branchRaw.includes('02') || branchRaw.includes('watbo') || studentCode.includes('FBIS02')) branchId = 'fbis-02';
      else if (branchRaw.includes('03') || branchRaw.includes('angkor') || studentCode.includes('FBIS03')) branchId = 'fbis-03';
      else if (branchRaw.includes('04') || studentCode.includes('FBIS04')) branchId = 'fbis-04';

      // 7. Curriculum
      let curriculum = (mappedValues.curriculum || '').toString().toLowerCase();
      if (!curriculum) {
        curriculum = classGrade.toUpperCase().includes('K') || classGrade.toUpperCase().includes('GRADE') ? 'english' : 'khmer';
      }

      // 8. Tuition Fee
      const rawTuition = mappedValues.tuitionFee ?? rawRow.tuition_fee ?? rawRow.tuition ?? rawRow.fee_usd ?? 981;
      const tuitionFee = typeof rawTuition === 'number' ? rawTuition : parseFloat(rawTuition) || 981;

      // 9. Discount
      const rawDisc = mappedValues.discountPercentage ?? rawRow.discount_percent ?? rawRow.disc ?? rawRow.discount_rate ?? 0;
      const discountPercent = typeof rawDisc === 'number' ? rawDisc : parseFloat(rawDisc) || 0;

      // 10. Past Year Due / Last Year Owed
      const rawOldDebt = mappedValues.pastYearDue ?? rawRow.past_year_due ?? rawRow.old_debt ?? rawRow.last_year_owed ?? rawRow.arrears ?? 0;
      const pastYearDue = typeof rawOldDebt === 'number' ? rawOldDebt : parseFloat(rawOldDebt) || 0;

      return {
        studentCode,
        nameKhmer,
        nameEnglish,
        gender,
        classGrade,
        branchId,
        curriculum,
        tuitionFee,
        discountPercent,
        pastYearDue,
        phone: mappedValues.phone?.toString() || '077 473 545',
        birthday: mappedValues.birthday?.toString() || '2012-05-15',
        rawValues: rawRow
      };
    });
  }, [rawSqlAnalysis.rawStudentRows, columnMappings, currentBranchId]);

  // 4. Branch Analytics
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

    transformedStudents.forEach(s => {
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
      b.totalPastYearDue += s.pastYearDue;
      b.classes.add(s.classGrade);
    });

    rawSqlAnalysis.paymentRows.forEach(p => {
      let b = branchMap.get(p.branchId);
      if (b) {
        b.totalPaymentsReceived += p.amountUSD;
      }
    });

    const list = Array.from(branchMap.values()).map(b => {
      b.totalOpeningDebt = b.totalPastYearDue + b.netTuitionPayable;
      b.totalEndingDebt = Math.max(0, b.totalOpeningDebt - b.totalPaymentsReceived);
      b.collectionRate = b.totalOpeningDebt > 0 
        ? Math.min(100, Math.round((b.totalPaymentsReceived / b.totalOpeningDebt) * 100)) 
        : 0;
      return b;
    });

    if (selectedBranchFilter === 'all') {
      return list.filter(b => b.totalStudents > 0 || b.totalPaymentsReceived > 0);
    }
    return list.filter(b => b.branchId === selectedBranchFilter);
  }, [transformedStudents, rawSqlAnalysis.paymentRows, branches, selectedBranchFilter]);

  // Grand Totals
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

  // Filtered Students for Preview
  const filteredStudents = useMemo(() => {
    return transformedStudents.filter(s => {
      const matchBranch = selectedBranchFilter === 'all' || s.branchId === selectedBranchFilter;
      const matchSearch = !searchFilter.trim() || 
        s.studentCode.toLowerCase().includes(searchFilter.toLowerCase()) ||
        s.nameKhmer.toLowerCase().includes(searchFilter.toLowerCase()) ||
        s.nameEnglish.toLowerCase().includes(searchFilter.toLowerCase());
      return matchBranch && matchSearch;
    });
  }, [transformedStudents, selectedBranchFilter, searchFilter]);

  // File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setSqlContent(text);
        setStatusMessage({
          type: 'success',
          text: `បានផ្ទុកឯកសារ ${file.name} ដោយជោគជ័យ (${(file.size / 1024).toFixed(1)} KB)`
        });
        setTimeout(() => setStatusMessage(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  // Execution: Commit & Apply Data to System
  const handleCommitImport = () => {
    setIsExecuting(true);
    setTimeout(() => {
      try {
        // Step 1: Optional Clear operational data
        if (importMode === 'clearFirst') {
          clearAllDataKeepSettings();
        }

        let addedStudentsCount = 0;
        let updatedStudentsCount = 0;
        let addedPaymentsCount = 0;

        // Step 2: Ingest Students & Last Year Owed
        transformedStudents.forEach(sr => {
          const existing = students.find(s => s.studentCode === sr.studentCode || s.roll === sr.studentCode);
          if (existing && importMode === 'merge') {
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
              birthday: sr.birthday || '2012-05-15',
              phone: sr.phone || '077 473 545',
              guardianPhone: sr.phone || '077 473 545',
              address: 'ខេត្តសៀមរាប',
              parentName: 'អាណាព្យាបាលសិស្ស',
              avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
              branchId: sr.branchId,
              status: 'active',
              registrationDate: new Date().toISOString().split('T')[0],
              curriculum: sr.curriculum,
              tuitionFee: sr.tuitionFee,
              discountPercentage: sr.discountPercent,
              pastYearDue: sr.pastYearDue,
              pastYearTuition: sr.curriculum === 'english' ? sr.pastYearDue : undefined
            });
            addedStudentsCount++;
          }
        });

        // Step 3: Ingest Payments
        rawSqlAnalysis.paymentRows.forEach(pr => {
          const matchedStudent = transformedStudents.find(s => s.studentCode === pr.studentCode) ||
            students.find(s => s.studentCode === pr.studentCode);

          addPayment({
            invoiceNumber: pr.invoiceNumber,
            studentId: pr.studentCode,
            studentName: pr.studentName || matchedStudent?.nameEnglish || 'Student',
            studentNameKhmer: matchedStudent?.nameKhmer || pr.studentName || 'សិស្ស',
            studentCode: pr.studentCode,
            classGrade: matchedStudent?.classGrade || 'ថ្នាក់ទី ៧',
            academicYear: '2025-2026',
            runningYear: 2026,
            title: 'បង់ថ្លៃសិក្សា (SQL Import)',
            description: 'Imported from SQL Script',
            paymentType: '១ខែ',
            issuedDate: pr.paymentDate,
            startDate: pr.paymentDate,
            endDate: pr.paymentDate,
            fullAmount: pr.amountUSD,
            discountPercent: 0,
            promotionAmount: 0,
            amountToBePaid: pr.amountUSD,
            paidUSD: pr.amountUSD,
            paidKHR: 0,
            owedRemain: 0,
            exchangeRate: 4100,
            method: (pr.paymentMethod as any) || 'ABA Bank',
            status: 'Paid',
            branchId: pr.branchId,
            cashierName: 'System Import'
          });
          addedPaymentsCount++;
        });

        // Step 4: Auto-sync Due Reports Matrix & collect old year payments
        if (autoSyncDueReport) {
          syncDueReportWithStudents();
        }

        setIsExecuting(false);
        setStatusMessage({
          type: 'success',
          text: `នាំចូលទិន្នន័យជោគជ័យ៖ សិស្សថ្មី +${addedStudentsCount}, ធ្វើបច្ចុប្បន្នភាព ${updatedStudentsCount}, វិក្កយបត្រ +${addedPaymentsCount} ព្រមទាំងប្រមូលបំណុលឆ្នាំចាស់ (Last Year Owed) ទៅក្នុង Due Report ដោយស្វ័យប្រវត្តិ!`
        });
      } catch (err) {
        setIsExecuting(false);
        setStatusMessage({
          type: 'error',
          text: `មានបញ្ហាក្នុងការនាំចូលទិន្នន័យ៖ ${(err as Error).message}`
        });
      }
    }, 500);
  };

  // Export Analytics Excel
  const handleExportAnalyticsExcel = () => {
    const data = branchAnalytics.map(b => ({
      'សាខា (Branch Code)': b.branchCode,
      'ឈ្មោះសាខា (Branch Name)': b.branchNameKhmer,
      'ចំនួនសិស្សសរុប (Total Students)': b.totalStudents,
      'ថ្លៃសិក្សាដើមសរុប (Total Tuition)': b.totalTuitionBilled,
      'បញ្ចុះតម្លៃសរុប (Total Discount)': b.totalDiscountGiven,
      'ថ្លៃសិក្សាត្រូវបង់សុទ្ធ (Net Payable)': b.netTuitionPayable,
      'បំណុលឆ្នាំចាស់ (Last Year Owed)': b.totalPastYearDue,
      'បំណុលដើមគ្រាសរុប (Opening Debt)': b.totalOpeningDebt,
      'បានបង់សរុប (Total Payments)': b.totalPaymentsReceived,
      'បំណុលចុងគ្រាសរុប (Closing Debt)': b.totalEndingDebt,
      'អត្រាប្រមូលប្រាក់ (%)': `${b.collectionRate}%`
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Branch_SQL_Analytics');
    XLSX.writeFile(wb, `FBIS_Branch_Analytics_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const mismatchesCount = detectedMappings.filter(m => m.isSuggestedMismatch).length;
  const exactMatchesCount = detectedMappings.filter(m => m.isExactMatch).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-2xl">
            <Database className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 font-khmer">
                នាំចូល និងផ្ទៀងផ្ទាត់ទិន្នន័យ SQL (Guided SQL Import Wizard)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 font-mono">
                Smart Schema Correction
              </span>
            </div>
            <p className="text-xs text-slate-500 font-khmer mt-0.5">
              ដំណោះស្រាយស្វ័យប្រវត្តិកែតម្រូវឈ្មោះជួរឈរខុសគ្នា (Column Mismatches) រវាង SQL ចាស់ និងទម្រង់ប្រព័ន្ធថ្មី ព្រមទាំងប្រមូលបំណុលឆ្នាំចាស់ (Last Year Owed)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentStep === 4 && (
            <button
              onClick={handleExportAnalyticsExcel}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Analytics</span>
            </button>
          )}

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
        </div>
      </div>

      {/* Stepper Navigation */}
      <div className="bg-white px-6 py-4 rounded-2xl shadow-xs border border-slate-200">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
          
          {/* Step 1 */}
          <button
            onClick={() => setCurrentStep(1)}
            className={`relative z-10 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              currentStep === 1 
                ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-xs' 
                : currentStep > 1 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' 
                : 'bg-white text-slate-500 border border-slate-300'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              currentStep === 1 ? 'bg-white text-indigo-700' : currentStep > 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              {currentStep > 1 ? <Check className="w-3 h-3" /> : '1'}
            </span>
            <span className="font-khmer">ជំហានទី ១: បញ្ចូល SQL</span>
          </button>

          {/* Step 2 */}
          <button
            onClick={() => rawSqlAnalysis.rawStudentRows.length > 0 && setCurrentStep(2)}
            disabled={rawSqlAnalysis.rawStudentRows.length === 0}
            className={`relative z-10 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer disabled:opacity-50 ${
              currentStep === 2 
                ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-xs' 
                : currentStep > 2 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' 
                : 'bg-white text-slate-500 border border-slate-300'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              currentStep === 2 ? 'bg-white text-indigo-700' : currentStep > 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              {currentStep > 2 ? <Check className="w-3 h-3" /> : '2'}
            </span>
            <span className="font-khmer">ជំហានទី ២: ផ្ទៀងផ្ទាត់ជួរឈរ (Mapping Step)</span>
            {mismatchesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-purple-100 text-purple-800 font-mono">
                {mismatchesCount} កែសម្រួល
              </span>
            )}
          </button>

          {/* Step 3 */}
          <button
            onClick={() => rawSqlAnalysis.rawStudentRows.length > 0 && setCurrentStep(3)}
            disabled={rawSqlAnalysis.rawStudentRows.length === 0}
            className={`relative z-10 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer disabled:opacity-50 ${
              currentStep === 3 
                ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-xs' 
                : currentStep > 3 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' 
                : 'bg-white text-slate-500 border border-slate-300'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              currentStep === 3 ? 'bg-white text-indigo-700' : currentStep > 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              {currentStep > 3 ? <Check className="w-3 h-3" /> : '3'}
            </span>
            <span className="font-khmer">ជំហានទី ៣: ពិនិត្យទិន្នន័យ (Data Preview)</span>
          </button>

          {/* Step 4 */}
          <button
            onClick={() => rawSqlAnalysis.rawStudentRows.length > 0 && setCurrentStep(4)}
            disabled={rawSqlAnalysis.rawStudentRows.length === 0}
            className={`relative z-10 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer disabled:opacity-50 ${
              currentStep === 4 
                ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-xs' 
                : 'bg-white text-slate-500 border border-slate-300'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              currentStep === 4 ? 'bg-white text-indigo-700' : 'bg-slate-200 text-slate-600'
            }`}>
              4
            </span>
            <span className="font-khmer">ជំហានទី ៤: វិភាគ & អនុវត្តទិន្នន័យ (Execute)</span>
          </button>
        </div>
      </div>

      {/* Status Notifications */}
      {statusMessage && (
        <div className={`p-4 rounded-2xl text-xs flex items-center justify-between shadow-xs animate-in slide-in-from-top-2 duration-200 ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-50 border border-emerald-300 text-emerald-900' 
            : statusMessage.type === 'error'
            ? 'bg-rose-50 border border-rose-300 text-rose-900'
            : 'bg-blue-50 border border-blue-300 text-blue-900'
        }`}>
          <div className="flex items-center gap-2.5">
            {statusMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
            {statusMessage.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
            {statusMessage.type === 'info' && <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />}
            <span className="font-khmer font-bold">{statusMessage.text}</span>
          </div>
          <button 
            onClick={() => setStatusMessage(null)}
            className="cursor-pointer font-bold px-2 py-0.5 rounded opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 1: SQL INPUT & PRESETS */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-khmer flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-600" />
                <span>បញ្ចូលកូដ SQL ឬជ្រើសរើសទម្រង់គំរូ (SQL Script Input)</span>
              </h3>
              <p className="text-xs text-slate-500 font-khmer mt-0.5">
                គាំទ្រទម្រង់ INSERT INTO students និង INSERT INTO payments គ្រប់រចនាសម្ព័ន្ធទិន្នន័យចាស់ និងថ្មី
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-mono cursor-pointer flex items-center gap-1.5 transition-colors shadow-xs">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload .sql file</span>
                <input type="file" accept=".sql,.txt" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-700 font-khmer flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>ទម្រង់គំរូសាកល្បង (Presets):</span>
            </span>
            <button
              onClick={() => setSqlContent(PRESET_STANDARD_SQL)}
              className="px-2.5 py-1 text-xs rounded-lg font-mono bg-white hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 cursor-pointer transition-colors shadow-2xs"
            >
              📋 Preset 1: Standard FBIS Schema
            </button>
            <button
              onClick={() => setSqlContent(PRESET_LEGACY_2024_SQL)}
              className="px-2.5 py-1 text-xs rounded-lg font-mono bg-white hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 cursor-pointer transition-colors shadow-2xs font-bold text-purple-700"
            >
              ⚡ Preset 2: Legacy 2024 (Column Mismatches: s_code, old_debt...)
            </button>
            <button
              onClick={() => setSqlContent(PRESET_LEGACY_2023_SQL)}
              className="px-2.5 py-1 text-xs rounded-lg font-mono bg-white hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 cursor-pointer transition-colors shadow-2xs"
            >
              🏛️ Preset 3: Older 2023 (std_id, arrears...)
            </button>
          </div>

          {/* SQL Textarea */}
          <div className="relative">
            <textarea
              rows={12}
              value={sqlContent}
              onChange={(e) => setSqlContent(e.target.value)}
              placeholder="PASTE YOUR SQL HERE: INSERT INTO students (student_code, name_khmer, branch_id, past_year_due...) VALUES (...)"
              className="w-full p-4 font-mono text-xs bg-slate-950 text-emerald-400 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner resize-y leading-relaxed"
            />
          </div>

          {/* Step 1 Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="text-xs text-slate-500 font-khmer">
              រកឃើញក្នុង SQL៖ សិស្ស <b className="font-mono text-indigo-700 font-bold">{rawSqlAnalysis.rawStudentRows.length}</b> នាក់, 
              ជួរឈរ <b className="font-mono text-slate-800 font-bold">{rawSqlAnalysis.rawStudentCols.length}</b>, 
              វិក្កយបត្រ <b className="font-mono text-emerald-700 font-bold">{rawSqlAnalysis.paymentRows.length}</b>
            </div>

            <button
              onClick={() => setCurrentStep(2)}
              disabled={rawSqlAnalysis.rawStudentRows.length === 0}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-sm font-khmer"
            >
              <span>បន្តទៅកាន់ជំហានទី ២ (Column Mapping Step)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: THE GUIDED MAPPING STEP (AUTO-DETECT & CORRECT MISMATCHES) */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div className="space-y-4">
          {/* Mappings Summary Banner */}
          <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-indigo-300" />
                <h3 className="text-base font-black font-khmer">
                  ជំហានផ្គូផ្គង និងដោះស្រាយជួរឈរ (Intelligent Column Mapping Step)
                </h3>
              </div>
              <p className="text-xs text-indigo-200 font-khmer mt-1">
                ប្រព័ន្ធបានវិភាគស្វ័យប្រវត្តិរកឃើញ <b className="text-white font-mono">{rawSqlAnalysis.rawStudentCols.length}</b> ជួរឈរក្នុង SQL៖ 
                ត្រូវគ្នាទាំងស្រុង <b className="text-emerald-300 font-mono">{exactMatchesCount}</b>, 
                កែសម្រួលជួរឈរខុសទម្រង់ (Mismatches Resolved) <b className="text-amber-300 font-mono">{mismatchesCount}</b>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAutoApplyAllSuggestions}
                className="px-3.5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm font-khmer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>ផ្គូផ្គងស្វ័យប្រវត្តិតាមការណែនាំ (Auto-Apply All)</span>
              </button>
            </div>
          </div>

          {/* Mapping Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-800 font-khmer">
                តារាងផ្គូផ្គងជួរឈរ SQL ចាស់ ទៅកាន់ប្រព័ន្ធ FBIS ថ្មី (Source SQL Column ➜ Target Database Field)
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {rawSqlAnalysis.rawStudentCols.length} Columns Detected
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-khmer text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="p-3">ជួរឈរក្នុង SQL (Source Column)</th>
                    <th className="p-3">ទិន្នន័យគំរូជាក់ស្តែង (Sample Data)</th>
                    <th className="p-3 text-center">ស្ថានភាពផ្ទៀងផ្ទាត់ (Detection Status)</th>
                    <th className="p-3">វាលក្នុងប្រព័ន្ធទិន្នន័យ (Target DB Field)</th>
                    <th className="p-3">ការបម្លែងទិន្នន័យ (Transformation)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {detectedMappings.map((item) => {
                    const selectedTarget = columnMappings[item.sourceColumn] || item.targetKey;
                    const targetDef = TARGET_STUDENT_SCHEMA.find(f => f.key === selectedTarget);

                    return (
                      <tr key={item.sourceColumn} className="hover:bg-slate-50/80 transition-colors">
                        {/* Source Column */}
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-300">
                              {item.sourceColumn}
                            </span>
                          </div>
                        </td>

                        {/* Sample Values */}
                        <td className="p-3">
                          <div className="flex items-center gap-1.5 flex-wrap max-w-xs font-mono text-[11px] text-slate-600">
                            {item.sampleValues.map((v, i) => (
                              <span key={i} className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 truncate max-w-[100px]">
                                {String(v ?? 'NULL')}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Detection Status Badge */}
                        <td className="p-3 text-center">
                          {item.isExactMatch ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 font-khmer">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>ត្រូវគ្នាទាំងស្រុង (Exact Match)</span>
                            </span>
                          ) : item.isSuggestedMismatch ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 font-khmer ring-1 ring-purple-300">
                              <Sparkles className="w-3 h-3 text-purple-600" />
                              <span>កែតម្រូវស្វ័យប្រវត្តិ (Mismatch Resolved)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 font-khmer">
                              <span>មិនទាន់ផ្គូផ្គង (Unmapped)</span>
                            </span>
                          )}
                        </td>

                        {/* Target Field Selector */}
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <ArrowRight className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <select
                              value={selectedTarget}
                              onChange={(e) => handleMappingChange(item.sourceColumn, e.target.value)}
                              className={`w-full max-w-[240px] px-2.5 py-1.5 rounded-lg border text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer ${
                                selectedTarget === 'IGNORE'
                                  ? 'bg-slate-50 text-slate-400 border-slate-300'
                                  : 'bg-indigo-50/50 text-indigo-950 font-bold border-indigo-300'
                              }`}
                            >
                              <option value="IGNORE">🚫 រំលងជួរឈរនេះ (Ignore Column)</option>
                              <optgroup label="✨ វាលទិន្នន័យគោលដៅ (Target Fields)">
                                {TARGET_STUDENT_SCHEMA.map(f => (
                                  <option key={f.key} value={f.key}>
                                    {f.labelKhmer} ({f.labelEnglish})
                                  </option>
                                ))}
                              </optgroup>
                            </select>
                          </div>
                        </td>

                        {/* Data Transformation Preview */}
                        <td className="p-3 text-[11px] text-slate-500">
                          {selectedTarget === 'pastYearDue' && (
                            <span className="text-amber-800 font-bold font-khmer flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              ⭐ Sync ទៅ Due Report (Last Year Owed)
                            </span>
                          )}
                          {selectedTarget === 'gender' && (
                            <span className="font-khmer text-slate-600">
                              បម្លែង Male/Female & M/F
                            </span>
                          )}
                          {selectedTarget === 'tuitionFee' && (
                            <span className="font-mono text-emerald-700">
                              Float Parse ($ USD)
                            </span>
                          )}
                          {selectedTarget === 'branchId' && (
                            <span className="font-khmer text-slate-600">
                              ផ្គូផ្គង Campus ID (fbis-01..04)
                            </span>
                          )}
                          {selectedTarget === 'IGNORE' && (
                            <span className="text-slate-400 italic">មិននាំចូល</span>
                          )}
                          {!['pastYearDue', 'gender', 'tuitionFee', 'branchId', 'IGNORE'].includes(selectedTarget) && (
                            <span className="text-slate-500">{targetDef?.description || 'នាំចូលធម្មតា'}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Step 2 Footer Navigation */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors cursor-pointer flex items-center gap-1.5 font-khmer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>ត្រឡប់ក្រោយ (កែប្រែ SQL)</span>
              </button>

              <button
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-sm font-khmer"
              >
                <span>បន្តទៅកាន់ជំហានទី ៣ (ពិនិត្យទិន្នន័យបានបម្លែង)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: DATA PREVIEW & VALIDATION */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <div className="space-y-4">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-khmer block">សិស្សបានបម្លែងជោគជ័យ</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black font-mono text-indigo-700">{transformedStudents.length}</span>
                <span className="text-xs text-emerald-700 font-khmer font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> ត្រៀមរួចរាល់
                </span>
              </div>
            </div>

            <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 shadow-2xs">
              <span className="text-xs text-amber-800 font-khmer font-bold block">
                បំណុលឆ្នាំចាស់បានប្រមូល (Last Year Owed)
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black font-mono text-amber-900">
                  ${grandTotals.totalPastYearDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-amber-700 font-khmer">Auto-collected</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 shadow-2xs">
              <span className="text-xs text-emerald-800 font-khmer font-bold block">
                វិក្កយបត្រត្រូវបញ្ចូល (Payments)
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black font-mono text-emerald-900">{rawSqlAnalysis.paymentRows.length}</span>
                <span className="text-xs text-emerald-700 font-mono font-bold">
                  ${grandTotals.totalPaymentsReceived.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-2xs">
              <span className="text-xs text-slate-300 font-khmer block">ថ្លៃសិក្សាត្រូវបង់សុទ្ធ</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black font-mono text-amber-400">
                  ${grandTotals.netTuitionPayable.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-slate-300 font-khmer">Net Tuition</span>
              </div>
            </div>
          </div>

          {/* Detailed Preview Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative min-w-[280px]">
                <input
                  type="text"
                  placeholder="ស្វែងរកតាម ID, ឈ្មោះខ្មែរ, ឡាតាំង..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 font-khmer">
                <span>បង្ហាញ៖ <b className="font-mono text-slate-900">{filteredStudents.length}</b> / {transformedStudents.length} នាក់</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-khmer text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">#</th>
                    <th className="p-2.5">អត្តលេខ</th>
                    <th className="p-2.5">ឈ្មោះខ្មែរ</th>
                    <th className="p-2.5">ឈ្មោះឡាតាំង</th>
                    <th className="p-2.5 text-center">ភេទ</th>
                    <th className="p-2.5">ថ្នាក់</th>
                    <th className="p-2.5">សាខា</th>
                    <th className="p-2.5 text-right">ថ្លៃសិក្សាដើម</th>
                    <th className="p-2.5 text-center">% ចុះ</th>
                    <th className="p-2.5 text-right bg-amber-100 text-amber-950 font-bold">
                      បំណុលឆ្នាំចាស់ (Last Year Owed)
                    </th>
                    <th className="p-2.5 text-center">ស្ថានភាព</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-xs">
                  {filteredStudents.map((s, idx) => (
                    <tr key={s.studentCode || idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2.5 text-slate-400">{idx + 1}</td>
                      <td className="p-2.5 font-bold text-indigo-700">{s.studentCode}</td>
                      <td className="p-2.5 font-khmer font-bold text-slate-900">{s.nameKhmer}</td>
                      <td className="p-2.5 font-sans text-slate-700">{s.nameEnglish}</td>
                      <td className="p-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.gender === 'Female' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {s.gender}
                        </span>
                      </td>
                      <td className="p-2.5 font-khmer">{s.classGrade}</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                          {s.branchId.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-2.5 text-right">${s.tuitionFee.toFixed(2)}</td>
                      <td className="p-2.5 text-center">{s.discountPercent ? `${s.discountPercent}%` : '-'}</td>
                      <td className="p-2.5 text-right font-bold bg-amber-50 text-amber-900">
                        ${s.pastYearDue.toFixed(2)}
                      </td>
                      <td className="p-2.5 text-center font-khmer">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                          <Check className="w-3 h-3" /> ត្រៀមចូល
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Step 3 Footer Navigation */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors cursor-pointer flex items-center gap-1.5 font-khmer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>ត្រឡប់ក្រោយ (កែសម្រួល Mapping)</span>
              </button>

              <button
                onClick={() => setCurrentStep(4)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-sm font-khmer"
              >
                <span>បន្តទៅកាន់ជំហានទី ៤ (វិភាគ & នាំចូលទិន្នន័យ)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: MULTI-BRANCH ANALYTICS & EXECUTION */}
      {/* ========================================================================= */}
      {currentStep === 4 && (
        <div className="space-y-5">
          {/* Execution Settings & Options Box */}
          <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 font-khmer flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>ការកំណត់ការអនុវត្តទិន្នន័យ (Import Options & Execution)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option 1: Append vs Clear First */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <span className="text-xs font-bold text-slate-800 font-khmer block">
                  របៀបបញ្ចូលទិន្នន័យ (Data Injection Mode):
                </span>
                
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    checked={importMode === 'merge'}
                    onChange={() => setImportMode('merge')}
                    className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 font-khmer block">
                      បញ្ចូលបន្ថែម / បច្ចុប្បន្នភាព (Append & Merge with Existing Data)
                    </span>
                    <span className="text-[11px] text-slate-500 font-khmer">
                      រក្សាទុកសិស្ស និងទិន្នន័យចាស់ដែលមានស្រាប់ ហើយបញ្ចូលទិន្នន័យថ្មី ឬកែប្រែសិស្សដែលមានលេខកូដដូចគ្នា
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer pt-2 border-t border-slate-200">
                  <input
                    type="radio"
                    name="importMode"
                    checked={importMode === 'clearFirst'}
                    onChange={() => setImportMode('clearFirst')}
                    className="mt-0.5 text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-rose-700 font-khmer block flex items-center gap-1">
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>លុបទិន្នន័យប្រតិបត្តិការទាំងអស់ជាមុន រក្សាទុកតែការកំណត់ (Clear Operational Data First)</span>
                    </span>
                    <span className="text-[11px] text-slate-500 font-khmer">
                      លុបបញ្ជីសិស្សចាស់ ការបង់ប្រាក់ ចំណាយ និងតារាង Due Report ដោយរក្សាទុកយ៉ាងគង់វង្សនូវ សាខា គណនីប្រើប្រាស់ សេវាកម្ម និង System Settings
                    </span>
                  </div>
                </label>
              </div>

              {/* Option 2: Auto-sync Due Reports */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <span className="text-xs font-bold text-slate-800 font-khmer block">
                  ការធ្វើសមកាលកម្ម Due Report (Synchronization):
                </span>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSyncDueReport}
                    onChange={(e) => setAutoSyncDueReport(e.target.checked)}
                    className="mt-0.5 text-indigo-600 focus:ring-indigo-500 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-indigo-950 font-khmer block flex items-center gap-1">
                      <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                      <span>ធ្វើសមកាលកម្មស្វ័យប្រវត្តិជាមួយ Due Report (Khmer & English Matrix)</span>
                    </span>
                    <span className="text-[11px] text-slate-500 font-khmer">
                      ដកសិស្សគំរូចេញ ដាក់សិស្សជាក់ស្តែងតាមថ្នាក់ និងប្រមូលបំណុលឆ្នាំចាស់ (Last Year Owed) ចូលជួរឈរ N និង S/T ដោយស្វ័យប្រវត្តិ
                    </span>
                  </div>
                </label>

                <div className="p-2.5 bg-indigo-50/80 rounded-lg text-[11px] text-indigo-900 font-khmer border border-indigo-200">
                  💡 <b>ចំណាំសំខាន់៖</b> ពេលចុចអនុវត្ត ប្រព័ន្ធនឹងរៀបចំសិស្សទាំង {transformedStudents.length} នាក់ និងបំណុល ${grandTotals.totalPastYearDue.toFixed(2)} ចូលប្រព័ន្ធភ្លាមៗ។
                </div>
              </div>
            </div>

            {/* Commit Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors cursor-pointer flex items-center gap-1.5 font-khmer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>ត្រឡប់ក្រោយ (ពិនិត្យទិន្នន័យ)</span>
              </button>

              <button
                onClick={handleCommitImport}
                disabled={isExecuting || transformedStudents.length === 0}
                className={`px-6 py-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shadow-md font-khmer ${
                  importMode === 'clearFirst'
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <Play className={`w-4 h-4 ${isExecuting ? 'animate-spin' : ''}`} />
                <span>
                  {importMode === 'clearFirst'
                    ? 'លុបទិន្នន័យចាស់ រួចនាំចូលទិន្នន័យ SQL នេះ (Reset & Import)'
                    : 'អនុវត្ត និងនាំចូលទិន្នន័យ SQL ចូលប្រព័ន្ធ (Commit & Import)'}
                </span>
              </button>
            </div>
          </div>

          {/* Branch Analytics Overview */}
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
                  <span className="text-xs font-mono font-bold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-800">
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

          {/* Consolidated Cross-Branch Matrix Table */}
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
                    <th className="p-2.5 text-right bg-amber-100 text-amber-950 font-bold">បំណុលឆ្នាំចាស់</th>
                    <th className="p-2.5 text-right text-emerald-800 font-bold">បានបង់សរុប</th>
                    <th className="p-2.5 text-right bg-rose-100 text-rose-950 font-bold">នៅជំពាក់សរុប</th>
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
    </div>
  );
};
