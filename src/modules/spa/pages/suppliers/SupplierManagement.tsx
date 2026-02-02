import { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X, Building2 } from 'lucide-react';
import { useStore } from '../../../../lib/spa-lib/store';
import type { Supplier } from '../../../../lib/spa-lib/store';
import { useTranslation } from '../../../../lib/spa-lib/useTranslation';
import { Pagination } from '../../components/common/Pagination';
import { toast } from 'sonner';

export default function SupplierManagement() {
  const { t } = useTranslation();
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, currentUser } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    taxCode: '',
    notes: '',
    isActive: true,
  });
  
  // Filtered suppliers
  const filteredSuppliers = useMemo(() => {
    let filtered = suppliers;
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.taxCode?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(s => 
        filterStatus === 'active' ? s.isActive : !s.isActive
      );
    }
    
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [suppliers, searchQuery, filterStatus]);
  
  // Pagination
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSuppliers = filteredSuppliers.slice(startIndex, endIndex);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      taxCode: '',
      notes: '',
      isActive: true,
    });
    setEditingSupplier(null);
  };
  
  const handleOpenForm = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        name: supplier.name,
        contactPerson: supplier.contactPerson || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || '',
        taxCode: supplier.taxCode || '',
        notes: supplier.notes || '',
        isActive: supplier.isActive,
      });
    } else {
      resetForm();
    }
    setShowForm(true);
  };
  
  const handleCloseForm = () => {
    setShowForm(false);
    resetForm();
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên nhà cung cấp');
      return;
    }
    
    const supplierData = {
      name: formData.name.trim(),
      contactPerson: formData.contactPerson.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      email: formData.email.trim() || undefined,
      address: formData.address.trim() || undefined,
      taxCode: formData.taxCode.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      isActive: formData.isActive,
      createdBy: currentUser?.username || 'system',
    };
    
    if (editingSupplier) {
      updateSupplier(editingSupplier.id, supplierData);
      toast.success('Cập nhật nhà cung cấp thành công');
    } else {
      addSupplier(supplierData);
      toast.success('Thêm nhà cung cấp thành công');
    }
    
    handleCloseForm();
  };
  
  const handleDelete = (supplier: Supplier) => {
    setDeletingSupplier(supplier);
    setShowDeleteConfirm(true);
  };
  
  const confirmDelete = () => {
    if (deletingSupplier) {
      deleteSupplier(deletingSupplier.id);
      toast.success('Xóa nhà cung cấp thành công');
      setShowDeleteConfirm(false);
      setDeletingSupplier(null);
    }
  };
  
  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
        isActive
          ? 'bg-green-100 text-green-700'
          : 'bg-gray-100 text-gray-700'
      }`}>
        {isActive ? 'Hoạt động' : 'Không hoạt động'}
      </span>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h2 className="page-title">Quản lý nhà cung cấp</h2>
          <p className="text-gray-500 text-sm mt-2">
            {filteredSuppliers.length} / {suppliers.length} nhà cung cấp
          </p>
        </div>
        
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 px-4 py-2.5 text-white rounded-lg transition-colors font-medium"
          style={{ backgroundColor: '#FE7410' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E56809'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FE7410'}
        >
          <Plus className="w-5 h-5" />
          Thêm nhà cung cấp
        </button>
      </div>
      
      {/* Search and Filters - Single Row */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, người liên hệ, SĐT, email, mã số thuế..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
          </select>
        </div>
      </div>
      
      {/* Supplier Table */}
      {filteredSuppliers.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">
            {suppliers.length === 0 ? 'Chưa có nhà cung cấp' : 'Không tìm thấy nhà cung cấp'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="modern-table">
              <thead>
                <tr>
                  <th className="table-header">Tên nhà cung cấp</th>
                  <th className="table-header">Người liên hệ</th>
                  <th className="table-header">Số điện thoại</th>
                  <th className="table-header">Email</th>
                  <th className="table-header">Địa chỉ</th>
                  <th className="table-header">Mã số thuế</th>
                  <th className="table-header">Trạng thái</th>
                  <th className="table-header">Ngày tạo</th>
                  <th className="table-header actions-left">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSuppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td className="table-content">
                      <div className="font-medium text-gray-900">{supplier.name}</div>
                    </td>
                    <td className="table-content">
                      {supplier.contactPerson || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="table-content">
                      {supplier.phone || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="table-content">
                      {supplier.email || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="table-content">
                      {supplier.address || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="table-content">
                      {supplier.taxCode || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="table-content">
                      {getStatusBadge(supplier.isActive)}
                    </td>
                    <td className="table-content">
                      {new Date(supplier.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="table-content actions-left">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenForm(supplier)}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Sửa"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(supplier)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
          
          {/* Pagination */}
          {filteredSuppliers.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredSuppliers.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          )}
        </div>
      )}
      
      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full my-8" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
            {/* Header */}
            <div className="sticky top-0 bg-[#FE7410] text-white px-6 py-4 flex justify-between items-center rounded-t-lg z-10">
              <h3 className="text-xl font-bold">
                {editingSupplier ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp'}
              </h3>
              <button
                onClick={handleCloseForm}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Form */}
            <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(100vh - 12rem)' }}>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Basic Information */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Thông tin cơ bản</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="col-span-2">
                      <label className="block text-gray-700 mb-2">
                        Tên nhà cung cấp <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Nhập tên nhà cung cấp"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                        required
                      />
                    </div>
                    
                    {/* Contact Person */}
                    <div>
                      <label className="block text-gray-700 mb-2">Người liên hệ</label>
                      <input
                        type="text"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                        placeholder="Nhập tên người liên hệ"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                      />
                    </div>
                    
                    {/* Phone */}
                    <div>
                      <label className="block text-gray-700 mb-2">Số điện thoại</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Nhập số điện thoại"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                      />
                    </div>
                    
                    {/* Email */}
                    <div className="col-span-2">
                      <label className="block text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Nhập email"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                      />
                    </div>
                    
                    {/* Address */}
                    <div className="col-span-2">
                      <label className="block text-gray-700 mb-2">Địa chỉ</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Nhập địa chỉ"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                      />
                    </div>
                    
                    {/* Tax Code */}
                    <div>
                      <label className="block text-gray-700 mb-2">Mã số thuế</label>
                      <input
                        type="text"
                        value={formData.taxCode}
                        onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
                        placeholder="Nhập mã số thuế"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                      />
                    </div>
                    
                    {/* Status */}
                    <div>
                      <label className="block text-gray-700 mb-2">Trạng thái</label>
                      <select
                        value={formData.isActive ? 'active' : 'inactive'}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                      >
                        <option value="active">Hoạt động</option>
                        <option value="inactive">Không hoạt động</option>
                      </select>
                    </div>
                    
                    {/* Notes */}
                    <div className="col-span-2">
                      <label className="block text-gray-700 mb-2">Ghi chú</label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Nhập ghi chú (nếu có)"
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent resize-none"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3 rounded-b-lg">
              <button
                onClick={handleCloseForm}
                type="button"
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                type="submit"
                className="px-6 py-2.5 text-white rounded-lg transition-colors"
                style={{ backgroundColor: '#FE7410' }}
              >
                {editingSupplier ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deletingSupplier && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6">
              <h3 className="text-xl font-bold text-red-600 mb-4">Xác nhận xóa</h3>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn xóa nhà cung cấp <strong>{deletingSupplier.name}</strong> không?
              </p>
              
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-6 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
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
