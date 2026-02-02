import { useState, useMemo, useRef, useEffect } from 'react';
import { PackageMinus, Plus, Search, Trash2, X, Printer, ShoppingCart, Receipt, Eye, Edit, AlertTriangle } from 'lucide-react';
import { useStore } from '../../../../lib/convenience-store-lib/store';
import type { StockOutItem, StockOutReceipt } from '../../../../lib/convenience-store-lib/store';
import { Pagination } from '../../components/pagination/Pagination';

const STOCK_OUT_REASONS = {
  damaged: 'Hỏng hóc',
  lost: 'Mất mát',
  transfer: 'Điều chuyển',
  internal_use: 'Sử dụng nội bộ',
  return_to_supplier: 'Trả hàng NCC',
  other: 'Khác',
} as const;

export function StockOutManagement() {
  const { products, stockOutReceipts, createStockOutReceipt, updateStockOutReceipt, deleteStockOutReceipt, currentUser } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<StockOutReceipt | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<StockOutReceipt | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingReceipt, setDeletingReceipt] = useState<StockOutReceipt | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterReason, setFilterReason] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  
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
  
  // Get only ACTIVE products (not services or treatments)
  const stockProducts = useMemo(() => {
    return products.filter(p => 
      (p.productType === 'product' || !p.productType) &&
      p.status === 1 // Only active products
    );
  }, [products]);
  
  // Filtered products for search dropdown
  const filteredProducts = useMemo(() => {
    if (!productSearchQuery) return stockProducts;
    return stockProducts.filter(p => 
      (p.name ?? p.title ?? '').toLowerCase().includes(productSearchQuery.toLowerCase()) ||
      (p.barcode ?? p.code ?? '').toLowerCase().includes(productSearchQuery.toLowerCase())
    );
  }, [stockProducts, productSearchQuery]);
  
  // Filtered receipts
  const filteredReceipts = useMemo(() => {
    let result = stockOutReceipts || [];
    
    if (searchQuery) {
      result = result.filter(r => 
        (r.receiptNumber || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (filterReason) {
      result = result.filter(r => r.reason === filterReason);
    }
    
    if (filterDateFrom) {
      result = result.filter(r => r.date >= filterDateFrom);
    }
    
    if (filterDateTo) {
      result = result.filter(r => r.date <= filterDateTo);
    }
    
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [stockOutReceipts, searchQuery, filterReason, filterDateFrom, filterDateTo]);
  
  // Pagination
  const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage);
  const paginatedReceipts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReceipts.slice(start, start + itemsPerPage);
  }, [filteredReceipts, currentPage, itemsPerPage]);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterReason, filterDateFrom, filterDateTo]);
  
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
    setFormReason(receipt.reason);
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
    const product = stockProducts.find(p => (p.id ?? p._id) === productId);
    if (!product) return;
    const resolvedProductId = product.id ?? product._id;
    const productName = product.name ?? product.title;
    
    // Check if already in list
    const existingIndex = formItems.findIndex(item => item.productId === resolvedProductId);
    if (existingIndex >= 0) {
      // Just increase quantity
      const newItems = [...formItems];
      newItems[existingIndex].quantity += 1;
      newItems[existingIndex].totalPrice = newItems[existingIndex].quantity * newItems[existingIndex].costPrice;
      setFormItems(newItems);
    } else {
      // Add new with cost price (estimate as 70% of selling price)
      const costPrice = product.price * 0.7;
      const newItem: StockOutItem = {
        productId: resolvedProductId,
        productName,
        quantity: 1,
        costPrice: costPrice,
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
    newItems[index].totalPrice = quantity * newItems[index].costPrice;
    setFormItems(newItems);
  };
  
  const handleRemoveItem = (index: number) => {
    setFormItems(formItems.filter((_, i) => i !== index));
  };
  
  const calculateTotal = () => {
    return formItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };
  
  const handleSubmit = () => {
    if (formItems.length === 0) {
      alert('Vui lòng thêm ít nhất một sản phẩm!');
      return;
    }
    
    // Validate all items have cost price
    const hasInvalidItem = formItems.some(item => item.costPrice <= 0);
    if (hasInvalidItem) {
      alert('Vui lòng nhập đơn giá cho tất cả sản phẩm!');
      return;
    }
    
    // Validate stock for all items
    for (const item of formItems) {
      const product = stockProducts.find(p => (p.id ?? p._id) === item.productId);
      const stock = product?.stock ?? product?.quantity ?? 0;
      if (!product || item.quantity > stock) {
        alert(`Sản phẩm "${item.productName}" không đủ tồn kho để xuất!`);
        return;
      }
    }
    
    const receiptData = {
      date: formDate,
      reason: formReason,
      notes: formNotes,
      items: formItems,
      totalAmount: calculateTotal(),
      staffName: currentUser?.fullName || currentUser?.username || 'Hệ thống',
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
  
  const handleDeleteClick = (receipt: StockOutReceipt) => {
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
  
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ';
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Xuất kho</h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            {filteredReceipts.length} / {stockOutReceipts?.length || 0} phiếu xuất
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm border border-gray-200 dark:border-gray-700 text-sm sm:text-base w-full sm:w-auto"
          >
            <Printer className="w-4 h-4" />
            <span>In báo cáo</span>
          </button>
          
          <button
            onClick={handleCreate}
            className="flex items-center justify-center gap-2 bg-[#FE7410] text-white px-4 py-2.5 rounded-lg hover:bg-[#E56809] transition-all shadow-lg text-sm sm:text-base font-medium w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Tạo phiếu xuất</span>
          </button>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-4 sm:mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Tìm mã phiếu, người xuất..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>
          
          {/* Reason Filter */}
          <select
            value={filterReason}
            onChange={(e) => setFilterReason(e.target.value)}
            className="px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Tất cả lý do</option>
            {Object.entries(STOCK_OUT_REASONS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          
          {/* Date From */}
          <input
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            className="px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Từ ngày"
          />
        </div>
        
        {/* Date To - Second Row if needed */}
        {filterDateFrom && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-3 sm:mt-4">
            <div className="lg:col-span-2"></div>
            <div></div>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Đến ngày"
            />
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-8" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {paginatedReceipts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center">
            <PackageMinus className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
              {filteredReceipts.length === 0 && searchQuery ? 'Không tìm thấy phiếu xuất' : 'Chưa có phiếu xuất nào'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#FEF7ED] dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Mã phiếu</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Ngày xuất</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Lý do</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Số mặt hàng</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Giá trị</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800">
                    {paginatedReceipts.map((receipt) => (
                      <tr key={receipt.id} className="transition-colors hover:bg-[#FEF7ED] dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <td className="px-6 py-5">
                          <div className="font-medium text-gray-900 dark:text-white text-[15px]">{receipt.receiptNumber}</div>
                        </td>
                        <td className="px-6 py-5 text-[15px] text-gray-700 dark:text-gray-300">
                          {formatDate(receipt.date)}
                        </td>
                        <td className="px-6 py-5 text-[15px] text-gray-700 dark:text-gray-300">
                          {STOCK_OUT_REASONS[receipt.reason]}
                        </td>
                        <td className="px-6 py-5 text-center text-[15px] text-gray-900 dark:text-white font-medium">
                          {receipt.items.length}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <span className="font-semibold text-[15px] text-gray-900 dark:text-white">{formatCurrency(receipt.totalAmount)}</span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewDetail(receipt)}
                              className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                              title="Xem chi tiết"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleEdit(receipt)}
                              className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                              title="Sửa"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(receipt)}
                              className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              title="Xóa"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Desktop Pagination */}
              {filteredReceipts.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredReceipts.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onItemsPerPageChange={(newItemsPerPage) => {
                    setItemsPerPage(newItemsPerPage);
                    setCurrentPage(1);
                  }}
                />
              )}
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {paginatedReceipts.map((receipt) => (
                <div
                  key={receipt.id}
                  className="bg-white rounded-xl border border-gray-200 p-4"
                >
                  {/* Receipt Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 text-base mb-1">
                        {receipt.receiptNumber}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        📅 {formatDate(receipt.date)}
                      </div>
                      <div className="text-sm text-gray-600">
                        📋 {STOCK_OUT_REASONS[receipt.reason]}
                      </div>
                    </div>
                    <div className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full font-medium">
                      {receipt.items.length} SP
                    </div>
                  </div>

                  {/* Receipt Summary */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">Giá trị:</span>
                      <span className="font-bold text-red-600 text-base">{formatCurrency(receipt.totalAmount)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleViewDetail(receipt)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      Xem
                    </button>
                    <button
                      onClick={() => handleEdit(receipt)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-orange-50 text-[#FE7410] rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteClick(receipt)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      Xóa
                    </button>
                  </div>
                </div>
              ))}

              {/* Mobile Pagination */}
              {filteredReceipts.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredReceipts.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onItemsPerPageChange={(newItemsPerPage) => {
                    setItemsPerPage(newItemsPerPage);
                    setCurrentPage(1);
                  }}
                />
              )}
            </div>
          </>
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
                      <p className="font-semibold text-gray-900">{STOCK_OUT_REASONS[viewingReceipt.reason]}</p>
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
                          <th className="px-4 py-3 text-right text-xs font-bold text-gray-700">Đơn giá</th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-gray-700">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {viewingReceipt.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm text-gray-900 font-medium text-[16px]">{item.productName}</td>
                            <td className="px-4 py-3 text-center text-sm text-gray-600 text-[16px]">{item.quantity}</td>
                            <td className="px-4 py-3 text-right text-sm text-gray-600 text-[16px]">{formatCurrency(item.costPrice)}</td>
                            <td className="px-4 py-3 text-right text-sm font-bold text-gray-900 text-[16px]">{formatCurrency(item.totalPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Summary */}
                <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Tổng giá trị:</span>
                    <span className="font-bold text-2xl" style={{ color: '#FE7410' }}>
                      {formatCurrency(viewingReceipt.totalAmount)}
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
                      <ShoppingCart className="w-5 h-5" style={{ color: '#FE7410' }} />
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
                            filteredProducts.map(product => {
                              const productId = product.id ?? product._id;
                              const productName = product.name ?? product.title;
                              const stock = product.stock ?? product.quantity ?? 0;
                              return (
                              <button
                                key={productId}
                                onClick={() => handleAddProduct(productId)}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between border-b border-gray-100 last:border-b-0"
                              >
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{productName}</p>
                                  {(product.barcode ?? product.code) && (
                                    <p className="text-xs text-gray-500 mt-0.5">Mã: {product.barcode ?? product.code}</p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-500">Tồn kho</p>
                                  <p className={`text-sm font-semibold ${stock > 0 ? 'text-gray-900' : 'text-red-600'}`}>
                                    {stock}
                                  </p>
                                </div>
                              </button>
                            );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Items List */}
                  <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
                    <div className="px-6 py-3 bg-gray-50 border-b-2 border-gray-200">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Receipt className="w-5 h-5" />
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
                              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700" style={{ width: '40%' }}>Sản phẩm</th>
                              <th className="px-4 py-3 text-center text-xs font-bold text-gray-700" style={{ width: '25%' }}>Số lượng</th>
                              <th className="px-4 py-3 text-center text-xs font-bold text-gray-700" style={{ width: '25%' }}>Tồn kho</th>
                              <th className="px-4 py-3 text-center text-xs font-bold text-gray-700" style={{ width: '10%' }}></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {formItems.map((item, index) => {
                              const product = stockProducts.find(p => p.id === item.productId);
                              const currentStock = product?.stock || 0;
                              const stockWarning = item.quantity > currentStock;
                              
                              return (
                                <tr key={index} className={`hover:bg-gray-50 ${stockWarning ? 'bg-red-50' : ''}`}>
                                  <td className="px-4 py-3 text-left" style={{ width: '40%' }}>
                                    <p className="text-sm text-gray-900 font-medium">{item.productName}</p>
                                    {stockWarning && (
                                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        Vượt quá tồn kho!
                                      </p>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-center" style={{ width: '25%' }}>
                                    <input
                                      type="number"
                                      min="1"
                                      value={item.quantity}
                                      onChange={(e) => handleUpdateQuantity(index, Number(e.target.value))}
                                      className={`w-20 px-2 py-1.5 text-center border rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent text-sm ${
                                        stockWarning ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                      }`}
                                    />
                                  </td>
                                  <td className="px-4 py-3 text-center" style={{ width: '25%' }}>
                                    <span className={`text-sm font-semibold ${currentStock > 10 ? 'text-green-600' : currentStock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                                      {currentStock}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-center" style={{ width: '10%' }}>
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
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
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
                          Lý do xuất <span className="text-red-500">*</span>
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
                  
                  {/* Payment Summary */}
                  <div className="bg-white rounded-lg p-6 border border-gray-200 sticky top-4">
                    <h4 className="font-semibold text-gray-900 mb-4">Tổng kết</h4>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900">Tổng giá trị:</span>
                      <span className="font-bold text-2xl" style={{ color: '#FE7410' }}>
                        {formatCurrency(calculateTotal())}
                      </span>
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