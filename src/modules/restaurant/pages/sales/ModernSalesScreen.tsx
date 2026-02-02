import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../../../lib/restaurant-lib/store';
import { useTranslation } from '../../../../lib/restaurant-lib/useTranslation';
import { useCrossTabSync } from '../../../../lib/restaurant-lib/useCrossTabSync';
import { toast } from 'sonner';
import { 
  Search, Plus, Minus, Trash2, X, DollarSign, Printer, User, 
  Clock, CreditCard, Smartphone, QrCode, Zap, Grid3x3, List,
  Tag, Star, TrendingUp, ShoppingBag, Calculator, Percent,
  Menu, ChevronRight, Check, AlertCircle, Barcode, Save,
  RotateCcw, FileText, Users, PauseCircle, PlayCircle,
  Settings, History, Grid, Monitor, Keyboard, Edit3, Edit2,
  MessageSquare, Receipt, Eye, Volume2, Bell, Gift, SplitSquare,
  Package, Scissors, Sparkles, UserPlus, UtensilsCrossed
} from 'lucide-react';
import { CardPaymentForm, type CardData } from '../../components/forms/CardPaymentForm';
import { QRPaymentForm, type QRPaymentData } from '../../components/forms/QRPaymentForm';
import { Receipt as ReceiptModal } from '../../components/common/Receipt';
import { CustomerForm } from '../../components/forms/CustomerForm';

