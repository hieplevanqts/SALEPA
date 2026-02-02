import { useState, useMemo, useRef, useEffect } from 'react';
import { Package, Plus, Search, Trash2, X, Printer, ChevronLeft, ChevronRight, ShoppingCart, Receipt, Eye, Edit } from 'lucide-react';
import { useStore } from '../../../../lib/convenience-store-lib/store';
import type { StockInItem, StockInReceipt } from '../../../../lib/convenience-store-lib/store';
import { useTranslation } from '../../../../lib/convenience-store-lib/useTranslation';
import { Pagination } from '../../components/pagination/Pagination';

export function StockInManagement() {
  const { t } = useTranslation();
  const { products, stockInReceipts, createStockInReceipt, updateStockInReceipt, deleteStockInReceipt, currentUser } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<StockInReceipt | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<StockInReceipt | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingReceipt, setDeletingReceipt] = useState<StockInReceipt | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  
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
      (p.name || '').toLowerCase().includes(productSearchQuery.toLowerCase()) ||
      (p.barcode || '').toLowerCase().includes(productSearchQuery.toLowerCase())
    );
  }, [stockProducts, productSearchQuery]);
  
  // Get unique suppliers for filter
  const suppliers = useMemo(() => {
    return Array.from(new Set((stockInReceipts || []).map(r => r.supplier))).filter(Boolean);
  }, [stockInReceipts]);
  
  // Filtered receipts
  const filteredReceipts = useMemo(() => {
    let result = stockInReceipts || [];
    
    if (searchQuery) {
      result = result.filter(r => 
        (r.receiptNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.supplier || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (filterSupplier) {
      result = result.filter(r => r.supplier === filterSupplier);
    }
    
    if (filterDateFrom) {
      result = result.filter(r => r.date >= filterDateFrom);
    }
    
    if (filterDateTo) {
      result = result.filter(r => r.date <= filterDateTo);
    }
    
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [stockInReceipts, searchQuery, filterSupplier, filterDateFrom, filterDateTo]);
  
  // Pagination
  const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage);
  const paginatedReceipts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReceipts.slice(start, start + itemsPerPage);
  }, [filteredReceipts, currentPage, itemsPerPage]);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterSupplier, filterDateFrom, filterDateTo]);
  
  // Reset form
  const resetForm = () => {
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormSupplier('');
    setFormNotes('');
    setFormItems([]);
    setSupplierDiscount(0);
    setEditingReceipt(null);
  };
  
  // Open create form
  const handleCreate = () => {
    resetForm();
    setShowForm(true);
  };
  
  // Open edit form
  const handleEdit = (receipt: StockInReceipt) => {
    setEditingReceipt(receipt);
    setFormDate(receipt.date);
    setFormSupplier(receipt.supplier);
    setFormNotes(receipt.notes || '');
    setFormItems(receipt.items);
    setSupplierDiscount(receipt.supplierDiscount);
    setShowForm(true);
  };
  
  // Open view detail
  const handleViewDetail = (receipt: StockInReceipt) => {
    setViewingReceipt(receipt);
    setShowDetail(true);
  };
  
  // Add product to list
  const handleAddProduct = (productId: string) => {
    const product = stockProducts.find(p => p.id === productId);
    if (!product) return;
    
    // Check if already in list
    const existingIndex = formItems.findIndex(item => item.productId === productId);
    if (existingIndex >= 0) {
      // Just increase quantity
      const newItems = [...formItems];
      newItems[existingIndex].quantity += 1;
      newItems[existingIndex].totalPrice = newItems[existingIndex].quantity * newItems[existingIndex].unitPrice;
      setFormItems(newItems);
    } else {
      // Add new
      const newItem: StockInItem = {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
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
    newItems[index].totalPrice = quantity * newItems[index].unitPrice;
    setFormItems(newItems);
  };
  
  // Update item unit price
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
  
  const handleSubmit = () => {
    if (!formSupplier || formItems.length === 0) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    
    // Validate all items have unit price
    const hasInvalidItem = formItems.some(item => item.unitPrice <= 0);
    if (hasInvalidItem) {
      alert('Vui lòng nhập đơn giá cho tất cả sản phẩm!');
      return;
    }
    
    const receiptData = {
      date: formDate,
      supplier: formSupplier,
      items: formItems,
      subtotal: calculateSubtotal(),
      supplierDiscount: supplierDiscount,
      totalAmount: calculateTotal(),
      notes: formNotes,
    };
    
    if (editingReceipt) {
      updateStockInReceipt(editingReceipt.id, receiptData);
    } else {
      createStockInReceipt(receiptData);
    }
    
    // Reset form
    setShowForm(false);
    resetForm();
    setCurrentPage(1);
  };
  
  const handleDeleteClick = (receipt: StockInReceipt) => {
    setDeletingReceipt(receipt);
    setShowDeleteConfirm(true);
  };
  
  const handleConfirmDelete = () => {
    if (deletingReceipt) {
      deleteStockInReceipt(deletingReceipt.id);
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
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Nhập kho</h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            {filteredReceipts.length} / {stockInReceipts?.length || 0} phiếu nhập
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
            <span>Tạo phiếu nhập</span>
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
              placeholder="Tìm mã phiếu, nhà cung cấp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>
          
          {/* Supplier Filter */}
          <select
            value={filterSupplier}
            onChange={(e) => setFilterSupplier(e.target.value)}
            className="px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Tất cả nhà cung cấp</option>
            {suppliers.map(supplier => (
              <option key={supplier} value={supplier}>{supplier}</option>
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
            <Package className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
              {filteredReceipts.length === 0 && searchQuery ? 'Không tìm thấy phiếu nhập' : 'Chưa có phiếu nhập nào'}
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
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Ngày nhập</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Nhà cung cấp</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Số mặt hàng</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Tổng tiền hàng</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Giảm giá NCC</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Thành tiền</th>
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
                          {receipt.supplier}
                        </td>
                        <td className="px-6 py-5 text-center text-[15px] text-gray-900 dark:text-white font-medium">
                          {receipt.items.length}
                        </td>
                        <td className="px-6 py-5 text-right text-[15px] text-gray-900 dark:text-white font-medium">
                          {formatCurrency(receipt.subtotal)}
                        </td>
                        <td className="px-6 py-5 text-right text-[15px]">
                          <span className="text-red-600 dark:text-red-400 font-medium">-{formatCurrency(receipt.supplierDiscount || 0)}</span>
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
                        🏢 {receipt.supplier}
                      </div>
                    </div>
                    <div className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                      {receipt.items.length} SP
                    </div>
                  </div>

                  {/* Receipt Summary */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tổng tiền hàng:</span>
                      <span className="font-medium text-gray-900">{formatCurrency(receipt.subtotal)}</span>
                    </div>
                    {receipt.supplierDiscount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Giảm giá NCC:</span>
                        <span className="font-medium text-red-600">-{formatCurrency(receipt.supplierDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="font-medium text-gray-900">Thành tiền:</span>
                      <span className="font-bold text-[#FE7410] text-base">{formatCurrency(receipt.totalAmount)}</span>
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
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <div className="space-y-6">
                {/* Info Card */}
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
                            <td className="px-4 py-3 text-center text-sm text-gray-600 text-[16px] text-[15px]">{item.quantity}</td>
                            <td className="px-4 py-3 text-right text-sm text-gray-600 text-[16px]">{formatCurrency(item.unitPrice)}</td>
                            <td className="px-4 py-3 text-right text-sm font-bold text-gray-900 text-[16px]">{formatCurrency(item.totalPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Summary */}
                <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tổng tiền hàng:</span>
                      <span className="font-semibold text-gray-900 text-[16px]">{formatCurrency(viewingReceipt.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Giảm giá NCC:</span>
                      <span className="font-semibold text-red-600 text-[16px]">-{formatCurrency(viewingReceipt.supplierDiscount)}</span>
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
                {editingReceipt ? 'Sửa phiếu nhập kho' : 'Tạo phiếu nhập kho'}
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
                      Sản phẩm nhập kho
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
                                  <p className="text-sm font-semibold text-gray-900">{product.stock}</p>
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
                        <Receipt className="w-5 h-5" />
                        Danh sách sản phẩm ({formItems.length})
                      </h4>
                    </div>
                    
                    <div className="max-h-[500px] overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                      {formItems.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm text-gray-500">Chưa có sản phẩm nào</p>
                          <p className="text-xs text-gray-400 mt-1">Tìm và thêm sản phẩm bên trên</p>
                        </div>
                      ) : (
                        <table className="w-full">
                          <thead className="bg-gray-100 sticky top-0">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700" style={{ width: '30%' }}>Sản phẩm</th>
                              <th className="px-4 py-3 text-center text-xs font-bold text-gray-700" style={{ width: '20%' }}>Số lượng</th>
                              <th className="px-4 py-3 text-center text-xs font-bold text-gray-700" style={{ width: '23%' }}>Đơn giá</th>
                              <th className="px-4 py-3 text-center text-xs font-bold text-gray-700" style={{ width: '22%' }}>Thành tiền</th>
                              <th className="px-4 py-3 text-center text-xs font-bold text-gray-700" style={{ width: '5%' }}></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {formItems.map((item, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-left" style={{ width: '30%' }}>
                                  <p className="text-sm text-gray-900 font-medium">{item.productName}</p>
                                </td>
                                <td className="px-4 py-3 text-center" style={{ width: '20%' }}>
                                  <input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => handleUpdateQuantity(index, Number(e.target.value))}
                                    className="w-20 px-2 py-1.5 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent text-sm"
                                  />
                                </td>
                                <td className="px-4 py-3 text-center" style={{ width: '23%' }}>
                                  <input
                                    type="number"
                                    min="0"
                                    value={item.unitPrice}
                                    onChange={(e) => handleUpdateUnitPrice(index, Number(e.target.value))}
                                    placeholder="0"
                                    className="w-28 px-2 py-1.5 text-right border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent text-sm"
                                  />
                                </td>
                                <td className="px-4 py-3 text-center" style={{ width: '22%' }}>
                                  <span className="text-sm font-bold text-gray-900">
                                    {formatCurrency(item.totalPrice)}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center" style={{ width: '5%' }}>
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
                
                {/* Right: Form Info & Summary */}
                <div className="lg:col-span-1 space-y-4">
                  {/* Form Info */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
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
                  
                  {/* Payment Summary */}
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
                disabled={formItems.length === 0 || !formSupplier}
                className="px-6 py-2.5 bg-[#FE7410] text-white rounded-lg hover:bg-[#E56809] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingReceipt ? 'Cập nhật phiếu' : 'Lưu phiếu nhập'} ({formItems.length} SP)
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