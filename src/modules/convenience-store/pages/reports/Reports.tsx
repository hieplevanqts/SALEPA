import { useState } from 'react';
import { useStore } from '../../../../lib/convenience-store-lib/store';
import { useTranslation } from '../../../../lib/convenience-store-lib/useTranslation';
import { 
  Download, FileText, DollarSign, Users, UserCheck, ShoppingBag, 
  Calendar, Clock, Package, Star
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  demoRevenueOverview,
  demoStaffPerformance,
  demoServiceRevenue,
  demoPackageRevenue,
  demoProductRevenue,
  demoCustomerData,
  demoServiceHistory,
  demoPackageStatus,
  demoInventoryData
} from '../../../../lib/convenience-store-lib/demoReportData';
import { Pagination } from '../../components/pagination/Pagination';
import { usePagination } from '../../../../lib/convenience-store-lib/usePagination';
import { useParams, Navigate } from 'react-router-dom';
type ReportTab = 'revenue-overview' | 'revenue-staff' | 'revenue-service' | 'revenue-package' | 'revenue-product' | 'customer-report' | 'appointment-report' | 'inventory-report';



export function Reports() {
  const { orders: ordersRaw, products, customers } = useStore();
  const { t } = useTranslation();
  const { type } = useParams<{ type: ReportTab }>();

  if (!type) {
    return <Navigate to="revenue-overview" replace />;
  }

  const activeTab = type;
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
      case 'revenue-service': return 'DT Dịch vụ';
      case 'revenue-package': return 'DT Gói';
      case 'revenue-product': return 'DT Sản phẩm';
      case 'customer-report': return 'KH Tổng quan';
      case 'appointment-report': return 'Lịch hẹn';
      case 'inventory-report': return 'Tồn kho';
      default: return 'Báo cáo';
    }
  };

  // Get all staff names
  const allStaff = ['Nguyễn Thị Lan', 'Trần Văn Minh', 'Lê Thị Hương', 'Phạm Minh Tuấn', 'Hoàng Thị Mai', 'Vũ Văn Hải', 'Đặng Thị Thu', 'Bùi Văn Nam'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{getReportTitle()}</h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Phân tích chi tiết hoạt động kinh doanh</p>
          </div>
          
          <div className="flex gap-2">
            <button className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <Download className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <span className="text-sm sm:text-base">Xuất Excel</span>
            </button>
            <button className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-[#FE7410] text-white rounded-lg hover:bg-[#E56609] transition-colors">
              <FileText className="w-4 h-4" />
              <span className="text-sm sm:text-base">Xuất PDF</span>
            </button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => handleQuickFilter(7)}
              className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              7 ngày
            </button>
            <button
              onClick={() => handleQuickFilter(30)}
              className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              30 ngày
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE7410] text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <span className="text-gray-500 dark:text-gray-400">-</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE7410] text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          {activeTab === 'revenue-overview' && (
            <select
              value={periodType}
              onChange={(e) => setPeriodType(e.target.value as any)}
              className="px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE7410] text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="day">Theo ngày</option>
              <option value="week">Theo tuần</option>
              <option value="month">Theo tháng</option>
              <option value="year">Theo năm</option>
            </select>
          )}
          
          {(activeTab === 'revenue-overview' || activeTab === 'revenue-staff') && (
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE7410] text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
      <div className="p-3 sm:p-6 lg:p-8">
        {activeTab === 'revenue-overview' && <RevenueOverviewReport />}
        {activeTab === 'revenue-staff' && <RevenueByStaffReport selectedStaff={selectedStaff} />}
        {activeTab === 'revenue-service' && <RevenueByServiceReport />}
        {activeTab === 'revenue-package' && <RevenueByPackageReport />}
        {activeTab === 'revenue-product' && <RevenueByProductReport />}
        {activeTab === 'customer-report' && <CustomerOverviewReport />}
        {activeTab === 'appointment-report' && <AppointmentOverviewReport />}
        {activeTab === 'inventory-report' && <InventoryOverviewReport />}
      </div>
    </div>
  );
}

export default Reports;

