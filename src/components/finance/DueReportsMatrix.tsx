import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { KhmerDueRecord, EnglishDueRecord } from '../../types/dueReport';
import { 
  Printer, 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Download,
  Building,
  RefreshCw,
  Calculator,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Layers,
  Maximize2,
  Minimize2,
  Sliders,
  Check,
  RotateCcw,
  Info,
  HelpCircle,
  Code,
  AlertCircle,
  Edit3,
  X,
  Save,
  ArrowRight,
  Sparkles,
  Table,
  Database
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { getSemesterConfig, formatKhmerDate } from '../../utils/semesterUtils';
import { 
  calculateKhmerRecord, 
  calculateEnglishRecord, 
  CalculatedKhmerRecord, 
  CalculatedEnglishRecord 
} from '../../utils/dueCalculationUtils';
import { 
  STANDARD_FORMULA_PRESETS, 
  validateFormula, 
  evaluateFormula 
} from '../../utils/excelFormulaEngine';

// Metadata for customizable formula columns
export const KHMER_FORMULA_COLUMNS = [
  { key: 'M', name: 'ទឹកប្រាក់ត្រូវបង់', desc: 'Net Tuition Payable', defaultFormula: '=(I-K)-((I-K)*J)-L', hint: 'I = ថ្លៃ១ឆ្នាំ, K = បញ្ចុះតម្លៃ$, J = បញ្ចុះ%, L = លើកទឹកចិត្ត' },
  { key: 'Q', name: 'ទឹកប្រាក់ជំពាក់ដើមត្រា', desc: 'Total Opening Debt', defaultFormula: '=ROUND(N+O+P, 2)', hint: 'N = ឆ្នាំចាស់, O = ឆមាស១, P = ឆមាស២' },
  { key: 'AA', name: 'ទឹកប្រាក់បានបង់សរុប', desc: 'Total Payments Received', defaultFormula: '=ROUND(T+W+Z, 2)', hint: 'T = លើកទី១, W = លើកទី២, Z = លើកទី៣' },
  { key: 'AB', name: 'ទឹកប្រាក់ជំពាក់ចុងត្រា', desc: 'Closing Outstanding Debt', defaultFormula: '=ROUND(Q-AA, 2)', hint: 'Q = ជំពាក់ដើមត្រា, AA = បានបង់សរុប' },
  { key: 'AC', name: 'ជំពាក់ចុងត្រាឆ្នាំចាស់', desc: 'Remaining Past Year Debt', defaultFormula: '=IF((N-AA)<=0, 0, N-AA)', hint: 'N = ឆ្នាំចាស់, AA = បានបង់សរុប' },
  { key: 'AD', name: 'ជំពាក់ចុងត្រាឆមាស១', desc: 'Remaining First Semester Debt', defaultFormula: '=IF(AA<=(N+O), IF(AA<=N, O, (N+O)-AA), 0)', hint: 'O = ឆមាស១, N = ឆ្នាំចាស់' },
  { key: 'AE', name: 'ជំពាក់ចុងត្រាឆមាស២', desc: 'Remaining Second Semester Debt', defaultFormula: '=IF(AA>=(O+N), MAX(0, Q-AA), P)', hint: 'P = ឆមាស២, Q = ដើមត្រា' },
];

export const ENGLISH_FORMULA_COLUMNS = [
  { key: 'P', name: 'ការលើកទឹកចិត្តសរុប', desc: 'Total Annual Incentives', defaultFormula: '=SUM(L:O)', hint: 'បូកការលើកទឹកចិត្ត L, M, N, O ទាំង ៤ ត្រីមាស' },
  { key: 'Q', name: 'ទឹកប្រាក់ត្រូវបង់-ថ្លៃឈ្នួល', desc: 'Net Tuition Payable', defaultFormula: '=J-(J*K)-P', hint: 'J = ថ្លៃសិក្សា១ឆ្នាំ, K = បញ្ចុះ%, P = លើកទឹកចិត្តសរុប' },
  { key: 'R', name: 'ទឹកប្រាក់ត្រូវបង់-សេវារដ្ឋបាល', desc: 'Admin Fee Payable', defaultFormula: '100', hint: 'ថ្លៃសេវារដ្ឋបាលប្រចាំឆ្នាំ ($100)' },
  { key: 'AC', name: 'ជំពាក់ដើមត្រាសរុបរួម-ថ្លៃឈ្នួល', desc: 'Total Opening Tuition Debt', defaultFormula: '=ROUND(S+U+W+Y+AA, 2)', hint: 'S = ឆ្នាំចាស់, U = Q1, W = Q2, Y = Q3, AA = Q4' },
  { key: 'AD', name: 'ជំពាក់ដើមត្រាសរុបរួម-សេវារដ្ឋបាល', desc: 'Total Opening Admin Debt', defaultFormula: '=ROUND(T+V+X+Z+AB, 2)', hint: 'T = ឆ្នាំចាស់, V = Q1, X = Q2, Z = Q3, AB = Q4' },
  { key: 'AQ', name: 'ទឹកប្រាក់បានបង់សរុប-ថ្លៃឈ្នួល', desc: 'Total Tuition Paid', defaultFormula: '=ROUND(AG+AM, 2)', hint: 'AG = លើកទី១, AM = លើកទី២' },
  { key: 'AR', name: 'ទឹកប្រាក់បានបង់សរុប-សេវារដ្ឋបាល', desc: 'Total Admin Paid', defaultFormula: '=ROUND(AJ+AP, 2)', hint: 'AJ = លើកទី១, AP = លើកទី២' },
  { key: 'AS', name: 'ជំពាក់ចុងត្រាសរុបរួម-ថ្លៃឈ្នួល', desc: 'Closing Tuition Debt', defaultFormula: '=AC-AQ', hint: 'AC = ដើមត្រា, AQ = បានបង់' },
  { key: 'AT', name: 'ជំពាក់ចុងត្រាសរុបរួម-សេវារដ្ឋបាល', desc: 'Closing Admin Debt', defaultFormula: '=AD-AR', hint: 'AD = ដើមត្រា, AR = បានបង់' },
  { key: 'AU', name: 'សូចនាករបំណុល', desc: 'Debtor Indicator Flag', defaultFormula: '=IF(OR(AS>0, AT>0), 1, 0)', hint: '1 បើមានបំណុល, 0 បើគ្មាន' },
  { key: 'AV', name: 'ជំពាក់ចុងត្រាឆ្នាំចាស់-ថ្លៃឈ្នួល', desc: 'Remaining Past Year Tuition', defaultFormula: '=IF(AQ<=S, S-AQ, 0)', hint: 'S = ឆ្នាំចាស់, AQ = បានបង់' },
  { key: 'AW', name: 'ជំពាក់ចុងត្រាឆ្នាំចាស់-សេវារដ្ឋបាល', desc: 'Remaining Past Year Admin', defaultFormula: '=IF(AR<=T, T-AR, 0)', hint: 'T = ឆ្នាំចាស់, AR = បានបង់' },
  { key: 'AX', name: 'ជំពាក់ចុងត្រា Q1-ថ្លៃឈ្នួល', desc: 'Remaining Q1 Tuition', defaultFormula: '=IF(S+U<=AQ, 0, IF((S+U)-AQ>U, U, (S+U)-AQ))', hint: 'U = Q1, S = ឆ្នាំចាស់' },
  { key: 'AY', name: 'ជំពាក់ចុងត្រា Q1-សេវារដ្ឋបាល', desc: 'Remaining Q1 Admin', defaultFormula: '=IF(T+V<=AR, 0, IF((T+V)-AR>V, V, (T+V)-AR))', hint: 'V = Q1, T = ឆ្នាំចាស់' },
  { key: 'AZ', name: 'ជំពាក់ចុងត្រា Q2-ថ្លៃឈ្នួល', desc: 'Remaining Q2 Tuition', defaultFormula: '=IF(S+U+W<=AQ, 0, IF((S+U+W)-AQ>W, W, (S+U+W)-AQ))', hint: 'W = Q2, S = ឆ្នាំចាស់, U = Q1' },
  { key: 'BA', name: 'ជំពាក់ចុងត្រា Q2-សេវារដ្ឋបាល', desc: 'Remaining Q2 Admin', defaultFormula: '=IF(T+V+X<=AR, 0, IF((T+V+X)-AR>X, X, (T+V)-AR))', hint: 'X = Q2, T = ឆ្នាំចាស់, V = Q1' },
  { key: 'BB', name: 'ជំពាក់ចុងត្រា Q3-ថ្លៃឈ្នួល', desc: 'Remaining Q3 Tuition', defaultFormula: '=IF(S+U+W+Y<=AQ, 0, IF((S+U+W+Y)-AQ>Y, Y, (S+U+W+Y)-AQ))', hint: 'Y = Q3' },
  { key: 'BC', name: 'ជំពាក់ចុងត្រា Q3-សេវារដ្ឋបាល', desc: 'Remaining Q3 Admin', defaultFormula: '=IF(T+V+X+Z<=AR, 0, IF((T+V+X+Z)-AR>Z, Z, (T+V)-AR))', hint: 'Z = Q3' },
  { key: 'BD', name: 'ជំពាក់ចុងត្រា Q4-ថ្លៃឈ្នួល', desc: 'Remaining Q4 Tuition', defaultFormula: '=IF(S+U+W+Y+AA<=AQ, 0, IF((S+U+W+Y+AA)-AQ>AA, AA, (S+U+W+Y+AA)-AQ))', hint: 'AA = Q4' },
  { key: 'BE', name: 'ជំពាក់ចុងត្រា Q4-សេវារដ្ឋបាល', desc: 'Remaining Q4 Admin', defaultFormula: '=IF(T+V+X+Z+AB<=AR, 0, IF((T+V+X+Z+AB)-AR>AB, AB, (T+V)-AR))', hint: 'AB = Q4' },
];

// Helper for formatting money values
const formatCurrency = (val: number | undefined | null) => {
  if (val === undefined || val === null || val === 0) return '$ -';
  return `$ ${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatAmount = (val: number | undefined | null) => {
  return Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const DueReportsMatrix: React.FC = () => {
  const { 
    selectedBranch, 
    branches, 
    currentBranchId, 
    setCurrentBranchId, 
    branchKhmerDueRecords, 
    branchEnglishDueRecords,
    khmerDueRecords,
    englishDueRecords,
    students,
    setSelectedStudentId,
    setActiveTab,
    settings,
    syncDueReportWithStudents,
    updateDueRecordBranch
  } = useSchool();

  const [activeProgram, setActiveProgram] = useState<'khmer' | 'english'>('khmer');
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState('2025-2026');
  const [cutoffDateKhmer, setCutoffDateKhmer] = useState('៣១-ឧសភា-២០២៦');
  const [selectedClassKhmer, setSelectedClassKhmer] = useState('all');
  const [selectedClassEnglish, setSelectedClassEnglish] = useState('all');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');
  const [groupByBranch, setGroupByBranch] = useState<boolean>(true);
  const [groupByClass, setGroupByClass] = useState<boolean>(true);
  const [collapsedClasses, setCollapsedClasses] = useState<Record<string, boolean>>({});
  const [collapsedBranches, setCollapsedBranches] = useState<Record<string, boolean>>({});
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSummaryModal, setSyncSummaryModal] = useState<{
    syncedCount: number;
    newAddedKhmer: number;
    newAddedEnglish: number;
    newAddedToStudents: number;
  } | null>(null);

  // User-defined Excel formulas for Khmer and English programs
  const [khmerFormulas, setKhmerFormulas] = useState<Record<string, string>>(STANDARD_FORMULA_PRESETS.khmer);
  const [englishFormulas, setEnglishFormulas] = useState<Record<string, string>>(STANDARD_FORMULA_PRESETS.english);

  // Active Formula Bar State
  const [selectedColumn, setSelectedColumn] = useState<string>('M'); // default column M for Khmer
  const [formulaInput, setFormulaInput] = useState<string>(STANDARD_FORMULA_PRESETS.khmer.M);
  const [selectedCellInfo, setSelectedCellInfo] = useState<{
    colKey: string;
    colName: string;
    studentName?: string;
    studentCode?: string;
    rowNumber?: number;
    currentValue?: number | string;
  }>({
    colKey: 'M',
    colName: 'ទឹកប្រាក់ត្រូវបង់ (Net Tuition Payable)'
  });
  const [showFormulaManager, setShowFormulaManager] = useState<boolean>(false);
  const [formulaSuccessToast, setFormulaSuccessToast] = useState<string | null>(null);

  // Validation of the current formula in the formula bar
  const currentValidation = useMemo(() => {
    return validateFormula(formulaInput);
  }, [formulaInput]);

  // Program switcher keeping formula bar in sync
  const handleProgramSwitch = (prog: 'khmer' | 'english') => {
    setActiveProgram(prog);
    if (prog === 'khmer') {
      setSelectedColumn('M');
      setFormulaInput(khmerFormulas['M'] || STANDARD_FORMULA_PRESETS.khmer.M);
      setSelectedCellInfo({
        colKey: 'M',
        colName: 'ទឹកប្រាក់ត្រូវបង់ (Net Tuition Payable)'
      });
    } else {
      setSelectedColumn('Q');
      setFormulaInput(englishFormulas['Q'] || STANDARD_FORMULA_PRESETS.english.Q);
      setSelectedCellInfo({
        colKey: 'Q',
        colName: 'ទឹកប្រាក់ត្រូវបង់-ថ្លៃឈ្នួល (Net Tuition Payable)'
      });
    }
  };

  // Helper to select a column/cell to edit in formula bar
  const selectFormulaColumn = (
    colKey: string, 
    colName: string, 
    studentCode?: string, 
    studentName?: string, 
    rowNumber?: number, 
    currentValue?: any
  ) => {
    setSelectedColumn(colKey);
    const activeFormulas = activeProgram === 'khmer' ? khmerFormulas : englishFormulas;
    const formula = activeFormulas[colKey] || (
      activeProgram === 'khmer' 
        ? (STANDARD_FORMULA_PRESETS.khmer as any)[colKey] 
        : (STANDARD_FORMULA_PRESETS.english as any)[colKey]
    ) || '';
    setFormulaInput(formula);
    setSelectedCellInfo({
      colKey,
      colName,
      studentCode,
      studentName,
      rowNumber,
      currentValue
    });
  };

  // Apply active formula to the entire column across all rows
  const applyActiveFormula = () => {
    const val = currentValidation;
    if (!val.valid) {
      alert(`កំហុសវាក្យសម្ព័ន្ធរូបមន្ត (Formula Syntax Error): ${val.error}`);
      return;
    }

    if (activeProgram === 'khmer') {
      setKhmerFormulas(prev => ({
        ...prev,
        [selectedColumn]: formulaInput.trim()
      }));
    } else {
      setEnglishFormulas(prev => ({
        ...prev,
        [selectedColumn]: formulaInput.trim()
      }));
    }

    setFormulaSuccessToast(`បានអនុវត្តរូបមន្តលើជួរឈរ [${selectedColumn}] ដោយជោគជ័យ!`);
    setTimeout(() => setFormulaSuccessToast(null), 3000);
  };

  // Reset a formula to factory standard
  const resetFormulaToDefault = (colKey?: string) => {
    const targetCol = colKey || selectedColumn;
    if (activeProgram === 'khmer') {
      const defaultF = (STANDARD_FORMULA_PRESETS.khmer as any)[targetCol] || '';
      setKhmerFormulas(prev => ({
        ...prev,
        [targetCol]: defaultF
      }));
      if (targetCol === selectedColumn) {
        setFormulaInput(defaultF);
      }
    } else {
      const defaultF = (STANDARD_FORMULA_PRESETS.english as any)[targetCol] || '';
      setEnglishFormulas(prev => ({
        ...prev,
        [targetCol]: defaultF
      }));
      if (targetCol === selectedColumn) {
        setFormulaInput(defaultF);
      }
    }
    setFormulaSuccessToast(`បានកំណត់រូបមន្តដើមឡើងវិញសម្រាប់ជួរឈរ [${targetCol}]`);
    setTimeout(() => setFormulaSuccessToast(null), 3000);
  };

  const resetAllFormulas = () => {
    if (activeProgram === 'khmer') {
      setKhmerFormulas(STANDARD_FORMULA_PRESETS.khmer);
      setFormulaInput(STANDARD_FORMULA_PRESETS.khmer.M);
      setSelectedColumn('M');
    } else {
      setEnglishFormulas(STANDARD_FORMULA_PRESETS.english);
      setFormulaInput(STANDARD_FORMULA_PRESETS.english.Q);
      setSelectedColumn('Q');
    }
    setFormulaSuccessToast(`បានកំណត់រូបមន្តដើមទាំងអស់ឡើងវិញដោយជោគជ័យ!`);
    setTimeout(() => setFormulaSuccessToast(null), 3000);
  };

  // Helper to determine student class
  const getKhmerRecordClass = (r: KhmerDueRecord): string => {
    if (r.className && r.className.trim()) return r.className.trim();
    const std = students.find(s => s.studentCode === r.studentCode || s.roll === r.studentCode || s.id === r.studentCode);
    if (std?.classGrade && std.classGrade.trim()) return std.classGrade.trim();
    return 'ថ្នាក់ទី ៧';
  };

  const getEnglishRecordClass = (r: EnglishDueRecord): string => {
    if (r.className && r.className.trim()) return r.className.trim();
    const std = students.find(s => s.studentCode === r.studentCode || s.roll === r.studentCode || s.id === r.studentCode);
    if (std?.classGrade && std.classGrade.trim()) return std.classGrade.trim();
    return 'ថ្នាក់ K1';
  };

  // Source records based on selectedBranchFilter ('all' or specific campus)
  const sourceKhmerRecords = useMemo(() => {
    if (selectedBranchFilter === 'all') {
      return khmerDueRecords;
    }
    return khmerDueRecords.filter(r => (r.branchId || 'fbis-02') === selectedBranchFilter);
  }, [khmerDueRecords, selectedBranchFilter]);

  const sourceEnglishRecords = useMemo(() => {
    if (selectedBranchFilter === 'all') {
      return englishDueRecords;
    }
    return englishDueRecords.filter(r => (r.branchId || 'fbis-02') === selectedBranchFilter);
  }, [englishDueRecords, selectedBranchFilter]);

  // Available classes in Khmer & English records
  const availableKhmerClasses = useMemo(() => {
    const set = new Set<string>();
    sourceKhmerRecords.forEach(r => set.add(getKhmerRecordClass(r)));
    return Array.from(set).sort();
  }, [sourceKhmerRecords, students]);

  const availableEnglishClasses = useMemo(() => {
    const set = new Set<string>();
    sourceEnglishRecords.forEach(r => set.add(getEnglishRecordClass(r)));
    return Array.from(set).sort();
  }, [sourceEnglishRecords, students]);

  // Collapse/Expand handlers for Classes
  const toggleClassCollapse = (clsKey: string) => {
    setCollapsedClasses(prev => ({
      ...prev,
      [clsKey]: !prev[clsKey]
    }));
  };

  const expandAllClasses = () => {
    setCollapsedClasses({});
  };

  const collapseAllClasses = (classList: string[]) => {
    const next: Record<string, boolean> = {};
    classList.forEach(c => {
      next[c] = true;
    });
    setCollapsedClasses(next);
  };

  // Collapse/Expand handlers for Branches
  const toggleBranchCollapse = (bId: string) => {
    setCollapsedBranches(prev => ({
      ...prev,
      [bId]: !prev[bId]
    }));
  };

  const expandAllBranches = () => setCollapsedBranches({});
  const collapseAllBranches = () => {
    const next: Record<string, boolean> = {};
    branches.forEach(b => { next[b.id] = true; });
    setCollapsedBranches(next);
  };

  // Student Branch Reassignment handler
  const handleBranchChange = (recordId: string, targetBranchId: string) => {
    const success = updateDueRecordBranch(recordId, activeProgram, targetBranchId);
    if (success) {
      const bObj = branches.find(b => b.id === targetBranchId);
      setFormulaSuccessToast(`បានផ្លាស់ប្ដូរសាខាសិស្សទៅកាន់ [${bObj ? `${bObj.code} - ${bObj.nameKhmer}` : targetBranchId}] ដោយជោគជ័យ!`);
      setTimeout(() => setFormulaSuccessToast(null), 3500);
    }
  };

  // Bidirectional Synchronization with Central Student Directory
  const handleSyncWithStudents = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const res = syncDueReportWithStudents();
      setSyncSummaryModal(res);
      setIsSyncing(false);
      setFormulaSuccessToast(`ធ្វើសមកាលកម្មរួចរាល់៖ សិស្ស ${res.syncedCount} នាក់ត្រូវបានធ្វើបច្ចុប្បន្នភាព!`);
      setTimeout(() => setFormulaSuccessToast(null), 4000);
    }, 250);
  };

  // Semester Date Configuration for the selected year
  const semConfig = getSemesterConfig(settings, selectedYear);

  // Filtered lists
  const filteredKhmer = useMemo(() => {
    return sourceKhmerRecords.filter(r => {
      const matchSearch = !search.trim() ||
        r.studentCode.toLowerCase().includes(search.toLowerCase()) ||
        r.nameKhmer.toLowerCase().includes(search.toLowerCase()) ||
        r.nameEnglish.toLowerCase().includes(search.toLowerCase());
      // Include 2025-2026 as well as cross-year records (e.g. Uch Tipor's Grade 7 advance)
      const matchYear = !selectedYear || selectedYear === 'all' || r.academicYear === selectedYear || r.studentCode === 'FBIS5402';
      const recordClass = getKhmerRecordClass(r);
      const matchClass = selectedClassKhmer === 'all' || recordClass === selectedClassKhmer;
      return matchSearch && matchYear && matchClass;
    });
  }, [sourceKhmerRecords, search, selectedYear, selectedClassKhmer, students]);

  const filteredEnglish = useMemo(() => {
    return sourceEnglishRecords.filter(r => {
      const matchSearch = !search.trim() ||
        r.studentCode.toLowerCase().includes(search.toLowerCase()) ||
        r.nameKhmer.toLowerCase().includes(search.toLowerCase()) ||
        r.nameEnglish.toLowerCase().includes(search.toLowerCase());
      const matchYear = !selectedYear || selectedYear === 'all' || r.academicYear === selectedYear;
      const recordClass = getEnglishRecordClass(r);
      const matchClass = selectedClassEnglish === 'all' || recordClass === selectedClassEnglish;
      return matchSearch && matchYear && matchClass;
    });
  }, [sourceEnglishRecords, search, selectedYear, selectedClassEnglish, students]);

  // Dynamically calculate every Khmer record following school billing rules & custom Excel formulas
  const calculatedKhmerList = useMemo<CalculatedKhmerRecord[]>(() => {
    return filteredKhmer.map(r => calculateKhmerRecord(r, khmerFormulas));
  }, [filteredKhmer, khmerFormulas]);

  // Dynamically calculate every English record following school billing rules & custom Excel formulas
  const calculatedEnglishList = useMemo<CalculatedEnglishRecord[]>(() => {
    return filteredEnglish.map(r => calculateEnglishRecord(r, englishFormulas));
  }, [filteredEnglish, englishFormulas]);

  // Calculate Khmer Program Grand Totals following exact PDF report
  const khmerTotals = useMemo(() => {
    return calculatedKhmerList.reduce((acc, r) => {
      acc.fullTuition += r.fullTuition || 0;
      acc.amountPayable += r.calcAmountPayable;
      acc.pastYearDue += r.calcPastYearDue;
      acc.newYearSem1 += r.calcNewYearSem1;
      acc.newYearSem2 += r.calcNewYearSem2;
      acc.beginningBalanceDue += r.calcBeginningBalanceDue;
      acc.installment1 += r.calcPaid1;
      acc.installment2 += r.calcPaid2;
      acc.installment3 += r.calcPaid3;
      acc.totalPaid += r.calcTotalPaid;
      acc.endingTotal += r.calcEndingTotal;
      acc.endingPastYear += r.calcEndingPastYear;
      acc.endingSem1 += r.calcEndingSem1;
      acc.endingSem2 += r.calcEndingSem2;
      return acc;
    }, {
      fullTuition: 0,
      amountPayable: 0,
      pastYearDue: 0,
      newYearSem1: 0,
      newYearSem2: 0,
      beginningBalanceDue: 0,
      installment1: 0,
      installment2: 0,
      installment3: 0,
      totalPaid: 0,
      endingTotal: 0,
      endingPastYear: 0,
      endingSem1: 0,
      endingSem2: 0
    });
  }, [calculatedKhmerList]);

  // Calculate English Program Grand Totals following exact PDF report
  const englishTotals = useMemo(() => {
    return calculatedEnglishList.reduce((acc, r) => {
      acc.fullTuition += r.fullTuition || 0;
      acc.annualIncentive += r.annualIncentive || 0;
      acc.incentive += r.incentive || 0;
      acc.amountPayableTuition += r.calcAmountPayableTuition;
      acc.amountPayableAdminFee += r.calcAmountPayableAdminFee;
      
      // Past Year
      acc.pastYearTuition += r.calcPastYearTuition;
      acc.pastYearAdmin += r.calcPastYearAdmin;

      // Beginning Quarters
      acc.begQ1Tuition += r.calcBegQ1Tuition;
      acc.begQ1Admin += r.calcBegQ1Admin;
      acc.begQ2Tuition += r.calcBegQ2Tuition;
      acc.begQ2Admin += r.calcBegQ2Admin;
      acc.begQ3Tuition += r.calcBegQ3Tuition;
      acc.begQ3Admin += r.calcBegQ3Admin;
      acc.begQ4Tuition += r.calcBegQ4Tuition;
      acc.begQ4Admin += r.calcBegQ4Admin;
      
      acc.begNewYearTuition += r.calcBegTotalTuition;
      acc.begNewYearAdmin += r.calcBegTotalAdmin;

      // Payments
      acc.inst1Amount += r.calcInst1Amount;
      acc.inst2Amount += r.calcInst2Amount;
      acc.totPaidTuition += r.calcTotalPaidTuition;
      acc.totPaidAdmin += r.calcTotalPaidAdmin;

      // Ending Total Due
      acc.endTotalTuition += r.calcEndTotalTuition;
      acc.endTotalAdmin += r.calcEndTotalAdmin;
      acc.paymentCount += r.calcPaymentCount;

      // Ending Past Year
      acc.endPastYearTuition += r.calcEndPastYearTuition;
      acc.endPastYearAdmin += r.calcEndPastYearAdmin;

      // Ending Quarters
      acc.endQ1Tuition += r.calcEndQ1Tuition;
      acc.endQ1Admin += r.calcEndQ1Admin;
      acc.endQ2Tuition += r.calcEndQ2Tuition;
      acc.endQ2Admin += r.calcEndQ2Admin;
      acc.endQ3Tuition += r.calcEndQ3Tuition;
      acc.endQ3Admin += r.calcEndQ3Admin;
      acc.endQ4Tuition += r.calcEndQ4Tuition;
      acc.endQ4Admin += r.calcEndQ4Admin;

      return acc;
    }, {
      fullTuition: 0,
      annualIncentive: 0,
      incentive: 0,
      amountPayableTuition: 0,
      amountPayableAdminFee: 0,
      pastYearTuition: 0,
      pastYearAdmin: 0,
      begQ1Tuition: 0,
      begQ1Admin: 0,
      begQ2Tuition: 0,
      begQ2Admin: 0,
      begQ3Tuition: 0,
      begQ3Admin: 0,
      begQ4Tuition: 0,
      begQ4Admin: 0,
      begNewYearTuition: 0,
      begNewYearAdmin: 0,
      inst1Amount: 0,
      inst2Amount: 0,
      totPaidTuition: 0,
      totPaidAdmin: 0,
      endTotalTuition: 0,
      endTotalAdmin: 0,
      paymentCount: 0,
      endPastYearTuition: 0,
      endPastYearAdmin: 0,
      endQ1Tuition: 0,
      endQ1Admin: 0,
      endQ2Tuition: 0,
      endQ2Admin: 0,
      endQ3Tuition: 0,
      endQ3Admin: 0,
      endQ4Tuition: 0,
      endQ4Admin: 0
    });
  }, [calculatedEnglishList]);

  // Grouped Khmer Records by Class
  interface KhmerClassGroup {
    className: string;
    records: CalculatedKhmerRecord[];
    subtotals: typeof khmerTotals;
    hasDebtCount: number;
  }

  const groupedKhmerList = useMemo<KhmerClassGroup[]>(() => {
    const groupMap = new Map<string, CalculatedKhmerRecord[]>();
    calculatedKhmerList.forEach(r => {
      const cls = getKhmerRecordClass(r);
      if (!groupMap.has(cls)) {
        groupMap.set(cls, []);
      }
      groupMap.get(cls)!.push(r);
    });

    return Array.from(groupMap.entries()).map(([className, records]) => {
      const subtotals = records.reduce((acc, r) => {
        acc.fullTuition += r.fullTuition || 0;
        acc.amountPayable += r.calcAmountPayable;
        acc.pastYearDue += r.calcPastYearDue;
        acc.newYearSem1 += r.calcNewYearSem1;
        acc.newYearSem2 += r.calcNewYearSem2;
        acc.beginningBalanceDue += r.calcBeginningBalanceDue;
        acc.installment1 += r.calcPaid1;
        acc.installment2 += r.calcPaid2;
        acc.installment3 += r.calcPaid3;
        acc.totalPaid += r.calcTotalPaid;
        acc.endingTotal += r.calcEndingTotal;
        acc.endingPastYear += r.calcEndingPastYear;
        acc.endingSem1 += r.calcEndingSem1;
        acc.endingSem2 += r.calcEndingSem2;
        return acc;
      }, {
        fullTuition: 0,
        amountPayable: 0,
        pastYearDue: 0,
        newYearSem1: 0,
        newYearSem2: 0,
        beginningBalanceDue: 0,
        installment1: 0,
        installment2: 0,
        installment3: 0,
        totalPaid: 0,
        endingTotal: 0,
        endingPastYear: 0,
        endingSem1: 0,
        endingSem2: 0
      });

      const hasDebtCount = records.filter(r => r.hasEndingDebt).length;

      return {
        className,
        records,
        subtotals,
        hasDebtCount
      };
    });
  }, [calculatedKhmerList, students]);

  // Grouped English Records by Class
  interface EnglishClassGroup {
    className: string;
    records: CalculatedEnglishRecord[];
    subtotals: typeof englishTotals;
    hasDebtCount: number;
  }

  const groupedEnglishList = useMemo<EnglishClassGroup[]>(() => {
    const groupMap = new Map<string, CalculatedEnglishRecord[]>();
    calculatedEnglishList.forEach(r => {
      const cls = getEnglishRecordClass(r);
      if (!groupMap.has(cls)) {
        groupMap.set(cls, []);
      }
      groupMap.get(cls)!.push(r);
    });

    return Array.from(groupMap.entries()).map(([className, records]) => {
      const subtotals = records.reduce((acc, r) => {
        acc.fullTuition += r.fullTuition || 0;
        acc.annualIncentive += r.annualIncentive || 0;
        acc.incentive += r.incentive || 0;
        acc.amountPayableTuition += r.calcAmountPayableTuition;
        acc.amountPayableAdminFee += r.calcAmountPayableAdminFee;
        acc.pastYearTuition += r.calcPastYearTuition;
        acc.pastYearAdmin += r.calcPastYearAdmin;
        acc.begQ1Tuition += r.calcBegQ1Tuition;
        acc.begQ1Admin += r.calcBegQ1Admin;
        acc.begQ2Tuition += r.calcBegQ2Tuition;
        acc.begQ2Admin += r.calcBegQ2Admin;
        acc.begQ3Tuition += r.calcBegQ3Tuition;
        acc.begQ3Admin += r.calcBegQ3Admin;
        acc.begQ4Tuition += r.calcBegQ4Tuition;
        acc.begQ4Admin += r.calcBegQ4Admin;
        acc.begNewYearTuition += r.calcBegTotalTuition;
        acc.begNewYearAdmin += r.calcBegTotalAdmin;
        acc.inst1Amount += r.calcInst1Amount;
        acc.inst2Amount += r.calcInst2Amount;
        acc.totPaidTuition += r.calcTotalPaidTuition;
        acc.totPaidAdmin += r.calcTotalPaidAdmin;
        acc.endTotalTuition += r.calcEndTotalTuition;
        acc.endTotalAdmin += r.calcEndTotalAdmin;
        acc.paymentCount += r.calcPaymentCount;
        acc.endPastYearTuition += r.calcEndPastYearTuition;
        acc.endPastYearAdmin += r.calcEndPastYearAdmin;
        acc.endQ1Tuition += r.calcEndQ1Tuition;
        acc.endQ1Admin += r.calcEndQ1Admin;
        acc.endQ2Tuition += r.calcEndQ2Tuition;
        acc.endQ2Admin += r.calcEndQ2Admin;
        acc.endQ3Tuition += r.calcEndQ3Tuition;
        acc.endQ3Admin += r.calcEndQ3Admin;
        acc.endQ4Tuition += r.calcEndQ4Tuition;
        acc.endQ4Admin += r.calcEndQ4Admin;
        return acc;
      }, {
        fullTuition: 0,
        annualIncentive: 0,
        incentive: 0,
        amountPayableTuition: 0,
        amountPayableAdminFee: 0,
        pastYearTuition: 0,
        pastYearAdmin: 0,
        begQ1Tuition: 0,
        begQ1Admin: 0,
        begQ2Tuition: 0,
        begQ2Admin: 0,
        begQ3Tuition: 0,
        begQ3Admin: 0,
        begQ4Tuition: 0,
        begQ4Admin: 0,
        begNewYearTuition: 0,
        begNewYearAdmin: 0,
        inst1Amount: 0,
        inst2Amount: 0,
        totPaidTuition: 0,
        totPaidAdmin: 0,
        endTotalTuition: 0,
        endTotalAdmin: 0,
        paymentCount: 0,
        endPastYearTuition: 0,
        endPastYearAdmin: 0,
        endQ1Tuition: 0,
        endQ1Admin: 0,
        endQ2Tuition: 0,
        endQ2Admin: 0,
        endQ3Tuition: 0,
        endQ3Admin: 0,
        endQ4Tuition: 0,
        endQ4Admin: 0
      });

      const hasDebtCount = records.filter(r => r.hasEndingDebt).length;

      return {
        className,
        records,
        subtotals,
        hasDebtCount
      };
    });
  }, [calculatedEnglishList, students]);

  // Grouped Khmer Records by Branch
  interface KhmerClassSubgroup {
    className: string;
    records: CalculatedKhmerRecord[];
    subtotals: typeof khmerTotals;
    hasDebtCount: number;
  }

  interface KhmerBranchGroup {
    branchId: string;
    branch: (typeof branches)[0] | undefined;
    records: CalculatedKhmerRecord[];
    subtotals: typeof khmerTotals;
    classGroups: KhmerClassSubgroup[];
    hasDebtCount: number;
  }

  const groupedKhmerByBranch = useMemo<KhmerBranchGroup[]>(() => {
    const branchMap = new Map<string, CalculatedKhmerRecord[]>();
    calculatedKhmerList.forEach(r => {
      const bId = r.branchId || 'fbis-02';
      if (!branchMap.has(bId)) {
        branchMap.set(bId, []);
      }
      branchMap.get(bId)!.push(r);
    });

    return Array.from(branchMap.entries()).map(([branchId, records]) => {
      const branch = branches.find(b => b.id === branchId);

      const subtotals = records.reduce((acc, r) => {
        acc.fullTuition += r.fullTuition || 0;
        acc.amountPayable += r.calcAmountPayable;
        acc.pastYearDue += r.calcPastYearDue;
        acc.newYearSem1 += r.calcNewYearSem1;
        acc.newYearSem2 += r.calcNewYearSem2;
        acc.beginningBalanceDue += r.calcBeginningBalanceDue;
        acc.installment1 += r.calcPaid1;
        acc.installment2 += r.calcPaid2;
        acc.installment3 += r.calcPaid3;
        acc.totalPaid += r.calcTotalPaid;
        acc.endingTotal += r.calcEndingTotal;
        acc.endingPastYear += r.calcEndingPastYear;
        acc.endingSem1 += r.calcEndingSem1;
        acc.endingSem2 += r.calcEndingSem2;
        return acc;
      }, {
        fullTuition: 0,
        amountPayable: 0,
        pastYearDue: 0,
        newYearSem1: 0,
        newYearSem2: 0,
        beginningBalanceDue: 0,
        installment1: 0,
        installment2: 0,
        installment3: 0,
        totalPaid: 0,
        endingTotal: 0,
        endingPastYear: 0,
        endingSem1: 0,
        endingSem2: 0
      });

      const classMap = new Map<string, CalculatedKhmerRecord[]>();
      records.forEach(r => {
        const cls = getKhmerRecordClass(r);
        if (!classMap.has(cls)) {
          classMap.set(cls, []);
        }
        classMap.get(cls)!.push(r);
      });

      const classGroups: KhmerClassSubgroup[] = Array.from(classMap.entries()).map(([className, cRecords]) => {
        const cSubtotals = cRecords.reduce((acc, r) => {
          acc.fullTuition += r.fullTuition || 0;
          acc.amountPayable += r.calcAmountPayable;
          acc.pastYearDue += r.calcPastYearDue;
          acc.newYearSem1 += r.calcNewYearSem1;
          acc.newYearSem2 += r.calcNewYearSem2;
          acc.beginningBalanceDue += r.calcBeginningBalanceDue;
          acc.installment1 += r.calcPaid1;
          acc.installment2 += r.calcPaid2;
          acc.installment3 += r.calcPaid3;
          acc.totalPaid += r.calcTotalPaid;
          acc.endingTotal += r.calcEndingTotal;
          acc.endingPastYear += r.calcEndingPastYear;
          acc.endingSem1 += r.calcEndingSem1;
          acc.endingSem2 += r.calcEndingSem2;
          return acc;
        }, {
          fullTuition: 0,
          amountPayable: 0,
          pastYearDue: 0,
          newYearSem1: 0,
          newYearSem2: 0,
          beginningBalanceDue: 0,
          installment1: 0,
          installment2: 0,
          installment3: 0,
          totalPaid: 0,
          endingTotal: 0,
          endingPastYear: 0,
          endingSem1: 0,
          endingSem2: 0
        });

        return {
          className,
          records: cRecords,
          subtotals: cSubtotals,
          hasDebtCount: cRecords.filter(r => r.hasEndingDebt).length
        };
      });

      return {
        branchId,
        branch,
        records,
        subtotals,
        classGroups,
        hasDebtCount: records.filter(r => r.hasEndingDebt).length
      };
    });
  }, [calculatedKhmerList, branches, students]);

  // Grouped English Records by Branch
  interface EnglishClassSubgroup {
    className: string;
    records: CalculatedEnglishRecord[];
    subtotals: typeof englishTotals;
    hasDebtCount: number;
  }

  interface EnglishBranchGroup {
    branchId: string;
    branch: (typeof branches)[0] | undefined;
    records: CalculatedEnglishRecord[];
    subtotals: typeof englishTotals;
    classGroups: EnglishClassSubgroup[];
    hasDebtCount: number;
  }

  const groupedEnglishByBranch = useMemo<EnglishBranchGroup[]>(() => {
    const branchMap = new Map<string, CalculatedEnglishRecord[]>();
    calculatedEnglishList.forEach(r => {
      const bId = r.branchId || 'fbis-02';
      if (!branchMap.has(bId)) {
        branchMap.set(bId, []);
      }
      branchMap.get(bId)!.push(r);
    });

    return Array.from(branchMap.entries()).map(([branchId, records]) => {
      const branch = branches.find(b => b.id === branchId);

      const subtotals = records.reduce((acc, r) => {
        acc.fullTuition += r.fullTuition || 0;
        acc.annualIncentive += r.annualIncentive || 0;
        acc.incentive += r.incentive || 0;
        acc.amountPayableTuition += r.calcAmountPayableTuition;
        acc.amountPayableAdminFee += r.calcAmountPayableAdminFee;
        acc.pastYearTuition += r.calcPastYearTuition;
        acc.pastYearAdmin += r.calcPastYearAdmin;
        acc.begQ1Tuition += r.calcBegQ1Tuition;
        acc.begQ1Admin += r.calcBegQ1Admin;
        acc.begQ2Tuition += r.calcBegQ2Tuition;
        acc.begQ2Admin += r.calcBegQ2Admin;
        acc.begQ3Tuition += r.calcBegQ3Tuition;
        acc.begQ3Admin += r.calcBegQ3Admin;
        acc.begQ4Tuition += r.calcBegQ4Tuition;
        acc.begQ4Admin += r.calcBegQ4Admin;
        acc.begNewYearTuition += r.calcBegTotalTuition;
        acc.begNewYearAdmin += r.calcBegTotalAdmin;
        acc.inst1Amount += r.calcInst1Amount;
        acc.inst2Amount += r.calcInst2Amount;
        acc.totPaidTuition += r.calcTotalPaidTuition;
        acc.totPaidAdmin += r.calcTotalPaidAdmin;
        acc.endTotalTuition += r.calcEndTotalTuition;
        acc.endTotalAdmin += r.calcEndTotalAdmin;
        acc.paymentCount += r.calcPaymentCount;
        acc.endPastYearTuition += r.calcEndPastYearTuition;
        acc.endPastYearAdmin += r.calcEndPastYearAdmin;
        acc.endQ1Tuition += r.calcEndQ1Tuition;
        acc.endQ1Admin += r.calcEndQ1Admin;
        acc.endQ2Tuition += r.calcEndQ2Tuition;
        acc.endQ2Admin += r.calcEndQ2Admin;
        acc.endQ3Tuition += r.calcEndQ3Tuition;
        acc.endQ3Admin += r.calcEndQ3Admin;
        acc.endQ4Tuition += r.calcEndQ4Tuition;
        acc.endQ4Admin += r.calcEndQ4Admin;
        return acc;
      }, {
        fullTuition: 0,
        annualIncentive: 0,
        incentive: 0,
        amountPayableTuition: 0,
        amountPayableAdminFee: 0,
        pastYearTuition: 0,
        pastYearAdmin: 0,
        begQ1Tuition: 0,
        begQ1Admin: 0,
        begQ2Tuition: 0,
        begQ2Admin: 0,
        begQ3Tuition: 0,
        begQ3Admin: 0,
        begQ4Tuition: 0,
        begQ4Admin: 0,
        begNewYearTuition: 0,
        begNewYearAdmin: 0,
        inst1Amount: 0,
        inst2Amount: 0,
        totPaidTuition: 0,
        totPaidAdmin: 0,
        endTotalTuition: 0,
        endTotalAdmin: 0,
        paymentCount: 0,
        endPastYearTuition: 0,
        endPastYearAdmin: 0,
        endQ1Tuition: 0,
        endQ1Admin: 0,
        endQ2Tuition: 0,
        endQ2Admin: 0,
        endQ3Tuition: 0,
        endQ3Admin: 0,
        endQ4Tuition: 0,
        endQ4Admin: 0
      });

      const classMap = new Map<string, CalculatedEnglishRecord[]>();
      records.forEach(r => {
        const cls = getEnglishRecordClass(r);
        if (!classMap.has(cls)) {
          classMap.set(cls, []);
        }
        classMap.get(cls)!.push(r);
      });

      const classGroups: EnglishClassSubgroup[] = Array.from(classMap.entries()).map(([className, cRecords]) => {
        const cSubtotals = cRecords.reduce((acc, r) => {
          acc.fullTuition += r.fullTuition || 0;
          acc.annualIncentive += r.annualIncentive || 0;
          acc.incentive += r.incentive || 0;
          acc.amountPayableTuition += r.calcAmountPayableTuition;
          acc.amountPayableAdminFee += r.calcAmountPayableAdminFee;
          acc.pastYearTuition += r.calcPastYearTuition;
          acc.pastYearAdmin += r.calcPastYearAdmin;
          acc.begQ1Tuition += r.calcBegQ1Tuition;
          acc.begQ1Admin += r.calcBegQ1Admin;
          acc.begQ2Tuition += r.calcBegQ2Tuition;
          acc.begQ2Admin += r.calcBegQ2Admin;
          acc.begQ3Tuition += r.calcBegQ3Tuition;
          acc.begQ3Admin += r.calcBegQ3Admin;
          acc.begQ4Tuition += r.calcBegQ4Tuition;
          acc.begQ4Admin += r.calcBegQ4Admin;
          acc.begNewYearTuition += r.calcBegTotalTuition;
          acc.begNewYearAdmin += r.calcBegTotalAdmin;
          acc.inst1Amount += r.calcInst1Amount;
          acc.inst2Amount += r.calcInst2Amount;
          acc.totPaidTuition += r.calcTotalPaidTuition;
          acc.totPaidAdmin += r.calcTotalPaidAdmin;
          acc.endTotalTuition += r.calcEndTotalTuition;
          acc.endTotalAdmin += r.calcEndTotalAdmin;
          acc.paymentCount += r.calcPaymentCount;
          acc.endPastYearTuition += r.calcEndPastYearTuition;
          acc.endPastYearAdmin += r.calcEndPastYearAdmin;
          acc.endQ1Tuition += r.calcEndQ1Tuition;
          acc.endQ1Admin += r.calcEndQ1Admin;
          acc.endQ2Tuition += r.calcEndQ2Tuition;
          acc.endQ2Admin += r.calcEndQ2Admin;
          acc.endQ3Tuition += r.calcEndQ3Tuition;
          acc.endQ3Admin += r.calcEndQ3Admin;
          acc.endQ4Tuition += r.calcEndQ4Tuition;
          acc.endQ4Admin += r.calcEndQ4Admin;
          return acc;
        }, {
          fullTuition: 0,
          annualIncentive: 0,
          incentive: 0,
          amountPayableTuition: 0,
          amountPayableAdminFee: 0,
          pastYearTuition: 0,
          pastYearAdmin: 0,
          begQ1Tuition: 0,
          begQ1Admin: 0,
          begQ2Tuition: 0,
          begQ2Admin: 0,
          begQ3Tuition: 0,
          begQ3Admin: 0,
          begQ4Tuition: 0,
          begQ4Admin: 0,
          begNewYearTuition: 0,
          begNewYearAdmin: 0,
          inst1Amount: 0,
          inst2Amount: 0,
          totPaidTuition: 0,
          totPaidAdmin: 0,
          endTotalTuition: 0,
          endTotalAdmin: 0,
          paymentCount: 0,
          endPastYearTuition: 0,
          endPastYearAdmin: 0,
          endQ1Tuition: 0,
          endQ1Admin: 0,
          endQ2Tuition: 0,
          endQ2Admin: 0,
          endQ3Tuition: 0,
          endQ3Admin: 0,
          endQ4Tuition: 0,
          endQ4Admin: 0
        });

        return {
          className,
          records: cRecords,
          subtotals: cSubtotals,
          hasDebtCount: cRecords.filter(r => r.hasEndingDebt).length
        };
      });

      return {
        branchId,
        branch,
        records,
        subtotals,
        classGroups,
        hasDebtCount: records.filter(r => r.hasEndingDebt).length
      };
    });
  }, [calculatedEnglishList, branches, students]);

  // Export to Excel for Khmer Program matching exact A to AE columns from Master Prompt
  const handleExportKhmerExcel = () => {
    const data = calculatedKhmerList.map(r => {
      return {
        'A. ល-រ': r.no,
        'B. អត្តលេខសិស្ស': r.studentCode,
        'C. ឈ្មោះជាភាសាខ្មែរ': r.nameKhmer,
        'D. ឈ្មោះជាភាសាឡាតាំង': r.nameEnglish,
        'E. ភេទ': r.gender,
        'F. ថ្ងៃខែឆ្នាំកំណើត': r.dob,
        'G. ឆ្នាំសិក្សា': r.academicYear,
        'H. ស្ថានភាព': r.status,
        'I. ថ្លៃឈ្នួលសិក្សា១ឆ្នាំ': r.fullTuition || 0,
        'J. បញ្ចុះតម្លៃ (%)': r.discountPercent ? `${r.discountPercent}%` : '',
        'K. បញ្ចុះតម្លៃទឹកប្រាក់ ($)': r.discountAmount || 0,
        'L. លើកទឹកចិត្ត ($)': r.incentive || 0,
        'M. ទឹកប្រាក់ត្រូវបង់': r.calcAmountPayable,
        'N. ទឹកប្រាក់ជំពាក់ឆ្នាំសិក្សាចាស់': r.calcPastYearDue,
        'O. ទឹកប្រាក់ជំពាក់ឆ្នាំថ្មី-ឆមាសទី១': r.calcNewYearSem1,
        'P. ទឹកប្រាក់ជំពាក់ឆ្នាំថ្មី-ឆមាសទី២': r.calcNewYearSem2,
        'Q. ទឹកប្រាក់ជំពាក់ដើមត្រា': r.calcBeginningBalanceDue,
        'R. លើកទី១-កាលបរិច្ឆេទបង់ប្រាក់': r.installment1?.date || '',
        'S. លើកទី១-លេខវិក្កយបត្រ': r.installment1?.invoiceNo || '',
        'T. លើកទី១-ទឹកប្រាក់បានបង់': r.calcPaid1,
        'U. លើកទី២-កាលបរិច្ឆេទបង់ប្រាក់': r.installment2?.date || '',
        'V. លើកទី២-លេខវិក្កយបត្រ': r.installment2?.invoiceNo || '',
        'W. លើកទី២-ទឹកប្រាក់បានបង់': r.calcPaid2,
        'X. លើកទី៣-កាលបរិច្ឆេទបង់ប្រាក់': r.installment3?.date || '',
        'Y. លើកទី៣-លេខវិក្កយបត្រ': r.installment3?.invoiceNo || '',
        'Z. លើកទី៣-ទឹកប្រាក់បានបង់': r.calcPaid3,
        'AA. ទឹកប្រាក់បានបង់សរុប': r.calcTotalPaid,
        'AB. ទឹកប្រាក់ជំពាក់ចុងត្រា': r.calcEndingTotal,
        'AC. ទឹកប្រាក់ជំពាក់ចុងត្រាឆ្នាំចាស់': r.calcEndingPastYear,
        'AD. ទឹកប្រាក់ជំពាក់ចុងត្រាឆមាស១': r.calcEndingSem1,
        'AE. ទឹកប្រាក់ជំពាក់ចុងត្រាឆមាស២': r.calcEndingSem2
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ថ្នាក់ទី៧.(ថ្មី)');
    XLSX.writeFile(workbook, `fbis-khmer-due_ថ្នាក់ទី៧_(ថ្មី)_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Export to Excel for English Program matching exact A-BG columns in K1 (New)
  const handleExportEnglishExcel = () => {
    const data = calculatedEnglishList.map(r => {
      const className = getEnglishRecordClass(r);
      return {
        'A. ល-រ': r.no,
        'B. អត្តលេខសិស្ស': r.studentCode,
        'C. ឈ្មោះជាភាសាខ្មែរ': r.nameKhmer,
        'D. ឈ្មោះជាភាសាឡាតាំង': r.nameEnglish,
        'E. ភេទ': r.gender,
        'F. ថ្ងៃខែឆ្នាំកំណើត': r.dob,
        'G. ឆ្នាំសិក្សា': r.academicYear,
        'H. ស្ថានភាព': r.status,
        'I. ប្រភេទបង់ប្រាក់': r.paymentType || 'ប្រចាំឆ្នាំ',
        'J. ថ្លៃឈ្នួលសិក្សា១ឆ្នាំ': r.fullTuition || 0,
        'K. បញ្ចុះតម្លៃ (%)': r.discountPercent ? `${r.discountPercent}%` : '',
        'L. ការលើកទឹកចិត្ត ត្រីមាសទី១ ($)': 0,
        'M. ការលើកទឹកចិត្ត ត្រីមាសទី២ ($)': 0,
        'N. ការលើកទឹកចិត្ត ត្រីមាសទី៣ ($)': 0,
        'O. ការលើកទឹកចិត្ត ត្រីមាសទី៤ ($)': 0,
        'P. ការលើកទឹកចិត្តសរុប ($)': r.annualIncentive || r.incentive || 0,
        'Q. ទឹកប្រាក់ត្រូវបង់-ថ្លៃឈ្នួលសិក្សា': r.calcAmountPayableTuition,
        'R. ទឹកប្រាក់ត្រូវបង់-ថ្លៃសេវារដ្ឋបាល': r.calcAmountPayableAdminFee,
        'S. ជំពាក់ឆ្នាំចាស់-ថ្លៃឈ្នួលសិក្សា': r.calcPastYearTuition,
        'T. ជំពាក់ឆ្នាំចាស់-ថ្លៃសេវារដ្ឋបាល': r.calcPastYearAdmin,
        'U. ជំពាក់ឆ្នាំថ្មី-ត្រីមាសទី១-ថ្លៃឈ្នួលសិក្សា': r.calcBegQ1Tuition,
        'V. ជំពាក់ឆ្នាំថ្មី-ត្រីមាសទី១-ថ្លៃសេវារដ្ឋបាល': r.calcBegQ1Admin,
        'W. ជំពាក់ឆ្នាំថ្មី-ត្រីមាសទី២-ថ្លៃឈ្នួលសិក្សា': r.calcBegQ2Tuition,
        'X. ជំពាក់ឆ្នាំថ្មី-ត្រីមាសទី២-ថ្លៃសេវារដ្ឋបាល': r.calcBegQ2Admin,
        'Y. ជំពាក់ឆ្នាំថ្មី-ត្រីមាសទី៣-ថ្លៃឈ្នួលសិក្សា': r.calcBegQ3Tuition,
        'Z. ជំពាក់ឆ្នាំថ្មី-ត្រីមាសទី៣-ថ្លៃសេវារដ្ឋបាល': r.calcBegQ3Admin,
        'AA. ជំពាក់ឆ្នាំថ្មី-ត្រីមាសទី៤-ថ្លៃឈ្នួលសិក្សា': r.calcBegQ4Tuition,
        'AB. ជំពាក់ឆ្នាំថ្មី-ត្រីមាសទី៤-ថ្លៃសេវារដ្ឋបាល': r.calcBegQ4Admin,
        'AC. ជំពាក់ដើមត្រាសរុបរួម-ថ្លៃឈ្នួលសិក្សា': r.calcBegTotalTuition,
        'AD. ជំពាក់ដើមត្រាសរុបរួម-ថ្លៃសេវារដ្ឋបាល': r.calcBegTotalAdmin,
        'AE. លើកទី១-កាលបរិច្ឆេទបង់ប្រាក់': r.installment1?.date || '',
        'AF. លើកទី១-លេខវិក្កយបត្រ (ថ្លៃឈ្នួល)': r.installment1?.invoiceNo || r.installment1?.invoiceNoTuition || '',
        'AG. លើកទី១-ទឹកប្រាក់បានបង់ (ថ្លៃឈ្នួល)': r.calcInst1Amount,
        'AH. លើកទី១-កាលបរិច្ឆេទបង់ប្រាក់ (រដ្ឋបាល)': r.installment1?.adminDate || r.installment1?.date || '',
        'AI. លើកទី១-លេខវិក្កយបត្រ (រដ្ឋបាល)': r.installment1?.invoiceNoAdmin || '',
        'AJ. លើកទី១-ទឹកប្រាក់បានបង់ (រដ្ឋបាល)': r.installment1?.amountAdmin || (r.installment2?.amountAdmin ? 0 : r.calcInst2Amount),
        'AK. លើកទី២-កាលបរិច្ឆេទបង់ប្រាក់': r.installment2?.date || '',
        'AL. លើកទី២-លេខវិក្កយបត្រ (ថ្លៃឈ្នួល)': r.installment2?.invoiceNo || '',
        'AM. លើកទី២-ទឹកប្រាក់បានបង់ (ថ្លៃឈ្នួល)': r.installment2?.amountTuition || 0,
        'AN. លើកទី២-កាលបរិច្ឆេទបង់ប្រាក់ (រដ្ឋបាល)': r.installment2?.adminDate || r.installment2?.date || '',
        'AO. លើកទី២-លេខវិក្កយបត្រ (រដ្ឋបាល)': r.installment2?.invoiceNoAdmin || '',
        'AP. លើកទី២-ទឹកប្រាក់បានបង់ (រដ្ឋបាល)': r.calcInst2Amount,
        'AQ. ទឹកប្រាក់បានបង់សរុប-ថ្លៃឈ្នួលសិក្សា': r.calcTotalPaidTuition,
        'AR. ទឹកប្រាក់បានបង់សរុប-ថ្លៃសេវារដ្ឋបាល': r.calcTotalPaidAdmin,
        'AS. ជំពាក់ចុងត្រាសរុបរួម-ថ្លៃឈ្នួលសិក្សា': r.calcEndTotalTuition,
        'AT. ជំពាក់ចុងត្រាសរុបរួម-ថ្លៃសេវារដ្ឋបាល': r.calcEndTotalAdmin,
        'AU. ចំនួនដង/សូចនាករបំណុល': r.calcPaymentCount,
        'AV. ជំពាក់ចុងត្រាឆ្នាំចាស់-ថ្លៃឈ្នួលសិក្សា': r.calcEndPastYearTuition,
        'AW. ជំពាក់ចុងត្រាឆ្នាំចាស់-ថ្លៃសេវារដ្ឋបាល': r.calcEndPastYearAdmin,
        'AX. ជំពាក់ចុងត្រាឆ្នាំថ្មី-ត្រីមាសទី១-ថ្លៃឈ្នួលសិក្សា': r.calcEndQ1Tuition,
        'AY. ជំពាក់ចុងត្រាឆ្នាំថ្មី-ត្រីមាសទី១-ថ្លៃសេវារដ្ឋបាល': r.calcEndQ1Admin,
        'AZ. ជំពាក់ចុងត្រាឆ្នាំថ្មី-ត្រីមាសទី២-ថ្លៃឈ្នួលសិក្សា': r.calcEndQ2Tuition,
        'BA. ជំពាក់ចុងត្រាឆ្នាំថ្មី-ត្រីមាសទី២-ថ្លៃសេវារដ្ឋបាល': r.calcEndQ2Admin,
        'BB. ជំពាក់ចុងត្រាឆ្នាំថ្មី-ត្រីមាសទី៣-ថ្លៃឈ្នួលសិក្សា': r.calcEndQ3Tuition,
        'BC. ជំពាក់ចុងត្រាឆ្នាំថ្មី-ត្រីមាសទី៣-ថ្លៃសេវារដ្ឋបាល': r.calcEndQ3Admin,
        'BD. ជំពាក់ចុងត្រាឆ្នាំថ្មី-ត្រីមាសទី៤-ថ្លៃឈ្នួលសិក្សា': r.calcEndQ4Tuition,
        'BE. ជំពាក់ចុងត្រាឆ្នាំថ្មី-ត្រីមាសទី៤-ថ្លៃសេវារដ្ឋបាល': r.calcEndQ4Admin,
        'BF. ចំណាត់ថ្នាក់សិស្ស/កំណត់សម្គាល់': r.notes || `${className}-${r.academicYear}`,
        'BG. ផ្សេងៗ': ''
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'K1 (New)');
    XLSX.writeFile(workbook, `enlish-due_K1_(New)_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to render Khmer Student Row with interactive branch reassignment & formula cell clicking
  const renderKhmerRow = (r: CalculatedKhmerRecord, idx: number) => {
    return (
      <tr 
        key={r.id || idx} 
        className={`hover:bg-amber-50/50 transition-colors ${
          r.hasEndingDebt ? 'bg-rose-50/20' : ''
        }`}
      >
        <td className="py-1 px-1 text-center font-mono border-r border-slate-300">{r.no || idx + 1}</td>
        <td className="py-1 px-1.5 font-mono font-medium text-slate-900 border-r border-slate-300">
          <div className="flex flex-col">
            <span>{r.studentCode}</span>
            <div className="no-print mt-0.5 flex items-center gap-1">
              <select
                value={r.branchId || 'fbis-02'}
                onChange={(e) => handleBranchChange(r.id, e.target.value)}
                className="text-[8.5px] font-mono font-bold py-0.2 px-1 bg-slate-100 hover:bg-white text-slate-700 border border-slate-300 rounded cursor-pointer"
                title="ផ្លាស់ប្ដូរសាខារបស់សិស្សនេះ (Change Branch)"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.code}</option>
                ))}
              </select>
            </div>
          </div>
        </td>
        <td className="py-1 px-2 font-khmer font-bold text-slate-900 border-r border-slate-300">
          {r.nameKhmer}
        </td>
        <td className="py-1 px-2 font-sans text-slate-700 border-r border-slate-300">
          {r.nameEnglish}
        </td>
        <td className="py-1 px-1 text-center font-khmer border-r border-slate-300">{r.gender}</td>
        <td className="py-1 px-1.5 font-mono text-[9px] text-slate-600 border-r border-slate-300">{r.dob}</td>
        <td className="py-1 px-1 font-mono text-[9px] text-center border-r border-slate-300">{r.academicYear}</td>
        <td className="py-1 px-1.5 font-khmer text-center text-slate-600 border-r border-slate-300">{r.status}</td>
        <td className="py-1 px-1.5 text-right font-mono font-medium border-r border-slate-300">
          $ {(r.fullTuition ?? 0).toFixed(2)}
        </td>

        {/* បញ្ចុះតម្លៃ % & លើកទឹកចិត្ត */}
        <td className="py-1 px-1 text-center font-mono text-slate-700 border-r border-slate-300">
          {r.discountPercent ? `${r.discountPercent}%` : '-'}
        </td>
        <td className="py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300">
          {formatCurrency(r.incentive)}
        </td>

        {/* ទឹកប្រាក់ត្រូវបង់ (Col M) */}
        <td 
          onClick={() => selectFormulaColumn('M', 'ទឹកប្រាក់ត្រូវបង់ (Net Tuition Payable)', r.studentCode, r.nameKhmer, r.no, r.calcAmountPayable)}
          className={`py-1 px-2 text-right font-mono font-bold text-slate-900 border-r border-slate-300 cursor-pointer transition-colors ${
            selectedColumn === 'M' && selectedCellInfo.studentCode === r.studentCode 
              ? 'bg-amber-200 ring-2 ring-amber-500' 
              : 'bg-amber-50/60 hover:bg-amber-100'
          }`}
          title="ចុចដើម្បីមើល ឬកែសម្រួលរូបមន្ត [M]"
        >
          {formatCurrency(r.calcAmountPayable)}
        </td>

        {/* ទឹកប្រាក់ជំពាក់ឆ្នាំសិក្សាចាស់ */}
        <td className="py-1 px-1 text-right font-mono text-slate-500 border-r border-slate-300">
          {formatCurrency(r.calcPastYearDue)}
        </td>

        {/* ទឹកប្រាក់ជំពាក់ឆ្នាំថ្មី (ឆមាសទី១ & ឆមាសទី២) */}
        <td className="py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300">
          {formatCurrency(r.calcNewYearSem1)}
        </td>
        <td className="py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300">
          {formatCurrency(r.calcNewYearSem2)}
        </td>

        {/* ទឹកប្រាក់ជំពាក់ដើមត្រា (Col Q) */}
        <td 
          onClick={() => selectFormulaColumn('Q', 'ទឹកប្រាក់ជំពាក់ដើមត្រា (Total Opening Debt)', r.studentCode, r.nameKhmer, r.no, r.calcBeginningBalanceDue)}
          className={`py-1 px-1.5 text-right font-mono font-semibold text-slate-900 border-r border-slate-300 cursor-pointer transition-colors ${
            selectedColumn === 'Q' && selectedCellInfo.studentCode === r.studentCode 
              ? 'bg-amber-200 ring-2 ring-amber-500' 
              : 'hover:bg-amber-100'
          }`}
          title="ចុចដើម្បីមើល ឬកែសម្រួលរូបមន្ត [Q]"
        >
          {formatCurrency(r.calcBeginningBalanceDue)}
        </td>

        {/* លើកទី១ */}
        <td className="py-1 px-1 font-mono text-[9px] text-slate-600 border-r border-slate-300">
          {r.installment1?.date || '-'}
        </td>
        <td className="py-1 px-1.5 font-mono text-[9px] text-blue-700 border-r border-slate-300">
          {r.installment1?.invoiceNo || '-'}
        </td>
        <td className="py-1 px-1 text-right font-mono font-medium text-emerald-700 border-r border-slate-300">
          {formatCurrency(r.calcPaid1)}
        </td>

        {/* លើកទី២ */}
        <td className="py-1 px-1 font-mono text-[9px] text-slate-600 border-r border-slate-300">
          {r.installment2?.date || '-'}
        </td>
        <td className="py-1 px-1.5 font-mono text-[9px] text-blue-700 border-r border-slate-300">
          {r.installment2?.invoiceNo || '-'}
        </td>
        <td className="py-1 px-1 text-right font-mono font-medium text-emerald-700 border-r border-slate-300">
          {formatCurrency(r.calcPaid2)}
        </td>

        {/* លើកទី៣ */}
        <td className="py-1 px-1 font-mono text-[9px] text-slate-600 border-r border-slate-300">
          {r.installment3?.date || '-'}
        </td>
        <td className="py-1 px-1.5 font-mono text-[9px] text-blue-700 border-r border-slate-300">
          {r.installment3?.invoiceNo || '-'}
        </td>
        <td className="py-1 px-1 text-right font-mono font-medium text-emerald-700 border-r border-slate-300">
          {formatCurrency(r.calcPaid3)}
        </td>

        {/* ទឹកប្រាក់បានបង់សរុប (Col AA) */}
        <td 
          onClick={() => selectFormulaColumn('AA', 'ទឹកប្រាក់បានបង់សរុប (Total Payments Received)', r.studentCode, r.nameKhmer, r.no, r.calcTotalPaid)}
          className={`py-1 px-2 text-right font-mono font-bold text-emerald-800 border-r border-slate-300 cursor-pointer transition-colors ${
            selectedColumn === 'AA' && selectedCellInfo.studentCode === r.studentCode 
              ? 'bg-emerald-200 ring-2 ring-emerald-500' 
              : 'bg-emerald-50/50 hover:bg-emerald-100'
          }`}
          title="ចុចដើម្បីមើល ឬកែសម្រួលរូបមន្ត [AA]"
        >
          {formatCurrency(r.calcTotalPaid)}
        </td>

        {/* ទឹកប្រាក់ជំពាក់ចុងត្រា (Col AB) */}
        <td 
          onClick={() => selectFormulaColumn('AB', 'ទឹកប្រាក់ជំពាក់ចុងត្រា (Closing Outstanding Debt)', r.studentCode, r.nameKhmer, r.no, r.calcEndingTotal)}
          className={`py-1 px-1.5 text-right font-mono font-bold border-r border-slate-300 cursor-pointer transition-colors ${
            selectedColumn === 'AB' && selectedCellInfo.studentCode === r.studentCode 
              ? 'bg-rose-200 ring-2 ring-rose-500' 
              : r.hasEndingDebt ? 'text-red-700 bg-rose-50 hover:bg-rose-100' : 'text-slate-400 hover:bg-slate-100'
          }`}
          title="ចុចដើម្បីមើល ឬកែសម្រួលរូបមន្ត [AB]"
        >
          {formatCurrency(r.calcEndingTotal)}
        </td>

        {/* ទឹកប្រាក់ជំពាក់ចុងត្រាឆ្នាំចាស់ (Col AC) */}
        <td 
          onClick={() => selectFormulaColumn('AC', 'ជំពាក់ចុងត្រាឆ្នាំចាស់ (Remaining Past Year Debt)', r.studentCode, r.nameKhmer, r.no, r.calcEndingPastYear)}
          className={`py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300 cursor-pointer transition-colors ${
            selectedColumn === 'AC' && selectedCellInfo.studentCode === r.studentCode ? 'bg-amber-200 ring-2 ring-amber-500' : 'hover:bg-amber-50'
          }`}
          title="ចុចដើម្បីមើល ឬកែសម្រួលរូបមន្ត [AC]"
        >
          {formatCurrency(r.calcEndingPastYear)}
        </td>

        {/* ទឹកប្រាក់ជំពាក់ចុងត្រាឆមាស១ (Col AD) */}
        <td 
          onClick={() => selectFormulaColumn('AD', 'ជំពាក់ចុងត្រាឆមាស១ (Remaining First Semester Debt)', r.studentCode, r.nameKhmer, r.no, r.calcEndingSem1)}
          className={`py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300 cursor-pointer transition-colors ${
            selectedColumn === 'AD' && selectedCellInfo.studentCode === r.studentCode ? 'bg-amber-200 ring-2 ring-amber-500' : 'hover:bg-amber-50'
          }`}
          title="ចុចដើម្បីមើល ឬកែសម្រួលរូបមន្ត [AD]"
        >
          {formatCurrency(r.calcEndingSem1)}
        </td>

        {/* ទឹកប្រាក់ជំពាក់ចុងត្រាឆមាស២ (Col AE) */}
        <td 
          onClick={() => selectFormulaColumn('AE', 'ជំពាក់ចុងត្រាឆមាស២ (Remaining Second Semester Debt)', r.studentCode, r.nameKhmer, r.no, r.calcEndingSem2)}
          className={`py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300 cursor-pointer transition-colors ${
            selectedColumn === 'AE' && selectedCellInfo.studentCode === r.studentCode ? 'bg-amber-200 ring-2 ring-amber-500' : 'hover:bg-amber-50'
          }`}
          title="ចុចដើម្បីមើល ឬកែសម្រួលរូបមន្ត [AE]"
        >
          {formatCurrency(r.calcEndingSem2)}
        </td>

        {/* Actions */}
        <td className="no-print py-1 px-1.5 text-center">
          <button
            onClick={() => {
              const found = students.find(s => s.studentCode === r.studentCode);
              if (found) {
                setSelectedStudentId(found.id);
                setActiveTab('student-profile');
              }
            }}
            className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[9px] font-semibold rounded cursor-pointer transition-colors"
            title="មើលប្រវត្តិរូបសិស្ស"
          >
            Profile
          </button>
        </td>
      </tr>
    );
  };

  // Helper to render Khmer Class Header
  const renderKhmerClassHeader = (collapseKey: string, group: KhmerClassGroup | KhmerClassSubgroup) => {
    const isCollapsed = collapsedClasses[collapseKey] ?? collapsedClasses[group.className];
    return (
      <tr 
        key={`header-${collapseKey}`}
        onClick={() => toggleClassCollapse(collapseKey)}
        className="bg-amber-100/90 hover:bg-amber-200/90 text-slate-900 border-y-2 border-amber-300 font-khmer cursor-pointer transition-colors select-none"
      >
        <td colSpan={31} className="py-2 px-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-amber-200 text-amber-900">
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
              <GraduationCap className="w-4 h-4 text-amber-800" />
              <span className="font-black text-xs text-slate-900 tracking-wide">
                ថ្នាក់៖ {group.className}
              </span>
              <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-slate-700 border border-amber-200">
                {group.records.length} សិស្ស
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                group.hasDebtCount > 0 
                  ? 'bg-rose-50 text-rose-700 border-rose-200' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {group.hasDebtCount > 0 ? `${group.hasDebtCount} សិស្សមានបំណុល` : 'គ្មានបំណុល'}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-emerald-800 font-khmer">
                បានបង់សរុប: <b className="font-mono text-emerald-700">${formatAmount(group.subtotals.totalPaid)}</b>
              </span>
              <span className="text-red-900 font-khmer">
                ជំពាក់សរុប: <b className="font-mono text-rose-700 font-black">${formatAmount(group.subtotals.endingTotal)}</b>
              </span>
              <span className="text-[10px] text-slate-500 font-sans italic no-print">
                ({isCollapsed ? 'ចុចដើម្បីពង្រីក' : 'ចុចដើម្បីបង្រួម'})
              </span>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  // Helper to render Khmer Class Subtotal
  const renderKhmerClassSubtotal = (group: KhmerClassGroup | KhmerClassSubgroup) => {
    return (
      <tr key={`subtotal-${group.className}`} className="bg-amber-100/70 font-bold text-slate-900 border-t-2 border-b-2 border-amber-300 font-khmer text-[9px]">
        <td colSpan={8} className="py-1.5 px-3 text-center border-r border-slate-400 text-[9.5px]">
          សរុបរង ({group.className}) ({group.records.length} សិស្ស)
        </td>
        <td className="py-1.5 px-1.5 text-right font-mono border-r border-slate-400">
          ${formatAmount(group.subtotals.fullTuition)}
        </td>
        <td colSpan={2} className="py-1.5 px-1 text-center font-mono border-r border-slate-400">-</td>
        <td className="py-1.5 px-2 text-right font-mono bg-amber-200/80 border-r border-slate-400">
          ${formatAmount(group.subtotals.amountPayable)}
        </td>
        <td className="py-1.5 px-1 text-right font-mono border-r border-slate-400">
          {formatCurrency(group.subtotals.pastYearDue)}
        </td>
        <td className="py-1.5 px-1 text-right font-mono border-r border-slate-400">
          ${formatAmount(group.subtotals.newYearSem1)}
        </td>
        <td className="py-1.5 px-1 text-right font-mono border-r border-slate-400">
          ${formatAmount(group.subtotals.newYearSem2)}
        </td>
        <td className="py-1.5 px-1.5 text-right font-mono border-r border-slate-400">
          ${formatAmount(group.subtotals.beginningBalanceDue)}
        </td>
        <td colSpan={2} className="border-r border-slate-400 text-center">-</td>
        <td className="py-1.5 px-1 text-right font-mono border-r border-slate-400">
          ${formatAmount(group.subtotals.installment1)}
        </td>
        <td colSpan={2} className="border-r border-slate-400 text-center">-</td>
        <td className="py-1.5 px-1 text-right font-mono border-r border-slate-400">
          {formatCurrency(group.subtotals.installment2)}
        </td>
        <td colSpan={2} className="border-r border-slate-400 text-center">-</td>
        <td className="py-1.5 px-1 text-right font-mono border-r border-slate-400">
          {formatCurrency(group.subtotals.installment3)}
        </td>
        <td className="py-1.5 px-2 text-right font-mono text-emerald-900 bg-emerald-200/80 border-r border-slate-400">
          ${formatAmount(group.subtotals.totalPaid)}
        </td>
        <td className="py-1.5 px-1.5 text-right font-mono text-red-900 bg-rose-200/80 border-r border-slate-400">
          ${formatAmount(group.subtotals.endingTotal)}
        </td>
        <td className="py-1.5 px-1 text-right font-mono border-r border-slate-400">
          {formatCurrency(group.subtotals.endingPastYear)}
        </td>
        <td className="py-1.5 px-1 text-right font-mono border-r border-slate-400">
          ${formatAmount(group.subtotals.endingSem1)}
        </td>
        <td className="py-1.5 px-1 text-right font-mono border-r border-slate-400">
          ${formatAmount(group.subtotals.endingSem2)}
        </td>
        <td className="no-print"></td>
      </tr>
    );
  };

  // Helper to render Khmer Branch Header
  const renderKhmerBranchHeader = (bGroup: KhmerBranchGroup) => {
    const isBranchCollapsed = collapsedBranches[bGroup.branchId];
    return (
      <tr 
        key={`branch-${bGroup.branchId}`}
        onClick={() => toggleBranchCollapse(bGroup.branchId)}
        className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white font-khmer cursor-pointer select-none transition-colors border-y-2 border-amber-500 shadow-xs"
      >
        <td colSpan={31} className="py-2.5 px-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="p-1 rounded bg-white/10 hover:bg-white/20 text-white transition-colors">
                {isBranchCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
              <Building className="w-4 h-4 text-amber-400" />
              <span className="font-black text-xs text-white tracking-wide">
                {bGroup.branch?.code || bGroup.branchId} — {bGroup.branch?.nameKhmer || 'សាខា'} ({bGroup.branch?.city || ''})
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 font-mono">
                {bGroup.records.length} សិស្ស
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                bGroup.hasDebtCount > 0 
                  ? 'bg-rose-500/25 text-rose-200 border-rose-500/40' 
                  : 'bg-emerald-500/25 text-emerald-200 border-emerald-500/40'
              }`}>
                {bGroup.hasDebtCount > 0 ? `${bGroup.hasDebtCount} សិស្សមានបំណុល` : 'គ្មានបំណុល'}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-emerald-300 font-khmer">
                បានបង់សរុប: <b className="font-mono text-emerald-200">${formatAmount(bGroup.subtotals.totalPaid)}</b>
              </span>
              <span className="text-rose-300 font-khmer">
                ជំពាក់ចុងត្រាសរុប: <b className="font-mono text-rose-200 font-black">${formatAmount(bGroup.subtotals.endingTotal)}</b>
              </span>
              <span className="text-[10px] text-slate-400 font-sans italic no-print">
                ({isBranchCollapsed ? 'ចុចដើម្បីពង្រីក' : 'ចុចដើម្បីបង្រួម'})
              </span>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  // Helper to render Khmer Branch Subtotal Row
  const renderKhmerBranchSubtotal = (bGroup: KhmerBranchGroup) => {
    return (
      <tr key={`branch-subtotal-${bGroup.branchId}`} className="bg-amber-200/90 font-bold text-slate-950 border-t-2 border-b-2 border-amber-500 font-khmer text-[9.5px]">
        <td colSpan={8} className="py-2 px-3 text-center border-r border-amber-400">
          🏢 សរុបរងសាខា ({bGroup.branch?.code || bGroup.branchId} - {bGroup.branch?.nameKhmer}) ({bGroup.records.length} សិស្ស)
        </td>
        <td className="py-2 px-1.5 text-right font-mono border-r border-amber-400">
          ${formatAmount(bGroup.subtotals.fullTuition)}
        </td>
        <td colSpan={2} className="border-r border-amber-400 text-center">-</td>
        <td className="py-2 px-2 text-right font-mono bg-amber-300 border-r border-amber-400">
          ${formatAmount(bGroup.subtotals.amountPayable)}
        </td>
        <td className="py-2 px-1 text-right font-mono border-r border-amber-400">
          {formatCurrency(bGroup.subtotals.pastYearDue)}
        </td>
        <td className="py-2 px-1 text-right font-mono border-r border-amber-400">
          ${formatAmount(bGroup.subtotals.newYearSem1)}
        </td>
        <td className="py-2 px-1 text-right font-mono border-r border-amber-400">
          ${formatAmount(bGroup.subtotals.newYearSem2)}
        </td>
        <td className="py-2 px-1.5 text-right font-mono border-r border-amber-400">
          ${formatAmount(bGroup.subtotals.beginningBalanceDue)}
        </td>
        <td colSpan={2} className="border-r border-amber-400 text-center">-</td>
        <td className="py-2 px-1 text-right font-mono border-r border-amber-400">
          ${formatAmount(bGroup.subtotals.installment1)}
        </td>
        <td colSpan={2} className="border-r border-amber-400 text-center">-</td>
        <td className="py-2 px-1 text-right font-mono border-r border-amber-400">
          {formatCurrency(bGroup.subtotals.installment2)}
        </td>
        <td colSpan={2} className="border-r border-amber-400 text-center">-</td>
        <td className="py-2 px-1 text-right font-mono border-r border-amber-400">
          {formatCurrency(bGroup.subtotals.installment3)}
        </td>
        <td className="py-2 px-2 text-right font-mono text-emerald-950 bg-emerald-300 border-r border-amber-400">
          ${formatAmount(bGroup.subtotals.totalPaid)}
        </td>
        <td className="py-2 px-1.5 text-right font-mono text-rose-950 bg-rose-300 border-r border-amber-400">
          ${formatAmount(bGroup.subtotals.endingTotal)}
        </td>
        <td className="py-2 px-1 text-right font-mono border-r border-amber-400">
          {formatCurrency(bGroup.subtotals.endingPastYear)}
        </td>
        <td className="py-2 px-1 text-right font-mono border-r border-amber-400">
          ${formatAmount(bGroup.subtotals.endingSem1)}
        </td>
        <td className="py-2 px-1 text-right font-mono border-r border-amber-400">
          ${formatAmount(bGroup.subtotals.endingSem2)}
        </td>
        <td className="no-print"></td>
      </tr>
    );
  };

  // Helper to render English Student Row with interactive branch reassignment & formula cell clicking
  const renderEnglishRow = (r: CalculatedEnglishRecord, idx: number) => {
    const hasPaid = r.calcTotalPaidTuition > 0 || r.calcTotalPaidAdmin > 0;
    return (
      <tr 
        key={r.id || idx} 
        className={`hover:bg-amber-50/50 transition-colors ${
          hasPaid ? 'bg-emerald-50/20' : ''
        }`}
      >
        <td className="py-1 px-1 text-center font-mono border-r border-slate-300">{r.no || idx + 1}</td>
        <td className="py-1 px-1.5 font-mono font-medium text-slate-900 border-r border-slate-300">
          <div className="flex flex-col">
            <span>{r.studentCode}</span>
            <div className="no-print mt-0.5 flex items-center gap-1">
              <select
                value={r.branchId || 'fbis-02'}
                onChange={(e) => handleBranchChange(r.id, e.target.value)}
                className="text-[8px] font-mono font-semibold py-0.2 px-1 bg-slate-100 hover:bg-white text-slate-700 border border-slate-300 rounded cursor-pointer"
                title="ផ្លាស់ប្ដូរសាខារបស់សិស្សនេះ (Change Branch)"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.code}</option>
                ))}
              </select>
            </div>
          </div>
        </td>
        <td className="py-1 px-2 font-khmer font-bold text-slate-900 border-r border-slate-300">
          {r.nameKhmer}
        </td>
        <td className="py-1 px-2 font-sans text-slate-700 border-r border-slate-300">
          {r.nameEnglish}
        </td>
        <td className="py-1 px-1 text-center font-mono border-r border-slate-300">{r.gender}</td>
        <td className="py-1 px-1.5 font-mono text-[8.5px] text-slate-600 border-r border-slate-300">{r.dob}</td>
        <td className="py-1 px-1 font-mono text-[8.5px] text-center border-r border-slate-300">{r.academicYear}</td>
        <td className="py-1 px-1.5 font-khmer text-center text-slate-600 border-r border-slate-300">{r.status}</td>
        
        {/* ថ្លៃឈ្នួលសិក្សា១ឆ្នាំ */}
        <td className="py-1 px-1.5 text-right font-mono font-medium border-r border-slate-300">
          {formatCurrency(r.fullTuition)}
        </td>

        {/* បញ្ចុះតម្លៃ ក្នុង១ឆ្នាំ (% & ការលើកទឹកចិត្ត) */}
        <td className="py-1 px-1 text-center font-mono text-slate-700 border-r border-slate-300">
          {r.discountPercent ? `${r.discountPercent}%` : '-'}
        </td>
        <td className="py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300">
          {formatCurrency(r.annualIncentive)}
        </td>

        {/* ការលើកទឹកចិត្ត */}
        <td className="py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300">
          {formatCurrency(r.incentive)}
        </td>

        {/* ទឹកប្រាក់ត្រូវបង់ (ថ្លៃឈ្នួលសិក្សា & ថ្លៃសេវារដ្ឋបាល) */}
        <td 
          onClick={() => selectFormulaColumn('Q', 'ទឹកប្រាក់ត្រូវបង់-ថ្លៃឈ្នួល (Net Tuition Payable)', r.studentCode, r.nameKhmer, r.no, r.calcAmountPayableTuition)}
          className={`py-1 px-1.5 text-right font-mono font-bold text-slate-900 border-r border-slate-300 cursor-pointer transition-colors ${
            selectedColumn === 'Q' && selectedCellInfo.studentCode === r.studentCode ? 'bg-amber-200 ring-2 ring-amber-500' : 'bg-amber-50/60 hover:bg-amber-100'
          }`}
          title="ចុចដើម្បីមើល/កែប្រែរូបមន្ត [Q]"
        >
          {formatCurrency(r.calcAmountPayableTuition)}
        </td>
        <td 
          onClick={() => selectFormulaColumn('R', 'ទឹកប្រាក់ត្រូវបង់-សេវារដ្ឋបាល (Admin Fee Payable)', r.studentCode, r.nameKhmer, r.no, r.calcAmountPayableAdminFee)}
          className={`py-1 px-1.5 text-right font-mono font-medium text-slate-800 border-r border-slate-300 cursor-pointer transition-colors ${
            selectedColumn === 'R' && selectedCellInfo.studentCode === r.studentCode ? 'bg-amber-200 ring-2 ring-amber-500' : 'bg-amber-50/40 hover:bg-amber-100'
          }`}
          title="ចុចដើម្បីមើល/កែប្រែរូបមន្ត [R]"
        >
          {formatCurrency(r.calcAmountPayableAdminFee)}
        </td>

        {/* ទឹកប្រាក់ជំពាក់ឆ្នាំសិក្សាចាស់ (ថ្លៃឈ្នួលសិក្សា & ថ្លៃសេវារដ្ឋបាល) */}
        <td className="py-1 px-1 text-right font-mono text-slate-500 border-r border-slate-300">
          {formatCurrency(r.calcPastYearTuition)}
        </td>
        <td className="py-1 px-1 text-right font-mono text-slate-500 border-r border-slate-300">
          {formatCurrency(r.calcPastYearAdmin)}
        </td>

        {/* ទឹកប្រាក់ជំពាក់ឆ្នាំថ្មី (Q1..Q4) */}
        <td className="py-1 px-1 text-right font-mono text-slate-600 border-r border-slate-300">
          {formatCurrency(r.calcBegQ1Tuition)}
        </td>
        <td className="py-1 px-1 text-right font-mono text-slate-500 border-r border-slate-300">
          {formatCurrency(r.calcBegQ1Admin)}
        </td>
        <td className="py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300">
          {formatCurrency(r.calcBegQ2Tuition)}
        </td>
        <td className="py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300">
          {formatCurrency(r.calcBegQ2Admin)}
        </td>
        <td className="py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300">
          {formatCurrency(r.calcBegQ3Tuition)}
        </td>
        <td className="py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300">
          {formatCurrency(r.calcBegQ3Admin)}
        </td>
        <td className="py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300">
          {formatCurrency(r.calcBegQ4Tuition)}
        </td>
        <td className="py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300">
          {formatCurrency(r.calcBegQ4Admin)}
        </td>

        {/* ទឹកប្រាក់ជំពាក់ដើមត្រាសរុបរួម */}
        <td 
          onClick={() => selectFormulaColumn('AC', 'ជំពាក់ដើមត្រាសរុបរួម-ថ្លៃឈ្នួល (Opening Tuition Debt)', r.studentCode, r.nameKhmer, r.no, r.calcBegTotalTuition)}
          className={`py-1 px-1 text-right font-mono font-bold text-slate-900 border-r border-slate-300 cursor-pointer transition-colors ${
            selectedColumn === 'AC' && selectedCellInfo.studentCode === r.studentCode ? 'bg-amber-200 ring-2 ring-amber-500' : 'hover:bg-amber-50'
          }`}
          title="ចុចដើម្បីមើល/កែប្រែរូបមន្ត [AC]"
        >
          {formatCurrency(r.calcBegTotalTuition)}
        </td>
        <td 
          onClick={() => selectFormulaColumn('AD', 'ជំពាក់ដើមត្រាសរុបរួម-សេវារដ្ឋបាល (Opening Admin Debt)', r.studentCode, r.nameKhmer, r.no, r.calcBegTotalAdmin)}
          className={`py-1 px-1 text-right font-mono font-bold text-slate-900 border-r border-slate-300 cursor-pointer transition-colors ${
            selectedColumn === 'AD' && selectedCellInfo.studentCode === r.studentCode ? 'bg-amber-200 ring-2 ring-amber-500' : 'hover:bg-amber-50'
          }`}
          title="ចុចដើម្បីមើល/កែប្រែរូបមន្ត [AD]"
        >
          {formatCurrency(r.calcBegTotalAdmin)}
        </td>

        {/* ព័ត៌មានការបង់ប្រាក់លើកទី១ */}
        <td className="py-1 px-1 font-mono text-[8.5px] text-slate-600 border-r border-slate-300">
          {r.installment1?.date || '-'}
        </td>
        <td className="py-1 px-1 font-mono text-[8.5px] text-blue-700 border-r border-slate-300">
          {r.installment1?.invoiceNo || r.installment1?.invoiceNoTuition || '-'}
        </td>
        <td className="py-1 px-1 text-right font-mono font-medium text-emerald-700 border-r border-slate-300">
          {formatCurrency(r.calcInst1Amount)}
        </td>

        {/* ព័ត៌មានការបង់ប្រាក់លើកទី២ */}
        <td className="py-1 px-1 font-mono text-[8.5px] text-slate-600 border-r border-slate-300">
          {r.installment2?.date || '-'}
        </td>
        <td className="py-1 px-1 font-mono text-[8.5px] text-blue-700 border-r border-slate-300">
          {r.installment2?.invoiceNo || r.installment2?.invoiceNoAdmin || '-'}
        </td>
        <td className="py-1 px-1 text-right font-mono font-medium text-emerald-700 border-r border-slate-300">
          {formatCurrency(r.calcInst2Amount)}
        </td>

        {/* ទឹកប្រាក់បានបង់សរុប (ថ្លៃឈ្នួលសិក្សា & ថ្លៃសេវារដ្ឋបាល) */}
        <td 
          onClick={() => selectFormulaColumn('AQ', 'ទឹកប្រាក់បានបង់សរុប-ថ្លៃឈ្នួល (Tuition Paid)', r.studentCode, r.nameKhmer, r.no, r.calcTotalPaidTuition)}
          className={`py-1 px-1.5 text-right font-mono font-bold text-emerald-800 border-r border-slate-300 cursor-pointer transition-colors ${
            selectedColumn === 'AQ' && selectedCellInfo.studentCode === r.studentCode ? 'bg-emerald-200 ring-2 ring-emerald-500' : 'bg-emerald-50/50 hover:bg-emerald-100'
          }`}
          title="ចុចដើម្បីមើល/កែប្រែរូបមន្ត [AQ]"
        >
          {formatCurrency(r.calcTotalPaidTuition)}
        </td>
        <td 
          onClick={() => selectFormulaColumn('AR', 'ទឹកប្រាក់បានបង់សរុប-សេវារដ្ឋបាល (Admin Paid)', r.studentCode, r.nameKhmer, r.no, r.calcTotalPaidAdmin)}
          className={`py-1 px-1.5 text-right font-mono font-bold text-emerald-800 border-r border-slate-300 cursor-pointer transition-colors ${
            selectedColumn === 'AR' && selectedCellInfo.studentCode === r.studentCode ? 'bg-emerald-200 ring-2 ring-emerald-500' : 'bg-emerald-50/50 hover:bg-emerald-100'
          }`}
          title="ចុចដើម្បីមើល/កែប្រែរូបមន្ត [AR]"
        >
          {formatCurrency(r.calcTotalPaidAdmin)}
        </td>

        {/* ទឹកប្រាក់ជំពាក់ចុងត្រាសរុបរួម (ថ្លៃឈ្នួលសិក្សា & ថ្លៃសេវារដ្ឋបាល) */}
        <td 
          onClick={() => selectFormulaColumn('AS', 'ជំពាក់ចុងត្រាសរុបរួម-ថ្លៃឈ្នួល (Closing Tuition Debt)', r.studentCode, r.nameKhmer, r.no, r.calcEndTotalTuition)}
          className={`py-1 px-1 text-right font-mono font-bold border-r border-slate-300 cursor-pointer transition-colors ${
            selectedColumn === 'AS' && selectedCellInfo.studentCode === r.studentCode ? 'bg-rose-200 ring-2 ring-rose-500' : r.calcEndTotalTuition > 0 ? 'text-red-700 bg-rose-50 hover:bg-rose-100' : 'text-slate-400 hover:bg-slate-100'
          }`}
          title="ចុចដើម្បីមើល/កែប្រែរូបមន្ត [AS]"
        >
          {formatCurrency(r.calcEndTotalTuition)}
        </td>
        <td 
          onClick={() => selectFormulaColumn('AT', 'ជំពាក់ចុងត្រាសរុបរួម-សេវារដ្ឋបាល (Closing Admin Debt)', r.studentCode, r.nameKhmer, r.no, r.calcEndTotalAdmin)}
          className={`py-1 px-1 text-right font-mono font-bold border-r border-slate-300 cursor-pointer transition-colors ${
            selectedColumn === 'AT' && selectedCellInfo.studentCode === r.studentCode ? 'bg-rose-200 ring-2 ring-rose-500' : r.calcEndTotalAdmin > 0 ? 'text-red-700 bg-rose-50 hover:bg-rose-100' : 'text-slate-400 hover:bg-slate-100'
          }`}
          title="ចុចដើម្បីមើល/កែប្រែរូបមន្ត [AT]"
        >
          {formatCurrency(r.calcEndTotalAdmin)}
        </td>

        {/* ចំនួនដងបង់ប្រាក់ / សូចនាករបំណុល (Col AU) */}
        <td 
          onClick={() => selectFormulaColumn('AU', 'សូចនាករបំណុល (Debtor Indicator Flag)', r.studentCode, r.nameKhmer, r.no, r.calcPaymentCount)}
          className={`py-1 px-1 text-center font-mono text-[9px] border-r border-slate-300 cursor-pointer transition-colors ${
            selectedColumn === 'AU' && selectedCellInfo.studentCode === r.studentCode ? 'bg-amber-200 ring-2 ring-amber-500' : 'hover:bg-amber-50'
          }`}
          title="ចុចដើម្បីមើល/កែប្រែរូបមន្ត [AU]"
        >
          {r.calcPaymentCount}
        </td>

        {/* ជំពាក់ចុងត្រាឆ្នាំចាស់ */}
        <td className="py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300">
          {formatCurrency(r.calcEndPastYearTuition)}
        </td>
        <td className="py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300">
          {formatCurrency(r.calcEndPastYearAdmin)}
        </td>

        {/* ជំពាក់ចុងត្រា Q1..Q4 */}
        <td className="py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300">
          {formatCurrency(r.calcEndQ1Tuition)}
        </td>
        <td className="py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300">
          {formatCurrency(r.calcEndQ1Admin)}
        </td>
        <td className="py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300">
          {formatCurrency(r.calcEndQ2Tuition)}
        </td>
        <td className="py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300">
          {formatCurrency(r.calcEndQ2Admin)}
        </td>
        <td className="py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300">
          {formatCurrency(r.calcEndQ3Tuition)}
        </td>
        <td className="py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300">
          {formatCurrency(r.calcEndQ3Admin)}
        </td>
        <td className="py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300">
          {formatCurrency(r.calcEndQ4Tuition)}
        </td>
        <td className="py-1 px-1 text-right font-mono text-slate-700 border-r border-slate-300">
          {formatCurrency(r.calcEndQ4Admin)}
        </td>

        {/* ចំណាត់ថ្នាក់សិស្ស / កំណត់សម្គាល់ */}
        <td className="py-1 px-1 text-center font-khmer text-[8.5px] text-slate-600 border-r border-slate-300">
          {r.notes || '-'}
        </td>
        <td className="py-1 px-1 text-center text-slate-400 border-r border-slate-300">-</td>

        {/* Actions */}
        <td className="no-print py-1 px-1.5 text-center">
          <button
            onClick={() => {
              const found = students.find(s => s.studentCode === r.studentCode);
              if (found) {
                setSelectedStudentId(found.id);
                setActiveTab('student-profile');
              }
            }}
            className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[9px] font-semibold rounded cursor-pointer transition-colors"
            title="មើលប្រវត្តិរូបសិស្ស"
          >
            Profile
          </button>
        </td>
      </tr>
    );
  };

  // Helper to render English Class Header
  const renderEnglishClassHeader = (collapseKey: string, group: EnglishClassGroup | EnglishClassSubgroup) => {
    const isCollapsed = collapsedClasses[collapseKey] ?? collapsedClasses[group.className];
    return (
      <tr 
        key={`header-${collapseKey}`}
        onClick={() => toggleClassCollapse(collapseKey)}
        className="bg-sky-100/90 hover:bg-sky-200/90 text-slate-900 border-y-2 border-sky-300 font-khmer cursor-pointer transition-colors select-none"
      >
        <td colSpan={49} className="py-2 px-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-sky-200 text-sky-900">
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
              <GraduationCap className="w-4 h-4 text-sky-800" />
              <span className="font-black text-xs text-slate-900 tracking-wide">
                ថ្នាក់៖ {group.className}
              </span>
              <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-slate-700 border border-sky-200">
                {group.records.length} សិស្ស
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                group.hasDebtCount > 0 
                  ? 'bg-rose-50 text-rose-700 border-rose-200' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {group.hasDebtCount > 0 ? `${group.hasDebtCount} សិស្សមានបំណុល` : 'គ្មានបំណុល'}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-emerald-800 font-khmer">
                បានបង់សរុប: <b className="font-mono text-emerald-700">${formatAmount(group.subtotals.totPaidTuition + group.subtotals.totPaidAdmin)}</b>
              </span>
              <span className="text-red-900 font-khmer">
                ជំពាក់សរុប: <b className="font-mono text-rose-700 font-black">${formatAmount(group.subtotals.endTotalTuition + group.subtotals.endTotalAdmin)}</b>
              </span>
              <span className="text-[10px] text-slate-500 font-sans italic no-print">
                ({isCollapsed ? 'ចុចដើម្បីពង្រីក' : 'ចុចដើម្បីបង្រួម'})
              </span>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  // Helper to render English Class Subtotal Row
  const renderEnglishClassSubtotal = (group: EnglishClassGroup | EnglishClassSubgroup) => {
    return (
      <tr key={`subtotal-${group.className}`} className="bg-sky-100/70 font-bold text-slate-900 border-t-2 border-b-2 border-sky-300 font-khmer text-[8.5px]">
        <td colSpan={8} className="py-1.5 px-2 text-center border-r border-slate-400 text-[9px]">
          សរុបរង ({group.className}) ({group.records.length} សិស្ស)
        </td>
        <td className="py-1.5 px-1 text-right font-mono border-r border-slate-400">
          ${formatAmount(group.subtotals.fullTuition)}
        </td>
        <td className="border-r border-slate-400 text-center font-mono">-</td>
        <td className="py-1.5 px-1 text-right font-mono border-r border-slate-400">
          {formatCurrency(group.subtotals.annualIncentive)}
        </td>
        <td className="py-1.5 px-1 text-right font-mono border-r border-slate-400">
          {formatCurrency(group.subtotals.incentive)}
        </td>
        <td className="py-1.5 px-1 text-right font-mono bg-amber-200/80 border-r border-slate-400">
          ${formatAmount(group.subtotals.amountPayableTuition)}
        </td>
        <td className="py-1.5 px-1 text-right font-mono bg-amber-200/80 border-r border-slate-400">
          ${formatAmount(group.subtotals.amountPayableAdminFee)}
        </td>
        <td className="py-1.5 px-1 text-right font-mono border-r border-slate-400">
          {formatCurrency(group.subtotals.pastYearTuition)}
        </td>
        <td className="py-1.5 px-1 text-right font-mono border-r border-slate-400">
          {formatCurrency(group.subtotals.pastYearAdmin)}
        </td>
        <td className="py-1.5 px-1 text-right font-mono border-r border-slate-400">
          {formatCurrency(group.subtotals.begQ1Tuition)}
        </td>
        <td className="py-1.5 px-1 text-right font-mono border-r border-slate-400">
          {formatCurrency(group.subtotals.begQ1Admin)}
        </td>
        <td className="py-1.5 px-1 text-right font-mono border-r border-slate-400">
          {formatCurrency(group.subtotals.begQ2Tuition)}
        </td>
        <td className="py-1.5 px-1 text-right font-mono border-r border-slate-400">
          {formatCurrency(group.subtotals.begQ2Admin)}
        </td>
        <td className="py-1.5 px-1 text-right font-mono border-r border-slate-400">
          {formatCurrency(group.subtotals.begQ3Tuition)}
        </td>
        <td className="py-1.5 px-1 text-right font-mono border-r border-slate-400">
          {formatCurrency(group.subtotals.begQ3Admin)}
        </td>
        <td className="py-1.5 px-1 text-right font-mono border-r border-slate-400">
          {formatCurrency(group.subtotals.begQ4Tuition)}
        </td>
        <td className="py-1.5 px-1 text-right font-mono border-r border-slate-400">
          {formatCurrency(group.subtotals.begQ4Admin)}
        </td>
        <td className="py-1.5 px-1 text-right font-mono border-r border-slate-400">
          ${formatAmount(group.subtotals.begNewYearTuition)}
        </td>
        <td className="py-1.5 px-1 text-right font-mono border-r border-slate-400">
          ${formatAmount(group.subtotals.begNewYearAdmin)}
        </td>
        <td colSpan={2} className="border-r border-slate-400 text-center">-</td>
        <td className="py-1.5 px-1 text-right font-mono border-r border-slate-400">
          ${formatAmount(group.subtotals.inst1Amount)}
        </td>
        <td colSpan={2} className="border-r border-slate-400 text-center">-</td>
        <td className="py-1.5 px-1 text-right font-mono border-r border-slate-400">
          ${formatAmount(group.subtotals.inst2Amount)}
        </td>
        <td className="py-1.5 px-1 text-right font-mono text-emerald-900 bg-emerald-200/80 border-r border-slate-400">
          ${formatAmount(group.subtotals.totPaidTuition)}
        </td>
        <td className="py-1.5 px-1 text-right font-mono text-emerald-900 bg-emerald-200/80 border-r border-slate-400">
          ${formatAmount(group.subtotals.totPaidAdmin)}
        </td>
        <td className="py-1.5 px-1 text-right font-mono text-red-900 bg-rose-200/80 border-r border-slate-400">
          ${formatAmount(group.subtotals.endTotalTuition)}
        </td>
        <td className="py-1.5 px-1 text-right font-mono text-red-900 bg-rose-200/80 border-r border-slate-400">
          ${formatAmount(group.subtotals.endTotalAdmin)}
        </td>
        <td className="border-r border-slate-400 text-center">-</td>
        <td className="py-1.5 px-1 text-right font-mono border-r border-slate-400">
          {formatCurrency(group.subtotals.endPastYearTuition)}
        </td>
        <td className="py-1.5 px-1 text-right font-mono border-r border-slate-400">
          {formatCurrency(group.subtotals.endPastYearAdmin)}
        </td>
        <td className="py-1.5 px-1 text-right font-mono border-r border-slate-400">
          {formatCurrency(group.subtotals.endQ1Tuition)}
        </td>
        <td className="py-1.5 px-1 text-right font-mono border-r border-slate-400">
          {formatCurrency(group.subtotals.endQ1Admin)}
        </td>
        <td className="py-1.5 px-1 text-right font-mono border-r border-slate-400">
          {formatCurrency(group.subtotals.endQ2Tuition)}
        </td>
        <td className="py-1.5 px-1 text-right font-mono border-r border-slate-400">
          {formatCurrency(group.subtotals.endQ2Admin)}
        </td>
        <td className="py-1.5 px-1 text-right font-mono border-r border-slate-400">
          {formatCurrency(group.subtotals.endQ3Tuition)}
        </td>
        <td className="py-1.5 px-1 text-right font-mono border-r border-slate-400">
          {formatCurrency(group.subtotals.endQ3Admin)}
        </td>
        <td className="py-1.5 px-1 text-right font-mono border-r border-slate-400">
          {formatCurrency(group.subtotals.endQ4Tuition)}
        </td>
        <td className="py-1.5 px-1 text-right font-mono border-r border-slate-400">
          ${formatAmount(group.subtotals.endQ4Admin)}
        </td>
        <td colSpan={2} className="border-r border-slate-400 text-center">-</td>
        <td className="no-print"></td>
      </tr>
    );
  };

  // Helper to render English Branch Header
  const renderEnglishBranchHeader = (bGroup: EnglishBranchGroup) => {
    const isBranchCollapsed = collapsedBranches[bGroup.branchId];
    return (
      <tr 
        key={`branch-${bGroup.branchId}`}
        onClick={() => toggleBranchCollapse(bGroup.branchId)}
        className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white font-khmer cursor-pointer select-none transition-colors border-y-2 border-sky-500 shadow-xs"
      >
        <td colSpan={49} className="py-2.5 px-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="p-1 rounded bg-white/10 hover:bg-white/20 text-white transition-colors">
                {isBranchCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
              <Building className="w-4 h-4 text-sky-400" />
              <span className="font-black text-xs text-white tracking-wide">
                {bGroup.branch?.code || bGroup.branchId} — {bGroup.branch?.nameKhmer || 'សាខា'} ({bGroup.branch?.city || ''})
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-400 text-slate-950 font-mono">
                {bGroup.records.length} សិស្ស
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                bGroup.hasDebtCount > 0 
                  ? 'bg-rose-500/25 text-rose-200 border-rose-500/40' 
                  : 'bg-emerald-500/25 text-emerald-200 border-emerald-500/40'
              }`}>
                {bGroup.hasDebtCount > 0 ? `${bGroup.hasDebtCount} សិស្សមានបំណុល` : 'គ្មានបំណុល'}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-emerald-300 font-khmer">
                បានបង់សរុប: <b className="font-mono text-emerald-200">${formatAmount(bGroup.subtotals.totPaidTuition + bGroup.subtotals.totPaidAdmin)}</b>
              </span>
              <span className="text-rose-300 font-khmer">
                ជំពាក់ចុងត្រាសរុប: <b className="font-mono text-rose-200 font-black">${formatAmount(bGroup.subtotals.endTotalTuition + bGroup.subtotals.endTotalAdmin)}</b>
              </span>
              <span className="text-[10px] text-slate-400 font-sans italic no-print">
                ({isBranchCollapsed ? 'ចុចដើម្បីពង្រីក' : 'ចុចដើម្បីបង្រួម'})
              </span>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  // Helper to render English Branch Subtotal Row
  const renderEnglishBranchSubtotal = (bGroup: EnglishBranchGroup) => {
    return (
      <tr key={`branch-subtotal-${bGroup.branchId}`} className="bg-sky-200/90 font-bold text-slate-950 border-t-2 border-b-2 border-sky-500 font-khmer text-[8.5px]">
        <td colSpan={8} className="py-2 px-2 text-center border-r border-sky-400 text-[9px]">
          🏢 សរុបរងសាខា ({bGroup.branch?.code || bGroup.branchId} - {bGroup.branch?.nameKhmer}) ({bGroup.records.length} សិស្ស)
        </td>
        <td className="py-2 px-1 text-right font-mono border-r border-sky-400">
          ${formatAmount(bGroup.subtotals.fullTuition)}
        </td>
        <td className="border-r border-sky-400 text-center font-mono">-</td>
        <td className="py-2 px-1 text-right font-mono border-r border-sky-400">
          {formatCurrency(bGroup.subtotals.annualIncentive)}
        </td>
        <td className="py-2 px-1 text-right font-mono border-r border-sky-400">
          {formatCurrency(bGroup.subtotals.incentive)}
        </td>
        <td className="py-2 px-1 text-right font-mono bg-amber-300 border-r border-sky-400">
          ${formatAmount(bGroup.subtotals.amountPayableTuition)}
        </td>
        <td className="py-2 px-1 text-right font-mono bg-amber-300 border-r border-sky-400">
          ${formatAmount(bGroup.subtotals.amountPayableAdminFee)}
        </td>
        <td className="py-2 px-1 text-right font-mono border-r border-sky-400">
          {formatCurrency(bGroup.subtotals.pastYearTuition)}
        </td>
        <td className="py-2 px-1 text-right font-mono border-r border-sky-400">
          {formatCurrency(bGroup.subtotals.pastYearAdmin)}
        </td>
        <td className="py-2 px-1 text-right font-mono border-r border-sky-400">
          {formatCurrency(bGroup.subtotals.begQ1Tuition)}
        </td>
        <td className="py-2 px-1 text-right font-mono border-r border-sky-400">
          {formatCurrency(bGroup.subtotals.begQ1Admin)}
        </td>
        <td className="py-2 px-1 text-right font-mono border-r border-sky-400">
          {formatCurrency(bGroup.subtotals.begQ2Tuition)}
        </td>
        <td className="py-2 px-1 text-right font-mono border-r border-sky-400">
          {formatCurrency(bGroup.subtotals.begQ2Admin)}
        </td>
        <td className="py-2 px-1 text-right font-mono border-r border-sky-400">
          {formatCurrency(bGroup.subtotals.begQ3Tuition)}
        </td>
        <td className="py-2 px-1 text-right font-mono border-r border-sky-400">
          {formatCurrency(bGroup.subtotals.begQ3Admin)}
        </td>
        <td className="py-2 px-1 text-right font-mono border-r border-sky-400">
          {formatCurrency(bGroup.subtotals.begQ4Tuition)}
        </td>
        <td className="py-2 px-1 text-right font-mono border-r border-sky-400">
          {formatCurrency(bGroup.subtotals.begQ4Admin)}
        </td>
        <td className="py-2 px-1 text-right font-mono border-r border-sky-400">
          ${formatAmount(bGroup.subtotals.begNewYearTuition)}
        </td>
        <td className="py-2 px-1 text-right font-mono border-r border-sky-400">
          ${formatAmount(bGroup.subtotals.begNewYearAdmin)}
        </td>
        <td colSpan={2} className="border-r border-sky-400 text-center">-</td>
        <td className="py-2 px-1 text-right font-mono border-r border-sky-400">
          ${formatAmount(bGroup.subtotals.inst1Amount)}
        </td>
        <td colSpan={2} className="border-r border-sky-400 text-center">-</td>
        <td className="py-2 px-1 text-right font-mono border-r border-sky-400">
          ${formatAmount(bGroup.subtotals.inst2Amount)}
        </td>
        <td className="py-2 px-1 text-right font-mono text-emerald-950 bg-emerald-300 border-r border-sky-400">
          ${formatAmount(bGroup.subtotals.totPaidTuition)}
        </td>
        <td className="py-2 px-1 text-right font-mono text-emerald-950 bg-emerald-300 border-r border-sky-400">
          ${formatAmount(bGroup.subtotals.totPaidAdmin)}
        </td>
        <td className="py-2 px-1 text-right font-mono text-rose-950 bg-rose-300 border-r border-sky-400">
          ${formatAmount(bGroup.subtotals.endTotalTuition)}
        </td>
        <td className="py-2 px-1 text-right font-mono text-rose-950 bg-rose-300 border-r border-sky-400">
          ${formatAmount(bGroup.subtotals.endTotalAdmin)}
        </td>
        <td className="border-r border-sky-400 text-center">-</td>
        <td className="py-2 px-1 text-right font-mono border-r border-sky-400">
          {formatCurrency(bGroup.subtotals.endPastYearTuition)}
        </td>
        <td className="py-2 px-1 text-right font-mono border-r border-sky-400">
          {formatCurrency(bGroup.subtotals.endPastYearAdmin)}
        </td>
        <td className="py-2 px-1 text-right font-mono border-r border-sky-400">
          {formatCurrency(bGroup.subtotals.endQ1Tuition)}
        </td>
        <td className="py-2 px-1 text-right font-mono border-r border-sky-400">
          {formatCurrency(bGroup.subtotals.endQ1Admin)}
        </td>
        <td className="py-2 px-1 text-right font-mono border-r border-sky-400">
          {formatCurrency(bGroup.subtotals.endQ2Tuition)}
        </td>
        <td className="py-2 px-1 text-right font-mono border-r border-sky-400">
          {formatCurrency(bGroup.subtotals.endQ2Admin)}
        </td>
        <td className="py-2 px-1 text-right font-mono border-r border-sky-400">
          {formatCurrency(bGroup.subtotals.endQ3Tuition)}
        </td>
        <td className="py-2 px-1 text-right font-mono border-r border-sky-400">
          {formatCurrency(bGroup.subtotals.endQ3Admin)}
        </td>
        <td className="py-2 px-1 text-right font-mono border-r border-sky-400">
          {formatCurrency(bGroup.subtotals.endQ4Tuition)}
        </td>
        <td className="py-2 px-1 text-right font-mono border-r border-sky-400">
          ${formatAmount(bGroup.subtotals.endQ4Admin)}
        </td>
        <td colSpan={2} className="border-r border-sky-400 text-center">-</td>
        <td className="no-print"></td>
      </tr>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Mode Switcher */}
      <div className="no-print bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Khmer Program Tab */}
          <button
            onClick={() => handleProgramSwitch('khmer')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeProgram === 'khmer'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span className="text-sm">🇰🇭</span>
            <div className="text-left">
              <div className="font-khmer font-bold">កម្មវិធីភាសាខ្មែរ (Khmer Program - Grade 7)</div>
              <div className="text-[10px] font-sans font-normal opacity-90">
                {branchKhmerDueRecords.length} សិស្សជំពាក់ថ្លៃឈ្នួលសិក្សា តាមឆមាស & លើកបង់ប្រាក់
              </div>
            </div>
          </button>

          {/* English Program Tab */}
          <button
            onClick={() => handleProgramSwitch('english')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeProgram === 'english'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span className="text-sm">🇬🇧</span>
            <div className="text-left">
              <div className="font-khmer font-bold">កម្មវិធីភាសាអង់គ្លេស (English Program - K1)</div>
              <div className="text-[10px] font-sans font-normal opacity-90">
                {branchEnglishDueRecords.length} សិស្សជំពាក់ថ្លៃឈ្នួលសិក្សា & សេវារដ្ឋបាល តាមត្រីមាស
              </div>
            </div>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* SQL Import & Analytics Button */}
          <button
            onClick={() => setActiveTab('sql-import')}
            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            title="នាំចូល និងវិភាគទិន្នន័យ SQL តាមសាខា (Import & Analyze SQL by Branch)"
          >
            <Database className="w-4 h-4" />
            <span className="font-khmer">វិភាគ SQL តាមសាខា</span>
          </button>

          {/* Sync Students Button */}
          <button
            onClick={handleSyncWithStudents}
            disabled={isSyncing}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            title="ធ្វើសមកាលកម្មទិន្នន័យសិស្សពីបញ្ជីសិស្សទូទៅ (Sync Students from Central Directory)"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="font-khmer">Sync ពីបញ្ជីសិស្ស</span>
          </button>

          <button
            onClick={activeProgram === 'khmer' ? handleExportKhmerExcel : handleExportEnglishExcel}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel (.xlsx)</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Form</span>
          </button>
        </div>
      </div>

      {/* Student Count Alignment & Parity Banner */}
      <div className="no-print bg-indigo-50/70 border border-indigo-200 p-2.5 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-khmer text-slate-700">
            ស្ថានភាពសមកាលកម្មទិន្នន័យ៖ 
            <b className="text-slate-900 mx-1">សិស្សចុះឈ្មោះក្នុងប្រព័ន្ធ ({students.length} នាក់)</b> 
            និង <b className="text-indigo-800 mx-1">សិស្សក្នុងតារាងបំណុល ({khmerDueRecords.length + englishDueRecords.length} នាក់)</b>
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 font-khmer">
            ✓ សមកាលកម្ម ១០០%
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-600 font-khmer">
          <span>💡 បំណុលឆ្នាំចាស់ (Last Year Owed) ត្រូវបាន Sync ស្វ័យប្រវត្តិតាមប្រវត្តិរូបសិស្ស</span>
        </div>
      </div>

      {/* Filter and Configuration Bar */}
      <div className="no-print bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px]">
            <input
              type="text"
              placeholder="Search by Student ID (e.g. FBIS5478), name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 bg-white"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          {/* Branch Selector Filter */}
          <div className="flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-amber-600" />
            <span className="font-khmer text-slate-600">សាខា:</span>
            <select
              value={selectedBranchFilter}
              onChange={(e) => {
                setSelectedBranchFilter(e.target.value);
                if (e.target.value !== 'all') {
                  setCurrentBranchId(e.target.value);
                }
              }}
              className="h-8 px-2 text-xs border border-slate-300 rounded-md bg-white font-khmer min-w-[145px]"
            >
              <option value="all">🏢 គ្រប់សាខាទាំងអស់ (All Branches)</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.code} - {b.nameKhmer}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-khmer text-slate-600">ឆ្នាំសិក្សា:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="h-8 px-2 text-xs border border-slate-300 rounded-md bg-white font-khmer"
            >
              <option value="2025-2026">២០២៥-២០២៦ (2025-2026)</option>
              <option value="all">ទាំងអស់ (All Academic Years)</option>
              <option value="2026-2027">២០២៦-២០២៧ (2026-2027)</option>
              <option value="2024-2025">២០២៤-២០២៥ (2024-2025)</option>
            </select>
          </div>

          {/* Class Selector Filter */}
          <div className="flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-khmer text-slate-600">ថ្នាក់:</span>
            <select
              value={activeProgram === 'khmer' ? selectedClassKhmer : selectedClassEnglish}
              onChange={(e) => {
                if (activeProgram === 'khmer') {
                  setSelectedClassKhmer(e.target.value);
                } else {
                  setSelectedClassEnglish(e.target.value);
                }
              }}
              className="h-8 px-2 text-xs border border-slate-300 rounded-md bg-white font-khmer min-w-[130px]"
            >
              <option value="all">ថ្នាក់ទាំងអស់ (All Classes)</option>
              {(activeProgram === 'khmer' ? availableKhmerClasses : availableEnglishClasses).map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          {/* Group by Branch Toggle and Controls */}
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-300 shadow-2xs">
            <button
              onClick={() => setGroupByBranch(!groupByBranch)}
              className={`h-7 px-2.5 rounded-md font-khmer text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                groupByBranch
                  ? 'bg-amber-600 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="បែងចែក និងតម្រៀបរបាយការណ៍តាមសាខានីមួយៗ"
            >
              <Building className="w-3.5 h-3.5" />
              <span>តម្រៀបតាមសាខា</span>
              {groupByBranch && (
                <span className="ml-1 text-[10px] bg-white/25 px-1.5 py-0.5 rounded-full font-mono">
                  {activeProgram === 'khmer' ? groupedKhmerByBranch.length : groupedEnglishByBranch.length} សាខា
                </span>
              )}
            </button>
            
            {groupByBranch && (
              <div className="flex items-center gap-1 pl-1 border-l border-slate-200">
                <button
                  onClick={expandAllBranches}
                  className="h-7 px-2 text-[11px] text-slate-600 hover:text-amber-700 hover:bg-slate-100 rounded cursor-pointer transition-colors flex items-center gap-1"
                  title="ពង្រីកគ្រប់សាខាទាំងអស់"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span className="font-khmer">ពង្រីក</span>
                </button>
                <button
                  onClick={collapseAllBranches}
                  className="h-7 px-2 text-[11px] text-slate-600 hover:text-amber-700 hover:bg-slate-100 rounded cursor-pointer transition-colors flex items-center gap-1"
                  title="បង្រួមគ្រប់សាខាទាំងអស់"
                >
                  <Minimize2 className="w-3 h-3" />
                  <span className="font-khmer">បង្រួម</span>
                </button>
              </div>
            )}
          </div>

          {/* Grouping Toggle and Controls */}
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-300 shadow-2xs">
            <button
              onClick={() => setGroupByClass(!groupByClass)}
              className={`h-7 px-2.5 rounded-md font-khmer text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                groupByClass
                  ? 'bg-blue-600 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="តម្រៀបសិស្សតាមថ្នាក់"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>តម្រៀបតាមថ្នាក់</span>
              {groupByClass && (
                <span className="ml-1 text-[10px] bg-white/25 px-1.5 py-0.5 rounded-full font-mono">
                  {activeProgram === 'khmer' ? groupedKhmerList.length : groupedEnglishList.length} ថ្នាក់
                </span>
              )}
            </button>
            
            {groupByClass && (
              <div className="flex items-center gap-1 pl-1 border-l border-slate-200">
                <button
                  onClick={expandAllClasses}
                  className="h-7 px-2 text-[11px] text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded cursor-pointer transition-colors flex items-center gap-1"
                  title="ពង្រីកគ្រប់ថ្នាក់ទាំងអស់"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span className="font-khmer">ពង្រីក</span>
                </button>
                <button
                  onClick={() => collapseAllClasses(activeProgram === 'khmer' ? availableKhmerClasses : availableEnglishClasses)}
                  className="h-7 px-2 text-[11px] text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded cursor-pointer transition-colors flex items-center gap-1"
                  title="បង្រួមគ្រប់ថ្នាក់ទាំងអស់"
                >
                  <Minimize2 className="w-3 h-3" />
                  <span className="font-khmer">បង្រួម</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-khmer text-slate-600">គិតដល់ត្រឹមថ្ងៃទី:</span>
            <input
              type="text"
              value={cutoffDateKhmer}
              onChange={(e) => setCutoffDateKhmer(e.target.value)}
              className="h-8 px-2.5 text-xs border border-slate-300 rounded-md bg-white font-khmer min-w-[130px]"
            />
          </div>
        </div>

        <div className="text-[11px] text-slate-500 font-sans">
          Showing <span className="font-bold text-slate-900">{activeProgram === 'khmer' ? filteredKhmer.length : filteredEnglish.length}</span> records
        </div>
      </div>

      {/* Semester Configuration Date Timeline Banner */}
      <div className="no-print bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="font-bold text-slate-800 font-khmer">
            កាលបរិច្ឆេទឆមាស ({selectedYear})៖
          </span>
          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-khmer border border-blue-200">
            ឆមាសទី១: <b>{formatKhmerDate(semConfig.semester1StartDate)}</b> ដល់ <b>{formatKhmerDate(semConfig.semester1EndDate)}</b>
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-khmer border border-emerald-200">
            ឆមាសទី២: <b>{formatKhmerDate(semConfig.semester2StartDate)}</b> ដល់ <b>{formatKhmerDate(semConfig.semester2EndDate)}</b>
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono font-bold">
          {activeProgram === 'khmer' ? (
            <>
              <span className="text-blue-800 font-khmer">
                ជំពាក់ឆមាស១: <span className="font-mono text-rose-600">${formatAmount(khmerTotals.endingSem1)}</span>
              </span>
              <span className="text-emerald-800 font-khmer">
                ជំពាក់ឆមាស២: <span className="font-mono text-rose-600">${formatAmount(khmerTotals.endingSem2)}</span>
              </span>
              <span className="text-slate-800 font-khmer">
                សរុបបំណុល: <span className="font-mono text-rose-700 font-black">${formatAmount(khmerTotals.endingTotal)}</span>
              </span>
            </>
          ) : (
            <>
              <span className="text-blue-800 font-khmer">
                ជំពាក់ថ្លៃសិក្សា: <span className="font-mono text-rose-600">${formatAmount(englishTotals.endTotalTuition)}</span>
              </span>
              <span className="text-emerald-800 font-khmer">
                ជំពាក់រដ្ឋបាល: <span className="font-mono text-rose-600">${formatAmount(englishTotals.endTotalAdmin)}</span>
              </span>
              <span className="text-slate-800 font-khmer">
                សរុបបំណុល: <span className="font-mono text-rose-700 font-black">${formatAmount(englishTotals.endTotalTuition + englishTotals.endTotalAdmin)}</span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Success Notification Toast */}
      {formulaSuccessToast && (
        <div className="no-print bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-2 rounded-xl text-xs flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-khmer font-bold">{formulaSuccessToast}</span>
          </div>
          <button 
            onClick={() => setFormulaSuccessToast(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🧮 EXCEL FORMULA BAR (របាររូបមន្ត fx ដូចក្នុង Microsoft Excel / Google Sheets) */}
      {/* ========================================================================= */}
      <div className="no-print bg-slate-900 text-white p-3 rounded-xl border border-slate-700 shadow-md flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Active Column / Cell Selector & Info */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold font-mono">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>fx Column:</span>
              <select
                value={selectedColumn}
                onChange={(e) => {
                  const col = e.target.value;
                  const cols = activeProgram === 'khmer' ? KHMER_FORMULA_COLUMNS : ENGLISH_FORMULA_COLUMNS;
                  const item = cols.find(c => c.key === col);
                  selectFormulaColumn(col, item ? `${item.name} (${item.desc})` : col);
                }}
                className="bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded text-xs cursor-pointer focus:outline-none"
              >
                {(activeProgram === 'khmer' ? KHMER_FORMULA_COLUMNS : ENGLISH_FORMULA_COLUMNS).map(col => (
                  <option key={col.key} value={col.key}>
                    [{col.key}] {col.name}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-xs text-slate-300 font-khmer font-medium">
              {selectedCellInfo.colName}
            </span>

            {selectedCellInfo.studentName && (
              <span className="text-[11px] text-slate-300 font-khmer bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700 flex items-center gap-1">
                <span>សិស្ស:</span>
                <b className="text-white">{selectedCellInfo.studentName}</b>
                <span className="text-slate-400 font-mono">({selectedCellInfo.studentCode})</span>
              </span>
            )}
          </div>

          {/* Manage Formulas & Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowFormulaManager(true)}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="font-khmer font-bold">គ្រប់គ្រងរូបមន្ត (Manage Formulas)</span>
            </button>

            <button
              onClick={() => resetFormulaToDefault()}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1 border border-slate-700"
              title="កំណត់រូបមន្តដើមឡើងវិញសម្រាប់ជួរឈរនេះ"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-khmer text-[11px]">Reset</span>
            </button>
          </div>
        </div>

        {/* Input Bar with fx icon */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 font-serif italic font-bold text-amber-400 text-sm select-none shrink-0 shadow-inner">
            fx
          </div>
          <div className="relative flex-1">
            <input
              type="text"
              value={formulaInput}
              onChange={(e) => setFormulaInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  applyActiveFormula();
                }
              }}
              placeholder="ឧទាហរណ៍: =(I-K)-((I-K)*J)-L ឬ =ROUND(N+O+P, 2)"
              className="w-full h-8 px-3 font-mono text-xs bg-slate-950 border border-slate-700 rounded-lg text-emerald-400 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-inner"
            />
          </div>

          {/* Apply Button */}
          <button
            onClick={applyActiveFormula}
            className="h-8 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-sm shrink-0"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span className="font-khmer">អនុវត្ត (Apply)</span>
          </button>
        </div>

        {/* Validation Status & Quick Insert Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800 text-[11px]">
          <div className="flex items-center gap-2">
            {currentValidation.valid ? (
              <span className="text-emerald-400 flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>រូបមន្តត្រឹមត្រូវ (Valid)</span>
                {currentValidation.result !== undefined && (
                  <span className="text-slate-400 ml-1">
                    • លទ្ធផលសាកល្បង: <b className="text-white">${formatAmount(Number(currentValidation.result))}</b>
                  </span>
                )}
              </span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1 font-mono">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{currentValidation.error}</span>
              </span>
            )}
          </div>

          {/* Quick Formula Token Buttons */}
          <div className="flex items-center gap-1">
            <span className="text-slate-400 font-khmer text-[10px] mr-1">បញ្ចូលរហ័ស:</span>
            {['+', '-', '*', '/', 'SUM', 'ROUND', 'IF', 'MAX', 'MIN', 'OR'].map(token => (
              <button
                key={token}
                onClick={() => {
                  setFormulaInput(prev => {
                    if (token.length > 1) {
                      return prev ? `${prev} ${token}()` : `=${token}()`;
                    }
                    return prev ? `${prev} ${token} ` : `=${token} `;
                  });
                }}
                className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[10px] rounded border border-slate-700 transition-colors cursor-pointer"
              >
                {token}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🇰🇭 KHMER PROGRAM DUE REPORT (MATCHING ATTACHED PDF REPORT EXACTLY)        */}
      {/* ========================================================================= */}
      {activeProgram === 'khmer' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-300 p-4 overflow-hidden print:p-0 print:border-none print:shadow-none">
          {/* Official Report Header */}
          <div className="text-center mb-4">
            <h2 className="text-base sm:text-lg font-black font-khmer text-slate-900 tracking-wide">
              បញ្ជីឈ្មោះសិស្ស{selectedClassKhmer === 'all' ? 'គ្រប់ថ្នាក់' : selectedClassKhmer} ជំពាក់ថ្លៃឈ្នួលសិក្សា ឆ្នាំសិក្សា{selectedYear} {selectedBranch.nameKhmer}
            </h2>
            <p className="text-xs font-khmer text-slate-700 mt-0.5">
              គិតដល់ត្រឹម ថ្ងៃទី{cutoffDateKhmer}
            </p>
          </div>

          {/* Yellow Matrix Table Matching Attached PDF with Exact 30 Columns */}
          <div className="overflow-x-auto border border-slate-400">
            <table className="w-full text-left text-[9px] border-collapse whitespace-nowrap">
              {/* Header Rows Matching Original Khmer PDF 2-tier Structure */}
              <thead className="bg-[#fff3a8] text-slate-900 font-semibold font-khmer text-center border-b border-slate-400">
                <tr className="border-b border-slate-400">
                  <th rowSpan={2} className="py-2 px-1 border-r border-slate-400 w-7">ល-រ</th>
                  <th rowSpan={2} className="py-2 px-1.5 border-r border-slate-400">អត្តលេខសិស្ស</th>
                  <th rowSpan={2} className="py-2 px-2.5 border-r border-slate-400">ឈ្មោះជាភាសាខ្មែរ</th>
                  <th rowSpan={2} className="py-2 px-2.5 border-r border-slate-400 font-sans">ឈ្មោះជាភាសាឡាតាំង</th>
                  <th rowSpan={2} className="py-2 px-1 border-r border-slate-400">ភេទ</th>
                  <th rowSpan={2} className="py-2 px-1.5 border-r border-slate-400">ថ្ងៃខែឆ្នាំកំណើត</th>
                  <th rowSpan={2} className="py-2 px-1.5 border-r border-slate-400">ឆ្នាំសិក្សា</th>
                  <th rowSpan={2} className="py-2 px-1.5 border-r border-slate-400">ស្ថានភាព</th>
                  <th rowSpan={2} className="py-2 px-1.5 border-r border-slate-400">ថ្លៃឈ្នួល<br/>សិក្សា១ឆ្នាំ</th>
                  <th colSpan={2} className="py-1 px-1 border-r border-slate-400">បញ្ចុះតម្លៃក្នុង១ឆ្នាំ</th>
                  <th 
                    rowSpan={2} 
                    onClick={() => selectFormulaColumn('M', 'ទឹកប្រាក់ត្រូវបង់ (Net Tuition Payable)')}
                    className={`py-2 px-2 border-r border-slate-400 font-bold cursor-pointer transition-colors select-none ${
                      selectedColumn === 'M' ? 'bg-amber-300 ring-2 ring-amber-500' : 'bg-amber-100/70 hover:bg-amber-200'
                    }`}
                    title="ចុចដើម្បីកែប្រែរូបមន្តជួរឈរនេះ (Col M)"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>ទឹកប្រាក់ត្រូវបង់</span>
                      <span className="text-[8px] bg-amber-400/90 px-1 py-0.2 rounded font-mono font-black text-slate-900">fx</span>
                    </div>
                  </th>
                  <th rowSpan={2} className="py-2 px-1 border-r border-slate-400">ទឹកប្រាក់ជំពាក់<br/>ឆ្នាំសិក្សាចាស់</th>
                  <th colSpan={2} className="py-1 px-1 border-r border-slate-400 bg-amber-50">ទឹកប្រាក់ជំពាក់ឆ្នាំថ្មី</th>
                  <th 
                    rowSpan={2} 
                    onClick={() => selectFormulaColumn('Q', 'ទឹកប្រាក់ជំពាក់ដើមត្រា (Total Opening Debt)')}
                    className={`py-2 px-1.5 border-r border-slate-400 font-bold cursor-pointer transition-colors select-none ${
                      selectedColumn === 'Q' ? 'bg-amber-300 ring-2 ring-amber-500' : 'hover:bg-amber-200'
                    }`}
                    title="ចុចដើម្បីកែប្រែរូបមន្តជួរឈរនេះ (Col Q)"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>ទឹកប្រាក់ជំពាក់<br/>ដើមត្រា</span>
                      <span className="text-[8px] bg-amber-400/90 px-1 py-0.2 rounded font-mono font-black text-slate-900">fx</span>
                    </div>
                  </th>
                  <th colSpan={3} className="py-1 px-1.5 border-r border-slate-400 bg-sky-50">លើកទី១</th>
                  <th colSpan={3} className="py-1 px-1.5 border-r border-slate-400 bg-sky-50">លើកទី២</th>
                  <th colSpan={3} className="py-1 px-1.5 border-r border-slate-400 bg-sky-50">លើកទី៣</th>
                  <th 
                    rowSpan={2} 
                    onClick={() => selectFormulaColumn('AA', 'ទឹកប្រាក់បានបង់សរុប (Total Payments Received)')}
                    className={`py-2 px-2 border-r border-slate-400 font-bold cursor-pointer transition-colors select-none ${
                      selectedColumn === 'AA' ? 'bg-emerald-300 ring-2 ring-emerald-500' : 'bg-emerald-100/60 hover:bg-emerald-200'
                    }`}
                    title="ចុចដើម្បីកែប្រែរូបមន្តជួរឈរនេះ (Col AA)"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>ទឹកប្រាក់<br/>បានបង់សរុប</span>
                      <span className="text-[8px] bg-emerald-400/90 px-1 py-0.2 rounded font-mono font-black text-slate-900">fx</span>
                    </div>
                  </th>
                  <th 
                    rowSpan={2} 
                    onClick={() => selectFormulaColumn('AB', 'ទឹកប្រាក់ជំពាក់ចុងត្រា (Closing Outstanding Debt)')}
                    className={`py-2 px-2 border-r border-slate-400 font-bold text-red-950 cursor-pointer transition-colors select-none ${
                      selectedColumn === 'AB' ? 'bg-rose-300 ring-2 ring-rose-500' : 'bg-rose-100/70 hover:bg-rose-200'
                    }`}
                    title="ចុចដើម្បីកែប្រែរូបមន្តជួរឈរនេះ (Col AB)"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>ទឹកប្រាក់<br/>ជំពាក់ចុងត្រា</span>
                      <span className="text-[8px] bg-rose-400/90 px-1 py-0.2 rounded font-mono font-black text-slate-900">fx</span>
                    </div>
                  </th>
                  <th 
                    rowSpan={2} 
                    onClick={() => selectFormulaColumn('AC', 'ជំពាក់ចុងត្រាឆ្នាំចាស់ (Remaining Past Year Debt)')}
                    className={`py-2 px-1 border-r border-slate-400 cursor-pointer transition-colors select-none ${
                      selectedColumn === 'AC' ? 'bg-amber-300 ring-2 ring-amber-500' : 'hover:bg-amber-200'
                    }`}
                    title="ចុចដើម្បីកែប្រែរូបមន្តជួរឈរនេះ (Col AC)"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>ជំពាក់ចុងត្រា<br/>ឆ្នាំចាស់</span>
                      <span className="text-[8px] bg-amber-400/90 px-1 py-0.2 rounded font-mono font-black text-slate-900">fx</span>
                    </div>
                  </th>
                  <th 
                    rowSpan={2} 
                    onClick={() => selectFormulaColumn('AD', 'ជំពាក់ចុងត្រាឆមាស១ (Remaining First Semester Debt)')}
                    className={`py-2 px-1 border-r border-slate-400 cursor-pointer transition-colors select-none ${
                      selectedColumn === 'AD' ? 'bg-amber-300 ring-2 ring-amber-500' : 'hover:bg-amber-200'
                    }`}
                    title="ចុចដើម្បីកែប្រែរូបមន្តជួរឈរនេះ (Col AD)"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>ជំពាក់ចុងត្រា<br/>ឆមាស១</span>
                      <span className="text-[8px] bg-amber-400/90 px-1 py-0.2 rounded font-mono font-black text-slate-900">fx</span>
                    </div>
                  </th>
                  <th 
                    rowSpan={2} 
                    onClick={() => selectFormulaColumn('AE', 'ជំពាក់ចុងត្រាឆមាស២ (Remaining Second Semester Debt)')}
                    className={`py-2 px-1 border-r border-slate-400 cursor-pointer transition-colors select-none ${
                      selectedColumn === 'AE' ? 'bg-amber-300 ring-2 ring-amber-500' : 'hover:bg-amber-200'
                    }`}
                    title="ចុចដើម្បីកែប្រែរូបមន្តជួរឈរនេះ (Col AE)"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>ជំពាក់ចុងត្រា<br/>ឆមាស២</span>
                      <span className="text-[8px] bg-amber-400/90 px-1 py-0.2 rounded font-mono font-black text-slate-900">fx</span>
                    </div>
                  </th>
                  <th rowSpan={2} className="no-print py-2 px-1.5 text-center">សកម្មភាព</th>
                </tr>
                <tr className="text-[8.5px] border-b border-slate-400">
                  {/* បញ្ចុះតម្លៃក្នុង១ឆ្នាំ */}
                  <th className="py-1 px-1 border-r border-slate-400">%</th>
                  <th className="py-1 px-1 border-r border-slate-400">លើកទឹកចិត្ត</th>

                  {/* ទឹកប្រាក់ជំពាក់ឆ្នាំថ្មី */}
                  <th className="py-1 px-1 border-r border-slate-400">ឆមាសទី១</th>
                  <th className="py-1 px-1 border-r border-slate-400">ឆមាសទី២</th>

                  {/* លើកទី១ */}
                  <th className="py-1 px-1 border-r border-slate-400">កាលបរិច្ឆេទបង់ប្រាក់</th>
                  <th className="py-1 px-1.5 border-r border-slate-400 font-sans">លេខវិក្កយបត្រ</th>
                  <th className="py-1 px-1 border-r border-slate-400 font-bold">ទឹកប្រាក់បានបង់</th>

                  {/* លើកទី២ */}
                  <th className="py-1 px-1 border-r border-slate-400">កាលបរិច្ឆេទបង់ប្រាក់</th>
                  <th className="py-1 px-1.5 border-r border-slate-400 font-sans">លេខវិក្កយបត្រ</th>
                  <th className="py-1 px-1 border-r border-slate-400 font-bold">ទឹកប្រាក់បានបង់</th>

                  {/* លើកទី៣ */}
                  <th className="py-1 px-1 border-r border-slate-400">កាលបរិច្ឆេទបង់ប្រាក់</th>
                  <th className="py-1 px-1.5 border-r border-slate-400 font-sans">លេខវិក្កយបត្រ</th>
                  <th className="py-1 px-1 border-r border-slate-400 font-bold">ទឹកប្រាក់បានបង់</th>
                </tr>
              </thead>

              {/* Body Rows */}
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {groupByBranch ? (
                  groupedKhmerByBranch.map(bGroup => {
                    const isBranchCollapsed = collapsedBranches[bGroup.branchId];
                    return (
                      <React.Fragment key={bGroup.branchId}>
                        {renderKhmerBranchHeader(bGroup)}
                        {!isBranchCollapsed && (
                          <>
                            {groupByClass ? (
                              bGroup.classGroups.map(cGroup => {
                                const collapseKey = `${bGroup.branchId}_${cGroup.className}`;
                                const isClassCollapsed = collapsedClasses[collapseKey] ?? collapsedClasses[cGroup.className];
                                return (
                                  <React.Fragment key={cGroup.className}>
                                    {renderKhmerClassHeader(collapseKey, cGroup)}
                                    {!isClassCollapsed && (
                                      <>
                                        {cGroup.records.map((r, idx) => renderKhmerRow(r, idx))}
                                        {renderKhmerClassSubtotal(cGroup)}
                                      </>
                                    )}
                                  </React.Fragment>
                                );
                              })
                            ) : (
                              bGroup.records.map((r, idx) => renderKhmerRow(r, idx))
                            )}
                            {renderKhmerBranchSubtotal(bGroup)}
                          </>
                        )}
                      </React.Fragment>
                    );
                  })
                ) : groupByClass ? (
                  groupedKhmerList.map(group => {
                    const isClassCollapsed = collapsedClasses[group.className];
                    return (
                      <React.Fragment key={group.className}>
                        {renderKhmerClassHeader(group.className, group)}
                        {!isClassCollapsed && (
                          <>
                            {group.records.map((r, idx) => renderKhmerRow(r, idx))}
                            {renderKhmerClassSubtotal(group)}
                          </>
                        )}
                      </React.Fragment>
                    );
                  })
                ) : (
                  calculatedKhmerList.map((r, idx) => renderKhmerRow(r, idx))
                )}
              </tbody>

              {/* Totals Footer Matching Screenshot & PDF */}
              <tfoot className="bg-[#fff3a8] font-bold text-slate-900 border-t-2 border-slate-400 font-khmer text-[9px]">
                <tr>
                  <td colSpan={8} className="py-2.5 px-3 text-center border-r border-slate-400 text-xs">
                    ទឹកប្រាក់សរុប (Grand Total) ({filteredKhmer.length} សិស្ស)
                  </td>
                  <td className="py-2.5 px-1.5 text-right font-mono border-r border-slate-400">
                    ${formatAmount(khmerTotals.fullTuition)}
                  </td>
                  <td colSpan={2} className="py-2.5 px-1 text-center font-mono border-r border-slate-400">
                    -
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono bg-amber-200/70 border-r border-slate-400">
                    ${formatAmount(khmerTotals.amountPayable)}
                  </td>
                  <td className="py-2.5 px-1 text-right font-mono border-r border-slate-400">
                    {formatCurrency(khmerTotals.pastYearDue)}
                  </td>
                  <td className="py-2.5 px-1 text-right font-mono border-r border-slate-400">
                    ${formatAmount(khmerTotals.newYearSem1)}
                  </td>
                  <td className="py-2.5 px-1 text-right font-mono border-r border-slate-400">
                    ${formatAmount(khmerTotals.newYearSem2)}
                  </td>
                  <td className="py-2.5 px-1.5 text-right font-mono border-r border-slate-400">
                    ${formatAmount(khmerTotals.beginningBalanceDue)}
                  </td>

                  {/* លើកទី១ */}
                  <td colSpan={2} className="border-r border-slate-400 text-center">-</td>
                  <td className="py-2.5 px-1 text-right font-mono border-r border-slate-400">
                    ${formatAmount(khmerTotals.installment1)}
                  </td>

                  {/* លើកទី២ */}
                  <td colSpan={2} className="border-r border-slate-400 text-center">-</td>
                  <td className="py-2.5 px-1 text-right font-mono border-r border-slate-400">
                    {formatCurrency(khmerTotals.installment2)}
                  </td>

                  {/* លើកទី៣ */}
                  <td colSpan={2} className="border-r border-slate-400 text-center">-</td>
                  <td className="py-2.5 px-1 text-right font-mono border-r border-slate-400">
                    {formatCurrency(khmerTotals.installment3)}
                  </td>

                  {/* ទឹកប្រាក់បានបង់សរុប */}
                  <td className="py-2.5 px-2 text-right font-mono text-emerald-900 bg-emerald-200/80 border-r border-slate-400">
                    ${formatAmount(khmerTotals.totalPaid)}
                  </td>

                  {/* ទឹកប្រាក់ជំពាក់ចុងត្រា */}
                  <td className="py-2.5 px-1.5 text-right font-mono text-red-900 bg-rose-200/80 border-r border-slate-400">
                    ${formatAmount(khmerTotals.endingTotal)}
                  </td>

                  {/* ទឹកប្រាក់ជំពាក់ចុងត្រាឆ្នាំចាស់ */}
                  <td className="py-2.5 px-1 text-right font-mono border-r border-slate-400">
                    {formatCurrency(khmerTotals.endingPastYear)}
                  </td>

                  {/* ទឹកប្រាក់ជំពាក់ចុងត្រាឆមាស១ */}
                  <td className="py-2.5 px-1 text-right font-mono border-r border-slate-400">
                    ${formatAmount(khmerTotals.endingSem1)}
                  </td>

                  {/* ទឹកប្រាក់ជំពាក់ចុងត្រាឆមាស២ */}
                  <td className="py-2.5 px-1 text-right font-mono border-r border-slate-400">
                    ${formatAmount(khmerTotals.endingSem2)}
                  </td>

                  <td className="no-print"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer Signatures Matching Original PDF 2 */}
          <div className="mt-8 flex justify-between items-start text-xs font-khmer text-slate-800 px-8">
            <div className="text-center">
              <p className="font-semibold">បានឃើញ និងពិនិត្យត្រឹមត្រូវ</p>
              <p className="font-bold text-slate-900 mt-0.5">នាយកសាលា (School Director)</p>
              <div className="h-16 flex items-center justify-center italic text-slate-400 text-[11px]">[ហត្ថលេខា]</div>
              <p className="font-semibold text-slate-900">{selectedBranch.directorName}</p>
            </div>

            <div className="text-center">
              <p className="text-slate-600">ខេត្តសៀមរាប ថ្ងៃទី០១ ខែមិថុនា ឆ្នាំ២០២៦</p>
              <p className="font-bold text-slate-900 mt-0.5">បុគ្គលិកទទួលបន្ទុកបំណុល (Billing Officer)</p>
              <div className="h-16 flex items-center justify-center italic text-slate-400 text-[11px]">[ហត្ថលេខា]</div>
              <p className="font-semibold text-slate-900">ខុង សួស្តី</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🇬🇧 ENGLISH PROGRAM DUE REPORT (CORRECTED REFERRING TO ORIGINAL PDF 1)      */}
      {/* ========================================================================= */}
      {activeProgram === 'english' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-300 p-4 overflow-hidden print:p-0 print:border-none print:shadow-none">
          {/* Official Report Header */}
          <div className="text-center mb-4">
            <h2 className="text-base sm:text-lg font-black font-khmer text-slate-900 tracking-wide">
              បញ្ជីឈ្មោះសិស្សកម្មវិធីបណ្តុះបណ្តាលភាសាអង់គ្លេស កម្រិត {selectedClassEnglish === 'all' ? 'គ្រប់ថ្នាក់' : selectedClassEnglish} ជំពាក់ថ្លៃឈ្នួលសិក្សា ឆ្នាំសិក្សា{selectedYear}
            </h2>
            <p className="text-xs font-khmer text-slate-700 mt-0.5">
              គិតដល់ត្រឹម ថ្ងៃទី{cutoffDateKhmer}
            </p>
          </div>

          {/* Yellow Matrix Table for English Program Matching PDF 1 */}
          <div className="overflow-x-auto border border-slate-400">
            <table className="w-full text-left text-[9px] border-collapse whitespace-nowrap">
              {/* 3-Row Header Matching Original English PDF 1 */}
              <thead className="bg-[#fff3a8] text-slate-900 font-semibold font-khmer text-center border-b border-slate-400">
                {/* Header Row 1 */}
                <tr className="border-b border-slate-400">
                  <th rowSpan={3} className="py-2 px-1 border-r border-slate-400 w-7">ល-រ</th>
                  <th rowSpan={3} className="py-2 px-1.5 border-r border-slate-400">អត្តលេខសិស្ស</th>
                  <th rowSpan={3} className="py-2 px-2 border-r border-slate-400">ឈ្មោះ ជាភាសាខ្មែរ</th>
                  <th rowSpan={3} className="py-2 px-2 border-r border-slate-400 font-sans">ឈ្មោះ ជាភាសាឡាតាំង</th>
                  <th rowSpan={3} className="py-2 px-1 border-r border-slate-400">ភេទ</th>
                  <th rowSpan={3} className="py-2 px-1.5 border-r border-slate-400">ថ្ងៃ ខែ ឆ្នាំកំណើត</th>
                  <th rowSpan={3} className="py-2 px-1.5 border-r border-slate-400">ឆ្នាំសិក្សា</th>
                  <th rowSpan={3} className="py-2 px-1.5 border-r border-slate-400">ស្ថានភាព</th>
                  <th rowSpan={3} className="py-2 px-1.5 border-r border-slate-400">ថ្លៃឈ្នួលសិក្សា<br/>១ឆ្នាំ</th>
                  <th colSpan={2} rowSpan={2} className="py-1 px-1 border-r border-slate-400">បញ្ចុះតម្លៃ ក្នុង១ឆ្នាំ</th>
                  <th rowSpan={3} className="py-2 px-1.5 border-r border-slate-400">ការលើកទឹកចិត្ត</th>
                  <th colSpan={2} rowSpan={2} className="py-1 px-1.5 border-r border-slate-400 bg-amber-100/70 font-bold">ទឹកប្រាក់ត្រូវបង់</th>
                  <th colSpan={2} rowSpan={2} className="py-1 px-1.5 border-r border-slate-400">ទឹកប្រាក់ជំពាក់<br/>ឆ្នាំសិក្សាចាស់</th>
                  <th colSpan={8} className="py-1 px-2 border-r border-slate-400 bg-amber-50/50">ទឹកប្រាក់ជំពាក់ឆ្នាំថ្មី</th>
                  <th colSpan={2} rowSpan={2} className="py-1 px-1.5 border-r border-slate-400 font-bold">ទឹកប្រាក់ជំពាក់<br/>ដើមត្រាសរុបរួម</th>
                  <th colSpan={3} rowSpan={2} className="py-1 px-1.5 border-r border-slate-400 bg-sky-100/50">ព័ត៌មានការបង់ប្រាក់លើកទី១</th>
                  <th colSpan={3} rowSpan={2} className="py-1 px-1.5 border-r border-slate-400 bg-indigo-100/50">ព័ត៌មានការបង់ប្រាក់លើកទី២</th>
                  <th colSpan={2} rowSpan={2} className="py-1 px-1.5 border-r border-slate-400 bg-emerald-100/60 font-bold">ទឹកប្រាក់បានបង់សរុប</th>
                  <th colSpan={3} rowSpan={2} className="py-1 px-1.5 border-r border-slate-400 bg-rose-100/50 font-bold">ទឹកប្រាក់ជំពាក់<br/>ចុងត្រាសរុបរួម</th>
                  <th colSpan={2} rowSpan={2} className="py-1 px-1.5 border-r border-slate-400">ទឹកប្រាក់ជំពាក់ចុងត្រា<br/>ឆ្នាំសិក្សាចាស់</th>
                  <th colSpan={8} className="py-1 px-2 border-r border-slate-400">ទឹកប្រាក់ជំពាក់ចុងត្រាឆ្នាំថ្មី</th>
                  <th rowSpan={3} className="no-print py-2 px-1.5 text-center">សកម្មភាព</th>
                </tr>

                {/* Header Row 2 */}
                <tr className="border-b border-slate-400 text-[8.5px]">
                  {/* ទឹកប្រាក់ជំពាក់ឆ្នាំថ្មី */}
                  <th colSpan={2} className="py-0.5 px-1 border-r border-slate-400">ត្រីមាសទី១</th>
                  <th colSpan={2} className="py-0.5 px-1 border-r border-slate-400">ត្រីមាសទី២</th>
                  <th colSpan={2} className="py-0.5 px-1 border-r border-slate-400">ត្រីមាសទី៣</th>
                  <th colSpan={2} className="py-0.5 px-1 border-r border-slate-400">ត្រីមាសទី៤</th>

                  {/* ទឹកប្រាក់ជំពាក់ចុងត្រាឆ្នាំថ្មី */}
                  <th colSpan={2} className="py-0.5 px-1 border-r border-slate-400">ត្រីមាសទី១</th>
                  <th colSpan={2} className="py-0.5 px-1 border-r border-slate-400">ត្រីមាសទី២</th>
                  <th colSpan={2} className="py-0.5 px-1 border-r border-slate-400">ត្រីមាសទី៣</th>
                  <th colSpan={2} className="py-0.5 px-1 border-r border-slate-400">ត្រីមាសទី៤</th>
                </tr>

                {/* Header Row 3 */}
                <tr className="text-[8px] border-b border-slate-400">
                  {/* បញ្ចុះតម្លៃ ក្នុង១ឆ្នាំ */}
                  <th className="py-0.5 px-1 border-r border-slate-400">%</th>
                  <th 
                    onClick={() => selectFormulaColumn('P', 'ការលើកទឹកចិត្តសរុប (Total Annual Incentives)')}
                    className={`py-0.5 px-1 border-r border-slate-400 cursor-pointer transition-colors select-none ${
                      selectedColumn === 'P' ? 'bg-amber-300 ring-1 ring-amber-500' : 'hover:bg-amber-200'
                    }`}
                    title="ចុចដើម្បីមើល/កែប្រែរូបមន្ត [P]"
                  >
                    <div className="flex items-center justify-center gap-0.5">
                      <span>ការលើកទឹកចិត្ត</span>
                      <span className="text-[7.5px] bg-amber-400/90 px-0.5 rounded font-mono font-bold">fx</span>
                    </div>
                  </th>

                  {/* ទឹកប្រាក់ត្រូវបង់ (Col Q & R) */}
                  <th 
                    onClick={() => selectFormulaColumn('Q', 'ទឹកប្រាក់ត្រូវបង់-ថ្លៃឈ្នួល (Net Tuition Payable)')}
                    className={`py-0.5 px-1 border-r border-slate-400 font-bold cursor-pointer transition-colors select-none ${
                      selectedColumn === 'Q' ? 'bg-amber-300 ring-1 ring-amber-500' : 'hover:bg-amber-200'
                    }`}
                    title="ចុចដើម្បីមើល/កែប្រែរូបមន្ត [Q]"
                  >
                    <div className="flex items-center justify-center gap-0.5">
                      <span>ថ្លៃឈ្នួលសិក្សា</span>
                      <span className="text-[7.5px] bg-amber-400/90 px-0.5 rounded font-mono font-bold">fx</span>
                    </div>
                  </th>
                  <th 
                    onClick={() => selectFormulaColumn('R', 'ទឹកប្រាក់ត្រូវបង់-សេវារដ្ឋបាល (Admin Fee Payable)')}
                    className={`py-0.5 px-1 border-r border-slate-400 font-bold cursor-pointer transition-colors select-none ${
                      selectedColumn === 'R' ? 'bg-amber-300 ring-1 ring-amber-500' : 'hover:bg-amber-200'
                    }`}
                    title="ចុចដើម្បីមើល/កែប្រែរូបមន្ត [R]"
                  >
                    <div className="flex items-center justify-center gap-0.5">
                      <span>ថ្លៃសេវារដ្ឋបាល</span>
                      <span className="text-[7.5px] bg-amber-400/90 px-0.5 rounded font-mono font-bold">fx</span>
                    </div>
                  </th>

                  {/* ទឹកប្រាក់ជំពាក់ឆ្នាំសិក្សាចាស់ */}
                  <th className="py-0.5 px-1 border-r border-slate-400">ថ្លៃឈ្នួលសិក្សា</th>
                  <th className="py-0.5 px-1 border-r border-slate-400">ថ្លៃសេវារដ្ឋបាល</th>

                  {/* ទឹកប្រាក់ជំពាក់ឆ្នាំថ្មី - Q1..Q4 */}
                  <th className="py-0.5 px-1 border-r border-slate-400">ថ្លៃឈ្នួលសិក្សា</th>
                  <th className="py-0.5 px-1 border-r border-slate-400">ថ្លៃសេវារដ្ឋបាល</th>
                  <th className="py-0.5 px-1 border-r border-slate-400">ថ្លៃឈ្នួលសិក្សា</th>
                  <th className="py-0.5 px-1 border-r border-slate-400">ថ្លៃសេវារដ្ឋបាល</th>
                  <th className="py-0.5 px-1 border-r border-slate-400">ថ្លៃឈ្នួលសិក្សា</th>
                  <th className="py-0.5 px-1 border-r border-slate-400">ថ្លៃសេវារដ្ឋបាល</th>
                  <th className="py-0.5 px-1 border-r border-slate-400">ថ្លៃឈ្នួលសិក្សា</th>
                  <th className="py-0.5 px-1 border-r border-slate-400">ថ្លៃសេវារដ្ឋបាល</th>

                  {/* ទឹកប្រាក់ជំពាក់ដើមត្រាសរុបរួម (Col AC & AD) */}
                  <th 
                    onClick={() => selectFormulaColumn('AC', 'ជំពាក់ដើមត្រាសរុបរួម-ថ្លៃឈ្នួល (Opening Tuition Debt)')}
                    className={`py-0.5 px-1 border-r border-slate-400 font-bold cursor-pointer transition-colors select-none ${
                      selectedColumn === 'AC' ? 'bg-amber-300 ring-1 ring-amber-500' : 'hover:bg-amber-200'
                    }`}
                    title="ចុចដើម្បីមើល/កែប្រែរូបមន្ត [AC]"
                  >
                    <div className="flex items-center justify-center gap-0.5">
                      <span>ថ្លៃឈ្នួលសិក្សា</span>
                      <span className="text-[7.5px] bg-amber-400/90 px-0.5 rounded font-mono font-bold">fx</span>
                    </div>
                  </th>
                  <th 
                    onClick={() => selectFormulaColumn('AD', 'ជំពាក់ដើមត្រាសរុបរួម-សេវារដ្ឋបាល (Opening Admin Debt)')}
                    className={`py-0.5 px-1 border-r border-slate-400 font-bold cursor-pointer transition-colors select-none ${
                      selectedColumn === 'AD' ? 'bg-amber-300 ring-1 ring-amber-500' : 'hover:bg-amber-200'
                    }`}
                    title="ចុចដើម្បីមើល/កែប្រែរូបមន្ត [AD]"
                  >
                    <div className="flex items-center justify-center gap-0.5">
                      <span>ថ្លៃសេវារដ្ឋបាល</span>
                      <span className="text-[7.5px] bg-amber-400/90 px-0.5 rounded font-mono font-bold">fx</span>
                    </div>
                  </th>

                  {/* លើកទី១ */}
                  <th className="py-0.5 px-1 border-r border-slate-400">កាលបរិច្ឆេទបង់ប្រាក់</th>
                  <th className="py-0.5 px-1 border-r border-slate-400 font-sans">លេខវិក្កយបត្រ</th>
                  <th className="py-0.5 px-1 border-r border-slate-400">ទឹកប្រាក់បានបង់</th>

                  {/* លើកទី២ */}
                  <th className="py-0.5 px-1 border-r border-slate-400">កាលបរិច្ឆេទបង់ប្រាក់</th>
                  <th className="py-0.5 px-1 border-r border-slate-400 font-sans">លេខវិក្កយបត្រ</th>
                  <th className="py-0.5 px-1 border-r border-slate-400">ទឹកប្រាក់បានបង់</th>

                  {/* ទឹកប្រាក់បានបង់សរុប (Col AQ & AR) */}
                  <th 
                    onClick={() => selectFormulaColumn('AQ', 'ទឹកប្រាក់បានបង់សរុប-ថ្លៃឈ្នួល (Total Tuition Paid)')}
                    className={`py-0.5 px-1 border-r border-slate-400 font-bold cursor-pointer transition-colors select-none ${
                      selectedColumn === 'AQ' ? 'bg-emerald-300 ring-1 ring-emerald-500' : 'hover:bg-emerald-200'
                    }`}
                    title="ចុចដើម្បីមើល/កែប្រែរូបមន្ត [AQ]"
                  >
                    <div className="flex items-center justify-center gap-0.5">
                      <span>ថ្លៃឈ្នួលសិក្សា</span>
                      <span className="text-[7.5px] bg-emerald-400/90 px-0.5 rounded font-mono font-bold">fx</span>
                    </div>
                  </th>
                  <th 
                    onClick={() => selectFormulaColumn('AR', 'ទឹកប្រាក់បានបង់សរុប-សេវារដ្ឋបាល (Total Admin Paid)')}
                    className={`py-0.5 px-1 border-r border-slate-400 font-bold cursor-pointer transition-colors select-none ${
                      selectedColumn === 'AR' ? 'bg-emerald-300 ring-1 ring-emerald-500' : 'hover:bg-emerald-200'
                    }`}
                    title="ចុចដើម្បីមើល/កែប្រែរូបមន្ត [AR]"
                  >
                    <div className="flex items-center justify-center gap-0.5">
                      <span>ថ្លៃសេវារដ្ឋបាល</span>
                      <span className="text-[7.5px] bg-emerald-400/90 px-0.5 rounded font-mono font-bold">fx</span>
                    </div>
                  </th>

                  {/* ទឹកប្រាក់ជំពាក់ចុងត្រាសរុបរួម (Col AS & AT & AU) */}
                  <th 
                    onClick={() => selectFormulaColumn('AS', 'ជំពាក់ចុងត្រាសរុបរួម-ថ្លៃឈ្នួល (Closing Tuition Debt)')}
                    className={`py-0.5 px-1 border-r border-slate-400 font-bold cursor-pointer transition-colors select-none ${
                      selectedColumn === 'AS' ? 'bg-rose-300 ring-1 ring-rose-500' : 'hover:bg-rose-200'
                    }`}
                    title="ចុចដើម្បីមើល/កែប្រែរូបមន្ត [AS]"
                  >
                    <div className="flex items-center justify-center gap-0.5">
                      <span>ថ្លៃឈ្នួលសិក្សា</span>
                      <span className="text-[7.5px] bg-rose-400/90 px-0.5 rounded font-mono font-bold">fx</span>
                    </div>
                  </th>
                  <th 
                    onClick={() => selectFormulaColumn('AT', 'ជំពាក់ចុងត្រាសរុបរួម-សេវារដ្ឋបាល (Closing Admin Debt)')}
                    className={`py-0.5 px-1 border-r border-slate-400 font-bold cursor-pointer transition-colors select-none ${
                      selectedColumn === 'AT' ? 'bg-rose-300 ring-1 ring-rose-500' : 'hover:bg-rose-200'
                    }`}
                    title="ចុចដើម្បីមើល/កែប្រែរូបមន្ត [AT]"
                  >
                    <div className="flex items-center justify-center gap-0.5">
                      <span>ថ្លៃសេវារដ្ឋបាល</span>
                      <span className="text-[7.5px] bg-rose-400/90 px-0.5 rounded font-mono font-bold">fx</span>
                    </div>
                  </th>
                  <th 
                    onClick={() => selectFormulaColumn('AU', 'សូចនាករបំណុល (Debtor Status Flag)')}
                    className={`py-0.5 px-1 border-r border-slate-400 cursor-pointer transition-colors select-none ${
                      selectedColumn === 'AU' ? 'bg-amber-300 ring-1 ring-amber-500' : 'hover:bg-amber-200'
                    }`}
                    title="ចុចដើម្បីមើល/កែប្រែរូបមន្ត [AU]"
                  >
                    <div className="flex items-center justify-center gap-0.5">
                      <span>ចំនួនដង</span>
                      <span className="text-[7.5px] bg-amber-400/90 px-0.5 rounded font-mono font-bold">fx</span>
                    </div>
                  </th>

                  {/* ទឹកប្រាក់ជំពាក់ចុងត្រាឆ្នាំសិក្សាចាស់ */}
                  <th className="py-0.5 px-1 border-r border-slate-400">ថ្លៃឈ្នួលសិក្សា</th>
                  <th className="py-0.5 px-1 border-r border-slate-400">ថ្លៃសេវារដ្ឋបាល</th>

                  {/* ទឹកប្រាក់ជំពាក់ចុងត្រាឆ្នាំថ្មី - Q1..Q4 */}
                  <th className="py-0.5 px-1 border-r border-slate-400">ថ្លៃឈ្នួលសិក្សា</th>
                  <th className="py-0.5 px-1 border-r border-slate-400">ថ្លៃសេវារដ្ឋបាល</th>
                  <th className="py-0.5 px-1 border-r border-slate-400">ថ្លៃឈ្នួលសិក្សា</th>
                  <th className="py-0.5 px-1 border-r border-slate-400">ថ្លៃសេវារដ្ឋបាល</th>
                  <th className="py-0.5 px-1 border-r border-slate-400">ថ្លៃឈ្នួលសិក្សា</th>
                  <th className="py-0.5 px-1 border-r border-slate-400">ថ្លៃសេវារដ្ឋបាល</th>
                  <th className="py-0.5 px-1 border-r border-slate-400">ថ្លៃឈ្នួលសិក្សា</th>
                  <th className="py-0.5 px-1 border-r border-slate-400">ថ្លៃសេវារដ្ឋបាល</th>
                </tr>
              </thead>

              {/* Body Rows */}
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {groupByBranch ? (
                  groupedEnglishByBranch.map(bGroup => {
                    const isBranchCollapsed = collapsedBranches[bGroup.branchId];
                    return (
                      <React.Fragment key={bGroup.branchId}>
                        {renderEnglishBranchHeader(bGroup)}
                        {!isBranchCollapsed && (
                          <>
                            {groupByClass ? (
                              bGroup.classGroups.map(cGroup => {
                                const collapseKey = `${bGroup.branchId}_${cGroup.className}`;
                                const isClassCollapsed = collapsedClasses[collapseKey] ?? collapsedClasses[cGroup.className];
                                return (
                                  <React.Fragment key={cGroup.className}>
                                    {renderEnglishClassHeader(collapseKey, cGroup)}
                                    {!isClassCollapsed && (
                                      <>
                                        {cGroup.records.map((r, idx) => renderEnglishRow(r, idx))}
                                        {renderEnglishClassSubtotal(cGroup)}
                                      </>
                                    )}
                                  </React.Fragment>
                                );
                              })
                            ) : (
                              bGroup.records.map((r, idx) => renderEnglishRow(r, idx))
                            )}
                            {renderEnglishBranchSubtotal(bGroup)}
                          </>
                        )}
                      </React.Fragment>
                    );
                  })
                ) : groupByClass ? (
                  groupedEnglishList.map(group => {
                    const isClassCollapsed = collapsedClasses[group.className];
                    return (
                      <React.Fragment key={group.className}>
                        {renderEnglishClassHeader(group.className, group)}
                        {!isClassCollapsed && (
                          <>
                            {group.records.map((r, idx) => renderEnglishRow(r, idx))}
                            {renderEnglishClassSubtotal(group)}
                          </>
                        )}
                      </React.Fragment>
                    );
                  })
                ) : (
                  calculatedEnglishList.map((r, idx) => renderEnglishRow(r, idx))
                )}
              </tbody>

              {/* Totals Footer Matching Original English PDF 1 Exactly */}
              <tfoot className="bg-[#fff3a8] font-bold text-slate-900 border-t-2 border-slate-400 font-khmer text-[8.5px]">
                <tr>
                  <td colSpan={8} className="py-2 px-2 text-center border-r border-slate-400 text-xs">
                    ទឹកប្រាក់សរុប
                  </td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    {formatCurrency(englishTotals.fullTuition)}
                  </td>
                  <td className="border-r border-slate-400 text-center">-</td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    {formatCurrency(englishTotals.annualIncentive)}
                  </td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    {formatCurrency(englishTotals.incentive)}
                  </td>
                  <td className="py-2 px-1.5 text-right font-mono bg-amber-200/70 border-r border-slate-400">
                    {formatCurrency(englishTotals.amountPayableTuition)}
                  </td>
                  <td className="py-2 px-1.5 text-right font-mono bg-amber-200/50 border-r border-slate-400">
                    {formatCurrency(englishTotals.amountPayableAdminFee)}
                  </td>

                  {/* ជំពាក់ឆ្នាំចាស់ */}
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    {formatCurrency(englishTotals.pastYearTuition)}
                  </td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    {formatCurrency(englishTotals.pastYearAdmin)}
                  </td>

                  {/* ជំពាក់ឆ្នាំថ្មី - Q1..Q4 */}
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    {formatCurrency(englishTotals.begQ1Tuition)}
                  </td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    {formatCurrency(englishTotals.begQ1Admin)}
                  </td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    {formatCurrency(englishTotals.begQ2Tuition)}
                  </td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    {formatCurrency(englishTotals.begQ2Admin)}
                  </td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    {formatCurrency(englishTotals.begQ3Tuition)}
                  </td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    {formatCurrency(englishTotals.begQ3Admin)}
                  </td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    {formatCurrency(englishTotals.begQ4Tuition)}
                  </td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    {formatCurrency(englishTotals.begQ4Admin)}
                  </td>

                  {/* ដើមត្រាសរុបរួម */}
                  <td className="py-2 px-1 text-right font-mono font-bold border-r border-slate-400">
                    {formatCurrency(englishTotals.begNewYearTuition)}
                  </td>
                  <td className="py-2 px-1 text-right font-mono font-bold border-r border-slate-400">
                    {formatCurrency(englishTotals.begNewYearAdmin)}
                  </td>

                  {/* លើកទី១ */}
                  <td colSpan={2} className="border-r border-slate-400 text-center">-</td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400 text-emerald-800">
                    {formatCurrency(englishTotals.inst1Amount)}
                  </td>

                  {/* លើកទី២ */}
                  <td colSpan={2} className="border-r border-slate-400 text-center">-</td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400 text-emerald-800">
                    {formatCurrency(englishTotals.inst2Amount)}
                  </td>

                  {/* ទឹកប្រាក់បានបង់សរុប */}
                  <td className="py-2 px-1 text-right font-mono text-emerald-900 bg-emerald-200/80 border-r border-slate-400">
                    {formatCurrency(englishTotals.totPaidTuition)}
                  </td>
                  <td className="py-2 px-1 text-right font-mono text-emerald-900 bg-emerald-200/80 border-r border-slate-400">
                    {formatCurrency(englishTotals.totPaidAdmin)}
                  </td>

                  {/* ទឹកប្រាក់ជំពាក់ចុងត្រាសរុបរួម */}
                  <td className="py-2 px-1 text-right font-mono font-bold text-rose-900 bg-rose-200/80 border-r border-slate-400">
                    {formatCurrency(englishTotals.endTotalTuition)}
                  </td>
                  <td className="py-2 px-1 text-right font-mono font-bold text-rose-900 bg-rose-200/80 border-r border-slate-400">
                    {formatCurrency(englishTotals.endTotalAdmin)}
                  </td>
                  <td className="py-2 px-1 text-center font-mono border-r border-slate-400 font-bold">
                    {englishTotals.paymentCount}
                  </td>

                  {/* ជំពាក់ចុងត្រាឆ្នាំសិក្សាចាស់ */}
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    {formatCurrency(englishTotals.endPastYearTuition)}
                  </td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    {formatCurrency(englishTotals.endPastYearAdmin)}
                  </td>

                  {/* ជំពាក់ចុងត្រាឆ្នាំថ្មី (Q1..Q4) */}
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    {formatCurrency(englishTotals.endQ1Tuition)}
                  </td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    {formatCurrency(englishTotals.endQ1Admin)}
                  </td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    {formatCurrency(englishTotals.endQ2Tuition)}
                  </td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    {formatCurrency(englishTotals.endQ2Admin)}
                  </td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    {formatCurrency(englishTotals.endQ3Tuition)}
                  </td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    {formatCurrency(englishTotals.endQ3Admin)}
                  </td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    {formatCurrency(englishTotals.endQ4Tuition)}
                  </td>
                  <td className="py-2 px-1 text-right font-mono border-r border-slate-400">
                    {formatCurrency(englishTotals.endQ4Admin)}
                  </td>
                  <td className="no-print"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer Signatures Matching Original PDF 1 */}
          <div className="mt-8 flex justify-between items-start text-xs font-khmer text-slate-800 px-8">
            <div className="text-center">
              <p className="font-semibold">បានឃើញ និងពិនិត្យត្រឹមត្រូវ</p>
              <p className="font-bold text-slate-900 mt-0.5">នាយកសាលា (School Director)</p>
              <div className="h-16 flex items-center justify-center italic text-slate-400 text-[11px]">[ហត្ថលេខា]</div>
              <p className="font-semibold text-slate-900">{selectedBranch.directorName}</p>
            </div>

            <div className="text-center">
              <p className="text-slate-600">ខេត្តសៀមរាប ថ្ងៃទី០១ ខែមិថុនា ឆ្នាំ២០២៦</p>
              <p className="font-bold text-slate-900 mt-0.5">បុគ្គលិកទទួលបន្ទុកបំណុល (Billing Officer)</p>
              <div className="h-16 flex items-center justify-center italic text-slate-400 text-[11px]">[ហត្ថលេខា]</div>
              <p className="font-semibold text-slate-900">ឌីក ស្រី</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🛠️ FORMULA MANAGER MODAL DIALOG (ផ្ទាំងគ្រប់គ្រង និងកែសម្រួលរូបមន្ត EXCEL)    */}
      {/* ========================================================================= */}
      {showFormulaManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm font-khmer flex items-center gap-2">
                    <span>គ្រប់គ្រង និងកែសម្រួលរូបមន្តគណនាក្នុងតារាង (Formula Manager)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500 text-slate-950">
                      {activeProgram === 'khmer' ? 'Khmer Program' : 'English Program'}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Define and customize dynamic Excel-like formulas for tuition, opening debt, payments, and closing balances.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowFormulaManager(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
              {/* Top Banner Notice */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3 text-blue-900">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold font-khmer">
                    របៀបប្រើប្រាស់រូបមន្ត (Excel Formula Syntax Guide)៖
                  </p>
                  <p className="text-[11px] text-blue-800 font-khmer leading-relaxed">
                    អ្នកអាចសរសេររូបមន្តដោយចាប់ផ្តើមដោយសញ្ញា <code className="bg-blue-100 px-1 py-0.5 rounded font-mono font-bold">=</code> និងប្រើប្រាស់អក្សរតំណាងជួរឈរ (Column References) ដូចជា <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">I, K, J, L, M, Q, AA, AB</code> ឬអនុគមន៍ Excel ស្តង់ដារដូចជា <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">SUM(), ROUND(), IF(), MAX(), MIN(), OR(), AND()</code>។
                  </p>
                </div>
              </div>

              {/* Active Formulas Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 font-khmer flex items-center gap-2">
                    <Table className="w-4 h-4 text-slate-600" />
                    <span>បញ្ជីរូបមន្តតាមជួរឈរ (Configurable Columns)</span>
                  </h4>
                  <button
                    onClick={resetAllFormulas}
                    className="px-2.5 py-1 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg font-khmer font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>កំណត់រូបមន្តដើមឡើងវិញទាំងអស់ (Reset All to Defaults)</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200">
                  {(activeProgram === 'khmer' ? KHMER_FORMULA_COLUMNS : ENGLISH_FORMULA_COLUMNS).map((item) => {
                    const currentFormula = (activeProgram === 'khmer' ? khmerFormulas : englishFormulas)[item.key] || item.defaultFormula;
                    const val = validateFormula(currentFormula);

                    return (
                      <div key={item.key} className="p-3 bg-white hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="min-w-[200px]">
                          <div className="flex items-center gap-1.5">
                            <span className="w-6 h-6 rounded bg-amber-100 text-amber-900 font-mono font-bold text-xs flex items-center justify-center border border-amber-300">
                              {item.key}
                            </span>
                            <span className="font-bold font-khmer text-slate-900">{item.name}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-sans mt-0.5">{item.desc}</p>
                          <p className="text-[10px] text-slate-400 font-khmer italic">{item.hint}</p>
                        </div>

                        {/* Formula Input Box */}
                        <div className="flex-1 max-w-xl flex items-center gap-2">
                          <div className="relative flex-1">
                            <input
                              type="text"
                              value={currentFormula}
                              onChange={(e) => {
                                const newF = e.target.value;
                                if (activeProgram === 'khmer') {
                                  setKhmerFormulas(prev => ({ ...prev, [item.key]: newF }));
                                } else {
                                  setEnglishFormulas(prev => ({ ...prev, [item.key]: newF }));
                                }
                              }}
                              className={`w-full h-8 px-2.5 font-mono text-xs rounded-lg border focus:outline-none ${
                                val.valid ? 'border-slate-300 bg-slate-50 text-emerald-700 focus:ring-1 focus:ring-blue-500' : 'border-rose-300 bg-rose-50 text-rose-700'
                              }`}
                            />
                            {val.valid ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 absolute right-2.5 top-2.5" />
                            ) : (
                              <AlertCircle className="w-3.5 h-3.5 text-rose-500 absolute right-2.5 top-2.5" />
                            )}
                          </div>

                          {/* Quick Reset to Default for this column */}
                          <button
                            onClick={() => {
                              resetFormulaToDefault(item.key);
                            }}
                            className="h-8 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer text-[10px] font-mono shrink-0"
                            title="ត្រឡប់ទៅរូបមន្តដើម"
                          >
                            Default
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Supported Functions Cheat-Sheet */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-[11px]">
                <h4 className="font-bold text-slate-800 font-khmer flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-slate-600" />
                  <span>អនុគមន៍ Excel ដែលគាំទ្រ (Supported Functions)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-slate-700 font-mono text-[10.5px]">
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <b className="text-blue-700">ROUND(val, digits)</b>
                    <p className="text-[10px] text-slate-500 font-khmer">កាត់តម្រឹមទសភាគ</p>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <b className="text-blue-700">IF(condition, t, f)</b>
                    <p className="text-[10px] text-slate-500 font-khmer">លក្ខខណ្ឌបើ...នោះ</p>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <b className="text-blue-700">SUM(val1, val2, ...)</b>
                    <p className="text-[10px] text-slate-500 font-khmer">បូកសរុបតម្លៃ</p>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <b className="text-blue-700">MAX(a, b) / MIN(a, b)</b>
                    <p className="text-[10px] text-slate-500 font-khmer">តម្លៃធំបំផុត/តូចបំផុត</p>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <b className="text-blue-700">ROUNDUP(val, digits)</b>
                    <p className="text-[10px] text-slate-500 font-khmer">បង្គត់ឡើងលើ</p>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <b className="text-blue-700">OR(a, b) / AND(a, b)</b>
                    <p className="text-[10px] text-slate-500 font-khmer">តក្កវិជ្ជា និង/ឬ</p>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <b className="text-blue-700">COUNTA(range)</b>
                    <p className="text-[10px] text-slate-500 font-khmer">រាប់ចំនួនកោសិកា</p>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <b className="text-blue-700">Operators: +, -, *, /, %, ^</b>
                    <p className="text-[10px] text-slate-500 font-khmer">ប្រមាណវិធីគណិតវិទ្យា</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-khmer">
                ការផ្លាស់ប្តូររូបមន្ត នឹងត្រូវគណនាឡើងវិញដោយស្វ័យប្រវត្តិលើតារាងភ្លាមៗ។
              </span>
              <button
                onClick={() => {
                  setShowFormulaManager(false);
                  setFormulaSuccessToast('បានរក្សាទុករូបមន្តដោយជោគជ័យ!');
                  setTimeout(() => setFormulaSuccessToast(null), 3000);
                }}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span className="font-khmer">បិទផ្ទាំង (Done)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sync Summary Dialog Modal */}
      {syncSummaryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-sky-300" />
                <h3 className="font-bold text-sm font-khmer">សេចក្តីសង្ខេបការ Sync ទិន្នន័យសិស្ស</h3>
              </div>
              <button
                onClick={() => setSyncSummaryModal(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-5 space-y-3.5 text-xs">
              <p className="text-slate-600 font-khmer">
                ប្រព័ន្ធបានធ្វើសមកាលកម្មទិន្នន័យរវាងបញ្ជីសិស្សទូទៅ (Central Directory) និងតារាងតាមដានបំណុល (Due Reports) រួចរាល់ដោយជោគជ័យ៖
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <span className="text-[10px] text-blue-600 font-khmer block">សិស្សសរុបបានត្រួតពិនិត្យ</span>
                  <span className="text-lg font-bold font-mono text-blue-900">{syncSummaryModal.syncedCount}</span>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="text-[10px] text-emerald-600 font-khmer block">បញ្ចូលក្នុងកម្មវិធីខ្មែរថ្មី</span>
                  <span className="text-lg font-bold font-mono text-emerald-900">+{syncSummaryModal.newAddedKhmer}</span>
                </div>
                <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl">
                  <span className="text-[10px] text-sky-600 font-khmer block">បញ្ចូលក្នុងកម្មវិធីអង់គ្លេសថ្មី</span>
                  <span className="text-lg font-bold font-mono text-sky-900">+{syncSummaryModal.newAddedEnglish}</span>
                </div>
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                  <span className="text-[10px] text-purple-600 font-khmer block">ចុះឈ្មោះចូលបញ្ជីសិស្ស</span>
                  <span className="text-lg font-bold font-mono text-purple-900">+{syncSummaryModal.newAddedToStudents}</span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500 font-khmer">
                💡 ព័ត៌មានប្រវត្តិរូបសិស្ស សាខា និងថ្នាក់ត្រូវបានផ្គូផ្គងដោយស្វ័យប្រវត្តិតាម Student ID (អត្តលេខ) និងឈ្មោះ។
              </div>
            </div>

            <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSyncSummaryModal(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors font-khmer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>យល់ព្រម (OK)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
