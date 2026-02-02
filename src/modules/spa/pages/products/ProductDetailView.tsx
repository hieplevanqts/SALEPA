import { ArrowLeft, Package, Barcode, DollarSign, Layers, Tag, FileText, Clock, Calendar, CheckCircle, AlertCircle, Edit, Trash2, Box, TrendingUp, User } from 'lucide-react';
import { useTranslation } from '../../../../lib/spa-lib/useTranslation';
import { useEffect, useState } from 'react';
import { AppSidebar } from '../../components/shared/AppSidebar';
import { useStore } from '../../../../lib/spa-lib/store';
import type { Product, TreatmentSessionDetail } from '../../../../lib/spa-lib/store';

interface ProductDetailViewProps {
  product: Product;
  onClose: () => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  userRole?: 'admin' | 'cashier' | 'technician';
}

type TabType = 'details' | 'sessions';

export function ProductDetailView({ product, onClose, onEdit, onDelete, userRole = 'admin' }: ProductDetailViewProps) {
  const { t } = useTranslation();
  const { products } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('details');

  // Get current user info from localStorage
  const currentUser = localStorage.getItem('salepa_username') || '';

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [product.id]);

  const getProductTypeLabel = (type: string) => {
    switch (type) {
      case 'product':
        return 'Sản phẩm';
      case 'service':
        return 'Dịch vụ';
      case 'treatment':
        return 'Liệu trình';
      default:
        return type;
    }
  };

  const getStockStatusColor = () => {
    if (product.productType !== 'product') return 'text-gray-500';
    if (!product.stock || product.stock === 0) return 'text-red-600';
    if (product.stock <= (product.lowStockThreshold || 10)) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStockStatusLabel = () => {
    if (product.productType !== 'product') return 'Không áp dụng';
    if (!product.stock || product.stock === 0) return 'Hết hàng';
    if (product.stock <= (product.lowStockThreshold || 10)) return 'Sắp hết';
    return 'Còn hàng';
  };

  // Get product names for session details
  const getProductName = (productId: string) => {
    const foundProduct = products.find(p => p.id === productId);
    return foundProduct?.name || productId;
  };

  const tabs = [
    { id: 'details', label: 'Thông tin chi tiết', icon: Package },
  ];

  // Add sessions tab if treatment
  if (product.productType === 'treatment' && product.sessionDetails && product.sessionDetails.length > 0) {
    tabs.push({ id: 'sessions', label: 'Chi tiết các buổi', icon: Calendar });
  }

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 flex">
      {/* Sidebar */}
      <AppSidebar 
        activeTab="products"
        onTabChange={onClose}
        currentUser={currentUser}
        userRole={userRole}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 bg-white border-b-2 border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between gap-6">
            {/* Left: Back Button + Title */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900 flex-shrink-0"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-gray-900">Chi tiết sản phẩm</h1>
              </div>
            </div>

            {/* Right: Action Buttons - Only for Admin */}
            {userRole === 'admin' && (
              <div className="flex items-center gap-3 flex-shrink-0">
                {onDelete && (
                  <button
                    onClick={() => onDelete(product)}
                    className="px-4 py-2 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    Xóa
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={() => onEdit(product)}
                    className="px-4 py-2 rounded-xl font-semibold text-white transition-all hover:opacity-90 flex items-center gap-2"
                    style={{ backgroundColor: '#FE7410' }}
                  >
                    <Edit className="w-5 h-5" />
                    Sửa
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex-shrink-0 bg-white border-b-2 border-gray-200 px-8">
          <div className="flex gap-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-1 py-3 border-b-2 text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'font-bold border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content - Scrollable with 2 columns */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Left Column - Main Content (2/3) */}
            <div className="lg:col-span-2 space-y-6">
              {activeTab === 'details' && (
                <>
                  {/* Basic Information */}
                  <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                    <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5 text-gray-700" />
                      Thông tin cơ bản
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Tên sản phẩm</div>
                        <div className="font-semibold text-gray-900 text-base">{product.name}</div>
                      </div>
                      
                      {product.barcode && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="text-sm text-gray-600 mb-1">Mã vạch</div>
                          <div className="font-semibold text-gray-900 text-base font-mono">{product.barcode}</div>
                        </div>
                      )}
                      
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Danh mục</div>
                        <div className="font-semibold text-gray-900 text-base">{product.category}</div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Loại</div>
                        <div className="text-base">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            product.productType === 'product' 
                              ? 'bg-blue-100 text-blue-800'
                              : product.productType === 'service'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {getProductTypeLabel(product.productType || 'product')}
                          </span>
                        </div>
                      </div>

                      {/* Duration (for service/treatment) */}
                      {(product.productType === 'service' || product.productType === 'treatment') && product.duration && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="text-sm text-gray-600 mb-1">Thời lượng</div>
                          <div className="font-semibold text-gray-900 text-base">{product.duration} phút</div>
                        </div>
                      )}

                      {/* Sessions (for treatment) */}
                      {product.productType === 'treatment' && product.sessions && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="text-sm text-gray-600 mb-1">Số buổi</div>
                          <div className="font-semibold text-gray-900 text-base">{product.sessions} buổi</div>
                        </div>
                      )}

                      {/* Unit */}
                      {product.unit && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="text-sm text-gray-600 mb-1">Đơn vị</div>
                          <div className="font-semibold text-gray-900 text-base">{product.unit}</div>
                        </div>
                      )}

                      {product.description && (
                        <div className="bg-gray-50 rounded-xl p-4 md:col-span-2">
                          <div className="text-sm text-gray-600 mb-1">Mô tả</div>
                          <div className="text-gray-900 text-base leading-relaxed">{product.description}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pricing & Stock (for products) */}
                  {product.productType === 'product' && (
                    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                      <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-gray-700" />
                        Tồn kho
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="text-sm text-gray-600 mb-1">Tồn kho</div>
                          <div className={`font-bold text-base ${getStockStatusColor()}`}>
                            {product.stock || 0} {product.unit || 'sản phẩm'}
                          </div>
                        </div>

                        {product.lowStockThreshold !== undefined && (
                          <div className="bg-gray-50 rounded-xl p-4">
                            <div className="text-sm text-gray-600 mb-1">Ngưỡng cảnh báo</div>
                            <div className="font-bold text-yellow-600 text-base">{product.lowStockThreshold} {product.unit || 'sản phẩm'}</div>
                          </div>
                        )}
                      </div>

                      {/* Stock Status Warning */}
                      {product.stock !== undefined && product.stock <= (product.lowStockThreshold || 10) && (
                        <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold text-yellow-900 mb-1">Cảnh báo tồn kho thấp</p>
                              <p className="text-sm text-yellow-800">
                                Sản phẩm này đang {product.stock === 0 ? 'hết hàng' : 'sắp hết hàng'}. 
                                Vui lòng nhập thêm hàng để đảm bảo đáp ứng nhu cầu khách hàng.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Sessions Tab - Treatment Details */}
              {activeTab === 'sessions' && product.productType === 'treatment' && (
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                  <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-700" />
                    Chi tiết các buổi trong liệu trình ({product.sessionDetails?.length || 0} buổi)
                  </h3>
                  
                  {product.sessionDetails && product.sessionDetails.length > 0 ? (
                    <div className="space-y-4">
                      {product.sessionDetails.map((session, index) => (
                        <div key={index} className="border-2 border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-[#FE7410] text-white font-bold flex items-center justify-center">
                              {session.sessionNumber}
                            </div>
                            <h4 className="font-bold text-gray-900">Buổi {session.sessionNumber}</h4>
                          </div>

                          {/* Products in this session */}
                          {session.products && session.products.length > 0 && (
                            <div className="mb-3">
                              <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <Package className="w-4 h-4" />
                                Sản phẩm sử dụng:
                              </div>
                              <div className="space-y-1">
                                {session.products.map((item, idx) => (
                                  <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                                    <span className="text-sm text-gray-900">{getProductName(item.id)}</span>
                                    <span className="text-sm font-semibold text-gray-600">x{item.quantity}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Services in this session */}
                          {session.services && session.services.length > 0 && (
                            <div>
                              <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Dịch vụ thực hiện:
                              </div>
                              <div className="space-y-1">
                                {session.services.map((item, idx) => (
                                  <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                                    <span className="text-sm text-gray-900">{getProductName(item.id)}</span>
                                    <span className="text-sm font-semibold text-gray-600">x{item.quantity}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Empty session */}
                          {(!session.products || session.products.length === 0) && (!session.services || session.services.length === 0) && (
                            <div className="text-sm text-gray-500 italic">Chưa có sản phẩm/dịch vụ nào được thêm vào buổi này</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Chưa có chi tiết các buổi</p>
                      <p className="text-sm text-gray-400 mt-1">Vui lòng cập nhật thông tin chi tiết cho từng buổi trong gói liệu trình</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Summary (1/3) */}
            <div className="space-y-6">
              {/* Price Summary */}
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                <h3 className="text-base font-bold text-gray-900 mb-4">Thông tin giá</h3>
                <div className="space-y-4">
                  {/* Cost Price */}
                  {product.costPrice !== undefined && (
                    <div className="p-4 bg-gray-100 rounded-xl">
                      <div className="text-sm text-gray-600 mb-1">Giá vốn</div>
                      <div className="text-2xl font-bold text-gray-900">{product.costPrice.toLocaleString()}đ</div>
                    </div>
                  )}
                  
                  {/* Selling Price */}
                  <div className="p-4 bg-gradient-to-br from-[#FE7410] to-[#FF8C3A] rounded-xl text-white">
                    <div className="text-sm opacity-90 mb-1">Giá bán</div>
                    <div className="text-3xl font-bold">{product.price.toLocaleString()}đ</div>
                    {product.productType === 'treatment' && product.sessions && (
                      <div className="text-sm opacity-90 mt-2 pt-2 border-t border-white/20">
                        {(product.price / product.sessions).toLocaleString()}đ / buổi
                      </div>
                    )}
                  </div>
                  
                  {/* Profit */}
                  {product.costPrice !== undefined && product.costPrice > 0 && (
                    <div className="p-4 bg-green-50 rounded-xl">
                      <div className="text-sm text-green-700 mb-1">Lợi nhuận</div>
                      <div className="text-2xl font-bold text-green-600">
                        {(product.price - product.costPrice).toLocaleString()}đ
                      </div>
                      <div className="text-sm text-green-700 mt-1">
                        ({(((product.price - product.costPrice) / product.price) * 100).toFixed(1)}%)
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Info */}
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                <h3 className="text-base font-bold text-gray-900 mb-4">Thông tin nhanh</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-sm text-gray-600">Mã ID</span>
                    <span className="font-mono text-sm font-semibold text-gray-900 text-right break-all">{product.id}</span>
                  </div>
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-sm text-gray-600">Loại hình</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      product.productType === 'product' 
                        ? 'bg-blue-100 text-blue-800'
                        : product.productType === 'service'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {getProductTypeLabel(product.productType || 'product')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}