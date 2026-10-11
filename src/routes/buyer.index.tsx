import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Phone, MapPin } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useT, type Key } from "@/lib/i18n";
import { useDB, marketService } from "@/services/store";
import { Button, DemoBadge, Empty, PageHeader, Pill, Segmented, buttonVariants, inr } from "@/components/ui-kit";

export const Route = createFileRoute("/buyer/")({
  head: () => ({ meta: [
    { title: "My Requests & Orders — AgriAssist" },
    { name: "description", content: "Track purchase requests you've sent and confirmed orders." },
    { property: "og:title", content: "Buyer Requests & Orders — AgriAssist" },
    { property: "og:description", content: "Your sourcing pipeline in one place." },
  ] }),
  component: BuyerOrders,
});

function BuyerOrders() {
  const { user } = useAuth();
  const { t, d } = useT();
  const db = useDB();
  const [tab, setTab] = useState<"open" | "orders" | "closed">("open");
  const mine = db.requests.filter((r) => r.buyerId === user?.id);
  const groups = { open: mine.filter((r) => r.status === "pending"), orders: mine.filter((r) => r.status === "accepted"), closed: mine.filter((r) => r.status === "rejected" || r.status === "cancelled") };
  const list = groups[tab];
  const orderValue = groups.orders.reduce((s, r) => s + r.quantity * r.unitPrice, 0);

  return (
    <div className="page-enter mx-auto max-w-7xl px-5 py-10">
      <PageHeader eyebrow={t("navOrders")} title={<>{t("confirmedValue")} <span className="text-primary">{inr(orderValue)}</span></>} sub={t("buyerSub")}
        actions={<Link to="/marketplace" className={buttonVariants({ variant: "harvest" })}>{t("browseMarket")}</Link>} />
      <div className="mt-8"><Segmented label={t("filter")} value={tab} onChange={setTab} options={[
        { id: "open", label: `${t("awaiting")} (${groups.open.length})` }, { id: "orders", label: `${t("orders")} (${groups.orders.length})` }, { id: "closed", label: `${t("declined")} (${groups.closed.length})` }]} /></div>

      {list.length === 0 ? <div className="mt-8"><Empty action={<Link to="/marketplace" className={buttonVariants({ variant: "soft" })}>{t("browseMarket")}</Link>}>{t("nothingHere")}</Empty></div> : (
        <ul className="mt-8 space-y-4">
          {list.map((r) => {
            const l = db.listings.find((x) => x.id === r.listingId);
            const farmer = db.users.find((u) => u.id === l?.farmerId);
            return (
              <li key={r.id} className="grid items-center gap-5 rounded-3xl border border-border bg-card p-5 md:grid-cols-12">
                {l && <img src={l.image} alt="" className="h-20 w-20 rounded-2xl object-cover md:col-span-1" />}
                <div className="md:col-span-5">
                  <div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-semibold">{l?.crop ?? t("listingRemoved")}</h2><Pill tone={r.status === "accepted" ? "good" : r.status === "rejected" || r.status === "cancelled" ? "bad" : "warn"}>{t(`st_${r.status}` as Key)}</Pill>{r.isSample && <DemoBadge />}</div>
                  <p className="text-sm text-muted-foreground">{l?.variety} · {l?.farmerName} · {t("sent")} {d(r.createdAt)}</p>
                </div>
                <div className="text-sm md:col-span-3">
                  <p className="text-xs text-muted-foreground">{t(`mode_${r.mode}` as Key)}</p>
                  <p>{r.quantity} {t(`unit_${r.unit}` as Key)} × {inr(r.unitPrice)}/{t(`unit_${r.unit}` as Key)}</p>
                  <p className="font-display text-xl font-semibold">{inr(r.quantity * r.unitPrice)}</p>
                </div>
                <div className="text-sm md:col-span-3 md:text-right">
                  {r.status === "pending" && <Button size="sm" variant="danger" onClick={async () => { await marketService.cancelRequest(r.id); toast.success(t("requestCancelled")); }}>{t("cancelRequest")}</Button>}
                  {r.status === "accepted" && l && (
                    <div className="space-y-1">
                      <Button size="sm" variant="danger" className="mb-2" onClick={async () => { if (!confirm(t("confirmCancelOrder"))) return; await marketService.cancelRequest(r.id); toast.success(t("stockReturned")); }}>{t("cancelOrder")}</Button>
                      <p className="flex items-center gap-1.5 md:justify-end"><MapPin className="h-4 w-4 text-primary" />{t("pickup")}: {l.location}, {l.state}</p>
                      <p className="flex items-center gap-1.5 md:justify-end"><Phone className="h-4 w-4 text-primary" />{farmer?.phone ?? t("contactShared")}</p>
                    </div>
                  )}
                  {r.status === "rejected" && <Link to="/marketplace" className="font-semibold text-primary hover:underline">{t("findSimilar")} →</Link>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-12 text-center text-xs text-muted-foreground">{t("noPaymentsNote")}</p>
    </div>
  );
}
