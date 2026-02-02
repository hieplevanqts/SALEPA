import { Plus, ShoppingBag } from 'lucide-react';
import { useTranslation } from '../../../../lib/convenience-store-lib/useTranslation';
import type { Product } from '../../../../lib/convenience-store-lib/store';

interface ProductCardProps {
  product: Product;
  onQuickAdd: (productId: string) => void;
  onViewDetails: (product: Product) => void;
  isSelected: boolean;
}

export function ProductCard({ product, onQuickAdd, onViewDetails, isSelected }: ProductCardProps) {
  const { t } = useTranslation();

  return (
    <div
      className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden ${
        isSelected ? 'ring-2 ring-blue-500 scale-95' : ''
      }`}
    >
      {/* Product Image - Click to view details */}
      <div
        className="aspect-square bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-all"
        onClick={() => onViewDetails(product)}
      >
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <ShoppingBag className="w-10 h-10 text-blue-300" />
        )}
      </div>

      {/* Product Info */}
      <div className="p-2">
        <h3
          className="font-bold text-gray-900 text-xs mb-1 line-clamp-2 min-h-[2rem] cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => onViewDetails(product)}
        >
          {product.name}
        </h3>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-blue-600">
            {product.price.toLocaleString()}đ
          </span>
          {product.stock < 10 && (
            <span className="text-xs bg-orange-100 text-orange-600 px-1 py-0.5 rounded">
              {product.stock}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickAdd(product.id);
          }}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-1.5 rounded-lg hover:shadow-md transition-all flex items-center justify-center gap-1 text-xs font-medium"
        >
          <Plus className="w-3 h-3" />
          {t('add')}
        </button>
      </div>
    </div>
  );
}
