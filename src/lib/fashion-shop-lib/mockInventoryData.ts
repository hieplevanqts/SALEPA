// =====================================================
// MOCK INVENTORY DATA - INVENTORIES & TRANSACTIONS
// Hệ thống quản lý tồn kho hoàn chỉnh
// =====================================================

// =====================================================
// TYPES - Inventories
// =====================================================

/**
 * INVENTORIES - Trạng thái tồn kho hiện tại (snapshot)
 * - Mỗi variant chỉ có 1 dòng inventory (1 kho/1 cửa hàng)
 * - KHÔNG lưu lịch sử
 * - Chỉ để đọc nhanh trạng thái hiện tại
 * - KHÔNG được sửa trực tiếp, chỉ update qua transactions
 */
export interface Inventory {
  _id: string;
  tenant_id: string;
  variant_id: string;  // SKU
  product_id: string;  // SPU
  on_hand: number;     // Tồn thực tế (nguồn truth)
  reserved: number;    // Đã giữ (đơn hàng chưa xuất)
  incoming: number;    // Đang về (đơn nhập chưa post)
  available: number;   // on_hand - reserved (tính tự động)
  updated_at: string;
}

/**
 * INVENTORY_TRANSACTIONS - Sổ kho (nguồn dữ liệu gốc)
 * - MỖI thay đổi tồn kho = 1 dòng transaction
 * - Có thể audit, đối soát, rollback
 * - Inventory được tính toán từ transactions
 */
export interface InventoryTransaction {
  _id: string;
  tenant_id: string;
  variant_id: string;        // SKU
  product_id: string;        // SPU
  type: 'opening' | 'sale_out' | 'purchase_in' | 'adjust' | 'stocktake' | 'return_in' | 'damage_out' | 'return_out';
  qty: number;               // Số lượng (+/-): IN = +, OUT = -
  before_on_hand: number;    // Tồn trước khi thay đổi
  after_on_hand: number;     // Tồn sau khi thay đổi
  ref_type: 'opening' | 'sale_order' | 'purchase_order' | 'adjustment' | 'stocktake' | null;
  ref_id: string | null;     // ID của hóa đơn/đơn hàng
  notes: string | null;
  created_by: string | null; // User ID
  created_at: string;
  updated_at: string;
}

// =====================================================
// LOCAL STORAGE HELPERS
// =====================================================

const STORAGE_KEY_INVENTORIES = 'salepa_mock_inventories_v2'; // v2: Updated with real variant IDs
const STORAGE_KEY_INV_TRANSACTIONS = 'salepa_mock_inventory_transactions_v2';

function loadFromStorage<T>(key: string, defaultData: T): T {
  if (typeof window === 'undefined') return defaultData;
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      console.log(`📦 [Inventory Storage] Loaded ${key} from localStorage`);
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error(`❌ [Inventory Storage] Failed to load ${key}:`, error);
  }
  return defaultData;
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`💾 [Inventory Storage] Saved ${key} to localStorage`);
  } catch (error) {
    console.error(`❌ [Inventory Storage] Failed to save ${key}:`, error);
  }
}

// =====================================================
// CONSTANTS
// =====================================================

const TENANT_ID = '01942c1a-b2e4-7d4e-9a3f-1234567890ab';

// =====================================================
// MOCK DATA - INVENTORIES
// =====================================================

/**
 * Mock Inventories - Tồn kho hiện tại
 * Khởi tạo với dữ liệu mẫu, sau đó load từ localStorage
 */
