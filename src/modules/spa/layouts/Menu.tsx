// components/Menu.tsx
import { useState, useEffect } from "react";
import { useStore } from '../../../lib/spa-lib/store';
import { translations } from '../../../lib/spa-lib/i18n';
import { loadDemoTreatmentPackages } from '../../../lib/spa-lib/demoData';
import { injectDemoTechnicianData } from '../../../lib/spa-lib/demoTechnicianData';
import '../../../lib/spa-lib/demoPackagesV2';
import type { IndustryType } from '../pages/settings/IndustrySelection';
import logoFull from "../../../assets/da526f2429ac0b8456776974a6480c4f4260145c.png";
import logoIcon from "../../../assets/f71a990f243f87339543c6b7dbfdaca1ddb212f4.png";
import "../../../lib/convenience-store-lib/demoPackagesV2";
import { useNavigate, useLocation } from "react-router-dom";
import type { Tab } from "../components/navigation/tabs";
import { TAB_ROUTE_MAP } from "../components/navigation/tabRouteMap";

import ProfileMenu from '../components/common/ProfileMenu';
import {
    LayoutGrid, ShoppingCart, Package, Settings as SettingsIcon, BarChart3,
    Languages, ClipboardList, Users, User, ChevronDown, ChevronUp,
    ChevronLeft, ChevronRight, FolderOpen, Calendar, Warehouse,
} from 'lucide-react';

type UserRole = 'admin' | 'cashier' | 'technician';


