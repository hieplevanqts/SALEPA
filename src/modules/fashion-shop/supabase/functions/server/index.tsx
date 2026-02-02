import { Hono } from 'npm:hono@4';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { uuidv7 } from 'npm:uuidv7';
import { TABLES } from './table-config.tsx';

// Helper to generate UUID V7 (time-sortable)
function generateUUID(): string {
  return uuidv7();
}

// Helper to generate code from name
function generateCode(name: string): string {
  return name
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/Đ/g, 'D')
    .replace(/đ/g, 'd')
    .replace(/[^A-Z0-9]/g, '') // Remove special chars
    .substring(0, 20); // Max 20 chars
}

// Helper to sanitize code
function sanitizeCode(code: string): string {
  return code
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '') // Remove special chars
    .substring(0, 20);
}

const app = new Hono();

// Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://lbwtydexbrucqtwjzkai.supabase.co';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

if (!supabaseServiceKey && !supabaseAnonKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY is required!');
}

// Use service role key to bypass RLS policies
const supabaseKey = supabaseServiceKey || supabaseAnonKey!;
console.log('🔑 Using Supabase key type:', supabaseServiceKey ? 'SERVICE_ROLE' : 'ANON');
console.log('📍 Supabase URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to serialize errors
function serializeError(error: any): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'object' && error !== null) {
    return JSON.stringify(error);
  }
  return String(error);
}

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Health check
app.get('/make-server-4198d50c/health', (c) => {
  return c.json({ 
    status: 'ok', 
    message: 'POS API Server is running',
    timestamp: new Date().toISOString(),
    tables: TABLES
  });
});

// Diagnostic endpoint to check auth config
app.get('/make-server-4198d50c/debug-auth', (c) => {
  return c.json({
    hasServiceKey: !!supabaseServiceKey,
    hasAnonKey: !!supabaseAnonKey,
    usingKeyType: supabaseServiceKey ? 'SERVICE_ROLE' : 'ANON',
    supabaseUrl: supabaseUrl,
    serviceKeyPrefix: supabaseServiceKey ? supabaseServiceKey.substring(0, 20) + '...' : 'NOT SET',
  });
});

// ================================
// PRODUCT TYPES API
// ================================
app.get('/make-server-4198d50c/product-types', async (c) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.PRODUCT_TYPES)
      .select('*');
    
    if (error) {
      console.error('Supabase error fetching product types:', error);
      throw error;
    }

    return c.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Error fetching product types:', error);
    return c.json({ 
      success: false, 
      error: serializeError(error) 
    }, 500);
  }
});

app.get('/make-server-4198d50c/product-types/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const { data, error } = await supabase
      .from(TABLES.PRODUCT_TYPES)
      .select('*')
      .eq('_id', id)
      .single();
    
    if (error) {
      throw error;
    }

    if (!data) {
      return c.json({ success: false, error: 'Product type not found' }, 404);
    }

    return c.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching product type:', error);
    return c.json({ success: false, error: serializeError(error) }, 500);
  }
});

app.post('/make-server-4198d50c/product-types', async (c) => {
  try {
    const body = await c.req.json();
    const id = body._id || `pt-${Date.now()}`;
    const now = new Date().toISOString();
    
    const productType = {
      _id: id,
      tenant_id: body.tenant_id || 'tenant-001',
      group_id: body.group_id || 'group-001',
      name: body.name,
      code: body.code?.toUpperCase(),
      description: body.description || null,
      status: body.status ?? 1,
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from(TABLES.PRODUCT_TYPES)
      .insert([productType])
      .select('*')
      .single();
    
    if (error) {
      throw error;
    }

    return c.json({ success: true, data }, 201);
  } catch (error) {
    console.error('Error creating product type:', error);
    return c.json({ success: false, error: serializeError(error) }, 500);
  }
});

app.put('/make-server-4198d50c/product-types/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const existing = await supabase
      .from(TABLES.PRODUCT_TYPES)
      .select('*')
      .eq('_id', id)
      .single();
    
    if (existing.error) {
      throw existing.error;
    }

    if (!existing.data) {
      return c.json({ success: false, error: 'Product type not found' }, 404);
    }

    const updated = {
      ...existing.data,
      ...body,
      _id: id,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from(TABLES.PRODUCT_TYPES)
      .update(updated)
      .eq('_id', id)
      .select('*')
      .single();
    
    if (error) {
      throw error;
    }

    return c.json({ success: true, data });
  } catch (error) {
    console.error('Error updating product type:', error);
    return c.json({ success: false, error: serializeError(error) }, 500);
  }
});

