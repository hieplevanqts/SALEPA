// @ts-nocheck
// =====================================================
// EXAMPLE: Sử dụng variantUtils trong ProductForm
// =====================================================

import { useState } from 'react';
import { 
  generateSKU, 
  generateVariantTitle, 
  generateFullProductName,
  calculateTotalStock,
  countUniqueVariants,
  calculateAvailableQuantity,
  formatStockWithConversion
} from '../../../../lib/fashion-shop-lib/variantUtils';

const api = {} as any;

// =====================================================
// CASE 1: Lưu sản phẩm mới
// =====================================================

async function handleSaveProduct(formData: any, variantsData: any) {
  // 1. Tạo Product (SPU)
  const totalStock = calculateTotalStock(variantsData.variants);
  const variantCount = countUniqueVariants(variantsData.variants);
  
  const product = await api.createProduct({
    title: formData.title,
    code: formData.code,
    price: formData.price,
    cost_price: formData.cost_price,
    quantity: totalStock,
    variants_count: variantCount,
    // ... other fields
  });

  // 2. Tạo Units (nếu có)
  for (const unit of variantsData.units) {
    await api.createProductUnitConfig({
      product_id: product._id,
      unit_name: unit.name,
      conversion: unit.conversion,
      is_base: unit.isBase,
      is_direct_sale: unit.isDirectSale,
    });
  }

  // 3. Tạo Attributes (nếu có)
  for (const attr of variantsData.attributes) {
    for (const value of attr.values) {
      await api.createProductPropertyValue({
        product_id: product._id,
        property_name: attr.name,
        property_value: value,
      });
    }
  }

  // 4. Tạo Variants
  const hasMultipleUnits = variantsData.units.length > 1;
  
  for (const variant of variantsData.variants) {
    // ✅ Sinh SKU tự động
    const sku = generateSKU(
      product.code,
      variant.attributes,
      variant.unit,
      hasMultipleUnits
    );

    // ✅ Sinh title tự động
    const title = generateVariantTitle(
      variant.attributes,
      variant.unit,
      hasMultipleUnits
    );

    const newVariant = await api.createProductVariant({
      product_id: product._id,
      sku,
      title,
      barcode: variant.barcode,
      price: variant.price,
      cost_price: variant.costPrice,
      quantity: variant.conversion === 1 ? variant.stock : 0, // CHỈ lưu tồn kho đơn vị cơ bản
      conversion: variant.conversion,
    });

    // 5. Gắn thuộc tính cho variant
    for (const [propName, propValue] of Object.entries(variant.attributes)) {
      await api.createProductVariantPropertyValue({
        variant_id: newVariant._id,
        property_name: propName,
        property_value: propValue,
      });
    }
  }

  return product;
}

// =====================================================
// CASE 2: Hiển thị trong danh sách sản phẩm
// =====================================================

function ProductListItem({ product }: { product: any }) {
  return (
    <div className="border rounded p-4">
      <h3 className="font-semibold">{product.title}</h3>
      <p className="text-gray-600">Mã: {product.code}</p>
      <p className="text-gray-600">Tồn kho: {product.quantity} cái</p>
      {product.variants_count > 1 && (
        <p className="text-gray-500 text-sm">{product.variants_count} phân loại</p>
      )}
      <p className="text-lg font-bold mt-2">
        {product.price.toLocaleString('vi-VN')}đ
      </p>
    </div>
  );
}

// =====================================================
// CASE 3: Hiển thị trong màn bán hàng
// =====================================================

function SalesSearchResult({ product, variant }: { product: any; variant: any }) {
  // ✅ Tên đầy đủ: SPU + Variant
  const fullName = generateFullProductName(product.title, variant.title);
  
  return (
    <div className="border-b p-3 hover:bg-gray-50 cursor-pointer">
      <div className="font-medium">{fullName}</div>
      <div className="text-sm text-gray-600">
        SKU: {variant.sku} | Barcode: {variant.barcode}
      </div>
      <div className="flex justify-between items-center mt-1">
        <span className="text-lg font-bold text-[#FE7410]">
          {variant.price.toLocaleString('vi-VN')}đ
        </span>
        <span className="text-sm text-gray-600">
          Tồn: {variant.quantity} {variant.unit}
        </span>
      </div>
      {variant.conversion > 1 && (
        <div className="text-xs text-blue-600 mt-1">
          1 {variant.unit} = {variant.conversion} {product.base_unit}
        </div>
      )}
    </div>
  );
}

// =====================================================
// CASE 4: Hiển thị trong giỏ hàng
// =====================================================

function CartItem({ item }: { item: any }) {
  const fullName = generateFullProductName(item.product.title, item.variant.title);
  
  return (
    <div className="flex items-center gap-3 p-3 border-b">
      <img src={item.product.image} alt="" className="w-12 h-12 rounded object-cover" />
      <div className="flex-1">
        <div className="font-medium">{fullName}</div>
        <div className="text-sm text-gray-600">
          {item.variant.price.toLocaleString('vi-VN')}đ × {item.quantity} {item.variant.unit}
        </div>
        {item.variant.conversion > 1 && (
          <div className="text-xs text-blue-600">
            = {item.quantity * item.variant.conversion} {item.product.base_unit}
          </div>
        )}
      </div>
      <div className="font-bold text-[#FE7410]">
        {(item.variant.price * item.quantity).toLocaleString('vi-VN')}đ
      </div>
    </div>
  );
}

