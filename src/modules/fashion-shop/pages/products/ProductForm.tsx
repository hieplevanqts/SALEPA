import { useState, useEffect } from 'react';
import { X, Upload, Barcode, ChevronDown, ChevronUp, ChevronRight, HelpCircle, Plus } from 'lucide-react';
import { api } from '../../../../lib/fashion-shop-lib/api';
import { toast } from 'sonner';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { ProductVariantsModal } from './ProductVariantsModal';

interface ProductFormProps {
  product?: any;
  productTypes?: any[];
  categories?: any[];
  brands?: any[];
  properties?: any[];
  onSave: (product: any) => void;
  onCancel: () => void;
}

export function ProductForm({ product, productTypes, categories: categoriesProp, brands: brandsProp, properties, onSave, onCancel }: ProductFormProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'description'>('info');
  const [expandedSections, setExpandedSections] = useState({
    pricing: true,
    stock: true,
    location: true,
    units: true,
  });

  // States for creating new category/brand
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isCreatingBrand, setIsCreatingBrand] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newBrandName, setNewBrandName] = useState('');

  // Local state for categories and brands
  const [categories, setCategories] = useState(categoriesProp || []);
  const [brands, setBrands] = useState(brandsProp || []);

  // Update local state when props change
  useEffect(() => {
    if (categoriesProp) setCategories(categoriesProp);
  }, [categoriesProp]);

  useEffect(() => {
    if (brandsProp) setBrands(brandsProp);
  }, [brandsProp]);

  // Form data matching sp_products table
  const [formData, setFormData] = useState({
    // Required fields
    tenant_id: 'tenant_001',
    industry_id: '01942c1a-0001-0000-0000-000000000001', // INDUSTRY_FASHION_ID
    product_type_id: '',
    title: '',
    code: '',
    
    // Optional fields
    product_category_id: '',
    brand_id: '', // Brand field
    // REMOVED: barcode - Rule 3: barcode CHỈ nằm ở product_variants
    images: [] as (File | string)[],
    brief: '',
    content: '',
    
    // Pricing
    cost_price: 0,  // Để tạo variant mặc định
    price: 0,
    
    // 🔥 Opening Stock - Tồn đầu kỳ (khi tạo sản phẩm mới)
    openingStock: 0,  // ✅ THAY THẾ quantity
    
    // Stock management
    min_stock: 0,
    max_stock: 999999999,
    
    // Location & Weight
    location: '',
    weight: 0,
    
    // Other
    status: 1,
    sell_directly: false,
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isVariantsModalOpen, setIsVariantsModalOpen] = useState(false);
  const [variantsData, setVariantsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Populate form if editing
  useEffect(() => {
    if (product) {
      setFormData({
        tenant_id: product.tenant_id || 'tenant_001',
        industry_id: product.industry_id || '01942c1a-0001-0000-0000-000000000001', // INDUSTRY_FASHION_ID
        product_type_id: product.product_type_id || '',
        title: product.title || '',
        code: product.code || '',
        product_category_id: product.product_category_id || '',
        brand_id: product.brand_id || '', // Brand field
        // REMOVED: barcode - Rule 3: barcode CHỈ nằm ở product_variants
        images: [],
        brief: product.brief || '',
        content: product.content || '',
        cost_price: product.cost_price || 0,
        price: product.price || 0,
        openingStock: product.quantity || 0,  // ✅ THAY THẾ quantity
        min_stock: product.min_stock || 0,
        max_stock: product.max_stock || 999999999,
        location: product.location || '',
        weight: product.weight || 0,
        status: product.status ?? 1,
        sell_directly: product.sell_directly ?? false,
      });
      
      // Load only main image
      if (product.image) {
        setImagePreviews([product.image]);
      }
      
      // Load variants data if exists
      if (product.variant_properties) {
        setVariantsData(product.variant_properties);
      }
    }
  }, [product]);



  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Ảnh không được vượt quá 2 MB');
        return;
      }
      
      const newImages = [...formData.images];
      newImages[index] = file;
      setFormData(prev => ({ ...prev, images: newImages }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPreviews = [...imagePreviews];
        newPreviews[index] = reader.result as string;
        setImagePreviews(newPreviews);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData(prev => ({ ...prev, images: newImages }));
    
    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  // REMOVED: generateRandomBarcode - Rule 3: barcode CHỈ nm ở product_variants

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Tên hàng là bắt buộc';
    }

    // Validate giá vốn
    if (formData.cost_price < 0) {
      newErrors.cost_price = 'Giá vốn không được âm';
    }

    // Validate giá bán
    if (formData.price < 0) {
      newErrors.price = 'Giá bán không được âm';
    }

    // Validate giá bán phải >= giá vốn
    if (formData.price > 0 && formData.cost_price > 0 && formData.price < formData.cost_price) {
      newErrors.price = 'Giá bán phải lớn hơn hoặc bằng giá vốn';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (saveAndCreate: boolean = false) => {
    if (!validateForm()) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setLoading(true);
    try {
      // DEBUG: Log variantsData before saving
      console.log('📦 [ProductForm] variantsData before save:', JSON.stringify(variantsData, null, 2));
      
      // Đồng bộ giá từ form vào variants nếu variants chưa có giá
      let finalVariantsData = variantsData;
      if (variantsData && variantsData.variants && variantsData.variants.length > 0) {
        finalVariantsData = {
          ...variantsData,
          variants: variantsData.variants.map((v: any) => ({
            ...v,
            // Nếu variant chưa có giá, lấy giá từ form
            costPrice: v.costPrice || formData.cost_price || 0,
            price: v.price || formData.price || 0,
          }))
        };
      }
      
      const productData = {
        ...formData,
        _id: product?._id,
        image: imagePreviews[0] || null,
        // REMOVED: other_images - chỉ dùng 1 ảnh duy nhất
        variant_properties: finalVariantsData || null, // Lưu variants data vào product
      };
      
      console.log('📤 [ProductForm] Sending productData:', JSON.stringify(productData, null, 2));

      await onSave(productData);
      
      if (saveAndCreate) {
        // Reset form for next product
        setFormData({
          tenant_id: 'tenant_001',
          industry_id: '01942c1a-0001-0000-0000-000000000001', // INDUSTRY_FASHION_ID
          product_type_id: '',
          title: '',
          code: '',
          product_category_id: '',
          brand_id: '', // Brand field
          // REMOVED: barcode - Rule 3: barcode CHỈ nằm ở product_variants
          images: [],
          brief: '',
          content: '',
          cost_price: 0,
          price: 0,
          openingStock: 0,  // ✅ THAY THẾ quantity
          min_stock: 0,
          max_stock: 999999999,
          location: '',
          weight: 0,
          status: 1,
          sell_directly: false,
        });
        setImagePreviews([]);
        setVariantsData(null); // Reset variants data
        toast.success('Đã lưu! Tiếp tục thêm sản phẩm mới');
      } else {
        onCancel();
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Có lỗi xảy ra khi lưu sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Handle creating new category
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Vui lòng nhập tên nhóm hàng');
      return;
    }

    // Check if category already exists
    const existingCategory = categories.find(
      cat => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase()
    );
    if (existingCategory) {
      toast.error('Nhóm hàng này đã tồn tại');
      return;
    }

    try {
      const newCategory = {
        tenant_id: 'tenant_001',
        industry_id: '01942c1a-0001-0000-0000-000000000001',
        name: newCategoryName.trim(),
        status: 1,
      };

      // Call API to create category
      const response = await api.createProductCategory(newCategory);
      
      if (response.success && response.data) {
        // Update only local state (parent will reload on next open)
        const createdCategory = response.data;
        setCategories(prev => {
          // Check if already exists to prevent duplicates
          const exists = prev.some(c => c._id === createdCategory._id);
          if (exists) return prev;
          return [...prev, createdCategory];
        });
        
        // Auto-select the new category
        setFormData(prev => ({ ...prev, product_category_id: createdCategory._id }));
        
        // Reset and close modal
        setNewCategoryName('');
        setIsCreatingCategory(false);
        toast.success('Đã tạo nhóm hàng mới');
      } else {
        throw new Error('Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Không thể tạo nhóm hàng');
    }
  };

  // Handle creating new brand
  const handleCreateBrand = async () => {
    if (!newBrandName.trim()) {
      toast.error('Vui lòng nhập tên thương hiệu');
      return;
    }

    // Check if brand already exists
    const existingBrand = brands.find(
      brand => brand.name.toLowerCase() === newBrandName.trim().toLowerCase()
    );
    if (existingBrand) {
      toast.error('Thương hiệu này đã tồn tại');
      return;
    }

    try {
      const newBrand = {
        tenant_id: 'tenant_001',
        industry_id: '01942c1a-0001-0000-0000-000000000001',
        name: newBrandName.trim(),
        status: 1,
      };

      // Call API to create brand
      const response = await api.createProductBrand(newBrand);
      
      if (response.success && response.data) {
        // Update only local state (parent will reload on next open)
        const createdBrand = response.data;
        setBrands(prev => {
          // Check if already exists to prevent duplicates
          const exists = prev.some(b => b._id === createdBrand._id);
          if (exists) return prev;
          return [...prev, createdBrand];
        });
        
        // Auto-select the new brand
        setFormData(prev => ({ ...prev, brand_id: createdBrand._id }));
        
        // Reset and close modal
        setNewBrandName('');
        setIsCreatingBrand(false);
        toast.success('Đã tạo thương hiệu mới');
      } else {
        throw new Error('Failed to create brand');
      }
    } catch (error) {
      console.error('Error creating brand:', error);
      toast.error('Không thể tạo thương hiệu');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-300 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {product ? 'Chỉnh sửa sản phẩm' : 'Tạo sản phẩm'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'info'
                ? 'text-[#FE7410]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Thông tin
            {activeTab === 'info' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FE7410]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('description')}
            className={`px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'description'
                ? 'text-[#FE7410]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Mô tả
            {activeTab === 'description' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FE7410]" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {activeTab === 'info' ? (
            <div className="space-y-6">
              {/* Row 1: Mã hàng, Mã vạch, Hình ảnh */}
              <div className="grid grid-cols-12 gap-4">
                {/* Left Column: Mã hàng, Mã vạch, Tên hàng, Nhóm hàng & Thương hiệu */}
                <div className="col-span-8 space-y-4">
                  {/* Row 1.1: Mã hàng (REMOVED: Mã vạch - Rule 3: barcode CHỈ nằm ở product_variants) */}
                  <div>
                    {/* Mã hàng */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Mã hàng
                      </label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                        placeholder="Tự động"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#FE7410] focus:border-[#FE7410]"
                      />
                    </div>
                  </div>

                  {/* Row 1.2: Tên hàng */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Tên hàng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Bắt buộc"
                      className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FE7410] ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.title && (
                      <p className="mt-1 text-xs text-red-500">{errors.title}</p>
                    )}
                  </div>

                  {/* Row 1.3: Nhóm hàng & Thương hiệu */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Nhóm hàng */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-sm font-medium text-gray-700">Nhóm hàng</label>
                        <button type="button" className="text-xs text-[#FE7410] hover:text-[#E56600] font-medium" onClick={() => setIsCreatingCategory(true)}>Tạo mới</button>
                      </div>
                      <select
                        value={formData.product_category_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, product_category_id: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#FE7410] focus:border-[#FE7410]"
                      >
                        <option value="">Chọn nhóm hàng (Bắt buộc)</option>
                        {categories.map(cat => (
                          <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Thương hiệu */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-sm font-medium text-gray-700">Thương hiệu</label>
                        <button type="button" className="text-xs text-[#FE7410] hover:text-[#E56600] font-medium" onClick={() => setIsCreatingBrand(true)}>Tạo mới</button>
                      </div>
                      <select
                        value={formData.brand_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, brand_id: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#FE7410] focus:border-[#FE7410]"
                      >
                        <option value="">Chọn thương hiệu</option>
                        {brands.map(brand => (
                          <option key={brand._id} value={brand._id}>{brand.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Right Column: Images */}
                <div className="col-span-4 flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Hình ảnh
                  </label>
                  {/* Single image - match height with left column */}
                  <div className="flex-1">
                    {imagePreviews[0] ? (
                      <div className="relative w-full h-full min-h-[200px] border border-gray-200 rounded-md overflow-hidden group bg-gray-50">
                        <img
                          src={imagePreviews[0]}
                          alt="Product preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removeImage(0)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-full h-full min-h-[200px] border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-[#FE7410] transition-colors bg-gray-50">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageChange(e, 0)}
                          className="hidden"
                        />
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center mb-2">
                          <Upload className="w-6 h-6 text-gray-400" />
                        </div>
                        <button 
                          type="button"
                          className="px-3 py-1.5 text-xs border border-gray-300 rounded bg-white hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                        >
                          Thêm ảnh
                        </button>
                        <p className="text-xs text-blue-500 mt-1.5">Mỗi ảnh không quá 2 MB</p>
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Giá vốn, giá bán */}
              <div className="border border-gray-200 rounded-md">
                <button
                  onClick={() => toggleSection('pricing')}
                  className="w-full px-4 py-3 flex items-center justify-between text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors rounded-t-md"
                >
                  <span>Giá vốn, giá bán</span>
                  {expandedSections.pricing ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </button>
                {expandedSections.pricing && (
                  <div className="px-4 pb-4 border-t border-gray-200 pt-3">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Giá vốn */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Giá vốn <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={formData.cost_price}
                          onChange={(e) => setFormData(prev => ({ ...prev, cost_price: Number(e.target.value) }))}
                          placeholder="0"
                          required
                          className="w-full px-3 py-2 text-sm text-right border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#FE7410] focus:border-[#FE7410]"
                        />
                        {errors.cost_price && (
                          <p className="mt-1 text-xs text-red-500">{errors.cost_price}</p>
                        )}
                      </div>

                      {/* Giá bán */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Giá bán <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                          placeholder="0"
                          required
                          className="w-full px-3 py-2 text-sm text-right border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#FE7410] focus:border-[#FE7410]"
                        />
                        {errors.price && (
                          <p className="mt-1 text-xs text-red-500">{errors.price}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tồn kho */}
              <div className="border border-gray-200 rounded-md">
                <button
                  onClick={() => toggleSection('stock')}
                  className="w-full px-4 py-3 flex items-center justify-between text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors rounded-t-md"
                >
                  <span>Tồn kho</span>
                  {expandedSections.stock ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </button>
                {expandedSections.stock && (
                  <div className="px-4 pb-4 border-t border-gray-200">
                    <div className="grid grid-cols-3 gap-4 pt-3">
                      {/* 🔥 Tồn đầu kỳ - Opening Stock */}
                      <div>
                        <div className="flex items-center gap-1 mb-1.5">
                          <label className="text-sm font-medium text-gray-700">
                            {product ? 'Tồn kho hiện tại' : 'Tồn đầu kỳ'}
                          </label>
                          {!product && (
                            <div className="group relative">
                              <HelpCircle className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-56 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                                Số lượng tồn kho ban đầu khi tạo sản phẩm mới. Hệ thống sẽ tự động tạo phiếu "Tồn đầu kỳ"
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                          )}
                        </div>
                        <input
                          type="number"
                          value={formData.openingStock}
                          onChange={(e) => setFormData(prev => ({ ...prev, openingStock: Math.max(0, Number(e.target.value)) }))}
                          placeholder="0"
                          disabled={!!product}  // Không cho sửa khi edit sản phẩm
                          className="w-full px-3 py-2 text-sm text-right border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#FE7410] focus:border-[#FE7410] disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                        {!product && formData.openingStock > 0 && (
                          <p className="mt-1 text-xs text-blue-600">Sẽ tạo phiếu tồn đầu kỳ</p>
                        )}
                      </div>

                      {/* Định mức tồn thấp nhất */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Định mức tồn thấp nhất
                        </label>
                        <input
                          type="number"
                          value={formData.min_stock}
                          onChange={(e) => setFormData(prev => ({ ...prev, min_stock: Math.max(0, Number(e.target.value)) }))}
                          placeholder="0"
                          className="w-full px-3 py-2 text-sm text-right border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#FE7410] focus:border-[#FE7410]"
                        />
                      </div>

                      {/* Định mức tồn cao nhất */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Định mức tồn cao nhất
                        </label>
                        <input
                          type="number"
                          value={formData.max_stock}
                          onChange={(e) => setFormData(prev => ({ ...prev, max_stock: Math.max(0, Number(e.target.value)) }))}
                          placeholder="999,999,999"
                          className="w-full px-3 py-2 text-sm text-right border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#FE7410] focus:border-[#FE7410]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Thiết lập đơn vị tính và thuộc tính */}
              <div className="border border-gray-200 rounded-md">
                <button
                  type="button"
                  onClick={() => setIsVariantsModalOpen(true)}
                  disabled={!!product}
                  className={`w-full px-4 py-3 flex items-center justify-between text-sm font-semibold rounded-md group transition-colors ${
                    product 
                      ? 'bg-gray-50 text-gray-400 cursor-not-allowed' 
                      : 'text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg className={`w-4 h-4 ${product ? 'text-gray-400' : 'text-[#FE7410]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    <span>Thiết lập đơn vị tính và thuộc tính</span>
                    {product && (
                      <span className="text-xs text-gray-500">(Không thể sửa sau khi tạo)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {variantsData && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        {variantsData.variants?.length || 0} phân loại
                      </span>
                    )}
                    <ChevronRight className={`w-4 h-4 transition-colors ${product ? 'text-gray-400' : 'text-gray-400 group-hover:text-[#FE7410]'}`} />
                  </div>
                </button>
                <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-200">
                  Thiết lập đơn vị tính (cái, thùng...) và thuộc tính (màu sắc, kích thước...) để tạo các phân loại sản phẩm với SKU và barcode riêng
                </div>
              </div>
            </div>
          ) : (
            /* Mô tả Tab */
            <div className="space-y-4">
              {/* Brief */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Mô tả ngắn
                </label>
                <textarea
                  value={formData.brief}
                  onChange={(e) => setFormData(prev => ({ ...prev, brief: e.target.value }))}
                  rows={3}
                  placeholder="Nhập mô tả ngắn về sản phẩm..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#FE7410] focus:border-[#FE7410] resize-none"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Mô tả chi tiết
                </label>
                <ReactQuill
                  value={formData.content}
                  onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                  modules={{
                    toolbar: [
                      ['bold', 'italic', 'underline', 'strike'],
                      ['blockquote', 'code-block'],
                      [{ 'header': 1 }, { 'header': 2 }],
                      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                      [{ 'script': 'sub' }, { 'script': 'super' }],
                      [{ 'indent': '-1' }, { 'indent': '+1' }],
                      [{ 'direction': 'rtl' }],
                      [{ 'size': ['small', false, 'large', 'huge'] }],
                      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                      [{ 'color': [] }, { 'background': [] }],
                      [{ 'font': [] }],
                      [{ 'align': [] }],
                      ['clean'],
                      ['link', 'image', 'video'],
                    ],
                  }}
                  formats={[
                    'header',
                    'bold',
                    'italic',
                    'underline',
                    'strike',
                    'blockquote',
                    'code-block',
                    'list',
                    'bullet',
                    'indent',
                    'script',
                    'direction',
                    'size',
                    'color',
                    'background',
                    'font',
                    'align',
                    'link',
                    'image',
                    'video',
                  ]}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end bg-gray-50 rounded-b-lg">
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Bỏ qua
            </button>
            <button
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Lưu & Tạo thêm hàng
            </button>
            <button
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className="px-4 py-2 text-sm text-white bg-[#FE7410] rounded-md hover:bg-[#E56600] transition-colors disabled:opacity-50 font-medium"
            >
              {loading ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </div>
      </div>

      {/* Product Variants Modal */}
      <ProductVariantsModal
        isOpen={isVariantsModalOpen}
        onClose={() => setIsVariantsModalOpen(false)}
        onSave={(variantsData) => {
          console.log('Variants data:', variantsData);
          toast.success('Đã lưu thiết lập đơn vị tính và thuộc tính');
          setVariantsData(variantsData);
          setIsVariantsModalOpen(false);
        }}
        initialData={variantsData}
        defaultPrice={formData.price}
        defaultCostPrice={formData.cost_price}
        defaultStock={formData.openingStock} // ✅ Truyền tồn đầu kỳ từ form
      />

      {/* Create Category Modal */}
      {isCreatingCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Tạo nhóm hàng mới</h3>
              <button
                onClick={() => {
                  setIsCreatingCategory(false);
                  setNewCategoryName('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-5 py-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên nhóm hàng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nhập tên nhóm hàng"
                autoFocus
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#FE7410] focus:border-[#FE7410]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateCategory();
                  }
                }}
              />
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <button
                onClick={() => {
                  setIsCreatingCategory(false);
                  setNewCategoryName('');
                }}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateCategory}
                className="px-4 py-2 text-sm text-white bg-[#FE7410] rounded-md hover:bg-[#E56600] transition-colors font-medium"
              >
                Tạo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Brand Modal */}
      {isCreatingBrand && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Tạo thương hiệu mới</h3>
              <button
                onClick={() => {
                  setIsCreatingBrand(false);
                  setNewBrandName('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-5 py-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên thương hiệu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                placeholder="Nhập tên thương hiệu"
                autoFocus
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#FE7410] focus:border-[#FE7410]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateBrand();
                  }
                }}
              />
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <button
                onClick={() => {
                  setIsCreatingBrand(false);
                  setNewBrandName('');
                }}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateBrand}
                className="px-4 py-2 text-sm text-white bg-[#FE7410] rounded-md hover:bg-[#E56600] transition-colors font-medium"
              >
                Tạo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductForm;