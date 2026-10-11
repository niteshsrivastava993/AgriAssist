import { Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useAuth, homeFor } from "@/lib/auth";
import { useT } from "@/lib/i18n";
import type { Role } from "@/data/mockData";

// Route-level access control: renders children/Outlet only for allowed roles.
export function RoleGuard({ roles, children }: { roles: Role[]; children?: ReactNode }) {
  const { user, ready } = useAuth();
  const { t } = useT();
  const navigate = useNavigate();
  const allowed = !!user && roles.includes(user.role);
  useEffect(() => {
    if (!ready) return;
    if (!user) navigate({ to: "/login" });
    else if (!roles.includes(user.role)) navigate({ to: homeFor(user.role) });
  }, [ready, user, navigate, roles]);
  if (!ready || !allowed) return <div className="p-20 text-center text-muted-foreground">{t("checkingAccess")}</div>;
  return <>{children ?? <Outlet />}</>;
}
