// =====================================================
// MOCK INVENTORY SERVICE - CRUD & BUSINESS LOGIC
// Service layer cho quản lý tồn kho
// =====================================================

import {
  Inventory,
  InventoryTransaction,
  mockInventories,
  mockInventoryTransactions,
  saveInventoriesToStorage,
  saveInventoryTransactionsToStorage,
  getInventoryByVariantId,
  getInventoriesByProductId,
  getTransactionsByVariantId,
  calculateAvailable,
} from './mockInventoryData';

// =====================================================
// CONSTANTS
// =====================================================

const TENANT_ID = '01942c1a-b2e4-7d4e-9a3f-1234567890ab';

// =====================================================
// TYPES
// =====================================================

export interface CreateInventoryTransactionInput {
  variant_id: string;
  product_id: string;
  type: InventoryTransaction['type'];
  qty: number; // Positive for IN, Negative for OUT
  ref_type?: InventoryTransaction['ref_type'];
  ref_id?: string | null;
  notes?: string | null;
  created_by?: string | null;
}

export interface UpdateInventoryInput {
  reserved?: number;
  incoming?: number;
}

// =====================================================
// INVENTORY SERVICE CLASS
// =====================================================

export class MockInventoryService {
  // =====================================================
  // INVENTORY CRUD (READ ONLY - không được sửa trực tiếp)
  // =====================================================

  /**
   * Lấy tất cả Inventories
   */
  async getAllInventories(): Promise<Inventory[]> {
    return mockInventories.filter(inv => inv.tenant_id === TENANT_ID);
  }
  
  /**
   * Sync inventories với tất cả variants
   * Tạo inventory record cho các variants chưa có
   */
  private async syncInventoriesWithVariants(): Promise<void> {
    try {
      // Import variants dynamically để tránh circular dependency
      const { mockProductVariants } = await import('./mockProductData_fashion_only');
      const existingVariantIds = new Set(mockInventories.map(inv => inv.variant_id));
      
      for (const variant of mockProductVariants) {
        if (!existingVariantIds.has(variant._id)) {
          // Create inventory for variant
          const now = new Date().toISOString();
          const newInventory: Inventory = {
            _id: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            tenant_id: TENANT_ID,
            variant_id: variant._id,
            product_id: variant.product_id,
            on_hand: variant.quantity || 0, // Sử dụng quantity từ variant làm giá trị ban đầu
            reserved: 0,
            incoming: 0,
            available: variant.quantity || 0,
            updated_at: now,
          };
          
          mockInventories.push(newInventory);
          console.log(`✅ [Inventory] Auto-created inventory for variant: ${variant.sku} (on_hand: ${newInventory.on_hand})`);
        }
      }
      
      // Save to storage if any new inventories were created
      if (mockInventories.length > existingVariantIds.size) {
        saveInventoriesToStorage();
      }
    } catch (error) {
      console.error('Failed to sync inventories with variants:', error);
    }
  }

  /**
   * Lấy Inventory theo variant_id
   */
  async getInventoryByVariantId(variantId: string): Promise<Inventory | null> {
    return getInventoryByVariantId(variantId);
  }

  /**
   * Lấy Inventories theo product_id
   */
  async getInventoriesByProductId(productId: string): Promise<Inventory[]> {
    return getInventoriesByProductId(productId);
  }

  /**
   * Lấy hoặc tạo Inventory cho variant
   * Nếu chưa có, tạo mới với giá trị 0
   */
  async getOrCreateInventory(variantId: string, productId: string): Promise<Inventory> {
    let inventory = getInventoryByVariantId(variantId);
    
    if (!inventory) {
      const now = new Date().toISOString();
      inventory = {
        _id: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        tenant_id: TENANT_ID,
        variant_id: variantId,
        product_id: productId,
        on_hand: 0,
        reserved: 0,
        incoming: 0,
        available: 0,
        updated_at: now,
      };
      
      mockInventories.push(inventory);
      saveInventoriesToStorage();
      
      console.log(`✅ [Inventory] Created new inventory for variant: ${variantId}`);
    }
    
    return inventory;
  }