type PaymentMethodType = 'cash' | 'card' | 'transfer' | 'momo' | 'zalopay' | 'vnpay';
type ProductTypeFilter = 'all' | 'food' | 'combo' | 'inventory' | 'service' | 'treatment';

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
    updateOrder,
    deleteOrder,
    categories,
    recentProducts,
    favoriteProducts,
    toggleFavorite,
    heldBills,
    holdBill,
    recallBill,
    // deleteHeldBills,
    orders,
    settings,
    sidebarCollapsed,
    toggleSidebar,
    addToRecent,
    customers,
    addCustomer,
    createCustomerTreatmentPackage,
    editingOrder,
    setEditingOrder,
    clearCart,
    setCart,
    tableAreas, // Lấy từ quản lý phòng/bàn
    selectedIndustry,
    assignOrderToTable,
    clearTable,
    createKitchenOrder,
    kitchenOrders,
    updateKitchenOrderItems,
  } = useStore();
  const { t } = useTranslation();
  
  // Enable cross-tab sync for real-time updates
  useCrossTabSync();
  
  const isFoodBeverage = true;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [productTypeFilter, setProductTypeFilter] = useState<ProductTypeFilter>('all');
  const [showCheckout, setShowCheckout] = useState(false);
  const [showHeldBills, setShowHeldBills] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);
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
  const [voucherCode, setVoucherCode] = useState('');
  const [customerAmount, setCustomerAmount] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'all' | 'recent' | 'favorite'>('all');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedCartItem, setSelectedCartItem] = useState<string | null>(null);
  const [quickQuantity, setQuickQuantity] = useState('1');
  const [selectedProductForQty, setSelectedProductForQty] = useState<string | null>(null);
  const [itemNote, setItemNote] = useState('');
  const [selectedItemForNote, setSelectedItemForNote] = useState<string | null>(null); // Track which item is being edited for note
  const [priceOverride, setPriceOverride] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [tipAmount, setTipAmount] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway' | 'delivery'>('dine-in');
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [selectedTableName, setSelectedTableName] = useState<string>('');
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null); // Track if editing an existing order
  
  // State to save original order data for cancel edit feature
  const [originalOrderState, setOriginalOrderState] = useState<{
    cart: any[];
    customerName: string;
    customerPhone: string;
    selectedCustomerId: string;
    orderDiscount: number;
    orderNote: string;
    paymentMethod: PaymentMethodType;
    notifiedItems: {id: string, quantity: number}[];
  } | null>(null);
  
  // F&B Restaurant specific states
  const [mainTab, setMainTab] = useState<'table-select' | 'menu' | 'takeaway'>('table-select'); // Tab chính cho F&B
  const [tableFilter, setTableFilter] = useState<'all' | 'available' | 'occupied'>('all'); // Bộ lọc bàn
  const [notifiedItems, setNotifiedItems] = useState<{id: string, quantity: number}[]>([]); // Track items đã thông báo bếp với số lượng
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null); // Track order hiện tại đang edit
  
  // Cancel item confirmation states
  const [showCancelItemModal, setShowCancelItemModal] = useState(false);
  const [cancelItemId, setCancelItemId] = useState<string | null>(null);
  const [cancelItemAction, setCancelItemAction] = useState<'remove' | 'decrease' | null>(null);
  const [cancelQuantity, setCancelQuantity] = useState('1');
  const [cancelReason, setCancelReason] = useState('');
  
  // Force re-render counter for real-time sync
  const [, setRenderTrigger] = useState(0);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Listen to kitchenOrders changes for real-time badge updates
  useEffect(() => {
    console.log('[ModernSalesScreen] 🔄 kitchenOrders changed, forcing re-render');
    setRenderTrigger(prev => prev + 1);
  }, [kitchenOrders]);

  // Listen to orders changes for itemStatuses sync
  useEffect(() => {
    console.log('[ModernSalesScreen] 🔄 orders changed, forcing re-render');
    setRenderTrigger(prev => prev + 1);
  }, [orders]);
  
  // Listen to cross-tab sync events for immediate UI update
  useEffect(() => {
    const handleCrossTabSync = () => {
      console.log('[ModernSalesScreen] 📡 Cross-tab sync event received');
      setRenderTrigger(prev => prev + 1);
    };
    
    const handleKitchenStatusChanged = (e: Event) => {
      const customEvent = e as CustomEvent;
      console.log('[ModernSalesScreen] 🔔 Kitchen status changed:', customEvent.detail);
      setRenderTrigger(prev => prev + 1);
    };
    
    window.addEventListener('cross-tab-sync', handleCrossTabSync);
    window.addEventListener('kitchen-status-changed', handleKitchenStatusChanged);
    
    return () => {
      window.removeEventListener('cross-tab-sync', handleCrossTabSync);
      window.removeEventListener('kitchen-status-changed', handleKitchenStatusChanged);
    };
  }, []);

  // 🔥 F&B Mode: Auto-update order when cart changes (after order creation)
  useEffect(() => {
    if ( currentOrderId && cart.length > 0) {
      console.log('[ModernSalesScreen] 🔄 Auto-updating order due to cart change');
      
      const newSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const existingOrder = orders.find(o => o.id === currentOrderId);
      
      if (existingOrder) {
        updateOrder(currentOrderId, {
          items: cart,
          subtotal: newSubtotal,
          total: newSubtotal - (orderDiscount || 0),
        });
      }
    }
  }, [cart, currentOrderId]);

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
  const discount = orderDiscount || 0;
  const tip = tipAmount || 0;
  const total = Math.max(0, subtotal - discount + tip);
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
    { id: 'cash' as const, icon: DollarSign, label: t.cash, color: 'green' },
    { id: 'card' as const, icon: CreditCard, label: t.card, color: 'blue' },
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
      alert(t.notFound);
    }
  };

  // Handle product click - Add directly to cart
  const handleProductClick = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // 🔥 F&B Mode: Auto-create order when adding first item to empty cart
    if (selectedTableId && cart.length === 0 && !currentOrderId) {
      console.log('[handleProductClick] 🆕 Creating order for first item');
      
      const currentUsername = localStorage.getItem('salepa_username') || 'Thu ngân';
      const newOrderId = `ORD-${Date.now()}`;
      
      // Create initial order with this first item
      const orderData = {
        id: newOrderId,
        orderNumber: `${selectedTableName || 'TABLE'}-${Date.now().toString().slice(-6)}`,
        items: [{ ...product, quantity: 1 }],
        subtotal: product.price,
        discount: 0,
        total: product.price,
        date: new Date().toISOString(),
        status: 'pending' as const,
        paymentStatus: 'unpaid' as const,
        createdBy: currentUsername,
        orderType: 'dine-in' as const,
        tableId: selectedTableId,
        tableName: selectedTableName,
        tableNumber: selectedTableName ? parseInt(selectedTableName.match(/\d+/)?.[0] || '0') : undefined,
        notifiedItemIds: [],
        orderHistory: [],
      };
      
      createOrder(orderData);
      setCurrentOrderId(newOrderId);
      setEditingOrderId(newOrderId);
      assignOrderToTable(selectedTableId, newOrderId);
      
      console.log('[handleProductClick] ✅ Order created:', newOrderId);
    }
    
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

  // Handle item note
  const handleOpenItemNote = (itemId: string) => {
    const item = cart.find(i => i.id === itemId);
    if (item) {
      setSelectedItemForNote(itemId);
      setItemNote(item.note || '');
      setShowItemNote(true);
    }
  };

  const handleCloseReceipt = () => {
    console.log('[handleCloseReceipt] 🚀 Closing receipt and resetting...');
    
    // Close receipt
    setShowReceipt(false);
    setCompletedOrder(null);
    
    // Reset everything
    clearCart();
    setCustomerName('');
    setCustomerPhone('');
    setSelectedCustomerId('');
    setCustomerSearchQuery('');
    setCustomerAmount('');
    setOrderDiscount(0);
    setTipAmount(0);
    setPaymentMethod('cash');
    setOrderNote('');
    setSelectedTableId('');
    setSelectedTableName('');
    setNotifiedItems([]);
    setCurrentOrderId(null);
    setEditingOrderId(null);
    
    // Always go back to table selection
    console.log('[handleCloseReceipt] ✅ Switching to table-select tab');
    setMainTab('table-select');
    
    // Focus on search input
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  const handleSaveItemNote = () => {
    if (selectedItemForNote) {
      const item = cart.find(i => i.id === selectedItemForNote);
      if (!item) return;
      
      console.log('[handleSaveItemNote] 🔍 Saving note for item:', {
        itemId: selectedItemForNote,
        itemName: item.name,
        note: itemNote
      });
      
      const { updateCartNote } = useStore.getState();
      updateCartNote(selectedItemForNote, itemNote);
      
      toast.success(itemNote ? 'Đã lưu ghi chú' : 'Đã xóa ghi chú');
      
      setShowItemNote(false);
      setSelectedItemForNote(null);
      setItemNote('');
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      playSound('error');
      toast.error(t.emptyCart || 'Giỏ hàng trống');
      return;
    }
    // Validate customer selection
    if (!selectedCustomerId && !customerName) {
      playSound('error');
      toast.error('Vui lòng chọn khách hàng trước khi thanh toán');
      return;
    }
    setShowCheckout(true);
  };

  const handleCompletePayment = () => {
    // Validate amount for all payment methods
    const receivedAmt = parseFloat(customerAmount || '0');
    
    // Validate table selection for dine-in orders in F&B
    if (  orderType === 'dine-in' && !selectedTableId) {
      playSound('error');
      toast.error('Vui lòng chọn bàn cho đơn hàng tại bàn');
      return;
    }
    
    // Calculate change (can be negative if customer owes money)
    const calculatedChange = receivedAmt - total;
    
    // Get current user info from localStorage
    const currentUser = localStorage.getItem('salepa_username') || '';

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

    // Extract table number from table name (e.g., "Bàn 5" -> 5)
    const extractTableNumber = (tableName: string): number | undefined => {
      const match = tableName.match(/\d+/);
      return match ? parseInt(match[0]) : undefined;
    };
    
    // Create order with receipt info
    const orderData = {
      paymentMethod,
      customerName,
      customerPhone,
      discount,
      note: orderNote,
      status: receivedAmt >= total ? 'completed' : 'pending',
      paidAt: new Date().toISOString(),
      receivedAmount: receivedAmt,
      changeAmount: calculatedChange,
      paymentHistory: initialPaymentHistory,
      orderType: orderType ,
      tableId:  selectedTableId,
      tableName:  selectedTableName ,
      tableNumber: extractTableNumber(selectedTableName) ,
    };

    // If editing an existing order, delete the old one first
    if (editingOrderId) {
      deleteOrder(editingOrderId);
    }
    
    const createdOrder = createOrder(orderData);
    playSound('success');
    
    // Get the created order ID
    const orderId = createdOrder?.id || `ORD-${Date.now()}`;
    
    // Note: Trạng thái bàn (occupied/available) được tự động tính từ orders
    // Khi order có status='completed', bàn tự động về trống
    
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
            customerName: customerName,
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
      customerName,
      customerPhone,
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
    setTipAmount(0);
    setPaymentMethod('cash');
    setOrderNote('');
    setOrderType('dine-in');
    setSelectedTableId('');
    setSelectedTableName('');
    setEditingOrderId(null); // Clear editing mode
    
    // Auto-focus search
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  const handleHoldBill = () => {
    if (cart.length === 0) {
      playSound('error');
      alert(t.emptyCart);
      return;
    }
    holdBill(customerName);
    setCustomerName('');
    playSound('success');
    alert(t.billHeld);
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    if (confirm(t.clearCart + '?')) {
      cart.forEach(item => removeFromCart(item.id));
      playSound('beep');
    }
  };

  const handleQuickDiscount = (percent: number) => {
    const discountAmount = Math.round(subtotal * percent / 100);
    setOrderDiscount(discountAmount);
    playSound('beep');
  };

  const handleQuickPay = (amount: number) => {
    setCustomerAmount(amount.toString());
  };

  // F&B Restaurant Functions
  const handleCreateTakeawayOrder = () => {
    // Generate takeaway order number
    const takeawayOrders = orders.filter(o => o.orderType === 'takeaway' && o.status !== 'completed');
    const nextNumber = takeawayOrders.length + 1;
    const takeawayName = `Mang đi #${String(nextNumber).padStart(3, '0')}`;
    const tableId = `TAKEAWAY-${Date.now()}`;
    
    // Clear cart and form if switching from another order
    if (cart.length > 0 || selectedTableId) {
      clearCart();
      setCustomerName('');
      setCustomerPhone('');
      setSelectedCustomerId('');
      setCustomerSearchQuery('');
      setOrderDiscount(0);
      setOrderNote('');
    }
    
    // Create empty order immediately
    const currentUsername = localStorage.getItem('salepa_username') || 'Admin';
    const newOrderId = `ORD-${Date.now()}`;
    
    const newOrder = {
      id: newOrderId,
      orderNumber: takeawayName,
      items: [],
      subtotal: 0,
      discount: 0,
      total: 0,
      date: new Date().toISOString(),
      status: 'pending' as const,
      paymentStatus: 'unpaid' as const,
      paymentMethod: undefined,
      customerName: '',
      customerPhone: '',
      note: '',
      orderType: 'takeaway' as const,
      tableId: tableId,
      tableName: takeawayName,
      createdBy: currentUsername,
      notifiedItemIds: [],
    };
    
    createOrder(newOrder as any);
    
    // Set order info
    setSelectedTableId(tableId);
    setSelectedTableName(takeawayName);
    setOrderType('takeaway');
    setCurrentOrderId(newOrderId);
    setEditingOrderId(newOrderId);
    setNotifiedItems([]);
    
    // Switch to menu tab
    setMainTab('menu');
    toast.success(`Đã tạo đơn ${takeawayName} - Thêm món và nhấn "Thông báo" để gửi bếp`);
  };

  const handleSelectTakeawayOrder = (order: any) => {
    // Nếu đang chọn cùng đơn, chỉ chuyển tab
    if (currentOrderId === order.id) {
      setMainTab('menu');
      return;
    }
    
    // Load existing takeaway order
    setCurrentOrderId(order.id);
    setEditingOrderId(order.id);
    setSelectedTableId(order.tableId || `TAKEAWAY-${order.id}`);
    setSelectedTableName(order.tableName || 'Mang đi');
    setOrderType('takeaway');
    
    // Load items into cart
    setCart([...order.items] as any[]);
    
    // Load notified items
    const notifiedData = order.notifiedItemIds || [];
    if (notifiedData.length > 0 && typeof notifiedData[0] === 'string') {
      setNotifiedItems(order.items.filter((item: any) => 
        notifiedData.includes(item.id)
      ).map((item: any) => ({
        id: item.id,
        quantity: item.quantity
      })));
    } else if (notifiedData.length > 0) {
      setNotifiedItems([...notifiedData] as {id: string, quantity: number}[]);
    } else {
      setNotifiedItems([]);
    }
    
    // Load customer info
    setCustomerName(order.customerName || '');
    setCustomerPhone(order.customerPhone || '');
    
    // Load order details
    setOrderDiscount(order.discount || 0);
    setOrderNote(order.note || '');
    
    // Switch to menu tab
    setMainTab('menu');
    toast.info(`Đã load đơn ${order.tableName || 'Mang đi'}`);
  };

  const handleSelectTable = (table: any) => {
    // Nếu đang chọn cùng bàn, chỉ chuyển tab, không reload
    if (selectedTableId === table.id) {
      setMainTab('menu');
      return;
    }
    
    setSelectedTableId(table.id);
    setSelectedTableName(table.name);
    
    // Check if table has existing order
    const existingOrder = orders.find(o => o.tableId === table.id && o.status !== 'completed');
    
    if (existingOrder) {
      // Load existing order into cart and all related data
      setCurrentOrderId(existingOrder.id);
      setEditingOrderId(existingOrder.id);
      
      // Load items into cart - use setCart to preserve exact quantities and all item properties
      setCart([...existingOrder.items] as any[]);
      
      // Load notified items - convert old format to new if needed
      const notifiedData = existingOrder.notifiedItemIds || [];
      if (notifiedData.length > 0 && typeof notifiedData[0] === 'string') {
        // Old format: array of IDs - convert to {id, quantity} using current item quantities
        setNotifiedItems(existingOrder.items.filter((item: any) => 
          notifiedData.includes(item.id)
        ).map((item: any) => ({
          id: item.id,
          quantity: item.quantity
        })));
      } else if (notifiedData.length > 0) {
        // New format already - deep copy to avoid reference issues
        setNotifiedItems([...notifiedData] as {id: string, quantity: number}[]);
      } else {
        // No notified items
        setNotifiedItems([]);
      }
      
      // Load customer info
      setCustomerName(existingOrder.customerName || '');
      setCustomerPhone(existingOrder.customerPhone || '');
      
      // Find and set customer ID if exists
      const customer = customers.find(c => 
        c.phone === existingOrder.customerPhone || 
        (c.name === existingOrder.customerName && existingOrder.customerName)
      );
      if (customer) {
        setSelectedCustomerId(customer.id);
        setCustomerSearchQuery(customer.name);
      } else {
        setSelectedCustomerId('');
        setCustomerSearchQuery('');
      }
      
      // Load order details
      setOrderDiscount(existingOrder.discount || 0);
      setOrderNote(existingOrder.note || '');
      setOrderType(existingOrder.orderType || 'dine-in');
      
      toast.info(`Đã load đơn hàng của ${table.name}`);
    } else {
      // Bàn trống (no existing order)
      setCurrentOrderId(null);
      setEditingOrderId(null);
      setNotifiedItems([]);
      
      // *** FIX: Nếu đang chuyển từ bàn khác → clear tất cả ***
      // Chỉ giữ cart nếu:
      // 1. Chưa chọn bàn nào (selectedTableId rỗng) - user thêm món trước rồi chọn bàn
      // 2. Đang ở cùng bàn này (không thể xảy ra vì đã check ở đầu hàm)
      const isPreviouslySelectedTable = selectedTableId && selectedTableId !== table.id;
      
      if (isPreviouslySelectedTable) {
        // Đang chuyển từ bàn khác sang bàn trống → clear tất cả để bắt đầu đơn mới
        clearCart();
        setCustomerName('');
        setCustomerPhone('');
        setSelectedCustomerId('');
        setCustomerSearchQuery('');
        setOrderDiscount(0);
        setOrderNote('');
        toast.info(`${table.name} - Bàn trống, sẵn sàng nhận đơn mới`);
      } else {
        // Chưa chọn bàn nào, giữ nguyên cart hiện tại
        // Điều này cho phép user: thêm món → chọn bàn → gửi bếp
        toast.info(`Đã chọn ${table.name} - Thêm món và nhấn "Thông báo" để gửi bếp`);
      }
    }
    
    // Auto switch to menu tab
    setMainTab('menu');
  };

  // Check if item needs cancel confirmation
  const handleRemoveItem = (itemId: string) => {
    const item = cart.find(i => i.id === itemId);
    if (!item) return;
    
    const notifiedQty = item.notifiedQuantity || 0;
    
    console.log('[handleRemoveItem] 📊 Item info:', {
      itemName: item.name,
      total: item.quantity,
      notified: notifiedQty,
    });
    
    // ✅ XÓA: Nếu món đã gửi bếp → LUÔN hiện popup (không quan tâm có món chưa gửi)
    if (notifiedQty > 0) {
      console.log('[handleRemoveItem] ⚠️ Item has been notified - show popup');
      setCancelItemId(itemId);
      setCancelItemAction('remove');
      setCancelQuantity(item.quantity.toString());
      setShowCancelItemModal(true);
    } else {
      // Món chưa gửi bếp → Xóa trực tiếp
      console.log('[handleRemoveItem] ✅ Item not notified - remove directly');
      removeFromCart(itemId);
      playSound('beep');
    }
  };

  const handleDecreaseItem = (itemId: string, currentQuantity: number) => {
    const item = cart.find(i => i.id === itemId);
    if (!item) return;
    
    const notifiedQty = item.notifiedQuantity || 0;
    const nonNotifiedQty = item.quantity - notifiedQty;
    
    console.log('[handleDecreaseItem] 📊 Item quantities:', {
      itemName: item.name,
      total: item.quantity,
      notified: notifiedQty,
      nonNotified: nonNotifiedQty,
      decreasing: 1,
    });
    
    if (nonNotifiedQty >= 1) {
      // Giảm 1 <= số lượng chưa gửi bếp → Giảm trực tiếp, KHÔNG cần popup
      console.log('[handleDecreaseItem] ✅ Decrease within non-notified quantity - direct decrease');
      updateCartQuantity(itemId, Math.max(1, currentQuantity - 1));
      playSound('beep');
    } else {
      // Giảm vào món đã gửi bếp → Cần popup để nhập lý do
      console.log('[handleDecreaseItem] ⚠️ Decrease notified item - show popup');
      setCancelItemId(itemId);
      setCancelItemAction('decrease');
      setCancelQuantity('1');
      setShowCancelItemModal(true);
    }
  };

  const handleConfirmCancelItem = () => {
    console.log('[handleConfirmCancelItem] 🔥 Starting cancel item process');
    if (!cancelItemId || !currentOrderId) {
      console.warn('[handleConfirmCancelItem] ⚠️ Missing IDs:', { cancelItemId, currentOrderId });
      return;
    }

    const item = cart.find(i => i.id === cancelItemId);
    if (!item) {
      console.warn('[handleConfirmCancelItem] ⚠️ Item not found in cart');
      return;
    }
    
    // Validate cancel reason
    if (!cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy món');
      console.warn('[handleConfirmCancelItem] ⚠️ No cancel reason provided');
      return;
    }

    const qty = parseInt(cancelQuantity) || 1;
    
    // ✅ Validate: Không cho giảm quá số lượng hiện có
    if (qty > item.quantity) {
      toast.error(`Chỉ có thể giảm tối đa ${item.quantity} món`);
      return;
    }
    const currentUsername = localStorage.getItem('salepa_username') || 'Thu ngân';
    
    console.log('[handleConfirmCancelItem] 📝 Cancel details:', {
      itemName: item.name,
      action: cancelItemAction,
      quantity: qty,
      reason: cancelReason,
      user: currentUsername
    });

    // Kitchen order status is now tracked at order level, not item level
    toast.warning(`Đã ${cancelItemAction === 'remove' ? 'hủy' : 'giảm'} ${cancelItemAction === 'remove' ? item.quantity : qty} ${item.name}`, {
      description: cancelReason || undefined
    });

    // Update cart and calculate new cart items
    let updatedNotifiedItems = notifiedItems;
    let updatedCartItems = cart;
    
    if (cancelItemAction === 'remove') {
      removeFromCart(cancelItemId);
      // Remove from notified list
      updatedNotifiedItems = notifiedItems.filter(n => n.id !== cancelItemId);
      setNotifiedItems(updatedNotifiedItems);
      // Calculate updated cart (for order update)
      updatedCartItems = cart.filter(i => i.id !== cancelItemId);
    } else if (cancelItemAction === 'decrease') {
      // BÁN HÀNG: Giảm quantity thật sự (logic cũ)
      // Track cancelledQuantity chỉ để gửi cho BẾP
      
      const newQuantity = item.quantity - qty;
      
      console.log('[handleConfirmCancelItem] 📊 Decrease calculation:', {
        itemName: item.name,
        originalQuantity: item.quantity,
        decreasing: qty,
        newQuantity,
      });
      
      if (newQuantity <= 0) {
        // Remove item khỏi cart nếu hết
        updatedCartItems = cart.filter(i => i.id !== cancelItemId);
        setCart(updatedCartItems);
      } else {
        // ✅ FIX: Giảm quantity và cập nhật notifiedQuantity đúng
        const notifiedQty = item.notifiedQuantity || 0;
        const nonNotifiedQty = item.quantity - notifiedQty;
        
        // Tính toán số lượng giảm từng loại
        let qtyFromNonNotified = Math.min(qty, nonNotifiedQty);
        let qtyFromNotified = qty - qtyFromNonNotified;
        
        console.log('[handleConfirmCancelItem] 📊 Decrease breakdown:', {
          decreasing: qty,
          fromNonNotified: qtyFromNonNotified,
          fromNotified: qtyFromNotified,
        });
        
        // Giảm quantity thật sự
        updatedCartItems = cart.map(i => 
          i.id === cancelItemId ? { 
            ...i, 
            quantity: newQuantity,
            // notifiedQuantity giảm theo số lượng đã gửi bị hủy
            notifiedQuantity: Math.max(0, notifiedQty - qtyFromNotified),
            // Track cancelled cho BẾP (chỉ món đã gửi bếp)
            cancelledQuantity: (i.cancelledQuantity || 0) + qtyFromNotified,
            cancelReason: cancelReason,
          } : i
        );
        setCart(updatedCartItems);
      }
      
      // Update notified items (legacy support)
      const notifiedItem = notifiedItems.find(n => n.id === cancelItemId);
      if (notifiedItem) {
        const notifiedQty = item.notifiedQuantity || 0;
        const qtyFromNotified = Math.max(0, Math.min(qty, notifiedQty));
        const newNotifiedQty = notifiedItem.quantity - qtyFromNotified;
        if (newNotifiedQty <= 0) {
          updatedNotifiedItems = notifiedItems.filter(n => n.id !== cancelItemId);
        } else {
          updatedNotifiedItems = notifiedItems.map(n => 
            n.id === cancelItemId ? { ...n, quantity: newNotifiedQty } : n
          );
        }
        setNotifiedItems(updatedNotifiedItems);
      }
    }

    // *** Update order with order history ***
    if (currentOrderId) {
      const existingOrder = orders.find(o => o.id === currentOrderId);
      
      console.log('[handleConfirmCancelItem] 🔍 Existing order found:', {
        orderId: existingOrder?.id,
        hasOrderHistory: !!existingOrder?.orderHistory,
        orderHistoryType: typeof existingOrder?.orderHistory,
        orderHistoryIsArray: Array.isArray(existingOrder?.orderHistory),
        orderHistoryLength: existingOrder?.orderHistory?.length || 0
      });
      
      // Ensure orderHistory is always an array
      const orderHistory = Array.isArray(existingOrder?.orderHistory) 
        ? existingOrder.orderHistory 
        : [];
      
      console.log('[handleConfirmCancelItem] 📚 Existing order history:', orderHistory.length);
      
      // Create history entry
      const historyEntry = {
        id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: cancelItemAction === 'remove' ? ('cancel_item' as const) : ('decrease_quantity' as const),
        itemId: cancelItemId,
        itemName: item.name,
        quantity: cancelItemAction === 'remove' ? item.quantity : qty,
        reason: cancelReason,
        performedBy: currentUsername,
        performedAt: new Date().toISOString(),
        previousQuantity: item.quantity,
        newQuantity: cancelItemAction === 'remove' ? 0 : (item.quantity - qty),
      };
      
      console.log('[handleConfirmCancelItem] ✅ Created history entry:', historyEntry);
      
      const newOrderHistory = [...orderHistory, historyEntry];
      console.log('[handleConfirmCancelItem] 📝 New orderHistory array:', {
        length: newOrderHistory.length,
        entries: newOrderHistory
      });
      
      // F&B Restaurant: Tính subtotal với active quantity (trừ cancelled)
      const newSubtotal = updatedCartItems.reduce((sum, i) => {
        const activeQty = i.quantity - (i.cancelledQuantity || 0);
        return sum + (i.price * activeQty);
      }, 0);
      const orderUpdates = {
        items: updatedCartItems,
        subtotal: newSubtotal,
        total: newSubtotal - (orderDiscount || 0),
        notifiedItemIds: updatedNotifiedItems,
        orderHistory: newOrderHistory,
      };
      
      console.log('[handleConfirmCancelItem] 📦 Calling updateOrder with:', orderUpdates);
      updateOrder(currentOrderId, orderUpdates);
      
      console.log('[handleConfirmCancelItem] 💾 Updated order with history');
      
      // Verify the update by checking the store
      setTimeout(() => {
        const verifyOrder = orders.find(o => o.id === currentOrderId);
        console.log('[handleConfirmCancelItem] ✅ VERIFY after update:', {
          orderId: verifyOrder?.id,
          orderHistoryLength: verifyOrder?.orderHistory?.length || 0,
          orderHistory: verifyOrder?.orderHistory
        });
      }, 100);
      
      // *** Update kitchen orders to mark item as cancelled ***
      console.log('[handleConfirmCancelItem] 🔍 All kitchen orders:', kitchenOrders.map(ko => ({
        id: ko.id,
        orderId: ko.orderId,
        status: ko.status,
        items: ko.items.map(i => i.name)
      })));
      
      const relatedKitchenOrders = kitchenOrders.filter(
        ko => ko.orderId === currentOrderId && ko.status !== 'served'
      );
      
      console.log('[handleConfirmCancelItem] 🍳 Found kitchen orders to update:', relatedKitchenOrders.length);
      console.log('[handleConfirmCancelItem] 🔍 Related kitchen order IDs:', relatedKitchenOrders.map(ko => ko.id));
      
      if (relatedKitchenOrders.length === 0) {
        console.warn('[handleConfirmCancelItem] ⚠️ NO KITCHEN ORDERS FOUND FOR THIS ORDER!');
        console.warn('[handleConfirmCancelItem] ⚠️ currentOrderId:', currentOrderId);
        console.warn('[handleConfirmCancelItem] ⚠️ All orderId values:', kitchenOrders.map(ko => ko.orderId));
      }
      
      // Sort kitchen orders by createdAt (newest first) to cancel from latest orders
      const sortedKitchenOrders = [...relatedKitchenOrders].sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA; // Newest first
      });
      
      console.log('[handleConfirmCancelItem] 📅 Sorted kitchen orders (newest first):', sortedKitchenOrders.map(ko => ({
        id: ko.id,
        createdAt: ko.createdAt,
        items: ko.items.map(i => i.name)
      })));
      
      // Calculate quantity to cancel
      let remainingQtyToCancel = cancelItemAction === 'remove' ? item.quantity : qty;
      console.log('[handleConfirmCancelItem] 🔢 Total quantity to cancel:', remainingQtyToCancel);
      
      sortedKitchenOrders.forEach(kitchenOrder => {
        if (remainingQtyToCancel <= 0) {
          console.log('[handleConfirmCancelItem] ✅ Already cancelled enough quantity, skipping:', kitchenOrder.id);
          return;
        }
        
        console.log('[handleConfirmCancelItem] 🔄 Processing kitchen order:', kitchenOrder.id);
        console.log('[handleConfirmCancelItem] 📋 Kitchen order items before update:', kitchenOrder.items.map(i => ({
          id: i.id,
          name: i.name,
          quantity: i.quantity,
          cancelled: i.cancelled,
          cancelledQuantity: i.cancelledQuantity
        })));
        
        const updatedItems = kitchenOrder.items.map(koItem => {
          // Extract base ID (before timestamp suffix) for comparison
          const segments = koItem.id.split('-');
          let baseItemId = koItem.id;
          
          if (segments.length >= 3) {
            const lastSegment = segments[segments.length - 1];
            const secondLastSegment = segments[segments.length - 2];
            
            if (!isNaN(Number(lastSegment)) && !isNaN(Number(secondLastSegment)) && secondLastSegment.length >= 13) {
              baseItemId = segments.slice(0, -2).join('-');
            }
          }
          
          console.log('[handleConfirmCancelItem] 🔍 Comparing:', { 
            koItemId: koItem.id, 
            baseItemId, 
            cancelItemId, 
            match: baseItemId === cancelItemId,
            remainingQtyToCancel,
            koItemQuantity: koItem.quantity,
            alreadyCancelled: koItem.cancelled
          });
          
          // Only process if:
          // 1. Item ID matches
          // 2. Still have quantity to cancel
          // 3. Item is not already fully cancelled
          if (baseItemId === cancelItemId && remainingQtyToCancel > 0 && !koItem.cancelled) {
            const itemQty = koItem.quantity || 1;
            
            // *** FIX: Track accumulated cancelled quantity across multiple cancel actions ***
            const existingCancelledQty = koItem.cancelledQuantity || 0;
            const availableQtyToCancel = itemQty - existingCancelledQty;
            
            console.log('[handleConfirmCancelItem] 🔍 Cancel calculation:', {
              itemName: koItem.name,
              totalQuantity: itemQty,
              previouslyCancelled: existingCancelledQty,
              availableToCancel: availableQtyToCancel,
              requestedToCancel: remainingQtyToCancel
            });
            
            if (availableQtyToCancel <= 0) {
              // Already fully cancelled, skip
              console.log('[handleConfirmCancelItem] ⏭️ Item already fully cancelled, skipping');
              return koItem;
            }
            
            // Calculate how much we can cancel from this item
            const actualQtyToCancel = Math.min(availableQtyToCancel, remainingQtyToCancel);
            const newTotalCancelledQty = existingCancelledQty + actualQtyToCancel;
            remainingQtyToCancel -= actualQtyToCancel;
            
            console.log('[handleConfirmCancelItem] ✅ Cancelling item:', {
              itemName: koItem.name,
              cancellingNow: actualQtyToCancel,
              newTotalCancelled: newTotalCancelledQty,
              fullyGone: newTotalCancelledQty >= itemQty
            });
            
            return {
              ...koItem,
              cancelled: newTotalCancelledQty >= itemQty, // Fully cancelled if accumulated total >= original quantity
              cancelReason: cancelReason, // Always update to latest reason
              cancelledQuantity: newTotalCancelledQty, // Accumulated total across all cancel actions
            };
          }
          return koItem;
        });
        
        console.log('[handleConfirmCancelItem] 📋 Kitchen order items after update:', updatedItems.map(i => ({
          id: i.id,
          name: i.name,
          quantity: i.quantity,
          cancelled: i.cancelled,
          cancelledQuantity: i.cancelledQuantity,
          cancelReason: i.cancelReason
        })));
        
        console.log('[handleConfirmCancelItem] 🔄 Calling updateKitchenOrderItems with:', {
          kitchenOrderId: kitchenOrder.id,
          updatedItems: updatedItems.map(i => ({
            id: i.id,
            name: i.name,
            cancelled: i.cancelled,
            cancelReason: i.cancelReason
          }))
        });
        updateKitchenOrderItems(kitchenOrder.id, updatedItems);
        console.log('[handleConfirmCancelItem] ✅ Kitchen order update call completed');
      });
      
      console.log('[handleConfirmCancelItem] 🎯 Final remaining quantity to cancel:', remainingQtyToCancel);
      if (remainingQtyToCancel > 0) {
        console.warn('[handleConfirmCancelItem] ⚠️ WARNING: Could not cancel all requested quantity!');
      }
    }
    
    console.log('[handleConfirmCancelItem] 🎉 Cancel item process completed');
    
    // Check if all items in cart are now cancelled (for notification)
    const remainingItems = cart.filter(item => !item.cancelled);
    
    // ✅ FIX: Kiểm tra xem còn kitchen orders ACTIVE không để hiển thị toast đúng
    const activeKitchenOrders = currentOrderId ? kitchenOrders.filter(
      ko => ko.orderId === currentOrderId && ko.status !== 'served'
    ) : [];
    
    console.log('[handleConfirmCancelItem] 🔍 Active kitchen orders after cancel:', activeKitchenOrders.length);
    
    if (remainingItems.length === 0 && cart.length > 0 && activeKitchenOrders.length === 0) {
      // Thực sự hủy hết tất cả → bàn trống
      toast.success('Đã xóa toàn bộ đơn hàng - Bàn đã trở về trạng thái trống');
    } else if (remainingItems.length === 0 && cart.length > 0) {
      // Hủy hết giỏ hàng nhưng còn kitchen orders → chỉ hủy đơn bổ sung
      toast.success('Đã hủy món gọi bổ sung - Đơn chính vẫn còn');
    } else {
      toast.success('Đã hủy món thành công');
    }

    // Reset modal
    setShowCancelItemModal(false);
    setCancelItemId(null);
    setCancelItemAction(null);
    setCancelQuantity('1');
    setCancelReason('');
  };

  const handleNotifyKitchen = () => {
    if (cart.length === 0) {
      toast.error('Giỏ hàng trống');
      return;
    }
    
    // Check if all items are cancelled
    const activeCarts = cart.filter(item => !item.cancelled);
    if (activeCarts.length === 0) {
      toast.error('Tất cả món đã bị hủy');
      return;
    }
    
    if (!selectedTableId) {
      toast.error('Vui lòng chọn bàn');
      return;
    }
    
    // Get items that are new OR have increased quantity (and not cancelled)
    const itemsToNotify = cart.filter(item => {
      if (item.cancelled) return false; // Skip cancelled items
      const notifiedItem = notifiedItems.find(n => n.id === item.id);
      if (!notifiedItem) return true; // Món mới
      return item.quantity > notifiedItem.quantity; // Số lượng tăng
    }).map(item => {
      const notifiedItem = notifiedItems.find(n => n.id === item.id);
      const notifiedQty = notifiedItem?.quantity || 0;
      // Only send the increased quantity
      const itemToNotify = {
        ...item,
        quantity: item.quantity - notifiedQty
      };
      
      // Log if item has note
      if (item.note) {
        console.log('[handleNotifyKitchen] 📝 Sending item with note:', item.name, '- Note:', item.note);
      }
      
      return itemToNotify;
    });
    
    // Get items that only have note changes (no quantity change, already notified)
    const itemsToUpdateNote = cart.filter(item => {
      if (item.cancelled) return false;
      const notifiedItem = notifiedItems.find(n => n.id === item.id);
      if (!notifiedItem) return false; // Món mới → đã handle ở itemsToNotify
      if (item.quantity !== notifiedItem.quantity) return false; // Số lượng thay đổi → đã handle ở itemsToNotify
      
      // Chỉ check món có ghi chú thay đổi
      const currentNote = item.note || '';
      const notifiedNote = (notifiedItem as any).note || '';
      return currentNote !== notifiedNote;
    });
    
    console.log('[handleNotifyKitchen] 📊 Items to notify (new/qty increase):', itemsToNotify.length);
    console.log('[handleNotifyKitchen] 📝 Items to update note only:', itemsToUpdateNote.length);
    
    if (itemsToNotify.length === 0 && itemsToUpdateNote.length === 0) {
      toast.info('Không có món mới hoặc thay đổi để thông báo');
      return;
    }
    
    // Create or update order first
    let orderId = currentOrderId;
    
    console.log('[handleNotifyKitchen] 🔍 Current orderId before:', orderId);
    
    if (!orderId) {
      // Create new pending order
      const newOrder = createOrder({
        paymentMethod: 'cash',
        customerName,
        customerPhone,
        discount: 0,
        note: orderNote,
        status: 'pending',
        orderType: 'dine-in',
        tableId: selectedTableId,
        tableName: selectedTableName,
        tableNumber: selectedTableName ? parseInt(selectedTableName.match(/\d+/)?.[0] || '0') : undefined,
        notifiedItemIds: [],
        timestamp: ''
      });
      
      orderId = newOrder.id;
      setCurrentOrderId(orderId);
      setEditingOrderId(orderId);
      
      console.log('[handleNotifyKitchen] ✅ Created new order:', orderId);
      
      // Note: Trạng thái bàn tự động = 'occupied' vì có order với status='pending'
      assignOrderToTable(selectedTableId, orderId);
    } else {
      // Update existing order with current data
      updateOrder(orderId, {
        items: cart,
        subtotal,
        total: subtotal,
        customerName,
        customerPhone,
        discount: orderDiscount,
        note: orderNote,
      });
      
      console.log('[handleNotifyKitchen] ✅ Updated existing order:', orderId);
    }
    
    // Create kitchen order with items to notify (new items or quantity increase)
    if (itemsToNotify.length > 0) {
      const kitchenOrder = createKitchenOrder(orderId, itemsToNotify);
      console.log('[handleNotifyKitchen] ✅ Created kitchen order:', kitchenOrder?.id, 'for orderId:', orderId);
    }
    
    // Update note for existing items in kitchen orders
    if (itemsToUpdateNote.length > 0) {
      console.log('[handleNotifyKitchen] 📝 Updating notes for existing items:', itemsToUpdateNote.map(i => i.name));
      
      const relatedKitchenOrders = kitchenOrders.filter(
        ko => ko.orderId === orderId && ko.status !== 'served'
      );
      
      relatedKitchenOrders.forEach(kitchenOrder => {
        console.log('[handleNotifyKitchen] 🍳 Updating notes in kitchen order:', kitchenOrder.id);
        
        const updatedItems = kitchenOrder.items.map(koItem => {
          // Extract base ID for comparison
          const segments = koItem.id.split('-');
          let baseItemId = koItem.id;
          
          if (segments.length >= 3) {
            const lastSegment = segments[segments.length - 1];
            const secondLastSegment = segments[segments.length - 2];
            
            if (!isNaN(Number(lastSegment)) && !isNaN(Number(secondLastSegment)) && secondLastSegment.length >= 13) {
              baseItemId = segments.slice(0, -2).join('-');
            }
          }
          
          // Find matching cart item that needs note update
          const cartItemWithNewNote = itemsToUpdateNote.find(cartItem => {
            return baseItemId === cartItem.id || koItem.name === cartItem.name;
          });
          
          if (cartItemWithNewNote) {
            console.log('[handleNotifyKitchen] ✅ Updating note for:', koItem.name, '- New note:', cartItemWithNewNote.note);
            return {
              ...koItem,
              note: cartItemWithNewNote.note || ''
            };
          }
          
          return koItem;
        });
        
        updateKitchenOrderItems(kitchenOrder.id, updatedItems);
      });
    }
    
    // Update notified items list with current quantities and notes
    const updatedNotifiedItems = cart.map(item => ({
      id: item.id,
      quantity: item.quantity,
      note: item.note || '' // Lưu ghi chú đã thông báo
    }));
    setNotifiedItems(updatedNotifiedItems);
    
    // *** FIX: Update order with new notifiedItemIds + notifiedQuantity ***
    const updatedCartWithNotified = cart.map(item => ({
      ...item,
      notifiedQuantity: item.quantity, // Set notifiedQuantity = current quantity
    }));
    
    // ✅ CRITICAL: Update cart state with notifiedQuantity
    setCart(updatedCartWithNotified);
    
    updateOrder(orderId, {
      items: updatedCartWithNotified, // Lưu items với notifiedQuantity
      subtotal,
      total: subtotal,
      notifiedItemIds: updatedNotifiedItems, // Lưu vào order để load lại được
    });
    
    // Calculate total items sent
    const totalItemsSent = itemsToNotify.reduce((sum, item) => sum + item.quantity, 0);
    
    // Show appropriate message
    if (itemsToNotify.length > 0 && itemsToUpdateNote.length > 0) {
      toast.success(`Đã gửi ${totalItemsSent} món mới và cập nhật ghi chú ${itemsToUpdateNote.length} món cho bếp`);
    } else if (itemsToNotify.length > 0) {
      const existingOrder = currentOrderId && orders.find(o => o.id === currentOrderId);
      const isAddingItems = existingOrder && existingOrder.items && existingOrder.items.length > 0;
      toast.success(`Đã gửi ${totalItemsSent} món (${itemsToNotify.length} loại) cho bếp`, {
        description: isAddingItems ? '✨ Đơn bếp mới đã được tạo cho món thêm vào' : undefined,
      });
    } else if (itemsToUpdateNote.length > 0) {
      toast.success(`Đã cập nhật ghi chú ${itemsToUpdateNote.length} món cho bếp`);
    }
    
    playSound('success');
  };

  const handleCompletePaymentRestaurant = () => {
    if (cart.length === 0) {
      toast.error('Giỏ hàng trống');
      return;
    }
    
    if (!selectedTableId) {
      toast.error('Vui lòng chọn bàn');
      return;
    }
    
    // Validate amount
    const receivedAmt = parseFloat(customerAmount || '0');
    if (receivedAmt < total) {
      toast.error('Số tiền nhận không đủ');
      return;
    }
    
    const calculatedChange = receivedAmt - total;
    const currentUser = localStorage.getItem('salepa_username') || '';
    
    const initialPaymentHistory = [{
      id: `PAY-${Date.now()}`,
      amount: receivedAmt,
      paymentMethod: paymentMethod,
      paidAt: new Date().toISOString(),
      paidBy: currentUser,
      note: orderNote || '',
      changeAmount: calculatedChange,
    }];
    
    const extractTableNumber = (tableName: string): number | undefined => {
      const match = tableName.match(/\d+/);
      return match ? parseInt(match[0]) : undefined;
    };
    
    // Create/update completed order
    const orderData = {
      paymentMethod,
      customerName,
      customerPhone,
      discount,
      note: orderNote,
      status: 'completed' as const,
      paidAt: new Date().toISOString(),
      receivedAmount: receivedAmt,
      changeAmount: calculatedChange,
      paymentHistory: initialPaymentHistory,
      orderType: 'dine-in' as const,
      tableId: selectedTableId,
      tableName: selectedTableName,
      tableNumber: extractTableNumber(selectedTableName),
      notifiedItemIds: cart.map(item => ({ id: item.id, quantity: item.quantity })), // Mark all as notified
    };
    
    // If editing existing order, delete it first
    if (currentOrderId) {
      deleteOrder(currentOrderId);
    }
    
    const createdOrder = createOrder(orderData);
    
    // Kitchen orders will be auto-served by createOrder action (when order.status = 'completed')
    
    // Note: Bàn tự động về 'available' vì order có status='completed'
    clearTable(selectedTableId);
    
    // Show receipt
    const createdOrderData = {
      id: createdOrder.id,
      items: cart,
      subtotal,
      discount,
      total,
      date: new Date().toISOString(),
      paymentMethod,
      customerName,
      customerPhone,
      note: orderNote,
      receivedAmount: receivedAmt,
      changeAmount: calculatedChange,
      paymentHistory: initialPaymentHistory,
    };
    
    setCompletedOrder(createdOrderData);
    setShowReceipt(true);
    
    toast.success('✅ Thanh toán thành công!', {
      description: `${selectedTableName} | Tổng: ${total.toLocaleString()}đ | Thừa: ${calculatedChange.toLocaleString()}đ`,
      duration: 3000,
    });
    
    playSound('success');
    
    // Close checkout modal immediately
    setShowCheckout(false);
    
    // Auto-close receipt after 3 seconds, then reset everything and return to table selection
    setTimeout(() => {
      handleCloseReceipt();
    }, 3000);
  };

  // Check if there are items not yet notified or with increased quantity or changed note
  const hasUnnotifiedItems = cart.some(item => {
    const notifiedItem = notifiedItems.find(n => n.id === item.id);
    if (!notifiedItem) return true; // Món mới
    if (item.quantity > notifiedItem.quantity) return true; // Số lượng tăng
    // Check if note changed
    const currentNote = item.note || '';
    const notifiedNote = (notifiedItem as any).note || '';
    if (currentNote !== notifiedNote) return true; // Ghi chú thay đổi
    return false;
  });

  // Get status display info for cart items
  const getItemStatusDisplay = (itemId: string) => {
    console.log('[getItemStatusDisplay] 🔍 START - itemId:', itemId, 'currentOrderId:', currentOrderId);
    
    const notifiedItem = notifiedItems.find(n => n.id === itemId);
    
    if (!notifiedItem) {
      console.log('[getItemStatusDisplay] ⚠️ Item not notified yet');
      return { 
        icon: null, 
        text: '', 
        color: '',
        bgColor: '',
        showBadge: false 
      };
    }
    
    // ✅ NEW LOGIC: With multiple kitchen orders per orderId, we simplify the status display
    // Just show "Sent to kitchen" for all notified items
    // Detailed status tracking is done in the Kitchen Orders Screen
    
    const cartItem = cart.find(item => item.id === itemId);
    const notifiedQty = notifiedItem.quantity;
    const currentQty = cartItem?.quantity || 0;
    
    // Check if there are pending items (not yet notified)
    if (currentQty > notifiedQty) {
      // Some items are pending notification
      return { 
        icon: Bell, 
        text: `${notifiedQty}/${currentQty} đã gửi`, 
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        showBadge: true 
      };
    }
    
    // All items notified
    return { 
      icon: Check, 
      text: 'Đã gửi bếp', 
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      showBadge: true 
    };
  };

  // Tạo danh sách bàn từ tableAreas với trạng thái tự động từ orders
  const tables = tableAreas?.filter(area => area.status === 'active')
    .map(area => {
      // Tìm order đang active cho bàn này
      const activeOrder = orders.find(o => 
        o.tableId === area.id && 
        o.status !== 'completed' && 
        o.orderType === 'dine-in'
      );
      
      return {
        id: area.id,
        name: area.name,
        area: area.area || '',
        status: activeOrder ? 'occupied' as const : 'available' as const,
        capacity: 4, // Default capacity, có thể customize sau
        currentOrderId: activeOrder?.id,
        qrCode: `QR-${area.id}`,
      };
    });

  // Filter tables
  const filteredTables = tables?.filter(table => {
    if (tableFilter === 'available') return table.status === 'available';
    if (tableFilter === 'occupied') return table.status === 'occupied';
    return true;
  });

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
      
      // ⭐ NEW: Save original order state for cancel edit feature
      // Wait for cart to be fully loaded before saving snapshot
      setTimeout(() => {
        setOriginalOrderState({
          cart: [...cart],
          customerName: editingOrder.customerName || '',
          customerPhone: editingOrder.customerPhone || '',
          selectedCustomerId: editingOrder.customerId || '',
          orderDiscount: editingOrder.discount || 0,
          orderNote: editingOrder.note || '',
          paymentMethod: (editingOrder.paymentMethod || 'cash') as PaymentMethodType,
          notifiedItems: editingOrder.notifiedItemIds || [],
        });
      }, 100);
      
      // Clear editingOrder from store after loading
      setEditingOrder(null);
      
      // Show notification
      toast.success('📝 Đã tải hóa đơn để chỉnh sửa', {
        description: `Mã HĐ: ${editingOrder.orderNumber || `#${editingOrder.id.slice(-8).toUpperCase()}`}`,
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
              onClick={handleClearCart}
              disabled={cart.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-600 hover:bg-gray-50 rounded-lg transition-all text-sm font-medium disabled:opacity-50 border border-gray-200"
              title="Clear Cart (F10)"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden md:inline">{t.clearCart}</span>
            </button>
            
            {/* Cancel Edit Button - only show when editing */}
            {editingOrderId && (
              <button
                onClick={() => {
                  // ⭐ NEW: Restore original order state instead of clearing
                  if (originalOrderState) {
                    // Restore cart
                    setCart([...originalOrderState.cart]);
                    
                    // Restore customer info
                    setCustomerName(originalOrderState.customerName);
                    setCustomerPhone(originalOrderState.customerPhone);
                    setSelectedCustomerId(originalOrderState.selectedCustomerId);
                    
                    // Restore order info
                    setOrderDiscount(originalOrderState.orderDiscount);
                    setOrderNote(originalOrderState.orderNote);
                    setPaymentMethod(originalOrderState.paymentMethod);
                    
                    // Restore notified items
                    setNotifiedItems(originalOrderState.notifiedItems);
                  }
                  
                  // Clear editing state
                  setEditingOrderId(null);
                  setOriginalOrderState(null);
                  
                  toast.info('Đã hủy chỉnh sửa và khôi phục đơn hàng về trạng thái ban đầu');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all text-sm font-medium border border-red-200"
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
              <span className="hidden lg:inline">{t.recent}</span>
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
              <input
                ref={barcodeInputRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder={t.scanBarcode || 'Quét mã vạch (F8)'}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
              />
            </div>
          </form>

          {/* Right - Customer Display & Print */}
          
        </div>
      </div>

      {/* F&B Main Tabs (Chọn bàn / Mang đi / Thực đơn) */}
      {isFoodBeverage && (
        <div className="bg-white border-b border-gray-200">
          <div className="px-4 py-3">
            <div className="flex gap-2">
              <button
                onClick={() => setMainTab('table-select')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  mainTab === 'table-select'
                    ? 'bg-[#FE7410] text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Grid className="w-5 h-5" />
                Chọn bàn
              </button>
              <button
                onClick={() => setMainTab('takeaway')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  mainTab === 'takeaway'
                    ? 'bg-[#FE7410] text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
                Mang đi
              </button>
              <button
                onClick={() => setMainTab('menu')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  mainTab === 'menu'
                    ? 'bg-[#FE7410] text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <UtensilsCrossed className="w-5 h-5" />
                Thực đơn
              </button>
              
              {/* Show selected table info */}
              {selectedTableId && (
                <div className="flex items-center gap-2 ml-auto px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-700">{selectedTableName}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Bar - Only show in menu tab for F&B */}
      {(!isFoodBeverage || mainTab === 'menu') && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-2 sm:px-4 py-2 sm:py-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              {/* Search */}
              <div className="flex-1 sm:max-w-xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Tìm kiếm sản phẩm - Tên sản phẩm, Mã sản phẩm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-orange-500 focus:bg-white transition-all text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1.5 sm:gap-2">
              {[
                { id: 'all' as const, icon: Grid3x3, label: t.all },
                { id: 'recent' as const, icon: Clock, label: t.recent },
                { id: 'favorite' as const, icon: Star, label: t.favorites },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all text-xs sm:text-sm ${
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
            <div className="hidden sm:flex border border-gray-200 rounded-lg overflow-hidden">
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
            {(isFoodBeverage ? [
              { id: 'all' as const, icon: Grid, label: 'Tất cả loại', color: 'gray' },
              { id: 'food' as const, icon: UtensilsCrossed, label: 'Món ăn', color: 'orange' },
              { id: 'combo' as const, icon: Package, label: 'Combo', color: 'blue' },
              { id: 'inventory' as const, icon: Package, label: 'Sản phẩm thường', color: 'green' },
            ] : [
              { id: 'all' as const, icon: Grid, label: t.allTypes || 'Tất cả loại', color: 'gray' },
              { id: 'service' as const, icon: Scissors, label: t.service || 'Dịch vụ', color: 'blue' },
              { id: 'treatment' as const, icon: Sparkles, label: t.treatment || 'Liệu trình', color: 'purple' },
            ]).map((filter) => (
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
                  {t.allCategories || t.all}
                </button>
                {filteredCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
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
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* F&B Takeaway Tab */}
        {isFoodBeverage && mainTab === 'takeaway' ? (
          <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style>{`
              .flex-1.overflow-y-auto::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            
            {/* Header with Create Button */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Đơn mang đi</h2>
                <p className="text-gray-600 mt-1">Quản lý các đơn hàng mang đi</p>
              </div>
              <button
                onClick={handleCreateTakeawayOrder}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all"
                style={{ backgroundColor: '#FE7410' }}
              >
                <Plus className="w-5 h-5" />
                Tạo đơn mới
              </button>
            </div>

            {/* Takeaway Orders Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {orders
                .filter(o => o.orderType === 'takeaway' && o.status !== 'completed')
                .filter(o => o.items.length > 0) // Ẩn đơn không có món
                .map((order) => {
                  const isSelected = currentOrderId === order.id;
                  const totalItems = order.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
                  
                  return (
                    <button
                      key={order.id}
                      onClick={() => handleSelectTakeawayOrder(order)}
                      className={`relative p-6 rounded-xl border-2 transition-all hover:shadow-lg ${
                        isSelected
                          ? 'bg-[#FE7410] border-[#FE7410] text-white shadow-xl scale-105'
                          : 'bg-white border-orange-300 hover:border-orange-500'
                      }`}
                    >
                      {/* Icon */}
                      <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
                        isSelected
                          ? 'bg-white/20'
                          : 'bg-orange-100'
                      }`}>
                        <ShoppingBag className={`w-8 h-8 ${
                          isSelected
                            ? 'text-white'
                            : 'text-orange-600'
                        }`} />
                      </div>

                      {/* Order Name */}
                      <div className={`font-bold text-lg mb-1 ${
                        isSelected ? 'text-white' : 'text-gray-900'
                      }`}>
                        {order.tableName || 'Mang đi'}
                      </div>

                      {/* Order Info */}
                      <div className={`text-sm mb-2 ${
                        isSelected ? 'text-white/90' : 'text-gray-600'
                      }`}>
                        {totalItems} món • {order.total.toLocaleString()}đ
                      </div>

                      {/* Customer Name if exists */}
                      {order.customerName && (
                        <div className={`text-xs ${
                          isSelected ? 'text-white/80' : 'text-gray-500'
                        }`}>
                          {order.customerName}
                        </div>
                      )}

                      {/* Selected Indicator */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-[#FE7410]" />
                        </div>
                      )}
                    </button>
                  );
                })}
            </div>

            {/* Empty State */}
            {orders.filter(o => o.orderType === 'takeaway' && o.status !== 'completed').length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-orange-50 flex items-center justify-center">
                  <ShoppingBag className="w-12 h-12 text-orange-400" />
                </div>
                <p className="text-gray-500 text-lg mb-2">Chưa có đơn mang đi nào</p>
                <p className="text-gray-400 text-sm mb-6">Nhấn "Tạo đơn mới" để bắt đầu</p>
                <button
                  onClick={handleCreateTakeawayOrder}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all"
                  style={{ backgroundColor: '#FE7410' }}
                >
                  <Plus className="w-5 h-5" />
                  Tạo đơn mới
                </button>
              </div>
            )}
          </div>
        ) : isFoodBeverage && mainTab === 'table-select' ? (
          <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style>{`
              .flex-1.overflow-y-auto::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            
            {/* Table Filter */}
            <div className="mb-6">
              <div className="flex gap-3">
                <button
                  onClick={() => setTableFilter('all')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    tableFilter === 'all'
                      ? 'bg-[#FE7410] text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Tất cả bàn ({tables?.length})
                </button>
                <button
                  onClick={() => setTableFilter('available')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    tableFilter === 'available'
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Bàn trống ({tables?.filter(t => t.status === 'available').length})
                </button>
                <button
                  onClick={() => setTableFilter('occupied')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    tableFilter === 'occupied'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Đang sử dụng ({tables?.filter(t => t.status === 'occupied').length})
                </button>
              </div>
            </div>

            {/* Table Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredTables?.map((table) => {
                const isSelected = selectedTableId === table.id;
                const isAvailable = table.status === 'available';
                const isOccupied = table.status === 'occupied';
                
                return (
                  <button
                    key={table?.id}
                    onClick={() => handleSelectTable(table)}
                    className={`relative p-6 rounded-xl border-2 transition-all hover:shadow-lg ${
                      isSelected
                        ? 'bg-[#FE7410] border-[#FE7410] text-white shadow-xl scale-105'
                        : isAvailable
                        ? 'bg-white border-green-300 hover:border-green-500'
                        : 'bg-red-50 border-red-300 hover:border-red-500'
                    }`}
                  >
                    {/* Table Icon */}
                    <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
                      isSelected
                        ? 'bg-white/20'
                        : isAvailable
                        ? 'bg-green-100'
                        : 'bg-red-100'
                    }`}>
                      <Grid className={`w-8 h-8 ${
                        isSelected
                          ? 'text-white'
                          : isAvailable
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`} />
                    </div>

                    {/* Table Name */}
                    <div className={`font-bold text-lg mb-1 ${
                      isSelected ? 'text-white' : 'text-gray-900'
                    }`}>
                      {table?.name}
                    </div>

                    {/* Table Status */}
                    <div className={`text-sm ${
                      isSelected
                        ? 'text-white/90'
                        : isAvailable
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {isAvailable ? 'Trống' : 'Đang dùng'}
                    </div>

                    {/* Selected Indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-[#FE7410]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {filteredTables?.length === 0 && (
              <div className="text-center py-12">
                <Grid className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Không có bàn nào</p>
              </div>
            )}
          </div>
        ) : (
          /* Left Side - Products (Menu Tab) */
          <div className="flex-1 overflow-y-auto p-2 sm:p-3 pb-20 xl:pb-3" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style>{`
            .flex-1.overflow-y-auto::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-3">
              {displayProducts.map((product) => {
                const categoryImg = product.image || getCategoryImage(product.category, product.productType);
                return (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product.id)}
                    className="group bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 cursor-pointer hover:shadow-2xl transition-all border-2 border-gray-200 hover:border-orange-500 relative"
                  >
                    {/* Product Image */}
                    {categoryImg ? (
                      <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-3 relative">
                        <img 
                          src={categoryImg} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
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
                      <h3 className="text-gray-900 text-xs sm:text-sm md:text-base line-clamp-2 leading-snug mb-2 transition-colors min-h-[1.8rem] sm:min-h-[2.5rem] font-bold">
                        {product.name}
                      </h3>
                      
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm sm:text-base md:text-lg font-bold text-gray-900">
                          {(product.price || 0).toLocaleString()}
                        </div>
                        {product.productType === 'inventory' && (
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
                        {product.price.toLocaleString()}{isFoodBeverage && product.unit ? `đ/${product.unit}` : 'đ'}
                      </div>
                      {product.productType !== 'service' && product.productType !== 'treatment' && (
                        <div className="text-sm text-gray-500">{product.stock} {t.inStock}</div>
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
              <p className="text-lg">{t.noProducts}</p>
            </div>
          )}
        </div>
        )}

        {/* Right Side - Cart - Hidden on mobile, visible from xl */}
        <div className="hidden xl:flex xl:w-[420px] 2xl:w-[480px] bg-white border-l border-gray-200 flex-col shadow-lg">
          {/* Cart Header - Light Orange Theme */}
          <div className="bg-white border-b border-gray-200 p-3">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h2 className="text-lg font-bold text-gray-700">{t.currentOrder}</h2>
              <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-lg">
                <span className="text-xl font-bold text-[#FE7410]">{cart.length}</span>
                <span className="text-xs text-gray-600">{t.products}</span>
              </div>
            </div>
            
            {/* Customer Input with Search & Add Quick Button */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <input
                    type="text"
                    placeholder={t.searchCustomer || 'Tìm khách hàng...'}
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
                  title={t.addNew || 'Thêm khách hàng mới'}
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
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <ShoppingBag className="w-16 h-16 mb-3" />
                <p className="text-base">{t.emptyCart}</p>
                <p className="text-sm mt-2 text-center">{t.addProductsToStart}</p>
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
                      {item.productType === 'combo' ? (
                        <Package className="w-6 h-6" style={{ color: '#FE7410' }} />
                      ) : (
                        <ShoppingBag className="w-6 h-6" style={{ color: '#FE7410' }} />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-base line-clamp-1">{item.name}</h3>
                      {item.productType === 'combo' && item.comboItems && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          {item.comboItems.map((comboItem, idx) => (
                            <span key={idx}>
                              {comboItem.productName} x{comboItem.quantity}
                              {idx < item.comboItems.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                      )}
                      {/* Display selected options */}
                      {item.selectedOptions && item.selectedOptions.length > 0 && (
                        <div className="text-xs text-gray-600 mt-0.5 space-y-0.5">
                          {item.selectedOptions.map((option, idx) => (
                            <div key={idx} className="flex items-center gap-1">
                              <span className="text-gray-500">•</span>
                              <span>{option.choiceName}</span>
                              {option.priceModifier !== 0 && (
                                <span className="text-[#FE7410] font-semibold">
                                  ({option.priceModifier > 0 ? '+' : ''}{option.priceModifier.toLocaleString()}đ)
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-2 flex-wrap mt-0.5">
                        <div>
                          <div className="text-lg font-bold" style={{ color: '#FE7410' }}>
                            {(item.price || 0).toLocaleString()}{isFoodBeverage && item.unit ? `đ/${item.unit}` : 'đ'}
                          </div>
                          {/* Display note below price */}
                          {item.note && (
                            <div 
                              className="text-xs text-gray-600 mt-0.5 truncate max-w-[180px] group relative flex items-center gap-1"
                              title={item.note}
                            >
                              <FileText className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{item.note}</span>
                              {/* Tooltip on hover */}
                              <div className="hidden group-hover:block absolute left-0 top-full mt-1 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg z-10 whitespace-normal max-w-[250px]">
                                {item.note}
                              </div>
                            </div>
                          )}
                        </div>
                        {/* Kitchen Status Badge for F&B */}
                        {isFoodBeverage && (() => {
                          const statusDisplay = getItemStatusDisplay(item.id);
                          if (statusDisplay.showBadge && statusDisplay.icon) {
                            const StatusIcon = statusDisplay.icon;
                            return (
                              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${statusDisplay.bgColor}`}>
                                <StatusIcon className={`w-3 h-3 ${statusDisplay.color}`} />
                                <span className={`text-[10px] font-bold ${statusDisplay.color} uppercase`}>
                                  {statusDisplay.text}
                                </span>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveItem(item.id);
                      }}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quantity Controls */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDecreaseItem(item.id, item.quantity);
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
                        <div className="text-xs text-gray-500">{t.subtotal}</div>
                        <div className="text-base font-bold text-gray-900">
                          {((item.price || 0) * (item.quantity || 0)).toLocaleString()}đ
                        </div>
                      </div>
                    </div>

                    {/* Note Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenItemNote(item.id);
                      }}
                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all ${
                        item.note 
                          ? 'bg-orange-100 border border-orange-300 text-orange-700 hover:bg-orange-200' 
                          : 'bg-gray-100 border border-gray-300 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={item.note ? `Ghi chú: ${item.note}` : 'Thêm ghi chú'}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span className="text-xs">{item.note ? 'Có ghi chú' : 'Ghi chú'}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary & Checkout */}
          <div className="border-t border-gray-200 p-2 sm:p-3 space-y-2 sm:space-y-3 bg-gray-50">
            {/* Discount Section - Quick buttons + Input in one row */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Quick Discount Buttons */}
              {quickDiscounts.map((percent) => (
                <button
                  key={percent}
                  onClick={() => handleQuickDiscount(percent)}
                  className="px-2 sm:px-2.5 py-1 sm:py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-300 transition-all whitespace-nowrap"
                >
                  -{percent}%
                </button>
              ))}
              
              {/* Discount Input */}
              <div className="flex items-center gap-2 bg-white border-2 border-gray-200 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 flex-1 min-w-0">
                <Percent className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="number"
                  placeholder={t.discount}
                  value={orderDiscount || ''}
                  onChange={(e) => setOrderDiscount(parseFloat(e.target.value) || 0)}
                  className="flex-1 outline-none text-sm sm:text-base min-w-0"
                />
                <span className="text-sm text-gray-500">đ</span>
              </div>
            </div>

            {/* Voucher Input */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-white border-2 border-gray-200 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 flex-1">
                <Tag className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="NHẬP MÃ VOUCHER"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  className="flex-1 outline-none text-sm sm:text-base min-w-0 uppercase"
                />
              </div>
              <button
                onClick={() => {
                  if (voucherCode.trim()) {
                    // TODO: Xử lý logic áp dụng voucher
                    toast.success('Voucher đã được áp dụng!');
                    playSound('success');
                  }
                }}
                disabled={!voucherCode.trim()}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#FE7410] text-white rounded-lg hover:bg-[#E56809] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold whitespace-nowrap"
              >
                Áp dụng
              </button>
            </div>

            {/* Tip Input - Only show if enabled in settings */}
            {settings.enableTip && (
              <div className="flex items-center gap-2 bg-white border-2 border-gray-200 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
                <Gift className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="number"
                  placeholder={t.tip || 'Tip'}
                  value={tipAmount || ''}
                  onChange={(e) => setTipAmount(parseFloat(e.target.value) || 0)}
                  className="flex-1 outline-none text-sm sm:text-base min-w-0"
                />
                <span className="text-sm text-gray-500">đ</span>
              </div>
            )}

            {/* Totals - Simplified */}
            <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 border-2 border-gray-200">
              <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-1.5">
                <span>{t.subtotal}:</span>
                <span className="font-semibold text-sm sm:text-base">{subtotal.toLocaleString()}đ</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-xs sm:text-sm text-red-600 mb-1.5">
                  <span>{t.discount}:</span>
                  <span className="font-semibold text-sm sm:text-base">-{discount.toLocaleString()}đ</span>
                </div>
              )}
              {tip > 0 && (
                <div className="flex justify-between text-xs sm:text-sm text-green-600 mb-1.5">
                  <span>{t.tip || 'Tip'}:</span>
                  <span className="font-semibold text-sm sm:text-base">+{tip.toLocaleString()}đ</span>
                </div>
              )}
              <div className="border-t-2 border-gray-200 pt-2 flex justify-between items-center">
                <span className="text-sm sm:text-base font-bold text-gray-900">{t.total}:</span>
                <span className="text-xl sm:text-2xl font-bold text-[#FE7410]">
                  {total.toLocaleString()}đ
                </span>
              </div>
            </div>

            {/* Checkout Button - Orange Highlight */}
            {isFoodBeverage ? (
              /* F&B: Notify Kitchen + Payment buttons - NGANG HÀNG */
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleNotifyKitchen}
                  disabled={cart.length === 0 || !selectedTableId || !hasUnnotifiedItems}
                  className="bg-blue-600 text-white py-2.5 sm:py-3.5 rounded-xl hover:bg-blue-700 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base sm:text-lg font-bold"
                >
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                  Thông báo
                </button>
                <button
                  onClick={() => {
                    if (!selectedTableId) {
                      toast.error('Vui lòng chọn bàn');
                      return;
                    }
                    setShowCheckout(true);
                  }}
                  disabled={cart.length === 0 || !selectedTableId}
                  className="bg-[#FE7410] text-white py-2.5 sm:py-3.5 rounded-xl hover:bg-[#E56809] hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base sm:text-lg font-bold"
                >
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                  {t.checkout}
                </button>
              </div>
            ) : (
              /* Non-F&B: Normal checkout button */
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full bg-[#FE7410] text-white py-2.5 sm:py-3.5 rounded-xl hover:bg-[#E56809] hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base sm:text-lg font-bold"
              >
                <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                {t.checkout} <span className="hidden sm:inline">(F9)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Quantity Modal */}
      {showQuickQuantity && selectedProductForQty && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="bg-gray-100 border-b-2 border-gray-200 p-3 sm:p-4 rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-700">{t.enterAmount || 'Enter Quantity'}</h2>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="text-center">
                <p className="text-gray-600 mb-2">
                  {products.find(p => p.id === selectedProductForQty)?.name}
                </p>
                <input
                  type="number"
                  value={quickQuantity}
                  onChange={(e) => setQuickQuantity(e.target.value)}
                  className="w-full text-center text-3xl sm:text-4xl font-bold border-2 border-gray-300 rounded-xl py-3 sm:py-4 focus:outline-none focus:border-gray-500"
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
                    className="p-3 sm:p-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-xl sm:text-2xl font-bold"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={() => setQuickQuantity('1')}
                  className="p-3 sm:p-4 bg-red-100 hover:bg-red-200 rounded-lg text-xl font-bold text-red-600"
                >
                  C
                </button>
                <button
                  onClick={() => setQuickQuantity(prev => prev === '1' ? '0' : prev + '0')}
                  className="p-3 sm:p-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-xl sm:text-2xl font-bold"
                >
                  0
                </button>
                <button
                  onClick={() => setQuickQuantity(prev => prev.length > 1 ? prev.slice(0, -1) : '1')}
                  className="p-3 sm:p-4 bg-yellow-100 hover:bg-yellow-200 rounded-lg text-xl font-bold text-yellow-700"
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
                  className="flex-1 bg-gray-200 text-gray-700 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-bold hover:bg-gray-300"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleAddWithQuantity}
                  className="flex-1 bg-[#FE7410] text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-bold hover:bg-[#E56809] hover:shadow-lg"
                >
                  {t.add}
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
              <h2 className="text-xl font-bold text-gray-700">{t.recentOrders} ({recentTransactions.length})</h2>
              <button onClick={() => setShowRecentTransactions(false)} className="p-1 hover:bg-gray-200 rounded-lg text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
              {recentTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Receipt className="w-16 h-16 mx-auto mb-3" />
                  <p>{t.noOrders}</p>
                </div>
              ) : (
                recentTransactions.map((order) => (
                  <div key={order.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-400 transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-bold text-gray-900">{order.customerName || t.walkInCustomer}</div>
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
                      {order.items.length} {t.items} • {order.items.reduce((sum, item) => sum + item.quantity, 0)} {t.products}
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
              <h2 className="text-xl font-bold" style={{ color: '#FE7410' }}>{t.savedBills} ({heldBills.length})</h2>
              <button onClick={() => setShowHeldBills(false)} className="p-1 rounded-lg transition-colors" style={{ color: '#FE7410' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFEDD5'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
              {heldBills.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <PauseCircle className="w-16 h-16 mx-auto mb-3" />
                  <p>{t.noBillsHeld}</p>
                </div>
              ) : (
                heldBills.map((bill) => (
                  <div key={bill.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 transition-all" style={{ borderColor: bill.id === bill.id ? '#FED7AA' : '#E5E7EB' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#FE7410'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-bold text-gray-900">{bill.customerName || t.walkInCustomer}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(bill.heldAt).toLocaleString()} • {bill.items.length} {t.items}
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
                        {t.loadBill}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(t.deleteBill + '?')) {
                            deleteHeldBill(bill.id);
                            playSound('beep');
                          }
                        }}
                        className="px-4 bg-red-100 text-red-600 py-2 rounded-lg font-medium hover:bg-red-200 transition-all"
                      >
                        {t.delete}
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
              <h2 className="text-3xl font-bold mb-2">{t.customerDisplay}</h2>
              <p className="mb-8" style={{ color: '#FFEDD5' }}>{t.currentOrder}</p>

              {cart.length === 0 ? (
                <div className="py-12">
                  <ShoppingBag className="w-20 h-20 mx-auto mb-4 opacity-50" />
                  <p className="text-xl" style={{ color: '#FFEDD5' }}>{t.welcomeCustomer}</p>
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
                    <div className="text-2xl font-bold">{t.total}:</div>
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
                  <h2 className="text-2xl font-bold" style={{ color: '#FE7410' }}>{t.payment}</h2>
                  <p className="text-sm mt-1" style={{ color: '#E56809' }}>{t.completeOrder}</p>
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
                    {t.paymentMethod}
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
                     {t.customerAmount || 'Tiền khách đưa'}
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
                        <span className="text-gray-700 font-semibold text-base">{t.change || 'Tiền thừa trả khách'}:</span>
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
                      <span>{t.subtotal}:</span>
                      <span className="font-semibold text-lg">{subtotal.toLocaleString()}đ</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-base text-red-600">
                        <span>{t.discount}:</span>
                        <span className="font-semibold text-lg">-{discount.toLocaleString()}đ</span>
                      </div>
                    )}
                    {tip > 0 && (
                      <div className="flex justify-between text-base text-green-600">
                        <span>{t.tip || 'Tip'}:</span>
                        <span className="font-semibold text-lg">+{tip.toLocaleString()}đ</span>
                      </div>
                    )}
                    <div className="border-t-2 pt-3 flex justify-between items-center" style={{ borderColor: '#FE7410' }}>
                      <span className="text-xl font-bold text-gray-900">{t.total}:</span>
                      <span className="text-3xl font-bold" style={{ color: '#FE7410' }}>
                        {total.toLocaleString()}đ
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Note */}
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-3">
                    {t.note || 'Ghi chú'}
                  </label>
                  <textarea
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    placeholder={t.addNoteOptional || 'Thêm ghi chú cho đơn hàng '}
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
                {t.completePayment || 'Hoàn thành'}
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
          onClose={handleCloseReceipt}
        />
      )}

      {/* Cancel Item Confirmation Modal */}
      {showCancelItemModal && cancelItemId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {cancelItemAction === 'remove' ? 'Xác nhận hủy món' : 'Xác nhận giảm số lượng'}
                </h3>
                <p className="text-sm text-gray-500">Món đã được thông báo cho bếp</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên món
                </label>
                <p className="text-base font-semibold text-gray-900">
                  {cart.find(i => i.id === cancelItemId)?.name}
                </p>
              </div>

              {cancelItemAction === 'decrease' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số lượng cần giảm
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={cart.find(i => i.id === cancelItemId)?.quantity || 1}
                    value={cancelQuantity}
                    onChange={(e) => setCancelQuantity(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do hủy món <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Nhập lý do hủy món..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelItemModal(false);
                  setCancelItemId(null);
                  setCancelItemAction(null);
                  setCancelQuantity('1');
                  setCancelReason('');
                }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmCancelItem}
                disabled={!cancelReason.trim()}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Note Modal */}
      {showItemNote && selectedItemForNote && (() => {
        const item = cart.find(i => i.id === selectedItemForNote);
        
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Edit3 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Ghi chú món</h3>
                  <p className="text-sm text-gray-500">{item?.name}</p>
                </div>
              </div>

              <div className="mb-6">
                <textarea
                  value={itemNote}
                  onChange={(e) => setItemNote(e.target.value)}
                  placeholder="Ví dụ: Ít đường, nhiều đá, không hành..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent resize-none"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowItemNote(false);
                    setSelectedItemForNote(null);
                    setItemNote('');
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveItemNote}
                  className="flex-1 px-4 py-3 text-white rounded-lg transition-colors font-bold"
                  style={{ backgroundColor: '#FE7410' }}
                >
                  {itemNote ? 'Lưu' : 'Xóa ghi chú'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Floating Cart Button - Mobile Only (< xl) */}
      <button
        onClick={() => setShowMobileCart(true)}
        className="xl:hidden fixed bottom-6 right-6 w-16 h-16 bg-[#FE7410] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50"
      >
        <ShoppingBag className="w-7 h-7" />
        {cart.length > 0 && (
          <span className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full text-sm flex items-center justify-center font-bold">
            {cart.length}
          </span>
        )}
      </button>

      {/* Mobile Cart Modal - Full Screen */}
      {showMobileCart && (
        <div className="xl:hidden fixed inset-0 bg-white z-50 flex flex-col">
          {/* Mobile Cart Header */}
          <div className="bg-white border-b border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-gray-700">{t.currentOrder}</h2>
              <button
                onClick={() => setShowMobileCart(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-lg w-fit">
              <span className="text-xl font-bold text-[#FE7410]">{cart.length}</span>
              <span className="text-xs text-gray-600">{t.products}</span>
            </div>
          </div>

          {/* Mobile Cart Items - Same as desktop cart items */}
          <div className="flex-1 overflow-y-auto p-3" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style>{`
              .flex-1.overflow-y-auto::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <ShoppingBag className="w-16 h-16 mb-3" />
                <p className="text-base text-center">{t.emptyCart}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="bg-gray-50 rounded-lg p-2 sm:p-3">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm sm:text-base mb-0.5 truncate">{item.name}</h4>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-base sm:text-lg font-bold text-[#FE7410]">
                            {item.price.toLocaleString()}đ
                          </span>
                          
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <button
                              onClick={() => handleDecreaseItem(item.id, item.quantity)}
                              className="w-7 h-7 sm:w-8 sm:h-8 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                            >
                              <Minus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                            </button>
                            
                            <div className="w-12 sm:w-14 h-7 sm:h-8 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                              <span className="font-bold text-gray-900 text-sm sm:text-base">{item.quantity}</span>
                            </div>
                            
                            <button
                              onClick={() => {
                                updateCartQuantity(item.id, item.quantity + 1);
                              }}
                              className="w-7 h-7 sm:w-8 sm:h-8 bg-[#FE7410] rounded-lg flex items-center justify-center hover:bg-[#E56609] transition-colors"
                            >
                              <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                            </button>
                            
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="w-7 h-7 sm:w-8 sm:h-8 bg-red-50 border-2 border-red-200 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors"
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Summary & Checkout */}
          {cart.length > 0 && (
            <div className="border-t border-gray-200 p-3 space-y-3 bg-white">
              <div className="bg-gray-50 p-3 rounded-xl space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t.subtotal}</span>
                  <span className="font-semibold text-gray-900">{subtotal.toLocaleString()}đ</span>
                </div>
                
                {orderDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t.discount}</span>
                    <span className="font-semibold text-red-600">-{orderDiscount.toLocaleString()}đ</span>
                  </div>
                )}
                
                <div className="h-px bg-gray-200 my-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-gray-700">{t.total}</span>
                  <span className="text-xl sm:text-2xl font-bold text-[#FE7410]">{total.toLocaleString()}đ</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowMobileCart(false);
                  setShowCheckout(true);
                }}
                disabled={cart.length === 0}
                className="w-full text-white py-2.5 sm:py-3.5 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 text-base sm:text-lg font-bold disabled:opacity-50"
                style={{ backgroundColor: '#FE7410' }}
              >
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                {t.checkout}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ModernSalesScreen;