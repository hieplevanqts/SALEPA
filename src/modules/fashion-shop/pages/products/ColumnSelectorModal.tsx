import React from 'react';
import { X } from 'lucide-react';

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

interface ColumnSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  columnVisibility: ColumnVisibility;
  onToggleColumn: (column: keyof ColumnVisibility) => void;
}

const columnLabels: Record<keyof ColumnVisibility, string> = {
  checkbox: 'Checkbox',
  image: 'Hình ảnh',
  code: 'Mã',
  barcode: 'Barcode',
  title: 'Tên',
  price: 'Giá bán',
  cost_price: 'Giá vốn',
  category: 'Danh mục',
  brand: 'Thương hiệu',
  order_count: 'Đã bán',
  created_at: 'Ngày tạo',
};

export function ColumnSelectorModal({ 
  isOpen, 
  onClose, 
  columnVisibility, 
  onToggleColumn 
}: ColumnSelectorModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-20 right-6 z-50 bg-white border-2 border-gray-200 rounded-lg shadow-xl w-[500px] max-h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900">Chọn cột hiển thị</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Grid Content */}
        <div className="p-4 overflow-y-auto">
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(columnVisibility) as Array<keyof ColumnVisibility>).map((key) => {
              const isVisible = columnVisibility[key];
              return (
                <label
                  key={key}
                  className={`flex items-center gap-2 px-3 py-2 rounded border cursor-pointer transition-all ${
                    isVisible
                      ? 'border-[#FE7410] bg-orange-50'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={() => onToggleColumn(key)}
                    className="w-4 h-4 text-[#FE7410] border-gray-300 rounded focus:ring-[#FE7410]"
                  />
                  <span className={`text-xs font-medium ${
                    isVisible ? 'text-gray-900' : 'text-gray-600'
                  }`}>
                    {columnLabels[key]}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}