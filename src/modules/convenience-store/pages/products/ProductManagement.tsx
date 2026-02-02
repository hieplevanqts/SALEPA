import { useState, useEffect } from 'react';
import { useStore } from '../../../../lib/convenience-store-lib/store';
import { useTranslation } from '../../../../lib/convenience-store-lib/useTranslation';
import { 
  Plus, Pencil, Trash2, X, Search,
  Package, RefreshCw, Grid3x3, List, ArrowUpDown, Upload, FileSpreadsheet, FileDown, CheckCircle
} from 'lucide-react';
import type { Product } from '../../../../lib/convenience-store-lib/store';
import { Pagination } from '../../components/pagination/Pagination';
import * as XLSX from 'xlsx';

type ViewMode = 'grid' | 'list';
type SortField = 'title' | 'price' | 'category';
type SortOrder = 'asc' | 'desc';

interface ProductManagementProps {
  userRole?: 'admin' | 'cashier' | 'technician';
}

// Helper function to get category images from Unsplash
const getCategoryImage = (category: string, productType?: string): string => {
  // Category images for various product types
  const categoryMap: Record<string, string> = {
    // Spa & Beauty Services (original categories)
    'Massage': 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Chăm sóc da': 'https://images.unsplash.com/photo-1684014286330-ddbeb4a40c92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Nail': 'https://images.unsplash.com/photo-1599458348985-236f9b110da1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Waxing': 'https://images.unsplash.com/photo-1582498674105-ad104fcc5784?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Liệu trình': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    
    // Grocery & Convenience Store Categories
    'Tạp hóa': 'https://images.unsplash.com/photo-1651488201726-bbb9577778ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Sản phẩm': 'https://images.unsplash.com/photo-1651488201726-bbb9577778ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Đồ ăn vặt': 'https://images.unsplash.com/photo-1748765968965-7e18d4f7192b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Snack': 'https://images.unsplash.com/photo-1748765968965-7e18d4f7192b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Đồ uống': 'https://images.unsplash.com/photo-1588693474799-f1ab19670f5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Nước giải khát': 'https://images.unsplash.com/photo-1588693474799-f1ab19670f5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Rau củ': 'https://images.unsplash.com/photo-1748342319942-223b99937d4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Rau củ quả': 'https://images.unsplash.com/photo-1748342319942-223b99937d4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Sữa': 'https://images.unsplash.com/photo-1635714293982-65445548ac42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Sản phẩm sữa': 'https://images.unsplash.com/photo-1635714293982-65445548ac42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Mì ăn liền': 'https://images.unsplash.com/photo-1628919311414-1ee37e9ed8ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Mì gói': 'https://images.unsplash.com/photo-1628919311414-1ee37e9ed8ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Gạo': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Ngũ cốc': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Cà phê': 'https://images.unsplash.com/photo-1606265771707-c052d0e14656?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Trà': 'https://images.unsplash.com/photo-1606265771707-c052d0e14656?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Kẹo': 'https://images.unsplash.com/photo-1657641908545-592c2a8e3b79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Bánh kẹo': 'https://images.unsplash.com/photo-1657641908545-592c2a8e3b79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Bánh mì': 'https://images.unsplash.com/photo-1555932450-31a8aec2adf1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Bánh': 'https://images.unsplash.com/photo-1555932450-31a8aec2adf1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Chăm sóc cá nhân': 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Vệ sinh': 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Đồ gia dụng': 'https://images.unsplash.com/photo-1759846866217-e627e4478f82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Vệ sinh nhà cửa': 'https://images.unsplash.com/photo-1759846866217-e627e4478f82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Đồ đông lạnh': 'https://images.unsplash.com/photo-1758221617148-7d019e8e3388?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Kem': 'https://images.unsplash.com/photo-1758221617148-7d019e8e3388?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Đồ hộp': 'https://images.unsplash.com/photo-1576192350050-d9e08ee1f122?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Hoa quả': 'https://images.unsplash.com/photo-1636128774004-68374b26ed1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Trái cây': 'https://images.unsplash.com/photo-1636128774004-68374b26ed1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Dầu ăn': 'https://images.unsplash.com/photo-1757801333175-65177bd6969c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Gia vị': 'https://images.unsplash.com/photo-1757801333175-65177bd6969c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Thuốc lá': 'https://images.unsplash.com/photo-1610512462613-b95e1eae0ad6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Văn phòng phẩm': 'https://images.unsplash.com/photo-1599652300924-c8341cb74d0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Dụng cụ học tập': 'https://images.unsplash.com/photo-1599652300924-c8341cb74d0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Mỹ phẩm': 'https://images.unsplash.com/photo-1613255348289-1407e4f2f980?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Làm đẹp': 'https://images.unsplash.com/photo-1613255348289-1407e4f2f980?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Thuốc': 'https://images.unsplash.com/photo-1646392206581-2527b1cae5cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Y tế': 'https://images.unsplash.com/photo-1646392206581-2527b1cae5cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  };
  return categoryMap[category] || categoryMap[productType || ''] || '';
};

export default function ProductManagement({ userRole = 'admin' }: ProductManagementProps) {
  const { products, addProduct, updateProduct, deleteProduct, categories: storeCategories } = useStore();
  const { t } = useTranslation();
  
  const canEdit = userRole === 'admin';
  
  // UI States
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  
  // Delete confirmation states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  // Excel Import states
  const [showImportModal, setShowImportModal] = useState(false);
  const [importPreviewData, setImportPreviewData] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importStep, setImportStep] = useState<'upload' | 'preview' | 'importing' | 'success'>('upload');
  
  // Form States
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    brief: '',
    content: '',
    price: '',
    cost_price: '',
    product_category_id: '',
    quantity: '',
    waiting_quantity: '',
    is_sold_out: false,
    status: 1,
    image: '',
  });

  // Image upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh hợp lệ');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước ảnh không được vượt quá 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Auto-generate product code (barcode format)
  useEffect(() => {
    if (!formData.code && formData.title && !editingProduct) {
      // Generate 13-digit barcode number (EAN-13 format)
      const timestamp = Date.now().toString();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const barcode = (timestamp + random).slice(-13);
      setFormData(prev => ({ ...prev, code: barcode }));
    }
  }, [formData.title, editingProduct]);

  const categories = storeCategories.length > 0 
    ? storeCategories 
    : Array.from(new Set(products.map(p => p.category ?? p.product_category_id).filter(Boolean)));
  
  // Calculate stats
  const activeProducts = products.filter(p => p.status === 1);
  const totalProducts = activeProducts.length;
  const totalStock = activeProducts.reduce((sum, p) => sum + (p.quantity || p.stock || 0), 0);
  const totalInventoryValue = activeProducts.reduce((sum, p) => {
    const quantity = p.quantity || p.stock || 0;
    const price = p.price || 0;
    return sum + (quantity * price);
  }, 0);

  // Filtering and Sorting
  const filteredProducts = products
    .filter(p => {
      const matchesSearch = (p.title || p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (p.code || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || (p.category || p.product_category_id) === filterCategory;
      const matchesType = filterType === 'all' || true; // Add type filtering logic if needed
      return matchesSearch && matchesCategory && matchesType;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      if (sortField === 'title') {
        aValue = (a.title || a.name || '').toLowerCase();
        bValue = (b.title || b.name || '').toLowerCase();
      } else if (sortField === 'price') {
        aValue = a.price;
        bValue = b.price;
      } else {
        aValue = (a.category || a.product_category_id || '').toLowerCase();
        bValue = (b.category || b.product_category_id || '').toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.price || !formData.cost_price) {
      alert(t('pleaseFillAllFields'));
      return;
    }

    const productData: Product = {
      _id: editingProduct?._id || crypto.randomUUID(),
      tenant_id: editingProduct?.tenant_id || '',
      industry_id: editingProduct?.industry_id || '',
      code: formData.code || '',
      title: formData.title,
      brief: formData.brief || '',
      content: formData.content || '',
      product_category_id: formData.product_category_id || '',
      price: parseFloat(formData.price) || 0,
      cost_price: parseFloat(formData.cost_price) || 0,
      quantity: parseInt(formData.quantity) || 0,
      waiting_quantity: parseInt(formData.waiting_quantity) || 0,
      is_sold_out: formData.is_sold_out,
      status: formData.status as 0 | 1,
      image: formData.image || '',
      created_at: editingProduct?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      
      // Legacy compatibility
      id: editingProduct?._id || crypto.randomUUID(),
      name: formData.title,
      stock: parseInt(formData.quantity) || 0,
      category: formData.product_category_id || '',
      description: formData.brief || '',
    };

    if (editingProduct) {
      updateProduct(editingProduct._id || editingProduct.id!, productData);
    } else {
      addProduct(productData);
    }

    resetForm();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title || product.name || '',
      code: product.code || '',
      brief: product.brief || product.description || '',
      content: product.content || '',
      price: product.price.toString(),
      cost_price: (product.cost_price || 0).toString(),
      product_category_id: product.product_category_id || product.category || '',
      quantity: (product.quantity || product.stock || 0).toString(),
      image: product.image || '',
      waiting_quantity: (product.waiting_quantity || 0).toString(),
      is_sold_out: product.is_sold_out || false,
      status: product.status ?? 1,
    });
    setShowModal(true);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete._id || productToDelete.id!);
      setShowDeleteConfirm(false);
      setProductToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      code: '',
      brief: '',
      content: '',
      price: '',
      cost_price: '',
      product_category_id: '',
      quantity: '',
      waiting_quantity: '',
      is_sold_out: false,
      status: 1,
      image: '',
    });
    setEditingProduct(null);
    setShowModal(false);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // ===== EXCEL IMPORT FUNCTIONS =====
  
  const handleDownloadTemplate = () => {
    const worksheetData = [
      ['Mã vạch', 'Tên sản phẩm', 'Giá bán', 'Giá vốn', 'Tồn kho', 'Danh mục', 'Mô tả ngắn'],
      ['8935049502371', 'Coca Cola 330ml', '10000', '7000', '100', 'Nước giải khát', 'Nước ngọt có gas'],
      ['8934673114165', 'Sting Dâu 330ml', '12000', '8000', '50', 'Nước giải khát', 'Nước tăng lực hương dâu'],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    XLSX.writeFile(workbook, `product_import_template.xlsx`);
  };

  const handleExcelFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert('Vui lòng chọn file Excel (.xlsx hoặc .xls)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        if (jsonData.length < 2) {
          alert('File Excel không có dữ liệu');
          return;
        }

        // Parse data
        const headers = jsonData[0];
        const rows = jsonData.slice(1);
        const errors: string[] = [];
        const previewData: any[] = [];

        rows.forEach((row, index) => {
          const rowNum = index + 2;
          if (!row || row.length === 0 || !row[0]) return; // Skip empty rows

          const [code, title, price, cost_price, quantity, category, brief] = row;

          // Validation
          if (!code || !title || !price || !cost_price) {
            errors.push(`Dòng ${rowNum}: Thiếu mã vạch, tên sản phẩm, giá bán hoặc giá vốn`);
            return;
          }

          previewData.push({
            code: String(code).trim(),
            title: String(title).trim(),
            price: parseFloat(price) || 0,
            cost_price: parseFloat(cost_price) || 0,
            quantity: parseInt(quantity) || 0,
            category: category ? String(category).trim() : '',
            brief: brief ? String(brief).trim() : '',
            status: 1,
          });
        });

        setImportPreviewData(previewData);
        setImportErrors(errors);
        setImportStep('preview');
      } catch (error) {
        console.error('Error reading Excel:', error);
        alert('Lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng file.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleConfirmImport = () => {
    setImportStep('importing');
    
    // Simulate import process
    setTimeout(() => {
      importPreviewData.forEach(item => {
        // Kiểm tra sản phẩm đã tồn tại dựa vào mã vạch hoặc tên
        const existingProduct = products.find(p => 
          (p.code && item.code && p.code.toLowerCase() === item.code.toLowerCase()) ||
          ((p.title || p.name) && item.title && 
           (p.title?.toLowerCase() === item.title.toLowerCase() || 
            p.name?.toLowerCase() === item.title.toLowerCase()))
        );

        if (existingProduct) {
          // Sản phẩm đã tồn tại - cộng số lượng
          const updatedProduct: Product = {
            ...existingProduct,
            quantity: (existingProduct.quantity || existingProduct.stock || 0) + item.quantity,
            stock: (existingProduct.quantity || existingProduct.stock || 0) + item.quantity,
            updated_at: new Date().toISOString(),
          };
          updateProduct(existingProduct._id || existingProduct.id!, updatedProduct);
        } else {
          // Sản phẩm chưa tồn tại - thêm mới
          const productData: Product = {
            _id: crypto.randomUUID(),
            tenant_id: '',
            industry_id: '',
            code: item.code,
            title: item.title,
            brief: item.brief,
            content: '',
            price: item.price,
            cost_price: item.cost_price,
            quantity: item.quantity,
            is_sold_out: false,
            status: 1,
            image: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            
            // Legacy compatibility
            id: crypto.randomUUID(),
            name: item.title,
            stock: item.quantity,
            category: item.category,
            description: item.brief,
          };
          addProduct(productData);
        }
      });

      setImportStep('success');
      
      setTimeout(() => {
        setShowImportModal(false);
        resetImportModal();
      }, 2000);
    }, 1500);
  };

  const resetImportModal = () => {
    setImportFile(null);
    setImportPreviewData([]);
    setImportErrors([]);
    setImportStep('upload');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Quản lý sản phẩm</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">{totalProducts} / {products.length} sản phẩm</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="sm:inline">Import Excel</span>
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FE7410] text-white rounded-lg hover:bg-[#E56809] transition-colors text-sm sm:text-base w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span className="sm:inline">Thêm Mới</span>
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {/* Card 1 - Total Products */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Tổng sản phẩm</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{totalProducts}</div>
        </div>

        {/* Card 2 - Total Inventory Value */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Giá trị tồn kho</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{totalInventoryValue.toLocaleString('vi-VN')}₫</div>
        </div>

        {/* Card 3 - Total Stock */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Tổng tồn kho</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-[#FE7410]" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{totalStock.toLocaleString()}</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc mã vạch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent text-sm sm:min-w-[160px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Tất cả loại</option>
            <option value="product">Sản phẩm</option>
            <option value="service">Dịch vụ</option>
            <option value="package">Gói liệu trình</option>
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent text-sm sm:min-w-[180px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* View Toggle */}
          <div className="flex gap-1 border border-gray-300 dark:border-gray-600 rounded-lg p-1 bg-white dark:bg-gray-700">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600/50'
              }`}
            >
              <List className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600/50'
              }`}
            >
              <Grid3x3 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Products Table/List */}
      {viewMode === 'list' ? (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#FEF7ED] dark:bg-gray-700/50">
                  <tr>
                    <th className="text-left px-6 py-4 text-base font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('title')}
                        className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white"
                      >
                        TÊN SẢN PHẨM
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="text-left px-6 py-4 text-base font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      MÃ VẠCH
                    </th>
                    <th className="text-left px-6 py-4 text-base font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('price')}
                        className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white"
                      >
                        GIÁ BÁN
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="text-left px-6 py-4 text-base font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      TỒN KHO
                    </th>
                    <th className="text-left px-6 py-4 text-base font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('category')}
                        className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white"
                      >
                        DANH MỤC
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="text-left px-6 py-4 text-base font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      TRẠNG THÁI
                    </th>
                    {canEdit && (
                      <th className="text-right px-6 py-4 text-base font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        HÀNH ĐỘNG
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800">
                  {paginatedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={canEdit ? 7 : 6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        Không tìm thấy sản phẩm nào
                      </td>
                    </tr>
                  ) : (
                    paginatedProducts.map((product) => (
                      <tr 
                        key={product._id || product.id} 
                        className="transition-colors hover:bg-[#FEF7ED] dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 last:border-0"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            {product.image || getCategoryImage(product.product_category_id || product.category || '', product.productType) ? (
                              <img
                                src={product.image || getCategoryImage(product.product_category_id || product.category || '', product.productType)}
                                alt={product.title || product.name}
                                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Crect fill="%23f3f4f6" width="48" height="48"/%3E%3C/svg%3E';
                                }}
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                <Package className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-semibold text-gray-900 dark:text-white text-base">
                                {product.title || product.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-base text-gray-700 dark:text-gray-300 font-mono">
                            {product.code || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-base font-semibold text-gray-900 dark:text-white">
                            {product.price.toLocaleString('vi-VN')}₫
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-base font-medium text-gray-900 dark:text-white">
                            {(product.quantity || product.stock || 0).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-base text-gray-700 dark:text-gray-300">
                            {product.category || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`text-base font-medium ${
                            product.status === 1 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {product.status === 1 ? 'Hoạt động' : 'Ngưng'}
                          </span>
                        </td>
                        {canEdit && (
                          <td className="px-6 py-5">
                            <div className="flex items-center justify-end gap-3">
                              <button
                                onClick={() => handleEdit(product)}
                                className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                title="Sửa"
                              >
                                <Pencil className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(product)}
                                className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                title="Xóa"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {paginatedProducts.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
                Không tìm thấy sản phẩm nào
              </div>
            ) : (
              paginatedProducts.map((product) => (
                <div
                  key={product._id || product.id}
                  className="bg-white rounded-xl border border-gray-200 p-4"
                >
                  <div className="flex gap-3">
                    {/* Product Image */}
                    {product.image || getCategoryImage(product.product_category_id || product.category || '', product.productType) ? (
                      <img
                        src={product.image || getCategoryImage(product.product_category_id || product.category || '', product.productType)}
                        alt={product.title || product.name}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0 border border-gray-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23f3f4f6" width="80" height="80"/%3E%3C/svg%3E';
                        }}
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    )}

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                        {product.title || product.name}
                      </h3>
                      <p className="text-xs text-gray-500 font-mono mb-2">
                        {product.code || 'N/A'}
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-base font-bold text-[#FE7410]">
                          {product.price.toLocaleString('vi-VN')}₫
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                          Kho: {product.quantity || product.stock || 0}
                        </span>
                      </div>
                      {product.category && (
                        <p className="text-xs text-gray-600 mb-2">
                          Danh mục: {product.category}
                        </p>
                      )}
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-700">
                        {product.status === 1 ? 'Hoạt động' : 'Ngưng'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {canEdit && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => handleEdit(product)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-50 text-[#FE7410] rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium"
                      >
                        <Pencil className="w-4 h-4" />
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteClick(product)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                        Xóa
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {paginatedProducts.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              Không tìm thấy sản phẩm nào
            </div>
          ) : (
            paginatedProducts.map((product) => (
              <div
                key={product._id || product.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square bg-gray-100 relative">
                  {product.image || getCategoryImage(product.product_category_id || product.category || '', product.productType) ? (
                    <img
                      src={product.image || getCategoryImage(product.product_category_id || product.category || '', product.productType)}
                      alt={product.title || product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">
                    {product.title || product.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2 font-mono">{product.code}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-[#FE7410]">
                      {product.price.toLocaleString('vi-VN')}₫
                    </span>
                    <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded-full">
                      {product.quantity || product.stock || 0}
                    </span>
                  </div>
                  {canEdit && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-50 text-[#FE7410] rounded-lg hover:bg-orange-100 transition-colors text-sm"
                      >
                        <Pencil className="w-4 h-4" />
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteClick(product)}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {filteredProducts.length > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            totalItems={filteredProducts.length}
          />
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-[#FE7410] to-orange-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                {editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
              </h3>
              <button
                onClick={resetForm}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="space-y-5">
                {/* Row 1: Tên sản phẩm & Mã sản phẩm */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Tên sản phẩm <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      placeholder="Nhập tên sản phẩm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Mã vạch <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => {
                        // Only allow numbers
                        const value = e.target.value.replace(/\D/g, '');
                        setFormData({ ...formData, code: value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm font-mono"
                      placeholder="8935049502371"
                      maxLength={13}
                      pattern="\d*"
                      required
                    />
                  </div>
                </div>

                {/* Row 2: Danh mục */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Danh mục
                  </label>
                  <select
                    value={formData.product_category_id}
                    onChange={(e) => setFormData({ ...formData, product_category_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Row 3: Giá bán & Giá vốn */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Giá bán <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      placeholder="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Giá vốn <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.cost_price}
                      onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      placeholder="0"
                      required
                    />
                  </div>
                </div>

                {/* Row 4: Tồn kho */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Tồn kho
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    placeholder="0"
                    min="0"
                  />
                </div>

                {/* Row 5: Mô tả ngắn */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Mô tả ngắn
                  </label>
                  <textarea
                    value={formData.brief}
                    onChange={(e) => setFormData({ ...formData, brief: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    placeholder="Mô tả ngắn về sản phẩm"
                  />
                </div>

                {/* Row 6: Nội dung chi tiết */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nội dung chi tiết
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    placeholder="Nội dung chi tiết về sản phẩm"
                  />
                </div>

                {/* Row 7: Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Hình ảnh sản phẩm
                  </label>
                  <div className="flex items-start gap-4">
                    {/* Preview */}
                    <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden flex-shrink-0">
                      {formData.image ? (
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    
                    {/* Upload button */}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-200"
                      >
                        <Upload className="w-4 h-4" />
                        Chọn ảnh
                      </label>
                      {formData.image && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image: '' })}
                          className="ml-2 px-4 py-2 text-sm text-red-600 hover:text-red-700"
                        >
                          Xóa ảnh
                        </button>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        PNG, JPG, GIF tối đa 5MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Row 8: Trạng thái */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Trạng thái (status)
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: parseInt(e.target.value) as 0 | 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  >
                    <option value={1}>Hoạt động</option>
                    <option value={0}>Ngừng hoạt động</option>
                  </select>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-[#FE7410] text-white rounded-lg hover:bg-[#E56809] transition-colors"
                  >
                    {editingProduct ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Xác nhận xóa</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Bạn có chắc chắn muốn xóa sản phẩm <strong>{productToDelete?.title || productToDelete?.name}</strong>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setProductToDelete(null);
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Excel Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header - Fixed */}
            <div className="bg-gradient-to-r from-[#FE7410] to-orange-600 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <h3 className="text-xl font-bold text-white">
                Nhập dữ liệu từ Excel
              </h3>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  resetImportModal();
                }}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="p-6 overflow-y-auto flex-1">
              {importStep === 'upload' && (
                <div className="space-y-5">
                  <p className="text-gray-600 dark:text-gray-300">
                    Tải lên file Excel (.xlsx hoặc .xls) chứa dữ liệu sản phẩm.
                  </p>
                  
                  {/* Template Info */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Định dạng file Excel:</h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• <strong>Cột 1:</strong> Mã vạch (bắt buộc)</li>
                      <li>• <strong>Cột 2:</strong> Tên sản phẩm (bắt buộc)</li>
                      <li>• <strong>Cột 3:</strong> Giá bán (bắt buộc)</li>
                      <li>• <strong>Cột 4:</strong> Giá vốn (bắt buộc)</li>
                      <li>• <strong>Cột 5:</strong> Tồn kho</li>
                      <li>• <strong>Cột 6:</strong> Danh mục</li>
                      <li>• <strong>Cột 7:</strong> Mô tả ngắn</li>
                    </ul>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={handleExcelFileUpload}
                      className="hidden"
                      id="excel-upload"
                    />
                    <label
                      htmlFor="excel-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-200"
                    >
                      <Upload className="w-4 h-4" />
                      Chọn file
                    </label>
                    <button
                      onClick={handleDownloadTemplate}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-700 transition-colors"
                    >
                      <FileDown className="w-4 h-4" />
                      Tải file mẫu
                    </button>
                  </div>
                </div>
              )}

              {importStep === 'preview' && (
                <div className="space-y-5">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <p className="text-green-800 dark:text-green-200 font-medium">
                      ✓ Tìm thấy {importPreviewData.length} sản phẩm hợp lệ
                    </p>
                  </div>

                  {importErrors.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <p className="text-red-800 dark:text-red-200 font-medium mb-2">
                        ⚠ Phát hiện {importErrors.length} lỗi:
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        {importErrors.map((error, index) => (
                          <li key={index} className="text-sm text-red-700 dark:text-red-300">
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-[#FEF7ED] dark:bg-gray-700/50">
                          <tr>
                            <th className="text-left px-4 py-3 text-base font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                              MÃ VẠCH
                            </th>
                            <th className="text-left px-4 py-3 text-base font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                              TÊN SẢN PHẨM
                            </th>
                            <th className="text-left px-4 py-3 text-base font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                              GIÁ BÁN
                            </th>
                            <th className="text-left px-4 py-3 text-base font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                              GIÁ VỐN
                            </th>
                            <th className="text-left px-4 py-3 text-base font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                              TỒN KHO
                            </th>
                            <th className="text-left px-4 py-3 text-base font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                              DANH MỤC
                            </th>
                            <th className="text-left px-4 py-3 text-base font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                              MÔ TẢ NGẮN
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800">
                          {importPreviewData.map((item, index) => (
                            <tr key={index} className="transition-colors hover:bg-[#FEF7ED] dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 last:border-0">
                              <td className="px-4 py-3">
                                <span className="text-base text-gray-700 dark:text-gray-300 font-mono">
                                  {item.code}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="font-medium text-gray-900 dark:text-white text-base">
                                  {item.title}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-base font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                                  {item.price.toLocaleString('vi-VN')}₫
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-base font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                  {item.cost_price.toLocaleString('vi-VN')}₫
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-base font-medium text-gray-900 dark:text-white">
                                  {item.quantity.toLocaleString()}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-base text-gray-700 dark:text-gray-300">
                                  {item.category || '—'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-base text-gray-700 dark:text-gray-300">
                                  {item.brief || '—'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {importStep === 'importing' && (
                <div className="space-y-5 py-12">
                  <div className="flex items-center justify-center">
                    <RefreshCw className="w-12 h-12 animate-spin text-[#FE7410]" />
                  </div>
                  <p className="text-center text-gray-600 dark:text-gray-300 font-medium">
                    Đang nhập {importPreviewData.length} sản phẩm...
                  </p>
                </div>
              )}

              {importStep === 'success' && (
                <div className="space-y-5 py-12">
                  <div className="flex items-center justify-center">
                    <CheckCircle className="w-16 h-16 text-green-500" />
                  </div>
                  <p className="text-center text-gray-600 dark:text-gray-300 font-medium text-lg">
                    Nhập thành công {importPreviewData.length} sản phẩm!
                  </p>
                </div>
              )}
            </div>

            {/* Footer - Fixed */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
              {importStep === 'upload' && (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowImportModal(false);
                      resetImportModal();
                    }}
                    className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
                  >
                    Hủy
                  </button>
                </div>
              )}

              {importStep === 'preview' && (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowImportModal(false);
                      resetImportModal();
                    }}
                    className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmImport}
                    disabled={importPreviewData.length === 0}
                    className="flex-1 px-4 py-2.5 bg-[#FE7410] text-white rounded-lg hover:bg-[#E56809] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Nhập dữ liệu ({importPreviewData.length})
                  </button>
                </div>
              )}

              {importStep === 'importing' && (
                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled
                    className="flex-1 px-4 py-2.5 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-lg cursor-not-allowed font-medium"
                  >
                    Đang xử lý...
                  </button>
                </div>
              )}

              {importStep === 'success' && (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowImportModal(false);
                      resetImportModal();
                    }}
                    className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Đóng
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}