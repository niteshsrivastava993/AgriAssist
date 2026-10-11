import { useState } from "react";
import { LocateFixed } from "lucide-react";
import { useT, type Key } from "@/lib/i18n";
import { validLatLng } from "@/services/calc";
import { Button, Field, Spinner, inputCls } from "@/components/ui-kit";
import { fromQtl } from "@/services/calc";
import type { QtyUnit } from "@/data/mockData";

/** Browser geolocation with an explanation first, plus manual lat/lng fallback. No maps API. */
export function LocationPicker({ lat, lng, why, onSave, onClear, demoPoint }: {
  lat?: number | undefined; lng?: number | undefined; why: Key;
  onSave: (lat: number, lng: number) => Promise<void> | void; onClear?: (() => void) | undefined;
  demoPoint?: { lat: number; lng: number } | undefined;
}) {
  const { t } = useT();
  const [la, setLa] = useState(lat != null ? String(lat) : "");
  const [ln, setLn] = useState(lng != null ? String(lng) : "");
  const [err, setErr] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const save = async (a: number, b: number) => {
    if (!validLatLng(a, b)) { setErr(t("errLatLng")); return; }
    setErr(null);
    const r4 = (n: number) => Math.round(n * 10000) / 10000;
    setLa(String(r4(a))); setLn(String(r4(b)));
    await onSave(r4(a), r4(b));
  };
  const locate = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) { setErr(t("locDenied")); return; }
    setLocating(true); setErr(null);
    navigator.geolocation.getCurrentPosition(
      (p) => { setLocating(false); void save(p.coords.latitude, p.coords.longitude); },
      () => { setLocating(false); setErr(t("locDenied")); },
      { timeout: 10000, maximumAge: 600000 },
    );
  };

  return (
    <div className="space-y-4">
      <p className="rounded-xl bg-secondary p-4 text-sm">{t(why)}</p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="soft" onClick={locate} disabled={locating}>{locating ? <Spinner /> : <LocateFixed className="h-4 w-4" />}{locating ? t("locating") : t("useMyLocation")}</Button>
        {demoPoint && <Button type="button" variant="ghost" onClick={() => void save(demoPoint.lat, demoPoint.lng)}>{t("demoLocNashik")}</Button>}
      </div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("orManual")}</p>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t("latitude")}><input className={inputCls} inputMode="decimal" placeholder="20.0059" value={la} onChange={(e) => setLa(e.target.value)} /></Field>
        <Field label={t("longitude")}><input className={inputCls} inputMode="decimal" placeholder="73.7900" value={ln} onChange={(e) => setLn(e.target.value)} /></Field>
      </div>
      {err && <p role="alert" className="text-sm font-medium text-destructive">{err}</p>}
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => void save(la.trim() === "" ? NaN : Number(la), ln.trim() === "" ? NaN : Number(ln))}>{t("saveLocation")}</Button>
        {onClear && lat != null && <Button type="button" variant="ghost" onClick={() => { setLa(""); setLn(""); onClear(); }}>{t("clearLocation")}</Button>}
      </div>
    </div>
  );
}

/** "12.5 qtl" style label in the viewer's language. */
export function useQty() {
  const { t } = useT();
  return (qtl: number, unit: QtyUnit) => `${Math.round(fromQtl(qtl, unit) * 100) / 100} ${t(`unit_${unit}` as Key)}`;
}
