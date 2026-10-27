import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { NavigationTab } from '../../types';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  CreditCard, 
  Clock, 
  Box, 
  Award, 
  FileText, 
  FileSpreadsheet, 
  Database, 
  Settings, 
  DollarSign,
  Layers,
  TrendingUp
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, branchPayments, branchStudents, language } = useSchool();

  const duePaymentsCount = branchPayments.filter(p => p.status === 'Due' || p.status === 'Partial').length;

  const navItems: Array<{
    id: NavigationTab;
    labelEn: string;
    labelKm: string;
    icon: React.ReactNode;
    badge?: number;
  }> = [
    {
      id: 'dashboard',
      labelEn: 'Dashboard',
      labelKm: 'ផ្ទាំងគ្រប់គ្រង',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      id: 'payments',
      labelEn: 'Payments & Fees',
      labelKm: 'ការបង់ប្រាក់ & ថ្លៃសិក្សា',
      icon: <CreditCard className="w-5 h-5" />
    },
    {
      id: 'due-payments',
      labelEn: 'Due Payments (Arrears)',
      labelKm: 'ជំពាក់ថ្លៃសិក្សា',
      icon: <Clock className="w-5 h-5" />,
      badge: duePaymentsCount
    },
    {
      id: 'expenses',
      labelEn: 'School Expenses',
      labelKm: 'ចំណាយសាលា',
      icon: <DollarSign className="w-5 h-5" />
    },
    {
      id: 'students',
      labelEn: 'Admissions & Students',
      labelKm: 'សិស្ស & ចុះឈ្មោះ',
      icon: <GraduationCap className="w-5 h-5" />,
      badge: branchStudents.length
    },
    {
      id: 'student-promote',
      labelEn: 'Student Promotion',
      labelKm: 'ឡើងថ្នាក់សិស្ស',
      icon: <TrendingUp className="w-5 h-5" />
    },
    {
      id: 'academic-performance',
      labelEn: 'Academic Performance',
      labelKm: 'លទ្ធផលសិក្សា & ចំណាត់ថ្នាក់',
      icon: <Award className="w-5 h-5" />
    },
    {
      id: 'inventory',
      labelEn: 'Stock & Products',
      labelKm: 'ស្តុក & ផលិតផល',
      icon: <Box className="w-5 h-5" />
    },
    {
      id: 'stock-report',
      labelEn: 'Stock Valuation Report',
      labelKm: 'របាយការណ៍តម្លៃស្តុក',
      icon: <Layers className="w-5 h-5" />
    },
    {
      id: 'reports',
      labelEn: 'Official Reports',
      labelKm: 'របាយការណ៍ផ្លូវការ',
      icon: <FileText className="w-5 h-5" />
    },
    {
      id: 'excel-import',
      labelEn: 'Import Excel / CSV',
      labelKm: 'នាំចូលទិន្នន័យពី Excel',
      icon: <FileSpreadsheet className="w-5 h-5" />
    },
    {
      id: 'sql-import',
      labelEn: 'SQL Import & Analytics',
      labelKm: 'នាំចូល & វិភាគ SQL តាមសាខា',
      icon: <Database className="w-5 h-5 text-indigo-500" />
    },
    {
      id: 'backup-restore',
      labelEn: 'Backup & Restore',
      labelKm: 'បម្រុងទុក & ស្តារទិន្នន័យ',
      icon: <Database className="w-5 h-5" />
    },
    {
      id: 'settings',
      labelEn: 'System Settings',
      labelKm: 'ការកំណត់ប្រព័ន្ធ',
      icon: <Settings className="w-5 h-5" />
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          onClick={onCloseMobile} 
          className="fixed inset-0 bg-slate-900/40 z-30 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      <aside
        className={`fixed md:sticky top-14 left-0 h-[calc(100vh-3.5rem)] bg-white border-r border-slate-200 z-30 transition-all duration-200 overflow-y-auto flex flex-col justify-between select-none ${
          isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:w-16 md:translate-x-0'
        }`}
      >
        <div className="py-3 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group cursor-pointer relative ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title={language === 'km' ? item.labelKm : item.labelEn}
              >
                <div className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-600'}`}>
                  {item.icon}
                </div>

                {isOpen && (
                  <span className={`truncate text-left flex-1 ${language === 'km' ? 'font-khmer' : ''}`}>
                    {language === 'km' ? item.labelKm : item.labelEn}
                  </span>
                )}

                {isOpen && item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Tooltip on collapsed state */}
                {!isOpen && (
                  <div className="hidden md:group-hover:block absolute left-16 ml-2 px-2.5 py-1.5 bg-slate-900 text-white text-xs rounded-md shadow-lg whitespace-nowrap z-50 pointer-events-none">
                    {language === 'km' ? item.labelKm : item.labelEn}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom subtle system info */}
        {isOpen && (
          <div className="p-3 border-t border-slate-100 bg-slate-50/60 text-slate-400 text-[11px]">
            <div className="font-semibold text-slate-600 font-khmer">FBIS Enterprise v2.6</div>
            <div>Multi-Campus Core Edition</div>
          </div>
        )}
      </aside>
    </>
  );
};
