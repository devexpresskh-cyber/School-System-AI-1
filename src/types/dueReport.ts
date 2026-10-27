export interface KhmerDueRecord {
  id: string;
  no: number;
  studentCode: string;
  nameKhmer: string;
  nameEnglish: string;
  className?: string; // ថ្នាក់ (e.g. 'ថ្នាក់ទី ៧', 'ថ្នាក់ទី ៨', 'ថ្នាក់ K1')
  gender: 'ប្រុស' | 'ស្រី' | 'M' | 'F';
  dob: string;
  academicYear: string;
  status: string;
  fullTuition: number;
  discountPercent: number;
  discountAmount?: number;
  incentive: number;
  amountPayable: number;
  pastYearDue: number;
  newYearDue?: number;
  newYearSem1?: number; // ទឹកប្រាក់ជំពាក់ឆ្នាំថ្មី ឆមាសទី១
  newYearSem2?: number; // ទឹកប្រាក់ជំពាក់ឆ្នាំថ្មី ឆមាសទី២
  beginningBalanceDue: number;
  installment1?: {
    date: string;
    invoiceNo: string;
    amountReceived: number;
  };
  installment2?: {
    date: string;
    invoiceNo: string;
    amountReceived: number;
  };
  installment3?: {
    date: string;
    invoiceNo: string;
    amountReceived: number;
  };
  semester2Payment?: {
    date: string;
    invoiceNo: string;
    amountReceived: number;
  };
  totalPaid?: number;
  endingDue: {
    semester1: number;
    semester2: number;
    pastYear: number;
    total: number;
  };
  // Optional backward compatibility fields
  previousMonthsDue?: {
    transport: number;
    services: number;
    total: number;
  };
  balanceDue?: {
    transport: number;
    transportPastDue: number;
    tuition: number;
    tuitionPastDue: number;
    services: number;
    servicesPastDue: number;
    total: number;
  };
  branchId: string;
  customCellFormulas?: Record<string, string>;
}

export interface EnglishDueRecord {
  id: string;
  no: number;
  studentCode: string;
  nameKhmer: string;
  nameEnglish: string;
  className?: string; // ថ្នាក់ (e.g. 'ថ្នាក់ K1', 'ថ្នាក់ K2')
  gender: 'M' | 'F' | 'ស' | 'ប' | 'ប្រុស' | 'ស្រី';
  dob: string;
  academicYear: string;
  status: string;
  fullTuition: number;
  discountPercent: number;
  annualIncentive?: number; // បញ្ចុះតម្លៃ ការលើកទឹកចិត្តក្នុង១ឆ្នាំ
  incentive: number; // ការលើកទឹកចិត្ត
  amountPayableTuition: number; // ទឹកប្រាក់ត្រូវបង់ - ថ្លៃឈ្នួលសិក្សា
  amountPayableAdminFee?: number; // ទឹកប្រាក់ត្រូវបង់ - ថ្លៃសេវារដ្ឋបាល ($100.00)
  pastYearDue: {
    tuition: number; // ថ្លៃឈ្នួលសិក្សា
    adminFee: number; // ថ្លៃសេវារដ្ឋបាល
  };
  beginningQuarterDue: {
    q1: { tuition: number; adminFee: number };
    q2: { tuition: number; adminFee: number };
    q3: { tuition: number; adminFee: number };
    q4: { tuition: number; adminFee: number };
    newYearTotal: { tuition: number; adminFee: number };
  };
  installment1?: {
    date: string;
    invoiceNo?: string;
    invoiceNoTuition?: string;
    invoiceNoAdmin?: string;
    amountPaid?: number;
    amountTuition?: number;
    amountAdmin?: number;
  };
  installment2?: {
    date: string;
    invoiceNo?: string;
    invoiceNoTuition?: string;
    invoiceNoAdmin?: string;
    amountPaid?: number;
    amountTuition?: number;
    amountAdmin?: number;
  };
  totalPaid: {
    tuition: number;
    adminFee: number;
  };
  paymentCount: number; // ចំនួនដង / ចំនួនលើក (1, 0)
  endingTotalDue?: {
    tuition: number;
    adminFee: number;
  };
  endingPastYearDue?: {
    tuition: number;
    adminFee: number;
  };
  endingQuarterDue: {
    pastYear?: { tuition: number; adminFee: number };
    q1: { tuition: number; adminFee: number };
    q2: { tuition: number; adminFee: number };
    q3: { tuition: number; adminFee: number };
    q4: { tuition: number; adminFee: number };
    total?: { tuition: number; adminFee: number };
  };
  branchId: string;

  // Compatibility fields
  amountPayable?: {
    tuition: number;
    services: number;
  };
  previousMonthsDue?: {
    tuition: number;
    services: number;
  };
  actualPayment?: any;
  endingBalance?: {
    tuition: number;
    services: number;
  };
  remainingPreviousDue?: {
    tuition: number;
    services: number;
  };
  actualArrears?: {
    tuition: number;
    services: number;
  };
  totalDue?: {
    tuition: number;
    services: number;
    total: number;
  };
  customCellFormulas?: Record<string, string>;
}
