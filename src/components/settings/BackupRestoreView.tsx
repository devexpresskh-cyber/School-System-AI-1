import React, { useState, useRef } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { ConfirmModal } from '../common/ConfirmModal';
import { 
  Database, 
  Download, 
  Upload, 
  ShieldCheck, 
  AlertTriangle, 
  Check, 
  Clock, 
  RotateCcw,
  Send,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Settings,
  Trash2
} from 'lucide-react';

export const BackupRestoreView: React.FC = () => {
  const { 
    createBackupJson, 
    restoreFromBackupJson, 
    resetToDefaults, 
    clearAllDataKeepSettings,
    settings, 
    students, 
    payments, 
    academicRecords, 
    products, 
    branches,
    sendTelegramBackupNow,
    setActiveTab
  } = useSchool();

  const [restoreStatus, setRestoreStatus] = useState<{ success: boolean; msg: string } | null>(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Telegram Direct Backup
  const [isTelegramBackingUp, setIsTelegramBackingUp] = useState(false);
  const [telegramBackupStatus, setTelegramBackupStatus] = useState<{ success: boolean; msg: string } | null>(null);

  // Reset & Clear Data Confirm Modals
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isClearDataModalOpen, setIsClearDataModalOpen] = useState(false);
  const [clearDataSuccess, setClearDataSuccess] = useState(false);

  const handleDownloadBackup = () => {
    const jsonStr = createBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FBIS_System_Backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSendTelegramBackup = async () => {
    setIsTelegramBackingUp(true);
    setTelegramBackupStatus(null);
    const result = await sendTelegramBackupNow();
    setIsTelegramBackingUp(false);
    if (result.success) {
      setTelegramBackupStatus({
        success: true,
        msg: 'ឯកសារ JSON Backup មូលដ្ឋានទិន្នន័យត្រូវបានផ្ញើទៅកាន់ Telegram ដោយជោគជ័យ! (Full database backup JSON sent to Telegram).'
      });
    } else {
      setTelegramBackupStatus({
        success: false,
        msg: `មិនអាចផ្ញើ Backup ទៅកាន់ Telegram: ${result.error || 'Unknown error'}`
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const ok = restoreFromBackupJson(text);
        if (ok) {
          setRestoreStatus({
            success: true,
            msg: `Successfully restored database from ${file.name}. All records updated.`
          });
        } else {
          setRestoreStatus({
            success: false,
            msg: 'Failed to restore: Invalid backup file format.'
          });
        }
      } catch (err: any) {
        setRestoreStatus({
          success: false,
          msg: `Error reading backup file: ${err.message}`
        });
      }
    };
    reader.readAsText(file);
  };

  const handleResetToDefaults = () => {
    resetToDefaults();
    setIsResetModalOpen(false);
    setRestoreStatus({
      success: true,
      msg: 'System successfully reset to authentic FBIS sample data.'
    });
  };

  const handleClearAllDataKeepSettings = () => {
    clearAllDataKeepSettings();
    setIsClearDataModalOpen(false);
    setClearDataSuccess(true);
    setRestoreStatus({
      success: true,
      msg: 'ទិន្នន័យប្រតិបត្តិការទាំងអស់ត្រូវបានលុបជោគជ័យ ដោយរក្សាទុកការកំណត់ប្រព័ន្ធ សាខា គណនី និងតារាងតម្លៃថ្លៃសិក្សា។ (All records cleared; settings kept).'
    });
  };

  return (
    <div className="space-y-5">
      {/* Overview Header */}
      <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600" />
          <span>System Backup & Database Disaster Recovery (បម្រុងទុក & ស្តារទិន្នន័យ)</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Create complete JSON snapshots of all student records, fee ledgers, academic marks, and multi-campus configurations.
        </p>

        {/* Current Database Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 text-center">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500">Campuses</span>
            <div className="text-lg font-bold font-mono text-slate-900">{branches.length}</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500">Total Students</span>
            <div className="text-lg font-bold font-mono text-blue-700">{students.length}</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500">Invoices & Fees</span>
            <div className="text-lg font-bold font-mono text-emerald-700">{payments.length}</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500">Exam Mark Records</span>
            <div className="text-lg font-bold font-mono text-purple-700">{academicRecords.length}</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500">Stock & Products</span>
            <div className="text-lg font-bold font-mono text-amber-700">{products.length}</div>
          </div>
        </div>
      </div>

      {restoreStatus && (
        <div className={`p-4 rounded-xl border text-xs flex items-center gap-2 ${
          restoreStatus.success 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {restoreStatus.success ? (
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span>{restoreStatus.msg}</span>
        </div>
      )}

      {/* Telegram Automated Cloud Backup Banner & Card */}
      <div className="bg-white p-5 rounded-xl shadow-xs border border-sky-200 bg-gradient-to-r from-sky-50/70 via-blue-50/40 to-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 font-khmer">
                  ការបម្រុងទុកទិន្នន័យស្វ័យប្រវត្តិតាម Telegram (Telegram Automated Cloud Backup)
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  settings.telegramConfig?.enabled && settings.telegramConfig?.autoDailyBackup && settings.telegramConfig?.botToken
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {settings.telegramConfig?.enabled && settings.telegramConfig?.autoDailyBackup && settings.telegramConfig?.botToken
                    ? '● ស្វ័យប្រវត្តិកំពុងដំណើរការ (Automated Active)'
                    : '○ មិនទាន់បើកដំណើរការ (Not Enabled)'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 font-khmer leading-relaxed">
                ប្រព័ន្ធនឹងផ្ញើឯកសារ JSON Backup ពេញលេញ និងរបាយការណ៍សង្ខេបទៅកាន់ Telegram Channel ជារៀងរាល់ថ្ងៃនៅវេលាម៉ោង{' '}
                <span className="font-mono font-bold text-sky-800">{settings.telegramConfig?.dailyBackupTime || '18:00'}</span>។
                {settings.telegramConfig?.channelName && (
                  <span className="ml-1 text-slate-500 font-sans">
                    (Destination: <b>{settings.telegramConfig.channelName}</b>)
                  </span>
                )}
              </p>
              {settings.telegramConfig?.lastBackupDate && (
                <div className="text-[11px] text-slate-500 mt-1">
                  កាលបរិច្ឆេទ Backup ចុងក្រោយ: <span className="font-mono text-slate-800 font-semibold">{new Date(settings.telegramConfig.lastBackupDate).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                localStorage.setItem('fbis_settings_tab', 'telegram');
                setActiveTab('settings');
              }}
              className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>កែសម្រួលការកំណត់ (Settings)</span>
            </button>

            <button
              type="button"
              onClick={handleSendTelegramBackup}
              disabled={isTelegramBackingUp || !settings.telegramConfig?.botToken || !settings.telegramConfig?.chatId}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Send className={`w-3.5 h-3.5 ${isTelegramBackingUp ? 'animate-bounce' : ''}`} />
              <span>{isTelegramBackingUp ? 'កំពុងផ្ញើ...' : 'ផ្ញើ Backup ទៅ Telegram ឥឡូវនេះ'}</span>
            </button>
          </div>
        </div>

        {telegramBackupStatus && (
          <div className={`mt-3 p-3 rounded-lg border text-xs flex items-center gap-2 ${
            telegramBackupStatus.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            {telegramBackupStatus.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-khmer">{telegramBackupStatus.msg}</span>
          </div>
        )}
      </div>

      {/* Three Column Actions: Backup, Restore & Clear Data Keeping Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Create Backup */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Create Full Backup</h3>
                <p className="text-xs text-slate-500">Download verified JSON snapshot file.</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600 space-y-1">
              <div>• Includes students, marks, payments, and settings.</div>
              <div>• Formatted with timestamp for archival.</div>
              <div>• Can be restored anytime onto any device.</div>
            </div>
          </div>

          <button
            onClick={handleDownloadBackup}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Backup (.json)</span>
          </button>
        </div>

        {/* Restore Backup */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Restore From Backup</h3>
                <p className="text-xs text-slate-500">Upload a saved .json backup file.</p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
              id="backup-file-upload"
            />

            <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600 space-y-1">
              <div>• Restores all collections from previous snapshot.</div>
              <div>• Validates schema integrity before committing.</div>
              <div>• Immediate refresh upon successful import.</div>
            </div>
          </div>

          <label
            htmlFor="backup-file-upload"
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer text-center"
          >
            <Upload className="w-4 h-4" />
            <span>Select & Restore File</span>
          </label>
        </div>

        {/* Clear All Data (Keep Settings) */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-amber-200 space-y-4 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span>Clear All Data</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                    Keep Settings
                  </span>
                </h3>
                <p className="text-xs text-slate-500 font-khmer">សម្អាតទិន្នន័យ (រក្សាការកំណត់)</p>
              </div>
            </div>

            <div className="bg-amber-50/60 p-3 rounded-lg text-xs text-amber-900 space-y-1 border border-amber-100 font-khmer">
              <div className="font-semibold text-amber-950 flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>រក្សាទុក: ការកំណត់ប្រព័ន្ធ, សាខា, គណនី, តារាងតម្លៃ</span>
              </div>
              <div className="text-rose-700 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                <span>សម្អាត: សិស្ស, វិក្កយបត្រ, របាយការណ៍ជំពាក់, ពិន្ទុ</span>
              </div>
              <div className="text-[11px] text-slate-500 pt-1 border-t border-amber-200/50">
                រៀបចំប្រព័ន្ធស្អាតសម្រាប់ចាប់ផ្តើមឆ្នាំសិក្សាថ្មី ឬការនាំចូល SQL ថ្មី។
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsClearDataModalOpen(true)}
            className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span className="font-khmer">សម្អាតទិន្នន័យ (រក្សាការកំណត់)</span>
          </button>
        </div>
      </div>

      {/* Snapshot History Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>System Snapshot Log & Recovery Points</span>
          </h3>

          <button
            onClick={() => setIsResetModalOpen(true)}
            className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-semibold hover:underline cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default Demo Data</span>
          </button>
        </div>

        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-4">Date & Time</th>
              <th className="py-2.5 px-4">Description</th>
              <th className="py-2.5 px-4 text-center">Record Count</th>
              <th className="py-2.5 px-4 text-right">Archive Size</th>
              <th className="py-2.5 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {settings.backupHistory.map((h) => (
              <tr key={h.id} className="hover:bg-slate-50/70">
                <td className="py-2.5 px-4 text-slate-800 font-medium">{h.timestamp}</td>
                <td className="py-2.5 px-4 font-sans text-slate-700">{h.description}</td>
                <td className="py-2.5 px-4 text-center text-blue-700 font-bold">{h.recordCount} records</td>
                <td className="py-2.5 px-4 text-right text-slate-600">{h.size}</td>
                <td className="py-2.5 px-4 text-center">
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded font-sans">
                    VERIFIED
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* In-app Confirmation Modal for System Reset */}
      <ConfirmModal
        isOpen={isResetModalOpen}
        title="កំណត់ប្រព័ន្ធឡើងវិញ (Reset to Default Demo Data)"
        message="តើលោកអ្នកពិតជាចង់កំណត់ទិន្នន័យត្រឡប់ទៅទិន្នន័យគំរូដើមរបស់ FBIS វិញមែនទេ? រាល់ទិន្នន័យដែលបានបញ្ចូលថ្មីនឹងត្រូវបានលុបជំនួសវិញ។"
        itemName="Full Database Reset to Initial FBIS Data"
        confirmText="Reset All Data"
        onConfirm={handleResetToDefaults}
        onClose={() => setIsResetModalOpen(false)}
      />

      {/* In-app Confirmation Modal for Clear All Data Keeping Settings */}
      <ConfirmModal
        isOpen={isClearDataModalOpen}
        title="សម្អាតទិន្នន័យទាំងអស់ (Clear All Data - Keep Settings)"
        message="តើលោកអ្នកពិតជាចង់សម្អាតទិន្នន័យសិស្ស វិក្កយបត្របង់ប្រាក់ របាយការណ៍ជំពាក់ និងកំណត់ត្រាពិន្ទុទាំងអស់មែនទេ? ការកំណត់ប្រព័ន្ធ សាខាសាលា បញ្ជីគណនី និងតារាងតម្លៃថ្លៃសិក្សានឹងត្រូវបានរក្សាទុកដូចដើម។"
        itemName="Clear Data Keeping Configurations"
        confirmText="Confirm Clear All Data"
        onConfirm={handleClearAllDataKeepSettings}
        onClose={() => setIsClearDataModalOpen(false)}
      />
    </div>
  );
};
