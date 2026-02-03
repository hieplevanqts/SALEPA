// components/Menu.tsx
import { useState, useEffect } from "react";
import { useStore } from "../../../lib/convenience-store-lib/store";
import { translations } from "../../../lib/convenience-store-lib/i18n";
import type { IndustryType } from "../../../modules/convenience-store/pages/system/IndustrySelection";
import { loadDemoTreatmentPackages } from "../../../lib/convenience-store-lib/demoData";
import logoFull from "../../../assets/da526f2429ac0b8456776974a6480c4f4260145c.png";
import logoIcon from "../../../assets/f71a990f243f87339543c6b7dbfdaca1ddb212f4.png";
import "../../../lib/convenience-store-lib/demoPackagesV2";
import { useNavigate, useLocation } from "react-router-dom";
import type { Tab } from "../components/navigation/tabs";
import { TAB_ROUTE_MAP } from "../components/navigation/tabRouteMap";

import { ProfileMenu } from '../components/layout/ProfileMenu';
import {
    LayoutGrid,
    ShoppingCart,
    Package,
    Settings as SettingsIcon,
    BarChart3,
    Languages,
    ClipboardList,
    Users,
    User,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    FolderOpen,
    Warehouse,
} from "lucide-react";

export default function Menu() {
    /** ✅ BẮT BUỘC cho App Router */
    const navigate = useNavigate();
    const location = useLocation();
    const authRaw = localStorage.getItem("auth");
    const userRole = authRaw ? JSON.parse(authRaw) : null;
    const activeTab = location.pathname;

    // const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [accountMenuExpanded, setAccountMenuExpanded] = useState(false);
    const [reportMenuExpanded, setReportMenuExpanded] = useState(false);
    const [categoryMenuExpanded, setCategoryMenuExpanded] = useState(false);
    const [stockMenuExpanded, setStockMenuExpanded] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showOnboardingScreen, setShowOnboardingScreen] = useState(() => {
        // Check if user has seen onboarding before
        return !localStorage.getItem('salepa_onboarding_completed');
    });
    const [showIndustrySelection] = useState(() => {
        // Show industry selection if onboarding completed but no industry selected
        return localStorage.getItem('salepa_onboarding_completed') === 'true' && !localStorage.getItem('salepa_industry_selected');
    });
    const {
        language,
        setLanguage,
        sidebarCollapsed,
        toggleSidebar,
    } = useStore();
    const t = translations[language];

    // Check if first time user
    useEffect(() => {
        console.log('App useEffect running...');
        console.log('showOnboardingScreen:', showOnboardingScreen);

        if (showOnboardingScreen) {
            setShowOnboardingScreen(true);
        }

        // Load industry data if already selected
        const savedIndustry = localStorage.getItem('salepa_industry_selected') as IndustryType | null;
        if (savedIndustry && !showOnboardingScreen && !showIndustrySelection) {
            console.log('Loading saved industry data:', savedIndustry);
            const { loadIndustryData } = useStore.getState();
            loadIndustryData(savedIndustry);
        }

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

    }, [showOnboardingScreen, showIndustrySelection]);

    const handleTabChange = (tab: Tab) => {
        const path = TAB_ROUTE_MAP[tab];

        if (path !== undefined) {
            navigate(`/fashion/shop/${path}`);
        }
    };

    const handleLogout = () => {
        // Clear ONLY login data, keep onboarding and industry selection
        localStorage.removeItem('salepa_isLoggedIn');
        localStorage.removeItem('salepa_username');
        localStorage.removeItem('salepa_rememberMe');
        localStorage.removeItem('salepa_userRole');
        // setUserRole('admin');
        navigate('/fashion/shop/login');

        // Don't reload - just show login screen
        // window.location.reload(); // ← REMOVED
    };


    // Permission check helper based on role groups
    const hasPermission = (permissionId: string): boolean => {
        // Admin has all permissions
        if (userRole?.role === 'admin') return true;

        // Cashier permissions: sales, products_view, orders, customers, appointments (NO reports)
        if (userRole?.role === 'cashier') {
            return ['sales', 'products_view', 'orders', 'customers', 'appointments'].includes(permissionId);
        }

        // Technician permissions: sales, products_view, appointments
        if (userRole?.role === 'technician') {
            return ['sales', 'products_view', 'appointments'].includes(permissionId);
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
                            ${activeTab === '/fashion/shop/dashboard' || activeTab === '/fashion/shop/'
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
                            ${activeTab === '/fashion/shop/sales'
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
                            ${activeTab === '/fashion/shop/orders'
                                    ? 'bg-[#FE7410]/10 text-[#FE7410]'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            title={sidebarCollapsed ? t.orderManagement : undefined}
                        >
                            <ClipboardList className="w-5 h-5" />
                            {!sidebarCollapsed && <span>{t.orderManagement}</span>}
                        </button>
                    )}

                    {/* 5. Customers - Cashier, Admin */}
                    {hasPermission('customers') && (
                        <button
                            onClick={() => handleTabChange('customers')}
                            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg mb-2 transition-colors 
                            ${activeTab === '/fashion/shop/customers'
                                    ? 'bg-[#FE7410]/10 text-[#FE7410]'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            title={sidebarCollapsed ? t.customer || 'Khách hàng' : undefined}
                        >
                            <Users className="w-5 h-5" />
                            {!sidebarCollapsed && <span>{t.customer || 'Khách hàng'}</span>}
                        </button>
                    )}

                    {/* 6. Products - All roles (view only for Technician) */}
                    {hasPermission('products_view') && (
                        <button
                            onClick={() => handleTabChange('products')}
                            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg mb-2 transition-colors 
                            ${activeTab === '/fashion/shop/products'
                                    ? 'bg-[#FE7410]/10 text-[#FE7410]'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            title={sidebarCollapsed ? t.products : undefined}
                        >
                            <Package className="w-5 h-5" />
                            {!sidebarCollapsed && <span>{t.products}</span>}
                        </button>
                    )}

                    {/* 6.5. Stock Management with Submenu - Admin & Cashier */}
                    {(userRole?.role === 'admin' || userRole?.role === 'cashier') && (
                        <div className="mb-2">
                            <button
                                onClick={() => {
                                    if (sidebarCollapsed) {
                                        handleTabChange('inventory');
                                    } else {
                                        setStockMenuExpanded(!stockMenuExpanded);
                                    }
                                }}
                                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3 rounded-lg transition-colors 
                                ${activeTab === '/fashion/shop/inventory/stock-in' || activeTab === '/fashion/shop/inventory/stock-out' || activeTab === '/fashion/shop/inventory' || activeTab === '/fashion/shop/inventory/history'
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
                                        onClick={() => handleTabChange('inventory')}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm 
                                            ${activeTab === '/fashion/shop/inventory'
                                                ? 'bg-[#FE7410]/10 text-[#FE7410]'
                                                : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="text-[16px]">Tồn kho</span>
                                    </button>
                                    <button
                                        onClick={() => handleTabChange('stock-in')}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm 
                                            ${activeTab === '/fashion/shop/inventory/stock-in'
                                                ? 'bg-[#FE7410]/10 text-[#FE7410]'
                                                : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="text-[16px]">Nhập kho</span>
                                    </button>
                                    <button
                                        onClick={() => handleTabChange('stock-out')}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm 
                                            ${activeTab === '/fashion/shop/inventory/stock-out'
                                                ? 'bg-[#FE7410]/10 text-[#FE7410]'
                                                : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="text-[16px]">Xuất kho</span>
                                    </button>
                                    <button
                                        onClick={() => handleTabChange('inventory-history')}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm 
                                            ${activeTab === '/fashion/shop/inventory/history'
                                                ? 'bg-[#FE7410]/10 text-[#FE7410]'
                                                : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="text-[16px]">Lịch sử biến động</span>
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
                                ${(activeTab === '/fashion/shop/users' || activeTab === '/fashion/shop/roles')
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
                                            ${activeTab === '/fashion/shop/users'
                                                ? 'bg-[#FE7410]/10 text-[#FE7410]'
                                                : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="text-[16px]">{language === 'vi' ? 'Người dùng' : 'Users'}</span>
                                    </button>

                                    <button
                                        onClick={() => handleTabChange('role-groups')}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm 
                                            ${activeTab === '/fashion/shop/roles'
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
                    {hasPermission('reports') && (
                        <div className="mb-2">
                            <button
                                onClick={() => {
                                    if (sidebarCollapsed) {
                                        handleTabChange('revenue-overview');
                                    } else {
                                        setReportMenuExpanded(!reportMenuExpanded);
                                    }
                                }}
                                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3 rounded-lg transition-colors 
                                ${(activeTab === '/fashion/shop/reports/revenue-overview' || activeTab === '/fashion/shop/reports/revenue-staff'
                                     || activeTab === '/fashion/shop/reports/revenue-product' || activeTab === '/fashion/shop/reports/customer-report')
                                        ? 'bg-[#FE7410]/10 text-[#FE7410]'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                title={sidebarCollapsed ? t.reports : undefined}
                            >
                                <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                                    <BarChart3 className="w-5 h-5" />
                                    {!sidebarCollapsed && <span>{t.reports}</span>}
                                </div>
                                {!sidebarCollapsed && (
                                    reportMenuExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                                )}
                            </button>

                            {/* Submenu */}
                            {!sidebarCollapsed && reportMenuExpanded && (
                                <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-4">
                                    <button
                                        onClick={() => handleTabChange('revenue-overview')}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm 
                                            ${activeTab === '/fashion/shop/reports/revenue-overview'
                                                ? 'bg-[#FE7410]/10 text-[#FE7410]'
                                                : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="text-[16px]">DT Tổng hợp</span>
                                    </button>

                                    <button
                                        onClick={() => handleTabChange('revenue-staff')}
                                        className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-colors text-sm 
                                            ${activeTab === '/fashion/shop/reports/revenue-staff'
                                                ? 'bg-[#FE7410]/10 text-[#FE7410]'
                                                : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="text-[16px]">DT Nhân viên</span>
                                        <span className="text-xs bg-[#FE7410] text-white px-1.5 py-0.5 rounded-full font-semibold">HOT</span>
                                    </button>

                                    <button
                                        onClick={() => handleTabChange('revenue-product')}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm 
                                            ${activeTab === '/fashion/shop/reports/revenue-product'
                                                ? 'bg-[#FE7410]/10 text-[#FE7410]'
                                                : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="text-[16px]">DT Sản phẩm</span>
                                    </button>

                                    <div className="border-t border-gray-200 my-1"></div>

                                    <button
                                        onClick={() => handleTabChange('customer-report')}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm 
                                            ${activeTab === '/fashion/shop/reports/customer-report'
                                                ? 'bg-[#FE7410]/10 text-[#FE7410]'
                                                : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="text-[16px]">Báo cáo khách hàng</span>
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
                                        handleTabChange('categories');
                                    } else {
                                        setCategoryMenuExpanded(!categoryMenuExpanded);
                                    }
                                }}
                                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3 rounded-lg transition-colors  ${(activeTab === '/fashion/shop/reports/revenue-overview' || activeTab === '/fashion/shop/reports/revenue-staff'
                                     || activeTab === '/fashion/shop/products/categories' || activeTab === '/fashion/shop/products/brands')
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
                                        onClick={() => handleTabChange('categories')}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm 
                                            ${activeTab === '/fashion/shop/products/categories'
                                                ? 'bg-[#FE7410]/10 text-[#FE7410]'
                                                : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="text-[16px]">{language === 'vi' ? 'Danh mục' : 'Categories'}</span>
                                    </button>
                                    <button
                                        onClick={() => handleTabChange('brands')}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm 
                                            ${activeTab === '/fashion/shop/products/brands'
                                                ? 'bg-[#FE7410]/10 text-[#FE7410]'
                                                : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="text-[16px]">{language === 'vi' ? 'Thương hiệu' : 'Brands'}</span>
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
                            ${activeTab === '/fashion/shop/settings'
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
                                  {userRole?.role === 'admin' && (language === 'vi' ? 'A' : 'A')}
                                    {userRole?.role === 'cashier' && (language === 'vi' ? 'C' : 'T')}
                                    {userRole?.role === 'technician' && (language === 'vi' ? 'T' : 'T')}
                            </div>
                            <div className="flex-1 text-left">
                                <div className="text-sm font-medium text-gray-900">
                                      {userRole?.role === 'admin' && (language === 'vi' ? 'Quản trị viên' : 'Administrator')}
                                    {userRole?.role === 'cashier' && (language === 'vi' ? 'Thu ngân' : 'Cashier')}
                                    {userRole?.role === 'technician' && (language === 'vi' ? 'Kỹ thuật viên' : 'Technician')}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {userRole?.role === 'admin' && (language === 'vi' ? 'Quản trị viên' : 'Administrator')}
                                    {userRole?.role === 'cashier' && (language === 'vi' ? 'Thu ngân' : 'Cashier')}
                                    {userRole?.role === 'technician' && (language === 'vi' ? 'Kỹ thuật viên' : 'Technician')}
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
