import { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../../../lib/fashion-shop-lib/store';
import { api } from '../../../../lib/fashion-shop-lib/api';
import { Search, Plus, Edit, Trash2, ToggleLeft, ToggleRight, X } from 'lucide-react';
import { toast } from 'sonner';
import { Pagination } from '../../components/common/Pagination';

interface ProductCategory {
  _id: string;
  tenant_id: string;
  industry_id: string;
  code: string;
  name: string;
  parent_id?: string | null;
  path?: string | null;
  level?: number;
  sort_order?: number;
  status: number; // 1 = active, 0 = inactive
  created_at: string;
  updated_at: string;
}

export function ProductCategoryManagement() {
  const { language } = useStore();
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
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
    tenant_id: '',
    industry_id: '',
    code: '',
    name: '',
    parent_id: '',
    sort_order: 0,
    status: 1,
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
      code: 'Mã danh mục',
      name: 'Tên danh mục',
      industry_id: 'ID Ngành hàng',
      parent: 'Danh mục cha',
      level: 'Cấp độ',
      sort_order: 'Thứ tự',
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
      tenant_id: 'ID Tenant',
      tenant_idPlaceholder: 'Nhập ID tenant',
      code: 'Mã danh mục',
      codePlaceholder: 'Nhập mã danh mục (tự động tạo từ tên nếu để trống)',
      name: 'Tên danh mục',
      namePlaceholder: 'Nhập tên danh mục',
      industry_id: 'ID Ngành hàng',
      industry_idPlaceholder: 'Nhập ID ngành hàng',
      parent_id: 'Danh mục cha',
      parent_idPlaceholder: 'Chọn danh mục cha (không bắt buộc)',
      sort_order: 'Thứ tự sắp xếp',
      sort_orderPlaceholder: 'Nhập thứ tự sắp xếp',
      status: 'Trạng thái hoạt động',
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
      tenantIdRequired: 'Vui lòng nhập ID tenant',
      industryIdRequired: 'Vui lòng nhập ID ngành hàng',
      loadError: 'Không thể tải dữ liệu danh mục',
      deleteError: 'Không thể xóa danh mục',
      updateError: 'Không thể cập nhật danh mục',
      createError: 'Không thể tạo danh mục',
    },
    noData: 'Không có danh mục nào',
    loading: 'Đang tải...',
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
      code: 'Code',
      name: 'Category Name',
      industry_id: 'Industry ID',
      parent: 'Parent Category',
      level: 'Level',
      sort_order: 'Order',
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
      tenant_id: 'Tenant ID',
      tenant_idPlaceholder: 'Enter tenant ID',
      code: 'Category Code',
      codePlaceholder: 'Enter code (auto-generated from name if empty)',
      name: 'Category Name',
      namePlaceholder: 'Enter category name',
      industry_id: 'Industry ID',
      industry_idPlaceholder: 'Enter industry ID',
      parent_id: 'Parent Category',
      parent_idPlaceholder: 'Select parent category (optional)',
      sort_order: 'Sort Order',
      sort_orderPlaceholder: 'Enter sort order',
      status: 'Active Status',
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
      tenantIdRequired: 'Please enter tenant ID',
      industryIdRequired: 'Please enter industry ID',
      loadError: 'Failed to load categories',
      deleteError: 'Failed to delete category',
      updateError: 'Failed to update category',
      createError: 'Failed to create category',
    },
    noData: 'No categories found',
    loading: 'Loading...',
  };

  // Load categories from API
  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await api.getProductCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      } else {
        toast.error(t.messages.loadError + ': ' + (response.error || 'Unknown error'));
        setCategories([]);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error(t.messages.loadError);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Filter và search
  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && category.status === 1) ||
                           (statusFilter === 'inactive' && category.status === 0);
      return matchesSearch && matchesStatus;
    });
  }, [categories, searchQuery, statusFilter]);

  // Paginate data
  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCategories.slice(startIndex, endIndex);
  }, [filteredCategories, currentPage, itemsPerPage]);

  const handleOpenForm = (category?: ProductCategory) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        tenant_id: category.tenant_id,
        industry_id: category.industry_id,
        code: category.code,
        name: category.name,
        parent_id: category.parent_id || '',
        sort_order: category.sort_order || 0,
        status: category.status,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        tenant_id: '',
        industry_id: '',
        code: '',
        name: '',
        parent_id: '',
        sort_order: 0,
        status: 1,
      });
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({
      tenant_id: '',
      industry_id: '',
      code: '',
      name: '',
      parent_id: '',
      sort_order: 0,
      status: 1,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error(t.messages.nameRequired);
      return;
    }

    if (!formData.tenant_id.trim()) {
      toast.error(t.messages.tenantIdRequired);
      return;
    }

    if (!formData.industry_id.trim()) {
      toast.error(t.messages.industryIdRequired);
      return;
    }

    try {
      if (editingCategory) {
        // Update existing category
        const response = await api.updateProductCategory(editingCategory._id, formData);
        if (response.success) {
          toast.success(t.messages.updateSuccess);
          await loadCategories();
          handleCloseForm();
        } else {
          toast.error(t.messages.updateError + ': ' + (response.error || 'Unknown error'));
        }
      } else {
        // Create new category
        const response = await api.createProductCategory(formData);
        if (response.success) {
          toast.success(t.messages.addSuccess);
          await loadCategories();
          handleCloseForm();
        } else {
          toast.error(t.messages.createError + ': ' + (response.error || 'Unknown error'));
        }
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(editingCategory ? t.messages.updateError : t.messages.createError);
    }
  };

  const handleDelete = (category: ProductCategory) => {
    setDeleteConfirmCategory(category);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmCategory) return;

    try {
      const response = await api.deleteProductCategory(deleteConfirmCategory._id);
      if (response.success) {
        toast.success(t.messages.deleteSuccess);
        await loadCategories();
        setDeleteConfirmCategory(null);
      } else {
        toast.error(t.messages.deleteError + ': ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(t.messages.deleteError);
    }
  };

  const handleToggleStatus = async (category: ProductCategory) => {
    try {
      const newStatus = category.status === 1 ? 0 : 1;
      const response = await api.updateProductCategory(category._id, { status: newStatus });
      if (response.success) {
        toast.success(t.messages.toggleSuccess);
        await loadCategories();
      } else {
        toast.error(t.messages.updateError + ': ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error(t.messages.updateError);
    }
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
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-orange-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">{t.table.no}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.table.code}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.table.name}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.table.industry_id}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.table.parent}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.table.level}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.table.sort_order}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">{t.table.status}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">{t.table.createdAt}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">{t.table.actions}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                    {t.loading}
                  </td>
                </tr>
              ) : paginatedCategories.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                    {t.noData}
                  </td>
                </tr>
              ) : (
                paginatedCategories.map((category, index) => (
                  <tr key={category._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.industry_id || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.parent_id || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.level || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.sort_order || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          category.status === 1
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {category.status === 1 ? t.status.active : t.status.inactive}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(category.created_at)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(category)}
                          className="text-gray-400 hover:text-[#FE7410] transition-colors"
                          title={category.status === 1 ? t.status.inactive : t.status.active}
                        >
                          {category.status === 1 ? (
                            <ToggleRight className="w-5 h-5" />
                          ) : (
                            <ToggleLeft className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleOpenForm(category)}
                          className="text-gray-400 hover:text-[#FE7410] transition-colors"
                          title={t.form.editTitle}
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
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
              {/* Tenant ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.form.tenant_id} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.tenant_id}
                  onChange={(e) => setFormData({ ...formData, tenant_id: e.target.value })}
                  placeholder={t.form.tenant_idPlaceholder}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                  required
                />
              </div>

              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.form.code}
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder={t.form.codePlaceholder}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                />
              </div>

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

              {/* Industry ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.form.industry_id} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.industry_id}
                  onChange={(e) => setFormData({ ...formData, industry_id: e.target.value })}
                  placeholder={t.form.industry_idPlaceholder}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                  required
                />
              </div>

              {/* Parent ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.form.parent_id}
                </label>
                <input
                  type="text"
                  value={formData.parent_id}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                  placeholder={t.form.parent_idPlaceholder}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                />
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.form.sort_order}
                </label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                  placeholder={t.form.sort_orderPlaceholder}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                />
              </div>

              {/* Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="status"
                  checked={formData.status === 1}
                  onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 1 : 0 })}
                  className="w-4 h-4 text-[#FE7410] border-gray-300 rounded focus:ring-[#FE7410]"
                />
                <label htmlFor="status" className="text-sm font-medium text-gray-700">
                  {t.form.status}: {formData.status === 1 ? t.status.active : t.status.inactive}
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