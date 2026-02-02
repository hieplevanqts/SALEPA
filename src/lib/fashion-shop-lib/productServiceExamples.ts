// =====================================================
// PRODUCT SERVICE EXAMPLES
// Các ví dụ sử dụng Mock Product Service
// =====================================================

import { mockProductService } from './mockProductService';
import {
  Product,
  ProductVariant,
  CreateProductFlow,
} from './productDataModel';

// =====================================================
// EXAMPLE 1: Tạo sản phẩm CÓ PHÂN LOẠI
// (Màu sắc x Size)
// =====================================================

export async function example1_CreateProductWithVariants() {
  console.log('='.repeat(60));
  console.log('EXAMPLE 1: Tạo sản phẩm CÓ PHÂN LOẠI');
  console.log('='.repeat(60));

  // Step 1: Chuẩn bị thông tin Product
  const productData: Partial<Product> = {
    code: 'PRD-EXAMPLE-001',
    title: 'Áo polo nam cao cấp',
    brief: 'Áo polo cotton 100%, thoáng mát',
    content: '<p>Chất liệu cotton cao cấp, form dáng regular fit</p>',
    price: 299000,
    brand_id: 'BRAND-0003', // Uniqlo
    product_category_id: '01942c1a-0003-0001-0000-000000000001', // Áo nam
    image: 'https://images.unsplash.com/photo-1651761179569-4ba2aa054997',
  };

  // Step 2: Định nghĩa thuộc tính phân loại
  const properties = {
    'Màu sắc': ['Đỏ', 'Xanh navy', 'Trắng'],
    'Size': ['M', 'L', 'XL'],
  };

  // Step 3: Sinh SKUs tự động
  const generatedVariants = mockProductService.generateVariants(
    productData as Product,
    properties
  );

  console.log('\n✅ Đã sinh', generatedVariants.length, 'SKUs:');
  generatedVariants.forEach((v, i) => {
    console.log(`  ${i + 1}. ${v.sku} - ${v.title}`);
  });

  // Step 4: Gán giá và tồn kho cho từng SKU
  const variants = generatedVariants.map((g, i) => ({
    sku: g.sku,
    title: g.title,
    barcode: `893456789${String(i).padStart(4, '0')}`, // Generate unique barcode
    price: 299000,
    cost_price: 180000,
    quantity: 20,
    properties: g.properties,
  }));

  // Step 5: Tạo Product với flow hoàn chỉnh
  const flow: CreateProductFlow = {
    product: productData,
    properties: [
      {
        property_id: 'PROP-0001',
        property_name: 'Màu sắc',
        values: ['Đỏ', 'Xanh navy', 'Trắng'],
      },
      {
        property_id: 'PROP-0002',
        property_name: 'Size',
        values: ['M', 'L', 'XL'],
      },
    ],
    variants,
    unit_config: {
      unit_id: 'UNIT-0001',
      unit_name: 'Cái',
      is_base: true,
      conversion: 1,
    },
  };

  const newProduct = await mockProductService.createProduct(flow);

  console.log('\n✅ Đã tạo Product thành công!');
  console.log('  - ID:', newProduct._id);
  console.log('  - Code:', newProduct.code);
  console.log('  - Title:', newProduct.title);
  console.log('  - Số lượng SKUs:', newProduct.variants.length);
  console.log('  - Tổng tồn kho:', newProduct.quantity, '(=', variants.length, 'x 20)');
  console.log('  - Trạng thái:', newProduct.is_sold_out ? 'Hết hàng' : 'Còn hàng');

  return newProduct;
}

// =====================================================
// EXAMPLE 2: Tạo sản phẩm KHÔNG PHÂN LOẠI
// (Tự động tạo 1 SKU mặc định - Rule 2)
// =====================================================

