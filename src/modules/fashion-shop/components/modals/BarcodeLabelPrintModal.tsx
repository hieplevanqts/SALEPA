import React, { useState, useRef, useEffect } from 'react';
import { X, Printer, ZoomIn, ZoomOut, Eye, Download } from 'lucide-react';
import JsBarcode from 'jsbarcode';

interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  price: number;
  category?: string;
}

interface BarcodeLabelPrintModalProps {
  product: Product;
  onClose: () => void;
}

// Kích thước tem chuẩn (mm)
const LABEL_SIZES = [
  { 
    id: '35x22', 
    name: '35×22mm', 
    width: 35, 
    height: 22, 
    description: 'Nhỏ - Giá, trang sức',
    preview: 'text-xs'
  },
  { 
    id: '40x30', 
    name: '40×30mm', 
    width: 40, 
    height: 30, 
    description: 'Thời trang nhỏ',
    preview: 'text-sm'
  },
  { 
    id: '50x30', 
    name: '50×30mm', 
    width: 50, 
    height: 30, 
    description: 'Phổ biến - Quần áo',
    popular: true,
    preview: 'text-sm'
  },
  { 
    id: '70x40', 
    name: '70×40mm', 
    width: 70, 
    height: 40, 
    description: 'Lớn - Túi, giày',
    preview: 'text-base'
  },
  { 
    id: '100x50', 
    name: '100×50mm', 
    width: 100, 
    height: 50, 
    description: 'Rất lớn - Thùng carton',
    preview: 'text-base'
  },
  { 
    id: '100x70', 
    name: '100×70mm', 
    width: 100, 
    height: 70, 
    description: 'Jumbo - Marketing',
    preview: 'text-lg'
  },
];

