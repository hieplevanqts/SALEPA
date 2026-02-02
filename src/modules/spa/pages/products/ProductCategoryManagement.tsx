import { useState, useMemo, useEffect } from 'react';
import { useStore } from '../../../../lib/spa-lib/store';
import type { ProductCategory } from '../../../../lib/spa-lib/store';
import { Search, Plus, Edit, Trash2, X, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';
import { Pagination } from '../../components/common/Pagination';

export default function ProductCategoryManagement() {
  const { productCategories, addProductCategory, updateProductCategory, deleteProductCategory, language, currentUser } = useStore();
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
      all: 'Tất cả trạng thái',
      active: 'Hoạt động',
      inactive: 'Không hoạt động',
    },
    table: {
      name: 'Tên danh mục',
      description: 'Mô tả',
      color: 'Màu',
      status: 'Trạng thái',
      createdAt: 'Ngày tạo',
      actions: 'Hành động',
    },
    status: {
      active: 'Hoạt động',
      inactive: 'Không hoạt động',
    },
    form: {
      addTitle: 'Thêm danh mục mới',
      editTitle: 'Chỉnh sửa danh mục',
      name: 'Tên danh mục',
      namePlaceholder: 'Nhập tên danh mục',
      description: 'Mô tả',
      descriptionPlaceholder: 'Nhập mô tả (tùy chọn)',
      color: 'Màu hiển thị',
      status: 'Trạng thái',
      cancel: 'Hủy',
      save: 'Lưu',
    },
    delete: {
      title: 'Xác nhận xóa',
      message: 'Bạn có chắc chắn muốn xóa danh mục',
      cancel: 'Hủy',
      confirm: 'Xóa',
    },
    noData: 'Chưa có danh mục nào',
    notFound: 'Không tìm thấy danh mục',
  } : {
    title: 'Product Category Management',
    addNew: 'Add Category',
    search: 'Search category...',
    filter: {
      all: 'All Statuses',
      active: 'Active',
      inactive: 'Inactive',
    },
    table: {
      name: 'Category Name',
      description: 'Description',
      color: 'Color',
      status: 'Status',
      createdAt: 'Created Date',
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
      color: 'Display Color',
      status: 'Status',
      cancel: 'Cancel',
      save: 'Save',
    },
    delete: {
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete category',
      cancel: 'Cancel',
      confirm: 'Delete',
    },
    noData: 'No categories yet',
    notFound: 'Category not found',
  };

  // Filter categories
  const filteredCategories = useMemo(() => {
    let filtered = productCategories;
    
    if (searchQuery) {
      filtered = filtered.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(cat => 
        statusFilter === 'active' ? cat.isActive : !cat.isActive
      );
    }
    
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [productCategories, searchQuery, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, endIndex);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error(language === 'vi' ? 'Vui lòng nhập tên danh mục' : 'Please enter category name');
      return;
    }

    const categoryData = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      color: formData.color,
      isActive: formData.isActive,
      createdBy: currentUser?.username || 'system',
    };

    if (editingCategory) {
      updateProductCategory(editingCategory.id, categoryData);
      toast.success(language === 'vi' ? 'Cập nhật danh mục thành công' : 'Category updated successfully');
    } else {
      addProductCategory(categoryData);
      toast.success(language === 'vi' ? 'Thêm danh mục thành công' : 'Category added successfully');
    }

    handleCloseForm();
  };

  const handleDelete = () => {
    if (deleteConfirmCategory) {
      deleteProductCategory(deleteConfirmCategory.id);
      toast.success(language === 'vi' ? 'Xóa danh mục thành công' : 'Category deleted successfully');
      setDeleteConfirmCategory(null);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
        isActive
          ? 'bg-green-100 text-green-700'
          : 'bg-gray-100 text-gray-700'
      }`}>
        {isActive ? t.status.active : t.status.inactive}
      </span>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h2 className="page-title">{t.title}</h2>
          <p className="text-gray-500 text-sm mt-2">
            {filteredCategories.length} / {productCategories.length} {language === 'vi' ? 'danh mục' : 'categories'}
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
          {t.addNew}
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
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">{t.filter.all}</option>
            <option value="active">{t.filter.active}</option>
            <option value="inactive">{t.filter.inactive}</option>
          </select>
        </div>
      </div>
      
      {/* Category Table */}
      {filteredCategories.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">
            {productCategories.length === 0 ? t.noData : t.notFound}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="modern-table">
              <thead>
                <tr>
                  <th className="table-header">{t.table.name}</th>
                  <th className="table-header">{t.table.description}</th>
                  <th className="table-header">{t.table.color}</th>
                  <th className="table-header">{t.table.status}</th>
                  <th className="table-header">{t.table.createdAt}</th>
                  <th className="table-header actions-left">{t.table.actions}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCategories.map((category) => (
                  <tr key={category.id}>
                    <td className="table-content">
                      <div className="font-medium text-gray-900">{category.name}</div>
                    </td>
                    <td className="table-content">
                      {category.description || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="table-content">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{ backgroundColor: category.color || '#FE7410' }}
                        />
                        <span className="text-sm text-gray-600">{category.color || '#FE7410'}</span>
                      </div>
                    </td>
                    <td className="table-content">
                      {getStatusBadge(category.isActive)}
                    </td>
                    <td className="table-content">
                      {new Date(category.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="table-content actions-left">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenForm(category)}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                          title={language === 'vi' ? 'Sửa' : 'Edit'}
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmCategory(category)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title={language === 'vi' ? 'Xóa' : 'Delete'}
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
          {filteredCategories.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredCategories.length}
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
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full my-8" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
            {/* Header */}
            <div className="sticky top-0 bg-[#FE7410] text-white px-6 py-4 flex justify-between items-center rounded-t-lg z-10">
              <h3 className="text-xl font-bold">
                {editingCategory ? t.form.editTitle : t.form.addTitle}
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
                {/* Name */}
                <div>
                  <label className="block text-gray-700 mb-2">
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
                  <label className="block text-gray-700 mb-2">{t.form.description}</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={t.form.descriptionPlaceholder}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent resize-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Color */}
                  <div>
                    <label className="block text-gray-700 mb-2">{t.form.color}</label>
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full h-10 px-2 border border-gray-300 rounded-lg cursor-pointer"
                    />
                  </div>
                  
                  {/* Status */}
                  <div>
                    <label className="block text-gray-700 mb-2">{t.form.status}</label>
                    <select
                      value={formData.isActive ? 'active' : 'inactive'}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                    >
                      <option value="active">{t.filter.active}</option>
                      <option value="inactive">{t.filter.inactive}</option>
                    </select>
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
                {t.form.cancel}
              </button>
              <button
                onClick={handleSubmit}
                type="submit"
                className="px-6 py-2.5 text-white rounded-lg transition-colors"
                style={{ backgroundColor: '#FE7410' }}
              >
                {t.form.save}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteConfirmCategory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6">
              <h3 className="text-xl font-bold text-red-600 mb-4">{t.delete.title}</h3>
              <p className="text-gray-600 mb-6">
                {t.delete.message} <strong>{deleteConfirmCategory.name}</strong> {language === 'vi' ? 'không' : ''}?
              </p>
              
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirmCategory(null)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t.delete.cancel}
                </button>
                <button
                  onClick={handleDelete}
                  className="px-6 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  {t.delete.confirm}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