export async function example2_CreateProductWithoutVariants() {
  console.log('\n' + '='.repeat(60));
  console.log('EXAMPLE 2: Tạo sản phẩm KHÔNG PHÂN LOẠI');
  console.log('='.repeat(60));

  const productData: Partial<Product> = {
    code: 'PRD-SIMPLE-001',
    title: 'Balo laptop Uniqlo',
    brief: 'Balo laptop 15 inch',
    price: 590000,
    brand_id: 'BRAND-0003',
    product_category_id: '01942c1a-0003-0001-0000-000000000009', // Balo
  };

  // Không có phân loại → 1 SKU mặc định
  const flow: CreateProductFlow = {
    product: productData,
    properties: [], // Không có thuộc tính
    variants: [
      {
        sku: productData.code!, // SKU = Product.code (Rule 2)
        title: productData.title!, // Title = Product.title
        barcode: '8934567899999',
        price: 590000,
        cost_price: 350000,
        quantity: 100,
        properties: {}, // Không có thuộc tính
      },
    ],
  };

  const newProduct = await mockProductService.createProduct(flow);

  console.log('\n✅ Đã tạo Product không phân loại!');
  console.log('  - Code:', newProduct.code);
  console.log('  - Title:', newProduct.title);
  console.log('  - Số SKUs:', newProduct.variants.length, '(SKU mặc định)');
  console.log('  - SKU:', newProduct.variants[0].sku);
  console.log('  - Tồn kho:', newProduct.quantity);

  return newProduct;
}

// =====================================================
// EXAMPLE 3: LUỒNG BÁN HÀNG POS
// (Quét barcode → Tìm SKU → Trừ tồn kho)
// =====================================================

export async function example3_POSSaleFlow() {
  console.log('\n' + '='.repeat(60));
  console.log('EXAMPLE 3: LUỒNG BÁN HÀNG POS');
  console.log('='.repeat(60));

  // Scenario: Khách hàng quét barcode tại quầy thu ngân
  const scannedBarcode = '8934567890123';

  console.log('\n📱 Quét barcode:', scannedBarcode);

  // Step 1: Tìm SKU theo barcode (Rule 1 & Rule 3)
  const saleFlow = await mockProductService.findVariantForPOS(scannedBarcode);

  if (!saleFlow.variant) {
    console.error('❌ Không tìm thấy sản phẩm với barcode:', scannedBarcode);
    return;
  }

  console.log('\n✅ Tìm thấy SKU:');
  console.log('  - SKU:', saleFlow.variant.sku);
  console.log('  - Tên:', saleFlow.variant.title);
  console.log('  - Giá bán:', saleFlow.variant.price?.toLocaleString(), 'đ');
  console.log('  - Giá vốn:', saleFlow.variant.cost_price?.toLocaleString(), 'đ');
  console.log('  - Tồn kho:', saleFlow.available_quantity);

  // Step 2: Kiểm tra có thể bán không
  if (!saleFlow.can_sell) {
    console.error('❌ Không thể bán:', saleFlow.error);
    return;
  }

  console.log('  ✅ Có thể bán');

  // Step 3: Lấy thông tin Product
  if (saleFlow.product) {
    console.log('\n📦 Thông tin Product:');
    console.log('  - Code:', saleFlow.product.code);
    console.log('  - Title:', saleFlow.product.title);
    console.log('  - Tổng tồn kho:', saleFlow.product.quantity);
  }

  // Step 4: Lấy thuộc tính SKU
  const variantProps = await mockProductService.getVariantProperties(saleFlow.variant._id);
  if (variantProps.length > 0) {
    console.log('\n🏷️  Thuộc tính:');
    variantProps.forEach(p => {
      console.log(`  - ${p.property_name}: ${p.property_value}`);
    });
  }

  // Step 5: Thêm vào giỏ hàng (mô phỏng)
  console.log('\n🛒 Thêm vào giỏ hàng: 1 sản phẩm');

  // Step 6: Thanh toán - Trừ tồn kho
  console.log('\n💳 Thanh toán...');
  
  const soldQuantity = 1;
  const saleResult = await mockProductService.sellVariant(
    saleFlow.variant._id,
    soldQuantity
  );

  if (saleResult.success) {
    console.log('✅ Bán thành công!');
    console.log('  - Tồn kho SKU còn lại:', saleResult.variant?.quantity);
    console.log('  - Tổng tồn Product:', saleResult.product?.quantity);
    console.log('  - Trạng thái Product:', saleResult.product?.is_sold_out ? 'Hết hàng' : 'Còn hàng');
  } else {
    console.error('❌ Bán thất bại:', saleResult.error);
  }
}