const initialInventories: Inventory[] = [
  // PRD-0001 - Áo thun Nike (3 variants)
  {
    _id: 'INV-VAR-0001',
    tenant_id: TENANT_ID,
    variant_id: 'VAR-0001',
    product_id: 'PRD-0001',
    on_hand: 25,
    reserved: 2,
    incoming: 0,
    available: 23,
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    _id: 'INV-VAR-0002',
    tenant_id: TENANT_ID,
    variant_id: 'VAR-0002',
    product_id: 'PRD-0001',
    on_hand: 40,
    reserved: 3,
    incoming: 5,
    available: 37,
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    _id: 'INV-VAR-0003',
    tenant_id: TENANT_ID,
    variant_id: 'VAR-0003',
    product_id: 'PRD-0001',
    on_hand: 30,
    reserved: 1,
    incoming: 0,
    available: 29,
    updated_at: '2025-02-01T10:00:00Z',
  },

  // PRD-0002 - Giày Adidas (3 variants)
  {
    _id: 'INV-VAR-0004',
    tenant_id: TENANT_ID,
    variant_id: 'VAR-0004',
    product_id: 'PRD-0002',
    on_hand: 10,
    reserved: 1,
    incoming: 2,
    available: 9,
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    _id: 'INV-VAR-0005',
    tenant_id: TENANT_ID,
    variant_id: 'VAR-0005',
    product_id: 'PRD-0002',
    on_hand: 15,
    reserved: 2,
    incoming: 0,
    available: 13,
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    _id: 'INV-VAR-0006',
    tenant_id: TENANT_ID,
    variant_id: 'VAR-0006',
    product_id: 'PRD-0002',
    on_hand: 8,
    reserved: 0,
    incoming: 0,
    available: 8,
    updated_at: '2025-02-01T10:00:00Z',
  },

  // PRD-0003 - Túi Gucci (1 variant mặc định)
  {
    _id: 'INV-VAR-0016',
    tenant_id: TENANT_ID,
    variant_id: 'VAR-0016',
    product_id: 'PRD-0003',
    on_hand: 8,
    reserved: 1,
    incoming: 0,
    available: 7,
    updated_at: '2025-02-01T10:00:00Z',
  },

  // PRD-0004 - Quần jean (1 variant mặc định - HẾT HÀNG)
  {
    _id: 'INV-VAR-0017',
    tenant_id: TENANT_ID,
    variant_id: 'VAR-0017',
    product_id: 'PRD-0004',
    on_hand: 0,
    reserved: 0,
    incoming: 20,
    available: 0,
    updated_at: '2025-02-01T10:00:00Z',
  },

  // PRD-0005 - Đầm Zara (2 variants)
  {
    _id: 'INV-VAR-0007',
    tenant_id: TENANT_ID,
    variant_id: 'VAR-0007',
    product_id: 'PRD-0005',
    on_hand: 20,
    reserved: 2,
    incoming: 0,
    available: 18,
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    _id: 'INV-VAR-0008',
    tenant_id: TENANT_ID,
    variant_id: 'VAR-0008',
    product_id: 'PRD-0005',
    on_hand: 18,
    reserved: 1,
    incoming: 0,
    available: 17,
    updated_at: '2025-02-01T10:00:00Z',
  },

  // PRD-0006 - Dép (1 variant mặc định)
  {
    _id: 'INV-VAR-0018',
    tenant_id: TENANT_ID,
    variant_id: 'VAR-0018',
    product_id: 'PRD-0006',
    on_hand: 200,
    reserved: 5,
    incoming: 0,
    available: 195,
    updated_at: '2025-02-01T10:00:00Z',
  },

  // PRD-0007 - Đồng hồ Chanel (1 variant mặc định)
  {
    _id: 'INV-VAR-0019',
    tenant_id: TENANT_ID,
    variant_id: 'VAR-0019',
    product_id: 'PRD-0007',
    on_hand: 3,
    reserved: 0,
    incoming: 0,
    available: 3,
    updated_at: '2025-02-01T10:00:00Z',
  },

  // PRD-0008 - Áo khoác Puma (1 variant mặc định)
  {
    _id: 'INV-VAR-0020',
    tenant_id: TENANT_ID,
    variant_id: 'VAR-0020',
    product_id: 'PRD-0008',
    on_hand: 38,
    reserved: 3,
    incoming: 10,
    available: 35,
    updated_at: '2025-02-01T10:00:00Z',
  },

  // PRD-0009 - Balo Nike (1 variant mặc định)
  {
    _id: 'INV-VAR-0021',
    tenant_id: TENANT_ID,
    variant_id: 'VAR-0021',
    product_id: 'PRD-0009',
    on_hand: 85,
    reserved: 4,
    incoming: 0,
    available: 81,
    updated_at: '2025-02-01T10:00:00Z',
  },

  // PRD-0010 - Váy H&M (1 variant mặc định)
  {
    _id: 'INV-VAR-0022',
    tenant_id: TENANT_ID,
    variant_id: 'VAR-0022',
    product_id: 'PRD-0010',
    on_hand: 42,
    reserved: 2,
    incoming: 5,
    available: 40,
    updated_at: '2025-02-01T10:00:00Z',
  },

  // PRD-0011 - Giày Converse (3 variants)
  {
    _id: 'INV-VAR-0009',
    tenant_id: TENANT_ID,
    variant_id: 'VAR-0009',
    product_id: 'PRD-0011',
    on_hand: 22,
    reserved: 1,
    incoming: 0,
    available: 21,
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    _id: 'INV-VAR-0010',
    tenant_id: TENANT_ID,
    variant_id: 'VAR-0010',
    product_id: 'PRD-0011',
    on_hand: 28,
    reserved: 2,
    incoming: 0,
    available: 26,
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    _id: 'INV-VAR-0011',
    tenant_id: TENANT_ID,
    variant_id: 'VAR-0011',
    product_id: 'PRD-0011',
    on_hand: 15,
    reserved: 0,
    incoming: 0,
    available: 15,
    updated_at: '2025-02-01T10:00:00Z',
  },

  // PRD-0012 - Mũ (3 variants)
  {
    _id: 'INV-VAR-0012',
    tenant_id: TENANT_ID,
    variant_id: 'VAR-0012',
    product_id: 'PRD-0012',
    on_hand: 60,
    reserved: 3,
    incoming: 0,
    available: 57,
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    _id: 'INV-VAR-0013',
    tenant_id: TENANT_ID,
    variant_id: 'VAR-0013',
    product_id: 'PRD-0012',
    on_hand: 45,
    reserved: 2,
    incoming: 0,
    available: 43,
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    _id: 'INV-VAR-0014',
    tenant_id: TENANT_ID,
    variant_id: 'VAR-0014',
    product_id: 'PRD-0012',
    on_hand: 35,
    reserved: 1,
    incoming: 0,
    available: 34,
    updated_at: '2025-02-01T10:00:00Z',
  },

  // PRD-0013 - Bộ đồ gym Adidas (1 variant mặc định)
  {
    _id: 'INV-VAR-0023',
    tenant_id: TENANT_ID,
    variant_id: 'VAR-0023',
    product_id: 'PRD-0013',
    on_hand: 55,
    reserved: 4,
    incoming: 10,
    available: 51,
    updated_at: '2025-02-01T10:00:00Z',
  },

  // PRD-0014 - Bộ quần áo trẻ em (1 variant mặc đnh)
  {
    _id: 'INV-VAR-0024',
    tenant_id: TENANT_ID,
    variant_id: 'VAR-0024',
    product_id: 'PRD-0014',
    on_hand: 75,
    reserved: 3,
    incoming: 0,
    available: 72,
    updated_at: '2025-02-01T10:00:00Z',
  },

  // PRD-0015 - Giày Vans (1 variant - LOW STOCK)
  {
    _id: 'INV-VAR-0015',
    tenant_id: TENANT_ID,
    variant_id: 'VAR-0015',
    product_id: 'PRD-0015',
    on_hand: 3,
    reserved: 0,
    incoming: 8,
    available: 3,
    updated_at: '2025-02-01T10:00:00Z',
  },
];

