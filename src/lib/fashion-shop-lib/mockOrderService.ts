// =====================================================
// MOCK ORDER SERVICE - CRUD OPERATIONS
// Service layer cho quản lý đơn hàng và kho
// =====================================================

import type { Order, OrderItem, InventoryTransaction } from './mockOrderData';
import {
  mockOrders,
  mockOrderItems,
  mockInventoryTransactions,
  getOrderItemsByOrderId,
} from './mockOrderData';

// =====================================================
// CONSTANTS
// =====================================================

const TENANT_ID = '01942c1a-b2e4-7d4e-9a3f-1234567890ab';

// =====================================================
// TYPES
// =====================================================

export interface CreateOrderInput {
  customer_id?: string | null;
  cashier_id?: string | null;
  items: Array<{
    product_id: string;
    variant_id?: string | null;
    product_name: string;
    product_sku?: string | null;
    quantity: number;
    unit?: string | null;
    sale_price: number;
    discount_amount?: number;
    discount_type?: 'PERCENTAGE' | 'FIXED' | null;
    discount_value?: number | null;
    notes?: string | null;
  }>;
  discount_amount?: number;
  discount_type?: 'PERCENTAGE' | 'FIXED' | 'COUPON' | null;
  discount_value?: number | null;
  payment_method?: string | null;
  customer_notes?: string | null;
  internal_notes?: string | null;
}

export interface UpdateOrderInput {
  customer_id?: string | null;
  discount_amount?: number;
  discount_type?: 'PERCENTAGE' | 'FIXED' | 'COUPON' | null;
  discount_value?: number | null;
  payment_status?: Order['payment_status'];
  payment_method?: string | null;
  status?: Order['status'];
  customer_notes?: string | null;
  internal_notes?: string | null;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

// =====================================================
// MOCK ORDER SERVICE CLASS
// =====================================================

export class MockOrderService {
  // =====================================================
  // ORDER CRUD
  // =====================================================

  /**
   * Lấy tất cả Orders
   */
  async getAllOrders(): Promise<Order[]> {
    return mockOrders.filter(o => !o.deleted_at);
  }

  /**
   * Lấy Order theo ID
   */
  async getOrderById(id: string): Promise<Order | null> {
    return mockOrders.find(o => o._id === id && !o.deleted_at) || null;
  }

  /**
   * Lấy Order với items
   */
  async getOrderWithItems(id: string): Promise<OrderWithItems | null> {
    const order = await this.getOrderById(id);
    if (!order) return null;

    const items = getOrderItemsByOrderId(id);
    return {
      ...order,
      items,
    };
  }

  /**
   * Tạo Order mới
   */
  async createOrder(input: CreateOrderInput): Promise<OrderWithItems> {
    const now = new Date().toISOString();
    const orderNumber = `DH-${new Date().getFullYear()}-${String(mockOrders.length + 1).padStart(4, '0')}`;
    const orderId = `ORD-${Date.now()}`;

    // Tính toán subtotal từ items
    let subtotal = 0;
    const items: OrderItem[] = [];

    for (const itemInput of input.items) {
      const itemSubtotal = itemInput.sale_price * itemInput.quantity;
      const itemDiscountAmount = itemInput.discount_amount || 0;
      const finalPrice = itemInput.sale_price - (itemDiscountAmount / itemInput.quantity);
      const taxRate = 10; // 10% VAT
      const taxAmount = (itemSubtotal - itemDiscountAmount) * (taxRate / 100);
      const totalAmount = itemSubtotal - itemDiscountAmount + taxAmount;

      const orderItem: OrderItem = {
        _id: `OI-${Date.now()}-${Math.random()}`,
        tenant_id: TENANT_ID,
        order_id: orderId,
        product_id: itemInput.product_id,
        variant_id: itemInput.variant_id || null,
        product_name: itemInput.product_name,
        product_sku: itemInput.product_sku || null,
        quantity: itemInput.quantity,
        unit: itemInput.unit || null,
        sale_price: itemInput.sale_price,
        final_price: finalPrice,
        discount_amount: itemDiscountAmount,
        discount_type: itemInput.discount_type || null,
        discount_value: itemInput.discount_value || null,
        subtotal: itemSubtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        notes: itemInput.notes || null,
        created_at: now,
      };

      items.push(orderItem);
      mockOrderItems.push(orderItem);
      subtotal += itemSubtotal;
    }

    // Tính toán tổng đơn hàng
    const discountAmount = input.discount_amount || 0;
    const taxAmount = (subtotal - discountAmount) * 0.1; // 10% VAT
    const totalAmount = subtotal - discountAmount + taxAmount;

    const newOrder: Order = {
      _id: orderId,
      tenant_id: TENANT_ID,
      order_number: orderNumber,
      invoice_number: null,
      customer_id: input.customer_id || null,
      cashier_id: input.cashier_id || null,
      subtotal,
      discount_amount: discountAmount,
      discount_type: input.discount_type || null,
      discount_value: input.discount_value || null,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      paid_amount: 0,
      change_amount: 0,
      payment_status: 'UNPAID',
      payment_method: input.payment_method || null,
      status: 'DRAFT',
      customer_notes: input.customer_notes || null,
      internal_notes: input.internal_notes || null,
      completed_at: null,
      created_by: input.cashier_id || null,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };

    mockOrders.push(newOrder);

    return {
      ...newOrder,
      items,
    };
  }

