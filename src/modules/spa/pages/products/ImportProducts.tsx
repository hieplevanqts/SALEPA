import { useState } from 'react';
import { X, Upload, Download, CheckCircle, AlertCircle, Paperclip } from 'lucide-react';
import { useStore } from '../../../../lib/spa-lib/store';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface ImportProductsProps {
  onClose: () => void;
}

interface ParsedProduct {
  name: string;
  price: number;
  category: string;
  stock: number;
  type: 'product' | 'service' | 'treatment';
  duration?: number;
  sessions?: number;
  barcode?: string;
  description?: string;
  status: 'valid' | 'error';
  errors: string[];
  rowNumber: number;
}

export function ImportProducts({ onClose }: ImportProductsProps) {
  const { addProduct, products, categories } = useStore();
  const [parsedData, setParsedData] = useState<ParsedProduct[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Get categories list (fallback to extracting from products if empty)
  const categoryList = categories.length > 0 
    ? categories 
    : Array.from(new Set(products.map(p => p.category))).filter(Boolean);

  // Add default categories if list is empty
  const defaultCategories = ['Chăm sóc da mặt', 'Dịch vụ massage', 'Liệu trình trị liệu', 'Sản phẩm làm đẹp', 'Khác'];
  const finalCategories = categoryList.length > 0 ? categoryList : defaultCategories;

  // Download template Excel file with Data Validation (Dropdown)
  const handleDownloadTemplate = () => {
    const workbook = XLSX.utils.book_new();
    
    // Sample data
    const templateData = [
      {
        'Tên sản phẩm/Dịch vụ (*)': 'Sữa rửa mặt Senka',
        'Giá bán (*)': 150000,
        'Danh mục (*)': finalCategories[0],
        'Loại (*)': 'Sản phẩm',
        'Tồn kho': 50,
        'Thời lượng (phút)': '',
        'Số buổi': '',
        'Mã vạch': 'SRF001',
        'Mô tả': 'Sữa rửa mặt làm sạch sâu'
      },
      {
        'Tên sản phẩm/Dịch vụ (*)': 'Massage body thư giãn',
        'Giá bán (*)': 300000,
        'Danh mục (*)': finalCategories[1] || finalCategories[0],
        'Loại (*)': 'Dịch vụ',
        'Tồn kho': 0,
        'Thời lượng (phút)': 60,
        'Số buổi': '',
        'Mã vạch': 'SV001',
        'Mô tả': 'Massage toàn thân thư giãn'
      },
      {
        'Tên sản phẩm/Dịch vụ (*)': 'Liệu trình trị mụn 10 buổi',
        'Giá bán (*)': 5000000,
        'Danh mục (*)': finalCategories[2] || finalCategories[0],
        'Loại (*)': 'Liệu trình',
        'Tồn kho': 0,
        'Thời lượng (phút)': 90,
        'Số buổi': 10,
        'Mã vạch': 'LT001',
        'Mô tả': 'Gói 10 buổi điều trị mụn chuyên sâu'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 30 }, // Tên
      { wch: 15 }, // Giá
      { wch: 25 }, // Danh mục
      { wch: 15 }, // Loại
      { wch: 12 }, // Tồn kho
      { wch: 18 }, // Thời lượng
      { wch: 10 }, // Số buổi
      { wch: 15 }, // Mã vạch
      { wch: 40 }  // Mô tả
    ];

    // Add Data Validation for "Loại" column (Column D, rows 2-1000)
    if (!ws['!dataValidation']) ws['!dataValidation'] = [];
    
    // Dropdown for "Loại" - Column D (index 3)
    ws['!dataValidation'].push({
      type: 'list',
      allowBlank: false,
      sqref: 'D2:D1000',
      formulas: ['"Sản phẩm,Dịch vụ,Liệu trình"']
    });

    // Dropdown for "Danh mục" - Column C (index 2)
    const categoryDropdown = finalCategories.join(',');
    ws['!dataValidation'].push({
      type: 'list',
      allowBlank: false,
      sqref: 'C2:C1000',
      formulas: [`"${categoryDropdown}"`]
    });

    XLSX.utils.book_append_sheet(workbook, ws, 'Mẫu Import');
    
    XLSX.writeFile(workbook, 'Mau_Import_San_Pham.xlsx');
    
    toast.success('✅ Đã tải xuống file mẫu');
  };

  // Validate product data
  const validateProduct = (row: any, rowNumber: number): ParsedProduct => {
    const errors: string[] = [];
    
    // Required fields
    const name = row['Tên sản phẩm/Dịch vụ (*)']?.toString().trim();
    const priceRaw = row['Giá bán (*)'];
    const category = row['Danh mục (*)']?.toString().trim();
    const typeRaw = row['Loại (*)']?.toString().trim();
    
    // Optional fields
    const stockRaw = row['Tồn kho'];
    const durationRaw = row['Thời lượng (phút)'];
    const sessionsRaw = row['Số buổi'];
    const barcode = row['Mã vạch']?.toString().trim();
    const description = row['Mô tả']?.toString().trim();
    
    // Validate required fields
    if (!name) errors.push('Thiếu tên');
    if (!priceRaw && priceRaw !== 0) errors.push('Thiếu giá');
    if (!category) errors.push('Thiếu danh mục');
    if (!typeRaw) errors.push('Thiếu loại');
    
    // Parse and validate price
    const price = parseFloat(priceRaw);
    if (isNaN(price) || price < 0) {
      errors.push('Giá không hợp lệ');
    }
    
    // Map Vietnamese type names to internal type
    let type: 'product' | 'service' | 'treatment' = 'product';
    const typeMapping: Record<string, 'product' | 'service' | 'treatment'> = {
      'sản phẩm': 'product',
      'san pham': 'product',
      'product': 'product',
      'dịch vụ': 'service',
      'dich vu': 'service',
      'service': 'service',
      'liệu trình': 'treatment',
      'lieu trinh': 'treatment',
      'treatment': 'treatment'
    };
    
    const typeLower = typeRaw?.toLowerCase() || '';
    if (typeMapping[typeLower]) {
      type = typeMapping[typeLower];
    } else if (typeRaw) {
      errors.push('Loại không hợp lệ');
    }
    
    // Parse stock
    const stock = stockRaw ? parseInt(stockRaw) : 0;
    if (isNaN(stock) || stock < 0) {
      errors.push('Tồn kho không hợp lệ');
    }
    
    // Type-specific validation
    let duration: number | undefined;
    let sessions: number | undefined;
    
    if (type === 'service') {
      duration = durationRaw ? parseInt(durationRaw) : undefined;
      if (!duration || duration <= 0) {
        errors.push('DV phải có thời lượng');
      }
    } else if (type === 'treatment') {
      duration = durationRaw ? parseInt(durationRaw) : undefined;
      sessions = sessionsRaw ? parseInt(sessionsRaw) : undefined;
      if (!duration || duration <= 0) {
        errors.push('LT phải có thời lượng');
      }
      if (!sessions || sessions <= 0) {
        errors.push('LT phải có số buổi');
      }
    }
    
    // Check duplicate
    if (name) {
      const existingProduct = products.find(prod => 
        prod.name.toLowerCase() === name.toLowerCase()
      );
      if (existingProduct) {
        errors.push('Trùng tên');
      }
    }
    
    return {
      name: name || '',
      price: price || 0,
      category: category || '',
      stock,
      type: type || 'product',
      duration,
      sessions,
      barcode,
      description,
      status: errors.length === 0 ? 'valid' : 'error',
      errors,
      rowNumber
    };
  };

  // Parse Excel file
  const parseExcelFile = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          toast.error('❌ File Excel trống');
          return;
        }
        
        // Validate all rows
        const parsed = jsonData.map((row, index) => 
          validateProduct(row, index + 2) // +2 because row 1 is header
        );
        
        setParsedData(parsed);
        setShowPreview(true);
        
        const validCount = parsed.filter(p => p.status === 'valid').length;
        const errorCount = parsed.filter(p => p.status === 'error').length;
        
        toast.success(`📊 Đọc file thành công: ${validCount} hợp lệ, ${errorCount} lỗi`);
      } catch (error) {
        console.error('Error parsing Excel:', error);
        toast.error('❌ Lỗi đọc file Excel');
      }
    };
    
    reader.onerror = () => {
      toast.error('❌ Không thể đọc file');
    };
    
    reader.readAsBinaryString(file);
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validExtensions = ['.xlsx', '.xls', '.csv'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (!validExtensions.includes(fileExtension)) {
        toast.error('❌ Định dạng file không hợp lệ');
        return;
      }
      
      parseExcelFile(file);
    }
  };

  // Handle drag and drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      const validExtensions = ['.xlsx', '.xls', '.csv'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (!validExtensions.includes(fileExtension)) {
        toast.error('❌ Định dạng file không hợp lệ');
        return;
      }
      
      parseExcelFile(file);
    }
  };

  // Import valid products
  const handleImport = () => {
    const validProducts = parsedData.filter(p => p.status === 'valid');
    
    if (validProducts.length === 0) {
      toast.error('❌ Không có sản phẩm hợp lệ để import');
      return;
    }
    
    setImporting(true);
    
    try {
      validProducts.forEach((p, index) => {
        // Generate barcode if not provided
        const barcode = p.barcode || `${p.type.toUpperCase().substring(0, 3)}${Date.now()}${index}`;
        
        // Add product
        addProduct({
          name: p.name,
          price: p.price,
          category: p.category,
          stock: p.stock,
          productType: p.type,
          duration: p.duration,
          sessions: p.sessions,
          barcode,
          description: p.description || '',
        });
      });
      
      toast.success(`✅ Import thành công ${validProducts.length} sản phẩm`);
      onClose();
    } catch (error) {
      console.error('Import error:', error);
      toast.error('❌ Lỗi khi import');
    } finally {
      setImporting(false);
    }
  };

  const validCount = parsedData.filter(p => p.status === 'valid').length;
  const errorCount = parsedData.filter(p => p.status === 'error').length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: '#FE7410' }}>
            <Upload className="w-5 h-5" />
            Import Excel
          </h2>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg transition-all hover:bg-gray-100" 
            style={{ color: '#6B7280' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!showPreview ? (
            <div>
              {/* File Upload Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  File excel<span className="text-red-500">*</span>
                </label>
                
                <div
                  className={`border-2 border-dashed rounded-lg p-8 transition-all bg-gray-50 ${
                    isDragging 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer block text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-700 mb-3">
                      <Paperclip className="w-5 h-5" />
                      <span className="text-sm font-medium">Chọn file tải lên</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      (Tối đa 10MB)
                    </p>
                  </label>
                </div>
                
                <p className="text-xs text-gray-600 mt-3">
                  Chú ý: Hỗ trợ file .xls, .xlsx, .csv
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 text-sm">
                <button
                  onClick={handleDownloadTemplate}
                  className="text-gray-700 hover:text-gray-900 font-medium flex items-center gap-1.5 hover:underline"
                >
                  <Download className="w-4 h-4" />
                  Tải file mẫu
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                  <div className="text-xs text-blue-600 mb-1">Tổng số</div>
                  <div className="text-xl font-bold text-blue-900">{parsedData.length}</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                  <div className="text-xs text-green-600 mb-1">Hợp lệ</div>
                  <div className="text-xl font-bold text-green-900">{validCount}</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  <div className="text-xs text-red-600 mb-1">Có lỗi</div>
                  <div className="text-xl font-bold text-red-900">{errorCount}</div>
                </div>
              </div>

              {/* Preview Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2.5 border-b">
                  <h3 className="font-bold text-sm text-gray-900">Xem trước dữ liệu</h3>
                </div>
                <div className="overflow-x-auto" style={{ maxHeight: '400px' }}>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="text-left py-2 px-3 text-xs font-bold text-gray-700 border-b">STT</th>
                        <th className="text-center py-2 px-3 text-xs font-bold text-gray-700 border-b">TT</th>
                        <th className="text-left py-2 px-3 text-xs font-bold text-gray-700 border-b">Tên</th>
                        <th className="text-right py-2 px-3 text-xs font-bold text-gray-700 border-b">Giá</th>
                        <th className="text-left py-2 px-3 text-xs font-bold text-gray-700 border-b">Danh mục</th>
                        <th className="text-center py-2 px-3 text-xs font-bold text-gray-700 border-b">Loại</th>
                        <th className="text-center py-2 px-3 text-xs font-bold text-gray-700 border-b">Tồn</th>
                        <th className="text-center py-2 px-3 text-xs font-bold text-gray-700 border-b">TL/SB</th>
                        <th className="text-left py-2 px-3 text-xs font-bold text-gray-700 border-b">Lỗi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.map((product, index) => (
                        <tr key={index} className={`border-b hover:bg-gray-50 ${product.status === 'error' ? 'bg-red-50' : ''}`}>
                          <td className="py-2 px-3 text-xs text-gray-600">{product.rowNumber}</td>
                          <td className="py-2 px-3 text-center">
                            {product.status === 'valid' ? (
                              <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-red-500 mx-auto" />
                            )}
                          </td>
                          <td className="py-2 px-3 text-xs text-gray-900 font-medium">{product.name}</td>
                          <td className="py-2 px-3 text-xs text-right text-gray-900">
                            {product.price.toLocaleString()}đ
                          </td>
                          <td className="py-2 px-3 text-xs text-gray-700">{product.category}</td>
                          <td className="py-2 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              product.type === 'product' ? 'bg-blue-100 text-blue-700' :
                              product.type === 'service' ? 'bg-green-100 text-green-700' :
                              'bg-purple-100 text-purple-700'
                            }`}>
                              {product.type === 'product' ? 'SP' : product.type === 'service' ? 'DV' : 'LT'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-xs text-center text-gray-700">{product.stock}</td>
                          <td className="py-2 px-3 text-xs text-center text-gray-700">
                            {product.duration ? `${product.duration}p` : '-'}
                            {product.sessions ? `/${product.sessions}b` : ''}
                          </td>
                          <td className="py-2 px-3 text-xs text-red-600">
                            {product.errors.join(', ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex-shrink-0 flex items-center justify-end gap-3">
          {showPreview && (
            <button
              onClick={() => {
                setShowPreview(false);
                setParsedData([]);
              }}
              disabled={importing}
              className="px-5 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Quay lại
            </button>
          )}

          {showPreview ? (
            <button
              onClick={handleImport}
              disabled={validCount === 0 || importing}
              className="px-5 py-2 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              style={{ backgroundColor: '#FE7410' }}
            >
              {importing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang import...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Import {validCount} sản phẩm
                </>
              )}
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
            >
              Hủy
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
