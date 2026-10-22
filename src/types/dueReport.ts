export interface KhmerDueRecord {
  id: string;
  no: number;
  studentCode: string;
  nameKhmer: string;
  nameEnglish: string;
  gender: 'ប្រុស' | 'ស្រី';
  dob: string;
  academicYear: string;
  status: string;
  fullTuition: number;
  discountPercent: number;
  discountAmount: number;
  incentive: number;
  amountPayable: number;
  pastYearDue: number;
  previousMonthsDue: {
    transport: number;
    services: number;
    total: number;
  };
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
  balanceDue: {
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
  gender: 'M' | 'F';
  dob: string;
  academicYear: string;
  status: string;
  fullTuition: number;
  discountPercent: number;
  incentive: number;
  amountPayable: {
    tuition: number;
    services: number;
  };
  previousMonthsDue: {
    tuition: number;
    services: number;
  };
  actualPayment: {
    tuition: {
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
    };
    services: {
      installment1?: {
        date: string;
        invoiceNo: string;
        amountReceived: number;
      };
    };
  };
  endingBalance: {
    tuition: number;
    services: number;
  };
  remainingPreviousDue: {
    tuition: number;
    services: number;
  };
  actualArrears: {
    tuition: number;
    services: number;
  };
  totalDue: {
    tuition: number;
    services: number;
    total: number;
  };
  branchId: string;
}