// Load từ localStorage hoặc dùng initial data
export let mockInventories: Inventory[] = loadFromStorage(STORAGE_KEY_INVENTORIES, initialInventories);

// =====================================================
// MOCK DATA - INVENTORY TRANSACTIONS
// =====================================================

const initialTransactions: InventoryTransaction[] = [
  // VAR-0001 - Áo thun Nike Đỏ M
  {
    _id: 'TXN-001',
    tenant_id: TENANT_ID,
    variant_id: 'VAR-0001',
    product_id: 'PRD-0001',
    type: 'purchase_in',
    qty: 50,
    before_on_hand: 0,
    after_on_hand: 50,
    ref_type: 'purchase_order',
    ref_id: 'PO-2025-001',
    notes: 'Nhập hàng lần đầu',
    created_by: 'admin-001',
    created_at: '2025-01-15T08:00:00Z',
    updated_at: '2025-01-15T08:00:00Z',
  },
  {
    _id: 'TXN-002',
    tenant_id: TENANT_ID,
    variant_id: 'VAR-0001',
    product_id: 'PRD-0001',
    type: 'sale_out',
    qty: -25,
    before_on_hand: 50,
    after_on_hand: 25,
    ref_type: 'sale_order',
    ref_id: 'DH-2025-0001',
    notes: 'Bán lẻ',
    created_by: 'cashier-001',
    created_at: '2025-01-20T10:00:00Z',
    updated_at: '2025-01-20T10:00:00Z',
  },

  // VAR-0002 - Áo thun Nike Đen L
  {
    _id: 'TXN-003',
    tenant_id: TENANT_ID,
    variant_id: 'VAR-0002',
    product_id: 'PRD-0001',
    type: 'purchase_in',
    qty: 80,
    before_on_hand: 0,
    after_on_hand: 80,
    ref_type: 'purchase_order',
    ref_id: 'PO-2025-001',
    notes: 'Nhập hàng lần đầu',
    created_by: 'admin-001',
    created_at: '2025-01-15T08:00:00Z',
    updated_at: '2025-01-15T08:00:00Z',
  },
  {
    _id: 'TXN-004',
    tenant_id: TENANT_ID,
    variant_id: 'VAR-0002',
    product_id: 'PRD-0001',
    type: 'sale_out',
    qty: -40,
    before_on_hand: 80,
    after_on_hand: 40,
    ref_type: 'sale_order',
    ref_id: 'DH-2025-0002',
    notes: 'Bán sỉ',
    created_by: 'cashier-001',
    created_at: '2025-01-20T14:00:00Z',
    updated_at: '2025-01-20T14:00:00Z',
  },

  // VAR-0004 - Giày Adidas Size 39
  {
    _id: 'TXN-005',
    tenant_id: TENANT_ID,
    variant_id: 'VAR-0004',
    product_id: 'PRD-0002',
    type: 'purchase_in',
    qty: 20,
    before_on_hand: 0,
    after_on_hand: 20,
    ref_type: 'purchase_order',
    ref_id: 'PO-2025-002',
    notes: 'Nhập hàng giày Adidas',
    created_by: 'admin-001',
    created_at: '2025-01-16T09:00:00Z',
    updated_at: '2025-01-16T09:00:00Z',
  },
  {
    _id: 'TXN-006',
    tenant_id: TENANT_ID,
    variant_id: 'VAR-0004',
    product_id: 'PRD-0002',
    type: 'sale_out',
    qty: -10,
    before_on_hand: 20,
    after_on_hand: 10,
    ref_type: 'sale_order',
    ref_id: 'DH-2025-0003',
    notes: 'Bán lẻ',
    created_by: 'cashier-001',
    created_at: '2025-01-22T11:30:00Z',
    updated_at: '2025-01-22T11:30:00Z',
  },

  // VAR-0015 - Giày Vans (LOW STOCK)
  {
    _id: 'TXN-007',
    tenant_id: TENANT_ID,
    variant_id: 'VAR-0015',
    product_id: 'PRD-0015',
    type: 'purchase_in',
    qty: 15,
    before_on_hand: 0,
    after_on_hand: 15,
    ref_type: 'purchase_order',
    ref_id: 'PO-2025-003',
    notes: 'Nhập hàng giày Vans',
    created_by: 'admin-001',
    created_at: '2025-01-18T10:00:00Z',
    updated_at: '2025-01-18T10:00:00Z',
  },
  {
    _id: 'TXN-008',
    tenant_id: TENANT_ID,
    variant_id: 'VAR-0015',
    product_id: 'PRD-0015',
    type: 'sale_out',
    qty: -12,
    before_on_hand: 15,
    after_on_hand: 3,
    ref_type: 'sale_order',
    ref_id: 'DH-2025-0004',
    notes: 'Bán hot - sắp hết hàng',
    created_by: 'cashier-001',
    created_at: '2025-01-28T15:00:00Z',
    updated_at: '2025-01-28T15:00:00Z',
  },

  // VAR-0017 - Quần jean (HẾT HÀNG)
  {
    _id: 'TXN-009',
    tenant_id: TENANT_ID,
    variant_id: 'VAR-0017',
    product_id: 'PRD-0004',
    type: 'purchase_in',
    qty: 30,
    before_on_hand: 0,
    after_on_hand: 30,
    ref_type: 'purchase_order',
    ref_id: 'PO-2025-004',
    notes: 'Nhập hàng quần jean',
    created_by: 'admin-001',
    created_at: '2025-01-12T08:00:00Z',
    updated_at: '2025-01-12T08:00:00Z',
  },
  {
    _id: 'TXN-010',
    tenant_id: TENANT_ID,
    variant_id: 'VAR-0017',
    product_id: 'PRD-0004',
    type: 'sale_out',
    qty: -30,
    before_on_hand: 30,
    after_on_hand: 0,
    ref_type: 'sale_order',
    ref_id: 'DH-2025-0005',
    notes: 'Bán hết - cần nhập thêm',
    created_by: 'cashier-001',
    created_at: '2025-01-30T16:00:00Z',
    updated_at: '2025-01-30T16:00:00Z',
  },

  // VAR-0018 - Dép (High stock)
  {
    _id: 'TXN-011',
    tenant_id: TENANT_ID,
    variant_id: 'VAR-0018',
    product_id: 'PRD-0006',
    type: 'purchase_in',
    qty: 300,
    before_on_hand: 0,
    after_on_hand: 300,
    ref_type: 'purchase_order',
    ref_id: 'PO-2025-005',
    notes: 'Nhập hàng dép số lượng lớn',
    created_by: 'admin-001',
    created_at: '2025-01-10T08:00:00Z',
    updated_at: '2025-01-10T08:00:00Z',
  },
  {
    _id: 'TXN-012',
    tenant_id: TENANT_ID,
    variant_id: 'VAR-0018',
    product_id: 'PRD-0006',
    type: 'sale_out',
    qty: -100,
    before_on_hand: 300,
    after_on_hand: 200,
    ref_type: 'sale_order',
    ref_id: 'DH-2025-0006',
    notes: 'Bán sỉ số lượng lớn',
    created_by: 'cashier-001',
    created_at: '2025-01-25T10:00:00Z',
    updated_at: '2025-01-25T10:00:00Z',
  },

  // Stocktake adjustment example
  {
    _id: 'TXN-013',
    tenant_id: TENANT_ID,
    variant_id: 'VAR-0009',
    product_id: 'PRD-0011',
    type: 'stocktake',
    qty: -3,
    before_on_hand: 25,
    after_on_hand: 22,
    ref_type: 'stocktake',
    ref_id: 'ST-2025-001',
    notes: 'Kiểm kho phát hiện thiếu hàng',
    created_by: 'admin-001',
    created_at: '2025-01-21T09:00:00Z',
    updated_at: '2025-01-21T09:00:00Z',
  },

  // Damage out example
  {
    _id: 'TXN-014',
    tenant_id: TENANT_ID,
    variant_id: 'VAR-0007',
    product_id: 'PRD-0005',
    type: 'damage_out',
    qty: -2,
    before_on_hand: 22,
    after_on_hand: 20,
    ref_type: null,
    ref_id: null,
    notes: 'Hàng bị lỗi, xuất hủy',
    created_by: 'admin-001',
    created_at: '2025-01-22T11:00:00Z',
    updated_at: '2025-01-22T11:00:00Z',
  },
];