// =====================================================
// CASE 5: Hiển thị trong quản lý kho
// =====================================================

function InventoryTable({ products }: { products: any[] }) {
  return (
    <table className="w-full">
      <thead>
        <tr>
          <th>Sản phẩm</th>
          <th>SKU</th>
          <th>Phân loại</th>
          <th>Tồn kho</th>
          <th>Trạng thái</th>
        </tr>
      </thead>
      <tbody>
        {products.map(product => 
          product.variants.map((variant: any) => {
            const isBase = variant.conversion === 1;
            const displayQuantity = isBase 
              ? variant.quantity 
              : calculateAvailableQuantity(
                  product.variants.find((v: any) => 
                    v.conversion === 1 && 
                    JSON.stringify(v.attributes) === JSON.stringify(variant.attributes)
                  )?.quantity || 0,
                  variant.conversion
                );

            return (
              <tr key={variant._id}>
                <td>{product.title}</td>
                <td className="font-mono text-sm">{variant.sku}</td>
                <td>{variant.title}</td>
                <td>
                  <span className={isBase ? 'font-semibold' : 'text-gray-600'}>
                    {formatStockWithConversion(
                      displayQuantity,
                      variant.unit,
                      variant.conversion,
                      product.base_unit
                    )}
                  </span>
                  {!isBase && (
                    <span className="ml-2 text-xs text-blue-600">⚡ Tính toán</span>
                  )}
                </td>
                <td>
                  {displayQuantity === 0 ? (
                    <span className="text-red-600">Hết hàng</span>
                  ) : displayQuantity < 10 ? (
                    <span className="text-orange-600">Sắp hết</span>
                  ) : (
                    <span className="text-green-600">Còn hàng</span>
                  )}
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
}

// =====================================================
// CASE 6: Hiển thị variant selector trong bán hàng
// =====================================================

function VariantSelector({ product, onSelect }: { product: any; onSelect: (variant: any) => void }) {
  const [selectedAttrs, setSelectedAttrs] = useState<{ [key: string]: string }>({});
  const [selectedUnit, setSelectedUnit] = useState<string>('');

  // Lấy danh sách thuộc tính unique
  const properties = [...new Set(product.variants.flatMap((v: any) => Object.keys(v.attributes)))];
  
  // Lấy danh sách đơn vị unique
  const units = [...new Set(product.variants.map((v: any) => ({ name: v.unit, conversion: v.conversion })))];

  // Tìm variant phù hợp
  const matchedVariant = product.variants.find((v: any) => {
    const attrsMatch = properties.every(prop => 
      !selectedAttrs[prop] || v.attributes[prop] === selectedAttrs[prop]
    );
    const unitMatch = !selectedUnit || v.unit === selectedUnit;
    return attrsMatch && unitMatch;
  });

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">{product.title}</h3>

      {/* Chọn thuộc tính */}
      {properties.map(prop => {
        const values = [...new Set(
          product.variants
            .filter((v: any) => v.attributes[prop])
            .map((v: any) => v.attributes[prop])
        )];

        return (
          <div key={prop}>
            <label className="block text-sm font-medium mb-2">{prop}</label>
            <div className="flex gap-2">
              {values.map(value => (
                <button
                  key={value}
                  onClick={() => setSelectedAttrs(prev => ({ ...prev, [prop]: value }))}
                  className={`px-3 py-1 border rounded ${
                    selectedAttrs[prop] === value
                      ? 'bg-[#FE7410] text-white border-[#FE7410]'
                      : 'bg-white hover:border-[#FE7410]'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {/* Chọn đơn vị */}
      {units.length > 1 && (
        <div>
          <label className="block text-sm font-medium mb-2">Đơn vị</label>
          <div className="flex gap-2">
            {units.map(unit => (
              <button
                key={unit.name}
                onClick={() => setSelectedUnit(unit.name)}
                className={`px-3 py-1 border rounded ${
                  selectedUnit === unit.name
                    ? 'bg-[#FE7410] text-white border-[#FE7410]'
                    : 'bg-white hover:border-[#FE7410]'
                }`}
              >
                <div>{unit.name}</div>
                {unit.conversion > 1 && (
                  <div className="text-xs">({unit.conversion} {product.base_unit})</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hiển thị thông tin variant */}
      {matchedVariant && (
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold text-lg">
                {matchedVariant.price.toLocaleString('vi-VN')}đ
              </div>
              <div className="text-sm text-gray-600">
                Tồn kho: {calculateAvailableQuantity(
                  matchedVariant.quantity,
                  matchedVariant.conversion
                )} {matchedVariant.unit}
              </div>
            </div>
            <button
              onClick={() => onSelect(matchedVariant)}
              className="px-4 py-2 bg-[#FE7410] text-white rounded hover:bg-[#E56600]"
            >
              Thêm vào giỏ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export {
  handleSaveProduct,
  ProductListItem,
  SalesSearchResult,
  CartItem,
  InventoryTable,
  VariantSelector,
};
