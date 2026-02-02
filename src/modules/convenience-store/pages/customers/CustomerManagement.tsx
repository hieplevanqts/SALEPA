import { useState, useMemo, useEffect } from 'react';
import { useStore } from '../../../../lib/convenience-store-lib/store';
import type { Customer } from '../../../../lib/convenience-store-lib/store';
import { 
  Plus, Search, Eye, Edit, Trash2, Users, Phone, MapPin, 
  ShoppingBag, CreditCard, TrendingUp, DollarSign, 
  ArrowUpDown, Grid3x3, List, FileSpreadsheet, Award, UserCheck
} from 'lucide-react';
import { CustomerForm } from '../../components/customers/CustomerForm';
import { CustomerDetailView } from '../../components/customers/CustomerDetailView';
import { useTranslation } from '../../../../lib/convenience-store-lib/useTranslation';
import { Pagination } from '../../components/pagination/Pagination';

interface CustomerManagementProps {
  onViewOrder?: (orderId: string) => void;
}

type ViewMode = 'grid' | 'list';
type SortField = 'name' | 'recent' | 'totalSpent';
type SortOrder = 'asc' | 'desc';

// Helper function to get customer avatar from initials
const getCustomerAvatar = (name: string): string => {
  const initials = name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  // Create a color based on name hash
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='hsl(${hue}, 65%25, 85%25)' width='80' height='80'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Inter, sans-serif' font-size='28' font-weight='600' fill='hsl(${hue}, 65%25, 35%25)'%3E${initials}%3C/text%3E%3C/svg%3E`;
};

