import { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';

interface AddUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (unit: { name: string; price: number; isDirectSale: boolean; conversion?: number }, addAnother?: boolean) => void;
  onDelete?: () => void;
  editingUnit?: { id: string; name: string; price: number; isDirectSale: boolean; conversion: number; isBase: boolean } | null;
  baseUnitName?: string;
  isFirstUnit?: boolean;
}

export function AddUnitModal({ isOpen, onClose, onSave, onDelete, editingUnit, baseUnitName, isFirstUnit }: AddUnitModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    conversion: 1,
    isDirectSale: true,
  });

  useEffect(() => {
    if (editingUnit) {
      setFormData({
        name: editingUnit.name || '',
        price: editingUnit.price || 0,
        conversion: editingUnit.conversion || 1,
        isDirectSale: editingUnit.isDirectSale ?? true,
      });
    } else {
      setFormData({
        name: '',
        price: 0,
        conversion: 1,
        isDirectSale: true,
      });
    }
  }, [editingUnit, isOpen]);

  const handleSave = (addAnother: boolean = false) => {
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên đơn vị');
      return;
    }

    onSave(
      {
        name: formData.name.trim(),
        price: formData.price,
        isDirectSale: formData.isDirectSale,
        conversion: isFirstUnit ? 1 : formData.conversion,
      },
      addAnother
    );

    if (!addAnother) {
      onClose();
    } else {
      // Reset form for adding another
      setFormData({
        name: '',
        price: 0,
        conversion: 1,
        isDirectSale: true,
      });
    }
  };

  if (!isOpen) return null;

  const isEditing = !!editingUnit;
  const isEditingBaseUnit = editingUnit?.isBase;
  const title = isEditing 
    ? (isEditingBaseUnit ? 'Sửa đơn vị cơ bản' : 'Sửa đơn vị tính')
    : (isFirstUnit ? 'Thêm đơn vị cơ bản' : 'Thêm đơn vị tính');
  
  const description = (isFirstUnit || isEditingBaseUnit)
    ? 'Đơn vị cơ bản là đơn vị bán phổ biến nhất hoặc đơn vị chính dùng để quản lý tồn kho'
    : `Đơn vị phụ giúp bạn dễ dàng quản lý hàng hóa theo nhiều đơn vị khác nhau. Ví dụ: 1 thùng = 24 chai`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-600 mt-1">{description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Tên đơn vị */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isFirstUnit ? 'Tên đơn vị cơ bản' : 'Tên đơn vị'}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder={isFirstUnit ? "Tên đơn vị cơ bản" : "Tên đơn vị"}
              autoFocus
              className="w-full px-3 py-2 text-sm border border-[#FE7410] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FE7410] focus:border-[#FE7410]"
            />
          </div>

          {/* Quy đổi - Only for non-base units */}
          {!isFirstUnit && !isEditingBaseUnit && baseUnitName && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quy đổi
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">1</span>
                <span className="text-sm font-medium text-gray-900">{formData.name || '...'}</span>
                <span className="text-sm text-gray-600">=</span>
                <input
                  type="number"
                  value={formData.conversion}
                  onChange={(e) => setFormData(prev => ({ ...prev, conversion: Number(e.target.value) }))}
                  className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#FE7410] focus:border-[#FE7410]"
                  min="0.01"
                  step="0.01"
                />
                <span className="text-sm font-medium text-gray-900">{baseUnitName}</span>
              </div>
            </div>
          )}

          {/* Giá bán */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giá bán
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#FE7410] focus:border-[#FE7410] text-right"
              min="0"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50">
          {/* Left side - Delete button (only when editing) */}
          <div>
            {isEditing && onDelete && (
              <button
                onClick={onDelete}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Xóa đơn vị
              </button>
            )}
          </div>

          {/* Right side - Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Bỏ qua
            </button>
            <button
              onClick={() => handleSave(true)}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Xong & Thêm mới
            </button>
            <button
              onClick={() => handleSave(false)}
              className="px-4 py-2 text-sm text-white bg-[#FE7410] rounded-md hover:bg-[#E56600] transition-colors font-medium"
            >
              Xong
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddUnitModal;