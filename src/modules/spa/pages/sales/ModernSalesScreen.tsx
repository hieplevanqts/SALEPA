import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../../../lib/spa-lib/store';
import { useTranslation } from '../../../../lib/spa-lib/useTranslation';
import { toast } from 'sonner';
import { 
  Search, Plus, Minus, Trash2, X, DollarSign, User, 
  Clock, CreditCard, Smartphone, QrCode, Zap, Grid3x3, List,
  Tag, Star, ShoppingBag, Percent,
  Check, AlertCircle, Barcode,
  RotateCcw, PauseCircle, PlayCircle,
  History, Grid, Monitor, Edit2,
  Receipt, Volume2, Gift,
  Package, Scissors, Sparkles
} from 'lucide-react';
import { CardPaymentForm } from '../../components/forms/CardPaymentForm';
import { QRPaymentForm } from '../../components/forms/QRPaymentForm';
import { Receipt as ReceiptModal } from '../../components/common/Receipt';
import { CustomerForm } from '../../components/forms/CustomerForm';

type PaymentMethodType = 'cash' | 'card' | 'transfer' | 'momo' | 'zalopay' | 'vnpay';
type ProductTypeFilter = 'all' | 'product' | 'service' | 'treatment';

// Helper function to get category images from Unsplash
const getCategoryImage = (category: string, productType?: string): string => {
  // First check if product has its own image
  const categoryMap: Record<string, string> = {
    'Massage': 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Chăm sóc da': 'https://images.unsplash.com/photo-1684014286330-ddbeb4a40c92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Nail': 'https://images.unsplash.com/photo-1599458348985-236f9b110da1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Waxing': 'https://images.unsplash.com/photo-1582498674105-ad104fcc5784?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Sản phẩm': 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Liệu trình': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  };
  return categoryMap[category] || categoryMap[productType || ''] || '';
};

export function ModernSalesScreen() {
  const { 
    products, 
    cart, 
    addToCart, 
    removeFromCart, 
    updateCartQuantity, 
    createOrder, 
    deleteOrder,
    categories,
    recentProducts,
    favoriteProducts,
    toggleFavorite,
    heldBills,
    holdBill,
    recallBill,
    deleteHeldBill,
    orders,
    settings,
    addToRecent,
    customers,
    createCustomerTreatmentPackage,
    editingOrder,
    setEditingOrder,
    clearCart
  } = useStore();
  const { t } = useTranslation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [productTypeFilter, setProductTypeFilter] = useState<ProductTypeFilter>('all');
  const [showCheckout, setShowCheckout] = useState(false);
  const [showHeldBills, setShowHeldBills] = useState(false);
  const [showCustomerDisplay, setShowCustomerDisplay] = useState(false);
  const [showRecentTransactions, setShowRecentTransactions] = useState(false);
  const [showQuickQuantity, setShowQuickQuantity] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('cash');
  const [orderDiscount, setOrderDiscount] = useState(0);
  const [customerAmount, setCustomerAmount] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'all' | 'recent' | 'favorite'>('all');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedCartItem, setSelectedCartItem] = useState<string | null>(null);
  const [quickQuantity, setQuickQuantity] = useState('1');
  const [selectedProductForQty, setSelectedProductForQty] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [tipAmount, setTipAmount] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null); // Track if editing an existing order
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [deletingBillId, setDeletingBillId] = useState<string | null>(null);
  const [issueInvoice, setIssueInvoice] = useState(false); // Checkbox Phát hành HDDT
  const searchInputRef = useRef<HTMLInputElement>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Voucher list - can be extended or loaded from localStorage
  const availableVouchers = [
    { code: 'SUMMER2024', type: 'fixed', value: 50000, minOrder: 200000, description: 'Giảm 50,000đ cho đơn từ 200,000đ' },
    { code: 'VIP10', type: 'percent', value: 10, minOrder: 100000, description: 'Giảm 10% cho đơn từ 100,000đ' },
    { code: 'WELCOME', type: 'fixed', value: 30000, minOrder: 0, description: 'Giảm 30,000đ cho khách hàng mới' },
    { code: 'FLASH20', type: 'percent', value: 20, minOrder: 500000, description: 'Giảm 20% cho đơn từ 500,000đ' },
    { code: 'NEWCUSTOMER', type: 'percent', value: 15, minOrder: 0, description: 'Giảm 15% cho khách hàng mới' },
  ];

  // Calculate totals with voucher
  const subtotal = cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
  
  // Calculate voucher discount
  let voucherDiscount = 0;
  if (appliedVoucher) {
    if (appliedVoucher.type === 'fixed') {
      voucherDiscount = appliedVoucher.value;
    } else if (appliedVoucher.type === 'percent') {
      voucherDiscount = Math.round(subtotal * appliedVoucher.value / 100);
    }
  }
  
  const discount = orderDiscount || 0;
  const totalDiscount = discount + voucherDiscount;
  const tip = tipAmount || 0;
  const total = Math.max(0, subtotal - totalDiscount + tip);
  const change = customerAmount ? Math.max(0, parseFloat(customerAmount) - total) : 0;

  // Filter products
  const filteredProducts = (products || []).filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.barcode?.includes(searchQuery) ||
                         product.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesProductType = productTypeFilter === 'all' || product.productType === productTypeFilter;
    return matchesSearch && matchesCategory && matchesProductType;
  });

  // Calculate filtered categories based on product type filter (for multi-faceted filtering)
  const filteredCategories = productTypeFilter === 'all' 
    ? categories 
    : Array.from(new Set(
        products
          .filter(p => p.productType === productTypeFilter)
          .map(p => p.category)
          .filter(Boolean)
      ));

  // Get display products based on active tab
  const displayProducts = activeTab === 'recent' 
    ? recentProducts.filter(product => {
        const matchesProductType = productTypeFilter === 'all' || product.productType === productTypeFilter;
        return matchesProductType;
      })
    : activeTab === 'favorite'
    ? favoriteProducts.filter(product => {
        const matchesProductType = productTypeFilter === 'all' || product.productType === productTypeFilter;
        return matchesProductType;
      })
    : filteredProducts;

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
    customer.phone.includes(customerSearchQuery)
  );

  // Payment methods - Expanded to 6 options with orange-purple theme
  const paymentMethods = [
    { id: 'cash' as const, icon: DollarSign, label: t('cash'), color: 'green' },
    { id: 'card' as const, icon: CreditCard, label: t('card'), color: 'blue' },
    { id: 'transfer' as const, icon: Smartphone, label: 'Chuyển khoản', color: 'purple' },
    { id: 'momo' as const, icon: QrCode, label: 'MoMo', color: 'pink' },
    { id: 'zalopay' as const, icon: Zap, label: 'ZaloPay', color: 'cyan' },
    { id: 'vnpay' as const, icon: CreditCard, label: 'VNPay', color: 'red' },
  ];

  // Quick amounts for cash payment
  
  // Quick discount percentages
  const quickDiscounts = [5, 10, 15, 20];

  // Recent transactions (last 5)
  const recentTransactions = orders.slice(-5).reverse();

  // Set default customer amount when opening checkout
  useEffect(() => {
    if (showCheckout) {
      setCustomerAmount(total.toString());
    }
  }, [showCheckout, total]);

  // Play sound
  const playSound = (type: 'success' | 'error' | 'beep') => {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'success') {
      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.3;
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    } else if (type === 'beep') {
      oscillator.frequency.value = 600;
      gainNode.gain.value = 0.2;
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.05);
    } else if (type === 'error') {
      oscillator.frequency.value = 200;
      gainNode.gain.value = 0.3;
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);
    }
  };

  // Handle barcode scan
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const product = products.find(p => p.barcode === barcodeInput.trim());
    if (product) {
      addToCart(product);
      playSound('beep');
      setBarcodeInput('');
    } else {
      playSound('error');
      alert(t('notFound'));
    }
  };

  // Handle product click - Add directly to cart
  const handleProductClick = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    addToCart(product);
    addToRecent(productId);
    playSound('beep');
    
    // Auto-focus search
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  // Add product with quantity
  const handleAddWithQuantity = () => {
    if (!selectedProductForQty) return;
    
    const product = products.find(p => p.id === selectedProductForQty);
    if (!product) return;
    
    const qty = parseInt(quickQuantity) || 1;
    for (let i = 0; i < qty; i++) {
      addToCart(product);
    }
    
    playSound('success');
    setShowQuickQuantity(false);
    setQuickQuantity('1');
    setSelectedProductForQty(null);
    
    // Auto-focus search
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  // Handle customer selection
  const handleSelectCustomer = (customer: any) => {
    setCustomerName(customer.name);
    setCustomerPhone(customer.phone);
    setSelectedCustomerId(customer.id);
    setCustomerSearchQuery(customer.name);
    setShowCustomerDropdown(false);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      playSound('error');
      toast.error(t('emptyCart') || 'Giỏ hàng trống');
      return;
    }
    
    // Check if cart has treatment products
    const hasTreatment = cart.some(item => item.productType === 'treatment');
    
    // If cart has treatment, MUST select customer first
    if (hasTreatment && !selectedCustomerId) {
      playSound('error');
      toast.error('Vui lòng chọn khách hàng để bán liệu trình');
      return;
    }
    
    // No customer selection required for regular products/services - will default to "Khách lẻ"
    setShowCheckout(true);
  };

  const handleCompletePayment = () => {
    // Validate amount for all payment methods
    const receivedAmt = parseFloat(customerAmount || '0');
    
    // Calculate change (can be negative if customer owes money)
    const calculatedChange = receivedAmt - total;
    
    // Get current user info from localStorage
    const currentUser = localStorage.getItem('salepa_username') || '';

    // Use "Khách lẻ" if no customer is selected
    const finalCustomerName = customerName || 'Khách lẻ';
    const finalCustomerPhone = customerPhone || '';

    // Create initial payment history entry
    const initialPaymentHistory = [{
      id: `PAY-${Date.now()}`,
      amount: receivedAmt,
      paymentMethod: paymentMethod,
      paidAt: new Date().toISOString(),
      paidBy: currentUser,
      note: orderNote || '',
      changeAmount: calculatedChange,
    }];

    const orderStatus = (receivedAmt >= total ? 'completed' : 'pending') as
      | 'completed'
      | 'pending';

    // Create order with receipt info
    const orderData = {
      paymentMethod,
      customerId: selectedCustomerId || undefined, // Lưu customerId để lấy thông tin chi tiết
      customerName: finalCustomerName,
      customerPhone: finalCustomerPhone,
      discount: orderDiscount, // Chỉ lưu giảm giá thủ công
      voucherCode: appliedVoucher?.code || '',
      voucherDiscount: voucherDiscount, // Lưu riêng giảm giá từ voucher
      note: orderNote,
      status: orderStatus,
      paidAt: new Date().toISOString(),
      receivedAmount: receivedAmt,
      changeAmount: calculatedChange,
      paymentHistory: initialPaymentHistory,
      invoiceStatus: issueInvoice ? 'not_issued' : undefined, // Chỉ set nếu checkbox được check
    };

    // If editing an existing order, delete the old one first
    if (editingOrderId) {
      deleteOrder(editingOrderId);
    }
    
    const createdOrder = createOrder(orderData);
    playSound('success');
    
    // Get the created order ID
    const orderId = createdOrder?.id || `ORD-${Date.now()}`;
    
    // Tạo gói liệu trình cho các sản phẩm loại treatment
    // CHỈ tạo khi có selectedCustomerId (KHÔNG tạo cho "Khách lẻ")
    if (selectedCustomerId) {
      cart.forEach(item => {
        if (item.productType === 'treatment' && item.sessions && item.sessions > 0) {
          // Build session details for the treatment package
          const treatmentProduct = products.find(p => p.id === item.id);
          const sessionDetails = treatmentProduct?.sessionDetails || [];
          const totalSessions = item.sessions || 0;
          const sessions = sessionDetails.length > 0
            ? sessionDetails.map((session) => ({
                sessionNumber: session.sessionNumber,
                sessionName: `Buổi ${session.sessionNumber}`,
                items: [
                  ...session.services.map((service) => {
                    const serviceProduct = products.find(p => p.id === service.id);
                    return {
                      productId: service.id,
                      productName: serviceProduct?.name ?? service.id,
                      productType: 'service' as const,
                      quantity: service.quantity,
                      duration: serviceProduct?.duration,
                    };
                  }),
                  ...session.products.map((product) => {
                    const productInfo = products.find(p => p.id === product.id);
                    return {
                      productId: product.id,
                      productName: productInfo?.name ?? product.id,
                      productType: 'product' as const,
                      quantity: product.quantity,
                    };
                  }),
                ],
              }))
            : Array.from({ length: totalSessions }, (_, index) => ({
                sessionNumber: index + 1,
                sessionName: `Buổi ${index + 1}`,
                items: [],
              }));
          
          createCustomerTreatmentPackage({
            customerId: selectedCustomerId,
            customerName: finalCustomerName,
            treatmentProductId: item.id,
            treatmentName: item.name,
            totalSessions,
            usedSessionNumbers: [],
            remainingSessions: totalSessions,
            sessions,
            purchaseDate: new Date().toISOString(),
            orderId: orderId,
            isActive: true,
          });
        }
      });
    }
    
    // Get the created order (last order)
    const createdOrderData = {
      id: orderId,
      items: cart,
      subtotal,
      discount: orderDiscount, // Chỉ lưu giảm giá thủ công
      voucherCode: appliedVoucher?.code || '',
      voucherDiscount: voucherDiscount, // Lưu riêng giảm giá từ voucher
      total,
      date: new Date().toISOString(),
      paymentMethod,
      customerName: finalCustomerName,
      customerPhone: finalCustomerPhone,
      note: orderNote,
      receivedAmount: receivedAmt,
      changeAmount: calculatedChange,
      paymentHistory: initialPaymentHistory,
    };

    // Show receipt
    setCompletedOrder(createdOrderData);
    setShowReceipt(true);
    
    // Show toast notification
    let toastDescription = `Tổng tiền: ${total.toLocaleString()}đ`;
    if (voucherDiscount > 0) {
      toastDescription += ` | Voucher: -${voucherDiscount.toLocaleString()}đ`;
    }
    if (calculatedChange > 0) {
      toastDescription += ` | Tiền thừa: ${calculatedChange.toLocaleString()}đ`;
    } else if (calculatedChange < 0) {
      toastDescription += ` | Còn nợ: ${Math.abs(calculatedChange).toLocaleString()}đ`;
    }
    
    toast.success(editingOrderId ? '✅ Cập nhật hóa đơn thành công!' : '✅ Thanh toán thành công!', {
      description: toastDescription,
      duration: 3000,
    });
    
    // Reset
    setShowCheckout(false);
    setCustomerName('');
    setCustomerPhone('');
    setSelectedCustomerId('');
    setCustomerSearchQuery('');
    setCustomerAmount('');
    setOrderDiscount(0);
    setTipAmount(0);
    setPaymentMethod('cash');
    setOrderNote('');
    setEditingOrderId(null); // Clear editing mode
    setVoucherCode('');
    setAppliedVoucher(null);
    setIssueInvoice(false); // Reset checkbox HĐDT
    
    // Auto-focus search
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  const handleHoldBill = () => {
    if (cart.length === 0) {
      playSound('error');
      toast.error('❌ Giỏ hàng trống', {
        description: 'Vui lòng thêm sản phẩm trước khi giữ hóa đơn',
        duration: 3000,
      });
      return;
    }
    holdBill(customerName);
    setCustomerName('');
    playSound('success');
    toast.success('✅ Đã giữ hóa đơn', {
      description: `${cart.length} sản phẩm • ${subtotal.toLocaleString()}đ`,
      duration: 3000,
    });
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    if (confirm(t('clearCart') + '?')) {
      cart.forEach(item => removeFromCart(item.id));
      setOrderDiscount(0);
      setVoucherCode('');
      setAppliedVoucher(null);
      playSound('beep');
    }
  };

  const handleQuickDiscount = (percent: number) => {
    const discountAmount = Math.round(subtotal * percent / 100);
    setOrderDiscount(discountAmount);
    playSound('beep');
  };

  // Handle apply voucher
  const handleApplyVoucher = () => {
    if (!voucherCode.trim()) {
      toast.error(t('enterVoucherCode') || 'Vui lòng nhập mã voucher');
      return;
    }

    const voucher = availableVouchers.find(v => v.code.toUpperCase() === voucherCode.trim().toUpperCase());
    
    if (!voucher) {
      playSound('error');
      toast.error(t('voucherInvalid') || 'Mã voucher không hợp lệ');
      return;
    }

    if (subtotal < voucher.minOrder) {
      playSound('error');
      toast.error(`Đơn hàng tối thiểu ${voucher.minOrder.toLocaleString()}đ để áp dụng voucher này`);
      return;
    }

    setAppliedVoucher(voucher);
    playSound('success');
    
    let discountText = voucher.type === 'fixed' 
      ? `${voucher.value.toLocaleString()}đ` 
      : `${voucher.value}%`;
    
    toast.success(t('voucherApplied') || 'Đã áp dụng voucher', {
      description: `${voucher.code} - Giảm ${discountText}`,
      duration: 3000,
    });
  };

  // Handle remove voucher
  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
    playSound('beep');
    toast.info(t('removeVoucher') || 'Đã xóa voucher');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if ((e.target as HTMLElement).tagName === 'INPUT') {
        if (e.key === 'Enter' && (e.target as HTMLInputElement).type === 'number') {
          e.preventDefault();
        }
        return;
      }

      if (e.key === 'F1') {
        e.preventDefault();
        alert('Help: F2=Search, F3=Hold, F4=Recall, F8=Barcode, F9=Checkout, F10=Clear, F12=Display');
      } else if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'F3') {
        e.preventDefault();
        handleHoldBill();
      } else if (e.key === 'F4') {
        e.preventDefault();
        setShowHeldBills(true);
      } else if (e.key === 'F8') {
        e.preventDefault();
        barcodeInputRef.current?.focus();
      } else if (e.key === 'F9') {
        e.preventDefault();
        handleCheckout();
      } else if (e.key === 'F10') {
        e.preventDefault();
        handleClearCart();
      } else if (e.key === 'F12') {
        e.preventDefault();
        setShowCustomerDisplay(!showCustomerDisplay);
      } else if (e.key === 'Escape') {
        setShowCheckout(false);
        setShowHeldBills(false);
        setShowCustomerDisplay(false);
        setShowQuickQuantity(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [cart, showCustomerDisplay]);

  // Auto-focus search on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Load editing order data
  useEffect(() => {
    if (editingOrder) {
      // Clear current cart first
      clearCart();
      
      // Save the order ID being edited
      setEditingOrderId(editingOrder.id);
      
      // Load customer info
      if (editingOrder.customerId) {
        setSelectedCustomerId(editingOrder.customerId);
      }
      setCustomerName(editingOrder.customerName || '');
      setCustomerPhone(editingOrder.customerPhone || '');
      
      // Load cart items
      const items = Array.isArray(editingOrder.items) ? editingOrder.items : Object.values(editingOrder.items || {});
      items.forEach((item: any) => {
        const product = products.find(p => p.id === item.productId || p.name === item.name);
        if (product) {
          addToCart(product);
          // Update quantity if different
          if (item.quantity && item.quantity !== 1) {
            updateCartQuantity(product.id, item.quantity);
          }
        }
      });
      
      // Load discount
      if (editingOrder.discount) {
        setOrderDiscount(editingOrder.discount);
      }
      
      // Load payment method
      if (editingOrder.paymentMethod) {
        setPaymentMethod(editingOrder.paymentMethod as PaymentMethodType);
      }
      
      // Load note
      if (editingOrder.note) {
        setOrderNote(editingOrder.note);
      }
      
      // Clear editingOrder from store after loading
      setEditingOrder(null);
      
      // Show notification
      toast.success('📝 Đã tải hóa đơn để chỉnh sửa', {
        description: `Mã HĐ: ${editingOrder.id.slice(-8).toUpperCase()}`,
        duration: 3000,
      });
      playSound('beep');
    }
  }, [editingOrder]);

  // Reset category filter when product type filter changes (for multi-faceted filtering)
  useEffect(() => {
    setSelectedCategory('all');
  }, [productTypeFilter]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Toolbar - POS Actions with Light Orange Theme */}
      <div className="bg-white border-b border-gray-200 px-4 py-2.5 shadow-sm">
        <div className="flex items-center justify-between">
          {/* Left - Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleHoldBill}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-600 hover:bg-gray-50 rounded-lg transition-all text-sm font-medium border border-gray-200"
              title="Hold Bill (F3)"
            >
              <PauseCircle className="w-4 h-4" />
              <span className="hidden lg:inline">{t('holdBill')}</span>
            </button>
            
            <button
              onClick={() => setShowHeldBills(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-600 hover:bg-gray-50 rounded-lg transition-all text-sm font-medium relative border border-gray-200"
              title="Recall Bill (F4)"
            >
              <PlayCircle className="w-4 h-4" />
              <span className="hidden lg:inline">{t('recallBill')}</span>
              {heldBills.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold text-white">
                  {heldBills.length}
                </span>
              )}
            </button>

            <button
              onClick={handleClearCart}
              disabled={cart.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-600 hover:bg-gray-50 rounded-lg transition-all text-sm font-medium disabled:opacity-50 border border-gray-200"
              title="Clear Cart (F10)"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden lg:inline">{t('clearCart')}</span>
            </button>
            
            {/* Cancel Edit Button - only show when editing */}
            {editingOrderId && (
              <button
                onClick={() => {
                  handleClearCart();
                  setEditingOrderId(null);
                  toast.info('Đã hủy chỉnh sửa hóa đơn');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all text-sm font-medium border border-red-200"
                title="Hủy sửa hóa đơn"
              >
                <X className="w-4 h-4" />
                <span className="hidden lg:inline">Hủy sửa</span>
              </button>
            )}

            <button
              onClick={() => setShowRecentTransactions(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-600 hover:bg-gray-50 rounded-lg transition-all text-sm font-medium border border-gray-200"
              title="Recent Transactions"
            >
              <History className="w-4 h-4" />
              <span className="hidden lg:inline">{t('recent')}</span>
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-sm font-medium border ${
                soundEnabled ? 'bg-gray-100 text-gray-700 border-gray-300' : 'bg-white text-gray-400 border-gray-200'
              }`}
              title="Toggle Sound"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            
            {/* Editing Mode Indicator */}
            {editingOrderId && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border-2 border-blue-500 rounded-lg animate-pulse">
                <Edit2 className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">Đang sửa HĐ</span>
              </div>
            )}
          </div>

          {/* Center - Barcode Scanner */}
          <form onSubmit={handleBarcodeSubmit} className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              
            </div>
          </form>

          {/* Right - Customer Display & Print */}
          
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Tìm kiếm theo tên, mã vạch"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-orange-500 focus:bg-white transition-all text-base"
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
              {[
                { id: 'all' as const, icon: Grid3x3, label: t('all') },
                { id: 'recent' as const, icon: Clock, label: t('recent') },
                { id: 'favorite' as const, icon: Star, label: t('favorites') },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-gray-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* View Toggle */}
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-gray-200 text-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 border-l border-gray-200 ${viewMode === 'list' ? 'bg-gray-200 text-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            {/* Stats */}
            
          </div>
        </div>

        {/* Product Type Filter & Categories */}
        <div className="px-4 pb-3">
          {/* Combined Filter Row - Product Type + Categories on same line */}
          <div className="flex gap-3 items-center overflow-x-auto scrollbar-thin">
            {/* Product Type Filter */}
            {[
              { id: 'all' as const, icon: Grid, label: t('allTypes') || 'Tất cả loại', color: 'gray' },
              { id: 'product' as const, icon: Package, label: t('product') || 'Sản phẩm', color: 'green' },
              { id: 'service' as const, icon: Scissors, label: t('service') || 'Dịch vụ', color: 'blue' },
              { id: 'treatment' as const, icon: Sparkles, label: t('treatment') || 'Liệu trình', color: 'purple' },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setProductTypeFilter(filter.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  productTypeFilter === filter.id
                    ? 'bg-gray-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <filter.icon className="w-4 h-4" />
                {filter.label}
              </button>
            ))}

            {/* Divider */}
            {activeTab === 'all' && filteredCategories.length > 0 && (
              <div className="h-8 w-px bg-gray-300 flex-shrink-0" />
            )}

            {/* Category Filter - Multi-faceted filtering with text-only display */}
            {activeTab === 'all' && (
              <>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-gray-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('allCategories') || t('all')}
                </button>
                {filteredCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                      selectedCategory === category
                        ? 'bg-gray-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Products */}
        <div className="flex-1 overflow-y-auto p-3">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
              {displayProducts.map((product) => {
                const categoryImg = product.image || getCategoryImage(product.category, product.productType);
                return (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product.id)}
                    className="group bg-white rounded-xl p-3 cursor-pointer hover:shadow-2xl transition-all border-2 border-gray-200 hover:border-orange-500 relative"
                  >
                    {/* Product Image */}
                    {categoryImg ? (
                      <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-3 relative">
                        <img 
                          src={categoryImg} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {/* Product Type Badge */}
                        {product.productType && (
                          <div className={`absolute top-2 left-2 px-2 py-1 rounded-md text-xs font-bold shadow-md ${
                            product.productType === 'product' ? 'bg-green-500 text-white' :
                            product.productType === 'service' ? 'bg-blue-500 text-white' :
                            'bg-purple-500 text-white'
                          }`}>
                            {product.productType === 'product' ? ' SP' :
                             product.productType === 'service' ? ' DV' : 
                             ' LT'}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-gray-200 transition-all">
                        <ShoppingBag className="w-12 h-12 text-gray-400" />
                      </div>
                    )}

                    {/* Favorite */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(product.id);
                        playSound('beep');
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-lg hover:bg-white transition-all shadow-sm"
                    >
                      <Star className={`w-4 h-4 ${favoriteProducts.some(p => p.id === product.id) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                    </button>

                    {/* Product Info */}
                    <div>
                      <h3 className="text-gray-900 text-base line-clamp-2 leading-snug mb-2 transition-colors min-h-[2.5rem] font-bold">
                        {product.name}
                      </h3>
                      
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xl font-bold text-gray-900">
                          {(product.price || 0).toLocaleString()}
                        </div>
                        {product.productType !== 'service' && product.productType !== 'treatment' && (
                          <div className={`text-xs px-2 py-1 rounded-md font-medium ${
                            (product.stock || 0) > 10 
                              ? 'bg-green-100 text-green-700' 
                              : (product.stock || 0) > 0 
                              ? 'bg-yellow-100 text-yellow-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {product.stock || 0}
                          </div>
                        )}
                      </div>
                      {/* Duration or Sessions info */}
                      {product.duration && (
                        <div className="text-xs text-gray-500 mt-1">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {product.duration} phút
                        </div>
                      )}
                      {product.sessions && (
                        <div className="text-xs text-purple-600 mt-1 font-medium">
                          <Sparkles className="w-3 h-3 inline mr-1" />
                          {product.sessions} buổi
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {displayProducts.map((product) => {
                const categoryImg = product.image || getCategoryImage(product.category, product.productType);
                return (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product.id)}
                    className="group bg-white rounded-xl p-3 cursor-pointer hover:shadow-lg transition-all border-2 border-gray-200 hover:border-orange-500 flex items-center gap-3"
                  >
                    {categoryImg ? (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                        <img 
                          src={categoryImg} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ShoppingBag className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-base truncate">
                        {product.name}
                      </h3>
                      <div className="text-sm text-gray-500">{product.category}</div>
                      {product.duration && (
                        <div className="text-xs text-gray-400">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {product.duration} phút
                        </div>
                      )}
                      {product.sessions && (
                        <div className="text-xs text-gray-600 font-medium">
                          <Sparkles className="w-3 h-3 inline mr-1" />
                          {product.sessions} buổi
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">
                        {product.price.toLocaleString()}đ
                      </div>
                      {product.productType !== 'service' && product.productType !== 'treatment' && (
                        <div className="text-sm text-gray-500">{product.stock} {t('inStock')}</div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(product.id);
                        playSound('beep');
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                    >
                      <Star className={`w-5 h-5 ${favoriteProducts.some(p => p.id === product.id) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {displayProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ShoppingBag className="w-20 h-20 mb-3" />
              <p className="text-lg">{t('noProducts')}</p>
            </div>
          )}
        </div>

        {/* Right Side - Cart - INCREASED WIDTH TO 600PX */}
        <div className="w-[600px] bg-white border-l border-gray-200 flex flex-col shadow-lg">
          {/* Cart Header - Light Orange Theme */}
          <div className="bg-white border-b border-gray-200 p-3">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h2 className="text-lg font-bold text-gray-700">{t('currentOrder')}</h2>
              <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-lg">
                <span className="text-xl font-bold text-[#FE7410]">{cart.length}</span>
                <span className="text-xs text-gray-600">{t('products')}</span>
              </div>
            </div>
            
            {/* Customer Input with Search & Add Quick Button */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <input
                    type="text"
                    placeholder={t('searchCustomer') || 'Tìm khách hàng (không bắt buộc)...'}
                    value={customerSearchQuery}
                    onChange={(e) => {
                      setCustomerSearchQuery(e.target.value);
                      setShowCustomerDropdown(true);
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    className="w-full pl-10 pr-3 py-2 rounded-lg bg-white border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none text-sm"
                  />
                  
                  {/* Customer Dropdown */}
                  {showCustomerDropdown && customerSearchQuery && filteredCustomers.length > 0 && (
                    <>
                      <div 
                        className="fixed inset-0 z-20" 
                        onClick={() => setShowCustomerDropdown(false)}
                      />
                      <div className="absolute top-full left-0 right-12 mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto z-30">
                        {filteredCustomers.slice(0, 10).map(customer => (
                          <button
                            key={customer.id}
                            onClick={() => handleSelectCustomer(customer)}
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">{customer.name}</p>
                                <p className="text-xs text-gray-500">{customer.phone}</p>
                              </div>
                              {selectedCustomerId === customer.id && (
                                <Check className="w-4 h-4 text-[#FE7410]" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setShowAddCustomerModal(true)}
                  className="p-2 text-white rounded-lg transition-all"
                  style={{ backgroundColor: '#FE7410' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E56809'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FE7410'}
                  title={t('addNew') || 'Thêm khách hàng mới'}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              
              {/* Selected Customer Display or Default "Khách lẻ" */}
              {selectedCustomerId && customerName ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: '#FFEDD5' }}>
                  <User className="w-4 h-4" style={{ color: '#FE7410' }} />
                  <span className="text-sm font-medium" style={{ color: '#92400E' }}>{customerName}</span>
                  {customerPhone && (
                    <span className="text-xs" style={{ color: '#FE7410' }}>• {customerPhone}</span>
                  )}
                  <button
                    onClick={() => {
                      setSelectedCustomerId('');
                      setCustomerName('');
                      setCustomerPhone('');
                      setCustomerSearchQuery('');
                    }}
                    className="ml-auto p-0.5 rounded hover:bg-black/10"
                  >
                    <X className="w-3.5 h-3.5" style={{ color: '#FE7410' }} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500 italic">Khách lẻ</span>
                </div>
              )}
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <ShoppingBag className="w-16 h-16 mb-3" />
                <p className="text-base">{t('emptyCart')}</p>
                <p className="text-sm mt-2 text-center">{t('addProductsToStart')}</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedCartItem(item.id)}
                  className={`bg-gray-50 rounded-xl p-3 border-2 transition-all cursor-pointer ${
                    selectedCartItem === item.id ? 'bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={selectedCartItem === item.id ? { borderColor: '#FE7410', backgroundColor: '#FFF7ED' } : {}}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FFEDD5' }}>
                      <ShoppingBag className="w-6 h-6" style={{ color: '#FE7410' }} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-base line-clamp-1">{item.name}</h3>
                      <div className="text-lg font-bold mt-0.5" style={{ color: '#FE7410' }}>
                        {(item.price || 0).toLocaleString()}đ
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromCart(item.id);
                        playSound('beep');
                      }}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateCartQuantity(item.id, Math.max(1, item.quantity - 1));
                          playSound('beep');
                        }}
                        className="w-8 h-8 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center hover:border-orange-500 hover:bg-orange-50 transition-all"
                      >
                        <Minus className="w-4 h-4 text-gray-700" />
                      </button>
                      
                      <div className="w-14 h-8 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                        <span className="text-base font-bold text-gray-900">{item.quantity || 0}</span>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateCartQuantity(item.id, item.quantity + 1);
                          playSound('beep');
                        }}
                        className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center hover:shadow-lg transition-all"
                      >
                        <Plus className="w-4 h-4 text-white" />
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-gray-500">{t('subtotal')}</div>
                      <div className="text-base font-bold text-gray-900">
                        {((item.price || 0) * (item.quantity || 0)).toLocaleString()}đ
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary & Checkout */}
          <div className="border-t border-gray-200 p-3 space-y-3 bg-gray-50">
            {/* Discount Section - Quick buttons + Input in one row */}
            {/* Discount & Voucher Section */}
            <div className="space-y-2">
              {/* Discount Row */}
              <div className="flex items-center gap-2">
                {/* Quick Discount Buttons */}
                {quickDiscounts.map((percent) => (
                  <button
                    key={percent}
                    onClick={() => handleQuickDiscount(percent)}
                    className="px-2.5 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-300 transition-all whitespace-nowrap"
                  >
                    -{percent}%
                  </button>
                ))}
                
                {/* Discount Input */}
                <div className="flex items-center gap-2 bg-white border-2 border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-0">
                  <Percent className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <input
                    type="number"
                    placeholder={t('discount')}
                    value={orderDiscount || ''}
                    onChange={(e) => setOrderDiscount(parseFloat(e.target.value) || 0)}
                    className="flex-1 outline-none text-base min-w-0"
                  />
                  <span className="text-sm text-gray-500">đ</span>
                </div>
              </div>

              {/* Voucher Row */}
              <div className="flex items-center gap-2">
                {appliedVoucher ? (
                  // Applied voucher display
                  <div className="flex items-center gap-2 bg-green-50 border-2 border-green-500 rounded-lg px-3 py-2 flex-1">
                    <Gift className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-green-700">{appliedVoucher.code}</p>
                      <p className="text-xs text-green-600 truncate">{appliedVoucher.description}</p>
                    </div>
                    <button
                      onClick={handleRemoveVoucher}
                      className="p-1 hover:bg-green-100 rounded transition-all"
                      title={t('removeVoucher')}
                    >
                      <X className="w-4 h-4 text-green-700" />
                    </button>
                  </div>
                ) : (
                  // Voucher input
                  <>
                    <div className="flex items-center gap-2 bg-white border-2 border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-0">
                      <Tag className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <input
                        type="text"
                        placeholder={t('enterVoucherCode')}
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleApplyVoucher();
                          }
                        }}
                        className="flex-1 outline-none text-base min-w-0 uppercase"
                      />
                    </div>
                    <button
                      onClick={handleApplyVoucher}
                      disabled={!voucherCode.trim()}
                      className="px-4 py-2 bg-[#FE7410] text-white rounded-lg font-semibold hover:bg-[#E56809] transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {t('applyVoucher')}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Tip Input - Only show if enabled in settings */}
            {settings.enableTip && (
              <div className="flex items-center gap-2 bg-white border-2 border-gray-200 rounded-lg px-3 py-2">
                <Gift className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="number"
                  placeholder={t('tip') || 'Tip'}
                  value={tipAmount || ''}
                  onChange={(e) => setTipAmount(parseFloat(e.target.value) || 0)}
                  className="flex-1 outline-none text-base min-w-0"
                />
                <span className="text-sm text-gray-500">đ</span>
              </div>
            )}

            {/* Totals - Simplified */}
            <div className="bg-white rounded-xl p-3 border-2 border-gray-200">
              <div className="flex justify-between text-sm text-gray-600 mb-1.5">
                <span>{t('subtotal')}:</span>
                <span className="font-semibold text-base">{subtotal.toLocaleString()}đ</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-red-600 mb-1.5">
                  <span>{t('discount')}:</span>
                  <span className="font-semibold text-base">-{discount.toLocaleString()}đ</span>
                </div>
              )}
              {voucherDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600 mb-1.5">
                  <span>{t('voucherDiscount')}:</span>
                  <span className="font-semibold text-base">-{voucherDiscount.toLocaleString()}đ</span>
                </div>
              )}
              {tip > 0 && (
                <div className="flex justify-between text-sm text-green-600 mb-1.5">
                  <span>{t('tip') || 'Tip'}:</span>
                  <span className="font-semibold text-base">+{tip.toLocaleString()}đ</span>
                </div>
              )}
              <div className="border-t-2 border-gray-200 pt-2 flex justify-between items-center">
                <span className="text-base font-bold text-gray-900">{t('total')}:</span>
                <span className="text-2xl font-bold text-[#FE7410]">
                  {total.toLocaleString()}đ
                </span>
              </div>
            </div>

            {/* Checkbox Phát hành HĐDT */}
            <div className="bg-white rounded-xl p-3 border-2 border-gray-200">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="issueInvoice"
                  checked={issueInvoice}
                  onChange={(e) => setIssueInvoice(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#FE7410] focus:ring-[#FE7410] focus:ring-2 cursor-pointer"
                />
                <label htmlFor="issueInvoice" className="text-sm font-semibold text-gray-700 cursor-pointer select-none">
                  {t('issueInvoice') || 'Phát hành HĐDT'}
                </label>
              </div>
              {issueInvoice && !selectedCustomerId && (
                <div className="mt-2 flex items-start gap-2 p-2 bg-red-50 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600">
                    {t('invoiceRequiresCustomer') || 'Phát hành HĐDT yêu cầu chọn khách hàng cụ thể'}
                  </p>
                </div>
              )}
            </div>

            {/* Checkout Button - Orange Highlight */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || (issueInvoice && !selectedCustomerId)}
              className="w-full bg-[#FE7410] text-white py-3.5 rounded-xl hover:bg-[#E56809] hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg font-bold"
            >
              <Zap className="w-5 h-5" />
              {t('checkout')} 
            </button>
          </div>
        </div>
      </div>

      {/* Quick Quantity Modal */}
      {showQuickQuantity && selectedProductForQty && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="bg-gray-100 border-b-2 border-gray-200 p-4 rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-700">{t('enterAmount') || 'Enter Quantity'}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center">
                <p className="text-gray-600 mb-2">
                  {products.find(p => p.id === selectedProductForQty)?.name}
                </p>
                <input
                  type="number"
                  value={quickQuantity}
                  onChange={(e) => setQuickQuantity(e.target.value)}
                  className="w-full text-center text-4xl font-bold border-2 border-gray-300 rounded-xl py-4 focus:outline-none focus:border-gray-500"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddWithQuantity();
                    }
                  }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => setQuickQuantity(prev => prev === '1' ? num.toString() : prev + num.toString())}
                    className="p-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-2xl font-bold"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={() => setQuickQuantity('1')}
                  className="p-4 bg-red-100 hover:bg-red-200 rounded-lg text-xl font-bold text-red-600"
                >
                  C
                </button>
                <button
                  onClick={() => setQuickQuantity(prev => prev === '1' ? '0' : prev + '0')}
                  className="p-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-2xl font-bold"
                >
                  0
                </button>
                <button
                  onClick={() => setQuickQuantity(prev => prev.length > 1 ? prev.slice(0, -1) : '1')}
                  className="p-4 bg-yellow-100 hover:bg-yellow-200 rounded-lg text-xl font-bold text-yellow-700"
                >
                  ←
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowQuickQuantity(false);
                    setQuickQuantity('1');
                    setSelectedProductForQty(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-300"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleAddWithQuantity}
                  className="flex-1 bg-[#FE7410] text-white py-3 rounded-lg font-bold hover:bg-[#E56809] hover:shadow-lg"
                >
                  {t('add')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions Modal */}
      {showRecentTransactions && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="bg-gray-100 border-b-2 border-gray-200 p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-700">{t('recentOrders')} ({recentTransactions.length})</h2>
              <button onClick={() => setShowRecentTransactions(false)} className="p-1 hover:bg-gray-200 rounded-lg text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
              {recentTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Receipt className="w-16 h-16 mx-auto mb-3" />
                  <p>{t('noOrders')}</p>
                </div>
              ) : (
                recentTransactions.map((order) => (
                  <div key={order.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-400 transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-bold text-gray-900">{order.customerName || t('walkInCustomer')}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(order.date).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">
                          {order.total.toLocaleString()}đ
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
                          order.paymentMethod === 'cash' ? 'bg-green-100 text-green-700' :
                          order.paymentMethod === 'card' ? 'bg-blue-100 text-blue-700' :
                          order.paymentMethod === 'transfer' ? 'bg-purple-100 text-purple-700' :
                          order.paymentMethod === 'momo' ? 'bg-pink-100 text-pink-700' :
                          order.paymentMethod === 'zalopay' ? 'bg-cyan-100 text-cyan-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {order.paymentMethod}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {order.items.length} {t('items')} • {order.items.reduce((sum, item) => sum + item.quantity, 0)} {t('products')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Held Bills Modal */}
      {showHeldBills && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="border-b-2 p-4 flex justify-between items-center" style={{ backgroundColor: '#FFF7ED', borderColor: '#FE7410' }}>
              <h2 className="text-xl font-bold" style={{ color: '#FE7410' }}>{t('savedBills')} ({heldBills.length})</h2>
              <button onClick={() => setShowHeldBills(false)} className="p-1 rounded-lg transition-colors" style={{ color: '#FE7410' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFEDD5'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
              {heldBills.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <PauseCircle className="w-16 h-16 mx-auto mb-3" />
                  <p>{t('noBillsHeld')}</p>
                </div>
              ) : (
                heldBills.map((bill) => (
                  <div key={bill.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 transition-all" style={{ borderColor: bill.id === bill.id ? '#FED7AA' : '#E5E7EB' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#FE7410'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-bold text-gray-900">{bill.customerName || t('walkInCustomer')}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(bill.heldAt).toLocaleString()} • {bill.items.length} {t('items')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold" style={{ color: '#FE7410' }}>
                          {bill.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}đ
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          recallBill(bill.id);
                          setShowHeldBills(false);
                          playSound('success');
                          toast.success('✅ Đã gọi lại hóa đơn', {
                            description: `${bill.items.length} sản phẩm • ${bill.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}đ`,
                            duration: 3000,
                          });
                        }}
                        className="flex-1 text-white py-2 rounded-lg font-medium transition-all shadow-lg"
                        style={{ backgroundColor: '#FE7410' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E56809'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FE7410'}
                      >
                        {t('loadBill')}
                      </button>
                      <button
                        onClick={() => setDeletingBillId(bill.id)}
                        className="px-4 bg-red-100 text-red-600 py-2 rounded-lg font-medium hover:bg-red-200 transition-all"
                      >
                        {t('delete')}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Bill Confirmation Modal */}
      {deletingBillId && (() => {
        const billToDelete = heldBills.find(b => b.id === deletingBillId);
        if (!billToDelete) return null;
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
              {/* Header with Icon */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full border-2 border-red-500 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Xóa hóa đơn</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Bạn có chắc chắn muốn xóa hóa đơn này không?<br />
                    Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setDeletingBillId(null)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    deleteHeldBill(deletingBillId);
                    setDeletingBillId(null);
                    playSound('beep');
                    toast.success('✅ Đã xóa hóa đơn', {
                      description: 'Hóa đơn đã được xóa khỏi danh sách',
                      duration: 3000,
                    });
                  }}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Customer Display Modal */}
      {showCustomerDisplay && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="rounded-3xl w-full max-w-md shadow-2xl overflow-hidden" style={{ backgroundColor: '#FE7410' }}>
            <div className="p-6 text-white text-center">
              <button 
                onClick={() => setShowCustomerDisplay(false)} 
                className="absolute top-4 right-4 p-2 rounded-lg transition-colors hover:bg-black/10"
              >
                <X className="w-5 h-5" />
              </button>
              
              <Monitor className="w-16 h-16 mx-auto mb-4 opacity-80" />
              <h2 className="text-3xl font-bold mb-2">{t('customerDisplay')}</h2>
              <p className="mb-8" style={{ color: '#FFEDD5' }}>{t('currentOrder')}</p>

              {cart.length === 0 ? (
                <div className="py-12">
                  <ShoppingBag className="w-20 h-20 mx-auto mb-4 opacity-50" />
                  <p className="text-xl" style={{ color: '#FFEDD5' }}>{t('welcomeCustomer')}</p>
                </div>
              ) : (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-4">
                  {cart.slice(-3).map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-left">
                      <div className="flex-1">
                        <div className="font-semibold text-lg">{item.name}</div>
                        <div className="text-sm" style={{ color: '#FFEDD5' }}>{item.quantity} × {item.price.toLocaleString()}đ</div>
                      </div>
                      <div className="text-2xl font-bold">
                        {(item.price * item.quantity).toLocaleString()}đ
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t-2 border-white/30 pt-4 flex justify-between items-center">
                    <div className="text-2xl font-bold">{t('total')}:</div>
                    <div className="text-5xl font-bold">
                      {total.toLocaleString()}đ
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal with Customer Selection */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="border-b-2 p-6 rounded-t-2xl flex-shrink-0" style={{ backgroundColor: '#FFF7ED', borderColor: '#FE7410' }}>
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: '#FE7410' }}>{t('payment')}</h2>
                  <p className="text-sm mt-1" style={{ color: '#E56809' }}>{t('completeOrder')}</p>
                </div>
                <button onClick={() => setShowCheckout(false)} className="p-2 rounded-lg transition-all" style={{ color: '#FE7410' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFEDD5'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Payment Methods - 6 options */}
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-3">
                    {t('paymentMethod')}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => {
                          setPaymentMethod(method.id);
                          playSound('beep');
                        }}
                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                          paymentMethod === method.id
                            ? 'shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        style={paymentMethod === method.id ? { borderColor: '#FE7410', backgroundColor: '#FFF7ED' } : {}}
                      >
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: paymentMethod === method.id ? '#FE7410' : '#E5E7EB' }}
                        >
                          <method.icon className={`w-6 h-6 ${paymentMethod === method.id ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <span className="font-semibold text-gray-900 text-sm text-center">{method.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* QR Payment - Card, Transfer, MoMo, ZaloPay, VNPay */}
                {paymentMethod === 'card' && (
                  <div>
                    <CardPaymentForm
                      amount={total}
                      onSuccess={() => handleCompletePayment()}
                      onCancel={() => setPaymentMethod('cash')}
                    />
                  </div>
                )}

                {(paymentMethod === 'transfer' || paymentMethod === 'momo' || paymentMethod === 'zalopay' || paymentMethod === 'vnpay') && (
                  <div>
                    <QRPaymentForm
                      amount={total}
                      orderCode={`POS-${Date.now()}`}
                      paymentType={paymentMethod}
                      onSuccess={() => handleCompletePayment()}
                      onCancel={() => setPaymentMethod('cash')}
                    />
                  </div>
                )}

                {/* Customer Amount - Always show for all payment methods */}
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-3">
                     {t('customerAmount') || 'Tiền khách đưa'}
                  </label>
                  <input
                    type="number"
                    value={customerAmount}
                    onChange={(e) => setCustomerAmount(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none text-xl font-semibold"
                    onFocus={(e) => e.currentTarget.style.borderColor = '#FE7410'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#D1D5DB'}
                    placeholder="0"
                  />

                  {/* Change or Remaining */}
                  {customerAmount && change > 0 && (
                    <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-semibold text-base">{t('change') || 'Tiền thừa trả khách'}:</span>
                        <span className="text-3xl font-bold text-green-600">
                          {change.toLocaleString()}đ
                        </span>
                      </div>
                    </div>
                  )}
                  {customerAmount && parseFloat(customerAmount) < total && (
                    <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                      <div className="flex justify-between items-center">
                        <span className="text-red-700 font-semibold text-base">Còn thiếu:</span>
                        <span className="text-3xl font-bold text-red-600">
                          {(total - parseFloat(customerAmount)).toLocaleString()}đ
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div className="rounded-xl p-5 border-2" style={{ backgroundColor: '#FFF7ED', borderColor: '#FE7410' }}>
                  <div className="space-y-3">
                    <div className="flex justify-between text-base text-gray-700">
                      <span>{t('subtotal')}:</span>
                      <span className="font-semibold text-lg">{subtotal.toLocaleString()}đ</span>
                    </div>
                    {orderDiscount > 0 && (
                      <div className="flex justify-between text-base text-red-600">
                        <span>{t('discount')}:</span>
                        <span className="font-semibold text-lg">-{orderDiscount.toLocaleString()}đ</span>
                      </div>
                    )}
                    {appliedVoucher && voucherDiscount > 0 && (
                      <div className="flex justify-between text-base text-green-600">
                        <span>{t('voucher') || 'Voucher'} ({appliedVoucher.code}):</span>
                        <span className="font-semibold text-lg">-{voucherDiscount.toLocaleString()}đ</span>
                      </div>
                    )}
                    {tip > 0 && (
                      <div className="flex justify-between text-base text-green-600">
                        <span>{t('tip') || 'Tip'}:</span>
                        <span className="font-semibold text-lg">+{tip.toLocaleString()}đ</span>
                      </div>
                    )}
                    <div className="border-t-2 pt-3 flex justify-between items-center" style={{ borderColor: '#FE7410' }}>
                      <span className="text-xl font-bold text-gray-900">{t('total')}:</span>
                      <span className="text-3xl font-bold" style={{ color: '#FE7410' }}>
                        {total.toLocaleString()}đ
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Note */}
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-3">
                    {t('note') || 'Ghi chú'}
                  </label>
                  <textarea
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    placeholder={t('addNoteOptional') || 'Thêm ghi chú cho hóa đơn'}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none text-base resize-none"
                    onFocus={(e) => e.currentTarget.style.borderColor = '#FE7410'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#D1D5DB'}
                  />
                </div>
              </div>
            </div>

            {/* Footer with Complete Button */}
            <div className="border-t-2 border-gray-200 p-6 flex-shrink-0">
              <button
                onClick={handleCompletePayment}
                disabled={!customerAmount || parseFloat(customerAmount) === 0}
                className="w-full text-white py-4 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-3 text-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                style={{ backgroundColor: '#FE7410' }}
              >
                <Check className="w-6 h-6" />
                {t('completePayment') || 'Hoàn thành'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal - Using Full CustomerForm */}
      {showAddCustomerModal && (
        <CustomerForm
          customer={null}
          onClose={() => {
            // Find the most recently added customer and auto-select them
            const sortedCustomers = [...customers].sort((a, b) => {
              const dateA = new Date(a.createdAt || 0).getTime();
              const dateB = new Date(b.createdAt || 0).getTime();
              return dateB - dateA;
            });
            
            if (sortedCustomers.length > 0) {
              const latestCustomer = sortedCustomers[0];
              setSelectedCustomerId(latestCustomer.id);
              setCustomerName(latestCustomer.name);
              setCustomerPhone(latestCustomer.phone);
              setCustomerSearchQuery(latestCustomer.name);
              playSound('success');
            }
            
            setShowAddCustomerModal(false);
          }}
        />
      )}

      {/* Receipt Modal */}
      {showReceipt && completedOrder && (
        <ReceiptModal
          order={completedOrder}
          onClose={() => {
            setShowReceipt(false);
            setCompletedOrder(null);
          }}
        />
      )}
    </div>
  );
}

export default ModernSalesScreen;