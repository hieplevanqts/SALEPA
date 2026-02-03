import { useState } from 'react';
import { useStore } from '../../../../lib/restaurant-lib/store';
import { 
  Download, FileText, DollarSign, Users,
  Calendar, Clock, AlertCircle
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
  demoInventoryData,
  demoAppointmentStaffData
} from '../../../../lib/restaurant-lib/demoReportData';
import { Pagination } from '../../components/common/Pagination';
import { usePagination } from '../../../../lib/restaurant-lib/usePagination';
import { useParams, Navigate } from 'react-router-dom';
type ReportTab = 'revenue-overview' | 'revenue-staff' | 'revenue-service' | 'revenue-package' | 'revenue-product' | 'customer-report' | 'appointment-report' | 'inventory-report';

export function Reports() {
  const { selectedIndustry } = useStore();
  const isFoodBeverage = selectedIndustry === 'food-beverage';
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
      case 'customer-report': return 'Báo cáo khách hàng';
      case 'appointment-report': return 'Lịch hẹn';
      case 'inventory-report': return 'Tồn kho';
      default: return 'Báo cáo';
    }
  };

  // Get all staff names
  const allStaff = ['Nguyễn Thị Lan', 'Trần Văn Minh', 'Lê Thị Hương', 'Phạm Minh Tuấn', 'Hoàng Thị Mai', 'Vũ Văn Hải', 'Đặng Thị Thu', 'Bùi Văn Nam'];

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
          
          {(activeTab === 'revenue-overview' || activeTab === 'revenue-staff') && (
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
        {activeTab === 'revenue-overview' && <RevenueOverviewReport />}
        {activeTab === 'revenue-staff' && <RevenueByStaffReport selectedStaff={selectedStaff} isFoodBeverage={isFoodBeverage} />}
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
        <h3 className="table-header mb-4">Biểu đồ doanh thu theo ngày</h3>
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

      {/* Detailed Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="modern-table">
            <thead>
              <tr>
                <th className="table-header text-center">Ngày</th>
                <th className="table-header text-right">Doanh thu</th>
                <th className="table-header text-right">Số hóa đơn</th>
                <th className="table-header text-right">TB/hóa đơn</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, index) => (
                <tr key={index}>
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

        {/* Pagination */}
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
  );
}

