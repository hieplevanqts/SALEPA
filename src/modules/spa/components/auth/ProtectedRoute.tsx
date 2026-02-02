// components/auth/RequireRole.tsx
import { Navigate, Outlet } from "react-router-dom";

type UserRole = "admin" | "cashier" | "technician" ;

interface RequireRoleProps {
  allow: UserRole[];
}

export default function RequireRole({ allow }: RequireRoleProps) {
  const authRaw = localStorage.getItem("auth");

  // ❌ Chưa đăng nhập
  if (!authRaw) {
    return <Navigate to="/spa/login" replace />;
  }

  const auth = JSON.parse(authRaw);

  // ❌ Có đăng nhập nhưng sai quyền → 403
  if (!allow.includes(auth.role)) {
    return <Navigate to="/spa/403" replace />;
  }

  // ✅ OK
  return <Outlet />;
}
