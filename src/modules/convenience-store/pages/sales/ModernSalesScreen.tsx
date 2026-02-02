import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../../../lib/convenience-store-lib/store';
import { useTranslation } from '../../../../lib/convenience-store-lib/useTranslation';
import { toast } from 'sonner';
import { 
  Search, Plus, Minus, Trash2, X, DollarSign, Printer, User, 
  Clock, CreditCard, Smartphone, QrCode, Zap, Grid3x3, List,
  Tag, Star, TrendingUp, ShoppingBag, Calculator, Percent,
  Menu, ChevronRight, Check, AlertCircle, Barcode, Save,
  RotateCcw, FileText, Users, PauseCircle, PlayCircle,
  Settings, History, Grid, Monitor, Keyboard, Edit3, Edit2,
  MessageSquare, Receipt, Eye, Volume2, Bell, Gift, SplitSquare,
  Package, Scissors, Sparkles, UserPlus
} from 'lucide-react';
import { CardPaymentForm, type CardData } from '../../components/sales/CardPaymentForm';
import { QRPaymentForm, type QRPaymentData } from '../../components/sales/QRPaymentForm';
import { Receipt as ReceiptModal } from '../../components/sales/Receipt';
import { CustomerForm } from '../../components/customers/CustomerForm';

type PaymentMethodType = 'cash' | 'card' | 'transfer' | 'momo' | 'zalopay' | 'vnpay';
type ProductTypeFilter = 'all' | 'product' | 'service' | 'treatment';

