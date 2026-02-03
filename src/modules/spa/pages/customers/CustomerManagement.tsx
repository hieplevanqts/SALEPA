import { useState, useMemo, useEffect } from 'react';
import { useStore } from '../../../../lib/spa-lib/store';
import type { Customer, Order } from '../../../../lib/spa-lib/store';
import { Plus, Search, Eye, Edit, Trash2, Users, Download, Upload } from 'lucide-react';
import { CustomerForm } from '../../components/forms/CustomerForm';
import { CustomerDetailView } from './CustomerDetailView';
import { ImportCustomers } from './ImportCustomers';
import { useTranslation } from '../../../../lib/spa-lib/useTranslation';
import { Pagination } from '../../components/common/Pagination';

interface CustomerManagementProps {
  onViewOrder?: (orderId: string) => void;
}

export function CustomerManagement({ onViewOrder }: CustomerManagementProps = {}) {
  const { t } = useTranslation();
  const { customers, deleteCustomer, orders, customerGroups } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'recent' | 'totalSpent' | 'debt'>('name');
  const [filterGroupId, setFilterGroupId] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const getPaidAmount = (order: Order) =>
    order.receivedAmount ??
    (order as { paidAmount?: number }).paidAmount ??
    0;

  // Calculate customer stats from orders
  const customersWithStats = useMemo(() => {
    return customers.map(customer => {
      const customerOrders = orders.filter(order => 
        order.customerPhone === customer.phone && order.status !== 'cancelled'
      );
      const totalSpent = customerOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const totalPaid = customerOrders.reduce((sum, order) => {
        const received = getPaidAmount(order);
        const cappedReceived = received > order.total ? order.total : received;
        return sum + cappedReceived;
      }, 0);
      const debt = totalSpent - totalPaid;
      const orderCount = customerOrders.length;
      
      return {
        ...customer,
        totalSpent,
        totalPaid,
        debt,
        orderCount,
      };
    });
  }, [customers, orders]);

  // Filter and sort customers
  const filteredCustomers = useMemo(() => {
    let result = customersWithStats.filter((customer) => {
      const matchSearch = 
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery) ||
        customer.address?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchSearch;
    });

    // Filter by group
    if (filterGroupId !== 'all') {
      result = result.filter(customer => customer.customerGroupId === filterGroupId);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name, 'vi');
      } else if (sortBy === 'recent') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'totalSpent') {
        return (b.totalSpent || 0) - (a.totalSpent || 0);
      } else if (sortBy === 'debt') {
        return (b.debt || 0) - (a.debt || 0);
      }
      return 0;
    });

    return result;
  }, [customersWithStats, searchQuery, sortBy, filterGroupId]);

  // Pagination logic
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, filterGroupId]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
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
      deleteCustomer(customerToDelete.id);
      setShowDeleteConfirm(false);
      setCustomerToDelete(null);
    }
  };

  const handleAddNew = () => {
    setSelectedCustomer(null);
    setShowForm(true);
  };

  // Get customer group name from ID
  const getCustomerGroupName = (groupId?: string) => {
    if (!groupId) return null;
    const group = customerGroups.find(g => g.id === groupId);
    return group ? group.name : null;
  };

  // Export to Excel function
  const handleExportExcel = () => {
    try {
      const { language } = useStore.getState();
      
      // Create CSV content with ALL customer fields (except customerGroup and notes)
      const headers = language === 'vi' 
        ? [
            'Mã KH',
            'Tên khách hàng',
            'Số điện thoại',
            'Email',
            'Địa chỉ',
            'Ngày sinh',
            'Giới tính',
            'Mã số thuế',
            'Tổng chi tiêu',
            'Công nợ',
            'Số đơn hàng',
            'Loại khách hàng',
            'Tên công ty',
            'Người mua',
            'Địa chỉ xuất hóa đơn',
            'Tỉnh/TP',
            'Quận/Huyện',
            'Phường/Xã',
            'Số CMND/CCCD',
            'Ngày tạo',
            'Ngày cập nhật'
          ]
        : [
            'Customer ID',
            'Customer Name',
            'Phone Number',
            'Email',
            'Address',
            'Date of Birth',
            'Gender',
            'Tax Code',
            'Total Spent',
            'Debt',
            'Order Count',
            'Customer Type',
            'Company Name',
            'Buyer Name',
            'Invoice Address',
            'Province',
            'District',
            'Ward',
            'ID Number',
            'Created Date',
            'Updated Date'
          ];
      
      const csvRows = [headers.join(',')];
      
      filteredCustomers.forEach(customer => {
        // Helper function to format gender
        const formatGender = (gender?: string) => {
          if (!gender) return '';
          if (language === 'vi') {
            return gender === 'male' ? 'Nam' : gender === 'female' ? 'Nữ' : 'Khác';
          }
          return gender === 'male' ? 'Male' : gender === 'female' ? 'Female' : 'Other';
        };
        
        // Helper function to format customer type
        const formatCustomerType = (type?: string) => {
          if (!type) return '';
          if (language === 'vi') {
            return type === 'individual' ? 'Cá nhân' : 'Tổ chức';
          }
          return type === 'individual' ? 'Individual' : 'Organization';
        };
        
        const row = [
          `"${customer.id}"`,
          `"${customer.name}"`,
          `"${customer.phone}"`,
          `"${customer.email || ''}"`,
          `"${customer.address || ''}"`,
          `"${customer.dateOfBirth || ''}"`,
          `"${formatGender(customer.gender)}"`,
          `"${customer.taxCode || ''}"`,
          customer.totalSpent || 0,
          customer.debt || 0,
          customer.orderCount || 0,
          `"${formatCustomerType(customer.customerType)}"`,
          `"${customer.companyName || ''}"`,
          `"${customer.buyerName || ''}"`,
          `"${customer.invoiceAddress || ''}"`,
          `"${customer.province || ''}"`,
          `"${customer.district || ''}"`,
          `"${customer.ward || ''}"`,
          `"${customer.idNumber || ''}"`,
          `"${new Date(customer.createdAt).toLocaleDateString('vi-VN')}"`,
          `"${customer.updatedAt ? new Date(customer.updatedAt).toLocaleDateString('vi-VN') : ''}"`
        ];
        csvRows.push(row.join(','));
      });
      
      const csvContent = csvRows.join('\n');
      
      // Create blob and download
      const BOM = '\uFEFF'; // UTF-8 BOM for Excel to recognize Vietnamese characters
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const today = new Date();
      const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
      link.download = `DanhSachKhachHang_${dateStr}.csv`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Show success message
      alert(language === 'vi' 
        ? `✅ Đã xuất ${filteredCustomers.length} khách hàng ra file Excel!`
        : `✅ Exported ${filteredCustomers.length} customers to Excel!`
      );
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      const { language } = useStore.getState();
      alert(language === 'vi' 
        ? '❌ Có lỗi xảy ra khi xuất Excel!'
        : '❌ Error exporting to Excel!'
      );
    }
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
            // TODO: Navigate to order detail
            console.log('View order:', orderId);
            alert(`Tính năng xem chi tiết hóa đơn #${orderId.slice(-8).toUpperCase()} sẽ được triển khai trong phiên bản tiếp theo.`);
          }
        }}
      />
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h2 className="page-title">{t.customerData?.title || 'Quản Lý Khách Hàng'}</h2>
          <p className="text-gray-500 text-sm mt-2">
            {filteredCustomers.length} / {customers.length} {t.customerData?.customers || 'khách hàng'}
          </p>
        </div>
        
        <div className="flex gap-2">
          {/* Export Excel Button */}
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-lg transition-colors font-medium"
            style={{ border: '2px solid #FE7410', color: '#FE7410' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFF7ED'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            <Download className="w-4 h-4" />
            {t.language === 'vi' ? 'Xuất Excel' : 'Export Excel'}
          </button>
          
          {/* Import Excel Button */}
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-lg transition-colors font-medium"
            style={{ border: '2px solid #FE7410', color: '#FE7410' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFF7ED'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            <Upload className="w-5 h-5" />
            {t.language === 'vi' ? 'Nhập Excel' : 'Import Excel'}
          </button>
          
          {/* Add New Customer Button */}
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2.5 text-white rounded-lg transition-colors font-medium"
            style={{ backgroundColor: '#FE7410' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E56809'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FE7410'}
          >
            <Plus className="w-5 h-5" />
            {t.customerData?.addNew || 'Thêm khách hàng'}
          </button>
        </div>
      </div>

      {/* Search and Filters - Single Row */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.customerData?.searchPlaceholder || 'Tìm kiếm theo tên, SĐT, địa chỉ...'}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          
          {/* Group Filter */}
          <select
            value={filterGroupId}
            onChange={(e) => setFilterGroupId(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">Tất cả nhóm khách hàng</option>
            {customerGroups
              .filter(g => g.isActive)
              .map(group => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))
            }
          </select>
          
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="name">{t.customerData?.sortByName || 'Sắp xếp A-Z'}</option>
            <option value="recent">{t.customerData?.sortByRecent || 'Mới nhất'}</option>
            <option value="totalSpent">{t.customerData?.sortBySpent || 'Chi tiêu cao'}</option>
            <option value="debt">{t.customerData?.sortByDebt || 'Công nợ'}</option>
          </select>
        </div>
      </div>

      {/* Customer Table */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">
            {customers.length === 0 ? (t.customerData?.noCustomers || 'Chưa có khách hàng') : (t.customerData?.notFound || 'Không tìm thấy')}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="modern-table">
              <thead>
                <tr>
                  <th className="table-header">{t.customerData?.customerName || 'Tên khách hàng'}</th>
                  <th className="table-header">{t.customerData?.phoneNumber || 'Số điện thoại'}</th>
                  <th className="table-header">Nhóm khách hàng</th>
                  <th className="table-header">{t.customerData?.address || 'Địa chỉ'}</th>
                  <th className="table-header text-right">{t.customerData?.totalSpent || 'Tổng chi tiêu'}</th>
                  <th className="table-header text-right">Công nợ</th>
                  <th className="table-header actions-left">{t.actions || 'Hành động'}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="table-content">
                      <div className="font-medium text-gray-900">{customer.name}</div>
                    </td>
                    <td className="table-content">
                      {customer.phone}
                    </td>
                    <td className="table-content">
                      {getCustomerGroupName(customer.customerGroupId) || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="table-content">
                      {customer.address || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="table-content text-right">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {customer.totalSpent.toLocaleString('vi-VN')}đ
                        </div>
                        <div className="text-xs text-gray-500 text-[14px]">
                          {customer.orderCount} {t.customerData?.orders || 'đơn'}
                        </div>
                      </div>
                    </td>
                    <td className="table-content text-right">
                      <div className={`font-semibold ${customer.debt > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {customer.debt.toLocaleString('vi-VN')}đ
                      </div>
                    </td>
                    <td className="table-content actions-left">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(customer)}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                          title={t.customerData?.viewDetail || 'Xem chi tiết'}
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(customer)}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                          title={t.customerData?.edit || 'Sửa'}
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        {/* Only show delete button if customer has no orders and no debt */}
                        {customer.orderCount === 0 && customer.debt === 0 && (
                          <button
                            onClick={() => handleDeleteClick(customer)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title={t.customerData?.delete || 'Xóa'}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6">
              <h3 className="text-xl font-bold text-red-600 mb-4">
                {t.customerData?.deleteConfirmTitle || 'Xác nhận xóa'}
              </h3>
              <p className="text-gray-600 mb-6">
                {t.language === 'vi' 
                  ? `Bạn có chắc chắn muốn xóa khách hàng "${customerToDelete.name}" không?`
                  : `Are you sure you want to delete customer "${customerToDelete.name}"?`
                }
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setCustomerToDelete(null);
                  }}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-medium text-gray-700"
                >
                  {t.cancel || 'Hủy'}
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-bold"
                >
                  {t.delete || 'Xóa'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Customers Modal */}
      {showImport && (
        <ImportCustomers
          onClose={() => setShowImport(false)}
        />
      )}
    </div>
  );
}

export default CustomerManagement;