  /**
   * Update reserved hoặc incoming (CHỈ được phép update 2 fields này)
   * on_hand chỉ được update qua transactions
   */
  async updateInventory(variantId: string, updates: UpdateInventoryInput): Promise<Inventory | null> {
    const inventory = getInventoryByVariantId(variantId);
    if (!inventory) {
      console.error(`❌ [Inventory] Inventory not found for variant: ${variantId}`);
      return null;
    }

    const now = new Date().toISOString();

    // CHỈ cho phép update reserved và incoming
    if (updates.reserved !== undefined) {
      inventory.reserved = Math.max(0, updates.reserved);
    }
    if (updates.incoming !== undefined) {
      inventory.incoming = Math.max(0, updates.incoming);
    }

    // Tự động tính lại available
    inventory.available = calculateAvailable(inventory.on_hand, inventory.reserved);
    inventory.updated_at = now;

    saveInventoriesToStorage();
    console.log(`✅ [Inventory] Updated inventory for variant: ${variantId}`, updates);

    return inventory;
  }

  // =====================================================
  // INVENTORY TRANSACTIONS - Nguồn Truth
  // =====================================================

  /**
   * Tạo Transaction và CẬP NHẬT Inventory + Variant.quantity
   * ĐÂY LÀ CÁCH DUY NHẤT để thay đổi on_hand
   */
  async createTransaction(input: CreateInventoryTransactionInput): Promise<InventoryTransaction> {
    const now = new Date().toISOString();

    // 1. Get or create inventory
    const inventory = await this.getOrCreateInventory(input.variant_id, input.product_id);

    // 2. Calculate before/after
    const beforeOnHand = inventory.on_hand;
    const afterOnHand = beforeOnHand + input.qty; // qty có thể là + hoặc -

    // 3. Validate: không được âm
    if (afterOnHand < 0) {
      throw new Error(`Không đủ tồn kho. Hiện tại: ${beforeOnHand}, Cần: ${Math.abs(input.qty)}`);
    }

    // 4. Create transaction
    const transaction: InventoryTransaction = {
      _id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenant_id: TENANT_ID,
      variant_id: input.variant_id,
      product_id: input.product_id,
      type: input.type,
      qty: input.qty,
      before_on_hand: beforeOnHand,
      after_on_hand: afterOnHand,
      ref_type: input.ref_type || null,
      ref_id: input.ref_id || null,
      notes: input.notes || null,
      created_by: input.created_by || null,
      created_at: now,
      updated_at: now,
    };

    mockInventoryTransactions.push(transaction);
    saveInventoryTransactionsToStorage();

    // 5. Update inventory on_hand
    inventory.on_hand = afterOnHand;
    inventory.available = calculateAvailable(inventory.on_hand, inventory.reserved);
    inventory.updated_at = now;
    saveInventoriesToStorage();

    // 6. 🔥 NO SYNC: Variant.quantity đã bị xóa theo mô hình POS chuẩn
    // Inventory là nguồn tồn kho duy nhất. Variant CHỈ chứa thông tin SKU (sku, price, barcode).

    console.log(`✅ [Transaction] Created transaction:`, {
      type: transaction.type,
      qty: transaction.qty,
      variant_id: transaction.variant_id,
      before: beforeOnHand,
      after: afterOnHand,
    });

    return transaction;
  }

  /**
   * Lấy tất cả Transactions
   */
  async getAllTransactions(): Promise<InventoryTransaction[]> {
    return mockInventoryTransactions.filter(txn => txn.tenant_id === TENANT_ID);
  }

  /**
   * Lấy Transaction theo ID
   */
  async getTransactionById(id: string): Promise<InventoryTransaction | null> {
    return mockInventoryTransactions.find(
      txn => txn._id === id && txn.tenant_id === TENANT_ID
    ) || null;
  }

  /**
   * Lấy Transactions theo variant_id
   */
  async getTransactionsByVariantId(variantId: string): Promise<InventoryTransaction[]> {
    return getTransactionsByVariantId(variantId);
  }

