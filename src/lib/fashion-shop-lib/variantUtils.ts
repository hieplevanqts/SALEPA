// =====================================================
// VARIANT UTILS - Hàm tiện ích cho SKU/Variant
// =====================================================

/**
 * Chuẩn hóa text để tạo code
 * Ví dụ: "Đỏ" → "RED", "Xanh dương" → "BLUE"
 */
function normalizeForCode(text: string): string {
  const colorMap: { [key: string]: string } = {
    'đỏ': 'RED',
    'xanh': 'BLUE',
    'xanh dương': 'BLUE',
    'xanh lá': 'GREEN',
    'xanh navy': 'NAVY',
    'đen': 'BLACK',
    'trắng': 'WHITE',
    'vàng': 'YELLOW',
    'cam': 'ORANGE',
    'nâu': 'BROWN',
    'xám': 'GRAY',
    'hồng': 'PINK',
    'tím': 'PURPLE',
    'be': 'BEIGE',
  };

  const sizeMap: { [key: string]: string } = {
    'nhỏ': 'S',
    'vừa': 'M',
    'lớn': 'L',
    'rất lớn': 'XL',
  };

  const unitMap: { [key: string]: string } = {
    'cái': 'CAI',
    'chiếc': 'CHIEC',
    'bộ': 'BO',
    'lô': 'LO',
    'thùng': 'THUNG',
    'hộp': 'HOP',
    'gói': 'GOI',
    'kg': 'KG',
    'gram': 'G',
    'lít': 'L',
    'ml': 'ML',
  };

  const lowerText = text.toLowerCase().trim();

  // Check color map
  if (colorMap[lowerText]) return colorMap[lowerText];

  // Check size map
  if (sizeMap[lowerText]) return sizeMap[lowerText];

  // Check unit map
  if (unitMap[lowerText]) return unitMap[lowerText];

  // Default: Remove diacritics, uppercase, take first 3 chars
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 3);
}

/**
 * Sinh SKU tự động từ Product + Variant
 * 
 * @param productCode Mã sản phẩm (SPU code), ví dụ: "NIKE-BASIC-001"
 * @param attributes Thuộc tính variant, ví dụ: { "Màu sắc": "Đỏ", "Kích thước": "M" }
 * @param unit Đơn vị tính, ví dụ: "Lô"
 * @param hasMultipleUnits Có nhiều đơn vị hay không
 * 
 * @returns SKU, ví dụ: "NIKE-BASIC-001-RED-M-LO"
 */
export function generateSKU(
  productCode: string,
  attributes: { [key: string]: string } = {},
  unit?: string,
  hasMultipleUnits: boolean = false
): string {
  const parts = [productCode];

  // Thêm attributes (sắp xếp theo key để đảm bảo thứ tự nhất quán)
  const sortedKeys = Object.keys(attributes).sort();
  sortedKeys.forEach(key => {
    const value = attributes[key];
    if (value) {
      parts.push(normalizeForCode(value));
    }
  });

  // Thêm unit (chỉ khi có nhiều đơn vị)
  if (hasMultipleUnits && unit) {
    parts.push(normalizeForCode(unit));
  }

  return parts.join('-');
}

/**
 * Sinh tiêu đề variant hiển thị
 * 
 * @param attributes Thuộc tính variant, ví dụ: { "Màu sắc": "Đỏ", "Kích thước": "M" }
 * @param unit Đơn vị tính, ví dụ: "Lô"
 * @param hasMultipleUnits Có nhiều đơn vị hay không
 * @param includeUnitForBase Có hiển thị đơn vị cơ bản không (mặc định: false)
 * 
 * @returns Tên variant, ví dụ: "MÀU SẮC: Đỏ, KÍCH THƯỚC: M (cái)" hoặc "MÀU SẮC: Đỏ, KÍCH THƯỚC: M" hoặc "Mặc định"
 */
