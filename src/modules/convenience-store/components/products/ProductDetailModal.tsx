import { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingBag, MessageSquare, Clock } from 'lucide-react';
import { useTranslation } from '../../../../lib/convenience-store-lib/useTranslation';
import type { Product } from '../../../../lib/convenience-store-lib/store';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAdd: (quantity: number, note: string, selectedOptions: { [optionId: string]: string[] }) => void;
}

export function ProductDetailModal({ product, onClose, onAdd }: ProductDetailModalProps) {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<{ [optionId: string]: string[] }>({});

  // Initialize options when product changes
  useEffect(() => {
    if (!product) return;
    
    const initialOptions: { [optionId: string]: string[] } = {};
    if (product.options) {
      product.options.forEach((option) => {
        if (option.required && option.type === 'single' && option.choices.length > 0) {
          initialOptions[option.id] = [option.choices[0].id];
        }
      });
    }
    setSelectedOptions(initialOptions);
    setQuantity(1);
    setNote('');
  }, [product]);

  if (!product) return null;
  const stock = product.stock ?? product.quantity ?? 0;

  const handleOptionChange = (optionId: string, choiceId: string, isMultiple: boolean) => {
    setSelectedOptions((prev) => {
      if (isMultiple) {
        const current = prev[optionId] || [];
        if (current.includes(choiceId)) {
          return { ...prev, [optionId]: current.filter((id) => id !== choiceId) };
        } else {
          return { ...prev, [optionId]: [...current, choiceId] };
        }
      } else {
        return { ...prev, [optionId]: [choiceId] };
      }
    });
  };

  const calculatePrice = () => {
    let price = product.price;
    if (product.options && selectedOptions) {
      product.options.forEach((option) => {
        const selectedChoiceIds = selectedOptions[option.id] || [];
        selectedChoiceIds.forEach((choiceId) => {
          const choice = option.choices.find((c) => c.id === choiceId);
          if (choice) {
            price += choice.priceModifier;
          }
        });
      });
    }
    return price;
  };

  const handleAdd = () => {
    // Validate required options
    if (product.options) {
      for (const option of product.options) {
        if (option.required) {
          const selected = selectedOptions[option.id];
          if (!selected || selected.length === 0) {
            alert(`${t('pleaseSelect') || 'Please select'}: ${option.name}`);
            return;
          }
        }
      }
    }
    onAdd(quantity, note, selectedOptions);
    // Reset
    setQuantity(1);
    setNote('');
    setSelectedOptions({});
  };

  const finalPrice = calculatePrice();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Product Image Header */}
        <div className="relative">
          <div className="aspect-video bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 flex items-center justify-center">
            {product.image ? (
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <ShoppingBag className="w-24 h-24 text-blue-400" />
            )}
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[calc(90vh-240px)] overflow-y-auto">
          {/* Product Info */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <h2 className="text-2xl font-bold text-gray-900 flex-1">{product.name}</h2>
              {stock < 10 && (
                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {t('only') || 'Only'} {stock} {t('left') || 'left'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {product.category}
              </span>
              {product.barcode && (
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {t('barcode')}: {product.barcode}
                </span>
              )}
            </div>

            <div className="text-3xl font-bold text-blue-600 mb-4">{product.price.toLocaleString()}đ</div>

            {/* Description */}
            {product.description && (
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  {t('description') || 'Description'}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>

          {/* Options */}
          {product.options && product.options.length > 0 && (
            <div className="border-t border-gray-200 pt-4 space-y-4">
              <h3 className="font-bold text-gray-900">{t('options') || 'Options'}</h3>
              {product.options.map((option) => (
                <div key={option.id}>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    {option.name}
                    {option.required && (
                      <span className="text-red-500 ml-1">{t('required') || '(Required)'}</span>
                    )}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {option.choices.map((choice) => {
                      const isSelected = selectedOptions[option.id]?.includes(choice.id);
                      return (
                        <button
                          key={choice.id}
                          onClick={() => handleOptionChange(option.id, choice.id, option.type === 'multiple')}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            isSelected
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {choice.name}
                          {choice.priceModifier !== 0 && (
                            <span className="ml-1">
                              ({choice.priceModifier > 0 ? '+' : ''}
                              {choice.priceModifier.toLocaleString()}đ)
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-gray-200 pt-4">
            {/* Quantity Selector */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-900 mb-2">{t('quantity')}</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="w-12 h-12 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-all"
                >
                  <Minus className="w-5 h-5 text-gray-700" />
                </button>
                <div className="flex-1 h-12 bg-blue-50 border-2 border-blue-500 rounded-xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">{quantity}</span>
                </div>
                <button
                  onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                  disabled={quantity >= stock}
                  className="w-12 h-12 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-all"
                >
                  <Plus className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Special Note */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-900 mb-2">
                {t('specialNote') || 'Special Note'} ({t('optional') || 'Optional'})
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <textarea
                  placeholder={t('addNote') || 'Add special requests...'}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full pl-10 pr-3 py-2 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none resize-none text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-700 font-medium">{t('total')}</span>
            <span className="text-2xl font-bold text-gray-900">{(finalPrice * quantity).toLocaleString()}đ</span>
          </div>
          <button
            onClick={handleAdd}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2 text-lg font-bold"
          >
            <ShoppingBag className="w-5 h-5" />
            {t('addToCart') || `Add ${quantity} to Cart`}
          </button>
        </div>
      </div>
    </div>
  );
}