  /**
   * Lấy Transactions theo product_id
   */
  async getTransactionsByProductId(productId: string): Promise<InventoryTransaction[]> {
    return mockInventoryTransactions.filter(
      txn => txn.product_id === productId && txn.tenant_id === TENANT_ID
    );
  }

  /**
   * Lấy Transactions theo type
   */
  async getTransactionsByType(type: InventoryTransaction['type']): Promise<InventoryTransaction[]> {
    return mockInventoryTransactions.filter(
      txn => txn.type === type && txn.tenant_id === TENANT_ID
    );
  }

  /**
   * Lấy Transactions theo ref (hóa đơn, đơn nhập, etc.)
   */
  async getTransactionsByRef(refType: string, refId: string): Promise<InventoryTransaction[]> {
    return mockInventoryTransactions.filter(
      txn => txn.ref_type === refType && txn.ref_id === refId && txn.tenant_id === TENANT_ID
    );
  }

  // =====================================================
  // BUSINESS LOGIC - Các thao tác nghiệp vụ
  // =====================================================

  /**
   * Tồn đầu kỳ (Opening Balance)
   * Sử dụng khi khởi tạo sản phẩm có tồn kho ban đầu
   */
  async opening(
    variantId: string,
    productId: string,
    qty: number,
    notes?: string,
    createdBy?: string
  ): Promise<InventoryTransaction> {
    if (qty < 0) {
      throw new Error('Số lượng tồn đầu kỳ không được âm');
    }

    return this.createTransaction({
      variant_id: variantId,
      product_id: productId,
      type: 'opening',
      qty: qty, // Positive number
      ref_type: 'opening',
      ref_id: null,
      notes: notes || 'Tồn đầu kỳ',
      created_by: createdBy,
    });
  }

  /**
   * Nhập kho (Purchase In)
   */
  async purchaseIn(
    variantId: string,
    productId: string,
    qty: number,
    refId?: string,
    notes?: string,
    createdBy?: string
  ): Promise<InventoryTransaction> {
    if (qty <= 0) {
      throw new Error('Số lượng nhập kho phải > 0');
    }

    return this.createTransaction({
      variant_id: variantId,
      product_id: productId,
      type: 'purchase_in',
      qty: qty, // Positive number
      ref_type: 'purchase_order',
      ref_id: refId,
      notes: notes || 'Nhập hàng',
      created_by: createdBy,
    });
  }

  /**
   * Xuất kho bán hàng (Sale Out)
   */
  async saleOut(
    variantId: string,
    productId: string,
    qty: number,
    refId?: string,
    notes?: string,
    createdBy?: string
  ): Promise<InventoryTransaction> {
    if (qty <= 0) {
      throw new Error('Số lượng xuất kho phải > 0');
    }

    return this.createTransaction({
      variant_id: variantId,
      product_id: productId,
      type: 'sale_out',
      qty: -qty, // Negative number
      ref_type: 'sale_order',
      ref_id: refId,
      notes: notes || 'Bán hàng',
      created_by: createdBy,
    });
  }

  /**
   * Điều chỉnh kho (Adjustment)
   */
  async adjust(
    variantId: string,
    productId: string,
    qty: number, // Có thể + hoặc -
    notes?: string,
    createdBy?: string
  ): Promise<InventoryTransaction> {
    if (qty === 0) {
      throw new Error('Số lượng điều chỉnh không được bằng 0');
    }

    return this.createTransaction({
      variant_id: variantId,
      product_id: productId,
      type: 'adjust',
      qty: qty,
      ref_type: 'adjustment',
      ref_id: `ADJ-${Date.now()}`,
      notes: notes || 'Điều chỉnh tồn kho',
      created_by: createdBy,
    });
  }