// 2. Revenue by Staff Report
function RevenueByStaffReport({ selectedStaff, isFoodBeverage }: { selectedStaff: string, isFoodBeverage?: boolean }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const filteredStaff = selectedStaff === 'all' 
    ? demoStaffPerformance 
    : demoStaffPerformance.filter(s => s.name === selectedStaff);

  const chartData = filteredStaff.slice(0, 10).map((staff: any) => {
    if (isFoodBeverage) {
      // For F&B industry: Hàng chế biến, Sản phẩm thường, Combo
      return {
        name: staff.name,
        'Hàng chế biến': staff.preparedFoodRevenue,
        'Sản phẩm thường': staff.regularProductRevenue,
        'Combo': staff.comboRevenue
      };
    } else {
      // For Spa/Beauty industry: Dịch vụ, Gói liệu trình, Sản phẩm
      return {
        name: staff.name,
        'Dịch vụ': staff.serviceRevenue,
        'Gói liệu trình': staff.packageRevenue,
        'Sản phẩm': staff.productRevenue
      };
    }
  });

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
      

      {/* Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="table-header mb-4">Top 10 nhân viên theo doanh thu</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" style={{ fontSize: '12px' }} />
            <YAxis style={{ fontSize: '12px' }} />
            <Tooltip />
            {isFoodBeverage ? (
              <>
                <Bar dataKey="Hàng chế biến" fill="#FE7410" />
                <Bar dataKey="Sản phẩm thường" fill="#3B82F6" />
                <Bar dataKey="Combo" fill="#10B981" />
              </>
            ) : (
              <>
                <Bar dataKey="Dịch vụ" fill="#FE7410" />
                <Bar dataKey="Gói liệu trình" fill="#3B82F6" />
                <Bar dataKey="Sản phẩm" fill="#10B981" />
              </>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="modern-table">
            <thead>
              <tr>
                <th className="table-header">Nhân viên</th>

                  <>
                    <th className="table-header text-right">DT Hàng chế biến</th>
                    <th className="table-header text-right">DT Sản phẩm thường</th>
                    <th className="table-header text-right">DT Combo</th>
                  </>
                
                <th className="table-header text-right">Tổng DT</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((staff: any, index) => (
                <tr key={index}>
                  <td className="table-content">
                    <div className="font-medium text-gray-900">{staff.name}</div>
                  </td>
                  {isFoodBeverage ? (
                    <>
                      <td className="table-content text-right">
                        {staff.preparedFoodRevenue.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="table-content text-right">
                        {staff.regularProductRevenue.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="table-content text-right">
                        {staff.comboRevenue.toLocaleString('vi-VN')}đ
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="table-content text-right">
                        {staff.serviceRevenue.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="table-content text-right">
                        {staff.packageRevenue.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="table-content text-right">
                        {staff.productRevenue.toLocaleString('vi-VN')}đ
                      </td>
                    </>
                  )}
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

        {/* Pagination */}
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
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="table-header mb-4">Top 10 dịch vụ theo doanh thu</h3>
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="modern-table">
            <thead>
              <tr>
                <th className="table-header">Dịch vụ</th>
                <th className="table-header text-right">Doanh thu</th>
                <th className="table-header text-right">Số lượt</th>
                <th className="table-header">NV thực hiện nhiều nhất</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((service: any, index) => {
                const topStaff = Object.entries(service.staff).sort((a: any, b: any) => b[1] - a[1])[0];
                return (
                  <tr key={index}>
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
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-gray-600 text-[14px] mb-2">Tổng số gói bán ra</div>
          <div className="text-[28px] font-bold text-gray-900">{totalPackages}</div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-gray-600 text-[14px] mb-2">Tổng giá trị gói</div>
          <div className="text-[28px] font-bold text-gray-900">
            {totalRevenue.toLocaleString('vi-VN')}đ
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-gray-600 text-[14px] mb-2">Tổng buổi đã sử dụng</div>
          <div className="text-[28px] font-bold text-gray-900">{totalUsedSessions}</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="modern-table">
            <thead>
              <tr>
                <th className="table-header">Gói liệu trình</th>
                <th className="table-header text-right">Số gói</th>
                <th className="table-header text-right">Giá trị</th>
                <th className="table-header">NV bán hàng</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((pkg: any, index) => {
                const topStaff = Object.entries(pkg.staff).sort((a: any, b: any) => b[1] - a[1])[0];
                return (
                  <tr key={index}>
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
    <div className="space-y-6">
      {/* Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="table-header mb-4">Top 7 sản phẩm theo doanh thu</h3>
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

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="modern-table">
            <thead>
              <tr>
                <th className="table-header">Sản phẩm</th>
                <th className="table-header text-right">Doanh thu</th>
                <th className="table-header text-right">Số lượng bán</th>
                <th className="table-header">NV bán nhiều nhất</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((product: any, index) => {
                const topStaff = Object.entries(product.staff).sort((a: any, b: any) => b[1] - a[1])[0];
                return (
                  <tr key={index}>
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

        {/* Pagination */}
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
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-[16px]">Tổng doanh thu</span>
            <DollarSign className="w-5 h-5 text-[#FE7410]" />
          </div>
          <div className="text-[28px] font-bold text-gray-900">
            {totalRevenue.toLocaleString('vi-VN')}đ
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-[16px]">Tổng khách hàng</span>
            <Users className="w-5 h-5 text-[#FE7410]" />
          </div>
          <div className="text-[28px] font-bold text-gray-900">{totalCustomers}</div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-[16px]">Chi tiêu TB/KH</span>
            <DollarSign className="w-5 h-5 text-[#FE7410]" />
          </div>
          <div className="text-[28px] font-bold text-gray-900">
            {averageSpending.toLocaleString('vi-VN')}đ
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="table-header mb-4">Top 10 khách hàng chi tiêu cao nhất</h3>
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

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="modern-table">
            <thead>
              <tr>
                <th className="table-header">Khách hàng</th>
                <th className="table-header">Số điện thoại</th>
                <th className="table-header text-right">Số lần mua</th>
                <th className="table-header text-right">Tổng chi tiêu</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((customer, index) => (
                <tr key={index}>
                  <td className="table-content">
                    <div className="font-medium text-gray-900">{customer.name}</div>
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

        {/* Pagination */}
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
  );
}

// 7. Appointment Overview Report
function AppointmentOverviewReport() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const totalAppointments = 156;
  const completedAppointments = 132;
  const cancelledAppointments = 24;

  // Top 8 staff for chart
  const topStaffData = demoAppointmentStaffData.slice(0, 8).map(staff => ({
    name: staff.name,
    'Hoàn thành': staff.completed,
    'Hủy': staff.cancelled
  }));

  // Pagination for staff table
  const totalPages = Math.ceil(demoAppointmentStaffData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = demoAppointmentStaffData.slice(startIndex, endIndex);

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
            <span className="text-gray-600 text-[14px]">Tổng số lịch đặt</span>
            <Calendar className="w-5 h-5 text-[#FE7410]" />
          </div>
          <div className="text-[28px] font-bold text-gray-900">{totalAppointments}</div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-[14px]">Lịch hoàn thành</span>
            <Clock className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-[28px] font-bold text-green-600">{completedAppointments}</div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-[14px]">Lịch hủy</span>
            <Clock className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-[28px] font-bold text-red-600">{cancelledAppointments}</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Pie Chart - Completion Rate */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="table-header mb-4">Tỷ lệ hoàn thành lịch hẹn</h3>
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

        {/* Bar Chart - Top Staff */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="table-header mb-4">Top 8 KTV theo số lịch hẹn</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topStaffData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" style={{ fontSize: '11px' }} angle={-45} textAnchor="end" height={80} />
              <YAxis style={{ fontSize: '12px' }} />
              <Tooltip />
              <Bar dataKey="Hoàn thành" stackId="a" fill="#10B981" />
              <Bar dataKey="Hủy" stackId="a" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Staff Performance Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        
        
        <div className="overflow-x-auto">
          <table className="modern-table">
            <thead>
              <tr>
                <th className="table-header">Kỹ thuật viên</th>
                <th className="table-header text-right">Tổng lịch hẹn</th>
                <th className="table-header text-right">Hoàn thành</th>
                <th className="table-header text-right">Hủy</th>
                <th className="table-header text-right">Tỷ lệ hoàn thành</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((staff, index) => (
                <tr key={index}>
                  <td className="table-content">
                    <div className="font-medium text-gray-900">{staff.name}</div>
                  </td>
                  <td className="table-content text-right">
                    {staff.totalAppointments}
                  </td>
                  <td className="table-content text-right">
                    <span className="text-green-600 font-medium">{staff.completed}</span>
                  </td>
                  <td className="table-content text-right">
                    <span className="text-red-600">{staff.cancelled}</span>
                  </td>
                  <td className="table-content text-right">
                    <span className="font-semibold text-[#FE7410]">
                      {staff.completionRate.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={demoAppointmentStaffData.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
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
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-gray-600 text-[14px] mb-2">Tổng sản phẩm</div>
          <div className="text-[28px] font-bold text-gray-900">{productMetrics.length}</div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-gray-600 text-[14px] mb-2">Sản phẩm sắp hết</div>
          <div className="text-[28px] font-bold text-red-600">{lowStockProducts.length}</div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-gray-600 text-[14px] mb-2">Tổng giá trị tồn</div>
          <div className="text-[28px] font-bold text-gray-900">
            {totalValue.toLocaleString('vi-VN')}đ
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Cảnh báo: {lowStockProducts.length} sản phẩm sắp hết hàng</span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="modern-table">
            <thead>
              <tr>
                <th className="table-header">Sản phẩm</th>
                <th className="table-header text-right">Tồn đầu kỳ</th>
                <th className="table-header text-right">Đã bán</th>
                <th className="table-header text-right">Tồn cuối kỳ</th>
                <th className="table-header text-right">Giá trị tồn</th>
              </tr>
            </thead>
            <tbody>
              {pagination.paginatedData.map((product, index) => (
                <tr key={index}>
                  <td className="table-content">{product.name}</td>
                  <td className="table-content text-right">{product.stock}</td>
                  <td className="table-content text-right">{product.sold}</td>
                  <td className="table-content text-right font-medium">
                    {product.currentStock}
                  </td>
                  <td className="table-content text-right">
                    {(product.currentStock * product.price).toLocaleString('vi-VN')}đ
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
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
  );
}