app.delete('/make-server-4198d50c/product-types/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    const { error } = await supabase
      .from(TABLES.PRODUCT_TYPES)
      .delete()
      .eq('_id', id);
    
    if (error) {
      throw error;
    }

    return c.json({ success: true, message: 'Product type deleted' });
  } catch (error) {
    console.error('Error deleting product type:', error);
    return c.json({ success: false, error: serializeError(error) }, 500);
  }
});

// ================================
// PRODUCT CATEGORIES API
// ================================
app.get('/make-server-4198d50c/product-categories', async (c) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.PRODUCT_CATEGORIES)
      .select('*');
    
    if (error) {
      console.error('Supabase error fetching product categories:', error);
      throw error;
    }

    return c.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Error fetching product categories:', error);
    return c.json({ 
      success: false, 
      error: serializeError(error)
    }, 500);
  }
});

app.get('/make-server-4198d50c/product-categories/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const { data, error } = await supabase
      .from(TABLES.PRODUCT_CATEGORIES)
      .select('*')
      .eq('_id', id)
      .single();
    
    if (error) {
      throw error;
    }

    if (!data) {
      return c.json({ success: false, error: 'Product category not found' }, 404);
    }

    return c.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching product category:', error);
    return c.json({ success: false, error: serializeError(error) }, 500);
  }
});

app.post('/make-server-4198d50c/product-categories', async (c) => {
  try {
    const body = await c.req.json();
    
    // Validate required fields
    if (!body.tenant_id || !body.industry_id || !body.name) {
      return c.json({ 
        success: false, 
        error: 'Missing required fields: tenant_id, industry_id, name' 
      }, 400);
    }
    
    const id = generateUUID();
    const now = new Date().toISOString();
    
    // Auto-generate code if missing
    const code = body.code ? sanitizeCode(body.code) : generateCode(body.name);
    
    // Calculate level and path based on parent_id
    let level = 0;
    let path = code;
    
    if (body.parent_id) {
      // Get parent category to calculate level and path
      const { data: parent, error: parentError } = await supabase
        .from(TABLES.PRODUCT_CATEGORIES)
        .select('level, path')
        .eq('_id', body.parent_id)
        .single();
      
      if (parentError) {
        console.error('Error fetching parent category:', parentError);
        return c.json({ 
          success: false, 
          error: 'Parent category not found' 
        }, 400);
      }
      
      if (parent) {
        level = (parent.level || 0) + 1;
        path = `${parent.path}/${code}`;
      }
    }
    
    const category = {
      _id: id,
      tenant_id: body.tenant_id,
      industry_id: body.industry_id,
      code: code,
      name: body.name,
      parent_id: body.parent_id || null,
      path: path,
      level: level,
      sort_order: body.sort_order ?? 0,
      status: body.status ?? 1,
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from(TABLES.PRODUCT_CATEGORIES)
      .insert([category])
      .select('*')
      .single();
    
    if (error) {
      console.error('Error inserting product category:', error);
      throw error;
    }

    return c.json({ success: true, data }, 201);
  } catch (error) {
    console.error('Error creating product category:', error);
    return c.json({ success: false, error: serializeError(error) }, 500);
  }
});

app.put('/make-server-4198d50c/product-categories/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const existing = await supabase
      .from(TABLES.PRODUCT_CATEGORIES)
      .select('*')
      .eq('_id', id)
      .single();
    
    if (existing.error) {
      throw existing.error;
    }

    if (!existing.data) {
      return c.json({ success: false, error: 'Product category not found' }, 404);
    }

    const updated = {
      ...existing.data,
      ...body,
      _id: id,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from(TABLES.PRODUCT_CATEGORIES)
      .update(updated)
      .eq('_id', id)
      .select('*')
      .single();
    
    if (error) {
      throw error;
    }

    return c.json({ success: true, data });
  } catch (error) {
    console.error('Error updating product category:', error);
    return c.json({ success: false, error: serializeError(error) }, 500);
  }
});

app.delete('/make-server-4198d50c/product-categories/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    const { error } = await supabase
      .from(TABLES.PRODUCT_CATEGORIES)
      .delete()
      .eq('_id', id);
    
    if (error) {
      throw error;
    }

    return c.json({ success: true, message: 'Product category deleted' });
  } catch (error) {
    console.error('Error deleting product category:', error);
    return c.json({ success: false, error: serializeError(error) }, 500);
  }
});

// ================================
// PRODUCT TAGS API - Return empty array since table doesn't exist
// ================================
app.get('/make-server-4198d50c/product-tags', async (c) => {
  try {
    // Table doesn't exist yet, return empty array
    console.log('Product tags table not found, returning empty array');
    return c.json({ success: true, data: [] });
  } catch (error) {
    console.error('Error fetching product tags:', error);
    return c.json({ 
      success: false, 
      error: serializeError(error)
    }, 500);
  }
});

