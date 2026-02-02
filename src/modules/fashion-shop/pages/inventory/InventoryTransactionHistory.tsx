import { useState, useMemo, useEffect } from 'react';
import { History, Search, Filter, Download, ChevronDown, Calendar, TrendingUp, TrendingDown, Package, FileText, User, Clock } from 'lucide-react';
import { api } from '../../../../lib/fashion-shop-lib/api';
import { useTranslation } from '../../../../lib/fashion-shop-lib/useTranslation';
import { Pagination } from '../../components/common/Pagination';
import { toast } from 'sonner';
import type { InventoryTransaction } from '../../../../lib/fashion-shop-lib/inventoryTypes';
import type { Product, ProductVariant } from '../../../../lib/fashion-shop-lib/mockProductData_fashion_only';

// Transaction type labels và màu sắc
const TRANSACTION_TYPES = {
  opening: { label: 'Tồn đầu kỳ', color: 'bg-purple-100 text-purple-800', icon: '📦' },
  sale_out: { label: 'Bán hàng', color: 'bg-red-100 text-red-800', icon: '🛒' },
  purchase_in: { label: 'Nhập hàng', color: 'bg-green-100 text-green-800', icon: '📥' },
  adjust: { label: 'Điều chỉnh', color: 'bg-yellow-100 text-yellow-800', icon: '⚖️' },
  stocktake: { label: 'Kiểm kê', color: 'bg-blue-100 text-blue-800', icon: '📊' },
  return_in: { label: 'Khách trả hàng', color: 'bg-teal-100 text-teal-800', icon: '↩️' },
  damage_out: { label: 'Xuất hủy', color: 'bg-orange-100 text-orange-800', icon: '🗑️' },
  return_out: { label: 'Trả NCC', color: 'bg-indigo-100 text-indigo-800', icon: '↪️' },
} as const;

