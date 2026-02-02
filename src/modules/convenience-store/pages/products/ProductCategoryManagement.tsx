import { useState, useMemo } from 'react';
import { useStore } from '../../../../lib/convenience-store-lib/store';
import type { ProductCategory } from '../../../../lib/convenience-store-lib/store';
import { Search, Plus, Edit, Trash2, ToggleLeft, ToggleRight, X, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';
import { Pagination } from '../../components/pagination/Pagination';

export function ProductCategoryManagement() {
  const { productCategories, addProductCategory, updateProductCategory, deleteProductCategory, toggleProductCategoryStatus, language } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [deleteConfirmCategory, setDeleteConfirmCategory] = useState<ProductCategory | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#FE7410',
    isActive: true,
  });

  const t = language === 'vi' ? {
    title: 'Quản lý Danh mục Sản phẩm',
    addNew: 'Thêm danh mục',
    search: 'Tìm kiếm danh mục...',
    filter: {
      all: 'Tất cả',
      active: 'Đang hoạt động',
      inactive: 'Không hoạt động',
    },
    table: {
      no: 'STT',
      name: 'Tên danh mục',
      description: 'Mô tả',
      color: 'Màu',
      status: 'Trạng thái',
      createdAt: 'Ngày tạo',
      actions: 'Hành động',
    },
    status: {
      active: 'Đang hoạt động',
      inactive: 'Không hoạt động',
    },
    form: {
      addTitle: 'Thêm danh mục mới',
      editTitle: 'Chỉnh sửa danh mục',
      name: 'Tên danh mục',
      namePlaceholder: 'Nhập tên danh mục',
      description: 'Mô tả',
      descriptionPlaceholder: 'Nhập mô tả (không bắt buộc)',
      color: 'Màu sắc',
      status: 'Trạng thái',
      cancel: 'Hủy',
      save: 'Lưu',
    },
    messages: {
      addSuccess: 'Thêm danh mục thành công!',
      updateSuccess: 'Cập nhật danh mục thành công!',
      deleteSuccess: 'Xóa danh mục thành công!',
      deleteConfirm: 'Bạn có chắc chắn muốn xóa danh mục này?',
      toggleSuccess: 'Cập nhật trạng thái thành công!',
      nameRequired: 'Vui lòng nhập tên danh mục',
    },
    noData: 'Không có danh mục nào',
  } : {
    title: 'Product Category Management',
    addNew: 'Add Category',
    search: 'Search categories...',
    filter: {
      all: 'All',
      active: 'Active',
      inactive: 'Inactive',
    },
    table: {
      no: 'No',
      name: 'Category Name',
      description: 'Description',
      color: 'Color',
      status: 'Status',
      createdAt: 'Created At',
      actions: 'Actions',
    },
    status: {
      active: 'Active',
      inactive: 'Inactive',
    },
    form: {
      addTitle: 'Add New Category',
      editTitle: 'Edit Category',
      name: 'Category Name',
      namePlaceholder: 'Enter category name',
      description: 'Description',
      descriptionPlaceholder: 'Enter description (optional)',
      color: 'Color',
      status: 'Status',
      cancel: 'Cancel',
      save: 'Save',
    },
    messages: {
      addSuccess: 'Category added successfully!',
      updateSuccess: 'Category updated successfully!',
      deleteSuccess: 'Category deleted successfully!',
      deleteConfirm: 'Are you sure you want to delete this category?',
      toggleSuccess: 'Status updated successfully!',
      nameRequired: 'Please enter category name',
    },
    noData: 'No categories found',
  };

  // Filter và search
  const filteredCategories = useMemo(() => {
    return productCategories.filter((category) => {
      const matchesSearch = (category.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (category.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && category.isActive) ||
                           (statusFilter === 'inactive' && !category.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [productCategories, searchQuery, statusFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, endIndex);

  const handleOpenForm = (category?: ProductCategory) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        color: category.color || '#FE7410',
        isActive: category.isActive,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        color: '#FE7410',
        isActive: true,
      });
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      color: '#FE7410',
      isActive: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error(t.messages.nameRequired);
      return;
    }

    if (editingCategory) {
      updateProductCategory(editingCategory.id, formData);
      toast.success(t.messages.updateSuccess);
    } else {
      addProductCategory({
        ...formData,
        createdBy: 'admin', // Replace with actual user
      });
      toast.success(t.messages.addSuccess);
    }
    
    handleCloseForm();
  };

  const handleDelete = (category: ProductCategory) => {
    setDeleteConfirmCategory(category);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmCategory) {
      deleteProductCategory(deleteConfirmCategory.id);
      toast.success(t.messages.deleteSuccess);
      setDeleteConfirmCategory(null);
    }
  };

  const handleToggleStatus = (category: ProductCategory) => {
    toggleProductCategoryStatus(category.id);
    toast.success(t.messages.toggleSuccess);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            {filteredCategories.length} / {productCategories.length} {language === 'vi' ? 'danh mục' : 'categories'}
          </p>
        </div>
        
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FE7410] text-white rounded-lg hover:bg-[#E66609] transition-colors font-medium text-sm sm:text-base w-full sm:w-auto"
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

      {/* Category List */}
      {filteredCategories.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center">
          <FolderOpen className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
            {productCategories.length === 0 ? (language === 'vi' ? 'Chưa có danh mục' : 'No categories yet') : t.noData}
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
                    <th className="table-header">{t.table.name}</th>
                    <th className="table-header">{t.table.description}</th>
                    <th className="table-header">{t.table.color}</th>
                    <th className="table-header">{t.table.status}</th>
                    <th className="table-header">{t.table.createdAt}</th>
                    <th className="table-header actions-left">{t.table.actions}</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800">
                  {paginatedCategories.map((category, index) => (
                    <tr key={category.id} className="transition-colors hover:bg-[#FEF7ED] dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <td className="table-content">{startIndex + index + 1}</td>
                      <td className="table-content">
                        <div className="font-medium text-gray-900 dark:text-white">{category.name}</div>
                      </td>
                      <td className="table-content">{category.description || '—'}</td>
                      <td className="table-content">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-gray-600 dark:text-gray-400">{category.color}</span>
                        </div>
                      </td>
                      <td className="table-content">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                            category.isActive
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {category.isActive ? t.status.active : t.status.inactive}
                        </span>
                      </td>
                      <td className="table-content">{formatDate(category.createdAt)}</td>
                      <td className="table-content actions-left">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleStatus(category)}
                            className="action-icon"
                            title={category.isActive ? t.status.inactive : t.status.active}
                          >
                            {category.isActive ? (
                              <ToggleRight className="w-5 h-5" />
                            ) : (
                              <ToggleLeft className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleOpenForm(category)}
                            className="action-icon"
                            title={t.form.editTitle}
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(category)}
                            className="action-icon"
                            title="Delete"
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
            {filteredCategories.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredCategories.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            )}
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {paginatedCategories.map((category) => (
              <div
                key={category.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
              >
                {/* Category Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600 flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                      />
                      <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                        {category.name}
                      </h3>
                    </div>
                    {category.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t.table.color}</div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {category.color}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t.table.status}</div>
                    <div>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          category.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {category.isActive ? t.status.active : t.status.inactive}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  {t.table.createdAt}: {formatDate(category.createdAt)}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleToggleStatus(category)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                  >
                    {category.isActive ? (
                      <ToggleRight className="w-4 h-4" />
                    ) : (
                      <ToggleLeft className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">{language === 'vi' ? 'Trạng thái' : 'Status'}</span>
                  </button>
                  <button
                    onClick={() => handleOpenForm(category)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    <span>{language === 'vi' ? 'Sửa' : 'Edit'}</span>
                  </button>
                  <button
                    onClick={() => handleDelete(category)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{language === 'vi' ? 'Xóa' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Mobile Pagination */}
            {filteredCategories.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredCategories.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            )}
          </div>
        </>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCategory ? t.form.editTitle : t.form.addTitle}
              </h2>
              <button
                onClick={handleCloseForm}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.form.name} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t.form.namePlaceholder}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.form.description}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t.form.descriptionPlaceholder}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.form.color}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-[#FE7410] border-gray-300 rounded focus:ring-[#FE7410]"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  {t.form.status}: {formData.isActive ? t.status.active : t.status.inactive}
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t.form.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#FE7410] text-white rounded-lg hover:bg-[#E66609] transition-colors"
                >
                  {t.form.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmCategory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6">
              <h3 className="text-xl font-bold text-red-600 mb-4">
                {language === 'vi' ? 'Xác nhận xóa' : 'Confirm Delete'}
              </h3>
              <p className="text-gray-600 mb-6">
                {language === 'vi' 
                  ? `Bạn có chắc chắn muốn xóa danh mục "${deleteConfirmCategory.name}" không?`
                  : `Are you sure you want to delete category "${deleteConfirmCategory.name}"?`
                }
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmCategory(null)}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-medium text-gray-700"
                >
                  {language === 'vi' ? 'Hủy' : 'Cancel'}
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-bold"
                >
                  {language === 'vi' ? 'Xóa' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductCategoryManagement;