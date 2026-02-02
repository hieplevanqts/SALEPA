// =====================================================
// PRODUCT DATA MODEL - MÔ HÌNH KIOTVIET
// Hệ thống quản lý sản phẩm theo mô hình POS chuẩn
// CHỈ ÁP DỤNG CHO NGÀNH THỜI TRANG
// =====================================================

// =====================================================
// TYPE DEFINITIONS - CẤU TRÚC DỮ LIỆU
// =====================================================

/**
 * Product (SPU - Sản phẩm cha)
 * - Lưu thông tin chung của sản phẩm
 * - KHÔNG bán trực tiếp
 * - KHÔNG có barcode (barcode chỉ ở SKU)
 * - Tồn kho = tổng tồn kho các SKU (cached data)
 */
export interface Product {
  _id: string;
  tenant_id: string;
  industry_id: string;
  product_type_id: string | null;
  product_category_id: string | null;
  brand_id: string | null;
  code: string; // Mã sản phẩm (không phải barcode)
  title: string;
  brief: string | null;
  content: string | null;
  price: number | null; // Giá hiển thị chung (không dùng để bán)
  prices: { vnd: number; usd: number } | null;
  quantity: number; // Tổng tồn kho = sum(variants.quantity) - CACHED
  waiting_quantity: number; // Tổng tồn chờ = sum(variants.waiting_quantity) - CACHED
  is_sold_out: boolean; // true khi tất cả SKU hết hàng - CACHED
  status: 0 | 1; // 0: inactive, 1: active
  image: string | null;
  other_images: string[] | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  
  // Extended fields
  brand?: string;
  categories?: string;
  cost_price?: number;
  weight?: number;
  location?: string;
  order_product_count?: number;
  last_sold?: string;
  min_stock?: number;
  
  // UI helpers
  has_variants?: boolean; // true nếu product có phân loại
}

/**
 * ProductVariant (SKU - Đơn vị bán thực tế)
 * - Mỗi SKU là đơn vị bán duy nhất trong POS
 * - Thuộc về đúng 1 Product
 * - Có barcode riêng
 * - Mỗi Product phải có ít nhất 1 SKU
 */
export interface ProductVariant {
  _id: string;
  tenant_id: string;
  industry_id: string;
  product_id: string; // FK to Product
  sku: string; // Mã SKU duy nhất (VD: PRD-0001-RED-M)
  title: string; // Tên SKU (VD: "Áo thun Nike - Đỏ - M")
  barcode: string | null; // Barcode CHỈ tồn tại ở SKU
  cost_price: number | null; // Giá vốn
  price: number | null; // Giá bán
  prices: { vnd: number; usd: number } | null;
  quantity: number; // Tồn kho thực tế của SKU này
  waiting_quantity: number; // Tồn kho chờ
  status: 0 | 1; // 0: inactive, 1: active
  is_sold_out: boolean; // true khi quantity = 0
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  
  // UI helpers
  is_default?: boolean; // true nếu là SKU mặc định (product không phân loại)
}

/**
 * ProductProperty (Định nghĩa thuộc tính)
 * - Định nghĩa các thuộc tính có thể dùng (Màu sắc, Size...)
 * - Mỗi thuộc tính có danh sách giá trị cho phép
 */
export interface ProductProperty {
  _id: string;
  tenant_id: string;
  industry_id: string;
  code: string; // COLOR, SIZE, MATERIAL...
  name: string; // Màu sắc, Kích thước...
  description: string | null;
  values: string[]; // Danh sách giá trị cho phép ['Đỏ', 'Xanh', 'Vàng'...]
  status: 0 | 1;
  created_at: string;
  updated_at: string;
}

/**
 * ProductPropertyValue (Thuộc tính cấp Product)
 * - Lưu danh sách giá trị thuộc tính mà Product hỗ trợ
 * - VD: Product A có Màu sắc: [Đỏ, Đen, Trắng], Size: [S, M, L]
 * - Dùng để sinh các tổ hợp SKU
 * - KHÔNG đại diện cho dữ liệu của SKU cụ thể
 */
