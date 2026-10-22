import { KhmerDueRecord, EnglishDueRecord } from '../types/dueReport';

export const INITIAL_KHMER_DUE_RECORDS: KhmerDueRecord[] = [
  {
    id: 'kdue-1',
    no: 1,
    studentCode: 'FBIS5478',
    nameKhmer: 'ខាន សុវណ្ណសិលា',
    nameEnglish: 'Khan Sovannsela',
    gender: 'ស្រី',
    dob: '31-Aug-2013',
    academicYear: '2025-2026',
    status: 'កំពុងសិក្សា',
    fullTuition: 961.00,
    discountPercent: 100,
    discountAmount: 0,
    incentive: 0,
    amountPayable: 0,
    pastYearDue: 0,
    previousMonthsDue: { transport: 0, services: 0, total: 0 },
    balanceDue: {
      transport: 0,
      transportPastDue: 0,
      tuition: 0,
      tuitionPastDue: 0,
      services: 0,
      servicesPastDue: 0,
      total: 0
    },
    branchId: 'fbis-02'
  },
  {
    id: 'kdue-2',
    no: 2,
    studentCode: 'FBIS32366',
    nameKhmer: 'ធួន ឌីណា',
    nameEnglish: 'Thun Dina',
    gender: 'ស្រី',
    dob: '11-Feb-2014',
    academicYear: '2025-2026',
    status: 'កំពុងសិក្សា',
    fullTuition: 961.00,
    discountPercent: 10,
    discountAmount: 0,
    incentive: 0,
    amountPayable: 864.90,
    pastYearDue: 0,
    previousMonthsDue: { transport: 0, services: 0, total: 0 },
    balanceDue: {
      transport: 0,
      transportPastDue: 0,
      tuition: 864.90,
      tuitionPastDue: 0,
      services: 0,
      servicesPastDue: 0,
      total: 864.90
    },
    branchId: 'fbis-02'
  },
  {
    id: 'kdue-3',
    no: 3,
    studentCode: 'FBIS5447',
    nameKhmer: 'ឃុវ ជូបូ',
    nameEnglish: 'Khov Jubo',
    gender: 'ប្រុស',
    dob: '3-Jul-2012',
    academicYear: '2025-2026',
    status: 'កំពុងសិក្សា',
    fullTuition: 961.00,
    discountPercent: 10,
    discountAmount: 0,
    incentive: 0,
    amountPayable: 862.90,
    pastYearDue: 0,
    previousMonthsDue: { transport: 0, services: 220.45, total: 220.45 },
    installment1: {
      date: '12-May-26',
      invoiceNo: 'FBIS012026-000711',
      amountReceived: 220.45
    },
    balanceDue: {
      transport: 0,
      transportPastDue: 0,
      tuition: 220.45,
      tuitionPastDue: 0,
      services: 0,
      servicesPastDue: 0,
      total: 220.45
    },
    branchId: 'fbis-02'
  },
  {
    id: 'kdue-4',
    no: 4,
    studentCode: 'FBIS5446',
    nameKhmer: 'ឃុវ ជូមីន',
    nameEnglish: 'Khov Jumean',
    gender: 'ប្រុស',
    dob: '3-Jul-2012',
    academicYear: '2025-2026',
    status: 'កំពុងសិក្សា',
    fullTuition: 961.00,
    discountPercent: 10,
    discountAmount: 0,
    incentive: 0,
    amountPayable: 862.90,
    pastYearDue: 0,
    previousMonthsDue: { transport: 0, services: 220.45, total: 220.45 },
    installment1: {
      date: '12-May-26',
      invoiceNo: 'FBIS012026-000710',
      amountReceived: 220.45
    },
    balanceDue: {
      transport: 0,
      transportPastDue: 0,
      tuition: 220.45,
      tuitionPastDue: 0,
      services: 0,
      servicesPastDue: 0,
      total: 220.45
    },
    branchId: 'fbis-02'
  },
  {
    id: 'kdue-5',
    no: 5,
    studentCode: '3686',
    nameKhmer: 'ឃុត ផារ៉ាឌឺលុច',
    nameEnglish: 'Khuut Pharadeluxe',
    gender: 'ប្រុស',
    dob: '15-Oct-2013',
    academicYear: '2025-2026',
    status: 'កំពុងសិក្សា',
    fullTuition: 961.00,
    discountPercent: 10,
    discountAmount: 0,
    incentive: 0,
    amountPayable: 861.90,
    pastYearDue: 0,
    previousMonthsDue: { transport: 0, services: 245.25, total: 245.25 },
    installment1: {
      date: '21-May-26',
      invoiceNo: 'FBIS012026-000753',
      amountReceived: 245.25
    },
    balanceDue: {
      transport: 0,
      transportPastDue: 0,
      tuition: 245.25,
      tuitionPastDue: 0,
      services: 0,
      servicesPastDue: 0,
      total: 245.25
    },
    branchId: 'fbis-02'
  },
  {
    id: 'kdue-6',
    no: 6,
    studentCode: 'FBIS5471',
    nameKhmer: 'គង់ លីហ៊ួរ',
    nameEnglish: 'Kong Lyhour',
    gender: 'ប្រុស',
    dob: '7-Sep-2012',
    academicYear: '2025-2026',
    status: 'កំពុងសិក្សា',
    fullTuition: 961.00,
    discountPercent: 10,
    discountAmount: 0,
    incentive: 0,
    amountPayable: 861.90,
    pastYearDue: 0,
    previousMonthsDue: { transport: 0, services: 163.50, total: 163.50 },
    installment1: {
      date: '22-May-26',
      invoiceNo: 'FBIS012026-000777',
      amountReceived: 163.50
    },
    balanceDue: {
      transport: 0,
      transportPastDue: 0,
      tuition: 163.50,
      tuitionPastDue: 0,
      services: 0,
      servicesPastDue: 0,
      total: 163.50
    },
    branchId: 'fbis-02'
  },
  {
    id: 'kdue-7',
    no: 7,
    studentCode: 'FBIS5418',
    nameKhmer: 'គីម ដារ៉ានី',
    nameEnglish: 'Kim Darany',
    gender: 'ស្រី',
    dob: '23-Aug-2014',
    academicYear: '2025-2026',
    status: 'កំពុងសិក្សា',
    fullTuition: 961.00,
    discountPercent: 50,
    discountAmount: 0,
    incentive: 0,
    amountPayable: 480.50,
    pastYearDue: 0,
    previousMonthsDue: { transport: 0, services: 0, total: 0 },
    balanceDue: {
      transport: 0,
      transportPastDue: 0,
      tuition: 480.50,
      tuitionPastDue: 0,
      services: 0,
      servicesPastDue: 0,
      total: 480.50
    },
    branchId: 'fbis-02'
  },
  {
    id: 'kdue-8',
    no: 8,
    studentCode: 'FBIS5454',
    nameKhmer: 'ឃឹម ម៉ាលី',
    nameEnglish: 'Khim meili',
    gender: 'ស្រី',
    dob: '31-Dec-2013',
    academicYear: '2025-2026',
    status: 'កំពុងសិក្សា',
    fullTuition: 961.00,
    discountPercent: 0,
    discountAmount: 0,
    incentive: 0,
    amountPayable: 961.00,
    pastYearDue: 0,
    previousMonthsDue: { transport: 0, services: 0, total: 0 },
    balanceDue: {
      transport: 0,
      transportPastDue: 0,
      tuition: 961.00,
      tuitionPastDue: 0,
      services: 0,
      servicesPastDue: 0,
      total: 961.00
    },
    branchId: 'fbis-02'
  },
  {
    id: 'kdue-9',
    no: 9,
    studentCode: 'FBIS250028',
    nameKhmer: 'ខឹម ដាលី',
    nameEnglish: 'KHIDEM NYTA',
    gender: 'ស្រី',
    dob: '05-Sep-2014',
    academicYear: '2025-2026',
    status: 'កំពុងសិក្សា',
    fullTuition: 961.00,
    discountPercent: 10,
    discountAmount: 0,
    incentive: 0,
    amountPayable: 864.90,
    pastYearDue: 0,
    previousMonthsDue: { transport: 0, services: 0, total: 0 },
    balanceDue: {
      transport: 0,
      transportPastDue: 0,
      tuition: 864.90,
      tuitionPastDue: 0,
      services: 0,
      servicesPastDue: 0,
      total: 864.90
    },
    branchId: 'fbis-02'
  },
  {
    id: 'kdue-10',
    no: 10,
    studentCode: 'FBIS22197',
    nameKhmer: 'ខាន់ វាសនាស៊ុននី',
    nameEnglish: 'OHAN VEASNASUNNY',
    gender: 'ស្រី',
    dob: '29-Aug-2013',
    academicYear: '2025-2026',
    status: 'កំពុងសិក្សា',
    fullTuition: 961.00,
    discountPercent: 25,
    discountAmount: 0,
    incentive: 0,
    amountPayable: 735.75,
    pastYearDue: 0,
    previousMonthsDue: { transport: 0, services: 0, total: 0 },
    balanceDue: {
      transport: 0,
      transportPastDue: 0,
      tuition: 735.75,
      tuitionPastDue: 0,
      services: 0,
      servicesPastDue: 0,
      total: 735.75
    },
    branchId: 'fbis-02'
  },
  {
    id: 'kdue-11',
    no: 11,
    studentCode: '3830',
    nameKhmer: 'ឈន ប៉េងហ៊ួត',
    nameEnglish: 'CHORN PENGHOURT',
    gender: 'ប្រុស',
    dob: '25-Jul-2013',
    academicYear: '2025-2026',
    status: 'កំពុងសិក្សា',
    fullTuition: 961.00,
    discountPercent: 20,
    discountAmount: 20.00,
    incentive: 0,
    amountPayable: 720.75,
    pastYearDue: 0,
    previousMonthsDue: { transport: 0, services: 0, total: 0 },
    balanceDue: {
      transport: 0,
      transportPastDue: 0,
      tuition: 720.75,
      tuitionPastDue: 0,
      services: 0,
      servicesPastDue: 0,
      total: 720.75
    },
    branchId: 'fbis-02'
  },
  {
    id: 'kdue-12',
    no: 12,
    studentCode: 'FBIS25468',
    nameKhmer: 'ឆាយ សុខឃាង',
    nameEnglish: 'Chhay Sokheang',
    gender: 'ស្រី',
    dob: '25-Sep-2014',
    academicYear: '2025-2026',
    status: 'កំពុងសិក្សា',
    fullTuition: 961.00,
    discountPercent: 100,
    discountAmount: 0,
    incentive: 0,
    amountPayable: 0,
    pastYearDue: 0,
    previousMonthsDue: { transport: 0, services: 0, total: 0 },
    balanceDue: {
      transport: 0,
      transportPastDue: 0,
      tuition: 0,
      tuitionPastDue: 0,
      services: 0,
      servicesPastDue: 0,
      total: 0
    },
    branchId: 'fbis-02'
  },
  {
    id: 'kdue-13',
    no: 13,
    studentCode: 'FBIS22228',
    nameKhmer: 'ឈេង គីម ដារ៉ា',
    nameEnglish: 'CHHENG KIM DARA',
    gender: 'ស្រី',
    dob: '19-Jul-2012',
    academicYear: '2025-2026',
    status: 'កំពុងសិក្សា',
    fullTuition: 961.00,
    discountPercent: 10,
    discountAmount: 20.00,
    incentive: 0,
    amountPayable: 864.90,
    pastYearDue: 0,
    previousMonthsDue: { transport: 0, services: 0, total: 0 },
    balanceDue: {
      transport: 0,
      transportPastDue: 0,
      tuition: 864.90,
      tuitionPastDue: 0,
      services: 0,
      servicesPastDue: 0,
      total: 864.90
    },
    branchId: 'fbis-02'
  },
  {
    id: 'kdue-14',
    no: 14,
    studentCode: 'FBIS50001',
    nameKhmer: 'ឈេង ម៉ូណា',
    nameEnglish: 'Chheng Mona',
    gender: 'ស្រី',
    dob: '2-Dec-2012',
    academicYear: '2025-2026',
    status: 'កំពុងសិក្សា',
    fullTuition: 490.50,
    discountPercent: 10,
    discountAmount: 0,
    incentive: 0,
    amountPayable: 441.45,
    pastYearDue: 0,
    previousMonthsDue: { transport: 0, services: 0, total: 0 },
    balanceDue: {
      transport: 0,
      transportPastDue: 0,
      tuition: 441.45,
      tuitionPastDue: 0,
      services: 0,
      servicesPastDue: 0,
      total: 441.45
    },
    branchId: 'fbis-02'
  },
  {
    id: 'kdue-15',
    no: 15,
    studentCode: 'FBIS50002',
    nameKhmer: 'ឈេង សេរ៉ា',
    nameEnglish: 'Chheng Sera',
    gender: 'ស្រី',
    dob: '2-Dec-2012',
    academicYear: '2025-2026',
    status: 'កំពុងសិក្សា',
    fullTuition: 490.50,
    discountPercent: 10,
    discountAmount: 0,
    incentive: 0,
    amountPayable: 441.45,
    pastYearDue: 0,
    previousMonthsDue: { transport: 0, services: 0, total: 0 },
    balanceDue: {
      transport: 0,
      transportPastDue: 0,
      tuition: 441.45,
      tuitionPastDue: 0,
      services: 0,
      servicesPastDue: 0,
      total: 441.45
    },
    branchId: 'fbis-02'
  },
  {
    id: 'kdue-16',
    no: 16,
    studentCode: 'FBIS250026',
    nameKhmer: 'ជា ចំរើន',
    nameEnglish: 'Chea ChamReun',
    gender: 'ប្រុស',
    dob: '05-Jun-2013',
    academicYear: '2025-2026',
    status: 'កំពុងសិក្សា',
    fullTuition: 961.00,
    discountPercent: 25,
    discountAmount: 0,
    incentive: 0,
    amountPayable: 720.75,
    pastYearDue: 0,
    previousMonthsDue: { transport: 0, services: 0, total: 0 },
    balanceDue: {
      transport: 0,
      transportPastDue: 0,
      tuition: 720.75,
      tuitionPastDue: 0,
      services: 0,
      servicesPastDue: 0,
      total: 720.75
    },
    branchId: 'fbis-02'
  },
  {
    id: 'kdue-17',
    no: 17,
    studentCode: 'FBIS5515',
    nameKhmer: 'តាំង ស៊ីមេង',
    nameEnglish: 'Taing simneng',
    gender: 'ស្រី',
    dob: '5-May-2012',
    academicYear: '2025-2026',
    status: 'កំពុងសិក្សា',
    fullTuition: 961.00,
    discountPercent: 20,
    discountAmount: 0,
    incentive: 156.00,
    amountPayable: 628.80,
    pastYearDue: 0,
    previousMonthsDue: { transport: 0, services: 158.80, total: 158.80 },
    installment1: {
      date: '30-May-26',
      invoiceNo: 'FBIS012026-000957',
      amountReceived: 158.80
    },
    balanceDue: {
      transport: 0,
      transportPastDue: 0,
      tuition: 158.80,
      tuitionPastDue: 0,
      services: 0,
      servicesPastDue: 0,
      total: 158.80
    },
    branchId: 'fbis-02'
  },
  {
    id: 'kdue-18',
    no: 18,
    studentCode: 'FBIS5424',
    nameKhmer: 'រឿន ជីងឈី',
    nameEnglish: 'Roeun chingie',
    gender: 'ប្រុស',
    dob: '5-May-2015',
    academicYear: '2025-2026',
    status: 'កំពុងសិក្សា',
    fullTuition: 961.00,
    discountPercent: 20,
    discountAmount: 0,
    incentive: 0,
    amountPayable: 735.75,
    pastYearDue: 0,
    previousMonthsDue: { transport: 0, services: 183.75, total: 183.75 },
    installment1: {
      date: '7-May-26',
      invoiceNo: 'FBIS012026-000895',
      amountReceived: 183.75
    },
    balanceDue: {
      transport: 0,
      transportPastDue: 0,
      tuition: 183.75,
      tuitionPastDue: 0,
      services: 0,
      servicesPastDue: 0,
      total: 183.75
    },
    branchId: 'fbis-02'
  },
  {
    id: 'kdue-19',
    no: 19,
    studentCode: 'FBIS5470',
    nameKhmer: 'សំរ៉េត សុខកែវធីតា',
    nameEnglish: 'Samreth sokkeytha',
    gender: 'ស្រី',
    dob: '5-Oct-2012',
    academicYear: '2025-2026',
    status: 'កំពុងសិក្សា',
    fullTuition: 961.00,
    discountPercent: 0,
    discountAmount: 0,
    incentive: 0,
    amountPayable: 961.00,
    pastYearDue: 0,
    previousMonthsDue: { transport: 0, services: 240.50, total: 240.50 },
    balanceDue: {
      transport: 0,
      transportPastDue: 0,
      tuition: 240.50,
      tuitionPastDue: 0,
      services: 0,
      servicesPastDue: 0,
      total: 240.50
    },
    branchId: 'fbis-02'
  },
  {
    id: 'kdue-20',
    no: 20,
    studentCode: 'FBIS5512',
    nameKhmer: 'សុខណា ហាវីន',
    nameEnglish: 'Sokna havin',
    gender: 'ប្រុស',
    dob: '7-Jan-2014',
    academicYear: '2025-2026',
    status: 'កំពុងសិក្សា',
    fullTuition: 961.00,
    discountPercent: 20,
    discountAmount: 0,
    incentive: 0,
    amountPayable: 735.75,
    pastYearDue: 0,
    previousMonthsDue: { transport: 0, services: 366.75, total: 366.75 },
    installment1: {
      date: '27-May-26',
      invoiceNo: 'FBIS012026-000840',
      amountReceived: 366.75
    },
    balanceDue: {
      transport: 0,
      transportPastDue: 0,
      tuition: 366.75,
      tuitionPastDue: 0,
      services: 0,
      servicesPastDue: 0,
      total: 366.75
    },
    branchId: 'fbis-02'
  },
  {
    id: 'kdue-21',
    no: 21,
    studentCode: 'FBIS5484',
    nameKhmer: 'ហេង ចៃអ៊ី',
    nameEnglish: 'Heng chayel',
    gender: 'ស្រី',
    dob: '26-Feb-2014',
    academicYear: '2025-2026',
    status: 'កំពុងសិក្សា',
    fullTuition: 961.00,
    discountPercent: 10,
    discountAmount: 0,
    incentive: 0,
    amountPayable: 862.90,
    pastYearDue: 0,
    previousMonthsDue: { transport: 0, services: 220.45, total: 220.45 },
    balanceDue: {
      transport: 0,
      transportPastDue: 0,
      tuition: 220.45,
      tuitionPastDue: 0,
      services: 0,
      servicesPastDue: 0,
      total: 220.45
    },
    branchId: 'fbis-02'
  },
  {
    id: 'kdue-22',
    no: 22,
    studentCode: 'FBIS5511',
    nameKhmer: 'ហេង វេងឆាយ',
    nameEnglish: 'heng vegchay',
    gender: 'ប្រុស',
    dob: '3-Aug-2008',
    academicYear: '2025-2026',
    status: 'កំពុងសិក្សា',
    fullTuition: 961.00,
    discountPercent: 10,
    discountAmount: 0,
    incentive: 0,
    amountPayable: 862.90,
    pastYearDue: 0,
    previousMonthsDue: { transport: 0, services: 282.45, total: 282.45 },
    balanceDue: {
      transport: 0,
      transportPastDue: 0,
      tuition: 282.45,
      tuitionPastDue: 0,
      services: 0,
      servicesPastDue: 0,
      total: 282.45
    },
    branchId: 'fbis-02'
  },
  {
    id: 'kdue-23',
    no: 23,
    studentCode: 'FBIS5482',
    nameKhmer: 'ឡរ ចាន់សុវណ្ណ',
    nameEnglish: 'Lor Chansovann',
    gender: 'ប្រុស',
    dob: '20-Aug-2012',
    academicYear: '2025-2026',
    status: 'កំពុងសិក្សា',
    fullTuition: 961.00,
    discountPercent: 0,
    discountAmount: 0,
    incentive: 0,
    amountPayable: 961.00,
    pastYearDue: 0,
    previousMonthsDue: { transport: 0, services: 245.25, total: 245.25 },
    installment1: {
      date: '12-May-26',
      invoiceNo: 'FBIS012026-000704',
      amountReceived: 245.25
    },
    balanceDue: {
      transport: 0,
      transportPastDue: 0,
      tuition: 245.25,
      tuitionPastDue: 0,
      services: 0,
      servicesPastDue: 0,
      total: 245.25
    },
    branchId: 'fbis-02'
  },
  {
    id: 'kdue-24',
    no: 24,
    studentCode: 'FBIS5402',
    nameKhmer: 'អ៊ុច ធីប៉័រ',
    nameEnglish: 'Uch Tipor',
    gender: 'ប្រុស',
    dob: '28-Sep-2013',
    academicYear: '2025-2026',
    status: 'កំពុងសិក្សា',
    fullTuition: 961.00,
    discountPercent: 25,
    discountAmount: 0,
    incentive: 0,
    amountPayable: 720.75,
    pastYearDue: 0,
    previousMonthsDue: { transport: 0, services: 0, total: 0 },
    balanceDue: {
      transport: 0,
      transportPastDue: 0,
      tuition: 720.75,
      tuitionPastDue: 0,
      services: 0,
      servicesPastDue: 0,
      total: 720.75
    },
    branchId: 'fbis-02'
  },
  {
    id: 'kdue-25',
    no: 25,
    studentCode: 'FBIS5402-B',
    nameKhmer: 'អ៊ុច ធីប៉័រ (សេវា)',
    nameEnglish: 'Uch Tipor (Services)',
    gender: 'ប្រុស',
    dob: '28-Sep-2013',
    academicYear: '2026-2027',
    status: 'កំពុងសិក្សា',
    fullTuition: 1081.00,
    discountPercent: 25,
    discountAmount: 0,
    incentive: 0,
    amountPayable: 810.75,
    pastYearDue: 0,
    previousMonthsDue: { transport: 261.23, services: 405.38, total: 666.60 },
    balanceDue: {
      transport: 0,
      transportPastDue: 0,
      tuition: 666.60,
      tuitionPastDue: 0,
      services: 261.23,
      servicesPastDue: 405.38,
      total: 666.60
    },
    branchId: 'fbis-02'
  },
  {
    id: 'kdue-26',
    no: 26,
    studentCode: 'FBIS4796',
    nameKhmer: 'អ៊ូ បញ្ញារតនា',
    nameEnglish: 'OU PANHARINA',
    gender: 'ប្រុស',
    dob: '08-Jan-2013',
    academicYear: '2025-2026',
    status: 'កំពុងសិក្សា',
    fullTuition: 961.00,
    discountPercent: 10,
    discountAmount: 0,
    incentive: 0,
    amountPayable: 862.90,
    pastYearDue: 0,
    previousMonthsDue: { transport: 0, services: 0, total: 0 },
    balanceDue: {
      transport: 0,
      transportPastDue: 0,
      tuition: 862.90,
      tuitionPastDue: 0,
      services: 0,
      servicesPastDue: 0,
      total: 862.90
    },
    branchId: 'fbis-02'
  }
];

