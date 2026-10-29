import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { PaymentInvoice } from '../../types';
import { AddPaymentModal } from './AddPaymentModal';
import { InvoicePrintModal } from './InvoicePrintModal';
import { ConfirmModal } from '../common/ConfirmModal';
import { ExcelCopyPasteModal } from '../excel/ExcelCopyPasteModal';
import * as XLSX from 'xlsx';
import { 
  FileSpreadsheet, 
  Plus, 
  Printer, 
  Trash2, 
  Search, 
  RotateCcw,
  ShoppingCart,
  Send,
  CheckCircle2,
  XCircle,
  X,
  Calendar,
  Layers,
  DollarSign,
  Clock,
  TrendingUp,
  Clipboard
} from 'lucide-react';
import { 
  getSemesterConfig, 
  classifyInvoiceSemester, 
  matchesSemesterFilter, 
  calculateSemesterFinancialPartition, 
  formatKhmerDate,
  SemesterFilterType 
} from '../../utils/semesterUtils';

export const PaymentsView: React.FC = () => {
  const { 
    branchPayments, 
    deletePayment, 
    selectedBranch, 
    settings, 
    setSelectedStudentId, 
    setActiveTab,
    sendTelegramPaymentReceipt
  } = useSchool();

  // Academic Year & Semester Partition Filter
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>(settings.activeAcademicYear || '2025-2026');
  const [semesterFilter, setSemesterFilter] = useState<SemesterFilterType>('all');

  // Semester Date Configuration for the selected year
  const semesterConfig = useMemo(() => {
    return getSemesterConfig(settings, selectedAcademicYear);
  }, [settings, selectedAcademicYear]);

  // Financial Partition Calculation for the selected year
  const partitionStats = useMemo(() => {
    const yearPayments = branchPayments.filter(p => !selectedAcademicYear || p.academicYear === selectedAcademicYear || p.academicYear === selectedAcademicYear.slice(0, 4));
    return calculateSemesterFinancialPartition(yearPayments.length > 0 ? yearPayments : branchPayments, semesterConfig);
  }, [branchPayments, selectedAcademicYear, semesterConfig]);

  // Filters
  const [filterSearch, setFilterSearch] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterTitle, setFilterTitle] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [isCopyPasteModalOpen, setIsCopyPasteModalOpen] = useState(false);
  
  // Telegram status
  const [sendingTelegramId, setSendingTelegramId] = useState<string | null>(null);
  const [telegramNotification, setTelegramNotification] = useState<{ success: boolean; msg: string } | null>(null);

  const handleQuickTelegramSend = async (invoiceId: string, invoiceNumber: string) => {
    setSendingTelegramId(invoiceId);
    setTelegramNotification(null);
    const res = await sendTelegramPaymentReceipt(invoiceId);
    setSendingTelegramId(null);
    if (res.success) {
      setTelegramNotification({
        success: true,
        msg: `វិក្កយបត្រ #${invoiceNumber} ត្រូវបានផ្ញើទៅកាន់ Telegram ដោយជោគជ័យ!`
      });
    } else {
      setTelegramNotification({
        success: false,
        msg: `មិនអាចផ្ញើទៅ Telegram: ${res.error}`
      });
    }
    setTimeout(() => setTelegramNotification(null), 4000);
  };

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<PaymentInvoice | null>(null);

  // In-app Confirmation Modal
  const [confirmModalData, setConfirmModalData] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    itemName?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filtered rows
  const filteredPayments = useMemo(() => {
    return branchPayments.filter(p => {
      // Semester Date Filter
      const matchSemester = matchesSemesterFilter(p, semesterFilter, semesterConfig);

      // Academic Year Filter
      const pYear = String(p.academicYear || '');
      const sYear = String(selectedAcademicYear || '');
      const matchYear = !sYear || pYear === sYear || (sYear.length >= 4 && pYear === sYear.slice(0, 4));

      const sTerm = filterSearch.trim().toLowerCase();
      let matchSearch = true;
      if (sTerm) {
        const pKhmer = String(p.studentNameKhmer || '').toLowerCase();
        const pEng = String(p.studentName || '').toLowerCase();
        const pInv = String(p.invoiceNumber || '').toLowerCase();
        matchSearch = pKhmer.includes(sTerm) || pEng.includes(sTerm) || pInv.includes(sTerm);
      }

      const matchDate = !filterStartDate || String(p.issuedDate || '') >= filterStartDate;
      const matchTitle = !filterTitle || String(p.title || '').includes(filterTitle);
      const matchClass = !filterClass || p.classGrade === filterClass;

      return matchSemester && matchYear && matchSearch && matchDate && matchTitle && matchClass;
    });
  }, [branchPayments, semesterFilter, semesterConfig, selectedAcademicYear, filterSearch, filterStartDate, filterTitle, filterClass]);

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / pageSize));
  const paginatedPayments = filteredPayments.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Export to XLS file using real SheetJS
  const handleExportXLS = () => {
    const exportData = filteredPayments.map((p, idx) => {
      const semClass = classifyInvoiceSemester(p, semesterConfig);
      const semLabel = semClass === 'semester1' ? 'ឆមាសទី១ (Semester 1)' : semClass === 'semester2' ? 'ឆមាសទី២ (Semester 2)' : semClass === 'annual' ? 'ប្រចាំឆ្នាំ (Annual)' : 'ផ្សេងៗ (Other)';

      return {
        'No': idx + 1,
        'Invoice #': p.invoiceNumber,
        'Student Name (Khmer)': p.studentNameKhmer,
        'Student Name (English)': p.studentName,
        'Class': p.classGrade,
        'Academic Year': p.academicYear,
        'Semester Partition': semLabel,
        'Revenue Type': p.title,
        'Payment Type': p.paymentType,
        'Issue Date': p.issuedDate,
        'Start Date': p.startDate,
        'End Date': p.endDate,
        'Full Price ($)': p.fullAmount,
        'Discount (%)': p.discountPercent,
        'Payable ($)': p.amountToBePaid,
        'Paid USD ($)': p.paidUSD,
        'Paid KHR (៛)': p.paidKHR,
        'Owed Remain ($)': p.owedRemain,
        'Status': p.status,
        'Method': p.method,
        'Cashier': p.cashierName
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payments Ledger');
    XLSX.writeFile(workbook, `FBIS_Payments_${selectedBranch.code}_${semesterFilter}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleResetFilters = () => {
    setFilterSearch('');
    setFilterStartDate('');
    setFilterTitle('');
    setFilterClass('');
    setSemesterFilter('all');
    setCurrentPage(1);
  };

  const handleViewStudentProfile = (studentId: string) => {
    setSelectedStudentId(studentId);
    setActiveTab('student-profile');
  };

  return (
    <div className="space-y-4">
      {/* Semester Partition & Financial Overview Card */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 font-khmer">
                  បែងចែកចំណូល & បំណុលសិស្សតាមឆមាស (Semester Financial Partition)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono border border-blue-200">
                  {selectedAcademicYear}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-khmer">
                ឆមាសទី១: <b>{formatKhmerDate(semesterConfig.semester1StartDate)}</b> ដល់ <b>{formatKhmerDate(semesterConfig.semester1EndDate)}</b> | ឆមាសទី២: <b>{formatKhmerDate(semesterConfig.semester2StartDate)}</b> ដល់ <b>{formatKhmerDate(semesterConfig.semester2EndDate)}</b>
              </p>
            </div>
          </div>

          {/* Academic Year Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 font-khmer">ឆ្នាំសិក្សា:</span>
            <select
              value={selectedAcademicYear}
              onChange={(e) => {
                setSelectedAcademicYear(e.target.value);
                setCurrentPage(1);
              }}
              className="h-8 px-2.5 text-xs font-mono font-bold border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              {settings.academicYears.map(yr => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Partition Tabs & Real-time Stats */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => {
                setSemesterFilter('all');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer font-khmer flex items-center gap-1.5 ${
                semesterFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>ទាំងអស់ (All Year)</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                semesterFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                ${partitionStats.total.incomeUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </button>

            <button
              onClick={() => {
                setSemesterFilter('semester1');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer font-khmer flex items-center gap-1.5 ${
                semesterFilter === 'semester1'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
              }`}
            >
              <span>ឆមាសទី១ (Semester 1)</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                semesterFilter === 'semester1' ? 'bg-white/20 text-white' : 'bg-blue-200/80 text-blue-900'
              }`}>
                ${partitionStats.semester1.incomeUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </button>

            <button
              onClick={() => {
                setSemesterFilter('semester2');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer font-khmer flex items-center gap-1.5 ${
                semesterFilter === 'semester2'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <span>ឆមាសទី២ (Semester 2)</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                semesterFilter === 'semester2' ? 'bg-white/20 text-white' : 'bg-emerald-200/80 text-emerald-900'
              }`}>
                ${partitionStats.semester2.incomeUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </button>
          </div>

          {/* Stat Badges for Active Semester Filter */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-khmer">ចំណូលបានប្រមូល:</span>
              <span className="font-mono font-bold text-emerald-600">
                ${(semesterFilter === 'semester1' ? partitionStats.semester1.incomeUSD : semesterFilter === 'semester2' ? partitionStats.semester2.incomeUSD : partitionStats.total.incomeUSD).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-khmer">បំណុលសិស្សនៅសល់:</span>
              <span className="font-mono font-bold text-rose-600">
                ${(semesterFilter === 'semester1' ? partitionStats.semester1.debtUSD : semesterFilter === 'semester2' ? partitionStats.semester2.debtUSD : partitionStats.total.debtUSD).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Filter Bar matching Screenshot 111725 */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-slate-500 text-[11px] font-semibold mb-1 uppercase tracking-wide">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Student name, invoice #..."
                value={filterSearch}
                onChange={(e) => {
                  setFilterSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-9 pl-8 pr-3 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-slate-500 text-[11px] font-semibold mb-1 uppercase tracking-wide">
              Start Date
            </label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => {
                setFilterStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 px-3 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-500 text-[11px] font-semibold mb-1 uppercase tracking-wide">
              Title / Category
            </label>
            <select
              value={filterTitle}
              onChange={(e) => {
                setFilterTitle(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 px-3 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none font-khmer"
            >
              <option value="">All Categories (Select)</option>
              <option value="ថ្លៃឈ្នួលសិក្សា">ថ្លៃឈ្នួលសិក្សា (Tuition)</option>
              <option value="សេវាអន្តរជាតិ">សេវាអន្តរជាតិ (Admin Fee)</option>
              <option value="ឯកសណ្ឋាន">ឯកសណ្ឋាន (Uniform)</option>
              <option value="សៀវភៅ">សៀវភៅ (Books)</option>
              <option value="ស៊ីម">ស៊ីម (SIM)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 text-[11px] font-semibold mb-1 uppercase tracking-wide">
              Filter By Class
            </label>
            <select
              value={filterClass}
              onChange={(e) => {
                setFilterClass(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 px-3 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none font-khmer"
            >
              <option value="">All Classes (Select)</option>
              {settings.gradeLevels.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetFilters}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <span className="text-xs text-slate-500">
              Showing <span className="font-bold text-slate-800">{filteredPayments.length}</span> payment records
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct Paste from Excel button */}
            <button
              onClick={() => setIsCopyPasteModalOpen(true)}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              title="Copy & Paste payments directly from Excel or Google Sheets"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>Paste from Excel</span>
            </button>

            {/* Export to XLS button matching screenshot button */}
            <button
              onClick={handleExportXLS}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md flex items-center gap-1.5 border border-slate-300 transition-colors shadow-2xs cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export to XLS file</span>
            </button>

            {/* Add Payment button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-1.5 bg-[#84cc16] hover:bg-[#65a30d] text-white text-xs font-bold rounded-md flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Payment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Payments Table matching Screenshot 111725 */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200 font-semibold font-khmer">
              <tr>
                <th className="py-3 px-3">#</th>
                <th className="py-3 px-3">ឈ្មោះសិស្ស</th>
                <th className="py-3 px-3">ថ្នាក់ទី</th>
                <th className="py-3 px-3">ឆ្នាំសិក្សា</th>
                <th className="py-3 px-3">ប្រភេទចំណូល</th>
                <th className="py-3 px-2 text-center">ប្រភេទបង់</th>
                <th className="py-3 px-3">ថ្ងៃបង់ប្រាក់</th>
                <th className="py-3 px-3">ថ្ងៃចាប់ផ្ដើម</th>
                <th className="py-3 px-3">ថ្ងៃបញ្ចប់</th>
                <th className="py-3 px-3 text-right">តម្លៃពេញ</th>
                <th className="py-3 px-2 text-right">បញ្ចុះតម្លៃ</th>
                <th className="py-3 px-3 text-right">តម្លៃត្រូវបង់</th>
                <th className="py-3 px-3 text-right">ប្រាក់បង់(USD)</th>
                <th className="py-3 px-3 text-right">ប្រាក់បង់(KHR)</th>
                <th className="py-3 px-3 text-right">ជំពាក់</th>
                <th className="py-3 px-3 text-center">OPTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedPayments.length === 0 ? (
                <tr>
                  <td colSpan={16} className="py-12 text-center text-slate-400">
                    No payment records found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedPayments.map((p) => {
                  return (
                    <tr 
                      key={p.id}
                      className="hover:bg-blue-50/40 transition-colors group text-slate-700"
                    >
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-900">
                        {p.invoiceNumber}
                      </td>
                      <td className="py-2.5 px-3 font-khmer font-bold text-slate-900">
                        <button
                          onClick={() => handleViewStudentProfile(p.studentId)}
                          className="hover:text-blue-600 hover:underline cursor-pointer text-left"
                          title="View Student Profile"
                        >
                          {p.studentNameKhmer}
                        </button>
                      </td>
                      <td className="py-2.5 px-3 font-khmer">
                        <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[11px]">
                          {p.classGrade}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{p.academicYear}</td>
                      <td className="py-2.5 px-3 font-khmer max-w-[200px] truncate" title={p.title}>
                        {p.title}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          {p.paymentType?.includes('Term 1') || p.paymentType === 'ត្រីមាសទី១' ? (
                            <span className="bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded text-[10px] font-mono">T1</span>
                          ) : p.paymentType?.includes('Term 2') || p.paymentType === 'ត្រីមាសទី២' ? (
                            <span className="bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded text-[10px] font-mono">T2</span>
                          ) : p.paymentType?.includes('Term 3') || p.paymentType === 'ត្រីមាសទី៣' ? (
                            <span className="bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded text-[10px] font-mono">T3</span>
                          ) : p.paymentType?.includes('Term 4') || p.paymentType === 'ត្រីមាសទី៤' ? (
                            <span className="bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded text-[10px] font-mono">T4</span>
                          ) : p.paymentType?.includes('Term') ? (
                            <span className="bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded text-[10px] font-mono">Term</span>
                          ) : p.paymentType?.includes('ពេញមួយឆ្នាំ') || p.paymentType?.includes('Annual') ? (
                            <span className="bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded text-[10px] font-mono">12M</span>
                          ) : (
                            <span className="text-slate-600 font-mono text-[10px]">{p.paymentType}</span>
                          )}
                          {(() => {
                            const sc = classifyInvoiceSemester(p, semesterConfig);
                            if (sc === 'semester1') {
                              return <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1 rounded font-khmer">ឆមាស១</span>;
                            }
                            if (sc === 'semester2') {
                              return <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 rounded font-khmer">ឆមាស២</span>;
                            }
                            return null;
                          })()}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{p.issuedDate}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{p.startDate}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{p.endDate}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-medium">
                        {p.fullAmount.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-[11px]">
                        {p.discountPercent > 0 ? `${p.discountPercent.toFixed(2)} %` : '0.00 %'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                        {p.amountToBePaid.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-700">
                        {p.paidUSD.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[11px]">
                        {p.paidKHR.toFixed(2)}
                      </td>
                      <td className={`py-2.5 px-3 text-right font-mono font-bold ${p.owedRemain > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                        {p.owedRemain.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Print Invoice */}
                          <button
                            onClick={() => setSelectedInvoiceForPrint(p)}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors cursor-pointer"
                            title="Print Official Invoice Receipt"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Buy Item */}
                          <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 px-1 py-0.5 rounded hover:bg-amber-50 flex items-center gap-0.5 cursor-pointer"
                            title="Purchase additional book/uniform"
                          >
                            <ShoppingCart className="w-3 h-3" />
                            <span>$ Buy</span>
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              setConfirmModalData({
                                isOpen: true,
                                title: 'លុបវិក្កយបត្រ (Delete Payment Invoice)',
                                message: `តើលោកអ្នកពិតជាចង់លុបវិក្កយបត្រលេខ "${p.invoiceNumber}" របស់សិស្ស ${p.studentNameKhmer} នេះមែនទេ?`,
                                itemName: `Invoice #${p.invoiceNumber} - ${p.title} ($${p.paidUSD.toFixed(2)})`,
                                onConfirm: () => deletePayment(p.id)
                              });
                            }}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Delete Invoice"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer matching screenshot */}
        <div className="p-3 bg-slate-50/60 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-500">
            Page {currentPage} of {totalPages}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 disabled:opacity-40 hover:bg-slate-100 transition-colors"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 6).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded text-xs font-semibold transition-colors ${
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 disabled:opacity-40 hover:bg-slate-100 transition-colors"
            >
              Next
            </button>

            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 disabled:opacity-40 hover:bg-slate-100 transition-colors"
            >
              Last &gt;&gt;
            </button>
          </div>
        </div>
      </div>

      {/* Add Payment Modal */}
      <AddPaymentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Printable Invoice Modal */}
      <InvoicePrintModal
        invoice={selectedInvoiceForPrint}
        branch={selectedBranch}
        settings={settings}
        onClose={() => setSelectedInvoiceForPrint(null)}
      />

      {/* Confirmation Dialog */}
      <ConfirmModal
        isOpen={confirmModalData.isOpen}
        title={confirmModalData.title}
        message={confirmModalData.message}
        itemName={confirmModalData.itemName}
        onConfirm={confirmModalData.onConfirm}
        onClose={() => setConfirmModalData(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Copy & Paste from Excel Modal */}
      {isCopyPasteModalOpen && (
        <ExcelCopyPasteModal
          isOpen={isCopyPasteModalOpen}
          onClose={() => setIsCopyPasteModalOpen(false)}
          defaultType="payments"
        />
      )}
    </div>
  );
};
