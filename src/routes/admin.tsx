import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { RoleGuard } from "@/components/RoleGuard";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { t } = useT();
  const cls = "whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground";
  return (
    <RoleGuard roles={["admin"]}>
      <div className="border-b border-border/60">
        <nav className="mx-auto flex max-w-7xl gap-1 px-5 py-2">
          <Link to="/admin" activeOptions={{ exact: true }} className={cls} activeProps={{ className: "!text-primary bg-secondary" }}>{t("overview")}</Link>
          <Link to="/admin/manage" className={cls} activeProps={{ className: "!text-primary bg-secondary" }}>{t("navManage")}</Link>
        </nav>
      </div>
      <Outlet />
    </RoleGuard>
  );
}
