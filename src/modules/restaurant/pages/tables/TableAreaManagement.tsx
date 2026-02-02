import { useState, useMemo, useEffect } from 'react';
import { useStore } from '../../../../lib/restaurant-lib/store';
import type { TableArea } from '../../../../lib/restaurant-lib/store';
import { Plus, Search, Edit, Trash2, Grid3x3 } from 'lucide-react';
import { useTranslation } from '../../../../lib/restaurant-lib/useTranslation';
import { Pagination } from '../../components/common/Pagination';

export function TableAreaManagement() {
  const { t } = useTranslation();
  const { tableAreas, addTableArea, updateTableArea, deleteTableArea } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'recent' | 'area'>('name');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedTable, setSelectedTable] = useState<TableArea | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<TableArea | null>(null);
  console.log("tableAreas in component", tableAreas);
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    area: '',
    notes: '',
    status: 'active' as 'active' | 'inactive',
  });

  // Filter and sort tables
  const filteredTables = useMemo(() => {
    let result = tableAreas?.filter((table) => {
      const matchSearch = 
        table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        table.area?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchStatus = statusFilter === 'all' || table.status === statusFilter;
      
      return matchSearch && matchStatus;
    });

    // Sort
    result?.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name, 'vi');
      } else if (sortBy === 'recent') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'area') {
        return (a.area || '').localeCompare(b.area || '', 'vi');
      }
      return 0;
    });

    return result;
  }, [tableAreas, searchQuery, sortBy, statusFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredTables?.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTables = filteredTables?.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, statusFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleEdit = (table: TableArea) => {
    setSelectedTable(table);
    setFormData({
      name: table.name,
      area: table.area || '',
      notes: table.notes || '',
      status: table.status,
    });
    setShowForm(true);
  };

  const handleDeleteClick = (table: TableArea) => {
    setTableToDelete(table);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (tableToDelete) {
      deleteTableArea(tableToDelete.id);
      setShowDeleteConfirm(false);
      setTableToDelete(null);
    }
  };

  const handleAddNew = () => {
    setSelectedTable(null);
    setFormData({
      name: '',
      area: '',
      notes: '',
      status: 'active',
    });
    setShowForm(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên phòng/bàn!');
      return;
    }

    if (selectedTable) {
      // Update existing
      updateTableArea(selectedTable.id, {
        ...selectedTable,
        name: formData.name,
        area: formData.area,
        notes: formData.notes,
        status: formData.status,
      });
    } else {
      // Add new
      addTableArea({
        name: formData.name,
        area: formData.area,
        notes: formData.notes,
        status: formData.status,
      });
    }

    setShowForm(false);
    setSelectedTable(null);
    setFormData({
      name: '',
      area: '',
      notes: '',
      status: 'active',
    });
  };

console.log("tableAreas", tableAreas);
console.log("filteredTables", filteredTables);  
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h2 className="page-title">Quản lý phòng/bàn</h2>
          <p className="text-gray-500 text-sm mt-2">
            {filteredTables?.length} / {tableAreas?.length} phòng/bàn
          </p>
        </div>
        
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2.5 text-white rounded-lg transition-colors font-medium"
          style={{ backgroundColor: '#FE7410' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E56809'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FE7410'}
        >
          <Plus className="w-5 h-5" />
          Thêm phòng/bàn
        </button>
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
              placeholder="Tìm kiếm theo tên hoặc khu vực..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="name">Sắp xếp A-Z</option>
            <option value="recent">Mới nhất</option>
            <option value="area">Theo khu vực</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {filteredTables?.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Grid3x3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">
            {tableAreas?.length === 0 ? 'Chưa có phòng/bàn' : 'Không tìm thấy'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="modern-table">
              <thead>
                <tr>
                  <th className="table-header">Tên phòng/bàn</th>
                  <th className="table-header">Khu vực</th>
                  <th className="table-header">Trạng thái</th>
                  <th className="table-header">Ghi chú</th>
                  <th className="table-header actions-left">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTables?.map((table) => (
                  <tr key={table.id}>
                    <td className="table-content">
                      <div className="font-medium text-gray-900">{table.name}</div>
                    </td>
                    <td className="table-content">
                      {table.area || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="table-content">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        table.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          table.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                        }`}></div>
                        {table.status === 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                      </span>
                    </td>
                    <td className="table-content">
                      {table.notes || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="table-content actions-left">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(table)}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Sửa"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(table)}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
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
          <div className="border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={filteredTables?.length}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedTable ? 'Sửa phòng/bàn' : 'Thêm phòng/bàn mới'}
              </h3>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {/* Tên phòng/bàn */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tên phòng/bàn <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Ví dụ: Bàn 1, Phòng VIP 1"
                  required
                />
              </div>

              {/* Khu vực */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Khu vực
                </label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Ví dụ: Tầng 1, Tầng 2, Khu VIP"
                />
              </div>

              {/* Trạng thái */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Trạng thái
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Ngừng hoạt động</option>
                </select>
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Ghi chú
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Thêm ghi chú về phòng/bàn..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedTable(null);
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 text-white rounded-lg transition-colors font-medium"
                  style={{ backgroundColor: '#FE7410' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E56809'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FE7410'}
                >
                  {selectedTable ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && tableToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Xác nhận xóa phòng/bàn
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa phòng/bàn <span className="font-semibold">"{tableToDelete.name}"</span>?
              <br />
              Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setTableToDelete(null);
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
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

export default TableAreaManagement;