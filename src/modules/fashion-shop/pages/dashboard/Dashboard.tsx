import { useStore } from '../../../../lib/fashion-shop-lib/store';
import { useTranslation } from '../../../../lib/fashion-shop-lib/useTranslation';
import { DollarSign, TrendingUp, Package, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useMemo } from 'react';

type TimeFilter = 'today' | 'yesterday' | 'last7Days' | 'last30Days' | 'thisMonth' | 'lastMonth';
type ChartPeriod = '7d' | '30d' | '6m' | '12m';

export function Dashboard() {
  const { orders: ordersRaw, products } = useStore();
  const { t } = useTranslation();

  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('7d');

  // Normalize orders to array
  const ordersArray = Array.isArray(ordersRaw) ? ordersRaw : Object.values(ordersRaw || {});
  const orders = ordersArray.filter((order) => order && order.id && order.total !== undefined && order.date);

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
      
      default:
        return orders;
    }
  };

  const filteredOrders = getFilteredOrders();

  // Today's revenue
  const todayRevenue = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter((order) => new Date(order.date) >= start);
    return {
      total: todayOrders.reduce((sum, order) => sum + order.total, 0),
      count: todayOrders.length
    };
  }, [orders]);

  // Total revenue
  const totalRevenue = useMemo(() => {
    return {
      total: filteredOrders.reduce((sum, order) => sum + order.total, 0),
      count: filteredOrders.length
    };
  }, [filteredOrders]);

  // Inventory value
  const inventoryValue = useMemo(() => {
    const stockProducts = products.filter(p => p.productType === 'product' || !p.productType);
    const totalValue = stockProducts.reduce((sum, p) => {
      const stock = p.stock || 0;
      const price = p.price || 0;
      return sum + (stock * price);
    }, 0);
    return {
      value: totalValue,
      count: stockProducts.length
    };
  }, [products]);

  // Low stock alert
  const lowStock = useMemo(() => {
    const stockProducts = products.filter(p => p.productType === 'product' || !p.productType);
    const lowStockItems = stockProducts.filter(p => {
      const stock = p.stock || 0;
      const minStock = p.minStock || 5;
      return stock <= minStock && stock > 0;
    });
    return lowStockItems.length;
  }, [products]);

  // Revenue trend data for line chart
  const revenueTrendData = useMemo(() => {
    const now = new Date();
    let days = 7;
    
    switch (chartPeriod) {
      case '30d':
        days = 30;
        break;
      case '6m':
        days = 180;
        break;
      case '12m':
        days = 365;
        break;
      default:
        days = 7;
    }

    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= date && orderDate < nextDate;
      });
      
      const revenue = dayOrders.reduce((sum, order) => sum + order.total, 0);
      
      data.push({
        date: `${date.getDate()}-${date.getMonth() + 1}`,
        revenue: revenue / 1000 // Convert to thousands
      });
    }
    
    return data;
  }, [orders, chartPeriod]);

  // Category revenue data
  const categoryData = useMemo(() => {
    const categoryMap = new Map<string, number>();
    
    filteredOrders.forEach(order => {
      const items = Array.isArray(order.items) ? order.items : Object.values(order.items || {});
      items.forEach((item: any) => {
        if (item && item.category) {
          const current = categoryMap.get(item.category) || 0;
          categoryMap.set(item.category, current + (item.price * item.quantity));
        }
      });
    });

    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value: value / 1000 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredOrders]);

  // Top selling products
  const topProducts = useMemo(() => {
    const productMap = new Map<string, { name: string; quantity: number; revenue: number }>();
    
    filteredOrders.forEach(order => {
      const items = Array.isArray(order.items) ? order.items : Object.values(order.items || {});
      items.forEach((item: any) => {
        if (item && item.name) {
          const current = productMap.get(item.name) || { name: item.name, quantity: 0, revenue: 0 };
          productMap.set(item.name, {
            name: item.name,
            quantity: current.quantity + (item.quantity || 1),
            revenue: current.revenue + (item.price * (item.quantity || 1))
          });
        }
      });
    });

    return Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredOrders]);

  // Top customers
  const topCustomers = useMemo(() => {
    const customerMap = new Map<string, { name: string; orders: number; revenue: number }>();
    
    filteredOrders.forEach(order => {
      const name = order.customerName || 'Khách lẻ';
      const current = customerMap.get(name) || { name, orders: 0, revenue: 0 };
      customerMap.set(name, {
        name,
        orders: current.orders + 1,
        revenue: current.revenue + order.total
      });
    });

    return Array.from(customerMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredOrders]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const getTimeFilterLabel = () => {
    switch (timeFilter) {
      case 'today': return 'Hôm nay';
      case 'yesterday': return 'Hôm qua';
      case 'last7Days': return '7 ngày qua';
      case 'last30Days': return '30 ngày qua';
      case 'thisMonth': return 'Tháng này';
      case 'lastMonth': return 'Tháng trước';
      default: return 'Hôm nay';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-500 mt-1">Tổng quan hoạt động kinh doanh</p>
        </div>
        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
          className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#FE7410]"
        >
          <option value="today">Hôm nay</option>
          <option value="yesterday">Hôm qua</option>
          <option value="last7Days">7 ngày qua</option>
          <option value="last30Days">30 ngày qua</option>
          <option value="thisMonth">Tháng này</option>
          <option value="lastMonth">Tháng trước</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Today Revenue */}
        <div className="rounded-2xl p-6 text-white relative overflow-hidden" style={{ backgroundColor: '#FE7410' }}>
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8" />
            <span className="text-sm opacity-90">Hôm nay</span>
          </div>
          <div className="text-sm opacity-90 mb-1">Doanh thu hôm nay</div>
          <div className="text-3xl font-bold mb-1">{formatCurrency(todayRevenue.total)}</div>
          <div className="text-sm opacity-90">{todayRevenue.count} hóa đn</div>
        </div>

        {/* Total Revenue */}
        <div className="rounded-2xl p-6 text-white relative overflow-hidden" style={{ backgroundColor: '#2563EB' }}>
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8" />
            <span className="text-sm opacity-90">Tất cả</span>
          </div>
          <div className="text-sm opacity-90 mb-1">Tổng doanh thu</div>
          <div className="text-3xl font-bold mb-1">{formatCurrency(totalRevenue.total)}</div>
          <div className="text-sm opacity-90">{totalRevenue.count} hóa đơn</div>
        </div>

        {/* Inventory Value */}
        <div className="rounded-2xl p-6 text-white relative overflow-hidden" style={{ backgroundColor: '#9333EA' }}>
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8" />
            <span className="text-sm opacity-90">Kho</span>
          </div>
          <div className="text-sm opacity-90 mb-1">Giá trị tồn kho</div>
          <div className="text-3xl font-bold mb-1">{formatCurrency(inventoryValue.value)}</div>
          <div className="text-sm opacity-90">{inventoryValue.count} sản phẩm</div>
        </div>

        {/* Low Stock Alert */}
        <div className="rounded-2xl p-6 text-white relative overflow-hidden" style={{ backgroundColor: '#DC2626' }}>
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8" />
            <span className="text-sm opacity-90">Cảnh báo</span>
          </div>
          <div className="text-sm opacity-90 mb-1">Sắp hết hàng</div>
          <div className="text-3xl font-bold mb-1">{lowStock}</div>
          <div className="text-sm opacity-90">sản phẩm</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Trend Chart */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Xu hướng doanh thu</h3>
              <p className="text-sm text-gray-500 mt-1">Biểu đồ không gì ảnh hưởng bởi bộ lọc</p>
            </div>
            <span className="text-xs px-2 py-0.5 bg-[#FE7410]/10 text-[#FE7410] rounded font-medium">Đã lọc</span>
          </div>

          {/* Period Tabs */}
          <div className="flex gap-2 mb-4">
            {['7d', '30d', '6m', '12m'].map((period) => (
              <button
                key={period}
                onClick={() => setChartPeriod(period as ChartPeriod)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  chartPeriod === period
                    ? 'bg-[#FE7410] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          {/* Line Chart */}
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px'
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

        {/* Category Chart */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Theo danh mục</h3>
              <p className="text-sm text-gray-500 mt-1">Áp dụng bộ lọc thời gian</p>
            </div>
            <span className="text-xs px-2 py-0.5 bg-[#FE7410]/10 text-[#FE7410] rounded font-medium">Đã lọc</span>
          </div>

          {/* Bar Chart */}
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" fill="#FE7410" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row - Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Sản phẩm bán chạy</h3>
              <p className="text-sm text-gray-500 mt-1">Top 5 sản phẩm theo doanh thu</p>
            </div>
            <span className="text-xs px-2 py-0.5 bg-[#FE7410]/10 text-[#FE7410] rounded font-medium">Đã lọc</span>
          </div>

          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Chưa có dữ liệu</p>
            ) : (
              topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#FE7410] text-white text-sm font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div>
                      <div className="font-semibold text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.quantity} sản phẩm</div>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-[#FE7410]">
                    {formatCurrency(product.revenue)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Top khách hàng</h3>
              <p className="text-sm text-gray-500 mt-1">Top 5 khách hàng theo doanh thu</p>
            </div>
            <span className="text-xs px-2 py-0.5 bg-[#FE7410]/10 text-[#FE7410] rounded font-medium">Đã lọc</span>
          </div>

          <div className="space-y-3">
            {topCustomers.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Chưa có dữ liệu</p>
            ) : (
              topCustomers.map((customer, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#FE7410] text-white text-sm font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div>
                      <div className="font-semibold text-gray-900">{customer.name}</div>
                      <div className="text-sm text-gray-500">{customer.orders} đơn hàng</div>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-[#FE7410]">
                    {formatCurrency(customer.revenue)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;