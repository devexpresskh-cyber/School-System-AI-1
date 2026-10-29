import React, { useState, useRef } from 'react';
import { useSchool } from '../../context/SchoolContext';
import * as XLSX from 'xlsx';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  CreditCard, 
  Award, 
  Check, 
  RotateCcw,
  Database,
  Clipboard,
  Sparkles,
  Info
} from 'lucide-react';

export const ExcelImportView: React.FC = () => {
  const { 
    importStudentsFromExcel, 
    importPaymentsFromExcel, 
    importGradesFromExcel, 
    selectedBranch,
    setActiveTab
  } = useSchool();

  const [importMode, setImportMode] = useState<'paste' | 'upload'>('paste');
  const [importType, setImportType] = useState<'students' | 'payments' | 'grades'>('students');
  const [rawPastedText, setRawPastedText] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [importResult, setImportResult] = useState<{ successCount: number; errors: string[] } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample data presets for instant testing
  const sampleStudentData = 
`ឈ្មោះជាភាសាខ្មែរ	ឈ្មោះជាអក្សរឡាតាំង	អត្តលេខ	ថ្នាក់ទី	ភេទ	ថ្ងៃខែឆ្នាំកំណើត	លេខទូរស័ព្ទ	ឈ្មោះអាណាព្យាបាល	អាសយដ្ឋាន
ជា វណ្ណារ៉ា	Chea Vannara	3901	ថ្នាក់ទី ១០	ប្រុស	2008-03-12	012 889 771	ជា វិបុល	ក្រុងសៀមរាប
សេង ស្រីលីន	Seng Sreylin	3902	ថ្នាក់ទី ១០	ស្រី	2008-08-25	097 554 321	សេង ចាន់ថន	សង្កាត់ស្លក្រាម
អ៊ុក រស្មី	Ouk Reaksmey	3903	ថ្នាក់ទី ១១	ស្រី	2007-11-04	088 998 123	អ៊ុក សម្បត្តិ	សង្កាត់ស្វាយដង្គំ
លី ម៉េងហុង	Ly Menghong	3904	ថ្នាក់ទី ១២	ប្រុស	2006-05-19	070 334 556	លី គង់	ក្រុងសៀមរាប`;

  const samplePaymentData = 
`លេខវិក្កយបត្រ	ឈ្មោះសិស្ស	ថ្នាក់ទី	ឆ្នាំសិក្សា	ប្រភេទចំណូល	បរិយាយ	ប្រភេទបង់	កាលបរិច្ឆេទ	ថ្ងៃចាប់ផ្ដើម	ថ្ងៃបញ្ចប់	តម្លៃពេញ	បញ្ចុះតម្លៃ(%)	តម្លៃត្រូវបង់	ប្រាក់បង់($)	ប្រាក់បង់(៛)	វិធីសាស្ត្រ
2026-003901	ជា វណ្ណារ៉ា	ថ្នាក់ទី ១០	2026	ថ្លៃសិក្សា	Tuition Term 1	Term 1	2026-10-25	2026-10-01	2026-12-15	350	10	315	315	0	ABA Bank
2026-003902	សេង ស្រីលីន	ថ្នាក់ទី ១០	2026	ថ្លៃសិក្សា	Tuition Term 1	Term 1	2026-10-25	2026-10-01	2026-12-15	350	0	350	350	0	Cash USD`;

  const handleParseClipboard = (text: string) => {
    setRawPastedText(text);
    setErrorMsg('');
    setImportResult(null);

    const trimmed = text.trim();
    if (!trimmed) {
      setParsedRows([]);
      return;
    }

    const lines = trimmed.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      setErrorMsg('សូមបញ្ចូលយ៉ាងតិច ២ ជួរ (ជួរទី១ ជា Headers និងជួរទី២ ជាទិន្នន័យ Data)។');
      setParsedRows([]);
      return;
    }

    const isTabSeparated = lines[0].includes('\t');
    const separator = isTabSeparated ? '\t' : (lines[0].includes(',') ? ',' : '\t');
    const headers = lines[0].split(separator).map(h => h.trim().replace(/^["']|["']$/g, ''));

    const rows: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      const cells = line.split(separator).map(c => c.trim().replace(/^["']|["']$/g, ''));
      const rowObj: any = {};
      headers.forEach((header, colIdx) => {
        const cellVal = cells[colIdx] !== undefined ? cells[colIdx] : '';
        if (cellVal !== '' && !isNaN(Number(cellVal)) && (header.toLowerCase().includes('amount') || header.includes('តម្លៃ') || header.includes('ប្រាក់') || header.includes('ថ្លៃ'))) {
          rowObj[header] = Number(cellVal);
        } else {
          rowObj[header] = cellVal;
        }
      });
      if (Object.values(rowObj).some(v => v !== '')) {
        rows.push(rowObj);
      }
    }

    if (rows.length === 0) {
      setErrorMsg('រកមិនឃើញទិន្នន័យត្រឹមត្រូវនៅក្នុងអត្ថបទដែលបានបិទភ្ជាប់ (Paste) ឡើយ។');
      setParsedRows([]);
      return;
    }

    setParsedRows(rows);
  };

  // Download Sample Template for Excel
  const handleDownloadTemplate = () => {
    let templateData: any[] = [];
    let sheetName = 'Template';

    if (importType === 'students') {
      sheetName = 'Students Import';
      templateData = [
        {
          'ឈ្មោះជាភាសាខ្មែរ': 'គឹមថៃ សួនីន',
          'ឈ្មោះជាអក្សរឡាតាំង': 'Kimthai Sonine',
          'អត្តលេខ': '3804',
          'ថ្នាក់ទី': 'ថ្នាក់ទី ១២',
          'ភេទ': 'ស្រី',
          'ថ្ងៃខែឆ្នាំកំណើត': '2006-07-10',
          'លេខទូរស័ព្ទ': '077 473 545',
          'ឈ្មោះអាណាព្យាបាល': 'គឹម ថៃ',
          'អាសយដ្ឋាន': 'ក្រុងសៀមរាប ខេត្តសៀមរាប'
        },
        {
          'ឈ្មោះជាភាសាខ្មែរ': 'ទ្រី សេងហៃ',
          'ឈ្មោះជាអក្សរឡាតាំង': 'Try Senghai',
          'អត្តលេខ': '2310',
          'ថ្នាក់ទី': 'ថ្នាក់ទី ៩',
          'ភេទ': 'ប្រុស',
          'ថ្ងៃខែឆ្នាំកំណើត': '2009-11-20',
          'លេខទូរស័ព្ទ': '097 889 900',
          'ឈ្មោះអាណាព្យាបាល': 'ទ្រី ប៊ុនធឿន',
          'អាសយដ្ឋាន': 'សង្កាត់ស្លក្រាម ក្រុងសៀមរាប'
        }
      ];
    } else if (importType === 'payments') {
      sheetName = 'Payments Import';
      templateData = [
        {
          'លេខវិក្កយបត្រ': '2026-002315',
          'ឈ្មោះសិស្ស': 'គឹមថៃ សួនីន',
          'ថ្នាក់ទី': 'ថ្នាក់ទី ១២',
          'ឆ្នាំសិក្សា': '2026',
          'ប្រភេទចំណូល': 'ថ្លៃឈ្នួលសិក្សាកម្មវិធីបណ្តុះបណ្តាលចំណេះទូទៅ',
          'បរិយាយ': 'Tuition Quarter 2',
          'ប្រភេទបង់': 'ត្រីមាសទី២',
          'កាលបរិច្ឆេទ': '2026-10-22',
          'ថ្ងៃចាប់ផ្ដើម': '2026-09-21',
          'ថ្ងៃបញ្ចប់': '2026-12-25',
          'តម្លៃពេញ': 1182.00,
          'បញ្ចុះតម្លៃ(%)': 20.00,
          'តម្លៃត្រូវបង់': 945.60,
          'ប្រាក់បង់($)': 472.80,
          'ប្រាក់បង់(៛)': 0,
          'វិធីសាស្ត្រ': 'ABA Bank'
        }
      ];
    } else {
      sheetName = 'Grades Import';
      templateData = [
        {
          'អត្តលេខ': 'FBIS02-003804',
          'ឈ្មោះសិស្ស': 'គឹមថៃ សួនីន',
          'ថ្នាក់ទី': 'ថ្នាក់ទី ១២',
          'ភាសាខ្មែរ': 92,
          'គណិតវិទ្យា': 96,
          'ភាសាអង់គ្លេស': 94,
          'រូបវិទ្យា': 88,
          'គីមីវិទ្យា': 90,
          'ជីវវិទ្យា': 95,
          'យោបល់គ្រូ': 'និស្សិតឆ្នើមប្រចាំឆមាស'
        }
      ];
    }

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `FBIS_${importType}_template.xlsx`);
  };

  // Handle File Upload & Parse
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMsg('');
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const firstSheetName = wb.SheetNames[0];
        const ws = wb.Sheets[firstSheetName];
        const data = XLSX.utils.sheet_to_json(ws);

        if (!data || data.length === 0) {
          setErrorMsg('The selected spreadsheet contains no data rows.');
          setParsedRows([]);
          return;
        }

        setParsedRows(data);
      } catch (err: any) {
        setErrorMsg(`Failed to parse file: ${err.message}`);
        setParsedRows([]);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Commit Import
  const handleExecuteImport = () => {
    if (parsedRows.length === 0) return;
    setIsProcessing(true);
    setErrorMsg('');

    setTimeout(() => {
      try {
        let res;
        if (importType === 'students') {
          res = importStudentsFromExcel(parsedRows);
        } else if (importType === 'payments') {
          res = importPaymentsFromExcel(parsedRows);
        } else {
          res = importGradesFromExcel(parsedRows);
        }

        setImportResult(res);
        setParsedRows([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err: any) {
        console.error('[FBIS] Excel Import Error:', err);
        setErrorMsg(`Failed to import data: ${err?.message || 'Unexpected parsing error'}`);
      } finally {
        setIsProcessing(false);
      }
    }, 300);
  };

  const handleReset = () => {
    setParsedRows([]);
    setFileName('');
    setImportResult(null);
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-5">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <span>Import Data from Excel / CSV (នាំចូលទិន្នន័យពី Excel)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Seamlessly import bulk students, fee payments, and academic exam scores into {selectedBranch?.nameEnglish || 'Campus'}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('sql-import')}
              className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Database className="w-4 h-4 text-indigo-600" />
              <span>SQL Import & Analytics (នាំចូល SQL តាមសាខា)</span>
            </button>

            <button
              onClick={handleDownloadTemplate}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Download {importType.toUpperCase()} Template (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Import Type Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          <button
            onClick={() => {
              setImportType('students');
              handleReset();
            }}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
              importType === 'students'
                ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className={`p-2 rounded-lg ${importType === 'students' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Student Admissions</div>
              <div className="text-[11px] text-slate-500 font-khmer">បញ្ជីសិស្ស និងព័ត៌មានផ្ទាល់ខ្លួន</div>
            </div>
          </button>

          <button
            onClick={() => {
              setImportType('payments');
              handleReset();
            }}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
              importType === 'payments'
                ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className={`p-2 rounded-lg ${importType === 'payments' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Fee Payments & Arrears</div>
              <div className="text-[11px] text-slate-500 font-khmer">ការបង់ថ្លៃសិក្សា និងវិក្កយបត្រ</div>
            </div>
          </button>

          <button
            onClick={() => {
              setImportType('grades');
              handleReset();
            }}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
              importType === 'grades'
                ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className={`p-2 rounded-lg ${importType === 'grades' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Academic Marks & Scores</div>
              <div className="text-[11px] text-slate-500 font-khmer">ពិន្ទុប្រឡង និងចំណាត់ថ្នាក់</div>
            </div>
          </button>
        </div>
      </div>

      {/* Mode Switcher: Direct Copy & Paste vs File Upload */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setImportMode('paste');
              handleReset();
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              importMode === 'paste'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clipboard className="w-4 h-4" />
            <span>Copy & Paste from Excel (បិទភ្ជាប់ផ្ទាល់)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setImportMode('upload');
              handleReset();
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              importMode === 'upload'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload File (.xlsx / .csv)</span>
          </button>
        </div>

        {importMode === 'paste' && (
          <button
            type="button"
            onClick={() => {
              const sample = importType === 'students' ? sampleStudentData : (importType === 'payments' ? samplePaymentData : '');
              if (sample) handleParseClipboard(sample);
            }}
            className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Paste Sample Data (សាកល្បងគំរូ)</span>
          </button>
        )}
      </div>

      {/* Copy & Paste Textarea Mode */}
      {importMode === 'paste' && (
        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 space-y-3">
          <div className="flex items-start gap-2.5 p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg text-xs text-emerald-900">
            <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="font-khmer leading-relaxed">
              <span className="font-bold">របៀបប្រើ៖</span> បើក Excel ឬ Google Sheets របស់អ្នក រួច Select Cell ទាំងអស់រួមទាំង <span className="font-semibold underline">ក្បាលតារាង (Header Row)</span> ចុច <span className="font-mono font-bold bg-white px-1 rounded border">Ctrl + C</span> រួចចុច Mouse ក្នុងប្រអប់ខាងក្រោមហើយចុច <span className="font-mono font-bold bg-white px-1 rounded border">Ctrl + V</span>។
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-700">
                Paste Excel Clipboard Data (ចុចបិទភ្ជាប់ក្នុងប្រអប់នេះ):
              </label>
              {rawPastedText && (
                <span className="font-mono font-bold text-emerald-700">
                  {parsedRows.length} rows parsed
                </span>
              )}
            </div>

            <textarea
              value={rawPastedText}
              onChange={(e) => handleParseClipboard(e.target.value)}
              placeholder={`ចុចទីនេះ រួចចុច Ctrl + V ដើម្បីបិទភ្ជាប់ទិន្នន័យដែលបាន Copy ពី Excel ឬ Google Sheets...\n\nឧទាហរណ៍៖\nឈ្មោះជាភាសាខ្មែរ\tឈ្មោះជាអក្សរឡាតាំង\tអត្តលេខ\tថ្នាក់ទី\tភេទ\nគឹមថៃ សួនីន\tKimthai Sonine\t3804\tថ្នាក់ទី ១២\tស្រី`}
              rows={6}
              className="w-full p-3.5 border-2 border-dashed border-emerald-300 focus:border-emerald-600 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500/20 focus:outline-none bg-emerald-50/20 text-slate-800"
            />
          </div>
        </div>
      )}

      {/* Upload Dropzone Mode */}
      {importMode === 'upload' && (
        <div className="bg-white p-6 rounded-xl shadow-xs border-2 border-dashed border-slate-300 text-center hover:border-blue-500 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
            className="hidden"
            id="excel-file-upload"
          />
          <label
            htmlFor="excel-file-upload"
            className="cursor-pointer flex flex-col items-center justify-center space-y-2"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
              <Upload className="w-7 h-7" />
            </div>
            <div className="text-sm font-bold text-slate-800">
              Click to upload or drag & drop Excel / CSV file
            </div>
            <div className="text-xs text-slate-500">
              Supports Microsoft Excel (.xlsx, .xls) and standard CSV
            </div>
            {fileName && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-mono font-bold">
                <FileSpreadsheet className="w-4 h-4" />
                <span>{fileName}</span>
              </div>
            )}
          </label>
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Success Notification */}
      {importResult && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs">
          <div className="flex items-center gap-2 font-bold text-sm">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Successfully imported {importResult.successCount} {importType} records into {selectedBranch?.code || 'FBIS'}!</span>
          </div>
          {importResult.errors.length > 0 && (
            <div className="mt-2 pl-7 text-[11px] text-amber-800 space-y-1">
              <span className="font-bold">Warnings:</span>
              {importResult.errors.map((err, i) => (
                <div key={i}>• {err}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Preview Table of Parsed Data */}
      {parsedRows.length > 0 && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Parsed Data Preview ({parsedRows.length} Rows Ready to Import)
              </h3>
              <p className="text-[11px] text-slate-500">
                Please review columns and sample values before committing into the system database.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="px-3 py-1.5 bg-white border border-slate-300 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>

              <button
                onClick={handleExecuteImport}
                disabled={isProcessing}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{isProcessing ? 'Importing...' : `Confirm & Import ${parsedRows.length} Records`}</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-xs text-left whitespace-nowrap">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 w-10">#</th>
                  {Object.keys(parsedRows[0] || {}).map((colKey) => (
                    <th key={colKey} className="py-2.5 px-3 font-khmer">
                      {colKey}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {parsedRows.slice(0, 20).map((row, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/30">
                    <td className="py-2 px-3 text-slate-400">{idx + 1}</td>
                    {Object.values(row).map((val: any, colIdx) => (
                      <td key={colIdx} className="py-2 px-3 text-slate-800">
                        {String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {parsedRows.length > 20 && (
            <div className="p-2 text-center text-slate-400 text-[11px] bg-slate-50 border-t border-slate-100">
              Showing first 20 rows of {parsedRows.length} total. All {parsedRows.length} rows will be imported.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
