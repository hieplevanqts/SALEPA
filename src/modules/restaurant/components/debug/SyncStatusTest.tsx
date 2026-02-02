import { useEffect } from 'react';
import { useStore } from '../../../../lib/restaurant-lib/store';

/**
 * Component test để kiểm tra đồng bộ trạng thái giữa bếp và bán hàng
 * Thêm component này vào App.tsx để test
 */
export function SyncStatusTest() {
  const { kitchenOrders, orders } = useStore();
  
  useEffect(() => {
    console.log('=== SYNC STATUS TEST ===');
    console.log('Kitchen Orders:', kitchenOrders);
    console.log('Orders with itemStatuses:', orders.map(o => ({
      id: o.id,
      itemStatuses: o.itemStatuses,
      lastKitchenSync: (o as any).lastKitchenSync
    })));
    console.log('========================');
  }, [kitchenOrders, orders]);
  
  return null; // Component ẩn, chỉ log console
}
