import { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../../../lib/fashion-shop-lib/store';
import { api } from '../../../../lib/fashion-shop-lib/api';
import { Search, Plus, Edit, Trash2, ToggleLeft, ToggleRight, X } from 'lucide-react';
import { toast } from 'sonner';
import { Pagination } from '../../components/common/Pagination';

interface ProductBrand {
  _id: string;
  tenant_id: string;
  industry_id: string;
  name: string;
  status: number; // 1 = active, 0 = inactive
  created_at: string;
  updated_at: string;
}

export function ProductBrandManagement() {
  const { language } = useStore();
  const [brands, setBrands] = useState<ProductBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<ProductBrand | null>(null);
  const [deleteConfirmBrand, setDeleteConfirmBrand] = useState<ProductBrand | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  // Form states
  const [formData, setFormData] = useState({
    tenant_id: '',
    industry_id: '',
    name: '',
    status: 1,
  });

  const t = language === 'vi' ? {
    title: 'Quản lý Thương hiệu',
    addNew: 'Thêm thương hiệu',
    search: 'Tìm kiếm thương hiệu...',
    filter: {
      all: 'Tất cả',
      active: 'Đang hoạt động',
      inactive: 'Không hoạt động',
    },
    table: {
      no: 'STT',
      name: 'Tên thương hiệu',
      industry_id: 'ID Ngành hàng',
      status: 'Trạng thái',
      createdAt: 'Ngày tạo',
      actions: 'Hành động',
    },
    status: {
      active: 'Đang hoạt động',
      inactive: 'Không hoạt động',
    },
    form: {
      addTitle: 'Thêm thương hiệu mới',
      editTitle: 'Chỉnh sửa thương hiệu',
      tenant_id: 'ID Tenant',
      tenant_idPlaceholder: 'Nhập ID tenant',
      name: 'Tên thương hiệu',
      namePlaceholder: 'Nhập tên thương hiệu',
      industry_id: 'ID Ngành hàng',
      industry_idPlaceholder: 'Nhập ID ngành hàng',
      status: 'Trạng thái hoạt động',
      cancel: 'Hủy',
      save: 'Lưu',
    },
    messages: {
      addSuccess: 'Thêm thương hiệu thành công!',
      updateSuccess: 'Cập nhật thương hiệu thành công!',
      deleteSuccess: 'Xóa thương hiệu thành công!',
      deleteConfirm: 'Bạn có chắc chắn muốn xóa thương hiệu này?',
      toggleSuccess: 'Cập nhật trạng thái thành công!',
      nameRequired: 'Vui lòng nhập tên thương hiệu',
      tenantIdRequired: 'Vui lòng nhập ID tenant',
      industryIdRequired: 'Vui lòng nhập ID ngành hàng',
      loadError: 'Không thể tải dữ liệu thương hiệu',
      deleteError: 'Không thể xóa thương hiệu',
      updateError: 'Không thể cập nhật thương hiệu',
      createError: 'Không thể tạo thương hiệu',
    },
    noData: 'Không có thương hiệu nào',
    loading: 'Đang tải...',
  } : {
    title: 'Brand Management',
    addNew: 'Add Brand',
    search: 'Search brands...',
    filter: {
      all: 'All',
      active: 'Active',
      inactive: 'Inactive',
    },
    table: {
      no: 'No',
      name: 'Brand Name',
      industry_id: 'Industry ID',
      status: 'Status',
      createdAt: 'Created At',
      actions: 'Actions',
    },
    status: {
      active: 'Active',
      inactive: 'Inactive',
    },
    form: {
      addTitle: 'Add New Brand',
      editTitle: 'Edit Brand',
      tenant_id: 'Tenant ID',
      tenant_idPlaceholder: 'Enter tenant ID',
      name: 'Brand Name',
      namePlaceholder: 'Enter brand name',
      industry_id: 'Industry ID',
      industry_idPlaceholder: 'Enter industry ID',
      status: 'Active Status',
      cancel: 'Cancel',
      save: 'Save',
    },
    messages: {
      addSuccess: 'Brand added successfully!',
      updateSuccess: 'Brand updated successfully!',
      deleteSuccess: 'Brand deleted successfully!',
      deleteConfirm: 'Are you sure you want to delete this brand?',
      toggleSuccess: 'Status updated successfully!',
      nameRequired: 'Please enter brand name',
      tenantIdRequired: 'Please enter tenant ID',
      industryIdRequired: 'Please enter industry ID',
      loadError: 'Failed to load brands',
      deleteError: 'Failed to delete brand',
      updateError: 'Failed to update brand',
      createError: 'Failed to create brand',
    },
    noData: 'No brands found',
    loading: 'Loading...',
  };

  // Load brands from API
  const loadBrands = async () => {
    setLoading(true);
    try {
      const response = await api.getProductBrands();
      if (response.success && response.data) {
        setBrands(response.data);
      } else {
        toast.error(t.messages.loadError + ': ' + (response.error || 'Unknown error'));
        setBrands([]);
      }
    } catch (error) {
      console.error('Error loading brands:', error);
      toast.error(t.messages.loadError);
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  // Filter and search
  const filteredBrands = useMemo(() => {
    return brands.filter((brand) => {
      const matchesSearch = brand.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && brand.status === 1) ||
                           (statusFilter === 'inactive' && brand.status === 0);
      return matchesSearch && matchesStatus;
    });
  }, [brands, searchQuery, statusFilter]);

  // Paginate data
  const paginatedBrands = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredBrands.slice(startIndex, endIndex);
  }, [filteredBrands, currentPage, itemsPerPage]);

  const handleOpenForm = (brand?: ProductBrand) => {
    if (brand) {
      setEditingBrand(brand);
      setFormData({
        tenant_id: brand.tenant_id,
        industry_id: brand.industry_id,
        name: brand.name,
        status: brand.status,
      });
    } else {
      setEditingBrand(null);
      setFormData({
        tenant_id: '',
        industry_id: '',
        name: '',
        status: 1,
      });
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingBrand(null);
    setFormData({
      tenant_id: '',
      industry_id: '',
      name: '',
      status: 1,
    });
  };

  const handleSubmit = async () => {
    // Validate
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
      if (editingBrand) {
        // Update
        const response = await api.updateProductBrand(editingBrand._id, formData);
        if (response.success) {
          toast.success(t.messages.updateSuccess);
          loadBrands();
          handleCloseForm();
        } else {
          toast.error(t.messages.updateError + ': ' + (response.error || 'Unknown error'));
        }
      } else {
        // Create
        const response = await api.createProductBrand(formData);
        if (response.success) {
          toast.success(t.messages.addSuccess);
          loadBrands();
          handleCloseForm();
        } else {
          toast.error(t.messages.createError + ': ' + (response.error || 'Unknown error'));
        }
      }
    } catch (error) {
      console.error('Error saving brand:', error);
      toast.error(editingBrand ? t.messages.updateError : t.messages.createError);
    }
  };

  const handleDelete = async (brand: ProductBrand) => {
    try {
      const response = await api.deleteProductBrand(brand._id);
      if (response.success) {
        toast.success(t.messages.deleteSuccess);
        loadBrands();
        setDeleteConfirmBrand(null);
      } else {
        toast.error(t.messages.deleteError + ': ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting brand:', error);
      toast.error(t.messages.deleteError);
    }
  };

  const handleToggleStatus = async (brand: ProductBrand) => {
    try {
      const newStatus = brand.status === 1 ? 0 : 1;
      const response = await api.updateProductBrand(brand._id, { status: newStatus });
      if (response.success) {
        toast.success(t.messages.toggleSuccess);
        loadBrands();
      } else {
        toast.error(t.messages.updateError + ': ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error(t.messages.updateError);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
            >
              <option value="all">{t.filter.all}</option>
              <option value="active">{t.filter.active}</option>
              <option value="inactive">{t.filter.inactive}</option>
            </select>
          </div>

          {/* Add Button */}
          <button
            onClick={() => handleOpenForm()}
            className="flex items-center gap-2 px-4 py-2 bg-[#FE7410] text-white rounded-lg hover:bg-[#E66609] transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>{t.addNew}</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-orange-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  {t.table.no}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.table.name}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.table.industry_id}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.table.status}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.table.createdAt}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  {t.table.actions}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    {t.loading}
                  </td>
                </tr>
              ) : paginatedBrands.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    {t.noData}
                  </td>
                </tr>
              ) : (
                paginatedBrands.map((brand, index) => (
                  <tr key={brand._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{brand.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {brand.industry_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          brand.status === 1
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {brand.status === 1 ? t.status.active : t.status.inactive}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(brand.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        {/* Toggle Status */}
                        <button
                          onClick={() => handleToggleStatus(brand)}
                          className="text-gray-400 hover:text-[#FE7410] transition-colors"
                          title={brand.status === 1 ? 'Vô hiệu hóa' : 'Kích hoạt'}
                        >
                          {brand.status === 1 ? (
                            <ToggleRight className="w-5 h-5" />
                          ) : (
                            <ToggleLeft className="w-5 h-5" />
                          )}
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenForm(brand)}
                          className="text-gray-400 hover:text-[#FE7410] transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-5 h-5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setDeleteConfirmBrand(brand)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Xóa"
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

        {/* Pagination */}
        {!loading && filteredBrands.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredBrands.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingBrand ? t.form.editTitle : t.form.addTitle}
              </h2>
              <button
                onClick={handleCloseForm}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              {/* Tenant ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.form.tenant_id}
                </label>
                <input
                  type="text"
                  value={formData.tenant_id}
                  onChange={(e) => setFormData({ ...formData, tenant_id: e.target.value })}
                  placeholder={t.form.tenant_idPlaceholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                />
              </div>

              {/* Industry ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.form.industry_id}
                </label>
                <input
                  type="text"
                  value={formData.industry_id}
                  onChange={(e) => setFormData({ ...formData, industry_id: e.target.value })}
                  placeholder={t.form.industry_idPlaceholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                />
              </div>

              {/* Brand Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.form.name} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t.form.namePlaceholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                />
              </div>

              {/* Status */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.status === 1}
                    onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 1 : 0 })}
                    className="w-4 h-4 text-[#FE7410] border-gray-300 rounded focus:ring-[#FE7410]"
                  />
                  <span className="text-sm font-medium text-gray-700">{t.form.status}</span>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={handleCloseForm}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t.form.cancel}
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-[#FE7410] text-white rounded-lg hover:bg-[#E66609] transition-colors"
              >
                {t.form.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmBrand && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t.messages.deleteConfirm}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              <strong>{deleteConfirmBrand.name}</strong>
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmBrand(null)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t.form.cancel}
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmBrand)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductBrandManagement;