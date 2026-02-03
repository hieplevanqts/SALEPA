import { useState, useMemo, useEffect } from 'react';
import { useStore } from '../../../../lib/restaurant-lib/store';
import type { Customer } from '../../../../lib/restaurant-lib/store';
import { Plus, Search, Eye, Edit, Trash2, Users, TestTube, FileDown } from 'lucide-react';
import { CustomerForm } from '../../components/forms/CustomerForm';
import { CustomerDetailView } from './CustomerDetailView';
import { useTranslation } from '../../../../lib/restaurant-lib/useTranslation';
import { Pagination } from '../../components/common/Pagination';
import { demoCustomer, demoTreatmentPackage, demoAppointments } from '../../../../lib/restaurant-lib/demoCustomerWithPackage';
import * as XLSX from 'xlsx';

interface CustomerManagementProps {
  onViewOrder?: (orderId: string) => void;
  onShowProfileMenu?: () => void;
}

export function CustomerManagement({ onViewOrder, onShowProfileMenu }: CustomerManagementProps = {}) {
  const { t } = useTranslation();
  const { customers, deleteCustomer, orders, addCustomer, createCustomerTreatmentPackage, createAppointment } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'recent' | 'totalSpent' | 'debt'>('name');
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Calculate customer stats from orders
  const customersWithStats = useMemo(() => {
    return customers.map(customer => {
      const customerOrders = orders.filter(order => 
        order.customerPhone === customer.phone && order.status !== 'cancelled'
      );
      const totalSpent = customerOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const totalPaid = customerOrders.reduce((sum, order) => {
        const received = order.receivedAmount || order.paidAmount || 0;
        // Cap received amount at order total for calculation
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
  }, [customersWithStats, searchQuery, sortBy]);

  // Pagination logic
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

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

  const getCustomerGroupLabel = (group?: string) => {
    switch (group) {
      case 'vip': return 'VIP';
      case 'acquaintance': return t.customerData?.acquaintance || 'Quen';
      case 'employee': return t.customerData?.employee || 'NV';
      default: return t.customerData?.regular || 'Thường';
    }
  };

  // Export to Excel function
  const handleExportExcel = () => {
    try {
      // Prepare data for export
      const dataToExport = filteredCustomers.map((customer, index) => ({
        'STT': index + 1,
        'Tên khách hàng': customer.name,
        'Số điện thoại': customer.phone,
        'Địa chỉ': customer.address || '',
        'Email': customer.email || '',
        'Nhóm khách hàng': getCustomerGroupLabel(customer.customerGroup),
        'Tổng chi tiêu (đ)': customer.totalSpent,
        'Đã thanh toán (đ)': customer.totalPaid,
        'Công nợ (đ)': customer.debt,
        'Số đơn hàng': customer.orderCount,
        'Ngày tạo': new Date(customer.createdAt).toLocaleDateString('vi-VN'),
        'Ghi chú': customer.notes || '',
      }));

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);

      // Set column widths
      worksheet['!cols'] = [
        { wch: 5 },  // STT
        { wch: 25 }, // Tên
        { wch: 15 }, // SĐT
        { wch: 35 }, // Địa chỉ
        { wch: 25 }, // Email
        { wch: 15 }, // Nhóm
        { wch: 18 }, // Tổng chi tiêu
        { wch: 18 }, // Đã thanh toán
        { wch: 15 }, // Công nợ
        { wch: 12 }, // Số đơn
        { wch: 12 }, // Ngày tạo
        { wch: 30 }, // Ghi chú
      ];

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Khách hàng');

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const filename = `Danh_sach_khach_hang_${timestamp}.xlsx`;

      // Export file
      XLSX.writeFile(workbook, filename);

      console.log('✅ Exported', filteredCustomers.length, 'customers to Excel');
    } catch (error) {
      console.error('❌ Error exporting to Excel:', error);
      alert('Có lỗi xảy ra khi xuất Excel!');
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
            alert(`Tính năng xem chi tiết đơn hàng #${orderId.slice(-8).toUpperCase()} sẽ được triển khai trong phiên bản tiếp theo.`);
          }
        }}
        onShowProfileMenu={onShowProfileMenu}
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
            disabled={filteredCustomers.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors font-medium disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed disabled:border-gray-200"
            title="Xuất danh sách khách hàng ra Excel"
          >
            <FileDown className="w-5 h-5" />
            Xuất Excel
          </button>
          
          {/* Load Demo Customer with Treatment Package */}
          <button
            onClick={() => {
              try {
                console.log('🔄 Adding demo data...');
                console.log('📦 Demo package data:', demoTreatmentPackage);
                
                // Remove existing demo if any
                const existing = customers.find(c => c.id === 'DEMO-CUSTOMER-001');
                if (existing) {
                  deleteCustomer('DEMO-CUSTOMER-001');
                  console.log('🗑️ Removed existing demo customer');
                }
                
                // Add customer
                addCustomer(demoCustomer);
                console.log('✅ Added customer:', demoCustomer.name);
                
                // Add treatment package (remove id, createdAt, updatedAt for createCustomerTreatmentPackage)
                if (createCustomerTreatmentPackage) {
                  const { id, createdAt, updatedAt, ...packageData } = demoTreatmentPackage;
                  createCustomerTreatmentPackage(packageData);
                  console.log('✅ Added package:', demoTreatmentPackage.treatmentName);
                  console.log('📦 Package data sent:', packageData);
                } else {
                  console.error('❌ createCustomerTreatmentPackage is not available');
                }
                
                // Add appointments
                if (createAppointment) {
                  demoAppointments.forEach(apt => {
                    const { id, createdAt, updatedAt, ...appointmentData } = apt;
                    createAppointment(appointmentData);
                  });
                  console.log('✅ Added', demoAppointments.length, 'appointments');
                } else {
                  console.error('❌ createAppointment is not available');
                }
                
                // Verify data was added
                setTimeout(() => {
                  const store = useStore.getState();
                  console.log('🔍 Verification:');
                  console.log('- Total customers:', store.customers.length);
                  console.log('- Total packages:', store.customerTreatmentPackages?.length || 0);
                  console.log('- Total appointments:', store.appointments.length);
                  console.log('- Demo customer found:', store.customers.find(c => c.id === 'DEMO-CUSTOMER-001'));
                  console.log('- Demo packages:', store.customerTreatmentPackages?.filter(p => p.customerId === 'DEMO-CUSTOMER-001'));
                }, 100);
                
                alert(`✅ Demo data đã được thêm thành công!\n\n👤 Khách hàng: ${demoCustomer.name}\n📞 SĐT: ${demoCustomer.phone}\n📦 Gói: ${demoTreatmentPackage.treatmentName}\n Đã sử dụng: ${demoTreatmentPackage.usedSessionNumbers.length}/${demoTreatmentPackage.totalSessions} buổi\n📅 Lịch hẹn: ${demoAppointments.length} buổi\n\nTìm kiếm "${demoCustomer.name}" hoặc "${demoCustomer.phone}" để xem chi tiết!`);
                
                // Auto search for the customer
                setSearchQuery(demoCustomer.name);
              } catch (error) {
                console.error('❌ Error adding demo data:', error);
                alert('❌ Có lỗi xảy ra khi thêm demo data!');
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium shadow-lg"
          >
            <TestTube className="w-5 h-5" />
            🎯 Load Demo Customer + Package
          </button>
          
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <button
                          onClick={() => handleDeleteClick(customer)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title={t.customerData?.delete || 'Xóa'}
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
                {t.customerData?.deleteConfirm || 'Xác nhận xóa'}
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
    </div>
  );
}

export default CustomerManagement;