import { DollarSign, CreditCard, Printer, Users, X, Clock, Phone, ShoppingBag, FileText, Edit, Trash2, ArrowLeft, Smartphone, QrCode, Zap, Check, Banknote, AlertTriangle, TrendingDown, XOctagon } from 'lucide-react';
import { useTranslation } from '../../../../lib/restaurant-lib/useTranslation';
import { useEffect, useState } from 'react';
import { useStore } from '../../../../lib/restaurant-lib/store';
import { toast } from 'sonner';

// Order Detail Full Screen Component - with order history cancellation tracking
interface OrderDetailFullScreenProps {
  order: any;
  onClose: () => void;
  onCollectPayment?: (order: any) => void;
  onPrintReceipt?: (order: any) => void;
  onEdit?: (order: any) => void;
  onDelete?: (order: any) => void;
  onShowProfileMenu?: () => void;
  showWithSidebar?: boolean; // NEW: Option to show with sidebar instead of fullscreen overlay
}

type PaymentMethodType = 'cash' | 'card' | 'transfer' | 'momo' | 'zalopay' | 'vnpay';

export function OrderDetailFullScreen({ order: orderProp, onClose, onPrintReceipt, onEdit, onDelete, showWithSidebar }: OrderDetailFullScreenProps) {
  const { t } = useTranslation();
  const { updateOrder, autoServeKitchenOrderOnPayment, orders } = useStore();
  
  // 🔥 IMPORTANT: Get fresh order from store to ensure orderHistory is up-to-date
  const order = orders.find(o => o.id === orderProp.id) || orderProp;
  
  const isPaid = order.paymentStatus === 'paid';
  const receivedAmount = order.receivedAmount || order.paidAmount || 0;
  const isUnderPaid = receivedAmount < order.total;
  
  // Display amount: if paid more than total, show total; otherwise show actual amount
  // Get current user info from localStorage
  const currentUser = localStorage.getItem('salepa_username') || '';

  // Payment modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('cash');
  const [customerAmount, setCustomerAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');

  // Calculate remaining amount to pay
  const remainingAmount = order.total - receivedAmount;

  const paymentMethods = [
    { id: 'cash' as const, label: t.cash || 'Tiền mặt', icon: Banknote },
    { id: 'card' as const, label: t.card || 'Thẻ', icon: CreditCard },
    { id: 'transfer' as const, label: t.transfer || 'Chuyển khoản', icon: CreditCard },
    { id: 'momo' as const, label: 'MoMo', icon: Smartphone },
    { id: 'zalopay' as const, label: 'ZaloPay', icon: QrCode },
    { id: 'vnpay' as const, label: 'VNPay', icon: Zap },
  ];

  // Initialize customer amount when opening payment modal
  useEffect(() => {
    if (showPaymentModal) {
      // If customer already paid >= total, set default to total amount
      // Otherwise, set to the amount they already paid (remaining amount)
      if (receivedAmount >= order.total) {
        setCustomerAmount(order.total.toString());
      } else {
        setCustomerAmount(remainingAmount.toString());
      }
    }
  }, [showPaymentModal, receivedAmount, order.total, remainingAmount]);

  const handleCollectPayment = () => {
    setShowPaymentModal(true);
  };

  const handleCompletePayment = () => {
    const additionalAmount = parseFloat(customerAmount || '0');
    const newReceivedAmount = receivedAmount + additionalAmount;
    const newChangeAmount = newReceivedAmount - order.total;

    // Create payment history entry
    const paymentHistoryEntry: any = {
      id: `PAY-${Date.now()}`,
      amount: additionalAmount,
      paymentMethod: paymentMethod,
      paidAt: new Date().toISOString(),
      paidBy: currentUser,
      note: paymentNote,
      changeAmount: newChangeAmount,
    };

    // Update order with new payment info
    const existingPaymentHistory = order.paymentHistory || [];
    updateOrder(order.id, {
      receivedAmount: newReceivedAmount,
      changeAmount: newChangeAmount,
      status: newReceivedAmount >= order.total ? 'completed' : 'pending',
      paymentMethod: paymentMethod,
      paymentHistory: [...existingPaymentHistory, paymentHistoryEntry],
    });

    // Auto-serve kitchen order if payment is complete
    if (newReceivedAmount >= order.total) {
      console.log('💰 Payment completed - auto-serving kitchen order');
      setTimeout(() => {
        autoServeKitchenOrderOnPayment(order.id);
      }, 100);
    }

    toast.success('✅ Thu tiền thành công!', {
      description: `Số tiền thu: ${additionalAmount.toLocaleString()}đ${newChangeAmount > 0 ? ` | Tiền thừa: ${newChangeAmount.toLocaleString()}đ` : newChangeAmount < 0 ? ` | Còn thiếu: ${Math.abs(newChangeAmount).toLocaleString()}đ` : ''}`,
      duration: 3000,
    });

    setShowPaymentModal(false);
    setCustomerAmount('');
    setPaymentNote('');
    
    // Update the order object directly to trigger re-render
    Object.assign(order, {
      receivedAmount: newReceivedAmount,
      changeAmount: newChangeAmount,
      status: newReceivedAmount >= order.total ? 'completed' : 'pending',
      paymentMethod: paymentMethod,
      paymentHistory: [...existingPaymentHistory, paymentHistoryEntry],
    });
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash': return t.cash || 'Tiền mặt';
      case 'card': return t.card || 'Thẻ';
      case 'transfer': return t.transfer || 'Chuyển khoản';
      case 'momo': return 'MoMo';
      case 'zalopay': return 'ZaloPay';
      case 'vnpay': return 'VNPay';
      default: return method;
    }
  };

  useEffect(() => {
    // Scroll to top when component mounts (only for fullscreen overlay mode)
    if (!showWithSidebar) {
      window.scrollTo(0, 0);
    }
    
    // Debug log to check orderHistory data
    console.log('🔍 [OrderDetailFullScreen] Order data:', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      hasOrderHistory: !!order.orderHistory,
      orderHistoryLength: order.orderHistory?.length || 0,
      orderHistory: order.orderHistory,
      canceledItems: order.orderHistory?.filter((h: any) => 
        h.type === 'cancel_item' || h.type === 'decrease_quantity' || h.type === 'remove_item'
      ) || []
    });
  }, [order.id, showWithSidebar, order.orderHistory]);

  return (
    <div className={showWithSidebar ? "flex flex-col bg-gray-50 h-full" : "fixed inset-0 bg-gray-50 z-50 flex flex-col"}>
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 bg-white border-b-2 border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {t.orderDetails || 'Chi tiết hóa đơn'}
                </h1>
                
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Action Buttons in Header */}
              {onPrintReceipt && (
                <button
                  onClick={() => onPrintReceipt(order)}
                  className="px-4 py-2 rounded-xl font-semibold border-2 border-gray-300 text-gray-700 transition-all hover:bg-gray-50 flex items-center gap-2"
                >
                  <Printer className="w-5 h-5" />
                  {t.printReceipt || 'In hóa đơn'}
                </button>
              )}
              
              {onEdit && (
                <button
                  onClick={() => onEdit(order)}
                  className="px-4 py-2 rounded-xl font-semibold border-2 border-gray-300 text-gray-700 transition-all hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit className="w-5 h-5" />
                  {t.edit || 'Sửa'}
                </button>
              )}
              
              {onDelete && (
                <button
                  onClick={() => onDelete(order)}
                  className="px-4 py-2 rounded-xl font-semibold border-2 border-red-300 text-red-600 transition-all hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  {t.delete || 'Xóa'}
                </button>
              )}
              
              {/* Show collect payment button if there's remaining amount */}
              {isUnderPaid && (
                <button
                  onClick={handleCollectPayment}
                  className="px-4 py-2 rounded-xl font-semibold text-white transition-all hover:opacity-90 flex items-center gap-2"
                  style={{ backgroundColor: '#FE7410' }}
                >
                  <DollarSign className="w-5 h-5" />
                  {t.collectPayment || 'Thu tiền'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex-shrink-0 bg-white border-b-2 border-gray-200 px-8">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex items-center gap-2 px-1 py-3 border-b-2 text-sm transition-colors ${
                activeTab === 'details'
                  ? 'font-bold border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Chi tiết đơn hàng
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-1 py-3 border-b-2 text-sm transition-colors ${
                activeTab === 'history'
                  ? 'font-bold border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Clock className="w-4 h-4" />
              Lịch sử thanh toán
              {order.paymentHistory && order.paymentHistory.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs font-bold">
                  {order.paymentHistory.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content - Scrollable with 2 columns */}
        <div className="flex-1 overflow-y-auto p-8" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Left Column - Main Info (2/3) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tab Content: Chi tiết đơn hàng */}
              {activeTab === 'details' && (
                <>
                  {/* Order Items */}
                  <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                    <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-gray-700" />
                      Danh sách sản phẩm
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">
                              {t.productName || 'Tên sản phẩm'}
                            </th>
                            <th className="text-center py-3 px-4 text-sm font-bold text-gray-700">
                              {t.quantity || 'Số lượng'}
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-bold text-gray-700">
                              {t.price || 'Đơn giá'}
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-bold text-gray-700">
                              {t.total || 'Thành tiền'}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item: any, index: number) => (
                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4 text-base text-gray-900">
                                {item.name}
                                {item.type && (
                                  <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                    {item.type === 'product' && (t.product || 'Sản phẩm')}
                                    {item.type === 'service' && (t.service || 'Dịch vụ')}
                                    {item.type === 'package' && (t.package || 'Liệu trình')}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-base text-center text-gray-900 font-semibold">
                                {item.quantity}
                              </td>
                              <td className="py-3 px-4 text-base text-right text-gray-900">
                                {item.price.toLocaleString()}đ
                              </td>
                              <td className="py-3 px-4 text-base text-right font-semibold text-gray-900">
                                {(item.price * item.quantity).toLocaleString()}đ
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-b border-gray-100">
                            <td colSpan={3} className="py-3 px-4 text-right font-semibold text-gray-700 text-base">
                              {t.subtotal || 'Tạm tính'}:
                            </td>
                            <td className="py-3 px-4 text-right font-semibold text-gray-900 text-base">
                              {(order.subtotal || order.total).toLocaleString()}đ
                            </td>
                          </tr>
                          {order.discount && order.discount > 0 ? (
                            <tr className="border-b border-gray-100">
                              <td colSpan={3} className="py-3 px-4 text-right font-semibold text-gray-700 text-base">
                                {t.discount || 'Giảm giá'}:
                              </td>
                              <td className="py-3 px-4 text-right font-semibold text-red-600 text-base">
                                -{order.discount.toLocaleString()}đ
                              </td>
                            </tr>
                          ) : null}
                          <tr className="bg-gray-50 border-b-2 border-gray-300">
                            <td colSpan={3} className="py-4 px-4 text-right font-bold text-gray-900 text-lg">
                              {t.totalPayment || 'Tổng thanh toán'}:
                            </td>
                            <td className="py-4 px-4 text-right font-bold text-2xl" style={{ color: '#FE7410' }}>
                              {order.total.toLocaleString()}đ
                            </td>
                          </tr>
                          {(order.receivedAmount !== undefined || order.paidAmount !== undefined) ? (() => {
                            const receivedAmount = order.receivedAmount || order.paidAmount || 0;
                            const isUnderPaid = receivedAmount < order.total;
                            const displayAmount = receivedAmount > order.total ? order.total : receivedAmount;
                            return (
                              <tr className="bg-gray-50">
                                <td colSpan={3} className="py-4 px-4 text-right font-bold text-gray-900 text-lg">
                                  {t.customerPaid || 'Khách đã trả'}:
                                </td>
                                <td className={`py-4 px-4 text-right font-bold text-2xl ${
                                  isUnderPaid || receivedAmount === 0 ? 'text-red-600' : 'text-green-600'
                                }`}>
                                  {displayAmount.toLocaleString()}đ
                                </td>
                              </tr>
                            );
                          })() : null}
                        </tfoot>
                      </table>
                    </div>

                    {/* Lịch sử hủy món - Hiển thị ngay dưới bảng */}
                    {order.orderHistory && order.orderHistory.filter((h: any) => 
                      h.type === 'cancel_item' || h.type === 'decrease_quantity' || h.type === 'remove_item'
                    ).length > 0 && (
                      <div className="mt-6 pt-6 border-t-2 border-gray-200">
                        <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          Lịch sử hủy / bớt món
                        </h4>
                        <div className="space-y-2">
                          {[...order.orderHistory]
                            .filter((h: any) => 
                              h.type === 'cancel_item' || h.type === 'decrease_quantity' || h.type === 'remove_item'
                            )
                            .reverse()
                            .map((history: any) => (
                              <div 
                                key={history.id} 
                                className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <XOctagon className="w-4 h-4 text-red-600 flex-shrink-0" />
                                      <span className="font-semibold text-red-900">{history.itemName}</span>
                                      <span className="text-xs text-red-600">
                                        {history.type === 'cancel_item' && '(Đã hủy toàn bộ)'}
                                        {history.type === 'decrease_quantity' && `(Giảm ${history.quantity})`}
                                        {history.type === 'remove_item' && '(Đã xóa)'}
                                      </span>
                                    </div>
                                    {history.reason && (
                                      <div className="text-xs text-red-700 ml-6 mb-1">
                                        Lý do: {history.reason}
                                      </div>
                                    )}
                                    <div className="text-xs text-gray-600 ml-6">
                                      {new Date(history.performedAt).toLocaleString('vi-VN')} • {history.performedBy}
                                    </div>
                                  </div>
                                  {history.previousQuantity !== undefined && history.newQuantity !== undefined && (
                                    <div className="flex items-center gap-2 text-xs text-gray-600 flex-shrink-0">
                                      <span className="font-semibold">{history.previousQuantity}</span>
                                      <TrendingDown className="w-3 h-3 text-red-600" />
                                      <span className="font-semibold">{history.newQuantity}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Customer Information */}
                  {(order.customerName || order.customerPhone) && (
                    <div className="bg-white rounded-2xl border-2 border-blue-200 p-6">
                      <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-gray-700" />
                        Thông tin khách hàng
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {order.customerName && (
                          <div className="bg-blue-50 rounded-xl p-4">
                            <div className="text-sm text-blue-700 mb-1">Tên khách hàng</div>
                            <div className="font-semibold text-blue-900 text-base">
                              {order.customerName}
                            </div>
                          </div>
                        )}
                        {order.customerPhone && (
                          <div className="bg-blue-50 rounded-xl p-4">
                            <div className="text-sm text-blue-700 mb-1 flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              Số điện thoại
                            </div>
                            <div className="font-semibold text-blue-900 text-base">
                              {order.customerPhone}
                            </div>
                          </div>
                        )}
                        {order.note && (
                          <div className="bg-blue-50 rounded-xl p-4 md:col-span-2">
                            <div className="text-sm text-blue-700 mb-1 flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              Ghi chú
                            </div>
                            <div className="text-blue-900 text-base whitespace-pre-wrap">
                              {order.note}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Payment Information (if paid) */}
                  {isPaid && order.paymentMethod && (
                    <div className="bg-white rounded-2xl border-2 border-green-200 p-6">
                      <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-green-600" />
                        {t.paymentInfo || 'Thông tin thanh toán'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-green-50 rounded-xl p-4">
                          <div className="text-sm text-green-700 mb-1">{t.paymentMethod || 'Phương thức'}</div>
                          <div className="font-semibold text-green-900 text-base">
                            {getPaymentMethodLabel(order.paymentMethod)}
                          </div>
                        </div>
                        {order.paidAt && (
                          <div className="bg-green-50 rounded-xl p-4">
                            <div className="text-sm text-green-700 mb-1 flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {t.paymentTime || 'Thời gian thanh toán'}
                            </div>
                            <div className="font-semibold text-green-900 text-base">
                              {new Date(order.paidAt).toLocaleString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        )}
                        {order.receivedAmount && (
                          <div className="bg-green-50 rounded-xl p-4">
                            <div className="text-sm text-green-700 mb-1">{t.receivedAmount || 'Tiền khách đưa'}</div>
                            <div className="font-semibold text-green-900 text-base">
                              {order.receivedAmount.toLocaleString()}đ
                            </div>
                          </div>
                        )}
                        {order.changeAmount !== undefined && order.changeAmount > 0 && (
                          <div className="bg-green-50 rounded-xl p-4">
                            <div className="text-sm text-green-700 mb-1">{t.changeAmount || 'Tiền thừa'}</div>
                            <div className="font-semibold text-green-900 text-base">
                              {order.changeAmount.toLocaleString()}đ
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Tab Content: Payment History */}
              {activeTab === 'history' && (
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                  <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-700" />
                    Lịch sử thanh toán
                  </h3>
                  
                  {order.paymentHistory && order.paymentHistory.length > 0 ? (
                    <div className="space-y-4">
                      {/* Reverse array to show newest first, then map with correct numbering */}
                      {[...order.paymentHistory].reverse().map((payment: any, index: number) => {
                        const isPositiveChange = payment.changeAmount && payment.changeAmount > 0;
                        const isNegativeChange = payment.changeAmount && payment.changeAmount < 0;
                        // Generate payment code: TT000001, TT000002, etc.
                        const paymentCode = `TT${String(index + 1).padStart(6, '0')}`;
                        
                        // Calculate total already paid before this payment (sum of all previous payments in reversed array)
                        const previousPaymentsTotal = [...order.paymentHistory].reverse()
                          .slice(0, index)
                          .reduce((sum: number, p: any) => sum + p.amount, 0);
                        
                        // Calculate how much of this payment actually went toward the order total
                        const remainingBeforePayment = order.total - previousPaymentsTotal;
                        const displayAmount = payment.amount > remainingBeforePayment ? remainingBeforePayment : payment.amount;
                        
                        // If payment was capped (paid more than needed), show "Vừa đủ" instead of change
                        const wasCapped = payment.amount > remainingBeforePayment;
                        const shouldShowChange = !wasCapped && isPositiveChange;
                        const shouldShowRemaining = !wasCapped && isNegativeChange;
                        
                        return (
                          <div 
                            key={payment.id} 
                            className="border-2 border-gray-200 rounded-xl p-4 hover:border-orange-300 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFF7ED' }}>
                                  <DollarSign className="w-5 h-5" style={{ color: '#FE7410' }} />
                                </div>
                                <div>
                                  <div className="font-bold text-gray-900">
                                    {paymentCode}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {new Date(payment.paidAt).toLocaleString('vi-VN', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-xl text-green-600">
                                  +{displayAmount.toLocaleString()}đ
                                </div>
                                <div className="text-xs text-gray-500">
                                  {getPaymentMethodLabel(payment.paymentMethod)}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                              <div className="bg-gray-50 rounded-lg p-3">
                                <div className="text-xs text-gray-600 mb-1">Người thu</div>
                                <div className="font-semibold text-gray-900">{payment.paidBy || 'N/A'}</div>
                              </div>
                              
                              {shouldShowChange ? (
                                <div className="bg-green-50 rounded-lg p-3">
                                  <div className="text-xs text-green-700 mb-1">Tiền thừa</div>
                                  <div className="font-semibold text-green-600">
                                    {payment.changeAmount.toLocaleString()}đ
                                  </div>
                                </div>
                              ) : shouldShowRemaining ? (
                                <div className="bg-red-50 rounded-lg p-3">
                                  <div className="text-xs text-red-700 mb-1">Còn thiếu</div>
                                  <div className="font-semibold text-red-600">
                                    {Math.abs(payment.changeAmount).toLocaleString()}đ
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-blue-50 rounded-lg p-3">
                                  <div className="text-xs text-blue-700 mb-1">Trạng thái</div>
                                  <div className="font-semibold text-blue-600">Vừa đủ</div>
                                </div>
                              )}
                            </div>

                            {payment.note && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="text-xs text-gray-600 mb-1">Ghi chú</div>
                                <div className="text-sm text-gray-700">{payment.note}</div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500">Chưa có lịch sử thanh toán</p>
                      <p className="text-sm text-gray-400 mt-1">Các lần thanh toán sẽ được lưu lại tại đây</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Summary & Quick Info (1/3) */}
            <div className="lg:col-span-1 space-y-6">
              {/* Total Summary - Sticky */}
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 lg:sticky lg:top-6">
                <h3 className="text-base font-bold text-gray-900 mb-4">
                  {t.orderSummary || 'Tổng quan đơn hàng'}
                </h3>
                
                {/* Order ID */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <div className="text-sm text-gray-600 mb-1">{t.orderNumber || 'Mã đơn hàng'}</div>
                  <div className="font-bold text-gray-900 text-lg">{order.orderNumber || `#${order.id.slice(-8).toUpperCase()}`}</div>
                </div>

                {/* Created By */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <div className="text-sm text-gray-600 mb-1">Người tạo</div>
                  <div className="font-semibold text-gray-900">{order.createdBy || 'Hệ thống'}</div>
                </div>

                {/* Order Date & Time */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                    {t.orderDate || 'Ngày tạo đơn'}
                  </div>
                  <div className="font-semibold text-gray-900">
                    {new Date(order.date).toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {new Date(order.date).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </div>
                </div>

                {/* Total Items */}
                <div className="bg-blue-50 rounded-xl p-4 mb-4">
                  <div className="text-sm text-blue-600 mb-1 flex items-center gap-1">
                    {t.totalItems || 'Tổng số sản phẩm'}
                  </div>
                  <div className="font-bold text-blue-900 text-lg">
                    {order.items.reduce((sum: number, item: any) => sum + item.quantity, 0)} {t.items || 'sản phẩm'}
                  </div>
                </div>

                {/* Total Amount */}
                <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: '#FFF5EE', border: '2px solid #FE7410' }}>
                  <div className="text-sm mb-1" style={{ color: '#FE7410' }}>
                    {t.totalPayment || 'Tổng thanh toán'}
                  </div>
                  <div className="font-bold text-3xl" style={{ color: '#FE7410' }}>
                    {order.total.toLocaleString()}đ
                  </div>
                </div>

                {/* Discount */}
                {order.discount && order.discount > 0 && (
                  <div className="rounded-xl p-4 mb-4 bg-red-50 border-2 border-red-200">
                    <div className="text-sm mb-1 text-red-700">
                      {t.discount || 'Giảm giá'}
                    </div>
                    <div className="font-bold text-xl text-red-600">
                      -{order.discount.toLocaleString()}đ
                    </div>
                  </div>
                )}

                {/* Customer Paid Amount */}
                {(order.receivedAmount !== undefined || order.paidAmount !== undefined) && (() => {
                  const receivedAmount = order.receivedAmount || order.paidAmount || 0;
                  
                  // Only show if customer has paid something (not 0)
                  if (receivedAmount === 0) return null;
                  
                  const isUnderPaid = receivedAmount < order.total;
                  const displayAmount = receivedAmount > order.total ? order.total : receivedAmount;
                  return (
                    <div className={`rounded-xl p-4 mb-4 border-2 ${
                      isUnderPaid
                        ? 'bg-red-50 border-red-300'
                        : 'bg-green-50 border-green-300'
                    }`}>
                      <div className={`text-sm mb-1 ${
                        isUnderPaid
                          ? 'text-red-700'
                          : 'text-green-700'
                      }`}>
                        {t.customerPaid || 'Khách đã trả'}
                      </div>
                      <div className={`font-bold text-2xl ${
                        isUnderPaid
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}>
                        {displayAmount.toLocaleString()}đ
                      </div>
                      {isUnderPaid && (
                        <div className="text-xs text-red-600 mt-1">
                          {t.paymentIncomplete || 'Thanh toán chưa đủ'}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Order Date & Time */}
                
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="border-b-2 p-6 rounded-t-2xl flex-shrink-0" style={{ backgroundColor: '#FFF7ED', borderColor: '#FE7410' }}>
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: '#FE7410' }}>{t.collectPayment || 'Thu tiền bổ sung'}</h2>
                  <p className="text-sm mt-1" style={{ color: '#E56809' }}>
                    Còn thiếu: <span className="font-bold">{remainingAmount.toLocaleString()}đ</span>
                  </p>
                </div>
                <button 
                  onClick={() => setShowPaymentModal(false)} 
                  className="p-2 rounded-lg transition-all" 
                  style={{ color: '#FE7410' }} 
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFEDD5'} 
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
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
                    {t.paymentMethod || 'Phương thức thanh toán'}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
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

                {/* Customer Amount - Always show */}
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-3">
                    💰 {t.customerAmount || 'Tiền khách đưa'}
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
                  {customerAmount && parseFloat(customerAmount) > remainingAmount && (
                    <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-semibold text-base">{t.change || 'Tiền thừa trả khách'}:</span>
                        <span className="text-3xl font-bold text-green-600">
                          {(parseFloat(customerAmount) - remainingAmount).toLocaleString()}đ
                        </span>
                      </div>
                    </div>
                  )}
                  {customerAmount && parseFloat(customerAmount) < remainingAmount && (
                    <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                      <div className="flex justify-between items-center">
                        <span className="text-red-700 font-semibold text-base">Vẫn còn thiếu:</span>
                        <span className="text-3xl font-bold text-red-600">
                          {(remainingAmount - parseFloat(customerAmount)).toLocaleString()}đ
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div className="rounded-xl p-5 border-2" style={{ backgroundColor: '#FFF7ED', borderColor: '#FE7410' }}>
                  <div className="space-y-3">
                    <div className="flex justify-between text-base text-gray-700">
                      <span>{t.totalPayment || 'Tổng thanh toán'}:</span>
                      <span className="font-semibold text-lg">{order.total.toLocaleString()}đ</span>
                    </div>
                    <div className="flex justify-between text-base text-gray-700">
                      <span>{t.customerPaid || 'Khách đã trả'}:</span>
                      <span className="font-semibold text-lg">{receivedAmount.toLocaleString()}đ</span>
                    </div>
                    <div className="border-t-2 pt-3 flex justify-between items-center" style={{ borderColor: '#FE7410' }}>
                      <span className="text-xl font-bold text-gray-900">{t.remaining || 'Còn thiếu'}:</span>
                      <span className="text-3xl font-bold" style={{ color: '#FE7410' }}>
                        {remainingAmount.toLocaleString()}đ
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Note */}
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-3">
                    {t.note || 'Ghi chú'}
                  </label>
                  <textarea
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    placeholder={t.addNoteOptional || 'Thêm ghi chú cho lần thu tiền này...'}
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
                disabled={!customerAmount || parseFloat(customerAmount) <= 0}
                className="w-full text-white py-4 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-3 text-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#FE7410' }}
              >
                <Check className="w-6 h-6" />
                {t.completePayment || 'Hoàn thành thu tiền'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}