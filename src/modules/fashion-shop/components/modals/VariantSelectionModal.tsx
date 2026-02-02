import { useState, useEffect } from 'react';
import { X, Package, DollarSign, Tag, Check, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../../../../lib/fashion-shop-lib/api';
import type { ProductVariant } from '../../../../lib/fashion-shop-lib/mockProductData_fashion_only';

interface VariantSelectionModalProps {
  productId: string;
  productName: string;
  productPrice: number;
  productImage?: string;
  onSelect: (variant: ProductVariant & { quantity: number }) => void;
  onClose: () => void;
}

export function VariantSelectionModal({
  productId,
  productName,
  productPrice,
  productImage,
  onSelect,
  onClose,
}: VariantSelectionModalProps) {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  // Load variants on mount
  useEffect(() => {
    loadVariants();
  }, [productId]);

  const loadVariants = async () => {
    setLoading(true);
    setError(null);
    try {
      const [variantsResponse, inventoriesResponse] = await Promise.all([
        api.getProductVariantsByProduct(productId),
        api.getInventories(),
      ]);
      
      if (variantsResponse.success && variantsResponse.data) {
        // Build inventory map
        const inventoryMap = new Map<string, number>();
        if (inventoriesResponse.success && inventoriesResponse.data) {
          inventoriesResponse.data.forEach((inv: any) => {
            inventoryMap.set(inv.variant_id, inv.on_hand || 0);
          });
        }
        
        // Enrich variants with inventory data
        const enrichedVariants = variantsResponse.data.map((v: any) => ({
          ...v,
          quantity: inventoryMap.get(v._id) || 0,
        }));
        
        setVariants(enrichedVariants);
        
        // Auto-select first available variant
        const firstAvailable = enrichedVariants.find(
          (v: any) => v.status === 1 && !v.is_sold_out && v.quantity > 0
        );
        if (firstAvailable) {
          setSelectedVariant(firstAvailable);
        }
      } else {
        setError(variantsResponse.error || 'Không thể tải variants');
      }
    } catch (err) {
      setError('Lỗi kết nối');
      console.error('Load variants error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedVariant) {
      onSelect({ ...selectedVariant, quantity: selectedVariant.quantity });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FE7410] to-orange-600 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Chọn phân loại</h2>
              <p className="text-sm text-orange-100">{productName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Product Preview */}
        {productImage && (
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-white shadow-md">
                <img 
                  src={productImage} 
                  alt={productName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{productName}</h3>
                <p className="text-sm text-gray-500">
                  Giá gốc: <span className="font-bold text-[#FE7410]">{productPrice.toLocaleString()}đ</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-[#FE7410] animate-spin mb-3" />
              <p className="text-gray-500">Đang tải phân loại...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
              <p className="text-red-600 font-medium mb-2">Lỗi tải dữ liệu</p>
              <p className="text-gray-500 text-sm">{error}</p>
              <button
                onClick={loadVariants}
                className="mt-4 px-4 py-2 bg-[#FE7410] text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Thử lại
              </button>
            </div>
          ) : variants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500">Sản phẩm này không có phân loại</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Có {variants.length} phân loại • Vui lòng chọn 1 loại
              </p>
              {variants.map((variant) => {
                const isSelected = selectedVariant?._id === variant._id;
                const isAvailable = variant.status === 1 && !variant.is_sold_out && variant.quantity > 0;
                const priceDisplay = variant.price || productPrice;

                return (
                  <button
                    key={variant._id}
                    onClick={() => isAvailable && setSelectedVariant(variant)}
                    disabled={!isAvailable}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-[#FE7410] bg-orange-50 shadow-md'
                        : isAvailable
                        ? 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                        : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            isSelected
                              ? 'border-[#FE7410] bg-[#FE7410]'
                              : 'border-gray-300 bg-white'
                          }`}>
                            {isSelected && <Check className="w-4 h-4 text-white" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Tag className="w-4 h-4 text-gray-400" />
                              <span className={`font-semibold ${
                                isSelected ? 'text-[#FE7410]' : 'text-gray-900'
                              }`}>
                                {variant.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <div className="flex items-center gap-1 text-sm">
                                <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                                <span className="font-bold text-gray-900">
                                  {priceDisplay.toLocaleString()}đ
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-sm">
                                <Package className="w-3.5 h-3.5 text-gray-400" />
                                <span className={`font-medium ${
                                  variant.quantity > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {variant.is_sold_out 
                                    ? 'Hết hàng' 
                                    : variant.quantity > 0
                                    ? `Còn ${variant.quantity}`
                                    : 'Hết hàng'
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {!isAvailable && (
                        <div className="ml-3">
                          <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                            Không khả dụng
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedVariant || loading}
            className="flex-1 px-6 py-2.5 bg-[#FE7410] text-white font-bold rounded-lg hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg disabled:shadow-none"
          >
            {selectedVariant ? (
              `Thêm vào giỏ • ${(selectedVariant.price || productPrice).toLocaleString()}đ`
            ) : (
              'Vui lòng chọn phân loại'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}