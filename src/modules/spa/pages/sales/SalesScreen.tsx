import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../../../lib/spa-lib/store';
import { useTranslation } from '../../../../lib/spa-lib/useTranslation';
import { Search, Plus, Minus, Trash2, X, Percent, DollarSign, Printer, User, Save, FileText, Keyboard, Barcode, Grid3x3, List, Calculator as CalcIcon, Tag, Clock, Star, MessageSquare, QrCode, Split, UserPlus, Package, Sparkles, Scissors } from 'lucide-react';
import { Calculator } from '../../components/forms/Calculator';
import { CustomerForm } from '../../components/forms/CustomerForm';
import type { Customer } from '../../../../lib/spa-lib/store';

type PaymentMethodType = 'cash' | 'card' | 'transfer';
type ProductTypeFilter = 'all' | 'product' | 'service' | 'treatment';

export function SalesScreen() {
  const { 
    products, 
    cart, 
    addToCart, 
    removeFromCart, 
    updateCartQuantity, 
    updateCartDiscount, 
    updateCartNote,
    createOrder, 
    categories, 
    heldBills, 
    holdBill, 
    recallBill, 
    deleteHeldBill, 
    currentShift,
    recentProducts,
    favoriteProducts,
    toggleFavorite,
    customers,
    settings
  } = useStore();
  const { t } = useTranslation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [productFilter, setProductFilter] = useState<'all' | 'recent' | 'favorite'>('all');
  const [productTypeFilter, setProductTypeFilter] = useState<ProductTypeFilter>('all');
  const [showCheckout, setShowCheckout] = useState(false);
  const [showHeldBills, setShowHeldBills] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showSplitPayment, setShowSplitPayment] = useState(false);
  const [showQRPayment, setShowQRPayment] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('cash');
  const [orderDiscount, setOrderDiscount] = useState(0);
  const [orderDiscountType, setOrderDiscountType] = useState<'amount' | 'percent'>('amount');
  const [note, setNote] = useState('');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [customerAmount, setCustomerAmount] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [barcodeMode, setBarcodeMode] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorTarget, setCalculatorTarget] = useState<{ type: 'quantity' | 'discount' | 'payment', itemId?: string } | null>(null);
  const [itemNoteEdit, setItemNoteEdit] = useState<string | null>(null);
  const [splitPayments, setSplitPayments] = useState<{ method: PaymentMethodType; amount: number }[]>([]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const [barcodeInput, setBarcodeInput] = useState('');

  const allCategories = ['all', ...categories];

  // Filter products based on selection
  let displayProducts = products;
  if (productFilter === 'recent') {
    displayProducts = products.filter(p => recentProducts.includes(p.id));
  } else if (productFilter === 'favorite') {
    displayProducts = products.filter(p => favoriteProducts.includes(p.id));
  }

  const filteredProducts = displayProducts.filter((product) => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode?.includes(searchQuery);
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesProductType = productTypeFilter === 'all' || 
      (productTypeFilter === 'product' && !product.productType) ||
      (productTypeFilter === 'service' && product.productType === 'service') ||
      (productTypeFilter === 'treatment' && product.productType === 'treatment');
    return matchesSearch && matchesCategory && matchesProductType && product.stock > 0;
  });

  // Filter customers based on search
  const filteredCustomers = customers.filter((customer) => {
    const query = customerSearchQuery.toLowerCase();
    return customer.name.toLowerCase().includes(query) || 
           customer.phone.includes(query);
  });

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemsDiscount = cart.reduce((sum, item) => sum + (item.discount * item.quantity), 0);
  
  // Calculate order discount
  const calculatedOrderDiscount = orderDiscountType === 'percent' 
    ? (subtotal - itemsDiscount) * (orderDiscount / 100)
    : orderDiscount;
  
  const total = subtotal - itemsDiscount - calculatedOrderDiscount;
  const changeAmount = customerAmount ? parseFloat(customerAmount) - total : 0;

  // Barcode scanner
  useEffect(() => {
    if (barcodeMode && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [barcodeMode]);

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const product = products.find(p => p.barcode === barcodeInput.trim());
    if (product && product.stock > 0) {
      addToCart(product);
      setBarcodeInput('');
      // Success feedback
      barcodeInputRef.current?.classList.add('bg-green-50', 'border-green-500');
      setTimeout(() => {
        barcodeInputRef.current?.classList.remove('bg-green-50', 'border-green-500');
      }, 300);
    } else {
      // Error feedback
      barcodeInputRef.current?.classList.add('bg-red-50', 'border-red-500');
      setTimeout(() => {
        barcodeInputRef.current?.classList.remove('bg-red-50', 'border-red-500');
        setBarcodeInput('');
      }, 500);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // F1 - Help/Shortcuts
      if (e.key === 'F1') {
        e.preventDefault();
        setShowShortcuts(true);
      }
      // F2 - Focus search
      if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // F3 - Hold bill
      if (e.key === 'F3') {
        e.preventDefault();
        if (cart.length > 0) {
          handleHoldBill();
        }
      }
      // F4 - Recall held bills
      if (e.key === 'F4') {
        e.preventDefault();
        setShowHeldBills(true);
      }
      // F8 - Toggle barcode mode
      if (e.key === 'F8') {
        e.preventDefault();
        setBarcodeMode(!barcodeMode);
      }
      // F9 - Checkout
      if (e.key === 'F9') {
        e.preventDefault();
        if (cart.length > 0) {
          setShowCheckout(true);
        }
      }
      // F10 - Clear cart
      if (e.key === 'F10') {
        e.preventDefault();
        if (cart.length > 0 && confirm(t('clearCart') + '?')) {
          cart.forEach(item => removeFromCart(item.id));
        }
      }
      // ESC - Close modals
      if (e.key === 'Escape') {
        setShowCheckout(false);
        setShowHeldBills(false);
        setShowShortcuts(false);
        setBarcodeMode(false);
        setShowCalculator(false);
        setShowSplitPayment(false);
        setShowQRPayment(false);
        setShowCustomerSearch(false);
        setShowCustomerForm(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [cart, t, barcodeMode]);

  // Close customer search when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showCustomerSearch && !(e.target as Element).closest('.customer-search-container')) {
        setShowCustomerSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCustomerSearch]);

  // Set default customer amount when opening checkout
  useEffect(() => {
    if (showCheckout) {
      setCustomerAmount(total.toString());
    }
  }, [showCheckout, total]);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (!currentShift) {
      alert(t('openShift') + '!');
      return;
    }
    
    const receivedAmount = customerAmount ? parseFloat(customerAmount) : total;
    
    // Get current user info from localStorage
    const currentUser = localStorage.getItem('salepa_username') || '';
    
    // Calculate change (can be negative if customer owes money)
    const calculatedChange = receivedAmount - total;

    // Create initial payment history entry
    const initialPaymentHistory = [{
      id: `PAY-${Date.now()}`,
      amount: receivedAmount,
      paymentMethod: paymentMethod,
      paidAt: new Date().toISOString(),
      paidBy: currentUser,
      note: note || '',
      changeAmount: calculatedChange,
    }];
    
    createOrder({
      paymentMethod,
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      note: note || undefined,
      discount: calculatedOrderDiscount,
      receivedAmount,
      paidAmount: receivedAmount,
      changeAmount: Math.max(0, receivedAmount - total),
      paymentHistory: initialPaymentHistory,
    });
    
    setShowCheckout(false);
    setCustomerName('');
    setCustomerPhone('');
    setPaymentMethod('cash');
    setOrderDiscount(0);
    setOrderDiscountType('amount');
    setNote('');
    setCustomerAmount('');
    setSelectedCustomer(null);
    setCustomerSearchQuery('');
    setShowCustomerSearch(false);
    alert(t('orderCreated'));
  };

  const handleQuickPay = (method: PaymentMethodType) => {
    if (cart.length === 0) return;
    if (!currentShift) {
      alert(t('openShift') + '!');
      return;
    }
    
    // Get current user info from localStorage
    const currentUser = localStorage.getItem('salepa_username') || '';
    
    // Create initial payment history entry
    const initialPaymentHistory = [{
      id: `PAY-${Date.now()}`,
      amount: total,
      paymentMethod: method,
      paidAt: new Date().toISOString(),
      paidBy: currentUser,
      note: '',
      changeAmount: 0,
    }];
    
    createOrder({
      paymentMethod: method,
      discount: calculatedOrderDiscount,
      paymentHistory: initialPaymentHistory,
    });
    
    setOrderDiscount(0);
    setOrderDiscountType('amount');
    alert(t('paymentSuccess'));
  };

  const handleHoldBill = () => {
    if (cart.length === 0) return;
    const name = prompt(t('customerName') + ':');
    holdBill(name || undefined);
    setOrderDiscount(0);
    setOrderDiscountType('amount');
    alert('✓ ' + t('holdBill') + ' ' + t('paymentSuccess').replace('✓ ', ''));
  };

  const handleRecallBill = (billId: string) => {
    recallBill(billId);
    setShowHeldBills(false);
  };

  const quickAmounts = [20000, 50000, 100000, 200000, 500000, 1000000];

  // Category images mapping
  const categoryImages: Record<string, string> = {
    'Massage': 'https://images.unsplash.com/photo-1745327883508-b6cd32e5dde5?w=400',
    'Chăm sóc da': 'https://images.unsplash.com/photo-1739950839930-ef45c078f316?w=400',
    'Nail': 'https://images.unsplash.com/photo-1648241815778-fdc8daf0d6ef?w=400',
    'Waxing': 'https://images.unsplash.com/photo-1758632031161-b6d7e913c2b9?w=400',
    'Sản phẩm': 'https://images.unsplash.com/photo-1739950839930-ef45c078f316?w=400',
    'Liệu trình': 'https://images.unsplash.com/photo-1745327883508-b6cd32e5dde5?w=400',
  };

  const getCategoryImage = (product: any) => {
    if (product.image) return product.image;
    return categoryImages[product.category] || categoryImages['Massage'];
  };

  // Quick quantity buttons
  const handleQuickQuantity = (itemId: string, qty: number) => {
    const item = cart.find(i => i.id === itemId);
    if (item) {
      updateCartQuantity(itemId, Math.max(1, item.quantity + qty));
    }
  };

  // Apply discount to selected item
  const applyItemDiscount = (itemId: string, type: 'percent' | 'amount', value: number) => {
    const item = cart.find(i => i.id === itemId);
    if (!item) return;

    if (type === 'percent') {
      const discountAmount = item.price * (value / 100);
      updateCartDiscount(itemId, Math.round(discountAmount));
    } else {
      updateCartDiscount(itemId, value);
    }
  };

  // Calculator handlers
  const handleCalculatorConfirm = (value: number) => {
    if (!calculatorTarget) return;

    if (calculatorTarget.type === 'quantity' && calculatorTarget.itemId) {
      updateCartQuantity(calculatorTarget.itemId, Math.max(1, value));
    } else if (calculatorTarget.type === 'discount' && calculatorTarget.itemId) {
      updateCartDiscount(calculatorTarget.itemId, Math.max(0, value));
    } else if (calculatorTarget.type === 'payment') {
      setCustomerAmount(value.toString());
    }
  };

  // Split payment
  const handleSplitPayment = () => {
    if (splitPayments.length === 0) {
      alert('Vui lòng thêm ít nhất 1 phương thức thanh toán!');
      return;
    }

    const totalPaid = splitPayments.reduce((sum, p) => sum + p.amount, 0);
    if (totalPaid < total) {
      alert(`Chưa đủ tiền! Còn thiếu ${(total - totalPaid).toLocaleString('vi-VN')}đ`);
      return;
    }

    if (!currentShift) {
      alert(t('openShift') + '!');
      return;
    }
    
    // Get current user info from localStorage
    const currentUser = localStorage.getItem('salepa_username') || '';
    
    // Create initial payment history entry for split payment
    const initialPaymentHistory = [{
      id: `PAY-${Date.now()}`,
      amount: totalPaid,
      paymentMethod: 'cash', // Default for split payment
      paidAt: new Date().toISOString(),
      paidBy: currentUser,
      note: note || '',
      changeAmount: totalPaid - total,
    }];

    createOrder({
      paymentMethod: 'cash', // Default
      paymentMethods: splitPayments.map(p => ({ method: p.method, amount: p.amount })),
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      note: note || undefined,
      discount: calculatedOrderDiscount,
      paymentHistory: initialPaymentHistory,
    });

    setShowSplitPayment(false);
    setSplitPayments([]);
    setShowCheckout(false);
    setCustomerName('');
    setCustomerPhone('');
    setOrderDiscount(0);
    setOrderDiscountType('amount');
    alert(t('paymentSuccess'));
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Products Section */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex gap-3 mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={t('searchProduct')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setBarcodeMode(!barcodeMode)}
              className={`px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 ${
                barcodeMode ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg' : 'bg-white border-2 border-orange-600 text-orange-600 hover:bg-orange-50'
              }`}
            >
              <Barcode className="w-5 h-5" />
              F8
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid3x3 className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setShowHeldBills(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-colors flex items-center gap-2 relative shadow-md"
            >
              <FileText className="w-5 h-5" />
              {t('savedBills')}
              {heldBills.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full">
                  {heldBills.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowShortcuts(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-colors flex items-center gap-2 shadow-md"
            >
              <Keyboard className="w-5 h-5" />
              F1
            </button>
          </div>

          {/* Barcode Scanner Mode */}
          {barcodeMode && (
            <form onSubmit={handleBarcodeSubmit} className="mb-3">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-600" />
                  <input
                    ref={barcodeInputRef}
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder={t('scanBarcode')}
                    className="w-full pl-10 pr-4 py-3 border-2 border-orange-500 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-orange-50 transition-colors"
                    autoFocus
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setBarcodeMode(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </form>
          )}

          {/* Product Filter Tabs */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setProductFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                productFilter === 'all' ? 'bg-gradient-to-r from-orange-600 to-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
              {t('all')}
            </button>
            <button
              onClick={() => setProductFilter('recent')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 relative ${
                productFilter === 'recent' ? 'bg-gradient-to-r from-orange-600 to-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              {t('recentProducts')}
              {recentProducts.length > 0 && (
                <span className="bg-orange-500 text-white text-xs px-1.5 rounded-full">
                  {recentProducts.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setProductFilter('favorite')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 relative ${
                productFilter === 'favorite' ? 'bg-gradient-to-r from-orange-600 to-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Star className="w-4 h-4" />
              {t('favoriteProducts')}
              {favoriteProducts.length > 0 && (
                <span className="bg-yellow-500 text-white text-xs px-1.5 rounded-full">
                  {favoriteProducts.length}
                </span>
              )}
            </button>
          </div>

          {/* Product Type Filter */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setProductTypeFilter('all')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                productTypeFilter === 'all' 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                  : 'bg-white border-2 border-purple-300 text-purple-700 hover:bg-purple-50'
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
              Tất cả loại
            </button>
            <button
              onClick={() => setProductTypeFilter('product')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                productTypeFilter === 'product' 
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg' 
                  : 'bg-white border-2 border-green-300 text-green-700 hover:bg-green-50'
              }`}
            >
              <Package className="w-4 h-4" />
              {t('spaProduct')}
            </button>
            <button
              onClick={() => setProductTypeFilter('service')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                productTypeFilter === 'service' 
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg' 
                  : 'bg-white border-2 border-blue-300 text-blue-700 hover:bg-blue-50'
              }`}
            >
              <Scissors className="w-4 h-4" />
              {t('spaService')}
            </button>
            <button
              onClick={() => setProductTypeFilter('treatment')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                productTypeFilter === 'treatment' 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                  : 'bg-white border-2 border-purple-300 text-purple-700 hover:bg-purple-50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              {t('spaTreatment')}
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto">
            {allCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category === 'all' ? `📋 ${t('all')}` : category}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid/List */}
        <div className="flex-1 overflow-auto p-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredProducts.map((product) => (
                <div key={product.id} className="relative group">
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full bg-white p-4 rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:shadow-lg transition-all text-left"
                  >
                    <div className="aspect-square bg-gradient-to-br from-orange-50 to-purple-50 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                      <img 
                        src={getCategoryImage(product)} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      {product.productType !== 'service' && product.productType !== 'treatment' && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                          {t('stock')}: {product.stock}
                        </div>
                      )}
                      {(product.productType === 'service' || product.productType === 'treatment') && product.duration && (
                        <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {product.duration}p
                        </div>
                      )}
                      {product.productType === 'treatment' && product.sessions && (
                        <div className="absolute top-2 left-2 bg-purple-500 text-white px-2 py-1 rounded text-xs">
                          {product.sessions} {t('sessions')}
                        </div>
                      )}
                      {product.barcode && !product.productType && (
                        <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded text-xs text-gray-600 flex items-center gap-1">
                          <Barcode className="w-3 h-3" />
                          {product.barcode}
                        </div>
                      )}
                    </div>
                    <h3 className="text-gray-900 mb-1 line-clamp-2 group-hover:text-orange-600 transition-colors">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <p className="text-orange-600">{product.price.toLocaleString('vi-VN')}{t('vnd')}</p>
                      {product.productType && (
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          product.productType === 'service' ? 'bg-blue-100 text-blue-700' : 
                          product.productType === 'treatment' ? 'bg-purple-100 text-purple-700' : 
                          'bg-green-100 text-green-700'
                        }`}>
                          {product.productType === 'service' ? t('spaService') : 
                           product.productType === 'treatment' ? t('spaTreatment') : 
                           t('spaProduct')}
                        </span>
                      )}
                    </div>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(product.id);
                    }}
                    className={`absolute top-2 right-2 p-2 rounded-lg transition-all ${
                      favoriteProducts.includes(product.id)
                        ? 'bg-yellow-500 text-white shadow-lg'
                        : 'bg-white/80 text-gray-400 hover:text-yellow-500 hover:bg-white'
                    }`}
                  >
                    <Star className={`w-5 h-5 ${favoriteProducts.includes(product.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProducts.map((product) => (
                <div key={product.id} className="relative group">
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full bg-white p-4 rounded-lg border-2 border-gray-200 hover:border-orange-500 hover:shadow-md transition-all text-left flex items-center gap-4"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-50 to-purple-50 rounded-lg flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden relative">
                      <img 
                        src={getCategoryImage(product)} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-gray-900 mb-1">{product.name}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
                        <span className={`px-2 py-0.5 rounded ${
                          product.productType === 'service' ? 'bg-blue-50 text-blue-600' : 
                          product.productType === 'treatment' ? 'bg-purple-50 text-purple-600' : 
                          'bg-gray-50 text-gray-600'
                        }`}>
                          {product.category}
                        </span>
                        {product.productType !== 'service' && product.productType !== 'treatment' && (
                          <span>Kho: {product.stock}</span>
                        )}
                        {(product.productType === 'service' || product.productType === 'treatment') && product.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {product.duration}p
                          </span>
                        )}
                        {product.productType === 'treatment' && product.sessions && (
                          <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                            {product.sessions} {t('sessions')}
                          </span>
                        )}
                        {product.barcode && !product.productType && (
                          <span className="flex items-center gap-1">
                            <Barcode className="w-3 h-3" />
                            {product.barcode}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-orange-600 text-lg">{product.price.toLocaleString('vi-VN')}{t('vnd')}</div>
                      {product.productType && (
                        <span className={`text-xs px-2 py-0.5 rounded inline-block mt-1 ${
                          product.productType === 'service' ? 'bg-blue-100 text-blue-700' : 
                          product.productType === 'treatment' ? 'bg-purple-100 text-purple-700' : 
                          'bg-green-100 text-green-700'
                        }`}>
                          {product.productType === 'service' ? t('spaService') : 
                           product.productType === 'treatment' ? t('spaTreatment') : 
                           t('spaProduct')}
                        </span>
                      )}
                    </div>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(product.id);
                    }}
                    className={`absolute top-4 right-4 p-2 rounded-lg transition-all ${
                      favoriteProducts.includes(product.id)
                        ? 'bg-yellow-500 text-white shadow-lg'
                        : 'bg-white text-gray-400 hover:text-yellow-500'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${favoriteProducts.includes(product.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Search className="w-16 h-16 mx-auto mb-3 opacity-30" />
              <p>{t('notFound')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-[600px] bg-white border-l border-gray-200 flex flex-col shadow-xl">
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-orange-600 via-orange-500 to-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white">{t('invoice')}</h3>
              <p className="text-blue-100 text-sm">{cart.length} {t('items_count')}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleHoldBill}
                disabled={cart.length === 0}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={t('holdBill') + ' (F3)'}
              >
                <Save className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => {
                  if (cart.length > 0 && confirm(t('clearCart') + '?')) {
                    cart.forEach(item => removeFromCart(item.id));
                  }
                }}
                disabled={cart.length === 0}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={t('clearCart') + ' (F10)'}
              >
                <Trash2 className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center text-gray-400 mt-20">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-12 h-12 text-gray-300" />
              </div>
              <p>{t('noProducts')}</p>
              <p className="text-sm mt-1">{t('selectProducts')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((item) => (
                <div 
                  key={item.id} 
                  className={`bg-gray-50 p-3 rounded-lg border-2 transition-all ${
                    selectedItem === item.id ? 'border-blue-500 bg-blue-50' : 'border-transparent'
                  }`}
                  onClick={() => setSelectedItem(selectedItem === item.id ? null : item.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="text-gray-900 line-clamp-2">{item.name}</h4>
                      <p className="text-sm text-gray-500">{item.price.toLocaleString('vi-VN')}{t('vnd')}</p>
                      {item.note && (
                        <div className="flex items-center gap-1 text-xs text-orange-600 mt-1 bg-orange-50 px-2 py-1 rounded">
                          <MessageSquare className="w-3 h-3" />
                          {item.note}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromCart(item.id);
                      }}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateCartQuantity(item.id, item.quantity - 1);
                      }}
                      className="w-8 h-8 flex items-center justify-center bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-red-500 hover:text-red-600 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCalculatorTarget({ type: 'quantity', itemId: item.id });
                        setShowCalculator(true);
                      }}
                      className="w-16 text-center py-1.5 border-2 border-blue-300 bg-blue-50 rounded-lg hover:border-blue-500 transition-colors cursor-pointer"
                    >
                      {item.quantity}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateCartQuantity(item.id, item.quantity + 1);
                      }}
                      className="w-8 h-8 flex items-center justify-center bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-green-500 hover:text-green-600 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    
                    {/* Quick quantity buttons */}
                    <div className="ml-auto flex gap-1">
                      {[5, 10].map((qty) => (
                        <button
                          key={qty}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickQuantity(item.id, qty);
                          }}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                        >
                          +{qty}
                        </button>
                      ))}
                    </div>
                    
                    <div className="ml-2 text-right">
                      {item.discount > 0 && (
                        <div className="text-xs text-gray-400 line-through">
                          {(item.price * item.quantity).toLocaleString('vi-VN')}{t('vnd')}
                        </div>
                      )}
                      <div className="text-blue-600">
                        {((item.price - item.discount) * item.quantity).toLocaleString('vi-VN')}{t('vnd')}
                      </div>
                    </div>
                  </div>

                  {/* Discount & Note Controls */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-gray-400" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCalculatorTarget({ type: 'discount', itemId: item.id });
                          setShowCalculator(true);
                        }}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded hover:border-blue-500 transition-colors text-left bg-white"
                      >
                        {item.discount > 0 ? `${item.discount.toLocaleString('vi-VN')}đ` : 'Giảm giá'}
                      </button>
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setItemNoteEdit(item.id);
                        }}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded hover:border-blue-500 transition-colors text-left bg-white"
                      >
                        {item.note || 'Ghi chú'}
                      </button>
                    </div>
                    
                    {/* Note edit mode */}
                    {itemNoteEdit === item.id && (
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={item.note || ''}
                          onChange={(e) => updateCartNote(item.id, e.target.value)}
                          placeholder={t('addProductNote')}
                          className="flex-1 px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => setItemNoteEdit(null)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          OK
                        </button>
                      </div>
                    )}
                    
                    {/* Quick discount buttons */}
                    {selectedItem === item.id && (
                      <div className="grid grid-cols-5 gap-1">
                        {[5, 10, 15, 20, 50].map((percent) => (
                          <button
                            key={percent}
                            onClick={(e) => {
                              e.stopPropagation();
                              applyItemDiscount(item.id, 'percent', percent);
                            }}
                            className="px-2 py-1 text-xs bg-orange-100 text-orange-600 rounded hover:bg-orange-200 transition-colors"
                          >
                            -{percent}%
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-4 space-y-3 bg-gray-50">
          {/* Order Discount */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-gray-700">{t('discountOrder')}</span>
              <div className="ml-auto flex gap-1">
                <button
                  onClick={() => setOrderDiscountType('amount')}
                  className={`px-2 py-1 text-xs rounded ${
                    orderDiscountType === 'amount' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {t('vnd')}
                </button>
                <button
                  onClick={() => setOrderDiscountType('percent')}
                  className={`px-2 py-1 text-xs rounded ${
                    orderDiscountType === 'percent' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  %
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={orderDiscount}
                onChange={(e) => setOrderDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                placeholder="0"
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
              />
              <span className="text-gray-600">{orderDiscountType === 'percent' ? '%' : t('vnd')}</span>
            </div>
            {orderDiscount > 0 && orderDiscountType === 'percent' && (
              <div className="text-xs text-orange-600 mt-1">
                = {calculatedOrderDiscount.toLocaleString('vi-VN')}{t('vnd')}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="space-y-2 bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex justify-between text-gray-600">
              <span>{t('subtotal')}:</span>
              <span>{subtotal.toLocaleString('vi-VN')}{t('vnd')}</span>
            </div>
            {(itemsDiscount > 0 || calculatedOrderDiscount > 0) && (
              <div className="flex justify-between text-orange-600">
                <span>{t('discount')}:</span>
                <span>-{(itemsDiscount + calculatedOrderDiscount).toLocaleString('vi-VN')}{t('vnd')}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="text-gray-700">{t('total')}:</span>
              <span className="text-blue-600 text-xl">{total.toLocaleString('vi-VN')}{t('vnd')}</span>
            </div>
          </div>
          
          {/* Quick Payment Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickPay('cash')}
              disabled={cart.length === 0 || !currentShift}
              className="py-2.5 bg-white border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 disabled:bg-gray-100 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium shadow-sm"
            >
              💵 {t('cash')}
            </button>
            <button
              onClick={() => handleQuickPay('card')}
              disabled={cart.length === 0 || !currentShift}
              className="py-2.5 bg-white border-2 border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 disabled:bg-gray-100 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium shadow-sm"
            >
              💳 {t('card')}
            </button>
            <button
              onClick={() => handleQuickPay('transfer')}
              disabled={cart.length === 0 || !currentShift}
              className="py-2.5 bg-white border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 disabled:bg-gray-100 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium shadow-sm"
            >
              🏦 {t('transfer')}
            </button>
          </div>

          {/* QR & Split Payment */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowQRPayment(true)}
              disabled={cart.length === 0 || !currentShift}
              className="py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg hover:from-pink-700 hover:to-rose-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all shadow-md disabled:shadow-none flex items-center justify-center gap-2 text-sm"
            >
              <QrCode className="w-4 h-4" />
              QR Payment
            </button>
            <button
              onClick={() => setShowSplitPayment(true)}
              disabled={cart.length === 0 || !currentShift}
              className="py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all shadow-md disabled:shadow-none flex items-center justify-center gap-2 text-sm"
            >
              <Split className="w-4 h-4" />
              Split Pay
            </button>
          </div>

          <button
            onClick={() => setShowCheckout(true)}
            disabled={cart.length === 0 || !currentShift}
            className="w-full bg-gradient-to-r from-orange-600 to-purple-600 text-white py-3.5 rounded-lg hover:from-orange-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all shadow-lg disabled:shadow-none font-medium"
          >
            <CalcIcon className="w-5 h-5 inline mr-2" />
            {t('detailedCheckout')} (F9)
          </button>
        </div>
      </div>

      {/* Calculator Modal */}
      {showCalculator && calculatorTarget && (
        <Calculator
          title={
            calculatorTarget.type === 'quantity' ? 'Số lượng' :
            calculatorTarget.type === 'discount' ? 'Giảm giá (VNĐ)' :
            'Tiền khách đưa'
          }
          initialValue={
            calculatorTarget.type === 'quantity' && calculatorTarget.itemId
              ? cart.find(i => i.id === calculatorTarget.itemId)?.quantity || 1
              : calculatorTarget.type === 'discount' && calculatorTarget.itemId
              ? cart.find(i => i.id === calculatorTarget.itemId)?.discount || 0
              : customerAmount ? parseFloat(customerAmount) : total
          }
          onConfirm={handleCalculatorConfirm}
          onClose={() => {
            setShowCalculator(false);
            setCalculatorTarget(null);
          }}
        />
      )}



      {/* Split Payment Modal */}
      {showSplitPayment && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl">
              <div>
                <h3 className="text-white">Split Payment</h3>
                <p className="text-indigo-100 text-sm">Thanh toán đa phương thức</p>
              </div>
              <button
                onClick={() => {
                  setShowSplitPayment(false);
                  setSplitPayments([]);
                }}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">Tổng cần thanh toán:</span>
                  <span className="text-2xl text-blue-600 font-bold">{total.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Đã thanh toán:</span>
                  <span className="text-lg text-green-600 font-medium">
                    {splitPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-blue-200">
                  <span className="text-gray-700">Còn lại:</span>
                  <span className="text-lg text-orange-600 font-medium">
                    {Math.max(0, total - splitPayments.reduce((sum, p) => sum + p.amount, 0)).toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>

              {/* Split payments list */}
              {splitPayments.length > 0 && (
                <div className="space-y-2">
                  {splitPayments.map((payment, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {payment.method === 'cash' && '💵'}
                          {payment.method === 'card' && '💳'}
                          {payment.method === 'transfer' && '🏦'}
                        </span>
                        <div>
                          <div className="text-sm text-gray-600">
                            {payment.method === 'cash' && 'Tiền mặt'}
                            {payment.method === 'card' && 'Thẻ'}
                            {payment.method === 'transfer' && 'Chuyển khoản'}
                          </div>
                          <div className="text-blue-600 font-medium">{payment.amount.toLocaleString('vi-VN')}đ</div>
                        </div>
                      </div>
                      <button
                        onClick={() => setSplitPayments(splitPayments.filter((_, i) => i !== index))}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add payment method */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Thêm phương thức thanh toán:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['cash', 'card', 'transfer'] as PaymentMethodType[]).map((method) => (
                    <button
                      key={method}
                      onClick={() => {
                        const remaining = total - splitPayments.reduce((sum, p) => sum + p.amount, 0);
                        if (remaining > 0) {
                          setSplitPayments([...splitPayments, { method, amount: remaining }]);
                        }
                      }}
                      className="p-3 bg-white border-2 border-gray-300 hover:border-blue-500 rounded-lg transition-all text-center"
                    >
                      <div className="text-2xl mb-1">
                        {method === 'cash' && '💵'}
                        {method === 'card' && '💳'}
                        {method === 'transfer' && '🏦'}
                      </div>
                      <div className="text-xs text-gray-600">
                        {method === 'cash' && 'Tiền mặt'}
                        {method === 'card' && 'Thẻ'}
                        {method === 'transfer' && 'Chuyển khoản'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSplitPayment}
                disabled={splitPayments.length === 0 || splitPayments.reduce((sum, p) => sum + p.amount, 0) < total}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all shadow-lg disabled:shadow-none font-medium"
              >
                ✓ Xác Nhận Thanh Toán
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-orange-600 via-orange-500 to-purple-600 rounded-t-2xl">
              <div>
                <h3 className="text-white text-2xl font-bold">{t('checkout')}</h3>
                <p className="text-orange-100 text-sm">{t('completePay')}</p>
              </div>
              <button
                onClick={() => {
                  setShowCheckout(false);
                  setShowCustomerSearch(false);
                }}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📝 {t('note')}
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-base"
                  placeholder={t('addNote')}
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  💳 {t('paymentMethod')}
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {(['cash', 'card', 'transfer'] as const).map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method as any)}
                      className={`py-6 px-4 rounded-xl border-2 transition-all text-center ${
                        paymentMethod === method
                          ? method === 'cash' ? 'bg-green-50 border-green-600 text-green-700 shadow-lg ring-4 ring-green-200'
                          : method === 'card' ? 'bg-orange-50 border-orange-600 text-orange-700 shadow-lg ring-4 ring-orange-200'
                          : 'bg-purple-50 border-purple-600 text-purple-700 shadow-lg ring-4 ring-purple-200'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-4xl mb-2">
                        {method === 'cash' && '💵'}
                        {method === 'card' && '💳'}
                        {method === 'transfer' && '🏦'}
                      </div>
                      <div className="text-base font-medium">
                        {method === 'cash' && t('cash')}
                        {method === 'card' && t('card')}
                        {method === 'transfer' && t('transfer')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* QR Code for Transfer */}
              {paymentMethod === 'transfer' && (
                <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
                  <h4 className="text-purple-900 font-semibold text-lg mb-4 flex items-center gap-2">
                    🏦 Quét mã QR để chuyển khoản
                  </h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white p-4 rounded-lg border border-purple-200 flex items-center justify-center">
                      <QrCode className="w-48 h-48 text-purple-300" />
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="bg-white p-3 rounded-lg border border-purple-200">
                        <div className="text-gray-600 mb-1">Ngân hàng</div>
                        <div className="text-purple-900 font-semibold">
                          {settings.bankName || 'Chưa thiết lập'}
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-purple-200">
                        <div className="text-gray-600 mb-1">Số tài khoản</div>
                        <div className="text-purple-900 font-semibold">
                          {settings.bankAccountNumber || 'Chưa thiết lập'}
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-purple-200">
                        <div className="text-gray-600 mb-1">Chủ tài khoản</div>
                        <div className="text-purple-900 font-semibold">
                          {settings.bankAccountHolder || 'Chưa thiết lập'}
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-purple-200">
                        <div className="text-gray-600 mb-1">Số tiền</div>
                        <div className="text-purple-600 text-xl font-bold">
                          {total.toLocaleString('vi-VN')}đ
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-center text-sm text-purple-700">
                    💡 Thiết lập thông tin ngân hàng tại <span className="font-semibold">Cài đặt</span>
                  </div>
                </div>
              )}

              {/* QR Code for Card */}
              {paymentMethod === 'card' && (
                <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
                  <h4 className="text-orange-900 font-semibold text-lg mb-4 flex items-center gap-2">
                    💳 Quét mã QR để thanh toán thẻ
                  </h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white p-4 rounded-lg border border-orange-200 flex items-center justify-center">
                      <QrCode className="w-48 h-48 text-orange-300" />
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="bg-white p-3 rounded-lg border border-orange-200">
                        <div className="text-gray-600 mb-1">Ngân hàng</div>
                        <div className="text-orange-900 font-semibold">
                          {settings.bankName || 'Chưa thiết lập'}
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-orange-200">
                        <div className="text-gray-600 mb-1">Số tài khoản</div>
                        <div className="text-orange-900 font-semibold">
                          {settings.bankAccountNumber || 'Chưa thiết lập'}
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-orange-200">
                        <div className="text-gray-600 mb-1">Chủ tài khoản</div>
                        <div className="text-orange-900 font-semibold">
                          {settings.bankAccountHolder || 'Chưa thiết lập'}
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-orange-200">
                        <div className="text-gray-600 mb-1">Số tiền</div>
                        <div className="text-orange-600 text-xl font-bold">
                          {total.toLocaleString('vi-VN')}đ
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-center text-sm text-orange-700">
                    💡 Thiết lập thông tin ngân hàng tại <span className="font-semibold">Cài đặt</span>
                  </div>
                </div>
              )}

              {/* Customer Amount - Always show for all payment methods */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  💰 {t('customerAmount') || 'Tiền khách đưa'}
                </label>
                <button
                  onClick={() => {
                    setCalculatorTarget({ type: 'payment' });
                    setShowCalculator(true);
                  }}
                  className="w-full px-3 py-3 border-2 border-orange-300 bg-orange-50 rounded-lg hover:border-orange-500 transition-colors text-left text-lg font-medium"
                >
                  {customerAmount ? parseFloat(customerAmount).toLocaleString('vi-VN') : '0'} đ
                </button>
                {customerAmount && changeAmount > 0 && (
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-green-700">{t('changeAmount') || 'Tiền thừa'}:</span>
                      <span className="text-green-600 text-xl font-medium">
                        {changeAmount.toLocaleString('vi-VN')}{t('vnd')}
                      </span>
                    </div>
                  </div>
                )}
                {customerAmount && changeAmount < 0 && (
                  <div className="bg-red-50 p-3 rounded-lg border border-red-200 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-red-700">Còn thiếu:</span>
                      <span className="text-red-600 text-xl font-medium">
                        {Math.abs(changeAmount).toLocaleString('vi-VN')}{t('vnd')}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="bg-gradient-to-br from-orange-50 to-purple-50 p-4 rounded-xl border border-orange-200">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-700">
                    <span>{t('subtotal')}:</span>
                    <span>{subtotal.toLocaleString('vi-VN')}{t('vnd')}</span>
                  </div>
                  {(itemsDiscount > 0 || calculatedOrderDiscount > 0) && (
                    <div className="flex justify-between text-orange-600">
                      <span>{t('discount')}:</span>
                      <span>-{(itemsDiscount + calculatedOrderDiscount).toLocaleString('vi-VN')}{t('vnd')}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-orange-300">
                    <span className="text-gray-800 font-medium">{t('customerPays')}:</span>
                    <span className="text-orange-600 text-2xl font-bold">{total.toLocaleString('vi-VN')}{t('vnd')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setShowCheckout(false);
                    setShowCustomerSearch(false);
                  }}
                  className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleCheckout}
                  className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg flex items-center justify-center gap-2 font-medium"
                >
                  <Printer className="w-5 h-5" />
                  {t('confirmAndPrint')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Held Bills Modal */}
      {showHeldBills && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[80vh] overflow-auto">
            <div className="sticky top-0 flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-orange-600 to-amber-600 rounded-t-2xl">
              <div>
                <h3 className="text-white">{t('savedBills')}</h3>
                <p className="text-orange-100 text-sm">{heldBills.length} {t('orders')}</p>
              </div>
              <button
                onClick={() => setShowHeldBills(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {heldBills.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <FileText className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p>{t('noOrders')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {heldBills.map((bill) => (
                    <div
                      key={bill.id}
                      className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-orange-500 transition-all"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="text-gray-900 mb-1 font-medium">
                            {bill.customerName || t('walkInCustomer')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(bill.createdAt).toLocaleString('vi-VN')}
                          </div>
                          <div className="text-sm text-gray-600 mt-2">
                            {bill.cart.length} {t('items_count')}: {bill.cart.map(item => `${item.name} (${item.quantity})`).join(', ')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-orange-600 font-medium text-lg">
                            {bill.cart.reduce((sum, item) => sum + (item.price - item.discount) * item.quantity, 0).toLocaleString('vi-VN')}{t('vnd')}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRecallBill(bill.id)}
                          className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                        >
                          {t('checkout')}
                        </button>
                        <button
                          onClick={() => deleteHeldBill(bill.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-gray-700 to-gray-800 rounded-t-2xl">
              <div>
                <h3 className="text-white">{t('shortcuts')}</h3>
                <p className="text-gray-300 text-sm">Phím tắt / Keyboard shortcuts</p>
              </div>
              <button
                onClick={() => setShowShortcuts(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              {[
                { key: 'F1', action: t('f1Help') },
                { key: 'F2', action: t('f2Search') },
                { key: 'F3', action: t('f3Hold') },
                { key: 'F4', action: t('f4Recall') },
                { key: 'F8', action: t('f8Barcode') },
                { key: 'F9', action: t('f9Checkout') },
                { key: 'F10', action: t('f10Clear') },
                { key: 'ESC', action: t('escCancel') },
              ].map((shortcut) => (
                <div key={shortcut.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">{shortcut.action}</span>
                  <kbd className="px-3 py-1 bg-white border border-gray-300 rounded shadow-sm text-sm font-mono">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Customer Form Modal */}
      {showCustomerForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[60] backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-green-600 to-emerald-600 rounded-t-2xl">
              <div>
                <h3 className="text-white">Thêm Khách Hàng Mới</h3>
                <p className="text-green-100 text-sm">Điền thông tin khách hàng</p>
              </div>
              <button
                onClick={() => setShowCustomerForm(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <CustomerForm
                onClose={() => {
                  setShowCustomerForm(false);
                  // Optionally refresh or update after adding customer
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ShoppingCart({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}
