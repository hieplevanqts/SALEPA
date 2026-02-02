import { useState, useEffect } from 'react';
import { X, Edit2, Trash2, Plus, Check } from 'lucide-react';
import { AddUnitModal } from '../../components/modals/AddUnitModal';

// Mapping tên thuộc tính tiếng Anh/viết tắt sang tiếng Việt đầy đủ
const ATTRIBUTE_NAME_MAP: { [key: string]: string } = {
  'SIZE': 'Kích thước',
  'size': 'Kích thước',
  'COLOR': 'Màu sắc',
  'color': 'Màu sắc',
  'MÀU SẮC': 'Màu sắc',
  'KÍCH THƯỚC': 'Kích thước',
  'CHẤT LIỆU': 'Chất liệu',
  'KIỂU DÁNG': 'Kiểu dáng',
  'material': 'Chất liệu',
  'MATERIAL': 'Chất liệu',
};

// Helper function to get display name
const getDisplayName = (name: string): string => {
  return ATTRIBUTE_NAME_MAP[name] || name;
};

interface ProductVariantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (variants: any) => void;
  initialData?: any;
  defaultPrice?: number;
  defaultCostPrice?: number;
  defaultStock?: number; // ✅ Thêm tồn kho mặc định
}

interface Attribute {
  id: string;
  name: string;
  isCustom: boolean;
  values: string[];
}

interface Unit {
  id: string;
  name: string;
  conversion: number;
  isBase: boolean;
  price?: number; // Giá bán của đơn vị
  isDirectSale?: boolean; // Cho phép bán trực tiếp
}

interface Variant {
  id: string;
  attributes: { [key: string]: string };
  unit: string;
  conversion: number;
  code: string;
  barcode: string;
  costPrice: number;
  price: number;
  stock: number;
}

