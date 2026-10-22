import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { ProductItem, ServiceItem, FeeCategory, StockMovement } from '../../types';
import { 
  Package, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Image as ImageIcon,
  Check, 
  Search,
  Layers,
  Settings as SettingsIcon,
  Printer,
  FileSpreadsheet,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  TrendingUp,
  Tag,
  Building2,
  Calendar,
  Save,
  GraduationCap,
  Bus,
  Coffee,
  Sparkles,
  FileText,
  BadgeCheck,
  CheckCircle2
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const ProductInventoryView: React.FC = () => {
  const { 
    branchProducts, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    branchServices,
    addService,
    updateService,
    deleteService,
    selectedBranch,
    settings,
    currentUser,
    feeCategories,
    addFeeCategory,
    updateFeeCategory,
    deleteFeeCategory,
    branchStockMovements,
    addStockMovement,
    activeTab: contextTab
  } = useSchool();

  const [activeTab, setActiveTab] = useState<'PRODUCT' | 'SERVICE' | 'STOCK' | 'ACCOUNT SETTING'>(
    contextTab === 'stock-report' ? 'STOCK' : 'PRODUCT'
  );

  useEffect(() => {
    if (contextTab === 'stock-report') {
      setActiveTab('STOCK');
    }
  }, [contextTab]);

  const [stockSubTab, setStockSubTab] = useState<'valuation' | 'movements'>('valuation');
  const [searchFilter, setSearchFilter] = useState('');
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState<string>('All');
  
  // Modals
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  
  // Stock In Modal
  const [isStockInModalOpen, setIsStockInModalOpen] = useState(false);
  const [selectedProductForStockIn, setSelectedProductForStockIn] = useState<ProductItem | null>(null);
  const [stockInQty, setStockInQty] = useState<number>(50);
  const [stockInUnitCost, setStockInUnitCost] = useState<number>(10);
  const [stockInRef, setStockInRef] = useState<string>('');
  const [stockInNotes, setStockInNotes] = useState<string>('Standard supplier shipment');

  // Print Stock Report Modal
  const [isPrintStockReportOpen, setIsPrintStockReportOpen] = useState(false);

  // Fee Category (ប្រភេទចំណូល) Modal
  const [isFeeCategoryModalOpen, setIsFeeCategoryModalOpen] = useState(false);
  const [editingFeeCategory, setEditingFeeCategory] = useState<FeeCategory | null>(null);
  const [catCode, setCatCode] = useState('');
  const [catNameKhmer, setCatNameKhmer] = useState('');
  const [catNameEnglish, setCatNameEnglish] = useState('');
  const [catType, setCatType] = useState<FeeCategory['categoryType']>('tuition');
  const [catDefaultAmount, setCatDefaultAmount] = useState<number>(200);
  const [catGrades, setCatGrades] = useState('All Grades (Pre-K to Grade 12)');
  const [catAllowDiscount, setCatAllowDiscount] = useState(true);
  const [catStatus, setCatStatus] = useState<'active' | 'inactive'>('active');

  // Product Form State (Physical Items)
  const [productCode, setProductCode] = useState('');
  const [productNameKhmer, setProductNameKhmer] = useState('');
  const [productNameEnglish, setProductNameEnglish] = useState('');
  const [productUnitPrice, setProductUnitPrice] = useState<number>(15);
  const [productTotalIn, setProductTotalIn] = useState<number>(100);
  const [productCategory, setProductCategory] = useState<ProductItem['category']>('Uniform');

  // Service Form State (Educational & Campus Fees)
  const [serviceCode, setServiceCode] = useState('');
  const [serviceNameKhmer, setServiceNameKhmer] = useState('');
  const [serviceNameEnglish, setServiceNameEnglish] = useState('');
  const [serviceCategory, setServiceCategory] = useState<ServiceItem['category']>('Tuition');
  const [serviceFeeUSD, setServiceFeeUSD] = useState<number>(150);
  const [serviceBillingCycle, setServiceBillingCycle] = useState<ServiceItem['billingCycle']>('Term');
  const [serviceGrades, setServiceGrades] = useState('All Grades');
  const [serviceDescription, setServiceDescription] = useState('');
  const [serviceStatus, setServiceStatus] = useState<'active' | 'inactive'>('active');

  // Filtered lists
  const filteredProducts = branchProducts.filter(p =>
    p.nameKhmer.toLowerCase().includes(searchFilter.toLowerCase()) ||
    p.nameEnglish.toLowerCase().includes(searchFilter.toLowerCase()) ||
    p.code.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const filteredServices = branchServices.filter(s => {
    const matchSearch = s.nameKhmer.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.nameEnglish.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.code.toLowerCase().includes(searchFilter.toLowerCase());
    const matchCategory = serviceCategoryFilter === 'All' || s.category === serviceCategoryFilter;
    return matchSearch && matchCategory;
  });

  const filteredFeeCategories = feeCategories.filter(c =>
    c.nameKhmer.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.nameEnglish.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.code.toLowerCase().includes(searchFilter.toLowerCase())
  );

  // Stock summary metrics
  const totalStockUnits = branchProducts.reduce((sum, p) => sum + p.balance, 0);
  const totalStockValuationUSD = branchProducts.reduce((sum, p) => sum + (p.balance * p.unitPrice), 0);
  const totalStockValuationKHR = totalStockValuationUSD * (settings.defaultExchangeRate || 4100);
  const lowStockProducts = branchProducts.filter(p => p.balance <= 15);

  // Services summary metrics
  const activeServicesCount = branchServices.filter(s => s.status === 'active').length;
  const monthlyServicesCount = branchServices.filter(s => s.billingCycle === 'Monthly').length;
  const termServicesCount = branchServices.filter(s => s.billingCycle === 'Term' || s.billingCycle === 'Semester').length;
  const avgServiceFee = branchServices.length > 0 
    ? branchServices.reduce((sum, s) => sum + s.feeUSD, 0) / branchServices.length 
    : 0;

  // Product Handlers
  const handleOpenAddProduct = () => {
    const nextCodeNum = branchProducts.length + 1;
    setProductCode(`FBIS ${String(nextCodeNum).padStart(3, '0')}`);
    setProductNameKhmer('');
    setProductNameEnglish('');
    setProductUnitPrice(15);
    setProductTotalIn(100);
    setProductCategory('Uniform');
    setEditingProduct(null);
    setIsAddProductModalOpen(true);
  };

  const handleOpenEditProduct = (p: ProductItem) => {
    setEditingProduct(p);
    setProductCode(p.code);
    setProductNameKhmer(p.nameKhmer);
    setProductNameEnglish(p.nameEnglish);
    setProductUnitPrice(p.unitPrice);
    setProductTotalIn(p.totalIn);
    setProductCategory(p.category);
    setIsAddProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct(editingProduct.id, {
        code: productCode,
        nameKhmer: productNameKhmer,
        nameEnglish: productNameEnglish,
        unitPrice: productUnitPrice,
        totalIn: productTotalIn,
        balance: productTotalIn - editingProduct.totalOut,
        category: productCategory
      });
    } else {
      addProduct({
        code: productCode,
        nameKhmer: productNameKhmer,
        nameEnglish: productNameEnglish || productNameKhmer,
        unitPrice: productUnitPrice,
        totalIn: productTotalIn,
        totalOut: 0,
        balance: productTotalIn,
        status: 'active',
        branchId: selectedBranch.id,
        category: productCategory
      });
    }
    setIsAddProductModalOpen(false);
  };

  // Service Handlers
  const handleOpenAddService = () => {
    const nextNum = branchServices.length + 1;
    setServiceCode(`SRV-${String(nextNum).padStart(3, '0')}`);
    setServiceNameKhmer('');
    setServiceNameEnglish('');
    setServiceCategory('Tuition');
    setServiceFeeUSD(150);
    setServiceBillingCycle('Term');
    setServiceGrades('All Grades (Pre-K to Grade 12)');
    setServiceDescription('');
    setServiceStatus('active');
    setEditingService(null);
    setIsAddServiceModalOpen(true);
  };

  const handleOpenEditService = (s: ServiceItem) => {
    setEditingService(s);
    setServiceCode(s.code);
    setServiceNameKhmer(s.nameKhmer);
    setServiceNameEnglish(s.nameEnglish);
    setServiceCategory(s.category);
    setServiceFeeUSD(s.feeUSD);
    setServiceBillingCycle(s.billingCycle);
    setServiceGrades(s.applicableGrades.join(', '));
    setServiceDescription(s.description || '');
    setServiceStatus(s.status);
    setIsAddServiceModalOpen(true);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    const gradeArr = serviceGrades.split(',').map(g => g.trim()).filter(Boolean);

    if (editingService) {
      updateService(editingService.id, {
        code: serviceCode,
        nameKhmer: serviceNameKhmer,
        nameEnglish: serviceNameEnglish,
        category: serviceCategory,
        feeUSD: serviceFeeUSD,
        billingCycle: serviceBillingCycle,
        applicableGrades: gradeArr.length > 0 ? gradeArr : ['All Grades'],
        description: serviceDescription,
        status: serviceStatus
      });
    } else {
      addService({
        code: serviceCode,
        nameKhmer: serviceNameKhmer,
        nameEnglish: serviceNameEnglish || serviceNameKhmer,
        category: serviceCategory,
        feeUSD: serviceFeeUSD,
        billingCycle: serviceBillingCycle,
        applicableGrades: gradeArr.length > 0 ? gradeArr : ['All Grades'],
        description: serviceDescription,
        status: serviceStatus,
        branchId: selectedBranch.id
      });
    }
    setIsAddServiceModalOpen(false);
  };

  // Stock In Handlers
  const handleOpenStockIn = (p?: ProductItem) => {
    const target = p || branchProducts[0];
    setSelectedProductForStockIn(target || null);
    setStockInQty(50);
    setStockInUnitCost(target ? target.unitPrice : 10);
    setStockInRef(`PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setStockInNotes('Stock replenishment from FBIS central warehouse');
    setIsStockInModalOpen(true);
  };

  const handleSaveStockIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForStockIn) return;

    addStockMovement({
      productId: selectedProductForStockIn.id,
      productCode: selectedProductForStockIn.code,
      productNameKhmer: selectedProductForStockIn.nameKhmer,
      type: 'IN',
      quantity: stockInQty,
      unitPrice: stockInUnitCost,
      date: new Date().toISOString().split('T')[0],
      referenceNumber: stockInRef,
      notes: stockInNotes,
      recordedBy: currentUser.name,
      branchId: selectedBranch.id
    });

    updateProduct(selectedProductForStockIn.id, {
      totalIn: selectedProductForStockIn.totalIn + stockInQty,
      balance: selectedProductForStockIn.balance + stockInQty
    });

    setIsStockInModalOpen(false);
  };

  // Fee Category Handlers
  const handleOpenAddCategory = () => {
    setEditingFeeCategory(null);
    setCatCode(`REV-${String(feeCategories.length + 1).padStart(2, '0')}`);
    setCatNameKhmer('');
    setCatNameEnglish('');
    setCatType('tuition');
    setCatDefaultAmount(200);
    setCatGrades('All Grades (Pre-K to Grade 12)');
    setCatAllowDiscount(true);
    setCatStatus('active');
    setIsFeeCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (fc: FeeCategory) => {
    setEditingFeeCategory(fc);
    setCatCode(fc.code);
    setCatNameKhmer(fc.nameKhmer);
    setCatNameEnglish(fc.nameEnglish);
    setCatType(fc.categoryType);
    setCatDefaultAmount(fc.defaultAmount);
    setCatGrades(fc.applicableGrades.join(', '));
    setCatAllowDiscount(fc.allowDiscount);
    setCatStatus(fc.status);
    setIsFeeCategoryModalOpen(true);
  };

  const handleSaveFeeCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const gradeArr = catGrades.split(',').map(s => s.trim()).filter(Boolean);

    if (editingFeeCategory) {
      updateFeeCategory(editingFeeCategory.id, {
        code: catCode,
        nameKhmer: catNameKhmer,
        nameEnglish: catNameEnglish,
        categoryType: catType,
        defaultAmount: catDefaultAmount,
        applicableGrades: gradeArr.length > 0 ? gradeArr : ['All Grades'],
        allowDiscount: catAllowDiscount,
        status: catStatus
      });
    } else {
      addFeeCategory({
        code: catCode,
        nameKhmer: catNameKhmer,
        nameEnglish: catNameEnglish,
        categoryType: catType,
        defaultAmount: catDefaultAmount,
        termOptions: ['Term 1', 'Term 2', 'Full Year'],
        applicableGrades: gradeArr.length > 0 ? gradeArr : ['All Grades'],
        allowDiscount: catAllowDiscount,
        status: catStatus
      });
    }
    setIsFeeCategoryModalOpen(false);
  };

  // Export Stock to Excel
  const handleExportStockXLS = () => {
    const data = branchProducts.map((p, idx) => ({
      'No': idx + 1,
      'Product Code': p.code,
      'Item Name (Khmer)': p.nameKhmer,
      'Item Name (English)': p.nameEnglish,
      'Category': p.category,
      'Unit Price ($)': p.unitPrice,
      'Total Stock In': p.totalIn,
      'Total Stock Out': p.totalOut,
      'Current Balance': p.balance,
      'Total Valuation ($)': (p.balance * p.unitPrice).toFixed(2),
      'Total Valuation (KHR)': (p.balance * p.unitPrice * (settings.defaultExchangeRate || 4100)).toLocaleString(),
      'Status': p.balance <= 0 ? 'Out of Stock' : p.balance <= 15 ? 'Low Stock' : 'In Stock'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Stock Inventory Report');
    XLSX.writeFile(wb, `FBIS_Stock_Report_${selectedBranch.code.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getServiceCategoryIcon = (category: ServiceItem['category']) => {
    switch (category) {
      case 'Tuition':
        return <GraduationCap className="w-4 h-4 text-blue-600" />;
      case 'Transport':
        return <Bus className="w-4 h-4 text-amber-600" />;
      case 'Cafeteria':
        return <Coffee className="w-4 h-4 text-orange-600" />;
      case 'Activity':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      case 'Exam':
        return <BadgeCheck className="w-4 h-4 text-emerald-600" />;
      default:
        return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Tabs with Clean Separation: PRODUCT | SERVICE | STOCK | ACCOUNT SETTING */}
      <div className="bg-white px-6 pt-3 border-b border-slate-200 rounded-t-xl flex items-center justify-between overflow-x-auto">
        <div className="flex items-center gap-6 min-w-max">
          <button
            onClick={() => setActiveTab('PRODUCT')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors border-b-2 cursor-pointer ${
              activeTab === 'PRODUCT'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>PRODUCTS (ទំនិញ/ឯកសណ្ឋាន - {branchProducts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('SERVICE')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors border-b-2 cursor-pointer ${
              activeTab === 'SERVICE'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <span>SERVICES (សេវាកម្ម/ថ្លៃសិក្សា - {branchServices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('STOCK')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors border-b-2 cursor-pointer ${
              activeTab === 'STOCK'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>STOCK & VALUATION (ស្តុក & របាយការណ៍)</span>
          </button>

          <button
            onClick={() => setActiveTab('ACCOUNT SETTING')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors border-b-2 cursor-pointer ${
              activeTab === 'ACCOUNT SETTING'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>ACCOUNT SETTING (ប្រភេទចំណូល)</span>
          </button>
        </div>

        {/* Dynamic header button based on tab */}
        {activeTab === 'PRODUCT' && (
          <button
            onClick={handleOpenAddProduct}
            className="px-3.5 py-1.5 bg-[#84cc16] hover:bg-[#65a30d] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer mb-2 shrink-0 transition-transform hover:scale-105"
            title="Add New Physical Product"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Product (បន្ថែមទំនិញ)</span>
          </button>
        )}

        {activeTab === 'SERVICE' && (
          <button
            onClick={handleOpenAddService}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer mb-2 shrink-0 transition-transform hover:scale-105"
            title="Add New Educational Service or Fee"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Service (បន្ថែមសេវាកម្ម)</span>
          </button>
        )}

        {activeTab === 'STOCK' && (
          <div className="flex items-center gap-2 mb-2 shrink-0">
            <button
              onClick={() => handleOpenStockIn()}
              className="px-3 py-1.5 bg-[#84cc16] hover:bg-[#65a30d] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Stock In (នាំចូលស្តុក)</span>
            </button>

            <button
              onClick={() => setIsPrintStockReportOpen(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Report</span>
            </button>

            <button
              onClick={handleExportStockXLS}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export XLS</span>
            </button>
          </div>
        )}

        {activeTab === 'ACCOUNT SETTING' && (
          <button
            onClick={handleOpenAddCategory}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer mb-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ បន្ថែមប្រភេទចំណូល (New Revenue Category)</span>
          </button>
        )}
      </div>

      {/* ======================= TAB 1: PRODUCT CATALOG (Physical Tangible Inventory) ======================= */}
      {activeTab === 'PRODUCT' && (
        <div className="bg-white rounded-b-xl shadow-xs border border-slate-200 overflow-hidden p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                <span>Physical Products & Student Inventory (ការគ្រប់គ្រងទំនិញ & សម្ភារៈរូបវន្ត)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Track physical inventory items with stock quantities: uniforms, books, backpacks, and study equipment.
              </p>
            </div>

            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search product code, item name..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full h-8 px-3 pr-8 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-400 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-3 text-center w-14">NO</th>
                  <th className="py-3 px-3 w-28">CODE</th>
                  <th className="py-3 px-4">ITEM NAME</th>
                  <th className="py-3 px-3">CATEGORY</th>
                  <th className="py-3 px-3 text-center w-24">UNIT PRICE</th>
                  <th className="py-3 px-3 text-center w-24">TOTAL IN</th>
                  <th className="py-3 px-3 text-center w-24">TOTAL OUT</th>
                  <th className="py-3 px-3 text-center w-24">BALANCE</th>
                  <th className="py-3 px-3 text-center w-20">STATUS</th>
                  <th className="py-3 px-3 text-center w-24">OPTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Number bubble matching screenshot amber circle */}
                    <td className="py-2.5 px-3 text-center">
                      <span className="w-6 h-6 rounded-full bg-amber-400 text-white font-bold text-xs inline-flex items-center justify-center">
                        {index + 1}
                      </span>
                    </td>

                    {/* Code badge matching screenshot light-blue capsule */}
                    <td className="py-2.5 px-3">
                      <span className="bg-sky-400 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full font-mono">
                        {item.code}
                      </span>
                    </td>

                    {/* Item Name with photo icon matching screenshot */}
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-slate-400 shrink-0" />
                        <div>
                          <span className="font-khmer font-bold text-slate-800 text-xs block">
                            {item.nameKhmer}
                          </span>
                          <span className="text-[11px] text-slate-500 font-sans block">
                            {item.nameEnglish}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-2.5 px-3">
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                    </td>

                    {/* Unit price pill */}
                    <td className="py-2.5 px-3 text-center">
                      <span className="bg-sky-400 text-white text-xs font-bold px-3 py-0.5 rounded-full font-mono">
                        ${item.unitPrice}
                      </span>
                    </td>

                    {/* Total In */}
                    <td className="py-2.5 px-3 text-center">
                      <span className="bg-sky-400 text-white text-xs font-bold px-3 py-0.5 rounded-full font-mono">
                        {item.totalIn}
                      </span>
                    </td>

                    {/* Total Out */}
                    <td className="py-2.5 px-3 text-center">
                      <span className="bg-sky-400 text-white text-xs font-bold px-3 py-0.5 rounded-full font-mono">
                        {item.totalOut}
                      </span>
                    </td>

                    {/* Balance */}
                    <td className="py-2.5 px-3 text-center">
                      <span className={`text-white text-xs font-bold px-3 py-0.5 rounded-full font-mono ${item.balance <= 15 ? 'bg-amber-500' : 'bg-sky-500'}`}>
                        {item.balance}
                      </span>
                    </td>

                    {/* Status green dot */}
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-block w-3 h-3 rounded-full bg-emerald-500 shadow-xs" title="Active" />
                    </td>

                    {/* Options: Edit & Delete */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenStockIn(item)}
                          className="text-slate-400 hover:text-emerald-600 transition-colors p-1 cursor-pointer"
                          title="Restock / Stock In"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditProduct(item)}
                          className="text-slate-400 hover:text-blue-600 transition-colors p-1 cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete product "${item.nameKhmer}"?`)) {
                              deleteProduct(item.id);
                            }
                          }}
                          className="text-slate-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================= TAB 2: SERVICE SETUP (Educational & Campus Fees) ======================= */}
      {activeTab === 'SERVICE' && (
        <div className="space-y-4">
          {/* Services Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Active Services</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {activeServicesCount} <span className="text-xs font-normal text-slate-500">/ {branchServices.length}</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Tuition, transport, meal plans, activities
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-blue-700 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Monthly Recurring</span>
                <Bus className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-blue-900 font-mono">
                {monthlyServicesCount} <span className="text-xs font-normal text-blue-700">Services</span>
              </div>
              <div className="text-xs text-blue-700 mt-1 font-khmer">
                សេវារថយន្តសាលា & អាហារថ្ងៃត្រង់
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-purple-700 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Term / Academic</span>
                <GraduationCap className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-purple-900 font-mono">
                {termServicesCount} <span className="text-xs font-normal text-purple-700">Services</span>
              </div>
              <div className="text-xs text-purple-700 mt-1 font-khmer">
                ថ្លៃសិក្សាប្រចាំឆមាស & ត្រីមាស
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-amber-700 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Avg Base Fee</span>
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-900 font-mono">
                ${avgServiceFee.toFixed(2)}
              </div>
              <div className="text-xs text-amber-700 mt-1">
                ≈ {(avgServiceFee * (settings.defaultExchangeRate || 4100)).toLocaleString()} ៛ (មធ្យម)
              </div>
            </div>
          </div>

          {/* Main Services Container */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-700 mr-1">Filter Category:</span>
                {['All', 'Tuition', 'Transport', 'Cafeteria', 'Registration', 'Activity', 'Exam'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setServiceCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      serviceCategoryFilter === cat
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative w-64">
                <input
                  type="text"
                  placeholder="Search services by code or title..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full h-8 px-3 pr-8 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
              </div>
            </div>

            {/* Services Table (Distinct from products: NO fake stock, only fee & billing cycle) */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 text-center w-14">NO</th>
                    <th className="py-3 px-3 w-28">CODE</th>
                    <th className="py-3 px-4">SERVICE NAME (ឈ្មោះសេវាកម្ម)</th>
                    <th className="py-3 px-3">CATEGORY</th>
                    <th className="py-3 px-3 text-center">BILLING CYCLE</th>
                    <th className="py-3 px-3 text-right">FEE (USD)</th>
                    <th className="py-3 px-3 text-right">FEE (KHR)</th>
                    <th className="py-3 px-3">APPLICABLE GRADES</th>
                    <th className="py-3 px-3 text-center">STATUS</th>
                    <th className="py-3 px-3 text-center w-24">OPTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredServices.map((svc, index) => (
                    <tr key={svc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 text-center">
                        <span className="w-6 h-6 rounded-full bg-blue-500 text-white font-bold text-xs inline-flex items-center justify-center">
                          {index + 1}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-blue-700">
                        {svc.code}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-start gap-2.5">
                          <div className="p-1.5 bg-slate-100 rounded-lg shrink-0 mt-0.5">
                            {getServiceCategoryIcon(svc.category)}
                          </div>
                          <div>
                            <div className="font-khmer font-bold text-slate-900 text-sm">
                              {svc.nameKhmer}
                            </div>
                            <div className="text-[11px] text-slate-500 font-sans">
                              {svc.nameEnglish}
                            </div>
                            {svc.description && (
                              <div className="text-[10px] text-slate-400 font-khmer mt-0.5 max-w-md truncate" title={svc.description}>
                                {svc.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                          {svc.category}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[10px] font-bold">
                          {svc.billingCycle}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-black text-slate-900 text-sm">
                        ${svc.feeUSD.toFixed(2)}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-medium text-slate-600">
                        {(svc.feeUSD * (settings.defaultExchangeRate || 4100)).toLocaleString()} ៛
                      </td>

                      <td className="py-3 px-3 font-khmer text-slate-600">
                        {svc.applicableGrades.join(', ')}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          svc.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {svc.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditService(svc)}
                            className="text-slate-400 hover:text-blue-600 transition-colors p-1 cursor-pointer"
                            title="Edit Service"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete service "${svc.nameKhmer}"?`)) {
                                deleteService(svc.id);
                              }
                            }}
                            className="text-slate-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                            title="Delete Service"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================= TAB 3: STOCK REPORT & MOVEMENTS ======================= */}
      {activeTab === 'STOCK' && (
        <div className="space-y-4">
          {/* Stock Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Stock Balance</span>
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {totalStockUnits.toLocaleString()} <span className="text-xs font-normal text-slate-500">Units</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Physical products catalog ({branchProducts.length} items)
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-emerald-700 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Stock Valuation (USD)</span>
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-900 font-mono">
                ${totalStockValuationUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-emerald-700 font-mono mt-1">
                ≈ {totalStockValuationKHR.toLocaleString()} ៛ (សរុបតម្លៃស្តុក)
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-amber-700 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Low Stock Warnings</span>
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-900 font-mono">
                {lowStockProducts.length} <span className="text-xs font-normal text-slate-600">Items (≤ 15)</span>
              </div>
              <div className="text-xs text-amber-700 mt-1 font-khmer">
                ត្រូវការបញ្ជាទិញបន្ថែមក្នុងសប្តាហ៍នេះ
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-purple-700 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Current Campus</span>
                <Building2 className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-base font-bold text-purple-950 font-khmer truncate">
                {selectedBranch.nameKhmer}
              </div>
              <div className="text-xs text-purple-700 font-mono mt-1">
                {selectedBranch.code} · {selectedBranch.city}
              </div>
            </div>
          </div>

          {/* Sub Navigation: Valuation Table vs Movement History */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStockSubTab('valuation')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    stockSubTab === 'valuation'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Current Inventory Valuation (តម្លៃស្តុកបច្ចុប្បន្ន)
                </button>
                <button
                  onClick={() => setStockSubTab('movements')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    stockSubTab === 'movements'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Stock Inflow / In-Out Log ({branchStockMovements.length})
                </button>
              </div>

              <div className="relative w-64">
                <input
                  type="text"
                  placeholder="Filter stock records..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full h-8 px-3 pr-8 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
              </div>
            </div>

            {stockSubTab === 'valuation' ? (
              <div className="overflow-x-auto p-4">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 text-center">No</th>
                      <th className="py-2.5 px-3">Item Code</th>
                      <th className="py-2.5 px-4">Item Name (Khmer & English)</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-center">In</th>
                      <th className="py-2.5 px-3 text-center">Out</th>
                      <th className="py-2.5 px-3 text-center">Balance</th>
                      <th className="py-2.5 px-3 text-right">Total Valuation</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((p, idx) => {
                      const itemValuation = p.balance * p.unitPrice;
                      const isLow = p.balance <= 15 && p.balance > 0;
                      const isOut = p.balance <= 0;

                      return (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{p.code}</td>
                          <td className="py-2.5 px-4">
                            <div className="font-khmer font-bold text-slate-800">{p.nameKhmer}</div>
                            <div className="text-[11px] text-slate-500">{p.nameEnglish}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded">
                              {p.category}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-medium">${p.unitPrice.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-center font-mono text-emerald-700 font-semibold">{p.totalIn}</td>
                          <td className="py-2.5 px-3 text-center font-mono text-slate-500">{p.totalOut}</td>
                          <td className="py-2.5 px-3 text-center font-mono font-black text-sm text-slate-900">
                            {p.balance}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                            ${itemValuation.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {isOut ? (
                              <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                Out of Stock
                              </span>
                            ) : isLow ? (
                              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center justify-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Low Stock
                              </span>
                            ) : (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                In Stock
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => handleOpenStockIn(p)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[11px] transition-colors cursor-pointer"
                            >
                              + Restock
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto p-4">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Ref / Invoice #</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Item Code</th>
                      <th className="py-2.5 px-4">Item Name (Khmer)</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Cost / Unit</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                      <th className="py-2.5 px-3">Handled By</th>
                      <th className="py-2.5 px-4">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {branchStockMovements.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-slate-600">{m.date}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{m.referenceNumber}</td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            m.type === 'IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {m.type === 'IN' ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                            {m.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{m.productCode}</td>
                        <td className="py-2.5 px-4 font-khmer font-medium text-slate-800">{m.productNameKhmer}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">{m.quantity}</td>
                        <td className="py-2.5 px-3 text-right font-mono">${m.unitPrice.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                          ${(m.quantity * m.unitPrice).toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{m.recordedBy}</td>
                        <td className="py-2.5 px-4 text-slate-500 font-khmer max-w-[200px] truncate" title={m.notes}>
                          {m.notes}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================= TAB 4: ACCOUNT SETTING (ប្រភេទចំណូល) ======================= */}
      {activeTab === 'ACCOUNT SETTING' && (
        <div className="space-y-5">
          {/* Header Card */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-blue-600" />
                  <span>ការកំណត់ប្រភេទចំណូលសាលារៀន (Revenue & Fee Categories Setup)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure official revenue accounts, default rates, and tuition structures across school branches.
                </p>
              </div>

              <button
                onClick={handleOpenAddCategory}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>+ បង្កើតប្រភេទចំណូលថ្មី</span>
              </button>
            </div>

            {/* Fee Categories Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">Code</th>
                    <th className="py-3 px-4">ឈ្មោះប្រភេទចំណូល (Khmer & English)</th>
                    <th className="py-3 px-3">Category Type</th>
                    <th className="py-3 px-3 text-right">Default Amount</th>
                    <th className="py-3 px-3">Applicable Grades</th>
                    <th className="py-3 px-3 text-center">Discount Allowed</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFeeCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-blue-700">{cat.code}</td>
                      <td className="py-3 px-4">
                        <div className="font-khmer font-bold text-slate-900 text-sm">{cat.nameKhmer}</div>
                        <div className="text-[11px] text-slate-500">{cat.nameEnglish}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="bg-blue-50 text-blue-700 uppercase tracking-wide text-[10px] font-bold px-2 py-0.5 rounded">
                          {cat.categoryType}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 text-sm">
                        ${cat.defaultAmount.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-khmer">
                        {cat.applicableGrades.join(', ')}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {cat.allowDiscount ? (
                          <span className="text-emerald-700 font-bold font-khmer">អនុញ្ញាត (Yes)</span>
                        ) : (
                          <span className="text-slate-400 font-khmer">អត់ (No)</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          cat.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {cat.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditCategory(cat)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100 cursor-pointer"
                            title="Edit Category"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete fee category "${cat.nameKhmer}"?`)) {
                                deleteFeeCategory(cat.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* School Fee Matrix Overview by Grade & Term */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              តារាងកំណត់តម្លៃសិក្សាទូទៅតាមកម្រិតថ្នាក់ (Standard Tuition Schedule Matrix)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Approved standard fee matrix for Future Bright International School (FBIS). Rates apply across terms.
            </p>

            <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-blue-900 text-white font-bold">
                  <tr>
                    <th className="py-2.5 px-4 font-khmer">កម្រិតសិក្សា (Level)</th>
                    <th className="py-2.5 px-3">Grade Range</th>
                    <th className="py-2.5 px-3 text-right">Term 1 (ឆមាសទី១)</th>
                    <th className="py-2.5 px-3 text-right">Term 2 (ឆមាសទី២)</th>
                    <th className="py-2.5 px-3 text-right">Full Year (១ឆ្នាំពេញ)</th>
                    <th className="py-2.5 px-3 text-right">Books & Uniform</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-khmer font-bold text-slate-800">មត្តេយ្យសិក្សា (Kindergarten / Pre-K)</td>
                    <td className="py-2.5 px-3 text-slate-600 font-sans">Pre-K, KG 1-3</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">$180.00</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">$180.00</td>
                    <td className="py-2.5 px-3 text-right font-bold text-blue-700">$340.00</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">$45.00</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-khmer font-bold text-slate-800">បឋមសិក្សា (Primary School)</td>
                    <td className="py-2.5 px-3 text-slate-600 font-sans">Grades 1 – 6</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">$230.00</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">$230.00</td>
                    <td className="py-2.5 px-3 text-right font-bold text-blue-700">$440.00</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">$55.00</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-khmer font-bold text-slate-800">អនុវិទ្យាល័យ (Lower Secondary)</td>
                    <td className="py-2.5 px-3 text-slate-600 font-sans">Grades 7 – 9</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">$280.00</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">$280.00</td>
                    <td className="py-2.5 px-3 text-right font-bold text-blue-700">$530.00</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">$60.00</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-khmer font-bold text-slate-800">វិទ្យាល័យ (High School)</td>
                    <td className="py-2.5 px-3 text-slate-600 font-sans">Grades 10 – 12</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">$320.00</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">$320.00</td>
                    <td className="py-2.5 px-3 text-right font-bold text-blue-700">$600.00</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">$65.00</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-khmer font-bold text-slate-800">ភាសាអង់គ្លេសទូទៅ (General English ESL)</td>
                    <td className="py-2.5 px-3 text-slate-600 font-sans">Part-Time / Full-Time</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">$130.00</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">$130.00</td>
                    <td className="py-2.5 px-3 text-right font-bold text-blue-700">$250.00</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">$30.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL 1: ADD / EDIT PRODUCT (Physical Items Only) ======================= */}
      {isAddProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-blue-800 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-200" />
                <span>{editingProduct ? 'Edit Product Item' : 'Add Physical Product (ទំនិញ/សម្ភារៈ)'}</span>
              </h3>
              <button
                onClick={() => setIsAddProductModalOpen(false)}
                className="text-blue-200 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Item Code</label>
                <input
                  type="text"
                  required
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value)}
                  className="w-full h-9 px-3 border border-slate-300 rounded-md font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ឈ្មោះទំនិញជាភាសាខ្មែរ (Name in Khmer)</label>
                <input
                  type="text"
                  required
                  value={productNameKhmer}
                  onChange={(e) => setProductNameKhmer(e.target.value)}
                  placeholder="ឧ. ឯកសណ្ឋានសិស្ស, សៀវភៅពុម្ព..."
                  className="w-full h-9 px-3 border border-slate-300 rounded-md font-khmer font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">English Name</label>
                <input
                  type="text"
                  value={productNameEnglish}
                  onChange={(e) => setProductNameEnglish(e.target.value)}
                  placeholder="e.g. Student Uniform Set"
                  className="w-full h-9 px-3 border border-slate-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productUnitPrice}
                    onChange={(e) => setProductUnitPrice(parseFloat(e.target.value) || 0)}
                    className="w-full h-9 px-3 border border-slate-300 rounded-md font-mono font-bold text-sm text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Stock In</label>
                  <input
                    type="number"
                    required
                    value={productTotalIn}
                    onChange={(e) => setProductTotalIn(parseInt(e.target.value, 10) || 0)}
                    className="w-full h-9 px-3 border border-slate-300 rounded-md font-mono font-bold text-sm text-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Physical Product Category</label>
                <select
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value as any)}
                  className="w-full h-9 px-2.5 border border-slate-300 rounded-md bg-white font-semibold"
                >
                  <option value="Uniform">Uniform (ឯកសណ្ឋាន)</option>
                  <option value="Book">Book (សៀវភៅពុម្ព/សៀវភៅសរសេរ)</option>
                  <option value="Material">Material (សម្ភារៈសិក្សា/កាតាប/កាត)</option>
                  <option value="Equipment">Equipment (ឧបករណ៍/បរិក្ខារ)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddProductModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  Save Product Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL 2: ADD / EDIT SERVICE (Educational & Campus Fees) ======================= */}
      {isAddServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-emerald-800 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-200" />
                <span>{editingService ? 'Edit School Service' : 'Add School Service / Fee (បន្ថែមសេវាកម្ម)'}</span>
              </h3>
              <button
                onClick={() => setIsAddServiceModalOpen(false)}
                className="text-emerald-200 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Service Code</label>
                  <input
                    type="text"
                    required
                    value={serviceCode}
                    onChange={(e) => setServiceCode(e.target.value)}
                    className="w-full h-9 px-3 border border-slate-300 rounded-md font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={serviceCategory}
                    onChange={(e) => setServiceCategory(e.target.value as any)}
                    className="w-full h-9 px-2.5 border border-slate-300 rounded-md bg-white font-semibold"
                  >
                    <option value="Tuition">Tuition (ថ្លៃសិក្សា)</option>
                    <option value="Transport">Transport (រថយន្តសាលា)</option>
                    <option value="Cafeteria">Cafeteria (អាហារដ្ឋាន)</option>
                    <option value="Registration">Registration (ចុះឈ្មោះ)</option>
                    <option value="Activity">Activity (សកម្មភាព/STEM)</option>
                    <option value="Exam">Exam & Certificate (ប្រឡង/សញ្ញាបត្រ)</option>
                    <option value="Other">Other Service (សេវាផ្សេងៗ)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ឈ្មោះសេវាកម្មជាភាសាខ្មែរ (Name in Khmer)</label>
                <input
                  type="text"
                  required
                  value={serviceNameKhmer}
                  onChange={(e) => setServiceNameKhmer(e.target.value)}
                  placeholder="ឧ. ថ្លៃសិក្សាចំណេះទូទៅពេញម៉ោង"
                  className="w-full h-9 px-3 border border-slate-300 rounded-md font-khmer font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">English Service Name</label>
                <input
                  type="text"
                  value={serviceNameEnglish}
                  onChange={(e) => setServiceNameEnglish(e.target.value)}
                  placeholder="e.g. Full-Time General Education Tuition"
                  className="w-full h-9 px-3 border border-slate-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Service Fee ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={serviceFeeUSD}
                    onChange={(e) => setServiceFeeUSD(parseFloat(e.target.value) || 0)}
                    className="w-full h-9 px-3 border border-slate-300 rounded-md font-mono font-bold text-sm text-emerald-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Billing Cycle</label>
                  <select
                    value={serviceBillingCycle}
                    onChange={(e) => setServiceBillingCycle(e.target.value as any)}
                    className="w-full h-9 px-2.5 border border-slate-300 rounded-md bg-white font-semibold"
                  >
                    <option value="Monthly">Monthly (ប្រចាំខែ)</option>
                    <option value="Term">Term (ប្រចាំត្រីមាស)</option>
                    <option value="Semester">Semester (ប្រចាំឆមាស)</option>
                    <option value="Annual">Annual (ប្រចាំឆ្នាំ)</option>
                    <option value="One-Time">One-Time (ម្តងគត់)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Applicable Grades (កម្រិតថ្នាក់អនុវត្ត)</label>
                <input
                  type="text"
                  value={serviceGrades}
                  onChange={(e) => setServiceGrades(e.target.value)}
                  placeholder="e.g. Grades 7-12, All Grades"
                  className="w-full h-9 px-3 border border-slate-300 rounded-md font-khmer"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Notes</label>
                <textarea
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  rows={2}
                  placeholder="Optional service policy notes..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md font-khmer"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddServiceModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL 3: STOCK IN / RESTOCK ======================= */}
      {isStockInModalOpen && selectedProductForStockIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-emerald-700 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-200" />
                <span>Record Stock In / Restock (នាំចូលស្តុក)</span>
              </h3>
              <button
                onClick={() => setIsStockInModalOpen(false)}
                className="text-emerald-200 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStockIn} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Product</label>
                <select
                  value={selectedProductForStockIn.id}
                  onChange={(e) => {
                    const found = branchProducts.find(p => p.id === e.target.value);
                    if (found) setSelectedProductForStockIn(found);
                  }}
                  className="w-full h-9 px-3 border border-slate-300 rounded-md bg-white font-khmer font-bold"
                >
                  {branchProducts.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.code} - {p.nameKhmer} (Balance: {p.balance})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quantity In (ចំនួននាំចូល)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={stockInQty}
                    onChange={(e) => setStockInQty(parseInt(e.target.value, 10) || 0)}
                    className="w-full h-9 px-3 border border-slate-300 rounded-md font-mono font-bold text-sm text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={stockInUnitCost}
                    onChange={(e) => setStockInUnitCost(parseFloat(e.target.value) || 0)}
                    className="w-full h-9 px-3 border border-slate-300 rounded-md font-mono font-bold text-sm text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">PO / Delivery Ref #</label>
                <input
                  type="text"
                  required
                  value={stockInRef}
                  onChange={(e) => setStockInRef(e.target.value)}
                  className="w-full h-9 px-3 border border-slate-300 rounded-md font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Supplier / Batch Notes</label>
                <input
                  type="text"
                  value={stockInNotes}
                  onChange={(e) => setStockInNotes(e.target.value)}
                  className="w-full h-9 px-3 border border-slate-300 rounded-md font-khmer"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>New Balance After Stock-In:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {selectedProductForStockIn.balance + stockInQty} Units
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Batch Inflow Value:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    ${(stockInQty * stockInUnitCost).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStockInModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Confirm Stock In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL 4: ADD / EDIT REVENUE CATEGORY ======================= */}
      {isFeeCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-blue-800 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-200" />
                <span>{editingFeeCategory ? 'Edit Revenue Category' : 'បង្កើតប្រភេទចំណូលថ្មី (New Fee Category)'}</span>
              </h3>
              <button
                onClick={() => setIsFeeCategoryModalOpen(false)}
                className="text-blue-200 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFeeCategory} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category Code</label>
                  <input
                    type="text"
                    required
                    value={catCode}
                    onChange={(e) => setCatCode(e.target.value)}
                    className="w-full h-9 px-3 border border-slate-300 rounded-md font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category Type</label>
                  <select
                    value={catType}
                    onChange={(e) => setCatType(e.target.value as any)}
                    className="w-full h-9 px-2.5 border border-slate-300 rounded-md bg-white font-semibold"
                  >
                    <option value="tuition">Tuition Fee (ថ្លៃសិក្សា)</option>
                    <option value="administration">Registration (ចុះឈ្មោះ)</option>
                    <option value="uniform">Uniform (ឯកសណ្ឋាន)</option>
                    <option value="book">Textbook (សៀវភៅ)</option>
                    <option value="transport">Transportation (រថយន្តសាលា)</option>
                    <option value="service">Service (សេវាកម្ម)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ឈ្មោះប្រភេទចំណូលជាភាសាខ្មែរ (Khmer Name)</label>
                <input
                  type="text"
                  required
                  value={catNameKhmer}
                  onChange={(e) => setCatNameKhmer(e.target.value)}
                  placeholder="ឧ. ថ្លៃសិក្សាថ្នាក់វិទ្យាល័យ"
                  className="w-full h-9 px-3 border border-slate-300 rounded-md font-khmer font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">English Name</label>
                <input
                  type="text"
                  value={catNameEnglish}
                  onChange={(e) => setCatNameEnglish(e.target.value)}
                  placeholder="e.g. High School Tuition Fee"
                  className="w-full h-9 px-3 border border-slate-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Default Base Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={catDefaultAmount}
                    onChange={(e) => setCatDefaultAmount(parseFloat(e.target.value) || 0)}
                    className="w-full h-9 px-3 border border-slate-300 rounded-md font-mono font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={catStatus}
                    onChange={(e) => setCatStatus(e.target.value as 'active' | 'inactive')}
                    className="w-full h-9 px-2.5 border border-slate-300 rounded-md bg-white font-semibold"
                  >
                    <option value="active">Active (សកម្ម)</option>
                    <option value="inactive">Inactive (អសកម្ម)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Applicable Grades (កម្រិតថ្នាក់)</label>
                <input
                  type="text"
                  value={catGrades}
                  onChange={(e) => setCatGrades(e.target.value)}
                  placeholder="e.g. Grades 7-12, All Grades"
                  className="w-full h-9 px-3 border border-slate-300 rounded-md font-khmer"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={catAllowDiscount}
                  onChange={(e) => setCatAllowDiscount(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span className="font-semibold text-slate-700">
                  Allow Discount & Promotion on this category (អនុញ្ញាតបញ្ចុះតម្លៃ)
                </span>
              </label>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFeeCategoryModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL 5: PRINT STOCK VALUATION REPORT ======================= */}
      {isPrintStockReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden border border-slate-200 my-8">
            <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between no-print">
              <span className="text-xs font-bold font-mono">Stock Valuation Report Preview</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => setIsPrintStockReportOpen(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Report Document */}
            <div className="p-8 space-y-5 bg-white text-slate-900 font-sans print:p-0">
              {/* Header */}
              <div className="text-center space-y-1 border-b pb-4">
                <h1 className="text-base font-bold font-khmer text-blue-900">{settings.schoolNameKhmer}</h1>
                <h2 className="text-xs font-bold uppercase tracking-wider text-red-600">{settings.schoolNameEnglish}</h2>
                <div className="text-sm font-bold font-khmer mt-2">របាយការណ៍ស្តុក និងតម្លៃសារពើភ័ណ្ឌ / STOCK VALUATION REPORT</div>
                <div className="text-xs text-slate-500 font-mono">
                  Campus: {selectedBranch.code} ({selectedBranch.city}) · Date: {new Date().toLocaleDateString('km-KH')}
                </div>
              </div>

              {/* Table */}
              <table className="w-full text-xs text-left border-collapse border border-slate-300">
                <thead className="bg-slate-100 font-bold border-b border-slate-300">
                  <tr>
                    <th className="border border-slate-300 p-2 text-center">No</th>
                    <th className="border border-slate-300 p-2">Code</th>
                    <th className="border border-slate-300 p-2">Item Name (ឈ្មោះទំនិញ)</th>
                    <th className="border border-slate-300 p-2 text-right">Unit Price</th>
                    <th className="border border-slate-300 p-2 text-center">Stock In</th>
                    <th className="border border-slate-300 p-2 text-center">Stock Out</th>
                    <th className="border border-slate-300 p-2 text-center">Balance</th>
                    <th className="border border-slate-300 p-2 text-right">Valuation ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {branchProducts.map((p, i) => (
                    <tr key={p.id}>
                      <td className="border border-slate-300 p-2 text-center font-mono">{i + 1}</td>
                      <td className="border border-slate-300 p-2 font-mono font-bold">{p.code}</td>
                      <td className="border border-slate-300 p-2 font-khmer">{p.nameKhmer} ({p.nameEnglish})</td>
                      <td className="border border-slate-300 p-2 text-right font-mono">${p.unitPrice.toFixed(2)}</td>
                      <td className="border border-slate-300 p-2 text-center font-mono">{p.totalIn}</td>
                      <td className="border border-slate-300 p-2 text-center font-mono">{p.totalOut}</td>
                      <td className="border border-slate-300 p-2 text-center font-mono font-bold">{p.balance}</td>
                      <td className="border border-slate-300 p-2 text-right font-mono font-bold">
                        ${(p.balance * p.unitPrice).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 font-bold">
                    <td colSpan={6} className="border border-slate-300 p-2 text-right font-khmer">សរុបតម្លៃស្តុកទូទៅ (TOTAL):</td>
                    <td className="border border-slate-300 p-2 text-center font-mono">{totalStockUnits}</td>
                    <td className="border border-slate-300 p-2 text-right font-mono text-emerald-800">
                      ${totalStockValuationUSD.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Signature Blocks */}
              <div className="grid grid-cols-3 text-center text-xs pt-8">
                <div>
                  <div className="font-khmer font-bold mb-14">បេឡាករ / អ្នកគ្រប់គ្រងស្តុក</div>
                  <div className="font-khmer text-slate-500">Storekeeper Signature</div>
                </div>
                <div>
                  <div className="font-khmer font-bold mb-14">ប្រធានគណនេយ្យ</div>
                  <div className="font-khmer text-slate-500">Chief Accountant</div>
                </div>
                <div>
                  <div className="font-khmer font-bold mb-14">នាយកសាខាសាលា</div>
                  <div className="font-khmer text-slate-500">Campus Director</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
