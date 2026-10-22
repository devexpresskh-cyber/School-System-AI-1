import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { PaymentInvoice } from '../../types';
import { AddPaymentModal } from './AddPaymentModal';
import { InvoicePrintModal } from './InvoicePrintModal';
import * as XLSX from 'xlsx';
import { 
  FileSpreadsheet, 
  Plus, 
  Printer, 
  Trash2, 
  Search, 
  RotateCcw,
  ShoppingCart
} from 'lucide-react';

export const PaymentsView: React.FC = () => {
  const { 
    branchPayments, 
    deletePayment, 
    selectedBranch, 
    settings, 
    setSelectedStudentId, 
    setActiveTab 
  } = useSchool();

  // Filters
  const [filterSearch, setFilterSearch] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterTitle, setFilterTitle] = useState('');
  const [filterClass, setFilterClass] = useState('');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<PaymentInvoice | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filtered rows
  const filteredPayments = useMemo(() => {
    return branchPayments.filter(p => {
      const matchSearch = !filterSearch.trim() || 
        p.studentNameKhmer.toLowerCase().includes(filterSearch.toLowerCase()) ||
        p.studentName.toLowerCase().includes(filterSearch.toLowerCase()) ||
        p.invoiceNumber.toLowerCase().includes(filterSearch.toLowerCase());

      const matchDate = !filterStartDate || p.issuedDate >= filterStartDate;
      const matchTitle = !filterTitle || p.title.includes(filterTitle);
      const matchClass = !filterClass || p.classGrade === filterClass;

      return matchSearch && matchDate && matchTitle && matchClass;
    });
  }, [branchPayments, filterSearch, filterStartDate, filterTitle, filterClass]);

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / pageSize));
  const paginatedPayments = filteredPayments.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Export to XLS file using real SheetJS
  const handleExportXLS = () => {
    const exportData = filteredPayments.map((p, idx) => ({
      'No': idx + 1,
      'Invoice #': p.invoiceNumber,
      'Student Name (Khmer)': p.studentNameKhmer,
      'Student Name (English)': p.studentName,
      'Class': p.classGrade,
      'Academic Year': p.academicYear,
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
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payments Ledger');
    XLSX.writeFile(workbook, `FBIS_Payments_${selectedBranch.code}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleResetFilters = () => {
    setFilterSearch('');
    setFilterStartDate('');
    setFilterTitle('');
    setFilterClass('');
    setCurrentPage(1);
  };

  const handleViewStudentProfile = (studentId: string) => {
    setSelectedStudentId(studentId);
    setActiveTab('student-profile');
  };

  return (
    <div className="space-y-4">
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
            {/* Export to XLS button matching screenshot button */}
            <button
              onClick={handleExportXLS}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md flex items-center gap-1.5 border border-slate-300 transition-colors shadow-2xs cursor-pointer"
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
                      <td className="py-2.5 px-2 text-center font-mono">
                        {p.paymentType === 'ត្រីមាសទី១' ? '1' : 
                         p.paymentType === 'ត្រីមាសទី២' ? '2' : 
                         p.paymentType === 'ត្រីមាសទី៣' ? '3' : 
                         p.paymentType === 'ត្រីមាសទី៤' ? '4' : 
                         p.paymentType === 'ពេញមួយឆ្នាំ' ? '12' : '0'}
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
                              if (confirm(`Are you sure you want to delete invoice ${p.invoiceNumber}?`)) {
                                deletePayment(p.id);
                              }
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
    </div>
  );
};
