import { useState, useMemo, useEffect } from 'react';
import { useStore } from '../../../../lib/spa-lib/store';
import type { Bed } from '../../../../lib/spa-lib/store';
import { useTranslation } from '../../../../lib/spa-lib/useTranslation';
import {
  Search, Plus, Edit, Trash2, X, Bed as BedIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { Pagination } from '../../components/common/Pagination';

export default function BedManagement() {
  const { beds, createBed, updateBed, deleteBed } = useStore();
  const { t } = useTranslation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | Bed['status']>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingBed, setEditingBed] = useState<Bed | null>(null);
  const [deleteConfirmBed, setDeleteConfirmBed] = useState<Bed | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    status: 'active' as Bed['status'],
    notes: '',
  });
  
  // Filter beds
  const filteredBeds = useMemo(() => {
    let filtered = beds.filter((bed) => {
      const matchesSearch = bed.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || bed.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
    
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [beds, searchQuery, filterStatus]);
  
  // Pagination
  const totalPages = Math.ceil(filteredBeds.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBeds = filteredBeds.slice(startIndex, endIndex);
  
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
  
  const handleOpenForm = (bed?: Bed) => {
    if (bed) {
      setEditingBed(bed);
      setFormData({
        name: bed.name,
        status: bed.status,
        notes: bed.notes || '',
      });
    } else {
      setEditingBed(null);
      setFormData({
        name: '',
        status: 'active',
        notes: '',
      });
    }
    setShowForm(true);
  };
  
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingBed(null);
    setFormData({
      name: '',
      status: 'active',
      notes: '',
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên giường');
      return;
    }
    
    if (editingBed) {
      updateBed(editingBed.id, formData);
      toast.success('Cập nhật giường thành công');
    } else {
      createBed(formData);
      toast.success('Thêm giường thành công');
    }
    
    handleCloseForm();
  };
  
  const handleDelete = () => {
    if (deleteConfirmBed) {
      deleteBed(deleteConfirmBed.id);
      toast.success('Xóa giường thành công');
      setDeleteConfirmBed(null);
    }
  };
  
  const getStatusBadge = (status: Bed['status']) => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      active: { label: 'Hoạt động', color: 'bg-green-100 text-green-700' },
      inactive: { label: 'Không hoạt động', color: 'bg-gray-100 text-gray-700' },
      available: { label: 'Hoạt động', color: 'bg-green-100 text-green-700' },
      occupied: { label: 'Hoạt động', color: 'bg-green-100 text-green-700' },
      maintenance: { label: 'Không hoạt động', color: 'bg-gray-100 text-gray-700' },
    };
    
    const config = statusConfig[status] || { label: 'Hoạt động', color: 'bg-green-100 text-green-700' };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h2 className="page-title">Quản lý giường</h2>
          <p className="text-gray-500 text-sm mt-2">
            {filteredBeds.length} / {beds.length} giường
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
          Thêm giường
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
              placeholder="Tìm kiếm theo tên giường..."
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
      
      {/* Bed Table */}
      {filteredBeds.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <BedIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">
            {beds.length === 0 ? 'Chưa có giường nào' : 'Không tìm thấy giường'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="modern-table">
              <thead>
                <tr>
                  <th className="table-header">Tên giường</th>
                  <th className="table-header">Trạng thái</th>
                  <th className="table-header">Ghi chú</th>
                  <th className="table-header">Ngày tạo</th>
                  <th className="table-header actions-left">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBeds.map((bed) => (
                  <tr key={bed.id}>
                    <td className="table-content">
                      <div className="font-medium text-gray-900">{bed.name}</div>
                    </td>
                    <td className="table-content">
                      {getStatusBadge(bed.status)}
                    </td>
                    <td className="table-content">
                      {bed.notes || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="table-content">
                      {new Date(bed.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="table-content actions-left">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenForm(bed)}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Sửa"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmBed(bed)}
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
          {filteredBeds.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredBeds.length}
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
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full my-8" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
            {/* Header */}
            <div className="sticky top-0 bg-[#FE7410] text-white px-6 py-4 flex justify-between items-center rounded-t-lg z-10">
              <h3 className="text-xl font-bold">
                {editingBed ? 'Chỉnh sửa giường' : 'Thêm giường'}
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
                <div>
                  <label className="block text-gray-700 mb-2">
                    Tên giường <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                    placeholder="Nhập tên giường (vd: Giường 1, Phòng VIP 1)"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2">Trạng thái</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Bed['status'] })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2">Ghi chú</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Thêm ghi chú (tùy chọn)"
                  />
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
                {editingBed ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteConfirmBed && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6">
              <h3 className="text-xl font-bold text-red-600 mb-4">Xác nhận xóa</h3>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn xóa giường <strong>{deleteConfirmBed.name}</strong> không?
              </p>
              
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirmBed(null)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDelete}
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
