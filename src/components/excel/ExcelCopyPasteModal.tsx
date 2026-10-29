import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  Clipboard, 
  FileSpreadsheet, 
  Check, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  RotateCcw,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';

interface ExcelCopyPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'students' | 'payments';
}

export const ExcelCopyPasteModal: React.FC<ExcelCopyPasteModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'students'
}) => {
  const { 
    importStudentsFromExcel, 
    importPaymentsFromExcel, 
    selectedBranch 
  } = useSchool();

  const [importType, setImportType] = useState<'students' | 'payments'>(defaultType);
  const [rawPastedText, setRawPastedText] = useState('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<{ successCount: number; errors: string[] } | null>(null);

  if (!isOpen) return null;

  // Sample Excel copy data for immediate testing
  const sampleStudentClipboard = 
`ឈ្មោះជាភាសាខ្មែរ	ឈ្មោះជាអក្សរឡាតាំង	អត្តលេខ	ថ្នាក់ទី	ភេទ	ថ្ងៃខែឆ្នាំកំណើត	លេខទូរស័ព្ទ	ឈ្មោះអាណាព្យាបាល	អាសយដ្ឋាន
ជា វណ្ណារ៉ា	Chea Vannara	3901	ថ្នាក់ទី ១០	ប្រុស	2008-03-12	012 889 771	ជា វិបុល	ក្រុងសៀមរាប
សេង ស្រីលីន	Seng Sreylin	3902	ថ្នាក់ទី ១០	ស្រី	2008-08-25	097 554 321	សេង ចាន់ថន	សង្កាត់ស្លក្រាម
អ៊ុក រស្មី	Ouk Reaksmey	3903	ថ្នាក់ទី ១១	ស្រី	2007-11-04	088 998 123	អ៊ុក សម្បត្តិ	សង្កាត់ស្វាយដង្គំ
លី ម៉េងហុង	Ly Menghong	3904	ថ្នាក់ទី ១២	ប្រុស	2006-05-19	070 334 556	លី គង់	ក្រុងសៀមរាប`;

  const samplePaymentClipboard = 
`លេខវិក្កយបត្រ	ឈ្មោះសិស្ស	ថ្នាក់ទី	ឆ្នាំសិក្សា	ប្រភេទចំណូល	បរិយាយ	ប្រភេទបង់	កាលបរិច្ឆេទ	ថ្ងៃចាប់ផ្ដើម	ថ្ងៃបញ្ចប់	តម្លៃពេញ	បញ្ចុះតម្លៃ(%)	តម្លៃត្រូវបង់	ប្រាក់បង់($)	ប្រាក់បង់(៛)	វិធីសាស្ត្រ
2026-003901	ជា វណ្ណារ៉ា	ថ្នាក់ទី ១០	2026	ថ្លៃសិក្សា	Tuition Term 1	Term 1	2026-10-25	2026-10-01	2026-12-15	350	10	315	315	0	ABA Bank
2026-003902	សេង ស្រីលីន	ថ្នាក់ទី ១០	2026	ថ្លៃសិក្សា	Tuition Term 1	Term 1	2026-10-25	2026-10-01	2026-12-15	350	0	350	350	0	Cash USD`;

  // Parse TSV (Tab Separated Values) copied directly from Excel / Google Sheets
  const handleParseClipboard = (text: string) => {
    setRawPastedText(text);
    setErrorMsg('');
    setImportResult(null);

    const trimmed = text.trim();
    if (!trimmed) {
      setParsedRows([]);
      setDetectedHeaders([]);
      return;
    }

    const lines = trimmed.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      setErrorMsg('សូមបញ្ចូលយ៉ាងតិច ២ ជួរ (ជួរទី១ ជាក្បាលតារាង Headers និងជួរទី២ ជាទិន្នន័យ Data)។');
      setParsedRows([]);
      return;
    }

    // Split first row by tabs
    const headers = lines[0].split('\t').map(h => h.trim());
    if (headers.length < 2) {
      // Maybe comma separated or space separated? Check comma
      if (lines[0].includes(',')) {
        const csvHeaders = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
        parseWithSeparator(lines, ',', csvHeaders);
        return;
      }
      setErrorMsg('ទិន្នន័យដែលចម្លងមិនមែនជាទម្រង់ Tab-Separated ពី Excel ទេ។ សូមបើក Excel រួច Select Cell ហើយចុច Ctrl+C ម្តងទៀត។');
      return;
    }

    parseWithSeparator(lines, '\t', headers);
  };

  const parseWithSeparator = (lines: string[], separator: string, headers: string[]) => {
    setDetectedHeaders(headers);
    const rows: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      const cells = line.split(separator).map(c => c.trim().replace(/^["']|["']$/g, ''));
      const rowObj: any = {};
      
      headers.forEach((header, colIdx) => {
        const cellVal = cells[colIdx] !== undefined ? cells[colIdx] : '';
        // Try converting numbers if appropriate
        if (cellVal !== '' && !isNaN(Number(cellVal)) && !cellVal.startsWith('0') && header.toLowerCase().includes('amount') || header.includes('តម្លៃ') || header.includes('ប្រាក់') || header.includes('ថ្លៃ')) {
          rowObj[header] = Number(cellVal);
        } else {
          rowObj[header] = cellVal;
        }
      });

      // Filter out completely empty rows
      if (Object.values(rowObj).some(v => v !== '')) {
        rows.push(rowObj);
      }
    }

    if (rows.length === 0) {
      setErrorMsg('រកមិនឃើញទិន្នន័យនៅក្នុងជួរដែលបានបិទភ្ជាប់ (Paste) ឡើយ។');
      setParsedRows([]);
      return;
    }

    setParsedRows(rows);
  };

  const handleApplySample = () => {
    const sample = importType === 'students' ? sampleStudentClipboard : samplePaymentClipboard;
    handleParseClipboard(sample);
  };

  const handleExecuteImport = () => {
    if (parsedRows.length === 0) return;
    setIsProcessing(true);

    setTimeout(() => {
      let res;
      if (importType === 'students') {
        res = importStudentsFromExcel(parsedRows);
      } else {
        res = importPaymentsFromExcel(parsedRows);
      }

      setImportResult(res);
      setIsProcessing(false);
      if (res.successCount > 0) {
        setParsedRows([]);
        setRawPastedText('');
      }
    }, 400);
  };

  const handleClear = () => {
    setRawPastedText('');
    setParsedRows([]);
    setDetectedHeaders([]);
    setErrorMsg('');
    setImportResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Clipboard className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span>Copy & Paste Direct Importer from Excel (បិទភ្ជាប់ផ្ទាល់ពី Excel)</span>
                <span className="bg-emerald-500/30 text-emerald-200 text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Ctrl+C & Ctrl+V
                </span>
              </h2>
              <p className="text-xs text-emerald-200 font-khmer mt-0.5">
                ចម្លង (Copy) ពី Microsoft Excel ឬ Google Sheets រួចចុច Paste (Ctrl+V) ចូលទីនេះ ដើម្បីនាំចូលទិន្នន័យដោយផ្ទាល់ក្នុង ១ វិនាទី
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg text-emerald-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Target Type Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setImportType('students');
                  handleClear();
                }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  importType === 'students'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>👨‍🎓 Import Students (នាំចូលសិស្ស)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setImportType('payments');
                  handleClear();
                }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  importType === 'payments'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>💳 Import Payments (នាំចូលវិក្កយបត្រ)</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleApplySample}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                title="សាកល្បងជាមួយទិន្នន័យគំរូ"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Paste Sample Excel Data (សាកល្បងគំរូ)</span>
              </button>

              {rawPastedText && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Paste Guide */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-start gap-3 text-xs">
            <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1 font-khmer text-slate-700">
              <div className="font-bold text-slate-900">
                របៀបប្រើប្រាស់ការបិទភ្ជាប់ (How to use Excel Copy & Paste):
              </div>
              <div className="text-[11px] text-slate-600 leading-relaxed">
                ១. បើកឯកសារ Excel ឬ Google Sheets របស់អ្នក<br />
                ២. ជ្រើសរើសជួរទិន្នន័យរួមទាំង <span className="font-semibold text-slate-800">ក្បាលតារាង (Header Row)</span> ដូចជា: ឈ្មោះខ្មែរ, ឈ្មោះឡាតាំង, អត្តលេខ, ថ្នាក់, ភេទ, ថ្ងៃកំណើត, ទូរស័ព្ទ...<br />
                ៣. ចុច <span className="font-mono font-bold bg-white px-1 py-0.5 rounded border border-slate-300">Ctrl + C</span> (ចម្លង) រួចចុចចូលប្រអប់ខាងក្រោម ហើយចុច <span className="font-mono font-bold bg-white px-1 py-0.5 rounded border border-slate-300">Ctrl + V</span> (បិទភ្ជាប់)
              </div>
            </div>
          </div>

          {/* Direct Paste Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <span>Paste Clipboard Content Here (ចុច Ctrl + V ក្នុងប្រអប់នេះ):</span>
              </label>
              {rawPastedText && (
                <span className="font-mono text-emerald-700 font-bold">
                  {parsedRows.length} rows detected
                </span>
              )}
            </div>

            <textarea
              value={rawPastedText}
              onChange={(e) => handleParseClipboard(e.target.value)}
              placeholder={`ចុចទីនេះ រួចចុច Ctrl + V ដើម្បី Paste ទិន្នន័យដែលបាន Copy ពី Excel...\n\nឧទាហរណ៍៖\nឈ្មោះជាភាសាខ្មែរ\tឈ្មោះជាអក្សរឡាតាំង\tអត្តលេខ\tថ្នាក់ទី\tភេទ\nគឹមថៃ សួនីន\tKimthai Sonine\t3804\tថ្នាក់ទី ១២\tស្រី`}
              rows={5}
              className="w-full p-3 border-2 border-dashed border-emerald-300 focus:border-emerald-600 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500/20 focus:outline-none bg-emerald-50/20 text-slate-800"
            />
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2 font-khmer">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Banner */}
          {importResult && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>បាននាំចូលទិន្នន័យ {importResult.successCount} កំណត់ត្រា ({importType}) ដោយជោគជ័យទៅកាន់សាខា {selectedBranch.nameEnglish}!</span>
              </div>
              {importResult.errors.length > 0 && (
                <div className="mt-2 pl-7 text-[11px] text-amber-800 space-y-0.5">
                  <span className="font-bold">ការកត់សម្គាល់៖</span>
                  {importResult.errors.map((err, i) => (
                    <div key={i}>• {err}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Parsed Rows Preview Grid */}
          {parsedRows.length > 0 && (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs space-y-0">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Live Preview Table ({parsedRows.length} Rows Ready to Import)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 font-khmer">
                    សូមពិនិត្យមើលក្បាលតារាង និងទិន្នន័យគំរូ មុនពេលចុចបញ្ជាក់ការនាំចូល
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExecuteImport}
                    disabled={isProcessing}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isProcessing ? 'កំពុងនាំចូល...' : `បញ្ជាក់ និងនាំចូល ${parsedRows.length} ជួរ (Import Now)`}</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto max-h-72">
                <table className="w-full text-xs text-left whitespace-nowrap">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="py-2 px-3 w-10 bg-slate-100">#</th>
                      {detectedHeaders.map((header, i) => (
                        <th key={i} className="py-2 px-3 font-khmer bg-slate-100">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {parsedRows.slice(0, 30).map((row, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/40">
                        <td className="py-1.5 px-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                        {detectedHeaders.map((header, colIdx) => (
                          <td key={colIdx} className="py-1.5 px-3 text-slate-800 font-mono text-[11px]">
                            {String(row[header] !== undefined ? row[header] : '—')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {parsedRows.length > 30 && (
                <div className="p-2 text-center text-slate-400 text-[11px] bg-slate-50 border-t border-slate-100 font-khmer">
                  បង្ហាញ ៣០ ជួរដំបូងនៃចំនួនសរុប {parsedRows.length} ជួរ។ គ្រប់ {parsedRows.length} ជួរទាំងអស់នឹងត្រូវបាននាំចូល។
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 font-khmer">
            ទីតាំងសាខាគោលដៅ: <span className="font-bold text-slate-800">{selectedBranch.nameKhmer} ({selectedBranch.code})</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
            >
              បិទ (Close)
            </button>

            {parsedRows.length > 0 && (
              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={isProcessing}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>{isProcessing ? 'កំពុងនាំចូល...' : `នាំចូល ${parsedRows.length} ជួរ`}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
