import React, { useState } from 'react';
import { PaymentInvoice, Branch, SystemSettings } from '../../types';
import { Logo } from '../common/Logo';
import { Printer, X, Copy } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';

interface InvoicePrintModalProps {
  invoice: PaymentInvoice | null;
  branch: Branch;
  settings: SystemSettings;
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  invoice,
  branch,
  settings,
  onClose
}) => {
  const { getStudentById } = useSchool();
  const [isDualCopy, setIsDualCopy] = useState(true); // Default to 2 copies side-by-side as shown in user's image

  if (!invoice) return null;

  const student = getStudentById(invoice.studentId);
  const handlePrint = () => {
    window.print();
  };

  // VATTIN digits matching official format: B 1 1 6 - 9 0 2 2 0 2 1 0 0 0
  const vattinPrefix = ['B', '1', '1', '6'];
  const vattinNumber = ['9', '0', '2', '2', '0', '2', '1', '0', '0', '0'];

  const renderSingleInvoice = (copyLabel?: string) => (
    <div className="p-4 md:p-6 bg-white text-slate-900 text-[11px] leading-tight flex-1 font-sans border-slate-300">
      {/* School Header */}
      <div className="flex flex-col items-center text-center mb-2">
        <Logo size="md" branchNumber={branch.code.replace('FBIS ', '')} className="mb-1" />
        <h1 className="text-xs md:text-sm font-bold font-khmer text-slate-900 tracking-wide">
          {settings.schoolNameKhmer}
        </h1>
        <h2 className="text-[10px] md:text-xs font-black tracking-wider text-slate-900 uppercase">
          {settings.schoolNameEnglish}
        </h2>

        {/* VATTIN Box Row */}
        <div className="flex items-center justify-center gap-1 mt-1.5 text-[10px]">
          <span className="font-khmer text-slate-800 font-bold">អត្តសញ្ញាណសារពើពន្ធ (VATTIN)</span>
          <div className="flex items-center gap-0.5 ml-1">
            {vattinPrefix.map((digit, i) => (
              <span key={`p-${i}`} className="w-4 h-4 border border-black font-mono font-bold flex items-center justify-center text-[10px] bg-white">
                {digit}
              </span>
            ))}
            <span className="mx-0.5 font-bold">-</span>
            {vattinNumber.map((digit, i) => (
              <span key={`n-${i}`} className="w-4 h-4 border border-black font-mono font-bold flex items-center justify-center text-[10px] bg-white">
                {digit}
              </span>
            ))}
          </div>
        </div>

        {/* Address and Contacts */}
        <div className="text-[9.5px] text-slate-700 font-khmer mt-1 space-y-0.5">
          <div>
            <span className="font-semibold">អាសយដ្ឋាន:</span> {branch.addressKhmer || 'ភូមិសាលាកន្សែង សង្កាត់ស្វាយដង្គំ ក្រុងសៀមរាប ខេត្តសៀមរាប'}
          </div>
          <div>
            <span className="font-semibold">លេខទូរស័ព្ទ:</span> 092 732 711 / 077 321 453 / 011 674 674  <span className="ml-2 font-semibold">អ៊ីម៉ែល:</span> info@fbis.edu.kh
          </div>
        </div>

        {/* Large Invoice Title */}
        <div className="mt-2 text-center">
          <div className="text-sm md:text-base font-extrabold font-khmer text-slate-950">
            វិក្កយបត្រ
          </div>
          <div className="text-[11px] font-black tracking-wider text-slate-900 uppercase -mt-0.5">
            INVOICE
          </div>
          {copyLabel && (
            <div className="text-[9px] font-semibold text-slate-400 font-khmer uppercase">
              ({copyLabel})
            </div>
          )}
        </div>
      </div>

      {/* Customer and Invoice Details Strip (2 Columns) */}
      <div className="grid grid-cols-2 gap-2 text-[10px] mb-2 font-sans">
        {/* Left column: Customer info */}
        <div className="space-y-1">
          <div className="font-bold text-slate-900 font-khmer">
            អតិថិជន / Customer
          </div>
          <div className="flex">
            <span className="w-24 font-khmer text-slate-700">ឈ្មោះជាភាសាខ្មែរ ៖</span>
            <span className="font-bold font-khmer text-slate-950">{invoice.studentNameKhmer}</span>
          </div>
          <div className="flex">
            <span className="w-24 font-khmer text-slate-700">ឈ្មោះភាសាឡាតាំង ៖</span>
            <span className="font-medium text-slate-900">{invoice.studentName}</span>
          </div>
          <div className="flex">
            <span className="w-24 font-khmer text-slate-700">ថ្ងៃ ខែ ឆ្នាំកំណើត ៖</span>
            <span className="font-mono text-slate-900">{student?.birthday || '18/11/2011'}</span>
          </div>
          <div className="flex">
            <span className="w-24 font-khmer text-slate-700">ភេទ ៖</span>
            <span className="font-khmer text-slate-900">{student?.gender === 'Female' ? 'ស្រី' : 'ប្រុស'}</span>
          </div>
          <div className="flex">
            <span className="w-24 font-khmer text-slate-700">កម្រិត ៖</span>
            <span className="font-bold font-khmer text-slate-950">{invoice.classGrade}</span>
          </div>
          <div className="flex">
            <span className="w-24 font-khmer text-slate-700">ឆ្នាំសិក្សា ៖</span>
            <span className="font-mono text-slate-900">{invoice.academicYear}</span>
          </div>
        </div>

        {/* Right column: Invoice metadata */}
        <div className="space-y-1 text-right sm:text-left">
          <div className="flex justify-end sm:justify-start">
            <span className="w-24 font-khmer text-slate-700">លេខវិក្កយបត្រ ៖</span>
            <span className="font-mono font-bold text-slate-950">{invoice.invoiceNumber}</span>
          </div>
          <div className="flex justify-end sm:justify-start">
            <span className="w-24 font-khmer text-slate-700">កាលបរិច្ឆេទ ៖</span>
            <span className="font-mono text-slate-900">{invoice.issuedDate}</span>
          </div>
          <div className="flex justify-end sm:justify-start">
            <span className="w-24 font-khmer text-slate-700">អត្តលេខ ៖</span>
            <span className="font-mono font-bold text-slate-950">{invoice.studentCode || student?.roll || 'FBIS3072'}</span>
          </div>
          <div className="flex justify-end sm:justify-start">
            <span className="w-24 font-khmer text-slate-700">លេខទូរស័ព្ទ ៖</span>
            <span className="font-mono text-slate-900">{student?.phone || '096 528 2222'}</span>
          </div>
          <div className="flex justify-end sm:justify-start">
            <span className="w-24 font-khmer text-slate-700">ថ្ងៃបញ្ចប់ ៖</span>
            <span className="font-mono text-slate-900">{invoice.endDate}</span>
          </div>
          <div className="flex justify-end sm:justify-start">
            <span className="w-24 font-khmer text-slate-700">អត្រាប្រាក់ ៖</span>
            <span className="font-mono text-[9.5px] text-slate-900">1USD = {invoice.exchangeRate.toFixed(2)} KHR</span>
          </div>
        </div>
      </div>

      {/* Main Table Matching Screenshot format */}
      <table className="w-full border-collapse border border-slate-900 text-[10px] mb-2.5">
        <thead>
          <tr className="border-b border-slate-900 font-bold text-center">
            <th rowSpan={2} className="border-r border-slate-900 py-1.5 px-1 w-8">
              <div>ល.រ</div>
              <div className="text-[9px] font-sans font-normal">No</div>
            </th>
            <th rowSpan={2} className="border-r border-slate-900 py-1.5 px-2 text-center">
              <div>បរិយាយ</div>
              <div className="text-[9px] font-sans font-normal">Description</div>
            </th>
            <th colSpan={2} className="py-1 px-1 text-center">
              <div>ទឹកប្រាក់/AMOUNT</div>
            </th>
          </tr>
          <tr className="border-b border-slate-900 font-semibold text-center text-[9.5px]">
            <th className="border-r border-slate-900 py-1 px-2 w-20">ដុល្លារ/USD</th>
            <th className="py-1 px-2 w-20">រៀល/KHR</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-900 font-mono">
          {/* Row 1: Item Title */}
          <tr>
            <td className="border-r border-slate-900 py-1 px-1 text-center font-bold">1</td>
            <td className="border-r border-slate-900 py-1 px-2 font-khmer text-slate-900 font-medium">
              {invoice.title}
            </td>
            <td className="border-r border-slate-900 py-1 px-2 text-right">
              $ {invoice.fullAmount.toFixed(2)}
            </td>
            <td className="py-1 px-2 text-right text-slate-400">-</td>
          </tr>

          {/* Row 2: Discount */}
          <tr>
            <td className="border-r border-slate-900 py-0.5 px-1 text-center"></td>
            <td className="border-r border-slate-900 py-0.5 px-2 font-khmer text-slate-700">
              បញ្ចុះតម្លៃ (Discount)
            </td>
            <td className="border-r border-slate-900 py-0.5 px-2 text-right">
              {invoice.discountPercent.toFixed(2)} %
            </td>
            <td className="py-0.5 px-2 text-right text-slate-400">-</td>
          </tr>

          {/* Row 3: Incentive / Promotion */}
          <tr>
            <td className="border-r border-slate-900 py-0.5 px-1 text-center"></td>
            <td className="border-r border-slate-900 py-0.5 px-2 font-khmer text-slate-700">
              ការលើកទឹកចិត្ត (Promotion)
            </td>
            <td className="border-r border-slate-900 py-0.5 px-2 text-right">
              $ {invoice.promotionAmount.toFixed(2)}
            </td>
            <td className="py-0.5 px-2 text-right text-slate-400">-</td>
          </tr>

          {/* Row 4: Total Payable */}
          <tr className="font-bold bg-slate-50/50">
            <td colSpan={2} className="border-r border-slate-900 py-1 px-3 text-right font-khmer text-slate-950">
              ទឹកប្រាក់សរុបត្រូវបង់ (Total To Be Paid)
            </td>
            <td className="border-r border-slate-900 py-1 px-2 text-right text-slate-950">
              $ {invoice.amountToBePaid.toFixed(2)}
            </td>
            <td className="py-1 px-2 text-right text-slate-400">-</td>
          </tr>

          {/* Row 5: Amount Paid */}
          <tr className="font-bold">
            <td colSpan={2} className="border-r border-slate-900 py-1 px-3 text-right font-khmer text-slate-900">
              ទឹកប្រាក់បានបង់ (Amount Paid)
            </td>
            <td className="border-r border-slate-900 py-1 px-2 text-right text-slate-900">
              $ {invoice.paidUSD.toFixed(2)}
            </td>
            <td className="py-1 px-2 text-right text-slate-900">
              {invoice.paidKHR > 0 ? invoice.paidKHR.toLocaleString() : '0'}
            </td>
          </tr>

          {/* Row 6: Remaining Due */}
          <tr className="font-bold">
            <td colSpan={2} className="border-r border-slate-900 py-1 px-3 text-right font-khmer text-red-600">
              ទឹកប្រាក់ជំពាក់ (Owed Remain)
            </td>
            <td className="border-r border-slate-900 py-1 px-2 text-right text-red-600">
              $ {invoice.owedRemain.toFixed(2)}
            </td>
            <td className="py-1 px-2 text-right text-slate-400">-</td>
          </tr>
        </tbody>
      </table>

      {/* Footer Notes and Payment Method */}
      <div className="flex justify-between items-start text-[10px] mb-6 font-sans">
        {/* Left: Notice */}
        <div className="max-w-[180px] text-slate-800 font-khmer font-bold text-[9.5px] leading-tight">
          សម្គាល់ ៖ - ប្រាក់បង់ហើយមិនអាចដក ឬផ្ទេរវិញបានទេ
        </div>

        {/* Right: Payment Method & Change */}
        <div className="space-y-0.5 text-right font-khmer text-[9.5px]">
          <div>
            <span className="text-slate-600">វិធីសាស្ត្រទូទាត់ ៖ </span>
            <span className="font-bold text-slate-900 font-sans">
              {invoice.method === 'ABA Bank' ? 'ធនាគារអេប៊ីអេ (ABA)' : invoice.method}
            </span>
          </div>
          <div>
            <span className="text-slate-600">សាច់ប្រាក់ទទួល ៖ </span>
            <span className="font-mono font-bold text-slate-900">
              USD {invoice.paidUSD.toFixed(2)} និង KHR {invoice.paidKHR.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-slate-600">សាច់ប្រាក់អាប់ ៖ </span>
            <span className="font-mono font-bold text-slate-900">0.00</span>
          </div>
        </div>
      </div>

      {/* Dual Signature Blocks Matching Screenshot */}
      <div className="grid grid-cols-2 gap-4 text-center text-[10px] pt-2">
        <div>
          <div className="font-bold font-khmer text-slate-900">
            ហត្ថលេខា និងឈ្មោះអ្នកបង់ប្រាក់
          </div>
          <div className="h-14 flex items-end justify-center font-khmer text-slate-400 text-[9px]">
            (ហត្ថលេខា)
          </div>
        </div>

        <div>
          <div className="font-bold font-khmer text-slate-900">
            ហត្ថលេខា និងឈ្មោះអ្នកទទួលប្រាក់
          </div>
          <div className="h-14 flex flex-col justify-end items-center">
            <span className="font-khmer font-bold text-slate-900 text-xs">
              {invoice.cashierName || 'ស៊ិន ស្រីល័ក្ខ'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className={`bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 my-4 transition-all ${
        isDualCopy ? 'w-full max-w-5xl' : 'w-full max-w-2xl'
      }`}>
        {/* Controls Bar - Hidden on print */}
        <div className="no-print bg-slate-800 text-white px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-khmer">
              ទម្រង់វិក្កយបត្រផ្លូវការ FBIS (Invoice No: {invoice.invoiceNumber})
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Toggle Dual Copies (Side-by-side A4 matching user's image) */}
            <button
              onClick={() => setIsDualCopy(!isDualCopy)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                isDualCopy 
                  ? 'bg-blue-600 text-white border-blue-500' 
                  : 'bg-slate-700 text-slate-200 border-slate-600 hover:bg-slate-600'
              }`}
              title="Toggle between single copy and 2-copy side-by-side A4 sheet (as in uploaded screenshot)"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{isDualCopy ? '2 Copies (Side-by-Side A4)' : '1 Copy (Single)'}</span>
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Official Invoice (បោះពុម្ព)</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable View */}
        <div className="bg-white p-2 md:p-4 print:p-0">
          {isDualCopy ? (
            /* Dual Side-by-Side Layout matching user's screenshot */
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-dashed divide-slate-400">
              <div className="pr-0 md:pr-4">
                {renderSingleInvoice('ច្បាប់ដើមសម្រាប់អតិថិជន / Customer Copy')}
              </div>
              <div className="pl-0 md:pl-4 pt-4 md:pt-0">
                {renderSingleInvoice('ច្បាប់ចម្លងសម្រាប់សាលា / School Copy')}
              </div>
            </div>
          ) : (
            /* Single Copy Layout */
            <div>
              {renderSingleInvoice()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
