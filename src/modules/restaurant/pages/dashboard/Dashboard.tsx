import { useStore } from '../../../../lib/restaurant-lib/store';
import type { Order, CartItem } from '../../../../lib/restaurant-lib/store';
import { useTranslation } from '../../../../lib/restaurant-lib/useTranslation';
import { TrendingUp, Package, DollarSign, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState } from 'react';

type TimeFilter = 'today' | 'yesterday' | 'last7Days' | 'last30Days' | 'thisMonth' | 'lastMonth' | 'custom';
type ChartPeriod = '7d' | '30d' | '6m' | '12m';

export function Dashboard() {
  const { orders: ordersRaw, products } = useStore();
  const { t } = useTranslation();

  // Time filter state
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
  const [customStartDate] = useState('');
  const [customEndDate] = useState('');
  
  // Chart period state
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('7d');

  // Safety check - ensure we have valid data
  if (!products || !Array.isArray(products)) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="text-center py-20">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Normalize orders to array (handle persisted object format)
  const ordersArray: Order[] = Array.isArray(ordersRaw)
    ? ordersRaw
    : (Object.values(ordersRaw || {}) as Order[]);
  
  // Filter out invalid orders and ensure all properties are primitives
  const orders = ordersArray.filter((order) => {
    return order && order.id && order.total !== undefined && order.date;
  });

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

  // Calculate statistics
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const lowStockProducts = products.filter((p) => p.stock < 10);
  const inventoryValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

  // Get today's orders
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayOrders = orders.filter((order) => new Date(order.date) >= today);
  const todayRevenue = todayOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);

  // Get yesterday's revenue for comparison
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  // Function to get revenue data based on chart period
  const getRevenueChartData = () => {
    let days = 7;
    
    switch (chartPeriod) {
      case '7d':
        days = 7;
        break;
      case '30d':
        days = 30;
        break;
      case '6m':
        days = 180;
        break;
      case '12m':
        days = 365;
        break;
    }
    
    const dateRange = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      return date.toISOString().split('T')[0];
    });
    
    // Group by appropriate time unit
    if (chartPeriod === '6m' || chartPeriod === '12m') {
      // Group by month
      const monthlyData: Record<string, { revenue: number; orders: number }> = {};
      
      dateRange.forEach((date) => {
        const d = new Date(date);
        const monthKey = `${d.getMonth() + 1 < 10 ? '0' : ''}${d.getMonth() + 1}-${d.getFullYear().toString().slice(-2)}`;
        
        const dayOrders = orders.filter((order) => {
          const orderDateStr = typeof order.date === 'string' ? order.date : new Date(order.date).toISOString();
          return orderDateStr.startsWith(date);
        });
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { revenue: 0, orders: 0 };
        }
        
        const revenue = dayOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
        monthlyData[monthKey].revenue += revenue;
        monthlyData[monthKey].orders += dayOrders.length;
      });
      
      return Object.entries(monthlyData).map(([date, data]) => ({
        date,
        revenue: data.revenue / 1000000, // Convert to millions
        orders: data.orders,
      }));
    } else {
      // Group by day
      return dateRange.map((date) => {
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
    }
  };
  
  const chartData = getRevenueChartData();

  // Category performance
  const categoryStats: Record<string, { revenue: number; quantity: number }> = {};
  filteredOrders.forEach((order) => {
    const items = Array.isArray(order.items) ? order.items : (Object.values(order.items || {}) as CartItem[]);
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

  // Top customers
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

  // Top products
  const productStats: Record<string, { name: string; quantity: number; revenue: number }> = {};
  filteredOrders.forEach((order) => {
    const items = Array.isArray(order.items) ? order.items : (Object.values(order.items || {}) as CartItem[]);
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

  // Recent orders
  const recentOrders = filteredOrders.slice(0, 5);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header with Title and Time Filter */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="page-title text-gray-900">{t.dashboard}</h2>
          <p className="text-gray-500 mt-1">{t.businessOverview}</p>
        </div>
        
        {/* Time Filter Dropdown */}
        <div className="relative">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
            className="px-4 py-2 pr-10 rounded-lg border-2 border-gray-200 bg-white text-gray-700 font-medium cursor-pointer hover:border-[#FE7410] focus:outline-none focus:border-[#FE7410] transition-colors"
            style={{
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 8px center',
            }}
          >
            <option value="today">{t.today}</option>
            <option value="yesterday">{t.yesterday}</option>
            <option value="last7Days">{t.last7Days}</option>
            <option value="last30Days">30 ngày qua</option>
            <option value="thisMonth">{t.thisMonth}</option>
            <option value="lastMonth">{t.lastMonth}</option>
          </select>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-[#FE7410] to-[#E56809] p-5 rounded-xl text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="text-xs bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
              {t.today}
            </div>
          </div>
          <div className="text-sm opacity-90 mb-2">{t.todayRevenue}</div>
          <div className="text-3xl font-bold mb-2">{(todayRevenue / 1000000).toFixed(1)}M</div>
          <div className="text-sm opacity-75">{todayOrders.length} {t.orders}</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-5 rounded-xl text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="text-xs bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
              {t.all}
            </div>
          </div>
          <div className="text-sm opacity-90 mb-2">{t.totalRevenue}</div>
          <div className="text-3xl font-bold mb-2">{(totalRevenue / 1000000).toFixed(1)}M</div>
          <div className="text-sm opacity-75">{orders.length} {t.orders}</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-5 rounded-xl text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <Package className="w-6 h-6" />
            </div>
            <div className="text-xs bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
              {t.inventory}
            </div>
          </div>
          <div className="text-sm opacity-90 mb-2">{t.inventoryValue}</div>
          <div className="text-3xl font-bold mb-2">{(inventoryValue / 1000000).toFixed(1)}M</div>
          <div className="text-sm opacity-75">{products.length} {t.items_count}</div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 p-5 rounded-xl text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-xs bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
              Cảnh báo
            </div>
          </div>
          <div className="text-sm opacity-90 mb-2">Sắp hết hàng</div>
          <div className="text-3xl font-bold mb-2">{lowStockProducts.length}</div>
          <div className="text-sm opacity-75">{t.items_count}</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Trend */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Xu hưng doanh thu</h3>
              <p className="text-xs text-gray-500 mt-1">Biểu đồ không bị ảnh hưởng bởi bộ lọc</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setChartPeriod('7d')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  chartPeriod === '7d'
                    ? 'bg-[#FE7410] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                7d
              </button>
              <button
                onClick={() => setChartPeriod('30d')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  chartPeriod === '30d'
                    ? 'bg-[#FE7410] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                30d
              </button>
              <button
                onClick={() => setChartPeriod('6m')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  chartPeriod === '6m'
                    ? 'bg-[#FE7410] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                6m
              </button>
              <button
                onClick={() => setChartPeriod('12m')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  chartPeriod === '12m'
                    ? 'bg-[#FE7410] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                12m
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                formatter={(value) => {
                  const numericValue = Array.isArray(value)
                    ? Number(value[0] ?? 0)
                    : typeof value === 'number'
                      ? value
                      : Number(value ?? 0);

                  return [
                    chartPeriod === '6m' || chartPeriod === '12m'
                      ? `${(numericValue * 1000000).toLocaleString('vi-VN')} ${t.vnd}`
                      : `${(numericValue * 1000).toLocaleString('vi-VN')} ${t.vnd}`,
                    t.total,
                  ];
                }}
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

        {/* Category Performance */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{t.category} - {t.total}</h3>
            <span className="text-sm text-gray-500">{t.byRevenue}</span>
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
                formatter={(value) => {
                  const numericValue = Array.isArray(value)
                    ? Number(value[0] ?? 0)
                    : typeof value === 'number'
                      ? value
                      : Number(value ?? 0);

                  return [`${(numericValue * 1000).toLocaleString('vi-VN')} ${t.vnd}`, t.total];
                }}
              />
              <Bar dataKey="revenue" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

    
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-white">
            <h3 className="text-lg font-semibold text-gray-900">{t.top5Products}</h3>
            
          </div>
          <div className="p-6">
            {topProducts.length === 0 ? (
              <p className="text-gray-400 text-center py-8">{t.noOrders}</p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-[#FE7410]'
                    }`}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.quantity} {t.sold}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-[#FE7410]">{product.revenue.toLocaleString('vi-VN')}{t.vnd}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Customers or Recent Orders */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
            <h3 className="text-lg font-semibold text-gray-900">
              {topCustomers.length > 0 ? t.topCustomers : t.recentOrders}
            </h3>
            <p className="text-sm text-[rgb(16,24,40)] mt-1 text-[18px] font-bold">
              {topCustomers.length > 0 ? `Top 5 ${t.customer}` : `5 ${t.latestOrders}`}
            </p>
          </div>
          <div className="p-6">
            {topCustomers.length > 0 ? (
              <div className="space-y-3">
                {topCustomers.map((customer) => (
                  <div key={customer.name} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">{customer.name}</div>
                      <div className="text-sm text-gray-500">{customer.orders} {t.orders}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">{customer.revenue.toLocaleString('vi-VN')}{t.vnd}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <p className="text-gray-400 text-center py-8">{t.noOrders}</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => {
                  const customerNameStr = typeof order.customerName === 'string' ? order.customerName : '';
                  const itemsCount = Array.isArray(order.items) ? order.items.length : Object.keys(order.items || {}).length;
                  
                  return (
                    <div key={order.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <code className="text-sm font-mono text-gray-600">{order.orderNumber || `#${String(order.id).slice(-8)}`}</code>
                          <div className="text-sm text-gray-500 mt-1">
                            {new Date(order.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <div className="font-semibold text-green-600">{Number(order.total).toLocaleString('vi-VN')}{t.vnd}</div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {customerNameStr || t.walkInCustomer} • {itemsCount} {t.items_count}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;