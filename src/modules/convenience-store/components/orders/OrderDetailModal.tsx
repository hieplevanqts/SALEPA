import { X, MapPin, Clock, MessageSquare, ShoppingBag, User, Phone, Package } from 'lucide-react';
import { useTranslation } from '../../../../lib/convenience-store-lib/useTranslation';
import { useStore } from '../../../../lib/convenience-store-lib/store';
import { ChatBox } from '../chat/ChatBox';
import type { Order, SelfServiceOrder } from '../../../../lib/convenience-store-lib/store';

interface OrderDetailModalProps {
  order: Order | SelfServiceOrder | null;
  onClose: () => void;
}

export function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  const { t } = useTranslation();
  const { addMessageToOrder, updateOrderStatus } = useStore();

  if (!order) return null;

  // Check if this is a self-service order
  const isSelfServiceOrder = (order: Order | SelfServiceOrder): order is SelfServiceOrder => {
    return 'status' in order && 'orderType' in order;
  };

  const selfServiceOrder = isSelfServiceOrder(order) ? order : null;

  const handleSendMessage = (message: string, sender: 'customer' | 'staff', senderName: string) => {
    addMessageToOrder(order.id, {
      sender,
      senderName,
      message,
    });
  };

  const handleStatusChange = (status: SelfServiceOrder['status']) => {
    if (selfServiceOrder) {
      updateOrderStatus(order.id, status);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      confirmed: 'bg-blue-100 text-blue-700 border-blue-300',
      preparing: 'bg-purple-100 text-purple-700 border-purple-300',
      ready: 'bg-green-100 text-green-700 border-green-300',
      served: 'bg-gray-100 text-gray-700 border-gray-300',
      cancelled: 'bg-red-100 text-red-700 border-red-300',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getStatusText = (status: string) => {
    const texts = {
      pending: t('pending'),
      confirmed: t('confirmed'),
      preparing: t('preparing'),
      ready: t('ready'),
      served: t('served'),
      cancelled: t('cancelled'),
    };
    return texts[status as keyof typeof texts] || status;
  };

  const getPaymentMethodText = (method: string) => {
    const methods: { [key: string]: string } = {
      cash: t('cash'),
      card: t('card'),
      transfer: t('transfer'),
      momo: 'MoMo',
      zalopay: 'ZaloPay',
      vnpay: 'VNPay',
    };
    return methods[method] || method;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{t('orderDetails')}</h2>
                <p className="text-sm text-blue-100">
                  {t('order')} #{order.id.slice(-8).toUpperCase()}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Status and Type */}
          <div className="flex items-center gap-3">
            {selfServiceOrder && (
              <>
                <div className={`px-3 py-1 rounded-full border-2 ${getStatusColor(selfServiceOrder.status)} font-medium text-sm`}>
                  {getStatusText(selfServiceOrder.status)}
                </div>
                <div className="px-3 py-1 rounded-full bg-white/20 font-medium text-sm">
                  {selfServiceOrder.orderType === 'dine-in' ? '🍽️ ' + t('dineIn') : '📦 ' + t('takeaway')}
                </div>
                {selfServiceOrder.tableName && (
                  <div className="px-3 py-1 rounded-full bg-white/20 font-medium text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {selfServiceOrder.tableName}
                  </div>
                )}
              </>
            )}
            <div className="ml-auto px-3 py-1 rounded-full bg-white/20 font-medium text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {new Date(order.date).toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Side - Order Details */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Customer Information */}
            {(order.customerName || order.customerPhone || order.note) && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border-2 border-blue-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                  <User className="w-5 h-5 text-blue-600" />
                  {t('customerInfo')}
                </h3>
                <div className="space-y-3">
                  {order.customerName && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">{t('customerName')}</div>
                        <div className="font-semibold text-gray-900">{order.customerName}</div>
                      </div>
                    </div>
                  )}
                  {order.customerPhone && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Phone className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">{t('phoneNumber')}</div>
                        <div className="font-semibold text-gray-900">{order.customerPhone}</div>
                      </div>
                    </div>
                  )}
                  {order.note && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-1">{t('note')}</div>
                        <div className="text-gray-900 bg-white p-3 rounded-lg border border-purple-200">
                          {order.note}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b-2 border-gray-200">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                  <Package className="w-5 h-5 text-gray-700" />
                  {t('orderItems')} ({order.items.length})
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <ShoppingBag className="w-8 h-8 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-lg mb-1">{item.name}</h4>
                      <div className="text-sm text-gray-500 mb-2">
                        {item.category} {item.barcode && `• ${item.barcode}`}
                      </div>

                      {/* Show selected options */}
                      {item.selectedOptions && item.selectedOptions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {item.selectedOptions.map((opt, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-medium border border-blue-200"
                            >
                              {opt.choiceName}
                              {opt.priceModifier !== 0 && (
                                <span className="text-blue-600">
                                  (+{opt.priceModifier.toLocaleString()}đ)
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      )}

                      {item.note && (
                        <div className="text-sm text-gray-600 bg-yellow-50 p-2 rounded-lg mb-2 border border-yellow-200">
                          <MessageSquare className="w-3 h-3 inline mr-1" />
                          <span className="italic">{item.note}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          <span className="font-semibold text-gray-900">×{item.quantity}</span>
                          {' × '}
                          <span className="font-semibold text-blue-600">
                            {item.price.toLocaleString()}đ
                          </span>
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {(item.quantity * item.price).toLocaleString()}đ
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border-2 border-green-200">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">{t('payment')}</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>{t('subtotal')}</span>
                  <span className="font-semibold">{order.subtotal.toLocaleString()}đ</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{t('discount')}</span>
                    <span className="font-semibold">-{order.discount.toLocaleString()}đ</span>
                  </div>
                )}
                <div className="border-t-2 border-green-300 pt-3 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">{t('total')}</span>
                  <span className="text-2xl font-bold text-green-600">
                    {order.total.toLocaleString()}đ
                  </span>
                </div>
                <div className="border-t border-green-200 pt-3">
                  <div className="text-sm text-gray-600 mb-1">{t('paymentMethod')}</div>
                  {order.paymentMethods && order.paymentMethods.length > 0 ? (
                    <div className="space-y-1">
                      {order.paymentMethods.map((pm, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white p-2 rounded-lg">
                          <span className="font-medium text-gray-900">
                            {getPaymentMethodText(pm.method)}
                          </span>
                          <span className="font-bold text-gray-900">
                            {pm.amount.toLocaleString()}đ
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white p-2 rounded-lg">
                      <span className="font-medium text-gray-900">
                        {getPaymentMethodText(order.paymentMethod)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Status Update (for self-service orders) */}
            {selfServiceOrder && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border-2 border-purple-200">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">{t('updateStatus') || 'Update Status'}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status as SelfServiceOrder['status'])}
                      className={`px-4 py-3 rounded-xl font-medium transition-all ${
                        selfServiceOrder.status === status
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                      }`}
                    >
                      {getStatusText(status)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Chat */}
          {selfServiceOrder && (
            <div className="w-96 xl:w-[28rem] bg-white border-l-2 border-gray-200 flex flex-col">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-5 flex-shrink-0">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
                  <MessageSquare className="w-5 h-5" />
                  {t('chatWithCustomer') || 'Chat with Customer'}
                </h3>
                <p className="text-sm text-purple-100">
                  {order.customerName || t('customer')}
                </p>
              </div>

              <div className="flex-1 min-h-0">
                <ChatBox
                  messages={order.messages || []}
                  onSendMessage={handleSendMessage}
                  currentUser="staff"
                  currentUserName={t('staff')}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
