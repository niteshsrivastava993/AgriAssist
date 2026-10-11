import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Plus, Pause, Play, CheckCircle2, Trash2, Pencil } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useT, type Key } from "@/lib/i18n";
import { useDB, marketService } from "@/services/store";
import { cropOptions, type Listing, type QtyUnit } from "@/data/mockData";
import { SaleInfo } from "@/components/SaleInfo";
import { useQty } from "@/components/LocationPicker";
import { toQtl, fromQtl, KG_PER_UNIT } from "@/services/calc";
import { Button, DemoBadge, Drawer, Empty, Field, PageHeader, Pill, Spinner, inr, inputCls, type FormErrors } from "@/components/ui-kit";

export const Route = createFileRoute("/farmer/listings")({
  validateSearch: (s: Record<string, unknown>): { crop?: string } => (typeof s["crop"] === "string" ? { crop: s["crop"] } : {}),
  head: () => ({ meta: [
    { title: "My Listings — AgriAssist" },
    { name: "description", content: "Publish, edit, pause and close your produce listings." },
    { property: "og:title", content: "My Listings — AgriAssist" },
    { property: "og:description", content: "Your lots on the shared marketplace." },
  ] }),
  component: ListingsPage,
});

const tone = { active: "good", paused: "warn", sold: "muted" } as const;

