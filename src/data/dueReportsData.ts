import { KhmerDueRecord, EnglishDueRecord } from '../types/dueReport';

export const INITIAL_KHMER_DUE_RECORDS: KhmerDueRecord[] = [
  {
    "no": 1,
    "studentCode": "FBIS5478",
    "nameKhmer": "ខាន់ សុវណ្ណសិលា",
    "nameEnglish": "Khan Sovannsela",
    "gender": "ស្រី",
    "dob": "31-Aug-2013",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 961,
    "discountPercent": 100,
    "incentive": 0,
    "amountPayable": 0,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-1",
    "branchId": "fbis-02"
  },
  {
    "no": 2,
    "studentCode": "FBIS32366",
    "nameKhmer": "ខុន ដាណា",
    "nameEnglish": "Khon Dana",
    "gender": "ស្រី",
    "dob": "11-Feb-2014",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 981,
    "discountPercent": 10,
    "incentive": 0,
    "amountPayable": 882.9,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-2",
    "branchId": "fbis-02"
  },
  {
    "no": 3,
    "studentCode": "FBIS5447",
    "nameKhmer": "ខូវ ជូប៉",
    "nameEnglish": "Khov Jubo",
    "gender": "ស្រី",
    "dob": "3-Jul-2012",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 981,
    "discountPercent": 10,
    "incentive": 0,
    "amountPayable": 882.9,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 220.45,
    "installment1": {
      "date": "12-May-26",
      "invoiceNo": "FBIS012026-000711",
      "amountReceived": 220.45
    },
    "totalPaid": 220.45,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-3",
    "branchId": "fbis-02"
  },
  {
    "no": 4,
    "studentCode": "FBIS5446",
    "nameKhmer": "ខូវ ជូមាន",
    "nameEnglish": "Khov Jumean",
    "gender": "ស្រី",
    "dob": "3-Jul-2012",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 981,
    "discountPercent": 10,
    "incentive": 0,
    "amountPayable": 882.9,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 220.45,
    "installment1": {
      "date": "12-May-26",
      "invoiceNo": "FBIS012026-000710",
      "amountReceived": 220.45
    },
    "totalPaid": 220.45,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-4",
    "branchId": "fbis-02"
  },
  {
    "no": 5,
    "studentCode": "3686",
    "nameKhmer": "ខូវ ផារ៉ាឌីលុចស",
    "nameEnglish": "Khauv Pharadeluxe",
    "gender": "ប្រុស",
    "dob": "15-Oct-2013",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 981,
    "discountPercent": 0,
    "incentive": 0,
    "amountPayable": 981,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 245.25,
    "installment1": {
      "date": "21-May-26",
      "invoiceNo": "FBIS012026-000753",
      "amountReceived": 245.25
    },
    "totalPaid": 245.25,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-5",
    "branchId": "fbis-02"
  },
  {
    "no": 6,
    "studentCode": "FBIS5471",
    "nameKhmer": "គង់ លីហួរ",
    "nameEnglish": "Kong Lyhour",
    "gender": "ប្រុស",
    "dob": "7-Sep-2012",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 981,
    "discountPercent": 0,
    "incentive": 0,
    "amountPayable": 981,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 163.5,
    "installment1": {
      "date": "22-May-26",
      "invoiceNo": "FBIS012026-000777",
      "amountReceived": 163.5
    },
    "totalPaid": 163.5,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-6",
    "branchId": "fbis-02"
  },
  {
    "no": 7,
    "studentCode": "FBIS5418",
    "nameKhmer": "គីម ដារ៉ានី",
    "nameEnglish": "Kim Darany",
    "gender": "ស្រី",
    "dob": "23-Aug-2014",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 961,
    "discountPercent": 50,
    "incentive": 0,
    "amountPayable": 480.5,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-7",
    "branchId": "fbis-02"
  },
  {
    "no": 8,
    "studentCode": "FBIS5454",
    "nameKhmer": "ឃីម ម៉ីលី",
    "nameEnglish": "Khim meili",
    "gender": "ស្រី",
    "dob": "31-Dec-2013",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 981,
    "discountPercent": 0,
    "incentive": 0,
    "amountPayable": 981,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-8",
    "branchId": "fbis-02"
  },
  {
    "no": 9,
    "studentCode": "FBIS250028",
    "nameKhmer": "ឃឹម នីតា",
    "nameEnglish": "KHOEM NYTA",
    "gender": "ស្រី",
    "dob": "05-Sep-2014",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 981,
    "discountPercent": 10,
    "incentive": 20,
    "amountPayable": 864.9,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-9",
    "branchId": "fbis-02"
  },
  {
    "no": 10,
    "studentCode": "FBIS22197",
    "nameKhmer": "ចាន់ វាសនាសាន់នី",
    "nameEnglish": "CHAN VEASNASUNNY",
    "gender": "ប្រុស",
    "dob": "25-Jul-2013",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 981,
    "discountPercent": 25,
    "incentive": 0,
    "amountPayable": 735.75,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-10",
    "branchId": "fbis-02"
  },
  {
    "no": 11,
    "studentCode": "3830",
    "nameKhmer": "ឆន ច្ប៉េងហួរ",
    "nameEnglish": "CHORN PENGHOURT",
    "gender": "ប្រុស",
    "dob": "28-Aug-2013",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 981,
    "discountPercent": 25,
    "incentive": 20,
    "amountPayable": 720.75,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-11",
    "branchId": "fbis-02"
  },
  {
    "no": 12,
    "studentCode": "FBIS5468",
    "nameKhmer": "ឆាយ សុខហេង",
    "nameEnglish": "Chhay Sokheng",
    "gender": "ប្រុស",
    "dob": "25-Sep-2014",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 961,
    "discountPercent": 100,
    "incentive": 0,
    "amountPayable": 0,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-12",
    "branchId": "fbis-02"
  },
  {
    "no": 13,
    "studentCode": "FBIS22228",
    "nameKhmer": "ឆេង គឹមដារ៉ា",
    "nameEnglish": "CHHENG KIM DARA",
    "gender": "ស្រី",
    "dob": "19-Jul-2012",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 981,
    "discountPercent": 10,
    "incentive": 20,
    "amountPayable": 864.9,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-13",
    "branchId": "fbis-02"
  },
  {
    "no": 14,
    "studentCode": "FBIS0001",
    "nameKhmer": "ឆេង ម៉ូណា",
    "nameEnglish": "Chheng Mona",
    "gender": "ស្រី",
    "dob": "2-Dec-2012",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 490.5,
    "discountPercent": 10,
    "incentive": 0,
    "amountPayable": 441.45,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-14",
    "branchId": "fbis-02"
  },
  {
    "no": 15,
    "studentCode": "FBIS0002",
    "nameKhmer": "ឆេង សាណា",
    "nameEnglish": "Chheng Sana",
    "gender": "ស្រី",
    "dob": "2-Dec-2012",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 490.5,
    "discountPercent": 10,
    "incentive": 0,
    "amountPayable": 441.45,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-15",
    "branchId": "fbis-02"
  },
  {
    "no": 16,
    "studentCode": "FBIS32026",
    "nameKhmer": "ជា ចំរើន",
    "nameEnglish": "Chea ChamReun",
    "gender": "ប្រុស",
    "dob": "05-Jun-2013",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 981,
    "discountPercent": 25,
    "incentive": 20,
    "amountPayable": 720.75,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-16",
    "branchId": "fbis-02"
  },
  {
    "no": 17,
    "studentCode": "FBIS5513",
    "nameKhmer": "ឈឹម សុឈីក",
    "nameEnglish": "Chhim Sichick",
    "gender": "ប្រុស",
    "dob": "18-Nov-2013",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 961,
    "discountPercent": 100,
    "incentive": 0,
    "amountPayable": 0,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-17",
    "branchId": "fbis-02"
  },
  {
    "no": 18,
    "studentCode": "FBIS5445",
    "nameKhmer": "ដាំ ម៉េងឡុង",
    "nameEnglish": "Dam Menglong",
    "gender": "ប្រុស",
    "dob": "14-Apr-2014",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 961,
    "discountPercent": 10,
    "incentive": 0,
    "amountPayable": 864.9,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-18",
    "branchId": "fbis-02"
  },
  {
    "no": 19,
    "studentCode": "FBIS5465",
    "nameKhmer": "ឌៀង ដារីសា",
    "nameEnglish": "Dieng Darisa",
    "gender": "ស្រី",
    "dob": "14-Nov-2013",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 961,
    "discountPercent": 10,
    "incentive": 0,
    "amountPayable": 864.9,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-19",
    "branchId": "fbis-02"
  },
  {
    "no": 20,
    "studentCode": "FBIS4931",
    "nameKhmer": "ដេត ភារុន",
    "nameEnglish": "DET PHEARUN",
    "gender": "ប្រុស",
    "dob": "24-Oct-2012",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 981,
    "discountPercent": 10,
    "incentive": 0,
    "amountPayable": 882.9,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-20",
    "branchId": "fbis-02"
  },
  {
    "no": 21,
    "studentCode": "FBIS5498",
    "nameKhmer": "ណារ៉ាត ពេជ្រវឌ្ឍនា",
    "nameEnglish": "Nareat Pichvattana",
    "gender": "ប្រុស",
    "dob": "20-Apr-2014",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 981,
    "discountPercent": 25,
    "incentive": 0,
    "amountPayable": 735.75,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-21",
    "branchId": "fbis-02"
  },
  {
    "no": 22,
    "studentCode": "FBIS5515",
    "nameKhmer": "តាំង ស៊ីមឡេង",
    "nameEnglish": "Taing simleng",
    "gender": "ស្រី",
    "dob": "5-May-2012",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 981,
    "discountPercent": 20,
    "incentive": 156,
    "amountPayable": 628.8,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 158.8,
    "installment1": {
      "date": "30-May-26",
      "invoiceNo": "FBIS012026-000867",
      "amountReceived": 158.8
    },
    "totalPaid": 158.8,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-22",
    "branchId": "fbis-02"
  },
  {
    "no": 23,
    "studentCode": "FBIS5496",
    "nameKhmer": "ថុន សុវណ្ណវឌ្ឍនៈ",
    "nameEnglish": "Thon Sovanvattanak",
    "gender": "ប្រុស",
    "dob": "17-Jan-2013",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 961,
    "discountPercent": 50,
    "incentive": 0,
    "amountPayable": 480.5,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-23",
    "branchId": "fbis-02"
  },
  {
    "no": 24,
    "studentCode": "FBIS5500",
    "nameKhmer": "ទាឆ ម៉ីជិញ",
    "nameEnglish": "Teach Meychhinh",
    "gender": "ស្រី",
    "dob": "9-Mar-2014",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 961,
    "discountPercent": 30,
    "incentive": 0,
    "amountPayable": 672.7,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-24",
    "branchId": "fbis-02"
  },
  {
    "no": 25,
    "studentCode": "32337",
    "nameKhmer": "ទឹម ជីងឡាង",
    "nameEnglish": "TIM CINGLANG",
    "gender": "ស្រី",
    "dob": "28-Apr-2013",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 981,
    "discountPercent": 50,
    "incentive": 20,
    "amountPayable": 480.5,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-25",
    "branchId": "fbis-02"
  },
  {
    "no": 26,
    "studentCode": "FBIS32751",
    "nameKhmer": "ធុឆ សៀវឈីញ",
    "nameEnglish": "THUCH SIEVCHHING",
    "gender": "ស្រី",
    "dob": "01-Jul-2014",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 961,
    "discountPercent": 100,
    "incentive": 0,
    "amountPayable": 0,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-26",
    "branchId": "fbis-02"
  },
  {
    "no": 27,
    "studentCode": "32962",
    "nameKhmer": "ប៊ុន លាភា",
    "nameEnglish": "Bun Leaphea",
    "gender": "ស្រី",
    "dob": "05-Dec-2013",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 981,
    "discountPercent": 40,
    "incentive": 0,
    "amountPayable": 588.6,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-27",
    "branchId": "fbis-02"
  },
  {
    "no": 28,
    "studentCode": "4754",
    "nameKhmer": "ប៊ាន បូរិន",
    "nameEnglish": "BAN BORIN",
    "gender": "ប្រុស",
    "dob": "14-Jan-2015",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 981,
    "discountPercent": 10,
    "incentive": 0,
    "amountPayable": 882.9,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-28",
    "branchId": "fbis-02"
  },
  {
    "no": 29,
    "studentCode": "FBIS4948",
    "nameKhmer": "ព្រឹក ភីប៊ី",
    "nameEnglish": "PRUEK PHOEBE",
    "gender": "ស្រី",
    "dob": "13-Oct-2013",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 981,
    "discountPercent": 10,
    "incentive": 20,
    "amountPayable": 864.9,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-29",
    "branchId": "fbis-02"
  },
  {
    "no": 30,
    "studentCode": "FBIS5503",
    "nameKhmer": "ភិរម្យ លីវីរ៉ូថ",
    "nameEnglish": "Phireak Liviroth",
    "gender": "ប្រុស",
    "dob": "25-Feb-2013",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 981,
    "discountPercent": 15,
    "incentive": 0,
    "amountPayable": 833.85,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-30",
    "branchId": "fbis-02"
  },
  {
    "no": 31,
    "studentCode": "FBIS5464",
    "nameKhmer": "ម៉ក់ ដេវីត",
    "nameEnglish": "Mork Devit",
    "gender": "ប្រុស",
    "dob": "7-Apr-2012",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 961,
    "discountPercent": 0,
    "incentive": 0,
    "amountPayable": 961,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-31",
    "branchId": "fbis-02"
  },
  {
    "no": 32,
    "studentCode": "FBIS5469",
    "nameKhmer": "យ៉ាន់ សិរីវឌ្ឍនា",
    "nameEnglish": "Yann Sereyvathana",
    "gender": "ស្រី",
    "dob": "1-Aug-2014",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 961,
    "discountPercent": 50,
    "incentive": 0,
    "amountPayable": 480.5,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-32",
    "branchId": "fbis-02"
  },
  {
    "no": 33,
    "studentCode": "FBIS0003",
    "nameKhmer": "យ៉ាយ៉ាន ម៉ាលីកា",
    "nameEnglish": "Yayan Malika",
    "gender": "ស្រី",
    "dob": "11-Jan-2014",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 490.5,
    "discountPercent": 10,
    "incentive": 0,
    "amountPayable": 441.45,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-33",
    "branchId": "fbis-02"
  },
  {
    "no": 34,
    "studentCode": "FBIS5425",
    "nameKhmer": "យ៉ែត យ៉ាបញ្ញារ័ត្ន",
    "nameEnglish": "Yet Yapanharoth",
    "gender": "ស្រី",
    "dob": "13-Jan-2013",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 961,
    "discountPercent": 10,
    "incentive": 0,
    "amountPayable": 864.9,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-34",
    "branchId": "fbis-02"
  },
  {
    "no": 35,
    "studentCode": "30605",
    "nameKhmer": "រុំ មុនីរ័ត្ន",
    "nameEnglish": "Rom Monyroth",
    "gender": "ស្រី",
    "dob": "28-Dec-2013",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 981,
    "discountPercent": 10,
    "incentive": 0,
    "amountPayable": 882.9,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-35",
    "branchId": "fbis-02"
  },
  {
    "no": 36,
    "studentCode": "FBIS5424",
    "nameKhmer": "រឿន ជីញអុី",
    "nameEnglish": "Roeun chinge",
    "gender": "ស្រី",
    "dob": "5-May-2015",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 981,
    "discountPercent": 25,
    "incentive": 0,
    "amountPayable": 735.75,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 183.75,
    "installment1": {
      "date": "7-May-26",
      "invoiceNo": "FBIS012026-000685",
      "amountReceived": 183.75
    },
    "totalPaid": 183.75,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-36",
    "branchId": "fbis-02"
  },
  {
    "no": 37,
    "studentCode": "FBIS5405",
    "nameKhmer": "លី ឆាយហុង",
    "nameEnglish": "Ly Chhayhong",
    "gender": "ប្រុស",
    "dob": "10-Mar-12",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 961,
    "discountPercent": 20,
    "incentive": 0,
    "amountPayable": 768.8,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-37",
    "branchId": "fbis-02"
  },
  {
    "no": 38,
    "studentCode": "FBIS4952",
    "nameKhmer": "លី នីណា",
    "nameEnglish": "LY NYNA",
    "gender": "ស្រី",
    "dob": "05-Sep-2013",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 981,
    "discountPercent": 10,
    "incentive": 0,
    "amountPayable": 882.9,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-38",
    "branchId": "fbis-02"
  },
  {
    "no": 39,
    "studentCode": "FBIS5429",
    "nameKhmer": "លីអ៊ាង គីមឡុង",
    "nameEnglish": "Lyeang Kimlong",
    "gender": "ប្រុស",
    "dob": "24-Apr-2013",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 961,
    "discountPercent": 10,
    "incentive": 0,
    "amountPayable": 864.9,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-39",
    "branchId": "fbis-02"
  },
  {
    "no": 40,
    "studentCode": "FBIS5432",
    "nameKhmer": "លីម ឈីវ",
    "nameEnglish": "Lim Chhiv",
    "gender": "ប្រុស",
    "dob": "17-Sep-2013",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 961,
    "discountPercent": 20,
    "incentive": 0,
    "amountPayable": 768.8,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-40",
    "branchId": "fbis-02"
  },
  {
    "no": 41,
    "studentCode": "FBIS5410",
    "nameKhmer": "វង្ស យ៉ូស្វេ",
    "nameEnglish": "Wong Joshua",
    "gender": "ប្រុស",
    "dob": "2-May-2013",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 981,
    "discountPercent": 0,
    "incentive": 0,
    "amountPayable": 981,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-41",
    "branchId": "fbis-02"
  },
  {
    "no": 42,
    "studentCode": "4351",
    "nameKhmer": "វេង សុគន្ធវិច្ឆិកា",
    "nameEnglish": "Veng Sokunvicheka",
    "gender": "ស្រី",
    "dob": "18-Nov-2014",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 981,
    "discountPercent": 50,
    "incentive": 0,
    "amountPayable": 490.5,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-42",
    "branchId": "fbis-02"
  },
  {
    "no": 43,
    "studentCode": "FBIS5475",
    "nameKhmer": "សិន រដ្ឋាវីតា",
    "nameEnglish": "Sen Rathavita",
    "gender": "ស្រី",
    "dob": "21-Oct-2013",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 961,
    "discountPercent": 100,
    "incentive": 0,
    "amountPayable": 0,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-43",
    "branchId": "fbis-02"
  },
  {
    "no": 44,
    "studentCode": "FBIS5470",
    "nameKhmer": "សាម៉េត សុខសីហា",
    "nameEnglish": "Sameth sokseyha",
    "gender": "ប្រុស",
    "dob": "5-Oct-2012",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 981,
    "discountPercent": 0,
    "incentive": 0,
    "amountPayable": 981,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 240.5,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 240.5,
      "semester2": 0,
      "pastYear": 0,
      "total": 240.5
    },
    "id": "kdue-44",
    "branchId": "fbis-02"
  },
  {
    "no": 45,
    "studentCode": "2979",
    "nameKhmer": "សារ៉ូម លៀងសៀវហួរ",
    "nameEnglish": "Sarorm Leangsievhor",
    "gender": "ប្រុស",
    "dob": "08-Nov-2012",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 981,
    "discountPercent": 10,
    "incentive": 0,
    "amountPayable": 882.9,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-45",
    "branchId": "fbis-02"
  },
  {
    "no": 46,
    "studentCode": "FBIS5483",
    "nameKhmer": "សុខ កុសុមៈ",
    "nameEnglish": "Sok Kosomak",
    "gender": "ស្រី",
    "dob": "24-Mar-2014",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 961,
    "discountPercent": 25,
    "incentive": 0,
    "amountPayable": 720.75,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-46",
    "branchId": "fbis-02"
  },
  {
    "no": 47,
    "studentCode": "FBIS32187",
    "nameKhmer": "សុខ ចិត្រា",
    "nameEnglish": "Sok Chetra",
    "gender": "ប្រុស",
    "dob": "10-Jun-2013",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 961,
    "discountPercent": 100,
    "incentive": 0,
    "amountPayable": 0,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-47",
    "branchId": "fbis-02"
  },
  {
    "no": 48,
    "studentCode": "FBIS5455",
    "nameKhmer": "សុខ ម៉ីគង់",
    "nameEnglish": "Sok Meykong",
    "gender": "ស្រី",
    "dob": "22-Jul-2013",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 981,
    "discountPercent": 10,
    "incentive": 0,
    "amountPayable": 882.9,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-48",
    "branchId": "fbis-02"
  },
  {
    "no": 49,
    "studentCode": "FBIS5512",
    "nameKhmer": "សុខណាហាវីន",
    "nameEnglish": "Sokna havin",
    "gender": "ប្រុស",
    "dob": "7-Jan-2014",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 981,
    "discountPercent": 25,
    "incentive": 0,
    "amountPayable": 735.75,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 366.75,
    "installment1": {
      "date": "27-May-26",
      "invoiceNo": "FBIS012026-000840",
      "amountReceived": 366.75
    },
    "totalPaid": 366.75,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-49",
    "branchId": "fbis-02"
  },
  {
    "no": 50,
    "studentCode": "32691",
    "nameKhmer": "សុខថាន សេដ្ឋាធានីនាថ",
    "nameEnglish": "Sokthan Sethanineath",
    "gender": "ស្រី",
    "dob": "17-Oct-2013",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 981,
    "discountPercent": 40,
    "incentive": 0,
    "amountPayable": 588.6,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-50",
    "branchId": "fbis-02"
  },
  {
    "no": 51,
    "studentCode": "FBIS25135",
    "nameKhmer": "សៅ សុជា",
    "nameEnglish": "SAO SOCHEA",
    "gender": "ប្រុស",
    "dob": "29-Mar-2013",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 981,
    "discountPercent": 20,
    "incentive": 0,
    "amountPayable": 784.8,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-51",
    "branchId": "fbis-02"
  },
  {
    "no": 52,
    "studentCode": "FBIS5456",
    "nameKhmer": "សំអុល រចនាពិសាល",
    "nameEnglish": "Somol Rachanapisal",
    "gender": "ប្រុស",
    "dob": "10-Dec-2013",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 981,
    "discountPercent": 20,
    "incentive": 0,
    "amountPayable": 784.8,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-52",
    "branchId": "fbis-02"
  },
  {
    "no": 53,
    "studentCode": "FBIS3988",
    "nameKhmer": "ហ៊ាន វិវឌ្ឍន៍",
    "nameEnglish": "Hean Viwadh",
    "gender": "ប្រុស",
    "dob": "25-Jun-2013",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 981,
    "discountPercent": 20,
    "incentive": 0,
    "amountPayable": 784.8,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-53",
    "branchId": "fbis-02"
  },
  {
    "no": 54,
    "studentCode": "FBIS5428",
    "nameKhmer": "ហាក់ស្រ៊ាង ឈុនហួរ",
    "nameEnglish": "Haksreang Chhunhour",
    "gender": "ប្រុស",
    "dob": "4-Jan-2013",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 961,
    "discountPercent": 10,
    "incentive": 0,
    "amountPayable": 864.9,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-54",
    "branchId": "fbis-02"
  },
  {
    "no": 55,
    "studentCode": "FBIS5484",
    "nameKhmer": "ហេង ឆាយអុី",
    "nameEnglish": "Heng chayei",
    "gender": "ស្រី",
    "dob": "26-Feb-2014",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 981,
    "discountPercent": 10,
    "incentive": 0,
    "amountPayable": 882.9,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 220.45,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 220.45,
      "semester2": 0,
      "pastYear": 0,
      "total": 220.45
    },
    "id": "kdue-55",
    "branchId": "fbis-02"
  },
  {
    "no": 56,
    "studentCode": "FBIS5511",
    "nameKhmer": "ហេង អេងឆាយ",
    "nameEnglish": "Heng engchay",
    "gender": "ប្រុស",
    "dob": "3-Aug-2008",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 981,
    "discountPercent": 10,
    "incentive": 0,
    "amountPayable": 882.9,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 282.45,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 282.45,
      "semester2": 0,
      "pastYear": 0,
      "total": 282.45
    },
    "id": "kdue-56",
    "branchId": "fbis-02"
  },
  {
    "no": 57,
    "studentCode": "32364",
    "nameKhmer": "ឡាយ សុភាព",
    "nameEnglish": "Lay Sopheap",
    "gender": "ប្រុស",
    "dob": "14-Oct-2013",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 981,
    "discountPercent": 25,
    "incentive": 0,
    "amountPayable": 735.75,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-57",
    "branchId": "fbis-02"
  },
  {
    "no": 58,
    "studentCode": "FBIS5479",
    "nameKhmer": "ឡាំ វណ្ណលីង",
    "nameEnglish": "Lam Vannling",
    "gender": "ស្រី",
    "dob": "23-Feb-2013",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 981,
    "discountPercent": 25,
    "incentive": 0,
    "amountPayable": 735.75,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-58",
    "branchId": "fbis-02"
  },
  {
    "no": 59,
    "studentCode": "FBIS5482",
    "nameKhmer": "ឡោ ច័ន្ទសុវណ្ណ",
    "nameEnglish": "Lor Chansovann",
    "gender": "ប្រុស",
    "dob": "20-Aug-2012",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 981,
    "discountPercent": 0,
    "incentive": 0,
    "amountPayable": 981,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 245.25,
    "installment1": {
      "date": "12-May-26",
      "invoiceNo": "FBIS012026-000704",
      "amountReceived": 245.25
    },
    "totalPaid": 245.25,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-59",
    "branchId": "fbis-02"
  },
  {
    "no": 60,
    "studentCode": "FBIS5402",
    "nameKhmer": "អ៊ុច ទីពរ",
    "nameEnglish": "Uch Tipor",
    "gender": "ស្រី",
    "dob": "28-Sep-2013",
    "academicYear": "2026-2027",
    "status": "កំពុងសិក្សា",
    "fullTuition": 1081,
    "discountPercent": 25,
    "incentive": 0,
    "amountPayable": 810.75,
    "pastYearDue": 0,
    "newYearDue": 261.23,
    "beginningBalanceDue": 666.6,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 405.38,
      "semester2": 0,
      "pastYear": 261.23,
      "total": 666.6
    },
    "id": "kdue-60",
    "branchId": "fbis-02"
  },
  {
    "no": 61,
    "studentCode": "FBIS4796",
    "nameKhmer": "អ៊ូ បញ្ញារីណា",
    "nameEnglish": "OU PANHARINA",
    "gender": "ស្រី",
    "dob": "08-Jan-2013",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 981,
    "discountPercent": 10,
    "incentive": 0,
    "amountPayable": 882.9,
    "pastYearDue": 0,
    "newYearDue": 0,
    "beginningBalanceDue": 0,
    "totalPaid": 0,
    "endingDue": {
      "semester1": 0,
      "semester2": 0,
      "pastYear": 0,
      "total": 0
    },
    "id": "kdue-61",
    "branchId": "fbis-02"
  }
];

