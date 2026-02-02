import { useState, useEffect } from 'react';
import { useStore } from '../../../../lib/spa-lib/store';
import { useTranslation } from '../../../../lib/spa-lib/useTranslation';
import { 
  Plus, Pencil, Edit, Trash2, X, Search, Download, 
  Package, Sparkles, Clock, Calendar,
  RefreshCw, Grid, List, ArrowUpDown, Copy, Zap, Upload, Link2, Trash, Eye
} from 'lucide-react';
import type { Product, TreatmentSessionDetail } from '../../../../lib/spa-lib/store';
// import { supabaseService } from '../../../../lib/spa-lib/supabaseService'; // Removed - using localStorage only
import { Pagination } from '../../components/common/Pagination';
import { ProductDetailView } from './ProductDetailView';
import { ImportProducts } from './ImportProducts';
import * as XLSX from 'xlsx';

type ViewMode = 'grid' | 'list';
type SortField = 'name' | 'price' | 'category';
type SortOrder = 'asc' | 'desc';
type ProductType = 'product' | 'service' | 'treatment' | 'all';

interface ProductManagementProps {
  userRole?: 'admin' | 'cashier' | 'technician';
}

export function ProductManagement({ userRole = 'admin' }: ProductManagementProps) {
  const { products, addProduct, updateProduct, deleteProduct, categories: storeCategories } = useStore();
  const { t } = useTranslation();
  
  // Check if user has edit permissions (only admin can edit)
  const canEdit = userRole === 'admin';
  
  // UI States
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState<ProductType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [syncing, setSyncing] = useState(false);
  
  // Delete confirmation states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  // Product detail view state
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  
  // Import modal state
  const [showImportModal, setShowImportModal] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  // Category management
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Treatment sessions - Use the same interface from store
  const [treatmentSessions, setTreatmentSessions] = useState<TreatmentSessionDetail[]>([]);
  
  // Form States
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    costPrice: '',
    category: '',
    stock: '',
    barcode: '',
    image: '',
    productType: 'product' as 'product' | 'service' | 'treatment',
    duration: '',
    sessions: '',
    description: '',
  });

  // Calculate treatment price from session details
  const calculateTreatmentPrice = (): number => {
    let total = 0;
    treatmentSessions.forEach(session => {
      // Add product prices
      session.products.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product) {
          total += product.price * item.quantity;
        }
      });
      // Add service prices
      session.services.forEach(item => {
        const service = products.find(p => p.id === item.id);
        if (service) {
          total += service.price * item.quantity;
        }
      });
    });
    return total;
  };

  // Auto-calculate price when sessions change
  useEffect(() => {
    if (formData.productType === 'treatment' && treatmentSessions.length > 0) {
      const calculatedPrice = calculateTreatmentPrice();
      if (calculatedPrice > 0) {
        // Always update to calculated price (user can override after)
        setFormData(prev => ({ ...prev, price: calculatedPrice.toString() }));
      }
    }
  }, [treatmentSessions]);

  // Load products from server on mount
  useEffect(() => {
    // Removed - app uses localStorage only, no server loading needed
    // loadProducts();
  }, []);

  const loadProducts = async () => {
    // Removed - app uses localStorage only
    setSyncing(true);
    try {
      // const serverProducts = await supabaseService.getProducts();
      // console.log('Loaded products from server:', serverProducts.length);
      console.log('Products loaded from localStorage');
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setSyncing(false);
    }
  };

  const categories = storeCategories.length > 0 
    ? storeCategories 
    : Array.from(new Set(products.map(p => p.category)));
  
  // Filtering and Sorting
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
      
      const matchesType = filterType === 'all' || (product.productType || 'product') === filterType;
      
      return matchesSearch && matchesCategory && matchesType;
    })
    .sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory, filterType, sortField, sortOrder]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData: any = {
      name: formData.name,
      price: Number(formData.price),
      costPrice: formData.costPrice ? Number(formData.costPrice) : undefined,
      category: formData.category,
      stock: formData.productType === 'service' || formData.productType === 'treatment' ? 999 : Number(formData.stock),
      barcode: formData.barcode || undefined,
      image: formData.image || undefined,
      productType: formData.productType,
      description: formData.description || undefined,
    };

    // Add duration for services and treatments
    if (formData.productType === 'service' || formData.productType === 'treatment') {
      productData.duration = formData.duration ? Number(formData.duration) : undefined;
    }

    // Add sessions for treatments
    if (formData.productType === 'treatment') {
      productData.sessions = formData.sessions ? Number(formData.sessions) : undefined;
      // Save session details
      productData.sessionDetails = treatmentSessions;
      
      // Debug log
      console.log('💾 Saving Treatment with Session Details:', {
        name: productData.name,
        sessions: productData.sessions,
        sessionDetails: productData.sessionDetails
      });
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }

    handleCloseModal();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      costPrice: product.costPrice?.toString() || '',
      category: product.category,
      stock: product.stock.toString(),
      barcode: product.barcode || '',
      image: product.image || '',
      productType: product.productType || 'product',
      duration: product.duration?.toString() || '',
      sessions: product.sessions?.toString() || '',
      description: product.description || '',
    });
    // Load session details if treatment
    if (product.productType === 'treatment' && product.sessionDetails) {
      setTreatmentSessions(product.sessionDetails);
    } else {
      setTreatmentSessions([]);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setTreatmentSessions([]); // Reset treatment sessions
    setFormData({
      name: '',
      price: '',
      costPrice: '',
      category: '',
      stock: '',
      barcode: '',
      image: '',
      productType: 'product',
      duration: '',
      sessions: '',
      description: '',
    });
  };

  const handleDelete = (id: string) => {
    const product = products.find(p => p.id === id);
    if (product) {
      setProductToDelete(product);
      setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      setShowDeleteConfirm(false);
      setProductToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setProductToDelete(null);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleDuplicateProduct = (product: Product) => {
    addProduct({
      name: `${product.name} (Copy)`,
      price: product.price,
      costPrice: product.costPrice,
      category: product.category,
      stock: 0,
      productType: product.productType,
      duration: product.duration,
      sessions: product.sessions,
      description: product.description,
    });
  };

  // Export to Excel function
  const handleExportExcel = () => {
    try {
      const workbook = XLSX.utils.book_new();
      
      // Prepare data for export
      const exportData = filteredProducts.map(p => {
        // Format product type
        let productTypeLabel = '';
        if (p.productType === 'product') productTypeLabel = 'Sản phẩm';
        else if (p.productType === 'service') productTypeLabel = 'Dịch vụ';
        else if (p.productType === 'treatment') productTypeLabel = 'Liệu trình';
        
        return {
          'Mã sản phẩm': p.id,
          'Tên sản phẩm': p.name,
          'Loại': productTypeLabel,
          'Danh mục': p.category,
          'Giá bán': p.price,
          'Giá vốn': p.costPrice || 0,
          'Tồn kho': (p.productType === 'service' || p.productType === 'treatment') ? 'N/A' : p.stock,
          'Thời lượng (phút)': p.duration || '',
          'Số buổi': p.sessions || '',
          'Mã vạch': p.barcode || '',
          'Mô tả': p.description || ''
        };
      });
      
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Set column widths
      worksheet['!cols'] = [
        { wch: 15 }, // Mã sản phẩm
        { wch: 30 }, // Tên sản phẩm
        { wch: 12 }, // Loại
        { wch: 15 }, // Danh mục
        { wch: 12 }, // Giá bán
        { wch: 12 }, // Giá vốn
        { wch: 10 }, // Tồn kho
        { wch: 15 }, // Thời lượng
        { wch: 10 }, // Số buổi
        { wch: 15 }, // Mã vạch
        { wch: 40 }  // Mô tả
      ];
      
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sản phẩm');
      
      // Generate file name with current date
      const today = new Date();
      const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
      const fileName = `DanhSachSanPham_${dateStr}.xlsx`;
      
      XLSX.writeFile(workbook, fileName);
      
      alert(`✅ Đã xuất ${filteredProducts.length} sản phẩm ra file Excel!`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('❌ Có lỗi xảy ra khi xuất Excel!');
    }
  };

  // Statistics
  const stats = {
    totalProducts: products.filter(p => (p.productType || 'product') === 'product').length,
    totalServices: products.filter(p => p.productType === 'service').length,
    totalTreatments: products.filter(p => p.productType === 'treatment').length,
    totalStock: products
      .filter(p => (p.productType || 'product') === 'product')
      .reduce((sum, p) => sum + (p.stock || 0), 0),
  };

  const getProductTypeIcon = (type?: string) => {
    switch (type || 'product') {
      case 'service':
        return <Sparkles className="w-4 h-4" />;
      case 'treatment':
        return <Zap className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getProductTypeBadge = (type?: string) => {
    switch (type || 'product') {
      case 'service':
        return (
          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 px-3 py-1 rounded-full text-xs border border-purple-200">
            <Sparkles className="w-3 h-3" />
            {t('spaService')}
          </span>
        );
      case 'treatment':
        return (
          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 px-3 py-1 rounded-full text-xs border border-blue-200">
            <Zap className="w-3 h-3" />
            {t('spaTreatment')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 px-3 py-1 rounded-full text-xs border border-green-200">
            <Package className="w-3 h-3" />
            {t('spaProduct')}
          </span>
        );
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h2 className="page-title">{t('productManagement')} - Spa</h2>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-gray-500 text-sm">{filteredProducts.length} / {products.length} {t('items_count')}</p>
            {syncing && (
              <div className="flex items-center gap-2 text-blue-600">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm">{t('syncing')}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {canEdit && (
            <>
              <button
                onClick={handleExportExcel}
                className="px-4 py-2 rounded-xl font-semibold border-2 transition-all hover:shadow-md flex items-center gap-2"
                style={{ borderColor: '#FE7410', color: '#FE7410', backgroundColor: 'white' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFF7ED'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <Download className="w-5 h-5" />
                Xuất Excel
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="px-4 py-2 rounded-xl font-semibold border-2 transition-all hover:shadow-md flex items-center gap-2"
                style={{ borderColor: '#FE7410', color: '#FE7410', backgroundColor: 'white' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFF7ED'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <Upload className="w-5 h-5" />
                Nhập Excel
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="btn-primary-orange flex items-center gap-2 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                {t('addNew')}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('totalProducts')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalProducts}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('totalServices')}</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{stats.totalServices}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('totalTreatments')}</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.totalTreatments}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tổng tồn kho</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {stats.totalStock.toLocaleString('vi-VN')}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Actions Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('searchByNameOrBarcode')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as ProductType)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">{t('allTypes')}</option>
            <option value="product">{t('spaProducts')}</option>
            <option value="service">{t('spaServices')}</option>
            <option value="treatment">{t('spaTreatments')}</option>
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">{t('allCategories')}</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* View Mode */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-purple-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white text-purple-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Products Table - List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="modern-table">
              <thead>
                <tr>
                  <th className="table-header">
                    {t('productName')}
                  </th>
                  <th className="table-header">{t('productType')}</th>
                  <th className="table-header">{t('category')}</th>
                  <th className="table-header text-right">Giá vốn</th>
                  <th className="table-header text-right">Giá bán</th>
                  <th className="table-header text-center">{t('durationMinutes')}</th>
                  <th className="table-header text-right">{t('sessionsCount')}</th>
                  <th className="table-header text-center">{t('inventory')}</th>
                  <th className="table-header actions-left">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((product) => (
                  <tr 
                    key={product.id}
                  >
                    <td className="table-content">
                      <div className="flex items-center gap-3">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            {product.productType === 'service' ? (
                              <Sparkles className="w-5 h-5 text-orange-600" />
                            ) : product.productType === 'treatment' ? (
                              <Zap className="w-5 h-5 text-purple-600" />
                            ) : (
                              <Package className="w-5 h-5 text-green-600" />
                            )}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          {product.description && (
                            <div className="text-xs text-gray-500 mt-0.5 max-w-xs truncate">
                              {product.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="table-content">
                      {product.productType === 'service' ? t('spaService') : product.productType === 'treatment' ? t('spaTreatment') : t('spaProduct')}
                    </td>
                    <td className="table-content">
                      {product.category}
                    </td>
                    <td className="table-content font-semibold text-right">
                      {product.costPrice ? `${product.costPrice.toLocaleString('vi-VN')}${t('vnd')}` : '-'}
                    </td>
                    <td className="table-content font-semibold text-right">
                      {product.price.toLocaleString('vi-VN')}{t('vnd')}
                    </td>
                    <td className="table-content text-center">
                      {product.duration ? `${product.duration} ${t('minutes_short')}` : '-'}
                    </td>
                    <td className="table-content text-right">
                      {product.sessions ? `${product.sessions} ${t('sessions')}` : '-'}
                    </td>
                    <td className="table-content text-center">
                      {(product.productType || 'product') === 'service' || (product.productType || 'product') === 'treatment' ? (
                        <span className="text-gray-400">N/A</span>
                      ) : (
                        <span
                          className={`status-badge ${
                            product.stock > 20
                              ? 'status-success'
                              : product.stock > 10
                              ? 'status-info'
                              : product.stock > 0
                              ? 'status-warning'
                              : 'status-error'
                          }`}
                        >
                          {product.stock}
                        </span>
                      )}
                    </td>
                    <td className="actions-left">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setViewingProduct(product);
                            setShowProductDetail(true);
                          }}
                          className="action-icon p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-5 h-5 text-gray-600" />
                        </button>
                        {canEdit && (
                          <>
                            <button
                              onClick={() => handleDuplicateProduct(product)}
                              className="action-icon p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Nhân bản"
                            >
                              <Copy className="w-5 h-5 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleEdit(product)}
                              className="action-icon p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <Edit className="w-5 h-5 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="action-icon p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5 text-red-600" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {paginatedProducts.length === 0 && filteredProducts.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              {filterType === 'product' && (
                <>
                  <Package className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p className="text-lg font-medium text-gray-600">Không tìm thấy sản phẩm nào</p>
                  <p className="text-sm mt-2">Sản phẩm là items có tồn kho, như serum, kem dưỡng, v.v.</p>
                </>
              )}
              {filterType === 'service' && (
                <>
                  <Sparkles className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p className="text-lg font-medium text-gray-600">Không tìm thấy dịch vụ nào</p>
                  <p className="text-sm mt-2">Dịch vụ có thời lượng, như massage, facial, nail, v.v.</p>
                </>
              )}
              {filterType === 'treatment' && (
                <>
                  <Zap className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p className="text-lg font-medium text-gray-600">Không tìm thấy liệu trình nào</p>
                  <p className="text-sm mt-2">Liệu trình có nhiều buổi, như trị mụn 10 buổi, massage 8 buổi, v.v.</p>
                </>
              )}
              {filterType === 'all' && (
                <>
                  <Package className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p className="text-lg font-medium text-gray-600">{t('notFound')}</p>
                  <p className="text-sm mt-2">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
                </>
              )}
            </div>
          )}

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
      )}

      {/* Products Grid - Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all overflow-hidden"
            >
              {/* Product Image */}
              <div className="relative">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    <div className="text-5xl">
                      {(product.productType || 'product') === 'service' && '✨'}
                      {product.productType === 'treatment' && '⚡'}
                      {(product.productType || 'product') === 'product' && '🛍️'}
                    </div>
                  </div>
                )}
                
                {/* Type Badge */}
                <div className="absolute top-2 right-2">
                  {getProductTypeBadge(product.productType)}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{product.category}</p>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-purple-600">
                    {product.price.toLocaleString('vi-VN')}{t('vnd')}
                  </span>
                  {(product.productType || 'product') !== 'service' && (
                    <span className={`text-sm px-2 py-1 rounded ${
                      product.stock > 10 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {t('stock')}: {product.stock}
                    </span>
                  )}
                </div>

                {/* Duration and Sessions */}
                <div className="flex gap-2 mb-3 text-xs text-gray-600">
                  {product.duration && (
                    <span className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded">
                      <Clock className="w-3 h-3" />
                      {product.duration} {t('minutes_short')}
                    </span>
                  )}
                  {product.sessions && (
                    <span className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded">
                      <Calendar className="w-3 h-3" />
                      {product.sessions} {t('sessions')}
                    </span>
                  )}
                </div>

                {/* Actions */}
                {canEdit ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 flex items-center justify-center gap-2 bg-purple-50 text-purple-600 px-3 py-2 rounded-lg hover:bg-purple-100 transition-colors text-sm"
                    >
                      <Pencil className="w-4 h-4" />
                      {t('edit')}
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="flex items-center justify-center bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 text-sm py-2">Chỉ xem</div>
                )}
              </div>
            </div>
          ))}

          {paginatedProducts.length === 0 && filteredProducts.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">
              <Package className="w-16 h-16 mx-auto mb-3 opacity-30" />
              <p>{t('notFound')}</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination for Grid View */}
      {viewMode === 'grid' && filteredProducts.length > 0 && (
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

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full my-8" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
            <div className="sticky top-0 text-white px-6 py-4 flex justify-between items-center rounded-t-lg z-10" style={{ backgroundColor: '#FE7410' }}>
              <h3 className="text-xl font-bold">
                {editingProduct ? t('editProduct') : t('addNewProduct')}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-lg transition-colors hover:bg-black/10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(100vh - 12rem)' }}>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Type */}
              <div>
                <label className="block text-gray-700 mb-2">{t('productTypeLabel')}</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, productType: 'product' })}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                      formData.productType === 'product'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <Package className="w-6 h-6" />
                    <span className="text-sm font-medium">{t('spaProduct')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, productType: 'service' })}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                      formData.productType === 'service'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <Sparkles className="w-6 h-6" />
                    <span className="text-sm font-medium">{t('spaService')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, productType: 'treatment' })}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                      formData.productType === 'treatment'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <Zap className="w-6 h-6" />
                    <span className="text-sm font-medium">{t('spaTreatment')}</span>
                  </button>
                </div>
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-gray-700 mb-2">{t('productName')} *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#FE7410' } as any}
                  placeholder={t('enterProductName')}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-gray-700 mb-2">{t('category')} *</label>
                  {showNewCategoryInput ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder={t('newCategoryName')}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (newCategoryName.trim()) {
                              setFormData({ ...formData, category: newCategoryName.trim() });
                              setShowNewCategoryInput(false);
                              setNewCategoryName('');
                            }
                          }}
                          className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                        >
                          {t('confirm')}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowNewCategoryInput(false);
                            setNewCategoryName('');
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                        >
                          {t('cancel')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        if (e.target.value === '__new__') {
                          setShowNewCategoryInput(true);
                        } else {
                          setFormData({ ...formData, category: e.target.value });
                        }
                      }}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    >
                      <option value="">{t('selectCategory')}</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="__new__" className="font-semibold text-purple-600">
                        + {t('addNewCategory')}
                      </option>
                    </select>
                  )}
                </div>

                {/* Cost Price */}
                <div>
                  <label className="block text-gray-700 mb-2">Giá vốn (VNĐ) *</label>
                  <input
                    type="number"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="300000"
                    required
                    min="0"
                  />
                </div>
              </div>

              {/* Selling Price */}
              <div>
                <label className="block text-gray-700 mb-2">Giá bán (VNĐ) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="500000"
                  required
                  min="0"
                />
              </div>

              {/* Duration (for services only) */}
              {formData.productType === 'service' && (
                <div>
                  <label className="block text-gray-700 mb-2">{t('durationMinutes')}</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="60"
                    min="0"
                  />
                </div>
              )}

              {/* Sessions (for treatments only) */}
              {formData.productType === 'treatment' && (
                <div>
                  <label className="block text-gray-700 mb-2">{t('sessionsCount')}</label>
                  <input
                    type="number"
                    value={formData.sessions}
                    onChange={(e) => {
                      const count = parseInt(e.target.value) || 0;
                      setFormData({ ...formData, sessions: e.target.value });
                      // Auto-adjust treatmentSessions array
                      if (count > treatmentSessions.length) {
                        const newSessions = [...treatmentSessions];
                        for (let i = treatmentSessions.length; i < count; i++) {
                          newSessions.push({ sessionNumber: i + 1, products: [], services: [] });
                        }
                        setTreatmentSessions(newSessions);
                      } else if (count < treatmentSessions.length) {
                        setTreatmentSessions(treatmentSessions.slice(0, count));
                      }
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="10"
                    min="0"
                  />
                </div>
              )}

              {/* Treatment Session Details */}
              {formData.productType === 'treatment' && parseInt(formData.sessions) > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-gray-700 font-semibold">
                      {t('sessionDetails')}
                    </label>
                    <span className="text-sm text-gray-500">
                      {treatmentSessions.length} {t('sessions')}
                    </span>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
                    {treatmentSessions.map((session, sessionIdx) => (
                      <div key={sessionIdx} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-purple-700">
                            {t('session')} {session.sessionNumber}
                          </h4>
                        </div>
                        
                        {/* Products Section */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                              {t('spaProducts')}
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const newSessions = [...treatmentSessions];
                                newSessions[sessionIdx].products.push({ id: '', quantity: 1 });
                                setTreatmentSessions(newSessions);
                              }}
                              className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-700 px-2 py-1 rounded hover:bg-purple-50"
                            >
                              <Plus className="w-3 h-3" />
                              Thêm SP
                            </button>
                          </div>
                          
                          <div className="space-y-2">
                            {session.products.length === 0 ? (
                              <button
                                type="button"
                                onClick={() => {
                                  const newSessions = [...treatmentSessions];
                                  newSessions[sessionIdx].products.push({ id: '', quantity: 1 });
                                  setTreatmentSessions(newSessions);
                                }}
                                className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-all"
                              >
                                + {t('selectProduct')}
                              </button>
                            ) : (
                              session.products.map((productItem, prodIdx) => {
                                const selectedProduct = products.find(p => p.id === productItem.id);
                                const itemPrice = selectedProduct ? selectedProduct.price * productItem.quantity : 0;
                                return (
                                <div key={prodIdx} className="flex flex-col gap-2 bg-gray-50 p-3 rounded-lg">
                                  <div className="flex gap-2">
                                    <select
                                      value={productItem.id}
                                      onChange={(e) => {
                                        const newSessions = [...treatmentSessions];
                                        newSessions[sessionIdx].products[prodIdx] = { id: e.target.value, quantity: productItem.quantity };
                                        setTreatmentSessions(newSessions);
                                      }}
                                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                    >
                                      <option value="">{t('selectProduct')}</option>
                                      {products
                                        .filter(p => (p.productType || 'product') === 'product')
                                        .map(product => (
                                          <option key={product.id} value={product.id}>
                                            {product.name} - {product.price.toLocaleString('vi-VN')}₫
                                          </option>
                                        ))}
                                    </select>
                                    <input
                                      type="number"
                                      value={productItem.quantity}
                                      onChange={(e) => {
                                        const newSessions = [...treatmentSessions];
                                        newSessions[sessionIdx].products[prodIdx] = { id: productItem.id, quantity: parseInt(e.target.value) || 1 };
                                        setTreatmentSessions(newSessions);
                                      }}
                                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                      placeholder="1"
                                      min="1"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newSessions = [...treatmentSessions];
                                        newSessions[sessionIdx].products.splice(prodIdx, 1);
                                        setTreatmentSessions(newSessions);
                                      }}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title={t('delete')}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                  {selectedProduct && (
                                    <div className="text-xs text-gray-600 flex items-center justify-between px-1">
                                      <span>{productItem.quantity} x {selectedProduct.price.toLocaleString('vi-VN')}₫</span>
                                      <span className="font-semibold text-purple-600">= {itemPrice.toLocaleString('vi-VN')}₫</span>
                                    </div>
                                  )}
                                </div>
                              )})
                            )}
                          </div>
                        </div>

                        {/* Services Section */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                              {t('spaServices')}
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const newSessions = [...treatmentSessions];
                                newSessions[sessionIdx].services.push({ id: '', quantity: 1 });
                                setTreatmentSessions(newSessions);
                              }}
                              className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-700 px-2 py-1 rounded hover:bg-purple-50"
                            >
                              <Plus className="w-3 h-3" />
                              Thêm DV
                            </button>
                          </div>
                          
                          <div className="space-y-2">
                            {session.services.length === 0 ? (
                              <button
                                type="button"
                                onClick={() => {
                                  const newSessions = [...treatmentSessions];
                                  newSessions[sessionIdx].services.push({ id: '', quantity: 1 });
                                  setTreatmentSessions(newSessions);
                                }}
                                className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-all"
                              >
                                + {t('selectService')}
                              </button>
                            ) : (
                              session.services.map((serviceItem, servIdx) => {
                                const selectedService = products.find(p => p.id === serviceItem.id);
                                const itemPrice = selectedService ? selectedService.price * serviceItem.quantity : 0;
                                return (
                                <div key={servIdx} className="flex flex-col gap-2 bg-gray-50 p-3 rounded-lg">
                                  <div className="flex gap-2">
                                    <select
                                      value={serviceItem.id}
                                      onChange={(e) => {
                                        const newSessions = [...treatmentSessions];
                                        newSessions[sessionIdx].services[servIdx] = { id: e.target.value, quantity: serviceItem.quantity };
                                        setTreatmentSessions(newSessions);
                                      }}
                                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                    >
                                      <option value="">{t('selectService')}</option>
                                      {products
                                        .filter(p => p.productType === 'service')
                                        .map(service => (
                                          <option key={service.id} value={service.id}>
                                            {service.name} ({service.duration}p) - {service.price.toLocaleString('vi-VN')}₫
                                          </option>
                                        ))}
                                    </select>
                                    <input
                                      type="number"
                                      value={serviceItem.quantity}
                                      onChange={(e) => {
                                        const newSessions = [...treatmentSessions];
                                        newSessions[sessionIdx].services[servIdx] = { id: serviceItem.id, quantity: parseInt(e.target.value) || 1 };
                                        setTreatmentSessions(newSessions);
                                      }}
                                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                      placeholder="1"
                                      min="1"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newSessions = [...treatmentSessions];
                                        newSessions[sessionIdx].services.splice(servIdx, 1);
                                        setTreatmentSessions(newSessions);
                                      }}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title={t('delete')}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                  {selectedService && (
                                    <div className="text-xs text-gray-600 flex items-center justify-between px-1">
                                      <span>{serviceItem.quantity} x {selectedService.price.toLocaleString('vi-VN')}₫</span>
                                      <span className="font-semibold text-purple-600">= {itemPrice.toLocaleString('vi-VN')}₫</span>
                                    </div>
                                  )}
                                </div>
                              )})
                            )}
                          </div>
                        </div>
                        
                        {/* Session Total Price */}
                        {(session.products.length > 0 || session.services.length > 0) && (
                          <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Tổng buổi {session.sessionNumber}:</span>
                            <span className="text-base font-bold text-purple-600">
                              {(() => {
                                let total = 0;
                                session.products.forEach(item => {
                                  const product = products.find(p => p.id === item.id);
                                  if (product) total += product.price * item.quantity;
                                });
                                session.services.forEach(item => {
                                  const service = products.find(p => p.id === item.id);
                                  if (service) total += service.price * item.quantity;
                                });
                                return total.toLocaleString('vi-VN');
                              })()}₫
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Total Treatment Price */}
                  {treatmentSessions.length > 0 && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-bold text-purple-900">Tổng giá liệu trình:</span>
                        <span className="text-2xl font-bold text-purple-600">
                          {calculateTreatmentPrice().toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                      <p className="text-xs text-purple-600 mt-1">Bạn có thể điều chỉnh giá ở ô "Giá (VNĐ)" phía trên</p>
                    </div>
                  )}
                </div>
              )}

              {/* Stock (only for products) */}
              {formData.productType === 'product' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">{t('inventory')}</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="100"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">{t('barcode')}</label>
                    <input
                      type="text"
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="8934567890001"
                    />
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-gray-700 mb-2">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Mô tả chi tiết về sản phẩm/dịch vụ/liệu trình..."
                  rows={3}
                />
              </div>

              {/* Profile Image */}
              <div>
                <label className="block text-gray-700 mb-2">{t('profileImage')}</label>
                <div className="space-y-3">
                  {/* Image Preview */}
                  {formData.image && (
                    <div className="relative w-full h-40 rounded-lg overflow-hidden border-2 border-gray-200">
                      <img 
                        src={formData.image} 
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f3f4f6" width="200" height="200"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EInvalid Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: '' })}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Upload Button */}
                  <div className="flex items-center gap-3">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all cursor-pointer">
                      <Upload className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-700">{t('uploadImage')}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Convert to base64 or upload to server
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormData({ ...formData, image: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    
                    <span className="text-gray-400">{t('or')}</span>
                    
                    <div className="flex-1 relative">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder={t('enterImageURL')}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 text-white rounded-lg transition-all shadow-lg"
                  style={{ backgroundColor: '#FE7410' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E56809'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FE7410'}
                >
                  {editingProduct ? t('update') : t('addNew')}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && productToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-red-600 mb-4">
              Xác nhận xóa
            </h3>
            
            <p className="text-gray-700 mb-6">
              Bạn có chắc chắn muốn xóa "{productToDelete.name}"?
            </p>

            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail View - Full Screen */}
      {showProductDetail && viewingProduct && (
        <ProductDetailView
          product={viewingProduct}
          onClose={() => {
            setShowProductDetail(false);
            setViewingProduct(null);
          }}
          onEdit={(product) => {
            setShowProductDetail(false);
            handleEdit(product);
          }}
          onDelete={(product) => {
            setShowProductDetail(false);
            handleDelete(product.id);
          }}
          userRole={userRole}
        />
      )}

      {/* Import Products Modal */}
      {showImportModal && (
        <ImportProducts
          onClose={() => setShowImportModal(false)}
        />
      )}
    </div>
  );
}

export default ProductManagement;