app.get('/make-server-4198d50c/product-tags/:id', async (c) => {
  return c.json({ success: false, error: 'Product tags table not available' }, 404);
});

app.post('/make-server-4198d50c/product-tags', async (c) => {
  return c.json({ success: false, error: 'Product tags table not available' }, 501);
});

app.put('/make-server-4198d50c/product-tags/:id', async (c) => {
  return c.json({ success: false, error: 'Product tags table not available' }, 501);
});

app.delete('/make-server-4198d50c/product-tags/:id', async (c) => {
  return c.json({ success: false, error: 'Product tags table not available' }, 501);
});

// ================================
// PRODUCTS (SPU) ENDPOINTS
// ================================

// GET all products (with soft delete filter)
app.get('/make-server-4198d50c/products', async (c) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.PRODUCTS)
      .select('*')
      .is('deleted_at', null) // Exclude soft-deleted
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    return c.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Error in GET /products:', error);
    return c.json({ success: false, error: serializeError(error) }, 500);
  }
});

// GET single product by ID
app.get('/make-server-4198d50c/products/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    const { data, error } = await supabase
      .from(TABLES.PRODUCTS)
      .select('*')
      .eq('_id', id)
      .is('deleted_at', null)
      .single();
    
    if (error) {
      console.error('Error fetching product:', error);
      throw error;
    }

    return c.json({ success: true, data });
  } catch (error) {
    console.error('Error in GET /products/:id:', error);
    return c.json({ success: false, error: serializeError(error) }, 500);
  }
});

// POST create new product
app.post('/make-server-4198d50c/products', async (c) => {
  try {
    const body = await c.req.json();
    
    // Validate required fields
    if (!body.tenant_id || !body.industry_id || !body.product_type_id || !body.title) {
      return c.json({ 
        success: false, 
        error: 'Missing required fields: tenant_id, industry_id, product_type_id, title' 
      }, 400);
    }
    
    const id = generateUUID();
    const now = new Date().toISOString();
    
    // Auto-generate code if missing
    const code = body.code ? sanitizeCode(body.code) : generateCode(body.title);
    
    // Check code uniqueness per tenant
    const { data: existingProduct } = await supabase
      .from(TABLES.PRODUCTS)
      .select('_id')
      .eq('tenant_id', body.tenant_id)
      .eq('code', code)
      .is('deleted_at', null)
      .single();
    
    if (existingProduct) {
      return c.json({ 
        success: false, 
        error: `Product code '${code}' already exists for this tenant` 
      }, 400);
    }
    
    // Validate FK: product_category_id
    if (body.product_category_id) {
      const { data: categoryExists } = await supabase
        .from(TABLES.PRODUCT_CATEGORIES)
        .select('_id')
        .eq('_id', body.product_category_id)
        .single();
      
      if (!categoryExists) {
        return c.json({ 
          success: false, 
          error: 'Invalid product_category_id' 
        }, 400);
      }
    }
    
    // Validate quantity >= 0
    const quantity = Math.max(0, body.quantity || 0);
    const waitingQuantity = Math.max(0, body.waiting_quantity || 0);
    
    // Auto-calculate is_sold_out based on quantity
    // is_sold_out = TRUE when:
    // 1. quantity = 0, OR
    // 2. manually locked (body.is_sold_out = true)
    const isSoldOut = quantity === 0 || body.is_sold_out === true;
    
    const product = {
      _id: id,
      tenant_id: body.tenant_id,
      industry_id: body.industry_id,
      product_type_id: body.product_type_id,
      product_category_id: body.product_category_id || null,
      code: code,
      title: body.title,
      brief: body.brief || '',
      content: body.content || '',
      price: body.price || 0,
      prices: body.prices || null,
      quantity: quantity,
      waiting_quantity: waitingQuantity,
      status: body.status ?? 1,
      is_sold_out: isSoldOut,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };

    const { data, error } = await supabase
      .from(TABLES.PRODUCTS)
      .insert([product])
      .select('*')
      .single();
    
    if (error) {
      console.error('Error inserting product:', error);
      throw error;
    }

    return c.json({ success: true, data }, 201);
  } catch (error) {
    console.error('Error creating product:', error);
    return c.json({ success: false, error: serializeError(error) }, 500);
  }
});

