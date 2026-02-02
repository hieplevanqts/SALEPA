// =====================================================
// MOCK PRODUCT SERVICE - CRUD OPERATIONS
// Service layer cho quản lý sản phẩm theo mô hình KiotViet
// CHỈ ÁP DỤNG CHO NGÀNH THỜI TRANG
// =====================================================

import {
  Product,
  ProductVariant,
  ProductProperty,
  ProductPropertyValue,
  ProductVariantPropertyValue,
  ProductUnit,
  ProductUnitConfig,
  ProductWithVariants,
  VariantWithProperties,
  CreateProductFlow,
  UpdateProductFlow,
  POSSaleFlow,
  ProductDataModel,
} from './productDataModel';

// =====================================================
// CONSTANTS
// =====================================================

const TENANT_ID = '01942c1a-b2e4-7d4e-9a3f-1234567890ab';
const INDUSTRY_FASHION_ID = '01942c1a-0001-0000-0000-000000000001';

// =====================================================
// IN-MEMORY DATA STORES
// =====================================================

// Sử dụng data từ mockProductData_fashion_only.ts
import {
  mockProducts,
  mockProductVariants,
  mockProductProperties,
  mockProductPropertyValues,
  mockProductVariantPropertyValues,
  mockProductUnits,
  mockProductUnitConfigs,
} from './mockProductData_fashion_only';

// =====================================================
// MOCK PRODUCT SERVICE CLASS
// =====================================================

export class MockProductService {
  // =====================================================
  // PRODUCT CRUD
  // =====================================================

  /**
   * Lấy tất cả Products
   */
  async getAllProducts(): Promise<Product[]> {
    return [...mockProducts];
  }

  /**
   * Lấy Product theo ID
   */
  async getProductById(id: string): Promise<Product | null> {
    return mockProducts.find(p => p._id === id) || null;
  }

  /**
   * Lấy Product với đầy đủ Variants và Properties
   */
  async getProductWithVariants(id: string): Promise<ProductWithVariants | null> {
    const product = await this.getProductById(id);
    if (!product) return null;

    const variants = await this.getVariantsByProductId(id);
    const variantsWithProps = await Promise.all(
      variants.map(v => this.getVariantWithProperties(v._id))
    );

    // Lấy property configs
    const propertyValues = mockProductPropertyValues.filter(pv => pv.product_id === id);
    const propertyGroups = propertyValues.reduce((acc, pv) => {
      if (!acc[pv.property_id]) {
        acc[pv.property_id] = {
          property_id: pv.property_id,
          property_name: pv.property_name,
          values: [],
        };
      }
      if (!acc[pv.property_id].values.includes(pv.property_value)) {
        acc[pv.property_id].values.push(pv.property_value);
      }
      return acc;
    }, {} as Record<string, { property_id: string; property_name: string; values: string[] }>);

    // Lấy unit config
    const unitConfig = mockProductUnitConfigs.find(uc => uc.product_id === id);

    return {
      ...product,
      variants: variantsWithProps.filter(v => v !== null) as VariantWithProperties[],
      property_configs: Object.values(propertyGroups),
      unit_config: unitConfig,
    };
  }

