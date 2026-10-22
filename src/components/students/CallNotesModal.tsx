import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Student, CallPurpose, CallOutcome } from '../../types';
import { PhoneCall, Calendar, Clock, User, X, Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface CallNotesModalProps {
  isOpen: boolean;
  student: Student | null;
  onClose: () => void;
}

export const CallNotesModal: React.FC<CallNotesModalProps> = ({
  isOpen,
  student,
  onClose
}) => {
  const { callNotes, addCallNote, deleteCallNote, currentUser, selectedBranch } = useSchool();

  const [isAdding, setIsAdding] = useState(false);
  const [recipientName, setRecipientName] = useState(student?.parentName || '');
  const [recipientPhone, setRecipientPhone] = useState(student?.guardianPhone || student?.phone || '');
  const [purpose, setPurpose] = useState<CallPurpose>('payment_reminder');
  const [outcome, setOutcome] = useState<CallOutcome>('answered_promised_pay');
  const [promisedDate, setPromisedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  if (!isOpen || !student) return null;

  const studentNotes = callNotes.filter(cn => cn.studentId === student.id);

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const dateTimeStr = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    addCallNote({
      studentId: student.id,
      studentName: student.nameEnglish,
      studentNameKhmer: student.nameKhmer,
      studentCode: student.studentCode,
      branchId: selectedBranch.id,
      dateTime: dateTimeStr,
      staffId: currentUser.id,
      staffName: currentUser.name,
      recipientName: recipientName || student.parentName,
      recipientPhone: recipientPhone || student.guardianPhone,
      purpose,
      outcome,
      promisedDate: promisedDate || undefined,
      notes,
      followUpDate: followUpDate || undefined
    });

    setIsAdding(false);
    setNotes('');
    setPromisedDate('');
    setFollowUpDate('');
  };

  const purposeLabels: Record<CallPurpose, { km: string; en: string }> = {
    payment_reminder: { km: 'រំលឹកថ្លៃសិក្សា/ជំពាក់', en: 'Tuition Arrears Reminder' },
    absence_inquiry: { km: 'សួរសុខទុក្ខ/អវត្តមាន', en: 'Absence Inquiry' },
    academic_consult: { km: 'ពិគ្រោះលទ្ធផលសិក្សា', en: 'Academic Consultation' },
    discipline: { km: 'វិន័យ និងសីលធម៌', en: 'Discipline / Behavior' },
    health_check: { km: 'សុខភាពសិស្ស', en: 'Student Health' },
    general: { km: 'សាកសួរទូទៅ', en: 'General Call' }
  };

  const outcomeLabels: Record<CallOutcome, { label: string; color: string }> = {
    answered_promised_pay: { label: 'លើកទូរស័ព្ទ & សន្យាបង់ប្រាក់ (Promised to Pay)', color: 'bg-emerald-100 text-emerald-800' },
    answered_inquired: { label: 'លើកទូរស័ព្ទ & បានសាកសួរ (Answered)', color: 'bg-blue-100 text-blue-800' },
    left_voicemail: { label: 'ផ្ញើសារសំឡេង (Voicemail)', color: 'bg-amber-100 text-amber-800' },
    no_answer: { label: 'មិនលើកទូរស័ព្ទ (No Answer)', color: 'bg-red-100 text-red-800' },
    line_busy: { label: 'ជាប់រវល់ (Line Busy)', color: 'bg-purple-100 text-purple-800' },
    wrong_number: { label: 'ច្រឡំលេខ (Wrong Number)', color: 'bg-slate-200 text-slate-800' }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        {/* Modal Header */}
        <div className="bg-blue-800 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-amber-300" />
            <h3 className="text-sm font-bold font-khmer">
              កំណត់ត្រាទូរស័ព្ទ / Call Notes ({student.nameKhmer} · {student.studentCode})
            </h3>
          </div>
          <button onClick={onClose} className="text-blue-200 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Student quick info strip */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="font-khmer font-bold text-slate-900 text-sm">{student.nameKhmer}</span>
              <span className="text-slate-500 ml-1.5 font-mono">({student.classGrade} · Roll: {student.roll})</span>
            </div>
            <div className="text-slate-600 font-mono text-xs">
              Guardian Phone: <span className="font-bold text-blue-700">{student.guardianPhone}</span>
            </div>
          </div>

          {!isAdding && (
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-700 font-khmer">
                ប្រវត្តិនៃការហៅទូរស័ព្ទ ({studentNotes.length} ដង)
              </span>
              <button
                onClick={() => setIsAdding(true)}
                className="px-3.5 py-1.5 bg-[#84cc16] hover:bg-[#65a30d] text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Call Note (កត់ត្រាការខលថ្មី)</span>
              </button>
            </div>
          )}

          {/* Form to log a new call note */}
          {isAdding && (
            <form onSubmit={handleCreateNote} className="bg-blue-50/50 p-4 rounded-xl border border-blue-200 space-y-3">
              <div className="flex items-center justify-between border-b border-blue-200/80 pb-2">
                <span className="font-bold text-blue-900 font-khmer">
                  កត់ត្រាការហៅទូរស័ព្ទថ្មី (Log Phone Call)
                </span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">អ្នកទទួល / Recipient Name</label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="ឈ្មោះឪពុក ឬ ម្តាយ"
                    className="w-full h-8 px-2.5 border border-slate-300 rounded bg-white font-khmer"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">លេខទូរស័ព្ទ / Phone Number</label>
                  <input
                    type="text"
                    required
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    className="w-full h-8 px-2.5 border border-slate-300 rounded bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">គោលបំណង / Call Purpose</label>
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value as CallPurpose)}
                    className="w-full h-8 px-2.5 border border-slate-300 rounded bg-white font-khmer"
                  >
                    <option value="payment_reminder">រំលឹកថ្លៃសិក្សា / Payment Reminder</option>
                    <option value="absence_inquiry">សួរសុខទុក្ខ / Absence Inquiry</option>
                    <option value="academic_consult">ពិគ្រោះលទ្ធផលសិក្សា / Academic</option>
                    <option value="discipline">វិន័យ និងសីលធម៌ / Behavior</option>
                    <option value="health_check">សុខភាពសិស្ស / Health Check</option>
                    <option value="general">សាកសួរទូទៅ / General Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">លទ្ធផលនៃការហៅ / Call Outcome</label>
                  <select
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value as CallOutcome)}
                    className="w-full h-8 px-2.5 border border-slate-300 rounded bg-white font-khmer"
                  >
                    <option value="answered_promised_pay">លើកទូរស័ព្ទ & សន្យាបង់ប្រាក់ (Promised to Pay)</option>
                    <option value="answered_inquired">លើកទូរស័ព្ទ & បានសាកសួរ (Answered)</option>
                    <option value="left_voicemail">ផ្ញើសារសំឡេង (Voicemail)</option>
                    <option value="no_answer">មិនលើកទូរស័ព្ទ (No Answer)</option>
                    <option value="line_busy">ជាប់រវល់ (Line Busy)</option>
                    <option value="wrong_number">ច្រឡំលេខ (Wrong Number)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">កាលបរិច្ឆេទសន្យាបង់ប្រាក់ (Promised Pay Date)</label>
                  <input
                    type="date"
                    value={promisedDate}
                    onChange={(e) => setPromisedDate(e.target.value)}
                    className="w-full h-8 px-2.5 border border-slate-300 rounded bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">កាលបរិច្ឆេទត្រូវទាក់ទងបន្ត (Follow-up Date)</label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full h-8 px-2.5 border border-slate-300 rounded bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">កំណត់សម្គាល់លម្អិត / Call Notes</label>
                <textarea
                  required
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="សរសេរខ្លឹមសារសង្ខេបនៃការសន្ទនា..."
                  className="w-full px-3 py-2 border border-slate-300 rounded bg-white font-khmer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Save Call Note
                </button>
              </div>
            </form>
          )}

          {/* List of existing call notes */}
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {studentNotes.length === 0 ? (
              <div className="text-center py-8 text-slate-400 font-khmer">
                មិនទាន់មានកំណត់ត្រាហៅទូរស័ព្ទនៅឡើយទេ។ (No call notes logged yet).
              </div>
            ) : (
              studentNotes.map((cn) => {
                const outcomeInfo = outcomeLabels[cn.outcome];
                const purposeInfo = purposeLabels[cn.purpose];
                return (
                  <div key={cn.id} className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition-colors space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-slate-600 text-[11px] flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {cn.dateTime}
                        </span>
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded font-khmer">
                          {purposeInfo.km}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-khmer ${outcomeInfo.color}`}>
                          {outcomeInfo.label}
                        </span>
                        <button
                          onClick={() => {
                            if (confirm('Delete this call note?')) {
                              deleteCallNote(cn.id);
                            }
                          }}
                          className="text-slate-400 hover:text-red-600 p-0.5"
                          title="Delete note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="font-khmer text-slate-800 text-xs leading-relaxed">
                      {cn.notes}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 font-sans">
                      <div>
                        <span>Called by: </span>
                        <span className="font-bold text-slate-700 font-khmer">{cn.staffName}</span>
                        <span> to </span>
                        <span className="font-bold text-slate-700 font-khmer">{cn.recipientName} ({cn.recipientPhone})</span>
                      </div>

                      {cn.promisedDate && (
                        <div className="text-emerald-700 font-semibold font-khmer flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>សន្យាបង់ប្រាក់: {cn.promisedDate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
