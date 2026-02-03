import { useState, useEffect } from 'react';
import { useStore } from '../../../../lib/restaurant-lib/store';
import { 
  List, LayoutGrid, Clock, User, MapPin, ShoppingBag, 
  Truck, ChefHat, AlertCircle, Package, Search, X
} from 'lucide-react';
import type { Order } from '../../../../lib/restaurant-lib/store';

type KitchenStatus = 'new' | 'processing' | 'partial' | 'completed';
type ViewMode = 'kanban' | 'list';
type FilterType = 'all' | 'dine-in' | 'takeaway' | 'delivery';

interface OrderWithStatus extends Order {
  kitchenStatus: KitchenStatus;
  itemsCompleted: string[]; // Array of cart item IDs that are completed
  startTime: number; // Timestamp when order was created
  completedTime?: number; // Timestamp when order was completed
}

export default function KitchenView() {
  const { kitchenOrders, updateKitchenOrder } = useStore();
  
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [ordersWithStatus, setOrdersWithStatus] = useState<OrderWithStatus[]>([]);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const itemsPerPage = 10;

  // Initialize orders with kitchen status
  useEffect(() => {
    setOrdersWithStatus(prevOrders => {
      const enrichedOrders: OrderWithStatus[] = kitchenOrders
        .map(kitchenOrder => {
          // Convert KitchenOrder to OrderWithStatus format
          return {
            id: kitchenOrder.orderId,
            items: kitchenOrder.items,
            subtotal: kitchenOrder.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
            discount: 0,
            total: kitchenOrder.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
            date: kitchenOrder.createdAt,
            timestamp: kitchenOrder.createdAt,
            status: 'completed' as const,
            paymentMethod: 'cash' as const,
            kitchenStatus: kitchenOrder.status,
            itemsCompleted: kitchenOrder.itemsCompleted || [],
            startTime: kitchenOrder.startTime,
            completedTime: kitchenOrder.completedTime,
            orderType: kitchenOrder.orderType,
            tableId: kitchenOrder.tableId,
            tableName: kitchenOrder.tableName,
            tableNumber: kitchenOrder.tableNumber,
            customerName: kitchenOrder.customerName,
          } as OrderWithStatus;
        });
      
      // Only update if there are actual changes
      if (JSON.stringify(enrichedOrders) === JSON.stringify(prevOrders)) {
        return prevOrders;
      }
      return enrichedOrders;
    });
  }, [kitchenOrders]);

  // Update current time every second for timers (only for non-completed orders)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getElapsedTime = (startTime: number, completedTime?: number): string => {
    const endTime = completedTime || currentTime;
    const elapsed = Math.floor((endTime - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const getTimerColor = (startTime: number, isCompleted: boolean, completedTime?: number): string => {
    if (isCompleted) return 'text-green-600';
    const endTime = completedTime || currentTime;
    const elapsed = Math.floor((endTime - startTime) / 1000 / 60);
    if (elapsed < 15) return 'text-green-600';
    if (elapsed < 30) return 'text-orange-600';
    return 'text-red-600';
  };

  const moveToNextStatus = (orderId: string) => {
    const order = ordersWithStatus.find(o => o.id === orderId);
    if (!order) return;
    
    // Find the matching kitchen order to get its ID
    const kitchenOrder = kitchenOrders.find(ko => ko.orderId === orderId);
    if (!kitchenOrder) return;
    
    let newStatus: KitchenStatus = order.kitchenStatus;
    switch (order.kitchenStatus) {
      case 'new':
        newStatus = 'processing';
        break;
      case 'processing':
        newStatus = 'partial';
        break;
      case 'partial':
        newStatus = 'completed';
        break;
    }
    
    const updateData: any = { status: newStatus };
    
    // Save completion time when moving to completed
    if (newStatus === 'completed') {
      updateData.completedTime = Date.now();
      // Auto-complete all items when order is completed
      const allItemIds = order.items?.map((item, index) => item.id + index) || [];
      updateData.itemsCompleted = allItemIds;
    }
    
    // Update kitchen order in store
    updateKitchenOrder(kitchenOrder.id, updateData);
  };

  const toggleItemComplete = (orderId: string, itemId: string) => {
    const order = ordersWithStatus.find(o => o.id === orderId);
    if (!order) return;
    
    // Find the matching kitchen order to get its ID
    const kitchenOrder = kitchenOrders.find(ko => ko.orderId === orderId);
    if (!kitchenOrder) return;
    
    const itemsCompleted = order.itemsCompleted.includes(itemId)
      ? order.itemsCompleted.filter(id => id !== itemId)
      : [...order.itemsCompleted, itemId];
    
    // Update kitchen order in store
    updateKitchenOrder(kitchenOrder.id, { itemsCompleted });
  };

  const getOrderTypeInfo = (order: Order) => {
    if (order.tableNumber) {
      return {
        label: `Bàn ${order.tableNumber}`,
        color: 'bg-blue-100 text-blue-700',
        icon: <MapPin className="w-3 h-3" />
      };
    }
    if (order.orderType === 'delivery') {
      return {
        label: 'Giao hàng',
        color: 'bg-purple-100 text-purple-700',
        icon: <Truck className="w-3 h-3" />
      };
    }
    return {
      label: 'Mang về',
      color: 'bg-orange-100 text-orange-700',
      icon: <ShoppingBag className="w-3 h-3" />
    };
  };

  const getStatusButton = (status: KitchenStatus) => {
    switch (status) {
      case 'new':
        return {
          label: 'Bắt đầu xử lý',
          color: 'bg-blue-600 hover:bg-blue-700 text-white',
        };
      case 'processing':
        return {
          label: 'Xong 1 phần',
          color: 'bg-orange-600 hover:bg-orange-700 text-white',
        };
      case 'partial':
        return {
          label: 'Hoàn thành',
          color: 'bg-green-600 hover:bg-green-700 text-white',
        };
      case 'completed':
        return {
          label: 'Đã xong',
          color: 'bg-gray-400 text-white cursor-not-allowed',
        };
    }
  };

  const getColumnOrders = (status: KitchenStatus) => {
    let filtered = ordersWithStatus.filter(o => o.kitchenStatus === status);
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(o => 
        o.id.toLowerCase().includes(searchLower) ||
        (o.customerName && o.customerName.toLowerCase().includes(searchLower)) ||
        (o.tableNumber && o.tableNumber.toString().includes(searchLower)) ||
        o.items.some((item) => item.name.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(o => {
        if (filterType === 'dine-in') return !!o.tableNumber;
        if (filterType === 'takeaway') return !o.tableNumber && o.orderType !== 'delivery';
        if (filterType === 'delivery') return o.orderType === 'delivery';
        return true;
      });
    }
    
    return filtered;
  };

  const filteredOrders = ordersWithStatus.filter(o => {
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        o.id.toLowerCase().includes(searchLower) ||
        (o.customerName && o.customerName.toLowerCase().includes(searchLower)) ||
        (o.tableNumber && o.tableNumber.toString().includes(searchLower)) ||
        o.items.some((item) => item.name.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }
    
    // Apply type filter
    if (filterType !== 'all') {
      if (filterType === 'dine-in' && !o.tableNumber) return false;
      if (filterType === 'takeaway' && (o.tableNumber || o.orderType === 'delivery')) return false;
      if (filterType === 'delivery' && o.orderType !== 'delivery') return false;
    }
    
    return true;
  });

  const columns: Array<{ id: KitchenStatus; title: string; color: string }> = [
    { id: 'new', title: 'Mới', color: 'bg-gray-100 border-gray-300' },
    { id: 'processing', title: 'Đang xử lý', color: 'bg-blue-50 border-blue-300' },
    { id: 'partial', title: 'Xong 1 phần', color: 'bg-orange-50 border-orange-300' },
    { id: 'completed', title: 'Đã xong hết', color: 'bg-green-50 border-green-300' },
  ];

  const OrderCard = ({ order }: { order: OrderWithStatus }) => {
    const typeInfo = getOrderTypeInfo(order);
    const statusButton = getStatusButton(order.kitchenStatus);
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-bold text-gray-900">{order.id}</h3>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
              {typeInfo.icon}
              {typeInfo.label}
            </span>
          </div>
          <div className={`flex items-center gap-1.5 font-mono font-semibold ${getTimerColor(order.startTime, order.kitchenStatus === 'completed', order.completedTime)}`}>
            <Clock className="w-4 h-4" />
            {getElapsedTime(order.startTime, order.completedTime)}
          </div>
        </div>

        {/* Customer Name */}
        {order.customerName && (
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <User className="w-4 h-4 text-gray-400" />
            <span className="font-medium">{order.customerName}</span>
          </div>
        )}

        {/* Order Note */}
        {order.note && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2.5">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800 font-medium">{order.note}</p>
            </div>
          </div>
        )}

        {/* Total Items Count */}
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
          <ChefHat className="w-4 h-4 text-[#FE7410]" />
          <span className="font-semibold text-gray-900">{totalItems} món</span>
        </div>

        {/* Items List */}
        <div className="space-y-2 border-t border-gray-200 pt-3">
          {order.items.map((item, index) => {
            const isCompleted = order.itemsCompleted.includes(item.id + index);
            return (
              <div key={item.id + index} className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={isCompleted}
                  onChange={() => toggleItemComplete(order.id, item.id + index)}
                  className="mt-1 w-4 h-4 text-[#FE7410] border-gray-300 rounded focus:ring-[#FE7410] cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <span className={`text-sm font-medium ${isCompleted ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {item.name}
                    </span>
                    <span className={`text-sm font-bold ${isCompleted ? 'text-gray-400' : 'text-gray-900'}`}>
                      x{item.quantity}
                    </span>
                  </div>
                  {item.note && (
                    <p className="text-xs text-gray-500 mt-1 italic">{item.note}</p>
                  )}
                </div>
              </div>
            );
          }) || null}
        </div>

        {/* Action Button */}
        {order.kitchenStatus !== 'completed' && (
          <button
            onClick={() => moveToNextStatus(order.id)}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${statusButton.color}`}
          >
            {statusButton.label}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="page-title">Quản lý đơn hàng - Bếp</h1>
            <p className="text-gray-500 text-sm mt-1">
              Theo dõi và xử lý đơn hàng theo thời gian thực
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="w-4 h-4" />
              Danh sách
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'kanban'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Kanban
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          {columns.map(col => {
            const count = getColumnOrders(col.id).length;
            return (
              <div key={col.id} className={`${col.color} border-2 rounded-lg p-4`}>
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600 mt-1">{col.title}</div>
              </div>
            );
          })}
        </div>

        {/* Search and Filters - Only for Kanban View */}
        {viewMode === 'kanban' && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4">
            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo mã đơn, tên khách, số bàn, món ăn..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FE7410] focus:border-[#FE7410] outline-none"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Type Filters */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    filterType === 'all'
                      ? 'bg-[#FE7410] text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setFilterType('dine-in')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    filterType === 'dine-in'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  Bàn
                </button>
                <button
                  onClick={() => setFilterType('takeaway')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    filterType === 'takeaway'
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Mang về
                </button>
                <button
                  onClick={() => setFilterType('delivery')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    filterType === 'delivery'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  Giao hàng
                </button>
              </div>
            </div>
            
            {/* Active Search/Filter Indicator */}
            {(searchTerm || filterType !== 'all') && (
              <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <AlertCircle className="w-4 h-4 text-[#FE7410]" />
                  <span>
                    Đang hiển thị <span className="font-semibold text-gray-900">{filteredOrders.length}</span> đơn hàng
                    {searchTerm && <span> với từ khóa &quot;<span className="font-semibold text-gray-900">{searchTerm}</span>&quot;</span>}
                    {filterType !== 'all' && <span> - loại <span className="font-semibold text-gray-900">{filterType === 'dine-in' ? 'Bàn' : filterType === 'takeaway' ? 'Mang về' : 'Giao hàng'}</span></span>}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('all');
                  }}
                  className="text-sm font-medium text-[#FE7410] hover:text-[#FE7410]/80 flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>
        )}

        {/* Search and Filters - For List View */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4">
            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo mã đơn, tên khách, số bàn, món ăn..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FE7410] focus:border-[#FE7410] outline-none"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Type Filters */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    filterType === 'all'
                      ? 'bg-[#FE7410] text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setFilterType('dine-in')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    filterType === 'dine-in'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  Bàn
                </button>
                <button
                  onClick={() => setFilterType('takeaway')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    filterType === 'takeaway'
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Mang về
                </button>
                <button
                  onClick={() => setFilterType('delivery')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    filterType === 'delivery'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  Giao hàng
                </button>
              </div>
            </div>
            
            {/* Active Search/Filter Indicator */}
            {(searchTerm || filterType !== 'all') && (
              <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <AlertCircle className="w-4 h-4 text-[#FE7410]" />
                  <span>
                    Đang hiển thị <span className="font-semibold text-gray-900">{filteredOrders.length}</span> đơn hàng
                    {searchTerm && <span> với từ khóa &quot;<span className="font-semibold text-gray-900">{searchTerm}</span>&quot;</span>}
                    {filterType !== 'all' && <span> - loại <span className="font-semibold text-gray-900">{filterType === 'dine-in' ? 'Bàn' : filterType === 'takeaway' ? 'Mang về' : 'Giao hàng'}</span></span>}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('all');
                  }}
                  className="text-sm font-medium text-[#FE7410] hover:text-[#FE7410]/80 flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-4 gap-4 h-[calc(100vh-420px)]">
          {columns.map(column => {
            const columnOrders = getColumnOrders(column.id);
            return (
              <div key={column.id} className="flex flex-col h-full">
                <div className={`${column.color} border-2 rounded-t-lg px-4 py-3`}>
                  <h2 className="font-bold text-gray-900">
                    {column.title} ({columnOrders.length})
                  </h2>
                </div>
                <div className="bg-gray-100 p-2 space-y-3 overflow-y-auto flex-1 rounded-b-lg border-x-2 border-b-2 border-gray-300" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  <style>{`
                    .bg-gray-100::-webkit-scrollbar {
                      display: none;
                    }
                  `}</style>
                  {columnOrders.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Không có đơn hàng</p>
                    </div>
                  ) : (
                    columnOrders.map(order => (
                      <OrderCard key={order.id} order={order} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (() => {
        const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
        
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Mã đơn</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Loại</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Khách hàng</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Số món</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Thời gian</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedOrders.map(order => {
                    const typeInfo = getOrderTypeInfo(order);
                    const statusButton = getStatusButton(order.kitchenStatus);
                    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
                    
                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="font-bold text-gray-900">{order.id}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
                            {typeInfo.icon}
                            {typeInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-900">{order.customerName || '-'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-semibold text-gray-900">{totalItems} món</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-mono font-semibold text-sm ${getTimerColor(order.startTime, order.kitchenStatus === 'completed', order.completedTime)}`}>
                            {getElapsedTime(order.startTime, order.completedTime)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-900">
                            {columns.find(c => c.id === order.kitchenStatus)?.title}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {order.kitchenStatus !== 'completed' && (
                            <button
                              onClick={() => moveToNextStatus(order.id)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${statusButton.color}`}
                            >
                              {statusButton.label}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {ordersWithStatus.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Package className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p className="text-lg font-medium text-gray-600">Không có đơn hàng nào</p>
                </div>
              )}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Hiển thị {startIndex + 1} - {Math.min(endIndex, ordersWithStatus.length)} trong tổng số {ordersWithStatus.length} đơn hàng
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                          currentPage === page
                            ? 'bg-[#FE7410] text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}