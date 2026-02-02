import { DollarSign, Package, CheckCircle, XCircle, CreditCard, Printer, ChevronDown, Users, MessageSquare, X, Clock, Phone, Calendar, ShoppingBag, FileText, Edit, Trash2, ArrowLeft, Smartphone, QrCode, Zap, Check, Banknote } from 'lucide-react';
import { useTranslation } from '../../../../lib/convenience-store-lib/useTranslation';
import { useEffect, useState } from 'react';
import { AppSidebar } from '../../components/layout/AppSidebar';
import { useStore } from '../../../../lib/convenience-store-lib/store';
import { toast } from 'sonner';

interface OrderDetailFullScreenProps {
  order: any;
  onClose: () => void;
  onCollectPayment?: (order: any) => void;
  onPrintReceipt?: (order: any) => void;
  onEdit?: (order: any) => void;
  onDelete?: (order: any) => void;
}

type PaymentMethodType = 'cash' | 'card' | 'transfer' | 'momo' | 'zalopay' | 'vnpay';

export function OrderDetailFullScreen({ order, onClose, onCollectPayment, onPrintReceipt, onEdit, onDelete }: OrderDetailFullScreenProps) {
  const { t } = useTranslation();
  const { updateOrder } = useStore();
  const isPaid = order.paymentStatus === 'paid';
  const receivedAmount = order.receivedAmount || order.paidAmount || 0;
  const isUnderPaid = receivedAmount < order.total;
  
  // Display amount: if paid more than total, show total; otherwise show actual amount
  const displayReceivedAmount = receivedAmount > order.total ? order.total : receivedAmount;

  // Get current user info from localStorage
  const currentUser = localStorage.getItem('salepa_username') || '';
  const userRole = (localStorage.getItem('salepa_userRole') as 'admin' | 'cashier' | 'technician') || 'admin';

  // Payment modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('cash');
  const [customerAmount, setCustomerAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');

  // Calculate remaining amount to pay
  const remainingAmount = order.total - receivedAmount;

  // Calculate change
  const change = customerAmount ? parseFloat(customerAmount) - remainingAmount : 0;

  const paymentMethods = [
    { id: 'cash' as const, label: t('cash'), icon: Banknote },
    { id: 'card' as const, label: t('card'), icon: CreditCard },
    { id: 'transfer' as const, label: t('transfer'), icon: CreditCard },
    { id: 'momo' as const, label: 'MoMo', icon: Smartphone },
    { id: 'zalopay' as const, label: 'ZaloPay', icon: QrCode },
    { id: 'vnpay' as const, label: 'VNPay', icon: Zap },
  ];

  // Initialize customer amount when opening payment modal
  useEffect(() => {
    if (showPaymentModal) {
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

    toast.success(t('paymentSuccess'), {
      description: `${t('amountCollected')}: ${additionalAmount.toLocaleString()}đ${newChangeAmount > 0 ? ` | ${t('changeAmount')}: ${newChangeAmount.toLocaleString()}đ` : newChangeAmount < 0 ? ` | ${t('remaining')}: ${Math.abs(newChangeAmount).toLocaleString()}đ` : ''}`,
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
      case 'cash': return t('cash');
      case 'card': return t('card');
      case 'transfer': return t('transfer');
      case 'momo': return 'MoMo';
      case 'zalopay': return 'ZaloPay';
      case 'vnpay': return 'VNPay';
      default: return method;
    }
  };

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [order.id]);

  return (
    <>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 bg-card border-b-2 border-border px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {t('orderDetails')}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Action Buttons in Header */}
              {onPrintReceipt && (
                <button
                  onClick={() => onPrintReceipt(order)}
                  className="px-4 py-2 rounded-xl font-semibold border-2 border-border text-foreground transition-all hover:bg-muted flex items-center gap-2"
                >
                  <Printer className="w-5 h-5" />
                  {t('printReceipt')}
                </button>
              )}
              
              {onEdit && (
                <button
                  onClick={() => onEdit(order)}
                  className="px-4 py-2 rounded-xl font-semibold border-2 border-border text-foreground transition-all hover:bg-muted flex items-center gap-2"
                >
                  <Edit className="w-5 h-5" />
                  {t('edit')}
                </button>
              )}
              
              {onDelete && (
                <button
                  onClick={() => onDelete(order)}
                  className="px-4 py-2 rounded-xl font-semibold border-2 border-destructive/30 text-destructive transition-all hover:bg-destructive/10 flex items-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  {t('delete')}
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
                  {t('collectPayment')}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex-shrink-0 bg-card border-b-2 border-border px-8">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex items-center gap-2 px-1 py-3 border-b-2 text-sm transition-colors ${
                activeTab === 'details'
                  ? 'font-bold border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              {t('orderDetails')}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-1 py-3 border-b-2 text-sm transition-colors ${
                activeTab === 'history'
                  ? 'font-bold border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Clock className="w-4 h-4" />
              {t('paymentHistory')}
              {order.paymentHistory && order.paymentHistory.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-[#FFF7ED] text-[#FE7410] rounded-full text-xs font-bold">
                  {order.paymentHistory.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content - Scrollable with 2 columns */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Left Column - Main Info (2/3) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tab Content: Chi tiết đơn hàng */}
              {activeTab === 'details' && (
                <>
                  {/* Order Items */}
                  <div className="bg-card rounded-xl border-2 border-border p-6">
                    <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                      {t('orderItems')}
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-border">
                            <th className="text-left py-3 px-4 text-sm font-bold text-muted-foreground">
                              {t('productName')}
                            </th>
                            <th className="text-center py-3 px-4 text-sm font-bold text-muted-foreground">
                              {t('quantity')}
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-bold text-muted-foreground">
                              {t('price')}
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-bold text-muted-foreground">
                              {t('total')}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item: any, index: number) => (
                            <tr key={index} className="border-b border-border hover:bg-muted/50">
                              <td className="py-3 px-4 text-base text-foreground">
                                {item.name}
                                {item.type && (
                                  <span className="ml-2 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                    {item.type === 'product' && t('product')}
                                    {item.type === 'service' && t('service')}
                                    {item.type === 'package' && t('package')}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-base text-center text-foreground font-semibold">
                                {item.quantity}
                              </td>
                              <td className="py-3 px-4 text-base text-right text-foreground">
                                {item.price.toLocaleString()}đ
                              </td>
                              <td className="py-3 px-4 text-base text-right font-semibold text-foreground">
                                {(item.price * item.quantity).toLocaleString()}đ
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-b border-border">
                            <td colSpan={3} className="py-3 px-4 text-right font-semibold text-muted-foreground text-base">
                              {t('subtotal')}:
                            </td>
                            <td className="py-3 px-4 text-right font-semibold text-foreground text-base">
                              {(order.subtotal || order.total).toLocaleString()}đ
                            </td>
                          </tr>
                          {order.discount && order.discount > 0 ? (
                            <tr className="border-b border-border">
                              <td colSpan={3} className="py-3 px-4 text-right font-semibold text-muted-foreground text-base">
                                {t('discount')}:
                              </td>
                              <td className="py-3 px-4 text-right font-semibold text-destructive text-base">
                                -{order.discount.toLocaleString()}đ
                              </td>
                            </tr>
                          ) : null}
                          <tr className="bg-muted border-b-2 border-border">
                            <td colSpan={3} className="py-4 px-4 text-right font-bold text-foreground text-lg">
                              {t('totalPayment')}:
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
                              <tr className="bg-muted">
                                <td colSpan={3} className="py-4 px-4 text-right font-bold text-foreground text-lg">
                                  {t('customerPaid')}:
                                </td>
                                <td className={`py-4 px-4 text-right font-bold text-2xl ${
                                  isUnderPaid || receivedAmount === 0 ? 'text-destructive' : 'text-green-600 dark:text-green-500'
                                }`}>
                                  {displayAmount.toLocaleString()}đ
                                </td>
                              </tr>
                            );
                          })() : null}
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Customer Information */}
                  {(order.customerName || order.customerPhone) && (
                    <div className="bg-card rounded-xl border-2 border-blue-200 dark:border-blue-900 p-6">
                      <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-muted-foreground" />
                        {t('customerInfo')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {order.customerName && (
                          <div className="bg-blue-50 dark:bg-blue-950 rounded-xl p-4">
                            <div className="text-sm text-blue-700 dark:text-blue-400 mb-1">{t('customerName')}</div>
                            <div className="font-semibold text-blue-900 dark:text-blue-300 text-base">
                              {order.customerName}
                            </div>
                          </div>
                        )}
                        {order.customerPhone && (
                          <div className="bg-blue-50 dark:bg-blue-950 rounded-xl p-4">
                            <div className="text-sm text-blue-700 dark:text-blue-400 mb-1 flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {t('phoneNumber')}
                            </div>
                            <div className="font-semibold text-blue-900 dark:text-blue-300 text-base">
                              {order.customerPhone}
                            </div>
                          </div>
                        )}
                        {order.note && (
                          <div className="bg-blue-50 dark:bg-blue-950 rounded-xl p-4 md:col-span-2">
                            <div className="text-sm text-blue-700 dark:text-blue-400 mb-1 flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              {t('note')}
                            </div>
                            <div className="text-blue-900 dark:text-blue-300 text-base whitespace-pre-wrap">
                              {order.note}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Payment Information (if paid) */}
                  {isPaid && order.paymentMethod && (
                    <div className="bg-card rounded-xl border-2 border-green-200 dark:border-green-900 p-6">
                      <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-green-600 dark:text-green-500" />
                        {t('paymentInfo')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-green-50 dark:bg-green-950 rounded-xl p-4">
                          <div className="text-sm text-green-700 dark:text-green-400 mb-1">{t('paymentMethod')}</div>
                          <div className="font-semibold text-green-900 dark:text-green-300 text-base">
                            {getPaymentMethodLabel(order.paymentMethod)}
                          </div>
                        </div>
                        {order.paidAt && (
                          <div className="bg-green-50 dark:bg-green-950 rounded-xl p-4">
                            <div className="text-sm text-green-700 dark:text-green-400 mb-1 flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {t('paymentTime')}
                            </div>
                            <div className="font-semibold text-green-900 dark:text-green-300 text-base">
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
                          <div className="bg-green-50 dark:bg-green-950 rounded-xl p-4">
                            <div className="text-sm text-green-700 dark:text-green-400 mb-1">{t('receivedAmount')}</div>
                            <div className="font-semibold text-green-900 dark:text-green-300 text-base">
                              {order.receivedAmount.toLocaleString()}đ
                            </div>
                          </div>
                        )}
                        {order.changeAmount !== undefined && order.changeAmount > 0 && (
                          <div className="bg-green-50 dark:bg-green-950 rounded-xl p-4">
                            <div className="text-sm text-green-700 dark:text-green-400 mb-1">{t('changeAmount')}</div>
                            <div className="font-semibold text-green-900 dark:text-green-300 text-base">
                              {order.changeAmount.toLocaleString()}đ
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Tab Content: Lịch sử thanh toán */}
              {activeTab === 'history' && (
                <div className="bg-card rounded-xl border-2 border-border p-6">
                  <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    {t('paymentHistory')}
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
                            className="border-2 border-border rounded-xl p-4 hover:border-[#FE7410] transition-colors"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFF7ED' }}>
                                  <DollarSign className="w-5 h-5" style={{ color: '#FE7410' }} />
                                </div>
                                <div>
                                  <div className="font-bold text-foreground">
                                    {paymentCode}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
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
                                <div className="font-bold text-xl text-green-600 dark:text-green-500">
                                  +{displayAmount.toLocaleString()}đ
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {getPaymentMethodLabel(payment.paymentMethod)}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                              <div className="bg-muted rounded-lg p-3">
                                <div className="text-xs text-muted-foreground mb-1">{t('cashier')}</div>
                                <div className="font-semibold text-foreground">{payment.paidBy || 'N/A'}</div>
                              </div>
                              
                              {shouldShowChange ? (
                                <div className="bg-green-50 dark:bg-green-950 rounded-lg p-3">
                                  <div className="text-xs text-green-700 dark:text-green-400 mb-1">{t('changeAmount')}</div>
                                  <div className="font-semibold text-green-600 dark:text-green-500">
                                    {payment.changeAmount.toLocaleString()}đ
                                  </div>
                                </div>
                              ) : shouldShowRemaining ? (
                                <div className="bg-red-50 dark:bg-red-950 rounded-lg p-3">
                                  <div className="text-xs text-red-700 dark:text-red-400 mb-1">{t('remaining')}</div>
                                  <div className="font-semibold text-red-600 dark:text-red-500">
                                    {Math.abs(payment.changeAmount).toLocaleString()}đ
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3">
                                  <div className="text-xs text-blue-700 dark:text-blue-400 mb-1">{t('status')}</div>
                                  <div className="font-semibold text-blue-600 dark:text-blue-500">{t('exact')}</div>
                                </div>
                              )}
                            </div>

                            {payment.note && (
                              <div className="mt-3 pt-3 border-t border-border">
                                <div className="text-xs text-muted-foreground mb-1">{t('note')}</div>
                                <div className="text-sm text-foreground">{payment.note}</div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">{t('noPaymentHistory')}</p>
                      <p className="text-sm text-muted-foreground mt-1">{t('paymentHistoryDesc')}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Summary & Quick Info (1/3) */}
            <div className="lg:col-span-1 space-y-6">
              {/* Total Summary - Sticky */}
              <div className="bg-card rounded-xl border-2 border-border p-6 lg:sticky lg:top-6">
                <h3 className="text-base font-bold text-foreground mb-4">
                  {t('orderSummary')}
                </h3>
                
                {/* Order ID */}
                <div className="bg-muted rounded-xl p-4 mb-4">
                  <div className="text-sm text-muted-foreground mb-1">{t('orderNumber')}</div>
                  <div className="font-bold text-foreground text-lg">#{order.id.slice(-8).toUpperCase()}</div>
                </div>

                {/* Created By */}
                <div className="bg-muted rounded-xl p-4 mb-4">
                  <div className="text-sm text-muted-foreground mb-1">{t('createdBy')}</div>
                  <div className="font-semibold text-foreground">{order.createdBy || t('system')}</div>
                </div>

                {/* Order Date & Time */}
                <div className="bg-muted rounded-xl p-4 mb-4">
                  <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                    {t('orderDate')}
                  </div>
                  <div className="font-semibold text-foreground">
                    {new Date(order.date).toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {new Date(order.date).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </div>
                </div>

                {/* Total Items */}
                <div className="bg-blue-50 dark:bg-blue-950 rounded-xl p-4 mb-4">
                  <div className="text-sm text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1">
                    {t('totalItems')}
                  </div>
                  <div className="font-bold text-blue-900 dark:text-blue-300 text-lg">
                    {order.items.reduce((sum: number, item: any) => sum + item.quantity, 0)} {t('items')}
                  </div>
                </div>

                {/* Total Amount */}
                <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: '#FFF5EE', border: '2px solid #FE7410' }}>
                  <div className="text-sm mb-1" style={{ color: '#FE7410' }}>
                    {t('totalPayment')}
                  </div>
                  <div className="font-bold text-3xl" style={{ color: '#FE7410' }}>
                    {order.total.toLocaleString()}đ
                  </div>
                </div>

                {/* Discount */}
                {order.discount && order.discount > 0 && (
                  <div className="rounded-xl p-4 mb-4 bg-red-50 dark:bg-red-950 border-2 border-red-200 dark:border-red-900">
                    <div className="text-sm mb-1 text-red-700 dark:text-red-400">
                      {t('discount')}
                    </div>
                    <div className="font-bold text-xl text-red-600 dark:text-red-500">
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
                        ? 'bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-900'
                        : 'bg-green-50 dark:bg-green-950 border-green-300 dark:border-green-900'
                    }`}>
                      <div className={`text-sm mb-1 ${
                        isUnderPaid ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'
                      }`}>
                        {t('customerPaid')}
                      </div>
                      <div className={`font-bold text-xl ${
                        isUnderPaid ? 'text-red-600 dark:text-red-500' : 'text-green-600 dark:text-green-500'
                      }`}>
                        {displayAmount.toLocaleString()}đ
                      </div>
                      {isUnderPaid && (
                        <div className="text-sm text-red-600 dark:text-red-500 mt-2">
                          {t('remaining')}: {remainingAmount.toLocaleString()}đ
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Change Amount */}
                {order.changeAmount !== undefined && order.changeAmount > 0 && (
                  <div className="rounded-xl p-4 bg-green-50 dark:bg-green-950 border-2 border-green-200 dark:border-green-900">
                    <div className="text-sm mb-1 text-green-700 dark:text-green-400">
                      {t('changeAmount')}
                    </div>
                    <div className="font-bold text-xl text-green-600 dark:text-green-500">
                      {order.changeAmount.toLocaleString()}đ
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-[100] p-4">
          <div className="bg-card rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b-2 border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">{t('collectPayment')}</h2>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Remaining Amount */}
              <div className="bg-[#FFF5EE] rounded-xl p-4 border-2" style={{ borderColor: '#FE7410' }}>
                <div className="text-sm mb-1" style={{ color: '#FE7410' }}>
                  {t('amountToPay')}
                </div>
                <div className="font-bold text-3xl" style={{ color: '#FE7410' }}>
                  {remainingAmount.toLocaleString()}đ
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  {t('paymentMethod')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                          paymentMethod === method.id
                            ? 'border-[#FE7410] bg-[#FFF7ED]'
                            : 'border-border bg-card hover:border-muted-foreground'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${
                          paymentMethod === method.id ? 'text-[#FE7410]' : 'text-muted-foreground'
                        }`} />
                        <span className={`text-xs font-medium ${
                          paymentMethod === method.id ? 'text-[#FE7410]' : 'text-foreground'
                        }`}>
                          {method.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Customer Amount */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  {t('customerPays')}
                </label>
                <input
                  type="number"
                  value={customerAmount}
                  onChange={(e) => setCustomerAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-border bg-input-background text-foreground text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="0"
                />
              </div>

              {/* Change */}
              {change > 0 && (
                <div className="bg-green-50 dark:bg-green-950 rounded-xl p-4 border-2 border-green-200 dark:border-green-900">
                  <div className="text-sm text-green-700 dark:text-green-400 mb-1">
                    {t('changeAmount')}
                  </div>
                  <div className="font-bold text-2xl text-green-600 dark:text-green-500">
                    {change.toLocaleString()}đ
                  </div>
                </div>
              )}

              {/* Payment Note */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  {t('note')} ({t('optional')})
                </label>
                <textarea
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  rows={3}
                  placeholder={t('addNote')}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold border-2 border-border text-foreground hover:bg-muted transition-all"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleCompletePayment}
                  disabled={!customerAmount || parseFloat(customerAmount) <= 0}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#FE7410' }}
                >
                  <Check className="w-5 h-5" />
                  {t('confirm')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
