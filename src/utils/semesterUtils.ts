import { PaymentInvoice, SemesterDateConfig, SystemSettings } from '../types';
import { KhmerDueRecord, EnglishDueRecord } from '../types/dueReport';
import { DEFAULT_SEMESTER_CONFIGS } from '../data/seedData';

/**
 * Returns the active or specified academic year's semester configuration.
 */
export function getSemesterConfig(
  settings: SystemSettings, 
  academicYear?: string
): SemesterDateConfig {
  const targetYear = academicYear || settings.activeAcademicYear || '2025-2026';
  
  if (settings.semesterConfigs && settings.semesterConfigs[targetYear]) {
    return settings.semesterConfigs[targetYear];
  }

  if (DEFAULT_SEMESTER_CONFIGS[targetYear]) {
    return DEFAULT_SEMESTER_CONFIGS[targetYear];
  }

  // Fallback heuristic based on academic year string (e.g. "2025-2026")
  const startYear = parseInt(targetYear.slice(0, 4), 10) || 2025;
  const endYear = startYear + 1;
  return {
    academicYear: targetYear,
    semester1StartDate: `${startYear}-10-01`,
    semester1EndDate: `${endYear}-02-28`,
    semester2StartDate: `${endYear}-03-01`,
    semester2EndDate: `${endYear}-07-31`,
    notes: 'ប្រតិទិនស្វ័យប្រវត្តិតាមឆ្នាំសិក្សា'
  };
}

export type SemesterFilterType = 'all' | 'semester1' | 'semester2';

/**
 * Determines whether a payment invoice belongs to Semester 1, Semester 2, or Annual/Other
 * based on date ranges and fallback term strings.
 */
export function classifyInvoiceSemester(
  invoice: PaymentInvoice,
  config: SemesterDateConfig
): 'semester1' | 'semester2' | 'annual' | 'other' {
  const dateToCheck = invoice.issuedDate || invoice.startDate || invoice.createdAt?.split('T')[0];

  // 1. Primary check: Exact date within configured ranges
  if (dateToCheck) {
    if (dateToCheck >= config.semester1StartDate && dateToCheck <= config.semester1EndDate) {
      return 'semester1';
    }
    if (dateToCheck >= config.semester2StartDate && dateToCheck <= config.semester2EndDate) {
      return 'semester2';
    }
  }

  // 2. Secondary check: Term & Payment Type keywords
  const descriptor = `${invoice.paymentType || ''} ${invoice.title || ''} ${invoice.description || ''}`.toLowerCase();
  
  if (
    descriptor.includes('ឆមាសទី១') || 
    descriptor.includes('ឆមាស១') || 
    descriptor.includes('semester 1') || 
    descriptor.includes('sem 1') || 
    descriptor.includes('ត្រីមាសទី១') || 
    descriptor.includes('ត្រីមាសទី២') ||
    descriptor.includes('quarter 1') ||
    descriptor.includes('quarter 2')
  ) {
    return 'semester1';
  }

  if (
    descriptor.includes('ឆមាសទី២') || 
    descriptor.includes('ឆមាស២') || 
    descriptor.includes('semester 2') || 
    descriptor.includes('sem 2') || 
    descriptor.includes('ត្រីមាសទី៣') || 
    descriptor.includes('ត្រីមាសទី៤') ||
    descriptor.includes('quarter 3') ||
    descriptor.includes('quarter 4')
  ) {
    return 'semester2';
  }

  if (descriptor.includes('ប្រចាំឆ្នាំ') || descriptor.includes('annual') || descriptor.includes('full year')) {
    return 'annual';
  }

  return 'other';
}

/**
 * Checks if an invoice matches the selected semester filter.
 */
export function matchesSemesterFilter(
  invoice: PaymentInvoice,
  filter: SemesterFilterType,
  config: SemesterDateConfig
): boolean {
  if (filter === 'all') return true;
  const classification = classifyInvoiceSemester(invoice, config);
  if (classification === filter) return true;
  // If annual payment, it applies across both semesters
  if (classification === 'annual') return true;
  return false;
}

/**
 * Computes Income (ចំណូល) and Debt (បំណុល) metrics partitioned by Semester 1 and Semester 2.
 */
