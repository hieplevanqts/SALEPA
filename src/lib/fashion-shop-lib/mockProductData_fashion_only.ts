// =====================================================
// MOCK DATA SERVICE - CHỈ NGÀNH THỜI TRANG
// Chỉ chứa dữ liệu liên quan đến ngành Thời trang
// =====================================================

import { 
  generateSKU, 
  generateVariantTitle 
} from './variantUtils';

// 🔥 LOCAL STORAGE HELPERS - Persist mock data across page reloads
const STORAGE_KEY_PRODUCTS = 'salepa_mock_products';
const STORAGE_KEY_VARIANTS = 'salepa_mock_variants';

function loadFromStorage<T>(key: string, defaultData: T): T {
  if (typeof window === 'undefined') return defaultData;
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      console.log(`📦 [Storage] Loaded ${key} from localStorage`);
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error(`❌ [Storage] Failed to load ${key}:`, error);
  }
  return defaultData;
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`💾 [Storage] Saved ${key} to localStorage`);
  } catch (error) {
    console.error(`❌ [Storage] Failed to save ${key}:`, error);
  }
}

export interface Industry {
  _id: string;
  tenant_id: string;
  code: string;
  name: string;
  description: string | null;
  status: 0 | 1 | 2;
  created_at: string;
  updated_at: string;
}

export interface ProductType {
  _id: string;
  tenant_id: string;
  industry_id: string;
  code: string;
  name: string;
  description: string | null;
  status: 0 | 1;
  created_at: string;
  updated_at: string;
}

export interface ProductCategory {
  _id: string;
  tenant_id: string;
  industry_id: string;
  code: string;
  name: string;
  parent_id: string | null;
  path: string;
  level: number;
  sort_order: number;
  status: 0 | 1;
  created_at: string;
  updated_at: string;
}

export interface Product {
  _id: string;
  tenant_id: string;
  industry_id: string;
  product_type_id: string | null;
  product_category_id: string | null;
  brand_id: string | null;
  code: string;
  title: string;
  brief: string | null;
  content: string | null;
  price: number | null;
  prices: { vnd: number; usd: number } | null;
  quantity: number;
  waiting_quantity: number;
  is_sold_out: boolean;
  status: 0 | 1;
  image: string | null;
  other_images: string[] | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  
  // Extended fields
  brand?: string;
  categories?: string;
  // REMOVED: barcode - Rule 3: barcode CHỈ nằm ở product_variants
  cost_price?: number;
  weight?: number;
  location?: string;
  order_product_count?: number;
  last_sold?: string;
  min_stock?: number;
}

export interface ProductBrand {
  _id: string;
  tenant_id: string;
  industry_id: string;
  name: string;
  status: 0 | 1;
  created_at: string;
  updated_at: string;
}

export interface ProductProperty {
  _id: string;
  tenant_id: string;
  industry_id: string;
  code: string;
  name: string;
  description: string | null;
  values: string[];
  status: 0 | 1;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  _id: string;
  tenant_id: string;
  industry_id: string;
  product_id: string;
  sku: string;  // SKU duy nhất cho variant (trước đây là 'code')
  title: string;
  barcode: string | null;  // Rule 3: barcode CHỈ nằm ở product_variants
  cost_price: number | null;
  price: number | null;
  prices: { vnd: number; usd: number } | null;
  // 🔥 Inventory is stored separately; keep optional fields for mock seeds
  quantity?: number;
  waiting_quantity?: number;
  status: 0 | 1;
  is_sold_out: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  
  // ✅ NEW: Variant extended fields
  unit?: string;  // Đơn vị tính, ví dụ: "Cái", "Đôi"
  conversion?: number;  // Hệ số quy đổi, mặc định 1
  is_default?: boolean;  // true nếu là variant mặc định (không phân loại)
  attributes?: { [key: string]: string };  // Thuộc tính, ví dụ: { "Màu sắc": "Đỏ", "Kích thước": "M" }
}

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

// Liên kết: Product có thuộc tính gì (Màu sắc, Size...)
export interface ProductPropertyValue {
  _id: string;
  tenant_id: string;
  industry_id: string;
  product_id: string;
  property_id: string; // Reference to ProductProperty
  property_name: string; // e.g., "Màu sắc"
  property_value: string; // e.g., "Đỏ"
  created_at: string;
  updated_at: string;
}

// Liên kết: Product có đơn vị tính gì (Cái, Thùng...)
export interface ProductUnitConfig {
  _id: string;
  tenant_id: string;
  industry_id: string;
  product_id: string;
  unit_id: string; // Reference to ProductUnit
  unit_name: string; // e.g., "Thùng"
  conversion: number; // Quy đổi: 1 Thùng = 12 Cái
  is_base: boolean; // Đơn vị cơ bản
  is_direct_sale: boolean; // Bán trực tiếp
  created_at: string;
  updated_at: string;
}

// Liên kết: Thuộc tính cấp SKU (giá trị thuộc tính của TỪNG variant)
export interface ProductVariantPropertyValue {
  _id: string;
  tenant_id: string;
  industry_id: string;
  product_id: string;
  variant_id: string; // Reference to ProductVariant
  property_id: string; // Reference to ProductProperty
  property_name: string; // e.g., "Màu sắc"
  property_value: string; // e.g., "Đỏ"
  created_at: string;
  updated_at: string;
}

// =====================================================
// FIXED IDs - CHỈ THỜI TRANG
// =====================================================
const TENANT_ID = '01942c1a-b2e4-7d4e-9a3f-1234567890ab';
const INDUSTRY_FASHION_ID = '01942c1a-0001-0000-0000-000000000001';

// =====================================================
// MOCK DATA: INDUSTRY - CHỈ THỜI TRANG
// =====================================================
let mockIndustries: Industry[] = [
  { 
    _id: INDUSTRY_FASHION_ID, 
    tenant_id: TENANT_ID, 
    code: 'FASHION', 
    name: 'Thời trang', 
    description: 'Ngành thời trang & phụ kiện', 
    status: 1, 
    created_at: new Date().toISOString(), 
    updated_at: new Date().toISOString() 
  },
];

