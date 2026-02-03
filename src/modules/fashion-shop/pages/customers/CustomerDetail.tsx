import { useState, useMemo } from 'react';
import { X, Phone, Mail, MapPin, Calendar, Edit, Trash2, Cake, Hash, ShoppingBag, Clock, CreditCard, FileText } from 'lucide-react';
import { useStore } from '../../../../lib/fashion-shop-lib/store';
import type { Customer } from '../../../../lib/fashion-shop-lib/store';
import { useTranslation } from '../../../../lib/fashion-shop-lib/useTranslation';

interface CustomerDetailProps {
  customer: Customer;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function CustomerDetail({ customer, onClose, onEdit, onDelete }: CustomerDetailProps) {
  const { t } = useTranslation();
  const { orders } = useStore();
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'cancelled'>('all');

  // Get customer orders
  const customerOrders = useMemo(() => {
    let result = orders.filter((order) => order.customerPhone === customer.phone);
    
    if (filterStatus !== 'all') {
      result = result.filter((order) => order.status === filterStatus);
    }
    
    return result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [orders, customer.phone, filterStatus]);

  const getCustomerGroupBadge = (group?: string) => {
    switch (group) {
      case 'vip':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
            VIP
          </span>
        );
      case 'acquaintance':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {t.customerData?.acquaintance || 'Acquaintance'}
          </span>
        );
      case 'employee':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            {t.customerData?.employee || 'Employee'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            {t.customerData?.regular || 'Regular'}
          </span>
        );
    }
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
    const date = new Date(dateString + 'T00:00:00');
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

  const handleCallPhone = () => {
    window.location.href = `tel:${customer.phone}`;
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {t('completed')}
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            {t('pending')}
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            {t('cancelled')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {t('completed')}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold">{t.customer?.detailTitle || 'Customer Details'}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className={`w-24 h-24 rounded-full ${getAvatarColor(customer.name)} flex items-center justify-center text-white text-2xl font-semibold flex-shrink-0`}>
                {customer.avatar ? (
                  <img src={customer.avatar} alt={customer.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  getInitials(customer.name)
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold text-gray-900">{customer.name}</h3>
                  {getCustomerGroupBadge(customer.customerGroup)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Phone */}
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">{customer.phone}</span>
                    <button
                      onClick={handleCallPhone}
                      className="ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      {t.customer?.call || 'Call'}
                    </button>
                  </div>

                  {/* Email */}
                  {customer.email && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <span>{customer.email}</span>
                    </div>
                  )}

                  {/* Address */}
                  {customer.address && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span>{customer.address}</span>
                    </div>
                  )}

                  {/* Date of Birth */}
                  {customer.dateOfBirth && (
                    <div className="flex items-center gap-2 text-gray-700">
                      {isBirthday() ? (
                        <Cake className="w-5 h-5 text-pink-600" />
                      ) : (
                        <Calendar className="w-5 h-5 text-blue-600" />
                      )}
                      <span>{formatDate(customer.dateOfBirth)}</span>
                      {isBirthday() && (
                        <span className="text-xs bg-pink-100 text-pink-800 px-2 py-0.5 rounded-full">
                          🎂 {t.customer?.birthday || 'Birthday Today'}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Gender */}
                  {customer.gender && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="text-blue-600">👤</span>
                      <span>{(t.customer as any)?.[customer.gender] || customer.gender}</span>
                    </div>
                  )}

                  {/* Tax Code */}
                  {customer.taxCode && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Hash className="w-5 h-5 text-blue-600" />
                      <span>{customer.taxCode}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="text-right flex-shrink-0">
                <div className="text-3xl font-bold text-blue-600">
                  {customer.totalSpent.toLocaleString('vi-VN')}đ
                </div>
                <p className="text-sm text-gray-600 mt-1">{t.customer?.totalSpent || 'Total Spent'}</p>
                <div className="mt-2 text-lg font-semibold text-gray-900">
                  {customer.orderCount} {t.customer?.orders || 'orders'}
                </div>
              </div>
            </div>
          </div>

          {/* Orders Section Header */}
          <div className="border-b border-gray-200 mb-6 pb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#FE7410]" />
              <span className="font-semibold text-lg text-gray-900">Lịch sử đơn hàng</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {customerOrders.length}
              </span>
            </div>
          </div>

          {/* Orders Content */}
          <div>
            {/* Filter */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Lịch sử mua hàng</h3>
              <div className="flex gap-2">
                {['all', 'completed', 'pending', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status as any)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      filterStatus === status
                        ? 'bg-[#FE7410] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status === 'all' ? 'Tất cả' : status === 'completed' ? 'Hoàn thành' : status === 'pending' ? 'Chờ xử lý' : 'Đã hủy'}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders List */}
            {customerOrders.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Chưa có đơn hàng nào</p>
              </div>
            ) : (
              <div className="space-y-3">
                {customerOrders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">#{order.id}</span>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{formatDateTime(order.timestamp)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">
                          {order.total.toLocaleString('vi-VN')}đ
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600 justify-end mt-1">
                          <CreditCard className="w-4 h-4" />
                          <span>{order.paymentMethod === 'cash' ? 'Tiền mặt' : order.paymentMethod === 'card' ? 'Thẻ' : 'Chuyển khoản'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm text-gray-600">
                          <span>
                            {item.quantity}x {item.name}
                          </span>
                          <span>{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                        </div>
                      ))}
                    </div>

                    {/* Note */}
                    {order.note && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                          <FileText className="w-3 h-3 inline mr-1" />
                          {order.note}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onDelete}
            className="px-6 py-2.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            {t.customer?.delete || 'Delete'}
          </button>
          <button
            onClick={onEdit}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Edit className="w-5 h-5" />
            {t.customer?.edit || 'Edit'}
          </button>
        </div>
      </div>
    </div>
  );
}