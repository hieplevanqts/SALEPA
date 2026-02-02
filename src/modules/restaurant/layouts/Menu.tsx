// components/Menu.tsx
import { Link } from 'react-router-dom';
import { useState, useEffect } from "react";
import { useStore } from "../../../lib/restaurant-lib/store";
import { translations } from "../../../lib/restaurant-lib/i18n";
import { useTranslation } from '../../../lib/restaurant-lib/useTranslation';
import { loadDemoTreatmentPackages } from '../../../lib/restaurant-lib/demoData';
import type { IndustryType } from "../../../lib/restaurant-lib/store";
import logoFull from "../../../assets/da526f2429ac0b8456776974a6480c4f4260145c.png";
import logoIcon from "../../../assets/f71a990f243f87339543c6b7dbfdaca1ddb212f4.png";
import "../../../lib/restaurant-lib/demoPackagesV2";
import { useNavigate, useLocation } from "react-router-dom";
import type { Tab } from "../components/navigation/tabs";
import { TAB_ROUTE_MAP } from "../components/navigation/tabRouteMap";
import { Toaster } from 'sonner';

import ProfileMenu from '../components/common/ProfileMenu';
// Import all required components and icons
import {
  LayoutGrid,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Settings as SettingsIcon,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Languages,
  User,
  FolderOpen,
  ClipboardList,
  Calendar,
  UtensilsCrossed,
  ChefHat,
  Warehouse
} from 'lucide-react';

type Tab = 'dashboard' | 'sales' | 'products' | 'stock-in' | 'stock-out' | 'orders' | 'order-management' | 'revenue-overview' | 'revenue-staff' | 'revenue-service' | 'revenue-package' | 'revenue-product' | 'customer-report' | 'appointment-report' | 'inventory-report' | 'settings' | 'self-service' | 'customer-view' | 'cashier' | 'customers' | 'product-categories' | 'table-areas' | 'suppliers' | 'users' | 'role-groups' | 'appointments' | 'tables' | 'kitchen';
type IndustryType = 'spa-service' | 'food-beverage' | 'gym-fitness' | 'clinic' | 'retail' | 'other';
type UserRole = 'admin' | 'cashier' | 'technician';