export default function Menu() {
    const navigate = useNavigate();
    const location = useLocation();
    const activeTab = location.pathname;
    const [accountMenuExpanded, setAccountMenuExpanded] = useState(false);
    const [reportMenuExpanded, setReportMenuExpanded] = useState(false);
    const [categoryMenuExpanded, setCategoryMenuExpanded] = useState(false);
    const [stockMenuExpanded, setStockMenuExpanded] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const authRaw = localStorage.getItem("auth");
    const parsedAuth = JSON.parse(authRaw || "null") as { role?: UserRole } | null;
    const userRole = parsedAuth ?? { role: "admin" as UserRole };
  
    const {
        language,
        setLanguage,
        sidebarCollapsed,
        toggleSidebar,
    } = useStore();
    const t = translations[language];
    const role = userRole.role ?? "admin";

    useEffect(() => {
        const savedIndustry = localStorage.getItem('salepa_industry_selected') as IndustryType | null;
        if (savedIndustry) {
            const { loadIndustryData } = useStore.getState();
            loadIndustryData(savedIndustry);
        }

        // Expose demo data loader to window for easy testing
        (window as any).loadDemoPackages = () => {
            loadDemoTreatmentPackages();
            window.location.reload();
        };

        (window as any).loadDemoTechnicians = () => {
            injectDemoTechnicianData(useStore);
            console.log('✅ Demo technician data loaded! Refresh to see updates.');
        };

        // Log instructions for testing treatment packages
        console.log('%c💡 Hướng dẫn test tính năng liệu trình:', 'color: #FE7410; font-weight: bold; font-size: 14px;');
        console.log('%c1. Gọi loadDemoPackages() để load dữ liệu demo', 'color: #666; font-size: 12px;');
        console.log('%c2. Vào màn Lịch hẹn > Tạo lịch mới', 'color: #666; font-size: 12px;');
        console.log('%c3. Chọn khách hàng "Trần Minh Anh" hoặc "Nguyễn Thu Hà"', 'color: #666; font-size: 12px;');
        console.log('%c4. Chọn dịch vụ "Facial trị mụn" hoặc "Facial dưỡng ẩm"', 'color: #666; font-size: 12px;');
        console.log('%c5. Sẽ thấy dropdown "Hình thức thanh toán" với gợi ý sử dụng gói liệu trình!', 'color: #10B981; font-weight: bold; font-size: 12px;');
        console.log('');
        console.log('%c🔧 Load demo technician data:', 'color: #FE7410; font-weight: bold; font-size: 14px;');
        console.log('%c   Gọi loadDemoTechnicians() trong console', 'color: #666; font-size: 12px;');
    }, []);

    const handleTabChange = (tab: Tab) => {
        const path = TAB_ROUTE_MAP[tab];

        if (path !== undefined) {
            navigate(`/spa/${path}`);
        }
    };
    

    const handleLogout = () => {
        // Clear ONLY login data, keep onboarding and industry selection
       localStorage.removeItem("salepa_isLoggedIn");
        localStorage.removeItem("salepa_username");
        localStorage.removeItem("salepa_rememberMe");
        localStorage.removeItem("salepa_userRole");

        // Reset login state
        navigate("/spa/login");

        // Don't reload - just show login screen
        // window.location.reload(); // ← REMOVED
    };

    // const handleLogin = (username: string, rememberMe: boolean, role: UserRole) => {
    //     // Save login state
    //     localStorage.setItem('salepa_isLoggedIn', 'true');
    //     localStorage.setItem('salepa_username', username);
    //     localStorage.setItem('salepa_rememberMe', rememberMe.toString());
    //     localStorage.setItem('salepa_userRole', role);

    //     setIsLoggedIn(true);
    //     setCurrentUser(username);
    //     setUserRole(role);

    //     // Redirect based on role to their first accessible page
    //     if (role === 'admin') {
    //         // Admin - go to Dashboard
    //         setActiveTab('dashboard');
    //     } else if (role === 'cashier') {
    //         // Cashier - go to Sales Screen (Bán hàng) with collapsed sidebar
    //         setActiveTab('sales');
    //         // Collapse sidebar if it's expanded
    //         if (!sidebarCollapsed) {
    //             toggleSidebar();
    //         }
    //     } else if (role === 'technician') {
    //         // Technician - go to Dashboard (shows their appointments)
    //         setActiveTab('dashboard');
    //     }
    // };

    // Permission check helper based on role groups
    const hasPermission = (permissionId: string): boolean => {

        // Admin has all permissions
        if (role === 'admin') return true;

        // Cashier permissions: dashboard, sales, products_view, orders, customers, appointments (NO reports, NO stock management)
        if (role === 'cashier') {
            return ['dashboard', 'sales', 'products_view', 'orders', 'customers', 'appointments'].includes(permissionId);
        }

        // Technician permissions: dashboard, products_view, appointments (NO sales)
        if (role === 'technician') {
            return ['dashboard', 'products_view', 'appointments'].includes(permissionId);
        }

        return false;
    };



    return (
        <>
            <div data-module="spa" className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'
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
                            ${activeTab === '/spa/dashboard' || activeTab === '/spa/'
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
                            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg mb-2 transition-colors ${activeTab === '/spa/sales'
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
                            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg mb-2 transition-colors ${activeTab === '/spa/orders'
                                ? 'bg-[#FE7410]/10 text-[#FE7410]'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            title={sidebarCollapsed ? t.orderManagement : undefined}
                        >
                            <ClipboardList className="w-5 h-5" />
                            {!sidebarCollapsed && <span>{t.orderManagement}</span>}
                        </button>
                    )}

                    {/* 4. Appointments - All roles */}
                    {hasPermission('appointments') && (
                        <button
                            onClick={() => handleTabChange('appointments')}
                            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg mb-2 transition-colors 
                            ${activeTab === '/spa/appointments'
                                ? 'bg-[#FE7410]/10 text-[#FE7410]'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            title={sidebarCollapsed ? 'Lịch hẹn' : undefined}
                        >
                            <Calendar className="w-5 h-5" />
                            {!sidebarCollapsed && <span>Lịch hẹn</span>}
                        </button>
                    )}

                    {/* 5. Customers - Cashier, Admin */}
                    {hasPermission('customers') && (
                        <button
                            onClick={() => handleTabChange('customers')}
                            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg mb-2 transition-colors 
                            ${activeTab === '/spa/customers'
                                ? 'bg-[#FE7410]/10 text-[#FE7410]'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            title={sidebarCollapsed ? t.customerData?.title || 'Khách hàng' : undefined}
                        >
                            <Users className="w-5 h-5" />
                            {!sidebarCollapsed && <span>{t.customerData?.title || 'Khách hàng'}</span>}
                        </button>
                    )}

                    {/* 6. Products - All roles (view only for Technician) */}
                    {hasPermission('products_view') && (
                        <button
                            onClick={() => handleTabChange('products')}
                            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg mb-2 transition-colors 
                            ${activeTab === '/spa/products'
                                ? 'bg-[#FE7410]/10 text-[#FE7410]'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            title={sidebarCollapsed ? t.products : undefined}
                        >
                            <Package className="w-5 h-5" />
                            {!sidebarCollapsed && <span>{t.products}</span>}
                        </button>
                    )}

                    {/* 6.5. Stock Management with Submenu - Admin ONLY */}
                    {role === 'admin' && (
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
                                ${activeTab === '/spa/inventory/stock-in' || activeTab === '/spa/inventory/stock-out'
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
                                            ${activeTab === '/spa/inventory/stock-in'
                                            ? 'bg-[#FE7410]/10 text-[#FE7410]'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >

                                        <span className="text-[16px]">Nhập kho</span>
                                    </button>
                                    <button
                                        onClick={() => handleTabChange('stock-out')}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm 
                                            ${activeTab === '/spa/inventory/stock-out'
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
                                ${(activeTab === '/spa/users' || activeTab === '/spa/users/roles')
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
                                            ${activeTab === '/spa/users'
                                            ? 'bg-[#FE7410]/10 text-[#FE7410]'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="text-[16px]">{language === 'vi' ? 'Người dùng' : 'Users'}</span>
                                    </button>

                                    <button
                                        onClick={() => handleTabChange('role-groups')}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm 
                                            ${activeTab === '/spa/users/roles'
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
                                ${(activeTab === '/spa/reports/revenue-overview' || activeTab === '/spa/reports/revenue-staff' || activeTab === '/spa/reports/revenue-service' || activeTab === '/spa/reports/revenue-package' || activeTab === '/spa/reports/revenue-product' || activeTab === '/spa/reports/customer-report' || activeTab === '/spa/reports/appointment-report' || activeTab === '/spa/reports/inventory-report')
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
                                            ${activeTab === '/spa/reports/revenue-overview'
                                            ? 'bg-[#FE7410]/10 text-[#FE7410]'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="text-[16px]">DT Tổng hợp</span>
                                    </button>

                                    <button
                                        onClick={() => handleTabChange('revenue-staff')}
                                        className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-colors text-sm 
                                            ${activeTab === '/spa/reports/revenue-staff'
                                            ? 'bg-[#FE7410]/10 text-[#FE7410]'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="text-[16px]">DT Nhân viên</span>
                                        <span className="text-xs bg-[#FE7410] text-white px-1.5 py-0.5 rounded-full font-semibold">HOT</span>
                                    </button>

                                    <button
                                        onClick={() => handleTabChange('revenue-service')}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm 
                                            ${activeTab === '/spa/reports/revenue-service'
                                            ? 'bg-[#FE7410]/10 text-[#FE7410]'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="text-[16px]">DT Dịch vụ</span>
                                    </button>

                                    <button
                                        onClick={() => handleTabChange('revenue-package')}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm 
                                            ${activeTab === '/spa/reports/revenue-package'
                                            ? 'bg-[#FE7410]/10 text-[#FE7410]'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="text-[16px]">DT Gói</span>
                                    </button>

                                    <button
                                        onClick={() => handleTabChange('revenue-product')}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm 
                                            ${activeTab === '/spa/reports/revenue-product'
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
                                            ${activeTab === '/spa/reports/customer-report'
                                            ? 'bg-[#FE7410]/10 text-[#FE7410]'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="text-[16px]">Báo cáo khách hàng</span>
                                    </button>

                                    <div className="border-t border-gray-200 my-1"></div>

                                    <button
                                        onClick={() => handleTabChange('appointment-report')}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm 
                                            ${activeTab === '/spa/reports/appointment-report'
                                            ? 'bg-[#FE7410]/10 text-[#FE7410]'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="text-[16px]">Lịch hẹn</span>
                                    </button>

                                    <button
                                        onClick={() => handleTabChange('inventory-report')}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm 
                                            ${activeTab === '/spa/reports/inventory-report'
                                            ? 'bg-[#FE7410]/10 text-[#FE7410]'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="text-[16px]">Tồn kho</span>
                                    </button>
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
                                ${(activeTab === '/spa/product-categories' || activeTab === '/spa/beds' || activeTab === '/spa/suppliers' || activeTab === '/spa/customer-groups')
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
                                            ${activeTab === '/spa/product-categories'
                                            ? 'bg-[#FE7410]/10 text-[#FE7410]'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="text-[16px]">{language === 'vi' ? 'Danh mục sản phẩm' : 'Product Categories'}</span>
                                    </button>
                                    <button
                                        onClick={() => handleTabChange('beds')}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm 
                                            ${activeTab === '/spa/beds'
                                            ? 'bg-[#FE7410]/10 text-[#FE7410]'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="text-[16px]">{language === 'vi' ? 'Quản lý giường' : 'Bed Management'}</span>
                                    </button>
                                    <button
                                        onClick={() => handleTabChange('suppliers')}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm 
                                            ${activeTab === '/spa/suppliers'
                                            ? 'bg-[#FE7410]/10 text-[#FE7410]'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="text-[16px]">{language === 'vi' ? 'Nhà cung cấp' : 'Suppliers'}</span>
                                    </button>
                                    <button
                                        onClick={() => handleTabChange('customer-groups')}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm 
                                            ${activeTab === '/spa/customer-groups'
                                            ? 'bg-[#FE7410]/10 text-[#FE7410]'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="text-[16px]">{language === 'vi' ? 'Loại khách hàng' : 'Customer Groups'}</span>
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
                            ${activeTab === '/spa/settings'
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
                                {role === 'admin' && (language === 'vi' ? 'A' : 'A')}
                                    {role === 'cashier' && (language === 'vi' ? 'C' : 'C')}
                                    {role === 'technician' && (language === 'vi' ? 'T' : 'T')}
                            </div>
                            <div className="flex-1 text-left">
                                <div className="text-sm font-medium text-gray-900">
                                    {role === 'admin' && (language === 'vi' ? 'Quản trị viên' : 'Administrator')}
                                    {role === 'cashier' && (language === 'vi' ? 'Thu ngân' : 'Cashier')}
                                    {role === 'technician' && (language === 'vi' ? 'Kỹ thuật viên' : 'Technician')}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {role === 'admin' && (language === 'vi' ? 'Quản trị viên' : 'Administrator')}
                                    {role === 'cashier' && (language === 'vi' ? 'Thu ngân' : 'Cashier')}
                                    {role === 'technician' && (language === 'vi' ? 'Kỹ thuật viên' : 'Technician')}
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
