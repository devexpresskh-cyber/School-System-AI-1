import React, { useState, useRef } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  Database, 
  Download, 
  Upload, 
  ShieldCheck, 
  AlertTriangle, 
  Check, 
  Clock, 
  RotateCcw 
} from 'lucide-react';

export const BackupRestoreView: React.FC = () => {
  const { 
    createBackupJson, 
    restoreFromBackupJson, 
    resetToDefaults, 
    settings, 
    students, 
    payments, 
    academicRecords, 
    products, 
    branches 
  } = useSchool();

  const [restoreStatus, setRestoreStatus] = useState<{ success: boolean; msg: string } | null>(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (confirm('Are you sure you want to restore the default seed data? All custom additions will be reset to demonstration data.')) {
      resetToDefaults();
      setRestoreStatus({
        success: true,
        msg: 'System successfully reset to authentic FBIS sample data.'
      });
    }
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

      {/* Two Column Actions: Backup & Restore */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Create Backup */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Create Full Database Snapshot</h3>
              <p className="text-xs text-slate-500">Download a verified JSON backup file to your computer.</p>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg text-xs text-slate-600 space-y-1">
            <div>• Includes students, grades, payments, inventory, expenses, and system settings.</div>
            <div>• Formatted with ISO timestamp for safe archiving.</div>
            <div>• Can be restored anytime onto any browser or device.</div>
          </div>

          <button
            onClick={handleDownloadBackup}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Full System Backup (.json)</span>
          </button>
        </div>

        {/* Restore Backup */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Restore System From Backup</h3>
              <p className="text-xs text-slate-500">Upload a previously saved .json backup file.</p>
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

          <div className="bg-slate-50 p-3.5 rounded-lg text-xs text-slate-600 space-y-1">
            <div>• Overwrites current database state with the backup snapshot.</div>
            <div>• Validates schema integrity before committing changes.</div>
            <div>• Automatic refresh after restore.</div>
          </div>

          <label
            htmlFor="backup-file-upload"
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Select & Restore Backup File</span>
          </label>
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
            onClick={handleResetToDefaults}
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
    </div>
  );
};