  /**
   * Kiểm kho (Stocktake)
   */
  async stocktake(
    variantId: string,
    productId: string,
    actualQty: number,
    notes?: string,
    createdBy?: string
  ): Promise<InventoryTransaction | null> {
    const inventory = await this.getInventoryByVariantId(variantId);
    if (!inventory) {
      console.error(`❌ [Stocktake] Inventory not found for variant: ${variantId}`);
      return null;
    }

    const diff = actualQty - inventory.on_hand;
    
    if (diff === 0) {
      console.log(`ℹ️ [Stocktake] No difference found for variant: ${variantId}`);
      return null; // Không có chênh lệch
    }

    return this.createTransaction({
      variant_id: variantId,
      product_id: productId,
      type: 'stocktake',
      qty: diff,
      ref_type: 'stocktake',
      ref_id: `ST-${Date.now()}`,
      notes: notes || `Kiểm kho: Chênh lệch ${diff > 0 ? '+' : ''}${diff}`,
      created_by: createdBy,
    });
  }

  /**
   * Trả hàng nhập kho (Return In)
   */
  async returnIn(
    variantId: string,
    productId: string,
    qty: number,
    refId?: string,
    notes?: string,
    createdBy?: string
  ): Promise<InventoryTransaction> {
    if (qty <= 0) {
      throw new Error('Số lượng trả hàng phải > 0');
    }

    return this.createTransaction({
      variant_id: variantId,
      product_id: productId,
      type: 'return_in',
      qty: qty,
      ref_type: 'sale_order',
      ref_id: refId,
      notes: notes || 'Khách trả hàng',
      created_by: createdBy,
    });
  }

  /**
   * Xuất hủy (Damage Out)
   */
  async damageOut(
    variantId: string,
    productId: string,
    qty: number,
    notes?: string,
    createdBy?: string
  ): Promise<InventoryTransaction> {
    if (qty <= 0) {
      throw new Error('Số lượng xuất hủy phải > 0');
    }

    return this.createTransaction({
      variant_id: variantId,
      product_id: productId,
      type: 'damage_out',
      qty: -qty,
      ref_type: null,
      ref_id: null,
      notes: notes || 'Hàng hỏng, xuất hủy',
      created_by: createdBy,
    });
  }

  /**
   * Reserve inventory (giữ hàng cho đơn)
   * Không tạo transaction, chỉ update reserved
   */
  async reserveInventory(variantId: string, qty: number): Promise<Inventory | null> {
    const inventory = await this.getInventoryByVariantId(variantId);
    if (!inventory) return null;

    if (inventory.available < qty) {
      throw new Error(`Không đủ hàng để giữ. Có sẵn: ${inventory.available}, Cần: ${qty}`);
    }

    return this.updateInventory(variantId, {
      reserved: inventory.reserved + qty,
    });
  }

  /**
   * Release reserved inventory (hủy giữ hàng)
   */
  async releaseReserved(variantId: string, qty: number): Promise<Inventory | null> {
    const inventory = await this.getInventoryByVariantId(variantId);
    if (!inventory) return null;

    return this.updateInventory(variantId, {
      reserved: Math.max(0, inventory.reserved - qty),
    });
  }

  // =====================================================
  // QUERY & REPORTING
  // =====================================================

  /**
   * Lấy variants có tồn kho thấp
   */
  async getLowStockVariants(threshold: number = 10): Promise<Inventory[]> {
    return mockInventories.filter(
      inv => inv.on_hand <= threshold && inv.tenant_id === TENANT_ID
    );
  }

  /**
   * Lấy variants hết hàng
   */
  async getOutOfStockVariants(): Promise<Inventory[]> {
    return mockInventories.filter(
      inv => inv.on_hand === 0 && inv.tenant_id === TENANT_ID
    );
  }

  /**
   * Tổng giá trị tồn kho (cần thêm cost_price từ variant)
   */
  async getTotalInventoryValue(): Promise<number> {
    // TODO: Cần join với product_variants để lấy cost_price
    return 0;
  }

  /**
   * Lịch sử giao dịch của một variant
   */
  async getVariantHistory(variantId: string, limit?: number): Promise<InventoryTransaction[]> {
    const transactions = getTransactionsByVariantId(variantId);
    
    // Sort by created_at desc
    transactions.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return limit ? transactions.slice(0, limit) : transactions;
  }
}

// =====================================================
// SINGLETON INSTANCE
// =====================================================

export const mockInventoryService = new MockInventoryService();

// =====================================================
// EXPORTS
// =====================================================

export default mockInventoryService;