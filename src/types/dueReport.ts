export interface KhmerDueRecord {
  id: string;
  no: number;
  studentCode: string;
  nameKhmer: string;
  nameEnglish: string;
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
}

export interface EnglishDueRecord {
  id: string;
  no: number;
  studentCode: string;
  nameKhmer: string;
  nameEnglish: string;
  gender: 'M' | 'F' | 'ស' | 'ប';
  dob: string;
  academicYear: string;
  status: string;
  fullTuition: number;
  discountPercent: number;
  annualIncentive?: number; // បញ្ចុះតម្លៃ ការលើកទឹកចិត្តក្នុង១ឆ្នាំ
  incentive: number; // ការលើកទឹកចិត្ត
  amountPayableTuition: number; // ទឹកប្រាក់ត្រូវបង់
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
    invoiceNoTuition?: string;
    invoiceNoAdmin?: string;
    invoiceNo?: string;
    amountTuition: number;
    amountAdmin: number;
  };
  installment2?: {
    date: string;
    invoiceNoTuition?: string;
    invoiceNoAdmin?: string;
    invoiceNo?: string;
    amountTuition: number;
    amountAdmin: number;
  };
  totalPaid: {
    tuition: number;
    adminFee: number;
  };
  paymentCount: number; // ចំនួនដង (e.g. 1, 0)
  endingQuarterDue: {
    pastYear: { tuition: number; adminFee: number };
    q1: { tuition: number; adminFee: number };
    q2: { tuition: number; adminFee: number };
    q3: { tuition: number; adminFee: number };
    q4: { tuition: number; adminFee: number };
    total: { tuition: number; adminFee: number };
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
}
