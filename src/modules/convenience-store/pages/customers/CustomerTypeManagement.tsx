import { useState, useMemo } from 'react';
import { useStore } from '../../../../lib/convenience-store-lib/store';
import type { CustomerType } from '../../../../lib/convenience-store-lib/store';
import { Search, Plus, Edit, Trash2, ToggleLeft, ToggleRight, X, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Pagination } from '../../components/pagination/Pagination';

export function CustomerTypeManagement() {
  const { customerTypes, addCustomerType, updateCustomerType, deleteCustomerType, toggleCustomerTypeStatus, language } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState<CustomerType | null>(null);
  const [deleteConfirmType, setDeleteConfirmType] = useState<CustomerType | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  // Form states
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    min_spent: 0,
    status: 1,
  });

  const t = language === 'vi' ? {
    title: 'Quản lý Loại Khách hàng',
    addNew: 'Thêm loại khách hàng',
    search: 'Tìm kiếm loại khách hàng...',
    filter: {
      all: 'Tất cả',
      active: 'Đang hoạt động',
      inactive: 'Không hoạt động',
    },
    table: {
      no: 'STT',
      code: 'Mã loại',
      name: 'Tên loại khách hàng',
      minSpent: 'Ngưỡng chi tiêu',
      status: 'Trạng thái',
      createdAt: 'Ngày tạo',
      actions: 'Hành động',
    },
    status: {
      active: 'Đang hoạt động',
      inactive: 'Không hoạt động',
    },
    form: {
      addTitle: 'Thêm loại khách hàng mới',
      editTitle: 'Chỉnh sửa loại khách hàng',
      code: 'Mã loại khách hàng',
      codePlaceholder: 'VD: NEW, VIP, SILVER',
      name: 'Tên loại khách hàng',
      namePlaceholder: 'Nhập tên loại khách hàng',
      minSpent: 'Ngưỡng chi tiêu tối thiểu (VNĐ)',
      minSpentPlaceholder: 'Nhập ngưỡng chi tiêu (VD: 1000000)',
      status: 'Trạng thái',
      cancel: 'Hủy',
      save: 'Lưu',
    },
    messages: {
      addSuccess: 'Thêm loại khách hàng thành công!',
      updateSuccess: 'Cập nhật loại khách hàng thành công!',
      deleteSuccess: 'Xóa loại khách hàng thành công!',
      deleteConfirm: 'Bạn có chắc chắn muốn xóa loại khách hàng này?',
      toggleSuccess: 'Cập nhật trạng thái thành công!',
      codeRequired: 'Vui lòng nhập mã loại khách hàng',
      nameRequired: 'Vui lòng nhập tên loại khách hàng',
    },
    noData: 'Không có loại khách hàng nào',
    delete: 'Xóa',
    confirmDelete: 'Xác nhận xóa',
  } : {
    title: 'Customer Type Management',
    addNew: 'Add Customer Type',
    search: 'Search customer types...',
    filter: {
      all: 'All',
      active: 'Active',
      inactive: 'Inactive',
    },
    table: {
      no: 'No',
      code: 'Code',
      name: 'Customer Type Name',
      minSpent: 'Min Spending',
      status: 'Status',
      createdAt: 'Created At',
      actions: 'Actions',
    },
    status: {
      active: 'Active',
      inactive: 'Inactive',
    },
    form: {
      addTitle: 'Add New Customer Type',
      editTitle: 'Edit Customer Type',
      code: 'Customer Type Code',
      codePlaceholder: 'E.g: NEW, VIP, SILVER',
      name: 'Customer Type Name',
      namePlaceholder: 'Enter customer type name',
      minSpent: 'Minimum Spending (VND)',
      minSpentPlaceholder: 'Enter minimum spending (e.g: 1000000)',
      status: 'Status',
      cancel: 'Cancel',
      save: 'Save',
    },
    messages: {
      addSuccess: 'Customer type added successfully!',
      updateSuccess: 'Customer type updated successfully!',
      deleteSuccess: 'Customer type deleted successfully!',
      deleteConfirm: 'Are you sure you want to delete this customer type?',
      toggleSuccess: 'Status updated successfully!',
      codeRequired: 'Please enter customer type code',
      nameRequired: 'Please enter customer type name',
    },
    noData: 'No customer types found',
    delete: 'Delete',
    confirmDelete: 'Confirm Delete',
  };

  // Filter and search
  const filteredTypes = useMemo(() => {
    let filtered = [...customerTypes];

    // Filter by status
    if (statusFilter === 'active') {
      filtered = filtered.filter(type => type.status === 1);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(type => type.status === 0);
    }

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(type => 
        (type.code || '').toLowerCase().includes(query) ||
        (type.name || '').toLowerCase().includes(query)
      );
    }

    // Sort by priority (descending) then by name
    filtered.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return a.name.localeCompare(b.name);
    });

    return filtered;
  }, [customerTypes, searchQuery, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredTypes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTypes = filteredTypes.slice(startIndex, endIndex);

  const handleAddNew = () => {
    setEditingType(null);
    setFormData({
      code: '',
      name: '',
      min_spent: 0,
      status: 1,
    });
    setShowForm(true);
  };

  const handleEdit = (type: CustomerType) => {
    setEditingType(type);
    setFormData({
      code: type.code,
      name: type.name,
      min_spent: type.min_spent,
      status: type.status,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.code.trim()) {
      toast.error(t.messages.codeRequired);
      return;
    }
    if (!formData.name.trim()) {
      toast.error(t.messages.nameRequired);
      return;
    }

    const customerTypeData = {
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      min_spent: formData.min_spent,
      status: formData.status,
    };

    if (editingType) {
      updateCustomerType(editingType._id, customerTypeData);
      toast.success(t.messages.updateSuccess);
    } else {
      addCustomerType(customerTypeData);
      toast.success(t.messages.addSuccess);
    }

    setShowForm(false);
    setEditingType(null);
  };

  const handleDelete = (type: CustomerType) => {
    setDeleteConfirmType(type);
  };

  const confirmDelete = () => {
    if (deleteConfirmType) {
      deleteCustomerType(deleteConfirmType._id);
      toast.success(t.messages.deleteSuccess);
      setDeleteConfirmType(null);
    }
  };

  const handleToggleStatus = (type: CustomerType) => {
    toggleCustomerTypeStatus(type._id);
    toast.success(t.messages.toggleSuccess);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            {filteredTypes.length} / {customerTypes.length} {language === 'vi' ? 'loại khách hàng' : 'customer types'}
          </p>
        </div>
        
        <button
          onClick={handleAddNew}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FE7410] text-white rounded-lg hover:bg-[#E56609] transition-colors font-medium text-sm sm:text-base w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>{t.addNew}</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-4 sm:mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">{t.filter.all}</option>
            <option value="active">{t.filter.active}</option>
            <option value="inactive">{t.filter.inactive}</option>
          </select>
        </div>
      </div>

      {/* Customer Type List */}
      {filteredTypes.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center">
          <Users className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
            {customerTypes.length === 0 ? (language === 'vi' ? 'Chưa có loại khách hàng' : 'No customer types yet') : t.noData}
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
                    <th className="table-header">{t.table.no}</th>
                    <th className="table-header">{t.table.code}</th>
                    <th className="table-header">{t.table.name}</th>
                    <th className="table-header text-right">{t.table.minSpent}</th>
                    <th className="table-header">{t.table.status}</th>
                    <th className="table-header">{t.table.createdAt}</th>
                    <th className="table-header actions-left">{t.table.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTypes.map((type, index) => (
                    <tr key={type._id} className="hover:bg-[#FEF7ED] dark:hover:bg-[#FE7410]/10 transition-colors">
                      <td className="table-content">{startIndex + index + 1}</td>
                      <td className="table-content">
                        <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-900 dark:text-gray-100 font-medium text-sm">
                          {type.code}
                        </span>
                      </td>
                      <td className="table-content">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{type.name}</div>
                      </td>
                      <td className="table-content text-right">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {(type.min_spent || 0).toLocaleString()}₫
                        </span>
                      </td>
                      <td className="table-content">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                          type.status === 1
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {type.status === 1 ? t.status.active : t.status.inactive}
                        </span>
                      </td>
                      <td className="table-content">
                        {new Date(type.created_at).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}
                      </td>
                      <td className="table-content actions-left">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleStatus(type)}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title={type.status === 1 ? t.status.inactive : t.status.active}
                          >
                            {type.status === 1 ? (
                              <ToggleRight className="w-5 h-5" />
                            ) : (
                              <ToggleLeft className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEdit(type)}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title={t.form.editTitle}
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(type)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title={t.delete}
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
            {filteredTypes.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredTypes.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(value) => {
                  setItemsPerPage(value);
                  setCurrentPage(1);
                }}
              />
            )}
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {paginatedTypes.map((type, index) => (
              <div
                key={type._id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
              >
                {/* Type Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-900 dark:text-gray-100 font-medium text-xs">
                        {type.code}
                      </span>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        type.status === 1
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {type.status === 1 ? t.status.active : t.status.inactive}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                      {type.name}
                    </h3>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t.table.minSpent}</div>
                    <div className="font-bold text-[#FE7410] text-base">
                      {(type.min_spent || 0).toLocaleString()}₫
                    </div>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  {t.table.createdAt}: {new Date(type.created_at).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleToggleStatus(type)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                  >
                    {type.status === 1 ? (
                      <ToggleRight className="w-4 h-4" />
                    ) : (
                      <ToggleLeft className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">{language === 'vi' ? 'Trạng thái' : 'Status'}</span>
                  </button>
                  <button
                    onClick={() => handleEdit(type)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    <span>{language === 'vi' ? 'Sửa' : 'Edit'}</span>
                  </button>
                  <button
                    onClick={() => handleDelete(type)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{language === 'vi' ? 'Xóa' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Mobile Pagination */}
            {filteredTypes.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredTypes.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(value) => {
                  setItemsPerPage(value);
                  setCurrentPage(1);
                }}
              />
            )}
          </div>
        </>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingType ? t.form.editTitle : t.form.addTitle}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.form.code} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder={t.form.codePlaceholder}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent font-mono bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  maxLength={50}
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.form.name} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t.form.namePlaceholder}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  maxLength={255}
                />
              </div>

              {/* Min Spent */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.form.minSpent}
                </label>
                <input
                  type="number"
                  value={formData.min_spent}
                  onChange={(e) => setFormData({ ...formData, min_spent: parseInt(e.target.value) || 0 })}
                  placeholder={t.form.minSpentPlaceholder}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min={0}
                  step={10000}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {language === 'vi' 
                    ? 'Tổng chi tiêu tối thiểu để khách hàng đạt hạng này' 
                    : 'Minimum total spending required for this tier'}
                </p>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.form.status}
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={formData.status === 1}
                      onChange={() => setFormData({ ...formData, status: 1 })}
                      className="w-4 h-4 text-[#FE7410] focus:ring-[#FE7410]"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t.status.active}</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={formData.status === 0}
                      onChange={() => setFormData({ ...formData, status: 0 })}
                      className="w-4 h-4 text-[#FE7410] focus:ring-[#FE7410]"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t.status.inactive}</span>
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  {t.form.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#FE7410] text-white rounded-lg hover:bg-[#E56609] transition-colors font-medium"
                >
                  {t.form.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmType && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6">
              <h3 className="text-xl font-bold text-red-600 mb-4">{t.confirmDelete}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {t.messages.deleteConfirm}
              </p>
              <p className="font-medium text-gray-900 dark:text-gray-100 mb-6">
                {deleteConfirmType.name} ({deleteConfirmType.code})
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmType(null)}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium text-gray-700 dark:text-gray-300"
                >
                  {t.form.cancel}
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-bold"
                >
                  {t.delete}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerTypeManagement;