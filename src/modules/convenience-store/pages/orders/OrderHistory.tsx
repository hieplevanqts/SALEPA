import { useState } from 'react';
import { Search, Calendar, CreditCard, Eye, Trash2, Printer, X, ArrowUpDown, ChevronDown, Package, ShoppingBag, TrendingUp, CheckCircle, AlertCircle, ArrowUp, ArrowDown, DollarSign, Smartphone, QrCode, Zap, Check, Banknote, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../../../../lib/convenience-store-lib/store';
import { useTranslation } from '../../../../lib/convenience-store-lib/useTranslation';
import { OrderDetailFullScreen } from './OrderDetailFullScreen';
import { PrintReceipt } from '../../components/sales/PrintReceipt';
import { Pagination } from '../../components/pagination/Pagination';
import { toast } from 'sonner';
import type { Order } from '../../../../lib/convenience-store-lib/store';

type SortField = 'date' | 'total' | 'items';
type SortOrder = 'asc' | 'desc';
type PaymentMethodType = 'cash' | 'card' | 'transfer' | 'momo' | 'zalopay' | 'vnpay';

export function OrderHistory() {
  const { orders: ordersRaw, deleteOrder, updateOrder } = useStore();
  const { t } = useTranslation();
  
  const orders = ordersRaw ?? [];
  
  console.log('OrderHistory - orders:', orders.length);
  console.log('OrderHistory - ordersRaw:', ordersRaw);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [printOrder, setPrintOrder] = useState<Order | null>(null);
  const [deleteConfirmOrder, setDeleteConfirmOrder] = useState<Order | null>(null);
  const [filterDate, setFilterDate] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingStartDate, setSelectingStartDate] = useState(true);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  // Payment modal states
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('cash');
  const [customerAmount, setCustomerAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  
  // Get current user info from localStorage
  const currentUser = localStorage.getItem('salepa_username') || '';

  const getPaidAmount = (order: Order) =>
    order.receivedAmount ??
    (order as { paidAmount?: number }).paidAmount ??
    0;
  
  const paymentMethods = [
    { id: 'cash' as const, label: t('cash') || 'Tiền mặt', icon: Banknote },
    { id: 'card' as const, label: t('card') || 'Thẻ', icon: CreditCard },
    { id: 'transfer' as const, label: t('transfer') || 'Chuyển khoản', icon: CreditCard },
    { id: 'momo' as const, label: 'MoMo', icon: Smartphone },
    { id: 'zalopay' as const, label: 'ZaloPay', icon: QrCode },
    { id: 'vnpay' as const, label: 'VNPay', icon: Zap },
  ];

  const getDateRange = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (filterDate === 'custom' && customStartDate && customEndDate) {
      return {
        start: new Date(customStartDate),
        end: new Date(customEndDate + ' 23:59:59')
      };
    }
    
    switch (filterDate) {
      case 'today':
        return { start: today, end: new Date() };
      case 'yesterday': {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return { start: yesterday, end: today };
      }
      case 'week': {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return { start: weekAgo, end: new Date() };
      }
      case 'month': {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return { start: monthAgo, end: new Date() };
      }
      default:
        return null;
    }
  };

  const filteredOrders = orders
    .filter((order) => {
      const matchesSearch =
        (order.id || '').includes(searchQuery) ||
        (order.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.customerPhone || '').includes(searchQuery);
      
      const dateRange = getDateRange();
      const matchesDate = !dateRange || (
        new Date(order.date) >= dateRange.start && 
        new Date(order.date) <= dateRange.end
      );
      
      const matchesPayment = filterPayment === 'all' || order.paymentMethod === filterPayment;
      
      // Filter by payment status (paid/debt)
      const receivedAmount = getPaidAmount(order);
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'paid' && receivedAmount >= order.total) ||
        (filterStatus === 'debt' && receivedAmount < order.total);
      
      return matchesSearch && matchesDate && matchesPayment && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: any = sortField === 'date' ? new Date(a.date).getTime() : 
                       sortField === 'total' ? a.total : 
                       (Array.isArray(a.items) ? a.items.length : Object.keys(a.items || {}).length);
      let bValue: any = sortField === 'date' ? new Date(b.date).getTime() : 
                       sortField === 'total' ? b.total : 
                       (Array.isArray(b.items) ? b.items.length : Object.keys(b.items || {}).length);
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Statistics
  const cashOrders = filteredOrders.filter(o => o.paymentMethod === 'cash').length;
  const cardOrders = filteredOrders.filter(o => o.paymentMethod === 'card').length;
  const transferOrders = filteredOrders.filter(o => o.paymentMethod === 'transfer').length;
  
  const stats = {
    totalOrders: filteredOrders.length,
    totalRevenue: filteredOrders.reduce((sum, order) => sum + order.total, 0),
    totalDiscount: filteredOrders.reduce((sum, order) => sum + order.discount, 0),
    completedOrders: filteredOrders.filter(o => (o.status || 'completed') === 'completed').length,
    pendingOrders: filteredOrders.filter(o => o.status === 'pending').length,
    avgOrderValue: filteredOrders.length > 0 
      ? filteredOrders.reduce((sum, order) => sum + order.total, 0) / filteredOrders.length 
      : 0,
    totalDebt: filteredOrders.reduce((sum, order) => {
      const receivedAmount = getPaidAmount(order);
      const debt = order.total - receivedAmount;
      return sum + (debt > 0 ? debt : 0);
    }, 0),
    cashOrders,
    cardOrders,
    transferOrders,
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Order ID', 'Date', 'Customer', 'Phone', 'Payment', 'Items', 'Subtotal', 'Discount', 'Total'];
    const rows = filteredOrders.map(order => [
      order.id,
      new Date(order.date).toLocaleString('vi-VN'),
      order.customerName || t('walkInCustomer'),
      order.customerPhone || '',
      order.paymentMethod,
      Array.isArray(order.items) ? order.items.length : Object.keys(order.items || {}).length,
      order.subtotal,
      order.discount,
      order.total
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getPaymentLabel = (method: string) => {
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

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 opacity-30" />;
    return sortOrder === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-orange-600" />
      : <ArrowDown className="w-4 h-4 text-orange-600" />;
  };

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const isInRange = (date: Date, start: string, end: string) => {
    if (!start || !end) return false;
    const checkDate = new Date(date);
    const startDate = new Date(start);
    const endDate = new Date(end);
    checkDate.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    return checkDate >= startDate && checkDate <= endDate;
  };

  const handleDateClick = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    
    if (selectingStartDate || !customStartDate) {
      setCustomStartDate(dateString);
      setCustomEndDate('');
      setSelectingStartDate(false);
    } else {
      const start = new Date(customStartDate);
      const end = new Date(dateString);
      
      if (end >= start) {
        setCustomEndDate(dateString);
        setSelectingStartDate(true);
      } else {
        setCustomStartDate(dateString);
        setCustomEndDate('');
        setSelectingStartDate(false);
      }
    }
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
    const days = [];
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    // Empty cells for days before the first day of month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-5"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      const isStart = customStartDate === dateString;
      const isEnd = customEndDate === dateString;
      const inRange = isInRange(date, customStartDate, customEndDate);
      const isToday = isSameDay(date, new Date());

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(date)}
          className={`h-5 flex items-center justify-center rounded text-[10px] transition-colors ${
            isStart || isEnd
              ? 'bg-[#FE7410] text-white font-bold'
              : inRange
              ? 'bg-orange-100 text-orange-900'
              : isToday
              ? 'bg-gray-100 font-semibold'
              : 'hover:bg-gray-100'
          }`}
        >
          {day}
        </button>
      );
    }

    return (
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="p-0.5 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-gray-600" />
          </button>
          <div className="font-semibold text-gray-900 text-xs">
            Tháng {currentMonth.getMonth() + 1}, {currentMonth.getFullYear()}
          </div>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="p-0.5 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
          </button>
        </div>
        
        {/* Day names */}
        <div className="grid grid-cols-7 gap-0.5 mb-0.5">
          {dayNames.map(name => (
            <div key={name} className="h-4 flex items-center justify-center text-[9px] font-semibold text-gray-500">
              {name}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-0.5">
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Show full screen order detail */}
      {selectedOrder ? (
        <OrderDetailFullScreen
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onPrintReceipt={(order) => {
            setPrintOrder(order);
            setSelectedOrder(null);
          }}
          onDelete={(order) => {
            setSelectedOrder(null);
            setDeleteConfirmOrder(order);
          }}
        />
      ) : (
        <>
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('invoiceManagement')}</h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
              {filteredOrders.length} / {orders.length} {t('orders')}
            </p>
          </div>
          
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{t('totalInvoices')}</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalOrders}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{t('totalRevenue')}</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {(stats.totalRevenue / 1000000).toFixed(1)}M{t('vnd')}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{t('paidInvoices')}</p>
                  <p className="text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{stats.completedOrders}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            

            <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{t('debtValue') || 'Giá trị công nợ'}</p>
                  <p className="text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                    {stats.totalDebt > 0 ? `${(stats.totalDebt / 1000).toFixed(0)}K${t('vnd')}` : `0${t('vnd')}`}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="p-3 sm:p-4 mb-4 sm:mb-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              {/* Search */}
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder={t('searchOrder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              
              {/* Date Filter */}
              <select
                value={filterDate}
                onChange={(e) => {
                  setFilterDate(e.target.value);
                  if (e.target.value === 'custom') {
                    setShowCustomDate(true);
                  } else {
                    setShowCustomDate(false);
                  }
                }}
                className="px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">{t('allTime')}</option>
                <option value="today">{t('today')}</option>
                <option value="yesterday">{t('yesterday')}</option>
                <option value="week">{t('last7Days')}</option>
                <option value="month">{t('last30Days')}</option>
                <option value="custom">{t('customDate')}</option>
              </select>

              {/* Payment Filter */}
              <select
                value={filterPayment}
                onChange={(e) => setFilterPayment(e.target.value)}
                className="px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">{t('allPaymentMethods')}</option>
                <option value="cash">{t('cash')}</option>
                <option value="card">{t('card')}</option>
                <option value="transfer">{t('transfer')}</option>
                <option value="momo">MoMo</option>
                <option value="zalopay">ZaloPay</option>
                <option value="vnpay">VNPay</option>
              </select>

              {/* Payment Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">{t('allPaymentStatus') || 'Tất cả trạng thái'}</option>
                <option value="paid">{t('paidComplete') || 'Đã hoàn thành'}</option>
                <option value="debt">{t('hasDebt') || 'Còn nợ'}</option>
              </select>

              {/* Custom Date Range - Integrated into grid */}
              {showCustomDate && (
                <div className="relative lg:col-span-2">
                  <button
                    onClick={() => setShowDateRangePicker(!showDateRangePicker)}
                    className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE7410] focus:border-transparent flex items-center gap-2 hover:bg-gray-50 transition-colors text-sm"
                  >
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <span className="text-gray-700 flex-1 text-left text-sm">
                      {customStartDate && customEndDate 
                        ? `${new Date(customStartDate).toLocaleDateString('vi-VN')} - ${new Date(customEndDate).toLocaleDateString('vi-VN')}`
                        : 'Chọn khoảng thời gian'}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showDateRangePicker ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Date Range Picker Popup */}
                  {showDateRangePicker && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2.5 z-50">
                      {renderCalendar()}
                      
                      <div className="flex gap-2 pt-2.5 mt-2.5 border-t">
                        <button
                          onClick={() => {
                            setCustomStartDate('');
                            setCustomEndDate('');
                            setSelectingStartDate(true);
                            setShowDateRangePicker(false);
                          }}
                          className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-xs font-medium"
                        >
                          Xóa
                        </button>
                        <button
                          onClick={() => setShowDateRangePicker(false)}
                          disabled={!customStartDate || !customEndDate}
                          className="flex-1 px-2.5 py-1.5 bg-[#FE7410] text-white rounded-lg hover:bg-[#E56809] transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Áp dụng
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Orders Table */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center">
              <Package className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                {orders.length === 0 ? t('noOrders') : t('notFound')}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="modern-table">
                  <thead>
                    <tr>
                      <th className="table-header text-center">
                        <button
                          onClick={() => handleSort('date')}
                          className="flex items-center gap-2 hover:text-orange-600 mx-auto"
                        >
                          NGÀY TẠO
                          <SortIcon field="date" />
                        </button>
                      </th>
                      <th className="table-header">MÃ HÓA ĐƠN</th>
                      <th className="table-header">KHÁCH HÀNG</th>
                      <th className="table-header">NGƯỜI TẠO</th>
                      <th className="table-header text-center">THANH TOÁN</th>
                      <th className="table-header text-right">
                        <button
                          onClick={() => handleSort('items')}
                          className="flex items-center gap-2 hover:text-orange-600 ml-auto"
                        >
                          SỐ SP
                          <SortIcon field="items" />
                        </button>
                      </th>
                      <th className="table-header text-right">
                        <button
                          onClick={() => handleSort('total')}
                          className="flex items-center gap-2 hover:text-orange-600 ml-auto"
                        >
                          TỔNG THANH TOÁN
                          <SortIcon field="total" />
                        </button>
                      </th>
                      <th className="table-header text-right">GIẢM GIÁ</th>
                      <th className="table-header text-right">KHÁCH ĐÃ TRẢ</th>
                      <th className="table-header actions-center">THAO TÁC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedOrders.map((order) => {
                      const receivedAmount = getPaidAmount(order);
                      const isUnderPaid = receivedAmount < order.total && receivedAmount !== order.total;
                      
                      // Display amount: if paid more than total, show total; otherwise show actual amount
                      const displayAmount = receivedAmount > order.total ? order.total : receivedAmount;
                      
                      return (
                        <tr key={order.id}>
                          <td className="table-content text-center">
                            {formatDate(order.date)}
                          </td>
                          <td className="table-content">
                            #{order.id.slice(-8).toUpperCase()}
                          </td>
                          <td className="table-content">
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {order.customerName || t('walkInCustomer')}
                              </div>
                              {order.customerPhone && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">{order.customerPhone}</div>
                              )}
                            </div>
                          </td>
                          <td className="table-content">{order.createdBy || 'Hệ thống'}</td>
                          <td className="table-content text-center">
                            {order.paymentMethod ? getPaymentLabel(order.paymentMethod) : (
                              <span className="text-gray-400 italic">Không rõ</span>
                            )}
                          </td>
                          <td className="table-content text-right">
                            {Array.isArray(order.items) ? order.items.length : Object.keys(order.items || {}).length}
                          </td>
                          <td className="table-content font-semibold text-right">
                            <div className="text-gray-900 dark:text-white font-bold font-normal">
                              {order.total.toLocaleString('vi-VN')}{t('vnd')}
                            </div>
                          </td>
                          <td className="table-content text-right">
                            {order.discount > 0 ? (
                              <span className="text-red-600 dark:text-red-400 font-medium">
                                -{order.discount.toLocaleString('vi-VN')}{t('vnd')}
                              </span>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500">0{t('vnd')}</span>
                            )}
                          </td>
                          <td className="table-content text-right">
                            <span className={`font-medium ${isUnderPaid || receivedAmount === 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                              {displayAmount.toLocaleString('vi-VN')}{t('vnd')}
                            </span>
                          </td>
                          <td className="actions-center">
                            <div className="flex gap-2 justify-center">
                              {/* Collect Payment button - only show if underpaid */}
                              {isUnderPaid && (
                                <button
                                  onClick={() => {
                                    setPaymentOrder(order);
                                    const remaining = order.total - receivedAmount;
                                    setCustomerAmount(remaining.toString());
                                    setPaymentMethod('cash');
                                    setPaymentNote('');
                                  }}
                                  className="action-icon p-2 hover:bg-orange-100 rounded-lg transition-colors"
                                  title={t('collectPayment') || 'Thu tiền'}
                                >
                                  <DollarSign className="w-5 h-5 text-orange-600" style={{ color: '#FE7410' }} />
                                </button>
                              )}
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="action-icon p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                title={t('viewDetails')}
                              >
                                <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                              </button>
                              <button
                                onClick={() => setPrintOrder(order)}
                                className="action-icon p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                title={t('printReceipt')}
                              >
                                <Printer className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmOrder(order)}
                                className="action-icon p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                title={t('deleteOrder')}
                              >
                                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Desktop Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredOrders.length}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {paginatedOrders.map((order) => {
                const receivedAmount = getPaidAmount(order);
                const isUnderPaid = receivedAmount < order.total && receivedAmount !== order.total;
                const displayAmount = receivedAmount > order.total ? order.total : receivedAmount;
                const debt = order.total - receivedAmount;
                
                return (
                  <div
                    key={order.id}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
                  >
                    {/* Order Header */}
                    <div className="flex items-start justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900 dark:text-white text-base">
                            #{order.id.slice(-8).toUpperCase()}
                          </span>
                          {isUnderPaid && (
                            <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">
                              Nợ
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          📅 {formatDate(order.date)}
                        </div>
                      </div>
                      <div className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full font-medium">
                        {Array.isArray(order.items) ? order.items.length : Object.keys(order.items || {}).length} SP
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 dark:text-white mb-1">
                          👤 {order.customerName || t('walkInCustomer')}
                        </div>
                        {order.customerPhone && (
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            📞 {order.customerPhone}
                          </div>
                        )}
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          💳 {order.paymentMethod ? getPaymentLabel(order.paymentMethod) : 'Không rõ'}
                        </div>
                      </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Tổng thanh toán:</span>
                        <span className="font-bold text-gray-900 dark:text-white">{order.total.toLocaleString('vi-VN')}₫</span>
                      </div>
                      {order.discount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Giảm giá:</span>
                          <span className="font-medium text-red-600 dark:text-red-400">-{order.discount.toLocaleString('vi-VN')}₫</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Khách đã trả:</span>
                        <span className={`font-bold ${isUnderPaid || receivedAmount === 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                          {displayAmount.toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                      {isUnderPaid && debt > 0 && (
                        <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                          <span className="font-medium text-gray-900 dark:text-white">Còn thiếu:</span>
                          <span className="font-bold text-red-600 dark:text-red-400 text-base">{debt.toLocaleString('vi-VN')}₫</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-3 gap-2">
                      {isUnderPaid ? (
                        <>
                          <button
                            onClick={() => {
                              setPaymentOrder(order);
                              const remaining = order.total - receivedAmount;
                              setCustomerAmount(remaining.toString());
                              setPaymentMethod('cash');
                              setPaymentNote('');
                            }}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-orange-50 text-[#FE7410] rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium col-span-3 mb-2"
                          >
                            <DollarSign className="w-4 h-4" />
                            Thu tiền
                          </button>
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            Xem
                          </button>
                          <button
                            onClick={() => setPrintOrder(order)}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                          >
                            <Printer className="w-4 h-4" />
                            In
                          </button>
                          <button
                            onClick={() => setDeleteConfirmOrder(order)}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                          >
                            <Trash2 className="w-4 h-4" />
                            Xóa
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            Xem
                          </button>
                          <button
                            onClick={() => setPrintOrder(order)}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                          >
                            <Printer className="w-4 h-4" />
                            In
                          </button>
                          <button
                            onClick={() => setDeleteConfirmOrder(order)}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                          >
                            <Trash2 className="w-4 h-4" />
                            Xóa
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Mobile Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredOrders.length}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </div>
          </>
          )}

          {/* Print Receipt Modal */}
          {printOrder && (
            <PrintReceipt
              order={printOrder}
              onClose={() => setPrintOrder(null)}
            />
          )}

          {/* Delete Confirmation Modal */}
          {deleteConfirmOrder && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{t('deleteOrder') || 'Xóa hóa đơn'}</h3>
                  </div>
                </div>

                

                <p className="text-gray-700 mb-6">
                  {t('deleteOrderConfirm') || 'Bạn có chắc chắn muốn xóa hóa đơn này không? Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn.'}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirmOrder(null)}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {t('cancel') || 'Hủy'}
                  </button>
                  <button
                    onClick={() => {
                      deleteOrder(deleteConfirmOrder.id);
                      setDeleteConfirmOrder(null);
                    }}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    {t('delete') || 'Xóa'}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Payment Modal */}
          {paymentOrder && (() => {
            const receivedAmount = getPaidAmount(paymentOrder);
            const remainingAmount = paymentOrder.total - receivedAmount;
            const change = customerAmount ? parseFloat(customerAmount) - remainingAmount : 0;
            
            const handleCompletePayment = () => {
              const additionalAmount = parseFloat(customerAmount || '0');
              const newReceivedAmount = receivedAmount + additionalAmount;
              const newChangeAmount = newReceivedAmount - paymentOrder.total;

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
              const existingPaymentHistory = paymentOrder.paymentHistory || [];
              updateOrder(paymentOrder.id, {
                receivedAmount: newReceivedAmount,
                changeAmount: newChangeAmount,
                status: newReceivedAmount >= paymentOrder.total ? 'completed' : 'pending',
                paymentMethod: paymentMethod,
                paymentHistory: [...existingPaymentHistory, paymentHistoryEntry],
              });

              toast.success('✅ Thu tiền thành công!', {
                description: `Số tiền thu: ${additionalAmount.toLocaleString()}đ${newChangeAmount > 0 ? ` | Tiền thừa: ${newChangeAmount.toLocaleString()}đ` : newChangeAmount < 0 ? ` | Còn thiếu: ${Math.abs(newChangeAmount).toLocaleString()}đ` : ''}`,
                duration: 3000,
              });

              setPaymentOrder(null);
              setCustomerAmount('');
              setPaymentNote('');
            };
            
            return (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
                <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
                  {/* Header */}
                  <div className="border-b-2 p-6 rounded-t-2xl flex-shrink-0" style={{ backgroundColor: '#FFF7ED', borderColor: '#FE7410' }}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-2xl font-bold" style={{ color: '#FE7410' }}>{t('collectPayment') || 'Thu tiền bổ sung'}</h2>
                        <p className="text-sm mt-1" style={{ color: '#E56809' }}>
                          Còn thiếu: <span className="font-bold">{remainingAmount.toLocaleString()}đ</span>
                        </p>
                      </div>
                      <button 
                        onClick={() => setPaymentOrder(null)} 
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
                      {/* Payment Methods */}
                      <div>
                        <label className="block text-base font-semibold text-gray-700 mb-3">
                          {t('paymentMethod') || 'Phương thức thanh toán'}
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

                      {/* Customer Amount */}
                      <div>
                        <label className="block text-base font-semibold text-gray-700 mb-3">
                          💰 {t('customerAmount') || 'Tiền khách đưa'}
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
                              <span className="text-gray-700 font-semibold text-base">{t('change') || 'Tiền thừa trả khách'}:</span>
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
                            <span>{t('totalPayment') || 'Tổng thanh toán'}:</span>
                            <span className="font-semibold text-lg">{paymentOrder.total.toLocaleString()}đ</span>
                          </div>
                          <div className="flex justify-between text-base text-gray-700">
                            <span>{t('customerPaid') || 'Khách đã trả'}:</span>
                            <span className="font-semibold text-lg">{receivedAmount.toLocaleString()}đ</span>
                          </div>
                          <div className="border-t-2 pt-3 flex justify-between items-center" style={{ borderColor: '#FE7410' }}>
                            <span className="text-xl font-bold text-gray-900">{t('remaining') || 'Còn thiếu'}:</span>
                            <span className="text-3xl font-bold" style={{ color: '#FE7410' }}>
                              {remainingAmount.toLocaleString()}đ
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Payment Note */}
                      <div>
                        <label className="block text-base font-semibold text-gray-700 mb-3">
                          {t('note') || 'Ghi chú'}
                        </label>
                        <textarea
                          value={paymentNote}
                          onChange={(e) => setPaymentNote(e.target.value)}
                          placeholder={t('addNoteOptional') || 'Thêm ghi chú cho lần thu tiền này...'}
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
                      {t('completePayment') || 'Hoàn thành thu tiền'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}

export default OrderHistory;