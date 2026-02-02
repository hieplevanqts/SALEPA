import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface VariantEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (variantData: any) => void;
  variant: any;
  productTitle: string;
}

export function VariantEditModal({ isOpen, onClose, onSave, variant, productTitle }: VariantEditModalProps) {
  const [formData, setFormData] = useState({
    sku: '',
    barcode: '',
    costPrice: 0,
    price: 0,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (variant) {
      setFormData({
        sku: variant.sku || '',
        barcode: variant.barcode || '',
        costPrice: variant.costPrice || variant.cost_price || 0,
        price: variant.price || 0,
      });
    }
  }, [variant]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.sku.trim()) {
      newErrors.sku = 'Mã SKU là bắt buộc';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Giá bán là bắt buộc';
    }

    if (formData.price > 0 && formData.costPrice > 0 && formData.price < formData.costPrice) {
      newErrors.price = 'Giá bán phải lớn hơn hoặc bằng giá vốn';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    onSave({
      ...variant,
      ...formData,
      cost_price: formData.costPrice, // Save to API field
    });
    toast.success('Đã lưu thay đổi biến thể');
    onClose();
  };

  if (!isOpen) return null;

  // Tạo variant title từ các options
  const variantTitle = variant?.options
    ? Object.values(variant.options).join(' - ')
    : variant?.title || '';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header - Màu cam */}
        <div className="bg-[#FE7410] px-6 py-4 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-white">Chỉnh sửa biến thể</h2>
            <p className="text-white/90 text-sm mt-1">
              {variantTitle && `${variantTitle} - `}{productTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/90 hover:text-white transition-colors ml-4 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-4">
            {/* SKU & Barcode */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Mã hàng (SKU) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                  className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-[#FE7410] focus:border-transparent ${
                    errors.sku ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="PRD-0001-RED-M"
                />
                {errors.sku && (
                  <p className="mt-1 text-xs text-red-500">{errors.sku}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Mã vạch (Barcode)
                </label>
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                  placeholder="8934567890123-1"
                />
              </div>
            </div>

            {/* Giá vốn & Giá bán */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Giá vốn
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.costPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, costPrice: Number(e.target.value) }))}
                    className="w-full px-3 py-2 pr-8 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
                    placeholder="120000"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₫</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Giá bán <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                    className={`w-full px-3 py-2 pr-8 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-[#FE7410] focus:border-transparent ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="199000"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₫</span>
                </div>
                {errors.price && (
                  <p className="mt-1 text-xs text-red-500">{errors.price}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 bg-gray-50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 text-sm font-medium text-white bg-[#FE7410] rounded-md hover:bg-[#E56600] transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Chỉnh sửa biến thể
          </button>
        </div>
      </div>
    </div>
  );
}