export function generateVariantTitle(
  attributes: { [key: string]: string } = {},
  unit?: string,
  hasMultipleUnits: boolean = false,
  includeUnitForBase: boolean = false
): string {
  const parts: string[] = [];

  // Thêm attributes với format "KEY: value"
  const sortedKeys = Object.keys(attributes).sort();
  sortedKeys.forEach(key => {
    const value = attributes[key];
    if (value) {
      // Format: "MÀU SẮC: Đỏ"
      parts.push(`${key.toUpperCase()}: ${value}`);
    }
  });

  // ✅ FIX: Logic hiển thị đơn vị
  // - Nếu có attributes + có 1 đơn vị duy nhất (!hasMultipleUnits && unit) → Hiển thị (cái)
  // - Nếu có nhiều đơn vị (hasMultipleUnits) → KHÔNG hiển thị đơn vị (có cột riêng)
  // - Nếu không có attributes nhưng có unit và includeUnitForBase → Hiển thị (cái)
  const attributesText = parts.join(', ');
  
  if (unit && !hasMultipleUnits && attributesText) {
    // Case: Có attributes + Có 1 đơn vị duy nhất → "MÀU SẮC: Đỏ, KÍCH THƯỚC: M (cái)"
    return `${attributesText} (${unit.toLowerCase()})`;
  }
  
  if (unit && includeUnitForBase && !attributesText) {
    // Case: Không có attributes + Có unit và force hiển thị → "(cái)"
    return `(${unit.toLowerCase()})`;
  }

  return attributesText || 'Mặc định';
}

/**
 * Sinh tên hiển thị đầy đủ (SPU + Variant)
 * 
 * @param productTitle Tên sản phẩm, ví dụ: "Áo thun Nike"
 * @param variantTitle Tên variant, ví dụ: "Đỏ - M - Lô"
 * 
 * @returns Tên đầy đủ, ví dụ: "Áo thun Nike - Đỏ - M - Lô" hoặc "Áo thun Nike"
 */
export function generateFullProductName(productTitle: string, variantTitle: string): string {
  if (!variantTitle || variantTitle === 'Mặc định') {
    return productTitle;
  }
  return `${productTitle} - ${variantTitle}`;
}

/**
 * Tính tồn kho có sẵn cho đơn vị phụ
 * 
 * @param baseQuantity Tồn kho đơn vị cơ bản
 * @param conversion Hệ số quy đổi
 * 
 * @returns Số lượng có thể bán, ví dụ: baseQuantity=25, conversion=12 → 2
 */
export function calculateAvailableQuantity(baseQuantity: number, conversion: number): number {
  if (conversion <= 1) return baseQuantity;
  return Math.floor(baseQuantity / conversion);
}

/**
 * Format hiển thị tồn kho với đơn vị
 * 
 * @param quantity Số lượng
 * @param unit Đơn vị
 * @param conversion Hệ số quy đổi
 * @param baseUnit Đơn vị cơ bản
 * 
 * @returns Text hiển thị, ví dụ: "2 lô" hoặc "25 cái"
 */
export function formatStock(
  quantity: number,
  unit: string,
  _conversion: number,
  _baseUnit?: string
): string {
  return `${quantity} ${unit}`.toLowerCase();
}

/**
 * Format hiển thị tồn kho với quy đổi
 * 
 * @param quantity Số lượng
 * @param unit Đơn vị
 * @param conversion Hệ số quy đổi
 * @param baseUnit Đơn vị cơ bản
 * 
 * @returns Text hiển thị, ví dụ: "2 lô (= 24 cái)" hoặc "25 cái"
 */
export function formatStockWithConversion(
  quantity: number,
  unit: string,
  conversion: number,
  baseUnit?: string
): string {
  if (conversion <= 1 || !baseUnit) {
    return formatStock(quantity, unit, conversion);
  }

  const totalInBase = quantity * conversion;
  return `${quantity} ${unit} (= ${totalInBase} ${baseUnit})`.toLowerCase();
}

/**
 * Lấy danh sách giá trị unique của một thuộc tính từ variants
 * 
 * @param variants Danh sách variants
 * @param propertyName Tên thuộc tính, ví dụ: "Màu sắc"
 * 
 * @returns Mảng giá trị unique, ví dụ: ["Đỏ", "Xanh", "Đen"]
 */
export function getUniquePropertyValues(
  variants: Array<{ attributes: { [key: string]: string } }>,
  propertyName: string
): string[] {
  const values = new Set<string>();
  variants.forEach(v => {
    const value = v.attributes[propertyName];
    if (value) values.add(value);
  });
  return Array.from(values).sort();
}