  /**
   * Cập nhật Order
   */
  async updateOrder(orderId: string, updates: UpdateOrderInput): Promise<Order | null> {
    const index = mockOrders.findIndex(o => o._id === orderId);
    if (index === -1) return null;

    const updatedOrder: Order = {
      ...mockOrders[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    mockOrders[index] = updatedOrder;
    return updatedOrder;
  }

  /**
   * Thanh toán Order
   */
  async payOrder(orderId: string, paidAmount: number, paymentMethod: string): Promise<Order | null> {
    const order = await this.getOrderById(orderId);
    if (!order) return null;

    const changeAmount = Math.max(0, paidAmount - order.total_amount);
    const actualPaidAmount = Math.min(paidAmount, order.total_amount);
    
    let paymentStatus: Order['payment_status'] = 'UNPAID';
    if (actualPaidAmount >= order.total_amount) {
      paymentStatus = 'PAID';
    } else if (actualPaidAmount > 0) {
      paymentStatus = 'PARTIAL';
    }

    const invoiceNumber = paymentStatus === 'PAID' 
      ? `HD-${new Date().getFullYear()}-${String(mockOrders.filter(o => o.invoice_number).length + 1).padStart(4, '0')}`
      : null;

    const updates: UpdateOrderInput = {
      payment_status: paymentStatus,
      payment_method: paymentMethod,
      status: paymentStatus === 'PAID' ? 'COMPLETED' : 'PENDING',
    };

    const index = mockOrders.findIndex(o => o._id === orderId);
    if (index === -1) return null;

    const updatedOrder: Order = {
      ...mockOrders[index],
      ...updates,
      invoice_number: invoiceNumber,
      paid_amount: actualPaidAmount,
      change_amount: changeAmount,
      completed_at: paymentStatus === 'PAID' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    mockOrders[index] = updatedOrder;
    return updatedOrder;
  }

  /**
   * Hủy Order
   */
  async cancelOrder(orderId: string, reason?: string): Promise<Order | null> {
    const order = await this.getOrderById(orderId);
    if (!order) return null;

    if (order.payment_status === 'PAID') {
      return null; // Không thể hủy đơn đã thanh toán
    }

    const index = mockOrders.findIndex(o => o._id === orderId);
    if (index === -1) return null;

    const updatedOrder: Order = {
      ...mockOrders[index],
      status: 'CANCELLED',
      internal_notes: reason ? `${mockOrders[index].internal_notes || ''}\nLý do hủy: ${reason}` : mockOrders[index].internal_notes,
      updated_at: new Date().toISOString(),
    };

    mockOrders[index] = updatedOrder;
    return updatedOrder;
  }

  /**
   * Hoàn tiền Order
   */
  async refundOrder(orderId: string, reason?: string): Promise<Order | null> {
    const order = await this.getOrderById(orderId);
    if (!order) return null;

    if (order.payment_status !== 'PAID') {
      return null; // Chỉ hoàn tiền đơn đã thanh toán
    }

    const index = mockOrders.findIndex(o => o._id === orderId);
    if (index === -1) return null;

    const updatedOrder: Order = {
      ...mockOrders[index],
      payment_status: 'REFUNDED',
      status: 'VOIDED',
      internal_notes: reason ? `${mockOrders[index].internal_notes || ''}\nLý do hoàn tiền: ${reason}` : mockOrders[index].internal_notes,
      updated_at: new Date().toISOString(),
    };

    mockOrders[index] = updatedOrder;
    return updatedOrder;
  }

  /**
   * Xóa Order (soft delete)
   */
  async deleteOrder(orderId: string): Promise<boolean> {
    const index = mockOrders.findIndex(o => o._id === orderId);
    if (index === -1) return false;

    mockOrders[index].deleted_at = new Date().toISOString();
    return true;
  }

  /**
   * Lấy Orders theo status
   */
  async getOrdersByStatus(status: Order['status']): Promise<Order[]> {
    return mockOrders.filter(o => o.status === status && !o.deleted_at);
  }

  /**
   * Lấy Orders theo payment_status
   */
  async getOrdersByPaymentStatus(paymentStatus: Order['payment_status']): Promise<Order[]> {
    return mockOrders.filter(o => o.payment_status === paymentStatus && !o.deleted_at);
  }

  /**
   * Tìm kiếm Orders theo order_number hoặc invoice_number
   */
  async searchOrders(keyword: string): Promise<Order[]> {
    const lowerKeyword = keyword.toLowerCase();
    return mockOrders.filter(o => 
      !o.deleted_at && (
        o.order_number.toLowerCase().includes(lowerKeyword) ||
        (o.invoice_number && o.invoice_number.toLowerCase().includes(lowerKeyword))
      )
    );
  }

  // =====================================================
  // ORDER ITEMS CRUD
  // =====================================================

  /**
   * Lấy tất cả Order Items của một Order
   */
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return getOrderItemsByOrderId(orderId);
  }

  /**
   * Thêm item vào Order
   */
  async addOrderItem(orderId: string, itemInput: CreateOrderInput['items'][0]): Promise<OrderItem | null> {
    const order = await this.getOrderById(orderId);
    if (!order || order.status === 'COMPLETED' || order.status === 'CANCELLED') {
      return null;
    }

    const now = new Date().toISOString();
    const itemSubtotal = itemInput.sale_price * itemInput.quantity;
    const itemDiscountAmount = itemInput.discount_amount || 0;
    const finalPrice = itemInput.sale_price - (itemDiscountAmount / itemInput.quantity);
    const taxRate = 10;
    const taxAmount = (itemSubtotal - itemDiscountAmount) * (taxRate / 100);
    const totalAmount = itemSubtotal - itemDiscountAmount + taxAmount;

    const newItem: OrderItem = {
      _id: `OI-${Date.now()}-${Math.random()}`,
      tenant_id: TENANT_ID,
      order_id: orderId,
      product_id: itemInput.product_id,
      variant_id: itemInput.variant_id || null,
      product_name: itemInput.product_name,
      product_sku: itemInput.product_sku || null,
      quantity: itemInput.quantity,
      unit: itemInput.unit || null,
      sale_price: itemInput.sale_price,
      final_price: finalPrice,
      discount_amount: itemDiscountAmount,
      discount_type: itemInput.discount_type || null,
      discount_value: itemInput.discount_value || null,
      subtotal: itemSubtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      notes: itemInput.notes || null,
      created_at: now,
    };

    mockOrderItems.push(newItem);

    // Cập nhật tổng tiền order
    await this.recalculateOrderTotals(orderId);

    return newItem;
  }

  /**
   * Xóa item khỏi Order
   */
  async removeOrderItem(itemId: string): Promise<boolean> {
    const index = mockOrderItems.findIndex(i => i._id === itemId);
    if (index === -1) return false;

    const orderId = mockOrderItems[index].order_id;
    mockOrderItems.splice(index, 1);

    // Cập nhật tổng tiền order
    await this.recalculateOrderTotals(orderId);

    return true;
  }

  /**
   * Tính lại tổng tiền Order từ Items
   */
  private async recalculateOrderTotals(orderId: string): Promise<void> {
    const order = await this.getOrderById(orderId);
    if (!order) return;

    const items = getOrderItemsByOrderId(orderId);
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const discountAmount = order.discount_amount;
    const taxAmount = (subtotal - discountAmount) * 0.1;
    const totalAmount = subtotal - discountAmount + taxAmount;

    const index = mockOrders.findIndex(o => o._id === orderId);
    if (index !== -1) {
      mockOrders[index] = {
        ...mockOrders[index],
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        updated_at: new Date().toISOString(),
      };
    }
  }

  // =====================================================
  // INVENTORY TRANSACTIONS CRUD
  // =====================================================

  /**
   * Lấy tất cả Inventory Transactions
   */
  async getAllInventoryTransactions(): Promise<InventoryTransaction[]> {
    return mockInventoryTransactions.filter(t => !t.deleted_at);
  }

  /**
   * Lấy Inventory Transaction theo ID
   */
  async getInventoryTransactionById(id: string): Promise<InventoryTransaction | null> {
    return mockInventoryTransactions.find(t => t._id === id && !t.deleted_at) || null;
  }

  /**
   * Tạo Inventory Transaction mới
   */
  async createInventoryTransaction(input: {
    transaction_type: 'IN' | 'OUT';
    notes?: string | null;
    created_by?: string | null;
  }): Promise<InventoryTransaction> {
    const now = new Date().toISOString();
    const prefix = input.transaction_type === 'IN' ? 'PN' : 'PX';
    const count = mockInventoryTransactions.filter(t => t.transaction_type === input.transaction_type).length + 1;
    const transactionCode = `${prefix}-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;

    const newTransaction: InventoryTransaction = {
      _id: `INV-${Date.now()}`,
      tenant_id: TENANT_ID,
      transaction_type: input.transaction_type,
      transaction_code: transactionCode,
      status: 'DRAFT',
      notes: input.notes || null,
      created_by: input.created_by || null,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };

    mockInventoryTransactions.push(newTransaction);
    return newTransaction;
  }

  /**
   * Cập nhật Inventory Transaction
   */
  async updateInventoryTransaction(
    id: string,
    updates: Partial<Pick<InventoryTransaction, 'status' | 'notes'>>
  ): Promise<InventoryTransaction | null> {
    const index = mockInventoryTransactions.findIndex(t => t._id === id);
    if (index === -1) return null;

    const updatedTransaction: InventoryTransaction = {
      ...mockInventoryTransactions[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    mockInventoryTransactions[index] = updatedTransaction;
    return updatedTransaction;
  }

  /**
   * Duyệt Inventory Transaction
   */
  async postInventoryTransaction(id: string): Promise<InventoryTransaction | null> {
    return this.updateInventoryTransaction(id, { status: 'POSTED' });
  }

  /**
   * Hủy Inventory Transaction
   */
  async cancelInventoryTransaction(id: string): Promise<InventoryTransaction | null> {
    return this.updateInventoryTransaction(id, { status: 'CANCELLED' });
  }

  /**
   * Xóa Inventory Transaction (soft delete)
   */
  async deleteInventoryTransaction(id: string): Promise<boolean> {
    const index = mockInventoryTransactions.findIndex(t => t._id === id);
    if (index === -1) return false;

    mockInventoryTransactions[index].deleted_at = new Date().toISOString();
    return true;
  }

  /**
   * Lấy Inventory Transactions theo type
   */
  async getInventoryTransactionsByType(type: 'IN' | 'OUT'): Promise<InventoryTransaction[]> {
    return mockInventoryTransactions.filter(t => t.transaction_type === type && !t.deleted_at);
  }

  /**
   * Lấy Inventory Transactions theo status
   */
  async getInventoryTransactionsByStatus(status: InventoryTransaction['status']): Promise<InventoryTransaction[]> {
    return mockInventoryTransactions.filter(t => t.status === status && !t.deleted_at);
  }
}

// =====================================================
// SINGLETON INSTANCE
// =====================================================

export const mockOrderService = new MockOrderService();

// =====================================================
// EXPORTS
// =====================================================

export default mockOrderService;
