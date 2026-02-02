// v2025-01-30-SPU-SKU-FORMAT
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../lib/useTranslation';
import { 
  Plus, Search, Download, Upload, Settings, RefreshCw, 
  Edit, Trash2, Tag, Printer, List, Grid, 
  Package, AlertTriangle, XCircle, TrendingUp, Eye, EyeOff,
  Filter, X, ChevronDown, Sparkles, Zap, Box, DollarSign, 
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut
} from 'lucide-react';
import { Pagination } from './Pagination';
import { ProductForm } from './ProductForm';
import { BarcodeLabelPrintModal } from './BarcodeLabelPrintModal';
import { ColumnSelectorModal } from './ColumnSelectorModal';
import { ImageLightbox } from './ImageLightbox';
import { VariantEditModal } from './VariantEditModal';
import { api } from '../lib/api';
import { toast } from 'sonner@2.0.3';
import React from 'react';

interface ProductManagementProps {
  userRole?: 'admin' | 'cashier' | 'technician';
}

// Product interface - 23 fields
interface Product {
  _id: string;
  tenant_id: string;
  group_id: string;
  title: string;
  code: string;
  suggest_title: string;
  brief: string;
  content: string;
  status: 0 | 1;
  product_type_id: string;
  categories: string[] | null;
  customer_types: string[] | null;
  price: number | null;
  prices: any;
  product_tags: string[] | null;
  image: string | null;
  other_images: any;
  variant_properties: any;
  quantity: number;
  waiting_quantity: number;
  is_sold_out: boolean;
  total_review_score: number;
  order_product_count: number;
  last_sold_time: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  // Additional fields for display
  barcode?: string;
  cost_price?: number;
  brand?: string;
  weight?: number;
  location?: string;
  min_stock?: number;
  max_stock?: number;
}

// Column visibility
interface ColumnVisibility {
  checkbox: boolean;
  image: boolean;
  code: boolean;
  barcode: boolean;
  title: boolean;
  price: boolean;
  cost_price: boolean;
  category: boolean;
  brand: boolean;
  order_count: boolean;
  created_at: boolean;
}

