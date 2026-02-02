import { useStore } from '../../../../lib/restaurant-lib/store';
import { useCrossTabSync } from '../../../../lib/restaurant-lib/useCrossTabSync';

/**
 * Test Page để verify Cross-Tab Sync
 * Mở component này ở 2 tabs để test
 */
export function CrossTabSyncTest() {
  useCrossTabSync();
  
  const { kitchenOrders, orders, updateKitchenItemStatus } = useStore();
  
  const handleTestUpdate = () => {
    if (kitchenOrders.length > 0) {
      const firstOrder = kitchenOrders[0];
      if (firstOrder.items.length > 0) {
        const firstItem = firstOrder.items[0];
        const newStatus = firstItem.itemStatus === 'pending' ? 'cooking' : 
                         firstItem.itemStatus === 'cooking' ? 'completed' :
                         firstItem.itemStatus === 'completed' ? 'served' : 'pending';
        
        console.log('🧪 TEST: Updating status to:', newStatus);
        updateKitchenItemStatus(firstOrder.id, firstItem.id, newStatus);
      }
    }
  };
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">Cross-Tab Sync Test</h1>
        <p className="text-gray-600 mb-4">
          Mở trang này ở 2 tabs khác nhau và nhấn nút bên dưới để test sync
        </p>
        
        <button
          onClick={handleTestUpdate}
          className="bg-[#FE7410] text-white px-6 py-3 rounded-lg hover:bg-[#E66309]"
        >
          🧪 Test Update Status
        </button>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Kitchen Orders ({kitchenOrders.length})</h2>
        <div className="space-y-4">
          {kitchenOrders.map(order => (
            <div key={order.id} className="border border-gray-200 rounded p-4">
              <div className="font-semibold mb-2">Order ID: {order.id}</div>
              <div className="text-sm text-gray-600 mb-2">Table: {order.tableName}</div>
              <div className="space-y-2">
                {order.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span>{item.name} x{item.quantity}</span>
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                      item.itemStatus === 'pending' ? 'bg-gray-200 text-gray-700' :
                      item.itemStatus === 'cooking' ? 'bg-blue-200 text-blue-700' :
                      item.itemStatus === 'completed' ? 'bg-green-200 text-green-700' :
                      'bg-purple-200 text-purple-700'
                    }`}>
                      {item.itemStatus}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {kitchenOrders.length === 0 && (
            <div className="text-gray-400 text-center py-8">
              Chưa có kitchen orders. Hãy thêm món từ màn hình bán hàng.
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-4">Orders with Item Statuses</h2>
        <div className="space-y-4">
          {orders.slice(0, 3).map(order => (
            <div key={order.id} className="border border-gray-200 rounded p-4">
              <div className="font-semibold mb-2">Order ID: {order.id}</div>
              {order.itemStatuses && Object.keys(order.itemStatuses).length > 0 && (
                <div className="text-sm space-y-1">
                  {Object.entries(order.itemStatuses).map(([itemId, status]) => (
                    <div key={itemId} className="flex items-center justify-between">
                      <span className="text-gray-600">{itemId}</span>
                      <span className="text-gray-800">
                        Completed: {status.completed}, Served: {status.served}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {order.lastKitchenSync && (
                <div className="text-xs text-gray-400 mt-2">
                  Last sync: {new Date(order.lastKitchenSync as string).toLocaleTimeString()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-bold mb-2">📝 How to Test:</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Mở trang này ở Tab 1</li>
          <li>Duplicate tab (Ctrl/Cmd + Shift + T) để tạo Tab 2</li>
          <li>Nhấn nút "Test Update Status" ở Tab 1</li>
          <li>Xem Tab 2 tự động cập nhật status (không cần refresh)</li>
          <li>Kiểm tra Console logs ở cả 2 tabs</li>
        </ol>
      </div>
    </div>
  );
}
