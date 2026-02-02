import { useState, useEffect } from 'react';
import { useStore } from '../../../../lib/convenience-store-lib/store';
import { useTranslation } from '../../../../lib/convenience-store-lib/useTranslation';
import { 
  ShoppingBag, Plus, Minus, Trash2, Check, X, 
  ChevronRight, MapPin, User, Phone, MessageSquare, Coffee,
  Utensils, PackageOpen, Sparkles, Clock, Star, ArrowLeft,
  Receipt, Package, History
} from 'lucide-react';

// Simulate QR code scanning
const SIMULATED_TABLE_QR = 'QR-TABLE-02';

export function CustomerView() {
  const { 
    products, 
    cart, 
    addToCart, 
    removeFromCart, 
    updateCartQuantity,
    createSelfServiceOrder,
    categories,
    clearCart,
    language,
    setLanguage,
    selfServiceOrders
  } = useStore();
  const { t } = useTranslation();
  
  const [step, setStep] = useState<'order' | 'confirm' | 'success' | 'view-order'>('order');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway'>('dine-in');
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [currentTable, setCurrentTable] = useState<any>(null);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  // Demo tables
  const demoTables = [
    { id: 'T01', name: 'Bàn 01', qrCode: 'QR-TABLE-01', area: 'Tầng 1' },
    { id: 'T02', name: 'Bàn 02', qrCode: 'QR-TABLE-02', area: 'Tầng 1' },
    { id: 'T03', name: 'Bàn 03', qrCode: 'QR-TABLE-03', area: 'Tầng 1' },
    { id: 'T04', name: 'Bàn 04', qrCode: 'QR-TABLE-04', area: 'Tầng 2' },
    { id: 'T05', name: 'Bàn 05', qrCode: 'QR-TABLE-05', area: 'Tầng 2' },
    { id: 'VIP01', name: 'VIP 01', qrCode: 'QR-VIP-01', area: 'VIP' },
  ];

  // Simulate QR scanning
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tableQR = urlParams.get('table') || SIMULATED_TABLE_QR;
    
    const table = demoTables.find(t => t.qrCode === tableQR);
    if (table) {
      setCurrentTable({ ...table, status: 'occupied' });
    }
  }, []);

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal;

  // Filter products - Only show ACTIVE products (status = 1)
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const isActive = product.status === 1; // Only active products
    return matchesCategory && product.stock > 0 && isActive;
  });

  // Get orders for current table
  const tableOrders = selfServiceOrders.filter(order => order.tableId === currentTable?.id);

  // Handle add to cart
  const handleAddProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      addToCart(product);
      setSelectedProduct(productId);
      setTimeout(() => setSelectedProduct(null), 300);
    }
  };

  // Handle place order
  const handlePlaceOrder = () => {
    if (cart.length === 0) {
      alert(t('emptyCart'));
      return;
    }
    setStep('confirm');
  };

  // Handle confirm order
  const handleConfirmOrder = () => {
    const orderId = Date.now().toString();
    setLastOrderId(orderId);
    
    createSelfServiceOrder({
      tableId: currentTable?.id,
      tableName: currentTable?.name,
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      note: orderNote || undefined,
      status: 'pending',
      orderType,
      paymentMethod: 'cash',
      discount: 0,
    });
    
    setStep('success');
    
    // Auto redirect to view order after 3 seconds
    setTimeout(() => {
      setStep('view-order');
      setCustomerName('');
      setCustomerPhone('');
      setOrderNote('');
    }, 3000);
  };

  // Category icons
  const categoryIcons: { [key: string]: any } = {
    'Đồ uống': Coffee,
    'Đồ ăn': Utensils,
    'Bánh kẹo': PackageOpen,
    'Món ăn nhanh': Sparkles,
    'Món Hàn': Utensils,
    'Món Nhật': Utensils,
    'Món Thái': Utensils,
  };

  // Get product emoji
  const getProductEmoji = (category: string) => {
    const emojiMap: { [key: string]: string } = {
      'Đồ uống': '🥤',
      'Đồ ăn': '🍜',
      'Bánh kẹo': '🍰',
      'Món ăn nhanh': '🍔',
      'Món Hàn': '🍱',
      'Món Nhật': '🍣',
      'Món Thái': '🍛',
    };
    return emojiMap[category] || '🍽️';
  };

  // Get order status info
  const getOrderStatusInfo = (status: string) => {
    const statusMap: { [key: string]: { text: string; color: string; icon: string } } = {
      pending: { text: t('pending') || 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: '⏳' },
      confirmed: { text: t('confirmed') || 'Confirmed', color: 'bg-blue-100 text-blue-700', icon: '✓' },
      preparing: { text: t('preparing') || 'Preparing', color: 'bg-purple-100 text-purple-700', icon: '👨‍🍳' },
      ready: { text: t('ready') || 'Ready', color: 'bg-green-100 text-green-700', icon: '✅' },
      served: { text: t('served') || 'Served', color: 'bg-gray-100 text-gray-700', icon: '🍽️' },
      cancelled: { text: t('cancelled') || 'Cancelled', color: 'bg-red-100 text-red-700', icon: '❌' },
    };
    return statusMap[status] || statusMap.pending;
  };

  // Loading state
  if (!currentTable) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full mb-4 shadow-lg animate-pulse">
            <MapPin className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('loading')}...
          </h2>
          <p className="text-gray-600">
            {t('scanQRToStart') || 'Scanning QR code...'}
          </p>
        </div>
      </div>
    );
  }

  // View Order Screen
  if (step === 'view-order') {
    const latestOrder = tableOrders[0];
    
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-lg">{t('yourOrder') || 'Your Order'}</div>
                <div className="text-sm text-blue-100">{currentTable?.name} • {currentTable?.area}</div>
              </div>
            </div>
            
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
              className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-all text-sm font-medium"
            >
              {language === 'vi' ? '🇬🇧 EN' : '🇻🇳 VI'}
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="flex-1 overflow-y-auto p-4">
          {tableOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Receipt className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t('noOrders') || 'No orders yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('startOrdering') || 'Start ordering from the menu'}
              </p>
              <button
                onClick={() => setStep('order')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
              >
                {t('startOrdering') || 'Start Ordering'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {tableOrders.map((order) => {
                const statusInfo = getOrderStatusInfo(order.status);
                return (
                  <div key={order.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* Order Header */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="text-sm text-gray-600">
                            {t('orderCode') || 'Order'} #{order.id.slice(-6)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(order.date).toLocaleString('vi-VN')}
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                          {statusInfo.icon} {statusInfo.text}
                        </div>
                      </div>
                      
                      {/* Order Type */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        {order.orderType === 'dine-in' ? (
                          <>
                            <span>🍽️</span>
                            <span>{t('dineIn') || 'Dine In'}</span>
                          </>
                        ) : (
                          <>
                            <span>📦</span>
                            <span>{t('takeaway') || 'Takeaway'}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-4 space-y-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 text-2xl">
                            {getProductEmoji(item.category)}
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-600">{item.category}</div>
                            <div className="text-blue-600 font-semibold mt-1">
                              {item.price.toLocaleString()}đ × {item.quantity}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">
                              {(item.price * item.quantity).toLocaleString()}đ
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Total */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-t border-blue-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700">{t('subtotal')}</span>
                        <span className="text-gray-900">{order.subtotal.toLocaleString()}đ</span>
                      </div>
                      {order.discount > 0 && (
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-700">{t('discount')}</span>
                          <span className="text-red-600">-{order.discount.toLocaleString()}đ</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                        <span className="text-lg font-bold text-gray-900">{t('total')}</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {order.total.toLocaleString()}đ
                        </span>
                      </div>
                    </div>

                    {/* Customer Info */}
                    {(order.customerName || order.customerPhone || order.note) && (
                      <div className="p-4 bg-gray-50 border-t border-gray-200">
                        <div className="text-sm font-bold text-gray-700 mb-2">
                          {t('customerInfo') || 'Customer Information'}
                        </div>
                        {order.customerName && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <User className="w-4 h-4" />
                            <span>{order.customerName}</span>
                          </div>
                        )}
                        {order.customerPhone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <Phone className="w-4 h-4" />
                            <span>{order.customerPhone}</span>
                          </div>
                        )}
                        {order.note && (
                          <div className="flex items-start gap-2 text-sm text-gray-600">
                            <MessageSquare className="w-4 h-4 mt-0.5" />
                            <span>{order.note}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Estimated Time */}
                    {(order.status === 'pending' || order.status === 'confirmed' || order.status === 'preparing') && (
                      <div className="p-4 bg-green-50 border-t border-green-100 flex items-center justify-center gap-2 text-green-700">
                        <Clock className="w-5 h-5" />
                        <span className="font-medium">
                          {t('estimatedTime') || 'Estimated time'}: 15-20 {t('minutes') || 'minutes'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="bg-white border-t border-gray-200 p-4 shadow-lg">
          <button
            onClick={() => {
              setOrderType('dine-in');
              setStep('order');
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {t('addMore') || 'Order More Items'}
          </button>
        </div>
      </div>
    );
  }

  // Order Screen
  if (step === 'order') {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg">{currentTable?.name}</div>
                <div className="text-sm text-blue-100">{currentTable?.area}</div>
              </div>
            </div>
            
            {/* My Orders Button */}
            {tableOrders.length > 0 && (
              <button
                onClick={() => setStep('view-order')}
                className="mr-3 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-all text-sm font-medium flex items-center gap-1"
              >
                <Receipt className="w-4 h-4" />
                <span>{tableOrders.length}</span>
              </button>
            )}
            
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
              className="mr-3 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-all text-sm font-medium"
            >
              {language === 'vi' ? '🇬🇧 EN' : '🇻🇳 VI'}
            </button>
            
            <button
              onClick={() => setShowCart(true)}
              className="relative bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-all"
            >
              <ShoppingBag className="w-6 h-6" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-xs font-bold flex items-center justify-center shadow-lg">
                  {cart.length}
                </span>
              )}
            </button>
          </div>

          {/* Order Type Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setOrderType('dine-in')}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                orderType === 'dine-in'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              🍽️ {t('dineIn') || 'Dine In'}
            </button>
            <button
              onClick={() => setOrderType('takeaway')}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                orderType === 'takeaway'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              📦 {t('takeaway') || 'Takeaway'}
            </button>
          </div>
        </div>

        {/* Previous Orders Section - Collapsible */}
        {tableOrders.length > 0 && (
          <div className="bg-white border-b-2 border-blue-100">
            <button
              onClick={() => setStep('view-order')}
              className="w-full p-4 flex items-center justify-between hover:bg-blue-50 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-gray-900">
                    {tableOrders.length} {t('order')} {t('orderBeingPrepared') || 'being prepared'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {t('tapToView') || 'Tap to view details'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right mr-2">
                  <div className="font-bold text-blue-600">
                    {tableOrders.reduce((sum, o) => sum + o.total, 0).toLocaleString()}đ
                  </div>
                  <div className="text-xs text-gray-500">{t('total')}</div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </button>
            
            {/* Quick Preview of Latest Order */}
            <div className="px-4 pb-3 space-y-2">
              {tableOrders.slice(0, 1).map((order) => {
                const statusInfo = getOrderStatusInfo(order.status);
                return (
                  <div key={order.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">
                          {t('orderCode') || 'Order'} #{order.id.slice(-6)}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                          {statusInfo.icon} {statusInfo.text}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(order.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="space-y-1">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getProductEmoji(item.category)}</span>
                            <span className="text-gray-700">{item.quantity}x {item.name}</span>
                          </div>
                          <span className="text-gray-900 font-medium">
                            {(item.price * item.quantity).toLocaleString()}đ
                          </span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="text-xs text-gray-500 text-center pt-1">
                          +{order.items.length - 3} {t('items')} {t('more') || 'more'}...
                        </div>
                      )}
                    </div>
                    {(order.status === 'pending' || order.status === 'confirmed' || order.status === 'preparing') && (
                      <div className="mt-2 flex items-center justify-center gap-2 text-xs text-blue-600 bg-white/50 rounded-lg py-1">
                        <Clock className="w-3 h-3" />
                        <span>{t('estimatedTime')}: 15-20 {t('minutes')}</span>
                      </div>
                    )}
                  </div>
                );
              })}
              {tableOrders.length > 1 && (
                <div className="text-center text-sm text-blue-600 font-medium">
                  +{tableOrders.length - 1} {t('order')} {t('more') || 'more'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Categories */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 overflow-x-auto flex gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ⭐ {t('all')}
          </button>
          {categories.map((category) => {
            const Icon = categoryIcons[category] || Utensils;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {category}
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-24">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden ${
                  selectedProduct === product.id ? 'ring-4 ring-blue-500 scale-95' : ''
                }`}
              >
                <div className="aspect-square bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                  <div className="text-6xl">
                    {getProductEmoji(product.category)}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 min-h-[3rem]">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl font-bold text-blue-600">
                      {product.price.toLocaleString()}đ
                    </span>
                    {product.stock < 10 && (
                      <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                        {product.stock} {t('left') || 'left'}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleAddProduct(product.id)}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 font-medium active:scale-95"
                  >
                    <Plus className="w-5 h-5" />
                    {t('add')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        {cart.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm text-gray-600">{cart.length} {t('items')}</div>
                <div className="text-2xl font-bold text-blue-600">
                  {total.toLocaleString()}đ
                </div>
              </div>
              <button
                onClick={handlePlaceOrder}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl hover:shadow-xl transition-all flex items-center gap-2 font-bold text-lg active:scale-95"
              >
                {t('placeOrder') || 'Place Order'}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Cart Modal */}
        {showCart && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold">{t('yourOrder')}</h2>
                <button onClick={() => setShowCart(false)} className="p-1.5 hover:bg-white/20 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <ShoppingBag className="w-16 h-16 mx-auto mb-3" />
                    <p>{t('emptyCart')}</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 text-3xl">
                          {getProductEmoji(item.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900">{item.name}</h3>
                          <div className="text-lg font-bold text-blue-600">
                            {item.price.toLocaleString()}đ
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="w-10 h-10 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-500 active:scale-95"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <div className="w-16 h-10 bg-white border-2 border-blue-500 rounded-lg flex items-center justify-center">
                          <span className="font-bold text-lg">{item.quantity}</span>
                        </div>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center active:scale-95"
                        >
                          <Plus className="w-4 h-4 text-white" />
                        </button>
                        <div className="ml-auto text-right">
                          <div className="text-sm text-gray-500">{t('subtotal')}</div>
                          <div className="font-bold text-blue-600">
                            {(item.price * item.quantity).toLocaleString()}đ
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t border-gray-200 p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">{t('total')}</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {total.toLocaleString()}đ
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setShowCart(false);
                      handlePlaceOrder();
                    }}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl hover:shadow-lg transition-all font-bold active:scale-95"
                  >
                    {t('placeOrder') || 'Place Order'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Confirm Screen
  if (step === 'confirm') {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="max-w-2xl w-full my-8">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
              <h2 className="text-2xl font-bold mb-1">{t('confirmOrder') || 'Confirm Your Order'}</h2>
              <p className="text-blue-100">{currentTable?.name} • {currentTable?.area}</p>
            </div>

            <div className="p-6 space-y-4">
              {/* Customer Info */}
              <div className="space-y-3">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('customerName') + ' (' + (t('optional') || 'Optional') + ')'}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    placeholder={t('phoneNumber') + ' (' + (t('optional') || 'Optional') + ')'}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    placeholder={t('specialRequests') || 'Special requests (Optional)'}
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    rows={3}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <h3 className="font-bold text-gray-900 mb-3">{t('orderSummary') || 'Order Summary'}</h3>
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-200 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getProductEmoji(item.category)}</span>
                      <div>
                        <div className="font-semibold text-gray-900">{item.name}</div>
                        <div className="text-gray-600">{item.quantity} × {item.price.toLocaleString()}đ</div>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900">
                      {(item.price * item.quantity).toLocaleString()}đ
                    </span>
                  </div>
                ))}
                <div className="border-t-2 border-gray-300 pt-3 mt-3 flex justify-between">
                  <span className="text-lg font-bold text-gray-900">{t('total')}</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {total.toLocaleString()}đ
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('order')}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  {t('back')}
                </button>
                <button
                  onClick={handleConfirmOrder}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Check className="w-5 h-5" />
                  {t('confirmOrder') || 'Confirm Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success Screen
  if (step === 'success') {
    return (
      <div className="h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full mb-6 shadow-lg animate-bounce">
              <Check className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {t('orderConfirmed') || 'Order Confirmed!'}
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              {t('orderBeingPrepared') || 'Your order is being prepared'}
            </p>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-center gap-3 mb-3">
                <MapPin className="w-6 h-6 text-green-600" />
                <span className="text-xl font-bold text-gray-900">{currentTable?.name}</span>
              </div>
              <div className="text-gray-600">{currentTable?.area}</div>
              <div className="mt-3 text-sm text-gray-500">
                {orderType === 'dine-in' ? '🍽️ ' + (t('dineIn') || 'Dine In') : '📦 ' + (t('takeaway') || 'Takeaway')}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-gray-500 mb-6">
              <Clock className="w-5 h-5" />
              <span>{t('estimatedTime') || 'Estimated time'}: 15-20 {t('minutes') || 'minutes'}</span>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center justify-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>{t('thankYou') || 'Thank you for your order!'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default CustomerView;