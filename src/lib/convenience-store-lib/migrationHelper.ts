/**
 * Migration Helper for Product Schema
 * Converts old product schema to new snake_case schema
 */

export const migrateAllProductsInLocalStorage = () => {
  try {
    const storeKey = 'spa-pos-store';
    const stored = localStorage.getItem(storeKey);
    
    if (!stored) {
      console.log('No data found in localStorage');
      return { success: false, message: 'No data found' };
    }

    const data = JSON.parse(stored);
    
    if (!data.state?.products || !Array.isArray(data.state.products)) {
      console.log('No products array found');
      return { success: false, message: 'No products found' };
    }

    let migratedCount = 0;
    let skippedCount = 0;

    data.state.products = data.state.products.map((p: any) => {
      // Check if already migrated
      if (p._id && p.title && p.quantity !== undefined && p.code && p.created_at) {
        skippedCount++;
        return p;
      }

      // Migrate
      const now = new Date().toISOString();
      const _id = p._id || p.id || `PROD-${Date.now()}-${Math.random()}`;
      
      migratedCount++;
      
      return {
        // New schema fields
        _id,
        tenant_id: p.tenant_id,
        industry_id: p.industry_id,
        product_type_id: p.product_type_id,
        product_category_id: p.product_category_id,
        code: p.code || p.barcode || _id,
        title: p.title || p.name || '',
        brief: p.brief || p.description,
        content: p.content || p.description,
        price: p.price || 0,
        prices: p.prices,
        quantity: p.quantity ?? p.stock ?? 0,
        waiting_quantity: p.waiting_quantity ?? 0,
        is_sold_out: p.is_sold_out ?? false,
        status: p.status ?? 1,
        image: p.image,
        other_images: p.other_images,
        created_at: p.created_at || now,
        updated_at: p.updated_at || now,
        deleted_at: p.deleted_at,
        
        // Legacy fields for backward compatibility
        id: _id,
        name: p.title || p.name || '',
        stock: p.quantity ?? p.stock ?? 0,
        category: p.category,
        barcode: p.code || p.barcode,
        description: p.brief || p.description,
        
        // Spa-specific fields
        options: p.options,
        productType: p.productType || p.type,
        duration: p.duration,
        sessions: p.sessions,
        sessionDetails: p.sessionDetails,
      };
    });

    // Save back to localStorage
    localStorage.setItem(storeKey, JSON.stringify(data));
    
    console.log(`✅ Migration complete! Migrated: ${migratedCount}, Skipped: ${skippedCount}`);
    
    return {
      success: true,
      message: `Migration complete! Migrated ${migratedCount} products, skipped ${skippedCount} already migrated.`,
      migratedCount,
      skippedCount,
    };
  } catch (error) {
    console.error('Migration error:', error);
    return {
      success: false,
      message: `Migration failed: ${error}`,
    };
  }
};
