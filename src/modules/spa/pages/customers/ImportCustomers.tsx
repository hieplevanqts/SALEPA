import { useState } from 'react';
import { X, Upload, Download, CheckCircle, AlertCircle, Paperclip } from 'lucide-react';
import { useStore } from '../../../../lib/spa-lib/store';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface ImportCustomersProps {
  onClose: () => void;
}

interface ParsedCustomer {
  name: string;
  phone: string;
  email?: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  address?: string;
  status: 'valid' | 'error';
  errors: string[];
  rowNumber: number;
}

export function ImportCustomers({ onClose }: ImportCustomersProps) {
  const { addCustomer, customers } = useStore();
  const [parsedData, setParsedData] = useState<ParsedCustomer[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Download template Excel file with Data Validation (Dropdown)
  const handleDownloadTemplate = () => {
    const workbook = XLSX.utils.book_new();
    
    // Sample data
    const templateData = [
      {
        'Tên khách hàng (*)': 'Nguyễn Văn A',
        'Số điện thoại (*)': '0901234567',
        'Email': 'nguyenvana@gmail.com',
        'Giới tính': 'Nam',
        'Ngày sinh': '15/05/1990',
        'Địa chỉ': '123 Nguyễn Huệ, Q.1, TP.HCM'
      },
      {
        'Tên khách hàng (*)': 'Trần Thị B',
        'Số điện thoại (*)': '0912345678',
        'Email': 'tranthib@gmail.com',
        'Giới tính': 'Nữ',
        'Ngày sinh': '20/08/1995',
        'Địa chỉ': '456 Lê Lợi, Q.3, TP.HCM'
      },
      {
        'Tên khách hàng (*)': 'Lê Văn C',
        'Số điện thoại (*)': '0923456789',
        'Email': '',
        'Giới tính': 'Nam',
        'Ngày sinh': '',
        'Địa chỉ': '789 Trần Hưng Đạo, Q.5, TP.HCM'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 25 }, // Tên
      { wch: 15 }, // SĐT
      { wch: 25 }, // Email
      { wch: 12 }, // Giới tính
      { wch: 15 }, // Ngày sinh
      { wch: 35 }  // Địa chỉ
    ];

    // Add Data Validation for "Giới tính" column (Column D, rows 2-1000)
    if (!ws['!dataValidation']) ws['!dataValidation'] = [];
    
    // Dropdown for "Giới tính" - Column D (index 3)
    ws['!dataValidation'].push({
      type: 'list',
      allowBlank: true,
      sqref: 'D2:D1000',
      formulas: ['"Nam,Nữ,Khác"']
    });

    XLSX.utils.book_append_sheet(workbook, ws, 'Mẫu Import');
    
    XLSX.writeFile(workbook, 'Mau_Import_Khach_Hang.xlsx');
    
    toast.success('✅ Đã tải xuống file mẫu');
  };

  // Validate customer data
  const validateCustomer = (row: any, rowNumber: number): ParsedCustomer => {
    const errors: string[] = [];
    
    // Required fields
    const name = row['Tên khách hàng (*)']?.toString().trim();
    const phone = row['Số điện thoại (*)']?.toString().trim();
    
    // Optional fields
    const email = row['Email']?.toString().trim();
    const genderRaw = row['Giới tính']?.toString().trim();
    const dateOfBirth = row['Ngày sinh']?.toString().trim();
    const address = row['Địa chỉ']?.toString().trim();
    
    // Validate required fields
    if (!name) errors.push('Thiếu tên khách hàng');
    if (!phone) errors.push('Thiếu số điện thoại');
    
    // Validate phone format (basic check)
    if (phone && !/^[0-9]{10,11}$/.test(phone)) {
      errors.push('SĐT không đúng định dạng');
    }
    
    // Validate email format (basic check)
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Email không hợp lệ');
    }
    
    // Map Vietnamese gender names to internal gender
    let gender: 'male' | 'female' | 'other' | undefined;
    if (genderRaw) {
      const genderMapping: Record<string, 'male' | 'female' | 'other'> = {
        'nam': 'male',
        'male': 'male',
        'nữ': 'female',
        'nu': 'female',
        'female': 'female',
        'khác': 'other',
        'khac': 'other',
        'other': 'other'
      };
      gender = genderMapping[genderRaw.toLowerCase()];
      if (!gender) {
        errors.push('Giới tính không hợp lệ');
      }
    }
    
    // Check duplicate phone
    if (phone) {
      const existingCustomer = customers.find(c => c.phone === phone);
      if (existingCustomer) {
        errors.push('SĐT đã tồn tại');
      }
    }
    
    return {
      name: name || '',
      phone: phone || '',
      email,
      gender,
      dateOfBirth,
      address,
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
          validateCustomer(row, index + 2) // +2 because row 1 is header
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

  // Import valid customers
  const handleImport = () => {
    const validCustomers = parsedData.filter(p => p.status === 'valid');
    
    if (validCustomers.length === 0) {
      toast.error('❌ Không có khách hàng hợp lệ để import');
      return;
    }
    
    setImporting(true);
    
    try {
      validCustomers.forEach((c) => {
        addCustomer({
          name: c.name,
          phone: c.phone,
          email: c.email,
          gender: c.gender,
          dateOfBirth: c.dateOfBirth,
          address: c.address,
        });
      });
      
      toast.success(`✅ Import thành công ${validCustomers.length} khách hàng`);
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

  // Format gender display
  const formatGender = (gender?: 'male' | 'female' | 'other') => {
    if (!gender) return '-';
    return gender === 'male' ? 'Nam' : gender === 'female' ? 'Nữ' : 'Khác';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: '#FE7410' }}>
            <Upload className="w-5 h-5" />
            Import Khách hàng
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
                        <th className="text-left py-2 px-3 text-xs font-bold text-gray-700 border-b">SĐT</th>
                        <th className="text-left py-2 px-3 text-xs font-bold text-gray-700 border-b">Email</th>
                        <th className="text-center py-2 px-3 text-xs font-bold text-gray-700 border-b">Giới tính</th>
                        <th className="text-left py-2 px-3 text-xs font-bold text-gray-700 border-b">Ngày sinh</th>
                        <th className="text-left py-2 px-3 text-xs font-bold text-gray-700 border-b">Địa chỉ</th>
                        <th className="text-left py-2 px-3 text-xs font-bold text-gray-700 border-b">Lỗi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.map((customer, index) => (
                        <tr key={index} className={`border-b hover:bg-gray-50 ${customer.status === 'error' ? 'bg-red-50' : ''}`}>
                          <td className="py-2 px-3 text-xs text-gray-600">{customer.rowNumber}</td>
                          <td className="py-2 px-3 text-center">
                            {customer.status === 'valid' ? (
                              <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-red-500 mx-auto" />
                            )}
                          </td>
                          <td className="py-2 px-3 text-xs text-gray-900 font-medium">{customer.name}</td>
                          <td className="py-2 px-3 text-xs text-gray-900">{customer.phone}</td>
                          <td className="py-2 px-3 text-xs text-gray-700">{customer.email || '-'}</td>
                          <td className="py-2 px-3 text-xs text-center text-gray-700">{formatGender(customer.gender)}</td>
                          <td className="py-2 px-3 text-xs text-gray-700">{customer.dateOfBirth || '-'}</td>
                          <td className="py-2 px-3 text-xs text-gray-700">{customer.address || '-'}</td>
                          <td className="py-2 px-3 text-xs text-red-600">
                            {customer.errors.join(', ')}
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
                  Import {validCount} khách hàng
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