export interface ProductPropertyValue {
  _id: string;
  tenant_id: string;
  industry_id: string;
  product_id: string; // FK to Product
  property_id: string; // FK to ProductProperty
  property_name: string; // 'Màu sắc'
  property_value: string; // 'Đỏ'
  created_at: string;
  updated_at: string;
}

/**
 * ProductVariantPropertyValue (Thuộc tính cấp SKU)
 * - Lưu giá trị thuộc tính thực tế của TỪNG SKU
 * - VD: SKU "PRD-0001-RED-M" → Màu sắc = Đỏ, Size = M
 * - Mỗi SKU có đúng 1 giá trị cho mỗi thuộc tính
 */
export interface ProductVariantPropertyValue {
  _id: string;
  tenant_id: string;
  industry_id: string;
  product_id: string; // FK to Product
  variant_id: string; // FK to ProductVariant
  property_id: string; // FK to ProductProperty
  property_name: string; // 'Màu sắc'
  property_value: string; // 'Đỏ'
  created_at: string;
  updated_at: string;
}

/**
 * ProductUnit (Định nghĩa đơn vị tính)
 * - Cái, Đôi, Bộ, Chiếc...
 */
export interface ProductUnit {
  _id: string;
  tenant_id: string;
  industry_id: string;
  name: string;
  description: string | null;
  status: 0 | 1;
  created_at: string;
  updated_at: string;
}

/**
 * ProductUnitConfig (Cấu hình đơn vị tính cấp Product)
 * - Mỗi Product có ít nhất 1 đơn vị cơ bản
 * - Có thể có nhiều đơn vị với tỷ lệ quy đổi
 */
export interface ProductUnitConfig {
  _id: string;
  tenant_id: string;
  industry_id: string;
  product_id: string; // FK to Product
  unit_id: string; // FK to ProductUnit
  unit_name: string; // 'Thùng'
  conversion: number; // 1 Thùng = 12 Cái
  is_base: boolean; // Đơn vị cơ bản
  is_direct_sale: boolean; // Bán trực tiếp
  created_at: string;
  updated_at: string;
}

// =====================================================
// BUSINESS RULES - QUY TẮC NGHIỆP VỤ
// =====================================================

/**
 * Rule 1: Không bán Product, chỉ bán SKU
 * - POS chỉ quét/tìm SKU, không quét Product
 * - Khi bán, trừ tồn kho của SKU
 */
export const RULE_1_ONLY_SELL_SKU = 'ONLY_SELL_SKU';

/**
 * Rule 2: Product không có phân loại → tự động tạo 1 SKU mặc định
 * - SKU mặc định có: sku = product.code, title = product.title
 * - Không có thuộc tính phân loại
 */
export const RULE_2_AUTO_CREATE_DEFAULT_SKU = 'AUTO_CREATE_DEFAULT_SKU';

/**
 * Rule 3: Barcode chỉ tồn tại ở SKU
 * - Product KHÔNG có barcode
 * - Mỗi SKU có thể có 1 barcode riêng
 */
export const RULE_3_BARCODE_ONLY_AT_SKU = 'BARCODE_ONLY_AT_SKU';

/**
 * Rule 4: Tồn kho Product = tổng tồn kho tất cả SKU
 * - product.quantity = sum(variants.quantity)
 * - product.waiting_quantity = sum(variants.waiting_quantity)
 * - Đây là dữ liệu CACHED, tự động cập nhật khi SKU thay đổi
 */
export const RULE_4_PRODUCT_STOCK_IS_SUM = 'PRODUCT_STOCK_IS_SUM';

/**
 * Rule 5: Product hết hàng khi tất cả SKU hết hàng
 * - product.is_sold_out = true khi tất cả variants.quantity = 0
 */
export const RULE_5_SOLD_OUT_WHEN_ALL_VARIANTS_EMPTY = 'SOLD_OUT_WHEN_ALL_VARIANTS_EMPTY';

// =====================================================
// DATA FLOW - LUỒNG DỮ LIỆU
// =====================================================

