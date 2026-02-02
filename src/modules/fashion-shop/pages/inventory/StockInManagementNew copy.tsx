import { useState, useMemo, useRef, useEffect } from 'react';
import { Package, Plus, Search, Trash2, X, Printer, ChevronLeft, ChevronRight, ShoppingCart, Receipt, Eye, Edit, Calendar, ChevronDown, Barcode } from 'lucide-react';
import { useStore } from '../../../../lib/fashion-shop-lib/store';
import type { StockInItem, StockInReceipt } from '../../../../lib/fashion-shop-lib/store';
import { useTranslation } from '../../../../lib/fashion-shop-lib/useTranslation';
import { Pagination } from '../../components/common/Pagination';
import { api } from '../../../../lib/fashion-shop-lib/api';
import { toast } from 'sonner';
import type { Product, ProductVariant } from '../../../../lib/fashion-shop-lib/mockProductData_fashion_only';
import type { Inventory } from '../../../../lib/fashion-shop-lib/inventoryTypes';

export function StockInManagement() {
  const { t } = useTranslation();
  const { stockInReceipts, createStockInReceipt, updateStockInReceipt, deleteStockInReceipt, currentUser } = useStore();
  
  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI states
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<StockInReceipt | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<StockInReceipt | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingReceipt, setDeletingReceipt] = useState<StockInReceipt | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');
  const [filterDate, setFilterDate] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingStartDate, setSelectingStartDate] = useState(true);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Form states
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formSupplier, setFormSupplier] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formItems, setFormItems] = useState<StockInItem[]>([]);
  const [supplierDiscount, setSupplierDiscount] = useState(0);
  
  // Product search dropdown
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [prodRes, varRes, invRes] = await Promise.all([
        api.getProducts(),
        api.getProductVariants(),
        api.getInventories(),
      ]);

      if (prodRes.success && prodRes.data) setProducts(prodRes.data);
      if (varRes.success && varRes.data) setVariants(varRes.data);
      if (invRes.success && invRes.data) setInventories(invRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };
  
  // Filtered variants for search dropdown
  const filteredVariants = useMemo(() => {
    if (!productSearchQuery) return variants;
    const query = productSearchQuery.toLowerCase();
    return variants.filter(v => 
      v.sku?.toLowerCase().includes(query) ||
      v.barcode?.toLowerCase().includes(query) ||
      v.title?.toLowerCase().includes(query) ||
      products.find(p => p._id === v.product_id)?.title?.toLowerCase().includes(query)
    );
  }, [variants, productSearchQuery, products]);
  
  // Get unique suppliers for filter
  const suppliers = useMemo(() => {
    return Array.from(new Set((stockInReceipts || []).map(r => r.supplier))).filter(Boolean);
  }, [stockInReceipts]);
  
  // Get date range for filtering
  const getDateRange = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (filterDate === 'custom' && customStartDate && customEndDate) {
      return {
        start: new Date(customStartDate),
        end: new Date(customEndDate + ' 23:59:59')
      };
    }
    
    switch (filterDate) {
      case 'today':
        return { start: today, end: new Date() };
      case 'yesterday': {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return { start: yesterday, end: today };
      }
      case 'week': {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return { start: weekAgo, end: new Date() };
      }
      case 'month': {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return { start: monthAgo, end: new Date() };
      }
      default:
        return null;
    }
  };
  
  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const isInRange = (date: Date, start: string, end: string) => {
    if (!start || !end) return false;
    const checkDate = new Date(date);
    const startDate = new Date(start);
    const endDate = new Date(end);
    checkDate.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    return checkDate >= startDate && checkDate <= endDate;
  };

  const handleDateClick = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    
    if (selectingStartDate || !customStartDate) {
      setCustomStartDate(dateString);
      setCustomEndDate('');
      setSelectingStartDate(false);
    } else {
      const start = new Date(customStartDate);
      const end = new Date(dateString);
      
      if (end >= start) {
        setCustomEndDate(dateString);
        setSelectingStartDate(true);
      } else {
        setCustomStartDate(dateString);
        setCustomEndDate('');
        setSelectingStartDate(false);
      }
    }
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
    const days = [];
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-5"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      const isStart = customStartDate === dateString;
      const isEnd = customEndDate === dateString;
      const inRange = isInRange(date, customStartDate, customEndDate);
      const isToday = isSameDay(date, new Date());

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(date)}
          className={`h-5 flex items-center justify-center rounded text-[10px] transition-colors ${
            isStart || isEnd
              ? 'bg-[#FE7410] text-white font-bold'
              : inRange
              ? 'bg-orange-100 text-orange-900'
              : isToday
              ? 'bg-gray-100 font-semibold'
              : 'hover:bg-gray-100'
          }`}
        >
          {day}
        </button>
      );
    }

    return (
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="p-0.5 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-gray-600" />
          </button>
          <div className="font-semibold text-gray-900 text-xs">
            Tháng {currentMonth.getMonth() + 1}, {currentMonth.getFullYear()}
          </div>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="p-0.5 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-0.5 mb-0.5">
          {dayNames.map(name => (
            <div key={name} className="h-4 flex items-center justify-center text-[9px] font-semibold text-gray-500">
              {name}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-0.5">
          {days}
        </div>
      </div>
    );
  };
  
  // Filtered receipts
  const filteredReceipts = useMemo(() => {
    let result = stockInReceipts || [];
    
    if (searchQuery) {
      result = result.filter(r => 
        r.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.supplier.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (filterSupplier) {
      result = result.filter(r => r.supplier === filterSupplier);
    }
    
    const dateRange = getDateRange();
    if (dateRange) {
      result = result.filter(r => {
        const receiptDate = new Date(r.date);
        return receiptDate >= dateRange.start && receiptDate <= dateRange.end;
      });
    }
    
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [stockInReceipts, searchQuery, filterSupplier, filterDate, customStartDate, customEndDate]);
  
  // Pagination
  const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage);
  const paginatedReceipts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReceipts.slice(start, start + itemsPerPage);
  }, [filteredReceipts, currentPage, itemsPerPage]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterSupplier, filterDate, customStartDate, customEndDate]);
  
  // Reset form
  const resetForm = () => {
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormSupplier('');
    setFormNotes('');
    setFormItems([]);
    setSupplierDiscount(0);
    setEditingReceipt(null);
  };
  
  const handleCreate = () => {
    resetForm();
    setShowForm(true);
  };
  
  const handleEdit = (receipt: StockInReceipt) => {
    setEditingReceipt(receipt);
    setFormDate(receipt.date);
    setFormSupplier(receipt.supplier);
    setFormNotes(receipt.notes || '');
    setFormItems(receipt.items);
    setSupplierDiscount(receipt.supplierDiscount);
    setShowForm(true);
  };
  
  const handleViewDetail = (receipt: StockInReceipt) => {
    setViewingReceipt(receipt);
    setShowDetail(true);
  };
  
  // Add variant to list
  const handleAddVariant = (variantId: string) => {
    const variant = variants.find(v => v._id === variantId);
    if (!variant) return;
    
    const product = products.find(p => p._id === variant.product_id);
    const inventory = inventories.find(inv => inv.variant_id === variantId);
    
    // Check if already in list
    const existingIndex = formItems.findIndex(item => item.variantId === variantId);
    if (existingIndex >= 0) {
      const newItems = [...formItems];
      newItems[existingIndex].quantity += 1;
      newItems[existingIndex].totalPrice = newItems[existingIndex].quantity * newItems[existingIndex].unitPrice;
      setFormItems(newItems);
      toast.success(`Đã tăng số lượng ${variant.sku}`);
    } else {
      const newItem: StockInItem = {
        variantId: variant._id,
        productId: variant.product_id,
        productName: product?.title || 'N/A',
        variantTitle: variant.title,
        sku: variant.sku,
        barcode: variant.barcode,
        quantity: 1,
        unitPrice: variant.cost_price || 0,
        totalPrice: variant.cost_price || 0,
        currentStock: inventory?.on_hand || 0,
      };
      setFormItems([...formItems, newItem]);
      toast.success(`Đã thêm ${variant.sku}`);
    }
    
    setShowProductSearch(false);
    setProductSearchQuery('');
  };
  
  // Barcode scanner
  useEffect(() => {
    let barcode = '';
    let timeout: NodeJS.Timeout;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (!showForm) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if ((e.target as HTMLInputElement).type !== 'text' || (e.target as HTMLInputElement) !== searchInputRef.current) {
          return;
        }
      }

      if (e.key === 'Enter' && barcode.length > 0) {
        const variant = variants.find(v => v.barcode === barcode || v.sku === barcode);
        if (variant) {
          handleAddVariant(variant._id);
        } else {
          toast.error(`Không tìm thấy SKU/Barcode: ${barcode}`);
        }
        barcode = '';
      } else if (e.key.length === 1) {
        barcode += e.key;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          barcode = '';
        }, 100);
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
      clearTimeout(timeout);
    };
  }, [showForm, variants]);
  
  const handleUpdateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) return;
    const newItems = [...formItems];
    newItems[index].quantity = quantity;
    newItems[index].totalPrice = quantity * newItems[index].unitPrice;
    setFormItems(newItems);
  };
  
  const handleUpdateUnitPrice = (index: number, unitPrice: number) => {
    if (unitPrice < 0) return;
    const newItems = [...formItems];
    newItems[index].unitPrice = unitPrice;
    newItems[index].totalPrice = newItems[index].quantity * unitPrice;
    setFormItems(newItems);
  };
  
  const handleRemoveItem = (index: number) => {
    setFormItems(formItems.filter((_, i) => i !== index));
  };
  
  const calculateSubtotal = () => {
    return formItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };
  
  const calculateTotal = () => {
    return calculateSubtotal() - supplierDiscount;
  };
  
  const handleSubmit = async () => {
    if (!formSupplier || formItems.length === 0) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    
    const hasInvalidItem = formItems.some(item => item.unitPrice <= 0);
    if (hasInvalidItem) {
      toast.error('Vui lòng nhập đơn giá cho tất cả sản phẩm!');
      return;
    }
    
    try {
      const receiptData = {
        date: formDate,
        supplier: formSupplier,
        items: formItems,
        subtotal: calculateSubtotal(),
        supplierDiscount: supplierDiscount,
        totalAmount: calculateTotal(),
        notes: formNotes,
      };
      
      let receiptNumber = '';
      
      if (editingReceipt) {
        updateStockInReceipt(editingReceipt.id, receiptData);
        receiptNumber = editingReceipt.receiptNumber;
        toast.success('Đã cập nhật phiếu nhập!');
      } else {
        const receipt = createStockInReceipt(receiptData);
        receiptNumber = receipt.receiptNumber;
        toast.success('Đã tạo phiếu nhập!');
      }
      
      // Create inventory transactions
      for (const item of formItems) {
        try {
          await api.inventoryPurchaseIn(
            item.variantId,
            item.productId,
            item.quantity,
            receiptNumber,
            `Nhập hàng từ ${formSupplier} - ${receiptNumber}`
          );
        } catch (error) {
          console.error(`Failed to create transaction for ${item.sku}:`, error);
        }
      }
      
      // Reload inventory data
      await loadData();
      
      setShowForm(false);
      resetForm();
      setCurrentPage(1);
    } catch (error) {
      console.error('Failed to create stock in:', error);
      toast.error('Có lỗi xảy ra khi lưu phiếu');
    }
  };
  
  const handleDeleteConfirm = (receipt: StockInReceipt) => {
    setDeletingReceipt(receipt);
    setShowDeleteConfirm(true);
  };
  
  const handleConfirmDelete = () => {
    if (deletingReceipt) {
      deleteStockInReceipt(deletingReceipt.id);
      setShowDeleteConfirm(false);
      setDeletingReceipt(null);
      toast.success('Đã xóa phiếu nhập');
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };
  
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ';
  };
  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(e.target as Node)) {
        setShowProductSearch(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Package className="w-8 h-8 text-[#FE7410] animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h2 className="page-title">Nhập kho</h2>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-gray-500 text-sm">{filteredReceipts.length} / {stockInReceipts?.length || 0} phiếu nhập</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleCreate}
            className="btn-primary-orange flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Tạo phiếu nhập
          </button>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm mã phiếu, nhà cung cấp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterSupplier}
            onChange={(e) => setFilterSupplier(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Tất cả nhà cung cấp</option>
            {suppliers.map(supplier => (
              <option key={supplier} value={supplier}>{supplier}</option>
            ))}
          </select>
          
          <select
            value={filterDate}
            onChange={(e) => {
              setFilterDate(e.target.value);
              if (e.target.value !== 'custom') {
                setCustomStartDate('');
                setCustomEndDate('');
              }
            }}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">Tất cả thời gian</option>
            <option value="today">Hôm nay</option>
            <option value="yesterday">Hôm qua</option>
            <option value="week">7 ngày qua</option>
            <option value="month">30 ngày qua</option>
            <option value="custom">Tùy chọn</option>
          </select>
        </div>
        
        {filterDate === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className="lg:col-span-2"></div>
            <div></div>
            <div className="relative">
              <button
                onClick={() => setShowDateRangePicker(!showDateRangePicker)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent flex items-center gap-2 hover:bg-gray-50 transition-colors text-sm"
              >
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700 flex-1 text-left">
                  {customStartDate && customEndDate 
                    ? `${new Date(customStartDate).toLocaleDateString('vi-VN')} - ${new Date(customEndDate).toLocaleDateString('vi-VN')}`
                    : 'Chọn khoảng thời gian'}
                </span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showDateRangePicker ? 'rotate-180' : ''}`} />
              </button>

              {showDateRangePicker && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2.5 z-50">
                  {renderCalendar()}
                  
                  <div className="flex gap-2 pt-2.5 mt-2.5 border-t">
                    <button
                      onClick={() => {
                        setCustomStartDate('');
                        setCustomEndDate('');
                        setSelectingStartDate(true);
                        setShowDateRangePicker(false);
                      }}
                      className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-xs font-medium"
                    >
                      Xóa
                    </button>
                    <button
                      onClick={() => setShowDateRangePicker(false)}
                      disabled={!customStartDate || !customEndDate}
                      className="flex-1 px-2.5 py-1.5 bg-[#FE7410] text-white rounded-lg hover:bg-[#E56809] transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Áp dụng
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-8">
        {paginatedReceipts.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">
              {filteredReceipts.length === 0 && searchQuery ? 'Không tìm thấy phiếu nhập' : 'Chưa có phiếu nhập nào'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th className="table-header">Mã phiếu</th>
                    <th className="table-header">Ngày nhập</th>
                    <th className="table-header">Nhà cung cấp</th>
                    <th className="table-header text-center">Số SKU</th>
                    <th className="table-header text-right">Tổng tiền hàng</th>
                    <th className="table-header text-right">Giảm giá NCC</th>
                    <th className="table-header text-right">Thành tiền</th>
                    <th className="table-header actions-left">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedReceipts.map((receipt) => (
                    <tr key={receipt.id}>
                      <td className="table-content">
                        <div className="font-medium text-gray-900">{receipt.receiptNumber}</div>
                      </td>
                      <td className="table-content">
                        {formatDate(receipt.date)}
                      </td>
                      <td className="table-content">
                        {receipt.supplier}
                      </td>
                      <td className="table-content text-center">
                        {receipt.items.length}
                      </td>
                      <td className="table-content text-right">
                        {formatCurrency(receipt.subtotal)}
                      </td>
                      <td className="table-content text-right">
                        <span className="text-red-600">-{formatCurrency(receipt.supplierDiscount || 0)}</span>
                      </td>
                      <td className="table-content text-right">
                        <span className="font-semibold">{formatCurrency(receipt.totalAmount)}</span>
                      </td>
                      <td className="table-content">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetail(receipt)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-5 h-5 action-icon" />
                          </button>
                          <button
                            onClick={() => handleEdit(receipt)}
                            className="p-2 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="Sửa"
                          >
                            <Edit className="w-5 h-5 action-icon" />
                          </button>
                          <button
                            onClick={() => handleDeleteConfirm(receipt)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-5 h-5 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredReceipts.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredReceipts.length}
                itemsPerPage={itemsPerPage}
                onPageChange={(page) => setCurrentPage(page)}
                onItemsPerPageChange={(items) => {
                  setItemsPerPage(items);
                  setCurrentPage(1);
                }}
              />
            )}
          </div>
        )}
      </div>
      
      {/* View Detail Modal */}
      {showDetail && viewingReceipt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0" onClick={() => setShowDetail(false)}></div>
          
          <div className="relative bg-white w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex-shrink-0 text-white px-6 py-4 flex items-center justify-between" style={{ backgroundColor: '#FE7410' }}>
              <div>
                <h3 className="text-xl font-bold">Chi tiết phiếu nhập</h3>
                <p className="text-sm text-orange-100 mt-0.5">{viewingReceipt.receiptNumber}</p>
              </div>
              <button
                onClick={() => setShowDetail(false)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-4">Thông tin phiếu</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Ngày nhập</p>
                      <p className="font-semibold text-gray-900">{formatDate(viewingReceipt.date)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Nhà cung cấp</p>
                      <p className="font-semibold text-gray-900">{viewingReceipt.supplier}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Người tạo</p>
                      <p className="font-semibold text-gray-900">{viewingReceipt.createdBy}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Ngày tạo</p>
                      <p className="font-semibold text-gray-900">{formatDate(viewingReceipt.createdAt.split('T')[0])}</p>
                    </div>
                    {viewingReceipt.notes && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-600">Ghi chú</p>
                        <p className="font-semibold text-gray-900">{viewingReceipt.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
                  <div className="px-6 py-3 bg-gray-50 border-b-2 border-gray-200">
                    <h4 className="font-bold text-gray-900">Danh sách sản phẩm ({viewingReceipt.items.length})</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">SKU</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Sản phẩm</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Biến thể</th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-gray-700">Số lượng</th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-gray-700">Đơn giá</th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-gray-700">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {viewingReceipt.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm font-mono text-gray-900">{item.sku || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">{item.productName}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{item.variantTitle || '-'}</td>
                            <td className="px-4 py-3 text-center text-sm text-gray-600">{item.quantity}</td>
                            <td className="px-4 py-3 text-right text-sm text-gray-600">{formatCurrency(item.unitPrice)}</td>
                            <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">{formatCurrency(item.totalPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tổng tiền hàng:</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(viewingReceipt.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Giảm giá NCC:</span>
                      <span className="font-semibold text-red-600">-{formatCurrency(viewingReceipt.supplierDiscount)}</span>
                    </div>
                    <div className="h-px bg-gray-300 my-2"></div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="font-bold text-gray-900">Thành tiền:</span>
                      <span className="font-bold text-2xl" style={{ color: '#FE7410' }}>
                        {formatCurrency(viewingReceipt.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-shrink-0 bg-white border-t-2 border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDetail(false)}
                className="px-6 py-2.5 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setShowDetail(false);
                  handleEdit(viewingReceipt);
                }}
                className="px-6 py-2.5 rounded-xl font-semibold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: '#FE7410' }}
              >
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full my-8" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
            <div className="sticky top-0 bg-[#FE7410] text-white px-6 py-4 flex justify-between items-center rounded-t-lg z-10">
              <div>
                <h3 className="text-xl font-bold">
                  {editingReceipt ? 'Sửa phiếu nhập kho' : 'Tạo phiếu nhập kho'}
                </h3>
                <p className="text-sm text-orange-100 mt-1 flex items-center gap-2">
                  <Barcode className="w-4 h-4" />
                  Quét barcode hoặc tìm kiếm SKU để thêm sản phẩm
                </p>
              </div>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(100vh - 12rem)' }}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Search className="w-5 h-5 text-[#FE7410]" />
                      Tìm kiếm sản phẩm
                    </h4>
                    
                    <div className="relative" ref={searchInputRef}>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Quét barcode hoặc tìm SKU, tên sản phẩm..."
                          value={productSearchQuery}
                          onChange={(e) => {
                            setProductSearchQuery(e.target.value);
                            setShowProductSearch(true);
                          }}
                          onFocus={() => setShowProductSearch(true)}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                        />
                      </div>
                      
                      {showProductSearch && filteredVariants.length > 0 && (
                        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                          {filteredVariants.map(variant => {
                            const product = products.find(p => p._id === variant.product_id);
                            const inventory = inventories.find(inv => inv.variant_id === variant._id);
                            
                            return (
                              <button
                                key={variant._id}
                                onClick={() => handleAddVariant(variant._id)}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between border-b border-gray-100 last:border-b-0"
                              >
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">{product?.title || 'N/A'}</p>
                                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{variant.sku}</span>
                                    {variant.title && (
                                      <>
                                        <span>•</span>
                                        <span>{variant.title}</span>
                                      </>
                                    )}
                                    {variant.barcode && (
                                      <>
                                        <span>•</span>
                                        <Barcode className="w-3 h-3" />
                                        <span>{variant.barcode}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right ml-4">
                                  <p className="text-xs text-gray-500">Tồn kho</p>
                                  <p className={`text-sm font-semibold ${
                                    (inventory?.on_hand || 0) === 0 ? 'text-red-600' :
                                    (inventory?.on_hand || 0) <= 10 ? 'text-yellow-600' :
                                    'text-green-600'
                                  }`}>
                                    {inventory?.on_hand || 0}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
                    <div className="px-6 py-3 bg-gray-50 border-b-2 border-gray-200">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Package className="w-5 h-5 text-[#FE7410]" />
                        Danh sách sản phẩm ({formItems.length})
                      </h4>
                    </div>
                    
                    <div className="max-h-[500px] overflow-y-auto">
                      {formItems.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm text-gray-500">Chưa có sản phẩm nào</p>
                          <p className="text-xs text-gray-400 mt-1">Quét barcode hoặc tìm kiếm để thêm</p>
                        </div>
                      ) : (
                        <table className="w-full">
                          <thead className="bg-gray-100 sticky top-0">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">SKU</th>
                              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Sản phẩm</th>
                              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Biến thể</th>
                              <th className="px-4 py-3 text-center text-xs font-bold text-gray-700">Tồn</th>
                              <th className="px-4 py-3 text-center text-xs font-bold text-gray-700">SL nhập</th>
                              <th className="px-4 py-3 text-right text-xs font-bold text-gray-700">Đơn giá</th>
                              <th className="px-4 py-3 text-right text-xs font-bold text-gray-700">Thành tiền</th>
                              <th className="px-4 py-3 text-center text-xs font-bold text-gray-700"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {formItems.map((item, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-mono text-gray-900">{item.sku}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 font-medium">{item.productName}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{item.variantTitle || '-'}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`text-sm font-semibold ${
                                    (item.currentStock || 0) <= 10 ? 'text-red-600' : 'text-gray-900'
                                  }`}>
                                    {item.currentStock || 0}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => handleUpdateQuantity(index, Number(e.target.value))}
                                    className="w-20 px-2 py-1.5 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent text-sm"
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <input
                                    type="number"
                                    min="0"
                                    value={item.unitPrice}
                                    onChange={(e) => handleUpdateUnitPrice(index, Number(e.target.value))}
                                    placeholder="0"
                                    className="w-36 px-2 py-1.5 text-right border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent text-sm ml-auto block"
                                  />
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <span className="text-sm font-bold text-gray-900">
                                    {formatCurrency(item.totalPrice)}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <button
                                    onClick={() => handleRemoveItem(index)}
                                    className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Xóa"
                                  >
                                    <X className="w-4 h-4 text-gray-500 hover:text-red-600" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="lg:col-span-1 space-y-4">
                  <div className="bg-[rgb(255,255,255)] rounded-lg p-6 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4">Thông tin phiếu</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 mb-2">
                          Ngày nhập <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={formDate}
                          onChange={(e) => setFormDate(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 mb-2">
                          Nhà cung cấp <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formSupplier}
                          onChange={(e) => setFormSupplier(e.target.value)}
                          placeholder="Tên nhà cung cấp"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 mb-2">
                          Ghi chú
                        </label>
                        <textarea
                          value={formNotes}
                          onChange={(e) => setFormNotes(e.target.value)}
                          placeholder="Ghi chú thêm (nếu có)"
                          rows={3}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent resize-none"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 border border-gray-200 sticky top-4">
                    <h4 className="font-semibold text-gray-900 mb-4">Thanh toán</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tổng tiền hàng:</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(calculateSubtotal())}</span>
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 mb-2">
                          Giảm giá NCC:
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={calculateSubtotal()}
                          value={supplierDiscount}
                          onChange={(e) => setSupplierDiscount(Number(e.target.value))}
                          placeholder="0"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                        />
                      </div>
                      
                      <div className="h-px bg-gray-300 my-2"></div>
                      
                      <div className="flex justify-between items-center pt-2">
                        <span className="font-bold text-gray-900">Thành tiền:</span>
                        <span className="font-bold text-2xl" style={{ color: '#FE7410' }}>
                          {formatCurrency(calculateTotal())}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3 rounded-b-lg">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={formItems.length === 0 || !formSupplier}
                className="px-6 py-2.5 bg-[#FE7410] text-white rounded-lg hover:bg-[#E56809] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingReceipt ? 'Cập nhật phiếu' : 'Lưu phiếu nhập'} ({formItems.length} SKU)
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deletingReceipt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6">
              <h3 className="text-xl font-bold text-red-600 mb-4">
                Xác nhận xóa
              </h3>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn xóa phiếu nhập "{deletingReceipt.receiptNumber}" không?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeletingReceipt(null);
                  }}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-medium text-gray-700"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-bold"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