export const INITIAL_ENGLISH_DUE_RECORDS: EnglishDueRecord[] = [
  {
    "no": 1,
    "studentCode": "FBIS0001",
    "nameKhmer": "កនី ណាបល ី",
    "nameEnglish": "Kin nabeel",
    "gender": "M",
    "dob": "8-Jan-2020",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 640,
    "discountPercent": 20,
    "annualIncentive": 0,
    "incentive": 0,
    "amountPayableTuition": 512,
    "pastYearDue": {
      "tuition": 100,
      "adminFee": 0
    },
    "beginningQuarterDue": {
      "q1": {
        "tuition": 0,
        "adminFee": 0
      },
      "q2": {
        "tuition": 128,
        "adminFee": 25
      },
      "q3": {
        "tuition": 128,
        "adminFee": 25
      },
      "q4": {
        "tuition": 128,
        "adminFee": 25
      },
      "newYearTotal": {
        "tuition": 384,
        "adminFee": 75
      }
    },
    "totalPaid": {
      "tuition": 0,
      "adminFee": 0
    },
    "paymentCount": 1,
    "endingQuarterDue": {
      "pastYear": {
        "tuition": 0,
        "adminFee": 0
      },
      "q1": {
        "tuition": 0,
        "adminFee": 0
      },
      "q2": {
        "tuition": 128,
        "adminFee": 25
      },
      "q3": {
        "tuition": 128,
        "adminFee": 25
      },
      "q4": {
        "tuition": 128,
        "adminFee": 25
      },
      "total": {
        "tuition": 384,
        "adminFee": 75
      }
    },
    "id": "edue-1",
    "branchId": "fbis-02"
  },
  {
    "no": 2,
    "studentCode": "FBIS5145",
    "nameKhmer": "ឆឹង វឌ្ឍនវិសាល",
    "nameEnglish": "Chhoeng Vidgen Allan",
    "gender": "M",
    "dob": "2-Oct-2021",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 575,
    "discountPercent": 0,
    "annualIncentive": 0,
    "incentive": 0,
    "amountPayableTuition": 575,
    "pastYearDue": {
      "tuition": 100,
      "adminFee": 0
    },
    "beginningQuarterDue": {
      "q1": {
        "tuition": 0,
        "adminFee": 0
      },
      "q2": {
        "tuition": 0,
        "adminFee": 0
      },
      "q3": {
        "tuition": 0,
        "adminFee": 0
      },
      "q4": {
        "tuition": 0,
        "adminFee": 0
      },
      "newYearTotal": {
        "tuition": 0,
        "adminFee": 0
      }
    },
    "totalPaid": {
      "tuition": 0,
      "adminFee": 0
    },
    "paymentCount": 0,
    "endingQuarterDue": {
      "pastYear": {
        "tuition": 0,
        "adminFee": 0
      },
      "q1": {
        "tuition": 0,
        "adminFee": 0
      },
      "q2": {
        "tuition": 0,
        "adminFee": 0
      },
      "q3": {
        "tuition": 0,
        "adminFee": 0
      },
      "q4": {
        "tuition": 0,
        "adminFee": 0
      },
      "total": {
        "tuition": 0,
        "adminFee": 0
      }
    },
    "id": "edue-2",
    "branchId": "fbis-02"
  },
  {
    "no": 3,
    "studentCode": "FBIS5140",
    "nameKhmer": "ញឹម ផាឌីន",
    "nameEnglish": "Nhem Phaodin",
    "gender": "M",
    "dob": "21-Sep-2020",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 640,
    "discountPercent": 0,
    "annualIncentive": 0,
    "incentive": 0,
    "amountPayableTuition": 640,
    "pastYearDue": {
      "tuition": 100,
      "adminFee": 0
    },
    "beginningQuarterDue": {
      "q1": {
        "tuition": 0,
        "adminFee": 0
      },
      "q2": {
        "tuition": 160,
        "adminFee": 25
      },
      "q3": {
        "tuition": 160,
        "adminFee": 25
      },
      "q4": {
        "tuition": 160,
        "adminFee": 25
      },
      "newYearTotal": {
        "tuition": 480,
        "adminFee": 75
      }
    },
    "totalPaid": {
      "tuition": 0,
      "adminFee": 0
    },
    "paymentCount": 1,
    "endingQuarterDue": {
      "pastYear": {
        "tuition": 0,
        "adminFee": 0
      },
      "q1": {
        "tuition": 0,
        "adminFee": 0
      },
      "q2": {
        "tuition": 160,
        "adminFee": 25
      },
      "q3": {
        "tuition": 160,
        "adminFee": 25
      },
      "q4": {
        "tuition": 160,
        "adminFee": 25
      },
      "total": {
        "tuition": 480,
        "adminFee": 75
      }
    },
    "id": "edue-3",
    "branchId": "fbis-02"
  },
  {
    "no": 4,
    "studentCode": "FBIS4981",
    "nameKhmer": "ថាំង សុខដាវីន",
    "nameEnglish": "Thang Sokdavin",
    "gender": "M",
    "dob": "20-Nov-2020",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 640,
    "discountPercent": 20,
    "annualIncentive": 0,
    "incentive": 0,
    "amountPayableTuition": 512,
    "pastYearDue": {
      "tuition": 100,
      "adminFee": 0
    },
    "beginningQuarterDue": {
      "q1": {
        "tuition": 0,
        "adminFee": 0
      },
      "q2": {
        "tuition": 128,
        "adminFee": 25
      },
      "q3": {
        "tuition": 128,
        "adminFee": 25
      },
      "q4": {
        "tuition": 128,
        "adminFee": 25
      },
      "newYearTotal": {
        "tuition": 384,
        "adminFee": 75
      }
    },
    "totalPaid": {
      "tuition": 0,
      "adminFee": 0
    },
    "paymentCount": 1,
    "endingQuarterDue": {
      "pastYear": {
        "tuition": 0,
        "adminFee": 0
      },
      "q1": {
        "tuition": 0,
        "adminFee": 0
      },
      "q2": {
        "tuition": 128,
        "adminFee": 25
      },
      "q3": {
        "tuition": 128,
        "adminFee": 25
      },
      "q4": {
        "tuition": 128,
        "adminFee": 25
      },
      "total": {
        "tuition": 384,
        "adminFee": 75
      }
    },
    "id": "edue-4",
    "branchId": "fbis-02"
  },
  {
    "no": 5,
    "studentCode": "FBIS5055",
    "nameKhmer": "ធីរ៉ាន ចំរើនឧត្តម",
    "nameEnglish": "Thyran Chamroeun Oudom",
    "gender": "M",
    "dob": "25-Mar-2019",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 610,
    "discountPercent": 0,
    "annualIncentive": 0,
    "incentive": 0,
    "amountPayableTuition": 610,
    "pastYearDue": {
      "tuition": 100,
      "adminFee": 0
    },
    "beginningQuarterDue": {
      "q1": {
        "tuition": 0,
        "adminFee": 0
      },
      "q2": {
        "tuition": 0,
        "adminFee": 0
      },
      "q3": {
        "tuition": 152.5,
        "adminFee": 0
      },
      "q4": {
        "tuition": 152.5,
        "adminFee": 0
      },
      "newYearTotal": {
        "tuition": 305,
        "adminFee": 0
      }
    },
    "totalPaid": {
      "tuition": 0,
      "adminFee": 0
    },
    "paymentCount": 1,
    "endingQuarterDue": {
      "pastYear": {
        "tuition": 0,
        "adminFee": 0
      },
      "q1": {
        "tuition": 0,
        "adminFee": 0
      },
      "q2": {
        "tuition": 0,
        "adminFee": 0
      },
      "q3": {
        "tuition": 152.5,
        "adminFee": 0
      },
      "q4": {
        "tuition": 152.5,
        "adminFee": 0
      },
      "total": {
        "tuition": 305,
        "adminFee": 0
      }
    },
    "id": "edue-5",
    "branchId": "fbis-02"
  },
  {
    "no": 6,
    "studentCode": "FBIS164957",
    "nameKhmer": "រដ្ឋា មិត្តវឌ្ឍនា",
    "nameEnglish": "Ratha Mithvathana",
    "gender": "M",
    "dob": "22-Oct-2020",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 640,
    "discountPercent": 20,
    "annualIncentive": 0,
    "incentive": 0,
    "amountPayableTuition": 512,
    "pastYearDue": {
      "tuition": 100,
      "adminFee": 0
    },
    "beginningQuarterDue": {
      "q1": {
        "tuition": 0,
        "adminFee": 0
      },
      "q2": {
        "tuition": 128,
        "adminFee": 25
      },
      "q3": {
        "tuition": 128,
        "adminFee": 25
      },
      "q4": {
        "tuition": 128,
        "adminFee": 25
      },
      "newYearTotal": {
        "tuition": 384,
        "adminFee": 75
      }
    },
    "totalPaid": {
      "tuition": 0,
      "adminFee": 0
    },
    "paymentCount": 1,
    "endingQuarterDue": {
      "pastYear": {
        "tuition": 0,
        "adminFee": 0
      },
      "q1": {
        "tuition": 0,
        "adminFee": 0
      },
      "q2": {
        "tuition": 128,
        "adminFee": 25
      },
      "q3": {
        "tuition": 128,
        "adminFee": 25
      },
      "q4": {
        "tuition": 128,
        "adminFee": 25
      },
      "total": {
        "tuition": 384,
        "adminFee": 75
      }
    },
    "id": "edue-6",
    "branchId": "fbis-02"
  },
  {
    "no": 7,
    "studentCode": "FBIS5037",
    "nameKhmer": "វ៉នតុលា បញ្ញាបុត្រ",
    "nameEnglish": "VorntoklaPhanhabot",
    "gender": "M",
    "dob": "6-Dec-2019",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 610,
    "discountPercent": 30,
    "annualIncentive": 0,
    "incentive": 0,
    "amountPayableTuition": 427,
    "pastYearDue": {
      "tuition": 100,
      "adminFee": 0
    },
    "beginningQuarterDue": {
      "q1": {
        "tuition": 0,
        "adminFee": 0
      },
      "q2": {
        "tuition": 0,
        "adminFee": 0
      },
      "q3": {
        "tuition": 106.75,
        "adminFee": 25
      },
      "q4": {
        "tuition": 106.75,
        "adminFee": 25
      },
      "newYearTotal": {
        "tuition": 213.5,
        "adminFee": 50
      }
    },
    "totalPaid": {
      "tuition": 0,
      "adminFee": 0
    },
    "paymentCount": 1,
    "endingQuarterDue": {
      "pastYear": {
        "tuition": 0,
        "adminFee": 0
      },
      "q1": {
        "tuition": 0,
        "adminFee": 0
      },
      "q2": {
        "tuition": 0,
        "adminFee": 0
      },
      "q3": {
        "tuition": 106.75,
        "adminFee": 25
      },
      "q4": {
        "tuition": 106.75,
        "adminFee": 25
      },
      "total": {
        "tuition": 213.5,
        "adminFee": 50
      }
    },
    "id": "edue-7",
    "branchId": "fbis-02"
  },
  {
    "no": 8,
    "studentCode": "FBIS5065",
    "nameKhmer": "ស៊ីនត្រុន ការីណា",
    "nameEnglish": "Gintron Karina",
    "gender": "F",
    "dob": "10-Jun-2022",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 575,
    "discountPercent": 0,
    "annualIncentive": 0,
    "incentive": 0,
    "amountPayableTuition": 575,
    "pastYearDue": {
      "tuition": 100,
      "adminFee": 0
    },
    "beginningQuarterDue": {
      "q1": {
        "tuition": 0,
        "adminFee": 0
      },
      "q2": {
        "tuition": 0,
        "adminFee": 0
      },
      "q3": {
        "tuition": 0,
        "adminFee": 0
      },
      "q4": {
        "tuition": 0,
        "adminFee": 0
      },
      "newYearTotal": {
        "tuition": 0,
        "adminFee": 0
      }
    },
    "totalPaid": {
      "tuition": 0,
      "adminFee": 0
    },
    "paymentCount": 0,
    "endingQuarterDue": {
      "pastYear": {
        "tuition": 0,
        "adminFee": 0
      },
      "q1": {
        "tuition": 0,
        "adminFee": 0
      },
      "q2": {
        "tuition": 0,
        "adminFee": 0
      },
      "q3": {
        "tuition": 0,
        "adminFee": 0
      },
      "q4": {
        "tuition": 0,
        "adminFee": 0
      },
      "total": {
        "tuition": 0,
        "adminFee": 0
      }
    },
    "id": "edue-8",
    "branchId": "fbis-02"
  },
  {
    "no": 9,
    "studentCode": "FBIS5044",
    "nameKhmer": "សុខ សុវណ្ណឧត្តម",
    "nameEnglish": "SoK Sovanoudom",
    "gender": "M",
    "dob": "24-Sep-2020",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 640,
    "discountPercent": 0,
    "annualIncentive": 0,
    "incentive": 0,
    "amountPayableTuition": 640,
    "pastYearDue": {
      "tuition": 100,
      "adminFee": 0
    },
    "beginningQuarterDue": {
      "q1": {
        "tuition": 106.67,
        "adminFee": 0
      },
      "q2": {
        "tuition": 160,
        "adminFee": 25
      },
      "q3": {
        "tuition": 160,
        "adminFee": 25
      },
      "q4": {
        "tuition": 160,
        "adminFee": 25
      },
      "newYearTotal": {
        "tuition": 586.67,
        "adminFee": 75
      }
    },
    "totalPaid": {
      "tuition": 0,
      "adminFee": 0
    },
    "paymentCount": 1,
    "endingQuarterDue": {
      "pastYear": {
        "tuition": 0,
        "adminFee": 0
      },
      "q1": {
        "tuition": 106.67,
        "adminFee": 0
      },
      "q2": {
        "tuition": 160,
        "adminFee": 25
      },
      "q3": {
        "tuition": 160,
        "adminFee": 25
      },
      "q4": {
        "tuition": 160,
        "adminFee": 25
      },
      "total": {
        "tuition": 586.67,
        "adminFee": 75
      }
    },
    "id": "edue-9",
    "branchId": "fbis-02"
  },
  {
    "no": 10,
    "studentCode": "FBIS0011",
    "nameKhmer": "លឹម តុងសេង",
    "nameEnglish": "Lim Tongseng",
    "gender": "M",
    "dob": "26-Oct-2016",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 640,
    "discountPercent": 10,
    "annualIncentive": 0,
    "incentive": 0,
    "amountPayableTuition": 576,
    "pastYearDue": {
      "tuition": 100,
      "adminFee": 0
    },
    "beginningQuarterDue": {
      "q1": {
        "tuition": 0,
        "adminFee": 0
      },
      "q2": {
        "tuition": 144,
        "adminFee": 25
      },
      "q3": {
        "tuition": 144,
        "adminFee": 25
      },
      "q4": {
        "tuition": 144,
        "adminFee": 25
      },
      "newYearTotal": {
        "tuition": 432,
        "adminFee": 75
      }
    },
    "installment1": {
      "date": "28-May-26",
      "invoiceNoTuition": "FBIS2026-000521",
      "invoiceNoAdmin": "FBIS2026-000522",
      "invoiceNo": "FBIS2026-000521",
      "amountTuition": 144,
      "amountAdmin": 25
    },
    "totalPaid": {
      "tuition": 144,
      "adminFee": 25
    },
    "paymentCount": 1,
    "endingQuarterDue": {
      "pastYear": {
        "tuition": 0,
        "adminFee": 0
      },
      "q1": {
        "tuition": 0,
        "adminFee": 0
      },
      "q2": {
        "tuition": 0,
        "adminFee": 0
      },
      "q3": {
        "tuition": 144,
        "adminFee": 25
      },
      "q4": {
        "tuition": 144,
        "adminFee": 25
      },
      "total": {
        "tuition": 288,
        "adminFee": 50
      }
    },
    "id": "edue-10",
    "branchId": "fbis-02"
  },
  {
    "no": 11,
    "studentCode": "FBIS0014",
    "nameKhmer": "ហាន កេសា",
    "nameEnglish": "Han Kesa",
    "gender": "ស",
    "dob": "11-Jul-2020",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 640,
    "discountPercent": 10,
    "annualIncentive": 0,
    "incentive": 0,
    "amountPayableTuition": 576,
    "pastYearDue": {
      "tuition": 100,
      "adminFee": 0
    },
    "beginningQuarterDue": {
      "q1": {
        "tuition": 0,
        "adminFee": 0
      },
      "q2": {
        "tuition": 144,
        "adminFee": 25
      },
      "q3": {
        "tuition": 144,
        "adminFee": 25
      },
      "q4": {
        "tuition": 144,
        "adminFee": 25
      },
      "newYearTotal": {
        "tuition": 432,
        "adminFee": 75
      }
    },
    "totalPaid": {
      "tuition": 0,
      "adminFee": 0
    },
    "paymentCount": 1,
    "endingQuarterDue": {
      "pastYear": {
        "tuition": 0,
        "adminFee": 0
      },
      "q1": {
        "tuition": 0,
        "adminFee": 0
      },
      "q2": {
        "tuition": 144,
        "adminFee": 25
      },
      "q3": {
        "tuition": 144,
        "adminFee": 25
      },
      "q4": {
        "tuition": 144,
        "adminFee": 25
      },
      "total": {
        "tuition": 432,
        "adminFee": 75
      }
    },
    "id": "edue-11",
    "branchId": "fbis-02"
  },
  {
    "no": 12,
    "studentCode": "FBIS0015",
    "nameKhmer": "ផង់ពេជ្រ សិរីយមរ៉ា",
    "nameEnglish": "Phangpich sereyamara",
    "gender": "ស",
    "dob": "3-Apr-2020",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 640,
    "discountPercent": 10,
    "annualIncentive": 0,
    "incentive": 0,
    "amountPayableTuition": 576,
    "pastYearDue": {
      "tuition": 100,
      "adminFee": 0
    },
    "beginningQuarterDue": {
      "q1": {
        "tuition": 0,
        "adminFee": 0
      },
      "q2": {
        "tuition": 144,
        "adminFee": 25
      },
      "q3": {
        "tuition": 144,
        "adminFee": 25
      },
      "q4": {
        "tuition": 144,
        "adminFee": 25
      },
      "newYearTotal": {
        "tuition": 432,
        "adminFee": 75
      }
    },
    "totalPaid": {
      "tuition": 0,
      "adminFee": 0
    },
    "paymentCount": 1,
    "endingQuarterDue": {
      "pastYear": {
        "tuition": 0,
        "adminFee": 0
      },
      "q1": {
        "tuition": 0,
        "adminFee": 0
      },
      "q2": {
        "tuition": 144,
        "adminFee": 25
      },
      "q3": {
        "tuition": 144,
        "adminFee": 25
      },
      "q4": {
        "tuition": 144,
        "adminFee": 25
      },
      "total": {
        "tuition": 432,
        "adminFee": 75
      }
    },
    "id": "edue-12",
    "branchId": "fbis-02"
  },
  {
    "no": 13,
    "studentCode": "FBIS0021",
    "nameKhmer": "វីរ៉ូច ភីឡុត",
    "nameEnglish": "Viroch Pilot",
    "gender": "ប",
    "dob": "21-Feb-2021",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 575,
    "discountPercent": 20,
    "annualIncentive": 48,
    "incentive": 48,
    "amountPayableTuition": 412,
    "pastYearDue": {
      "tuition": 100,
      "adminFee": 0
    },
    "beginningQuarterDue": {
      "q1": {
        "tuition": 0,
        "adminFee": 0
      },
      "q2": {
        "tuition": 0,
        "adminFee": 0
      },
      "q3": {
        "tuition": 0,
        "adminFee": 0
      },
      "q4": {
        "tuition": 0,
        "adminFee": 0
      },
      "newYearTotal": {
        "tuition": 0,
        "adminFee": 0
      }
    },
    "totalPaid": {
      "tuition": 0,
      "adminFee": 0
    },
    "paymentCount": 0,
    "endingQuarterDue": {
      "pastYear": {
        "tuition": 0,
        "adminFee": 0
      },
      "q1": {
        "tuition": 0,
        "adminFee": 0
      },
      "q2": {
        "tuition": 0,
        "adminFee": 0
      },
      "q3": {
        "tuition": 0,
        "adminFee": 0
      },
      "q4": {
        "tuition": 0,
        "adminFee": 0
      },
      "total": {
        "tuition": 0,
        "adminFee": 0
      }
    },
    "id": "edue-13",
    "branchId": "fbis-02"
  },
  {
    "no": 14,
    "studentCode": "FBIS0009",
    "nameKhmer": "ហុង ចន្ទដាវីតា",
    "nameEnglish": "Hong chandavita",
    "gender": "ស",
    "dob": "23-Jul-2020",
    "academicYear": "2025-2026",
    "status": "កំពុងសិក្សា",
    "fullTuition": 640,
    "discountPercent": 20,
    "annualIncentive": 0,
    "incentive": 0,
    "amountPayableTuition": 512,
    "pastYearDue": {
      "tuition": 100,
      "adminFee": 0
    },
    "beginningQuarterDue": {
      "q1": {
        "tuition": 0,
        "adminFee": 0
      },
      "q2": {
        "tuition": 128,
        "adminFee": 25
      },
      "q3": {
        "tuition": 128,
        "adminFee": 25
      },
      "q4": {
        "tuition": 128,
        "adminFee": 25
      },
      "newYearTotal": {
        "tuition": 384,
        "adminFee": 75
      }
    },
    "installment1": {
      "date": "30-May-26",
      "invoiceNoTuition": "FBIS2026-000531",
      "invoiceNoAdmin": "FBIS2026-000532",
      "invoiceNo": "FBIS2026-000531",
      "amountTuition": 128,
      "amountAdmin": 25
    },
    "totalPaid": {
      "tuition": 128,
      "adminFee": 25
    },
    "paymentCount": 1,
    "endingQuarterDue": {
      "pastYear": {
        "tuition": 0,
        "adminFee": 0
      },
      "q1": {
        "tuition": 0,
        "adminFee": 0
      },
      "q2": {
        "tuition": 0,
        "adminFee": 0
      },
      "q3": {
        "tuition": 128,
        "adminFee": 25
      },
      "q4": {
        "tuition": 128,
        "adminFee": 25
      },
      "total": {
        "tuition": 256,
        "adminFee": 50
      }
    },
    "id": "edue-14",
    "branchId": "fbis-02"
  }
];
