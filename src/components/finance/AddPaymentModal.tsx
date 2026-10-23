import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Student, PaymentMethod, PaymentStatus } from '../../types';
import { X, Search } from 'lucide-react';

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedStudent?: Student | null;
}

export const AddPaymentModal: React.FC<AddPaymentModalProps> = ({
  isOpen,
  onClose,
  preselectedStudent
}) => {
  const { 
    students, 
    addPayment, 
    currentBranchId, 
    currentUser, 
    products, 
    services,
    selectedBranch,
    settings,
    branchStudents,
    feeCategories,
    getNextInvoiceNumber 
  } = useSchool();

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(
    preselectedStudent || branchStudents[0] || students[0] || null
  );
  const [studentSearch, setStudentSearch] = useState('');
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

  // Form fields
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [title, setTitle] = useState('ថ្លៃឈ្នួលសិក្សាកម្មវិធីបណ្តុះបណ្តាលចំណេះទូទៅ');
  const [description, setDescription] = useState('');
  const [runningYear, setRunningYear] = useState('2026');
  const [paymentType, setPaymentType] = useState('ត្រីមាសទី១');
  const [issuedDate, setIssuedDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState('2026-09-21');
  const [endDate, setEndDate] = useState('2026-12-25');
  
  const [fullAmount, setFullAmount] = useState<number>(1081.00);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [promotionAmount, setPromotionAmount] = useState<number>(0);
  const [amountPaidUSD, setAmountPaidUSD] = useState<number>(270.25);
  const [amountReceivedUSD, setAmountReceivedUSD] = useState<number>(300.00);
  const [amountReceivedKHR, setAmountReceivedKHR] = useState<number>(0);
  const [exchangeRate, setExchangeRate] = useState<number>(4100);
  const [currencyCashChange, setCurrencyCashChange] = useState<'USD' | 'KHR'>('USD');
  const [method, setMethod] = useState<PaymentMethod>('ABA Bank');
  const [status, setStatus] = useState<PaymentStatus>('Partial');

  // Generate sequential invoice number resetting each year (e.g. 2026-00005)
  useEffect(() => {
    if (isOpen) {
      const nextInv = getNextInvoiceNumber(runningYear);
      setInvoiceNumber(nextInv);
      if (preselectedStudent) {
        setSelectedStudent(preselectedStudent);
      }
    }
  }, [isOpen, preselectedStudent, runningYear, getNextInvoiceNumber]);

  const handleRunningYearChange = (newYear: string) => {
    setRunningYear(newYear);
    const nextInv = getNextInvoiceNumber(newYear);
    setInvoiceNumber(nextInv);
  };

  const handlePaymentTypeChange = (typeVal: string) => {
    setPaymentType(typeVal);
    // Auto-calculate dates for 10-week Term or Semester
    const baseDate = startDate ? new Date(startDate) : new Date(issuedDate);
    if (!isNaN(baseDate.getTime())) {
      if (typeVal.toLowerCase().includes('term') || typeVal.includes('ត្រីមាស')) {
        const end = new Date(baseDate);
        end.setDate(baseDate.getDate() + 70); // 10 weeks (1 Term)
        setEndDate(end.toISOString().split('T')[0]);
      } else if (typeVal.includes('ឆមាស')) {
        const end = new Date(baseDate);
        end.setMonth(baseDate.getMonth() + 5);
        setEndDate(end.toISOString().split('T')[0]);
      } else if (typeVal.includes('ប្រចាំខែ')) {
        const end = new Date(baseDate);
        end.setMonth(baseDate.getMonth() + 1);
        setEndDate(end.toISOString().split('T')[0]);
      } else if (typeVal.includes('ពេញមួយឆ្នាំ')) {
        const end = new Date(baseDate);
        end.setFullYear(baseDate.getFullYear() + 1);
        setEndDate(end.toISOString().split('T')[0]);
      }
    }
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    // Check fee categories (Account Setting configured by Class & Academic Year)
    const matchedCategory = feeCategories.find(fc => fc.nameKhmer === val || fc.nameEnglish === val || fc.code === val);
    if (matchedCategory) {
      setFullAmount(matchedCategory.defaultAmount);
      setAmountPaidUSD(matchedCategory.defaultAmount);
      setAmountReceivedUSD(matchedCategory.defaultAmount);
      if (matchedCategory.programType === 'english' || val.toLowerCase().includes('english') || val.includes('អង់គ្លេស')) {
        handlePaymentTypeChange('Term 1 (ត្រីមាសទី១)');
      }
      return;
    }

    // Check if it's a service
    const matchedService = services.find(s => s.nameKhmer === val || s.nameEnglish === val || s.code === val);
    if (matchedService) {
      setFullAmount(matchedService.feeUSD);
      setAmountPaidUSD(matchedService.feeUSD);
      setAmountReceivedUSD(matchedService.feeUSD);
      if (matchedService.nameEnglish.toLowerCase().includes('english') || matchedService.nameKhmer.includes('អង់គ្លេស')) {
        handlePaymentTypeChange('Term 1 (ត្រីមាសទី១)');
      }
      return;
    }
    // Check if it's a product
    const matched = products.find(p => p.nameKhmer === val || p.nameEnglish === val || p.code === val);
    if (matched && matched.unitPrice > 0) {
      setFullAmount(matched.unitPrice);
      setAmountPaidUSD(matched.unitPrice);
      setAmountReceivedUSD(matched.unitPrice);
      setPaymentType('ផលិតផល');
    }
  };

  // Calculations
  const calculatedPayable = Math.max(0, fullAmount * (1 - discountPercent / 100) - promotionAmount);
  const totalPaidEquivalentUSD = amountPaidUSD + (amountReceivedKHR / exchangeRate);
  const owedRemain = Math.max(0, Number((calculatedPayable - totalPaidEquivalentUSD).toFixed(2)));

  // Cash change calculation
  const cashChangeUSD = Math.max(0, Number((amountReceivedUSD - amountPaidUSD).toFixed(2)));
  const cashChangeKHR = Math.round(cashChangeUSD * exchangeRate);
  const cashChangeDisplay = currencyCashChange === 'USD' ? `$${cashChangeUSD.toFixed(2)}` : `${cashChangeKHR.toLocaleString()} ៛`;

  // Update status automatically based on payments
  useEffect(() => {
    if (owedRemain <= 0.01) {
      setStatus('Paid');
    } else if (totalPaidEquivalentUSD > 0) {
      setStatus('Partial');
    } else {
      setStatus('Due');
    }
  }, [owedRemain, totalPaidEquivalentUSD]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    addPayment({
      invoiceNumber,
      studentId: selectedStudent.id,
      studentName: selectedStudent.nameEnglish,
      studentNameKhmer: selectedStudent.nameKhmer,
      studentCode: selectedStudent.studentCode,
      classGrade: selectedStudent.classGrade,
      academicYear: runningYear,
      runningYear: parseInt(runningYear, 10),
      title,
      description: description || `${title} (${paymentType})`,
      paymentType,
      issuedDate,
      startDate,
      endDate,
      fullAmount,
      discountPercent,
      promotionAmount,
      amountToBePaid: calculatedPayable,
      paidUSD: amountPaidUSD,
      paidKHR: amountReceivedKHR,
      owedRemain,
      exchangeRate,
      method,
      status,
      branchId: selectedStudent.branchId || currentBranchId,
      cashierName: currentUser.name
    });

    onClose();
  };

  const filteredStudents = students.filter(s =>
    s.nameKhmer.includes(studentSearch) ||
    s.nameEnglish.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.studentCode.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.roll.includes(studentSearch)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden border border-slate-200 my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header matching Screenshot 111441 blue bar */}
        <div className="bg-blue-800 text-white px-6 py-3.5 flex items-center justify-between">
          <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
            Add Payment
          </h2>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white p-1 rounded-md hover:bg-blue-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Student Header row matching Screenshot 111441 */}
          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80">
            {/* Student selection control */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3 border-b border-slate-200 pb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Target Student
              </span>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Switch student..."
                  value={studentSearch}
                  onChange={(e) => {
                    setStudentSearch(e.target.value);
                    setShowStudentDropdown(true);
                  }}
                  onFocus={() => setShowStudentDropdown(true)}
                  className="h-7.5 px-3 pr-7 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-52"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2" />

                {showStudentDropdown && (
                  <div className="absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-xl z-30 max-h-48 overflow-y-auto">
                    {filteredStudents.map(s => (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => {
                          setSelectedStudent(s);
                          setShowStudentDropdown(false);
                          setStudentSearch('');
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 flex items-center justify-between border-b border-slate-50 last:border-none"
                      >
                        <span className="font-khmer font-medium text-slate-800">{s.nameKhmer}</span>
                        <span className="text-[11px] text-slate-500 font-mono">{s.classGrade}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {selectedStudent && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
                <div>
                  <div className="text-slate-500 font-medium">Student:</div>
                  <div className="text-lime-600 font-bold text-sm font-khmer mt-0.5">
                    {selectedStudent.nameKhmer}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Phone:</div>
                  <div className="text-slate-800 font-mono mt-0.5">{selectedStudent.phone || '077 473 545'}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Birthday:</div>
                  <div className="text-slate-800 font-mono mt-0.5">{selectedStudent.birthday}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Gender:</div>
                  <div className="text-slate-800 mt-0.5">{selectedStudent.gender}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Class:</div>
                  <div className="text-slate-900 font-bold font-khmer mt-0.5">{selectedStudent.classGrade}</div>
                </div>
              </div>
            )}
          </div>

          {/* Form fields grid matching Screenshot 111441 */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Invoice Number</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full h-9 px-3 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Fee Item (Service / Product / Category)</label>
                <select
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full h-9 px-3 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none font-khmer bg-white"
                >
                  <optgroup label="📋 ប្រភេទចំណូលតាមថ្នាក់ & ឆ្នាំសិក្សា (Fee Categories)">
                    {feeCategories.map(fc => (
                      <option key={fc.id} value={fc.nameKhmer}>
                        {fc.code} - {fc.nameKhmer} (${fc.defaultAmount} {fc.programType ? `· ${fc.programType === 'english' ? 'English' : fc.programType === 'khmer' ? 'Khmer' : 'All'}` : ''} {fc.classGrade ? `· ${fc.classGrade}` : ''})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🎓 សេវាកម្ម & ថ្លៃសិក្សា (School Services & Fees)">
                    {services.map(s => (
                      <option key={s.id} value={s.nameKhmer}>
                        {s.code} - {s.nameKhmer} (${s.feeUSD} / {s.billingCycle})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="📦 ទំនិញ & ឯកសណ្ឋាន (Physical Products)">
                    {products.map(p => (
                      <option key={p.id} value={p.nameKhmer}>
                        {p.code} - {p.nameKhmer} (${p.unitPrice})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Optional payment or installment notes..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Running Year <span className="text-[10px] text-blue-600 font-normal">(Invoice # counts from 1 each year)</span>
                </label>
                <select
                  value={runningYear}
                  onChange={(e) => handleRunningYearChange(e.target.value)}
                  className="w-full h-9 px-3 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2027">2027</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Payment Type (វដ្តបង់ប្រាក់ / Term)</label>
                <select
                  value={paymentType}
                  onChange={(e) => handlePaymentTypeChange(e.target.value)}
                  className="w-full h-9 px-3 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none font-khmer bg-white"
                >
                  <optgroup label="🇬🇧 កម្មវិធីភាសាអង់គ្លេស (English Program Term - 10 Weeks)">
                    <option value="Term 1 (ត្រីមាសទី១)">Term 1 (ត្រីមាសទី១ - 10 Weeks)</option>
                    <option value="Term 2 (ត្រីមាសទី២)">Term 2 (ត្រីមាសទី២ - 10 Weeks)</option>
                    <option value="Term 3 (ត្រីមាសទី៣)">Term 3 (ត្រីមាសទី៣ - 10 Weeks)</option>
                    <option value="Term 4 (ត្រីមាសទី៤)">Term 4 (ត្រីមាសទី៤ - 10 Weeks)</option>
                    <option value="Term (បង់ជា Term)">Term (បង់ជា Term / 10 សប្តាហ៍)</option>
                  </optgroup>
                  <optgroup label="🇰🇭 កម្មវិធីចំណេះទូទៅ & វដ្តទូទៅ (Khmer General & Other Cycles)">
                    <option value="ឆមាសទី១">ឆមាសទី១ (Semester 1)</option>
                    <option value="ឆមាសទី២">ឆមាសទី២ (Semester 2)</option>
                    <option value="ត្រីមាសទី១">ត្រីមាសទី១ (Quarter 1)</option>
                    <option value="ត្រីមាសទី២">ត្រីមាសទី២ (Quarter 2)</option>
                    <option value="ត្រីមាសទី៣">ត្រីមាសទី៣ (Quarter 3)</option>
                    <option value="ត្រីមាសទី៤">ត្រីមាសទី៤ (Quarter 4)</option>
                    <option value="ប្រចាំខែ">ប្រចាំខែ (Monthly)</option>
                    <option value="ពេញមួយឆ្នាំ">ពេញមួយឆ្នាំ (Annual)</option>
                    <option value="ផលិតផល">ផលិតផល / សម្ភារៈ (Product)</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Issued Date</label>
                <input
                  type="date"
                  value={issuedDate}
                  onChange={(e) => setIssuedDate(e.target.value)}
                  className="w-full h-9 px-3 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-9 px-3 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-9 px-3 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Full Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={fullAmount}
                  onChange={(e) => setFullAmount(parseFloat(e.target.value) || 0)}
                  className="w-full h-9 px-3 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Discount (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                  className="w-full h-9 px-3 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Promotion Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={promotionAmount}
                  onChange={(e) => setPromotionAmount(parseFloat(e.target.value) || 0)}
                  className="w-full h-9 px-3 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Amount To Be Paid ($)</label>
                <input
                  type="number"
                  step="0.01"
                  readOnly
                  value={calculatedPayable.toFixed(2)}
                  className="w-full h-9 px-3 text-xs border border-slate-200 bg-slate-100 rounded-md font-mono font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Amount Paid USD ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={amountPaidUSD}
                  onChange={(e) => setAmountPaidUSD(parseFloat(e.target.value) || 0)}
                  className="w-full h-9 px-3 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono font-semibold text-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Amount Receive USD ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={amountReceivedUSD}
                  onChange={(e) => setAmountReceivedUSD(parseFloat(e.target.value) || 0)}
                  className="w-full h-9 px-3 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Amount Receive KHR (៛)</label>
                <input
                  type="number"
                  step="100"
                  value={amountReceivedKHR}
                  onChange={(e) => setAmountReceivedKHR(parseFloat(e.target.value) || 0)}
                  className="w-full h-9 px-3 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Owed Remain ($)</label>
                <input
                  type="number"
                  readOnly
                  value={owedRemain.toFixed(2)}
                  className={`w-full h-9 px-3 text-xs border rounded-md font-mono font-bold ${owedRemain > 0 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Exchange Rate (៛/$)</label>
                <input
                  type="number"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(parseInt(e.target.value, 10) || 4100)}
                  className="w-full h-9 px-3 text-xs border border-slate-300 rounded-md font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Currency Cash Change</label>
                <select
                  value={currencyCashChange}
                  onChange={(e) => setCurrencyCashChange(e.target.value as 'USD' | 'KHR')}
                  className="w-full h-9 px-3 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="USD">USD ($)</option>
                  <option value="KHR">KHR (៛)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Cash Change</label>
                <input
                  type="text"
                  readOnly
                  value={cashChangeDisplay}
                  className="w-full h-9 px-3 text-xs border border-slate-200 bg-slate-100 rounded-md font-mono font-semibold text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Payment Method</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                  className="w-full h-9 px-3 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
                >
                  <option value="Cash">Cash (សាច់ប្រាក់សុទ្ធ)</option>
                  <option value="ABA Bank">ABA Bank (KHQR / Transfer)</option>
                  <option value="ACLEDA">ACLEDA Bank Plc</option>
                  <option value="RHB">RHB Bank</option>
                  <option value="Public Bank">Public Bank</option>
                  <option value="Canadia">Canadia Bank</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Payment Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as PaymentStatus)}
                  className="w-full h-9 px-3 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
                >
                  <option value="Paid">Paid (បង់រួចរាល់)</option>
                  <option value="Partial">Partial (បង់មួយផ្នែក/នៅជំពាក់)</option>
                  <option value="Due">Due (មិនទាន់បង់)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Button: Green Save button matching Screenshot 111441 */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 bg-[#84cc16] hover:bg-[#65a30d] text-white font-bold text-sm rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
