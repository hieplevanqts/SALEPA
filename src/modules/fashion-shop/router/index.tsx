import { Routes, Route, useNavigate } from 'react-router-dom';

import MainLayout from "../layouts/ModuleLayout";

import Dashboard from '../pages/dashboard/Dashboard';
import ModernSalesScreen from '../pages/sales/ModernSalesScreen';
import ProductManagement from '../pages/products/ProductManagement';
// import AttributePage from '../pages/products/AttributePage';
import OrderHistory from '../pages/orders/OrderHistory';
import OrderManagement from '../pages/orders/OrderManagement';
import Reports from '../pages/reports/Reports';
import Settings from '../pages/settings/Settings';
import SelfServiceScreen from '../pages/self-service/SelfServiceScreen';
import CustomerView from '../pages/customers/CustomerView';
import CashierView from '../pages/sales/CashierView';
// import HelpCenter from './components/HelpCenter';
import ProfileMenu from '../components/layout/ProfileMenu';
// import OnboardingScreen from './components/OnboardingScreen';
import IndustrySelection from '../pages/systems/IndustrySelection';
import LoginScreen from '../pages/auth/LoginScreen';
import CustomerManagement from '../pages/customers/CustomerManagement';
import UserManagement from '../pages/settings/UserManagement';
import RoleGroupManagement from '../pages/settings/RoleGroupManagement';
// import AppointmentManagement from './components/AppointmentManagement';
import ProductCategoryManagement from '../pages/products/ProductCategoryManagement';
import CategoryPage from '../pages/products/CategoryPage';
import BrandPage from '../pages/products/BrandPage';
import { StockInManagement } from '../pages/inventory/StockInManagementNew';
import { StockOutManagement } from '../pages/inventory/StockOutManagement';
import { InventoryManagement } from '../pages/inventory/InventoryManagement';
import { InventoryTransactionHistory } from '../pages/inventory/InventoryTransactionHistory';
// import { ApiConnectionTest } from './components/ApiConnectionTest';
import { Toaster } from 'sonner';
// import { NotificationBell } from './components/NotificationBell';
import DebugPackageLoader from '../components/debug/DebugPackageLoader';
// import DebugPackageLoader from '../components/self-service/DebugPackageLoader';
import Forbidden403 from '../pages/errors/Forbidden403';
import NotFound404 from '../pages/errors/NotFound404';
import RequireRole from '../components/auth/ProtectedRoute';
import { OrderDetailFullScreen } from '../pages/orders/OrderDetailFullScreen';
import HelpCenter from '../pages/systems/HelpCenter';
// import { InventoryManagement } from '../pages/inventory/InventoryManagement';
export default function FashionShopRouter() {
    const navigate = useNavigate();
    const handleLogin = (payload: LoginPayload) => {
        console.log('LOGIN', payload);

        localStorage.setItem('auth', JSON.stringify(payload));

        if (payload.role === 'admin') {
            navigate('/fashion/shop/');
        } else if (payload.role === 'cashier') {
            navigate('/fashion/shop/sales');
        }
    };
    return (
        <Routes>
            {/* ===== AUTH (NO LAYOUT) ===== */}
            <Route path="login" element={<LoginScreen onLogin={handleLogin} />} />

            <Route element={<MainLayout />}>
                {/* ========== ADMIN ONLY ========== */}
                <Route element={<RequireRole allow={["admin"]} />}>
                    {/* Dashboard */}
                    <Route index element={<Dashboard />} />

                    {/* Users & Roles */}
                    <Route path="users" element={<UserManagement />} />
                    <Route path="roles" element={<RoleGroupManagement />} />

                    {/* Reports */}
                    <Route path="reports" element={<Reports />} />
                    <Route path="reports/:type" element={<Reports />} />

                    {/* System */}
                    <Route path="settings" element={<Settings />} />
                    {/* <Route path="help" element={<HelpCenter />} /> */}
                    <Route path="profile" element={<ProfileMenu />} />
                    <Route path="industry-selection" element={<IndustrySelection />} />

                    {/* POS / Sales */}
                    <Route path="cashier" element={<CashierView />} />
                    <Route path="customer-view" element={<CustomerView />} />
                    <Route path="self-service" element={<SelfServiceScreen />} />

                    {/* Products */}
                    <Route path="products/categories" element={<CategoryPage />} />
                    <Route path="products/brands" element={<BrandPage />} />
                    {/* <Route path="products/attributes" element={<AttributePage />} /> */}
                    <Route path="product-categories" element={<ProductCategoryManagement />} />

                    {/* Debug */}
                    <Route path="debug" element={<DebugPackageLoader />} />
                </Route>

                {/* ========== ADMIN + CASHIER ========== */}
                <Route element={<RequireRole allow={["admin", "cashier"]} />}>
                    {/* Sales */}
                    <Route path="sales" element={<ModernSalesScreen />} />

                    {/* Orders */}
                    <Route path="orders" element={<OrderHistory />} />
                    <Route path="orders/detail/:id" element={<OrderDetailFullScreen />} />

                    {/* Order test / debug */}
                    {/* <Route path="orders/test" element={<OrderDataTest />} /> */}

                    {/* Customers */}
                    <Route path="customers" element={<CustomerManagement />} />

                    {/* Products */}
                    <Route path="products" element={<ProductManagement />} />

                    {/* Inventory */}
                    <Route path="inventory/stock-in" element={<StockInManagement />} />
                    <Route path="inventory/stock-out" element={<StockOutManagement />} />
                    <Route path="inventory" element={<InventoryManagement />} />
                    <Route path="inventory/history" element={<InventoryTransactionHistory />} />
                </Route>

                {/* ========== PUBLIC (INSIDE LAYOUT) ========== */}
                <Route path="help" element={<HelpCenter />} />

                {/* ERROR */}
                <Route path="403" element={<Forbidden403 />} />
                <Route path="*" element={<NotFound404 />} />
            </Route>

        </Routes>
    );
}
