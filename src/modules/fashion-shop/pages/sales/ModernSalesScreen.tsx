import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../../../lib/fashion-shop-lib/store';
import { useTranslation } from '../../../../lib/fashion-shop-lib/useTranslation';
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
import { CardPaymentForm, type CardData } from '../../components/forms/CardPaymentForm';
import { QRPaymentForm, type QRPaymentData } from '../../components/forms/QRPaymentForm';
import { Receipt as ReceiptModal } from '../../components/common/Receipt';
import { CustomerForm } from '../../components/forms/CustomerForm';
import { VariantSelectionModal } from '../../components/modals/VariantSelectionModal';
import { api } from '../../../../lib/fashion-shop-lib/api';
import type { ProductVariant } from '../../../../lib/fashion-shop-lib/mockProductData_fashion_only';

type PaymentMethodType = 'cash' | 'card' | 'transfer' | 'momo' | 'zalopay' | 'vnpay';

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
    deleteHeldBill,
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
    loadProductsFromMockAPI  // Load products from mock API
  } = useStore();
  const { t } = useTranslation();
  
  // Load products from Mock API on mount
  useEffect(() => {
    loadProductsFromMockAPI();
  }, [loadProductsFromMockAPI]);
  
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
  const [showBarcodeHelp, setShowBarcodeHelp] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedProductForVariant, setSelectedProductForVariant] = useState<any>(null);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerName, setCustomerName] = useState('Khách lạ'); // Default to walk-in customer
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(''); // Empty = walk-in customer
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('cash');
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
  const [isScannerActive, setIsScannerActive] = useState(false); // Visual indicator for scanner ready
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [manualDiscount, setManualDiscount] = useState(0); // Discount from quick buttons or manual input
  const [manualDiscountType, setManualDiscountType] = useState<'percent' | 'fixed'>('percent'); // Type of manual discount
  const [manualDiscountInput, setManualDiscountInput] = useState(''); // Input value for manual discount
  const searchInputRef = useRef<HTMLInputElement>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const scanTimestampRef = useRef<number>(0); // Detect scanner speed
  const autoSubmitTimerRef = useRef<NodeJS.Timeout | null>(null); // Timer for auto-submit

  // Calculate totals (use variantPrice if available)
  const subtotal = cart.reduce((sum, item) => sum + ((item.variantPrice || item.price || 0) * (item.quantity || 0)), 0);
  const tip = tipAmount || 0;
  
  // Calculate manual discount
  const calculatedManualDiscount = manualDiscountType === 'percent' 
    ? (subtotal * manualDiscount) / 100 
    : manualDiscount;
  
  const discount = voucherDiscount + calculatedManualDiscount;
  const total = Math.max(0, subtotal + tip - discount);
  const change = customerAmount ? Math.max(0, parseFloat(customerAmount) - total) : 0;

  // Filter products
  const filteredProducts = (products || []).filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Use all categories
  const filteredCategories = categories;

  // Get display products based on active tab
  const displayProducts = activeTab === 'recent' 
    ? recentProducts
    : activeTab === 'favorite'
    ? favoriteProducts
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

  // Process barcode logic (shared by manual submit and auto-submit)
  const processBarcode = async (barcodeText: string) => {
    if (!barcodeText.trim()) return;

    const barcode = barcodeText.trim().toUpperCase(); // Normalize barcode
    
    // BƯỚC 1: Tìm variant theo barcode trước (ưu tiên cao nhất)
    try {
      const variantResponse = await api.getProductVariantByBarcode(barcode);
      
      if (variantResponse.success && variantResponse.data) {
        const variant = variantResponse.data;
        
        // Tìm sản phẩm gốc của variant này (variant.product_id lưu product CODE)
        const product = products.find(p => p.code === variant.product_id);
        
        if (product) {
          // Thêm sản phẩm với thông tin variant vào giỏ hàng
          const productWithVariant = {
            ...product,
            variantId: variant._id,
            variantCode: variant.sku,
            variantTitle: variant.title,
            variantPrice: variant.price,
            price: variant.price || product.price, // Ưu tiên giá variant
          };
          
          addToCart(productWithVariant);
          addToRecent(product.id);
          playSound('success');
          toast.success(`✅ Đã thêm: ${product.name}`, {
            description: `Phân loại: ${variant.title} | Giá: ${(variant.price || product.price).toLocaleString()}đ`,
            duration: 1500,
          });
          setBarcodeInput('');
          setIsScannerActive(true);
          // Auto-focus back to barcode input for continuous scanning
          setTimeout(() => {
            barcodeInputRef.current?.focus();
            setIsScannerActive(false);
          }, 50);
          return; // Thành công, thoát hàm
        }
      }
    } catch (error) {
      console.log('No variant found with barcode');
      // BƯỚC 2: Không tìm thấy variant theo barcode
      playSound('error');
      toast.error(`❌ Không tìm thấy sản phẩm`, {
        description: `Mã vạch: ${barcode}`,
        duration: 2000,
      });
      setBarcodeInput(''); // Clear invalid barcode for next scan
      // Keep focus for next scan
      setTimeout(() => barcodeInputRef.current?.focus(), 100);
    }
  };

  // Handle barcode form submit (Enter key)
  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Clear any pending auto-submit timer
    if (autoSubmitTimerRef.current) {
      clearTimeout(autoSubmitTimerRef.current);
      autoSubmitTimerRef.current = null;
    }
    await processBarcode(barcodeInput);
  };

  // Handle barcode input change with auto-submit
  const handleBarcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const now = Date.now();
    const timeDiff = now - scanTimestampRef.current;
    scanTimestampRef.current = now;
    
    setBarcodeInput(value);

    // Clear previous timer
    if (autoSubmitTimerRef.current) {
      clearTimeout(autoSubmitTimerRef.current);
      autoSubmitTimerRef.current = null;
    }

    // Detect hardware scanner: typing speed < 50ms per character = scanner
    const isHardwareScanner = timeDiff < 50 && value.length > 1;
    
    // Auto-submit ONLY for manual entry (hardware scanners send Enter automatically)
    // PRD-0001 (8), PRD-0001-M (10), PRD-0001-BLACK (14), etc.
    const trimmedValue = value.trim();
    if (!isHardwareScanner && trimmedValue.length >= 8 && /^[A-Z0-9-]+$/i.test(trimmedValue)) {
      // Wait 500ms after user stops typing, then auto-submit
      autoSubmitTimerRef.current = setTimeout(async () => {
        if (barcodeInputRef.current?.value === value) {
          await processBarcode(trimmedValue);
        }
      }, 500);
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSubmitTimerRef.current) {
        clearTimeout(autoSubmitTimerRef.current);
      }
    };
  }, []);

  // Handle product click - Check for variants first
  const handleProductClick = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Always check for variants - products should have at least one variant
    try {
      const variantsResponse = await api.getProductVariantsByProduct(productId);
      const variants = variantsResponse.success && variantsResponse.data ? variantsResponse.data : [];
      
      if (variants.length > 1) {
        // Multiple variants - show variant selection modal
        setSelectedProductForVariant(product);
        setShowVariantModal(true);
        playSound('beep');
      } else if (variants.length === 1) {
        // Only one variant - add directly with variant info
        const variant = variants[0];
        
        // Get inventory for this variant
        const inventoriesResponse = await api.getInventories();
        const inventory = inventoriesResponse.success && inventoriesResponse.data 
          ? inventoriesResponse.data.find((inv: any) => inv.variant_id === variant._id)
          : null;
        
        const productWithVariant = {
          ...product,
          id: variant._id,
          variantId: variant._id,
          variantCode: variant.sku,
          variantTitle: variant.title,
          variantPrice: variant.price,
          price: variant.price || product.price,
          stock: inventory?.on_hand || 0,
          barcode: variant.barcode,
        };
        
        addToCart(productWithVariant);
        addToRecent(productId);
        playSound('beep');
        toast.success(`✅ Đã thêm: ${product.name}`);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      } else {
        // No variants - show warning
        toast.error('❌ Sản phẩm này chưa có phân loại', {
          description: 'Vui lòng tạo phân loại cho sản phẩm trước khi bán',
        });
        playSound('error');
      }
    } catch (error) {
      console.error('Error checking variants:', error);
      toast.error('❌ Lỗi khi tải thông tin sản phẩm');
      playSound('error');
    }
  };
  
  // Handle variant selection
  const handleVariantSelect = (variant: ProductVariant & { quantity: number }) => {
    if (!selectedProductForVariant) return;
    
    // Add product with variant info to cart
    const productWithVariant = {
      ...selectedProductForVariant,
      id: variant._id, // Use variant ID as cart item ID
      variantId: variant._id,
      variantCode: variant.sku,
      variantTitle: variant.title,
      variantPrice: variant.price,
      price: variant.price || selectedProductForVariant.price, // Use variant price if available
      stock: variant.quantity, // Use variant stock from inventory
      barcode: variant.barcode,
    };
    
    addToCart(productWithVariant);
    addToRecent(selectedProductForVariant.id);
    playSound('success');
    
    toast.success(`✅ Đã thêm: ${selectedProductForVariant.name}`, {
      description: `Phân loại: ${variant.title} | Giá: ${(variant.price || selectedProductForVariant.price).toLocaleString()}đ | Còn: ${variant.quantity}`,
      duration: 2000,
    });
    
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

  const handleApplyVoucher = () => {
    if (!voucherCode.trim()) {
      toast.error('Vui lòng nhập mã voucher');
      return;
    }

    // Mock voucher validation - In real app, call API
    const mockVouchers: any = {
      'GIAM10': { type: 'percent', value: 10, maxDiscount: 100000 },
      'GIAM20': { type: 'percent', value: 20, maxDiscount: 200000 },
      'GIAM50K': { type: 'fixed', value: 50000 },
      'GIAM100K': { type: 'fixed', value: 100000 },
    };

    const voucher = mockVouchers[voucherCode.toUpperCase()];
    
    if (!voucher) {
      toast.error('Mã voucher không hợp lệ');
      return;
    }

    let discountAmount = 0;
    if (voucher.type === 'percent') {
      discountAmount = (subtotal * voucher.value) / 100;
      if (voucher.maxDiscount) {
        discountAmount = Math.min(discountAmount, voucher.maxDiscount);
      }
    } else {
      discountAmount = voucher.value;
    }

    setAppliedVoucher(voucher);
    setVoucherDiscount(discountAmount);
    toast.success(`Đã áp dụng voucher giảm ${discountAmount.toLocaleString()}đ`);
  };

  const handleRemoveVoucher = () => {
    setVoucherCode('');
    setAppliedVoucher(null);
    setVoucherDiscount(0);
    toast.info('Đã xóa voucher');
  };

  const handleQuickDiscount = (percent: number) => {
    setManualDiscountType('percent');
    setManualDiscount(percent);
    setManualDiscountInput(percent.toString());
    toast.success(`Đã áp dụng giảm giá ${percent}%`);
  };

  const handleApplyManualDiscount = () => {
    const value = parseFloat(manualDiscountInput) || 0;
    if (value < 0) {
      toast.error('Giá trị giảm giá không hợp lệ');
      return;
    }
    
    if (manualDiscountType === 'percent' && value > 100) {
      toast.error('Giảm giá không thể vượt quá 100%');
      return;
    }
    
    setManualDiscount(value);
    const discountAmount = manualDiscountType === 'percent' 
      ? (subtotal * value) / 100 
      : value;
    toast.success(`Đã áp dụng giảm giá ${discountAmount.toLocaleString()}đ`);
  };

  const handleClearManualDiscount = () => {
    setManualDiscount(0);
    setManualDiscountInput('');
    toast.info('Đã xóa giảm giá');
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      playSound('error');
      toast.error(t('emptyCart') || 'Giỏ hàng trống');
      return;
    }
    // No validation needed - default to walk-in customer if not selected
    setShowCheckout(true);
  };

  const handleCompletePayment = async () => {
    // Validate amount for all payment methods
    const receivedAmt = parseFloat(customerAmount || '0');
    
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

    // Create order with receipt info
    const orderData = {
      paymentMethod,
      customerName,
      customerPhone,
      note: orderNote,
      status: 'completed', // ✅ Always completed when payment is processed
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
    
    // Get the created order ID
    const orderId = createdOrder?.id || `ORD-${Date.now()}`;
    
    // 🔥 Tạo inventory transactions để trừ tồn kho
    try {
      const { api } = await import('../../../../lib/fashion-shop-lib/api');
      for (const item of cart) {
        try {
          // Use variantId and productId from item (added by loadProductsFromMockAPI)
          if (item.variantId && item.productId) {
            await api.inventorySaleOut(
              item.variantId,
              item.productId,
              item.quantity,
              orderId,
              `Bán hàng - ${orderNote || 'Đơn bán lẻ'}`
            );
            console.log(`✅ [Sale] Reduced inventory for ${item.name}: -${item.quantity}`);
          } else {
            console.warn(`⚠️ [Sale] Item ${item.name} missing variantId or productId, skipping inventory update`);
          }
        } catch (error) {
          console.error(`Failed to reduce inventory for ${item.name}:`, error);
        }
      }
    } catch (error) {
      console.error('Failed to process inventory transactions:', error);
    }
    
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
    setCustomerName('Khách lạ'); // Reset to walk-in customer
    setCustomerPhone('');
    setSelectedCustomerId('');
    setCustomerSearchQuery('');
    setCustomerAmount('');
    setTipAmount(0);
    setPaymentMethod('cash');
    setOrderNote('');
    setEditingOrderId(null); // Clear editing mode
    setVoucherCode('');
    setAppliedVoucher(null);
    setVoucherDiscount(0);
    setManualDiscount(0);
    setManualDiscountInput('');
    setManualDiscountType('percent');
    
    // Auto-focus search
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  const handleHoldBill = () => {
    if (cart.length === 0) {
      playSound('error');
      alert(t('emptyCart'));
      return;
    }
    holdBill(customerName);
    setCustomerName('Khách lạ'); // Reset to walk-in customer
    playSound('success');
    alert(t('billHeld'));
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    if (confirm(t('clearCart') + '?')) {
      cart.forEach(item => removeFromCart(item.id));
      setCustomerName('Khách lạ'); // Reset to walk-in customer
      setCustomerPhone('');
      setSelectedCustomerId('');
      setCustomerSearchQuery('');
      setVoucherCode('');
      setAppliedVoucher(null);
      setVoucherDiscount(0);
      setManualDiscount(0);
      setManualDiscountInput('');
      setManualDiscountType('percent');
      playSound('beep');
    }
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

  // Auto-focus barcode scanner on mount and when modals close
  useEffect(() => {
    // Focus barcode input when no modal is open
    if (!showCheckout && !showHeldBills && !showCustomerDisplay && !showQuickQuantity && !showReceipt && !showAddCustomerModal && !showBarcodeHelp && !showVariantModal) {
      setTimeout(() => barcodeInputRef.current?.focus(), 100);
    }
  }, [showCheckout, showHeldBills, showCustomerDisplay, showQuickQuantity, showReceipt, showAddCustomerModal, showBarcodeHelp, showVariantModal]);

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
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Top Toolbar - COMPACT for POS */}
      <div className="bg-white border-b border-gray-200 px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between">
          {/* Left - Quick Actions */}
          <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2">
            <button
              onClick={handleHoldBill}
              className="flex items-center gap-1 px-2 py-1.5 sm:px-2.5 sm:py-2 bg-white text-gray-600 hover:bg-gray-50 rounded-lg transition-all text-xs sm:text-sm font-medium border border-gray-200 min-h-[40px]"
              title="Hold Bill (F3)"
            >
              <PauseCircle className="w-4 h-4" />
              <span className="hidden xl:inline">{t('holdBill')}</span>
            </button>
            
            <button
              onClick={() => setShowHeldBills(true)}
              className="flex items-center gap-1 px-2 py-1.5 sm:px-2.5 sm:py-2 bg-white text-gray-600 hover:bg-gray-50 rounded-lg transition-all text-xs sm:text-sm font-medium relative border border-gray-200 min-h-[40px]"
              title="Recall Bill (F4)"
            >
              <PlayCircle className="w-4 h-4" />
              <span className="hidden xl:inline">{t('recallBill')}</span>
              {heldBills.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full text-[10px] sm:text-xs flex items-center justify-center font-bold text-white">
                  {heldBills.length}
                </span>
              )}
            </button>

            <button
              onClick={handleClearCart}
              disabled={cart.length === 0}
              className="flex items-center gap-1 px-2 py-1.5 sm:px-2.5 sm:py-2 bg-white text-gray-600 hover:bg-gray-50 rounded-lg transition-all text-xs sm:text-sm font-medium disabled:opacity-50 border border-gray-200 min-h-[40px]"
              title="Clear Cart (F10)"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden xl:inline">{t('clearCart')}</span>
            </button>
            
            {/* Cancel Edit Button - only show when editing */}
            {editingOrderId && (
              <button
                onClick={() => {
                  handleClearCart();
                  setEditingOrderId(null);
                  toast.info('Đã hủy chỉnh sửa hóa đơn');
                }}
                className="flex items-center gap-1 px-2 py-1.5 sm:px-2.5 sm:py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all text-xs sm:text-sm font-medium border border-red-200 min-h-[40px]"
                title="Hủy sửa hóa đơn"
              >
                <X className="w-4 h-4" />
                <span className="hidden xl:inline">Hủy sửa</span>
              </button>
            )}

            <button
              onClick={() => setShowRecentTransactions(true)}
              className="hidden sm:flex items-center gap-1 px-2 py-1.5 sm:px-2.5 sm:py-2 bg-white text-gray-600 hover:bg-gray-50 rounded-lg transition-all text-xs sm:text-sm font-medium border border-gray-200 min-h-[40px]"
              title="Recent Transactions"
            >
              <History className="w-4 h-4" />
              <span className="hidden xl:inline">{t('recent')}</span>
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`flex items-center gap-1 px-2 py-1.5 sm:px-2.5 sm:py-2 rounded-lg transition-all text-xs sm:text-sm font-medium border min-h-[40px] ${
                soundEnabled ? 'bg-gray-100 text-gray-700 border-gray-300' : 'bg-white text-gray-400 border-gray-200'
              }`}
              title="Toggle Sound"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            
            {/* Editing Mode Indicator */}
            {editingOrderId && (
              <div className="hidden lg:flex items-center gap-1.5 px-2 py-1.5 bg-blue-50 border-2 border-blue-500 rounded-lg animate-pulse">
                <Edit2 className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold text-blue-700">Đang sửa HĐ</span>
              </div>
            )}
          </div>

          {/* Center - Barcode Scanner - RESPONSIVE */}
          <div className="flex-1 max-w-xs sm:max-w-sm lg:max-w-md mx-2 sm:mx-4 flex items-center gap-1.5 sm:gap-2">
            <form onSubmit={handleBarcodeSubmit} className="flex-1 min-w-0">
              <div className="relative">
                <Barcode className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  ref={barcodeInputRef}
                  type="text"
                  value={barcodeInput}
                  onChange={handleBarcodeChange}
                  onFocus={() => setIsScannerActive(true)}
                  onBlur={() => setIsScannerActive(false)}
                  placeholder="Quét barcode (F8)"
                  className={`w-full pl-8 sm:pl-10 pr-8 py-1.5 sm:py-2 rounded-lg bg-white border-2 text-gray-900 placeholder-gray-400 focus:outline-none text-xs sm:text-sm font-medium transition-all min-h-[40px] ${
                    isScannerActive ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200 focus:border-[#FE7410]'
                  }`}
                />
                {barcodeInput && (
                  <button
                    type="button"
                    onClick={() => setBarcodeInput('')}
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                )}
              </div>
            </form>
            
            {/* Scanner Status Badge - COMPACT */}
            <div className={`hidden sm:flex items-center gap-1.5 px-2 py-1.5 rounded-lg border transition-all ${
              isScannerActive 
                ? 'bg-green-50 border-green-500 animate-pulse' 
                : 'bg-gray-100 border-gray-200'
            }`}>
              {isScannerActive ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-semibold text-green-700 hidden lg:inline">Sẵn sàng</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-bold text-gray-700">{products.length}</span>
                </>
              )}
            </div>
            
            {/* Barcode Help Button */}
            <button
              onClick={() => setShowBarcodeHelp(true)}
              className="hidden sm:flex p-1.5 sm:p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-200 min-h-[40px] items-center justify-center"
              title="Hướng dẫn sử dụng máy quét barcode"
            >
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Right - Customer Display & Print */}
          
        </div>
      </div>

      {/* Search & Filter Bar - COMPACT */}
      <div className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
        <div className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search */}
            <div className="flex-1 max-w-xs sm:max-w-md lg:max-w-xl">
              <div className="relative">
                <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Tìm sản phẩm (F2)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 sm:pl-10 pr-3 py-1.5 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-orange-500 focus:bg-white transition-all text-sm sm:text-base min-h-[40px]"
                />
              </div>
            </div>

            {/* Tabs - COMPACT */}
            <div className="flex gap-1 sm:gap-2">
              {[
                { id: 'all' as const, icon: Grid3x3, label: t('all') },
                { id: 'recent' as const, icon: Clock, label: t('recent') },
                { id: 'favorite' as const, icon: Star, label: t('favorites') },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all min-h-[40px] ${
                    activeTab === tab.id
                      ? 'bg-gray-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="font-medium text-xs sm:text-sm hidden lg:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* View Toggle */}
            <div className="hidden sm:flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-gray-200 text-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Grid3x3 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 border-l border-gray-200 ${viewMode === 'list' ? 'bg-gray-200 text-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <List className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Stats */}
            
          </div>
        </div>

        {/* Categories Filter - COMPACT */}
        <div className="px-2 sm:px-3 lg:px-4 pb-1.5 sm:pb-2">
          <div className="flex gap-2 items-center overflow-x-auto scrollbar-thin">
            {/* Category Filter - text-only display */}
            {activeTab === 'all' && (
              <>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all min-h-[36px] ${
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
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all min-h-[36px] ${
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
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Side - Products */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-3">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-3">
              {displayProducts.map((product) => {
                const categoryImg = product.image || getCategoryImage(product.category, product.productType);
                return (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product.id)}
                    className="group bg-white rounded-xl p-2 sm:p-3 cursor-pointer hover:shadow-2xl transition-all border-2 border-gray-200 hover:border-orange-500 relative min-h-[180px] sm:min-h-[220px]"
                  >
                    {/* Product Image */}
                    {categoryImg ? (
                      <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-2 relative">
                        <img 
                          src={categoryImg} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {/* Product Type Badge */}
                        {product.productType && (
                          <div className={`absolute top-1 left-1 px-1.5 py-0.5 rounded-md text-[10px] sm:text-xs font-bold shadow-md ${
                            product.productType === 'product' ? 'bg-green-500 text-white' :
                            product.productType === 'service' ? 'bg-blue-500 text-white' :
                            'bg-purple-500 text-white'
                          }`}>
                            {product.productType === 'product' ? 'SP' :
                             product.productType === 'service' ? 'DV' : 
                             'LT'}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center mb-2 group-hover:bg-gray-200 transition-all">
                        <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                      </div>
                    )}

                    {/* Favorite */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(product.id);
                        playSound('beep');
                      }}
                      className="absolute top-1 right-1 p-1 sm:p-1.5 bg-white/90 rounded-lg hover:bg-white transition-all shadow-sm"
                    >
                      <Star className={`w-3 h-3 sm:w-4 sm:h-4 ${favoriteProducts.some(p => p.id === product.id) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                    </button>

                    {/* Product Info */}
                    <div>
                      <h3 className="text-gray-900 text-sm sm:text-base line-clamp-2 leading-snug mb-1.5 transition-colors min-h-[2rem] sm:min-h-[2.5rem] font-bold">
                        {product.name}
                      </h3>
                      
                      <div className="flex items-center justify-between gap-1">
                        <div className="text-base sm:text-lg font-bold text-gray-900 truncate">
                          {(product.price || 0).toLocaleString()}
                        </div>
                        {product.productType !== 'service' && product.productType !== 'treatment' && (
                          <div className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded-md font-medium ${
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
                        <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                          <Clock className="w-3 h-3 inline mr-0.5" />
                          {product.duration}p
                        </div>
                      )}
                      {product.sessions && (
                        <div className="text-[10px] sm:text-xs text-purple-600 mt-0.5 font-medium">
                          <Sparkles className="w-3 h-3 inline mr-0.5" />
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

        {/* Right Side - Cart - RESPONSIVE WIDTH */}
        <div className="w-full sm:w-80 md:w-96 lg:w-[420px] xl:w-[480px] 2xl:w-[520px] bg-white border-l border-gray-200 flex flex-col shadow-lg">
          {/* Cart Header - COMPACT */}
          <div className="bg-white border-b border-gray-200 p-2 sm:p-2.5 flex-shrink-0">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <h2 className="text-base sm:text-lg font-bold text-gray-700">{t('currentOrder')}</h2>
              <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg">
                <span className="text-lg sm:text-xl font-bold text-[#FE7410]">{cart.length}</span>
                <span className="text-[10px] sm:text-xs text-gray-600">{t('products')}</span>
              </div>
            </div>
            
            {/* Customer Input with Search & Add Quick Button */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="flex-1 relative">
                  <User className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400 z-10" />
                  <input
                    type="text"
                    placeholder="Tìm KH..."
                    value={customerSearchQuery}
                    onChange={(e) => {
                      setCustomerSearchQuery(e.target.value);
                      setShowCustomerDropdown(true);
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    className="w-full pl-7 sm:pl-10 pr-2 sm:pr-3 py-1.5 sm:py-2 rounded-lg bg-white border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none text-xs sm:text-sm min-h-[36px]"
                  />
                  
                  {/* Customer Dropdown */}
                  {showCustomerDropdown && (
                    <>
                      <div 
                        className="fixed inset-0 z-20" 
                        onClick={() => setShowCustomerDropdown(false)}
                      />
                      <div className="absolute top-full left-0 right-12 mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto z-30">
                        {/* Walk-in Customer Option - Always First */}
                        <button
                          onClick={() => {
                            setCustomerName('Khách lạ');
                            setCustomerPhone('');
                            setSelectedCustomerId('');
                            setCustomerSearchQuery('');
                            setShowCustomerDropdown(false);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">👤 Khách lạ</p>
                              <p className="text-xs text-gray-500">Khách hàng không có thông tin</p>
                            </div>
                            {!selectedCustomerId && (
                              <Check className="w-4 h-4 text-[#FE7410]" />
                            )}
                          </div>
                        </button>
                        
                        {/* Registered Customers */}
                        {customerSearchQuery && filteredCustomers.length > 0 && (
                          <>
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
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setShowAddCustomerModal(true)}
                  className="p-1.5 sm:p-2 text-white rounded-lg transition-all min-h-[36px] min-w-[36px] flex items-center justify-center"
                  style={{ backgroundColor: '#FE7410' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E56809'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FE7410'}
                  title={t('addNew') || 'Thêm khách hàng mới'}
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              
              {/* Selected Customer Display - Always Show */}
              {customerName && (
                <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg" style={{ backgroundColor: selectedCustomerId ? '#FFEDD5' : '#F3F4F6' }}>
                  <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" style={{ color: selectedCustomerId ? '#FE7410' : '#9CA3AF' }} />
                  <span className="text-xs sm:text-sm font-medium truncate" style={{ color: selectedCustomerId ? '#92400E' : '#6B7280' }}>{customerName}</span>
                  {customerPhone && (
                    <span className="text-[10px] sm:text-xs hidden sm:inline" style={{ color: selectedCustomerId ? '#FE7410' : '#9CA3AF' }}>• {customerPhone}</span>
                  )}
                  {selectedCustomerId && (
                    <button
                      onClick={() => {
                        setSelectedCustomerId('');
                        setCustomerName('Khách lạ');
                        setCustomerPhone('');
                        setCustomerSearchQuery('');
                      }}
                      className="ml-auto p-0.5 rounded hover:bg-black/10 flex-shrink-0"
                    >
                      <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" style={{ color: '#FE7410' }} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-2.5 space-y-1.5 sm:space-y-2 min-h-0">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <ShoppingBag className="w-16 h-16 mb-3" />
                <p className="text-base">{t('emptyCart')}</p>
                <p className="text-sm mt-2 text-center">{t('addProductsToStart')}</p>
              </div>
            ) : (
              cart.map((item) => {
                const cartItemId = item.cartItemId || item.id;
                return (
                <div
                  key={cartItemId}
                  onClick={() => setSelectedCartItem(cartItemId)}
                  className={`bg-gray-50 rounded-lg sm:rounded-xl p-2 sm:p-2.5 border-2 transition-all cursor-pointer ${
                    selectedCartItem === cartItemId ? 'bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={selectedCartItem === cartItemId ? { borderColor: '#FE7410', backgroundColor: '#FFF7ED' } : {}}
                >
                  <div className="flex items-start gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                    {/* Product Image */}
                    {item.image ? (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex-shrink-0 overflow-hidden bg-gray-100">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FFEDD5' }}>
                        <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#FE7410' }} />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-1">{item.name}</h3>
                      {item.variantTitle && (
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                          <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3 inline mr-0.5" />
                          {item.variantTitle}
                        </p>
                      )}
                      <div className="text-base sm:text-lg font-bold mt-0.5" style={{ color: '#FE7410' }}>
                        {(item.variantPrice || item.price || 0).toLocaleString()}đ
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromCart(cartItemId);
                        playSound('beep');
                      }}
                      className="p-1 sm:p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateCartQuantity(cartItemId, Math.max(1, item.quantity - 1));
                          playSound('beep');
                        }}
                        className="w-7 h-7 sm:w-8 sm:h-8 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center hover:border-orange-500 hover:bg-orange-50 transition-all"
                      >
                        <Minus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700" />
                      </button>
                      
                      <div className="w-10 h-7 sm:w-14 sm:h-8 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                        <span className="text-sm sm:text-base font-bold text-gray-900">{item.quantity || 0}</span>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateCartQuantity(cartItemId, item.quantity + 1);
                          playSound('beep');
                        }}
                        className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-600 rounded-lg flex items-center justify-center hover:shadow-lg transition-all"
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] sm:text-xs text-gray-500">{t('subtotal')}</div>
                      <div className="text-sm sm:text-base font-bold text-gray-900">
                        {((item.variantPrice || item.price || 0) * (item.quantity || 0)).toLocaleString()}đ
                      </div>
                    </div>
                  </div>
                </div>
              );
              })
            )}
          </div>

          {/* Summary & Checkout - COMPACT */}
          <div className="border-t border-gray-200 p-2 sm:p-2.5 space-y-2 sm:space-y-2.5 bg-gray-50 flex-shrink-0">
            {/* Tip Input - Only show if enabled in settings */}
            {settings.enableTip && (
              <div className="flex items-center gap-1.5 sm:gap-2 bg-white border-2 border-gray-200 rounded-lg px-2 py-1.5 min-h-[32px]">
                <Gift className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="number"
                  placeholder={t('tip') || 'Tip'}
                  value={tipAmount || ''}
                  onChange={(e) => setTipAmount(parseFloat(e.target.value) || 0)}
                  className="flex-1 outline-none text-xs sm:text-sm min-w-0"
                />
                <span className="text-xs text-gray-500">đ</span>
              </div>
            )}

            {/* Quick Discount Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto">
              {/* Quick discount chip buttons - pill shaped */}
              <button
                onClick={() => handleQuickDiscount(5)}
                disabled={manualDiscount > 0}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                -5%
              </button>
              <button
                onClick={() => handleQuickDiscount(10)}
                disabled={manualDiscount > 0}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                -10%
              </button>
              <button
                onClick={() => handleQuickDiscount(15)}
                disabled={manualDiscount > 0}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                -15%
              </button>
              <button
                onClick={() => handleQuickDiscount(20)}
                disabled={manualDiscount > 0}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                -20%
              </button>
              {/* Manual discount input - separate bordered container */}
              <div className="flex-[2] min-w-[280px] flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2">
                <button
                  onClick={() => setManualDiscountType(manualDiscountType === 'percent' ? 'fixed' : 'percent')}
                  className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium hover:bg-gray-200 transition-colors"
                  title={manualDiscountType === 'percent' ? 'Chuyển sang giảm theo số tiền' : 'Chuyển sang giảm theo phần trăm'}
                >
                  {manualDiscountType === 'percent' ? '%' : 'đ'}
                </button>
                <span className="text-sm text-gray-600 font-medium whitespace-nowrap">Giảm giá</span>
                <input
                  type="number"
                  placeholder=""
                  value={manualDiscountInput}
                  onChange={(e) => setManualDiscountInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && manualDiscountInput) {
                      handleApplyManualDiscount();
                    }
                  }}
                  disabled={manualDiscount > 0}
                  className="flex-1 outline-none text-sm min-w-0 placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-500 font-normal"
                />
                {manualDiscount > 0 && (
                  <button
                    onClick={handleClearManualDiscount}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Xóa giảm giá"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                )}
              </div>
            </div>

            {/* Voucher Input */}
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-white border-2 border-[#FE7410] rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
                <Tag className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="NHẬP MÃ VOUCHER"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  disabled={!!appliedVoucher}
                  className="flex-1 outline-none text-xs sm:text-sm min-w-0 placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-500 font-medium"
                />
              </div>
              {appliedVoucher ? (
                <button
                  onClick={handleRemoveVoucher}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-500 text-white rounded-lg text-xs sm:text-sm font-bold hover:bg-red-600 transition-colors flex-shrink-0"
                >
                  Xóa
                </button>
              ) : (
                <button
                  onClick={handleApplyVoucher}
                  disabled={!voucherCode.trim()}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#FE7410] text-white rounded-lg text-xs sm:text-sm font-bold hover:bg-[#E56809] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  Áp dụng
                </button>
              )}
            </div>

            {/* Totals - Compact */}
            <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-2.5 border-2 border-gray-200">
              <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-1">
                <span>Tạm tính:</span>
                <span className="font-semibold text-sm sm:text-base">{subtotal.toLocaleString()}đ</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-xs sm:text-sm text-red-600 mb-1">
                  <span>Giảm giá:</span>
                  <span className="font-semibold text-sm sm:text-base">-{discount.toLocaleString()}đ</span>
                </div>
              )}
              {tip > 0 && (
                <div className="flex justify-between text-xs sm:text-sm text-green-600 mb-1">
                  <span>{t('tip') || 'Tip'}:</span>
                  <span className="font-semibold text-sm sm:text-base">+{tip.toLocaleString()}đ</span>
                </div>
              )}
              <div className="border-t-2 border-gray-200 pt-1.5 flex justify-between items-center">
                <span className="text-sm sm:text-base font-bold text-gray-900">Tổng tiền:</span>
                <span className="text-xl sm:text-2xl font-bold text-[#FE7410]">
                  {total.toLocaleString()}đ
                </span>
              </div>
            </div>

            {/* Checkout Button - COMPACT */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full bg-[#FE7410] text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:bg-[#E56809] hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2 text-base sm:text-lg font-bold min-h-[44px]"
            >
              <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
              {t('checkout')} (F9)
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
                          {bill.items.reduce((sum, item) => sum + ((item.variantPrice || item.price) * item.quantity), 0).toLocaleString()}đ
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          recallBill(bill.id);
                          // Set customer info from bill, default to walk-in customer
                          setCustomerName(bill.customerName || 'Khách lạ');
                          setCustomerPhone('');
                          setSelectedCustomerId('');
                          setCustomerSearchQuery('');
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
                        <div className="text-sm" style={{ color: '#FFEDD5' }}>{item.quantity} × {(item.variantPrice || item.price).toLocaleString()}đ</div>
                      </div>
                      <div className="text-2xl font-bold">
                        {((item.variantPrice || item.price) * item.quantity).toLocaleString()}đ
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

      {/* Barcode Help Modal */}
      {showBarcodeHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Barcode className="w-8 h-8" />
                  <h2 className="text-2xl font-bold">Hướng dẫn Quét Barcode</h2>
                </div>
                <button
                  onClick={() => setShowBarcodeHelp(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Quick Guide */}
              <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4">
                <h3 className="text-lg font-bold text-green-900 mb-3 flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  3 Cách Nhập Barcode
                </h3>
                <ol className="space-y-2 text-green-800">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-xl">1️⃣</span>
                    <span><strong>Máy quét:</strong> Quét → Tự động thêm (0.5s) ⚡</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-xl">2️⃣</span>
                    <span><strong>Nhập tay:</strong> Gõ mã → Nhấn Enter → Thêm (2-3s) ⌨️</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-xl">3️⃣</span>
                    <span><strong>Auto-scan:</strong> Gõ mã → Chờ 0.5s → Tự động thêm 🤖</span>
                  </li>
                </ol>
              </div>

              {/* Sales Process */}
              <div className="bg-blue-50 border-2 border-blue-400 rounded-xl p-4">
                <h3 className="text-lg font-bold text-blue-900 mb-3">💰 Quy trình bán hàng</h3>
                <ol className="space-y-2 text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="font-bold">→</span>
                    <span>Nhập sản phẩm (quét hoặc gõ) → Nghe "beep"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">→</span>
                    <span>Chọn khách hàng (hoặc để "Khách lạ")</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">→</span>
                    <span>Nhấn F9 → Thanh toán → Hoàn tất!</span>
                  </li>
                </ol>
              </div>

              {/* Scanner Types */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">📷 Loại máy quét</h3>
                <div className="grid gap-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="font-semibold text-blue-900">USB Barcode Scanner</div>
                    <div className="text-sm text-blue-700">Giá: 500k-2tr | Cắm USB là dùng ngay</div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="font-semibold text-purple-900">Bluetooth Scanner</div>
                    <div className="text-sm text-purple-700">Giá: 1-3tr | Không dây, linh hoạt</div>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="font-semibold text-orange-900">2D QR + Barcode Scanner</div>
                    <div className="text-sm text-orange-700">Giá: 1.5-4tr | Quét cả QR code</div>
                  </div>
                </div>
              </div>

              {/* Usage */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">⚡ Mẹo sử dụng hiệu quả</h3>
                <div className="grid gap-3">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="font-semibold text-purple-900 mb-1">🎯 Cho máy quét:</div>
                    <div className="text-sm text-purple-700">
                      Khoảng cách 5-15cm, giữ mã thẳng, đủ ánh sáng → Quét liên tục không cần chờ
                    </div>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                    <div className="font-semibold text-indigo-900 mb-1">⌨️ Cho nhập tay:</div>
                    <div className="text-sm text-indigo-700">
                      Nhấn F8 → Gõ mã → Enter (hoặc chờ 0.5s) → Tự động thêm
                    </div>
                  </div>
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                    <div className="font-semibold text-teal-900 mb-1">🚀 Pro tip:</div>
                    <div className="text-sm text-teal-700">
                      Mã bị mờ/lỗi? Nhập tay nhanh hơn là thử quét nhiều lần!
                    </div>
                  </div>
                </div>
              </div>

              {/* Keyboard Shortcuts */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">⌨️ Phím tắt</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-100 border border-gray-300 rounded-lg p-2 flex items-center justify-between">
                    <span className="font-mono font-bold text-gray-900">F8</span>
                    <span className="text-sm text-gray-700">Focus barcode</span>
                  </div>
                  <div className="bg-gray-100 border border-gray-300 rounded-lg p-2 flex items-center justify-between">
                    <span className="font-mono font-bold text-gray-900">F9</span>
                    <span className="text-sm text-gray-700">Thanh toán</span>
                  </div>
                  <div className="bg-gray-100 border border-gray-300 rounded-lg p-2 flex items-center justify-between">
                    <span className="font-mono font-bold text-gray-900">F2</span>
                    <span className="text-sm text-gray-700">Tìm kiếm</span>
                  </div>
                  <div className="bg-gray-100 border border-gray-300 rounded-lg p-2 flex items-center justify-between">
                    <span className="font-mono font-bold text-gray-900">F10</span>
                    <span className="text-sm text-gray-700">Xóa giỏ</span>
                  </div>
                </div>
              </div>

              {/* Test Examples */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">🔍 Thử nghiệm ngay</h3>
                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
                  <div className="font-semibold text-yellow-900 mb-3">Nhập thử các mã này (có thể gõ hoặc quét):</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <code className="block bg-white px-3 py-2 rounded border-2 border-yellow-300 font-mono font-bold text-center text-lg">PRD-0001</code>
                      <div className="text-xs text-yellow-800 mt-1 text-center">Áo thun cotton</div>
                    </div>
                    <div>
                      <code className="block bg-white px-3 py-2 rounded border-2 border-yellow-300 font-mono font-bold text-center text-lg">PRD-0002</code>
                      <div className="text-xs text-yellow-800 mt-1 text-center">Giày sneaker</div>
                    </div>
                    <div>
                      <code className="block bg-white px-3 py-2 rounded border-2 border-yellow-300 font-mono font-bold text-center text-lg">PRD-0003</code>
                      <div className="text-xs text-yellow-800 mt-1 text-center">Túi xách da</div>
                    </div>
                    <div>
                      <code className="block bg-white px-3 py-2 rounded border-2 border-yellow-300 font-mono font-bold text-center text-lg">PRD-0004</code>
                      <div className="text-xs text-yellow-800 mt-1 text-center">Quần jean</div>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-yellow-800 bg-yellow-100 rounded p-2">
                    💡 <strong>Mẹo:</strong> Gõ mã → Nhấn <kbd className="px-2 py-0.5 bg-white border border-yellow-400 rounded font-mono font-bold">Enter</kbd> → Xem kết quả!
                  </div>
                </div>
              </div>

              {/* Troubleshooting */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">🆘 Xử lý lỗi</h3>
                <div className="space-y-3">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="font-semibold text-red-900 mb-1">❌ Quét không nhận</div>
                    <div className="text-sm text-red-700">
                      → Kiểm tra mã rõ nét chưa, điều chỉnh khoảng cách 5-15cm
                    </div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="font-semibold text-red-900 mb-1">❌ Không tìm thấy sản phẩm</div>
                    <div className="text-sm text-red-700">
                      → Sản phẩm chưa có trong hệ thống, thêm vào "Quản lý hàng hóa"
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 p-4 rounded-b-2xl border-t">
              <button
                onClick={() => setShowBarcodeHelp(false)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
              >
                Đã hiểu, bắt đầu quét!
              </button>
            </div>
          </div>
        </div>
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

      {/* Variant Selection Modal */}
      {showVariantModal && selectedProductForVariant && (
        <VariantSelectionModal
          productId={selectedProductForVariant.id}
          productName={selectedProductForVariant.name}
          productPrice={selectedProductForVariant.price}
          productImage={selectedProductForVariant.image}
          onSelect={handleVariantSelect}
          onClose={() => {
            setShowVariantModal(false);
            setSelectedProductForVariant(null);
          }}
        />
      )}
    </div>
  );
}

export default ModernSalesScreen;