// =====================================================
// EXAMPLE 4: CẬP NHẬT TỒN KHO (Nhập/Xuất kho)
// =====================================================

export async function example4_UpdateStock() {
  console.log('\n' + '='.repeat(60));
  console.log('EXAMPLE 4: CẬP NHẬT TỒN KHO');
  console.log('='.repeat(60));

  // Lấy một SKU bất kỳ
  const productId = 'PRD-0001';
  const product = await mockProductService.getProductWithVariants(productId);
  
  if (!product || product.variants.length === 0) {
    console.error('❌ Không tìm thấy product hoặc variants');
    return;
  }

  const variant = product.variants[0];

  console.log('\n📦 SKU hiện tại:');
  console.log('  - SKU:', variant.sku);
  console.log('  - Tên:', variant.title);
  console.log('  - Tồn kho hiện tại:', variant.quantity);
  console.log('  - Tổng tồn Product:', product.quantity);

  // Scenario: Nhập kho thêm 50 sản phẩm
  console.log('\n📥 Nhập kho: +50 sản phẩm');
  
  const newQuantity = variant.quantity + 50;
  await mockProductService.updateVariant(variant._id, {
    quantity: newQuantity,
    is_sold_out: false,
  });

  // Kiểm tra sau khi nhập kho
  const updatedProduct = await mockProductService.getProductWithVariants(productId);
  const updatedVariant = updatedProduct!.variants.find(v => v._id === variant._id)!;

  console.log('✅ Sau khi nhập kho:');
  console.log('  - Tồn kho SKU:', updatedVariant.quantity);
  console.log('  - Tổng tồn Product:', updatedProduct!.quantity, '(tự động cập nhật - Rule 4)');

  // Scenario: Xuất kho 30 sản phẩm
  console.log('\n📤 Xuất kho: -30 sản phẩm');
  
  await mockProductService.updateVariant(variant._id, {
    quantity: updatedVariant.quantity - 30,
  });

  const finalProduct = await mockProductService.getProductWithVariants(productId);
  const finalVariant = finalProduct!.variants.find(v => v._id === variant._id)!;

  console.log('✅ Sau khi xuất kho:');
  console.log('  - Tồn kho SKU:', finalVariant.quantity);
  console.log('  - Tổng tồn Product:', finalProduct!.quantity, '(tự động cập nhật)');
}

// =====================================================
// EXAMPLE 5: VALIDATION
// =====================================================

export async function example5_Validation() {
  console.log('\n' + '='.repeat(60));
  console.log('EXAMPLE 5: VALIDATION');
  console.log('='.repeat(60));

  // Case 1: Product hợp lệ
  console.log('\n✅ Case 1: Product HỢP LỆ');
  const validProduct = {
    code: 'PRD-TEST-001',
    title: 'Áo thun test',
    price: 199000,
    quantity: 100,
    brand_id: 'BRAND-0001',
    image: 'https://example.com/image.jpg',
  };

  const validation1 = mockProductService.validateProduct(validProduct);
  console.log('  - Valid:', validation1.valid);
  console.log('  - Errors:', validation1.errors.length);
  console.log('  - Warnings:', validation1.warnings.length);

  // Case 2: Product thiếu thông tin
  console.log('\n⚠️  Case 2: Product THIẾU THÔNG TIN');
  const invalidProduct = {
    code: '',  // ❌ Thiếu code
    title: '',  // ❌ Thiếu title
    price: -100,  // ❌ Giá âm
  };

  const validation2 = mockProductService.validateProduct(invalidProduct);
  console.log('  - Valid:', validation2.valid);
  console.log('  - Errors:');
  validation2.errors.forEach(err => console.log('    -', err));
  console.log('  - Warnings:');
  validation2.warnings.forEach(warn => console.log('    -', warn));

  // Case 3: Variant validation
  console.log('\n⚠️  Case 3: Variant LỖ (giá bán < giá vốn)');
  const variantLoss = {
    sku: 'PRD-TEST-001',
    title: 'Test variant',
    product_id: 'PRD-TEST-001',
    price: 100000,  // ⚠️  Giá bán thấp hơn giá vốn
    cost_price: 150000,
    quantity: 10,
  };

  const validation3 = mockProductService.validateVariant(variantLoss);
  console.log('  - Valid:', validation3.valid);
  console.log('  - Warnings:');
  validation3.warnings.forEach(warn => console.log('    -', warn));
}

