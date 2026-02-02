import { Plus, Minus, Trash2, ShoppingBag, MessageSquare } from 'lucide-react';
import { useTranslation } from '../../../../lib/spa-lib/useTranslation';
import type { CartItem } from '../../../../lib/spa-lib/store';

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onUpdateNote?: (id: string, note: string) => void;
  onRemove: (id: string) => void;
  compact?: boolean;
}

export function CartItemCard({ item, onUpdateQuantity, onUpdateNote, onRemove, compact = false }: CartItemCardProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200 hover:border-blue-300 transition-all">
      <div className="flex items-start gap-2 mb-2">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <ShoppingBag className="w-6 h-6 text-blue-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{item.name}</h3>
          <div className="text-xs text-gray-500">{item.category}</div>
          
          {/* Show selected options if any */}
          {item.selectedOptions && item.selectedOptions.length > 0 && (
            <div className="text-xs text-blue-600 mt-1">
              {item.selectedOptions.map((opt, idx) => (
                <span key={idx} className="inline-block bg-blue-50 px-1.5 py-0.5 rounded mr-1 mb-1">
                  {opt.choiceName}
                  {opt.priceModifier !== 0 && ` (+${opt.priceModifier.toLocaleString()}đ)`}
                </span>
              ))}
            </div>
          )}
          
          <div className="text-sm font-bold text-blue-600 mt-0.5">
            {item.price.toLocaleString()}đ
          </div>
        </div>
        <button
          onClick={() => onRemove(item.id)}
          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all"
          title={t('remove')}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            className="w-8 h-8 bg-white border border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <Minus className="w-4 h-4 text-gray-700" />
          </button>
          <div className="w-12 h-8 bg-white border border-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-blue-600">{item.quantity}</span>
          </div>
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-all"
          >
            <Plus className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Item Total */}
        <div className="ml-auto text-right">
          <div className="text-xs text-gray-500">{t('subtotal')}</div>
          <div className="text-sm font-bold text-gray-900">
            {(item.price * item.quantity).toLocaleString()}đ
          </div>
        </div>
      </div>

      {/* Note field per item */}
      {onUpdateNote && item.note !== undefined && (
        <div className="mt-2 relative">
          <MessageSquare className="absolute left-2 top-2 w-3 h-3 text-gray-400" />
          <input
            type="text"
            placeholder={t('note') || 'Note'}
            value={item.note || ''}
            onChange={(e) => onUpdateNote(item.id, e.target.value)}
            className="w-full pl-7 pr-2 py-1 text-xs border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}