export function calculateSemesterFinancialPartition(
  payments: PaymentInvoice[],
  config: SemesterDateConfig
) {
  let sem1Income = 0;
  let sem1Debt = 0;
  let sem1InvoicesCount = 0;

  let sem2Income = 0;
  let sem2Debt = 0;
  let sem2InvoicesCount = 0;

  let annualIncome = 0;
  let annualDebt = 0;
  let annualInvoicesCount = 0;

  let otherIncome = 0;
  let otherDebt = 0;

  payments.forEach(p => {
    const classification = classifyInvoiceSemester(p, config);
    const paid = p.paidUSD || 0;
    const debt = p.owedRemain || 0;

    if (classification === 'semester1') {
      sem1Income += paid;
      sem1Debt += debt;
      sem1InvoicesCount += 1;
    } else if (classification === 'semester2') {
      sem2Income += paid;
      sem2Debt += debt;
      sem2InvoicesCount += 1;
    } else if (classification === 'annual') {
      annualIncome += paid;
      annualDebt += debt;
      annualInvoicesCount += 1;
      // Pro-rate annual revenue/debt 50% to S1 and 50% to S2 for accurate semester reporting
      sem1Income += paid * 0.5;
      sem1Debt += debt * 0.5;
      sem2Income += paid * 0.5;
      sem2Debt += debt * 0.5;
    } else {
      otherIncome += paid;
      otherDebt += debt;
    }
  });

  const totalIncome = sem1Income + sem2Income - (annualIncome); // adjusted total
  const totalDebt = sem1Debt + sem2Debt - (annualDebt);

  return {
    semester1: {
      incomeUSD: sem1Income,
      incomeKHR: sem1Income * 4100,
      debtUSD: sem1Debt,
      debtKHR: sem1Debt * 4100,
      invoicesCount: sem1InvoicesCount,
      startDate: config.semester1StartDate,
      endDate: config.semester1EndDate,
      labelKhmer: 'ឆមាសទី១',
      labelEnglish: 'Semester 1'
    },
    semester2: {
      incomeUSD: sem2Income,
      incomeKHR: sem2Income * 4100,
      debtUSD: sem2Debt,
      debtKHR: sem2Debt * 4100,
      invoicesCount: sem2InvoicesCount,
      startDate: config.semester2StartDate,
      endDate: config.semester2EndDate,
      labelKhmer: 'ឆមាសទី២',
      labelEnglish: 'Semester 2'
    },
    annual: {
      incomeUSD: annualIncome,
      debtUSD: annualDebt,
      invoicesCount: annualInvoicesCount
    },
    total: {
      incomeUSD: totalIncome + otherIncome,
      incomeKHR: (totalIncome + otherIncome) * 4100,
      debtUSD: totalDebt + otherDebt,
      debtKHR: (totalDebt + otherDebt) * 4100,
      invoicesCount: payments.length
    }
  };
}

/**
 * Calculates current semester status relative to today's date.
 */
export function getCurrentSemesterStatus(config: SemesterDateConfig) {
  const today = new Date().toISOString().split('T')[0];

  if (today >= config.semester1StartDate && today <= config.semester1EndDate) {
    return {
      status: 'semester1',
      labelKhmer: 'កំពុងដំណើរការឆមាសទី១',
      labelEnglish: 'Semester 1 In Progress',
      color: 'blue',
      activeConfigDate: `${formatKhmerDate(config.semester1StartDate)} ដល់ ${formatKhmerDate(config.semester1EndDate)}`
    };
  }

  if (today >= config.semester2StartDate && today <= config.semester2EndDate) {
    return {
      status: 'semester2',
      labelKhmer: 'កំពុងដំណើរការឆមាសទី២',
      labelEnglish: 'Semester 2 In Progress',
      color: 'emerald',
      activeConfigDate: `${formatKhmerDate(config.semester2StartDate)} ដល់ ${formatKhmerDate(config.semester2EndDate)}`
    };
  }

  if (today < config.semester1StartDate) {
    return {
      status: 'pre_sem1',
      labelKhmer: 'មុនបើកបវេសនកាលឆមាសទី១',
      labelEnglish: 'Pre-Semester 1 Admission',
      color: 'amber',
      activeConfigDate: `ចាប់ផ្ដើម ${formatKhmerDate(config.semester1StartDate)}`
    };
  }

  return {
    status: 'vacation',
    labelKhmer: 'វិស្សមកាល / សម្រាកបញ្ចប់ឆ្នាំ',
    labelEnglish: 'School Year-End Vacation',
    color: 'slate',
    activeConfigDate: `បញ្ចប់ត្រឹម ${formatKhmerDate(config.semester2EndDate)}`
  };
}

/**
 * Format YYYY-MM-DD into readable Khmer format (DD-ខែ-YYYY or DD/MM/YYYY)
 */
export function formatKhmerDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

/**
 * Computes duration in weeks between two dates.
 */
export function calculateWeeksBetween(startDateStr: string, endDateStr: string): number {
  if (!startDateStr || !endDateStr) return 0;
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.round(diffDays / 7);
}
