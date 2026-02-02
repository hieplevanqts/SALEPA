import { useState, useMemo } from 'react';
import { useStore } from '../../../../lib/spa-lib/store';
import { useTranslation } from '../../../../lib/spa-lib/useTranslation';
import { Search, Calendar, DollarSign, Package, Clock, CheckCircle, XCircle, CreditCard, Printer, ChevronDown, Users, MessageSquare, X } from 'lucide-react';
import { CardPaymentForm, type CardData } from '../../components/forms/CardPaymentForm';
import { QRPaymentForm, type QRPaymentData } from '../../components/forms/QRPaymentForm';
import { OrderDetailFullScreen } from '../orders/OrderDetailFullScreen'; // Full screen order detail

export function CashierOrderHistory() {
  const { orders: ordersRaw, updateOrder } = useStore();
  const { t } = useTranslation();
  
  // Normalize orders to array (handle persisted object format)
  const orders = Array.isArray(ordersRaw) ? ordersRaw : Object.values(ordersRaw || {});
  
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'week' | 'all'>('today');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('unpaid');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer' | 'momo' | 'zalopay' | 'vnpay'>('cash');
  const [receivedAmount, setReceivedAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<any>(null);
  const [isSplitPayment, setIsSplitPayment] = useState(false);
  const [splitPayments, setSplitPayments] = useState<{ method: string; amount: number }[]>([]);
  const [showQRCode, setShowQRCode] = useState(false);
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [qrData, setQRData] = useState<QRPaymentData | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [detailOrder, setDetailOrder] = useState<any>(null);

  // Get orders with filters
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    return orders
      .filter(order => {
        const orderDate = new Date(order.timestamp);
        
        // Date filter
        if (dateFilter === 'today' && orderDate < today) return false;
        if (dateFilter === 'yesterday' && (orderDate < yesterday || orderDate >= today)) return false;
        if (dateFilter === 'week' && orderDate < weekAgo) return false;
        
        // Status filter
        if (statusFilter === 'paid' && order.status !== 'completed') return false;
        if (statusFilter === 'unpaid' && order.status === 'completed') return false;
        
        // Search filter
        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          return (
            order.id.toLowerCase().includes(search) ||
            order.customerName?.toLowerCase().includes(search) ||
            order.customerPhone?.toLowerCase().includes(search)
          );
        }
        
        return true;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [orders, searchTerm, dateFilter, statusFilter]);

  const stats = useMemo(() => {
    const paidOrders = filteredOrders.filter(o => o.status === 'completed');
    const unpaidOrders = filteredOrders.filter(o => o.status !== 'completed');
    
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
    const totalPaid = paidOrders.length;
    const totalUnpaid = unpaidOrders.length;
    const unpaidAmount = unpaidOrders.reduce((sum, o) => sum + o.total, 0);

    return { totalRevenue, totalPaid, totalUnpaid, unpaidAmount };
  }, [filteredOrders]);

  const handleCollectPayment = (order: any) => {
    setSelectedOrder(order);
    setReceivedAmount(order.total.toString());
    setPaymentMethod(order.paymentMethod || 'cash');
    setIsSplitPayment(false);
    setSplitPayments([]);
    setShowQRCode(false);
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = () => {
    if (!selectedOrder) return;

    if (isSplitPayment) {
      // Split payment validation
      const totalPaid = splitPayments.reduce((sum, p) => sum + p.amount, 0);
      if (totalPaid < selectedOrder.total) {
        alert(t('insufficientAmount') || 'Insufficient amount');
        return;
      }

      // Update order with split payments
      updateOrder(selectedOrder.id, {
        status: 'completed',
        paymentMethods: splitPayments,
        paidAt: new Date().toISOString(),
        receivedAmount: totalPaid,
        changeAmount: totalPaid - selectedOrder.total,
        note: paymentNote,
      });
    } else {
      // Single payment validation
      const received = parseFloat(receivedAmount);
      if (isNaN(received) || received < selectedOrder.total) {
        alert(t('insufficientAmount') || 'Insufficient amount');
        return;
      }

      // Update order status
      updateOrder(selectedOrder.id, {
        status: 'completed',
        paymentMethod,
        paidAt: new Date().toISOString(),
        receivedAmount: received,
        changeAmount: received - selectedOrder.total,
        note: paymentNote,
      });
    }

    // Show receipt
    setReceiptOrder(selectedOrder);
    setShowPaymentModal(false);
    setShowReceipt(true);
  };

  const handleAddSplitPayment = () => {
    const amount = parseFloat(receivedAmount);
    if (isNaN(amount) || amount <= 0) return;

    setSplitPayments([...splitPayments, { method: paymentMethod, amount }]);
    setReceivedAmount('');
  };

  const handleRemoveSplitPayment = (index: number) => {
    setSplitPayments(splitPayments.filter((_, i) => i !== index));
  };

  const totalSplitPaid = splitPayments.reduce((sum, p) => sum + p.amount, 0);
  const remainingAmount = selectedOrder ? selectedOrder.total - totalSplitPaid : 0;
  const change = selectedOrder ? (isSplitPayment ? totalSplitPaid : parseFloat(receivedAmount || '0')) - selectedOrder.total : 0;

  const handlePrintReceipt = () => {
    window.print();
    setShowReceipt(false);
    setReceiptOrder(null);
    setSelectedOrder(null);
    setReceivedAmount('');
  };

  const handleViewOrderDetail = (order: any) => {
    setDetailOrder(order);
    setShowOrderDetail(true);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Show full screen order detail */}
      {showOrderDetail && detailOrder ? (
        <OrderDetailFullScreen
          order={detailOrder}
          onClose={() => {
            setShowOrderDetail(false);
            setDetailOrder(null);
          }}
          onCollectPayment={(order) => {
            setShowOrderDetail(false);
            handleCollectPayment(order);
          }}
          onPrintReceipt={(order) => {
            setReceiptOrder(order);
            setShowOrderDetail(false);
            setShowReceipt(true);
          }}
        />
      ) : (
        <>
          {/* Stats Cards */}
          <div className="bg-white border-b-2 border-gray-200 p-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-green-100">{t('collected')}</p>
                    <p className="text-xl font-bold">{stats.totalRevenue.toLocaleString()}đ</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-blue-100">{t('paid')}</p>
                    <p className="text-xl font-bold">{stats.totalPaid}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <XCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-orange-100">{t('unpaid')}</p>
                    <p className="text-xl font-bold">{stats.totalUnpaid}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-red-100">{t('uncollected')}</p>
                    <p className="text-xl font-bold">{stats.unpaidAmount.toLocaleString()}đ</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('searchOrder')}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                />
              </div>

              {/* Status Filter */}
              <div className="flex gap-2">
                {[
                  { value: 'all', label: t('all'), color: 'gray' },
                  { value: 'unpaid', label: t('unpaid'), color: 'orange' },
                  { value: 'paid', label: t('paid'), color: 'green' },
                ].map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setStatusFilter(filter.value as any)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      statusFilter === filter.value
                        ? filter.color === 'green' 
                          ? 'bg-green-600 text-white shadow-lg'
                          : filter.color === 'orange'
                          ? 'bg-orange-600 text-white shadow-lg'
                          : 'bg-gray-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* Date Filter */}
              <div className="flex gap-2">
                {[
                  { value: 'today', label: t('today') },
                  { value: 'yesterday', label: t('yesterday') },
                  { value: 'week', label: t('last7Days') },
                  { value: 'all', label: t('allTime') },
                ].map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setDateFilter(filter.value as any)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      dateFilter === filter.value
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Package className="w-20 h-20 mb-4 opacity-50" />
                <p className="text-lg font-semibold">{t('noOrdersFound')}</p>
                <p className="text-sm">{t('adjustFilters')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order) => {
                  const isPaid = order.status === 'completed';
                  
                  return (
                    <div
                      key={order.id}
                      className={`bg-white rounded-xl border-2 p-4 hover:shadow-lg transition-all ${
                        isPaid ? 'border-green-200' : 'border-orange-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => handleViewOrderDetail(order)}
                            className={`w-12 h-12 rounded-lg flex items-center justify-center hover:scale-110 transition-transform cursor-pointer ${
                              isPaid ? 'bg-green-100 hover:bg-green-200' : 'bg-orange-100 hover:bg-orange-200'
                            }`}
                          >
                            <span className={`font-bold ${
                              isPaid ? 'text-green-600' : 'text-orange-600'
                            }`}>{order.id.slice(-4)}</span>
                          </button>
                          <div>
                            <button
                              onClick={() => handleViewOrderDetail(order)}
                              className="font-semibold text-gray-900 hover:text-blue-600 transition-colors text-left"
                            >
                              {order.customerName || t('walkInCustomer')}
                            </button>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Clock className="w-4 h-4" />
                              {new Date(order.timestamp).toLocaleString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                day: '2-digit',
                                month: '2-digit',
                              })}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            {order.total.toLocaleString()}đ
                          </p>
                          {isPaid ? (
                            <div className="mt-1">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {t('paid')}
                              </span>
                              <div className="mt-1">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                  order.paymentMethod === 'cash' 
                                    ? 'bg-green-100 text-green-700'
                                    : order.paymentMethod === 'card'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-purple-100 text-purple-700'
                                }`}>
                                  {order.paymentMethod === 'cash' && '💵 ' + t('cash')}
                                  {order.paymentMethod === 'card' && '💳 ' + t('card')}
                                  {order.paymentMethod === 'transfer' && '🏦 ' + t('transfer')}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleCollectPayment(order)}
                              className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                            >
                              <DollarSign className="w-4 h-4" />
                              {t('collectPayment') || t('payment')}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Items */}
                      <div className="border-t border-gray-100 pt-3 space-y-1">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">
                              <span className={`font-semibold ${
                                isPaid ? 'text-green-600' : 'text-orange-600'
                              }`}>{item.quantity}×</span> {item.name}
                            </span>
                            <span className="font-semibold text-gray-900">
                              {(item.price * item.quantity).toLocaleString()}đ
                            </span>
                          </div>
                        ))}
                      </div>

                      {order.note && (
                        <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                          <p className="text-xs text-yellow-800">
                            <span className="font-semibold">{t('note')}:</span> {order.note}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Payment Modal */}
          {showPaymentModal && selectedOrder && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  💰 {t('collectPayment') || t('payment')}
                </h3>

                {/* Order Info */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-blue-600 font-medium">{t('orderNumber')}</span>
                    <span className="font-bold text-blue-700">{selectedOrder.id.slice(-4)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-blue-600 font-medium">{t('customer')}</span>
                    <span className="font-semibold">{selectedOrder.customerName || t('walkInCustomer')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-600 font-medium">{t('total')}</span>
                    <span className="text-2xl font-bold text-blue-700">
                      {selectedOrder.total.toLocaleString()}đ
                    </span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('paymentMethod')}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'cash', label: t('cash'), icon: '💵' },
                      { value: 'card', label: t('card'), icon: '💳' },
                      { value: 'transfer', label: t('transfer'), icon: '🏦' },
                      { value: 'momo', label: 'Momo', icon: '📱' },
                      { value: 'zalopay', label: 'ZaloPay', icon: '📱' },
                      { value: 'vnpay', label: 'VNPay', icon: '📱' },
                    ].map((method) => (
                      <button
                        key={method.value}
                        onClick={() => setPaymentMethod(method.value as any)}
                        className={`p-3 rounded-xl border-2 font-semibold transition-all ${
                          paymentMethod === method.value
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{method.icon}</div>
                        <div className="text-xs">{method.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card Payment Form */}
                {paymentMethod === 'card' && (
                  <div className="mb-4">
                    <CardPaymentForm
                      amount={selectedOrder.total}
                      onSuccess={(data) => {
                        setCardData(data);
                        handleConfirmPayment();
                      }}
                      onCancel={() => setPaymentMethod('cash')}
                    />
                  </div>
                )}

                {/* QR Payment Form */}
                {paymentMethod === 'transfer' && (
                  <div className="mb-4">
                    <QRPaymentForm
                      amount={selectedOrder.total}
                      orderCode={selectedOrder.id}
                      paymentType={paymentMethod}
                      onSuccess={(data) => {
                        setQRData(data);
                        handleConfirmPayment();
                      }}
                      onCancel={() => setPaymentMethod('cash')}
                    />
                  </div>
                )}

                {/* QR Payment Form for E-wallets */}
                {(paymentMethod === 'momo' || paymentMethod === 'zalopay' || paymentMethod === 'vnpay') && (
                  <div className="mb-4">
                    <QRPaymentForm
                      amount={selectedOrder.total}
                      orderCode={selectedOrder.id}
                      paymentType={paymentMethod}
                      onSuccess={(data) => {
                        setQRData(data);
                        handleConfirmPayment();
                      }}
                      onCancel={() => setPaymentMethod('cash')}
                    />
                  </div>
                )}

                {/* Received Amount */}
                {paymentMethod === 'cash' && (
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('receivedAmount') || t('amount')}
                    </label>
                    <div className="relative mb-2">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={receivedAmount}
                        onChange={(e) => setReceivedAmount(e.target.value)}
                        placeholder="0"
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 text-lg font-semibold"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && receivedAmount && change >= 0) {
                            handleConfirmPayment();
                          }
                        }}
                      />
                    </div>
                    
                    {/* Quick Amount Buttons */}
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: t('exact') || 'Exact', value: selectedOrder.total },
                        { label: '50K', value: 50000 },
                        { label: '100K', value: 100000 },
                        { label: '200K', value: 200000 },
                        { label: '500K', value: 500000 },
                        { label: '1M', value: 1000000 },
                      ].map((btn) => (
                        <button
                          key={btn.label}
                          onClick={() => setReceivedAmount(btn.value.toString())}
                          className="px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-sm font-semibold text-blue-700 transition-colors"
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Split Payment */}
                {isSplitPayment && (
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('splitPayment')}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleAddSplitPayment}
                        className="px-3 py-2 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-sm font-semibold text-green-700 transition-colors"
                      >
                        {t('addPayment')}
                      </button>
                      <button
                        onClick={() => setIsSplitPayment(false)}
                        className="px-3 py-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-sm font-semibold text-red-700 transition-colors"
                      >
                        {t('cancelSplit')}
                      </button>
                    </div>
                    <div className="mt-2">
                      {splitPayments.map((payment, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg mb-2">
                          <div className="flex items-center">
                            <div className="text-2xl mb-1">{payment.method === 'cash' ? '💵' : payment.method === 'card' ? '💳' : payment.method === 'transfer' ? '🏦' : '📱'}</div>
                            <div className="text-xs">{payment.method}</div>
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            {payment.amount.toLocaleString()}đ
                          </div>
                          <button
                            onClick={() => handleRemoveSplitPayment(index)}
                            className="px-3 py-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-sm font-semibold text-red-700 transition-colors"
                          >
                            {t('remove')}
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {t('remainingAmount')}: {remainingAmount.toLocaleString()}đ
                      </p>
                    </div>
                  </div>
                )}

                {/* Change */}
                {change >= 0 && receivedAmount && (
                  <div className={`mb-4 p-4 rounded-xl ${
                    change > 0 ? 'bg-yellow-50 border-2 border-yellow-200' : 'bg-green-50 border-2 border-green-200'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${change > 0 ? 'text-yellow-700' : 'text-green-700'}`}>
                        {t('change')}:
                      </span>
                      <span className={`text-2xl font-bold ${change > 0 ? 'text-yellow-700' : 'text-green-700'}`}>
                        {change.toLocaleString()}đ
                      </span>
                    </div>
                  </div>
                )}

                {/* Payment Note */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('note') || 'Ghi chú'}
                  </label>
                  <textarea
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    placeholder={t('addNoteOptional') || 'Thêm ghi chú (không bắt buộc)'}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-base resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowPaymentModal(false);
                      setSelectedOrder(null);
                      setReceivedAmount('');
                    }}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={handleConfirmPayment}
                    disabled={!receivedAmount || change < 0}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('confirm')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Receipt Modal */}
          {showReceipt && receiptOrder && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  🖨️ {t('receipt')}
                </h3>

                {/* Order Info */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-blue-600 font-medium">{t('orderNumber')}</span>
                    <span className="font-bold text-blue-700">{receiptOrder.id.slice(-4)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-blue-600 font-medium">{t('customer')}</span>
                    <span className="font-semibold">{receiptOrder.customerName || t('walkInCustomer')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-600 font-medium">{t('total')}</span>
                    <span className="text-2xl font-bold text-blue-700">
                      {receiptOrder.total.toLocaleString()}đ
                    </span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('paymentMethod')}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'cash', label: t('cash'), icon: '💵' },
                      { value: 'card', label: t('card'), icon: '💳' },
                      { value: 'transfer', label: t('transfer'), icon: '🏦' },
                    ].map((method) => (
                      <button
                        key={method.value}
                        onClick={() => setPaymentMethod(method.value as any)}
                        className={`p-3 rounded-xl border-2 font-semibold transition-all ${
                          paymentMethod === method.value
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{method.icon}</div>
                        <div className="text-xs">{method.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Received Amount */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('receivedAmount') || t('amount')}
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={receivedAmount}
                      onChange={(e) => setReceivedAmount(e.target.value)}
                      placeholder="0"
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 text-lg font-semibold"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Change */}
                {change >= 0 && receivedAmount && (
                  <div className={`mb-4 p-4 rounded-xl ${
                    change > 0 ? 'bg-yellow-50 border-2 border-yellow-200' : 'bg-green-50 border-2 border-green-200'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${change > 0 ? 'text-yellow-700' : 'text-green-700'}`}>
                        {t('change')}:
                      </span>
                      <span className={`text-2xl font-bold ${change > 0 ? 'text-yellow-700' : 'text-green-700'}`}>
                        {change.toLocaleString()}đ
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowReceipt(false);
                      setReceiptOrder(null);
                      setReceivedAmount('');
                    }}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={handlePrintReceipt}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
                  >
                    {t('print')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}