export function CustomerManagement({ onViewOrder }: CustomerManagementProps = {}) {
  const { t } = useTranslation();
  const { customers, customerTypes, deleteCustomer, orders, addCustomer, createCustomerTreatmentPackage, createAppointment } = useStore();
  
  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filterType, setFilterType] = useState('all');
  
  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Calculate customers with stats from orders
  const customersWithStats = useMemo(() => {
    return customers
      .filter(customer => !customer.deleted_at)
      .map(customer => {
        const customerOrders = orders.filter(order => 
          order.customerPhone === customer.phone && order.status !== 'cancelled'
        );
        const totalPaid = customerOrders.reduce((sum, order) => {
          const received = order.receivedAmount || order.paidAmount || 0;
          const cappedReceived = received > order.total ? order.total : received;
          return sum + cappedReceived;
        }, 0);
        const debt = (customer.total_spent || 0) - totalPaid;
        
        // Merge metadata fields to top level for easier access
        return {
          ...customer,
          ...customer.metadata, // Spread metadata fields to top level
          totalPaid,
          debt,
        };
      });
  }, [customers, orders]);

  // Statistics
  const stats = useMemo(() => {
    const totalCustomers = customersWithStats.length;
    const totalRevenue = customersWithStats.reduce((sum, c) => sum + (c.total_spent || 0), 0);
    const totalDebt = customersWithStats.reduce((sum, c) => sum + (c.debt || 0), 0);
    const totalOrders = customersWithStats.reduce((sum, c) => sum + (c.total_orders || 0), 0);
    const vipCustomers = customersWithStats.filter(c => {
      const typeObj = customerTypes.find(t => t._id === c.customer_type_id || t.id === c.customer_type_id);
      return typeObj?.name?.toLowerCase().includes('vip');
    }).length;
    
    return { totalCustomers, totalRevenue, totalDebt, totalOrders, vipCustomers };
  }, [customersWithStats, customerTypes]);

  // Filter and sort
  const filteredCustomers = useMemo(() => {
    let result = customersWithStats.filter((customer) => {
      const matchSearch = 
        (customer.full_name || customer.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (customer.phone || '').includes(searchQuery) ||
        (customer.address || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchType = filterType === 'all' || customer.customer_type_id === filterType;
      
      return matchSearch && matchType;
    });

    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = (a.full_name || a.name || '').localeCompare(b.full_name || b.name || '', 'vi');
      } else if (sortField === 'recent') {
        comparison = new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      } else if (sortField === 'totalSpent') {
        comparison = (b.total_spent || 0) - (a.total_spent || 0);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [customersWithStats, searchQuery, sortField, sortOrder, filterType]);

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCustomers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCustomers, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortField, filterType]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowForm(true);
  };

  const handleView = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetail(true);
  };

  const handleDeleteClick = (customer: Customer) => {
    setCustomerToDelete(customer);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (customerToDelete) {
      deleteCustomer(customerToDelete._id);
      setShowDeleteConfirm(false);
      setCustomerToDelete(null);
    }
  };

  const handleAddNew = () => {
    setSelectedCustomer(null);
    setShowForm(true);
  };

  // If viewing detail, show the detail view
  if (showDetail && selectedCustomer) {
    return (
      <CustomerDetailView
        customer={selectedCustomer}
        onClose={() => {
          setShowDetail(false);
          setSelectedCustomer(null);
        }}
        onEdit={() => {
          setShowDetail(false);
          handleEdit(selectedCustomer);
        }}
        onDelete={() => {
          setShowDetail(false);
          handleDeleteClick(selectedCustomer);
        }}
        onViewOrder={(orderId) => {
          if (onViewOrder) {
            onViewOrder(orderId);
          } else {
            console.log('View order:', orderId);
            alert(`Tính năng xem chi tiết đơn hàng #${orderId.slice(-8).toUpperCase()} sẽ được triển khai trong phiên bản tiếp theo.`);
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {t.customerData?.title || 'Quản lý khách hàng'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            {filteredCustomers.length} / {customers.length} khách hàng
          </p>
        </div>
        
        <button
          onClick={handleAddNew}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FE7410] text-white rounded-lg hover:bg-[#E56809] transition-colors text-sm sm:text-base w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span className="sm:inline">Thêm Mới</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {/* Card 1 - Total Customers */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Tổng khách hàng</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.totalCustomers}</div>
        </div>

        {/* Card 2 - Total Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Tổng doanh thu</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {stats.totalRevenue.toLocaleString('vi-VN')}₫
          </div>
        </div>

        {/* Card 3 - Total Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Tổng số đơn hàng</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {stats.totalOrders}
          </div>
        </div>

        {/* Card 4 - VIP Customers */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Tổng đơn hàng</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {stats.totalOrders}
          </div>
        </div>
        
      </div>

      {/* Filters and View Controls */}
      <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-4 sm:mb-6">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          {/* Left side - Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm theo tên, SĐT, địa chỉ..."
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
            
            {/* Filter by Type */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Tất cả loại KH</option>
              {customerTypes.map(type => (
                <option key={type._id || type.id} value={type._id || type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* Right side - View Mode and Sort */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-600 text-[#FE7410] shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                title="List view"
              >
                <List className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-600 text-[#FE7410] shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                title="Grid view"
              >
                <Grid3x3 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer List */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center">
          <Users className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
            {customers.length === 0 ? 'Chưa có khách hàng' : 'Không tìm thấy khách hàng'}
          </p>
        </div>
      ) : (
        <>
          {viewMode === 'list' ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#FEF7ED] dark:bg-gray-700/50">
                      <tr>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          <button
                            onClick={() => handleSort('name')}
                            className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white"
                          >
                            KHÁCH HÀNG
                            <ArrowUpDown className="w-4 h-4" />
                          </button>
                        </th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          LIÊN HỆ
                        </th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          LOẠI KH
                        </th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          <button
                            onClick={() => handleSort('totalSpent')}
                            className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white"
                          >
                            CHI TIÊU
                            <ArrowUpDown className="w-4 h-4" />
                          </button>
                        </th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          CÔNG NỢ
                        </th>
                        <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          HÀNH ĐỘNG
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800">
                      {paginatedCustomers.map((customer) => {
                        const customerType = customerTypes.find(t => t._id === customer.customer_type_id || t.id === customer.customer_type_id);
                        return (
                          <tr 
                            key={customer._id}
                            className="transition-colors hover:bg-[#FEF7ED] dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 last:border-0"
                          >
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <img
                                  src={getCustomerAvatar(customer.full_name || customer.name || 'N/A')}
                                  alt={customer.full_name || customer.name}
                                  className="w-12 h-12 rounded-full flex-shrink-0"
                                />
                                <div className="min-w-0">
                                  <div className="font-semibold text-gray-900 dark:text-white text-[15px]">
                                    {customer.full_name || customer.name || '—'}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {customer.total_orders || 0} đơn hàng
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-[15px] text-gray-700 dark:text-gray-300">
                                  <Phone className="w-4 h-4 text-gray-400" />
                                  {customer.phone || '—'}
                                </div>
                                {customer.address && (
                                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                    <MapPin className="w-3 h-3 text-gray-400" />
                                    <span className="line-clamp-1">{customer.address}</span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              {customerType ? (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                                  {customerType.name}
                                </span>
                              ) : (
                                <span className="text-gray-400 dark:text-gray-500 text-[15px]">—</span>
                              )}
                            </td>
                            <td className="px-6 py-5">
                              <div className="text-[15px] font-semibold text-gray-900 dark:text-white">
                                {(customer.total_spent || 0).toLocaleString('vi-VN')}₫
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className={`text-[15px] font-semibold ${
                                (customer.debt || 0) > 0 
                                  ? 'text-red-600 dark:text-red-400' 
                                  : 'text-green-600 dark:text-green-400'
                              }`}>
                                {(customer.debt || 0).toLocaleString('vi-VN')}₫
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleView(customer)}
                                  className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                  title="Xem chi tiết"
                                >
                                  <Eye className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleEdit(customer)}
                                  className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                  title="Sửa"
                                >
                                  <Edit className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(customer)}
                                  className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                  title="Xóa"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Desktop Pagination */}
                {filteredCustomers.length > 0 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredCustomers.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                  />
                )}
              </div>

              {/* Mobile Compact List View */}
              <div className="md:hidden space-y-3">
                {paginatedCustomers.map((customer) => {
                  const customerType = customerTypes.find(t => t._id === customer.customer_type_id || t.id === customer.customer_type_id);
                  return (
                    <div
                      key={customer._id}
                      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
                    >
                      <div className="flex gap-3">
                        {/* Avatar */}
                        <img
                          src={getCustomerAvatar(customer.full_name || customer.name || 'N/A')}
                          alt={customer.full_name || customer.name}
                          className="w-16 h-16 rounded-full flex-shrink-0"
                        />

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 line-clamp-1">
                            {customer.full_name || customer.name || '—'}
                          </h3>
                          <div className="space-y-0.5 text-xs text-gray-600 dark:text-gray-400 mb-2">
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3 h-3" />
                              {customer.phone || '—'}
                            </div>
                            {customerType && (
                              <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                                {customerType.name}
                              </div>
                            )}
                          </div>
                          
                          {/* Stats */}
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Chi tiêu</div>
                              <div className="text-sm font-bold text-[#FE7410]">
                                {(customer.total_spent || 0).toLocaleString('vi-VN')}₫
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Công nợ</div>
                              <div className={`text-sm font-bold ${
                                (customer.debt || 0) > 0 
                                  ? 'text-red-600 dark:text-red-400' 
                                  : 'text-green-600 dark:text-green-400'
                              }`}>
                                {(customer.debt || 0).toLocaleString('vi-VN')}₫
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <button
                          onClick={() => handleView(customer)}
                          className="flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-xs font-medium"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Xem
                        </button>
                        <button
                          onClick={() => handleEdit(customer)}
                          className="flex items-center justify-center gap-1 px-2 py-1.5 bg-orange-50 dark:bg-orange-900/20 text-[#FE7410] rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors text-xs font-medium"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteClick(customer)}
                          className="flex items-center justify-center gap-1 px-2 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-xs font-medium"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Xóa
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Mobile Pagination */}
                {filteredCustomers.length > 0 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredCustomers.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                  />
                )}
              </div>
            </>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedCustomers.map((customer) => {
                const customerType = customerTypes.find(t => t._id === customer.customer_type_id || t.id === customer.customer_type_id);
                return (
                  <div
                    key={customer._id}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Avatar Section */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-6 flex items-center justify-center">
                      <img
                        src={getCustomerAvatar(customer.full_name || customer.name || 'N/A')}
                        alt={customer.full_name || customer.name}
                        className="w-24 h-24 rounded-full shadow-lg"
                      />
                    </div>

                    {/* Info Section */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate text-center">
                        {customer.full_name || customer.name || '—'}
                      </h3>
                      
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <Phone className="w-4 h-4" />
                        {customer.phone || '—'}
                      </div>

                      {customerType && (
                        <div className="flex justify-center mb-3">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                            {customerType.name}
                          </span>
                        </div>
                      )}

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                        <div className="text-center">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Chi tiêu</div>
                          <div className="text-sm font-bold text-[#FE7410]">
                            {(customer.total_spent || 0).toLocaleString('vi-VN')}₫
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {customer.total_orders || 0} đơn
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Công nợ</div>
                          <div className={`text-sm font-bold ${
                            (customer.debt || 0) > 0 
                              ? 'text-red-600 dark:text-red-400' 
                              : 'text-green-600 dark:text-green-400'
                          }`}>
                            {(customer.debt || 0).toLocaleString('vi-VN')}₫
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(customer)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          Xem
                        </button>
                        <button
                          onClick={() => handleEdit(customer)}
                          className="p-2 bg-orange-50 dark:bg-orange-900/20 text-[#FE7410] rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(customer)}
                          className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Grid Pagination */}
              {filteredCustomers.length > 0 && (
                <div className="col-span-full">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredCustomers.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                  />
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Customer Form Modal */}
      {showForm && (
        <CustomerForm
          customer={selectedCustomer}
          onClose={() => {
            setShowForm(false);
            setSelectedCustomer(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && customerToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6">
              <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">
                Xác nhận xóa
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Bạn có chắc chắn muốn xóa khách hàng "{customerToDelete.full_name || customerToDelete.name}" không?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setCustomerToDelete(null);
                  }}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium text-gray-700 dark:text-gray-300"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeleteConfirm}
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

export default CustomerManagement;