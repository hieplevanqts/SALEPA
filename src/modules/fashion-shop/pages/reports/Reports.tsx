import { useState, useMemo } from 'react';
import { useStore } from '../../../../lib/fashion-shop-lib/store';
import { useTranslation } from '../../../../lib/fashion-shop-lib/useTranslation';
import { 
  Download, FileText, DollarSign, Users, UserCheck, ShoppingBag, 
  Calendar, Clock, Package, Star, AlertCircle, X, Eye
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Pagination } from '../../components/common/Pagination';
import { getProductVariants } from '../../../../lib/fashion-shop-lib/mockProductService';
import type { ProductVariant } from '../../../../lib/fashion-shop-lib/mockProductData_fashion_only';
import { useParams, Navigate } from 'react-router-dom';
type ReportTab = 'revenue-overview' | 'revenue-staff' | 'revenue-product' | 'customer-report' | 'appointment-report' | 'inventory-report';



export function Reports() {
  const { orders: ordersRaw, products, customers, clearAllOrders } = useStore();
  const { t } = useTranslation();
    const { type } = useParams<{ type: ReportTab }>();
      if (!type) {
        return <Navigate to="revenue-overview" replace />;
      }
    const activeTab = type;
  // Normalize orders to array
  const orders = useMemo(() => {
    const ordersArray = Array.isArray(ordersRaw) ? ordersRaw : Object.values(ordersRaw || {});
    console.log('🔍 RAW ORDERS:', ordersRaw);
    console.log('🔍 ORDERS ARRAY:', ordersArray);
    const filtered = ordersArray.filter((order) => 
      order && 
      order.id && 
      order.total !== undefined && 
      order.date &&
      order.status === 'completed' // Only completed orders
    );
    console.log('🔍 FILTERED ORDERS (completed only):', filtered);
    return filtered;
  }, [ordersRaw]);
  
  // Filters
  const [dateFrom, setDateFrom] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedStaff, setSelectedStaff] = useState<string>('all');
  const [periodType, setPeriodType] = useState<'day' | 'week' | 'month' | 'year'>('day');

  // Quick filter handler
  const handleQuickFilter = (days: number) => {
    const today = new Date();
    const from = new Date(today);
    from.setDate(from.getDate() - days);
    setDateFrom(from.toISOString().split('T')[0]);
    setDateTo(today.toISOString().split('T')[0]);
  };

  // Get report title
  const getReportTitle = () => {
    switch (activeTab) {
      case 'revenue-overview': return 'DT Tổng hợp';
      case 'revenue-staff': return 'DT Nhân viên';
      case 'revenue-product': return 'DT Sản phẩm';
      case 'customer-report': return 'Báo cáo khách hàng';
      case 'appointment-report': return 'Lịch hẹn';
      case 'inventory-report': return 'Tồn kho';
      default: return 'Báo cáo';
    }
  };

  // Get all staff names from orders
  const allStaff = useMemo(() => {
    const staffSet = new Set<string>();
    orders.forEach(order => {
      if (order.createdBy) {
        staffSet.add(order.createdBy);
      }
    });
    return Array.from(staffSet);
  }, [orders]);

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    to.setHours(23, 59, 59, 999);
    
    return orders.filter(order => {
      const orderDate = new Date(order.date);
      return orderDate >= from && orderDate <= to;
    });
  }, [orders, dateFrom, dateTo]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="page-title">{getReportTitle()}</h1>
            <p className="text-gray-500 text-sm mt-1">Phân tích chi tiết hoạt động kinh doanh</p>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => {
                if (window.confirm('⚠️ Xóa TẤT CẢ hóa đơn? Hành động này không thể hoàn tác!')) {
                  clearAllOrders();
                  window.location.reload();
                }
              }}
              className="flex items-center gap-2 px-4 py-2 border-2 border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <X className="w-4 h-4" />
              <span className="text-[16px] font-semibold">Xóa tất cả HĐ</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4 text-gray-400" />
              <span className="text-[16px]">Xuất Excel</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#FE7410] text-white rounded-lg hover:bg-[#E56609] transition-colors">
              <FileText className="w-4 h-4" />
              <span className="text-[16px]">Xuất PDF</span>
            </button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-2">
            <button
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                setDateFrom(today);
                setDateTo(today);
              }}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-[16px]"
            >
              Hôm nay
            </button>
            <button
              onClick={() => handleQuickFilter(7)}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-[16px]"
            >
              7 ngày
            </button>
            <button
              onClick={() => handleQuickFilter(30)}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-[16px]"
            >
              30 ngày
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE7410] text-[16px]"
            />
            <span className="text-gray-500">-</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE7410] text-[16px]"
            />
          </div>
          
          {activeTab === 'revenue-overview' && (
            <select
              value={periodType}
              onChange={(e) => setPeriodType(e.target.value as any)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE7410] text-[16px]"
            >
              <option value="day">Theo ngày</option>
              <option value="week">Theo tuần</option>
              <option value="month">Theo tháng</option>
              <option value="year">Theo năm</option>
            </select>
          )}
          
          {(activeTab === 'revenue-overview' || activeTab === 'revenue-staff') && allStaff.length > 0 && (
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE7410] text-[16px]"
            >
              <option value="all">Tất cả nhân viên</option>
              {allStaff.map((staff) => (
                <option key={staff} value={staff}>{staff}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {activeTab === 'revenue-overview' && <RevenueOverviewReport filteredOrders={filteredOrders} periodType={periodType} />}
        {activeTab === 'revenue-staff' && <RevenueByStaffReport filteredOrders={filteredOrders} selectedStaff={selectedStaff} />}
        {activeTab === 'revenue-product' && <RevenueByProductReport filteredOrders={filteredOrders} products={products} />}
        {activeTab === 'customer-report' && <CustomerOverviewReport customers={customers} filteredOrders={filteredOrders} />}
        {activeTab === 'appointment-report' && <AppointmentOverviewReport />}
        {activeTab === 'inventory-report' && <InventoryOverviewReport products={products} />}
      </div>
    </div>
  );
}

export default Reports;

// 1. Revenue Overview Report
function RevenueOverviewReport({ filteredOrders, periodType }: { filteredOrders: any[], periodType: 'day' | 'week' | 'month' | 'year' }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Group orders by period
  const revenueByPeriod = useMemo(() => {
    const groupedData: { [key: string]: { revenue: number; orders: number } } = {};
    
    filteredOrders.forEach(order => {
      const date = new Date(order.date);
      let periodKey = '';
      
      switch (periodType) {
        case 'day':
          periodKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
          break;
        case 'week':
          const weekNum = Math.ceil(date.getDate() / 7);
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-W${weekNum}`;
          break;
        case 'month':
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'year':
          periodKey = `${date.getFullYear()}`;
          break;
      }
      
      if (!groupedData[periodKey]) {
        groupedData[periodKey] = { revenue: 0, orders: 0 };
      }
      
      groupedData[periodKey].revenue += order.total;
      groupedData[periodKey].orders += 1;
    });
    
    return Object.entries(groupedData).map(([period, data]) => ({
      period,
      revenue: data.revenue,
      orders: data.orders
    })).sort((a, b) => a.period.localeCompare(b.period));
  }, [filteredOrders, periodType]);

  const totalRevenue = revenueByPeriod.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = revenueByPeriod.reduce((sum, item) => sum + item.orders, 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const chartData = revenueByPeriod.map(item => ({
    name: item.period.slice(-5),
    'Doanh thu': item.revenue,
    'Số hóa đơn': item.orders
  }));

  // Pagination
  const totalPages = Math.ceil(revenueByPeriod.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = revenueByPeriod.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-[14px]">Tổng doanh thu</span>
            <DollarSign className="w-5 h-5 text-[#FE7410]" />
          </div>
          <div className="text-[28px] font-bold text-gray-900">
            {totalRevenue.toLocaleString('vi-VN')}đ
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-[14px]">Tổng số hóa đơn</span>
            <FileText className="w-5 h-5 text-[#FE7410]" />
          </div>
          <div className="text-[28px] font-bold text-gray-900">
            {totalOrders.toLocaleString('vi-VN')}
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-[14px]">Giá trị TB/hóa đơn</span>
            <DollarSign className="w-5 h-5 text-[#FE7410]" />
          </div>
          <div className="text-[28px] font-bold text-gray-900">
            {averageOrderValue.toLocaleString('vi-VN')}đ
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="table-header mb-4">Biểu đồ doanh thu</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FE7410" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#FE7410" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" style={{ fontSize: '12px' }} />
            <YAxis style={{ fontSize: '12px' }} />
            <Tooltip />
            <Area type="monotone" dataKey="Doanh thu" stroke="#FE7410" fillOpacity={1} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="modern-table">
          <thead>
            <tr>
              <th className="table-header">Kỳ</th>
              <th className="table-header text-right">Doanh thu</th>
              <th className="table-header text-center">Số hóa đơn</th>
              <th className="table-header text-right">TB/hóa đơn</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item) => (
              <tr key={item.period}>
                <td className="table-content font-medium">{item.period}</td>
                <td className="table-content text-right font-semibold text-[#FE7410]">
                  {item.revenue.toLocaleString('vi-VN')}đ
                </td>
                <td className="table-content text-center">{item.orders}</td>
                <td className="table-content text-right">
                  {(item.revenue / item.orders).toLocaleString('vi-VN')}đ
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {revenueByPeriod.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={revenueByPeriod.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        )}
      </div>
    </div>
  );
}

// 2. Revenue By Staff Report
function RevenueByStaffReport({ filteredOrders, selectedStaff }: { filteredOrders: any[], selectedStaff: string }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Group by staff
  const staffData = useMemo(() => {
    const staffMap: { [key: string]: { revenue: number; orders: number } } = {};
    
    console.log('📊 [Revenue By Staff] Processing orders:', filteredOrders.length);
    
    filteredOrders.forEach(order => {
      const staff = order.createdBy || 'Không xác định';
      
      console.log('  👤 Order:', order.id, '| Staff:', staff, '| Total:', order.total);
      
      if (selectedStaff !== 'all' && staff !== selectedStaff) {
        return;
      }
      
      if (!staffMap[staff]) {
        staffMap[staff] = { revenue: 0, orders: 0 };
      }
      
      staffMap[staff].revenue += order.total;
      staffMap[staff].orders += 1;
    });
    
    return Object.entries(staffMap).map(([name, data]) => ({
      name,
      revenue: data.revenue,
      orders: data.orders
    })).sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders, selectedStaff]);

  const totalRevenue = staffData.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = staffData.reduce((sum, item) => sum + item.orders, 0);

  // Pagination
  const totalPages = Math.ceil(staffData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = staffData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-[14px]">Tổng doanh thu</span>
            <DollarSign className="w-5 h-5 text-[#FE7410]" />
          </div>
          <div className="text-[28px] font-bold text-gray-900">
            {totalRevenue.toLocaleString('vi-VN')}đ
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-[14px]">Số nhân viên</span>
            <Users className="w-5 h-5 text-[#FE7410]" />
          </div>
          <div className="text-[28px] font-bold text-gray-900">
            {staffData.length}
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-[14px]">Tổng hóa đơn</span>
            <FileText className="w-5 h-5 text-[#FE7410]" />
          </div>
          <div className="text-[28px] font-bold text-gray-900">
            {totalOrders}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="table-header mb-4">Top nhân viên</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={staffData.slice(0, 10)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" style={{ fontSize: '12px' }} />
            <YAxis style={{ fontSize: '12px' }} />
            <Tooltip />
            <Bar dataKey="revenue" fill="#FE7410" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="modern-table">
          <thead>
            <tr>
              <th className="table-header">Nhân viên</th>
              <th className="table-header text-right">Doanh thu</th>
              <th className="table-header text-center">Số hóa đơn</th>
              <th className="table-header text-right">TB/hóa đơn</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((staff) => (
              <tr key={staff.name}>
                <td className="table-content font-medium">{staff.name}</td>
                <td className="table-content text-right font-semibold text-[#FE7410]">
                  {staff.revenue.toLocaleString('vi-VN')}đ
                </td>
                <td className="table-content text-center">{staff.orders}</td>
                <td className="table-content text-right">
                  {(staff.revenue / staff.orders).toLocaleString('vi-VN')}đ
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {staffData.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={staffData.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(items) => {
              setItemsPerPage(items);
              setCurrentPage(1);
            }}
          />
        )}
      </div>
    </div>
  );
}

// 3. Revenue By Product Report
function RevenueByProductReport({ filteredOrders, products }: { filteredOrders: any[], products: any[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Calculate product revenue
  const productData = useMemo(() => {
    const productMap: { [key: string]: { revenue: number; quantity: number } } = {};
    
    console.log('📦 [Revenue By Product] Processing orders:', filteredOrders.length);
    
    filteredOrders.forEach(order => {
      console.log('  📋 Order:', order.id, '| Items:', order.items.length);
      
      order.items.forEach((item: any) => {
        const productName = item.name;
        
        console.log('    🛍️ Item:', productName, '| Qty:', item.quantity, '| Price:', item.price);
        
        if (!productMap[productName]) {
          productMap[productName] = { revenue: 0, quantity: 0 };
        }
        
        productMap[productName].revenue += item.price * item.quantity;
        productMap[productName].quantity += item.quantity;
      });
    });
    
    console.log('📊 Final product stats:', productMap);
    
    return Object.entries(productMap).map(([name, data]) => ({
      name,
      revenue: data.revenue,
      quantity: data.quantity
    })).sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders]);

  const totalRevenue = productData.reduce((sum, item) => sum + item.revenue, 0);
  const totalQuantity = productData.reduce((sum, item) => sum + item.quantity, 0);

  // Pagination
  const totalPages = Math.ceil(productData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = productData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-[14px]">Tổng doanh thu</span>
            <DollarSign className="w-5 h-5 text-[#FE7410]" />
          </div>
          <div className="text-[28px] font-bold text-gray-900">
            {totalRevenue.toLocaleString('vi-VN')}đ
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-[14px]">Số sản phẩm</span>
            <Package className="w-5 h-5 text-[#FE7410]" />
          </div>
          <div className="text-[28px] font-bold text-gray-900">
            {productData.length}
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-[14px]">Tổng SL bán</span>
            <ShoppingBag className="w-5 h-5 text-[#FE7410]" />
          </div>
          <div className="text-[28px] font-bold text-gray-900">
            {totalQuantity.toLocaleString('vi-VN')}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="table-header mb-4">Top sản phẩm bán chạy</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={productData.slice(0, 10)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" style={{ fontSize: '12px' }} />
            <YAxis style={{ fontSize: '12px' }} />
            <Tooltip />
            <Bar dataKey="revenue" fill="#FE7410" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="modern-table">
          <thead>
            <tr>
              <th className="table-header">Sản phẩm</th>
              <th className="table-header text-right">Doanh thu</th>
              <th className="table-header text-center">Số lượng bán</th>
              <th className="table-header text-right">Đơn giá TB</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((product) => (
              <tr key={product.name}>
                <td className="table-content font-medium">{product.name}</td>
                <td className="table-content text-right font-semibold text-[#FE7410]">
                  {product.revenue.toLocaleString('vi-VN')}đ
                </td>
                <td className="table-content text-center">{product.quantity}</td>
                <td className="table-content text-right">
                  {(product.revenue / product.quantity).toLocaleString('vi-VN')}đ
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {productData.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={productData.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(items) => {
              setItemsPerPage(items);
              setCurrentPage(1);
            }}
          />
        )}
      </div>
    </div>
  );
}

// 4. Customer Overview Report
function CustomerOverviewReport({ customers, filteredOrders }: { customers: any[], filteredOrders: any[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Calculate customer stats
  const customerData = useMemo(() => {
    const customerMap: { [key: string]: { orders: number; revenue: number; lastVisit: string } } = {};
    
    filteredOrders.forEach(order => {
      const customerId = order.customerPhone || 'Khách lẻ';
      const customerName = order.customerName || 'Khách lẻ';
      
      if (!customerMap[customerId]) {
        customerMap[customerId] = {
          orders: 0,
          revenue: 0,
          lastVisit: order.date
        };
      }
      
      customerMap[customerId].orders += 1;
      customerMap[customerId].revenue += order.total;
      
      if (new Date(order.date) > new Date(customerMap[customerId].lastVisit)) {
        customerMap[customerId].lastVisit = order.date;
      }
    });
    
    return Object.entries(customerMap).map(([id, data]) => {
      const customer = customers.find(c => c.phone === id);
      return {
        id,
        name: customer?.name || 'Khách lẻ',
        phone: id,
        orders: data.orders,
        revenue: data.revenue,
        lastVisit: data.lastVisit
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [customers, filteredOrders]);

  const totalCustomers = customerData.length;
  const totalRevenue = customerData.reduce((sum, c) => sum + c.revenue, 0);
  const avgRevenuePerCustomer = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

  // Pagination
  const totalPages = Math.ceil(customerData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = customerData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-[14px]">Tổng khách hàng</span>
            <Users className="w-5 h-5 text-[#FE7410]" />
          </div>
          <div className="text-[28px] font-bold text-gray-900">
            {totalCustomers}
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-[14px]">Tổng doanh thu</span>
            <DollarSign className="w-5 h-5 text-[#FE7410]" />
          </div>
          <div className="text-[28px] font-bold text-gray-900">
            {totalRevenue.toLocaleString('vi-VN')}đ
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-[14px]">TB/khách hàng</span>
            <UserCheck className="w-5 h-5 text-[#FE7410]" />
          </div>
          <div className="text-[28px] font-bold text-gray-900">
            {avgRevenuePerCustomer.toLocaleString('vi-VN')}đ
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="modern-table">
          <thead>
            <tr>
              <th className="table-header">Khách hàng</th>
              <th className="table-header">SĐT</th>
              <th className="table-header text-center">Số đơn</th>
              <th className="table-header text-right">Doanh thu</th>
              <th className="table-header">Lần mua cuối</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((customer) => (
              <tr key={customer.id}>
                <td className="table-content font-medium">{customer.name}</td>
                <td className="table-content">{customer.phone}</td>
                <td className="table-content text-center">{customer.orders}</td>
                <td className="table-content text-right font-semibold text-[#FE7410]">
                  {customer.revenue.toLocaleString('vi-VN')}đ
                </td>
                <td className="table-content">
                  {new Date(customer.lastVisit).toLocaleDateString('vi-VN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {customerData.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={customerData.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(items) => {
              setItemsPerPage(items);
              setCurrentPage(1);
            }}
          />
        )}
      </div>
    </div>
  );
}

// 5. Appointment Overview Report (Placeholder)
function AppointmentOverviewReport() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
      <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Báo cáo lịch hẹn</h3>
      <p className="text-gray-500">Chức năng đang được phát triển</p>
    </div>
  );
}

// 6. Inventory Overview Report
function InventoryOverviewReport({ products }: { products: any[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);
  const [showVariantsModal, setShowVariantsModal] = useState(false);

  // Filter products (only physical products)
  const stockProducts = useMemo(() => {
    return products.filter(p => p.productType === 'product' || !p.productType);
  }, [products]);

  const totalProducts = stockProducts.length;
  const totalStock = stockProducts.reduce((sum, p) => sum + (p.stock || 0), 0);
  const totalValue = stockProducts.reduce((sum, p) => sum + (p.stock || 0) * (p.price || 0), 0);
  const lowStockCount = stockProducts.filter(p => (p.stock || 0) < 10).length;

  // Handle product click to show variants
  const handleProductClick = async (product: any) => {
    try {
      setSelectedProduct(product);
      
      // Fetch variants from mock API
      const variants = await getProductVariants(product.id);
      setProductVariants(variants);
      setShowVariantsModal(true);
    } catch (error) {
      console.error('Error loading variants:', error);
      // If no variants found, show product itself as default variant
      setProductVariants([]);
      setShowVariantsModal(true);
    }
  };

  // Pagination
  const totalPages = Math.ceil(stockProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = stockProducts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-[14px]">Tổng sản phẩm</span>
            <Package className="w-5 h-5 text-[#FE7410]" />
          </div>
          <div className="text-[28px] font-bold text-gray-900">
            {totalProducts}
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-[14px]">Tổng tồn kho</span>
            <ShoppingBag className="w-5 h-5 text-[#FE7410]" />
          </div>
          <div className="text-[28px] font-bold text-gray-900">
            {totalStock.toLocaleString('vi-VN')}
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-[14px]">Giá trị tồn</span>
            <DollarSign className="w-5 h-5 text-[#FE7410]" />
          </div>
          <div className="text-[28px] font-bold text-gray-900">
            {totalValue.toLocaleString('vi-VN')}đ
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-[14px]">Sắp hết</span>
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-[28px] font-bold text-red-600">
            {lowStockCount}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="modern-table">
          <thead>
            <tr>
              <th className="table-header">Sản phẩm</th>
              <th className="table-header">Danh mục</th>
              <th className="table-header text-right">Giá bán</th>
              <th className="table-header text-center">Tồn kho</th>
              <th className="table-header text-right">Giá trị</th>
              <th className="table-header text-center">Trạng thái</th>
              <th className="table-header text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((product) => {
              const stock = product.stock || 0;
              const value = stock * (product.price || 0);
              const isLowStock = stock < 10;
              
              return (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="table-content font-medium">{product.name}</td>
                  <td className="table-content">{product.category}</td>
                  <td className="table-content text-right">
                    {(product.price || 0).toLocaleString('vi-VN')}đ
                  </td>
                  <td className="table-content text-center">
                    <span className={isLowStock ? 'text-red-600 font-semibold' : ''}>
                      {stock}
                    </span>
                  </td>
                  <td className="table-content text-right font-semibold">
                    {value.toLocaleString('vi-VN')}đ
                  </td>
                  <td className="table-content text-center">
                    {isLowStock ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertCircle className="w-3 h-3" />
                        Sắp hết
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Còn hàng
                      </span>
                    )}
                  </td>
                  <td className="table-content text-center">
                    <button
                      onClick={() => handleProductClick(product)}
                      className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Xem chi tiết SKU"
                    >
                      <Eye className="w-5 h-5 text-blue-600" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {stockProducts.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={stockProducts.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(items) => {
              setItemsPerPage(items);
              setCurrentPage(1);
            }}
          />
        )}
      </div>

      {/* Variants Detail Modal */}
      {showVariantsModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0" onClick={() => setShowVariantsModal(false)}></div>
          
          <div 
            className="relative bg-white w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden"
            style={{ animation: 'fadeIn 0.2s ease-out' }}
          >
            {/* Header */}
            <div className="flex-shrink-0 text-white px-6 py-4 flex items-center justify-between" style={{ backgroundColor: '#FE7410' }}>
              <div>
                <h3 className="text-xl font-bold">Chi tiết tồn kho - SKU</h3>
                <p className="text-sm text-orange-100 mt-0.5">{selectedProduct.name}</p>
              </div>
              <button
                onClick={() => setShowVariantsModal(false)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {productVariants.length === 0 ? (
                // Product has no variants - show product itself
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-3">Sản phẩm này không có phân loại (SKU mặc định)</p>
                    
                    <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">SKU</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Tên sản phẩm</th>
                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-700">Giá bán</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-700">Tồn kho</th>
                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-700">Giá trị</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-mono text-gray-900">
                              {selectedProduct.barcode || selectedProduct.id || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                              {selectedProduct.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900">
                              {(selectedProduct.price || 0).toLocaleString('vi-VN')}đ
                            </td>
                            <td className="px-4 py-3 text-sm text-center">
                              <span className={(selectedProduct.stock || 0) < 10 ? 'text-red-600 font-semibold' : 'text-gray-900 font-semibold'}>
                                {selectedProduct.stock || 0}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                              {((selectedProduct.stock || 0) * (selectedProduct.price || 0)).toLocaleString('vi-VN')}đ
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {/* Summary */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-900">Tổng tồn kho:</span>
                      <span className="text-lg font-bold text-blue-900">{selectedProduct.stock || 0}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-medium text-blue-900">Tổng giá trị:</span>
                      <span className="text-lg font-bold text-blue-900">
                        {((selectedProduct.stock || 0) * (selectedProduct.price || 0)).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                // Product has variants - show all variants
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-3">Sản phẩm có {productVariants.length} SKU phân loại</p>
                    
                    <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">SKU</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Phân loại</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Barcode</th>
                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-700">Giá bán</th>
                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-700">Giá nhập</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-700">Tồn kho</th>
                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-700">Giá trị</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-700">Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {productVariants.map((variant) => {
                            const stock = variant.quantity || 0;
                            const price = variant.price || 0;
                            const costPrice = variant.cost_price || 0;
                            const value = stock * price;
                            const isLowStock = stock < 10;
                            
                            return (
                              <tr key={variant._id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-mono text-gray-900 font-medium">
                                  {variant.sku}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="text-sm text-gray-900 font-medium">{variant.title}</div>
                                  {variant.attributes && Object.keys(variant.attributes).length > 0 && (
                                    <div className="text-xs text-gray-500 mt-0.5">
                                      {Object.entries(variant.attributes).map(([key, value]) => `${key}: ${value}`).join(' • ')}
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                                  {variant.barcode || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-right text-gray-900">
                                  {price.toLocaleString('vi-VN')}đ
                                </td>
                                <td className="px-4 py-3 text-sm text-right text-gray-600">
                                  {costPrice.toLocaleString('vi-VN')}đ
                                </td>
                                <td className="px-4 py-3 text-sm text-center">
                                  <span className={isLowStock ? 'text-red-600 font-semibold' : 'text-gray-900 font-semibold'}>
                                    {stock}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                                  {value.toLocaleString('vi-VN')}đ
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {isLowStock ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      <AlertCircle className="w-3 h-3" />
                                      Sắp hết
                                    </span>
                                  ) : stock === 0 ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                      Hết hàng
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Còn hàng
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {/* Summary */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm font-medium text-blue-900">Tổng SKU:</span>
                        <div className="text-lg font-bold text-blue-900 mt-1">{productVariants.length}</div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-blue-900">Tổng tồn kho:</span>
                        <div className="text-lg font-bold text-blue-900 mt-1">
                          {productVariants.reduce((sum, v) => sum + (v.quantity || 0), 0)}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-blue-900">Tổng giá trị:</span>
                        <div className="text-lg font-bold text-blue-900 mt-1">
                          {productVariants.reduce((sum, v) => sum + ((v.quantity || 0) * (v.price || 0)), 0).toLocaleString('vi-VN')}đ
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="flex-shrink-0 bg-white border-t-2 border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowVariantsModal(false)}
                className="px-6 py-2.5 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}