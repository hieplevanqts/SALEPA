// =====================================================
// MOCK ORDER DATA - ORDERS, ORDER_ITEMS, INVENTORY_TRANSACTIONS
// Mock data cho hệ thống đơn hàng và kho
// =====================================================

// =====================================================
// TYPES - Orders & Inventory
// =====================================================

export interface Order {
  _id: string;
  tenant_id: string;
  order_number: string;
  invoice_number: string | null;
  customer_id: string | null;
  cashier_id: string | null;
  subtotal: number;
  discount_amount: number;
  discount_type: 'PERCENTAGE' | 'FIXED' | 'COUPON' | null;
  discount_value: number | null;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  change_amount: number;
  payment_status: 'UNPAID' | 'PARTIAL' | 'PAID' | 'REFUNDED';
  payment_method: string | null;
  status: 'DRAFT' | 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'VOIDED';
  customer_notes: string | null;
  internal_notes: string | null;
  completed_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface OrderItem {
  _id: string;
  tenant_id: string;
  order_id: string;
  product_id: string;
  variant_id: string | null;
  product_name: string;
  product_sku: string | null;
  quantity: number;
  unit: string | null;
  sale_price: number;
  final_price: number;
  discount_amount: number;
  discount_type: 'PERCENTAGE' | 'FIXED' | null;
  discount_value: number | null;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  notes: string | null;
  created_at: string;
}

export interface InventoryTransaction {
  _id: string;
  tenant_id: string;
  transaction_type: 'IN' | 'OUT';
  transaction_code: string;
  status: 'DRAFT' | 'POSTED' | 'CANCELLED';
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// =====================================================
// CONSTANTS
// =====================================================

const TENANT_ID = '01942c1a-b2e4-7d4e-9a3f-1234567890ab';
const CASHIER_ID = '01942c1a-0001-0000-0000-000000000099'; // Mock cashier user
const CUSTOMER_ID = '01942c1a-0001-0000-0000-000000000088'; // Mock customer

// Product IDs from mockProductData_fashion_only.ts
const PRODUCT_IDS = {
  aoThunBasic: 'PRD-001-Fashion',
  quanJeanSlim: 'PRD-002-Fashion',
  damMauiMidi: 'PRD-003-Fashion',
};

// Variant IDs from mockProductData_fashion_only.ts
const VARIANT_IDS = {
  aoThunBasic_Red_M: 'VAR-001-Red-M',
  aoThunBasic_Blue_L: 'VAR-001-Blue-L',
  quanJeanSlim_DarkBlue_30: 'VAR-002-DarkBlue-30',
  quanJeanSlim_Black_32: 'VAR-002-Black-32',
  damMauiMidi_White_M: 'VAR-003-White-M',
};

// =====================================================
// MOCK ORDERS DATA
// =====================================================

export const mockOrders: Order[] = [
  // Order 1 - Đơn hàng hoàn thành
  {
    _id: 'ORD-001',
    tenant_id: TENANT_ID,
    order_number: 'DH-2024-0001',
    invoice_number: 'HD-2024-0001',
    customer_id: CUSTOMER_ID,
    cashier_id: CASHIER_ID,
    subtotal: 498000,
    discount_amount: 49800,
    discount_type: 'PERCENTAGE',
    discount_value: 10,
    tax_amount: 44820,
    total_amount: 493020,
    paid_amount: 500000,
    change_amount: 6980,
    payment_status: 'PAID',
    payment_method: 'CASH',
    status: 'COMPLETED',
    customer_notes: null,
    internal_notes: 'Khách hàng thân thiết',
    completed_at: '2024-01-20T10:30:00Z',
    created_by: CASHIER_ID,
    created_at: '2024-01-20T10:15:00Z',
    updated_at: '2024-01-20T10:30:00Z',
    deleted_at: null,
  },

  // Order 2 - Đơn hàng hoàn thành, thanh toán chuyển khoản
  {
    _id: 'ORD-002',
    tenant_id: TENANT_ID,
    order_number: 'DH-2024-0002',
    invoice_number: 'HD-2024-0002',
    customer_id: null, // Khách lạ
    cashier_id: CASHIER_ID,
    subtotal: 399000,
    discount_amount: 0,
    discount_type: null,
    discount_value: null,
    tax_amount: 39900,
    total_amount: 438900,
    paid_amount: 438900,
    change_amount: 0,
    payment_status: 'PAID',
    payment_method: 'BANK_TRANSFER',
    status: 'COMPLETED',
    customer_notes: null,
    internal_notes: null,
    completed_at: '2024-01-20T14:45:00Z',
    created_by: CASHIER_ID,
    created_at: '2024-01-20T14:30:00Z',
    updated_at: '2024-01-20T14:45:00Z',
    deleted_at: null,
  },

  // Order 3 - Đơn hàng chưa thanh toán
  {
    _id: 'ORD-003',
    tenant_id: TENANT_ID,
    order_number: 'DH-2024-0003',
    invoice_number: null,
    customer_id: CUSTOMER_ID,
    cashier_id: CASHIER_ID,
    subtotal: 799000,
    discount_amount: 79900,
    discount_type: 'FIXED',
    discount_value: 79900,
    tax_amount: 71910,
    total_amount: 791010,
    paid_amount: 0,
    change_amount: 0,
    payment_status: 'UNPAID',
    payment_method: null,
    status: 'PENDING',
    customer_notes: 'Giữ hàng đến chiều',
    internal_notes: 'Khách hàng sẽ đến lấy lúc 17h',
    completed_at: null,
    created_by: CASHIER_ID,
    created_at: '2024-01-21T09:00:00Z',
    updated_at: '2024-01-21T09:00:00Z',
    deleted_at: null,
  },

  // Order 4 - Đơn hàng thanh toán một phần
  {
    _id: 'ORD-004',
    tenant_id: TENANT_ID,
    order_number: 'DH-2024-0004',
    invoice_number: null,
    customer_id: CUSTOMER_ID,
    cashier_id: CASHIER_ID,
    subtotal: 1197000,
    discount_amount: 0,
    discount_type: null,
    discount_value: null,
    tax_amount: 119700,
    total_amount: 1316700,
    paid_amount: 500000,
    change_amount: 0,
    payment_status: 'PARTIAL',
    payment_method: 'CASH',
    status: 'PENDING',
    customer_notes: null,
    internal_notes: 'Đã đặt cọc 500k, còn lại 816.7k',
    completed_at: null,
    created_by: CASHIER_ID,
    created_at: '2024-01-21T11:30:00Z',
    updated_at: '2024-01-21T11:35:00Z',
    deleted_at: null,
  },

  // Order 5 - Đơn hàng đã hủy
  {
    _id: 'ORD-005',
    tenant_id: TENANT_ID,
    order_number: 'DH-2024-0005',
    invoice_number: null,
    customer_id: null,
    cashier_id: CASHIER_ID,
    subtotal: 249000,
    discount_amount: 0,
    discount_type: null,
    discount_value: null,
    tax_amount: 24900,
    total_amount: 273900,
    paid_amount: 0,
    change_amount: 0,
    payment_status: 'UNPAID',
    payment_method: null,
    status: 'CANCELLED',
    customer_notes: null,
    internal_notes: 'Khách hàng hủy do không vừa size',
    completed_at: null,
    created_by: CASHIER_ID,
    created_at: '2024-01-21T15:00:00Z',
    updated_at: '2024-01-21T15:10:00Z',
    deleted_at: null,
  },

  // Order 6 - Đơn hàng hoàn tiền
  {
    _id: 'ORD-006',
    tenant_id: TENANT_ID,
    order_number: 'DH-2024-0006',
    invoice_number: 'HD-2024-0006',
    customer_id: CUSTOMER_ID,
    cashier_id: CASHIER_ID,
    subtotal: 399000,
    discount_amount: 0,
    discount_type: null,
    discount_value: null,
    tax_amount: 39900,
    total_amount: 438900,
    paid_amount: 438900,
    change_amount: 0,
    payment_status: 'REFUNDED',
    payment_method: 'CASH',
    status: 'VOIDED',
    customer_notes: null,
    internal_notes: 'Hoàn tiền do sản phẩm bị lỗi',
    completed_at: '2024-01-22T10:00:00Z',
    created_by: CASHIER_ID,
    created_at: '2024-01-22T09:30:00Z',
    updated_at: '2024-01-22T10:15:00Z',
    deleted_at: null,
  },

  // Order 7 - Đơn nháp
  {
    _id: 'ORD-007',
    tenant_id: TENANT_ID,
    order_number: 'DH-2024-0007',
    invoice_number: null,
    customer_id: null,
    cashier_id: CASHIER_ID,
    subtotal: 249000,
    discount_amount: 0,
    discount_type: null,
    discount_value: null,
    tax_amount: 24900,
    total_amount: 273900,
    paid_amount: 0,
    change_amount: 0,
    payment_status: 'UNPAID',
    payment_method: null,
    status: 'DRAFT',
    customer_notes: null,
    internal_notes: 'Đơn hàng đang soạn',
    completed_at: null,
    created_by: CASHIER_ID,
    created_at: '2024-01-23T08:00:00Z',
    updated_at: '2024-01-23T08:00:00Z',
    deleted_at: null,
  },
];

// =====================================================
// MOCK ORDER ITEMS DATA
// =====================================================

export const mockOrderItems: OrderItem[] = [
  // Order 1 Items
  {
    _id: 'OI-001-1',
    tenant_id: TENANT_ID,
    order_id: 'ORD-001',
    product_id: PRODUCT_IDS.aoThunBasic,
    variant_id: VARIANT_IDS.aoThunBasic_Red_M,
    product_name: 'Áo Thun Basic Cotton',
    product_sku: 'SKU-001-RED-M',
    quantity: 2,
    unit: 'Cái',
    sale_price: 249000,
    final_price: 224100, // Sau giảm giá 10%
    discount_amount: 24900,
    discount_type: 'PERCENTAGE',
    discount_value: 10,
    subtotal: 498000,
    tax_rate: 10,
    tax_amount: 44820,
    total_amount: 493020,
    notes: null,
    created_at: '2024-01-20T10:15:00Z',
  },

  // Order 2 Items
  {
    _id: 'OI-002-1',
    tenant_id: TENANT_ID,
    order_id: 'ORD-002',
    product_id: PRODUCT_IDS.quanJeanSlim,
    variant_id: VARIANT_IDS.quanJeanSlim_DarkBlue_30,
    product_name: 'Quần Jean Slim Fit',
    product_sku: 'SKU-002-DARKBLUE-30',
    quantity: 1,
    unit: 'Cái',
    sale_price: 399000,
    final_price: 399000,
    discount_amount: 0,
    discount_type: null,
    discount_value: null,
    subtotal: 399000,
    tax_rate: 10,
    tax_amount: 39900,
    total_amount: 438900,
    notes: null,
    created_at: '2024-01-20T14:30:00Z',
  },

  // Order 3 Items
  {
    _id: 'OI-003-1',
    tenant_id: TENANT_ID,
    order_id: 'ORD-003',
    product_id: PRODUCT_IDS.damMauiMidi,
    variant_id: VARIANT_IDS.damMauiMidi_White_M,
    product_name: 'Đầm Maxi Midi Hoa',
    product_sku: 'SKU-003-WHITE-M',
    quantity: 1,
    unit: 'Cái',
    sale_price: 799000,
    final_price: 719100, // Sau giảm 79900
    discount_amount: 79900,
    discount_type: 'FIXED',
    discount_value: 79900,
    subtotal: 799000,
    tax_rate: 10,
    tax_amount: 71910,
    total_amount: 791010,
    notes: 'Size M',
    created_at: '2024-01-21T09:00:00Z',
  },

  // Order 4 Items - Multiple items
  {
    _id: 'OI-004-1',
    tenant_id: TENANT_ID,
    order_id: 'ORD-004',
    product_id: PRODUCT_IDS.aoThunBasic,
    variant_id: VARIANT_IDS.aoThunBasic_Blue_L,
    product_name: 'Áo Thun Basic Cotton',
    product_sku: 'SKU-001-BLUE-L',
    quantity: 2,
    unit: 'Cái',
    sale_price: 249000,
    final_price: 249000,
    discount_amount: 0,
    discount_type: null,
    discount_value: null,
    subtotal: 498000,
    tax_rate: 10,
    tax_amount: 49800,
    total_amount: 547800,
    notes: null,
    created_at: '2024-01-21T11:30:00Z',
  },
  {
    _id: 'OI-004-2',
    tenant_id: TENANT_ID,
    order_id: 'ORD-004',
    product_id: PRODUCT_IDS.quanJeanSlim,
    variant_id: VARIANT_IDS.quanJeanSlim_Black_32,
    product_name: 'Quần Jean Slim Fit',
    product_sku: 'SKU-002-BLACK-32',
    quantity: 1,
    unit: 'Cái',
    sale_price: 399000,
    final_price: 399000,
    discount_amount: 0,
    discount_type: null,
    discount_value: null,
    subtotal: 399000,
    tax_rate: 10,
    tax_amount: 39900,
    total_amount: 438900,
    notes: null,
    created_at: '2024-01-21T11:30:00Z',
  },
  {
    _id: 'OI-004-3',
    tenant_id: TENANT_ID,
    order_id: 'ORD-004',
    product_id: PRODUCT_IDS.damMauiMidi,
    variant_id: VARIANT_IDS.damMauiMidi_White_M,
    product_name: 'Đầm Maxi Midi Hoa',
    product_sku: 'SKU-003-WHITE-M',
    quantity: 1,
    unit: 'Cái',
    sale_price: 799000,
    final_price: 799000,
    discount_amount: 0,
    discount_type: null,
    discount_value: null,
    subtotal: 799000,
    tax_rate: 10,
    tax_amount: 79900,
    total_amount: 878900,
    notes: null,
    created_at: '2024-01-21T11:30:00Z',
  },

  // Order 5 Items
  {
    _id: 'OI-005-1',
    tenant_id: TENANT_ID,
    order_id: 'ORD-005',
    product_id: PRODUCT_IDS.aoThunBasic,
    variant_id: VARIANT_IDS.aoThunBasic_Red_M,
    product_name: 'Áo Thun Basic Cotton',
    product_sku: 'SKU-001-RED-M',
    quantity: 1,
    unit: 'Cái',
    sale_price: 249000,
    final_price: 249000,
    discount_amount: 0,
    discount_type: null,
    discount_value: null,
    subtotal: 249000,
    tax_rate: 10,
    tax_amount: 24900,
    total_amount: 273900,
    notes: null,
    created_at: '2024-01-21T15:00:00Z',
  },

  // Order 6 Items (Refunded)
  {
    _id: 'OI-006-1',
    tenant_id: TENANT_ID,
    order_id: 'ORD-006',
    product_id: PRODUCT_IDS.quanJeanSlim,
    variant_id: VARIANT_IDS.quanJeanSlim_DarkBlue_30,
    product_name: 'Quần Jean Slim Fit',
    product_sku: 'SKU-002-DARKBLUE-30',
    quantity: 1,
    unit: 'Cái',
    sale_price: 399000,
    final_price: 399000,
    discount_amount: 0,
    discount_type: null,
    discount_value: null,
    subtotal: 399000,
    tax_rate: 10,
    tax_amount: 39900,
    total_amount: 438900,
    notes: 'Sản phẩm lỗi, hoàn tiền',
    created_at: '2024-01-22T09:30:00Z',
  },

  // Order 7 Items (Draft)
  {
    _id: 'OI-007-1',
    tenant_id: TENANT_ID,
    order_id: 'ORD-007',
    product_id: PRODUCT_IDS.aoThunBasic,
    variant_id: VARIANT_IDS.aoThunBasic_Blue_L,
    product_name: 'Áo Thun Basic Cotton',
    product_sku: 'SKU-001-BLUE-L',
    quantity: 1,
    unit: 'Cái',
    sale_price: 249000,
    final_price: 249000,
    discount_amount: 0,
    discount_type: null,
    discount_value: null,
    subtotal: 249000,
    tax_rate: 10,
    tax_amount: 24900,
    total_amount: 273900,
    notes: null,
    created_at: '2024-01-23T08:00:00Z',
  },
];

// =====================================================
// MOCK INVENTORY TRANSACTIONS DATA
// =====================================================

export const mockInventoryTransactions: InventoryTransaction[] = [
  // Phiếu nhập kho 1
  {
    _id: 'INV-001',
    tenant_id: TENANT_ID,
    transaction_type: 'IN',
    transaction_code: 'PN-2024-0001',
    status: 'POSTED',
    notes: 'Nhập hàng từ NCC Việt Tiến',
    created_by: CASHIER_ID,
    created_at: '2024-01-15T09:00:00Z',
    updated_at: '2024-01-15T09:30:00Z',
    deleted_at: null,
  },

  // Phiếu nhập kho 2
  {
    _id: 'INV-002',
    tenant_id: TENANT_ID,
    transaction_type: 'IN',
    transaction_code: 'PN-2024-0002',
    status: 'POSTED',
    notes: 'Nhập hàng bổ sung áo thun',
    created_by: CASHIER_ID,
    created_at: '2024-01-18T14:00:00Z',
    updated_at: '2024-01-18T14:20:00Z',
    deleted_at: null,
  },

  // Phiếu xuất kho 1 - Bán hàng (Order 1)
  {
    _id: 'INV-003',
    tenant_id: TENANT_ID,
    transaction_type: 'OUT',
    transaction_code: 'PX-2024-0001',
    status: 'POSTED',
    notes: 'Xuất kho cho đơn hàng DH-2024-0001',
    created_by: CASHIER_ID,
    created_at: '2024-01-20T10:30:00Z',
    updated_at: '2024-01-20T10:30:00Z',
    deleted_at: null,
  },

  // Phiếu xuất kho 2 - Bán hàng (Order 2)
  {
    _id: 'INV-004',
    tenant_id: TENANT_ID,
    transaction_type: 'OUT',
    transaction_code: 'PX-2024-0002',
    status: 'POSTED',
    notes: 'Xuất kho cho đơn hàng DH-2024-0002',
    created_by: CASHIER_ID,
    created_at: '2024-01-20T14:45:00Z',
    updated_at: '2024-01-20T14:45:00Z',
    deleted_at: null,
  },

  // Phiếu nhập kho 3 - Trả hàng từ khách (Order 6 refund)
  {
    _id: 'INV-005',
    tenant_id: TENANT_ID,
    transaction_type: 'IN',
    transaction_code: 'PN-2024-0003',
    status: 'POSTED',
    notes: 'Nhập kho trả hàng từ khách - Đơn DH-2024-0006',
    created_by: CASHIER_ID,
    created_at: '2024-01-22T10:15:00Z',
    updated_at: '2024-01-22T10:15:00Z',
    deleted_at: null,
  },

  // Phiếu nhập kho 4 - Draft
  {
    _id: 'INV-006',
    tenant_id: TENANT_ID,
    transaction_type: 'IN',
    transaction_code: 'PN-2024-0004',
    status: 'DRAFT',
    notes: 'Phiếu nhập đang soạn',
    created_by: CASHIER_ID,
    created_at: '2024-01-23T08:30:00Z',
    updated_at: '2024-01-23T08:30:00Z',
    deleted_at: null,
  },

  // Phiếu xuất kho hủy
  {
    _id: 'INV-007',
    tenant_id: TENANT_ID,
    transaction_type: 'OUT',
    transaction_code: 'PX-2024-0003',
    status: 'CANCELLED',
    notes: 'Phiếu xuất bị hủy do nhập sai',
    created_by: CASHIER_ID,
    created_at: '2024-01-21T16:00:00Z',
    updated_at: '2024-01-21T16:30:00Z',
    deleted_at: null,
  },
];

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Lấy order items theo order_id
 */
export function getOrderItemsByOrderId(orderId: string): OrderItem[] {
  return mockOrderItems.filter(item => item.order_id === orderId);
}

/**
 * Lấy order với items
 */
export function getOrderWithItems(orderId: string) {
  const order = mockOrders.find(o => o._id === orderId);
  if (!order) return null;
  
  const items = getOrderItemsByOrderId(orderId);
  return {
    ...order,
    items,
  };
}

/**
 * Tính tổng doanh thu từ các đơn hàng hoàn thành
 */
export function calculateTotalRevenue(): number {
  return mockOrders
    .filter(order => order.status === 'COMPLETED' && order.payment_status === 'PAID')
    .reduce((sum, order) => sum + order.total_amount, 0);
}

/**
 * Đếm số đơn hàng theo status
 */
export function countOrdersByStatus(status: Order['status']): number {
  return mockOrders.filter(order => order.status === status).length;
}

/**
 * Đếm số đơn hàng theo payment_status
 */
export function countOrdersByPaymentStatus(paymentStatus: Order['payment_status']): number {
  return mockOrders.filter(order => order.payment_status === paymentStatus).length;
}

/**
 * Lấy inventory transactions theo type
 */
export function getInventoryTransactionsByType(type: 'IN' | 'OUT'): InventoryTransaction[] {
  return mockInventoryTransactions.filter(t => t.transaction_type === type);
}

/**
 * Đếm inventory transactions theo status
 */
export function countInventoryTransactionsByStatus(status: InventoryTransaction['status']): number {
  return mockInventoryTransactions.filter(t => t.status === status).length;
}

// =====================================================
// EXPORTS
// =====================================================

export default {
  mockOrders,
  mockOrderItems,
  mockInventoryTransactions,
  getOrderItemsByOrderId,
  getOrderWithItems,
  calculateTotalRevenue,
  countOrdersByStatus,
  countOrdersByPaymentStatus,
  getInventoryTransactionsByType,
  countInventoryTransactionsByStatus,
};