// PUT update product
app.put('/make-server-4198d50c/products/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const now = new Date().toISOString();
    
    // Check if product exists and not deleted
    const { data: existingProduct } = await supabase
      .from(TABLES.PRODUCTS)
      .select('*')
      .eq('_id', id)
      .is('deleted_at', null)
      .single();
    
    if (!existingProduct) {
      return c.json({ 
        success: false, 
        error: 'Product not found' 
      }, 404);
    }
    
    // If code is being updated, check uniqueness
    if (body.code && body.code !== existingProduct.code) {
      const sanitizedCode = sanitizeCode(body.code);
      const { data: codeExists } = await supabase
        .from(TABLES.PRODUCTS)
        .select('_id')
        .eq('tenant_id', existingProduct.tenant_id)
        .eq('code', sanitizedCode)
        .is('deleted_at', null)
        .neq('_id', id)
        .single();
      
      if (codeExists) {
        return c.json({ 
          success: false, 
          error: `Product code '${sanitizedCode}' already exists for this tenant` 
        }, 400);
      }
      
      body.code = sanitizedCode;
    }
    
    // Validate FK: product_category_id
    if (body.product_category_id && body.product_category_id !== existingProduct.product_category_id) {
      const { data: categoryExists } = await supabase
        .from(TABLES.PRODUCT_CATEGORIES)
        .select('_id')
        .eq('_id', body.product_category_id)
        .single();
      
      if (!categoryExists) {
        return c.json({ 
          success: false, 
          error: 'Invalid product_category_id' 
        }, 400);
      }
    }
    
    // Validate and process quantity fields
    const quantity = body.quantity !== undefined ? Math.max(0, body.quantity) : existingProduct.quantity;
    const waitingQuantity = body.waiting_quantity !== undefined ? Math.max(0, body.waiting_quantity) : existingProduct.waiting_quantity;
    
    // Auto-calculate is_sold_out based on quantity
    // Priority logic:
    // 1. If manually set to TRUE (locked), keep it TRUE
    // 2. If quantity = 0, auto set to TRUE
    // 3. If quantity > 0 and not manually locked, set to FALSE
    let isSoldOut;
    if (body.is_sold_out === true) {
      // Manual lock - keep locked
      isSoldOut = true;
    } else if (body.is_sold_out === false) {
      // Manual unlock - only allow if quantity > 0
      isSoldOut = quantity === 0;
    } else {
      // Auto-calculate from quantity
      isSoldOut = quantity === 0;
    }
    
    const updateData = {
      ...body,
      updated_at: now,
      quantity: quantity,
      waiting_quantity: waitingQuantity,
      is_sold_out: isSoldOut,
    };
    
    // Remove fields that shouldn't be updated via this endpoint
    delete updateData._id;
    delete updateData.tenant_id;
    delete updateData.created_at;
    delete updateData.deleted_at;

    const { data, error } = await supabase
      .from(TABLES.PRODUCTS)
      .update(updateData)
      .eq('_id', id)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error updating product:', error);
      throw error;
    }

    return c.json({ success: true, data });
  } catch (error) {
    console.error('Error in PUT /products/:id:', error);
    return c.json({ success: false, error: serializeError(error) }, 500);
  }
});

// DELETE product (soft delete)
app.delete('/make-server-4198d50c/products/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const now = new Date().toISOString();
    
    // Check if product exists and not deleted
    const { data: existingProduct } = await supabase
      .from(TABLES.PRODUCTS)
      .select('_id')
      .eq('_id', id)
      .is('deleted_at', null)
      .single();
    
    if (!existingProduct) {
      return c.json({ 
        success: false, 
        error: 'Product not found' 
      }, 404);
    }
    
    // Soft delete
    const { data, error } = await supabase
      .from(TABLES.PRODUCTS)
      .update({ 
        deleted_at: now,
        updated_at: now,
      })
      .eq('_id', id)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error soft deleting product:', error);
      throw error;
    }

    return c.json({ success: true, data });
  } catch (error) {
    console.error('Error in DELETE /products/:id:', error);
    return c.json({ success: false, error: serializeError(error) }, 500);
  }
});

// ================================
// PRODUCT VARIANTS API - Stub (table may not exist)
// ================================
app.get('/make-server-4198d50c/product-variants', async (c) => {
  return c.json({ success: true, data: [] });
});

app.get('/make-server-4198d50c/product-variants/by-product/:productId', async (c) => {
  return c.json({ success: true, data: [] });
});

app.get('/make-server-4198d50c/product-variants/:id', async (c) => {
  return c.json({ success: false, error: 'Product variant not found' }, 404);
});

app.post('/make-server-4198d50c/product-variants', async (c) => {
  return c.json({ success: false, error: 'Product variants table not available' }, 501);
});

app.put('/make-server-4198d50c/product-variants/:id', async (c) => {
  return c.json({ success: false, error: 'Product variants table not available' }, 501);
});

