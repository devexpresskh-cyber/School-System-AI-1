import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { PaymentInvoice, Student } from '../../types';
import { AddPaymentModal } from './AddPaymentModal';
import { InvoicePrintModal } from './InvoicePrintModal';
import { CallNotesModal } from '../students/CallNotesModal';
import { DueReportsMatrix } from './DueReportsMatrix';
import { 
  Clock, 
  Phone, 
  Printer, 
  Search, 
  Filter, 
  CreditCard, 
  FileSpreadsheet, 
  PhoneCall,
  Table,
  ListOrdered,
  Calendar
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const DuePaymentsView: React.FC = () => {
  const { 
    branchPayments, 
    selectedBranch, 
    settings, 
    setSelectedStudentId, 
    setActiveTab, 
    getStudentById,
    callNotes,
    branchCallNotes
  } = useSchool();

  const [activeViewMode, setActiveViewMode] = useState<'matrix' | 'invoices' | 'call-notes'>('matrix');
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<PaymentInvoice | null>(null);
  const [settleInvoiceStudent, setSettleInvoiceStudent] = useState<any>(null);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [targetStudentForCallNote, setTargetStudentForCallNote] = useState<Student | null>(null);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

  // Filter only Due or Partial payments with owedRemain > 0
  const dueList = branchPayments.filter(p => {
    const isDue = p.owedRemain > 0 && (p.status === 'Due' || p.status === 'Partial');
    const matchSearch = !search.trim() ||
      p.studentNameKhmer.toLowerCase().includes(search.toLowerCase()) ||
      p.studentName.toLowerCase().includes(search.toLowerCase()) ||
      p.invoiceNumber.toLowerCase().includes(search.toLowerCase());
    const matchClass = !classFilter || p.classGrade === classFilter;
    return isDue && matchSearch && matchClass;
  });

  const totalArrearsUSD = dueList.reduce((sum, p) => sum + p.owedRemain, 0);
  const totalArrearsKHR = totalArrearsUSD * 4100;

  const handleExportArrearsXLS = () => {
    const data = dueList.map((p, i) => {
      const std = getStudentById(p.studentId);
      return {
        'No': i + 1,
        'Invoice #': p.invoiceNumber,
        'Student Name (Khmer)': p.studentNameKhmer,
        'Student Name (English)': p.studentName,
        'Class': p.classGrade,
        'Guardian Phone': std?.guardianPhone || '077 473 545',
        'Fee Category': p.title,
        'Term': p.paymentType,
        'Payable ($)': p.amountToBePaid,
        'Paid USD ($)': p.paidUSD,
        'Paid KHR (៛)': p.paidKHR,
        'Arrears / Owed ($)': p.owedRemain,
        'Arrears / Owed (៛)': p.owedRemain * 4100,
        'Due Date': p.endDate,
        'Status': p.status
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Due Arrears Report');
    XLSX.writeFile(workbook, `FBIS_Arrears_${selectedBranch.code}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleSettle = (p: PaymentInvoice) => {
    const std = getStudentById(p.studentId);
    setSettleInvoiceStudent(std || null);
    setIsSettleModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Top View Mode Switcher */}
      <div className="no-print bg-white p-3 rounded-xl shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveViewMode('matrix')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeViewMode === 'matrix'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>របាយការណ៍សិស្សជំពាក់ (Due Report Matrix: Khmer & English)</span>
          </button>

          <button
            onClick={() => setActiveViewMode('invoices')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeViewMode === 'invoices'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>បញ្ជីវិក្កយបត្រជំពាក់ (Invoice Register)</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeViewMode === 'invoices' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-700'
            }`}>
              {dueList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveViewMode('call-notes')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeViewMode === 'call-notes'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>កំណត់ត្រាហៅទូរស័ព្ទ (Call Notes Log)</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeViewMode === 'call-notes' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {branchCallNotes.length}
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-khmer">
          សាខា: <span className="font-bold text-slate-800">{selectedBranch.nameKhmer}</span>
        </div>
      </div>

      {/* Mode 1: Due Report Matrix (Khmer & English Programs matching screenshot) */}
      {activeViewMode === 'matrix' && (
        <DueReportsMatrix />
      )}

      {/* Mode 2: Invoices Register */}
      {activeViewMode === 'invoices' && (
        <div className="space-y-4">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-red-50/70 border border-red-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-red-600 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Outstanding Arrears</span>
                <Clock className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-2xl font-black text-red-700 font-mono">
                ${totalArrearsUSD.toFixed(2)}
              </div>
              <div className="text-xs text-red-600 font-mono font-medium mt-0.5">
                ≈ {totalArrearsKHR.toLocaleString()} ៛ (សរុបជំពាក់)
              </div>
            </div>

            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-amber-700 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Students with Arrears</span>
                <span className="text-xs font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                  {dueList.length} Invoices
                </span>
              </div>
              <div className="text-2xl font-black text-amber-900 font-mono">
                {new Set(dueList.map(p => p.studentId)).size} <span className="text-xs font-normal text-slate-600 font-khmer">សិស្ស</span>
              </div>
              <div className="text-xs text-amber-700 font-khmer mt-0.5">
                សាខា: {selectedBranch.nameKhmer}
              </div>
            </div>

            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-blue-700">
                <span className="text-[11px] font-bold uppercase tracking-wider">Quick Action</span>
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-xs text-slate-600 font-khmer">
                ទាញយករបាយការណ៍សរុប និងផ្ញើសាររំលឹកដល់អាណាព្យាបាល
              </div>
              <div className="mt-2">
                <button
                  onClick={handleExportArrearsXLS}
                  className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Export Arrears Excel (.xlsx)</span>
                </button>
              </div>
            </div>
          </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px]">
            <input
              type="text"
              placeholder="Filter by student name, invoice #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-8 pr-3 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="h-9 px-3 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 font-khmer bg-white"
            >
              <option value="">All Classes (Select)</option>
              {settings.gradeLevels.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('reports')}
          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md border border-slate-300 transition-colors cursor-pointer"
        >
          View Official Signed Arrears Report &gt;
        </button>
      </div>

      {/* Due Invoices Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold font-khmer">
              <tr>
                <th className="py-3 px-3">លេខវិក្កយបត្រ</th>
                <th className="py-3 px-3">ឈ្មោះសិស្ស</th>
                <th className="py-3 px-3">ថ្នាក់ទី</th>
                <th className="py-3 px-3">លេខទូរស័ព្ទអាណាព្យាបាល</th>
                <th className="py-3 px-3">ប្រភេទចំណូល</th>
                <th className="py-3 px-3">កាលបរិច្ឆេទផុតកំណត់</th>
                <th className="py-3 px-3 text-right">តម្លៃត្រូវបង់</th>
                <th className="py-3 px-3 text-right">បានបង់រួច</th>
                <th className="py-3 px-3 text-right text-red-600 font-bold">នៅជំពាក់ ($)</th>
                <th className="py-3 px-3 text-right text-red-600 font-bold">នៅជំពាក់ (៛)</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dueList.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400">
                    🎉 Excellent! No outstanding due payments in {selectedBranch.code}.
                  </td>
                </tr>
              ) : (
                dueList.map((p) => {
                  const std = getStudentById(p.studentId);
                  return (
                    <tr key={p.id} className="hover:bg-red-50/30 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-900">{p.invoiceNumber}</td>
                      <td className="py-2.5 px-3">
                        <button
                          onClick={() => {
                            setSelectedStudentId(p.studentId);
                            setActiveTab('student-profile');
                          }}
                          className="font-khmer font-bold text-slate-900 hover:text-blue-600 text-left block"
                        >
                          {p.studentNameKhmer}
                        </button>
                        <span className="text-[11px] text-slate-500 font-sans block">{p.studentName}</span>
                      </td>
                      <td className="py-2.5 px-3 font-khmer">{p.classGrade}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{std?.guardianPhone || '077 473 545'}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-khmer max-w-[180px] truncate" title={p.title}>
                        {p.title}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{p.endDate}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-medium">${p.amountToBePaid.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-700">${p.paidUSD.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-red-600 text-sm">
                        ${p.owedRemain.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-red-600">
                        {(p.owedRemain * 4100).toLocaleString()} ៛
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          p.status === 'Partial' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              const s = getStudentById(p.studentId);
                              if (s) {
                                setTargetStudentForCallNote(s);
                                setIsCallModalOpen(true);
                              }
                            }}
                            className="p-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded border border-emerald-200 transition-colors cursor-pointer"
                            title="Log Call Note / Payment Promise"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleSettle(p)}
                            className="px-2.5 py-1 bg-[#84cc16] hover:bg-[#65a30d] text-white text-[11px] font-bold rounded flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                            title="Settle Payment"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Settle</span>
                          </button>

                          <button
                            onClick={() => setSelectedInvoiceForPrint(p)}
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded"
                            title="Print Notice"
                          >
                            <Printer className="w-3.5 h-3.5" />
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
      </div>
    </div>
  )}

  {/* Mode 3: Call Notes Log */}
  {activeViewMode === 'call-notes' && (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold font-khmer text-slate-900">
            កំណត់ត្រាការទាក់ទងអាណាព្យាបាល (Parent Call & Follow-up Log)
          </h3>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Log of reminder phone calls, promised payment dates, and parent communications.
          </p>
        </div>
        <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
          {branchCallNotes.length} Records
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold font-khmer">
            <tr>
              <th className="py-3 px-3">កាលបរិច្ឆេទ & ម៉ោង</th>
              <th className="py-3 px-3">សិស្ស</th>
              <th className="py-3 px-3">អ្នកទទួល / លេខទូរស័ព្ទ</th>
              <th className="py-3 px-3">គោលបំណង</th>
              <th className="py-3 px-3">លទ្ធផលនៃការហៅ</th>
              <th className="py-3 px-3">ថ្ងៃសន្យាបង់ប្រាក់</th>
              <th className="py-3 px-3">កំណត់សម្គាល់</th>
              <th className="py-3 px-3">បុគ្គលិកទទួលបន្ទុក</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {branchCallNotes.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400 font-khmer">
                  មិនទាន់មានកំណត់ត្រាហៅទូរស័ព្ទនៅឡើយទេ។ (No call notes yet)
                </td>
              </tr>
            ) : (
              branchCallNotes.map((cn) => (
                <tr key={cn.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-mono text-slate-500">{cn.dateTime}</td>
                  <td className="py-2.5 px-3">
                    <div className="font-khmer font-bold text-slate-900">{cn.studentNameKhmer}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{cn.studentCode}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-khmer text-slate-800">{cn.recipientName}</div>
                    <div className="text-[11px] font-mono text-slate-500">{cn.recipientPhone}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">
                      {cn.purpose.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      cn.outcome === 'answered_promised_pay'
                        ? 'bg-emerald-100 text-emerald-800'
                        : cn.outcome === 'no_answer' || cn.outcome === 'line_busy'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {cn.outcome.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-amber-700">
                    {cn.promisedDate || '-'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 max-w-xs truncate" title={cn.notes}>
                    {cn.notes}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-600 text-xs">
                    {cn.staffName}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )}

  {/* Settle Modal */}
      <AddPaymentModal
        isOpen={isSettleModalOpen}
        onClose={() => setIsSettleModalOpen(false)}
        preselectedStudent={settleInvoiceStudent}
      />

      {/* Call Notes Modal */}
      <CallNotesModal
        isOpen={isCallModalOpen}
        student={targetStudentForCallNote}
        onClose={() => {
          setIsCallModalOpen(false);
          setTargetStudentForCallNote(null);
        }}
      />

      {/* Print Modal */}
      <InvoicePrintModal
        invoice={selectedInvoiceForPrint}
        branch={selectedBranch}
        settings={settings}
        onClose={() => setSelectedInvoiceForPrint(null)}
      />
    </div>
  );
};