function ListingsPage() {
  const { user } = useAuth();
  const { t, d } = useT();
  const db = useDB();
  const search = Route.useSearch();
  const qty = useQty();
  const [editing, setEditing] = useState<Listing | "new" | null>(search.crop ? "new" : null);
  const mine = db.listings.filter((l) => l.farmerId === user?.id);

  const act = async (l: Listing, status: Listing["status"]) => { await marketService.updateListing(l.id, { status }); toast.success(t("listingUpdated")); };
  const del = async (l: Listing) => { if (!confirm(t("confirmDelete"))) return; await marketService.deleteListing(l.id); toast.success(t("listingDeleted")); };

  return (
    <div className="page-enter mx-auto max-w-7xl px-5 py-10">
      <PageHeader eyebrow={t("navListings")} title={t("listingsTitle", { n: mine.filter((l) => l.status === "active").length })} sub={t("listingsSub")}
        actions={<Button variant="harvest" onClick={() => setEditing("new")}><Plus className="h-4 w-4" />{t("newListing")}</Button>} />
      {mine.length === 0 ? <div className="mt-10"><Empty action={<Button onClick={() => setEditing("new")}>{t("newListing")}</Button>}>{t("noListings")}</Empty></div> : (
        <ul className="mt-10 space-y-4">
          {mine.map((l) => {
            const reqs = db.requests.filter((r) => r.listingId === l.id);
            const pending = reqs.filter((r) => r.status === "pending").length;
            return (
              <li key={l.id} className="grid items-center gap-5 rounded-3xl border border-border bg-card p-4 md:grid-cols-12">
                <img src={l.image} alt={l.crop} className="aspect-square w-24 rounded-2xl object-cover md:col-span-1 md:w-full" />
                <div className="md:col-span-4">
                  <div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-semibold">{l.crop}</h2><Pill tone={tone[l.status]}>{t(`ls_${l.status}` as Key)}</Pill>{l.isSample && <DemoBadge />}</div>
                  <p className="text-sm text-muted-foreground">{l.variety} · {t("grade")} {l.grade} · {l.location}</p>
                </div>
                <div className="text-sm md:col-span-3">
                  <SaleInfo listing={l} />
                  <p className="mt-1.5 text-muted-foreground">{t("stockLeft", { n: qty(l.quantityQtl, "qtl") })} · {t("from")} {d(l.availableFrom)}</p>
                </div>
                <div className="text-sm md:col-span-1">
                  {pending > 0 ? <Link to="/farmer/requests" className="font-semibold text-accent hover:underline">{t("nPending", { n: pending })}</Link> : <span className="text-muted-foreground">{t("nRequests", { n: reqs.length })}</span>}
                </div>
                <div className="flex flex-wrap gap-1.5 md:col-span-3 md:justify-end">
                  <Button size="sm" variant="ghost" onClick={() => setEditing(l)} aria-label={t("edit")}><Pencil className="h-4 w-4" /></Button>
                  {l.status === "active" && <Button size="sm" variant="soft" onClick={() => act(l, "paused")}><Pause className="h-4 w-4" />{t("pause")}</Button>}
                  {l.status === "paused" && <Button size="sm" variant="soft" onClick={() => act(l, "active")}><Play className="h-4 w-4" />{t("resume")}</Button>}
                  {l.status !== "sold" && <Button size="sm" variant="outline" onClick={() => act(l, "sold")}><CheckCircle2 className="h-4 w-4" />{t("markSold")}</Button>}
                  <Button size="sm" variant="danger" onClick={() => del(l)} aria-label={t("remove")}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {editing && <ListingForm listing={editing === "new" ? null : editing} presetCrop={search.crop} onClose={() => setEditing(null)} />}
    </div>
  );
}

const r2 = (n: number) => Math.round(n * 100) / 100;

function ListingForm({ listing, presetCrop, onClose }: { listing: Listing | null; presetCrop?: string | undefined; onClose: () => void }) {
  const { user } = useAuth();
  const { t } = useT();
  const fmt = useQty();
  const [f, setF] = useState({
    crop: listing?.crop ?? (presetCrop && cropOptions.includes(presetCrop) ? presetCrop : cropOptions[0]!), variety: listing?.variety ?? "",
    grade: listing?.grade ?? "A",
    location: listing?.location ?? user?.location.split(",")[0] ?? "", availableFrom: listing?.availableFrom ?? new Date().toISOString().slice(0, 10),
    stock: listing ? String(listing.quantityQtl) : "", stockUnit: "qtl" as QtyUnit,
    regOn: listing ? !!listing.regular : true, priceKg: String(listing?.regular?.pricePerKg ?? ""), minKg: String(listing?.regular?.minKg ?? "10"),
    bulkOn: listing ? !!listing.bulk : false, bulkUnit: "qtl" as QtyUnit, bulkPrice: String(listing?.bulk?.pricePerQtl ?? ""), minBulk: String(listing?.bulk?.minQtl ?? "5"),
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const set = (p: Partial<typeof f>) => setF({ ...f, ...p });
  // Convert bulk fields when switching between qtl and ton so the meaning stays the same.
  const setBulkUnit = (u: QtyUnit) => {
    const ratio = KG_PER_UNIT[u] / KG_PER_UNIT[f.bulkUnit];
    set({ bulkUnit: u, bulkPrice: f.bulkPrice ? String(r2(Number(f.bulkPrice) * ratio)) : "", minBulk: f.minBulk ? String(r2(Number(f.minBulk) / ratio)) : "" });
  };
  const setStockUnit = (u: QtyUnit) => set({ stockUnit: u, stock: f.stock ? String(r2(fromQtl(toQtl(Number(f.stock), f.stockUnit), u))) : "" });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const er: FormErrors = {};
    const stockQtl = toQtl(Number(f.stock), f.stockUnit);
    if (!f.variety.trim()) er.variety = t("errRequired");
    if (!(Number(f.stock) > 0)) er.stock = t("errQty");
    if (!f.regOn && !f.bulkOn) er.mode = t("errModeNeeded");
    if (f.regOn) {
      if (!(Number(f.priceKg) > 0)) er.priceKg = t("errAmount");
      if (!(Number(f.minKg) > 0)) er.minKg = t("errQty"); else if (stockQtl > 0 && Number(f.minKg) / 100 > stockQtl) er.minKg = t("errMinOverStock");
    }
    if (f.bulkOn) {
      if (!(Number(f.bulkPrice) > 0)) er.priceBulk = t("errAmount");
      if (!(Number(f.minBulk) > 0)) er.minBulk = t("errQty"); else if (stockQtl > 0 && toQtl(Number(f.minBulk), f.bulkUnit) > stockQtl) er.minBulk = t("errMinOverStock");
    }
    if (!f.location.trim()) er.location = t("errRequired");
    setErrors(er);
    if (Object.keys(er).length || !user) return;
    const regular = f.regOn ? { pricePerKg: r2(Number(f.priceKg)), minKg: r2(Number(f.minKg)) } : undefined;
    const bulk = f.bulkOn ? { pricePerQtl: r2(Number(f.bulkPrice) / (KG_PER_UNIT[f.bulkUnit] / 100)), minQtl: r2(toQtl(Number(f.minBulk), f.bulkUnit)) } : undefined;
    const common = { quantityQtl: r2(stockQtl), pricePerQtl: bulk ? bulk.pricePerQtl : r2((regular?.pricePerKg ?? 0) * 100), availableFrom: f.availableFrom, regular, bulk };
    setLoading(true);
    if (listing) await marketService.updateListing(listing.id, common);
    else await marketService.createListing({ farmerId: user.id, farmerName: user.name, crop: f.crop, variety: f.variety.trim(), grade: f.grade, location: f.location.trim(), state: user.location.split(",")[1]?.trim() || "India", ...common });
    setLoading(false); toast.success(listing ? t("listingUpdated") : t("listingPublished")); onClose();
  };
  const locked = !!listing;
  const unitSel = (v: QtyUnit, on: (u: QtyUnit) => void, opts: QtyUnit[], label: string) => (
    <select aria-label={label} className={inputCls} value={v} onChange={(e) => on(e.target.value as QtyUnit)}>{opts.map((u) => <option key={u} value={u}>{t(`unit_${u}` as Key)}</option>)}</select>
  );
  return (
    <Drawer title={listing ? t("editListing") : t("newListing")} eyebrow={t("navListings")} onClose={onClose}>
      <form onSubmit={submit} noValidate className="flex flex-1 flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("crop")}><select disabled={locked} className={inputCls} value={f.crop} onChange={(e) => set({ crop: e.target.value })}>{cropOptions.map((c) => <option key={c}>{c}</option>)}</select></Field>
          <Field label={t("grade")}><select disabled={locked} className={inputCls} value={f.grade} onChange={(e) => set({ grade: e.target.value })}>{["Premium", "A", "B", "FAQ"].map((g) => <option key={g}>{g}</option>)}</select></Field>
        </div>
        <Field label={t("variety")} error={errors.variety}><input disabled={locked} className={inputCls} value={f.variety} onChange={(e) => set({ variety: e.target.value })} /></Field>
        <div className="grid grid-cols-[1fr_7rem] gap-3">
          <Field label={t("totalStock")} error={errors.stock}><input inputMode="decimal" className={inputCls} value={f.stock} onChange={(e) => set({ stock: e.target.value })} /></Field>
          <Field label={t("unit")}>{unitSel(f.stockUnit, setStockUnit, ["kg", "qtl", "ton"], t("unit"))}</Field>
        </div>
        <fieldset className="space-y-3 rounded-2xl border border-border p-4">
          <legend className="px-1 text-sm font-semibold">{t("saleMode")}</legend>
          <p className="text-xs text-muted-foreground">{t("saleModeHint")}</p>
          <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" className="h-4 w-4 accent-[var(--primary)]" checked={f.regOn} onChange={(e) => set({ regOn: e.target.checked })} />{t("mode_regular")}</label>
          {f.regOn && (
            <div className="grid grid-cols-2 gap-3">
              <Field label={t("pricePerKg")} error={errors.priceKg}><input inputMode="decimal" className={inputCls} value={f.priceKg} onChange={(e) => set({ priceKg: e.target.value })} /></Field>
              <Field label={t("minOrderKg")} error={errors.minKg}><input inputMode="decimal" className={inputCls} value={f.minKg} onChange={(e) => set({ minKg: e.target.value })} /></Field>
              {Number(f.priceKg) > 0 && <p className="col-span-2 text-xs text-muted-foreground">= {inr(Number(f.priceKg) * 100)} {t("perUnit", { u: t("unit_qtl") })}</p>}
            </div>
          )}
          <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" className="h-4 w-4 accent-[var(--primary)]" checked={f.bulkOn} onChange={(e) => set({ bulkOn: e.target.checked })} />{t("mode_bulk")}</label>
          {f.bulkOn && (
            <div className="grid grid-cols-2 gap-3">
              <Field label={t("bulkPriceUnit")}>{unitSel(f.bulkUnit, setBulkUnit, ["qtl", "ton"], t("bulkPriceUnit"))}</Field>
              <Field label={`${t("bulkPrice")} / ${t(`unit_${f.bulkUnit}` as Key)}`} error={errors.priceBulk}><input inputMode="decimal" className={inputCls} value={f.bulkPrice} onChange={(e) => set({ bulkPrice: e.target.value })} /></Field>
              <Field label={`${t("minBulk")} (${t(`unit_${f.bulkUnit}` as Key)})`} error={errors.minBulk}><input inputMode="decimal" className={inputCls} value={f.minBulk} onChange={(e) => set({ minBulk: e.target.value })} /></Field>
            </div>
          )}
          {errors.mode && <p role="alert" className="text-sm font-medium text-destructive">{errors.mode}</p>}
        </fieldset>
        {Number(f.stock) > 0 && <p className="text-xs text-muted-foreground">{t("stockLeft", { n: `${fmt(toQtl(Number(f.stock), f.stockUnit), "qtl")} · ${fmt(toQtl(Number(f.stock), f.stockUnit), "kg")}` })}</p>}
        <Field label={t("pickupLocation")} error={errors.location}><input disabled={locked} className={inputCls} value={f.location} onChange={(e) => set({ location: e.target.value })} /></Field>
        <Field label={t("availableFrom")}><input type="date" className={inputCls} value={f.availableFrom} onChange={(e) => set({ availableFrom: e.target.value })} /></Field>
        {!listing && <p className="text-xs text-muted-foreground">{t("photoAuto")}</p>}
        <Button type="submit" variant="harvest" disabled={loading} className="mt-auto">{loading && <Spinner />}{listing ? t("save") : t("publish")}</Button>
      </form>
    </Drawer>
  );
}
