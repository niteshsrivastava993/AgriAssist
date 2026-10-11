import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Search, MapPin, CalendarDays, X, Navigation } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useT, type Key } from "@/lib/i18n";
import { useDB, marketService, authService } from "@/services/store";
import type { Listing, QtyUnit, SaleMode } from "@/data/mockData";
import { Button, DemoBadge, Drawer, Field, Segmented, Spinner, inputCls, buttonVariants, type FormErrors } from "@/components/ui-kit";
import { LocationPicker, useQty } from "@/components/LocationPicker";
import { SaleInfo } from "@/components/SaleInfo";
import { distanceKm, minQtl, priceIn, saleModesOf, toQtl, unitsFor, validateOrder, type LatLng } from "@/services/calc";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/marketplace")({
  head: () => ({
    meta: [
      { title: "Crop Marketplace — AgriAssist" },
      { name: "description", content: "Browse fresh produce listed directly by Indian farmers and send purchase requests." },
      { property: "og:title", content: "Crop Marketplace — AgriAssist" },
      { property: "og:description", content: "Buy directly from farmers across India." },
    ],
  }),
  component: Marketplace,
});

const inr = (n: number) => "₹" + (Math.round(n * 100) / 100).toLocaleString("en-IN");

function Marketplace() {
  const db = useDB();
  const { user } = useAuth();
  const { t, d } = useT();
  const [q, setQ] = useState("");
  const [state, setState] = useState("All");
  const [sort, setSort] = useState<"price-asc" | "price-desc" | "qty">("price-asc");
  const [open, setOpen] = useState<Listing | null>(null);
  const [mode, setMode] = useState<"all" | "regular" | "bulk" | "both">("all");
  const [radius, setRadius] = useState<"any" | "5" | "10" | "15">("any");
  const [locOpen, setLocOpen] = useState(false);
  const [guestLoc, setGuestLoc] = useState<LatLng | null>(null);
  const qty = useQty();

  // Search origin: the signed-in user's saved location, or a guest's session-only point.
  const me = user ? db.users.find((u) => u.id === user.id) : undefined;
  const origin: LatLng | null = me ? (me.lat != null && me.lng != null ? { lat: me.lat, lng: me.lng } : null) : guestLoc;
  const farmerLoc = (id: string) => db.users.find((u) => u.id === id);
  const distOf = (l: Listing) => (origin && l.farmerId !== user?.id ? distanceKm(origin, farmerLoc(l.farmerId)) : null);

  const active = db.listings.filter((l) => l.status === "active");
  const states = ["All", ...Array.from(new Set(active.map((l) => l.state)))];
  const modeOk = (l: Listing) => { const m = saleModesOf(l); return mode === "all" || (mode === "both" ? m.length === 2 : m.includes(mode)); };
  const base = active.filter((l) => {
    const term = q.trim().toLowerCase();
    return (state === "All" || l.state === state) && modeOk(l) && (!term || `${l.crop} ${l.variety} ${l.location}`.toLowerCase().includes(term));
  });
  const noLocCount = radius !== "any" && origin ? base.filter((l) => distOf(l) === null).length : 0;
  const results = useMemo(() => {
    const r = radius === "any" ? base : origin ? base.filter((l) => { const km = distOf(l); return km !== null && km <= Number(radius); }) : [];
    return [...r].sort((a, b) => (sort === "qty" ? b.quantityQtl - a.quantityQtl : sort === "price-asc" ? a.pricePerQtl - b.pricePerQtl : b.pricePerQtl - a.pricePerQtl));
  }, [base, radius, origin, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveLoc = async (lat: number, lng: number) => {
    if (me) await authService.updateProfile(me.id, { lat, lng, locIsSample: false });
    else setGuestLoc({ lat, lng });
    toast.success(t("locationSaved")); setLocOpen(false);
  };
  const distLabel = (l: Listing) => { const km = distOf(l); return km === null ? null : t("kmAway", { n: km < 10 ? km.toFixed(1) : Math.round(km) }); };

  const [lead, ...rest] = results;
  const myRequests = user?.role === "buyer" ? db.requests.filter((r) => r.buyerId === user.id) : [];

  return (
    <div className="page-enter mx-auto max-w-7xl px-5 py-10">
      <header className="grid gap-8 md:grid-cols-12 md:items-end">
        <div className="md:col-span-7">
          <p className="eyebrow">{t("mpEyebrow", { n: active.length })}</p>
          <h1 className="mt-3 text-5xl font-semibold leading-[1.02] md:text-6xl">{t("mpTitle")}</h1>
        </div>
        <p className="text-muted-foreground md:col-span-5">{t("mpSub")}</p>
      </header>

      <div className="sticky top-16 z-30 -mx-5 mt-10 border-y border-border bg-background/90 px-5 py-4 backdrop-blur">
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input aria-label={t("search")} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("mpSearchPh")} className={cn(inputCls, "rounded-full pl-11")} />
          </label>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label={t("filter")}>
            {states.map((s) => (
              <button key={s} onClick={() => setState(s)} aria-pressed={state === s}
                className={cn("rounded-full px-3.5 py-2 text-xs font-semibold transition", state === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground")}>{s === "All" ? t("all") : s}</button>
            ))}
          </div>
          <select aria-label={t("sort")} value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="rounded-full border border-input bg-card px-4 py-2.5 text-sm font-semibold">
            <option value="price-asc">{t("sortLow")}</option>
            <option value="price-desc">{t("sortHigh")}</option>
            <option value="qty">{t("sortQty")}</option>
          </select>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Segmented label={t("saleMode")} value={mode} onChange={setMode} options={[
            { id: "all", label: t("all") }, { id: "regular", label: t("mode_regular") }, { id: "bulk", label: t("mode_bulk") }, { id: "both", label: t("mode_both") }]} />
          <Segmented label={t("distance")} value={radius} onChange={setRadius} options={[
            { id: "any", label: t("anyDistance") }, ...(["5", "10", "15"] as const).map((n) => ({ id: n, label: t("withinKm", { n }) }))]} />
          {radius !== "any" && <button type="button" onClick={() => setRadius("any")} className="text-xs font-semibold text-primary hover:underline">{t("clearDistance")}</button>}
          <button type="button" onClick={() => setLocOpen(true)} className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-card px-3.5 py-2 text-xs font-semibold shadow-[var(--shadow-clay)]">
            <Navigation className="h-3.5 w-3.5 text-primary" />{origin ? t("changeLocation") : t("setLocation")}
          </button>
        </div>
      </div>

      {radius !== "any" && !origin && (
        <div className="mt-8 rounded-2xl border border-dashed border-primary/40 p-6 text-center">
          <p>{t("needLocation")}</p>
          <div className="mt-4 flex justify-center gap-2"><Button onClick={() => setLocOpen(true)}>{t("setLocation")}</Button><Button variant="ghost" onClick={() => setRadius("any")}>{t("clearDistance")}</Button></div>
        </div>
      )}
      {noLocCount > 0 && <p className="mt-6 text-sm text-muted-foreground">{t("noFarmerLoc", { n: noLocCount })}</p>}

      {radius !== "any" && !origin ? null : results.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-display text-2xl">{radius !== "any" ? t("noneNearby", { n: radius }) : t("noMatches")}</p>
          <Button variant="soft" className="mt-5" onClick={() => { setQ(""); setState("All"); setMode("all"); setRadius("any"); }}>{t("clearFilters")}</Button>
        </div>
      ) : (
        <>
          {lead && (
            <article className="mt-10 grid overflow-hidden rounded-[2rem] bg-card shadow-[var(--shadow-clay)] md:grid-cols-2">
              <img src={lead.image} alt={lead.crop} className="aspect-[4/3] h-full w-full object-cover" />
              <div className="flex flex-col justify-between p-8 md:p-10">
                <div>
                  <div className="flex items-center gap-2"><span className="eyebrow">{t("topPick")}</span>{lead.isSample && <DemoBadge />}</div>
                  <h2 className="mt-3 text-4xl font-semibold">{lead.crop}</h2>
                  <p className="text-lg text-muted-foreground">{lead.variety} · {t("grade")} {lead.grade}</p>
                  <dl className="mt-8 grid grid-cols-2 gap-6 text-sm">
                    <div><dt className="text-muted-foreground">{t("price")}</dt><dd className="font-display text-3xl font-semibold"><HeadlinePrice l={lead} /></dd></div>
                    <div><dt className="text-muted-foreground">{t("available")}</dt><dd className="font-display text-3xl font-semibold">{qty(lead.quantityQtl, lead.bulk ? "qtl" : "kg")}</dd></div>
                  </dl>
                  <SaleInfo listing={lead} className="mt-5" />
                  <p className="mt-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{lead.location}, {lead.state} · {t("by")} {lead.farmerName}{distLabel(lead) && <b className="text-primary">· {distLabel(lead)}</b>}</p>
                </div>
                <ListingAction listing={lead} onRequest={setOpen} className="mt-8 self-start" />
              </div>
            </article>
          )}

          <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((l) => (
              <article key={l.id} className="group">
                <div className="relative overflow-hidden rounded-3xl">
                  <img src={l.image} alt={l.crop} loading="lazy" className="aspect-square w-full object-cover transition duration-700 group-hover:scale-105" />
                  <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs font-bold">{t("grade")} {l.grade}</span>
                </div>
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold">{l.crop} <span className="font-sans text-sm font-medium text-muted-foreground">{l.variety}</span></h3>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{l.location}, {l.state}{distLabel(l) && <b className="text-primary">· {distLabel(l)}</b>}</p>
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" />{t("from")} {d(l.availableFrom)} · {qty(l.quantityQtl, l.bulk ? "qtl" : "kg")}</p>
                  </div>
                  <p className="whitespace-nowrap font-display text-xl font-semibold"><HeadlinePrice l={l} /></p>
                </div>
                <SaleInfo listing={l} className="mt-3" />
                <ListingAction listing={l} onRequest={setOpen} className="mt-4 w-full" />
              </article>
            ))}
          </div>
        </>
      )}

      {myRequests.length > 0 && (
        <section className="mt-20">
          <h2 className="text-3xl font-semibold">{t("yourRequests")}</h2>
          <ul className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card">
            {myRequests.map((r) => {
              const l = db.listings.find((x) => x.id === r.listingId);
              return (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
                  <span><span className="font-semibold">{l?.crop}</span> · {t(`mode_${r.mode}` as Key)} · {r.quantity} {t(`unit_${r.unit}` as Key)} × {inr(r.unitPrice)} = {inr(r.quantity * r.unitPrice)} — {l?.farmerName}</span>
                  <span className={cn("rounded-full px-3 py-1 text-xs font-bold uppercase", r.status === "accepted" ? "bg-secondary text-primary" : r.status === "rejected" || r.status === "cancelled" ? "bg-destructive/10 text-destructive" : "bg-harvest/20 text-harvest-foreground")}>{t(`st_${r.status}` as Key)}</span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <p className="mt-16 text-center text-xs text-muted-foreground">{t("mpDisclaimer")}</p>
      {open && <RequestDrawer listing={open} onClose={() => setOpen(null)} />}
      {locOpen && (
        <Drawer title={t("searchLocation")} eyebrow={t("distance")} onClose={() => setLocOpen(false)}>
          <LocationPicker lat={origin?.lat} lng={origin?.lng} why="locWhy" onSave={saveLoc} demoPoint={{ lat: 20.16, lng: 74.2 }}
            onClear={me ? async () => { await authService.updateProfile(me.id, { lat: undefined, lng: undefined }); setRadius("any"); setLocOpen(false); } : () => { setGuestLoc(null); setRadius("any"); setLocOpen(false); }} />
        </Drawer>
      )}
    </div>
  );
}

function ListingAction({ listing, onRequest, className }: { listing: Listing; onRequest: (l: Listing) => void; className?: string | undefined }) {
  const { user } = useAuth();
  const { t } = useT();
  if (!user) return <Link to="/login" className={cn(buttonVariants({ variant: "soft" }), className)}>{t("loginToRequest")}</Link>;
  if (user.role !== "buyer") {
    return listing.farmerId === user.id
      ? <span className={cn("inline-flex h-11 items-center justify-center rounded-full border border-dashed border-primary/40 px-5 text-sm font-semibold text-primary", className)}>{t("yourListing")}</span>
      : <span className={cn("inline-flex h-11 items-center justify-center text-sm text-muted-foreground", className)}>{t("buyersOnly")}</span>;
  }
  return <Button variant="harvest" className={className} onClick={() => onRequest(listing)}>{t("requestPurchase")}</Button>;
}

function HeadlinePrice({ l }: { l: Listing }) {
  const { t } = useT();
  return l.bulk
    ? <>{inr(l.bulk.pricePerQtl)}<span className="block text-right font-sans text-xs font-medium text-muted-foreground">{t("perUnit", { u: t("unit_qtl") })}</span></>
    : <>{inr(l.regular?.pricePerKg ?? l.pricePerQtl / 100)}<span className="block text-right font-sans text-xs font-medium text-muted-foreground">{t("perUnit", { u: t("unit_kg") })}</span></>;
}

function RequestDrawer({ listing, onClose }: { listing: Listing; onClose: () => void }) {
  const { user } = useAuth();
  const { t } = useT();
  const fmt = useQty();
  const modes = saleModesOf(listing);
  const [mode, setMode] = useState<SaleMode>(modes[0] ?? "bulk");
  const [unit, setUnit] = useState<QtyUnit>(unitsFor(modes[0] ?? "bulk")[0]!);
  const [qty, setQty] = useState("");
  const [offer, setOffer] = useState(String(priceIn(listing, modes[0] ?? "bulk", unitsFor(modes[0] ?? "bulk")[0]!) ?? ""));
  const [msg, setMsg] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const pick = (m: SaleMode, u: QtyUnit) => { setMode(m); setUnit(u); setOffer(String(priceIn(listing, m, u) ?? "")); setErrors({}); };
  const errText = (k: string) => k === "errBelowMin" ? t("errBelowMin", { n: fmt(minQtl(listing, mode), unit) }) : k === "errOverStock" ? t("errOverStock", { n: fmt(listing.quantityQtl, unit) }) : t(k as Key);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const er: FormErrors = {};
    const q = Number(qty), o = Number(offer);
    const v = validateOrder(listing, mode, unit, q);
    if (v) er.qty = errText(v);
    if (!o || o <= 0) er.offer = t("errOffer");
    setErrors(er);
    if (Object.keys(er).length || !user) return;
    setLoading(true);
    try {
      await marketService.createRequest({ listingId: listing.id, buyerId: user.id, buyerName: user.name, buyerBusiness: user.location, mode, unit, quantity: q, unitPrice: o, message: msg.trim() });
      toast.success(t("requestSent", { name: listing.farmerName }));
      onClose();
    } catch (err) {
      const k = err instanceof Error ? err.message : "";
      toast.error(k === "unavailable" ? t("errUnavailable") : k.startsWith("err") ? errText(k) : t("errGeneric"));
    } finally { setLoading(false); }
  };
  const u = t(`unit_${unit}` as Key);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-charcoal/40" onClick={onClose} role="dialog" aria-modal="true" aria-label={t("requestPurchase")}>
      <form onSubmit={submit} noValidate onClick={(e) => e.stopPropagation()} className="page-enter flex h-full w-full max-w-md flex-col gap-5 overflow-y-auto bg-background p-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="eyebrow">{t("requestPurchase")}</p>
            <h2 className="mt-1 text-3xl font-semibold">{listing.crop}</h2>
            <p className="text-sm text-muted-foreground">{listing.variety} · {listing.farmerName}, {listing.location}</p>
          </div>
          <button type="button" onClick={onClose} aria-label={t("close")} className="rounded-full p-2 hover:bg-muted"><X className="h-5 w-5" /></button>
        </div>
        <img src={listing.image} alt="" className="aspect-[16/9] w-full rounded-2xl object-cover" />
        <div className="space-y-2">
          <p className="text-sm font-semibold">{t("buyAs")}</p>
          {modes.length > 1 && <Segmented label={t("saleMode")} value={mode} onChange={(m) => pick(m, unitsFor(m)[0]!)} options={modes.map((m) => ({ id: m, label: t(`mode_${m}` as Key) }))} />}
          {modes.length === 1 && <p className="text-sm">{t(`mode_${mode}` as Key)}</p>}
          <p className="text-xs text-muted-foreground">{t("stockLeft", { n: fmt(listing.quantityQtl, unit) })} · {t("minOrder")} {fmt(minQtl(listing, mode), unit)}</p>
        </div>
        <Field label={t("unit")}>
          <select className={inputCls} value={unit} onChange={(e) => pick(mode, e.target.value as QtyUnit)}>
            {unitsFor(mode).map((x) => <option key={x} value={x}>{t(`unit_${x}` as Key)}</option>)}
          </select>
        </Field>
        <Field label={t("qtyIn", { u })} error={errors.qty}><input className={inputCls} inputMode="decimal" value={qty} onChange={(e) => setQty(e.target.value)} /></Field>
        <Field label={t("pricePerUnitLbl", { u })} error={errors.offer}><input className={inputCls} inputMode="decimal" value={offer} onChange={(e) => setOffer(e.target.value)} /></Field>
        <Field label={t("msgFarmer")}><textarea className={inputCls} rows={3} value={msg} onChange={(e) => setMsg(e.target.value)} /></Field>
        {Number(qty) > 0 && Number(offer) > 0 && (
          <p className="rounded-xl bg-secondary p-4 text-sm">{t("estValue")}: <span className="font-display text-xl font-semibold">{inr(Number(qty) * Number(offer))}</span>
            <span className="block text-xs text-muted-foreground">= {Math.round(toQtl(Number(qty), unit) * 100) / 100} {t("unit_qtl")}</span></p>
        )}
        <Button type="submit" variant="harvest" disabled={loading} className="mt-auto">{loading && <Spinner />} {t("sendRequest")}</Button>
      </form>
    </div>
  );
}
