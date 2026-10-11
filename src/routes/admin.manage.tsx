import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { useT, type Key } from "@/lib/i18n";
import { useDB, adminService } from "@/services/store";
import { Button, DemoBadge, Empty, PageHeader, Pill, Segmented, inr, inputCls } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/manage")({
  head: () => ({ meta: [
    { title: "Users & Listings — AgriAssist Admin" },
    { name: "description", content: "Suspend accounts and moderate marketplace listings." },
    { property: "og:title", content: "User & Listing Management — AgriAssist" },
    { property: "og:description", content: "Moderate the shared marketplace." },
  ] }),
  component: ManagePage,
});

function ManagePage() {
  const { t } = useT();
  const db = useDB();
  const [tab, setTab] = useState<"users" | "listings">("users");
  const [q, setQ] = useState("");
  const [role, setRole] = useState<"all" | "farmer" | "buyer">("all");
  const term = q.trim().toLowerCase();
  const users = db.users.filter((u) => u.role !== "admin" && (role === "all" || u.role === role) && (!term || `${u.name} ${u.email} ${u.location}`.toLowerCase().includes(term)));
  const listings = db.listings.filter((l) => !term || `${l.crop} ${l.variety} ${l.farmerName} ${l.state}`.toLowerCase().includes(term));

  const setUser = async (id: string, status: "active" | "suspended") => {
    try { await adminService.setUserStatus(id, status); toast.success(status === "suspended" ? t("userSuspended") : t("userRestored")); }
    catch { toast.error(t("errGeneric")); }
  };
  const setListing = async (id: string, status: "active" | "paused") => { await adminService.setListingStatus(id, status); toast.success(t("listingUpdated")); };

  return (
    <div className="page-enter mx-auto max-w-7xl px-5 py-10">
      <PageHeader eyebrow={t("navAdmin")} title={t("navManage")} sub={t("manageSub")} />
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Segmented label={t("view")} value={tab} onChange={setTab} options={[{ id: "users", label: `${t("users")} (${db.users.length - 1})` }, { id: "listings", label: `${t("listings")} (${db.listings.length})` }]} />
        <label className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input aria-label={t("search")} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search")} className={cn(inputCls, "rounded-full pl-11")} />
        </label>
        {tab === "users" && <select aria-label={t("role")} value={role} onChange={(e) => setRole(e.target.value as typeof role)} className="rounded-full border border-input bg-card px-4 py-2.5 text-sm font-semibold">
          <option value="all">{t("allRoles")}</option><option value="farmer">{t("roleFarmer")}</option><option value="buyer">{t("roleBuyer")}</option></select>}
      </div>

      {tab === "users" ? (
        users.length === 0 ? <div className="mt-8"><Empty>{t("noMatches")}</Empty></div> :
        <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase text-muted-foreground"><tr><th className="p-4">{t("fullName")}</th><th className="p-4">{t("role")}</th><th className="p-4">{t("location")}</th><th className="p-4">{t("activity")}</th><th className="p-4">{t("status")}</th><th className="p-4" /></tr></thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => {
                const suspended = u.status === "suspended";
                const n = u.role === "farmer" ? db.listings.filter((l) => l.farmerId === u.id).length : db.requests.filter((r) => r.buyerId === u.id).length;
                return (
                  <tr key={u.id}>
                    <td className="p-4"><p className="font-semibold">{u.name}</p><p className="text-xs text-muted-foreground">{u.email}</p></td>
                    <td className="p-4">{u.role === "farmer" ? t("roleFarmer") : t("roleBuyer")}</td>
                    <td className="p-4 text-muted-foreground">{u.location}</td>
                    <td className="p-4">{u.role === "farmer" ? t("nListings", { n }) : t("nRequests", { n })}</td>
                    <td className="p-4"><Pill tone={suspended ? "bad" : "good"}>{suspended ? t("suspended") : t("active")}</Pill></td>
                    <td className="p-4 text-right">{suspended ? <Button size="sm" variant="soft" onClick={() => setUser(u.id, "active")}>{t("restore")}</Button> : <Button size="sm" variant="danger" onClick={() => setUser(u.id, "suspended")}>{t("suspend")}</Button>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        listings.length === 0 ? <div className="mt-8"><Empty>{t("noMatches")}</Empty></div> :
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {listings.map((l) => (
            <li key={l.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
              <img src={l.image} alt="" className="h-16 w-16 rounded-xl object-cover" />
              <div className="flex-1 text-sm">
                <div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{l.crop} · {l.variety}</p>{l.isSample && <DemoBadge />}</div>
                <p className="text-muted-foreground">{l.farmerName} · {l.state} · {l.quantityQtl} qtl · {inr(l.pricePerQtl)}</p>
                <div className="mt-1"><Pill tone={l.status === "active" ? "good" : l.status === "paused" ? "warn" : "muted"}>{t(`ls_${l.status}` as Key)}</Pill></div>
              </div>
              {l.status === "active" && <Button size="sm" variant="danger" onClick={() => setListing(l.id, "paused")}>{t("hide")}</Button>}
              {l.status === "paused" && <Button size="sm" variant="soft" onClick={() => setListing(l.id, "active")}>{t("restore")}</Button>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
