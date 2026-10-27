import React, { useState } from 'react';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { LoginModal } from './components/auth/LoginModal';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { PaymentsView } from './components/finance/PaymentsView';
import { DuePaymentsView } from './components/finance/DuePaymentsView';
import { ExpenseView } from './components/finance/ExpenseView';
import { StudentsList } from './components/students/StudentsList';
import { StudentProfile } from './components/students/StudentProfile';
import { ProductInventoryView } from './components/inventory/ProductInventoryView';
import { AcademicPerformanceView } from './components/academic/AcademicPerformanceView';
import { OfficialReportsView } from './components/reports/OfficialReportsView';
import { ExcelImportView } from './components/excel/ExcelImportView';
import { SqlImportAndAnalyticsView } from './components/sql/SqlImportAndAnalyticsView';
import { SystemSettingsView } from './components/settings/SystemSettingsView';
import { BackupRestoreView } from './components/settings/BackupRestoreView';
import { StudentPromoteView } from './components/students/StudentPromoteView';

const MainLayout: React.FC = () => {
  const { activeTab, selectedBranch } = useSchool();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'payments':
        return <PaymentsView />;
      case 'due-payments':
        return <DuePaymentsView />;
      case 'expenses':
        return <ExpenseView />;
      case 'students':
        return <StudentsList />;
      case 'student-profile':
        return <StudentProfile />;
      case 'student-promote':
        return <StudentPromoteView />;
      case 'inventory':
      case 'stock-report':
        return <ProductInventoryView />;
      case 'academic-performance':
        return <AcademicPerformanceView />;
      case 'reports':
        return <OfficialReportsView />;
      case 'excel-import':
        return <ExcelImportView />;
      case 'sql-import':
        return <SqlImportAndAnalyticsView />;
      case 'settings':
        return <SystemSettingsView />;
      case 'backup-restore':
        return <BackupRestoreView />;
      default:
        return <PaymentsView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans">
      {/* Top Header matching screenshots */}
      <Header onToggleSidebar={toggleSidebar} />

      {/* Workspace with Collapsible Sidebar and Main Content */}
      <div className="flex-1 flex">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onCloseMobile={() => setIsSidebarOpen(false)} 
        />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-[1600px] mx-auto w-full">
          {renderActiveView()}
        </main>
      </div>

      {/* Auth Login Modal when logged out */}
      <LoginModal />
    </div>
  );
};

export default function App() {
  return (
    <SchoolProvider>
      <MainLayout />
    </SchoolProvider>
  );
}
