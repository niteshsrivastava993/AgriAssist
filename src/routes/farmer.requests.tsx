import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useT, type Key } from "@/lib/i18n";
import { useDB, marketService } from "@/services/store";
import { priceIn } from "@/services/calc";
import { Button, DemoBadge, Empty, PageHeader, Pill, Segmented, Spinner, inr } from "@/components/ui-kit";

export const Route = createFileRoute("/farmer/requests")({
  head: () => ({ meta: [
    { title: "Purchase Requests — AgriAssist" },
    { name: "description", content: "Review, accept or decline buyer requests for your produce." },
    { property: "og:title", content: "Purchase Requests — AgriAssist" },
    { property: "og:description", content: "Buyers waiting on your decision." },
  ] }),
  component: RequestsPage,
});

type F = "pending" | "accepted" | "rejected" | "cancelled" | "all";

function RequestsPage() {
  const { user } = useAuth();
  const { t, d } = useT();
  const db = useDB();
  const [filter, setFilter] = useState<F>("pending");
  const [busy, setBusy] = useState<string | null>(null);
  const myIds = new Set(db.listings.filter((l) => l.farmerId === user?.id).map((l) => l.id));
  const all = db.requests.filter((r) => myIds.has(r.listingId));
  const shown = all.filter((r) => filter === "all" || r.status === filter);
  const count = (s: F) => all.filter((r) => s === "all" || r.status === s).length;

  const decide = async (id: string, status: "accepted" | "rejected") => {
    setBusy(id);
    try {
      await marketService.setRequestStatus(id, status);
      toast.success(status === "accepted" ? t("toastAccepted") : t("toastDeclined"));
    } catch (e) {
      const r = db.requests.find((x) => x.id === id); const l = r && db.listings.find((x) => x.id === r.listingId);
      toast.error(e instanceof Error && e.message === "errOverStock" && l && r ? t("errAcceptStock", { n: `${Math.round(l.quantityQtl * 100) / 100} ${t("unit_qtl")}` }) : t("errGeneric"));
    } finally { setBusy(null); }
  };

  return (
    <div className="page-enter mx-auto max-w-7xl px-5 py-10">
      <PageHeader eyebrow={t("navRequests")} title={t("requestsTitle", { n: count("pending") })} sub={t("requestsSub")} />
      <div className="mt-8"><Segmented label={t("filter")} value={filter} onChange={setFilter}
        options={(["pending", "accepted", "rejected", "cancelled", "all"] as F[]).map((s) => ({ id: s, label: `${s === "all" ? t("all") : t(`st_${s}` as Key)} (${count(s)})` }))} /></div>
      {shown.length === 0 ? <div className="mt-8"><Empty action={<Link to="/farmer/listings" className="font-semibold text-primary hover:underline">{t("navListings")} →</Link>}>{t("noRequestsHere")}</Empty></div> : (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {shown.map((r) => {
            const l = db.listings.find((x) => x.id === r.listingId)!;
            const asking = priceIn(l, r.mode, r.unit) ?? r.unitPrice;
            const diff = Math.round((r.unitPrice - asking) * 100) / 100;
            return (
              <article key={r.id} className="clay flex flex-col p-6">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="text-lg font-semibold">{r.buyerName}</p><p className="text-sm text-muted-foreground">{r.buyerBusiness} · {d(r.createdAt)}</p></div>
                  <div className="flex gap-2">{r.isSample && <DemoBadge />}<Pill tone={r.status === "accepted" ? "good" : r.status === "rejected" || r.status === "cancelled" ? "bad" : "warn"}>{t(`st_${r.status}` as Key)}</Pill></div>
                </div>
                <div className="mt-5 flex items-center gap-4">
                  <img src={l.image} alt="" className="h-14 w-14 rounded-xl object-cover" />
                  <div className="text-sm">
                    <p><span className="font-semibold">{r.quantity} {t(`unit_${r.unit}` as Key)}</span> {l.crop} · {inr(r.unitPrice)}/{t(`unit_${r.unit}` as Key)}</p>
                    <p className="text-xs text-muted-foreground">{t(`mode_${r.mode}` as Key)} · {t("stockLeft", { n: `${Math.round(l.quantityQtl * 100) / 100} ${t("unit_qtl")}` })}</p>
                    <p className={diff >= 0 ? "text-primary" : "text-destructive"}>{diff === 0 ? t("atAsking") : diff > 0 ? t("aboveAsking", { v: inr(diff) }) : t("belowAsking", { v: inr(-diff) })}</p>
                  </div>
                  <p className="ml-auto font-display text-2xl font-semibold">{inr(r.quantity * r.unitPrice)}</p>
                </div>
                {r.message && <p className="mt-4 rounded-xl bg-muted p-3 text-sm">“{r.message}”</p>}
                {r.status === "pending" && (
                  <div className="mt-5 flex justify-end gap-2">
                    {busy === r.id ? <Spinner /> : <>
                      <Button size="sm" variant="danger" onClick={() => decide(r.id, "rejected")}><X className="h-4 w-4" />{t("reject")}</Button>
                      <Button size="sm" disabled={r.quantityQtl > l.quantityQtl} title={r.quantityQtl > l.quantityQtl ? t("errAcceptStock", { n: `${l.quantityQtl} ${t("unit_qtl")}` }) : undefined} onClick={() => decide(r.id, "accepted")}><Check className="h-4 w-4" />{t("accept")}</Button>
                    </>}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