export const INITIAL_ENGLISH_DUE_RECORDS: EnglishDueRecord[] = [
  {
    id: 'edue-1',
    no: 1,
    studentCode: '188875',
    nameKhmer: 'កែ សុខស្រ៊ាងហួង',
    nameEnglish: 'Ke Sokkheanghoung',
    gender: 'M',
    dob: '19-Apr-14',
    academicYear: '2025-2026',
    status: 'កំពុងសិក្សា',
    fullTuition: 700.00,
    discountPercent: 10,
    incentive: 0,
    amountPayable: {
      tuition: 630.00,
      services: 100.00
    },
    previousMonthsDue: {
      tuition: 472.50,
      services: 75.00
    },
    actualPayment: {
      tuition: {},
      services: {}
    },
    endingBalance: {
      tuition: 472.50,
      services: 75.00
    },
    remainingPreviousDue: {
      tuition: 472.50,
      services: 75.00
    },
    actualArrears: {
      tuition: 157.50,
      services: 25.00
    },
    totalDue: {
      tuition: 157.50,
      services: 25.00,
      total: 182.50
    },
    branchId: 'fbis-02'
  },
  {
    id: 'edue-2',
    no: 2,
    studentCode: '188804',
    nameKhmer: 'ឈឹម ច័ន្ទរត្នារីយ៉ា',
    nameEnglish: 'Chim Chanratnariya',
    gender: 'M',
    dob: '27-Apr-15',
    academicYear: '2025-2026',
    status: 'កំពុងសិក្សា',
    fullTuition: 700.00,
    discountPercent: 0,
    incentive: 0,
    amountPayable: {
      tuition: 700.00,
      services: 100.00
    },
    previousMonthsDue: {
      tuition: 525.00,
      services: 75.00
    },
    actualPayment: {
      tuition: {
        installment1: {
          date: '21-Nov-25',
          invoiceNo: 'FBIS012025-000521',
          amountReceived: 315.00
        }
      },
      services: {
        installment1: {
          date: '21-Nov-25',
          invoiceNo: 'FBIS012025-000520',
          amountReceived: 50.00
        }
      }
    },
    endingBalance: {
      tuition: 175.00,
      services: 25.00
    },
    remainingPreviousDue: {
      tuition: 0,
      services: 0
    },
    actualArrears: {
      tuition: 175.00,
      services: 25.00
    },
    totalDue: {
      tuition: 175.00,
      services: 25.00,
      total: 200.00
    },
    branchId: 'fbis-02'
  },
  {
    id: 'edue-3',
    no: 3,
    studentCode: 'FBIS5028',
    nameKhmer: 'សុវណ្ណ មុនីរត្ន័',
    nameEnglish: 'Sovanmony',
    gender: 'M',
    dob: '8-Jul-14',
    academicYear: '2025-2026',
    status: 'កំពុងសិក្សា',
    fullTuition: 700.00,
    discountPercent: 40,
    incentive: 0,
    amountPayable: {
      tuition: 420.00,
      services: 100.00
    },
    previousMonthsDue: {
      tuition: 315.00,
      services: 75.00
    },
    actualPayment: {
      tuition: {},
      services: {}
    },
    endingBalance: {
      tuition: 315.00,
      services: 75.00
    },
    remainingPreviousDue: {
      tuition: 315.00,
      services: 75.00
    },
    actualArrears: {
      tuition: 105.00,
      services: 25.00
    },
    totalDue: {
      tuition: 105.00,
      services: 25.00,
      total: 130.00
    },
    branchId: 'fbis-02'
  },
  {
    id: 'edue-4',
    no: 4,
    studentCode: '188878',
    nameKhmer: 'ឌីណា សិលាបុត្រ',
    nameEnglish: 'Dina Selaboth',
    gender: 'M',
    dob: '23-Feb-15',
    academicYear: '2025-2026',
    status: 'កំពុងសិក្សា',
    fullTuition: 700.00,
    discountPercent: 20,
    incentive: 0,
    amountPayable: {
      tuition: 560.00,
      services: 100.00
    },
    previousMonthsDue: {
      tuition: 420.00,
      services: 75.00
    },
    actualPayment: {
      tuition: {},
      services: {}
    },
    endingBalance: {
      tuition: 420.00,
      services: 75.00
    },
    remainingPreviousDue: {
      tuition: 420.00,
      services: 75.00
    },
    actualArrears: {
      tuition: 140.00,
      services: 25.00
    },
    totalDue: {
      tuition: 140.00,
      services: 25.00,
      total: 165.00
    },
    branchId: 'fbis-02'
  },
  {
    id: 'edue-5',
    no: 5,
    studentCode: '188821',
    nameKhmer: 'ម៉ី ហ្គូលីដា',
    nameEnglish: 'Mi Golida',
    gender: 'F',
    dob: '24-Oct-15',
    academicYear: '2025-2026',
    status: 'កំពុងសិក្សា',
    fullTuition: 700.00,
    discountPercent: 0,
    incentive: 0,
    amountPayable: {
      tuition: 700.00,
      services: 100.00
    },
    previousMonthsDue: {
      tuition: 525.00,
      services: 75.00
    },
    actualPayment: {
      tuition: {},
      services: {}
    },
    endingBalance: {
      tuition: 525.00,
      services: 75.00
    },
    remainingPreviousDue: {
      tuition: 525.00,
      services: 75.00
    },
    actualArrears: {
      tuition: 175.00,
      services: 25.00
    },
    totalDue: {
      tuition: 175.00,
      services: 25.00,
      total: 200.00
    },
    branchId: 'fbis-02'
  },
  {
    id: 'edue-6',
    no: 6,
    studentCode: '188806',
    nameKhmer: 'ហ៊ី ផ្លាឡុង',
    nameEnglish: 'Hy Piphong',
    gender: 'M',
    dob: '22-Jun-15',
    academicYear: '2025-2026',
    status: 'កំពុងសិក្សា',
    fullTuition: 700.00,
    discountPercent: 0,
    incentive: 0,
    amountPayable: {
      tuition: 700.00,
      services: 100.00
    },
    previousMonthsDue: {
      tuition: 525.00,
      services: 75.00
    },
    actualPayment: {
      tuition: {},
      services: {}
    },
    endingBalance: {
      tuition: 525.00,
      services: 75.00
    },
    remainingPreviousDue: {
      tuition: 525.00,
      services: 75.00
    },
    actualArrears: {
      tuition: 175.00,
      services: 25.00
    },
    totalDue: {
      tuition: 175.00,
      services: 25.00,
      total: 200.00
    },
    branchId: 'fbis-02'
  },
  {
    id: 'edue-7',
    no: 7,
    studentCode: '188816',
    nameKhmer: 'មាស ពេជ្រ ដាលីយ៉ា',
    nameEnglish: 'Meas Pich Daliya',
    gender: 'F',
    dob: '15-Jun-15',
    academicYear: '2025-2026',
    status: 'កំពុងសិក្សា',
    fullTuition: 700.00,
    discountPercent: 0,
    incentive: 0,
    amountPayable: {
      tuition: 700.00,
      services: 100.00
    },
    previousMonthsDue: {
      tuition: 525.00,
      services: 75.00
    },
    actualPayment: {
      tuition: {},
      services: {}
    },
    endingBalance: {
      tuition: 525.00,
      services: 75.00
    },
    remainingPreviousDue: {
      tuition: 525.00,
      services: 75.00
    },
    actualArrears: {
      tuition: 175.00,
      services: 25.00
    },
    totalDue: {
      tuition: 175.00,
      services: 25.00,
      total: 200.00
    },
    branchId: 'fbis-02'
  },
  {
    id: 'edue-8',
    no: 8,
    studentCode: 'FBIS5033',
    nameKhmer: 'ស៊្រុន សិរីយ៉ាហាន់',
    nameEnglish: 'Srun Sereiyahan',
    gender: 'M',
    dob: '29-Apr-15',
    academicYear: '2025-2026',
    status: 'កំពុងសិក្សា',
    fullTuition: 700.00,
    discountPercent: 25,
    incentive: 0,
    amountPayable: {
      tuition: 525.00,
      services: 100.00
    },
    previousMonthsDue: {
      tuition: 393.75,
      services: 75.00
    },
    actualPayment: {
      tuition: {},
      services: {}
    },
    endingBalance: {
      tuition: 393.75,
      services: 75.00
    },
    remainingPreviousDue: {
      tuition: 393.75,
      services: 75.00
    },
    actualArrears: {
      tuition: 131.25,
      services: 25.00
    },
    totalDue: {
      tuition: 131.25,
      services: 25.00,
      total: 156.25
    },
    branchId: 'fbis-02'
  },
  {
    id: 'edue-9',
    no: 9,
    studentCode: '188808',
    nameKhmer: 'សី សេរីវឌ្ឍនៈ',
    nameEnglish: 'Sey Serivadhna',
    gender: 'M',
    dob: '9-Jul-14',
    academicYear: '2025-2026',
    status: 'កំពុងសិក្សា',
    fullTuition: 700.00,
    discountPercent: 0,
    incentive: 0,
    amountPayable: {
      tuition: 700.00,
      services: 100.00
    },
    previousMonthsDue: {
      tuition: 525.00,
      services: 75.00
    },
    actualPayment: {
      tuition: {},
      services: {}
    },
    endingBalance: {
      tuition: 525.00,
      services: 75.00
    },
    remainingPreviousDue: {
      tuition: 525.00,
      services: 75.00
    },
    actualArrears: {
      tuition: 175.00,
      services: 25.00
    },
    totalDue: {
      tuition: 175.00,
      services: 25.00,
      total: 200.00
    },
    branchId: 'fbis-02'
  },
  {
    id: 'edue-10',
    no: 10,
    studentCode: 'FBIS5027',
    nameKhmer: 'ស៊ឹម ប៊ែលឡា',
    nameEnglish: 'Sim Bella',
    gender: 'F',
    dob: '31-Jul-14',
    academicYear: '2025-2026',
    status: 'កំពុងសិក្សា',
    fullTuition: 700.00,
    discountPercent: 80,
    incentive: 0,
    amountPayable: {
      tuition: 140.00,
      services: 100.00
    },
    previousMonthsDue: {
      tuition: 105.00,
      services: 75.00
    },
    actualPayment: {
      tuition: {},
      services: {}
    },
    endingBalance: {
      tuition: 105.00,
      services: 75.00
    },
    remainingPreviousDue: {
      tuition: 105.00,
      services: 75.00
    },
    actualArrears: {
      tuition: 35.00,
      services: 25.00
    },
    totalDue: {
      tuition: 35.00,
      services: 25.00,
      total: 60.00
    },
    branchId: 'fbis-02'
  },
  {
    id: 'edue-11',
    no: 11,
    studentCode: 'FBIS5026',
    nameKhmer: 'សុផា វិសាលពុទ្ធ',
    nameEnglish: 'Sophak Visalkboth',
    gender: 'M',
    dob: '19-Dec-14',
    academicYear: '2025-2026',
    status: 'កំពុងសិក្សា',
    fullTuition: 700.00,
    discountPercent: 20,
    incentive: 0,
    amountPayable: {
      tuition: 560.00,
      services: 100.00
    },
    previousMonthsDue: {
      tuition: 420.00,
      services: 75.00
    },
    actualPayment: {
      tuition: {},
      services: {}
    },
    endingBalance: {
      tuition: 420.00,
      services: 75.00
    },
    remainingPreviousDue: {
      tuition: 420.00,
      services: 75.00
    },
    actualArrears: {
      tuition: 140.00,
      services: 25.00
    },
    totalDue: {
      tuition: 140.00,
      services: 25.00,
      total: 165.00
    },
    branchId: 'fbis-02'
  },
  {
    id: 'edue-12',
    no: 12,
    studentCode: '188812',
    nameKhmer: 'ហួត គឹមហុង',
    nameEnglish: 'Huot Kimhong',
    gender: 'M',
    dob: '25-Oct-17',
    academicYear: '2025-2026',
    status: 'កំពុងសិក្សា',
    fullTuition: 700.00,
    discountPercent: 10,
    incentive: 0,
    amountPayable: {
      tuition: 630.00,
      services: 100.00
    },
    previousMonthsDue: {
      tuition: 472.50,
      services: 75.00
    },
    actualPayment: {
      tuition: {},
      services: {}
    },
    endingBalance: {
      tuition: 472.50,
      services: 75.00
    },
    remainingPreviousDue: {
      tuition: 472.50,
      services: 75.00
    },
    actualArrears: {
      tuition: 157.50,
      services: 25.00
    },
    totalDue: {
      tuition: 157.50,
      services: 25.00,
      total: 182.50
    },
    branchId: 'fbis-02'
  },
  {
    id: 'edue-13',
    no: 13,
    studentCode: '188735',
    nameKhmer: 'លួស មុនីត',
    nameEnglish: 'Luos Monith',
    gender: 'M',
    dob: '21-Oct-15',
    academicYear: '2025-2026',
    status: 'កំពុងសិក្សា',
    fullTuition: 700.00,
    discountPercent: 0,
    incentive: 0,
    amountPayable: {
      tuition: 700.00,
      services: 100.00
    },
    previousMonthsDue: {
      tuition: 350.00,
      services: 50.00
    },
    actualPayment: {
      tuition: {
        installment1: {
          date: '21-Nov-25',
          invoiceNo: 'FBIS012025-000517',
          amountReceived: 175.00
        }
      },
      services: {
        installment1: {
          date: '21-Nov-25',
          invoiceNo: 'FBIS012025-000518',
          amountReceived: 25.00
        }
      }
    },
    endingBalance: {
      tuition: 175.00,
      services: 25.00
    },
    remainingPreviousDue: {
      tuition: 0,
      services: 0
    },
    actualArrears: {
      tuition: 175.00,
      services: 25.00
    },
    totalDue: {
      tuition: 175.00,
      services: 25.00,
      total: 200.00
    },
    branchId: 'fbis-02'
  }
];
