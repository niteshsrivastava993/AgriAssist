import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { RoleGuard } from "@/components/RoleGuard";
import { useT, type Key } from "@/lib/i18n";

export const Route = createFileRoute("/farmer")({
  component: FarmerLayout,
});

const tabs: { to: string; k: Key; exact?: boolean }[] = [
  { to: "/farmer", k: "overview", exact: true },
  { to: "/farmer/fields", k: "navFields" },
  { to: "/farmer/crops", k: "navCrops" },
  { to: "/farmer/calendar", k: "navCalendar" },
  { to: "/farmer/advisory", k: "navAdvisory" },
  { to: "/farmer/health", k: "navHealth" },
  { to: "/farmer/weather", k: "navWeather" },
  { to: "/farmer/finance", k: "navFinance" },
  { to: "/farmer/listings", k: "navListings" },
  { to: "/farmer/requests", k: "navRequests" },
  { to: "/farmer/profile", k: "navProfile" },
];

// Role guard: only farmers may render the farmer workspace.
function FarmerLayout() {
  const { t } = useT();
  return (
    <RoleGuard roles={["farmer"]}>
      <div className="border-b border-border/60 bg-background">
        <nav aria-label={t("myFarm")} className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-5 py-2 [scrollbar-width:none]">
          {tabs.map((tab) => (
            <Link key={tab.to} to={tab.to} activeOptions={{ exact: !!tab.exact }}
              className="whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
              activeProps={{ className: "!text-primary bg-secondary" }}>{t(tab.k)}</Link>
          ))}
        </nav>
      </div>
      <Outlet />
    </RoleGuard>
  );
}