/**
 * LUỒNG THÊM SẢN PHẨM (Create Product Flow)
 * 
 * Step 1: Tạo Product (SPU) với thông tin cơ bản
 * Step 2: Chọn các thuộc tính phân loại (Màu sắc, Size...)
 * Step 3: Khai báo giá trị thuộc tính ở cấp Product
 *         → Tạo ProductPropertyValue[]
 * Step 4: Sinh các tổ hợp SKU từ thuộc tính
 *         → Ví dụ: [Đỏ, Đen] x [S, M, L] = 6 SKU
 * Step 5: Với mỗi SKU:
 *         a. Gán mã SKU (PRD-0001-RED-S)
 *         b. Gán barcode
 *         c. Gán giá bán, giá vốn
 *         d. Gán tồn kho
 *         e. Lưu thuộc tính SKU → ProductVariantPropertyValue[]
 * Step 6: Tự động tính và cập nhật:
 *         a. product.quantity = sum(variants.quantity)
 *         b. product.waiting_quantity = sum(variants.waiting_quantity)
 *         c. product.is_sold_out = all(variants.quantity === 0)
 */
export interface CreateProductFlow {
  product: Partial<Product>;
  properties: Array<{
    property_id: string;
    property_name: string;
    values: string[]; // Giá trị được chọn
  }>;
  variants: Array<{
    sku: string;
    title: string;
    barcode: string | null;
    cost_price: number | null;
    price: number | null;
    quantity: number;
    properties: Record<string, string>; // { 'Màu sắc': 'Đỏ', 'Size': 'M' }
  }>;
  unit_config?: {
    unit_id: string;
    unit_name: string;
    is_base: boolean;
    conversion: number;
  };
}

/**
 * LUỒNG CẬP NHẬT SẢN PHẨM (Update Product Flow)
 * 
 * Khi thay đổi thuộc tính phân loại:
 * Step 1: Xóa toàn bộ ProductVariant cũ
 * Step 2: Xóa toàn bộ ProductVariantPropertyValue cũ
 * Step 3: Sinh lại danh sách SKU mới từ thuộc tính mới
 * Step 4: Gán lại thuộc tính cho từng SKU
 * Step 5: Tính lại tồn kho Product
 * 
 * Lưu ý: Đây là thao tác NGUY HIỂM, cần cảnh báo người dùng
 */
export interface UpdateProductFlow {
  product_id: string;
  updates: Partial<Product>;
  regenerate_variants?: boolean; // true = xóa SKU cũ và tạo lại
  new_properties?: Array<{
    property_id: string;
    property_name: string;
    values: string[];
  }>;
  new_variants?: Array<{
    sku: string;
    title: string;
    barcode: string | null;
    cost_price: number | null;
    price: number | null;
    quantity: number;
    properties: Record<string, string>;
  }>;
}

/**
 * LUỒNG BÁN HÀNG POS (POS Sale Flow)
 * 
 * Step 1: Quét barcode hoặc nhập mã SKU
 * Step 2: Tìm ProductVariant theo barcode/sku
 * Step 3: Kiểm tra tồn kho SKU
 * Step 4: Thêm vào giỏ hàng
 * Step 5: Khi thanh toán:
 *         a. Trừ tồn kho SKU (variant.quantity -= sold_quantity)
 *         b. Cập nhật variant.is_sold_out
 *         c. Tự động cập nhật product.quantity
 *         d. Tự động cập nhật product.is_sold_out
 */
export interface POSSaleFlow {
  search_term: string; // barcode hoặc sku
  variant: ProductVariant | null;
  product: Product | null;
  available_quantity: number;
  can_sell: boolean;
  error?: string;
}

// =====================================================
// HELPER TYPES
// =====================================================

/**
 * Variant với đầy đủ thông tin thuộc tính
 */
export interface VariantWithProperties extends ProductVariant {
  properties: Array<{
    property_id: string;
    property_name: string;
    property_value: string;
  }>;
  product?: Product;
}

/**
 * Product với đầy đủ thông tin variants và properties
 */
export interface ProductWithVariants extends Product {
  variants: VariantWithProperties[];
  property_configs: Array<{
    property_id: string;
    property_name: string;
    values: string[];
  }>;
  unit_config?: ProductUnitConfig;
}

/**
 * Kết quả sinh SKU từ thuộc tính
 */
