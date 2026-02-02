import { useState } from "react";
import { useTranslation } from "../../../../lib/convenience-store-lib/useTranslation";
import {
  DollarSign,
  Clock,
  History,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Home,
} from "lucide-react";
import { CashierOrderHistory } from "./CashierOrderHistory";
import { CashierShift } from "./CashierShift";

type CashierScreen = "orders" | "shift";

export function CashierView() {
  const { t, language, setLanguage } = useTranslation();
  const [currentScreen, setCurrentScreen] =
    useState<CashierScreen>("orders");
  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const menuItems = [
    {
      id: "orders" as CashierScreen,
      icon: Receipt,
      label: t("ordersAndPayment") || t("orders"),
      color: "blue",
    },
    {
      id: "shift" as CashierScreen,
      icon: Clock,
      label: t("myShift"),
      color: "green",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${sidebarCollapsed ? "w-20" : "w-64"} bg-gradient-to-b from-green-600 to-green-800 text-white flex flex-col transition-all duration-300`}
      >
        {/* Header */}
        <div className="p-4 border-b border-green-700">
          {!sidebarCollapsed ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-xl font-bold">
                  {t("cashier")}
                </h1>
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="p-1 hover:bg-green-700 rounded transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-2 bg-green-700 rounded-lg px-3 py-2">
                <User className="w-5 h-5" />
                <div>
                  <p className="text-sm font-semibold">
                    {t("cashier")}
                  </p>
                  <p className="text-xs text-green-200">
                    {t("staff")}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="w-full flex justify-center p-2 hover:bg-green-700 rounded transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-3 space-y-2">
          {/* Home Button */}
          <a
            href="/"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-green-100 hover:bg-green-700 hover:text-white border-2 border-green-700 hover:border-white"
          >
            <Home
              className={`w-6 h-6 ${sidebarCollapsed ? "mx-auto" : ""}`}
            />
            {!sidebarCollapsed && (
              <span className="font-semibold text-sm">
                {t("backToHome") || t("home")}
              </span>
            )}
          </a>

          {/* Divider */}
          <div className="border-t border-green-700 my-2"></div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentScreen(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-white text-green-600 shadow-lg transform scale-105"
                    : "text-green-100 hover:bg-green-700 hover:text-white"
                }`}
              >
                <Icon
                  className={`w-6 h-6 ${sidebarCollapsed ? "mx-auto" : ""}`}
                />
                {!sidebarCollapsed && (
                  <span className="font-semibold text-sm">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Language Toggle */}
        <div className="p-3 border-t border-green-700">
          {!sidebarCollapsed ? (
            <button
              onClick={() =>
                setLanguage(language === "vi" ? "en" : "vi")
              }
              className="w-full bg-green-700 hover:bg-green-600 rounded-lg px-4 py-3 transition-colors flex items-center justify-center gap-2"
            >
              <span className="text-2xl">
                {language === "vi" ? "🇻🇳" : "🇺🇸"}
              </span>
              <span className="font-semibold">
                {language === "vi" ? "Tiếng Việt" : "English"}
              </span>
            </button>
          ) : (
            <button
              onClick={() =>
                setLanguage(language === "vi" ? "en" : "vi")
              }
              className="w-full bg-green-700 hover:bg-green-600 rounded-lg p-3 transition-colors"
            >
              <span className="text-2xl">
                {language === "vi" ? "🇻🇳" : "🇺🇸"}
              </span>
            </button>
          )}
        </div>

        {/* Footer */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-green-700 bg-green-900">
            <p className="text-xs text-green-200 text-center">
              {t("cashierMode") || "Cashier Mode"}
            </p>
            <p className="text-xs text-green-300 text-center mt-1">
              v1.0 - {t("simpleEasy") || "Simple & Easy"}
            </p>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b-2 border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {currentScreen === "orders" &&
                  (t("ordersAndPayment") || t("orders"))}
                {currentScreen === "shift" && t("myShift")}
              </h2>
              <p className="text-sm text-gray-500">
                {currentScreen === "orders" &&
                  (t("viewOrdersAndCollectPayment") ||
                    "View orders and collect payment")}
                {currentScreen === "shift" &&
                  (t("manageYourShift") ||
                    "Manage your work shift")}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-4">
              <div className="bg-green-50 border-2 border-green-200 rounded-xl px-4 py-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-green-600 font-medium">
                      {t("todayRevenue")}
                    </p>
                    <p className="text-lg font-bold text-green-700">
                      {(
                        JSON.parse(
                          localStorage.getItem("pos-orders") ||
                            "[]",
                        ) as any[]
                      )
                        .filter(
                          (o) =>
                            new Date(
                              o.timestamp,
                            ).toDateString() ===
                            new Date().toDateString(),
                        )
                        .reduce((sum, o) => sum + o.total, 0)
                        .toLocaleString()}
                      đ
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Screen Content */}
        <div className="flex-1 overflow-hidden">
          {currentScreen === "orders" && (
            <CashierOrderHistory />
          )}
          {currentScreen === "shift" && <CashierShift />}
        </div>
      </div>
    </div>
  );
}

export default CashierView;