  /**
   * Tạo Product mới với Flow hoàn chỉnh
   */
  async createProduct(flow: CreateProductFlow): Promise<ProductWithVariants> {
    const productId = `PRD-${Date.now()}`;
    const now = new Date().toISOString();

    // Step 1: Tạo Product
    const newProduct: Product = {
      _id: productId,
      tenant_id: TENANT_ID,
      industry_id: INDUSTRY_FASHION_ID,
      ...flow.product,
      quantity: 0, // Sẽ được tính lại
      waiting_quantity: 0,
      is_sold_out: true,
      status: 1,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    } as Product;

    mockProducts.push(newProduct);

    // Step 2: Lưu Product Properties (cấp Product)
    for (const prop of flow.properties) {
      for (const value of prop.values) {
        const ppv: ProductPropertyValue = {
          _id: `PPV-${Date.now()}-${Math.random()}`,
          tenant_id: TENANT_ID,
          industry_id: INDUSTRY_FASHION_ID,
          product_id: productId,
          property_id: prop.property_id,
          property_name: prop.property_name,
          property_value: value,
          created_at: now,
          updated_at: now,
        };
        mockProductPropertyValues.push(ppv);
      }
    }

    // Step 3: Tạo Variants
    const newVariants: ProductVariant[] = [];
    for (const variantData of flow.variants) {
      const variantId = `VAR-${Date.now()}-${Math.random()}`;
      
      const newVariant: ProductVariant = {
        _id: variantId,
        tenant_id: TENANT_ID,
        industry_id: INDUSTRY_FASHION_ID,
        product_id: productId,
        sku: variantData.sku,
        title: variantData.title,
        barcode: variantData.barcode,
        cost_price: variantData.cost_price,
        price: variantData.price,
        prices: variantData.price ? { vnd: variantData.price, usd: variantData.price / 25000 } : null,
        quantity: variantData.quantity,
        waiting_quantity: 0,
        status: 1,
        is_sold_out: variantData.quantity === 0,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      };

      mockProductVariants.push(newVariant);
      newVariants.push(newVariant);

      // Lưu Variant Properties (cấp SKU)
      for (const [propName, propValue] of Object.entries(variantData.properties)) {
        const property = flow.properties.find(p => p.property_name === propName);
        if (property) {
          const vpv: ProductVariantPropertyValue = {
            _id: `VPV-${Date.now()}-${Math.random()}`,
            tenant_id: TENANT_ID,
            industry_id: INDUSTRY_FASHION_ID,
            product_id: productId,
            variant_id: variantId,
            property_id: property.property_id,
            property_name: propName,
            property_value: propValue,
            created_at: now,
            updated_at: now,
          };
          mockProductVariantPropertyValues.push(vpv);
        }
      }
    }

    // Step 4: Lưu Unit Config
    if (flow.unit_config) {
      const unitConfig: ProductUnitConfig = {
        _id: `UC-${Date.now()}`,
        tenant_id: TENANT_ID,
        industry_id: INDUSTRY_FASHION_ID,
        product_id: productId,
        unit_id: flow.unit_config.unit_id,
        unit_name: flow.unit_config.unit_name,
        conversion: flow.unit_config.conversion,
        is_base: flow.unit_config.is_base,
        is_direct_sale: true,
        created_at: now,
        updated_at: now,
      };
      mockProductUnitConfigs.push(unitConfig);
    }

    // Step 5: Cập nhật tồn kho Product (Rule 4)
    const updatedProduct = ProductDataModel.updateProductStockFromVariants(
      newProduct,
      newVariants
    );

    // Update in store
    const index = mockProducts.findIndex(p => p._id === productId);
    if (index !== -1) {
      mockProducts[index] = updatedProduct;
    }

    // Return full product with variants
    return (await this.getProductWithVariants(productId))!;
  }

