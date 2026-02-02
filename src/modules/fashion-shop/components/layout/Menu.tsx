// components/Menu.tsx
import { Link } from 'react-router-dom';
import { useState, useEffect } from "react";
import { useStore } from "../../../lib/convenience-store-lib/store";
import { translations } from "../../../lib/convenience-store-lib/i18n";
import type { IndustryType } from "../../../lib/convenience-store-lib/store";
import { loadDemoTreatmentPackages } from "../../../lib/convenience-store-lib/demoData";
import logoFull from "../../../assets/da526f2429ac0b8456776974a6480c4f4260145c.png";
import logoIcon from "../../../assets/f71a990f243f87339543c6b7dbfdaca1ddb212f4.png";
import "../../../lib/convenience-store-lib/demoPackagesV2";
import { useNavigate, useLocation } from "react-router-dom";
import type { Tab } from "../components/navigation/tabs";
import { TAB_ROUTE_MAP } from "../components/navigation/tabRouteMap";

import ProfileMenu from '../components/profile/ProfileMenu';
import {
    LayoutGrid,
    ShoppingCart,
    Package,
    Settings as SettingsIcon,
    BarChart3,
    HelpCircle,
    Languages,
    ClipboardList,
    Users,
    User,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    FolderOpen,
    Calendar,
    Warehouse,
} from "lucide-react";


type UserRole = "admin" | "cashier" | "technician";

