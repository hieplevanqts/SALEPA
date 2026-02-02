import { useState, useMemo } from 'react';
import { useStore } from '../../../../lib/restaurant-lib/store';
import type { ProductCategory } from '../../../../lib/restaurant-lib/store';
import { Search, Plus, Edit, Trash2, ToggleLeft, ToggleRight, X } from 'lucide-react';
import { toast } from 'sonner';
import { Pagination } from '../../components/common/Pagination';

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
      const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (category.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && category.isActive) ||
                           (statusFilter === 'inactive' && !category.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [productCategories, searchQuery, statusFilter]);

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
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t.title}</h1>
        
        {/* Search and Filters */}
        <div className="flex items-center gap-4 mb-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
          >
            <option value="all">{t.filter.all}</option>
            <option value="active">{t.filter.active}</option>
            <option value="inactive">{t.filter.inactive}</option>
          </select>

          {/* Add Button */}
          <button
            onClick={() => handleOpenForm()}
            className="px-4 py-2.5 bg-[#FE7410] text-white rounded-lg hover:bg-[#E66609] transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            {t.addNew}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">{t.table.no}</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">{t.table.name}</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">{t.table.description}</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">{t.table.color}</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">{t.table.status}</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">{t.table.createdAt}</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">{t.table.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    {t.noData}
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category, index) => (
                  <tr key={category.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{index + 1}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 font-medium">{category.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{category.description || '-'}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm text-gray-600">{category.color}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                          category.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {category.isActive ? t.status.active : t.status.inactive}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{formatDate(category.createdAt)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(category)}
                          className="p-1.5 text-gray-400 hover:text-[#FE7410] hover:bg-orange-50 rounded transition-colors"
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
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title={t.form.editTitle}
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
                          className="p-1.5 text-red-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        totalItems={filteredCategories.length}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
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