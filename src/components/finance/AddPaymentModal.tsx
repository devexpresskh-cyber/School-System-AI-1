import React, { useState, useEffect, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Student, PaymentMethod, PaymentStatus } from '../../types';
import { X, Search, Calendar, DollarSign, AlertCircle, Sparkles, CheckCircle2, Layers, Clock } from 'lucide-react';

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
    payments,
    addPayment, 
    currentBranchId, 
    currentUser, 
    products, 
    services,
    selectedBranch,
    settings,
    branchStudents,
    feeCategories,
    paymentPeriods,
    getNextInvoiceNumber 
  } = useSchool();

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(
    preselectedStudent || branchStudents[0] || students[0] || null
  );
  const [studentSearch, setStudentSearch] = useState('');
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');

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

  // Contextual Fee Items & Services filtered by current student class
  const classFeeItems = useMemo(() => {
    if (!selectedStudent?.classGrade) return [];
    const grade = selectedStudent.classGrade.trim().toLowerCase();

    const matchedFeeCats = feeCategories.filter(fc => {
      if (fc.status === 'inactive') return false;
      const fcClass = (fc.classGrade || '').trim().toLowerCase();
      const fcAppGrades = (fc.applicableGrades || []).map(g => g.trim().toLowerCase());
      return fcClass.includes(grade) || 
             grade.includes(fcClass) || 
             fcClass.includes('all') || 
             fcAppGrades.some(g => g.includes(grade) || grade.includes(g) || g.includes('all'));
    });

    const matchedServices = services.filter(s => {
      if (s.status === 'inactive') return false;
      const appGrades = (s.applicableGrades || []).map(g => g.trim().toLowerCase());
      return appGrades.some(g => g.includes(grade) || grade.includes(g) || g.includes('all') || g.includes('every'));
    });

    return [
      ...matchedFeeCats.map(fc => ({
        id: fc.id,
        code: fc.code,
        nameKhmer: fc.nameKhmer,
        nameEnglish: fc.nameEnglish,
        amount: fc.defaultAmount,
        type: 'feeCategory' as const,
        detail: `${fc.categoryType} · ${fc.academicYear || ''}`
      })),
      ...matchedServices.map(s => ({
        id: s.id,
        code: s.code,
        nameKhmer: s.nameKhmer,
        nameEnglish: s.nameEnglish,
        amount: s.feeUSD,
        type: 'service' as const,
        detail: `${s.category} · ${s.billingCycle}`
      }))
    ];
  }, [selectedStudent, feeCategories, services]);

  // Handle Payment Period Selection (1 month, 2 months, quarter, semester, year)
  // Auto-fills startdate/enddate and auto-calculates period price based on student tuition
  const handleSelectPaymentPeriod = (periodId: string) => {
    setSelectedPeriodId(periodId);
    const period = paymentPeriods.find(p => p.id === periodId);
    if (!period) return;

    if (period.startDate) setStartDate(period.startDate);
    if (period.endDate) setEndDate(period.endDate);
    setPaymentType(period.nameKhmer);

    // Calculate price based on student tuition and period duration
    const tuition = selectedStudent?.tuitionFee || 980;
    const monthlyRate = tuition / 10;
    let periodPrice = period.fixedPrice 
      ? period.fixedPrice 
      : Number((monthlyRate * (period.monthsCount || 1)).toFixed(2));
    
    if (selectedStudent?.curriculum === 'english' && (period.monthsCount === 3 || period.code === 'QUARTER')) {
      periodPrice = Number((tuition / 4).toFixed(2));
    } else if (period.monthsCount === 5 || period.code.includes('SEMESTER')) {
      periodPrice = Number((tuition / 2).toFixed(2));
    } else if (period.monthsCount === 10 || period.code === 'FULL_YEAR') {
      periodPrice = tuition;
    }

    setFullAmount(periodPrice);
    const disc = selectedStudent?.discountPercentage || period.discountPercentage || 0;
    setDiscountPercent(disc);
    const payable = Math.max(0, Number((periodPrice * (1 - disc / 100)).toFixed(2)));
    setAmountPaidUSD(payable);
    setAmountReceivedUSD(payable);
  };

  const handlePaymentTypeChange = (typeVal: string) => {
    setPaymentType(typeVal);
    // Check if this matches a configured payment period
    const matchedPeriod = paymentPeriods.find(p => 
      p.nameKhmer === typeVal || 
      p.nameEnglish === typeVal || 
      p.code === typeVal ||
      typeVal.includes(p.nameKhmer) ||
      typeVal.includes(p.nameEnglish)
    );

    if (matchedPeriod) {
      setSelectedPeriodId(matchedPeriod.id);
      if (matchedPeriod.startDate) setStartDate(matchedPeriod.startDate);
      if (matchedPeriod.endDate) setEndDate(matchedPeriod.endDate);
      return;
    }

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

  const handleApplyClassFeeItem = (item: { id?: string; code: string; nameKhmer: string; amount: number; detail: string; type?: 'feeCategory' | 'service' }) => {
    setTitle(item.nameKhmer);
    setDescription(`${item.code} - ${item.nameKhmer} (${item.detail})`);
    setFullAmount(item.amount);
    const disc = selectedStudent?.discountPercentage || 0;
    setDiscountPercent(disc);
    const payable = Math.max(0, Number((item.amount * (1 - disc / 100)).toFixed(2)));
    setAmountPaidUSD(payable);
    setAmountReceivedUSD(payable);

    // If item links to a payment period, sync it
    const matchedService = services.find(s => s.code === item.code || s.nameKhmer === item.nameKhmer);
    const matchedCat = feeCategories.find(fc => fc.code === item.code || fc.nameKhmer === item.nameKhmer);
    const periodId = matchedService?.paymentPeriodId || matchedCat?.paymentPeriodId;
    const cycle = matchedService?.billingCycle || matchedCat?.billingCycle;

    if (periodId) {
      handleSelectPaymentPeriod(periodId);
    } else if (cycle) {
      const p = paymentPeriods.find(per => per.nameKhmer === cycle || per.nameEnglish === cycle || per.code === cycle || per.nameKhmer.includes(cycle));
      if (p) handleSelectPaymentPeriod(p.id);
    }
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    const matchedCategory = feeCategories.find(fc => fc.nameKhmer === val || fc.nameEnglish === val || fc.code === val);
    if (matchedCategory) {
      setFullAmount(matchedCategory.defaultAmount);
      setAmountPaidUSD(matchedCategory.defaultAmount);
      setAmountReceivedUSD(matchedCategory.defaultAmount);
      if (matchedCategory.paymentPeriodId) {
        handleSelectPaymentPeriod(matchedCategory.paymentPeriodId);
      } else if (matchedCategory.billingCycle) {
        const p = paymentPeriods.find(per => per.nameKhmer === matchedCategory.billingCycle || per.nameEnglish === matchedCategory.billingCycle || per.code === matchedCategory.billingCycle);
        if (p) handleSelectPaymentPeriod(p.id);
      } else if (matchedCategory.programType === 'english' || val.toLowerCase().includes('english') || val.includes('អង់គ្លេស')) {
        handlePaymentTypeChange('Term 1 (ត្រីមាសទី១)');
      }
      return;
    }

    const matchedService = services.find(s => s.nameKhmer === val || s.nameEnglish === val || s.code === val);
    if (matchedService) {
      setFullAmount(matchedService.feeUSD);
      setAmountPaidUSD(matchedService.feeUSD);
      setAmountReceivedUSD(matchedService.feeUSD);
      if (matchedService.paymentPeriodId) {
        handleSelectPaymentPeriod(matchedService.paymentPeriodId);
      } else if (matchedService.billingCycle) {
        const p = paymentPeriods.find(per => per.nameKhmer === matchedService.billingCycle || per.nameEnglish === matchedService.billingCycle || per.code === matchedService.billingCycle);
        if (p) handleSelectPaymentPeriod(p.id);
      } else if (matchedService.nameEnglish.toLowerCase().includes('english') || matchedService.nameKhmer.includes('អង់គ្លេស')) {
        handlePaymentTypeChange('Term 1 (ត្រីមាសទី១)');
      }
      return;
    }

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

  // Automatic Calculation for Amount Owed for Next Payment
  const studentPastYearDebt = selectedStudent?.pastYearDue || 0;
  const studentPriorInvoices = useMemo(() => {
    if (!selectedStudent) return [];
    return payments.filter(p => 
      p.studentId === selectedStudent.id || 
      (p.studentCode && selectedStudent.studentCode && p.studentCode.toLowerCase() === selectedStudent.studentCode.toLowerCase())
    );
  }, [selectedStudent, payments]);

  const priorUnpaidBalance = useMemo(() => {
    return studentPriorInvoices.reduce((sum, p) => sum + (p.owedRemain || 0), 0);
  }, [studentPriorInvoices]);

  // Total Owed for Next Payment: Past Year Owed + Prior Invoices Unpaid + Current Invoice Remaining Owed
  const totalOwedForNextPayment = Number((studentPastYearDebt + priorUnpaidBalance + owedRemain).toFixed(2));

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

            {/* Contextual Fee Items & Services filtered by Student's Current Class */}
            {selectedStudent && classFeeItems.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-blue-900 flex items-center gap-1.5 font-khmer">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    សេវាកម្ម & ថ្លៃសិក្សាសម្រាប់ថ្នាក់ <span className="bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-bold">{selectedStudent.classGrade}</span> (Fee Items by Current Class):
                  </span>
                  <span className="text-[10px] text-slate-500">ចុចលើសេវាដើម្បីបំពេញស្វ័យប្រវត្តិ</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {classFeeItems.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleApplyClassFeeItem(item)}
                      className={`px-2.5 py-1 text-xs rounded-lg border transition-all text-left flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                        title === item.nameKhmer
                          ? 'bg-blue-700 text-white border-blue-800 font-semibold shadow-xs'
                          : 'bg-white hover:bg-blue-50 text-slate-700 border-slate-300 hover:border-blue-400'
                      }`}
                    >
                      <span className={`font-mono text-[10px] font-bold px-1 py-0.2 rounded ${title === item.nameKhmer ? 'bg-blue-800 text-blue-100' : 'bg-slate-100 text-slate-600'}`}>
                        {item.code}
                      </span>
                      <span className="font-khmer truncate max-w-[170px]">{item.nameKhmer}</span>
                      <span className={`font-mono font-bold text-[11px] ml-0.5 px-1 rounded ${title === item.nameKhmer ? 'bg-blue-900 text-emerald-300' : 'bg-emerald-50 text-emerald-700'}`}>
                        ${item.amount}
                      </span>
                    </button>
                  ))}
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

            {/* Payment Period (Account Setting) & Running Year & Dates */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-blue-900 mb-1 flex items-center justify-between">
                  <span>Payment Period (វដ្តបង់ប្រាក់)</span>
                  <span className="text-[10px] text-blue-600 font-normal">Auto-fill & Price</span>
                </label>
                <select
                  value={selectedPeriodId}
                  onChange={(e) => handleSelectPaymentPeriod(e.target.value)}
                  className="w-full h-9 px-2.5 text-xs border border-blue-400 bg-blue-50/50 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none font-khmer font-medium"
                >
                  <option value="">-- ជ្រើសរើសវដ្ត (Select Period) --</option>
                  {paymentPeriods.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nameKhmer}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Running Year <span className="text-[10px] text-blue-600 font-normal">(Invoice # count)</span>
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
                <label className="block text-xs font-medium text-slate-600 mb-1">Payment Type (ប្រភេទ)</label>
                <select
                  value={paymentType}
                  onChange={(e) => handlePaymentTypeChange(e.target.value)}
                  className="w-full h-9 px-3 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none font-khmer bg-white"
                >
                  {paymentPeriods.filter(p => p.isActive).length > 0 && (
                    <optgroup label="⚡ វដ្តបង់ប្រាក់ផ្លូវការ (Configured Payment Periods)">
                      {paymentPeriods.filter(p => p.isActive).map(p => (
                        <option key={p.id} value={p.nameKhmer}>
                          {p.nameKhmer} ({p.nameEnglish}) - {p.monthsCount} ខែ
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="🇬🇧 កម្មវិធីភាសាអង់គ្លេស (English Program Term - 10 Weeks)">
                    <option value="Term 1 (ត្រីមាសទី១)">Term 1 (ត្រីមាសទី១ - 10 Weeks)</option>
                    <option value="Term 2 (ត្រីមាសទី២)">Term 2 (ត្រីមាសទី២ - 10 Weeks)</option>
                    <option value="Term 3 (ត្រីមាសទី៣)">Term 3 (ត្រីមាសទី៣ - 10 Weeks)</option>
                    <option value="Term 4 (ត្រីមាសទី៤)">Term 4 (ត្រីមាសទី៤ - 10 Weeks)</option>
                    <option value="Term (បង់ជា Term)">Term (បង់ជា Term / 10 សប្តាហ៍)</option>
                  </optgroup>
                  <optgroup label="🇰🇭 កម្មវិធីចំណេះទូទៅ & វដ្តទូទៅ (Khmer General & Other Cycles)">
                    <option value="១ ខែ (1 Month)">១ ខែ (1 Month)</option>
                    <option value="២ ខែ (2 Months)">២ ខែ (2 Months)</option>
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

            {/* Auto-Calculated Owed for Next Payment Card */}
            <div className="bg-gradient-to-r from-amber-50/90 via-orange-50/70 to-amber-50/90 border border-amber-300 rounded-xl p-3.5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-amber-200/80">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                  <span className="text-xs font-bold text-amber-950 font-khmer">
                    សមតុល្យជំពាក់សរុបសម្រាប់លើកក្រោយ (Auto-Calculated Owed for Next Payment)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-amber-800">សរុបទាំងអស់:</span>
                  <span className="text-sm font-mono font-extrabold text-amber-800 bg-white px-2.5 py-0.5 rounded-md border border-amber-300 shadow-2xs">
                    ${totalOwedForNextPayment.toFixed(2)} USD
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                <div className="bg-white/90 p-2 rounded-lg border border-amber-200/80">
                  <div className="text-slate-500 text-[10px]">ជំពាក់ឆ្នាំចាស់ (Past Year Due):</div>
                  <div className="font-mono font-bold text-slate-800 text-xs mt-0.5">
                    ${studentPastYearDebt.toFixed(2)}
                  </div>
                </div>

                <div className="bg-white/90 p-2 rounded-lg border border-amber-200/80">
                  <div className="text-slate-500 text-[10px]">វិក្កយបត្រមុនៗ (Prior Invoices):</div>
                  <div className="font-mono font-bold text-slate-800 text-xs mt-0.5">
                    ${priorUnpaidBalance.toFixed(2)}
                  </div>
                </div>

                <div className="bg-white/90 p-2 rounded-lg border border-amber-200/80">
                  <div className="text-slate-500 text-[10px]">ជំពាក់វិក្កយបត្រនេះ (Current Due):</div>
                  <div className={`font-mono font-bold text-xs mt-0.5 ${owedRemain > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    ${owedRemain.toFixed(2)}
                  </div>
                </div>

                <div className="bg-amber-100/90 p-2 rounded-lg border border-amber-300">
                  <div className="text-amber-950 font-semibold text-[10px]">សរុបជំពាក់លើកក្រោយ (Next Due):</div>
                  <div className="font-mono font-extrabold text-amber-800 text-xs mt-0.5">
                    ${totalOwedForNextPayment.toFixed(2)}
                  </div>
                </div>
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