export function ProductManagement({ userRole = 'admin' }: ProductManagementProps) {
  const { t } = useTranslation();
  const canEdit = userRole === 'admin';

  // State management - No tabs needed, only show products
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [productTypes, setProductTypes] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [expandedVariants, setExpandedVariants] = useState<Set<string>>(new Set());
  const [productVariants, setProductVariants] = useState<{ [productId: string]: any[] }>({});
  const [productUnitConfigs, setProductUnitConfigs] = useState<{ [productId: string]: any[] }>({});
  const [inventoryMap, setInventoryMap] = useState<{ [variantId: string]: number }>({}); // ✅ Map variant_id -> on_hand quantity
  const [showPrintLabelModal, setShowPrintLabelModal] = useState(false);
  const [printingProduct, setPrintingProduct] = useState<Product | null>(null);
  const [expandedDetailTab, setExpandedDetailTab] = useState<{ [productId: string]: 'info' | 'description' | 'stock' | 'inventory' | 'related' }>({});
  
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Variant edit modal state
  const [isVariantEditModalOpen, setIsVariantEditModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<any>(null);
  const [editingVariantProduct, setEditingVariantProduct] = useState<Product | null>(null);

  // Column visibility
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    checkbox: true,      // ✅ Hiển thị - Để bulk actions
    image: true,         // ✅ Hiển thị - Nhận diện sản phẩm nhanh
    code: true,          // ✅ Hiển thị - Mã tra cứu chính
    barcode: false,      // ❌ Ẩn - Ít dùng hàng ngày
    title: true,         // ✅ Hiển thị - Thông tin bắt buộc
    price: true,         // ✅ Hiển thị - Giá bán quan trọng
    cost_price: false,   // ❌ Ẩn - Thông tin nhạy cảm
    category: false,     // ❌ Ẩn - Dùng filter thay thế
    brand: false,        // ❌ Ẩn - Dùng filter thay thế
    order_count: false,  // ❌ Ẩn - Ít dùng hàng ngày
    created_at: false,   // ❌ Ẩn - Ít dùng hàng ngày
  });

  // Load products from API
  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await api.getProducts();
      if (response.success && response.data) {
        setProducts(response.data);
        
        // Load variants and unit configs for all products
        const variantsPromises = response.data.map((product: Product) =>
          api.getProductVariantsByProduct(product._id)
        );
        const unitConfigsPromises = response.data.map((product: Product) =>
          api.getProductUnitConfigsByProductId(product._id)
        );
        
        const variantsResponses = await Promise.all(variantsPromises);
        const unitConfigsResponses = await Promise.all(unitConfigsPromises);
        
        const variantsMap: { [productId: string]: any[] } = {};
        const unitConfigsMap: { [productId: string]: any[] } = {};
        
        response.data.forEach((product: Product, index: number) => {
          if (variantsResponses[index].success && variantsResponses[index].data) {
            variantsMap[product._id] = variantsResponses[index].data || [];
          }
          if (unitConfigsResponses[index].success && unitConfigsResponses[index].data) {
            unitConfigsMap[product._id] = unitConfigsResponses[index].data || [];
          }
        });
        
        setProductVariants(variantsMap);
        setProductUnitConfigs(unitConfigsMap);
        
        // 🔥 Load inventory for all variants
        const allVariants = Object.values(variantsMap).flat();
        const inventoryPromises = allVariants.map((variant: any) =>
          api.getInventoryByVariantId(variant._id)
        );
        
        const inventoryResponses = await Promise.all(inventoryPromises);
        const inventoryData: { [variantId: string]: number } = {};
        
        allVariants.forEach((variant: any, index: number) => {
          if (inventoryResponses[index].success && inventoryResponses[index].data) {
            const inv = inventoryResponses[index].data;
            inventoryData[variant._id] = inv.on_hand || 0;
          } else {
            inventoryData[variant._id] = 0;
          }
        });
        
        setInventoryMap(inventoryData);
        console.log('✅ Loaded inventory for', allVariants.length, 'variants');
      } else {
        toast.error(t('products.loadError') + ': ' + (response.error || 'Unknown error'));
        setProducts([]);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error(t('products.loadError'));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    loadReferenceData();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, brandFilter, statusFilter, stockFilter]);

  const loadReferenceData = async () => {
    try {
      console.log('Loading reference data...');
      const [typesResponse, categoriesResponse, brandsResponse, propertiesResponse] = await Promise.all([
        api.getProductTypes(),
        api.getProductCategories(),
        api.getProductBrands(),
        api.getProductProperties(),
      ]);

      console.log('Product types response:', typesResponse);
      console.log('Categories response:', categoriesResponse);
      console.log('Brands response:', brandsResponse);
      console.log('Properties response:', propertiesResponse);

      if (typesResponse.success && typesResponse.data) {
        setProductTypes(typesResponse.data);
      } else {
        console.error('Failed to load product types:', typesResponse.error);
      }

      if (categoriesResponse.success && categoriesResponse.data) {
        setCategories(categoriesResponse.data);
      } else {
        console.error('Failed to load categories:', categoriesResponse.error);
      }

      if (brandsResponse.success && brandsResponse.data) {
        setBrands(brandsResponse.data);
      } else {
        console.error('Failed to load brands:', brandsResponse.error);
      }

      if (propertiesResponse.success && propertiesResponse.data) {
        setProperties(propertiesResponse.data);
      } else {
        console.error('Failed to load properties:', propertiesResponse.error);
      }
    } catch (error) {
      console.error('Error loading reference data:', error);
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const activeProducts = products.filter(p => !p.deleted_at);
    
    // Trong ngành thời trang, tất cả đều là sản phẩm
    const productCount = activeProducts.length;
    const total = activeProducts.length;
    
    // 🔥 Tính tổng tồn kho và giá trị từ INVENTORY (mô hình POS chuẩn)
    let totalStock = 0;
    let totalValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    
    activeProducts.forEach(product => {
      const variants = productVariants[product._id] || [];
      let productStock = 0;
      
      variants.forEach((variant: any) => {
        const stock = inventoryMap[variant._id] || 0;
        productStock += stock;
        totalValue += (variant.price || 0) * stock;
      });
      
      totalStock += productStock;
      
      // Kiểm tra low stock và out of stock
      if (productStock === 0) {
        outOfStockCount++;
      } else if (productStock > 0 && productStock <= (product.min_stock || 10)) {
        lowStockCount++;
      }
    });

    return {
      total,
      productCount,
      lowStock: lowStockCount,
      outOfStock: outOfStockCount,
      totalValue,
      totalStock,
    };
  }, [products, productVariants, inventoryMap]);

  // 🔥 Helper function: Tính tổng tồn kho của sản phẩm từ inventory
  const getProductStock = (productId: string): number => {
    const variants = productVariants[productId] || [];
    return variants.reduce((sum: number, variant: any) => {
      return sum + (inventoryMap[variant._id] || 0);
    }, 0);
  };

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (product.deleted_at) return false;

      const matchesSearch = searchQuery === '' || 
        product.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (() => {
          // Tìm kiếm theo barcode từ variants (Rule 3: barcode CHỈ nằm ở product_variants)
          const variants = productVariants[product._id] || [];
          return variants.some((v: any) => 
            v.barcode?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        })();

      // Fix: So sánh với product_category_id thay vì categories string
      const matchesCategory = categoryFilter === 'all' || 
        (product as any).product_category_id === categoryFilter;

      const matchesBrand = brandFilter === 'all' || product.brand === brandFilter;

      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && product.status === 1) ||
        (statusFilter === 'inactive' && product.status === 0);

      // 🔥 Sử dụng inventory để filter stock
      const productStock = getProductStock(product._id);
      const matchesStock = stockFilter === 'all' ||
        (stockFilter === 'in-stock' && productStock > (product.min_stock || 10)) ||
        (stockFilter === 'low-stock' && productStock > 0 && productStock <= (product.min_stock || 10)) ||
        (stockFilter === 'out-of-stock' && productStock === 0);

      return matchesSearch && matchesCategory && matchesBrand && matchesStatus && matchesStock;
    });
  }, [products, searchQuery, categoryFilter, brandFilter, statusFilter, stockFilter, productVariants]);

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return '-';
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
  };

  const getCategoryName = (product: any) => {
    // Ưu tiên lấy từ product_category_id (database field)
    if (product.product_category_id) {
      return categories.find(c => c._id === product.product_category_id)?.name || '-';
    }
    // Fallback: Nếu có categories array
    if (product.categories && product.categories.length > 0) {
      return categories.find(c => c._id === product.categories[0])?.name || '-';
    }
    return '-';
  };

  const toggleSelectRow = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  // Open lightbox with product images
  const openLightbox = (product: Product, startIndex: number = 0) => {
    const images: string[] = [];
    
    // Add main image only
    if (product.image) {
      images.push(product.image);
    }
    
    if (images.length > 0) {
      setLightboxImages(images);
      setLightboxIndex(startIndex);
      setLightboxOpen(true);
    } else {
      toast.info('Sản phẩm chưa có hình ảnh');
    }
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === paginatedProducts.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedProducts.map(p => p._id)));
    }
  };

  const handleSaveProduct = async (productData: Product) => {
    try {
      if (editingProduct) {
        const response = await api.updateProduct(productData._id, productData);
        if (response.success && response.data) {
          setProducts(prev => prev.map(p => p._id === response.data._id ? response.data : p));
          
          // 🔥 FIX: Load variants và inventory sau khi update
          const variantsResponse = await api.getProductVariantsByProduct(response.data._id);
          if (variantsResponse.success && variantsResponse.data) {
            setProductVariants(prev => ({ ...prev, [response.data._id]: variantsResponse.data || [] }));
            
            // Load inventory for updated variants
            const inventoryPromises = variantsResponse.data.map((v: any) => api.getInventoryByVariantId(v._id));
            const inventoryResponses = await Promise.all(inventoryPromises);
            
            variantsResponse.data.forEach((variant: any, idx: number) => {
              if (inventoryResponses[idx].success && inventoryResponses[idx].data) {
                setInventoryMap(prev => ({
                  ...prev,
                  [variant._id]: inventoryResponses[idx].data.on_hand || 0
                }));
              }
            });
          }
          
          toast.success('Cập nhật sản phẩm thành công');
        } else {
          toast.error('Lỗi cập nhật sản phẩm: ' + (response.error || 'Unknown error'));
        }
      } else {
        const response = await api.createProduct(productData);
        if (response.success && response.data) {
          setProducts(prev => [response.data, ...prev]);
          
          // 🔥 FIX: Load variants và inventory sau khi tạo mới
          const variantsResponse = await api.getProductVariantsByProduct(response.data._id);
          if (variantsResponse.success && variantsResponse.data) {
            setProductVariants(prev => ({ ...prev, [response.data._id]: variantsResponse.data || [] }));
            console.log('✅ Loaded variants for new product:', response.data._id, variantsResponse.data);
            
            // Load inventory for new variants
            const inventoryPromises = variantsResponse.data.map((v: any) => api.getInventoryByVariantId(v._id));
            const inventoryResponses = await Promise.all(inventoryPromises);
            
            variantsResponse.data.forEach((variant: any, idx: number) => {
              if (inventoryResponses[idx].success && inventoryResponses[idx].data) {
                setInventoryMap(prev => ({
                  ...prev,
                  [variant._id]: inventoryResponses[idx].data.on_hand || 0
                }));
              }
            });
          }
          
          toast.success('Thêm sản phẩm thành công');
        } else {
          toast.error('Lỗi tạo sản phẩm: ' + (response.error || 'Unknown error'));
        }
      }
      setIsFormOpen(false);
      setEditingProduct(undefined);
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Có lỗi xảy ra khi lưu sản phẩm');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

    try {
      const response = await api.deleteProduct(productId);
      if (response.success) {
        setProducts(prev => prev.filter(p => p._id !== productId));
        toast.success('Xóa sản phẩm thành công');
      } else {
        toast.error('Lỗi xóa sản phẩm: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Có lỗi xảy ra khi xóa sản phẩm');
    }
  };

  const handlePrintLabel = (product: Product) => {
    // Map Product data to BarcodeLabelPrintModal format
    const labelProduct = {
      id: product._id,
      name: product.title,
      sku: product.code,
      barcode: product.code, // Use SKU as barcode if no separate barcode field
      price: product.price || 0,
      category: product.categories?.[0] || undefined
    };
    setPrintingProduct(labelProduct as any);
    setShowPrintLabelModal(true);
  };

  const handlePrintVariantLabel = (product: Product, variant: any) => {
    // Map Variant data to BarcodeLabelPrintModal format
    const labelProduct = {
      id: variant._id,
      name: `${product.title} - ${variant.title || 'Mặc định'}`,
      sku: variant.sku || product.code,
      barcode: variant.barcode || variant.sku || product.code,
      price: variant.price || 0,
      category: product.categories?.[0] || undefined
    };
    setPrintingProduct(labelProduct as any);
    setShowPrintLabelModal(true);
  };

  const handleBulkDelete = async () => {
    if (selectedRows.size === 0) return;
    if (!confirm(`Bạn có chắc muốn xóa ${selectedRows.size} sản phẩm đã chọn?`)) return;

    try {
      const deletePromises = Array.from(selectedRows).map(id => api.deleteProduct(id));
      await Promise.all(deletePromises);
      setProducts(prev => prev.filter(p => !selectedRows.has(p._id)));
      setSelectedRows(new Set());
      toast.success(`Đã xóa ${selectedRows.size} sản phẩm`);
    } catch (error) {
      console.error('Error bulk deleting:', error);
      toast.error('Có lỗi xảy ra khi xóa sản phẩm');
    }
  };

  const handleToggleStatus = async (product: Product) => {
    try {
      const newStatus = product.status === 1 ? 0 : 1;
      const response = await api.updateProduct(product._id, { status: newStatus });
      if (response.success) {
        setProducts(prev => prev.map(p => p._id === product._id ? { ...p, status: newStatus } : p));
        toast.success('Cập nhật trạng thái thành công');
      } else {
        toast.error('Lỗi cập nhật trạng thái');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleEditVariant = (variant: any, product: Product) => {
    setEditingVariant(variant);
    setEditingVariantProduct(product);
    setIsVariantEditModalOpen(true);
  };

  const handleSaveVariant = async (variantData: any) => {
    try {
      // Update variant through API
      const response = await api.updateProductVariant(variantData._id, variantData);
      
      if (response.success) {
        toast.success('Đã cập nhật biến thể');
        loadProducts(); // Reload to get fresh data
      } else {
        throw new Error('Failed to update variant');
      }
    } catch (error) {
      console.error('Error updating variant:', error);
      toast.error('Có lỗi xảy ra khi cập nhật SKU');
    }
  };

  const handleDeleteVariant = async (variantId: string, productTitle: string, variantTitle: string) => {
    if (!confirm(`Bạn có chắc muốn xóa biến thể "${variantTitle}" của sản phẩm "${productTitle}"?`)) return;

    try {
      const response = await api.deleteProductVariant(variantId);
      
      if (response.success) {
        toast.success('Đã xóa biến thể');
        loadProducts(); // Reload to get fresh data
      } else {
        throw new Error('Failed to delete variant');
      }
    } catch (error) {
      console.error('Error deleting variant:', error);
      toast.error('Có lỗi xảy ra khi xóa biến thể');
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(undefined);
    setIsFormOpen(true);
  };

  const toggleColumn = (column: keyof ColumnVisibility) => {
    setColumnVisibility(prev => ({ ...prev, [column]: !prev[column] }));
  };

  const toggleExpandProduct = async (productId: string) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
      // Load variants if not loaded yet
      if (!productVariants[productId]) {
        try {
          const response = await api.getProductVariantsByProduct(productId);
          if (response.success && response.data) {
            setProductVariants(prev => ({ ...prev, [productId]: response.data || [] }));
          }
        } catch (error) {
          console.error('Error loading variants:', error);
        }
      }
    }
    setExpandedProducts(newExpanded);
  };

  const hasVariants = (productId: string) => {
    // Hiển thị expand cho TẤT CẢ products có variants (kể cả 1 variant duy nhất)
    // Để user có thể xem chi tiết SKU, barcode, giá vốn, giá bán, tồn kho của variant
    return productVariants[productId] && productVariants[productId].length >= 1;
  };

  const hasNonDefaultVariants = (productId: string) => {
    const variants = productVariants[productId] || [];
    return variants.length > 0 && variants.some(v => !v.is_default);
  };

  const toggleExpandVariant = (variantId: string) => {
    const newExpanded = new Set(expandedVariants);
    if (newExpanded.has(variantId)) {
      newExpanded.delete(variantId);
    } else {
      newExpanded.add(variantId);
    }
    setExpandedVariants(newExpanded);
  };

  // Get default variant (for products with single variant)
  const getDefaultVariant = (productId: string) => {
    const variants = productVariants[productId];
    return variants && variants.length === 1 ? variants[0] : null;
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <style>{`
        div::-webkit-scrollbar { display: none; }
        * { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>
      
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-200">
        <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Sản phẩm</h1>
          
          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                onClick={handleAddProduct}
                className="px-4 py-2.5 text-sm font-medium text-white bg-[#FE7410] rounded-lg hover:bg-[#E66609] transition-colors flex items-center gap-2 min-h-[44px] whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                Thêm sản phẩm
              </button>
            )}
          </div>
        </div>

        <div className="px-4 sm:px-6 pb-3 border-b border-gray-200">
          <div className="text-sm text-gray-600">
            {filteredProducts.length} / {products.filter(p => !p.deleted_at).length} sản phẩm
          </div>
        </div>
      </div>

      {/* Content - Always show products */}
      <div>
          {/* Statistics Cards */}
          <div className="px-4 sm:px-6 py-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Tổng sản phẩm */}
              <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Tổng sản phẩm</div>
                    <div className="text-3xl font-bold text-gray-900">{stats.productCount}</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Package className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </div>

              {/* Sắp hết hàng */}
              <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Sắp hết hàng</div>
                    <div className="text-3xl font-bold text-gray-900">{stats.lowStock}</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
              </div>

              {/* Giá trị tồn kho */}
              <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Giá trị tồn kho</div>
                    <div className="text-3xl font-bold text-gray-900">{stats.totalValue.toLocaleString('vi-VN')}₫</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Tổng tồn kho */}
              <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Tổng tồn kho</div>
                    <div className="text-3xl font-bold text-gray-900">{stats.totalStock}</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Box className="w-5 h-5 text-[#FE7410]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="px-4 sm:px-6 pb-4">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
              {/* Search */}
              <div className="flex-1 relative min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Tìm theo tên hàng hóa"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE7410] focus:border-transparent min-h-[44px]"
                />
              </div>

              {/* Filter Group - Scrollable on mobile */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
                {/* Category Filter */}
                <div className="relative min-h-[44px]">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="appearance-none pl-4 pr-10 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE7410] focus:border-[#FE7410] min-h-[44px] whitespace-nowrap bg-white cursor-pointer hover:border-gray-400 transition-colors"
                  >
                    <option value="all">Tất cả danh mục</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>

                {/* Brand Filter */}
                <div className="relative min-h-[44px]">
                  <select
                    value={brandFilter}
                    onChange={(e) => setBrandFilter(e.target.value)}
                    className="appearance-none pl-4 pr-10 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE7410] min-h-[44px] whitespace-nowrap bg-white cursor-pointer hover:border-gray-400 transition-colors"
                  >
                    <option value="all">Tất cả thương hiệu</option>
                    {brands.map(brand => (
                      <option key={brand._id} value={brand.name}>{brand.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>

                {/* Status Filter */}
                <div className="relative min-h-[44px]">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none pl-4 pr-10 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE7410] min-h-[44px] whitespace-nowrap bg-white cursor-pointer hover:border-gray-400 transition-colors"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Đang bán</option>
                    <option value="inactive">Ngừng bán</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>

                {/* Stock Filter */}
                <div className="relative min-h-[44px]">
                  <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                    className="appearance-none pl-4 pr-10 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE7410] min-h-[44px] whitespace-nowrap bg-white cursor-pointer hover:border-gray-400 transition-colors"
                  >
                    <option value="all">Tất cả tồn kho</option>
                    <option value="in-stock">Còn hàng</option>
                    <option value="low-stock">Sắp hết</option>
                    <option value="out-of-stock">Hết hàng</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>

                {/* Column Selector */}
                <button
                  onClick={() => setShowColumnSelector(true)}
                  className="px-4 py-2.5 text-sm border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 min-h-[44px] whitespace-nowrap bg-white"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Cột hiển thị</span>
                </button>
              </div>
            </div>

            {/* Active Filters Display */}
            {(categoryFilter !== 'all' || brandFilter !== 'all' || statusFilter !== 'all' || stockFilter !== 'all') && (
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="text-sm text-gray-600">Đã lọc:</span>
                {categoryFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full border border-orange-300">
                    {categories.find(c => c._id === categoryFilter)?.name}
                    <button onClick={() => setCategoryFilter('all')} className="hover:text-orange-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {brandFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full border border-orange-300">
                    {brandFilter}
                    <button onClick={() => setBrandFilter('all')} className="hover:text-orange-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {statusFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full border border-orange-300">
                    {statusFilter === 'active' ? 'Đang bán' : 'Ngừng bán'}
                    <button onClick={() => setStatusFilter('all')} className="hover:text-orange-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {stockFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full border border-orange-300">
                    {stockFilter === 'in-stock' && 'Còn hàng'}
                    {stockFilter === 'low-stock' && 'Sắp hết'}
                    {stockFilter === 'out-of-stock' && 'Hết hàng'}
                    <button onClick={() => setStockFilter('all')} className="hover:text-orange-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Bulk Actions */}
          {selectedRows.size > 0 && (
            <div className="px-4 sm:px-6 pb-4">
              <div className="flex items-center gap-3 p-3 bg-orange-50 border-2 border-orange-200 rounded-lg">
                <span className="text-sm text-gray-700">
                  Đã chọn <strong>{selectedRows.size}</strong> sản phẩm
                </span>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 text-sm text-red-600 bg-white border-2 border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4 inline mr-1" />
                  Xóa đã chọn
                </button>
                <button
                  onClick={() => setSelectedRows(new Set())}
                  className="ml-auto text-sm text-gray-600 hover:text-gray-900"
                >
                  Bỏ chọn
                </button>
              </div>
            </div>
          )}

          {/* Products Table/Grid */}
          <div className="px-4 sm:px-6 pb-6">
            {loading ? (
              <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
                <div className="inline-block w-8 h-8 border-4 border-[#FE7410] border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-3 text-gray-600">Đang tải dữ liệu...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
                <Package className="w-16 h-16 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-600">Không tìm thấy sản phẩm nào</p>
              </div>
            ) : viewMode === 'list' ? (
              <div className="bg-white rounded-xl border-2 border-gray-200">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-orange-50 border-b-2 border-gray-200">
                      <tr>
                        {columnVisibility.checkbox && (
                          <th className="px-4 py-3 text-left">
                            <input
                              type="checkbox"
                              checked={selectedRows.size === paginatedProducts.length && paginatedProducts.length > 0}
                              onChange={toggleSelectAll}
                              className="w-4 h-4 text-[#FE7410] rounded border-gray-300 focus:ring-[#FE7410]"
                            />
                          </th>
                        )}
                        {columnVisibility.image && (
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Hình ảnh
                          </th>
                        )}
                        {columnVisibility.code && (
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Mã
                          </th>
                        )}
                        {columnVisibility.barcode && (
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Barcode
                          </th>
                        )}
                        {columnVisibility.title && (
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Tên sản phẩm
                          </th>
                        )}
                        {columnVisibility.price && (
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Giá bán
                          </th>
                        )}
                        {columnVisibility.cost_price && (
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Giá vốn
                          </th>
                        )}
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Tồn kho
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Trạng thái
                        </th>
                        {columnVisibility.category && (
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Danh mục
                          </th>
                        )}
                        {columnVisibility.brand && (
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Thương hiệu
                          </th>
                        )}
                        {columnVisibility.order_count && (
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Đã bán
                          </th>
                        )}
                        {columnVisibility.created_at && (
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Ngày tạo
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paginatedProducts.flatMap((product) => {
                        const rows = [];
                        const hasNonDefault = hasNonDefaultVariants(product._id);
                        const allVariants = productVariants[product._id] || [];
                        // Nếu chỉ có 1 variant → đó là default variant
                        const defaultVariant = allVariants.length === 1 ? allVariants[0] : allVariants.find(v => v.is_default);
                        // Nếu chỉ có 1 variant → không có non-default variants
                        const nonDefaultVariants = allVariants.length === 1 ? [] : allVariants.filter(v => !v.is_default);
                        const singleDefaultVariant = allVariants.length === 1;
                        
                        rows.push(
                          <tr 
                            key={product._id} 
                            onClick={() => toggleExpandProduct(product._id)}
                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            {columnVisibility.checkbox && (
                              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={selectedRows.has(product._id)}
                                  onChange={() => toggleSelectRow(product._id)}
                                  className="w-4 h-4 text-[#FE7410] rounded border-gray-300 focus:ring-[#FE7410]"
                                />
                              </td>
                            )}
                            {columnVisibility.image && (
                              <td className="px-4 py-3">
                                {product.image ? (
                                  <div 
                                    className="relative group cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openLightbox(product, 0);
                                    }}
                                  >
                                    <img 
                                      src={product.image} 
                                      alt={product.title} 
                                      className="w-12 h-12 object-cover rounded-lg border-2 border-gray-200 transition-transform hover:scale-110" 
                                    />
                                  </div>
                                ) : (
                                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-200">
                                    <Package className="w-6 h-6 text-gray-400" />
                                  </div>
                                )}
                              </td>
                            )}
                            {columnVisibility.code && (
                              <td className="px-4 py-3">
                                {singleDefaultVariant ? (
                                  // Sản phẩm có 1 variant duy nhất → hiển thị SKU của variant
                                  <span className="text-sm font-medium text-gray-900">{defaultVariant.sku || product.code}</span>
                                ) : hasVariants(product._id) ? (
                                  // ✅ SPU: Hiển thị số lượng mã hàng
                                  <span className="text-sm text-gray-600">
                                    ({productVariants[product._id].length}) Mã hàng
                                  </span>
                                ) : (
                                  <span className="text-sm font-medium text-gray-900">{product.code}</span>
                                )}
                              </td>
                            )}
                            {columnVisibility.barcode && (
                              <td className="px-4 py-3">
                                {singleDefaultVariant ? (
                                  <span className="text-sm text-gray-600">{defaultVariant.barcode || '-'}</span>
                                ) : hasVariants(product._id) ? (
                                  <span className="text-xs text-gray-400 italic">{productVariants[product._id].length} variants</span>
                                ) : (
                                  <span className="text-sm text-gray-400">-</span>
                                )}
                              </td>
                            )}
                            {columnVisibility.title && (
                              <td className="px-4 py-3">
                                <div className="max-w-xs">
                                  <div className="text-sm font-semibold text-gray-900 truncate">{product.title}</div>
                                  {singleDefaultVariant && defaultVariant.title && defaultVariant.title !== 'Mặc định' && (
                                    <div className="text-xs text-gray-500 truncate">{defaultVariant.title}</div>
                                  )}
                                  {!singleDefaultVariant && product.brief && (
                                    <div className="text-xs text-gray-500 truncate">{product.brief}</div>
                                  )}
                                </div>
                              </td>
                            )}
                            {columnVisibility.price && (
                              <td className="px-4 py-3">
                                <span className="text-sm font-medium text-gray-900">
                                  {singleDefaultVariant ? formatPrice(defaultVariant.price) : formatPrice(product.price)}đ
                                </span>
                              </td>
                            )}
                            {columnVisibility.cost_price && (
                              <td className="px-4 py-3">
                                <span className="text-sm text-gray-600">
                                  {singleDefaultVariant ? formatPrice(defaultVariant.cost_price || null) : formatPrice(product.cost_price || null)}đ
                                </span>
                              </td>
                            )}
                            <td className="px-4 py-3">
                              {(() => {
                                // 🔥 Sử dụng inventory để tính tồn kho
                                const qty = getProductStock(product._id);
                                const minStock = product.min_stock || 10;
                                
                                return (
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                    qty === 0 
                                      ? 'bg-red-100 text-red-700 border-red-300' 
                                      : qty <= minStock
                                      ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                                      : 'bg-green-100 text-green-700 border-green-300'
                                  }`}>
                                    {qty}
                                  </span>
                                );
                              })()}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleToggleStatus(product)}
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer transition-colors ${
                                  product.status === 1
                                    ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200'
                                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                                }`}
                              >
                                {product.status === 1 ? 'Đang bán' : 'Ngừng bán'}
                              </button>
                            </td>
                            {columnVisibility.category && (
                              <td className="px-4 py-3">
                                <span className="text-sm text-gray-600">{getCategoryName(product)}</span>
                              </td>
                            )}
                            {columnVisibility.brand && (
                              <td className="px-4 py-3">
                                <span className="text-sm text-gray-600">
                                  {(() => {
                                    const brand = brands.find(b => b._id === (product as any).brand_id);
                                    return brand?.name || '-';
                                  })()}
                                </span>
                              </td>
                            )}
                            {columnVisibility.order_count && (
                              <td className="px-4 py-3">
                                <span className="text-sm text-gray-600">{product.order_product_count || 0}</span>
                              </td>
                            )}
                            {columnVisibility.created_at && (
                              <td className="px-4 py-3">
                                <span className="text-sm text-gray-600">
                                  {new Date(product.created_at).toLocaleDateString('vi-VN')}
                                </span>
                              </td>
                            )}
                          </tr>
                        );
                        
                        {/* Click vào Product Row → Hiển thị chi tiết default variant + non-default variants */}
                        if (expandedProducts.has(product._id)) {
                          // Hiển thị chi tiết default variant (nếu có)
                          if (defaultVariant) {
                            // Hiển thị chi tiết default variant
                            const currentTab = expandedDetailTab[defaultVariant._id] || 'info';
                            const category = categories.find(c => c._id === product.product_category_id);
                            const brand = brands.find(b => b._id === (product as any).brand_id);
                            
                            rows.push(
                              <tr key={`${defaultVariant._id}-detail`}>
                                <td colSpan={14} className="bg-blue-50 border-t border-b-2 border-gray-300">
                                  {/* Tabs */}
                                  <div className="flex border-b border-gray-300 bg-white">
                                    {[
                                      { key: 'info', label: 'Thông tin' },
                                      { key: 'description', label: 'Mô tả, ghi chú' },
                                    ].map(tab => (
                                      <button
                                        key={tab.key}
                                        onClick={() => setExpandedDetailTab(prev => ({ ...prev, [defaultVariant._id]: tab.key as any }))}
                                        className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                                          currentTab === tab.key
                                            ? 'text-[#FE7410] bg-blue-50'
                                            : 'text-gray-600 hover:text-gray-900 bg-white'
                                        }`}
                                      >
                                        {tab.label}
                                        {currentTab === tab.key && (
                                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FE7410]" />
                                        )}
                                      </button>
                                    ))}
                                  </div>

                                  {/* Tab Content - Default Variant Detail */}
                                  <div className="px-6 py-4">
                                    {currentTab === 'info' && (
                                      <div className="space-y-6">
                                        {/* Variant Image and Info Grid */}
                                        <div className="flex gap-6">
                                          {/* Variant Image */}
                                          <div className="flex-shrink-0">
                                            {product.image ? (
                                              <img 
                                                src={product.image} 
                                                alt={defaultVariant.title || product.title} 
                                                className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200" 
                                              />
                                            ) : (
                                              <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                                                <Package className="w-8 h-8 text-gray-400" />
                                              </div>
                                            )}
                                          </div>

                                          {/* Info Grid */}
                                          <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-3">
                                            <div>
                                              <div className="text-xs text-gray-500 mb-1">Mã hàng</div>
                                              <div className="text-sm font-medium text-gray-900">{defaultVariant.sku || '-'}</div>
                                            </div>
                                            <div>
                                              <div className="text-xs text-gray-500 mb-1">Mã vạch</div>
                                              <div className="text-sm text-gray-900">{defaultVariant.barcode || 'Chưa có'}</div>
                                            </div>
                                            <div>
                                              <div className="text-xs text-gray-500 mb-1">Giá vốn</div>
                                              <div className="text-sm text-gray-900">{formatPrice(defaultVariant.cost_price || null)}đ</div>
                                            </div>
                                            <div>
                                              <div className="text-xs text-gray-500 mb-1">Giá bán</div>
                                              <div className="text-sm font-semibold text-[#FE7410]">{formatPrice(defaultVariant.price)}đ</div>
                                            </div>
                                            <div>
                                              <div className="text-xs text-gray-500 mb-1">Tồn kho</div>
                                              <div className={`text-sm font-medium ${
                                                (inventoryMap[defaultVariant._id] || 0) > 10 ? 'text-green-600' : 
                                                (inventoryMap[defaultVariant._id] || 0) > 0 ? 'text-yellow-600' : 'text-red-600'
                                              }`}>{inventoryMap[defaultVariant._id] || 0}</div>
                                            </div>
                                            <div>
                                              <div className="text-xs text-gray-500 mb-1">Đơn vị tính</div>
                                              <div className="text-sm text-gray-900">{defaultVariant.unit || 'Cái'}</div>
                                            </div>
                                            <div>
                                              <div className="text-xs text-gray-500 mb-1">Nhóm hàng</div>
                                              <div className="text-sm text-gray-900">{category?.name || '-'}</div>
                                            </div>
                                            <div>
                                              <div className="text-xs text-gray-500 mb-1">Thương hiệu</div>
                                              <div className="text-sm text-gray-900">{brand?.name || product.brand || 'Chưa có'}</div>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteProduct(product._id);
                                            }}
                                            className="px-4 py-2 text-sm text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                            Xóa
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleEditProduct(product);
                                            }}
                                            className="px-4 py-2 text-sm text-white bg-[#FE7410] rounded-lg hover:bg-[#E66609] transition-colors flex items-center gap-2"
                                          >
                                            <Edit className="w-4 h-4" />
                                            Chỉnh sửa
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handlePrintVariantLabel(product, defaultVariant);
                                            }}
                                            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                                          >
                                            <Printer className="w-4 h-4" />
                                            In tem mã
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                    {currentTab === 'description' && (
                                      <div>
                                        <p className="text-gray-600">{product.description || 'Chưa có mô tả'}</p>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          }
                          
                          {/* Show non-default variants - CHỈ hiển thị khi có NHIỀU HƠN 1 variant */}
                          if (allVariants.length > 1 && hasNonDefault) {
                            // Case 1: Product có nhiều variants → Show non-default variant rows
                            nonDefaultVariants.forEach((variant, variantIndex) => {
                              rows.push(
                                <tr 
                                  key={`${product._id}-variant-${variant._id}`}
                                  onClick={() => toggleExpandVariant(variant._id)}
                                  className="bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer border-l-4 border-[#FE7410]"
                                >
                                  {columnVisibility.checkbox && (
                                    <td className="px-4 py-2"></td>
                                  )}
                                  {columnVisibility.image && (
                                    <td className="px-4 py-2 pl-8">
                                      {product.image ? (
                                        <div 
                                          className="relative group cursor-pointer"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openLightbox(product, 0);
                                          }}
                                        >
                                          <img 
                                            src={product.image} 
                                            alt={variant.title || product.title}
                                            className="w-10 h-10 object-cover rounded border border-gray-300 transition-transform hover:scale-110"
                                          />
                                        </div>
                                      ) : (
                                        <div className="w-10 h-10 bg-white rounded border border-gray-300 flex items-center justify-center">
                                          <Box className="w-5 h-5 text-gray-400" />
                                        </div>
                                      )}
                                    </td>
                                  )}
                                  {columnVisibility.code && (
                                    <td className="px-4 py-2">
                                      <span className="text-sm font-medium text-gray-700">{variant.sku || '-'}</span>
                                    </td>
                                  )}
                                  {columnVisibility.barcode && (
                                    <td className="px-4 py-2">
                                      <span className="text-sm text-gray-600">{variant.barcode || '-'}</span>
                                    </td>
                                  )}
                                  {columnVisibility.title && (
                                    <td className="px-4 py-2">
                                      <div className="text-sm text-gray-700">
                                        {variant.title || `Phân loại ${variantIndex + 1}`}
                                      </div>
                                    </td>
                                  )}
                                  {columnVisibility.price && (
                                    <td className="px-4 py-2">
                                      <span className="text-sm font-medium text-gray-900">{formatPrice(variant.price)}đ</span>
                                    </td>
                                  )}
                                  {columnVisibility.cost_price && (
                                    <td className="px-4 py-2">
                                      <span className="text-sm text-gray-600">{formatPrice(variant.cost_price || null)}đ</span>
                                    </td>
                                  )}
                                  <td className="px-4 py-2">
                                    <span className={`text-sm font-medium ${
                                      (inventoryMap[variant._id] || 0) > 10 ? 'text-green-600' : 
                                      (inventoryMap[variant._id] || 0) > 0 ? 'text-yellow-600' : 'text-red-600'
                                    }`}>
                                      {inventoryMap[variant._id] || 0}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                      variant.status === 1
                                        ? 'bg-green-100 text-green-700 border-green-300'
                                        : 'bg-gray-100 text-gray-700 border-gray-300'
                                    }`}>
                                      {variant.status === 1 ? 'Đang bán' : 'Ngừng b��n'}
                                    </span>
                                  </td>
                                  {columnVisibility.category && (
                                    <td className="px-4 py-2"></td>
                                  )}
                                  {columnVisibility.brand && (
                                    <td className="px-4 py-2"></td>
                                  )}
                                  {columnVisibility.order_count && (
                                    <td className="px-4 py-2">
                                      <span className="text-sm text-gray-600">{variant.order_product_count || 0}</span>
                                    </td>
                                  )}
                                  {columnVisibility.created_at && (
                                    <td className="px-4 py-2">
                                      <span className="text-sm text-gray-600">
                                        {variant.created_at ? new Date(variant.created_at).toLocaleDateString('vi-VN') : '-'}
                                      </span>
                                    </td>
                                  )}
                                </tr>
                              );

                              // If variant is expanded, show detail view
                              if (expandedVariants.has(variant._id)) {
                                const currentTab = expandedDetailTab[variant._id] || 'info';
                                const category = categories.find(c => c._id === product.categories?.[0]);
                                const brand = brands.find(b => b._id === (product as any).brand_id);
                                
                                rows.push(
                                  <tr key={`${variant._id}-detail`}>
                                    <td colSpan={14} className="bg-blue-50 border-t border-b-2 border-gray-300">
                                      {/* Tabs */}
                                      <div className="flex border-b border-gray-300 bg-white">
                                        {[
                                          { key: 'info', label: 'Thông tin' },
                                          { key: 'description', label: 'Mô tả, ghi chú' },
                                        ].map(tab => (
                                          <button
                                            key={tab.key}
                                            onClick={() => setExpandedDetailTab(prev => ({ ...prev, [variant._id]: tab.key as any }))}
                                            className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                                              currentTab === tab.key
                                                ? 'text-[#FE7410] bg-blue-50'
                                                : 'text-gray-600 hover:text-gray-900 bg-white'
                                            }`}
                                          >
                                            {tab.label}
                                            {currentTab === tab.key && (
                                              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FE7410]" />
                                            )}
                                          </button>
                                        ))}
                                      </div>

                                      {/* Tab Content - Variant Detail */}
                                      <div className="px-6 py-4">
                                        {currentTab === 'info' && (
                                          <div className="flex gap-6">
                                            {/* Variant Image */}
                                            <div className="flex-shrink-0">
                                              {product.image ? (
                                                <img 
                                                  src={product.image} 
                                                  alt={variant.title || product.title} 
                                                  className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200" 
                                                />
                                              ) : (
                                                <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                                                  <Package className="w-8 h-8 text-gray-400" />
                                                </div>
                                              )}
                                            </div>

                                            {/* Variant Info Grid */}
                                            <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-3">
                                              <div>
                                                <div className="text-xs text-gray-500 mb-1">Mã hàng</div>
                                                <div className="text-sm font-medium text-gray-900">{variant.sku || '-'}</div>
                                              </div>
                                              <div>
                                                <div className="text-xs text-gray-500 mb-1">Mã vạch</div>
                                                <div className="text-sm text-gray-900">{variant.barcode || 'Chưa có'}</div>
                                              </div>
                                              <div>
                                                <div className="text-xs text-gray-500 mb-1">Giá vốn</div>
                                                <div className="text-sm text-gray-900">{formatPrice(variant.cost_price || null)}đ</div>
                                              </div>
                                              <div>
                                                <div className="text-xs text-gray-500 mb-1">Giá bán</div>
                                                <div className="text-sm font-semibold text-[#FE7410]">{formatPrice(variant.price)}đ</div>
                                              </div>
                                              <div>
                                                <div className="text-xs text-gray-500 mb-1">Tồn kho</div>
                                                <div className={`text-sm font-medium ${
                                                  (inventoryMap[variant._id] || 0) > 10 ? 'text-green-600' : 
                                                  (inventoryMap[variant._id] || 0) > 0 ? 'text-yellow-600' : 'text-red-600'
                                                }`}>
                                                  {inventoryMap[variant._id] || 0}
                                                </div>
                                              </div>
                                              <div>
                                                <div className="text-xs text-gray-500 mb-1">Nhóm hàng</div>
                                                <div className="text-sm text-gray-900">{category?.name || 'Chưa có'}</div>
                                              </div>
                                              <div>
                                                <div className="text-xs text-gray-500 mb-1">Thương hiệu</div>
                                                <div className="text-sm text-gray-900">{brand?.name || 'Chưa có'}</div>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                        {currentTab === 'description' && (
                                          <div className="space-y-4">
                                            <div>
                                              <div className="text-xs text-gray-500 mb-2">Mô tả ngắn</div>
                                              <div className="text-sm text-gray-700">{product.brief || 'Chưa có mô tả'}</div>
                                            </div>
                                            <div>
                                              <div className="text-xs text-gray-500 mb-2">Mô tả chi tiết</div>
                                              <div className="text-sm text-gray-700">{product.description || 'Chưa có mô tả'}</div>
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      {/* Action Buttons */}
                                      <div className="flex gap-2 px-6 pb-4 pt-2 border-t border-gray-200">
                                        <button
                                          onClick={() => handleDeleteVariant(variant._id, product.title, variant.title || variant.sku)}
                                          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                          Xóa biến thể
                                        </button>
                                        <button
                                          onClick={() => handleEditVariant(variant, product)}
                                          className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-[#FE7410] rounded-lg hover:bg-[#E56509] transition-colors"
                                        >
                                          <Edit className="w-4 h-4" />
                                          Chỉnh sửa biến thể
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handlePrintVariantLabel(product, variant);
                                          }}
                                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                          <Printer className="w-4 h-4" />
                                          In tem mã
                                        </button>
                                        <button className="ml-auto text-sm text-gray-600 hover:text-gray-900">•••</button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              }
                            });
                          }
                        }
                        
                        return rows;
                      })}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                {filteredProducts.length > 0 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredProducts.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                  />
                )}
              </div>
            ) : (
              // Grid View
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {paginatedProducts.map((product) => (
                  <div key={product._id} className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      {product.image ? (
                        <img src={product.image} alt={product.title} className="w-full h-48 object-cover" />
                      ) : (
                        <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                          <Package className="w-16 h-16 text-gray-300" />
                        </div>
                      )}
                      {columnVisibility.checkbox && (
                        <div className="absolute top-2 left-2">
                          <input
                            type="checkbox"
                            checked={selectedRows.has(product._id)}
                            onChange={() => toggleSelectRow(product._id)}
                            className="w-5 h-5 text-[#FE7410] rounded border-gray-300 focus:ring-[#FE7410]"
                          />
                        </div>
                      )}
                      <button
                        onClick={() => handleToggleStatus(product)}
                        className={`absolute top-2 right-2 px-2.5 py-1 rounded-full text-xs font-medium border ${
                          product.status === 1
                            ? 'bg-green-100 text-green-700 border-green-300'
                            : 'bg-gray-100 text-gray-700 border-gray-300'
                        }`}
                      >
                        {product.status === 1 ? 'Đang bán' : 'Ngừng bán'}
                      </button>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{product.title}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Mã hàng:</span>
                          <span className="font-medium">{product.code}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Giá bán:</span>
                          <span className="font-semibold text-[#FE7410]">{formatPrice(product.price)}đ</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tồn kho:</span>
                          <span className={`font-medium ${
                            getProductStock(product._id) === 0 ? 'text-red-600' : 
                            getProductStock(product._id) <= 10 ? 'text-yellow-600' : 
                            'text-green-600'
                          }`}>
                            {getProductStock(product._id)}
                          </span>
                        </div>
                      </div>

                      {canEdit && (
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="flex-1 px-3 py-2 text-sm text-white bg-[#FE7410] rounded-lg hover:bg-[#E66609] transition-colors"
                          >
                            <Edit className="w-4 h-4 inline mr-1" />
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="px-3 py-2 text-sm text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}\n                </div>
                
                {/* Pagination */}
                {filteredProducts.length > 0 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={filteredProducts.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={handlePageChange}
                      onItemsPerPageChange={handleItemsPerPageChange}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      {/* Product Form Modal */}
      {isFormOpen && (
        <ProductForm
          product={editingProduct}
          productTypes={productTypes}
          categories={categories}
          brands={brands}
          properties={properties}
          onSave={handleSaveProduct}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingProduct(undefined);
          }}
        />
      )}

      {/* Print Label Modal */}
      {showPrintLabelModal && printingProduct && (
        <BarcodeLabelPrintModal
          product={printingProduct}
          onClose={() => {
            setShowPrintLabelModal(false);
            setPrintingProduct(null);
          }}
        />
      )}

      {/* Column Selector Modal */}
      <ColumnSelectorModal
        isOpen={showColumnSelector}
        onClose={() => setShowColumnSelector(false)}
        columnVisibility={columnVisibility}
        onToggleColumn={toggleColumn}
      />

      {/* Lightbox for viewing images */}
      <ImageLightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />

      {/* Variant Edit Modal */}
      {isVariantEditModalOpen && editingVariant && editingVariantProduct && (
        <VariantEditModal
          isOpen={isVariantEditModalOpen}
          onClose={() => {
            setIsVariantEditModalOpen(false);
            setEditingVariant(null);
            setEditingVariantProduct(null);
          }}
          onSave={handleSaveVariant}
          variant={editingVariant}
          productTitle={editingVariantProduct.title}
        />
      )}
    </div>
  );
}

export default ProductManagement;