// Helper function to get category images from Unsplash
const getCategoryImage = (category: string, productType?: string): string => {
  // Category images for various product types
  const categoryMap: Record<string, string> = {
    // Spa & Beauty Services (original categories)
    'Massage': 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Chăm sóc da': 'https://images.unsplash.com/photo-1684014286330-ddbeb4a40c92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Nail': 'https://images.unsplash.com/photo-1599458348985-236f9b110da1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Waxing': 'https://images.unsplash.com/photo-1582498674105-ad104fcc5784?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Liệu trình': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    
    // Grocery & Convenience Store Categories
    'Tạp hóa': 'https://images.unsplash.com/photo-1651488201726-bbb9577778ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Sản phẩm': 'https://images.unsplash.com/photo-1651488201726-bbb9577778ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Đồ ăn vặt': 'https://images.unsplash.com/photo-1748765968965-7e18d4f7192b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Snack': 'https://images.unsplash.com/photo-1748765968965-7e18d4f7192b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Đồ uống': 'https://images.unsplash.com/photo-1588693474799-f1ab19670f5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Nước giải khát': 'https://images.unsplash.com/photo-1588693474799-f1ab19670f5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Rau củ': 'https://images.unsplash.com/photo-1748342319942-223b99937d4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Rau củ quả': 'https://images.unsplash.com/photo-1748342319942-223b99937d4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Sữa': 'https://images.unsplash.com/photo-1635714293982-65445548ac42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Sản phẩm sữa': 'https://images.unsplash.com/photo-1635714293982-65445548ac42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Mì ăn liền': 'https://images.unsplash.com/photo-1628919311414-1ee37e9ed8ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Mì gói': 'https://images.unsplash.com/photo-1628919311414-1ee37e9ed8ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Gạo': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Ngũ cốc': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Cà phê': 'https://images.unsplash.com/photo-1606265771707-c052d0e14656?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Trà': 'https://images.unsplash.com/photo-1606265771707-c052d0e14656?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Kẹo': 'https://images.unsplash.com/photo-1657641908545-592c2a8e3b79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Bánh kẹo': 'https://images.unsplash.com/photo-1657641908545-592c2a8e3b79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Bánh mì': 'https://images.unsplash.com/photo-1555932450-31a8aec2adf1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Bánh': 'https://images.unsplash.com/photo-1555932450-31a8aec2adf1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Chăm sóc cá nhân': 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Vệ sinh': 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Đồ gia dụng': 'https://images.unsplash.com/photo-1759846866217-e627e4478f82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Vệ sinh nhà cửa': 'https://images.unsplash.com/photo-1759846866217-e627e4478f82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Đồ đông lạnh': 'https://images.unsplash.com/photo-1758221617148-7d019e8e3388?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Kem': 'https://images.unsplash.com/photo-1758221617148-7d019e8e3388?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Đồ hộp': 'https://images.unsplash.com/photo-1576192350050-d9e08ee1f122?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Hoa quả': 'https://images.unsplash.com/photo-1636128774004-68374b26ed1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Trái cây': 'https://images.unsplash.com/photo-1636128774004-68374b26ed1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Dầu ăn': 'https://images.unsplash.com/photo-1757801333175-65177bd6969c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Gia vị': 'https://images.unsplash.com/photo-1757801333175-65177bd6969c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Thuốc lá': 'https://images.unsplash.com/photo-1610512462613-b95e1eae0ad6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Văn phòng phẩm': 'https://images.unsplash.com/photo-1599652300924-c8341cb74d0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Dụng cụ học tập': 'https://images.unsplash.com/photo-1599652300924-c8341cb74d0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Mỹ phẩm': 'https://images.unsplash.com/photo-1613255348289-1407e4f2f980?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Làm đẹp': 'https://images.unsplash.com/photo-1613255348289-1407e4f2f980?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Thuốc': 'https://images.unsplash.com/photo-1646392206581-2527b1cae5cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    'Y tế': 'https://images.unsplash.com/photo-1646392206581-2527b1cae5cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
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
    updateOrder,
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
    sidebarCollapsed,
    toggleSidebar,
    addToRecent,
    customers,
    addCustomer,
    updateCustomer,
    customerTypes,
    createCustomerTreatmentPackage,
    editingOrder,
    setEditingOrder,
    clearCart
  } = useStore();
  const { t } = useTranslation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCheckout, setShowCheckout] = useState(false);
  const [showHeldBills, setShowHeldBills] = useState(false);
  const [showCustomerDisplay, setShowCustomerDisplay] = useState(false);
  const [showRecentTransactions, setShowRecentTransactions] = useState(false);
  const [showQuickQuantity, setShowQuickQuantity] = useState(false);
  const [showItemNote, setShowItemNote] = useState(false);
  const [showPriceOverride, setShowPriceOverride] = useState(false);
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
  const [itemNote, setItemNote] = useState('');
  const [priceOverride, setPriceOverride] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [tipAmount, setTipAmount] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null); // Track if editing an existing order
  const [showMobileCart, setShowMobileCart] = useState(false); // Mobile cart modal
  const [voucherCode, setVoucherCode] = useState(''); // Voucher code
  const searchInputRef = useRef<HTMLInputElement>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
  const discount = orderDiscount || 0;
  const tip = tipAmount || 0;
  const total = Math.max(0, subtotal - discount + tip);
  const change = customerAmount ? Math.max(0, parseFloat(customerAmount) - total) : 0;

  // Filter products - Only show ACTIVE products (status = 1)
  const filteredProducts = (products || []).filter(product => {
    if (!product) return false;
    const matchesSearch = (product.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
                         (product.barcode || '').includes(searchQuery || '') ||
                         (product.category || '').toLowerCase().includes((searchQuery || '').toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const isActive = product.status === 1; // Only active products
    return matchesSearch && matchesCategory && isActive;
  });

  // All categories available
  const filteredCategories = categories;

  // Get display products based on active tab
  // Filter recent and favorite products with search query and ensure null safety
  const displayProducts = activeTab === 'recent' 
    ? (recentProducts || []).filter(product => {
        if (!product) return false;
        const matchesSearch = (product.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
                             (product.barcode || '').includes(searchQuery || '') ||
                             (product.category || '').toLowerCase().includes((searchQuery || '').toLowerCase());
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        const isActive = product.status === 1;
        return matchesSearch && matchesCategory && isActive;
      })
    : activeTab === 'favorite'
    ? (favoriteProducts || []).filter(product => {
        if (!product) return false;
        const matchesSearch = (product.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
                             (product.barcode || '').includes(searchQuery || '') ||
                             (product.category || '').toLowerCase().includes((searchQuery || '').toLowerCase());
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        const isActive = product.status === 1;
        return matchesSearch && matchesCategory && isActive;
      })
    : filteredProducts;

  // Filter customers based on search
  const filteredCustomers = (customers || []).filter(customer => {
    if (!customer) return false;
    return (customer.full_name || '').toLowerCase().includes((customerSearchQuery || '').toLowerCase()) ||
           (customer.phone || '').includes(customerSearchQuery || '');
  });

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
  const quickAmounts = [50000, 100000, 200000, 500000];
  
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
      addToCart(product.id);
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
    setCustomerName(customer.full_name || customer.name || '');
    setCustomerPhone(customer.phone || '');
    setSelectedCustomerId(customer._id || customer.id || '');
    setCustomerSearchQuery(customer.full_name || customer.name || '');
    setShowCustomerDropdown(false);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      playSound('error');
      toast.error(t('emptyCart') || 'Giỏ hàng trống');
      return;
    }
    // Không cần validate khách hàng - cho phép bán cho khách lẻ
    setShowCheckout(true);
  };

  const handleCompletePayment = () => {
    // Validate amount for all payment methods
    const receivedAmt = parseFloat(customerAmount || '0');
    
    // Calculate change (can be negative if customer owes money)
    const calculatedChange = receivedAmt - total;
    
    // Get current user info from localStorage
    const currentUser = localStorage.getItem('salepa_username') || '';

    // Sử dụng "Khách lẻ" nếu không có thông tin khách hàng
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

    // Create order with receipt info
    const orderData = {
      paymentMethod,
      customerName: finalCustomerName,
      customerPhone: finalCustomerPhone,
      discount,
      note: orderNote,
      status: receivedAmt >= total ? 'completed' : 'pending',
      paidAt: new Date().toISOString(),
      receivedAmount: receivedAmt,
      changeAmount: calculatedChange,
      paymentHistory: initialPaymentHistory,
    };

    // If editing an existing order, delete the old one first
    if (editingOrderId) {
      deleteOrder(editingOrderId);
    }
    
    const createdOrder = createOrder(orderData);
    playSound('success');
    
    // Cập nhật điểm tích lũy và nâng hạng khách hàng (nếu đã chọn khách hàng)
    if (selectedCustomerId) {
      const customer = customers.find(c => c._id === selectedCustomerId);
      if (customer) {
        // Tính điểm dựa trên subtotal (trước giảm giá): 10,000đ = 1 điểm
        const pointsEarned = Math.floor(subtotal / 10000);
        
        // Cập nhật tổng chi tiêu và điểm tích lũy
        const newTotalSpent = (customer.total_spent || 0) + subtotal; // Tính theo subtotal (trước giảm giá)
        const newLoyaltyPoints = (customer.loyalty_points || 0) + pointsEarned;
        const newTotalOrders = (customer.total_orders || 0) + 1;
        
        // Tự động nâng hạng khách hàng dựa trên tổng chi tiêu
        // Tìm loại khách hàng phù hợp nhất (có min_spent cao nhất mà khách hàng đạt được)
        const activeCustomerTypes = customerTypes
          .filter(ct => ct.status === 1)
          .sort((a, b) => b.min_spent - a.min_spent); // Sắp xếp từ cao xuống thấp
        
        let newCustomerTypeId = customer.customer_type_id;
        for (const ct of activeCustomerTypes) {
          if (newTotalSpent >= ct.min_spent) {
            newCustomerTypeId = ct._id;
            break;
          }
        }
        
        // Cập nhật thông tin khách hàng
        updateCustomer(selectedCustomerId, {
          total_spent: newTotalSpent,
          loyalty_points: newLoyaltyPoints,
          total_orders: newTotalOrders,
          customer_type_id: newCustomerTypeId,
        });
        
        // Thông báo nếu có nâng hạng
        if (newCustomerTypeId !== customer.customer_type_id) {
          const newType = customerTypes.find(ct => ct._id === newCustomerTypeId);
          if (newType) {
            toast.success('🎉 Nâng hạng khách hàng!', {
              description: `${finalCustomerName} đã được nâng lên hạng: ${newType.name}`,
              duration: 5000,
            });
          }
        }
      }
    }
    
    // Get the created order ID
    const orderId = createdOrder?.id || `ORD-${Date.now()}`;
    
    // Tạo gói liệu trình cho các sản phẩm loại treatment
    if (selectedCustomerId) {
      cart.forEach(item => {
        if (item.productType === 'treatment' && item.sessions && item.sessions > 0) {
          // Tìm các dịch vụ đi kèm trong liệu trình
          const treatmentProduct = products.find(p => p.id === item.id);
          const serviceIds = treatmentProduct?.sessionDetails 
            ? treatmentProduct.sessionDetails.flatMap(session => 
                session.services.map(s => s.id)
              )
            : [];
          
          createCustomerTreatmentPackage({
            customerId: selectedCustomerId,
            customerName: finalCustomerName,
            treatmentProductId: item.id,
            treatmentName: item.name,
            totalSessions: item.sessions,
            usedSessions: 0,
            remainingSessions: item.sessions,
            serviceIds: serviceIds,
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
      discount,
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
    toast.success(editingOrderId ? '✅ Cập nhật hóa đơn thành công!' : '✅ Thanh toán thành công!', {
      description: `Tổng tiền: ${total.toLocaleString()}đ${calculatedChange > 0 ? ` | Tiền thừa: ${calculatedChange.toLocaleString()}đ` : calculatedChange < 0 ? ` | Còn nợ: ${Math.abs(calculatedChange).toLocaleString()}đ` : ''}`,
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
    setVoucherCode('');
    setTipAmount(0);
    setPaymentMethod('cash');
    setOrderNote('');
    setEditingOrderId(null); // Clear editing mode
    
    // Auto-focus search
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  const handleHoldBill = () => {
    if (cart.length === 0) {
      playSound('error');
      alert(t('emptyCart'));
      return;
    }
    holdBill(customerName || 'Khách lẻ');
    setCustomerName('');
    playSound('success');
    alert(t('billHeld'));
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    if (confirm(t('clearCart') + '?')) {
      cart.forEach(item => removeFromCart(item.id));
      playSound('beep');
    }
  };

  const handleQuickDiscount = (percent: number) => {
    const discountAmount = Math.round(subtotal * percent / 100);
    setOrderDiscount(discountAmount);
    playSound('beep');
  };

  const handleApplyVoucher = () => {
    if (!voucherCode.trim()) {
      toast.error('Vui lòng nhập mã voucher');
      return;
    }
    // TODO: Implement voucher validation logic here
    toast.info(`Mã voucher "${voucherCode}" đang được xử lý...`);
    playSound('beep');
  };

  const handleQuickPay = (amount: number) => {
    setCustomerAmount(amount.toString());
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
        setSelectedCustomerId(editingOrder.customerId || '');
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
        description: `Mã HĐ: #${editingOrder.id.slice(-8).toUpperCase()}`,
        duration: 3000,
      });
      playSound('beep');
    }
  }, [editingOrder]);



  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Top Toolbar - POS Actions with Light Orange Theme */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-2 sm:px-4 py-2.5 shadow-sm">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Left - Quick Actions */}
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
            <button
              onClick={handleHoldBill}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-all text-xs sm:text-sm font-medium border border-gray-200 dark:border-gray-600"
              title="Hold Bill (F3)"
            >
              <PauseCircle className="w-4 h-4" />
              <span className="hidden md:inline">{t('holdBill')}</span>
            </button>
            
            <button
              onClick={() => setShowHeldBills(true)}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-all text-xs sm:text-sm font-medium relative border border-gray-200 dark:border-gray-600"
              title="Recall Bill (F4)"
            >
              <PlayCircle className="w-4 h-4" />
              <span className="hidden md:inline">{t('recallBill')}</span>
              {heldBills.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full text-[10px] sm:text-xs flex items-center justify-center font-bold text-white">
                  {heldBills.length}
                </span>
              )}
            </button>

            <button
              onClick={handleClearCart}
              disabled={cart.length === 0}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-all text-xs sm:text-sm font-medium disabled:opacity-50 border border-gray-200 dark:border-gray-600"
              title="Clear Cart (F10)"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden md:inline">{t('clearCart')}</span>
            </button>
            
            {/* Cancel Edit Button - only show when editing */}
            {editingOrderId && (
              <button
                onClick={() => {
                  handleClearCart();
                  setEditingOrderId(null);
                  toast.info('Đã hủy chỉnh sửa hóa đơn');
                }}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-all text-xs sm:text-sm font-medium border border-red-200 dark:border-red-800"
                title="Hủy sửa hóa đơn"
              >
                <X className="w-4 h-4" />
                <span className="hidden md:inline">Hủy sửa</span>
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
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500 dark:border-blue-600 rounded-lg animate-pulse">
                <Edit2 className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-300 hidden sm:inline">Đang sửa HĐ</span>
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
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            {/* Search */}
            <div className="flex-1 sm:max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchQuery || ''}
                  onChange={(e) => setSearchQuery(e.target.value || '')}
                  className="w-full pl-10 pr-3 py-2 sm:py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:border-orange-500 dark:focus:border-orange-500 focus:bg-white dark:focus:bg-gray-600 transition-all text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-thin">
              {[
                { id: 'all' as const, icon: Grid3x3, label: 'Tất cả' },
                { id: 'recent' as const, icon: Clock, label: 'Gần đây' },
                { id: 'favorite' as const, icon: Star, label: 'Yêu thích' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gray-600 dark:bg-gray-700 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="font-medium text-xs sm:text-sm">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* View Toggle - Hidden on mobile */}
            <div className="hidden sm:flex border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 border-l border-gray-200 dark:border-gray-600 ${viewMode === 'list' ? 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            {/* Stats */}
            
          </div>
        </div>

        {/* Product Type Filter & Categories */}
        <div className="px-2 sm:px-4 pb-2 sm:pb-3">
          {/* Combined Filter Row - Product Type + Categories on same line */}
          <div className="flex gap-2 sm:gap-3 items-center overflow-x-auto scrollbar-thin pb-2">
            {/* Category Filter */}
            {activeTab === 'all' && (
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-gray-600 dark:bg-gray-700 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {t('allCategories') || t('all')}
                </button>
                {filteredCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                      selectedCategory === category
                        ? 'bg-gray-600 dark:bg-gray-700 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Products - Full width on mobile/tablet */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-3 pb-20 xl:pb-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-3">
              {displayProducts.filter(p => p).map((product) => {
                const categoryImg = product.image || getCategoryImage(product.category, product.productType);
                return (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product.id)}
                    className="group bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-2 sm:p-3 cursor-pointer hover:shadow-2xl transition-all border-2 border-gray-200 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-500 relative"
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
                            {product.productType === 'product' ? '🛍️ SP' :
                             product.productType === 'service' ? '✂️ DV' : 
                             '✨ LT'}
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
                      <Star className={`w-4 h-4 ${(favoriteProducts || []).some(p => p.id === product.id) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                    </button>

                    {/* Product Info */}
                    <div>
                      <h3 className="text-gray-900 dark:text-white text-xs sm:text-sm md:text-base line-clamp-2 leading-snug mb-1 sm:mb-2 transition-colors min-h-[1.8rem] sm:min-h-[2.5rem] font-bold">
                        {product.name}
                      </h3>
                      
                      <div className="flex items-center justify-between gap-1 sm:gap-2">
                        <div className="text-sm sm:text-base md:text-lg font-bold text-gray-900 dark:text-white">
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
              {displayProducts.filter(p => p).map((product) => {
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
                      <Star className={`w-5 h-5 ${(favoriteProducts || []).some(p => p.id === product.id) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
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

        {/* Right Side - Cart - Hidden on mobile/tablet, show as sidebar on desktop */}
        <div className="hidden xl:flex w-[420px] 2xl:w-[480px] bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex-col shadow-lg">
          {/* Cart Header - Light Orange Theme */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-2 sm:p-3">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h2 className="text-base sm:text-lg font-bold text-gray-700 dark:text-gray-200">Đơn hàng hiện tại</h2>
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 sm:px-3 py-1 rounded-lg">
                <span className="text-lg sm:text-xl font-bold text-[#FE7410]">{cart.length}</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">{t('products')}</span>
              </div>
            </div>
            
            {/* Customer Input with Search & Add Quick Button */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <input
                    type="text"
                    placeholder="Tìm khách hàng bằng tên, số điện thoại,..."
                    value={customerSearchQuery || ''}
                    onChange={(e) => {
                      setCustomerSearchQuery(e.target.value || '');
                      setShowCustomerDropdown(true);
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    className="w-full pl-10 pr-3 py-2 rounded-lg bg-white border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none text-sm"
                  />
                  
                  {/* Customer Dropdown */}
                  {showCustomerDropdown && customerSearchQuery && filteredCustomers.length > 0 && (
                    <div className="relative">
                      <div 
                        className="fixed inset-0 z-20" 
                        onClick={() => setShowCustomerDropdown(false)}
                      />
                      <div className="absolute top-full left-0 right-12 mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto z-30">
                        {filteredCustomers.slice(0, 10).map(customer => (
                          <button
                            key={customer._id || customer.id}
                            onClick={() => handleSelectCustomer(customer)}
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">{customer.full_name || customer.name}</p>
                                <p className="text-xs text-gray-500">{customer.phone}</p>
                              </div>
                              {selectedCustomerId === (customer._id || customer.id) && (
                                <Check className="w-4 h-4 text-[#FE7410]" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
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
              
              {/* Selected Customer Display */}
              {selectedCustomerId && customerName && (
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
              )}
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
                <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 mb-3" />
                <p className="text-sm sm:text-base">{t('emptyCart')}</p>
                <p className="text-xs sm:text-sm mt-2 text-center">{t('addProductsToStart')}</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedCartItem(item.id)}
                  className={`bg-gray-50 dark:bg-gray-700 rounded-lg sm:rounded-xl p-2 sm:p-3 border-2 transition-all cursor-pointer ${
                    selectedCartItem === item.id ? 'bg-orange-50 dark:bg-orange-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                  style={selectedCartItem === item.id ? { borderColor: '#FE7410', backgroundColor: '#FFF7ED' } : {}}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FFEDD5' }}>
                      <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#FE7410' }} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base line-clamp-1">{item.name}</h3>
                      <div className="text-base sm:text-lg font-bold mt-0.5" style={{ color: '#FE7410' }}>
                        {(item.price || 0).toLocaleString()}đ
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromCart(item.id);
                        playSound('beep');
                      }}
                      className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateCartQuantity(item.id, Math.max(1, item.quantity - 1));
                          playSound('beep');
                        }}
                        className="w-7 h-7 sm:w-8 sm:h-8 bg-white dark:bg-gray-600 border-2 border-gray-300 dark:border-gray-500 rounded-lg flex items-center justify-center hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-all"
                      >
                        <Minus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700 dark:text-gray-200" />
                      </button>
                      
                      <div className="w-12 h-7 sm:w-14 sm:h-8 bg-white dark:bg-gray-600 border-2 border-gray-300 dark:border-gray-500 rounded-lg flex items-center justify-center">
                        <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{item.quantity || 0}</span>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateCartQuantity(item.id, item.quantity + 1);
                          playSound('beep');
                        }}
                        className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-600 dark:bg-gray-700 rounded-lg flex items-center justify-center hover:shadow-lg transition-all"
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-gray-500 dark:text-gray-400">{t('subtotal')}</div>
                      <div className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                        {((item.price || 0) * (item.quantity || 0)).toLocaleString()}đ
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary & Checkout */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-2 sm:p-3 space-y-2 sm:space-y-3 bg-gray-50 dark:bg-gray-800">
            {/* Discount Section - Quick buttons + Input in one row */}
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-thin pb-1">
              {/* Quick Discount Buttons */}
              {quickDiscounts.map((percent) => (
                <button
                  key={percent}
                  onClick={() => handleQuickDiscount(percent)}
                  className="px-2 sm:px-2.5 py-1 sm:py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all whitespace-nowrap flex-shrink-0"
                >
                  -{percent}%
                </button>
              ))}
              
              {/* Discount Input */}
              <div className="flex items-center gap-2 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 flex-1 min-w-[100px]">
                <Percent className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                <input
                  type="number"
                  placeholder={t('discount')}
                  value={orderDiscount ?? ''}
                  onChange={(e) => setOrderDiscount(parseFloat(e.target.value || '0') || 0)}
                  className="flex-1 outline-none text-sm sm:text-base min-w-0 bg-transparent text-gray-900 dark:text-white"
                />
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">đ</span>
              </div>
            </div>

            {/* Voucher Input */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 flex-1">
                <Tag className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="NHẬP MÃ VOUCHER"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  className="flex-1 outline-none text-sm sm:text-base min-w-0 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleApplyVoucher();
                    }
                  }}
                />
              </div>
              <button
                onClick={handleApplyVoucher}
                disabled={!voucherCode.trim()}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#FE7410] text-white rounded-lg hover:bg-[#E56809] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-semibold whitespace-nowrap"
              >
                Áp dụng
              </button>
            </div>

            {/* Tip Input - Only show if enabled in settings */}
            {settings.enableTip && (
              <div className="flex items-center gap-2 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
                <Gift className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                <input
                  type="number"
                  placeholder={t('tip') || 'Tip'}
                  value={tipAmount ?? ''}
                  onChange={(e) => setTipAmount(parseFloat(e.target.value || '0') || 0)}
                  className="flex-1 outline-none text-sm sm:text-base min-w-0 bg-transparent text-gray-900 dark:text-white"
                />
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">đ</span>
              </div>
            )}

            {/* Totals - Simplified */}
            <div className="bg-white dark:bg-gray-700 rounded-lg sm:rounded-xl p-2 sm:p-3 border-2 border-gray-200 dark:border-gray-600">
              <div className="flex justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1.5">
                <span>{t('subtotal')}:</span>
                <span className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">{subtotal.toLocaleString()}đ</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-xs sm:text-sm text-red-600 dark:text-red-400 mb-1.5">
                  <span>{t('discount')}:</span>
                  <span className="font-semibold text-sm sm:text-base">-{discount.toLocaleString()}đ</span>
                </div>
              )}
              {tip > 0 && (
                <div className="flex justify-between text-xs sm:text-sm text-green-600 dark:text-green-400 mb-1.5">
                  <span>{t('tip') || 'Tip'}:</span>
                  <span className="font-semibold text-sm sm:text-base">+{tip.toLocaleString()}đ</span>
                </div>
              )}
              <div className="border-t-2 border-gray-200 dark:border-gray-600 pt-2 flex justify-between items-center">
                <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{t('total')}:</span>
                <span className="text-xl sm:text-2xl font-bold text-[#FE7410]">
                  {total.toLocaleString()}đ
                </span>
              </div>
            </div>

            {/* Checkout Button - Orange Highlight */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full bg-[#FE7410] text-white py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl hover:bg-[#E56809] hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base sm:text-lg font-bold"
            >
              <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">{t('checkout')} ( F9 )</span>
              <span className="sm:hidden">{t('checkout')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Quantity Modal */}
      {showQuickQuantity && selectedProductForQty && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="bg-gray-100 dark:bg-gray-700 border-b-2 border-gray-200 dark:border-gray-600 p-3 sm:p-4 rounded-t-2xl">
              <h2 className="text-lg sm:text-xl font-bold text-gray-700 dark:text-gray-200">{t('enterAmount') || 'Enter Quantity'}</h2>
            </div>
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-2 text-sm sm:text-base">
                  {products.find(p => p.id === selectedProductForQty)?.name}
                </p>
                <input
                  type="number"
                  value={quickQuantity || '1'}
                  onChange={(e) => setQuickQuantity(e.target.value || '1')}
                  className="w-full text-center text-3xl sm:text-4xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-xl py-3 sm:py-4 focus:outline-none focus:border-gray-500 dark:focus:border-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddWithQuantity();
                    }
                  }}
                />
              </div>

              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => setQuickQuantity(prev => prev === '1' ? num.toString() : prev + num.toString())}
                    className="p-3 sm:p-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-xl sm:text-2xl font-bold text-gray-900 dark:text-white"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={() => setQuickQuantity('1')}
                  className="p-3 sm:p-4 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg text-lg sm:text-xl font-bold text-red-600 dark:text-red-400"
                >
                  C
                </button>
                <button
                  onClick={() => setQuickQuantity(prev => prev === '1' ? '0' : prev + '0')}
                  className="p-3 sm:p-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-xl sm:text-2xl font-bold text-gray-900 dark:text-white"
                >
                  0
                </button>
                <button
                  onClick={() => setQuickQuantity(prev => prev.length > 1 ? prev.slice(0, -1) : '1')}
                  className="p-3 sm:p-4 bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 rounded-lg text-lg sm:text-xl font-bold text-yellow-700 dark:text-yellow-400"
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
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2.5 sm:py-3 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600 text-sm sm:text-base"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleAddWithQuantity}
                  className="flex-1 bg-[#FE7410] text-white py-2.5 sm:py-3 rounded-lg font-bold hover:bg-[#E56809] hover:shadow-lg text-sm sm:text-base"
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
                        }}
                        className="flex-1 text-white py-2 rounded-lg font-medium transition-all shadow-lg"
                        style={{ backgroundColor: '#FE7410' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E56809'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FE7410'}
                      >
                        {t('loadBill')}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(t('deleteBill') + '?')) {
                            deleteHeldBill(bill.id);
                            playSound('beep');
                          }
                        }}
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
                      onSuccess={(data) => {
                        handleCompletePayment();
                      }}
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
                      onSuccess={(data) => {
                        handleCompletePayment();
                      }}
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
                    value={customerAmount || ''}
                    onChange={(e) => setCustomerAmount(e.target.value || '')}
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
                    {discount > 0 && (
                      <div className="flex justify-between text-base text-red-600">
                        <span>{t('discount')}:</span>
                        <span className="font-semibold text-lg">-{discount.toLocaleString()}đ</span>
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
                    value={orderNote || ''}
                    onChange={(e) => setOrderNote(e.target.value || '')}
                    placeholder={t('addNoteOptional') || 'Thêm ghi chú cho đơn hàng '}
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
                className="w-full text-white py-4 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-3 text-xl font-bold"
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
              const dateA = new Date(a.created_at || 0).getTime();
              const dateB = new Date(b.created_at || 0).getTime();
              return dateB - dateA;
            });
            
            if (sortedCustomers.length > 0) {
              const latestCustomer = sortedCustomers[0];
              setSelectedCustomerId(latestCustomer._id || '');
              setCustomerName(latestCustomer.full_name || '');
              setCustomerPhone(latestCustomer.phone || '');
              setCustomerSearchQuery(latestCustomer.full_name || '');
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

      {/* Floating Cart Button - Mobile/Tablet Only */}
      {cart.length > 0 && (
        <button
          onClick={() => setShowMobileCart(true)}
          className="xl:hidden fixed bottom-6 right-6 w-16 h-16 bg-[#FE7410] text-white rounded-full shadow-2xl flex items-center justify-center z-40 hover:bg-[#E56809] transition-all hover:scale-110 active:scale-95 animate-bounce"
          style={{ animationIterationCount: '3' }}
        >
          <div className="relative">
            <ShoppingBag className="w-7 h-7" />
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold text-white border-2 border-white">
              {cart.length}
            </span>
          </div>
        </button>
      )}

      {/* Mobile Cart Modal - Full Screen */}
      {showMobileCart && (
        <div className="xl:hidden fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowMobileCart(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                >
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </button>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('currentOrder')}</h2>
              </div>
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg">
                <span className="text-2xl font-bold text-[#FE7410]">{cart.length}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('products')}</span>
              </div>
            </div>

            {/* Customer Search */}
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 z-10" />
                  <input
                    type="text"
                    placeholder={t('searchCustomer') || 'Tìm khách hàng...'}
                    value={customerSearchQuery || ''}
                    onChange={(e) => {
                      setCustomerSearchQuery(e.target.value || '');
                      setShowCustomerDropdown(true);
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-gray-400 dark:focus:border-gray-500 focus:outline-none text-base"
                  />
                  
                  {showCustomerDropdown && customerSearchQuery && filteredCustomers.length > 0 && (
                    <div className="relative">
                      <div 
                        className="fixed inset-0 z-20" 
                        onClick={() => setShowCustomerDropdown(false)}
                      />
                      <div className="absolute top-full left-0 right-12 mt-1 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto z-30">
                        {filteredCustomers.slice(0, 10).map(customer => (
                          <button
                            key={customer._id || customer.id}
                            onClick={() => handleSelectCustomer(customer)}
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white text-sm">{customer.full_name || customer.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{customer.phone}</p>
                              </div>
                              {selectedCustomerId === (customer._id || customer.id) && (
                                <Check className="w-4 h-4 text-[#FE7410]" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowAddCustomerModal(true)}
                  className="p-2.5 text-white rounded-lg transition-all"
                  style={{ backgroundColor: '#FE7410' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E56809'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FE7410'}
                  title={t('addNew') || 'Thêm khách hàng mới'}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              
              {selectedCustomerId && customerName && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: '#FFEDD5' }}>
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
                    <X className="w-4 h-4" style={{ color: '#FE7410' }} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50 dark:bg-gray-900">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
                <ShoppingBag className="w-20 h-20 mb-4" />
                <p className="text-lg">{t('emptyCart')}</p>
                <p className="text-sm mt-2 text-center">{t('addProductsToStart')}</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedCartItem(item.id)}
                  className={`bg-white dark:bg-gray-800 rounded-xl p-3 border-2 transition-all cursor-pointer ${
                    selectedCartItem === item.id ? 'bg-orange-50 dark:bg-orange-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  style={selectedCartItem === item.id ? { borderColor: '#FE7410', backgroundColor: '#FFF7ED' } : {}}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FFEDD5' }}>
                      <ShoppingBag className="w-7 h-7" style={{ color: '#FE7410' }} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white text-base line-clamp-2">{item.name}</h3>
                      <div className="text-lg font-bold mt-1" style={{ color: '#FE7410' }}>
                        {(item.price || 0).toLocaleString()}đ
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromCart(item.id);
                        playSound('beep');
                      }}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
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
                        className="w-10 h-10 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-all"
                      >
                        <Minus className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                      </button>
                      
                      <div className="w-16 h-10 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">{item.quantity || 0}</span>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateCartQuantity(item.id, item.quantity + 1);
                          playSound('beep');
                        }}
                        className="w-10 h-10 bg-gray-600 dark:bg-gray-700 rounded-lg flex items-center justify-center hover:shadow-lg transition-all"
                      >
                        <Plus className="w-5 h-5 text-white" />
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-gray-500 dark:text-gray-400">{t('subtotal')}</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {((item.price || 0) * (item.quantity || 0)).toLocaleString()}đ
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary & Checkout - Fixed at bottom */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3 bg-white dark:bg-gray-800 shadow-2xl">
            {/* Discount Section */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-1">
              {quickDiscounts.map((percent) => (
                <button
                  key={percent}
                  onClick={() => handleQuickDiscount(percent)}
                  className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all whitespace-nowrap flex-shrink-0"
                >
                  -{percent}%
                </button>
              ))}
              
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 flex-1 min-w-[120px]">
                <Percent className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                <input
                  type="number"
                  placeholder={t('discount')}
                  value={orderDiscount ?? ''}
                  onChange={(e) => setOrderDiscount(parseFloat(e.target.value || '0') || 0)}
                  className="flex-1 outline-none text-base min-w-0 bg-transparent text-gray-900 dark:text-white"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">đ</span>
              </div>
            </div>

            {/* Totals */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 border-2 border-gray-200 dark:border-gray-600">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1.5">
                <span>{t('subtotal')}:</span>
                <span className="font-semibold text-base text-gray-900 dark:text-white">{subtotal.toLocaleString()}đ</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-red-600 dark:text-red-400 mb-1.5">
                  <span>{t('discount')}:</span>
                  <span className="font-semibold text-base">-{discount.toLocaleString()}đ</span>
                </div>
              )}
              <div className="border-t-2 border-gray-200 dark:border-gray-600 pt-2 flex justify-between items-center">
                <span className="text-base font-bold text-gray-900 dark:text-white">{t('total')}:</span>
                <span className="text-2xl font-bold text-[#FE7410]">{total.toLocaleString()}đ</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => {
                setShowMobileCart(false);
                handleCheckout();
              }}
              disabled={cart.length === 0}
              className="w-full bg-[#FE7410] text-white py-4 rounded-xl hover:bg-[#E56809] hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg font-bold"
            >
              <Zap className="w-6 h-6" />
              {t('checkout')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ModernSalesScreen;