// Load từ localStorage hoặc dùng initial data
export let mockInventoryTransactions: InventoryTransaction[] = loadFromStorage(
  STORAGE_KEY_INV_TRANSACTIONS,
  initialTransactions
);

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Lưu inventories vào localStorage
 */
export function saveInventoriesToStorage(): void {
  saveToStorage(STORAGE_KEY_INVENTORIES, mockInventories);
}

/**
 * Lưu transactions vào localStorage
 */
export function saveInventoryTransactionsToStorage(): void {
  saveToStorage(STORAGE_KEY_INV_TRANSACTIONS, mockInventoryTransactions);
}

/**
 * Reset inventories về initial data
 */
export function resetInventories(): void {
  mockInventories = [...initialInventories];
  saveInventoriesToStorage();
}

/**
 * Reset transactions về initial data
 */
export function resetInventoryTransactions(): void {
  mockInventoryTransactions = [...initialTransactions];
  saveInventoryTransactionsToStorage();
}

/**
 * Lấy inventory theo variant_id
 */
export function getInventoryByVariantId(variantId: string): Inventory | null {
  return mockInventories.find(
    inv => inv.variant_id === variantId && inv.tenant_id === TENANT_ID
  ) || null;
}

/**
 * Lấy tất cả inventories của một product
 */
export function getInventoriesByProductId(productId: string): Inventory[] {
  return mockInventories.filter(
    inv => inv.product_id === productId && inv.tenant_id === TENANT_ID
  );
}

/**
 * Lấy transactions của một variant
 */
export function getTransactionsByVariantId(variantId: string): InventoryTransaction[] {
  return mockInventoryTransactions.filter(
    txn => txn.variant_id === variantId && txn.tenant_id === TENANT_ID
  );
}

/**
 * Tính lại available = on_hand - reserved
 */
export function calculateAvailable(onHand: number, reserved: number): number {
  return Math.max(0, onHand - reserved);
}

// =====================================================
// EXPORTS
// =====================================================

export default {
  mockInventories,
  mockInventoryTransactions,
  saveInventoriesToStorage,
  saveInventoryTransactionsToStorage,
  resetInventories,
  resetInventoryTransactions,
  getInventoryByVariantId,
  getInventoriesByProductId,
  getTransactionsByVariantId,
  calculateAvailable,
};