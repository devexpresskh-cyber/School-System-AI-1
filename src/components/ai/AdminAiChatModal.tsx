import React, { useState, useRef, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  Bot, 
  Send, 
  Sparkles, 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw,
  UserCheck,
  CreditCard,
  Edit3,
  ArrowRight,
  Loader2
} from 'lucide-react';

interface AdminAiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  action?: {
    type: 'UPDATE_STUDENT' | 'RECORD_PAYMENT';
    studentId?: string;
    studentName?: string;
    updates?: any;
    payment?: any;
    executed?: boolean;
  };
}

export const AdminAiChatModal: React.FC<AdminAiChatModalProps> = ({ isOpen, onClose }) => {
  const { 
    currentUser, 
    branchStudents, 
    updateStudent, 
    addPayment, 
    getNextInvoiceNumber, 
    selectedBranch 
  } = useSchool();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `សួស្តីលោក/លោកស្រី Admin! ខ្ញុំជាជំនួយការ AI សម្រាប់គ្រប់គ្រងសាលា FBIS។ 
លោកអ្នកអាចបញ្ជាខ្ញុំជាភាសាខ្មែរ ឬអង់គ្លេស ដើម្បី៖
• កែប្រែព័ត៌មានសិស្ស (ថ្នាក់, បញ្ចុះតម្លៃ %, ថ្លៃសិក្សា, អាសយដ្ឋាន, លេខទូរស័ព្ទ, បំណុលឆ្នាំចាស់)
• កត់ត្រាការបង់ប្រាក់របស់សិស្ស
• ស្វែងរក ឬសង្ខេបព័ត៌មានសិស្សនានា។`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'campus_admin';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  // Handle client-side heuristic fallback if server AI is unavailable
  const handleClientFallback = (text: string) => {
    const lower = text.toLowerCase();
    
    // Find student mentioned by roll / code / name
    const matchedStudent = branchStudents.find(s => 
      text.includes(s.roll) || 
      text.includes(s.studentCode) || 
      lower.includes(s.nameKhmer.toLowerCase()) || 
      lower.includes(s.nameEnglish.toLowerCase())
    );

    // Check discount update
    const discountMatch = text.match(/(?:discount|បញ្ចុះតម្លៃ|ចុះតម្លៃ)\s*(\d+)%/i) || text.match(/(\d+)%\s*(?:discount|បញ្ចុះតម្លៃ|ចុះតម្លៃ)/i);
    if (matchedStudent && discountMatch) {
      const newDisc = parseInt(discountMatch[1], 10);
      return {
        reply: `បានរកឃើញសិស្ស ${matchedStudent.nameKhmer} (${matchedStudent.nameEnglish} - ${matchedStudent.studentCode})។ ខ្ញុំបានរៀបចំសំណើកំណត់ការបញ្ចុះតម្លៃមកត្រឹម ${newDisc}%។ សូមចុចប៊ូតុងខាងក្រោមដើម្បីអនុវត្ត។`,
        action: {
          type: 'UPDATE_STUDENT' as const,
          studentId: matchedStudent.id,
          studentName: `${matchedStudent.nameKhmer} (${matchedStudent.nameEnglish})`,
          updates: { discountPercentage: newDisc }
        }
      };
    }

    // Check class grade change
    const classMatch = text.match(/(?:class|ថ្នាក់ទី|ថ្នាក់)\s*(\d+|[០-៩]+)/i);
    if (matchedStudent && classMatch) {
      const gradeNum = classMatch[1];
      const targetGrade = `ថ្នាក់ទី ${gradeNum}`;
      return {
        reply: `បានរកឃើញសិស្ស ${matchedStudent.nameKhmer} (${matchedStudent.nameEnglish})។ ខ្ញុំបានរៀបចំសំណើប្តូរថ្នាក់ទៅជា "${targetGrade}"។ សូមចុចប៊ូតុងខាងក្រោមដើម្បីអនុវត្ត។`,
        action: {
          type: 'UPDATE_STUDENT' as const,
          studentId: matchedStudent.id,
          studentName: `${matchedStudent.nameKhmer} (${matchedStudent.nameEnglish})`,
          updates: { classGrade: targetGrade }
        }
      };
    }

    // Check payment recording
    const paymentAmountMatch = text.match(/\$\s*(\d+(?:\.\d+)?)/) || text.match(/(\d+(?:\.\d+)?)\s*(?:\$|usd|ដុល្លារ)/i);
    if (matchedStudent && (lower.includes('payment') || lower.includes('បង់ប្រាក់') || lower.includes('បង់ថ្លៃ') || lower.includes('pay'))) {
      const amount = paymentAmountMatch ? parseFloat(paymentAmountMatch[1]) : 350;
      return {
        reply: `បានរៀបចំសំណើកត់ត្រាការបង់ប្រាក់ចំនួន $${amount.toFixed(2)} សម្រាប់សិស្ស ${matchedStudent.nameKhmer} (${matchedStudent.nameEnglish})។ សូមចុចប៊ូតុង "អនុវត្តការបង់ប្រាក់" ខាងក្រោម។`,
        action: {
          type: 'RECORD_PAYMENT' as const,
          studentId: matchedStudent.id,
          studentName: `${matchedStudent.nameKhmer} (${matchedStudent.nameEnglish})`,
          payment: {
            title: 'ថ្លៃសិក្សាចំណេះទូទៅ (Tuition Fee)',
            amountPaidUSD: amount,
            paymentType: 'ត្រីមាស (Term)',
            paymentMethod: 'ABA Bank',
            discountPercent: matchedStudent.discountPercentage || 0
          }
        }
      };
    }

    // Generic response
    return {
      reply: `ខ្ញុំបានទទួលសំណើរបស់អ្នក: "${text}"។ សូមបញ្ជាក់ឈ្មោះសិស្ស ឬអត្តលេខសិស្ស (ឧ. 3804, 2310) និងព័ត៌មានដែលចង់កែប្រែ (ឧ. បញ្ចុះតម្លៃ 20% ឬកត់ត្រាបង់ប្រាក់ $300)។`,
      action: null
    };
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: String(Date.now()),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInputMessage('');
    setIsLoading(true);
    setErrorToast(null);

    try {
      // Call server backend API
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userRole: currentUser?.role,
          message: textToSend,
          studentsContext: branchStudents,
          history: messages.slice(-4)
        })
      });

      if (!res.ok) {
        throw new Error(`Server status ${res.status}`);
      }

      const data = await res.json();
      
      const assistantMsg: Message = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: data.reply || 'បានទទួលសំណើ។',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: data.action
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      // Fallback seamlessly to local intelligent parser
      const fallback = handleClientFallback(textToSend);
      const assistantMsg: Message = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: fallback.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: fallback.action || undefined
      };
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Execute proposed action in SchoolContext
  const handleExecuteAction = (msgId: string, action: Message['action']) => {
    if (!action || !action.studentId) return;

    if (action.type === 'UPDATE_STUDENT' && action.updates) {
      updateStudent(action.studentId, action.updates);
      // Mark action as executed
      setMessages(prev => prev.map(m => {
        if (m.id === msgId && m.action) {
          return { ...m, action: { ...m.action, executed: true } };
        }
        return m;
      }));
    } else if (action.type === 'RECORD_PAYMENT' && action.payment) {
      const student = branchStudents.find(s => s.id === action.studentId);
      if (!student) return;

      const runningYear = '2026';
      const invNum = getNextInvoiceNumber(runningYear);
      const today = new Date().toISOString().split('T')[0];

      addPayment({
        invoiceNumber: invNum,
        studentId: student.id,
        studentName: student.nameEnglish || student.nameKhmer,
        studentNameKhmer: student.nameKhmer,
        studentCode: student.studentCode || `FBIS02-00${student.roll}`,
        classGrade: student.classGrade,
        academicYear: runningYear,
        runningYear: 2026,
        title: action.payment.title || 'ថ្លៃសិក្សាចំណេះទូទៅ (Tuition Fee)',
        description: `AI Chat Logged Payment for ${action.payment.paymentType || 'Term'}`,
        paymentType: action.payment.paymentType || 'ត្រីមាស',
        issuedDate: today,
        startDate: today,
        endDate: today,
        fullAmount: action.payment.amountPaidUSD || 350,
        discountPercent: action.payment.discountPercent || 0,
        promotionAmount: 0,
        amountToBePaid: action.payment.amountPaidUSD || 350,
        paidUSD: action.payment.amountPaidUSD || 350,
        paidKHR: 0,
        owedRemain: 0,
        exchangeRate: 4050,
        method: (action.payment.paymentMethod as any) || 'ABA Bank',
        status: 'Paid',
        branchId: selectedBranch.id,
        cashierName: currentUser.name
      });

      // Mark executed
      setMessages(prev => prev.map(m => {
        if (m.id === msgId && m.action) {
          return { ...m, action: { ...m.action, executed: true } };
        }
        return m;
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col h-[650px] max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/20 border border-blue-400/30 rounded-xl">
              <Bot className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold flex items-center gap-1.5 font-khmer">
                  <span>ជំនួយការ AI គ្រប់គ្រងសិស្ស & ការបង់ប្រាក់</span>
                </h2>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-300/30 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                  Admin Only
                </span>
              </div>
              <p className="text-[11px] text-blue-200 font-sans">
                FBIS Autonomous AI Administrator Agent ({selectedBranch.nameEnglish})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg text-blue-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security / Role Guard */}
        {!isAdmin ? (
          <div className="p-8 text-center space-y-4 my-auto">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800 font-khmer">
                ការអនុញ្ញាតត្រូវបានកម្រិត (Access Restricted)
              </h3>
              <p className="text-xs text-slate-500 font-khmer max-w-md mx-auto leading-relaxed">
                មុខងារ AI Chat សម្រាប់កែសម្រួលព័ត៌មានសិស្ស និងកត់ត្រាការបង់ប្រាក់ ត្រូវបានអនុញ្ញាតសម្រាប់តែអ្នកគ្រប់គ្រង (<span className="font-bold text-blue-700">Super Admin</span> និង <span className="font-bold text-blue-700">Campus Admin</span>) តែប៉ុណ្ណោះ។
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold"
            >
              ត្រឡប់ក្រោយ (Close)
            </button>
          </div>
        ) : (
          <>
            {/* Suggested Quick Prompts */}
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-[11px] shrink-0 font-khmer">
              <span className="text-slate-500 font-semibold shrink-0">ឧទាហរណ៍៖</span>
              <button
                onClick={() => handleSendMessage('បញ្ចុះតម្លៃ ២០% លើសិស្ស 3804')}
                className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 rounded-full shrink-0 transition-colors cursor-pointer"
              >
                ⚡ បញ្ចុះតម្លៃ ២០% លើសិស្ស 3804
              </button>
              <button
                onClick={() => handleSendMessage('កត់ត្រាការបង់ប្រាក់ $350 សម្រាប់សិស្ស 3804')}
                className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 rounded-full shrink-0 transition-colors cursor-pointer"
              >
                ⚡ កត់ត្រាបង់ប្រាក់ $350 លើសិស្ស 3804
              </button>
              <button
                onClick={() => handleSendMessage('ប្តូរថ្នាក់សិស្ស 2310 ទៅជា ថ្នាក់ទី ១០')}
                className="px-2.5 py-1 bg-white hover:bg-purple-50 text-purple-700 border border-slate-200 rounded-full shrink-0 transition-colors cursor-pointer"
              >
                ⚡ ប្តូរថ្នាក់សិស្ស 2310 ទៅថ្នាក់ទី ១០
              </button>
            </div>

            {/* Chat Message Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed font-khmer shadow-2xs ${
                      msg.sender === 'user'
                        ? 'bg-blue-700 text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                    
                    {/* Action Execution Card */}
                    {msg.action && (
                      <div className="mt-3 pt-3 border-t border-slate-100 bg-slate-50 -mx-2 px-3 py-2 rounded-xl border border-slate-200 text-slate-800">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="font-bold flex items-center gap-1.5 text-blue-900">
                            {msg.action.type === 'UPDATE_STUDENT' ? (
                              <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                            ) : (
                              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                            )}
                            <span>{msg.action.type === 'UPDATE_STUDENT' ? 'សំណើកែសម្រួលសិស្ស' : 'សំណើកត់ត្រាការបង់ប្រាក់'}</span>
                          </div>

                          {msg.action.executed ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>បានអនុវត្តជោគជ័យ</span>
                            </span>
                          ) : (
                            <span className="text-amber-700 font-bold text-[10px] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              រង់ចាំការបញ្ជាក់
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-600 space-y-1 font-mono">
                          <div>សិស្ស: <span className="font-bold text-slate-900 font-khmer">{msg.action.studentName}</span></div>
                          {msg.action.updates && (
                            <div>
                              ការកែប្រែ: <span className="font-bold text-blue-800">{JSON.stringify(msg.action.updates)}</span>
                            </div>
                          )}
                          {msg.action.payment && (
                            <div>
                              ចំនួនទឹកប្រាក់: <span className="font-bold text-emerald-800">${msg.action.payment.amountPaidUSD} ({msg.action.payment.paymentType})</span>
                            </div>
                          )}
                        </div>

                        {!msg.action.executed && (
                          <button
                            type="button"
                            onClick={() => handleExecuteAction(msg.id, msg.action)}
                            className="mt-2.5 w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>អនុវត្តការផ្លាស់ប្តូរនេះឥឡូវ (Confirm & Apply Now)</span>
                          </button>
                        )}
                      </div>
                    )}

                    <div className={`text-[10px] mt-1 text-right font-sans ${msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-slate-500 text-xs font-khmer">
                  <div className="p-2 bg-white border border-slate-200 rounded-xl shadow-2xs flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span>AI កំពុងវិភាគ និងដំណើរការសំណើ...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="វាយបញ្ចូលសំណើកែសម្រួលព័ត៌មាន ឬកត់ត្រាបង់ប្រាក់ (ឧ. បញ្ចុះតម្លៃសិស្ស 3804 មក 15%)..."
                className="flex-1 h-10 px-3.5 border border-slate-300 rounded-xl text-xs font-khmer focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
              />

              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="h-10 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>ផ្ញើ</span>
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
};
