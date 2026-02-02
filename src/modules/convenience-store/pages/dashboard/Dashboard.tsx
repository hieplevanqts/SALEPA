import { useStore } from "../../../../lib/convenience-store-lib/store";
import { useTranslation } from "../../../../lib/convenience-store-lib/useTranslation";
import {
  ShoppingBag,
  TrendingUp,
  Package,
  DollarSign,
  AlertTriangle,
  ChevronDown,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";

type TimeFilter =
  | "today"
  | "yesterday"
  | "last7Days"
  | "last30Days"
  | "thisMonth"
  | "lastMonth"
  | "custom";

export function Dashboard() {
  const { orders: ordersRaw, products, customers } = useStore();
  const { t } = useTranslation();

  // Time filter state
  const [timeFilter, setTimeFilter] =
    useState<TimeFilter>("today");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [showCustomDatePicker, setShowCustomDatePicker] =
    useState(false);

  // Normalize orders to array
  const ordersArray = Array.isArray(ordersRaw)
    ? ordersRaw
    : Object.values(ordersRaw || {});

  // Filter out invalid orders
  const orders = ordersArray.filter((order) => {
    return (
      order &&
      typeof order === "object" &&
      order.id &&
      order.total !== undefined &&
      order.date
    );
  });

  // Get filtered orders
  const getFilteredOrders = () => {
    const now = new Date();

    switch (timeFilter) {
      case "today": {
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);
        const end = new Date(now);
        end.setHours(23, 59, 59, 999);
        return orders.filter(
          (order) =>
            new Date(order.date) >= start &&
            new Date(order.date) <= end,
        );
      }

      case "yesterday": {
        const start = new Date(now);
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        const end = new Date(now);
        end.setDate(end.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        return orders.filter(
          (order) =>
            new Date(order.date) >= start &&
            new Date(order.date) <= end,
        );
      }

      case "last7Days": {
        const start = new Date(now);
        start.setDate(start.getDate() - 7);
        return orders.filter(
          (order) => new Date(order.date) >= start,
        );
      }

      case "last30Days": {
        const start = new Date(now);
        start.setDate(start.getDate() - 30);
        return orders.filter(
          (order) => new Date(order.date) >= start,
        );
      }

      case "thisMonth": {
        const start = new Date(
          now.getFullYear(),
          now.getMonth(),
          1,
        );
        return orders.filter(
          (order) => new Date(order.date) >= start,
        );
      }

      case "lastMonth": {
        const start = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1,
        );
        const end = new Date(
          now.getFullYear(),
          now.getMonth(),
          0,
        );
        return orders.filter(
          (order) =>
            new Date(order.date) >= start &&
            new Date(order.date) <= end,
        );
      }

      case "custom": {
        if (customStartDate && customEndDate) {
          const start = new Date(customStartDate);
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          return orders.filter(
            (order) =>
              new Date(order.date) >= start &&
              new Date(order.date) <= end,
          );
        }
        return orders;
      }

      default:
        return orders;
    }
  };

  const filteredOrders = getFilteredOrders();

  // Calculate statistics
  const activeProducts = products.filter((p) => p.status === 1);
  const totalRevenue = filteredOrders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0,
  );
  const totalOrders = filteredOrders.length;
  const lowStockProducts = activeProducts.filter(
    (p) => p.stock < 10,
  );
  const inventoryValue = activeProducts.reduce(
    (sum, p) => sum + p.price * p.stock,
    0,
  );

  // Get revenue for last 12 time periods
  const getLast12Periods = () => {
    const periods = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      periods.push(date.toISOString().split("T")[0]);
    }

    return periods;
  };

  const last12Periods = getLast12Periods();

  const revenueByPeriod = last12Periods.map((date) => {
    const dayOrders = orders.filter((order) => {
      const orderDateStr =
        typeof order.date === "string"
          ? order.date
          : new Date(order.date).toISOString();
      return orderDateStr.startsWith(date);
    });
    const revenue = dayOrders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0,
    );
    return {
      date: new Date(date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      }),
      revenue: revenue,
      orders: dayOrders.length,
    };
  });

  // Category performance
  const categoryStats: Record<
    string,
    { revenue: number; quantity: number }
  > = {};
  filteredOrders.forEach((order) => {
    const items = Array.isArray(order.items)
      ? order.items
      : Object.values(order.items || {});
    items.forEach((item) => {
      if (
        !item ||
        typeof item !== "object" ||
        !item.category ||
        typeof item.category !== "string"
      ) {
        return;
      }

      if (!categoryStats[item.category]) {
        categoryStats[item.category] = {
          revenue: 0,
          quantity: 0,
        };
      }
      categoryStats[item.category].revenue +=
        (Number(item.price || 0) - Number(item.discount || 0)) *
        Number(item.quantity || 0);
      categoryStats[item.category].quantity += Number(
        item.quantity || 0,
      );
    });
  });

  const categoryChartData = Object.entries(categoryStats)
    .map(([name, data]) => ({
      name,
      revenue: data.revenue,
      quantity: data.quantity,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 3);

  // Top customers by total spending
  const customerStats: Record<
    string,
    { name: string; orders: number; revenue: number }
  > = {};
  filteredOrders.forEach((order) => {
    if (
      order.customerName &&
      typeof order.customerName === "string"
    ) {
      if (!customerStats[order.customerName]) {
        customerStats[order.customerName] = {
          name: order.customerName,
          orders: 0,
          revenue: 0,
        };
      }
      customerStats[order.customerName].orders += 1;
      customerStats[order.customerName].revenue += Number(
        order.total || 0,
      );
    }
  });

  const topCustomers = Object.values(customerStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 4);

  // Top products
  const productStats: Record<
    string,
    { name: string; quantity: number; revenue: number }
  > = {};
  filteredOrders.forEach((order) => {
    const items = Array.isArray(order.items)
      ? order.items
      : Object.values(order.items || {});
    items.forEach((item) => {
      if (
        !item ||
        typeof item !== "object" ||
        !item.name ||
        typeof item.name !== "string"
      ) {
        return;
      }

      if (!productStats[item.name]) {
        productStats[item.name] = {
          name: item.name,
          quantity: 0,
          revenue: 0,
        };
      }
      productStats[item.name].quantity += Number(
        item.quantity || 0,
      );
      productStats[item.name].revenue +=
        (Number(item.price || 0) - Number(item.discount || 0)) *
        Number(item.quantity || 0);
    });
  });

  const topProducts = Object.values(productStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 4);

  const getTimeFilterLabel = () => {
    switch (timeFilter) {
      case "today":
        return t("today");
      case "yesterday":
        return t("yesterday");
      case "last7Days":
        return t("last7Days");
      case "last30Days":
        return t("last30Days");
      case "thisMonth":
        return t("thisMonth");
      case "lastMonth":
        return t("lastMonth");
      case "custom":
        return t("custom");
      default:
        return t("today");
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header with Time Filter */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Tổng quan hoạt động kinh doanh
          </p>
        </div>

        <div className="relative">
          <select
            value={timeFilter}
            onChange={(e) => {
              const newValue = e.target.value as TimeFilter;
              setTimeFilter(newValue);
              if (newValue === "custom") {
                setShowCustomDatePicker(true);
              } else {
                setShowCustomDatePicker(false);
              }
            }}
            className="appearance-none bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-[#FE7410] focus:outline-none focus:border-[#FE7410] cursor-pointer transition-colors"
          >
            <option value="today">{t("today")}</option>
            <option value="yesterday">{t("yesterday")}</option>
            <option value="last7Days">{t("last7Days")}</option>
            <option value="last30Days">
              {t("last30Days")}
            </option>
            <option value="thisMonth">{t("thisMonth")}</option>
            <option value="lastMonth">{t("lastMonth")}</option>
            <option value="custom">{t("custom")}</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>

        {showCustomDatePicker && timeFilter === "custom" && (
          <div className="absolute right-0 top-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 z-50">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <input
                type="date"
                value={customStartDate}
                onChange={(e) =>
                  setCustomStartDate(e.target.value)
                }
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:border-[#FE7410] transition-colors"
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <input
                type="date"
                value={customEndDate}
                onChange={(e) =>
                  setCustomEndDate(e.target.value)
                }
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:border-[#FE7410] transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => {
                  setTimeFilter("today");
                  setCustomStartDate("");
                  setCustomEndDate("");
                  setShowCustomDatePicker(false);
                }}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 bg-[#FE7410] text-white rounded-lg font-medium hover:bg-[#FF6B1A] transition-colors"
                onClick={() => setShowCustomDatePicker(false)}
              >
                Áp dụng
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Metrics - 4 Colorful Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card 1 - Orange - Doanh thu theo kỳ đã chọn */}
        <div className="bg-gradient-to-br from-[#FF8C42] to-[#FF6B1A] p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-md backdrop-blur-sm">
              {getTimeFilterLabel()}
            </span>
          </div>
          <div className="text-sm opacity-90 mb-1">
            {t("todayRevenue")}
          </div>
          <div className="text-3xl font-bold mb-1">
            {(totalRevenue / 1000000).toFixed(1)}M
          </div>
          <div className="text-xs opacity-75">
            {totalOrders} {t("orders")}
          </div>
        </div>

        {/* Card 2 - Blue - Tổng doanh thu tất cả thời gian */}
        <div className="bg-gradient-to-br from-[#4A90E2] to-[#357ABD] p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-md backdrop-blur-sm">
              {t("all")}
            </span>
          </div>
          <div className="text-sm opacity-90 mb-1">
            {t("totalRevenue")}
          </div>
          <div className="text-3xl font-bold mb-1">
            {(
              orders.reduce(
                (sum, order) => sum + Number(order.total || 0),
                0,
              ) / 1000000
            ).toFixed(1)}
            M
          </div>
          <div className="text-xs opacity-75">
            {orders.length} {t("orders")}
          </div>
        </div>

        {/* Card 3 - Purple */}
        <div className="bg-gradient-to-br from-[#9B59B6] to-[#8E44AD] p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Package className="w-6 h-6" />
            </div>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-md backdrop-blur-sm">
              {t("stock")}
            </span>
          </div>
          <div className="text-sm opacity-90 mb-1">
            {t("inventoryValue")}
          </div>
          <div className="text-3xl font-bold mb-1">
            {(inventoryValue / 1000000).toFixed(1)}M
          </div>
          <div className="text-xs opacity-75">
            {activeProducts.length}/{products.length}{" "}
            {t("products")}
          </div>
        </div>

        {/* Card 4 - Red */}
        <div className="bg-gradient-to-br from-[#E74C3C] to-[#C0392B] p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-md backdrop-blur-sm">
              {t("Warning")}
            </span>
          </div>
          <div className="text-sm opacity-90 mb-1">
            {t("lowStock")}
          </div>
          <div className="text-3xl font-bold mb-1">
            {lowStockProducts.length}
          </div>
          <div className="text-xs opacity-75">
            {t("products")}
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Trend Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {t("revenueTrends")}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t("chartByDateWithinTheReportingPeriod")}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-[#FE7410] hover:text-white transition-colors">
                1q
              </button>
              <button className="px-3 py-1 text-xs rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-[#FE7410] hover:text-white transition-colors">
                30d
              </button>
              <button className="px-3 py-1 text-xs rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-[#FE7410] hover:text-white transition-colors">
                6m
              </button>
              <button className="px-3 py-1 text-xs rounded-lg bg-[#FE7410] text-white">
                {t("year")}
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={revenueByPeriod}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                style={{ fontSize: "11px" }}
                tickLine={false}
              />
              <YAxis
                stroke="#9ca3af"
                style={{ fontSize: "11px" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [
                  `${value.toLocaleString("vi-VN")}đ`,
                  "Doanh thu",
                ]}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#FE7410"
                strokeWidth={3}
                dot={{ fill: "#FE7410", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Performance Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {t("category")}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t("inThe")} {t("last30Days")}
              </p>
            </div>
            <a
              href="#"
              className="text-sm text-[#FE7410] font-medium hover:underline"
            >
              {t("filtered")}
            </a>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={categoryChartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                stroke="#9ca3af"
                style={{ fontSize: "11px" }}
                tickLine={false}
              />
              <YAxis
                stroke="#9ca3af"
                style={{ fontSize: "11px" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [
                  `${value.toLocaleString("vi-VN")}đ`,
                  "Doanh thu",
                ]}
              />
              <Bar
                dataKey="revenue"
                fill="#FF8C42"
                radius={[8, 8, 0, 0]}
                maxBarSize={80}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {t("products")} {t("bestSelling")}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Top 4 {t("products")} {t("bestSelling")}
              </p>
            </div>
            <a
              href="#"
              className="text-sm text-[#FE7410] font-medium hover:underline"
            >
              {t("filtered")}
            </a>
          </div>
          <div className="p-6">
            {topProducts.length === 0 ? (
              <p className="text-gray-400 dark:text-gray-500 text-center py-8">
                {t("noData")}
              </p>
            ) : (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div
                    key={product.name}
                    className="flex items-center gap-4"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        index === 0
                          ? "bg-[#FFD700]"
                          : index === 1
                            ? "bg-[#C0C0C0]"
                            : index === 2
                              ? "bg-[#CD7F32]"
                              : "bg-gray-400"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {product.quantity} sản phẩm
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#FF8C42]">
                        {(product.revenue / 1000).toFixed(0)}K
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Customers Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {t("customer")} VIP
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Top 4 {t("mostLoyalCustomers")}
              </p>
            </div>
            <a
              href="#"
              className="text-sm text-[#FE7410] font-medium hover:underline"
            >
              {t("filtered")}
            </a>
          </div>
          <div className="p-6">
            {topCustomers.length === 0 ? (
              <p className="text-gray-400 dark:text-gray-500 text-center py-8">
                {t("noData")}
              </p>
            ) : (
              <div className="space-y-4">
                {topCustomers.map((customer, index) => (
                  <div
                    key={customer.name}
                    className="flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {customer.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {customer.orders} đơn hàng
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#4A90E2]">
                        {(customer.revenue / 1000000).toFixed(
                          1,
                        )}
                        M
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;