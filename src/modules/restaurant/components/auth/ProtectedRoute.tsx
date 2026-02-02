// components/auth/RequireRole.tsx
import { Navigate, Outlet } from "react-router-dom";

type UserRole = "admin" | "cashier" | "technician";



interface RequireRoleProps {
  allow: string[];
}

export default function RequireRole({ allow }: RequireRoleProps) {
  const authRaw = localStorage.getItem('auth');

  // ❌ Chưa đăng nhập
  if (!authRaw || authRaw === null) {
    return <Navigate to="/restaurant/login" replace />;
  }

  let auth: { role?: string };

  try {
    auth = JSON.parse(authRaw);
  } catch {
    // ❌ Auth bị hỏng → coi như logout
    localStorage.removeItem('auth');
    return <Navigate to="/restaurant/login" replace />;
  }

  // ❌ Không có role
  if (!auth.role) {
    return <Navigate to="/restaurant/login" replace />;
  }

  // ❌ Sai quyền
  if (!allow.includes(auth.role)) {
    return <Navigate to="/restaurant/403" replace />;
  }

  // ✅ OK
  return <Outlet />;
}

