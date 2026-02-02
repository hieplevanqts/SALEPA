import { useState } from 'react';
import { useStore } from '../../../../lib/restaurant-lib/store';
import type { Table, TableReservation } from '../../../../lib/restaurant-lib/store';
import { Search, Plus, Edit, Trash2, Users, X } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '../../../../lib/restaurant-lib/useTranslation';

type ViewMode = 'tables' | 'reservations';

export default function TableManagement() {
  const { t } = useTranslation();
  const {
    tables,
    tableReservations,
    createTable,
    updateTable,
    deleteTable,
    updateTableStatus,
    createTableReservation,
    updateTableReservation,
    deleteTableReservation,
    updateReservationStatus,
    getTableReservations,
    currentUser,
    orders, // Add orders to show current table orders
  } = useStore();

  const [viewMode, setViewMode] = useState<ViewMode>('tables');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArea, setFilterArea] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showTableModal, setShowTableModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [editingReservation, setEditingReservation] = useState<TableReservation | null>(null);

  // Form state for table
  const [tableForm, setTableForm] = useState({
    name: '',
    area: '',
    capacity: 2,
    notes: '',
  });

  // Form state for reservation
  const [reservationForm, setReservationForm] = useState({
    tableId: '',
    customerName: '',
    customerPhone: '',
    numberOfGuests: 2,
    reservationDate: '',
    reservationTime: '',
    duration: 120,
    notes: '',
  });

  // Get unique areas
  const areas = Array.from(new Set(tables.map(t => t.area))).filter(Boolean);

  // Filter tables
  const filteredTables = tables.filter(table => {
    const matchesSearch = table.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArea = filterArea === 'all' || table.area === filterArea;
    const matchesStatus = filterStatus === 'all' || table.status === filterStatus;
    return matchesSearch && matchesArea && matchesStatus;
  });

  // Count tables by status
  const tableStats = {
    total: tables.length,
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
    cleaning: tables.filter(t => t.status === 'cleaning').length,
  };

  // Get today's reservations
  const today = new Date().toISOString().split('T')[0];
  const todayReservations = getTableReservations(today);

  // Open table modal
  const handleOpenTableModal = (table?: Table) => {
    if (table) {
      setEditingTable(table);
      setTableForm({
        name: table.name,
        area: table.area,
        capacity: table.capacity,
        notes: table.notes || '',
      });
    } else {
      setEditingTable(null);
      setTableForm({
        name: '',
        area: '',
        capacity: 2,
        notes: '',
      });
    }
    setShowTableModal(true);
  };

  // Save table
  const handleSaveTable = () => {
    if (!tableForm.name.trim()) {
      toast.error('Vui lòng nhập tên bàn');
      return;
    }
    if (!tableForm.area.trim()) {
      toast.error('Vui lòng nhập khu vực');
      return;
    }
    if (tableForm.capacity < 1) {
      toast.error('Sức chứa phải lớn hơn 0');
      return;
    }

    if (editingTable) {
      updateTable(editingTable.id, {
        ...tableForm,
      });
      toast.success('Cập nhật bàn thành công');
    } else {
      createTable({
        ...tableForm,
        status: 'available',
        qrCode: `QR-${Date.now()}`,
        createdBy: currentUser?.username || 'admin',
      });
      toast.success('Thêm bàn thành công');
    }

    setShowTableModal(false);
    setEditingTable(null);
  };

  // Delete table
  const handleDeleteTable = (tableId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bàn này?')) {
      deleteTable(tableId);
      toast.success('Xóa bàn thành công');
    }
  };

  // Open reservation modal
  const handleOpenReservationModal = (reservation?: TableReservation) => {
    if (reservation) {
      setEditingReservation(reservation);
      setReservationForm({
        tableId: reservation.tableId,
        customerName: reservation.customerName,
        customerPhone: reservation.customerPhone,
        numberOfGuests: reservation.numberOfGuests,
        reservationDate: reservation.reservationDate,
        reservationTime: reservation.reservationTime,
        duration: reservation.duration || 120,
        notes: reservation.notes || '',
      });
    } else {
      setEditingReservation(null);
      setReservationForm({
        tableId: '',
        customerName: '',
        customerPhone: '',
        numberOfGuests: 2,
        reservationDate: today,
        reservationTime: '',
        duration: 120,
        notes: '',
      });
    }
    setShowReservationModal(true);
  };

  // Save reservation
  const handleSaveReservation = () => {
    if (!reservationForm.tableId) {
      toast.error('Vui lòng chọn bàn');
      return;
    }
    if (!reservationForm.customerName.trim()) {
      toast.error('Vui lòng nhập tên khách hàng');
      return;
    }
    if (!reservationForm.customerPhone.trim()) {
      toast.error('Vui lòng nhập số điện thoại');
      return;
    }
    if (!reservationForm.reservationDate) {
      toast.error('Vui lòng chọn ngày đặt');
      return;
    }
    if (!reservationForm.reservationTime) {
      toast.error('Vui lòng chọn giờ đặt');
      return;
    }

    const table = tables.find(t => t.id === reservationForm.tableId);
    if (!table) {
      toast.error('Bàn không tồn tại');
      return;
    }

    if (editingReservation) {
      updateTableReservation(editingReservation.id, {
        ...reservationForm,
        tableName: table.name,
      });
      toast.success('Cập nhật đặt bàn thành công');
    } else {
      createTableReservation({
        ...reservationForm,
        tableName: table.name,
        status: 'confirmed',
        createdBy: currentUser?.username || 'admin',
      });
      toast.success('Đặt bàn thành công');
    }

    setShowReservationModal(false);
    setEditingReservation(null);
  };

  // Delete reservation
  const handleDeleteReservation = (reservationId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đặt bàn này?')) {
      deleteTableReservation(reservationId);
      toast.success('Xóa đặt bàn thành công');
    }
  };

  // Update reservation status
  const handleUpdateReservationStatus = (reservationId: string, status: TableReservation['status']) => {
    updateReservationStatus(reservationId, status);
    toast.success('Cập nhật trạng thái thành công');
  };

  // Get status color
  const getStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-700';
      case 'occupied': return 'bg-red-100 text-red-700';
      case 'reserved': return 'bg-yellow-100 text-yellow-700';
      case 'cleaning': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: Table['status']) => {
    switch (status) {
      case 'available': return 'Trống';
      case 'occupied': return 'Đang phục vụ';
      case 'reserved': return 'Đã đặt';
      case 'cleaning': return 'Đang dọn';
      default: return status;
    }
  };

  const getReservationStatusColor = (status: TableReservation['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'arrived': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'no-show': return 'bg-gray-100 text-gray-700';
      case 'completed': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getReservationStatusText = (status: TableReservation['status']) => {
    switch (status) {
      case 'confirmed': return 'Đã xác nhận';
      case 'arrived': return 'Đã đến';
      case 'cancelled': return 'Đã hủy';
      case 'no-show': return 'Không đến';
      case 'completed': return 'Hoàn thành';
      default: return status;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý bàn</h1>
          <div className="flex gap-2">
            {viewMode === 'tables' && (
              <button
                onClick={() => setViewMode('reservations')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-['Inter']"
              >
                Lịch đặt bàn ({todayReservations.length})
              </button>
            )}
            {viewMode === 'reservations' && (
              <button
                onClick={() => setViewMode('tables')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-['Inter']"
              >
                Danh sách bàn
              </button>
            )}
            <button
              onClick={() => viewMode === 'tables' ? handleOpenTableModal() : handleOpenReservationModal()}
              className="flex items-center gap-2 px-4 py-2 bg-[#FE7410] text-white rounded-lg hover:bg-[#E56609] transition-colors font-['Inter']"
            >
              <Plus className="w-4 h-4" />
              {viewMode === 'tables' ? 'Thêm bàn' : 'Đặt bàn'}
            </button>
          </div>
        </div>

        {/* Status statistics - only show in tables view */}
        {viewMode === 'tables' && (
          <div className="flex gap-2 mb-4 flex-wrap">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors font-['Inter'] ${
                filterStatus === 'all'
                  ? 'bg-[#FE7410] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất cả ({tableStats.total})
            </button>
            <button
              onClick={() => setFilterStatus('available')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors font-['Inter'] ${
                filterStatus === 'available'
                  ? 'bg-green-500 text-white'
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              Trống ({tableStats.available})
            </button>
            <button
              onClick={() => setFilterStatus('occupied')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors font-['Inter'] ${
                filterStatus === 'occupied'
                  ? 'bg-red-500 text-white'
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              Đang phục vụ ({tableStats.occupied})
            </button>
            <button
              onClick={() => setFilterStatus('reserved')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors font-['Inter'] ${
                filterStatus === 'reserved'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
              }`}
            >
              Đã đặt ({tableStats.reserved})
            </button>
            <button
              onClick={() => setFilterStatus('cleaning')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors font-['Inter'] ${
                filterStatus === 'cleaning'
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              Đang dọn ({tableStats.cleaning})
            </button>
          </div>
        )}

        {/* Search and filter */}
        <div className="flex gap-3">
          {viewMode === 'tables' && (
            <>
              <select
                value={filterArea}
                onChange={(e) => setFilterArea(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-['Inter']"
              >
                <option value="all">Tất cả khu vực</option>
                {areas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </>
          )}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={viewMode === 'tables' ? 'Tìm kiếm bàn...' : 'Tìm kiếm đặt bàn...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-['Inter']"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {viewMode === 'tables' ? (
          // Tables grid view
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTables.map(table => (
              <div
                key={table.id}
                className="bg-white rounded-lg border-2 border-gray-200 p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 font-['Inter']">{table.name}</h3>
                    <p className="text-sm text-gray-500 font-['Inter']">{table.area}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(table.status)} font-['Inter']`}>
                    {getStatusText(table.status)}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span className="font-['Inter']">Sức chứa: {table.capacity} người</span>
                  </div>
                  {table.currentGuests && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4 text-orange-500" />
                      <span className="font-['Inter']">Hiện tại: {table.currentGuests} người</span>
                    </div>
                  )}
                  {table.notes && (
                    <p className="text-xs text-gray-500 font-['Inter']">{table.notes}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  {table.status === 'available' && (
                    <button
                      onClick={() => {
                        updateTableStatus(table.id, 'reserved');
                        toast.success(`Đã đặt ${table.name}`);
                      }}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded hover:bg-yellow-100 transition-colors"
                    >
                      <span className="text-sm font-['Inter']">Đặt bàn</span>
                    </button>
                  )}
                  {table.status === 'reserved' && (
                    <button
                      onClick={() => {
                        updateTableStatus(table.id, 'occupied');
                        toast.success(`Khách đã đến ${table.name}`);
                      }}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                    >
                      <span className="text-sm font-['Inter']">Khách đến</span>
                    </button>
                  )}
                  {table.status === 'occupied' && (
                    <button
                      onClick={() => {
                        updateTableStatus(table.id, 'cleaning');
                        toast.success(`Đang dọn ${table.name}`);
                      }}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                    >
                      <span className="text-sm font-['Inter']">Dọn bàn</span>
                    </button>
                  )}
                  {table.status === 'cleaning' && (
                    <button
                      onClick={() => {
                        updateTableStatus(table.id, 'available');
                        toast.success(`${table.name} đã sẵn sàng`);
                      }}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
                    >
                      <span className="text-sm font-['Inter']">Hoàn thành</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenTableModal(table)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="text-sm font-['Inter']">Sửa</span>
                  </button>
                  <button
                    onClick={() => handleDeleteTable(table.id)}
                    className="flex items-center justify-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                    disabled={table.status === 'occupied' || table.status === 'reserved'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Reservations list view
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-['Inter']">Bàn</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-['Inter']">Khách hàng</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-['Inter']">SĐT</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-['Inter']">Thời gian</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-['Inter']">Số người</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-['Inter']">Trạng thái</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider font-['Inter']">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {todayReservations.map(reservation => (
                    <tr key={reservation.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 font-['Inter']">{reservation.tableName}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-['Inter']">{reservation.customerName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-['Inter']">{reservation.customerPhone}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-['Inter']">
                        {reservation.reservationTime}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-['Inter']">{reservation.numberOfGuests}</td>
                      <td className="px-4 py-3">
                        <select
                          value={reservation.status}
                          onChange={(e) => handleUpdateReservationStatus(reservation.id, e.target.value as TableReservation['status'])}
                          className={`px-2 py-1 rounded text-xs font-medium ${getReservationStatusColor(reservation.status)} border-0 font-['Inter']`}
                        >
                          <option value="confirmed">Đã xác nhận</option>
                          <option value="arrived">Đã đến</option>
                          <option value="cancelled">Đã hủy</option>
                          <option value="no-show">Không đến</option>
                          <option value="completed">Hoàn thành</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenReservationModal(reservation)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteReservation(reservation.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {todayReservations.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500 font-['Inter']">
                        Chưa có đặt bàn nào hôm nay
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Table Modal */}
      {showTableModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 font-['Inter']">
                {editingTable ? 'Chỉnh sửa bàn' : 'Thêm bàn mới'}
              </h2>
              <button
                onClick={() => setShowTableModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 font-['Inter']">
                  Tên bàn <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={tableForm.name}
                  onChange={(e) => setTableForm({ ...tableForm, name: e.target.value })}
                  placeholder="VD: Bàn 1, A1, VIP 1..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-['Inter']"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 font-['Inter']">
                  Khu vực <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={tableForm.area}
                  onChange={(e) => setTableForm({ ...tableForm, area: e.target.value })}
                  placeholder="VD: Tầng 1, VIP, Ngoài trời..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-['Inter']"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 font-['Inter']">
                  Sức chứa (người) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={tableForm.capacity}
                  onChange={(e) => setTableForm({ ...tableForm, capacity: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-['Inter']"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 font-['Inter']">
                  Ghi chú
                </label>
                <textarea
                  value={tableForm.notes}
                  onChange={(e) => setTableForm({ ...tableForm, notes: e.target.value })}
                  placeholder="Ghi chú về bàn..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-['Inter']"
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowTableModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-['Inter']"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveTable}
                className="flex-1 px-4 py-2 bg-[#FE7410] text-white rounded-lg hover:bg-[#E56609] transition-colors font-['Inter']"
              >
                {editingTable ? 'Cập nhật' : 'Thêm bàn'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reservation Modal */}
      {showReservationModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 font-['Inter']">
                {editingReservation ? 'Chỉnh sửa đặt bàn' : 'Đặt bàn mới'}
              </h2>
              <button
                onClick={() => setShowReservationModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 font-['Inter']">
                  Chọn bàn <span className="text-red-500">*</span>
                </label>
                <select
                  value={reservationForm.tableId}
                  onChange={(e) => setReservationForm({ ...reservationForm, tableId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-['Inter']"
                >
                  <option value="">-- Chọn bàn --</option>
                  {tables.filter(t => t.status === 'available' || (editingReservation && t.id === editingReservation.tableId)).map(table => (
                    <option key={table.id} value={table.id}>
                      {table.name} - {table.area} ({table.capacity} người)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 font-['Inter']">
                  Tên khách hàng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={reservationForm.customerName}
                  onChange={(e) => setReservationForm({ ...reservationForm, customerName: e.target.value })}
                  placeholder="Nhập tên khách hàng"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-['Inter']"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 font-['Inter']">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={reservationForm.customerPhone}
                  onChange={(e) => setReservationForm({ ...reservationForm, customerPhone: e.target.value })}
                  placeholder="Nhập số điện thoại"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-['Inter']"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 font-['Inter']">
                  Số người <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={reservationForm.numberOfGuests}
                  onChange={(e) => setReservationForm({ ...reservationForm, numberOfGuests: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-['Inter']"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 font-['Inter']">
                    Ngày đặt <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={reservationForm.reservationDate}
                    onChange={(e) => setReservationForm({ ...reservationForm, reservationDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-['Inter']"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 font-['Inter']">
                    Giờ đặt <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={reservationForm.reservationTime}
                    onChange={(e) => setReservationForm({ ...reservationForm, reservationTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-['Inter']"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 font-['Inter']">
                  Thời gian dự kiến (phút)
                </label>
                <input
                  type="number"
                  min="30"
                  step="30"
                  value={reservationForm.duration}
                  onChange={(e) => setReservationForm({ ...reservationForm, duration: parseInt(e.target.value) || 120 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-['Inter']"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 font-['Inter']">
                  Ghi chú
                </label>
                <textarea
                  value={reservationForm.notes}
                  onChange={(e) => setReservationForm({ ...reservationForm, notes: e.target.value })}
                  placeholder="Yêu cầu đặc biệt..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-['Inter']"
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowReservationModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-['Inter']"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveReservation}
                className="flex-1 px-4 py-2 bg-[#FE7410] text-white rounded-lg hover:bg-[#E56609] transition-colors font-['Inter']"
              >
                {editingReservation ? 'Cập nhật' : 'Đặt bàn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}