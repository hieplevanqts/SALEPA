import { useState, useMemo } from 'react';
import { User, Phone, Mail, MapPin, Edit, Trash2, Cake, AlertCircle, ShoppingBag, Clock, CreditCard, FileText, ArrowLeft } from 'lucide-react';
import { useStore } from '../../../../lib/fashion-shop-lib/store';
import type { Customer, Order } from '../../../../lib/fashion-shop-lib/store';
import { useTranslation } from '../../../../lib/fashion-shop-lib/useTranslation';
import { OrderDetailFullScreen } from '../orders/OrderDetailFullScreen';
import { PrintReceipt } from '../../components/common/PrintReceipt';

interface CustomerDetailViewProps {
  customer: Customer;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onViewOrder?: (orderId: string) => void;
}

type TabType = 'overview' | 'purchases';

export function CustomerDetailView({ customer, onClose, onEdit, onDelete, onViewOrder }: CustomerDetailViewProps) {
  const { t } = useTranslation();
  const { orders, deleteOrder } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'cancelled'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [printOrder, setPrintOrder] = useState<Order | null>(null);
  const [deleteConfirmOrder, setDeleteConfirmOrder] = useState<Order | null>(null);

  // Get customer orders
  const customerOrders = useMemo(() => {
    const ordersArray = Array.isArray(orders) ? orders : Object.values(orders || {});
    let result = ordersArray.filter((order) => 
      order && order.customerPhone === customer.phone
    );
    
    if (filterStatus !== 'all') {
      result = result.filter((order) => order.status === filterStatus);
    }
    
    return result.sort((a, b) => new Date(b.timestamp || b.date || '').getTime() - new Date(a.timestamp || a.date || '').getTime());
  }, [orders, customer.phone, filterStatus]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalOrders = customerOrders.length;
    const totalSpent = customerOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalPaid = customerOrders.reduce((sum, order) => {
      const received = order.receivedAmount || order.paidAmount || 0;
      const cappedReceived = received > order.total ? order.total : received;
      return sum + cappedReceived;
    }, 0);
    const debt = totalSpent - totalPaid;
    const lastVisit = customerOrders.length > 0 ? (customerOrders[0].timestamp || customerOrders[0].date) : customer.createdAt;
    
    const unpaidOrders = customerOrders.filter(order => {
      const received = order.receivedAmount || order.paidAmount || 0;
      const cappedReceived = received > order.total ? order.total : received;
      return cappedReceived < order.total;
    });
    
    return {
      totalOrders,
      totalSpent,
      totalPaid,
      debt,
      lastVisit,
      unpaidOrders,
    };
  }, [customerOrders, customer.createdAt]);

  const getCustomerGroupBadge = (group?: string) => {
    const badges = {
      vip: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'VIP' },
      acquaintance: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Bạn bè' },
      employee: { bg: 'bg-green-100', text: 'text-green-800', label: 'Nhân viên' },
      regular: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Thường xuyên' },
    };
    const badge = badges[group as keyof typeof badges] || badges.regular;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-cyan-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isBirthday = () => {
    if (!customer.dateOfBirth) return false;
    const today = new Date();
    const birthDate = new Date(customer.dateOfBirth);
    return (
      today.getDate() === birthDate.getDate() &&
      today.getMonth() === birthDate.getMonth()
    );
  };

  const getPaymentStatusBadge = (order: Order) => {
    const received = order.receivedAmount || order.paidAmount || 0;
    const cappedReceived = received > order.total ? order.total : received;
    const isPaid = cappedReceived >= order.total;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        isPaid
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
      }`}>
        {isPaid ? 'Hoàn thành' : 'Còn nợ'}
      </span>
    );
  };

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: User },
    { id: 'purchases', label: 'Lịch sử mua hàng', icon: ShoppingBag },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 bg-white border-b-2 border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between gap-6">
          {/* Left: Back Button + Customer Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900 flex-shrink-0"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            
            {/* Avatar */}
            <div className={`w-16 h-16 rounded-full ${getAvatarColor(customer.name)} flex items-center justify-center text-white text-lg font-bold flex-shrink-0`}>
              {customer.avatar ? (
                <img src={customer.avatar} alt={customer.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                getInitials(customer.name)
              )}
            </div>
            
            {/* Customer Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900">Chi tiết khách hàng</h1>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={onDelete}
              className="px-4 py-2 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Xóa
            </button>
            <button
              onClick={onEdit}
              className="px-4 py-2 rounded-xl font-semibold text-white transition-all hover:opacity-90 flex items-center gap-2"
              style={{ backgroundColor: '#FE7410' }}
            >
              <Edit className="w-5 h-5" />
              Sửa
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 bg-white border-b-2 border-gray-200 px-8">
        <div className="flex gap-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-1 py-3 border-b-2 text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'font-bold border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content - Scrollable with 2 columns */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Left Column - Main Content (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                {/* Customer Info */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                  <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-700" />
                    Thông tin khách hàng
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-sm text-gray-600 mb-1">Tên khách hàng</div>
                      <div className="font-semibold text-gray-900 text-base">{customer.name}</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        Số điện thoại
                      </div>
                      <div className="font-semibold text-gray-900 text-base">{customer.phone}</div>
                    </div>
                    {customer.email && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Email</div>
                        <div className="font-semibold text-gray-900 text-base">{customer.email}</div>
                      </div>
                    )}
                    {customer.dateOfBirth && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Ngày sinh</div>
                        <div className="font-semibold text-gray-900 text-base">{formatDate(customer.dateOfBirth)}</div>
                      </div>
                    )}
                    {customer.gender && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Giới tính</div>
                        <div className="font-semibold text-gray-900 text-base">
                          {customer.gender === 'male' ? 'Nam' : customer.gender === 'female' ? 'Nữ' : 'Khác'}
                        </div>
                      </div>
                    )}
                    {customer.customerGroup && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Nhóm khách hàng</div>
                        <div className="text-base">
                          {getCustomerGroupBadge(customer.customerGroup)}
                        </div>
                      </div>
                    )}
                    {customer.address && (
                      <div className="bg-gray-50 rounded-xl p-4 md:col-span-3">
                        <div className="text-sm text-gray-600 mb-1">Địa chỉ</div>
                        <div className="font-semibold text-gray-900 text-base">{customer.address}</div>
                      </div>
                    )}
                    {customer.taxCode && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Mã số thuế</div>
                        <div className="font-semibold text-gray-900 text-base">{customer.taxCode}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Info */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                  <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-700" />
                    Thông tin bổ sung
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-sm text-gray-600 mb-1">Thành viên từ</div>
                      <div className="font-semibold text-gray-900 text-base">{formatDate(customer.createdAt)}</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-sm text-gray-600 mb-1">Lần cuối</div>
                      <div className="font-semibold text-gray-900 text-base">{formatDateTime(stats.lastVisit)}</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Purchases Tab */}
            {activeTab === 'purchases' && (
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-gray-700" />
                    Lịch sử mua hàng ({customerOrders.length})
                  </h3>
                  {/* Filter */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilterStatus('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        filterStatus === 'all'
                          ? 'text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={filterStatus === 'all' ? { backgroundColor: '#FE7410' } : {}}
                    >
                      Tất cả
                    </button>
                    <button
                      onClick={() => setFilterStatus('completed')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        filterStatus === 'completed'
                          ? 'text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={filterStatus === 'completed' ? { backgroundColor: '#FE7410' } : {}}
                    >
                      Hoàn thành
                    </button>
                    <button
                      onClick={() => setFilterStatus('pending')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        filterStatus === 'pending'
                          ? 'text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={filterStatus === 'pending' ? { backgroundColor: '#FE7410' } : {}}
                    >
                      Chờ xử lý
                    </button>
                    <button
                      onClick={() => setFilterStatus('cancelled')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        filterStatus === 'cancelled'
                          ? 'text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={filterStatus === 'cancelled' ? { backgroundColor: '#FE7410' } : {}}
                    >
                      Đã hủy
                    </button>
                  </div>
                </div>

                {customerOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Chưa có đơn hàng nào</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {customerOrders.map((order) => (
                      <div 
                        key={order.id} 
                        onClick={() => setSelectedOrder(order)}
                        className="border-2 border-gray-200 rounded-xl p-4 hover:border-orange-500 cursor-pointer transition-all hover:bg-orange-50"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-gray-900 text-base">#{order.id.slice(-8).toUpperCase()}</span>
                              {getPaymentStatusBadge(order)}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>{formatDateTime(order.timestamp || order.date)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                              <CreditCard className="w-4 h-4" />
                              <span>{order.paymentMethod === 'cash' ? 'Tiền mặt' : order.paymentMethod === 'card' ? 'Thẻ' : 'Chuyển khoản'}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold" style={{ color: '#FE7410' }}>
                              {order.total.toLocaleString('vi-VN')}đ
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {(Array.isArray(order.items) ? order.items : Object.values(order.items || {})).length} sản phẩm
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Summary (1/3) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 lg:sticky lg:top-6">
              <h3 className="text-base font-bold text-gray-900 mb-4">Tổng quan</h3>

              {/* Customer Avatar & Name */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b-2 border-gray-200">
                <div className={`w-14 h-14 rounded-full ${getAvatarColor(customer.name)} flex items-center justify-center text-white text-base font-bold flex-shrink-0`}>
                  {customer.avatar ? (
                    <img src={customer.avatar} alt={customer.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    getInitials(customer.name)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 text-base truncate">{customer.name}</div>
                  <div className="text-sm text-gray-600">{customer.phone}</div>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-4">
                {/* Debt Information - Show if customer has debt */}
                {stats.debt > 0 && (
                  <div className="bg-red-50 rounded-xl p-4 border-2 border-red-300">
                    <div className="text-sm text-red-700 mb-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Công nợ hiện tại
                    </div>
                    <div className="font-bold text-3xl text-red-600">
                      {stats.debt.toLocaleString('vi-VN')}đ
                    </div>
                    <div className="mt-2 text-xs text-red-600">
                      {stats.unpaidOrders.length} đơn hàng chưa thanh toán đủ
                    </div>
                  </div>
                )}

                {/* Total Paid */}
                <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                  <div className="text-sm text-green-700 mb-1">Đã thanh toán</div>
                  <div className="font-bold text-2xl text-green-600">
                    {stats.totalPaid.toLocaleString('vi-VN')}đ
                  </div>
                </div>

                {/* Total Spent */}
                <div className="rounded-xl p-4" style={{ backgroundColor: '#FFF5EE', border: '2px solid #FE7410' }}>
                  <div className="text-sm mb-1" style={{ color: '#FE7410' }}>Tổng chi tiêu</div>
                  <div className="font-bold text-3xl" style={{ color: '#FE7410' }}>
                    {stats.totalSpent.toLocaleString('vi-VN')}đ
                  </div>
                </div>

                {/* Total Orders */}
                <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                  <div className="text-sm text-blue-600 mb-1 flex items-center gap-1">
                    <ShoppingBag className="w-4 h-4" />
                    Số đơn hàng
                  </div>
                  <div className="font-bold text-2xl text-blue-900">{stats.totalOrders}</div>
                </div>

                {/* Birthday Alert */}
                {isBirthday() && (
                  <div className="bg-pink-50 border-2 border-pink-200 rounded-xl p-4">
                    <div className="flex items-center gap-2">
                      <Cake className="w-5 h-5 text-pink-600" />
                      <span className="text-sm font-semibold text-pink-800">
                        🎉 Sinh nhật hôm nay
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Detail Full Screen */}
      {selectedOrder && (
        <OrderDetailFullScreen
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onPrintReceipt={() => setPrintOrder(selectedOrder)}
          onDelete={() => setDeleteConfirmOrder(selectedOrder)}
        />
      )}

      {/* Print Receipt */}
      {printOrder && (
        <PrintReceipt
          order={printOrder}
          onClose={() => setPrintOrder(null)}
        />
      )}

      {/* Delete Order Confirmation */}
      {deleteConfirmOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Xác nhận xóa đơn hàng</h3>
            <p className="text-sm text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa đơn hàng <strong>#{deleteConfirmOrder.id.slice(-8).toUpperCase()}</strong> không?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmOrder(null)}
                className="px-4 py-2 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  deleteOrder(deleteConfirmOrder.id);
                  setDeleteConfirmOrder(null);
                }}
                className="px-4 py-2 rounded-xl font-semibold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: '#FE7410' }}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