// 1. Revenue Overview Report
function RevenueOverviewReport() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const totalRevenue = demoRevenueOverview.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = demoRevenueOverview.reduce((sum, item) => sum + item.orders, 0);
  const averageOrderValue = totalRevenue / totalOrders;

  const chartData = demoRevenueOverview.map(item => ({
    name: item.period.slice(5),
    'Doanh thu': item.revenue,
    'Số hóa đơn': item.orders
  }));

  // Pagination
  const totalPages = Math.ceil(demoRevenueOverview.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = demoRevenueOverview.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Tổng doanh thu</span>
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-[#FE7410]" />
          </div>
          <div className="text-xl sm:text-2xl lg:text-[28px] font-bold text-gray-900 dark:text-white">
            {totalRevenue.toLocaleString('vi-VN')}đ
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Tổng số hóa đơn</span>
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#FE7410]" />
          </div>
          <div className="text-xl sm:text-2xl lg:text-[28px] font-bold text-gray-900 dark:text-white">
            {totalOrders.toLocaleString('vi-VN')}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Giá trị TB/hóa đơn</span>
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-[#FE7410]" />
          </div>
          <div className="text-xl sm:text-2xl lg:text-[28px] font-bold text-gray-900 dark:text-white">
            {averageOrderValue.toLocaleString('vi-VN')}đ
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Biểu đồ doanh thu theo ngày</h3>
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

      {/* Detailed Table/Cards */}
      <div>
        {/* Desktop Table View */}
        <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#FEF7ED] dark:bg-gray-700/50">
                <tr>
                  <th className="table-header text-center">Ngày</th>
                  <th className="table-header text-right">Doanh thu</th>
                  <th className="table-header text-right">Số hóa đơn</th>
                  <th className="table-header text-right">TB/hóa đơn</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800">
                {paginatedData.map((item, index) => (
                  <tr key={index} className="transition-colors hover:bg-[#FEF7ED] dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <td className="table-content text-center">{item.period}</td>
                    <td className="table-content text-right font-medium">
                      {item.revenue.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="table-content text-right">
                      {item.orders}
                    </td>
                    <td className="table-content text-right">
                      {(item.revenue / item.orders).toLocaleString('vi-VN')}đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Desktop Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={demoRevenueOverview.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {paginatedData.map((item, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
            >
              {/* Date Header */}
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="text-base font-bold text-gray-900 dark:text-white">
                  📅 {item.period}
                </div>
                <div className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full font-medium">
                  {item.orders} đơn
                </div>
              </div>

              {/* Revenue Info */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Doanh thu:</span>
                  <span className="text-base font-bold text-[#FE7410]">
                    {item.revenue.toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Giá trị TB:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {(item.revenue / item.orders).toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Mobile Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={demoRevenueOverview.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      </div>
    </div>
  );
}

// 2. Revenue by Staff Report
function RevenueByStaffReport({ selectedStaff }: { selectedStaff: string }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const filteredStaff = selectedStaff === 'all' 
    ? demoStaffPerformance 
    : demoStaffPerformance.filter(s => s.name === selectedStaff);

  const chartData = filteredStaff.slice(0, 10).map((staff: any) => ({
    name: staff.name,
    'Dịch vụ': staff.serviceRevenue,
    'Gói liệu trình': staff.packageRevenue,
    'Sản phẩm': staff.productRevenue
  }));

  // Pagination
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredStaff.slice(startIndex, endIndex);

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
      {/* Summary */}
      <div className="bg-gradient-to-r from-[#FE7410]/10 to-orange-50 dark:from-orange-900/20 dark:to-orange-800/10 rounded-xl border border-[#FE7410]/30 dark:border-orange-700/50 p-4 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <Star className="w-5 h-5 sm:w-6 sm:h-6 text-[#FE7410]" />
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Báo cáo hiệu quả nhân viên</h3>
        </div>
        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
          Đánh giá hiệu quả làm việc và phân bổ lịch hợp lý. <span className="font-semibold text-[#FE7410]">Không dùng để tính lương.</span>
        </p>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Top 10 nhân viên theo doanh thu</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" style={{ fontSize: '12px' }} />
            <YAxis style={{ fontSize: '12px' }} />
            <Tooltip />
            <Bar dataKey="Dịch vụ" fill="#FE7410" />
            <Bar dataKey="Gói liệu trình" fill="#3B82F6" />
            <Bar dataKey="Sản phẩm" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Table/Cards */}
      <div>
        {/* Desktop Table View */}
        <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#FEF7ED] dark:bg-gray-700/50">
                <tr>
                  <th className="table-header">Nhân viên</th>
                  <th className="table-header text-right">DT Sản phẩm</th>
                  <th className="table-header text-right">Tổng DT</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800">
                {paginatedData.map((staff: any, index) => (
                  <tr key={index} className="transition-colors hover:bg-[#FEF7ED] dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <td className="table-content">
                      <div className="font-medium text-gray-900 dark:text-white">{staff.name}</div>
                    </td>
                    <td className="table-content text-right">
                      {staff.productRevenue.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="table-content text-right">
                      <span className="font-semibold text-[#FE7410]">
                        {staff.totalRevenue.toLocaleString('vi-VN')}đ
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Desktop Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredStaff.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {paginatedData.map((staff: any, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
            >
              {/* Staff Header */}
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {staff.name.charAt(0)}
                  </div>
                  <div className="font-bold text-gray-900 dark:text-white text-base">
                    {staff.name}
                  </div>
                </div>
              </div>

              {/* Revenue Breakdown */}
              <div className="space-y-2.5 mb-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-[#FE7410]"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Dịch vụ:</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {staff.serviceRevenue.toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-blue-500"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Gói liệu trình:</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {staff.packageRevenue.toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-green-500"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Sản phẩm:</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {staff.productRevenue.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>

              {/* Total Revenue */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tổng doanh thu:</span>
                  <span className="text-lg font-bold text-[#FE7410]">
                    {staff.totalRevenue.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Mobile Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredStaff.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      </div>
    </div>
  );
}

// 3. Revenue by Service Report
function RevenueByServiceReport() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Pagination
  const totalPages = Math.ceil(demoServiceRevenue.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = demoServiceRevenue.slice(startIndex, endIndex);

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
      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="table-header dark:text-white mb-4">Top 10 dịch vụ theo doanh thu</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={demoServiceRevenue.slice(0, 10)} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" style={{ fontSize: '12px' }} />
            <YAxis dataKey="name" type="category" width={180} style={{ fontSize: '12px' }} />
            <Tooltip />
            <Bar dataKey="revenue" fill="#FE7410" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#FEF7ED] dark:bg-gray-700/50">
              <tr>
                <th className="table-header">Dịch vụ</th>
                <th className="table-header text-right">Doanh thu</th>
                <th className="table-header text-right">Số lượt</th>
                <th className="table-header">NV thực hiện nhiều nhất</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800">
              {paginatedData.map((service: any, index) => {
                const topStaff = Object.entries(service.staff).sort((a: any, b: any) => b[1] - a[1])[0];
                return (
                  <tr key={index} className="transition-colors hover:bg-[#FEF7ED] dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <td className="table-content">{service.name}</td>
                    <td className="table-content text-right font-medium">
                      {service.revenue.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="table-content text-right">
                      {service.count} lượt
                    </td>
                    <td className="table-content">
                      {topStaff ? `${topStaff[0]} (${topStaff[1]} lượt)` : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={demoServiceRevenue.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>
    </div>
  );
}

// 4. Revenue by Package Report
function RevenueByPackageReport() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const totalPackages = demoPackageRevenue.reduce((sum: number, p: any) => sum + p.count, 0);
  const totalRevenue = demoPackageRevenue.reduce((sum: number, p: any) => sum + p.revenue, 0);
  const totalUsedSessions = demoPackageRevenue.reduce((sum: number, p: any) => sum + p.usedSessions, 0);

  // Pagination
  const totalPages = Math.ceil(demoPackageRevenue.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = demoPackageRevenue.slice(startIndex, endIndex);

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
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-gray-600 dark:text-gray-400 text-[14px] mb-2">Tổng số gói bán ra</div>
          <div className="text-[28px] font-bold text-gray-900 dark:text-white">{totalPackages}</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-gray-600 dark:text-gray-400 text-[14px] mb-2">Tổng giá trị gói</div>
          <div className="text-[28px] font-bold text-gray-900 dark:text-white">
            {totalRevenue.toLocaleString('vi-VN')}đ
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-gray-600 dark:text-gray-400 text-[14px] mb-2">Tổng buổi đã sử dụng</div>
          <div className="text-[28px] font-bold text-gray-900 dark:text-white">{totalUsedSessions}</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#FEF7ED] dark:bg-gray-700/50">
              <tr>
                <th className="table-header">Gói liệu trình</th>
                <th className="table-header text-right">Số gói</th>
                <th className="table-header text-right">Giá trị</th>
                <th className="table-header">NV bán hàng</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800">
              {paginatedData.map((pkg: any, index) => {
                const topStaff = Object.entries(pkg.staff).sort((a: any, b: any) => b[1] - a[1])[0];
                return (
                  <tr key={index} className="transition-colors hover:bg-[#FEF7ED] dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <td className="table-content">{pkg.name}</td>
                    <td className="table-content text-right">
                      {pkg.count}
                    </td>
                    <td className="table-content text-right font-medium">
                      {pkg.revenue.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="table-content">
                      {topStaff ? `${topStaff[0]} (${topStaff[1]} gói)` : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={demoPackageRevenue.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>
    </div>
  );
}

// 5. Revenue by Product Report
function RevenueByProductReport() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Pagination
  const totalPages = Math.ceil(demoProductRevenue.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = demoProductRevenue.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Top 7 sản phẩm theo doanh thu</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={demoProductRevenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" style={{ fontSize: '12px' }} />
            <YAxis style={{ fontSize: '12px' }} />
            <Tooltip />
            <Bar dataKey="revenue" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table/Cards */}
      <div>
        {/* Desktop Table View */}
        <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#FEF7ED] dark:bg-gray-700/50">
                <tr>
                  <th className="table-header">Sản phẩm</th>
                  <th className="table-header text-right">Doanh thu</th>
                  <th className="table-header text-right">Số lượng bán</th>
                  <th className="table-header">NV bán nhiều nhất</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800">
                {paginatedData.map((product: any, index) => {
                  const topStaff = Object.entries(product.staff).sort((a: any, b: any) => b[1] - a[1])[0];
                  return (
                    <tr key={index} className="transition-colors hover:bg-[#FEF7ED] dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <td className="table-content">{product.name}</td>
                      <td className="table-content text-right font-medium">
                        {product.revenue.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="table-content text-right">
                        {product.quantity}
                      </td>
                      <td className="table-content">
                        {topStaff ? `${topStaff[0]} (${topStaff[1]} SP)` : '-'}
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
            totalItems={demoProductRevenue.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {paginatedData.map((product: any, index) => {
            const topStaff = Object.entries(product.staff).sort((a: any, b: any) => b[1] - a[1])[0];
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
              >
                {/* Product Header */}
                <div className="flex items-start justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 dark:text-white text-base mb-1">
                      {product.name}
                    </div>
                  </div>
                  <div className="ml-3 flex-shrink-0">
                    <div className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium">
                      {product.quantity} SP
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="space-y-2.5 mb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Doanh thu:</span>
                    <span className="text-base font-bold text-green-600">
                      {product.revenue.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Số lượng bán:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {product.quantity} sản phẩm
                    </span>
                  </div>
                </div>

                {/* Top Staff */}
                {topStaff && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        {topStaff[0].charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-500 dark:text-gray-400">NV bán nhiều nhất:</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {topStaff[0]} <span className="text-green-600">({topStaff[1]} SP)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Mobile Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={demoProductRevenue.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      </div>
    </div>
  );
}

// 6. Customer Overview Report
function CustomerOverviewReport() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const totalRevenue = demoCustomerData.reduce((sum, c) => sum + c.totalSpent, 0);
  const totalCustomers = demoCustomerData.length;
  const averageSpending = totalRevenue / totalCustomers;

  // Top 10 customers for chart
  const topCustomers = [...demoCustomerData]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10)
    .map(c => ({
      name: c.name,
      'Chi tiêu': c.totalSpent
    }));

  // Pagination
  const totalPages = Math.ceil(demoCustomerData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = demoCustomerData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Tổng doanh thu</span>
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-[#FE7410]" />
          </div>
          <div className="text-xl sm:text-2xl lg:text-[28px] font-bold text-gray-900 dark:text-white">
            {totalRevenue.toLocaleString('vi-VN')}đ
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Tổng khách hàng</span>
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#FE7410]" />
          </div>
          <div className="text-xl sm:text-2xl lg:text-[28px] font-bold text-gray-900 dark:text-white">{totalCustomers}</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Chi tiu TB/KH</span>
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-[#FE7410]" />
          </div>
          <div className="text-xl sm:text-2xl lg:text-[28px] font-bold text-gray-900 dark:text-white">
            {averageSpending.toLocaleString('vi-VN')}đ
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Top 10 khách hàng chi tiêu cao nhất</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={topCustomers} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" style={{ fontSize: '12px' }} />
            <YAxis dataKey="name" type="category" width={150} style={{ fontSize: '12px' }} />
            <Tooltip />
            <Bar dataKey="Chi tiêu" fill="#FE7410" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table/Cards */}
      <div>
        {/* Desktop Table View */}
        <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#FEF7ED] dark:bg-gray-700/50">
                <tr>
                  <th className="table-header">Khách hàng</th>
                  <th className="table-header">Số điện thoại</th>
                  <th className="table-header text-right">Số lần mua</th>
                  <th className="table-header text-right">Tổng chi tiêu</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800">
                {paginatedData.map((customer, index) => (
                  <tr key={index} className="transition-colors hover:bg-[#FEF7ED] dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <td className="table-content">
                      <div className="font-medium text-gray-900 dark:text-white">{customer.name}</div>
                    </td>
                    <td className="table-content">{customer.phone}</td>
                    <td className="table-content text-right">{customer.orderCount}</td>
                    <td className="table-content text-right font-medium">
                      <span className="text-[#FE7410]">
                        {customer.totalSpent.toLocaleString('vi-VN')}đ
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Desktop Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={demoCustomerData.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {paginatedData.map((customer, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
            >
              {/* Customer Header */}
              <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {customer.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 dark:text-white text-base truncate">
                    {customer.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    📞 {customer.phone}
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Số lần mua:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {customer.orderCount} lần
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tổng chi tiêu:</span>
                  <span className="text-lg font-bold text-[#FE7410]">
                    {customer.totalSpent.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Mobile Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={demoCustomerData.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      </div>
    </div>
  );
}

// 7. Appointment Overview Report
function AppointmentOverviewReport() {
  const totalAppointments = 156;
  const completedAppointments = 132;
  const cancelledAppointments = 24;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400 text-[14px]">Tổng số lịch đặt</span>
            <Calendar className="w-5 h-5 text-[#FE7410]" />
          </div>
          <div className="text-[28px] font-bold text-gray-900 dark:text-white">{totalAppointments}</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400 text-[14px]">Lịch hoàn thành</span>
            <Clock className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-[28px] font-bold text-green-600">{completedAppointments}</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400 text-[14px]">Lịch hủy</span>
            <Clock className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-[28px] font-bold text-red-600">{cancelledAppointments}</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="table-header dark:text-white mb-4">Tỷ lệ hoàn thành lịch hẹn</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={[
                { name: 'Hoàn thành', value: completedAppointments },
                { name: 'Hủy', value: cancelledAppointments }
              ]}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry.name}: ${entry.value}`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              <Cell fill="#10B981" />
              <Cell fill="#EF4444" />
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <p className="text-blue-800 dark:text-blue-400 text-[14px]">
          💡 <strong>Lưu ý:</strong> Dữ liệu lịch hẹn sẽ được tích hợp khi tính năng đặt lịch hoàn thiện.
        </p>
      </div>
    </div>
  );
}

// 8. Inventory Overview Report
function InventoryOverviewReport() {
  const productMetrics = demoInventoryData.map(product => ({
    ...product,
    currentStock: product.stock - product.sold,
    isLowStock: (product.stock - product.sold) <= product.minStock
  }));

  const lowStockProducts = productMetrics.filter(p => p.isLowStock);
  const totalValue = productMetrics.reduce((sum, p) => sum + (p.currentStock * p.price), 0);

  // Pagination
  const pagination = usePagination(productMetrics, 10);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-2">Tổng sản phẩm</div>
          <div className="text-xl sm:text-2xl lg:text-[28px] font-bold text-gray-900 dark:text-white">{productMetrics.length}</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-2">Sản phẩm sắp hết</div>
          <div className="text-xl sm:text-2xl lg:text-[28px] font-bold text-red-600">{lowStockProducts.length}</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-2">Tổng giá trị tồn</div>
          <div className="text-xl sm:text-2xl lg:text-[28px] font-bold text-gray-900 dark:text-white">
            {totalValue.toLocaleString('vi-VN')}đ
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 sm:p-6">
          <h3 className="text-xs sm:text-sm font-semibold text-red-900 dark:text-red-400 mb-2">⚠️ Cảnh báo tồn kho thấp</h3>
          <p className="text-red-700 dark:text-red-400 text-xs sm:text-sm">
            Có {lowStockProducts.length} sản phẩm sắp hết hàng. Vui lòng nhập thêm.
          </p>
        </div>
      )}

      {/* Table/Cards */}
      <div>
        {/* Desktop Table View */}
        <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#FEF7ED] dark:bg-gray-700/50">
                <tr>
                  <th className="table-header">Sản phẩm</th>
                  <th className="table-header text-right">Tồn đầu kỳ</th>
                  <th className="table-header text-right">Đã bán</th>
                  <th className="table-header text-right">Tồn cuối kỳ</th>
                  <th className="table-header text-right">Giá trị tồn</th>
                  <th className="table-header">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800">
                {pagination.paginatedData.map((product, index) => (
                  <tr key={index} className="transition-colors hover:bg-[#FEF7ED] dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <td className="table-content">{product.name}</td>
                    <td className="table-content text-right">{product.stock}</td>
                    <td className="table-content text-right">{product.sold}</td>
                    <td className="table-content text-right font-medium">
                      {product.currentStock}
                    </td>
                    <td className="table-content text-right">
                      {(product.currentStock * product.price).toLocaleString('vi-VN')}đ
                    </td>
                    <td className="table-content">
                      {product.isLowStock ? (
                        <span className="text-red-600">Sắp hết</span>
                      ) : (
                        'Bình thường'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Desktop Pagination */}
          {productMetrics.length > 0 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              itemsPerPage={pagination.itemsPerPage}
              onPageChange={pagination.handlePageChange}
              onItemsPerPageChange={pagination.handleItemsPerPageChange}
            />
          )}
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {pagination.paginatedData.map((product, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
            >
              {/* Product Header */}
              <div className="flex items-start justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 dark:text-white text-base mb-1">
                    {product.name}
                  </div>
                </div>
                <div className="ml-3 flex-shrink-0">
                  {product.isLowStock ? (
                    <div className="text-xs px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full font-semibold">
                      ⚠️ Sắp hết
                    </div>
                  ) : (
                    <div className="text-xs px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium">
                      ✓ Bình thường
                    </div>
                  )}
                </div>
              </div>

              {/* Stock Info Grid */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tồn đầu kỳ</div>
                  <div className="text-base font-bold text-gray-900 dark:text-white">{product.stock}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Đã bán</div>
                  <div className="text-base font-bold text-blue-600">{product.sold}</div>
                </div>
              </div>

              {/* Current Stock & Value */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tồn cuối kỳ:</span>
                  <span className={`text-base font-bold ${product.isLowStock ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                    {product.currentStock} SP
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Giá trị tồn:</span>
                  <span className="text-lg font-bold text-[#FE7410]">
                    {(product.currentStock * product.price).toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Mobile Pagination */}
          {productMetrics.length > 0 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              itemsPerPage={pagination.itemsPerPage}
              onPageChange={pagination.handlePageChange}
              onItemsPerPageChange={pagination.handleItemsPerPageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}