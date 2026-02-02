import { mockApi } from './mockApi_export';
import { mockOrderService } from './mockOrderService';
import { mockInventoryService } from './mockInventoryService';

// =====================================================
// OFFLINE MODE: Using Mock Data (Supabase disconnected)
// =====================================================
const USE_MOCK_DATA = true; // Set to false to reconnect Supabase

// Mock values for offline mode (not used when USE_MOCK_DATA = true)
const projectId = 'offline-mode';
const publicAnonKey = 'offline-mode';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-4198d50c`;

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(`API Error [${endpoint}]:`, data);
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return data;
    } catch (error) {
      console.error(`Network Error [${endpoint}]:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  // ================================
  // PRODUCT TYPES
  // ================================
  async getProductTypes() {
    if (USE_MOCK_DATA) return mockApi.getProductTypes();
    return this.request<any[]>('/product-types');
  }

  async getProductType(id: string) {
    if (USE_MOCK_DATA) return mockApi.getProductType(id);
    return this.request<any>(`/product-types/${id}`);
  }

  async createProductType(data: any) {
    if (USE_MOCK_DATA) return mockApi.createProductType(data);
    return this.request<any>('/product-types', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProductType(id: string, data: any) {
    if (USE_MOCK_DATA) return mockApi.updateProductType(id, data);
    return this.request<any>(`/product-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProductType(id: string) {
    if (USE_MOCK_DATA) return mockApi.deleteProductType(id);
    return this.request<any>(`/product-types/${id}`, {
      method: 'DELETE',
    });
  }

  // ================================
  // PRODUCT CATEGORIES
  // ================================
  async getProductCategories() {
    if (USE_MOCK_DATA) return mockApi.getProductCategories();
    return this.request<any[]>('/product-categories');
  }

  async getProductCategory(id: string) {
    if (USE_MOCK_DATA) return mockApi.getProductCategory(id);
    return this.request<any>(`/product-categories/${id}`);
  }

  async createProductCategory(data: any) {
    if (USE_MOCK_DATA) return mockApi.createProductCategory(data);
    return this.request<any>('/product-categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProductCategory(id: string, data: any) {
    if (USE_MOCK_DATA) return mockApi.updateProductCategory(id, data);
    return this.request<any>(`/product-categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProductCategory(id: string) {
    if (USE_MOCK_DATA) return mockApi.deleteProductCategory(id);
    return this.request<any>(`/product-categories/${id}`, {
      method: 'DELETE',
    });
  }

  // ================================
  // PRODUCT TAGS
  // ================================
  async getProductTags() {
    if (USE_MOCK_DATA) return mockApi.getProductTags();
    return this.request<any[]>('/product-tags');
  }

  async getProductTag(id: string) {
    if (USE_MOCK_DATA) return mockApi.getProductTag(id);
    return this.request<any>(`/product-tags/${id}`);
  }

  async createProductTag(data: any) {
    return this.request<any>('/product-tags', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProductTag(id: string, data: any) {
    return this.request<any>(`/product-tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProductTag(id: string) {
    return this.request<any>(`/product-tags/${id}`, {
      method: 'DELETE',
    });
  }

  // ================================
  // PRODUCTS (SPU)
  // ================================
  async getProducts() {
    if (USE_MOCK_DATA) return mockApi.getProducts();
    return this.request<any[]>('/products');
  }

  async getProduct(id: string) {
    if (USE_MOCK_DATA) return mockApi.getProduct(id);
    return this.request<any>(`/products/${id}`);
  }

  async createProduct(data: any) {
    if (USE_MOCK_DATA) return mockApi.createProduct(data);
    return this.request<any>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: string, data: any) {
    if (USE_MOCK_DATA) return mockApi.updateProduct(id, data);
    return this.request<any>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string) {
    if (USE_MOCK_DATA) return mockApi.deleteProduct(id);
    return this.request<any>(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // ================================
  // PRODUCT VARIANTS (15 fields)
  // ================================
  async getProductVariants() {
    if (USE_MOCK_DATA) return mockApi.getProductVariants();
    return this.request<any[]>('/product-variants');
  }

  async getProductVariantsByProduct(productId: string) {
    if (USE_MOCK_DATA) return mockApi.getProductVariantsByProduct(productId);
    return this.request<any[]>(`/product-variants/by-product/${productId}`);
  }

  async getProductVariant(id: string) {
    if (USE_MOCK_DATA) return mockApi.getProductVariant(id);
    return this.request<any>(`/product-variants/${id}`);
  }

  async getProductVariantByBarcode(barcode: string) {
    if (USE_MOCK_DATA) return mockApi.getProductVariantByBarcode(barcode);
    return this.request<any>(`/product-variants/by-barcode/${barcode}`);
  }

  async createProductVariant(data: any) {
    if (USE_MOCK_DATA) return mockApi.createProductVariant(data);
    return this.request<any>('/product-variants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProductVariant(id: string, data: any) {
    if (USE_MOCK_DATA) return mockApi.updateProductVariant(id, data);
    return this.request<any>(`/product-variants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProductVariant(id: string) {
    if (USE_MOCK_DATA) return mockApi.deleteProductVariant(id);
    return this.request<any>(`/product-variants/${id}`, {
      method: 'DELETE',
    });
  }

  // ================================
  // PRODUCT ATTRIBUTE DEFINITIONS
  // ================================
  async getProductAttributeDefinitions() {
    if (USE_MOCK_DATA) return mockApi.getProductAttributeDefinitions();
    return this.request<any[]>('/product-attribute-definitions');
  }

  async getProductAttributeDefinition(id: string) {
    if (USE_MOCK_DATA) return mockApi.getProductAttributeDefinition(id);
    return this.request<any>(`/product-attribute-definitions/${id}`);
  }

  async createProductAttributeDefinition(data: any) {
    return this.request<any>('/product-attribute-definitions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProductAttributeDefinition(id: string, data: any) {
    return this.request<any>(`/product-attribute-definitions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProductAttributeDefinition(id: string) {
    return this.request<any>(`/product-attribute-definitions/${id}`, {
      method: 'DELETE',
    });
  }

  // ================================
  // PRODUCT ATTRIBUTE VALUES
  // ================================
  async getProductAttributeValues() {
    if (USE_MOCK_DATA) return mockApi.getProductAttributeValues();
    return this.request<any[]>('/product-attribute-values');
  }

  async getProductAttributeValue(id: string) {
    if (USE_MOCK_DATA) return mockApi.getProductAttributeValue(id);
    return this.request<any>(`/product-attribute-values/${id}`);
  }

  async createProductAttributeValue(data: any) {
    return this.request<any>('/product-attribute-values', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProductAttributeValue(id: string, data: any) {
    return this.request<any>(`/product-attribute-values/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProductAttributeValue(id: string) {
    return this.request<any>(`/product-attribute-values/${id}`, {
      method: 'DELETE',
    });
  }

  // ================================
  // PRODUCT SUPPLIERS
  // ================================
  async getProductSuppliers() {
    if (USE_MOCK_DATA) return mockApi.getProductSuppliers();
    return this.request<any[]>('/product-suppliers');
  }

  async getProductSupplier(id: string) {
    if (USE_MOCK_DATA) return mockApi.getProductSupplier(id);
    return this.request<any>(`/product-suppliers/${id}`);
  }

  async createProductSupplier(data: any) {
    return this.request<any>('/product-suppliers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProductSupplier(id: string, data: any) {
    return this.request<any>(`/product-suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProductSupplier(id: string) {
    return this.request<any>(`/product-suppliers/${id}`, {
      method: 'DELETE',
    });
  }

  // ================================
  // PRODUCT BRANDS
  // ================================
  async getProductBrands() {
    if (USE_MOCK_DATA) return mockApi.getProductBrands();
    return this.request<any[]>('/product-brands');
  }

  async getProductBrand(id: string) {
    if (USE_MOCK_DATA) return mockApi.getProductBrand(id);
    return this.request<any>(`/product-brands/${id}`);
  }

  async createProductBrand(data: any) {
    if (USE_MOCK_DATA) return mockApi.createProductBrand(data);
    return this.request<any>('/product-brands', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProductBrand(id: string, data: any) {
    if (USE_MOCK_DATA) return mockApi.updateProductBrand(id, data);
    return this.request<any>(`/product-brands/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProductBrand(id: string) {
    if (USE_MOCK_DATA) return mockApi.deleteProductBrand(id);
    return this.request<any>(`/product-brands/${id}`, {
      method: 'DELETE',
    });
  }

  // ================================
  // PRODUCT PROPERTIES
  // ================================
  async getProductProperties() {
    if (USE_MOCK_DATA) return mockApi.getProductProperties();
    return this.request<any[]>('/product-properties');
  }

  async getProductProperty(id: string) {
    if (USE_MOCK_DATA) return mockApi.getProductProperty(id);
    return this.request<any>(`/product-properties/${id}`);
  }

  async createProductProperty(data: any) {
    if (USE_MOCK_DATA) return mockApi.createProductProperty(data);
    return this.request<any>('/product-properties', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProductProperty(id: string, data: any) {
    if (USE_MOCK_DATA) return mockApi.updateProductProperty(id, data);
    return this.request<any>(`/product-properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProductProperty(id: string) {
    if (USE_MOCK_DATA) return mockApi.deleteProductProperty(id);
    return this.request<any>(`/product-properties/${id}`, {
      method: 'DELETE',
    });
  }

  // ================================
  // PRODUCT UNITS
  // ================================
  async getProductUnits() {
    if (USE_MOCK_DATA) return mockApi.getProductUnits();
    return this.request<any[]>('/product-units');
  }

  async getProductUnit(id: string) {
    if (USE_MOCK_DATA) return mockApi.getProductUnit(id);
    return this.request<any>(`/product-units/${id}`);
  }

  async createProductUnit(data: any) {
    return this.request<any>('/product-units', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProductUnit(id: string, data: any) {
    return this.request<any>(`/product-units/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProductUnit(id: string) {
    return this.request<any>(`/product-units/${id}`, {
      method: 'DELETE',
    });
  }

  // ================================
  // PRODUCT UNIT CONFIGS
  // ================================
  async getProductUnitConfigs() {
    if (USE_MOCK_DATA) return mockApi.getProductUnitConfigs();
    return this.request<any[]>('/product-unit-configs');
  }

  async getProductUnitConfigsByProductId(productId: string) {
    if (USE_MOCK_DATA) return mockApi.getProductUnitConfigsByProductId(productId);
    return this.request<any[]>(`/product-unit-configs/by-product/${productId}`);
  }

  async createProductUnitConfig(data: any) {
    if (USE_MOCK_DATA) return mockApi.createProductUnitConfig(data);
    return this.request<any>('/product-unit-configs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteProductUnitConfigsByProductId(productId: string) {
    if (USE_MOCK_DATA) return mockApi.deleteProductUnitConfigsByProductId(productId);
    return this.request<any>(`/product-unit-configs/by-product/${productId}`, {
      method: 'DELETE',
    });
  }

  // ================================
  // ORDERS
  // ================================
  async getOrders() {
    if (USE_MOCK_DATA) {
      const orders = await mockOrderService.getAllOrders();
      return { success: true, data: orders };
    }
    return this.request<any[]>('/orders');
  }

  async getOrder(id: string) {
    if (USE_MOCK_DATA) {
      const order = await mockOrderService.getOrderWithItems(id);
      return { success: true, data: order };
    }
    return this.request<any>(`/orders/${id}`);
  }

  async createOrder(data: any) {
    if (USE_MOCK_DATA) {
      const order = await mockOrderService.createOrder(data);
      return { success: true, data: order };
    }
    return this.request<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOrder(id: string, data: any) {
    if (USE_MOCK_DATA) {
      const order = await mockOrderService.updateOrder(id, data);
      return { success: true, data: order };
    }
    return this.request<any>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteOrder(id: string) {
    if (USE_MOCK_DATA) {
      const success = await mockOrderService.deleteOrder(id);
      return { success };
    }
    return this.request<any>(`/orders/${id}`, {
      method: 'DELETE',
    });
  }

  async payOrder(id: string, paidAmount: number, paymentMethod: string) {
    if (USE_MOCK_DATA) {
      const order = await mockOrderService.payOrder(id, paidAmount, paymentMethod);
      return { success: true, data: order };
    }
    return this.request<any>(`/orders/${id}/pay`, {
      method: 'POST',
      body: JSON.stringify({ paidAmount, paymentMethod }),
    });
  }

  async cancelOrder(id: string, reason?: string) {
    if (USE_MOCK_DATA) {
      const order = await mockOrderService.cancelOrder(id, reason);
      return { success: true, data: order };
    }
    return this.request<any>(`/orders/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async refundOrder(id: string, reason?: string) {
    if (USE_MOCK_DATA) {
      const order = await mockOrderService.refundOrder(id, reason);
      return { success: true, data: order };
    }
    return this.request<any>(`/orders/${id}/refund`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async getOrdersByStatus(status: string) {
    if (USE_MOCK_DATA) {
      const orders = await mockOrderService.getOrdersByStatus(status as any);
      return { success: true, data: orders };
    }
    return this.request<any[]>(`/orders/by-status/${status}`);
  }

  async searchOrders(keyword: string) {
    if (USE_MOCK_DATA) {
      const orders = await mockOrderService.searchOrders(keyword);
      return { success: true, data: orders };
    }
    return this.request<any[]>(`/orders/search?keyword=${encodeURIComponent(keyword)}`);
  }

  // ================================
  // ORDER ITEMS
  // ================================
  async getOrderItems(orderId: string) {
    if (USE_MOCK_DATA) {
      const items = await mockOrderService.getOrderItems(orderId);
      return { success: true, data: items };
    }
    return this.request<any[]>(`/orders/${orderId}/items`);
  }

  async addOrderItem(orderId: string, data: any) {
    if (USE_MOCK_DATA) {
      const item = await mockOrderService.addOrderItem(orderId, data);
      return { success: true, data: item };
    }
    return this.request<any>(`/orders/${orderId}/items`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async removeOrderItem(itemId: string) {
    if (USE_MOCK_DATA) {
      const success = await mockOrderService.removeOrderItem(itemId);
      return { success };
    }
    return this.request<any>(`/order-items/${itemId}`, {
      method: 'DELETE',
    });
  }

  // ================================
  // INVENTORY TRANSACTIONS
  // ================================
  async getInventoryTransactions() {
    if (USE_MOCK_DATA) {
      const transactions = await mockInventoryService.getAllTransactions();
      return { success: true, data: transactions };
    }
    return this.request<any[]>('/inventory-transactions');
  }

  async getInventoryTransaction(id: string) {
    if (USE_MOCK_DATA) {
      const transaction = await mockOrderService.getInventoryTransactionById(id);
      return { success: true, data: transaction };
    }
    return this.request<any>(`/inventory-transactions/${id}`);
  }

  async createInventoryTransaction(data: any) {
    if (USE_MOCK_DATA) {
      const transaction = await mockOrderService.createInventoryTransaction(data);
      return { success: true, data: transaction };
    }
    return this.request<any>('/inventory-transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateInventoryTransaction(id: string, data: any) {
    if (USE_MOCK_DATA) {
      const transaction = await mockOrderService.updateInventoryTransaction(id, data);
      return { success: true, data: transaction };
    }
    return this.request<any>(`/inventory-transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async postInventoryTransaction(id: string) {
    if (USE_MOCK_DATA) {
      const transaction = await mockOrderService.postInventoryTransaction(id);
      return { success: true, data: transaction };
    }
    return this.request<any>(`/inventory-transactions/${id}/post`, {
      method: 'POST',
    });
  }

  async cancelInventoryTransaction(id: string) {
    if (USE_MOCK_DATA) {
      const transaction = await mockOrderService.cancelInventoryTransaction(id);
      return { success: true, data: transaction };
    }
    return this.request<any>(`/inventory-transactions/${id}/cancel`, {
      method: 'POST',
    });
  }

  async deleteInventoryTransaction(id: string) {
    if (USE_MOCK_DATA) {
      const success = await mockOrderService.deleteInventoryTransaction(id);
      return { success };
    }
    return this.request<any>(`/inventory-transactions/${id}`, {
      method: 'DELETE',
    });
  }

  async getInventoryTransactionsByType(type: 'IN' | 'OUT') {
    if (USE_MOCK_DATA) {
      const transactions = await mockOrderService.getInventoryTransactionsByType(type);
      return { success: true, data: transactions };
    }
    return this.request<any[]>(`/inventory-transactions/by-type/${type}`);
  }

  // ================================
  // INVENTORIES (NEW)
  // ================================
  async getInventories() {
    if (USE_MOCK_DATA) {
      const inventories = await mockInventoryService.getAllInventories();
      return { success: true, data: inventories };
    }
    return this.request<any[]>('/inventories');
  }

  async getInventoryByVariantId(variantId: string) {
    if (USE_MOCK_DATA) {
      const inventory = await mockInventoryService.getInventoryByVariantId(variantId);
      return { success: true, data: inventory };
    }
    return this.request<any>(`/inventories/by-variant/${variantId}`);
  }

  async getInventoriesByProductId(productId: string) {
    if (USE_MOCK_DATA) {
      const inventories = await mockInventoryService.getInventoriesByProductId(productId);
      return { success: true, data: inventories };
    }
    return this.request<any[]>(`/inventories/by-product/${productId}`);
  }

  async updateInventoryReserved(variantId: string, reserved: number) {
    if (USE_MOCK_DATA) {
      const inventory = await mockInventoryService.updateInventory(variantId, { reserved });
      return { success: true, data: inventory };
    }
    return this.request<any>(`/inventories/${variantId}/reserved`, {
      method: 'PUT',
      body: JSON.stringify({ reserved }),
    });
  }

  async getLowStockVariants(threshold: number = 10) {
    if (USE_MOCK_DATA) {
      const variants = await mockInventoryService.getLowStockVariants(threshold);
      return { success: true, data: variants };
    }
    return this.request<any[]>(`/inventories/low-stock?threshold=${threshold}`);
  }

  async getOutOfStockVariants() {
    if (USE_MOCK_DATA) {
      const variants = await mockInventoryService.getOutOfStockVariants();
      return { success: true, data: variants };
    }
    return this.request<any[]>('/inventories/out-of-stock');
  }

  // ================================
  // INVENTORY BUSINESS OPERATIONS
  // ================================
  async inventoryPurchaseIn(variantId: string, productId: string, qty: number, refId?: string, notes?: string) {
    if (USE_MOCK_DATA) {
      const transaction = await mockInventoryService.purchaseIn(variantId, productId, qty, refId, notes);
      return { success: true, data: transaction };
    }
    return this.request<any>('/inventory/purchase-in', {
      method: 'POST',
      body: JSON.stringify({ variantId, productId, qty, refId, notes }),
    });
  }

  async inventorySaleOut(variantId: string, productId: string, qty: number, refId?: string, notes?: string) {
    if (USE_MOCK_DATA) {
      const transaction = await mockInventoryService.saleOut(variantId, productId, qty, refId, notes);
      return { success: true, data: transaction };
    }
    return this.request<any>('/inventory/sale-out', {
      method: 'POST',
      body: JSON.stringify({ variantId, productId, qty, refId, notes }),
    });
  }

  async inventoryAdjust(variantId: string, productId: string, qty: number, notes?: string) {
    if (USE_MOCK_DATA) {
      const transaction = await mockInventoryService.adjust(variantId, productId, qty, notes);
      return { success: true, data: transaction };
    }
    return this.request<any>('/inventory/adjust', {
      method: 'POST',
      body: JSON.stringify({ variantId, productId, qty, notes }),
    });
  }

  async inventoryStocktake(variantId: string, productId: string, actualQty: number, notes?: string) {
    if (USE_MOCK_DATA) {
      const transaction = await mockInventoryService.stocktake(variantId, productId, actualQty, notes);
      return { success: true, data: transaction };
    }
    return this.request<any>('/inventory/stocktake', {
      method: 'POST',
      body: JSON.stringify({ variantId, productId, actualQty, notes }),
    });
  }

  async inventoryDamageOut(variantId: string, productId: string, qty: number, notes?: string) {
    if (USE_MOCK_DATA) {
      const transaction = await mockInventoryService.damageOut(variantId, productId, qty, notes);
      return { success: true, data: transaction };
    }
    return this.request<any>('/inventory/damage-out', {
      method: 'POST',
      body: JSON.stringify({ variantId, productId, qty, notes }),
    });
  }

  // ================================
  // UTILITY
  // ================================
  async seedData() {
    return this.request<any>('/seed-data', {
      method: 'POST',
    });
  }

  async healthCheck() {
    return this.request<any>('/health');
  }
}

// Singleton instance
export const api = new ApiClient();