export function BarcodeLabelPrintModal({ product, onClose }: BarcodeLabelPrintModalProps) {
  const [selectedSize, setSelectedSize] = useState(LABEL_SIZES[2]); // Default 50x30mm
  const [quantity, setQuantity] = useState(1);
  const [showPrice, setShowPrice] = useState(true);
  const [showSKU, setShowSKU] = useState(true);
  const [showProductName, setShowProductName] = useState(true);
  const [zoom, setZoom] = useState(1);

  // Generate barcode
  useEffect(() => {
    if (product.barcode) {
      // Generate barcode for all SVG elements with class 'barcode-svg'
      const svgs = document.querySelectorAll('.barcode-svg');
      svgs.forEach((svg) => {
        try {
          JsBarcode(svg, product.barcode, {
            format: 'CODE128',
            width: selectedSize.width < 50 ? 1.5 : 2,
            height: selectedSize.height < 30 ? 30 : 40,
            displayValue: true,
            fontSize: selectedSize.width < 50 ? 10 : 12,
            margin: 2,
          });
        } catch (error) {
          console.error('Barcode generation error:', error);
        }
      });
    }
  }, [product.barcode, selectedSize, quantity]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // In thực tế sẽ dùng jsPDF hoặc html2pdf
    window.print();
  };

  const labels = Array.from({ length: quantity }, (_, i) => i);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FE7410] to-orange-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Printer className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">In tem mã vạch</h2>
                <p className="text-orange-100 text-sm mt-1">{product.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid lg:grid-cols-2 gap-6 p-6">
            {/* Left - Settings */}
            <div className="space-y-6">
              {/* Size Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Kích thước tem <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {LABEL_SIZES.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size)}
                      className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                        selectedSize.id === size.id
                          ? 'border-[#FE7410] bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300 bg-white'
                      }`}
                    >
                      {size.popular && (
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          Phổ biến
                        </div>
                      )}
                      <div className="font-bold text-gray-900">{size.name}</div>
                      <div className="text-xs text-gray-600 mt-1">{size.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Số lượng tem
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-gray-700 transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                    className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg text-center font-bold text-gray-900 focus:border-[#FE7410] focus:outline-none"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(100, quantity + 1))}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-gray-700 transition-colors"
                  >
                    +
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Tối đa 100 tem/lần in</p>
              </div>

              {/* Display Options */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Hiển thị trên tem
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={showProductName}
                      onChange={(e) => setShowProductName(e.target.checked)}
                      className="w-5 h-5 text-[#FE7410] rounded focus:ring-[#FE7410]"
                    />
                    <span className="text-sm font-medium text-gray-900">Tên sản phẩm</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={showPrice}
                      onChange={(e) => setShowPrice(e.target.checked)}
                      className="w-5 h-5 text-[#FE7410] rounded focus:ring-[#FE7410]"
                    />
                    <span className="text-sm font-medium text-gray-900">Giá bán</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={showSKU}
                      onChange={(e) => setShowSKU(e.target.checked)}
                      className="w-5 h-5 text-[#FE7410] rounded focus:ring-[#FE7410]"
                    />
                    <span className="text-sm font-medium text-gray-900">Mã SKU</span>
                  </label>
                </div>
              </div>

              {/* Zoom Control */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Thu phóng preview
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    disabled={zoom <= 0.5}
                  >
                    <ZoomOut className="w-5 h-5" />
                  </button>
                  <div className="flex-1 text-center font-semibold text-gray-700">
                    {Math.round(zoom * 100)}%
                  </div>
                  <button
                    onClick={() => setZoom(Math.min(2, zoom + 0.25))}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    disabled={zoom >= 2}
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Eye className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-semibold text-blue-900 text-sm mb-1">Lưu ý khi in</div>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• Sử dụng giấy in tem chuyên dụng (thermal hoặc laser)</li>
                      <li>• Đảm bảo máy in đã hiệu chuẩn đúng kích thước</li>
                      <li>• In thử 1 tem để kiểm tra trước khi in hàng loạt</li>
                      <li>• Chất lượng mã vạch phụ thuộc vào DPI máy in (khuyên dùng ≥300 DPI)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Preview */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">
                Xem trước ({quantity} tem)
              </label>
              <div className="bg-gray-100 rounded-xl p-6 border-2 border-gray-300 min-h-[500px] flex items-center justify-center">
                <div 
                  className="bg-white p-4 rounded-lg shadow-lg overflow-auto max-h-[600px]"
                  style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
                >
                  <div className="flex flex-wrap gap-4">
                    {labels.slice(0, Math.min(quantity, 20)).map((index) => (
                      <div
                        key={index}
                        className="bg-white border-2 border-dashed border-gray-400 p-2 flex flex-col items-center justify-center"
                        style={{
                          width: `${selectedSize.width}mm`,
                          height: `${selectedSize.height}mm`,
                        }}
                      >
                        {/* Product Name */}
                        {showProductName && (
                          <div 
                            className={`font-bold text-center text-gray-900 line-clamp-1 w-full ${
                              selectedSize.width < 50 ? 'text-[8px]' : 
                              selectedSize.width < 70 ? 'text-[10px]' : 'text-xs'
                            }`}
                          >
                            {product.name}
                          </div>
                        )}

                        {/* Barcode */}
                        <div className="flex-1 flex items-center justify-center w-full">
                          <svg className="barcode-svg w-full h-auto"></svg>
                        </div>

                        {/* SKU & Price */}
                        <div className="w-full flex items-center justify-between gap-1">
                          {showSKU && (
                            <div 
                              className={`font-mono text-gray-600 ${
                                selectedSize.width < 50 ? 'text-[7px]' : 
                                selectedSize.width < 70 ? 'text-[8px]' : 'text-[9px]'
                              }`}
                            >
                              {product.sku}
                            </div>
                          )}
                          {showPrice && (
                            <div 
                              className={`font-bold text-[#FE7410] ${
                                selectedSize.width < 50 ? 'text-[8px]' : 
                                selectedSize.width < 70 ? 'text-[10px]' : 'text-xs'
                              }`}
                            >
                              {product.price.toLocaleString()}đ
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {quantity > 20 && (
                    <div className="text-center text-xs text-gray-500 mt-4">
                      ... và {quantity - 20} tem nữa (preview tối đa 20 tem)
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t bg-gray-50 p-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-semibold">{quantity}</span> tem × <span className="font-semibold">{selectedSize.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Tải PDF
            </button>
            <button
              onClick={handlePrint}
              className="px-6 py-2.5 bg-[#FE7410] hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              <Printer className="w-5 h-5" />
              In ngay
            </button>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area,
          .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            size: auto;
            margin: 5mm;
          }
        }
      `}</style>
    </div>
  );
}