app.delete('/make-server-4198d50c/product-variants/:id', async (c) => {
  return c.json({ success: false, error: 'Product variants table not available' }, 501);
});

// ================================
// PRODUCT ATTRIBUTE DEFINITIONS API - Stub
// ================================
app.get('/make-server-4198d50c/product-attribute-definitions', async (c) => {
  return c.json({ success: true, data: [] });
});

app.get('/make-server-4198d50c/product-attribute-definitions/:id', async (c) => {
  return c.json({ success: false, error: 'Attribute definition not found' }, 404);
});

app.post('/make-server-4198d50c/product-attribute-definitions', async (c) => {
  return c.json({ success: false, error: 'Attribute definitions table not available' }, 501);
});

app.put('/make-server-4198d50c/product-attribute-definitions/:id', async (c) => {
  return c.json({ success: false, error: 'Attribute definitions table not available' }, 501);
});

app.delete('/make-server-4198d50c/product-attribute-definitions/:id', async (c) => {
  return c.json({ success: false, error: 'Attribute definitions table not available' }, 501);
});

// ================================
// PRODUCT ATTRIBUTE VALUES API - Stub
// ================================
app.get('/make-server-4198d50c/product-attribute-values', async (c) => {
  return c.json({ success: true, data: [] });
});

app.get('/make-server-4198d50c/product-attribute-values/:id', async (c) => {
  return c.json({ success: false, error: 'Attribute value not found' }, 404);
});

app.post('/make-server-4198d50c/product-attribute-values', async (c) => {
  return c.json({ success: false, error: 'Attribute values table not available' }, 501);
});

app.put('/make-server-4198d50c/product-attribute-values/:id', async (c) => {
  return c.json({ success: false, error: 'Attribute values table not available' }, 501);
});

app.delete('/make-server-4198d50c/product-attribute-values/:id', async (c) => {
  return c.json({ success: false, error: 'Attribute values table not available' }, 501);
});

// ================================
// PRODUCT SUPPLIERS API - Stub (table may not exist)
// ================================
app.get('/make-server-4198d50c/product-suppliers', async (c) => {
  return c.json({ success: true, data: [] });
});

app.get('/make-server-4198d50c/product-suppliers/:id', async (c) => {
  return c.json({ success: false, error: 'Product supplier not found' }, 404);
});

app.post('/make-server-4198d50c/product-suppliers', async (c) => {
  return c.json({ success: false, error: 'Product suppliers table not available' }, 501);
});

app.put('/make-server-4198d50c/product-suppliers/:id', async (c) => {
  return c.json({ success: false, error: 'Product suppliers table not available' }, 501);
});

app.delete('/make-server-4198d50c/product-suppliers/:id', async (c) => {
  return c.json({ success: false, error: 'Product suppliers table not available' }, 501);
});

// ================================
// PRODUCT BRANDS API - Stub (table may not exist)
// ================================
app.get('/make-server-4198d50c/product-brands', async (c) => {
  return c.json({ success: true, data: [] });
});

app.get('/make-server-4198d50c/product-brands/:id', async (c) => {
  return c.json({ success: false, error: 'Product brand not found' }, 404);
});

app.post('/make-server-4198d50c/product-brands', async (c) => {
  return c.json({ success: false, error: 'Product brands table not available' }, 501);
});

app.put('/make-server-4198d50c/product-brands/:id', async (c) => {
  return c.json({ success: false, error: 'Product brands table not available' }, 501);
});

app.delete('/make-server-4198d50c/product-brands/:id', async (c) => {
  return c.json({ success: false, error: 'Product brands table not available' }, 501);
});

// ================================
// PRODUCT UNITS API - Stub (table may not exist)
// ================================
app.get('/make-server-4198d50c/product-units', async (c) => {
  return c.json({ success: true, data: [] });
});

app.get('/make-server-4198d50c/product-units/:id', async (c) => {
  return c.json({ success: false, error: 'Product unit not found' }, 404);
});

app.post('/make-server-4198d50c/product-units', async (c) => {
  return c.json({ success: false, error: 'Product units table not available' }, 501);
});

app.put('/make-server-4198d50c/product-units/:id', async (c) => {
  return c.json({ success: false, error: 'Product units table not available' }, 501);
});

app.delete('/make-server-4198d50c/product-units/:id', async (c) => {
  return c.json({ success: false, error: 'Product units table not available' }, 501);
});

// 404 handler
app.notFound((c) => {
  return c.json({ success: false, error: 'Route not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({ success: false, error: err.message }, 500);
});

Deno.serve(app.fetch);