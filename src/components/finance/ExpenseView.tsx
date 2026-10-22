import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { PaymentMethod } from '../../types';
import { Plus, Search, DollarSign, X, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

export const ExpenseView: React.FC = () => {
  const { branchExpenses, addExpense, selectedBranch, currentUser } = useSchool();

  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New expense form
  const [category, setCategory] = useState('Utilities & Electricity');
  const [description, setDescription] = useState('');
  const [amountUSD, setAmountUSD] = useState<number>(100);
  const [payee, setPayee] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ABA Bank');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredExpenses = branchExpenses.filter(e =>
    e.description.toLowerCase().includes(search.toLowerCase()) ||
    e.payee.toLowerCase().includes(search.toLowerCase()) ||
    e.voucherNumber.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalExpenseUSD = filteredExpenses.reduce((sum, e) => sum + e.amountUSD, 0);

  const handleExportXLS = () => {
    const data = filteredExpenses.map((e, i) => ({
      'No': i + 1,
      'Voucher #': e.voucherNumber,
      'Category': e.category,
      'Description': e.description,
      'Amount USD ($)': e.amountUSD,
      'Amount KHR (៛)': e.amountKHR,
      'Payee': e.payee,
      'Date': e.date,
      'Method': e.paymentMethod,
      'Approved By': e.approvedBy
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'School Expenses');
    XLSX.writeFile(workbook, `FBIS_Expenses_${selectedBranch.code}.xlsx`);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const rand = Math.floor(100 + Math.random() * 900);
    addExpense({
      branchId: selectedBranch.id,
      voucherNumber: `EXP-2026-0${rand}`,
      category,
      description,
      amountUSD,
      amountKHR: amountUSD * 4100,
      payee,
      date,
      approvedBy: currentUser.name,
      paymentMethod
    });
    setIsAddOpen(false);
    setDescription('');
    setPayee('');
  };

  return (
    <div className="space-y-4">
      {/* Top summary & actions */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
            Total Operational Outflow
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            ${totalExpenseUSD.toFixed(2)}
            <span className="text-xs font-normal text-slate-500 font-khmer ml-2">
              (≈ {(totalExpenseUSD * 4100).toLocaleString()} ៛)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search expenses, payee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-8 pr-3 text-xs border border-slate-300 rounded-lg w-52 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          <button
            onClick={handleExportXLS}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-slate-300 transition-colors shadow-2xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold font-khmer">
              <tr>
                <th className="py-3 px-3">លេខប័ណ្ណចំណាយ</th>
                <th className="py-3 px-3">ប្រភេទចំណាយ</th>
                <th className="py-3 px-3">បរិយាយ</th>
                <th className="py-3 px-3">អ្នកទទួលប្រាក់ (Payee)</th>
                <th className="py-3 px-3">កាលបរិច្ឆេទ</th>
                <th className="py-3 px-3">វិធីសាស្ត្រ</th>
                <th className="py-3 px-3 text-right">ទឹកប្រាក់ ($)</th>
                <th className="py-3 px-3 text-right">ទឹកប្រាក់ (៛)</th>
                <th className="py-3 px-3">អនុម័តដោយ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-medium text-slate-900">{exp.voucherNumber}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">{exp.category}</td>
                  <td className="py-2.5 px-3 text-slate-600 max-w-[240px] truncate" title={exp.description}>
                    {exp.description}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{exp.payee}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">{exp.date}</td>
                  <td className="py-2.5 px-3">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium text-slate-700">
                      {exp.paymentMethod}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-red-600 text-sm">
                    -${exp.amountUSD.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-red-600">
                    -{exp.amountKHR.toLocaleString()} ៛
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-khmer">{exp.approvedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-blue-800 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-300" />
                <span>Record School Operation Expense</span>
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-blue-200 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Expense Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-9 px-3 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Utilities & Electricity">Utilities & Electricity (EDC)</option>
                  <option value="Classroom Supplies">Classroom Supplies & Printing</option>
                  <option value="Internet & IT Infrastructure">Internet & IT Infrastructure</option>
                  <option value="Building Maintenance & Repairs">Building Maintenance & Repairs</option>
                  <option value="Staff Refreshments & Events">Staff Refreshments & Events</option>
                  <option value="Marketing & Signboard">Marketing & School Signboards</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / លម្អិតចំណាយ</label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail explanation of the expenditure..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amountUSD}
                    onChange={(e) => setAmountUSD(parseFloat(e.target.value) || 0)}
                    className="w-full h-9 px-3 border border-slate-300 rounded-md font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Equivalent KHR (៛)</label>
                  <input
                    type="text"
                    readOnly
                    value={`${(amountUSD * 4100).toLocaleString()} ៛`}
                    className="w-full h-9 px-3 border border-slate-200 bg-slate-100 rounded-md font-mono font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payee (អ្នកទទួលប្រាក់)</label>
                  <input
                    type="text"
                    required
                    value={payee}
                    onChange={(e) => setPayee(e.target.value)}
                    placeholder="e.g. EDC Siem Reap, IBC"
                    className="w-full h-9 px-3 border border-slate-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full h-9 px-3 border border-slate-300 rounded-md"
                  >
                    <option value="Cash">Cash (សាច់ប្រាក់សុទ្ធ)</option>
                    <option value="ABA Bank">ABA Bank</option>
                    <option value="ACLEDA">ACLEDA</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-9 px-3 border border-slate-300 rounded-md"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