export function ProductVariantsModal({ isOpen, onClose, onSave, initialData, defaultPrice, defaultCostPrice, defaultStock }: ProductVariantsModalProps) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedAttribute, setSelectedAttribute] = useState('');
  const [newAttributeValue, setNewAttributeValue] = useState('');
  
  // Unit modal states
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  // Attribute form states
  const [editingAttributeId, setEditingAttributeId] = useState<string | null>(null);
  const [customAttributeName, setCustomAttributeName] = useState('');

  const baseUnit = units.find(u => u.isBase);

  // ============ HELPER: Regenerate variants khi units thay đổi ============
  const regenerateVariantsWithUnits = (updatedUnits: Unit[]) => {
    if (variants.length === 0) return; // Chưa có variant nào → không làm gì
    
    const newBaseUnit = updatedUnits.find(u => u.isBase);
    if (!newBaseUnit) return;
    
    // Case 1: Chỉ có attributes (không có units trước đó) → giữ nguyên
    const hasOnlyBaseUnit = updatedUnits.length === 1 && updatedUnits[0].isBase;
    if (hasOnlyBaseUnit) {
      setVariants(prev => prev.map(v => ({
        ...v,
        unit: newBaseUnit.name,
        conversion: 1
      })));
      return;
    }
    
    // Case 2: Có nhiều units → Nhân variants với từng unit
    // Lấy tất cả tổ hợp attributes hiện có (không tính unit)
    const uniqueAttrCombinations = new Map<string, { attributes: { [key: string]: string }, price: number, costPrice: number, stock: number }>();
    
    variants.forEach(v => {
      const attrKey = JSON.stringify(v.attributes);
      if (!uniqueAttrCombinations.has(attrKey)) {
        uniqueAttrCombinations.set(attrKey, {
          attributes: v.attributes,
          price: v.price,
          costPrice: v.costPrice,
          stock: v.stock
        });
      }
    });
    
    // Tạo variants mới: Mỗi tổ hợp attributes × Mỗi unit
    const newVariants: Variant[] = [];
    uniqueAttrCombinations.forEach(({ attributes, price, costPrice, stock }) => {
      updatedUnits.forEach(unit => {
        newVariants.push({
          id: `${Date.now()}-${Math.random()}`,
          attributes,
          unit: unit.name,
          conversion: unit.conversion,
          code: '',
          barcode: '',
          costPrice,
          price: unit.isBase ? price : (unit.price || price), // Đơn vị phụ dùng giá riêng
          stock: unit.isBase ? stock : 0 // CHỈ đơn vị cơ bản mới có tồn kho
        });
      });
    });
    
    setVariants(newVariants);
  };

  // Load initial data when modal opens
  useEffect(() => {
    if (isOpen && initialData) {
      // Load units
      if (initialData.units && Array.isArray(initialData.units)) {
        setUnits(initialData.units);
      }
      
      // Load attributes
      if (initialData.attributes && Array.isArray(initialData.attributes)) {
        setAttributes(initialData.attributes);
      }
      
      // Load variants
      if (initialData.variants && Array.isArray(initialData.variants)) {
        setVariants(initialData.variants);
      }
    } else if (isOpen && !initialData) {
      // Reset when opening for new product
      setUnits([]);
      setAttributes([]);
      setVariants([]);
    }
  }, [isOpen, initialData]);

  // ============ UNIT CRUD ============
  const handleSaveUnit = (unitData: { name: string; price: number; conversion?: number }, addAnother?: boolean) => {
    if (editingUnit) {
      // Update existing unit
      const updatedUnits = units.map(u => 
        u.id === editingUnit.id 
          ? { ...u, name: unitData.name, conversion: unitData.conversion || 1, price: unitData.price }
          : u
      );
      setUnits(updatedUnits);
      
      // ✅ Regenerate variants với units mới
      regenerateVariantsWithUnits(updatedUnits);
      
      setEditingUnit(null);
      if (!addAnother) {
        setShowAddUnitModal(false);
      }
    } else {
      // Add new unit
      const isFirstUnit = units.length === 0;
      const newUnit: Unit = {
        id: Date.now().toString(),
        name: unitData.name,
        conversion: unitData.conversion || 1,
        isBase: isFirstUnit,
        price: unitData.price,
      };
      const updatedUnits = [...units, newUnit];
      setUnits(updatedUnits);
      
      // ✅ Regenerate variants với units mới
      regenerateVariantsWithUnits(updatedUnits);
      
      if (!addAnother) {
        setShowAddUnitModal(false);
      }
    }
  };

  const deleteUnit = (id: string) => {
    const unitToDelete = units.find(u => u.id === id);
    if (unitToDelete?.isBase) {
      alert('Không thể xóa đơn vị cơ bản');
      return;
    }
    setUnits(prev => prev.filter(u => u.id !== id));
  };

  const handleDeleteEditingUnit = () => {
    if (editingUnit) {
      setUnits(prev => {
        const filtered = prev.filter(u => u.id !== editingUnit.id);
        
        // If we deleted the base unit and there are other units, promote the first one
        if (editingUnit.isBase && filtered.length > 0) {
          filtered[0].isBase = true;
          filtered[0].conversion = 1; // Base unit always has conversion 1
        }
        
        return filtered;
      });
      
      setShowAddUnitModal(false);
      setEditingUnit(null);
    }
  };

  const startEditUnit = (unit: Unit) => {
    setEditingUnit(unit);
    setShowAddUnitModal(true);
  };

  // ============ ATTRIBUTE CRUD ============
  const addAttribute = () => {
    const newId = Date.now().toString();
    setAttributes(prev => [...prev, { id: newId, name: '', isCustom: false, values: [] }]);
  };

  const updateAttributeName = (id: string, name: string, isCustom: boolean = false) => {
    const oldAttr = attributes.find(a => a.id === id);
    setAttributes(prev => prev.map(attr => 
      attr.id === id ? { ...attr, name, isCustom } : attr
    ));

    // Update variant attributes if name changed
    if (oldAttr && oldAttr.name && oldAttr.name !== name) {
      setVariants(prev => prev.map(v => {
        if (v.attributes[oldAttr.name]) {
          const newAttrs = { ...v.attributes };
          newAttrs[name] = newAttrs[oldAttr.name];
          delete newAttrs[oldAttr.name];
          return { ...v, attributes: newAttrs };
        }
        return v;
      }));
    }
  };

  const deleteAttribute = (id: string) => {
    const attrToRemove = attributes.find(a => a.id === id);
    setAttributes(prev => prev.filter(attr => attr.id !== id));
    
    // Remove variants with this attribute
    if (attrToRemove?.name) {
      setVariants(prev => prev.filter(v => !v.attributes[attrToRemove.name]));
    }
  };

  const addAttributeValue = (attrId: string, value: string) => {
    if (!value.trim()) return;
    
    const attr = attributes.find(a => a.id === attrId);
    if (!attr?.name) {
      alert('❌ Vui lòng chọn tên thuộc tính trước (Màu sắc, Kích thước, v.v.)');
      return;
    }

    setAttributes(prev => prev.map(a => 
      a.id === attrId ? { ...a, values: [...a.values, value.trim()] } : a
    ));
    
    // ===== FIX: Sinh variants đúng cho mọi trường hợp =====
    
    // Case 1: Chưa có variant nào
    if (variants.length === 0) {
      // Nếu có nhiều units → Tạo variants cho TẤT CẢ units
      if (units.length > 0) {
        const newVariants: Variant[] = units.map(unit => ({
          id: `${Date.now()}-${Math.random()}`,
          attributes: { [attr.name]: value.trim() },
          unit: unit.name,
          conversion: unit.conversion,
          code: '',
          barcode: '',
          costPrice: defaultCostPrice || 0,
          price: unit.isBase ? (defaultPrice || 0) : (unit.price || defaultPrice || 0),
          stock: unit.isBase ? (defaultStock || 0) : 0, // Chỉ đơn vị cơ bản có tồn kho
        }));
        setVariants(newVariants);
      } else {
        // Không có unit nào → Tạo 1 variant mặc định
        const newVariant: Variant = {
          id: Date.now().toString(),
          attributes: { [attr.name]: value.trim() },
          unit: baseUnit?.name || '',
          conversion: 1,
          code: '',
          barcode: '',
          costPrice: defaultCostPrice || 0,
          price: defaultPrice || 0,
          stock: defaultStock || 0,
        };
        setVariants([newVariant]);
      }
      setNewAttributeValue('');
      return;
    }

    // Case 2: Đã có variants
    const hasThisAttr = variants.some(v => v.attributes[attr.name]);
    
    if (hasThisAttr) {
      // Thuộc tính này đã được dùng → Thêm tổ hợp mới
      // Lấy tất cả variants có cùng attributes KHÁC attr hiện tại
      const existingCombinations = new Set(
        variants.map(v => {
          const otherAttrs = { ...v.attributes };
          delete otherAttrs[attr.name];
          return JSON.stringify(otherAttrs);
        })
      );

      const newVariants: Variant[] = [];
      existingCombinations.forEach(combStr => {
        const combo = combStr === '{}' ? {} : JSON.parse(combStr);
        
        // Nếu có units → Tạo cho tất cả units
        if (units.length > 0) {
          units.forEach(unit => {
            newVariants.push({
              id: `${Date.now()}-${Math.random()}`,
              attributes: { ...combo, [attr.name]: value.trim() },
              unit: unit.name,
              conversion: unit.conversion,
              code: '',
              barcode: '',
              costPrice: defaultCostPrice || 0,
              price: unit.isBase ? (defaultPrice || 0) : (unit.price || defaultPrice || 0),
              stock: unit.isBase ? (defaultStock || 0) : 0,
            });
          });
        } else {
          // Không có unit → Tạo 1 variant
          newVariants.push({
            id: `${Date.now()}-${Math.random()}`,
            attributes: { ...combo, [attr.name]: value.trim() },
            unit: baseUnit?.name || '',
            conversion: 1,
            code: '',
            barcode: '',
            costPrice: defaultCostPrice || 0,
            price: defaultPrice || 0,
            stock: defaultStock || 0,
          });
        }
      });

      setVariants(prev => [...prev, ...newVariants]);
    } else {
      // Thuộc tnh này chưa được dùng → Nhân tất cả variants hiện có
      const newVariants = variants.map(v => ({
        ...v,
        id: `${Date.now()}-${Math.random()}`,
        attributes: { ...v.attributes, [attr.name]: value.trim() },
      }));
      setVariants(prev => [...prev, ...newVariants]);
    }
    
    setNewAttributeValue('');
  };

  const removeAttributeValue = (attrId: string, value: string) => {
    const attr = attributes.find(a => a.id === attrId);
    if (!attr) return;

    setAttributes(prev => prev.map(a => 
      a.id === attrId ? { ...a, values: a.values.filter(v => v !== value) } : a
    ));
    
    // Remove variants with this value
    setVariants(prev => prev.filter(v => v.attributes[attr.name] !== value));
  };

  // ============ VARIANT FUNCTIONS ============
  const updateVariant = (id: string, field: keyof Variant, value: any) => {
    setVariants(prev => prev.map(v => 
      v.id === id ? { ...v, [field]: value } : v
    ));
  };

  const deleteVariant = (id: string) => {
    setVariants(prev => prev.filter(v => v.id !== id));
  };

  const applyPriceToAll = () => {
    const firstPrice = variants[0]?.price || 0;
    setVariants(prev => prev.map(v => ({ ...v, price: firstPrice })));
  };

  const handleSave = () => {
    onSave({ units, attributes, variants });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-300 w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">
            Thiết lập đơn vị tính và thuộc tính
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* ============ ĐƠN VỊ TÍNH ============ */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              1. Đơn vị tính
            </h3>
            
            {/* Unit List */}
            <div className="space-y-2 mb-3">
              {units.map((unit) => (
                <div key={unit.id}>
                  {editingUnit?.id === unit.id ? (
                    // Edit Mode
                    <div className="flex items-center gap-2 p-2 border border-[#FE7410] bg-orange-50 rounded-md">
                      <input
                        type="text"
                        value={unit.name}
                        onChange={(e) => setEditingUnit(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Tên đơn vị"
                        className="flex-1 max-w-[150px] px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#FE7410]"
                      />
                      {!unit.isBase && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-600">1 {unit.name || '...'} =</span>
                          <input
                            type="number"
                            value={unit.conversion}
                            onChange={(e) => setEditingUnit(prev => ({ ...prev, conversion: Number(e.target.value) }))}
                            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#FE7410]"
                          />
                          <span className="text-xs text-gray-600">{baseUnit?.name || 'đơn vị cơ bản'}</span>
                        </div>
                      )}
                      <button
                        onClick={() => handleSaveUnit(unit, false)}
                        className="p-1 text-green-600 hover:text-green-700"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleDeleteEditingUnit}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    // View Mode
                    <div className={`flex items-center justify-between px-3 py-2 rounded-md ${
                      unit.isBase ? 'border border-[#FE7410] bg-orange-50' : 'border border-gray-200 bg-white'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{unit.name}</span>
                        {unit.isBase && (
                          <span className="text-xs text-gray-500">(Đơn vị cơ bản)</span>
                        )}
                        {!unit.isBase && (
                          <span className="text-xs text-gray-600">
                            = {unit.conversion} {baseUnit?.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEditUnit(unit)}
                          className="p-1 text-[#FE7410] hover:text-[#E56600]"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {!unit.isBase && (
                          <button
                            onClick={() => deleteUnit(unit.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Unit Button */}
            <button
              onClick={() => {
                setEditingUnit(null);
                setShowAddUnitModal(true);
              }}
              className="text-sm text-[#FE7410] hover:text-[#E56600] font-medium flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              {units.length === 0 ? 'Thêm đơn vị cơ bản' : 'Thêm đơn vị'}
            </button>
          </div>

          {/* ============ THUỘC TÍNH ============ */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">2. Thuộc tính</h3>
              </div>
            </div>

            {attributes.length === 0 ? (
              <button
                onClick={addAttribute}
                className="text-sm text-[#FE7410] hover:text-[#E56600] font-medium flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Thêm thuộc tính
              </button>
            ) : (
              <>
                {attributes.map((attr) => (
                  <div key={attr.id} className="flex items-start gap-3 mb-3">
                    {/* Attribute Name - Dropdown or Custom Input */}
                    {attr.isCustom ? (
                      <input
                        type="text"
                        value={attr.name}
                        onChange={(e) => updateAttributeName(attr.id, e.target.value, true)}
                        placeholder="Nhập tên thuộc tính"
                        className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#FE7410] focus:border-[#FE7410]"
                      />
                    ) : (
                      <select
                        value={attr.name}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '__custom__') {
                            updateAttributeName(attr.id, '', true);
                            setEditingAttributeId(attr.id);
                          } else {
                            updateAttributeName(attr.id, value, false);
                            if (value) setSelectedAttribute(value);
                          }
                        }}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#FE7410] focus:border-[#FE7410]"
                      >
                        <option value="">Chọn thuộc tính</option>
                        <option value="MÀU SẮC">MÀU SẮC</option>
                        <option value="KÍCH THƯỚC">KÍCH THƯỚC</option>
                        <option value="CHẤT LIỆU">CHẤT LIỆU</option>
                        <option value="__custom__">+ Tự nhập</option>
                      </select>
                    )}

                    {/* Attribute Values */}
                    <div className="flex-1 flex flex-wrap items-center gap-2 border border-gray-300 rounded-md px-3 py-2 min-h-[40px]">
                      {attr.values.map((value) => (
                        <span
                          key={value}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-sm text-gray-700 rounded"
                        >
                          {value}
                          <button
                            onClick={() => removeAttributeValue(attr.id, value)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        value={selectedAttribute === attr.name ? newAttributeValue : ''}
                        onChange={(e) => {
                          setSelectedAttribute(attr.name);
                          setNewAttributeValue(e.target.value);
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && attr.name) {
                            addAttributeValue(attr.id, newAttributeValue);
                          }
                        }}
                        placeholder="Nhập giá trị và enter"
                        className="flex-1 min-w-[180px] text-sm outline-none"
                        disabled={!attr.name}
                      />
                    </div>

                    {/* Delete Attribute */}
                    <button
                      onClick={() => deleteAttribute(attr.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}

                <button
                  onClick={addAttribute}
                  className="text-sm text-[#FE7410] hover:text-[#E56600] font-medium flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Thêm thuộc tính
                </button>
              </>
            )}
          </div>

          {/* ============ HÀNG CÙNG LOẠI ============ */}
          {variants.length > 0 && (
            <div>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Hàng cùng loại</h3>
                  {/* Info about opening stock */}
                  <p className="text-xs text-blue-600 mt-1">
                    💡 <strong>Tồn đầu kỳ:</strong> {defaultStock ? `Đã điền ${defaultStock} từ form sản phẩm. ` : 'Chưa điền ở form sản phẩm. '}
                    {attributes.length > 0 
                      ? 'Bạn có thể điều chỉnh tồn kho riêng cho từng biến thể bên dưới.'
                      : 'Giá trị này sẽ áp dụng cho variant mặc định.'}
                  </p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Giá trị thuộc tính</th>
                      {units.length > 0 && (
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Đơn vị</th>
                      )}
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Mã hàng</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Mã vạch</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">Giá vốn</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">Giá bán</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">Tồn kho</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {variants.map((variant) => {
                      const isBaseUnit = variant.conversion === 1;
                      
                      // Hiển thị attributes (không có unit trong ngoặc vì đã có cột đơn vị riêng)
                      // Sử dụng getDisplayName để hiển thị tên tiếng Việt
                      const attributesText = Object.entries(variant.attributes)
                        .map(([key, value]) => `${getDisplayName(key)}: ${value}`)
                        .join(' - ');
                      const displayText = attributesText || variant.unit;
                      
                      return (
                      <tr key={variant.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm text-gray-900">
                          {displayText}
                        </td>
                        {units.length > 0 && (
                          <td className="px-3 py-2 text-sm text-gray-900">
                            <span className={isBaseUnit ? 'font-semibold text-[#FE7410]' : ''}>
                              {variant.unit}
                            </span>
                          </td>
                        )}
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={variant.code}
                            readOnly
                            placeholder="Tự động"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-gray-50 text-gray-500 cursor-not-allowed"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={variant.barcode}
                            onChange={(e) => updateVariant(variant.id, 'barcode', e.target.value)}
                            placeholder=""
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#FE7410]"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={variant.costPrice}
                            onChange={(e) => updateVariant(variant.id, 'costPrice', Number(e.target.value))}
                            className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#FE7410]"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={variant.price}
                            onChange={(e) => updateVariant(variant.id, 'price', Number(e.target.value))}
                            className={`w-24 px-2 py-1 text-sm text-right border rounded focus:outline-none focus:ring-1 ${
                              isBaseUnit
                                ? 'border-[#FE7410] bg-orange-50 ring-1 ring-[#FE7410] font-semibold'
                                : 'border-gray-300 focus:ring-[#FE7410]'
                            }`}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={variant.stock}
                            onChange={(e) => updateVariant(variant.id, 'stock', Number(e.target.value))}
                            disabled={!isBaseUnit}
                            placeholder={!isBaseUnit ? '0' : ''}
                            className={`w-20 px-2 py-1 text-sm text-right border rounded focus:outline-none focus:ring-1 ${
                              !isBaseUnit 
                                ? 'border-gray-300 bg-gray-50 text-gray-400 cursor-not-allowed' 
                                : 'border-gray-300 focus:ring-[#FE7410]'
                            }`}
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            onClick={() => deleteVariant(variant.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Bỏ qua
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm text-white bg-[#FE7410] rounded-md hover:bg-[#E56600] transition-colors font-medium"
          >
            Xong
          </button>
        </div>
      </div>

      {/* Add/Edit Unit Modal */}
      <AddUnitModal
        isOpen={showAddUnitModal}
        onClose={() => {
          setShowAddUnitModal(false);
          setEditingUnit(null);
        }}
        onSave={handleSaveUnit}
        onDelete={handleDeleteEditingUnit}
        editingUnit={editingUnit}
        baseUnitName={baseUnit?.name}
        isFirstUnit={units.length === 0}
      />
    </div>
  );
}

export default ProductVariantsModal;