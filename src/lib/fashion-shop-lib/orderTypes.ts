// =====================================================
// ORDER TYPES - Type definitions cho Orders & Inventory
// Export các types để sử dụng trong app
// =====================================================

export type {
  Order,
  OrderItem,
  InventoryTransaction,
} from './mockOrderData';

export type {
  CreateOrderInput,
  UpdateOrderInput,
  OrderWithItems,
} from './mockOrderService';

// Re-export các helper functions
export {
  getOrderItemsByOrderId,
  getOrderWithItems,
  calculateTotalRevenue,
  countOrdersByStatus,
  countOrdersByPaymentStatus,
  getInventoryTransactionsByType,
  countInventoryTransactionsByStatus,
} from './mockOrderData';

// Re-export service
export { mockOrderService } from './mockOrderService';

// =====================================================
// UTILITY TYPES
// =====================================================

export type OrderStatus = 'DRAFT' | 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'VOIDED';
export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID' | 'REFUNDED';
export type DiscountType = 'PERCENTAGE' | 'FIXED' | 'COUPON';
export type TransactionType = 'IN' | 'OUT';
export type TransactionStatus = 'DRAFT' | 'POSTED' | 'CANCELLED';

// =====================================================
// DISPLAY HELPERS
// =====================================================

export const ORDER_STATUS_LABELS: Record<OrderStatus, { vi: string; en: string; color: string }> = {
  DRAFT: {
    vi: 'Nháp',
    en: 'Draft',
    color: 'default',
  },
  PENDING: {
    vi: 'Chờ xử lý',
    en: 'Pending',
    color: 'warning',
  },
  COMPLETED: {
    vi: 'Hoàn thành',
    en: 'Completed',
    color: 'success',
  },
  CANCELLED: {
    vi: 'Đã hủy',
    en: 'Cancelled',
    color: 'error',
  },
  VOIDED: {
    vi: 'Đã void',
    en: 'Voided',
    color: 'error',
  },
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, { vi: string; en: string; color: string }> = {
  UNPAID: {
    vi: 'Chưa thanh toán',
    en: 'Unpaid',
    color: 'default',
  },
  PARTIAL: {
    vi: 'Thanh toán một phần',
    en: 'Partial',
    color: 'warning',
  },
  PAID: {
    vi: 'Đã thanh toán',
    en: 'Paid',
    color: 'success',
  },
  REFUNDED: {
    vi: 'Đã hoàn tiền',
    en: 'Refunded',
    color: 'error',
  },
};

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, { vi: string; en: string; color: string }> = {
  IN: {
    vi: 'Nhập kho',
    en: 'Stock In',
    color: 'success',
  },
  OUT: {
    vi: 'Xuất kho',
    en: 'Stock Out',
    color: 'error',
  },
};

export const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, { vi: string; en: string; color: string }> = {
  DRAFT: {
    vi: 'Nháp',
    en: 'Draft',
    color: 'default',
  },
  POSTED: {
    vi: 'Đã duyệt',
    en: 'Posted',
    color: 'success',
  },
  CANCELLED: {
    vi: 'Đã hủy',
    en: 'Cancelled',
    color: 'error',
  },
};

// =====================================================
// PAYMENT METHODS
// =====================================================

export const PAYMENT_METHODS = [
  { value: 'CASH', label_vi: 'Tiền mặt', label_en: 'Cash', icon: '💵' },
  { value: 'BANK_TRANSFER', label_vi: 'Chuyển khoản', label_en: 'Bank Transfer', icon: '🏦' },
  { value: 'CARD', label_vi: 'Thẻ', label_en: 'Card', icon: '💳' },
  { value: 'E_WALLET', label_vi: 'Ví điện tử', label_en: 'E-Wallet', icon: '📱' },
  { value: 'COD', label_vi: 'Thu hộ (COD)', label_en: 'Cash on Delivery', icon: '📦' },
];

// =====================================================
// FORMATTERS
// =====================================================

/**
 * Format số tiền VNĐ
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

/**
 * Format số tiền ngắn gọn (K, M, B)
 */
export function formatCurrencyCompact(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}K`;
  }
  return formatCurrency(amount);
}

/**
 * Format date/time
 */
export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

/**
 * Format date only
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date));
}

/**
 * Format time only
 */
export function formatTime(date: string | Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}