/**
 * Lấy danh sách đơn vị unique từ variants
 * 
 * @param variants Danh sách variants
 * 
 * @returns Mảng đơn vị unique với conversion
 */
export function getUniqueUnits(
  variants: Array<{ unit: string; conversion: number }>
): Array<{ name: string; conversion: number }> {
  const unitsMap = new Map<string, number>();
  variants.forEach(v => {
    if (v.unit && !unitsMap.has(v.unit)) {
      unitsMap.set(v.unit, v.conversion);
    }
  });
  
  return Array.from(unitsMap.entries())
    .map(([name, conversion]) => ({ name, conversion }))
    .sort((a, b) => a.conversion - b.conversion); // Sắp xếp theo conversion tăng dần
}

/**
 * Kiểm tra variant có phải đơn vị cơ bản không
 * 
 * @param conversion Hệ số quy đổi
 * 
 * @returns true nếu là đơn vị cơ bản
 */
export function isBaseUnit(conversion: number): boolean {
  return conversion === 1;
}

/**
 * Tính tổng tồn kho từ danh sách variants (chỉ tính đơn vị cơ bản)
 * 
 * @param variants Danh sách variants
 * 
 * @returns Tổng tồn kho
 */
export function calculateTotalStock(
  variants: Array<{ quantity: number; conversion: number }>
): number {
  return variants
    .filter(v => isBaseUnit(v.conversion))
    .reduce((sum, v) => sum + v.quantity, 0);
}

/**
 * Đếm số lượng phân loại (SKU unique, không tính đơn vị)
 * 
 * @param variants Danh sách variants
 * 
 * @returns Số phân loại
 */
export function countUniqueVariants(
  variants: Array<{ attributes: { [key: string]: string }; conversion: number }>
): number {
  const uniqueAttrs = new Set<string>();
  variants.forEach(v => {
    if (isBaseUnit(v.conversion)) {
      const attrKey = JSON.stringify(v.attributes);
      uniqueAttrs.add(attrKey);
    }
  });
  return uniqueAttrs.size;
}

// =====================================================
// EXAMPLES
// =====================================================

/*
// Example 1: Sản phẩm có màu + size + đơn vị
const sku = generateSKU(
  'NIKE-BASIC-001',
  { 'Màu sắc': 'Đỏ', 'Kích thước': 'M' },
  'Lô',
  true
);
console.log(sku); // "NIKE-BASIC-001-RED-M-LO"

const title = generateVariantTitle(
  { 'Màu sắc': 'Đỏ', 'Kích thước': 'M' },
  'Lô',
  true
);
console.log(title); // "Đỏ - M - Lô"

const fullName = generateFullProductName('Áo thun Nike', title);
console.log(fullName); // "Áo thun Nike - Đỏ - M - Lô"

// Example 2: Sản phẩm không có phân loại
const sku2 = generateSKU('GUCCI-BAG-001');
console.log(sku2); // "GUCCI-BAG-001"

const title2 = generateVariantTitle();
console.log(title2); // "Mặc định"

const fullName2 = generateFullProductName('Túi Gucci', title2);
console.log(fullName2); // "Túi Gucci"

// Example 3: Tính tồn kho đơn vị phụ
const available = calculateAvailableQuantity(25, 12);
console.log(available); // 2 (2 lô, dư 1 cái)

const stockText = formatStockWithConversion(2, 'Lô', 12, 'Cái');
console.log(stockText); // "2 lô (= 24 cái)"

// Example 4: Tính tổng tồn từ variants
const variants = [
  { quantity: 25, conversion: 1 },  // Đỏ-M-Cái
  { quantity: 0, conversion: 12 },  // Đỏ-M-Lô
  { quantity: 30, conversion: 1 },  // Đỏ-L-Cái
  { quantity: 0, conversion: 12 },  // Đỏ-L-Lô
];
const total = calculateTotalStock(variants);
console.log(total); // 55 (chỉ tính 25 + 30)

const variantCount = countUniqueVariants(variants);
console.log(variantCount); // 2 (Đỏ-M và Đỏ-L)
*/