// =====================================================
// EXAMPLE 6: SINH VARIANTS TỰ ĐỘNG
// =====================================================

export async function example6_GenerateVariants() {
  console.log('\n' + '='.repeat(60));
  console.log('EXAMPLE 6: SINH VARIANTS TỰ ĐỘNG');
  console.log('='.repeat(60));

  const product: Partial<Product> = {
    code: 'PRD-AUTO-001',
    title: 'Áo thun basic',
  };

  // Case 1: 2 thuộc tính (3x4 = 12 variants)
  console.log('\n📊 Case 1: Màu sắc (3) x Size (4) = 12 SKUs');
  const variants1 = mockProductService.generateVariants(product as Product, {
    'Màu sắc': ['Đỏ', 'Đen', 'Trắng'],
    'Size': ['S', 'M', 'L', 'XL'],
  });

  console.log('  Tổng số SKUs:', variants1.length);
  console.log('  Ví dụ:');
  variants1.slice(0, 3).forEach(v => {
    const props = Object.entries(v.properties)
      .map(([k, val]) => `${k}: ${val}`)
      .join(', ');
    console.log(`    - ${v.sku} (${props})`);
  });
  console.log('    ...');

  // Case 2: 3 thuộc tính (2x3x2 = 12 variants)
  console.log('\n📊 Case 2: Màu (2) x Size (3) x Chất liệu (2) = 12 SKUs');
  const variants2 = mockProductService.generateVariants(product as Product, {
    'Màu sắc': ['Đỏ', 'Đen'],
    'Size': ['M', 'L', 'XL'],
    'Chất liệu': ['Cotton', 'Polyester'],
  });

  console.log('  Tổng số SKUs:', variants2.length);
  console.log('  Ví dụ:');
  variants2.slice(0, 3).forEach(v => {
    const props = Object.entries(v.properties)
      .map(([k, val]) => `${k}: ${val}`)
      .join(', ');
    console.log(`    - ${v.sku} (${props})`);
  });
}

// =====================================================
// RUN ALL EXAMPLES
// =====================================================

export async function runAllExamples() {
  console.log('\n');
  console.log('╔' + '═'.repeat(58) + '╗');
  console.log('║' + ' '.repeat(15) + 'PRODUCT SERVICE EXAMPLES' + ' '.repeat(19) + '║');
  console.log('╚' + '═'.repeat(58) + '╝');

  try {
    await example1_CreateProductWithVariants();
    await example2_CreateProductWithoutVariants();
    await example3_POSSaleFlow();
    await example4_UpdateStock();
    await example5_Validation();
    await example6_GenerateVariants();

    console.log('\n' + '='.repeat(60));
    console.log('✅ TẤT CẢ CÁC VÍ DỤ ĐÃ CHẠY THÀNH CÔNG!');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('\n❌ LỖI KHI CHẠY EXAMPLES:', error);
  }
}

// =====================================================
// EXPORTS
// =====================================================

export default {
  example1_CreateProductWithVariants,
  example2_CreateProductWithoutVariants,
  example3_POSSaleFlow,
  example4_UpdateStock,
  example5_Validation,
  example6_GenerateVariants,
  runAllExamples,
};