  /**
   * Cập nhật Product
   */
  async updateProduct(productId: string, updates: Partial<Product>): Promise<Product | null> {
    const index = mockProducts.findIndex(p => p._id === productId);
    if (index === -1) return null;

    const updatedProduct = {
      ...mockProducts[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    mockProducts[index] = updatedProduct;
    return updatedProduct;
  }

  /**
   * Xóa Product (soft delete)
   */
  async deleteProduct(productId: string): Promise<boolean> {
    const index = mockProducts.findIndex(p => p._id === productId);
    if (index === -1) return false;

    mockProducts[index].deleted_at = new Date().toISOString();
    mockProducts[index].status = 0;
    return true;
  }

  // =====================================================
  // VARIANT CRUD
  // =====================================================

  /**
   * Lấy tất cả Variants của Product
   */
  async getVariantsByProductId(productId: string): Promise<ProductVariant[]> {
    return mockProductVariants.filter(v => v.product_id === productId && !v.deleted_at);
  }

  /**
   * Lấy Variant theo ID
   */
  async getVariantById(id: string): Promise<ProductVariant | null> {
    return mockProductVariants.find(v => v._id === id && !v.deleted_at) || null;
  }

  /**
   * Lấy Variant với đầy đủ Properties
   */
  async getVariantWithProperties(id: string): Promise<VariantWithProperties | null> {
    const variant = await this.getVariantById(id);
    if (!variant) return null;

    const properties = mockProductVariantPropertyValues
      .filter(vpv => vpv.variant_id === id)
      .map(vpv => ({
        property_id: vpv.property_id,
        property_name: vpv.property_name,
        property_value: vpv.property_value,
      }));

    const product = await this.getProductById(variant.product_id);

    return {
      ...variant,
      properties,
      product: product || undefined,
    };
  }

  /**
   * Tìm Variant theo barcode hoặc SKU (POS)
   */
  async findVariantForPOS(searchTerm: string): Promise<POSSaleFlow> {
    const allVariants = mockProductVariants.filter(v => !v.deleted_at);
    const variant = ProductDataModel.searchVariantForPOS(searchTerm, allVariants);

    if (!variant) {
      return {
        search_term: searchTerm,
        variant: null,
        product: null,
        available_quantity: 0,
        can_sell: false,
        error: 'Không tìm thấy sản phẩm',
      };
    }

    const product = await this.getProductById(variant.product_id);
    const canSell = ProductDataModel.canSellVariant(variant, 1);

    return {
      search_term: searchTerm,
      variant,
      product,
      available_quantity: variant.quantity,
      can_sell: canSell.can_sell,
      error: canSell.error,
    };
  }

  /**
   * Cập nhật Variant
   */
  async updateVariant(variantId: string, updates: Partial<ProductVariant>): Promise<ProductVariant | null> {
    const index = mockProductVariants.findIndex(v => v._id === variantId);
    if (index === -1) return null;

    const updatedVariant = {
      ...mockProductVariants[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    mockProductVariants[index] = updatedVariant;

    // Tự động cập nhật Product stock (Rule 4)
    await this.recalculateProductStock(updatedVariant.product_id);

    return updatedVariant;
  }

  /**
   * Bán Variant (trừ tồn kho) - POS Flow
   */
  async sellVariant(variantId: string, soldQuantity: number): Promise<{
    success: boolean;
    variant?: ProductVariant;
    product?: Product;
    error?: string;
  }> {
    const variant = await this.getVariantById(variantId);
    if (!variant) {
      return {
        success: false,
        error: 'Không tìm thấy SKU',
      };
    }

    // Kiểm tra có thể bán không
    const canSell = ProductDataModel.canSellVariant(variant, soldQuantity);
    if (!canSell.can_sell) {
      return {
        success: false,
        error: canSell.error,
      };
    }

    // Trừ tồn kho
    const newQuantity = variant.quantity - soldQuantity;
    const updatedVariant = await this.updateVariant(variantId, {
      quantity: newQuantity,
      is_sold_out: newQuantity === 0,
    });

    if (!updatedVariant) {
      return {
        success: false,
        error: 'Cập nhật tồn kho thất bại',
      };
    }

    // Lấy Product đã được cập nhật
    const product = await this.getProductById(variant.product_id);

    return {
      success: true,
      variant: updatedVariant,
      product: product || undefined,
    };
  }

  /**
   * Tính lại tồn kho Product từ Variants (Rule 4)
   */
  async recalculateProductStock(productId: string): Promise<Product | null> {
    const product = await this.getProductById(productId);
    if (!product) return null;

    const variants = await this.getVariantsByProductId(productId);
    const updatedProduct = ProductDataModel.updateProductStockFromVariants(product, variants);

    const index = mockProducts.findIndex(p => p._id === productId);
    if (index !== -1) {
      mockProducts[index] = updatedProduct;
    }

    return updatedProduct;
  }

  /**
   * Xóa Variant (soft delete)
   */
  async deleteVariant(variantId: string): Promise<boolean> {
    const index = mockProductVariants.findIndex(v => v._id === variantId);
    if (index === -1) return false;

    const variant = mockProductVariants[index];
    mockProductVariants[index].deleted_at = new Date().toISOString();
    mockProductVariants[index].status = 0;

    // Cập nhật Product stock
    await this.recalculateProductStock(variant.product_id);

    return true;
  }

  // =====================================================
  // PROPERTY OPERATIONS
  // =====================================================

  /**
   * Lấy tất cả Properties
   */
  async getAllProperties(): Promise<ProductProperty[]> {
    return [...mockProductProperties];
  }

  /**
   * Lấy Property theo ID
   */
  async getPropertyById(id: string): Promise<ProductProperty | null> {
    return mockProductProperties.find(p => p._id === id) || null;
  }

  /**
   * Lấy Properties của Product
   */
  async getProductProperties(productId: string): Promise<Array<{
    property_id: string;
    property_name: string;
    values: string[];
  }>> {
    const propertyValues = mockProductPropertyValues.filter(pv => pv.product_id === productId);
    
    const groups = propertyValues.reduce((acc, pv) => {
      if (!acc[pv.property_id]) {
        acc[pv.property_id] = {
          property_id: pv.property_id,
          property_name: pv.property_name,
          values: [],
        };
      }
      if (!acc[pv.property_id].values.includes(pv.property_value)) {
        acc[pv.property_id].values.push(pv.property_value);
      }
      return acc;
    }, {} as Record<string, { property_id: string; property_name: string; values: string[] }>);

    return Object.values(groups);
  }

  /**
   * Lấy Properties của Variant
   */
  async getVariantProperties(variantId: string): Promise<Array<{
    property_id: string;
    property_name: string;
    property_value: string;
  }>> {
    return mockProductVariantPropertyValues
      .filter(vpv => vpv.variant_id === variantId)
      .map(vpv => ({
        property_id: vpv.property_id,
        property_name: vpv.property_name,
        property_value: vpv.property_value,
      }));
  }

  // =====================================================
  // UNIT OPERATIONS
  // =====================================================

  /**
   * Lấy tất cả Units
   */
  async getAllUnits(): Promise<ProductUnit[]> {
    return [...mockProductUnits];
  }

  /**
   * Lấy Unit Config của Product
   */
  async getProductUnitConfig(productId: string): Promise<ProductUnitConfig | null> {
    return mockProductUnitConfigs.find(uc => uc.product_id === productId) || null;
  }

  // =====================================================
  // HELPER METHODS
  // =====================================================

  /**
   * Sinh Variants tự động từ Properties
   */
  generateVariants(
    product: Product,
    properties: Record<string, string[]>
  ) {
    return ProductDataModel.generateVariantsFromProperties(product, properties);
  }

  /**
   * Validate Product data
   */
  validateProduct(product: Partial<Product>) {
    return ProductDataModel.validateProduct(product);
  }

  /**
   * Validate Variant data
   */
  validateVariant(variant: Partial<ProductVariant>) {
    return ProductDataModel.validateVariant(variant);
  }

  /**
   * Cập nhật tồn kho Variant
   */
  async updateVariantStock(variantId: string, quantityChange: number, reason?: string) {
    const variant = await this.getVariantById(variantId);
    if (!variant) {
      throw new Error('Variant not found');
    }

    const newQuantity = variant.quantity + quantityChange;
    const updatedVariant = await this.updateVariant(variantId, {
      quantity: newQuantity,
      is_sold_out: newQuantity === 0,
    });

    if (!updatedVariant) {
      throw new Error('Failed to update variant stock');
    }

    return updatedVariant;
  }

  /**
   * Cập nhật tồn kho Product
   */
  async updateProductStock(productId: string, quantityChange: number, reason?: string) {
    const product = await this.getProductById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const newQuantity = product.quantity + quantityChange;
    const updatedProduct = await this.updateProduct(productId, {
      quantity: newQuantity,
      is_sold_out: newQuantity === 0,
    });

    if (!updatedProduct) {
      throw new Error('Failed to update product stock');
    }

    return updatedProduct;
  }

  /**
   * Kiểm tra khả năng bán hàng
   */
  async checkStockAvailability(productId: string, variantId: string | null, quantity: number) {
    if (variantId) {
      const variant = await this.getVariantById(variantId);
      if (!variant) {
        throw new Error('Variant not found');
      }

      const canSell = ProductDataModel.canSellVariant(variant, quantity);
      return canSell;
    } else {
      const product = await this.getProductById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const canSell = ProductDataModel.canSellProduct(product, quantity);
      return canSell;
    }
  }
}

// =====================================================
// SINGLETON INSTANCE
// =====================================================

export const mockProductService = new MockProductService();

// =====================================================
// EXPORTS
// =====================================================

export default mockProductService;

// Export convenience functions
export const getProducts = () => mockProductService.getAllProducts();
export const getProductById = (id: string) => mockProductService.getProductById(id);
export const getProductWithVariants = (id: string) => mockProductService.getProductWithVariants(id);
export const getProductVariants = (productId: string) => mockProductService.getVariantsByProductId(productId);
export const getVariantsByProductId = (productId: string) => mockProductService.getVariantsByProductId(productId);
export const getVariantById = (id: string) => mockProductService.getVariantById(id);
export const getVariantWithProperties = (id: string) => mockProductService.getVariantWithProperties(id);
export const updateVariantStock = (variantId: string, quantityChange: number, reason?: string) => 
  mockProductService.updateVariantStock(variantId, quantityChange, reason);
export const updateProductStock = (productId: string, quantityChange: number, reason?: string) =>
  mockProductService.updateProductStock(productId, quantityChange, reason);
export const checkStockAvailability = (productId: string, variantId: string | null, quantity: number) =>
  mockProductService.checkStockAvailability(productId, variantId, quantity);