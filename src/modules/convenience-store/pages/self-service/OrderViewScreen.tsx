import { ArrowLeft, MapPin, MessageSquare, ShoppingBag } from 'lucide-react';
import { useTranslation } from '../../../../lib/convenience-store-lib/useTranslation';
import { ChatBox } from '../../components/chat/ChatBox';
import type { SelfServiceOrder } from '../../../../lib/convenience-store-lib/store';

interface OrderViewScreenProps {
  order: SelfServiceOrder | null;
  onBack: () => void;
  onSendMessage: (message: string, sender: 'customer' | 'staff', senderName: string) => void;
  onOrderNew: () => void;
}

export function OrderViewScreen({ order, onBack, onSendMessage, onOrderNew }: OrderViewScreenProps) {
  const { t } = useTranslation();

  if (!order) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-500">{t('noOrder') || 'No order found'}</p>
          <button
            onClick={onBack}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            {t('back')}
          </button>
        </div>
      </div>
    );
  }

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
      pending: t('pending') || 'Pending',
      confirmed: t('confirmed') || 'Confirmed',
      preparing: t('preparing') || 'Preparing',
      ready: t('ready') || 'Ready',
      served: t('served') || 'Served',
      cancelled: t('cancelled') || 'Cancelled',
    };
    return texts[status as keyof typeof texts] || status;
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/20 rounded-lg transition-all"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{t('orderDetails')}</h1>
            <p className="text-sm text-blue-100">
              {t('order')} #{order.id.slice(-6)}
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full border-2 ${getStatusColor(order.status)} font-medium text-sm`}>
            {getStatusText(order.status)}
          </div>
        </div>

        {/* Table Info */}
        <div className="bg-white/10 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            <div>
              <div className="font-bold">{order.tableName}</div>
              <div className="text-xs text-blue-100">{order.orderType === 'dine-in' ? '🍽️ Dine In' : '📦 Takeaway'}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-blue-100">{t('orderedAt') || 'Ordered at'}</div>
            <div className="text-sm font-medium">
              {new Date(order.date).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Split Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side - Order Details */}
        <div className="lg:flex-1 overflow-y-auto p-4 space-y-4">
          {/* Order Items */}
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              {t('orderItems')}
            </h2>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900">{item.name}</h3>
                    <div className="text-xs text-gray-500">{item.category}</div>
                    
                    {/* Show selected options */}
                    {item.selectedOptions && item.selectedOptions.length > 0 && (
                      <div className="text-xs text-blue-600 mt-1">
                        {item.selectedOptions.map((opt, idx) => (
                          <span key={idx} className="inline-block bg-blue-50 px-1.5 py-0.5 rounded mr-1">
                            {opt.choiceName}
                          </span>
                        ))}
                      </div>
                    )}

                    {item.note && (
                      <div className="text-xs text-gray-500 mt-1 italic">
                        <MessageSquare className="w-3 h-3 inline mr-1" />
                        {item.note}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-gray-600">
                        {item.quantity}x {item.price.toLocaleString()}đ
                      </span>
                      <span className="font-bold text-blue-600">
                        {(item.quantity * item.price).toLocaleString()}đ
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{t('subtotal')}</span>
                <span className="font-semibold">{order.subtotal.toLocaleString()}đ</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>{t('discount')}</span>
                  <span>-{order.discount.toLocaleString()}đ</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                <span className="font-bold text-gray-900">{t('total')}</span>
                <span className="text-2xl font-bold text-blue-600">
                  {order.total.toLocaleString()}đ
                </span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          {(order.customerName || order.customerPhone || order.note) && (
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <h2 className="font-bold text-gray-900 mb-3">{t('customerInfo') || 'Customer Information'}</h2>
              <div className="space-y-2 text-sm">
                {order.customerName && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">{t('name')}:</span>
                    <span className="font-medium text-gray-900">{order.customerName}</span>
                  </div>
                )}
                {order.customerPhone && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">{t('phone')}:</span>
                    <span className="font-medium text-gray-900">{order.customerPhone}</span>
                  </div>
                )}
                {order.note && (
                  <div>
                    <span className="text-gray-500">{t('note')}:</span>
                    <p className="mt-1 text-gray-900 bg-gray-50 p-2 rounded-lg">{order.note}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order New Button (Mobile) */}
          <button
            onClick={onOrderNew}
            className="lg:hidden w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl hover:shadow-lg transition-all font-bold flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-5 h-5" />
            {t('orderNewItems')}
          </button>
        </div>

        {/* Right Side - Chat */}
        <div className="lg:w-96 xl:w-[28rem] bg-white border-t-2 lg:border-t-0 lg:border-l-2 border-gray-200 flex flex-col shadow-lg">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              {t('chatWithStaff')}
            </h2>
            <p className="text-sm text-blue-100">
              {t('askQuestions') || 'Ask questions about your order'}
            </p>
          </div>

          <div className="flex-1 min-h-0">
            <ChatBox
              messages={order.messages || []}
              onSendMessage={onSendMessage}
              currentUser="customer"
              currentUserName={order.customerName || t('customer') || 'Customer'}
            />
          </div>

          {/* Order New Button (Desktop) */}
          <div className="hidden lg:block border-t border-gray-200 p-4">
            <button
              onClick={onOrderNew}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl hover:shadow-lg transition-all font-bold flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              {t('orderNewItems')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