export interface GeneratedVariant {
  sku: string;
  title: string;
  properties: Record<string, string>; // { 'Màu sắc': 'Đỏ', 'Size': 'M' }
  property_suffix: string; // 'RED-M'
}

// =====================================================
// VALIDATION RULES
// =====================================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate Product data
 */
export function validateProduct(product: Partial<Product>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!product.title || product.title.trim() === '') {
    errors.push('Tên sản phẩm không được để trống');
  }

  if (!product.code || product.code.trim() === '') {
    errors.push('Mã sản phẩm không được để trống');
  }

  if (product.price !== null && product.price !== undefined && product.price < 0) {
    errors.push('Giá sản phẩm không được âm');
  }

  if (product.quantity !== undefined && product.quantity < 0) {
    errors.push('Tồn kho không được âm');
  }

  // Warnings
  if (!product.image) {
    warnings.push('Nên thêm hình ảnh cho sản phẩm');
  }

  if (!product.brand_id) {
    warnings.push('Nên chọn thương hiệu cho sản phẩm');
  }

  if (!product.product_category_id) {
    warnings.push('Nên chọn danh mục cho sản phẩm');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate Variant data
 */
export function validateVariant(variant: Partial<ProductVariant>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!variant.sku || variant.sku.trim() === '') {
    errors.push('Mã SKU không được để trống');
  }

  if (!variant.title || variant.title.trim() === '') {
    errors.push('Tên SKU không được để trống');
  }

  if (!variant.product_id) {
    errors.push('SKU phải thuộc về 1 Product');
  }

  if (variant.price !== null && variant.price !== undefined && variant.price < 0) {
    errors.push('Giá bán không được âm');
  }

  if (variant.cost_price !== null && variant.cost_price !== undefined && variant.cost_price < 0) {
    errors.push('Giá vốn không được âm');
  }

  if (variant.quantity !== undefined && variant.quantity < 0) {
    errors.push('Tồn kho không được âm');
  }

  // Check price vs cost_price
  if (
    variant.price !== null && 
    variant.cost_price !== null && 
    variant.price !== undefined && 
    variant.cost_price !== undefined &&
    variant.price < variant.cost_price
  ) {
    warnings.push('Giá bán thấp hơn giá vốn - Lưu ý lỗ');
  }

  // Warnings
  if (!variant.barcode) {
    warnings.push('Nên thêm barcode cho SKU để dễ quét');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// =====================================================
// CARTESIAN PRODUCT - Sinh tổ hợp SKU
// =====================================================

/**
 * Sinh tất cả tổ hợp từ các thuộc tính
 * VD: [Đỏ, Đen] x [S, M, L] = 6 tổ hợp
 * 
 * @param properties - { 'Màu sắc': ['Đỏ', 'Đen'], 'Size': ['S', 'M', 'L'] }
 * @returns Array of combinations - [{ 'Màu sắc': 'Đỏ', 'Size': 'S' }, ...]
 */
export function generateVariantCombinations(
  properties: Record<string, string[]>
): Array<Record<string, string>> {
  const propertyNames = Object.keys(properties);
  
  if (propertyNames.length === 0) {
    return [{}];
  }

  const combinations: Array<Record<string, string>> = [];
  
  function generate(index: number, current: Record<string, string>) {
    if (index === propertyNames.length) {
      combinations.push({ ...current });
      return;
    }

    const propertyName = propertyNames[index];
    const values = properties[propertyName];

    for (const value of values) {
      current[propertyName] = value;
      generate(index + 1, current);
    }
  }

  generate(0, {});
  return combinations;
}

/**
 * Sinh danh sách SKU từ product và properties
 * 
 * @param product - Product base info
 * @param properties - { 'Màu sắc': ['Đỏ', 'Đen'], 'Size': ['S', 'M', 'L'] }
 * @returns Generated variants
 */
export function generateVariantsFromProperties(
  product: Product,
  properties: Record<string, string[]>
): GeneratedVariant[] {
  const combinations = generateVariantCombinations(properties);
  
  if (combinations.length === 0 || (combinations.length === 1 && Object.keys(combinations[0]).length === 0)) {
    // Không có phân loại → tạo 1 SKU mặc định (Rule 2)
    return [{
      sku: product.code,
      title: product.title,
      properties: {},
      property_suffix: '',
    }];
  }

  return combinations.map((combo, index) => {
    // Tạo suffix từ các giá trị thuộc tính
    // VD: Đỏ-M → RED-M
    const suffix = Object.values(combo)
      .map(v => v.toUpperCase().replace(/\s+/g, '-'))
      .join('-');
    
    // Tạo title với thuộc tính
    // VD: "Áo thun Nike - Đỏ - M"
    const title = `${product.title} - ${Object.values(combo).join(' - ')}`;
    
    // Tạo SKU
    // VD: PRD-0001-RED-M
    const sku = `${product.code}-${suffix}`;

    return {
      sku,
      title,
      properties: combo,
      property_suffix: suffix,
    };
  });
}

// =====================================================
// STOCK CALCULATION - Tính toán tồn kho
// =====================================================

/**
 * Tính tổng tồn kho Product từ các Variants (Rule 4)
 */
export function calculateProductStock(variants: ProductVariant[]): {
  quantity: number;
  waiting_quantity: number;
  is_sold_out: boolean;
} {
  const quantity = variants.reduce((sum, v) => sum + v.quantity, 0);
  const waiting_quantity = variants.reduce((sum, v) => sum + v.waiting_quantity, 0);
  const is_sold_out = variants.length > 0 && variants.every(v => v.quantity === 0);

  return { quantity, waiting_quantity, is_sold_out };
}

/**
 * Cập nhật tồn kho Product sau khi thay đổi Variant
 */
export function updateProductStockFromVariants(
  product: Product,
  variants: ProductVariant[]
): Product {
  const stock = calculateProductStock(variants);
  
  return {
    ...product,
    quantity: stock.quantity,
    waiting_quantity: stock.waiting_quantity,
    is_sold_out: stock.is_sold_out,
    updated_at: new Date().toISOString(),
  };
}

// =====================================================
// POS SEARCH - Tìm kiếm trong POS
// =====================================================

/**
 * Tìm Variant theo barcode hoặc SKU (Rule 1)
 */
export function searchVariantForPOS(
  searchTerm: string,
  variants: ProductVariant[]
): ProductVariant | null {
  const term = searchTerm.trim().toUpperCase();
  
  // Tìm theo barcode
  let found = variants.find(v => 
    v.barcode && v.barcode.toUpperCase() === term
  );
  
  // Nếu không tìm thấy, tìm theo SKU
  if (!found) {
    found = variants.find(v => 
      v.sku.toUpperCase() === term
    );
  }
  
  return found || null;
}

/**
 * Kiểm tra có thể bán Variant không
 */
export function canSellVariant(
  variant: ProductVariant,
  requestedQuantity: number
): { can_sell: boolean; error?: string } {
  if (variant.status === 0) {
    return {
      can_sell: false,
      error: 'SKU đã bị vô hiệu hóa',
    };
  }

  if (variant.is_sold_out || variant.quantity === 0) {
    return {
      can_sell: false,
      error: 'SKU đã hết hàng',
    };
  }

  if (requestedQuantity > variant.quantity) {
    return {
      can_sell: false,
      error: `Chỉ còn ${variant.quantity} sản phẩm trong kho`,
    };
  }

  return { can_sell: true };
}

// =====================================================
// EXPORTS
// =====================================================

export const ProductDataModel = {
  // Validation
  validateProduct,
  validateVariant,
  
  // Generation
  generateVariantCombinations,
  generateVariantsFromProperties,
  
  // Calculation
  calculateProductStock,
  updateProductStockFromVariants,
  
  // POS
  searchVariantForPOS,
  canSellVariant,
  
  // Rules
  RULES: {
    RULE_1_ONLY_SELL_SKU,
    RULE_2_AUTO_CREATE_DEFAULT_SKU,
    RULE_3_BARCODE_ONLY_AT_SKU,
    RULE_4_PRODUCT_STOCK_IS_SUM,
    RULE_5_SOLD_OUT_WHEN_ALL_VARIANTS_EMPTY,
  },
};

export default ProductDataModel;