export default function Menu() {
    /** ✅ BẮT BUỘC cho App Router */
    const navigate = useNavigate();
    const location = useLocation();

    const [mounted, setMounted] = useState(false);
    const pathname = location.pathname;
    const [activeTab, setActiveTab] = useState<Tab>("dashboard");
    const [accountMenuExpanded, setAccountMenuExpanded] =
        useState(false);
    const [reportMenuExpanded, setReportMenuExpanded] =
        useState(false);
    const [categoryMenuExpanded, setCategoryMenuExpanded] =
        useState(false);
    const [stockMenuExpanded, setStockMenuExpanded] =
        useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    /** ❗ KHÔNG đọc localStorage ở đây */
    const [showOnboardingScreen, setShowOnboardingScreen] =
        useState(false);
    const [showIndustrySelection, setShowIndustrySelection] =
        useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState("");
    const authRaw = localStorage.getItem("auth");
    const userRole = JSON.parse(authRaw);


    const {
        language,
        setLanguage,
        sidebarCollapsed,
        toggleSidebar,
        users,
        theme,
        fontSize,
        compactMode,
    } = useStore();

    const t = translations[language];
    const [showHelp, setShowHelp] = useState(false);

    /** ✅ CHỈ ĐỌC localStorage SAU KHI MOUNT */
    useEffect(() => {
        setMounted(true);

        const onboardingCompleted =
            localStorage.getItem("salepa_onboarding_completed") ===
            "true";
        const industrySelected = localStorage.getItem(
            "salepa_industry_selected",
        );
        const savedLoginState =
            localStorage.getItem("salepa_isLoggedIn") === "true";
        const rememberMe =
            localStorage.getItem("salepa_rememberMe") === "true";

        setShowOnboardingScreen(!onboardingCompleted);
        setShowIndustrySelection(
            onboardingCompleted && !industrySelected,
        );
        setIsLoggedIn(savedLoginState && rememberMe);
        setCurrentUser(
            localStorage.getItem("salepa_username") || "",
        );
       

        if (industrySelected) {
            const { loadIndustryData } = useStore.getState();
            loadIndustryData(industrySelected as IndustryType);
        }
    }, []);

    /** ❗ TRÁNH hydration mismatch */

    // Apply theme, fontSize, and compactMode on mount
    useEffect(() => {
        // Apply theme
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else if (theme === "light") {
            document.documentElement.classList.remove("dark");
        } else {
            // Auto mode - check system preference
            const isDark = window.matchMedia(
                "(prefers-color-scheme: dark)",
            ).matches;
            if (isDark) {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
        }

        // Apply font size
        const rootElement = document.documentElement;
        rootElement.classList.remove(
            "text-sm",
            "text-base",
            "text-lg",
        );
        if (fontSize === "small") {
            rootElement.classList.add("text-sm");
        } else if (fontSize === "large") {
            rootElement.classList.add("text-lg");
        } else {
            rootElement.classList.add("text-base");
        }

        // Apply compact mode
        if (compactMode) {
            document.documentElement.classList.add("compact-mode");
        } else {
            document.documentElement.classList.remove("compact-mode");
        }
    }, [theme, fontSize, compactMode]);

    // Check if first time user
    useEffect(() => {
        if (showOnboardingScreen) {
            setShowOnboardingScreen(true);
        }

        // Load industry data if already selected
        const savedIndustry = localStorage.getItem(
            "salepa_industry_selected",
        ) as IndustryType | null;
        if (
            savedIndustry &&
            !showOnboardingScreen &&
            !showIndustrySelection
        ) {
            const { loadIndustryData } = useStore.getState();
            loadIndustryData(savedIndustry);
        }

        // Keyboard shortcut for help
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === "F1") {
                e.preventDefault();
                setShowHelp(true);
            }
        };

        window.addEventListener("keydown", handleKeyPress);

        // Expose demo data loader to window for easy testing
        (window as any).loadDemoPackages = () => {
            loadDemoTreatmentPackages();
            window.location.reload();
        };

        return () =>
            window.removeEventListener("keydown", handleKeyPress);
    }, [showOnboardingScreen, showIndustrySelection]);

    const handleOnboardingComplete = () => {
        localStorage.setItem("salepa_onboarding_completed", "true");
        setShowOnboardingScreen(false);
        setShowIndustrySelection(true); // Show industry selection after onboarding
    };

    const handleOnboardingSkip = () => {
        localStorage.setItem("salepa_onboarding_completed", "true");
        setShowOnboardingScreen(false);
        setShowIndustrySelection(true); // Show industry selection after skipping
    };

    const handleIndustrySelect = (industry: IndustryType) => {
        localStorage.setItem("salepa_industry_selected", industry);

        // Load industry-specific demo data
        const { loadIndustryData } = useStore.getState();
        loadIndustryData(industry);

        setShowIndustrySelection(false);
        // After industry selection, user will see login screen
    };

    const handleIndustrySkip = () => {
        // Set default industry as Spa
        const defaultIndustry = "spa-service";
        localStorage.setItem(
            "salepa_industry_selected",
            defaultIndustry,
        );

        // Load industry data
        const { loadIndustryData } = useStore.getState();
        loadIndustryData(defaultIndustry);

        setShowIndustrySelection(false);
    };

    const handleQuickAction = (action: string) => {
        switch (action) {
            case "new-sale":
                navigate(`/${TAB_ROUTE_MAP["sales"]}`);
                break;
            case "add-product":
                navigate(`/${TAB_ROUTE_MAP["products"]}`);
                break;
            case "view-reports":
                navigate(`/${TAB_ROUTE_MAP["reports"]}`);
                break;
        }
    };

    const handleTabChange = (tab: Tab) => {
        const path = TAB_ROUTE_MAP[tab];

        if (path !== undefined) {
            navigate(`/convenience/${path}`);
        }
    };


    const handleLogout = () => {
        // Clear ONLY login data, keep onboarding and industry selection
        localStorage.removeItem("salepa_isLoggedIn");
        localStorage.removeItem("salepa_username");
        localStorage.removeItem("salepa_rememberMe");
        localStorage.removeItem("salepa_userRole");

        // Reset login state
        setIsLoggedIn(false);
        setCurrentUser("");
        // setUserRole("admin");
        navigate("/convenience/login");
        // Don't reload - just show login screen
        // window.location.reload(); // ← REMOVED
    };

    const handleLogin = (
        username: string,
        rememberMe: boolean,
        role: UserRole,
    ) => {
        // Save login state
        localStorage.setItem("salepa_isLoggedIn", "true");
        localStorage.setItem("salepa_username", username);
        localStorage.setItem(
            "salepa_rememberMe",
            rememberMe.toString(),
        );
        localStorage.setItem("salepa_userRole", role);

        setIsLoggedIn(true);
        setCurrentUser(username);
        // setUserRole(role);

        // Redirect based on role to their first accessible page
        if (role === "admin") {
            navigate("/");
        } else {
            navigate(`/${TAB_ROUTE_MAP.sales}`);
        }
    };

    // Permission check helper based on role groups
    const hasPermission = (permissionId: string): boolean => {

        // Admin has all permissions
        if (userRole.role === "admin") return true;

        // Cashier permissions: sales, products_view, orders, customers, appointments (NO reports)
        if (userRole.role === "cashier") {
            return [
                "sales",
                "products_view",
                "orders",
                "customers",
            ].includes(permissionId);
        }

        return false;
    };
    return (
        <>
            <div className="h-screen bg-gray-50 dark:bg-gray-900 flex relative overflow-hidden">
                {/* Changed min-h-screen to h-screen and added overflow-hidden */}
                {/* Sidebar */}
                <div
                    className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full transition-all duration-300 ${sidebarCollapsed ? "w-16" : "w-64"
                        }`}
                >
                    {/* Changed h-screen to h-full */}
                    <div
                        className={`border-b border-gray-200 dark:border-gray-700 flex-shrink-0 ${sidebarCollapsed ? "p-3" : "p-6"}`}
                    >
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

                    <nav
                        className={`flex-1 overflow-y-auto ${sidebarCollapsed ? "p-2" : "p-4"}`}
                    >
                        {/* 1. Dashboard - Admin only */}
                        {hasPermission("dashboard") && (
                            <button
                                onClick={() => handleTabChange("dashboard")}

                                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-4 py-3 rounded-lg mb-2 transition-colors ${pathname === "/convenience/" || pathname === "/convenience/dashboard"
                                    ? "bg-[#FE7410]/10 text-[#FE7410]"
                                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                                title={
                                    sidebarCollapsed ? t.dashboard : undefined
                                }
                            >
                                <LayoutGrid className="w-5 h-5" />
                                {!sidebarCollapsed && (
                                    <span>{t.dashboard}</span>
                                )}
                            </button>
                        )}

                        {/* 2. Sales - Cashier, Admin */}
                        {hasPermission("sales") && (
                            <button
                                onClick={() => handleTabChange("sales")}
                                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-4 py-3 rounded-lg mb-2 transition-colors 
                                ${pathname === "/convenience/sales"
                                        ? "bg-[#FE7410]/10 text-[#FE7410]"
                                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                                title={sidebarCollapsed ? t.sales : undefined}
                            >
                                <ShoppingCart className="w-5 h-5" />
                                {!sidebarCollapsed && <span>{t.sales}</span>}
                            </button>
                        )}

                        {/* 3. Orders - Cashier, Admin */}
                        {hasPermission("orders") && (
                            <button
                                onClick={() => handleTabChange("orders")}
                                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-4 py-3 rounded-lg mb-2 transition-colors 
                                ${pathname === "/convenience/orders"
                                        ? "bg-[#FE7410]/10 text-[#FE7410]"
                                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                                title={
                                    sidebarCollapsed
                                        ? t.orderManagement
                                        : undefined
                                }
                            >
                                <ClipboardList className="w-5 h-5" />
                                {!sidebarCollapsed && (
                                    <span>{t.orderManagement}</span>
                                )}
                            </button>
                        )}

                        {/* 4. Customers - Cashier, Admin */}
                        {hasPermission("customers") && (
                            <button
                                onClick={() => handleTabChange("customers")}
                                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-4 py-3 rounded-lg mb-2 transition-colors 
                                 ${pathname === "/convenience/customers"
                                        ? "bg-[#FE7410]/10 text-[#FE7410]"
                                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}
                                        `}
                                title={
                                    sidebarCollapsed
                                        ? t.customer || "Khách hàng"
                                        : undefined
                                }
                            >
                                <Users className="w-5 h-5" />
                                {!sidebarCollapsed && (
                                    <span>{t.customer || "Khách hàng"}</span>
                                )}
                            </button>
                        )}

                        {/* 5. Products - All roles (view only for Technician) */}
                        {hasPermission("products_view") && (
                            <button
                                onClick={() => handleTabChange("products")}
                                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-4 py-3 rounded-lg mb-2 transition-colors 
                                ${pathname === "/convenience/products"
                                        ? "bg-[#FE7410]/10 text-[#FE7410]"
                                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}
                                        `}
                                title={
                                    sidebarCollapsed ? t.products : undefined
                                }
                            >
                                <Package className="w-5 h-5" />
                                {!sidebarCollapsed && (
                                    <span>{t.products}</span>
                                )}
                            </button>
                        )}

                        {/* 5.5. Stock Management with Submenu - Admin & Cashier */}
                        {(userRole === "admin" ||
                            userRole === "cashier") && (
                                <div className="mb-2">
                                    <button
                                        onClick={() => {
                                            if (sidebarCollapsed) {
                                                handleTabChange("stock-in");
                                            } else {
                                                setStockMenuExpanded(
                                                    !stockMenuExpanded,
                                                );
                                            }
                                        }}
                                        className={`w-full flex items-center ${sidebarCollapsed ? "justify-center" : "justify-between"} px-4 py-3 rounded-lg transition-colors 
                                        ${pathname === "/convenience/stock-in" || pathname === "/convenience/stock-out"
                                                ? "bg-[#FE7410]/10 text-[#FE7410]"
                                                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}
                                            `}
                                        title={
                                            sidebarCollapsed ? t.stock : undefined
                                        }
                                    >
                                        <div
                                            className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"}`}
                                        >
                                            <Warehouse className="w-5 h-5" />
                                            {!sidebarCollapsed && (
                                                <span>{t.stock}</span>
                                            )}
                                        </div>
                                        {!sidebarCollapsed &&
                                            (stockMenuExpanded ? (
                                                <ChevronUp className="w-4 h-4" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4" />
                                            ))}
                                    </button>

                                    {/* Submenu */}
                                    {!sidebarCollapsed && stockMenuExpanded && (
                                        <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-4">
                                            <button
                                                onClick={() =>
                                                    handleTabChange("stock-in")
                                                }
                                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm
                                                    ${pathname === "/convenience/stock-in"
                                                        ? "bg-[#FE7410]/10 text-[#FE7410]"
                                                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}
                                                    `}
                                            >
                                                <span className="text-[16px]">
                                                    {t.importStock}
                                                </span>
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleTabChange("stock-out")
                                                }
                                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm 
                                                    ${pathname === "/convenience/stock-out"
                                                        ? "bg-[#FE7410]/10 text-[#FE7410]"
                                                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}
                                                    `}
                                            >
                                                <span className="text-[16px]">
                                                    {t.exportStock}
                                                </span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                        {/* 6. Account Management with Submenu - Admin only */}
                        {hasPermission("users") && (
                            <div className="mb-2">
                                <button
                                    onClick={() => {
                                        if (sidebarCollapsed) {
                                            handleTabChange("users");
                                        } else {
                                            setAccountMenuExpanded(
                                                !accountMenuExpanded,
                                            );
                                        }
                                    }}
                                    className={`w-full flex items-center ${sidebarCollapsed ? "justify-center" : "justify-between"} px-4 py-3 rounded-lg transition-colors 
                                    ${pathname === "/convenience/users" || pathname === "/convenience/roles"
                                            ? "bg-[#FE7410]/10 text-[#FE7410]"
                                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}
                                        `}
                                    title={
                                        sidebarCollapsed
                                            ? language === "vi"
                                                ? "Quản lý tài khoản"
                                                : "Account"
                                            : undefined
                                    }
                                >
                                    <div
                                        className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"}`}
                                    >
                                        <User className="w-5 h-5" />
                                        {!sidebarCollapsed && (
                                            <span className="whitespace-nowrap">
                                                {language === "vi"
                                                    ? "Quản lý tài khoản"
                                                    : "Account"}
                                            </span>
                                        )}
                                    </div>
                                    {!sidebarCollapsed &&
                                        (accountMenuExpanded ? (
                                            <ChevronUp className="w-4 h-4" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4" />
                                        ))}
                                </button>

                                {/* Submenu */}
                                {!sidebarCollapsed && accountMenuExpanded && (
                                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-4">
                                        <button
                                            onClick={() => handleTabChange("users")}
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm 
                                                ${pathname === "/convenience/users"
                                                    ? "bg-[#FE7410]/10 text-[#FE7410]"
                                                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                                }
                                                `}
                                        >
                                            <span className="text-[16px]">
                                                {language === "vi"
                                                    ? "Người dùng"
                                                    : "Users"}
                                            </span>
                                        </button>

                                        <button
                                            onClick={() =>
                                                handleTabChange("role-groups")
                                            }
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm 
                                                ${pathname === "/convenience/roles"
                                                ? "bg-[#FE7410]/10 text-[#FE7410]"
                                                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                                }`}
                                        >
                                            <span className="text-[16px]">
                                                {language === "vi"
                                                    ? "Nhóm quyền"
                                                    : "Role Groups"}
                                            </span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 7. Reports with Submenu - Cashier, Admin */}
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
                                    ${pathname === "/convenience/reports/revenue-overview" ||
                                            pathname === "/convenience/reports/revenue-staff" ||
                                            pathname === "/convenience/reports/revenue-product" ||
                                            pathname === "/convenience/reports/customer-report" ||
                                            pathname === "/convenience/reports/inventory-report"
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
                                            <span>{t.reports}</span>
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
                                                ${pathname === "/convenience/reports/revenue-overview"
                                                ? "bg-[#FE7410]/10 text-[#FE7410]"
                                                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                                }`}
                                        >
                                            <span className="text-[16px]">
                                                {t.aggregateRevenue}
                                            </span>
                                        </button>

                                        <button
                                            onClick={() =>
                                                handleTabChange("revenue-staff")
                                            }
                                            className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-colors text-sm 
                                                ${pathname === "/convenience/reports/revenue-staff"
                                                ? "bg-[#FE7410]/10 text-[#FE7410]"
                                                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                                }`}
                                        >
                                            <span className="text-[16px]">
                                                {t.staffRevenue}
                                            </span>
                                        </button>

                                        <button
                                            onClick={() =>
                                                handleTabChange("revenue-product")
                                            }
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm 
                                                ${pathname === "/convenience/reports/revenue-product"
                                                ? "bg-[#FE7410]/10 text-[#FE7410]"
                                                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                                }`}
                                        >
                                            <span className="text-[16px]">
                                                {t.productRevenue}
                                            </span>
                                        </button>

                                        <div className="border-t border-gray-200 my-1"></div>

                                        <button
                                            onClick={() =>
                                                handleTabChange("customer-report")
                                            }
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm 
                                                ${pathname === "/convenience/reports/customer-report"
                                                ? "bg-[#FE7410]/10 text-[#FE7410]"
                                                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                                }`}
                                        >
                                            <span className="text-[16px]">
                                                {t.customerOverview}
                                            </span>
                                        </button>

                                        <div className="border-t border-gray-200 my-1"></div>

                                        <button
                                            onClick={() =>
                                                handleTabChange("inventory-report")
                                            }
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm 
                                                ${pathname === "/convenience/reports/inventory-report"
                                                ? "bg-[#FE7410]/10 text-[#FE7410]"
                                                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                                }`}
                                        >
                                            <span className="text-[16px]">
                                                {t.inventory}
                                            </span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 8. Category Management with Submenu - Admin only */}
                        {hasPermission("product_categories") && (
                            <div className="mb-2">
                                <button
                                    onClick={() => {
                                        if (sidebarCollapsed) {
                                            handleTabChange("product-categories");
                                        } else {
                                            setCategoryMenuExpanded(
                                                !categoryMenuExpanded,
                                            );
                                        }
                                    }}
                                    className={`w-full flex items-center ${sidebarCollapsed ? "justify-center" : "justify-between"} px-4 py-3 rounded-lg transition-colors 
                                    ${pathname === "/convenience/product-categories" ||
                                        pathname === "/convenience/customer-types"
                                        ? "bg-[#FE7410]/10 text-[#FE7410]"
                                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                        }`}
                                    title={
                                        sidebarCollapsed
                                            ? language === "vi"
                                                ? "Danh mục chung"
                                                : "Categories"
                                            : undefined
                                    }
                                >
                                    <div
                                        className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"}`}
                                    >
                                        <FolderOpen className="w-5 h-5" />
                                        {!sidebarCollapsed && (
                                            <span>
                                                {language === "vi"
                                                    ? "Danh mục chung"
                                                    : "Categories"}
                                            </span>
                                        )}
                                    </div>
                                    {!sidebarCollapsed &&
                                        (categoryMenuExpanded ? (
                                            <ChevronUp className="w-4 h-4" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4" />
                                        ))}
                                </button>

                                {/* Submenu */}
                                {!sidebarCollapsed &&
                                    categoryMenuExpanded && (
                                        <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-4">
                                            <button
                                                onClick={() =>
                                                    handleTabChange(
                                                        "product-categories",
                                                    )
                                                }
                                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm
                                                    ${pathname === "/convenience/product-categories"
                                                    ? "bg-[#FE7410]/10 text-[#FE7410]"
                                                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                                    }`}
                                            >
                                                <span className="text-[16px] whitespace-nowrap">
                                                    {language === "vi"
                                                        ? "Danh mục sản phẩm"
                                                        : "Product Categories"}
                                                </span>
                                            </button>

                                            <button
                                                onClick={() =>
                                                    handleTabChange("customer-types")
                                                }
                                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm 
                                                    ${pathname === "/convenience/customer-types"
                                                    ? "bg-[#FE7410]/10 text-[#FE7410]"
                                                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                                    }`}
                                            >
                                                <span className="text-[16px]">
                                                    {language === "vi"
                                                        ? "Loại khách hàng"
                                                        : "Customer Types"}
                                                </span>
                                            </button>
                                        </div>
                                    )}
                            </div>
                        )}

                        {/* Divider */}
                        {!sidebarCollapsed && (
                            <div className="border-t border-gray-200 my-2"></div>
                        )}

                        {/* 9. Settings - Admin only */}
                        {hasPermission("settings") && (
                            <button
                                onClick={() => handleTabChange("settings")}
                                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-4 py-3 rounded-lg mb-2 transition-colors 
                                ${pathname === "/convenience/settings"
                                    ? "bg-[#FE7410]/10 text-[#FE7410]"
                                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    }`}
                                title={
                                    sidebarCollapsed ? t.settings : undefined
                                }
                            >
                                <SettingsIcon className="w-5 h-5" />
                                {!sidebarCollapsed && (
                                    <span>{t.settings}</span>
                                )}
                            </button>
                        )}
                    </nav>

                    <div
                        className={`border-t border-gray-200 dark:border-gray-700 flex-shrink-0 space-y-3 ${sidebarCollapsed ? "p-2" : "p-4"}`}
                    >
                        {/* Language Toggle */}
                        <button
                            onClick={() =>
                                setLanguage(language === "vi" ? "en" : "vi")
                            }
                            className={`w-full flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-4 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600`}
                            title={
                                sidebarCollapsed
                                    ? language === "vi"
                                        ? "Tiếng Việt"
                                        : "English"
                                    : undefined
                            }
                        >
                            <Languages className="w-5 h-5" />
                            {!sidebarCollapsed && (
                                <span>
                                    {language === "vi"
                                        ? "🇻🇳 Tiếng Việt"
                                        : "🇬🇧 English"}
                                </span>
                            )}
                        </button>

                        {!sidebarCollapsed && (
                            <button
                                onClick={() =>
                                    setShowProfileMenu(!showProfileMenu)
                                }
                                className="flex items-center gap-3 w-full hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 transition-colors"
                            >
                                <div className="w-10 h-10 bg-gradient-to-br from-[#FE7410] to-[#FF8C3A] rounded-full flex items-center justify-center text-white font-bold">
                                     {userRole.role === "admin" &&
                                            (language === "vi"
                                                ? "A"
                                                : "A")}
                                        {userRole.role === "cashier" &&
                                            (language === "vi"
                                                ? "C"
                                                : "C")}
                                        {userRole.role === "technician" &&
                                            (language === "vi"
                                                ? "T"
                                                : "T")}
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                         {userRole.role === "admin" &&
                                            (language === "vi"
                                                ? "Quản trị viên"
                                                : "Administrator")}
                                        {userRole.role === "cashier" &&
                                            (language === "vi"
                                                ? "Thu ngân"
                                                : "Cashier")}
                                        {userRole.role === "technician" &&
                                            (language === "vi"
                                                ? "Kỹ thuật viên"
                                                : "Technician")}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {userRole.role === "admin" &&
                                            (language === "vi"
                                                ? "Quản trị viên"
                                                : "Administrator")}
                                        {userRole.role === "cashier" &&
                                            (language === "vi"
                                                ? "Thu ngân"
                                                : "Cashier")}
                                        {userRole.role === "technician" &&
                                            (language === "vi"
                                                ? "Kỹ thuật viên"
                                                : "Technician")}
                                    </div>
                                </div>
                            </button>
                        )}
                    </div>
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
