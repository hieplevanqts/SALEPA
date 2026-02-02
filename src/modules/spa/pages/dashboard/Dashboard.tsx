import { useStore } from '../../../../lib/spa-lib/store';
import { useTranslation } from '../../../../lib/spa-lib/useTranslation';
import { ShoppingBag, TrendingUp, Package, DollarSign, AlertTriangle, Clock, Calendar, X } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useState } from 'react';

type TimeFilter = 'today' | 'yesterday' | 'last7Days' | 'last30Days' | 'thisMonth' | 'lastMonth' | 'custom';
type ChartPeriod = '7days' | '30days' | '6months' | '12months';

interface DashboardProps {
  userRole?: 'admin' | 'cashier' | 'technician';
}

export function Dashboard({ userRole = 'admin' }: DashboardProps) {
  const { orders: ordersRaw, products, currentShift: currentShiftRaw } = useStore();
  const { t } = useTranslation();

  // Time filter state
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // Chart period state
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('7days');

  // Normalize orders to array (handle persisted object format)
  const ordersArray = Array.isArray(ordersRaw) ? ordersRaw : Object.values(ordersRaw || {});
  
  // Filter out invalid orders and ensure all properties are primitives
  const orders = ordersArray.filter((order) => {
    return (
      order &&
      typeof order === 'object' &&
      order.id &&
      order.total !== undefined &&
      order.date
    );
  });

  // Safely extract currentShift properties
  const currentShift = currentShiftRaw ? {
    openedBy: String(currentShiftRaw.openedBy || ''),
    startTime: currentShiftRaw.startTime || new Date().toISOString(),
    openingCash: Number(currentShiftRaw.openingCash || 0),
    revenue: Number(currentShiftRaw.revenue || 0),
    orderCount: Number(currentShiftRaw.orderCount || 0),
  } : null;

  // Filter orders based on time filter
  const getFilteredOrders = () => {
    const now = new Date();
    
    switch (timeFilter) {
      case 'today': {
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);
        return orders.filter((order) => new Date(order.date) >= start);
      }
      
      case 'yesterday': {
        const start = new Date(now);
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        const end = new Date(now);
        end.setHours(0, 0, 0, 0);
        return orders.filter((order) => {
          const orderDate = new Date(order.date);
          return orderDate >= start && orderDate < end;
        });
      }
      
      case 'last7Days': {
        const start = new Date(now);
        start.setDate(start.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        return orders.filter((order) => new Date(order.date) >= start);
      }
      
      case 'last30Days': {
        const start = new Date(now);
        start.setDate(start.getDate() - 30);
        start.setHours(0, 0, 0, 0);
        return orders.filter((order) => new Date(order.date) >= start);
      }
      
      case 'thisMonth': {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        return orders.filter((order) => new Date(order.date) >= start);
      }
      
      case 'lastMonth': {
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 1);
        return orders.filter((order) => {
          const orderDate = new Date(order.date);
          return orderDate >= start && orderDate < end;
        });
      }
      
      case 'custom': {
        if (!customStartDate || !customEndDate) return orders;
        const start = new Date(customStartDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999);
        return orders.filter((order) => {
          const orderDate = new Date(order.date);
          return orderDate >= start && orderDate <= end;
        });
      }
      
      default:
        return orders;
    }
  };

  const filteredOrders = getFilteredOrders();

  // Get filter label
  const getFilterLabel = () => {
    switch (timeFilter) {
      case 'today': return 'Hôm nay';
      case 'yesterday': return 'Hôm qua';
      case 'last7Days': return '7 ngày qua';
      case 'last30Days': return '30 ngày qua';
      case 'thisMonth': return 'Tháng này';
      case 'lastMonth': return 'Tháng trước';
      case 'custom': 
        if (customStartDate && customEndDate) {
          return `${new Date(customStartDate).toLocaleDateString('vi-VN')} - ${new Date(customEndDate).toLocaleDateString('vi-VN')}`;
        }
        return 'Tùy chỉnh';
      default: return '';
    }
  };

  // Calculate statistics
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const totalOrders = filteredOrders.length;
  const totalProducts = products.length;
  const lowStockProducts = products.filter((p) => p.stock < 10);
  const inventoryValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

  // Get today's orders
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayOrders = orders.filter((order) => new Date(order.date) >= today);
  const todayRevenue = todayOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);

  // Dynamic chart data based on period
  const getRevenueChartData = () => {
    const now = new Date();
    
    if (chartPeriod === '7days') {
      // Last 7 days
      const days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });
      
      return days.map((date) => {
        const dayOrders = orders.filter((order) => {
          const orderDateStr = typeof order.date === 'string' ? order.date : new Date(order.date).toISOString();
          return orderDateStr.startsWith(date);
        });
        const revenue = dayOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
        return {
          date: new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
          revenue: revenue / 1000,
          orders: dayOrders.length,
        };
      });
    } else if (chartPeriod === '30days') {
      // Last 30 days
      const days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return date.toISOString().split('T')[0];
      });
      
      return days.map((date) => {
        const dayOrders = orders.filter((order) => {
          const orderDateStr = typeof order.date === 'string' ? order.date : new Date(order.date).toISOString();
          return orderDateStr.startsWith(date);
        });
        const revenue = dayOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
        return {
          date: new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
          revenue: revenue / 1000,
          orders: dayOrders.length,
        };
      });
    } else if (chartPeriod === '6months') {
      // Last 6 months
      const months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - i));
        return { year: date.getFullYear(), month: date.getMonth() };
      });
      
      return months.map((monthData) => {
        const monthOrders = orders.filter((order) => {
          const orderDate = new Date(order.date);
          return orderDate.getFullYear() === monthData.year && orderDate.getMonth() === monthData.month;
        });
        const revenue = monthOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
        return {
          date: `T${monthData.month + 1}/${monthData.year}`,
          revenue: revenue / 1000,
          orders: monthOrders.length,
        };
      });
    } else if (chartPeriod === '12months') {
      // Last 12 months
      const months = Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (11 - i));
        return { year: date.getFullYear(), month: date.getMonth() };
      });
      
      return months.map((monthData) => {
        const monthOrders = orders.filter((order) => {
          const orderDate = new Date(order.date);
          return orderDate.getFullYear() === monthData.year && orderDate.getMonth() === monthData.month;
        });
        const revenue = monthOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
        return {
          date: `T${monthData.month + 1}/${monthData.year}`,
          revenue: revenue / 1000,
          orders: monthOrders.length,
        };
      });
    }
    
    return [];
  };

  const revenueChartData = getRevenueChartData();

  // Category performance (based on filter)
  const categoryStats: Record<string, { revenue: number; quantity: number }> = {};
  filteredOrders.forEach((order) => {
    const items = Array.isArray(order.items) ? order.items : Object.values(order.items || {});
    items.forEach((item) => {
      // Validate item has valid primitive values
      if (!item || typeof item !== 'object' || !item.category || typeof item.category !== 'string') {
        return;
      }
      
      if (!categoryStats[item.category]) {
        categoryStats[item.category] = { revenue: 0, quantity: 0 };
      }
      categoryStats[item.category].revenue += (Number(item.price || 0) - Number(item.discount || 0)) * Number(item.quantity || 0);
      categoryStats[item.category].quantity += Number(item.quantity || 0);
    });
  });

  const categoryChartData = Object.entries(categoryStats)
    .map(([name, data]) => ({
      name,
      revenue: data.revenue / 1000,
      quantity: data.quantity,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // Hourly sales trend (based on filter)
  const hourlySales: Record<number, number> = {};
  filteredOrders.forEach((order) => {
    const hour = new Date(order.date).getHours();
    hourlySales[hour] = (hourlySales[hour] || 0) + Number(order.total || 0);
  });

  const hourlySalesData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}h`,
    revenue: (hourlySales[i] || 0) / 1000,
  })).filter((item) => item.revenue > 0);

  // Top customers (based on filter)
  const customerStats: Record<string, { name: string; orders: number; revenue: number }> = {};
  filteredOrders.forEach((order) => {
    if (order.customerName && typeof order.customerName === 'string') {
      if (!customerStats[order.customerName]) {
        customerStats[order.customerName] = {
          name: order.customerName,
          orders: 0,
          revenue: 0,
        };
      }
      customerStats[order.customerName].orders += 1;
      customerStats[order.customerName].revenue += Number(order.total || 0);
    }
  });

  const topCustomers = Object.values(customerStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Top products (based on filter)
  const productStats: Record<string, { name: string; quantity: number; revenue: number }> = {};
  filteredOrders.forEach((order) => {
    const items = Array.isArray(order.items) ? order.items : Object.values(order.items || {});
    items.forEach((item) => {
      // Validate item has valid primitive values
      if (!item || typeof item !== 'object' || !item.name || typeof item.name !== 'string') {
        return;
      }
      
      if (!productStats[item.name]) {
        productStats[item.name] = {
          name: item.name,
          quantity: 0,
          revenue: 0,
        };
      }
      productStats[item.name].quantity += Number(item.quantity || 0);
      productStats[item.name].revenue += (Number(item.price || 0) - Number(item.discount || 0)) * Number(item.quantity || 0);
    });
  });

  const topProducts = Object.values(productStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header with Time Filter */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="page-title text-gray-900">{t('dashboard')}</h2>
            <p className="text-gray-500 mt-1">{t('businessOverview')}</p>
          </div>
          
          {/* Time Filter - Compact in Header */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE7410] focus:border-transparent bg-white text-gray-900 font-medium min-w-[140px]"
              >
                <option value="today">Hôm nay</option>
                <option value="yesterday">Hôm qua</option>
                <option value="last7Days">7 ngày qua</option>
                <option value="last30Days">30 ngày qua</option>
                <option value="thisMonth">Tháng này</option>
                <option value="lastMonth">Tháng trước</option>
                <option value="custom">Tùy chỉnh</option>
              </select>
            </div>
            
           
          </div>
        </div>
        
        {/* Custom Date Range - Only show when custom selected */}
        {timeFilter === 'custom' && (
          <div className="flex flex-wrap items-center gap-2 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
            <span className="text-sm text-gray-600">Chọn khoảng:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
            />
            <span className="text-gray-400 text-sm">—</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE7410] focus:border-transparent"
            />
            {customStartDate && customEndDate && (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm">
                  <span className="text-gray-700">
                    {new Date(customStartDate).toLocaleDateString('vi-VN')} - {new Date(customEndDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setTimeFilter('today');
                    setCustomStartDate('');
                    setCustomEndDate('');
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Xóa
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Main Metrics - KHÔNG BỊ FILTER */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 ${userRole === 'admin' ? 'lg:grid-cols-4' : ''}`}>
        <div className="bg-gradient-to-br from-[#FE7410] to-[#E56809] p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="text-xs bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm">Hôm nay</div>
          </div>
          <div className="text-sm opacity-90 mb-1">{t('todayRevenue')}</div>
          <div className="text-3xl font-bold mb-2">{(todayRevenue / 1000000).toFixed(1)}M</div>
          <div className="text-sm opacity-75">{todayOrders.length} {t('orders')}</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="text-xs bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm">Tất cả</div>
          </div>
          <div className="text-sm opacity-90 mb-1">{t('totalRevenue')}</div>
          <div className="text-3xl font-bold mb-2">{(totalRevenue / 1000000).toFixed(1)}M</div>
          <div className="text-sm opacity-75">{totalOrders} {t('orders')}</div>
        </div>

        {/* Only show Inventory and Low Stock cards for Admin */}
        {userRole === 'admin' && (
          <>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <Package className="w-6 h-6" />
                </div>
                <div className="text-xs bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm">Kho</div>
              </div>
              <div className="text-sm opacity-90 mb-1">{t('inventoryValue')}</div>
              <div className="text-3xl font-bold mb-2">{(inventoryValue / 1000000).toFixed(1)}M</div>
              <div className="text-sm opacity-75">{products.length} {t('items_count')}</div>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="text-xs bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm">Cảnh báo</div>
              </div>
              <div className="text-sm opacity-90 mb-1">{t('lowStock')}</div>
              <div className="text-3xl font-bold mb-2">{lowStockProducts.length}</div>
              <div className="text-sm opacity-75">{t('items_count')}</div>
            </div>
          </>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Trend - KHÔNG BỊ FILTER */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Xu hướng doanh thu</h3>
              <p className="text-xs text-gray-500 mt-0.5">Biểu đồ không bị ảnh hưởng bởi bộ lọc</p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setChartPeriod('7days')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                  chartPeriod === '7days'
                    ? 'bg-[#FE7410] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                7d
              </button>
              <button
                onClick={() => setChartPeriod('30days')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                  chartPeriod === '30days'
                    ? 'bg-[#FE7410] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                30d
              </button>
              <button
                onClick={() => setChartPeriod('6months')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                  chartPeriod === '6months'
                    ? 'bg-[#FE7410] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                6m
              </button>
              <button
                onClick={() => setChartPeriod('12months')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                  chartPeriod === '12months'
                    ? 'bg-[#FE7410] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                12m
              </button>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`${(value * 1000).toLocaleString('vi-VN')} ${t('vnd')}`, t('total')]}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#FE7410"
                strokeWidth={3}
                dot={{ fill: '#FE7410', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Performance - ÁP DỤNG BỘ LỌC */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Theo danh mục</h3>
              <span className="text-xs px-2 py-0.5 bg-[#FE7410]/10 text-[#FE7410] rounded font-medium">Đã lọc</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Áp dụng bộ lọc thời gian</p>
          </div>
          
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={categoryChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`${(value * 1000).toLocaleString('vi-VN')} ${t('vnd')}`, t('total')]}
              />
              <Bar dataKey="revenue" fill="#FE7410" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products - ÁP DỤNG BỘ LỌC */}
        {topProducts.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Sản phẩm bán chạy</h3>
                <span className="text-xs px-2 py-0.5 bg-[#FE7410]/10 text-[#FE7410] rounded font-medium">Đã lọc</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Top 5 sản phẩm theo doanh thu</p>
            </div>
            
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-gray-100 text-gray-600' :
                    index === 2 ? 'bg-orange-100 text-orange-600' :
                    'bg-gray-50 text-gray-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.quantity} sản phẩm</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#FE7410]">
                      {(product.revenue / 1000).toLocaleString('vi-VN')}K
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Customers - ÁP DỤNG BỘ LỌC */}
        {topCustomers.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Top khách hàng</h3>
                <span className="text-xs px-2 py-0.5 bg-[#FE7410]/10 text-[#FE7410] rounded font-medium">Đã lọc</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Top 5 khách hàng theo doanh thu</p>
            </div>
            
            <div className="space-y-3">
              {topCustomers.map((customer, index) => (
                <div key={customer.name} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-gray-100 text-gray-600' :
                    index === 2 ? 'bg-orange-100 text-orange-600' :
                    'bg-gray-50 text-gray-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{customer.name}</p>
                    <p className="text-xs text-gray-500">{customer.orders} đơn hàng</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#FE7410]">
                      {(customer.revenue / 1000000).toFixed(1)}M
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;