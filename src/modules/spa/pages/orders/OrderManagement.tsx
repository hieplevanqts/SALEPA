import { useState } from 'react';
import { useStore } from '../../../../lib/spa-lib/store';
import { useTranslation } from '../../../../lib/spa-lib/useTranslation';
import { 
  ShoppingBag, Clock, CheckCircle, XCircle, AlertCircle, 
  Filter, Search, MapPin, User, MessageSquare, ChevronRight,
  Utensils, PackageOpen, Phone, TrendingUp, Package, Eye
} from 'lucide-react';
import { OrderDetailFullScreen } from './OrderDetailFullScreen';
import { MessageInbox } from '../messages/MessageInbox';
import type { SelfServiceOrder } from '../../../../lib/spa-lib/store';

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled';
type OrderTypeFilter = 'all' | 'dine-in' | 'takeaway';

export function OrderManagement() {
  const { selfServiceOrders, updateOrderStatus } = useStore();
  const { t } = useTranslation();

  const [selectedOrder, setSelectedOrder] = useState<SelfServiceOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [orderTypeFilter, setOrderTypeFilter] = useState<OrderTypeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter orders
  const filteredOrders = selfServiceOrders.filter(order => {
    // Status filter
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;
    
    // Order type filter
    if (orderTypeFilter !== 'all' && order.orderType !== orderTypeFilter) return false;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        order.id.toLowerCase().includes(query) ||
        order.customerName?.toLowerCase().includes(query) ||
        order.tableName?.toLowerCase().includes(query) ||
        order.items.some(item => item.name.toLowerCase().includes(query))
      );
    }
    
    return true;
  });

  // Sort by date (newest first)
  const sortedOrders = [...filteredOrders].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Statistics
  const stats = {
    total: selfServiceOrders.length,
    pending: selfServiceOrders.filter(o => o.status === 'pending').length,
    confirmed: selfServiceOrders.filter(o => o.status === 'confirmed').length,
    preparing: selfServiceOrders.filter(o => o.status === 'preparing').length,
    ready: selfServiceOrders.filter(o => o.status === 'ready').length,
    served: selfServiceOrders.filter(o => o.status === 'served').length,
    cancelled: selfServiceOrders.filter(o => o.status === 'cancelled').length,
    totalRevenue: selfServiceOrders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, order) => sum + order.total, 0),
    pendingRevenue: selfServiceOrders
      .filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status))
      .reduce((sum, order) => sum + order.total, 0),
    unreadMessages: selfServiceOrders.filter(o => 
      o.messages && o.messages.length > 0 && 
      o.messages[o.messages.length - 1].sender === 'customer'
    ).length,
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="w-5 h-5" />;
      case 'confirmed':
      case 'preparing':
        return <Clock className="w-5 h-5" />;
      case 'ready':
        return <CheckCircle className="w-5 h-5" />;
      case 'served':
        return <CheckCircle className="w-5 h-5" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const handleQuickStatusUpdate = (orderId: string, newStatus: SelfServiceOrder['status']) => {
    updateOrderStatus(orderId, newStatus);
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
        {/* Show full screen order detail */}
        {selectedOrder ? (
          <OrderDetailFullScreen
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        ) : (
          <>
            {/* Header */}
            <div className="bg-white border-b-2 border-gray-200 px-8 py-6 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{t('orderManagement') || 'Order Management'}</h1>
                    <p className="text-sm text-gray-500">
                      {t('manageCustomerOrders') || 'Manage customer orders in real-time'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {stats.unreadMessages > 0 && (
                    <div className="bg-red-50 border-2 border-red-300 rounded-xl px-4 py-2 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-red-600" />
                      <span className="font-bold text-red-600">{stats.unreadMessages}</span>
                      <span className="text-sm text-red-700">{t('newMessages') || 'New messages'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
                  <div className="text-xs text-blue-600 font-medium mb-1">{t('total')}</div>
                  <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border-2 border-yellow-200">
                  <div className="text-xs text-yellow-600 font-medium mb-1">{t('pending')}</div>
                  <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-300">
                  <div className="text-xs text-blue-600 font-medium mb-1">{t('confirmed')}</div>
                  <div className="text-2xl font-bold text-blue-700">{stats.confirmed}</div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-200">
                  <div className="text-xs text-purple-600 font-medium mb-1">{t('preparing')}</div>
                  <div className="text-2xl font-bold text-purple-700">{stats.preparing}</div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-200">
                  <div className="text-xs text-green-600 font-medium mb-1">{t('ready')}</div>
                  <div className="text-2xl font-bold text-green-700">{stats.ready}</div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border-2 border-gray-200">
                  <div className="text-xs text-gray-600 font-medium mb-1">{t('served')}</div>
                  <div className="text-2xl font-bold text-gray-700">{stats.served}</div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border-2 border-red-200">
                  <div className="text-xs text-red-600 font-medium mb-1">{t('cancelled')}</div>
                  <div className="text-2xl font-bold text-red-700">{stats.cancelled}</div>
                </div>
              </div>

              {/* Revenue Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-4 border-2 border-green-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-green-700 font-medium mb-1">{t('totalRevenue')}</div>
                      <div className="text-3xl font-bold text-green-700">
                        {stats.totalRevenue.toLocaleString()}đ
                      </div>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border-2 border-orange-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-orange-700 font-medium mb-1">{t('pendingRevenue') || 'Pending Revenue'}</div>
                      <div className="text-3xl font-bold text-orange-700">
                        {stats.pendingRevenue.toLocaleString()}đ
                      </div>
                    </div>
                    <Clock className="w-8 h-8 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white border-b border-gray-200 px-8 py-4 flex-shrink-0">
              <div className="flex flex-col md:flex-row gap-3">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('searchOrder')}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                    className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="all">{t('allStatus')}</option>
                    <option value="pending">{t('pending')}</option>
                    <option value="confirmed">{t('confirmed')}</option>
                    <option value="preparing">{t('preparing')}</option>
                    <option value="ready">{t('ready')}</option>
                    <option value="served">{t('served')}</option>
                    <option value="cancelled">{t('cancelled')}</option>
                  </select>
                </div>

                {/* Order Type Filter */}
                <select
                  value={orderTypeFilter}
                  onChange={(e) => setOrderTypeFilter(e.target.value as OrderTypeFilter)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="all">{t('allTypes') || 'All Types'}</option>
                  <option value="dine-in">{t('dineIn')}</option>
                  <option value="takeaway">{t('takeaway')}</option>
                </select>
              </div>
            </div>

            {/* Orders List */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {sortedOrders.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <ShoppingBag className="w-20 h-20 mb-4 opacity-50" />
                  <p className="text-lg font-medium">{t('noOrdersFound')}</p>
                  <p className="text-sm">{t('adjustFilters') || 'Try adjusting filters'}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
                  {sortedOrders.map((order) => {
                    const hasUnreadMessages = order.messages && order.messages.length > 0 && 
                      order.messages[order.messages.length - 1].sender === 'customer';

                    return (
                      <div
                        key={order.id}
                        className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border-2 border-gray-200 hover:border-blue-300 overflow-hidden"
                      >
                        {/* Order Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center font-bold">
                                {order.id.slice(-4)}
                              </div>
                              <div>
                                <div className="font-bold">
                                  {t('order')} {order.id.slice(-8).toUpperCase()}
                                </div>
                                <div className="text-xs text-blue-100 flex items-center gap-1">
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

                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className={`px-2.5 py-1 rounded-full border ${getStatusColor(order.status)} text-xs font-medium flex items-center gap-1.5`}>
                              {getStatusIcon(order.status)}
                              {getStatusText(order.status)}
                            </div>
                            <div className="px-2.5 py-1 rounded-full bg-white/20 text-xs font-medium">
                              {order.orderType === 'dine-in' ? '🍽️ ' + t('dineIn') : '📦 ' + t('takeaway')}
                            </div>
                          </div>
                        </div>

                        {/* Order Body */}
                        <div className="p-4">
                          {/* Customer & Table Info */}
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <div className="bg-gray-50 rounded-lg p-2">
                              <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {t('table') || 'Table'}
                              </div>
                              <div className="font-bold text-gray-900">{order.tableName}</div>
                            </div>

                            {order.customerName && (
                              <div className="bg-gray-50 rounded-lg p-2">
                                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {t('customer')}
                                </div>
                                <div className="font-bold text-gray-900">{order.customerName}</div>
                              </div>
                            )}

                            {order.customerPhone && (
                              <div className="bg-gray-50 rounded-lg p-2 col-span-2">
                                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {t('phoneNumber')}
                                </div>
                                <div className="font-bold text-gray-900">{order.customerPhone}</div>
                              </div>
                            )}
                          </div>

                          {/* Items Preview */}
                          <div className="mb-3">
                            <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                              <Package className="w-3 h-3" />
                              {order.items.length} {t('items')}
                            </div>
                            <div className="space-y-1.5 max-h-48 overflow-y-auto">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg p-2">
                                  <span className="text-gray-700 flex-1">
                                    <span className="font-semibold text-blue-600">{item.quantity}×</span> {item.name}
                                  </span>
                                  <span className="font-semibold text-gray-900">
                                    {(item.price * item.quantity).toLocaleString()}đ
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Total */}
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 mb-3 border border-green-200">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-700">{t('total')}</span>
                              <span className="text-xl font-bold text-green-600">
                                {order.total.toLocaleString()}đ
                              </span>
                            </div>
                          </div>

                          {/* Messages Indicator */}
                          {order.messages && order.messages.length > 0 && (
                            <div className={`mb-3 p-3 rounded-lg border-2 ${hasUnreadMessages ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'}`}>
                              <div className="flex items-start gap-2 mb-2">
                                <MessageSquare className={`w-4 h-4 mt-0.5 flex-shrink-0 ${hasUnreadMessages ? 'text-blue-600' : 'text-gray-500'}`} />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className={`text-xs font-semibold ${hasUnreadMessages ? 'text-blue-700' : 'text-gray-700'}`}>
                                      {order.messages[order.messages.length - 1].sender === 'customer' ? (
                                        <>👤 {order.customerName || t('customer')}</>
                                      ) : (
                                        <>👨‍💼 {t('staff')}</>
                                      )}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(order.messages[order.messages.length - 1].timestamp).toLocaleTimeString('vi-VN', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </span>
                                  </div>
                                  <p className={`text-sm ${hasUnreadMessages ? 'text-blue-900 font-medium' : 'text-gray-700'} line-clamp-2`}>
                                    {order.messages[order.messages.length - 1].text}
                                  </p>
                                </div>
                                {hasUnreadMessages && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse flex-shrink-0 mt-1"></div>
                                )}
                              </div>
                              <div className="text-xs text-gray-600 flex items-center justify-between">
                                <span>
                                  {order.messages.length} {t('messages') || 'messages'}
                                </span>
                                {hasUnreadMessages && (
                                  <span className="text-blue-600 font-semibold animate-pulse">
                                    {t('newMessage') || 'New message!'} 💬
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Quick Actions */}
                          <div className="flex gap-2">
                            {order.status === 'pending' && (
                              <button
                                onClick={() => handleQuickStatusUpdate(order.id, 'confirmed')}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-all"
                              >
                                {t('confirm')}
                              </button>
                            )}

                            {order.status === 'confirmed' && (
                              <button
                                onClick={() => handleQuickStatusUpdate(order.id, 'preparing')}
                                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition-all"
                              >
                                {t('startPreparing') || 'Start Preparing'}
                              </button>
                            )}

                            {order.status === 'preparing' && (
                              <button
                                onClick={() => handleQuickStatusUpdate(order.id, 'ready')}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-all"
                              >
                                {t('markReady') || 'Mark Ready'}
                              </button>
                            )}

                            {order.status === 'ready' && (
                              <button
                                onClick={() => handleQuickStatusUpdate(order.id, 'served')}
                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-medium transition-all"
                              >
                                {t('markServed') || 'Mark Served'}
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              {t('details') || 'Details'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Message Inbox Sidebar */}
      <MessageInbox onOrderClick={setSelectedOrder} />
    </div>
  );
}

export default OrderManagement;