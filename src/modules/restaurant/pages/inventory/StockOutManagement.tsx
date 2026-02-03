import { useState, useMemo, useRef, useEffect } from 'react';
import { PackageMinus, Plus, Search, Trash2, X, ChevronLeft, ChevronRight, Eye, Edit, AlertTriangle, Calendar, ChevronDown } from 'lucide-react';
import { useStore } from '../../../../lib/restaurant-lib/store';
import type { StockOutItem, StockOutReceipt } from '../../../../lib/restaurant-lib/store';
import { Pagination } from '../../components/common/Pagination';

const STOCK_OUT_REASONS = {
  damaged: 'Hỏng hóc',
  lost: 'Mất mát',
  transfer: 'Điều chuyển',
  internal_use: 'Sử dụng nội bộ',
  return_to_supplier: 'Trả hàng NCC',
  other: 'Khác',
} as const;

export default function StockOutManagement() {
  const { products, stockOutReceipts, createStockOutReceipt, updateStockOutReceipt, deleteStockOutReceipt, currentUser } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<StockOutReceipt | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<StockOutReceipt | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingReceipt, setDeletingReceipt] = useState<StockOutReceipt | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterReason, setFilterReason] = useState('');
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
  const [formReason, setFormReason] = useState<keyof typeof STOCK_OUT_REASONS>('damaged');
  const [formNotes, setFormNotes] = useState('');
  const [formItems, setFormItems] = useState<StockOutItem[]>([]);
  
  // Product search dropdown
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Get only products (not services or treatments)
  const stockProducts = useMemo(() => {
    // Chỉ lấy sản phẩm thường có quản lý tồn kho (productType='inventory')
    return products.filter(p => p.productType === 'inventory');
  }, [products]);
  
  // Filtered products for search dropdown
  const filteredProducts = useMemo(() => {
    if (!productSearchQuery) return stockProducts;
    return stockProducts.filter(p => 
      p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(productSearchQuery.toLowerCase())
    );
  }, [stockProducts, productSearchQuery]);
  
  // Get unique reasons for filter
  const reasons = useMemo(() => {
    return Array.from(new Set((stockOutReceipts || []).map(r => r.reason))).filter(Boolean);
  }, [stockOutReceipts]);
  
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

    // Empty cells for days before the first day of month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-5"></div>);
    }

    // Days of the month
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
        
        {/* Day names */}
        <div className="grid grid-cols-7 gap-0.5 mb-0.5">
          {dayNames.map(name => (
            <div key={name} className="h-4 flex items-center justify-center text-[9px] font-semibold text-gray-500">
              {name}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-0.5">
          {days}
        </div>
      </div>
    );
  };
  
  // Filtered receipts
  const filteredReceipts = useMemo(() => {
    let result = stockOutReceipts || [];
    
    if (searchQuery) {
      result = result.filter(r => 
        r.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (filterReason) {
      result = result.filter(r => r.reason === filterReason);
    }
    
    // Apply date filter
    const dateRange = getDateRange();
    if (dateRange) {
      result = result.filter(r => {
        const receiptDate = new Date(r.date);
        return receiptDate >= dateRange.start && receiptDate <= dateRange.end;
      });
    }
    
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [stockOutReceipts, searchQuery, filterReason, filterDate, customStartDate, customEndDate]);
  
  // Pagination
  const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage);
  const paginatedReceipts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReceipts.slice(start, start + itemsPerPage);
  }, [filteredReceipts, currentPage, itemsPerPage]);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterReason, filterDate, customStartDate, customEndDate]);
  
  // Reset form
  const resetForm = () => {
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormReason('damaged');
    setFormNotes('');
    setFormItems([]);
    setEditingReceipt(null);
  };
  
  // Open create form
  const handleCreate = () => {
    resetForm();
    setShowForm(true);
  };
  
  // Open edit form
  const handleEdit = (receipt: StockOutReceipt) => {
    setEditingReceipt(receipt);
    setFormDate(receipt.date);
    setFormReason(receipt.reason as keyof typeof STOCK_OUT_REASONS);
    setFormNotes(receipt.notes || '');
    setFormItems(receipt.items);
    setShowForm(true);
  };
  
  // Open view detail
  const handleViewDetail = (receipt: StockOutReceipt) => {
    setViewingReceipt(receipt);
    setShowDetail(true);
  };
  
  // Add product to list
  const handleAddProduct = (productId: string) => {
    const product = stockProducts.find(p => p.id === productId);
    if (!product) return;
    const costPrice = product.costPrice ?? 0;
    
    // Check if already in list
    const existingIndex = formItems.findIndex(item => item.productId === productId);
    if (existingIndex >= 0) {
      // Just increase quantity
      const newItems = [...formItems];
      newItems[existingIndex].quantity += 1;
      newItems[existingIndex].totalPrice = newItems[existingIndex].quantity * (newItems[existingIndex].costPrice || 0);
      setFormItems(newItems);
    } else {
      // Add new
      const newItem: StockOutItem = {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        costPrice,
        totalPrice: costPrice,
      };
      setFormItems([...formItems, newItem]);
    }
    
    // Close search
    setShowProductSearch(false);
    setProductSearchQuery('');
  };
  
  // Update item quantity
  const handleUpdateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) return;
    const newItems = [...formItems];
    newItems[index].quantity = quantity;
    newItems[index].totalPrice = quantity * (newItems[index].costPrice || 0);
    setFormItems(newItems);
  };
  
  const handleRemoveItem = (index: number) => {
    setFormItems(formItems.filter((_, i) => i !== index));
  };
  
  const handleSubmit = () => {
    if (formItems.length === 0) {
      alert('Vui lòng thêm ít nhất một sản phẩm!');
      return;
    }
    
    // Check if all products have enough stock
    for (const item of formItems) {
      const product = products.find(p => p.id === item.productId);
      if (product && product.stock < item.quantity) {
        alert(`Sản phẩm "${item.productName}" không đủ tồn kho! (Có: ${product.stock}, Cần: ${item.quantity})`);
        return;
      }
    }
    
    const receiptData = {
      date: formDate,
      reason: formReason,
      staffName: currentUser?.fullName || currentUser?.username || 'Hệ thống',
      items: formItems,
      totalAmount: formItems.reduce((sum, item) => sum + (item.totalPrice || item.costPrice * item.quantity), 0),
      notes: formNotes,
    };
    
    if (editingReceipt) {
      updateStockOutReceipt(editingReceipt.id, receiptData);
    } else {
      createStockOutReceipt(receiptData);
    }
    
    // Reset form
    setShowForm(false);
    resetForm();
    setCurrentPage(1);
  };
  
  const handleDeleteConfirm = (receipt: StockOutReceipt) => {
    setDeletingReceipt(receipt);
    setShowDeleteConfirm(true);
  };
  
  const handleConfirmDelete = () => {
    if (deletingReceipt) {
      deleteStockOutReceipt(deletingReceipt.id);
      setShowDeleteConfirm(false);
      setDeletingReceipt(null);
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };
  
  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(e.target as Node)) {
        setShowProductSearch(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h2 className="page-title">Xuất kho</h2>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-gray-500 text-sm">{filteredReceipts.length} / {stockOutReceipts?.length || 0} phiếu xuất</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          
          
          <button
            onClick={handleCreate}
            className="btn-primary-orange flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Tạo phiếu xuất
          </button>
        </div>
      </div>
      
      {/* Search and Filters - Single Row */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm mã phiếu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          
          {/* Reason Filter */}
          <select
            value={filterReason}
            onChange={(e) => setFilterReason(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Tất cả lý do</option>
            {reasons.map(reason => (
              <option key={reason} value={reason}>{STOCK_OUT_REASONS[reason as keyof typeof STOCK_OUT_REASONS]}</option>
            ))}
          </select>
          
          {/* Date Filter Dropdown */}
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
        
        {/* Custom Date Range - Second Row */}
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

              {/* Date Range Picker Popup */}
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
      <div className="flex-1 overflow-y-auto pb-8" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {paginatedReceipts.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <PackageMinus className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">
              {filteredReceipts.length === 0 && searchQuery ? 'Không tìm thấy phiếu xuất' : 'Chưa có phiếu xuất nào'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th className="table-header">Mã phiếu</th>
                    <th className="table-header">Ngày xuất</th>
                    <th className="table-header">Lý do</th>
                    <th className="table-header text-center">Số mặt hàng</th>
                    <th className="table-header text-center">Tổng SL</th>
                    <th className="table-header">Người tạo</th>
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
                        {STOCK_OUT_REASONS[receipt.reason as keyof typeof STOCK_OUT_REASONS]}
                      </td>
                      <td className="table-content text-center">
                        {receipt.items.length}
                      </td>
                      <td className="table-content text-center">
                        <span className="font-semibold">{receipt.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                      </td>
                      <td className="table-content">
                        {receipt.createdBy}
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
            
            {/* Pagination */}
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
          
          <div 
            className="relative bg-white w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden"
            style={{ animation: 'fadeIn 0.2s ease-out' }}
          >
            {/* Header */}
            <div className="flex-shrink-0 text-white px-6 py-4 flex items-center justify-between" style={{ backgroundColor: '#FE7410' }}>
              <div>
                <h3 className="text-xl font-bold">Chi tiết phiếu xuất</h3>
                <p className="text-sm text-orange-100 mt-0.5">{viewingReceipt.receiptNumber}</p>
              </div>
              <button
                onClick={() => setShowDetail(false)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <div className="space-y-6">
                {/* Info Card */}
                <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-4">Thông tin phiếu</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Ngày xuất</p>
                      <p className="font-semibold text-gray-900">{formatDate(viewingReceipt.date)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Lý do</p>
                      <p className="font-semibold text-gray-900">{STOCK_OUT_REASONS[viewingReceipt.reason as keyof typeof STOCK_OUT_REASONS]}</p>
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
                
                {/* Products Table */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
                  <div className="px-6 py-3 bg-gray-50 border-b-2 border-gray-200">
                    <h4 className="font-bold text-gray-900">Danh sách sản phẩm ({viewingReceipt.items.length})</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Sản phẩm</th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-gray-700">Số lượng</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {viewingReceipt.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm text-gray-900 font-medium text-[16px]">{item.productName}</td>
                            <td className="px-4 py-3 text-center text-sm font-bold text-gray-900 text-[16px]">{item.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Summary */}
                <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Tổng số lượng xuất:</span>
                    <span className="font-bold text-2xl" style={{ color: '#FE7410' }}>
                      {viewingReceipt.items.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer */}
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
            {/* Header */}
            <div className="sticky top-0 bg-[#FE7410] text-white px-6 py-4 flex justify-between items-center rounded-t-lg z-10">
              <h3 className="text-xl font-bold">
                {editingReceipt ? 'Sửa phiếu xuất kho' : 'Tạo phiếu xuất kho'}
              </h3>
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
            
            {/* Scrollable Content */}
            <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(100vh - 12rem)' }}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Product List */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Search & Add Product */}
                  <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      Sản phẩm xuất kho
                    </h4>
                    
                    <div className="relative" ref={searchInputRef}>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Tìm và thêm sản phẩm..."
                          value={productSearchQuery}
                          onChange={(e) => {
                            setProductSearchQuery(e.target.value);
                            setShowProductSearch(true);
                          }}
                          onFocus={() => setShowProductSearch(true)}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                        />
                      </div>
                      
                      {showProductSearch && (
                        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                          {filteredProducts.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                              Không tìm thấy sản phẩm
                            </div>
                          ) : (
                            filteredProducts.map(product => (
                              <button
                                key={product.id}
                                onClick={() => handleAddProduct(product.id)}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between border-b border-gray-100 last:border-b-0"
                              >
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                  {product.barcode && (
                                    <p className="text-xs text-gray-500 mt-0.5">Mã: {product.barcode}</p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-500">Tồn kho</p>
                                  <p className={`text-sm font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {product.stock}
                                  </p>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Items List */}
                  <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
                    <div className="px-6 py-3 bg-gray-50 border-b-2 border-gray-200">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        Danh sách sản phẩm ({formItems.length})
                      </h4>
                    </div>
                    
                    <div className="max-h-[500px] overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                      {formItems.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                          <PackageMinus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm text-gray-500">Chưa có sản phẩm nào</p>
                          <p className="text-xs text-gray-400 mt-1">Tìm và thêm sản phẩm bên trên</p>
                        </div>
                      ) : (
                        <table className="w-full">
                          <thead className="bg-gray-100 sticky top-0">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Sản phẩm</th>
                              <th className="px-4 py-3 text-right text-xs font-bold text-gray-700">Số lượng</th>
                              <th className="px-4 py-3 text-center text-xs font-bold text-gray-700">Tồn kho</th>
                              <th className="px-4 py-3 text-center text-xs font-bold text-gray-700"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {formItems.map((item, index) => {
                              const product = products.find(p => p.id === item.productId);
                              const currentStock = product?.stock || 0;
                              const isInvalid = currentStock < item.quantity;
                              
                              return (
                                <tr key={index} className={`hover:bg-gray-50 ${isInvalid ? 'bg-red-50' : ''}`}>
                                  <td className="px-4 py-3">
                                    <p className="text-sm text-gray-900 font-medium">{item.productName}</p>
                                    {isInvalid && (
                                      <p className="text-xs text-red-600 mt-0.5 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        Không đủ tồn kho
                                      </p>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <input
                                      type="number"
                                      min="1"
                                      value={item.quantity}
                                      onChange={(e) => handleUpdateQuantity(index, Number(e.target.value))}
                                      className={`w-20 px-2 py-1.5 text-right border rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent text-sm ml-auto block ${
                                        isInvalid ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                      }`}
                                    />
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={`text-sm font-semibold ${currentStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {currentStock}
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
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Right: Form Info & Summary */}
                <div className="lg:col-span-1 space-y-4">
                  {/* Form Info */}
                  <div className="bg-[rgb(255,255,255)] rounded-lg p-6 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4">Thông tin phiếu</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 mb-2">
                          Ngày xuất <span className="text-red-500">*</span>
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
                          Lý do <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formReason}
                          onChange={(e) => setFormReason(e.target.value as keyof typeof STOCK_OUT_REASONS)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                        >
                          {Object.entries(STOCK_OUT_REASONS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
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
                  
                  {/* Summary */}
                  <div className="bg-white rounded-lg p-6 border border-gray-200 sticky top-4">
                    <h4 className="font-semibold text-gray-900 mb-4">Tổng quan</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Số mặt hàng:</span>
                        <span className="font-semibold text-gray-900">{formItems.length}</span>
                      </div>
                      
                      <div className="h-px bg-gray-300 my-2"></div>
                      
                      <div className="flex justify-between items-center pt-2">
                        <span className="font-bold text-gray-900">Tổng số lượng:</span>
                        <span className="font-bold text-2xl" style={{ color: '#FE7410' }}>
                          {formItems.reduce((sum, item) => sum + item.quantity, 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer */}
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
                disabled={formItems.length === 0}
                className="px-6 py-2.5 bg-[#FE7410] text-white rounded-lg hover:bg-[#E56809] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingReceipt ? 'Cập nhật phiếu' : 'Lưu phiếu xuất'} ({formItems.length} SP)
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
                Bạn có chắc chắn muốn xóa phiếu xuất "{deletingReceipt.receiptNumber}" không?
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