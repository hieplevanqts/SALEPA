import { Routes, Route, useNavigate } from 'react-router-dom';

import MainLayout from "../layouts/ModuleLayout";
import RequireRole from '../components/auth/ProtectedRoute';
// screens / pages
import Dashboard from '../pages/dashboard/Dashboard';
import ModernSalesScreen from '../pages/sales/ModernSalesScreen';
import ProductManagement from '../pages/products/ProductManagement';
import OrderHistory from '../pages/orders/OrderHistory';
import Reports from '../pages/reports/Reports';
import Settings from '../pages/settings/Settings';
import CustomerView from '../pages/customers/CustomerView';
import CustomerManagement from '../pages/customers/CustomerManagement';
import ProductCategoryManagement from '../pages/products/ProductCategoryManagement';
import TableAreaManagement from '../pages/tables/TableAreaManagement';
import SupplierManagement from '../pages/suppliers/SupplierManagement';
import UserManagement from '../pages/users/UserManagement';
import RoleGroupManagement from '../pages/users/RoleGroupManagement';
// import AppointmentManagement from './components/AppointmentManagement';
import TableManagement from '../pages/tables/TableManagement';
import KitchenOrdersScreen from '../pages/kitchen/KitchenOrdersScreen';
import KitchenView from '../pages/kitchen/KitchenView';
import StockInManagement from '../pages/inventory/StockInManagement';
import StockOutManagement from '../pages/inventory/StockOutManagement';
import OrderManagement from '../pages/orders/OrderManagement';
import HelpCenter from '../pages/help/HelpCenter';
import ProfileMenu from '../components/common/ProfileMenu';

import LoginScreen, { type LoginPayload } from '../pages/auth/LoginScreen';
import Forbidden403 from '../pages/errors/Forbidden403';
import NotFound404 from '../pages/errors/NotFound404';

export default function RestaurantRouter() {
    const navigate = useNavigate();
    const handleLogin = (payload: LoginPayload) => {
        console.log('LOGIN', payload);

        localStorage.setItem('auth', JSON.stringify(payload));

        if (payload.role === 'admin') {
            navigate('/restaurant/');
        } else if (payload.role === 'cashier') {
            navigate('/restaurant/sales');
        }else if (payload.role === 'technician') {
            navigate('/restaurant/kitchen/orders');
        } 
    };
    const handleLogout = () => {
        localStorage.removeItem('auth');
        localStorage.removeItem('salepa_isLoggedIn');
        localStorage.removeItem('salepa_username');
        localStorage.removeItem('salepa_rememberMe');
        localStorage.removeItem('salepa_userRole');
        navigate('/restaurant/login');
    };
    return (
            <Routes>
      {/* ===== AUTH (NO LAYOUT) ===== */}
      <Route path="login" element={<LoginScreen onLogin={handleLogin} />} />

      {/* ===== APP ===== */}
       <Route element={<RequireRole allow={['technician', 'admin', 'cashier']} />}>
        <Route element={<MainLayout />}>

          {/* ===== DASHBOARD ===== */}
          <Route index element={<Dashboard />} />

          {/* ===== ADMIN ONLY ===== */}
          <Route element={<RequireRole allow={['admin']} />}>
            <Route path="users" element={<UserManagement />} />
            <Route path="roles" element={<RoleGroupManagement />} />

            <Route path="product-categories" element={<ProductCategoryManagement />} />
            <Route path="suppliers" element={<SupplierManagement />} />

            <Route path="settings" element={<Settings />} />
            <Route
              path="profile"
              element={<ProfileMenu onClose={() => navigate(-1)} onLogout={handleLogout} />}
            />
            <Route
              path="help"
              element={<HelpCenter onClose={() => navigate(-1)} />}
            />
          </Route>

          {/* ===== ADMIN + CASHIER ===== */}
          <Route element={<RequireRole allow={['admin', 'cashier']} />}>
            <Route path="sales" element={<ModernSalesScreen />} />
            {/* <Route path="cashier" element={<CashierView />} /> */}
            {/* <Route path="self-service" element={<SelfServiceScreen />} /> */}

            <Route path="orders" element={<OrderHistory />} />
            <Route path="orders/manage" element={<OrderManagement />} />

            <Route path="customers" element={<CustomerManagement />} />
          </Route>

          {/* ===== ALL ROLES ===== */}
          <Route element={<RequireRole allow={['technician', 'admin', 'cashier']} />}>
            <Route path="products" element={<ProductManagement />} />

            <Route path="inventory/stock-in" element={<StockInManagement />} />
            <Route path="inventory/stock-out" element={<StockOutManagement />} />

            <Route path="tables" element={<TableManagement />} />
            <Route path="tables/areas" element={<TableAreaManagement />} />

            <Route path="kitchen" element={<KitchenView />} />
            <Route path="kitchen/orders" element={<KitchenOrdersScreen />} />

            <Route path="reports" element={<Reports />} />
            <Route path="reports/:type" element={<Reports />} />

            <Route path="customer-view" element={<CustomerView />} />
          </Route>
      
          {/* ===== ERRORS ===== */}
          <Route path="403" element={<Forbidden403 />} />
          <Route path="*" element={<NotFound404 />} />

        </Route>
      </Route>
    </Routes>
    );
}
