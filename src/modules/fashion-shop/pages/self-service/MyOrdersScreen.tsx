import { ArrowLeft, ShoppingBag, Clock, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from '../../../../lib/fashion-shop-lib/useTranslation';
import type { SelfServiceOrder } from '../../../../lib/fashion-shop-lib/store';

interface MyOrdersScreenProps {
  orders: SelfServiceOrder[];
  currentTableId: string | undefined;
  onBack: () => void;
  onSelectOrder: (orderId: string) => void;
  onNewOrder: () => void;
}

export function MyOrdersScreen({ orders, currentTableId, onBack, onSelectOrder, onNewOrder }: MyOrdersScreenProps) {
  const { t } = useTranslation();

  // Filter orders for current table
  const myOrders = orders.filter(order => order.tableId === currentTableId);

  // Sort by date (newest first)
  const sortedOrders = [...myOrders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate statistics
  const totalAmount = myOrders.reduce((sum, order) => sum + order.total, 0);
  const pendingAmount = myOrders
    .filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status))
    .reduce((sum, order) => sum + order.total, 0);
  const completedAmount = myOrders
    .filter(o => ['ready', 'served'].includes(o.status))
    .reduce((sum, order) => sum + order.total, 0);
  const inProgressCount = myOrders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status)).length;

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="w-5 h-5" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
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
            <h1 className="text-xl font-bold">{t('myOrders') || 'My Orders'}</h1>
            <p className="text-sm text-blue-100">
              {myOrders.length} {t('orders')}
            </p>
          </div>
          <button
            onClick={onNewOrder}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-all font-medium flex items-center gap-2"
          >
            <ShoppingBag className="w-5 h-5" />
            {t('orderNewItems')}
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="flex-1 overflow-y-auto p-4">
        {sortedOrders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <ShoppingBag className="w-20 h-20 mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">{t('noOrdersYet') || 'No orders yet'}</p>
            <p className="text-sm mb-6">{t('startOrdering') || 'Start ordering now!'}</p>
            <button
              onClick={onNewOrder}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-bold"
            >
              {t('placeOrder')}
            </button>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            {/* Financial Summary Card */}
            <div className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 rounded-2xl shadow-lg p-5 border-2 border-green-200">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">{t('orderSummary') || 'Order Summary'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Amount */}
                <div className="bg-white rounded-xl p-4 shadow-md border-2 border-green-300">
                  <div className="text-xs text-gray-500 mb-1">{t('totalAmount') || 'Total Amount'}</div>
                  <div className="text-3xl font-bold text-green-600">{totalAmount.toLocaleString()}đ</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {myOrders.length} {t('orders')}
                  </div>
                </div>

                {/* Pending Amount */}
                <div className="bg-white rounded-xl p-4 shadow-md border-2 border-blue-300">
                  <div className="text-xs text-gray-500 mb-1">{t('pendingAmount') || 'In Progress'}</div>
                  <div className="text-3xl font-bold text-blue-600">{pendingAmount.toLocaleString()}đ</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {inProgressCount} {t('orders')}
                  </div>
                </div>

                {/* Completed Amount */}
                <div className="bg-white rounded-xl p-4 shadow-md border-2 border-purple-300">
                  <div className="text-xs text-gray-500 mb-1">{t('completedAmount') || 'Completed'}</div>
                  <div className="text-3xl font-bold text-purple-600">{completedAmount.toLocaleString()}đ</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {myOrders.filter(o => ['ready', 'served'].includes(o.status)).length} {t('orders')}
                  </div>
                </div>
              </div>
            </div>

            {sortedOrders.map((order) => {
              const hasUnreadMessages = order.messages && order.messages.length > 0 && 
                order.messages[order.messages.length - 1].sender === 'staff';
              
              return (
                <div
                  key={order.id}
                  onClick={() => onSelectOrder(order.id)}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer overflow-hidden border-2 border-gray-100 hover:border-blue-300"
                >
                  {/* Order Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                          #{order.id.slice(-4)}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">
                            {t('order')} #{order.id.slice(-8).toUpperCase()}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(order.date).toLocaleString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>
                      <div className={`px-3 py-1.5 rounded-full border-2 ${getStatusColor(order.status)} font-medium text-sm flex items-center gap-2`}>
                        {getStatusIcon(order.status)}
                        {getStatusText(order.status)}
                      </div>
                    </div>

                    {/* Order Type */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-white px-2 py-1 rounded-full border border-gray-300 text-gray-700">
                        {order.orderType === 'dine-in' ? '🍽️ ' + t('dineIn') : '📦 ' + t('takeaway')}
                      </span>
                      <span className="text-xs bg-white px-2 py-1 rounded-full border border-gray-300 text-gray-700">
                        {order.tableName}
                      </span>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="p-4">
                    <div className="space-y-2 mb-3">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-sm">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <ShoppingBag className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">{item.name}</div>
                            {item.selectedOptions && item.selectedOptions.length > 0 && (
                              <div className="text-xs text-blue-600 truncate">
                                {item.selectedOptions.map(opt => opt.choiceName).join(', ')}
                              </div>
                            )}
                          </div>
                          <div className="text-gray-600">×{item.quantity}</div>
                          <div className="font-semibold text-gray-900 text-right">
                            {(item.price * item.quantity).toLocaleString()}đ
                          </div>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="text-xs text-gray-500 text-center py-1">
                          +{order.items.length - 3} {t('more')} {t('items')}
                        </div>
                      )}
                    </div>

                    {/* Order Footer */}
                    <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-xs text-gray-500">
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)} {t('items')}
                        </div>
                        {order.messages && order.messages.length > 0 && (
                          <div className={`flex items-center gap-1 text-xs ${hasUnreadMessages ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                            <MessageSquare className="w-4 h-4" />
                            {order.messages.length}
                            {hasUnreadMessages && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse ml-1"></span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">{t('total')}</div>
                        <div className="text-xl font-bold text-blue-600">
                          {order.total.toLocaleString()}đ
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Hint */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 border-t border-blue-100">
                    <div className="text-xs text-blue-600 font-medium text-center">
                      {t('tapToView') || 'Tap to view details and chat'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Stats Bar */}
      {sortedOrders.length > 0 && (
        <div className="bg-white border-t-2 border-gray-200 p-4 shadow-lg">
          <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{sortedOrders.length}</div>
              <div className="text-xs text-gray-500">{t('totalOrders_count')}</div>
            </div>
            <div className="text-center border-x border-gray-200">
              <div className="text-2xl font-bold text-blue-600">
                {inProgressCount}
              </div>
              <div className="text-xs text-gray-500">{t('inProgress') || 'In Progress'}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {completedAmount.toLocaleString()}đ
              </div>
              <div className="text-xs text-gray-500">{t('totalSpent') || 'Total Spent'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}