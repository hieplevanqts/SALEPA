// Export wrapper cho mockDataService
import { mockDataService } from './mockProductData_fashion_only';

export const mockApi = {
  // Product Types
  getProductTypes: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return { success: true, data: await mockDataService.getProductTypes() };
  },
  createProductType: async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const result = await mockDataService.createProductType(data);
    return { success: true, data: result };
  },
  updateProductType: async (id: string, data: any) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const result = await mockDataService.updateProductType(id, data);
    return { success: !!result, data: result };
  },

  // Product Categories
  getProductCategories: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return { success: true, data: await mockDataService.getProductCategories() };
  },
  createProductCategory: async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const result = await mockDataService.createProductCategory(data);
    return { success: true, data: result };
  },
  updateProductCategory: async (id: string, data: any) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const result = await mockDataService.updateProductCategory(id, data);
    return { success: !!result, data: result };
  },

  // Products
  getProducts: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return { success: true, data: await mockDataService.getProducts() };
  },
  getProductById: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const result = await mockDataService.getProductById(id);
    return { success: !!result, data: result };
  },
  getProductByCode: async (code: string) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const result = await mockDataService.getProductByCode(code);
    return { success: !!result, data: result };
  },
  createProduct: async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const result = await mockDataService.createProduct(data);
    return { success: true, data: result };
  },
  updateProduct: async (id: string, data: any) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const result = await mockDataService.updateProduct(id, data);
    return { success: !!result, data: result };
  },
  deleteProduct: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const result = await mockDataService.deleteProduct(id);
    return { success: result };
  },

  // Product Brands
  getProductBrands: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return { success: true, data: await mockDataService.getProductBrands() };
  },
  createProductBrand: async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const result = await mockDataService.createProductBrand(data);
    return { success: true, data: result };
  },
  updateProductBrand: async (id: string, data: any) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const result = await mockDataService.updateProductBrand(id, data);
    return { success: !!result, data: result };
  },

  // Product Properties
  getProductProperties: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return { success: true, data: await mockDataService.getProductProperties() };
  },
  createProductProperty: async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const result = await mockDataService.createProductProperty(data);
    return { success: true, data: result };
  },
  updateProductProperty: async (id: string, data: any) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const result = await mockDataService.updateProductProperty(id, data);
    return { success: !!result, data: result };
  },

  // Product Variants
  getProductVariants: async (productId?: string) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return { success: true, data: await mockDataService.getProductVariants(productId) };
  },
  getProductVariantsByProduct: async (productId: string) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return { success: true, data: await mockDataService.getProductVariants(productId) };
  },
  getProductVariantByCode: async (code: string) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const result = await mockDataService.getProductVariantByCode(code);
    return { success: !!result, data: result };
  },
  getProductVariant: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const result = await mockDataService.getProductVariant(id);
    return { success: !!result, data: result };
  },
  getProductVariantByBarcode: async (barcode: string) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const result = await mockDataService.getProductVariantByBarcode(barcode);
    return { success: !!result, data: result };
  },
  createProductVariant: async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const result = await mockDataService.createProductVariant(data);
    return { success: true, data: result };
  },
  updateProductVariant: async (id: string, data: any) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const result = await mockDataService.updateProductVariant(id, data);
    return { success: !!result, data: result };
  },
  deleteProductVariant: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const result = await mockDataService.deleteProductVariant(id);
    return { success: result };
  },

  // Product Units
  getProductUnits: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return { success: true, data: await mockDataService.getProductUnits() };
  },
  createProductUnit: async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const result = await mockDataService.createProductUnit(data);
    return { success: true, data: result };
  },
  updateProductUnit: async (id: string, data: any) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const result = await mockDataService.updateProductUnit(id, data);
    return { success: !!result, data: result };
  },

  // Product Property Values (Liên kết)
  getProductPropertyValues: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return { success: true, data: await mockDataService.getProductPropertyValues() };
  },
  getProductPropertyValuesByProductId: async (productId: string) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return { success: true, data: await mockDataService.getProductPropertyValuesByProductId(productId) };
  },
  createProductPropertyValue: async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const result = await mockDataService.createProductPropertyValue(data);
    return { success: true, data: result };
  },
  deleteProductPropertyValuesByProductId: async (productId: string) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const result = await mockDataService.deleteProductPropertyValuesByProductId(productId);
    return { success: true, data: result };
  },

  // Product Unit Configs (Liên kết)
  getProductUnitConfigs: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return { success: true, data: await mockDataService.getProductUnitConfigs() };
  },
  getProductUnitConfigsByProductId: async (productId: string) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return { success: true, data: await mockDataService.getProductUnitConfigsByProductId(productId) };
  },
  createProductUnitConfig: async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const result = await mockDataService.createProductUnitConfig(data);
    return { success: true, data: result };
  },
  deleteProductUnitConfigsByProductId: async (productId: string) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const result = await mockDataService.deleteProductUnitConfigsByProductId(productId);
    return { success: true, data: result };
  },

  // Industries
  getIndustries: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return { success: true, data: await mockDataService.getIndustries() };
  },
};