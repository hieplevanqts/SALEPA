// Table name configuration
// All Supabase tables use 'sp_' prefix (Salepa POS)

export const TABLES = {
  PRODUCT_TYPES: 'sp_product_types',
  PRODUCT_CATEGORIES: 'sp_product_categories',
  PRODUCT_TAGS: 'sp_product_tags',
  PRODUCT_SUPPLIERS: 'sp_product_suppliers',
  PRODUCT_BRANDS: 'sp_product_brands',
  PRODUCT_UNITS: 'sp_product_units',
  PRODUCTS: 'sp_products',
  PRODUCT_VARIANTS: 'sp_product_variants',
  PRODUCT_ATTRIBUTE_DEFINITIONS: 'sp_product_attribute_definitions',
  PRODUCT_ATTRIBUTE_VALUES: 'sp_product_attribute_values',
  KV_STORE: 'kv_store_4198d50c',
} as const;

// Helper function to get all table names
export function getAllTableNames(): string[] {
  return Object.values(TABLES);
}