// =====================================================
// MOCK DATA: PRODUCT TYPES - CHỈ THỜI TRANG (15 loại)
// =====================================================
let mockProductTypes: ProductType[] = [
  { _id: '01942c1a-0002-0000-0000-000000000001', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'CLOTHING', name: 'Quần áo', description: 'Áo, quần, váy...', status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: '01942c1a-0002-0000-0000-000000000002', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'SHOES', name: 'Giày dép', description: 'Giày, dép, sandal...', status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: '01942c1a-0002-0000-0000-000000000003', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'ACCESSORY', name: 'Phụ kiện', description: 'Túi, mũ, thắt lưng...', status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: '01942c1a-0002-0000-0000-000000000004', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'BAG', name: 'Túi xách', description: 'Balo, túi đeo, ví...', status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: '01942c1a-0002-0000-0000-000000000005', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'WATCH', name: 'Đồng hồ', description: 'Đồng hồ đeo tay', status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: '01942c1a-0002-0000-0000-000000000006', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'JEWELRY', name: 'Trang sức', description: 'Nhẫn, vòng, dây chuyền...', status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: '01942c1a-0002-0000-0000-000000000007', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'HAT', name: 'Mũ nón', description: 'Mũ lưỡi trai, nón...', status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: '01942c1a-0002-0000-0000-000000000008', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'BELT', name: 'Thắt lưng', description: 'Dây nịt, thắt lưng...', status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: '01942c1a-0002-0000-0000-000000000009', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'SCARF', name: 'Khăn', description: 'Khăn choàng, khăn quàng...', status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: '01942c1a-0002-0000-0000-00000000000a', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'GLASSES', name: 'Kính', description: 'Kính mát, kính thời trang...', status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: '01942c1a-0002-0000-0000-00000000000b', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'SOCKS', name: 'Vớ tất', description: 'Vớ, tất...', status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: '01942c1a-0002-0000-0000-00000000000c', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'UNDERWEAR', name: 'Đồ lót', description: 'Áo lót, quần lót...', status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: '01942c1a-0002-0000-0000-00000000000d', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'SPORTSWEAR', name: 'Đồ thể thao', description: 'Quần áo tập gym, chạy bộ...', status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: '01942c1a-0002-0000-0000-00000000000e', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'JACKET', name: 'Áo khoác', description: 'Áo khoác, blazer...', status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: '01942c1a-0002-0000-0000-00000000000f', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'SWIMWEAR', name: 'Đồ bơi', description: 'Bikini, áo tắm...', status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

// =====================================================
// MOCK DATA: PRODUCT CATEGORIES - CHỈ THỜI TRANG (15 cate)
// =====================================================
let mockProductCategories: ProductCategory[] = [
  // ROOT CATEGORIES (5)
  { _id: '01942c1a-0003-0000-0000-000000000001', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'CAT-MENS', name: 'Thời trang nam', parent_id: null, path: '/CAT-MENS', level: 0, sort_order: 1, status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: '01942c1a-0003-0000-0000-000000000002', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'CAT-WOMENS', name: 'Thời trang nữ', parent_id: null, path: '/CAT-WOMENS', level: 0, sort_order: 2, status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: '01942c1a-0003-0000-0000-000000000003', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'CAT-KIDS', name: 'Thời trang trẻ em', parent_id: null, path: '/CAT-KIDS', level: 0, sort_order: 3, status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: '01942c1a-0003-0000-0000-000000000004', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'CAT-SHOES', name: 'Giày dép', parent_id: null, path: '/CAT-SHOES', level: 0, sort_order: 4, status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: '01942c1a-0003-0000-0000-000000000005', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'CAT-BAGS', name: 'Túi xách & Balo', parent_id: null, path: '/CAT-BAGS', level: 0, sort_order: 5, status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  
  // CHILD CATEGORIES (10)
  { _id: '01942c1a-0003-0001-0000-000000000001', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'CAT-MENS-SHIRT', name: 'Áo nam', parent_id: '01942c1a-0003-0000-0000-000000000001', path: '/CAT-MENS/CAT-MENS-SHIRT', level: 1, sort_order: 11, status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: '01942c1a-0003-0001-0000-000000000002', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'CAT-MENS-PANT', name: 'Quần nam', parent_id: '01942c1a-0003-0000-0000-000000000001', path: '/CAT-MENS/CAT-MENS-PANT', level: 1, sort_order: 12, status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: '01942c1a-0003-0001-0000-000000000003', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'CAT-WOMENS-DRESS', name: 'Đầm nữ', parent_id: '01942c1a-0003-0000-0000-000000000002', path: '/CAT-WOMENS/CAT-WOMENS-DRESS', level: 1, sort_order: 21, status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: '01942c1a-0003-0001-0000-000000000004', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'CAT-WOMENS-SKIRT', name: 'Váy nữ', parent_id: '01942c1a-0003-0000-0000-000000000002', path: '/CAT-WOMENS/CAT-WOMENS-SKIRT', level: 1, sort_order: 22, status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: '01942c1a-0003-0001-0000-000000000005', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'CAT-KIDS-BOY', name: 'Bé trai', parent_id: '01942c1a-0003-0000-0000-000000000003', path: '/CAT-KIDS/CAT-KIDS-BOY', level: 1, sort_order: 31, status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: '01942c1a-0003-0001-0000-000000000006', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'CAT-KIDS-GIRL', name: 'Bé gái', parent_id: '01942c1a-0003-0000-0000-000000000003', path: '/CAT-KIDS/CAT-KIDS-GIRL', level: 1, sort_order: 32, status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: '01942c1a-0003-0001-0000-000000000007', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'CAT-SHOES-SNEAKER', name: 'Giày thể thao', parent_id: '01942c1a-0003-0000-0000-000000000004', path: '/CAT-SHOES/CAT-SHOES-SNEAKER', level: 1, sort_order: 41, status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: '01942c1a-0003-0001-0000-000000000008', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'CAT-SHOES-SANDAL', name: 'Dép & Sandal', parent_id: '01942c1a-0003-0000-0000-000000000004', path: '/CAT-SHOES/CAT-SHOES-SANDAL', level: 1, sort_order: 42, status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: '01942c1a-0003-0001-0000-000000000009', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'CAT-BAGS-BACKPACK', name: 'Balo', parent_id: '01942c1a-0003-0000-0000-000000000005', path: '/CAT-BAGS/CAT-BAGS-BACKPACK', level: 1, sort_order: 51, status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: '01942c1a-0003-0001-0000-000000000010', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'CAT-BAGS-HANDBAG', name: 'Túi xách tay', parent_id: '01942c1a-0003-0000-0000-000000000005', path: '/CAT-BAGS/CAT-BAGS-HANDBAG', level: 1, sort_order: 52, status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

// =====================================================
// MOCK DATA: PRODUCT BRANDS - CHỈ THỜI TRANG (15 brands)
// =====================================================
let mockProductBrands: ProductBrand[] = [
  { _id: 'BRAND-0001', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, name: 'Nike', status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: 'BRAND-0002', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, name: 'Adidas', status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: 'BRAND-0003', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, name: 'Uniqlo', status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: 'BRAND-0004', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, name: 'Zara', status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: 'BRAND-0005', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, name: 'H&M', status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: 'BRAND-0006', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, name: 'Puma', status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: 'BRAND-0007', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, name: 'Converse', status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: 'BRAND-0008', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, name: 'Vans', status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: 'BRAND-0009', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, name: 'Gucci', status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: 'BRAND-0010', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, name: 'Louis Vuitton', status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: 'BRAND-0011', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, name: 'Chanel', status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: 'BRAND-0012', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, name: 'Hermès', status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: 'BRAND-0013', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, name: 'Balenciaga', status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: 'BRAND-0014', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, name: 'Dior', status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: 'BRAND-0015', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, name: 'Local Brand', status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

// =====================================================
// MOCK DATA: PRODUCT PROPERTIES - CHỈ THỜI TRANG (15 props)
// =====================================================
let mockProductProperties: ProductProperty[] = [
  { _id: 'PROP-0001', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'COLOR', name: 'Màu sắc', description: 'Màu sắc sản phẩm', values: ['Đỏ', 'Xanh dương', 'Xanh lá', 'Vàng', 'Đen', 'Trắng', 'Hồng', 'Tím', 'Nâu', 'Xám', 'Be', 'Cam'], status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: 'PROP-0002', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'SIZE', name: 'Kích thước', description: 'Size quần áo', values: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size'], status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: 'PROP-0003', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'MATERIAL', name: 'Chất liệu', description: 'Chất liệu vải', values: ['Cotton', 'Polyester', 'Linen', 'Denim', 'Silk', 'Wool', 'Leather', 'Kaki', 'Jean', 'Vải thun'], status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: 'PROP-0004', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'SHOE_SIZE', name: 'Size giày', description: 'Kích cỡ giày', values: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'], status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: 'PROP-0005', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'STYLE', name: 'Phong cách', description: 'Phong cách thiết kế', values: ['Casual', 'Formal', 'Sport', 'Vintage', 'Modern', 'Classic', 'Streetwear', 'Elegant'], status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: 'PROP-0006', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'GENDER', name: 'Giới tính', description: 'Dành cho', values: ['Nam', 'Nữ', 'Unisex'], status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: 'PROP-0007', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'SEASON', name: 'Mùa', description: 'Phù hợp mùa', values: ['Xuân', 'Hạ', 'Thu', 'Đông', 'Bốn mùa'], status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: 'PROP-0008', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'FIT', name: 'Form dáng', description: 'Kiểu dáng', values: ['Slim Fit', 'Regular Fit', 'Oversized', 'Relaxed Fit', 'Skinny'], status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: 'PROP-0009', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'COLLAR', name: 'Cổ áo', description: 'Kiểu cổ', values: ['Cổ tròn', 'Cổ V', 'Cổ polo', 'Cổ sơ mi', 'Cổ cao', 'Cổ thuyền'], status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: 'PROP-0010', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'SLEEVE', name: 'Tay áo', description: 'Độ dài tay', values: ['Tay ngắn', 'Tay dài', 'Tay lỡ', 'Ba lỗ', 'Không tay'], status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: 'PROP-0011', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'LENGTH', name: 'Độ dài', description: 'Độ dài sản phẩm', values: ['Ngắn', 'Vừa', 'Dài', 'Maxi'], status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: 'PROP-0012', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'PATTERN', name: 'Họa tiết', description: 'Kiểu họa tiết', values: ['Trơn', 'Kẻ sọc', 'Kẻ caro', 'Hoa văn', 'Graphic', 'Logo'], status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: 'PROP-0013', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'WAIST', name: 'Kiểu eo', description: 'Kiểu eo quần/váy', values: ['Eo thấp', 'Eo vừa', 'Eo cao', 'Eo thun'], status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: 'PROP-0014', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'CLOSURE', name: 'Kiểu đóng', description: 'Cách đóng/mở', values: ['Khóa kéo', 'Cúc', 'Dán', 'Không có'], status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: 'PROP-0015', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, code: 'HEEL', name: 'Kiểu gót', description: 'Loại gót giày', values: ['Bằng', 'Gót nhọn', 'Gót vuông', 'Gót xuồng', 'Gót thấp'], status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

// Product Units
let mockProductUnits: ProductUnit[] = [
  { _id: 'UNIT-0001', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, name: 'Cái', description: 'Đơn vị tính cho sản phẩm thời trang', status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: 'UNIT-0002', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, name: 'Bộ', description: 'Bộ quần áo', status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: 'UNIT-0003', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, name: 'Đôi', description: 'Đôi giày, tất', status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: 'UNIT-0004', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, name: 'Chiếc', description: 'Chiếc túi, mũ', status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: 'UNIT-0005', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, name: 'Bộ sưu tập', description: 'Bộ sưu tập thời trang', status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

// Mock Products - 15 fashion products
const fashionImageUrls = [
  'https://images.unsplash.com/photo-1651761179569-4ba2aa054997?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600', // T-shirt
  'https://images.unsplash.com/photo-1650320079970-b4ee8f0dae33?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600', // Sneakers
  'https://images.unsplash.com/photo-1570431118100-c24a54fdeab0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600', // Bag
  'https://images.unsplash.com/photo-1542272454315-7255c15487c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600', // Jeans
  'https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600', // Dress
  'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600', // Shoes
  'https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600', // Watch
];

// Initial products data (will be used as fallback)
const initialProducts: Product[] = [
  {
    _id: 'PRD-0001', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID,
    product_type_id: '01942c1a-0002-0000-0000-000000000001', // CLOTHING
    product_category_id: '01942c1a-0003-0001-0000-000000000001', // Áo nam
    brand_id: 'BRAND-0001', // Nike
    code: 'PRD-0001', // Rule 3: barcode CHỈ nằm ở product_variants
    title: 'Áo thun cotton nam basic Nike',
    brief: 'Áo thun 100% cotton cao cấp, thoáng mát',
    content: '<p>Chất liệu cotton cao cấp, form dáng regular fit phù hợp mọi vóc dáng. Thiết kế tối giản, dễ phối đồ.</p>',
    price: 199000, prices: { vnd: 199000, usd: 7.96 }, cost_price: 120000,
    quantity: 150, waiting_quantity: 10, min_stock: 20,
    is_sold_out: false, status: 1,
    image: fashionImageUrls[0], other_images: [fashionImageUrls[0], fashionImageUrls[1], fashionImageUrls[2], fashionImageUrls[3]],
    brand: 'Nike', categories: 'Thời trang nam > Áo nam',
    weight: 200, location: 'Kệ A1',
    order_product_count: 45, last_sold: '2024-01-15',
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null,
  },
  {
    _id: 'PRD-0002', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID,
    product_type_id: '01942c1a-0002-0000-0000-000000000002', // SHOES
    product_category_id: '01942c1a-0003-0001-0000-000000000007', // Giày thể thao
    brand_id: 'BRAND-0002', // Adidas
    code: 'PRD-0002',
    title: 'Giày sneaker Adidas Ultraboost',
    brief: 'Sneaker công nghệ Boost êm ái',
    content: '<p>Công nghệ đế Boost độc quyền, upper Primeknit co giãn thoải mái. Phù hợp chạy bộ, tập gym.</p>',
    price: 2890000, prices: { vnd: 2890000, usd: 115.6 }, cost_price: 1800000,
    quantity: 45, waiting_quantity: 5, min_stock: 10,
    is_sold_out: false, status: 1,
    image: fashionImageUrls[1], other_images: [fashionImageUrls[1], fashionImageUrls[4], fashionImageUrls[5]],
    brand: 'Adidas', categories: 'Giày dép > Giày thể thao',
    weight: 350, location: 'Kệ B2',
    order_product_count: 28, last_sold: '2024-01-18',
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null,
  },
  {
    _id: 'PRD-0003', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID,
    product_type_id: '01942c1a-0002-0000-0000-000000000004', // BAG
    product_category_id: '01942c1a-0003-0001-0000-000000000010', // Túi xách tay
    brand_id: 'BRAND-0009', // Gucci
    code: 'PRD-0003',
    title: 'Túi xách nữ da thật Gucci Marmont',
    brief: 'Túi da bò thật 100%, sang trọng',
    content: '<p>Da bò thật Italy, logo GG kim loại vàng, khóa nam châm cao cấp. Limited edition.</p>',
    price: 32500000, prices: { vnd: 32500000, usd: 1300 }, cost_price: 20000000,
    quantity: 8, waiting_quantity: 0, min_stock: 3,
    is_sold_out: false, status: 1,
    image: fashionImageUrls[2], other_images: [fashionImageUrls[2], fashionImageUrls[6], fashionImageUrls[7], fashionImageUrls[8], fashionImageUrls[9]],
    brand: 'Gucci', categories: 'Túi xách & Balo > Túi xách tay',
    weight: 600, location: 'Kệ C1',
    order_product_count: 12, last_sold: '2024-01-10',
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null,
  },
  {
    _id: 'PRD-0004', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID,
    product_type_id: '01942c1a-0002-0000-0000-000000000001', // CLOTHING
    product_category_id: '01942c1a-0003-0001-0000-000000000002', // Quần nam
    brand_id: 'BRAND-0003', // Uniqlo
    code: 'PRD-0004',
    title: 'Quần jean nam slim fit Uniqlo',
    brief: 'Jean co giãn, ôm dáng thanh lịch',
    content: '<p>Chất jean cao cấp co giãn 4 chiều, form slim fit hiện đại, bền màu.</p>',
    price: 599000, prices: { vnd: 599000, usd: 23.96 }, cost_price: 350000,
    quantity: 0, waiting_quantity: 20, min_stock: 15,
    is_sold_out: true, status: 1,
    image: fashionImageUrls[3], other_images: [fashionImageUrls[3]],
    brand: 'Uniqlo', categories: 'Thời trang nam > Quần nam',
    weight: 450, location: 'Kệ A3',
    order_product_count: 67, last_sold: '2024-01-20',
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null,
  },
  {
    _id: 'PRD-0005', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID,
    product_type_id: '01942c1a-0002-0000-0000-000000000001', // CLOTHING
    product_category_id: '01942c1a-0003-0001-0000-000000000003', // Đầm nữ
    brand_id: 'BRAND-0004', // Zara
    code: 'PRD-0005',
    title: 'Đầm công sở nữ Zara',
    brief: 'Đầm công sở thanh lịch, sang trọng',
    content: '<p>Thiết kế đơn giản, thanh lịch. Phù hợp môi trường công sở và dự tiệc.</p>',
    price: 890000, prices: { vnd: 890000, usd: 35.6 }, cost_price: 500000,
    quantity: 62, waiting_quantity: 0, min_stock: 20,
    is_sold_out: false, status: 1,
    image: fashionImageUrls[4], other_images: [fashionImageUrls[4]],
    brand: 'Zara', categories: 'Thời trang nữ > Đầm nữ',
    weight: 300, location: 'Kệ D1',
    order_product_count: 34, last_sold: '2024-01-19',
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null,
  },
  {
    _id: 'PRD-0006', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID,
    product_type_id: '01942c1a-0002-0000-0000-000000000002', // SHOES
    product_category_id: '01942c1a-0003-0001-0000-000000000008', // Dép & Sandal
    brand_id: null, // No brand
    code: 'PRD-0006',
    title: 'Dép quai ngang unisex',
    brief: 'Dép đi trong nhà tiện lợi',
    content: '<p>Chất liệu EVA siêu nhẹ, chống nước, đế chống trượt an toàn.</p>',
    price: 89000, prices: { vnd: 89000, usd: 3.56 }, cost_price: 45000,
    quantity: 200, waiting_quantity: 0, min_stock: 50,
    is_sold_out: false, status: 1,
    image: fashionImageUrls[5], other_images: [fashionImageUrls[5]],
    brand: undefined, categories: 'Giày dép > Dép & Sandal',
    weight: 150, location: 'Kệ B4',
    order_product_count: 89, last_sold: '2024-01-21',
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null,
  },
  {
    _id: 'PRD-0007', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID,
    product_type_id: '01942c1a-0002-0000-0000-000000000005', // WATCH
    product_category_id: null,
    brand_id: 'BRAND-0011', // Chanel
    code: 'PRD-0007',
    title: 'Đồng hồ nữ Chanel J12',
    brief: 'Đồng hồ ceramic cao cấp',
    content: '<p>Vỏ ceramic trắng, máy Thụy Sĩ, kính sapphire chống trầy. Chống nước 200m.</p>',
    price: 125000000, prices: { vnd: 125000000, usd: 5000 }, cost_price: 80000000,
    quantity: 3, waiting_quantity: 0, min_stock: 1,
    is_sold_out: false, status: 1,
    image: fashionImageUrls[6], other_images: [fashionImageUrls[6]],
    brand: 'Chanel', categories: undefined,
    weight: 100, location: 'Tủ kính VIP',
    order_product_count: 2, last_sold: '2023-12-20',
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null,
  },
  {
    _id: 'PRD-0008', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID,
    product_type_id: '01942c1a-0002-0000-0000-00000000000e', // JACKET
    product_category_id: '01942c1a-0003-0001-0000-000000000001', // Áo nam
    brand_id: 'BRAND-0006', // Puma
    code: 'PRD-0008',
    title: 'Áo khoác gió nam Puma',
    brief: 'Áo khoác thể thao chống nước',
    content: '<p>Vải polyester chống nước, chống gió. Có mũ trùm, túi khóa kéo tiện lợi.</p>',
    price: 1290000, prices: { vnd: 1290000, usd: 51.6 }, cost_price: 750000,
    quantity: 38, waiting_quantity: 10, min_stock: 15,
    is_sold_out: false, status: 1,
    image: fashionImageUrls[0], other_images: [fashionImageUrls[0]],
    brand: 'Puma', categories: 'Thời trang nam > Áo nam',
    weight: 380, location: 'Kệ A5',
    order_product_count: 21, last_sold: '2024-01-17',
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null,
  },
  {
    _id: 'PRD-0009', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID,
    product_type_id: '01942c1a-0002-0000-0000-000000000004', // BAG
    product_category_id: '01942c1a-0003-0001-0000-000000000009', // Balo
    brand_id: 'BRAND-0001', // Nike
    code: 'PRD-0009',
    title: 'Balo thể thao Nike Brasilia',
    brief: 'Balo đa năng chống nước',
    content: '<p>Dung tích 24L, ngăn laptop 15 inch, vải polyester chống nước, quai đeo êm ái.</p>',
    price: 690000, prices: { vnd: 690000, usd: 27.6 }, cost_price: 400000,
    quantity: 85, waiting_quantity: 0, min_stock: 20,
    is_sold_out: false, status: 1,
    image: fashionImageUrls[2], other_images: [fashionImageUrls[2]],
    brand: 'Nike', categories: 'Túi xách & Balo > Balo',
    weight: 450, location: 'Kệ C3',
    order_product_count: 56, last_sold: '2024-01-20',
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null,
  },
  {
    _id: 'PRD-0010', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID,
    product_type_id: '01942c1a-0002-0000-0000-000000000001', // CLOTHING
    product_category_id: '01942c1a-0003-0001-0000-000000000004', // Váy nữ
    brand_id: 'BRAND-0005', // H&M
    code: 'PRD-0010',
    title: 'Váy midi nữ H&M',
    brief: 'Váy dáng xòe nữ tính',
    content: '<p>Chất liệu viscose mềm mại, dáng xòe nhẹ nhàng, có lót trong.</p>',
    price: 459000, prices: { vnd: 459000, usd: 18.36 }, cost_price: 250000,
    quantity: 42, waiting_quantity: 5, min_stock: 15,
    is_sold_out: false, status: 1,
    image: fashionImageUrls[4], other_images: [fashionImageUrls[4]],
    brand: 'H&M', categories: 'Thời trang nữ > Váy nữ',
    weight: 250, location: 'Kệ D3',
    order_product_count: 31, last_sold: '2024-01-18',
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null,
  },
  {
    _id: 'PRD-0011', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID,
    product_type_id: '01942c1a-0002-0000-0000-000000000002', // SHOES
    product_category_id: '01942c1a-0003-0001-0000-000000000007', // Giày thể thao
    brand_id: 'BRAND-0007', // Converse
    code: 'PRD-0011',
    title: 'Giày Converse Chuck Taylor All Star',
    brief: 'Giày classic kinh điển',
    content: '<p>Thiết kế cổ điển bất hủ, vải canvas bền chắc, đế cao su tự nhiên.</p>',
    price: 1290000, prices: { vnd: 1290000, usd: 51.6 }, cost_price: 750000,
    quantity: 95, waiting_quantity: 0, min_stock: 25,
    is_sold_out: false, status: 1,
    image: fashionImageUrls[1], other_images: [fashionImageUrls[1]],
    brand: 'Converse', categories: 'Giày dép > Giày thể thao',
    weight: 400, location: 'Kệ B1',
    order_product_count: 78, last_sold: '2024-01-21',
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null,
  },
  {
    _id: 'PRD-0012', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID,
    product_type_id: '01942c1a-0002-0000-0000-000000000003', // ACCESSORY
    product_category_id: null,
    brand_id: null, // No brand
    code: 'PRD-0012',
    title: 'Mũ lưỡi trai unisex',
    brief: 'Mũ snapback thời trang',
    content: '<p>Chất liệu cotton thoáng mát, có lỗ thoát khí, size free size điều chỉnh được.</p>',
    price: 129000, prices: { vnd: 129000, usd: 5.16 }, cost_price: 65000,
    quantity: 180, waiting_quantity: 0, min_stock: 40,
    is_sold_out: false, status: 1,
    image: fashionImageUrls[0], other_images: [fashionImageUrls[0]],
    brand: undefined, categories: undefined,
    weight: 80, location: 'Kệ E1',
    order_product_count: 102, last_sold: '2024-01-21',
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null,
  },
  {
    _id: 'PRD-0013', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID,
    product_type_id: '01942c1a-0002-0000-0000-00000000000d', // SPORTSWEAR
    product_category_id: null,
    brand_id: 'BRAND-0002', // Adidas
    code: 'PRD-0013',
    title: 'Bộ đồ tập gym nữ Adidas',
    brief: 'Set đồ tập yoga & gym',
    content: '<p>Bao gồm áo croptop và quần legging. Vải thun co giãn 4 chiều, thấm hút mồ hôi.</p>',
    price: 1590000, prices: { vnd: 1590000, usd: 63.6 }, cost_price: 900000,
    quantity: 55, waiting_quantity: 10, min_stock: 20,
    is_sold_out: false, status: 1,
    image: fashionImageUrls[4], other_images: [fashionImageUrls[4]],
    brand: 'Adidas', categories: undefined,
    weight: 200, location: 'Kệ F1',
    order_product_count: 39, last_sold: '2024-01-19',
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null,
  },
  {
    _id: 'PRD-0014', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID,
    product_type_id: '01942c1a-0002-0000-0000-000000000001', // CLOTHING
    product_category_id: '01942c1a-0003-0001-0000-000000000005', // Bé trai
    brand_id: 'BRAND-0015', // Local Brand
    code: 'PRD-0014',
    title: 'Bộ quần áo trẻ em bé trai',
    brief: 'Set áo + quần cho bé',
    content: '<p>100% cotton mềm mại, an toàn cho làn da nhạy cảm của bé. Họa tiết hoạt hình đáng yêu.</p>',
    price: 259000, prices: { vnd: 259000, usd: 10.36 }, cost_price: 150000,
    quantity: 75, waiting_quantity: 0, min_stock: 25,
    is_sold_out: false, status: 1,
    image: fashionImageUrls[0], other_images: [fashionImageUrls[0]],
    brand: 'Local Brand', categories: 'Thời trang trẻ em > Bé trai',
    weight: 150, location: 'Kệ G1',
    order_product_count: 48, last_sold: '2024-01-20',
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null,
  },
  {
    _id: 'PRD-0015', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID,
    product_type_id: '01942c1a-0002-0000-0000-000000000002', // SHOES
    product_category_id: '01942c1a-0003-0001-0000-000000000007', // Giày thể thao
    brand_id: 'BRAND-0008', // Vans
    code: 'PRD-0015',
    title: 'Giày Vans Old Skool',
    brief: 'Giày skate iconic',
    content: '<p>Thiết kế stripe độc đáo, đế waffle chống trượt tốt, phù hợp skate và streetwear.</p>',
    price: 1790000, prices: { vnd: 1790000, usd: 71.6 }, cost_price: 1050000,
    quantity: 8, waiting_quantity: 15, min_stock: 10,
    is_sold_out: false, status: 1,
    image: fashionImageUrls[5], other_images: [fashionImageUrls[5]],
    brand: 'Vans', categories: 'Giày dép > Giày thể thao',
    weight: 420, location: 'Kệ B3',
    order_product_count: 64, last_sold: '2024-01-21',
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null,
  },
];

// 🔥 Load mockProducts from localStorage or use initial data
let mockProducts: Product[] = loadFromStorage(STORAGE_KEY_PRODUCTS, initialProducts);

// Mock Variants - Fashion variants with different colors/sizes
const initialVariants: ProductVariant[] = [
  // Variants for PRD-0001 (Áo thun Nike) - Different colors (có phân loại → nhiều variants)
  { _id: 'VAR-0001', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, product_id: 'PRD-0001', sku: 'PRD-0001-RED-M', barcode: '8934567890123-1', cost_price: 120000, title: 'Đỏ - M', price: 199000, prices: { vnd: 199000, usd: 7.96 }, status: 1, is_sold_out: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  { _id: 'VAR-0002', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, product_id: 'PRD-0001', sku: 'PRD-0001-BLK-L', barcode: '8934567890123-2', cost_price: 120000, title: 'Đen - L', price: 199000, prices: { vnd: 199000, usd: 7.96 }, status: 1, is_sold_out: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  { _id: 'VAR-0003', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, product_id: 'PRD-0001', sku: 'PRD-0001-WHT-S', barcode: '8934567890123-3', cost_price: 120000, title: 'Trắng - S', price: 199000, prices: { vnd: 199000, usd: 7.96 }, status: 1, is_sold_out: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  
  // Variants for PRD-0002 (Giày Adidas) - Different sizes (có phân loại → nhiều variants)
  { _id: 'VAR-0004', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, product_id: 'PRD-0002', sku: 'PRD-0002-39', barcode: '8934567890124-39', cost_price: 1800000, title: 'Size 39', price: 2890000, prices: { vnd: 2890000, usd: 115.6 }, quantity: 10, waiting_quantity: 2, status: 1, is_sold_out: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  { _id: 'VAR-0005', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, product_id: 'PRD-0002', sku: 'PRD-0002-40', barcode: '8934567890124-40', cost_price: 1800000, title: 'Size 40', price: 2890000, prices: { vnd: 2890000, usd: 115.6 }, quantity: 15, waiting_quantity: 0, status: 1, is_sold_out: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  { _id: 'VAR-0006', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, product_id: 'PRD-0002', sku: 'PRD-0002-42', barcode: '8934567890124-42', cost_price: 1800000, title: 'Size 42', price: 2890000, prices: { vnd: 2890000, usd: 115.6 }, quantity: 8, waiting_quantity: 0, status: 1, is_sold_out: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  
  // Variant mặc định for PRD-0003 (Túi Gucci) - không phân loại → 1 variant mặc định (Rule 2)
  { _id: 'VAR-0016', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, product_id: 'PRD-0003', sku: 'PRD-0003-DEFAULT', barcode: '8934567890125', cost_price: 20000000, title: 'Mặc định', price: 32500000, prices: { vnd: 32500000, usd: 1300 }, quantity: 8, waiting_quantity: 0, status: 1, is_sold_out: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  
  // Variant mặc định for PRD-0004 (Quần jean) - không phân loại → 1 variant mặc định (Rule 2)
  { _id: 'VAR-0017', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, product_id: 'PRD-0004', sku: 'PRD-0004-DEFAULT', barcode: '8934567890126', cost_price: 350000, title: 'Mặc định', price: 599000, prices: { vnd: 599000, usd: 23.96 }, quantity: 0, waiting_quantity: 20, status: 1, is_sold_out: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  
  // Variants for PRD-0005 (Đầm Zara) - Different colors (có phân loại → nhiều variants)
  { _id: 'VAR-0007', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, product_id: 'PRD-0005', sku: 'PRD-0005-BLK-M', barcode: '8934567890127-1', cost_price: 500000, title: 'Đen - M', price: 890000, prices: { vnd: 890000, usd: 35.6 }, quantity: 20, waiting_quantity: 0, status: 1, is_sold_out: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  { _id: 'VAR-0008', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, product_id: 'PRD-0005', sku: 'PRD-0005-NAVY-L', barcode: '8934567890127-2', cost_price: 500000, title: 'Xanh navy - L', price: 890000, prices: { vnd: 890000, usd: 35.6 }, quantity: 18, waiting_quantity: 0, status: 1, is_sold_out: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  
  // Variant mặc định for PRD-0006 (Dép) - không phân loại → 1 variant mặc định (Rule 2)
  { _id: 'VAR-0018', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, product_id: 'PRD-0006', sku: 'PRD-0006-DEFAULT', barcode: '8934567890128', cost_price: 45000, title: 'Mặc định', price: 89000, prices: { vnd: 89000, usd: 3.56 }, quantity: 200, waiting_quantity: 0, status: 1, is_sold_out: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  
  // Variant mặc định for PRD-0007 (Đồng hồ Chanel) - không phân loại → 1 variant mặc định (Rule 2)
  { _id: 'VAR-0019', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, product_id: 'PRD-0007', sku: 'PRD-0007-DEFAULT', barcode: '8934567890129', cost_price: 80000000, title: 'Mặc định', price: 125000000, prices: { vnd: 125000000, usd: 5000 }, quantity: 3, waiting_quantity: 0, status: 1, is_sold_out: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  
  // Variant mặc định for PRD-0008 (Áo khoác Puma) - không phân loại → 1 variant mặc định (Rule 2)
  { _id: 'VAR-0020', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, product_id: 'PRD-0008', sku: 'PRD-0008-DEFAULT', barcode: '8934567890130', cost_price: 750000, title: 'Mặc định', price: 1290000, prices: { vnd: 1290000, usd: 51.6 }, quantity: 38, waiting_quantity: 10, status: 1, is_sold_out: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  
  // Variant mặc định for PRD-0009 (Balo Nike) - không phân loại → 1 variant mặc định (Rule 2)
  { _id: 'VAR-0021', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, product_id: 'PRD-0009', sku: 'PRD-0009-DEFAULT', barcode: '8934567890131', cost_price: 400000, title: 'Mặc định', price: 690000, prices: { vnd: 690000, usd: 27.6 }, quantity: 85, waiting_quantity: 0, status: 1, is_sold_out: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  
  // Variant mặc định for PRD-0010 (Váy H&M) - không phân loại → 1 variant mặc định (Rule 2)
  { _id: 'VAR-0022', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, product_id: 'PRD-0010', sku: 'PRD-0010-DEFAULT', barcode: '8934567890132', cost_price: 250000, title: 'Mặc định', price: 459000, prices: { vnd: 459000, usd: 18.36 }, quantity: 42, waiting_quantity: 5, status: 1, is_sold_out: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  
  // Variants for PRD-0011 (Giày Converse) - Different colors & sizes (có phân loại → nhiều variants)
  { _id: 'VAR-0009', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, product_id: 'PRD-0011', sku: 'PRD-0011-WHT-38', barcode: '8934567890135-1', cost_price: 800000, title: 'Trắng - 38', price: 1290000, prices: { vnd: 1290000, usd: 51.6 }, quantity: 22, waiting_quantity: 0, status: 1, is_sold_out: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  { _id: 'VAR-0010', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, product_id: 'PRD-0011', sku: 'PRD-0011-BLK-40', barcode: '8934567890135-2', cost_price: 800000, title: 'Đen - 40', price: 1290000, prices: { vnd: 1290000, usd: 51.6 }, quantity: 28, waiting_quantity: 0, status: 1, is_sold_out: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  { _id: 'VAR-0011', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, product_id: 'PRD-0011', sku: 'PRD-0011-RED-39', barcode: '8934567890135-3', cost_price: 800000, title: 'Đỏ - 39', price: 1290000, prices: { vnd: 1290000, usd: 51.6 }, quantity: 15, waiting_quantity: 0, status: 1, is_sold_out: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  
  // Variants for PRD-0012 (Mũ) - Different colors (có phân loại → nhiều variants)
  { _id: 'VAR-0012', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, product_id: 'PRD-0012', sku: 'PRD-0012-BLK', barcode: '8934567890136-1', cost_price: 70000, title: 'Đen', price: 129000, prices: { vnd: 129000, usd: 5.16 }, quantity: 60, waiting_quantity: 0, status: 1, is_sold_out: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  { _id: 'VAR-0013', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, product_id: 'PRD-0012', sku: 'PRD-0012-WHT', barcode: '8934567890136-2', cost_price: 70000, title: 'Trắng', price: 129000, prices: { vnd: 129000, usd: 5.16 }, quantity: 45, waiting_quantity: 0, status: 1, is_sold_out: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  { _id: 'VAR-0014', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, product_id: 'PRD-0012', sku: 'PRD-0012-NAVY', barcode: '8934567890136-3', cost_price: 70000, title: 'Xanh navy', price: 129000, prices: { vnd: 129000, usd: 5.16 }, quantity: 35, waiting_quantity: 0, status: 1, is_sold_out: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  
  // Variant mặc định for PRD-0013 (Bộ đồ gym Adidas) - không phân loại → 1 variant mặc định (Rule 2)
  { _id: 'VAR-0023', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, product_id: 'PRD-0013', sku: 'PRD-0013-DEFAULT', barcode: '8934567890138', cost_price: 900000, title: 'Mặc định', price: 1590000, prices: { vnd: 1590000, usd: 63.6 }, quantity: 55, waiting_quantity: 10, status: 1, is_sold_out: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  
  // Variant mặc định for PRD-0014 (Bộ quần áo trẻ em) - không phân loại → 1 variant mặc định (Rule 2)
  { _id: 'VAR-0024', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, product_id: 'PRD-0014', sku: 'PRD-0014-DEFAULT', barcode: '8934567890140', cost_price: 150000, title: 'Mặc định', price: 259000, prices: { vnd: 259000, usd: 10.36 }, quantity: 75, waiting_quantity: 0, status: 1, is_sold_out: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  
  // Variant for PRD-0015 (Giày Vans) - Low stock variant (có phân loại → nhiều variants)
  { _id: 'VAR-0015', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, product_id: 'PRD-0015', sku: 'PRD-0015-BLK-41', barcode: '8934567890139-1', cost_price: 1050000, title: 'Đen - 41', price: 1790000, prices: { vnd: 1790000, usd: 71.6 }, quantity: 3, waiting_quantity: 8, status: 1, is_sold_out: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
];

// 🔥 Load mockProductVariants from localStorage or use initial data
let mockProductVariants: ProductVariant[] = loadFromStorage(STORAGE_KEY_VARIANTS, initialVariants);

// =====================================================
// MOCK DATA: PRODUCT PROPERTY VALUES (Liên kết)
// =====================================================
let mockProductPropertyValues: ProductPropertyValue[] = [
  // PRD-0001 (Áo thun Nike) có Màu sắc: Đỏ, Đen, Trắng
  { _id: 'PPV-0001', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, product_id: 'PRD-0001', property_id: 'PROP-0001', property_name: 'Màu sắc', property_value: 'Đỏ', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: 'PPV-0002', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, product_id: 'PRD-0001', property_id: 'PROP-0001', property_name: 'Màu sắc', property_value: 'Đen', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: 'PPV-0003', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, product_id: 'PRD-0001', property_id: 'PROP-0001', property_name: 'Màu sắc', property_value: 'Trắng', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: 'PPV-0004', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, product_id: 'PRD-0001', property_id: 'PROP-0002', property_name: 'Kích thước', property_value: 'M', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: 'PPV-0005', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, product_id: 'PRD-0001', property_id: 'PROP-0002', property_name: 'Kích thước', property_value: 'L', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { _id: 'PPV-0006', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, product_id: 'PRD-0001', property_id: 'PROP-0002', property_name: 'Kích thước', property_value: 'S', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

// =====================================================
// MOCK DATA: PRODUCT UNIT CONFIGS (Liên kết)
// =====================================================
let mockProductUnitConfigs: ProductUnitConfig[] = [
  // PRD-0001 (Áo thun Nike) có đơn vị: Cái (base)
  { _id: 'PUC-0001', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, product_id: 'PRD-0001', unit_id: 'UNIT-0001', unit_name: 'Cái', conversion: 1, is_base: true, is_direct_sale: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

// =====================================================
// MOCK DATA: VARIANT PROPERTY VALUES (Thuộc tính cấp SKU)
// =====================================================
let mockProductVariantPropertyValues: ProductVariantPropertyValue[] = [
  // VAR-PRD-0001-RED: Áo thun Nike - Đỏ
  { _id: 'VPV-0001-01', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, product_id: 'PRD-0001', variant_id: 'VAR-PRD-0001-RED', property_id: 'PROP-0001', property_name: 'Màu sắc', property_value: 'Đỏ', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  
  // VAR-PRD-0001-BLACK: Áo thun Nike - Đen
  { _id: 'VPV-0001-02', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, product_id: 'PRD-0001', variant_id: 'VAR-PRD-0001-BLACK', property_id: 'PROP-0001', property_name: 'Màu sắc', property_value: 'Đen', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  
  // VAR-PRD-0001-WHITE: Áo thun Nike - Trắng
  { _id: 'VPV-0001-03', tenant_id: TENANT_ID, industry_id: INDUSTRY_FASHION_ID, product_id: 'PRD-0001', variant_id: 'VAR-PRD-0001-WHITE', property_id: 'PROP-0001', property_name: 'Màu sắc', property_value: 'Trắng', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

// =====================================================
// EXPORTS - Arrays for mockProductService
// =====================================================
export {
  mockProducts,
  mockProductVariants,
  mockProductProperties,
  mockProductPropertyValues,
  mockProductVariantPropertyValues,
  mockProductUnits,
  mockProductUnitConfigs,
  mockProductBrands,
  mockProductCategories,
  mockProductTypes,
  mockIndustries,
};

// =====================================================
// MOCK DATA SERVICE
// =====================================================
export const mockDataService = {
  // Industries
  getIndustries: async () => mockIndustries,
  getIndustryById: async (id: string) => mockIndustries.find(i => i._id === id),
  createIndustry: async (data: Omit<Industry, '_id' | 'created_at' | 'updated_at'>) => {
    const newIndustry: Industry = { ...data, _id: `IND-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    mockIndustries.push(newIndustry);
    return newIndustry;
  },
  updateIndustry: async (id: string, data: Partial<Industry>) => {
    const index = mockIndustries.findIndex(i => i._id === id);
    if (index !== -1) {
      mockIndustries[index] = { ...mockIndustries[index], ...data, updated_at: new Date().toISOString() };
      return mockIndustries[index];
    }
    return null;
  },

  // Product Types
  getProductTypes: async () => mockProductTypes,
  getProductTypeById: async (id: string) => mockProductTypes.find(pt => pt._id === id),
  createProductType: async (data: Omit<ProductType, '_id' | 'created_at' | 'updated_at'>) => {
    const newType: ProductType = { ...data, _id: `TYPE-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    mockProductTypes.push(newType);
    return newType;
  },
  updateProductType: async (id: string, data: Partial<ProductType>) => {
    const index = mockProductTypes.findIndex(pt => pt._id === id);
    if (index !== -1) {
      mockProductTypes[index] = { ...mockProductTypes[index], ...data, updated_at: new Date().toISOString() };
      return mockProductTypes[index];
    }
    return null;
  },
  deleteProductType: async (id: string) => {
    const index = mockProductTypes.findIndex(pt => pt._id === id);
    if (index !== -1) {
      mockProductTypes.splice(index, 1);
      return true;
    }
    return false;
  },

  // Product Categories
  getProductCategories: async () => mockProductCategories,
  getProductCategoryById: async (id: string) => mockProductCategories.find(pc => pc._id === id),
  createProductCategory: async (data: Omit<ProductCategory, '_id' | 'created_at' | 'updated_at'>) => {
    const newCategory: ProductCategory = { ...data, _id: `CAT-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    mockProductCategories.push(newCategory);
    return newCategory;
  },
  updateProductCategory: async (id: string, data: Partial<ProductCategory>) => {
    const index = mockProductCategories.findIndex(pc => pc._id === id);
    if (index !== -1) {
      mockProductCategories[index] = { ...mockProductCategories[index], ...data, updated_at: new Date().toISOString() };
      return mockProductCategories[index];
    }
    return null;
  },
  deleteProductCategory: async (id: string) => {
    const index = mockProductCategories.findIndex(pc => pc._id === id);
    if (index !== -1) {
      mockProductCategories.splice(index, 1);
      return true;
    }
    return false;
  },

  // Products
  getProducts: async () => mockProducts.filter(p => !p.deleted_at),
  getProductById: async (id: string) => mockProducts.find(p => p._id === id && !p.deleted_at),
  getProductByCode: async (code: string) => mockProducts.find(p => p.code === code && !p.deleted_at),
  createProduct: async (data: Omit<Product, '_id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
    const newProduct: Product = { 
      ...data, 
      _id: `PRD-${Date.now()}`, 
      created_at: new Date().toISOString(), 
      updated_at: new Date().toISOString(),
      deleted_at: null
    };
    mockProducts.push(newProduct);

    // 🔥 IMPORTANT: Extract openingStock BEFORE creating variants
    const openingStock = (data as any).openingStock || 0;
    console.log('🔥 [createProduct] openingStock from form:', openingStock);

    // AUTO-CREATE PRODUCT VARIANTS (Rule 1, 2, 3)
    // Rule 2: Product có phân loại → nhiều variants / Product không phân loại → 1 variant mặc định
    const variantProps = (data as any).variant_properties;
    
    // DEBUG: Log variant_properties structure
    console.log('🔍 [createProduct] variant_properties:', JSON.stringify(variantProps, null, 2));
    
    if (variantProps && variantProps.variants && variantProps.variants.length > 0) {
      // Có thiết lập variants → Tạo nhiều ProductVariant records
      console.log('✅ [createProduct] Creating', variantProps.variants.length, 'variants');
      
      const hasMultipleUnits = variantProps.units && variantProps.units.length > 1;
      
      variantProps.variants.forEach((variant: any) => {
        const variantPrice = variant.price || data.price || 0;
        
        // ✅ AUTO-GENERATE SKU và Title
        const sku = generateSKU(
          newProduct.code,
          variant.attributes || {},
          variant.unit,
          hasMultipleUnits
        );
        
        const title = generateVariantTitle(
          variant.attributes || {},
          variant.unit,
          hasMultipleUnits
        );
        
        const newVariant: ProductVariant = {
          _id: `VAR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          tenant_id: newProduct.tenant_id,
          industry_id: newProduct.industry_id,
          product_id: newProduct._id,
          sku, // ← Sử dụng SKU tự động
          title, // ← Sử dụng title tự động
          barcode: variant.barcode || null,
          cost_price: variant.costPrice || data.cost_price || 0,
          price: variantPrice,
          prices: { vnd: variantPrice, usd: variantPrice / 25000 },
          // ❌ REMOVED: quantity - Inventory là nguồn tồn kho duy nhất
          // ❌ REMOVED: waiting_quantity
          status: newProduct.status,
          is_sold_out: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
          
          // ✅ NEW: Extended fields
          unit: variant.unit || 'Cái',
          conversion: variant.conversion || 1,
          is_default: false,
          attributes: variant.attributes || {},
        };
        mockProductVariants.push(newVariant);
        console.log('✅ [createProduct] Pushed variant:', newVariant._id, 'SKU:', sku, 'Title:', title);
      });
    } else {
      // Không có variants → Tạo 1 variant mặc định (Rule 2)
      const defaultPrice = data.price || 0;
      const defaultUnit = (data as any).unit || 'Cái';
      const defaultVariant: ProductVariant = {
        _id: `VAR-${Date.now()}-default`,
        tenant_id: newProduct.tenant_id,
        industry_id: newProduct.industry_id,
        product_id: newProduct._id,
        sku: data.code || newProduct.code,
        title: `${newProduct.title} (${defaultUnit.toLowerCase()})`,  // ✅ Format: "Tên sản phẩm (đơn vị)"
        barcode: null, // Rule 3: barcode ở variant, không ở product
        cost_price: (data as any).cost_price || 0,
        price: defaultPrice,
        prices: { vnd: defaultPrice, usd: defaultPrice / 25000 },
        // ❌ REMOVED: quantity - Inventory là nguồn tồn kho duy nhất
        // ❌ REMOVED: waiting_quantity
        status: newProduct.status,
        is_sold_out: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        
        // ✅ NEW: Extended fields
        unit: defaultUnit,
        conversion: 1,
        is_default: true,
        attributes: {},
      };
      mockProductVariants.push(defaultVariant);
    }

    // AUTO-CREATE PRODUCT PROPERTY VALUES (Thuộc tính)
    if (variantProps && variantProps.attributes && variantProps.attributes.length > 0) {
      variantProps.attributes.forEach((attr: any) => {
        // Tìm property_id từ tên thuộc tính (e.g., "Màu sắc" → PROP-0001)
        const property = mockProductProperties.find(p => p.name === attr.name);
        
        if (attr.values && attr.values.length > 0) {
          attr.values.forEach((value: string) => {
            const newPPV: ProductPropertyValue = {
              _id: `PPV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              tenant_id: newProduct.tenant_id,
              industry_id: newProduct.industry_id,
              product_id: newProduct._id,
              property_id: property?._id || `PROP-CUSTOM-${Date.now()}`,
              property_name: attr.name,
              property_value: value,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            mockProductPropertyValues.push(newPPV);
          });
        }
      });
    }

    // AUTO-CREATE PRODUCT UNIT CONFIGS (Đơn vị tính)
    if (variantProps && variantProps.units && variantProps.units.length > 0) {
      variantProps.units.forEach((unit: any) => {
        // Tìm unit_id từ tên đơn vị (e.g., "Cái" → UNIT-0001)
        const unitRecord = mockProductUnits.find(u => u.name === unit.name);
        
        const newPUC: ProductUnitConfig = {
          _id: `PUC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          tenant_id: newProduct.tenant_id,
          industry_id: newProduct.industry_id,
          product_id: newProduct._id,
          unit_id: unitRecord?._id || `UNIT-CUSTOM-${Date.now()}`,
          unit_name: unit.name,
          conversion: unit.conversion || 1,
          is_base: unit.isBase || false,
          is_direct_sale: unit.isDirectSale !== false, // Default true
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        mockProductUnitConfigs.push(newPUC);
      });
    } else {
      // Không có units → Tạo unit mặc định "Cái"
      const defaultUnit = mockProductUnits.find(u => u.name === 'Cái');
      const newPUC: ProductUnitConfig = {
        _id: `PUC-${Date.now()}-default`,
        tenant_id: newProduct.tenant_id,
        industry_id: newProduct.industry_id,
        product_id: newProduct._id,
        unit_id: defaultUnit?._id || 'UNIT-0001',
        unit_name: 'Cái',
        conversion: 1,
        is_base: true,
        is_direct_sale: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockProductUnitConfigs.push(newPUC);
    }

    // 🔥 AUTO-CREATE INVENTORY + OPENING TRANSACTION (mô hình POS chuẩn)
    // Lấy danh sách variants vừa tạo
    const createdVariants = mockProductVariants.filter(v => v.product_id === newProduct._id);
    console.log(`🔥 [createProduct] Creating inventory for ${createdVariants.length} variants`);
    
    // 🔥 Build variant stock map: variant_id -> stock quantity
    const variantStockMap = new Map<string, number>();
    if (variantProps && variantProps.variants && variantProps.variants.length > 0) {
      // Sử dụng stock riêng của từng variant từ modal
      variantProps.variants.forEach((variantData: any, index: number) => {
        const createdVariant = createdVariants[index];
        if (createdVariant) {
          const stockQty = variantData.stock || 0;
          variantStockMap.set(createdVariant._id, stockQty);
          console.log(`📦 [createProduct] Variant ${index}: ${createdVariant._id} → stock=${stockQty}`);
        }
      });
    } else {
      // Không có variants từ modal → Sử dụng openingStock cho variant mặc định
      if (createdVariants.length > 0) {
        variantStockMap.set(createdVariants[0]._id, openingStock);
        console.log(`📦 [createProduct] Default variant: ${createdVariants[0]._id} → stock=${openingStock}`);
      }
    }
    
    for (const variant of createdVariants) {
      // 1. Get or Create Inventory record (on_hand = 0)
      const { mockInventoryService } = await import('./mockInventoryService');
      const inventory = await mockInventoryService.getOrCreateInventory(
        variant._id,
        newProduct._id
      );
      console.log(`✅ [createProduct] Inventory ready ${inventory._id} for variant ${variant._id}`);
      
      // 2. Nếu có tồn đầu kỳ → Tạo Transaction (type='opening')
      const variantStock = variantStockMap.get(variant._id) || 0;
      if (variantStock > 0) {
        const transaction = await mockInventoryService.opening(
          variant._id,
          newProduct._id,
          variantStock,
          `Tồn đầu kỳ khi tạo sản phẩm "${newProduct.title}"`
        );
        console.log(`✅ [createProduct] Created Opening Transaction ${transaction._id} qty=${variantStock}`);
      } else {
        console.log(`⏭️  [createProduct] Skipping opening transaction for variant ${variant._id} (stock=0)`);
      }
    }

    // 🔥 Save to localStorage
    saveToStorage(STORAGE_KEY_PRODUCTS, mockProducts);
    saveToStorage(STORAGE_KEY_VARIANTS, mockProductVariants);
    
    return newProduct;
  },
  updateProduct: async (id: string, data: Partial<Product>) => {
    const index = mockProducts.findIndex(p => p._id === id);
    if (index !== -1) {
      mockProducts[index] = { ...mockProducts[index], ...data, updated_at: new Date().toISOString() };
      const updatedProduct = mockProducts[index];

      // AUTO-UPDATE PRODUCT VARIANTS
      const variantProps = (data as any).variant_properties;
      
      // Xóa các variants cũ của product này
      const oldVariantIndices: number[] = [];
      mockProductVariants.forEach((v, idx) => {
        if (v.product_id === id) oldVariantIndices.push(idx);
      });
      oldVariantIndices.reverse().forEach(idx => mockProductVariants.splice(idx, 1));

      // Tạo lại variants mới
      if (variantProps && variantProps.variants && variantProps.variants.length > 0) {
        // Có thiết lập variants → Tạo nhiều ProductVariant records
        variantProps.variants.forEach((variant: any) => {
          const variantPrice = variant.price || data.price || updatedProduct.price || 0;
          const newVariant: ProductVariant = {
            _id: `VAR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            tenant_id: updatedProduct.tenant_id,
            industry_id: updatedProduct.industry_id,
            product_id: updatedProduct._id,
            sku: variant.code || `${updatedProduct.code}-${Object.values(variant.attributes || {}).join('-')}`,
            title: `${updatedProduct.title} - ${Object.entries(variant.attributes || {}).map(([k, v]) => `${k}: ${v}`).join(', ')}`,
            barcode: variant.barcode || null,
            cost_price: variant.costPrice || data.cost_price || updatedProduct.cost_price || 0,
            price: variantPrice,
            prices: { vnd: variantPrice, usd: variantPrice / 25000 },
            quantity: variant.stock || data.quantity || updatedProduct.quantity || 0,
            waiting_quantity: 0,
            status: updatedProduct.status,
            is_sold_out: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null,
          };
          mockProductVariants.push(newVariant);
        });
      } else {
        // Không có variants → Tạo 1 variant mặc định
        const defaultPrice = data.price || updatedProduct.price || 0;
        const defaultVariant: ProductVariant = {
          _id: `VAR-${Date.now()}-default`,
          tenant_id: updatedProduct.tenant_id,
          industry_id: updatedProduct.industry_id,
          product_id: updatedProduct._id,
          sku: data.code || updatedProduct.code,
          title: updatedProduct.title,
          barcode: null,
          cost_price: (data as any).cost_price || updatedProduct.cost_price || 0,
          price: defaultPrice,
          prices: { vnd: defaultPrice, usd: defaultPrice / 25000 },
          quantity: data.quantity || updatedProduct.quantity || 0,
          waiting_quantity: 0,
          status: updatedProduct.status,
          is_sold_out: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
        };
        mockProductVariants.push(defaultVariant);
      }

      // AUTO-UPDATE PRODUCT PROPERTY VALUES & UNIT CONFIGS
      // Xóa old records
      mockProductPropertyValues = mockProductPropertyValues.filter(ppv => ppv.product_id !== id);
      mockProductUnitConfigs = mockProductUnitConfigs.filter(puc => puc.product_id !== id);

      // Tạo lại property values
      if (variantProps && variantProps.attributes && variantProps.attributes.length > 0) {
        variantProps.attributes.forEach((attr: any) => {
          const property = mockProductProperties.find(p => p.name === attr.name);
          
          if (attr.values && attr.values.length > 0) {
            attr.values.forEach((value: string) => {
              const newPPV: ProductPropertyValue = {
                _id: `PPV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                tenant_id: updatedProduct.tenant_id,
                industry_id: updatedProduct.industry_id,
                product_id: updatedProduct._id,
                property_id: property?._id || `PROP-CUSTOM-${Date.now()}`,
                property_name: attr.name,
                property_value: value,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              mockProductPropertyValues.push(newPPV);
            });
          }
        });
      }

      // Tạo lại unit configs
      if (variantProps && variantProps.units && variantProps.units.length > 0) {
        variantProps.units.forEach((unit: any) => {
          const unitRecord = mockProductUnits.find(u => u.name === unit.name);
          
          const newPUC: ProductUnitConfig = {
            _id: `PUC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            tenant_id: updatedProduct.tenant_id,
            industry_id: updatedProduct.industry_id,
            product_id: updatedProduct._id,
            unit_id: unitRecord?._id || `UNIT-CUSTOM-${Date.now()}`,
            unit_name: unit.name,
            conversion: unit.conversion || 1,
            is_base: unit.isBase || false,
            is_direct_sale: unit.isDirectSale !== false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          mockProductUnitConfigs.push(newPUC);
        });
      } else {
        // Không có units → Tạo unit mặc định "Cái"
        const defaultUnit = mockProductUnits.find(u => u.name === 'Cái');
        const newPUC: ProductUnitConfig = {
          _id: `PUC-${Date.now()}-default`,
          tenant_id: updatedProduct.tenant_id,
          industry_id: updatedProduct.industry_id,
          product_id: updatedProduct._id,
          unit_id: defaultUnit?._id || 'UNIT-0001',
          unit_name: 'Cái',
          conversion: 1,
          is_base: true,
          is_direct_sale: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        mockProductUnitConfigs.push(newPUC);
      }

      // 🔥 Save to localStorage
      saveToStorage(STORAGE_KEY_PRODUCTS, mockProducts);
      saveToStorage(STORAGE_KEY_VARIANTS, mockProductVariants);
      
      return mockProducts[index];
    }
    return null;
  },
  deleteProduct: async (id: string) => {
    const index = mockProducts.findIndex(p => p._id === id);
    if (index !== -1) {
      mockProducts[index].deleted_at = new Date().toISOString();
      
      // Xóa các liên kết
      mockProductPropertyValues = mockProductPropertyValues.filter(ppv => ppv.product_id !== id);
      mockProductUnitConfigs = mockProductUnitConfigs.filter(puc => puc.product_id !== id);
      // Variants sẽ tự động bị ẩn vì product đã deleted
      
      // 🔥 Save to localStorage
      saveToStorage(STORAGE_KEY_PRODUCTS, mockProducts);
      saveToStorage(STORAGE_KEY_VARIANTS, mockProductVariants);
      
      return true;
    }
    return false;
  },

  // Product Brands
  getProductBrands: async () => mockProductBrands,
  getProductBrandById: async (id: string) => mockProductBrands.find(pb => pb._id === id),
  createProductBrand: async (data: Omit<ProductBrand, '_id' | 'created_at' | 'updated_at'>) => {
    const newBrand: ProductBrand = { ...data, _id: `BRAND-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    mockProductBrands.push(newBrand);
    return newBrand;
  },
  updateProductBrand: async (id: string, data: Partial<ProductBrand>) => {
    const index = mockProductBrands.findIndex(pb => pb._id === id);
    if (index !== -1) {
      mockProductBrands[index] = { ...mockProductBrands[index], ...data, updated_at: new Date().toISOString() };
      return mockProductBrands[index];
    }
    return null;
  },
  deleteProductBrand: async (id: string) => {
    const index = mockProductBrands.findIndex(pb => pb._id === id);
    if (index !== -1) {
      mockProductBrands.splice(index, 1);
      return true;
    }
    return false;
  },

  // Product Properties
  getProductProperties: async () => mockProductProperties,
  getProductPropertyById: async (id: string) => mockProductProperties.find(pp => pp._id === id),
  createProductProperty: async (data: Omit<ProductProperty, '_id' | 'created_at' | 'updated_at'>) => {
    const newProperty: ProductProperty = { ...data, _id: `PROP-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    mockProductProperties.push(newProperty);
    return newProperty;
  },
  updateProductProperty: async (id: string, data: Partial<ProductProperty>) => {
    const index = mockProductProperties.findIndex(pp => pp._id === id);
    if (index !== -1) {
      mockProductProperties[index] = { ...mockProductProperties[index], ...data, updated_at: new Date().toISOString() };
      return mockProductProperties[index];
    }
    return null;
  },
  deleteProductProperty: async (id: string) => {
    const index = mockProductProperties.findIndex(pp => pp._id === id);
    if (index !== -1) {
      mockProductProperties.splice(index, 1);
      return true;
    }
    return false;
  },

  // Product Variants
  getProductVariants: async (productId?: string) => {
    if (productId) {
      const variants = mockProductVariants.filter(v => v.product_id === productId && !v.deleted_at);
      console.log(`🔍 [getProductVariants] For product ${productId}: Found ${variants.length} variants`);
      return variants;
    }
    return mockProductVariants.filter(v => !v.deleted_at);
  },
  getProductVariantById: async (id: string) => mockProductVariants.find(v => v._id === id && !v.deleted_at),
  getProductVariant: async (id: string) => mockProductVariants.find(v => v._id === id && !v.deleted_at),
  getProductVariantByCode: async (code: string) => mockProductVariants.find(v => v.sku === code && !v.deleted_at),
  getProductVariantByBarcode: async (barcode: string) => {
    const variant = mockProductVariants.find(v => v.barcode === barcode && !v.deleted_at);
    console.log(`🔍 [getProductVariantByBarcode] Barcode: ${barcode}, Found:`, variant ? `${variant._id} - ${variant.title}` : 'NOT FOUND');
    return variant;
  },
  createProductVariant: async (data: Omit<ProductVariant, '_id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
    const newVariant: ProductVariant = { 
      ...data, 
      _id: `VAR-${Date.now()}`, 
      created_at: new Date().toISOString(), 
      updated_at: new Date().toISOString(),
      deleted_at: null
    };
    mockProductVariants.push(newVariant);
    
    // 🔥 Save to localStorage
    saveToStorage(STORAGE_KEY_VARIANTS, mockProductVariants);
    
    return newVariant;
  },
  updateProductVariant: async (id: string, data: Partial<ProductVariant>) => {
    const index = mockProductVariants.findIndex(v => v._id === id);
    if (index !== -1) {
      mockProductVariants[index] = { ...mockProductVariants[index], ...data, updated_at: new Date().toISOString() };
      
      // 🔥 Save to localStorage
      saveToStorage(STORAGE_KEY_VARIANTS, mockProductVariants);
      
      return mockProductVariants[index];
    }
    return null;
  },
  deleteProductVariant: async (id: string) => {
    const index = mockProductVariants.findIndex(v => v._id === id);
    if (index !== -1) {
      // Soft delete - chỉ đánh dấu deleted_at
      mockProductVariants[index].deleted_at = new Date().toISOString();
      
      // 🔥 Save to localStorage
      saveToStorage(STORAGE_KEY_VARIANTS, mockProductVariants);
      
      console.log(`🗑️ [deleteProductVariant] Deleted variant ${id}`);
      return true;
    }
    console.warn(`⚠️ [deleteProductVariant] Variant ${id} not found`);
    return false;
  },

  // Product Units
  getProductUnits: async () => mockProductUnits,
  getProductUnitById: async (id: string) => mockProductUnits.find(pu => pu._id === id),
  createProductUnit: async (data: Omit<ProductUnit, '_id' | 'created_at' | 'updated_at'>) => {
    const newUnit: ProductUnit = { ...data, _id: `UNIT-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    mockProductUnits.push(newUnit);
    return newUnit;
  },
  updateProductUnit: async (id: string, data: Partial<ProductUnit>) => {
    const index = mockProductUnits.findIndex(pu => pu._id === id);
    if (index !== -1) {
      mockProductUnits[index] = { ...mockProductUnits[index], ...data, updated_at: new Date().toISOString() };
      return mockProductUnits[index];
    }
    return null;
  },
  deleteProductUnit: async (id: string) => {
    const index = mockProductUnits.findIndex(pu => pu._id === id);
    if (index !== -1) {
      mockProductUnits.splice(index, 1);
      return true;
    }
    return false;
  },

  // Product Property Values (Liên kết)
  getProductPropertyValues: async () => mockProductPropertyValues,
  getProductPropertyValuesByProductId: async (productId: string) => 
    mockProductPropertyValues.filter(ppv => ppv.product_id === productId),
  createProductPropertyValue: async (data: Omit<ProductPropertyValue, '_id' | 'created_at' | 'updated_at'>) => {
    const newPPV: ProductPropertyValue = { 
      ...data, 
      _id: `PPV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
      created_at: new Date().toISOString(), 
      updated_at: new Date().toISOString() 
    };
    mockProductPropertyValues.push(newPPV);
    return newPPV;
  },
  deleteProductPropertyValuesByProductId: async (productId: string) => {
    const initialLength = mockProductPropertyValues.length;
    mockProductPropertyValues = mockProductPropertyValues.filter(ppv => ppv.product_id !== productId);
    return initialLength - mockProductPropertyValues.length;
  },

  // Product Unit Configs (Liên kết)
  getProductUnitConfigs: async () => mockProductUnitConfigs,
  getProductUnitConfigsByProductId: async (productId: string) => 
    mockProductUnitConfigs.filter(puc => puc.product_id === productId),
  createProductUnitConfig: async (data: Omit<ProductUnitConfig, '_id' | 'created_at' | 'updated_at'>) => {
    const newPUC: ProductUnitConfig = { 
      ...data, 
      _id: `PUC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
      created_at: new Date().toISOString(), 
      updated_at: new Date().toISOString() 
    };
    mockProductUnitConfigs.push(newPUC);
    return newPUC;
  },
  deleteProductUnitConfigsByProductId: async (productId: string) => {
    const initialLength = mockProductUnitConfigs.length;
    mockProductUnitConfigs = mockProductUnitConfigs.filter(puc => puc.product_id !== productId);
    return initialLength - mockProductUnitConfigs.length;
  },
};
