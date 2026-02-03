import { useState } from 'react';
import { useStore } from '../../../../lib/spa-lib/store';
import type { CartItem } from '../../../../lib/spa-lib/store';
import { useTranslation } from '../../../../lib/spa-lib/useTranslation';
import { 
  QrCode, ShoppingBag, Check, X, 
  ChevronRight, MapPin, User, Phone, MessageSquare, Coffee,
  Utensils, PackageOpen, Sparkles, Clock, Star, Languages, ClipboardList
} from 'lucide-react';
import { ProductCard } from '../../components/self-service/ProductCard';
import { CartItemCard } from '../../components/self-service/CartItemCard';
import { ProductDetailModal } from '../../components/self-service/ProductDetailModal';
import { OrderViewScreen } from '../orders/OrderViewScreen';
import { MyOrdersScreen } from '../../components/self-service/MyOrdersScreen';

export function SelfServiceScreen() {
  const { 
    products, 
    cart, 
    addToCart, 
    removeFromCart, 
    updateCartQuantity,
    updateCartNote,
    createSelfServiceOrder,
    categories,
    currentTable,
    setCurrentTable,
    language,
    setLanguage,
    selfServiceOrders,
    addMessageToOrder
  } = useStore();
  const { t } = useTranslation();
  
  const [step, setStep] = useState<'scan' | 'order' | 'confirm' | 'success' | 'view-order' | 'my-orders'>('scan');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [qrInput, setQrInput] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway'>('dine-in');
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [viewingProduct, setViewingProduct] = useState<any | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

  // Demo tables
  const demoTables = [
    { id: 'T01', name: 'Bàn 01', qrCode: 'QR-TABLE-01', area: 'Tầng 1' },
    { id: 'T02', name: 'Bàn 02', qrCode: 'QR-TABLE-02', area: 'Tầng 1' },
    { id: 'T03', name: 'Bàn 03', qrCode: 'QR-TABLE-03', area: 'Tầng 1' },
    { id: 'T04', name: 'Bàn 04', qrCode: 'QR-TABLE-04', area: 'Tầng 2' },
    { id: 'T05', name: 'Bàn 05', qrCode: 'QR-TABLE-05', area: 'Tầng 2' },
    { id: 'VIP01', name: 'VIP 01', qrCode: 'QR-VIP-01', area: 'VIP' },
  ];

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal;

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesCategory && product.stock > 0;
  });

  // Get current order
  const currentOrder = currentOrderId ? selfServiceOrders.find(o => o.id === currentOrderId) : null;

  // Count orders for current table
  const myOrdersCount = selfServiceOrders.filter(o => o.tableId === currentTable?.id).length;

  // Handle QR scan
  const handleScanQR = () => {
    const table = demoTables.find(t => t.qrCode === qrInput.toUpperCase());
    if (table) {
      setCurrentTable({ ...table, status: 'occupied' });
      setStep('order');
      setQrInput('');
    } else {
      alert(t('invalidQRCode') || 'Invalid QR Code');
    }
  };

  // Handle quick table selection
  const handleSelectTable = (table: any) => {
    setCurrentTable({ ...table, status: 'occupied' });
    setStep('order');
  };

  // Handle quick add product
  const handleAddProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      // Always add directly with default options
      const productToAdd = { ...product } as CartItem;
      
      // If product has required options, use first choice as default
      if (product.options && product.options.length > 0) {
        const defaultOptions: any[] = [];
        let additionalPrice = 0;
        
        product.options.forEach((option: any) => {
          if (option.required && option.choices.length > 0) {
            const firstChoice = option.choices[0];
            defaultOptions.push({
              optionId: option.id,
              optionName: option.name,
              choiceId: firstChoice.id,
              choiceName: firstChoice.name,
              priceModifier: firstChoice.priceModifier,
            });
            additionalPrice += firstChoice.priceModifier;
          }
        });
        
        if (defaultOptions.length > 0) {
          productToAdd.selectedOptions = defaultOptions;
          productToAdd.price = product.price + additionalPrice;
        }
      }
      
      addToCart(productToAdd);
      setSelectedProduct(productId);
      setTimeout(() => setSelectedProduct(null), 300);
    }
  };

  // Handle view product details
  const handleViewProduct = (product: any) => {
    setViewingProduct(product);
  };

  // Handle add from product detail modal
  const handleAddFromDetail = (quantity: number, note: string, selectedOptions: { [optionId: string]: string[] }) => {
    if (!viewingProduct) return;
    
    // Build selected options array
    const optionsArray: any[] = [];
    if (viewingProduct.options && selectedOptions) {
      viewingProduct.options.forEach((option: any) => {
        const selectedChoiceIds = selectedOptions[option.id] || [];
        selectedChoiceIds.forEach(choiceId => {
          const choice = option.choices.find((c: any) => c.id === choiceId);
          if (choice) {
            optionsArray.push({
              optionId: option.id,
              optionName: option.name,
              choiceId: choice.id,
              choiceName: choice.name,
              priceModifier: choice.priceModifier,
            });
          }
        });
      });
    }
    
    // Calculate final price with options
    let finalPrice = viewingProduct.price;
    optionsArray.forEach(opt => {
      finalPrice += opt.priceModifier;
    });
    
    // Add to cart with options
    const productWithOptions = {
      ...viewingProduct,
      price: finalPrice,
      selectedOptions: optionsArray.length > 0 ? optionsArray : undefined,
      note: note || undefined,
    };
    
    for (let i = 0; i < quantity; i++) {
      addToCart(productWithOptions);
    }
    
    setViewingProduct(null);
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
    
    setCurrentOrderId(orderId);
    setStep('success');
    
    // Auto redirect to view-order after 3 seconds
    setTimeout(() => {
      setStep('view-order');
      setCustomerName('');
      setCustomerPhone('');
      setOrderNote('');
    }, 3000);
  };

  // Handle send message
  const handleSendMessage = (message: string, sender: 'customer' | 'staff', senderName: string) => {
    if (currentOrderId) {
      addMessageToOrder(currentOrderId, {
        sender,
        senderName,
        message,
      });
    }
  };

  // Handle order new items
  const handleOrderNew = () => {
    setStep('order');
  };

  // Category icons
  const categoryIcons: { [key: string]: any} = {
    'Đồ uống': Coffee,
    'Đồ ăn': Utensils,
    'Bánh kẹo': PackageOpen,
    'Món ăn nhanh': Sparkles,
    'Món Hàn': Utensils,
    'Món Nhật': Utensils,
    'Món Thái': Utensils,
  };

  // === MY ORDERS SCREEN ===
  if (step === 'my-orders') {
    return (
      <MyOrdersScreen
        orders={selfServiceOrders}
        currentTableId={currentTable?.id}
        onBack={() => setStep('order')}
        onSelectOrder={(orderId) => {
          setCurrentOrderId(orderId);
          setStep('view-order');
        }}
        onNewOrder={() => setStep('order')}
      />
    );
  }

  // === VIEW-ORDER SCREEN ===
  if (step === 'view-order') {
    return (
      <OrderViewScreen
        order={currentOrder || null}
        onBack={() => setStep('my-orders')}
        onSendMessage={handleSendMessage}
        onOrderNew={handleOrderNew}
      />
    );
  }

  // === SCAN QR SCREEN ===
  if (step === 'scan') {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          {/* Welcome Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full mb-4 shadow-lg">
              <QrCode className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {t('welcomeTo') || 'Welcome to'} <span className="text-blue-600">Restaurant</span>
            </h1>
            <p className="text-xl text-gray-600">
              {t('selfServiceOrdering') || 'Self-Service Ordering System'}
            </p>
          </div>

          {/* QR Scanner Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t('scanTableQR') || 'Scan Table QR Code'}
              </h2>
              <p className="text-gray-600">
                {t('scanQRToStart') || 'Scan the QR code on your table to start ordering'}
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <QrCode className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('enterQRCode') || 'Enter QR Code (e.g., QR-TABLE-01)'}
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleScanQR()}
                  className="w-full pl-14 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              <button
                onClick={handleScanQR}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl hover:shadow-xl transition-all text-lg font-bold"
              >
                {t('startOrdering') || 'Start Ordering'}
              </button>
            </div>
          </div>

          {/* Quick Table Selection */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              {t('quickSelect') || 'Quick Select Table'}
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {demoTables.map((table) => (
                <button
                  key={table.id}
                  onClick={() => handleSelectTable(table)}
                  className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-indigo-50 rounded-xl border-2 border-gray-200 hover:border-blue-500 transition-all"
                >
                  <div className="font-bold text-gray-900">{table.name}</div>
                  <div className="text-xs text-gray-500">{table.area}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === ORDER SCREEN ===
  if (step === 'order') {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 sticky top-0 z-10 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{t('selfService')}</h1>
                <p className="text-sm text-blue-100">
                  {currentTable?.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Language Toggle */}
              <button
                onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all"
              >
                <Languages className="w-5 h-5" />
              </button>

              {/* My Orders Button - Desktop & Mobile */}
              <button
                onClick={() => setStep('my-orders')}
                className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-all font-medium flex items-center gap-2 relative"
              >
                <ClipboardList className="w-5 h-5" />
                <span className="hidden sm:inline">{t('myOrders')}</span>
                {myOrdersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs font-bold flex items-center justify-center">
                    {myOrdersCount}
                  </span>
                )}
              </button>

              {/* Mobile Cart Button */}
              <button
                onClick={() => setShowCart(true)}
                className="lg:hidden relative bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all"
              >
                <ShoppingBag className="w-5 h-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs font-bold flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
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

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Products Section */}
          <div className="flex-1 flex flex-col overflow-hidden">
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
            <div className="flex-1 overflow-y-auto p-3">
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickAdd={handleAddProduct}
                    onViewDetails={handleViewProduct}
                    isSelected={selectedProduct === product.id}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Cart Sidebar (Desktop) */}
          <div className="hidden lg:flex lg:w-96 xl:w-[28rem] bg-white border-l-2 border-gray-200 flex-col shadow-2xl">
            {/* Cart Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold">{t('yourOrder')}</h2>
                <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                  {cart.length} {t('items')}
                </div>
              </div>
              <div className="text-sm text-green-100">
                {orderType === 'dine-in' ? '🍽️ ' + t('dineIn') : '📦 ' + t('takeaway')}
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <ShoppingBag className="w-16 h-16 mb-3" />
                  <p className="font-medium">{t('emptyCart')}</p>
                  <p className="text-xs mt-1">{t('selectProducts') || 'Select products to order'}</p>
                </div>
              ) : (
                cart.map((item) => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateCartQuantity}
                    onUpdateNote={updateCartNote}
                    onRemove={removeFromCart}
                  />
                ))
              )}
            </div>

            {/* Cart Summary */}
            {cart.length > 0 && (
              <div className="border-t-2 border-gray-200 p-3 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="space-y-1.5 mb-3">
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>{t('subtotal')}</span>
                    <span className="font-semibold">{subtotal.toLocaleString()}đ</span>
                  </div>
                  <div className="flex justify-between items-center pt-1.5 border-t border-gray-300">
                    <span className="font-bold text-gray-900">{t('total')}</span>
                    <span className="text-xl font-bold text-blue-600">
                      {total.toLocaleString()}đ
                    </span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2 font-bold"
                >
                  <Check className="w-5 h-5" />
                  {t('placeOrder') || 'Place Order'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Bottom Bar */}
        {cart.length > 0 && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm text-gray-600">{cart.length} {t('items')}</div>
                <div className="text-2xl font-bold text-blue-600">
                  {total.toLocaleString()}đ
                </div>
              </div>
              <button
                onClick={handlePlaceOrder}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl hover:shadow-xl transition-all flex items-center gap-2 font-bold text-lg"
              >
                {t('placeOrder') || 'Place Order'}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Mobile Cart Modal */}
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
                    <CartItemCard
                      key={item.id}
                      item={item}
                      onUpdateQuantity={updateCartQuantity}
                      onRemove={removeFromCart}
                      compact
                    />
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
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl hover:shadow-lg transition-all font-bold"
                  >
                    {t('placeOrder') || 'Place Order'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Product Detail Modal */}
        <ProductDetailModal
          product={viewingProduct}
          onClose={() => setViewingProduct(null)}
          onAdd={handleAddFromDetail}
        />
      </div>
    );
  }

  // === CONFIRM SCREEN ===
  if (step === 'confirm') {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
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
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {(item.price * item.quantity).toLocaleString()}đ
                    </span>
                  </div>
                ))}
                <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between">
                  <span className="font-bold text-gray-900">{t('total')}</span>
                  <span className="text-xl font-bold text-blue-600">
                    {total.toLocaleString()}đ
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('order')}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all"
                >
                  {t('back')}
                </button>
                <button
                  onClick={handleConfirmOrder}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2"
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

  // === SUCCESS SCREEN ===
  if (step === 'success') {
    return (
      <div className="h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full mb-6 shadow-lg">
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
              <p>{t('viewingOrder') || 'Opening order details...'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default SelfServiceScreen;