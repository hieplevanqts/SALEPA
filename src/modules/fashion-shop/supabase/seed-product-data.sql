-- =====================================================
-- SALEPA POS - PRODUCT MODULE MOCK DATA
-- Generated for 1 tenant with 15 records per table
-- =====================================================

-- Fixed tenant_id for all data
DO $$
DECLARE
  v_tenant_id uuid := '01942c1a-b2e4-7d4e-9a3f-1234567890ab'; -- Fixed tenant
  
  -- Industry IDs (will be created)
  v_industry_fashion uuid := gen_random_uuid();
  v_industry_fnb uuid := gen_random_uuid();
  v_industry_retail uuid := gen_random_uuid();
  
  -- Arrays to store created IDs for FK references
  v_product_type_ids uuid[] := ARRAY[]::uuid[];
  v_category_ids uuid[] := ARRAY[]::uuid[];
  v_root_category_ids uuid[] := ARRAY[]::uuid[];
  v_product_ids uuid[] := ARRAY[]::uuid[];
  
  v_temp_id uuid;
  v_parent_id uuid;
  v_parent_code varchar;
  v_parent_path text;
  i int;
  j int;
BEGIN
  
  -- =====================================================
  -- 1) INSERT INDUSTRIES (15 records)
  -- =====================================================
  RAISE NOTICE '📊 Creating 15 industries...';
  
  INSERT INTO nganh_industries (_id, tenant_id, code, name, description, status, created_at, updated_at)
  VALUES
    (v_industry_fashion, v_tenant_id, 'FASHION', 'Thời trang', 'Ngành thời trang & phụ kiện', 1, now(), now()),
    (v_industry_fnb, v_tenant_id, 'FNB', 'Ẩm thực', 'Nhà hàng, quán cafe, đồ ăn uống', 1, now(), now()),
    (v_industry_retail, v_tenant_id, 'RETAIL', 'Bán lẻ', 'Cửa hàng bán lẻ tổng hợp', 1, now(), now()),
    (gen_random_uuid(), v_tenant_id, 'BEAUTY', 'Làm đẹp', 'Spa, salon, mỹ phẩm', 1, now(), now()),
    (gen_random_uuid(), v_tenant_id, 'HEALTH', 'Sức khỏe', 'Dược phẩm, thiết bị y tế', 1, now(), now()),
    (gen_random_uuid(), v_tenant_id, 'TECH', 'Công nghệ', 'Điện tử, máy tính, phụ kiện', 1, now(), now()),
    (gen_random_uuid(), v_tenant_id, 'GROCERY', 'Tạp hóa', 'Siêu thị mini, cửa hàng tiện lợi', 1, now(), now()),
    (gen_random_uuid(), v_tenant_id, 'SPORT', 'Thể thao', 'Đồ thể thao, gym, fitness', 1, now(), now()),
    (gen_random_uuid(), v_tenant_id, 'BOOK', 'Sách', 'Nhà sách, văn phòng phẩm', 1, now(), now()),
    (gen_random_uuid(), v_tenant_id, 'HOME', 'Nội thất', 'Đồ gia dụng, nội thất', 1, now(), now()),
    (gen_random_uuid(), v_tenant_id, 'PET', 'Thú cưng', 'Thức ăn & phụ kiện thú cưng', 1, now(), now()),
    (gen_random_uuid(), v_tenant_id, 'AUTO', 'Ô tô', 'Phụ kiện, phụ tùng xe', 0, now(), now()), -- inactive
    (gen_random_uuid(), v_tenant_id, 'TOY', 'Đồ chơi', 'Đồ chơi trẻ em', 1, now(), now()),
    (gen_random_uuid(), v_tenant_id, 'JEWELRY', 'Trang sức', 'Vàng bạc, đá quý', 2, now(), now()), -- status 2
    (gen_random_uuid(), v_tenant_id, 'FLOWER', 'Hoa', 'Cửa hàng hoa tươi', 1, now(), now());
  
  RAISE NOTICE '✅ Industries created';
  
  -- =====================================================
  -- 2) INSERT PRODUCT TYPES (15 records)
  -- =====================================================
  RAISE NOTICE '📦 Creating 15 product types...';
  
  -- Fashion types (6)
  v_temp_id := gen_random_uuid();
  INSERT INTO sp_product_types (_id, tenant_id, industry_id, code, name, description, status, created_at, updated_at)
  VALUES (v_temp_id, v_tenant_id, v_industry_fashion, 'CLOTHING', 'Quần áo', 'Áo, quần, váy...', 1, now(), now());
  v_product_type_ids := array_append(v_product_type_ids, v_temp_id);
  
  v_temp_id := gen_random_uuid();
  INSERT INTO sp_product_types (_id, tenant_id, industry_id, code, name, description, status, created_at, updated_at)
  VALUES (v_temp_id, v_tenant_id, v_industry_fashion, 'SHOES', 'Giày dép', 'Giày, dép, sandal...', 1, now(), now());
  v_product_type_ids := array_append(v_product_type_ids, v_temp_id);
  
  v_temp_id := gen_random_uuid();
  INSERT INTO sp_product_types (_id, tenant_id, industry_id, code, name, description, status, created_at, updated_at)
  VALUES (v_temp_id, v_tenant_id, v_industry_fashion, 'ACCESSORY', 'Phụ kiện', 'Túi, mũ, thắt lưng...', 1, now(), now());
  v_product_type_ids := array_append(v_product_type_ids, v_temp_id);
  
  v_temp_id := gen_random_uuid();
  INSERT INTO sp_product_types (_id, tenant_id, industry_id, code, name, description, status, created_at, updated_at)
  VALUES (v_temp_id, v_tenant_id, v_industry_fashion, 'BAG', 'Túi xách', 'Balo, túi đeo, ví...', 1, now(), now());
  v_product_type_ids := array_append(v_product_type_ids, v_temp_id);
  
  v_temp_id := gen_random_uuid();
  INSERT INTO sp_product_types (_id, tenant_id, industry_id, code, name, description, status, created_at, updated_at)
  VALUES (v_temp_id, v_tenant_id, v_industry_fashion, 'WATCH', 'Đồng hồ', 'Đồng hồ đeo tay', 0, now(), now()); -- inactive
  v_product_type_ids := array_append(v_product_type_ids, v_temp_id);
  
  v_temp_id := gen_random_uuid();
  INSERT INTO sp_product_types (_id, tenant_id, industry_id, code, name, description, status, created_at, updated_at)
  VALUES (v_temp_id, v_tenant_id, v_industry_fashion, 'JEWELRY', 'Trang sức', 'Nhẫn, vòng, dây chuyền...', 1, now(), now());
  v_product_type_ids := array_append(v_product_type_ids, v_temp_id);
  
  -- F&B types (5)
  v_temp_id := gen_random_uuid();
  INSERT INTO sp_product_types (_id, tenant_id, industry_id, code, name, description, status, created_at, updated_at)
  VALUES (v_temp_id, v_tenant_id, v_industry_fnb, 'BEVERAGE', 'Đồ uống', 'Nước ngọt, cafe, trà...', 1, now(), now());
  v_product_type_ids := array_append(v_product_type_ids, v_temp_id);
  
  v_temp_id := gen_random_uuid();
  INSERT INTO sp_product_types (_id, tenant_id, industry_id, code, name, description, status, created_at, updated_at)
  VALUES (v_temp_id, v_tenant_id, v_industry_fnb, 'FOOD', 'Đồ ăn', 'Món chính, món phụ...', 1, now(), now());
  v_product_type_ids := array_append(v_product_type_ids, v_temp_id);
  
  v_temp_id := gen_random_uuid();
  INSERT INTO sp_product_types (_id, tenant_id, industry_id, code, name, description, status, created_at, updated_at)
  VALUES (v_temp_id, v_tenant_id, v_industry_fnb, 'DESSERT', 'Tráng miệng', 'Bánh ngọt, kem, chè...', 1, now(), now());
  v_product_type_ids := array_append(v_product_type_ids, v_temp_id);
  
  v_temp_id := gen_random_uuid();
  INSERT INTO sp_product_types (_id, tenant_id, industry_id, code, name, description, status, created_at, updated_at)
  VALUES (v_temp_id, v_tenant_id, v_industry_fnb, 'SNACK', 'Đồ ăn vặt', 'Snack, kẹo, chocolate...', 1, now(), now());
  v_product_type_ids := array_append(v_product_type_ids, v_temp_id);
  
  v_temp_id := gen_random_uuid();
  INSERT INTO sp_product_types (_id, tenant_id, industry_id, code, name, description, status, created_at, updated_at)
  VALUES (v_temp_id, v_tenant_id, v_industry_fnb, 'ALCOHOL', 'Đồ uống có cồn', 'Rượu, bia, cocktail...', 1, now(), now());
  v_product_type_ids := array_append(v_product_type_ids, v_temp_id);
  
  -- Retail types (4)
  v_temp_id := gen_random_uuid();
  INSERT INTO sp_product_types (_id, tenant_id, industry_id, code, name, description, status, created_at, updated_at)
  VALUES (v_temp_id, v_tenant_id, v_industry_retail, 'ELECTRONICS', 'Điện tử', 'Điện thoại, laptop, tablet...', 1, now(), now());
  v_product_type_ids := array_append(v_product_type_ids, v_temp_id);
  
  v_temp_id := gen_random_uuid();
  INSERT INTO sp_product_types (_id, tenant_id, industry_id, code, name, description, status, created_at, updated_at)
  VALUES (v_temp_id, v_tenant_id, v_industry_retail, 'HOMEAPPLIANCE', 'Gia dụng', 'Máy giặt, tủ lạnh, quạt...', 1, now(), now());
  v_product_type_ids := array_append(v_product_type_ids, v_temp_id);
  
  v_temp_id := gen_random_uuid();
  INSERT INTO sp_product_types (_id, tenant_id, industry_id, code, name, description, status, created_at, updated_at)
  VALUES (v_temp_id, v_tenant_id, v_industry_retail, 'COSMETIC', 'Mỹ phẩm', 'Kem dưỡng, son, nước hoa...', 1, now(), now());
  v_product_type_ids := array_append(v_product_type_ids, v_temp_id);
  
  v_temp_id := gen_random_uuid();
  INSERT INTO sp_product_types (_id, tenant_id, industry_id, code, name, description, status, created_at, updated_at)
  VALUES (v_temp_id, v_tenant_id, v_industry_retail, 'STATIONERY', 'Văn phòng phẩm', 'Bút, vở, giấy in...', 0, now(), now()); -- inactive
  v_product_type_ids := array_append(v_product_type_ids, v_temp_id);
  
  RAISE NOTICE '✅ Product types created: % records', array_length(v_product_type_ids, 1);
  
  -- =====================================================
  -- 3) INSERT PRODUCT CATEGORIES (15 records: 5 root + 10 child)
  -- =====================================================
  RAISE NOTICE '📁 Creating product categories (5 root + 10 child)...';
  
  -- ROOT CATEGORIES (5)
  v_temp_id := gen_random_uuid();
  INSERT INTO sp_product_categories (_id, tenant_id, industry_id, code, name, parent_id, path, level, sort_order, status, created_at, updated_at)
  VALUES (v_temp_id, v_tenant_id, v_industry_fashion, 'CAT-MENS', 'Thời trang nam', NULL, '/CAT-MENS', 0, 1, 1, now(), now());
  v_root_category_ids := array_append(v_root_category_ids, v_temp_id);
  v_category_ids := array_append(v_category_ids, v_temp_id);
  
  v_temp_id := gen_random_uuid();
  INSERT INTO sp_product_categories (_id, tenant_id, industry_id, code, name, parent_id, path, level, sort_order, status, created_at, updated_at)
  VALUES (v_temp_id, v_tenant_id, v_industry_fashion, 'CAT-WOMENS', 'Thời trang nữ', NULL, '/CAT-WOMENS', 0, 2, 1, now(), now());
  v_root_category_ids := array_append(v_root_category_ids, v_temp_id);
  v_category_ids := array_append(v_category_ids, v_temp_id);
  
  v_temp_id := gen_random_uuid();
  INSERT INTO sp_product_categories (_id, tenant_id, industry_id, code, name, parent_id, path, level, sort_order, status, created_at, updated_at)
  VALUES (v_temp_id, v_tenant_id, v_industry_fashion, 'CAT-KIDS', 'Thời trang trẻ em', NULL, '/CAT-KIDS', 0, 3, 1, now(), now());
  v_root_category_ids := array_append(v_root_category_ids, v_temp_id);
  v_category_ids := array_append(v_category_ids, v_temp_id);
  
  v_temp_id := gen_random_uuid();
  INSERT INTO sp_product_categories (_id, tenant_id, industry_id, code, name, parent_id, path, level, sort_order, status, created_at, updated_at)
  VALUES (v_temp_id, v_tenant_id, v_industry_fnb, 'CAT-DRINK', 'Đồ uống', NULL, '/CAT-DRINK', 0, 4, 1, now(), now());
  v_root_category_ids := array_append(v_root_category_ids, v_temp_id);
  v_category_ids := array_append(v_category_ids, v_temp_id);
  
  v_temp_id := gen_random_uuid();
  INSERT INTO sp_product_categories (_id, tenant_id, industry_id, code, name, parent_id, path, level, sort_order, status, created_at, updated_at)
  VALUES (v_temp_id, v_tenant_id, v_industry_retail, 'CAT-TECH', 'Công nghệ', NULL, '/CAT-TECH', 0, 5, 1, now(), now());
  v_root_category_ids := array_append(v_root_category_ids, v_temp_id);
  v_category_ids := array_append(v_category_ids, v_temp_id);
  
  -- CHILD CATEGORIES (10) - 2 children per root
  FOR i IN 1..5 LOOP
    v_parent_id := v_root_category_ids[i];
    
    -- Get parent code and path
    SELECT code, path INTO v_parent_code, v_parent_path
    FROM sp_product_categories WHERE _id = v_parent_id;
    
    -- Child 1
    v_temp_id := gen_random_uuid();
    INSERT INTO sp_product_categories (_id, tenant_id, industry_id, code, name, parent_id, path, level, sort_order, status, created_at, updated_at)
    VALUES (
      v_temp_id, 
      v_tenant_id, 
      (SELECT industry_id FROM sp_product_categories WHERE _id = v_parent_id),
      v_parent_code || '-CHILD1', 
      'Danh mục con ' || i || '.1',
      v_parent_id,
      v_parent_path || '/' || v_parent_code || '-CHILD1',
      1,
      i * 10 + 1,
      1,
      now(),
      now()
    );
    v_category_ids := array_append(v_category_ids, v_temp_id);
    
    -- Child 2
    v_temp_id := gen_random_uuid();
    INSERT INTO sp_product_categories (_id, tenant_id, industry_id, code, name, parent_id, path, level, sort_order, status, created_at, updated_at)
    VALUES (
      v_temp_id,
      v_tenant_id,
      (SELECT industry_id FROM sp_product_categories WHERE _id = v_parent_id),
      v_parent_code || '-CHILD2',
      'Danh mục con ' || i || '.2',
      v_parent_id,
      v_parent_path || '/' || v_parent_code || '-CHILD2',
      1,
      i * 10 + 2,
      CASE WHEN i = 5 THEN 0 ELSE 1 END, -- Last child inactive
      now(),
      now()
    );
    v_category_ids := array_append(v_category_ids, v_temp_id);
  END LOOP;
  
  RAISE NOTICE '✅ Categories created: % records (5 root + 10 child)', array_length(v_category_ids, 1);
  
  -- =====================================================
  -- 4) INSERT PRODUCTS (15 records)
  -- =====================================================
  RAISE NOTICE '🛍️ Creating 15 products...';
  
  -- Product 1: Áo thun cotton nam
  v_temp_id := gen_random_uuid();
  INSERT INTO sp_products (
    _id, tenant_id, industry_id, product_type_id, product_category_id,
    code, title, brief, content, price, prices, quantity, waiting_quantity,
    is_sold_out, status, image, other_images, created_at, updated_at, deleted_at
  ) VALUES (
    v_temp_id, v_tenant_id, v_industry_fashion,
    v_product_type_ids[1], -- CLOTHING
    v_category_ids[1], -- CAT-MENS
    'PRD-0001',
    'Áo thun cotton nam basic',
    'Áo thun 100% cotton cao cấp, thoáng mát',
    '<p>Chất liệu cotton cao cấp, form dáng regular fit phù hợp mọi vóc dáng</p>',
    199000,
    '{"vnd": 199000, "usd": 7.96}'::jsonb,
    150,
    10,
    false,
    1,
    'https://picsum.photos/seed/PRD-0001/600/600',
    '["https://picsum.photos/seed/PRD-0001-1/600/600", "https://picsum.photos/seed/PRD-0001-2/600/600", "https://picsum.photos/seed/PRD-0001-3/600/600"]'::jsonb,
    now(), now(), NULL
  );
  v_product_ids := array_append(v_product_ids, v_temp_id);
  
  -- Product 2: Giày sneaker nữ
  v_temp_id := gen_random_uuid();
  INSERT INTO sp_products (
    _id, tenant_id, industry_id, product_type_id, product_category_id,
    code, title, brief, content, price, prices, quantity, waiting_quantity,
    is_sold_out, status, image, other_images, created_at, updated_at, deleted_at
  ) VALUES (
    v_temp_id, v_tenant_id, v_industry_fashion,
    v_product_type_ids[2], -- SHOES
    v_category_ids[2], -- CAT-WOMENS
    'PRD-0002',
    'Giày sneaker nữ thời trang',
    'Sneaker đế cao êm ái, phong cách Hàn Quốc',
    '<p>Chất liệu da PU cao cấp, đế cao 5cm giúp tăng chiều cao</p>',
    899000,
    '{"vnd": 899000, "usd": 35.96}'::jsonb,
    80,
    5,
    false,
    1,
    'https://picsum.photos/seed/PRD-0002/600/600',
    '["https://picsum.photos/seed/PRD-0002-1/600/600", "https://picsum.photos/seed/PRD-0002-2/600/600"]'::jsonb,
    now(), now(), NULL
  );
  v_product_ids := array_append(v_product_ids, v_temp_id);
  
  -- Product 3: Túi xách nữ da thật
  v_temp_id := gen_random_uuid();
  INSERT INTO sp_products (
    _id, tenant_id, industry_id, product_type_id, product_category_id,
    code, title, brief, content, price, prices, quantity, waiting_quantity,
    is_sold_out, status, image, other_images, created_at, updated_at, deleted_at
  ) VALUES (
    v_temp_id, v_tenant_id, v_industry_fashion,
    v_product_type_ids[4], -- BAG
    v_category_ids[2], -- CAT-WOMENS
    'PRD-0003',
    'Túi xách nữ da thật cao cấp',
    'Túi da bò thật 100%, sang trọng',
    '<p>Da bò thật Italy, đường may tỉ mỉ, khóa kim loại cao cấp</p>',
    1500000,
    '{"vnd": 1500000, "usd": 60.00}'::jsonb,
    25,
    0,
    false,
    1,
    'https://picsum.photos/seed/PRD-0003/600/600',
    '["https://picsum.photos/seed/PRD-0003-1/600/600", "https://picsum.photos/seed/PRD-0003-2/600/600", "https://picsum.photos/seed/PRD-0003-3/600/600", "https://picsum.photos/seed/PRD-0003-4/600/600"]'::jsonb,
    now(), now(), NULL
  );
  v_product_ids := array_append(v_product_ids, v_temp_id);
  
  -- Product 4: Quần jean nam (HẾT HÀNG)
  v_temp_id := gen_random_uuid();
  INSERT INTO sp_products (
    _id, tenant_id, industry_id, product_type_id, product_category_id,
    code, title, brief, content, price, prices, quantity, waiting_quantity,
    is_sold_out, status, image, other_images, created_at, updated_at, deleted_at
  ) VALUES (
    v_temp_id, v_tenant_id, v_industry_fashion,
    v_product_type_ids[1], -- CLOTHING
    v_category_ids[1], -- CAT-MENS
    'PRD-0004',
    'Quần jean nam slim fit',
    'Jean co giãn, ôm dáng thanh lịch',
    '<p>Chất jean cao cấp co giãn 4 chiều, form slim fit hiện đại</p>',
    599000,
    '{"vnd": 599000, "usd": 23.96}'::jsonb,
    0, -- HẾT HÀNG
    20,
    true, -- IS_SOLD_OUT
    1,
    'https://picsum.photos/seed/PRD-0004/600/600',
    '["https://picsum.photos/seed/PRD-0004-1/600/600"]'::jsonb,
    now(), now(), NULL
  );
  v_product_ids := array_append(v_product_ids, v_temp_id);
  
  -- Product 5: Đầm dự tiệc (No type, no category)
  v_temp_id := gen_random_uuid();
  INSERT INTO sp_products (
    _id, tenant_id, industry_id, product_type_id, product_category_id,
    code, title, brief, content, price, prices, quantity, waiting_quantity,
    is_sold_out, status, image, other_images, created_at, updated_at, deleted_at
  ) VALUES (
    v_temp_id, v_tenant_id, v_industry_fashion,
    NULL, -- No type
    NULL, -- No category
    'PRD-0005',
    'Đầm dự tiệc sang trọng',
    'Đầm xòe công chúa, phù hợp dự tiệc',
    '<p>Thiết kế xòe nhẹ nhàng, chất liệu voan cao cấp</p>',
    1200000,
    '{"vnd": 1200000, "usd": 48.00}'::jsonb,
    35,
    0,
    false,
    1,
    'https://picsum.photos/seed/PRD-0005/600/600',
    '["https://picsum.photos/seed/PRD-0005-1/600/600", "https://picsum.photos/seed/PRD-0005-2/600/600"]'::jsonb,
    now(), now(), NULL
  );
  v_product_ids := array_append(v_product_ids, v_temp_id);
  
  -- Product 6: Áo khoác trẻ em
  v_temp_id := gen_random_uuid();
  INSERT INTO sp_products (
    _id, tenant_id, industry_id, product_type_id, product_category_id,
    code, title, brief, content, price, prices, quantity, waiting_quantity,
    is_sold_out, status, image, other_images, created_at, updated_at, deleted_at
  ) VALUES (
    v_temp_id, v_tenant_id, v_industry_fashion,
    v_product_type_ids[1], -- CLOTHING
    v_category_ids[3], -- CAT-KIDS
    'PRD-0006',
    'Áo khoác gió trẻ em',
    'Áo khoác chống nắng cho bé',
    '<p>Vải polyester nhẹ, thoáng mát, màu sắc đa dạng</p>',
    299000,
    '{"vnd": 299000, "usd": 11.96}'::jsonb,
    120,
    15,
    false,
    1,
    'https://picsum.photos/seed/PRD-0006/600/600',
    '["https://picsum.photos/seed/PRD-0006-1/600/600", "https://picsum.photos/seed/PRD-0006-2/600/600", "https://picsum.photos/seed/PRD-0006-3/600/600"]'::jsonb,
    now(), now(), NULL
  );
  v_product_ids := array_append(v_product_ids, v_temp_id);
  
  -- Product 7: Cafe sữa đá (F&B)
  v_temp_id := gen_random_uuid();
  INSERT INTO sp_products (
    _id, tenant_id, industry_id, product_type_id, product_category_id,
    code, title, brief, content, price, prices, quantity, waiting_quantity,
    is_sold_out, status, image, other_images, created_at, updated_at, deleted_at
  ) VALUES (
    v_temp_id, v_tenant_id, v_industry_fnb,
    v_product_type_ids[7], -- BEVERAGE
    v_category_ids[4], -- CAT-DRINK
    'PRD-0007',
    'Cafe sữa đá truyền thống',
    'Cafe phin Việt Nam chính gốc',
    '<p>Hạt cafe Robusta rang mộc, sữa đặc truyền thống</p>',
    35000,
    '{"vnd": 35000, "usd": 1.40}'::jsonb,
    200,
    50,
    false,
    1,
    'https://picsum.photos/seed/PRD-0007/600/600',
    '["https://picsum.photos/seed/PRD-0007-1/600/600"]'::jsonb,
    now(), now(), NULL
  );
  v_product_ids := array_append(v_product_ids, v_temp_id);
  
  -- Product 8: Trà sữa trân châu (F&B)
  v_temp_id := gen_random_uuid();
  INSERT INTO sp_products (
    _id, tenant_id, industry_id, product_type_id, product_category_id,
    code, title, brief, content, price, prices, quantity, waiting_quantity,
    is_sold_out, status, image, other_images, created_at, updated_at, deleted_at
  ) VALUES (
    v_temp_id, v_tenant_id, v_industry_fnb,
    v_product_type_ids[7], -- BEVERAGE
    v_category_ids[4], -- CAT-DRINK
    'PRD-0008',
    'Trà sữa trân châu đường đen',
    'Trà sữa Đài Loan nguyên bản',
    '<p>Trà Oolong cao cấp, trân châu đen mềm dai, sữa tươi Úc</p>',
    55000,
    '{"vnd": 55000, "usd": 2.20}'::jsonb,
    180,
    30,
    false,
    1,
    'https://picsum.photos/seed/PRD-0008/600/600',
    '["https://picsum.photos/seed/PRD-0008-1/600/600", "https://picsum.photos/seed/PRD-0008-2/600/600"]'::jsonb,
    now(), now(), NULL
  );
  v_product_ids := array_append(v_product_ids, v_temp_id);
  
  -- Product 9: Bánh Tiramisu (F&B, hết hàng)
  v_temp_id := gen_random_uuid();
  INSERT INTO sp_products (
    _id, tenant_id, industry_id, product_type_id, product_category_id,
    code, title, brief, content, price, prices, quantity, waiting_quantity,
    is_sold_out, status, image, other_images, created_at, updated_at, deleted_at
  ) VALUES (
    v_temp_id, v_tenant_id, v_industry_fnb,
    v_product_type_ids[9], -- DESSERT
    NULL, -- No category
    'PRD-0009',
    'Bánh Tiramisu Italy',
    'Tiramisu chuẩn vị Ý',
    '<p>Bánh Tiramisu làm từ phô mai Mascarpone nhập khẩu</p>',
    120000,
    '{"vnd": 120000, "usd": 4.80}'::jsonb,
    0, -- HẾT HÀNG
    0,
    true,
    1,
    'https://picsum.photos/seed/PRD-0009/600/600',
    '["https://picsum.photos/seed/PRD-0009-1/600/600"]'::jsonb,
    now(), now(), NULL
  );
  v_product_ids := array_append(v_product_ids, v_temp_id);
  
  -- Product 10: Laptop Dell (Retail)
  v_temp_id := gen_random_uuid();
  INSERT INTO sp_products (
    _id, tenant_id, industry_id, product_type_id, product_category_id,
    code, title, brief, content, price, prices, quantity, waiting_quantity,
    is_sold_out, status, image, other_images, created_at, updated_at, deleted_at
  ) VALUES (
    v_temp_id, v_tenant_id, v_industry_retail,
    v_product_type_ids[12], -- ELECTRONICS
    v_category_ids[5], -- CAT-TECH
    'PRD-0010',
    'Laptop Dell Inspiron 15',
    'Laptop văn phòng giá tốt',
    '<p>Intel Core i5, RAM 8GB, SSD 256GB, màn 15.6 inch Full HD</p>',
    15000000,
    '{"vnd": 15000000, "usd": 600.00}'::jsonb,
    12,
    0,
    false,
    1,
    'https://picsum.photos/seed/PRD-0010/600/600',
    '["https://picsum.photos/seed/PRD-0010-1/600/600", "https://picsum.photos/seed/PRD-0010-2/600/600", "https://picsum.photos/seed/PRD-0010-3/600/600"]'::jsonb,
    now(), now(), NULL
  );
  v_product_ids := array_append(v_product_ids, v_temp_id);
  
  -- Product 11: Kem dưỡng ẩm (Retail)
  v_temp_id := gen_random_uuid();
  INSERT INTO sp_products (
    _id, tenant_id, industry_id, product_type_id, product_category_id,
    code, title, brief, content, price, prices, quantity, waiting_quantity,
    is_sold_out, status, image, other_images, created_at, updated_at, deleted_at
  ) VALUES (
    v_temp_id, v_tenant_id, v_industry_retail,
    v_product_type_ids[14], -- COSMETIC
    NULL,
    'PRD-0011',
    'Kem dưỡng ẩm Neutrogena',
    'Kem dưỡng cho da khô',
    '<p>Công thức Hydro Boost giúp cấp ẩm sâu 72h</p>',
    450000,
    '{"vnd": 450000, "usd": 18.00}'::jsonb,
    65,
    10,
    false,
    1,
    'https://picsum.photos/seed/PRD-0011/600/600',
    '["https://picsum.photos/seed/PRD-0011-1/600/600", "https://picsum.photos/seed/PRD-0011-2/600/600"]'::jsonb,
    now(), now(), NULL
  );
  v_product_ids := array_append(v_product_ids, v_temp_id);
  
  -- Product 12: Áo sơ mi nam (Inactive)
  v_temp_id := gen_random_uuid();
  INSERT INTO sp_products (
    _id, tenant_id, industry_id, product_type_id, product_category_id,
    code, title, brief, content, price, prices, quantity, waiting_quantity,
    is_sold_out, status, image, other_images, created_at, updated_at, deleted_at
  ) VALUES (
    v_temp_id, v_tenant_id, v_industry_fashion,
    v_product_type_ids[1], -- CLOTHING
    v_category_ids[1], -- CAT-MENS
    'PRD-0012',
    'Áo sơ mi nam công sở',
    'Sơ mi trắng lịch sự',
    '<p>Chất liệu cotton pha, chống nhăn, dễ giặt</p>',
    350000,
    '{"vnd": 350000, "usd": 14.00}'::jsonb,
    45,
    5,
    false,
    0, -- INACTIVE
    'https://picsum.photos/seed/PRD-0012/600/600',
    '["https://picsum.photos/seed/PRD-0012-1/600/600"]'::jsonb,
    now(), now(), NULL
  );
  v_product_ids := array_append(v_product_ids, v_temp_id);
  
  -- Product 13: Váy midi nữ
  v_temp_id := gen_random_uuid();
  INSERT INTO sp_products (
    _id, tenant_id, industry_id, product_type_id, product_category_id,
    code, title, brief, content, price, prices, quantity, waiting_quantity,
    is_sold_out, status, image, other_images, created_at, updated_at, deleted_at
  ) VALUES (
    v_temp_id, v_tenant_id, v_industry_fashion,
    NULL, -- No type
    v_category_ids[2], -- CAT-WOMENS
    'PRD-0013',
    'Váy midi dáng xòe',
    'Váy công sở thanh lịch',
    '<p>Thiết kế xòe nhẹ, độ dài qua gối, phù hợp đi làm</p>',
    520000,
    '{"vnd": 520000, "usd": 20.80}'::jsonb,
    95,
    8,
    false,
    1,
    'https://picsum.photos/seed/PRD-0013/600/600',
    '["https://picsum.photos/seed/PRD-0013-1/600/600", "https://picsum.photos/seed/PRD-0013-2/600/600", "https://picsum.photos/seed/PRD-0013-3/600/600"]'::jsonb,
    now(), now(), NULL
  );
  v_product_ids := array_append(v_product_ids, v_temp_id);
  
  -- Product 14: Nước hoa Chanel (Retail)
  v_temp_id := gen_random_uuid();
  INSERT INTO sp_products (
    _id, tenant_id, industry_id, product_type_id, product_category_id,
    code, title, brief, content, price, prices, quantity, waiting_quantity,
    is_sold_out, status, image, other_images, created_at, updated_at, deleted_at
  ) VALUES (
    v_temp_id, v_tenant_id, v_industry_retail,
    v_product_type_ids[14], -- COSMETIC
    NULL,
    'PRD-0014',
    'Nước hoa Chanel No.5',
    'Nước hoa cao cấp cho phụ nữ',
    '<p>Hương thơm kinh điển, lưu hương lâu, chai 100ml</p>',
    3500000,
    '{"vnd": 3500000, "usd": 140.00}'::jsonb,
    8,
    0,
    false,
    1,
    'https://picsum.photos/seed/PRD-0014/600/600',
    '["https://picsum.photos/seed/PRD-0014-1/600/600", "https://picsum.photos/seed/PRD-0014-2/600/600", "https://picsum.photos/seed/PRD-0014-3/600/600", "https://picsum.photos/seed/PRD-0014-4/600/600"]'::jsonb,
    now(), now(), NULL
  );
  v_product_ids := array_append(v_product_ids, v_temp_id);
  
  -- Product 15: Nón lưỡi trai
  v_temp_id := gen_random_uuid();
  INSERT INTO sp_products (
    _id, tenant_id, industry_id, product_type_id, product_category_id,
    code, title, brief, content, price, prices, quantity, waiting_quantity,
    is_sold_out, status, image, other_images, created_at, updated_at, deleted_at
  ) VALUES (
    v_temp_id, v_tenant_id, v_industry_fashion,
    v_product_type_ids[3], -- ACCESSORY
    v_category_ids[1], -- CAT-MENS
    'PRD-0015',
    'Nón lưỡi trai thể thao',
    'Nón kaki chống nắng',
    '<p>Vải kaki cao cấp, form cứng cáp, nhiều màu sắc</p>',
    89000,
    '{"vnd": 89000, "usd": 3.56}'::jsonb,
    200,
    25,
    false,
    1,
    'https://picsum.photos/seed/PRD-0015/600/600',
    '["https://picsum.photos/seed/PRD-0015-1/600/600", "https://picsum.photos/seed/PRD-0015-2/600/600"]'::jsonb,
    now(), now(), NULL
  );
  v_product_ids := array_append(v_product_ids, v_temp_id);
  
  RAISE NOTICE '✅ Products created: % records', array_length(v_product_ids, 1);
  
  -- =====================================================
  -- 5) INSERT PRODUCT VARIANTS (15 records total)
  -- =====================================================
  RAISE NOTICE '🎨 Creating product variants (15 total)...';
  
  -- Variants for Product 1 (Áo thun) - 3 variants
  INSERT INTO sp_product_variants (
    _id, tenant_id, industry_id, product_id, code, title,
    price, prices, quantity, waiting_quantity, status, is_sold_out,
    created_at, updated_at, deleted_at
  ) VALUES
    (gen_random_uuid(), v_tenant_id, v_industry_fashion, v_product_ids[1], 'SIZE-S', 'Size S', 199000, '{"vnd": 199000, "usd": 7.96}'::jsonb, 50, 5, 1, false, now(), now(), NULL),
    (gen_random_uuid(), v_tenant_id, v_industry_fashion, v_product_ids[1], 'SIZE-M', 'Size M', 199000, '{"vnd": 199000, "usd": 7.96}'::jsonb, 60, 3, 1, false, now(), now(), NULL),
    (gen_random_uuid(), v_tenant_id, v_industry_fashion, v_product_ids[1], 'SIZE-L', 'Size L', 199000, '{"vnd": 199000, "usd": 7.96}'::jsonb, 40, 2, 1, false, now(), now(), NULL);
  
  -- Variants for Product 2 (Giày sneaker) - 3 variants
  INSERT INTO sp_product_variants (
    _id, tenant_id, industry_id, product_id, code, title,
    price, prices, quantity, waiting_quantity, status, is_sold_out,
    created_at, updated_at, deleted_at
  ) VALUES
    (gen_random_uuid(), v_tenant_id, v_industry_fashion, v_product_ids[2], 'SIZE-36', 'Size 36', 899000, '{"vnd": 899000, "usd": 35.96}'::jsonb, 25, 0, 1, false, now(), now(), NULL),
    (gen_random_uuid(), v_tenant_id, v_industry_fashion, v_product_ids[2], 'SIZE-37', 'Size 37', 899000, '{"vnd": 899000, "usd": 35.96}'::jsonb, 30, 2, 1, false, now(), now(), NULL),
    (gen_random_uuid(), v_tenant_id, v_industry_fashion, v_product_ids[2], 'SIZE-38', 'Size 38', 899000, '{"vnd": 899000, "usd": 35.96}'::jsonb, 25, 3, 1, false, now(), now(), NULL);
  
  -- Variants for Product 3 (Túi xách) - 2 variants
  INSERT INTO sp_product_variants (
    _id, tenant_id, industry_id, product_id, code, title,
    price, prices, quantity, waiting_quantity, status, is_sold_out,
    created_at, updated_at, deleted_at
  ) VALUES
    (gen_random_uuid(), v_tenant_id, v_industry_fashion, v_product_ids[3], 'COLOR-BLACK', 'Màu đen', 1500000, '{"vnd": 1500000, "usd": 60.00}'::jsonb, 15, 0, 1, false, now(), now(), NULL),
    (gen_random_uuid(), v_tenant_id, v_industry_fashion, v_product_ids[3], 'COLOR-BROWN', 'Màu nâu', 1500000, '{"vnd": 1500000, "usd": 60.00}'::jsonb, 10, 0, 1, false, now(), now(), NULL);
  
  -- Variants for Product 7 (Cafe) - 2 variants
  INSERT INTO sp_product_variants (
    _id, tenant_id, industry_id, product_id, code, title,
    price, prices, quantity, waiting_quantity, status, is_sold_out,
    created_at, updated_at, deleted_at
  ) VALUES
    (gen_random_uuid(), v_tenant_id, v_industry_fnb, v_product_ids[7], 'SIZE-M', 'Size M', 35000, '{"vnd": 35000, "usd": 1.40}'::jsonb, 100, 25, 1, false, now(), now(), NULL),
    (gen_random_uuid(), v_tenant_id, v_industry_fnb, v_product_ids[7], 'SIZE-L', 'Size L', 45000, '{"vnd": 45000, "usd": 1.80}'::jsonb, 100, 25, 1, false, now(), now(), NULL);
  
  -- Variants for Product 8 (Trà sữa) - 3 variants
  INSERT INTO sp_product_variants (
    _id, tenant_id, industry_id, product_id, code, title,
    price, prices, quantity, waiting_quantity, status, is_sold_out,
    created_at, updated_at, deleted_at
  ) VALUES
    (gen_random_uuid(), v_tenant_id, v_industry_fnb, v_product_ids[8], 'SIZE-S', 'Size S (Nhỏ)', 45000, '{"vnd": 45000, "usd": 1.80}'::jsonb, 60, 10, 1, false, now(), now(), NULL),
    (gen_random_uuid(), v_tenant_id, v_industry_fnb, v_product_ids[8], 'SIZE-M', 'Size M (Vừa)', 55000, '{"vnd": 55000, "usd": 2.20}'::jsonb, 70, 10, 1, false, now(), now(), NULL),
    (gen_random_uuid(), v_tenant_id, v_industry_fnb, v_product_ids[8], 'SIZE-L', 'Size L (Lớn)', 65000, '{"vnd": 65000, "usd": 2.60}'::jsonb, 50, 10, 1, false, now(), now(), NULL);
  
  -- Variants for Product 15 (Nón) - 2 variants (HẾT HÀNG)
  INSERT INTO sp_product_variants (
    _id, tenant_id, industry_id, product_id, code, title,
    price, prices, quantity, waiting_quantity, status, is_sold_out,
    created_at, updated_at, deleted_at
  ) VALUES
    (gen_random_uuid(), v_tenant_id, v_industry_fashion, v_product_ids[15], 'COLOR-BLACK', 'Màu đen', 89000, '{"vnd": 89000, "usd": 3.56}'::jsonb, 0, 10, 1, true, now(), now(), NULL), -- HẾT HÀNG
    (gen_random_uuid(), v_tenant_id, v_industry_fashion, v_product_ids[15], 'COLOR-NAVY', 'Màu xanh navy', 89000, '{"vnd": 89000, "usd": 3.56}'::jsonb, 200, 15, 1, false, now(), now(), NULL);
  
  RAISE NOTICE '✅ Product variants created: 15 records';
  
  -- =====================================================
  -- SUMMARY
  -- =====================================================
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ MOCK DATA GENERATION COMPLETED!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '📊 Tenant ID: %', v_tenant_id;
  RAISE NOTICE '';
  RAISE NOTICE '📋 Summary:';
  RAISE NOTICE '  • Industries: 15 records';
  RAISE NOTICE '  • Product Types: 15 records';
  RAISE NOTICE '  • Product Categories: 15 records (5 root + 10 child)';
  RAISE NOTICE '  • Products: 15 records';
  RAISE NOTICE '  • Product Variants: 15 records';
  RAISE NOTICE '';
  RAISE NOTICE '🔗 Relationships:';
  RAISE NOTICE '  • All data linked to tenant: %', v_tenant_id;
  RAISE NOTICE '  • Product Types → Industries: ✓';
  RAISE NOTICE '  • Categories → Industries: ✓';
  RAISE NOTICE '  • Categories → Parent/Child tree: ✓';
  RAISE NOTICE '  • Products → Industries: ✓';
  RAISE NOTICE '  • Products → Types (70%% coverage): ✓';
  RAISE NOTICE '  • Products → Categories (80%% coverage): ✓';
  RAISE NOTICE '  • Variants → Products: ✓';
  RAISE NOTICE '';
  RAISE NOTICE '💡 Test Data Features:';
  RAISE NOTICE '  • Price range: 35,000 - 3,500,000 VND';
  RAISE NOTICE '  • Quantity range: 0 - 200';
  RAISE NOTICE '  • Sold out products: 3 records';
  RAISE NOTICE '  • Inactive products: 1 record';
  RAISE NOTICE '  • Images: picsum.photos URLs';
  RAISE NOTICE '  • Multi-currency: VND + USD';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Ready for testing!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  
END $$;
