import { createFileRoute, Link } from "@tanstack/react-router";
import { useT, type Key } from "@/lib/i18n";
import { useDB } from "@/services/store";
import { DemoBadge, PageHeader, Pill, buttonVariants, inr } from "@/components/ui-kit";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [
    { title: "Admin Overview — AgriAssist" },
    { name: "description", content: "Platform health: users, listings and trade activity." },
    { property: "og:title", content: "Admin Overview — AgriAssist" },
    { property: "og:description", content: "Platform activity at a glance." },
  ] }),
  component: AdminOverview,
});

function AdminOverview() {
  const { t, d } = useT();
  const db = useDB();
  const farmers = db.users.filter((u) => u.role === "farmer").length;
  const buyers = db.users.filter((u) => u.role === "buyer").length;
  const suspended = db.users.filter((u) => u.status === "suspended");
  const active = db.listings.filter((l) => l.status === "active");
  const accepted = db.requests.filter((r) => r.status === "accepted");
  const tradeValue = accepted.reduce((s, r) => s + r.quantityQtl * r.offerPerQtl, 0);
  const byState = Object.entries(active.reduce<Record<string, number>>((m, l) => ({ ...m, [l.state]: (m[l.state] ?? 0) + 1 }), {})).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...byState.map((x) => x[1]));
  const recent = [...db.requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);

  return (
    <div className="page-enter mx-auto max-w-7xl px-5 py-10">
      <PageHeader eyebrow={t("navAdmin")} title={t("adminTitle")} demo actions={<Link to="/admin/manage" className={buttonVariants({})}>{t("navManage")}</Link>} />
      {/* Narrative summary instead of stat cards */}
      <p className="mt-10 max-w-4xl font-display text-2xl leading-relaxed md:text-3xl">
        {t("adminNarrative", { farmers, buyers, listings: active.length, pending: db.requests.filter((r) => r.status === "pending").length, value: inr(tradeValue) })}
      </p>
      {suspended.length > 0 && <p className="mt-4 text-sm font-semibold text-destructive">{t("suspendedCount", { n: suspended.length })}</p>}

      <section className="mt-14 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h2 className="text-2xl font-semibold">{t("listingsByState")}</h2>
          <ul className="mt-6 space-y-4">
            {byState.map(([s, n]) => (
              <li key={s}>
                <div className="flex justify-between text-sm"><span className="font-semibold">{s}</span><span>{n}</span></div>
                <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${(n / max) * 100}%` }} /></div>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-7">
          <h2 className="text-2xl font-semibold">{t("recentTrades")}</h2>
          <ol className="relative mt-6 space-y-6 border-l-2 border-sage pl-6">
            {recent.map((r) => {
              const l = db.listings.find((x) => x.id === r.listingId);
              return (
                <li key={r.id} className="relative">
                  <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-accent" />
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{r.buyerName} → {l?.farmerName}: {r.quantityQtl} qtl {l?.crop}</p>
                    <Pill tone={r.status === "accepted" ? "good" : r.status === "rejected" ? "bad" : "warn"}>{t(`st_${r.status}` as Key)}</Pill>
                    {r.isSample && <DemoBadge />}
                  </div>
                  <p className="text-sm text-muted-foreground">{d(r.createdAt)} · {inr(r.quantityQtl * r.offerPerQtl)}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>
    </div>
  );
}