export default function Menu() {
  /** ✅ BẮT BUỘC cho App Router */
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname;
  const [accountMenuExpanded, setAccountMenuExpanded] = useState(false);
  const [reportMenuExpanded, setReportMenuExpanded] = useState(false);
  const [categoryMenuExpanded, setCategoryMenuExpanded] = useState(false);
  const [stockMenuExpanded, setStockMenuExpanded] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const authRaw = localStorage.getItem("auth");
  const userRole = JSON.parse(authRaw);
  const [showOnboardingScreen, setShowOnboardingScreen] = useState(() => {
    // Check if user has seen onboarding before
    return !localStorage.getItem('salepa_onboarding_completed');
  });
  const [showIndustrySelection, setShowIndustrySelection] = useState(() => {
    // Show industry selection if onboarding completed but no industry selected
    return localStorage.getItem('salepa_onboarding_completed') === 'true' && !localStorage.getItem('salepa_industry_selected');
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Check localStorage for login state
    const savedLoginState = localStorage.getItem('salepa_isLoggedIn');
    const rememberMe = localStorage.getItem('salepa_rememberMe');
    return savedLoginState === 'true' && rememberMe === 'true';
  });
  const [currentUser, setCurrentUser] = useState(() => {
    return localStorage.getItem('salepa_username') || '';
  });
  const {
    language,
    setLanguage,
    sidebarCollapsed,
    toggleSidebar,
    setSidebarCollapsed,
    users,

  } = useStore();

  const t = translations[language];
  const [showHelp, setShowHelp] = useState(false);

  // Get current user's full user object
  const currentUserObject = users.find(u => u.username === currentUser);

  // Check if first time user
  useEffect(() => {
    console.log('App useEffect running...');
    console.log('showOnboardingScreen:', showOnboardingScreen);

    if (showOnboardingScreen) {
      setShowOnboardingScreen(true);
    }

    // Load industry data if already selected


    // Keyboard shortcut for help
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setShowHelp(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    // Expose demo data loader to window for easy testing
    (window as any).loadDemoPackages = () => {
      loadDemoTreatmentPackages();
      window.location.reload();
    };

    // Log instructions for testing treatment packages
    console.log('%c💡 Hướng dẫn test tính năng liệu trình:', 'color: #FE7410; font-weight: bold; font-size: 14px;');
    console.log('%c1. Gọi loadDemoPackages() để load dữ liệu demo', 'color: #666; font-size: 12px;');
    console.log('%c2. Vào màn Lịch hẹn > Tạo lịch mới', 'color: #666; font-size: 12px;');
    console.log('%c3. Chọn khách hàng "Trần Minh Anh" hoặc "Nguyễn Thu Hà"', 'color: #666; font-size: 12px;');
    console.log('%c4. Chọn dịch vụ "Facial trị mụn" hoặc "Facial dưỡng ẩm"', 'color: #666; font-size: 12px;');
    console.log('%c5. Sẽ thấy dropdown "Hình thức thanh toán" với gợi ý sử dụng gói liệu trình!', 'color: #10B981; font-weight: bold; font-size: 12px;');

    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showOnboardingScreen, showIndustrySelection]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('salepa_onboarding_completed', 'true');
    setShowOnboardingScreen(false);
    setShowIndustrySelection(true); // Show industry selection after onboarding
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem('salepa_onboarding_completed', 'true');
    setShowOnboardingScreen(false);
    setShowIndustrySelection(true); // Show industry selection after skipping
  };

  const handleIndustrySelect = (industry: IndustryType) => {
    console.log('Selected industry:', industry);
    localStorage.setItem('salepa_industry_selected', industry);

    // Load industry-specific demo data
    const { loadIndustryData } = useStore.getState();


    setShowIndustrySelection(false);
    // After industry selection, user will see login screen
  };

  const handleIndustrySkip = () => {
    // Set default industry as Spa
    const defaultIndustry = 'spa-service';
    localStorage.setItem('salepa_industry_selected', defaultIndustry);

    // Load industry data
    const { loadIndustryData } = useStore.getState();
    loadIndustryData(defaultIndustry);

    setShowIndustrySelection(false);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'new-sale':
        navigate(`/${TAB_ROUTE_MAP["sales"]}`);
        break;
      case 'add-product':
        navigate(`/${TAB_ROUTE_MAP["products"]}`);
        break;
      case 'view-reports':
        navigate(`/${TAB_ROUTE_MAP["reports"]}`);
        break;
    }
  };

  const handleTabChange = (tab: Tab) => {
    const path = TAB_ROUTE_MAP[tab];

    if (path !== undefined) {
      navigate(`/restaurant/${path}`);
    }
  };

  const handleLogout = () => {
    // Clear ONLY login data, keep onboarding and industry selection
    localStorage.removeItem('salepa_isLoggedIn');
    localStorage.removeItem('salepa_username');
    localStorage.removeItem('salepa_rememberMe');
    localStorage.removeItem('salepa_userRole');

    // Reset login state
    setIsLoggedIn(false);
    setCurrentUser('');
    // setUserRole('admin');

    // Don't reload - just show login screen
    // window.location.reload(); // ← REMOVED
    navigate("/restaurant/login");
  };

  // const handleLogin = (username: string, rememberMe: boolean, role: UserRole) => {
  //   // Save login state
  //   localStorage.setItem('salepa_isLoggedIn', 'true');
  //   localStorage.setItem('salepa_username', username);
  //   localStorage.setItem('salepa_rememberMe', rememberMe.toString());
  //   localStorage.setItem('salepa_userRole', role);

  //   setIsLoggedIn(true);
  //   setCurrentUser(username);
  //   // setUserRole(role);

  //   // Redirect based on role to their first accessible page
  //   if (role === 'admin') {
  //     // Admin - go to Dashboard
  //     setActiveTab('dashboard');
  //   } else if (role === 'cashier') {
  //     // Cashier - go to Sales (has sales permission)
  //     setActiveTab('sales');
  //   } else if (role === 'technician') {
  //     // Technician - go to Kitchen (F&B) or Appointments (Spa)

  //     setActiveTab('kitchen'); // ✅ Màn hình mặc định: Đơn bếp
  //     setSidebarCollapsed(true); // ✅ Auto collapse sidebar cho role Bếp

  //   }
  // };

  // Permission check helper based on role groups
  const hasPermission = (permissionId: string): boolean => {
    // Admin has all permissions
    if (userRole.role === 'admin') return true;

    // Cashier permissions: sales, products_view, orders, customers, appointments (NO reports)
    if (userRole.role === 'cashier') {
      return ['sales', 'products_view', 'orders', 'customers', 'appointments'].includes(permissionId);
    }

    // Technician permissions differ by industry
    if (userRole.role === 'technician') {
      // F&B technician (kitchen staff): ONLY orders permission

      // Spa technician: sales, products_view, appointments
      return ['Kitchen'].includes(permissionId);
    }

    return false;
  };

  return (
    <>
      <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'
        }`}>
        <div className={`border-b border-gray-200 ${sidebarCollapsed ? 'p-3' : 'p-6'}`}>
          {sidebarCollapsed ? (
            /* Collapsed: Icon Logo Only + Toggle */
            <div className="flex flex-col items-center gap-3">
              <img
                src={logoIcon}
                alt="Salepa"
                className="w-10 h-10"
              />
              <button
                onClick={toggleSidebar}
                className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all group"
                title={t.expand}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Expanded: Full Logo with Text + Toggle */
            <div className="flex items-center justify-between">
              <img
                src={logoFull}
                alt="Salepa"
                className="h-10"
              />
              <button
                onClick={toggleSidebar}
                className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all group"
                title={t.collapse}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <nav className={`flex-1 ${sidebarCollapsed ? 'p-2' : 'p-4'}`}>
          {/* 1. Dashboard - Admin only */}
          {hasPermission('dashboard') && (
            <button
              onClick={() => handleTabChange('dashboard')}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg mb-2 transition-colors 
              ${activeTab === '/restaurant/' || activeTab === '/restaurant/dashboard'
                ? 'bg-[#FE7410]/10 text-[#FE7410]'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
              title={sidebarCollapsed ? t.dashboard : undefined}
            >
              <LayoutGrid className="w-5 h-5" />
              {!sidebarCollapsed && <span>{t.dashboard}</span>}
            </button>
          )}

          {/* 2. Sales - Cashier, Admin */}
          {hasPermission('sales') && (
            <button
              onClick={() => handleTabChange('sales')}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg mb-2 transition-colors 
              ${activeTab === '/restaurant/sales'
                ? 'bg-[#FE7410]/10 text-[#FE7410]'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
              title={sidebarCollapsed ? t.sales : undefined}
            >
              <ShoppingCart className="w-5 h-5" />
              {!sidebarCollapsed && <span>{t.sales}</span>}
            </button>
          )}

          {/* 3. Orders - Cashier, Admin */}
          {hasPermission('orders') && (
            <button
              onClick={() => handleTabChange('orders')}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg mb-2 transition-colors 
              ${activeTab === '/restaurant/orders'
                ? 'bg-[#FE7410]/10 text-[#FE7410]'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
              title={sidebarCollapsed ? (userRole === 'technician' ? 'Đơn bếp' : t.orderManagement) : undefined}
            >
              <ClipboardList className="w-5 h-5" />
              {!sidebarCollapsed && <span>{userRole === 'technician' ? 'Đơn bếp' : t.orderManagement}</span>}
            </button>
          )}

          {/* 3b. Kitchen Orders - Admin & Cashier only (F&B only) */}
          {hasPermission('Kitchen') && (
            <button
              onClick={() => handleTabChange('kitchen-orders')}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg mb-2 transition-colors 
              ${activeTab === '/restaurant/kitchen/orders'
                ? 'bg-[#FE7410]/10 text-[#FE7410]'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
              title={sidebarCollapsed ? t.kitchenOrders : undefined}
            >
              <ChefHat className="w-5 h-5" />
              {!sidebarCollapsed && <span>{t.kitchenOrders}</span>}
            </button>
          )}


          {/* 4b. Table Management - F&B only */}
          {/* ❌ REMOVED: Quản lý bàn - Bỏ menu này khỏi tất cả role */}

          {/* 5. Customers - Cashier, Admin */}
          {hasPermission('customers') && (
            <button
              onClick={() => handleTabChange('customers')}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg mb-2 transition-colors 
              ${activeTab === '/restaurant/customers'
                ? 'bg-[#FE7410]/10 text-[#FE7410]'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
              title={sidebarCollapsed ? t.customer?.title || 'Khách hàng' : undefined}
            >
              <Users className="w-5 h-5" />
              {!sidebarCollapsed && <span>{t.customer?.title || 'Khách hàng'}</span>}
            </button>
          )}

          {/* 6. Products - All roles (view only for Technician) */}
          {hasPermission('products_view') && (
            <button
              onClick={() => handleTabChange('products')}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg mb-2 transition-colors 
              ${activeTab === '/restaurant/products'
                ? 'bg-[#FE7410]/10 text-[#FE7410]'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
              title={sidebarCollapsed ? t.products : undefined}
            >
              <Package className="w-5 h-5" />
              {!sidebarCollapsed && <span>{t.products}</span>}
            </button>
          )}

          {/* 6.5. Stock Management with Submenu - Admin & Cashier (All industries) */}
          {(userRole.role === 'admin' || userRole.role === 'cashier') && (
            <div className="mb-2">
              <button
                onClick={() => {
                  if (sidebarCollapsed) {
                    handleTabChange('stock-in');
                  } else {
                    setStockMenuExpanded(!stockMenuExpanded);
                  }
                }}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3 rounded-lg transition-colors 
                ${activeTab === '/restaurant/inventory/stock-in' || activeTab === '/restaurant/inventory/stock-out'
                  ? 'bg-[#FE7410]/10 text-[#FE7410]'
                  : 'text-gray-600 hover:bg-gray-50'
                  }`}
                title={sidebarCollapsed ? 'Quản lý kho' : undefined}
              >
                <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                  <Warehouse className="w-5 h-5" />
                  {!sidebarCollapsed && <span>Quản lý kho</span>}
                </div>
                {!sidebarCollapsed && (
                  stockMenuExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {/* Submenu */}
              {!sidebarCollapsed && stockMenuExpanded && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-4">
                  <button
                    onClick={() => handleTabChange('stock-in')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm 
                      ${activeTab === '/restaurant/inventory/stock-in'
                      ? 'bg-[#FE7410]/10 text-[#FE7410]'
                      : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >

                    <span className="text-[16px]">Nhập kho</span>
                  </button>
                  <button
                    onClick={() => handleTabChange('stock-out')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm 
                      ${activeTab === '/restaurant/inventory/stock-out'
                      ? 'bg-[#FE7410]/10 text-[#FE7410]'
                      : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <span className="text-[16px]">Xuất kho</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 7. Account Management with Submenu - Admin only */}
          {hasPermission('users') && (
            <div className="mb-2">
              <button
                onClick={() => {
                  if (sidebarCollapsed) {
                    handleTabChange('users');
                  } else {
                    setAccountMenuExpanded(!accountMenuExpanded);
                  }
                }}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3 rounded-lg transition-colors 
                ${activeTab === '/restaurant/users' || activeTab === '/restaurant/roles'
                  ? 'bg-[#FE7410]/10 text-[#FE7410]'
                  : 'text-gray-600 hover:bg-gray-50'
                  }`}
                title={sidebarCollapsed ? (language === 'vi' ? 'Quản lý tài khoản' : 'Account Management') : undefined}
              >
                <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                  <User className="w-5 h-5" />
                  {!sidebarCollapsed && <span>{language === 'vi' ? 'Quản lý tài khoản' : 'Account Management'}</span>}
                </div>
                {!sidebarCollapsed && (
                  accountMenuExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {/* Submenu */}
              {!sidebarCollapsed && accountMenuExpanded && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-4">
                  <button
                    onClick={() => handleTabChange('users')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm 
                      ${activeTab === '/restaurant/users'
                      ? 'bg-[#FE7410]/10 text-[#FE7410]'
                      : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <span className="text-[16px]">{language === 'vi' ? 'Người dùng' : 'Users'}</span>
                  </button>

                  <button
                    onClick={() => handleTabChange('role-groups')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm 
                      ${activeTab === '/restaurant/roles'
                      ? 'bg-[#FE7410]/10 text-[#FE7410]'
                      : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <span className="text-[16px]">{language === 'vi' ? 'Nhóm quyền' : 'Role Groups'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 8. Reports with Submenu - Cashier, Admin */}
          {hasPermission("reports") && (
            <div className="mb-2">
              <button
                onClick={() => {
                  if (sidebarCollapsed) {
                    handleTabChange("revenue-overview");
                  } else {
                    setReportMenuExpanded(
                      !reportMenuExpanded,
                    );
                  }
                }}
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center" : "justify-between"} px-4 py-3 rounded-lg transition-colors 
                    ${activeTab === "/restaurant/reports/revenue-overview" ||
                    activeTab === "/restaurant/reports/revenue-staff" ||
                    activeTab === "/restaurant/reports/revenue-product" ||
                    activeTab === "/restaurant/reports/customer-report" ||
                    activeTab === "/restaurant/reports/inventory-report"
                    ? "bg-[#FE7410]/10 text-[#FE7410]"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                title={
                  sidebarCollapsed ? t.reports : undefined
                }
              >
                <div
                  className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"}`}
                >
                  <BarChart3 className="w-5 h-5" />
                  {!sidebarCollapsed && (
                    <span>DT Tổng hợp</span>
                  )}
                </div>
                {!sidebarCollapsed &&
                  (reportMenuExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  ))}
              </button>

              {/* Submenu */}
              {!sidebarCollapsed && reportMenuExpanded && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-4">
                  <button
                    onClick={() =>
                      handleTabChange("revenue-overview")
                    }
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm 
                      ${activeTab === "/restaurant/reports/revenue-overview"
                      ? "bg-[#FE7410]/10 text-[#FE7410]"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                  >
                    <span className="text-[16px]">
                      DT Tổng hợp
                    </span>
                  </button>

                  <button
                    onClick={() =>
                      handleTabChange("revenue-staff")
                    }
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-colors text-sm 
                      ${activeTab === "/restaurant/reports/revenue-staff"
                      ? "bg-[#FE7410]/10 text-[#FE7410]"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                  >
                    <span className="text-[16px]">
                      DT Nhân viên
                    </span>
                  </button>
                  
                  <button
                    onClick={() =>
                      handleTabChange("revenue-product")
                    }
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm 
                      ${activeTab === "/restaurant/reports/revenue-product"
                      ? "bg-[#FE7410]/10 text-[#FE7410]"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                  >
                    <span className="text-[16px]">
                      DT Sản phẩm
                    </span>
                  </button>

                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    onClick={() =>
                      handleTabChange("customer-report")
                    }
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm 
                      ${activeTab === "/restaurant/reports/customer-report"
                      ? "bg-[#FE7410]/10 text-[#FE7410]"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                  >
                    <span className="text-[16px]">
                      Báo cáo khách hàng
                    </span>
                  </button>

                  <div className="border-t border-gray-200 my-1"></div>
   
                </div>
              )}
            </div>
          )}

          {/* 9. Category Management with Submenu - Admin only */}
          {hasPermission('product_categories') && (
            <div className="mb-2">
              <button
                onClick={() => {
                  if (sidebarCollapsed) {
                    handleTabChange('product-categories');
                  } else {
                    setCategoryMenuExpanded(!categoryMenuExpanded);
                  }
                }}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3 rounded-lg transition-colors 
                ${(activeTab === '/restaurant/product-categories' || activeTab === '/restaurant/table-areas' || activeTab === '/restaurant/suppliers')
                  ? 'bg-[#FE7410]/10 text-[#FE7410]'
                  : 'text-gray-600 hover:bg-gray-50'
                  }`}
                title={sidebarCollapsed ? (language === 'vi' ? 'Danh mục chung' : 'Categories') : undefined}
              >
                <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                  <FolderOpen className="w-5 h-5" />
                  {!sidebarCollapsed && <span>{language === 'vi' ? 'Danh mục chung' : 'Categories'}</span>}
                </div>
                {!sidebarCollapsed && (
                  categoryMenuExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {/* Submenu */}
              {!sidebarCollapsed && categoryMenuExpanded && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-4">
                  <button
                    onClick={() => handleTabChange('product-categories')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm 
                      ${activeTab === '/restaurant/product-categories'
                      ? 'bg-[#FE7410]/10 text-[#FE7410]'
                      : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <span className="text-[16px]">{language === 'vi' ? 'Danh mục sản phẩm' : 'Product Categories'}</span>
                  </button>

                  <button
                    onClick={() => handleTabChange('table-areas')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm 
                      ${activeTab === '/restaurant/table-areas'
                      ? 'bg-[#FE7410]/10 text-[#FE7410]'
                      : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <span className="text-[16px]">{language === 'vi' ? 'Quản lý phòng/bàn' : 'Room/Table Management'}</span>
                  </button>
                  <button
                    onClick={() => handleTabChange('suppliers')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm 
                      ${activeTab === '/restaurant/suppliers'
                      ? 'bg-[#FE7410]/10 text-[#FE7410]'
                      : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <span className="text-[16px]">{language === 'vi' ? 'Nhà cung cấp' : 'Suppliers'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Divider */}
          {!sidebarCollapsed && <div className="border-t border-gray-200 my-2"></div>}

          {/* 10. Settings - Admin only */}
          {hasPermission('settings') && (
            <button
              onClick={() => handleTabChange('settings')}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg mb-2 transition-colors 
              ${activeTab === '/restaurant/settings'
                ? 'bg-[#FE7410]/10 text-[#FE7410]'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
              title={sidebarCollapsed ? t.settings : undefined}
            >
              <SettingsIcon className="w-5 h-5" />
              {!sidebarCollapsed && <span>{t.settings}</span>}
            </button>
          )}
        </nav>

        <div className={`border-t border-gray-200 space-y-3 ${sidebarCollapsed ? 'p-2' : 'p-4'}`}>
          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors border border-gray-200`}
            title={sidebarCollapsed ? (language === 'vi' ? 'Tiếng Việt' : 'English') : undefined}
          >
            <Languages className="w-5 h-5" />
            {!sidebarCollapsed && <span>{language === 'vi' ? '🇻🇳 Tiếng Việt' : '🇬🇧 English'}</span>}
          </button>

          {!sidebarCollapsed && (
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 w-full hover:bg-gray-50 rounded-lg p-2 transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-[#FE7410] to-[#FF8C3A] rounded-full flex items-center justify-center text-white font-bold">
                 {userRole.role === 'admin' && (language === 'vi' ? 'A' : 'A')}
                                    {userRole.role === 'cashier' && (language === 'vi' ? 'C' : 'C')}
                                    {userRole.role === 'technician' && (language === 'vi' ? 'T' : 'T')}
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-gray-900">
                   {userRole.role === 'admin' && (language === 'vi' ? 'Quản trị viên' : 'Administrator')}
                                    {userRole.role === 'cashier' && (language === 'vi' ? 'Thu ngân' : 'Cashier')}
                                    {userRole.role === 'technician' && (language === 'vi' ? 'Kỹ thuật viên' : 'Technician')}
                </div>
                <div className="text-xs text-gray-500">
 {userRole.role === 'admin' && (language === 'vi' ? 'Quản trị viên' : 'Administrator')}
                                    {userRole.role === 'cashier' && (language === 'vi' ? 'Thu ngân' : 'Cashier')}
                                    {userRole.role === 'technician' && (language === 'vi' ? 'Kỹ thuật viên' : 'Technician')}
                </div>
              </div>
            </button>
          )}
        </div>
      </div>

      {showProfileMenu && (
        <ProfileMenu
          onClose={() => setShowProfileMenu(false)}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}
