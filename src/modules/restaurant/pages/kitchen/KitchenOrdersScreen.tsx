import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { useState, useEffect, memo } from 'react';
import { useStore } from '../../../../lib/restaurant-lib/store';
import { useTranslation } from '../../../../lib/restaurant-lib/useTranslation';
import { useCrossTabSync } from '../../../../lib/restaurant-lib/useCrossTabSync';
import { toast } from 'sonner';
import { 
  Clock, 
  ChefHat, 
  Search, 
  X, 
  CheckCircle2, 
  Flame, 
  ShoppingBag, 
  ChevronRight, 
  UtensilsCrossed,
  ChevronDown,
  FileText,
  Trash2
} from 'lucide-react';
import type { KitchenOrder } from '../../../../lib/restaurant-lib/store';

// 🆕 Separate Timer Component - only this re-renders every second
const OrderTimer = memo(({ startTime, status }: { startTime: number; status: string }) => {
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  const getElapsedTime = (): string => {
    const elapsed = Math.floor((currentTime - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };
  
  const getTimerColor = (): string => {
    if (status === 'completed' || status === 'served') return 'text-green-600';
    const elapsedMinutes = Math.floor((currentTime - startTime) / 1000 / 60);
    if (elapsedMinutes < 10) return 'text-green-600';
    if (elapsedMinutes < 20) return 'text-orange-600';
    return 'text-red-600';
  };
  
  return (
    <div className={`flex items-center gap-1.5 text-base font-bold ${getTimerColor()}`}>
      <Clock className="w-5 h-5" />
      {getElapsedTime()}
    </div>
  );
});

export default function KitchenOrdersScreen() {
  const kitchenOrders = useStore((state) => state.kitchenOrders);
  const updateKitchenOrderStatus = useStore((state) => state.updateKitchenOrderStatus);
  const clearServedKitchenOrders = useStore((state) => state.clearServedKitchenOrders);
  const { t } = useTranslation();
  
  console.log('[KitchenOrdersScreen] 🔄 RENDER - Kitchen orders count:', kitchenOrders.length);
  
  // Enable cross-tab sync for real-time updates
  useCrossTabSync();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearModal, setShowClearModal] = useState(false); // 🆕 Modal xác nhận xóa
  
  // 🆕 Track collapsed state for each order by order ID
  const [collapsedOrders, setCollapsedOrders] = useState<Record<string, boolean>>({});
  
  // 🆕 Toggle collapse state for an order
  const toggleCollapse = (orderId: string) => {
    setCollapsedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };
  
  // Debug: Log kitchen orders to check for cancelled items
  useEffect(() => {
    console.log('[KitchenOrdersScreen] 📊 useEffect - Kitchen orders updated, total:', kitchenOrders.length);
    kitchenOrders.forEach(order => {
      // Log items with notes
      const itemsWithNotes = order.items.filter(item => item.note);
      if (itemsWithNotes.length > 0) {
        console.log('[KitchenOrdersScreen] 📝 Order has items with notes:', {
          orderId: order.id,
          orderNumber: order.orderNumber,
          itemsWithNotes: itemsWithNotes.map(item => ({
            name: item.name,
            note: item.note
          }))
        });
      }
      
      const cancelledItems = order.items.filter(item => item.cancelled || item.cancelReason);
      if (cancelledItems.length > 0) {
        console.log('[KitchenOrdersScreen] 🔍 Order has cancelled items:', {
          orderId: order.id,
          orderNumber: order.orderNumber,
          cancelledItems: cancelledItems.map(item => ({
            itemName: item.name,
            cancelled: item.cancelled,
            cancelReason: item.cancelReason,
            cancelledQuantity: item.cancelledQuantity
          }))
        });
      }
    });
  }, [kitchenOrders]);

  // Filter active kitchen orders (exclude served orders)
  const activeOrders = kitchenOrders.filter(order => {
    if (order.status === 'served') return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        order.orderNumber.toLowerCase().includes(query) ||
        order.tableName?.toLowerCase().includes(query) ||
        order.customerName?.toLowerCase().includes(query) ||
        order.items.some(item => item.name.toLowerCase().includes(query))
      );
    }
    
    return true;
  });

  // Handle order status change
  const handleStatusChange = (kitchenOrderId: string, newStatus: KitchenOrder['status']) => {
    console.log('[KitchenOrdersScreen] 🔄 Changing order status:', { kitchenOrderId, newStatus });
    
    updateKitchenOrderStatus(kitchenOrderId, newStatus);
    
    const statusMessages = {
      cooking: 'Bắt đầu chế biến',
      completed: 'Đã hoàn thành',
      served: 'Đã phục vụ',
    };
    
    if (newStatus in statusMessages) {
      toast.success(statusMessages[newStatus as keyof typeof statusMessages]);
    }
    
    console.log('[KitchenOrdersScreen] ✅ Status changed successfully');
  };

  // Group orders by status (4 columns)
  const pendingOrders = activeOrders.filter(o => o.status === 'pending');
  const cookingOrders = activeOrders.filter(o => o.status === 'cooking');
  const completedOrders = activeOrders.filter(o => o.status === 'completed');
  const servedOrders = kitchenOrders.filter(o => o.status === 'served'); // Show served for reference

  // 🆕 Handle clear served orders
  const handleClearServedOrders = () => {
    if (servedOrders.length === 0) {
      toast.error('Không có đơn đã phục vụ để xóa');
      return;
    }
    setShowClearModal(true);
  };

  const handleConfirmClear = () => {
    const count = clearServedKitchenOrders();
    console.log('[handleConfirmClear] 🧹 Cleared served orders:', count);
    
    toast.success(`✅ Đã xóa ${count} đơn bếp đã phục vụ`, {
      description: 'Màn hình đã được làm sạch cho ca mới',
      duration: 3000,
    });
    
    setShowClearModal(false);
  };

  // Get status display info
  const getStatusInfo = (status: KitchenOrder['status']) => {
    const statusMap = {
      pending: { text: 'Chờ chế biến', bgColor: 'from-gray-50', borderColor: 'border-gray-200', icon: Clock, iconBg: 'bg-gray-100', iconColor: 'text-gray-600' },
      cooking: { text: 'Đang chế biến', bgColor: 'from-blue-50', borderColor: 'border-blue-200', icon: Flame, iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
      completed: { text: 'Đã xong', bgColor: 'from-green-50', borderColor: 'border-green-200', icon: CheckCircle2, iconBg: 'bg-green-100', iconColor: 'text-green-600' },
      served: { text: 'Đã phục vụ', bgColor: 'from-purple-50', borderColor: 'border-purple-200', icon: ShoppingBag, iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
    };
    return statusMap[status];
  };

  // Render order card
  const renderOrderCard = (order: KitchenOrder) => {
    return (
      <DraggableOrderCard
        key={order.id}
        order={order}
        showActions={true}  // ✅ Always show actions for all orders
        onStatusChange={handleStatusChange}
      />
    );
  };

  // Draggable Order Card Component
  const DraggableOrderCard = ({ order, showActions, onStatusChange }: {
    order: KitchenOrder;
    showActions: boolean;
    onStatusChange: (id: string, status: KitchenOrder['status']) => void;
  }) => {
    const info = getStatusInfo(order.status);
    const isCollapsed = collapsedOrders[order.id] || false;
    
    const [{ isDragging }, drag] = useDrag(() => ({
      type: 'ORDER',
      item: { orderId: order.id, currentStatus: order.status },
      canDrag: order.status !== 'served', // Can't drag served orders
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }), [order.id, order.status]);

    // Get next status button
    const getNextStatusButton = () => {
      if (order.status === 'pending') {
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(order.id, 'cooking');
            }}
            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors group"
            title="Bắt đầu nấu"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        );
      }
      if (order.status === 'cooking') {
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(order.id, 'completed');
            }}
            className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors group"
            title="Hoàn thành"
          >
            <CheckCircle2 className="w-5 h-5 text-white" />
          </button>
        );
      }
      if (order.status === 'completed') {
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(order.id, 'served');
            }}
            className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors group"
            title="Đã phục vụ"
          >
            <ShoppingBag className="w-5 h-5 text-white" />
          </button>
        );
      }
      return null;
    };

    return (
      <div
        ref={drag}
        className={`bg-gradient-to-br ${info.bgColor} to-white border-2 ${info.borderColor} rounded-xl p-4 shadow-sm transition-all hover:shadow-md ${
          isDragging ? 'opacity-50 cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {/* Order Header */}
        <div className="mb-3 pb-3 border-b border-gray-200">
          {/* Row 1: Order Number + Timer + Action Button */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCollapse(order.id);
                }}
                className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                title={isCollapsed ? 'Mở rộng' : 'Thu gọn'}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                )}
              </button>
              <span className="text-base font-bold text-[#FE7410]">{order.orderNumber}</span>
              {/* 🆕 Badge "Gọi bổ sung" */}
              {order.isAdditionalOrder && (
                <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded">
                  Gọi bổ sung
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {order.status !== 'served' && (
                <OrderTimer startTime={order.startTime} status={order.status} />
              )}
              {showActions && getNextStatusButton()}
            </div>
          </div>
          
          {/* Row 2: Table Name + Item Count */}
          <div className="flex items-center gap-2 text-sm">
            {order.tableName && (
              <span className="font-semibold text-gray-700">{order.tableName}</span>
            )}
            {order.tableName && <span className="text-gray-300">•</span>}
            <span className="text-gray-500">{order.items.length} món</span>
          </div>
        </div>

        {/* Items List */}
        {!isCollapsed && (
          <div className="space-y-2">
            {order.items.map((item, idx) => {
              const isCancelled = item.cancelled || false;
              const hasCancelledQuantity = (item.cancelledQuantity || 0) > 0;
              
              // Debug: Log item with note
              if (item.note && idx === 0) {
                console.log('[KitchenOrdersScreen] 📝 Item has note:', item.name, '- Note:', item.note);
              }
              
              return (
                <div 
                  key={`${order.id}-${item.id}-${idx}`} 
                  className={`border-l-4 ${isCancelled ? 'border-red-400 bg-red-50' : 'border-[#FE7410]'} pl-3 ${isCancelled ? 'opacity-70' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className={`text-base font-bold ${isCancelled ? 'line-through text-red-600' : 'text-gray-900'}`}>
                        {item.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Số lượng: <span className={`font-semibold ${isCancelled ? 'line-through text-red-600' : 'text-[#FE7410]'}`}>
                          {item.quantity}
                        </span>
                        {hasCancelledQuantity && !isCancelled && (
                          <span className="ml-2 text-red-600 font-semibold">
                            (Hủy: {item.cancelledQuantity})
                          </span>
                        )}
                      </p>
                      {item.selectedOptions && item.selectedOptions.length > 0 && (
                        <p className={`text-xs mt-1 ${isCancelled ? 'text-red-500' : 'text-gray-500'}`}>
                          {item.selectedOptions.map(opt => opt.choiceName).join(', ')}
                        </p>
                      )}
                      {item.note && (
                        <p className={`text-xs font-medium mt-1 flex items-center gap-1 ${isCancelled ? 'text-red-500' : 'text-orange-600'}`}>
                          <FileText className="w-3 h-3 flex-shrink-0" />
                          <span>{item.note}</span>
                        </p>
                      )}
                      {item.cancelReason && (
                        <p className="text-xs text-red-700 font-bold mt-2 bg-red-100 px-2 py-1 rounded border border-red-300">
                          ❌ Lý do hủy: {item.cancelReason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Column component
  const KanbanColumn = ({ title, count, orders, icon: Icon, iconBg, iconColor, badgeColor, status, showClearButton }: {
    title: string;
    count: number;
    orders: KitchenOrder[];
    icon: any;
    iconBg: string;
    iconColor: string;
    badgeColor: string;
    status: KitchenOrder['status'];
    showClearButton?: boolean; // 🆕 Show clear button for served column
  }) => {
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
      accept: 'ORDER',
      drop: (item: { orderId: string; currentStatus: KitchenOrder['status'] }) => {
        // Only allow forward progression
        const statusOrder: KitchenOrder['status'][] = ['pending', 'cooking', 'completed', 'served'];
        const currentIndex = statusOrder.indexOf(item.currentStatus);
        const targetIndex = statusOrder.indexOf(status);
        
        // Only allow moving to the next status
        if (targetIndex === currentIndex + 1) {
          handleStatusChange(item.orderId, status);
        } else if (targetIndex !== currentIndex) {
          toast.error('Chỉ có thể chuyển sang trạng thái kế tiếp');
        }
      },
      canDrop: (item: { orderId: string; currentStatus: KitchenOrder['status'] }) => {
        const statusOrder: KitchenOrder['status'][] = ['pending', 'cooking', 'completed', 'served'];
        const currentIndex = statusOrder.indexOf(item.currentStatus);
        const targetIndex = statusOrder.indexOf(status);
        return targetIndex === currentIndex + 1;
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }), [status, handleStatusChange]);

    return (
      <div 
        ref={drop}
        className={`flex flex-col h-full bg-white rounded-xl shadow-sm border-2 overflow-hidden transition-all ${
          isOver && canDrop 
            ? 'border-[#FE7410] ring-2 ring-[#FE7410] ring-opacity-50' 
            : isOver && !canDrop
            ? 'border-red-400 ring-2 ring-red-400 ring-opacity-50'
            : 'border-gray-200'
        }`}
      >
        <div className={`px-5 py-4 border-b border-gray-200 bg-gradient-to-r ${iconBg.replace('bg-', 'from-')} to-white flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
                <p className="text-sm text-gray-500">{count} đơn</p>
              </div>
            </div>
            <div className={`px-3 py-1.5 ${badgeColor} text-white text-base font-bold rounded-full min-w-[2.5rem] text-center`}>
              {count}
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 kanban-scroll" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style>{`
            .kanban-scroll::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-16">
              <UtensilsCrossed className="w-20 h-20 mb-4 opacity-40" />
              <p className="text-base font-medium">Không có đơn</p>
            </div>
          ) : (
            orders.map(order => renderOrderCard(order))
          )}
        </div>
        
        {/* 🆕 Clear Button for Served Column */}
        {showClearButton && (
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-200">
            <button
              onClick={handleClearServedOrders}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-base font-bold rounded-lg transition-colors"
            >
              Xóa đơn đã phục vụ
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#FE7410] flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{t.kitchenOrders}</h1>
                <p className="text-sm text-gray-500">
                  {pendingOrders.length + cookingOrders.length} đang xử lý • {completedOrders.length} sẵn sàng
                </p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm đơn bếp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent text-base"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Kanban Board - 4 Columns */}
        <div className="flex-1 overflow-hidden p-6">
          <div className="grid grid-cols-4 gap-4 h-full">
            <KanbanColumn 
              title="Chờ chế biến"
              count={pendingOrders.length}
              orders={pendingOrders}
              icon={Clock}
              iconBg="bg-gray-100"
              iconColor="text-gray-600"
              badgeColor="bg-gray-600"
              status="pending"
            />
            
            <KanbanColumn 
              title="Đang chế biến"
              count={cookingOrders.length}
              orders={cookingOrders}
              icon={Flame}
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
              badgeColor="bg-blue-600"
              status="cooking"
            />
            
            <KanbanColumn 
              title="Đã xong"
              count={completedOrders.length}
              orders={completedOrders}
              icon={CheckCircle2}
              iconBg="bg-green-100"
              iconColor="text-green-600"
              badgeColor="bg-green-600"
              status="completed"
            />
            
            <KanbanColumn 
              title="Đã phục vụ"
              count={servedOrders.length}
              orders={servedOrders}
              icon={ShoppingBag}
              iconBg="bg-purple-100"
              iconColor="text-purple-600"
              badgeColor="bg-purple-600"
              status="served"
              showClearButton={true} // 🆕 Show clear button for served column
            />
          </div>
        </div>

        {/* 🆕 Modal Xác Nhận Xóa */}
        {showClearModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-red-50 rounded-t-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Xác nhận xóa đơn bếp</h2>
                    <p className="text-sm text-gray-600">Làm sạch màn hình cho ca mới</p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-4">
                <p className="text-base text-gray-700 mb-4">
                  Bạn có chắc chắn muốn xóa <span className="font-bold text-red-600">{servedOrders.length} đơn bếp</span> đã phục vụ không?
                </p>
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-900">
                    <strong>⚠️ Lưu ý:</strong> Thao tác này sẽ xóa toàn bộ đơn bếp đã phục vụ khỏi màn hình. 
                    Dữ liệu đơn hàng gốc vẫn được giữ lại trong lịch sử đơn hàng.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => setShowClearModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmClear}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  Xác nhận xóa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
}