import { Routes, Route, useNavigate } from 'react-router-dom';

import MainLayout from "../layouts/ModuleLayout";
import Dashboard from "../pages/dashboard/Dashboard";

// screens / pages
import ModernSalesScreen from "../pages/sales/ModernSalesScreen";
import ProductManagement from "../pages/products/ProductManagement";
import { OrderDetailFullScreen } from '../pages/orders/OrderDetailFullScreen';
import OrderHistory from "../pages/orders/OrderHistory";
import Reports from "../pages/reports/Reports";
import Settings from "../pages/system/Settings";
import SelfServiceScreen from "../pages/self-service/SelfServiceScreen";
import CustomerView from "../pages/customers/CustomerView";
import CashierView from "../pages/cashier/CashierView";
import HelpCenter from "../pages/support/HelpCenter";
import ProfileMenu from "../components/profile/ProfileMenu";
import OnboardingScreen from "../pages/onboarding/OnboardingScreen";
import IndustrySelection from "../pages/system/IndustrySelection";
import LoginScreen from "../pages/auth/LoginScreen";
import CustomerManagement from "../pages/customers/CustomerManagement";
import UserManagement from "../pages/system/UserManagement";
import RoleGroupManagement from "../pages/system/RoleGroupManagement";
import ProductCategoryManagement from "../pages/products/ProductCategoryManagement";
import CustomerTypeManagement from "../pages/customers/CustomerTypeManagement";
import { StockInManagement } from "../pages/inventory/StockInManagement";
import { StockOutManagement } from "../pages/inventory/StockOutManagement";
import DebugPackageLoader from "../components/debug/DebugPackageLoader";
import RequireRole from "../components/auth/ProtectedRoute";
import Forbidden403 from "../pages/errors/Forbidden403";
import NotFound404 from "../pages/errors/NotFound404";
export default function ConvenienceStoreRouter() {
    const navigate = useNavigate();
    const handleLogin = (payload: LoginPayload) => {
        console.log('LOGIN', payload);

        localStorage.setItem('auth', JSON.stringify(payload));

        if (payload.role === 'admin') {
            navigate('/convenience/');
        } else if (payload.role === 'cashier') {
            navigate('/convenience/sales');
        }
    };
    return (
        <Routes>
            {/* ===== AUTH (NO LAYOUT) ===== */}
            <Route path="login" element={<LoginScreen onLogin={handleLogin} />} />

            {/* ===== MAIN LAYOUT ===== */}
            <Route element={<RequireRole allow={["admin", "cashier"]} />}>
                <Route element={<MainLayout />}>

                    {/* ========== ADMIN ONLY ========== */}
                    <Route element={<RequireRole allow={["admin"]} />}>
                        <Route index element={<Dashboard />} />
                        <Route path="users" element={<UserManagement />} />
                        <Route path="roles" element={<RoleGroupManagement />} />
                        <Route path="reports" element={<Reports />} />
                        <Route path="reports/:type" element={<Reports />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="industry-selection" element={<IndustrySelection />} />


                        <Route index element={<Dashboard />} />

                        {/* POS / Sales */}
                        <Route path="cashier" element={<CashierView />} />
                        <Route path="customer-view" element={<CustomerView />} />
                        <Route path="self-service" element={<SelfServiceScreen />} />

                        {/* Product */}
                        <Route path="product-categories" element={<ProductCategoryManagement />} />

                        {/* Orders */}
                        {/* <Route path="orders" element={<OrderManagement />} /> */}

                        {/* Customers */}
                        <Route path="customer-types" element={<CustomerTypeManagement />} />

                        {/* Users & Roles */}
                        <Route path="users" element={<UserManagement />} />
                        <Route path="roles" element={<RoleGroupManagement />} />

                        {/* System */}
                        <Route path="reports" element={<Reports />} />
                        <Route path="reports/:type" element={<Reports />} />

                        <Route path="settings" element={<Settings />} />
                        <Route path="help" element={<HelpCenter />} />
                        <Route path="profile" element={<ProfileMenu />} />

                        {/* Onboarding / Auth */}
                        <Route path="onboarding" element={<OnboardingScreen />} />
                        <Route path="industry-selection" element={<IndustrySelection />} />

                        {/* Debug */}

                    </Route>

                    {/* ========== ADMIN + CASHIER ========== */}
                    <Route element={<RequireRole allow={["admin", "cashier"]} />}>
                        <Route path="debug" element={<DebugPackageLoader />} />
                        <Route path="sales" element={<ModernSalesScreen />} />
                        <Route path="orders" element={<OrderHistory />} />
                        <Route path="orders/detail/:id" element={<OrderDetailFullScreen />} />
                        <Route path="customers" element={<CustomerManagement />} />
                        <Route path="products" element={<ProductManagement />} />
                        <Route path="inventory/stock-in" element={<StockInManagement />} />
                        <Route path="inventory/stock-out" element={<StockOutManagement />} />
                    </Route>

                    {/* ========== PUBLIC INSIDE LAYOUT (OPTIONAL) ========== */}
                    <Route path="help" element={<HelpCenter />} />
                    {/* ERROR */}
                    <Route path="403" element={<Forbidden403 />} />
                    <Route path="*" element={<NotFound404 />} />
                </Route>
            </Route>
        </Routes>
    );
}
