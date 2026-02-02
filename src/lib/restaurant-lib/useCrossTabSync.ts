import { useEffect } from 'react';
import { useStore } from './store';

/**
 * Cross-Tab Sync Hook
 * Lắng nghe localStorage changes từ các tabs khác và force re-render
 * 
 * Cách hoạt động:
 * 1. Tab A cập nhật store → Zustand persist → localStorage thay đổi
 * 2. Tab B lắng nghe storage event → Phát hiện thay đổi
 * 3. Tab B force Zustand rehydrate → Component re-render với data mới
 */
export function useCrossTabSync() {
  useEffect(() => {
    // Handle custom events (same tab)
    const handleKitchenItemsChanged = (e: Event) => {
      const customEvent = e as CustomEvent;
      console.log('[CrossTabSync] 🍳 Kitchen items changed (same tab):', customEvent.detail);
      
      // Force re-render by reading from localStorage
      const stored = localStorage.getItem('pos-storage');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed?.state?.kitchenOrders) {
            useStore.setState({ 
              kitchenOrders: parsed.state.kitchenOrders 
            });
            console.log('[CrossTabSync] ✅ Forced kitchen orders refresh');
          }
        } catch (error) {
          console.error('[CrossTabSync] ❌ Error refreshing kitchen orders:', error);
        }
      }
    };
    
    const handleStorageChange = (e: StorageEvent) => {
      // Chỉ xử lý khi localStorage thay đổi
      if (e.storageArea !== localStorage) return;
      
      // Chỉ xử lý khi key = 'pos-storage' (tên key của Zustand persist)
      if (e.key !== 'pos-storage') return;
      
      console.log('[CrossTabSync] 🔄 Storage changed from another tab');
      
      // Parse new value để kiểm tra xem có update kitchenOrders hoặc orders không
      try {
        const newState = e.newValue ? JSON.parse(e.newValue) : null;
        
        if (newState?.state) {
          const hasKitchenOrders = newState.state.kitchenOrders;
          const hasOrders = newState.state.orders;
          
          if (hasKitchenOrders || hasOrders) {
            console.log('[CrossTabSync] ✅ Detected kitchen/order changes, forcing sync');
            
            // Force Zustand rehydrate by manually updating state
            // This will trigger re-render in all subscribed components
            
            // Merge kitchen orders
            if (hasKitchenOrders) {
              useStore.setState({ 
                kitchenOrders: newState.state.kitchenOrders 
              });
              console.log('[CrossTabSync] 📋 Updated kitchenOrders from other tab');
            }
            
            // Merge orders
            if (hasOrders) {
              useStore.setState({ 
                orders: newState.state.orders 
              });
              console.log('[CrossTabSync] 📋 Updated orders from other tab');
            }
            
            // Force additional render to ensure badges update
            window.dispatchEvent(new CustomEvent('cross-tab-sync'));
          }
        }
      } catch (error) {
        console.error('[CrossTabSync] ❌ Error parsing storage event:', error);
      }
    };
    
    // Thêm event listener
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('kitchen-items-changed', handleKitchenItemsChanged);
    console.log('[CrossTabSync] 🎧 Listening for cross-tab changes...');
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('kitchen-items-changed', handleKitchenItemsChanged);
      console.log('[CrossTabSync] 🛑 Stopped listening');
    };
  }, []);
}