export function InventoryTransactionHistory() {
  const { t } = useTranslation();
  
  // Data states
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterProduct, setFilterProduct] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  // UI states
  const [showFilters, setShowFilters] = useState(true);
  
  // Load data
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    setLoading(true);
    try {
      const [txnRes, prodRes, varRes] = await Promise.all([
        api.getInventoryTransactions(),
        api.getProducts(),
        api.getProductVariants(),
      ]);
      
      if (txnRes.success && txnRes.data) {
        // Sort by created_at descending (newest first)
        const sorted = [...txnRes.data].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setTransactions(sorted);
      }
      
      if (prodRes.success && prodRes.data) setProducts(prodRes.data);
      if (varRes.success && varRes.data) setVariants(varRes.data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      toast.error('Không thể tải dữ liệu giao dịch');
    } finally {
      setLoading(false);
    }
  };
  
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
      case 'year': {
        const yearAgo = new Date(today);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        return { start: yearAgo, end: new Date() };
      }
      default:
        return null;
    }
  };
  
  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];
    
    // Filter by search query (SKU, product name, notes)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(txn => {
        const variant = variants.find(v => v._id === txn.variant_id);
        const product = products.find(p => p._id === txn.product_id);
        
        return (
          variant?.sku?.toLowerCase().includes(query) ||
          variant?.barcode?.toLowerCase().includes(query) ||
          product?.title?.toLowerCase().includes(query) ||
          txn.notes?.toLowerCase().includes(query) ||
          txn.ref_id?.toLowerCase().includes(query)
        );
      });
    }
    
    // Filter by transaction type
    if (filterType !== 'all') {
      result = result.filter(txn => txn.type === filterType);
    }
    
    // Filter by product
    if (filterProduct !== 'all') {
      result = result.filter(txn => txn.product_id === filterProduct);
    }
    
    // Filter by date range
    const dateRange = getDateRange();
    if (dateRange) {
      result = result.filter(txn => {
        const txnDate = new Date(txn.created_at);
        return txnDate >= dateRange.start && txnDate <= dateRange.end;
      });
    }
    
    return result;
  }, [transactions, searchQuery, filterType, filterProduct, filterDate, customStartDate, customEndDate, variants, products]);
  
  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(start, start + itemsPerPage);
  }, [filteredTransactions, currentPage, itemsPerPage]);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType, filterProduct, filterDate, customStartDate, customEndDate]);
  
  // Get variant info
  const getVariantInfo = (variantId: string) => {
    const variant = variants.find(v => v._id === variantId);
    const product = products.find(p => p._id === variant?.product_id);
    return { variant, product };
  };
  
  // Statistics
  const stats = useMemo(() => {
    const totalIn = filteredTransactions
      .filter(t => t.qty > 0)
      .reduce((sum, t) => sum + t.qty, 0);
    
    const totalOut = filteredTransactions
      .filter(t => t.qty < 0)
      .reduce((sum, t) => sum + Math.abs(t.qty), 0);
    
    const uniqueVariants = new Set(filteredTransactions.map(t => t.variant_id)).size;
    
    return { totalIn, totalOut, uniqueVariants, total: filteredTransactions.length };
  }, [filteredTransactions]);
  
  // Format date
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };
  
  // Export to CSV
  const handleExport = () => {
    try {
      // Prepare CSV data
      const headers = ['Ngày giờ', 'Loại giao dịch', 'SKU', 'Sản phẩm', 'Số lượng', 'Tồn trước', 'Tồn sau', 'Chứng từ', 'Ghi chú'];
      
      const rows = filteredTransactions.map(txn => {
        const { variant, product } = getVariantInfo(txn.variant_id);
        const { date, time } = formatDateTime(txn.created_at);
        const typeLabel = TRANSACTION_TYPES[txn.type as keyof typeof TRANSACTION_TYPES]?.label || txn.type;
        
        return [
          `${date} ${time}`,
          typeLabel,
          variant?.sku || 'N/A',
          product?.title || 'N/A',
          txn.qty > 0 ? `+${txn.qty}` : txn.qty.toString(),
          txn.before_on_hand,
          txn.after_on_hand,
          txn.ref_id || '',
          txn.notes || ''
        ];
      });
      
      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      // Download file
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `lich-su-ton-kho-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      toast.success('Đã xuất file Excel thành công');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Không thể xuất file');
    }
  };
  
  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FE7410] mx-auto mb-4"></div>
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
          <h2 className="page-title">
            Lịch sử biến động tồn kho
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Theo dõi mọi thay đổi tồn kho theo thời gian thực
          </p>
        </div>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng giao dịch</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng nhập</p>
              <p className="text-2xl font-bold text-green-600">+{stats.totalIn}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng xuất</p>
              <p className="text-2xl font-bold text-red-600">-{stats.totalOut}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">SKU liên quan</p>
              <p className="text-2xl font-bold text-gray-900">{stats.uniqueVariants}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="SKU, Barcode, Sản phẩm, Ghi chú, Chứng từ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời gian
              </label>
              <select
                value={filterDate}
                onChange={(e) => {
                  setFilterDate(e.target.value);
                  if (e.target.value !== 'custom') {
                    setCustomStartDate('');
                    setCustomEndDate('');
                  }
                }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
              >
                <option value="all">Tất cả thời gian</option>
                <option value="today">Hôm nay</option>
                <option value="yesterday">Hôm qua</option>
                <option value="week">7 ngày qua</option>
                <option value="month">30 ngày qua</option>
                <option value="year">1 năm qua</option>
                <option value="custom">Tùy chọn</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại giao dịch
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
              >
                <option value="all">Tất cả loại</option>
                {Object.entries(TRANSACTION_TYPES).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          
          {filterDate === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Từ ngày
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đến ngày
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Results Summary */}
      <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200 mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Hiển thị <span className="font-semibold text-gray-900">{paginatedTransactions.length}</span> / <span className="font-semibold text-gray-900">{filteredTransactions.length}</span> giao dịch
          {filteredTransactions.length !== transactions.length && (
            <span className="text-gray-400"> (đã lọc từ {transactions.length} giao dịch)</span>
          )}
        </p>
      </div>
      
      {/* Transactions Table */}
      {paginatedTransactions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <History className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-lg font-medium mb-2">
            {filteredTransactions.length === 0 && searchQuery 
              ? 'Không tìm thấy giao dịch'
              : 'Chưa có giao dịch nào'
            }
          </p>
          <p className="text-sm text-gray-400">
            Giao dịch sẽ được tạo tự động khi bạn bán hàng, nhập kho hoặc xuất kho
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="modern-table">
              <thead>
                <tr>
                  <th className="table-header">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Thời gian
                    </div>
                  </th>
                  <th className="table-header">Loại giao dịch</th>
                  <th className="table-header">SKU</th>
                  <th className="table-header">Sản phẩm</th>
                  <th className="table-header text-center">Số lượng</th>
                  <th className="table-header text-center">Tồn trước</th>
                  <th className="table-header text-center">Tồn sau</th>
                  <th className="table-header">Chứng từ</th>
                  <th className="table-header">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.map((txn) => {
                  const { variant, product } = getVariantInfo(txn.variant_id);
                  const { date, time } = formatDateTime(txn.created_at);
                  const typeInfo = TRANSACTION_TYPES[txn.type as keyof typeof TRANSACTION_TYPES];
                  const isPositive = txn.qty > 0;
                  
                  return (
                    <tr key={txn._id} className="hover:bg-gray-50">
                      <td className="table-content">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{date}</div>
                          <div className="text-xs text-gray-500">{time}</div>
                        </div>
                      </td>
                      <td className="table-content">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${typeInfo?.color || 'bg-gray-100 text-gray-800'}`}>
                          <span>{typeInfo?.icon}</span>
                          {typeInfo?.label || txn.type}
                        </span>
                      </td>
                      <td className="table-content">
                        <span className="font-mono text-sm font-medium text-gray-900">
                          {variant?.sku || 'N/A'}
                        </span>
                      </td>
                      <td className="table-content">
                        <div className="max-w-xs">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product?.title || 'N/A'}
                          </p>
                          {variant?.title && (
                            <p className="text-xs text-gray-500 truncate">
                              {variant.title}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="table-content text-center">
                        <span className={`inline-flex items-center gap-0.5 px-2 py-1 rounded-lg text-sm font-bold ${
                          isPositive 
                            ? 'bg-green-50 text-green-700' 
                            : 'bg-red-50 text-red-700'
                        }`}>
                          {isPositive ? (
                            <>
                              <TrendingUp className="w-4 h-4" />
                              +{txn.qty}
                            </>
                          ) : (
                            <>
                              <TrendingDown className="w-4 h-4" />
                              {txn.qty}
                            </>
                          )}
                        </span>
                      </td>
                      <td className="table-content text-center">
                        <span className="text-sm text-gray-600">
                          {txn.before_on_hand}
                        </span>
                      </td>
                      <td className="table-content text-center">
                        <span className="text-sm font-semibold text-gray-900">
                          {txn.after_on_hand}
                        </span>
                      </td>
                      <td className="table-content">
                        {txn.ref_id ? (
                          <span className="inline-flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                            <FileText className="w-3 h-3" />
                            {txn.ref_id}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="table-content">
                        <div className="max-w-xs">
                          <p className="text-sm text-gray-600 truncate" title={txn.notes || ''}>
                            {txn.notes || '-'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredTransactions.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredTransactions.length}
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
  );
}